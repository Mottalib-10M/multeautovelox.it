/** Eccesso di velocità : velocità letta e limite → importo, punti, sospensione (art. 142, art. 345 Reg.). */
import { T, type L } from './_kit';
import { LIMITI, limOpts, kmh, pts, soldi, sosp } from './_mv';
import { velocita } from '../engine/index';
import type { MiniSpec } from '../mini-types';
export default (l: L): MiniSpec => ({
  title: T(l, 'La mia multa per eccesso di velocità', 'My Italian speeding fine'),
  cta: T(l, 'Calcolo completo con notte, neopatentati e soglie', 'Full calculation with night, new drivers and thresholds'),
  inputs: [
    { id: 'v', label: T(l, 'Velocità sul verbale', 'Speed on the fine'), def: 72, max: 400, unit: 'km/h' },
    { id: 'l', label: T(l, 'Limite', 'Limit'), def: 1, options: limOpts(l) },
  ],
  run: (v) => {
    const s = velocita({ limite: LIMITI[v.l], rilevata: v.v });
    if (!s.infrazione) return { head: [T(l, 'Nessuna multa', 'No fine'), soldi(0, l)], rows: [[T(l, 'Velocità accertata', 'Speed held'), kmh(s.accertata, l)]], note: T(l, 'Dopo la riduzione del 5 % la velocità resta entro il limite.', 'After the 5% reduction the speed stays within the limit.') };
    return {
      head: s.ridotto !== null ? [T(l, 'Entro 5 giorni (−30 %)', 'Within 5 days (−30%)'), soldi(s.ridotto, l)] : [T(l, 'Entro 60 giorni', 'Within 60 days'), soldi(s.minimo, l)],
      rows: [
        [T(l, 'Velocità accertata', 'Speed held'), kmh(s.accertata, l)],
        [T(l, 'Importo entro 60 giorni', 'Amount within 60 days'), soldi(s.minimo, l)],
        [T(l, 'Punti', 'Points'), pts(s.punti, l)],
        [T(l, 'Sospensione della patente', 'Licence suspension'), sosp(s.sospensione, l)],
      ],
    };
  },
});
