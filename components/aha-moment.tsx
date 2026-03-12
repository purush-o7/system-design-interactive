"use client";

import { useState, useId } from "react";
import { Lightbulb, ChevronDown } from "lucide-react";
import { Fade } from "@/components/animate-ui/primitives/effects/fade";

interface AhaMomentProps {
  question: string;
  answer: React.ReactNode;
}

export function AhaMoment({ question, answer }: AhaMomentProps) {
  const [revealed, setRevealed] = useState(false);
  const id = useId();
  const answerId = `aha-${id}`;

  return (
    <Fade inView inViewMargin="-50px">
      <div className="w-full text-left rounded-xl border border-amber-500/20 bg-amber-500/[0.03] transition-all hover:border-amber-500/30 hover:bg-amber-500/[0.05]">
        <button
          aria-expanded={revealed}
          aria-controls={answerId}
          className="w-full text-left flex items-start gap-3 px-5 py-4"
          onClick={() => setRevealed(!revealed)}
        >
          <Lightbulb className="size-4 text-amber-400 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium leading-snug">{question}</p>
            {!revealed && (
              <p className="text-xs text-amber-500/60 italic mt-2">Click to reveal</p>
            )}
          </div>
          <ChevronDown
            className={`size-4 text-amber-400/50 shrink-0 mt-0.5 transition-transform duration-200 ${
              revealed ? "rotate-180" : ""
            }`}
          />
        </button>
        {revealed && (
          <div id={answerId} role="region" aria-label={question} className="px-5 pb-4 pl-12">
            <div className="text-sm text-muted-foreground leading-relaxed">{answer}</div>
          </div>
        )}
      </div>
    </Fade>
  );
}
