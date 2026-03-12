"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ChevronRight, ChevronDown } from "lucide-react";

interface FlowStep {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

interface AnimatedFlowProps {
  steps: FlowStep[];
  direction?: "horizontal" | "vertical";
  autoPlay?: boolean;
  interval?: number;
  paused?: boolean;
  externalStep?: number;
  className?: string;
}

export function AnimatedFlow({
  steps,
  direction = "horizontal",
  autoPlay = true,
  interval = 1500,
  paused = false,
  externalStep,
  className,
}: AnimatedFlowProps) {
  const [internalStep, setInternalStep] = useState(0);
  const activeStep = externalStep !== undefined ? externalStep : internalStep;

  useEffect(() => {
    if (!autoPlay || paused || externalStep !== undefined) return;
    const timer = setInterval(() => {
      if (steps.length === 0) return;
      setInternalStep((prev) => (prev + 1) % steps.length);
    }, interval);
    return () => clearInterval(timer);
  }, [autoPlay, paused, externalStep, interval, steps.length]);

  const isHorizontal = direction === "horizontal";
  const Arrow = isHorizontal ? ChevronRight : ChevronDown;

  return (
    <div
      className={cn(
        "flex gap-1",
        isHorizontal ? "flex-row flex-wrap items-center justify-center" : "flex-col items-stretch",
        className
      )}
    >
      {steps.map((step, i) => (
        <div
          key={step.id}
          className={cn(
            "flex items-center gap-1",
            isHorizontal ? "flex-row" : "flex-col"
          )}
        >
          <button
            onClick={externalStep === undefined ? () => setInternalStep(i) : undefined}
            className={cn(
              "relative flex items-center gap-2.5 rounded-lg border px-3.5 py-2.5 text-sm transition-all duration-300 text-left",
              externalStep !== undefined && "cursor-default",
              isHorizontal ? "min-w-[110px]" : "w-full",
              i === activeStep
                ? "border-primary/50 bg-primary/8 shadow-sm shadow-primary/5 ring-1 ring-primary/20"
                : i < activeStep
                ? "border-emerald-500/20 bg-emerald-500/5 text-muted-foreground"
                : "border-border/50 bg-muted/20 text-muted-foreground/50"
            )}
          >
            {i < activeStep && (
              <div className="absolute -top-1 -right-1 size-3.5 rounded-full bg-emerald-500 flex items-center justify-center">
                <svg className="size-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            {step.icon && (
              <span className={cn(
                "shrink-0 transition-colors",
                i === activeStep ? "text-primary" : ""
              )}>
                {step.icon}
              </span>
            )}
            <div className="min-w-0">
              <div className={cn(
                "font-medium text-[13px] leading-tight",
                i === activeStep && "text-foreground"
              )}>
                {step.label}
              </div>
              {step.description && (
                <div className={cn(
                  "text-[11px] leading-snug mt-0.5 transition-all duration-300",
                  i === activeStep
                    ? "text-muted-foreground max-h-20 opacity-100"
                    : "max-h-0 opacity-0 overflow-hidden"
                )}>
                  {step.description}
                </div>
              )}
            </div>
          </button>
          {i < steps.length - 1 && (
            <Arrow
              className={cn(
                "size-3.5 shrink-0 transition-colors duration-300",
                i < activeStep ? "text-emerald-500" : "text-muted-foreground/25"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}
