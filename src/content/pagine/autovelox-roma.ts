import { defineGuide, type Helpers } from '../../lib/guide-types';
import { perModello, topComuni, CAT_IT, CAT_EN, PROV } from '../lib/velox';

type Citta = { totale: number; categorie: Record<string, number>; provinciali: number; nonAttivi: number; conNote: number; altriComuniProvincia: number; dispositiviAltriComuni: number };
const C = (h: Helpers) => (h.S.citta as Record<string, Citta>).Roma;
const PR = (h: Helpers) => (h.S.province as Array<{ sigla: string; totale: number; comuni: number; provinciali: number }>).find((p) => p.sigla === 'RM')!;
const M = () => perModello('RM', 'H501');
/** Appareils de la Città metropolitana regroupés par modèle. */
const PV = () => {
  const m = new Map<string, { modello: string; tipo: string; decreto: string; n: number }>();
  for (const d of PROV.RM.provinciali) { const k = `${d[2]} ${d[3]}|${d[6]}`; const o = m.get(k) ?? { modello: `${d[2]} ${d[3]}`.trim(), tipo: d[1], decreto: d[6], n: 0 }; o.n++; m.set(k, o); }
  return [...m.values()].sort((a, b) => b.n - a.n);
};
const vm = (h: Helpers) => C(h).categorie.velocita_media ?? 0;

export default defineGuide({
  id: 'autovelox-roma',
  group: 'autovelox',
  order: 5,
  tool: 'velox',
  outil: { defaultCat: 'H501', defaultNome: 'Roma', defaultSigla: 'RM' },
  related: ['autovelox-milano', 'elenco-autovelox', 'autovelox-omologati', 'multa-eccesso-di-velocita', 'ricorso-multa-autovelox'],
  sources: ['mitVelox', 'mitNews', 'cds142', 'reg345', 'istat'],
  it: {
    slug: 'autovelox-roma',
    nav: 'Autovelox a Roma',
    card: 'I 43 apparecchi di Roma Capitale, modello per modello, e i 26 della Città metropolitana.',
    title: 'Autovelox Roma: apparecchi di Roma Capitale al 22/02/2026',
    description: 'Autovelox a Roma: i 43 apparecchi dichiarati dalla Polizia di Roma Capitale nel registro al 22/02/2026 (copia archiviata), con modelli, decreti e provincia.',
    h1: 'Autovelox a Roma: gli apparecchi dichiarati da Roma Capitale',
    intro: 'Il calcolatore parte da Roma: apri l’elenco per vedere ogni apparecchio con modello, decreto e note. Sotto, cosa dichiarano la Città metropolitana e i comuni vicini.',
    resume: (h) => `Roma è il comune italiano con più apparecchi per la velocità dichiarati nel registro nazionale del Ministero delle infrastrutture e dei trasporti: nella copia del ${h.date(h.reg)} la Polizia Locale di Roma Capitale ne dichiara ${h.num(C(h).totale)}. Secondo le dichiarazioni, ${h.num(vm(h))} sono sistemi di velocità media, ${h.num(C(h).categorie.mobile ?? 0)} sono telelaser e ${h.num(C(h).categorie.non_precisato ?? 0)} non hanno un tipo indicato: in gran parte sono apparecchi Autovelox della Sodi Scientifica, con decreti del 2003 e del 2014. Nessuno è segnalato come non attivo. Le note dell’ente riportano le estensioni di approvazione, non le strade. La Polizia Locale della Città metropolitana di Roma ne dichiara altri ${h.num(C(h).provinciali)}, per le strade provinciali, e gli altri comuni della provincia ${h.num(C(h).dispositiviAltriComuni)}, con Fiumicino in testa. Il Grande Raccordo Anulare e le autostrade sono controllati dalla Polizia Stradale, che il registro elenca senza comune. Alla velocità misurata si toglie il ${h.pct(h.P.tolerance.percent, 0)}, con un minimo di ${h.num(h.P.tolerance.min_kmh)} km/h, e si applicano gli importi in vigore nel 2026.`,
    faqs: (h) => [
      { q: 'Quanti autovelox ha Roma Capitale?', a: `Nella copia del registro del ${h.date(h.reg)} la Polizia Locale di Roma Capitale dichiara ${h.num(C(h).totale)} apparecchi, più di qualsiasi altro comune italiano. Di questi ${h.num(vm(h))} misurano la velocità media e ${h.num(C(h).categorie.mobile ?? 0)} sono telelaser. Nel resto della provincia si aggiungono ${h.num(C(h).provinciali)} apparecchi della Città metropolitana e ${h.num(C(h).dispositiviAltriComuni)} di altri comuni.` },
      { q: 'Il registro dice in quali vie di Roma sono gli autovelox?', a: 'No. Per gli apparecchi di Roma Capitale le note del registro riportano le estensioni del decreto di approvazione, non le strade. La posizione si ricava dai cartelli di preavviso, obbligatori prima di ogni postazione, e dal verbale, che indica luogo e ora dell’accertamento. Questo sito non aggiunge posizioni che l’ente non ha dichiarato.' },
      { q: 'Chi controlla la velocità sul Grande Raccordo Anulare?', a: 'Il Raccordo è un’autostrada e la competenza è della Polizia Stradale, i cui apparecchi il registro elenca a livello nazionale, senza comune. Per questo non compaiono tra quelli di Roma Capitale. Per una multa presa sul Raccordo valgono le stesse regole: tolleranza del 5 %, fasce dell’articolo 142, sconto entro 5 giorni.' },
    ],
    body: (h) => `<h2>Gli apparecchi di Roma Capitale</h2>
${h.table(['Modello', 'Tipo', 'Decreto', 'Data del decreto', 'Apparecchi'], M().map((x) => [x.modello, CAT_IT[x.tipo] ?? x.tipo, x.decreto, x.data, x.n]), `Roma Capitale, Polizia Locale: apparecchi dichiarati nel registro MIT, copia del ${h.date(h.reg)}`, ['l', 'l', 'r', 'r', 'r'])}
<p>La parte più grande è fatta di apparecchi Autovelox della Sodi Scientifica, dichiarati con due decreti diversi, uno del 2003 e uno del 2014, ciascuno seguito da estensioni successive scritte nelle note. I sistemi di velocità media sono di due famiglie: i Celeritas EVO, con decreto del 2016 ed estensioni del 2017 e del 2021, e due Tutor con decreto del 2024. I telelaser sono quattro. Il Comune non ha indicato il tipo per buona parte degli apparecchi: il sito li conta come «non precisato» invece di indovinarlo dal modello.</p>
<!--mini:eccesso-->
<h2>La Città metropolitana e i comuni vicini</h2>
${h.table(['Modello', 'Tipo', 'Decreto', 'Apparecchi'], PV().map((x) => [x.modello, CAT_IT[x.tipo] ?? x.tipo, x.decreto, x.n]), `Polizia Locale della Città metropolitana di Roma, registro MIT del ${h.date(h.reg)}`, ['l', 'l', 'r', 'r'])}
<p>Sulle strade provinciali la Città metropolitana usa otto postazioni fisse e una serie di apparecchi mobili: Autovelox 105, Trucam, Velomatic e telelaser. Fuori dal capoluogo, i comuni della provincia che dichiarano più apparecchi sono questi:</p>
${h.table(['Comune', 'Apparecchi dichiarati'], topComuni('RM', 'H501', 8).map((c) => [c.nome, c.n]), `Provincia di Roma, comuni con più apparecchi oltre al capoluogo, registro MIT del ${h.date(h.reg)}`, ['l', 'r'])}
<p>In tutta la provincia gli apparecchi dichiarati sono ${h.num(PR(h).totale)}, in ${h.num(PR(h).comuni)} comuni oltre agli organi provinciali. Per controllare un comune qualsiasi, scrivine il nome nel calcolatore in cima alla pagina.</p>
<!--mini:velox-->
<h2>Una multa a Roma: cosa controllare</h2>
<p>Il verbale di Roma Capitale indica l’apparecchio, il decreto e la velocità rilevata e accertata. Confronta modello e decreto con la prima tabella: un Sodi Autovelox dovrebbe citare uno dei due decreti del registro o le loro estensioni. Poi verifica la riduzione: 5 % della velocità, con un minimo di 5 km/h. Per un eccesso tra 10 e 40 km/h oltre il limite si pagano ${h.eur(h.P.speeding.bands[1].min)}, o ${h.eur(h.P.speeding.bands[1].min * (1 - h.P.payment.reduction), 2)} entro 5 giorni dalla notifica, e si perdono ${h.num(h.P.speeding.bands[1].points)} punti; la seconda volta nello stesso anno in centro abitato l’importo sale a ${h.eur(h.P.speeding.repeat_in_town_c8.min)} con 15-30 giorni di sospensione. Per contestare, la pagina sul ${h.a('ricorso-multa-autovelox', 'ricorso')} spiega termini e motivi; per il decreto, quella sugli ${h.a('autovelox-omologati', 'autovelox omologati')}.</p>`,
  },
  en: {
    slug: 'rome-speed-cameras',
    nav: 'Speed cameras in Rome',
    card: 'The 43 devices of Roma Capitale, model by model, and the 26 of the metropolitan area.',
    title: 'Rome speed cameras: Roma Capitale devices as of 22/02/2026',
    description: 'Rome speed cameras: the 43 devices declared by Roma Capitale’s local police in the register of 22/02/2026 (archived copy), with models, decrees, the province.',
    h1: 'Speed cameras in Rome: the devices declared by Roma Capitale',
    intro: 'The tool opens on Rome: show the list to see each device with its model, decree and notes. Below, what the metropolitan area and nearby towns declare.',
    resume: (h) => `Rome is the Italian comune declaring the most speed-measuring devices in the national register of the Ministry of Infrastructure and Transport: in the copy of ${h.date(h.reg)} the Polizia Locale (local police) of Roma Capitale declares ${h.num(C(h).totale)}. According to the declarations, ${h.num(vm(h))} are average-speed systems, ${h.num(C(h).categorie.mobile ?? 0)} are laser guns and ${h.num(C(h).categorie.non_precisato ?? 0)} have no stated type: most are Autovelox units made by Sodi Scientifica, under decrees from 2003 and 2014. None is flagged as not active. The body’s notes list approval extensions, not streets. The local police of the Città metropolitana di Roma declare another ${h.num(C(h).provinciali)}, for provincial roads, and the other towns in the province ${h.num(C(h).dispositiviAltriComuni)}, led by Fiumicino, home of the main airport. The Grande Raccordo Anulare ring road and the motorways are policed by the Polizia Stradale, listed in the register with no town. The recorded speed is cut by ${h.pct(h.P.tolerance.percent, 0)}, at least ${h.num(h.P.tolerance.min_kmh)} km/h, and the amounts in force in 2026 apply.`,
    faqs: (h) => [
      { q: 'How many speed cameras does Rome have?', a: `In the register copy of ${h.date(h.reg)} the local police of Roma Capitale declare ${h.num(C(h).totale)} devices, more than any other Italian town. ${h.num(vm(h))} measure average speed and ${h.num(C(h).categorie.mobile ?? 0)} are laser guns. The rest of the province adds ${h.num(C(h).provinciali)} metropolitan devices and ${h.num(C(h).dispositiviAltriComuni)} from other towns, Fiumicino first.` },
      { q: 'I drove a rental car from Fiumicino airport and got flashed: who sent the fine?', a: 'Look at the body named on the fine. The town of Fiumicino, the metropolitan police of Rome, Roma Capitale and the Polizia Stradale on the motorway to the city all run checks. The rental company passes your details on first, then the fine arrives by post. The deadlines run from the day you receive it, not from the rental company’s email.' },
      { q: 'Who checks speed on Rome’s Grande Raccordo Anulare?', a: 'The ring road is a motorway, so the Polizia Stradale is in charge, and the register lists its devices nationally, with no town. That is why they do not appear among Roma Capitale’s. A fine from the Raccordo follows the same rules: the 5% tolerance, the article 142 bands and the discount within 5 days of service.' },
    ],
    body: (h) => `<h2>Roma Capitale’s devices</h2>
${h.table(['Model', 'Type', 'Decree', 'Decree date', 'Devices'], M().map((x) => [x.modello, CAT_EN[x.tipo] ?? x.tipo, x.decreto, x.data, x.n]), `Roma Capitale, Polizia Locale: devices declared in the MIT register, copy of ${h.date(h.reg)}`, ['l', 'l', 'r', 'r', 'r'])}
<p>The largest group is Autovelox units from Sodi Scientifica, declared under two different decrees, one from 2003 and one from 2014, each followed by later extensions listed in the notes. The average-speed systems come in two families: Celeritas EVO units, under a 2016 decree with extensions in 2017 and 2021, and two Tutor units under a 2024 decree. There are four laser guns. The city gave no type for much of its equipment: the site counts those as “not stated” rather than guessing from the model.</p>
<!--mini:eccesso-->
<h2>The metropolitan area and nearby towns</h2>
${h.table(['Model', 'Type', 'Decree', 'Devices'], PV().map((x) => [x.modello, CAT_EN[x.tipo] ?? x.tipo, x.decreto, x.n]), `Local police of the Città metropolitana di Roma, MIT register of ${h.date(h.reg)}`, ['l', 'l', 'r', 'r'])}
<p>On provincial roads the metropolitan area uses eight fixed sites and a set of mobile devices: Autovelox 105, Trucam, Velomatic and laser units. Outside the city, the towns in the province declaring the most devices are these:</p>
${h.table(['Comune', 'Devices declared'], topComuni('RM', 'H501', 8).map((c) => [c.nome, c.n]), `Province of Rome, towns with the most devices besides the city, MIT register of ${h.date(h.reg)}`, ['l', 'r'])}
<p>Across the province ${h.num(PR(h).totale)} devices are declared, in ${h.num(PR(h).comuni)} towns plus the provincial bodies. To check any town, type its name in the tool at the top of the page.</p>
<!--mini:velox-->
<h2>A fine from Rome: what to check</h2>
<p>A Roma Capitale fine names the device, its decree and the recorded and held speeds. Compare the model and decree with the first table: a Sodi Autovelox should quote one of the two decrees in the register or their extensions. Then check the reduction: 5% of the speed, at least 5 km/h. For 10 to 40 km/h over the limit you pay ${h.eur(h.P.speeding.bands[1].min)}, or ${h.eur(h.P.speeding.bands[1].min * (1 - h.P.payment.reduction), 2)} within 5 days of service, and an Italian licence loses ${h.num(h.P.speeding.bands[1].points)} points; a second time in the same year in a built-up area costs ${h.eur(h.P.speeding.repeat_in_town_c8.min)} and a 15 to 30-day suspension. To contest, the ${h.a('ricorso-multa-autovelox', 'appeal page')} covers deadlines and grounds; for the decree, the ${h.a('autovelox-omologati', 'homologated cameras page')}.</p>`,
  },
});
