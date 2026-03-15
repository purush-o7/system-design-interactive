"use client";

import { Github, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

export function SiteCredits({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-3", className)}>
      <p className="text-[11px] text-muted-foreground/70 flex items-center gap-1">
        Built with{" "}
        <Heart className="size-3 text-red-400 fill-red-400" /> by{" "}
        <span className="font-medium text-foreground/70">Purush</span>
      </p>

      <a
        href="https://github.com/purush-o7/system-design-interactive"
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-2 rounded-md border border-border/60 bg-muted/30 px-3 py-2 transition-all duration-200 hover:bg-muted hover:border-border"
      >
        <Github className="size-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-foreground/80 group-hover:text-foreground transition-colors truncate">
            Star on GitHub
          </p>
          <p className="text-[10px] text-muted-foreground/60">
            Open for contributions
          </p>
        </div>
      </a>
    </div>
  );
}
