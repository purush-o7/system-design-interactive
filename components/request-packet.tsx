"use client";

import { cn } from "@/lib/utils";

interface RequestPacketProps {
  label?: string;
  type?: "request" | "response" | "error";
  animate?: boolean;
  className?: string;
}

export function RequestPacket({
  label = "REQ",
  type = "request",
  animate = true,
  className,
}: RequestPacketProps) {
  const colors = {
    request: "bg-blue-500 text-white",
    response: "bg-green-500 text-white",
    error: "bg-red-500 text-white",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-mono font-bold",
        colors[type],
        animate && "animate-pulse",
        className
      )}
    >
      {label}
    </span>
  );
}
