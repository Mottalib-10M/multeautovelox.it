import { defineGuide, type Helpers } from '../../lib/guide-types';

const B = (h: Helpers) => h.P.speeding.bands;
const v = (h: Helpers, rilevata: number, limite: number) => h.M.velocita({ limite, rilevata });

export default defineGuide({
  id: 'multa-eccesso-di-velocita',
  group: 'velocita',
  order: 1,
  tool: 'velocita',
  outil: { defaultLimite: 90, defaultRilevata: 112 },
  related: ['tolleranza-autovelox', 'multa-ridotta-30', 'decurtazione-punti-patente', 'tutor-autostrade', 'ricorso-multa-autovelox'],
  sources: ['cds142', 'reg345', 'cds195', 'cds202', 'tabella', 'cds117'],
  it: {
    slug: 'multa-eccesso-di-velocita',
    nav: 'Multa per eccesso di velocità',
    card: 'Le quattro fasce dell’art. 142: da 42 a 3 382 €, da 0 a 10 punti, sospensione oltre 40 km/h.',
    title: 'Multa eccesso di velocità 2026: importi, punti, sospensione',
    description: 'Multa per eccesso di velocità: da 42 € fino a 10 km/h oltre il limite a 3 382 € oltre 60 km/h, punti, sospensione, notte e neopatentati. Calcolo immediato.',
    h1: 'Multa per eccesso di velocità: le quattro fasce e il calcolo',
    intro: 'Inserisci la velocità del verbale e il limite: vedi la fascia, l’importo con e senza sconto, i punti e l’eventuale sospensione, anche di notte o da neopatentato.',
    resume: (h) => `La multa per eccesso di velocità dipende da quanti km/h si supera il limite dopo la riduzione del ${h.pct(h.P.tolerance.percent, 0)} (minimo ${h.num(h.P.tolerance.min_kmh)} km/h) prevista dall’articolo 345 del Regolamento. L’articolo 142 del Codice della Strada fissa quattro fasce: fino a 10 km/h oltre il limite da ${h.eur(B(h)[0].min)} a ${h.eur(B(h)[0].max)}, senza punti; oltre 10 e fino a 40 km/h da ${h.eur(B(h)[1].min)} a ${h.eur(B(h)[1].max)} e ${h.num(B(h)[1].points)} punti; oltre 40 e fino a 60 km/h da ${h.eur(B(h)[2].min)} a ${h.eur(B(h)[2].max)}, ${h.num(B(h)[2].points)} punti e sospensione della patente da uno a tre mesi; oltre 60 km/h da ${h.eur(B(h)[3].min)} a ${h.eur(B(h)[3].max)}, ${h.num(B(h)[3].points)} punti e sospensione da sei a dodici mesi. Si paga il minimo entro 60 giorni, il minimo meno il 30 % entro 5 giorni se non c’è sospensione, la metà del massimo dopo. Tra le 22 e le 7 tutto aumenta di un terzo, e chi ha la patente da meno di tre anni perde il doppio dei punti. Importi del 2026, fermi fino al decreto atteso per il 2027.`,
    faqs: (h) => [
      { q: 'Quanto si paga per 20 km/h oltre il limite?', a: `Venti km/h oltre il limite, già al netto della tolleranza, cadono nella fascia del comma 8: da ${h.eur(B(h)[1].min)} a ${h.eur(B(h)[1].max)} e ${h.num(B(h)[1].points)} punti. Pagando entro 5 giorni dalla notifica si versano ${h.eur(B(h)[1].min * 0.7, 2)} più le spese. Attenzione: se il verbale riporta la velocità letta e non quella accertata, togli prima il 5 % o almeno 5 km/h.` },
      { q: 'Da quanti km/h oltre il limite si perdono i punti?', a: `Da più di 10 km/h oltre il limite, misurati sulla velocità accertata. Fino a 10 km/h la multa è da ${h.eur(B(h)[0].min)} a ${h.eur(B(h)[0].max)} senza punti. Con la tolleranza, su un limite di 50 la prima velocità letta che toglie punti è ${h.num(h.M.primaRilevataOltre(50, 10))} km/h; su un limite di 130 è ${h.num(h.M.primaRilevataOltre(130, 10))} km/h.` },
      { q: 'Quando scatta la sospensione della patente per velocità?', a: 'Oltre 40 km/h sopra il limite: da uno a tre mesi fino a 60 km/h, da sei a dodici mesi oltre. La patente va consegnata e lo sconto del 30 % non vale. Anche la seconda violazione tra 10 e 40 km/h in centro abitato nello stesso anno comporta una sospensione, da quindici a trenta giorni, oltre a un importo più alto.' },
      { q: 'L’importo della multa per velocità cambia di notte?', a: 'Sì, tra le 22 e le 7 l’importo aumenta di un terzo secondo l’articolo 195, comma 2-bis. Vale sia per il minimo sia per il massimo, e lo sconto del 30 % si calcola sul minimo già aumentato. Il calcolatore applica la maggiorazione quando scegli l’ora notturna.' },
    ],
    body: (h) => {
      const a = v(h, 112, 90), b = v(h, 60, 50), c = v(h, 140, 110), d = v(h, 165, 90);
      return `<h2>Le quattro fasce dell’articolo 142</h2>
<p>${h.src('cds142', 'L’articolo 142')} non conosce importi fissi: per ogni fascia fissa un minimo e un massimo. Sul verbale l’ente scrive il minimo, che è anche l’importo da pagare entro 60 giorni. Il massimo serve solo in due casi: se non paghi né fai ricorso (si deve la metà del massimo) e se il ricorso al prefetto viene respinto.</p>
${h.table(['Oltre il limite', 'Comma', 'Minimo', 'Massimo', 'Punti', 'Sospensione'], B(h).map((x, i) => [
  ['fino a 10 km/h', 'oltre 10, fino a 40', 'oltre 40, fino a 60', 'oltre 60 km/h'][i],
  x.ref.replace('Art. 142 ', ''), h.eur(x.min), h.eur(x.max), String(x.points),
  x.suspension ? `${x.suspension.from_months}–${x.suspension.to_months} mesi` : 'no',
]), 'Eccesso di velocità, art. 142 CdS: importi in vigore nel 2026', ['l', 'l', 'r', 'r', 'r', 'l'])}
<p>Esempi: ${h.num(112)} km/h letti su una statale a 90 danno ${h.num(a.accertata)} km/h accertati e ${h.num(a.eccesso)} km/h oltre: ${h.eur(a.minimo)}, ${h.eur(a.ridotto ?? 0, 2)} entro 5 giorni e ${h.num(a.punti)} punti. ${h.num(60)} km/h in città a 50 danno ${h.num(b.accertata)} km/h, solo ${h.num(b.eccesso)} oltre: ${h.eur(b.minimo)} e nessun punto. ${h.num(140)} km/h su una superstrada a 110 danno ${h.num(c.accertata)} km/h e ${h.num(c.eccesso)} oltre: ${h.eur(c.minimo)} e ${h.num(c.punti)} punti. ${h.num(165)} km/h su una strada a 90 danno ${h.num(d.accertata, 2)} km/h e ${h.num(d.eccesso, 2)} oltre: ${h.eur(d.minimo)}, ${h.num(d.punti)} punti e da sei a dodici mesi di sospensione.</p>
<!--mini:eccesso-->
<h2>Notte, neopatentati e veicoli pesanti</h2>
<p>Tre circostanze cambiano il conto. Di notte, tra le 22 e le 7, minimo e massimo crescono di un terzo (${h.src('cds195', 'articolo 195, comma 2-bis')}): ${h.eur(B(h)[1].min)} diventano ${h.eur(B(h)[1].min * 4 / 3, 2)}. Per chi ha la patente da meno di tre anni i punti raddoppiano secondo la ${h.src('tabella', 'tabella dell’articolo 126-bis')}, e ${h.src('cds117', 'l’articolo 117')} abbassa i limiti a 100 km/h in autostrada e 90 sulle extraurbane principali: andare a 120 in autostrada è già un eccesso. Per i veicoli pesanti elencati al comma 3, il comma 11 raddoppia importi e sospensioni.</p>
<!--mini:notturna-->
<h2>Recidiva e più autovelox in un’ora</h2>
<p>Il nuovo Codice della Strada (legge 177 del 2024) ha aggiunto una regola per le città: chi commette due volte nello stesso anno, in centro abitato, un eccesso tra 10 e 40 km/h paga da ${h.eur(h.P.speeding.repeat_in_town_c8.min)} a ${h.eur(h.P.speeding.repeat_in_town_c8.max)} e subisce la sospensione da 15 a 30 giorni. Per le fasce più alte, la recidiva in due anni allunga la sospensione da 8 a 18 mesi (comma 9) o porta alla revoca della patente (comma 9-bis). All’opposto, più eccessi rilevati dallo stesso ente sulle sue strade entro un’ora si sanzionano con la violazione più grave aumentata di un terzo, quando conviene al conducente (comma 6-ter).</p>
<!--mini:plurime-->
<h2>Cosa controllare sul verbale</h2>
<p>Prima di pagare, controlla quattro cose: la velocità accertata e la riduzione applicata; il limite indicato, che deve corrispondere al cartello; la data della notifica, entro 90 giorni dall’accertamento; il numero del decreto di approvazione o omologazione dell’apparecchio. Se una di queste non torna, la pagina sul ${h.a('ricorso-multa-autovelox', 'ricorso contro la multa autovelox')} spiega come procedere. Se tutto è in regola, pagare entro 5 giorni è quasi sempre la scelta più economica: la pagina ${h.a('multa-ridotta-30', 'multa ridotta del 30 %')} calcola la data esatta.</p>`;
    },
  },
  en: {
    slug: 'italy-speeding-fine',
    nav: 'Italian speeding fines',
    card: 'The four article 142 bands: €42 to €3,382, 0 to 10 points, a suspension above 40 km/h over.',
    title: 'Speeding fines in Italy: bands, points and suspension 2026',
    description: 'Speeding fine in Italy: from €42 up to 10 km/h over the limit to €3,382 above 60 km/h, points, suspension, night and new-driver rules. Instant calculation.',
    h1: 'Speeding fines in Italy: the four bands and the calculation',
    intro: 'Enter the speed on your verbale and the limit: see the band, the amount with and without the discount, the points and any suspension, including at night or as a new driver.',
    resume: (h) => `An Italian speeding fine depends on how many km/h you were over the limit after the ${h.pct(h.P.tolerance.percent, 0)} reduction (at least ${h.num(h.P.tolerance.min_kmh)} km/h) set by article 345 of the Highway Code regulation. Article 142 of the Highway Code sets four bands: up to 10 km/h over costs ${h.eur(B(h)[0].min)} to ${h.eur(B(h)[0].max)}, with no points; more than 10 and up to 40 km/h over costs ${h.eur(B(h)[1].min)} to ${h.eur(B(h)[1].max)} and ${h.num(B(h)[1].points)} points; more than 40 and up to 60 km/h over costs ${h.eur(B(h)[2].min)} to ${h.eur(B(h)[2].max)}, ${h.num(B(h)[2].points)} points and a one-to-three-month licence suspension; more than 60 km/h over costs ${h.eur(B(h)[3].min)} to ${h.eur(B(h)[3].max)}, ${h.num(B(h)[3].points)} points and six to twelve months of suspension. You pay the minimum within 60 days, the minimum less 30% within 5 days when there is no suspension, and half the maximum after that. Between 10 pm and 7 am everything rises by a third, and drivers licensed for under three years lose twice the points. These are the 2026 amounts, frozen until the decree expected for 2027.`,
    faqs: (h) => [
      { q: 'How much is a fine for 20 km/h over the limit in Italy?', a: `Twenty km/h over the limit, after the tolerance, falls in paragraph 8: ${h.eur(B(h)[1].min)} to ${h.eur(B(h)[1].max)} and ${h.num(B(h)[1].points)} points. Paying within 5 days of service costs ${h.eur(B(h)[1].min * 0.7, 2)} plus costs. If your fine shows the recorded speed rather than the speed held, take off 5%, or at least 5 km/h, before comparing it with the limit.` },
      { q: 'Does a speeding fine from Italy affect my licence at home?', a: 'Italian points are recorded against Italian licences. The EU rules on cross-border offences let the police find the owner of a foreign car to send the fine; they do not move points between countries. A suspension decided in Italy applies on Italian roads, and the fine is due wherever you live, so ignoring it only makes it grow.' },
      { q: 'At what speed does Italy suspend your licence?', a: 'More than 40 km/h above the limit, after the tolerance: one to three months up to 60 km/h over, six to twelve months beyond. The 30% discount then no longer applies. A second offence of 10 to 40 km/h over in a built-up area within a year also brings a 15 to 30-day suspension and a higher amount.' },
      { q: 'Is an Italian speeding fine higher at night?', a: 'Yes, between 10 pm and 7 am the amount rises by one third under article 195, paragraph 2-bis. Both minimum and maximum go up, and the 30% discount is worked out on the increased minimum. The time is printed on the fine; the calculator applies the surcharge when you tick the night option.' },
    ],
    body: (h) => {
      const a = v(h, 112, 90), b = v(h, 60, 50), c = v(h, 140, 110), d = v(h, 165, 90);
      return `<h2>The four bands of article 142</h2>
<p>${h.src('cds142', 'Article 142')} has no fixed amounts: each band has a minimum and a maximum. The police write the minimum on the fine, and that is what you pay within 60 days. The maximum only matters in two cases: if you neither pay nor appeal (half the maximum becomes due) and if an appeal to the prefetto is rejected.</p>
${h.table(['Over the limit', 'Paragraph', 'Minimum', 'Maximum', 'Points', 'Suspension'], B(h).map((x, i) => [
  ['up to 10 km/h', 'over 10, up to 40', 'over 40, up to 60', 'over 60 km/h'][i],
  x.ref.replace('Art. 142 c.', 'para. '), h.eur(x.min), h.eur(x.max), String(x.points),
  x.suspension ? `${x.suspension.from_months}–${x.suspension.to_months} months` : 'no',
]), 'Speeding, article 142 of the Italian Highway Code: amounts in force in 2026', ['l', 'l', 'r', 'r', 'r', 'l'])}
<p>Examples: ${h.num(112)} km/h recorded on a 90 road gives ${h.num(a.accertata)} km/h held and ${h.num(a.eccesso)} km/h over: ${h.eur(a.minimo)}, ${h.eur(a.ridotto ?? 0, 2)} within 5 days and ${h.num(a.punti)} points. ${h.num(60)} km/h in a 50 town gives ${h.num(b.accertata)} km/h, just ${h.num(b.eccesso)} over: ${h.eur(b.minimo)} and no points. ${h.num(140)} km/h on a 110 dual carriageway gives ${h.num(c.accertata)} km/h and ${h.num(c.eccesso)} over: ${h.eur(c.minimo)} and ${h.num(c.punti)} points. ${h.num(165)} km/h on a 90 road gives ${h.num(d.accertata, 2)} km/h and ${h.num(d.eccesso, 2)} over: ${h.eur(d.minimo)}, ${h.num(d.punti)} points and six to twelve months of suspension.</p>
<!--mini:eccesso-->
<h2>Night, new drivers and heavy vehicles</h2>
<p>Three circumstances change the sum. At night, between 10 pm and 7 am, minimum and maximum rise by a third (${h.src('cds195', 'article 195, paragraph 2-bis')}): ${h.eur(B(h)[1].min)} becomes ${h.eur(B(h)[1].min * 4 / 3, 2)}. Drivers licensed for under three years lose double points under the ${h.src('tabella', 'article 126-bis table')}, and ${h.src('cds117', 'article 117')} lowers their limits to 100 km/h on motorways and 90 on main extra-urban roads: 120 on a motorway is already speeding for them. For the heavy vehicles listed in paragraph 3, paragraph 11 doubles amounts and suspensions.</p>
<!--mini:notturna-->
<h2>Repeat offences and several cameras within an hour</h2>
<p>The 2024 reform (law 177 of 2024) added a rule for towns: two offences of 10 to 40 km/h over in a built-up area within the same year cost ${h.eur(h.P.speeding.repeat_in_town_c8.min)} to ${h.eur(h.P.speeding.repeat_in_town_c8.max)} and a 15 to 30-day suspension. In the higher bands, a repeat within two years extends the suspension to 8 to 18 months (paragraph 9) or leads to revocation of the licence (paragraph 9-bis). The other way round, several offences recorded by the same body on its roads within an hour are punished as the most serious one plus a third, when that is better for the driver (paragraph 6-ter). Visitors who pass several cameras on the same provincial road during one trip should check this before paying each fine separately.</p>
<!--mini:plurime-->
<h2>What to check on the fine</h2>
<p>Before paying, check four things: the speed held and the reduction applied; the limit stated, which must match the sign; the service date, within 90 days of the offence being established (360 if the owner lives abroad); and the approval or homologation decree of the device. If one of them is wrong, the ${h.a('ricorso-multa-autovelox', 'appeal page')} explains what to do. If everything is in order, paying within 5 days is almost always cheapest: the ${h.a('multa-ridotta-30', 'reduced payment page')} works out the exact date.</p>`;
    },
  },
});
