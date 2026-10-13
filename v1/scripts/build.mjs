import {mkdir,copyFile,cp} from 'node:fs/promises';
await mkdir('dist',{recursive:true});
for(const file of ['index.html','favicon.svg','.nojekyll'])await copyFile(file,'dist/'+file);
await cp('src','dist/src',{recursive:true});
console.log('Site statique prêt dans dist/. Aucun service externe requis.');
