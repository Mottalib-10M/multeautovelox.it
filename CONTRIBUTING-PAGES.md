# Ajouter ou modifier une page de Multe e Autovelox (it-multe-autovelox)

À lire avec `~/Documents/GitHub/RECETTE-SITE.md` §6 (unicité), §7 (FAQ), §9 (écriture), §9.3
(mini-simulateurs), §11 (titres), §21 (bloc citable). Éditeur : Radif Partners. Aucun lien vers un
avocat, une agence de recours, un assureur, une application ni un autre site du portefeuille. Le site ne
se présente jamais comme le Ministero, la Polizia ni une prefettura, et n'utilise aucun logo officiel.

## Une page = un fichier

- `src/content/pagine/<id>.ts`, avec `defineGuide`. Outil principal dans `tool` :
  `'velocita' | 'velox' | 'mappa' | 'punti' | 'altre' | 'scadenze'`, réglages dans `outil`
  (ex. `{ defaultComune: 'F205' }`, `{ defaultRegione: 'Lombardia' }`).
- Le fichier porte les deux langues (`it`, `en`) : slug, nav, card, title (50–60 car., terme-clé en tête,
  jamais le pays, un mot d'outil ni une question en tête), description (150–160 car.), h1, intro,
  `resume(h)` (un paragraphe ≥ 120 mots), `faqs(h)` (3 à 5 questions uniques sur tout le site, réponses
  de 40 à 90 mots), `body(h)`.
- L'accueil (page pilier, 6 à 8 FAQ) est dans `src/content/home.ts`. Pages de service : `src/pages/it/`
  (écrites à la main, `gen-legal-pages.py` ne connaît pas l'italien) et `src/pages/en/`.
- Le cœur (routes, menus, sitemap, hreflang, schémas) lit ces fichiers seul. Plafond : 100 pages HTML.

## Aucun chiffre en dur

Montants, points, délais et limites viennent de `h.P` (`src/data/params-2026.json`) et du moteur `h.M`
(`src/lib/engine/`) ; le registre de `h.S` (`src/data/velox/stats.json`) et `src/content/lib/velox.ts` ;
le tableau des points de `h.TP`. La date de la copie du registre est `h.reg`, à afficher sur toute page
qui cite le registre. Formats : `h.eur`, `h.num`, `h.pct`, `h.date` ; liens internes `h.a(id, texte)`,
sources `h.src(clé)`. Pas de tiret cadratin.

## Mini-simulateurs

`<!--mini:KIND-->` dans le corps. Disponibles (`src/lib/minis/`) : eccesso, tolleranza, tutor, notturna,
neopatentato, saldo, cumulo, ridotto, nonpagata, scadenze, infrazione, limiti, velox, plurime.

## Contrôles

`npm run check` (build, tests, typographie, légal, SEO, unicité, trame, liens, layout, sources,
simulateurs, hreflang, anglais, portefeuille, cookies, URL, premier écran), plus
`python3 scripts/check-regles.py .`, `node scripts/check-contraste.mjs .`,
`node scripts/check-saisie.mjs . --max=60`, `node scripts/check-nombres.mjs .`.
Les contrôles qui lancent Playwright passent sous le verrou `~/Documents/GitHub/.playwright.lock`.
