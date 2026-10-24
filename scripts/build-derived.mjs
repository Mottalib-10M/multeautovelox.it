#!/usr/bin/env node
// Fichiers dérivés des données officielles, régénérés après chaque relevé (scripts/update-data.mjs) :
//
//  - src/data/velox/stats.json      : résumé servi dans le HTML (Italie, régions, provinces, communes
//                                     les plus équipées, villes des pages dédiées) ;
//  - public/data/comuni.json        : les 7 896 communes ISTAT (nom, sigle, code cadastral, appareils
//                                     déclarés par la commune), pour la recherche de l'outil ;
//  - public/data/velox/<SIGLA>.json : appareils déclarés dans la province (communes + organes
//                                     provinciaux), chargés à la demande par l'outil ;
//  - public/data/velox/altri.json   : Polizia Stradale et organes sans commune ;
//  - src/data/tabella-punti.json    : tableau des points de l'art. 126-bis, lu dans la page Normattiva
//                                     mise en cache par update-data.mjs (data/raw/normattiva/tabella.html).
//
// Sources : MIT (CC BY 3.0 IT), ISTAT (CC BY 4.0), Normattiva (texte de loi, art. 5 L. 633/1941).
// Usage : node scripts/build-derived.mjs

import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const V = path.join(ROOT, 'src', 'data', 'velox');
const PUB = path.join(ROOT, 'public', 'data');
const read = async (f) => JSON.parse(await readFile(path.join(V, f), 'utf8'));

function parseCsv(text, sep = ';') {
  const rows = []; let row = [], cell = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; } else if (c === '"') q = false; else cell += c; }
    else if (c === '"') q = true;
    else if (c === sep) { row.push(cell); cell = ''; }
    else if (c === '\n') { row.push(cell.replace(/\r$/, '')); rows.push(row); row = []; cell = ''; }
    else cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

async function istat() {
  const buf = await readFile(path.join(ROOT, 'data', 'raw', 'istat-elenco-comuni.csv'));
  let text;
  try { text = new TextDecoder('utf-8', { fatal: true }).decode(buf); } catch { text = new TextDecoder('windows-1252').decode(buf); }
  const rows = parseCsv(text);
  const h = rows[0].map((s) => s.replace(/\s+/g, ' ').trim());
  const col = (re) => h.findIndex((x) => re.test(x));
  const iCat = col(/^Codice Catastale/i), iNome = col(/^Denominazione in italiano/i), iSigla = col(/^Sigla automobilistica/i),
    iReg = col(/^Denominazione Regione/i), iUts = col(/^Denominazione dell'Unità territoriale sovracomunale/i);
  return rows.slice(1).filter((r) => r[iCat]).map((r) => ({ cat: r[iCat].trim(), nome: r[iNome], sigla: r[iSigla], regione: r[iReg], provincia: r[iUts] }));
}

/** Appareil réduit aux champs affichés : [organe, catégorie, marque, modèle, version, matricule, décret, date du décret, note, état, communiqué le]. */
const slim = (d) => [d.organo, d.categoria, d.marca, d.modello, d.versione, d.matricola, d.decreto, d.data_decreto, d.note && d.note !== '0' ? d.note : '', d.stato, (d.comunicato_il || '').slice(0, 10)];

function tabella(html) {
  const rows = [...html.matchAll(/<tr class="table-formatted-akn">([\s\S]*?)<\/tr>/g)].map((m) =>
    [...m[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((c) => c[1].replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\(\(|\)\)/g, '').replace(/\s+/g, ' ').trim()));
  const out = []; let art = null;
  for (const r of rows) {
    if (r.length < 3) continue;
    if (r[0]) art = r[0].replace(/^Art\.\s*/i, '').trim();
    const pts = Number(r[2].replace(/[^\d]/g, ''));
    if (!art || !r[1] || !Number.isFinite(pts) || pts === 0) continue;
    out.push({ articolo: art, comma: r[1], punti: pts, segno: /^-/.test(r[2]) ? '-' : '' });
  }
  return out;
}

// Rubriques des articles (titres officiels lus sur Normattiva le 2026-10-24) et libellés anglais écrits par nous.
const RUBRICHE = {
  '141': ['Velocità', 'Speed'], '142': ['Limiti di velocità', 'Speed limits'], '143': ['Posizione dei veicoli sulla carreggiata', 'Lane position'],
  '145': ['Precedenza', 'Right of way'], '146': ['Violazione della segnaletica stradale', 'Road signs and traffic lights'],
  '147': ['Comportamento ai passaggi a livello', 'Level crossings'], '148': ['Sorpasso', 'Overtaking'], '149': ['Distanza di sicurezza tra veicoli', 'Safe distance'],
  '150': ['Incrocio tra veicoli nei passaggi ingombrati o su strade di montagna', 'Passing in narrow or mountain roads'],
  '152': ['Segnalazione visiva e illuminazione dei veicoli', 'Vehicle lights'], '153': ['Uso dei dispositivi di segnalazione visiva e di illuminazione', 'Use of lights'],
  '154': ['Cambiamento di direzione o di corsia o altre manovre', 'Turning and changing lanes'], '158': ['Divieto di fermata e di sosta dei veicoli', 'No stopping and no parking'],
  '161': ['Ingombro della carreggiata', 'Obstructing the road'], '162': ['Segnalazione di veicolo fermo', 'Warning triangle'],
  '164': ['Sistemazione del carico sui veicoli', 'Securing the load'], '165': ['Traino di veicoli in avaria', 'Towing a broken-down vehicle'],
  '167': ['Trasporti di cose su veicoli a motore e sui rimorchi', 'Overloading'], '168': ['Disciplina del trasporto su strada dei materiali pericolosi', 'Dangerous goods'],
  '169': ['Trasporto di persone, animali e oggetti sui veicoli a motore', 'Carrying passengers, animals and objects'],
  '170': ['Trasporto di persone, animali e oggetti sui veicoli a motore a due ruote', 'Passengers on two-wheelers'],
  '171': ['Uso del casco protettivo per gli utenti di veicoli a due ruote', 'Helmets'], '172': ['Uso delle cinture di sicurezza e dei sistemi di ritenuta per bambini', 'Seat belts and child seats'],
  '173': ['Uso di lenti o di determinati apparecchi durante la guida', 'Glasses, phones and headphones while driving'],
  '174': ['Durata della guida degli autoveicoli adibiti al trasporto di persone o di cose', 'Driving and rest times (professional drivers)'],
  '175': ['Condizioni e limitazioni della circolazione sulle autostrade e sulle strade extraurbane principali', 'Who may use motorways'],
  '176': ['Comportamenti durante la circolazione sulle autostrade e sulle strade extraurbane principali', 'Conduct on motorways'],
  '177': ['Circolazione dei veicoli di polizia, antincendio, protezione civile e delle autoambulanze', 'Emergency vehicles'],
  '178': ['Documenti di viaggio per trasporti professionali con veicoli non muniti di cronotachigrafo', 'Travel records without tachograph'],
  '179': ['Cronotachigrafo e limitatore di velocità', 'Tachograph and speed limiter'], '186': ["Guida sotto l'influenza dell'alcool", 'Drink-driving'],
  '186-bis': ["Guida sotto l'influenza dell'alcool per conducenti under 21, neopatentati e professionali", 'Zero alcohol for under-21s, new and professional drivers'],
  '187': ["Guida dopo l'assunzione di sostanze stupefacenti", 'Driving after taking drugs'], '188': ['Circolazione e sosta dei veicoli al servizio di persone invalide', 'Disabled parking'],
  '189': ['Comportamento in caso di incidente', 'Conduct after an accident'], '191': ['Comportamento dei conducenti nei confronti dei pedoni', 'Pedestrians'],
  '192': ['Obblighi verso funzionari, ufficiali e agenti', 'Police checks'], '193': ["Obbligo dell'assicurazione di responsabilità civile", 'Compulsory insurance'],
};

async function main() {
  const meta = await read('meta.json');
  const comuni = await read('comuni.json');
  const province = await read('province.json');
  const regioni = await read('regioni.json');
  const provinciali = await read('organi-provinciali.json');
  const altri = await read('altri-organi.json');
  const tutti = await istat();
  const byCat = new Map(comuni.map((c) => [c.catastale, c]));

  await mkdir(path.join(PUB, 'velox'), { recursive: true });
  // Index de recherche : toutes les communes ISTAT.
  const index = tutti.map((c) => [c.cat, c.nome, c.sigla, byCat.get(c.cat)?.dispositivi.length ?? 0]).sort((a, b) => a[1].localeCompare(b[1], 'it'));
  await writeFile(path.join(PUB, 'comuni.json'), JSON.stringify(index));

  // Une province = un fichier : appareils par commune + organes provinciaux.
  const sigle = [...new Set(tutti.map((c) => c.sigla))];
  for (const s of sigle) {
    const cs = comuni.filter((c) => c.sigla === s).map((c) => ({ cat: c.catastale, nome: c.nome, d: c.dispositivi.map(slim) }));
    const pv = (provinciali[s] ?? []).map(slim);
    await writeFile(path.join(PUB, 'velox', `${s}.json`), JSON.stringify({ comuni: cs, provinciali: pv }));
  }
  const stradale = altri.filter((x) => /stradale/i.test(x.organo));
  const resto = altri.filter((x) => !/stradale/i.test(x.organo));
  await writeFile(path.join(PUB, 'velox', 'altri.json'), JSON.stringify({ stradale: stradale.map(slim), altri: resto.map(slim) }));

  // Index des décrets d'approvazione / omologazione déclarés : numéro → appareils, dates, modèles.
  const all = comuni.flatMap((c) => c.dispositivi.map((d) => ({ ...d, sigla: c.sigla }))).concat(
    Object.entries(provinciali).flatMap(([s, l]) => l.map((d) => ({ ...d, sigla: s }))), altri.map((d) => ({ ...d, sigla: '' })));
  const dec = {};
  for (const d of all) {
    const k = String(d.decreto ?? '').trim().replace(/^0+(?=\d)/, '');
    if (!k) continue;
    const e = (dec[k] ??= { n: 0, date: {}, modelli: {}, province: {} });
    e.n++;
    if (d.data_decreto) e.date[d.data_decreto] = (e.date[d.data_decreto] ?? 0) + 1;
    const m = `${d.marca} ${d.modello}`.replace(/\s+/g, ' ').trim();
    e.modelli[m] = (e.modelli[m] ?? 0) + 1;
    if (d.sigla) e.province[d.sigla] = (e.province[d.sigla] ?? 0) + 1;
  }
  const top = (o, n) => Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, n);
  const decIndex = Object.fromEntries(Object.entries(dec).map(([k, e]) => [k, { n: e.n, date: top(e.date, 3), modelli: top(e.modelli, 4), province: Object.keys(e.province).length }]));
  await writeFile(path.join(PUB, 'decreti.json'), JSON.stringify(decIndex));

  // Résumé servi dans le HTML.
  const cnt = (list) => list.reduce((o, d) => { o[d.categoria] = (o[d.categoria] ?? 0) + 1; return o; }, {});
  const city = (nome) => {
    const c = comuni.find((x) => x.nome === nome);
    if (!c) return null;
    const prov = provinciali[c.sigla] ?? [];
    const altriProv = comuni.filter((x) => x.sigla === c.sigla && x.nome !== nome);
    return {
      nome: c.nome, sigla: c.sigla, provincia: c.provincia, regione: c.regione, totale: c.dispositivi.length, categorie: cnt(c.dispositivi),
      organi: [...new Set(c.dispositivi.map((d) => d.organo))],
      modelli: Object.entries(c.dispositivi.reduce((o, d) => { const k = `${d.marca} ${d.modello}`.replace(/\s+/g, ' ').trim(); o[k] = (o[k] ?? 0) + 1; return o; }, {})).sort((a, b) => b[1] - a[1]).slice(0, 6),
      conNote: c.dispositivi.filter((d) => d.note && d.note !== '0').length,
      nonAttivi: c.dispositivi.filter((d) => d.stato !== 'attivo_dichiarato').length,
      provinciali: prov.length, altriComuniProvincia: altriProv.length, dispositiviAltriComuni: altriProv.reduce((a, x) => a + x.dispositivi.length, 0),
    };
  };
  const decreti = Object.entries(comuni.flatMap((c) => c.dispositivi).concat(Object.values(provinciali).flat(), altri)
    .reduce((o, d) => { const k = String(d.decreto ?? '').trim(); if (k) o[k] = (o[k] ?? 0) + 1; return o; }, {})).sort((a, b) => b[1] - a[1]);
  const anni = comuni.flatMap((c) => c.dispositivi).concat(Object.values(provinciali).flat(), altri)
    .reduce((o, d) => { const y = (String(d.data_decreto).match(/(\d{4})$/) ?? [])[1]; if (y && +y >= 1980 && +y <= 2026) o[y] = (o[y] ?? 0) + 1; return o; }, {});
  const stats = {
    meta: { ...meta, comuni_istat: tutti.length, province: sigle.length },
    italia: { totale: meta.dispositivi_totali, categorie: meta.per_categoria, polizia_stradale: stradale.length, altri_senza_comune: resto.length,
      provinciali: Object.values(provinciali).reduce((a, l) => a + l.length, 0), comuni: comuni.length,
      decreti_distinti: decreti.length, decreti_top: decreti.slice(0, 8), anni_decreto: anni },
    regioni: regioni.sort((a, b) => b.totale - a.totale),
    province: province.map((p) => ({ ...p, provinciali: (provinciali[p.sigla] ?? []).length })).sort((a, b) => b.totale - a.totale),
    top_comuni: comuni.map((c) => [c.nome, c.sigla, c.dispositivi.length]).sort((a, b) => b[2] - a[2]).slice(0, 20),
    citta: Object.fromEntries(['Roma', 'Milano', 'Torino', 'Napoli', 'Genova', 'Firenze', 'Bologna', 'Venezia', 'Palermo'].map((n) => [n, city(n)])),
    nomi_province: Object.fromEntries(tutti.map((c) => [c.sigla, c.provincia])),
  };
  await writeFile(path.join(V, 'stats.json'), JSON.stringify(stats, null, 1));

  // Tableau des points.
  const tab = path.join(ROOT, 'data', 'raw', 'normattiva', 'tabella.html');
  if (existsSync(tab)) {
    const html = await readFile(tab, 'utf8');
    const vig = html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').match(/Testo in vigore dal:\s*([0-9-]+)/);
    const righe = tabella(html).map((r) => ({ ...r, rubrica: RUBRICHE[r.articolo]?.[0] ?? '', rubrica_en: RUBRICHE[r.articolo]?.[1] ?? '' }));
    if (righe.length < 80) throw new Error(`tableau des points : ${righe.length} lignes seulement`);
    await writeFile(path.join(ROOT, 'src', 'data', 'tabella-punti.json'), JSON.stringify({ fonte: 'Tabella dei punteggi previsti all\'art. 126-bis, Codice della Strada (Normattiva)', vigore: vig ? vig[1] : null, righe }, null, 1));
    console.log(`tableau des points : ${righe.length} lignes, en vigueur depuis le ${vig?.[1]}`);
  }
  console.log(`index ${index.length} communes, ${sigle.length} provinces, ${stradale.length} appareils Polizia Stradale`);
}
main().catch((e) => { console.error(e); process.exit(1); });
