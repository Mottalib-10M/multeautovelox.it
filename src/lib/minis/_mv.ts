/** Outils propres aux mini-simulateurs du site (préfixe « _ » : ignoré par le registre). */
import { T, eur, type L } from './_kit';
import { formatNumber } from '../format';
export const LIMITI = [30, 50, 70, 90, 110, 130];
export const limOpts = (l: L) => LIMITI.map((x, i) => ({ value: String(i), label: `${x} km/h` }));
export const kmh = (n: number, l: L) => `${formatNumber(n, Number.isInteger(n) ? 0 : 2, l)} km/h`;
export const pts = (n: number, l: L) => (n === 0 ? T(l, 'nessuno', 'none') : n === 1 ? T(l, '1 punto', '1 point') : T(l, `${n} punti`, `${n} points`));
export const soldi = (n: number, l: L) => eur(n, l, Number.isInteger(n) ? 0 : 2);
export const sosp = (s: { da: number; a: number; unita: 'giorni' | 'mesi' } | null, l: L) => !s ? T(l, 'nessuna', 'none')
  : s.unita === 'mesi' ? T(l, `da ${s.da} a ${s.a} mesi`, `${s.da} to ${s.a} months`) : T(l, `da ${s.da} a ${s.a} giorni`, `${s.da} to ${s.a} days`);
export const yn = (l: L) => [{ value: '0', label: 'No' }, { value: '1', label: T(l, 'Sì', 'Yes') }];
