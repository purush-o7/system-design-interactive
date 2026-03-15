"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Fade } from "@/components/animate-ui/primitives/effects/fade";
import { GradientText } from "@/components/animate-ui/primitives/texts/gradient";
import { StarsBackground } from "@/components/animate-ui/components/backgrounds/stars";
import { sidebarGroups } from "@/lib/topics";
import { getVisitedTopics } from "@/components/visit-tracker";
import { LearningRoadmap } from "@/components/learning-roadmap";

const totalTopics = sidebarGroups.flatMap((g) => g.categories).flatMap((c) => c.topics).length;
const totalCategories = sidebarGroups.flatMap((g) => g.categories).length;

const categoryColorClasses: Record<string, string> = {
  teal: "border-teal-500/30 hover:border-teal-500/60 hover:bg-teal-500/5",
  blue: "border-blue-500/30 hover:border-blue-500/60 hover:bg-blue-500/5",
  amber: "border-amber-500/30 hover:border-amber-500/60 hover:bg-amber-500/5",
  orange: "border-orange-500/30 hover:border-orange-500/60 hover:bg-orange-500/5",
  purple: "border-purple-500/30 hover:border-purple-500/60 hover:bg-purple-500/5",
  rose: "border-rose-500/30 hover:border-rose-500/60 hover:bg-rose-500/5",
  red: "border-red-500/30 hover:border-red-500/60 hover:bg-red-500/5",
  emerald: "border-emerald-500/30 hover:border-emerald-500/60 hover:bg-emerald-500/5",
  cyan: "border-cyan-500/30 hover:border-cyan-500/60 hover:bg-cyan-500/5",
};

const iconColorClasses: Record<string, string> = {
  teal: "text-teal-500",
  blue: "text-blue-500",
  amber: "text-amber-500",
  orange: "text-orange-500",
  purple: "text-purple-500",
  rose: "text-rose-500",
  red: "text-red-500",
  emerald: "text-emerald-500",
  cyan: "text-cyan-500",
};

export default function HomePage() {
  const [visitedTopics, setVisitedTopics] = useState<string[]>([]);

  useEffect(() => {
    setVisitedTopics(getVisitedTopics());
  }, []);

  const overallCompleted = visitedTopics.filter((href) =>
    sidebarGroups
      .flatMap((g) => g.categories)
      .flatMap((c) => c.topics)
      .some((t) => t.href === href)
  ).length;
  const overallPercent = totalTopics > 0 ? Math.round((overallCompleted / totalTopics) * 100) : 0;

  return (
    <div className="relative min-h-[calc(100vh-3rem)]">
      <StarsBackground className="absolute inset-0 -z-10 opacity-50" />

      <div className="max-w-4xl mx-auto space-y-12 py-8">
        <Fade>
          <div className="text-center space-y-4">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
              <GradientText
                text="System Design"
                gradient="linear-gradient(90deg, #14b8a6, #3b82f6, #8b5cf6)"
              />
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Learn system design through <strong>failure-first</strong> visual
              lessons. See what breaks, understand why, then learn the fix.
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <span>{totalTopics} topics</span>
              <span>{totalCategories} categories</span>
              <span>Interactive visualizations</span>
            </div>
            <div className="pt-2">
              <Button asChild size="lg" className="gap-2">
                <Link href="/fundamentals/how-the-internet-works">
                  Start Learning
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
            {overallCompleted > 0 && (
              <div className="max-w-xs mx-auto space-y-1 pt-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Overall progress</span>
                  <span>
                    {overallCompleted}/{totalTopics} completed
                  </span>
                </div>
                <Progress value={overallPercent} className="h-2" />
              </div>
            )}
          </div>
        </Fade>

        <Fade inView inViewMargin="-50px" delay={0.1}>
          <LearningRoadmap />
        </Fade>

        {sidebarGroups.map((group, groupIndex) => (
          <Fade key={group.label} inView inViewMargin="-50px" delay={groupIndex * 0.1}>
            <div className="space-y-4">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                {group.label}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.categories.map((category) => {
                  const Icon = category.icon;
                  const categoryCompleted = category.topics.filter((t) =>
                    visitedTopics.includes(t.href)
                  ).length;
                  const categoryPercent =
                    category.topics.length > 0
                      ? Math.round((categoryCompleted / category.topics.length) * 100)
                      : 0;
                  return (
                    <Link key={category.slug} href={category.href}>
                      <Card
                        className={`transition-all duration-300 cursor-pointer h-full ${
                          categoryColorClasses[category.color] || ""
                        }`}
                      >
                        <CardHeader>
                          <div className="flex items-center justify-between mb-2">
                            <Icon
                              className={`size-8 ${
                                iconColorClasses[category.color] || ""
                              }`}
                            />
                            <Badge variant="secondary" className="text-xs">
                              {category.topics.length} topics
                            </Badge>
                          </div>
                          <CardTitle className="text-lg">
                            {category.label}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            {category.topics.map((t) => t.label).join(" · ")}
                          </CardDescription>
                          <div className="pt-2 space-y-1">
                            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                              <span>
                                {categoryCompleted}/{category.topics.length} completed
                              </span>
                            </div>
                            <Progress value={categoryPercent} className="h-1" />
                          </div>
                        </CardHeader>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </div>
          </Fade>
        ))}
      </div>
    </div>
  );
}
