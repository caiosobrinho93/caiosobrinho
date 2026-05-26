"use client";

import { useEffect, useState } from "react";
import { useSettingsStore } from "@/stores/settingsStore";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { accentColor, density } = useSettingsStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const body = document.body;
    
    // Remove old classes
    body.classList.remove("theme-violet", "theme-cyan", "theme-emerald", "theme-rose", "theme-amber", "theme-limon", "theme-carbon");
    body.classList.remove("density-compact", "density-normal", "density-spacious");
    
    // Add current classes
    body.classList.add(`theme-${accentColor}`);
    body.classList.add(`density-${density}`);
  }, [accentColor, density, mounted]);

  return <>{children}</>;
}
