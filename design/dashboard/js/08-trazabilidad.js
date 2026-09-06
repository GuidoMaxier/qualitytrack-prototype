/* ================================================================
   QualityTrack — design/dashboard/08-trazabilidad.js
   Vista Trazabilidad: cadena de custodia por eslabones con documentación.
   Extraído verbatim de design/dashboard.html. Ver README.md del módulo.
   ================================================================ */
/* ================= VISTA: TRAZABILIDAD ================= */
function chainLinks(o){
  const L=[];
  L.push({t:'CLIENTE Y SOLICITUD',ok:2,
    rows:[['CLIENTE',o.client.name],['REFERENCIA',o.request.ref],['RECIBIDA',fdate(o.request.received)+' · '+o.request.channel]],
    docs:o.docs.filter(d=>d.stage==='sol')});
  L.push({t:'COTIZACIÓN',ok:o.quote.status==='APROBADA'?2:1,
    rows:[['N°',o.quote.number],['MONTO',fmoney(o.quote.total)],['ESTADO',o.quote.status==='APROBADA'?'Aprobada — '+o.quote.approvedTs:'Pendiente de aprobación']],
    docs:o.docs.filter(d=>d.stage==='cot')});
  if(o.kind==='OT'){
    L.push({t:'ORDEN DE TRABAJO',ok:2,
      rows:[['OT',o.id],['LIBERADA',o.production.started+' · '+o.production.releasedBy],['PRIORIDAD',o.production.priority]],
      docs:o.docs.filter(d=>d.stage==='ot')});
    L.push({t:'MATERIA PRIMA',ok:2,
      rows:[['MATERIAL',o.part.material],['COLADA',o.part.heat||'—'],['CERTIFICACIÓN',o.part.matStd]],
      docs:o.docs.filter(d=>d.type==='CERT')});
    const dn=o.routing.filter(x=>x.state==='DONE').length,tn=o.routing.length;
    const ops=[...new Set(o.routing.filter(x=>x.state==='DONE').map(x=>x.operator))];
    L.push({t:'HOJA DE RUTA',ok:dn===tn?2:1,
      rows:[['OPERACIONES',dn+' / '+tn+' completadas'],['OPERARIOS',ops.length?ops.join(' · '):'—'],['MÁQUINAS',o.production.machine]],
      docs:o.docs.filter(d=>d.stage==='ruta')});
    const pok=o.quality.plan.filter(p=>o.quality.records.some(r=>r.code===p[0]&&r.result==='OK')).length;
    const ncA=o.quality.ncs.filter(n=>n.state==='ABIERTA').length;
    L.push({t:'CONTROL DE CALIDAD',ok:(o.quality.records.length&&!ncA)?2:(ncA?1:0),
      rows:[['INSPECCIONES',pok+' / '+o.quality.plan.length+' conformes'],['NO CONFORMIDADES',ncA?ncA+' abierta(s)':'—'],['INSP. REGISTROS',String(o.quality.records.length)]],
      docs:o.docs.filter(d=>d.type==='QC'||d.stage==='cal')});
    L.push({t:'ENTREGA',ok:o.status==='ENTREGADA'?2:0,
      rows:o.status==='ENTREGADA'
        ?[['REMITO',o.delivery.remito],['FECHA',fdate(o.delivery.date)],['RECIBIDO POR',o.delivery.receivedBy]]
        :[['ESTADO','Pendiente — disponible tras liberación de calidad']],
      docs:o.docs.filter(d=>d.stage==='ent')});
  }else{
    L.push({t:'ORDEN DE TRABAJO',ok:0,rows:[['ESTADO','Se generará al aprobar la cotización']],docs:[]});
    L.push({t:'PRODUCCIÓN · CALIDAD · ENTREGA',ok:0,rows:[['ESTADO','Eslabones pendientes del ciclo productivo']],docs:[]});
  }
  return L;
}

function traceSearch(v){
  const dp=$('#traceDrop');const q=v.trim().toLowerCase();
  if(!q){dp.classList.add('hidden');return}
  const res=OTS.filter(o=>matchQuery(o,q)).slice(0,6);
  dp.innerHTML=res.length?res.map(o=>`<button onclick="setTrace('${o.id}')" class="w-full text-left px-4 py-3 border-b border-line hover:bg-paper flex items-center gap-3">
      <span class="tag" style="color:var(--${ST[o.status].c})">${ST[o.status].l}</span>
      <span class="min-w-0"><span class="block text-[12.5px] font-bold truncate">${o.id} — ${esc(o.part.name)}</span>
      <span class="block mono text-[10.5px] text-muted truncate">${esc(o.client.name)} · ${esc(o.part.material)}</span></span></button>`).join('')
    :`<div class="px-4 py-4 text-[12px] text-muted">Sin resultados para “${esc(q)}”.</div>`;
  dp.classList.remove('hidden');
}
function setTrace(id){state.traceSel=id;$('#traceDrop').classList.add('hidden');$('#traceQ').value='';renderTrace()}

function renderTrace(){
  const o=byId(state.traceSel||'OT-2025-0101');
  const links=chainLinks(o);
  const doneN=links.filter(l=>l.ok===2).length;
  $('#app').innerHTML=`
  <div class="max-w-[900px] mx-auto">
    <div class="flex items-center gap-4 flex-wrap mb-4">
      <button class="btn btn-sm" onclick="setView('board')"><i data-lucide="arrow-left" class="w-3.5 h-3.5"></i>TRABAJOS</button>
      <span class="kicker">CONSULTA DE TRAZABILIDAD</span>
    </div>
    <div class="border-l-[3px] border-accent pl-5 py-1 my-5">
      <p class="text-[19px] lg:text-[23px] font-bold xdisp leading-snug">“¿Qué trabajo se realizó, para qué cliente, bajo qué especificaciones, con qué material, qué operaciones se realizaron, quién intervino, qué controles se efectuaron y qué documentación respalda el proceso?”</p>
    </div>
    <div class="relative mt-6">
      <i data-lucide="scan-search" class="w-4.5 h-4.5 w-[18px] h-[18px] absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"></i>
      <input id="traceQ" oninput="traceSearch(this.value)" autocomplete="off" placeholder="Buscar por OT, pieza, cliente, colada o referencia…"
        class="w-full bg-card border-2 border-ink outline-none pl-11 pr-4 py-3.5 text-[14px] placeholder:text-muted/70 shadow-hard">
      <div id="traceDrop" class="absolute z-20 left-0 right-0 top-[calc(100%+6px)] border-2 border-ink bg-card shadow-hard overflow-hidden hidden max-h-[300px] overflow-y-auto scroll-slim"></div>
    </div>

    <div class="flex flex-wrap items-center justify-between gap-4 mt-8 mb-5">
      <div>
        <div class="kicker mb-1">CADENA DE CUSTODIA</div>
        <h2 class="text-[24px] font-extrabold xdisp leading-none">${o.id} <span class="text-muted font-semibold">·</span> ${esc(o.part.name)}</h2>
        <div class="mono text-[11px] text-muted mt-1.5">${esc(o.client.name)} · ${esc(o.part.material)} · COLADA ${o.part.heat||'—'}</div>
      </div>
      <div class="text-right">
        <div class="mono text-[13px] font-bold">${doneN}/${links.length} ESLABONES CONFIRMADOS</div>
        ${doneN===links.length?`<span class="stamp -rotate-2 mt-2" style="color:var(--ok)">CADENA COMPLETA · VERIFICADA</span>`
          :`<div class="flex h-2 w-[180px] gap-px mt-2 ml-auto">${links.map(l=>`<div class="flex-1" style="background:${l.ok===2?'var(--ink)':l.ok===1?'var(--accent)':'var(--line2)'}"></div>`).join('')}</div>`}
      </div>
    </div>

    <div>${links.map((l,i)=>`
      <div class="relative pl-8 pb-5">
        <span class="absolute left-0 top-0.5 w-[13px] h-[13px] ${l.ok===2?'bg-ink':l.ok===1?'bg-accent node-live':'bg-paper border-[1.5px] border-line2'}"></span>
        ${i<links.length-1?`<span class="absolute left-[6px] top-5 bottom-0 w-px ${l.ok===2?'bg-ink/50':'border-l border-dashed border-line2'}"></span>`:''}
        <div class="border ${l.ok===0?'border-dashed border-line2 opacity-75':'border-ink'} bg-card p-4">
          <div class="flex items-center justify-between gap-3 flex-wrap">
            <div class="flex items-center gap-3">
              <span class="mono text-[9px] text-muted tracking-[.2em]">ESLABÓN ${pad(i+1)}</span>
              <span class="text-[13.5px] font-bold">${l.t}</span></div>
            ${l.ok===2?`<span class="tag" style="color:var(--ok)">CONFIRMADO</span>`
              :l.ok===1?`<span class="tag" style="color:var(--accent)">EN PROCESO</span>`
              :`<span class="tag" style="color:var(--muted)">PENDIENTE</span>`}</div>
          <div class="grid sm:grid-cols-3 gap-px bg-line border border-line mt-3">
            ${l.rows.map(r=>`<div class="bg-card p-2.5"><div class="cellhead">${r[0]}</div><div class="text-[12px] font-semibold mt-0.5 break-words">${esc(r[1])}</div></div>`).join('')}
          </div>
          ${l.docs.length?`<div class="flex flex-wrap gap-2 mt-3">
            ${l.docs.map(d=>`<button onclick="viewDoc('${o.id}','${d.id}')" class="flex items-center gap-2 border border-line2 hover:border-ink px-2.5 py-1.5 text-left transition-colors">
              <span class="mono text-[8.5px] font-bold">${DT[d.type].a}</span>
              <span class="text-[11px] font-semibold max-w-[240px] truncate">${esc(d.title)}</span>
              <i data-lucide="eye" class="w-3 h-3 text-muted"></i></button>`).join('')}
          </div>`:''}
        </div>
      </div>`).join('')}
    </div>
    ${doneN===links.length?`<div class="border-2 border-ink bg-card shadow-hard p-5 mt-2 flex flex-wrap items-center gap-4">
      <i data-lucide="shield-check" class="w-6 h-6 text-ok"></i>
      <p class="text-[13px] flex-1 min-w-[240px] leading-relaxed"><b>Cadena completa.</b> El historial del trabajo puede reconstruirse de extremo a extremo con evidencia documental en cada eslabón — sin buscar en planillas ni carpetas.</p>
      <button class="btn" onclick="openFile('${o.id}')">ABRIR EXPEDIENTE<i data-lucide="arrow-right" class="w-3.5 h-3.5"></i></button>
    </div>`:''}
  </div>`;
  lucide.createIcons();
}

