"use client";
import { CategoryLanding } from "@/components/category-landing";
import { categories } from "@/lib/topics";

export default function ScalingPage() {
  const category = categories.find((c) => c.slug === "scaling")!;
  return <CategoryLanding category={category} gradient="linear-gradient(90deg, #3b82f6, #6366f1)" />;
}
