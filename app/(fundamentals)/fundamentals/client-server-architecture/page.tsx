"use client";

import { useState, useEffect, useRef } from "react";
import { TopicHero } from "@/components/topic-hero";
import { FailureScenario } from "@/components/failure-scenario";
import { WhyItBreaks } from "@/components/why-it-breaks";
import { ConceptVisualizer } from "@/components/concept-visualizer";
import { CorrectApproach } from "@/components/correct-approach";
import { KeyTakeaway } from "@/components/key-takeaway";
import { AnimatedFlow } from "@/components/animated-flow";
import { ServerNode } from "@/components/server-node";
import { InteractiveDemo } from "@/components/interactive-demo";
import { ConversationalCallout } from "@/components/conversational-callout";
import { AhaMoment } from "@/components/aha-moment";
import { BeforeAfter } from "@/components/before-after";
import { MetricCounter } from "@/components/metric-counter";
import { ScaleSimulator } from "@/components/scale-simulator";
import { cn } from "@/lib/utils";
import {
  Monitor,
  Server,
  Database,
  ArrowRight,
  ArrowDown,
  Globe,
  Lock,
  Layers,
  Wifi,
  MessageSquare,
  Zap,
  Play,
  Pause,
} from "lucide-react";

// ── Custom Viz: Animated Client-Server Request-Response Cycle ──────────────
function ClientServerViz() {
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const stepRef = useRef(step);
  stepRef.current = step;

  useEffect(() => {
    if (!isPlaying) return;
    const t = setInterval(() => {
      setStep((s) => (s + 1) % 8);
    }, 1200);
    return () => clearInterval(t);
  }, [isPlaying]);

  const clients = [
    { label: "Mobile", icon: <Monitor className="size-3.5" /> },
    { label: "Browser", icon: <Globe className="size-3.5" /> },
    { label: "Desktop", icon: <Monitor className="size-3.5" /> },
  ];

  const activeClient = step < 7 ? step % 3 : -1;
  const phases = [
    "Client sends HTTP request...",
    "Request travels over the network...",
    "Server receives and processes request...",
    "Server queries database...",
    "Database returns data...",
    "Server builds response...",
    "Response sent back to client...",
    "Client renders the UI update.",
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <button
          onClick={() => setIsPlaying((p) => !p)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-violet-500/30 bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 transition-all"
        >
          {isPlaying ? <Pause className="size-3" /> : <Play className="size-3" />}
          {isPlaying ? "Pause" : "Start"}
        </button>
      </div>
      <div className="flex flex-col items-center gap-3">
        {/* Clients row */}
        <div className="flex items-center justify-center gap-6">
          {clients.map((client, i) => (
            <div key={client.label} className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "size-12 rounded-lg border-2 flex items-center justify-center transition-all duration-300",
                  i === activeClient
                    ? "border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/10"
                    : "border-border/50 bg-muted/20"
                )}
              >
                {client.icon}
              </div>
              <span className="text-[10px] text-muted-foreground">{client.label}</span>
            </div>
          ))}
        </div>

        {/* Connection arrows */}
        <div className="flex flex-col items-center text-muted-foreground/40 gap-0.5">
          <div
            className={cn(
              "flex items-center gap-1 transition-all duration-300",
              step >= 0 && step <= 1
                ? "text-blue-400"
                : step >= 6
                ? "text-emerald-400"
                : "text-muted-foreground/30"
            )}
          >
            {step >= 6 ? (
              <ArrowDown className="size-4 rotate-180" />
            ) : (
              <ArrowDown className="size-4" />
            )}
            <span className="text-[10px] font-mono">
              {step >= 6 ? "HTTP Response" : "HTTP Request"}
            </span>
          </div>
        </div>

        {/* Server */}
        <div className="flex flex-col items-center gap-1">
          <div
            className={cn(
              "size-14 rounded-lg border-2 flex items-center justify-center transition-all duration-300",
              step >= 2 && step <= 5
                ? "border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/10"
                : "border-border/50 bg-muted/20"
            )}
          >
            <Server className="size-5" />
          </div>
          <span className="text-xs font-medium">API Server</span>
          <span className="text-[10px] text-muted-foreground">Source of truth</span>
        </div>

        {/* DB connection */}
        <div className="flex flex-col items-center text-muted-foreground/40 gap-0.5">
          <div
            className={cn(
              "transition-all duration-300",
              step === 3 || step === 4
                ? "text-amber-400"
                : "text-muted-foreground/30"
            )}
          >
            <ArrowDown className={cn("size-4", step === 4 && "rotate-180")} />
          </div>
        </div>

        {/* Database */}
        <div className="flex flex-col items-center gap-1">
          <div
            className={cn(
              "size-12 rounded-lg border-2 flex items-center justify-center transition-all duration-300",
              step === 3 || step === 4
                ? "border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/10"
                : "border-border/50 bg-muted/20"
            )}
          >
            <Database className="size-4" />
          </div>
          <span className="text-[10px] text-muted-foreground">PostgreSQL</span>
        </div>
      </div>

      {/* Phase indicator */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground italic">{phases[step]}</p>
        <div className="flex items-center justify-center gap-1 mt-2">
          {phases.map((_, i) => (
            <div
              key={i}
              className={cn(
                "size-1.5 rounded-full transition-all",
                i === step ? "bg-blue-500 scale-125" : i < step ? "bg-blue-500/30" : "bg-muted/40"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Custom Viz: Request-Response Waterfall ──────────────────────────────────
function RequestResponseViz() {
  const [tick, setTick] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  useEffect(() => {
    if (!isPlaying) return;
    const t = setInterval(() => setTick((s) => (s + 1) % 8), 900);
    return () => clearInterval(t);
  }, [isPlaying]);

  const stages = [
    { name: "DNS Lookup", duration: 20, color: "bg-purple-500", textColor: "text-purple-400" },
    { name: "TCP Connect", duration: 30, color: "bg-blue-500", textColor: "text-blue-400" },
    { name: "TLS Handshake", duration: 40, color: "bg-cyan-500", textColor: "text-cyan-400" },
    { name: "Send Request", duration: 5, color: "bg-green-500", textColor: "text-green-400" },
    { name: "Server Processing", duration: 120, color: "bg-yellow-500", textColor: "text-yellow-400" },
    { name: "Response Transfer", duration: 25, color: "bg-orange-500", textColor: "text-orange-400" },
    { name: "DOM Render", duration: 35, color: "bg-red-500", textColor: "text-red-400" },
  ];

  const totalDuration = stages.reduce((a, s) => a + s.duration, 0);
  let cumulativeOffset = 0;

  return (
    <div className="space-y-1.5">
      <div className="flex justify-center mb-2">
        <button
          onClick={() => setIsPlaying((p) => !p)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-violet-500/30 bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 transition-all"
        >
          {isPlaying ? <Pause className="size-3" /> : <Play className="size-3" />}
          {isPlaying ? "Pause" : "Start"}
        </button>
      </div>
      {stages.map((stage, i) => {
        const offset = cumulativeOffset;
        cumulativeOffset += stage.duration;
        const isActive = i <= tick;
        const isCurrent = i === tick;

        return (
          <div key={stage.name} className="flex items-center gap-2">
            <span
              className={cn(
                "text-[10px] font-mono w-28 shrink-0 text-right transition-colors",
                isCurrent ? stage.textColor : isActive ? "text-muted-foreground/60" : "text-muted-foreground/25"
              )}
            >
              {stage.name}
            </span>
            <div className="flex-1 relative h-5">
              <div
                className={cn(
                  "absolute h-full rounded-sm transition-all duration-500 flex items-center justify-end px-1",
                  isActive ? stage.color : "bg-muted/20",
                  isActive ? "opacity-80" : "opacity-30",
                  isCurrent && "ring-1 ring-white/20"
                )}
                style={{
                  left: `${(offset / totalDuration) * 100}%`,
                  width: `${(stage.duration / totalDuration) * 100}%`,
                }}
              >
                {isActive && (
                  <span className="text-[8px] font-mono text-white/80 whitespace-nowrap">
                    {stage.duration}ms
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
      <div className="flex items-center justify-between pt-1 px-[7.5rem]">
        <span className="text-[9px] font-mono text-muted-foreground/40">0ms</span>
        <span className="text-[9px] font-mono text-muted-foreground/40">
          {tick >= 6 ? `Total: ${totalDuration}ms` : "..."}
        </span>
        <span className="text-[9px] font-mono text-muted-foreground/40">{totalDuration}ms</span>
      </div>
    </div>
  );
}

// ── Custom Viz: Thin vs Thick Client Comparison ─────────────────────────────
function ThinVsThickViz() {
  const [hoveredSide, setHoveredSide] = useState<"thin" | "thick" | null>(null);

  const thinWork = [
    { label: "Display HTML", pct: 15, side: "client" as const },
    { label: "Routing", pct: 10, side: "server" as const },
    { label: "Templating", pct: 15, side: "server" as const },
    { label: "Business Logic", pct: 30, side: "server" as const },
    { label: "Data Access", pct: 30, side: "server" as const },
  ];

  const thickWork = [
    { label: "UI Rendering", pct: 25, side: "client" as const },
    { label: "Routing", pct: 10, side: "client" as const },
    { label: "State Mgmt", pct: 15, side: "client" as const },
    { label: "Validation", pct: 10, side: "client" as const },
    { label: "API + DB", pct: 40, side: "server" as const },
  ];

  const renderBar = (items: typeof thinWork, label: string, hoverKey: "thin" | "thick") => {
    const clientPct = items.filter((i) => i.side === "client").reduce((a, i) => a + i.pct, 0);
    const serverPct = items.filter((i) => i.side === "server").reduce((a, i) => a + i.pct, 0);
    return (
      <div
        className="space-y-2"
        onMouseEnter={() => setHoveredSide(hoverKey)}
        onMouseLeave={() => setHoveredSide(null)}
      >
        <p className="text-xs font-semibold">{label}</p>
        <div className="flex h-8 rounded-lg overflow-hidden border border-border/30">
          {items.map((item, i) => (
            <div
              key={i}
              className={cn(
                "flex items-center justify-center transition-all duration-300 border-r border-border/20 last:border-r-0",
                item.side === "client"
                  ? "bg-blue-500/20 text-blue-400"
                  : "bg-emerald-500/20 text-emerald-400",
                hoveredSide === hoverKey && "opacity-100",
                hoveredSide !== null && hoveredSide !== hoverKey && "opacity-40"
              )}
              style={{ width: `${item.pct}%` }}
            >
              <span className="text-[8px] font-medium whitespace-nowrap px-0.5">
                {item.pct >= 15 ? item.label : ""}
              </span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span className="text-blue-400">Client: {clientPct}%</span>
          <span className="text-emerald-400">Server: {serverPct}%</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {renderBar(thinWork, "Thin Client (Server-Rendered HTML)", "thin")}
      {renderBar(thickWork, "Thick Client (React SPA)", "thick")}
      <div className="grid grid-cols-2 gap-3 text-[10px]">
        <div className="rounded-lg bg-muted/30 p-2.5">
          <p className="font-semibold text-blue-400 mb-1">Thin Client Examples</p>
          <p className="text-muted-foreground">
            Server-rendered pages (PHP, Rails, Django). The client is mostly a display.
            Fast initial load, but every interaction needs a server round trip.
          </p>
        </div>
        <div className="rounded-lg bg-muted/30 p-2.5">
          <p className="font-semibold text-emerald-400 mb-1">Thick Client Examples</p>
          <p className="text-muted-foreground">
            Single-page apps (React, Vue, Angular). The client handles routing, state, and
            rendering. Feels faster after initial load, but the JS bundle is large.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Custom Viz: Multi-Tier Architecture ─────────────────────────────────────
function MultiTierViz() {
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  useEffect(() => {
    if (!isPlaying) return;
    const t = setInterval(() => setStep((s) => (s + 1) % 7), 1100);
    return () => clearInterval(t);
  }, [isPlaying]);

  const tiers = [
    {
      name: "Presentation Tier",
      tech: "React / Browser",
      icon: <Monitor className="size-4" />,
      color: "blue",
      desc: "UI components, user interaction, client-side routing",
    },
    {
      name: "Application Tier",
      tech: "Node.js / API",
      icon: <Server className="size-4" />,
      color: "emerald",
      desc: "Business logic, authentication, validation, orchestration",
    },
    {
      name: "Data Tier",
      tech: "PostgreSQL",
      icon: <Database className="size-4" />,
      color: "amber",
      desc: "Persistent storage, queries, transactions, indexing",
    },
  ];

  const colorMap: Record<string, { bg: string; border: string; text: string; shadow: string }> = {
    blue: { bg: "bg-blue-500/10", border: "border-blue-500/40", text: "text-blue-400", shadow: "shadow-blue-500/10" },
    emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/40", text: "text-emerald-400", shadow: "shadow-emerald-500/10" },
    amber: { bg: "bg-amber-500/10", border: "border-amber-500/40", text: "text-amber-400", shadow: "shadow-amber-500/10" },
  };

  // Steps: 0=idle, 1=request at presentation, 2=request at application, 3=request at data,
  // 4=response from data, 5=response at application, 6=response at presentation
  const requestPhase = step <= 3;
  const activeIndex = step === 0 ? -1 : step <= 3 ? step - 1 : 3 - (step - 3);

  const labels = [
    "User clicks a button...",
    "Presentation tier sends API request",
    "Application tier validates and processes",
    "Data tier executes SQL query",
    "Data tier returns result set",
    "Application tier formats response",
    "Presentation tier renders updated UI",
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <button
          onClick={() => setIsPlaying((p) => !p)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-violet-500/30 bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 transition-all"
        >
          {isPlaying ? <Pause className="size-3" /> : <Play className="size-3" />}
          {isPlaying ? "Pause" : "Start"}
        </button>
      </div>
      <div className="space-y-2">
        {tiers.map((tier, i) => {
          const c = colorMap[tier.color];
          const isActive = i === activeIndex;
          return (
            <div key={tier.name}>
              <div
                className={cn(
                  "flex items-center gap-3 rounded-lg border-2 p-3 transition-all duration-300",
                  isActive
                    ? `${c.bg} ${c.border} shadow-lg ${c.shadow}`
                    : "border-border/30 bg-muted/10"
                )}
              >
                <div className={cn("transition-colors", isActive ? c.text : "text-muted-foreground/40")}>
                  {tier.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={cn("text-xs font-semibold transition-colors", isActive ? c.text : "text-muted-foreground/60")}>
                      {tier.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground/40 font-mono">{tier.tech}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground/50 mt-0.5">{tier.desc}</p>
                </div>
                {isActive && (
                  <div className={cn("text-[10px] font-mono", requestPhase ? "text-blue-400" : "text-emerald-400")}>
                    {requestPhase ? "REQ >>>" : "<<< RES"}
                  </div>
                )}
              </div>
              {i < 2 && (
                <div className="flex justify-center py-0.5">
                  <ArrowDown
                    className={cn(
                      "size-3.5 transition-all duration-300",
                      (step > 0 && ((requestPhase && i < activeIndex) || (!requestPhase && i >= activeIndex)))
                        ? "text-muted-foreground/60"
                        : "text-muted-foreground/20",
                      !requestPhase && step > 3 && "rotate-180"
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
      <p className="text-[11px] text-muted-foreground/60 text-center italic">{labels[step]}</p>
    </div>
  );
}

// ── Custom Viz: Stateless Communication ─────────────────────────────────────
function StatelessViz() {
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  useEffect(() => {
    if (!isPlaying) return;
    const t = setInterval(() => setStep((s) => (s + 1) % 4), 2000);
    return () => clearInterval(t);
  }, [isPlaying]);

  const requests = [
    {
      label: "Request 1: GET /profile",
      headers: "Authorization: Bearer eyJhb...",
      serverThinks: "Who is this? Let me check the token... OK, it's User #42.",
      response: "200 OK { name: 'Alice' }",
    },
    {
      label: "Request 2: GET /orders",
      headers: "Authorization: Bearer eyJhb...",
      serverThinks: "Who is this? I have NO memory of the last request. Let me check the token again...",
      response: "200 OK [ { order: 1001 }, ... ]",
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex justify-center">
        <button
          onClick={() => setIsPlaying((p) => !p)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-violet-500/30 bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 transition-all"
        >
          {isPlaying ? <Pause className="size-3" /> : <Play className="size-3" />}
          {isPlaying ? "Pause" : "Start"}
        </button>
      </div>
      {requests.map((req, i) => {
        const isActive = step >= i * 2 + 1;
        const showResponse = step >= i * 2 + 2 || (i === 1 && step === 0);
        return (
          <div
            key={i}
            className={cn(
              "rounded-lg border p-3 transition-all duration-500",
              isActive ? "border-blue-500/30 bg-blue-500/5" : "border-border/30 bg-muted/10"
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className={cn(
                "text-xs font-semibold transition-colors",
                isActive ? "text-blue-400" : "text-muted-foreground/40"
              )}>
                {req.label}
              </span>
            </div>
            <div className="bg-muted/30 rounded p-2 text-[10px] font-mono space-y-1">
              <p className={cn(isActive ? "text-amber-400" : "text-muted-foreground/30")}>
                <Lock className="size-2.5 inline mr-1" />
                {req.headers}
              </p>
              {isActive && (
                <p className="text-muted-foreground/60 italic">
                  Server: &quot;{req.serverThinks}&quot;
                </p>
              )}
              {(showResponse || (i === 0 && step >= 2)) && isActive && (
                <p className="text-emerald-400">{req.response}</p>
              )}
            </div>
            {i === 0 && isActive && (
              <p className="text-[10px] text-orange-400 mt-2 flex items-center gap-1">
                <Zap className="size-3" />
                Token must be sent again - server has no memory of Request 1
              </p>
            )}
          </div>
        );
      })}
      <p className="text-[10px] text-muted-foreground text-center">
        Each request must carry all the context the server needs. The server treats every request as if it has never seen the client before.
      </p>
    </div>
  );
}

// ── Custom Viz: Scaling Comparison ──────────────────────────────────────────
function ScalingComparisonViz() {
  const [mode, setMode] = useState<"vertical" | "horizontal">("vertical");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={() => setMode("vertical")}
          className={cn(
            "px-3 py-1.5 rounded-md text-xs font-medium border transition-all",
            mode === "vertical"
              ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
              : "bg-muted/30 border-border/30 text-muted-foreground/60"
          )}
        >
          Vertical Scaling
        </button>
        <button
          onClick={() => setMode("horizontal")}
          className={cn(
            "px-3 py-1.5 rounded-md text-xs font-medium border transition-all",
            mode === "horizontal"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-muted/30 border-border/30 text-muted-foreground/60"
          )}
        >
          Horizontal Scaling
        </button>
      </div>

      <div className="flex flex-col items-center gap-3 py-2">
        {mode === "vertical" ? (
          <>
            <div className="flex items-center justify-center gap-6">
              <ServerNode type="client" label="Clients" status="healthy" />
            </div>
            <ArrowDown className="size-4 text-muted-foreground/30" />
            <div className="relative">
              <div className="size-20 rounded-xl border-2 border-blue-500/40 bg-blue-500/10 flex flex-col items-center justify-center shadow-lg shadow-blue-500/10">
                <Server className="size-6 text-blue-400" />
                <span className="text-[9px] font-mono text-blue-400 mt-1">32 CPU</span>
                <span className="text-[9px] font-mono text-blue-400">128GB RAM</span>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground text-center max-w-xs">
              Bigger machine: more CPU, more RAM, faster disk.
              Simple but has a ceiling &mdash; you cannot scale a single machine infinitely.
            </p>
          </>
        ) : (
          <>
            <div className="flex items-center justify-center gap-6">
              <ServerNode type="client" label="Clients" status="healthy" />
            </div>
            <ArrowDown className="size-4 text-muted-foreground/30" />
            <ServerNode type="loadbalancer" label="Load Balancer" status="healthy" />
            <div className="flex items-center gap-1 text-muted-foreground/30">
              <ArrowDown className="size-3 -rotate-45" />
              <ArrowDown className="size-3" />
              <ArrowDown className="size-3 rotate-45" />
            </div>
            <div className="flex items-center justify-center gap-3">
              <ServerNode type="server" label="Server 1" sublabel="4 CPU" status="healthy" />
              <ServerNode type="server" label="Server 2" sublabel="4 CPU" status="healthy" />
              <ServerNode type="server" label="Server 3" sublabel="4 CPU" status="healthy" />
            </div>
            <p className="text-[10px] text-muted-foreground text-center max-w-xs">
              More machines behind a load balancer. No ceiling &mdash; add more servers as traffic grows.
              Requires stateless design so any server can handle any request.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────
export default function ClientServerArchitecturePage() {
  return (
    <div className="space-y-8">
      <TopicHero
        title="Client-Server Architecture"
        subtitle="The foundation of modern web applications. One machine asks, another answers. Simple in theory — surprisingly nuanced in practice."
        difficulty="beginner"
      />

      {/* ── 1. Failure Scenario ──────────────────────────────────────── */}
      <FailureScenario title="A peer-to-peer desktop app where everyone stores their own data">
        <p className="text-sm text-muted-foreground">
          You build a team task manager where each user stores tasks locally on their laptop.
          User A marks a task complete. User B still sees it as pending. There is no central
          authority, no synchronization, and no backup. When User A&apos;s laptop hard drive
          fails, all their data is gone forever. Two people editing the same record at the same
          time? There is no way to resolve the conflict.
        </p>
        <div className="flex items-center justify-center gap-4 py-3">
          <ServerNode type="client" label="Alice's Laptop" sublabel="Task: DONE" status="healthy" />
          <span className="text-red-500 font-mono text-sm">&ne;</span>
          <ServerNode type="client" label="Bob's Laptop" sublabel="Task: PENDING" status="warning" />
          <span className="text-red-500 font-mono text-sm">&ne;</span>
          <ServerNode type="client" label="Carol's Laptop" sublabel="DISK FAILURE" status="unhealthy" />
        </div>
        <p className="text-sm text-muted-foreground">
          Without a server, every client is an island. No consistency, no durability, no
          collaboration. This is the problem that client-server architecture solves.
        </p>
      </FailureScenario>

      {/* ── 2. Why It Breaks ─────────────────────────────────────────── */}
      <WhyItBreaks title="Peer-to-peer data is inconsistent, fragile, and insecure">
        <p className="text-sm text-muted-foreground mb-3">
          When every client manages its own data independently, three problems emerge that no
          amount of client-side code can fix.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
          <MetricCounter label="Data Inconsistency" value={67} unit="%" trend="up" />
          <MetricCounter label="Data Loss Incidents" value={12} unit="/mo" trend="up" />
          <MetricCounter label="Source of Truth" value={0} trend="neutral" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "No consistency", desc: "Each client has a different version of the data" },
            { label: "No durability", desc: "Client storage can be wiped or lost at any time" },
            { label: "No authority", desc: "When two clients disagree, who is correct?" },
            { label: "No security", desc: "Client-side code can be inspected and modified by anyone" },
          ].map((item) => (
            <div key={item.label} className="rounded-lg bg-muted/30 p-3">
              <p className="text-xs font-semibold text-orange-400">{item.label}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{item.desc}</p>
            </div>
          ))}
        </div>
      </WhyItBreaks>

      {/* ── 3. Concept: The Client-Server Model ──────────────────────── */}
      <ConceptVisualizer title="The Client-Server Model">
        <p className="text-sm text-muted-foreground mb-4">
          The fix is deceptively simple: introduce a <strong>server</strong> &mdash; a long-running
          process on a machine you control. It becomes the single source of truth. Multiple clients
          connect to the same server. The server handles data, logic, and coordination. Clients
          handle only presentation.
        </p>
        <ClientServerViz />
        <ConversationalCallout type="tip">
          &quot;Server&quot; does not mean one physical machine. It means any process that
          accepts and responds to requests &mdash; a single machine, ten machines behind a
          load balancer, or a serverless function invoked on demand.
        </ConversationalCallout>
      </ConceptVisualizer>

      {/* ── 4. Request-Response Waterfall ────────────────────────────── */}
      <ConceptVisualizer title="The Request-Response Lifecycle">
        <p className="text-sm text-muted-foreground mb-4">
          Every client-server interaction follows the same pattern. When you type a URL and press
          Enter, this entire waterfall executes in under 300ms. Understanding each phase helps you
          know where to optimize.
        </p>
        <RequestResponseViz />
        <ConversationalCallout type="question">
          Why is the server processing phase the longest? Because that is where your application
          code runs: validating input, checking permissions, querying the database, computing
          results. The network phases are largely fixed by physics, but server processing is
          where engineering effort has the most impact.
        </ConversationalCallout>
      </ConceptVisualizer>

      {/* ── 5. Thin vs Thick Client ──────────────────────────────────── */}
      <ConceptVisualizer title="Thin Client vs Thick Client">
        <p className="text-sm text-muted-foreground mb-4">
          The boundary between client and server is not fixed. You choose where to put the work.
          A thin client delegates almost everything to the server. A thick client does heavy lifting
          locally. Most modern web apps are thick clients (SPAs) that talk to thin API servers.
        </p>
        <ThinVsThickViz />
      </ConceptVisualizer>

      {/* ── 6. Stateless Communication ───────────────────────────────── */}
      <ConceptVisualizer title="Stateless Communication">
        <p className="text-sm text-muted-foreground mb-4">
          In HTTP, each request is independent. The server does not remember previous requests
          from the same client. This means every request must carry all the context the server
          needs &mdash; authentication tokens, session identifiers, and any relevant state.
          This is what makes horizontal scaling possible.
        </p>
        <StatelessViz />
        <AhaMoment
          question="Why is statelessness a feature, not a limitation?"
          answer={
            <p>
              If the server stores no client state, any server in a cluster can handle any
              request. A load balancer can route traffic to whichever server is free. If a
              server crashes, another picks up the next request with no data lost. Statelessness
              is the foundation of horizontal scaling.
            </p>
          }
        />
      </ConceptVisualizer>

      {/* ── 7. Multi-Tier Architecture ───────────────────────────────── */}
      <ConceptVisualizer title="Multi-Tier Architecture">
        <p className="text-sm text-muted-foreground mb-4">
          As applications grow, the &quot;server&quot; splits into tiers, each with a distinct
          responsibility. The most common pattern is 3-tier: presentation, application, and data.
          Watch a user request flow through all three tiers and back.
        </p>
        <MultiTierViz />
        <ConversationalCallout type="tip">
          Each tier can scale independently. If your database is the bottleneck, you add read
          replicas without touching the application tier. If your API is CPU-bound, you add
          more application servers. This independence is the key benefit of tiered architecture.
        </ConversationalCallout>
      </ConceptVisualizer>

      {/* ── 8. Scaling the Server ────────────────────────────────────── */}
      <ConceptVisualizer title="Scaling the Server">
        <p className="text-sm text-muted-foreground mb-4">
          When one server is not enough to handle the load, you have two options: make the
          server bigger (vertical scaling) or add more servers (horizontal scaling). Toggle
          between them to see the difference.
        </p>
        <ScalingComparisonViz />
      </ConceptVisualizer>

      {/* ── 9. Before/After ──────────────────────────────────────────── */}
      <BeforeAfter
        before={{
          title: "P2P Chaos",
          content: (
            <div className="space-y-2 text-xs text-muted-foreground">
              <p>Every client has different data</p>
              <p>No backups &mdash; laptop dies, data dies</p>
              <p>No access control &mdash; anyone can read/write anything</p>
              <p>Conflicts are unresolvable</p>
              <p className="text-red-400 font-semibold mt-2">Result: unusable beyond a single user</p>
            </div>
          ),
        }}
        after={{
          title: "Client-Server",
          content: (
            <div className="space-y-2 text-xs text-muted-foreground">
              <p>Single source of truth for all data</p>
              <p>Centralized backups and replication</p>
              <p>Server enforces authentication and authorization</p>
              <p>Conflicts resolved by server logic</p>
              <p className="text-emerald-400 font-semibold mt-2">Result: reliable multi-user system</p>
            </div>
          ),
        }}
      />

      {/* ── 10. Interactive Demo: Single vs Multi-threaded ───────────── */}
      <InteractiveDemo title="Single-Threaded vs Multi-Threaded Server" intervalMs={600}>
        {({ isPlaying, tick }) => {
          const totalRequests = 8;
          const singleProgress = isPlaying ? Math.min(tick, totalRequests) : 0;
          const multiWorkers = 4;
          const multiProgress = isPlaying ? Math.min(tick * multiWorkers, totalRequests) : 0;

          const singleCompleted = singleProgress;
          const multiCompleted = Math.min(multiProgress, totalRequests);

          const singleLatency = singleCompleted > 0 ? singleCompleted * 120 : 0;
          const multiLatency = multiCompleted > 0 ? Math.ceil(multiCompleted / multiWorkers) * 120 : 0;

          return (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Press play to simulate {totalRequests} client requests arriving at a server. Compare
                a single-threaded server (processes one at a time) vs a multi-threaded server
                (processes {multiWorkers} at a time).
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Single-threaded */}
                <div className="rounded-lg border p-3 space-y-2">
                  <p className="text-xs font-semibold text-orange-400">Single-Threaded (1 worker)</p>
                  <div className="flex flex-wrap gap-1">
                    {Array.from({ length: totalRequests }, (_, i) => (
                      <div
                        key={i}
                        className={cn(
                          "size-7 rounded border flex items-center justify-center text-[10px] font-mono transition-all duration-300",
                          i < singleCompleted
                            ? "bg-orange-500/20 border-orange-500/30 text-orange-400"
                            : i === singleCompleted && isPlaying
                            ? "bg-orange-500/10 border-orange-500/20 text-orange-300 animate-pulse"
                            : "bg-muted/20 border-border/30 text-muted-foreground/30"
                        )}
                      >
                        {i + 1}
                      </div>
                    ))}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    Completed: {singleCompleted}/{totalRequests} &middot; Elapsed: {singleLatency}ms
                  </div>
                </div>
                {/* Multi-threaded */}
                <div className="rounded-lg border p-3 space-y-2">
                  <p className="text-xs font-semibold text-emerald-400">Multi-Threaded ({multiWorkers} workers)</p>
                  <div className="flex flex-wrap gap-1">
                    {Array.from({ length: totalRequests }, (_, i) => (
                      <div
                        key={i}
                        className={cn(
                          "size-7 rounded border flex items-center justify-center text-[10px] font-mono transition-all duration-300",
                          i < multiCompleted
                            ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
                            : i < multiCompleted + multiWorkers && isPlaying
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300 animate-pulse"
                            : "bg-muted/20 border-border/30 text-muted-foreground/30"
                        )}
                      >
                        {i + 1}
                      </div>
                    ))}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    Completed: {multiCompleted}/{totalRequests} &middot; Elapsed: {multiLatency}ms
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <MetricCounter label="Single Throughput" value={singleCompleted > 0 ? Math.round(1000 / 120) : 0} unit="req/s" trend="neutral" />
                <MetricCounter label="Multi Throughput" value={multiCompleted > 0 ? Math.round((1000 / 120) * multiWorkers) : 0} unit="req/s" trend="neutral" />
                <MetricCounter label="Single Latency" value={120 * Math.max(singleCompleted, 1)} unit="ms" trend="up" />
                <MetricCounter label="Multi Latency" value={120 * Math.ceil(Math.max(multiCompleted, 1) / multiWorkers)} unit="ms" trend="down" />
              </div>
            </div>
          );
        }}
      </InteractiveDemo>

      {/* ── 11. Scale Simulator ──────────────────────────────────────── */}
      <ScaleSimulator
        title="Server Load Simulator"
        min={10}
        max={10000}
        step={100}
        unit="concurrent users"
        metrics={(value) => [
          { label: "Requests/sec", value: Math.round(value * 2.5), unit: "req/s" },
          { label: "Avg Response Time", value: Math.round(50 + (value > 2000 ? (value - 2000) * 0.15 : 0) + (value > 5000 ? (value - 5000) * 0.8 : 0)), unit: "ms" },
          { label: "Servers Needed", value: Math.max(1, Math.ceil(value / 2000)), unit: "" },
        ]}
      >
        {({ value }) => {
          const servers = Math.max(1, Math.ceil(value / 2000));
          const responseTime = 50 + (value > 2000 ? (value - 2000) * 0.15 : 0) + (value > 5000 ? (value - 5000) * 0.8 : 0);
          return (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Drag the slider to increase concurrent users. Watch how response time degrades
                as load increases, and when you need to add more servers.
              </p>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                {servers > 1 && (
                  <ServerNode type="loadbalancer" label="Load Balancer" status="healthy" />
                )}
                {Array.from({ length: Math.min(servers, 5) }, (_, i) => (
                  <ServerNode
                    key={i}
                    type="server"
                    label={`Server ${i + 1}`}
                    sublabel={`${Math.round(value / servers)} users`}
                    status={
                      value / servers > 1800
                        ? "unhealthy"
                        : value / servers > 1200
                        ? "warning"
                        : "healthy"
                    }
                  />
                ))}
                {servers > 5 && (
                  <span className="text-xs text-muted-foreground">+{servers - 5} more</span>
                )}
              </div>
              {responseTime > 500 && (
                <ConversationalCallout type="warning">
                  Response time has exceeded 500ms. Users will start noticing lag. Consider adding
                  more servers or introducing caching to reduce per-request processing time.
                </ConversationalCallout>
              )}
            </div>
          );
        }}
      </ScaleSimulator>

      {/* ── 12. Aha Moment ───────────────────────────────────────────── */}
      <AhaMoment
        question="Wait — so every website I use is client-server?"
        answer={
          <p>
            Yes. Every single one. Your browser is the client. When you type a URL, you are
            sending a request to a server. The HTML that comes back is the response. Your browser
            renders it. When you click a button, another request is sent, another response comes
            back. That is the entire model. Social media, banking, email, streaming &mdash; it is
            all client-server. The rest of system design is about making this pattern work at scale.
          </p>
        }
      />

      {/* ── 13. Modern Variations ────────────────────────────────────── */}
      <ConceptVisualizer title="Modern Variations of Client-Server">
        <p className="text-sm text-muted-foreground mb-4">
          The basic request-response model has evolved. Modern applications use different protocols
          depending on their needs, but they all follow the client-server pattern.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            {
              icon: <Globe className="size-4" />,
              name: "REST APIs",
              desc: "Stateless request-response over HTTP. The default choice for most web APIs. Each request is independent.",
              color: "border-blue-500/20 bg-blue-500/5",
              textColor: "text-blue-400",
            },
            {
              icon: <Wifi className="size-4" />,
              name: "WebSockets",
              desc: "Persistent bi-directional connection. Server can push data to the client without waiting for a request. Used for chat, real-time updates.",
              color: "border-emerald-500/20 bg-emerald-500/5",
              textColor: "text-emerald-400",
            },
            {
              icon: <MessageSquare className="size-4" />,
              name: "GraphQL",
              desc: "Client specifies exactly what data it needs in the request. Avoids over-fetching and under-fetching. One endpoint for all queries.",
              color: "border-purple-500/20 bg-purple-500/5",
              textColor: "text-purple-400",
            },
            {
              icon: <Zap className="size-4" />,
              name: "gRPC",
              desc: "Binary protocol using Protocol Buffers. Much faster than JSON over HTTP. Used for microservice-to-microservice communication.",
              color: "border-amber-500/20 bg-amber-500/5",
              textColor: "text-amber-400",
            },
          ].map((variation) => (
            <div key={variation.name} className={cn("rounded-lg border p-3", variation.color)}>
              <div className="flex items-center gap-2 mb-1.5">
                <span className={variation.textColor}>{variation.icon}</span>
                <span className={cn("text-xs font-semibold", variation.textColor)}>{variation.name}</span>
              </div>
              <p className="text-[11px] text-muted-foreground">{variation.desc}</p>
            </div>
          ))}
        </div>
        <ConversationalCallout type="question">
          WebSockets seem to break the stateless model &mdash; the connection is persistent.
          Is this still client-server? Yes. The server still holds the data and logic. The client
          still initiates the connection. The only difference is that the server can now push
          updates without waiting for the client to ask. The roles have not changed.
        </ConversationalCallout>
      </ConceptVisualizer>

      {/* ── 14. Never Trust the Client ───────────────────────────────── */}
      <CorrectApproach title="The Golden Rule: Never Trust the Client">
        <p className="text-sm text-muted-foreground mb-3">
          The client is for presentation. The server is for data integrity and business rules.
          Anyone can open DevTools and modify client-side code. Security, validation, and
          authorization must always happen on the server.
        </p>
        <BeforeAfter
          before={{
            title: "Dangerous: Logic on client",
            content: (
              <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground mb-2">Anyone can open DevTools and bypass this:</p>
                <div className="bg-muted/30 p-2.5 rounded-lg text-xs font-mono space-y-0.5">
                  <p className="text-red-400">{'if (user.role === "admin")'}</p>
                  <p className="text-red-400 pl-3">{'showDeleteButton();'}</p>
                  <p className="text-red-400 mt-1.5">{'const total = qty * price;'}</p>
                  <p className="text-red-400 pl-3">{'// user can change price in memory'}</p>
                </div>
              </div>
            ),
          }}
          after={{
            title: "Safe: Logic on server",
            content: (
              <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground mb-2">Server validates every request:</p>
                <div className="bg-muted/30 p-2.5 rounded-lg text-xs font-mono space-y-0.5">
                  <p className="text-emerald-400">{'if (!hasPermission(user, "delete"))'}</p>
                  <p className="text-emerald-400 pl-3">{'return 403 Forbidden;'}</p>
                  <p className="text-emerald-400 mt-1.5">{'total = calculatePrice(order);'}</p>
                  <p className="text-emerald-400 pl-3">{'// price comes from DB, not client'}</p>
                </div>
              </div>
            ),
          }}
        />
      </CorrectApproach>

      {/* ── 15. Interview Warning ────────────────────────────────────── */}
      <ConversationalCallout type="warning">
        Interview trap: describing a system where the client directly queries the database.
        The server exists to enforce rules, validate input, and prevent unauthorized access.
        Without it, anyone with an HTTP client can read or modify your entire database.
        Always put a server between the client and the data store.
      </ConversationalCallout>

      {/* ── 16. Key Takeaway ─────────────────────────────────────────── */}
      <KeyTakeaway
        points={[
          "Client-server separates concerns: clients handle presentation, servers handle data and business logic. This separation is the foundation of every web application.",
          "Never trust the client — security, validation, pricing, and authorization must always happen server-side. Client code can be inspected and modified by anyone.",
          "The server is the single source of truth. Without it, clients have inconsistent, ephemeral data with no way to coordinate.",
          "Stateless communication (each request carries all needed context) enables horizontal scaling — any server can handle any request.",
          "A single server is a single point of failure — this tension drives load balancing, replication, and failover patterns covered in the Scaling topics.",
          "In interviews, always identify what is the client and what is the server before diving into architecture details. This frames every design decision that follows.",
        ]}
      />
    </div>
  );
}
