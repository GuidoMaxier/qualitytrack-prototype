/* ================================================================
   QualityTrack — design/dashboard/07-acciones.js
   Acciones del expediente: aprobar cotización, generar OT, operaciones, NC, entrega, adjuntar.
   Extraído verbatim de design/dashboard.html. Ver README.md del módulo.
   ================================================================ */
/* ================= ACCIONES DEL EXPEDIENTE ================= */
function approveQuote(id){
  const o=byId(id);
  o.status='COT_APR';o.quote.status='APROBADA';
  o.quote.approvedBy=USER+' (registro en representación del cliente)';o.quote.approvedTs=ts();
  o.docs.push(mkDoc('INF','Conformidad de cliente — '+o.quote.number,'cot','note',{ts:ts(),stamp:'APROBADO',signedBy:'Área Comercial',
    body:['El cliente aprueba la cotización '+o.quote.number+' por la suma de '+fmoney(o.quote.total)+'.','La aprobación quedó registrada con usuario y fecha, y habilita la generación de la Orden de Trabajo.']}));
  logEv(o,'Cotización '+o.quote.number+' aprobada. Se habilita la generación de la Orden de Trabajo.');
  toast('ok','Cotización aprobada','El registro quedó asentado en la bitácora del expediente.');render();
}

function genOT(id){
  const o=byId(id);
  const num='OT-2025-0'+(seqOT++);
  const n={id:num,kind:'OT',status:'EN_PRODUCCION',
    client:{...o.client},part:{...o.part},request:{...o.request},quote:{...o.quote},
    production:{started:ts(),releasedBy:USER,priority:o.request.text.includes('rgente')?'ALTA':'NORMAL',machine:'Según hoja de ruta',
      notes:['Verificar plano y revisión vigente antes de iniciar.','Conservar identificación de material y colada en todo el proceso.','Registrar tiempos reales por operación.']},
    routing:mkRouting(o.part.kind),
    quality:{plan:mkQPlan(o.part.kind),records:[],ncs:[]},
    docs:[
      {...o.docs.find(d=>d.type==='SOL'),id:'D'+(dseq++),ts:ts()},
      {...o.docs.find(d=>d.type==='PLANO'),id:'D'+(dseq++),ts:ts()},
      mkDoc('COTD','Cotización '+o.quote.number+' (aprobada)','cot','comercial',{subtype:'COT',num:o.quote.number,ts:ts()}),
      mkDoc('INF','Conformidad de cliente — '+o.quote.number,'cot','note',{ts:ts(),stamp:'APROBADO',signedBy:'Área Comercial',
        body:['Aprobación registrada del cliente para la cotización '+o.quote.number+' por '+fmoney(o.quote.total)+'.']})
    ],
    log:[
      {ts:ts(),actor:'sistema',text:'Expediente generado automáticamente a partir de la solicitud '+o.request.ref+' y la cotización aprobada '+o.quote.number+'.'},
      {ts:ts(),actor:USER,text:'Orden de Trabajo '+num+' generada y puesta en cola de producción.'}
    ]};
  o.status='CONVERTIDA';o.convertedTo=num;
  OTS.unshift(n);uiStage[num]=stageFromStatus(n);
  toast('ok','Orden de Trabajo generada',num+' creada a partir de '+o.quote.number+' — toda la documentación fue transferida.');
  openFile(num);
}

function startOp(id,n){
  const o=byId(id);const i=o.routing.findIndex(x=>x.n===n);const op=o.routing[i];
  if(o.routing.some(x=>x.state==='RUN'))return toast('err','Operación en curso','Finalice la operación actual antes de iniciar otra.');
  if(i>0&&o.routing.slice(0,i).some(x=>x.state!=='DONE'))return toast('err','Secuencia de proceso','Las operaciones anteriores deben estar completadas.');
  op.state='RUN';op.startMs=Date.now();
  logEv(o,'Operación '+op.n+' iniciada ('+op.op+') en '+op.machine+' — operario: '+op.operator+'.');
  toast('info','Operación iniciada','OP '+op.n+' — '+op.op+' · '+op.operator);render();
}
function finishOp(id,n){
  const o=byId(id);const op=o.routing.find(x=>x.n===n);
  const mins=Math.max(1,Math.round((Date.now()-(op.startMs||Date.now()))/60000));
  const actual=Math.max(mins,Math.round(op.std*(0.82+Math.random()*0.4)));
  op.state='DONE';op.actual=actual;op.startMs=null;
  logEv(o,'Operación '+op.n+' completada ('+op.op+') — '+actual+' min / '+op.std+' std. Operario: '+op.operator+'.');
  if(o.routing.every(x=>x.state==='DONE'))toast('ok','Hoja de ruta completa','Disponible para envío a Control de Calidad.');
  else toast('ok','Operación completada','OP '+op.n+' — '+actual+' min registrados.');render();
}
function sendQuality(id){
  const o=byId(id);o.status='EN_CALIDAD';uiStage[id]='cal';
  logEv(o,'Hoja de ruta finalizada. Lote de '+o.part.qty+' piezas enviado a Control de Calidad.');
  toast('info','Enviado a calidad','El lote quedó en espera de inspección según plan.');render();
}
function closeNC(id,i){
  const o=byId(id);const n=o.quality.ncs[i];n.state='CERRADA';
  if(o.status==='NC')o.status='EN_CALIDAD';
  logEv(o,'No conformidad '+n.id+' cerrada tras reproceso ('+n.disp+'). Lotificación lista para re-inspección.');
  toast('ok','NC cerrada',n.id+' — se habilita la re-inspección del lote.');render();
}
function releaseQC(id){
  const o=byId(id);const num='CI-0'+(seqCI++);
  o.docs.push(mkDoc('QC','Certificado interno de conformidad '+num,'cal','qcert',{num,ts:ts()}));
  o.status='LISTA';uiStage[id]='ent';
  logEv(o,'Plan de inspección completo y conforme. Lote de '+o.part.qty+' piezas liberado para entrega ('+num+').','Calidad — A. Ríos');
  toast('ok','Lote liberado','Certificado interno '+num+' emitido y vinculado al expediente.');render();
}

/* --- modales de inspección / entrega / adjuntar --- */
let inspResult='OK';
function pickRes(r){inspResult=r;
  $('#resOK').className='btn flex-1 '+(r==='OK'?'!bg-ok !border-ok !text-white':'btn-ghost');
  $('#resNC').className='btn flex-1 '+(r==='NC'?'!bg-danger !border-danger !text-white':'btn-ghost');
  $('#resOK').style.borderColor=r==='OK'?'var(--ok)':'';$('#resNC').style.borderColor=r==='NC'?'var(--danger)':'';}

function openInspect(){
  const o=byId(state.current);inspResult='OK';
  openModal('REGISTRAR INSPECCIÓN · '+o.id,`
    <div class="grid gap-4">
      <label class="block"><span class="cellhead">PUNTO DEL PLAN DE INSPECCIÓN</span>
        <select id="inspOp" class="fld mt-1.5 mono text-[12px]">${o.quality.plan.map(p=>`<option value="${p[0]}">${p[0]} — ${p[1]}</option>`).join('')}</select></label>
      <div><span class="cellhead">RESULTADO</span>
        <div class="flex gap-2.5 mt-1.5">
          <button id="resOK" onclick="pickRes('OK')" class="btn flex-1 !bg-ok !border-ok !text-white">CONFORME</button>
          <button id="resNC" onclick="pickRes('NC')" class="btn flex-1 btn-ghost" style="border-color:var(--line2)">NO CONFORME</button>
        </div></div>
      <label class="block"><span class="cellhead">OBSERVACIONES</span>
        <textarea id="inspNotes" rows="3" class="fld mt-1.5" placeholder="Detalle de medición, piezas evaluadas, desvíos…"></textarea></label>
      <p class="text-[11.5px] text-muted leading-relaxed">El registro se asienta en la bitácora con usuario, fecha y hora. Una no conformidad reabre la OT para reproceso.</p>
      <button class="btn btn-acc" onclick="saveInspect()"><i data-lucide="check" class="w-3.5 h-3.5"></i>GUARDAR REGISTRO</button>
    </div>`);
}
function saveInspect(){
  const o=byId(state.current);const code=$('#inspOp').value;const notes=$('#inspNotes').value.trim();
  if(inspResult==='NC'){
    const nid='NC-2025-0'+(seqNC++);
    o.quality.ncs.push({id:nid,code,desc:notes||'No conformidad detectada en inspección.',disp:'Reproceso en planta',state:'ABIERTA',ts:ts()});
    o.status='NC';
    logEv(o,'NO CONFORMIDAD '+nid+' registrada en '+code+(notes?' — '+notes:'')+'. Disposición: reproceso en planta.','Calidad — A. Ríos');
    toast('err','No conformidad registrada',nid+' — la OT pasa a estado NC para reproceso.');
  }else{
    o.quality.records.push({code,result:'OK',inspector:'A. Ríos',notes:notes||'Conforme.',ts:ts()});
    logEv(o,'Inspección registrada: '+code+' — CONFORME.'+(notes?' '+notes:''),'Calidad — A. Ríos');
    toast('ok','Inspección registrada',code+' — resultado CONFORME.');
  }
  closeModal();render();
}

function openDeliver(){
  const o=byId(state.current);
  openModal('REGISTRAR ENTREGA · '+o.id,`
    <div class="grid gap-4">
      <p class="text-[12.5px] leading-relaxed">Se entregará el lote de <b>${o.part.qty} piezas</b> de “${esc(o.part.name)}” a <b>${esc(o.client.name)}</b>. Se generarán y vincularán remito y factura al expediente.</p>
      <label class="block"><span class="cellhead">RECIBIDO POR (CLIENTE)</span>
        <input id="dlvBy" class="fld mt-1.5" value="Almacén — ${esc(o.client.name)}"></label>
      <button class="btn btn-acc" onclick="confirmDeliver()"><i data-lucide="package-check" class="w-3.5 h-3.5"></i>CONFIRMAR ENTREGA Y CERRAR EXPEDIENTE</button>
    </div>`);
}
function confirmDeliver(){
  const o=byId(state.current);const by=$('#dlvBy').value.trim()||'Almacén cliente';
  const rem='REM-2025-0'+(seqREM++);const fac='A 0021-00'+(seqFAC++);
  o.delivery={remito:rem,date:ts().slice(0,10),receivedBy:by};
  o.docs.push(mkDoc('REM','Remito '+rem,'ent','comercial',{subtype:'REM',num:rem,receivedBy:by,ts:ts()}));
  o.docs.push(mkDoc('FAC','Factura '+fac,'ent','comercial',{subtype:'FAC',num:fac,ts:ts()}));
  o.status='ENTREGADA';
  logEv(o,'Entrega registrada. Remito '+rem+' firmado por '+by+'.',USER);
  logEv(o,'Factura '+fac+' emitida y vinculada al expediente. Expediente cerrado.','Administración');
  closeModal();toast('ok','Entrega registrada','Expediente cerrado con cadena de trazabilidad completa.');render();
}

function openAttach(){
  const o=byId(state.current);
  openModal('ADJUNTAR DOCUMENTO AL EXPEDIENTE',`
    <div class="grid gap-4">
      <label class="block"><span class="cellhead">TIPO DE DOCUMENTO</span>
        <select id="attType" class="fld mt-1.5 text-[12.5px]">
          <option>Informe de producción</option><option>Registro fotográfico</option>
          <option>Documento del cliente</option><option>Revisión de plano</option><option>Otro antecedente</option>
        </select></label>
      <div><span class="cellhead">ARCHIVO</span>
        <div class="flex gap-2 mt-1.5">
          <input type="file" id="attFile" class="hidden" onchange="if(this.files[0])$('#attName').value=this.files[0].name">
          <button class="btn btn-sm" onclick="$('#attFile').click()"><i data-lucide="paperclip" class="w-3 h-3"></i>SELECCIONAR</button>
          <input id="attName" class="fld flex-1" placeholder="o escriba una denominación…"></div></div>
      <label class="block"><span class="cellhead">VINCULAR A ETAPA</span>
        <select id="attStage" class="fld mt-1.5 text-[12.5px]">${STAGES.map(s=>`<option value="${s[0]}">${s[2]}</option>`).join('')}</select></label>
      <p class="text-[11.5px] text-muted leading-relaxed">El documento queda registrado como evidencia con sello de recepción, hash de integridad y asiento en la bitácora.</p>
      <button class="btn btn-acc" onclick="confirmAttach()"><i data-lucide="link-2" class="w-3.5 h-3.5"></i>ADJUNTAR AL EXPEDIENTE</button>
    </div>`);
}
function confirmAttach(){
  const o=byId(state.current);const name=$('#attName').value.trim();
  if(!name)return toast('err','Falta denominación','Indique el archivo o una denominación para el documento.');
  const type=$('#attType').value;const stage=$('#attStage').value;
  o.docs.push(mkDoc('ADJ',name,stage,'note',{ts:ts(),stamp:'RECIBIDO',signedBy:USER,
    body:['Documento adjuntado al expediente desde el puesto de trabajo.','Tipo: '+type+'.','Registrado como evidencia del proceso con hash de integridad: '+hash(name)+'.']}));
  logEv(o,'Documento adjuntado al expediente: “'+name+'” ('+type+') — vinculado a etapa '+STAGE_L[stage]+'. Hash '+hash(name)+'.');
  closeModal();toast('ok','Documento adjuntado','“'+name+'” quedó vinculado a la etapa '+STAGE_L[stage]+'.');render();
}

