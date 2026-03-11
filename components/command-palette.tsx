"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { categories } from "@/lib/topics";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-md border border-border/50 bg-muted/30 px-2.5 py-1 text-xs text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
      >
        <Search className="size-4 sm:hidden" />
        <span className="hidden sm:inline">Search topics...</span>
        <kbd className="pointer-events-none hidden sm:inline-flex h-5 items-center gap-0.5 rounded border border-border/50 bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground/70">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Search Topics"
        description="Search across all system design topics"
        showCloseButton={false}
      >
        <CommandInput placeholder="Search topics..." />
        <CommandList>
          <CommandEmpty>No topics found.</CommandEmpty>
          {categories.map((category) => (
            <CommandGroup key={category.slug} heading={category.label}>
              {category.topics.map((topic) => {
                const Icon = topic.icon;
                return (
                  <CommandItem
                    key={topic.href}
                    value={`${topic.label} ${category.label}`}
                    onSelect={() => handleSelect(topic.href)}
                  >
                    <Icon className="size-4 text-muted-foreground" />
                    <span>{topic.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}
