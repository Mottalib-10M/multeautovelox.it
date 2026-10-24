/** Altre infrazioni : importo, punti, sospensione (art. 7, 146, 158, 172, 173, 176, 186 CdS). */
import { T, type L } from './_kit';
import { pts, soldi, sosp, yn } from './_mv';
import { altra } from '../engine/index';
import { INFRAZIONI } from '../../components/mv/AltreTool';
import type { MiniSpec } from '../mini-types';
const IDS = Object.keys(INFRAZIONI);
export default (l: L): MiniSpec => ({
  title: T(l, 'Importo e punti di un’infrazione', 'Amount and points for an offence'),
  cta: T(l, 'Calcolo completo con recidiva e notte', 'Full calculation with repeat and night'),
  inputs: [
    { id: 'i', label: T(l, 'Infrazione', 'Offence'), def: 0, options: IDS.map((k, i) => ({ value: String(i), label: INFRAZIONI[k][l] })) },
    { id: 'n', label: T(l, 'Patente da meno di 3 anni', 'Licence under 3 years'), def: 0, options: yn(l) },
  ],
  run: (v) => {
    const r = altra(IDS[v.i] ?? IDS[0], { neopatentato: v.n === 1 });
    return {
      head: r.ridotto !== null ? [T(l, 'Entro 5 giorni (−30 %)', 'Within 5 days (−30%)'), soldi(r.ridotto, l)] : [T(l, 'Entro 60 giorni', 'Within 60 days'), soldi(r.minimo, l)],
      rows: [[T(l, 'Importo minimo e massimo', 'Minimum and maximum'), `${soldi(r.minimo, l)} – ${soldi(r.massimo, l)}`], [T(l, 'Punti', 'Points'), pts(r.punti, l)], [T(l, 'Sospensione', 'Suspension'), sosp(r.sospensione, l)]],
    };
  },
});
