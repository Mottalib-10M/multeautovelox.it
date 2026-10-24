/** Limiti generali dell'art. 142 c.1, con pioggia e neopatentati (art. 117 c.2). */
import { T, type L } from './_kit';
import { kmh, yn } from './_mv';
import { limite, primaRilevataOltre } from '../engine/index';
import type { MiniSpec } from '../mini-types';
const STRADE = ['autostrada', 'extraurbana_principale', 'extraurbana_secondaria', 'urbana'] as const;
export default (l: L): MiniSpec => ({
  title: T(l, 'Il limite che vale per me', 'The limit that applies to me'),
  cta: T(l, 'Calcola la multa a questo limite', 'Work out the fine at this limit'),
  inputs: [
    { id: 's', label: T(l, 'Strada', 'Road'), def: 0, options: [T(l, 'Autostrada', 'Motorway'), T(l, 'Extraurbana principale', 'Main extra-urban road'), T(l, 'Extraurbana secondaria', 'Secondary extra-urban road'), T(l, 'Centro abitato', 'Built-up area')].map((x, i) => ({ value: String(i), label: x })) },
    { id: 'p', label: T(l, 'Pioggia o neve', 'Rain or snow'), def: 0, options: yn(l) },
    { id: 'n', label: T(l, 'Neopatentato', 'New driver'), def: 0, options: yn(l) },
  ],
  run: (v) => {
    const lim = limite(STRADE[v.s], v.p === 1, v.n === 1);
    return { head: [T(l, 'Limite generale', 'General limit'), kmh(lim, l)], rows: [[T(l, 'Prima velocità letta multata', 'First recorded speed fined'), kmh(primaRilevataOltre(lim, 0), l)], [T(l, 'Prima con punti (oltre 10 km/h)', 'First with points (over 10 km/h)'), kmh(primaRilevataOltre(lim, 10), l)]], note: T(l, 'Un cartello può fissare un limite diverso: vale quello indicato sulla strada.', 'A sign may set a different limit: the posted one applies.') };
  },
});
