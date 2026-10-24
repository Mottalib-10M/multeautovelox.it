/** Pagamento entro 5 giorni : −30 % sul minimo (art. 202 c.1). */
import { T, type L } from './_kit';
import { soldi } from './_mv';
import { P } from '../engine/params';
import type { MiniSpec } from '../mini-types';
export default (l: L): MiniSpec => ({
  title: T(l, 'Quanto pago entro 5 giorni', 'What I pay within 5 days'),
  cta: T(l, 'Le date esatte per il tuo verbale', 'The exact dates for your fine'),
  inputs: [{ id: 'm', label: T(l, 'Importo minimo sul verbale', 'Minimum amount on the fine'), def: 173, max: 10000, unit: '€', decimals: 2 }],
  run: (v) => {
    const r = Math.round(v.m * (1 - P.payment.reduction) * 100) / 100;
    return { head: [T(l, 'Entro 5 giorni', 'Within 5 days'), soldi(r, l)], rows: [[T(l, 'Risparmio', 'Saving'), soldi(Math.round((v.m - r) * 100) / 100, l)], [T(l, 'Dal 6° al 60° giorno', 'From day 6 to day 60'), soldi(v.m, l)]], note: T(l, 'Più le spese di notifica scritte sul verbale, che non si riducono.', 'Plus the service costs printed on the fine, which are not reduced.') };
  },
});
