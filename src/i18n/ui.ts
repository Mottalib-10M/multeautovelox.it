import type { Locale } from './routes';
const it = {
  updatedOn: 'Aggiornato il', editorialPolicy: 'Politica editoriale', contactLabel: 'Contatti', reviewedBy: 'Verificato da',
  skipToContent: 'Vai al contenuto', mainNav: 'Navigazione principale', breadcrumbLabel: 'Percorso', breadcrumbHome: 'Home', menuOpen: 'Apri il menu',
  faqTitle: 'Domande frequenti', relatedCalculators: 'Pagine e calcoli collegati', sourcesTitle: 'Fonti', writtenBy: 'Scritto da',
  asOf: 'Importi in vigore nel', lastUpdated: 'testi riletti il', footerValidated: 'Fonti: Codice della Strada e Regolamento (Normattiva), registro dei dispositivi di rilevamento della velocità del Ministero delle infrastrutture e dei trasporti (CC BY 3.0 IT), comuni ISTAT (CC BY 4.0)', footerBrowser: 'Senza account · nessuna e-mail né numero richiesto · risultato immediato · gratis',
  footerDisclaimer: 'Sito indipendente pubblicato da Radif Partners. Non è un sito del Ministero, della Polizia né di una prefettura, e non vende ricorsi, consulenze legali né assicurazioni: nessun link commerciale, nessuna commissione. I calcoli applicano i testi in vigore a titolo indicativo: fa fede solo il verbale ricevuto, o la decisione del prefetto o del giudice.', footerPopular: '', notFound: 'Questa pagina non esiste.',
  readMore: 'Leggi tutto',
};
const en: typeof it = {
  updatedOn: 'Updated on', editorialPolicy: 'Editorial policy', contactLabel: 'Contact', reviewedBy: 'Checked by',
  skipToContent: 'Skip to content', mainNav: 'Main navigation', breadcrumbLabel: 'Breadcrumb', breadcrumbHome: 'Home', menuOpen: 'Open menu',
  faqTitle: 'Frequently asked questions', relatedCalculators: 'Related pages and calculations', sourcesTitle: 'Sources', writtenBy: 'Written by',
  asOf: 'Amounts in force in', lastUpdated: 'texts reread on', footerValidated: 'Sources: Italian Highway Code and its Regulation (Normattiva), register of speed-measuring devices of the Ministry of Infrastructure and Transport (CC BY 3.0 IT), ISTAT comuni (CC BY 4.0)', footerBrowser: 'No account · no email or phone number asked · instant result · free',
  footerDisclaimer: 'Independent site published by Radif Partners. It is not a site of the Italian ministry, the police or a prefettura, and it sells no appeal service, legal advice or insurance: no commercial link, no commission. The calculations apply the texts in force for guidance only: only the fine you receive, or a decision of the prefetto or the court, is binding.', footerPopular: '', notFound: 'This page does not exist.',
  readMore: 'Read more',
};
export function t(lang: Locale) { return lang === 'en' ? en : it; }
