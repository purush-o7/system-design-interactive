"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getAdjacentTopics } from "@/lib/topics";

export function TopicNav() {
  const pathname = usePathname();
  const { prev, next } = getAdjacentTopics(pathname);

  if (!prev && !next) return null;

  return (
    <nav aria-label="Topic pagination" className="flex items-center justify-between border-t pt-8 mt-12">
      {prev ? (
        <Link
          href={prev.href}
          className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
          <div className="text-left">
            <div className="text-[10px] text-muted-foreground/50 uppercase tracking-wider">
              {prev.category}
            </div>
            <div className="text-xs text-muted-foreground/70">Previous</div>
            <div className="font-medium">{prev.label}</div>
          </div>
        </Link>
      ) : (
        <div />
      )}
      {next ? (
        <Link
          href={next.href}
          className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors text-right"
        >
          <div>
            <div className="text-[10px] text-muted-foreground/50 uppercase tracking-wider">
              {next.category}
            </div>
            <div className="text-xs text-muted-foreground/70">Next</div>
            <div className="font-medium">{next.label}</div>
          </div>
          <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      ) : (
        <div />
      )}
    </nav>
  );
}
