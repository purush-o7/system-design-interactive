"use client";

import { Info, AlertTriangle, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Fade } from "@/components/animate-ui/primitives/effects/fade";

type CalloutType = "tip" | "warning" | "question";

const config = {
  tip: {
    icon: Info,
    border: "border-blue-500/20",
    bg: "bg-blue-500/[0.03]",
    headerBg: "bg-blue-500/[0.04]",
    text: "text-blue-400",
    label: "Tip",
  },
  warning: {
    icon: AlertTriangle,
    border: "border-amber-500/20",
    bg: "bg-amber-500/[0.03]",
    headerBg: "bg-amber-500/[0.04]",
    text: "text-amber-400",
    label: "Warning",
  },
  question: {
    icon: HelpCircle,
    border: "border-violet-500/20",
    bg: "bg-violet-500/[0.03]",
    headerBg: "bg-violet-500/[0.04]",
    text: "text-violet-400",
    label: "Think about it",
  },
};

interface ConversationalCalloutProps {
  type: CalloutType;
  children: React.ReactNode;
}

export function ConversationalCallout({ type, children }: ConversationalCalloutProps) {
  const c = config[type];
  const Icon = c.icon;

  return (
    <Fade inView inViewMargin="-50px">
      <div className={cn("rounded-lg border flex items-start gap-3 px-4 py-3", c.border, c.bg)}>
        <Icon className={cn("size-4 mt-0.5 shrink-0", c.text)} />
        <div className="text-sm text-muted-foreground leading-relaxed">{children}</div>
      </div>
    </Fade>
  );
}
