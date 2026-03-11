"use client";

import { CountingNumber } from "@/components/animate-ui/primitives/texts/counting-number";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCounterProps {
  label: string;
  value: number;
  unit?: string;
  trend?: "up" | "down" | "neutral";
  trendSemantic?: "good-when-up" | "good-when-down";
  className?: string;
}

export function MetricCounter({
  label,
  value,
  unit = "",
  trend = "neutral",
  trendSemantic = "good-when-down",
  className,
}: MetricCounterProps) {
  const getTrendColor = (t: "up" | "down" | "neutral") => {
    if (t === "neutral") return "text-muted-foreground";
    if (trendSemantic === "good-when-up") {
      return t === "up" ? "text-emerald-400" : "text-red-400";
    }
    return t === "up" ? "text-red-400" : "text-emerald-400";
  };

  const trendConfig = {
    up: { icon: TrendingUp, color: getTrendColor("up") },
    down: { icon: TrendingDown, color: getTrendColor("down") },
    neutral: { icon: Minus, color: getTrendColor("neutral") },
  };
  const { icon: TrendIcon, color } = trendConfig[trend];

  return (
    <div className={cn("rounded-lg border bg-muted/20 p-3", className)}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] text-muted-foreground">{label}</span>
        <TrendIcon className={cn("size-3", color)} />
      </div>
      <div className="font-mono text-lg font-semibold leading-tight">
        <CountingNumber number={value} />
        {unit && <span className="text-xs font-normal text-muted-foreground ml-1">{unit}</span>}
      </div>
    </div>
  );
}
