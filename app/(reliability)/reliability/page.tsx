"use client";
import { CategoryLanding } from "@/components/category-landing";
import { categories } from "@/lib/topics";

export default function ReliabilityPage() {
  const category = categories.find((c) => c.slug === "reliability")!;
  return <CategoryLanding category={category} gradient="linear-gradient(90deg, #f43f5e, #e11d48)" />;
}
