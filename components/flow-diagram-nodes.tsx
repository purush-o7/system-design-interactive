"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import {
  Server,
  Database,
  HardDrive,
  Monitor,
  Network,
  Mail,
  DoorOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface FlowNodeData extends Record<string, unknown> {
  label: string;
  sublabel?: string;
  status?: "healthy" | "unhealthy" | "warning" | "idle";
  metrics?: { label: string; value: string }[];
  handles?: {
    top?: boolean;
    bottom?: boolean;
    left?: boolean;
    right?: boolean;
  };
}

const statusColors: Record<string, string> = {
  healthy: "border-emerald-500/40 bg-emerald-500/[0.06]",
  unhealthy: "border-red-500/40 bg-red-500/[0.06]",
  warning: "border-amber-500/40 bg-amber-500/[0.06]",
  idle: "border-border/40 bg-muted/30",
};

const statusDot: Record<string, string> = {
  healthy: "bg-emerald-500",
  unhealthy: "bg-red-500",
  warning: "bg-amber-500",
  idle: "bg-muted-foreground/30",
};

function NodeShell({
  data,
  selected,
  icon: Icon,
  iconColor,
  children,
}: {
  data: FlowNodeData;
  selected?: boolean;
  icon: typeof Server;
  iconColor: string;
  children?: React.ReactNode;
}) {
  const status = data.status ?? "idle";
  const handles = data.handles ?? { top: true, bottom: true };

  return (
    <div
      className={cn(
        "rounded-lg border px-3 py-2 shadow-sm transition-all min-w-[120px]",
        statusColors[status],
        selected && "ring-2 ring-violet-500/50"
      )}
    >
      {handles.top && <Handle type="target" position={Position.Top} className="!bg-violet-500 !w-2 !h-2 !border-0" />}
      {handles.bottom && <Handle type="source" position={Position.Bottom} className="!bg-violet-500 !w-2 !h-2 !border-0" />}
      {handles.left && <Handle type="target" position={Position.Left} className="!bg-violet-500 !w-2 !h-2 !border-0" />}
      {handles.right && <Handle type="source" position={Position.Right} className="!bg-violet-500 !w-2 !h-2 !border-0" />}

      <div className="flex items-center gap-2">
        <Icon className={cn("size-4 shrink-0", iconColor)} />
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium text-foreground truncate">{data.label}</div>
          {data.sublabel && (
            <div className="text-[10px] text-muted-foreground truncate">{data.sublabel}</div>
          )}
        </div>
        <div className={cn("size-2 rounded-full shrink-0", statusDot[status])} />
      </div>

      {data.metrics && data.metrics.length > 0 && (
        <div className="mt-1.5 flex gap-3 border-t border-border/20 pt-1.5">
          {data.metrics.map((m) => (
            <div key={m.label} className="text-center">
              <div className="text-[10px] text-muted-foreground">{m.label}</div>
              <div className="text-xs font-mono font-medium text-foreground">{m.value}</div>
            </div>
          ))}
        </div>
      )}

      {children}
    </div>
  );
}

export const FlowServerNode = memo(function FlowServerNode({
  data,
  selected,
}: NodeProps) {
  return <NodeShell data={data as FlowNodeData} selected={selected} icon={Server} iconColor="text-blue-400" />;
});

export const FlowDatabaseNode = memo(function FlowDatabaseNode({
  data,
  selected,
}: NodeProps) {
  return <NodeShell data={data as FlowNodeData} selected={selected} icon={Database} iconColor="text-amber-400" />;
});

export const FlowCacheNode = memo(function FlowCacheNode({
  data,
  selected,
}: NodeProps) {
  return <NodeShell data={data as FlowNodeData} selected={selected} icon={HardDrive} iconColor="text-orange-400" />;
});

export const FlowClientNode = memo(function FlowClientNode({
  data,
  selected,
}: NodeProps) {
  return <NodeShell data={data as FlowNodeData} selected={selected} icon={Monitor} iconColor="text-teal-400" />;
});

export const FlowLoadBalancerNode = memo(function FlowLoadBalancerNode({
  data,
  selected,
}: NodeProps) {
  return <NodeShell data={data as FlowNodeData} selected={selected} icon={Network} iconColor="text-violet-400" />;
});

export const FlowQueueNode = memo(function FlowQueueNode({
  data,
  selected,
}: NodeProps) {
  return <NodeShell data={data as FlowNodeData} selected={selected} icon={Mail} iconColor="text-cyan-400" />;
});

export const FlowGatewayNode = memo(function FlowGatewayNode({
  data,
  selected,
}: NodeProps) {
  return <NodeShell data={data as FlowNodeData} selected={selected} icon={DoorOpen} iconColor="text-pink-400" />;
});
