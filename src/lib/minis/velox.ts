/** Registro MIT : apparecchi dichiarati per provincia. */
import { T, type L, num } from './_kit';
import { displayDate } from '../format';
import S from '../../data/velox/stats.json';
import type { MiniSpec } from '../mini-types';
const PR = [...(S.province as Array<{ sigla: string; provincia: string; totale: number; comuni: number; provinciali: number }>)].sort((a, b) => a.provincia.localeCompare(b.provincia));
const DEF = Math.max(0, PR.findIndex((p) => p.sigla === 'MI'));
export default (l: L): MiniSpec => ({
  title: T(l, 'Autovelox dichiarati nella mia provincia', 'Speed devices declared in my province'),
  cta: T(l, 'Cerca il tuo comune nel registro', 'Look up your comune in the register'),
  inputs: [{ id: 'p', label: T(l, 'Provincia', 'Province'), def: DEF, options: PR.map((p, i) => ({ value: String(i), label: p.provincia })) }],
  run: (v) => {
    const p = PR[v.p] ?? PR[DEF];
    return {
      head: [T(l, `Provincia di ${p.provincia}`, `Province of ${p.provincia}`), num(p.totale, l)],
      rows: [[T(l, 'Comuni con apparecchi', 'Comuni with devices'), num(p.comuni, l)], [T(l, 'Degli organi provinciali', 'Run by provincial bodies'), num(p.provinciali, l)]],
      note: T(l, `Registro MIT, versione del ${displayDate(S.meta.catturato_il.slice(0, 10), 'it-IT')}; Polizia Stradale esclusa.`, `MIT register, version of ${displayDate(S.meta.catturato_il.slice(0, 10), 'en-GB')}; Polizia Stradale excluded.`),
    };
  },
});
