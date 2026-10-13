// Pure teaching model: IPv4, first packet, static routes, profile-based policies, policy SNAT.
export function ipv4(value) {
  if(typeof value !== 'string' || !/^(0|[1-9]\d{0,2})(\.(0|[1-9]\d{0,2})){3}$/.test(value)) throw new Error('Adresse IPv4 invalide : '+value);
  const bytes=value.split('.').map(Number);
  if(bytes.some(n=>n>255)) throw new Error('Chaque octet IPv4 doit être compris entre 0 et 255.');
  return bytes.reduce((n,b)=>n*256+b,0)>>>0;
}
export function cidr(value) {
  const [address,prefix,...extra]=String(value).split('/');
  if(extra.length || !/^(\d|[12]\d|3[0-2])$/.test(prefix||'')) throw new Error('Réseau attendu au format IPv4/préfixe (0 à 32).');
  const ip=ipv4(address), bits=Number(prefix), mask=bits===0?0:(0xffffffff << (32-bits))>>>0;
  return {network:(ip&mask)>>>0,mask,bits};
}
export function contains(network,address) { const c=cidr(network);return ((ipv4(address)&c.mask)>>>0)===c.network; }
export function validateConfig(config) {
  const {packet,routes,policies}=config;
  ipv4(packet.src);ipv4(packet.dst);
  if(!['TCP','UDP','ICMP'].includes(packet.protocol)) throw new Error('Protocole non pris en charge.');
  if(!['lan','dmz','wan1'].includes(packet.incoming)) throw new Error('Interface d’entrée inconnue.');
  if(packet.protocol!=='ICMP' && (!Number.isInteger(packet.port)||packet.port<1||packet.port>65535))throw new Error('Le port destination doit être compris entre 1 et 65535.');
  for(const r of routes){cidr(r.network);if(!['wan1','dmz','lan'].includes(r.outgoing))throw new Error('Interface de route invalide.');if(!Number.isInteger(r.distance)||r.distance<0||r.distance>255)throw new Error('Distance attendue entre 0 et 255.');}
  for(const p of policies){cidr(p.source);cidr(p.destination);if(!['accept','deny'].includes(p.action))throw new Error('Action de policy invalide.');if(!['ALL','TCP','UDP','ICMP'].includes(p.protocol))throw new Error('Protocole de policy invalide.');if(p.port!=='ALL'&&(!Number.isInteger(p.port)||p.port<1||p.port>65535))throw new Error('Port de policy invalide.');}
}
export function simulate(config) {
  validateConfig(config);
  const {packet,routes,policies}=config;
  const steps=[{title:'Entrée du paquet',status:'ok',detail:`${packet.src}${packet.protocol==='ICMP'?'':':51514'} → ${packet.dst}${packet.protocol==='ICMP'?'':':'+packet.port} · ${packet.protocol} · interface ${packet.incoming}. Nouvelle session supposée.`}];
  const route=routes.filter(r=>r.enabled&&contains(r.network,packet.dst)).sort((a,b)=>cidr(b.network).bits-cidr(a.network).bits||a.distance-b.distance)[0];
  if(!route){steps.push({title:'Aucune route',status:'deny',detail:'Aucune route active ne couvre la destination. Le traitement s’arrête avant la recherche de policy. Ajoutez une route adaptée.'});return {verdict:'no-route',steps,policy:null,route:null};}
  steps.push({title:'Route sélectionnée',status:'ok',detail:`${route.network} → ${route.outgoing}, distance ${route.distance}. Préfixe le plus long ; distance départage les préfixes identiques.`});
  const checked=[];let policy;
  for(const p of policies){const reasons=[];if(!p.enabled)reasons.push('désactivée');if(p.incoming!=='any'&&p.incoming!==packet.incoming)reasons.push('interface d’entrée');if(p.outgoing!=='any'&&p.outgoing!==route.outgoing)reasons.push('interface de sortie');if(!contains(p.source,packet.src))reasons.push('source');if(!contains(p.destination,packet.dst))reasons.push('destination');if(p.protocol!=='ALL'&&p.protocol!==packet.protocol)reasons.push('protocole');if(packet.protocol!=='ICMP'&&p.port!=='ALL'&&p.port!==packet.port)reasons.push('port');checked.push({id:p.id,reasons});if(!reasons.length){policy=p;break;}}
  if(!policy){steps.push({title:'Refus implicite',status:'deny',detail:'Aucune policy ne correspond à toutes les caractéristiques du flux. Le NAT ne peut pas autoriser le trafic.',checked});return {verdict:'implicit-deny',steps,route,policy:null};}
  steps.push({title:`Policy #${policy.id} · ${policy.name}`,status:policy.action==='deny'?'deny':'ok',detail:`Première correspondance dans l’ordre affiché. Action : ${policy.action==='accept'?'autoriser':'refuser'}. Les règles suivantes ne sont pas évaluées.`,checked});
  if(policy.action==='deny')return {verdict:'explicit-deny',steps,route,policy};
  const translated=policy.nat?({wan1:'203.0.113.2',dmz:'10.10.20.1',lan:'10.10.10.1'}[route.outgoing]):packet.src;
  steps.push({title:policy.nat?'Traduction source (SNAT)':'Source conservée',status:'ok',detail:policy.nat?`${packet.src} → ${translated}. Le port source peut aussi être traduit (allocation PAT non simulée).`:`${packet.src} reste inchangée. Sans SNAT, le réseau distant doit savoir router vers cette source.`});
  steps.push({title:'Paquet autorisé en sortie',status:'ok',detail:`Sortie ${route.outgoing} : ${translated} → ${packet.dst}. Cela ne prouve ni la réponse du serveur, ni le chemin retour, ni le succès applicatif.`});
  return {verdict:'accept',steps,route,policy,translated};
}
export function defaultConfig() { return {packet:{src:'10.10.10.10',dst:'198.51.100.20',protocol:'TCP',port:443,incoming:'lan'},routes:[{id:1,network:'10.10.20.0/24',outgoing:'dmz',distance:0,enabled:true},{id:2,network:'0.0.0.0/0',outgoing:'wan1',distance:10,enabled:true}],policies:[{id:10,name:'LAN vers HTTPS',incoming:'lan',outgoing:'wan1',source:'10.10.10.0/24',destination:'0.0.0.0/0',protocol:'TCP',port:443,action:'accept',nat:true,enabled:true},{id:20,name:'LAN vers application DMZ',incoming:'lan',outgoing:'dmz',source:'10.10.10.0/24',destination:'10.10.20.0/24',protocol:'TCP',port:443,action:'accept',nat:false,enabled:true},{id:30,name:'Refus du reste',incoming:'any',outgoing:'any',source:'0.0.0.0/0',destination:'0.0.0.0/0',protocol:'ALL',port:'ALL',action:'deny',nat:false,enabled:true}]}; }
export const normalize=value=>String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[’']/g,' ').replace(/\s+/g,' ').trim();
export function grade(questions,answers) {const results=questions.map((q,i)=>{const a=answers[i];if(a===undefined||a===null||String(a).trim()==='')return 'missing';return (q.type==='choice'?String(a)===String(q.answer):q.answers.some(v=>normalize(v)===normalize(a)))?'correct':'incorrect';});return {correct:results.filter(r=>r==='correct').length,total:questions.length,missing:results.filter(r=>r==='missing').length,results};}
export const emptyProgress=()=>({version:1,read:{},scores:{},notes:{},last:null});
export function sanitizeProgress(raw,courses) {
  if(!raw||raw.version!==1||typeof raw.read!=='object'||!raw.read||typeof raw.scores!=='object'||!raw.scores)throw new Error('Fichier de progression incompatible.');
  const clean=emptyProgress();
  for(const c of courses){const id=c.slug;if(raw.read[id]===true)clean.read[id]=true;const s=raw.scores[id];if(s&&Number.isInteger(s.correct)&&s.correct>=0&&s.correct<=c.quiz.length&&s.total===c.quiz.length)clean.scores[id]={correct:s.correct,total:s.total};if(typeof raw.notes?.[id]==='string')clean.notes[id]=raw.notes[id].slice(0,5000);}
  if(courses.some(c=>c.slug===raw.last))clean.last=raw.last;
  return clean;
}
