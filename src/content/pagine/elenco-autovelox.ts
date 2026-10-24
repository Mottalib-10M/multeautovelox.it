import { defineGuide, type Helpers } from '../../lib/guide-types';
import { cats } from '../lib/velox';

const I = (h: Helpers) => h.S.italia;
const CITTA = ['Roma', 'Genova', 'Venezia', 'Firenze', 'Milano', 'Bologna', 'Torino', 'Palermo'] as const;
type Citta = { nome: string; sigla: string; totale: number; categorie: Record<string, number>; provinciali: number; conNote: number; nonAttivi: number };
const cit = (h: Helpers, n: string) => (h.S.citta as Record<string, Citta>)[n];

export default defineGuide({
  id: 'elenco-autovelox',
  group: 'autovelox',
  order: 2,
  tool: 'velox',
  outil: { defaultCat: 'A944', defaultNome: 'Bologna', defaultSigla: 'BO' },
  related: ['autovelox', 'autovelox-mappa', 'autovelox-milano', 'autovelox-roma', 'autovelox-omologati'],
  sources: ['mitVelox', 'mitNews', 'mitNoteLegali', 'istat', 'cds142'],
  it: {
    slug: 'elenco-autovelox',
    nav: 'Elenco autovelox per comune',
    card: 'Tutti i 7 896 comuni: quanti apparecchi ha dichiarato l’ente, marca, modello, decreto e note.',
    title: 'Elenco autovelox 2026: tutti i comuni del registro del MIT',
    description: 'Elenco degli autovelox dichiarati al Ministero per ogni comune: numero, tipo, marca, modello, decreto e note dell’ente, con la data della copia del registro.',
    h1: 'Elenco degli autovelox: cerca il tuo comune nel registro nazionale',
    intro: 'Scrivi il nome di un comune: vedi gli apparecchi dichiarati dall’ente locale e, sotto la linea, quelli degli organi provinciali. Ogni riga riporta ciò che l’ente ha comunicato.',
    resume: (h) => `L’elenco nazionale degli autovelox è la «Lista dispositivi di rilevamento della velocità» pubblicata dal Ministero delle infrastrutture e dei trasporti dal 28 novembre 2025, in base al decreto direttoriale n. 367 del 29 settembre 2025. Ogni organo di polizia che usa un apparecchio per misurare la velocità deve dichiararlo: marca, modello, versione, matricola, numero e data del decreto di approvazione o di omologazione, e, quando serve, posizione e direzione. La copia letta da questo sito è del ${h.date(h.reg)} e conta ${h.num(I(h).totale)} apparecchi. ${h.num(I(h).comuni)} comuni ne dichiarano almeno uno; gli organi provinciali e metropolitani ne dichiarano ${h.num(I(h).provinciali)}, la Polizia Stradale ${h.num(I(h).polizia_stradale)} e altri enti senza comune ${h.num(I(h).altri_senza_comune)}. Il calcolatore permette di cercare uno qualsiasi dei ${h.num(h.S.meta.comuni_istat)} comuni italiani e di aprire la lista completa della sua provincia, con le note scritte dagli enti. Un comune assente dall’elenco non ha dichiarato apparecchi in quella data.`,
    faqs: (h) => [
      { q: 'Il mio comune non compare: vuol dire che non ha autovelox?', a: `Vuol dire che nella copia del ${h.date(h.reg)} il comune non ha dichiarato apparecchi propri. Sulle strade del suo territorio possono comunque operare la Polizia Stradale, la polizia provinciale o metropolitana e i comuni vicini in convenzione. Il calcolatore mostra anche gli apparecchi degli organi provinciali della stessa provincia, elencati sotto la linea.` },
      { q: 'Cosa significa «segnalato non attivo» nell’elenco?', a: `Sono apparecchi per cui l’ente ha scritto nelle note che non sono in uso: dismessi, non attivati, fuori servizio. Nella copia del ${h.date(h.reg)} sono ${h.num(I(h).categorie.segnalati_non_attivi)}. Il sito li conta nel totale dell’ente, perché il registro li elenca, ma li segnala accanto al nome. Non vale il contrario: un apparecchio senza nota non è per questo certamente in funzione.` },
      { q: 'Ogni quanto viene aggiornato l’elenco degli autovelox?', a: 'Dopo il censimento chiuso il 28 novembre 2025 gli aggiornamenti proseguono, secondo le modalità del decreto direttoriale n. 305 del 2025, e il registro mostra la data dell’ultima comunicazione di ciascun apparecchio. Questo sito rilegge il registro ogni settimana; quando il sito del Ministero non risponde, resta la copia precedente e la sua data rimane scritta accanto a ogni numero.' },
    ],
    body: (h) => `<h2>Cosa contiene l’elenco</h2>
<p>Per ogni apparecchio il registro riporta l’ente che lo usa, con il suo codice catastale, il tipo (fisso, mobile, velocità media), marca, modello e versione, la matricola, il numero e la data del decreto ministeriale, le note libere dell’ente, la data dell’ultima comunicazione e quella del primo inserimento. Sul sito del Ministero la tabella si può copiare o scaricare in CSV, Excel e PDF. Questo sito ne ricava tre viste: la ricerca per comune qui sopra, la ${h.a('autovelox-mappa', 'mappa per regione')} e la ricerca per decreto della pagina ${h.a('autovelox-omologati', 'autovelox omologati')}.</p>
<p>Il registro non è una mappa. La posizione dell’apparecchio compare solo quando l’ente l’ha scritta nelle note, spesso come strada e chilometro; molti comuni non l’hanno fatto. Il tipo, poi, viene dal testo scritto dall’ente: ${h.num(I(h).categorie.non_precisato)} apparecchi su ${h.num(I(h).totale)} non lo indicano. Il sito riporta questi testi così come sono, senza correggerli né completarli.</p>
<!--mini:velox-->
<h2>Le città con più apparecchi dichiarati</h2>
${h.table(['Comune', 'Apparecchi del comune', 'Tipi dichiarati', 'Organi provinciali nella provincia'], CITTA.map((n) => { const c = cit(h, n); return [c.nome, c.totale, cats(h, c.categorie, true), c.provinciali]; }), `Grandi città nel registro MIT, copia del ${h.date(h.reg)}`, ['l', 'r', 'l', 'r'])}
<p>Roma è il comune con più apparecchi dichiarati (${h.num(cit(h, 'Roma').totale)}), seguito da Genova, Venezia, Firenze e Milano. Il confronto va fatto con cautela: un comune piccolo con molte strade extraurbane può dichiarare più apparecchi di una grande città, e alcuni enti hanno dichiarato ogni telelaser, altri solo le postazioni fisse. Le pagine ${h.a('autovelox-milano', 'autovelox a Milano')} e ${h.a('autovelox-roma', 'autovelox a Roma')} entrano nel dettaglio dei modelli e dei decreti.</p>
<h2>Chi non compare per comune</h2>
<p>${h.num(I(h).polizia_stradale)} apparecchi appartengono alla Polizia Stradale, che controlla autostrade e strade statali e li dichiara a livello nazionale, senza comune: tra questi ci sono i tutor autostradali. Altri ${h.num(I(h).altri_senza_comune)} appartengono a enti che il registro non lega a un comune preciso, come unioni o servizi intercomunali. Gli organi provinciali e delle città metropolitane, ${h.num(I(h).provinciali)} apparecchi in tutto, sono abbinati alla loro provincia e compaiono nella lista della provincia, sotto quelli del comune cercato.</p>
<h2>Come usare l’elenco con un verbale</h2>
<p>Sul verbale cerca tre informazioni: l’ente che ha accertato la violazione, il modello dell’apparecchio e il numero del decreto. Poi cerca il comune dell’ente e apri l’elenco: deve comparire un apparecchio con lo stesso modello e lo stesso decreto. Se l’ente è provinciale o metropolitano, guarda sotto la linea. Se non trovi nulla, ricorda che la copia è del ${h.date(h.reg)}: un apparecchio dichiarato dopo non c’è ancora. Un’assenza dal registro non annulla da sola la multa, ma è un elemento da valutare prima di decidere se fare ${h.a('ricorso-multa-autovelox', 'ricorso')}. Per l’importo, il ${h.a('home', 'calcolatore della multa')} applica la tolleranza e la fascia dell’articolo 142.</p>
<h2>Fonte e licenza</h2>
<p>Fonte: Ministero delle infrastrutture e dei trasporti, ${h.src('mitVelox', 'Lista dispositivi di rilevamento della velocità')}; i contenuti del sito del Ministero sono distribuiti con licenza Creative Commons Attribuzione 3.0 Italia (${h.src('mitNoteLegali', 'note legali')}). Comuni e codici catastali: ${h.src('istat', 'ISTAT')}, licenza CC BY 4.0. Il sito ha abbinato ogni ente al suo comune e ha dedotto il tipo dalle note; il metodo è descritto nella ${h.a('method', 'pagina del metodo')}.</p>`,
  },
  en: {
    slug: 'italy-speed-camera-list',
    nav: 'Speed camera list by town',
    card: 'All 7,896 comuni: how many devices each body declared, make, model, decree and notes.',
    title: 'Speed camera list 2026: every Italian comune in the register',
    description: 'Speed cameras declared to the Italian ministry for each comune: number, type, make, model, decree and notes from the police body, with the date of the copy.',
    h1: 'Speed camera list: look up any Italian town in the national register',
    intro: 'Type the name of a comune (town): see the devices declared by its local police and, below the line, those of the provincial bodies. Each row shows what the body reported.',
    resume: (h) => `Italy’s national speed-camera list is the “Lista dispositivi di rilevamento della velocità” published by the Ministry of Infrastructure and Transport since 28 November 2025, under directorial decree 367 of 29 September 2025. Every police body using a speed-measuring device must declare it: make, model, version, serial number, number and date of the approval or homologation decree and, where needed, location and direction. The copy read by this site dates from ${h.date(h.reg)} and lists ${h.num(I(h).totale)} devices. ${h.num(I(h).comuni)} comuni declare at least one; provincial and metropolitan bodies declare ${h.num(I(h).provinciali)}, the Polizia Stradale (national traffic police) ${h.num(I(h).polizia_stradale)} and other bodies with no comune ${h.num(I(h).altri_senza_comune)}. The tool lets you search any of Italy’s ${h.num(h.S.meta.comuni_istat)} comuni and open the full list for its province, with the notes written by each body. A town missing from the list had declared no device on that date.`,
    faqs: (h) => [
      { q: 'I am driving through a town that is not on the list: can I be caught?', a: `Yes. A town missing from the copy of ${h.date(h.reg)} has not declared devices of its own, but the Polizia Stradale, the provincial or metropolitan police and neighbouring towns working together may still run checks on its roads. Speed limits apply everywhere, whoever enforces them. The tool also lists the provincial bodies’ devices for the same province, below the line.` },
      { q: 'What does “reported not active” mean in the list?', a: `These are devices whose body wrote in the notes that they are not in use: withdrawn, never switched on or out of service. In the copy of ${h.date(h.reg)} there are ${h.num(I(h).categorie.segnalati_non_attivi)}. The site counts them in the body’s total, because the register lists them, but flags them next to the name. A device with no note is not thereby certain to be working.` },
      { q: 'Can I download the full Italian speed camera list?', a: 'Yes, on the ministry’s own site the table can be copied or exported as CSV, Excel or PDF. The data is released under the Creative Commons Attribution 3.0 Italy licence, so it may be reused with credit to the ministry. This site reads it every week and shows the date of the copy it uses next to every figure.' },
    ],
    body: (h) => `<h2>What the list contains</h2>
<p>For each device the register gives the body using it, with its cadastral code, the type (fixed, mobile, average speed), make, model and version, serial number, number and date of the ministerial decree, the body’s free-text notes, and the dates of the latest update and first entry. On the ministry’s site the table can be copied or downloaded as CSV, Excel and PDF. This site builds three views from it: the search by comune above, the ${h.a('autovelox-mappa', 'map by region')} and the search by decree on the ${h.a('autovelox-omologati', 'homologated cameras page')}.</p>
<p>The register is not a map. A device’s location only appears when the body wrote it in the notes, often as a road and a kilometre marker; many towns did not. The type also comes from the body’s own text: ${h.num(I(h).categorie.non_precisato)} of ${h.num(I(h).totale)} devices do not state it. The site shows these texts as they are, without correcting or completing them.</p>
<!--mini:velox-->
<h2>Cities declaring the most devices</h2>
${h.table(['Comune', 'Devices of the comune', 'Types declared', 'Provincial bodies in the province'], CITTA.map((n) => { const c = cit(h, n); return [c.nome, c.totale, cats(h, c.categorie, false), c.provinciali]; }), `Large cities in the MIT register, copy of ${h.date(h.reg)}`, ['l', 'r', 'l', 'r'])}
<p>Rome is the comune declaring the most devices (${h.num(cit(h, 'Roma').totale)}), followed by Genoa, Venice, Florence and Milan. Compare with care: a small town with many rural roads can declare more devices than a big city, and some bodies declared every laser gun while others listed only fixed sites. The ${h.a('autovelox-milano', 'Milan')} and ${h.a('autovelox-roma', 'Rome')} pages go into the models and decrees.</p>
<h2>Who does not appear by town</h2>
<p>${h.num(I(h).polizia_stradale)} devices belong to the Polizia Stradale, which polices motorways and state roads and declares them nationally, with no comune: motorway tutor systems are among them. Another ${h.num(I(h).altri_senza_comune)} belong to bodies the register does not tie to one comune, such as unions of towns or joint services. Provincial and metropolitan bodies, ${h.num(I(h).provinciali)} devices in all, are matched to their province and appear in the province list, below the devices of the town you searched.</p>
<h2>Checking a fine against the list</h2>
<p>On the fine, find three things: the body that recorded the offence, the device model and the decree number. Then search the body’s comune and open the list: a device with the same model and decree should appear. If the body is provincial or metropolitan, look below the line. If you find nothing, remember the copy dates from ${h.date(h.reg)}: a device declared later is not there yet. Being absent from the register does not cancel a fine by itself, but it is worth weighing before deciding whether to ${h.a('ricorso-multa-autovelox', 'appeal')}. Visitors who received a fine through a rental company can do the same check with the details on the fine itself. For the amount, the ${h.a('home', 'fine calculator')} applies the tolerance and the article 142 band.</p>
<h2>Source and licence</h2>
<p>Source: Ministry of Infrastructure and Transport, ${h.src('mitVelox', 'list of speed-measuring devices')}; content on the ministry’s site is released under the Creative Commons Attribution 3.0 Italy licence (${h.src('mitNoteLegali', 'legal notes')}). Comuni and cadastral codes: ${h.src('istat', 'ISTAT')}, CC BY 4.0 licence. The site matched each body to its comune and read the type from the notes; the method is set out on the ${h.a('method', 'method page')}.</p>`,
  },
});
