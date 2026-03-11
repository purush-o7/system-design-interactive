"use client";

import { Badge } from "@/components/ui/badge";
import { Fade } from "@/components/animate-ui/primitives/effects/fade";
import { Clock } from "lucide-react";

interface TopicHeroProps {
  title: string;
  subtitle: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedMinutes?: number;
}

const difficultyConfig = {
  beginner: {
    badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
    gradient: "from-emerald-500/10 via-teal-500/5",
    accent: "bg-emerald-500",
  },
  intermediate: {
    badge: "bg-amber-500/15 text-amber-400 border-amber-500/25",
    gradient: "from-amber-500/10 via-orange-500/5",
    accent: "bg-amber-500",
  },
  advanced: {
    badge: "bg-rose-500/15 text-rose-400 border-rose-500/25",
    gradient: "from-rose-500/10 via-red-500/5",
    accent: "bg-rose-500",
  },
};

export function TopicHero({ title, subtitle, difficulty, estimatedMinutes }: TopicHeroProps) {
  const config = difficultyConfig[difficulty];
  const capitalizedDifficulty = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);

  return (
    <Fade>
      <div className={`relative rounded-2xl overflow-hidden border border-border/50 bg-gradient-to-br ${config.gradient} to-transparent`}>
        <div className={`absolute top-0 left-0 w-1 h-full ${config.accent} rounded-l-2xl`} />
        <div className="px-6 py-8 sm:px-8 sm:py-10 space-y-3">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight">
              {title}
            </h1>
            <div className="flex items-center gap-2 shrink-0">
              {estimatedMinutes != null && (
                <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Clock className="size-3" />
                  ~{estimatedMinutes} min read
                </span>
              )}
              <Badge variant="outline" className={`${config.badge} shrink-0 text-[11px] font-medium`}>
                {capitalizedDifficulty}
              </Badge>
            </div>
          </div>
          <p className="text-muted-foreground text-[15px] leading-relaxed">
            {subtitle}
          </p>
        </div>
      </div>
    </Fade>
  );
}
