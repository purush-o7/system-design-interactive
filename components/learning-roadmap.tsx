"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight, Map } from "lucide-react";
import { cn } from "@/lib/utils";
import { categories } from "@/lib/topics";
import { getVisitedTopics } from "@/components/visit-tracker";

type PathStep = {
  slug: string;
  label: string;
  href: string;
  color: string;
  topicCount: number;
  dependsOn: string[];
};

const learningPath: PathStep[] = [
  { slug: "fundamentals", label: "Fundamentals", href: "/fundamentals", color: "teal", topicCount: 6, dependsOn: [] },
  { slug: "scaling", label: "Scaling", href: "/scaling", color: "blue", topicCount: 4, dependsOn: ["fundamentals"] },
  { slug: "data-storage", label: "Data Storage", href: "/data-storage", color: "amber", topicCount: 6, dependsOn: ["fundamentals"] },
  { slug: "caching", label: "Caching", href: "/caching", color: "orange", topicCount: 4, dependsOn: ["scaling", "data-storage"] },
  { slug: "system-patterns", label: "System Patterns", href: "/system-patterns", color: "purple", topicCount: 6, dependsOn: ["caching"] },
  { slug: "reliability", label: "Reliability", href: "/reliability", color: "rose", topicCount: 4, dependsOn: ["system-patterns"] },
  { slug: "security", label: "Security", href: "/security", color: "red", topicCount: 4, dependsOn: ["reliability"] },
  { slug: "real-world", label: "Real-World Designs", href: "/real-world", color: "emerald", topicCount: 9, dependsOn: ["security"] },
  { slug: "interview-prep", label: "Interview Prep", href: "/interview-prep", color: "cyan", topicCount: 3, dependsOn: ["real-world"] },
  { slug: "case-studies", label: "Case Studies", href: "/case-studies", color: "pink", topicCount: 5, dependsOn: ["real-world"] },
];

const dotColorClasses: Record<string, string> = {
  teal: "bg-teal-500",
  blue: "bg-blue-500",
  amber: "bg-amber-500",
  orange: "bg-orange-500",
  purple: "bg-purple-500",
  rose: "bg-rose-500",
  red: "bg-red-500",
  emerald: "bg-emerald-500",
  cyan: "bg-cyan-500",
  pink: "bg-pink-500",
};

const ringColorClasses: Record<string, string> = {
  teal: "ring-teal-500/30",
  blue: "ring-blue-500/30",
  amber: "ring-amber-500/30",
  orange: "ring-orange-500/30",
  purple: "ring-purple-500/30",
  rose: "ring-rose-500/30",
  red: "ring-red-500/30",
  emerald: "ring-emerald-500/30",
  cyan: "ring-cyan-500/30",
  pink: "ring-pink-500/30",
};

const textColorClasses: Record<string, string> = {
  teal: "text-teal-400",
  blue: "text-blue-400",
  amber: "text-amber-400",
  orange: "text-orange-400",
  purple: "text-purple-400",
  rose: "text-rose-400",
  red: "text-red-400",
  emerald: "text-emerald-400",
  cyan: "text-cyan-400",
  pink: "text-pink-400",
};

type StepStatus = "completed" | "in-progress" | "locked";

function getStepStatus(
  step: PathStep,
  visited: string[],
  allSteps: PathStep[]
): StepStatus {
  const cat = categories.find((c) => c.slug === step.slug);
  if (!cat) return "locked";
  const completed = cat.topics.filter((t) => visited.includes(t.href)).length;
  if (completed === cat.topics.length) return "completed";

  // Check if dependencies are at least started
  const depsStarted = step.dependsOn.every((depSlug) => {
    const depCat = categories.find((c) => c.slug === depSlug);
    return depCat ? depCat.topics.some((t) => visited.includes(t.href)) : true;
  });
  if (step.dependsOn.length === 0 || depsStarted) {
    return completed > 0 ? "in-progress" : "in-progress";
  }
  return "locked";
}

export function LearningRoadmap() {
  const [visited, setVisited] = useState<string[]>([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setVisited(getVisitedTopics());
  }, []);

  return (
    <div className="space-y-3">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
      >
        <Map className="size-4 text-violet-400" />
        <span>Recommended Learning Path</span>
        <ChevronRight
          className={cn(
            "size-3.5 transition-transform",
            expanded && "rotate-90"
          )}
        />
      </button>

      {expanded && (
        <div className="relative pl-4">
          {/* Vertical connecting line */}
          <div className="absolute left-[19px] top-2 bottom-2 w-px bg-border/50" />

          <div className="space-y-1">
            {learningPath.map((step, i) => {
              const status = getStepStatus(step, visited, learningPath);
              const cat = categories.find((c) => c.slug === step.slug);
              const completed = cat
                ? cat.topics.filter((t) => visited.includes(t.href)).length
                : 0;

              // Fork indicator for parallel paths
              const isFork =
                i > 0 &&
                learningPath[i - 1] &&
                step.dependsOn[0] !== learningPath[i - 1].slug &&
                step.dependsOn.length > 0;

              return (
                <Link
                  key={step.slug}
                  href={step.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-muted/40 group relative",
                    status === "completed" && "opacity-70"
                  )}
                >
                  {/* Status dot */}
                  <div className="relative z-10">
                    <div
                      className={cn(
                        "size-3 rounded-full ring-2 ring-offset-2 ring-offset-background transition-all",
                        status === "completed"
                          ? cn(dotColorClasses[step.color], ringColorClasses[step.color])
                          : status === "in-progress"
                            ? cn(dotColorClasses[step.color], ringColorClasses[step.color], "animate-pulse")
                            : "bg-muted-foreground/20 ring-border/30"
                      )}
                    />
                  </div>

                  {/* Step info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "font-medium",
                          status === "locked"
                            ? "text-muted-foreground/50"
                            : textColorClasses[step.color]
                        )}
                      >
                        {step.label}
                      </span>
                      {status === "completed" && (
                        <span className="text-[10px] text-emerald-500 font-medium">Done</span>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground/60">
                      {completed}/{step.topicCount} topics
                      {isFork && ` · builds on ${step.dependsOn.join(" & ")}`}
                    </span>
                  </div>

                  <ChevronRight className="size-3 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors" />
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
