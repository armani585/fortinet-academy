# Reprendre le projet

Pull request de livraison : https://github.com/armani585/fortinet-academy/pull/1 (ouverte, non fusionnée lors de la livraison).

1. Lire PROJECT_CONTEXT.md et DECISIONS.md. Le cahier des charges complet est aussi résumé dans README.md.
2. Dépôt : `armani585/fortinet-academy`, branche `codex/fortinet-academy-interactive-v1`, application dans `v1/`. Consulter le diff et l’état GitHub avant tout changement ; ne pas supposer la pull request fusionnée.
3. Localement, le dossier livré est autonome : lancer `npm start`, ouvrir http://127.0.0.1:4173/. Lors de la création, une prévisualisation utilisait le port 4174. Sa disponibilité dépend du processus local.
4. Exécuter `npm run check`, `npm test`, puis les tests navigateur si modification d’interaction ou de présentation.
5. Modifier les cours dans `src/content.js` et `src/inherited.js`, le moteur dans `src/engine.js`, les vues dans `src/app.js`, les styles dans `src/style.css`.
6. Après modification, actualiser CHANGELOG.md, TESTS.md et ce fichier. Pour publication, `npm run build` produit `dist/`. Le dépôt existant sert déjà l’ancien site via GitHub Pages ; une fusion rendrait normalement `v1/` accessible sans remplacer l’accueil historique.

## Priorités suivantes

Faire examiner la V1 à l’utilisateur, puis choisir avec lui s’il veut publier cette interface comme accueil principal ou conserver les deux parcours. Consolider les tests en laboratoire FortiGate, intégrer les modules avancés existants et proposer des défis guidés supplémentaires.

## Ne pas perdre ces distinctions

« Lu » n’est pas « maîtrisé ». « Paquet autorisé » ne prouve pas le succès de l’application. Le modèle n’est pas FortiOS. Une absence de NAT n’est pas un refus implicite. Les notes et résultats restent sur une origine de navigateur ; changer d’hébergement requiert export/import. L’ancien stockage à identifiants numériques n’est pas modifié par la V1.
