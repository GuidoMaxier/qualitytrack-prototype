/* ================================================================
   QualityTrack — design/dashboard/01-base.js
   Utilidades, constantes de estado/documento y fábrica de documentos (mkDoc).
   Extraído verbatim de design/dashboard.html. Ver README.md del módulo.
   ================================================================ */
/* ---------- utilidades ---------- */
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const pad=n=>String(n).padStart(2,'0');
function ts(){const d=new Date();return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`}
function fdate(s){if(!s)return '—';const p=s.split('-');return `${p[2]}.${p[1]}.${p[0]}`}
function fmoney(n){return '$ '+Number(n).toLocaleString('es-AR')}
function hash(s){let h=0x811c9dc5;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,0x01000193)>>>0}return h.toString(16).padStart(8,'0')+'f3a2'}
const USER='L. Godoy · Planificación';

const ST={
  COT_PEND:{l:'COTIZACIÓN PENDIENTE',c:'warn'}, COT_APR:{l:'COTIZACIÓN APROBADA',c:'ok'},
  EN_PRODUCCION:{l:'EN PRODUCCIÓN',c:'accent'}, EN_CALIDAD:{l:'EN CONTROL DE CALIDAD',c:'ink'},
  NC:{l:'NC ABIERTA',c:'danger'}, LISTA:{l:'LISTA PARA ENTREGA',c:'ok'},
  ENTREGADA:{l:'ENTREGADA',c:'muted'}, CONVERTIDA:{l:'CONVERTIDA A OT',c:'muted'}
};
const tag=k=>{const m=ST[k];return `<span class="tag" style="color:var(--${m.c})">${m.l}</span>`};

const DT={
  PLANO:{a:'PLN',ic:'drafting-compass'},CERT:{a:'CRT',ic:'flask-conical'},OC:{a:'OCT',ic:'clipboard-list'},
  FAC:{a:'FAC',ic:'receipt'},REM:{a:'REM',ic:'package-check'},SOL:{a:'SOL',ic:'mail'},
  COTD:{a:'COT',ic:'file-text'},QC:{a:'QC',ic:'shield-check'},INF:{a:'INF',ic:'file-text'},ADJ:{a:'ADJ',ic:'paperclip'}
};
const STAGE_L={sol:'SOLICITUD',cot:'COTIZACIÓN',ot:'ORDEN DE TRABAJO',ruta:'HOJA DE RUTA',cal:'CALIDAD',ent:'ENTREGA'};
const STAGES=[['sol','01','SOLICITUD'],['cot','02','COTIZACIÓN'],['ot','03','ORDEN DE TRABAJO'],['ruta','04','HOJA DE RUTA'],['cal','05','CONTROL DE CALIDAD'],['ent','06','ENTREGA']];

let dseq=1;
const mkDoc=(type,title,stage,viewer,extra={})=>Object.assign({id:'D'+(dseq++),type,title,stage,viewer,ts:'2025-06-02 09:15',rev:'—'},extra);

