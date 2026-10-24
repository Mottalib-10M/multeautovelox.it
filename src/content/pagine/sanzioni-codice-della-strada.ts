import { defineGuide, type Helpers } from '../../lib/guide-types';

/** Etichette proprie della pagina, nell'ordine della tabella riassuntiva. */
const NOMI: Array<[string, string, string]> = [
  ['semaforo_rosso', 'Passaggio con il semaforo rosso', 'Running a red light'],
  ['segnaletica', 'Segnaletica non rispettata', 'Ignoring a road sign'],
  ['cellulare', 'Telefono in mano o cuffie alla guida', 'Phone in hand or headphones'],
  ['cintura', 'Cintura o seggiolino non usati', 'Seat belt or child seat not used'],
  ['alcol_05_08', 'Alcol tra 0,5 e 0,8 g/l', 'Alcohol 0.5 to 0.8 g/l'],
  ['autostrada_contromano_retromarcia', 'Retromarcia in autostrada', 'Reversing on a motorway'],
  ['ztl_corsie', 'Ingresso in ZTL, area pedonale o corsia riservata', 'Entering a ZTL, pedestrian area or bus lane'],
  ['sosta_158_c6', 'Sosta su passo carrabile o in doppia fila', 'Parking across a driveway or double-parking'],
  ['divieto_sosta_comunale', 'Sosta contro un divieto del comune', 'Parking against a council ban'],
  ['sosta_vietata_158', 'Sosta su marciapiede, strisce o pista ciclabile', 'Parking on a pavement, crossing or cycle lane'],
  ['sosta_158_5bis', 'Sosta all’incrocio, alla fermata o in corsia riservata', 'Parking at a junction, stop or in a bus lane'],
  ['sosta_158_4bis', 'Sosta sul posto per disabili', 'Parking in a disabled bay'],
];
const V = (h: Helpers, id: string) => h.P.other_violations.find((x) => x.id === id)!;
/** La maggiorazione notturna dell'art. 195 c.2-bis vale per gli articoli elencati nei parametri. */
const notte = (h: Helpers, id: string) => h.P.night_surcharge.applies_to_articles.some((a) => a.split(' ')[0] === V(h, id).article);
const B = (h: Helpers) => h.P.speeding.bands;
const sosp = (h: Helpers, id: string, en: boolean) => {
  const s = h.M.altra(id).sospensione;
  if (!s) return en ? 'no' : 'no';
  const u = s.unita === 'giorni' ? (en ? 'days' : 'giorni') : (en ? 'months' : 'mesi');
  return s.unita === 'giorni' && s.a === 60 ? (en ? `${s.da} days to 2 months` : `da ${s.da} giorni a 2 mesi`) : (en ? `${s.da} to ${s.a} ${u}` : `da ${s.da} a ${s.a} ${u}`);
};
const art = (h: Helpers) => h.P.night_surcharge.applies_to_articles.map((a) => a.replace(' c.', ', commi ').replace('-', ' e '));
const artEn = (h: Helpers) => h.P.night_surcharge.applies_to_articles.map((a) => a.replace(' c.', ' paras. ').replace('-', ' and '));
const lista = (xs: string[], e: string) => xs.join(', ').replace(/, ([^,]*)$/, ` ${e} $1`);

export default defineGuide({
  id: 'sanzioni-codice-della-strada',
  group: 'infrazioni',
  order: 4,
  tool: 'altre',
  outil: { defaultId: 'semaforo_rosso' },
  related: ['multa-eccesso-di-velocita', 'multa-cellulare-alla-guida', 'multa-divieto-di-sosta', 'tabella-punti-patente', 'nuovo-codice-della-strada-multe'],
  sources: ['cds146', 'cds186', 'cds176', 'cds195', 'cds202', 'tabella'],
  it: {
    slug: 'sanzioni-codice-della-strada',
    nav: 'Sanzioni del Codice della Strada',
    card: 'Importi, sconto, punti e sospensione delle infrazioni più comuni: semaforo rosso, alcol, autostrada, cellulare, cintura, sosta.',
    title: 'Sanzioni Codice della Strada 2026: multe e punti in tabella',
    description: 'Sanzioni del Codice della Strada 2026: importo, sconto entro 5 giorni, punti e sospensione per semaforo rosso, alcol, autostrada, cellulare, cintura e sosta.',
    h1: 'Sanzioni del Codice della Strada: importi e punti delle multe più comuni',
    intro: 'Scegli l’infrazione: il calcolo mostra importo minimo e massimo, quanto paghi entro 5 e 60 giorni, i punti e l’eventuale sospensione, con la maggiorazione notturna dove la legge la prevede.',
    resume: (h) => `Le sanzioni del Codice della Strada sono quasi tutte somme con un minimo e un massimo: sul verbale si legge il minimo, che si paga entro 60 giorni, ridotto del 30 % entro 5 giorni quando l’infrazione non comporta la sospensione della patente. Passare con il rosso costa da ${h.eur(h.M.altra('semaforo_rosso').minimo)} a ${h.eur(h.M.altra('semaforo_rosso').massimo)} e ${h.num(h.M.altra('semaforo_rosso').punti)} punti; non rispettare un cartello da ${h.eur(h.M.altra('segnaletica').minimo)} a ${h.eur(h.M.altra('segnaletica').massimo)} e ${h.num(h.M.altra('segnaletica').punti)} punti; la retromarcia in autostrada da ${h.eur(h.M.altra('autostrada_contromano_retromarcia').minimo)} a ${h.eur(h.M.altra('autostrada_contromano_retromarcia').massimo)} e ${h.num(h.M.altra('autostrada_contromano_retromarcia').punti)} punti. Guidare con un tasso alcolemico tra 0,5 e 0,8 g/l costa da ${h.eur(h.M.altra('alcol_05_08').minimo)} a ${h.eur(h.M.altra('alcol_05_08').massimo)}, ${h.num(h.M.altra('alcol_05_08').punti)} punti e da ${h.num(h.M.altra('alcol_05_08').sospensione!.da)} a ${h.num(h.M.altra('alcol_05_08').sospensione!.a)} mesi di sospensione; oltre 0,8 g/l è reato. Il telefono in mano costa da ${h.eur(h.M.altra('cellulare').minimo)} a ${h.eur(h.M.altra('cellulare').massimo)} con sospensione, la cintura da ${h.eur(h.M.altra('cintura').minimo)} a ${h.eur(h.M.altra('cintura').massimo)}, la sosta vietata da ${h.eur(h.M.altra('sosta_158_c6').minimo)} a ${h.eur(h.M.altra('sosta_158_4bis').massimo)} secondo il luogo. Tra le 22 e le 7 le multe per velocità, semaforo, segnaletica e alcune altre aumentano di un terzo. Sono gli importi in vigore nel 2026.`,
    faqs: (h) => [
      { q: 'Quanto costa passare con il rosso?', a: `Da ${h.eur(h.M.altra('semaforo_rosso').minimo)} a ${h.eur(h.M.altra('semaforo_rosso').massimo)} e ${h.num(h.M.altra('semaforo_rosso').punti)} punti, secondo l’articolo 146, comma 3. Entro 5 giorni si pagano ${h.eur(h.M.altra('semaforo_rosso').ridotto ?? 0, 2)}. Tra le 22 e le 7 il minimo sale a ${h.eur(h.M.altra('semaforo_rosso', { notte: true }).minimo, 2)}. Chi passa con il rosso due volte in due anni subisce anche la sospensione della patente da uno a tre mesi.` },
      { q: 'Quali multe aumentano di un terzo di notte?', a: `Solo quelle degli articoli elencati dal comma 2-bis dell’articolo 195: ${lista(art(h), 'e')}. Comprendono velocità, precedenza, semaforo e segnaletica, distanza di sicurezza, manovre, tempi di guida dei professionisti e la retromarcia in autostrada. Telefono, cintura, sosta e ZTL costano invece lo stesso a ogni ora.` },
      { q: 'Guidare con un tasso alcolemico tra 0,5 e 0,8 è reato?', a: `No, è un illecito amministrativo: l’articolo 186, comma 2, lettera a), prevede da ${h.eur(h.M.altra('alcol_05_08').minimo)} a ${h.eur(h.M.altra('alcol_05_08').massimo)}, ${h.num(h.M.altra('alcol_05_08').punti)} punti e la sospensione della patente da tre a sei mesi, senza sconto. Oltre 0,8 g/l diventa reato, con ammenda e arresto. Per neopatentati, under 21 e professionisti il limite è zero.` },
      { q: 'Quanto costa la retromarcia in autostrada?', a: `Da ${h.eur(h.M.altra('autostrada_contromano_retromarcia').minimo)} a ${h.eur(h.M.altra('autostrada_contromano_retromarcia').massimo)} e ${h.num(h.M.altra('autostrada_contromano_retromarcia').punti)} punti (articolo 176, comma 20), anche sulla corsia di emergenza; sono escluse solo le manovre nelle aree di servizio o di parcheggio. Di notte l’importo aumenta di un terzo. Invertire il senso di marcia o andare contromano è più grave: il comma 19 prevede una somma molto più alta e la revoca della patente.` },
      { q: 'Quali infrazioni comportano la sospensione della patente?', a: 'Tra quelle di questa pagina: il telefono alla guida già alla prima volta, l’alcol oltre 0,5 g/l, l’eccesso di velocità oltre 40 km/h, la circolazione sulla corsia di emergenza in autostrada, e alla ripetizione in due anni il semaforo rosso e la cintura. In tutti questi casi lo sconto del 30 % non si applica.' },
    ],
    body: (h) => {
      const rosso = h.M.altra('semaforo_rosso'), rossoN = h.M.altra('semaforo_rosso', { notte: true });
      const retro = h.M.altra('autostrada_contromano_retromarcia');
      const k = h.P.night_surcharge.factor;
      return `<h2>Le infrazioni calcolate, in una tabella</h2>
<p>Ogni importo qui sotto viene dal testo vigente del Codice della Strada letto su Normattiva il ${h.date(h.P.retrieved_at)} ed è in vigore nel 2026. «Entro 5 giorni» è il minimo ridotto del 30 % previsto dall’${h.src('cds202', 'articolo 202')}, escluso quando l’infrazione comporta la sospensione della patente; «Notte» indica se tra le 22 e le 7 l’importo cresce di un terzo.</p>
${h.table(['Infrazione', 'Norma', 'Importo', 'Entro 5 giorni', 'Punti', 'Sospensione', 'Notte'], [
  [h.a('multa-eccesso-di-velocita', 'Eccesso di velocità (quattro fasce)'), 'art. 142', `${h.eur(B(h)[0].min)} – ${h.eur(B(h)[B(h).length - 1].max)}`, 'secondo la fascia', `${h.num(B(h)[0].points)}–${h.num(B(h)[B(h).length - 1].points)}`, 'oltre 40 km/h', 'sì'],
  ...NOMI.map(([id, it]) => { const r = h.M.altra(id); return [it, V(h, id).ref.replace('Art.', 'art.'), `${h.eur(r.minimo)} – ${h.eur(r.massimo)}`, r.ridotto === null ? 'nessuno sconto' : h.eur(r.ridotto, 2), id === 'sosta_158_5bis' ? '0 o 2' : h.num(r.punti), sosp(h, id, false), notte(h, id) ? 'sì' : 'no']; }),
], 'Sanzioni del Codice della Strada: importi in vigore nel 2026, sconto, punti e sospensione', ['l', 'l', 'r', 'r', 'r', 'l', 'l'])}
<p>Gli importi 2027 non sono ancora pubblicati: l’articolo 195 prevede un aggiornamento all’inflazione con un decreto atteso entro il 1° dicembre 2026, e fino ad allora valgono queste cifre. La velocità ha una pagina propria perché le fasce sono quattro: la ${h.a('multa-eccesso-di-velocita', 'multa per eccesso di velocità')} le calcola dalla velocità del verbale.</p>
<h2>Semaforo rosso e segnaletica</h2>
<p>L’${h.src('cds146', 'articolo 146')} separa due violazioni. Il comma 3 punisce chi prosegue la marcia quando il semaforo o l’agente del traffico la vietano: da ${h.eur(rosso.minimo)} a ${h.eur(rosso.massimo)} e ${h.num(rosso.punti)} punti, ${h.eur(rosso.ridotto ?? 0, 2)} entro 5 giorni. Il comma 3-bis aggiunge la sospensione della patente da uno a tre mesi a chi commette la stessa violazione almeno due volte in due anni, all’ultima infrazione. Il comma 2 punisce invece chi non osserva i comportamenti indicati dalla segnaletica o dagli agenti: da ${h.eur(h.M.altra('segnaletica').minimo)} a ${h.eur(h.M.altra('segnaletica').massimo)} e ${h.num(h.M.altra('segnaletica').punti)} punti, esclusi i cartelli di divieto di sosta e fermata, che hanno sanzioni proprie descritte nella pagina sulla ${h.a('multa-divieto-di-sosta', 'multa per divieto di sosta')}.</p>
<p>Entrambe le violazioni rientrano nella maggiorazione notturna: di notte il rosso parte da ${h.eur(rossoN.minimo, 2)} invece di ${h.eur(rosso.minimo)}, e lo sconto entro 5 giorni si calcola sul minimo aumentato, ${h.eur(rossoN.ridotto ?? 0, 2)}.</p>
<!--mini:infrazione_2-->
<h2>Alcol tra 0,5 e 0,8 g/l</h2>
<p>L’${h.src('cds186', 'articolo 186')} distingue tre livelli di tasso alcolemico. Il primo, oltre 0,5 e fino a 0,8 grammi per litro (lettera a del comma 2), è l’unico che resta un illecito amministrativo: da ${h.eur(h.M.altra('alcol_05_08').minimo)} a ${h.eur(h.M.altra('alcol_05_08').massimo)}, la sospensione della patente da tre a sei mesi e ${h.num(h.M.altra('alcol_05_08').punti)} punti. Per la sospensione lo sconto del 30 % non vale. Oltre 0,8 g/l (lettere b e c) il fatto è un reato, punito con ammenda e arresto e con sospensioni più lunghe; il comma 2-sexies aumenta l’ammenda da un terzo alla metà quando il reato è commesso tra le 22 e le 7. La lettera a, invece, non è tra le sanzioni che l’articolo 195 aumenta di notte.</p>
<p>Il limite di 0,5 g/l non vale per tutti: l’articolo 186-bis impone il tasso zero a chi ha meno di 21 anni, ai neopatentati nei primi tre anni e a chi guida per professione, con ${h.num(h.TP.righe.find((r) => r.articolo === '186-bis')!.punti)} punti in tabella. Se il conducente in stato di ebbrezza provoca un incidente, il comma 2-bis raddoppia le sanzioni e dispone il fermo del veicolo per centottanta giorni.</p>
<h2>Autostrada: retromarcia, corsia di emergenza e contromano</h2>
<p>Sulle autostrade e sulle strade extraurbane principali l’${h.src('cds176', 'articolo 176')} vieta, tra l’altro, la retromarcia anche sulla corsia di emergenza (salvo le manovre nelle aree di servizio o di parcheggio), la circolazione sulla corsia di emergenza se non per fermarsi o ripartire, e l’uso delle corsie di accelerazione e decelerazione se non per entrare o uscire. Tutti e tre i casi costano da ${h.eur(retro.minimo)} a ${h.eur(retro.massimo)} (comma 20) e ${h.num(retro.punti)} punti. Per la corsia di emergenza e le corsie di variazione di velocità il comma 22 aggiunge la sospensione della patente da due a sei mesi; per la sola retromarcia no, quindi resta lo sconto: ${h.eur(retro.ridotto ?? 0, 2)} entro 5 giorni.</p>
<p>L’articolo 195 elenca i commi 19 e 20 dell’articolo 176 tra le sanzioni aumentate di notte: tra le 22 e le 7 la retromarcia parte da ${h.eur(retro.minimo * k, 2)}. Invertire il senso di marcia, attraversare lo spartitraffico o percorrere la carreggiata contromano è un’altra violazione (comma 19), con una somma molto più alta, la revoca della patente e il fermo del veicolo per tre mesi.</p>
<!--mini:notturna-->
<h2>Quando la notte costa di più</h2>
<p>Il comma 2-bis dell’${h.src('cds195', 'articolo 195')} aumenta di un terzo le sanzioni degli articoli ${lista(art(h), 'e')}, quando la violazione è commessa dopo le 22 e prima delle 7. L’elenco è chiuso: telefono alla guida, cintura, sosta, ZTL e alcol tra 0,5 e 0,8 g/l non ne fanno parte e costano lo stesso a ogni ora. L’aumento vale sia per il minimo sia per il massimo, e lo sconto del 30 %, se ammesso, si calcola sul minimo già aumentato.</p>
<h2>Telefono, cintura, sosta: le pagine dedicate</h2>
<p>Tre infrazioni hanno una pagina propria perché le regole di dettaglio contano quanto l’importo. Il ${h.a('multa-cellulare-alla-guida', 'telefono alla guida')} comporta la sospensione già alla prima violazione e quindi niente sconto. Per la ${h.a('multa-cintura', 'cintura')} conta chi risponde per passeggeri e bambini. La ${h.a('multa-divieto-di-sosta', 'sosta vietata')} ha sei livelli diversi, con importi ridotti per moto e ciclomotori. I punti di tutte le violazioni, anche quelle non calcolate qui, sono nella ${h.a('tabella-punti-patente', 'tabella punti patente')}; le altre novità della legge 177 del 2024 sono nella pagina sul ${h.a('nuovo-codice-della-strada-multe', 'nuovo Codice della Strada')}.</p>
<!--mini:scadenze-->`;
    },
  },
  en: {
    slug: 'italy-traffic-fines-list',
    nav: 'Italian traffic fines list',
    card: 'Amounts, discount, points and suspension for the most common offences: red light, alcohol, motorway, phone, seat belt, parking.',
    title: 'Traffic fines in Italy 2026: amounts and points, full list',
    description: 'Traffic fines in Italy 2026: amount, 5-day discount, points and suspension for red lights, alcohol, motorway reversing, phone, seat belt, parking and speeding.',
    h1: 'Italian traffic fines: amounts and points for the most common offences',
    intro: 'Choose the offence: the calculator shows the minimum and maximum, what you pay within 5 and 60 days, the points and any suspension, with the night surcharge where the law sets one.',
    resume: (h) => `Italian traffic fines are almost all a range with a minimum and a maximum: the fine (verbale) shows the minimum, payable within 60 days, cut by 30% within 5 days when the offence carries no licence suspension. Running a red light costs ${h.eur(h.M.altra('semaforo_rosso').minimo)} to ${h.eur(h.M.altra('semaforo_rosso').massimo)} and ${h.num(h.M.altra('semaforo_rosso').punti)} points; ignoring a road sign ${h.eur(h.M.altra('segnaletica').minimo)} to ${h.eur(h.M.altra('segnaletica').massimo)} and ${h.num(h.M.altra('segnaletica').punti)} points; reversing on a motorway ${h.eur(h.M.altra('autostrada_contromano_retromarcia').minimo)} to ${h.eur(h.M.altra('autostrada_contromano_retromarcia').massimo)} and ${h.num(h.M.altra('autostrada_contromano_retromarcia').punti)} points. Driving with 0.5 to 0.8 g/l of alcohol in the blood costs ${h.eur(h.M.altra('alcol_05_08').minimo)} to ${h.eur(h.M.altra('alcol_05_08').massimo)}, ${h.num(h.M.altra('alcol_05_08').punti)} points and a ${h.num(h.M.altra('alcol_05_08').sospensione!.da)} to ${h.num(h.M.altra('alcol_05_08').sospensione!.a)}-month suspension; above 0.8 g/l it is a criminal offence. A phone in hand costs ${h.eur(h.M.altra('cellulare').minimo)} to ${h.eur(h.M.altra('cellulare').massimo)} with a suspension, a seat belt ${h.eur(h.M.altra('cintura').minimo)} to ${h.eur(h.M.altra('cintura').massimo)}, illegal parking ${h.eur(h.M.altra('sosta_158_c6').minimo)} to ${h.eur(h.M.altra('sosta_158_4bis').massimo)} depending on the place. Between 10 pm and 7 am, fines for speeding, red lights, signs and a few others rise by a third. These are the amounts in force in 2026.`,
    faqs: (h) => [
      { q: 'How much is a red-light fine in Italy?', a: `${h.eur(h.M.altra('semaforo_rosso').minimo)} to ${h.eur(h.M.altra('semaforo_rosso').massimo)} and ${h.num(h.M.altra('semaforo_rosso').punti)} points under article 146, paragraph 3. Within 5 days you pay ${h.eur(h.M.altra('semaforo_rosso').ridotto ?? 0, 2)}. Between 10 pm and 7 am the minimum rises to ${h.eur(h.M.altra('semaforo_rosso', { notte: true }).minimo, 2)}. Running a red light twice within two years also brings a licence suspension of one to three months.` },
      { q: 'Which Italian fines rise by a third at night?', a: `Only those of the articles listed in article 195, paragraph 2-bis: ${lista(artEn(h), 'and')}. They cover speeding, right of way, traffic lights and signs, safe distance, manoeuvres, professional drivers’ hours and motorway reversing. Phone, seat belt, parking and ZTL fines cost the same at any hour.` },
      { q: 'Is drink-driving between 0.5 and 0.8 g/l a crime in Italy?', a: `No, it is an administrative offence: article 186, paragraph 2, letter a), sets ${h.eur(h.M.altra('alcol_05_08').minimo)} to ${h.eur(h.M.altra('alcol_05_08').massimo)}, ${h.num(h.M.altra('alcol_05_08').punti)} points and a licence suspension of three to six months, with no discount. Above 0.8 g/l it becomes a crime, with a criminal fine and possible arrest. For new drivers, under-21s and professional drivers the limit is zero.` },
      { q: 'What is the fine for reversing on an Italian motorway?', a: `${h.eur(h.M.altra('autostrada_contromano_retromarcia').minimo)} to ${h.eur(h.M.altra('autostrada_contromano_retromarcia').massimo)} and ${h.num(h.M.altra('autostrada_contromano_retromarcia').punti)} points (article 176, paragraph 20), including on the hard shoulder; only manoeuvres in service or parking areas are allowed. At night the amount rises by a third. Turning round or driving the wrong way is far more serious: paragraph 19 sets a much higher sum and revokes the licence.` },
      { q: 'Do Italian traffic fines apply to tourists driving foreign cars?', a: `Yes, the Highway Code applies to everyone on Italian roads, with the same amounts, points shown on the fine and suspensions. When the owner of the vehicle lives abroad, the police have ${h.num(h.P.notification.days_abroad)} days from the offence to serve the fine instead of ${h.num(h.P.notification.days)}, so a fine can arrive long after the trip and still be valid.` },
    ],
    body: (h) => {
      const rosso = h.M.altra('semaforo_rosso'), rossoN = h.M.altra('semaforo_rosso', { notte: true });
      const retro = h.M.altra('autostrada_contromano_retromarcia');
      const k = h.P.night_surcharge.factor;
      return `<h2>The offences we calculate, in one table</h2>
<p>Every amount below comes from the current text of the Italian Highway Code read on Normattiva on ${h.date(h.P.retrieved_at)}, and is in force in 2026. «Within 5 days» is the minimum less 30% under ${h.src('cds202', 'article 202')}, excluded when the offence carries a licence suspension; «Night» shows whether the amount rises by a third between 10 pm and 7 am.</p>
${h.table(['Offence', 'Rule', 'Amount', 'Within 5 days', 'Points', 'Suspension', 'Night'], [
  [h.a('multa-eccesso-di-velocita', 'Speeding (four bands)'), 'art. 142', `${h.eur(B(h)[0].min)} – ${h.eur(B(h)[B(h).length - 1].max)}`, 'by band', `${h.num(B(h)[0].points)}–${h.num(B(h)[B(h).length - 1].points)}`, 'above 40 km/h over', 'yes'],
  ...NOMI.map(([id, , en]) => { const r = h.M.altra(id); return [en, V(h, id).ref.replace('Art.', 'art.').replace(' c.', ' para. '), `${h.eur(r.minimo)} – ${h.eur(r.massimo)}`, r.ridotto === null ? 'no discount' : h.eur(r.ridotto, 2), id === 'sosta_158_5bis' ? '0 or 2' : h.num(r.punti), sosp(h, id, true), notte(h, id) ? 'yes' : 'no']; }),
], 'Italian Highway Code penalties: amounts in force in 2026, discount, points and suspension', ['l', 'l', 'r', 'r', 'r', 'l', 'l'])}
<p>The 2027 amounts are not published yet: article 195 provides for an inflation update by a decree due by 1 December 2026, and until then these figures apply. Speeding has its own page because there are four bands: the ${h.a('multa-eccesso-di-velocita', 'Italian speeding fine page')} works them out from the speed on your fine.</p>
<h2>Red lights and road signs</h2>
<p>${h.src('cds146', 'Article 146')} separates two offences. Paragraph 3 punishes going on when the traffic light or a traffic officer says stop: ${h.eur(rosso.minimo)} to ${h.eur(rosso.massimo)} and ${h.num(rosso.punti)} points, ${h.eur(rosso.ridotto ?? 0, 2)} within 5 days. Paragraph 3-bis adds a licence suspension of one to three months for a driver who commits the same offence at least twice within two years, at the last one. Paragraph 2 punishes not following what signs or officers require: ${h.eur(h.M.altra('segnaletica').minimo)} to ${h.eur(h.M.altra('segnaletica').massimo)} and ${h.num(h.M.altra('segnaletica').punti)} points, except no-parking and no-stopping signs, which have their own penalties described on the ${h.a('multa-divieto-di-sosta', 'parking fines page')}.</p>
<p>Both offences carry the night surcharge: at night a red light starts at ${h.eur(rossoN.minimo, 2)} instead of ${h.eur(rosso.minimo)}, and the 5-day discount is worked out on the higher minimum, ${h.eur(rossoN.ridotto ?? 0, 2)}.</p>
<!--mini:infrazione_2-->
<h2>Alcohol between 0.5 and 0.8 g/l</h2>
<p>${h.src('cds186', 'Article 186')} sets three blood-alcohol levels. The first, above 0.5 and up to 0.8 grams per litre (letter a of paragraph 2), is the only one that stays an administrative offence: ${h.eur(h.M.altra('alcol_05_08').minimo)} to ${h.eur(h.M.altra('alcol_05_08').massimo)}, a three to six-month licence suspension and ${h.num(h.M.altra('alcol_05_08').punti)} points. Because of the suspension, there is no 30% discount. Above 0.8 g/l (letters b and c) it is a criminal offence, punished with a criminal fine (ammenda) and arrest and longer suspensions; paragraph 2-sexies raises the ammenda by a third to a half when the offence is committed between 10 pm and 7 am. Letter a, by contrast, is not among the penalties article 195 raises at night.</p>
<p>The 0.5 g/l limit does not apply to everyone: article 186-bis sets a zero limit for drivers under 21, new drivers in their first three years and professional drivers, with ${h.num(h.TP.righe.find((r) => r.articolo === '186-bis')!.punti)} points in the table. If a drunk driver causes an accident, paragraph 2-bis doubles the penalties and orders the vehicle impounded for a hundred and eighty days.</p>
<h2>Motorways: reversing, hard shoulder and wrong-way driving</h2>
<p>On motorways and main extra-urban roads, ${h.src('cds176', 'article 176')} bans, among other things, reversing, even on the hard shoulder (except for manoeuvres in service or parking areas), driving on the hard shoulder other than to stop or move off, and using acceleration and deceleration lanes other than to join or leave. All three cost ${h.eur(retro.minimo)} to ${h.eur(retro.massimo)} (paragraph 20) and ${h.num(retro.punti)} points. For the hard shoulder and the slip lanes, paragraph 22 adds a licence suspension of two to six months; reversing alone does not carry one, so the discount stays: ${h.eur(retro.ridotto ?? 0, 2)} within 5 days.</p>
<p>Article 195 lists paragraphs 19 and 20 of article 176 among the penalties raised at night: between 10 pm and 7 am reversing starts at ${h.eur(retro.minimo * k, 2)}. Turning round, crossing the central reservation or driving against the traffic is a separate offence (paragraph 19), with a much higher sum, revocation of the licence and the vehicle impounded for three months.</p>
<!--mini:notturna-->
<h2>When night costs more</h2>
<p>Paragraph 2-bis of ${h.src('cds195', 'article 195')} raises by a third the penalties of articles ${lista(artEn(h), 'and')} when the offence is committed after 10 pm and before 7 am. The list is closed: phone, seat belt, parking, ZTL and alcohol between 0.5 and 0.8 g/l are not on it and cost the same at any hour. The increase applies to both minimum and maximum, and the 30% discount, where allowed, is worked out on the increased minimum.</p>
<h2>Phone, seat belt, parking: the dedicated pages</h2>
<p>Three offences have their own page because the detailed rules matter as much as the amount. A ${h.a('multa-cellulare-alla-guida', 'phone at the wheel')} brings a suspension from the first offence, so no discount. For the ${h.a('multa-cintura', 'seat belt')}, what matters is who answers for passengers and children. ${h.a('multa-divieto-di-sosta', 'Parking')} has six different levels, with lower amounts for motorbikes and mopeds. The points for every offence, including those not calculated here, are in the ${h.a('tabella-punti-patente', 'Italian points table')}; the other changes brought by law 177 of 2024 are on the ${h.a('nuovo-codice-della-strada-multe', 'new Highway Code page')}.</p>
<!--mini:scadenze-->`;
    },
  },
});
