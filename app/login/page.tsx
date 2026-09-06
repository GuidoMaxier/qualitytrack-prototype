"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { LogIn, AlertCircle, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await authClient.signIn.email({
        email,
        password,
      });

      if (res.error) {
        setError(res.error.message || "Credenciales inválidas");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Error de conexión al servidor");
      setLoading(false);
    }
  };

  const setPresetUser = (presetEmail: string) => {
    setEmail(presetEmail);
    setPassword("Clave/123.");
  };

  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)] flex flex-col justify-center items-center p-4 relative font-sans">
      {/* Background blueprint grid */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(rgba(34,38,45,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(34,38,45,.04) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
        }}
      />

      <div className="relative z-10 w-full max-w-[460px]">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 border border-[var(--ink)] px-3 py-1 font-mono text-[10.5px] font-semibold bg-[var(--card)] hover:bg-[var(--ink)] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> VOLVER A LA LANDING
          </Link>
          <span className="font-mono text-[9px] text-[var(--muted)] uppercase tracking-widest">
            TERMINAL DE ACCESO
          </span>
        </div>

        <div className="border-2 border-[var(--ink)] bg-[var(--card)] shadow-[6px_6px_0_0_rgba(34,38,45,0.12)] p-7 relative">
          <div className="flex items-center gap-3 mb-6 border-b-2 border-[var(--ink)] pb-4">
            <div className="w-10 h-10 bg-[var(--ink)] relative shrink-0">
              <span className="absolute inset-0 grid place-items-center text-[var(--paper)] font-mono font-bold text-[14px]">
                QT
              </span>
              <span className="absolute right-0 bottom-0 w-3 h-3 bg-[var(--accent)]" />
            </div>
            <div>
              <div className="font-extrabold tracking-tight text-[18px]">QUALITYTRACK</div>
              <div className="font-mono text-[8.5px] uppercase tracking-widest text-[var(--muted)] mt-0.5">
                AUTENTICACIÓN DE OPERACIONES
              </div>
            </div>
          </div>

          {error && (
            <div className="border border-[var(--danger)] bg-[var(--danger)]/5 text-[var(--danger)] p-3 mb-5 flex items-center gap-2 text-[12.5px]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-mono text-[9.5px] uppercase tracking-wider text-[var(--muted)] mb-1">
                CORREO ELECTRÓNICO INSTITUCIONAL
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ej. planificacion@qualitytrack.com"
                className="w-full border border-[var(--line2)] bg-[var(--paper)] focus:border-[var(--ink)] outline-none px-3 py-2 text-[13px] font-sans transition-colors"
              />
            </div>

            <div>
              <label className="block font-mono text-[9.5px] uppercase tracking-wider text-[var(--muted)] mb-1">
                CONTRASEÑA
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-[var(--line2)] bg-[var(--paper)] focus:border-[var(--ink)] outline-none px-3 py-2 text-[13px] font-sans transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn btn-acc !py-2.5 flex items-center justify-center gap-2 font-mono text-[11px] font-bold tracking-wider uppercase mt-6"
            >
              <LogIn className="w-3.5 h-3.5" />
              {loading ? "VERIFICANDO CREDENCIALES..." : "INGRESAR AL SISTEMA"}
            </button>
          </form>

          {/* Cuentas de Acceso Rápido para Prueba de Concepto */}
          <div className="mt-8 border-t border-[var(--line)] pt-4">
            <div className="font-mono text-[9px] uppercase tracking-widest text-[var(--muted)] mb-2">
              SELECCIÓN RÁPIDA DE ROL (CLAVE: Clave/123.)
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                ["PLANIFICACIÓN", "planificacion@qualitytrack.com"],
                ["GERENTE", "gerente@qualitytrack.com"],
                ["CALIDAD", "calidad@qualitytrack.com"],
                ["COMERCIAL", "comercial@qualitytrack.com"],
                ["OP. TORNERO", "r.suarez@qualitytrack.com"],
                ["OP. CNC", "m.ibarra@qualitytrack.com"],
              ].map(([role, mail]) => (
                <button
                  key={mail}
                  type="button"
                  onClick={() => setPresetUser(mail)}
                  className="text-left border border-[var(--line2)] hover:border-[var(--ink)] bg-[var(--paper)] hover:bg-[var(--card)] p-2 transition-colors"
                >
                  <div className="font-mono text-[9px] font-bold text-[var(--ink)]">{role}</div>
                  <div className="font-mono text-[8px] text-[var(--muted)] truncate">{mail}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
