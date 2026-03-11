"use client";

import { Eye } from "lucide-react";
import { Fade } from "@/components/animate-ui/primitives/effects/fade";

interface ConceptVisualizerProps {
  title?: string;
  children: React.ReactNode;
}

export function ConceptVisualizer({
  title = "How It Works",
  children,
}: ConceptVisualizerProps) {
  return (
    <Fade inView inViewMargin="-50px">
      <section className="rounded-xl border border-blue-500/20 bg-blue-500/[0.03] overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3 border-b border-blue-500/10 bg-blue-500/[0.04]">
          <Eye className="size-4 text-blue-400" />
          <h2 className="text-sm font-semibold text-blue-400">{title}</h2>
        </div>
        <div className="px-5 py-4 space-y-4">{children}</div>
      </section>
    </Fade>
  );
}
