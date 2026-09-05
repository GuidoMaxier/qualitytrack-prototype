"use client";

import { useEffect, useState } from "react";

export function ScrollProgress() {
  const [width, setWidth] = useState("0%");

  useEffect(() => {
    const handleScroll = () => {
      const h = document.documentElement;
      const scrollPercent = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
      setWidth(`${Math.min(100, Math.max(0, scrollPercent))}%`);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      id="progress"
      className="fixed top-0 left-0 h-[3px] bg-[var(--accent)] z-[80] transition-[width] duration-75 ease-out"
      style={{ width }}
    />
  );
}
