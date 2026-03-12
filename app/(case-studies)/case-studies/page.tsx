"use client";
import { CategoryLanding } from "@/components/category-landing";
import { categories } from "@/lib/topics";

export default function CaseStudiesPage() {
  const category = categories.find((c) => c.slug === "case-studies")!;
  return <CategoryLanding category={category} gradient="linear-gradient(90deg, #ec4899, #db2777)" />;
}
