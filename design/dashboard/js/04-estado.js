/* ================================================================
   QualityTrack — design/dashboard/04-estado.js
   Estado global, navegación base del expediente y componentes comunes de render.
   Extraído verbatim de design/dashboard.html. Ver README.md del módulo.
   ================================================================ */
/* ---------- estado de la app ---------- */
const state={view:'board',current:null,filter:'TODOS',query:'',traceSel:'OT-2025-0101'};
const uiStage={};
const byId=id=>OTS.find(o=>o.id===id);
let seqOT=105,seqCOT=91,seqRFQ=2226,seqNC=1,seqREM=190,seqCI=255,seqFAC=458;
const stageFromStatus=o=>o.kind==='COT'?'cot':({EN_PRODUCCION:'ruta',NC:'ruta',EN_CALIDAD:'cal',LISTA:'ent',ENTREGADA:'ent'}[o.status]||'sol');
function openFile(id){state.view='file';state.current=id;if(!uiStage[id])uiStage[id]=stageFromStatus(byId(id));render();scrollTo(0,0)}
function setView(v){state.view=v;render();scrollTo(0,0)}
function setStage(k){uiStage[state.current]=k;render()}
function goTrace(id){state.traceSel=id;setView('trace')}
function logEv(o,text,actor=USER){o.log.push({ts:ts(),actor,text,fresh:true})}

/* ---------- componentes comunes ---------- */
const docRow=(o,d)=>`<button onclick="viewDoc('${o.id}','${d.id}')" class="w-full flex items-center gap-3 border border-line bg-card hover:border-ink px-3 py-2.5 text-left transition-colors group">
  <span class="mono text-[9px] font-bold w-8 h-8 grid place-items-center border border-line2 group-hover:border-ink shrink-0">${DT[d.type].a}</span>
  <span class="min-w-0 flex-1"><span class="block text-[12px] font-semibold leading-tight truncate">${esc(d.title)}</span>
  <span class="block mono text-[9.5px] text-muted mt-0.5">${STAGE_L[d.stage]} · ${d.ts} · REV ${d.rev}</span></span>
  <i data-lucide="eye" class="w-3.5 h-3.5 text-muted shrink-0"></i></button>`;

const stageDocList=(o,k)=>{const ds=o.docs.filter(d=>d.stage===k);if(!ds.length)return '';
  return `<div class="mt-6"><div class="kicker mb-2.5">DOCUMENTACIÓN VINCULADA · ${ds.length}</div>
  <div class="grid md:grid-cols-2 gap-2">${ds.map(d=>docRow(o,d)).join('')}</div></div>`};

const sHead=(num,title,sub)=>`<div><div class="kicker mb-1">ETAPA ${num} / 06</div>
  <h2 class="text-[22px] font-extrabold xdisp leading-none">${title}</h2>
  ${sub?`<div class="text-[12.5px] text-muted mt-1.5">${sub}</div>`:''}</div>
  <div class="h-px bg-ink mt-4 mb-5"></div>`;

const opTag=s=>s==='DONE'?`<span class="tag" style="color:var(--ok)">COMPLETA</span>`
  :s==='RUN'?`<span class="tag node-live" style="color:var(--accent)">● EN CURSO</span>`
  :`<span class="tag" style="color:var(--muted)">PENDIENTE</span>`;

const avanceCell=o=>{
  if(o.routing&&o.kind==='OT'){
    const seg=o.routing.map(x=>`<span class="w-2.5 h-2.5 inline-block ${x.state==='DONE'?'bg-ink':x.state==='RUN'?'bg-accent node-live':'border border-line2'}"></span>`).join('');
    const d=o.routing.filter(x=>x.state==='DONE').length;
    return `<div class="flex items-center gap-1">${seg}<span class="mono text-[10.5px] text-muted ml-2">${d}/${o.routing.length}</span></div>`;
  }
  if(o.status==='CONVERTIDA')return `<span class="mono text-[11px] text-muted">→ ${o.convertedTo}</span>`;
  return `<span class="mono text-[11px] text-muted">—</span>`;
};

