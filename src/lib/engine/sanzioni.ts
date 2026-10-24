// Moteur des sanctions pour excès de vitesse et infractions courantes (Italie).
// Fonctions pures : aucune valeur en dur, tout vient de src/data/params-2026.json (voir params.ts).
// Références : art. 142, 195, 201, 202, 203 CdS ; art. 345 DPR 495/1992 ; tableau de l'art. 126-bis ;
// art. 7 D.Lgs. 150/2011. Montants en euros, arrondis au centime à l'affichage seulement.

export type Band = {
  id: string; ref: string; over_kmh_max: number | null; min: number; max: number; points: number;
  suspension: { from_months: number; to_months: number } | null;
};

export type Params = {
  tolerance: { percent: number; min_kmh: number };
  tolerance_pedaggio: { bands: { below_kmh: number | null; percent: number }[] };
  speeding: {
    bands: Band[];
    repeat_in_town_c8: { min: number; max: number; suspension_days: { from: number; to: number } };
    heavy_vehicles_doubling: { factor: number };
  };
  night_surcharge: { factor: number; from_hour: number; to_hour: number };
  payment: { reduction: number; reduced_within_days: number; within_days_minimum: number };
  unpaid: { fraction_of_max: number };
  notification: { days: number; days_abroad: number };
  appeal: { prefetto: { days: number }; giudice_di_pace: { days: number; days_abroad: number } };
  points: { initial: number; max_simultaneous: number; neopatentato_doubling: { years: number; factor: number } };
  other_violations: OtherViolation[];
};

export type OtherViolation = {
  id: string; ref: string; min: number; max: number; points: number; night?: boolean; min_moto?: number; max_moto?: number;
  suspension_days?: { from: number; to: number }; suspension_months?: { from: number; to: number };
  repeat?: { min: number; max: number; points: number; suspension_months?: { from: number; to: number } };
};

/** Méthode de mesure : appareil (autovelox, telelaser, tutor) ou temps entre deux péages. */
export type Metodo = 'dispositivo' | 'pedaggio';

export type SpeedInput = {
  limite: number;            // km/h, limite du tronçon
  rilevata: number;          // km/h, vitesse mesurée imprimée sur le verbal
  metodo?: Metodo;
  notte?: boolean;           // entre 22 h et 7 h (art. 195 c.2-bis)
  neopatentato?: boolean;    // permis B depuis moins de 3 ans (tableau art. 126-bis, dernière phrase)
  veicoloPesante?: boolean;  // catégories b, e, f, g, h, i, l de l'art. 142 c.3 (c.11 : sanctions doublées)
  recidivaCentroAbitato?: boolean; // 2e infraction c.8 en agglomération dans l'année (c.8, 2e phrase)
};

export type SpeedResult = {
  infrazione: boolean;
  riduzioneKmh: number;      // tolérance appliquée
  accertata: number;         // vitesse retenue
  eccesso: number;           // km/h au-dessus de la limite, après tolérance
  band: Band | null;
  minimo: number;            // montant à payer dans les 60 jours (minimum édictal, majorations comprises)
  massimo: number;
  ridotto: number | null;    // paiement sous 5 jours (-30 %), null si exclu (suspension)
  metaMassimo: number;       // si ni paiement ni recours : moitié du maximum (art. 203 c.3)
  punti: number;
  sospensione: { da: number; a: number; unita: 'giorni' | 'mesi' } | null;
};

const r2 = (x: number) => Math.round(x * 100) / 100;

/** Réduction de mesure : 5 % avec un minimum de 5 km/h (appareil) ; 5/10/15 % selon la vitesse (péages). */
export function riduzione(p: Params, rilevata: number, metodo: Metodo = 'dispositivo'): number {
  if (metodo === 'pedaggio') {
    const b = p.tolerance_pedaggio.bands.find((x) => x.below_kmh === null || rilevata < x.below_kmh)!;
    return r2(rilevata * b.percent);
  }
  return r2(Math.max(p.tolerance.min_kmh, rilevata * p.tolerance.percent));
}

export function bandFor(p: Params, eccesso: number): Band | null {
  if (eccesso <= 0) return null;
  return p.speeding.bands.find((b) => b.over_kmh_max === null || eccesso <= b.over_kmh_max) ?? null;
}

export function calcolaVelocita(p: Params, i: SpeedInput): SpeedResult {
  const rid = riduzione(p, i.rilevata, i.metodo);
  const accertata = r2(i.rilevata - rid);
  const eccesso = r2(accertata - i.limite);
  const band = bandFor(p, eccesso);
  const empty: SpeedResult = { infrazione: false, riduzioneKmh: rid, accertata, eccesso, band: null, minimo: 0, massimo: 0, ridotto: null, metaMassimo: 0, punti: 0, sospensione: null };
  if (!band) return empty;

  let min = band.min, max = band.max;
  let sosp: SpeedResult['sospensione'] = band.suspension ? { da: band.suspension.from_months, a: band.suspension.to_months, unita: 'mesi' } : null;
  if (band.id === 'c8' && i.recidivaCentroAbitato) {
    const r = p.speeding.repeat_in_town_c8;
    min = r.min; max = r.max;
    sosp = { da: r.suspension_days.from, a: r.suspension_days.to, unita: 'giorni' };
  }
  let mult = 1;
  if (i.veicoloPesante) {
    mult *= p.speeding.heavy_vehicles_doubling.factor;
    if (sosp) sosp = { ...sosp, da: sosp.da * p.speeding.heavy_vehicles_doubling.factor, a: sosp.a * p.speeding.heavy_vehicles_doubling.factor };
  }
  if (i.notte) mult *= p.night_surcharge.factor;
  const minimo = r2(min * mult), massimo = r2(max * mult);
  const ridotto = sosp ? null : r2(minimo * (1 - p.payment.reduction));
  let punti = band.points;
  if (i.neopatentato) punti *= p.points.neopatentato_doubling.factor;
  return {
    infrazione: true, riduzioneKmh: rid, accertata, eccesso, band, minimo, massimo, ridotto,
    metaMassimo: r2(massimo * p.unpaid.fraction_of_max), punti, sospensione: sosp,
  };
}

/** Vitesse mesurée maximale (km/h entiers) avant de passer à la tranche suivante, pour une limite donnée. */
export function soglieRilevate(p: Params, limite: number, metodo: Metodo = 'dispositivo'): { band: string; finoA: number }[] {
  const out: { band: string; finoA: number }[] = [];
  let v = limite;
  let prev: string | null = null;
  for (let s = limite; s <= limite + 200; s++) {
    const b = bandFor(p, r2(s - riduzione(p, s, metodo) - limite));
    const id = b ? b.id : 'nessuna';
    if (prev !== null && id !== prev) out.push({ band: prev, finoA: v });
    prev = id; v = s;
  }
  if (prev) out.push({ band: prev, finoA: Infinity });
  return out;
}

/** Autres infractions : montant, réduction, points, suspension. */
export function calcolaAltra(p: Params, id: string, o: { notte?: boolean; neopatentato?: boolean; recidiva?: boolean; moto?: boolean } = {}) {
  const v = p.other_violations.find((x) => x.id === id);
  if (!v) throw new Error(`infrazione sconosciuta : ${id}`);
  const rep = o.recidiva && v.repeat ? v.repeat : null;
  const base = rep ?? (o.moto && v.min_moto !== undefined ? { min: v.min_moto, max: v.max_moto! } : v);
  const mult = o.notte && v.night ? p.night_surcharge.factor : 1;
  const minimo = r2(base.min * mult), massimo = r2(base.max * mult);
  const hasSusp = !!(rep?.suspension_months ?? v.suspension_days ?? v.suspension_months);
  let punti = rep ? rep.points : v.points;
  if (o.neopatentato) punti *= p.points.neopatentato_doubling.factor;
  const sosp = rep?.suspension_months ? { da: rep.suspension_months.from, a: rep.suspension_months.to, unita: 'mesi' as const }
    : v.suspension_days ? { da: v.suspension_days.from, a: v.suspension_days.to, unita: 'giorni' as const }
    : v.suspension_months ? { da: v.suspension_months.from, a: v.suspension_months.to, unita: 'mesi' as const } : null;
  return { ref: v.ref, minimo, massimo, ridotto: hasSusp ? null : r2(minimo * (1 - p.payment.reduction)), metaMassimo: r2(massimo * p.unpaid.fraction_of_max), punti, sospensione: sosp, notturna: mult > 1 };
}

/** Plusieurs infractions retenues ensemble : au plus 15 points, sauf si l'une entraîne suspension ou révocation (art. 126-bis c.1-bis). */
export function puntiCumulati(p: Params, punti: number[], conSospensione = false): number {
  const tot = punti.reduce((a, b) => a + b, 0);
  return conSospensione ? tot : Math.min(tot, p.points.max_simultaneous);
}

// ---------- dates ----------

const DAY = 86400000;
const toUTC = (iso: string) => { const [y, m, d] = iso.split('-').map(Number); return Date.UTC(y, m - 1, d); };
const fromUTC = (t: number) => new Date(t).toISOString().slice(0, 10);
export const addDays = (iso: string, n: number) => fromUTC(toUTC(iso) + n * DAY);
export const daysBetween = (a: string, b: string) => Math.round((toUTC(b) - toUTC(a)) / DAY);

/**
 * Délais à partir de la date de l'infraction et de celle de la notification du verbal.
 * Le calcul suit le calendrier civil ; le report d'une échéance tombant un jour férié n'est pas appliqué
 * (à signaler à l'utilisateur).
 */
export function scadenze(p: Params, dataInfrazione: string, dataNotifica: string, residenteEstero = false) {
  const ritardo = daysBetween(dataInfrazione, dataNotifica);
  const termine = residenteEstero ? p.notification.days_abroad : p.notification.days;
  return {
    giorniTraInfrazioneENotifica: ritardo,
    notificaOltreTermine: ritardo > termine,
    limiteNotifica: addDays(dataInfrazione, termine),
    pagamentoRidottoEntro: addDays(dataNotifica, p.payment.reduced_within_days),
    pagamentoMinimoEntro: addDays(dataNotifica, p.payment.within_days_minimum),
    ricorsoPrefettoEntro: addDays(dataNotifica, p.appeal.prefetto.days),
    ricorsoGiudiceEntro: addDays(dataNotifica, residenteEstero ? p.appeal.giudice_di_pace.days_abroad : p.appeal.giudice_di_pace.days),
  };
}

// ---------- vitesse moyenne, limites, points ----------

/** Vitesse moyenne entre deux portiques (Tutor, Vergilius…) : distance en km, temps en secondes. */
export function velocitaMedia(km: number, secondi: number): number {
  if (secondi <= 0) return 0;
  return r2((km / secondi) * 3600);
}

export type Strada = 'autostrada' | 'extraurbana_principale' | 'extraurbana_secondaria' | 'urbana';
export type Limits = { autostrada: number; extraurbana_principale: number; extraurbana_secondaria: number; urbana: number; pioggia: { autostrada: number; extraurbana_principale: number }; neopatentati: { autostrada: number; extraurbana_principale: number } };
/** Limite générale de l'art. 142 c.1 (pluie : 110 et 90) et de l'art. 117 c.2 (trois premières années : 100 et 90). */
export function limiteGenerale(L: Limits, strada: Strada, pioggia = false, neopatentato = false): number {
  let v = L[strada];
  if (pioggia && (strada === 'autostrada' || strada === 'extraurbana_principale')) v = Math.min(v, L.pioggia[strada]);
  if (neopatentato && (strada === 'autostrada' || strada === 'extraurbana_principale')) v = Math.min(v, L.neopatentati[strada]);
  return v;
}

/** Plusieurs excès relevés par le même organe, sur ses routes, en moins d'une heure (art. 142 c.6-ter) :
 *  la sanction la plus grave augmentée d'un tiers, si c'est plus favorable que la somme. */
export function plurimeUnOra(p: Params & { speeding: { plurime_un_ora: { factor: number } } }, minimi: number[]) {
  if (!minimi.length) return { somma: 0, cumulo: 0, applicato: 0 };
  const somma = r2(minimi.reduce((a, b) => a + b, 0));
  const cumulo = r2(Math.max(...minimi) * p.speeding.plurime_un_ora.factor);
  return { somma, cumulo, applicato: minimi.length > 1 ? Math.min(somma, cumulo) : somma };
}

/**
 * Solde de points après une ou plusieurs décurtations (art. 126-bis).
 * `attuali` : solde lu sur le Portale dell'automobilista ; `tolti` : points de la nouvelle infraction
 * (déjà doublés pour un néopatenté). Le plafond de 15 points vaut pour les infractions relevées ensemble.
 */
export function saldoPunti(p: Params, attuali: number, tolti: number) {
  const nuovo = attuali - tolti;
  return { nuovo: Math.max(0, nuovo), azzerato: nuovo <= 0, revisione: nuovo <= 0 };
}
