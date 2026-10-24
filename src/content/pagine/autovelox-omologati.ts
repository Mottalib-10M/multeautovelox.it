import { defineGuide, type Helpers } from '../../lib/guide-types';
import DEC from '../../../public/data/decreti.json';

type Dec = { n: number; date: Array<[string, number]>; modelli: Array<[string, number]>; province: number };
const D = DEC as unknown as Record<string, Dec>;
const TOP = () => Object.entries(D).sort((a, b) => b[1].n - a[1].n).slice(0, 12);
const I = (h: Helpers) => h.S.italia;
/** Appareils par période de date du décret : avant 2010, 2010-2019, depuis 2020. */
const periodi = (h: Helpers) => {
  const a = h.S.italia.anni_decreto as Record<string, number>;
  const s = (f: (y: number) => boolean) => Object.entries(a).filter(([y]) => f(Number(y))).reduce((x, [, n]) => x + n, 0);
  return { prima: s((y) => y < 2010), dieci: s((y) => y >= 2010 && y < 2020), venti: s((y) => y >= 2020) };
};
const nTot = (h: Helpers) => { const p = periodi(h); return p.prima + p.dieci + p.venti; };

export default defineGuide({
  id: 'autovelox-omologati',
  group: 'autovelox',
  order: 6,
  tool: 'velox',
  outil: { mode: 'decreto', defaultDecreto: '3248' },
  related: ['ricorso-multa-autovelox', 'elenco-autovelox', 'autovelox', 'autovelox-roma', 'tolleranza-autovelox'],
  sources: ['cds142', 'mitVelox', 'mitNews', 'cds204bis', 'dlgs150'],
  it: {
    slug: 'autovelox-omologati',
    nav: 'Autovelox omologati e decreti',
    card: 'Approvazione o omologazione: cosa dice il decreto sul verbale e quanti apparecchi lo citano nel registro.',
    title: 'Autovelox omologati 2026: decreti nel registro e Cassazione',
    description: 'Autovelox omologati o solo approvati: cosa dice la Cassazione, come leggere il decreto sul verbale e quanti apparecchi del registro MIT citano ogni decreto.',
    h1: 'Autovelox omologati: cerca il decreto del tuo verbale nel registro',
    intro: 'Scrivi il numero del decreto stampato sul verbale: vedi quanti apparecchi lo citano nel registro, con quali date e modelli. Sotto, perché la parola «omologato» conta.',
    resume: (h) => `Un autovelox omologato è un apparecchio il cui modello ha superato la procedura di omologazione del Ministero, che ne verifica la conformità tecnica; un apparecchio approvato ha ottenuto invece un decreto di approvazione del modello. L’articolo 142, comma 6, del Codice della Strada considera prova le misure di «apparecchiature debitamente omologate». Con l’ordinanza n. 10505 del 18 aprile 2024 la Corte di cassazione ha ritenuto che l’approvazione non basti a sostituire l’omologazione, e da allora molti ricorsi chiedono di verificare il decreto citato sul verbale. Il registro nazionale degli apparecchi, pubblicato dal Ministero delle infrastrutture e dei trasporti, riporta per ognuno il numero e la data del «decreto di approvazione o omologazione» dichiarato dall’ente, senza dire quale dei due sia. Nella copia del ${h.date(h.reg)} i ${h.num(I(h).totale)} apparecchi citano ${h.num(I(h).decreti_distinti)} decreti diversi; il più citato, il n. ${TOP()[0][0]} del ${TOP()[0][1].date[0][0]}, compare ${h.num(TOP()[0][1].n)} volte. Il registro non decide la questione: la valutazione resta al giudice del singolo ricorso.`,
    faqs: (h) => [
      { q: 'Che differenza c’è tra autovelox approvato e omologato?', a: 'Sono due procedure ministeriali diverse. L’approvazione riguarda il modello e ne autorizza l’uso; l’omologazione verifica la conformità dell’apparecchio a requisiti tecnici fissati. L’articolo 142 parla di apparecchiature «debitamente omologate», e la Cassazione nel 2024 ha ritenuto che l’approvazione non basti. La questione resta discussa e ogni giudice la valuta nel caso concreto.' },
      { q: 'Dove trovo il decreto dell’autovelox sul verbale?', a: 'Di solito nella parte che descrive l’accertamento: il verbale indica marca e modello dell’apparecchio, la matricola e gli estremi del decreto ministeriale, con numero e data. A volte cita anche le estensioni successive. Copia il numero principale nel calcolatore: vedi quanti apparecchi del registro lo citano, con quali modelli e date.' },
      { q: 'Se il decreto è solo di approvazione la multa è nulla?', a: 'Non automaticamente. Dopo l’ordinanza della Cassazione la questione viene sollevata in molti ricorsi, ma ogni giudice decide sugli atti del singolo caso e l’esito non è scontato. Chi vuole sollevare la questione deve farlo nel ricorso, entro i termini: 60 giorni per il prefetto, 30 per il giudice di pace. Pagare la multa chiude la possibilità di contestarla.' },
      { q: 'Quanti decreti diversi ci sono nel registro?', a: `Nella copia del ${h.date(h.reg)} gli enti citano ${h.num(I(h).decreti_distinti)} numeri di decreto diversi per ${h.num(I(h).totale)} apparecchi. I dodici più citati coprono più della metà degli apparecchi: telelaser, Autovelox Sodi, Velomatic, Trucam e i tutor autostradali. Alcuni numeri sono scritti con date in formati diversi, che il sito raggruppa sotto lo stesso decreto.` },
    ],
    body: (h) => {
      const p = periodi(h), t = nTot(h);
      return `<h2>I decreti più citati nel registro</h2>
${h.table(['Decreto n.', 'Data dichiarata', 'Modello più frequente', 'Apparecchi', 'Province'], TOP().map(([k, v]) => [k, v.date[0][0], v.modelli[0][0], v.n, v.province]), `I 12 decreti citati più spesso, registro MIT del ${h.date(h.reg)}; «province» = province dove compaiono apparecchi di comuni o organi provinciali`, ['r', 'r', 'l', 'r', 'r'])}
<p>Dodici decreti coprono ${h.num(TOP().reduce((a, [, v]) => a + v.n, 0))} apparecchi su ${h.num(I(h).totale)}. In testa ci sono i telelaser e i Trucam della Eltraff, gli Autovelox 106 della Sodi Scientifica e i Velomatic. Due decreti con zero o quasi zero province sono quelli dei sistemi in autostrada: il SICVe del 2004 e il Tutor 3.0 del 2024 sono dichiarati quasi solo dalla Polizia Stradale, che il registro non lega a nessuna provincia. L’ultimo arrivato tra i più diffusi è il decreto n. 342 del 2 ottobre 2025.</p>
<!--mini:velox-->
<h2>Quanto sono vecchi i decreti</h2>
${h.table(['Data del decreto', 'Apparecchi', 'Quota'], [['prima del 2010', p.prima, h.pct(p.prima / t, 0)], ['dal 2010 al 2019', p.dieci, h.pct(p.dieci / t, 0)], ['dal 2020', p.venti, h.pct(p.venti / t, 0)]], `Apparecchi del registro MIT per anno del decreto dichiarato, copia del ${h.date(h.reg)} (date leggibili: ${h.num(t)} apparecchi)`, ['l', 'r', 'r'])}
<p>Un decreto vecchio non è di per sé un problema: un modello approvato nel 2000 può essere ancora in uso, con estensioni successive che l’ente riporta nelle note. Conta che l’apparecchio usato corrisponda al modello del decreto e che sia stato tarato e verificato come prescritto. Il registro non contiene le date di taratura: per quelle bisogna chiedere all’ente, ad esempio con un accesso agli atti.</p>
<h2>Cosa ha detto la Cassazione</h2>
<p>Con l’ordinanza n. 10505 del 18 aprile 2024, la Corte di cassazione ha esaminato una multa rilevata da un apparecchio approvato ma non omologato e ha ritenuto che le due procedure non siano equivalenti: per l’articolo 142, comma 6, la misura fa prova se l’apparecchio è «debitamente omologato». La decisione ha avuto molto seguito nei ricorsi, ma non è una legge: i giudici di pace la applicano caso per caso, e l’orientamento può cambiare con nuove pronunce o con un intervento normativo. Il censimento del 2025 è nato anche per dare trasparenza su questo punto: il Ministero lo presenta come passaggio per la «piena legittimità d’uso» degli strumenti (${h.src('mitNews', 'comunicato del 28 novembre 2025')}).</p>
<h2>Come usare la ricerca per decreto</h2>
<p>Scrivi nel calcolatore il numero principale del decreto citato sul verbale, senza zeri iniziali. Il risultato mostra quanti apparecchi del registro lo citano, le date dichiarate, i modelli e il numero di province. Se il numero non compare, controlla di averlo copiato bene e ricorda che la copia è del ${h.date(h.reg)}. Poi, nell’${h.a('elenco-autovelox', 'elenco per comune')}, cerca l’ente che ha emesso il verbale e verifica che l’apparecchio sia tra i suoi. Se vuoi contestare, la pagina sul ${h.a('ricorso-multa-autovelox', 'ricorso contro la multa autovelox')} spiega i termini: ${h.num(h.P.appeal.prefetto.days)} giorni per il prefetto, ${h.num(h.P.appeal.giudice_di_pace.days)} per il giudice di pace (${h.src('dlgs150', 'articolo 7 del decreto legislativo 150/2011')}).</p>`;
    },
  },
  en: {
    slug: 'italy-homologated-speed-cameras',
    nav: 'Homologated cameras and decrees',
    card: 'Approval or homologation: what the decree on your fine says and how many devices quote it in the register.',
    title: 'Homologated speed cameras in Italy: decrees and the courts',
    description: 'Homologated or only approved speed cameras in Italy: what the Court of Cassation said, how to read the decree on a fine, how many devices quote each decree.',
    h1: 'Homologated speed cameras: look up the decree on your Italian fine',
    intro: 'Type the decree number printed on your fine: see how many devices in the register quote it, with which dates and models. Below, why the word “omologato” matters.',
    resume: (h) => `A homologated speed camera (autovelox omologato) is a device whose model has passed the ministry’s homologation procedure, which checks it against technical requirements; an approved device has instead received a decree approving the model. Article 142, paragraph 6, of the Italian Highway Code accepts as evidence the readings of “duly homologated” equipment. In order 10505 of 18 April 2024 the Court of Cassation held that approval does not stand in for homologation, and since then many appeals ask for the decree quoted on the fine to be checked. The national register of devices, published by the Ministry of Infrastructure and Transport, gives for each one the number and date of the “approval or homologation decree” declared by the police body, without saying which of the two it is. In the copy of ${h.date(h.reg)} the ${h.num(I(h).totale)} devices quote ${h.num(I(h).decreti_distinti)} different decrees; the most quoted, number ${TOP()[0][0]} of ${TOP()[0][1].date[0][0]}, appears ${h.num(TOP()[0][1].n)} times. The register does not settle the question: it is for the judge hearing each appeal.`,
    faqs: (h) => [
      { q: 'What is the difference between an approved and a homologated speed camera in Italy?', a: 'They are two separate ministry procedures. Approval concerns the model and authorises its use; homologation checks the device against set technical requirements. Article 142 speaks of “duly homologated” equipment, and the Court of Cassation found in 2024 that approval is not enough. The point is still argued and each judge weighs it on the facts.' },
      { q: 'Can a foreign driver raise the homologation point in an appeal?', a: `Yes, the same grounds are open to anyone fined in Italy. From abroad the appeal to the giudice di pace can be filed within ${h.num(h.P.appeal.giudice_di_pace.days_abroad)} days instead of ${h.num(h.P.appeal.giudice_di_pace.days)}, and it is written in Italian. Paying the fine closes the matter, so decide before paying. The outcome depends on the judge and on the documents of the case.` },
      { q: 'How many different decrees are in the register?', a: `In the copy of ${h.date(h.reg)} the police bodies quote ${h.num(I(h).decreti_distinti)} different decree numbers for ${h.num(I(h).totale)} devices. The twelve most quoted cover more than half of all devices: laser guns, Sodi Autovelox units, Velomatic, Trucam and the motorway tutor systems. Some numbers come with dates in different formats, which the site groups under one decree.` },
    ],
    body: (h) => {
      const p = periodi(h), t = nTot(h);
      return `<h2>The decrees quoted most often</h2>
${h.table(['Decree no.', 'Date declared', 'Most frequent model', 'Devices', 'Provinces'], TOP().map(([k, v]) => [k, v.date[0][0], v.modelli[0][0], v.n, v.province]), `The 12 most quoted decrees, MIT register of ${h.date(h.reg)}; “provinces” = provinces where town or provincial devices appear`, ['r', 'r', 'l', 'r', 'r'])}
<p>Twelve decrees cover ${h.num(TOP().reduce((a, [, v]) => a + v.n, 0))} of ${h.num(I(h).totale)} devices. At the top are Eltraff’s laser guns and Trucam units, Sodi Scientifica’s Autovelox 106 and the Velomatic. Two decrees with zero or almost zero provinces belong to motorway systems: the 2004 SICVe and the 2024 Tutor 3.0 are declared almost only by the Polizia Stradale, which the register ties to no province. The newest among the widespread ones is decree 342 of 2 October 2025.</p>
<!--mini:velox-->
<h2>How old the decrees are</h2>
${h.table(['Decree date', 'Devices', 'Share'], [['before 2010', p.prima, h.pct(p.prima / t, 0)], ['2010 to 2019', p.dieci, h.pct(p.dieci / t, 0)], ['since 2020', p.venti, h.pct(p.venti / t, 0)]], `MIT register devices by year of the declared decree, copy of ${h.date(h.reg)} (readable dates: ${h.num(t)} devices)`, ['l', 'r', 'r'])}
<p>An old decree is not a problem in itself: a model approved in 2000 can still be in use, with later extensions that the body lists in the notes. What matters is that the device used matches the model in the decree and has been calibrated and checked as required. The register holds no calibration dates: for those you have to ask the police body, for example through a request for access to documents.</p>
<h2>What the Court of Cassation said</h2>
<p>In order 10505 of 18 April 2024 the Court of Cassation examined a fine recorded by a device that was approved but not homologated and held that the two procedures are not equivalent: under article 142, paragraph 6, a reading is evidence when the device is “duly homologated”. The decision has been widely relied on in appeals, but it is not a statute: justices of the peace apply it case by case, and the position may shift with new rulings or new legislation. The 2025 census was also meant to bring transparency on this point: the ministry presents it as a step towards the “full legitimacy of use” of the devices (${h.src('mitNews', 'press release of 28 November 2025')}).</p>
<h2>Using the decree search</h2>
<p>Type in the tool the main decree number quoted on your fine, without leading zeros. The result shows how many register devices quote it, the dates declared, the models and the number of provinces. If the number is missing, check you copied it correctly and remember the copy dates from ${h.date(h.reg)}. Then, in the ${h.a('elenco-autovelox', 'list by town')}, look up the body that issued the fine and check that the device is among its own. To contest, the ${h.a('ricorso-multa-autovelox', 'appeal page')} sets out the deadlines: ${h.num(h.P.appeal.prefetto.days)} days for the prefetto, ${h.num(h.P.appeal.giudice_di_pace.days)} for the giudice di pace, ${h.num(h.P.appeal.giudice_di_pace.days_abroad)} from abroad (${h.src('dlgs150', 'article 7 of legislative decree 150/2011')}).</p>`;
    },
  },
});
