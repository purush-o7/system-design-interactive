"use client";

import { cn } from "@/lib/utils";
import { SimulationControls } from "@/components/simulation-controls";
import type { SimulationState } from "@/hooks/use-simulation";
import type { ReactNode } from "react";

interface PlaygroundProps {
  title?: string;
  simulation?: SimulationState;
  canvas: ReactNode;
  explanation?: ReactNode | ((state: SimulationState) => ReactNode);
  controls?: ReactNode | false;
  canvasHeight?: string;
  className?: string;
}

export function Playground({
  title,
  simulation,
  canvas,
  explanation,
  controls,
  canvasHeight = "min-h-[350px]",
  className,
}: PlaygroundProps) {
  const resolvedExplanation: ReactNode =
    typeof explanation === "function" && simulation
      ? explanation(simulation)
      : (explanation as ReactNode);

  return (
    <div
      className={cn(
        "rounded-xl border border-violet-500/20 bg-violet-500/[0.02] overflow-hidden",
        className
      )}
    >
      {/* Header */}
      {title && (
        <div className="flex items-center gap-2 border-b border-violet-500/20 bg-violet-500/[0.04] px-4 py-2">
          <div className="size-2 rounded-full bg-violet-500/50" />
          <span className="text-sm font-medium text-violet-400">{title}</span>
        </div>
      )}

      {/* Main area */}
      <div className="flex flex-col lg:flex-row">
        {/* Canvas */}
        <div className={cn("flex-[3] relative", canvasHeight)}>{canvas}</div>

        {/* Explanation sidebar */}
        {resolvedExplanation && (
          <div className="flex-[2] border-t lg:border-t-0 lg:border-l border-violet-500/10 p-4 overflow-y-auto max-h-[400px]">
            <div className="text-sm text-muted-foreground space-y-3">
              {resolvedExplanation}
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      {controls !== false && simulation && (
        <div className="border-t border-violet-500/10 p-2">
          {controls ?? <SimulationControls state={simulation} showSpeed showStepper />}
        </div>
      )}
    </div>
  );
}
