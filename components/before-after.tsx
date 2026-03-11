"use client";

import { X, Check } from "lucide-react";
import { Fade } from "@/components/animate-ui/primitives/effects/fade";

interface BeforeAfterProps {
  before: { title?: string; content: React.ReactNode };
  after: { title?: string; content: React.ReactNode };
}

export function BeforeAfter({ before, after }: BeforeAfterProps) {
  return (
    <Fade inView inViewMargin="-50px">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-xl border border-red-500/20 bg-red-500/[0.03] overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-red-500/10 bg-red-500/[0.04]">
            <X className="size-3.5 text-red-400" />
            <span className="text-xs font-semibold text-red-400">{before.title || "Before"}</span>
          </div>
          <div className="px-4 py-3">{before.content}</div>
        </div>
        <div className="flex items-center justify-center md:hidden">
          <span className="inline-flex items-center justify-center rounded-full bg-muted px-3 py-0.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">VS</span>
        </div>
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.03] overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-emerald-500/10 bg-emerald-500/[0.04]">
            <Check className="size-3.5 text-emerald-400" />
            <span className="text-xs font-semibold text-emerald-400">{after.title || "After"}</span>
          </div>
          <div className="px-4 py-3">{after.content}</div>
        </div>
      </div>
    </Fade>
  );
}
