"use client";

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Fade } from "@/components/animate-ui/primitives/effects/fade";
import { CountingNumber } from "@/components/animate-ui/primitives/texts/counting-number";

interface ScaleSimulatorProps {
  title?: string;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  children: (props: { value: number }) => React.ReactNode;
  metrics?: (value: number) => { label: string; value: number; unit: string }[];
}

export function ScaleSimulator({
  title = "Scale Simulator",
  min = 1,
  max = 10000,
  step = 100,
  unit = "users",
  children,
  metrics,
}: ScaleSimulatorProps) {
  const [value, setValue] = useState(min);

  return (
    <Fade inView inViewMargin="-50px">
      <section className="rounded-xl border overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3 border-b bg-muted/30">
          <SlidersHorizontal className="size-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">{title}</h2>
        </div>
        <div className="px-5 py-4 space-y-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Load</span>
              <span className="font-mono font-semibold tabular-nums">
                <CountingNumber number={value} /> {unit}
              </span>
            </div>
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
              aria-label={`${title} load control`}
              aria-valuemin={min}
              aria-valuemax={max}
              aria-valuenow={value}
              className="w-full accent-primary h-1.5 rounded-full cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground/50 font-mono">
              <span>{min.toLocaleString()}</span>
              <span>{max.toLocaleString()}</span>
            </div>
          </div>

          {metrics && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {metrics(value).map((metric) => (
                <div key={metric.label} className="rounded-lg bg-muted/30 p-2.5 text-center">
                  <div className="text-[10px] text-muted-foreground mb-0.5">{metric.label}</div>
                  <div className="font-mono text-sm font-semibold tabular-nums">
                    <CountingNumber number={metric.value} />
                    <span className="text-[10px] font-normal text-muted-foreground ml-0.5">{metric.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {children({ value })}
        </div>
      </section>
    </Fade>
  );
}
