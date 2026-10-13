# Sources et contrôle technique

Vérification le 13 octobre 2026. Le contenu est une rédaction pédagogique originale ; les documents officiels servent à contrôler les principes et exemples. Les références de l’ancien site en 7.6 ont été remplacées par des sources identifiées de la branche 7.4 pour cette V1.

## Sources officielles consultées

| Sujet | Source | Éléments contrôlés |
|---|---|---|
| Ordre des règles | [Policies, 7.4.0](https://docs.fortinet.com/document/fortigate/7.4.0/best-practices/862226/policies) | Première correspondance, ordre et moindre privilège. |
| Routage | [Routing concepts, 7.4.5](https://docs.fortinet.com/document/fortigate/7.4.5/administration-guide/139692/routing-concepts) | Plus long préfixe, distance, consultation de table, VDOM, différences avec ECMP. |
| Interfaces | [Interface settings, 7.4.8](https://docs.fortinet.com/document/fortigate/7.4.8/administration-guide/574723/interface-settings) | Emplacement GUI, interface VLAN et options variant selon le modèle. |
| Premiers pas | [Summary of steps, 7.4.8](https://docs.fortinet.com/document/fortigate/7.4.8/administration-guide/383477/summary-of-steps) | Paramétrage initial, policy d’accès, sauvegarde. |
| Traduction | [Dynamic SNAT, 7.4.8](https://docs.fortinet.com/document/fortigate/7.4.8/administration-guide/29961/dynamic-snat) | Principes et distinction entre traductions ; contenu indexé partiel. |
| Modes NGFW | [NGFW policy, 7.4.8](https://docs.fortinet.com/document/fortigate/7.4.8/administration-guide/243446/ngfw-policy) | Différence profile-based / policy-based ; Central NAT dans le second. |
| Diagnostic CLI | [Debugging the packet flow, 7.4.8](https://docs.fortinet.com/document/fortigate/7.4.8/administration-guide/54688/debugging-the-packet-flow) | Filtres IPv4, trace bornée, limitation du diagnostic des flux accélérés. |
| Diagnostic GUI | [Using the debug flow tool, 7.4.8](https://docs.fortinet.com/document/fortigate/7.4.8/administration-guide/38044/using-the-debug-flow-tool) | Network > Diagnostics et filtres. |
| Commandes | [CLI troubleshooting cheat sheet, 7.4.0](https://docs.fortinet.com/document/fortigate/7.4.0/cli-troubleshooting-cheat-sheet/420966/cli-troubleshooting-cheat-sheet) | Aide-mémoire des familles de commandes, accès via index. |
| Administration | [Hardening, 7.4.0](https://docs.fortinet.com/document/fortigate/7.4.0/best-practices/555436) | Réduction de la surface d’accès, protection des configurations et sauvegardes. |
| Trafic local | [Local-in and local-out logging, 7.4.8](https://docs.fortinet.com/document/fortigate/7.4.8/administration-guide/263651/local-in-and-local-out-logging) | Distinction trafic destiné au pare-feu / transit. |

## Méthode et limites

Plusieurs ouvertures directes de docs.fortinet.com ont renvoyé HTTP 403 dans l’outil de recherche. Les passages accessibles via l’index des pages officielles ont été consultés. La référence de routage initialement envisagée en 7.4.8 a été remplacée par la page 7.4.5 effectivement restituée ; le lien de durcissement vise bien le guide Best Practices 7.4.0, et non un chemin d’Administration Guide supposé.

Les commandes et menus ne sont pas présentés comme validés sur matériel : aucun FortiGate n’était accessible. Les noms d’interfaces et adresses sont pédagogiques. Les commandes de consultation exposent potentiellement une configuration sensible, ce qui est indiqué dans le module d’administration. Un debug doit être filtré, borné et arrêté, comme expliqué dans le cours.

Le schéma entrée → route → policy → SNAT → sortie est propre au modèle retenu. Il ne prétend pas décrire l’ensemble des mécanismes FortiOS, notamment DNAT, contrôles RPF, inspection, sessions et offload. Les sorties du simulateur sont rédigées en français et ne se font pas passer pour des traces CLI FortiOS.
