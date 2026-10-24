# Données de Multe e Autovelox (it-multe-autovelox)

Trois sources : le barème des sanctions, relu à la main sur le Codice della Strada ; le registre des
appareils de contrôle de vitesse du ministère des Infrastructures et des Transports (MIT), relu chaque
semaine par un script ; la liste des communes de l'ISTAT. Aucun montant ni aucun nombre d'appareils
n'est écrit à la main dans une page.

## Barème : `src/data/params-2026.json`

- Tranches, montants, points et suspensions de l'excès de vitesse : art. 142 c.7, 8, 9, 9-bis, 11 et 12
  du Codice della Strada (D.Lgs. 285/1992) ; majoration de nuit d'un tiers : art. 195 c.2-bis.
- Tolérance (5 %, au moins 5 km/h) : art. 345 du Regolamento (DPR 495/1992).
- Paiement : art. 202 (−30 % dans les 5 jours, exclu en cas de suspension), art. 203 (moitié du maximum
  si le verbale n'est ni payé ni contesté), art. 204 (au moins le double du minimum si le prefetto rejette).
- Notification : art. 201 (90 jours, 360 pour les résidents à l'étranger) ; recours : art. 203 et 204-bis,
  D.Lgs. 150/2011 art. 7 (giudice di pace : 30 jours, 60 depuis l'étranger).
- Points : art. 126-bis et sa tabella ; réforme : loi n. 177 du 25 novembre 2024. Détecteurs : art. 45
  c.9-bis et 9-ter.

Chaque clé de `sources` porte l'URL Normattiva (textes de loi exclus du droit d'auteur, art. 5
L. 633/1941). Les extraits `verify` sont relus mot pour mot par `scripts/update-data.mjs` (étape Normattiva,
rapport dans `data/law-check.json`) : un écart fait sortir le script en code 2 et le barème ne se
réécrit jamais seul. Les exemples des textes sont rejoués par `src/lib/engine/sanzioni.test.ts`. Un
changement de barème se fait dans le JSON, puis dans les tests, puis `npm run check`. Les montants 2027
(mise à jour biennale ISTAT, art. 195 c.3) ne sont pas encore publiés : le site garde ceux de 2026.

## Registre des autovelox : `scripts/update-data.mjs`

- **Source** : « Lista dispositivi di rilevamento della velocità », velox.mit.gov.it/dispositivi, tenue en
  application du decreto direttoriale n. 367 du 29 septembre 2025 (art. 1 c.3-4) et du decreto
  direttoriale n. 305 du 18 août 2025 (art. 5 c.2). **Licence CC BY 3.0 IT** (Note legali mit.gov.it) :
  réutilisation libre en citant la source et l'adresse, ce que fait chaque page.
- **Accès** : le script lit le point JSON de la table (`/dispositivi/data`, `length=-1`). Le serveur ne
  répondait pas depuis la France le 24 octobre 2026 (délai dépassé). Dans ce cas le script prend la
  dernière capture complète du même point dans la Wayback Machine et la date de la donnée affichée sur
  le site est celle de la capture (aujourd'hui le 22 février 2026, dernière communication d'un organe
  le 21 février 2026). Jamais un autre site comme source.
- **Communes** : ISTAT, « Elenco dei comuni italiani » (**CC BY 4.0**), code cadastral → commune,
  province, région.

```
npm run update-data                            # relevé complet puis fichiers dérivés
node scripts/update-data.mjs --offline         # rejoue les caches de data/raw/
node scripts/update-data.mjs --skip-law        # sans relecture Normattiva
node scripts/build-derived.mjs                 # régénère seulement les fichiers dérivés
```

1. Refuse un registre de moins de 3 000 appareils (téléchargement coupé) : rien n'est écrit.
2. Écrit `src/data/velox/` (meta, comuni, regioni, province, organes provinciaux et autres), un appareil
   partagé par plusieurs codes n'est compté qu'une fois par région.
3. `build-derived.mjs` écrit `src/data/velox/stats.json`, `public/data/comuni.json` (7 896 communes),
   `public/data/velox/<SIGLA>.json` (chargés à la demande par l'outil), `public/data/decreti.json` et
   `src/data/tabella-punti.json`.
4. `tests/data.test.ts` vérifie les totaux (catégories, régions, fichiers par province, communes ISTAT).

Limites dites sur la page Metodo : le type d'appareil est déduit du texte libre écrit par chaque organe
(une partie ne le précise pas) ; la position n'apparaît que si l'organe l'a écrite dans les notes ; le
registre liste ce qui est déclaré, il ne dit pas si un appareil est homologué au sens de la Cassazione.

Automatisation : `.github/workflows/deploy.yml`, chaque lundi à 5 h 20 UTC (relevé, dérivés, tests,
build, publication, recommit des données si elles ont changé).
