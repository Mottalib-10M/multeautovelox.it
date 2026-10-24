import { defineGuide, type Helpers } from '../../lib/guide-types';

const PT = (h: Helpers) => h.P.points;
/** Riga della tabella dell'art. 126-bis : articolo e comma esatti. */
const riga = (h: Helpers, art: string, comma: string) => h.TP.righe.find((r) => r.articolo === art && r.comma === comma)!.punti;

export default defineGuide({
  id: 'punti-patente',
  group: 'punti',
  order: 1,
  tool: 'punti',
  outil: { mode: 'saldo' },
  related: ['decurtazione-punti-patente', 'tabella-punti-patente', 'multa-cellulare-alla-guida', 'multa-eccesso-di-velocita', 'sanzioni-codice-della-strada'],
  sources: ['cds126bis', 'tabella', 'cds117', 'cds202'],
  it: {
    slug: 'punti-patente',
    nav: 'Punti patente',
    card: 'Si parte da 20 punti: come si controlla il saldo, quando tornano, il bonus fino a 30 e cosa succede a zero.',
    title: 'Punti patente 2026: saldo, recupero, bonus e revisione',
    description: 'Punti patente: si parte da 20, il saldo si controlla sul Portale dell’automobilista, tornano dopo 2 anni puliti o con un corso. Calcola il saldo e la revisione.',
    h1: 'Punti patente: saldo, recupero e cosa succede a zero',
    intro: 'Scrivi i punti che hai oggi e l’infrazione contestata: vedi il saldo che resta, se scatta la revisione e quanti punti puoi recuperare con un corso o con due anni senza infrazioni.',
    resume: (h) => `Ogni patente italiana nasce con ${h.num(PT(h).initial)} punti, annotati nell’anagrafe nazionale degli abilitati alla guida, e ogni variazione del saldo è comunicata tramite il Portale dell’automobilista, dove il titolare può consultarlo. Le infrazioni elencate nella tabella dell’articolo 126-bis tolgono da 1 a 10 punti ciascuna: ${h.num(riga(h, '142', 'Comma 8'))} per un eccesso di velocità tra 10 e 40 km/h, ${h.num(h.M.altra('cellulare').punti)} per il telefono in mano, ${h.num(h.M.altra('alcol_05_08').punti)} per l’alcol oltre 0,5 g/l. Due anni senza violazioni che tolgono punti riportano il saldo a ${h.num(PT(h).initial)}; chi è già a ${h.num(PT(h).initial)} riceve ${h.num(PT(h).bonus.points)} punti di bonus ogni due anni, fino a ${h.num(PT(h).bonus.max)} in più. Un corso di aggiornamento in autoscuola con esame finale restituisce ${h.num(PT(h).recovery_course.points)} punti, ${h.num(PT(h).recovery_course.points_professional)} per i conducenti professionali, purché il saldo non sia già a zero. A zero punti la patente va sottoposta a revisione: si rifanno gli esami di teoria e di guida. Chi ha la patente da meno di tre anni perde il doppio dei punti per ogni infrazione.`,
    faqs: (h) => [
      { q: 'Come si controlla il saldo dei punti della patente?', a: `Il comma 3 dell’articolo 126-bis stabilisce che ogni variazione del punteggio è comunicata tramite il Portale dell’automobilista, il servizio online della Motorizzazione. Lì il titolare vede il saldo registrato nell’anagrafe nazionale. Ricorda che una multa appena ricevuta non compare subito: i punti si tolgono solo quando la contestazione è definita, cioè dopo il pagamento o quando scadono i termini per il ricorso.` },
      { q: 'Dopo quanto tempo tornano i 20 punti?', a: `Dopo due anni senza violazioni che comportano la perdita di punti, il saldo torna al punteggio iniziale di ${h.num(PT(h).initial)}, come dice il comma 5 dell’articolo 126-bis. Il ritorno è automatico e non serve alcuna domanda. Non vale se la patente ha perso tutti i punti: in quel caso c’è la revisione, con un nuovo esame di teoria e di guida.` },
      { q: 'Si può arrivare a più di 20 punti?', a: `Sì. Chi ha almeno ${h.num(PT(h).initial)} punti e resta due anni senza violazioni che tolgono punti riceve un credito di ${h.num(PT(h).bonus.points)} punti, fino a un massimo di ${h.num(PT(h).bonus.max)} punti in più: il saldo più alto possibile è quindi ${h.num(PT(h).initial + PT(h).bonus.max)}. Servono dieci anni puliti per arrivarci, e il bonus si consuma come gli altri punti alla prima decurtazione.` },
      { q: 'Cosa succede se la patente arriva a zero punti?', a: 'Il titolare deve sottoporsi di nuovo all’esame di idoneità tecnica dell’articolo 128, cioè teoria e guida: l’ufficio della Motorizzazione dispone la revisione della patente. Se l’esame non viene sostenuto entro trenta giorni dalla notifica del provvedimento, la patente è sospesa a tempo indeterminato. A zero punti il corso di recupero non è più possibile.' },
      { q: 'Quanti punti si recuperano con il corso in autoscuola?', a: `Il corso di aggiornamento, organizzato da autoscuole o da enti autorizzati, restituisce ${h.num(PT(h).recovery_course.points)} punti; per i titolari di certificato di abilitazione professionale con patente B, C, C+E, D o D+E i punti sono ${h.num(PT(h).recovery_course.points_professional)}. I punti tornano solo dopo una prova d’esame, e l’attestato va trasmesso alla Motorizzazione. Il corso si può fare solo se il saldo non è esaurito.` },
    ],
    body: (h) => {
      const t = [riga(h, '142', 'Comma 8'), h.M.altra('cellulare').punti, h.M.altra('cintura').punti, h.M.altra('semaforo_rosso').punti];
      const dopo = h.M.saldo(12, h.M.altra('alcol_05_08').punti);
      return `<h2>Come funziona la patente a punti</h2>
<p>Il sistema è scritto nell’${h.src('cds126bis', 'articolo 126-bis del Codice della Strada')}. Al rilascio della patente vengono attribuiti ${h.num(PT(h).initial)} punti, registrati nell’anagrafe nazionale degli abilitati alla guida. Il saldo cala quando viene comunicata all’anagrafe una violazione che prevede la sospensione della patente oppure una delle norme di comportamento indicate nella ${h.src('tabella', 'tabella allegata')}. Le altre infrazioni, per quanto costose, non toccano i punti: la sosta vietata su un marciapiede, per esempio, si paga ma non toglie nulla. Il verbale deve indicare quanti punti comporta la violazione, quindi il numero da controllare è già scritto sulla multa.</p>
<p>I punti non sono legati all’auto ma al conducente. Se la multa arriva per posta e nessuno è stato fermato, il proprietario del veicolo deve comunicare i dati di chi guidava: la pagina sulla ${h.a('decurtazione-punti-patente', 'decurtazione dei punti')} spiega quando e come il saldo viene effettivamente aggiornato, e perché tra la multa e il calo dei punti passano settimane.</p>
<h2>Dove vedere il saldo</h2>
<p>Il comma 3 dell’articolo 126-bis affida la comunicazione di ogni variazione al Portale dell’automobilista, il servizio online della Motorizzazione civile (il ramo del Ministero delle infrastrutture e dei trasporti che gestisce patenti e veicoli). Il saldo che compare lì è quello dell’anagrafe: tiene conto delle decurtazioni già definite, dei bonus maturati e dei corsi registrati. Una multa appena notificata non è ancora nel conto. Per sapere quanto resterà dopo una nuova infrazione, il calcolatore qui sopra parte dai punti che hai e toglie quelli della tabella, raddoppiati se sei neopatentato.</p>
<!--mini:saldo-->
<h2>Come si recuperano i punti</h2>
<p>Ci sono tre strade, tutte nel comma 4 e nel comma 5 dell’articolo 126-bis, più una riservata ai neopatentati.</p>
${h.table(['Situazione', 'Effetto sul saldo', 'Norma'], [
  ['Due anni senza violazioni che tolgono punti, saldo sotto i 20', `ritorno a ${h.num(PT(h).initial)} punti`, 'art. 126-bis c.5'],
  ['Due anni senza violazioni, saldo di almeno 20 punti', `+${h.num(PT(h).bonus.points)} punti, fino a ${h.num(PT(h).bonus.max)} in più`, 'art. 126-bis c.5'],
  ['Corso di aggiornamento con esame finale', `+${h.num(PT(h).recovery_course.points)} punti`, 'art. 126-bis c.4'],
  ['Corso specifico per conducenti professionali', `+${h.num(PT(h).recovery_course.points_professional)} punti`, 'art. 126-bis c.4'],
  ['Neopatentato: ogni anno senza violazioni nei primi tre', '+1 punto, fino a 3', 'tabella, ultima nota'],
  ['Saldo a zero', 'revisione: esame di teoria e di guida', 'art. 126-bis c.6'],
], 'Come cambia il saldo dei punti patente secondo l’art. 126-bis CdS', ['l', 'l', 'l'])}
<p>Il ritorno a ${h.num(PT(h).initial)} dopo due anni è automatico e non si somma al corso: chi aveva ${h.num(10)} punti e non commette violazioni per due anni torna a ${h.num(PT(h).initial)}, non a ${h.num(10 + PT(h).recovery_course.points)}. Il corso conviene quindi quando il saldo è basso e il biennio pulito è lontano. Va frequentato presso un’autoscuola o un ente autorizzato e si chiude con un esame; solo dopo l’esame l’attestato viene trasmesso alla Motorizzazione e i punti tornano nel saldo. Il corso non è ammesso quando il punteggio è esaurito.</p>
<h2>Cosa succede a zero punti</h2>
<p>Quando il saldo arriva a zero, l’ufficio della Motorizzazione dispone la revisione della patente: il titolare deve ripetere l’esame di idoneità tecnica dell’articolo 128, teoria e guida. Chi non si presenta entro trenta giorni dalla notifica del provvedimento si vede sospendere la patente a tempo indeterminato, e la polizia ritira il documento. Arrivare a zero è meno raro di quanto sembri: con ${h.num(12)} punti, una sola guida con un tasso alcolemico tra 0,5 e 0,8 g/l ne toglie ${h.num(h.M.altra('alcol_05_08').punti)} e lascia ${h.num(dopo.nuovo)} punti.</p>
<p>La revisione scatta anche senza arrivare a zero. Il comma 6 la impone a chi, dopo la notifica di una prima violazione da almeno cinque punti, ne commette altre due, in momenti diversi, entro dodici mesi dalla prima, ciascuna da almeno cinque punti. Tre multe per il telefono in mano (${h.num(h.M.altra('cellulare').punti)} punti l’una) nello stesso anno bastano, anche se il saldo resta positivo.</p>
<h2>Neopatentati: punti doppi e un punto all’anno</h2>
<p>La nota finale della tabella riguarda le patenti rilasciate dopo il ${h.date(PT(h).neopatentato_doubling.issued_after)} a chi non aveva già una patente B o superiore: nei primi ${h.num(PT(h).neopatentato_doubling.years)} anni ogni violazione toglie il doppio dei punti. Le quattro infrazioni più comuni (velocità tra 10 e 40 km/h, telefono, cintura, semaforo rosso) costano a un neopatentato ${t.map((x) => h.num(x * PT(h).neopatentato_doubling.factor)).join(', ').replace(/, ([^,]*)$/, ' e $1')} punti invece di ${t.map((x) => h.num(x)).join(', ').replace(/, ([^,]*)$/, ' e $1')}. In compenso, per gli stessi tre anni, ogni anno senza violazioni vale un punto in più, fino a tre. Nello stesso periodo valgono anche i limiti più bassi dell’${h.src('cds117', 'articolo 117')}: 100 km/h in autostrada e 90 sulle extraurbane principali.</p>
<!--mini:neopatentato-->
<h2>Patente straniera e residenti in Italia</h2>
<p>L’articolo 126-bis parla della patente rilasciata in Italia e del suo saldo nell’anagrafe nazionale. Chi guida in Italia con una patente estera paga le stesse multe e subisce le stesse sospensioni sulle strade italiane, e il verbale indica comunque i punti previsti per la violazione; il testo dell’articolo, però, non descrive un saldo a punti per le patenti straniere. Chi converte la propria patente in una patente italiana entra nel sistema come ogni altro titolare. Per i casi concreti conviene chiedere alla Motorizzazione, che gestisce l’anagrafe.</p>
<p>Le regole di questa pagina sono quelle dell’articolo 126-bis e della tabella in vigore dal 12 aprile 2025, letti su Normattiva il ${h.date(h.P.retrieved_at)} e in vigore nel 2026. La ${h.a('tabella-punti-patente', 'tabella completa dei punti')} riporta tutte le ${h.num(h.TP.righe.length)} righe, con il punteggio di ogni norma.</p>`;
    },
  },
  en: {
    slug: 'italian-driving-licence-points',
    nav: 'Licence points in Italy',
    card: 'Every licence starts on 20 points: how to check the balance, when points come back, the bonus up to 30 and what happens at zero.',
    title: 'Licence points in Italy: balance, recovery, bonus 2026',
    description: 'Licence points in Italy: you start on 20, check the balance on the Portale dell’automobilista, and win points back after 2 clean years or a course. Work it out.',
    h1: 'Italian licence points: balance, recovery and zero points',
    intro: 'Enter the points you hold today and the offence on your fine: see the balance left, whether a re-examination is triggered, and what a course or two clean years would give back.',
    resume: (h) => `Every Italian driving licence starts with ${h.num(PT(h).initial)} points, recorded in the national register of licence holders, and every change to the balance is published on the Portale dell’automobilista, the Italian licensing authority’s website, where the holder can look it up. The offences listed in the table of article 126-bis of the Highway Code each take 1 to 10 points: ${h.num(riga(h, '142', 'Comma 8'))} for speeding by 10 to 40 km/h, ${h.num(h.M.altra('cellulare').punti)} for holding a phone, ${h.num(h.M.altra('alcol_05_08').punti)} for alcohol above 0.5 g/l. Two years without a points offence bring the balance back to ${h.num(PT(h).initial)}; a driver already on ${h.num(PT(h).initial)} earns a ${h.num(PT(h).bonus.points)}-point bonus every two years, up to ${h.num(PT(h).bonus.max)} extra. A refresher course at a driving school, ending with a test, gives back ${h.num(PT(h).recovery_course.points)} points (${h.num(PT(h).recovery_course.points_professional)} for professional drivers), as long as the balance is not already zero. At zero the licence goes to re-examination: theory and driving tests again. Drivers in their first three years lose double points for every offence.`,
    faqs: (h) => [
      { q: 'How do I check my Italian licence points balance?', a: `Paragraph 3 of article 126-bis says every change in points is communicated through the Portale dell’automobilista, the online service of the Motorizzazione (the licensing branch of the transport ministry). The balance there is the one held in the national register. A fine you have just received will not show yet: points come off only once the fine is settled, by payment or once the appeal deadlines pass.` },
      { q: 'When do lost points come back in Italy?', a: `After two years without any offence that costs points, the balance returns to the starting ${h.num(PT(h).initial)} points under paragraph 5 of article 126-bis. It happens automatically, with no application. It does not apply once the licence has lost every point: then the holder must sit the theory and driving tests again.` },
      { q: 'Can an Italian licence hold more than 20 points?', a: `Yes. A holder on at least ${h.num(PT(h).initial)} points who goes two years without a points offence receives a ${h.num(PT(h).bonus.points)}-point credit, up to ${h.num(PT(h).bonus.max)} extra points, so the highest possible balance is ${h.num(PT(h).initial + PT(h).bonus.max)}. Reaching it takes ten clean years, and bonus points are lost like any others at the next deduction.` },
      { q: 'What happens when an Italian licence reaches zero points?', a: 'The holder must pass the article 128 competence test again, theory and driving, and the Motorizzazione orders the re-examination of the licence. If the test is not taken within thirty days of being notified, the licence is suspended indefinitely and the police withdraw it. At zero points the recovery course is no longer available.' },
      { q: 'I moved to Italy with a foreign licence: does the points system apply to me?', a: 'Article 126-bis describes the points balance of licences issued in Italy and recorded in the national register. On a foreign licence you still pay the same fines and face the same suspensions on Italian roads, and the fine still states the points for the offence. Once you exchange your licence for an Italian one, you enter the points system like any other holder.' },
    ],
    body: (h) => {
      const t = [riga(h, '142', 'Comma 8'), h.M.altra('cellulare').punti, h.M.altra('cintura').punti, h.M.altra('semaforo_rosso').punti];
      const dopo = h.M.saldo(12, h.M.altra('alcol_05_08').punti);
      const list = (xs: number[]) => xs.map((x) => h.num(x)).join(', ').replace(/, ([^,]*)$/, ' and $1');
      return `<h2>How the points licence works</h2>
<p>The system is set out in ${h.src('cds126bis', 'article 126-bis of the Italian Highway Code')}. When a licence is issued it receives ${h.num(PT(h).initial)} points, kept in the national register of licence holders (the anagrafe nazionale degli abilitati alla guida). The balance drops when the register is told of an offence that carries a licence suspension, or of one of the rules of conduct listed in the ${h.src('tabella', 'attached points table')}. Other offences, however expensive, leave the points alone: parking on a pavement costs money but no points. The fine (the verbale) must state how many points the offence carries, so the figure to check is already printed on it.</p>
<p>Points follow the driver, not the car. When a fine arrives by post and nobody was stopped, the vehicle owner must give the name and licence details of whoever was driving. The page on ${h.a('decurtazione-punti-patente', 'points deductions')} explains when the balance is actually updated and why weeks pass between the fine and the drop in points.</p>
<h2>Where to see your balance</h2>
<p>Paragraph 3 of article 126-bis says every change is communicated through the Portale dell’automobilista, the online service of the Motorizzazione civile, the part of the Italian transport ministry that runs licences and vehicle records. The balance shown there is the register’s: it includes deductions already settled, bonuses earned and courses recorded. A fine served last week is not in it yet. To see what will be left after a new offence, the calculator above starts from the points you hold and takes off the table’s figure, doubled if you are a new driver.</p>
<!--mini:saldo-->
<h2>How points come back</h2>
<p>There are three routes, all in paragraphs 4 and 5 of article 126-bis, plus one for new drivers.</p>
${h.table(['Situation', 'Effect on the balance', 'Rule'], [
  ['Two years with no points offence, balance below 20', `back to ${h.num(PT(h).initial)} points`, 'art. 126-bis para. 5'],
  ['Two years with no points offence, balance of 20 or more', `+${h.num(PT(h).bonus.points)} points, up to ${h.num(PT(h).bonus.max)} extra`, 'art. 126-bis para. 5'],
  ['Refresher course ending with a test', `+${h.num(PT(h).recovery_course.points)} points`, 'art. 126-bis para. 4'],
  ['Specific course for professional drivers', `+${h.num(PT(h).recovery_course.points_professional)} points`, 'art. 126-bis para. 4'],
  ['New driver: each clean year in the first three', '+1 point, up to 3', 'table, final note'],
  ['Balance at zero', 're-examination: theory and driving tests', 'art. 126-bis para. 6'],
], 'How the licence points balance changes under article 126-bis', ['l', 'l', 'l'])}
<p>The return to ${h.num(PT(h).initial)} after two years is automatic and does not add up with a course: a driver on ${h.num(10)} points who stays clean for two years goes back to ${h.num(PT(h).initial)}, not ${h.num(10 + PT(h).recovery_course.points)}. A course therefore makes sense when the balance is low and two clean years are far off. It is held at a driving school (autoscuola) or an approved body and ends with a test; only after the test is the certificate sent to the Motorizzazione and the points restored. It is not allowed once the balance has run out.</p>
<h2>What happens at zero</h2>
<p>When the balance reaches zero, the Motorizzazione orders the re-examination (revisione) of the licence: the holder must pass the article 128 competence test again, theory and driving. Anyone who does not sit it within thirty days of the order has the licence suspended indefinitely, and the police withdraw the document. Zero comes sooner than people expect: on ${h.num(12)} points, a single drive with 0.5 to 0.8 g/l of alcohol in the blood takes ${h.num(h.M.altra('alcol_05_08').punti)} and leaves ${h.num(dopo.nuovo)}.</p>
<p>A re-examination can also come before zero. Paragraph 6 orders it for a driver who, after being served a first offence of at least five points, commits two more at different times within twelve months of the first, each worth at least five points. Three phone-in-hand fines (${h.num(h.M.altra('cellulare').punti)} points each) in one year are enough, even with points left.</p>
<h2>New drivers: double points and one point a year</h2>
<p>The table’s final note covers licences issued after ${h.date(PT(h).neopatentato_doubling.issued_after)} to people who did not already hold a category B licence or higher: during the first ${h.num(PT(h).neopatentato_doubling.years)} years every offence costs twice the points. The four most common offences (speeding by 10 to 40 km/h, phone, seat belt, red light) cost a new driver ${list(t.map((x) => x * PT(h).neopatentato_doubling.factor))} points instead of ${list(t)}. In return, during those same three years, each year without an offence adds one point, up to three. The lower limits of ${h.src('cds117', 'article 117')} also apply: 100 km/h on motorways and 90 on main extra-urban roads.</p>
<!--mini:neopatentato-->
<h2>Foreign licences and newcomers to Italy</h2>
<p>Article 126-bis deals with licences issued in Italy and their balance in the national register. If you drive in Italy on a foreign licence, you pay the same fines and face the same suspensions on Italian roads, and your fine still lists the points for the offence; the article does not, however, describe a points balance for foreign licences. Once you exchange your licence for an Italian one, you join the system like any other holder. For a specific case, the Motorizzazione, which keeps the register, is the office to ask.</p>
<p>The rules on this page are those of article 126-bis and of the points table in force since 12 April 2025, read on Normattiva on ${h.date(h.P.retrieved_at)} and in force in 2026. The ${h.a('tabella-punti-patente', 'full points table')} lists all ${h.num(h.TP.righe.length)} rows with the points for each rule.</p>`;
    },
  },
});
