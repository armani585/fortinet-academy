export default [
  {
    id: 1,
    slug: "fondamentaux-fortigate",
    title: "Comprendre FortiGate et le chemin d’un flux",
    level: "Fondations",
    minutes: 40,
    objective:
      "Expliquer pourquoi un paquet passe ou est refusé, et relever le contexte d’un FortiGate.",
    prereq: "Savoir distinguer adresse IP, masque, passerelle et port TCP/UDP.",
    lessons: [
      [
        "Un pare-feu stateful",
        "Un FortiGate conserve un état des connexions. Une nouvelle connexion doit satisfaire les décisions de routage et de sécurité ; les paquets suivants sont associés à une session. Une réponse appartenant à une session autorisée n’exige généralement pas une règle miroir. En revanche, une nouvelle connexion initiée dans le sens opposé doit être autorisée séparément. Une session existante explique parfois pourquoi une modification ne produit pas immédiatement le résultat attendu.",
      ],
      [
        "Raisonner avec cinq informations",
        "Avant de modifier une règle, note IP source, IP destination, protocole, port source et port destination, puis interfaces d’entrée et de sortie attendues. Une route indique où envoyer le paquet ; une policy décide si le flux est permis ; le NAT transforme une adresse. Ces fonctions sont distinctes. Le schéma entrée → route/policy → inspection/NAT → sortie est un repère de diagnostic simplifié, pas l’ordre interne universel de traitement.",
      ],
      [
        "Séparer administration et transit",
        "Une connexion HTTPS vers le FortiGate lui-même relève de son accès administratif et éventuellement des règles local-in. Une connexion traversant le FortiGate vers un serveur relève des policies de transit. Commence par relever modèle, version, mode et VDOM. Dans un laboratoire, garde un accès console et une sauvegarde afin de pouvoir revenir à un état connu. La version exacte compte davantage que la seule étiquette « 7.6 ».",
      ],
    ],
    gui: "Dashboard → Status pour l’état ; Network → Interfaces pour les adresses ; Policy & Objects → Firewall Policy pour les flux de transit.",
    cli: "get system status\nget system performance status\nget router info routing-table all",
    cliNote:
      "Lecture seule. Identifie le VDOM avant d’interpréter les routes. Une sortie de performance doit être comparée dans le temps.",
    example:
      "PC 10.10.10.10 → serveur 10.10.20.10:443 : le PC envoie à sa passerelle 10.10.10.1. Le FortiGate doit connaître le réseau du serveur et autoriser HTTPS entre les deux interfaces. Le serveur doit disposer d’un chemin retour.",
    exercise: [
      "Dessine PC, passerelle et serveur, puis ajoute les interfaces du pare-feu.",
      "Note le cinq-uplet d’un essai HTTPS et distingue-le d’un ping.",
      "Relève version et route vers le serveur. Explique ce que ces informations prouvent et ce qu’elles ne prouvent pas.",
    ],
    correction:
      "Une route correcte prouve un chemin de sortie potentiel, pas une autorisation. Un ping réussi valide ICMP pour ce trajet ; il ne valide ni TCP/443, ni le certificat, ni l’application.",
    pitfall:
      "Ajouter une règle WAN → LAN pour « autoriser les réponses » sans vérifier la session ouvre potentiellement de nouvelles connexions entrantes.",
    refs: ["start", "policy"],
    quiz: [
      {
        type: "choice",
        prompt: "Une route vers le serveur garantit-elle que HTTPS passe ?",
        options: [
          "Oui, toujours",
          "Non, il faut aussi une policy et les autres conditions du flux",
          "Oui si le serveur répond au ping",
        ],
        answer: 1,
        explanation:
          "Le routage et l’autorisation sont deux décisions différentes.",
      },
      {
        type: "choice",
        prompt: "Quel trafic relève de l’administration locale ?",
        options: [
          "HTTPS vers l’adresse du FortiGate",
          "HTTPS traversant le FortiGate vers un serveur",
          "Un paquet vers une agence distante",
        ],
        answer: 0,
        explanation: "La destination est ici le pare-feu lui-même.",
      },
      {
        type: "text",
        prompt: "Quel objet mémorise l’état d’une connexion ?",
        answers: ["session", "une session"],
        explanation: "La session relie les paquets d’une même connexion.",
      },
    ],
  },
  {
    id: 2,
    slug: "interfaces-vlan",
    title: "Interfaces, VLAN et adressage",
    level: "Fondations",
    minutes: 50,
    objective:
      "Construire un segment VLAN et distinguer une panne de niveau 2 d’une panne de routage.",
    prereq: "Module 1 ; notions de sous-réseau IPv4.",
    lessons: [
      [
        "Un VLAN est un domaine de niveau 2",
        "Le tag 802.1Q permet de transporter plusieurs réseaux logiques sur un lien. Le port d’un poste est généralement en accès non tagué dans un VLAN ; le lien vers le FortiGate transporte ce VLAN tagué. Le numéro du VLAN doit correspondre des deux côtés. Donner une adresse IP à une sous-interface ne corrige pas un trunk qui ne transporte pas le bon tag.",
      ],
      [
        "Passerelle et DHCP",
        "Pour VLAN10, la passerelle peut être 10.10.10.1/24, avec une plage DHCP 10.10.10.100–150. Exclue les adresses statiques de cette plage. Un serveur DHCP local ou un relais vers un serveur central sont deux architectures distinctes. Le bail doit contenir masque, passerelle et DNS appropriés. Une adresse automatique de secours sur le poste signale souvent l’absence de réponse DHCP.",
      ],
      [
        "Valider couche par couche",
        "Vérifie d’abord lien physique, appartenance VLAN et table MAC du switch. Contrôle ensuite bail, ARP vers la passerelle et accès IP local. Une route connectée apparaît si l’interface concernée est opérationnelle. Pour passer d’un VLAN à un autre, il faut encore une policy. Le masque incorrect d’un poste peut l’amener à chercher localement par ARP une destination qui devrait être routée.",
      ],
    ],
    gui: "Network → Interfaces → Create New → Interface : type VLAN, interface parente, VLAN ID et adresse. Les options disponibles dépendent du modèle.",
    cli: "show system interface\nget system arp\nshow system dhcp server",
    cliNote:
      "Lecture seule ; la configuration affichée décrit les interfaces et serveurs DHCP. Elle ne garantit pas le transport du VLAN par le switch.",
    example:
      "Un poste en VLAN10 reçoit 10.10.10.120/24 et la passerelle 10.10.10.1. Si le trunk ne laisse passer que VLAN20, ses broadcasts DHCP ne rejoignent pas VLAN10 sur le FortiGate.",
    exercise: [
      "Sur un laboratoire isolé, prépare VLAN10 et VLAN20 sur un switch et leurs passerelles sur le FortiGate.",
      "Associe un port de test à VLAN10, configure une plage DHCP dédiée et renouvelle le bail.",
      "Retire uniquement VLAN10 du trunk de test, observe l’échec, puis rétablis la valeur initiale.",
    ],
    correction:
      "Le lien peut rester physiquement UP pendant la panne. L’absence d’échanges DHCP sur la sous-interface, alors que le poste les émet, oriente vers le transport VLAN. Après restauration, un bail et un accès à la passerelle valident le segment.",
    pitfall:
      "Confondre VLAN natif non tagué et VLAN tagué, ou réutiliser le même sous-réseau sur deux interfaces isolées.",
    refs: ["interfaces"],
    quiz: [
      {
        type: "choice",
        prompt:
          "Le tag du trunk ne correspond pas à la sous-interface. Que vérifier en premier ?",
        options: [
          "Le numéro de VLAN des deux côtés",
          "Le profil antivirus",
          "Le mot de passe VPN",
        ],
        answer: 0,
        explanation:
          "Le transport de niveau 2 doit être cohérent avant le routage.",
      },
      {
        type: "text",
        prompt:
          "Quel numéro de VLAN utilise le segment VLAN10 de cet exercice ?",
        answers: ["10", "vlan10", "vlan 10"],
        explanation: "Le segment pédagogique est associé au tag 10.",
      },
      {
        type: "choice",
        prompt:
          "Deux VLAN différents peuvent-ils communiquer automatiquement ?",
        options: [
          "Oui, car ils partagent le câble",
          "Non : routage et autorisation sont nécessaires",
          "Seulement avec du NAT systématique",
        ],
        answer: 1,
        explanation:
          "La séparation de niveau 2 ne disparaît pas avec un trunk.",
      },
    ],
  },
  {
    id: 3,
    slug: "policies-nat",
    title: "Policies, SNAT et publication par VIP",
    level: "Fondations",
    minutes: 55,
    objective:
      "Définir une règle minimale et expliquer les adresses avant et après traduction.",
    prereq: "Modules 1 et 2.",
    lessons: [
      [
        "Lire une règle de haut en bas",
        "Une policy associe interfaces, sources, destinations, services et horaires. L’ordre compte : une règle large placée avant une règle plus précise peut la masquer. Sans correspondance autorisée, le trafic est refusé. Nomme la règle avec son besoin métier et active une journalisation adaptée. Vérifie l’identifiant de la policy réellement utilisée dans les logs, pas seulement son nom dans la configuration.",
      ],
      [
        "SNAT en sortie",
        "Un client privé a généralement besoin de SNAT pour sortir vers Internet. Avec traduction sur l’interface de sortie, plusieurs clients peuvent utiliser l’adresse de cette interface et des ports différents. Entre deux LAN routés, conserve les sources lorsque l’architecture le permet : le NAT n’est pas une condition générale du routage. En mode Central SNAT, la traduction se configure séparément des règles de sécurité.",
      ],
      [
        "DNAT et VIP",
        "Une VIP associe une adresse ou un port exposé à une ressource interne. Elle ne remplace pas la règle autorisant le trafic vers cette ressource. Pour publier un service de test, documente adresse externe, adresse interne, ports et sources autorisées. Prévois le chemin retour et évite de mélanger le test depuis Internet avec un test interne vers l’adresse publique : le second peut demander un traitement différent.",
      ],
    ],
    gui: "Policy & Objects → Addresses, Firewall Policy et Virtual IPs. Central SNAT apparaît selon le mode de configuration.",
    cli: "show firewall policy\nshow firewall vip\nshow firewall central-snat-map",
    cliNote:
      "Lecture seule. Ce cours utilise le mode NGFW profile-based ; le mode policy-based impose Central NAT et modifie le fonctionnement des menus.",
    example:
      "Autoriser VLAN10 → WAN pour DNS vers le résolveur prévu et HTTPS, avec SNAT. Pour une application DMZ, une VIP de laboratoire 192.0.2.10:443 → 10.10.20.10:443 nécessite aussi une policy WAN → DMZ.",
    exercise: [
      "Écris la matrice source, destination, service, action et NAT pour ces deux besoins.",
      "Crée les objets et règles dans le laboratoire, avec une source de test limitée.",
      "Lance une nouvelle connexion puis relève policyid, source traduite et compteurs aller/retour.",
    ],
    correction:
      "La sortie Internet doit montrer la traduction source attendue. Le flux publié doit viser le serveur interne après DNAT. Le simple fait de créer une VIP ne constitue pas une preuve d’ouverture du service.",
    pitfall:
      "Laisser une règle « all → all / ALL » en tête masque les erreurs et autorise davantage que le besoin.",
    refs: ["policy", "ngfw"],
    quiz: [
      {
        type: "choice",
        prompt: "Une VIP suffit-elle à publier un serveur ?",
        options: [
          "Oui",
          "Non, une policy correspondante reste nécessaire",
          "Oui si le port est 443",
        ],
        answer: 1,
        explanation: "La traduction et l’autorisation ont des rôles distincts.",
      },
      {
        type: "choice",
        prompt: "Quelle traduction modifie la source ?",
        options: ["DNAT", "SNAT", "VLAN"],
        answer: 1,
        explanation: "SNAT signifie Source Network Address Translation.",
      },
      {
        type: "text",
        prompt:
          "Quel champ du journal permet d’identifier la règle appliquée ?",
        answers: ["policyid", "policy id"],
        explanation: "policyid est la référence de la règle utilisée.",
      },
    ],
  },
  {
    id: 6,
    slug: "logs-diagnostic",
    title: "Logs, sessions, sniffer et Debug Flow",
    level: "Avancé",
    minutes: 60,
    objective:
      "Localiser une rupture dans un flux avec une preuve limitée et reproductible.",
    prereq: "Modules 1 à 5.",
    lessons: [
      [
        "Commencer par les journaux",
        "Fixe un horodatage et un flux précis, puis filtre les logs par source et destination. Relève action, policyid, interfaces et octets aller/retour. L’absence de log n’est pas une preuve de passage : la journalisation peut être désactivée ou l’événement non encore émis. Une capture répond à « où passent les paquets ? » ; Debug Flow explique certaines décisions internes.",
      ],
      [
        "Capturer sans tout collecter",
        "Un filtre host réduit l’observation à un poste ; ajoute un port ou un protocole si nécessaire. Le niveau de verbosité et le nombre de paquets doivent être bornés. Compare interface d’entrée, interface de sortie et réponse. SYN répétés sans SYN-ACK orientent vers une rupture d’acheminement, un filtrage ou un serveur muet, mais n’identifient pas seuls le responsable.",
      ],
      [
        "Arrêter proprement le diagnostic",
        "Filtre avant d’activer un debug, limite le nombre de traces puis désactive et réinitialise après le test. Certaines sessions accélérées matériellement n’apparaissent pas entièrement dans les outils logiciels. Commence par une nouvelle connexion contrôlée. Modifier l’offload ou vider des sessions peut perturber les usages ; ce n’est pas une première étape sur une production.",
      ],
    ],
    gui: "Log & Report → Forward Traffic ; Network → Diagnostics → Debug Flow selon la version et les fonctions visibles.",
    cli: "diagnose sniffer packet any 'host 10.10.10.10 and port 443' 4 20 l\n\ndiagnose debug reset\ndiagnose debug flow filter addr 10.10.10.10\ndiagnose debug flow show function-name enable\ndiagnose debug flow trace start 20\ndiagnose debug enable\n\n# Après le test :\ndiagnose debug disable\ndiagnose debug flow trace stop\ndiagnose debug reset",
    cliNote:
      "À exécuter sur le laboratoire, en coordonnant tout debug déjà actif. Arrêter même si aucune ligne n’apparaît. Ctrl+C interrompt une capture en cours.",
    example:
      "Le sniffer voit le SYN entrer sur VLAN10 et sortir vers la DMZ, mais aucune réponse n’entre depuis la DMZ. La recherche se poursuit côté serveur, passerelle de retour ou réseau DMZ ; ouvrir toutes les policies du LAN n’est pas justifié.",
    exercise: [
      "Définis un essai TCP/443 unique avec heure et adresses.",
      "Capture 20 paquets au maximum et classe entrée, sortie, retour.",
      "Active un Debug Flow ciblé pour une nouvelle tentative, puis exécute les commandes d’arrêt. Rédige une conclusion limitée aux preuves.",
    ],
    correction:
      "« Le SYN quitte le FortiGate, aucun retour observé pendant 10 secondes » est une conclusion vérifiable. « Le serveur est mort » dépasse la preuve : un filtre ou une route retour peut aussi expliquer le silence.",
    pitfall:
      "Une capture vide peut venir du filtre, du VDOM, du moment du test ou de l’accélération, pas seulement de l’absence de trafic.",
    refs: ["debug", "method", "cli"],
    quiz: [
      {
        type: "choice",
        prompt: "Aucun log est visible. Peut-on conclure que le flux passe ?",
        options: ["Oui", "Non", "Oui si la policy existe"],
        answer: 1,
        explanation:
          "La configuration et le moment de journalisation doivent être vérifiés.",
      },
      {
        type: "text",
        prompt: "Quelle commande désactive la sortie de debug ?",
        answers: ["diagnose debug disable", "diag debug disable"],
        explanation:
          "Désactive le debug, puis arrête la trace et réinitialise les filtres.",
      },
      {
        type: "choice",
        prompt: "Un SYN sort sans réponse. Quelle conclusion est prouvée ?",
        options: [
          "Le serveur est éteint",
          "Aucun retour n’a été observé pendant la capture",
          "Le certificat est invalide",
        ],
        answer: 1,
        explanation:
          "La capture localise une absence sans identifier automatiquement sa cause.",
      },
    ],
  },
  {
    id: 18,
    slug: "durcissement",
    title: "Durcir l’administration du FortiGate",
    level: "Production",
    minutes: 45,
    objective:
      "Réduire l’exposition administrative en gardant une voie de récupération.",
    prereq: "Modules 1, 3 et 15.",
    lessons: [
      [
        "Identifier la surface exposée",
        "Liste les interfaces qui acceptent HTTPS, SSH ou d’autres services de gestion et les réseaux pouvant les joindre. L’accès au pare-feu lui-même est différent du trafic transitant à travers lui. Une policy LAN → WAN ne décrit donc pas à elle seule l’exposition du plan d’administration. Préfère un réseau de gestion et des chemins d’accès maîtrisés.",
      ],
      [
        "Limiter droits et sources",
        "Utilise des comptes nominatifs, profils d’administration adaptés et authentification renforcée lorsque prise en charge. Limite les sources de gestion avec les mécanismes appropriés, comme trusted hosts et règles local-in selon le besoin. Supprime les accès inutiles après vérification de leur usage. Le compte de secours doit être documenté et protégé, pas partagé comme compte quotidien.",
      ],
      [
        "Changer sans se verrouiller dehors",
        "Avant toute restriction, vérifie console ou autre voie de récupération. Teste une nouvelle session autorisée avant de fermer la session courante. Valide aussi le refus depuis une source non autorisée. Les sauvegardes et secrets d’API font partie du périmètre de durcissement ; protéger le pare-feu tout en diffusant ses configurations annule une partie du bénéfice.",
      ],
    ],
    gui: "Network → Interfaces pour les services administratifs ; System → Administrators et Admin Profiles ; local-in via les fonctions disponibles.",
    cli: "show system interface\nshow system admin\nshow firewall local-in-policy",
    cliNote:
      "Audit de lecture. La configuration des administrateurs est sensible ; ne la colle pas dans un ticket public.",
    example:
      "Une restriction de sources appliquée à distance utilise le mauvais sous-réseau de gestion. Sans console de secours, une action de sécurité devient une indisponibilité administrative.",
    exercise: [
      "Inventorie services exposés, comptes et droits sur un pare-feu de laboratoire.",
      "Prépare un accès console et limite une interface de test au poste d’administration prévu.",
      "Ouvre une nouvelle session depuis la source autorisée, teste un refus ailleurs puis documente le retour arrière.",
    ],
    correction:
      "La réussite exige accès permis et refus attendu, avec procédure de récupération disponible. Une session déjà ouverte qui reste active ne prouve pas qu’une nouvelle connexion sera acceptée.",
    pitfall:
      "Désactiver ou restreindre l’unique accès actif avant d’avoir testé une seconde voie.",
    refs: ["hardening", "admin", "policy"],
    quiz: [
      {
        type: "choice",
        prompt:
          "Quand fermer la session administrative courante après une restriction ?",
        options: [
          "Avant le test",
          "Après validation d’une nouvelle session autorisée",
          "Immédiatement après sauvegarde",
        ],
        answer: 1,
        explanation:
          "La nouvelle session valide le chemin d’accès après changement.",
      },
      {
        type: "text",
        prompt:
          "Quel type de policy vise le trafic destiné au FortiGate lui-même ?",
        answers: ["local-in", "local in", "local-in policy"],
        explanation:
          "Les règles local-in concernent le trafic à destination de l’équipement.",
      },
      {
        type: "choice",
        prompt: "Quel principe appliquer aux profils administrateurs ?",
        options: [
          "Les droits nécessaires au rôle",
          "Super-admin pour tous",
          "Un seul compte partagé",
        ],
        answer: 0,
        explanation:
          "Des droits adaptés limitent les effets d’une erreur ou compromission.",
      },
    ],
  },
];
