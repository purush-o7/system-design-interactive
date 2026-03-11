"use client";

import { Server, Database, Globe, Cloud, HardDrive, Network } from "lucide-react";
import { cn } from "@/lib/utils";

type NodeType = "server" | "database" | "client" | "cloud" | "cache" | "loadbalancer";

const nodeConfig: Record<NodeType, { icon: typeof Server; color: string; bg: string }> = {
  server: { icon: Server, color: "text-blue-400", bg: "bg-blue-500/8 border-blue-500/20" },
  database: { icon: Database, color: "text-amber-400", bg: "bg-amber-500/8 border-amber-500/20" },
  client: { icon: Globe, color: "text-emerald-400", bg: "bg-emerald-500/8 border-emerald-500/20" },
  cloud: { icon: Cloud, color: "text-violet-400", bg: "bg-violet-500/8 border-violet-500/20" },
  cache: { icon: HardDrive, color: "text-orange-400", bg: "bg-orange-500/8 border-orange-500/20" },
  loadbalancer: { icon: Network, color: "text-cyan-400", bg: "bg-cyan-500/8 border-cyan-500/20" },
};

interface ServerNodeProps {
  type?: NodeType;
  label: string;
  sublabel?: string;
  status?: "healthy" | "unhealthy" | "warning" | "idle";
  className?: string;
}

const statusIndicator: Record<string, string> = {
  healthy: "bg-emerald-500",
  unhealthy: "bg-red-500 animate-pulse",
  warning: "bg-amber-500",
  idle: "bg-muted-foreground/30",
};

export function ServerNode({
  type = "server",
  label,
  sublabel,
  status = "healthy",
  className,
}: ServerNodeProps) {
  const { icon: Icon, color, bg } = nodeConfig[type];

  return (
    <div
      className={cn(
        "relative flex flex-col items-center gap-1.5 rounded-xl border px-4 py-3 transition-all",
        bg,
        className
      )}
    >
      <div className={cn("absolute top-2 right-2 size-2 rounded-full", statusIndicator[status])} />
      <Icon className={cn("size-5", color)} />
      <span className="text-xs font-medium leading-tight text-center">{label}</span>
      {sublabel && (
        <span className="text-[10px] text-muted-foreground leading-tight text-center">{sublabel}</span>
      )}
    </div>
  );
}
