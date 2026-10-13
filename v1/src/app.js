import { courses, glossary, sources } from "./content.js";
import {
  simulate,
  defaultConfig,
  grade,
  normalize,
  emptyProgress,
  sanitizeProgress,
} from "./engine.js";
const $ = (s, root = document) => root.querySelector(s),
  $$ = (s, root = document) => [...root.querySelectorAll(s)];
const esc = (v) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const KEY = "fortinet-academy-workshop-v1";
let progress = emptyProgress(),
  persistent = true,
  search = "",
  filter = "Tous",
  config = defaultConfig(),
  result = null,
  step = -1,
  scenario = "web";
try {
  const raw = localStorage.getItem(KEY);
  if (raw) progress = sanitizeProgress(JSON.parse(raw), courses);
} catch {
  persistent = false;
}
function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(progress));
    persistent = true;
  } catch {
    persistent = false;
  }
  updateStorage();
}
function updateStorage() {
  const el = $("#storage");
  if (el)
    el.textContent = persistent
      ? "Sauvegarde locale active"
      : "Stockage indisponible · session temporaire";
}
function toast(message) {
  $("#toast").textContent = message;
  $("#toast").classList.add("visible");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => $("#toast").classList.remove("visible"), 4500);
}
const icon = (name) =>
  ({ home: "⌂", courses: "▤", lab: "◇", progress: "◴", reference: "⌘" })[
    name
  ] || "↗";
const links = [
  ["home", "Vue d’ensemble"],
  ["courses", "Mon parcours"],
  ["lab", "Laboratoire de flux"],
  ["reference", "Fiches & glossaire"],
  ["progress", "Ma progression"],
];
function header(kicker, title, desc) {
  return `<div class="page-heading"><div><p class="eyebrow">${kicker}</p><h1 tabindex="-1">${title}</h1><p class="lead">${desc}</p></div></div>`;
}
function mastery() {
  return courses.filter(
    (c) => progress.scores[c.slug]?.correct === c.quiz.length,
  ).length;
}
function meter(value, max) {
  return `<div class="meter" role="progressbar" aria-label="Modules lus" aria-valuemin="0" aria-valuemax="${max}" aria-valuenow="${value}"><span style="width:${(value / max) * 100}%"></span></div>`;
}
function render() {
  const path = location.hash.slice(1) || "home";
  const section = path.startsWith("course/") ? "courses" : path;
  document.title =
    (links.find((l) => l[0] === section)?.[1] || "Cours") +
    " · Fortinet Academy";
  $("#app").innerHTML =
    `<aside class="sidebar"><a class="brand" href="#home"><span class="brand-symbol">F<span>↗</span></span><span>fortinet<span class="brand-sub">ACADEMY</span></span></a><div class="rail-label">VOTRE ESPACE D’APPRENTISSAGE</div><nav aria-label="Navigation principale">${links.map(([id, label]) => `<a href="#${id}" class="nav-link ${section === id ? "active" : ""}" ${section === id ? 'aria-current="page"' : ""}><span aria-hidden="true">${icon(id)}</span>${label}${id === "lab" ? '<span class="nav-dot"></span>' : ""}</a>`).join("")}</nav><div class="sidebar-bottom"><div class="rail-progress"><span>Petit à petit, expert.</span><strong>${Object.keys(progress.read).length}<small> / 8 modules lus</small></strong>${meter(Object.keys(progress.read).length, 8)}<a href="#progress">Voir ma progression <span>↗</span></a></div><p class="independent">Programme indépendant.<br>Non affilié à Fortinet.</p><span class="version">V1.0 <span>•</span> EN FRANÇAIS</span></div></aside><div class="workspace"><header class="topbar"><span class="breadcrumb">L’académie <span>/</span> ${links.find((l) => l[0] === section)?.[1] || "Cours"}</span><form id="global-search" role="search"><span aria-hidden="true">⌕</span><input aria-label="Rechercher dans les cours et le glossaire" placeholder="Une notion, une commande…" name="query" maxlength="120" value="${esc(section === "search" ? search : "")}"><button type="submit" aria-label="Rechercher">↵</button></form><div class="local-user"><span class="status-dot"></span> Espace personnel <span class="avatar">VO</span></div></header><main id="main">${path === "home" ? home() : path === "courses" ? catalog() : path.startsWith("course/") ? courseView(path.split("/")[1]) : path === "lab" ? lab() : path === "progress" ? progressView() : path === "reference" ? reference() : path === "search" ? searchView() : header("404", "Page introuvable", "Retrouvez votre parcours avec le menu de navigation.")}</main><footer><span>Fortinet Academy <b>·</b> Comprendre. Pratiquer. Maîtriser.</span><span id="storage"></span></footer></div>`;
  bindGlobal();
  bindPage(path);
  updateStorage();
}
function home() {
  const next = courses.find((c) => !progress.read[c.slug]) || courses[0];
  return `<section class="hero"><div class="hero-copy"><div class="hero-badge"><span></span> LE RÉSEAU DEVIENT CLAIR.</div><h1>Comprendre le flux.<br><em>Maîtriser le pare-feu.</em></h1><p>De votre premier paquet à l’administration FortiGate.<br>Apprenez, expérimentez, et comprenez enfin pourquoi ça passe.</p><div class="hero-actions"><a class="button lime" href="#course/${progress.last || next.slug}">${progress.last ? "Reprendre mon parcours" : "Commencer à apprendre"} <span>↗</span></a><a class="hero-link" href="#lab">Explorer le labo <span>→</span></a></div><div class="hero-note"><span>✓ Sans inscription</span><span>✓ À votre rythme</span><span>✓ 100 % pratique</span></div></div><div class="network-art" aria-label="Schéma pédagogique : un client traverse les contrôles du pare-feu vers un serveur"><div class="orbit orbit-one"></div><div class="orbit orbit-two"></div><div class="packet-chip chip-top"><span class="tiny-light"></span>TCP <b>:443</b></div><div class="art-device client"><span>▱</span><small>CLIENT</small><code>10.10.10.10</code></div><div class="connection line-left"><i></i></div><div class="firewall-art"><div class="shield">◇</div><strong>FORTIGATE</strong><span>POLICY · ROUTE · NAT</span><div class="ports">▪ ▪ ▪ ▪ <b>▪ ▪</b></div></div><div class="connection line-right"><i></i></div><div class="art-device server"><span>▥</span><small>SERVEUR</small><code>TCP / 443</code></div><div class="packet-chip chip-bottom"><span class="tiny-light"></span>Flux autorisé <b>↗</b></div><span class="art-caption">VOIR. COMPRENDRE. EXPÉRIMENTER.</span></div></section><div class="stats-row"><div><strong>08</strong><span>modules progressifs</span></div><div><strong>24</strong><span>questions corrigées</span></div><div><strong>05</strong><span>scénarios à explorer</span></div><div class="stat-version"><span class="outline-icon">⌘</span><span>Référentiel pédagogique<strong>FortiOS 7.4</strong></span></div></div><div class="section-top"><div><p class="eyebrow">UNE ÉTAPE APRÈS L’AUTRE</p><h2>Votre prochain déclic</h2></div><a class="text-link" href="#courses">Voir les 8 modules <span>↗</span></a></div><div class="course-grid">${courses.slice(0, 3).map(card).join("")}</div><section class="lab-banner"><div class="lab-banner-icon">↝</div><div><p class="eyebrow">LE LABORATOIRE INTERACTIF</p><h2>Et si vous suiviez le paquet ?</h2><p>Changez une règle. Coupez une route. Observez la différence.</p></div><a class="button dark" href="#lab">Lancer une simulation <span>↗</span></a></section><div class="method-row"><p><b>01 / Comprendre</b><span>Des explications concrètes, un vocabulaire clair.</span></p><p><b>02 / Expérimenter</b><span>Des manipulations sans toucher à un vrai réseau.</span></p><p><b>03 / Vérifier</b><span>Des corrections qui expliquent le pourquoi.</span></p></div>`;
}
function card(c) {
  const score = progress.scores[c.slug];
  return `<a class="course-card" href="#course/${c.slug}"><div class="card-head"><span class="course-icon tone-${c.id % 4}">${c.icon}</span><span class="mini-label">MODULE ${String(c.id).padStart(2, "0")}</span><span class="card-arrow">↗</span></div><span class="tag">${c.level}</span><h3>${c.title}</h3><p>${c.summary}</p><div class="card-foot"><span>◷ ${c.minutes} min <b>·</b> 3 leçons</span><span>${progress.read[c.slug] ? "✓ Lu" : score ? `Quiz ${score.correct}/${score.total}` : "Découvrir →"}</span></div></a>`;
}
function catalog() {
  return `${header("LE PARCOURS", "Des bases aux bons réflexes.", "Huit modules pour construire une compréhension solide. Avancez dans l’ordre ou explorez une notion précise.")}<div class="filter-row" role="group" aria-label="Filtrer les modules">${["Tous", "Fondations", "Pratique", "Avancé", "Administration"].map((f) => `<button class="filter ${f === filter ? "selected" : ""}" data-filter="${f}" aria-pressed="${f === filter}">${f}</button>`).join("")}</div><div class="course-grid catalog-grid">${courses
    .filter((c) => filter === "Tous" || c.level === filter)
    .map(card)
    .join(
      "",
    )}</div><div class="notice">Les temps incluent lecture et pratique. Les modules sont en accès libre ; la maîtrise est suivie par les quiz, séparément du statut « lu ».</div>`;
}
function flowDiagram() {
  return `<div class="lesson-flow" aria-label="Parcours simplifié d’un nouveau flux IPv4 sans DNAT"><div><span>01</span>Entrée</div><b>→</b><div><span>02</span>Route</div><b>→</b><div><span>03</span>Policy</div><b>→</b><div><span>04</span>SNAT</div><b>→</b><div><span>05</span>Sortie</div></div>`;
}
function courseView(slug) {
  const c = courses.find((c) => c.slug === slug);
  if (!c)
    return header(
      "404",
      "Cours introuvable",
      "Choisissez un module dans le parcours.",
    );
  progress.last = slug;
  save();
  const score = progress.scores[slug];
  return `<a class="text-link back" href="#courses">← Tous les modules</a>${header(`MODULE ${String(c.id).padStart(2, "0")} / 08 · ${c.level.toUpperCase()} · ${c.minutes} MIN`, c.title, c.objective)}<div class="learning-layout"><article class="lesson-content"><div class="objective"><b>Avant de commencer</b><p>${c.prereq}</p></div>${flowDiagram()}<p class="caption">Repère simplifié : premier paquet IPv4, sans DNAT, sans accélération ni inspection de contenu.</p>${c.lessons.map(([title, body], i) => `<section class="lesson" id="lesson-${i}"><span class="lesson-number">0${i + 1}</span><h2>${title}</h2><p>${body}</p></section>`).join("")}<section class="example"><span class="eyebrow">UN CAS CONCRET</span><h2>Raisonner avec un exemple</h2><p>${c.example}</p></section><section class="lesson" id="practice"><h2>À vous de jouer</h2><ol class="exercise">${c.exercise.map((e) => `<li>${e}</li>`).join("")}</ol><details><summary>Voir le corrigé guidé</summary><p>${c.correction}</p></details><p class="pitfall"><b>Le piège à éviter</b><br>${c.pitfall}</p><a class="button secondary" href="#lab">Expérimenter dans le labo ↗</a></section><section class="lesson" id="commands"><h2>Repères dans FortiOS</h2><p><b>Interface graphique</b><br>${c.gui}</p><div class="code-head"><span>CLI · Référentiel 7.4</span><button data-copy="${c.slug}">Copier</button></div><pre><code>${esc(c.cli)}</code></pre><p class="caption">${c.cliNote}</p><div class="notice">Les commandes sont des exemples à vérifier sur votre version exacte et votre modèle. Elles ne s’exécutent pas depuis ce site. FortiOS 7.4 est un référentiel pédagogique, pas une recommandation de version à installer.</div></section><section class="quiz-panel" id="quiz"><p class="eyebrow">VÉRIFIER SES ACQUIS</p><h2>Le quiz du module</h2><p>Trois questions, sans chronomètre. La correction explique chaque réponse.</p><form id="quiz-form" data-slug="${slug}" novalidate>${c.quiz.map((q, i) => `<fieldset><legend><span>${i + 1}.</span> ${q.prompt}</legend>${q.type === "choice" ? q.options.map((o, j) => `<label class="answer"><input type="radio" name="q${i}" value="${j}"><span>${o}</span></label>`).join("") : `<label class="text-answer">Votre réponse<input name="q${i}" autocomplete="off" maxlength="200" placeholder="Saisissez votre réponse…"></label>`}<div class="feedback" id="feedback-${i}" hidden></div></fieldset>`).join("")}<div class="actions"><button class="button dark" type="submit">Vérifier mes réponses →</button><button class="button secondary" type="reset">Nouvelle tentative</button></div><p id="quiz-score" class="score" role="status">${score ? `Dernier résultat : ${score.correct}/${score.total}. Nouvelle tentative vierge.` : "Aucune tentative enregistrée."}</p></form></section><section class="notes"><h2><label for="personal-note">Votre carnet de bord</label></h2><p>Gardez une explication, une question ou un point à revoir. Sauvegardé dans ce navigateur.</p><textarea id="personal-note" data-slug="${slug}" maxlength="5000" placeholder="Ce que je retiens de ce module…">${esc(progress.notes[slug] || "")}</textarea><span id="note-status" role="status"></span></section><section class="sources"><h2>Pour aller à la source</h2>${c.refs.map((key) => (sources[key] ? `<a target="_blank" rel="noopener" href="${sources[key][1]}">${sources[key][0]} ↗</a>` : "")).join("")}<p class="caption">Documentation officielle consultée le 13 octobre 2026, en partie via son index de recherche. Détails de vérification dans SOURCES.md.</p></section><div class="lesson-end"><button class="button ${progress.read[slug] ? "secondary" : "lime"}" data-read="${slug}" aria-pressed="${!!progress.read[slug]}">${progress.read[slug] ? "✓ Module marqué comme lu" : "Marquer ce module comme lu"}</button>${c.id < 8 ? `<a class="button dark" href="#course/${courses[c.id].slug}">Module suivant →</a>` : '<a class="button dark" href="#progress">Voir mon bilan →</a>'}</div><p class="caption">Marquer comme lu ne valide pas le quiz.</p></article><aside class="lesson-aside"><div class="sticky"><span class="eyebrow">DANS CE MODULE</span>${c.lessons.map(([title], i) => `<a href="#lesson-${i}" data-anchor="lesson-${i}"><span>0${i + 1}</span>${title}</a>`).join("")}<a href="#practice" data-anchor="practice">↗ Pratique guidée</a><a href="#commands" data-anchor="commands">⌘ Repères GUI / CLI</a><a href="#quiz" data-anchor="quiz">✓ Quiz & correction</a><div class="aside-tip"><span>💡</span><b>Un conseil</b><p>Avant de chercher la commande, formulez la question à laquelle elle doit répondre.</p></div></div></aside></div>`;
}
const scenarios = [
  [
    "web",
    "HTTPS vers Internet",
    "Observez la route par défaut et la traduction source.",
  ],
  [
    "dmz",
    "Application DMZ",
    "Comparez un /24 avec la route par défaut, sans NAT.",
  ],
  [
    "order",
    "Une règle qui masque",
    "Réparez le blocage en déplaçant la règle de refus après HTTPS.",
  ],
  [
    "route",
    "La route manquante",
    "Rétablissez la route par défaut puis relancez le paquet.",
  ],
  [
    "nat",
    "Sans traduction source",
    "Comparez autorisation et possibilité de retour.",
  ],
];
function options(values, current) {
  return values
    .map(
      (v) =>
        `<option value="${v}" ${String(v) === String(current) ? "selected" : ""}>${v}</option>`,
    )
    .join("");
}
function lab() {
  return `${header("LE LABORATOIRE", "Chaque paquet a une histoire.", "Changez les paramètres. Prédisez le résultat. Suivez la décision, étape par étape.")}<div class="notice lab-notice"><b>SIMULATION PÉDAGOGIQUE</b> Modèle simplifié, indépendant de FortiOS. Aucun paquet réel envoyé. Aucune configuration appliquée à un équipement.</div><div class="scenario-tabs" role="group" aria-label="Scénarios">${scenarios.map(([id, title], i) => `<button data-scenario="${id}" class="scenario ${scenario === id ? "selected" : ""}" aria-pressed="${scenario === id}"><small>0${i + 1}</small>${title}</button>`).join("")}</div><div class="lab-mission"><span>VOTRE MISSION</span><p>${scenarios.find((s) => s[0] === scenario)?.[2] || "Explorez votre configuration."}</p><button id="reset-lab" class="text-link">Réinitialiser le labo ↺</button></div><form id="packet-form" class="packet-form"><label>Interface d’entrée<select name="incoming">${options(["lan", "dmz", "wan1"], config.packet.incoming)}</select></label><label>IP source<input name="src" value="${esc(config.packet.src)}" required></label><span class="packet-arrow">→</span><label>IP destination<input name="dst" value="${esc(config.packet.dst)}" required></label><label>Protocole<select name="protocol">${options(["TCP", "UDP", "ICMP"], config.packet.protocol)}</select></label><label>Port destination<input name="port" type="number" min="1" max="65535" value="${config.packet.port}" ${config.packet.protocol === "ICMP" ? "disabled" : ""}></label><button class="button lime" type="submit">Lancer le flux ↗</button></form><div id="lab-error" class="error" role="alert"></div><section class="flow-stage"><div class="flow-stage-head"><span class="eyebrow">LE PARCOURS DU PAQUET</span><span class="model-label">IPv4 · Nouvelle session · SNAT par policy</span></div><div id="flow-output" aria-live="polite">${flowOutput()}</div></section><div class="lab-config"><section class="panel"><div class="section-top compact"><h2>01 <span>Table de routage</span></h2><button class="small-button" id="add-route">+ Route</button></div><p class="caption">Préfixe le plus long, puis distance. À égalité complète, première ligne retenue (ECMP non simulé).</p><div class="table-wrap"><table><thead><tr><th>Active</th><th>Destination / préfixe</th><th>Sortie</th><th>Distance</th><th>Retirer</th></tr></thead><tbody>${config.routes.map((r, i) => `<tr><td><input type="checkbox" aria-label="Route ${i + 1} active" data-route="${i}" data-field="enabled" ${r.enabled ? "checked" : ""}></td><td><input aria-label="Réseau route ${i + 1}" data-route="${i}" data-field="network" value="${esc(r.network)}"></td><td><select aria-label="Sortie route ${i + 1}" data-route="${i}" data-field="outgoing">${options(["wan1", "dmz", "lan"], r.outgoing)}</select></td><td><input type="number" min="0" max="255" aria-label="Distance route ${i + 1}" data-route="${i}" data-field="distance" value="${esc(r.distance)}"></td><td><button class="icon-button" data-remove-route="${i}" aria-label="Supprimer route ${i + 1}">×</button></td></tr>`).join("")}</tbody></table></div></section><section class="panel"><div class="section-top compact"><h2>02 <span>Policies · première correspondance</span></h2><button class="small-button" id="add-policy">+ Policy</button></div><p class="caption">Évaluez les règles de haut en bas. Leur identifiant ne définit pas leur priorité.</p><div class="policy-list">${config.policies.map((p, i) => `<div class="policy-editor"><div class="policy-title"><label><input type="checkbox" data-policy="${i}" data-field="enabled" ${p.enabled ? "checked" : ""}> <b>#${p.id}</b> ${esc(p.name)}</label><div><button class="icon-button" data-move="${i}" data-dir="-1" ${i === 0 ? "disabled" : ""} aria-label="Monter policy ${p.id}">↑</button><button class="icon-button" data-move="${i}" data-dir="1" ${i === config.policies.length - 1 ? "disabled" : ""} aria-label="Descendre policy ${p.id}">↓</button><button class="icon-button" data-remove-policy="${i}" aria-label="Supprimer policy ${p.id}">×</button></div></div><div class="policy-fields"><label>Entrée<select data-policy="${i}" data-field="incoming">${options(["any", "lan", "dmz", "wan1"], p.incoming)}</select></label><label>Sortie<select data-policy="${i}" data-field="outgoing">${options(["any", "lan", "dmz", "wan1"], p.outgoing)}</select></label><label>Source / préfixe<input data-policy="${i}" data-field="source" value="${esc(p.source)}"></label><label>Destination / préfixe<input data-policy="${i}" data-field="destination" value="${esc(p.destination)}"></label><label>Protocole<select data-policy="${i}" data-field="protocol">${options(["ALL", "TCP", "UDP", "ICMP"], p.protocol)}</select></label><label>Port ou ALL<input data-policy="${i}" data-field="port" value="${esc(p.port)}"></label><label>Action<select data-policy="${i}" data-field="action">${options(["accept", "deny"], p.action)}</select></label><label class="nat-toggle"><input type="checkbox" data-policy="${i}" data-field="nat" ${p.nat ? "checked" : ""}> SNAT</label></div></div>`).join("")}</div></section></div><details class="model-details"><summary>Ce que ce modèle simule — et ses limites</summary><p>Le modèle traite un premier paquet IPv4 en mode routé, avec policies profile-based, routage statique simplifié et SNAT d’interface. Les routes actives, la disponibilité des interfaces et la joignabilité du prochain saut sont supposées. Le port source est fixé à 51514 pour TCP/UDP.</p><p>Non simulés : sessions existantes, ARP, RPF, VIP/DNAT, Central NAT, IPv6, SD-WAN, PBR, ECMP, horaires, identités, inspection TLS/UTM, accélération matérielle et trafic local-in. Le résultat « autorisé » décrit la décision du modèle, sans garantie de livraison ou de réponse. Pour ICMP, les ports sont ignorés.</p><p>Les scénarios utilisent des adresses réservées à la documentation. La configuration du laboratoire est temporaire ; la progression des cours est sauvegardée séparément.</p></details>`;
}
function flowOutput() {
  if (!result)
    return `<div class="empty-flow">${flowDiagram()}<p>Votre paquet est prêt. <b>Lancez le flux</b> pour révéler son parcours.</p></div>`;
  const visible = result.steps.slice(0, step + 1);
  return `<div class="trace-status ${result.verdict === "accept" ? "accepted" : "denied"}"><span>${step < result.steps.length - 1 ? "◷ Analyse en cours" : result.verdict === "accept" ? "✓ Autorisé par le modèle" : "⊘ Flux interrompu"}</span><small>Étape ${step + 1} / ${result.steps.length}</small></div><ol class="trace">${visible.map((s, i) => `<li class="${s.status}"><span class="trace-index">${s.status === "deny" ? "×" : i + 1}</span><div><h3>${esc(s.title)}</h3><p>${esc(s.detail)}</p>${s.checked ? `<div class="rule-checks">${s.checked.map((p) => `<span>#${p.id} · ${p.reasons.length ? "écart : " + p.reasons.join(", ") : "correspondance ✓"}</span>`).join("")}</div>` : ""}</div></li>`).join("")}</ol><div class="trace-controls"><button class="button secondary" id="step-back" ${step === 0 ? "disabled" : ""}>← Précédent</button><button class="button dark" id="step-next" ${step >= result.steps.length - 1 ? "disabled" : ""}>Étape suivante →</button><button class="text-link" id="all-steps">Tout révéler</button><button class="text-link" id="export-trace">Exporter la trace ↓</button></div>`;
}
function progressView() {
  return `${header("VOTRE CARNET DE ROUTE", "La régularité fait la différence.", "Lecture, acquis et notes restent sur ce navigateur. Exportez votre progression pour la retrouver ailleurs.")}<div class="progress-stats"><div class="panel"><span>MODULES LUS</span><strong>${Object.keys(progress.read).length}<small> / 8</small></strong>${meter(Object.keys(progress.read).length, 8)}</div><div class="panel"><span>QUIZ MAÎTRISÉS · 3/3</span><strong>${mastery()}<small> / 8</small></strong><p>Dernier résultat complet de chaque module.</p></div><div class="panel"><span>VOS NOTES</span><strong>${Object.values(progress.notes).filter(Boolean).length}<small> modules</small></strong><p>Vos repères pour la prochaine session.</p></div></div><section class="panel progress-table"><h2>Le détail de votre parcours</h2>${courses.map((c) => `<a href="#course/${c.slug}" class="progress-course"><span class="course-icon tone-${c.id % 4}">${c.icon}</span><span><b>${c.title}</b><small>${progress.read[c.slug] ? "Lecture terminée" : "À lire"}</small></span><span class="score-tag">${progress.scores[c.slug] ? `${progress.scores[c.slug].correct}/3` : "Quiz à faire"}</span><span>↗</span></a>`).join("")}</section><section class="panel portability"><h2>Votre progression vous appartient.</h2><p>Pas de compte, de suivi publicitaire ni de synchronisation automatique. L’export JSON inclut vos notes personnelles.</p><div class="actions"><button class="button dark" id="export-progress">Exporter ma progression ↓</button><label class="button secondary" for="import-progress">Importer un fichier ↑</label><input class="file-input" id="import-progress" type="file" accept=".json,application/json"></div><p id="import-status" role="status"></p><details class="reset-details"><summary>Effacer la progression de ce navigateur</summary><p>Cette action efface les lectures, résultats et notes. Pensez à exporter avant de continuer.</p><button class="button danger" id="reset-progress">Effacer mes données locales</button></details></section>`;
}
function reference() {
  return `${header("À GARDER SOUS LA MAIN", "Les mots justes. Les bons outils.", "Un glossaire et des commandes de consultation pour retrouver rapidement vos repères.")}<section class="panel"><label class="reference-search" for="glossary-search">Rechercher une définition<input id="glossary-search" type="search" placeholder="NAT, session, VLAN…"></label><div class="glossary-grid" id="glossary-results">${glossary.map(([term, definition]) => `<div class="definition"><h3>${term}</h3><p>${definition}</p></div>`).join("")}</div><p id="glossary-count" role="status">${glossary.length} définitions</p></section><div class="section-top"><h2>L’aide-mémoire CLI</h2><span class="tag">FortiOS 7.4 · Lecture / diagnostic</span></div><div class="reference-grid">${courses
    .filter((c) => [2, 3, 4, 7, 8].includes(c.id))
    .map(
      (c) =>
        `<section class="panel"><h3>${c.title}</h3><div class="code-head"><span>Exemples CLI</span><button data-copy="${c.slug}">Copier</button></div><pre><code>${esc(c.cli)}</code></pre><p class="caption">${c.cliNote}</p><a class="text-link" href="#course/${c.slug}">Comprendre le contexte ↗</a></section>`,
    )
    .join("")}</div>`;
}
function searchView() {
  const q = normalize(search);
  const hits = q
    ? courses.filter((c) =>
        normalize(
          [
            c.title,
            c.summary,
            c.lessons.flat().join(" "),
            c.cli,
            ...c.quiz.map((q) => q.prompt),
          ].join(" "),
        ).includes(q),
      )
    : [];
  const words = q
    ? glossary.filter((g) => normalize(g.join(" ")).includes(q))
    : [];
  return `${header("RECHERCHE", search ? `Résultats pour « ${esc(search)} »` : "Une notion à retrouver ?", `${hits.length} module(s) et ${words.length} définition(s). La recherche ignore la casse et les accents.`)}${!q ? '<p class="empty-state">Saisissez un terme dans la recherche en haut de page.</p>' : !hits.length && !words.length ? '<p class="empty-state">Aucun résultat. Essayez « NAT », « route », « session » ou une commande FortiOS.</p>' : ""}<div class="course-grid">${hits.map(card).join("")}</div><div class="glossary-grid">${words.map(([w, d]) => `<div class="definition"><h3>${w}</h3><p>${d}</p></div>`).join("")}</div>`;
}
function download(name, content, type = "application/json") {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function bindGlobal() {
  $(".skip").onclick = (e) => {
    e.preventDefault();
    const main = $("#main");
    main.setAttribute("tabindex", "-1");
    main.focus();
    main.scrollIntoView();
  };
  $("#global-search").onsubmit = (e) => {
    e.preventDefault();
    search = new FormData(e.currentTarget).get("query").trim();
    if (location.hash === "#search") render();
    else location.hash = "search";
  };
  $$("[data-copy]").forEach(
    (b) =>
      (b.onclick = async () => {
        try {
          await navigator.clipboard.writeText(
            courses.find((c) => c.slug === b.dataset.copy).cli,
          );
          toast("Commandes copiées.");
        } catch {
          toast("Copie indisponible. Sélectionnez le texte de la commande.");
        }
      }),
  );
}
function bindPage(path) {
  $$("[data-filter]").forEach(
    (b) =>
      (b.onclick = () => {
        filter = b.dataset.filter;
        render();
        $(`[data-filter="${filter}"]`).focus();
      }),
  );
  $$("[data-anchor]").forEach(
    (a) =>
      (a.onclick = (e) => {
        e.preventDefault();
        const target = $("#" + a.dataset.anchor);
        target.scrollIntoView({
          behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "instant"
            : "smooth",
        });
        target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
      }),
  );
  $$("[data-read]").forEach(
    (b) =>
      (b.onclick = () => {
        const id = b.dataset.read;
        progress.read[id]
          ? delete progress.read[id]
          : (progress.read[id] = true);
        save();
        const count = Object.keys(progress.read).length;
        $(".rail-progress strong").innerHTML =
          count + "<small> / 8 modules lus</small>";
        $(".rail-progress .meter").outerHTML = meter(count, 8);
        b.textContent = progress.read[id]
          ? "✓ Module marqué comme lu"
          : "Marquer ce module comme lu";
        b.setAttribute("aria-pressed", String(!!progress.read[id]));
        toast(
          progress.read[id]
            ? "Lecture enregistrée. Le quiz suit vos acquis séparément."
            : "Statut de lecture retiré.",
        );
      }),
  );
  const note = $("#personal-note");
  if (note)
    note.oninput = () => {
      progress.notes[note.dataset.slug] = note.value;
      save();
      $("#note-status").textContent = persistent
        ? "Note enregistrée."
        : "Note conservée pour cette session uniquement.";
    };
  const quiz = $("#quiz-form");
  if (quiz) {
    const c = courses.find((c) => c.slug === quiz.dataset.slug);
    quiz.onsubmit = (e) => {
      e.preventDefault();
      const data = new FormData(quiz),
        answers = c.quiz.map((_, i) => data.get("q" + i));
      const g = grade(c.quiz, answers);
      g.results.forEach((r, i) => {
        const fb = $("#feedback-" + i);
        fb.hidden = false;
        fb.className = "feedback " + r;
        fb.textContent =
          r === "missing"
            ? "Sans réponse : répondez à cette question avant d’enregistrer le résultat."
            : `${r === "correct" ? "✓ Bonne réponse." : "✕ À revoir."} ${c.quiz[i].explanation} Réponse attendue : ${c.quiz[i].type === "choice" ? c.quiz[i].options[c.quiz[i].answer] : c.quiz[i].answers[0]}.`;
      });
      if (!g.missing) {
        progress.scores[c.slug] = { correct: g.correct, total: g.total };
        save();
      }
      $("#quiz-score").textContent = g.missing
        ? `${g.missing} question(s) sans réponse. Résultat non enregistré ; le précédent score est conservé.`
        : `Résultat enregistré : ${g.correct}/${g.total}. ${g.correct === g.total ? "Les trois notions sont acquises !" : "Relisez les explications, puis réessayez."}`;
    };
    quiz.onreset = () => {
      $$(".feedback", quiz).forEach((f) => (f.hidden = true));
      $("#quiz-score").textContent =
        "Nouvelle tentative. Le dernier résultat reste conservé jusqu’à validation complète.";
    };
    quiz.oninput = () => {
      $$(".feedback", quiz).forEach((f) => (f.hidden = true));
      $("#quiz-score").textContent =
        "Réponses en cours. Validez pour enregistrer cette tentative.";
    };
  }
  if (path === "lab") bindLab();
  if (path === "progress") {
    $("#export-progress").onclick = () =>
      download(
        "fortinet-academy-progression.json",
        JSON.stringify(progress, null, 2),
      );
    $("#import-progress").onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        if (file.size > 100000)
          throw new Error("Fichier trop volumineux (100 Ko maximum).");
        const imported = sanitizeProgress(
          JSON.parse(await file.text()),
          courses,
        );
        progress = imported;
        save();
        render();
        toast("Progression importée.");
      } catch (error) {
        $("#import-status").textContent = "Import refusé : " + error.message;
      }
      e.target.value = "";
    };
    $("#reset-progress").onclick = () => {
      progress = emptyProgress();
      save();
      render();
      toast("Progression et notes effacées.");
    };
  }
  const gs = $("#glossary-search");
  if (gs)
    gs.oninput = () => {
      const items = glossary.filter((g) =>
        normalize(g.join(" ")).includes(normalize(gs.value)),
      );
      $("#glossary-results").innerHTML = items
        .map(
          ([t, d]) => `<div class="definition"><h3>${t}</h3><p>${d}</p></div>`,
        )
        .join("");
      $("#glossary-count").textContent = items.length
        ? `${items.length} définition(s)`
        : "Aucune définition trouvée.";
    };
}
function loadScenario(id) {
  scenario = id;
  config = defaultConfig();
  if (id === "dmz") config.packet.dst = "10.10.20.10";
  if (id === "order") config.policies.unshift(config.policies.pop());
  if (id === "route") config.routes[1].enabled = false;
  if (id === "nat") config.policies[0].nat = false;
  result = null;
  step = -1;
  render();
}
function readPacket() {
  const f = $("#packet-form");
  const data = new FormData(f);
  config.packet = {
    src: data.get("src").trim(),
    dst: data.get("dst").trim(),
    protocol: data.get("protocol"),
    port: Number(data.get("port") || 443),
    incoming: data.get("incoming"),
  };
}
function invalidate() {
  result = null;
  step = -1;
  $("#flow-output").innerHTML = flowOutput();
  $("#lab-error").textContent = "";
}
function refreshFlow() {
  const focus = document.activeElement?.id;
  $("#flow-output").innerHTML = flowOutput();
  bindTrace();
  if (focus && ["step-back", "step-next", "all-steps"].includes(focus)) {
    const target = document.getElementById(focus);
    if (target && !target.disabled) target.focus();
    else $("#all-steps")?.focus();
  }
}
function bindTrace() {
  if (!result) return;
  $("#step-back").onclick = () => {
    step = Math.max(0, step - 1);
    refreshFlow();
  };
  $("#step-next").onclick = () => {
    step = Math.min(result.steps.length - 1, step + 1);
    refreshFlow();
  };
  $("#all-steps").onclick = () => {
    step = result.steps.length - 1;
    refreshFlow();
  };
  $("#export-trace").onclick = () =>
    download(
      "fortinet-academy-trace.json",
      JSON.stringify(
        { model: "Pédagogique, non FortiOS", config, result },
        null,
        2,
      ),
    );
}
function bindLab() {
  $$("[data-scenario]").forEach(
    (b) => (b.onclick = () => loadScenario(b.dataset.scenario)),
  );
  $("#reset-lab").onclick = () => loadScenario("web");
  $("#packet-form").onsubmit = (e) => {
    e.preventDefault();
    try {
      readPacket();
      result = simulate(config);
      step = 0;
      $("#lab-error").textContent = "";
      refreshFlow();
      $("#flow-output").setAttribute("aria-live", "polite");
    } catch (error) {
      result = null;
      step = -1;
      refreshFlow();
      $("#lab-error").textContent = error.message;
    }
  };
  $("#packet-form").oninput = () => {
    readPacket();
    $('#packet-form [name="port"]').disabled =
      config.packet.protocol === "ICMP";
    invalidate();
  };
  $$("[data-route],[data-policy]").forEach(
    (el) =>
      (el.onchange = () => {
        const isRoute = el.dataset.route !== undefined;
        const row = (isRoute ? config.routes : config.policies)[
          Number(isRoute ? el.dataset.route : el.dataset.policy)
        ];
        let value = el.type === "checkbox" ? el.checked : el.value.trim();
        if (el.dataset.field === "distance") value = Number(value);
        if (el.dataset.field === "port")
          value = String(value).toUpperCase() === "ALL" ? "ALL" : Number(value);
        row[el.dataset.field] = value;
        invalidate();
      }),
  );
  $$("[data-move]").forEach(
    (b) =>
      (b.onclick = () => {
        readPacket();
        const i = Number(b.dataset.move),
          j = i + Number(b.dataset.dir);
        [config.policies[i], config.policies[j]] = [
          config.policies[j],
          config.policies[i],
        ];
        result = null;
        render();
      }),
  );
  $$("[data-remove-route]").forEach(
    (b) =>
      (b.onclick = () => {
        readPacket();
        config.routes.splice(Number(b.dataset.removeRoute), 1);
        result = null;
        render();
      }),
  );
  $$("[data-remove-policy]").forEach(
    (b) =>
      (b.onclick = () => {
        readPacket();
        config.policies.splice(Number(b.dataset.removePolicy), 1);
        result = null;
        render();
      }),
  );
  $("#add-route").onclick = () => {
    readPacket();
    config.routes.push({
      id: Date.now(),
      network: "192.0.2.0/24",
      outgoing: "wan1",
      distance: 10,
      enabled: true,
    });
    result = null;
    render();
  };
  $("#add-policy").onclick = () => {
    readPacket();
    config.policies.push({
      id: Math.max(0, ...config.policies.map((p) => p.id)) + 10,
      name: "Nouvelle règle",
      incoming: "lan",
      outgoing: "wan1",
      source: "10.10.10.0/24",
      destination: "0.0.0.0/0",
      protocol: "TCP",
      port: 443,
      action: "accept",
      nat: false,
      enabled: true,
    });
    result = null;
    render();
  };
  bindTrace();
}
window.addEventListener("hashchange", () => {
  render();
  window.scrollTo(0, 0);
  $("h1")?.focus({ preventScroll: true });
});
render();
