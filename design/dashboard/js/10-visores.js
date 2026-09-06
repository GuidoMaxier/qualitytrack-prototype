/* ================================================================
   QualityTrack — design/dashboard/10-visores.js
   Visor de documentos: overlay, zoom/pan y planos técnicos SVG por tipo de pieza.
   Extraído verbatim de design/dashboard.html. Ver README.md del módulo.
   ================================================================ */
/* ================= VISOR DE DOCUMENTOS ================= */
let z={s:1,x:0,y:0};
function zApply(){const w=$('#svgWrap');if(!w)return;w.style.transform=`translate(${z.x}px,${z.y}px) scale(${z.s})`;w.style.transformOrigin='center center'}
function zStep(f){z.s=Math.min(6,Math.max(.5,z.s*f));zApply()}
function zReset(){z={s:1,x:0,y:0};zApply()}
function wireZoom(){
  const b=$('#docBody');z={s:1,x:0,y:0};
  b.addEventListener('wheel',e=>{e.preventDefault();z.s=Math.min(6,Math.max(.5,z.s*(e.deltaY<0?1.15:.87)));zApply()},{passive:false});
  const w=$('#svgWrap');let drag=null;
  w.addEventListener('pointerdown',e=>{drag={x:e.clientX-z.x,y:e.clientY-z.y};w.setPointerCapture(e.pointerId);w.style.cursor='grabbing'});
  w.addEventListener('pointermove',e=>{if(drag){z.x=e.clientX-drag.x;z.y=e.clientY-drag.y;zApply()}});
  ['pointerup','pointercancel'].forEach(ev=>w.addEventListener(ev,()=>{drag=null;w.style.cursor='grab'}));
}
function closeDoc(){const o=$('#docOverlay');o.className='fixed inset-0 z-50 hidden';o.innerHTML=''}

function viewDoc(otId,docId){
  const o=byId(otId),d=o.docs.find(x=>x.id===docId);if(!d)return;
  const isSvg=['flange','shaft','plate'].includes(d.viewer);
  $('#docOverlay').className='fixed inset-0 z-50 flex items-center justify-center p-3 lg:p-8 bg-ink/60 backdrop-blur-[2px]';
  $('#docOverlay').innerHTML=`
  <div class="w-full max-w-[980px] max-h-full flex flex-col">
    <div class="flex items-center gap-3 bg-ink text-paper px-4 py-2.5 shrink-0">
      <span class="mono text-[9px] font-bold border border-paper/40 px-2 py-1">${DT[d.type].a}</span>
      <div class="min-w-0 flex-1">
        <div class="text-[13px] font-bold truncate">${esc(d.title)}</div>
        <div class="mono text-[9.5px] text-paper/55 tracking-wider truncate">EXPEDIENTE ${o.id} · EMISIÓN ${d.ts} · REV ${d.rev} · SHA ${hash(d.id+d.title)}</div>
      </div>
      ${isSvg?`<button onclick="zStep(1.25)" class="text-paper/70 hover:text-paper p-1.5" title="Acercar"><i data-lucide="zoom-in" class="w-4 h-4"></i></button>
        <button onclick="zStep(.8)" class="text-paper/70 hover:text-paper p-1.5" title="Alejar"><i data-lucide="zoom-out" class="w-4 h-4"></i></button>
        <button onclick="zReset()" class="text-paper/70 hover:text-paper p-1.5" title="Restablecer"><i data-lucide="maximize" class="w-4 h-4"></i></button>`:''}
      <button onclick="closeDoc()" class="text-paper/70 hover:text-paper p-1.5 ml-1" title="Cerrar"><i data-lucide="x" class="w-4.5 h-4.5 w-[18px] h-[18px]"></i></button>
    </div>
    <div id="docBody" class="overflow-auto scroll-slim bg-ink/40 p-4 lg:p-8 flex justify-center">${docHTML(o,d)}</div>
  </div>`;
  $('#docOverlay').addEventListener('click',e=>{if(e.target.id==='docBody')closeDoc()},{once:true});
  lucide.createIcons();
  if(isSvg)wireZoom();
}

function docHTML(o,d){
  switch(d.viewer){
    case 'flange':return `<div id="svgWrap" class="doc-sheet w-[860px] max-w-full cursor-grab">${svgFlange(o)}</div>`;
    case 'shaft':return `<div id="svgWrap" class="doc-sheet w-[860px] max-w-full cursor-grab">${svgShaft(o)}</div>`;
    case 'plate':return `<div id="svgWrap" class="doc-sheet w-[860px] max-w-full cursor-grab">${svgPlate(o)}</div>`;
    case 'cert':return `<div class="doc-sheet w-[760px] max-w-full p-8">${renderCert(o)}</div>`;
    case 'qcert':return `<div class="doc-sheet w-[760px] max-w-full p-8">${renderQCert(o,d)}</div>`;
    case 'comercial':return `<div class="doc-sheet w-[760px] max-w-full p-8">${renderComercial(o,d)}</div>`;
    case 'note':return `<div class="doc-sheet w-[720px] max-w-full p-8">${renderNote(o,d)}</div>`;
  }
}

/* --- planos técnicos SVG --- */
const svgHead=()=>`<defs>
  <pattern id="hx" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
    <line x1="0" y1="0" x2="0" y2="7" stroke="#22262D" stroke-width="1" opacity=".75"/></pattern>
  <marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
    <path d="M0,0L10,5L0,10z" fill="#22262D"/></marker></defs>`;
const svgFrame=()=>`
  <rect x="16" y="16" width="808" height="608" fill="none" stroke="#22262D" stroke-width="2"/>
  <rect x="24" y="24" width="792" height="592" fill="none" stroke="#22262D" stroke-width=".8"/>
  <line x1="420" y1="16" x2="420" y2="30" stroke="#22262D" stroke-width="1"/>
  <line x1="420" y1="610" x2="420" y2="624" stroke="#22262D" stroke-width="1"/>
  <line x1="16" y1="320" x2="30" y2="320" stroke="#22262D" stroke-width="1"/>
  <line x1="810" y1="320" x2="824" y2="320" stroke="#22262D" stroke-width="1"/>`;
const t=(x,y,s,size=11,w=400,anchor='start',color='#22262D')=>`<text x="${x}" y="${y}" font-family="'JetBrains Mono',monospace" font-size="${size}" font-weight="${w}" fill="${color}" text-anchor="${anchor}">${s}</text>`;
const dim=(x1,y1,x2,y2,label,toff=6)=>`
  <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#22262D" stroke-width=".9" marker-start="url(#ar)" marker-end="url(#ar)"/>
  ${t((x1+x2)/2,(y1+y2)/2-toff,label,10.5,400,'middle')}`;
const leader=(x1,y1,x2,y2,label,l2='')=>`
  <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#22262D" stroke-width=".9" marker-start="url(#ar)"/>
  ${t(x2+5,y2-3,label,10.5,600)}${l2?t(x2+5,y2+11,l2,9.5,400,'start','#6b6455'):''}`;
function titleBlock(px,py,part,dwg,mat,rev){
  const w=270,h=96,x=542,y=520;
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#fff" stroke="#22262D" stroke-width="1.5"/>
    <line x1="${x}" y1="${y+24}" x2="${x+w}" y2="${y+24}" stroke="#22262D" stroke-width="1"/>
    <line x1="${x}" y1="${y+48}" x2="${x+w}" y2="${y+48}" stroke="#22262D" stroke-width=".8"/>
    <line x1="${x}" y1="${y+72}" x2="${x+w}" y2="${y+72}" stroke="#22262D" stroke-width=".8"/>
    <line x1="${x+150}" y1="${y+24}" x2="${x+150}" y2="${y+72}" stroke="#22262D" stroke-width=".8"/>
    <line x1="${x+88}" y1="${y+48}" x2="${x+88}" y2="${y+72}" stroke="#22262D" stroke-width=".8"/>
    <line x1="${x+88}" y1="${y+72}" x2="${x+88}" y2="${y+96}" stroke="#22262D" stroke-width=".8"/>
    ${t(x+8,y+16,'QUALITYTRACK — MECANIZADO INDUSTRIAL',11.5,700)}
    ${t(x+8,y+40,'PIEZA: '+part,9.5)}
    ${t(x+158,y+40,'N° PLANO: '+dwg,9.5,700)}
    ${t(x+8,y+64,'MATERIAL: '+mat,9.5)}
    ${t(x+96,y+64,'REV: '+rev,9.5,700)}
    ${t(x+158,y+64,'ESC: 1:2',9.5)}
    ${t(x+8,y+88,'DIB.: L. GODOY',9)}
    ${t(x+96,y+88,'FECHA: 02.06.2025',9)}
    ${t(x+158,y+88,'HOJA 1/1 · APROB: V.S.',9)}`;
}
const raSym=(x,y,v)=>`<path d="M${x},${y} l5,-9 l5,9" fill="none" stroke="#22262D" stroke-width="1.1"/><line x1="${x-6}" y1="${y}" x2="${x+10}" y2="${y}" stroke="#22262D" stroke-width="1.1"/>${t(x+14,y+3,v,10,600)}`;

function svgFlange(o){
  const holes=[90,150,210,270,330,30].map(a=>{const r=a*Math.PI/180;return [240+86*Math.cos(r),265-86*Math.sin(r)]});
  return `<svg viewBox="0 0 840 640" class="w-full block">
    ${svgHead()}
    <rect width="840" height="640" fill="#fff"/>
    ${svgFrame()}
    <text x="36" y="52" font-family="'JetBrains Mono'" font-size="12" font-weight="700" fill="#22262D">PLANO DE PIEZA — ${o.part.name.toUpperCase()}</text>
    <text x="36" y="70" font-family="'JetBrains Mono'" font-size="9.5" fill="#7B7565">VISTA FRONTAL Y SECCIÓN A-A · TODAS LAS COTAS EN mm</text>
    <line x1="36" y1="82" x2="804" y2="82" stroke="#22262D" stroke-width="1"/>
    <!-- vista frontal -->
    <circle cx="240" cy="265" r="105" fill="none" stroke="#22262D" stroke-width="2"/>
    <circle cx="240" cy="265" r="68" fill="none" stroke="#22262D" stroke-width="1.4"/>
    <circle cx="240" cy="265" r="30" fill="none" stroke="#22262D" stroke-width="1.4"/>
    <circle cx="240" cy="265" r="86" fill="none" stroke="#22262D" stroke-width=".7" stroke-dasharray="5 5"/>
    ${holes.map(h=>`<circle cx="${h[0]}" cy="${h[1]}" r="12" fill="none" stroke="#22262D" stroke-width="1.2"/>`).join('')}
    <line x1="108" y1="265" x2="372" y2="265" stroke="#22262D" stroke-width=".7" stroke-dasharray="16 4 3 4"/>
    <line x1="240" y1="133" x2="240" y2="397" stroke="#22262D" stroke-width=".7" stroke-dasharray="16 4 3 4"/>
    ${leader(314,222,378,152,'6× Ø24 CIEGAS','PCD Ø172 · EQ. SP')}
    ${raSym(352,300,'Ra 3.2')}
    <!-- sección -->
    <path d="M480,265 L480,297 L555,297 L555,237 L517,237 L517,265 Z" fill="url(#hx)" stroke="#22262D" stroke-width="1.5"/>
    <path d="M615,237 L615,297 L690,297 L690,265 L653,265 L653,237 Z" fill="url(#hx)" stroke="#22262D" stroke-width="1.5"/>
    <line x1="585" y1="222" x2="585" y2="312" stroke="#22262D" stroke-width=".7" stroke-dasharray="16 4 3 4"/>
    <text x="585" y="212" font-family="'JetBrains Mono'" font-size="10" font-weight="700" fill="#22262D" text-anchor="middle">A-A</text>
    <line x1="480" y1="297" x2="480" y2="342" stroke="#22262D" stroke-width=".6"/>
    <line x1="690" y1="297" x2="690" y2="342" stroke="#22262D" stroke-width=".6"/>
    ${dim(480,336,690,336,'Ø220')}
    <line x1="517" y1="237" x2="517" y2="212" stroke="#22262D" stroke-width=".6"/>
    <line x1="653" y1="237" x2="653" y2="212" stroke="#22262D" stroke-width=".6"/>
    ${dim(517,218,653,218,'Ø136')}
    <line x1="690" y1="265" x2="722" y2="265" stroke="#22262D" stroke-width=".6"/>
    <line x1="690" y1="297" x2="722" y2="297" stroke="#22262D" stroke-width=".6"/>
    <line x1="714" y1="265" x2="714" y2="297" stroke="#22262D" stroke-width=".9" marker-start="url(#ar)" marker-end="url(#ar)"/>
    ${t(722,284,'32',10.5)}
    ${leader(615,258,736,242,'Ø60 H7','Ra 1.6')}
    ${raSym(480,320,'Ra 1.6')}
    <!-- notas y revisiones -->
    <text x="36" y="462" font-family="'JetBrains Mono'" font-size="11" font-weight="700" fill="#22262D">NOTAS</text>
    ${t(36,482,'1. COTAS EN MILÍMETROS.',9.5)}${t(36,498,'2. TOLERANCIAS GENERALES ISO 2768-mK.',9.5)}
    ${t(36,514,'3. ROTURA DE ARISTAS 0.5 × 45°.',9.5)}${t(36,530,'4. TRATAMIENTO: TEMPLE Y REVENIDO 40–44 HRC.',9.5)}
    <rect x="36" y="544" width="300" height="56" fill="none" stroke="#22262D" stroke-width=".9"/>
    <line x1="36" y1="562" x2="336" y2="562" stroke="#22262D" stroke-width=".7"/>
    <line x1="36" y1="580" x2="336" y2="580" stroke="#22262D" stroke-width=".7"/>
    ${t(42,556,'REV   DESCRIPCIÓN                      FECHA',8.5,700)}
    ${t(42,574,'C     TOLERANCIA BORE → H7            12.05.25',8.5)}
    ${t(42,592,'B     AJUSTE PCD 172                  03.03.25',8.5)}
    ${titleBlock(542,520,o.part.name.toUpperCase(),o.part.dwg,o.part.material,o.part.rev)}
  </svg>`;
}

function svgShaft(o){
  const seg=[[110,45],[55,62],[190,50],[38,68],[80,46]];
  let x=90,top=[],bot=[];
  seg.forEach(s=>{const t1=230-s[1]/2,b1=230+s[1]/2;top.push([x,t1]);bot.push([x,b1]);x+=s[0];top.push([x,t1]);bot.push([x,b1])});
  const topPath='M'+top.map(p=>p.join(',')).join(' L'),botPath='M'+bot.map(p=>p.join(',')).join(' L');
  return `<svg viewBox="0 0 840 640" class="w-full block">
    ${svgHead()}
    <rect width="840" height="640" fill="#fff"/>
    ${svgFrame()}
    <text x="36" y="52" font-family="'JetBrains Mono'" font-size="12" font-weight="700" fill="#22262D">PLANO DE PIEZA — ${o.part.name.toUpperCase()}</text>
    <text x="36" y="70" font-family="'JetBrains Mono'" font-size="9.5" fill="#7B7565">VISTA FRONTAL Y EXTREMO · TODAS LAS COTAS EN mm</text>
    <line x1="36" y1="82" x2="804" y2="82" stroke="#22262D" stroke-width="1"/>
    <path d="${topPath}" fill="none" stroke="#22262D" stroke-width="2"/>
    <path d="${botPath}" fill="none" stroke="#22262D" stroke-width="2"/>
    <line x1="90" y1="${230-seg[0][1]/2}" x2="90" y2="${230+seg[0][1]/2}" stroke="#22262D" stroke-width="2"/>
    <line x1="563" y1="${230-seg[4][1]/2}" x2="563" y2="${230+seg[4][1]/2}" stroke="#22262D" stroke-width="2"/>
    <line x1="70" y1="230" x2="620" y2="230" stroke="#22262D" stroke-width=".7" stroke-dasharray="16 4 3 4"/>
    <path d="M330,${230-25} L330,${230-20} L375,${230-20} L375,${230-25}" fill="none" stroke="#22262D" stroke-width="1.4"/>
    ${leader(145,208,158,152,'Ø45 k6')}${leader(227,199,240,142,'Ø62')}
    ${leader(350,206,362,150,'Ø50 k6','Ra 0.8 · RECTIFICADO')}${leader(464,197,480,142,'Ø68')}
    ${raSym(255,190,'Ra 0.8')}
    <line x1="90" y1="262" x2="90" y2="306" stroke="#22262D" stroke-width=".6"/>
    <line x1="200" y1="261" x2="200" y2="306" stroke="#22262D" stroke-width=".6"/>
    <line x1="255" y1="261" x2="255" y2="306" stroke="#22262D" stroke-width=".6"/>
    <line x1="445" y1="264" x2="445" y2="306" stroke="#22262D" stroke-width=".6"/>
    <line x1="483" y1="264" x2="483" y2="306" stroke="#22262D" stroke-width=".6"/>
    <line x1="563" y1="253" x2="563" y2="306" stroke="#22262D" stroke-width=".6"/>
    ${dim(90,300,200,300,'110')}${dim(200,300,255,300,'55')}${dim(255,300,445,300,'190')}${dim(445,300,483,300,'38')}
    <line x1="90" y1="330" x2="90" y2="352" stroke="#22262D" stroke-width=".6"/>
    <line x1="563" y1="330" x2="563" y2="352" stroke="#22262D" stroke-width=".6"/>
    ${dim(90,346,563,346,'473 TOTAL')}
    <!-- extremo -->
    <circle cx="680" cy="230" r="23" fill="none" stroke="#22262D" stroke-width="1.6"/>
    <path d="M673,207 L673,213 L687,213 L687,207" fill="none" stroke="#22262D" stroke-width="1.4"/>
    <line x1="650" y1="230" x2="710" y2="230" stroke="#22262D" stroke-width=".7" stroke-dasharray="12 4 3 4"/>
    <line x1="680" y1="200" x2="680" y2="260" stroke="#22262D" stroke-width=".7" stroke-dasharray="12 4 3 4"/>
    ${t(680,278,'EXTREMO A',9,400,'middle')}
    <text x="36" y="462" font-family="'JetBrains Mono'" font-size="11" font-weight="700" fill="#22262D">NOTAS</text>
    ${t(36,482,'1. COTAS EN MILÍMETROS.',9.5)}${t(36,498,'2. AJUSTES k6 SEGÚN PLANO · ISO 286.',9.5)}
    ${t(36,514,'3. CHAVETERO SEGÚN DIN 6885.',9.5)}${t(36,530,'4. CEMENTADO Y TEMPLE DONDE SE INDICA.',9.5)}
    <rect x="36" y="544" width="300" height="56" fill="none" stroke="#22262D" stroke-width=".9"/>
    <line x1="36" y1="562" x2="336" y2="562" stroke="#22262D" stroke-width=".7"/>
    <line x1="36" y1="580" x2="336" y2="580" stroke="#22262D" stroke-width=".7"/>
    ${t(42,556,'REV   DESCRIPCIÓN                      FECHA',8.5,700)}
    ${t(42,574,'A     EMISIÓN INICIAL                  20.05.25',8.5)}
    ${t(42,592,'—     —                                —',8.5)}
    ${titleBlock(542,520,o.part.name.toUpperCase(),o.part.dwg,o.part.material,o.part.rev)}
  </svg>`;
}

function svgPlate(o){
  return `<svg viewBox="0 0 840 640" class="w-full block">
    ${svgHead()}
    <rect width="840" height="640" fill="#fff"/>
    ${svgFrame()}
    <text x="36" y="52" font-family="'JetBrains Mono'" font-size="12" font-weight="700" fill="#22262D">PLANO DE PIEZA — ${o.part.name.toUpperCase()}</text>
    <text x="36" y="70" font-family="'JetBrains Mono'" font-size="9.5" fill="#7B7565">VISTA FRONTAL Y LATERAL · TODAS LAS COTAS EN mm</text>
    <line x1="36" y1="82" x2="804" y2="82" stroke="#22262D" stroke-width="1"/>
    <rect x="140" y="150" width="380" height="240" fill="none" stroke="#22262D" stroke-width="2"/>
    <rect x="290" y="210" width="80" height="120" rx="40" fill="none" stroke="#22262D" stroke-width="1.4"/>
    ${[[176,186],[484,186],[176,354],[484,354]].map(h=>`
      <circle cx="${h[0]}" cy="${h[1]}" r="9" fill="none" stroke="#22262D" stroke-width="1.2"/>
      <line x1="${h[0]-15}" y1="${h[1]}" x2="${h[0]+15}" y2="${h[1]}" stroke="#22262D" stroke-width=".6" stroke-dasharray="10 3 2 3"/>
      <line x1="${h[0]}" y1="${h[1]-15}" x2="${h[0]}" y2="${h[1]+15}" stroke="#22262D" stroke-width=".6" stroke-dasharray="10 3 2 3"/>`).join('')}
    ${leader(176,186,196,120,'4× Ø18 PASADAS','EQ. SP · POSICIÓN ±0.2')}
    <line x1="140" y1="390" x2="140" y2="432" stroke="#22262D" stroke-width=".6"/>
    <line x1="520" y1="390" x2="520" y2="432" stroke="#22262D" stroke-width=".6"/>
    ${dim(140,426,520,426,'380')}
    <line x1="104" y1="150" x2="140" y2="150" stroke="#22262D" stroke-width=".6"/>
    <line x1="104" y1="390" x2="140" y2="390" stroke="#22262D" stroke-width=".6"/>
    <line x1="112" y1="150" x2="112" y2="390" stroke="#22262D" stroke-width=".9" marker-start="url(#ar)" marker-end="url(#ar)"/>
    ${t(120,274,'240',10.5,400,'middle')}
    <!-- lateral -->
    <rect x="600" y="150" width="24" height="240" fill="url(#hx)" stroke="#22262D" stroke-width="1.5"/>
    <line x1="612" y1="150" x2="612" y2="390" stroke="#22262D" stroke-width=".7" stroke-dasharray="6 4"/>
    ${t(612,412,'ESP. 18',9.5,400,'middle')}
    ${raSym(560,110,'Ra 3.2')}
    <text x="36" y="462" font-family="'JetBrains Mono'" font-size="11" font-weight="700" fill="#22262D">NOTAS</text>
    ${t(36,482,'1. COTAS EN MILÍMETROS.',9.5)}${t(36,498,'2. TOLERANCIAS GENERALES ISO 2768-mK.',9.5)}
    ${t(36,514,'3. ARISTAS VIVAS ROTA 0.3 × 45°.',9.5)}${t(36,530,'4. MARCAR PIEZA SEGÚN CÓDIGO DE OT.',9.5)}
    <rect x="36" y="544" width="300" height="56" fill="none" stroke="#22262D" stroke-width=".9"/>
    <line x1="36" y1="562" x2="336" y2="562" stroke="#22262D" stroke-width=".7"/>
    <line x1="36" y1="580" x2="336" y2="580" stroke="#22262D" stroke-width=".7"/>
    ${t(42,556,'REV   DESCRIPCIÓN                      FECHA',8.5,700)}
    ${t(42,574,'B     AUMENTO ESP. 16 → 18             28.02.25',8.5)}
    ${t(42,592,'A     EMISIÓN INICIAL                  14.11.24',8.5)}
    ${titleBlock(542,520,o.part.name.toUpperCase(),o.part.dwg,o.part.material,o.part.rev)}
  </svg>`;
}

