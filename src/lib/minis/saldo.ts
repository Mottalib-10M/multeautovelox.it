/** Saldo punti dopo una decurtazione (art. 126-bis). */
import { T, type L } from './_kit';
import { saldo } from '../engine/index';
import type { MiniSpec } from '../mini-types';
export default (l: L): MiniSpec => ({
  title: T(l, 'Quanti punti mi restano', 'How many points I have left'),
  cta: T(l, 'Calcolo con la tabella completa', 'Calculation with the full table'),
  inputs: [
    { id: 'p', label: T(l, 'Punti attuali', 'Current points'), def: 20, max: 30 },
    { id: 't', label: T(l, 'Punti dell’infrazione', 'Points for the offence'), def: 5, max: 30 },
  ],
  run: (v) => {
    const s = saldo(v.p, v.t);
    return {
      head: [T(l, 'Punti rimasti', 'Points left'), String(s.nuovo)],
      rows: [[T(l, 'Revisione della patente', 'Licence re-examination'), s.revisione ? T(l, 'sì, a zero punti', 'yes, at zero points') : 'No'], [T(l, 'Con un corso di aggiornamento (+6)', 'With a refresher course (+6)'), s.nuovo > 0 ? String(s.nuovo + 6) : T(l, 'non ammesso a zero punti', 'not allowed at zero points')]],
    };
  },
});
