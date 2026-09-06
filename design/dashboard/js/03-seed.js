/* ================================================================
   QualityTrack — design/dashboard/03-seed.js
   Datos semilla: los 6 expedientes demo (OTs y cotizaciones) con su bitácora.
   Extraído verbatim de design/dashboard.html. Ver README.md del módulo.
   ================================================================ */
/* ---------- datos semilla (expedientes) ---------- */
const OTS=[];

/* OT-2025-0104 · EN PRODUCCIÓN (flanza, AISI 4140) */
{
const o={id:'OT-2025-0104',kind:'OT',status:'EN_PRODUCCION',
 client:{name:'Metalúrgica Delta S.A.',code:'CLI-014',contact:'Ing. M. Ferrer',email:'compras@metaldelta.com.ar'},
 part:{name:'Flanza de acople Ø220',kind:'flange',dwg:'FL-1204',rev:'C',material:'AISI 4140',matStd:'EN 10204 · 3.1',heat:'88412',qty:12,due:'2025-06-20'},
 request:{ref:'RFQ-2214',received:'2025-06-02',by:'Área Comercial',channel:'Correo electrónico',
  text:'Necesitamos la fabricación de 12 flanzas de acople según plano adjunto para línea de bombas serie 400. Material AISI 4140 con temple y revenido. Entrega requerida: 20/06. La certificación 3.1 de materia prima es requisito obligatorio de recepción.'},
 quote:{number:'COT-2025-0311',date:'2025-06-03',valid:'15 días',status:'APROBADA',
  items:[{d:'Flanza de acople Ø220 — AISI 4140, c/ tratamiento 40–44 HRC, según plano FL-1204 rev.C',q:12,u:214500}],total:2574000,
  approvedBy:'Ing. M. Ferrer (cliente)',approvedTs:'2025-06-04 10:22'},
 production:{started:'2025-06-05 07:30',releasedBy:'L. Godoy',priority:'ALTA',machine:'Torno CNC Gildemeister · Centro Haas VF-4',
  notes:['Verificar dureza tras tratamiento antes de continuar la secuencia.','Conservar identificación de colada en cada pieza hasta la inspección final.','Entregar con lazo de identificación individual por pieza.']},
 routing:setRouting('flange',[['DONE',52],['DONE',118],['DONE',96],['RUN']]),
 quality:{plan:mkQPlan('flange'),records:[],ncs:[]},
 docs:[
  mkDoc('SOL','Solicitud de cliente RFQ-2214','sol','note',{ts:'2025-06-02 08:41',stamp:'RECIBIDO',signedBy:'Área Comercial',
    body:['Solicitud recibida por correo electrónico del cliente Metalúrgica Delta S.A. con plano FL-1204 rev.C adjunto.','Requerimiento: 12 flanzas de acople en AISI 4140 con certificación 3.1. Entrega comprometida: 20.06.2025.']}),
  mkDoc('PLANO','Plano FL-1204 rev.C — Flanza de acople','sol','flange',{rev:'C',ts:'2025-06-02 08:45'}),
  mkDoc('COTD','Cotización COT-2025-0311','cot','comercial',{subtype:'COT',num:'COT-2025-0311',ts:'2025-06-03 16:05'})
 ],
 log:[
  {ts:'2025-06-02 08:41',actor:'Comercial — P. Lanza',text:'Solicitud de cliente recibida (RFQ-2214) por correo electrónico.'},
  {ts:'2025-06-02 08:45',actor:'Ingeniería',text:'Plano FL-1204 rev.C adjuntado al expediente.'},
  {ts:'2025-06-03 16:05',actor:'Comercial — P. Lanza',text:'Cotización COT-2025-0311 emitida y enviada al cliente.'},
  {ts:'2025-06-04 10:22',actor:'Cliente — Ing. M. Ferrer',text:'Cotización aprobada. Orden de compra OC-4412 recibida.'},
  {ts:'2025-06-04 11:30',actor:'Compras',text:'Certificado de materia prima 3.1 — colada 88412 incorporado al expediente.'},
  {ts:'2025-06-05 07:30',actor:'Planificación — L. Godoy',text:'Orden de Trabajo liberada a producción. Materia prima asignada (colada 88412).'},
  {ts:'2025-06-05 07:58',actor:'Producción — R. Suárez',text:'Operación 10 completada (Corte de materia prima) — 52 min / 45 std.'},
  {ts:'2025-06-05 10:12',actor:'Producción — M. Ibarra',text:'Operación 20 completada (Torneado OD y caras) — 118 min / 120 std.'},
  {ts:'2025-06-05 13:47',actor:'Producción — R. Suárez',text:'Operación 30 completada (Torneado interior y frente) — 96 min / 90 std.'},
  {ts:'2025-06-06 08:05',actor:'Producción — M. Ibarra',text:'Operación 40 iniciada en Centro mecanizado Haas VF-4.'}
 ]};
o.docs.push(mkDoc('CERT','Certificado de materia prima — Colada 88412','ot','cert',{ts:'2025-06-04 11:30'}));
o.docs.push(mkDoc('OC','Orden de compra OC-4412 — Metalúrgica Delta','ot','comercial',{subtype:'OC',num:'OC-4412',from:'Metalúrgica Delta S.A.',ts:'2025-06-04 10:25'}));
OTS.push(o);
}

/* OT-2025-0103 · EN CONTROL DE CALIDAD (eje, 42CrMo4) */
{
const o={id:'OT-2025-0103',kind:'OT',status:'EN_CALIDAD',
 client:{name:'AgroParts Ltd.',code:'CLI-022',contact:'Rta. Compras — S. Molina',email:'smolina@agroparts.com'},
 part:{name:'Eje excéntrico',kind:'shaft',dwg:'EX-0451',rev:'A',material:'42CrMo4',matStd:'EN 10204 · 3.1',heat:'88399',qty:4,due:'2025-06-18'},
 request:{ref:'RFQ-2201',received:'2025-05-26',by:'Área Comercial',channel:'Portal de proveedores',
  text:'Fabricación de 4 ejes excéntricos para cabezal de cosechadora según plano EX-0451. Material 42CrMo4 con endurecimiento por inducción en zonas indicadas. Se requiere trazabilidad de colada y reporte de dureza.'},
 quote:{number:'COT-2025-0298',date:'2025-05-27',valid:'20 días',status:'APROBADA',
  items:[{d:'Eje excéntrico — 42CrMo4, c/ endurecimiento por inducción, según plano EX-0451 rev.A',q:4,u:192000}],total:768000,
  approvedBy:'Rta. Compras — S. Molina (cliente)',approvedTs:'2025-05-29 09:40'},
 production:{started:'2025-06-02 07:00',releasedBy:'L. Godoy',priority:'NORMAL',machine:'Torno CNC Gildemeister · Rectificadora R-320',
  notes:['Proteger zonas endurecidas durante manipuleo.','Registrar tiempo real por operación en hoja de ruta.']},
 routing:setRouting('shaft',[['DONE',33],['DONE',74],['DONE',121],['DONE',41],['DONE',58],['DONE',27]]),
 quality:{plan:mkQPlan('shaft'),
  records:[{code:'QL-01',result:'OK',inspector:'A. Ríos',notes:'Dimensional conforme en las 4 piezas. Primer artículo OK.',ts:'2025-06-09 11:20'}],ncs:[]},
 docs:[
  mkDoc('SOL','Solicitud de cliente RFQ-2201','sol','note',{ts:'2025-05-26 10:12',stamp:'RECIBIDO',signedBy:'Área Comercial',
    body:['Solicitud recibida por portal de proveedores de AgroParts Ltd.','Requerimiento: 4 ejes excéntricos 42CrMo4 con reporte de dureza y trazabilidad de colada.']}),
  mkDoc('PLANO','Plano EX-0451 rev.A — Eje excéntrico','sol','shaft',{rev:'A',ts:'2025-05-26 10:20'}),
  mkDoc('COTD','Cotización COT-2025-0298','cot','comercial',{subtype:'COT',num:'COT-2025-0298',ts:'2025-05-27 15:30'}),
  mkDoc('CERT','Certificado de materia prima — Colada 88399','ot','cert',{ts:'2025-05-30 09:05'}),
  mkDoc('OC','Orden de compra OC-4436 — AgroParts','ot','comercial',{subtype:'OC',num:'OC-4436',from:'AgroParts Ltd.',ts:'2025-05-29 09:45'})
 ],
 log:[
  {ts:'2025-05-26 10:12',actor:'Comercial — P. Lanza',text:'Solicitud de cliente recibida (RFQ-2201) por portal de proveedores.'},
  {ts:'2025-05-29 09:40',actor:'Cliente — S. Molina',text:'Cotización aprobada. OC-4436 emitida por el cliente.'},
  {ts:'2025-06-02 07:00',actor:'Planificación — L. Godoy',text:'Orden de Trabajo liberada a producción.'},
  {ts:'2025-06-06 16:20',actor:'Producción — C. Ferrer',text:'Operación 50 completada (Rectificado cilíndrico) — 58 min / 60 std.'},
  {ts:'2025-06-08 09:10',actor:'Producción — A. Ríos',text:'Operación 60 completada. Hoja de ruta finalizada — lote enviado a Control de Calidad.'},
  {ts:'2025-06-09 11:20',actor:'Calidad — A. Ríos',text:'Inspección registrada: QL-01 — CONFORME. Pendiente QL-02 (dureza) y QL-03.'}
 ]};
OTS.push(o);
}

/* OT-2025-0102 · LISTA PARA ENTREGA (soporte, 316L) */
{
const o={id:'OT-2025-0102',kind:'OT',status:'LISTA',
 client:{name:'HidroSur S.R.L.',code:'CLI-007',contact:'Of. Técnica — D. Aguirre',email:'otecnica@hidrosur.com.ar'},
 part:{name:'Soporte de bomba',kind:'plate',dwg:'SB-0779',rev:'B',material:'AISI 316L',matStd:'EN 10204 · 3.1',heat:'88020',qty:25,due:'2025-06-12'},
 request:{ref:'RFQ-2196',received:'2025-05-20',by:'Área Comercial',channel:'Correo electrónico',
  text:'Reposición anual de 25 soportes de bomba según plano SB-0779 rev.B. Material 316L para servicio con cloruros. Acabado pasivado no requerido.'},
 quote:{number:'COT-2025-0287',date:'2025-05-21',valid:'15 días',status:'APROBADA',
  items:[{d:'Soporte de bomba — AISI 316L, según plano SB-0779 rev.B',q:25,u:61200}],total:1530000,
  approvedBy:'Of. Técnica — D. Aguirre (cliente)',approvedTs:'2025-05-23 12:10'},
 production:{started:'2025-05-27 07:00',releasedBy:'L. Godoy',priority:'NORMAL',machine:'Centro mecanizado Haas VF-4',
  notes:['Separar material 316L de herramientas de acero al carbono para evitar contaminación.']},
 routing:setRouting('plate',[['DONE',38],['DONE',57],['DONE',46],['DONE',22],['DONE',24]]),
 quality:{plan:mkQPlan('plate'),
  records:[{code:'QL-01',result:'OK',inspector:'A. Ríos',notes:'Posiciones y cotas conforme en muestra de 5/25.',ts:'2025-06-07 10:05'},
           {code:'QL-02',result:'OK',inspector:'A. Ríos',notes:'Rugosidad y planitud conformes.',ts:'2025-06-07 10:40'},
           {code:'QL-03',result:'OK',inspector:'A. Ríos',notes:'Visual conforme. Marcado legible en las 25 piezas.',ts:'2025-06-07 11:02'}],ncs:[]},
 docs:[
  mkDoc('SOL','Solicitud de cliente RFQ-2196','sol','note',{ts:'2025-05-20 09:30',stamp:'RECIBIDO',signedBy:'Área Comercial',
    body:['Reposición anual de 25 soportes de bomba en 316L según plano SB-0779 rev.B.']}),
  mkDoc('PLANO','Plano SB-0779 rev.B — Soporte de bomba','sol','plate',{rev:'B',ts:'2025-05-20 09:40'}),
  mkDoc('COTD','Cotización COT-2025-0287','cot','comercial',{subtype:'COT',num:'COT-2025-0287',ts:'2025-05-21 14:20'}),
  mkDoc('CERT','Certificado de materia prima — Colada 88020','ot','cert',{ts:'2025-05-23 16:00'}),
  mkDoc('OC','Orden de compra OC-4421 — HidroSur','ot','comercial',{subtype:'OC',num:'OC-4421',from:'HidroSur S.R.L.',ts:'2025-05-23 12:15'}),
  mkDoc('QC','Certificado interno de conformidad CI-0254','cal','qcert',{num:'CI-0254',ts:'2025-06-07 11:30'})
 ],
 log:[
  {ts:'2025-05-20 09:30',actor:'Comercial — P. Lanza',text:'Solicitud de cliente recibida (RFQ-2196).'},
  {ts:'2025-05-27 07:00',actor:'Planificación — L. Godoy',text:'Orden de Trabajo liberada a producción.'},
  {ts:'2025-06-06 15:40',actor:'Producción — M. Ibarra',text:'Hoja de ruta finalizada — lote enviado a Control de Calidad.'},
  {ts:'2025-06-07 11:02',actor:'Calidad — A. Ríos',text:'Plan de inspección completo: QL-01, QL-02 y QL-03 conformes.'},
  {ts:'2025-06-07 11:30',actor:'Calidad — A. Ríos',text:'Lote de 25 piezas liberado para entrega. Certificado interno CI-0254 emitido.'}
 ]};
OTS.push(o);
}

/* OT-2025-0101 · ENTREGADA (expediente cerrado, demo de reconstrucción histórica) */
{
const o={id:'OT-2025-0101',kind:'OT',status:'ENTREGADA',
 client:{name:'Metalúrgica Delta S.A.',code:'CLI-014',contact:'Ing. M. Ferrer',email:'compras@metaldelta.com.ar'},
 part:{name:'Flanza de acople Ø180',kind:'flange',dwg:'FL-1180',rev:'B',material:'C45',matStd:'EN 10204 · 3.1',heat:'87902',qty:30,due:'2025-05-28'},
 request:{ref:'RFQ-2189',received:'2025-04-22',by:'Área Comercial',channel:'Correo electrónico',
  text:'Fabricación de 30 flanzas de acople Ø180 según plano FL-1180 rev.B para stock de mantenimiento. Material C45. Entrega antes de fin de mayo.'},
 quote:{number:'COT-2025-0267',date:'2025-04-23',valid:'15 días',status:'APROBADA',
  items:[{d:'Flanza de acople Ø180 — C45, según plano FL-1180 rev.B',q:30,u:92000}],total:2760000,
  approvedBy:'Ing. M. Ferrer (cliente)',approvedTs:'2025-04-25 11:05'},
 production:{started:'2025-04-29 07:00',releasedBy:'L. Godoy',priority:'NORMAL',machine:'Torno CNC Gildemeister · Taladro radial',
  notes:['Lote dividido en 2 sublotes de 15 para programación de tornos.']},
 routing:setRouting('flange',[['DONE',48],['DONE',112],['DONE',88],['DONE',0],['DONE',36],['DONE',20],['DONE',28]].map((v,i)=>i===3?['DONE',71]:v)),
 quality:{plan:mkQPlan('flange'),
  records:[{code:'QL-01',result:'OK',inspector:'A. Ríos',notes:'Dimensional conforme. Muestreo 8/30 + primeros y últimos.',ts:'2025-05-23 10:30'},
           {code:'QL-02',result:'OK',inspector:'A. Ríos',notes:'Dureza conforme 42 HRC promedio.',ts:'2025-05-23 11:10'},
           {code:'QL-03',result:'OK',inspector:'A. Ríos',notes:'Visual y acabado conformes.',ts:'2025-05-23 11:35'}],ncs:[]},
 delivery:{remito:'REM-2025-0188',date:'2025-05-27',receivedBy:'Almacén — Metalúrgica Delta'},
 docs:[
  mkDoc('SOL','Solicitud de cliente RFQ-2189','sol','note',{ts:'2025-04-22 08:55',stamp:'RECIBIDO',signedBy:'Área Comercial',
    body:['Solicitud de 30 flanzas Ø180 en C45 según plano FL-1180 rev.B para stock de mantenimiento.']}),
  mkDoc('PLANO','Plano FL-1180 rev.B — Flanza de acople','sol','flange',{rev:'B',ts:'2025-04-22 09:05'}),
  mkDoc('COTD','Cotización COT-2025-0267','cot','comercial',{subtype:'COT',num:'COT-2025-0267',ts:'2025-04-23 15:45'}),
  mkDoc('CERT','Certificado de materia prima — Colada 87902','ot','cert',{ts:'2025-04-25 14:20'}),
  mkDoc('OC','Orden de compra OC-4388 — Metalúrgica Delta','ot','comercial',{subtype:'OC',num:'OC-4388',from:'Metalúrgica Delta S.A.',ts:'2025-04-25 11:10'}),
  mkDoc('QC','Certificado interno de conformidad CI-0241','cal','qcert',{num:'CI-0241',ts:'2025-05-23 12:00'}),
  mkDoc('REM','Remito REM-2025-0188','ent','comercial',{subtype:'REM',num:'REM-2025-0188',receivedBy:'Almacén — Metalúrgica Delta',ts:'2025-05-27 16:30'}),
  mkDoc('FAC','Factura A 0021-00457','ent','comercial',{subtype:'FAC',num:'A 0021-00457',ts:'2025-05-27 16:35'})
 ],
 log:[
  {ts:'2025-04-22 08:55',actor:'Comercial — P. Lanza',text:'Solicitud de cliente recibida (RFQ-2189).'},
  {ts:'2025-04-25 11:05',actor:'Cliente — Ing. M. Ferrer',text:'Cotización aprobada. OC-4388 recibida.'},
  {ts:'2025-04-29 07:00',actor:'Planificación — L. Godoy',text:'Orden de Trabajo liberada a producción.'},
  {ts:'2025-05-21 14:15',actor:'Producción — M. Ibarra',text:'Hoja de ruta finalizada — lote enviado a Control de Calidad.'},
  {ts:'2025-05-23 12:00',actor:'Calidad — A. Ríos',text:'Plan de inspección completo conforme. Lote liberado (CI-0241).'},
  {ts:'2025-05-27 16:30',actor:'Despacho — V. Sanz',text:'Entrega registrada. Remito REM-2025-0188 firmado por el cliente.'},
  {ts:'2025-05-27 16:35',actor:'Administración',text:'Factura A 0021-00457 emitida y vinculada al expediente. Expediente cerrado.'}
 ]};
OTS.push(o);
}

/* COT-2025-0089 · cotización pendiente */
OTS.push({
 id:'COT-2025-0089',kind:'COT',status:'COT_PEND',
 client:{name:'TecnoFer S.A.',code:'CLI-031',contact:'Ing. R. Kaufmann',email:'rkaufmann@tecnofer.com'},
 part:{name:'Carcasa de rodamiento PCM-40',kind:'plate',dwg:'CR-0902',rev:'A',material:'GGG50',matStd:'A determinar',heat:'—',qty:40,due:'2025-07-15'},
 request:{ref:'RFQ-2225',received:'2025-06-09',by:'Área Comercial',channel:'Correo electrónico',
  text:'Consultamos por 40 carcasas de rodamiento PCM-40 según plano CR-0902 para nueva línea de transporte. Material fundición nodular GGG50. Solicitamos cotización con entrega parcial en dos lotes.'},
 quote:{number:'COT-2025-0318',date:'2025-06-10',valid:'15 días',status:'PENDIENTE',
  items:[{d:'Carcasa de rodamiento PCM-40 — GGG50, según plano CR-0902 rev.A',q:40,u:108000}],total:4320000},
 docs:[
  mkDoc('SOL','Solicitud de cliente RFQ-2225','sol','note',{ts:'2025-06-09 09:20',stamp:'RECIBIDO',signedBy:'Área Comercial',
    body:['Consulta por 40 carcasas de rodamiento en GGG50 según plano CR-0902 rev.A. Entrega parcial en dos lotes.']}),
  mkDoc('PLANO','Plano CR-0902 rev.A — Carcasa de rodamiento','sol','plate',{rev:'A',ts:'2025-06-09 09:30'}),
  mkDoc('COTD','Cotización COT-2025-0318','cot','comercial',{subtype:'COT',num:'COT-2025-0318',ts:'2025-06-10 11:45'})
 ],
 log:[
  {ts:'2025-06-09 09:20',actor:'Comercial — P. Lanza',text:'Solicitud de cliente recibida (RFQ-2225).'},
  {ts:'2025-06-10 11:45',actor:'Comercial — P. Lanza',text:'Cotización COT-2025-0318 emitida. Pendiente de aprobación del cliente.'}
 ]});

/* COT-2025-0090 · cotización aprobada, lista para convertir en OT */
OTS.push({
 id:'COT-2025-0090',kind:'COT',status:'COT_APR',
 client:{name:'AgroParts Ltd.',code:'CLI-022',contact:'Rta. Compras — S. Molina',email:'smolina@agroparts.com'},
 part:{name:'Piñón M4 Z=21',kind:'shaft',dwg:'PN-0318',rev:'A',material:'20MnCr5',matStd:'A determinar',heat:'—',qty:8,due:'2025-07-04'},
 request:{ref:'RFQ-2221',received:'2025-06-05',by:'Área Comercial',channel:'Correo electrónico',
  text:'Necesitamos 8 piñones módulo 4 Z=21 según plano PN-0318 para reposición de equipos de cosecha. Material 20MnCr5 con cementado. Urgente: parada de línea.'},
 quote:{number:'COT-2025-0315',date:'2025-06-05',valid:'10 días',status:'APROBADA',
  items:[{d:'Piñón M4 Z=21 — 20MnCr5, cementado, según plano PN-0318 rev.A',q:8,u:246875}],total:1975000,
  approvedBy:'Rta. Compras — S. Molina (cliente)',approvedTs:'2025-06-06 09:12'},
 docs:[
  mkDoc('SOL','Solicitud de cliente RFQ-2221','sol','note',{ts:'2025-06-05 08:10',stamp:'RECIBIDO',signedBy:'Área Comercial',
    body:['Reposición urgente de 8 piñones M4 Z=21 en 20MnCr5 con cementado según plano PN-0318 rev.A.']}),
  mkDoc('PLANO','Plano PN-0318 rev.A — Piñón M4 Z=21','sol','shaft',{rev:'A',ts:'2025-06-05 08:20'}),
  mkDoc('COTD','Cotización COT-2025-0315','cot','comercial',{subtype:'COT',num:'COT-2025-0315',ts:'2025-06-05 13:50'}),
  mkDoc('INF','Conformidad de cliente — COT-2025-0315','cot','note',{ts:'2025-06-06 09:12',stamp:'APROBADO',signedBy:'Área Comercial',
    body:['El cliente AgroParts Ltd. aprueba la cotización COT-2025-0315 por la suma de $ 1.975.000.','La aprobación habilita la generación de la Orden de Trabajo correspondiente.']})
 ],
 log:[
  {ts:'2025-06-05 08:10',actor:'Comercial — P. Lanza',text:'Solicitud de cliente recibida (RFQ-2221) — marcada urgente.'},
  {ts:'2025-06-05 13:50',actor:'Comercial — P. Lanza',text:'Cotización COT-2025-0315 emitida.'},
  {ts:'2025-06-06 09:12',actor:'Cliente — S. Molina',text:'Cotización aprobada por el cliente. Lista para generar Orden de Trabajo.'}
 ]});

