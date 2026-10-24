/** Configuration centrale du site (générée par new-site.py). */
export const SITE_URL = "https://it-multe-autovelox.example";
export const SITE_NAMES: Record<string, string> = {"it": "Multe e Autovelox", "en": "Multe e Autovelox"};
export const LANG_TAGS: Record<string, string> = {"it": "it-IT", "en": "en-IT"};
export const OG_LOCALES: Record<string, string> = {"it": "it_IT", "en": "en_GB"};
export const LOCALE_TAG = 'it-IT';
/** Une locale par langue (RECETTE §4) : virgule décimale en italien, point en anglais. */
export const LOCALE_BY_LANG: Record<string, string> = { it: 'it-IT', en: 'en-GB' };
export const CURRENCY = 'EUR';
export const YEAR = 2026;
/** Année de création du site — signal d'ancienneté (RECETTE §8.0). */
export const SITE_FOUNDED = '2026';
export const LAST_UPDATED = '2026-10-24';
export const AUTHOR_NAME = 'Radif Partners';
export const AUTHOR_ROLE: Record<string, string> = {"it": "Editore di un calcolatore indipendente delle multe stradali italiane: velocità accertata, importo, punti e registro degli autovelox", "en": "Publisher of an independent calculator of Italian traffic fines: recorded speed, amount, licence points and the national speed-camera register"};
export const AUTHOR_DESC: Record<string, string> = {"it": "Radif Partners toglie alla velocità letta sul verbale la riduzione prevista dall'art. 345 del Regolamento (5%, almeno 5 km/h), trova la fascia dell'art. 142 del Codice della Strada e mostra l'importo entro 5 giorni, entro 60 giorni e dopo, i punti e l'eventuale sospensione. Per ogni comune riporta gli apparecchi dichiarati nel registro nazionale pubblicato dal Ministero delle infrastrutture e dei trasporti.", "en": "Radif Partners takes the speed printed on your Italian fine, removes the reduction set by article 345 of the Highway Code regulation (5%, at least 5 km/h), finds the band of article 142 and shows what you pay within 5 days, within 60 days and later, the points lost and any suspension. For each comune it lists the devices declared in the national register published by the Italian transport ministry."};
/** Sujets sur lesquels l'editeur est competent (schema.org knowsAbout). Ce sont les
 *  themes reellement traites par le site, pas une liste de mots-cles : un sujet
 *  declare ici sans page qui le couvre est une declaration fausse. */
export const KNOWS_ABOUT: Record<string, string[]> = {"it": ["Limiti di velocità e sanzioni dell'art. 142 del Codice della Strada", "Riduzione del 5% sulla velocità rilevata (art. 345 del Regolamento)", "Patente a punti e tabella dell'art. 126-bis", "Pagamento ridotto del 30% e verbale non pagato", "Ricorso al prefetto e al giudice di pace", "Registro nazionale degli autovelox per comune"], "en": ["Italian speed limits and article 142 penalties", "The 5% reduction applied to Italian speed readings", "The Italian points licence and its penalty table", "The 30% early-payment discount on Italian fines", "Appealing an Italian fine to the prefetto or the giudice di pace", "Italy's national register of speed cameras by comune"]};
export const CONTACT_EMAIL = "contatti@it-multe-autovelox.example";
export const THEME_COLOR = '#0B6E3A';
export const LOGO_SYMBOL = 'km/h';
export const BING_VERIFY_CODE = '';
export const GOOGLE_VERIFY_CODE = '';
/** Régime : 'none' pour tous les sites (RECETTE §15.6, décision de l'éditeur du 2026-10-06) :
 *  aucun bandeau ; Clarity chargé en mode sans cookie (consentv2 denied) ; GA4 avec cookies si GA4_ID.
 *  'opt-in' / 'notice' ne servent plus qu'aux sites anciens qui les portent encore. */
export const CONSENT_MODE: 'opt-in' | 'notice' | 'none' = 'none';
/** Propriété Google Analytics 4 (décision de l'éditeur du 2026-10-17, RECETTE §15.6) : GA4 normal,
 *  avec cookies _ga / _ga_<ID> (390 jours), sans bandeau, publicité refusée. Créée par
 *  `seo-platform/scripts/create-ga4.ts accounts/372759688` (RECETTE §15.3, étape 15), puis
 *  pages légales régénérées : `python3 scripts/gen-legal-pages.py .`. Vide = pas de GA4. */
export const GA4_ID = '';
/** Projet Microsoft Clarity (compte amradif), chargé sans cookie. Vide = aucune mesure. */
export const CLARITY_ID = '';
export const INDEXNOW_KEY = 'bc51ede4e4ff6c7e1947a3056bd71448';

/* ------------------------------------------------------------------------- *
 * IDENTITÉ LÉGALE — À COMPLÉTER AVANT LA MISE EN LIGNE
 * Ces champs alimentent la mention légale du pays, la politique de confidentialité,
 * la page contact et le schema Organization. Un champ vide s'affiche en jaune
 * sur le site. Contrôle : `npm run check:legal`.
 * ------------------------------------------------------------------------- */
export interface LegalHosting { name: string; address: string; phone: string; url: string }
export interface LegalIdentity {
  entityName: string; legalForm: string; street: string; postalCode: string; city: string;
  country: string; phone: string; registerLabel: string; registerNumber: string;
  vatLabel: string; vatNumber: string; jurisdiction: string;
  supervisoryAuthority: string; supervisoryAuthorityUrl: string; hosting: LegalHosting;
}
export const LEGAL: LegalIdentity = {
  entityName: 'Radif Partners',            // raison sociale ou nom commercial exploité
  legalForm: '',  // vide : publication à titre personnel, pas de société
  street: '49 rue du Ressort',
  postalCode: '63000',
  city: 'Clermont-Ferrand',
  country: "France",
  phone: '',                 // ligne de contact publiée
  registerLabel: "SIREN",
  registerNumber: '',
  vatLabel: "Partita IVA / TVA",
  vatNumber: '',             // laisser vide si non assujetti
  jurisdiction: "France",
  supervisoryAuthority: "Commission nationale de l'informatique et des libertés (CNIL)",
  supervisoryAuthorityUrl: "https://www.cnil.fr",
  hosting: { name: 'GitHub, Inc. (GitHub Pages)', address: '88 Colin P Kelly Jr Street, San Francisco, CA 94107, United States', phone: '', url: 'https://pages.github.com' },
};

/** Champs sans lesquels le site ne doit pas être mis en ligne. */
export const LEGAL_REQUIRED: Array<keyof LegalIdentity> = ['entityName', 'street', 'postalCode', 'city'];

/** Profils publics de l'auteur (schema.org sameAs). Laisser vide si aucun. */
export const AUTHOR_SAME_AS: string[] = [];

/** Rythme de revue éditoriale annoncé sur le site, en mois. */
export const REVIEW_CYCLE_MONTHS = 12;
