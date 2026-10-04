(() => {
  'use strict';
  const key = 'fortinet-academy-progress-v1';
  let state = {read:{},scores:{}};
  let persistent = true;
  try {
    const saved = JSON.parse(localStorage.getItem(key) || 'null');
    if (saved && typeof saved === 'object' && saved.read && saved.scores) {
      for (let id=1;id<=21;id++) {
        if(saved.read[id]===true)state.read[id]=true;
        const s=saved.scores[id];
        if(s && Number.isInteger(s.correct) && Number.isInteger(s.total) && s.total===3 && s.correct>=0 && s.correct<=3)state.scores[id]={correct:s.correct,total:s.total};
      }
    }
  } catch { persistent = false; }
  function storageNotice(){
    document.querySelectorAll('[data-storage-status]').forEach(el=>{el.textContent=persistent?'Progression conservée uniquement dans ce navigateur.':'Stockage indisponible : les activités fonctionnent, mais les résultats de cette session ne seront pas conservés.';});
  }
  function save(){try{localStorage.setItem(key,JSON.stringify(state));}catch{persistent=false;}storageNotice();}
  function refresh(){
    document.querySelectorAll('[data-module-status]').forEach(el=>{
      const id=el.dataset.moduleStatus,s=state.scores[id];
      el.textContent=`${state.read[id]?'Marqué comme lu':'Lecture non déclarée'} · ${s?`Quiz : ${s.correct}/${s.total}`:'Quiz non validé'}`;
    });
    const summary=document.querySelector('[data-progress-summary]');
    if(summary){const scores=Object.values(state.scores);summary.textContent=`${Object.keys(state.read).length}/21 modules marqués comme lus · ${scores.length}/21 quiz validés · ${scores.reduce((n,s)=>n+s.correct,0)}/${scores.reduce((n,s)=>n+s.total,0)} points sur les quiz validés.`;}
    const read=document.querySelector('[data-read]');
    if(read){const done=Boolean(state.read[read.dataset.read]);read.textContent=done?'Retirer le statut « lu »':'Marquer comme lu';read.setAttribute('aria-pressed',String(done));document.querySelector('[data-read-status]').textContent=done?'Lecture déclarée. Vérifie maintenant tes acquis avec le quiz.':'La lecture et le score du quiz sont suivis séparément.';}
  }
  document.querySelectorAll('[data-progress-panel], [data-read], [data-quiz]').forEach(el=>el.hidden=false);
  document.querySelector('[data-read]')?.addEventListener('click',event=>{
    const id=event.currentTarget.dataset.read;
    if(state.read[id])delete state.read[id];else state.read[id]=true;
    save();refresh();
  });
  document.querySelector('[data-reset-progress]')?.addEventListener('click',()=>{
    state={read:{},scores:{}};save();refresh();
    document.querySelector('[data-progress-summary]').textContent='Progression effacée : 0/21 modules lus et aucun quiz validé.';
  });
  const normalize = value=>String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[’']/g,' ').replace(/[.,;:!?]/g,'').replace(/\s+/g,' ').trim();
  const form=document.querySelector('[data-quiz]');
  if(form){
    const data=JSON.parse(document.querySelector('#quiz-data').textContent);
    const id=form.dataset.quiz;
    const score=form.querySelector('[data-score]');
    const previous=state.scores[id];
    if(previous)score.textContent=`Dernier score enregistré : ${previous.correct}/${previous.total}. Les réponses ne sont pas sauvegardées ; cette tentative commence vide.`;
    let validated=false;
    form.addEventListener('submit',event=>{
      event.preventDefault();let correct=0,missing=0;
      data.forEach((q,i)=>{
        const value=q.type==='choice'?form.querySelector(`input[name="q${i}"]:checked`)?.value:form.elements.namedItem(`q${i}`).value.trim();
        const feedback=form.querySelector(`[data-feedback="${i}"]`);feedback.hidden=false;
        if(value===undefined || value===''){missing++;feedback.textContent='Sans réponse — choisis ou saisis une réponse pour recevoir une correction.';feedback.dataset.result='missing';return;}
        const ok=q.type==='choice'?Number(value)===q.answer:q.answers.some(a=>normalize(a)===normalize(value));
        if(ok)correct++;
        feedback.dataset.result=ok?'correct':'incorrect';
        feedback.textContent=`${ok?'Correct':'À revoir'}. ${q.explanation} Réponse attendue : ${q.type==='choice'?q.options[q.answer]:q.answers[0]}.`;
      });
      score.textContent=`Score : ${correct}/${data.length} · ${missing} sans réponse · ${data.length-correct-missing} incorrecte(s). Tu peux modifier tes réponses puis vérifier à nouveau.`;
      validated=true;state.scores[id]={correct,total:data.length};save();refresh();
    });
    form.addEventListener('input',()=>{
      if(validated){validated=false;delete state.scores[id];save();score.textContent='Réponses modifiées : vérifie à nouveau pour enregistrer le nouveau score.';form.querySelectorAll('[data-feedback]').forEach(el=>el.hidden=true);}
    });
    form.addEventListener('reset',()=>{
      validated=false;delete state.scores[id];save();refresh();
      form.querySelectorAll('[data-feedback]').forEach(el=>{el.hidden=true;el.textContent='';});
      score.textContent='Nouvelle tentative : réponses et score de ce quiz remis à zéro.';
    });
  }
  storageNotice();refresh();
})();
