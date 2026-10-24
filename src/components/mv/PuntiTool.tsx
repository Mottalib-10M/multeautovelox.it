/**
 * Patente a punti : solde après une ou plusieurs infractions (tableau de l'art. 126-bis, en vigueur depuis
 * le 12-4-2025), doublement pour les trois premières années, plafond de 15 points pour des infractions
 * relevées ensemble (c.1-bis), retour à 20 points après deux ans sans infraction (c.5), cours de 6 points (c.4).
 * Premier rendu : date du build (prop `today`) ; la date du jour n'est lue qu'après hydratation (§17.5).
 */
import { useEffect, useMemo, useState } from 'react';
import NumberField from '../ui/NumberField';
import SelectField from '../ui/SelectField';
import Toggle from '../ui/Toggle';
import { Shell, Head, Rows, Note, MethodLink, Row2 } from '../calc/kit';
import { cumulati, addDays } from '../../lib/engine/index';
import { P } from '../../lib/engine/params';
import { displayDate } from '../../lib/format';
import { readParams, updateURL } from '../../lib/url-state';
import TAB from '../../data/tabella-punti.json';
import { T, punti as pts, type L } from './common';

const RIGHE = TAB.righe.map((r, i) => ({ ...r, key: String(i) }));
/** Infractions du tableau qui entraînent aussi une suspension : le plafond de 15 points ne joue pas (c.1-bis). */
const CON_SOSP = (r: (typeof RIGHE)[number]) => (r.articolo === '142' && /9/.test(r.comma)) || ['186', '187'].includes(r.articolo) || (r.articolo === '173' && /3-bis/.test(r.comma));
const label = (r: (typeof RIGHE)[number], l: L) => `Art. ${r.articolo} ${r.comma.replace(/^Comm[ai] /i, 'c. ')} · ${l === 'en' ? r.rubrica_en : r.rubrica} (${r.punti})`;
const find = (art: string, comma: RegExp) => RIGHE.find((r) => r.articolo === art && comma.test(r.comma))?.key ?? '';

export interface PuntiProps { lang: L; id?: string; today: string; mode?: 'saldo' | 'cumulo' | 'recupero'; defaultAttuali?: number; defaultA?: string; defaultB?: string; methodHref?: string }

export default function PuntiTool({ lang: l, id = 'punti', today, mode = 'saldo', defaultAttuali = 20, defaultA, defaultB, methodHref }: PuntiProps) {
  const dA = defaultA ?? find('142', /^Comma 8$/);
  const dB = defaultB ?? (mode === 'cumulo' ? find('173', /primo periodo/) : '');
  const [attuali, setAttuali] = useState(defaultAttuali);
  const [a, setA] = useState(dA);
  const [b, setB] = useState(dB);
  const [c, setC] = useState(mode === 'cumulo' ? find('146', /^Comma 3$/) : '');
  const [neo, setNeo] = useState(false);
  const [insieme, setInsieme] = useState(mode === 'cumulo');
  const [oggi, setOggi] = useState(today);
  useEffect(() => {
    const d = new Date();
    setOggi(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
    const u = readParams(window.location.search);
    const n = Number(u.get('p')); if (u.has('p') && Number.isFinite(n)) setAttuali(n);
    for (const [k, set] of [['a', setA], ['b', setB], ['c', setC]] as const) { const x = u.get(k); if (x !== null && (x === '' || RIGHE[Number(x)])) set(x); }
    if (u.get('neo') === '1') setNeo(true);
  }, []);
  useEffect(() => { updateURL({ p: attuali, a, b: b || undefined, c: c || undefined, neo: neo ? 1 : undefined }); }, [attuali, a, b, c, neo]);

  const scelte = [a, b, c].filter(Boolean).map((k) => RIGHE[Number(k)]);
  const fattore = neo ? P.points.neopatentato_doubling.factor : 1;
  const singoli = scelte.map((r) => r.punti * fattore);
  const sosp = scelte.some(CON_SOSP);
  const tolti = useMemo(() => (insieme && scelte.length > 1 ? cumulati(singoli, sosp) : singoli.reduce((x, y) => x + y, 0)), [insieme, singoli.join(','), sosp]);
  const somma = singoli.reduce((x, y) => x + y, 0);
  const nuovo = attuali - tolti;
  const tag = l === 'en' ? 'en-GB' : 'it-IT';
  const rientro = addDays(oggi, 730);
  const opts = [{ value: '', label: T(l, 'nessuna', 'none') }, ...RIGHE.map((r) => ({ value: r.key, label: label(r, l) }))];

  const form = (
    <>
      <Row2>
        <NumberField id={`${id}-p`} label={T(l, 'Punti attuali', 'Current points')} value={attuali} onChange={setAttuali} max={30} help={T(l, 'Saldo sul Portale dell’automobilista', 'Balance on the Portale dell’automobilista')} />
        <Toggle id={`${id}-neo`} label={T(l, 'Patente da meno di 3 anni', 'Licence under 3 years')} value={neo ? '1' : '0'} onChange={(x) => setNeo(x === '1')} options={[{ value: '0', label: T(l, 'No', 'No') }, { value: '1', label: T(l, 'Sì', 'Yes') }]} />
      </Row2>
      <SelectField id={`${id}-a`} label={T(l, 'Infrazione', 'Offence')} value={a} onChange={setA} options={opts.slice(1)} />
      <Row2>
        <SelectField id={`${id}-b`} label={T(l, 'Seconda infrazione', 'Second offence')} value={b} onChange={setB} options={opts} />
        <SelectField id={`${id}-c`} label={T(l, 'Terza infrazione', 'Third offence')} value={c} onChange={setC} options={opts} />
      </Row2>
      {scelte.length > 1 && <Toggle id={`${id}-ins`} label={T(l, 'Contestate nello stesso momento', 'Recorded at the same time')} value={insieme ? '1' : '0'} onChange={(x) => setInsieme(x === '1')} options={[{ value: '0', label: T(l, 'No', 'No') }, { value: '1', label: T(l, 'Sì', 'Yes') }]} />}
    </>
  );
  const head = nuovo <= 0
    ? <Head label={T(l, 'Punti esauriti', 'No points left')} value="0" sub={T(l, 'Revisione: nuovo esame di teoria e di guida (art. 126-bis c. 6)', 'Re-examination: theory and driving test again (art. 126-bis para. 6)')} />
    : <Head label={T(l, 'Punti dopo la decurtazione', 'Points after the deduction')} value={String(nuovo)} sub={T(l, `${tolti} punti tolti su ${attuali}`, `${tolti} points taken off ${attuali}`)} />;
  const rows: Array<[string, string] | [string, string, boolean]> = scelte.map((r, i) => [label(r, l), neo ? T(l, `${r.punti} × 2 = ${singoli[i]}`, `${r.punti} × 2 = ${singoli[i]}`) : String(singoli[i])]);
  if (scelte.length > 1) rows.push([T(l, 'Totale decurtato', 'Total deducted'), insieme && !sosp && somma > P.points.max_simultaneous ? T(l, `${tolti} (tetto di ${P.points.max_simultaneous}, invece di ${somma})`, `${tolti} (capped at ${P.points.max_simultaneous}, not ${somma})`) : String(tolti), true]);
  if (nuovo > 0) {
    rows.push([T(l, 'Ritorno a 20 punti senza altre infrazioni', 'Back to 20 points with no new offence'), T(l, `dal ${displayDate(rientro, tag)}`, `from ${displayDate(rientro, tag)}`)]);
    rows.push([T(l, 'Con un corso di recupero', 'With a recovery course'), T(l, `${Math.min(nuovo + P.points.recovery_course.points, Math.max(20, attuali))} punti (+${P.points.recovery_course.points})`, `${Math.min(nuovo + P.points.recovery_course.points, Math.max(20, attuali))} points (+${P.points.recovery_course.points})`)]);
  }
  const result = <>{head}<Rows rows={rows} /><Note>{T(l, `I punti si tolgono quando la multa è definitiva (pagata, o ricorso respinto). Il ritorno a 20 punti conta due anni dall’ultima decurtazione${sosp && insieme ? '; con una sospensione il tetto di 15 punti non vale' : ''}.`, `Points come off when the fine becomes final (paid, or appeal rejected). The return to 20 counts two years from the last deduction${sosp && insieme ? '; with a suspension the 15-point cap does not apply' : ''}.`)}</Note><MethodLink href={methodHref} lang={l} /></>;
  return <Shell id={id} form={form} result={result} />;
}
