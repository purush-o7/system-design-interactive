"use client";

import { useTheme } from "next-themes";
import { useMemo } from "react";

export interface ThemeColors {
  foreground: string;
  mutedForeground: string;
  background: string;
  muted: string;
  border: string;
  blue: string;
  emerald: string;
  red: string;
  amber: string;
  violet: string;
  orange: string;
  cyan: string;
  pink: string;
  teal: string;
  rose: string;
}

const darkColors: ThemeColors = {
  foreground: "#f8fafc",
  mutedForeground: "#94a3b8",
  background: "#0f172a",
  muted: "#1e293b",
  border: "#334155",
  blue: "#60a5fa",
  emerald: "#34d399",
  red: "#f87171",
  amber: "#fbbf24",
  violet: "#a78bfa",
  orange: "#fb923c",
  cyan: "#22d3ee",
  pink: "#f472b6",
  teal: "#2dd4bf",
  rose: "#fb7185",
};

const lightColors: ThemeColors = {
  foreground: "#0f172a",
  mutedForeground: "#64748b",
  background: "#ffffff",
  muted: "#f1f5f9",
  border: "#e2e8f0",
  blue: "#3b82f6",
  emerald: "#10b981",
  red: "#ef4444",
  amber: "#f59e0b",
  violet: "#8b5cf6",
  orange: "#f97316",
  cyan: "#06b6d4",
  pink: "#ec4899",
  teal: "#14b8a6",
  rose: "#f43f5e",
};

export function useThemeColors(): ThemeColors {
  const { resolvedTheme } = useTheme();
  return useMemo(
    () => (resolvedTheme === "dark" ? darkColors : lightColors),
    [resolvedTheme]
  );
}
