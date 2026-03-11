"use client";
import { CategoryLanding } from "@/components/category-landing";
import { categories } from "@/lib/topics";

export default function InterviewPrepPage() {
  const category = categories.find((c) => c.slug === "interview-prep")!;
  return <CategoryLanding category={category} gradient="linear-gradient(90deg, #06b6d4, #0891b2)" />;
}
