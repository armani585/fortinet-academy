# Décisions

## D01 — Site statique natif

HTML/CSS/ES modules, sans framework ni backend. Le besoin n’exige pas de comptes ou de serveur de données. Déploiement peu coûteux, aucune chaîne de compilation à entretenir pour fonctionner. Node 22+ sert uniquement aux outils.

## D02 — Cœur pédagogique ciblé

Huit modules cohérents plutôt qu’un panorama superficiel. Trois leçons, trois questions, objectif, exemple, exercice, correction et références par module. Les 21 modules du site antérieur restent dans leur emplacement d’origine sur GitHub.

## D03 — Référentiel 7.4 explicite

La branche 7.4 sert à expliquer les principes. Les références mentionnent les patchs réellement consultés (7.4.0, 7.4.5, 7.4.8). Cela ne recommande aucun build pour une production. Pas d’affirmation de compatibilité universelle des commandes.

## D04 — Modèle de simulation borné

Premier paquet IPv4 ; routes candidates simplifiées ; préfixe le plus long puis distance ; à égalité complète première ligne. Pas de priorité FortiOS distincte ni ECMP. Policies évaluées dans l’ordre ; première correspondance ; refus implicite si aucune ; SNAT d’interface après acceptation dans le récit pédagogique. Le port source est fixe pour TCP/UDP, les ports sont ignorés pour ICMP. Le modèle n’est pas une reproduction du pipeline interne complet.

## D05 — Progression locale

Clé versionnée distincte de l’ancien site, import strict limité à 100 Ko, notes limitées à 5 000 caractères, échappement à l’affichage. Dernier score complet conservé ; tentatives incomplètes et réinitialisation du formulaire ne le suppriment pas. Lecture déclarative et maîtrise démontrée restent séparées. L’indisponibilité du stockage ne bloque pas les activités.

## D06 — Navigation par hash

Liens profonds sans configuration serveur, fonctionnement à la racine ou dans `v1/`. Le hash est réservé au routage ; les sommaires internes interceptent leurs liens pour déplacer le focus et faire défiler sans casser le routeur.

## D07 — Design et ressources

Rail sombre, panneaux lisibles, accent vert, schémas vectoriels CSS, polices DM Sans et Manrope incluses localement sous SIL Open Font License. Aucune bibliothèque visuelle, image distante, requête tierce ou télémétrie.

## D08 — Stockage GitHub sans remplacement de la production

Branche dédiée et ajout de `v1/`, puis pull request. L’autorisation de stockage sur GitHub est explicite. Les fichiers, la prévisualisation locale et l’archive restent utilisables sans fusion ni déploiement. Aucun site existant n’est supprimé.
