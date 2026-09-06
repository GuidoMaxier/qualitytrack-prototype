/* ================================================================
   QualityTrack — design/dashboard/02-plantillas.js
   Plantillas de hoja de ruta y planes de inspección (QL) por tipo de pieza.
   Extraído verbatim de design/dashboard.html. Ver README.md del módulo.
   ================================================================ */
/* ---------- plantillas de hoja de ruta y plan de inspección ---------- */
const ROUTING={
  flange:[
    ['Corte de materia prima','Sierra cinta HEM 260',45,'R. Suárez'],
    ['Torneado OD y caras','Torno CNC Gildemeister',120,'M. Ibarra'],
    ['Torneado interior y frente','Torno CNC Gildemeister',90,'R. Suárez'],
    ['Fresado de ranuras de unión','Centro mecanizado Haas VF-4',75,'M. Ibarra'],
    ['Taladrado PCD 6× Ø24','Taladro radial Ferrari 1.6 m',40,'J. Paredes'],
    ['Debaste y limpieza','Banco — prensa',25,'J. Paredes'],
    ['Inspección dimensional final','Mesa de control',30,'A. Ríos']],
  shaft:[
    ['Corte de materia prima','Sierra cinta HEM 260',30,'R. Suárez'],
    ['Torneado de extremos y centros','Torno paralelo SOP-500',70,'R. Suárez'],
    ['Torneado de perfil CNC','Torno CNC Gildemeister',110,'M. Ibarra'],
    ['Fresado de chavetero','Fresadora Bridgeport',45,'M. Ibarra'],
    ['Rectificado cilíndrico','Rectificadora R-320',60,'C. Ferrer'],
    ['Inspección dimensional final','Mesa de control',30,'A. Ríos']],
  plate:[
    ['Corte de blank','Plasma CNC Hypertherm',35,'J. Paredes'],
    ['Fresado de caras','Centro mecanizado Haas VF-4',60,'M. Ibarra'],
    ['Taladrado de pasadas y ranura','Centro mecanizado Haas VF-4',50,'M. Ibarra'],
    ['Ajuste, debaste y marcado','Banco — prensa',25,'J. Paredes'],
    ['Inspección dimensional final','Mesa de control',25,'A. Ríos']]
};
const mkRouting=kind=>ROUTING[kind].map((r,i)=>({n:(i+1)*10,op:r[0],machine:r[1],std:r[2],operator:r[3],state:'PEND',actual:null,startMs:null}));
const setRouting=(kind,ovs)=>{const rt=mkRouting(kind);ovs.forEach((v,i)=>{Object.assign(rt[i],{state:v[0],actual:v[1]??null,startMs:v[0]==='RUN'?Date.now()-23*60000:null})});return rt};

const QPLANS={
  flange:[['QL-01','Control dimensional general','Según plano · ISO 2768-mK','Calibre, micrómetro, comparador'],
          ['QL-02','Dureza superficial','40–44 HRC','Durómetro Rockwell'],
          ['QL-03','Inspección visual y acabado','Sin rebabas ni marcas de herramienta','Visual — lupa 10×']],
  shaft:[['QL-01','Control dimensional general','Según plano · ajustes k6','Micrómetro, maura'],
         ['QL-02','Dureza tras tratamiento','58–62 HRC','Durómetro Rockwell'],
         ['QL-03','Acabado superficial rectificado','Ra ≤ 0.8 µm en asientos','Rugosímetro']],
  plate:[['QL-01','Control dimensional general','Según plano · posiciones de pasadas','Calibre cota, galga'],
         ['QL-02','Rugosidad y planitud','Ra ≤ 3.2 µm · planitud 0.05 mm','Rugosímetro, mármol'],
         ['QL-03','Inspección visual','Sin rebabas — marcado legible','Visual']]
};
const mkQPlan=kind=>QPLANS[kind].map(p=>[...p]);

