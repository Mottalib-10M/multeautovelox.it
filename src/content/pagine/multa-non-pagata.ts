import { defineGuide, type Helpers } from '../../lib/guide-types';

const B = (h: Helpers) => h.P.speeding.bands;
const meta = (h: Helpers, max: number) => max * h.P.unpaid.fraction_of_max;
/** Importo con i centesimi solo se servono (86,50 € ma 347 €). */
const e = (h: Helpers, n: number) => h.eur(n, Number.isInteger(Math.round(n * 100) / 100) ? 0 : 2);
const FASCE = { it: ['Eccesso fino a 10 km/h', 'Eccesso oltre 10, fino a 40 km/h', 'Eccesso oltre 40, fino a 60 km/h', 'Eccesso oltre 60 km/h'], en: ['Up to 10 km/h over', 'Over 10, up to 40 km/h over', 'Over 40, up to 60 km/h over', 'Over 60 km/h over'] };
const ALTRE: Array<{ id: string; it: string; en: string }> = [
  { id: 'cellulare', it: 'Telefono alla guida', en: 'Phone at the wheel' },
  { id: 'cintura', it: 'Cintura', en: 'Seat belt' },
  { id: 'semaforo_rosso', it: 'Semaforo rosso', en: 'Red light' },
  { id: 'divieto_sosta_comunale', it: 'Sosta vietata dal comune', en: 'Breaking a local parking rule' },
  { id: 'sosta_vietata_158', it: 'Sosta su marciapiede o strisce', en: 'Parking on a pavement or crossing' },
  { id: 'ztl_corsie', it: 'ZTL o area pedonale', en: 'ZTL or pedestrian zone' },
  { id: 'alcol_05_08', it: 'Alcol tra 0,5 e 0,8 g/l', en: 'Alcohol 0.5 to 0.8 g/l' },
];

export default defineGuide({
  id: 'multa-non-pagata',
  group: 'verbale',
  order: 3,
  tool: 'scadenze',
  outil: { mode: 'nonpagata', defaultFatto: 'c8', defaultGiorniDopo: 75 },
  related: ['multa-ridotta-30', 'ricorso-multa-autovelox', 'multa-eccesso-di-velocita', 'sanzioni-codice-della-strada', 'nuovo-codice-della-strada-multe'],
  sources: ['cds203', 'cds201', 'cds202', 'cds195', 'l177'],
  it: {
    slug: 'multa-non-pagata',
    nav: 'Multa non pagata',
    card: 'Dopo 60 giorni senza pagare né ricorrere: metà del massimo più le spese, e il verbale diventa titolo esecutivo.',
    title: 'Multa non pagata: metà del massimo dopo 60 giorni (2026)',
    description: 'Multa non pagata entro 60 giorni e senza ricorso: il verbale diventa titolo esecutivo per la metà del massimo più le spese. Importi, notifica e targhe estere.',
    h1: 'Multa non pagata: quanto diventa dopo 60 giorni',
    intro: 'Inserisci le date dell’infrazione e della notifica: il calcolo dice se i termini sono scaduti, se la notifica era in tempo e quanto si deve ora per la tua infrazione.',
    resume: (h) => `Una multa non pagata entro ${h.num(h.P.payment.within_days_minimum)} giorni dalla notifica, e non contestata con un ricorso nei termini, non resta ferma al minimo. L’articolo 203, comma 3, del Codice della Strada stabilisce che in questo caso il verbale costituisce titolo esecutivo per una somma pari alla metà del massimo della sanzione, più le spese di procedimento. Titolo esecutivo significa che l’ente non ha bisogno di altri atti per pretendere il pagamento. Per un eccesso di velocità tra 10 e 40 km/h si passa da ${h.eur(B(h)[1].min)} a ${e(h, meta(h, B(h)[1].max))}; oltre 60 km/h da ${h.eur(B(h)[3].min)} a ${e(h, meta(h, B(h)[3].max))}; per la sosta vietata dal comune da ${h.eur(h.M.altra('divieto_sosta_comunale').minimo)} a ${e(h, h.M.altra('divieto_sosta_comunale').metaMassimo)}. Prima di tutto conviene controllare la data della notifica: se il verbale è arrivato oltre ${h.num(h.P.notification.days)} giorni dall’accertamento, o oltre ${h.num(h.P.notification.days_abroad)} per chi risiede all’estero, l’obbligo di pagare si estingue verso chi non è stato raggiunto in tempo. Per i veicoli immatricolati all’estero la riscossione può rivolgersi, entro cinque anni, a chi viene trovato alla guida.`,
    faqs: (h) => [
      { q: 'Cosa succede se non pago la multa entro 60 giorni?', a: `Se nei ${h.num(h.P.payment.within_days_minimum)} giorni non hai pagato e non hai presentato ricorso, il verbale diventa titolo esecutivo per la metà del massimo più le spese di procedimento, secondo l’articolo 203, comma 3. Per un eccesso tra 10 e 40 km/h sono ${e(h, meta(h, B(h)[1].max))} invece di ${h.eur(B(h)[1].min)}. Restano i punti e le eventuali sanzioni accessorie, che non dipendono dal pagamento.` },
      { q: 'Posso ancora pagare il minimo dopo i 60 giorni?', a: `Il minimo è previsto dall’articolo 202 solo per chi paga entro ${h.num(h.P.payment.within_days_minimum)} giorni. Scaduto il termine, la somma dovuta per legge è la metà del massimo più le spese, e un versamento pari al minimo non copre l’intero debito. Se sei appena oltre la scadenza, chiedi all’ente indicato sul verbale l’importo aggiornato prima di pagare, per evitare un saldo residuo.` },
      { q: 'Una multa notificata in ritardo va pagata lo stesso?', a: `No, verso chi l’ha ricevuta in ritardo. L’articolo 201 impone la notifica entro ${h.num(h.P.notification.days)} giorni dall’accertamento, ${h.num(h.P.notification.days_abroad)} per i residenti all’estero, e al comma 5 dispone che l’obbligo di pagare si estingue per il soggetto a cui la notifica non è stata fatta nel termine. Va però fatto valere: il calcolatore confronta le date, poi serve un ricorso entro i termini.` },
      { q: 'Cosa rischia un’auto con targa straniera che non paga?', a: 'L’articolo 203, comma 3-bis, prevede che, se per difficoltà oggettive non si riesce a riscuotere dal conducente, dal proprietario o da un altro obbligato, la riscossione forzata può essere attivata nei cinque anni successivi verso chi viene trovato alla guida di quel veicolo. In quel caso si applicano le disposizioni dell’articolo 207 del Codice. La regola è stata pensata proprio per le targhe estere, difficili da raggiungere con la riscossione ordinaria.' },
    ],
    body: (h) => {
      const n = h.M.altra('semaforo_rosso', { notte: true });
      return `<h2>Cosa dice l’articolo 203, comma 3</h2>
<p>Il testo è breve: « Qualora nei termini previsti non sia stato proposto ricorso e non sia avvenuto il pagamento in misura ridotta, il verbale […] costituisce titolo esecutivo per una somma pari alla metà del massimo della sanzione amministrativa edittale e per le spese di procedimento » (${h.src('cds203', 'articolo 203')}). I termini sono quelli che decorrono dalla notifica: ${h.num(h.P.payment.reduced_within_days)} giorni per lo sconto del 30 %, ${h.num(h.P.payment.within_days_minimum)} per il minimo e per il ricorso al prefetto, ${h.num(h.P.appeal.giudice_di_pace.days)} per il ricorso al giudice di pace. Quando sono tutti scaduti senza pagamento né ricorso, la somma dovuta cambia base: non più il minimo ma il massimo, diviso per due. Gli importi qui sotto sono quelli in vigore nel 2026, fermi fino al decreto di aggiornamento per il 2027.</p>
${h.table(['Infrazione', 'Entro 60 giorni', 'Dopo: metà del massimo', 'In più'], [
  ...B(h).map((b, i) => [FASCE.it[i], e(h, b.min), e(h, meta(h, b.max)), e(h, meta(h, b.max) - b.min)]),
  ...ALTRE.map((x) => { const r = h.M.altra(x.id); return [x.it, e(h, r.minimo), e(h, r.metaMassimo), e(h, r.metaMassimo - r.minimo)]; }),
], 'Somma dovuta prima e dopo la scadenza dei 60 giorni, spese escluse (art. 203 c.3 CdS): importi in vigore nel 2026', ['l', 'r', 'r', 'r'])}
<p>Le maggiorazioni seguono la sanzione. Di notte, quando l’${h.src('cds195', 'articolo 195')} aumenta di un terzo minimo e massimo, il passaggio con il rosso non pagato vale ${h.eur(n.metaMassimo, 2)} invece di ${h.eur(n.minimo, 2)}. Per i veicoli pesanti dell’articolo 142, comma 11, gli importi dell’eccesso di velocità sono raddoppiati, e lo è anche la metà del massimo.</p>
<!--mini:nonpagata-->
<h2>Prima di tutto, la data della notifica</h2>
<p>Una multa non pagata non è sempre una multa dovuta. ${h.src('cds201', 'L’articolo 201')} impone di notificare il verbale entro ${h.num(h.P.notification.days)} giorni dall’accertamento quando la violazione non è stata contestata sul posto, ed entro ${h.num(h.P.notification.days_abroad)} giorni se l’interessato risiede all’estero. Il comma 5 è netto: l’obbligo di pagare « si estingue nei confronti del soggetto a cui la notificazione non sia stata effettuata nel termine prescritto ». Le spese di accertamento e notifica, dice il comma 4, sono a carico di chi deve pagare la sanzione. Il calcolatore qui sopra confronta la data dell’infrazione con quella della notifica e segnala un ritardo; un ritardo va comunque fatto valere con un ricorso, come spiega la pagina sul ${h.a('ricorso-multa-autovelox', 'ricorso contro la multa autovelox')}.</p>
<!--mini:scadenze-->
<h2>Targhe estere e auto a noleggio</h2>
<p>Per chi vive fuori dall’Italia il termine di notifica è più lungo, ${h.num(h.P.notification.days_abroad)} giorni, ma la regola della metà del massimo è identica: decorsi i ${h.num(h.P.payment.within_days_minimum)} giorni dalla notifica, si deve la metà del massimo più le spese. Il verbale va notificato al trasgressore effettivo o, se non è identificato, a uno dei soggetti obbligati risultanti dai registri dei veicoli, che per un’auto a noleggio indicano la società proprietaria. Se chi guidava viene identificato dopo, l’articolo 201 fa decorrere il termine dalla data in cui l’amministrazione è in grado di identificarlo. Per i veicoli immatricolati all’estero, il comma 3-bis dell’articolo 203 aggiunge una via: se non è possibile riscuotere dal conducente o dal proprietario, la riscossione forzata può essere attivata, nei cinque anni successivi, verso chi viene trovato alla guida dello stesso veicolo, con le regole dell’articolo 207.</p>
<h2>Cosa resta e cosa no</h2>
<p>Il mancato pagamento non cancella le altre conseguenze: i punti sono decurtati e le sanzioni accessorie, come la sospensione, seguono il loro corso. Sulla somma dovuta per il ritardo, la ${h.src('l177', 'legge 177 del 2024')} ha fissato un limite: la maggiorazione prevista dall’articolo 27 della legge 689 del 1981 non può superare, per le sanzioni del Codice della Strada, i tre quinti dell’importo della sanzione. Per chi è ancora nei termini, la soluzione più economica resta pagare presto: la pagina sulla ${h.a('multa-ridotta-30', 'multa ridotta del 30 %')} calcola le scadenze. Testi di legge letti su Normattiva il ${h.date(h.P.retrieved_at)}.</p>`;
    },
  },
  en: {
    slug: 'unpaid-italian-fine',
    nav: 'Unpaid Italian fines',
    card: 'After 60 days without paying or appealing: half the maximum plus costs, and the fine becomes enforceable.',
    title: 'Unpaid Italian fine: half the maximum after 60 days 2026',
    description: 'Unpaid Italian fine after 60 days with no appeal: the verbale becomes enforceable for half the maximum plus costs. Amounts, late service, foreign plates.',
    h1: 'Unpaid Italian traffic fine: what it becomes after 60 days',
    intro: 'Enter the dates of the offence and of service: the calculator shows whether the deadlines have passed, whether service was on time and what is now due for your offence.',
    resume: (h) => `An unpaid Italian fine that has not been paid within ${h.num(h.P.payment.within_days_minimum)} days of service, nor challenged by an appeal in time, does not stay at the minimum. Article 203, paragraph 3, of the Highway Code provides that the verbale (the fine notice) then becomes an enforceable title for half the maximum penalty, plus procedural costs. Enforceable means the police body needs no further decision to demand payment. For 10 to 40 km/h over, the sum goes from ${h.eur(B(h)[1].min)} to ${e(h, meta(h, B(h)[1].max))}; above 60 km/h over, from ${h.eur(B(h)[3].min)} to ${e(h, meta(h, B(h)[3].max))}; for breaking a local parking rule, from ${h.eur(h.M.altra('divieto_sosta_comunale').minimo)} to ${e(h, h.M.altra('divieto_sosta_comunale').metaMassimo)}. Check the service date first: if the fine arrived more than ${h.num(h.P.notification.days)} days after the offence was established, or more than ${h.num(h.P.notification.days_abroad)} days for people living abroad, the obligation to pay lapses for whoever was not reached in time. For vehicles registered abroad, collection can be pursued for five years against whoever is found driving the vehicle.`,
    faqs: (h) => [
      { q: 'What happens if I do not pay an Italian fine within 60 days?', a: `If within ${h.num(h.P.payment.within_days_minimum)} days you have neither paid nor appealed, the fine becomes an enforceable title for half the maximum plus procedural costs, under article 203, paragraph 3. For 10 to 40 km/h over that is ${e(h, meta(h, B(h)[1].max))} instead of ${h.eur(B(h)[1].min)}. Points and any additional penalties remain, because they do not depend on payment.` },
      { q: 'Can I still pay just the minimum after 60 days?', a: `Article 202 offers the minimum only to those who pay within ${h.num(h.P.payment.within_days_minimum)} days. Once that has passed, the sum due by law is half the maximum plus costs, so a payment equal to the minimum does not settle the debt. If you are only just late, ask the police body named on the fine for the updated amount before paying, to avoid a balance left outstanding.` },
      { q: 'Do I have to pay a fine that was served too late?', a: `Not if you are the person served late. Article 201 requires service within ${h.num(h.P.notification.days)} days of the offence being established, ${h.num(h.P.notification.days_abroad)} for residents abroad, and paragraph 5 says the obligation to pay lapses for anyone not served within that time. You still need to raise it: the calculator compares the dates, and an appeal within the deadlines makes the point formally.` },
      { q: 'I ignored a fine from a rental car in Italy: what can happen?', a: `The fine does not go away. Once ${h.num(h.P.payment.within_days_minimum)} days have passed since it was served on you without payment or appeal, it becomes enforceable for half the maximum plus costs. If you live abroad, the police have ${h.num(h.P.notification.days_abroad)} days from the offence to serve you; a fine served later than that is no longer owed by you. Check the dates before deciding.` },
    ],
    body: (h) => {
      const n = h.M.altra('semaforo_rosso', { notte: true });
      return `<h2>What article 203, paragraph 3, says</h2>
<p>The text is short: “Where no appeal has been lodged within the time limits and the reduced payment has not been made, the verbale […] constitutes an enforceable title for a sum equal to half the maximum administrative penalty and for the procedural costs” (${h.src('cds203', 'article 203')}). The time limits run from service: ${h.num(h.P.payment.reduced_within_days)} days for the 30% discount, ${h.num(h.P.payment.within_days_minimum)} for the minimum and for an appeal to the prefetto, ${h.num(h.P.appeal.giudice_di_pace.days)} for an appeal to the giudice di pace (${h.num(h.P.appeal.giudice_di_pace.days_abroad)} from abroad). Once they have all passed with no payment and no appeal, the sum due changes basis: no longer the minimum but the maximum, halved. The amounts below are those in force in 2026, frozen until the update decree for 2027.</p>
${h.table(['Offence', 'Within 60 days', 'After: half the maximum', 'Extra'], [
  ...B(h).map((b, i) => [FASCE.en[i], e(h, b.min), e(h, meta(h, b.max)), e(h, meta(h, b.max) - b.min)]),
  ...ALTRE.map((x) => { const r = h.M.altra(x.id); return [x.en, e(h, r.minimo), e(h, r.metaMassimo), e(h, r.metaMassimo - r.minimo)]; }),
], 'Sum due before and after the 60-day deadline, costs excluded (article 203, paragraph 3, of the Highway Code): amounts in force in 2026', ['l', 'r', 'r', 'r'])}
<p>Surcharges follow the penalty. At night, when ${h.src('cds195', 'article 195')} raises both minimum and maximum by a third, an unpaid red-light offence is worth ${h.eur(n.metaMassimo, 2)} instead of ${h.eur(n.minimo, 2)}. For the heavy vehicles of article 142, paragraph 11, speeding amounts are doubled, and so is half the maximum.</p>
<!--mini:nonpagata-->
<h2>First of all, the service date</h2>
<p>An unpaid fine is not always a fine that is owed. ${h.src('cds201', 'Article 201')} requires the fine to be served within ${h.num(h.P.notification.days)} days of the offence being established when the driver was not stopped on the spot, and within ${h.num(h.P.notification.days_abroad)} days when the person lives abroad. Paragraph 5 is clear: the obligation to pay “lapses for the person on whom service was not made within the prescribed time”. Investigation and service costs, says paragraph 4, fall on whoever must pay the penalty. The calculator above compares the offence date with the service date and flags a delay; a delay still has to be raised through an appeal, as the ${h.a('ricorso-multa-autovelox', 'appeal page')} explains.</p>
<!--mini:scadenze-->
<h2>Foreign plates and rental cars</h2>
<p>For people living outside Italy the service deadline is longer, ${h.num(h.P.notification.days_abroad)} days, but the half-the-maximum rule is the same: once ${h.num(h.P.payment.within_days_minimum)} days have passed since service, half the maximum plus costs is due. The fine is served on the actual offender or, if not identified, on one of the liable persons shown in the vehicle registers, which for a hire car means the rental company that owns it. If the driver is identified later, article 201 runs the deadline from the date the authorities are able to identify them. For vehicles registered abroad, paragraph 3-bis of article 203 adds another route: if the money cannot be collected from the driver or the owner, enforced collection can be started, within the following five years, against whoever is found driving the same vehicle, under the rules of article 207. Drivers who bring their own car to Italy should keep that in mind before ignoring an old fine.</p>
<h2>What stays and what does not</h2>
<p>Not paying does not cancel the other consequences: points are deducted and additional penalties, such as a suspension, run their course. On sums due for late payment, ${h.src('l177', 'law 177 of 2024')} set a ceiling: the surcharge under article 27 of law 689 of 1981 may not exceed, for Highway Code penalties, three fifths of the penalty. For anyone still within the deadlines, the cheapest option is still to pay early: the ${h.a('multa-ridotta-30', '30% discount page')} works out the dates. Legal texts read on Normattiva on ${h.date(h.P.retrieved_at)}.</p>`;
    },
  },
});
