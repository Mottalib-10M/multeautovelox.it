import { defineGuide, type Helpers } from '../../lib/guide-types';

const PT = (h: Helpers) => h.P.points;
const riga = (h: Helpers, art: string, comma: string) => h.TP.righe.find((r) => r.articolo === art && r.comma.startsWith(comma))!;
const NEO = (h: Helpers) => PT(h).neopatentato_doubling.factor;

/** Le righe più frequenti della tabella dell'art. 126-bis, con un'etichetta chiara. */
const COMUNI: Array<[string, string, string, string]> = [
  ['142', 'Comma 8', 'Velocità: oltre 10 e fino a 40 km/h', 'Speeding: over 10 and up to 40 km/h'],
  ['142', 'Comma 9', 'Velocità: oltre 40 e fino a 60 km/h', 'Speeding: over 40 and up to 60 km/h'],
  ['142', 'Comma 9-bis', 'Velocità: oltre 60 km/h', 'Speeding: over 60 km/h'],
  ['146', 'Comma 3', 'Passaggio con il semaforo rosso', 'Running a red light'],
  ['146', 'Comma 2', 'Segnaletica non rispettata (esclusi i divieti di sosta e fermata)', 'Ignoring a sign (except no-parking and no-stopping signs)'],
  ['149', 'Comma 4', 'Distanza di sicurezza', 'Safe distance'],
  ['172', 'Commi 10 e 11', 'Cintura o seggiolino non usati', 'Seat belt or child seat not used'],
  ['173', 'Comma 3-bis, primo', 'Telefono in mano alla guida', 'Phone in hand while driving'],
  ['173', 'Comma 3-bis, secondo', 'Telefono, nuova violazione nel biennio', 'Phone, repeat offence within two years'],
  ['158', 'Comma 2, lettere d)', 'Sosta alla fermata del bus o in corsia riservata', 'Parking at a bus stop or in a bus lane'],
  ['158', 'Comma 2, lettera g)', 'Sosta sul posto per persone invalide', 'Parking in a disabled bay'],
  ['186', 'Commi 2 e 7', 'Guida in stato di ebbrezza o rifiuto del test', 'Drink-driving or refusing the test'],
  ['186-bis', 'Comma 2', 'Alcol oltre zero per under 21, neopatentati e professionali', 'Any alcohol for under-21s, new and professional drivers'],
  ['187', 'Commi 1 e 8', 'Guida dopo aver assunto stupefacenti', 'Driving after taking drugs'],
  ['191', 'Comma 1', 'Precedenza ai pedoni sulle strisce', 'Giving way to pedestrians at crossings'],
  ['193', 'Comma 2', 'Guida senza assicurazione', 'Driving without insurance'],
];

export default defineGuide({
  id: 'decurtazione-punti-patente',
  group: 'punti',
  order: 2,
  tool: 'punti',
  outil: { mode: 'cumulo' },
  related: ['punti-patente', 'tabella-punti-patente', 'multa-eccesso-di-velocita', 'multa-cellulare-alla-guida', 'ricorso-multa-autovelox'],
  sources: ['cds126bis', 'tabella', 'cds173', 'cds146', 'cds186'],
  it: {
    slug: 'decurtazione-punti-patente',
    nav: 'Decurtazione punti patente',
    card: 'Quando i punti vengono tolti davvero, il tetto di 15 punti per più infrazioni insieme e il raddoppio per i neopatentati.',
    title: 'Decurtazione punti patente: quando scatta e tetto di 15',
    description: 'Decurtazione punti patente: i punti si tolgono quando la multa è definita, al massimo 15 per più infrazioni insieme salvo sospensione, doppi per i neopatentati.',
    h1: 'Decurtazione dei punti patente: quando e quanti',
    intro: 'Scegli due o tre infrazioni contestate nello stesso momento: il calcolo somma i punti della tabella, applica il tetto di 15 quando vale, li raddoppia per i neopatentati e mostra il saldo.',
    resume: (h) => `La decurtazione dei punti patente non avviene il giorno della multa ma quando la contestazione è definita: dopo il pagamento, alla fine dei ricorsi oppure quando sono scaduti i termini per presentarli. Da quel momento l’organo di polizia ha trenta giorni per comunicarla all’anagrafe nazionale, e il nuovo saldo compare sul Portale dell’automobilista. Il numero di punti è quello della tabella dell’articolo 126-bis e deve essere scritto sul verbale: ${h.num(riga(h, '142', 'Comma 8').punti)} per un eccesso tra 10 e 40 km/h, ${h.num(riga(h, '146', 'Comma 3').punti)} per il semaforo rosso, ${h.num(riga(h, '172', 'Commi 10').punti)} per la cintura, ${h.num(riga(h, '186', 'Commi 2').punti)} per la guida in stato di ebbrezza. Se più violazioni sono accertate insieme si perdono al massimo ${h.num(PT(h).max_simultaneous)} punti, ma il tetto non vale quando una di esse comporta la sospensione o la revoca della patente, come il telefono in mano o l’alcol. Nei primi tre anni di patente ogni punteggio raddoppia. Se nessuno è stato fermato, il proprietario dell’auto deve indicare chi guidava entro sessanta giorni dalla notifica.`,
    faqs: (h) => [
      { q: 'Quando vengono tolti i punti dopo una multa?', a: 'Quando la contestazione è definita: con il pagamento, con la fine dei ricorsi amministrativi e giudiziari, oppure quando scadono i termini per presentarli. Da quel momento l’organo di polizia ha trenta giorni per avvisare l’anagrafe nazionale degli abilitati alla guida. In pratica il saldo sul Portale dell’automobilista cambia qualche settimana dopo il pagamento, non il giorno della multa.' },
      { q: 'Quanti punti si possono perdere in un solo controllo?', a: `Per più violazioni accertate nello stesso momento al massimo ${h.num(PT(h).max_simultaneous)} punti, secondo il comma 1-bis dell’articolo 126-bis. Il tetto salta se una delle violazioni prevede la sospensione o la revoca della patente: telefono in mano, alcol oltre 0,5 g/l o velocità oltre 40 km/h sopra il limite. In quei casi i punti si sommano tutti, anche oltre ${h.num(PT(h).max_simultaneous)}.` },
      { q: 'Chi perde i punti se guidava un’altra persona?', a: 'Il conducente, non il proprietario. Se nessuno è stato fermato, il proprietario o chi risponde in solido con lui deve comunicare alla polizia i dati personali e della patente di chi guidava, entro sessanta giorni dalla notifica del verbale. Per un’auto aziendale lo fa il legale rappresentante. Chi non risponde senza un motivo giustificato riceve una sanzione a parte, ma non perde punti.' },
      { q: 'I neopatentati perdono sempre il doppio dei punti?', a: `Sì, per ogni violazione commessa nei primi ${h.num(PT(h).neopatentato_doubling.years)} anni dal rilascio, se la patente è stata rilasciata dopo il ${h.date(PT(h).neopatentato_doubling.issued_after)} a chi non aveva già una patente B o superiore. Chi prende la B avendo soltanto la patente A rientra comunque nel raddoppio, perché la nota esclude solo chi era già titolare della B o di una categoria superiore. Il raddoppio si applica violazione per violazione.` },
      { q: 'Il verbale indica quanti punti verranno tolti?', a: 'Deve indicarlo. Il comma 1 dell’articolo 126-bis impone che il punteggio di ogni violazione risulti dal verbale di contestazione. Il numero stampato è quello della tabella per una patente ordinaria; per un neopatentato vale il doppio. Conviene confrontarlo con la tabella prima di pagare, soprattutto quando sullo stesso verbale compaiono più violazioni e bisogna capire se il tetto dei 15 punti si applica.' },
    ],
    body: (h) => {
      const c1 = h.M.cumulati([riga(h, '146', 'Comma 3').punti, riga(h, '172', 'Commi 10').punti, riga(h, '142', 'Comma 8').punti]);
      const s2 = [h.M.altra('autostrada_contromano_retromarcia').punti, h.M.altra('cintura').punti, h.M.altra('semaforo_rosso').punti];
      const c2 = h.M.cumulati(s2);
      const s3 = [h.M.altra('alcol_05_08').punti, h.M.altra('cintura').punti, h.M.altra('semaforo_rosso').punti];
      const c3 = h.M.cumulati(s3, true);
      const s4 = [h.M.altra('semaforo_rosso', { neopatentato: true }).punti, h.M.altra('cintura', { neopatentato: true }).punti];
      const c4 = h.M.cumulati(s4);
      const s5 = [h.M.altra('cellulare').punti, h.M.altra('cintura').punti, riga(h, '146', 'Comma 3').punti];
      const c5 = h.M.cumulati(s5, true);
      const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
      return `<h2>Quando i punti vengono tolti davvero</h2>
<p>Il comma 2 dell’${h.src('cds126bis', 'articolo 126-bis')} lega la decurtazione alla «definizione della contestazione». La contestazione è definita in tre casi: quando la multa è pagata, quando si chiudono i ricorsi al prefetto o al giudice di pace, oppure quando i termini per presentarli sono scaduti senza ricorso. L’organo da cui dipende l’agente ha poi trenta giorni, da quando viene a sapere del pagamento o dell’esito, per comunicare la violazione all’anagrafe nazionale degli abilitati alla guida. Solo allora il saldo cambia e la variazione appare sul Portale dell’automobilista.</p>
<p>Ne seguono due conseguenze pratiche. La prima: tra la notifica e il calo dei punti passano di norma settimane, a volte mesi, e il saldo che vedi oggi può non contare una multa già pagata. La seconda: un ricorso sospende anche la decurtazione, che arriva solo se il ricorso viene respinto. Le regole e le scadenze del ricorso sono nella pagina sul ${h.a('ricorso-multa-autovelox', 'ricorso contro la multa')}. Per le violazioni penali, come la guida con un tasso alcolemico oltre 0,8 g/l, il comma 6-bis fa partire la comunicazione dalla sentenza irrevocabile: la cancelleria del giudice la trasmette entro quindici giorni all’organo che ha accertato il fatto.</p>
<h2>Chi perde i punti: conducente e proprietario</h2>
<p>I punti si tolgono al conducente responsabile. Quando la violazione è accertata senza fermare il veicolo, per esempio con un autovelox, il verbale arriva al proprietario, che entro sessanta giorni dalla notifica deve comunicare alla polizia i dati personali e della patente di chi guidava. Per le auto intestate a una società lo fa il legale rappresentante o un suo delegato. Chi omette i dati senza un motivo giustificato e documentato paga una sanzione autonoma, prevista dallo stesso comma 2, ma non subisce la decurtazione al posto del conducente. Il verbale, in ogni caso, deve indicare quanti punti comporta la violazione (comma 1).</p>
<h2>Più infrazioni insieme: il tetto di ${h.num(PT(h).max_simultaneous)} punti</h2>
<p>Il comma 1-bis fissa un massimo di ${h.num(PT(h).max_simultaneous)} punti quando più violazioni sono accertate contemporaneamente, cioè nello stesso controllo. Il tetto non vale se una delle violazioni prevede la sospensione o la revoca della patente: allora si sommano tutti i punti. Cinque casi calcolati con la tabella in vigore:</p>
${h.table(['Infrazioni contestate insieme', 'Somma', 'Punti tolti', 'Perché'], [
  ['Semaforo rosso, cintura, velocità tra 10 e 40 km/h', h.num(riga(h, '146', 'Comma 3').punti + riga(h, '172', 'Commi 10').punti + riga(h, '142', 'Comma 8').punti), h.num(c1), 'sotto il tetto'],
  ['Retromarcia in autostrada, cintura, semaforo rosso', h.num(sum(s2)), h.num(c2), 'tetto applicato'],
  ['Alcol tra 0,5 e 0,8 g/l, cintura, semaforo rosso', h.num(sum(s3)), h.num(c3), 'sospensione per l’alcol: niente tetto'],
  ['Telefono in mano, cintura, semaforo rosso', h.num(sum(s5)), h.num(c5), 'sospensione per il telefono: niente tetto'],
  ['Neopatentato: semaforo rosso e cintura', h.num(sum(s4)), h.num(c4), 'punti doppi, poi tetto'],
], 'Decurtazione per più violazioni accertate insieme (art. 126-bis c.1-bis)', ['l', 'r', 'r', 'l'])}
<p>Il terzo e il quarto caso mostrano la trappola: basta una violazione con sospensione, come il ${h.a('multa-cellulare-alla-guida', 'telefono in mano alla guida')}, perché il tetto cada e i punti di tutte le altre si sommino per intero. Il tetto vale solo per le violazioni accertate nello stesso momento; due multe in giorni diversi sono due decurtazioni distinte.</p>
<!--mini:cumulo-->
<h2>Neopatentati: il raddoppio</h2>
<p>La nota finale della ${h.src('tabella', 'tabella dei punteggi')} raddoppia i punti di ogni singola violazione commessa nei primi ${h.num(PT(h).neopatentato_doubling.years)} anni dal rilascio, per le patenti rilasciate dopo il ${h.date(PT(h).neopatentato_doubling.issued_after)} a chi non era già titolare di una patente B o superiore. Il raddoppio si applica riga per riga: ${h.num(riga(h, '173', 'Comma 3-bis, primo').punti)} punti per il telefono diventano ${h.num(riga(h, '173', 'Comma 3-bis, primo').punti * NEO(h))}, ${h.num(riga(h, '186', 'Commi 2').punti)} per l’alcol diventano ${h.num(riga(h, '186', 'Commi 2').punti * NEO(h))}. Con un saldo di partenza di ${h.num(PT(h).initial)}, due violazioni gravi nei primi anni bastano a esaurire la patente. Per i neopatentati l’${h.src('cds186', 'articolo 186-bis')} aggiunge una regola propria: ogni tasso alcolemico sopra zero è una violazione, con ${h.num(riga(h, '186-bis', 'Comma 2').punti)} punti in tabella (${h.num(riga(h, '186-bis', 'Comma 2').punti * NEO(h))} con il raddoppio).</p>
<h2>Le decurtazioni più frequenti</h2>
<p>La tabella completa ha ${h.num(h.TP.righe.length)} righe; queste sono quelle che si incontrano più spesso su un verbale. La colonna dei neopatentati applica il raddoppio alla singola violazione.</p>
${h.table(['Infrazione', 'Norma', 'Punti', 'Neopatentato'], COMUNI.map(([art, c, it]) => { const r = riga(h, art, c); return [it, `art. ${r.articolo}, ${r.comma.split(', ad eccezione')[0].toLowerCase()}`, h.num(r.punti), h.num(r.punti * NEO(h))]; }), `Punti tolti dalla tabella dell’art. 126-bis, in vigore dal 12 aprile 2025`, ['l', 'l', 'r', 'r'])}
<p>Le altre righe riguardano sorpassi, precedenze, carichi, tempi di guida dei professionisti, comportamento dopo un incidente e controlli di polizia: le trovi tutte nella ${h.a('tabella-punti-patente', 'tabella punti patente')}. I punteggi sono quelli letti su Normattiva il ${h.date(h.P.retrieved_at)}, in vigore nel 2026.</p>
<!--mini:infrazione-->
<h2>Tre violazioni in un anno: la revisione anche con punti in saldo</h2>
<p>La decurtazione non è l’unico effetto da tenere d’occhio. Il comma 6 impone la revisione della patente a chi, dopo la notifica di una prima violazione da almeno cinque punti, ne commette altre due da almeno cinque punti ciascuna, non nello stesso momento, entro dodici mesi dalla prima. Telefono, cintura e semaforo rosso valgono tutti almeno cinque punti: tre episodi separati nello stesso anno portano a rifare l’esame anche se il saldo è ancora positivo. La pagina sui ${h.a('punti-patente', 'punti patente')} spiega come recuperarli e cosa succede a zero.</p>`;
    },
  },
  en: {
    slug: 'italy-licence-points-deduction',
    nav: 'Points deductions',
    card: 'When points actually come off, the 15-point cap for offences found together and double points for new drivers.',
    title: 'Licence points deduction in Italy: timing and 15-point cap',
    description: 'Licence points deduction in Italy: points go once a fine is settled, max 15 for offences found together unless one means suspension, double for new drivers.',
    h1: 'Licence points deductions in Italy: when and how many',
    intro: 'Pick two or three offences recorded at the same time: the calculator adds up the table’s points, applies the 15-point cap where it counts, doubles them for new drivers and shows your balance.',
    resume: (h) => `Points are not taken off an Italian licence on the day of the fine but once the offence is settled (the law says «definita»): when the fine is paid, when any appeal ends, or when the appeal deadlines pass. From then the police body has thirty days to report it to the national register of licence holders, and the new balance appears on the Portale dell’automobilista, the licensing authority’s website. The number of points comes from the table of article 126-bis of the Highway Code and must be printed on the fine: ${h.num(riga(h, '142', 'Comma 8').punti)} for speeding by 10 to 40 km/h, ${h.num(riga(h, '146', 'Comma 3').punti)} for a red light, ${h.num(riga(h, '172', 'Commi 10').punti)} for a seat belt, ${h.num(riga(h, '186', 'Commi 2').punti)} for drink-driving. When several offences are found at the same time, at most ${h.num(PT(h).max_simultaneous)} points come off, but the cap does not apply if one of them carries a licence suspension or revocation, such as a phone in hand or alcohol. In the first three years of a licence every figure doubles. If nobody was stopped, the car’s owner must name the driver within sixty days of being served.`,
    faqs: (h) => [
      { q: 'When are points actually taken off an Italian licence?', a: 'Once the offence is settled: when the fine is paid, when the administrative or court appeals are over, or when the time to bring them runs out. The police body then has thirty days to inform the national register of licence holders. In practice the balance on the Portale dell’automobilista changes a few weeks after you pay, not on the day of the offence.' },
      { q: 'What is the most points you can lose in one stop in Italy?', a: `For several offences found at the same time, ${h.num(PT(h).max_simultaneous)} points at most, under paragraph 1-bis of article 126-bis. The cap disappears if one of the offences carries a suspension or revocation of the licence: a phone in hand, alcohol above 0.5 g/l or speeding more than 40 km/h over the limit. Then every point counts, even beyond ${h.num(PT(h).max_simultaneous)}.` },
      { q: 'I was driving a rental car: whose points are deducted?', a: 'Yours, as the driver. The fine first goes to the rental company as owner, which must give the police your personal and licence details within sixty days of being served; for a company the legal representative does it. A fresh fine is then served on you, stating the points. The rental company does not lose points in your place.' },
      { q: 'Do new drivers always lose double points in Italy?', a: `Yes, for every offence committed in the first ${h.num(PT(h).neopatentato_doubling.years)} years after the licence was issued, if it was issued after ${h.date(PT(h).neopatentato_doubling.issued_after)} to someone who did not already hold a category B licence or higher. A motorcycle licence alone (category A) does not exempt you, since the note speaks of B or higher. The doubling is applied offence by offence.` },
      { q: 'Does the Italian fine say how many points I will lose?', a: 'It must. Paragraph 1 of article 126-bis requires the points for each offence to be stated on the verbale, the document that records the offence. The figure is the table’s figure for a standard licence; if you are a new driver, the doubled amount applies. Check it against the table before paying, especially when several offences appear on the same document.' },
    ],
    body: (h) => {
      const c1 = h.M.cumulati([riga(h, '146', 'Comma 3').punti, riga(h, '172', 'Commi 10').punti, riga(h, '142', 'Comma 8').punti]);
      const s2 = [h.M.altra('autostrada_contromano_retromarcia').punti, h.M.altra('cintura').punti, h.M.altra('semaforo_rosso').punti];
      const c2 = h.M.cumulati(s2);
      const s3 = [h.M.altra('alcol_05_08').punti, h.M.altra('cintura').punti, h.M.altra('semaforo_rosso').punti];
      const c3 = h.M.cumulati(s3, true);
      const s4 = [h.M.altra('semaforo_rosso', { neopatentato: true }).punti, h.M.altra('cintura', { neopatentato: true }).punti];
      const c4 = h.M.cumulati(s4);
      const s5 = [h.M.altra('cellulare').punti, h.M.altra('cintura').punti, riga(h, '146', 'Comma 3').punti];
      const c5 = h.M.cumulati(s5, true);
      const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
      const para = (c: string) => c.toLowerCase().replace('commi', 'paras.').replace('comma', 'para.').replace('lettere', 'letters').replace('lettera', 'letter').replace('primo periodo', 'first sentence').replace('secondo periodo', 'second sentence').replace(' e ', ' and ');
      return `<h2>When points actually come off</h2>
<p>Paragraph 2 of ${h.src('cds126bis', 'article 126-bis')} ties the deduction to the offence being «definita», settled. That happens in three ways: the fine is paid, the appeals to the prefetto (the government’s representative in each province) or to the giudice di pace (the local magistrate) are over, or the deadlines to appeal pass without one. The police body then has thirty days, from learning of the payment or the outcome, to report the offence to the national register of licence holders. Only then does the balance change and show on the Portale dell’automobilista.</p>
<p>Two things follow. First, weeks or even months usually pass between the fine and the drop in points, so today’s balance may not include a fine you have already paid. Second, an appeal also holds up the deduction, which only happens if the appeal fails; how appeals work is covered on the ${h.a('ricorso-multa-autovelox', 'appeals page')}. For criminal offences, such as driving with more than 0.8 g/l of alcohol, paragraph 6-bis starts the process from the final judgment: the court registry sends it within fifteen days to the body that recorded the offence.</p>
<h2>Who loses the points: driver and owner</h2>
<p>Points come off the licence of the driver responsible. When an offence is recorded without stopping the car, by a speed camera for example, the fine goes to the registered owner, who must give the police the driver’s personal and licence details within sixty days of service. For company cars, the legal representative or a delegate does it. An owner who fails to do so without a justified and documented reason faces a separate fine under the same paragraph 2, but does not take the driver’s points. Either way, the fine must state the points the offence carries (paragraph 1).</p>
<h2>Several offences at once: the ${h.num(PT(h).max_simultaneous)}-point cap</h2>
<p>Paragraph 1-bis caps the loss at ${h.num(PT(h).max_simultaneous)} points when several offences are found at the same time, that is in the same stop. The cap does not apply if one of them carries a suspension or revocation of the licence: then all the points add up. Five cases worked out with the current table:</p>
${h.table(['Offences found together', 'Sum', 'Points taken', 'Why'], [
  ['Red light, seat belt, speeding by 10 to 40 km/h', h.num(riga(h, '146', 'Comma 3').punti + riga(h, '172', 'Commi 10').punti + riga(h, '142', 'Comma 8').punti), h.num(c1), 'below the cap'],
  ['Reversing on a motorway, seat belt, red light', h.num(sum(s2)), h.num(c2), 'cap applied'],
  ['Alcohol 0.5 to 0.8 g/l, seat belt, red light', h.num(sum(s3)), h.num(c3), 'alcohol means suspension: no cap'],
  ['Phone in hand, seat belt, red light', h.num(sum(s5)), h.num(c5), 'phone means suspension: no cap'],
  ['New driver: red light and seat belt', h.num(sum(s4)), h.num(c4), 'double points, then the cap'],
], 'Points deducted for offences found together (article 126-bis, paragraph 1-bis)', ['l', 'r', 'r', 'l'])}
<p>The third and fourth rows show the trap: a single offence carrying a suspension, such as a ${h.a('multa-cellulare-alla-guida', 'phone in hand while driving')}, removes the cap and every other offence counts in full. The cap only covers offences found at the same moment; two fines on different days are two separate deductions.</p>
<!--mini:cumulo-->
<h2>New drivers: double points</h2>
<p>The final note of the ${h.src('tabella', 'points table')} doubles the points for each offence committed in the first ${h.num(PT(h).neopatentato_doubling.years)} years, for licences issued after ${h.date(PT(h).neopatentato_doubling.issued_after)} to people who did not already hold a category B licence or higher. The doubling works row by row: ${h.num(riga(h, '173', 'Comma 3-bis, primo').punti)} points for a phone become ${h.num(riga(h, '173', 'Comma 3-bis, primo').punti * NEO(h))}, ${h.num(riga(h, '186', 'Commi 2').punti)} for drink-driving become ${h.num(riga(h, '186', 'Commi 2').punti * NEO(h))}. Starting from ${h.num(PT(h).initial)}, two serious offences in the early years can empty a licence. ${h.src('cds186', 'Article 186-bis')} adds a rule of its own for new drivers: any alcohol above zero is an offence, worth ${h.num(riga(h, '186-bis', 'Comma 2').punti)} points in the table (${h.num(riga(h, '186-bis', 'Comma 2').punti * NEO(h))} once doubled).</p>
<h2>The most common deductions</h2>
<p>The full table has ${h.num(h.TP.righe.length)} rows; these are the ones most often seen on an Italian fine. The new-driver column applies the doubling to a single offence.</p>
${h.table(['Offence', 'Rule', 'Points', 'New driver'], COMUNI.map(([art, c, , en]) => { const r = riga(h, art, c); return [en, `art. ${r.articolo}, ${para(r.comma.split(', ad eccezione')[0])}`, h.num(r.punti), h.num(r.punti * NEO(h))]; }), 'Points from the article 126-bis table, in force since 12 April 2025', ['l', 'l', 'r', 'r'])}
<p>The other rows cover overtaking, right of way, loads, professional drivers’ hours, conduct after an accident and police checks: they are all in the ${h.a('tabella-punti-patente', 'full points table')}. The figures were read on Normattiva on ${h.date(h.P.retrieved_at)} and are in force in 2026.</p>
<!--mini:infrazione-->
<h2>Three offences in a year: re-examination with points left</h2>
<p>The deduction is not the only effect to watch. Paragraph 6 orders a re-examination of the licence for a driver who, after being served a first offence worth at least five points, commits two more of at least five points each, at different times, within twelve months of the first. Phone, seat belt and red light are all worth five points or more: three separate episodes in one year mean sitting the tests again even with points left. The ${h.a('punti-patente', 'licence points page')} explains how to win points back and what happens at zero.</p>`;
    },
  },
});
