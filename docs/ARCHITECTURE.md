# Architecture — Programme muscu (PWA hors ligne)

## 1. Besoins

**Fonctionnels**
- Suivre les séances du programme Haut/Bas ×2 : saisie des séries, minuteur de repos, suggestion de charge (double progression), variantes si une machine est prise.
- Enregistrer les courses (facile / fractionné) et le poids de corps.
- Consulter une bibliothèque d'exercices avec photos, points clés et variantes.
- Voir la progression : séries par muscle et par semaine, 1RM estimé, records.

**Non fonctionnels**
- **100 % hors ligne** après la première ouverture (salle en sous-sol, pas de réseau).
- Installable sur l'écran d'accueil (iPhone et Android), ouverture instantanée.
- Zéro serveur, zéro compte, zéro coût d'hébergement.
- Données privées : rien ne quitte le téléphone.

**Contraintes**
- Un seul utilisateur, un seul appareil principal.
- Maintenance par une personne, sans étape de build obligatoire.

## 2. Vue d'ensemble

```
            GitHub Pages (fichiers statiques)
                         │  1re visite uniquement
                         ▼
┌──────────────────── Téléphone ─────────────────────┐
│  Service worker (sw.js)                            │
│   └─ Cache Storage « muscu-<version> »             │
│       index.html · css · js · 170 images · polices │
│                         │ cache d'abord            │
│                         ▼                          │
│  App (index.html + modules ES)                     │
│   ├─ program.js  données du programme (statique)   │
│   ├─ library.js  85 exercices + images (généré)    │
│   ├─ store.js    logique métier + persistance      │
│   └─ app.js      interface, événements, minuteur   │
│                         │                          │
│                         ▼                          │
│  localStorage : état (séances, courses, poids)     │
│                 + brouillon de la séance en cours  │
└────────────────────────────────────────────────────┘
        ▲                                   │
        └──── import JSON ── export JSON ───┘   (sauvegarde manuelle)
```

## 3. Détails

### Modèle de données (`localStorage["muscu-state-v1"]`)
```js
{
  v: 1, updated: <ms>, lastBackup: <ms>,
  settings: { start: "AAAA-MM-JJ", age, rhr, hrm },
  sessions: [{ id, date, type: "UA|LA|UB|LB", min,
               sets: { <exId>: [{ w, r, done }] },
               variants: { <exId>: <libId> } }],
  runs:     [{ id, date, kind: "EZ|IN", min, km, hr, note }],
  weights:  [{ date, kg }]
}
```
La séance en cours vit dans un brouillon séparé (`muscu-draft-v1`), écrit à chaque saisie : fermer l'app au milieu d'une séance ne perd rien.

### Mise en cache
- À l'installation, le service worker met en cache **toute** la liste générée par `scripts/build.py` (~185 fichiers, ~3,5 Mo).
- Stratégie **cache d'abord** : aucune requête réseau à la salle.
- La version du cache est l'empreinte SHA-256 du contenu : toute modification publiée change `sw.js`, le téléphone télécharge la nouvelle version en arrière-plan et affiche « Mise à jour prête ».

### Logique métier (store.js, sans DOM)
- **Semaine du cycle** : `(date − début) / 7 mod 6` ; la semaine 6 est un deload (séries ÷ 2).
- **Suggestion** : dernière séance avec le même exercice (et la même variante si choisie). Toutes les séries au haut de la fourchette → charge + pas (2,5 / 5 / 2 kg), sinon même charge.
- **1RM estimé** : Epley, `w × (1 + r/30)`.
- **Volume** : séries fractionnées (direct = 1, indirect = 0,5).

## 4. Échelle et fiabilité

| Risque | Parade |
|---|---|
| iOS efface le stockage d'un site non installé après 7 jours sans visite | Installer sur l'écran d'accueil (exempté) + `navigator.storage.persist()` |
| Perte ou changement de téléphone | Export JSON (fichier ou copie), rappel automatique après 14 jours sans sauvegarde |
| Stockage | Une séance ≈ 1 Ko → 10 ans ≈ 2 Mo, sous la limite de 5 Mo de localStorage |
| Mise à jour cassée | Le cache précédent n'est supprimé qu'après activation complète de la nouvelle version |

## 5. Compromis

| Choix | Pourquoi | Ce qu'on perd |
|---|---|---|
| HTML/JS sans framework ni build | Lisible, modifiable depuis GitHub, aucune dépendance à maintenir | Pas de typage, rendu par `innerHTML` (valeurs échappées) |
| localStorage plutôt qu'IndexedDB | API simple et synchrone, volume faible | Limite de 5 Mo, pas de requêtes |
| Pas de synchronisation cloud | Zéro serveur, données privées | Un appareil à la fois, sauvegarde manuelle |
| Images JPEG → WebP 520 px | 12 Mo → 3,3 Mo, tout tient dans le cache | Pas de vraies vidéos (2 photos qui alternent) |
| GitHub Pages | Gratuit, HTTPS (obligatoire pour une PWA) | Le dépôt doit être public sur un compte gratuit |

## 6. À revoir si l'app grandit

- **Synchronisation multi-appareils** : table Supabase `sessions` (stack déjà connue) avec synchronisation dernier-écrit-gagne, ou export automatique vers Google Drive.
- **Vraies vidéos** : clips MP4 courts tournés soi-même, mis en cache à la demande plutôt qu'à l'installation.
- **IndexedDB** si l'historique dépasse quelques années ou si on stocke des photos de progression.
- **Programmes multiples** : sortir `program.js` en JSON éditable dans l'app.
