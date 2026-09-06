import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "QualityTrack — Panel de Trazabilidad y Producción",
  description: "Sistema integral de control de órdenes de trabajo, control de calidad y expediente único.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)] font-sans antialiased selection:bg-[var(--accent)] selection:text-white">
      {/* Background blueprint grid */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(rgba(34,38,45,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(34,38,45,.04) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
        }}
      />
      <div className="relative z-10 flex flex-col min-h-screen">
        {children}
      </div>
    </div>
  );
}
