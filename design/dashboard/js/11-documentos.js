/* ================================================================
   QualityTrack — design/dashboard/11-documentos.js
   Render de documentos: certificado 3.1, certificado interno QC, comerciales y notas.
   Extraído verbatim de design/dashboard.html. Ver README.md del módulo.
   ================================================================ */
/* --- certificado de materia prima --- */
function renderCert(o){
  return `
  <div class="flex items-start justify-between border-b-2 border-ink pb-4">
    <div><div class="text-[17px] font-extrabold xdisp">LABICERT S.A.</div>
      <div class="kicker mt-1">LABORATORIO DE ENSAYOS DE MATERIALES</div></div>
    <div class="text-right"><div class="mono text-[12px] font-bold">CERTIFICADO N° CERT-2025/1188</div>
      <div class="mono text-[10.5px] text-muted mt-1">EN 10204 · TIPO 3.1 · PÁG. 1/1</div></div>
  </div>
  <div class="grid grid-cols-2 gap-px bg-line border border-line mt-5">
    ${[['PRODUCTO','Barra calibrada Ø65 — '+o.part.material],['COLADA','88412'],['CLIENTE','QualityTrack S.A.'],['FECHA DE ENSAYO','30.05.2025']].map(c=>`
      <div class="bg-white p-3"><div class="cellhead">${c[0]}</div><div class="text-[13px] font-semibold mt-0.5">${c[1]}</div></div>`).join('')}
  </div>
  <div class="cellhead mt-6 mb-2">COMPOSICIÓN QUÍMICA (%) · ESPECTROMETRÍA</div>
  <table class="w-full text-[12px] border border-line">
    <thead><tr class="bg-paper">${['C','Si','Mn','Cr','Mo','P','S'].map(e=>`<th class="th !py-2 text-center">${e}</th>`).join('')}</tr></thead>
    <tbody><tr class="mono">${['0.41','0.24','0.78','1.05','0.21','0.014','0.012'].map(v=>`<td class="td !py-2 text-center">${v}</td>`).join('')}</tr></tbody>
  </table>
  <div class="cellhead mt-6 mb-2">PROPIEDADES MECÁNICAS</div>
  <table class="w-full text-[12px] border border-line">
    <thead><tr class="bg-paper text-left"><th class="th !py-2">ENSAYO</th><th class="th !py-2">RESULTADO</th><th class="th !py-2">REQUISITO</th><th class="th !py-2">VEREDICTO</th></tr></thead>
    <tbody class="mono">
      <tr class="border-t border-line"><td class="td !py-2">Límite elástico Re</td><td class="td !py-2">685 MPa</td><td class="td !py-2">≥ 650 MPa</td><td class="td !py-2" style="color:var(--ok)">CONFORME</td></tr>
      <tr class="border-t border-line"><td class="td !py-2">Resistencia a tracción Rm</td><td class="td !py-2">905 MPa</td><td class="td !py-2">900–1100 MPa</td><td class="td !py-2" style="color:var(--ok)">CONFORME</td></tr>
      <tr class="border-t border-line"><td class="td !py-2">Alargamiento A</td><td class="td !py-2">16 %</td><td class="td !py-2">≥ 12 %</td><td class="td !py-2" style="color:var(--ok)">CONFORME</td></tr>
      <tr class="border-t border-line"><td class="td !py-2">Dureza (recocido)</td><td class="td !py-2">277 HB</td><td class="td !py-2">≤ 285 HB</td><td class="td !py-2" style="color:var(--ok)">CONFORME</td></tr>
    </tbody>
  </table>
  <div class="flex items-end justify-between mt-8">
    <div class="text-[11px] text-muted leading-relaxed max-w-[360px]">Se certifica que el material indicado fue ensayado conforme a norma y resulta apto para la fabricación requerida por el cliente.</div>
    <div class="text-center">
      <span class="stamp -rotate-3" style="color:var(--ok)">CONFORME</span>
      <div class="h-px w-[180px] bg-ink mt-4"></div>
      <div class="mono text-[10px] text-muted mt-1.5">ING. C. BASTIDA · JEFA DE LABORATORIO</div>
    </div>
  </div>`;
}

/* --- certificado interno de calidad --- */
function renderQCert(o,d){
  return `
  <div class="flex items-start justify-between border-b-2 border-ink pb-4">
    <div class="flex items-center gap-3">
      <div class="w-9 h-9 bg-ink relative"><span class="absolute inset-0 grid place-items-center text-paper mono font-bold text-[13px]">QT</span><span class="absolute right-0 bottom-0 w-2.5 h-2.5 bg-accent"></span></div>
      <div><div class="text-[16px] font-extrabold xdisp">QUALITYTRACK S.A.</div><div class="kicker mt-1">MECANIZADO INDUSTRIAL</div></div>
    </div>
    <div class="text-right"><div class="mono text-[12px] font-bold">CERTIFICADO INTERNO ${d.num||'CI-—'}</div>
      <div class="mono text-[10.5px] text-muted mt-1">EMISIÓN ${d.ts}</div></div>
  </div>
  <div class="grid grid-cols-2 gap-px bg-line border border-line mt-5">
    ${[['ORDEN DE TRABAJO',o.id],['CLIENTE',o.client.name],['PIEZA',o.part.name+' ('+o.part.dwg+' rev.'+o.part.rev+')'],['LOTE',o.part.qty+' piezas — '+o.part.material+' · colada '+(o.part.heat||'—')]].map(c=>`
      <div class="bg-white p-3"><div class="cellhead">${c[0]}</div><div class="text-[12.5px] font-semibold mt-0.5">${esc(String(c[1]))}</div></div>`).join('')}
  </div>
  <div class="cellhead mt-6 mb-2">REGISTROS DE INSPECCIÓN DEL LOTE</div>
  <table class="w-full text-[12px] border border-line">
    <thead><tr class="bg-paper text-left"><th class="th !py-2">CÓD.</th><th class="th !py-2">CONTROL</th><th class="th !py-2">INSPECTOR</th><th class="th !py-2">FECHA</th><th class="th !py-2">VEREDICTO</th></tr></thead>
    <tbody>${o.quality.plan.map(p=>{const r=[...o.quality.records].reverse().find(x=>x.code===p[0]);
      return `<tr class="border-t border-line"><td class="td !py-2 mono font-bold">${p[0]}</td><td class="td !py-2">${p[1]}</td>
      <td class="td !py-2 mono text-[11px]">${r?esc(r.inspector):'—'}</td><td class="td !py-2 mono text-[11px]">${r?r.ts:'—'}</td>
      <td class="td !py-2" style="color:${r&&r.result==='OK'?'var(--ok)':'var(--muted)'}">${r&&r.result==='OK'?'CONFORME':'—'}</td></tr>`}).join('')}</tbody>
  </table>
  <div class="flex items-end justify-between mt-8">
    <div class="text-[11px] text-muted leading-relaxed max-w-[380px]">Se certifica que el lote identificado cumple el plan de inspección y las especificaciones del plano de referencia. Documentación de respaldo disponible en el expediente de trazabilidad ${o.id}.</div>
    <div class="text-center">
      <span class="stamp -rotate-3" style="color:var(--ok)">LIBERADO</span>
      <div class="h-px w-[180px] bg-ink mt-4"></div>
      <div class="mono text-[10px] text-muted mt-1.5">A. RÍOS · JEFA DE CONTROL DE CALIDAD</div>
    </div>
  </div>`;
}

/* --- documentos comerciales (cotización / OC / remito / factura) --- */
function renderComercial(o,d){
  const conf={
    COT:{t:'COTIZACIÓN',from:'QUALITYTRACK S.A. — MECANIZADO INDUSTRIAL',to:o.client.name},
    OC:{t:'ORDEN DE COMPRA',from:d.from||o.client.name,to:'QUALITYTRACK S.A.'},
    REM:{t:'REMISO / REMITO',from:'QUALITYTRACK S.A.',to:o.client.name},
    FAC:{t:'FACTURA A',from:'QUALITYTRACK S.A.',to:o.client.name}
  }[d.subtype||'COT'];
  const items=(o.quote?.items||[]).map(it=>({...it}));
  return `
  <div class="flex items-start justify-between border-b-2 border-ink pb-4">
    <div><div class="text-[17px] font-extrabold xdisp">${conf.t} ${d.num?'N° '+d.num:''}</div>
      <div class="kicker mt-1">DOCUMENTO COMERCIAL VINCULADO AL EXPEDIENTE ${o.id}</div></div>
    <div class="text-right mono text-[10.5px] text-muted">EMISIÓN<br><b class="text-ink text-[12px]">${d.ts}</b></div>
  </div>
  <div class="grid grid-cols-2 gap-px bg-line border border-line mt-5">
    <div class="bg-white p-3"><div class="cellhead">EMITE</div><div class="text-[13px] font-semibold mt-0.5">${conf.from}</div></div>
    <div class="bg-white p-3"><div class="cellhead">DIRIGIDO A</div><div class="text-[13px] font-semibold mt-0.5">${esc(conf.to)}</div></div>
  </div>
  <table class="w-full text-[12px] border border-line mt-5">
    <thead><tr class="bg-paper text-left"><th class="th !py-2">DESCRIPCIÓN</th><th class="th !py-2 text-right">CANT.</th><th class="th !py-2 text-right">P. UNITARIO</th><th class="th !py-2 text-right">SUBTOTAL</th></tr></thead>
    <tbody>${items.map(it=>`<tr class="border-t border-line">
      <td class="td !py-2.5">${esc(it.d)}</td><td class="td !py-2.5 mono text-right">${it.q}</td>
      <td class="td !py-2.5 mono text-right">${fmoney(it.u)}</td><td class="td !py-2.5 mono text-right font-semibold">${fmoney(it.q*it.u)}</td></tr>`).join('')}
    <tr class="border-t-2 border-ink bg-paper"><td class="td !py-3 font-bold" colspan="3">TOTAL</td>
      <td class="td !py-3 mono text-right font-bold text-[13px]">${fmoney(o.quote?.total||items.reduce((a,i)=>a+i.q*i.u,0))}</td></tr></tbody>
  </table>
  ${d.subtype==='REM'?`<div class="border border-line mt-5 p-3.5"><div class="cellhead">RECIBIDO POR (CLIENTE)</div>
    <div class="h-px bg-ink w-[260px] mt-6"></div><div class="mono text-[10px] text-muted mt-1.5">${esc(d.receivedBy||'—')} · ${d.ts}</div></div>`:''}
  <div class="flex items-end justify-between mt-8">
    <div class="mono text-[10px] text-muted leading-relaxed">${d.subtype==='COT'?'Validez de la oferta: '+(o.quote?.valid||'15 días')+' · Precios con IVA incluido.':d.subtype==='OC'?'Condiciones de entrega según cotización aceptada.':'Documentación respaldante disponible en el expediente '+o.id+'.'}</div>
    <div class="text-center"><div class="h-px w-[180px] bg-ink"></div><div class="mono text-[10px] text-muted mt-1.5">FIRMA Y SELLO</div></div>
  </div>`;
}

/* --- notas / solicitudes / conformidades --- */
function renderNote(o,d){
  return `
  <div class="flex items-start justify-between border-b-2 border-ink pb-4">
    <div class="flex items-center gap-3">
      <div class="w-9 h-9 bg-ink relative"><span class="absolute inset-0 grid place-items-center text-paper mono font-bold text-[13px]">QT</span><span class="absolute right-0 bottom-0 w-2.5 h-2.5 bg-accent"></span></div>
      <div><div class="text-[16px] font-extrabold xdisp">QUALITYTRACK S.A.</div><div class="kicker mt-1">MECANIZADO INDUSTRIAL · EXPEDIENTE ${o.id}</div></div>
    </div>
    <div class="text-right mono text-[10.5px] text-muted">EMISIÓN<br><b class="text-ink text-[12px]">${d.ts}</b></div>
  </div>
  <div class="mt-6 text-[16px] font-bold xdisp">${esc(d.title)}</div>
  <div class="h-px bg-line mt-3 mb-5"></div>
  <div class="grid gap-3.5">${(d.body||['Documento del expediente.']).map(p=>`<p class="text-[13.5px] leading-relaxed">${esc(p)}</p>`).join('')}</div>
  <div class="flex items-end justify-between mt-10">
    <div class="text-[11px] text-muted leading-relaxed max-w-[340px]">Registro digital del expediente. Verificación de integridad: <span class="mono">${hash(d.id+d.title)}</span></div>
    <div class="text-center">
      ${d.stamp?`<span class="stamp -rotate-3 mb-4" style="color:var(--${{RECIBIDO:'ink',APROBADO:'ok',CONFORME:'ok',LIBERADO:'ok'}[d.stamp]||'ink'})">${d.stamp}</span>`:''}
      <div class="h-px w-[180px] bg-ink"></div>
      <div class="mono text-[10px] text-muted mt-1.5">${esc(d.signedBy||'FIRMA AUTORIZADA')}</div>
    </div>
  </div>`;
}

