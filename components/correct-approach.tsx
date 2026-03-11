"use client";

import { CheckCircle2 } from "lucide-react";
import { Fade } from "@/components/animate-ui/primitives/effects/fade";

interface CorrectApproachProps {
  title?: string;
  children: React.ReactNode;
}

export function CorrectApproach({
  title = "The Right Approach",
  children,
}: CorrectApproachProps) {
  return (
    <Fade inView inViewMargin="-50px">
      <section className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.03] overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3 border-b border-emerald-500/10 bg-emerald-500/[0.04]">
          <CheckCircle2 className="size-4 text-emerald-400" />
          <h2 className="text-sm font-semibold text-emerald-400">{title}</h2>
        </div>
        <div className="px-5 py-4 space-y-4">{children}</div>
      </section>
    </Fade>
  );
}
