"use client";

import { useState, useMemo } from "react";
import { TopicHero } from "@/components/topic-hero";
import { KeyTakeaway } from "@/components/key-takeaway";
import { AhaMoment } from "@/components/aha-moment";
import { ConversationalCallout } from "@/components/conversational-callout";
import { BeforeAfter } from "@/components/before-after";
import { Playground } from "@/components/playground";
import { LiveChart } from "@/components/live-chart";
import { FlowDiagram } from "@/components/flow-diagram";
import type { FlowNode, FlowEdge } from "@/components/flow-diagram";
import { useSimulation } from "@/hooks/use-simulation";
import { cn } from "@/lib/utils";
import { WhyCare } from "@/components/why-care";
import { GlossaryTerm } from "@/components/glossary-term";
import { TopicQuiz } from "@/components/topic-quiz";


// --- Consistent Hashing helpers ---

function simpleHash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) & 0x7fffffff;
  }
  return h % 360;
}

function findOwner(keyAngle: number, serverAngles: number[]): number {
  const sorted = [...serverAngles].sort((a, b) => a - b);
  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i] >= keyAngle) return sorted[i];
  }
  return sorted[0]; // wrap around
}

const SERVER_COLORS: Record<string, { ring: string; fill: string; text: string; border: string }> = {
  A: { ring: "stroke-blue-500/60", fill: "fill-blue-500/20", text: "fill-blue-400", border: "border-blue-500/30" },
  B: { ring: "stroke-emerald-500/60", fill: "fill-emerald-500/20", text: "fill-emerald-400", border: "border-emerald-500/30" },
  C: { ring: "stroke-purple-500/60", fill: "fill-purple-500/20", text: "fill-purple-400", border: "border-purple-500/30" },
  D: { ring: "stroke-amber-500/60", fill: "fill-amber-500/20", text: "fill-amber-400", border: "border-amber-500/30" },
};

const SERVER_BG: Record<string, string> = {
  A: "bg-blue-500/15",
  B: "bg-emerald-500/15",
  C: "bg-purple-500/15",
  D: "bg-amber-500/15",
};

const SERVER_TEXT: Record<string, string> = {
  A: "text-blue-400",
  B: "text-emerald-400",
  C: "text-purple-400",
  D: "text-amber-400",
};

type CacheServer = { id: string; angle: number };

const INITIAL_SERVERS: CacheServer[] = [
  { id: "A", angle: 45 },
  { id: "B", angle: 165 },
  { id: "C", angle: 285 },
];

const PRESET_KEYS = ["user:42", "session:99", "product:7", "cart:55", "item:12", "order:88", "token:33", "profile:21"];

// --- Consistent Hashing Ring Playground ---

function ConsistentHashRingPlayground() {
  const [servers, setServers] = useState<CacheServer[]>(INITIAL_SERVERS);
  const [keyInput, setKeyInput] = useState("");
  const [activeKeys, setActiveKeys] = useState<string[]>(PRESET_KEYS.slice(0, 5));
  const [highlightedKey, setHighlightedKey] = useState<string | null>(null);
  const [modularComparison, setModularComparison] = useState(false);
  const [prevServerCount, setPrevServerCount] = useState(3);

  const cx = 150;
  const cy = 150;
  const radius = 120;

  const toXY = (angle: number, r: number = radius) => ({
    x: cx + r * Math.cos(((angle - 90) * Math.PI) / 180),
    y: cy + r * Math.sin(((angle - 90) * Math.PI) / 180),
  });

  const serverAngles = servers.map((s) => s.angle);

  const keyAssignments = useMemo(() => {
    return activeKeys.map((key) => {
      const angle = simpleHash(key);
      const ownerAngle = findOwner(angle, serverAngles);
      const owner = servers.find((s) => s.angle === ownerAngle)!;
      return { key, angle, owner: owner?.id ?? "?" };
    });
  }, [activeKeys, servers, serverAngles]);

  // Modular hashing comparison
  const modularMoved = useMemo(() => {
    if (servers.length === prevServerCount) return 0;
    let moved = 0;
    for (let i = 0; i < activeKeys.length; i++) {
      const h = simpleHash(activeKeys[i]);
      if (h % servers.length !== h % prevServerCount) moved++;
    }
    return moved;
  }, [activeKeys, servers.length, prevServerCount]);

  // Keys per server for bar chart
  const keysPerServer = useMemo(() => {
    const counts: Record<string, number> = {};
    servers.forEach((s) => (counts[s.id] = 0));
    keyAssignments.forEach((ka) => {
      if (counts[ka.owner] !== undefined) counts[ka.owner]++;
    });
    return servers.map((s) => ({ server: s.id, keys: counts[s.id] }));
  }, [keyAssignments, servers]);

  const addServer = () => {
    if (servers.length >= 4) return;
    setPrevServerCount(servers.length);
    const ids = ["A", "B", "C", "D"];
    const nextId = ids.find((id) => !servers.some((s) => s.id === id)) ?? "D";
    const angles = [45, 165, 285, 210];
    const nextAngle = angles[ids.indexOf(nextId)];
    setServers([...servers, { id: nextId, angle: nextAngle }]);
  };

  const removeServer = () => {
    if (servers.length <= 2) return;
    setPrevServerCount(servers.length);
    setServers(servers.slice(0, -1));
  };

  const addKey = () => {
    const k = keyInput.trim();
    if (k && !activeKeys.includes(k)) {
      setActiveKeys([...activeKeys, k]);
      setHighlightedKey(k);
      setTimeout(() => setHighlightedKey(null), 2000);
    }
    setKeyInput("");
  };

  const consistentMoved = useMemo(() => {
    if (servers.length === prevServerCount) return 0;
    // Simulate with previous server set
    const prevAngles = INITIAL_SERVERS.slice(0, prevServerCount).map((s) => s.angle);
    let moved = 0;
    activeKeys.forEach((key) => {
      const angle = simpleHash(key);
      const oldOwner = findOwner(angle, prevAngles);
      const newOwner = findOwner(angle, serverAngles);
      if (oldOwner !== newOwner) moved++;
    });
    return moved;
  }, [activeKeys, servers, serverAngles, prevServerCount]);

  return (
    <Playground
      title="Consistent Hashing Ring"
      controls={false}
      canvasHeight="min-h-[420px]"
      hints={["Type a key and click Hash, or add/remove servers to see how keys redistribute"]}
      canvas={
        <div className="p-4 space-y-4">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Ring SVG */}
            <div className="flex-shrink-0 flex justify-center">
              <svg width="300" height="300" viewBox="0 0 300 300" className="overflow-visible">
                {/* Ring */}
                <circle cx={cx} cy={cy} r={radius} fill="none" stroke="currentColor" strokeWidth="1.5" className="text-border/40" strokeDasharray="6 4" />

                {/* Server arcs showing ownership ranges */}
                {servers.map((server) => {
                  const colors = SERVER_COLORS[server.id];
                  const pos = toXY(server.angle);
                  return (
                    <g key={server.id}>
                      <circle cx={pos.x} cy={pos.y} r={20} className={cn("transition-all duration-500", colors.fill)} />
                      <circle cx={pos.x} cy={pos.y} r={20} fill="none" strokeWidth="2" className={colors.ring} />
                      <text x={pos.x} y={pos.y + 1} textAnchor="middle" dominantBaseline="central" className={cn("text-xs font-bold", colors.text)}>
                        {server.id}
                      </text>
                    </g>
                  );
                })}

                {/* Keys on ring */}
                {keyAssignments.map((ka) => {
                  const pos = toXY(ka.angle, radius - 30);
                  const ownerServer = servers.find((s) => s.id === ka.owner);
                  const ownerPos = ownerServer ? toXY(ownerServer.angle) : null;
                  const isHighlighted = highlightedKey === ka.key;
                  const ownerColors = SERVER_COLORS[ka.owner];

                  return (
                    <g key={ka.key} className="cursor-pointer" onMouseEnter={() => setHighlightedKey(ka.key)} onMouseLeave={() => setHighlightedKey(null)}>
                      {/* Connection line to owner */}
                      {ownerPos && (isHighlighted || highlightedKey === null) && (
                        <line
                          x1={pos.x} y1={pos.y} x2={ownerPos.x} y2={ownerPos.y}
                          stroke="currentColor" strokeWidth={isHighlighted ? "1.5" : "0.5"}
                          strokeDasharray={isHighlighted ? "0" : "3 3"}
                          className={cn("transition-all", isHighlighted ? "text-foreground/40" : "text-muted-foreground/15")}
                        />
                      )}
                      <circle cx={pos.x} cy={pos.y} r={isHighlighted ? 6 : 4} className={cn("transition-all duration-300", ownerColors?.fill ?? "fill-muted-foreground/40")} />
                      <text
                        x={pos.x} y={pos.y - 10}
                        textAnchor="middle"
                        className={cn("text-[8px] font-mono transition-all", isHighlighted ? "fill-foreground" : "fill-muted-foreground/50")}
                      >
                        {ka.key}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Controls & info panel */}
            <div className="flex-1 space-y-4 min-w-0">
              {/* Add key input */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Hash a key onto the ring</label>
                <div className="flex gap-2">
                  <input
                    value={keyInput}
                    onChange={(e) => setKeyInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addKey()}
                    placeholder="e.g. user:123"
                    className="flex-1 rounded-md border border-border/40 bg-muted/10 px-3 py-1.5 text-sm font-mono placeholder:text-muted-foreground/30 focus:outline-none focus:border-violet-500/40"
                  />
                  <button onClick={addKey} className="rounded-md bg-violet-500/15 border border-violet-500/30 px-3 py-1.5 text-xs font-medium text-violet-400 hover:bg-violet-500/25 transition-colors">
                    Hash
                  </button>
                </div>
              </div>

              {/* Server controls */}
              <div className="flex gap-2">
                <button
                  onClick={addServer}
                  disabled={servers.length >= 4}
                  className="rounded-md bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 text-xs font-medium text-emerald-400 hover:bg-emerald-500/20 transition-colors disabled:opacity-30"
                >
                  + Add Server
                </button>
                <button
                  onClick={removeServer}
                  disabled={servers.length <= 2}
                  className="rounded-md bg-red-500/10 border border-red-500/30 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-30"
                >
                  - Remove Server
                </button>
                <button
                  onClick={() => setModularComparison(!modularComparison)}
                  className={cn(
                    "rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
                    modularComparison ? "bg-amber-500/15 border-amber-500/30 text-amber-400" : "bg-muted/10 border-border/30 text-muted-foreground hover:bg-muted/20"
                  )}
                >
                  Compare Modular
                </button>
              </div>

              {/* Redistribution comparison */}
              {servers.length !== prevServerCount && (
                <div className="rounded-lg border border-border/30 bg-muted/10 p-3 space-y-2">
                  <p className="text-xs font-medium text-foreground">Key redistribution after server change:</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center">
                      <div className="text-lg font-bold text-emerald-400">{consistentMoved}/{activeKeys.length}</div>
                      <div className="text-[10px] text-emerald-400">Consistent hashing</div>
                    </div>
                    {modularComparison && (
                      <div className="text-center">
                        <div className="text-lg font-bold text-red-400">{modularMoved}/{activeKeys.length}</div>
                        <div className="text-[10px] text-red-400">Modular hashing</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Keys per server chart */}
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Keys per server</p>
                <LiveChart
                  type="bar"
                  data={keysPerServer}
                  dataKeys={{ x: "server", y: "keys" }}
                  height={120}
                  unit="keys"
                />
              </div>
            </div>
          </div>
        </div>
      }
    />
  );
}

// --- Redis Cluster Playground ---

const SLOT_RANGES = [
  { master: "Master 1", range: "0-5460", replica: "Replica 1" },
  { master: "Master 2", range: "5461-10922", replica: "Replica 2" },
  { master: "Master 3", range: "10923-16383", replica: "Replica 3" },
];

const STATUS_COLORS: Record<string, string> = {
  healthy: "text-emerald-400",
  unhealthy: "text-red-400",
  warning: "text-amber-400",
  promoted: "text-blue-400",
};

function RedisClusterPlayground() {
  const sim = useSimulation({ intervalMs: 1500, maxSteps: 8 });

  const phase = sim.step;

  const masterStatuses: ("healthy" | "unhealthy" | "warning")[] = [
    "healthy",
    phase >= 2 && phase <= 5 ? "unhealthy" : "healthy",
    "healthy",
  ];

  const replicaLabels = [
    "Replica 1",
    phase >= 5 ? "Promoted to Master" : "Replica 2",
    "Replica 3",
  ];

  const replicaStatuses: ("healthy" | "idle" | "warning")[] = [
    "healthy",
    phase >= 5 ? "healthy" : phase >= 3 ? "warning" : "healthy",
    "healthy",
  ];

  // Build FlowDiagram nodes
  const flowNodes: FlowNode[] = [
    {
      id: "app",
      type: "clientNode",
      position: { x: 250, y: 0 },
      data: { label: "App Server", sublabel: "CRC16(key) % 16384", handles: { bottom: true } },
    },
    ...SLOT_RANGES.map((s, i) => ({
      id: `master-${i}`,
      type: "cacheNode" as const,
      position: { x: i * 200, y: 120 },
      data: {
        label: phase >= 5 && i === 1 ? "FAILED" : s.master,
        sublabel: `slots ${s.range}`,
        status: masterStatuses[i],
        handles: { top: true, bottom: true },
      },
    })),
    ...SLOT_RANGES.map((s, i) => ({
      id: `replica-${i}`,
      type: "databaseNode" as const,
      position: { x: i * 200, y: 250 },
      data: {
        label: replicaLabels[i],
        sublabel: phase >= 5 && i === 1 ? `slots ${s.range}` : "async replication",
        status: replicaStatuses[i],
        handles: { top: true },
      },
    })),
  ];

  const flowEdges: FlowEdge[] = [
    { id: "app-m0", source: "app", target: "master-0", animated: true },
    { id: "app-m1", source: "app", target: "master-1", animated: phase < 2 },
    { id: "app-m2", source: "app", target: "master-2", animated: true },
    ...SLOT_RANGES.map((_, i) => ({
      id: `m${i}-r${i}`,
      source: `master-${i}`,
      target: `replica-${i}`,
      animated: !(phase >= 2 && i === 1),
    })),
    // After promotion, app routes to the new master (replica 1)
    ...(phase >= 5
      ? [{ id: "app-r1-promoted", source: "app", target: "replica-1", animated: true }]
      : []),
  ];

  // Latency data during failover
  const latencyData = useMemo(() => {
    const data = [];
    for (let t = 0; t <= 8; t++) {
      let latency = 2;
      if (t >= 2 && t <= 3) latency = 45;
      else if (t === 4) latency = 25;
      else if (t === 5) latency = 10;
      else if (t >= 6) latency = 3;
      data.push({ time: `T+${t * 5}s`, latency });
    }
    return data;
  }, []);

  const phaseDescriptions: Record<number, string> = {
    0: "All 3 masters healthy, each owning a range of hash slots.",
    1: "Normal operation. Replicas asynchronously sync from masters.",
    2: "Master 2 stops responding! Gossip protocol detects the failure.",
    3: "Cluster nodes vote: Master 2 is objectively down.",
    4: "Failover initiated. Replica 2 prepares for promotion.",
    5: "Replica 2 promoted to master! Takes over slots 5461-10922.",
    6: "Clients redirect to the new master. Latency recovering.",
    7: "Cluster fully healed. Brief spike, but no data loss.",
    8: "Recovery complete. System back to normal operation.",
  };

  return (
    <Playground
      title="Redis Cluster Failover"
      simulation={sim}
      canvasHeight="min-h-[460px]"
      hints={["Press play to simulate a master node failure and automatic failover"]}
      canvas={
        <div className="p-2">
          <FlowDiagram nodes={flowNodes} edges={flowEdges} minHeight={340} interactive={false} allowDrag={false} />
        </div>
      }
      explanation={(state) => (
        <div className="space-y-4">
          <p className="text-sm font-medium text-foreground">
            {phaseDescriptions[state.step] ?? "Press play to simulate a master failure."}
          </p>

          {/* Hash slot table */}
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Hash Slot Distribution</p>
            {SLOT_RANGES.map((s, i) => (
              <div key={i} className={cn(
                "flex items-center justify-between rounded px-2 py-1 text-xs border transition-all",
                masterStatuses[i] === "unhealthy"
                  ? "border-red-500/30 bg-red-500/5"
                  : "border-border/20 bg-muted/10"
              )}>
                <span className="font-mono">{s.range}</span>
                <span className={cn(
                  "font-medium",
                  masterStatuses[i] === "unhealthy" ? "text-red-400 line-through" : STATUS_COLORS.healthy
                )}>
                  {phase >= 5 && i === 1 ? "Replica 2 (promoted)" : s.master}
                </span>
              </div>
            ))}
          </div>

          {/* Latency chart */}
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Latency During Failover</p>
            <LiveChart
              type="latency"
              data={latencyData.slice(0, Math.max(1, phase + 1))}
              dataKeys={{ x: "time", y: "latency", label: "Latency" }}
              height={130}
              referenceLines={[{ y: 10, label: "SLA", color: "#ef4444" }]}
            />
          </div>
        </div>
      )}
    />
  );
}

// --- Cache Coherence Demo ---

type CacheState = { value: string; stale: boolean };

const APP_SERVER_STYLES: { label: string; bgClass: string; textClass: string }[] = [
  { label: "App 1", bgClass: "bg-blue-500/10", textClass: "text-blue-400" },
  { label: "App 2", bgClass: "bg-emerald-500/10", textClass: "text-emerald-400" },
  { label: "App 3", bgClass: "bg-purple-500/10", textClass: "text-purple-400" },
];

function CacheCoherenceDemo() {
  const sim = useSimulation({ intervalMs: 1200, maxSteps: 9 });
  const phase = sim.step;

  // Model cache states for 3 app servers + shared Redis
  const localCaches: CacheState[] = useMemo(() => {
    if (phase <= 1) return [{ value: "v1", stale: false }, { value: "v1", stale: false }, { value: "v1", stale: false }];
    if (phase === 2) return [{ value: "v2", stale: false }, { value: "v1", stale: true }, { value: "v1", stale: true }];
    if (phase === 3) return [{ value: "v2", stale: false }, { value: "---", stale: false }, { value: "---", stale: false }];
    if (phase === 4) return [{ value: "v2", stale: false }, { value: "v2", stale: false }, { value: "v2", stale: false }];
    // Thundering herd phases
    if (phase === 5) return [{ value: "v2", stale: false }, { value: "v2", stale: false }, { value: "v2", stale: false }];
    if (phase === 6) return [{ value: "---", stale: false }, { value: "---", stale: false }, { value: "---", stale: false }];
    if (phase === 7) return [{ value: "---", stale: false }, { value: "---", stale: false }, { value: "---", stale: false }];
    if (phase >= 8) return [{ value: "v3", stale: false }, { value: "v3", stale: false }, { value: "v3", stale: false }];
    return [{ value: "?", stale: false }, { value: "?", stale: false }, { value: "?", stale: false }];
  }, [phase]);

  const redisValue = phase <= 1 ? "v1" : phase >= 2 ? "v2" : "---";
  const dbHits = phase === 7 ? 3 : phase === 4 ? 2 : 0;

  const phaseText: Record<number, string> = {
    0: "All servers have user:42 = v1 cached locally. Redis also has v1.",
    1: "Normal reads: each server hits its local cache. Zero network calls.",
    2: "App 1 updates user:42 to v2. Its local cache updates, but App 2 & 3 are stale!",
    3: "Invalidation broadcast: App 1 tells Redis to delete the key. Redis notifies App 2 & 3 to evict.",
    4: "App 2 & 3 read user:42 again, miss locally, fetch from Redis. All consistent now.",
    5: "Everything is consistent with v2. But what if the key expires everywhere at once?",
    6: "TTL expires! All 3 local caches are empty simultaneously.",
    7: "Thundering herd! All 3 servers miss cache and hit the database at the same time.",
    8: "All caches re-warm with v3. Consider staggered TTLs or a cache lock to prevent this.",
    9: "Demo complete. Invalidation keeps data fresh; staggered TTLs prevent thundering herds.",
  };

  return (
    <Playground
      title="Cache Coherence & Thundering Herd"
      simulation={sim}
      canvasHeight="min-h-[360px]"
      hints={["Press play to see how stale data propagates and thundering herds form"]}
      canvas={
        <div className="p-6 flex flex-col items-center gap-6">
          {/* App servers with local caches */}
          <div className="flex gap-4 flex-wrap justify-center">
            {APP_SERVER_STYLES.map((app, i) => (
              <div key={i} className={cn("rounded-lg border border-border/30 p-3 text-center w-28 transition-all", app.bgClass)}>
                <div className={cn("text-xs font-bold", app.textClass)}>{app.label}</div>
                <div className="text-[10px] text-muted-foreground mt-1">local cache</div>
                <div className={cn(
                  "mt-1.5 rounded px-2 py-0.5 font-mono text-xs border transition-all",
                  localCaches[i].stale
                    ? "border-red-500/30 bg-red-500/10 text-red-400"
                    : localCaches[i].value === "---"
                    ? "border-border/20 bg-muted/10 text-muted-foreground/40"
                    : "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                )}>
                  {localCaches[i].value}
                  {localCaches[i].stale && <span className="text-[8px] ml-1">STALE</span>}
                </div>
              </div>
            ))}
          </div>

          {/* Arrows / network */}
          <div className="flex items-center gap-2 text-muted-foreground/40">
            {phase === 3 && <span className="text-xs text-amber-400 font-medium animate-pulse">invalidation broadcast</span>}
            {phase === 7 && <span className="text-xs text-red-400 font-medium animate-pulse">all 3 hit DB!</span>}
            {phase !== 3 && phase !== 7 && <span className="text-xs font-mono">--- network ---</span>}
          </div>

          {/* Shared Redis */}
          <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-center w-48">
            <div className="text-xs font-bold text-red-400">Shared Redis</div>
            <div className="text-[10px] text-muted-foreground mt-1">user:42 = <span className="font-mono text-foreground">{redisValue}</span></div>
          </div>

          {/* Database */}
          {dbHits > 0 && (
            <>
              <div className="text-xs text-red-400 font-medium">{dbHits} simultaneous DB queries</div>
              <div className="rounded-lg border border-border/30 bg-muted/10 p-2 text-center w-40">
                <div className="text-xs font-medium text-muted-foreground">PostgreSQL</div>
                <div className="text-[10px] text-muted-foreground/60">source of truth</div>
              </div>
            </>
          )}
        </div>
      }
      explanation={(state) => (
        <div className="space-y-3">
          <p className="text-sm">{phaseText[state.step] ?? ""}</p>
          {state.step >= 5 && (
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 space-y-1">
              <p className="text-xs font-semibold text-amber-400">Thundering Herd Prevention</p>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
                <li>Stagger TTLs: add random jitter (e.g. TTL + rand(0,60))</li>
                <li>Cache lock: only 1 server refills, others wait</li>
                <li>Serve stale while revalidating in background</li>
              </ul>
            </div>
          )}
        </div>
      )}
    />
  );
}

// --- Main Page ---

export default function DistributedCachingPage() {
  return (
    <div className="space-y-8">
      <TopicHero
        title="Distributed Caching"
        subtitle="When your app server restarts, the in-memory cache vanishes. Every user pays the cold-start penalty. The solution: move the cache outside the process, share it across all servers, and make it survive failures."
        difficulty="intermediate"
      />

      <WhyCare>
        A single <GlossaryTerm term="redis">Redis</GlossaryTerm> server can handle 100,000+ operations per second. But what happens when even that isn&apos;t enough? You need a cluster &mdash; and understanding how distributed caching works is what separates a good system from a great one.
      </WhyCare>

      <ConversationalCallout type="warning">
        In-memory caches are tied to a single process. When that process dies -- deploy, crash,
        scaling event -- the cache dies with it. With multiple app servers, each maintains its own
        stale copy. The fix is an external shared cache cluster that all servers connect to.
      </ConversationalCallout>

      {/* Section 1: Consistent Hashing Ring */}
      <section className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-xl font-bold">Consistent Hashing: The Key Distribution Problem</h2>
          <p className="text-sm text-muted-foreground">
            How do you decide which <GlossaryTerm term="cache">cache</GlossaryTerm> server holds which key? Naive modular hashing
            (<code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">hash(key) % N</code>) breaks
            when you add or remove a server -- almost <em>every</em> key remaps, causing a cache avalanche.
            Consistent hashing maps keys to a ring. When a server changes, only <strong>K/N</strong> keys
            move. Type a key below and watch it get assigned to the next clockwise server.
          </p>
        </div>
        <ConsistentHashRingPlayground />
      </section>

      <AhaMoment
        question="With modular hashing and 3 servers, adding a 4th remaps ~75% of keys. Consistent hashing? Only ~25%. Why?"
        answer={
          <p>
            Modular hashing uses <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">hash % N</code>.
            Changing N shifts nearly every key. Consistent hashing places servers on a ring -- each key
            walks clockwise to its server. Adding a server only affects keys between the new server and its
            predecessor. At scale with millions of keys, that difference is the gap between a graceful
            expansion and a full cache avalanche that tanks your database.
          </p>
        }
      />

      <BeforeAfter
        before={{
          title: "Modular Hashing",
          content: (
            <ul className="text-sm space-y-1.5 text-muted-foreground">
              <li><code className="text-xs bg-muted px-1 rounded font-mono">hash(key) % N</code></li>
              <li>Add 1 server: ~75% of keys remap</li>
              <li>Remove 1 server: ~67% remap</li>
              <li>Cache avalanche on any topology change</li>
            </ul>
          ),
        }}
        after={{
          title: "Consistent Hashing",
          content: (
            <ul className="text-sm space-y-1.5 text-muted-foreground">
              <li>Keys walk clockwise to nearest server</li>
              <li>Add 1 server: only ~K/N keys remap</li>
              <li>Remove 1 server: only its keys remap</li>
              <li>Virtual nodes ensure even distribution</li>
            </ul>
          ),
        }}
      />

      {/* Section 2: Redis Cluster */}
      <section className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-xl font-bold">Redis Cluster: Failover in Action</h2>
          <p className="text-sm text-muted-foreground">
            Redis Cluster shards data across masters using 16,384 hash slots (CRC16(key) % 16384).
            Each master has a replica for redundancy. Press play to simulate a master failure and
            watch the cluster self-heal through gossip detection, voting, and replica promotion.
          </p>
        </div>
        <RedisClusterPlayground />
      </section>

      <ConversationalCallout type="tip">
        In system design interviews, after saying &quot;I would use <GlossaryTerm term="redis">Redis</GlossaryTerm>,&quot; follow up with specifics:
        &quot;Redis Cluster with 3 masters and 3 replicas, hash-slot sharding, automatic failover via
        gossip protocol, and cache-aside with the app falling back to the database on miss.&quot;
        That level of detail separates junior from senior answers.
      </ConversationalCallout>

      {/* Section 3: Cache Coherence */}
      <section className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-xl font-bold">Cache Coherence & the Thundering Herd</h2>
          <p className="text-sm text-muted-foreground">
            When multiple app servers each have a local cache plus a shared Redis, writes must propagate
            correctly. Watch how an update on one server invalidates stale copies on others. Then see
            what happens when all caches expire simultaneously -- the dreaded thundering herd.
          </p>
        </div>
        <CacheCoherenceDemo />
      </section>

      <AhaMoment
        question="If the cache is so important, isn't it a single point of failure?"
        answer={
          <p>
            Yes, which is why distributed caches use replication, automatic failover, and clustering.
            Redis Sentinel monitors nodes and auto-promotes replicas. Redis Cluster spreads data across
            multiple masters. But the golden rule: <em>your app must handle total cache failure</em>.
            The cache is an optimization. If it vanishes, responses should be slower, not broken.
            The database is always the source of truth.
          </p>
        }
      />

      <BeforeAfter
        before={{
          title: "Memcached",
          content: (
            <ul className="text-sm space-y-1.5 text-muted-foreground">
              <li>Simple key-value, strings only (max 1MB)</li>
              <li>Multi-threaded, uses all CPU cores</li>
              <li>No persistence, no built-in replication</li>
              <li>Client-side consistent hashing</li>
              <li><strong>Best for:</strong> pure caching at massive scale</li>
            </ul>
          ),
        }}
        after={{
          title: "Redis",
          content: (
            <ul className="text-sm space-y-1.5 text-muted-foreground">
              <li>Rich data structures: lists, sets, sorted sets, streams</li>
              <li>Persistence (RDB + AOF), async replication</li>
              <li>Server-side sharding: 16,384 hash slots</li>
              <li>Built-in Pub/Sub for invalidation</li>
              <li><strong>Best for:</strong> sessions, leaderboards, rate limiting, queues</li>
            </ul>
          ),
        }}
      />

      <TopicQuiz
        questions={[
          {
            question: "With 3 cache servers and modular hashing (hash % 3), you add a 4th server. Approximately what percentage of keys need to be remapped?",
            options: [
              "25% (only the new server's share)",
              "33% (one-third of keys)",
              "75% (nearly all keys)",
              "100% (every single key)",
            ],
            correctIndex: 2,
            explanation: "With modular hashing, changing N from 3 to 4 remaps approximately 75% of keys because hash % 3 and hash % 4 produce different results for most values. Consistent hashing reduces this to roughly K/N (~25%).",
          },
          {
            question: "In a Redis Cluster, how is data distributed across master nodes?",
            options: [
              "Round-robin assignment of keys",
              "Each master stores a range of the 16,384 hash slots (CRC16(key) % 16384)",
              "Consistent hashing ring with virtual nodes",
              "The client decides which master to write to",
            ],
            correctIndex: 1,
            explanation: "Redis Cluster uses 16,384 hash slots. Each key is assigned to a slot via CRC16(key) % 16384, and each master is responsible for a range of slots. This is server-side sharding, not client-side.",
          },
          {
            question: "What causes the 'thundering herd' problem in distributed caching?",
            options: [
              "Too many servers in the cluster",
              "A master node failing over to a replica",
              "All caches expiring simultaneously, causing many concurrent database queries",
              "Consistent hashing placing too many keys on one server",
            ],
            correctIndex: 2,
            explanation: "The thundering herd occurs when multiple cache entries expire at the same time (e.g., same TTL). All servers simultaneously discover cache misses and hit the database at once. Prevent this with staggered TTLs, cache locks, or stale-while-revalidate.",
          },
        ]}
      />

      <KeyTakeaway
        points={[
          "In-memory caches die with the process. External distributed caches (Redis, Memcached) survive restarts and are shared across all app servers.",
          "Consistent hashing minimizes key redistribution when servers change: only K/N keys move vs nearly all with modular hashing.",
          "Redis Cluster uses 16,384 hash slots with server-side sharding, built-in replication, and automatic failover via gossip protocol.",
          "Cache coherence requires invalidation broadcasts -- a write on one server must evict stale copies on all others.",
          "Thundering herds happen when all caches expire simultaneously. Prevent with staggered TTLs, cache locks, or stale-while-revalidate.",
          "Always design your app to survive total cache failure. The cache is an optimization, never the only path to data.",
        ]}
      />
    </div>
  );
}
