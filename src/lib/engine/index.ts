/** Moteur lié aux paramètres 2026 : les pages et les outils appellent ces fonctions, jamais un second calcul. */
import { P, params } from './params';
import * as S from './sanzioni';
export type { SpeedInput, SpeedResult, Band, Metodo, Strada } from './sanzioni';
export { addDays, daysBetween, velocitaMedia } from './sanzioni';
export const velocita = (i: S.SpeedInput) => S.calcolaVelocita(params, i);
export const riduzione = (rilevata: number, metodo: S.Metodo = 'dispositivo') => S.riduzione(params, rilevata, metodo);
export const fascia = (eccesso: number) => S.bandFor(params, eccesso);
export const soglie = (limite: number, metodo: S.Metodo = 'dispositivo') => S.soglieRilevate(params, limite, metodo);
export const altra = (id: string, o: Parameters<typeof S.calcolaAltra>[2] = {}) => S.calcolaAltra(params, id, o);
export const cumulati = (punti: number[], conSospensione = false) => S.puntiCumulati(params, punti, conSospensione);
export const scadenze = (infrazione: string, notifica: string, estero = false) => S.scadenze(params, infrazione, notifica, estero);
export const limite = (strada: S.Strada, pioggia = false, neo = false) => S.limiteGenerale(P.limits as unknown as S.Limits, strada, pioggia, neo);
export const plurime = (minimi: number[]) => S.plurimeUnOra(params as never, minimi);
export const saldo = (attuali: number, tolti: number) => S.saldoPunti(params, attuali, tolti);
/** Vitesse lue minimale (km/h entiers) pour qu'une vitesse retenue atteigne `accertata` : utile aux seuils. */
export function rilevataPer(accertataMin: number, metodo: S.Metodo = 'dispositivo'): number {
  for (let v = Math.floor(accertataMin); v < accertataMin + 60; v++) if (v - S.riduzione(params, v, metodo) >= accertataMin) return v;
  return accertataMin;
}
/** Première vitesse lue (entière) qui fait entrer dans une tranche : excès retenu strictement supérieur à `oltre`. */
export function primaRilevataOltre(limite: number, oltre: number, metodo: S.Metodo = 'dispositivo'): number {
  for (let v = limite; v < limite + 400; v++) if (v - S.riduzione(params, v, metodo) - limite > oltre) return v;
  return limite + oltre;
}
