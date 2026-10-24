import { defineGuide, type Helpers } from '../../lib/guide-types';

type Riga = { articolo: string; comma: string; punti: number; segno: string; rubrica: string; rubrica_en: string };
const R = (h: Helpers) => h.TP.righe as Riga[];
const NEO = (h: Helpers) => h.P.points.neopatentato_doubling.factor;

/** Le righe dell'art. 167 riprendono il comma da cui dipendono (tonnellate : commi 2, 5 e 6 ; percentuale : commi 3, 5 e 6). */
const commaIt = (r: Riga) => {
  if (r.articolo !== '167' || r.comma.startsWith('Comma')) return r.comma;
  return (/per cento/.test(r.comma) ? 'Commi 3, 5 e 6, ' : 'Commi 2, 5 e 6, ') + r.comma;
};
const commaEn = (r: Riga) => commaIt(r)
  .replace(/, ad eccezione dei segnali stradali di divieto di sosta e fermata/, ', except no-parking and no-stopping signs')
  .replace(/eccedenza non superiore a (\d)t/, 'excess up to $1 t').replace(/eccedenza superiore a (\d)t/, 'excess over $1 t')
  .replace(/eccedenza non superiore al (\d+) per cento/, 'excess up to $1%').replace(/eccedenza superiore al (\d+) per cento/, 'excess over $1%')
  .replace(/con riferimento all'articolo (\S+), comma/, 'with reference to article $1, para.')
  .replace(/con riferimento ai commi/, 'with reference to paras.').replace(/con riferimento al comma/, 'with reference to para.')
  .replace(/per violazione dei tempi di guida/, '(driving time)').replace(/per violazione dei tempi di riposo/, '(rest time)')
  .replace(/primo periodo/, 'first sentence').replace(/secondo periodo/, 'second sentence').replace(/terzo periodo/, 'third sentence')
  .replace(/^Commi /, 'Paras. ').replace(/^[Cc]omma /, 'Para. ').replace(/lettere/, 'letters').replace(/lettera/, 'letter').replace(/ e /g, ' and ');

const righe = (h: Helpers, en: boolean) => R(h).map((r, i) => [
  i === 0 || R(h)[i - 1].articolo !== r.articolo ? `<strong>${r.articolo}</strong>` : '',
  i === 0 || R(h)[i - 1].articolo !== r.articolo ? (en ? r.rubrica_en : r.rubrica) : '',
  en ? commaEn(r) : commaIt(r),
  h.num(r.punti),
  h.num(r.punti * NEO(h)),
]);
const perPunti = (h: Helpers) => [...new Set(R(h).map((r) => r.punti))].sort((a, b) => b - a).map((p) => ({ p, n: R(h).filter((r) => r.punti === p).length, art: [...new Set(R(h).filter((r) => r.punti === p).map((r) => r.articolo))] }));
const lista = (xs: string[], e: string) => xs.join(', ').replace(/, ([^,]*)$/, ` ${e} $1`);
const dieci = (h: Helpers) => perPunti(h).find((x) => x.p === 10)!;
const uno = (h: Helpers) => perPunti(h).find((x) => x.p === 1)!;
const articoli = (h: Helpers) => new Set(R(h).map((r) => r.articolo)).size;

export default defineGuide({
  id: 'tabella-punti-patente',
  group: 'punti',
  order: 3,
  tool: 'punti',
  outil: { mode: 'saldo' },
  related: ['punti-patente', 'decurtazione-punti-patente', 'sanzioni-codice-della-strada', 'multa-cintura', 'multa-eccesso-di-velocita'],
  sources: ['tabella', 'cds126bis', 'cds173'],
  it: {
    slug: 'tabella-punti-patente',
    nav: 'Tabella punti patente',
    card: 'Le 97 righe della tabella dell’art. 126-bis in vigore dal 12 aprile 2025: norma violata, punti e punti per i neopatentati.',
    title: 'Tabella punti patente 2026: tutte le 97 infrazioni',
    description: 'Tabella punti patente completa: le 97 righe dell’art. 126-bis in vigore dal 12 aprile 2025, articolo per articolo, da 1 a 10 punti, doppi per i neopatentati.',
    h1: 'Tabella dei punti patente: tutte le infrazioni e i punti',
    intro: 'Cerca l’infrazione del tuo verbale nella tabella ufficiale qui sotto, poi indica i punti che hai: il calcolo toglie quelli previsti, raddoppiati se sei neopatentato, e mostra il saldo.',
    resume: (h) => `La tabella dei punteggi allegata all’articolo 126-bis del Codice della Strada, nel testo in vigore dal 12 aprile 2025, conta ${h.num(R(h).length)} righe distribuite su ${h.num(articoli(h))} articoli, dal 141 (velocità) al 193 (assicurazione obbligatoria). Ogni riga indica la norma violata, cioè articolo e comma, e i punti da togliere: si va da 1 punto, per esempio per alcune luci dei veicoli o per i piccoli sovraccarichi, a 10 punti per le violazioni più gravi, come la velocità oltre 60 km/h sopra il limite, la guida in stato di ebbrezza o dopo aver assunto stupefacenti, la retromarcia in autostrada e alcuni comportamenti scorretti dopo un incidente. Le righe da 10 punti sono ${h.num(dieci(h).n)}. Un’infrazione che non compare nella tabella non toglie punti, anche se costa cara. Per le patenti rilasciate dopo il ${h.date(h.P.points.neopatentato_doubling.issued_after)} a chi non aveva già una patente B o superiore, ogni punteggio raddoppia nei primi tre anni. Il verbale deve riportare il punteggio della violazione; il saldo si controlla sul Portale dell’automobilista.`,
    faqs: (h) => [
      { q: 'Quali infrazioni tolgono 10 punti?', a: `Nella tabella in vigore le righe da 10 punti sono ${h.num(dieci(h).n)} e riguardano gli articoli ${lista(dieci(h).art, 'e')}. Tra le più comuni: velocità oltre 60 km/h sopra il limite, guida con alcol oltre 0,5 g/l o dopo stupefacenti, retromarcia in autostrada, seconda violazione con il telefono in due anni, alcuni comportamenti dopo un incidente. Per un neopatentato diventano 20 punti.` },
      { q: 'Da quando è in vigore la tabella dei punti attuale?', a: `Dal 12 aprile 2025: è la data del testo vigente pubblicato su Normattiva, letto qui il ${h.date(h.P.retrieved_at)}. La tabella cambia quando una legge modifica il Codice; l’ultima grande riforma è la legge 177 del 2024, in vigore dal 14 dicembre 2024. Se il testo verrà aggiornato di nuovo, questa pagina riporterà la nuova data di vigore accanto alle righe.` },
      { q: 'Perché alcune righe dell’articolo 173 hanno il segno meno?', a: 'Nel testo ufficiale le tre righe dell’articolo 173, cioè lenti o apparecchi prescritti e telefono alla guida, sono scritte come «-8», «-5» e «-10», mentre tutte le altre riportano il numero senza segno. È solo una scelta grafica: il segno indica la decurtazione, i punti tolti sono 8, 5 e 10 come per qualsiasi altra riga.' },
      { q: 'Un’infrazione che non compare nella tabella toglie punti?', a: 'No. Il comma 1 dell’articolo 126-bis lega la decurtazione alle violazioni indicate nella tabella. Molte infrazioni costose non ci sono: la sosta sul marciapiede o in doppia fila, l’ingresso in ZTL, la sosta oltre l’orario. Per la sosta la tabella prevede punti solo per i posti dei disabili, le fermate dei mezzi pubblici e le corsie riservate.' },
      { q: 'Qual è l’infrazione che toglie meno punti?', a: `Il minimo è 1 punto, previsto da ${h.num(uno(h).n)} righe degli articoli ${lista(uno(h).art, 'e')}: alcune regole sulle luci dei veicoli, i sovraccarichi più piccoli, il trasporto di persone e oggetti, alcune regole sui tempi di guida e sui documenti di viaggio dei professionisti. Anche un solo punto interrompe i due anni senza violazioni che servono a tornare a 20.` },
    ],
    body: (h) => {
      const pp = perPunti(h);
      return `<h2>Come si legge la tabella</h2>
<p>La ${h.src('tabella', 'tabella dei punteggi previsti all’articolo 126-bis')} ha due colonne: «Norma violata» e «Punti». La norma violata è indicata con l’articolo del Codice e il comma, a volte con il periodo (la frase del comma) o la lettera. Quando un comma contiene solo la sanzione, la tabella aggiunge «con riferimento al comma», cioè alla regola di comportamento violata: per il sorpasso, per esempio, il comma 15 dell’articolo 148 vale 3, 5 o 2 punti secondo che si violi il comma 2, il 3 o l’8. La terza colonna qui sotto, aggiunta da noi, applica il raddoppio per i neopatentati previsto dalla nota finale.</p>
<p>Il testo è quello vigente dal 12 aprile 2025, letto su Normattiva il ${h.date(h.P.retrieved_at)} e in vigore nel 2026. Nella tabella ufficiale le tre righe dell’${h.src('cds173', 'articolo 173')} portano un segno meno davanti al numero («-8», «-5», «-10»): è una particolarità grafica, i punti si tolgono come per le altre righe. La riga del comma 3 riguarda chi non usa le lenti o gli apparecchi prescritti in patente (comma 1), quelle del comma 3-bis il telefono e le cuffie alla guida. Le righe dell’articolo 192, sui controlli di polizia, compaiono tra doppie parentesi, il segno con cui Normattiva evidenzia il testo modificato.</p>
<h2>Quante righe per ogni punteggio</h2>
${h.table(['Punti', 'Righe', 'Neopatentato', 'Articoli'], pp.map((x) => [h.num(x.p), h.num(x.n), h.num(x.p * NEO(h)), x.art.join(', ')]), 'Distribuzione dei punteggi nella tabella dell’art. 126-bis', ['r', 'r', 'r', 'l'])}
<p>La maggior parte delle righe vale tra 2 e 5 punti. Le righe da 10 punti (${h.num(dieci(h).n)}) riguardano i comportamenti che mettono più a rischio gli altri: velocità oltre 60 km/h sopra il limite, alcol e droghe, manovre vietate in autostrada, materiali pericolosi, comportamento dopo un incidente. Per sapere quanto resterà sul saldo dopo una di queste violazioni, il calcolatore in alto parte dal tuo punteggio attuale.</p>
<!--mini:saldo-->
<h2>La tabella completa</h2>
<p>Le ${h.num(R(h).length)} righe sono riportate nell’ordine ufficiale, articolo per articolo. La colonna «Materia» riprende il titolo dell’articolo del Codice.</p>
${h.table(['Art.', 'Materia', 'Norma violata', 'Punti', 'Neopat.'], righe(h, false), 'Tabella dei punteggi dell’art. 126-bis CdS, testo in vigore dal 12 aprile 2025', ['l', 'l', 'l', 'r', 'r'])}
<h2>Cosa la tabella non dice</h2>
<p>La tabella fissa i punti per una singola violazione, non il totale di un controllo. Quando più violazioni sono accertate insieme, il comma 1-bis dell’${h.src('cds126bis', 'articolo 126-bis')} limita la perdita a ${h.num(h.P.points.max_simultaneous)} punti, salvo che una comporti la sospensione o la revoca della patente: i casi pratici sono nella pagina sulla ${h.a('decurtazione-punti-patente', 'decurtazione dei punti')}. La tabella non dice nemmeno quanto costa la multa: gli importi sono negli articoli del Codice, e la pagina ${h.a('sanzioni-codice-della-strada', 'sanzioni del Codice della Strada')} li riassume per le infrazioni più comuni.</p>
<!--mini:cumulo-->
<p>Infine, i punti si tolgono solo quando la contestazione è definita (pagamento, fine dei ricorsi o termini scaduti) e si recuperano con due anni senza violazioni o con un corso: tutto il percorso è spiegato nella pagina sui ${h.a('punti-patente', 'punti patente')}.</p>`;
    },
  },
  en: {
    slug: 'italy-points-table',
    nav: 'Points table',
    card: 'All 97 rows of the article 126-bis table in force since 12 April 2025: rule broken, points and new-driver points.',
    title: 'Points table in Italy 2026: all 97 offences and points',
    description: 'Points table for the Italian licence: all 97 rows of article 126-bis, in force since 12 April 2025, article by article, 1 to 10 points, double for new drivers.',
    h1: 'The Italian licence points table: every offence and its points',
    intro: 'Find the offence on your fine in the official table below, then enter the points you hold: the calculator takes off the table’s figure, doubled for new drivers, and shows your balance.',
    resume: (h) => `The points table attached to article 126-bis of the Italian Highway Code, in the text in force since 12 April 2025, has ${h.num(R(h).length)} rows spread over ${h.num(articoli(h))} articles, from article 141 (speed) to article 193 (compulsory insurance). Each row names the rule broken, by article and paragraph (comma), and the points to deduct: from 1 point, for example for some vehicle lights or small overloads, up to 10 points for the most serious offences, such as speeding more than 60 km/h over the limit, drink-driving or driving after taking drugs, reversing on a motorway and some failures to act properly after an accident. There are ${h.num(dieci(h).n)} rows worth 10 points. An offence that is not in the table costs no points, however expensive the fine. For licences issued after ${h.date(h.P.points.neopatentato_doubling.issued_after)} to people who did not already hold a category B licence or higher, every figure doubles in the first three years. The fine (verbale) must state the points for the offence, and the balance can be checked on the Portale dell’automobilista, the licensing authority’s website.`,
    faqs: (h) => [
      { q: 'Which offences cost 10 points in Italy?', a: `In the current table ${h.num(dieci(h).n)} rows are worth 10 points, under articles ${lista(dieci(h).art, 'and')}. The best known are speeding more than 60 km/h over the limit, driving with over 0.5 g/l of alcohol or after taking drugs, reversing on a motorway, a second phone offence within two years and some failures after an accident. A new driver loses 20.` },
      { q: 'Since when has the current Italian points table applied?', a: `Since 12 April 2025, the date of the version published on Normattiva, the official database of Italian law, which we read on ${h.date(h.P.retrieved_at)}. The table changes whenever a law amends the Code; the last major reform was law 177 of 2024, in force since 14 December 2024. If the text is updated again, this page will show the new date next to the rows.` },
      { q: 'Why do some article 173 rows show a minus sign?', a: 'In the official text the three article 173 rows, covering prescribed glasses or aids and phones at the wheel, are printed as “-8”, “-5” and “-10”, while every other row shows a plain number. It is only a quirk of presentation: the sign means a deduction, and 8, 5 and 10 points come off just as for any other row.' },
      { q: 'Does an offence missing from the Italian table cost points?', a: 'No. Paragraph 1 of article 126-bis ties deductions to the offences listed in the table. Many costly offences are not there: parking on a pavement or double-parking, entering a ZTL (limited traffic zone), overstaying a parking limit. For parking, the table only gives points for disabled bays, public transport stops and reserved lanes.' },
      { q: 'What do “comma” and “periodo” mean in the table?', a: 'Italian laws are split into articles, each article into numbered paragraphs called commi (singular comma), and each comma into sentences called periodi. So “article 173, comma 3-bis, secondo periodo” means the second sentence of paragraph 3-bis. A lettera is a lettered point inside a comma, such as a) or g). Your fine cites the rule the same way.' },
    ],
    body: (h) => {
      const pp = perPunti(h);
      return `<h2>How to read the table</h2>
<p>The ${h.src('tabella', 'article 126-bis points table')} has two columns: «Norma violata» (rule broken) and «Punti» (points). The rule is given by article of the Highway Code and paragraph (comma), sometimes with the sentence (periodo) or lettered point (lettera). When a paragraph only contains the penalty, the table adds «con riferimento al comma», meaning the rule of conduct actually broken: for overtaking, for example, paragraph 15 of article 148 is worth 3, 5 or 2 points depending on whether paragraph 2, 3 or 8 was broken. The third column below, which we added, applies the new-driver doubling set by the table’s final note.</p>
<p>This is the text in force since 12 April 2025, read on Normattiva on ${h.date(h.P.retrieved_at)} and in force in 2026. In the official table the three rows of ${h.src('cds173', 'article 173')} carry a minus sign before the number (“-8”, “-5”, “-10”): a quirk of presentation, and the points come off as for any other row. The paragraph 3 row covers drivers who do not use the glasses or aids prescribed on their licence (paragraph 1); the paragraph 3-bis rows cover phones and headphones at the wheel. The article 192 rows, on police checks, appear in double brackets, the mark Normattiva uses to highlight amended text.</p>
<h2>How many rows for each score</h2>
${h.table(['Points', 'Rows', 'New driver', 'Articles'], pp.map((x) => [h.num(x.p), h.num(x.n), h.num(x.p * NEO(h)), x.art.join(', ')]), 'How the scores are spread in the article 126-bis table', ['r', 'r', 'r', 'l'])}
<p>Most rows are worth 2 to 5 points. The ${h.num(dieci(h).n)} rows worth 10 points cover the behaviour that most endangers others: speeding more than 60 km/h over the limit, alcohol and drugs, banned manoeuvres on motorways, dangerous goods, conduct after an accident. To see what would be left of your balance after one of them, the calculator at the top starts from the points you hold now.</p>
<!--mini:saldo-->
<h2>The full table</h2>
<p>All ${h.num(R(h).length)} rows in the official order, article by article. The «Subject» column gives the title of the Highway Code article in English; the rule column translates the Italian reference.</p>
${h.table(['Art.', 'Subject', 'Rule broken', 'Points', 'New driver'], righe(h, true), 'Points table of article 126-bis of the Italian Highway Code, text in force since 12 April 2025', ['l', 'l', 'l', 'r', 'r'])}
<h2>What the table does not say</h2>
<p>The table sets the points for one offence, not the total for a roadside check. When several offences are found together, paragraph 1-bis of ${h.src('cds126bis', 'article 126-bis')} limits the loss to ${h.num(h.P.points.max_simultaneous)} points, unless one of them carries a suspension or revocation of the licence: worked examples are on the ${h.a('decurtazione-punti-patente', 'points deduction page')}. Nor does the table give the amount of the fine: that is in each article of the Code, and the ${h.a('sanzioni-codice-della-strada', 'Italian traffic fines list')} sums them up for the most common offences.</p>
<!--mini:cumulo-->
<p>Finally, points come off only once the fine is settled (paid, appeals over or deadlines passed) and come back after two clean years or a course: the whole process is on the ${h.a('punti-patente', 'licence points page')}.</p>`;
    },
  },
});
