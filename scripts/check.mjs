import {readFileSync, existsSync, statSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
const root = path.resolve(fileURLToPath(new URL('../',import.meta.url)));
const site = JSON.parse(readFileSync(path.join(root,'content/site.json'),'utf8'));
const esc = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let texts=0, links=0;
for (const p of site.pages) {
  const file=path.join(root,p.slug.slice(1),'index.html');
  const html=readFileSync(file,'utf8');
  assert.equal((html.match(/<h1[ >]/g)||[]).length,1,`${p.slug}: exactly one H1`);
  assert(html.includes('<html lang="fr">'));
  for (const n of p.text_nodes) {assert(html.includes(esc(n.current_text)),`Missing source text: ${n.id}`);texts++;}
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(ids.length,new Set(ids).size,`${p.slug}: unique IDs`);
  for (const [,link] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    assert(!link.startsWith('/'),`Root-relative link breaks project Pages: ${link}`);
    if (/^https?:|^mailto:/.test(link)) continue;
    const [route,hash]=link.split('#');
    let target=route ? path.resolve(path.dirname(file),route) : file;
    assert(target === root || target.startsWith(root + path.sep),`Link escapes site: ${link}`);
    assert(existsSync(target),`Missing ${target}`);
    if(statSync(target).isDirectory())target=path.join(target,'index.html');
    assert(existsSync(target),`Missing index: ${target}`);
    if(hash)assert(readFileSync(target,'utf8').includes(`id="${hash}"`),`Missing anchor: ${link}`);
    links++;
  }
}
console.log(`PASS: ${site.pages.length} pages, ${texts} textes source préservés, ${links} liens et ressources valides, titres et identifiants vérifiés.`);
