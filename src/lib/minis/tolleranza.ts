/** Riduzione di misura dell'art. 345 c.2 Reg. : 5 %, almeno 5 km/h. */
import { T, type L } from './_kit';
import { kmh } from './_mv';
import { riduzione } from '../engine/index';
import type { MiniSpec } from '../mini-types';
export default (l: L): MiniSpec => ({
  title: T(l, 'Quanto toglie la tolleranza dell’autovelox', 'How much the camera tolerance takes off'),
  cta: T(l, 'Vedi multa e punti per questa velocità', 'See the fine and points for this speed'),
  inputs: [{ id: 'v', label: T(l, 'Velocità rilevata', 'Speed recorded'), def: 140, max: 400, unit: 'km/h' }],
  run: (v) => {
    const r = riduzione(v.v);
    return {
      head: [T(l, 'Velocità accertata', 'Speed held'), kmh(Math.round((v.v - r) * 100) / 100, l)],
      rows: [[T(l, 'Riduzione applicata', 'Reduction applied'), kmh(r, l)], [T(l, 'Regola', 'Rule'), v.v * 0.05 > 5 ? T(l, '5 % della velocità', '5% of the speed') : T(l, 'minimo di 5 km/h', '5 km/h minimum')]],
    };
  },
});
