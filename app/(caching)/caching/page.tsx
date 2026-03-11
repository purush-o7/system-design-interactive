"use client";
import { CategoryLanding } from "@/components/category-landing";
import { categories } from "@/lib/topics";

export default function CachingPage() {
  const category = categories.find((c) => c.slug === "caching")!;
  return <CategoryLanding category={category} gradient="linear-gradient(90deg, #f97316, #ef4444)" />;
}
