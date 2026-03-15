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
  CheckCircle2,
  XCircle,
  AlertTriangle,
  HeartPulse,
  Activity,
  RefreshCw,
  Heart,
} from "lucide-react";

// ─── Health Check Flow Playground ────────────────────────────────────────────

type ServerStatus = "healthy" | "unhealthy" | "warning" | "idle";

interface ServerState {
  id: string;
  label: string;
  status: ServerStatus;
  sublabel: string;
  livenessOk: boolean;
  readinessOk: boolean;
  inRotation: boolean;
}

const INITIAL_SERVERS: ServerState[] = [
  { id: "srv1", label: "web-01", status: "healthy", sublabel: "Healthy", livenessOk: true, readinessOk: true, inRotation: true },
  { id: "srv2", label: "web-02", status: "healthy", sublabel: "Healthy", livenessOk: true, readinessOk: true, inRotation: true },
  { id: "srv3", label: "web-03", status: "healthy", sublabel: "Healthy", livenessOk: true, readinessOk: true, inRotation: true },
];

function getServerSublabel(srv: ServerState): string {
  if (!srv.livenessOk) return "Deadlocked — restarting";
  if (!srv.readinessOk) return "DB lost — out of rotation";
  return "Healthy";
}

function buildFlowNodes(servers: ServerState[], pingTarget: string | null): FlowNode[] {
  const lbNode: FlowNode = {
    id: "lb",
    type: "loadBalancerNode",
    position: { x: 200, y: 40 },
    data: {
      label: "Load Balancer",
      sublabel: "Health-check aware",
      status: "healthy",
      handles: { bottom: true },
    },
  };

  const serverNodes: FlowNode[] = servers.map((srv, i) => ({
    id: srv.id,
    type: "serverNode",
    position: { x: i * 160, y: 200 },
    data: {
      label: srv.label,
      sublabel: getServerSublabel(srv),
      status: srv.status,
      metrics: [
        { label: "Live", value: srv.livenessOk ? "OK" : "FAIL" },
        { label: "Ready", value: srv.readinessOk ? "OK" : "FAIL" },
      ],
      handles: { top: true },
    },
  }));

  const probeNode: FlowNode | null =
    pingTarget
      ? {
          id: "probe-indicator",
          type: "gatewayNode",
          position: { x: -30, y: 200 },
          data: {
            label: "Probe",
            sublabel: `→ ${pingTarget}`,
            status: "warning",
            handles: {},
          },
        }
      : null;

  return probeNode ? [lbNode, ...serverNodes, probeNode] : [lbNode, ...serverNodes];
}

function buildFlowEdges(servers: ServerState[], pingTarget: string | null): FlowEdge[] {
  const trafficEdges: FlowEdge[] = servers
    .filter((srv) => srv.inRotation)
    .map((srv) => ({
      id: `lb-${srv.id}`,
      source: "lb",
      target: srv.id,
      animated: true,
      style: { stroke: "#22c55e", strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: "#22c55e" },
    }));

  const removedEdges: FlowEdge[] = servers
    .filter((srv) => !srv.inRotation)
    .map((srv) => ({
      id: `lb-removed-${srv.id}`,
      source: "lb",
      target: srv.id,
      animated: false,
      style: { stroke: "#ef444460", strokeWidth: 1, strokeDasharray: "4 4" },
      markerEnd: { type: MarkerType.ArrowClosed, color: "#ef444460" },
    }));

  const probeEdge: FlowEdge[] = pingTarget
    ? [
        {
          id: "probe-edge",
          source: "probe-indicator",
          target: pingTarget,
          animated: true,
          style: { stroke: "#f59e0b", strokeWidth: 1.5 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#f59e0b" },
        },
      ]
    : [];

  return [...trafficEdges, ...removedEdges, ...probeEdge];
}

function HealthCheckPlayground() {
  const [servers, setServers] = useState<ServerState[]>(INITIAL_SERVERS);
  const [pingTarget, setPingTarget] = useState<string | null>(null);
  const [latencyData, setLatencyData] = useState<{ t: string; latency: number }[]>([]);
  const tickRef = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Cycle ping target to simulate continuous probing
  useEffect(() => {
    if (!isPlaying) return;
    let i = 0;
    const interval = setInterval(() => {
      const target = INITIAL_SERVERS[i % INITIAL_SERVERS.length].id;
      setPingTarget(target);
      i++;
      // Add latency sample
      setLatencyData((prev) => {
        const inRotationCount = servers.filter((s) => s.inRotation).length;
        const base = inRotationCount < 2 ? 35 : 8;
        const jitter = Math.floor(Math.random() * 12);
        const entry = {
          t: `${prev.length + 1}`,
          latency: base + jitter,
        };
        return [...prev.slice(-19), entry];
      });
      setTimeout(() => setPingTarget(null), 400);
    }, 1500);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, servers]);

  const toggleReadiness = useCallback((id: string) => {
    setServers((prev) =>
      prev.map((srv) => {
        if (srv.id !== id) return srv;
        const next = !srv.readinessOk;
        return {
          ...srv,
          readinessOk: next,
          inRotation: next && srv.livenessOk,
          status: !next ? "warning" : "healthy",
        };
      })
    );
  }, []);

  const toggleLiveness = useCallback((id: string) => {
    setServers((prev) =>
      prev.map((srv) => {
        if (srv.id !== id) return srv;
        const next = !srv.livenessOk;
        // Liveness fail → restart sequence: unhealthy then back to healthy
        return {
          ...srv,
          livenessOk: next,
          readinessOk: next ? srv.readinessOk : false,
          inRotation: next ? srv.inRotation : false,
          status: !next ? "unhealthy" : "healthy",
        };
      })
    );
  }, []);

  const resetAll = useCallback(() => {
    setServers(INITIAL_SERVERS);
    setLatencyData([]);
  }, []);

  const nodes = useMemo(() => buildFlowNodes(servers, pingTarget), [servers, pingTarget]);
  const edges = useMemo(() => buildFlowEdges(servers, pingTarget), [servers, pingTarget]);

  const inRotation = servers.filter((s) => s.inRotation).length;
  const unhealthy = servers.filter((s) => !s.readinessOk || !s.livenessOk).length;

  return (
    <Playground
      title="Health Check Simulator — click a server to toggle its health"
      canvasHeight="min-h-[340px]"
      hints={["Toggle the 'Ready' button on a server to simulate a database disconnection"]}
      canvas={
        <div className="w-full h-full flex flex-col">
          <FlowDiagram
            nodes={nodes}
            edges={edges}
            allowDrag={false}
            fitView
            minHeight={260}
          />
          {/* Server controls */}
          <div className="flex gap-2 px-3 pb-2 flex-wrap">
            {servers.map((srv) => (
              <div key={srv.id} className="flex flex-col gap-1">
                <span className="text-[10px] font-mono text-muted-foreground text-center">{srv.label}</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => toggleLiveness(srv.id)}
                    className={cn(
                      "text-[9px] px-1.5 py-0.5 rounded border transition-all font-mono",
                      srv.livenessOk
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400"
                        : "border-red-500/30 bg-red-500/10 text-red-400 hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-400"
                    )}
                    title="Toggle liveness"
                  >
                    Live
                  </button>
                  <button
                    onClick={() => toggleReadiness(srv.id)}
                    className={cn(
                      "text-[9px] px-1.5 py-0.5 rounded border transition-all font-mono",
                      srv.readinessOk
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-amber-500/10 hover:border-amber-500/30 hover:text-amber-400"
                        : "border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-400"
                    )}
                    title="Toggle readiness"
                  >
                    Ready
                  </button>
                </div>
              </div>
            ))}
            <button
              onClick={() => setIsPlaying((p) => !p)}
              className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 border border-violet-500/20 transition-colors"
            >
              {isPlaying ? "⏸ Pause" : "▶ Start"}
            </button>
            <button
              onClick={resetAll}
              className="ml-auto self-end text-[9px] px-2 py-1 rounded border border-border/30 text-muted-foreground hover:bg-muted/30 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      }
      explanation={
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-2 text-center">
              <div className="text-lg font-bold text-emerald-400">{inRotation}</div>
              <div className="text-[10px] text-muted-foreground">In Rotation</div>
            </div>
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-2 text-center">
              <div className="text-lg font-bold text-red-400">{unhealthy}</div>
              <div className="text-[10px] text-muted-foreground">Unhealthy</div>
            </div>
          </div>
          <div className="space-y-1.5 text-xs text-muted-foreground">
            <p className="font-medium text-foreground text-[11px]">What to try:</p>
            <p>Toggle <span className="text-amber-400 font-mono">Ready</span> to simulate DB outage — server leaves rotation but stays alive.</p>
            <p>Toggle <span className="text-red-400 font-mono">Live</span> to simulate deadlock — orchestrator would restart this pod.</p>
            <p>Toggle all <span className="text-amber-400 font-mono">Ready</span> off to see complete traffic collapse.</p>
          </div>
          {latencyData.length > 0 && (
            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground">Avg probe latency (fewer healthy = longer)</p>
              <LiveChart
                type="latency"
                data={latencyData}
                dataKeys={{ x: "t", y: "latency", label: "Probe latency" }}
                height={100}
                referenceLines={[{ y: 25, label: "SLO", color: "#f59e0b" }]}
              />
            </div>
          )}
        </div>
      }
      controls={false}
    />
  );
}

// ─── Liveness vs Readiness Comparison ────────────────────────────────────────

function ProbeTypeComparison() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {[
        {
          icon: Heart,
          color: "blue",
          name: "Startup Probe",
          question: "Has the container finished initializing?",
          action: "Blocks other probes until this passes",
          endpoint: "GET /healthz/startup",
          use: "ML model loading, cache warm-up, DB migrations",
          antiPattern: null,
        },
        {
          icon: HeartPulse,
          color: "red",
          name: "Liveness Probe",
          question: "Is the process alive and not stuck?",
          action: "KILL + RESTART the pod on failure",
          endpoint: "GET /healthz",
          use: "Deadlock detection, infinite loop recovery",
          antiPattern: "Never add dependency checks here",
        },
        {
          icon: Activity,
          color: "emerald",
          name: "Readiness Probe",
          question: "Can this pod handle traffic right now?",
          action: "Remove from Service endpoints (not killed)",
          endpoint: "GET /ready",
          use: "DB outage, cache miss, high load",
          antiPattern: null,
        },
      ].map((probe) => {
        const Icon = probe.icon;
        const borderClass =
          probe.color === "blue"
            ? "border-blue-500/30 bg-blue-500/5"
            : probe.color === "red"
            ? "border-red-500/30 bg-red-500/5"
            : "border-emerald-500/30 bg-emerald-500/5";
        const textClass =
          probe.color === "blue"
            ? "text-blue-400"
            : probe.color === "red"
            ? "text-red-400"
            : "text-emerald-400";
        return (
          <div key={probe.name} className={cn("rounded-lg border p-4 space-y-2", borderClass)}>
            <div className="flex items-center gap-2">
              <Icon className={cn("size-4", textClass)} />
              <h4 className={cn("text-sm font-semibold", textClass)}>{probe.name}</h4>
            </div>
            <p className="text-[11px] text-muted-foreground italic">&ldquo;{probe.question}&rdquo;</p>
            <div className="space-y-1">
              <div className="flex items-start gap-1.5">
                <span className="text-[9px] font-mono text-muted-foreground/50 mt-0.5 w-12 shrink-0">ACTION</span>
                <span className="text-[11px] text-foreground">{probe.action}</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-[9px] font-mono text-muted-foreground/50 mt-0.5 w-12 shrink-0">ENDPOINT</span>
                <span className="text-[11px] font-mono text-muted-foreground">{probe.endpoint}</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-[9px] font-mono text-muted-foreground/50 mt-0.5 w-12 shrink-0">USE FOR</span>
                <span className="text-[11px] text-muted-foreground">{probe.use}</span>
              </div>
            </div>
            {probe.antiPattern && (
              <div className="flex items-center gap-1.5 rounded-md bg-red-500/10 border border-red-500/20 px-2 py-1">
                <AlertTriangle className="size-3 text-red-400 shrink-0" />
                <span className="text-[10px] text-red-400">{probe.antiPattern}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Thundering Herd Anti-Pattern Demo ───────────────────────────────────────

function ThunderingHerdDemo() {
  const sim = useSimulation({ intervalMs: 900, maxSteps: 14 });

  const step = sim.step;

  type PhaseStatus = "ok" | "failing" | "restarting" | "crashed";

  const dbStatus: PhaseStatus = step >= 2 ? "failing" : "ok";

  const badScenario = {
    pods: [
      { name: "pod-1", status: step >= 3 ? "restarting" : step >= 2 ? "failing" : "ok" },
      { name: "pod-2", status: step >= 3 ? "restarting" : step >= 2 ? "failing" : "ok" },
      { name: "pod-3", status: step >= 4 ? "restarting" : step >= 3 ? "failing" : "ok" },
    ] as { name: string; status: PhaseStatus | "restarting" }[],
    note:
      step < 2
        ? "All pods healthy, serving traffic"
        : step < 4
        ? "DB fails → liveness probe fails on all pods (deep check!)"
        : step < 8
        ? "Orchestrator restarts ALL pods simultaneously — thundering herd on DB reconnect"
        : "Even after DB recovers, pods keep crashing from connection storm",
  };

  const goodScenario = {
    pods: [
      { name: "pod-1", status: step >= 2 ? "warning" : "ok" },
      { name: "pod-2", status: step >= 2 ? "warning" : "ok" },
      { name: "pod-3", status: step >= 3 ? "warning" : "ok" },
    ] as { name: string; status: "ok" | "warning" | "failing" }[],
    note:
      step < 2
        ? "All pods healthy, serving traffic"
        : step < 6
        ? "DB fails → readiness fails (deep check) → pods removed from LB but NOT restarted"
        : step < 10
        ? "DB recovers → pods immediately pass readiness → back in rotation within 5s"
        : "Zero pod restarts. Zero thundering herd. Service restored automatically.",
  };

  return (
    <Playground
      title="Liveness vs Readiness: The Thundering Herd Trap"
      simulation={sim}
      canvasHeight="min-h-[280px]"
      hints={["Press play and compare the left (bad) vs right (good) approach when the DB fails"]}
      canvas={
        <div className="grid grid-cols-2 gap-3 p-4 h-full">
          {/* Bad approach */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <XCircle className="size-3.5 text-red-400" />
              <span className="text-[11px] font-semibold text-red-400">Deep check on Liveness</span>
            </div>
            <div
              className={cn(
                "rounded-md border px-3 py-1.5 text-[11px] font-mono transition-all",
                dbStatus === "failing"
                  ? "border-red-500/30 bg-red-500/5 text-red-400"
                  : "border-emerald-500/30 bg-emerald-500/5 text-emerald-400"
              )}
            >
              Database: {dbStatus === "failing" ? "DOWN" : "UP"}
            </div>
            <div className="space-y-1">
              {badScenario.pods.map((pod) => (
                <div
                  key={pod.name}
                  className={cn(
                    "flex items-center justify-between rounded border px-2 py-1 text-[10px] transition-all",
                    pod.status === "restarting"
                      ? "border-amber-500/30 bg-amber-500/5 text-amber-400"
                      : pod.status === "failing"
                      ? "border-red-500/30 bg-red-500/5 text-red-400"
                      : "border-emerald-500/30 bg-emerald-500/5 text-emerald-400"
                  )}
                >
                  <span className="font-mono">{pod.name}</span>
                  <span>
                    {pod.status === "restarting" && (
                      <RefreshCw className="size-3 animate-spin inline mr-1" />
                    )}
                    {pod.status === "restarting"
                      ? "RESTARTING"
                      : pod.status === "failing"
                      ? "LIVENESS FAIL"
                      : "OK"}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground/70 leading-relaxed">{badScenario.note}</p>
          </div>

          {/* Good approach */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-emerald-400" />
              <span className="text-[11px] font-semibold text-emerald-400">Deep check on Readiness only</span>
            </div>
            <div
              className={cn(
                "rounded-md border px-3 py-1.5 text-[11px] font-mono transition-all",
                dbStatus === "failing"
                  ? "border-red-500/30 bg-red-500/5 text-red-400"
                  : "border-emerald-500/30 bg-emerald-500/5 text-emerald-400"
              )}
            >
              Database: {dbStatus === "failing" ? "DOWN" : "UP"}
            </div>
            <div className="space-y-1">
              {goodScenario.pods.map((pod) => (
                <div
                  key={pod.name}
                  className={cn(
                    "flex items-center justify-between rounded border px-2 py-1 text-[10px] transition-all",
                    pod.status === "warning"
                      ? "border-amber-500/30 bg-amber-500/5 text-amber-400"
                      : "border-emerald-500/30 bg-emerald-500/5 text-emerald-400"
                  )}
                >
                  <span className="font-mono">{pod.name}</span>
                  <span>
                    {pod.status === "warning" ? "OUT OF ROTATION" : "IN ROTATION"}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground/70 leading-relaxed">{goodScenario.note}</p>
          </div>
        </div>
      }
      explanation={
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>
            When a <strong>shared dependency</strong> (like a database) goes down, every pod that
            uses deep checks on its <em>liveness</em> probe fails simultaneously.
          </p>
          <p>
            The orchestrator restarts all pods at once. They all try to reconnect at the same
            moment — a <strong className="text-red-400">thundering herd</strong> that hammers the
            already-struggling database.
          </p>
          <p>
            Deep dependency checks belong on the <strong className="text-emerald-400">readiness probe</strong>.
            Pods leave the load balancer rotation but stay alive, ready to rejoin the moment
            the dependency recovers — with no restarts, no storms, no human intervention.
          </p>
        </div>
      }
    />
  );
}

// ─── Health Check Latency Chart ───────────────────────────────────────────────

function HealthCheckLatencyChart() {
  const [data, setData] = useState<{ t: string; shallow: number; deep: number }[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!isPlaying) return;
    let i = 0;
    const interval = setInterval(() => {
      setData((prev) => {
        const shallowBase = 1 + Math.random() * 2;
        const deepBase = 18 + Math.random() * 25;
        return [
          ...prev.slice(-24),
          {
            t: `${i++}`,
            shallow: parseFloat(shallowBase.toFixed(1)),
            deep: parseFloat(deepBase.toFixed(1)),
          },
        ];
      });
    }, 800);
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="space-y-2">
      <button
        onClick={() => setIsPlaying((p) => !p)}
        className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 border border-violet-500/20 transition-colors"
      >
        {isPlaying ? "⏸ Pause" : "▶ Start"}
      </button>
      <LiveChart
        type="latency"
        data={data}
        dataKeys={{
          x: "t",
          y: ["shallow", "deep"],
          label: ["Shallow /healthz", "Deep /ready"],
        }}
        height={200}
        unit="ms"
        referenceLines={[{ y: 50, label: "Timeout threshold", color: "#ef4444" }]}
        showLegend
      />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HealthChecksPage() {
  return (
    <div className="space-y-8">
      <TopicHero
        title="Health Checks"
        subtitle="A running process is not a healthy process. Your load balancer needs to know the difference — and so do you."
        difficulty="beginner"
      />

      <WhyCare>
        Kubernetes decides whether to restart your service based on <GlossaryTerm term="health check">health checks</GlossaryTerm>. Get them wrong and your app either never restarts when it should, or restarts constantly.
      </WhyCare>

      <ConversationalCallout type="question">
        If a server&apos;s process is running and its port is open, is it healthy? A database
        connection might be gone, the thread pool exhausted, or the app deadlocked — yet TCP says
        everything&apos;s fine. This is the zombie server problem.
      </ConversationalCallout>

      {/* Interactive: Main health check flow */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Interactive: Load Balancer Health Probes</h2>
        <p className="text-sm text-muted-foreground">
          The <GlossaryTerm term="load balancer">load balancer</GlossaryTerm> continuously probes each server. Toggle <strong>Live</strong> to simulate
          a deadlock (process stays running but is stuck). Toggle <strong>Ready</strong> to simulate
          a dependency failure (e.g., DB disconnected). Watch how the LB responds differently to each.
        </p>
        <HealthCheckPlayground />
      </section>

      {/* Three probe types */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Three Probes, Three Questions</h2>
        <p className="text-sm text-muted-foreground">
          Kubernetes popularized separating health checks into three distinct probes, each answering a
          fundamentally different question about your service. Confusing them — especially liveness and
          readiness — is one of the most common and dangerous platform mistakes.
        </p>
        <ProbeTypeComparison />
      </section>

      {/* Thundering herd anti-pattern */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">The Thundering Herd Anti-Pattern</h2>
        <p className="text-sm text-muted-foreground">
          The single most dangerous health check mistake: putting deep dependency checks on your
          liveness probe. Press play and watch what happens when the database goes down.
        </p>
        <ThunderingHerdDemo />
      </section>

      <AhaMoment
        question="Why is liveness probe failure more dangerous than readiness failure?"
        answer={
          <p>
            A readiness failure just removes the pod from the load balancer — it can recover on its
            own when the dependency comes back. A liveness failure triggers a <strong>pod restart</strong>.
            If 20 pods all fail their liveness probe simultaneously (because you put a DB check on it),
            the orchestrator restarts all 20 pods at once. They all try to reconnect to the same
            database at the same time — hammering it with connection requests exactly when it&apos;s
            most vulnerable. You&apos;ve turned a recoverable dependency outage into a cascading
            application meltdown.
          </p>
        }
      />

      {/* Shallow vs deep latency */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Shallow vs Deep Check Latency</h2>
        <p className="text-sm text-muted-foreground">
          Shallow checks (<code className="text-xs bg-muted px-1 rounded">/healthz</code>) complete
          in under 2ms — they just confirm the process can respond. Deep checks
          (<code className="text-xs bg-muted px-1 rounded">/ready</code>) verify upstream dependencies
          and take 20-50ms. This difference matters: your health check timeout must be set appropriately,
          and liveness probes should always be shallow.
        </p>
        <div className="rounded-lg border bg-muted/5 p-4">
          <HealthCheckLatencyChart />
        </div>
      </section>

      <BeforeAfter
        before={{
          title: "TCP Port Check Only",
          content: (
            <ul className="text-xs text-muted-foreground space-y-1.5">
              <li className="flex items-start gap-1.5">
                <XCircle className="size-3 text-red-400 shrink-0 mt-0.5" />
                Only verifies the port is open — says nothing about functionality
              </li>
              <li className="flex items-start gap-1.5">
                <XCircle className="size-3 text-red-400 shrink-0 mt-0.5" />
                Zombie servers (alive but broken) receive full traffic share
              </li>
              <li className="flex items-start gap-1.5">
                <XCircle className="size-3 text-red-400 shrink-0 mt-0.5" />
                Deadlocked processes run forever — manual intervention required
              </li>
              <li className="flex items-start gap-1.5">
                <XCircle className="size-3 text-red-400 shrink-0 mt-0.5" />
                No visibility into upstream dependency health
              </li>
            </ul>
          ),
        }}
        after={{
          title: "Startup + Liveness + Readiness Probes",
          content: (
            <ul className="text-xs text-muted-foreground space-y-1.5">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="size-3 text-emerald-400 shrink-0 mt-0.5" />
                Slow-starting apps protected from premature kills during init
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="size-3 text-emerald-400 shrink-0 mt-0.5" />
                Deadlocked pods automatically restarted within 30 seconds
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="size-3 text-emerald-400 shrink-0 mt-0.5" />
                Servers with failed dependencies removed from rotation in under 10s
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="size-3 text-emerald-400 shrink-0 mt-0.5" />
                Self-healing: pods rejoin rotation automatically when dependency recovers
              </li>
            </ul>
          ),
        }}
      />

      <ConversationalCallout type="warning">
        Not every dependency failure should make your readiness probe return 503. If your recommendation
        service is down but you can fall back to &ldquo;popular items,&rdquo; stay ready. Only fail readiness
        when you <em>genuinely cannot serve your primary function</em>. Over-sensitive readiness probes
        amplify outages by pulling healthy servers out of rotation.
      </ConversationalCallout>

      <ConversationalCallout type="tip">
        Probe timing rules of thumb: liveness at <strong>periodSeconds: 10, failureThreshold: 3</strong>
        (30s before restart). Readiness at <strong>periodSeconds: 5, failureThreshold: 2</strong> (10s
        before removal). Startup probe at <strong>failureThreshold: 30, periodSeconds: 10</strong> (5
        minutes for slow apps). Always set <strong>timeoutSeconds</strong> lower than your interval.
      </ConversationalCallout>

      <TopicQuiz
        questions={[
          {
            question: "What happens when a Kubernetes liveness probe fails?",
            options: [
              "The pod is removed from the load balancer but keeps running",
              "The pod is killed and restarted by the orchestrator",
              "An alert is sent to the operations team",
              "Traffic is gradually reduced to that pod",
            ],
            correctIndex: 1,
            explanation: "A liveness probe failure tells Kubernetes the process is stuck (e.g., deadlocked). The orchestrator kills and restarts the pod, which is a much more aggressive action than a readiness failure.",
          },
          {
            question: "Why should you NOT put database connectivity checks in a liveness probe?",
            options: [
              "Database checks are too slow to run frequently",
              "It would cause all pods to restart simultaneously if the DB goes down, creating a thundering herd",
              "Liveness probes cannot make network calls",
              "Database health is not important for application health",
            ],
            correctIndex: 1,
            explanation: "If a shared dependency like a database goes down, all pods fail their liveness probe simultaneously. The orchestrator restarts all pods at once, and they all try to reconnect at the same moment -- hammering the already-struggling database with a thundering herd of connections.",
          },
          {
            question: "A server's process is running and its TCP port is open, but its database connection pool is exhausted. Which probe type should detect this?",
            options: [
              "Startup probe",
              "Liveness probe",
              "Readiness probe",
              "No probe -- TCP check is sufficient",
            ],
            correctIndex: 2,
            explanation: "The readiness probe should detect dependency issues like an exhausted connection pool. The pod stays alive (it's not deadlocked) but is removed from the load balancer rotation until it can serve requests again.",
          },
        ]}
      />

      <KeyTakeaway
        points={[
          "A running process is not necessarily a healthy process. Health checks must verify actual functionality — not just that a port is open.",
          "Three probe types answer three different questions: Startup (finished initializing?), Liveness (alive and not stuck?), Readiness (can handle traffic right now?).",
          "Liveness failure → pod is KILLED and restarted. Readiness failure → pod is removed from load balancer but stays alive.",
          "Deep dependency checks (DB, cache, queue) belong on readiness probes only. Never on liveness — a shared dependency outage will trigger mass pod restarts and a thundering herd.",
          "Shallow checks (/healthz) take <2ms and confirm the process is responsive. Deep checks (/ready) take 20-50ms and verify upstream dependencies.",
          "Over-sensitive readiness probes amplify outages. Only fail readiness when the server cannot serve its primary function — use graceful degradation for non-critical dependencies.",
        ]}
      />
    </div>
  );
}
