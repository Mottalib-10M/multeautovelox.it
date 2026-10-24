import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import stats from '../src/data/velox/stats.json';
import tabella from '../src/data/tabella-punti.json';
import params from '../src/data/params-2026.json';

describe('registro MIT (copia usata dal sito)', () => {
  const m = stats.meta;
  it('almeno 3 000 apparecchi, data della copia leggibile', () => {
    expect(m.dispositivi_totali).toBeGreaterThanOrEqual(3000);
    expect(m.catturato_il).toMatch(/^\d{4}-\d{2}-\d{2}/);
    expect(m.licenza).toContain('CC BY 3.0 IT');
  });
  it('categorie per tipo : la somma fa il totale (i non attivi sono un segnale a parte)', () => {
    const { totale, segnalati_non_attivi, ...c } = m.per_categoria;
    expect(segnalati_non_attivi).toBeLessThan(totale);
    expect(Object.values(c).reduce((a, b) => a + b, 0)).toBe(totale);
  });
  it('regioni : ogni apparecchio abbinato contato una volta', () => {
    expect(stats.regioni.length).toBe(20);
    expect(stats.regioni.reduce((a, r) => a + r.totale, 0)).toBe(m.dispositivi_abbinati);
  });
  it('un file per provincia con apparecchi', () => {
    const files = readdirSync('public/data/velox').filter((f) => /^[A-Z]{2}\.json$/.test(f));
    const conApparecchi = stats.province.filter((p) => p.totale > 0).length;
    expect(files.length).toBeGreaterThanOrEqual(conApparecchi);
  });
  it('indice dei comuni : tutti i comuni ISTAT', () => {
    const comuni = JSON.parse(readFileSync('public/data/comuni.json', 'utf8'));
    expect(comuni.length).toBe(m.comuni_istat);
  });
});

describe('tabella dei punti (art. 126-bis)', () => {
  it('almeno 80 righe, punti tra 1 e 10', () => {
    expect(tabella.righe.length).toBeGreaterThanOrEqual(80);
    for (const r of tabella.righe) {
      expect(r.punti).toBeGreaterThanOrEqual(1);
      expect(r.punti).toBeLessThanOrEqual(10);
    }
  });
  it('velocità : art. 142 c.9-bis toglie 10 punti', () => {
    const r = tabella.righe.find((x) => x.articolo === '142' && /9-bis/i.test(x.comma));
    expect(r?.punti).toBe(10);
  });
});

describe('fonti del barème', () => {
  it('ogni fonte ha un URL ufficiale', () => {
    for (const [k, s] of Object.entries(params.sources as Record<string, { url: string }>)) {
      expect(s.url, k).toMatch(/^https:\/\/(www\.)?(normattiva\.it|gazzettaufficiale\.it|mit\.gov\.it|velox\.mit\.gov\.it|istat\.it|poliziadistato\.it)/);
    }
  });
});
