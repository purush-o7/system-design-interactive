"use client";
import { CategoryLanding } from "@/components/category-landing";
import { categories } from "@/lib/topics";

export default function DataStoragePage() {
  const category = categories.find((c) => c.slug === "data-storage")!;
  return <CategoryLanding category={category} gradient="linear-gradient(90deg, #f59e0b, #d97706)" />;
}
