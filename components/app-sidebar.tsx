"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, BookOpen } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuAction,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { sidebarGroups, type Category } from "@/lib/topics";

function CategoryItem({
  category,
  pathname,
  isOpen,
  onToggle,
}: {
  category: Category;
  pathname: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <Collapsible asChild open={isOpen} onOpenChange={onToggle}>
      <SidebarMenuItem>
        <SidebarMenuButton
          asChild
          isActive={pathname === category.href}
          tooltip={category.label}
          className="group/btn"
        >
          <Link href={category.href}>
            <category.icon className="transition-transform duration-200 group-hover/btn:scale-110" />
            <span>{category.label}</span>
          </Link>
        </SidebarMenuButton>
        <CollapsibleTrigger asChild>
          <SidebarMenuAction className="data-[state=open]:rotate-90 transition-transform duration-200">
            <ChevronRight />
          </SidebarMenuAction>
        </CollapsibleTrigger>
        <CollapsibleContent className="transition-all duration-200 ease-in-out data-[state=closed]:opacity-0 data-[state=open]:opacity-100">
          <SidebarMenuSub>
            {category.topics.map((topic) => (
              <SidebarMenuSubItem key={topic.href}>
                <SidebarMenuSubButton
                  asChild
                  isActive={pathname === topic.href}
                  className="transition-all duration-150 hover:translate-x-0.5"
                >
                  <Link href={topic.href}>
                    <span className="font-mono text-xs">{topic.label}</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

function getActiveCategorySlug(pathname: string): string | null {
  for (const group of sidebarGroups) {
    for (const category of group.categories) {
      if (
        pathname === category.href ||
        category.topics.some((t) => pathname === t.href)
      ) {
        return category.slug;
      }
    }
  }
  return null;
}

export function AppSidebar() {
  const pathname = usePathname();
  const [openSlugs, setOpenSlugs] = useState<Set<string>>(() => {
    const active = getActiveCategorySlug(pathname);
    return active ? new Set([active]) : new Set();
  });

  useEffect(() => {
    const active = getActiveCategorySlug(pathname);
    if (active) {
      setOpenSlugs((prev) => {
        if (prev.has(active)) return prev;
        const next = new Set(prev);
        next.add(active);
        return next;
      });
    }
  }, [pathname]);

  const handleToggle = useCallback((slug: string) => {
    setOpenSlugs((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
      }
      return next;
    });
  }, []);

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Link href="/" className="flex items-center gap-2">
          <BookOpen className="size-5" />
          <div>
            <p className="text-sm font-semibold leading-none">
              System Design
            </p>
            <p className="text-xs text-muted-foreground">
              Interactive Guide
            </p>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {sidebarGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.categories.map((category) => (
                  <CategoryItem
                    key={category.href}
                    category={category}
                    pathname={pathname}
                    isOpen={openSlugs.has(category.slug)}
                    onToggle={() => handleToggle(category.slug)}
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="p-4">
        <p className="text-xs text-muted-foreground text-center">
          {sidebarGroups.flatMap((g) => g.categories).flatMap((c) => c.topics).length} topics across{" "}
          {sidebarGroups.flatMap((g) => g.categories).length} categories
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}
