import { defineGuide, type Helpers } from '../../lib/guide-types';

const B = (h: Helpers) => h.P.speeding.bands;
const rid = (h: Helpers, min: number) => Math.round(min * (1 - h.P.payment.reduction) * 100) / 100;
const e = (h: Helpers, n: number) => h.eur(n, Number.isInteger(Math.round(n * 100) / 100) ? 0 : 2);
const FASCE = { it: ['Velocità: fino a 10 km/h oltre', 'Velocità: oltre 10, fino a 40', 'Velocità: oltre 40, fino a 60', 'Velocità: oltre 60 km/h'], en: ['Speeding: up to 10 km/h over', 'Speeding: over 10, up to 40', 'Speeding: over 40, up to 60', 'Speeding: over 60 km/h'] };
const ALTRE: Array<{ id: string; it: string; en: string }> = [
  { id: 'cellulare', it: 'Telefono in mano alla guida', en: 'Phone in hand while driving' },
  { id: 'cintura', it: 'Cintura non allacciata', en: 'Seat belt not worn' },
  { id: 'semaforo_rosso', it: 'Passaggio con il rosso', en: 'Running a red light' },
  { id: 'segnaletica', it: 'Segnale stradale non rispettato', en: 'Ignoring a road sign' },
  { id: 'divieto_sosta_comunale', it: 'Sosta contro le regole del comune', en: 'Parking against a local rule' },
  { id: 'sosta_158_c6', it: 'Passo carrabile o doppia fila', en: 'Driveway or double-parking' },
  { id: 'sosta_vietata_158', it: 'Marciapiede, strisce pedonali, pista ciclabile', en: 'Pavement, crossing, cycle lane' },
  { id: 'sosta_158_5bis', it: 'Fermata del bus o corsia riservata', en: 'Bus stop or reserved lane' },
  { id: 'sosta_158_4bis', it: 'Posto riservato ai disabili', en: 'Disabled bay' },
  { id: 'ztl_corsie', it: 'Ingresso in ZTL o area pedonale', en: 'Entering a ZTL or pedestrian zone' },
  { id: 'alcol_05_08', it: 'Alcol tra 0,5 e 0,8 g/l', en: 'Alcohol 0.5 to 0.8 g/l' },
];
const NOTIFICA = '2026-03-10';

export default defineGuide({
  id: 'multa-ridotta-30',
  group: 'verbale',
  order: 2,
  tool: 'scadenze',
  outil: { mode: 'pagamento', defaultFatto: 'c8', defaultGiorniDopo: 3 },
  related: ['ricorso-multa-autovelox', 'multa-non-pagata', 'multa-eccesso-di-velocita', 'sanzioni-codice-della-strada', 'multa-divieto-di-sosta'],
  sources: ['cds202', 'cds201', 'cds195', 'cds203'],
  it: {
    slug: 'multa-ridotta-30',
    nav: 'Multa ridotta del 30 %',
    card: 'Il minimo meno il 30 % entro 5 giorni dalla notifica: quando vale, come si contano i giorni, importi.',
    title: 'Multa ridotta 30 %: entro 5 giorni, importi ed esclusioni',
    description: 'Multa ridotta del 30 %: il minimo meno il 30 % se paghi entro 5 giorni dalla notifica o dalla contestazione. Spese escluse, casi senza sconto, importi.',
    h1: 'Multa ridotta del 30 %: come e quando si paga meno',
    intro: 'Inserisci la data in cui hai ricevuto il verbale: il calcolo indica l’ultimo giorno per lo sconto del 30 % e quello per pagare il minimo, con gli importi per la tua infrazione.',
    resume: (h) => `La multa ridotta del 30 % è prevista dall’articolo 202 del Codice della Strada: chi paga entro ${h.num(h.P.payment.reduced_within_days)} giorni dalla contestazione sul posto o dalla notifica del verbale versa il minimo della sanzione meno il 30 %. Dopo il quinto giorno e fino al ${h.num(h.P.payment.within_days_minimum)}° si paga il minimo pieno; oltre, senza ricorso, si deve la metà del massimo. Lo sconto riguarda solo la sanzione: le spese di accertamento e di notifica scritte sul verbale si pagano per intero. Non spetta quando l’infrazione comporta la sospensione della patente o la confisca del veicolo, quindi è escluso per gli eccessi di velocità oltre 40 km/h, per il telefono alla guida e per l’alcol. Esempi 2026: un eccesso tra 10 e 40 km/h passa da ${h.eur(B(h)[1].min)} a ${h.eur(rid(h, B(h)[1].min), 2)}, la cintura da ${h.eur(h.M.altra('cintura').minimo)} a ${h.eur(h.M.altra('cintura').ridotto ?? 0, 2)}, la sosta contro le regole del comune da ${h.eur(h.M.altra('divieto_sosta_comunale').minimo)} a ${h.eur(h.M.altra('divieto_sosta_comunale').ridotto ?? 0, 2)}. I giorni si contano dal giorno dopo la notifica: un verbale ricevuto il 10 marzo si paga ridotto entro il 15. Chi paga rinuncia a qualsiasi ricorso.`,
    faqs: (h) => [
      { q: 'Come si contano i 5 giorni per lo sconto del 30 %?', a: `Il primo giorno è quello successivo alla contestazione o alla notifica. La notifica è il giorno in cui il verbale ti viene consegnato, per posta o per PEC. Con una notifica del ${h.date(NOTIFICA)}, l’ultimo giorno utile è il ${h.date(h.M.addDays(NOTIFICA, h.P.payment.reduced_within_days))}. Il calcolatore conta i giorni di calendario e non sposta la scadenza se cade di domenica o in un giorno festivo.` },
      { q: 'Lo sconto del 30 % si applica anche alle spese di notifica?', a: `No. L’articolo 202 riduce del 30 % « una somma pari al minimo fissato dalle singole norme », cioè la sanzione. Le spese di accertamento e di notificazione, che l’articolo 201 pone a carico di chi paga, si aggiungono per intero. Su un eccesso tra 10 e 40 km/h si versano ${h.eur(rid(h, B(h)[1].min), 2)} più le spese indicate sul verbale, che variano da un ente all’altro.` },
      { q: 'Se pago con bonifico l’ultimo giorno lo sconto è valido?', a: 'Sì, se il denaro arriva in tempo. Una norma di interpretazione del 2016 (decreto-legge 18, articolo 17-quinquies) stabilisce che per i pagamenti diversi dai contanti e dal conto corrente postale il pagamento libera se l’accredito all’amministrazione avviene entro due giorni dalla scadenza. Conserva la ricevuta con la data e il codice del verbale.' },
      { q: 'Si può pagare la multa ridotta direttamente all’agente?', a: 'Sì, se la pattuglia ha l’apparecchio per i pagamenti elettronici. Il comma 2.1 dell’articolo 202 consente di pagare subito, con carta o altro strumento elettronico, la somma ridotta del 30 %: l’agente rilascia una ricevuta e lo annota sulla copia del verbale consegnata. Chi non paga sul posto ha comunque 5 giorni dalla contestazione per lo sconto, con le modalità indicate sul verbale.' },
    ],
    body: (h) => {
      const notte = h.M.altra('semaforo_rosso', { notte: true });
      return `<h2>Cosa prevede l’articolo 202</h2>
<p>${h.src('cds202', 'L’articolo 202, comma 1')} ammette il trasgressore a pagare, entro ${h.num(h.P.payment.within_days_minimum)} giorni dalla contestazione o dalla notifica, « una somma pari al minimo fissato dalle singole norme ». Il secondo periodo aggiunge: « Tale somma è ridotta del 30 per cento se il pagamento è effettuato entro cinque giorni ». Lo sconto si calcola sul minimo, mai sul massimo, e sulle maggiorazioni già applicate: per un passaggio con il rosso di notte, quando l’${h.src('cds195', 'articolo 195')} aumenta la sanzione di un terzo, il minimo diventa ${h.eur(notte.minimo, 2)} e la somma ridotta ${h.eur(notte.ridotto ?? 0, 2)}.</p>
<p>Le ${h.src('cds201', 'spese di accertamento e di notificazione')} restano fuori: l’articolo 201, comma 4, le pone a carico di chi è tenuto a pagare, e non fanno parte della somma che si riduce.</p>
<!--mini:ridotto-->
<h2>Quando lo sconto non c’è</h2>
<p>Lo stesso articolo esclude la riduzione per le infrazioni che comportano la sospensione della patente o la confisca del veicolo. Il comma 3 vieta il pagamento in misura ridotta anche a chi non si è fermato all’invito degli agenti o si è rifiutato di mostrare patente e carta di circolazione, e il comma 3-bis elenca altre violazioni per cui il verbale va direttamente al prefetto. Nella tabella, « non ammesso » indica i casi in cui il Codice prevede una sospensione: si paga il minimo entro ${h.num(h.P.payment.within_days_minimum)} giorni.</p>
${h.table(['Infrazione', 'Minimo', 'Entro 5 giorni'], [
  ...B(h).map((b, i) => [FASCE.it[i], e(h, b.min), b.suspension ? 'non ammesso' : e(h, rid(h, b.min))]),
  ...ALTRE.map((x) => { const r = h.M.altra(x.id); return [x.it, e(h, r.minimo), r.ridotto === null ? 'non ammesso' : e(h, r.ridotto)]; }),
], 'Somma da pagare entro 5 e entro 60 giorni dalla notifica, spese escluse: importi in vigore nel 2026', ['l', 'r', 'r'])}
<p>Per i ciclomotori e le moto a due ruote alcune soste hanno importi più bassi; il calcolatore delle ${h.a('sanzioni-codice-della-strada', 'sanzioni del Codice della Strada')} li mostra scegliendo il veicolo. Per l’eccesso tra 10 e 40 km/h commesso per la seconda volta in un anno in centro abitato scatta una sospensione, e con essa sparisce lo sconto: il minimo è ${h.eur(h.P.speeding.repeat_in_town_c8.min)}.</p>
<h2>Come si contano i 5 giorni</h2>
<p>Il termine decorre dalla contestazione, se l’agente ti ha fermato e consegnato il verbale, oppure dalla notifica, se il verbale arriva per posta o PEC. Il giorno della notifica non si conta: con una notifica del ${h.date(NOTIFICA)} lo sconto vale fino al ${h.date(h.M.addDays(NOTIFICA, h.P.payment.reduced_within_days))} e il minimo fino al ${h.date(h.M.addDays(NOTIFICA, h.P.payment.within_days_minimum))}. Per i pagamenti diversi dai contanti e dal bollettino postale, l’effetto liberatorio si produce se l’accredito arriva entro due giorni dalla scadenza, come precisa la norma interpretativa riportata in calce all’articolo 202. Il calcolatore lavora sui giorni di calendario: se la scadenza cade in un giorno festivo, controlla le indicazioni del verbale.</p>
<!--mini:scadenze-->
<h2>Pagare o fare ricorso</h2>
<p>Pagare, anche con lo sconto, chiude la partita: ${h.src('cds203', 'l’articolo 203')} ammette il ricorso solo se non è stato effettuato il pagamento in misura ridotta. Se pensi che il verbale sia sbagliato, decidi prima di pagare e guarda la pagina sul ${h.a('ricorso-multa-autovelox', 'ricorso contro la multa autovelox')}: in caso di rigetto da parte del prefetto si paga almeno il doppio del minimo. Se non paghi e non ricorri entro ${h.num(h.P.payment.within_days_minimum)} giorni, il verbale diventa titolo esecutivo per la metà del massimo, come spiega la pagina sulla ${h.a('multa-non-pagata', 'multa non pagata')}. Importi in vigore nel 2026; testi letti su Normattiva il ${h.date(h.P.retrieved_at)}.</p>`;
    },
  },
  en: {
    slug: 'italian-fine-30-percent-discount',
    nav: '30% discount on fines',
    card: 'The minimum less 30% within 5 days of service: when it applies, how the days count, amounts.',
    title: '30% discount on an Italian fine: 5 days, amounts, limits',
    description: '30% discount on an Italian traffic fine: the minimum less 30% if paid within 5 days of service. Costs excluded, cases with no discount, amounts by offence.',
    h1: 'The 30% discount on Italian traffic fines: how and when you pay less',
    intro: 'Enter the date the fine reached you: the calculator gives the last day for the 30% discount and the last day to pay the minimum, with the amounts for your offence.',
    resume: (h) => `The 30% discount on Italian traffic fines comes from article 202 of the Highway Code: if you pay within ${h.num(h.P.payment.reduced_within_days)} days of being stopped and charged on the spot, or of being served with the verbale (the fine notice), you pay the minimum penalty less 30%. From the sixth day up to day ${h.num(h.P.payment.within_days_minimum)} the full minimum is due; after that, without an appeal, half the maximum. The discount covers the penalty only: the investigation and service costs printed on the fine are paid in full. It does not apply when the offence carries a licence suspension or vehicle confiscation, so it is excluded for speeding more than 40 km/h over, for using a phone at the wheel and for drink-driving. Examples for 2026: 10 to 40 km/h over drops from ${h.eur(B(h)[1].min)} to ${h.eur(rid(h, B(h)[1].min), 2)}, a seat belt from ${h.eur(h.M.altra('cintura').minimo)} to ${h.eur(h.M.altra('cintura').ridotto ?? 0, 2)}, breaking a local parking rule from ${h.eur(h.M.altra('divieto_sosta_comunale').minimo)} to ${h.eur(h.M.altra('divieto_sosta_comunale').ridotto ?? 0, 2)}. The days count from the day after service: a fine received on 10 March can be paid at the reduced rate until the 15th. Paying gives up any appeal.`,
    faqs: (h) => [
      { q: 'How are the 5 days for the 30% discount counted?', a: `Day one is the day after you were stopped or served. Service is the day the fine is delivered to you, by post or by certified e-mail (PEC). With service on ${h.date(NOTIFICA)}, the last valid day is ${h.date(h.M.addDays(NOTIFICA, h.P.payment.reduced_within_days))}. The calculator counts calendar days and does not move the deadline when it falls on a Sunday or public holiday.` },
      { q: 'Does the 30% discount also cover the service costs?', a: `No. Article 202 reduces by 30% “a sum equal to the minimum set by each rule”, that is the penalty. The investigation and service costs, which article 201 puts on whoever pays the fine, are added in full. For 10 to 40 km/h over you pay ${h.eur(rid(h, B(h)[1].min), 2)} plus the costs stated on the fine, which vary from one police body to another.` },
      { q: 'If I pay by bank transfer on the last day, does the discount still count?', a: 'Yes, provided the money arrives in time. A 2016 interpretation rule (decree-law 18, article 17-quinquies) says that for payments other than cash or the post office account, payment is valid if the credit reaches the administration within two days of the deadline. An international transfer can be slower, so keep the dated receipt and the fine’s reference number.' },
      { q: 'When does the 5-day window start for a fine posted to me abroad?', a: `On the day the fine is served on you, not on the day of the offence. The Italian police have ${h.num(h.P.notification.days_abroad)} days from when the offence is established to serve people living abroad, so a fine can arrive months after a holiday or a rental. From that day you have ${h.num(h.P.payment.reduced_within_days)} days for the discount and ${h.num(h.P.payment.within_days_minimum)} for the minimum.` },
    ],
    body: (h) => {
      const notte = h.M.altra('semaforo_rosso', { notte: true });
      return `<h2>What article 202 says</h2>
<p>${h.src('cds202', 'Article 202, paragraph 1')} allows the offender to pay, within ${h.num(h.P.payment.within_days_minimum)} days of being charged or served, “a sum equal to the minimum set by each rule”. The second sentence adds: “That sum is reduced by 30 per cent if payment is made within five days”. The discount is worked out on the minimum, never the maximum, and on any surcharge already applied: for running a red light at night, when ${h.src('cds195', 'article 195')} raises the penalty by a third, the minimum becomes ${h.eur(notte.minimo, 2)} and the reduced sum ${h.eur(notte.ridotto ?? 0, 2)}.</p>
<p>${h.src('cds201', 'Investigation and service costs')} stay outside the discount: article 201, paragraph 4, puts them on whoever has to pay, and they are not part of the sum that is reduced.</p>
<!--mini:ridotto-->
<h2>When there is no discount</h2>
<p>The same article rules out the reduction for offences that carry a licence suspension or vehicle confiscation. Paragraph 3 also bars the reduced payment for drivers who did not stop when told to or refused to show their licence and registration document, and paragraph 3-bis lists other offences for which the fine goes straight to the prefetto. In the table, “not allowed” marks the cases where the Code provides a suspension: the minimum is due within ${h.num(h.P.payment.within_days_minimum)} days.</p>
${h.table(['Offence', 'Minimum', 'Within 5 days'], [
  ...B(h).map((b, i) => [FASCE.en[i], e(h, b.min), b.suspension ? 'not allowed' : e(h, rid(h, b.min))]),
  ...ALTRE.map((x) => { const r = h.M.altra(x.id); return [x.en, e(h, r.minimo), r.ridotto === null ? 'not allowed' : e(h, r.ridotto)]; }),
], 'Sum due within 5 and within 60 days of service, costs excluded: amounts in force in 2026', ['l', 'r', 'r'])}
<p>For mopeds and two-wheeled motorcycles some parking offences have lower amounts; the ${h.a('sanzioni-codice-della-strada', 'traffic fines calculator')} shows them when you pick the vehicle. A second offence of 10 to 40 km/h over within a year in a built-up area carries a suspension, and the discount goes with it: the minimum is ${h.eur(h.P.speeding.repeat_in_town_c8.min)}.</p>
<h2>How the 5 days are counted</h2>
<p>The period runs from the moment you are charged, if an officer stopped you and handed you the fine, or from service, if it arrives by post or certified e-mail. The day of service does not count: with service on ${h.date(NOTIFICA)} the discount runs until ${h.date(h.M.addDays(NOTIFICA, h.P.payment.reduced_within_days))} and the minimum until ${h.date(h.M.addDays(NOTIFICA, h.P.payment.within_days_minimum))}. For payments other than cash or a post office slip, payment is effective if the credit arrives within two days of the deadline, as the interpretation rule printed under article 202 explains. The calculator works in calendar days: if the deadline falls on a public holiday, check the instructions on the fine. Visitors paying from abroad should allow for slower international transfers.</p>
<!--mini:scadenze-->
<h2>Paying or appealing</h2>
<p>Paying, even with the discount, closes the matter: ${h.src('cds203', 'article 203')} allows an appeal only if the reduced payment has not been made. If you think the fine is wrong, decide before paying and read the ${h.a('ricorso-multa-autovelox', 'appeal page')}: if the prefetto rejects an appeal, at least twice the minimum is due. If you neither pay nor appeal within ${h.num(h.P.payment.within_days_minimum)} days, the fine becomes enforceable for half the maximum, as the ${h.a('multa-non-pagata', 'unpaid fine page')} explains. Amounts in force in 2026; texts read on Normattiva on ${h.date(h.P.retrieved_at)}.</p>`;
    },
  },
});
