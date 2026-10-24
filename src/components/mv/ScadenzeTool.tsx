/**
 * Date e importi di un verbale : notifica entro 90 giorni (360 all'estero), sconto del 30 % entro 5 giorni,
 * minimo entro 60, ricorso al prefetto (60 giorni) o al giudice di pace (30, o 60 dall'estero), metà del
 * massimo se non si fa nulla. Art. 201, 202, 203, 204-bis CdS ; art. 7 D.Lgs. 150/2011.
 * Premier rendu : dates du build (prop `today`) ; la date du jour n'est lue qu'après hydratation (§17.5).
 */
import { useEffect, useMemo, useState } from 'react';
import SelectField from '../ui/SelectField';
import Toggle from '../ui/Toggle';
import { Shell, Head, Rows, Note, MethodLink, Row2 } from '../calc/kit';
import { scadenze, altra, addDays, daysBetween } from '../../lib/engine/index';
import { P } from '../../lib/engine/params';
import { displayDate } from '../../lib/format';
import { readParams, updateURL } from '../../lib/url-state';
import { T, eur, BAND_LABEL, type L } from './common';
import { INFRAZIONI } from './AltreTool';

type Fatt = { id: string; label: { it: string; en: string }; min: number; max: number; ridotto: boolean };
const FATTI: Fatt[] = [
  ...P.speeding.bands.map((b) => ({ id: b.id, label: { it: `Velocità: ${BAND_LABEL[b.id].it}`, en: `Speeding: ${BAND_LABEL[b.id].en}` }, min: b.min, max: b.max, ridotto: !b.suspension })),
  ...P.other_violations.filter((v) => INFRAZIONI[v.id]).map((v) => { const r = altra(v.id); return { id: v.id, label: INFRAZIONI[v.id], min: r.minimo, max: r.massimo, ridotto: r.ridotto !== null }; }),
];

export interface ScadenzeProps { lang: L; id?: string; today: string; mode?: 'ricorso' | 'pagamento' | 'nonpagata'; defaultFatto?: string; defaultGiorniDopo?: number; defaultEstero?: boolean; methodHref?: string }

function DateField({ id, label, value, onChange, help }: { id: string; label: string; value: string; onChange: (v: string) => void; help?: string }) {
  return (
    <div className="grid grid-rows-subgrid row-span-3 gap-1">
      <label htmlFor={id} className="text-sm font-medium text-navy-800">{label}</label>
      <input id={id} type="date" value={value} onChange={(e) => e.target.value && onChange(e.target.value)} className="h-12 w-full rounded-lg border border-navy-300 bg-white px-3 text-navy-900 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-200" />
      {help ? <p className="text-xs text-navy-600">{help}</p> : <span />}
    </div>
  );
}

export default function ScadenzeTool({ lang: l, id = 'scadenze', today, mode = 'ricorso', defaultFatto = 'c8', defaultGiorniDopo = 40, defaultEstero = false, methodHref }: ScadenzeProps) {
  const [oggi, setOggi] = useState(today);
  const [inf, setInf] = useState(addDays(today, -defaultGiorniDopo - 7));
  const [not, setNot] = useState(addDays(today, -7));
  const [estero, setEstero] = useState(defaultEstero);
  const [fatto, setFatto] = useState(defaultFatto);
  useEffect(() => {
    const d = new Date();
    const t = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const u = readParams(window.location.search);
    const iso = (k: string) => { const x = u.get(k); return x && /^\d{4}-\d{2}-\d{2}$/.test(x) ? x : null; };
    setOggi(t);
    if (iso('i') && iso('n')) { setInf(iso('i')!); setNot(iso('n')!); }
    else if (t !== today) { setInf(addDays(t, -defaultGiorniDopo - 7)); setNot(addDays(t, -7)); }
    const f = u.get('f'); if (f && FATTI.some((x) => x.id === f)) setFatto(f);
    if (u.get('e') === '1') setEstero(true);
  }, []);
  useEffect(() => { updateURL({ i: inf, n: not, f: fatto, e: estero ? 1 : undefined }); }, [inf, not, fatto, estero]);

  const s = useMemo(() => scadenze(inf, not, estero), [inf, not, estero]);
  const f = FATTI.find((x) => x.id === fatto)!;
  const tag = l === 'en' ? 'en-GB' : 'it-IT';
  const d = (iso: string) => displayDate(iso, tag);
  const rest = (iso: string) => { const n = daysBetween(oggi, iso); return n < 0 ? T(l, 'scaduto', 'passed') : n === 0 ? T(l, 'oggi', 'today') : T(l, `tra ${n} giorni`, `in ${n} days`); };
  const ridotto = f.ridotto ? Math.round(f.min * (1 - P.payment.reduction) * 100) / 100 : null;
  const meta = Math.round(f.max * P.unpaid.fraction_of_max * 100) / 100;
  const giorni = daysBetween(not, oggi);
  const ordine = notOrder(inf, not);

  const form = (
    <>
      <SelectField id={`${id}-f`} label={T(l, 'Infrazione sul verbale', 'Offence on the fine')} value={fatto} onChange={setFatto} options={FATTI.map((x) => ({ value: x.id, label: x.label[l] }))} />
      <Row2>
        <DateField id={`${id}-i`} label={T(l, 'Data dell’infrazione', 'Date of the offence')} value={inf} onChange={setInf} />
        <DateField id={`${id}-n`} label={T(l, 'Data della notifica', 'Date it was served')} value={not} onChange={setNot} help={T(l, 'Ritiro della raccomandata o PEC', 'Registered letter collected or PEC')} />
      </Row2>
      <Toggle id={`${id}-e`} label={T(l, 'Residente all’estero', 'Living outside Italy')} value={estero ? '1' : '0'} onChange={(x) => setEstero(x === '1')} options={[{ value: '0', label: T(l, 'No', 'No') }, { value: '1', label: T(l, 'Sì', 'Yes') }]} />
      {!ordine && <Note>{T(l, 'La notifica non può precedere l’infrazione: controlla le due date.', 'Service cannot come before the offence: check both dates.')}</Note>}
    </>
  );

  const head = mode === 'pagamento'
    ? (ridotto !== null
      ? <Head label={T(l, `Sconto del 30%: ${eur(ridotto, l)} fino al`, `30% discount: ${eur(ridotto, l)} until`)} value={d(s.pagamentoRidottoEntro)} sub={rest(s.pagamentoRidottoEntro)} />
      : <Head label={T(l, `Niente sconto: ${eur(f.min, l)} entro il`, `No discount: ${eur(f.min, l)} by`)} value={d(s.pagamentoMinimoEntro)} sub={rest(s.pagamentoMinimoEntro)} />)
    : mode === 'nonpagata'
      ? <Head label={giorni > P.payment.within_days_minimum ? T(l, 'Ora si deve', 'Now owed') : T(l, 'Se lasci passare i 60 giorni', 'If you let the 60 days pass')} value={eur(meta, l)} sub={T(l, `metà del massimo (${eur(f.max, l)}) più le spese di notifica e procedimento`, `half the maximum (${eur(f.max, l)}) plus service and procedure costs`)} />
      : <Head label={T(l, 'Ricorso al giudice di pace entro il', 'Appeal to the giudice di pace by')} value={d(s.ricorsoGiudiceEntro)} sub={T(l, `al prefetto entro il ${d(s.ricorsoPrefettoEntro)}`, `to the prefetto by ${d(s.ricorsoPrefettoEntro)}`)} />;

  const rows: Array<[string, string] | [string, string, boolean]> = [
    [T(l, `Notifica entro ${estero ? P.notification.days_abroad : P.notification.days} giorni`, `Service within ${estero ? P.notification.days_abroad : P.notification.days} days`), s.notificaOltreTermine ? T(l, `oltre il termine (${s.giorniTraInfrazioneENotifica} giorni)`, `late (${s.giorniTraInfrazioneENotifica} days)`) : T(l, `rispettata (${s.giorniTraInfrazioneENotifica} giorni)`, `on time (${s.giorniTraInfrazioneENotifica} days)`), s.notificaOltreTermine],
  ];
  if (ridotto !== null) rows.push([T(l, `${eur(ridotto, l)} (−30%) fino al`, `${eur(ridotto, l)} (−30%) until`), `${d(s.pagamentoRidottoEntro)} · ${rest(s.pagamentoRidottoEntro)}`]);
  rows.push([T(l, `${eur(f.min, l)} fino al`, `${eur(f.min, l)} until`), `${d(s.pagamentoMinimoEntro)} · ${rest(s.pagamentoMinimoEntro)}`]);
  rows.push([T(l, 'Ricorso al prefetto entro', 'Appeal to the prefetto by'), `${d(s.ricorsoPrefettoEntro)} · ${rest(s.ricorsoPrefettoEntro)}`]);
  rows.push([T(l, 'Ricorso al giudice di pace entro', 'Appeal to the giudice di pace by'), `${d(s.ricorsoGiudiceEntro)} · ${rest(s.ricorsoGiudiceEntro)}`]);
  rows.push([T(l, 'Dopo il 60° giorno senza pagare né ricorrere', 'After day 60 with no payment or appeal'), T(l, `${eur(meta, l)} + spese`, `${eur(meta, l)} + costs`)]);
  const result = <>{head}<Rows rows={rows} /><Note>{T(l, 'Giorni di calendario contati dal giorno dopo la notifica. Il calcolo non sposta le scadenze che cadono in un festivo: per il giudice di pace vale la proroga al primo giorno non festivo (art. 155 c.p.c.); per pagare, meglio non aspettare l’ultimo giorno.', 'Calendar days counted from the day after service. The tool does not move deadlines that fall on a public holiday: for the giudice di pace the term runs to the next working day (art. 155 of the civil procedure code); for payment, do not wait for the last day.')}</Note><MethodLink href={methodHref} lang={l} /></>;
  return <Shell id={id} form={form} result={result} />;
}
const notOrder = (a: string, b: string) => daysBetween(a, b) >= 0;
