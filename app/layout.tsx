import type { Metadata } from "next";
import { Archivo, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "QualityTrack — Trazabilidad para el mecanizado industrial",
  description:
    "QualityTrack centraliza cotizaciones, órdenes de trabajo, planos, certificados de materia prima, hojas de ruta y controles de calidad en una sola cadena trazable.",
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%2322262D'/%3E%3Ctext x='16' y='22' font-family='monospace' font-weight='bold' font-size='14' fill='%23FBFAF6' text-anchor='middle'%3EQT%3C/text%3E%3Crect x='23' y='23' width='9' height='9' fill='%23D9480F'/%3E%3C/svg%3E",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${archivo.variable} ${jetbrainsMono.variable} scroll-smooth antialiased`}
    >
      <body className="min-h-screen bg-[var(--paper)] text-[var(--ink)] font-sans relative overflow-x-hidden selection:bg-[var(--accent)] selection:text-white">
        {children}
      </body>
    </html>
  );
}
