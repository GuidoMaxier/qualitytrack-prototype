/* ================================================================
   QualityTrack — design/dashboard/06-expediente.js
   Vista Expediente único: línea de 6 etapas, cabecera, timeline y contenido por etapa.
   Extraído verbatim de design/dashboard.html. Ver README.md del módulo.
   ================================================================ */
/* ================= VISTA: EXPEDIENTE ================= */
const doneMap=o=>({'sol':2,
  'cot':o.quote.status==='APROBADA'?2:1,
  'ot':(o.kind==='OT'||o.status==='CONVERTIDA')?2:0,
  'ruta':o.kind==='OT'?(o.routing.every(x=>x.state==='DONE')?2:1):0,
  'cal':(['LISTA','ENTREGADA'].includes(o.status))?2:(['EN_CALIDAD','NC'].includes(o.status)?1:0),
  'ent':o.status==='ENTREGADA'?2:0});

function fileHeader(o){
  const done=o.kind==='OT'?o.routing.filter(x=>x.state==='DONE').length:0;
  const tot=o.routing?o.routing.length:0;
  return `<div class="relative border-2 border-ink bg-card shadow-hard">
    <span class="cm cm-tl"></span><span class="cm cm-tr"></span><span class="cm cm-bl"></span><span class="cm cm-br"></span>
    <div class="grid grid-cols-2 md:grid-cols-12">
      <div class="p-4 border-b md:border-r border-line md:col-span-3">
        <div class="cellhead">${o.kind==='OT'?'ORDEN DE TRABAJO':'COTIZACIÓN'}</div>
        <div class="text-[25px] font-extrabold xdisp leading-none mt-1.5">${o.id}</div>
        <div class="mono text-[10px] text-muted mt-1.5">PLANO ${o.part.dwg} · REV ${o.part.rev}</div>
      </div>
      <div class="p-4 border-b md:border-r border-line md:col-span-3">
        <div class="cellhead">PIEZA</div>
        <div class="text-[15px] font-bold leading-tight mt-1.5">${esc(o.part.name)}</div>
        <div class="mono text-[10px] text-muted mt-1">${esc(o.part.material)} · ${o.part.qty} PZ</div>
      </div>
      <div class="p-4 border-b md:border-r border-line md:col-span-2">
        <div class="cellhead">CLIENTE</div>
        <div class="text-[13px] font-semibold leading-snug mt-1.5">${esc(o.client.name)}</div>
        <div class="mono text-[10px] text-muted mt-1">${o.client.code}</div>
      </div>
      <div class="p-4 border-b md:border-r border-line md:col-span-2">
        <div class="cellhead">MATERIAL / COLADA</div>
        <div class="mono text-[13px] font-semibold mt-1.5">${esc(o.part.material)}</div>
        <div class="mono text-[10px] text-muted mt-1">COLADA ${o.part.heat||'—'} · ${esc(o.part.matStd)}</div>
      </div>
      <div class="p-4 border-b md:border-r border-line md:col-span-1">
        <div class="cellhead">ENTREGA</div>
        <div class="mono text-[15px] font-bold mt-1.5">${fdate(o.part.due)}</div>
      </div>
      <div class="p-4 md:col-span-1 flex flex-col items-start justify-center">
        <span class="stamp -rotate-2" style="color:var(--${ST[o.status].c});font-size:9px">${ST[o.status].l}</span>
      </div>
    </div>
    <div class="border-t border-line px-4 py-2.5 flex flex-wrap items-center gap-x-6 gap-y-2">
      ${o.kind==='OT'?`<div class="flex items-center gap-1.5">${o.routing.map(x=>`<span class="w-3 h-3 inline-block ${x.state==='DONE'?'bg-ink':x.state==='RUN'?'bg-accent node-live':'border border-line2'}"></span>`).join('')}
        <span class="mono text-[10.5px] text-muted ml-1.5">${done}/${tot} OPERACIONES</span></div>`
       :`<span class="mono text-[10.5px] text-muted">EXPEDIENTE COMERCIAL — SIN OT GENERADA AÚN</span>`}
      <span class="mono text-[10.5px] text-muted hidden md:inline">${o.docs.length} DOCUMENTOS VINCULADOS · ${o.log.length} EVENTOS EN BITÁCORA</span>
      <button class="btn btn-sm ml-auto" onclick="goTrace('${o.id}')"><i data-lucide="scan-search" class="w-3 h-3"></i>CADENA DE TRAZABILIDAD</button>
    </div>
  </div>`;
}

function fileTimeline(o,cur){
  const dm=doneMap(o);
  return `<nav class="relative">
    <div class="absolute left-[7px] top-3 bottom-3 w-px bg-line2"></div>
    ${STAGES.map(([k,n,t])=>{const stg=dm[k],act=cur===k,nd=o.docs.filter(d=>d.stage===k).length;
      const mark=stg===2?'bg-ink':stg===1?'bg-accent node-live':'bg-card border-[1.5px] border-line2';
      const ring=act?(stg===1?'ring-2 ring-offset-2 ring-offset-card ring-accent':'ring-2 ring-offset-2 ring-offset-card ring-ink'):'';
      return `<button onclick="setStage('${k}')" class="relative w-full text-left flex gap-3.5 items-start py-2.5 group">
        <span class="relative z-10 mt-0.5 w-[15px] h-[15px] shrink-0 ${mark} ${ring}"></span>
        <span class="min-w-0">
          <span class="mono text-[9px] tracking-[.2em] ${act?'text-accent':'text-muted'}">ETAPA ${n}</span>
          <span class="block text-[12.5px] font-bold leading-tight mt-0.5 group-hover:underline underline-offset-2 decoration-line2">${t}</span>
          <span class="block mono text-[9.5px] text-muted mt-0.5">${stg===2?'COMPLETA':stg===1?'EN PROCESO':'PENDIENTE'} · ${nd} DOC${nd===1?'':'S'}</span>
        </span></button>`}).join('')}
  </nav>`;
}

function stageHTML(o,k){
  const q=o.quote;
  const itemsRows=q.items.map(it=>`<tr class="border-b border-line/70">
      <td class="td text-[12.5px]">${esc(it.d)}</td>
      <td class="td mono text-right text-[12px]">${it.q}</td>
      <td class="td mono text-right text-[12px]">${fmoney(it.u)}</td>
      <td class="td mono text-right text-[12px] font-semibold">${fmoney(it.q*it.u)}</td></tr>`).join('');

  switch(k){
  case 'sol':return `
    ${sHead('01','Solicitud del cliente',`Registrada por ${esc(o.request.by)} · ${fdate(o.request.received)}`)}
    <div class="border border-line border-l-[3px] border-l-accent bg-card px-5 py-4 text-[15px] leading-relaxed">“${esc(o.request.text)}”</div>
    <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-line border border-line mt-4">
      ${[['REFERENCIA',o.request.ref],['CANAL',o.request.channel],['CONTACTO',o.client.contact],['CORREO',o.client.email]].map(c=>`
        <div class="bg-card p-3.5"><div class="cellhead">${c[0]}</div><div class="text-[12.5px] font-semibold mt-1 truncate">${esc(c[1])}</div></div>`).join('')}
    </div>
    ${stageDocList(o,'sol')}`;

  case 'cot':return `
    ${sHead('02','Cotización',`N° ${q.number} · emitida ${fdate(q.date)} · validez ${q.valid}`)}
    <div class="grid lg:grid-cols-[1fr_290px] gap-5 items-start">
      <div class="border border-ink bg-card overflow-x-auto">
        <table class="w-full text-[13px] w-full">
          <thead><tr class="text-left"><th class="th">DESCRIPCIÓN</th><th class="th text-right">CANT.</th><th class="th text-right">P. UNITARIO</th><th class="th text-right">SUBTOTAL</th></tr></thead>
          <tbody>${itemsRows}</tbody>
        </table>
      </div>
      <div class="flex flex-col gap-4">
        <div class="border-2 border-ink bg-card p-4 text-center">
          <div class="kicker">MONTO TOTAL</div>
          <div class="mono text-[25px] font-bold mt-1.5">${fmoney(q.total)}</div>
          <div class="mt-4">
            ${q.status==='APROBADA'
              ?`<span class="stamp" style="color:var(--ok)">APROBADA</span>
                <div class="mono text-[10px] text-muted mt-2.5 leading-relaxed">POR ${esc(q.approvedBy)}<br>${q.approvedTs}</div>`
              :`<span class="stamp" style="color:var(--warn)">PENDIENTE</span>`}
          </div>
        </div>
        <div class="border border-line bg-card p-4">
          ${q.status!=='APROBADA'?`
            <p class="text-[12px] text-muted leading-relaxed mb-3">La aprobación queda registrada en la bitácora del expediente con usuario y fecha, y habilita la generación de la Orden de Trabajo sin recaptura de datos.</p>
            <button class="btn btn-acc w-full" onclick="approveQuote('${o.id}')"><i data-lucide="check" class="w-3.5 h-3.5"></i>APROBAR COTIZACIÓN</button>`
          :o.kind==='COT'?`
            <p class="text-[12px] text-muted leading-relaxed mb-3">La solicitud y la cotización aprobada se transferirán íntegramente al nuevo expediente de producción.</p>
            <button class="btn btn-acc w-full" onclick="genOT('${o.id}')"><i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>GENERAR ORDEN DE TRABAJO</button>`
          :`<p class="text-[12px] text-muted leading-relaxed">Cotización aprobada — antecedente comercial de esta Orden de Trabajo.</p>`}
        </div>
      </div>
    </div>
    ${stageDocList(o,'cot')}`;

  case 'ot':
    if(o.kind==='COT'){return `
      ${sHead('03','Orden de Trabajo','Etapa pendiente — requiere cotización aprobada')}
      <div class="border-2 border-dashed border-line2 bg-card p-8 text-center">
        <i data-lucide="lock" class="w-6 h-6 mx-auto text-muted"></i>
        <p class="text-[13px] text-muted mt-3 max-w-[380px] mx-auto leading-relaxed">La Orden de Trabajo se genera automáticamente a partir de esta solicitud una vez aprobada la cotización, transfiriendo cliente, especificaciones técnicas y documentación.</p>
        <button class="btn mt-4" onclick="setStage('cot')"><i data-lucide="arrow-left" class="w-3.5 h-3.5"></i>IR A COTIZACIÓN</button>
      </div>`}
    return `
    ${sHead('03','Orden de Trabajo',`Liberada ${o.production.started} · por ${esc(o.production.releasedBy)}`)}
    <div class="grid lg:grid-cols-2 gap-5 items-start">
      <div class="border-2 border-ink bg-card">
        <div class="px-4 py-3 border-b border-line flex items-center justify-between">
          <span class="kicker">INSTRUCCIONES DE PRODUCCIÓN</span>
          <span class="tag" style="color:var(--${o.production.priority==='ALTA'?'danger':'muted'})">PRIORIDAD ${o.production.priority}</span></div>
        <div class="p-4">
          <div class="cellhead mb-1.5">EQUIPOS INTERVINIENTES</div>
          <div class="mono text-[12px] mb-4">${esc(o.production.machine)}</div>
          <div class="cellhead mb-2">NOTAS DE PROCESO</div>
          <ul class="grid gap-2">${o.production.notes.map(n=>`<li class="flex gap-2.5 text-[12.5px] leading-snug"><span class="w-1.5 h-1.5 bg-accent mt-1.5 shrink-0"></span>${esc(n)}</li>`).join('')}</ul>
        </div>
      </div>
      <div class="border-2 border-ink bg-card">
        <div class="px-4 py-3 border-b border-line"><span class="kicker">MATERIA PRIMA ASIGNADA</span></div>
        <div class="p-4">
          <div class="mono text-[20px] font-bold">${esc(o.part.material)}</div>
          <div class="grid grid-cols-2 gap-px bg-line border border-line mt-3">
            <div class="bg-card p-3"><div class="cellhead">COLADA</div><div class="mono text-[13px] font-semibold mt-1">${o.part.heat||'—'}</div></div>
            <div class="bg-card p-3"><div class="cellhead">CERTIFICACIÓN</div><div class="mono text-[13px] font-semibold mt-1">${esc(o.part.matStd)}</div></div>
          </div>
          <div class="grid gap-2 mt-4">
            ${o.docs.filter(d=>d.type==='CERT'||d.type==='OC').map(d=>docRow(o,d)).join('')}
          </div>
        </div>
      </div>
    </div>
    ${stageDocList(o,'ot')}`;

  case 'ruta':{
    if(o.kind==='COT'){return `
      ${sHead('04','Hoja de Ruta','Etapa pendiente — se generará junto con la Orden de Trabajo')}
      <div class="border-2 border-dashed border-line2 bg-card p-8 text-center">
        <i data-lucide="lock" class="w-6 h-6 mx-auto text-muted"></i>
        <p class="text-[13px] text-muted mt-3 max-w-[380px] mx-auto leading-relaxed">La secuencia de operaciones se planificará automáticamente según el tipo de pieza (${o.part.kind==='flange'?'pieza de revolución':o.part.kind==='shaft'?'eje / piñón':'pieza de chapa / soporte'}) al generar la OT.</p>
      </div>`}
    const done=o.routing.filter(x=>x.state==='DONE').length,tot=o.routing.length;
    const std=o.routing.reduce((a,x)=>a+x.std,0),real=o.routing.reduce((a,x)=>a+(x.actual||0),0);
    const run=o.routing.find(x=>x.state==='RUN');
    const iRun=run?o.routing.indexOf(run):-1;
    return `
    ${sHead('04','Hoja de Ruta','Secuencia de operaciones autorizada para planta')}
    <div class="border-2 border-ink bg-card p-4 flex flex-wrap items-center gap-x-5 gap-y-3">
      <div class="flex items-center gap-1">${o.routing.map(x=>`<span class="w-4 h-3 inline-block ${x.state==='DONE'?'bg-ink':x.state==='RUN'?'bg-accent node-live':'border border-line2'}"></span>`).join('')}</div>
      <span class="mono text-[11.5px] font-semibold">${done}/${tot} OPERACIONES</span>
      <span class="mono text-[10.5px] text-muted">T. EST. ${std} MIN · T. REAL ACUM. ${real} MIN</span>
      ${run?`<span class="tag" style="color:var(--accent)">OP ${run.n} EN CURSO · ${Math.max(1,Math.round((Date.now()-run.startMs)/60000))} MIN</span>`:''}
    </div>
    <div class="border border-ink bg-card mt-4 overflow-x-auto">
      <table class="w-full text-[13px]">
        <thead><tr class="text-left"><th class="th">N°</th><th class="th">OPERACIÓN</th><th class="th">MÁQUINA</th><th class="th">OPERARIO</th>
          <th class="th text-right">T. EST.</th><th class="th text-right">T. REAL</th><th class="th">ESTADO</th><th class="th text-right">ACCIÓN</th></tr></thead>
        <tbody>${o.routing.map((op,i)=>{
          const canStart=!run&&op.state==='PEND'&&(i===0||o.routing.slice(0,i).every(x=>x.state==='DONE'))&&o.status==='EN_PRODUCCION';
          return `<tr class="border-b border-line/70 ${op.state==='RUN'?'bg-accent/5':''}">
            <td class="td mono font-bold text-[12px]">${pad(op.n)}</td>
            <td class="td font-semibold text-[12.5px]">${esc(op.op)}</td>
            <td class="td mono text-[11px] text-muted">${esc(op.machine)}</td>
            <td class="td text-[12px]">${esc(op.operator)}</td>
            <td class="td mono text-right text-[12px]">${op.std}′</td>
            <td class="td mono text-right text-[12px]">${op.actual!=null?op.actual+'′':'—'}</td>
            <td class="td">${opTag(op.state)}</td>
            <td class="td text-right">${op.state==='RUN'
              ?`<button class="btn btn-sm" onclick="finishOp('${o.id}',${op.n})"><i data-lucide="square" class="w-3 h-3"></i>FINALIZAR</button>`
              :canStart?`<button class="btn btn-sm btn-acc" onclick="startOp('${o.id}',${op.n})"><i data-lucide="play" class="w-3 h-3"></i>INICIAR</button>`
              :`<span class="mono text-[11px] text-muted">—</span>`}</td></tr>`}).join('')}
        </tbody>
      </table>
    </div>
    ${done===tot?(o.status==='EN_PRODUCCION'
      ?`<div class="border-2 border-ink bg-card p-4 mt-4 flex flex-wrap items-center gap-4">
         <i data-lucide="flag" class="w-4.5 h-4.5 w-[18px] h-[18px] text-accent"></i>
         <p class="text-[12.5px] flex-1 min-w-[220px]">Hoja de ruta completa. El lote está disponible para su envío a Control de Calidad.</p>
         <button class="btn btn-acc" onclick="sendQuality('${o.id}')">ENVIAR A CONTROL DE CALIDAD<i data-lucide="arrow-right" class="w-3.5 h-3.5"></i></button></div>`
      :`<p class="kicker mt-4">HOJA DE RUTA COMPLETA — LOTE EN CONTROL DE CALIDAD</p>`)
     :`<p class="kicker mt-4">LAS OPERACIONES SE EJECUTAN EN SECUENCIA — CADA INICIO Y FIN QUEDA REGISTRADO EN LA BITÁCORA</p>`}
    ${stageDocList(o,'ruta')}`}

  case 'cal':{
    if(o.kind==='COT'){return `
      ${sHead('05','Control de Calidad','Etapa pendiente')}
      <div class="border-2 border-dashed border-line2 bg-card p-8 text-center">
        <i data-lucide="lock" class="w-6 h-6 mx-auto text-muted"></i>
        <p class="text-[13px] text-muted mt-3 max-w-[380px] mx-auto">El plan de inspección se definirá al generar la Orden de Trabajo, según tipo de pieza y especificación del cliente.</p>
      </div>`}
    const canRelease=o.quality.plan.every(p=>o.quality.records.some(r=>r.code===p[0]&&r.result==='OK'))&&!o.quality.ncs.some(n=>n.state==='ABIERTA');
    const lastRes=code=>{
      const nc=o.quality.ncs.find(n=>n.code===code&&n.state==='ABIERTA');
      if(nc)return `<span class="tag" style="color:var(--danger)">NC</span>`;
      const r=[...o.quality.records].reverse().find(x=>x.code===code);
      return r?`<span class="tag" style="color:var(--ok)">OK</span>`:`<span class="tag" style="color:var(--muted)">—</span>`};
    return `
    ${sHead('05','Control de Calidad',`${o.quality.records.length} registro(s) · ${o.quality.ncs.filter(n=>n.state==='ABIERTA').length} no conformidad(es) abierta(s)`)}
    ${o.status==='NC'?`<div class="border-2 border-danger bg-danger/5 px-4 py-3 mb-4 flex flex-wrap items-center gap-3">
        <i data-lucide="alert-triangle" class="w-4 h-4 text-danger"></i>
        <span class="text-[12.5px] font-semibold">La OT pasó a estado NO CONFORMIDAD ABIERTA. Cierre las NC para poder liberar el lote.</span></div>`:''}
    <div class="grid lg:grid-cols-2 gap-5 items-start">
      <div class="border-2 border-ink bg-card overflow-x-auto">
        <div class="px-4 py-3 border-b border-line"><span class="kicker">PLAN DE INSPECCIÓN</span></div>
        <table class="w-full text-[13px]">
          <thead><tr class="text-left"><th class="th">CÓD.</th><th class="th">CONTROL</th><th class="th">ESPECIFICACIÓN</th><th class="th">MÉTODO</th><th class="th">EST.</th></tr></thead>
          <tbody>${o.quality.plan.map(p=>`<tr class="border-b border-line/70">
            <td class="td mono font-bold text-[11px]">${p[0]}</td>
            <td class="td font-semibold text-[12px]">${p[1]}</td>
            <td class="td mono text-[11px] text-muted">${p[2]}</td>
            <td class="td text-[11px] text-muted">${p[3]}</td>
            <td class="td">${lastRes(p[0])}</td></tr>`).join('')}</tbody>
        </table>
      </div>
      <div class="flex flex-col gap-4">
        <div class="border-2 border-ink bg-card">
          <div class="px-4 py-3 border-b border-line flex items-center justify-between">
            <span class="kicker">REGISTROS DE INSPECCIÓN</span>
            <button class="btn btn-sm btn-acc" onclick="openInspect()"><i data-lucide="plus" class="w-3 h-3"></i>REGISTRAR INSPECCIÓN</button></div>
          <div class="p-4 grid gap-3 content-start max-h-[300px] overflow-auto scroll-slim">
            ${o.quality.records.length?o.quality.records.slice().reverse().map(r=>`
              <div class="border border-line bg-card px-3.5 py-2.5">
                <div class="flex items-center gap-2.5 flex-wrap">
                  <span class="mono text-[11px] font-bold">${r.code}</span>
                  ${r.result==='OK'?`<span class="tag" style="color:var(--ok)">CONFORME</span>`:`<span class="tag" style="color:var(--danger)">NO CONFORME</span>`}
                  <span class="mono text-[9.5px] text-muted ml-auto">${r.ts}</span></div>
                <div class="text-[12px] mt-1 leading-snug">${esc(r.notes)}</div>
                <div class="mono text-[9.5px] text-muted mt-1 uppercase">${esc(r.inspector)}</div></div>`).join('')
             :`<p class="text-[12px] text-muted leading-relaxed">Sin registros aún. Registre inspecciones al completar las operaciones de la hoja de ruta.</p>`}
          </div>
        </div>
        ${o.quality.ncs.length?o.quality.ncs.map((n,i)=>`
          <div class="border-2 border-danger bg-card">
            <div class="px-4 py-2.5 border-b border-danger/30 flex items-center justify-between">
              <span class="mono text-[11px] font-bold text-danger">${n.id} · ${n.code}</span>
              ${n.state==='ABIERTA'?`<span class="tag" style="color:var(--danger)">ABIERTA</span>`:`<span class="tag" style="color:var(--ok)">CERRADA</span>`}</div>
            <div class="p-4">
              <p class="text-[12.5px] leading-snug">${esc(n.desc)}</p>
              <p class="mono text-[10.5px] text-muted mt-2">DISPOSICIÓN: ${esc(n.disp)} · ${n.ts}</p>
              ${n.state==='ABIERTA'?`<button class="btn btn-sm mt-3" onclick="closeNC('${o.id}',${i})"><i data-lucide="check" class="w-3 h-3"></i>CERRAR NC — REPROCESO REALIZADO</button>`:''}
            </div></div>`).join(''):''}
        ${canRelease&&o.status==='EN_CALIDAD'?`
          <div class="border-2 border-ok bg-card p-4 flex flex-wrap items-center gap-4">
            <i data-lucide="shield-check" class="w-[18px] h-[18px] text-ok"></i>
            <p class="text-[12.5px] flex-1 min-w-[200px]">Plan de inspección completo y conforme. El lote puede liberarse para entrega.</p>
            <button class="btn btn-acc" onclick="releaseQC('${o.id}')">LIBERAR PARA ENTREGA</button></div>`:''}
      </div>
    </div>
    ${stageDocList(o,'cal')}`}

  case 'ent':{
    if(o.status==='ENTREGADA'){return `
      ${sHead('06','Entrega',`Expediente cerrado · ${fdate(o.delivery.date)}`)}
      <div class="border-2 border-ink bg-card p-6 relative overflow-hidden">
        <div class="absolute right-6 top-6 stamp rotate-3 opacity-90" style="color:var(--muted)">ENTREGADA</div>
        <div class="cellhead">CONFORMIDAD DE ENTREGA</div>
        <p class="text-[14px] mt-2 max-w-[520px] leading-relaxed">Lote de <b>${o.part.qty} piezas</b> de “${esc(o.part.name)}” entregado a <b>${esc(o.client.name)}</b>, recibido por <b>${esc(o.delivery.receivedBy)}</b> con remito <b class="mono">${o.delivery.remito}</b>.</p>
        <div class="grid sm:grid-cols-3 gap-px bg-line border border-line mt-5 max-w-[640px]">
          ${[['REMITO',o.delivery.remito],['FECHA',fdate(o.delivery.date)],['FACTURA',o.docs.find(d=>d.type==='FAC')?.title.split('Factura ')[1]||'—']].map(c=>`
            <div class="bg-card p-3"><div class="cellhead">${c[0]}</div><div class="mono text-[13px] font-semibold mt-1">${esc(c[1])}</div></div>`).join('')}
        </div>
        <button class="btn mt-5" onclick="goTrace('${o.id}')"><i data-lucide="scan-search" class="w-3.5 h-3.5"></i>VER CADENA COMPLETA</button>
      </div>
      ${stageDocList(o,'ent')}`}
    if(o.status==='LISTA'){return `
      ${sHead('06','Entrega','Lote liberado por Calidad — pendiente de despacho')}
      <div class="border-2 border-ink bg-card p-6">
        <div class="flex items-center gap-3"><i data-lucide="package-check" class="w-5 h-5 text-ok"></i>
          <p class="text-[14px] font-semibold">${o.part.qty} piezas liberadas — listas para entrega a ${esc(o.client.name)}.</p></div>
        <p class="text-[12.5px] text-muted mt-2 max-w-[520px] leading-relaxed">Al registrar la entrega se generan y vinculan el remito y la factura, y el expediente se cierra con la cadena de trazabilidad completa.</p>
        <button class="btn btn-acc mt-4" onclick="openDeliver()"><i data-lucide="package-check" class="w-3.5 h-3.5"></i>REGISTRAR ENTREGA</button>
      </div>`}
    return `
    ${sHead('06','Entrega','Etapa pendiente')}
    <div class="border-2 border-dashed border-line2 bg-card p-8 text-center">
      <i data-lucide="lock" class="w-6 h-6 mx-auto text-muted"></i>
      <p class="text-[13px] text-muted mt-3 max-w-[380px] mx-auto">La entrega se habilita cuando Control de Calidad libere el lote.</p>
      ${o.kind==='OT'?`<button class="btn mt-4" onclick="setStage('cal')"><i data-lucide="arrow-left" class="w-3.5 h-3.5"></i>IR A CONTROL DE CALIDAD</button>`:''}
    </div>`}
  }
}

function renderFile(){
  const o=byId(state.current);if(!o){setView('board');return}
  const cur=uiStage[o.id]||stageFromStatus(o);
  if(o.status==='CONVERTIDA'){
    $('#app').innerHTML=`<div class="border-2 border-ink bg-card shadow-hard p-6 max-w-[640px] mx-auto mt-10 text-center">
      <span class="stamp" style="color:var(--muted)">CONVERTIDA A OT</span>
      <p class="text-[14px] mt-4">Esta cotización fue convertida en la orden de trabajo <b class="mono">${o.convertedTo}</b>.</p>
      <button class="btn btn-acc mt-4" onclick="openFile('${o.convertedTo}')">ABRIR ${o.convertedTo}<i data-lucide="arrow-right" class="w-3.5 h-3.5"></i></button>
      <div class="mt-5 text-left">${o.log.slice().reverse().map(le=>`<div class="mono text-[10px] text-muted">${le.ts} — ${esc(le.actor)}</div><div class="text-[12px] mb-2">${esc(le.text)}</div>`).join('')}</div>
    </div>`;lucide.createIcons();return;
  }
  $('#app').innerHTML=`
  <div class="flex items-center gap-4 flex-wrap mb-5">
    <button class="btn btn-sm" onclick="setView('board')"><i data-lucide="arrow-left" class="w-3.5 h-3.5"></i>TRABAJOS</button>
    <span class="kicker">EXPEDIENTE ÚNICO DE TRABAJO</span>
  </div>
  ${fileHeader(o)}
  <div class="grid grid-cols-1 lg:grid-cols-[235px_minmax(0,1fr)_330px] gap-6 mt-6 items-start">
    <div class="border-2 border-ink bg-card p-3.5 lg:sticky lg:top-[84px]">
      <div class="kicker px-1.5 pb-2 pt-1">LÍNEA DE PROCESO</div>
      ${fileTimeline(o,cur)}
    </div>
    <div class="min-w-0">${stageHTML(o,cur)}</div>
    <aside class="flex flex-col gap-5 lg:sticky lg:top-[84px]">
      <div class="border-2 border-ink bg-card">
        <div class="flex items-center justify-between px-4 py-3 border-b border-line">
          <span class="kicker">EXPEDIENTE · DOCUMENTOS (${o.docs.length})</span>
          <button class="btn btn-sm" onclick="openAttach()"><i data-lucide="plus" class="w-3 h-3"></i>ADJUNTAR</button></div>
        <div class="max-h-[380px] overflow-auto scroll-slim p-2.5 grid gap-2 content-start">
          ${o.docs.map(d=>docRow(o,d)).join('')}
        </div>
      </div>
      <div class="border-2 border-ink bg-card">
        <div class="flex items-center justify-between px-4 py-3 border-b border-line">
          <span class="kicker">BITÁCORA DEL EXPEDIENTE</span><i data-lucide="history" class="w-3.5 h-3.5 text-muted"></i></div>
        <div class="max-h-[430px] overflow-auto scroll-slim p-4 grid gap-3.5 content-start">
          ${o.log.slice().reverse().map(le=>`
            <div class="relative pl-4 ${le.fresh?'before:absolute before:left-0 before:top-1 before:bottom-1 before:w-[3px] before:bg-accent':''}">
              <div class="mono text-[10px] text-muted tracking-wide">${le.ts}</div>
              <div class="text-[12px] leading-snug mt-0.5">${esc(le.text)}</div>
              <div class="mono text-[9.5px] text-muted mt-0.5 uppercase tracking-wider">${esc(le.actor)}</div></div>`).join('')}
        </div>
      </div>
    </aside>
  </div>`;
  lucide.createIcons();
}

