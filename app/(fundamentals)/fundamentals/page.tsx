"use client";
import { CategoryLanding } from "@/components/category-landing";
import { categories } from "@/lib/topics";

export default function FundamentalsPage() {
  const category = categories.find((c) => c.slug === "fundamentals")!;
  return <CategoryLanding category={category} gradient="linear-gradient(90deg, #14b8a6, #06b6d4)" />;
}
