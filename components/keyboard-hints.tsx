"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

const STORAGE_KEY = "keyboard-hints-dismissed";

export function KeyboardHints() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) setVisible(true);
  }, []);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(STORAGE_KEY, "true");
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="rounded-lg border bg-background/95 backdrop-blur-sm shadow-lg px-4 py-3 max-w-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-foreground">
            Keyboard Shortcuts
          </span>
          <button
            onClick={dismiss}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="size-3.5" />
          </button>
        </div>
        <div className="space-y-1.5 text-xs text-muted-foreground">
          <div className="flex items-center justify-between gap-4">
            <span>Next topic</span>
            <div className="flex gap-1">
              <Kbd>j</Kbd>
              <span className="text-muted-foreground/50">or</span>
              <Kbd>→</Kbd>
            </div>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span>Previous topic</span>
            <div className="flex gap-1">
              <Kbd>k</Kbd>
              <span className="text-muted-foreground/50">or</span>
              <Kbd>←</Kbd>
            </div>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span>Search topics</span>
            <Kbd>Ctrl+K</Kbd>
          </div>
        </div>
      </div>
    </div>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center justify-center rounded border bg-muted/50 px-1.5 py-0.5 text-[10px] font-mono font-medium text-muted-foreground">
      {children}
    </kbd>
  );
}
