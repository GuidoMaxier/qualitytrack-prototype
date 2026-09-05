"use client";

import Link from "next/link";
import { LogIn } from "lucide-react";

interface HeaderProps {
  onOpenBoot?: () => void;
}

export function Header({ onOpenBoot }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-[var(--card)]/95 backdrop-blur border-b-2 border-[var(--ink)]">
      <div className="max-w-[1360px] mx-auto px-5 lg:px-8 h-[64px] flex items-center gap-6">
        <Link href="#inicio" className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 bg-[var(--ink)] relative shrink-0">
            <span className="absolute inset-0 grid place-items-center text-[var(--paper)] font-mono font-bold text-[14px]">
              QT
            </span>
            <span className="absolute right-0 bottom-0 w-3 h-3 bg-[var(--accent)]" />
          </div>
          <div className="leading-none">
            <div className="font-extrabold xdisp tracking-tight text-[17px]">QUALITYTRACK</div>
            <div className="kicker mt-1" style={{ fontSize: "8px" }}>
              MECANIZADO · TRAZABILIDAD
            </div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-7 ml-4">
          <Link
            href="#problema"
            className="font-mono text-[10.5px] font-semibold tracking-[.18em] text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
          >
            EL PROBLEMA
          </Link>
          <Link
            href="#ciclo"
            className="font-mono text-[10.5px] font-semibold tracking-[.18em] text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
          >
            EL CICLO
          </Link>
          <Link
            href="#sistema"
            className="font-mono text-[10.5px] font-semibold tracking-[.18em] text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
          >
            EL SISTEMA
          </Link>
        </nav>

        <div className="flex-1" />

        <span className="hidden lg:block font-mono text-[10px] text-[var(--muted)] tracking-[.2em]">
          PROTOTYPE v1.0
        </span>

        {onOpenBoot ? (
          <button onClick={onOpenBoot} className="btn btn-acc !py-2.5">
            <LogIn className="w-3.5 h-3.5" />
            ENTRAR AL DASHBOARD
          </button>
        ) : (
          <Link href="/dashboard" className="btn btn-acc !py-2.5">
            <LogIn className="w-3.5 h-3.5" />
            ENTRAR AL DASHBOARD
          </Link>
        )}
      </div>
    </header>
  );
}
