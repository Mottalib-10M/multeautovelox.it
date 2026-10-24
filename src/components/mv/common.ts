/** Petits outils communs aux outils du site (libellés, formats). */
import { formatMoney, formatNumber } from '../../lib/format';
export type L = 'it' | 'en';
export const T = <A,>(l: L, it: A, en: A) => (l === 'en' ? en : it);
export const eur = (x: number, l: L, d?: number) => formatMoney(x, d ?? (Number.isInteger(Math.round(x * 100) / 100) ? 0 : 2), l);
export const kmh = (x: number, l: L) => `${formatNumber(x, Number.isInteger(x) ? 0 : 2, l)} km/h`;
export const LIMITI = [30, 50, 70, 80, 90, 110, 130, 150];
export const yesNo = (l: L) => [{ value: '0', label: T(l, 'No', 'No') }, { value: '1', label: T(l, 'Sì', 'Yes') }];
export function durata(s: { da: number; a: number; unita: 'giorni' | 'mesi' } | null, l: L): string {
  if (!s) return T(l, 'no', 'no');
  const u = s.unita === 'giorni' ? T(l, 'giorni', 'days') : T(l, 'mesi', 'months');
  return T(l, `da ${s.da} a ${s.a} ${u}`, `${s.da} to ${s.a} ${u}`);
}
export const punti = (n: number, l: L) => (n === 0 ? T(l, 'nessuno', 'none') : n === 1 ? T(l, '1 punto', '1 point') : T(l, `${n} punti`, `${n} points`));
export const BAND_LABEL: Record<string, { it: string; en: string }> = {
  c7: { it: 'fino a 10 km/h oltre il limite', en: 'up to 10 km/h over' },
  c8: { it: 'più di 10 e fino a 40 km/h oltre', en: 'more than 10, up to 40 km/h over' },
  c9: { it: 'più di 40 e fino a 60 km/h oltre', en: 'more than 40, up to 60 km/h over' },
  c9bis: { it: 'più di 60 km/h oltre il limite', en: 'more than 60 km/h over' },
};
