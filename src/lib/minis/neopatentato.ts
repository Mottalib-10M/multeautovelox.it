/** Neopatentati : limiti dell'art. 117 c.2 (100 e 90) e punti raddoppiati per tre anni. */
import { T, type L } from './_kit';
import { kmh, pts, soldi } from './_mv';
import { velocita, limite } from '../engine/index';
import type { MiniSpec } from '../mini-types';
const STRADE = ['autostrada', 'extraurbana_principale', 'extraurbana_secondaria', 'urbana'] as const;
export default (l: L): MiniSpec => ({
  title: T(l, 'Neopatentato: limite e punti', 'New driver: limit and points'),
  cta: T(l, 'Calcolo completo della multa', 'Full fine calculation'),
  inputs: [
    { id: 'v', label: T(l, 'Velocità sul verbale', 'Speed on the fine'), def: 118, max: 400, unit: 'km/h' },
    { id: 's', label: T(l, 'Strada', 'Road'), def: 0, options: [T(l, 'Autostrada', 'Motorway'), T(l, 'Extraurbana principale', 'Main extra-urban road'), T(l, 'Extraurbana secondaria', 'Secondary extra-urban road'), T(l, 'Centro abitato', 'Built-up area')].map((x, i) => ({ value: String(i), label: x })) },
  ],
  run: (v) => {
    const lim = limite(STRADE[v.s], false, true);
    const s = velocita({ limite: lim, rilevata: v.v, neopatentato: true });
    return {
      head: [T(l, 'Punti tolti al neopatentato', 'Points taken from a new driver'), pts(s.punti, l)],
      rows: [[T(l, 'Limite per te', 'Your limit'), kmh(lim, l)], [T(l, 'Velocità accertata', 'Speed held'), kmh(s.accertata, l)], [T(l, 'Importo entro 60 giorni', 'Amount within 60 days'), s.infrazione ? soldi(s.minimo, l) : soldi(0, l)]],
    };
  },
});
