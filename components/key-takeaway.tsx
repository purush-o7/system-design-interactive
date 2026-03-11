"use client";

import { CheckCircle } from "lucide-react";
import { Fade } from "@/components/animate-ui/primitives/effects/fade";
import { Slide } from "@/components/animate-ui/primitives/effects/slide";

interface KeyTakeawayProps {
  points: string[];
}

export function KeyTakeaway({ points }: KeyTakeawayProps) {
  return (
    <Fade inView inViewMargin="-50px">
      <section className="rounded-xl border bg-muted/20 overflow-hidden">
        <div className="px-5 py-3 border-b bg-muted/30">
          <h2 className="text-sm font-semibold">Key Takeaways</h2>
        </div>
        <ul className="px-5 py-4 space-y-3">
          {points.map((point, i) => (
            <Slide key={i} direction="left" delay={i * 0.08} inView inViewMargin="-20px">
              <li className="flex items-start gap-3">
                <CheckCircle className="size-4 text-emerald-500 mt-0.5 shrink-0" />
                <span className="text-sm text-muted-foreground leading-relaxed">{point}</span>
              </li>
            </Slide>
          ))}
        </ul>
      </section>
    </Fade>
  );
}
