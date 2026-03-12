"use client";

import { Play, Pause, RotateCcw, SkipBack, SkipForward, Gauge } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SimulationState } from "@/hooks/use-simulation";

interface SimulationControlsProps {
  state: SimulationState;
  showSpeed?: boolean;
  showStepper?: boolean;
  showTimeline?: boolean;
  label?: string;
  className?: string;
  compact?: boolean;
}

const speeds = [0.5, 1, 2, 4];

export function SimulationControls({
  state,
  showSpeed = true,
  showStepper = false,
  showTimeline = false,
  label,
  className,
  compact = false,
}: SimulationControlsProps) {
  const statusText =
    label ??
    (state.maxSteps !== Infinity
      ? `Step ${state.step} of ${state.maxSteps}`
      : state.isPlaying
        ? "Running..."
        : state.tick === 0
          ? "Ready"
          : `Tick ${state.tick}`);

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 rounded-lg border border-violet-500/20 bg-violet-500/[0.04] px-3 py-2",
        className
      )}
    >
      {/* Play / Pause */}
      <div className="flex items-center gap-1">
        {showStepper && (
          <button
            onClick={state.stepBackward}
            disabled={state.step <= 0}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-violet-500/10 hover:text-violet-400 disabled:opacity-30 transition-colors"
            aria-label="Step backward"
          >
            <SkipBack className="size-4" />
          </button>
        )}

        <button
          onClick={state.toggle}
          className={cn(
            "rounded-md p-1.5 transition-colors",
            state.isPlaying
              ? "bg-violet-500/20 text-violet-400"
              : "text-muted-foreground hover:bg-violet-500/10 hover:text-violet-400"
          )}
          aria-label={state.isPlaying ? "Pause" : "Play"}
        >
          {state.isPlaying ? <Pause className="size-4" /> : <Play className="size-4" />}
        </button>

        {showStepper && (
          <button
            onClick={state.stepForward}
            disabled={state.maxSteps !== Infinity && state.step >= state.maxSteps}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-violet-500/10 hover:text-violet-400 disabled:opacity-30 transition-colors"
            aria-label="Step forward"
          >
            <SkipForward className="size-4" />
          </button>
        )}

        <button
          onClick={state.reset}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-violet-500/10 hover:text-violet-400 transition-colors"
          aria-label="Reset"
        >
          <RotateCcw className="size-4" />
        </button>
      </div>

      {/* Timeline scrubber */}
      {showTimeline && state.maxSteps !== Infinity && (
        <div className="flex-1 min-w-24">
          <input
            type="range"
            min={0}
            max={state.maxSteps}
            value={state.step}
            onChange={(e) => state.setStep(Number(e.target.value))}
            className="w-full h-1.5 rounded-full accent-violet-500 cursor-pointer"
            aria-label="Timeline"
          />
        </div>
      )}

      {/* Status text */}
      {!compact && (
        <span className="text-xs text-muted-foreground select-none">{statusText}</span>
      )}

      {/* Speed selector */}
      {showSpeed && (
        <div className="ml-auto flex items-center gap-1">
          <Gauge className="size-3 text-muted-foreground" />
          {speeds.map((s) => (
            <button
              key={s}
              onClick={() => state.setSpeed(s)}
              className={cn(
                "rounded px-1.5 py-0.5 text-[10px] font-mono transition-colors",
                state.speed === s
                  ? "bg-violet-500/20 text-violet-400"
                  : "text-muted-foreground hover:bg-violet-500/10"
              )}
            >
              {s}x
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
