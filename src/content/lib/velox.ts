/** Petits calculs sur le registre MIT partagés par les pages « autovelox » (hors registre des pages). */
import type { Helpers } from '../../lib/guide-types';
import MI from '../../../public/data/velox/MI.json';
import RM from '../../../public/data/velox/RM.json';
type Dev = string[];
type Prov = { comuni: Array<{ cat: string; nome: string; d: Dev[] }>; provinciali: Dev[] };
export const PROV: Record<string, Prov> = { MI: MI as unknown as Prov, RM: RM as unknown as Prov };
export const CAT_IT: Record<string, string> = { mobile: 'mobili', fisso: 'fissi', fisso_mobile: 'fissi o mobili', velocita_media: 'di velocità media', non_precisato: 'di tipo non precisato' };
export const CAT_EN: Record<string, string> = { mobile: 'mobile', fisso: 'fixed', fisso_mobile: 'fixed or mobile', velocita_media: 'average-speed', non_precisato: 'of unstated type' };
/** Appareils d'une commune regroupés par modèle et décret : [modèle, décret, date, type, nombre, note]. */
export function perModello(sigla: string, cat: string) {
  const c = PROV[sigla].comuni.find((x) => x.cat === cat)!;
  const m = new Map<string, { modello: string; decreto: string; data: string; tipo: string; n: number; stato: string }>();
  for (const d of c.d) {
    const k = `${d[2]} ${d[3]}|${d[6]}|${d[1]}|${d[9]}`;
    const o = m.get(k) ?? { modello: `${d[2]} ${d[3]}`.trim(), decreto: d[6], data: d[7], tipo: d[1], n: 0, stato: d[9] };
    o.n++; m.set(k, o);
  }
  return [...m.values()].sort((a, b) => b.n - a.n);
}
/** Communes de la province par nombre d'appareils déclarés (hors chef-lieu si demandé). */
export function topComuni(sigla: string, escludi?: string, n = 8) {
  return PROV[sigla].comuni.filter((c) => c.cat !== escludi).map((c) => ({ nome: c.nome, n: c.d.length })).sort((a, b) => b.n - a.n || a.nome.localeCompare(b.nome)).slice(0, n);
}
export const cats = (h: Helpers, o: Record<string, number>, it: boolean) => Object.entries(o).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${h.num(v)} ${(it ? CAT_IT : CAT_EN)[k] ?? k}`).join(', ');
/** Routes citées dans les notes des organes provinciaux (« S.P. 14 Rivoltana km … dir. … ») : [route, actifs, non actifs]. */
export function strade(sigla: string) {
  const m = new Map<string, { strada: string; attivi: number; non: number }>();
  for (const d of PROV[sigla].provinciali) {
    const seg = (d[8] || '').replace(/^(?:(?:Censito|Dismesso) il \d\d\/\d\d\/\d{4}\s*-\s*)+/, '');
    const s = seg.replace(/\s+km\s.*$/i, '').replace(/\s+dir\..*$/i, '').trim();
    if (!/^S\.[PS]\./.test(s)) continue;
    const o = m.get(s) ?? { strada: s, attivi: 0, non: 0 };
    if (d[9] === 'attivo_dichiarato') o.attivi++; else o.non++;
    m.set(s, o);
  }
  return [...m.values()].sort((a, b) => b.attivi - a.attivi || a.strada.localeCompare(b.strada));
}
