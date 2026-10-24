import { DATA_REGISTRO } from '../../lib/data-registro';
import { defineGuide, type Helpers } from '../../lib/guide-types';

type Reg = { regione: string; comuni: number; totale: number; mobile?: number; fisso?: number; velocita_media?: number };
type Prov = { sigla: string; provincia: string; regione: string; totale: number; comuni: number; provinciali: number };
const R = (h: Helpers) => [...(h.S.regioni as Reg[])].sort((a, b) => b.totale - a.totale);
const P = (h: Helpers) => [...(h.S.province as Prov[])].sort((a, b) => b.totale - a.totale);
const nome = (r: string) => r.split('/')[0];
const NORD = ['Lombardia', 'Veneto', 'Emilia-Romagna', 'Piemonte', 'Liguria', 'Friuli-Venezia Giulia', 'Trentino-Alto Adige/Südtirol', "Valle d'Aosta/Vallée d'Aoste"];
const CENTRO = ['Toscana', 'Lazio', 'Marche', 'Umbria'];
const somma = (h: Helpers, L: string[] | null) => R(h).filter((r) => (L ? L.includes(r.regione) : !NORD.includes(r.regione) && !CENTRO.includes(r.regione))).reduce((a, r) => a + r.totale, 0);
const tot = (h: Helpers) => R(h).reduce((a, r) => a + r.totale, 0);
const zero = (h: Helpers) => Object.keys(h.S.nomi_province).filter((s) => !P(h).some((p) => p.sigla === s)).map((s) => (h.S.nomi_province as Record<string, string>)[s]);

export default defineGuide({
  id: 'autovelox-mappa',
  group: 'autovelox',
  order: 3,
  tool: 'mappa',
  outil: { defaultRegione: 'Lombardia' },
  related: ['elenco-autovelox', 'autovelox', 'autovelox-milano', 'autovelox-roma', 'tutor-autostrade'],
  sources: ['mitVelox', 'mitNews', 'istat', 'mitNoteLegali'],
  it: {
    slug: 'autovelox-mappa',
    nav: 'Mappa autovelox per regione',
    card: 'Le 20 regioni e le 107 province: quanti apparecchi dichiara ciascuna, e dove ce ne sono meno.',
    title: `Autovelox mappa: regioni e province, registro al ${DATA_REGISTRO}`,
    description: `Mappa degli autovelox dichiarati al Ministero per regione e provincia, dalla copia archiviata del registro al ${DATA_REGISTRO}: totali, tipi, comuni e classifica.`,
    h1: 'Mappa degli autovelox: quanti ne dichiara ogni regione',
    intro: 'Tocca una regione o sceglila dall’elenco: vedi gli apparecchi dichiarati, i tipi e le province che ne hanno di più. Le cifre vengono dal registro del Ministero.',
    resume: (h) => `La mappa riporta, regione per regione, gli autovelox dichiarati dai comuni e dagli organi provinciali nel registro nazionale del Ministero delle infrastrutture e dei trasporti, nella copia del ${h.date(h.reg)}. In tutto sono ${h.num(tot(h))} apparecchi abbinati a un territorio; i ${h.num(h.S.italia.polizia_stradale)} della Polizia Stradale, che controlla autostrade e statali, non sono assegnati a nessun comune e restano fuori dalla mappa. Il Nord ne conta ${h.num(somma(h, NORD))}, cioè il ${h.pct(somma(h, NORD) / tot(h), 0)}; il Centro ${h.num(somma(h, CENTRO))}; il Sud e le isole ${h.num(somma(h, null))}. La regione con più apparecchi è ${nome(R(h)[0].regione)} (${h.num(R(h)[0].totale)}), quella con meno ${nome(R(h)[R(h).length - 1].regione)} (${h.num(R(h)[R(h).length - 1].totale)}). Tra le province guidano ${P(h)[0].provincia}, ${P(h)[1].provincia} e ${P(h)[2].provincia}, con più di cento apparecchi ciascuna, mentre ${zero(h).join(' e ')} non ne dichiarano nessuno. Sono numeri di dichiarazioni, non di controlli: un ente può dichiarare ogni telelaser, un altro solo le postazioni fisse.`,
    faqs: (h) => [
      { q: 'Qual è la regione con più autovelox?', a: `Nella copia del registro del ${h.date(h.reg)} è ${nome(R(h)[0].regione)}, con ${h.num(R(h)[0].totale)} apparecchi dichiarati da comuni e organi provinciali, seguita da ${nome(R(h)[1].regione)} (${h.num(R(h)[1].totale)}) e ${nome(R(h)[2].regione)} (${h.num(R(h)[2].totale)}). Sono dichiarazioni degli enti: la Polizia Stradale, che controlla autostrade e statali, non è assegnata a nessuna regione e non entra nel conto.` },
      { q: 'Perché al Sud risultano meno autovelox?', a: `Il registro conta solo ciò che gli enti hanno dichiarato. Al Sud molti comuni non hanno dichiarato apparecchi propri, e su molte strade i controlli sono affidati alla Polizia Stradale o ai comandi provinciali. Il dato non dice quanti controlli si fanno davvero: un telelaser usato ogni giorno conta come uno fermo in magazzino. Il Sud e le isole dichiarano ${h.num(somma(h, null))} apparecchi.` },
      { q: 'La mappa mostra la posizione dei singoli autovelox?', a: 'No. La mappa colora ogni regione secondo il numero di apparecchi dichiarati e mostra le province che ne hanno di più. Il registro non contiene coordinate: la posizione compare solo nelle note di alcuni enti, come strada e chilometro. Per vedere le note di un comune, apri l’elenco degli autovelox e cerca il suo nome.' },
    ],
    body: (h) => `<h2>Tutte le regioni</h2>
${h.table(['Regione', 'Apparecchi', 'Comuni con apparecchi', 'Fissi', 'Mobili', 'Velocità media'], R(h).map((r) => [nome(r.regione), r.totale, r.comuni, r.fisso ?? 0, r.mobile ?? 0, r.velocita_media ?? 0]), `Autovelox dichiarati per regione, registro MIT del ${h.date(h.reg)} (Polizia Stradale esclusa)`, ['l', 'r', 'r', 'r', 'r', 'r'])}
<p>I tipi non sommano sempre al totale: molti apparecchi non hanno un tipo dichiarato e alcuni sono indicati come fissi o mobili insieme. La colonna «comuni con apparecchi» conta i comuni che dichiarano almeno un apparecchio proprio; gli organi provinciali e metropolitani sono compresi nel totale della regione ma non in quella colonna.</p>
<!--mini:velox-->
<h2>Le province con più apparecchi</h2>
${h.table(['Provincia', 'Regione', 'Apparecchi', 'Comuni con apparecchi', 'Organi provinciali'], P(h).slice(0, 15).map((p) => [p.provincia, nome(p.regione), p.totale, p.comuni, p.provinciali]), `Le 15 province con più apparecchi dichiarati, registro MIT del ${h.date(h.reg)}`, ['l', 'l', 'r', 'r', 'r'])}
<p>Torino arriva in testa senza organi provinciali: i suoi apparecchi sono dichiarati da ${h.num(P(h).find((p) => p.sigla === 'TO')!.comuni)} comuni diversi. Roma e Milano devono il loro totale in buona parte alle città metropolitane, che controllano le strade provinciali con ${h.num(P(h).find((p) => p.sigla === 'RM')!.provinciali)} e ${h.num(P(h).find((p) => p.sigla === 'MI')!.provinciali)} apparecchi. All’altro capo, ${zero(h).join(' e ')} non hanno apparecchi dichiarati né dai comuni né dalla provincia: sulle loro strade i controlli restano possibili da parte della Polizia Stradale.</p>
<h2>Come leggere la mappa</h2>
<p>Ogni tessera è una regione, disposta più o meno dove si trova sulla carta: non è una carta in scala, ma permette di confrontare a colpo d’occhio regioni grandi e piccole. Il colore dipende dal numero di apparecchi, in quattro classi: fino a 50, da 51 a 150, da 151 a 300, più di 300. Tocca una tessera o scegli la regione dall’elenco: a destra compaiono il totale, la posizione in classifica, i tipi dichiarati e le sei province con più apparecchi.</p>
<p>Due avvertenze. Il numero dipende da come ogni ente ha compilato il registro, e il tipo viene dalle sue note. E la copia è del ${h.date(h.reg)}: è l’ultima copia completa che abbiamo potuto leggere, perché il sito del Ministero non risponde alle richieste automatiche. Quando tornerà raggiungibile, la mappa si aggiornerà alla data nuova. Per il dettaglio di un comune c’è l’${h.a('elenco-autovelox', 'elenco degli autovelox')}; per sapere cosa costa un eccesso di velocità, il ${h.a('home', 'calcolatore della multa')}.</p>
<!--mini:eccesso-->`,
  },
  en: {
    slug: 'italy-speed-camera-map',
    nav: 'Speed camera map by region',
    card: 'The 20 regions and 107 provinces: how many devices each declares, and where there are fewest.',
    title: `Speed camera map of Italy: MIT register of ${DATA_REGISTRO}`,
    description: `Map of the speed cameras declared to the Italian ministry by region and province, from the archived register copy of ${DATA_REGISTRO}: totals, types, towns, ranking.`,
    h1: 'Speed camera map: how many devices each Italian region declares',
    intro: 'Tap a region or pick it from the list: see the devices declared, their types and the provinces with the most. The figures come from the transport ministry’s register.',
    resume: (h) => `The map shows, region by region, the speed cameras declared by comuni (towns) and provincial bodies in the national register of the Italian Ministry of Infrastructure and Transport, in the copy of ${h.date(h.reg)}. In all, ${h.num(tot(h))} devices are tied to a territory; the ${h.num(h.S.italia.polizia_stradale)} devices of the Polizia Stradale, which patrols motorways and state roads, are assigned to no comune and stay off the map. The North accounts for ${h.num(somma(h, NORD))}, or ${h.pct(somma(h, NORD) / tot(h), 0)}; the Centre ${h.num(somma(h, CENTRO))}; the South and the islands ${h.num(somma(h, null))}. The region with the most devices is ${nome(R(h)[0].regione)} (${h.num(R(h)[0].totale)}), the one with the fewest ${nome(R(h)[R(h).length - 1].regione)} (${h.num(R(h)[R(h).length - 1].totale)}). Among provinces, ${P(h)[0].provincia}, ${P(h)[1].provincia} and ${P(h)[2].provincia} lead with over a hundred each, while ${zero(h).join(' and ')} declare none. These are counts of declarations, not of checks: one body may list every laser gun, another only fixed sites.`,
    faqs: (h) => [
      { q: 'Which Italian region has the most speed cameras?', a: `In the register copy of ${h.date(h.reg)} it is ${nome(R(h)[0].regione)}, with ${h.num(R(h)[0].totale)} devices declared by towns and provincial bodies, followed by ${nome(R(h)[1].regione)} (${h.num(R(h)[1].totale)}) and ${nome(R(h)[2].regione)} (${h.num(R(h)[2].totale)}). These are declarations: the Polizia Stradale, on motorways and state roads, is assigned to no region and is not counted.` },
      { q: 'I am planning a road trip: does the map show where the cameras are?', a: 'No. The map colours each region by the number of devices declared and lists the provinces with the most. The register holds no coordinates: a location only appears in some bodies’ notes, as a road and kilometre. Plan for checks everywhere, including motorway tutor sections run by the Polizia Stradale, and keep to the posted limits, which can change often.' },
      { q: 'Why does southern Italy show fewer cameras?', a: `The register only counts what each body declared. In the South many towns declared no devices of their own, and on many roads checks are left to the Polizia Stradale or provincial police. The figure says nothing about how often checks happen: a laser gun used daily counts the same as one kept in a cupboard. The South and islands declare ${h.num(somma(h, null))} devices.` },
    ],
    body: (h) => `<h2>Every region</h2>
${h.table(['Region', 'Devices', 'Comuni with devices', 'Fixed', 'Mobile', 'Average speed'], R(h).map((r) => [nome(r.regione), r.totale, r.comuni, r.fisso ?? 0, r.mobile ?? 0, r.velocita_media ?? 0]), `Speed cameras declared by region, MIT register of ${h.date(h.reg)} (Polizia Stradale excluded)`, ['l', 'r', 'r', 'r', 'r', 'r'])}
<p>Types do not always add up to the total: many devices have no declared type and some are listed as fixed or mobile at once. The “comuni with devices” column counts towns declaring at least one device of their own; provincial and metropolitan bodies are included in the regional total but not in that column. Region names are the official Italian ones: Lombardia is Lombardy, Piemonte Piedmont, Toscana Tuscany.</p>
<!--mini:velox-->
<h2>Provinces with the most devices</h2>
${h.table(['Province', 'Region', 'Devices', 'Comuni with devices', 'Provincial bodies'], P(h).slice(0, 15).map((p) => [p.provincia, nome(p.regione), p.totale, p.comuni, p.provinciali]), `The 15 provinces declaring the most devices, MIT register of ${h.date(h.reg)}`, ['l', 'l', 'r', 'r', 'r'])}
<p>Turin (Torino) comes first with no provincial body at all: its devices are declared by ${h.num(P(h).find((p) => p.sigla === 'TO')!.comuni)} different towns. Rome and Milan owe much of their totals to their metropolitan cities, which police provincial roads with ${h.num(P(h).find((p) => p.sigla === 'RM')!.provinciali)} and ${h.num(P(h).find((p) => p.sigla === 'MI')!.provinciali)} devices. At the other end, ${zero(h).join(' and ')} have no device declared by towns or province: checks on their roads remain possible by the Polizia Stradale.</p>
<h2>How to read the map</h2>
<p>Each tile is a region, placed roughly where it sits on a real map: it is not to scale, but it lets you compare large and small regions at a glance. The colour depends on the number of devices, in four classes: up to 50, 51 to 150, 151 to 300, over 300. Tap a tile or pick the region from the list: the total, its rank, the declared types and the six provinces with the most devices appear on the right.</p>
<p>Two caveats. The number depends on how each body filled in the register, and the type comes from its notes. And the copy dates from ${h.date(h.reg)}: it is the latest complete copy we could read, because the ministry’s site does not answer automated requests. When it can be reached again, the map will move to the new date. For one town’s detail use the ${h.a('elenco-autovelox', 'camera list')}; to see what speeding costs, the ${h.a('home', 'fine calculator')}.</p>
<!--mini:eccesso-->`,
  },
});
