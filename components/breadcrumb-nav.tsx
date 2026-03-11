"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { Fragment } from "react";
import { labelMap } from "@/lib/topics";

export function BreadcrumbNav() {
  const pathname = usePathname();

  if (pathname === "/") return null;

  const segments = pathname.split("/").filter(Boolean);

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground">
      <Link href="/" aria-label="Home" className="hover:text-foreground transition-colors">
        <Home className="size-3.5" />
      </Link>
      {segments.map((segment, i) => {
        const href = "/" + segments.slice(0, i + 1).join("/");
        const isLast = i === segments.length - 1;
        const label = labelMap[segment] || segment.replace(/-/g, " ");

        return (
          <Fragment key={href}>
            <ChevronRight className="size-3 text-muted-foreground/50" />
            {isLast ? (
              <span aria-current="page" className="text-foreground font-medium truncate max-w-[200px]">
                {label}
              </span>
            ) : (
              <Link
                href={href}
                className="hover:text-foreground transition-colors truncate max-w-[150px]"
              >
                {label}
              </Link>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}
