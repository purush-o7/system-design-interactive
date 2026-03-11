"use client";

import { HelpCircle } from "lucide-react";
import { Fade } from "@/components/animate-ui/primitives/effects/fade";

interface WhyItBreaksProps {
  title?: string;
  children: React.ReactNode;
}

export function WhyItBreaks({
  title = "Why It Breaks",
  children,
}: WhyItBreaksProps) {
  return (
    <Fade inView inViewMargin="-50px">
      <section className="rounded-xl border border-orange-500/20 bg-orange-500/[0.03] overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3 border-b border-orange-500/10 bg-orange-500/[0.04]">
          <HelpCircle className="size-4 text-orange-400" />
          <h2 className="text-sm font-semibold text-orange-400">{title}</h2>
        </div>
        <div className="px-5 py-4 space-y-4">{children}</div>
      </section>
    </Fade>
  );
}
