# Contexte du projet

## Intention de l’utilisateur

Construire effectivement un site français Fortinet Academy, du réseau à l’administration FortiGate, avec cours riches, pédagogie visuelle, quiz, recherche, progression persistante et simulateur des décisions route/policy/NAT. Priorité : V1 utilisable, esthétique soignée, faible coût et continuité entre sessions. Autorisation explicite de stocker sur son GitHub ; aucune confirmation intermédiaire nécessaire hors décision bloquante.

## État au 13 octobre 2026

V1 autonome implémentée : huit modules, 24 leçons et questions, cinq scénarios de simulation, 16 définitions, notes et export/import. Tests de logique et parcours navigateur exécutés. Les six documents de continuité sont présents.

Compte GitHub confirmé : armani585. Dépôt : armani585/fortinet-academy. Il contient déjà un cursus de 21 modules publié via GitHub Pages. La V1 est ajoutée dans `v1/` sur la branche `codex/fortinet-academy-interactive-v1`, afin de conserver intégralement ce cursus. Le changement ne remplace pas immédiatement le site publié.

Le texte détaillé de l’assistant dans la conversation ChatGPT référencée n’était pas restitué par read_thread (marqueurs de contenu uniquement). La demande courante constitue donc le cahier des charges. Cinq modules ont été repris des fichiers originaux de l’utilisateur datés du 4 octobre et adaptés, trois ont été rédigés pour cette V1. Les références ont été revérifiées autant que possible.

## Architecture

Site statique HTML/CSS et modules JavaScript natifs ; Node.js pour servir et tester. Aucune dépendance applicative npm. Moteur de simulation pur séparé de l’interface. Données locales versionnées, import validé. Pas d’authentification ni de synchronisation cloud.

## Critères de réussite

Lire un module, pratiquer dans le laboratoire, répondre au quiz avec correction, recharger et retrouver lecture/score/notes ; rechercher une notion ; utiliser l’application sur petit écran ; exporter/importer les données. Les traces doivent distinguer autorisation, traduction et réussite applicative.

## Limites assumées

Simulateur IPv4 du premier paquet sans DNAT, RPF, UTM, PBR, SD-WAN, IPv6 ou sessions réelles. Aucun accès à un FortiGate. JavaScript nécessaire. Pas de service worker : les ressources sont locales au site, mais la disponibilité hors ligne après fermeture n’est pas garantie. Les données sont propres à l’origine du navigateur : changer de port ou de domaine impose un export/import.
