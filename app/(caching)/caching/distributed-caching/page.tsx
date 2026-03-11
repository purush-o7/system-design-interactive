"use client";

import { useState, useEffect } from "react";
import { TopicHero } from "@/components/topic-hero";
import { FailureScenario } from "@/components/failure-scenario";
import { WhyItBreaks } from "@/components/why-it-breaks";
import { ConceptVisualizer } from "@/components/concept-visualizer";
import { CorrectApproach } from "@/components/correct-approach";
import { KeyTakeaway } from "@/components/key-takeaway";
import { AhaMoment } from "@/components/aha-moment";
import { ConversationalCallout } from "@/components/conversational-callout";
import { BeforeAfter } from "@/components/before-after";
import { ServerNode } from "@/components/server-node";
import { MetricCounter } from "@/components/metric-counter";
import { InteractiveDemo } from "@/components/interactive-demo";
import { cn } from "@/lib/utils";
import { Server, Database, HardDrive, Wifi, WifiOff, Hash, Circle } from "lucide-react";

function ConsistentHashRing() {
  const [step, setStep] = useState(0);
  const [failedNode, setFailedNode] = useState(false);

  useEffect(() => {
    const t = setInterval(() => {
      setStep((s) => {
        const next = (s + 1) % 8;
        if (next === 6) setFailedNode(true);
        if (next === 0) setFailedNode(false);
        return next;
      });
    }, 1800);
    return () => clearInterval(t);
  }, []);

  // Nodes positioned on ring (degrees)
  const nodes = [
    { id: "N1", angle: 30, color: "text-blue-400", bg: "bg-blue-500/15 border-blue-500/30" },
    { id: "N2", angle: 150, color: "text-emerald-400", bg: "bg-emerald-500/15 border-emerald-500/30" },
    { id: "N3", angle: 270, color: "text-purple-400", bg: "bg-purple-500/15 border-purple-500/30" },
  ];

  // Keys positioned on ring
  const keys = [
    { id: "user:42", angle: 60, owner: "N2", newOwner: "N2" },
    { id: "sess:99", angle: 180, owner: "N3", newOwner: "N3" },
    { id: "prod:7", angle: 100, owner: "N2", newOwner: "N3" },
    { id: "cart:55", angle: 200, owner: "N3", newOwner: "N3" },
    { id: "item:12", angle: 320, owner: "N1", newOwner: "N1" },
  ];

  const radius = 90;
  const cx = 120;
  const cy = 120;

  const toXY = (angle: number, r: number = radius) => ({
    x: cx + r * Math.cos(((angle - 90) * Math.PI) / 180),
    y: cy + r * Math.sin(((angle - 90) * Math.PI) / 180),
  });

  const descriptions = [
    "Three nodes placed on the hash ring at fixed positions",
    "Keys are hashed to positions on the ring",
    "Each key walks clockwise to find its owner node",
    "user:42 -> N2, sess:99 -> N3, item:12 -> N1",
    "All keys are mapped to their nearest clockwise node",
    "What if N2 fails?",
    "N2 goes down! Only N2's keys need to rehash",
    "prod:7 and user:42 remap to N3. Other keys unaffected.",
  ];

  return (
    <div className="space-y-3">
      <div className="flex justify-center">
        <svg width="240" height="240" viewBox="0 0 240 240" className="overflow-visible">
          {/* Ring circle */}
          <circle cx={cx} cy={cy} r={radius} fill="none" stroke="currentColor" strokeWidth="1" className="text-border/30" strokeDasharray="4 4" />

          {/* Nodes */}
          {nodes.map((node) => {
            const pos = toXY(node.angle);
            const isFailed = failedNode && node.id === "N2";
            return (
              <g key={node.id}>
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={16}
                  className={cn(
                    "transition-all duration-500",
                    isFailed ? "fill-red-500/20 stroke-red-500/50" : node.id === "N1" ? "fill-blue-500/15 stroke-blue-500/40" : node.id === "N2" ? "fill-emerald-500/15 stroke-emerald-500/40" : "fill-purple-500/15 stroke-purple-500/40"
                  )}
                  strokeWidth="2"
                />
                {isFailed && (
                  <line x1={pos.x - 8} y1={pos.y - 8} x2={pos.x + 8} y2={pos.y + 8} stroke="currentColor" strokeWidth="2" className="text-red-500" />
                )}
                {isFailed && (
                  <line x1={pos.x + 8} y1={pos.y - 8} x2={pos.x - 8} y2={pos.y + 8} stroke="currentColor" strokeWidth="2" className="text-red-500" />
                )}
                <text
                  x={pos.x}
                  y={pos.y + 1}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className={cn(
                    "text-[10px] font-bold transition-all",
                    isFailed ? "fill-red-400" : node.id === "N1" ? "fill-blue-400" : node.id === "N2" ? "fill-emerald-400" : "fill-purple-400"
                  )}
                >
                  {isFailed ? "X" : node.id}
                </text>
              </g>
            );
          })}

          {/* Keys */}
          {step >= 1 && keys.map((key) => {
            const pos = toXY(key.angle, radius - 25);
            const owner = failedNode && key.owner === "N2" ? key.newOwner : key.owner;
            const ownerNode = nodes.find((n) => n.id === owner);
            const isRemapped = failedNode && key.owner === "N2";
            const showArrow = step >= 2 && step <= 4;

            return (
              <g key={key.id}>
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={4}
                  className={cn(
                    "transition-all duration-500",
                    isRemapped ? "fill-amber-400" : "fill-muted-foreground/60"
                  )}
                />
                <text
                  x={pos.x}
                  y={pos.y - 8}
                  textAnchor="middle"
                  className={cn(
                    "text-[7px] font-mono transition-all",
                    isRemapped ? "fill-amber-400" : "fill-muted-foreground/40"
                  )}
                >
                  {key.id}
                </text>
                {showArrow && ownerNode && (
                  <line
                    x1={pos.x}
                    y1={pos.y}
                    x2={toXY(ownerNode.angle).x}
                    y2={toXY(ownerNode.angle).y}
                    stroke="currentColor"
                    strokeWidth="0.5"
                    strokeDasharray="2 2"
                    className="text-muted-foreground/20"
                  />
                )}
              </g>
            );
          })}
        </svg>
      </div>
      <p className="text-[11px] text-center text-muted-foreground">{descriptions[step]}</p>
    </div>
  );
}

function ModularVsConsistentViz() {
  const [nodeCount, setNodeCount] = useState(3);
  const [prevCount, setPrevCount] = useState(3);

  const totalKeys = 12;
  const keys = Array.from({ length: totalKeys }, (_, i) => `key${i}`);

  const modularMap = keys.map((_, i) => i % nodeCount);
  const prevModularMap = keys.map((_, i) => i % prevCount);
  const modularRemapped = modularMap.filter((n, i) => n !== prevModularMap[i]).length;

  // Consistent hash (simplified simulation)
  const consistentMap = keys.map((_, i) => {
    const hash = (i * 2654435761) >>> 0;
    return hash % nodeCount;
  });
  const prevConsistentMap = keys.map((_, i) => {
    const hash = (i * 2654435761) >>> 0;
    return hash % prevCount;
  });
  const consistentRemapped = nodeCount !== prevCount
    ? Math.round(totalKeys / Math.max(nodeCount, prevCount))
    : 0;

  const nodeColors = ["text-blue-400", "text-emerald-400", "text-purple-400", "text-amber-400", "text-rose-400"];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground">Nodes:</span>
        {[3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => { setPrevCount(nodeCount); setNodeCount(n); }}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-medium border transition-all",
              nodeCount === n
                ? "bg-blue-500/15 border-blue-500/30 text-blue-400"
                : "bg-muted/20 border-border/30 text-muted-foreground hover:bg-muted/40"
            )}
          >
            {n}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="text-xs font-semibold text-red-400">Modular: hash % {nodeCount}</div>
          <div className="grid grid-cols-6 gap-1">
            {modularMap.map((node, i) => (
              <div
                key={i}
                className={cn(
                  "rounded text-[9px] font-mono text-center py-1 border transition-all",
                  node !== prevModularMap[i] && nodeCount !== prevCount
                    ? "bg-red-500/15 border-red-500/30"
                    : "bg-muted/10 border-border/20"
                )}
              >
                <span className={nodeColors[node]}>N{node}</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-red-400 font-mono">
            {nodeCount !== prevCount ? `${modularRemapped}/${totalKeys} keys remapped` : "Change node count to see"}
          </p>
        </div>

        <div className="space-y-2">
          <div className="text-xs font-semibold text-emerald-400">Consistent: K/N only</div>
          <div className="grid grid-cols-6 gap-1">
            {consistentMap.map((node, i) => (
              <div
                key={i}
                className={cn(
                  "rounded text-[9px] font-mono text-center py-1 border transition-all",
                  "bg-muted/10 border-border/20"
                )}
              >
                <span className={nodeColors[node % nodeColors.length]}>N{node}</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-emerald-400 font-mono">
            {nodeCount !== prevCount ? `~${consistentRemapped}/${totalKeys} keys remapped` : "Change node count to see"}
          </p>
        </div>
      </div>
    </div>
  );
}

function RedisVsMemcachedArch() {
  const [view, setView] = useState<"redis" | "memcached">("redis");

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(["redis", "memcached"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-medium border transition-all capitalize",
              view === v
                ? v === "redis" ? "bg-red-500/15 border-red-500/30 text-red-400" : "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                : "bg-muted/20 border-border/30 text-muted-foreground hover:bg-muted/40"
            )}
          >
            {v}
          </button>
        ))}
      </div>

      {view === "redis" ? (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Master 1", slots: "0-5460", status: "healthy" as const },
              { label: "Master 2", slots: "5461-10922", status: "healthy" as const },
              { label: "Master 3", slots: "10923-16383", status: "healthy" as const },
            ].map((node) => (
              <div key={node.label} className="rounded-lg border border-red-500/20 bg-red-500/5 p-2.5 text-center">
                <div className="text-xs font-semibold text-red-400">{node.label}</div>
                <div className="text-[9px] font-mono text-muted-foreground mt-0.5">slots {node.slots}</div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {["Replica 1", "Replica 2", "Replica 3"].map((label) => (
              <div key={label} className="rounded-lg border border-border/20 bg-muted/10 p-2 text-center">
                <div className="text-[10px] text-muted-foreground">{label}</div>
                <div className="text-[9px] text-muted-foreground/60">async replication</div>
              </div>
            ))}
          </div>
          <div className="space-y-1.5 text-[11px] text-muted-foreground">
            <p><strong className="text-foreground">Sharding:</strong> 16,384 hash slots distributed across masters. Key slot = CRC16(key) % 16384.</p>
            <p><strong className="text-foreground">Replication:</strong> Each master has 1+ async replicas. Automatic failover via Redis Sentinel or Cluster mode.</p>
            <p><strong className="text-foreground">Gossip protocol:</strong> Nodes communicate via TCP gossip to detect failures (mesh topology).</p>
            <p><strong className="text-foreground">Threading:</strong> Single-threaded command execution (since Redis 6: I/O threads for network). ~100K+ ops/sec per node.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-2.5 text-center">
            <div className="text-xs font-semibold text-emerald-400">Client Library</div>
            <div className="text-[9px] text-muted-foreground">Consistent hashing / key routing</div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {["Node 1", "Node 2", "Node 3"].map((label) => (
              <div key={label} className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-2.5 text-center">
                <div className="text-xs font-semibold text-emerald-400">{label}</div>
                <div className="text-[9px] text-muted-foreground">independent</div>
              </div>
            ))}
          </div>
          <div className="space-y-1.5 text-[11px] text-muted-foreground">
            <p><strong className="text-foreground">Sharding:</strong> Client-side only. The client library hashes keys and routes to the correct node. Nodes do not know about each other.</p>
            <p><strong className="text-foreground">Replication:</strong> None built-in. Rely on external solutions or accept data loss on node failure.</p>
            <p><strong className="text-foreground">Protocol:</strong> No inter-node communication. Each node is fully independent — just a hash map.</p>
            <p><strong className="text-foreground">Threading:</strong> Multi-threaded. Utilizes all CPU cores for I/O. Can outperform Redis by ~10-15% for simple GET/SET.</p>
          </div>
        </div>
      )}
    </div>
  );
}

function NodeFailureTimeline() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % 7), 1500);
    return () => clearInterval(t);
  }, []);

  const events = [
    { time: "T+0s", event: "All 3 cache nodes healthy", status: "ok" },
    { time: "T+5s", event: "Node 2 stops responding", status: "warning" },
    { time: "T+15s", event: "Gossip detects: Node 2 subjectively down", status: "warning" },
    { time: "T+30s", event: "Majority agrees: Node 2 objectively down", status: "error" },
    { time: "T+31s", event: "Replica of Node 2 promoted to master", status: "recovery" },
    { time: "T+32s", event: "Slot migration: clients redirect to new master", status: "recovery" },
    { time: "T+35s", event: "Cluster fully recovered. ~5s of elevated latency.", status: "ok" },
  ];

  return (
    <div className="space-y-1.5">
      {events.map((e, i) => (
        <div
          key={i}
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-1.5 transition-all duration-300 border",
            step === i
              ? e.status === "error"
                ? "bg-red-500/5 border-red-500/20 ring-1 ring-red-500/10"
                : e.status === "warning"
                ? "bg-amber-500/5 border-amber-500/20 ring-1 ring-amber-500/10"
                : e.status === "recovery"
                ? "bg-blue-500/5 border-blue-500/20 ring-1 ring-blue-500/10"
                : "bg-emerald-500/5 border-emerald-500/20 ring-1 ring-emerald-500/10"
              : step > i
              ? "bg-muted/10 border-border/20"
              : "bg-muted/5 border-transparent"
          )}
        >
          <span className={cn(
            "text-[10px] font-mono w-12 shrink-0",
            step >= i ? "text-muted-foreground" : "text-muted-foreground/20"
          )}>
            {e.time}
          </span>
          <div className={cn(
            "size-2 rounded-full shrink-0 transition-all",
            step < i ? "bg-muted-foreground/10" :
            e.status === "error" ? "bg-red-500" :
            e.status === "warning" ? "bg-amber-500" :
            e.status === "recovery" ? "bg-blue-500" : "bg-emerald-500"
          )} />
          <span className={cn(
            "text-[11px] transition-all",
            step >= i ? "text-muted-foreground" : "text-muted-foreground/20"
          )}>
            {e.event}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function DistributedCachingPage() {
  return (
    <div className="space-y-8">
      <TopicHero
        title="Distributed Caching"
        subtitle="When your app server restarts, the in-memory cache vanishes. Every user pays the cold-start penalty. The solution: move the cache outside the process, share it across all servers, and make it survive failures."
        difficulty="intermediate"
      />

      <FailureScenario title="Deploy wipes 45,000 sessions">
        <p className="text-sm text-muted-foreground">
          You are caching user sessions in a <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">HashMap</code> inside
          your app process. A deploy happens, the process restarts, and <strong className="text-red-400">every
          cached session is gone</strong>. Thousands of users are suddenly logged out. Your database gets hit
          with a thundering herd of session-reconstruction queries all at once. With 3 app servers, each
          maintaining its own cache, user &quot;Alice&quot; might be logged in on Server 1 but unknown on Server 2.
        </p>
        <div className="grid grid-cols-3 gap-3">
          <MetricCounter label="Sessions Lost" value={45000} trend="up" />
          <MetricCounter label="DB Spike" value={8500} unit="qps" trend="up" />
          <MetricCounter label="Login Errors" value={12} unit="%" trend="up" />
        </div>
      </FailureScenario>

      <WhyItBreaks title="In-process caches are fragile and inconsistent">
        <p className="text-sm text-muted-foreground">
          In-memory caches are tied to a single process. When that process dies — deploy, crash,
          scaling event — the cache dies with it. With multiple app servers, each maintains its own
          copy. User A updates their profile on Server 1, but Server 2 still serves the old version.
          You are paying for N copies of the same data across N servers, and none of them agree.
        </p>
        <div className="flex flex-col items-center gap-3 mt-4">
          <div className="flex gap-4 flex-wrap justify-center">
            <ServerNode type="client" label="App Server 1" sublabel="cache: {user:42}" status="healthy" />
            <ServerNode type="client" label="App Server 2" sublabel="cache: {user:42}" status="warning" />
            <ServerNode type="client" label="App Server 3" sublabel="cache: {}" status="unhealthy" />
          </div>
          <p className="text-[10px] text-red-400 font-medium">Three servers, three different views of the same data</p>
        </div>
      </WhyItBreaks>

      <ConceptVisualizer title="The Fix: External Cache Cluster">
        <p className="text-sm text-muted-foreground mb-4">
          Move the cache into a dedicated, shared cluster. App servers become stateless and can
          restart freely. The cache survives deploys, scales independently, and all servers see the
          same data. This is the architecture used by Facebook (Memcached clusters), Twitter (Redis),
          and nearly every large-scale web application.
        </p>
        <div className="flex flex-col items-center gap-6">
          <div className="flex gap-4 flex-wrap justify-center">
            <ServerNode type="client" label="App Server 1" sublabel="stateless" />
            <ServerNode type="client" label="App Server 2" sublabel="stateless" />
            <ServerNode type="client" label="App Server 3" sublabel="stateless" />
          </div>
          <div className="text-muted-foreground/40 text-xs font-mono">--- network (sub-ms latency) ---</div>
          <div className="flex gap-4 flex-wrap justify-center">
            <ServerNode type="cache" label="Cache Node 1" sublabel="shard A-H" status="healthy" />
            <ServerNode type="cache" label="Cache Node 2" sublabel="shard I-P" status="healthy" />
            <ServerNode type="cache" label="Cache Node 3" sublabel="shard Q-Z" status="healthy" />
          </div>
          <div className="text-muted-foreground/40 text-xs font-mono">--- fallback on miss ---</div>
          <ServerNode type="database" label="PostgreSQL" sublabel="source of truth" />
        </div>
      </ConceptVisualizer>

      <ConceptVisualizer title="Redis Cluster vs Memcached Architecture">
        <p className="text-sm text-muted-foreground mb-4">
          Redis and Memcached take fundamentally different approaches to distributed caching.
          Redis Cluster is a server-side sharding system with built-in replication and failover.
          Memcached nodes are independent — all distribution logic lives in the client library.
        </p>
        <RedisVsMemcachedArch />
      </ConceptVisualizer>

      <BeforeAfter
        before={{
          title: "Memcached",
          content: (
            <ul className="text-sm space-y-1.5 text-muted-foreground">
              <li>Simple key-value, strings only (max 1MB per value)</li>
              <li>Multi-threaded: uses all CPU cores for I/O</li>
              <li>No persistence, no built-in replication</li>
              <li>Client-side sharding via consistent hashing</li>
              <li>Lower memory overhead per key (~50 bytes)</li>
              <li><strong>Best for:</strong> pure caching, simple GET/SET at massive scale</li>
            </ul>
          ),
        }}
        after={{
          title: "Redis",
          content: (
            <ul className="text-sm space-y-1.5 text-muted-foreground">
              <li>Rich data structures: lists, sets, hashes, sorted sets, streams</li>
              <li>Single-threaded commands (I/O threads since Redis 6)</li>
              <li>Persistence (RDB snapshots + AOF log), async replication</li>
              <li>Server-side sharding: 16,384 hash slots across masters</li>
              <li>Higher memory per key (~90 bytes) due to richer metadata</li>
              <li><strong>Best for:</strong> sessions, leaderboards, pub/sub, rate limiting, queues</li>
            </ul>
          ),
        }}
      />

      <ConversationalCallout type="tip">
        If you just need fast key-value caching and nothing else, Memcached can be 10-15% faster
        for simple GET/SET due to its multi-threaded architecture. But most teams default to Redis
        because of its versatility — you start with caching and eventually use it for pub/sub, rate
        limiting, session storage, and sorted-set leaderboards. One system instead of four.
      </ConversationalCallout>

      <ConceptVisualizer title="Consistent Hashing: Why It Matters">
        <p className="text-sm text-muted-foreground mb-4">
          How do you decide which cache node holds which key? Naive modular hashing
          (<code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">hash(key) % N</code>) breaks catastrophically
          when you add or remove a node — almost <em>every</em> key remaps, causing a cache avalanche.
          Consistent hashing maps keys to a ring. When a node changes, only <strong>K/N</strong> keys
          move (where K = total keys, N = nodes).
        </p>
        <ModularVsConsistentViz />
        <ConversationalCallout type="warning">
          With modular hashing and 3 nodes, adding a 4th node remaps ~75% of keys. With consistent
          hashing, only ~25% move. At scale with millions of cached keys, that difference is the gap
          between a graceful expansion and a full cache avalanche that takes down your database.
        </ConversationalCallout>
      </ConceptVisualizer>

      <ConceptVisualizer title="The Hash Ring in Action">
        <p className="text-sm text-muted-foreground mb-4">
          Watch how keys are assigned to nodes on the ring, and what happens when a node fails.
          Each key walks clockwise until it finds the next node — that node owns the key.
          When N2 fails, only its keys rehash to the next node. Everyone else is unaffected.
        </p>
        <ConsistentHashRing />
      </ConceptVisualizer>

      <ConceptVisualizer title="Virtual Nodes for Even Distribution">
        <p className="text-sm text-muted-foreground mb-4">
          With only 3 nodes on a ring, the key distribution can be very uneven — one node might own
          60% of the ring by chance. <strong>Virtual nodes</strong> solve this: each physical node
          gets 100-200 positions on the ring. With 150 virtual nodes per server, distribution
          becomes nearly uniform (within ~5% deviation from ideal).
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg border border-border/30 bg-muted/10 p-3">
            <p className="text-xs font-semibold text-red-400 mb-1">3 nodes, no vnodes</p>
            <div className="flex gap-1">
              {[60, 25, 15].map((pct, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-6 rounded text-[9px] flex items-center justify-center font-bold",
                    i === 0 ? "bg-blue-500/30 text-blue-400" : i === 1 ? "bg-emerald-500/30 text-emerald-400" : "bg-purple-500/30 text-purple-400"
                  )}
                  style={{ width: `${pct}%` }}
                >
                  {pct}%
                </div>
              ))}
            </div>
            <p className="text-[9px] text-red-400 mt-1">Unbalanced: N1 is overloaded</p>
          </div>
          <div className="rounded-lg border border-border/30 bg-muted/10 p-3">
            <p className="text-xs font-semibold text-emerald-400 mb-1">3 nodes, 150 vnodes each</p>
            <div className="flex gap-1">
              {[34, 33, 33].map((pct, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-6 rounded text-[9px] flex items-center justify-center font-bold",
                    i === 0 ? "bg-blue-500/30 text-blue-400" : i === 1 ? "bg-emerald-500/30 text-emerald-400" : "bg-purple-500/30 text-purple-400"
                  )}
                  style={{ width: `${pct}%` }}
                >
                  {pct}%
                </div>
              ))}
            </div>
            <p className="text-[9px] text-emerald-400 mt-1">Balanced: even load distribution</p>
          </div>
        </div>
        <AhaMoment
          question="If Redis Cluster uses hash slots instead of consistent hashing, why learn consistent hashing?"
          answer={
            <p>
              Redis Cluster divides its keyspace into 16,384 fixed hash slots (CRC16 mod 16384) rather
              than using a ring. But Memcached, DynamoDB, Cassandra, and most CDNs use consistent hashing.
              The concepts overlap — both minimize data movement when nodes change. Understanding consistent
              hashing is essential for system design interviews even if Redis does not use it directly.
            </p>
          }
        />
      </ConceptVisualizer>

      <ConceptVisualizer title="What Happens When a Node Fails">
        <p className="text-sm text-muted-foreground mb-4">
          In Redis Cluster, nodes monitor each other via a gossip protocol. When a master fails, the
          cluster detects it, agrees on the failure, and promotes a replica — all automatically. The
          entire process takes about 30-35 seconds by default (configurable with <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">cluster-node-timeout</code>).
        </p>
        <NodeFailureTimeline />
      </ConceptVisualizer>

      <CorrectApproach title="Designing for Cache Failures">
        <p className="text-sm text-muted-foreground mb-4">
          A healthy distributed cache handles failures gracefully. But you should always assume the
          cache can disappear entirely. The database is the source of truth — the cache is an
          optimization, never the only path to data.
        </p>
        <div className="space-y-2">
          {[
            { label: "Replicate", desc: "Each master node has at least one replica. Replicas auto-promote on failure." },
            { label: "Degrade gracefully", desc: "If the cache is fully down, the app falls back to the database with elevated latency, not errors." },
            { label: "Circuit break", desc: "If cache latency spikes, stop trying it and go direct to DB. Re-enable when cache recovers." },
            { label: "Pre-warm", desc: "After a cold start or failover, proactively fill the cache with hot keys to avoid a thundering herd." },
          ].map((item) => (
            <div key={item.label} className="flex items-start gap-2.5 rounded-lg border border-border/30 bg-muted/10 p-3">
              <span className="text-emerald-400 text-xs font-bold bg-emerald-500/10 rounded-md px-2 py-1 shrink-0">
                {item.label}
              </span>
              <p className="text-[11px] text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </CorrectApproach>

      <InteractiveDemo title="Simulate a Node Failure">
        {({ isPlaying, tick }) => {
          const phase = isPlaying ? tick % 6 : 0;
          const nodes = [
            { id: "N1", keys: 3400, status: phase >= 0 ? "healthy" : "idle" },
            { id: "N2", keys: phase >= 2 ? 0 : 3200, status: phase >= 2 ? "failed" : "healthy" },
            { id: "N3", keys: phase >= 3 ? 3200 + 3200 : 3200, status: "healthy" },
          ];

          const totalHitRate = phase >= 2 && phase < 4 ? 67 : phase >= 4 ? 94 : 98;
          const dbLoad = phase >= 2 && phase < 4 ? 4500 : phase >= 4 ? 600 : 200;

          return (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Press play to watch N2 fail and see how the cluster recovers.
              </p>

              <div className="grid grid-cols-3 gap-3">
                {nodes.map((n) => (
                  <div
                    key={n.id}
                    className={cn(
                      "rounded-lg border p-3 text-center transition-all",
                      n.status === "failed"
                        ? "border-red-500/30 bg-red-500/5"
                        : n.status === "healthy"
                        ? "border-emerald-500/20 bg-emerald-500/5"
                        : "border-border/20 bg-muted/10"
                    )}
                  >
                    <div className={cn(
                      "text-sm font-bold",
                      n.status === "failed" ? "text-red-400 line-through" : "text-foreground"
                    )}>
                      {n.id}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-1">
                      {n.status === "failed" ? "OFFLINE" : `${n.keys.toLocaleString()} keys`}
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className={cn(
                  "rounded-lg border p-2.5 text-center transition-all",
                  totalHitRate < 80 ? "border-red-500/20" : "border-emerald-500/20"
                )}>
                  <div className="text-[10px] text-muted-foreground">Hit Rate</div>
                  <div className={cn(
                    "text-lg font-bold",
                    totalHitRate < 80 ? "text-red-400" : "text-emerald-400"
                  )}>
                    {totalHitRate}%
                  </div>
                </div>
                <div className={cn(
                  "rounded-lg border p-2.5 text-center transition-all",
                  dbLoad > 2000 ? "border-red-500/20" : "border-emerald-500/20"
                )}>
                  <div className="text-[10px] text-muted-foreground">DB Queries/s</div>
                  <div className={cn(
                    "text-lg font-bold",
                    dbLoad > 2000 ? "text-red-400" : "text-emerald-400"
                  )}>
                    {dbLoad.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-muted-foreground font-medium">
                {phase === 0 && "All nodes healthy. 98% cache hit rate."}
                {phase === 1 && "Normal operation..."}
                {phase === 2 && "N2 failed! 3,200 keys lost. DB load spikes."}
                {phase === 3 && "Replica promoted. N3 absorbs N2's keys via consistent hashing."}
                {phase === 4 && "Keys re-warming... hit rate recovering."}
                {phase === 5 && "Cluster fully recovered. Hit rate back to normal."}
              </div>
            </div>
          );
        }}
      </InteractiveDemo>

      <AhaMoment
        question="If the cache is so important, isn't it now a single point of failure?"
        answer={
          <p>
            Yes, and that is why distributed caches use replication, automatic failover, and clustering.
            Redis Sentinel monitors nodes and auto-promotes replicas. Redis Cluster spreads data across
            multiple masters. But the golden rule still applies: <em>your app must handle total cache failure</em>.
            The cache is an optimization layer. If it vanishes, responses should be slower, not broken.
            The database is always the source of truth.
          </p>
        }
      />

      <ConversationalCallout type="tip">
        In system design interviews, after saying &quot;I would use Redis,&quot; follow up with specifics:
        &quot;Redis Cluster with 3 masters and 3 replicas, hash-slot sharding, automatic failover via
        Sentinel, and cache-aside with the app gracefully falling back to the database on cache miss.&quot;
        That level of detail separates junior from senior answers.
      </ConversationalCallout>

      <KeyTakeaway
        points={[
          "In-memory caches die with the process. External distributed caches (Redis, Memcached) survive restarts and are shared across all app servers.",
          "Redis Cluster uses 16,384 hash slots (CRC16 mod 16384) with server-side sharding, built-in replication, and automatic failover via gossip protocol.",
          "Memcached uses client-side consistent hashing. Nodes are independent with no replication. Simpler but less resilient.",
          "Consistent hashing minimizes key redistribution when nodes change: only K/N keys move vs nearly all keys with modular hashing.",
          "Virtual nodes (100-200 per server) fix uneven distribution on the hash ring, achieving within ~5% of ideal balance.",
          "Always design your app to survive total cache failure. The cache is an optimization, never the only path to data. Fall back to the database, do not return errors.",
        ]}
      />
    </div>
  );
}
