"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Info, ArrowRight, X } from "lucide-react";

interface BootModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BootModal({ isOpen, onClose }: BootModalProps) {
  if (!isOpen) return null;

  return <BootModalContent onClose={onClose} />;
}

function BootModalContent({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [lines, setLines] = useState<string[]>([]);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    const bootSequence = [
      "> QUALITYTRACK v1.0 — MÓDULO DE PRODUCCIÓN",
      "> VERIFICANDO SESIÓN ............... OK",
      "> MONTANDO EXPEDIENTES ............. 6 ACTIVOS",
      "> SINCRONIZANDO BITÁCORA ........... OK",
      "> PERFIL: PLANIFICACIÓN — L. GODOY",
    ];

    let current = 0;
    const interval = setInterval(() => {
      if (current < bootSequence.length) {
        const nextLine = bootSequence[current];
        setLines((prev) => [...prev, nextLine]);
        current++;
      } else {
        clearInterval(interval);
        setIsDone(true);
      }
    }, 280);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[90] bg-[var(--ink)] flex items-center justify-center p-5">
      <div className="w-full max-w-[620px] relative">
        <button
          onClick={onClose}
          className="absolute -top-2 right-0 text-[var(--paper)]/60 hover:text-white p-2"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 bg-[var(--paper)] relative">
            <span className="absolute inset-0 grid place-items-center text-[var(--ink)] font-mono font-bold text-[13px]">
              QT
            </span>
            <span className="absolute right-0 bottom-0 w-3 h-3 bg-[var(--accent)]" />
          </div>
          <span className="font-mono text-[11px] text-[var(--paper)]/70 tracking-[.24em]">
            CONSOLA DE OPERACIONES
          </span>
        </div>

        <div className="font-mono text-[12.5px] leading-[2] text-[var(--paper)]/85 min-h-[170px] bg-black/30 p-4 border border-[var(--paper)]/20">
          {lines.map((l, i) => (
            <div key={i} className="boot-line">
              {l.includes("OK") ? (
                <>
                  {l.split("OK")[0]}
                  <span className="text-[var(--accent)] font-bold">OK</span>
                </>
              ) : l.includes("6 ACTIVOS") ? (
                <>
                  {l.split("6 ACTIVOS")[0]}
                  <span className="text-[var(--accent)] font-bold">6 ACTIVOS</span>
                </>
              ) : (
                l
              )}
            </div>
          ))}
          {!isDone && <span className="cursor-blk" />}
        </div>

        {isDone && (
          <div
            id="bootPanel"
            className="border-[1.5px] border-[var(--paper)]/30 bg-[var(--paper)]/[.04] p-5 mt-4"
          >
            <div className="flex items-start gap-3">
              <Info className="w-4 h-4 text-[var(--accent)] mt-0.5 shrink-0" />
              <div>
                <div className="text-[13.5px] font-bold text-white">
                  Consola de acceso al prototipo QualityTrack
                </div>
                <p className="text-[12.5px] text-[var(--paper)]/70 leading-relaxed mt-1">
                  Accede al tablero interactivo de Órdenes de Trabajo para consultar los
                  expedientes técnicos de mecanizado, hojas de ruta y trazabilidad de piezas.
                </p>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => router.push("/dashboard")}
                    className="btn btn-acc !py-2.5 flex items-center gap-2"
                  >
                    INGRESAR AL DASHBOARD
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button onClick={onClose} className="btn !py-2.5">
                    VOLVER A LA LANDING
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
