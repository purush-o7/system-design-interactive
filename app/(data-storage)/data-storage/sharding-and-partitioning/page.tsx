"use client";

import { useState, useEffect } from "react";
import { TopicHero } from "@/components/topic-hero";
import { FailureScenario } from "@/components/failure-scenario";
import { WhyItBreaks } from "@/components/why-it-breaks";
import { ConceptVisualizer } from "@/components/concept-visualizer";
import { CorrectApproach } from "@/components/correct-approach";
import { KeyTakeaway } from "@/components/key-takeaway";
import { BeforeAfter } from "@/components/before-after";
import { ServerNode } from "@/components/server-node";
import { ConversationalCallout } from "@/components/conversational-callout";
import { AhaMoment } from "@/components/aha-moment";
import { InteractiveDemo } from "@/components/interactive-demo";
import { MetricCounter } from "@/components/metric-counter";
import { cn } from "@/lib/utils";
import { Hash, ArrowRight, AlertTriangle, Shuffle } from "lucide-react";

function ConsistentHashRingViz() {
  const [step, setStep] = useState(0);
  const [showVnodes, setShowVnodes] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % 12), 1000);
    return () => clearInterval(t);
  }, []);

  const ringRadius = 100;
  const centerX = 140;
  const centerY = 120;

  const nodes = showVnodes
    ? [
        { id: "A1", label: "A", angle: 30, color: "#3b82f6" },
        { id: "A2", label: "A", angle: 150, color: "#3b82f6" },
        { id: "A3", label: "A", angle: 280, color: "#3b82f6" },
        { id: "B1", label: "B", angle: 90, color: "#22c55e" },
        { id: "B2", label: "B", angle: 210, color: "#22c55e" },
        { id: "B3", label: "B", angle: 330, color: "#22c55e" },
        { id: "C1", label: "C", angle: 60, color: "#eab308" },
        { id: "C2", label: "C", angle: 180, color: "#eab308" },
        { id: "C3", label: "C", angle: 300, color: "#eab308" },
      ]
    : [
        { id: "A", label: "A", angle: 45, color: "#3b82f6" },
        { id: "B", label: "B", angle: 165, color: "#22c55e" },
        { id: "C", label: "C", angle: 285, color: "#eab308" },
      ];

  const dataKeys = [
    { key: "user_42", angle: 20, step: 1 },
    { key: "user_99", angle: 110, step: 3 },
    { key: "user_7", angle: 200, step: 5 },
    { key: "user_55", angle: 250, step: 7 },
    { key: "user_31", angle: 340, step: 9 },
  ];

  const getPos = (angle: number, r: number = ringRadius) => ({
    x: centerX + r * Math.cos((angle - 90) * Math.PI / 180),
    y: centerY + r * Math.sin((angle - 90) * Math.PI / 180),
  });

  const findTargetNode = (keyAngle: number) => {
    const sortedNodes = [...nodes].sort((a, b) => a.angle - b.angle);
    for (const node of sortedNodes) {
      if (node.angle >= keyAngle) return node;
    }
    return sortedNodes[0];
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2 justify-center">
        <button
          onClick={() => setShowVnodes(false)}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
            !showVnodes
              ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
              : "bg-muted/20 border-border/50 text-muted-foreground hover:text-foreground"
          )}
        >
          3 Physical Nodes
        </button>
        <button
          onClick={() => setShowVnodes(true)}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
            showVnodes
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-muted/20 border-border/50 text-muted-foreground hover:text-foreground"
          )}
        >
          3 Nodes + Virtual Nodes
        </button>
      </div>

      <div className="flex justify-center">
        <svg viewBox="0 0 280 240" className="w-full max-w-sm">
          {/* Ring */}
          <circle cx={centerX} cy={centerY} r={ringRadius} fill="none" stroke="currentColor" strokeWidth="1" opacity={0.15} />

          {/* Hash space labels */}
          <text x={centerX} y={centerY - ringRadius - 8} textAnchor="middle" fill="currentColor" fontSize="8" opacity={0.3}>0</text>
          <text x={centerX + ringRadius + 8} y={centerY + 3} textAnchor="start" fill="currentColor" fontSize="8" opacity={0.3}>2^32/4</text>
          <text x={centerX} y={centerY + ringRadius + 14} textAnchor="middle" fill="currentColor" fontSize="8" opacity={0.3}>2^32/2</text>
          <text x={centerX - ringRadius - 8} y={centerY + 3} textAnchor="end" fill="currentColor" fontSize="8" opacity={0.3}>3/4</text>

          {/* Server nodes on ring */}
          {nodes.map((node) => {
            const pos = getPos(node.angle);
            return (
              <g key={node.id}>
                <circle cx={pos.x} cy={pos.y} r={showVnodes ? 8 : 12} fill={node.color} opacity={0.2} />
                <circle cx={pos.x} cy={pos.y} r={showVnodes ? 5 : 8} fill={node.color} opacity={0.8} />
                <text x={pos.x} y={pos.y + (showVnodes ? 2 : 3)} textAnchor="middle" fill="white" fontSize={showVnodes ? "7" : "9"} fontWeight="bold">
                  {node.label}
                </text>
              </g>
            );
          })}

          {/* Data keys being routed */}
          {dataKeys.map((dk) => {
            const keyPos = getPos(dk.angle, ringRadius + 25);
            const target = findTargetNode(dk.angle);
            const targetPos = getPos(target.angle);
            const isActive = step >= dk.step && step < dk.step + 2;
            const isDone = step >= dk.step + 2;

            return (
              <g key={dk.key} opacity={isActive ? 1 : isDone ? 0.6 : 0.2}>
                {/* Key label */}
                <text x={keyPos.x} y={keyPos.y} textAnchor="middle" fill="currentColor" fontSize="7" fontFamily="monospace">
                  {dk.key}
                </text>
                {/* Arrow from key to target node */}
                {(isActive || isDone) && (
                  <line
                    x1={keyPos.x}
                    y1={keyPos.y + 3}
                    x2={targetPos.x}
                    y2={targetPos.y}
                    stroke={target.color}
                    strokeWidth="1"
                    strokeDasharray={isActive ? "3,3" : "0"}
                    opacity={0.5}
                  />
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="text-center">
        <p className="text-[10px] text-muted-foreground">
          {showVnodes
            ? "With virtual nodes (vnodes), each physical server owns multiple positions on the ring. Data distributes more evenly across servers."
            : "Each key is hashed to a position on the ring, then assigned to the first server found clockwise."}
        </p>
      </div>
    </div>
  );
}

function ShardRoutingViz() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % 10), 800);
    return () => clearInterval(t);
  }, []);

  const requests = [
    { user: "user_42", hash: "42 % 4 = 2", shard: 2 },
    { user: "user_99", hash: "99 % 4 = 3", shard: 3 },
    { user: "user_7", hash: "7 % 4 = 3", shard: 3 },
    { user: "user_56", hash: "56 % 4 = 0", shard: 0 },
    { user: "user_21", hash: "21 % 4 = 1", shard: 1 },
  ];

  const shardColors = [
    "text-blue-400 bg-blue-500/10 border-blue-500/20",
    "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    "text-amber-400 bg-amber-500/10 border-amber-500/20",
    "text-violet-400 bg-violet-500/10 border-violet-500/20",
  ];

  const activeReq = Math.floor(step / 2);
  const phase = step % 2;

  return (
    <div className="space-y-4">
      {/* Request queue */}
      <div className="flex items-center gap-2 justify-center flex-wrap">
        {requests.map((req, i) => (
          <div
            key={req.user}
            className={cn(
              "rounded-md border px-2.5 py-1.5 text-[10px] font-mono transition-all duration-300",
              i === activeReq && phase === 0
                ? "bg-blue-500/10 border-blue-500/30 text-blue-400 ring-1 ring-blue-500/20"
                : i < activeReq
                ? "bg-muted/10 border-border/20 text-muted-foreground/30"
                : "bg-muted/20 border-border/50 text-muted-foreground"
            )}
          >
            {req.user}
          </div>
        ))}
      </div>

      {/* Hash function */}
      {activeReq < requests.length && (
        <div className="flex items-center justify-center gap-2">
          <Hash className={cn(
            "size-4 transition-all",
            phase === 0 ? "text-blue-400 animate-pulse" : "text-muted-foreground/30"
          )} />
          <span className={cn(
            "text-xs font-mono transition-all",
            phase >= 0 ? "text-foreground" : "text-muted-foreground/30"
          )}>
            hash({requests[activeReq].user}) → {requests[activeReq].hash}
          </span>
          <ArrowRight className={cn(
            "size-3.5 transition-all",
            phase >= 1 ? "text-emerald-400" : "text-muted-foreground/30"
          )} />
        </div>
      )}

      {/* Shards */}
      <div className="grid grid-cols-4 gap-2">
        {[0, 1, 2, 3].map((shardId) => {
          const assignedRequests = requests
            .slice(0, activeReq + (phase >= 1 ? 1 : 0))
            .filter((r) => r.shard === shardId);

          return (
            <div
              key={shardId}
              className={cn(
                "rounded-lg border p-2 text-center transition-all duration-300",
                activeReq < requests.length && phase >= 1 && requests[activeReq].shard === shardId
                  ? `ring-1 ${shardColors[shardId]}`
                  : "bg-muted/20 border-border/50"
              )}
            >
              <p className="text-[9px] font-medium text-muted-foreground mb-1">Shard {shardId}</p>
              <div className="space-y-0.5">
                {assignedRequests.map((r) => (
                  <p key={r.user} className="text-[8px] font-mono text-muted-foreground">{r.user}</p>
                ))}
                {assignedRequests.length === 0 && (
                  <p className="text-[8px] text-muted-foreground/30">empty</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function HotspotViz() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % 8), 1000);
    return () => clearInterval(t);
  }, []);

  const shardsByCountry = [
    { label: "US", load: 62, status: "unhealthy" as const, requests: "620K/s" },
    { label: "EU", load: 25, status: "warning" as const, requests: "250K/s" },
    { label: "APAC", load: 10, status: "healthy" as const, requests: "100K/s" },
    { label: "Other", load: 3, status: "idle" as const, requests: "30K/s" },
  ];

  const shardsByUserId = [
    { label: "Shard 0", load: 26, status: "healthy" as const, requests: "260K/s" },
    { label: "Shard 1", load: 24, status: "healthy" as const, requests: "240K/s" },
    { label: "Shard 2", load: 25, status: "healthy" as const, requests: "250K/s" },
    { label: "Shard 3", load: 25, status: "healthy" as const, requests: "250K/s" },
  ];

  const showBad = step < 4;
  const shards = showBad ? shardsByCountry : shardsByUserId;

  return (
    <div className="space-y-3">
      <div className="flex gap-2 justify-center">
        <span className={cn(
          "text-xs px-3 py-1 rounded-lg border transition-all",
          showBad ? "bg-red-500/10 border-red-500/30 text-red-400" : "bg-muted/20 border-border/50 text-muted-foreground/40"
        )}>
          <AlertTriangle className="size-3 inline mr-1" />
          Shard by Country
        </span>
        <span className={cn(
          "text-xs px-3 py-1 rounded-lg border transition-all",
          !showBad ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-muted/20 border-border/50 text-muted-foreground/40"
        )}>
          <Shuffle className="size-3 inline mr-1" />
          Shard by user_id (hash)
        </span>
      </div>

      <div className="space-y-1.5">
        {shards.map((shard) => (
          <div key={shard.label} className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-muted-foreground w-16 text-right">{shard.label}</span>
            <div className="flex-1 flex items-center gap-2">
              <div
                className={cn(
                  "h-7 rounded-md flex items-center px-3 text-[10px] font-medium transition-all duration-500 border",
                  shard.status === "unhealthy"
                    ? "bg-red-500/15 border-red-500/30 text-red-400"
                    : shard.status === "warning"
                    ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                    : shard.status === "healthy"
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    : "bg-muted/20 border-border/50 text-muted-foreground/40"
                )}
                style={{ width: `${Math.max(shard.load, 5)}%` }}
              >
                {shard.load}%
              </div>
              <span className="text-[9px] font-mono text-muted-foreground">{shard.requests}</span>
            </div>
          </div>
        ))}
      </div>

      <p className={cn(
        "text-[10px] text-center font-medium transition-all",
        showBad ? "text-red-400" : "text-emerald-400"
      )}>
        {showBad
          ? "Hotspot: US shard handles 62% of all traffic. Overwhelmed."
          : "Even distribution: each shard handles ~25%. Balanced."}
      </p>
    </div>
  );
}

function RebalancingViz() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setPhase((s) => (s + 1) % 6), 1500);
    return () => clearInterval(t);
  }, []);

  const scenarios = [
    {
      label: "3 shards (before)",
      shards: [
        { name: "S0", size: 333, items: 8 },
        { name: "S1", size: 333, items: 8 },
        { name: "S2", size: 334, items: 8 },
      ],
      note: "Data evenly distributed across 3 shards.",
    },
    {
      label: "Adding Shard 3 (naive hash)",
      shards: [
        { name: "S0", size: 250, items: 6 },
        { name: "S1", size: 250, items: 6 },
        { name: "S2", size: 250, items: 6 },
        { name: "S3", size: 250, items: 6 },
      ],
      note: "Naive rehashing: ~75% of keys must move. Massive data migration.",
    },
    {
      label: "Adding Shard 3 (consistent hashing)",
      shards: [
        { name: "S0", size: 280, items: 7 },
        { name: "S1", size: 333, items: 8 },
        { name: "S2", size: 280, items: 7 },
        { name: "S3", size: 107, items: 2 },
      ],
      note: "Consistent hashing: only ~25% of keys move (1/N). Minimal disruption.",
    },
  ];

  const currentScenario = scenarios[phase % 3];

  return (
    <div className="space-y-3">
      <div className="flex gap-2 justify-center">
        {scenarios.map((s, i) => (
          <span
            key={s.label}
            className={cn(
              "text-[9px] px-2 py-1 rounded border transition-all",
              phase % 3 === i
                ? i === 1 ? "bg-red-500/10 border-red-500/30 text-red-400"
                  : i === 2 ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : "bg-blue-500/10 border-blue-500/30 text-blue-400"
                : "bg-muted/10 border-border/30 text-muted-foreground/40"
            )}
          >
            {s.label}
          </span>
        ))}
      </div>

      <div className="flex items-end justify-center gap-2">
        {currentScenario.shards.map((shard) => (
          <div key={shard.name} className="flex flex-col items-center gap-1">
            <div
              className={cn(
                "w-14 rounded-t-md border-x border-t transition-all duration-500",
                phase % 3 === 1 ? "bg-amber-500/10 border-amber-500/20" : "bg-blue-500/10 border-blue-500/20"
              )}
              style={{ height: `${shard.size / 5}px` }}
            >
              <div className="flex flex-col items-center justify-end h-full pb-1">
                <span className="text-[8px] font-mono text-muted-foreground">{shard.items} keys</span>
              </div>
            </div>
            <span className="text-[9px] font-mono font-medium">{shard.name}</span>
          </div>
        ))}
      </div>

      <p className={cn(
        "text-[10px] text-center transition-all",
        phase % 3 === 1 ? "text-red-400" : phase % 3 === 2 ? "text-emerald-400" : "text-muted-foreground"
      )}>
        {currentScenario.note}
      </p>
    </div>
  );
}

export default function ShardingAndPartitioningPage() {
  return (
    <div className="space-y-8">
      <TopicHero
        title="Sharding & Partitioning"
        subtitle="Your database hit 1TB and everything ground to a halt. Time to split it up — but choose the wrong key and you'll create a hotspot worse than the original problem."
        difficulty="advanced"
      />

      <FailureScenario title="1TB in a single database — the breaking point">
        <p className="text-sm text-muted-foreground">
          Your social media platform has grown to 1TB of data in a single PostgreSQL instance.
          Queries that used to take 5ms now take 5 seconds. Adding indexes does not help because
          the B+tree itself is enormous. Backups take 8 hours. A single ALTER TABLE locks the
          database for 45 minutes. Your users experience timeouts during peak hours, and vertical
          scaling has hit its ceiling &mdash; you are already running on the largest available
          instance with 64 vCPUs and 512GB RAM.
        </p>
        <div className="flex items-center justify-center gap-3 py-2 flex-wrap">
          <ServerNode type="database" label="Single DB" sublabel="1TB, 64 vCPU" status="unhealthy" />
        </div>
        <div className="grid grid-cols-4 gap-2 pt-2">
          <MetricCounter label="Query Latency" value={5000} unit="ms" trend="up" />
          <MetricCounter label="Backup Time" value={8} unit="hrs" trend="up" />
          <MetricCounter label="Migration Lock" value={45} unit="min" trend="up" />
          <MetricCounter label="CPU Usage" value={98} unit="%" trend="up" />
        </div>
      </FailureScenario>

      <WhyItBreaks title="One machine has hard physical limits">
        <p className="text-sm text-muted-foreground">
          A single database server has hard physical limits: disk I/O throughput, memory for caching,
          and CPU for query processing. When your data exceeds what one machine can efficiently handle,
          no amount of indexing or query optimization will save you. The data itself needs to be
          <strong className="text-foreground"> split across multiple machines</strong>.
        </p>
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="rounded-lg bg-muted/30 p-3 space-y-1">
            <p className="text-xs font-semibold">Partitioning</p>
            <p className="text-[11px] text-muted-foreground">
              Splits a table into smaller pieces on the <strong className="text-foreground">same server</strong>.
              PostgreSQL supports range, list, and hash partitioning natively. Good for managing large
              tables (e.g., orders by month) without the complexity of distributed systems.
            </p>
          </div>
          <div className="rounded-lg bg-muted/30 p-3 space-y-1">
            <p className="text-xs font-semibold">Sharding</p>
            <p className="text-[11px] text-muted-foreground">
              Splits data across <strong className="text-foreground">multiple servers</strong>.
              Each shard is an independent database holding a subset of the data. Requires a routing
              layer to direct queries to the correct shard. Much more complex, but breaks the
              single-machine ceiling.
            </p>
          </div>
        </div>
      </WhyItBreaks>

      <ConceptVisualizer title="Shard Routing — Watch Data Flow to Shards">
        <p className="text-sm text-muted-foreground mb-4">
          In hash-based sharding, each request&apos;s shard key is hashed to determine which shard
          receives the data. Watch as user IDs are hashed and routed to their assigned shards.
          The hash function ensures even distribution &mdash; but range queries now require
          hitting all shards.
        </p>
        <ShardRoutingViz />
      </ConceptVisualizer>

      <ConceptVisualizer title="Consistent Hashing — The Hash Ring">
        <p className="text-sm text-muted-foreground mb-4">
          When you add or remove a shard with naive hashing (<code className="text-xs bg-muted px-1 rounded font-mono">key % N</code>),
          almost every key remaps to a different shard. Consistent hashing solves this by placing
          both servers and keys on a ring. When a server is added, only its neighbors&apos; keys
          are affected. Toggle virtual nodes to see how they improve distribution.
        </p>
        <ConsistentHashRingViz />
        <ConversationalCallout type="tip">
          Without virtual nodes, 3 servers might get 60/25/15% of the keys. With 150 virtual
          nodes per server, the distribution becomes nearly perfect. This is why Cassandra,
          DynamoDB, and Riak all use virtual nodes in their consistent hashing implementation.
        </ConversationalCallout>
      </ConceptVisualizer>

      <ConceptVisualizer title="The Hotspot Problem — Animated">
        <p className="text-sm text-muted-foreground mb-4">
          Choosing the wrong shard key creates hotspots where one shard is overwhelmed while
          others sit idle. Watch the difference between sharding by country (uneven) versus
          sharding by hashed user_id (balanced).
        </p>
        <HotspotViz />
      </ConceptVisualizer>

      <ConceptVisualizer title="Rebalancing: Naive vs Consistent Hashing">
        <p className="text-sm text-muted-foreground mb-4">
          What happens when you add a fourth shard? With naive hash-mod, nearly 75% of keys
          must migrate. With consistent hashing, only about 25% (1/N) of keys need to move.
          This difference is critical at scale &mdash; migrating terabytes of data takes hours
          and saturates your network.
        </p>
        <RebalancingViz />
      </ConceptVisualizer>

      <BeforeAfter
        before={{
          title: "Single Database (1TB)",
          content: (
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex justify-center">
                <ServerNode type="database" label="Single DB" sublabel="1TB" status="unhealthy" />
              </div>
              <ul className="space-y-1 text-xs">
                <li>Query latency: 5,000ms at peak</li>
                <li>Backup time: 8 hours</li>
                <li>Schema migrations: 45-minute lock</li>
                <li>Max connections: saturated</li>
                <li>Single point of failure</li>
              </ul>
            </div>
          ),
        }}
        after={{
          title: "Sharded (4 x 250GB)",
          content: (
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex justify-center gap-2 flex-wrap">
                <ServerNode type="database" label="Shard 0" sublabel="250GB" status="healthy" />
                <ServerNode type="database" label="Shard 1" sublabel="250GB" status="healthy" />
                <ServerNode type="database" label="Shard 2" sublabel="250GB" status="healthy" />
                <ServerNode type="database" label="Shard 3" sublabel="250GB" status="healthy" />
              </div>
              <ul className="space-y-1 text-xs">
                <li>Query latency: 50ms (queries hit one shard)</li>
                <li>Backup time: 2 hours per shard (parallel)</li>
                <li>Schema migrations: rolling, no downtime</li>
                <li>4x connection capacity</li>
              </ul>
            </div>
          ),
        }}
      />

      <InteractiveDemo title="Cross-Shard Query Simulator">
        {({ isPlaying, tick }) => {
          const phase = isPlaying ? tick % 6 : 0;
          return (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Press play to see how a cross-shard query (scatter-gather) works when you need data
                from multiple shards.
              </p>
              <div className="flex flex-col items-center gap-3">
                <div className={cn(
                  "rounded-lg border px-4 py-2 transition-all duration-300",
                  phase >= 1 ? "bg-blue-500/10 border-blue-500/30" : "bg-muted/20 border-border/50"
                )}>
                  <p className="text-[10px] font-mono text-muted-foreground">
                    {phase >= 1 ? "SELECT COUNT(*) FROM orders GROUP BY status" : "Waiting..."}
                  </p>
                </div>

                <ServerNode type="loadbalancer" label="Coordinator" sublabel={
                  phase >= 2 ? "Scatter to all shards" : phase >= 1 ? "Parse query" : "Idle"
                } status={phase >= 1 ? "healthy" : "idle"} />

                <div className="flex gap-2 flex-wrap justify-center">
                  {[0, 1, 2, 3].map((s) => (
                    <ServerNode
                      key={s}
                      type="database"
                      label={`Shard ${s}`}
                      sublabel={
                        phase >= 4 ? "Done" : phase >= 3 ? "Scanning..." : phase >= 2 ? "Received" : "Idle"
                      }
                      status={
                        phase >= 4 ? "healthy" : phase >= 2 ? "warning" : "idle"
                      }
                    />
                  ))}
                </div>

                {phase >= 5 && (
                  <div className="rounded-lg border bg-emerald-500/10 border-emerald-500/20 p-3 text-center">
                    <p className="text-[10px] font-mono text-emerald-400">
                      Results merged: 4 partial results → 1 final result
                    </p>
                    <p className="text-[9px] text-muted-foreground mt-1">
                      Total time: max(shard latencies) + merge overhead
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        }}
      </InteractiveDemo>

      <CorrectApproach title="Choosing a Shard Key">
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>
            The shard key determines everything. A good shard key has <strong className="text-foreground">high cardinality</strong> (many
            distinct values), <strong className="text-foreground">even distribution</strong>, and
            <strong className="text-foreground"> aligns with your most common query patterns</strong>.
          </p>
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
                  <td className="py-2">Tenant queries stay on one shard; timestamps create write hotspots on latest shard</td>
                </tr>
                <tr className="border-b border-muted">
                  <td className="py-2 pr-4 text-foreground">Social media</td>
                  <td className="py-2 pr-4 text-emerald-400 font-mono">user_id</td>
                  <td className="py-2 pr-4 text-red-400 font-mono">post_date</td>
                  <td className="py-2">User profiles and posts co-located; date-based = all new writes hit one shard</td>
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
                  <td className="py-2">Low cardinality (only 5 types); device IDs have millions of distinct values</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </CorrectApproach>

      <ConversationalCallout type="warning">
        <strong>Cross-shard queries are expensive.</strong> A scatter-gather query fans out to all shards,
        waits for all responses, then merges results. If you have 100 shards, that is 100 network
        round trips. Design your data model so the most common queries hit a single shard. If you
        frequently need to JOIN data across shard boundaries, your shard key is wrong.
      </ConversationalCallout>

      <AhaMoment
        question="When should you NOT shard?"
        answer={
          <p>
            Sharding adds enormous operational complexity: cross-shard joins, distributed transactions,
            rebalancing when adding shards, application-level routing logic, and operational burden of
            managing multiple database instances. Before sharding, exhaust these options first:
            (1) optimize queries and add indexes, (2) add read replicas for read-heavy workloads,
            (3) use table partitioning (same server, no routing), (4) archive cold data to cheaper
            storage, (5) vertically scale to a bigger machine. Shard only when you have genuinely
            exhausted these options and a single machine cannot handle your data volume or write throughput.
          </p>
        }
      />

      <AhaMoment
        question="How does DynamoDB handle sharding automatically?"
        answer={
          <p>
            DynamoDB uses consistent hashing with automatic partition management. You choose a partition
            key, and DynamoDB hashes it to assign data to internal partitions. As a partition grows
            beyond 10GB or exceeds its throughput allocation, DynamoDB automatically splits it &mdash;
            no manual intervention needed. The trade-off is that you must design your partition key
            carefully upfront, because DynamoDB does not support cross-partition joins or queries that
            do not include the partition key. This is why DynamoDB requires you to know your access
            patterns before you write a single row.
          </p>
        }
      />

      <KeyTakeaway
        points={[
          "Partitioning splits data within one server; sharding splits it across multiple servers. Shard when a single machine can't handle your data volume or write throughput.",
          "Hash-based sharding distributes data evenly but makes range queries expensive (scatter-gather). Range-based sharding preserves ordering but risks hotspots.",
          "Consistent hashing minimizes key redistribution when adding/removing servers — only ~1/N keys move instead of rehashing everything.",
          "Virtual nodes (vnodes) improve consistent hashing distribution — Cassandra and DynamoDB both use them to prevent structural imbalance.",
          "The shard key determines everything — pick one with high cardinality, even distribution, and alignment with your most common query patterns.",
          "Sharding is a last resort. Exhaust indexing, read replicas, partitioning, archiving, and vertical scaling first.",
        ]}
      />
    </div>
  );
}
