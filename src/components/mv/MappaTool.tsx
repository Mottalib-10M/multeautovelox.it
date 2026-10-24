/**
 * Carte des 20 régions (cartogramme en tuiles, une tuile par région, couleur = nombre d'appareils
 * déclarés au registre MIT), un sélecteur de région et le détail par province. Données : stats.json
 * (scripts/build-derived.mjs). Le sélecteur porte la même information que la carte (accessibilité).
 */
import { useEffect, useState } from 'react';
import SelectField from '../ui/SelectField';
import { Shell, Head, Rows, Note, MethodLink } from '../calc/kit';
import { formatNumber, displayDate } from '../../lib/format';
import { readParams, updateURL } from '../../lib/url-state';
import S from '../../data/velox/stats.json';
import { T, type L } from './common';
import { CAT } from './VeloxTool';

type Reg = { regione: string; comuni: number; totale: number; [k: string]: string | number };
type Prov = { sigla: string; provincia: string; regione: string; totale: number; comuni: number; provinciali: number };
/** Position des tuiles [colonne, ligne] et sigle affiché. */
const GRID: Record<string, [number, number, string]> = {
  "Valle d'Aosta/Vallée d'Aoste": [0, 0, 'VdA'], Lombardia: [1, 0, 'Lom'], 'Trentino-Alto Adige/Südtirol': [2, 0, 'TAA'], 'Friuli-Venezia Giulia': [3, 0, 'FVG'],
  Piemonte: [0, 1, 'Pie'], 'Emilia-Romagna': [1, 1, 'EmR'], Veneto: [2, 1, 'Ven'],
  Liguria: [0, 2, 'Lig'], Toscana: [1, 2, 'Tos'], Umbria: [2, 2, 'Umb'], Marche: [3, 2, 'Mar'],
  Lazio: [2, 3, 'Laz'], Abruzzo: [3, 3, 'Abr'],
  Sardegna: [0, 4, 'Sar'], Campania: [3, 4, 'Cam'], Molise: [4, 3, 'Mol'],
  Basilicata: [4, 4, 'Bas'], Puglia: [5, 4, 'Pug'],
  Calabria: [4, 5, 'Cal'], Sicilia: [3, 6, 'Sic'],
};
const REG = S.regioni as Reg[];
const PROV = S.province as Prov[];
const MAX = Math.max(...REG.map((r) => r.totale));
/** Quatre classes de couleur, du plus clair au plus foncé (texte lisible sur chacune). */
const CLASSI = [50, 150, 300, Infinity];
const FILL = ['#E8F3EC', '#B9DCC6', '#5FA97F', '#0B6E3A'];
const INK = ['#173A26', '#173A26', '#0B1F14', '#FFFFFF'];
const cls = (n: number) => CLASSI.findIndex((c) => n <= c);
const short = (r: string) => r.split('/')[0];

export default function MappaTool({ lang: l, id = 'mappa', defaultRegione = 'Lombardia', methodHref }: { lang: L; id?: string; defaultRegione?: string; methodHref?: string }) {
  const [reg, setReg] = useState(defaultRegione);
  useEffect(() => { const r = readParams(window.location.search).get('r'); if (r && GRID[r]) setReg(r); }, []);
  useEffect(() => { updateURL({ r: reg }); }, [reg]);
  const r = REG.find((x) => x.regione === reg)!;
  const pr = PROV.filter((p) => p.regione === reg).sort((a, b) => b.totale - a.totale);
  const pos = [...REG].sort((a, b) => b.totale - a.totale).findIndex((x) => x.regione === reg) + 1;
  const dataReg = displayDate(S.meta.catturato_il.slice(0, 10), l === 'en' ? 'en-GB' : 'it-IT');
  const n = (x: number) => formatNumber(x, 0, l);
  const W = 64, G = 6;

  const form = (
    <>
      <SelectField id={`${id}-r`} label={T(l, 'Regione', 'Region')} value={reg} onChange={setReg} options={[...REG].sort((a, b) => short(a.regione).localeCompare(short(b.regione))).map((x) => ({ value: x.regione, label: short(x.regione) }))} />
      <figure className="m-0">
        <svg viewBox={`0 0 ${6 * (W + G)} ${7 * (W + G)}`} className="mx-auto w-full max-w-[22rem]" role="img" aria-label={T(l, 'Apparecchi dichiarati per regione', 'Devices declared by region')}>
          {REG.map((x) => {
            const [c, rr, ab] = GRID[x.regione]; const k = cls(x.totale); const on = x.regione === reg;
            return (
              <g key={x.regione} transform={`translate(${c * (W + G)},${rr * (W + G)})`} onClick={() => setReg(x.regione)} className="cursor-pointer">
                <title>{`${short(x.regione)}: ${n(x.totale)}`}</title>
                <rect width={W} height={W} rx="8" fill={FILL[k]} stroke={on ? '#C1272D' : '#FFFFFF'} strokeWidth={on ? 4 : 1} />
                <text x={W / 2} y={26} textAnchor="middle" fontSize="15" fontWeight="700" fill={INK[k]}>{ab}</text>
                <text x={W / 2} y={46} textAnchor="middle" fontSize="14" fill={INK[k]}>{n(x.totale)}</text>
              </g>
            );
          })}
        </svg>
        <figcaption className="mt-2 flex flex-wrap justify-center gap-3 text-xs text-navy-700">
          {['≤ 50', '51–150', '151–300', '> 300'].map((t, i) => <span key={t} className="inline-flex items-center gap-1"><span className="inline-block h-3 w-3 rounded-sm border border-navy-200" style={{ background: FILL[i] }} />{t}</span>)}
        </figcaption>
      </figure>
    </>
  );
  const cats = Object.entries(CAT).map(([k, v]) => [v[l], n(Number(r[k] ?? 0))] as [string, string]).filter(([, v]) => v !== '0');
  const result = (
    <>
      <Head label={T(l, `Autovelox dichiarati in ${short(reg)}`, `Speed devices declared in ${short(reg)}`)} value={n(r.totale)} sub={T(l, `${pos}ª regione su 20 · ${n(r.comuni)} comuni con almeno un apparecchio`, `ranked ${pos} of 20 · ${n(r.comuni)} comuni with at least one device`)} />
      <Rows rows={[...cats, ...pr.slice(0, 6).map((p) => [T(l, `Provincia di ${p.provincia}`, `Province of ${p.provincia}`), n(p.totale), true] as [string, string, boolean])]} />
      <div className="mt-3 space-y-1" aria-hidden="true">
        {pr.slice(0, 6).map((p) => <div key={p.sigla} className="flex items-center gap-2 text-xs text-navy-700"><span className="w-7 font-semibold">{p.sigla}</span><span className="h-2 rounded bg-accent-600" style={{ width: `${Math.max(2, (p.totale / MAX) * 100 * 2.2)}%` }} /></div>)}
      </div>
      <Note>{T(l, `Registro MIT, versione del ${dataReg}. Esclusi i ${n(S.italia.polizia_stradale)} apparecchi della Polizia Stradale, che il registro non assegna a un comune.`, `MIT register, version of ${dataReg}. Excludes the ${n(S.italia.polizia_stradale)} Polizia Stradale devices, which the register assigns to no comune.`)}</Note>
      <MethodLink href={methodHref} lang={l} />
    </>
  );
  return <Shell id={id} form={form} result={result} />;
}
