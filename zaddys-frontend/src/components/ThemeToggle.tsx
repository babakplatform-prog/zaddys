"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

type ThemeMode = "system" | "light" | "dark";

export default function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>("system");

  useEffect(() => {
    const saved = window.localStorage.getItem("zaddys_theme") as ThemeMode | null;
    const nextMode = saved === "light" || saved === "dark" || saved === "system" ? saved : "system";
    setMode(nextMode);
    applyTheme(nextMode);
  }, []);

  const cycleTheme = () => {
    const nextMode: ThemeMode = mode === "system" ? "light" : mode === "light" ? "dark" : "system";
    setMode(nextMode);
    window.localStorage.setItem("zaddys_theme", nextMode);
    applyTheme(nextMode);
  };

  const Icon = mode === "light" ? Sun : mode === "dark" ? Moon : Monitor;
  return (
    <button type="button" onClick={cycleTheme} aria-label={`Theme: ${mode}. Change theme`} title={`Theme: ${mode}`} className="theme-toggle">
      <Icon size={17} />
    </button>
  );
}

function applyTheme(mode: ThemeMode) {
  const isDark = mode === "dark" || (mode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", isDark);
  document.documentElement.style.colorScheme = isDark ? "dark" : "light";
}