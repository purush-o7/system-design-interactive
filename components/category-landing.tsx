"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Fade } from "@/components/animate-ui/primitives/effects/fade";
import { GradientText } from "@/components/animate-ui/primitives/texts/gradient";
import type { Category } from "@/lib/topics";

const difficultyColors = {
  beginner: "bg-green-500/20 text-green-500 border-green-500/30",
  intermediate: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30",
  advanced: "bg-red-500/20 text-red-500 border-red-500/30",
};

interface CategoryLandingProps {
  category: Category;
  gradient?: string;
}

export function CategoryLanding({
  category,
  gradient = "linear-gradient(90deg, #14b8a6, #3b82f6)",
}: CategoryLandingProps) {
  const Icon = category.icon;
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <Fade>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Icon className="size-8 text-muted-foreground" />
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              <GradientText text={category.label} gradient={gradient} />
            </h1>
          </div>
          <p className="text-muted-foreground">
            {category.topics.length} topics to explore
          </p>
        </div>
      </Fade>

      <div className="grid gap-4">
        {category.topics.map((topic, i) => {
          const TopicIcon = topic.icon;
          return (
            <Fade key={topic.slug} inView delay={i * 0.05}>
              <Link href={topic.href}>
                <Card className="transition-all duration-200 hover:shadow-md hover:translate-x-1 cursor-pointer">
                  <CardHeader className="flex flex-row items-center gap-4">
                    <TopicIcon className="size-6 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">{topic.label}</CardTitle>
                        <Badge className={`text-[10px] ${difficultyColors[topic.difficulty]}`}>
                          {topic.difficulty}
                        </Badge>
                      </div>
                      <CardDescription className="text-sm mt-1">
                        {topic.description}
                      </CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            </Fade>
          );
        })}
      </div>
    </div>
  );
}
