"use client";

import { useState } from "react";
import { ScrollProgress } from "@/components/landing/ScrollProgress";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { Marquee } from "@/components/landing/Marquee";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { CycleSection } from "@/components/landing/CycleSection";
import { DashboardPreview } from "@/components/landing/DashboardPreview";
import { SuccessCriteria } from "@/components/landing/SuccessCriteria";
import { FinalCta } from "@/components/landing/FinalCta";
import { Footer } from "@/components/landing/Footer";
import { BootModal } from "@/components/landing/BootModal";

export default function LandingPage() {
  const [isBootOpen, setIsBootOpen] = useState(false);

  return (
    <main className="min-h-screen bg-[var(--paper)] text-[var(--ink)] font-sans relative">
      <ScrollProgress />
      <Header onOpenBoot={() => setIsBootOpen(true)} />
      <Hero onOpenBoot={() => setIsBootOpen(true)} />
      <Marquee />
      <ProblemSection />
      <CycleSection />
      <DashboardPreview onOpenBoot={() => setIsBootOpen(true)} />
      <SuccessCriteria />
      <FinalCta onOpenBoot={() => setIsBootOpen(true)} />
      <Footer />
      <BootModal isOpen={isBootOpen} onClose={() => setIsBootOpen(false)} />
    </main>
  );
}
