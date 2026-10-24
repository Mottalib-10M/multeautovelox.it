/** Maggiorazione notturna di un terzo (art. 195 c.2-bis), tra le 22 e le 7. */
import { T, type L } from './_kit';
import { LIMITI, limOpts, soldi } from './_mv';
import { velocita } from '../engine/index';
import type { MiniSpec } from '../mini-types';
export default (l: L): MiniSpec => ({
  title: T(l, 'Multa di giorno e multa di notte', 'Fine by day and fine at night'),
  cta: T(l, 'Calcolo completo della multa', 'Full fine calculation'),
  inputs: [
    { id: 'v', label: T(l, 'Velocità sul verbale', 'Speed on the fine'), def: 75, max: 400, unit: 'km/h' },
    { id: 'l', label: T(l, 'Limite', 'Limit'), def: 1, options: limOpts(l) },
  ],
  run: (v) => {
    const g = velocita({ limite: LIMITI[v.l], rilevata: v.v });
    const n = velocita({ limite: LIMITI[v.l], rilevata: v.v, notte: true });
    return {
      head: [T(l, 'Minimo di notte (22–7)', 'Night minimum (10 pm–7 am)'), soldi(n.minimo, l)],
      rows: [[T(l, 'Minimo di giorno', 'Daytime minimum'), soldi(g.minimo, l)], [T(l, 'Differenza', 'Difference'), soldi(Math.round((n.minimo - g.minimo) * 100) / 100, l)], [T(l, 'Di notte entro 5 giorni', 'At night within 5 days'), n.ridotto !== null ? soldi(n.ridotto, l) : T(l, 'sconto escluso', 'no discount')]],
    };
  },
});
