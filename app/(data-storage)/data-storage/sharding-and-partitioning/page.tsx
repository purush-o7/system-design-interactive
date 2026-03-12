"use client";

import { useState, useMemo, useCallback } from "react";
import { TopicHero } from "@/components/topic-hero";
import { KeyTakeaway } from "@/components/key-takeaway";
import { AhaMoment } from "@/components/aha-moment";
import { ConversationalCallout } from "@/components/conversational-callout";
import { BeforeAfter } from "@/components/before-after";
import { Playground } from "@/components/playground";
import { FlowDiagram } from "@/components/flow-diagram";
import type { FlowNode, FlowEdge } from "@/components/flow-diagram";
import { LiveChart } from "@/components/live-chart";
import { useSimulation } from "@/hooks/use-simulation";
import { cn } from "@/lib/utils";

// ── helpers ──────────────────────────────────────────────────────────────────

function simpleHash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0;
  }
  return h;
}

function rangeShardIndex(key: string): number {
  const first = key.charAt(0).toUpperCase();
  if (first <= "F") return 0;
  if (first <= "M") return 1;
  if (first <= "S") return 2;
  return 3;
}

const SHARD_COLORS = ["#3b82f6", "#22c55e", "#eab308", "#a855f7"];
const SHARD_NAMES = ["Shard A", "Shard B", "Shard C", "Shard D"];

// ── 1. Shard Distribution Playground ─────────────────────────────────────────

function ShardDistributionPlayground() {
  const [mode, setMode] = useState<"hash" | "range">("hash");
  const [input, setInput] = useState("");
  const [keys, setKeys] = useState<string[]>(["alice", "bob", "carol", "dave", "eve", "frank"]);
  const [lastAdded, setLastAdded] = useState<string | null>(null);

  const addKey = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || keys.includes(trimmed)) return;
    setKeys((prev) => [...prev, trimmed]);
    setLastAdded(trimmed);
    setInput("");
    setTimeout(() => setLastAdded(null), 1200);
  }, [input, keys]);

  const shardAssignments = useMemo(() => {
    const buckets: string[][] = [[], [], [], []];
    for (const key of keys) {
      const idx = mode === "hash" ? simpleHash(key) % 4 : rangeShardIndex(key);
      buckets[idx].push(key);
    }
    return buckets;
  }, [keys, mode]);

  const chartData = shardAssignments.map((bucket, i) => ({
    shard: SHARD_NAMES[i],
    count: bucket.length,
  }));

  const maxCount = Math.max(...shardAssignments.map((b) => b.length), 1);
  const isUnbalanced = maxCount > keys.length / 4 + 2 && keys.length > 4;

  // Build flow nodes: Router at left, 4 shard database nodes at right
  const flowNodes: FlowNode[] = [
    {
      id: "router",
      type: "gatewayNode",
      position: { x: 20, y: 120 },
      data: {
        label: "Router",
        sublabel: mode === "hash" ? "hash(key) % 4" : "Range A-F / G-M / N-S / T-Z",
        status: "healthy",
        handles: { right: true },
      },
    },
    ...shardAssignments.map((bucket, i) => ({
      id: `shard-${i}`,
      type: "databaseNode" as const,
      position: { x: 320, y: i * 85 + 10 },
      data: {
        label: SHARD_NAMES[i],
        sublabel: `${bucket.length} keys`,
        status: (bucket.length === maxCount && isUnbalanced
          ? "warning"
          : bucket.length === 0
            ? "idle"
            : "healthy") as "warning" | "idle" | "healthy",
        metrics: [{ label: "Keys", value: String(bucket.length) }],
        handles: { left: true },
      },
    })),
  ];

  const flowEdges: FlowEdge[] = [0, 1, 2, 3].map((i) => ({
    id: `router-shard-${i}`,
    source: "router",
    target: `shard-${i}`,
    sourceHandle: "right",
    targetHandle: "left",
    animated: shardAssignments[i].length > 0,
    style: { stroke: SHARD_COLORS[i], strokeWidth: 2, opacity: shardAssignments[i].length > 0 ? 0.8 : 0.2 },
  }));

  return (
    <Playground
      title="Shard Distribution Playground"
      controls={false}
      canvasHeight="min-h-[520px]"
      canvas={
        <div className="p-4 space-y-4">
          {/* Mode toggle and input */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex gap-1 rounded-lg border border-border/50 p-0.5">
              <button
                onClick={() => setMode("hash")}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                  mode === "hash"
                    ? "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Hash-Based
              </button>
              <button
                onClick={() => setMode("range")}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                  mode === "range"
                    ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Range-Based
              </button>
            </div>
            <div className="flex gap-2 flex-1 min-w-[200px]">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addKey()}
                placeholder="Type a user name or ID..."
                className="flex-1 rounded-lg border border-border/50 bg-muted/20 px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-violet-500/50"
              />
              <button
                onClick={addKey}
                className="rounded-lg bg-violet-500/15 border border-violet-500/30 px-3 py-1.5 text-xs font-medium text-violet-400 hover:bg-violet-500/25 transition-colors"
              >
                Add Key
              </button>
              <button
                onClick={() => { setKeys([]); setLastAdded(null); }}
                className="rounded-lg border border-border/50 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Flow diagram */}
          <FlowDiagram
            nodes={flowNodes}
            edges={flowEdges}
            minHeight={280}
            interactive={false}
            allowDrag={false}
          />

          {/* Shard contents */}
          <div className="grid grid-cols-4 gap-2">
            {shardAssignments.map((bucket, i) => (
              <div
                key={i}
                className={cn(
                  "rounded-lg border p-2 transition-all duration-300",
                  bucket.length === maxCount && isUnbalanced
                    ? "border-red-500/40 bg-red-500/[0.06]"
                    : "border-border/40 bg-muted/20"
                )}
              >
                <p className="text-[10px] font-semibold mb-1" style={{ color: SHARD_COLORS[i] }}>
                  {SHARD_NAMES[i]}
                  {mode === "range" && (
                    <span className="text-muted-foreground/60 ml-1">
                      ({i === 0 ? "A-F" : i === 1 ? "G-M" : i === 2 ? "N-S" : "T-Z"})
                    </span>
                  )}
                </p>
                <div className="flex flex-wrap gap-1">
                  {bucket.map((k) => (
                    <span
                      key={k}
                      className={cn(
                        "text-[9px] font-mono px-1.5 py-0.5 rounded border transition-all",
                        k === lastAdded
                          ? "bg-violet-500/20 border-violet-500/40 text-violet-400 animate-pulse"
                          : "bg-muted/30 border-border/30 text-muted-foreground"
                      )}
                    >
                      {k}
                    </span>
                  ))}
                  {bucket.length === 0 && (
                    <span className="text-[9px] text-muted-foreground/30">empty</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Distribution bar chart */}
          <LiveChart
            type="bar"
            data={chartData}
            dataKeys={{ x: "shard", y: "count", label: "Keys" }}
            height={120}
            colors={SHARD_COLORS}
          />

          {isUnbalanced && (
            <p className="text-xs text-center text-amber-400 font-medium">
              Hotspot detected — one shard has significantly more keys than the others.
            </p>
          )}
        </div>
      }
      explanation={
        <div className="space-y-3">
          <p className="font-semibold text-foreground">How it works</p>
          {mode === "hash" ? (
            <>
              <p>Each key is hashed and the result modulo 4 determines the shard. This tends to distribute data evenly regardless of key patterns.</p>
              <p className="text-xs font-mono bg-muted/30 rounded p-2">shard = hash(key) % 4</p>
              <p>Try adding keys like &quot;user_1&quot;, &quot;user_2&quot;, etc. and notice how they spread evenly. The downside: range queries (e.g. &quot;all users starting with A&quot;) must fan out to every shard.</p>
            </>
          ) : (
            <>
              <p>Keys are assigned to shards based on their first character: A-F goes to Shard A, G-M to Shard B, N-S to Shard C, T-Z to Shard D.</p>
              <p className="text-xs font-mono bg-muted/30 rounded p-2">A-F → Shard A, G-M → Shard B, ...</p>
              <p>Try adding common English names and notice how some ranges get more data than others. Real-world names are not uniformly distributed across letters.</p>
            </>
          )}
        </div>
      }
    />
  );
}

// ── 2. Resharding Simulation ─────────────────────────────────────────────────

function ReshardingSimulation() {
  const [numShards, setNumShards] = useState(2);
  const [hashingMode, setHashingMode] = useState<"modular" | "consistent">("modular");

  const allKeys = useMemo(
    () => Array.from({ length: 24 }, (_, i) => `key_${String(i + 1).padStart(2, "0")}`),
    []
  );

  const assignKeys = useCallback(
    (n: number, mode: "modular" | "consistent") => {
      const buckets: string[][] = Array.from({ length: n }, () => []);
      for (const key of allKeys) {
        const h = simpleHash(key);
        if (mode === "modular") {
          buckets[h % n].push(key);
        } else {
          // consistent hashing simulation — keys on a ring, servers at fixed positions
          const ringPos = h % 360;
          const serverPositions = Array.from({ length: n }, (_, i) => (i * (360 / n)) | 0);
          let best = 0;
          let minDist = 361;
          for (let s = 0; s < n; s++) {
            const dist = (serverPositions[s] - ringPos + 360) % 360;
            if (dist < minDist) {
              minDist = dist;
              best = s;
            }
          }
          buckets[best].push(key);
        }
      }
      return buckets;
    },
    [allKeys]
  );

  const prevAssignment = assignKeys(numShards > 2 ? numShards - 1 : 2, hashingMode);
  const currAssignment = assignKeys(numShards, hashingMode);

  // Calculate how many keys moved
  const movedCount = useMemo(() => {
    const prevMap = new Map<string, number>();
    prevAssignment.forEach((bucket, shardIdx) => {
      bucket.forEach((key) => prevMap.set(key, shardIdx));
    });
    let moved = 0;
    currAssignment.forEach((bucket, shardIdx) => {
      bucket.forEach((key) => {
        if (prevMap.get(key) !== shardIdx) moved++;
      });
    });
    return numShards === 2 ? 0 : moved;
  }, [prevAssignment, currAssignment, numShards]);

  const movedPct = numShards === 2 ? 0 : Math.round((movedCount / allKeys.length) * 100);

  const chartData = currAssignment.map((bucket, i) => ({
    shard: `Shard ${i + 1}`,
    count: bucket.length,
  }));

  return (
    <Playground
      title="Resharding Simulation"
      controls={false}
      canvasHeight="min-h-[400px]"
      canvas={
        <div className="p-4 space-y-4">
          {/* Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex gap-1 rounded-lg border border-border/50 p-0.5">
              <button
                onClick={() => setHashingMode("modular")}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                  hashingMode === "modular"
                    ? "bg-red-500/15 text-red-400 border border-red-500/30"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Modular Hashing
              </button>
              <button
                onClick={() => setHashingMode("consistent")}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                  hashingMode === "consistent"
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Consistent Hashing
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setNumShards((n) => Math.max(2, n - 1))}
                disabled={numShards <= 2}
                className="rounded-lg border border-border/50 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
              >
                Remove Shard
              </button>
              <span className="text-sm font-mono font-semibold text-foreground w-20 text-center">
                {numShards} shards
              </span>
              <button
                onClick={() => setNumShards((n) => Math.min(6, n + 1))}
                disabled={numShards >= 6}
                className="rounded-lg bg-violet-500/15 border border-violet-500/30 px-3 py-1.5 text-xs font-medium text-violet-400 hover:bg-violet-500/25 disabled:opacity-30 transition-colors"
              >
                Add Shard
              </button>
            </div>
          </div>

          {/* Big metric: data that moved */}
          {numShards > 2 && (
            <div className="flex items-center justify-center gap-6">
              <div className="text-center">
                <p className={cn(
                  "text-4xl font-bold tabular-nums",
                  movedPct > 50 ? "text-red-400" : movedPct > 25 ? "text-amber-400" : "text-emerald-400"
                )}>
                  {movedPct}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  data moved ({movedCount} of {allKeys.length} keys)
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  {hashingMode === "modular"
                    ? "Modular: nearly all keys rehash when shard count changes."
                    : "Consistent: only keys near the new server on the ring move."}
                </p>
              </div>
            </div>
          )}

          {/* Bar chart */}
          <LiveChart
            type="bar"
            data={chartData}
            dataKeys={{ x: "shard", y: "count", label: "Keys" }}
            height={140}
            colors={SHARD_COLORS.slice(0, numShards)}
          />

          {/* Shard grid */}
          <div className={cn("grid gap-2", numShards <= 4 ? "grid-cols-4" : "grid-cols-3")}>
            {currAssignment.map((bucket, i) => (
              <div key={i} className="rounded-lg border border-border/40 bg-muted/20 p-2">
                <p className="text-[10px] font-semibold mb-1" style={{ color: SHARD_COLORS[i % SHARD_COLORS.length] }}>
                  Shard {i + 1}
                  <span className="text-muted-foreground/50 ml-1">({bucket.length})</span>
                </p>
                <div className="flex flex-wrap gap-0.5">
                  {bucket.slice(0, 8).map((k) => (
                    <span key={k} className="text-[8px] font-mono px-1 py-0.5 rounded bg-muted/30 text-muted-foreground">
                      {k}
                    </span>
                  ))}
                  {bucket.length > 8 && (
                    <span className="text-[8px] text-muted-foreground/50">+{bucket.length - 8} more</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      }
      explanation={
        <div className="space-y-3">
          <p className="font-semibold text-foreground">Why resharding matters</p>
          <p>When your dataset outgrows your shards, you need to add more. But how you hash determines how painful that is.</p>
          <div className="space-y-2 text-xs">
            <div className="rounded p-2 bg-red-500/[0.06] border border-red-500/20">
              <p className="font-semibold text-red-400">Modular Hashing</p>
              <p className="mt-1">key % N changes for almost every key when N changes. Going from 3 to 4 shards can move ~75% of all data.</p>
            </div>
            <div className="rounded p-2 bg-emerald-500/[0.06] border border-emerald-500/20">
              <p className="font-semibold text-emerald-400">Consistent Hashing</p>
              <p className="mt-1">Only ~1/N of keys move when adding a shard. The new shard takes ownership of a range on the hash ring, affecting only its neighbors.</p>
            </div>
          </div>
          <p>Click &quot;Add Shard&quot; and &quot;Remove Shard&quot; to see the difference. Toggle between hashing modes to compare.</p>
        </div>
      }
    />
  );
}

// ── 3. Hot Partition Demo ────────────────────────────────────────────────────

function HotPartitionDemo() {
  const sim = useSimulation({ intervalMs: 600, maxSteps: 40 });

  const [useSuffix, setUseSuffix] = useState(false);

  // Simulate writes: celebrity user gets 80% of writes
  const writes = useMemo(() => {
    const result: { key: string; shard: number }[] = [];
    for (let i = 0; i < sim.step; i++) {
      const isCelebWrite = i % 5 !== 0; // 80% celebrity
      let key: string;
      if (isCelebWrite) {
        key = useSuffix ? `celeb_${i % 4}` : "celebrity_user";
      } else {
        key = `normal_user_${i}`;
      }
      const shard = simpleHash(key) % 4;
      result.push({ key, shard });
    }
    return result;
  }, [sim.step, useSuffix]);

  const shardCounts = useMemo(() => {
    const counts = [0, 0, 0, 0];
    for (const w of writes) counts[w.shard]++;
    return counts;
  }, [writes]);

  const totalWrites = writes.length;
  const maxWrites = Math.max(...shardCounts, 1);

  const flowNodes: FlowNode[] = [
    {
      id: "client",
      type: "clientNode",
      position: { x: 20, y: 120 },
      data: {
        label: "Write Traffic",
        sublabel: `${totalWrites} writes`,
        status: "healthy",
        handles: { right: true },
      },
    },
    ...shardCounts.map((count, i) => {
      const pct = totalWrites > 0 ? Math.round((count / totalWrites) * 100) : 0;
      const isHot = pct > 40;
      return {
        id: `shard-${i}`,
        type: "databaseNode" as const,
        position: { x: 320, y: i * 85 + 10 },
        data: {
          label: SHARD_NAMES[i],
          sublabel: `${count} writes (${pct}%)`,
          status: (isHot ? "unhealthy" : count === 0 ? "idle" : "healthy") as "unhealthy" | "idle" | "healthy",
          metrics: [{ label: "Load", value: `${pct}%` }],
          handles: { left: true },
        },
      };
    }),
  ];

  const flowEdges: FlowEdge[] = shardCounts.map((count, i) => ({
    id: `client-shard-${i}`,
    source: "client",
    target: `shard-${i}`,
    sourceHandle: "right",
    targetHandle: "left",
    animated: count > 0,
    style: {
      stroke: count === maxWrites && totalWrites > 5 && !useSuffix ? "#ef4444" : SHARD_COLORS[i],
      strokeWidth: Math.max(1, Math.min(4, (count / Math.max(maxWrites, 1)) * 4)),
      opacity: count > 0 ? 0.8 : 0.15,
    },
  }));

  const chartData = shardCounts.map((count, i) => ({
    shard: SHARD_NAMES[i],
    writes: count,
  }));

  return (
    <Playground
      title="Hot Partition Demo — Celebrity User Problem"
      simulation={sim}
      canvasHeight="min-h-[480px]"
      canvas={
        <div className="p-4 space-y-4">
          {/* Fix toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setUseSuffix(false); sim.reset(); }}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                !useSuffix
                  ? "bg-red-500/10 border-red-500/30 text-red-400"
                  : "bg-muted/20 border-border/50 text-muted-foreground hover:text-foreground"
              )}
            >
              No Fix (all writes to one key)
            </button>
            <button
              onClick={() => { setUseSuffix(true); sim.reset(); }}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                useSuffix
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : "bg-muted/20 border-border/50 text-muted-foreground hover:text-foreground"
              )}
            >
              Fix: Random Suffix (spread writes)
            </button>
          </div>

          {/* Flow diagram */}
          <FlowDiagram
            nodes={flowNodes}
            edges={flowEdges}
            minHeight={260}
            interactive={false}
            allowDrag={false}
          />

          {/* Live chart */}
          <LiveChart
            type="bar"
            data={chartData}
            dataKeys={{ x: "shard", y: "writes", label: "Writes" }}
            height={120}
            colors={SHARD_COLORS}
            referenceLines={totalWrites > 5 ? [{ y: totalWrites / 4, label: "ideal", color: "#22c55e" }] : undefined}
          />
        </div>
      }
      explanation={(state) => (
        <div className="space-y-3">
          <p className="font-semibold text-foreground">The Celebrity Problem</p>
          <p>
            Imagine a social media platform where one user (a celebrity) gets millions of interactions.
            All writes for that user hash to the same shard, creating a hot partition.
          </p>
          {!useSuffix ? (
            <div className="rounded p-2 bg-red-500/[0.06] border border-red-500/20 text-xs">
              <p className="font-semibold text-red-400">Problem</p>
              <p className="mt-1 font-mono">hash(&quot;celebrity_user&quot;) % 4</p>
              <p className="mt-1">Always maps to the same shard. That shard is overwhelmed while others sit idle.</p>
            </div>
          ) : (
            <div className="rounded p-2 bg-emerald-500/[0.06] border border-emerald-500/20 text-xs">
              <p className="font-semibold text-emerald-400">Fix: Write Sharding</p>
              <p className="mt-1 font-mono">hash(&quot;celeb_&quot; + random(0..3)) % 4</p>
              <p className="mt-1">Append a random suffix to the key to spread writes across shards. Reads must gather from all suffix-shards and merge.</p>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Step {state.step} / {state.maxSteps}. Press play to watch writes accumulate.
          </p>
        </div>
      )}
    />
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ShardingAndPartitioningPage() {
  return (
    <div className="space-y-8">
      <TopicHero
        title="Sharding & Partitioning"
        subtitle="Your database hit 1TB and everything ground to a halt. Time to split it up — but choose the wrong key and you'll create a hotspot worse than the original problem."
        difficulty="advanced"
      />

      {/* Intro context */}
      <section className="space-y-4 max-w-3xl mx-auto px-4">
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">Partitioning</strong> splits a table into smaller pieces on the
          <em> same server</em> (think PostgreSQL table partitions by date range).
          <strong className="text-foreground"> Sharding</strong> splits data across
          <em> multiple servers</em>, each holding a subset. Sharding is what you reach for when a single machine
          genuinely cannot handle your write volume or data size.
        </p>
      </section>

      <BeforeAfter
        before={{
          title: "Single Database (1TB)",
          content: (
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li>Query latency: 5,000ms at peak</li>
              <li>Backup time: 8 hours</li>
              <li>Schema migration: 45-minute table lock</li>
              <li>Max connections: saturated</li>
              <li>Single point of failure</li>
            </ul>
          ),
        }}
        after={{
          title: "Sharded (4 x 250GB)",
          content: (
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li>Query latency: 50ms (hits one shard)</li>
              <li>Backup time: 2 hours per shard (parallel)</li>
              <li>Rolling schema migrations, no downtime</li>
              <li>4x connection capacity</li>
              <li>Fault-isolated: one shard failure does not affect others</li>
            </ul>
          ),
        }}
      />

      {/* Playground 1: Shard Distribution */}
      <ShardDistributionPlayground />

      <ConversationalCallout type="tip">
        Try switching between Hash-Based and Range-Based modes with the same keys. Notice how hash-based
        distributes evenly, while range-based can create hotspots if your data clusters in certain letter
        ranges. This is why most production systems default to hash-based sharding.
      </ConversationalCallout>

      {/* Playground 2: Resharding */}
      <ReshardingSimulation />

      <AhaMoment
        question="Why does modular hashing move so many keys when you add a shard?"
        answer={
          <p>
            With modular hashing, the shard is <code className="text-xs bg-muted px-1 rounded font-mono">hash(key) % N</code>.
            When N changes from 3 to 4, nearly every key produces a different remainder. For example,
            <code className="text-xs bg-muted px-1 rounded font-mono">hash(&quot;alice&quot;) = 17</code> maps to shard 2 with 3 shards
            (17 % 3 = 2) but shard 1 with 4 shards (17 % 4 = 1). Consistent hashing avoids this by placing
            servers and keys on a ring — adding a server only steals keys from its clockwise neighbor.
          </p>
        }
      />

      {/* Playground 3: Hot Partition */}
      <HotPartitionDemo />

      <ConversationalCallout type="warning">
        <strong>Cross-shard queries are expensive.</strong> A scatter-gather query fans out to all shards,
        waits for all responses, then merges. If you have 100 shards, that is 100 network round trips.
        Design your data model so the most common queries hit a single shard. If you frequently JOIN
        across shard boundaries, your shard key is wrong.
      </ConversationalCallout>

      <AhaMoment
        question="When should you NOT shard?"
        answer={
          <p>
            Sharding adds enormous complexity: cross-shard joins, distributed transactions, rebalancing,
            routing logic, and operational overhead. Before sharding, exhaust these options:
            (1) optimize queries and indexes, (2) add read replicas, (3) use table partitioning on the same
            server, (4) archive cold data, (5) vertically scale. Shard only when you have genuinely hit
            the ceiling of a single machine.
          </p>
        }
      />

      <section className="max-w-3xl mx-auto px-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 pr-4 font-semibold">Use Case</th>
                <th className="text-left py-2 pr-4 font-semibold">Good Key</th>
                <th className="text-left py-2 pr-4 font-semibold">Bad Key</th>
                <th className="text-left py-2 font-semibold">Why</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground text-xs">
              <tr className="border-b border-muted">
                <td className="py-2 pr-4 text-foreground">Multi-tenant SaaS</td>
                <td className="py-2 pr-4 text-emerald-400 font-mono">tenant_id</td>
                <td className="py-2 pr-4 text-red-400 font-mono">created_at</td>
                <td className="py-2">Queries stay on one shard; timestamps create write hotspots</td>
              </tr>
              <tr className="border-b border-muted">
                <td className="py-2 pr-4 text-foreground">Social media</td>
                <td className="py-2 pr-4 text-emerald-400 font-mono">user_id</td>
                <td className="py-2 pr-4 text-red-400 font-mono">post_date</td>
                <td className="py-2">Profiles and posts co-located; dates = all new writes hit one shard</td>
              </tr>
              <tr className="border-b border-muted">
                <td className="py-2 pr-4 text-foreground">E-commerce</td>
                <td className="py-2 pr-4 text-emerald-400 font-mono">order_id (hash)</td>
                <td className="py-2 pr-4 text-red-400 font-mono">country</td>
                <td className="py-2">US shard would hold 60% of data; hashed IDs distribute evenly</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 text-foreground">IoT telemetry</td>
                <td className="py-2 pr-4 text-emerald-400 font-mono">device_id</td>
                <td className="py-2 pr-4 text-red-400 font-mono">sensor_type</td>
                <td className="py-2">Only 5 sensor types (low cardinality); millions of device IDs</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <KeyTakeaway
        points={[
          "Partitioning splits data within one server; sharding splits it across multiple servers. Shard when a single machine cannot handle your data volume or write throughput.",
          "Hash-based sharding distributes data evenly but makes range queries expensive. Range-based preserves ordering but risks hotspots on skewed data.",
          "Consistent hashing minimizes key redistribution when adding servers — only ~1/N keys move instead of rehashing everything.",
          "The shard key determines everything — pick one with high cardinality, even distribution, and alignment with your query patterns.",
          "Hot partitions happen when one key receives disproportionate traffic. Fix with write sharding: append a random suffix to spread writes, merge on read.",
          "Sharding is a last resort. Exhaust indexing, read replicas, partitioning, archiving, and vertical scaling first.",
        ]}
      />
    </div>
  );
}
