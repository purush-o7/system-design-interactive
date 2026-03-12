"use client";

import { useState, useMemo, useEffect, useRef } from "react";
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
import { Skull, Wifi, Film, Users, BarChart3, Zap, Database, HardDrive } from "lucide-react";

// ---------------------------------------------------------------------------
// Full Architecture FlowDiagram
// ---------------------------------------------------------------------------
const archNodes: FlowNode[] = [
  // Clients
  { id: "tv", type: "clientNode", position: { x: 0, y: 0 }, data: { label: "Smart TV", sublabel: "Netflix App", status: "healthy", handles: { right: true } } },
  { id: "mobile", type: "clientNode", position: { x: 0, y: 80 }, data: { label: "Mobile", sublabel: "iOS / Android", status: "healthy", handles: { right: true } } },
  { id: "browser", type: "clientNode", position: { x: 0, y: 160 }, data: { label: "Browser", sublabel: "Web App", status: "healthy", handles: { right: true } } },
  // CDN / Edge
  { id: "oca-isp", type: "cacheNode", position: { x: 220, y: 0 }, data: { label: "OCA (ISP)", sublabel: "Edge appliance", status: "healthy", handles: { left: true, right: true } } },
  { id: "oca-ixp", type: "cacheNode", position: { x: 220, y: 80 }, data: { label: "OCA (IXP)", sublabel: "Peering site", status: "healthy", handles: { left: true, right: true } } },
  { id: "steering", type: "loadBalancerNode", position: { x: 220, y: 160 }, data: { label: "Steering DNS", sublabel: "Route to nearest OCA", handles: { left: true, right: true } } },
  // API Gateway
  { id: "zuul", type: "gatewayNode", position: { x: 440, y: 80 }, data: { label: "Zuul Gateway", sublabel: "Auth + routing", status: "healthy", handles: { left: true, right: true } } },
  // Microservices
  { id: "playback", type: "serverNode", position: { x: 640, y: 0 }, data: { label: "Playback API", sublabel: "Streaming logic", status: "healthy", handles: { left: true } } },
  { id: "recs", type: "serverNode", position: { x: 640, y: 80 }, data: { label: "Personalization", sublabel: "Rec engine", status: "healthy", handles: { left: true } } },
  { id: "search", type: "serverNode", position: { x: 640, y: 160 }, data: { label: "Search Service", sublabel: "Elasticsearch", status: "healthy", handles: { left: true } } },
  // Data
  { id: "kafka", type: "queueNode", position: { x: 640, y: 260 }, data: { label: "Apache Kafka", sublabel: "Event streaming", status: "healthy", handles: { left: true, right: true } } },
  { id: "cassandra", type: "databaseNode", position: { x: 860, y: 0 }, data: { label: "Cassandra", sublabel: "Viewing history", status: "healthy", handles: { left: true } } },
  { id: "dynamo", type: "databaseNode", position: { x: 860, y: 80 }, data: { label: "DynamoDB", sublabel: "Session state", status: "healthy", handles: { left: true } } },
  { id: "evcache", type: "cacheNode", position: { x: 860, y: 160 }, data: { label: "EVCache", sublabel: "Memcached cluster", status: "healthy", handles: { left: true } } },
  { id: "s3", type: "databaseNode", position: { x: 860, y: 260 }, data: { label: "S3 + Kafka sink", sublabel: "Events & video", status: "healthy", handles: { left: true } } },
];

const archEdges: FlowEdge[] = [
  { id: "tv-oca", source: "tv", target: "oca-isp", animated: true },
  { id: "mob-oca", source: "mobile", target: "oca-ixp", animated: true },
  { id: "br-steer", source: "browser", target: "steering", animated: true },
  { id: "oca-isp-zuul", source: "oca-isp", target: "zuul", animated: false },
  { id: "steer-zuul", source: "steering", target: "zuul", animated: false },
  { id: "zuul-play", source: "zuul", target: "playback", animated: true },
  { id: "zuul-recs", source: "zuul", target: "recs", animated: true },
  { id: "zuul-search", source: "zuul", target: "search", animated: true },
  { id: "play-kafka", source: "playback", target: "kafka", animated: true },
  { id: "recs-kafka", source: "recs", target: "kafka", animated: false },
  { id: "play-cass", source: "playback", target: "cassandra", animated: false },
  { id: "play-dyn", source: "playback", target: "dynamo", animated: false },
  { id: "recs-cache", source: "recs", target: "evcache", animated: false },
  { id: "kafka-s3", source: "kafka", target: "s3", animated: true },
];

// ---------------------------------------------------------------------------
// Open Connect CDN Pre-Positioning Playground
// ---------------------------------------------------------------------------
type OcaStatus = "empty" | "filling" | "ready" | "serving";

function OpenConnectPlayground() {
  const sim = useSimulation({ intervalMs: 700 });
  const tick = sim.tick;

  const phase = tick === 0 ? "idle" : tick < 5 ? "night-fill" : tick < 10 ? "ready" : "peak";

  const ocas: { id: string; isp: string; fill: number; status: OcaStatus }[] = useMemo(() => {
    const getFill = (offset: number) => {
      if (tick < 2 + offset) return 0;
      if (phase === "night-fill") return Math.min(100, (tick - 2 - offset) * 30);
      return 100;
    };
    const getStatus = (fill: number): OcaStatus => {
      if (fill === 0) return "empty";
      if (fill < 100) return "filling";
      if (phase === "peak") return "serving";
      return "ready";
    };
    const fills = [getFill(0), getFill(0.5), getFill(1), getFill(1.5)];
    return [
      { id: "oca-1", isp: "Comcast (US)", fill: fills[0], status: getStatus(fills[0]) },
      { id: "oca-2", isp: "BT (UK)", fill: fills[1], status: getStatus(fills[1]) },
      { id: "oca-3", isp: "DT (EU)", fill: fills[2], status: getStatus(fills[2]) },
      { id: "oca-4", isp: "SoftBank (JP)", fill: fills[3], status: getStatus(fills[3]) },
    ];
  }, [tick, phase]);

  const hitRate = phase === "idle" ? 0 : phase === "night-fill" ? Math.min(95, tick * 20) : 97;

  const statusColor: Record<OcaStatus, string> = {
    empty: "border-border/30 bg-muted/10",
    filling: "border-amber-500/30 bg-amber-500/5",
    ready: "border-emerald-500/30 bg-emerald-500/5",
    serving: "border-cyan-500/30 bg-cyan-500/5",
  };

  const statusLabel: Record<OcaStatus, string> = {
    empty: "Empty",
    filling: "Pre-filling…",
    ready: "Ready",
    serving: "Serving",
  };

  const phaseLabel: Record<string, string> = {
    idle: "Off-peak — OCAs idle",
    "night-fill": "Night — OCAs pre-loading popular titles from origin",
    ready: "Morning — OCAs fully loaded",
    peak: "Peak hours — 97% of bytes from local OCA, never hitting origin",
  };

  return (
    <Playground
      title="Open Connect CDN Pre-Positioning"
      simulation={sim}
      canvasHeight="min-h-[300px]"
      canvas={
        <div className="p-4 space-y-4 h-full">
          <div className="text-xs font-medium text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 rounded-md px-3 py-2">
            {phaseLabel[phase]}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {ocas.map((oca) => (
              <div key={oca.id} className={cn("rounded-lg border p-3 transition-all duration-500", statusColor[oca.status])}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium">{oca.isp}</span>
                  <span className={cn("text-[10px] font-mono", oca.status === "serving" ? "text-cyan-400" : oca.status === "ready" ? "text-emerald-400" : oca.status === "filling" ? "text-amber-400" : "text-muted-foreground")}>
                    {statusLabel[oca.status]}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all duration-700", oca.status === "serving" ? "bg-cyan-500" : oca.status === "ready" ? "bg-emerald-500" : "bg-amber-500")}
                    style={{ width: `${oca.fill}%` }}
                  />
                </div>
                <div className="mt-1 text-[10px] text-muted-foreground">{Math.round(oca.fill)}% capacity filled</div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-border/30 bg-muted/10 px-3 py-2">
            <span className="text-xs text-muted-foreground">Edge hit rate:</span>
            <div className="flex-1 h-2 rounded-full bg-muted/30 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                style={{ width: `${hitRate}%` }}
              />
            </div>
            <span className="text-xs font-mono text-emerald-400">{hitRate}%</span>
          </div>
        </div>
      }
      explanation={
        <div className="space-y-3">
          <p className="font-medium text-foreground text-sm">How it works</p>
          <ul className="space-y-2 text-xs text-muted-foreground list-disc list-inside">
            <li>During off-peak hours (2–8 AM), Netflix pre-fills OCAs with the next day&apos;s predicted popular content</li>
            <li>Each OCA holds up to 280 TB and can serve 100 Gbps</li>
            <li>At peak, 97%+ of video bytes serve from the viewer&apos;s own ISP — never crossing the open internet</li>
            <li>Steering DNS routes each client to the nearest healthy OCA in milliseconds</li>
          </ul>
        </div>
      }
    />
  );
}

// ---------------------------------------------------------------------------
// Adaptive Bitrate Playground (Netflix-specific)
// ---------------------------------------------------------------------------
function AbrPlayground() {
  const sim = useSimulation({ intervalMs: 900 });
  const tick = sim.tick;
  const bwRef = useRef(15);

  const bandwidth = useMemo(() => {
    if (tick === 0) { bwRef.current = 15; return 15; }
    const delta = (Math.sin(tick * 0.7) * 6) + (Math.random() - 0.5) * 4;
    bwRef.current = Math.max(0.5, Math.min(30, bwRef.current + delta * 0.4));
    return bwRef.current;
  }, [tick]);

  const qualities = [
    { label: "240p", minMbps: 0.3, codec: "H.264", color: "bg-red-500" },
    { label: "480p", minMbps: 1.5, codec: "H.264", color: "bg-amber-500" },
    { label: "720p", minMbps: 4, codec: "VP9", color: "bg-blue-500" },
    { label: "1080p", minMbps: 8, codec: "VP9", color: "bg-emerald-500" },
    { label: "4K HDR", minMbps: 16, codec: "AV1", color: "bg-violet-500" },
  ];

  const active = [...qualities].reverse().find((q) => bandwidth >= q.minMbps) ?? qualities[0];
  const bufferHealth = Math.min(100, Math.round((bandwidth / 30) * 100));

  const chartData = useMemo(() => {
    const points = [];
    for (let i = 0; i <= Math.min(tick, 20); i++) {
      const bw = 8 + Math.sin(i * 0.7) * 5 + Math.cos(i * 1.3) * 3;
      const q = [...qualities].reverse().find((ql) => bw >= ql.minMbps) ?? qualities[0];
      const qIdx = qualities.findIndex((ql) => ql.label === q.label);
      points.push({ t: `T${i}`, bw: Math.round(bw * 10) / 10, quality: qIdx + 1 });
    }
    return points;
  }, [tick]);

  return (
    <Playground
      title="Netflix Adaptive Bitrate Streaming"
      simulation={sim}
      canvasHeight="min-h-[360px]"
      canvas={
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-6 flex-wrap">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Bandwidth</span>
              <div className="text-xl font-mono font-bold text-foreground">{bandwidth.toFixed(1)} <span className="text-sm font-normal text-muted-foreground">Mbps</span></div>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Quality</span>
              <div className={cn("text-xl font-bold", active.label === "4K HDR" ? "text-violet-400" : active.label === "1080p" ? "text-emerald-400" : active.label === "720p" ? "text-blue-400" : active.label === "480p" ? "text-amber-400" : "text-red-400")}>
                {active.label}
              </div>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Codec</span>
              <div className="text-sm font-mono text-foreground">{active.codec}</div>
            </div>
          </div>

          {/* Quality ladder bars */}
          <div className="flex gap-2 items-end">
            {qualities.map((q, i) => {
              const isActive = q.label === active.label;
              return (
                <div key={q.label} className="flex flex-col items-center gap-1 flex-1">
                  <div
                    className={cn("w-full rounded-t-sm transition-all duration-500", isActive ? q.color : "bg-muted/30")}
                    style={{ height: `${(i + 1) * 14}px` }}
                  />
                  <span className={cn("text-[9px]", isActive ? "text-foreground font-semibold" : "text-muted-foreground")}>{q.label}</span>
                  <span className="text-[8px] text-muted-foreground/60">{q.minMbps}+</span>
                </div>
              );
            })}
          </div>

          {/* Buffer bar */}
          <div>
            <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
              <span>Buffer health</span>
              <span className="font-mono">{bufferHealth}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all duration-500", bufferHealth > 60 ? "bg-emerald-500" : bufferHealth > 30 ? "bg-amber-500" : "bg-red-500")}
                style={{ width: `${bufferHealth}%` }}
              />
            </div>
          </div>

          {/* Chart */}
          <LiveChart
            type="line"
            data={chartData}
            dataKeys={{ x: "t", y: ["bw", "quality"], label: ["Bandwidth (Mbps)", "Quality tier (1-5)"] }}
            height={120}
          />
        </div>
      }
      explanation={
        <div className="space-y-3">
          <p className="font-medium text-foreground text-sm">Netflix ABR details</p>
          <ul className="space-y-2 text-xs text-muted-foreground list-disc list-inside">
            <li>Each title encoded into ~1,200 files: 5 resolutions × multiple codecs × ~50 bitrate levels</li>
            <li>AV1 achieves 4K at 7–10 Mbps vs H.264&apos;s 15–25 Mbps — 40% bandwidth savings</li>
            <li>Per-title encoding: animation needs fewer bits than action at the same resolution</li>
            <li>Client buffers 30 s ahead and smoothly switches quality between segments</li>
          </ul>
        </div>
      }
    />
  );
}

// ---------------------------------------------------------------------------
// Chaos Monkey Simulation Playground
// ---------------------------------------------------------------------------
const SERVICE_NAMES = [
  "Auth Service",
  "Playback API",
  "Search",
  "Rec Engine",
  "Billing",
  "User API",
  "Streaming",
  "Metadata",
];

type ServiceState = "healthy" | "killed" | "recovering";

function ChaosMonkeyPlayground() {
  const sim = useSimulation({ intervalMs: 1200 });
  const tick = sim.tick;

  const [log, setLog] = useState<string[]>(["Chaos Monkey standing by…"]);
  const logRef = useRef(log);
  logRef.current = log;

  const serviceStates = useMemo<ServiceState[]>(() => {
    const states: ServiceState[] = SERVICE_NAMES.map(() => "healthy");
    if (tick === 0) return states;
    const killedIdx = tick % SERVICE_NAMES.length;
    const recovering = (tick - 1) % SERVICE_NAMES.length;
    states[killedIdx] = "killed";
    if (recovering !== killedIdx) states[recovering] = "recovering";
    return states;
  }, [tick]);

  useEffect(() => {
    if (tick === 0) { setLog(["Chaos Monkey standing by…"]); return; }
    const killedIdx = tick % SERVICE_NAMES.length;
    const name = SERVICE_NAMES[killedIdx];
    setLog((prev) => [`T${tick}: Chaos Monkey killed "${name}" — system rerouting…`, ...prev.slice(0, 7)]);
  }, [tick]);

  const killedCount = serviceStates.filter((s) => s === "killed").length;
  const healthyCount = serviceStates.filter((s) => s === "healthy").length;

  const stateStyle: Record<ServiceState, string> = {
    healthy: "border-emerald-500/30 bg-emerald-500/5",
    killed: "border-red-500/40 bg-red-500/10 animate-pulse",
    recovering: "border-amber-500/30 bg-amber-500/5",
  };

  const dotStyle: Record<ServiceState, string> = {
    healthy: "bg-emerald-500",
    killed: "bg-red-500",
    recovering: "bg-amber-500",
  };

  const stateText: Record<ServiceState, string> = {
    healthy: "UP",
    killed: "KILLED",
    recovering: "RESTART",
  };

  return (
    <Playground
      title="Chaos Monkey — Resilience Testing in Production"
      simulation={sim}
      canvasHeight="min-h-[360px]"
      canvas={
        <div className="p-4 space-y-4">
          {/* Status bar */}
          <div className="flex gap-3 text-xs">
            <span className="text-emerald-400 font-mono">{healthyCount} healthy</span>
            <span className="text-red-400 font-mono">{killedCount} killed</span>
            <span className="ml-auto text-muted-foreground">System still serving: <span className="text-emerald-400 font-semibold">YES</span></span>
          </div>

          {/* Service grid */}
          <div className="grid grid-cols-4 gap-2">
            {SERVICE_NAMES.map((name, i) => {
              const state = serviceStates[i];
              return (
                <div key={name} className={cn("rounded-lg border px-2 py-2.5 text-center transition-all duration-400", stateStyle[state])}>
                  <div className={cn("size-2 rounded-full mx-auto mb-1.5", dotStyle[state])} />
                  <div className="text-[10px] font-medium leading-tight">{name}</div>
                  <div className={cn("text-[9px] mt-0.5 font-mono", state === "killed" ? "text-red-400" : state === "recovering" ? "text-amber-400" : "text-emerald-400/60")}>
                    {stateText[state]}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Event log */}
          <div className="rounded-lg border border-border/30 bg-black/20 p-2 font-mono space-y-0.5 max-h-24 overflow-hidden">
            {log.map((entry, i) => (
              <div key={i} className={cn("text-[10px]", i === 0 ? "text-red-400" : "text-muted-foreground/50")}>{entry}</div>
            ))}
          </div>
        </div>
      }
      explanation={
        <div className="space-y-3">
          <p className="font-medium text-foreground text-sm">The Simian Army</p>
          <ul className="space-y-2 text-xs text-muted-foreground list-disc list-inside">
            <li><strong>Chaos Monkey</strong> — kills random EC2 instances in production</li>
            <li><strong>Chaos Kong</strong> — simulates entire AWS region failure</li>
            <li><strong>Latency Monkey</strong> — injects artificial delays</li>
            <li><strong>Conformity Monkey</strong> — enforces best practices</li>
          </ul>
          <p className="text-xs text-muted-foreground">Philosophy: if you haven&apos;t tested failure in production, your first test will be during a real outage.</p>
        </div>
      }
    />
  );
}

// ---------------------------------------------------------------------------
// Scale LiveCharts
// ---------------------------------------------------------------------------

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const subscriberData = MONTHS.map((m, i) => ({ month: m, subscribers: Math.round(180 + i * 2.2 + Math.sin(i) * 1.5) }));
const streamData = MONTHS.map((m, i) => ({ month: m, streams: Math.round(25 + i * 0.8 + Math.cos(i * 0.9) * 2) }));
const bandwidthData = MONTHS.map((m, i) => ({ month: m, tbps: Math.round(300 + i * 10 + Math.sin(i * 1.1) * 15) }));

// ---------------------------------------------------------------------------
// Polyglot Persistence Table
// ---------------------------------------------------------------------------
const datastores = [
  { db: "Apache Cassandra", use: "Viewing history, ratings, bookmarks", why: "Write-heavy, eventually consistent, scales horizontally to billions of rows", icon: <Database className="size-4 text-amber-400" /> },
  { db: "Amazon DynamoDB", use: "Session state, device tokens", why: "Single-digit millisecond key-value lookups at any scale", icon: <Database className="size-4 text-blue-400" /> },
  { db: "Amazon S3", use: "Video master files, encoded segments", why: "Petabyte-scale object storage with 99.999999999% durability", icon: <HardDrive className="size-4 text-emerald-400" /> },
  { db: "MySQL (Vitess)", use: "Billing, subscriptions", why: "Strong consistency for financial transactions via horizontal sharding", icon: <Database className="size-4 text-violet-400" /> },
  { db: "EVCache (Memcached)", use: "Personalization, API responses", why: "30 M+ ops/sec cluster-wide — avoids thundering herd on databases", icon: <Zap className="size-4 text-orange-400" /> },
  { db: "Elasticsearch", use: "Content search, log analytics", why: "Full-text search over 17 K+ titles; real-time log aggregation", icon: <BarChart3 className="size-4 text-cyan-400" /> },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function NetflixCaseStudyPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <TopicHero
        title="Netflix"
        subtitle="How Netflix streams 4K video to 200 M+ subscribers in 190 countries — a deep dive into Open Connect, microservices, Chaos Engineering, and adaptive bitrate."
        difficulty="advanced"
        estimatedMinutes={25}
      />

      <AhaMoment
        question="Before reading: design a video streaming service for 200 M users. What's your biggest architectural challenge?"
        answer={
          <div className="space-y-2 text-sm">
            <p className="font-medium text-foreground">Key constraints Netflix solved:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>30 M concurrent streams at peak — more than any single CDN can serve cheaply</li>
              <li>4K HDR at 18+ Mbps per stream means terabits per second of total throughput</li>
              <li>Sub-200 ms play-start — cold starts kill engagement more than quality drops</li>
              <li>99.99% uptime — every minute down costs ~$60 K in lost revenue</li>
              <li>190 countries with wildly different network conditions and ISP relationships</li>
            </ul>
          </div>
        }
      />

      {/* --- Full Architecture --- */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Full Architecture</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Netflix splits into two planes: the <strong>control plane</strong> on AWS (APIs, microservices, data) and the <strong>data plane</strong> on its own Open Connect CDN (actual video bytes). Drag nodes to explore.
        </p>
        <div className="rounded-xl border border-border/40 overflow-hidden">
          <FlowDiagram
            nodes={archNodes}
            edges={archEdges}
            minHeight={380}
            allowDrag={true}
            fitView={true}
            interactive={true}
          />
        </div>
        <ConversationalCallout type="tip">
          The key insight: video bytes never touch the AWS control plane. They go Client → OCA (inside the viewer&apos;s own ISP) → done. The control plane only handles the ~few KB of metadata needed to start playback.
        </ConversationalCallout>
      </section>

      {/* --- Scale Numbers --- */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Netflix at Scale</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          These numbers frame every design decision. Press play to watch the metrics grow over 2023.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-border/40 bg-muted/5 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Users className="size-4 text-blue-400" />
              <span className="text-xs text-muted-foreground">Subscribers</span>
            </div>
            <LiveChart type="area" data={subscriberData} dataKeys={{ x: "month", y: "subscribers" }} height={120} unit="M" />
          </div>
          <div className="rounded-xl border border-border/40 bg-muted/5 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Film className="size-4 text-violet-400" />
              <span className="text-xs text-muted-foreground">Concurrent Streams (peak)</span>
            </div>
            <LiveChart type="area" data={streamData} dataKeys={{ x: "month", y: "streams" }} height={120} unit="M" />
          </div>
          <div className="rounded-xl border border-border/40 bg-muted/5 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Wifi className="size-4 text-emerald-400" />
              <span className="text-xs text-muted-foreground">CDN Bandwidth</span>
            </div>
            <LiveChart type="area" data={bandwidthData} dataKeys={{ x: "month", y: "tbps" }} height={120} unit="Tbps" referenceLines={[{ y: 400, label: "400 Tbps peak", color: "#f59e0b" }]} />
          </div>
        </div>
      </section>

      {/* --- Open Connect Simulation --- */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Open Connect CDN — Pre-Positioning</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Netflix built its own CDN rather than paying Akamai. <strong>Open Connect Appliances (OCAs)</strong> — custom servers holding up to 280 TB — sit inside ISP data centers. At night they pull down tomorrow&apos;s popular content so that by peak time, 97% of bytes never leave the ISP&apos;s own network.
        </p>
        <OpenConnectPlayground />
        <ConversationalCallout type="tip">
          Netflix makes OCAs free for ISPs to host — the ISP saves backbone transit costs, Netflix saves CDN fees. Classic two-sided win.
        </ConversationalCallout>
      </section>

      {/* --- Adaptive Bitrate --- */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Adaptive Bitrate Streaming</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Every Netflix title is encoded into roughly <strong>1,200 files</strong> — five resolutions, three codecs (H.264, VP9, AV1), and ~50 bitrate levels per combination. The player monitors bandwidth every few seconds and seamlessly switches between quality tiers mid-stream.
        </p>
        <AbrPlayground />
        <BeforeAfter
          before={{
            title: "Fixed Bitrate (pre-ABR)",
            content: (
              <div className="space-y-1.5 text-sm text-muted-foreground">
                <p>Single bitrate chosen at start of stream</p>
                <p>Network dip → buffering for seconds</p>
                <p>Users abandon stream or lower quality manually</p>
                <p className="text-red-400 font-medium">High abandonment on poor networks</p>
              </div>
            ),
          }}
          after={{
            title: "Adaptive Bitrate (ABR)",
            content: (
              <div className="space-y-1.5 text-sm text-muted-foreground">
                <p>Player measures bandwidth continuously</p>
                <p>Network dip → seamless quality switch in &lt;2 s</p>
                <p>Buffer stays healthy; no spinner visible to user</p>
                <p className="text-emerald-400 font-medium">Uninterrupted viewing on any network</p>
              </div>
            ),
          }}
        />
      </section>

      {/* --- Chaos Monkey --- */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Chaos Engineering</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Netflix invented the <strong>Simian Army</strong> — tools that deliberately break production systems to prove resilience. <em>Chaos Monkey</em> kills random EC2 instances every day. The philosophy: a failure you have tested is a failure you can recover from gracefully.
        </p>
        <ChaosMonkeyPlayground />
        <ConversationalCallout type="warning">
          This runs in <em>production</em>, not staging. Netflix found that teams who never saw failures in production built much more fragile systems than teams who dealt with them weekly.
        </ConversationalCallout>
      </section>

      {/* --- Microservices & Resilience --- */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Microservices + Circuit Breakers</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Netflix migrated from a monolith to <strong>700+ microservices</strong> after a database corruption event in 2008 killed DVD shipping for three days. Each service runs independently on AWS and communicates via REST or gRPC. <strong>Hystrix</strong> (now resilience4j) wraps every outbound call in a circuit breaker.
        </p>
        <BeforeAfter
          before={{
            title: "Without Circuit Breakers",
            content: (
              <div className="space-y-1.5 text-sm text-muted-foreground">
                <p>Service A calls Service B synchronously</p>
                <p>B slows down → A&apos;s thread pool fills up</p>
                <p>A becomes unresponsive</p>
                <p>Retries cascade up the entire call chain</p>
                <p className="text-red-400 font-medium">Full platform outage (Christmas Eve 2012)</p>
              </div>
            ),
          }}
          after={{
            title: "With Hystrix / Circuit Breakers",
            content: (
              <div className="space-y-1.5 text-sm text-muted-foreground">
                <p>Circuit opens after 5 consecutive B failures</p>
                <p>A returns a cached or default response instantly</p>
                <p>B gets time to recover without being flooded</p>
                <p>Circuit half-opens after timeout to probe recovery</p>
                <p className="text-emerald-400 font-medium">Graceful degradation — platform stays up</p>
              </div>
            ),
          }}
        />
        <ConversationalCallout type="question">
          What should the fallback be when the Recommendation service is down? Netflix shows generic &ldquo;Top 10 in your country&rdquo; rows — not a 500 error. What fallback makes sense for each of your services?
        </ConversationalCallout>
      </section>

      {/* --- Polyglot Persistence --- */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Polyglot Persistence</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Netflix uses the right database for each workload rather than forcing everything into one system. This is called polyglot persistence.
        </p>
        <div className="space-y-2">
          {datastores.map((item) => (
            <div key={item.db} className="flex items-start gap-3 rounded-lg border border-border/30 bg-muted/10 px-3 py-2.5">
              {item.icon}
              <div>
                <p className="text-xs font-semibold">{item.db}</p>
                <p className="text-[11px] text-muted-foreground">{item.use}</p>
                <p className="text-[10px] text-muted-foreground/70 italic mt-0.5">{item.why}</p>
              </div>
            </div>
          ))}
        </div>
        <ConversationalCallout type="tip">
          Cassandra is the most important data choice here. It was chosen because viewing history is an append-only, write-heavy workload with massive fan-out — exactly what Cassandra&apos;s log-structured storage and wide-row model excel at.
        </ConversationalCallout>
      </section>

      {/* --- Event Pipeline --- */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Real-Time Event Pipeline</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Netflix processes <strong>billions of events per day</strong> — every play, pause, seek, search, thumbs-up, and browse action. Apache Kafka ingests all events; Apache Flink processes them in real time to update recommendation models; long-term analytics land in S3 via Apache Spark.
        </p>
        <div className="rounded-xl border border-border/40 overflow-hidden">
          <FlowDiagram
            nodes={[
              { id: "client-ev", type: "clientNode", position: { x: 0, y: 60 }, data: { label: "Netflix Client", sublabel: "Play / pause / seek", status: "healthy", handles: { right: true } } },
              { id: "kafka-ev", type: "queueNode", position: { x: 200, y: 60 }, data: { label: "Apache Kafka", sublabel: "700 B events/day", status: "healthy", handles: { left: true, right: true, bottom: true } } },
              { id: "flink", type: "serverNode", position: { x: 420, y: 0 }, data: { label: "Apache Flink", sublabel: "Real-time processing", status: "healthy", handles: { left: true, right: true } } },
              { id: "spark", type: "serverNode", position: { x: 420, y: 120 }, data: { label: "Apache Spark", sublabel: "Batch analytics", status: "healthy", handles: { left: true, right: true } } },
              { id: "recs-ev", type: "databaseNode", position: { x: 640, y: 0 }, data: { label: "Rec Models", sublabel: "Updated in minutes", status: "healthy", handles: { left: true } } },
              { id: "s3-ev", type: "databaseNode", position: { x: 640, y: 120 }, data: { label: "Data Lake (S3)", sublabel: "Long-term analytics", status: "healthy", handles: { left: true } } },
            ]}
            edges={[
              { id: "ev1", source: "client-ev", target: "kafka-ev", animated: true },
              { id: "ev2", source: "kafka-ev", target: "flink", animated: true },
              { id: "ev3", source: "kafka-ev", target: "spark", animated: true },
              { id: "ev4", source: "flink", target: "recs-ev", animated: true },
              { id: "ev5", source: "spark", target: "s3-ev", animated: true },
            ]}
            minHeight={220}
            allowDrag={true}
            fitView={true}
          />
        </div>
        <p className="text-[11px] text-muted-foreground">
          Recommendation models update within minutes of user behavior — not overnight batches. This is why Netflix&apos;s home screen adapts to what you watched an hour ago.
        </p>
      </section>

      <KeyTakeaway
        points={[
          "Build your own CDN if video delivery is your product — Netflix's Open Connect saves hundreds of millions annually vs third-party CDNs, and it achieves 97%+ edge hit rates by pre-positioning content overnight.",
          "Chaos Engineering is mandatory at scale — Chaos Monkey and the Simian Army run in production daily. Untested failure modes become catastrophic surprises; tested ones become routine recovery.",
          "Encode once for many networks — ~1,200 files per title with AV1 (4K at 7 Mbps) vs H.264 (15 Mbps) means ABR can serve everyone from 3G mobile to fiber gigabit without buffering.",
          "Polyglot persistence over one-size-fits-all — Cassandra for append-heavy history, DynamoDB for key-value sessions, MySQL/Vitess for ACID billing, EVCache for hot reads. Choose the right tool per workload.",
          "Circuit breakers prevent cascading failures — one slow microservice must never take down the whole platform; fallbacks like 'Top 10' rows keep users watching even during partial outages.",
          "Personalization is a retention moat — 80% of watched content comes from recommendations, not search, saving Netflix an estimated $1 B/year in churn. Real-time Kafka → Flink pipelines update models in minutes.",
        ]}
      />
    </div>
  );
}
