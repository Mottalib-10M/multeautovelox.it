/** Più infrazioni contestate insieme : al massimo 15 punti, salvo sospensione (art. 126-bis c.1-bis). */
import { T, type L } from './_kit';
import { yn } from './_mv';
import { cumulati } from '../engine/index';
import type { MiniSpec } from '../mini-types';
export default (l: L): MiniSpec => ({
  title: T(l, 'Più infrazioni nello stesso momento', 'Several offences at the same time'),
  cta: T(l, 'Scegli le infrazioni dalla tabella', 'Pick the offences from the table'),
  inputs: [
    { id: 'a', label: T(l, 'Punti della prima', 'Points for the first'), def: 10, max: 20 },
    { id: 'b', label: T(l, 'Punti della seconda', 'Points for the second'), def: 8, max: 20 },
    { id: 's', label: T(l, 'Una comporta la sospensione', 'One carries a suspension'), def: 0, options: yn(l) },
  ],
  run: (v) => {
    const t = cumulati([v.a, v.b], v.s === 1);
    return { head: [T(l, 'Punti tolti in tutto', 'Total points taken'), String(t)], rows: [[T(l, 'Somma', 'Sum'), String(v.a + v.b)], [T(l, 'Tetto di 15 punti', '15-point cap'), v.s === 1 ? T(l, 'non vale', 'does not apply') : t < v.a + v.b ? T(l, 'applicato', 'applied') : T(l, 'non raggiunto', 'not reached')]] };
  },
});
