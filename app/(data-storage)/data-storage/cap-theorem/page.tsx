"use client";

import { useState, useEffect } from "react";
import { TopicHero } from "@/components/topic-hero";
import { FailureScenario } from "@/components/failure-scenario";
import { WhyItBreaks } from "@/components/why-it-breaks";
import { ConceptVisualizer } from "@/components/concept-visualizer";
import { CorrectApproach } from "@/components/correct-approach";
import { KeyTakeaway } from "@/components/key-takeaway";
import { InteractiveDemo } from "@/components/interactive-demo";
import { ConversationalCallout } from "@/components/conversational-callout";
import { AhaMoment } from "@/components/aha-moment";
import { ServerNode } from "@/components/server-node";
import { BeforeAfter } from "@/components/before-after";
import { cn } from "@/lib/utils";

function CAPTriangle() {
  const [selected, setSelected] = useState<"CP" | "AP" | "CA" | null>(null);

  const descriptions = {
    CP: {
      title: "Consistent + Partition-Tolerant (CP)",
      desc: "During a partition, the system refuses to serve requests rather than return stale data. Reads always return the latest write or an error. Users may see downtime, but they will never see wrong data.",
      examples: "MongoDB, HBase, Redis Cluster, ZooKeeper, etcd, CockroachDB, Google Spanner",
      color: "#3b82f6",
    },
    AP: {
      title: "Available + Partition-Tolerant (AP)",
      desc: "During a partition, the system continues serving requests but may return stale data. Every request gets a response, even if it is not the latest. Conflicts are resolved after the partition heals.",
      examples: "Cassandra, DynamoDB, CouchDB, Riak, Voldemort",
      color: "#22c55e",
    },
    CA: {
      title: "Consistent + Available (CA)",
      desc: "Only possible when there are no network partitions — effectively a single-node system. In a distributed system, partitions are inevitable, so CA is theoretical. This is why the real choice is always CP vs AP.",
      examples: "Single-node PostgreSQL, Single-node MySQL (not distributed)",
      color: "#eab308",
    },
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <svg viewBox="0 0 300 280" className="w-full max-w-sm">
          <polygon
            points="150,20 30,260 270,260"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            opacity={0.2}
          />

          {/* CP edge */}
          <g className="cursor-pointer" onClick={() => setSelected("CP")} opacity={selected === "CP" ? 1 : 0.6}>
            <line x1="150" y1="20" x2="270" y2="260" stroke={selected === "CP" ? "#3b82f6" : "currentColor"} strokeWidth={selected === "CP" ? 3 : 2} />
            <text x="220" y="130" fill={selected === "CP" ? "#3b82f6" : "currentColor"} fontSize="14" fontWeight="bold">CP</text>
          </g>

          {/* AP edge */}
          <g className="cursor-pointer" onClick={() => setSelected("AP")} opacity={selected === "AP" ? 1 : 0.6}>
            <line x1="30" y1="260" x2="270" y2="260" stroke={selected === "AP" ? "#22c55e" : "currentColor"} strokeWidth={selected === "AP" ? 3 : 2} />
            <text x="140" y="278" fill={selected === "AP" ? "#22c55e" : "currentColor"} fontSize="14" fontWeight="bold">AP</text>
          </g>

          {/* CA edge */}
          <g className="cursor-pointer" onClick={() => setSelected("CA")} opacity={selected === "CA" ? 1 : 0.6}>
            <line x1="150" y1="20" x2="30" y2="260" stroke={selected === "CA" ? "#eab308" : "currentColor"} strokeWidth={selected === "CA" ? 3 : 2} />
            <text x="70" y="130" fill={selected === "CA" ? "#eab308" : "currentColor"} fontSize="14" fontWeight="bold">CA</text>
          </g>

          {/* Vertices */}
          <circle cx="150" cy="20" r="6" fill="currentColor" />
          <text x="150" y="12" textAnchor="middle" fill="currentColor" fontSize="13" fontWeight="bold">Consistency</text>

          <circle cx="30" cy="260" r="6" fill="currentColor" />
          <text x="30" y="278" textAnchor="middle" fill="currentColor" fontSize="13" fontWeight="bold">Availability</text>

          <circle cx="270" cy="260" r="6" fill="currentColor" />
          <text x="270" y="278" textAnchor="middle" fill="currentColor" fontSize="13" fontWeight="bold">Partition Tolerance</text>
        </svg>
      </div>
      {selected && (
        <div className={cn("rounded-lg border p-4 space-y-2 transition-all")} style={{ borderColor: `${descriptions[selected].color}30`, backgroundColor: `${descriptions[selected].color}08` }}>
          <h4 className="font-semibold text-sm">{descriptions[selected].title}</h4>
          <p className="text-xs text-muted-foreground">{descriptions[selected].desc}</p>
          <p className="text-xs"><strong>Examples:</strong> <span className="text-muted-foreground">{descriptions[selected].examples}</span></p>
        </div>
      )}
      {!selected && (
        <p className="text-xs text-muted-foreground text-center">Click an edge of the triangle to explore each trade-off.</p>
      )}
    </div>
  );
}

function PartitionSimulation() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((s) => (s + 1) % 30), 400);
    return () => clearInterval(t);
  }, []);

  const phase = tick < 5 ? "normal" : tick < 20 ? "partitioned" : "healed";
  const isPartitioned = phase === "partitioned";
  const writeCount = isPartitioned ? tick - 5 : 0;

  return (
    <div className="space-y-4">
      {/* Phase indicator */}
      <div className="flex items-center gap-2 justify-center">
        {["normal", "partitioned", "healed"].map((p) => (
          <div
            key={p}
            className={cn(
              "text-[10px] px-2.5 py-1 rounded-full border font-medium transition-all capitalize",
              phase === p
                ? p === "partitioned"
                  ? "bg-red-500/10 border-red-500/30 text-red-400"
                  : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-muted/20 border-border/50 text-muted-foreground/40"
            )}
          >
            {p}
          </div>
        ))}
      </div>

      {/* Nodes */}
      <div className="flex items-center justify-center gap-6 flex-wrap">
        <div className="text-center space-y-2">
          <ServerNode
            type="database"
            label="Node A (US-East)"
            sublabel={`inventory: ${isPartitioned ? 5 - Math.min(writeCount, 3) : phase === "healed" ? 2 : 5}`}
            status={isPartitioned ? "warning" : "healthy"}
          />
          {isPartitioned && (
            <div className="text-[10px] text-emerald-400 font-mono animate-pulse">
              Accepting writes...
            </div>
          )}
        </div>

        <div className="text-center space-y-1">
          <div className="flex flex-col items-center gap-0.5">
            {isPartitioned ? (
              <>
                <div className="text-red-500 text-lg">&#10005;</div>
                <div className="text-[10px] text-red-400 font-mono font-bold">PARTITION</div>
                <div className="w-16 h-px bg-red-500/30" />
              </>
            ) : (
              <>
                <div className="text-emerald-500 text-lg">&#8596;</div>
                <div className="text-[10px] text-muted-foreground">connected</div>
                <div className="w-16 h-px bg-emerald-500/30" />
              </>
            )}
          </div>
        </div>

        <div className="text-center space-y-2">
          <ServerNode
            type="database"
            label="Node B (EU-West)"
            sublabel={`inventory: ${isPartitioned ? 5 : phase === "healed" ? 2 : 5} ${isPartitioned ? "(stale!)" : ""}`}
            status={isPartitioned ? "unhealthy" : "healthy"}
          />
          {isPartitioned && (
            <div className="text-[10px] text-muted-foreground/50 font-mono">
              Cannot reach Node A
            </div>
          )}
        </div>
      </div>

      {/* CP vs AP behavior */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className={cn(
          "rounded-lg border p-3 space-y-1.5 transition-all",
          isPartitioned ? "border-blue-500/30 bg-blue-500/5" : "border-border"
        )}>
          <h4 className="text-sm font-semibold flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-blue-500" />
            CP Response
          </h4>
          <p className="text-xs text-muted-foreground">
            {isPartitioned
              ? "Node B rejects all reads and writes: \"503 Service Unavailable\". Users in EU cannot shop. But no one sees stale inventory. Zero overselling risk."
              : phase === "healed"
              ? "Both nodes sync up. Inventory is correct: 2 units left. No conflicts to resolve."
              : "Both nodes serve consistent data normally. Every read returns the latest write."}
          </p>
        </div>
        <div className={cn(
          "rounded-lg border p-3 space-y-1.5 transition-all",
          isPartitioned ? "border-green-500/30 bg-green-500/5" : "border-border"
        )}>
          <h4 className="text-sm font-semibold flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-green-500" />
            AP Response
          </h4>
          <p className="text-xs text-muted-foreground">
            {isPartitioned
              ? `Node B serves stale data (inventory: 5). EU users keep shopping. Node B accepts ${Math.min(writeCount, 3)} orders it cannot fulfill. Overselling in progress.`
              : phase === "healed"
              ? "Partition heals. Nodes discover conflicting writes. Must resolve: which orders to cancel? Last-write-wins? Manual merge?"
              : "Both nodes serve consistent data normally. Every read returns the latest write."}
          </p>
        </div>
      </div>

      {phase === "healed" && (
        <ConversationalCallout type="warning">
          After a partition heals, AP systems must <strong>reconcile conflicts</strong>. This is not
          free &mdash; conflict resolution logic can be complex (last-write-wins, vector clocks,
          CRDTs, or manual intervention). The cost of availability is paid in reconciliation.
        </ConversationalCallout>
      )}
    </div>
  );
}

function PACELCDiagram() {
  const [selected, setSelected] = useState<string | null>(null);

  const databases = [
    {
      name: "DynamoDB",
      pacelc: "PA/EL",
      partition: "Available",
      normal: "Low latency",
      desc: "Always responds, fast reads. Eventual consistency by default. Optimized for availability and speed at all times.",
      color: "text-green-400",
    },
    {
      name: "Cassandra",
      pacelc: "PA/EL",
      partition: "Available",
      normal: "Low latency",
      desc: "Tunable consistency per query. Default behavior favors availability and speed. Use QUORUM for stronger consistency.",
      color: "text-green-400",
    },
    {
      name: "MongoDB",
      pacelc: "PC/EC",
      partition: "Consistent",
      normal: "Consistent",
      desc: "Blocks writes during primary election. Strong consistency at the cost of latency. Reads from primary by default.",
      color: "text-blue-400",
    },
    {
      name: "Spanner",
      pacelc: "PC/EC",
      partition: "Consistent",
      normal: "Consistent",
      desc: "Google's globally distributed DB. Uses TrueTime (atomic clocks) for external consistency. Latency cost: 10-20ms commits.",
      color: "text-blue-400",
    },
    {
      name: "CockroachDB",
      pacelc: "PC/EC",
      partition: "Consistent",
      normal: "Consistent",
      desc: "Raft consensus. Will not serve stale reads. Blocks if quorum unavailable. Optimized for correctness above all.",
      color: "text-blue-400",
    },
    {
      name: "Cosmos DB",
      pacelc: "Tunable",
      partition: "Tunable",
      normal: "Tunable",
      desc: "Five consistency levels from strong to eventual. You choose the PACELC trade-off per request. Most flexible, most complex.",
      color: "text-purple-400",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {databases.map((db) => (
          <button
            key={db.name}
            onClick={() => setSelected(selected === db.name ? null : db.name)}
            className={cn(
              "p-3 rounded-lg border text-left transition-all",
              selected === db.name
                ? "bg-blue-500/8 border-blue-500/20 ring-1 ring-blue-500/15"
                : "bg-muted/20 border-border/50 hover:bg-muted/40"
            )}
          >
            <p className="text-xs font-semibold">{db.name}</p>
            <p className={cn("text-[10px] font-mono font-bold mt-0.5", db.color)}>{db.pacelc}</p>
          </button>
        ))}
      </div>
      {selected && (() => {
        const db = databases.find((d) => d.name === selected)!;
        return (
          <div className="rounded-lg border bg-muted/20 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-sm">{db.name}</h4>
              <span className={cn("text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-muted/50", db.color)}>
                {db.pacelc}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-xs">
                <span className="text-muted-foreground">During partition: </span>
                <span className="font-medium">{db.partition}</span>
              </div>
              <div className="text-xs">
                <span className="text-muted-foreground">Normal operation: </span>
                <span className="font-medium">{db.normal}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{db.desc}</p>
          </div>
        );
      })()}
      {!selected && (
        <p className="text-xs text-muted-foreground text-center">
          Click a database to see its PACELC classification and behavior.
        </p>
      )}
    </div>
  );
}

function ConsistencySpectrum() {
  const [pos, setPos] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setPos((p) => {
      const next = p + 1;
      return Math.abs(((next * 2) % 200) - 100);
    }), 80);
    return () => clearInterval(t);
  }, []);

  const levels = [
    { name: "Eventual", pct: 10, desc: "Reads may return stale data. Converges eventually.", color: "bg-green-500" },
    { name: "Session", pct: 30, desc: "Read-your-own-writes within a session.", color: "bg-emerald-500" },
    { name: "Bounded Staleness", pct: 50, desc: "Reads lag behind writes by at most K versions or T seconds.", color: "bg-yellow-500" },
    { name: "Strong", pct: 75, desc: "Linearizable. Every read returns the most recent write.", color: "bg-blue-500" },
    { name: "External", pct: 95, desc: "Globally ordered. Even across data centers (Spanner).", color: "bg-purple-500" },
  ];

  return (
    <div className="space-y-3">
      <div className="relative h-3 rounded-full bg-gradient-to-r from-green-500/30 via-yellow-500/30 to-purple-500/30 overflow-hidden">
        <div
          className="absolute top-0 bottom-0 w-1 bg-white rounded-full z-10 transition-all"
          style={{ left: `${pos}%` }}
        />
      </div>
      <div className="flex justify-between text-[9px] font-mono text-muted-foreground">
        <span>Fast + Available</span>
        <span>Slow + Correct</span>
      </div>
      <div className="space-y-1.5">
        {levels.map((l) => (
          <div
            key={l.name}
            className={cn(
              "flex items-center gap-2 px-2 py-1.5 rounded-md transition-all",
              pos >= l.pct - 5 && pos <= l.pct + 5 ? "bg-muted/40" : ""
            )}
          >
            <span className={cn("size-2 rounded-full shrink-0", l.color)} />
            <span className="text-[11px] font-medium w-32 shrink-0">{l.name}</span>
            <span className="text-[10px] text-muted-foreground">{l.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CapTheoremPage() {
  return (
    <div className="space-y-8">
      <TopicHero
        title="CAP Theorem"
        subtitle="When the network splits, your distributed system must make an impossible choice: stay consistent or stay available. You cannot have both. Understanding this constraint is the foundation of every distributed database decision."
        difficulty="advanced"
      />

      <FailureScenario>
        <p className="text-sm text-muted-foreground">
          Your e-commerce platform runs across two data centers. A fiber cut severs the network link
          between them. Both data centers had 5 units of a popular item. Data center A sells 3 units
          (inventory drops to 2). Data center B still shows 5 units from before the partition. Orders pour in on both sides.
          Data center B sells 3 units it does not actually have. When the partition heals, you
          discover you have <strong className="text-foreground">oversold inventory by 3 units</strong>,
          and customers are furious about cancelled orders.
        </p>
        <p className="text-sm text-muted-foreground">
          Your system chose <strong className="text-foreground">availability</strong> (keep serving requests)
          over <strong className="text-foreground">consistency</strong> (accurate inventory). That is
          a valid choice for some data &mdash; but not for inventory with hard constraints.
        </p>
      </FailureScenario>

      <WhyItBreaks>
        <p className="text-sm text-muted-foreground">
          The <strong className="text-foreground">CAP theorem</strong> (proven by Eric Brewer in 2000,
          formally proved by Seth Gilbert and Nancy Lynch in 2002) states that a distributed data
          store can only provide two of three guarantees simultaneously:
        </p>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li><strong className="text-foreground">Consistency (C)</strong> &mdash; Every read receives the most recent write or an error. All nodes see the same data at the same time.</li>
          <li><strong className="text-foreground">Availability (A)</strong> &mdash; Every request receives a response (not an error), without guaranteeing it contains the most recent write.</li>
          <li><strong className="text-foreground">Partition Tolerance (P)</strong> &mdash; The system continues operating despite arbitrary message loss or network failures between nodes.</li>
        </ul>
        <p className="text-sm text-muted-foreground">
          Since network partitions are inevitable in distributed systems (cables get cut, switches
          fail, cloud regions lose connectivity), partition tolerance is not optional. The real
          choice is always between <strong className="text-foreground">CP</strong> and
          <strong className="text-foreground"> AP</strong>.
        </p>
      </WhyItBreaks>

      <ConceptVisualizer title="The CAP Triangle">
        <p className="text-sm text-muted-foreground mb-4">
          Click each edge of the triangle to explore the trade-off it represents. Notice that CP
          and AP are the only practical choices &mdash; CA requires no network partitions, which is
          unrealistic in a distributed system.
        </p>
        <CAPTriangle />
      </ConceptVisualizer>

      <ConceptVisualizer title="Network Partition Simulation">
        <p className="text-sm text-muted-foreground mb-4">
          Watch what happens when a network partition splits your database cluster. The same
          physical event forces fundamentally different behavior depending on whether you chose
          a CP or AP system.
        </p>
        <PartitionSimulation />
      </ConceptVisualizer>

      <ConceptVisualizer title="The Consistency Spectrum">
        <p className="text-sm text-muted-foreground mb-4">
          Consistency is not binary. Real systems offer a spectrum of consistency levels, each
          with different latency and correctness trade-offs. Understanding this spectrum is
          critical for choosing the right database for each use case.
        </p>
        <ConsistencySpectrum />
      </ConceptVisualizer>

      <AhaMoment
        question="Can you be both CP and AP at the same time?"
        answer={
          <p>
            Not during a partition &mdash; that is the theorem&apos;s point. But many systems are
            <strong> tunable</strong>. Cassandra lets you set consistency level per query: use
            <code className="font-mono bg-muted px-1 rounded text-xs"> QUORUM</code> for strong
            consistency on critical writes (CP behavior), and
            <code className="font-mono bg-muted px-1 rounded text-xs"> ONE</code> for fast,
            eventually-consistent reads on non-critical data (AP behavior). The same database
            can behave as CP for your payment table and AP for your activity feed. The trade-off
            is per-operation, not per-system.
          </p>
        }
      />

      <ConceptVisualizer title="PACELC — What CAP Misses">
        <p className="text-sm text-muted-foreground mb-4">
          CAP only describes behavior during partitions. But partitions are rare &mdash; your
          system runs normally 99.99% of the time. <strong>PACELC</strong> extends CAP to cover
          normal operation: &quot;If there is a <strong>P</strong>artition, choose
          <strong> A</strong>vailability or <strong>C</strong>onsistency.
          <strong> E</strong>lse, choose <strong>L</strong>atency or
          <strong> C</strong>onsistency.&quot;
        </p>
        <PACELCDiagram />
        <ConversationalCallout type="tip">
          In practice, the E/L vs E/C choice matters more than the P/A vs P/C choice. Most systems
          never experience a true network partition. But every single request experiences the
          latency-vs-consistency trade-off. DynamoDB is fast because it chose EL. Spanner is correct
          because it chose EC &mdash; and pays 10-20ms per commit for TrueTime synchronization.
        </ConversationalCallout>
      </ConceptVisualizer>

      <CorrectApproach title="Real-World Database CAP/PACELC Classifications">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 pr-4 font-semibold">Database</th>
                <th className="text-left py-2 pr-4 font-semibold">CAP</th>
                <th className="text-left py-2 pr-4 font-semibold">PACELC</th>
                <th className="text-left py-2 font-semibold">Behavior During Partition</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b border-muted">
                <td className="py-2 pr-4 font-medium text-foreground">PostgreSQL (single)</td>
                <td className="py-2 pr-4">CA</td>
                <td className="py-2 pr-4">N/A</td>
                <td className="py-2">Not distributed &mdash; no partition tolerance</td>
              </tr>
              <tr className="border-b border-muted">
                <td className="py-2 pr-4 font-medium text-foreground">MongoDB</td>
                <td className="py-2 pr-4">CP</td>
                <td className="py-2 pr-4">PC/EC</td>
                <td className="py-2">Blocks writes until new primary elected (10-30s)</td>
              </tr>
              <tr className="border-b border-muted">
                <td className="py-2 pr-4 font-medium text-foreground">DynamoDB</td>
                <td className="py-2 pr-4">AP</td>
                <td className="py-2 pr-4">PA/EL</td>
                <td className="py-2">Serves eventually consistent reads; always writable</td>
              </tr>
              <tr className="border-b border-muted">
                <td className="py-2 pr-4 font-medium text-foreground">Cassandra</td>
                <td className="py-2 pr-4">AP (tunable)</td>
                <td className="py-2 pr-4">PA/EL</td>
                <td className="py-2">Configurable consistency level per query</td>
              </tr>
              <tr className="border-b border-muted">
                <td className="py-2 pr-4 font-medium text-foreground">Google Spanner</td>
                <td className="py-2 pr-4">CP</td>
                <td className="py-2 pr-4">PC/EC</td>
                <td className="py-2">TrueTime consensus; blocks if replicas unreachable</td>
              </tr>
              <tr className="border-b border-muted">
                <td className="py-2 pr-4 font-medium text-foreground">CockroachDB</td>
                <td className="py-2 pr-4">CP</td>
                <td className="py-2 pr-4">PC/EC</td>
                <td className="py-2">Raft consensus; blocks if quorum unavailable</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-medium text-foreground">Cosmos DB</td>
                <td className="py-2 pr-4">Tunable</td>
                <td className="py-2 pr-4">Tunable</td>
                <td className="py-2">Five consistency levels; you choose the trade-off</td>
              </tr>
            </tbody>
          </table>
        </div>
      </CorrectApproach>

      <InteractiveDemo title="Choose Your Guarantee">
        {({ isPlaying, tick }) => {
          const scenarios = [
            {
              system: "Banking Transfers",
              choice: "CP",
              reason: "Double-spending is unacceptable. Better to reject a transaction than process it with stale balance.",
              db: "CockroachDB / Spanner",
            },
            {
              system: "Social Media Feed",
              choice: "AP",
              reason: "Showing a post 2 seconds late is fine. A feed that goes down during peak hours is not.",
              db: "DynamoDB / Cassandra",
            },
            {
              system: "Inventory Management",
              choice: "CP",
              reason: "Overselling physical goods costs real money. Block the sale rather than sell what you do not have.",
              db: "MongoDB / CockroachDB",
            },
            {
              system: "User Analytics",
              choice: "AP",
              reason: "Approximate page view counts are acceptable. Analytics dashboards should never go down.",
              db: "Cassandra / DynamoDB",
            },
            {
              system: "Ride-Sharing Dispatch",
              choice: "AP",
              reason: "Users must always see available drivers. Stale location data (seconds old) is better than no data.",
              db: "Cassandra / Redis",
            },
          ];
          const active = isPlaying ? tick % scenarios.length : 0;
          const s = scenarios[active];

          return (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Press play to cycle through real-world systems and see which CAP trade-off they make
                and why.
              </p>
              <div className="flex flex-wrap gap-1.5">
                {scenarios.map((sc, i) => (
                  <div
                    key={sc.system}
                    className={cn(
                      "text-[10px] px-2 py-1 rounded-full border transition-all",
                      i === active
                        ? sc.choice === "CP"
                          ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                          : "bg-green-500/10 border-green-500/30 text-green-400"
                        : "bg-muted/20 border-border/50 text-muted-foreground/40"
                    )}
                  >
                    {sc.system}
                  </div>
                ))}
              </div>
              <div className="rounded-lg border p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold">{s.system}</h4>
                  <span className={cn(
                    "text-[10px] font-mono font-bold px-2 py-0.5 rounded-full",
                    s.choice === "CP"
                      ? "bg-blue-500/20 text-blue-400"
                      : "bg-green-500/20 text-green-400"
                  )}>
                    {s.choice}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{s.reason}</p>
                <p className="text-[10px] text-muted-foreground">
                  <strong>Database choice:</strong> {s.db}
                </p>
              </div>
            </div>
          );
        }}
      </InteractiveDemo>

      <BeforeAfter
        before={{
          title: "Weak interview answer",
          content: (
            <div className="text-sm space-y-2">
              <div className="bg-muted/50 p-2 rounded text-xs font-mono">
                <p>&quot;I will use a CP system.&quot;</p>
                <p className="text-red-400 mt-1">No context. No reasoning.</p>
              </div>
            </div>
          ),
        }}
        after={{
          title: "Strong interview answer",
          content: (
            <div className="text-sm space-y-2">
              <div className="bg-muted/50 p-2 rounded text-xs font-mono">
                <p>&quot;For the payment service, I need CP because serving stale balance data could lead to double-spending. I will use CockroachDB with Raft consensus.&quot;</p>
                <p>&quot;For the activity feed, I will use AP (DynamoDB) because showing a slightly delayed post is acceptable, and availability matters more.&quot;</p>
                <p className="text-green-400 mt-1">Per-component reasoning.</p>
              </div>
            </div>
          ),
        }}
      />

      <ConversationalCallout type="tip">
        In system design interviews, do not say &quot;I will use a CP system&quot; without context.
        Explain <em>why</em> for each component: &quot;For the payment service, I need CP because
        serving stale balance data could lead to double-spending. For the user activity feed,
        I will use AP because showing a slightly delayed post is acceptable, and availability is
        more important than perfect consistency.&quot; The best designs use different consistency
        models for different data within the same system.
      </ConversationalCallout>

      <AhaMoment
        question="What is PACELC, and why does it matter more than CAP in practice?"
        answer={
          <p>
            PACELC extends CAP: &quot;If there is a <strong>P</strong>artition, choose
            <strong> A</strong>vailability or <strong>C</strong>onsistency. <strong>E</strong>lse
            (when running normally), choose <strong>L</strong>atency or <strong>C</strong>onsistency.&quot;
            This matters because partitions are rare &mdash; most of the time your system is
            running normally, and you are choosing between fast responses (lower latency)
            and strong consistency. DynamoDB is PA/EL (available during partitions, low latency normally).
            Spanner is PC/EC (consistent always, even at the cost of 10-20ms per commit using atomic
            clocks). PACELC explains real-world behavior far better than CAP alone because it covers
            the 99.99% of time when nothing is broken.
          </p>
        }
      />

      <KeyTakeaway
        points={[
          "CAP theorem: during a network partition, a distributed system must choose between consistency (latest data or error) and availability (always respond, possibly stale).",
          "Partition tolerance is not optional in distributed systems — the real choice is CP vs AP.",
          "CP systems (MongoDB, CockroachDB, Spanner) sacrifice availability for correctness. Use for financial data, inventory, and anything with hard constraints.",
          "AP systems (DynamoDB, Cassandra) sacrifice consistency for uptime. Use for social feeds, analytics, and data that tolerates staleness.",
          "PACELC extends CAP to normal operation: even without partitions, you choose between latency and consistency. DynamoDB = PA/EL, Spanner = PC/EC.",
          "Consistency is a spectrum (eventual → session → bounded staleness → strong → external), not a binary. Choose the weakest level your use case can tolerate.",
          "The best system designs use different consistency models for different data within the same application.",
        ]}
      />
    </div>
  );
}
