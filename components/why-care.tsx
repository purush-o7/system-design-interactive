"use client";

import { Rocket } from "lucide-react";
import { Fade } from "@/components/animate-ui/primitives/effects/fade";

interface WhyCareProps {
  children: React.ReactNode;
}

export function WhyCare({ children }: WhyCareProps) {
  return (
    <Fade inView inViewMargin="-50px">
      <div className="rounded-lg border border-teal-500/20 bg-gradient-to-r from-teal-500/[0.04] to-blue-500/[0.04] px-4 py-3 flex items-start gap-3">
        <Rocket className="size-4 mt-0.5 shrink-0 text-teal-400" />
        <div className="text-sm text-muted-foreground leading-relaxed">
          {children}
        </div>
      </div>
    </Fade>
  );
}
