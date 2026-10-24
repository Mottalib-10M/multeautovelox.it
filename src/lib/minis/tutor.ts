/** Tutor : distanza tra i portali e tempo → velocità media, poi riduzione e fascia sul limite di 130. */
import { T, type L } from './_kit';
import { kmh, pts, soldi } from './_mv';
import { velocita, velocitaMedia } from '../engine/index';
import type { MiniSpec } from '../mini-types';
export default (l: L): MiniSpec => ({
  title: T(l, 'Velocità media tra due portali del tutor', 'Average speed between two tutor gantries'),
  cta: T(l, 'Calcolo completo con minuti e secondi', 'Full calculation with minutes and seconds'),
  inputs: [
    { id: 'k', label: T(l, 'Distanza', 'Distance'), def: 10, max: 200, unit: 'km', decimals: 1 },
    { id: 's', label: T(l, 'Tempo impiegato', 'Time taken'), def: 260, max: 7200, unit: T(l, 'secondi', 'seconds') },
  ],
  run: (v) => {
    const m = velocitaMedia(v.k, v.s);
    const s = velocita({ limite: 130, rilevata: m });
    return {
      head: [T(l, 'Velocità media', 'Average speed'), kmh(m, l)],
      rows: [
        [T(l, 'Dopo la riduzione', 'After the reduction'), kmh(s.accertata, l)],
        [T(l, 'Multa su un limite di 130', 'Fine on a 130 limit'), s.infrazione ? soldi(s.minimo, l) : T(l, 'nessuna', 'none')],
        [T(l, 'Punti', 'Points'), pts(s.punti, l)],
      ],
    };
  },
});
