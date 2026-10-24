/**
 * Attribuzioni richieste dalle licenze (audit dati e diritti del 2026-10-24), in fondo a ogni pagina,
 * widget compresi: registro MIT (CC BY 3.0 IT), copia Internet Archive con il suo URL, comuni ISTAT
 * (CC BY 4.0), elaborazioni Radif Partners. La data e l'origine vengono da src/data/velox/meta.json.
 */
import meta from '../data/velox/meta.json';

const CC_BY_3_IT = 'https://creativecommons.org/licenses/by/3.0/it/legalcode';
const CC_BY_4 = 'https://creativecommons.org/licenses/by/4.0/deed.it';
const MIT_LISTA = 'https://velox.mit.gov.it/dispositivi';
const ISTAT = 'https://www.istat.it/classificazione/codici-dei-comuni-delle-province-e-delle-regioni/';

const a = (href: string, t: string) => `<a href="${href}" rel="noopener" target="_blank">${t}</a>`;
const dataIt = (iso: string) => { const [y, m, d] = iso.slice(0, 10).split('-'); return `${d}/${m}/${y}`; };

export function licenzeHtml(lang: 'it' | 'en'): string {
  const wb = meta.origine === 'wayback';
  const giorno = dataIt(meta.catturato_il);
  if (lang === 'it') {
    const copia = wb
      ? `copia archiviata da Internet Archive (Wayback Machine) il ${giorno}: ${a(meta.wayback_url, 'URL della cattura')}`
      : `letto direttamente il ${giorno}`;
    return `<p>Registro autovelox: Ministero delle infrastrutture e dei trasporti, «Lista dispositivi di rilevamento della velocità» (${a(MIT_LISTA, 'velox.mit.gov.it')}), ${copia}. Licenza ${a(CC_BY_3_IT, 'CC BY 3.0 IT')}. Comuni: ISTAT, ${a(ISTAT, 'Elenco dei comuni italiani')}, licenza ${a(CC_BY_4, 'CC BY 4.0')}. Dati adattati: abbinamenti, conteggi e calcoli di Radif Partners.</p>`;
  }
  const copy = wb
    ? `copy archived by the Internet Archive (Wayback Machine) on ${giorno}: ${a(meta.wayback_url, 'capture URL')}`
    : `read directly on ${giorno}`;
  return `<p>Speed-camera register: Ministero delle infrastrutture e dei trasporti, “Lista dispositivi di rilevamento della velocità” (${a(MIT_LISTA, 'velox.mit.gov.it')}), ${copy}. Licence ${a(CC_BY_3_IT, 'CC BY 3.0 IT')}. Comuni: ISTAT, ${a(ISTAT, 'Elenco dei comuni italiani')}, licence ${a(CC_BY_4, 'CC BY 4.0')}. Adapted data: matching, counts and calculations by Radif Partners.</p>`;
}
