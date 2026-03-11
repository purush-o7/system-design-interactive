"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getAdjacentTopics } from "@/lib/topics";

export function useKeyboardNav() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      const { prev, next } = getAdjacentTopics(pathname);

      if ((e.key === "j" || e.key === "ArrowRight") && next) {
        e.preventDefault();
        router.push(next.href);
      } else if ((e.key === "k" || e.key === "ArrowLeft") && prev) {
        e.preventDefault();
        router.push(prev.href);
      }
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [pathname, router]);
}
