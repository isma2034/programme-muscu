# Programme muscu

App de suivi pour mon programme **Haut/Bas ×2 + 2 courses**, installable sur le téléphone et utilisable **sans réseau**.

- Séance du jour avec photos de l'exercice, points clés et variantes si la machine est prise.
- Saisie en un geste (boutons + / −), charge proposée en double progression, minuteur de repos automatique, écran qui reste allumé.
- Bibliothèque de 85 exercices (30 du programme + 2 variantes chacun) avec photos hors ligne.
- Progrès : séries par muscle et par semaine, 1RM estimé, records. Suivi du poids et des courses.
- Toutes les données restent sur le téléphone. Sauvegarde et restauration en fichier JSON.

## Installer sur le téléphone

1. Ouvre l'adresse GitHub Pages du dépôt (Settings → Pages).
2. **iPhone** : Safari → Partager → « Sur l'écran d'accueil ». **Android** : Chrome → ⋮ → « Installer l'application ».
3. Ouvre l'app une fois avec du réseau : tout est mis en cache. Ensuite, plus besoin de connexion.

## Modifier le programme

- Exercices, séries, fourchettes : `js/program.js`.
- Variantes et images : `scripts/exercise_map.json`, puis `python3 scripts/build_exercises.py <chemin de free-exercise-db>`.
- **Après toute modification** : `python3 scripts/build.py` (régénère `sw.js` pour que le téléphone récupère la mise à jour).

Tester en local : `python3 -m http.server` puis http://localhost:8000.

## Structure

```
index.html              coquille de l'app
css/app.css             styles
js/program.js           programme (séances, exercices, cycle)
js/store.js             données et logique (progression, records, volume)
js/app.js               interface
js/library.js           bibliothèque d'exercices (généré)
img/<exercice>/0|1.webp photos (généré)
sw.js                   service worker (généré depuis sw.template.js)
docs/ARCHITECTURE.md    choix techniques et compromis
```

## Crédits

- Photos et instructions : [free-exercise-db](https://github.com/yuhonas/free-exercise-db), domaine public (Unlicense).
- Polices Barlow et Barlow Condensed : SIL Open Font License (`fonts/LICENSE-OFL.txt`).
- Programme fondé sur les méta-analyses récentes (volume, proximité de l'échec, repos, entraînement concurrent) ; sources dans l'onglet Plus.
