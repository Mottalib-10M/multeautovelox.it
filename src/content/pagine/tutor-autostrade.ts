import { defineGuide, type Helpers } from '../../lib/guide-types';

/** Tempo massimo (secondi interi) su `km` sotto il quale la media, ridotta del 5 %, supera `limite + oltre`. */
const tempoSoglia = (h: Helpers, km: number, limite: number, oltre: number) => Math.floor((km * 3600 * (1 - h.P.tolerance.percent)) / (limite + oltre));
const mmss = (s: number, lang: 'it' | 'en') => {
  const m = Math.floor(s / 60), r = s % 60;
  return lang === 'it' ? `${m} minuti e ${r} secondi` : `${m} min ${r} s`;
};
const media = (h: Helpers) => h.M.velocitaMedia(10, 260);
const LIM = (h: Helpers) => [
  { it: 'Autostrada, limite generale', en: 'Motorway, general limit', v: h.P.limits.autostrada },
  { it: 'Autostrada con pioggia o neve', en: 'Motorway in rain or snow', v: h.P.limits.pioggia.autostrada },
  { it: 'Autostrada, primi tre anni di patente', en: 'Motorway, first three years of licence', v: h.P.limits.neopatentati.autostrada },
];

export default defineGuide({
  id: 'tutor-autostrade',
  group: 'velocita',
  order: 3,
  tool: 'velocita',
  outil: { mode: 'tutor', defaultKm: 10, defaultMinuti: 4, defaultSecondi: 20 },
  related: ['tolleranza-autovelox', 'multa-eccesso-di-velocita', 'elenco-autovelox', 'autovelox-omologati', 'ricorso-multa-autovelox'],
  sources: ['cds142', 'reg345', 'cds117', 'mitVelox'],
  it: {
    slug: 'tutor-autostrade',
    nav: 'Tutor in autostrada',
    card: 'Distanza diviso tempo, poi il 5 % in meno e la fascia dell’art. 142: la multa del tutor tratto per tratto.',
    title: 'Tutor autostrade 2026: velocità media, multa e tolleranza',
    description: 'Tutor in autostrada: velocità media tra due portali, riduzione del 5 %, fascia dell’art. 142 sul limite di 130, 110 con pioggia o 100 da neopatentato. Calcolo.',
    h1: 'Tutor in autostrada: dalla velocità media alla multa',
    intro: 'Inserisci la lunghezza del tratto e il tempo impiegato tra i due portali: il calcolo ricava la velocità media, toglie la riduzione e mostra multa, punti ed eventuale sospensione.',
    resume: (h) => {
      const m = media(h), s = h.M.velocita({ limite: 130, rilevata: m });
      return `Il tutor misura la velocità media su un tratto di autostrada: registra il passaggio del veicolo sotto due portali, divide la distanza per il tempo impiegato e ottiene una media in km/h. A quella media si applica la stessa riduzione degli autovelox, il ${h.pct(h.P.tolerance.percent, 0)} con un minimo di ${h.num(h.P.tolerance.min_kmh)} km/h, e l’eccesso sul limite decide la fascia dell’articolo 142. Esempio: ${h.num(10)} km percorsi in 4 minuti e 20 secondi danno ${h.num(m, 2)} km/h di media, ${h.num(s.accertata, 2)} km/h dopo la riduzione e ${h.num(s.eccesso, 2)} km/h oltre il limite di 130, cioè la multa minima di ${h.eur(s.minimo)} senza punti. Su quei ${h.num(10)} km la multa scatta se si impiegano ${mmss(tempoSoglia(h, 10, 130, 0), 'it')} o meno, i punti sotto ${mmss(tempoSoglia(h, 10, 130, 10), 'it')}. Il limite di riferimento è quello del tratto: ${h.num(h.P.limits.autostrada)} km/h in generale, ${h.num(h.P.limits.pioggia.autostrada)} con precipitazioni, ${h.num(h.P.limits.neopatentati.autostrada)} per chi ha la patente da meno di tre anni. Più eccessi accertati dallo stesso ente entro un’ora si sanzionano come uno solo, aumentato di un terzo, se conviene.`;
    },
    faqs: (h) => [
      { q: 'Come si calcola la velocità media del tutor?', a: `Si divide la distanza tra i due portali per il tempo trascorso tra i due passaggi e si moltiplica per 3600 se il tempo è in secondi. ${h.num(10)} km in ${h.num(260)} secondi fanno ${h.num(media(h), 2)} km/h. Poi si toglie il ${h.pct(h.P.tolerance.percent, 0)} (almeno ${h.num(h.P.tolerance.min_kmh)} km/h) e si confronta il risultato con il limite. Il calcolatore accetta minuti e secondi e fa tutti i passaggi.` },
      { q: 'Con la pioggia il limite del tutor scende a 110?', a: `Il limite scende per legge: l’articolo 142, comma 1, del Codice della Strada, dice che in caso di precipitazioni « di qualsiasi natura » la velocità massima in autostrada non può superare ${h.num(h.P.limits.pioggia.autostrada)} km/h. La multa si calcola sul limite in vigore in quel momento. Con ${h.num(125)} km/h di media sotto la pioggia restano ${h.num(h.M.velocita({ limite: 110, rilevata: 125 }).accertata, 2)} km/h accertati: eccesso fino a 10 km/h e ${h.eur(h.P.speeding.bands[0].min)}, che con il sole non sarebbe stato sanzionato.` },
      { q: 'Due tratti con il tutor nella stessa ora: arrivano due multe?', a: `Se gli eccessi sono accertati dallo stesso ente sulle strade di sua competenza entro un’ora dalla prima violazione, il comma 6-ter dell’articolo 142 prevede la sanzione della violazione più grave aumentata di un terzo, quando è più favorevole della somma. Due eccessi tra 10 e 40 km/h costerebbero ${h.eur(h.M.plurime([h.P.speeding.bands[1].min, h.P.speeding.bands[1].min]).somma)} separati e ${h.eur(h.M.plurime([h.P.speeding.bands[1].min, h.P.speeding.bands[1].min]).applicato, 2)} con questa regola.` },
      { q: 'Il tutor toglie i punti come un autovelox fisso?', a: `Sì: la sanzione è la stessa dell’articolo 142, perché la legge considera prova anche le apparecchiature omologate « per il calcolo della velocità media di percorrenza su tratti determinati ». Oltre 10 km/h di eccesso medio si perdono ${h.num(h.P.speeding.bands[1].points)} punti, oltre 40 km/h ${h.num(h.P.speeding.bands[2].points)} con la sospensione. Le conseguenze sul saldo sono spiegate nella pagina sulla decurtazione dei punti.` },
    ],
    body: (h) => {
      const m = media(h), s = h.M.velocita({ limite: 130, rilevata: m });
      const pg = h.M.velocita({ limite: h.P.limits.pioggia.autostrada, rilevata: 125 });
      const ng = h.M.velocita({ limite: h.P.limits.neopatentati.autostrada, rilevata: 125, neopatentato: true });
      const c8 = h.P.speeding.bands[1].min, c7 = h.P.speeding.bands[0].min;
      const due = h.M.plurime([c8, c8]), mix = h.M.plurime([c7, c8]);
      return `<h2>Come il tutor arriva alla multa</h2>
<p>Un autovelox fotografa la velocità in un punto; il tutor la ricostruisce su un tratto. ${h.src('cds142', 'L’articolo 142, comma 6')} considera fonti di prova le risultanze di apparecchiature « debitamente omologate, anche per il calcolo della velocità media di percorrenza su tratti determinati ». Il calcolo procede in tre passi: velocità media uguale distanza diviso tempo; velocità accertata uguale media meno la riduzione dell’${h.src('reg345', 'articolo 345 del Regolamento')}, che vale « qualunque sia l’apparecchiatura utilizzata »; eccesso uguale velocità accertata meno limite del tratto.</p>
<p>Con i valori di partenza del calcolatore, ${h.num(10)} km in 4 minuti e 20 secondi: media ${h.num(m, 2)} km/h, riduzione ${h.num(s.riduzioneKmh, 2)} km/h, velocità accertata ${h.num(s.accertata, 2)} km/h, eccesso ${h.num(s.eccesso, 2)} km/h sul limite di 130. Fascia fino a 10 km/h: ${h.eur(s.minimo)}, ${h.eur(s.ridotto ?? 0, 2)} pagando entro 5 giorni, nessun punto. Bastano pochi secondi in meno per cambiare fascia: su ${h.num(10)} km la multa scatta a ${mmss(tempoSoglia(h, 10, 130, 0), 'it')} o meno, i punti a ${mmss(tempoSoglia(h, 10, 130, 10), 'it')} o meno, la sospensione a ${mmss(tempoSoglia(h, 10, 130, 40), 'it')} o meno.</p>
<!--mini:tutor-->
<h2>Il limite giusto: sole, pioggia, neopatentati</h2>
<p>La media va confrontata con il limite in vigore sul tratto in quel momento. In autostrada il limite generale è ${h.num(h.P.limits.autostrada)} km/h; con precipitazioni di qualsiasi natura scende a ${h.num(h.P.limits.pioggia.autostrada)} km/h (articolo 142, comma 1); per chi ha la patente B da meno di tre anni è ${h.num(h.P.limits.neopatentati.autostrada)} km/h (${h.src('cds117', 'articolo 117')}). Lo stesso comma 1 consente agli enti di alzare il limite fino a ${h.num(h.P.limits.autostrada_max_elevabile)} km/h sulle autostrade a tre corsie più emergenza dotate di apparecchiature omologate per la velocità media, con i segnali appositi. La tabella indica la velocità media da cui parte ciascuna conseguenza.</p>
${h.table(['Situazione', 'Limite', 'Multa da', 'Punti da', 'Sospensione da'], LIM(h).map((x) => [
  x.it, `${h.num(x.v)} km/h`, `${h.num(h.M.primaRilevataOltre(x.v, 0))} km/h`, `${h.num(h.M.primaRilevataOltre(x.v, 10))} km/h`, `${h.num(h.M.primaRilevataOltre(x.v, 40))} km/h`,
]), 'Velocità media (km/h interi) da cui scatta ciascuna fascia in autostrada: regole in vigore nel 2026', ['l', 'r', 'r', 'r', 'r'])}
<p>La stessa media di ${h.num(125)} km/h non costa nulla con il sole, costa ${h.eur(pg.minimo)} sotto la pioggia (${h.num(pg.eccesso, 2)} km/h oltre i ${h.num(h.P.limits.pioggia.autostrada)}) e ${h.eur(ng.minimo)} con ${h.num(ng.punti)} punti a un neopatentato (${h.num(ng.eccesso, 2)} km/h oltre i ${h.num(h.P.limits.neopatentati.autostrada)}, punti raddoppiati nei primi tre anni).</p>
<!--mini:limiti-->
<h2>Più tratti in un’ora</h2>
<p>Chi percorre di seguito più tratti controllati può collezionare più eccessi in pochi minuti. Il ${h.src('cds142', 'comma 6-ter dell’articolo 142')}, introdotto dalla legge 177 del 2024, stabilisce che più violazioni dei commi 7, 8, 9 o 9-bis commesse dallo stesso veicolo, su tratti di competenza del medesimo ente e in non più di un’ora, si puniscono con la sanzione della violazione più grave aumentata di un terzo, se più favorevole. L’ora decorre dalla prima violazione accertata. Due eccessi tra 10 e 40 km/h: ${h.eur(due.somma)} sommati, ${h.eur(due.applicato, 2)} con la regola. Un eccesso fino a 10 km/h e uno tra 10 e 40: la somma, ${h.eur(mix.somma)}, è già più bassa di ${h.eur(mix.cumulo, 2)}, quindi resta la somma.</p>
<!--mini:plurime-->
<h2>Cosa dice il registro del MIT</h2>
<p>Il ${h.src('mitVelox', 'registro nazionale del Ministero delle infrastrutture e dei trasporti')} elenca gli apparecchi dichiarati da ciascun organo di polizia. Nella copia letta da questo sito, datata ${h.date(h.reg)}, ${h.num(h.S.italia.categorie.velocita_media)} dispositivi su ${h.num(h.S.italia.totale)} sono classificati come sistemi a velocità media, e la Polizia Stradale, che controlla la rete autostradale, ne ha dichiarati ${h.num(h.S.italia.polizia_stradale)} in tutto, di ogni tipo. Per cercare un modello o un decreto di omologazione servono l’${h.a('elenco-autovelox', 'elenco degli autovelox')} e la pagina sugli ${h.a('autovelox-omologati', 'autovelox omologati')}. Gli importi qui riportati sono quelli in vigore nel 2026; i testi di legge sono stati letti su Normattiva il ${h.date(h.P.retrieved_at)}.</p>`;
    },
  },
  en: {
    slug: 'italy-tutor-average-speed-cameras',
    nav: 'Tutor average-speed cameras',
    card: 'Distance over time, 5% off, then the article 142 band: the Tutor fine section by section.',
    title: 'Tutor average speed cameras in Italy: fines and tolerance',
    description: 'Tutor average-speed cameras on Italian motorways: distance over time, 5% off, then the article 142 band on 130, 110 in rain or 100 for new drivers. Calculator.',
    h1: 'Tutor average-speed cameras: from average speed to fine',
    intro: 'Enter the length of the section and the time taken between the two gantries: the calculator works out the average speed, takes off the reduction and shows the fine, points and any suspension.',
    resume: (h) => {
      const m = media(h), s = h.M.velocita({ limite: 130, rilevata: m });
      return `The Tutor measures average speed over a stretch of Italian motorway (autostrada): it records the vehicle passing under two gantries, divides the distance by the time taken and gets an average in km/h. That average gets the same reduction as a speed camera, ${h.pct(h.P.tolerance.percent, 0)} with a minimum of ${h.num(h.P.tolerance.min_kmh)} km/h, and the excess over the limit sets the article 142 band. For example, ${h.num(10)} km covered in 4 minutes 20 seconds gives an average of ${h.num(m, 2)} km/h, ${h.num(s.accertata, 2)} km/h after the reduction and ${h.num(s.eccesso, 2)} km/h over the 130 limit: the minimum fine of ${h.eur(s.minimo)} and no points. Over those ${h.num(10)} km a fine starts if you take ${mmss(tempoSoglia(h, 10, 130, 0), 'en')} or less, points if you take ${mmss(tempoSoglia(h, 10, 130, 10), 'en')} or less. The limit used is the one in force on the section: ${h.num(h.P.limits.autostrada)} km/h normally, ${h.num(h.P.limits.pioggia.autostrada)} in rain or snow, ${h.num(h.P.limits.neopatentati.autostrada)} for drivers licensed less than three years. Several offences recorded by the same body within one hour are fined as one, plus a third, when that is cheaper.`;
    },
    faqs: (h) => [
      { q: 'How is the average speed worked out between two gantries?', a: `Divide the distance between the two gantries by the time between the two passes, and multiply by 3,600 if the time is in seconds. ${h.num(10)} km in ${h.num(260)} seconds gives ${h.num(media(h), 2)} km/h. Then ${h.pct(h.P.tolerance.percent, 0)} comes off (at least ${h.num(h.P.tolerance.min_kmh)} km/h) and the result is compared with the limit. The calculator takes minutes and seconds and does every step for you.` },
      { q: 'Does the lower rain limit apply to average-speed checks on motorways?', a: `The limit falls by law: article 142, paragraph 1, of the Highway Code says that in precipitation “of any kind” the maximum on motorways is ${h.num(h.P.limits.pioggia.autostrada)} km/h. The fine is worked out on the limit in force at the time. A ${h.num(125)} km/h average in the rain leaves ${h.num(h.M.velocita({ limite: 110, rilevata: 125 }).accertata, 2)} km/h held: up to 10 km/h over and ${h.eur(h.P.speeding.bands[0].min)}, where the same drive in sunshine would not have been fined.` },
      { q: 'I drove through two average-speed sections in one hour: will I get two fines?', a: `If both offences were recorded by the same body on roads it manages, within one hour of the first, paragraph 6-ter of article 142 applies the penalty for the most serious one plus a third, when that is lower than the total. Two offences of 10 to 40 km/h over would cost ${h.eur(h.M.plurime([h.P.speeding.bands[1].min, h.P.speeding.bands[1].min]).somma)} separately and ${h.eur(h.M.plurime([h.P.speeding.bands[1].min, h.P.speeding.bands[1].min]).applicato, 2)} under this rule.` },
      { q: 'I was in a hire car on the autostrada: who receives the Tutor fine?', a: `The verbale (fine notice) is first addressed to the registered owner, which for a hire car is the rental company, and is then served on the person identified as responsible. For people living abroad the police have ${h.num(h.P.notification.days_abroad)} days from when the offence is established to serve it. The amount is the same as for an Italian driver, and the 5-day discount runs from the day the notice reaches you.` },
    ],
    body: (h) => {
      const m = media(h), s = h.M.velocita({ limite: 130, rilevata: m });
      const pg = h.M.velocita({ limite: h.P.limits.pioggia.autostrada, rilevata: 125 });
      const ng = h.M.velocita({ limite: h.P.limits.neopatentati.autostrada, rilevata: 125, neopatentato: true });
      const c8 = h.P.speeding.bands[1].min, c7 = h.P.speeding.bands[0].min;
      const due = h.M.plurime([c8, c8]), mix = h.M.plurime([c7, c8]);
      return `<h2>How the Tutor gets to a fine</h2>
<p>A speed camera catches speed at one point; the Tutor rebuilds it over a section. ${h.src('cds142', 'Article 142, paragraph 6')} accepts as evidence the output of devices “duly homologated, also for calculating the average travel speed over given sections”. The calculation has three steps: average speed equals distance divided by time; speed held equals the average minus the reduction of ${h.src('reg345', 'article 345 of the regulation')}, which applies “whatever the device used”; the excess equals the speed held minus the limit on that section.</p>
<p>With the calculator’s starting values, ${h.num(10)} km in 4 minutes 20 seconds: average ${h.num(m, 2)} km/h, reduction ${h.num(s.riduzioneKmh, 2)} km/h, speed held ${h.num(s.accertata, 2)} km/h, excess ${h.num(s.eccesso, 2)} km/h over the 130 limit. That is the up-to-10 km/h band: ${h.eur(s.minimo)}, ${h.eur(s.ridotto ?? 0, 2)} if paid within 5 days, no points. A few seconds change the band: over ${h.num(10)} km a fine starts at ${mmss(tempoSoglia(h, 10, 130, 0), 'en')} or less, points at ${mmss(tempoSoglia(h, 10, 130, 10), 'en')} or less and a suspension at ${mmss(tempoSoglia(h, 10, 130, 40), 'en')} or less.</p>
<!--mini:tutor-->
<h2>The right limit: sunshine, rain, new drivers</h2>
<p>The average is compared with the limit in force on the section at that moment. The general motorway limit is ${h.num(h.P.limits.autostrada)} km/h; in precipitation of any kind it drops to ${h.num(h.P.limits.pioggia.autostrada)} km/h (article 142, paragraph 1); for holders of a category B licence in its first three years it is ${h.num(h.P.limits.neopatentati.autostrada)} km/h (${h.src('cds117', 'article 117')}). The same paragraph 1 lets operators raise the limit to ${h.num(h.P.limits.autostrada_max_elevabile)} km/h on three-lane motorways with a hard shoulder that are fitted with homologated average-speed devices, with the proper signs. The table gives the average speed at which each consequence begins.</p>
${h.table(['Situation', 'Limit', 'Fine from', 'Points from', 'Suspension from'], LIM(h).map((x) => [
  x.en, `${h.num(x.v)} km/h`, `${h.num(h.M.primaRilevataOltre(x.v, 0))} km/h`, `${h.num(h.M.primaRilevataOltre(x.v, 10))} km/h`, `${h.num(h.M.primaRilevataOltre(x.v, 40))} km/h`,
]), 'Average speed (whole km/h) at which each band starts on motorways: rules in force in 2026', ['l', 'r', 'r', 'r', 'r'])}
<p>The same ${h.num(125)} km/h average costs nothing in sunshine, ${h.eur(pg.minimo)} in the rain (${h.num(pg.eccesso, 2)} km/h over ${h.num(h.P.limits.pioggia.autostrada)}) and ${h.eur(ng.minimo)} plus ${h.num(ng.punti)} points for a new driver (${h.num(ng.eccesso, 2)} km/h over ${h.num(h.P.limits.neopatentati.autostrada)}, with points doubled in the first three years).</p>
<!--mini:limiti-->
<h2>Several sections within an hour</h2>
<p>Driving through several monitored sections in a row can produce several offences in a few minutes. ${h.src('cds142', 'Paragraph 6-ter of article 142')}, added by law 177 of 2024, provides that several offences under paragraphs 7, 8, 9 or 9-bis by the same vehicle, on sections managed by the same body and within no more than an hour, are punished with the penalty for the most serious one increased by a third, if that is more favourable. The hour runs from the first offence recorded. Two offences of 10 to 40 km/h over: ${h.eur(due.somma)} added up, ${h.eur(due.applicato, 2)} under the rule. One offence of up to 10 km/h and one of 10 to 40: the total, ${h.eur(mix.somma)}, is already below ${h.eur(mix.cumulo, 2)}, so the total stands.</p>
<!--mini:plurime-->
<h2>What the transport ministry register shows</h2>
<p>The ${h.src('mitVelox', 'national register of the Ministry of Infrastructure and Transport (MIT)')} lists the devices each police body has declared. In the copy this site reads, dated ${h.date(h.reg)}, ${h.num(h.S.italia.categorie.velocita_media)} devices out of ${h.num(h.S.italia.totale)} are classed as average-speed systems, and the Polizia Stradale, the traffic police force that patrols the motorways, has declared ${h.num(h.S.italia.polizia_stradale)} devices in all, of every type. To look up a model or its homologation decree, use the ${h.a('elenco-autovelox', 'speed camera list')} and the page on ${h.a('autovelox-omologati', 'homologated speed cameras')}. The amounts shown are those in force in 2026; the legal texts were read on Normattiva on ${h.date(h.P.retrieved_at)}.</p>`;
    },
  },
});
