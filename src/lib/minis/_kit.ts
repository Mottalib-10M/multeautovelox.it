/** Petits outils communs aux mini-simulateurs (fichier ignoré par le registre : préfixe « _ »). */
import { formatMoney, formatPercent, formatNumber } from '../format';
export type L = 'it' | 'en';
export const T = <A>(l: L, it: A, en: A) => (l === 'en' ? en : it);
export const eur = (x: number, l: L, d = 0) => formatMoney(x, d, l);
export const pct = (x: number, l: L, d = 1) => formatPercent(x, d, l);
export const num = (x: number, l: L, d = 0) => formatNumber(x, d, l);
export const yesNoOpts = (l: L) => [{ value: '0', label: 'No' }, { value: '1', label: l === 'en' ? 'Yes' : 'Sì' }];
