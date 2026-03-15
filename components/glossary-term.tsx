"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";
import { glossary } from "@/lib/glossary";

interface GlossaryTermProps {
  term: string;
  children: React.ReactNode;
}

export function GlossaryTerm({ term, children }: GlossaryTermProps) {
  const entry = glossary[term.toLowerCase()];
  if (!entry) return <>{children}</>;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="underline decoration-dotted decoration-muted-foreground/40 underline-offset-2 cursor-help">
          {children}
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs text-left">
        <p className="font-medium text-xs mb-1">{entry.term}</p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {entry.definition}
        </p>
        {entry.relatedTopicHref && (
          <Link
            href={entry.relatedTopicHref}
            className="text-[10px] text-violet-400 hover:underline mt-1 inline-block"
          >
            Learn more →
          </Link>
        )}
      </TooltipContent>
    </Tooltip>
  );
}
