/** Più eccessi rilevati in un'ora dallo stesso ente (art. 142 c.6-ter) : la più grave + 1/3, se conviene. */
import { T, type L } from './_kit';
import { soldi } from './_mv';
import { plurime } from '../engine/index';
import type { MiniSpec } from '../mini-types';
export default (l: L): MiniSpec => ({
  title: T(l, 'Due autovelox nella stessa ora', 'Two cameras within the same hour'),
  cta: T(l, 'Calcola ogni multa', 'Work out each fine'),
  inputs: [
    { id: 'a', label: T(l, 'Minimo della prima', 'Minimum of the first'), def: 173, max: 5000, unit: '€' },
    { id: 'b', label: T(l, 'Minimo della seconda', 'Minimum of the second'), def: 173, max: 5000, unit: '€' },
  ],
  run: (v) => {
    const r = plurime([v.a, v.b]);
    return { head: [T(l, 'Importo unico', 'Single amount'), soldi(r.applicato, l)], rows: [[T(l, 'Somma delle due', 'Sum of both'), soldi(r.somma, l)], [T(l, 'La più grave + un terzo', 'Most serious + one third'), soldi(r.cumulo, l)]], note: T(l, 'Solo per violazioni dello stesso ente, sulle sue strade.', 'Only for offences by the same body, on its own roads.') };
  },
});
