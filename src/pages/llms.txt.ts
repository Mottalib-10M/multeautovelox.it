import type { APIRoute } from 'astro';
import { PAGES } from '../lib/guides';
import { route } from '../i18n/routes';
import { SITE_URL, SITE_NAMES, AUTHOR_NAME } from '../data/site-config';
import stats from '../data/velox/stats.json';

/** llms.txt (RECETTE §21) : le site, ses données et ses pages, généré au build depuis le registre des pages. */
export const GET: APIRoute = () => {
  const u = (p: string) => SITE_URL + p;
  const m = stats.meta;
  const lines = [
    `# ${SITE_NAMES.it}`,
    '',
    `> Calcolatore indipendente delle multe stradali italiane pubblicato da ${AUTHOR_NAME}: velocità accertata dopo la riduzione dell'art. 345 del Regolamento, fascia dell'art. 142 del Codice della Strada, importo entro 5 e 60 giorni, punti patente, sospensione, scadenze di notifica e ricorso, e gli autovelox dichiarati per ogni comune nel registro del Ministero delle infrastrutture e dei trasporti. Sito non ufficiale. Italiano e inglese.`,
    '',
    '## Dati',
    '',
    `- Registro MIT degli apparecchi di rilevamento della velocità (${m.fonte_url}), licenza CC BY 3.0 IT; copia del ${m.catturato_il.slice(0, 10)}, ${m.dispositivi_totali} apparecchi.`,
    '- ISTAT, Elenco dei comuni italiani, licenza CC BY 4.0.',
    '- Codice della Strada (D.Lgs. 285/1992) e Regolamento (DPR 495/1992) su Normattiva.',
    `- Metodo e fonti: ${u(route('method', 'it'))}`,
    '',
    '## Pagine (italiano)',
    '',
    `- [${SITE_NAMES.it}](${u(route('home', 'it'))})`,
    ...PAGES.map((p) => `- [${p.it.h1}](${u(route(p.id, 'it'))}): ${p.it.description}`),
    '',
    '## Pages (English)',
    '',
    `- [Home](${u(route('home', 'en'))})`,
    ...PAGES.map((p) => `- [${p.en.h1}](${u(route(p.id, 'en'))}): ${p.en.description}`),
    '',
  ];
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
