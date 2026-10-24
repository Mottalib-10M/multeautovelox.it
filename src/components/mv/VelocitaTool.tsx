/**
 * Eccesso di velocità → sanzione dell'art. 142. Deux façons d'entrer la vitesse :
 *  - `velocita` : la vitesse lue sur le verbal (« velocità rilevata ») et la limite du tronçon ;
 *  - `tutor`    : distance et temps entre deux portiques (vitesse moyenne, Tutor / Vergilius).
 * Le calcul vient de lib/engine (art. 142, 195 c.2-bis, 202, 203 CdS ; art. 345 du Regolamento).
 * Premier rendu = valeurs par défaut de la page ; l'URL n'est lue qu'après hydratation (RECETTE §17.5).
 */
import { useEffect, useMemo, useState } from 'react';
import NumberField from '../ui/NumberField';
import SelectField from '../ui/SelectField';
import Toggle from '../ui/Toggle';
import { Shell, Head, Rows, Note, MethodLink, Row2 } from '../calc/kit';
import { velocita, soglie, velocitaMedia } from '../../lib/engine/index';
import { P } from '../../lib/engine/params';
import { formatNumber } from '../../lib/format';
import { readParams, updateURL } from '../../lib/url-state';
import { T, eur, kmh, LIMITI, durata, punti as pts, BAND_LABEL, type L } from './common';

export interface VelocitaProps {
  lang: L; id?: string; mode?: 'velocita' | 'tutor'; methodHref?: string; seuils?: boolean;
  defaultLimite?: number; defaultRilevata?: number; defaultNotte?: boolean; defaultNeo?: boolean;
  defaultKm?: number; defaultMinuti?: number; defaultSecondi?: number; defaultMetodo?: 'dispositivo' | 'pedaggio';
}

export default function VelocitaTool({ lang: l, id = 'velocita', mode = 'velocita', methodHref, seuils = true, defaultLimite = 50, defaultRilevata = 68, defaultNotte = false, defaultNeo = false, defaultKm = 12.4, defaultMinuti = 5, defaultSecondi = 10, defaultMetodo = 'dispositivo' }: VelocitaProps) {
  const [lim, setLim] = useState(defaultLimite);
  const [v, setV] = useState(defaultRilevata);
  const [notte, setNotte] = useState(defaultNotte);
  const [neo, setNeo] = useState(defaultNeo);
  const [pesante, setPesante] = useState(false);
  const [recidiva, setRecidiva] = useState(false);
  const [metodo, setMetodo] = useState<'dispositivo' | 'pedaggio'>(defaultMetodo);
  const [km, setKm] = useState(defaultKm);
  const [mn, setMn] = useState(defaultMinuti);
  const [sec, setSec] = useState(defaultSecondi);

  useEffect(() => {
    const u = readParams(window.location.search);
    const n = (k: string) => { const x = Number(u.get(k)); return u.has(k) && Number.isFinite(x) ? x : null; };
    if (n('l') !== null && LIMITI.includes(n('l')!)) setLim(n('l')!);
    if (n('v') !== null) setV(n('v')!);
    if (u.get('n') === '1') setNotte(true);
    if (u.get('neo') === '1') setNeo(true);
    if (n('km') !== null) setKm(n('km')!);
    if (n('s') !== null) { setMn(Math.floor(n('s')! / 60)); setSec(n('s')! % 60); }
  }, []);
  const secondi = mn * 60 + sec;
  useEffect(() => { updateURL(mode === 'tutor' ? { km, s: secondi, l: lim } : { v, l: lim, n: notte ? 1 : undefined, neo: neo ? 1 : undefined }); }, [v, lim, notte, neo, km, secondi, mode]);

  const rilevata = mode === 'tutor' ? velocitaMedia(km, secondi) : v;
  const met = mode === 'tutor' ? 'dispositivo' : metodo;
  const r = useMemo(() => velocita({ limite: lim, rilevata, metodo: met, notte, neopatentato: neo, veicoloPesante: pesante, recidivaCentroAbitato: recidiva }), [lim, rilevata, met, notte, neo, pesante, recidiva]);
  const limOpts = LIMITI.map((x) => ({ value: String(x), label: kmh(x, l) }));
  const sn = (b: boolean) => (b ? '1' : '0');
  const yn = [{ value: '0', label: T(l, 'No', 'No') }, { value: '1', label: T(l, 'Sì', 'Yes') }];

  const form = (
    <>
      {mode === 'tutor' ? (
        <>
          <Row2>
            <NumberField id={`${id}-km`} label={T(l, 'Distanza tra i portali', 'Distance between gantries')} value={km} onChange={setKm} unit="km" decimals={1} max={200} />
            <SelectField id={`${id}-lim`} label={T(l, 'Limite sul tratto', 'Limit on the stretch')} value={String(lim)} onChange={(x) => setLim(Number(x))} options={limOpts} />
          </Row2>
          <Row2>
            <NumberField id={`${id}-mn`} label={T(l, 'Tempo: minuti', 'Time: minutes')} value={mn} onChange={setMn} unit="min" max={600} />
            <NumberField id={`${id}-sec`} label={T(l, 'e secondi', 'and seconds')} value={sec} onChange={setSec} unit="s" max={59} />
          </Row2>
          <Note>{T(l, `Velocità media: ${kmh(rilevata, l)}. Poi si toglie la riduzione dell’art. 345 (${formatNumber(P.tolerance.percent * 100, 0, l)}%, almeno ${P.tolerance.min_kmh} km/h).`, `Average speed: ${kmh(rilevata, l)}. The article 345 reduction (${formatNumber(P.tolerance.percent * 100, 0, l)}%, at least ${P.tolerance.min_kmh} km/h) is then subtracted.`)}</Note>
        </>
      ) : (
        <>
          <Row2>
            <NumberField id={`${id}-v`} label={T(l, 'Velocità rilevata (verbale)', 'Speed recorded (on the fine)')} value={v} onChange={setV} unit="km/h" decimals={0} max={400} />
            <SelectField id={`${id}-lim`} label={T(l, 'Limite del tratto', 'Speed limit')} value={String(lim)} onChange={(x) => setLim(Number(x))} options={limOpts} />
          </Row2>
          <Row2>
            <Toggle id={`${id}-notte`} label={T(l, 'Tra le 22 e le 7', 'Between 22:00 and 07:00')} value={sn(notte)} onChange={(x) => setNotte(x === '1')} options={yn} />
            <Toggle id={`${id}-neo`} label={T(l, 'Patente da meno di 3 anni', 'Licence under 3 years')} value={sn(neo)} onChange={(x) => setNeo(x === '1')} options={yn} />
          </Row2>
        </>
      )}
      <details className="rounded-lg border border-navy-200 px-3 py-2 text-sm">
        <summary className="cursor-pointer font-medium text-navy-800">{T(l, 'Altri casi: mezzo pesante, recidiva in città, velocità dai biglietti autostradali', 'Other cases: heavy vehicle, repeat in town, speed from motorway tickets')}</summary>
        <div className="mt-3 space-y-4">
          <Row2>
            <Toggle id={`${id}-pes`} label={T(l, 'Mezzo pesante (c. 11)', 'Heavy vehicle (para. 11)')} value={sn(pesante)} onChange={(x) => setPesante(x === '1')} options={yn} />
            <Toggle id={`${id}-rec`} label={T(l, '2ª volta in città in un anno', '2nd time in town in a year')} value={sn(recidiva)} onChange={(x) => setRecidiva(x === '1')} options={yn} />
          </Row2>
          {mode === 'velocita' && <Toggle id={`${id}-met`} label={T(l, 'Velocità ricavata da', 'Speed worked out from')} value={metodo} onChange={(x) => setMetodo(x as 'dispositivo' | 'pedaggio')} options={[{ value: 'dispositivo', label: T(l, 'Velox', 'Device') }, { value: 'pedaggio', label: T(l, 'Biglietti', 'Tickets') }]} />}
        </div>
      </details>
    </>
  );

  const head = !r.infrazione
    ? <Head label={T(l, 'Nessuna multa per velocità', 'No speeding fine')} value={eur(0, l)} sub={T(l, `Velocità accertata ${kmh(r.accertata, l)} su un limite di ${kmh(lim, l)}`, `Speed held ${kmh(r.accertata, l)} for a ${kmh(lim, l)} limit`)} />
    : r.ridotto !== null
      ? <Head label={T(l, 'Da pagare entro 5 giorni', 'To pay within 5 days')} value={eur(r.ridotto, l)} sub={T(l, `${eur(r.minimo, l)} entro 60 giorni · ${pts(r.punti, l)}`, `${eur(r.minimo, l)} within 60 days · ${pts(r.punti, l)}`)} />
      : <Head label={T(l, 'Da pagare entro 60 giorni', 'To pay within 60 days')} value={eur(r.minimo, l)} sub={T(l, `niente sconto del 30% (sospensione) · ${pts(r.punti, l)}`, `no 30% discount (suspension) · ${pts(r.punti, l)}`)} />;

  const rows: Array<[string, string] | [string, string, boolean]> = [
    [T(l, `Velocità accertata (−${formatNumber(r.riduzioneKmh, Number.isInteger(r.riduzioneKmh) ? 0 : 2, l)} km/h)`, `Speed held (−${formatNumber(r.riduzioneKmh, Number.isInteger(r.riduzioneKmh) ? 0 : 2, l)} km/h)`), kmh(r.accertata, l)],
  ];
  if (r.infrazione && r.band) {
    rows.push([T(l, 'Eccesso oltre il limite', 'Over the limit by'), kmh(r.eccesso, l)]);
    rows.push([T(l, 'Fascia', 'Band'), `${r.band.ref} · ${BAND_LABEL[r.band.id][l]}`]);
    if (r.ridotto !== null) rows.push([T(l, 'Entro 5 giorni (−30%)', 'Within 5 days (−30%)'), eur(r.ridotto, l), true]);
    rows.push([T(l, 'Entro 60 giorni (minimo)', 'Within 60 days (minimum)'), eur(r.minimo, l)]);
    rows.push([T(l, 'Se non paghi né fai ricorso', 'If you neither pay nor appeal'), T(l, `${eur(r.metaMassimo, l)} + spese`, `${eur(r.metaMassimo, l)} + costs`)]);
    rows.push([T(l, 'Punti decurtati', 'Points deducted'), String(r.punti), true]);
    rows.push([T(l, 'Sospensione della patente', 'Licence suspension'), durata(r.sospensione, l)]);
    if (notte) rows.push([T(l, 'Aumento notturno (art. 195)', 'Night-time surcharge (art. 195)'), T(l, '+ un terzo', '+ one third')]);
  }
  const result = <>{head}<Rows rows={rows} /><MethodLink href={methodHref} lang={l} /></>;

  const tab = seuils ? soglie(lim, met) : [];
  return (
    <div>
      <Shell id={id} form={form} result={result} />
      {tab.length > 0 && (
        <div data-chrome className="not-prose mt-4 overflow-x-auto rounded-xl border border-navy-200">
          <p className="border-b border-navy-200 bg-navy-50 px-4 py-2 text-sm font-semibold text-navy-900">{T(l, `Limite ${kmh(lim, l)}: la velocità letta sul verbale e la fascia`, `${kmh(lim, l)} limit: the speed on the fine and the band`)}</p>
          <table className="w-full text-sm">
            <thead><tr className="text-left text-navy-700">
              <th scope="col" className="px-3 py-2 font-semibold">{T(l, 'Velocità rilevata', 'Speed recorded')}</th>
              <th scope="col" className="px-3 py-2 font-semibold">{T(l, 'Fascia', 'Band')}</th>
              <th scope="col" className="px-3 py-2 text-right font-semibold">{T(l, 'Entro 60 giorni', 'Within 60 days')}</th>
              <th scope="col" className="px-3 py-2 text-right font-semibold">{T(l, 'Punti', 'Points')}</th>
            </tr></thead>
            <tbody className="divide-y divide-navy-100">
              {tab.map((t, i) => {
                const da = i === 0 ? lim : tab[i - 1].finoA + 1;
                const band = P.speeding.bands.find((b) => b.id === t.band);
                return (
                  <tr key={t.band} className={(r.band?.id ?? 'nessuna') === t.band ? 'bg-accent-50 font-semibold' : ''}>
                    <td className="tabular-nums px-3 py-1.5">{Number.isFinite(t.finoA) ? T(l, `da ${da} a ${t.finoA} km/h`, `${da} to ${t.finoA} km/h`) : T(l, `da ${da} km/h`, `from ${da} km/h`)}</td>
                    <td className="px-3 py-1.5">{band ? band.ref : T(l, 'nessuna multa', 'no fine')}</td>
                    <td className="tabular-nums px-3 py-1.5 text-right">{band ? eur(band.min, l) : '–'}</td>
                    <td className="tabular-nums px-3 py-1.5 text-right">{band ? band.points : 0}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="px-4 py-2 text-xs text-navy-600">{T(l, 'Velocità intere lette dall’apparecchio, riduzione dell’art. 345 già tolta per trovare la fascia. Importi di giorno, senza aumento notturno.', 'Whole speeds as read by the device, with the article 345 reduction already taken off to find the band. Daytime amounts, no night surcharge.')}</p>
        </div>
      )}
    </div>
  );
}
