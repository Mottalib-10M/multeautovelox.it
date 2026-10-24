/** Règles 2026 du site, lues une seule fois depuis `data/params-2026.json` (RECETTE §4). */
import raw from '../../data/params-2026.json';
import type { Params as EngineParams } from './sanzioni';
export const P = raw;
export type Params = typeof raw;
export type SourceKey = keyof typeof raw.sources;
/** Vue typée pour le moteur (fonctions pures de sanzioni.ts). */
export const params = raw as unknown as EngineParams;
