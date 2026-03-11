"use client";

import { AlertTriangle } from "lucide-react";
import { Fade } from "@/components/animate-ui/primitives/effects/fade";

interface FailureScenarioProps {
  title?: string;
  children: React.ReactNode;
}

export function FailureScenario({
  title = "What Goes Wrong",
  children,
}: FailureScenarioProps) {
  return (
    <Fade inView inViewMargin="-50px">
      <section className="rounded-xl border border-red-500/20 bg-red-500/[0.03] overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3 border-b border-red-500/10 bg-red-500/[0.04]">
          <AlertTriangle className="size-4 text-red-400" />
          <h2 className="text-sm font-semibold text-red-400">{title}</h2>
        </div>
        <div className="px-5 py-4 space-y-4">{children}</div>
      </section>
    </Fade>
  );
}
