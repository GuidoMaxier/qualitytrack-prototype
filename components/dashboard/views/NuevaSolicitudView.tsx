"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, FilePlus2, Loader2, AlertCircle, Building2, Paperclip, Search, X } from "lucide-react";

const MATERIALES = ["AISI 4140", "42CrMo4", "AISI 316L", "C45", "20MnCr5", "GGG50", "7075-T6"];
const TIPOS: Array<[string, string]> = [
  ["flange", "Pieza de revolución — flanza / cubo"],
  ["shaft", "Eje / piñón"],
  ["plate", "Soporte / pieza de chapa"],
];

interface ClienteOpt {
  id: string;
  codigo: string | null;
  razon_social: string;
  contacto_nombre: string;
}

const fld =
  "w-full border border-[var(--line2)] bg-[var(--paper)] focus:border-[var(--ink)] outline-none px-3 py-2 text-[13px] transition-colors";
const lbl = "block font-mono text-[9.5px] uppercase tracking-wider text-[var(--muted)] mb-1";
const cellhead = "font-mono text-[9.5px] uppercase tracking-widest text-[var(--muted)]";

const MAX_RESULTADOS = 10;

export default function NewSolicitudForm({
  onCreated,
  onCancel,
}: {
  onCreated: () => void;
  onCancel: () => void;
}) {
  const [clientes, setClientes] = useState<ClienteOpt[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Campos del formulario
  const [cliente, setCliente] = useState<ClienteOpt | null>(null);
  const [contacto, setContacto] = useState("");
  const [nombre_pieza, setNombrePieza] = useState("");
  const [tipo_pieza, setTipoPieza] = useState("flange");
  const [codigo_plano, setCodigoPlano] = useState("");
  const [revision_plano, setRevisionPlano] = useState("A");
  const [material, setMaterial] = useState(MATERIALES[0]);
  const [cantidad, setCantidad] = useState(10);
  const [fecha_entrega, setFechaEntrega] = useState(() => {
    // Fecha de entrega sugerida: +21 días
    const d = new Date();
    d.setDate(d.getDate() + 21);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  });
  const [precio_unitario, setPrecioUnitario] = useState(120000);
  const [requerimiento, setRequerimiento] = useState("");
  // Adjuntar plano real (lo sube nuestro personal — el archivo que envió el cliente)
  const [planoFile, setPlanoFile] = useState<File | null>(null);

  // Buscador de cliente
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Modal alta de cliente
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSaving, setModalSaving] = useState(false);
  const [modalError, setModalError] = useState("");
  const [razon_social, setRazonSocial] = useState("");
  const [cli_contacto, setCliContacto] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [direccion, setDireccion] = useState("");

  useEffect(() => {
    fetch("/api/clientes")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && Array.isArray(d.clientes)) setClientes(d.clientes);
      })
      .catch(() => setError("No se pudieron cargar los clientes."));
  }, []);

  // Cerrar el desplegable al hacer clic afuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const resultados = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtrados = q
      ? clientes.filter(
          (c) => c.razon_social.toLowerCase().includes(q) || (c.codigo ?? "").toLowerCase().includes(q)
        )
      : clientes;
    return filtrados.slice(0, MAX_RESULTADOS);
  }, [clientes, query]);

  const seleccionar = (c: ClienteOpt) => {
    setCliente(c);
    setQuery(c.razon_social);
    setOpen(false);
    setContacto((prev) => (prev.trim() ? prev : c.contacto_nombre));
  };

  const limpiarCliente = () => {
    setCliente(null);
    setQuery("");
    setOpen(true);
  };

  // Alta de cliente desde el modal (lo hace nuestro personal administrativo)
  const crearCliente = async () => {
    setModalError("");
    if (!razon_social.trim()) {
      setModalError("Indicá la razón social del cliente.");
      return;
    }
    if (!cli_contacto.trim()) {
      setModalError("Indicá el nombre del contacto.");
      return;
    }
    setModalSaving(true);
    try {
      const r = await fetch("/api/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ razon_social, contacto_nombre: cli_contacto, telefono, direccion, email }),
      });
      const d = await r.json();
      if (!d.success || !d.cliente?.id) {
        setModalError(d.error || "No se pudo crear el cliente.");
        setModalSaving(false);
        return;
      }
      const nuevo: ClienteOpt = d.cliente;
      setClientes((prev) => [nuevo, ...prev.filter((c) => c.id !== nuevo.id)]);
      setCliente(nuevo);
      setQuery(nuevo.razon_social);
      setContacto(nuevo.contacto_nombre);
      // Limpia el modal para la próxima vez
      setRazonSocial("");
      setCliContacto("");
      setTelefono("");
      setEmail("");
      setDireccion("");
      setModalOpen(false);
      setModalSaving(false);
    } catch {
      setModalError("Error de conexión al servidor");
      setModalSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!cliente) {
      setError("Elegí el cliente — buscá por nombre o crealo con AGREGAR CLIENTE.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/solicitudes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cliente_id: cliente.id,
          contacto,
          nombre_pieza,
          tipo_pieza,
          codigo_plano,
          revision_plano,
          material,
          cantidad,
          fecha_esperada_entrega: fecha_entrega,
          precio_unitario,
          requerimiento,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "No se pudo registrar la solicitud.");
        setSaving(false);
        return;
      }

      // Adjuntar plano del cliente (opcional, lo carga nuestro personal)
      if (planoFile) {
        const fd = new FormData();
        const tituloPlano = codigo_plano.trim()
          ? `Plano ${codigo_plano.trim().toUpperCase()} rev.${(revision_plano.trim() || "A").toUpperCase()} — ${nombre_pieza}`
          : `Plano ${planoFile.name} — ${nombre_pieza}`;
        if (data.plano_documento_id) fd.set("doc_id", data.plano_documento_id);
        else fd.set("solicitud_id", data.solicitud_id);
        fd.set("tipo", "PLANO");
        fd.set("etapa", "sol");
        fd.set("titulo", tituloPlano);
        fd.set("file", planoFile);
        const fu = await fetch("/api/documentos", { method: "POST", body: fd });
        const du = await fu.json();
        if (!du.success) {
          setError(du.error || "La solicitud se creó, pero no se pudo adjuntar el plano.");
          setSaving(false);
          return;
        }
      }

      onCreated();
    } catch {
      setError("Error de conexión al servidor");
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabecera: acciones a la misma altura */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="font-mono text-[9.5px] uppercase tracking-widest text-[var(--muted)] mb-1">
            CICLO: SOLICITUD → COTIZACIÓN → OT → PRODUCCIÓN → CALIDAD → ENTREGA
          </div>
          <h1 className="text-[28px] font-extrabold text-[var(--ink)] tracking-tight">Nueva solicitud de cliente</h1>
          <p className="font-mono text-[10.5px] text-[var(--muted)] mt-1">
            El cliente pidió una pieza (plano + especificaciones): cargamos la solicitud y su cotización pendiente. La OT se habilita al aprobar el cliente.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setModalError("");
              setModalOpen(true);
            }}
            className="inline-flex items-center gap-2 bg-[var(--accent)] border border-[var(--accent)] text-white px-3 py-1.5 font-mono text-[10.5px] font-semibold hover:bg-[#A83A0B] transition-colors"
          >
            <Building2 className="w-3.5 h-3.5" /> AGREGAR CLIENTE
          </button>
          <button
            onClick={onCancel}
            className="inline-flex items-center gap-2 border border-[var(--ink)] px-3 py-1.5 font-mono text-[10.5px] font-semibold bg-[var(--card)] hover:bg-[var(--ink)] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> VOLVER A TRABAJOS
          </button>
        </div>
      </div>

      {error && (
        <div className="border border-[var(--danger)] bg-[var(--danger)]/5 text-[var(--danger)] p-3 flex items-center gap-2 text-[12.5px]">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="border-2 border-[var(--ink)] bg-[var(--card)] shadow-[6px_6px_0_0_rgba(34,38,45,0.12)] p-6 grid md:grid-cols-2 gap-5">
        {/* Buscador de cliente */}
        <div className="block">
          <span className={lbl}>CLIENTE *</span>
          {cliente ? (
            <div className="border-2 border-[var(--ink)] bg-[var(--paper)] px-3 py-2 flex items-center gap-3">
              <Building2 className="w-4 h-4 text-[var(--accent)] shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-bold text-[var(--ink)] truncate">{cliente.razon_social}</div>
                <div className="font-mono text-[10px] text-[var(--muted)]">{cliente.codigo} · {cliente.contacto_nombre}</div>
              </div>
              <button type="button" onClick={limpiarCliente} className="font-mono text-[9.5px] uppercase tracking-wider text-[var(--muted)] hover:text-[var(--ink)]">
                CAMBIAR
              </button>
            </div>
          ) : (
            <div ref={searchRef} className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setOpen(true);
                }}
                onFocus={() => setOpen(true)}
                placeholder="Buscar cliente por nombre o código…"
                className={`${fld} pl-9`}
                autoComplete="off"
              />
              {open && (
                <div className="absolute z-30 left-0 right-0 top-full mt-1 border-2 border-[var(--ink)] bg-[var(--card)] shadow-[6px_6px_0_0_rgba(34,38,45,0.12)] max-h-[320px] overflow-y-auto">
                  <div className="px-3 py-1.5 bg-[var(--ink)] text-[var(--paper)] font-mono text-[9px] tracking-widest uppercase flex items-center justify-between">
                    <span>RESULTADOS · {resultados.length}</span>
                    {clientes.length > MAX_RESULTADOS && <span>PRIMEROS {MAX_RESULTADOS} — SEGUÍ ESCRIBIENDO PARA FILTRAR</span>}
                  </div>
                  {resultados.length === 0 && (
                    <div className="px-3 py-3 text-[12px] text-[var(--muted)]">
                      Sin resultados. Si es un cliente nuevo, usá el botón <b>AGREGAR CLIENTE</b> (arriba a la derecha).
                    </div>
                  )}
                  {resultados.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onMouseDown={() => seleccionar(c)}
                      className="w-full text-left px-3 py-2.5 border-b border-[var(--line)]/60 last:border-0 hover:bg-[var(--paper)] transition-colors flex items-center gap-3"
                    >
                      <span className="font-mono text-[9.5px] font-bold text-[var(--muted)] border border-[var(--line2)] px-1.5 py-0.5 w-[68px] text-center shrink-0">
                        {c.codigo || "CLI"}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[12.5px] font-semibold truncate">{c.razon_social}</span>
                        <span className="block font-mono text-[9.5px] text-[var(--muted)] truncate">{c.contacto_nombre}</span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <label className="block">
          <span className={lbl}>CONTACTO</span>
          <input value={contacto} onChange={(e) => setContacto(e.target.value)} placeholder="Nombre y área del contacto" className={fld} />
        </label>

        <label className="block">
          <span className={lbl}>DENOMINACIÓN DE LA PIEZA *</span>
          <input value={nombre_pieza} onChange={(e) => setNombrePieza(e.target.value)} placeholder="Ej.: Flanza de acople Ø150" className={fld} />
        </label>

        <label className="block">
          <span className={lbl}>TIPO DE PIEZA (DEFINE HOJA DE RUTA)</span>
          <select value={tipo_pieza} onChange={(e) => setTipoPieza(e.target.value)} className={fld}>
            {TIPOS.map(([v, t]) => (
              <option key={v} value={v}>
                {t}
              </option>
            ))}
          </select>
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className={lbl}>N° PLANO (DEL CLIENTE)</span>
            <input value={codigo_plano} onChange={(e) => setCodigoPlano(e.target.value)} placeholder="FL-1240" className={`${fld} font-mono`} />
          </label>
          <label className="block">
            <span className={lbl}>REVISIÓN</span>
            <input value={revision_plano} onChange={(e) => setRevisionPlano(e.target.value)} className={`${fld} font-mono`} />
          </label>
        </div>

        <label className="block">
          <span className={lbl}>MATERIAL (ESPECIFICA EL CLIENTE)</span>
          <select value={material} onChange={(e) => setMaterial(e.target.value)} className={`${fld} font-mono`}>
            {MATERIALES.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </label>

        <div className="grid grid-cols-3 gap-4">
          <label className="block">
            <span className={lbl}>CANTIDAD *</span>
            <input type="number" min={1} value={cantidad} onChange={(e) => setCantidad(Number(e.target.value))} className={`${fld} font-mono`} />
          </label>
          <label className="block">
            <span className={lbl}>ENTREGA *</span>
            <input type="date" value={fecha_entrega} onChange={(e) => setFechaEntrega(e.target.value)} className={`${fld} font-mono`} />
          </label>
          <label className="block">
            <span className={lbl}>P. UNIT. $</span>
            <input type="number" min={0} value={precio_unitario} onChange={(e) => setPrecioUnitario(Number(e.target.value))} className={`${fld} font-mono`} />
          </label>
        </div>

        <label className="block md:col-span-2">
          <span className={lbl}>REQUERIMIENTO DEL CLIENTE *</span>
          <textarea
            rows={3}
            value={requerimiento}
            onChange={(e) => setRequerimiento(e.target.value)}
            placeholder="Descripción del trabajo, especificaciones, requisitos de certificación…"
            className={`${fld} resize-y`}
          />
        </label>

        <label className="block md:col-span-2">
          <span className={lbl}>
            PLANO DEL CLIENTE (OPCIONAL) — ADJUNTÁ EL ARCHIVO QUE ENVIÓ · PDF / DWG / IMAGEN · MÁX 4 MB
          </span>
          <div className="flex items-center gap-3">
            <input
              type="file"
              accept=".pdf,.dwg,.dxf,.png,.jpg,.jpeg,image/*,application/pdf"
              onChange={(e) => setPlanoFile(e.target.files?.[0] ?? null)}
              className="text-[12px] file:mr-3 file:border file:border-[var(--line2)] file:bg-[var(--paper)] file:px-3 file:py-1.5 file:font-mono file:text-[10px] file:uppercase file:cursor-pointer file:hover:border-[var(--ink)]"
            />
            {planoFile && (
              <button type="button" onClick={() => setPlanoFile(null)} className="font-mono text-[10px] uppercase tracking-wider text-[var(--muted)] hover:text-[var(--danger)]">
                QUITAR
              </button>
            )}
          </div>
          {planoFile && (
            <span className="mt-1.5 inline-flex items-center gap-1.5 font-mono text-[10.5px] text-[var(--ink)]">
              <Paperclip className="w-3.5 h-3.5 text-[var(--accent)]" /> {planoFile.name} · {(planoFile.size / 1024).toFixed(0)} KB
            </span>
          )}
        </label>

        <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--line)] pt-5">
          <div className={cellhead}>
            MONTO ESTIMADO: <span className="text-[12px] text-[var(--ink)]">$ {(cantidad * precio_unitario).toLocaleString("es-AR")}</span>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 bg-[var(--accent)] border border-[var(--accent)] text-white px-4 py-2.5 font-mono text-[10.5px] font-bold tracking-wider uppercase hover:bg-[#A83A0B] transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FilePlus2 className="w-3.5 h-3.5" />} REGISTRAR SOLICITUD Y COTIZACIÓN
          </button>
        </div>
      </form>

      {/* Modal: alta de cliente (personal administrativo) */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-[var(--ink)]/50 backdrop-blur-[2px]"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
        >
          <div className="sheet w-full max-w-[520px] border-2 border-[var(--ink)] bg-[var(--card)] shadow-[6px_6px_0_0_rgba(34,38,45,0.12)]">
            <div className="flex items-center justify-between px-5 py-3.5 border-b-2 border-[var(--ink)] bg-[var(--paper)]">
              <span className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest text-[var(--ink)]">
                <Building2 className="w-4 h-4 text-[var(--accent)]" /> NUEVO CLIENTE
              </span>
              <button onClick={() => setModalOpen(false)} className="text-[var(--muted)] hover:text-[var(--ink)]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 grid gap-4">
              {modalError && (
                <div className="border border-[var(--danger)] bg-[var(--danger)]/5 text-[var(--danger)] p-2.5 text-[12px] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {modalError}
                </div>
              )}
              <label className="block">
                <span className={lbl}>RAZÓN SOCIAL *</span>
                <input value={razon_social} onChange={(e) => setRazonSocial(e.target.value)} placeholder="Ej.: Metalúrgica Sur S.R.L." className={fld} />
              </label>
              <label className="block">
                <span className={lbl}>CONTACTO *</span>
                <input value={cli_contacto} onChange={(e) => setCliContacto(e.target.value)} placeholder="Nombre y área del contacto" className={fld} />
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className={lbl}>TELÉFONO</span>
                  <input value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="+54 11 …" className={fld} />
                </label>
                <label className="block">
                  <span className={lbl}>EMAIL</span>
                  <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="compras@…" className={fld} />
                </label>
              </div>
              <label className="block">
                <span className={lbl}>DIRECCIÓN</span>
                <input value={direccion} onChange={(e) => setDireccion(e.target.value)} placeholder="Calle, ciudad…" className={fld} />
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="border border-[var(--line2)] px-3 py-2 font-mono text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)] hover:border-[var(--ink)] hover:text-[var(--ink)] transition-colors">
                  CANCELAR
                </button>
                <button
                  type="button"
                  onClick={crearCliente}
                  disabled={modalSaving}
                  className="inline-flex items-center gap-2 bg-[var(--accent)] border border-[var(--accent)] text-white px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-wider hover:bg-[#A83A0B] transition-colors disabled:opacity-50"
                >
                  {modalSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Building2 className="w-3.5 h-3.5" />} CREAR CLIENTE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
