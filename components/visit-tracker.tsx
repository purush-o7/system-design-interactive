"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const STORAGE_KEY = "visited-topics";

export function VisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname === "/") return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const visited: string[] = stored ? JSON.parse(stored) : [];
      if (!visited.includes(pathname)) {
        visited.push(pathname);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(visited));
      }
    } catch {
      // ignore localStorage errors
    }
  }, [pathname]);

  return null;
}

export function getVisitedTopics(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}
