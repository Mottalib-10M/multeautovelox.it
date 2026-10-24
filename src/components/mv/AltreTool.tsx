/**
 * Altre infrazioni (telefono, cinture, semaforo rosso, segnaletica, sosta, ZTL, alcol, autostrada) :
 * importo entro 5 e 60 giorni, metà del massimo se non si paga, punti (tabella art. 126-bis), sospensione.
 * Données : src/data/params-2026.json (other_violations), relues sur Normattiva.
 */
import { useEffect, useMemo, useState } from 'react';
import SelectField from '../ui/SelectField';
import Toggle from '../ui/Toggle';
import { Shell, Head, Rows, Note, MethodLink, Row2 } from '../calc/kit';
import { altra } from '../../lib/engine/index';
import { P } from '../../lib/engine/params';
import { readParams, updateURL } from '../../lib/url-state';
import { T, eur, durata, punti as pts, type L } from './common';

export const INFRAZIONI: Record<string, { it: string; en: string }> = {
  cellulare: { it: 'Telefono in mano alla guida', en: 'Phone in hand while driving' },
  cintura: { it: 'Cintura non allacciata', en: 'Seat belt not worn' },
  semaforo_rosso: { it: 'Passaggio con il rosso', en: 'Running a red light' },
  segnaletica: { it: 'Segnale stradale non rispettato', en: 'Ignoring a road sign' },
  divieto_sosta_comunale: { it: 'Sosta vietata dal comune (cartello o ordinanza)', en: 'Parking against a local council rule (sign or order)' },
  sosta_158_c6: { it: 'Sosta davanti a un passo carrabile o in doppia fila', en: 'Parking across a driveway or double-parking' },
  sosta_vietata_158: { it: 'Sosta su marciapiede, strisce o pista ciclabile', en: 'Parking on a pavement, crossing or cycle lane' },
  sosta_158_5bis: { it: 'Sosta alla fermata del bus o in corsia preferenziale', en: 'Parking at a bus stop or in a bus lane' },
  sosta_158_4bis: { it: 'Sosta sul posto riservato ai disabili', en: 'Parking in a disabled bay' },
  ztl_corsie: { it: 'Ingresso in ZTL o area pedonale', en: 'Entering a ZTL or pedestrian zone' },
  alcol_05_08: { it: 'Alcol tra 0,5 e 0,8 g/l', en: 'Alcohol 0.5 to 0.8 g/l' },
  autostrada_contromano_retromarcia: { it: 'Retromarcia in autostrada', en: 'Reversing on a motorway' },
};
const ORDINE = Object.keys(INFRAZIONI);

export interface AltreProps { lang: L; id?: string; defaultId?: string; solo?: string[]; methodHref?: string }

export default function AltreTool({ lang: l, id = 'altre', defaultId = 'cellulare', solo, methodHref }: AltreProps) {
  const lista = solo && solo.length ? solo : ORDINE;
  const [inf, setInf] = useState(defaultId);
  const [neo, setNeo] = useState(false);
  const [rec, setRec] = useState(false);
  const [notte, setNotte] = useState(false);
  const [moto, setMoto] = useState(false);
  useEffect(() => { const u = readParams(window.location.search); const x = u.get('i'); if (x && lista.includes(x)) setInf(x); }, []);
  useEffect(() => { updateURL({ i: inf }); }, [inf]);
  const def = P.other_violations.find((x) => x.id === inf)!;
  const hasRepeat = 'repeat' in def && !!def.repeat;
  const hasNight = 'night' in def && !!def.night;
  const hasMoto = 'min_moto' in def;
  const r = useMemo(() => altra(inf, { neopatentato: neo, recidiva: hasRepeat && rec, notte: hasNight && notte, moto: hasMoto && moto }), [inf, neo, rec, notte, moto, hasRepeat, hasNight, hasMoto]);
  const sn = (b: boolean) => (b ? '1' : '0');
  const yn = [{ value: '0', label: T(l, 'No', 'No') }, { value: '1', label: T(l, 'Sì', 'Yes') }];
  const secondo = hasRepeat ? <Toggle id={`${id}-rec`} label={T(l, 'Seconda volta in 2 anni', 'Second time in 2 years')} value={sn(rec)} onChange={(x) => setRec(x === '1')} options={yn} />
    : hasNight ? <Toggle id={`${id}-notte`} label={T(l, 'Tra le 22 e le 7', 'Between 22:00 and 07:00')} value={sn(notte)} onChange={(x) => setNotte(x === '1')} options={yn} />
    : hasMoto ? <Toggle id={`${id}-moto`} label={T(l, 'Veicolo', 'Vehicle')} value={sn(moto)} onChange={(x) => setMoto(x === '1')} options={[{ value: '0', label: T(l, 'Auto', 'Car') }, { value: '1', label: T(l, 'Moto', 'Bike') }]} />
    : <p className="self-end pb-3 text-sm text-navy-600">{def.ref}</p>;
  const form = (
    <>
      <SelectField id={`${id}-inf`} label={T(l, 'Infrazione', 'Offence')} value={inf} onChange={(x) => { setInf(x); setRec(false); setNotte(false); setMoto(false); }} options={lista.map((k) => ({ value: k, label: INFRAZIONI[k][l] }))} />
      <Row2>
        <Toggle id={`${id}-neo`} label={T(l, 'Patente da meno di 3 anni', 'Licence under 3 years')} value={sn(neo)} onChange={(x) => setNeo(x === '1')} options={yn} />
        {secondo}
      </Row2>
      <Note>{T(l, `Norma applicata: ${def.ref} del Codice della Strada. Importi in vigore nel 2026 (aggiornamento ISTAT sospeso fino al 31 dicembre 2026).`, `Rule applied: ${def.ref} of the Italian Highway Code. Amounts in force in 2026 (index-linking suspended until 31 December 2026).`)}</Note>
    </>
  );
  const head = r.ridotto !== null
    ? <Head label={T(l, 'Da pagare entro 5 giorni', 'To pay within 5 days')} value={eur(r.ridotto, l)} sub={T(l, `${eur(r.minimo, l)} entro 60 giorni · ${pts(r.punti, l)}`, `${eur(r.minimo, l)} within 60 days · ${pts(r.punti, l)}`)} />
    : <Head label={T(l, 'Da pagare entro 60 giorni', 'To pay within 60 days')} value={eur(r.minimo, l)} sub={T(l, `niente sconto del 30% · ${pts(r.punti, l)}`, `no 30% discount · ${pts(r.punti, l)}`)} />;
  const rows: Array<[string, string] | [string, string, boolean]> = [];
  if (r.ridotto !== null) rows.push([T(l, 'Entro 5 giorni (−30%)', 'Within 5 days (−30%)'), eur(r.ridotto, l), true]);
  rows.push([T(l, 'Entro 60 giorni (minimo)', 'Within 60 days (minimum)'), eur(r.minimo, l)]);
  rows.push([T(l, 'Massimo previsto', 'Maximum set by law'), eur(r.massimo, l)]);
  rows.push([T(l, 'Se non paghi né fai ricorso', 'If you neither pay nor appeal'), T(l, `${eur(r.metaMassimo, l)} + spese`, `${eur(r.metaMassimo, l)} + costs`)]);
  rows.push([T(l, 'Punti decurtati', 'Points deducted'), String(r.punti), true]);
  rows.push([T(l, 'Sospensione della patente', 'Licence suspension'), durata(r.sospensione, l)]);
  const result = <>{head}<Rows rows={rows} /><MethodLink href={methodHref} lang={l} /></>;
  return <Shell id={id} form={form} result={result} />;
}
