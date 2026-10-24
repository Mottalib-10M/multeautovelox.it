import { describe, expect, it } from 'vitest';
import { params as p } from './params';
import { calcolaVelocita, riduzione, soglieRilevate, calcolaAltra, puntiCumulati, scadenze } from './sanzioni';

describe('riduzione (art. 345 DPR 495/1992)', () => {
  it('minimo 5 km/h sotto i 100 km/h', () => {
    expect(riduzione(p, 60)).toBe(5);
    expect(riduzione(p, 100)).toBe(5);
  });
  it('5% oltre i 100 km/h', () => {
    expect(riduzione(p, 140)).toBe(7);
    expect(riduzione(p, 157)).toBe(7.85);
  });
  it('pedaggi : 5, 10, 15%', () => {
    expect(riduzione(p, 60, 'pedaggio')).toBe(3);
    expect(riduzione(p, 100, 'pedaggio')).toBe(10);
    expect(riduzione(p, 150, 'pedaggio')).toBe(22.5);
  });
});

describe('art. 142 : fasce, importi, punti', () => {
  it('nessuna infrazione dentro la tolleranza (55 su limite 50)', () => {
    expect(calcolaVelocita(p, { limite: 50, rilevata: 55 }).infrazione).toBe(false);
  });
  it('comma 7 : 42-173 €, 0 punti, sconto 30%', () => {
    const r = calcolaVelocita(p, { limite: 50, rilevata: 62 });
    expect(r.accertata).toBe(57);
    expect(r.band?.id).toBe('c7');
    expect([r.minimo, r.massimo, r.ridotto, r.punti]).toEqual([42, 173, 29.4, 0]);
    expect(r.metaMassimo).toBe(86.5);
  });
  it('comma 8 : 173-694 €, 3 punti', () => {
    const r = calcolaVelocita(p, { limite: 50, rilevata: 75 });
    expect(r.band?.id).toBe('c8');
    expect([r.minimo, r.ridotto, r.punti]).toEqual([173, 121.1, 3]);
  });
  it('comma 9 : sospensione 1-3 mesi, niente sconto', () => {
    const r = calcolaVelocita(p, { limite: 90, rilevata: 145 });
    expect(r.accertata).toBe(137.75);
    expect(r.band?.id).toBe('c9');
    expect(r.ridotto).toBeNull();
    expect(r.sospensione).toEqual({ da: 1, a: 3, unita: 'mesi' });
    expect(r.punti).toBe(6);
  });
  it('comma 9-bis : 845-3382 €, 10 punti, 6-12 mesi', () => {
    const r = calcolaVelocita(p, { limite: 50, rilevata: 120 });
    expect(r.band?.id).toBe('c9bis');
    expect([r.minimo, r.massimo, r.punti]).toEqual([845, 3382, 10]);
  });
  it('limite esatto di fascia : 10 km/h di eccesso resta comma 7', () => {
    expect(calcolaVelocita(p, { limite: 50, rilevata: 65 }).band?.id).toBe('c7');
    expect(calcolaVelocita(p, { limite: 50, rilevata: 66 }).band?.id).toBe('c8');
  });
  it('notte : +1/3 sul minimo e sul ridotto', () => {
    const r = calcolaVelocita(p, { limite: 50, rilevata: 62, notte: true });
    expect(r.minimo).toBe(56);
    expect(r.ridotto).toBe(39.2);
  });
  it('neopatentato : punti raddoppiati', () => {
    expect(calcolaVelocita(p, { limite: 50, rilevata: 75, neopatentato: true }).punti).toBe(6);
  });
  it('recidiva in centro abitato (c.8) : 220-880 € e sospensione 15-30 giorni', () => {
    const r = calcolaVelocita(p, { limite: 50, rilevata: 75, recidivaCentroAbitato: true });
    expect([r.minimo, r.massimo, r.ridotto]).toEqual([220, 880, null]);
    expect(r.sospensione).toEqual({ da: 15, a: 30, unita: 'giorni' });
  });
  it('veicolo pesante (c.11) : sanzioni raddoppiate', () => {
    const r = calcolaVelocita(p, { limite: 80, rilevata: 100, veicoloPesante: true });
    expect(r.minimo).toBe(346);
  });
  it('soglie per un limite di 50', () => {
    const s = soglieRilevate(p, 50);
    expect(s.map((x) => [x.band, x.finoA])).toEqual([['nessuna', 55], ['c7', 65], ['c8', 95], ['c9', 115], ['c9bis', Infinity]]);
  });
});

describe('altre infrazioni', () => {
  it('cellulare : 250 €, 5 punti, sospensione quindi niente sconto', () => {
    const r = calcolaAltra(p, 'cellulare');
    expect([r.minimo, r.ridotto, r.punti]).toEqual([250, null, 5]);
    expect(calcolaAltra(p, 'cellulare', { recidiva: true }).punti).toBe(10);
  });
  it('cintura : 83 €, 58,10 € in 5 giorni, 5 punti', () => {
    const r = calcolaAltra(p, 'cintura');
    expect([r.minimo, r.ridotto, r.punti]).toEqual([83, 58.1, 5]);
  });
  it('semaforo rosso di notte : 222,67 €', () => {
    expect(calcolaAltra(p, 'semaforo_rosso', { notte: true }).minimo).toBe(222.67);
  });
  it('cumulo : massimo 15 punti senza sospensione', () => {
    expect(puntiCumulati(p, [10, 5, 3])).toBe(15);
    expect(puntiCumulati(p, [10, 5, 3], true)).toBe(18);
  });
});

describe('scadenze', () => {
  it('notifica oltre 90 giorni', () => {
    const s = scadenze(p, '2026-06-01', '2026-09-15');
    expect(s.limiteNotifica).toBe('2026-08-30');
    expect(s.notificaOltreTermine).toBe(true);
    expect(s.pagamentoRidottoEntro).toBe('2026-09-20');
    expect(s.ricorsoGiudiceEntro).toBe('2026-10-15');
    expect(s.ricorsoPrefettoEntro).toBe('2026-11-14');
  });
  it('residente all\'estero : 360 giorni per la notifica, 60 per il giudice di pace', () => {
    const s = scadenze(p, '2026-01-10', '2026-09-15', true);
    expect(s.notificaOltreTermine).toBe(false);
    expect(s.limiteNotifica).toBe('2027-01-05');
    expect(s.ricorsoGiudiceEntro).toBe('2026-11-14');
  });
});
