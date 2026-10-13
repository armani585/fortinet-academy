# Fortinet Academy — atelier interactif V1

Site pédagogique indépendant, en français, consacré au réseau et à FortiGate/FortiOS. Il fonctionne entièrement dans le navigateur, sans compte, base de données, abonnement, outil de suivi ni appel réseau tiers. Les polices libres sont incluses avec leurs licences.

## Démarrer

Avec Node.js 22 ou supérieur, ouvrir un terminal dans ce dossier :

```sh
npm start
```

Ouvrir http://127.0.0.1:4173/. Aucun `npm install` n’est nécessaire. Ne pas ouvrir directement `index.html` en `file://` : les modules JavaScript demandent un serveur HTTP.

Pour choisir un autre port sous PowerShell : `$env:PORT='4174'; npm start`.

## Ce qui est livré

- 8 modules : bases réseau, prise en main, VLAN, routage, policies, NAT, diagnostic et administration.
- 24 leçons, 24 questions corrigées (QCM et saisie), exercices guidés, exemples GUI/CLI et sources officielles.
- Laboratoire IPv4 : 5 scénarios, routes modifiables, rules réordonnables, adresses/CIDR, ports, protocoles, SNAT et explication pas à pas.
- Lecture, dernier résultat complet de quiz, notes et reprise sauvegardés localement. Export/import JSON validé et remise à zéro.
- Recherche dans les titres, explications et commandes ; glossaire de 16 termes.
- Interface mobile, navigation clavier, réduction des animations et styles d’impression.

Le simulateur ne lance pas FortiOS et ne transmet aucun paquet. Ses limites sont visibles dans le laboratoire. Les commandes n’ont pas été exécutées sur un vrai FortiGate. Le référentiel 7.4 ne constitue pas une recommandation de firmware à installer.

## Structure et maintenance

`src/content.js` : parcours, définitions et références ; `src/inherited.js` : cinq cours originaux repris du précédent site puis adaptés par content.js ; `src/engine.js` : modèle pur et validation ; `src/app.js` : vues et interactions ; `src/style.css` : présentation ; `src/fonts/` : polices et licences.

Les données personnelles restent dans `localStorage`, clé `fortinet-academy-workshop-v1`. Les réponses en cours et la configuration du laboratoire ne sont pas persistées. Une validation complète remplace le dernier score ; une tentative incomplète ne l’efface pas. « Lu » et « quiz réussi » sont des indicateurs différents. L’import remplace la progression de cet atelier ; exporter avant un import permet de garder une copie.

## Vérifier et publier

```sh
npm run check
npm test
npm run build
```

Le dossier `dist/` contient le site prêt à publier sur n’importe quel hébergement statique. Les liens relatifs et la navigation par hash fonctionnent à la racine et dans un sous-dossier, sans réécriture serveur. Le serveur fourni est un outil local lié à 127.0.0.1, pas un serveur de production.

Dans le dépôt existant, la nouvelle application se trouve sous `v1/` sur une branche dédiée. Les 21 cours de l’ancien site sont préservés. Après intégration sur la branche publiée, GitHub Pages pourra servir `/fortinet-academy/v1/`. La publication n’est pas automatique tant que la branche n’est pas intégrée.

Les tests navigateur utilisent Playwright, une dépendance de développement facultative. Voir TESTS.md. Aucun environnement FortiGate n’est inclus.

## Continuité

Lire dans cet ordre : PROJECT_CONTEXT.md, NEXT_SESSION.md, DECISIONS.md, TESTS.md, ROADMAP.md, CHANGELOG.md. SOURCES.md documente les vérifications Fortinet.

Fortinet, FortiGate et FortiOS sont des marques de leurs détenteurs respectifs. Ce projet n’est ni une formation ni une certification officielle Fortinet.
