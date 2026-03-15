"use client";

import { useState, useCallback, useMemo } from "react";
import { TopicHero } from "@/components/topic-hero";
import { KeyTakeaway } from "@/components/key-takeaway";
import { AhaMoment } from "@/components/aha-moment";
import { ConversationalCallout } from "@/components/conversational-callout";
import { BeforeAfter } from "@/components/before-after";
import { Playground } from "@/components/playground";
import { FlowDiagram, type FlowNode, type FlowEdge } from "@/components/flow-diagram";
import { LiveChart } from "@/components/live-chart";
import { useSimulation } from "@/hooks/use-simulation";
import { SimulationControls } from "@/components/simulation-controls";
import { cn } from "@/lib/utils";
import { WhyCare } from "@/components/why-care";
import { GlossaryTerm } from "@/components/glossary-term";
import { TopicQuiz } from "@/components/topic-quiz";

import { Pencil, BookOpen, ArrowRight, Zap, AlertTriangle, Database } from "lucide-react";

/* ───────────────────────── types ───────────────────────── */
type WriteStrategy = "Write-Through" | "Write-Back" | "Write-Around";
type AnimPhase = "idle" | "write" | "read-hit" | "read-miss";

type Stats = {
  writes: number;
  reads: number;
  hits: number;
  misses: number;
  cacheEntries: number;
  pendingFlush: number;
  totalLatency: number;
};

const INITIAL_STATS: Stats = {
  writes: 0,
  reads: 0,
  hits: 0,
  misses: 0,
  cacheEntries: 0,
  pendingFlush: 0,
  totalLatency: 0,
};

/* ──────────── helpers ──────────── */
function hitRatio(s: Stats) {
  return s.reads === 0 ? 0 : Math.round((s.hits / s.reads) * 100);
}

/* ──────────────────── Main Strategy Playground ──────────────────── */
function WriteStrategyPlayground() {
  const [strategy, setStrategy] = useState<WriteStrategy>("Write-Through");
  const [phase, setPhase] = useState<AnimPhase>("idle");
  const [stats, setStats] = useState<Stats>(INITIAL_STATS);
  const [animTick, setAnimTick] = useState(0);
  const [hitLog, setHitLog] = useState<{ t: number; ratio: number }[]>([]);

  const sim = useSimulation({
    intervalMs: 600,
    onTick: useCallback((tick: number) => {
      setAnimTick((p) => p + 1);

      // Write-Back: auto-flush pending writes every 4 ticks
      setStats((prev) => {
        if (strategy === "Write-Back" && prev.pendingFlush > 0 && tick % 4 === 0) {
          setPhase("write");
          setTimeout(() => setPhase("idle"), 500);
          return { ...prev, pendingFlush: 0 };
        }
        return prev;
      });
    }, [strategy]),
    onReset: useCallback(() => {
      setPhase("idle");
      setStats(INITIAL_STATS);
      setAnimTick(0);
      setHitLog([]);
    }, []),
  });

  const doWrite = useCallback(() => {
    setPhase("write");
    setStats((prev) => {
      const next = { ...prev, writes: prev.writes + 1 };
      if (strategy === "Write-Through") {
        next.cacheEntries = Math.min(prev.cacheEntries + 1, 50);
        next.totalLatency += 6;
      } else if (strategy === "Write-Back") {
        next.cacheEntries = Math.min(prev.cacheEntries + 1, 50);
        next.pendingFlush += 1;
        next.totalLatency += 1;
      } else {
        next.totalLatency += 3;
      }
      return next;
    });
    setTimeout(() => setPhase("idle"), 800);
  }, [strategy]);

  const doRead = useCallback(() => {
    setStats((prev) => {
      const isHit = prev.cacheEntries > 0 && Math.random() < (prev.cacheEntries / (prev.cacheEntries + 5));
      const next = {
        ...prev,
        reads: prev.reads + 1,
        hits: prev.hits + (isHit ? 1 : 0),
        misses: prev.misses + (isHit ? 0 : 1),
        cacheEntries: isHit ? prev.cacheEntries : Math.min(prev.cacheEntries + 1, 50),
        totalLatency: prev.totalLatency + (isHit ? 0.1 : 6),
      };
      setPhase(isHit ? "read-hit" : "read-miss");
      setHitLog((log) => [...log, { t: log.length, ratio: hitRatio(next) }].slice(-30));
      return next;
    });
    setTimeout(() => setPhase("idle"), 800);
  }, [strategy]);

  /* ── build flow nodes ── */
  const nodes: FlowNode[] = useMemo(() => {
    const cacheActive =
      phase === "write" && strategy !== "Write-Around" ||
      phase === "read-hit" ||
      phase === "read-miss";
    const dbActive =
      phase === "write" && strategy !== "Write-Back" ||
      phase === "read-miss" ||
      (phase === "write" && strategy === "Write-Back" && stats.pendingFlush > 0 && animTick % 4 === 0);

    return [
      {
        id: "app",
        type: "serverNode" as const,
        position: { x: 50, y: 100 },
        data: {
          label: "App Server",
          sublabel: phase === "idle" ? "waiting" : phase === "write" ? "writing..." : "reading...",
          status: phase !== "idle" ? ("healthy" as const) : ("idle" as const),
          metrics: [
            { label: "Writes", value: String(stats.writes) },
            { label: "Reads", value: String(stats.reads) },
          ],
          handles: { right: true },
        },
      },
      {
        id: "cache",
        type: "cacheNode" as const,
        position: { x: 300, y: 30 },
        data: {
          label: "Redis Cache",
          sublabel: strategy === "Write-Around" && phase === "write"
            ? "bypassed"
            : `${stats.cacheEntries} entries`,
          status: cacheActive
            ? phase === "read-hit" ? ("healthy" as const) : ("warning" as const)
            : ("idle" as const),
          metrics: [
            { label: "Hit Rate", value: `${hitRatio(stats)}%` },
            ...(strategy === "Write-Back" ? [{ label: "Pending", value: String(stats.pendingFlush) }] : []),
          ],
          handles: { left: true, bottom: true },
        },
      },
      {
        id: "db",
        type: "databaseNode" as const,
        position: { x: 300, y: 190 },
        data: {
          label: "PostgreSQL",
          sublabel: dbActive ? "processing" : "idle",
          status: dbActive ? ("warning" as const) : ("idle" as const),
          metrics: [
            { label: "Queries", value: String(stats.writes + stats.misses) },
          ],
          handles: { left: true, top: true },
        },
      },
    ];
  }, [phase, strategy, stats, animTick]);

  /* ── build flow edges ── */
  const edges: FlowEdge[] = useMemo(() => {
    const writingToCache = phase === "write" && strategy !== "Write-Around";
    const writingToDb = phase === "write" && strategy !== "Write-Back";
    const writingDirectDb = phase === "write" && strategy === "Write-Around";
    const flushingToDb = phase === "write" && strategy === "Write-Back" && stats.pendingFlush > 0 && animTick % 4 === 0;
    const readFromCache = phase === "read-hit";
    const readMissToDb = phase === "read-miss";

    return [
      {
        id: "app-cache",
        source: "app",
        target: "cache",
        animated: writingToCache || readFromCache || readMissToDb,
        style: {
          stroke: readFromCache ? "#22c55e" : writingToCache ? "#3b82f6" : readMissToDb ? "#f59e0b" : "#555",
          strokeWidth: writingToCache || readFromCache || readMissToDb ? 3 : 1.5,
        },
        label: readFromCache ? "HIT!" : readMissToDb ? "MISS" : writingToCache ? "write" : "",
      },
      {
        id: "app-db",
        source: "app",
        target: "db",
        animated: writingDirectDb || readMissToDb,
        style: {
          stroke: writingDirectDb ? "#f59e0b" : readMissToDb ? "#f59e0b" : "#555",
          strokeWidth: writingDirectDb || readMissToDb ? 3 : 1.5,
        },
        label: writingDirectDb ? "direct write" : readMissToDb ? "fetch" : "",
      },
      {
        id: "cache-db",
        source: "cache",
        target: "db",
        animated: (writingToDb && strategy === "Write-Through") || flushingToDb,
        style: {
          stroke: flushingToDb ? "#a855f7" : writingToDb && strategy === "Write-Through" ? "#3b82f6" : "#555",
          strokeWidth: (writingToDb && strategy === "Write-Through") || flushingToDb ? 3 : 1.5,
        },
        label: flushingToDb ? "flush" : writingToDb && strategy === "Write-Through" ? "sync" : "",
      },
    ];
  }, [phase, strategy, stats.pendingFlush, animTick]);

  /* ── strategy descriptions ── */
  const descriptions: Record<WriteStrategy, { short: string; detail: string; writeLatency: string; risk: string }> = {
    "Write-Through": {
      short: "Write to cache AND database synchronously",
      detail: "Every write updates both the cache and the database before acknowledging the client. The cache is never stale, but writes pay double latency.",
      writeLatency: "~6ms",
      risk: "Higher write latency",
    },
    "Write-Back": {
      short: "Write to cache only, flush later",
      detail: "Writes go to cache immediately. The client gets a fast ACK. Data flushes to the database asynchronously in batches (watch for the purple flush arrow).",
      writeLatency: "<1ms",
      risk: "Data loss if cache crashes",
    },
    "Write-Around": {
      short: "Write directly to database, bypass cache",
      detail: "Writes skip the cache entirely. The cache only gets populated when data is read (on a miss). Prevents cache pollution from write-heavy data nobody reads.",
      writeLatency: "~3ms",
      risk: "High miss rate initially",
    },
  };

  const desc = descriptions[strategy];

  return (
    <div className="space-y-4">
      <Playground
        title="Write Strategy Simulator"
        simulation={sim}
        canvasHeight="min-h-[320px]"
        hints={["Switch strategies and click Write/Read to see how data flows differently"]}
        canvas={
          <div className="h-full flex flex-col">
            {/* Strategy toggle */}
            <div className="flex items-center gap-1.5 px-4 pt-3 pb-1">
              {(["Write-Through", "Write-Back", "Write-Around"] as WriteStrategy[]).map((s) => (
                <button
                  key={s}
                  onClick={() => { setStrategy(s); setPhase("idle"); }}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                    strategy === s
                      ? "bg-violet-500/20 text-violet-400 ring-1 ring-violet-500/30"
                      : "text-muted-foreground hover:bg-muted/30"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 px-4 pb-2">
              <button
                onClick={doWrite}
                disabled={phase !== "idle"}
                className="flex items-center gap-1.5 rounded-md bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 text-xs font-medium text-blue-400 hover:bg-blue-500/20 disabled:opacity-40 transition-all"
              >
                <Pencil className="size-3" />
                Write Data
              </button>
              <button
                onClick={doRead}
                disabled={phase !== "idle"}
                className="flex items-center gap-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 text-xs font-medium text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-40 transition-all"
              >
                <BookOpen className="size-3" />
                Read Data
              </button>
              {phase !== "idle" && (
                <span className="text-xs text-muted-foreground animate-pulse ml-1">
                  {phase === "write" ? "Writing..." : phase === "read-hit" ? "Cache HIT!" : "Cache MISS, fetching from DB..."}
                </span>
              )}
            </div>

            {/* Flow diagram */}
            <div className="flex-1 px-2">
              <FlowDiagram nodes={nodes} edges={edges} minHeight={220} interactive={false} allowDrag={false} />
            </div>
          </div>
        }
        explanation={
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-1">{strategy}</h4>
              <p className="text-xs text-muted-foreground">{desc.detail}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-md border border-border/30 bg-muted/10 p-2">
                <div className="text-[10px] text-muted-foreground/60 uppercase tracking-wide">Write Latency</div>
                <div className="text-sm font-mono font-bold text-foreground">{desc.writeLatency}</div>
              </div>
              <div className="rounded-md border border-border/30 bg-muted/10 p-2">
                <div className="text-[10px] text-muted-foreground/60 uppercase tracking-wide">Risk</div>
                <div className="text-sm font-semibold text-amber-400">{desc.risk}</div>
              </div>
              <div className="rounded-md border border-border/30 bg-muted/10 p-2">
                <div className="text-[10px] text-muted-foreground/60 uppercase tracking-wide">Hit Rate</div>
                <div className="text-sm font-mono font-bold text-emerald-400">{hitRatio(stats)}%</div>
              </div>
              <div className="rounded-md border border-border/30 bg-muted/10 p-2">
                <div className="text-[10px] text-muted-foreground/60 uppercase tracking-wide">Avg Latency</div>
                <div className="text-sm font-mono font-bold text-foreground">
                  {stats.writes + stats.reads > 0 ? (stats.totalLatency / (stats.writes + stats.reads)).toFixed(1) : "0"}ms
                </div>
              </div>
            </div>
            {strategy === "Write-Back" && stats.pendingFlush > 0 && (
              <div className="rounded-md border border-purple-500/20 bg-purple-500/5 p-2 text-xs text-purple-400">
                <AlertTriangle className="size-3 inline mr-1" />
                {stats.pendingFlush} write(s) buffered in cache. If the cache crashes now, these are lost forever.
              </div>
            )}
          </div>
        }
        controls={false}
      />

      {/* Hit ratio chart */}
      {hitLog.length > 2 && (
        <div className="rounded-xl border border-border/30 bg-muted/5 p-4">
          <h4 className="text-sm font-semibold mb-3">Cache Hit Ratio Over Time</h4>
          <LiveChart
            type="area"
            data={hitLog}
            dataKeys={{ x: "t", y: "ratio", label: "Hit Rate" }}
            height={180}
            unit="%"
            referenceLines={[{ y: 90, label: "Target 90%", color: "#22c55e" }]}
          />
          <p className="text-[10px] text-muted-foreground/50 mt-2">
            Try switching strategies and clicking Write/Read to see how each strategy builds up its hit ratio differently.
          </p>
        </div>
      )}
    </div>
  );
}

/* ──────────────── Cache-Aside Step-by-Step Playground ──────────────── */
function CacheAsidePlayground() {
  const sim = useSimulation({ intervalMs: 800, maxSteps: 8 });

  const phases = [
    { label: "App receives read request", nodeHighlight: "app" },
    { label: "Check cache for key 'user:42'", nodeHighlight: "cache" },
    { label: "Cache MISS -- key not found", nodeHighlight: "cache" },
    { label: "Query database for user 42", nodeHighlight: "db" },
    { label: "Database returns row", nodeHighlight: "db" },
    { label: "Store result in cache with TTL=300s", nodeHighlight: "cache" },
    { label: "Return data to client", nodeHighlight: "app" },
    { label: "Next read: Cache HIT! (0.1ms)", nodeHighlight: "cache" },
  ];

  const currentStep = Math.min(sim.step, phases.length - 1);
  const currentPhase = phases[currentStep];

  const nodes: FlowNode[] = useMemo(() => [
    {
      id: "client",
      type: "clientNode" as const,
      position: { x: 50, y: 10 },
      data: {
        label: "Client",
        sublabel: currentStep === 0 ? "GET /user/42" : currentStep >= 6 ? "got response" : "waiting...",
        status: currentStep === 0 || currentStep >= 6 ? ("healthy" as const) : ("idle" as const),
        handles: { bottom: true },
      },
    },
    {
      id: "app",
      type: "serverNode" as const,
      position: { x: 50, y: 140 },
      data: {
        label: "App Server",
        sublabel: currentPhase.nodeHighlight === "app" ? "processing" : "idle",
        status: currentPhase.nodeHighlight === "app" ? ("healthy" as const) : ("idle" as const),
        handles: { top: true, right: true },
      },
    },
    {
      id: "cache",
      type: "cacheNode" as const,
      position: { x: 320, y: 60 },
      data: {
        label: "Redis",
        sublabel: currentStep < 2 ? "empty"
          : currentStep === 2 ? "MISS!"
          : currentStep >= 5 ? "user:42 cached"
          : "checking...",
        status: currentStep === 7 ? ("healthy" as const)
          : currentStep === 2 ? ("unhealthy" as const)
          : currentPhase.nodeHighlight === "cache" ? ("warning" as const)
          : ("idle" as const),
        metrics: currentStep >= 5 ? [{ label: "TTL", value: "300s" }] : [],
        handles: { left: true, bottom: true },
      },
    },
    {
      id: "db",
      type: "databaseNode" as const,
      position: { x: 320, y: 200 },
      data: {
        label: "PostgreSQL",
        sublabel: currentPhase.nodeHighlight === "db" ? "querying..." : "idle",
        status: currentPhase.nodeHighlight === "db" ? ("warning" as const) : ("idle" as const),
        handles: { left: true, top: true },
      },
    },
  ], [currentStep, currentPhase]);

  const edges: FlowEdge[] = useMemo(() => [
    {
      id: "client-app",
      source: "client",
      target: "app",
      animated: currentStep === 0 || currentStep >= 6,
      style: { stroke: currentStep === 0 ? "#3b82f6" : currentStep >= 6 ? "#22c55e" : "#555", strokeWidth: currentStep === 0 || currentStep >= 6 ? 3 : 1.5 },
    },
    {
      id: "app-cache",
      source: "app",
      target: "cache",
      animated: currentStep >= 1 && currentStep <= 2 || currentStep === 5 || currentStep === 7,
      style: {
        stroke: currentStep === 2 ? "#ef4444" : currentStep === 7 ? "#22c55e" : currentStep === 5 ? "#3b82f6" : "#555",
        strokeWidth: (currentStep >= 1 && currentStep <= 2) || currentStep === 5 || currentStep === 7 ? 3 : 1.5,
      },
      label: currentStep === 2 ? "MISS" : currentStep === 7 ? "HIT!" : currentStep === 5 ? "SET" : "",
    },
    {
      id: "app-db",
      source: "app",
      target: "db",
      animated: currentStep >= 3 && currentStep <= 4,
      style: { stroke: currentStep >= 3 && currentStep <= 4 ? "#f59e0b" : "#555", strokeWidth: currentStep >= 3 && currentStep <= 4 ? 3 : 1.5 },
      label: currentStep === 3 ? "SELECT" : currentStep === 4 ? "row data" : "",
    },
  ], [currentStep]);

  return (
    <Playground
      title="Cache-Aside (Lazy Loading) -- Step by Step"
      simulation={sim}
      canvasHeight="min-h-[340px]"
      hints={["Press play to step through a cache-aside read request"]}
      canvas={
        <div className="h-full flex flex-col">
          {/* Step indicator */}
          <div className="px-4 pt-3 pb-1">
            <div className={cn(
              "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all",
              currentStep === 2 ? "border-red-500/30 bg-red-500/5 text-red-400"
                : currentStep === 7 ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-400"
                : "border-blue-500/30 bg-blue-500/5 text-blue-400"
            )}>
              <span className="font-mono text-[10px] text-muted-foreground">Step {currentStep + 1}/{phases.length}</span>
              <ArrowRight className="size-3" />
              {currentPhase.label}
            </div>
          </div>

          <div className="flex-1 px-2">
            <FlowDiagram nodes={nodes} edges={edges} minHeight={260} interactive={false} allowDrag={false} />
          </div>
        </div>
      }
      explanation={
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Cache-aside is the most common caching pattern. The application controls all the logic:
            check cache first, query database on miss, then store the result for next time.
          </p>

          {/* Step list */}
          <div className="space-y-1">
            {phases.map((p, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2 py-1 text-[11px] transition-all",
                  i === currentStep
                    ? "bg-violet-500/10 text-violet-400 font-medium"
                    : i < currentStep
                    ? "text-muted-foreground/70"
                    : "text-muted-foreground/30"
                )}
              >
                <span className={cn(
                  "size-4 rounded-full flex items-center justify-center text-[9px] font-mono shrink-0",
                  i < currentStep ? "bg-violet-500/20 text-violet-400"
                    : i === currentStep ? "bg-violet-500/30 text-violet-300"
                    : "bg-muted/20 text-muted-foreground/30"
                )}>
                  {i + 1}
                </span>
                {p.label}
              </div>
            ))}
          </div>

          {currentStep >= 7 && (
            <div className="rounded-md border border-emerald-500/20 bg-emerald-500/5 p-2 text-xs text-emerald-400">
              <Zap className="size-3 inline mr-1" />
              The second read was 50x faster. At 10k req/s, that one cache fill prevents 3 million DB queries over 5 minutes.
            </div>
          )}
        </div>
      }
    />
  );
}

/* ──────────── Strategy Comparison Table ──────────── */
function StrategyComparisonTable() {
  const [highlighted, setHighlighted] = useState<number | null>(null);

  const strategies = [
    { name: "Cache-Aside", readLatency: "Miss ~5ms, Hit <1ms", writeLatency: "N/A (reads only)", consistency: "Eventual", risk: "Stale reads", useCase: "Product catalogs, user profiles", icon: <BookOpen className="size-3.5" />, color: "blue" },
    { name: "Write-Through", readLatency: "Always <1ms", writeLatency: "~6ms (cache + DB)", consistency: "Strong", risk: "Write latency", useCase: "Sessions, shopping carts", icon: <Pencil className="size-3.5" />, color: "emerald" },
    { name: "Write-Back", readLatency: "Always <1ms", writeLatency: "<1ms (cache only)", consistency: "Eventual", risk: "Data loss on crash", useCase: "Analytics, logging, counters", icon: <Zap className="size-3.5" />, color: "purple" },
    { name: "Write-Around", readLatency: "First read ~5ms", writeLatency: "~3ms (DB only)", consistency: "Eventual", risk: "Cache miss storm", useCase: "Audit logs, rare reads", icon: <Database className="size-3.5" />, color: "amber" },
  ];

  const cm: Record<string, string[]> = {
    blue: ["bg-blue-500/5", "border-blue-500/20", "text-blue-400", "ring-blue-500/20"],
    emerald: ["bg-emerald-500/5", "border-emerald-500/20", "text-emerald-400", "ring-emerald-500/20"],
    purple: ["bg-purple-500/5", "border-purple-500/20", "text-purple-400", "ring-purple-500/20"],
    amber: ["bg-amber-500/5", "border-amber-500/20", "text-amber-400", "ring-amber-500/20"],
  };

  return (
    <div className="rounded-xl border border-border/30 bg-muted/5 p-4 space-y-3">
      <h3 className="text-base font-semibold">When to Use Which Strategy</h3>
      <p className="text-sm text-muted-foreground">Click a strategy to expand its trade-offs.</p>

      <div className="space-y-1.5">
        {strategies.map((s, i) => {
          const c = cm[s.color];
          const isOpen = highlighted === i;
          return (
            <div
              key={s.name}
              onClick={() => setHighlighted(isOpen ? null : i)}
              className={cn(
                "rounded-lg border px-3 py-2.5 transition-all cursor-pointer",
                isOpen ? `${c[0]} ${c[1]} ring-1 ${c[3]}` : "bg-muted/10 border-border/30 hover:bg-muted/20"
              )}
            >
              <div className="flex items-center gap-2">
                <span className={cn(isOpen ? c[2] : "text-muted-foreground")}>{s.icon}</span>
                <span className="text-sm font-semibold flex-1">{s.name}</span>
                <span className={cn("text-[10px] transition-all", isOpen ? c[2] : "text-muted-foreground/50")}>
                  {s.useCase}
                </span>
              </div>

              {isOpen && (
                <div className="mt-2 pt-2 border-t border-border/20 grid grid-cols-2 gap-2">
                  <div className="text-[11px]">
                    <span className="text-muted-foreground/60">Read latency: </span>
                    <span className="text-muted-foreground">{s.readLatency}</span>
                  </div>
                  <div className="text-[11px]">
                    <span className="text-muted-foreground/60">Write latency: </span>
                    <span className="text-muted-foreground">{s.writeLatency}</span>
                  </div>
                  <div className="text-[11px]">
                    <span className="text-muted-foreground/60">Consistency: </span>
                    <span className={s.consistency === "Strong" ? "text-emerald-400" : "text-amber-400"}>{s.consistency}</span>
                  </div>
                  <div className="text-[11px]">
                    <span className="text-muted-foreground/60">Main risk: </span>
                    <span className="text-red-400">{s.risk}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════════════════ PAGE ══════════════════════════ */
export default function CachingStrategiesPage() {
  return (
    <div className="space-y-8">
      <TopicHero
        title="Caching Strategies"
        subtitle="Your database shouldn't answer the same question ten thousand times a second. The strategy you choose determines where data lives, how fresh it stays, and what breaks when things go wrong."
        difficulty="intermediate"
      />

      <WhyCare>
        Facebook caches 500 billion objects across its infrastructure. The difference between a <GlossaryTerm term="cache hit">cache hit</GlossaryTerm> (1ms) and a database query (50ms) is the difference between a snappy app and a frustrating one.
      </WhyCare>

      <div className="rounded-xl border border-red-500/20 bg-red-500/[0.02] p-5 space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="size-5 text-red-400" />
          <h3 className="text-base font-semibold">10,000 Identical Queries per Second</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Every visitor triggers <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">SELECT * FROM products WHERE id = 42</code>.
          Traffic spikes to 10k req/s. Connection pool exhausted, queries time out, site goes down. <GlossaryTerm term="redis">Redis</GlossaryTerm> answers in 0.1ms instead of 5ms -- a <strong className="text-foreground">50x difference</strong>.
        </p>
      </div>

      <WriteStrategyPlayground />

      <AhaMoment
        question="Why not just use Write-Through for everything?"
        answer={
          <p>
            Write-through adds latency to every write and fills your cache with data that may never be
            read again. If you write 100,000 log entries per second but only 50 get read, you have wasted
            99,950 cache slots on data nobody wanted. Match the strategy to the access pattern, not the
            other way around.
          </p>
        }
      />

      {/* ── Cache-Aside Step-by-Step ── */}
      <CacheAsidePlayground />

      <ConversationalCallout type="tip">
        <GlossaryTerm term="cache">Cache</GlossaryTerm>-aside is the default choice for most teams. It is simple, the app has full control,
        and it naturally only caches data that is actually read. Facebook uses this with Memcached
        in front of MySQL for user profiles.
      </ConversationalCallout>

      <StrategyComparisonTable />

      <BeforeAfter
        before={{
          title: "One-size-fits-all caching",
          content: (
            <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
              <li>Cache everything with write-through</li>
              <li>Same TTL for all data types</li>
              <li>Cache fills with rarely-read data</li>
              <li>Write latency hurts analytics pipeline</li>
              <li>Memory wasted on cold entries</li>
            </ul>
          ),
        }}
        after={{
          title: "Strategy per access pattern",
          content: (
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li><strong>Product catalog</strong> -- cache-aside (read-heavy, rarely changes)</li>
              <li><strong>User sessions</strong> -- write-through (must stay consistent)</li>
              <li><strong>Analytics events</strong> -- write-back (high volume, eventual OK)</li>
              <li><strong>Audit logs</strong> -- write-around (written once, rarely re-read)</li>
            </ul>
          ),
        }}
      />

      <AhaMoment
        question="What is the difference between cache-aside and read-through?"
        answer={
          <p>
            In cache-aside, your app code does &quot;check cache, miss, query DB, fill cache.&quot;
            In read-through, the cache library handles that itself. Same data flow, different
            responsibility. Read-through means less boilerplate but your cache must know how to query your DB.
          </p>
        }
      />

      <ConversationalCallout type="warning">
        In interviews, never just say &quot;add a <GlossaryTerm term="cache">cache</GlossaryTerm>.&quot; Say which strategy and why.
        &quot;Cache-aside with 5-min <GlossaryTerm term="ttl">TTL</GlossaryTerm> for the product catalog because reads outnumber
        writes 100:1 and eventual consistency is acceptable&quot; shows real depth.
      </ConversationalCallout>

      <TopicQuiz
        questions={[
          {
            question: "In a write-through caching strategy, when does the database get updated?",
            options: [
              "Only when the cache is full",
              "Synchronously with every write, at the same time as the cache",
              "Asynchronously in batches after a delay",
              "Only when a read request triggers a cache miss",
            ],
            correctIndex: 1,
            explanation: "Write-through updates both the cache and the database synchronously on every write. This ensures strong consistency but adds write latency.",
          },
          {
            question: "Which caching strategy is best for a write-heavy analytics pipeline where eventual consistency is acceptable?",
            options: [
              "Cache-aside",
              "Write-through",
              "Write-back (write-behind)",
              "Write-around",
            ],
            correctIndex: 2,
            explanation: "Write-back writes to the cache only and flushes to the database asynchronously. This gives the lowest write latency (<1ms), perfect for high-volume analytics where eventual consistency is acceptable.",
          },
          {
            question: "What is the main risk of using write-around caching?",
            options: [
              "Data loss if the cache crashes",
              "High write latency due to double writes",
              "High cache miss rate for recently written data",
              "Cache and database become permanently out of sync",
            ],
            correctIndex: 2,
            explanation: "Write-around bypasses the cache on writes, so recently written data is not in the cache. The first read after a write will always be a cache miss, which can lead to a high miss rate for recently written data.",
          },
        ]}
      />

      <KeyTakeaway
        points={[
          "Cache-aside gives the application full control and only caches data that is actually read. It is the most common pattern (used by Facebook, Netflix).",
          "Write-through keeps cache and DB perfectly in sync but doubles write latency (~6ms instead of ~3ms). Use for sessions and shopping carts.",
          "Write-back is fastest for writes (<1ms) but risks data loss if the cache crashes before flushing. Use for analytics, counters, and non-critical data.",
          "Write-around prevents cache pollution by only caching data on reads. Ideal for write-once-read-rarely patterns like audit logs.",
          "Real systems combine strategies: cache-aside for reads, write-through for sessions, write-back for analytics. Always match strategy to access pattern.",
        ]}
      />
    </div>
  );
}
