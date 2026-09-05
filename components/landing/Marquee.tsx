export function Marquee() {
  const items = [
    "PLANOS DE INGENIERÍA",
    "ESPECIFICACIONES TÉCNICAS",
    "CERTIFICADOS DE MATERIA PRIMA 3.1",
    "ÓRDENES DE COMPRA",
    "COTIZACIONES",
    "HOJAS DE RUTA",
    "REGISTROS DE PRODUCCIÓN",
    "CONTROLES DE CALIDAD",
    "NO CONFORMIDADES",
    "REMITOS",
    "FACTURAS",
    "BITÁCORA DE EXPEDIENTE",
  ];

  return (
    <div className="mq relative z-10">
      <div className="mq-track">
        {items.concat(items).map((item, idx) => (
          <div key={idx} className="mq-item">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
