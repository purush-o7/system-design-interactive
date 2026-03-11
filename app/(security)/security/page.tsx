"use client";
import { CategoryLanding } from "@/components/category-landing";
import { categories } from "@/lib/topics";

export default function SecurityPage() {
  const category = categories.find((c) => c.slug === "security")!;
  return <CategoryLanding category={category} gradient="linear-gradient(90deg, #ef4444, #dc2626)" />;
}
