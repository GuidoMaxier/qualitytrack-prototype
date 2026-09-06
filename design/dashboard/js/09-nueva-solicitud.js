/* ================================================================
   QualityTrack — design/dashboard/09-nueva-solicitud.js
   Vista Nueva Solicitud: formulario de alta del expediente comercial.
   Extraído verbatim de design/dashboard.html. Ver README.md del módulo.
   ================================================================ */
/* ================= VISTA: NUEVA SOLICITUD ================= */
const CLIENTES=['Metalúrgica Delta S.A.','AgroParts Ltd.','HidroSur S.R.L.','TecnoFer S.A.'];
function renderNew(){
  $('#app').innerHTML=`
  <div class="max-w-[900px] mx-auto">
    <div class="flex items-center gap-4 mb-6">
      <button class="btn btn-sm" onclick="setView('board')"><i data-lucide="arrow-left" class="w-3.5 h-3.5"></i>TRABAJOS</button>
      <span class="kicker">CICLO: SOLICITUD → COTIZACIÓN → OT → PRODUCCIÓN → CALIDAD → ENTREGA</span>
    </div>
    <div class="kicker mb-1.5">REGISTRO INICIAL DEL EXPEDIENTE</div>
    <h1 class="text-[28px] font-extrabold xdisp leading-none mb-6">Nueva solicitud de cliente</h1>
    <form onsubmit="saveNew(event)" class="border-2 border-ink bg-card shadow-hard p-6 grid md:grid-cols-2 gap-5">
      <label class="block"><span class="cellhead">CLIENTE</span>
        <select id="nCli" class="fld mt-1.5 text-[12.5px]">${CLIENTES.map(c=>`<option>${c}</option>`).join('')}</select></label>
      <label class="block"><span class="cellhead">CONTACTO</span>
        <input id="nContact" class="fld mt-1.5" placeholder="Nombre y área del contacto"></label>
      <label class="block"><span class="cellhead">DENOMINACIÓN DE LA PIEZA *</span>
        <input id="nPart" class="fld mt-1.5" placeholder="Ej.: Flanza de acople Ø150"></label>
      <label class="block"><span class="cellhead">TIPO DE PIEZA (DEFINE HOJA DE RUTA Y PLANO)</span>
        <select id="nKind" class="fld mt-1.5 text-[12.5px]">
          <option value="flange">Pieza de revolución — flanza / cubo</option>
          <option value="shaft">Eje / piñón</option>
          <option value="plate">Soporte / pieza de chapa</option></select></label>
      <div class="grid grid-cols-2 gap-4">
        <label class="block"><span class="cellhead">N° PLANO</span><input id="nDwg" class="fld mt-1.5 mono text-[12.5px]" placeholder="FL-1240"></label>
        <label class="block"><span class="cellhead">REVISIÓN</span><input id="nRev" class="fld mt-1.5 mono text-[12.5px]" value="A"></label>
      </div>
      <label class="block"><span class="cellhead">MATERIAL</span>
        <select id="nMat" class="fld mt-1.5 mono text-[12.5px]">
          ${['AISI 4140','42CrMo4','AISI 316L','C45','20MnCr5','GGG50','7075-T6'].map(m=>`<option>${m}</option>`).join('')}</select></label>
      <div class="grid grid-cols-3 gap-4">
        <label class="block"><span class="cellhead">CANTIDAD *</span><input id="nQty" type="number" min="1" class="fld mt-1.5 mono text-[12.5px]" value="10"></label>
        <label class="block"><span class="cellhead">ENTREGA *</span><input id="nDue" type="date" class="fld mt-1.5 mono text-[12.5px]"></label>
        <label class="block"><span class="cellhead">P. UNIT. $</span><input id="nPrice" type="number" min="0" class="fld mt-1.5 mono text-[12.5px]" value="120000"></label>
      </div>
      <label class="block md:col-span-2"><span class="cellhead">REQUERIMIENTO DEL CLIENTE *</span>
        <textarea id="nText" rows="3" class="fld mt-1.5" placeholder="Descripción del trabajo, especificaciones, requisitos de certificación…"></textarea></label>
      <div class="md:col-span-2 flex flex-wrap items-center gap-4 border-t border-line pt-5">
        <p class="text-[11.5px] text-muted flex-1 min-w-[240px] leading-relaxed">Se crea el expediente con la solicitud y su cotización en estado <b>pendiente</b>. Al aprobarse, se generará la Orden de Trabajo transferiendo todos los datos.</p>
        <button type="submit" class="btn btn-acc"><i data-lucide="plus" class="w-3.5 h-3.5"></i>REGISTRAR SOLICITUD Y COTIZACIÓN</button>
      </div>
    </form>
  </div>`;
  const d=new Date();d.setDate(d.getDate()+21);
  $('#nDue').value=`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  lucide.createIcons();
}
function saveNew(e){
  e.preventDefault();
  const part=$('#nPart').value.trim(),qty=parseInt($('#nQty').value)||0,text=$('#nText').value.trim();
  if(!part)return toast('err','Falta la pieza','Indique la denominación de la pieza a mecanizar.');
  if(!qty||qty<1)return toast('err','Cantidad inválida','La cantidad debe ser mayor a cero.');
  if(!text)return toast('err','Falta el requerimiento','Describa el trabajo solicitado por el cliente.');
  const id='COT-2025-00'+(seqCOT++);
  const kind=$('#nKind').value,price=parseInt($('#nPrice').value)||0;
  const n={id,kind:'COT',status:'COT_PEND',
    client:{name:$('#nCli').value,code:'CLI-'+pad(10+OTS.length%40),contact:$('#nContact').value.trim()||'—',email:'—'},
    part:{name:part,kind,dwg:($('#nDwg').value.trim()||'SIN-COD').toUpperCase(),rev:($('#nRev').value.trim()||'A').toUpperCase(),
      material:$('#nMat').value,matStd:'A determinar',heat:'—',qty,due:$('#nDue').value},
    request:{ref:'RFQ-'+(seqRFQ++),received:ts().slice(0,10),by:'Área Comercial',channel:'Registro manual',text},
    quote:{number:'COT-2025-03'+(20+seqCOT%80),date:ts().slice(0,10),valid:'15 días',status:'PENDIENTE',
      items:[{d:part+' — '+$('#nMat').value+', según plano '+($('#nDwg').value.trim()||'s/código')+' rev.'+($('#nRev').value.trim()||'A'),q:qty,u:price}],total:qty*price},
    docs:[
      mkDoc('SOL','Solicitud de cliente RFQ-'+(seqRFQ-1),'sol','note',{ts:ts(),stamp:'RECIBIDO',signedBy:'Área Comercial',body:[text]}),
      mkDoc('PLANO','Plano '+($('#nDwg').value.trim()||'SIN-COD')+' rev.'+($('#nRev').value.trim()||'A')+' — '+part,'sol',kind,{rev:($('#nRev').value.trim()||'A'),ts:ts()}),
      mkDoc('COTD','Cotización COT-2025-03'+(20+seqCOT%80),'cot','comercial',{subtype:'COT',num:'COT-2025-03'+(20+seqCOT%80),ts:ts()})
    ],
    log:[
      {ts:ts(),actor:USER,text:'Solicitud de cliente registrada (RFQ-'+(seqRFQ-1)+'). Expediente iniciado.'},
      {ts:ts(),actor:USER,text:'Cotización emitida y vinculada. Pendiente de aprobación del cliente.'}
    ]};
  OTS.unshift(n);
  toast('ok','Expediente creado',id+' — la cotización espera aprobación para generar la OT.');
  openFile(id);
}

