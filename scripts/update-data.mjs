#!/usr/bin/env node
// Relevé des données officielles du site « multe e autovelox » (Italie).
//
// 1. Registre MIT des appareils de contrôle de vitesse (velox.mit.gov.it/dispositivi), prévu par le
//    decreto direttoriale n. 367 du 29 septembre 2025. Contenu du site mit.gov.it sous CC BY 3.0 IT
//    (« Note legali » du MIT) : réutilisation libre avec citation de la source et de l'URL.
//    Le serveur est lu directement (point JSON de la table DataTables, length=-1) ; s'il ne répond pas
//    (il refuse les connexions depuis certaines adresses hors d'Italie), on prend la dernière capture
//    complète de ce même point JSON dans la Wayback Machine, et la date de la donnée affichée est celle
//    de la capture. Jamais un autre site comme source.
// 2. ISTAT, « Elenco dei comuni italiani » (CC BY 4.0) : code cadastral → commune, province, région.
// 3. Normattiva : relit les articles du Codice della Strada utilisés par le moteur et vérifie que chaque
//    extrait « verify » de src/data/params-2026.json figure toujours mot pour mot dans le texte en
//    vigueur. Le barème ne se réécrit jamais tout seul : un écart fait échouer le script (code 2).
//
// Usage : node scripts/update-data.mjs [--offline] [--skip-law] [--skip-velox]
//   --offline : n'utilise que data/raw/ (caches déjà téléchargés)
// Sorties : src/data/velox/*.json, data/raw/*, data/law-check.json
// Si une étape échoue (réseau, fichier tronqué, moins de 3 000 appareils), rien n'est écrit pour
// cette étape : le site garde le fichier précédent.

import { mkdir, readFile, writeFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const RAW = path.join(ROOT, 'data', 'raw');
const OUT = path.join(ROOT, 'src', 'data', 'velox');
const PARAMS = path.join(ROOT, 'src', 'data', 'params-2026.json');
const args = new Set(process.argv.slice(2));
const OFFLINE = args.has('--offline');
const UA = 'Mozilla/5.0 (compatible; data-refresh; Radif Partners)';
const MIN_DEVICES = 3000;

const VELOX_COLUMNS = [
  'codice_accertatore', 'denominazione_accertatore', 'codice_catastale_accertatore', 'n_decreto',
  'data_decreto', 'tipo_dispositivo', 'marca_dispositivo', 'modello_dispositivo', 'versione_dispositivo',
  'matricola_dispositivo', 'note', 'created_at',
];

function veloxQuery(length = -1) {
  const q = new URLSearchParams({ draw: '1' });
  VELOX_COLUMNS.forEach((c, i) => {
    q.set(`columns[${i}][data]`, c);
    q.set(`columns[${i}][name]`, '');
    q.set(`columns[${i}][searchable]`, 'true');
    q.set(`columns[${i}][orderable]`, 'true');
    q.set(`columns[${i}][search][value]`, '');
    q.set(`columns[${i}][search][regex]`, 'false');
  });
  q.set('order[0][column]', '0');
  q.set('order[0][dir]', 'asc');
  q.set('order[0][name]', '');
  q.set('start', '0');
  q.set('length', String(length));
  q.set('search[value]', '');
  q.set('search[regex]', 'false');
  return `https://velox.mit.gov.it/dispositivi/data?${q.toString()}`;
}

async function get(url, { timeout = 60000, headers = {} } = {}) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), timeout);
  try {
    const r = await fetch(url, { signal: ctl.signal, headers: { 'User-Agent': UA, ...headers }, redirect: 'follow' });
    if (!r.ok) throw new Error(`HTTP ${r.status} ${url}`);
    return r;
  } finally {
    clearTimeout(t);
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------- 1. Registre MIT ----------

async function veloxLive() {
  const r = await get(veloxQuery(-1), { timeout: 90000, headers: { 'X-Requested-With': 'XMLHttpRequest' } });
  const j = await r.json();
  return { json: j, origin: 'live', captured_at: new Date().toISOString() };
}

async function veloxWayback() {
  const cdx = 'https://web.archive.org/cdx/search/cdx?url=velox.mit.gov.it/dispositivi/data&matchType=prefix'
    + '&filter=statuscode:200&output=json&fl=timestamp,original,length&limit=-200';
  const rows = await (await get(cdx, { timeout: 90000 })).json();
  const full = rows.slice(1).filter(([, u]) => /length=-1(&|$)/.test(u));
  if (!full.length) throw new Error('aucune capture complète (length=-1) dans la Wayback Machine');
  full.sort((a, b) => b[0].localeCompare(a[0]));
  for (const [ts, original] of full) {
    try {
      const r = await get(`https://web.archive.org/web/${ts}id_/${original}`, { timeout: 180000 });
      const j = await r.json();
      const iso = `${ts.slice(0, 4)}-${ts.slice(4, 6)}-${ts.slice(6, 8)}T${ts.slice(8, 10)}:${ts.slice(10, 12)}:${ts.slice(12, 14)}Z`;
      return { json: j, origin: 'wayback', captured_at: iso, wayback_url: `https://web.archive.org/web/${ts}/${original}` };
    } catch (e) {
      console.warn(`  capture ${ts} illisible : ${e.message}`);
      await sleep(3000);
    }
  }
  throw new Error('aucune capture complète lisible');
}

async function loadVelox() {
  if (OFFLINE) {
    const files = (await readdir(RAW)).filter((f) => /^velox-.*\.json$/.test(f)).sort();
    if (!files.length) throw new Error('aucun cache velox dans data/raw');
    const f = files[files.length - 1];
    const raw = JSON.parse(await readFile(path.join(RAW, f), 'utf8'));
    return raw.origin ? raw : { json: raw, origin: 'cache', captured_at: null, file: f };
  }
  try {
    const v = await veloxLive();
    console.log('  registre lu en direct sur velox.mit.gov.it');
    return v;
  } catch (e) {
    console.warn(`  velox.mit.gov.it injoignable (${e.message}) : repli sur la Wayback Machine`);
    return veloxWayback();
  }
}

// ---------- 2. ISTAT ----------

const ISTAT_URL = 'https://www.istat.it/storage/codici-unita-amministrative/Elenco-comuni-italiani.csv';

function parseCsv(text, sep = ';') {
  const rows = [];
  let row = [], cell = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') q = false;
      else cell += c;
    } else if (c === '"') q = true;
    else if (c === sep) { row.push(cell); cell = ''; }
    else if (c === '\n') { row.push(cell.replace(/\r$/, '')); rows.push(row); row = []; cell = ''; }
    else cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

async function loadIstat() {
  const cache = path.join(RAW, 'istat-elenco-comuni.csv');
  let buf;
  if (OFFLINE && existsSync(cache)) buf = await readFile(cache);
  else {
    buf = Buffer.from(await (await get(ISTAT_URL)).arrayBuffer());
    await writeFile(cache, buf);
  }
  let text;
  try { text = new TextDecoder('utf-8', { fatal: true }).decode(buf); }
  catch { text = new TextDecoder('windows-1252').decode(buf); }
  const rows = parseCsv(text);
  const h = rows[0].map((s) => s.replace(/\s+/g, ' ').trim());
  const col = (re) => { const i = h.findIndex((x) => re.test(x)); if (i < 0) throw new Error(`colonne ISTAT absente : ${re}`); return i; };
  const iCat = col(/^Codice Catastale/i), iNome = col(/^Denominazione in italiano/i), iReg = col(/^Denominazione Regione/i);
  const iUts = col(/^Denominazione dell'Unità territoriale sovracomunale/i), iSigla = col(/^Sigla automobilistica/i);
  const iIstat = col(/^Codice Comune formato alfanumerico/i), iCap = col(/^Flag Comune capoluogo/i);
  const map = new Map();
  for (const r of rows.slice(1)) {
    if (!r[iCat]) continue;
    map.set(r[iCat].trim(), {
      istat: r[iIstat], nome: r[iNome], provincia: r[iUts], sigla: r[iSigla], regione: r[iReg], capoluogo: r[iCap] === '1',
    });
  }
  if (map.size < 7800) throw new Error(`ISTAT : ${map.size} communes seulement`);
  return map;
}

// ---------- normalisation ----------

const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', euro: '€', deg: '°',
  agrave: 'à', egrave: 'è', eacute: 'é', igrave: 'ì', ograve: 'ò', ugrave: 'ù', Agrave: 'À', Egrave: 'È', Eacute: 'É',
  Igrave: 'Ì', Ograve: 'Ò', Ugrave: 'Ù', laquo: '«', raquo: '»', rsquo: '’', lsquo: '‘', ldquo: '“', rdquo: '”', ndash: '–', mdash: '—' };
export function decodeEntities(s = '') {
  return String(s)
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-z]+);/gi, (m, n) => ENT[n] ?? m);
}
const clean = (s) => decodeEntities(s).replace(/\s+/g, ' ').trim();

// Type d'appareil déclaré (texte libre saisi par chaque organe) → catégorie du site.
export function deviceCategory(tipo, modello = '', note = '') {
  const t = `${tipo} ${modello}`.toLowerCase();
  if (/media|tutor|sicve|vergilius|celeritas|tratta/.test(t)) return 'velocita_media';
  const fisso = /fiss|postazione fissa|box/.test(t);
  const mobile = /mobil|telelaser|laser|portatil|trucam|scout|nolegg/.test(t);
  if (fisso && mobile) return 'fisso_mobile';
  if (fisso) return 'fisso';
  if (mobile) return 'mobile';
  return 'non_precisato';
}

// Mentions de l'organe qui signalent un appareil hors service (texte publié, repris tel quel).
export function statusFromNote(note) {
  const n = note.toLowerCase();
  if (/sequestr/.test(n)) return 'sequestro';
  if (/non attiv|non in uso|non utilizz|sospes|dismess|disattiv|ultimo utilizzo|fuori servizio|nessun velox/.test(n)) return 'segnalato_non_attivo';
  return 'attivo_dichiarato';
}


// Le champ « codice catastale » est saisi à la main par chaque organe : code seul, codes multiples
// (unions de communes), point-virgule final, champs inversés… On retient, dans l'ordre :
// 1) les codes cadastraux valides trouvés dans le champ ; 2) à défaut, ceux trouvés dans le code
//    ou le nom de l'organe ; 3) à défaut, le nom d'une commune écrit dans le nom de l'organe
//    (« Comune di Bra », « Polizia Locale Pontremoli »), seulement s'il est unique en Italie.
const CAT_RE = /\b[A-Z]\d{3}\b/g;
const fold = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/[^A-Z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
function nameIndex(istat) {
  const m = new Map();
  for (const [cat, c] of istat) { const k = fold(c.nome); m.set(k, m.has(k) ? null : cat); }
  return m;
}
export function resolveComuni(raw, organo, codiceOrgano, istat, byName) {
  const pick = (s) => [...new Set((s.toUpperCase().match(CAT_RE) || []).filter((c) => istat.has(c)))];
  let cats = pick(raw);
  if (cats.length) return { cats, metodo: cats.length > 1 ? 'codici_multipli' : 'codice' };
  cats = pick(`${organo} ${codiceOrgano}`);
  if (cats.length === 1) return { cats, metodo: 'codice_in_altro_campo' };
  const text = fold(`${organo} ${raw} ${codiceOrgano}`);
  if (/^POLIZIA STRADALE$/.test(text.split(' Z2')[0])) return { cats: [], metodo: 'stato' };
  // Un nom de province, d'union ou de ville métropolitaine ne désigne pas la commune homonyme.
  if (/PROVINCI|UNIONE|METROPOLITANA|FEDERAZIONE|CONSORZIO|COMUNITA|ASSOCIAT|COMUNI DI|COMUNI DEL/.test(text)) return { cats: [], metodo: 'non_abbinato' };
  const words = text.split(' ');
  for (let n = 5; n >= 1; n--) {
    for (let i = 0; i + n <= words.length; i++) {
      const k = words.slice(i, i + n).join(' ');
      if (n === 1 && k.length < 4) continue;
      if (/^(POLIZIA|LOCALE|MUNICIPALE|COMUNE|COMANDO|PROVINCIA|PROVINCIALE|UNIONE|COMUNI|SERVIZIO|CORPO|DI|DEL|DEI|DELLA)$/.test(k)) continue;
      const cat = byName.get(k);
      if (cat) return { cats: [cat], metodo: 'nome' };
    }
  }
  return { cats: [], metodo: 'non_abbinato' };
}

function buildVelox(src, istat) {
  const data = src.json?.data;
  if (!Array.isArray(data) || data.length < MIN_DEVICES) throw new Error(`registre tronqué (${data?.length ?? 0} lignes)`);
  if (src.json.recordsTotal && data.length !== src.json.recordsTotal) throw new Error(`registre incomplet : ${data.length}/${src.json.recordsTotal}`);
  const byCat = new Map();
  const nonComunali = [];
  const matched = {};
  const perProvincia = {};
  const byName = nameIndex(istat);
  let lastInsert = '';
  for (const x of data) {
    const note = clean(x.note);
    const d = {
      id: x.id,
      organo: clean(x.denominazione_accertatore),
      codice_organo: clean(x.codice_accertatore),
      tipo_dichiarato: clean(x.tipo_dispositivo),
      categoria: deviceCategory(clean(x.tipo_dispositivo), clean(x.modello_dispositivo), note),
      marca: clean(x.marca_dispositivo),
      modello: clean(x.modello_dispositivo),
      versione: clean(x.versione_dispositivo),
      matricola: clean(x.matricola_dispositivo),
      decreto: clean(x.n_decreto),
      data_decreto: clean(x.data_decreto),
      note,
      stato: statusFromNote(note),
      comunicato_il: x.created_at,
    };
    if (x.created_at > lastInsert) lastInsert = x.created_at;
    const raw = clean(x.codice_catastale_accertatore);
    // Organes provinciaux (code « PV… » du registre) : rattachés à la province, jamais à la commune
    // chef-lieu dont ils donnent souvent le code cadastral.
    if (/^PV/i.test(d.codice_organo) || /PROVINCI|METROPOLITANA/i.test(d.organo)) {
      const c = istat.get((raw.toUpperCase().match(CAT_RE) || []).find((k) => istat.has(k)));
      if (c) { (perProvincia[c.sigla] ??= []).push(d); matched.provincia = (matched.provincia || 0) + 1; }
      else nonComunali.push({ ...d, codice: raw });
      continue;
    }
    const { cats, metodo } = resolveComuni(raw, d.organo, d.codice_organo, istat, byName);
    if (!cats.length) { nonComunali.push({ ...d, codice: raw }); continue; }
    for (const cat of cats) {
      const c = istat.get(cat);
      if (!byCat.has(cat)) byCat.set(cat, { catastale: cat, ...c, enti: {}, dispositivi: [] });
      const e = byCat.get(cat);
      e.dispositivi.push({ ...d, abbinamento: metodo, condiviso_con: cats.length > 1 ? cats.length - 1 : 0 });
      e.enti[d.codice_organo] = d.organo;
    }
    matched[metodo] = (matched[metodo] || 0) + 1;
  }
  const comuni = [...byCat.values()].sort((a, b) => a.nome.localeCompare(b.nome, 'it'));
  const count = (list) => list.reduce((acc, d) => { acc[d.categoria] = (acc[d.categoria] || 0) + 1; acc.totale++; if (d.stato !== 'attivo_dichiarato') acc.segnalati_non_attivi++; return acc; },
    { totale: 0, segnalati_non_attivi: 0 });
  const regioni = {}, province = {};
  for (const c of comuni) {
    (regioni[c.regione] ??= { regione: c.regione, comuni: 0, dispositivi: [] });
    regioni[c.regione].comuni++; regioni[c.regione].dispositivi.push(...c.dispositivi);
    (province[c.sigla] ??= { sigla: c.sigla, provincia: c.provincia, regione: c.regione, comuni: 0, dispositivi: [] });
    province[c.sigla].comuni++; province[c.sigla].dispositivi.push(...c.dispositivi);
  }
  for (const [sigla, list] of Object.entries(perProvincia)) {
    const any = [...istat.values()].find((c) => c.sigla === sigla);
    (province[sigla] ??= { sigla, provincia: any.provincia, regione: any.regione, comuni: 0, dispositivi: [] });
    province[sigla].dispositivi.push(...list);
    province[sigla].organi_provinciali = list.length;
    (regioni[any.regione] ??= { regione: any.regione, comuni: 0, dispositivi: [] });
    regioni[any.regione].dispositivi.push(...list);
  }
  // Un appareil déclaré pour plusieurs communes (codes cadastraux multiples) compte dans chacune,
  // mais une seule fois dans sa province et sa région : sinon la somme des régions dépasse le total.
  const uniq = (l) => [...new Map(l.map((d) => [d.id, d])).values()];
  const agg = (o) => Object.values(o).map(({ dispositivi, ...r }) => ({ ...r, ...count(uniq(dispositivi)) }));
  const meta = {
    fonte: 'Ministero delle infrastrutture e dei trasporti, Lista dispositivi di rilevamento della velocità',
    fonte_url: 'https://velox.mit.gov.it/dispositivi',
    licenza: 'CC BY 3.0 IT (Note legali mit.gov.it)',
    licenza_url: 'https://creativecommons.org/licenses/by/3.0/it/legalcode',
    base_giuridica: 'Decreto direttoriale MIT n. 367 del 29 settembre 2025, art. 1 c. 3-4 ; decreto direttoriale n. 305 del 18 agosto 2025, art. 5 c. 2',
    origine: src.origin,
    catturato_il: src.captured_at,
    wayback_url: src.wayback_url ?? null,
    ultima_comunicazione: lastInsert,
    dispositivi_totali: data.length,
    dispositivi_abbinati: data.length - nonComunali.length,
    dispositivi_altri_organi: nonComunali.length,
    comuni_con_dispositivi: comuni.length,
    abbinamento_comune: matched,
    per_categoria: count(data.map((x) => ({ categoria: deviceCategory(clean(x.tipo_dispositivo), clean(x.modello_dispositivo), clean(x.note)), stato: statusFromNote(clean(x.note)) }))),
    generato_il: new Date().toISOString().slice(0, 10),
    avvertenza: "Il registro elenca gli apparecchi dichiarati da ciascun organo di polizia (marca, modello, decreto di approvazione, matricola). La posizione esatta compare solo quando l'organo l'ha scritta nelle note.",
  };
  return { meta, comuni, regioni: agg(regioni), province: agg(province), provinciali: perProvincia, altri: nonComunali };
}

// ---------- 3. Normattiva ----------

const CDS = 'urn:nir:stato:decreto.legislativo:1992-04-30;285';
const LAW_URNS = {
  '142': `${CDS}~art142`, '126bis': `${CDS}~art126bis`, '195': `${CDS}~art195`, '201': `${CDS}~art201`,
  '202': `${CDS}~art202`, '203': `${CDS}~art203`, '204bis': `${CDS}~art204bis`, '173': `${CDS}~art173`,
  '172': `${CDS}~art172`, '146': `${CDS}~art146`, '7': `${CDS}~art7`, '158': `${CDS}~art158`,
  '186': `${CDS}~art186`, '176': `${CDS}~art176`, '117': `${CDS}~art117`,
  reg345: 'urn:nir:presidente.repubblica:decreto:1992-12-16;495~art345',
  dlgs150art7: 'urn:nir:stato:decreto.legislativo:2011-09-01;150~art7',
};
// Tableau des points (allegato de l'art. 126-bis) : chargé par l'appel interne de la page Normattiva.
const TABELLA_URL = 'https://www.normattiva.it/atto/caricaArticolo?art.versione=12&art.idGruppo=17&art.flagTipoArticolo=1'
  + '&art.codiceRedazionale=092G0306&art.idArticolo=1&art.idSottoArticolo=1&art.idSottoArticolo1=10'
  + '&art.dataPubblicazioneGazzetta=1992-05-18&art.progressivo=0';

function lawText(html) {
  const vig = html.match(/artInizio"[^>]*>\s*(?:&nbsp;)?\s*([0-9-]+)/);
  const i = html.indexOf('<div class="bodyTesto">');
  const body = i >= 0 ? html.slice(i, i + 250000) : html;
  const text = decodeEntities(body.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
  return { vigore: vig ? vig[1] : null, text };
}

// Normattiva sert le tableau de points par un appel interne qui exige la session ouverte par la page de
// l'acte : on suit les redirections à la main pour garder les cookies.
const jar = new Map();
async function getWithCookies(url, timeout = 90000) {
  let u = url;
  for (let hop = 0; hop < 8; hop++) {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), timeout);
    const cookie = [...jar].map(([k, v]) => `${k}=${v}`).join('; ');
    const r = await fetch(u, { redirect: 'manual', signal: ctl.signal, headers: { 'User-Agent': UA, ...(cookie ? { Cookie: cookie } : {}) } });
    clearTimeout(t);
    for (const c of r.headers.getSetCookie?.() ?? []) { const [kv] = c.split(';'); const i = kv.indexOf('='); jar.set(kv.slice(0, i).trim(), kv.slice(i + 1)); }
    if (r.status >= 300 && r.status < 400 && r.headers.get('location')) { u = new URL(r.headers.get('location'), u).href; continue; }
    if (!r.ok) throw new Error(`HTTP ${r.status} ${u}`);
    return r.text();
  }
  throw new Error(`trop de redirections ${url}`);
}

async function loadLaw() {
  const out = {};
  for (const [k, urn] of Object.entries(LAW_URNS)) {
    const cache = path.join(RAW, 'normattiva', `${k}.html`);
    let html;
    if (OFFLINE && existsSync(cache)) html = await readFile(cache, 'utf8');
    else {
      html = await getWithCookies(`https://www.normattiva.it/uri-res/N2Ls?${urn}`);
      await writeFile(cache, html);
      await sleep(1500);
    }
    out[k] = { urn, ...lawText(html) };
  }
  const cache = path.join(RAW, 'normattiva', 'tabella.html');
  let html;
  if (OFFLINE && existsSync(cache)) html = await readFile(cache, 'utf8');
  else {
    await getWithCookies(`https://www.normattiva.it/uri-res/N2Ls?${CDS}`);
    html = await getWithCookies(TABELLA_URL);
    await writeFile(cache, html);
  }
  const vig = html.match(/artInizio"[^>]*>\s*(?:&nbsp;)?\s*([0-9-]+)/);
  const text = decodeEntities(html.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<[^>]+>/g, ' | ')).replace(/(\s*\|\s*)+/g, ' | ').replace(/\s+/g, ' ');
  out.tabella = { urn: `${CDS}~art126bis (Tabella)`, vigore: vig ? vig[1] : null, text };
  return out;
}

function collectChecks(params) {
  const checks = [];
  const walk = (node, where, inherited) => {
    if (Array.isArray(node)) return node.forEach((n, i) => walk(n, `${where}[${i}]`, inherited));
    if (!node || typeof node !== 'object') return;
    const art = node.article ?? inherited;
    if (typeof node.verify === 'string') checks.push({ where, article: art, verify: node.verify });
    for (const [k, v] of Object.entries(node)) if (k !== 'verify') walk(v, `${where}.${k}`, art);
  };
  walk(params, 'params', null);
  // Points des quatre tranches de vitesse, lus dans le tableau de l'art. 126-bis.
  checks.push({ where: 'params.speeding.bands[*].points', article: 'tabella', verify: 'Art. 142 | Comma 8 | 3 | Comma 9 | 6 | Comma 9-bis | 10' });
  checks.push({ where: 'params.other_violations.cellulare.points', article: 'tabella', verify: 'Comma 3-bis, primo periodo | -5 | Comma 3-bis, secondo periodo | -10' });
  checks.push({ where: 'params.other_violations.cintura.points', article: 'tabella', verify: 'Art. 172 | Commi 10 e 11 | 5' });
  checks.push({ where: 'params.other_violations.semaforo/segnaletica.points', article: 'tabella', verify: 'Art. 146 | Comma 2, ad eccezione dei segnali stradali di divieto di sosta e fermata | 2 | Comma 3 | 6' });
  checks.push({ where: 'params.other_violations.alcol.points', article: 'tabella', verify: 'Art. 186 | Commi 2 e 7 | 10' });
  return checks;
}

const norm = (s) => s.replace(/[’']/g, "'").replace(/\s+/g, ' ').trim();

async function checkLaw(params, law) {
  const res = collectChecks(params).map((c) => {
    const a = law[c.article];
    if (!a) return { ...c, ok: false, reason: `article ${c.article} non relu` };
    return { ...c, vigore: a.vigore, ok: norm(a.text).includes(norm(c.verify)) };
  });
  const vigore = Object.fromEntries(Object.entries(law).map(([k, v]) => [k, v.vigore]));
  return { checked_at: new Date().toISOString().slice(0, 10), vigore, total: res.length, failed: res.filter((r) => !r.ok), results: res };
}

// ---------- main ----------

async function main() {
  await mkdir(path.join(RAW, 'normattiva'), { recursive: true });
  await mkdir(OUT, { recursive: true });
  let exit = 0;

  if (!args.has('--skip-velox')) {
    console.log('1. Registre MIT des autovelox');
    try {
      const src = await loadVelox();
      const istat = await loadIstat();
      const v = buildVelox(src, istat);
      if (src.origin !== 'cache') {
        const stamp = (src.captured_at || new Date().toISOString()).slice(0, 10);
        await writeFile(path.join(RAW, `velox-${stamp}.json`), JSON.stringify(src));
      }
      await writeFile(path.join(OUT, 'meta.json'), JSON.stringify(v.meta, null, 2));
      await writeFile(path.join(OUT, 'comuni.json'), JSON.stringify(v.comuni));
      await writeFile(path.join(OUT, 'regioni.json'), JSON.stringify(v.regioni, null, 2));
      await writeFile(path.join(OUT, 'province.json'), JSON.stringify(v.province, null, 2));
      await writeFile(path.join(OUT, 'altri-organi.json'), JSON.stringify(v.altri));
      await writeFile(path.join(OUT, 'organi-provinciali.json'), JSON.stringify(v.provinciali));
      console.log(`  ${v.meta.dispositivi_totali} appareils, ${v.meta.comuni_con_dispositivi} communes, ${v.meta.dispositivi_altri_organi} hors communes (Polizia Stradale…), origine ${v.meta.origine} ${v.meta.catturato_il ?? ''}`);
    } catch (e) {
      console.error(`  ÉCHEC registre : ${e.message} — fichiers précédents conservés`);
      exit = 1;
    }
  }

  if (!args.has('--skip-law')) {
    console.log('2. Barème relu sur Normattiva');
    try {
      const params = JSON.parse(await readFile(PARAMS, 'utf8'));
      const law = await loadLaw();
      const report = await checkLaw(params, law);
      await writeFile(path.join(ROOT, 'data', 'law-check.json'), JSON.stringify(report, null, 2));
      console.log(`  ${report.total - report.failed.length}/${report.total} extraits retrouvés mot pour mot`);
      for (const f of report.failed) console.error(`  ÉCART ${f.where} (art. ${f.article}) : « ${f.verify.slice(0, 90)}… »`);
      if (report.failed.length) exit = 2;
    } catch (e) {
      console.error(`  ÉCHEC lecture Normattiva : ${e.message}`);
      exit = exit || 1;
    }
  }
  process.exit(exit);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
