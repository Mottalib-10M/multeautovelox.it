import { defineGuide, type Helpers } from '../../lib/guide-types';

const C = (h: Helpers, o: { recidiva?: boolean; neopatentato?: boolean } = {}) => h.M.altra('cellulare', o);
const V = (h: Helpers) => h.P.other_violations.find((x) => x.id === 'cellulare')!;
/** « da 15 giorni a 2 mesi » / « da 1 a 3 mesi » letti dai parametri. */
const sospIt = (h: Helpers, rep = false) => rep ? `da ${h.num(V(h).repeat!.suspension_months.from)} a ${h.num(V(h).repeat!.suspension_months.to)} mesi` : `da ${h.num(V(h).suspension_days!.from)} giorni a ${h.num(V(h).suspension_days!.to / 30)} mesi`;
const sospEn = (h: Helpers, rep = false) => rep ? `${h.num(V(h).repeat!.suspension_months.from)} to ${h.num(V(h).repeat!.suspension_months.to)} months` : `${h.num(V(h).suspension_days!.from)} days to ${h.num(V(h).suspension_days!.to / 30)} months`;

export default defineGuide({
  id: 'multa-cellulare-alla-guida',
  group: 'infrazioni',
  order: 1,
  tool: 'altre',
  outil: { defaultId: 'cellulare', solo: ['cellulare'] },
  related: ['decurtazione-punti-patente', 'punti-patente', 'multa-cintura', 'nuovo-codice-della-strada-multe', 'sanzioni-codice-della-strada'],
  sources: ['cds173', 'tabella', 'cds202', 'cds195', 'l177'],
  it: {
    slug: 'multa-cellulare-alla-guida',
    nav: 'Multa cellulare alla guida',
    card: 'Da 250 a 1 000 €, 5 punti e sospensione da 15 giorni a 2 mesi; in due anni la seconda volta costa 350–1 400 € e 10 punti.',
    title: 'Multa cellulare alla guida 2026: importo, punti, sospensione',
    description: 'Multa cellulare alla guida: da 250 a 1 000 €, 5 punti e sospensione da 15 giorni a 2 mesi, senza sconto. Seconda volta in due anni: 350–1 400 € e 10 punti.',
    h1: 'Multa per il cellulare alla guida: cosa è vietato e quanto costa',
    intro: 'Il calcolo mostra importo, punti e sospensione per il telefono in mano alla guida, alla prima violazione o alla seconda nei due anni, anche se hai la patente da meno di tre anni.',
    resume: (h) => `La multa per il cellulare alla guida è fissata dall’articolo 173, comma 3-bis, del Codice della Strada, come modificato dalla legge 177 del 2024: da ${h.eur(C(h).minimo)} a ${h.eur(C(h).massimo)}, ${h.num(C(h).punti)} punti e la sospensione della patente ${sospIt(h)} già alla prima violazione. Se la stessa persona viene sorpresa di nuovo entro due anni, l’importo sale da ${h.eur(C(h, { recidiva: true }).minimo)} a ${h.eur(C(h, { recidiva: true }).massimo)}, i punti diventano ${h.num(C(h, { recidiva: true }).punti)} e la sospensione va ${sospIt(h, true)}. Poiché la violazione comporta sempre la sospensione, lo sconto del 30 % per il pagamento entro 5 giorni non si applica: si paga il minimo di ${h.eur(C(h).minimo)} entro 60 giorni. È vietato usare durante la marcia telefoni, smartphone, tablet, computer portatili e dispositivi simili che costringono a togliere le mani dal volante, anche per un attimo, e usare le cuffie. Sono permessi il viva voce e l’auricolare, se non richiedono le mani e se il conducente sente bene da entrambe le orecchie. Un neopatentato perde ${h.num(C(h, { neopatentato: true }).punti)} punti.`,
    faqs: (h) => [
      { q: 'Si può telefonare in viva voce mentre si guida?', a: 'Sì. Il comma 2 dell’articolo 173 consente l’uso di apparecchi a viva voce o dotati di auricolare, a due condizioni: che non richiedano l’uso delle mani per funzionare e che il conducente abbia adeguate capacità uditive a entrambe le orecchie. Rispondere toccando lo schermo, comporre un numero o tenere il telefono in mano resta vietato.' },
      { q: 'Le cuffie sono vietate alla guida?', a: `Sì: lo stesso comma vieta al conducente di «usare cuffie sonore» durante la marcia, con la stessa multa del telefono, da ${h.eur(C(h).minimo)} a ${h.eur(C(h).massimo)} e ${h.num(C(h).punti)} punti. La legge distingue le cuffie dall’auricolare, che è ammesso per telefonare in modalità senza mani purché il conducente senta bene da entrambe le orecchie.` },
      { q: 'Cosa rischia chi viene sorpreso due volte con il cellulare in due anni?', a: `Alla seconda violazione nel biennio l’importo passa a una somma da ${h.eur(C(h, { recidiva: true }).minimo)} a ${h.eur(C(h, { recidiva: true }).massimo)}, la sospensione della patente va ${sospIt(h, true)} e la tabella toglie ${h.num(C(h, { recidiva: true }).punti)} punti invece di ${h.num(C(h).punti)}. Per un neopatentato i punti raddoppiano ancora: ${h.num(C(h, { recidiva: true, neopatentato: true }).punti)}, cioè quasi tutto il saldo iniziale.` },
      { q: 'La multa per il cellulare aumenta di notte?', a: 'No. La maggiorazione di un terzo tra le 22 e le 7 prevista dall’articolo 195 vale solo per un elenco chiuso di articoli, tra cui la velocità, il semaforo rosso e alcune manovre in autostrada. L’articolo 173 non è nell’elenco: telefono e cuffie costano lo stesso di giorno e di notte.' },
      { q: 'Usare lo smartphone come navigatore è vietato?', a: 'Il testo vieta i dispositivi «che comportino anche solo temporaneamente l’allontanamento delle mani dal volante». Seguire il percorso su uno schermo senza toccarlo non è descritto come vietato; impostare la destinazione, scorrere la mappa o prendere il telefono in mano durante la marcia rientra invece nel divieto. Conviene programmare il percorso prima di partire, a veicolo fermo.' },
    ],
    body: (h) => {
      const p = C(h), r = C(h, { recidiva: true }), n = C(h, { neopatentato: true }), rn = C(h, { recidiva: true, neopatentato: true });
      return `<h2>Cosa vieta l’articolo 173</h2>
<p>Il comma 2 dell’${h.src('cds173', 'articolo 173 del Codice della Strada')} vieta al conducente di far uso durante la marcia di «apparecchi radiotelefonici, smartphone, computer portatili, notebook, tablet e dispositivi analoghi che comportino anche solo temporaneamente l’allontanamento delle mani dal volante», e di «usare cuffie sonore». Il testo non elenca singole attività come telefonate, messaggi o foto: parla di «far uso» del dispositivo, e il criterio è togliere le mani dal volante, anche per un istante. Sono esclusi solo i conducenti dei veicoli delle forze armate, dei corpi indicati dall’articolo 138 e della polizia.</p>
<p>Lo stesso comma dice cosa resta permesso: «l’uso di apparecchi a viva voce o dotati di auricolare purché il conducente abbia adeguate capacità uditive ad entrambe le orecchie», apparecchi «che non richiedono per il loro funzionamento l’uso delle mani». Il viva voce dell’auto, comandi vocali e un auricolare sono quindi ammessi; tenere il telefono in mano, appoggiarlo all’orecchio o digitare sullo schermo no. Le cuffie sono vietate in quanto tali, anche senza telefonare.</p>
<h2>Quanto costa: prima violazione e recidiva</h2>
<p>Gli importi sono quelli del comma 3-bis, riscritto dalla ${h.src('l177', 'legge 177 del 25 novembre 2024')} in vigore dal 14 dicembre 2024, e restano in vigore nel 2026. La novità più pesante è la sospensione della patente già alla prima violazione.</p>
${h.table(['', 'Prima violazione', 'Nuova violazione entro due anni'], [
  ['Importo (minimo – massimo)', `${h.eur(p.minimo)} – ${h.eur(p.massimo)}`, `${h.eur(r.minimo)} – ${h.eur(r.massimo)}`],
  ['Entro 5 giorni', 'nessuno sconto', 'nessuno sconto'],
  ['Entro 60 giorni', h.eur(p.minimo), h.eur(r.minimo)],
  ['Punti', h.num(p.punti), h.num(r.punti)],
  ['Punti per un neopatentato', h.num(n.punti), h.num(rn.punti)],
  ['Sospensione della patente', sospIt(h), sospIt(h, true)],
], 'Telefono o cuffie alla guida, art. 173 c.3-bis CdS: importi in vigore nel 2026', ['l', 'r', 'r'])}
<p>Lo sconto del 30 % non c’è perché l’${h.src('cds202', 'articolo 202')} lo esclude per le violazioni che comportano la sospensione della patente. Si paga quindi il minimo, ${h.eur(p.minimo)}, entro 60 giorni dalla contestazione o dalla notifica, più le spese indicate sul verbale. Chi non paga e non fa ricorso deve la metà del massimo, ${h.eur(p.metaMassimo)}: la pagina sulla ${h.a('multa-non-pagata', 'multa non pagata')} spiega cosa succede dopo. Non c’è maggiorazione notturna: l’articolo 173 non è tra quelli elencati dall’${h.src('cds195', 'articolo 195, comma 2-bis')}.</p>
<!--mini:infrazione_0-->
<h2>Punti e sospensione: cosa succede alla patente</h2>
<p>La ${h.src('tabella', 'tabella dei punteggi')} toglie ${h.num(p.punti)} punti per la prima violazione e ${h.num(r.punti)} per la seconda nel biennio; per chi ha la patente da meno di tre anni diventano ${h.num(n.punti)} e ${h.num(rn.punti)}. Siccome la violazione comporta la sospensione, il tetto di ${h.num(h.P.points.max_simultaneous)} punti per più infrazioni contestate insieme non vale: telefono e cintura nello stesso controllo costano ${h.num(h.M.cumulati([p.punti, h.M.altra('cintura').punti], true))} punti, telefono e semaforo rosso ${h.num(h.M.cumulati([p.punti, h.M.altra('semaforo_rosso').punti], true))}. La pagina sulla ${h.a('decurtazione-punti-patente', 'decurtazione dei punti')} mostra altri casi.</p>
<p>Durante la sospensione, ${sospIt(h)}, non si può guidare. Attenzione anche alla regola delle tre violazioni: tre multe da almeno cinque punti in dodici mesi, come tre episodi con il telefono, portano alla revisione della patente anche se il saldo resta positivo. Per vedere quanti punti restano dopo la multa usa il calcolo qui sotto.</p>
<!--mini:saldo-->
<h2>Lenti prescritte e altri casi dello stesso articolo</h2>
<p>L’articolo 173 si apre con un obbligo diverso: chi in patente ha la prescrizione di lenti o di altri apparecchi deve usarli alla guida (comma 1). Quella violazione ha una sanzione propria, più bassa, fissata dal comma 3, e una riga a parte nella tabella dei punti. Non va confusa con la multa per il telefono, che riguarda solo il comma 2. Per le altre infrazioni frequenti, dalla cintura al semaforo rosso, la pagina ${h.a('sanzioni-codice-della-strada', 'sanzioni del Codice della Strada')} riunisce importi e punti; le altre novità della riforma sono nella pagina sul ${h.a('nuovo-codice-della-strada-multe', 'nuovo Codice della Strada')}.</p>
<p>Il testo dell’articolo 173 è stato letto su Normattiva il ${h.date(h.P.retrieved_at)}. Gli importi 2027 non sono ancora pubblicati: il decreto di aggiornamento è atteso entro il 1° dicembre 2026, e fino ad allora valgono le cifre qui sopra.</p>`;
    },
  },
  en: {
    slug: 'italy-phone-driving-fine',
    nav: 'Phone fine while driving',
    card: '€250 to €1,000, 5 points and a 15-day to 2-month suspension; a second time within two years costs €350 to €1,400 and 10 points.',
    title: 'Phone fine in Italy 2026: amount, points and suspension',
    description: 'Phone fine in Italy while driving: €250 to €1,000, 5 points, a 15-day to 2-month suspension, no discount. Second time in two years: €350 to €1,400, 10 points.',
    h1: 'Using a phone while driving in Italy: what is banned and the fine',
    intro: 'The calculator shows the amount, points and suspension for a phone in hand at the wheel, for a first offence or a second within two years, including for drivers licensed under three years.',
    resume: (h) => `The fine for using a phone while driving in Italy is set by article 173, paragraph 3-bis, of the Highway Code, as amended by law 177 of 2024: ${h.eur(C(h).minimo)} to ${h.eur(C(h).massimo)}, ${h.num(C(h).punti)} points and a licence suspension of ${sospEn(h)} from the very first offence. If the same person is caught again within two years, the amount rises to ${h.eur(C(h, { recidiva: true }).minimo)} to ${h.eur(C(h, { recidiva: true }).massimo)}, the points become ${h.num(C(h, { recidiva: true }).punti)} and the suspension runs ${sospEn(h, true)}. Because the offence always carries a suspension, the 30% discount for paying within 5 days does not apply: you pay the ${h.eur(C(h).minimo)} minimum within 60 days. While the vehicle is moving the law bans phones, smartphones, tablets, laptops and similar devices that take your hands off the wheel, even briefly, and it bans headphones. Hands-free kits and a single earpiece are allowed, provided they need no hands and the driver hears properly in both ears. A new driver loses ${h.num(C(h, { neopatentato: true }).punti)} points.`,
    faqs: (h) => [
      { q: 'Can I take calls hands-free while driving in Italy?', a: 'Yes. Paragraph 2 of article 173 allows hands-free devices or an earpiece, on two conditions: they must not need your hands to work, and the driver must have adequate hearing in both ears. Answering by tapping the screen, dialling or holding the phone is still banned, and is fined as a phone offence.' },
      { q: 'Are headphones allowed while driving in Italy?', a: `No. The same paragraph bans the driver from using headphones («cuffie sonore») while moving, with the same fine as a phone: ${h.eur(C(h).minimo)} to ${h.eur(C(h).massimo)} and ${h.num(C(h).punti)} points. The law treats headphones differently from an earpiece, which is allowed for hands-free calls if the driver hears properly in both ears.` },
      { q: 'What happens if I am caught on the phone twice within two years in Italy?', a: `A second offence within two years costs ${h.eur(C(h, { recidiva: true }).minimo)} to ${h.eur(C(h, { recidiva: true }).massimo)}, with a licence suspension of ${sospEn(h, true)}, and the table takes ${h.num(C(h, { recidiva: true }).punti)} points instead of ${h.num(C(h).punti)}. For a new driver the points double again, to ${h.num(C(h, { recidiva: true, neopatentato: true }).punti)}: almost the whole starting balance.` },
      { q: 'Is there a night surcharge on Italian phone fines?', a: 'No. The one-third increase between 10 pm and 7 am under article 195 only covers a closed list of articles, including speeding, red lights and some motorway manoeuvres. Article 173 is not on the list, so phone and headphone fines cost the same by day and by night.' },
      { q: 'I was stopped on the phone in a hire car with a foreign licence: what now?', a: `The penalty is the same whatever licence you hold: ${h.eur(C(h).minimo)} to ${h.eur(C(h).massimo)}, with no discount, and a suspension of ${sospEn(h)} during which you may not drive in Italy, so plan how the car will be returned. The fine also states the points; article 126-bis keeps a points balance for Italian licences only.` },
    ],
    body: (h) => {
      const p = C(h), r = C(h, { recidiva: true }), n = C(h, { neopatentato: true }), rn = C(h, { recidiva: true, neopatentato: true });
      return `<h2>What article 173 bans</h2>
<p>Paragraph 2 of ${h.src('cds173', 'article 173 of the Italian Highway Code')} bars the driver from using, while the vehicle is moving, «apparecchi radiotelefonici, smartphone, computer portatili, notebook, tablet e dispositivi analoghi» (phones, smartphones, laptops, notebooks, tablets and similar devices) that take the hands off the wheel «anche solo temporaneamente», even briefly, and from using headphones («cuffie sonore»). The text does not list activities such as calls, messages or photos: it speaks of using («far uso») the device, and the test is taking your hands off the wheel, even for a moment. Only drivers of armed forces, police and the bodies named in article 138 are exempt.</p>
<p>The same paragraph says what remains allowed: hands-free devices or an earpiece («a viva voce o dotati di auricolare»), provided the driver has adequate hearing in both ears and the device needs no hands to work. The car’s hands-free system, voice commands and a single earpiece are therefore fine; holding the phone, putting it to your ear or typing on the screen is not. Headphones are banned as such, even without a call.</p>
<h2>What it costs: first and repeat offence</h2>
<p>The amounts are those of paragraph 3-bis, rewritten by ${h.src('l177', 'law 177 of 25 November 2024')}, in force since 14 December 2024 and still current in 2026. The biggest change is the licence suspension from the first offence.</p>
${h.table(['', 'First offence', 'New offence within two years'], [
  ['Amount (minimum – maximum)', `${h.eur(p.minimo)} – ${h.eur(p.massimo)}`, `${h.eur(r.minimo)} – ${h.eur(r.massimo)}`],
  ['Within 5 days', 'no discount', 'no discount'],
  ['Within 60 days', h.eur(p.minimo), h.eur(r.minimo)],
  ['Points', h.num(p.punti), h.num(r.punti)],
  ['Points for a new driver', h.num(n.punti), h.num(rn.punti)],
  ['Licence suspension', sospEn(h), sospEn(h, true)],
], 'Phone or headphones at the wheel, article 173 para. 3-bis: amounts in force in 2026', ['l', 'r', 'r'])}
<p>There is no 30% discount because ${h.src('cds202', 'article 202')} excludes it for offences carrying a licence suspension. You pay the minimum, ${h.eur(p.minimo)}, within 60 days of the offence being contested or the fine being served, plus the costs shown on the verbale. If you neither pay nor appeal, half the maximum becomes due, ${h.eur(p.metaMassimo)}; the ${h.a('multa-non-pagata', 'unpaid fine page')} explains what follows. There is no night surcharge either: article 173 is not among those listed in ${h.src('cds195', 'article 195, paragraph 2-bis')}.</p>
<!--mini:infrazione_0-->
<h2>Points and suspension: what happens to the licence</h2>
<p>The ${h.src('tabella', 'points table')} takes ${h.num(p.punti)} points for a first offence and ${h.num(r.punti)} for a second within two years; for drivers licensed under three years these become ${h.num(n.punti)} and ${h.num(rn.punti)}. Since the offence carries a suspension, the ${h.num(h.P.points.max_simultaneous)}-point cap for offences found together does not apply: a phone and a seat belt in the same stop cost ${h.num(h.M.cumulati([p.punti, h.M.altra('cintura').punti], true))} points, a phone and a red light ${h.num(h.M.cumulati([p.punti, h.M.altra('semaforo_rosso').punti], true))}. The ${h.a('decurtazione-punti-patente', 'points deduction page')} shows more cases.</p>
<p>While the suspension runs (${sospEn(h)}), you may not drive. Watch the three-offence rule too: three fines of at least five points within twelve months, such as three phone episodes, lead to a re-examination of an Italian licence even with points left. To see your balance after the fine, use the calculation below.</p>
<!--mini:saldo-->
<h2>Prescribed glasses and other cases in the same article</h2>
<p>Article 173 opens with a different duty: drivers whose licence requires glasses or other aids must use them at the wheel (paragraph 1). That offence has its own, lower penalty under paragraph 3 and its own row in the points table. It should not be confused with the phone fine, which only concerns paragraph 2. For other common offences, from seat belts to red lights, the ${h.a('sanzioni-codice-della-strada', 'Italian traffic fines list')} brings amounts and points together; the other changes of the reform are on the ${h.a('nuovo-codice-della-strada-multe', 'new Highway Code page')}.</p>
<p>The text of article 173 was read on Normattiva on ${h.date(h.P.retrieved_at)}. The 2027 amounts are not published yet: the update decree is due by 1 December 2026, and until then the figures above apply.</p>`;
    },
  },
});
