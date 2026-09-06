"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, FilePlus2, LayoutGrid, LogOut, ScanSearch, ShieldCheck } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useExpedientes } from "../hooks/useExpedientes";
import TableroView from "./TableroView";
import NuevaSolicitudView from "./NuevaSolicitudView";
import ExpedienteView from "./ExpedienteView";
import type { ViewId } from "../lib/tipos";

const ROL_LABEL: Record<string, string> = {
  GERENTE: "GERENTE",
  JEFE_PRODUCCION: "PLANIFICACIÓN",
  VENDEDOR: "COMERCIAL",
  CALIDAD: "CALIDAD",
  OPERARIO: "OPERARIO",
};

const NAV: Array<{ v: ViewId; icon: typeof LayoutGrid; label: string; hint?: string }> = [
  { v: "board", icon: LayoutGrid, label: "TRABAJOS" },
  { v: "new", icon: FilePlus2, label: "NUEVA SOLICITUD" },
  { v: "trace", icon: ScanSearch, label: "TRAZABILIDAD", hint: "Disponible en M6-P6" },
];

export default function DashboardApp() {
  const router = useRouter();
  const { data: sesion } = authClient.useSession();
  const exp = useExpedientes();

  const [view, setView] = useState<ViewId>("board");
  const [fileId, setFileId] = useState<string | null>(null);
  const [filter, setFilter] = useState("TODOS");
  const [notice, setNotice] = useState<{ tipo: "ok" | "err"; texto: string } | null>(null);

  const otAbierto = view === "file" && fileId ? exp.ordenes.find((o) => o.id === fileId) ?? null : null;

  const avisar = (tipo: "ok" | "err", texto: string) => {
    setNotice({ tipo, texto });
    window.setTimeout(() => setNotice(null), 6000);
  };

  const irA = (v: ViewId, hint?: string) => {
    if (hint) {
      avisar("err", hint);
      return;
    }
    setView(v);
  };

  const accionCOT = async (id: string, action: "aprobar" | "generar-ot") => {
    const r = await exp.accionCotizacion(id, action);
    avisar(r.ok ? "ok" : "err", r.ok && r.numero ? `${r.msg} ${r.numero}` : r.msg || "Error");
    if (r.ok && action === "generar-ot") setFilter("TODOS");
  };

  const cerrarSesion = async () => {
    await authClient.signOut();
    router.replace("/login");
  };

  const user = sesion?.user;
  const rolLabel = user ? ROL_LABEL[(user as { rol?: string }).rol ?? ""] ?? "OPERARIO" : "";

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header sticky industrial */}
      <header className="sticky top-0 z-40 bg-[var(--card)]/95 backdrop-blur border-b-2 border-[var(--ink)]">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8 h-[64px] flex items-center gap-4 lg:gap-6">
          <button onClick={() => setView("board")} className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 bg-[var(--ink)] relative shrink-0">
              <span className="absolute inset-0 grid place-items-center text-[var(--paper)] font-mono font-bold text-[14px]">QT</span>
              <span className="absolute right-0 bottom-0 w-3 h-3 bg-[var(--accent)]"></span>
            </div>
            <div className="text-left leading-none hidden sm:block">
              <div className="font-extrabold tracking-tight text-[17px]">QUALITYTRACK</div>
              <div className="font-mono text-[8.5px] uppercase tracking-widest text-[var(--muted)] mt-1">TRAZABILIDAD · MECANIZADO</div>
            </div>
          </button>

          <nav className="flex items-stretch gap-1 ml-4 h-[64px]">
            {NAV.map(({ v, icon: Icon, label, hint }) => (
              <button
                key={v}
                onClick={() => irA(v, hint)}
                className={`flex items-center gap-2 px-4 border-b-[3px] font-mono text-[11px] font-bold tracking-wider uppercase transition-colors ${
                  view === v ? "border-[var(--accent)] text-[var(--ink)]" : "border-transparent text-[var(--muted)] hover:text-[var(--ink)]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" /> {label}
              </button>
            ))}
          </nav>

          <div className="flex-1"></div>

          {user && (
            <div className="hidden lg:flex items-center gap-3 border-l border-[var(--line)] pl-5">
              <div className="w-8 h-8 bg-[var(--ink)] text-[var(--paper)] grid place-items-center font-mono text-[12px] font-bold">
                {user.name?.slice(0, 1).toUpperCase() ?? "?"}
              </div>
              <div className="text-right leading-tight">
                <div className="text-[12.5px] font-bold leading-tight">{user.name}</div>
                <div className="font-mono text-[8.5px] text-[var(--muted)] tracking-widest mt-0.5">{rolLabel}</div>
              </div>
              <button
                onClick={cerrarSesion}
                title="Cerrar sesión"
                className="ml-1 p-2 text-[var(--muted)] hover:text-[var(--danger)] transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Contenido */}
      <main className="max-w-[1440px] w-full mx-auto px-4 lg:px-8 py-7 flex-1">
        {notice && (
          <div
            className={`mb-5 flex items-center justify-between gap-3 border-2 px-4 py-2.5 text-[12.5px] font-semibold ${
              notice.tipo === "ok" ? "border-[var(--ok)] text-[var(--ok)] bg-[var(--card)]" : "border-[var(--danger)] text-[var(--danger)] bg-[var(--danger)]/5"
            }`}
          >
            <span className="flex items-center gap-2">
              {notice.tipo === "err" && <AlertCircle className="w-4 h-4 shrink-0" />}
              {notice.tipo === "ok" && <ShieldCheck className="w-4 h-4 shrink-0" />}
              {notice.texto}
            </span>
            <button onClick={() => setNotice(null)} className="font-mono text-[10px] uppercase tracking-wider text-[var(--muted)] hover:text-[var(--ink)]">
              CERRAR
            </button>
          </div>
        )}

        {exp.error && (
          <div className="mb-5 border border-[var(--danger)] bg-[var(--danger)]/5 text-[var(--danger)] p-3 flex items-center gap-2 text-[12.5px]">
            <AlertCircle className="w-4 h-4 shrink-0" /> {exp.error}
          </div>
        )}

        {view === "board" && (
          <TableroView
            stats={exp.stats}
            filas={exp.filas}
            loading={exp.loading}
            busyId={exp.busyId}
            filter={filter}
            onFilterChange={setFilter}
            onAccionCOT={accionCOT}
            onAbrirOT={(id) => {
              setFileId(id);
              setView("file");
            }}
            onNuevaSolicitud={() => setView("new")}
            onReload={() => exp.reload()}
          />
        )}

        {view === "file" &&
          (otAbierto ? (
            <ExpedienteView
              ot={otAbierto}
              onBack={() => {
                setView("board");
                setFileId(null);
              }}
            />
          ) : (
            <div className="border-2 border-dashed border-[var(--line2)] bg-[var(--card)] p-10 text-center max-w-[480px] mx-auto mt-10">
              <p className="text-[12.5px] text-[var(--muted)]">No se encontró el expediente solicitado. Volvé al tablero y recargá.</p>
              <button
                onClick={() => {
                  setView("board");
                  setFileId(null);
                }}
                className="mt-4 border border-[var(--ink)] px-4 py-2 font-mono text-[10.5px] font-bold uppercase tracking-wider hover:bg-[var(--ink)] hover:text-white transition-colors"
              >
                VOLVER A TRABAJOS
              </button>
            </div>
          ))}

        {view === "new" && (
          <NuevaSolicitudView
            onCreated={() => {
              avisar("ok", "Solicitud registrada — la cotización quedó pendiente de aprobación.");
              setFilter("COT");
              setView("board");
              exp.reload();
            }}
            onCancel={() => setView("board")}
          />
        )}

        {view === "trace" && (
          <div className="border-2 border-dashed border-[var(--line2)] bg-[var(--card)] p-10 text-center max-w-[640px] mx-auto mt-10">
            <ScanSearch className="w-8 h-8 mx-auto text-[var(--muted)]" />
            <div className="font-mono text-[11px] font-bold uppercase tracking-widest text-[var(--ink)] mt-4">VISTA TRAZABILIDAD</div>
            <p className="text-[12.5px] text-[var(--muted)] mt-2 leading-relaxed">
              La cadena de custodia por eslabones se portará en M6-P6. Los datos ya están en la base.
            </p>
            <button
              onClick={() => setView("board")}
              className="mt-5 border border-[var(--ink)] px-4 py-2 font-mono text-[10.5px] font-bold uppercase tracking-wider hover:bg-[var(--ink)] hover:text-white transition-colors"
            >
              VOLVER A TRABAJOS
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
