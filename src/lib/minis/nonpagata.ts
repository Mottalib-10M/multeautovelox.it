/** Verbale non pagato né contestato : metà del massimo (art. 203 c.3). */
import { T, type L } from './_kit';
import { soldi } from './_mv';
import { P } from '../engine/params';
import type { MiniSpec } from '../mini-types';
export default (l: L): MiniSpec => ({
  title: T(l, 'Quanto costa una multa non pagata', 'What an unpaid fine costs'),
  cta: T(l, 'Le scadenze del tuo verbale', 'The deadlines of your fine'),
  inputs: [
    { id: 'm', label: T(l, 'Minimo', 'Minimum'), def: 173, max: 10000, unit: '€', decimals: 2 },
    { id: 'x', label: T(l, 'Massimo', 'Maximum'), def: 694, max: 20000, unit: '€', decimals: 2 },
  ],
  run: (v) => {
    const h = Math.round(v.x * P.unpaid.fraction_of_max * 100) / 100;
    return { head: [T(l, 'Dopo 60 giorni', 'After 60 days'), soldi(h, l)], rows: [[T(l, 'Entro 60 giorni', 'Within 60 days'), soldi(v.m, l)], [T(l, 'Costo del ritardo', 'Cost of waiting'), soldi(Math.max(0, Math.round((h - v.m) * 100) / 100), l)]], note: T(l, 'Più le spese di notifica e di procedimento.', 'Plus service and procedure costs.') };
  },
});
