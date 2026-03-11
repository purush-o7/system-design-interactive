"use client";
import { CategoryLanding } from "@/components/category-landing";
import { categories } from "@/lib/topics";

export default function RealWorldPage() {
  const category = categories.find((c) => c.slug === "real-world")!;
  return <CategoryLanding category={category} gradient="linear-gradient(90deg, #10b981, #059669)" />;
}
