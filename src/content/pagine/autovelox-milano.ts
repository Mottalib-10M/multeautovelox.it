import { defineGuide, type Helpers } from '../../lib/guide-types';
import { perModello, topComuni, strade, CAT_IT, CAT_EN } from '../lib/velox';

type Citta = { totale: number; categorie: Record<string, number>; provinciali: number; nonAttivi: number; altriComuniProvincia: number; dispositiviAltriComuni: number; organi: string[] };
const C = (h: Helpers) => (h.S.citta as Record<string, Citta>).Milano;
const PR = (h: Helpers) => (h.S.province as Array<{ sigla: string; totale: number; comuni: number; provinciali: number }>).find((p) => p.sigla === 'MI')!;
const M = () => perModello('MI', 'F205');
const ST = () => strade('MI');
const attivi = () => ST().reduce((a, s) => a + s.attivi, 0);

export default defineGuide({
  id: 'autovelox-milano',
  group: 'autovelox',
  order: 4,
  tool: 'velox',
  outil: { defaultCat: 'F205', defaultNome: 'Milano', defaultSigla: 'MI' },
  related: ['autovelox-roma', 'elenco-autovelox', 'tutor-autostrade', 'multa-eccesso-di-velocita', 'autovelox-omologati'],
  sources: ['mitVelox', 'mitNews', 'cds142', 'reg345', 'istat'],
  it: {
    slug: 'autovelox-milano',
    nav: 'Autovelox a Milano',
    card: 'I 22 apparecchi del Comune di Milano e i sistemi di velocità media della Città metropolitana, strada per strada.',
    title: 'Autovelox Milano: Comune e provincia, registro al 22/02/2026',
    description: 'Autovelox a Milano: i 22 apparecchi dichiarati dalla Polizia Locale nel registro al 22/02/2026 (copia archiviata), modelli, decreti e strade provinciali.',
    h1: 'Autovelox a Milano: cosa dichiarano il Comune e la Città metropolitana',
    intro: 'Il calcolatore parte da Milano: apri l’elenco per vedere ogni apparecchio, con modello e decreto. Sotto, le strade provinciali con i sistemi di velocità media.',
    resume: (h) => `Nel registro nazionale del Ministero delle infrastrutture e dei trasporti, copia del ${h.date(h.reg)}, la Polizia Locale del Comune di Milano dichiara ${h.num(C(h).totale)} apparecchi per il controllo della velocità: ${Object.entries(C(h).categorie).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${h.num(v)} ${CAT_IT[k]}`).join(', ')}. Di questi, ${h.num(C(h).nonAttivi)} sono segnalati dal Comune come non attivati. I modelli più numerosi sono ${M()[0].modello} (${h.num(M()[0].n)}, decreto n. ${M()[0].decreto}) e ${M()[1].modello} (${h.num(M()[1].n)}, decreto n. ${M()[1].decreto}). Il Comune non indica nel registro le strade delle postazioni. Lo fa invece la Polizia metropolitana della Città metropolitana di Milano, che dichiara ${h.num(C(h).provinciali)} sistemi di velocità media sulle strade provinciali, come la Rivoltana, la Paullese e la Cassanese, con chilometro e direzione. In tutta la provincia gli apparecchi dichiarati sono ${h.num(PR(h).totale)}, in ${h.num(PR(h).comuni)} comuni. Alla velocità misurata si toglie il ${h.pct(h.P.tolerance.percent, 0)}, minimo ${h.num(h.P.tolerance.min_kmh)} km/h.`,
    faqs: (h) => [
      { q: 'Quanti autovelox ci sono a Milano?', a: `Nella copia del registro del ${h.date(h.reg)} il Comune di Milano ne dichiara ${h.num(C(h).totale)}, di cui ${h.num(C(h).nonAttivi)} segnalati come non attivati. A questi si aggiungono i ${h.num(C(h).provinciali)} sistemi di velocità media della Città metropolitana sulle strade provinciali e gli apparecchi degli altri comuni della provincia, ${h.num(C(h).dispositiviAltriComuni)} in ${h.num(C(h).altriComuniProvincia)} comuni. Autostrade e tangenziali sono controllate dalla Polizia Stradale.` },
      { q: 'Dove sono i tutor della Città metropolitana di Milano?', a: `La Polizia metropolitana li indica nelle note del registro, con strada, chilometro e direzione. Nella copia del ${h.date(h.reg)} risultano ${h.num(attivi())} apparecchi dichiarati in uso su ${h.num(ST().length)} strade, tra cui la Rivoltana, la Paullese, la Cassanese, la Binasco-Melegnano e la ex statale 35 Milano-Meda. La tabella di questa pagina li elenca strada per strada.` },
      { q: 'Una multa autovelox del Comune di Milano si paga come le altre?', a: 'Sì: valgono la tolleranza del 5 % con un minimo di 5 km/h, le fasce dell’articolo 142, lo sconto del 30 % entro 5 giorni dalla notifica e il minimo entro 60. Il verbale indica come pagare. Se l’apparecchio citato non compare tra quelli dichiarati dal Comune nel registro, conviene verificarlo prima di decidere.' },
    ],
    body: (h) => `<h2>Gli apparecchi del Comune di Milano</h2>
${h.table(['Modello', 'Tipo', 'Decreto', 'Data del decreto', 'Apparecchi', 'Stato'], M().map((x) => [x.modello, CAT_IT[x.tipo] ?? x.tipo, x.decreto, x.data, x.n, x.stato === 'attivo_dichiarato' ? 'dichiarato in uso' : 'segnalato non attivo']), `Comune di Milano, Polizia Locale: apparecchi dichiarati nel registro MIT, copia del ${h.date(h.reg)}`, ['l', 'l', 'r', 'r', 'r', 'l'])}
<p>Il Comune ha dichiarato soprattutto apparecchi fissi, di due famiglie: i Traffiphot III con decreto del 2004 e i T-EXSPEED con decreto del 2011. Ci sono poi tre Autovelox 106 indicati nelle note come «postazione mobile», due telelaser e due sistemi EnVES che il Comune stesso segnala come non attivati. Il registro non riporta le vie delle postazioni fisse: per saperlo bisogna guardare i cartelli di preavviso che l’articolo 142, comma 6-bis, impone prima di ogni postazione, o il verbale stesso, che indica luogo e ora dell’accertamento.</p>
<!--mini:eccesso-->
<h2>Le strade provinciali con velocità media</h2>
<p>La Polizia metropolitana della Città metropolitana di Milano è uno degli enti che compilano il registro con più dettagli: per ogni portale scrive strada, chilometro, direzione e data del censimento. I suoi ${h.num(C(h).provinciali)} apparecchi sono tutti sistemi di velocità media, che misurano il tempo tra due portali e ne ricavano la velocità.</p>
${h.table(['Strada', 'Dichiarati in uso', 'Segnalati dismessi'], ST().map((s) => [s.strada, s.attivi, s.non]), `Città metropolitana di Milano: strade citate nelle note del registro MIT, copia del ${h.date(h.reg)}`, ['l', 'r', 'r'])}
<p>Alcuni apparecchi compaiono due volte: le note indicano che un portale dismesso è stato sostituito da uno nuovo nello stesso punto, censito qualche settimana dopo. La tabella conta le righe del registro, così come l’ente le ha scritte. Su queste strade il limite è spesso diverso da quello generale delle extraurbane: conta il cartello.</p>
<!--mini:tutor-->
<h2>Gli altri comuni della provincia</h2>
${h.table(['Comune', 'Apparecchi dichiarati'], topComuni('MI', 'F205', 8).map((c) => [c.nome, c.n]), `Provincia di Milano, comuni con più apparecchi oltre al capoluogo, registro MIT del ${h.date(h.reg)}`, ['l', 'r'])}
<p>In tutto ${h.num(C(h).altriComuniProvincia)} comuni della provincia, oltre a Milano, dichiarano ${h.num(C(h).dispositiviAltriComuni)} apparecchi. Per qualsiasi comune basta scriverne il nome nel calcolatore in cima alla pagina. Tangenziali e autostrade intorno a Milano sono di competenza della Polizia Stradale, i cui apparecchi il registro elenca a livello nazionale senza comune: la pagina sul ${h.a('tutor-autostrade', 'tutor in autostrada')} spiega come si calcola la multa con la velocità media.</p>
<h2>Una multa a Milano: cosa controllare</h2>
<p>Sul verbale cerca l’ente (Polizia Locale di Milano o Polizia metropolitana), il modello e il decreto dell’apparecchio, e confrontali con le tabelle qui sopra. Poi controlla la velocità accertata: deve essere quella rilevata meno il 5 %, con un minimo di 5 km/h. Il ${h.a('multa-eccesso-di-velocita', 'calcolo della multa per eccesso di velocità')} dà l’importo e i punti; la pagina ${h.a('autovelox-omologati', 'autovelox omologati')} spiega cosa dice, e cosa non dice, il decreto citato. Gli importi sono quelli in vigore nel 2026.</p>`,
  },
  en: {
    slug: 'milan-speed-cameras',
    nav: 'Speed cameras in Milan',
    card: 'The 22 devices declared by the City of Milan and the metropolitan area’s average-speed systems, road by road.',
    title: 'Milan speed cameras: city and provincial devices, 22/02/2026',
    description: 'Milan speed cameras: the 22 devices declared by the city’s local police in the register of 22/02/2026 (archived copy), models, decrees and provincial roads.',
    h1: 'Speed cameras in Milan: what the city and the metropolitan area declare',
    intro: 'The tool opens on Milan: show the list to see each device with its model and decree. Below, the provincial roads covered by average-speed systems.',
    resume: (h) => `In the national register of the Italian Ministry of Infrastructure and Transport, copy of ${h.date(h.reg)}, the Polizia Locale (local police) of the City of Milan declares ${h.num(C(h).totale)} speed-measuring devices: ${Object.entries(C(h).categorie).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${h.num(v)} ${CAT_EN[k]}`).join(', ')}. Of these, ${h.num(C(h).nonAttivi)} are flagged by the city as never switched on. The most common models are the ${M()[0].modello} (${h.num(M()[0].n)}, decree ${M()[0].decreto}) and the ${M()[1].modello} (${h.num(M()[1].n)}, decree ${M()[1].decreto}). The city gives no street names in the register. The metropolitan police of the Città metropolitana di Milano do: they declare ${h.num(C(h).provinciali)} average-speed systems on provincial roads such as the Rivoltana, the Paullese and the Cassanese, with kilometre and direction. Across the whole province ${h.num(PR(h).totale)} devices are declared, in ${h.num(PR(h).comuni)} comuni. The recorded speed is always cut by ${h.pct(h.P.tolerance.percent, 0)}, at least ${h.num(h.P.tolerance.min_kmh)} km/h.`,
    faqs: (h) => [
      { q: 'How many speed cameras are there in Milan?', a: `In the register copy of ${h.date(h.reg)} the City of Milan declares ${h.num(C(h).totale)}, ${h.num(C(h).nonAttivi)} of them flagged as not switched on. Add the metropolitan area’s ${h.num(C(h).provinciali)} average-speed systems on provincial roads and the devices of other towns in the province, ${h.num(C(h).dispositiviAltriComuni)} in ${h.num(C(h).altriComuniProvincia)} comuni. Motorways and ring roads are policed by the Polizia Stradale.` },
      { q: 'I got a speeding fine in a rental car around Milan: what now?', a: 'The rental company is contacted first and names you as the driver, often charging an admin fee. The actual fine then reaches you by post, with the 5-day discount and the 60-day deadline counted from the day you receive it. Check the body named on it (city or metropolitan police) and the device against the tables on this page.' },
      { q: 'Where are the average-speed cameras around Milan?', a: `The metropolitan police list them in the register notes, with road, kilometre and direction. In the copy of ${h.date(h.reg)} there are ${h.num(attivi())} devices declared in use on ${h.num(ST().length)} roads, including the Rivoltana, the Paullese, the Cassanese, the Binasco-Melegnano and the former state road 35 Milano-Meda. The table on this page lists them road by road.` },
    ],
    body: (h) => `<h2>The City of Milan’s devices</h2>
${h.table(['Model', 'Type', 'Decree', 'Decree date', 'Devices', 'Status'], M().map((x) => [x.modello, CAT_EN[x.tipo] ?? x.tipo, x.decreto, x.data, x.n, x.stato === 'attivo_dichiarato' ? 'declared in use' : 'reported not active']), `City of Milan, Polizia Locale: devices declared in the MIT register, copy of ${h.date(h.reg)}`, ['l', 'l', 'r', 'r', 'r', 'l'])}
<p>The city mainly declared fixed devices, of two families: Traffiphot III units under a 2004 decree and T-EXSPEED units under a 2011 decree. Then come three Autovelox 106 described in the notes as a “postazione mobile” (mobile unit), two laser guns and two EnVES systems that the city itself flags as not switched on. The register gives no street for the fixed sites: you will see them from the warning signs that article 142, paragraph 6-bis, requires before every check, or on the fine itself, which states the place and time.</p>
<!--mini:eccesso-->
<h2>Provincial roads with average-speed checks</h2>
<p>The metropolitan police of the Città metropolitana di Milano are among the bodies that fill in the register in most detail: for each gantry they write the road, kilometre, direction and census date. All of their ${h.num(C(h).provinciali)} devices are average-speed systems, which time you between two gantries and work out your speed from it.</p>
${h.table(['Road', 'Declared in use', 'Reported withdrawn'], ST().map((s) => [s.strada, s.attivi, s.non]), `Città metropolitana di Milano: roads named in the MIT register notes, copy of ${h.date(h.reg)}`, ['l', 'r', 'r'])}
<p>Some devices appear twice: the notes show that a withdrawn gantry was replaced by a new one at the same point, registered a few weeks later. The table counts the register’s rows as the body wrote them. S.P. means strada provinciale (provincial road) and S.S. strada statale (state road). On these roads the limit often differs from the general one for extra-urban roads: the sign is what counts.</p>
<!--mini:tutor-->
<h2>Other towns in the province</h2>
${h.table(['Comune', 'Devices declared'], topComuni('MI', 'F205', 8).map((c) => [c.nome, c.n]), `Province of Milan, towns with the most devices besides the city, MIT register of ${h.date(h.reg)}`, ['l', 'r'])}
<p>In all, ${h.num(C(h).altriComuniProvincia)} towns in the province besides Milan declare ${h.num(C(h).dispositiviAltriComuni)} devices. For any of them, type its name in the tool at the top. The ring roads (tangenziali) and motorways around Milan are policed by the Polizia Stradale, whose devices the register lists nationally with no town: the ${h.a('tutor-autostrade', 'motorway tutor page')} explains how average-speed fines are worked out.</p>
<h2>A fine from Milan: what to check</h2>
<p>On the fine, find the body (Milan local police or metropolitan police), the device model and its decree, and compare them with the tables above. Then check the speed held: it must be the recorded speed less 5%, at least 5 km/h. The ${h.a('multa-eccesso-di-velocita', 'speeding fine page')} gives the amount and points; the ${h.a('autovelox-omologati', 'homologated cameras page')} explains what the quoted decree does and does not show. The amounts are those in force in 2026.</p>`,
  },
});
