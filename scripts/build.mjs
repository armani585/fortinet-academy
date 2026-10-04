import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = fileURLToPath(new URL('../', import.meta.url));
const site = JSON.parse(readFileSync(path.join(root, 'content/site.json'), 'utf8'));
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pages = site.pages;
const title = p => p.slug === '/' ? 'Accueil' : p.title;
function render(p) {
  const prefix = p.slug === '/' ? './' : '../';
  const href = slug => prefix + (slug === '/' ? '' : slug.slice(1) + '/');
  const sections = [...new Set(p.text_nodes.map(n => n.section_id))];
  const item = n => n.kind === 'heading' ? `<h${n.level} id="${esc(n.id)}">${esc(n.current_text)}</h${n.level}>` : `<p class="${n.slot?.includes('eyebrow') ? 'eyebrow' : n.slot === 'card-meta' ? 'number' : ''}" id="${esc(n.id)}">${esc(n.current_text)}</p>`;
  const body = sections.map((id, idx) => {
    const nodes = p.text_nodes.filter(n => n.section_id === id);
    const cards = [], intro = [];
    let current;
    for (const n of nodes) {
      if (n.slot === 'card-meta' || n.slot === 'faq-question' || (n.slot === 'card-title' && !current?.waitingTitle)) {
        current = {nodes:[], faq:n.slot === 'faq-question', waitingTitle:n.slot === 'card-meta'};
        cards.push(current);
      }
      if (current) { current.nodes.push(n); if(n.slot === 'card-title') current.waitingTitle = false; }
      else intro.push(n);
    }
    const isStats = id === 'stats-section';
    let lead = intro.map(item).join('\n');
    if (isStats) {
      lead = intro.filter(n => n.slot !== 'stat-label').map(item).join('\n');
      lead += '<div class="stats">' + intro.filter(n => n.slot === 'stat-label').map((n,i) => `<div><span class="stat-value">${['21','Au programme','3','1'][i]}</span>${item(n)}</div>`).join('') + '</div>';
    }
    const filterable = ['/modules','/labs','/glossaire'].includes(p.slug) && cards.length;
    const search = filterable ? `<div class="search" hidden data-search><label for="filter">Rechercher ${p.slug === '/glossaire' ? 'un terme' : 'dans cette page'}</label><input id="filter" type="search" placeholder="${p.slug === '/glossaire' ? 'NAT, session, ZTNA…' : 'VPN, réseau, sécurité…'}" autocomplete="off"><p role="status" data-results></p></div>` : '';
    const grid = cards.length ? `<div class="${cards[0].faq ? 'questions' : 'grid'}">` + cards.map((c,i) => c.faq ? `<details data-filter-item id="question-${idx}-${i}"><summary>${esc(c.nodes[0].current_text)}</summary><div>${c.nodes.slice(1).map(item).join('\n')}</div></details>` : `<article class="card" data-filter-item>${c.nodes.map(item).join('\n')}</article>`).join('\n') + '</div>' : '';
    const actions = p.cta_nodes.filter(n => n.section_id === id);
    const buttons = actions.length ? `<div class="actions">${actions.map((n,i)=>`<a class="button ${i ? 'secondary' : ''}" href="${href(n.current_href)}">${esc(n.current_text)} <span aria-hidden="true">↗</span></a>`).join('')}</div>` : '';
    return `<section class="section ${idx === 0 ? 'hero' : ''} ${id.startsWith('cta') ? 'callout' : ''}" aria-labelledby="${esc(nodes.find(n=>n.kind==='heading')?.id)}">${lead}${search}${grid}${buttons}</section>`;
  }).join('\n');
  const nav = `<nav id="navigation" aria-label="Navigation principale">${pages.map(x=>`<a href="${href(x.slug)}" ${x.slug===p.slug?'aria-current="page"':''}>${title(x)}</a>`).join('')}</nav>`;
  const i = pages.indexOf(p), next = pages[(i+1)%pages.length];
  const desc = p.text_nodes.find(n=>n.slot==='hero-body' || n.slot==='section-body')?.current_text || `${title(p)} de la formation Fortinet Academy en français.`;
  return `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description" content="${esc(desc)}"><meta name="theme-color" content="#0b0f14"><title>${title(p)} · Fortinet Academy</title><link rel="icon" href="${prefix}assets/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="${prefix}assets/style.css"><script src="${prefix}assets/site.js" defer></script></head>
<body><a class="skip" href="#contenu">Aller au contenu</a><header><div class="header-inner"><a class="brand" href="${href('/')}"><span class="brand-symbol" aria-hidden="true">F<span>\u00b7</span></span><span>Fortinet<span class="brand-sub">ACADEMY</span></span></a><button class="menu-toggle" aria-expanded="false" aria-controls="navigation" hidden>Menu</button>${nav}</div></header>
<main id="contenu"><div class="page-label"><span class="status-dot"></span> FORMATION EN FRANÇAIS <span class="page-index">${String(i+1).padStart(2,'0')} / 06</span></div>${body}<nav class="next-page" aria-label="Continuer la découverte"><span>Continue la découverte</span><a href="${href(next.slug)}">${title(next)} <span aria-hidden="true">→</span></a></nav></main>
<footer><a class="footer-brand" href="${href('/')}">Fortinet Academy<span>Comprendre. Pratiquer. Diagnostiquer.</span></a><p>Programme de formation indépendant.<br>Fortinet et FortiGate sont des marques de leurs détenteurs respectifs.</p><p class="content-note">Cette version reprend la présentation du cursus. Les cours détaillés, quiz et environnements de laboratoire ne sont pas encore inclus.</p><a href="#contenu">Retour en haut ↑</a></footer></body></html>`;
}
for (const p of pages) {
  const dir = path.join(root, p.slug.slice(1));
  mkdirSync(dir, {recursive:true});
  writeFileSync(path.join(dir, 'index.html'), render(p));
}
writeFileSync(path.join(root,'.nojekyll'),'');
console.log(`${pages.length} pages générées.`);
