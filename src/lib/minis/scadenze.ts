/** Giorni passati dalla notifica → giorni rimasti per lo sconto, il minimo e il ricorso. */
import { T, type L } from './_kit';
import { yn } from './_mv';
import { P } from '../engine/params';
import type { MiniSpec } from '../mini-types';
export default (l: L): MiniSpec => ({
  title: T(l, 'Quanti giorni mi restano', 'How many days I have left'),
  cta: T(l, 'Le date esatte dal calendario', 'Exact dates from the calendar'),
  inputs: [
    { id: 'g', label: T(l, 'Giorni dalla notifica', 'Days since it was served'), def: 3, max: 400 },
    { id: 'e', label: T(l, 'Residente all’estero', 'Living outside Italy'), def: 0, options: yn(l) },
  ],
  run: (v) => {
    const left = (n: number) => (n - v.g < 0 ? T(l, 'scaduto', 'passed') : T(l, `${n - v.g} giorni`, `${n - v.g} days`));
    return {
      head: [T(l, 'Sconto del 30%', '30% discount'), left(P.payment.reduced_within_days)],
      rows: [
        [T(l, 'Minimo', 'Minimum'), left(P.payment.within_days_minimum)],
        [T(l, 'Ricorso al prefetto', 'Appeal to the prefetto'), left(P.appeal.prefetto.days)],
        [T(l, 'Ricorso al giudice di pace', 'Appeal to the giudice di pace'), left(v.e ? P.appeal.giudice_di_pace.days_abroad : P.appeal.giudice_di_pace.days)],
      ],
    };
  },
});
