"use client";

import { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Fade } from "@/components/animate-ui/primitives/effects/fade";

interface InteractiveDemoProps {
  title?: string;
  intervalMs?: number;
  children: (props: { isPlaying: boolean; reset: () => void; tick: number }) => React.ReactNode;
}

export function InteractiveDemo({
  title = "Try It Yourself",
  intervalMs = 1000,
  children,
}: InteractiveDemoProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => {
      setTick((t) => t + 1);
    }, intervalMs);
    return () => clearInterval(id);
  }, [isPlaying, intervalMs]);

  const reset = () => {
    setIsPlaying(false);
    setTick(0);
  };

  return (
    <Fade inView inViewMargin="-50px">
      <section className="rounded-xl border border-violet-500/20 bg-violet-500/[0.03] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-violet-500/10 bg-violet-500/[0.04]">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-violet-400" />
            <h2 className="text-sm font-semibold text-violet-400">{title}</h2>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="size-7 text-violet-400 hover:text-violet-300 hover:bg-violet-500/10"
              onClick={() => {
                setIsPlaying(!isPlaying);
              }}
            >
              {isPlaying ? (
                <Pause className="size-3.5" />
              ) : (
                <Play className="size-3.5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-7 text-violet-400 hover:text-violet-300 hover:bg-violet-500/10"
              onClick={reset}
            >
              <RotateCcw className="size-3.5" />
            </Button>
          </div>
        </div>
        <div className="px-5 py-4">{children({ isPlaying, reset, tick })}</div>
      </section>
    </Fade>
  );
}
