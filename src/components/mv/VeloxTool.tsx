/**
 * Registro MIT degli autovelox : ricerca di un comune (tutti i 7 896 comuni ISTAT) → apparecchi dichiarati
 * dal comune, dagli organi provinciali e, a parte, dalla Polizia Stradale ; ricerca per numero di decreto
 * di approvazione o omologazione. Données : MIT, velox.mit.gov.it (CC BY 3.0 IT), ISTAT (CC BY 4.0),
 * fichiers de public/data produits par scripts/build-derived.mjs, chargés seulement après hydratation.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Shell, Head, Rows, Note, MethodLink } from '../calc/kit';
import { formatNumber, displayDate } from '../../lib/format';
import { readParams, updateURL } from '../../lib/url-state';
import S from '../../data/velox/stats.json';
import { T, type L } from './common';

type Dev = [string, string, string, string, string, string, string, string, string, string, string];
type Idx = [string, string, string, number];
type Prov = { comuni: Array<{ cat: string; nome: string; d: Dev[] }>; provinciali: Dev[] };
type Dec = { n: number; date: Array<[string, number]>; modelli: Array<[string, number]>; province: number };
export const CAT: Record<string, { it: string; en: string }> = {
  mobile: { it: 'Mobile (telelaser, postazione spostabile)', en: 'Mobile (laser gun, movable unit)' },
  fisso: { it: 'Fisso', en: 'Fixed' },
  fisso_mobile: { it: 'Fisso o mobile', en: 'Fixed or mobile' },
  velocita_media: { it: 'Velocità media (tutor)', en: 'Average speed (tutor)' },
  non_precisato: { it: 'Tipo non precisato', en: 'Type not stated' },
};
const STATO: Record<string, { it: string; en: string }> = {
  attivo_dichiarato: { it: 'dichiarato in uso', en: 'declared in use' },
  segnalato_non_attivo: { it: 'segnalato non attivo', en: 'reported not active' },
  sequestro: { it: 'sotto sequestro', en: 'seized' },
};
const base = () => (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

export interface VeloxProps { lang: L; id?: string; mode?: 'comune' | 'decreto'; defaultCat?: string; defaultNome?: string; defaultSigla?: string; defaultDecreto?: string; methodHref?: string }

export default function VeloxTool({ lang: l, id = 'velox', mode = 'comune', defaultCat = 'H501', defaultNome = 'Roma', defaultSigla = 'RM', defaultDecreto = '3248', methodHref }: VeloxProps) {
  const [q, setQ] = useState(mode === 'decreto' ? defaultDecreto : defaultNome);
  const [sel, setSel] = useState<{ cat: string; nome: string; sigla: string }>({ cat: defaultCat, nome: defaultNome, sigla: defaultSigla });
  const [idx, setIdx] = useState<Idx[] | null>(null);
  const [prov, setProv] = useState<Record<string, Prov>>({});
  const [dec, setDec] = useState<Record<string, Dec> | null>(null);
  const [open, setOpen] = useState(false);
  const [lista, setLista] = useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    const u = readParams(window.location.search);
    if (mode === 'decreto') { const d = u.get('d'); if (d) setQ(d); }
    fetch(`${base()}/data/${mode === 'decreto' ? 'decreti' : 'comuni'}.json`).then((r) => r.json()).then((j) => {
      if (mode === 'decreto') setDec(j);
      else {
        setIdx(j);
        const c = u.get('c'); const hit = c && (j as Idx[]).find((x) => x[0] === c);
        if (hit) { setSel({ cat: hit[0], nome: hit[1], sigla: hit[2] }); setQ(hit[1]); }
      }
      loaded.current = true;
    }).catch(() => undefined);
  }, []);
  useEffect(() => { if (mode === 'comune') updateURL({ c: sel.cat }); else updateURL({ d: q }); }, [sel.cat, q, mode]);
  useEffect(() => {
    if (mode !== 'comune' || !lista || prov[sel.sigla]) return;
    fetch(`${base()}/data/velox/${sel.sigla}.json`).then((r) => r.json()).then((j) => setProv((o) => ({ ...o, [sel.sigla]: j }))).catch(() => undefined);
  }, [lista, sel.sigla, mode]);

  const sugg = useMemo(() => {
    if (!idx || mode !== 'comune' || norm(q).length < 2 || norm(q) === norm(sel.nome)) return [];
    const n = norm(q);
    return idx.filter((x) => norm(x[1]).startsWith(n)).concat(idx.filter((x) => !norm(x[1]).startsWith(n) && norm(x[1]).includes(n))).slice(0, 8);
  }, [q, idx, sel.nome, mode]);

  const P_ = (S.province as Array<{ sigla: string; provincia: string; totale: number; comuni: number; provinciali: number }>).find((p) => p.sigla === sel.sigla);
  const nomeProv = (S.nomi_province as Record<string, string>)[sel.sigla] ?? sel.sigla;
  const c0 = (S.citta as Record<string, { totale: number; categorie: Record<string, number> } | null>)[sel.nome];
  const pv = prov[sel.sigla];
  const devs: Dev[] = pv ? pv.comuni.find((x) => x.cat === sel.cat)?.d ?? [] : [];
  const nCom = pv ? devs.length : idx ? idx.find((x) => x[0] === sel.cat)?.[3] ?? 0 : c0?.totale ?? 0;
  const cats = pv ? devs.reduce<Record<string, number>>((o, d) => { o[d[1]] = (o[d[1]] ?? 0) + 1; return o; }, {}) : c0?.categorie ?? {};
  const d = (iso: string) => displayDate(iso, l === 'en' ? 'en-GB' : 'it-IT');
  const meta = S.meta as { catturato_il: string; origine: string; ultima_comunicazione: string };
  const dataReg = meta.catturato_il.slice(0, 10);

  if (mode === 'decreto') {
    const k = q.trim().replace(/^0+(?=\d)/, '');
    const e = dec?.[k];
    const top = (S.italia.decreti_top as Array<[string, number]>);
    const form = (
      <>
        <div className="grid grid-rows-subgrid row-span-3 gap-1">
          <label htmlFor={`${id}-d`} className="text-sm font-medium text-navy-800">{T(l, 'Numero del decreto sul verbale', 'Decree number on the fine')}</label>
          <input id={`${id}-d`} inputMode="numeric" autoComplete="off" value={q} onChange={(ev) => setQ(ev.target.value.replace(/[^0-9]/g, ''))} className="h-12 w-full rounded-lg border border-navy-300 bg-white px-3 text-navy-900 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-200" />
          <p className="text-xs text-navy-600">{T(l, 'Il verbale cita «decreto di approvazione n. …» o «omologazione n. …»', 'The fine quotes “decreto di approvazione n. …” or “omologazione n. …”')}</p>
        </div>
        <Note>{T(l, `I decreti più dichiarati: ${top.slice(0, 5).map(([n, c]) => `n. ${n} (${formatNumber(c, 0, l)})`).join(', ')}.`, `Most declared decrees: ${top.slice(0, 5).map(([n, c]) => `no. ${n} (${formatNumber(c, 0, l)})`).join(', ')}.`)}</Note>
      </>
    );
    const sTop = top.find(([n]) => n === k);
    const n = e?.n ?? sTop?.[1] ?? 0;
    const result = (
      <>
        <Head label={T(l, `Apparecchi dichiarati con il decreto n. ${k || '…'}`, `Devices declared under decree no. ${k || '…'}`)} value={formatNumber(n, 0, l)} sub={n ? T(l, `su ${formatNumber(S.italia.totale, 0, l)} nel registro al ${d(dataReg)}`, `out of ${formatNumber(S.italia.totale, 0, l)} in the register on ${d(dataReg)}`) : (dec ? T(l, 'Nessun apparecchio con questo numero nel registro', 'No device with this number in the register') : T(l, 'Caricamento del registro…', 'Loading the register…'))} />
        <Rows rows={e ? [
          ...e.date.slice(0, 2).map(([x, c]) => [T(l, 'Data indicata', 'Date stated'), `${x} (${c})`] as [string, string]),
          ...e.modelli.slice(0, 3).map(([x, c]) => [T(l, 'Modello', 'Model'), `${x} (${c})`] as [string, string]),
          [T(l, 'Province in cui compare', 'Provinces where it appears'), String(e.province)],
        ] : []} />
        <Note>{T(l, 'Il registro riporta il decreto dichiarato dall’ente: non dice se l’apparecchio è «omologato» nel senso chiesto dalla Cassazione.', 'The register shows the decree declared by the police body: it does not say whether the device is “omologato” in the sense required by the Court of Cassation.')}</Note>
        <MethodLink href={methodHref} lang={l} />
      </>
    );
    return <Shell id={id} form={form} result={result} />;
  }

  const form = (
    <>
      <div className="relative grid grid-rows-subgrid row-span-3 gap-1">
        <label htmlFor={`${id}-q`} className="text-sm font-medium text-navy-800">{T(l, 'Comune', 'Comune (town)')}</label>
        <input id={`${id}-q`} role="combobox" aria-expanded={open && sugg.length > 0} aria-controls={`${id}-list`} autoComplete="off" value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 150)}
          className="h-12 w-full rounded-lg border border-navy-300 bg-white px-3 text-navy-900 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-200" />
        <p className="text-xs text-navy-600">{T(l, `Tutti i ${formatNumber(S.meta.comuni_istat, 0, l)} comuni italiani`, `All ${formatNumber(S.meta.comuni_istat, 0, l)} Italian comuni`)}</p>
        {open && sugg.length > 0 && (
          <ul id={`${id}-list`} role="listbox" className="absolute top-[4.6rem] z-30 w-full overflow-hidden rounded-lg border border-navy-200 bg-white shadow-lg">
            {sugg.map((x) => (
              <li key={x[0]} role="option" aria-selected={x[0] === sel.cat}>
                <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => { setSel({ cat: x[0], nome: x[1], sigla: x[2] }); setQ(x[1]); setOpen(false); setLista(false); }}
                  className="flex w-full justify-between px-3 py-2 text-left text-sm hover:bg-accent-50"><span>{x[1]} ({x[2]})</span><span className="tabular-nums text-navy-600">{x[3]}</span></button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <Note>{T(l, `Registro del Ministero delle infrastrutture e dei trasporti, versione del ${d(dataReg)}${meta.origine === 'wayback' ? ' (ultima copia completa disponibile)' : ''}: ${formatNumber(S.italia.totale, 0, l)} apparecchi dichiarati.`, `Register of the Ministry of Infrastructure and Transport, version of ${d(dataReg)}${meta.origine === 'wayback' ? ' (latest complete copy available)' : ''}: ${formatNumber(S.italia.totale, 0, l)} devices declared.`)}</Note>
    </>
  );
  const result = (
    <>
      <Head label={T(l, `Autovelox dichiarati dal Comune di ${sel.nome}`, `Speed devices declared by ${sel.nome} council`)} value={formatNumber(nCom, 0, l)}
        sub={P_ ? T(l, `Provincia di ${nomeProv}: ${formatNumber(P_.totale, 0, l)} in tutto, di cui ${formatNumber(P_.provinciali, 0, l)} degli organi provinciali`, `Province of ${nomeProv}: ${formatNumber(P_.totale, 0, l)} in all, ${formatNumber(P_.provinciali, 0, l)} of them run by provincial bodies`) : T(l, `Nessun apparecchio dichiarato in provincia di ${nomeProv}`, `No device declared in the province of ${nomeProv}`)} />
      <Rows rows={Object.entries(cats).sort((a, b) => b[1] - a[1]).map(([k, v]) => [CAT[k]?.[l] ?? k, formatNumber(v, 0, l)] as [string, string])} />
      <Note>{T(l, `Strade statali e autostrade: ${formatNumber(S.italia.polizia_stradale, 0, l)} apparecchi della Polizia Stradale, elencati senza comune.`, `State roads and motorways: ${formatNumber(S.italia.polizia_stradale, 0, l)} Polizia Stradale devices, listed with no comune.`)}</Note>
      <MethodLink href={methodHref} lang={l} />
    </>
  );
  return (
    <div>
      <Shell id={id} form={form} result={result} />
      <div data-chrome className="not-prose mt-4 rounded-xl border border-navy-200">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-navy-200 bg-navy-50 px-4 py-2 text-sm">
          <p className="font-semibold text-navy-900">{T(l, `Gli apparecchi di ${sel.nome}: marca, modello, decreto, note`, `The devices of ${sel.nome}: make, model, decree, notes`)}</p>
          {!lista && <button type="button" onClick={() => setLista(true)} className="rounded border border-accent-500 bg-white px-3 py-1 font-semibold text-accent-700">{T(l, 'Mostra l’elenco', 'Show the list')}</button>}
        </div>
        {lista && (
          <div className="max-h-[32rem] overflow-auto">
            {!pv ? <p className="px-4 py-3 text-sm text-navy-600">{T(l, 'Caricamento…', 'Loading…')}</p> : (
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-white"><tr className="text-left text-navy-700">
                  <th scope="col" className="px-3 py-2 font-semibold">{T(l, 'Organo', 'Body')}</th>
                  <th scope="col" className="px-3 py-2 font-semibold">{T(l, 'Tipo', 'Type')}</th>
                  <th scope="col" className="px-3 py-2 font-semibold">{T(l, 'Marca e modello', 'Make and model')}</th>
                  <th scope="col" className="px-3 py-2 font-semibold">{T(l, 'Decreto', 'Decree')}</th>
                  <th scope="col" className="px-3 py-2 font-semibold">{T(l, 'Note dell’ente', 'Notes from the body')}</th>
                </tr></thead>
                <tbody className="divide-y divide-navy-100">
                  {[...devs, ...pv.provinciali].map((x, i) => (
                    <tr key={i} className={i === devs.length ? 'border-t-2 border-navy-300' : ''}>
                      <td className="px-3 py-1.5">{x[0]}{x[9] !== 'attivo_dichiarato' && <span className="ml-1 text-xs font-semibold text-accent-800">({STATO[x[9]]?.[l] ?? x[9]})</span>}</td>
                      <td className="px-3 py-1.5">{CAT[x[1]]?.[l] ?? x[1]}</td>
                      <td className="px-3 py-1.5">{`${x[2]} ${x[3]}`.trim()}{x[4] && x[4] !== 'non presente' ? ` ${x[4]}` : ''}</td>
                      <td className="tabular-nums px-3 py-1.5">{x[6] ? `${x[6]}${x[7] ? ` · ${x[7]}` : ''}` : '–'}</td>
                      <td className="px-3 py-1.5 text-navy-700">{x[8] || '–'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
        <p className="px-4 py-2 text-xs text-navy-600">{T(l, 'Fonte: MIT, Lista dispositivi di rilevamento della velocità (CC BY 3.0 IT); comuni ISTAT (CC BY 4.0). Testo come dichiarato dagli enti: la posizione compare solo se l’ente l’ha scritta nelle note. Sotto la linea, gli apparecchi degli organi provinciali.', 'Source: MIT, list of speed-measuring devices (CC BY 3.0 IT); ISTAT comuni (CC BY 4.0). Text as declared by each body: the location only appears when the body wrote it in the notes. Below the line, devices of provincial bodies.')}</p>
      </div>
    </div>
  );
}
