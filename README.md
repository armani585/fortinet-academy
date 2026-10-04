# Fortinet Academy

Version statique en français du site Fortinet Academy, migrée depuis Sitelas le 4 octobre 2026.

Site : https://armani585.github.io/fortinet-academy/

## Contenu

Accueil, parcours, modules, labs, glossaire et FAQ, enrichis de **21 modules, 63 leçons courtes, 63 questions corrigées et 8 labs guidés**. Chaque module propose objectifs, prérequis, repères GUI/CLI, exemple, exercice et correction. Les références Fortinet et différences de version sont indiquées dans les cours. Les anciennes collections du modèle de portfolio, sans rapport avec Fortinet, sont exclues.

Les labs sont des procédures à reproduire dans son propre environnement ou des dossiers fictifs explicitement identifiés. Le site n'émule pas FortiOS. Les commandes n'ont pas été validées sur un équipement physique lors de la création ; vérifier build, modèle, licences et syntaxe avant manipulation. Il s'agit d'un entraînement indépendant, pas d'un examen de certification officiel.

Lecture déclarée et dernier score des quiz sont enregistrés séparément dans le navigateur. Pas de compte ni de synchronisation, pas de sauvegarde des réponses ou notes saisies. La remise à zéro se trouve dans Parcours. Les activités restent utilisables si le stockage est indisponible.

La mise en page conserve la palette sombre et rouge du site source. La navigation fonctionne avec des liens HTML, les FAQ utilisent des accordéons natifs, et une recherche locale filtre les modules, labs et termes du glossaire. Aucune dépendance externe, aucun service Sitelas nécessaire au fonctionnement. Le site reste lisible et navigable sans JavaScript.

## Modifier et vérifier

Les textes de présentation se trouvent dans `content/site.json`, les cours/quiz dans `content/courses.mjs`, les labs dans `content/labs.mjs`. Les générateurs sont `scripts/build.mjs` et `scripts/learning.mjs`, les styles et comportements sont dans `assets/`.

Avec Node.js installé :

```sh
npm run build
npm run check
```

Les fichiers HTML générés sont versionnés. Pour consulter le site, servir la racine avec n'importe quel serveur statique. Les liens relatifs fonctionnent sous le sous-chemin GitHub Pages et à la racine d'un autre hébergement.

## GitHub Pages

Dans Settings → Pages, sélectionner « Deploy from a branch », la branche `main` et le dossier `/ (root)`, puis enregistrer. Le fichier `.nojekyll` permet de servir directement les fichiers statiques. Chaque modification des fichiers HTML sur `main` déclenche la republication.

## Provenance

Source : https://preview-fortinet-academy-2195.sitelas.com/

Le contenu de présentation provient du site Sitelas. Les leçons, exercices, questions et corrigés ont été rédigés pour cette version. Les compteurs correspondent désormais aux contenus réellement livrés. La validation automatisée parcourt les 35 pages, leurs liens, ancres, titres et données de quiz.

Programme indépendant. Les marques Fortinet, FortiGate et FortiOS appartiennent à leurs détenteurs respectifs.
