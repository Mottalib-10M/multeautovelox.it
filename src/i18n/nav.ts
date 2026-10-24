import { route, type Locale } from './routes';
import { PAGES, pageById, GROUPS } from '../lib/guides';
import type { Group } from '../lib/guide-types';
export interface NavLink { href: string; label: string } export interface NavCategory { label: string; links: NavLink[] }
const CORE: Record<Locale, Record<string, string>> = {
  it: { home: 'Calcola la multa', method: 'Metodo e fonti', about: 'Chi siamo', widget: 'Inserisci il calcolatore', contact: 'Contatti', editorial: 'Politica editoriale', privacy: 'Privacy', terms: 'Note legali', cookies: 'Cookie' },
  en: { home: 'Work out my fine', method: 'Method and sources', about: 'About', widget: 'Embed the calculator', contact: 'Contact', editorial: 'Editorial policy', privacy: 'Privacy', terms: 'Legal notice', cookies: 'Cookies' },
};
const GROUP_LABEL: Record<Locale, Record<Group, string>> = {
  it: { velocita: 'Eccesso di velocità', autovelox: 'Autovelox', punti: 'Punti patente', infrazioni: 'Altre multe', verbale: 'Pagare o fare ricorso' },
  en: { velocita: 'Speeding', autovelox: 'Speed cameras', punti: 'Licence points', infrazioni: 'Other fines', verbale: 'Pay or appeal' },
};
export const label = (id: string, lang: Locale) => CORE[lang][id] ?? pageById(id)?.[lang].nav ?? id;
const link = (id: string, lang: Locale): NavLink => ({ href: route(id, lang), label: label(id, lang) });
const inGroup = (g: Group, lang: Locale) => PAGES.filter((p) => p.group === g).map((p) => link(p.id, lang));
export function navCategories(lang: Locale): NavCategory[] {
  return GROUPS.map((g) => ({ label: GROUP_LABEL[lang][g], links: inGroup(g, lang) })).filter((c) => c.links.length);
}
export const navDirect = (lang: Locale): NavLink[] => [link('method', lang)];
export const footerColumns = (lang: Locale): NavCategory[] => [...navCategories(lang), { label: lang === 'it' ? 'Il sito' : 'Site', links: ['home', 'method', 'about', 'contact', 'editorial', 'widget', 'terms', 'privacy', 'cookies'].map((i) => link(i, lang)) }];
export const popularLinks = (_lang: Locale): NavLink[] => [];
