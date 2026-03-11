"use client";
import { CategoryLanding } from "@/components/category-landing";
import { categories } from "@/lib/topics";

export default function SystemPatternsPage() {
  const category = categories.find((c) => c.slug === "system-patterns")!;
  return <CategoryLanding category={category} gradient="linear-gradient(90deg, #8b5cf6, #a855f7)" />;
}
