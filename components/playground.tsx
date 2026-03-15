"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { SimulationControls } from "@/components/simulation-controls";
import { MousePointerClick, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  hints?: string[];
}

export function Playground({
  title,
  simulation,
  canvas,
  explanation,
  controls,
  canvasHeight = "min-h-[350px]",
  className,
  hints,
}: PlaygroundProps) {
  const [hintDismissed, setHintDismissed] = useState(false);
  const resolvedExplanation: ReactNode =
    typeof explanation === "function" && simulation
      ? explanation(simulation)
      : (explanation as ReactNode);

  const showHints = hints && hints.length > 0 && !hintDismissed;

  return (
    <div
      className={cn(
        "rounded-xl border border-violet-500/20 bg-violet-500/[0.02] overflow-hidden",
        className
      )}
    >
      {/* Header */}
      {(title || showHints) && (
        <div className="flex items-center gap-2 border-b border-violet-500/20 bg-violet-500/[0.04] px-4 py-2">
          {title && (
            <>
              <div className="size-2 rounded-full bg-violet-500/50" />
              <span className="text-sm font-medium text-violet-400">{title}</span>
            </>
          )}
          {showHints && (
            <div className="ml-auto flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs text-teal-400 bg-teal-500/10 border border-teal-500/20 rounded-md px-2 py-1">
                <MousePointerClick className="size-3 shrink-0" />
                <span>{hints[0]}</span>
              </div>
              <button
                onClick={() => setHintDismissed(true)}
                className="text-muted-foreground/50 hover:text-muted-foreground transition-colors"
              >
                <X className="size-3" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Desktop: side-by-side */}
      {resolvedExplanation ? (
        <>
          <div className="hidden lg:flex lg:flex-row">
            <div className={cn("flex-[3] relative", canvasHeight)}>{canvas}</div>
            <div className="flex-[2] border-l border-violet-500/10 p-4 overflow-y-auto max-h-[400px]">
              <div className="text-sm text-muted-foreground space-y-3">
                {resolvedExplanation}
              </div>
            </div>
          </div>

          {/* Mobile: tabs */}
          <div className="lg:hidden">
            <Tabs defaultValue="canvas">
              <TabsList className="w-full rounded-none border-b border-violet-500/10 bg-transparent h-9">
                <TabsTrigger
                  value="canvas"
                  className="flex-1 text-xs data-[state=active]:bg-violet-500/10 data-[state=active]:text-violet-400 rounded-none"
                >
                  Interactive
                </TabsTrigger>
                <TabsTrigger
                  value="explanation"
                  className="flex-1 text-xs data-[state=active]:bg-violet-500/10 data-[state=active]:text-violet-400 rounded-none"
                >
                  Explanation
                </TabsTrigger>
              </TabsList>
              <TabsContent value="canvas" className="mt-0">
                <div className={cn("relative", canvasHeight)}>{canvas}</div>
              </TabsContent>
              <TabsContent value="explanation" className="mt-0">
                <div className="p-4 overflow-y-auto max-h-[400px]">
                  <div className="text-sm text-muted-foreground space-y-3">
                    {resolvedExplanation}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </>
      ) : (
        <div className={cn("relative", canvasHeight)}>{canvas}</div>
      )}

      {/* Controls */}
      {controls !== false && simulation && (
        <div className="border-t border-violet-500/10 p-2">
          {controls ?? <SimulationControls state={simulation} showSpeed showStepper />}
        </div>
      )}
    </div>
  );
}
