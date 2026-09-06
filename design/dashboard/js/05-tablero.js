/* ================================================================
   QualityTrack — design/dashboard/05-tablero.js
   Vista Tablero: métricas, distribución, tabla de expedientes, filtros y exportación.
   Extraído verbatim de design/dashboard.html. Ver README.md del módulo.
   ================================================================ */
/* ================= VISTA: TABLERO ================= */
function matchFilter(o){switch(state.filter){
  case 'COT':return o.kind==='COT'||o.status==='CONVERTIDA';
  case 'PROD':return o.status==='EN_PRODUCCION'||o.status==='NC';
  case 'CAL':return o.status==='EN_CALIDAD';
  case 'NC':return (o.quality?.ncs||[]).some(n=>n.state==='ABIERTA');
  case 'ENT':return o.status==='ENTREGADA';
  default:return true}}
function matchQuery(o,q){return [o.id,o.part.name,o.client.name,o.part.material,o.part.heat,o.part.dwg,o.request.ref].join(' ').toLowerCase().includes(q)}

function rowsHTML(){
  const q=state.query.trim().toLowerCase();
  const list=OTS.filter(o=>matchFilter(o)&&(!q||matchQuery(o,q)));
  if(!list.length)return `<tr><td class="td text-center text-muted text-[12px]" colspan="8">Sin expedientes para el filtro actual.</td></tr>`;
  return list.map(o=>`<tr onclick="openFile('${o.id}')" class="cursor-pointer border-b border-line/70 hover:bg-paper transition-colors">
    <td class="td"><span class="mono font-bold text-[13px]">${o.id}</span>
      <div class="mono text-[10px] text-muted mt-0.5">${esc(o.request.ref)} · ${o.kind==='OT'?'ORDEN DE TRABAJO':'COTIZACIÓN'}</div></td>
    <td class="td">${esc(o.client.name)}<div class="mono text-[10px] text-muted mt-0.5">${o.client.code}</div></td>
    <td class="td font-semibold">${esc(o.part.name)}<div class="mono text-[10px] text-muted mt-0.5">${o.part.dwg} · REV ${o.part.rev}</div></td>
    <td class="td"><span class="mono text-[12px]">${esc(o.part.material)}</span><div class="mono text-[10px] text-muted mt-0.5">COLADA ${o.part.heat||'—'}</div></td>
    <td class="td">${avanceCell(o)}</td>
    <td class="td">${tag(o.status)}</td>
    <td class="td text-right mono text-[12px]">${fdate(o.part.due)}</td>
    <td class="td w-8"><i data-lucide="chevron-right" class="w-4 h-4 text-muted rowgo"></i></td></tr>`).join('');
}

function refreshRows(){$('#otRows').innerHTML=rowsHTML();lucide.createIcons()}
function setFilter(f){state.filter=f;document.querySelectorAll('[data-f]').forEach(b=>{
  const on=b.dataset.f===f;b.className='chipbtn'+(on?' chip-on':'')});refreshRows()}

function renderBoard(){
  const act=OTS.filter(o=>o.kind==='OT'&&o.status!=='ENTREGADA'&&o.status!=='CONVERTIDA').length;
  const prod=OTS.filter(o=>['EN_PRODUCCION','NC'].includes(o.status)).length;
  const cal=OTS.filter(o=>o.status==='EN_CALIDAD').length;
  const nc=OTS.reduce((a,o)=>a+(o.quality?.ncs||[]).filter(n=>n.state==='ABIERTA').length,0);
  const ent=OTS.filter(o=>o.status==='ENTREGADA').length;
  const chips=[['TODOS','TODOS'],['COT','COTIZACIONES'],['PROD','EN PRODUCCIÓN'],['CAL','EN CALIDAD'],['NC','CON NC'],['ENT','ENTREGADOS']];
  const dist=[['EN PRODUCCIÓN','accent',prod],['EN CALIDAD','ink',cal],['PENDIENTES','warn',OTS.filter(o=>o.kind==='COT').length],['ENTREGADAS','line2',ent]];
  const distTotal=Math.max(1,dist.reduce((a,d)=>a+d[2],0));

  $('#app').innerHTML=`
  <div class="relative border-2 border-ink bg-card shadow-hard">
    <span class="cm cm-tl"></span><span class="cm cm-tr"></span><span class="cm cm-bl"></span><span class="cm cm-br"></span>
    <div class="grid grid-cols-2 md:grid-cols-5 divide-x divide-y md:divide-y-0 divide-line">
      ${[['ÓRDENES ACTIVAS',act,'ink'],['EN PRODUCCIÓN',prod,'accent'],['EN CONTROL DE CALIDAD',cal,'ink'],['NO CONFORMIDADES ABIERTAS',nc,'danger'],['ENTREGADAS (HISTÓRICO)',ent,'ok']].map(c=>`
        <div class="p-5"><div class="kicker">${c[0]}</div>
        <div class="mono text-[34px] font-bold leading-none mt-2" style="color:var(--${c[2]})">${c[1]}</div></div>`).join('')}
    </div>
    <div class="border-t border-line px-5 py-3 flex flex-wrap items-center gap-x-6 gap-y-2.5">
      <span class="kicker">DISTRIBUCIÓN DE ESTADOS</span>
      <div class="flex h-2.5 flex-1 min-w-[180px] max-w-[420px] gap-px">
        ${dist.map(d=>`<div style="flex:${d[2]||0.001};background:var(--${d[1]})"></div>`).join('')}
      </div>
      ${dist.map(d=>`<span class="flex items-center gap-1.5 mono text-[10px] text-muted">
        <span class="w-2.5 h-2.5 inline-block" style="background:var(--${d[1]})"></span>${d[0]} · ${d[2]}</span>`).join('')}
    </div>
  </div>

  <div class="flex flex-wrap items-end justify-between gap-4 mt-8 mb-5">
    <div><div class="kicker mb-1.5">REGISTRO CENTRAL DE PRODUCCIÓN</div>
      <h1 class="text-[30px] font-extrabold xdisp leading-none">Órdenes de trabajo</h1></div>
    <div class="flex gap-2.5">
      <button class="btn" onclick="exportRegistry()"><i data-lucide="download" class="w-3.5 h-3.5"></i>EXPORTAR REGISTRO</button>
      <button class="btn btn-acc" onclick="setView('new')"><i data-lucide="plus" class="w-3.5 h-3.5"></i>NUEVA SOLICITUD</button>
    </div>
  </div>

  <div class="border-2 border-ink bg-card shadow-hard overflow-hidden">
    <div class="flex flex-wrap items-center justify-between gap-3 px-3 py-2.5 border-b border-line bg-paper">
      <div class="flex flex-wrap gap-1.5">
        ${chips.map(c=>`<button data-f="${c[0]}" onclick="setFilter('${c[0]}')" class="chipbtn${c[0]===state.filter?' chip-on':''}">${c[1]}</button>`).join('')}
      </div>
      <div class="relative">
        <i data-lucide="search" class="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted"></i>
        <input oninput="state.query=this.value;refreshRows()" placeholder="Filtrar expedientes…"
          class="bg-card border border-line2 focus:border-ink outline-none pl-8 pr-3 py-1.5 text-[12px] w-[220px]">
      </div>
    </div>
    <div class="overflow-x-auto">
      <table class="w-full text-[13px]">
        <thead><tr class="text-left bg-card">
          <th class="th">OT / DOCUMENTO</th><th class="th">CLIENTE</th><th class="th">PIEZA</th>
          <th class="th">MATERIAL</th><th class="th">AVANCE</th><th class="th">ESTADO</th>
          <th class="th text-right">ENTREGA</th><th></th></tr></thead>
        <tbody id="otRows">${rowsHTML()}</tbody>
      </table>
    </div>
  </div>
  <p class="kicker mt-3">CLIC EN UNA FILA PARA ABRIR EL EXPEDIENTE COMPLETO DEL TRABAJO</p>
  <style>
    .chipbtn{font:600 9.5px 'JetBrains Mono';letter-spacing:.14em;padding:.4rem .7rem;border:1px solid var(--line2);color:var(--muted);cursor:pointer;background:var(--card)}
    .chipbtn:hover{border-color:var(--ink);color:var(--ink)}
    .chip-on{background:var(--ink);border-color:var(--ink);color:var(--paper)}
  </style>`;
  lucide.createIcons();
}

function exportRegistry(){
  const lines=['QUALITYTRACK — REGISTRO CENTRAL DE PRODUCCIÓN','Generado: '+ts(),'',
    ...OTS.map(o=>[o.id,o.client.name,o.part.name+' ('+o.part.dwg+' rev.'+o.part.rev+')',o.part.material,'COLADA '+(o.part.heat||'—'),ST[o.status].l,
      o.kind==='OT'?'Avance: '+o.routing.filter(x=>x.state==='DONE').length+'/'+o.routing.length:'','Docs: '+o.docs.length].join(' | '))];
  const blob=new Blob([lines.join('\n')],{type:'text/plain'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='qualitytrack-registro.txt';a.click();
  toast('ok','Registro exportado','Se descargó qualitytrack-registro.txt con el estado de todos los expedientes.');
}

