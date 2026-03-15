"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { TopicHero } from "@/components/topic-hero";
import { KeyTakeaway } from "@/components/key-takeaway";
import { AhaMoment } from "@/components/aha-moment";
import { ConversationalCallout } from "@/components/conversational-callout";
import { BeforeAfter } from "@/components/before-after";
import { FlowDiagram, type FlowNode, type FlowEdge } from "@/components/flow-diagram";
import { LiveChart } from "@/components/live-chart";
import { Playground } from "@/components/playground";
import { useSimulation } from "@/hooks/use-simulation";
import { cn } from "@/lib/utils";
import { WhyCare } from "@/components/why-care";
import { GlossaryTerm } from "@/components/glossary-term";
import { TopicQuiz } from "@/components/topic-quiz";
import { MarkerType } from "@xyflow/react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Database,
  Activity,
  Shield,
  XCircle,
  Zap,
} from "lucide-react";

// ─── RTO / RPO Timeline Playground ───────────────────────────────────────────

interface DrStrategy {
  name: string;
  rpoSeconds: number;
  rtoSeconds: number;
  costTier: number;
  color: string;
  colorBg: string;
  colorBorder: string;
  colorText: string;
  description: string;
  mechanism: string;
}

const DR_STRATEGIES: DrStrategy[] = [
  {
    name: "Backup & Restore",
    rpoSeconds: 21600,
    rtoSeconds: 28800,
    costTier: 1,
    color: "gray",
    colorBg: "bg-slate-500/5",
    colorBorder: "border-slate-500/20",
    colorText: "text-slate-400",
    description: "Periodic snapshots copied to another region. Restore means launching new infrastructure and loading the backup.",
    mechanism: "S3 cross-region replication. RDS automated backups. Manual recovery runbook.",
  },
  {
    name: "Pilot Light",
    rpoSeconds: 600,
    rtoSeconds: 1800,
    costTier: 2,
    color: "amber",
    colorBg: "bg-amber-500/5",
    colorBorder: "border-amber-500/20",
    colorText: "text-amber-400",
    description: "Core database replicates continuously. Compute is pre-configured but stopped. Start it on failover.",
    mechanism: "RDS read replica always running. AMIs pre-built. EC2 ASG at 0 capacity until needed.",
  },
  {
    name: "Warm Standby",
    rpoSeconds: 30,
    rtoSeconds: 300,
    costTier: 3,
    color: "blue",
    colorBg: "bg-blue-500/5",
    colorBorder: "border-blue-500/20",
    colorText: "text-blue-400",
    description: "Scaled-down but fully functional copy runs in DR region. Scale up and switch DNS on failover.",
    mechanism: "Full stack at 20% capacity. DB with async replication. Route53 failover record.",
  },
  {
    name: "Multi-Site Active",
    rpoSeconds: 1,
    rtoSeconds: 10,
    costTier: 4,
    color: "emerald",
    colorBg: "bg-emerald-500/5",
    colorBorder: "border-emerald-500/20",
    colorText: "text-emerald-400",
    description: "Full production in 2+ regions, both serving live traffic. Health checks auto-shift traffic on failure.",
    mechanism: "DynamoDB Global Tables or Aurora Global DB. Route53 health-check routing. Active-active.",
  },
];

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}min`;
  return `${Math.round(seconds / 3600)}hr`;
}

function RtoRpoPlayground() {
  const [selected, setSelected] = useState(2); // warm standby default
  const strategy = DR_STRATEGIES[selected];

  // Timeline data: simulate a disaster and recovery
  const [timelineData, setTimelineData] = useState<{ t: string; status: number }[]>([]);
  const sim = useSimulation({ intervalMs: 600, maxSteps: 40 });

  useEffect(() => {
    if (!sim.isPlaying && sim.tick === 0) {
      setTimelineData([]);
      return;
    }
    const tick = sim.tick;
    // 0-5: normal, 6: disaster, 7-N: recovery based on strategy
    const rtoTicks = Math.max(1, Math.ceil(strategy.rtoSeconds / 300)); // scale to ticks
    let status: number;
    if (tick < 6) {
      status = 100;
    } else if (tick === 6) {
      status = 0;
    } else if (tick <= 6 + rtoTicks) {
      const progress = (tick - 6) / rtoTicks;
      status = Math.round(progress * 100);
    } else {
      status = 100;
    }
    setTimelineData((prev) => [
      ...prev.slice(-39),
      { t: `${tick}`, status },
    ]);
  }, [sim.tick, sim.isPlaying, strategy.rtoSeconds]);

  const recoveryData = DR_STRATEGIES.map((s) => ({
    name: s.name.split(" ")[0],
    rto: Math.max(1, Math.round(s.rtoSeconds / 60)),
    rpo: Math.max(1, Math.round(s.rpoSeconds / 60)),
  }));

  return (
    <Playground
      title="RTO / RPO Playground — select a DR strategy and simulate a disaster"
      simulation={sim}
      canvasHeight="min-h-[360px]"
      hints={["Select different DR strategies and press play to compare recovery times"]}
      canvas={
        <div className="p-4 space-y-4">
          {/* Strategy selector */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {DR_STRATEGIES.map((s, i) => (
              <button
                key={s.name}
                onClick={() => { setSelected(i); sim.reset(); }}
                className={cn(
                  "rounded-lg border px-2 py-2 text-[11px] font-medium text-left transition-all",
                  selected === i
                    ? cn(s.colorBg, s.colorBorder, s.colorText)
                    : "bg-muted/10 border-border/30 text-muted-foreground/60 hover:bg-muted/30"
                )}
              >
                <div className="font-semibold">{s.name}</div>
                <div className="text-[9px] font-mono mt-0.5 opacity-70">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <span key={j} className={j < s.costTier ? "opacity-100" : "opacity-20"}>$</span>
                  ))}
                </div>
              </button>
            ))}
          </div>

          {/* Strategy details */}
          <div className={cn("rounded-lg border p-3 space-y-2", strategy.colorBg, strategy.colorBorder)}>
            <p className="text-xs text-muted-foreground">{strategy.description}</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded bg-amber-500/10 border border-amber-500/20 p-2">
                <div className="text-[10px] text-muted-foreground">RPO (data loss)</div>
                <div className={cn("text-sm font-bold font-mono", strategy.colorText)}>
                  {formatDuration(strategy.rpoSeconds)}
                </div>
              </div>
              <div className="rounded bg-blue-500/10 border border-blue-500/20 p-2">
                <div className="text-[10px] text-muted-foreground">RTO (downtime)</div>
                <div className={cn("text-sm font-bold font-mono", strategy.colorText)}>
                  {formatDuration(strategy.rtoSeconds)}
                </div>
              </div>
            </div>
            <div className="text-[10px] text-muted-foreground/70">{strategy.mechanism}</div>
          </div>

          {/* Recovery simulation chart */}
          {timelineData.length > 1 ? (
            <div>
              <div className="text-[10px] text-muted-foreground mb-1">
                Service availability (%) — disaster at tick 6, recovery takes {formatDuration(strategy.rtoSeconds)}
              </div>
              <LiveChart
                type="line"
                data={timelineData}
                dataKeys={{ x: "t", y: "status", label: "Availability %" }}
                height={100}
                unit="%"
                referenceLines={[{ y: 99, label: "SLA target", color: "#22c55e" }]}
              />
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border/30 h-[100px] flex items-center justify-center text-xs text-muted-foreground/50">
              Press play to simulate a disaster and watch recovery time
            </div>
          )}
        </div>
      }
      explanation={
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>
            <strong className="text-foreground">RPO</strong> (Recovery Point Objective) — how much
            data you can afford to lose. Measured as the gap between the last backup and the disaster.
          </p>
          <p>
            <strong className="text-foreground">RTO</strong> (Recovery Time Objective) — how long
            the system can be down. Measured from disaster to full restoration.
          </p>
          <p>
            Both are <strong className="text-amber-400">business decisions first</strong>, technical
            decisions second. Your finance and product teams must agree on acceptable values before
            engineering picks a strategy.
          </p>
          <div className="space-y-1">
            <p className="text-[11px] font-medium text-foreground">Strategy comparison (minutes)</p>
            <LiveChart
              type="bar"
              data={recoveryData}
              dataKeys={{ x: "name", y: ["rto", "rpo"], label: ["RTO (min)", "RPO (min)"] }}
              height={110}
              unit="min"
              showLegend
            />
          </div>
        </div>
      }
    />
  );
}

// ─── Failover Flow Diagram ────────────────────────────────────────────────────

type FailoverPhase = "normal" | "disaster" | "detect" | "activate" | "dns" | "restored";

const FAILOVER_PHASES: FailoverPhase[] = ["normal", "disaster", "detect", "activate", "dns", "restored"];

function buildFailoverNodes(phase: FailoverPhase): FlowNode[] {
  const primaryDown = phase === "disaster" || phase === "detect" || phase === "activate" || phase === "dns";
  const drScaling = phase === "activate";
  const drActive = phase === "dns" || phase === "restored";

  return [
    {
      id: "client",
      type: "clientNode",
      position: { x: 200, y: 20 },
      data: {
        label: "Users",
        sublabel: drActive ? "→ eu-west-1" : "→ us-east-1",
        status: phase === "disaster" || phase === "detect" ? "unhealthy" : "healthy",
        handles: { bottom: true },
      },
    },
    {
      id: "dns",
      type: "gatewayNode",
      position: { x: 200, y: 130 },
      data: {
        label: "Route53 DNS",
        sublabel: drActive ? "Pointing to DR" : "Pointing to Primary",
        status: phase === "dns" ? "warning" : "healthy",
        handles: { top: true, bottom: true, right: true },
      },
    },
    {
      id: "primary-lb",
      type: "loadBalancerNode",
      position: { x: 50, y: 260 },
      data: {
        label: "us-east-1 LB",
        sublabel: primaryDown ? "UNREACHABLE" : "Active",
        status: primaryDown ? "unhealthy" : "healthy",
        handles: { top: true, bottom: true },
      },
    },
    {
      id: "primary-app",
      type: "serverNode",
      position: { x: 10, y: 380 },
      data: {
        label: "App Servers",
        sublabel: primaryDown ? "DOWN" : "Serving",
        status: primaryDown ? "unhealthy" : "healthy",
        handles: { top: true, bottom: true },
      },
    },
    {
      id: "primary-db",
      type: "databaseNode",
      position: { x: 110, y: 380 },
      data: {
        label: "Primary DB",
        sublabel: primaryDown ? "DOWN" : "Active",
        status: primaryDown ? "unhealthy" : "healthy",
        handles: { top: true },
      },
    },
    {
      id: "dr-lb",
      type: "loadBalancerNode",
      position: { x: 340, y: 260 },
      data: {
        label: "eu-west-1 LB",
        sublabel: drActive ? "Active" : drScaling ? "Scaling..." : "Standby",
        status: drActive ? "healthy" : drScaling ? "warning" : "idle",
        handles: { top: true, bottom: true },
      },
    },
    {
      id: "dr-app",
      type: "serverNode",
      position: { x: 300, y: 380 },
      data: {
        label: "App Servers",
        sublabel: drActive ? "Serving" : drScaling ? "Starting" : "Standby",
        status: drActive ? "healthy" : drScaling ? "warning" : "idle",
        handles: { top: true, bottom: true },
      },
    },
    {
      id: "dr-db",
      type: "databaseNode",
      position: { x: 400, y: 380 },
      data: {
        label: "DB Replica",
        sublabel: phase === "normal" ? "Replicating" : drActive ? "Promoted" : "Replicating",
        status: phase !== "normal" && !primaryDown ? "idle" : drActive ? "healthy" : phase === "normal" ? "warning" : "warning",
        handles: { top: true },
      },
    },
  ];
}

function buildFailoverEdges(phase: FailoverPhase): FlowEdge[] {
  const primaryDown = phase === "disaster" || phase === "detect" || phase === "activate" || phase === "dns";
  const drActive = phase === "dns" || phase === "restored";

  const edges: FlowEdge[] = [
    // DNS → Primary LB
    {
      id: "dns-primary",
      source: "dns",
      target: "primary-lb",
      animated: !primaryDown,
      style: {
        stroke: primaryDown ? "#ef444440" : "#8b5cf6",
        strokeWidth: primaryDown ? 1 : 2,
        strokeDasharray: primaryDown ? "4 4" : undefined,
      },
      markerEnd: { type: MarkerType.ArrowClosed, color: primaryDown ? "#ef444440" : "#8b5cf6" },
    },
    // DNS → DR LB
    {
      id: "dns-dr",
      source: "dns",
      target: "dr-lb",
      sourceHandle: null,
      animated: drActive,
      style: {
        stroke: drActive ? "#22c55e" : "#8b5cf640",
        strokeWidth: drActive ? 2 : 1,
        strokeDasharray: !drActive ? "4 4" : undefined,
      },
      markerEnd: { type: MarkerType.ArrowClosed, color: drActive ? "#22c55e" : "#8b5cf640" },
    },
    // Client → DNS
    {
      id: "client-dns",
      source: "client",
      target: "dns",
      animated: phase !== "disaster",
      style: { stroke: "#8b5cf6", strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: "#8b5cf6" },
    },
    // Primary LB → App
    {
      id: "primary-lb-app",
      source: "primary-lb",
      target: "primary-app",
      animated: !primaryDown,
      style: { stroke: primaryDown ? "#ef444440" : "#22c55e", strokeWidth: 1.5 },
      markerEnd: { type: MarkerType.ArrowClosed, color: primaryDown ? "#ef444440" : "#22c55e" },
    },
    // Primary LB → DB
    {
      id: "primary-lb-db",
      source: "primary-lb",
      target: "primary-db",
      animated: !primaryDown,
      style: { stroke: primaryDown ? "#ef444440" : "#f59e0b", strokeWidth: 1.5 },
      markerEnd: { type: MarkerType.ArrowClosed, color: primaryDown ? "#ef444440" : "#f59e0b" },
    },
    // DR LB → App
    {
      id: "dr-lb-app",
      source: "dr-lb",
      target: "dr-app",
      animated: drActive,
      style: { stroke: drActive ? "#22c55e" : "#8b5cf640", strokeWidth: 1.5 },
      markerEnd: { type: MarkerType.ArrowClosed, color: drActive ? "#22c55e" : "#8b5cf640" },
    },
    // DR LB → DR DB
    {
      id: "dr-lb-db",
      source: "dr-lb",
      target: "dr-db",
      animated: drActive,
      style: { stroke: drActive ? "#f59e0b" : "#8b5cf640", strokeWidth: 1.5 },
      markerEnd: { type: MarkerType.ArrowClosed, color: drActive ? "#f59e0b" : "#8b5cf640" },
    },
  ];

  return edges;
}

const PHASE_LABELS: Record<FailoverPhase, string> = {
  normal: "Normal operation — primary region serving all traffic",
  disaster: "Disaster: us-east-1 becomes unreachable",
  detect: "Health checks fail — monitoring detects the outage (30-60s)",
  activate: "Failover triggered — DR region scaling up",
  dns: "DNS switched — Route53 pointing to eu-west-1",
  restored: "Failover complete — full service restored in DR region",
};

function FailoverFlowPlayground() {
  const [phaseIdx, setPhaseIdx] = useState(0);
  const sim = useSimulation({
    intervalMs: 2200,
    maxSteps: FAILOVER_PHASES.length - 1,
  });

  useEffect(() => {
    setPhaseIdx(sim.step);
  }, [sim.step]);

  const phase = FAILOVER_PHASES[Math.min(phaseIdx, FAILOVER_PHASES.length - 1)];
  const nodes = useMemo(() => buildFailoverNodes(phase), [phase]);
  const edges = useMemo(() => buildFailoverEdges(phase), [phase]);

  return (
    <Playground
      title="Multi-Region Failover — watch the transition from primary to DR"
      simulation={sim}
      canvasHeight="min-h-[460px]"
      hints={["Press play to watch the full disaster-to-recovery sequence step by step"]}
      canvas={
        <div className="w-full h-full flex flex-col">
          <FlowDiagram
            nodes={nodes}
            edges={edges}
            allowDrag={false}
            fitView
            minHeight={420}
          />
        </div>
      }
      explanation={
        <div className="space-y-3">
          {/* Phase indicator */}
          <div className="space-y-1.5">
            {FAILOVER_PHASES.map((p, i) => (
              <div
                key={p}
                className={cn(
                  "flex items-start gap-2 rounded-md px-2 py-1.5 transition-all text-[11px]",
                  i === phaseIdx
                    ? "bg-violet-500/10 border border-violet-500/20 text-foreground"
                    : i < phaseIdx
                    ? "text-muted-foreground/60"
                    : "text-muted-foreground/30"
                )}
              >
                <div
                  className={cn(
                    "size-1.5 rounded-full mt-1 shrink-0",
                    i === phaseIdx
                      ? "bg-violet-500"
                      : i < phaseIdx
                      ? "bg-emerald-500"
                      : "bg-muted-foreground/20"
                  )}
                />
                <span>{PHASE_LABELS[p]}</span>
              </div>
            ))}
          </div>
          <div className="text-xs text-muted-foreground space-y-1 pt-1 border-t border-border/20">
            <p>
              The key insight: stateless servers (LB, app) are trivial to spin up in a new region.
              The hard part is <strong className="text-foreground">the database</strong> — you need
              a replica that&apos;s been continuously receiving writes.
            </p>
          </div>
        </div>
      }
    />
  );
}

// ─── Standby Strategy Comparison ─────────────────────────────────────────────

function StandbyStrategyCard({
  name,
  rpo,
  rto,
  cost,
  colorText,
  colorBg,
  colorBorder,
  description,
  infra,
}: {
  name: string;
  rpo: string;
  rto: string;
  cost: number;
  colorText: string;
  colorBg: string;
  colorBorder: string;
  description: string;
  infra: string;
}) {
  return (
    <div className={cn("rounded-lg border p-4 space-y-2", colorBg, colorBorder)}>
      <div className="flex items-center justify-between">
        <h4 className={cn("text-sm font-semibold", colorText)}>{name}</h4>
        <span className="text-[10px] font-mono text-muted-foreground/50">
          {Array.from({ length: 4 }).map((_, i) => (
            <span key={i} className={i < cost ? "text-amber-400" : "opacity-20"}>$</span>
          ))}
        </span>
      </div>
      <p className="text-xs text-muted-foreground">{description}</p>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded bg-black/20 p-1.5">
          <div className="text-[9px] text-muted-foreground">RPO</div>
          <div className={cn("text-xs font-bold font-mono", colorText)}>{rpo}</div>
        </div>
        <div className="rounded bg-black/20 p-1.5">
          <div className="text-[9px] text-muted-foreground">RTO</div>
          <div className={cn("text-xs font-bold font-mono", colorText)}>{rto}</div>
        </div>
      </div>
      <div className="text-[10px] text-muted-foreground/70 border-t border-border/20 pt-2">{infra}</div>
    </div>
  );
}

// ─── Recovery Time Chart ──────────────────────────────────────────────────────

function RecoveryComparisonChart() {
  const chartData = [
    { strategy: "B&R", rtoMinutes: 480, rpoMinutes: 360 },
    { strategy: "Pilot", rtoMinutes: 30, rpoMinutes: 10 },
    { strategy: "Warm", rtoMinutes: 5, rpoMinutes: 1 },
    { strategy: "Active", rtoMinutes: 0.2, rpoMinutes: 0.02 },
  ];

  return (
    <LiveChart
      type="bar"
      data={chartData}
      dataKeys={{
        x: "strategy",
        y: ["rtoMinutes", "rpoMinutes"],
        label: ["RTO (minutes)", "RPO (minutes)"],
      }}
      height={220}
      unit="min"
      showLegend
      referenceLines={[
        { y: 60, label: "1 hour SLA", color: "#f59e0b" },
        { y: 5, label: "5 min SLA", color: "#22c55e" },
      ]}
    />
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DisasterRecoveryPage() {
  return (
    <div className="space-y-8">
      <TopicHero
        title="Disaster Recovery"
        subtitle="It's not paranoia if the entire data center actually does catch fire. Every cloud region goes down eventually — the question is whether you had a plan."
        difficulty="advanced"
      />

      <WhyCare>
        GitLab accidentally deleted their production database in 2017. Their backups didn&apos;t work. Understanding disaster recovery is understanding how to avoid career-ending incidents.
      </WhyCare>

      <ConversationalCallout type="question">
        AWS us-east-1 goes down at 3 AM. Your app, your database, and your backups are all in
        us-east-1. How long are you down, and how much data do you lose? These aren&apos;t hypotheticals
        — major cloud providers have multi-hour regional outages every year.
      </ConversationalCallout>

      {/* RTO / RPO playground */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">RTO and RPO: The Two Numbers That Define Everything</h2>
        <p className="text-sm text-muted-foreground">
          Every disaster recovery decision is ultimately a tradeoff between cost and two metrics.
          <strong> RPO</strong> (Recovery Point Objective) is how much data you can afford to lose.
          <strong> RTO</strong> (Recovery Time Objective) is how long you can be offline.
          Select a strategy -- from simple backups to full <GlossaryTerm term="replication">replication</GlossaryTerm> -- and simulate a disaster to see how each performs.
        </p>
        <RtoRpoPlayground />
      </section>

      {/* Strategy deep-dive */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">The Four DR Strategy Tiers</h2>
        <p className="text-sm text-muted-foreground">
          AWS defines four DR tiers, each trading cost for faster recovery. Most teams start at
          Backup &amp; Restore and graduate as their downtime costs increase.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <StandbyStrategyCard
            name="Backup & Restore"
            rpo="Hours"
            rto="Hours"
            cost={1}
            colorText="text-slate-400"
            colorBg="bg-slate-500/5"
            colorBorder="border-slate-500/20"
            description="Periodic snapshots stored in another region. On disaster, launch new infrastructure and restore from the latest backup. You only pay for storage — no running infrastructure in DR."
            infra="S3 cross-region replication. RDS automated snapshots. Manual recovery runbook."
          />
          <StandbyStrategyCard
            name="Pilot Light"
            rpo="Minutes"
            rto="10–30 min"
            cost={2}
            colorText="text-amber-400"
            colorBg="bg-amber-500/5"
            colorBorder="border-amber-500/20"
            description="The core database continuously replicates to DR. Compute is pre-configured as AMIs but stopped. On failover, start the servers and scale up. The 'pilot light' (DB) is always burning."
            infra="RDS read replica running. EC2 AMIs pre-built. Auto Scaling Groups at 0 capacity."
          />
          <StandbyStrategyCard
            name="Warm Standby"
            rpo="Seconds"
            rto="1–5 min"
            cost={3}
            colorText="text-blue-400"
            colorBg="bg-blue-500/5"
            colorBorder="border-blue-500/20"
            description="A scaled-down but fully functional copy runs continuously in DR. On disaster, scale up to full capacity and switch DNS. Can handle reduced traffic immediately."
            infra="Full stack running at ~20% capacity. Async DB replication. Route53 failover record."
          />
          <StandbyStrategyCard
            name="Multi-Site Active"
            rpo="Near zero"
            rto="Seconds"
            cost={4}
            colorText="text-emerald-400"
            colorBg="bg-emerald-500/5"
            colorBorder="border-emerald-500/20"
            description="Full production in 2+ regions, both actively serving traffic. Route53 health checks auto-shift traffic on failure. No manual intervention. Most expensive but near-zero downtime."
            infra="Full stack in every region. DynamoDB Global Tables or Aurora Global DB. Active-active routing."
          />
        </div>
      </section>

      {/* Recovery time comparison chart */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Recovery Time Comparison</h2>
        <p className="text-sm text-muted-foreground">
          The jump from Backup &amp; Restore to Pilot Light gives the biggest bang-for-buck: hours of
          downtime become 30 minutes at a fraction of the cost of warm standby. After that, each tier
          gives diminishing returns at significantly higher cost.
        </p>
        <div className="rounded-lg border bg-muted/5 p-4">
          <RecoveryComparisonChart />
          <p className="text-[11px] text-muted-foreground/60 text-center mt-2">
            Note: chart is on a linear scale. Backup &amp; Restore RTO of 8 hours dwarfs everything else.
          </p>
        </div>
      </section>

      {/* Failover flow */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Multi-Region Failover in Action</h2>
        <p className="text-sm text-muted-foreground">
          Watch a warm standby <GlossaryTerm term="failover">failover</GlossaryTerm> unfold step by step — from disaster detection via <GlossaryTerm term="health check">health checks</GlossaryTerm> to DNS cutover
          to full traffic restoration in the DR region. Press play or step through manually.
        </p>
        <FailoverFlowPlayground />
      </section>

      <AhaMoment
        question="Why doesn't every company just run active-active multi-region?"
        answer={
          <p>
            Cost and database complexity. Active-active means paying for full infrastructure in 2+
            regions simultaneously. The real challenge is the database: you need to handle concurrent
            writes from multiple regions with conflict resolution, synchronous replication adds
            60-100ms cross-region latency to every write, and testing failover regularly is
            operationally expensive. For most B2B SaaS, warm standby hits the right tradeoff.
            Netflix and Google need active-active. Your startup probably doesn&apos;t — yet.
          </p>
        }
      />

      <AhaMoment
        question="What's the hardest part of multi-region DR?"
        answer={
          <p>
            The database. Stateless services (app servers, load balancers) can be launched in any
            region trivially — just run more instances. But databases hold state that must be
            consistent. Synchronous replication adds latency to every write. Asynchronous replication
            means potential data loss during failover (your RPO). Active-active writes require
            conflict resolution. This is why DynamoDB Global Tables, CockroachDB, and Google Spanner
            exist: they solve distributed consensus at the database layer so you don&apos;t have to.
          </p>
        }
      />

      <BeforeAfter
        before={{
          title: "Single Region, No DR Plan",
          content: (
            <ul className="text-xs text-muted-foreground space-y-1.5">
              <li className="flex items-start gap-1.5">
                <XCircle className="size-3 text-red-400 shrink-0 mt-0.5" />
                Region outage = total application outage
              </li>
              <li className="flex items-start gap-1.5">
                <XCircle className="size-3 text-red-400 shrink-0 mt-0.5" />
                Backups co-located with production — disaster takes both
              </li>
              <li className="flex items-start gap-1.5">
                <XCircle className="size-3 text-red-400 shrink-0 mt-0.5" />
                Recovery means launching fresh infra and restoring from old backup
              </li>
              <li className="flex items-start gap-1.5">
                <XCircle className="size-3 text-red-400 shrink-0 mt-0.5" />
                Hours of downtime, hours of data loss, manual panic at 3 AM
              </li>
            </ul>
          ),
        }}
        after={{
          title: "Multi-Region Warm Standby",
          content: (
            <ul className="text-xs text-muted-foreground space-y-1.5">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="size-3 text-emerald-400 shrink-0 mt-0.5" />
                Region outage triggers automated failover within minutes
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="size-3 text-emerald-400 shrink-0 mt-0.5" />
                DB replica in separate region receives continuous replication
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="size-3 text-emerald-400 shrink-0 mt-0.5" />
                RPO measured in seconds; RTO in minutes, not hours
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="size-3 text-emerald-400 shrink-0 mt-0.5" />
                Regularly tested — runbook is automated, not a hopeful document
              </li>
            </ul>
          ),
        }}
      />

      <ConversationalCallout type="warning">
        A DR plan that has never been tested is not a DR plan — it&apos;s a hope. The number one reason
        DR fails in real disasters: nobody ever ran a failover drill. Expired TLS certificates,
        outdated AMIs, missing IAM permissions, stale DNS TTLs — these only surface when you need
        the plan most. Netflix runs Chaos Monkey continuously. AWS recommends quarterly failover tests.
      </ConversationalCallout>

      <ConversationalCallout type="tip">
        When calculating whether DR is worth the cost, use: <em>annual cost of DR infrastructure</em>
        vs. <em>expected annual downtime hours × revenue per hour</em>. For most companies running on
        a cloud provider with 99.95% SLA, a single regional outage event per year is the base expectation.
        Warm standby infrastructure at $3K/month ($36K/year) pays for itself after one avoided 2-hour
        outage at $20K revenue/hour.
      </ConversationalCallout>

      <ConversationalCallout type="question">
        What about failback — returning to the primary region after it recovers? This is often harder
        than the original failover. You need to sync data written in DR back to the primary, verify
        consistency, and flip DNS again — all without losing writes or creating conflicts. Many teams
        skip planning for failback and end up running permanently from what was supposed to be their
        DR region, which defeats the economics of the plan.
      </ConversationalCallout>

      <TopicQuiz
        questions={[
          {
            question: "What does RPO (Recovery Point Objective) measure?",
            options: [
              "How long the system can be offline after a disaster",
              "How much data you can afford to lose, measured as time since the last backup",
              "How many servers you need in your DR region",
              "The cost of your disaster recovery infrastructure",
            ],
            correctIndex: 1,
            explanation: "RPO measures the maximum acceptable amount of data loss, expressed as the time gap between the last backup/replication point and the disaster. An RPO of 1 hour means you can lose up to 1 hour of data.",
          },
          {
            question: "Which DR strategy offers the best cost-to-recovery improvement over basic Backup & Restore?",
            options: [
              "Multi-Site Active-Active",
              "Warm Standby",
              "Pilot Light",
              "They all offer equal improvement",
            ],
            correctIndex: 2,
            explanation: "Pilot Light gives the biggest bang-for-buck: hours of downtime become about 30 minutes at roughly 2x the cost of backup-and-restore. The database replica runs continuously while compute stays stopped until needed.",
          },
          {
            question: "Why is the database the hardest part of multi-region disaster recovery?",
            options: [
              "Databases are more expensive than application servers",
              "Databases hold state that requires continuous replication, consistency guarantees, and conflict resolution",
              "Databases cannot run in multiple regions",
              "Database software does not support automated backups",
            ],
            correctIndex: 1,
            explanation: "Stateless services like web servers can be launched in any region trivially. But databases hold state that must be consistent -- synchronous replication adds latency, asynchronous replication risks data loss, and active-active writes need conflict resolution.",
          },
        ]}
      />

      <KeyTakeaway
        points={[
          "RPO (how much data you can lose) and RTO (how long you can be down) are business decisions first. Engineering picks the strategy after the business sets the requirements.",
          "Four DR tiers: Backup & Restore (hours/$) → Pilot Light (minutes/$$) → Warm Standby (seconds/$$$) → Multi-Site Active (near-zero/$$$$).",
          "The biggest cost-to-recovery improvement comes from moving off pure backup-and-restore — hours of downtime become 30 minutes at 2x the cost.",
          "Stateless services are trivial to replicate across regions. The database is the hard part — it requires continuous replication, consistency guarantees, and conflict resolution.",
          "Always store backups in a different region from production. A disaster that takes down your app will also destroy co-located backups.",
          "Test your DR plan with real failover drills. Expired certificates, missing permissions, and outdated AMIs only surface during an actual test — not during a real disaster.",
        ]}
      />
    </div>
  );
}
