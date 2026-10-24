/**
 * Une page = UN fichier de données dans `src/content/pagine/`. Il porte les deux langues (it, en), le
 * texte, la FAQ, les sources, l'outil, le mini-simulateur et les liens ; le cœur du site (routes, menus,
 * pied de page, sitemap, hreflang, schémas, maillage) le lit seul.
 */
import type { SourceKey, Params } from './engine/params';

export type Lang = 'it' | 'en';
export type Group = 'velocita' | 'autovelox' | 'punti' | 'infrazioni' | 'verbale';
/** Outil principal : `velocita` (velocità → multa), `velox` (registro MIT per comune o decreto),
 *  `mappa` (registro per regione), `punti` (saldo patente), `altre` (altre infrazioni),
 *  `scadenze` (pagare o fare ricorso). */
export type Tool = 'velocita' | 'velox' | 'mappa' | 'punti' | 'altre' | 'scadenze';
export interface FAQ { q: string; a: string }

export interface Helpers {
  lang: Lang;
  a: (id: string, text: string) => string;
  eur: (n: number, decimals?: number) => string;
  num: (n: number, decimals?: number) => string;
  pct: (x: number, decimals?: number) => string;
  /** Registro MIT degli autovelox (src/data/velox/stats.json, prodotto da scripts/build-derived.mjs). */
  S: typeof import('../data/velox/stats.json');
  /** Tabella punti dell'art. 126-bis (src/data/tabella-punti.json). */
  TP: typeof import('../data/tabella-punti.json');
  date: (iso: string) => string;
  table: (headers: string[], rows: Array<Array<string | number>>, caption?: string, align?: Array<'l' | 'r'>) => string;
  src: (key: SourceKey, text?: string) => string;
  P: Params;
  M: typeof import('./engine/index');
  /** Jour de référence du build (heure de Rome). */
  today: string;
  /** Date de la copie du registre MIT lue (ISO). */
  reg: string;
}

export interface PageText {
  slug: string;
  nav: string;
  card: string;
  /** 50 à 60 caractères, terme-clé en tête (RECETTE §11). */
  title: string;
  /** 150 à 160 caractères. */
  description: string;
  h1: string;
  intro: string;
  /** Bloc citable : UN paragraphe d'au moins 120 mots (RECETTE §21). */
  resume: (h: Helpers) => string;
  faqs: (h: Helpers) => FAQ[];
  body: (h: Helpers) => string;
}

export interface PageDef {
  id: string;
  group: Group;
  order: number;
  mini?: string;
  miniHref?: string;
  tool?: Tool;
  outil?: Record<string, string | number | boolean | string[]>;
  related: string[];
  sources: SourceKey[];
  it: PageText;
  en: PageText;
}
export const defineGuide = (g: PageDef): PageDef => g;
