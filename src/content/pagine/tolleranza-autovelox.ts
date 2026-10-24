import { defineGuide, type Helpers } from '../../lib/guide-types';

const LIMITI = [30, 50, 70, 90, 110, 130, 150];
const soglia = (h: Helpers, limite: number, oltre: number) => h.M.primaRilevataOltre(limite, oltre);
const tp = (h: Helpers) => h.P.tolerance_pedaggio.bands;

export default defineGuide({
  id: 'tolleranza-autovelox',
  group: 'velocita',
  order: 2,
  tool: 'velocita',
  outil: { defaultLimite: 130, defaultRilevata: 142, seuils: true },
  related: ['multa-eccesso-di-velocita', 'tutor-autostrade', 'autovelox-omologati', 'ricorso-multa-autovelox', 'decurtazione-punti-patente'],
  sources: ['reg345', 'cds142', 'cds117'],
  it: {
    slug: 'tolleranza-autovelox',
    nav: 'Tolleranza autovelox',
    card: 'Il 5 % con un minimo di 5 km/h: la velocità letta da cui scatta la multa per ogni limite.',
    title: 'Tolleranza autovelox 2026: 5 %, minimo 5 km/h e soglie',
    description: 'Tolleranza autovelox: il 5 % della velocità letta, almeno 5 km/h, tolto prima del confronto con il limite. Soglie di multa, punti e sospensione per ogni limite.',
    h1: 'Tolleranza autovelox: quanto si toglie e da dove parte la multa',
    intro: 'Scrivi la velocità letta dall’apparecchio e il limite: il calcolo toglie la riduzione dell’articolo 345, mostra la velocità accertata e le soglie da cui partono multa, punti e sospensione.',
    resume: (h) => `La tolleranza dell’autovelox è la riduzione che l’articolo 345, comma 2, del Regolamento del Codice della Strada impone su ogni misura di velocità, qualunque sia l’apparecchio: si toglie il ${h.pct(h.P.tolerance.percent, 0)} della velocità letta, con un minimo di ${h.num(h.P.tolerance.min_kmh)} km/h. Fino a 100 km/h letti la riduzione è quindi sempre di ${h.num(h.P.tolerance.min_kmh)} km/h, oltre i 100 km/h è il ${h.pct(h.P.tolerance.percent, 0)} esatto, decimali compresi. Il risultato è la velocità accertata, l’unica che conta per la multa dell’articolo 142. Con un limite di 50 la prima velocità letta che dà una multa è ${h.num(soglia(h, 50, 0))} km/h e i punti partono da ${h.num(soglia(h, 50, 10))} km/h; con un limite di 130 la multa parte da ${h.num(soglia(h, 130, 0))} km/h letti e i punti da ${h.num(soglia(h, 130, 10))} km/h. Nella riduzione è già compresa la tolleranza strumentale, e gli apparecchi con un errore superiore al ${h.pct(h.P.tolerance.percent, 0)} non possono essere usati. Per la velocità dedotta dai biglietti autostradali il comma 3 prevede invece riduzioni del 5, 10 o 15 %.`,
    faqs: (h) => [
      { q: 'Da quale velocità letta scatta la multa con il limite di 50?', a: `Con un limite di 50 km/h la riduzione è sempre di ${h.num(h.P.tolerance.min_kmh)} km/h, perché il ${h.pct(h.P.tolerance.percent, 0)} di una velocità urbana è inferiore a questo minimo. La multa scatta quindi da ${h.num(soglia(h, 50, 0))} km/h letti, i ${h.num(h.P.speeding.bands[1].points)} punti da ${h.num(soglia(h, 50, 10))} km/h e la sospensione da ${h.num(soglia(h, 50, 40))} km/h. Con un limite di 30 le stesse soglie sono ${h.num(soglia(h, 30, 0))}, ${h.num(soglia(h, 30, 10))} e ${h.num(soglia(h, 30, 40))} km/h.` },
      { q: 'La riduzione cambia tra autovelox fisso, mobile e telelaser?', a: 'No. L’articolo 345 del Regolamento dice che la riduzione si applica « qualunque sia l’apparecchiatura utilizzata »: postazione fissa, autovelox mobile su treppiede, telelaser in mano all’agente o sistema a velocità media. Cambia solo il caso della velocità ricavata dagli orari stampati sui biglietti autostradali, per cui il comma 3 prevede percentuali diverse a seconda della velocità media.' },
      { q: 'Perché a volte la riduzione è di 5 km/h e non del 5 %?', a: `Perché la regola fissa un minimo: si toglie il ${h.pct(h.P.tolerance.percent, 0)} della velocità letta, ma mai meno di ${h.num(h.P.tolerance.min_kmh)} km/h. Il ${h.pct(h.P.tolerance.percent, 0)} supera i ${h.num(h.P.tolerance.min_kmh)} km/h solo oltre i 100 km/h letti. Sotto quella soglia, cioè in città e su quasi tutte le strade extraurbane, la riduzione è fissa: ${h.num(77)} km/h letti diventano ${h.num(h.M.velocita({ limite: 70, rilevata: 77 }).accertata)} km/h accertati.` },
      { q: 'Cosa fare se i conti della riduzione sul verbale non tornano?', a: `Rifai il calcolo con lo strumento qui sopra: velocità letta meno ${h.pct(h.P.tolerance.percent, 0)} (almeno ${h.num(h.P.tolerance.min_kmh)} km/h) deve dare la velocità accertata, e la differenza con il limite deve cadere nella fascia contestata. Controlla anche che il limite scritto sia quello del cartello in quel punto. Se i numeri non tornano, è un motivo da far valere con un ricorso al prefetto o al giudice di pace, entro i termini che decorrono dalla notifica.` },
    ],
    body: (h) => {
      const a = h.M.velocita({ limite: 130, rilevata: 142 });
      const b = h.M.velocita({ limite: 110, rilevata: 157 });
      const c = h.M.velocita({ limite: 110, rilevata: 158 });
      const p = h.M.velocita({ limite: 130, rilevata: 150, metodo: 'pedaggio' });
      return `<h2>Cosa dice l’articolo 345 del Regolamento</h2>
<p>La regola non è nel Codice della Strada ma nel suo Regolamento di esecuzione. ${h.src('reg345', 'L’articolo 345, comma 2')} stabilisce che, in sede di approvazione degli apparecchi, « al valore rilevato sia applicata una riduzione pari al 5%, con un minimo di 5 km/h », e precisa che in questa riduzione « è compresa anche la tolleranza strumentale ». Due conseguenze pratiche: la riduzione non si somma a un altro margine di errore dell’apparecchio, e un apparecchio con tolleranza strumentale superiore al ${h.pct(h.P.tolerance.percent, 0)} non può essere usato per accertare la velocità. Il comma 4 aggiunge che gli apparecchi devono essere gestiti direttamente dagli organi di polizia stradale e restare nella loro disponibilità.</p>
<p>Il calcolo è sempre lo stesso: velocità letta meno riduzione uguale velocità accertata; velocità accertata meno limite uguale eccesso, che decide la fascia di ${h.a('multa-eccesso-di-velocita', 'multa per eccesso di velocità')}. Con i valori di partenza del calcolatore, ${h.num(142)} km/h letti su un’autostrada a 130 perdono ${h.num(a.riduzioneKmh, 1)} km/h, restano ${h.num(a.accertata, 1)} km/h accertati e ${h.num(a.eccesso, 1)} km/h oltre il limite: ${h.eur(a.minimo)}, nessun punto.</p>
<!--mini:tolleranza-->
<h2>Le soglie per ogni limite</h2>
<p>La tabella indica, per ogni limite di velocità, la prima velocità letta (in km/h interi) che fa entrare in ciascuna fascia dell’articolo 142, dopo la riduzione del ${h.pct(h.P.tolerance.percent, 0)} con minimo di ${h.num(h.P.tolerance.min_kmh)} km/h. Il limite di 30 riguarda le zone urbane segnalate, 70 le strade urbane dove il comune lo ha elevato, 150 i tratti autostradali a tre corsie dove l’ente lo ha alzato.</p>
${h.table(['Limite', 'Multa da', 'Punti da', 'Sospensione 1–3 mesi da', 'Sospensione 6–12 mesi da'], LIMITI.map((l) => [
  `${h.num(l)} km/h`, `${h.num(soglia(h, l, 0))} km/h`, `${h.num(soglia(h, l, 10))} km/h`, `${h.num(soglia(h, l, 40))} km/h`, `${h.num(soglia(h, l, 60))} km/h`,
]), 'Velocità letta da cui scatta ciascuna fascia, art. 142 CdS e art. 345 Reg.: regole in vigore nel 2026', ['l', 'r', 'r', 'r', 'r'])}
<p>Per chi ha la patente da meno di tre anni contano gli stessi numeri, ma su limiti più bassi: ${h.src('cds117', 'l’articolo 117')} fissa ${h.num(h.P.limits.neopatentati.autostrada)} km/h in autostrada e ${h.num(h.P.limits.neopatentati.extraurbana_principale)} sulle extraurbane principali, quindi in autostrada la multa parte da ${h.num(soglia(h, h.P.limits.neopatentati.autostrada, 0))} km/h letti.</p>
<h2>Perché i decimali contano</h2>
<p>Oltre i 100 km/h la riduzione è un valore con decimali, e la velocità accertata resta con i decimali: il testo dell’articolo 345 non prevede arrotondamenti, e il calcolatore usa il valore esatto. Un solo km/h può spostare la fascia. Su una superstrada a 110, ${h.num(157)} km/h letti danno ${h.num(b.accertata, 2)} km/h accertati e ${h.num(b.eccesso, 2)} km/h oltre: ${h.eur(b.minimo)} e ${h.num(b.punti)} punti. ${h.num(158)} km/h letti danno ${h.num(c.accertata, 1)} km/h e ${h.num(c.eccesso, 1)} km/h oltre, appena sopra i 40: ${h.eur(c.minimo)}, ${h.num(c.punti)} punti, sospensione da uno a tre mesi e niente sconto del 30 %. Per questo conviene controllare la velocità letta stampata sul verbale e non fidarsi di un conto a memoria.</p>
<!--mini:limiti-->
<h2>Il caso dei biglietti autostradali</h2>
<p>Il comma 3 dello stesso articolo prevede un metodo diverso: la velocità media ricavata dagli orari stampati sul biglietto all’ingresso e al pagamento del pedaggio, confrontati con la distanza ufficiale tra i caselli. Qui l’errore a favore del conducente è più ampio e cresce con la velocità:</p>
${h.table(['Velocità media dedotta', 'Riduzione'], tp(h).map((x, i) => [
  i === 0 ? `sotto ${h.num(x.below_kmh ?? 0)} km/h` : x.below_kmh === null ? `${h.num(tp(h)[i - 1].below_kmh ?? 0)} km/h e oltre` : `da ${h.num(tp(h)[i - 1].below_kmh ?? 0)} a meno di ${h.num(x.below_kmh)} km/h`,
  h.pct(x.percent, 0),
]), 'Riduzione per la velocità dedotta dai biglietti autostradali, art. 345 c.3 Reg.', ['l', 'r'])}
<p>Con questo metodo ${h.num(150)} km/h di media su un tratto a 130 diventano ${h.num(p.accertata, 1)} km/h: nessuna multa. Su un limite di 130 la prima media sanzionabile è ${h.num(h.M.primaRilevataOltre(130, 0, 'pedaggio'))} km/h. Non va confuso con il tutor, che è un apparecchio omologato per la velocità media e usa la riduzione normale del ${h.pct(h.P.tolerance.percent, 0)}: la pagina sul ${h.a('tutor-autostrade', 'tutor in autostrada')} spiega il calcolo tratto per tratto. Le regole riportate qui sono quelle in vigore nel 2026; i testi sono stati letti su Normattiva il ${h.date(h.P.retrieved_at)}. Se la riduzione sul tuo verbale non torna, la pagina sul ${h.a('ricorso-multa-autovelox', 'ricorso contro la multa autovelox')} indica tempi e strade possibili.</p>`;
    },
  },
  en: {
    slug: 'italy-speed-camera-tolerance',
    nav: 'Speed camera tolerance',
    card: '5% off the recorded speed, at least 5 km/h: the reading at which a fine starts for each limit.',
    title: 'Speed camera tolerance in Italy: 5%, at least 5 km/h',
    description: 'Speed camera tolerance in Italy: 5% of the recorded speed, never under 5 km/h, comes off before the limit is compared. Fine, points and suspension thresholds.',
    h1: 'Speed camera tolerance in Italy: what comes off and where the fine starts',
    intro: 'Enter the speed the device recorded and the limit: the calculator takes off the article 345 reduction, shows the speed held and the readings at which a fine, points and a suspension begin.',
    resume: (h) => `The Italian speed camera tolerance is the reduction that article 345, paragraph 2, of the Highway Code regulation applies to every speed measurement, whatever the device: ${h.pct(h.P.tolerance.percent, 0)} of the recorded speed comes off, with a minimum of ${h.num(h.P.tolerance.min_kmh)} km/h. Up to 100 km/h recorded the reduction is therefore always ${h.num(h.P.tolerance.min_kmh)} km/h; above 100 km/h it is exactly ${h.pct(h.P.tolerance.percent, 0)}, decimals included. What remains is the speed held (velocità accertata), the only figure that counts under article 142. On a 50 limit the first recorded speed that brings a fine is ${h.num(soglia(h, 50, 0))} km/h and points start at ${h.num(soglia(h, 50, 10))} km/h; on a 130 motorway the fine starts at ${h.num(soglia(h, 130, 0))} km/h recorded and points at ${h.num(soglia(h, 130, 10))} km/h. The reduction already includes the instrument’s own margin of error, and devices less accurate than ${h.pct(h.P.tolerance.percent, 0)} may not be used at all. When speed is worked out from the times on motorway toll tickets, paragraph 3 gives larger reductions of 5, 10 or 15%.`,
    faqs: (h) => [
      { q: 'From what recorded speed is there a fine on a 50 km/h road?', a: `On a 50 km/h limit the reduction is always ${h.num(h.P.tolerance.min_kmh)} km/h, because ${h.pct(h.P.tolerance.percent, 0)} of a town speed is below that minimum. A fine therefore starts at ${h.num(soglia(h, 50, 0))} km/h recorded, the ${h.num(h.P.speeding.bands[1].points)} points at ${h.num(soglia(h, 50, 10))} km/h and the suspension at ${h.num(soglia(h, 50, 40))} km/h. On a 30 limit the same thresholds are ${h.num(soglia(h, 30, 0))}, ${h.num(soglia(h, 30, 10))} and ${h.num(soglia(h, 30, 40))} km/h.` },
      { q: 'Does the tolerance differ between fixed cameras, mobile units and laser guns?', a: 'No. Article 345 of the regulation says the reduction applies “whatever the device used”: a fixed post, a mobile camera on a tripod, a hand-held laser gun or an average-speed system. The only different case is speed deduced from the times stamped on motorway toll tickets, where paragraph 3 sets percentages that depend on the average speed.' },
      { q: 'Why is the reduction sometimes 5 km/h rather than 5%?', a: `Because the rule has a floor: ${h.pct(h.P.tolerance.percent, 0)} of the recorded speed comes off, but never less than ${h.num(h.P.tolerance.min_kmh)} km/h. Five per cent only exceeds ${h.num(h.P.tolerance.min_kmh)} km/h above 100 km/h. Below that, in towns and on most country roads, the reduction is a flat ${h.num(h.P.tolerance.min_kmh)} km/h: ${h.num(77)} km/h recorded becomes ${h.num(h.M.velocita({ limite: 70, rilevata: 77 }).accertata)} km/h held.` },
      { q: 'My rental car fine shows a speed with decimals: is that normal?', a: `Yes. Above 100 km/h the ${h.pct(h.P.tolerance.percent, 0)} reduction rarely gives a round number and the speed held keeps its decimals: ${h.num(142)} km/h recorded becomes ${h.num(h.M.velocita({ limite: 130, rilevata: 142 }).accertata, 1)} km/h. Check that the recorded speed minus the reduction gives the speed stated, and that the gap to the limit matches the band charged. The fine comes from the Italian police body that made the check, not from the rental company.` },
    ],
    body: (h) => {
      const a = h.M.velocita({ limite: 130, rilevata: 142 });
      const b = h.M.velocita({ limite: 110, rilevata: 157 });
      const c = h.M.velocita({ limite: 110, rilevata: 158 });
      const p = h.M.velocita({ limite: 130, rilevata: 150, metodo: 'pedaggio' });
      return `<h2>What article 345 of the regulation says</h2>
<p>The rule is not in the Highway Code itself but in its implementing regulation. ${h.src('reg345', 'Article 345, paragraph 2')} requires that, when a device is approved, “a reduction of 5%, with a minimum of 5 km/h” is applied to the value recorded, and adds that this reduction “also includes the instrumental tolerance”. Two practical consequences follow: the reduction is not added on top of a separate margin for the device, and a device whose own error exceeds ${h.pct(h.P.tolerance.percent, 0)} cannot be used to establish speed. Paragraph 4 adds that the devices must be operated directly by the traffic police bodies and remain at their disposal.</p>
<p>The sum is always the same: recorded speed minus reduction gives the speed held; speed held minus the limit gives the excess, which sets the band of the ${h.a('multa-eccesso-di-velocita', 'Italian speeding fine')}. With the calculator’s starting values, ${h.num(142)} km/h recorded on a 130 motorway loses ${h.num(a.riduzioneKmh, 1)} km/h, leaving ${h.num(a.accertata, 1)} km/h held and ${h.num(a.eccesso, 1)} km/h over: ${h.eur(a.minimo)} and no points.</p>
<!--mini:tolleranza-->
<h2>Thresholds for each limit</h2>
<p>The table shows, for each speed limit, the first recorded speed (in whole km/h) that enters each band of article 142, after the ${h.pct(h.P.tolerance.percent, 0)} reduction with its ${h.num(h.P.tolerance.min_kmh)} km/h minimum. A 30 limit applies in signed urban zones, 70 on town roads where the council has raised it, and 150 on three-lane motorway sections where the operator has raised it.</p>
${h.table(['Limit', 'Fine from', 'Points from', '1–3 month suspension from', '6–12 month suspension from'], LIMITI.map((l) => [
  `${h.num(l)} km/h`, `${h.num(soglia(h, l, 0))} km/h`, `${h.num(soglia(h, l, 10))} km/h`, `${h.num(soglia(h, l, 40))} km/h`, `${h.num(soglia(h, l, 60))} km/h`,
]), 'Recorded speed at which each band starts, article 142 of the Highway Code and article 345 of the regulation: rules in force in 2026', ['l', 'r', 'r', 'r', 'r'])}
<p>Drivers licensed for less than three years use the same arithmetic on lower limits: ${h.src('cds117', 'article 117')} sets ${h.num(h.P.limits.neopatentati.autostrada)} km/h on motorways and ${h.num(h.P.limits.neopatentati.extraurbana_principale)} on main extra-urban roads, so on a motorway their fine starts at ${h.num(soglia(h, h.P.limits.neopatentati.autostrada, 0))} km/h recorded.</p>
<h2>Why the decimals matter</h2>
<p>Above 100 km/h the reduction has decimals, and so does the speed held: article 345 says nothing about rounding, and the calculator uses the exact value. A single km/h can change the band. On a 110 dual carriageway, ${h.num(157)} km/h recorded gives ${h.num(b.accertata, 2)} km/h held and ${h.num(b.eccesso, 2)} km/h over: ${h.eur(b.minimo)} and ${h.num(b.punti)} points. ${h.num(158)} km/h recorded gives ${h.num(c.accertata, 1)} km/h and ${h.num(c.eccesso, 1)} km/h over, just above 40: ${h.eur(c.minimo)}, ${h.num(c.punti)} points, a one-to-three-month suspension and no 30% discount. That is why it pays to read the recorded speed printed on the verbale (the Italian fine notice) rather than trusting a rough mental sum.</p>
<!--mini:limiti-->
<h2>Speed worked out from toll tickets</h2>
<p>Paragraph 3 of the same article allows another method: the average speed deduced from the times printed on the motorway ticket at entry and at the toll booth, compared with the official distance between the two junctions. Here the margin in the driver’s favour is wider and grows with speed:</p>
${h.table(['Average speed deduced', 'Reduction'], tp(h).map((x, i) => [
  i === 0 ? `below ${h.num(x.below_kmh ?? 0)} km/h` : x.below_kmh === null ? `${h.num(tp(h)[i - 1].below_kmh ?? 0)} km/h and above` : `${h.num(tp(h)[i - 1].below_kmh ?? 0)} to under ${h.num(x.below_kmh)} km/h`,
  `${Math.round(x.percent * 100)}%`,
]), 'Reduction for speed deduced from motorway tickets, article 345, paragraph 3, of the regulation', ['l', 'r'])}
<p>With this method an average of ${h.num(150)} km/h on a 130 stretch becomes ${h.num(p.accertata, 1)} km/h: no fine. On a 130 limit the first average that can be fined is ${h.num(h.M.primaRilevataOltre(130, 0, 'pedaggio'))} km/h. It should not be confused with the Tutor, a device homologated for average speed that uses the ordinary ${h.pct(h.P.tolerance.percent, 0)} reduction: the ${h.a('tutor-autostrade', 'average-speed camera page')} goes through that calculation. The rules here are those in force in 2026; the texts were read on Normattiva on ${h.date(h.P.retrieved_at)}. If the reduction on your fine does not add up, the ${h.a('ricorso-multa-autovelox', 'appeal page')} sets out the deadlines and the two routes.</p>`;
    },
  },
});
