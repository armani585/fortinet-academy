# Vérifications

## Exécution

```sh
npm run check
npm test
npm run build
```

Résultats : syntaxe JavaScript valide ; 21 tests unitaires réussis ; distribution statique générée.

## Risques vérifiés par les tests unitaires

IPv4 strict, CIDR /0 /24 /32, octets invalides, masque invalide, plus long préfixe, distance à préfixe égal, route inactive, absence de route, ordre des policies, refus explicite et implicite, source/destination/interfaces/protocole/port, comportement sans SNAT, ICMP, ports hors limites, quiz correct/incorrect/manquant, répétition sans cumul, import de progression et complétude des contenus.

## Parcours navigateur

Playwright avec Microsoft Edge en mode headless, profil isolé, serveur local. 23 vérifications réussies : accueil, quiz vide, correction juste/fausse, nouvelle tentative, revalidation sans cumul, sauvegarde et recharge, échappement des notes, recherche, cinq scénarios avec réparations, IP invalide, ICMP, export/import valide et invalide, remise à zéro, glossaire et absence de résultat, lien d’évitement clavier, six vues sans débordement horizontal à 390 px, stockage bloqué, zéro erreur JavaScript.

Captures visuelles inspectées : accueil ordinateur (1440 px), accueil mobile (390 px), laboratoire. La disposition mobile a ensuite été affinée et les parcours rejoués.

Pour rejouer : installer Playwright comme outil de développement, ou définir PLAYWRIGHT_MODULE vers son `index.mjs`. Démarrer `npm start`, puis `node tests/browser.mjs`. Le navigateur Edge doit être installé. TEST_URL peut remplacer http://127.0.0.1:4173/. Le script écrit trois captures dans le dossier parent.

## Limites des vérifications

Pas de tests sur équipement FortiGate, pas d’examen de certification, pas de validation exhaustive de toutes les variantes FortiOS. Documentation consultée via index officiel lorsque l’accès direct renvoyait 403 ; détails dans SOURCES.md. Pas d’audit WCAG complet ni de tests réels Safari/iOS et Firefox. Aucune compatibilité hors ligne complète revendiquée.
