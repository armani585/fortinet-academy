import {readFileSync, existsSync, statSync, readdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
import {courses,sources} from '../content/courses.mjs';
import {labs} from '../content/labs.mjs';
const root = path.resolve(fileURLToPath(new URL('../',import.meta.url)));
const site = JSON.parse(readFileSync(path.join(root,'content/site.json'),'utf8'));
const esc = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let texts=0, links=0;
const walk=dir=>readdirSync(dir,{withFileTypes:true}).flatMap(x=>x.isDirectory()?walk(path.join(dir,x.name)):[path.join(dir,x.name)]);
const htmlFiles=walk(root).filter(f=>f.endsWith('.html'));
assert.equal(courses.length,21);assert.equal(labs.length,8);assert.equal(htmlFiles.length,35);
assert.equal(new Set(courses.map(c=>c.slug)).size,21);
for(const c of courses){
 assert.equal(c.lessons.length,3);assert.equal(c.quiz.length,3);
 for(const key of c.refs)assert(sources[key],`Unknown source ${key}`);
 for(const q of c.quiz){assert(q.explanation);if(q.type==='choice')assert(q.answer>=0&&q.answer<q.options.length);else assert(q.answers.length);}
 const html=readFileSync(path.join(root,'modules',c.slug,'index.html'),'utf8');
 const data=JSON.parse(html.match(/<script type="application\/json" id="quiz-data">([\s\S]*?)<\/script>/)[1]);
 assert.deepEqual(data,c.quiz);
 for(const [heading,body] of c.lessons){assert(html.includes(esc(heading)));assert(html.includes(esc(body)));}
}
for (const file of htmlFiles) {
  const slug='/'+path.relative(root,path.dirname(file)).replaceAll(path.sep,'/');
  const p=site.pages.find(p=>p.slug===slug)||{slug,text_nodes:[]};
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
console.log(`PASS: ${htmlFiles.length} pages, 21 modules, 63 leçons et questions, 8 labs ; ${texts} textes source, ${links} liens/ressources et les corrigés embarqués vérifiés.`);
