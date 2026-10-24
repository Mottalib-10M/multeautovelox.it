import { defineGuide, type Helpers } from '../../lib/guide-types';

const K = (h: Helpers, o: { neopatentato?: boolean } = {}) => h.M.altra('cintura', o);

export default defineGuide({
  id: 'multa-cintura',
  group: 'infrazioni',
  order: 2,
  tool: 'altre',
  outil: { defaultId: 'cintura', solo: ['cintura'] },
  related: ['multa-cellulare-alla-guida', 'decurtazione-punti-patente', 'punti-patente', 'multa-ridotta-30', 'sanzioni-codice-della-strada'],
  sources: ['cds172', 'tabella', 'cds202', 'cds195'],
  it: {
    slug: 'multa-cintura',
    nav: 'Multa cintura',
    card: 'Da 83 a 332 € e 5 punti per cintura o seggiolino non usati; chi paga per passeggeri e bambini, esenzioni e sospensione.',
    title: 'Multa cintura 2026: importo, punti, bambini e passeggeri',
    description: 'Multa cintura non allacciata: da 83 a 332 €, meno del 30 % entro 5 giorni, 5 punti. Chi paga per passeggeri e bambini, seggiolini, esenzioni e sospensione.',
    h1: 'Multa per la cintura non allacciata: importo, punti, chi paga',
    intro: 'Il calcolo mostra l’importo entro 5 e 60 giorni e i punti per la cintura o il seggiolino non usati, anche per chi ha la patente da meno di tre anni.',
    resume: (h) => `La multa per la cintura non allacciata è prevista dall’articolo 172, comma 10, del Codice della Strada: da ${h.eur(K(h).minimo)} a ${h.eur(K(h).massimo)}, ridotti a ${h.eur(K(h).ridotto ?? 0, 2)} se si paga entro 5 giorni dalla contestazione o dalla notifica, e ${h.num(K(h).punti)} punti tolti dalla patente (${h.num(K(h, { neopatentato: true }).punti)} per un neopatentato). La stessa multa colpisce chi non usa il seggiolino per un bambino sotto 1,50 m e chi trasporta un bambino sotto i quattro anni senza il dispositivo antiabbandono, obbligatorio sui veicoli immatricolati in Italia o guidati da residenti. L’obbligo vale per il conducente e per tutti i passeggeri, davanti e dietro, in qualsiasi situazione di marcia. Il passeggero adulto senza cintura risponde della propria violazione; per un minore risponde il conducente oppure, se presente sul veicolo, chi deve sorvegliarlo. Se il conducente commette due volte la violazione in due anni, all’ultima scatta anche la sospensione della patente da quindici giorni a due mesi. Gli importi sono quelli in vigore nel 2026, uguali di giorno e di notte.`,
    faqs: (h) => [
      { q: 'Chi paga la multa se il passeggero non ha la cintura?', a: 'Il comma 10 sanziona «chiunque non fa uso» dei dispositivi di ritenuta: il passeggero maggiorenne paga la propria multa, non il conducente. Per un minore la regola cambia: risponde il conducente oppure, se è presente sul veicolo al momento del fatto, la persona tenuta alla sua sorveglianza, per esempio un genitore seduto accanto al bambino.' },
      { q: 'Chi è esentato dall’obbligo della cintura?', a: 'Il comma 8 elenca casi precisi: polizia e polizia locale in servizio di emergenza, vigili del fuoco e ambulanze in intervento, addetti alla raccolta dei rifiuti nei centri abitati, vigilanza privata durante le scorte, istruttori di guida durante le lezioni, chi ha un certificato medico dell’ASL o di un altro Stato UE, donne in gravidanza con certificato del ginecologo, passeggeri in piedi sugli autobus urbani.' },
      { q: 'Quando la multa per la cintura comporta la sospensione della patente?', a: 'Quando il conducente è incorso nella violazione del comma 10 almeno due volte in due anni: all’ultima infrazione si aggiunge la sospensione della patente da quindici giorni a due mesi. Da quel momento lo sconto del 30 % non vale più, perché l’articolo 202 lo esclude per le violazioni che comportano la sospensione. La prima multa resta senza sospensione.' },
      { q: 'In taxi i bambini devono stare sul seggiolino?', a: 'Non sempre. Il comma 4 permette ai bambini fino a 1,50 m di viaggiare senza seggiolino sui taxi e sulle auto a noleggio con conducente, a due condizioni: non devono occupare un sedile anteriore e devono essere accompagnati da almeno un passeggero di almeno sedici anni. Fuori da questi servizi il seggiolino omologato resta obbligatorio.' },
      { q: 'Il seggiolino rivolto all’indietro si può mettere davanti?', a: 'Solo se l’airbag frontale del passeggero è disattivato. Il comma 5 vieta di trasportare un bambino in un seggiolino rivolto all’indietro su un sedile protetto da airbag frontale, a meno che l’airbag sia stato disattivato, anche in modo automatico purché adeguato. Sui veicoli senza sistemi di ritenuta, invece, i bambini fino a tre anni non possono proprio viaggiare.' },
    ],
    body: (h) => {
      const k = K(h);
      return `<h2>Chi deve allacciare la cintura</h2>
<p>Il comma 1 dell’${h.src('cds172', 'articolo 172 del Codice della Strada')} obbliga il conducente e i passeggeri a usare le cinture di sicurezza «in qualsiasi situazione di marcia», su auto, furgoni e camion (categorie M1, N1, N2 e N3) e sui quadricicli pesanti con carrozzeria chiusa. Vale per i sedili anteriori e per quelli posteriori, in città come in autostrada. Sugli autobus (categorie M2 e M3) devono allacciarla tutti gli occupanti sopra i tre anni quando sono seduti, se il veicolo ne è dotato, e l’obbligo va segnalato con cartelli o pittogrammi su ogni sedile (commi 6 e 7). Il conducente deve anche assicurarsi che cinture e seggiolini funzionino (comma 2).</p>
<h2>Quanto costa e quanti punti</h2>
<p>Il comma 10 punisce con la stessa sanzione chi non usa la cintura, chi non usa il sistema di ritenuta per bambini e chi non usa il dispositivo antiabbandono quando è obbligatorio. Chi la usa ma ne altera o ostacola il funzionamento rientra nel comma 11, con un importo più basso. La ${h.src('tabella', 'tabella dei punteggi')} toglie ${h.num(k.punti)} punti per entrambi i commi.</p>
${h.table(['Caso', 'Importo', 'Entro 5 giorni', 'Punti', 'Neopatentato'], [
  ['Cintura, seggiolino o antiabbandono non usati (c.10)', `${h.eur(k.minimo)} – ${h.eur(k.massimo)}`, h.eur(k.ridotto ?? 0, 2), h.num(k.punti), h.num(K(h, { neopatentato: true }).punti)],
  ['Conducente, seconda violazione in due anni (c.10)', `${h.eur(k.minimo)} – ${h.eur(k.massimo)} e sospensione da 15 giorni a 2 mesi`, 'nessuno sconto', h.num(k.punti), h.num(K(h, { neopatentato: true }).punti)],
  ['Dispositivo alterato o ostacolato (c.11)', 'importo più basso del comma 11', 'sì, −30 %', h.num(k.punti), h.num(K(h, { neopatentato: true }).punti)],
], 'Cinture e seggiolini, art. 172 CdS: importi in vigore nel 2026', ['l', 'l', 'r', 'r', 'r'])}
<p>Pagando entro 5 giorni si versano ${h.eur(k.ridotto ?? 0, 2)} invece di ${h.eur(k.minimo)}, più le spese di notifica: lo sconto dell’${h.src('cds202', 'articolo 202')} vale perché la prima violazione non comporta la sospensione. La pagina ${h.a('multa-ridotta-30', 'multa ridotta del 30 %')} calcola la data esatta. L’articolo 172 non è tra quelli che l’${h.src('cds195', 'articolo 195')} aumenta di un terzo di notte, quindi l’importo non cambia con l’ora. Quando in un controllo più persone sono senza cintura, ognuna riceve la propria multa.</p>
<!--mini:infrazione_1-->
<h2>Chi paga: passeggeri, bambini e conducente</h2>
<p>Il comma 10 sanziona «chiunque non fa uso» dei dispositivi di ritenuta. Il passeggero adulto senza cintura è quindi responsabile della propria violazione e paga la propria multa. Per i minori la legge sposta la responsabilità: «della violazione risponde il conducente ovvero, se presente sul veicolo al momento del fatto, chi è tenuto alla sorveglianza del minore stesso». Un genitore seduto dietro accanto al figlio senza seggiolino risponde lui, non chi guida. La tabella prevede i punti per i commi 10 e 11, ma il testo non precisa come si applichino a un passeggero che non ha la patente.</p>
<p>La sospensione colpisce solo il conducente e solo alla ripetizione: quando, nell’arco di due anni, è incorso almeno due volte in una violazione del comma 10, all’ultima infrazione si aggiunge la sospensione della patente da quindici giorni a due mesi. Le multe per cintura e telefono si sommano spesso nello stesso controllo: in quel caso il tetto dei ${h.num(h.P.points.max_simultaneous)} punti non vale, perché il ${h.a('multa-cellulare-alla-guida', 'telefono alla guida')} comporta la sospensione.</p>
<h2>Bambini: seggiolino, airbag e antiabbandono</h2>
${h.table(['Situazione', 'Cosa prevede l’articolo 172'], [
  ['Bambino di statura inferiore a 1,50 m', 'sistema di ritenuta omologato, adeguato al peso (c.1)'],
  ['Bambino sotto i quattro anni sul seggiolino', 'dispositivo di allarme antiabbandono, su veicoli immatricolati in Italia o guidati da residenti (c.1-bis)'],
  ['Seggiolino rivolto all’indietro davanti', 'vietato se l’airbag frontale è attivo (c.5)'],
  ['Veicolo senza sistemi di ritenuta', 'bambini fino a tre anni non possono viaggiare; sopra i tre anni davanti solo oltre 1,50 m (c.3)'],
  ['Taxi e noleggio con conducente', 'seggiolino non obbligatorio sotto 1,50 m, se il bambino non è davanti ed è con un passeggero di almeno sedici anni (c.4)'],
  ['Autobus', 'seggiolini usati solo se presenti e omologati (c.6)'],
], 'Trasporto dei bambini in auto secondo l’art. 172 CdS', ['l', 'l'])}
<p>Il criterio per il seggiolino è la statura, non l’età: sotto 1,50 m serve un sistema omologato secondo le norme del Ministero delle infrastrutture e dei trasporti, conforme ai regolamenti UNECE o alle direttive europee. Il dispositivo antiabbandono, che avvisa se il bambino resta in auto, deve rispettare le specifiche fissate con decreto ministeriale. Chi vende o importa seggiolini non omologati rischia una sanzione molto più alta (comma 12), e i dispositivi sono sequestrati anche se già montati.</p>
<!--mini:ridotto_${h.M.altra('cintura').minimo}-->
<h2>Le esenzioni previste dalla legge</h2>
<p>Il comma 8 elenca chi è esentato. Gli agenti di polizia e di polizia locale durante un servizio di emergenza; conducenti e addetti dei mezzi antincendio e sanitari durante un intervento di emergenza; i conducenti dei veicoli per la raccolta dei rifiuti impiegati nei centri abitati, zone industriali comprese; le guardie di vigilanza privata che effettuano scorte; gli istruttori di guida durante le esercitazioni; le persone con patologie o condizioni fisiche incompatibili con la cintura, certificate dall’unità sanitaria locale o dall’autorità di un altro Stato dell’Unione europea; le donne in gravidanza con un certificato del ginecologo che attesti un rischio particolare; i passeggeri in piedi sugli autobus urbani autorizzati; i militari in situazioni di emergenza.</p>
<p>Il certificato medico deve indicare la durata di validità, portare il simbolo previsto dalla direttiva 91/671/CEE ed essere mostrato su richiesta della polizia: tenerlo in auto è parte dell’esenzione. Il testo dell’articolo 172 è stato letto su Normattiva il ${h.date(h.P.retrieved_at)}. Per tutte le altre infrazioni frequenti, la pagina ${h.a('sanzioni-codice-della-strada', 'sanzioni del Codice della Strada')} riunisce importi e punti.</p>`;
    },
  },
  en: {
    slug: 'italy-seat-belt-fine',
    nav: 'Seat belt fine',
    card: '€83 to €332 and 5 points for a seat belt or child seat not used; who pays for passengers and children, exemptions and suspension.',
    title: 'Seat belt fine in Italy 2026: amount, points and children',
    description: 'Seat belt fine in Italy: €83 to €332, 30% off within 5 days, 5 points. Who pays for passengers and children, child seats, anti-abandonment alarm, exemptions.',
    h1: 'Seat belt fines in Italy: amount, points and who pays',
    intro: 'The calculator shows the amount within 5 and 60 days and the points for a seat belt or child seat not used, including for drivers licensed under three years.',
    resume: (h) => `The Italian fine for not wearing a seat belt is set by article 172, paragraph 10, of the Highway Code: ${h.eur(K(h).minimo)} to ${h.eur(K(h).massimo)}, cut to ${h.eur(K(h).ridotto ?? 0, 2)} if paid within 5 days of the offence being contested or the fine being served, and ${h.num(K(h).punti)} points off the licence (${h.num(K(h, { neopatentato: true }).punti)} for a new driver). The same fine applies to not using a child restraint for a child under 1.50 m tall, and to carrying a child under four without the anti-abandonment alarm, compulsory in cars registered in Italy or driven by Italian residents. The duty covers the driver and every passenger, front and back, «in qualsiasi situazione di marcia», whenever the vehicle is moving. An adult passenger without a belt answers for their own offence; for a minor it is the driver or, if on board, the person responsible for supervising the child. If the driver commits the offence twice within two years, the second time also brings a licence suspension of fifteen days to two months. These are the 2026 amounts, the same by day and by night.`,
    faqs: (h) => [
      { q: 'Who is fined when a passenger is not wearing a seat belt in Italy?', a: 'Paragraph 10 fines «chiunque», anyone, who does not use a restraint: an adult passenger pays their own fine, not the driver. For a minor the rule changes: the driver answers or, if they are on board at the time, the person responsible for supervising the child, such as a parent sitting next to them in the back.' },
      { q: 'Who is exempt from wearing a seat belt in Italy?', a: 'Paragraph 8 lists specific cases: police on emergency duty, fire and ambulance crews during an emergency, refuse collection crews in towns, private security on escort duty, driving instructors during lessons, people with a medical certificate from the Italian health service or another EU country, pregnant women with a gynaecologist’s certificate, and standing passengers on urban buses.' },
      { q: 'Do children need a car seat in an Italian taxi?', a: 'Not always. Paragraph 4 lets children up to 1.50 m travel without a child seat in taxis and chauffeur-driven hire cars (NCC), on two conditions: they must not sit in a front seat and must be accompanied by at least one passenger aged sixteen or over. In a private or rental car you drive yourself, an approved child seat remains compulsory.' },
      { q: 'Do I need an anti-abandonment alarm in a foreign-registered car?', a: 'Paragraph 1-bis requires the alarm for children under four in a child seat in cars registered in Italy, and in cars registered abroad when the driver lives in Italy. A visitor driving their own foreign-plated car is not covered by the text; a resident of Italy driving a foreign-plated car is. Rental cars registered in Italy fall under the rule.' },
      { q: 'Can a repeat seat-belt offence lead to a suspension in Italy?', a: 'Yes, for the driver. When the driver has committed a paragraph 10 offence at least twice within two years, the last one also brings a licence suspension of fifteen days to two months, and the 30% discount no longer applies because article 202 excludes it for offences carrying a suspension. A first offence carries no suspension.' },
    ],
    body: (h) => {
      const k = K(h);
      return `<h2>Who must wear a belt</h2>
<p>Paragraph 1 of ${h.src('cds172', 'article 172 of the Italian Highway Code')} requires the driver and passengers to wear seat belts «in qualsiasi situazione di marcia», in any driving situation, in cars, vans and lorries (categories M1, N1, N2 and N3) and in closed heavy quadricycles. It applies to front and rear seats alike, in town and on the motorway. On coaches and buses (categories M2 and M3), every occupant over three must wear a belt when seated if one is fitted, and the rule must be shown by signs or pictograms on each seat (paragraphs 6 and 7). The driver must also make sure belts and child seats work (paragraph 2).</p>
<h2>What it costs and how many points</h2>
<p>Paragraph 10 sets the same penalty for not using a seat belt, a child restraint, or the anti-abandonment alarm where it is required. Anyone who uses the belt but tampers with it or blocks it falls under paragraph 11, with a lower amount. The ${h.src('tabella', 'points table')} takes ${h.num(k.punti)} points for both paragraphs.</p>
${h.table(['Case', 'Amount', 'Within 5 days', 'Points', 'New driver'], [
  ['Belt, child seat or alarm not used (para. 10)', `${h.eur(k.minimo)} – ${h.eur(k.massimo)}`, h.eur(k.ridotto ?? 0, 2), h.num(k.punti), h.num(K(h, { neopatentato: true }).punti)],
  ['Driver, second offence within two years (para. 10)', `${h.eur(k.minimo)} – ${h.eur(k.massimo)} and a 15-day to 2-month suspension`, 'no discount', h.num(k.punti), h.num(K(h, { neopatentato: true }).punti)],
  ['Device tampered with or blocked (para. 11)', 'lower amount of paragraph 11', 'yes, −30%', h.num(k.punti), h.num(K(h, { neopatentato: true }).punti)],
], 'Seat belts and child seats, article 172 of the Italian Highway Code: amounts in force in 2026', ['l', 'l', 'r', 'r', 'r'])}
<p>Paying within 5 days costs ${h.eur(k.ridotto ?? 0, 2)} instead of ${h.eur(k.minimo)}, plus service costs: the ${h.src('cds202', 'article 202')} discount applies because a first offence carries no suspension. The ${h.a('multa-ridotta-30', 'reduced payment page')} works out the exact date. Article 172 is not among those that ${h.src('cds195', 'article 195')} raises by a third at night, so the time of day changes nothing. When several people in the car are unbelted, each receives their own fine.</p>
<!--mini:infrazione_1-->
<h2>Who pays: passengers, children and the driver</h2>
<p>Paragraph 10 fines «chiunque non fa uso», anyone who does not use the restraint. An adult passenger without a belt is therefore responsible for their own offence and pays their own fine. For minors the law shifts responsibility: «della violazione risponde il conducente ovvero, se presente sul veicolo al momento del fatto, chi è tenuto alla sorveglianza del minore stesso», the driver answers or, if present in the vehicle, whoever is responsible for supervising the child. A parent sitting in the back next to an unrestrained child answers, not the driver. The table gives points for paragraphs 10 and 11, but the text does not say how they apply to a passenger who holds no licence.</p>
<p>The suspension affects only the driver and only on repetition: when, within two years, they have committed a paragraph 10 offence at least twice, the last one adds a licence suspension of fifteen days to two months. Seat-belt and phone fines often come together in one stop: then the ${h.num(h.P.points.max_simultaneous)}-point cap does not apply, because a ${h.a('multa-cellulare-alla-guida', 'phone at the wheel')} carries a suspension.</p>
<h2>Children: child seats, airbags and the anti-abandonment alarm</h2>
${h.table(['Situation', 'What article 172 says'], [
  ['Child under 1.50 m tall', 'approved child restraint suited to their weight (para. 1)'],
  ['Child under four in a child seat', 'anti-abandonment alarm, in cars registered in Italy or driven by residents (para. 1-bis)'],
  ['Rear-facing child seat in front', 'banned if the front airbag is active (para. 5)'],
  ['Vehicle with no restraints', 'children up to three may not travel; over three in front only above 1.50 m (para. 3)'],
  ['Taxi and chauffeur-driven hire', 'no child seat needed under 1.50 m if the child is not in front and is with a passenger aged sixteen or over (para. 4)'],
  ['Coach or bus', 'child restraints used only if fitted and approved (para. 6)'],
], 'Carrying children by car under article 172 of the Italian Highway Code', ['l', 'l'])}
<p>The test for a child seat is height, not age: under 1.50 m a restraint is needed, approved under the rules of the Italian transport ministry in line with UNECE regulations or the equivalent EU directives. The anti-abandonment alarm, which warns if a child is left in the car, must meet the specifications set by ministerial decree. Selling or importing unapproved restraints carries a much higher penalty (paragraph 12), and the devices are seized even if already fitted.</p>
<!--mini:ridotto_${h.M.altra('cintura').minimo}-->
<h2>Exemptions set by the law</h2>
<p>Paragraph 8 lists who is exempt: police and local police officers on emergency service; drivers and crews of fire and medical vehicles during an emergency; drivers of refuse collection vehicles working in built-up areas, industrial zones included; private security guards on escort duty; driving instructors during lessons; people with a medical condition incompatible with a belt, certified by the local health unit (unità sanitaria locale) or by the authority of another EU state; pregnant women with a gynaecologist’s certificate of a particular risk; standing passengers on authorised urban buses; and the armed forces in emergencies.</p>
<p>The medical certificate must state how long it is valid, bear the symbol set by directive 91/671/EEC and be shown to the police on request: carrying it in the car is part of the exemption. The text of article 172 was read on Normattiva on ${h.date(h.P.retrieved_at)}. For all other common offences, the ${h.a('sanzioni-codice-della-strada', 'Italian traffic fines list')} gathers amounts and points.</p>`;
    },
  },
});
