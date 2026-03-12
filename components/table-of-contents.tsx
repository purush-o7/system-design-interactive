"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

export function TableOfContents() {
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const pathname = usePathname();
  const scrollContainerRef = useRef<Element | null>(null);

  const scanHeadings = useCallback(() => {
    const container = document.querySelector(
      '[data-scroll-container]'
    );
    scrollContainerRef.current = container;

    const root = container || document;
    const elements = root.querySelectorAll("h2, h3");
    const items: TocItem[] = [];

    elements.forEach((el, i) => {
      if (!el.id) {
        el.id = el.textContent
          ?.toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^\w-]/g, '') || `section-${i}`;
      }
      items.push({
        id: el.id,
        text: el.textContent || "",
        level: el.tagName === "H2" ? 2 : 3,
      });
    });

    setHeadings(items);
    setActiveId("");
  }, []);

  useEffect(() => {
    const timeout = setTimeout(scanHeadings, 100);
    return () => clearTimeout(timeout);
  }, [pathname, scanHeadings]);

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting);
        if (visible?.target.id) {
          setActiveId(visible.target.id);
        }
      },
      {
        root: scrollContainerRef.current,
        rootMargin: "-80px 0px -70% 0px",
        threshold: 0,
      }
    );

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  const h2Count = headings.filter((h) => h.level === 2).length;
  if (h2Count < 3) return null;

  return (
    <aside className="hidden xl:flex w-56 shrink-0 flex-col border-l">
      <nav aria-label="Table of contents" className="flex-1 overflow-y-auto py-6 px-4">
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground/50 mb-2 font-medium">
            On this page
          </p>
          {headings.map((heading) => (
            <a
              key={heading.id}
              href={`#${heading.id}`}
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById(heading.id);
                if (el && scrollContainerRef.current) {
                  const container = scrollContainerRef.current;
                  const elTop = el.getBoundingClientRect().top;
                  const containerTop =
                    container.getBoundingClientRect().top;
                  container.scrollBy({
                    top: elTop - containerTop - 80,
                    behavior: "smooth",
                  });
                }
              }}
              className={cn(
                "block py-1 border-l-2 transition-all duration-200 truncate",
                heading.level === 3 ? "pl-6 text-[10px]" : "pl-3 text-xs",
                activeId === heading.id
                  ? "border-foreground text-foreground font-medium"
                  : "border-transparent text-muted-foreground/60 hover:text-muted-foreground hover:border-muted-foreground/30"
              )}
            >
              {heading.text}
            </a>
          ))}
        </div>
      </nav>
    </aside>
  );
}
