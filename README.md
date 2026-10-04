# Fortinet Academy

Version statique en français du site Fortinet Academy, migrée depuis Sitelas le 4 octobre 2026.

Site : https://armani585.github.io/fortinet-academy/

## Contenu

Accueil, parcours, modules, labs, glossaire et FAQ. Le contenu textuel des six pages est repris du manifeste Sitelas. Le site source présente le programme de 21 modules et des cas pratiques ; il ne contient pas encore les cours détaillés, quiz ou environnements de laboratoire. Les anciennes collections du modèle de portfolio, sans rapport avec Fortinet, sont exclues.

La mise en page conserve la palette sombre et rouge du site source. La navigation fonctionne avec des liens HTML, les FAQ utilisent des accordéons natifs, et une recherche locale filtre les modules, labs et termes du glossaire. Aucune dépendance externe, aucun service Sitelas nécessaire au fonctionnement. Le site reste lisible et navigable sans JavaScript.

## Modifier et vérifier

Les textes source se trouvent dans `content/site.json`, la mise en page dans `scripts/build.mjs`, les styles et comportements dans `assets/`.

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

Les valeurs numériques des compteurs n'étant pas présentes dans le manifeste, aucun nombre de leçons n'est inventé. Les 21 modules, trois niveaux et laboratoire final sont déduits des libellés du programme.

Programme indépendant. Les marques Fortinet, FortiGate et FortiOS appartiennent à leurs détenteurs respectifs.
