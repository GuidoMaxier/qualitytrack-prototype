/* ================================================================
   QualityTrack — design/dashboard/12-ui.js
   UI global: modales, toasts, navegación por vistas, buscador global, reloj y arranque.
   Extraído verbatim de design/dashboard.html. Ver README.md del módulo.
   ================================================================ */
/* --- modales --- */
function openModal(title,html){
  const r=$('#modalRoot');
  r.className='fixed inset-0 z-[60] flex items-center justify-center p-4 bg-ink/50 backdrop-blur-[2px]';
  r.innerHTML=`<div class="sheet border-2 border-ink bg-card shadow-hard w-full max-w-[520px] max-h-full flex flex-col">
    <div class="flex items-center justify-between px-5 py-3.5 border-b-2 border-ink bg-paper">
      <span class="kicker" style="color:var(--ink)">${esc(title)}</span>
      <button onclick="closeModal()" class="text-muted hover:text-ink"><i data-lucide="x" class="w-4 h-4"></i></button></div>
    <div class="p-5 overflow-auto scroll-slim">${html}</div></div>`;
  r.onclick=e=>{if(e.target===r)closeModal()};
  lucide.createIcons();
}
function closeModal(){$('#modalRoot').className='fixed inset-0 z-[60] hidden';$('#modalRoot').innerHTML=''}

/* --- notificaciones --- */
function toast(type,title,msg){
  const map={ok:['check-circle-2','ok'],err:['alert-triangle','danger'],info:['info','ink']};
  const [ic,color]=map[type]||map.info;
  const el=document.createElement('div');
  el.className='toast border-2 bg-card shadow-hard p-3.5 flex gap-3 items-start';
  el.style.borderColor=`var(--${color})`;
  el.innerHTML=`<i data-lucide="${ic}" class="w-4 h-4 mt-0.5 shrink-0" style="color:var(--${color})"></i>
    <div class="min-w-0 flex-1"><div class="text-[12.5px] font-bold leading-tight">${esc(title)}</div>
    <div class="text-[12px] text-muted mt-0.5 leading-snug">${esc(msg)}</div></div>
    <button class="text-muted hover:text-ink shrink-0" onclick="this.parentElement.remove()"><i data-lucide="x" class="w-3.5 h-3.5"></i></button>`;
  $('#toasts').appendChild(el);
  lucide.createIcons();
  setTimeout(()=>{el.style.transition='opacity .3s, transform .3s';el.style.opacity='0';el.style.transform='translateX(14px)';setTimeout(()=>el.remove(),320)},4600);
}

/* --- navegación --- */
function renderNav(){
  const tabs=[['board','layout-grid','TRABAJOS'],['trace','scan-search','TRAZABILIDAD'],['new','file-plus','NUEVA SOLICITUD']];
  $('#navTabs').innerHTML=tabs.map(([v,ic,l])=>`
    <button onclick="setView('${v}')" class="flex items-center gap-2 px-4 border-b-[3px] transition-colors ${state.view===v?'border-accent text-ink':'border-transparent text-muted hover:text-ink'}" style="font:600 10.5px 'JetBrains Mono';letter-spacing:.14em">
      <i data-lucide="${ic}" class="w-3.5 h-3.5"></i>${l}</button>`).join('');
}
function render(){
  renderNav();
  if(state.view==='board')renderBoard();
  else if(state.view==='file')renderFile();
  else if(state.view==='trace')renderTrace();
  else if(state.view==='new')renderNew();
}

/* --- buscador global del header --- */
function gSearchInput(v){
  const dp=$('#searchDrop'),inp=$('#gSearch');
  const q=v.trim().toLowerCase();
  if(!q){dp.classList.add('hidden');return}
  const res=OTS.filter(o=>matchQuery(o,q)).slice(0,6);
  const r=inp.getBoundingClientRect();
  dp.style.top=(r.bottom+6)+'px';
  dp.style.left=Math.max(8,r.left)+'px';
  dp.innerHTML=res.length
    ?`<div class="px-4 py-2 bg-ink text-paper kicker">RESULTADOS · ${res.length} · ENTER ABRE EL PRIMERO</div>`
     +res.map(o=>`<button data-ot="${o.id}" onclick="gsOpen('${o.id}')" class="w-full text-left px-4 py-3 border-b border-line last:border-0 hover:bg-paper flex items-center gap-3">
        <span class="tag shrink-0" style="color:var(--${ST[o.status].c})">${ST[o.status].l}</span>
        <span class="min-w-0 flex-1"><span class="block text-[12.5px] font-bold truncate">${o.id} — ${esc(o.part.name)}</span>
        <span class="block mono text-[10.5px] text-muted truncate">${esc(o.client.name)} · ${esc(o.part.material)} · ${esc(o.request.ref)}</span></span>
        <i data-lucide="corner-down-left" class="w-3.5 h-3.5 text-muted shrink-0"></i></button>`).join('')
    :`<div class="px-4 py-4 text-[12px] text-muted">Sin resultados para “${esc(q)}”.</div>`;
  dp.classList.remove('hidden');
  lucide.createIcons();
}
function gsOpen(id){$('#searchDrop').classList.add('hidden');$('#gSearch').value='';openFile(id)}

/* --- reloj y arranque --- */
function tickClock(){
  const d=new Date();
  $('#clock').textContent=pad(d.getHours())+':'+pad(d.getMinutes())+':'+pad(d.getSeconds());
}
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){closeModal();closeDoc();$('#searchDrop').classList.add('hidden')}
});
document.addEventListener('click',e=>{
  if(!e.target.closest('#searchDrop')&&!e.target.closest('#gSearch'))$('#searchDrop').classList.add('hidden');
});
 $('#gSearch').addEventListener('keydown',e=>{
  if(e.key==='Enter'){const b=$('#searchDrop').querySelector('button[data-ot]');if(b)gsOpen(b.dataset.ot)}
});

renderNav();render();
tickClock();setInterval(tickClock,1000);
lucide.createIcons();
