import { defineGuide, type Helpers } from '../../lib/guide-types';

const I = (h: Helpers) => h.S.italia;
const C = (h: Helpers) => h.S.italia.categorie;

export default defineGuide({
  id: 'autovelox',
  group: 'autovelox',
  order: 1,
  tool: 'velox',
  outil: { defaultCat: 'L219', defaultNome: 'Torino', defaultSigla: 'TO' },
  related: ['elenco-autovelox', 'autovelox-omologati', 'autovelox-mappa', 'tolleranza-autovelox', 'ricorso-multa-autovelox'],
  sources: ['mitVelox', 'mitNews', 'cds142', 'reg345', 'cds45', 'istat'],
  it: {
    slug: 'autovelox',
    nav: 'Autovelox: come funzionano',
    card: 'Fissi, mobili, tutor: cosa misura un autovelox, come va segnalato e quanti ne dichiara ogni comune.',
    title: 'Autovelox 2026: tipi, segnalazione, multe e registro MIT',
    description: 'Autovelox fissi, mobili e tutor: come misurano, come vanno segnalati, quale tolleranza si applica e quanti ne dichiara ogni comune nel registro del Ministero.',
    h1: 'Autovelox: come funzionano e quali sono dichiarati nel tuo comune',
    intro: 'Cerca un comune: vedi quanti apparecchi l’ente ha dichiarato al Ministero, di che tipo, con quale decreto. Sotto, cosa misura un autovelox e cosa deve esserci prima.',
    resume: (h) => `In Italia un autovelox è qualunque apparecchio che misura la velocità di un veicolo per accertare un eccesso: una postazione fissa a bordo strada, un apparecchio mobile su cavalletto o in auto, un telelaser puntato a mano dall’agente, oppure un sistema di velocità media, il tutor, che calcola il tempo tra due portali. L’articolo 142 del Codice della Strada considera prova solo le misure di apparecchi «debitamente omologati», e il comma 6-bis impone che le postazioni siano segnalate prima e ben visibili. Alla velocità misurata si toglie sempre il ${h.pct(h.P.tolerance.percent, 0)}, con un minimo di ${h.num(h.P.tolerance.min_kmh)} km/h. Dal 28 novembre 2025 il Ministero delle infrastrutture e dei trasporti pubblica il registro degli apparecchi dichiarati dagli enti: la copia del ${h.date(h.reg)} conta ${h.num(I(h).totale)} apparecchi, di cui ${h.num(C(h).mobile)} mobili, ${h.num(C(h).fisso)} fissi e ${h.num(C(h).velocita_media)} di velocità media, dichiarati da ${h.num(I(h).comuni)} comuni, dagli organi provinciali e dalla Polizia Stradale.`,
    faqs: (h) => [
      { q: 'Che differenza c’è tra autovelox fisso e mobile?', a: 'Il fisso è installato in modo permanente, in una cabina o su un palo, e misura anche senza agenti. Il mobile viene portato dagli agenti, su cavalletto o in auto, e richiede la loro presenza; il telelaser è un mobile puntato a mano. Per entrambi valgono la stessa tolleranza, la stessa tabella delle multe e lo stesso obbligo di segnalazione preventiva.' },
      { q: 'Un autovelox deve essere sempre segnalato?', a: 'Sì: il comma 6-bis dell’articolo 142 vuole che le postazioni di controllo siano segnalate prima e ben visibili, con cartelli o dispositivi luminosi, secondo il Regolamento e un decreto del Ministro dei trasporti. La mancanza o l’irregolarità della segnalazione è uno dei motivi di ricorso più frequenti, ma va dimostrata con elementi concreti.' },
      { q: 'Il registro del Ministero dice dove sono gli autovelox?', a: `Non sempre. Il registro elenca per ogni ente marca, modello, matricola e decreto di approvazione o omologazione; la posizione chilometrica compare solo quando l’ente l’ha scritta nelle note. Nella copia del ${h.date(h.reg)} molti comuni non indicano la strada. Per questo il calcolatore mostra le note così come l’ente le ha scritte, senza aggiungere posizioni.` },
      { q: 'Quanti autovelox ci sono in Italia?', a: `Nella copia del registro del ${h.date(h.reg)} gli enti ne hanno dichiarati ${h.num(I(h).totale)}: ${h.num(I(h).comuni)} comuni, gli organi provinciali e metropolitani (${h.num(I(h).provinciali)} apparecchi) e la Polizia Stradale (${h.num(I(h).polizia_stradale)}). Il numero cambia con le nuove comunicazioni degli enti, per questo ogni cifra del sito porta la data della copia letta.` },
    ],
    body: (h) => `<h2>Cosa misura un autovelox</h2>
<p>Tutti gli apparecchi fanno la stessa cosa: misurano una velocità e la associano a una targa e a un’ora. Cambia il modo. Gli autovelox fissi stanno in una cabina o su un palo e fotografano chi supera la soglia impostata, anche senza agenti sul posto. Quelli mobili vengono montati su un cavalletto o in un’auto di servizio e funzionano con gli agenti presenti; il telelaser è un mobile puntato a mano. I sistemi di velocità media, chiamati tutor, leggono la targa a due portali distanti alcuni chilometri e dividono la distanza per il tempo impiegato. Il registro del Ministero li distingue così, sulla base di ciò che ha scritto ciascun ente:</p>
${h.table(['Tipo dichiarato', 'Apparecchi', 'Quota'], [
  ['Mobile (telelaser, postazione spostabile)', C(h).mobile, h.pct(C(h).mobile / I(h).totale)],
  ['Fisso', C(h).fisso, h.pct(C(h).fisso / I(h).totale)],
  ['Velocità media (tutor)', C(h).velocita_media, h.pct(C(h).velocita_media / I(h).totale)],
  ['Fisso o mobile', C(h).fisso_mobile, h.pct(C(h).fisso_mobile / I(h).totale)],
  ['Tipo non precisato', C(h).non_precisato, h.pct(C(h).non_precisato / I(h).totale)],
], `Registro MIT dei dispositivi di rilevamento della velocità, copia del ${h.date(h.reg)}: ${h.num(I(h).totale)} apparecchi`, ['l', 'r', 'r'])}
<p>Più di un apparecchio su quattro non ha un tipo chiaro: molti enti hanno scritto solo marca e modello. Il dato va letto come una dichiarazione dell’ente, non come un censimento sul campo.</p>
<!--mini:velox-->
<h2>Le regole che un autovelox deve rispettare</h2>
<p>Tre condizioni vengono dal Codice. La prima riguarda l’apparecchio: ${h.src('cds142', 'l’articolo 142, comma 6')}, considera prova le risultanze di «apparecchiature debitamente omologate», anche per la velocità media. Sul verbale deve comparire il decreto dell’apparecchio; la pagina ${h.a('autovelox-omologati', 'autovelox omologati')} spiega perché la differenza tra approvazione e omologazione è discussa davanti ai giudici. La seconda riguarda la postazione: il comma 6-bis la vuole «preventivamente segnalata e ben visibile», con cartelli o dispositivi luminosi, secondo il Regolamento e un decreto del Ministro dei trasporti. La terza riguarda la misura: ${h.src('reg345', 'l’articolo 345 del Regolamento')} impone di togliere il ${h.pct(h.P.tolerance.percent, 0)} della velocità, con un minimo di ${h.num(h.P.tolerance.min_kmh)} km/h, prima di confrontarla con il limite (pagina ${h.a('tolleranza-autovelox', 'tolleranza autovelox')}).</p>
<p>Dal 2025 se ne aggiunge una quarta, di trasparenza: ogni ente deve dichiarare i propri apparecchi al Ministero, che li pubblica. Il decreto direttoriale n. 367 del 29 settembre 2025 ha fissato il censimento, chiuso il 28 novembre 2025 con la pubblicazione della lista; gli aggiornamenti proseguono secondo il decreto n. 305 del 18 agosto 2025 (${h.src('mitNews', 'comunicato del Ministero')}). Per ogni apparecchio l’ente indica marca, modello, versione, matricola, decreto e, se serve, posizione chilometrica e direzione.</p>
<h2>Chi usa gli autovelox</h2>
<p>Nella copia del ${h.date(h.reg)}, ${h.num(I(h).comuni)} comuni su ${h.num(h.S.meta.comuni_istat)} dichiarano almeno un apparecchio, cioè circa uno su cinque. Le regioni del Nord ne contano di più: Lombardia, Veneto, Emilia-Romagna e Piemonte superano ciascuna i 380 apparecchi, mentre Molise, Basilicata e Valle d’Aosta restano sotto i 20. Gli organi provinciali e delle città metropolitane, che controllano le strade provinciali, ne dichiarano ${h.num(I(h).provinciali)}. La Polizia Stradale, competente sulle autostrade e sulle statali, ne dichiara ${h.num(I(h).polizia_stradale)}, senza comune: per questo non compaiono nella ricerca per comune. La ${h.a('autovelox-mappa', 'mappa per regione')} e l’${h.a('elenco-autovelox', 'elenco degli autovelox')} danno il dettaglio.</p>
${h.table(['Comune', 'Provincia', 'Apparecchi dichiarati'], h.S.top_comuni.slice(0, 10).map(([n, s, c]) => [String(n), String(s), Number(c)]), `I dieci comuni con più apparecchi dichiarati, registro MIT del ${h.date(h.reg)}`, ['l', 'l', 'r'])}
<h2>Dopo il flash: cosa succede</h2>
<p>Il flash non è la multa. L’ente identifica il proprietario del veicolo e deve notificare il verbale entro ${h.num(h.P.notification.days)} giorni dall’accertamento, ${h.num(h.P.notification.days_abroad)} se il proprietario risiede all’estero. Il verbale riporta la velocità rilevata, quella accertata dopo la tolleranza, il limite, l’apparecchio e il suo decreto. Da quel giorno partono i 5 giorni per lo sconto del 30 % e i 60 giorni per pagare il minimo o fare ricorso. Il calcolatore della ${h.a('home', 'pagina iniziale')} trasforma la velocità del verbale in importo, punti e scadenze; la pagina ${h.a('ricorso-multa-autovelox', 'ricorso multa autovelox')} spiega quando conviene contestare. Gli importi applicati sono quelli in vigore nel 2026, letti sul testo vigente il ${h.date(h.P.retrieved_at)}.</p>
<!--mini:eccesso-->`,
  },
  en: {
    slug: 'speed-cameras-italy',
    nav: 'Speed cameras in Italy',
    card: 'Fixed, mobile, tutor: what an autovelox measures, how it must be signposted and how many each comune declares.',
    title: 'Speed cameras in Italy 2026: types, signs, fines, register',
    description: 'Speed cameras in Italy: fixed, mobile and tutor systems, how they measure, how they must be signposted, the tolerance applied and devices each town declares.',
    h1: 'Speed cameras in Italy: how they work and which ones a town declares',
    intro: 'Look up a comune (town): see how many devices it declared to the transport ministry, of which type and under which decree. Below, what an autovelox measures and the rules it must meet.',
    resume: (h) => `In Italy an autovelox is any device that measures a vehicle’s speed to record an offence: a fixed roadside unit, a mobile unit on a tripod or in a car, a laser gun aimed by an officer, or an average-speed system, the tutor, which times you between two gantries. Article 142 of the Italian Highway Code only accepts as evidence the readings of “duly homologated” devices, and paragraph 6-bis requires speed checks to be signposted in advance and clearly visible. The recorded speed is always cut by ${h.pct(h.P.tolerance.percent, 0)}, with a minimum of ${h.num(h.P.tolerance.min_kmh)} km/h. Since 28 November 2025 the Ministry of Infrastructure and Transport has published a register of the devices declared by police bodies: the copy of ${h.date(h.reg)} lists ${h.num(I(h).totale)} devices, including ${h.num(C(h).mobile)} mobile, ${h.num(C(h).fisso)} fixed and ${h.num(C(h).velocita_media)} average-speed systems, declared by ${h.num(I(h).comuni)} comuni, by provincial bodies and by the Polizia Stradale (the national traffic police).`,
    faqs: (h) => [
      { q: 'Do Italian speed cameras flash from the front or the back?', a: 'It depends on the device: many units photograph the rear plate, some the front, and tutor systems read the plate at two gantries. In Italy the fine is addressed to the vehicle owner, who is then asked to name the driver so that the points can be deducted. A photo of the driver’s face is therefore not needed for the fine to be valid.' },
      { q: 'Must speed cameras be signposted in Italy?', a: 'Yes. Paragraph 6-bis of article 142 requires speed checks to be signposted in advance and clearly visible, with signs or lights, under the Regulation and a ministerial decree. Look for a sign reading « controllo elettronico della velocità ». A missing or irregular sign is a common ground for appeal, but you need concrete evidence.' },
      { q: 'Does the ministry’s register show camera locations?', a: `Not always. For each body it lists make, model, serial number and approval or homologation decree; the kilometre position only appears when the body wrote it in the notes. In the copy of ${h.date(h.reg)} many towns give no road. The tool shows the notes exactly as each body wrote them and adds no location of its own.` },
      { q: 'Are speed camera detectors legal in Italy?', a: 'Article 45, paragraph 9-bis, bans making, selling or using devices that signal the presence of police speed-measuring equipment and allow it to be located; paragraph 9-ter sets a fine of €825 to €3,305 and confiscation of the device. The text does not mention navigation apps by name. This site lists declared devices so that drivers know the rules, not to dodge checks.' },
    ],
    body: (h) => `<h2>What an autovelox measures</h2>
<p>Every device does the same job: it measures a speed and links it to a plate and a time. Only the method changes. Fixed cameras sit in a cabinet or on a pole and photograph anyone above the set threshold, with no officers present. Mobile units are set up on a tripod or in a patrol car and work with officers on site; a telelaser is a laser gun aimed by hand. Average-speed systems, known as tutor, read your plate at two gantries a few kilometres apart and divide the distance by the time taken. The ministry’s register sorts them this way, based on what each body wrote:</p>
${h.table(['Type declared', 'Devices', 'Share'], [
  ['Mobile (laser gun, movable unit)', C(h).mobile, h.pct(C(h).mobile / I(h).totale)],
  ['Fixed', C(h).fisso, h.pct(C(h).fisso / I(h).totale)],
  ['Average speed (tutor)', C(h).velocita_media, h.pct(C(h).velocita_media / I(h).totale)],
  ['Fixed or mobile', C(h).fisso_mobile, h.pct(C(h).fisso_mobile / I(h).totale)],
  ['Type not stated', C(h).non_precisato, h.pct(C(h).non_precisato / I(h).totale)],
], `MIT register of speed-measuring devices, copy of ${h.date(h.reg)}: ${h.num(I(h).totale)} devices`, ['l', 'r', 'r'])}
<p>More than one device in four has no clear type: many bodies only wrote the make and model. Read the figures as declarations by each body, not as a survey on the ground.</p>
<!--mini:velox-->
<h2>The rules a speed camera must meet</h2>
<p>Three conditions come from the Highway Code. The first concerns the device: ${h.src('cds142', 'article 142, paragraph 6')}, accepts as evidence the readings of “duly homologated” equipment, average-speed systems included. The fine must name the device’s decree; the ${h.a('autovelox-omologati', 'homologated cameras page')} explains why the difference between approval and homologation is argued in court. The second concerns the site: paragraph 6-bis wants it “signposted in advance and clearly visible”, with signs or lights, under the Regulation and a transport ministry decree. The third concerns the reading: ${h.src('reg345', 'article 345 of the Regulation')} takes off ${h.pct(h.P.tolerance.percent, 0)} of the speed, at least ${h.num(h.P.tolerance.min_kmh)} km/h, before it is compared with the limit (see the ${h.a('tolleranza-autovelox', 'tolerance page')}).</p>
<p>Since 2025 a fourth, about transparency, applies: each body must declare its devices to the ministry, which publishes them. Directorial decree 367 of 29 September 2025 set up the census, closed on 28 November 2025 with the publication of the list; updates continue under decree 305 of 18 August 2025 (${h.src('mitNews', 'ministry press release')}). For each device the body gives make, model, version, serial number, decree and, where needed, the kilometre position and direction.</p>
<h2>Who runs speed cameras</h2>
<p>In the copy of ${h.date(h.reg)}, ${h.num(I(h).comuni)} of ${h.num(h.S.meta.comuni_istat)} comuni declare at least one device, roughly one in five. Northern regions have the most: Lombardy, Veneto, Emilia-Romagna and Piedmont each have over 380, while Molise, Basilicata and the Aosta Valley stay under 20. Provincial and metropolitan bodies, which police provincial roads, declare ${h.num(I(h).provinciali)}. The Polizia Stradale, in charge of motorways and state roads, declares ${h.num(I(h).polizia_stradale)}, with no comune, so they do not appear in the search by town. The ${h.a('autovelox-mappa', 'map by region')} and the ${h.a('elenco-autovelox', 'camera list')} give the detail.</p>
${h.table(['Comune', 'Province', 'Devices declared'], h.S.top_comuni.slice(0, 10).map(([n, s, c]) => [String(n), String(s), Number(c)]), `The ten comuni declaring the most devices, MIT register of ${h.date(h.reg)}`, ['l', 'l', 'r'])}
<h2>After the flash: what happens next</h2>
<p>The flash is not the fine. The police identify the vehicle owner and must serve the fine within ${h.num(h.P.notification.days)} days of the offence being established, or ${h.num(h.P.notification.days_abroad)} days if the owner lives abroad. With a rental car the rental company is contacted first and names the driver. The fine shows the recorded speed, the speed held after the tolerance, the limit, the device and its decree. From the day it reaches you, you have 5 days for the 30% discount and 60 days to pay the minimum or appeal. The calculator on the ${h.a('home', 'home page')} turns the speed on the fine into an amount, points and deadlines; the ${h.a('ricorso-multa-autovelox', 'appeal page')} explains when contesting makes sense. The amounts used are those in force in 2026, read in the text in force on ${h.date(h.P.retrieved_at)}.</p>
<!--mini:eccesso-->`,
  },
});
