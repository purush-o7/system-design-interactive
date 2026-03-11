"use client";

import { useKeyboardNav } from "@/hooks/use-keyboard-nav";

export function KeyboardProvider({ children }: { children: React.ReactNode }) {
  useKeyboardNav();
  return <>{children}</>;
}
