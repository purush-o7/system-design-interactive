"use client";

import { useState, useMemo } from "react";
import { TopicHero } from "@/components/topic-hero";
import { KeyTakeaway } from "@/components/key-takeaway";
import { AhaMoment } from "@/components/aha-moment";
import { ConversationalCallout } from "@/components/conversational-callout";
import { cn } from "@/lib/utils";
import { Scale, Zap, Database, ArrowRightLeft, DollarSign, Clock, ChevronRight } from "lucide-react";

/* ── Static color maps (no dynamic Tailwind interpolation) ── */

const dialColorLeft: Record<string, string> = {
  "consistency-availability": "bg-blue-500",
  "latency-throughput": "bg-violet-500",
  "cost-performance": "bg-amber-500",
  "read-write": "bg-emerald-500",
};

const dialColorRight: Record<string, string> = {
  "consistency-availability": "bg-emerald-500",
  "latency-throughput": "bg-emerald-500",
  "cost-performance": "bg-emerald-500",
  "read-write": "bg-blue-500",
};

const dialLabelLeft: Record<string, string> = {
  "consistency-availability": "text-blue-400",
  "latency-throughput": "text-violet-400",
  "cost-performance": "text-amber-400",
  "read-write": "text-emerald-400",
};

const dialLabelRight: Record<string, string> = {
  "consistency-availability": "text-emerald-400",
  "latency-throughput": "text-emerald-400",
  "cost-performance": "text-emerald-400",
  "read-write": "text-blue-400",
};

const chipStyles: Record<string, string> = {
  strong: "bg-violet-500/15 border-violet-500/30 text-violet-400",
  good: "bg-blue-500/15 border-blue-500/30 text-blue-400",
  weak: "bg-amber-500/15 border-amber-500/30 text-amber-400",
  poor: "bg-red-500/15 border-red-500/30 text-red-400",
};

/* ── Trade-off Data ── */

type TradeoffId = "consistency-availability" | "latency-throughput" | "cost-performance" | "read-write";

interface TradeoffPoint {
  position: number; // 0–100
  label: string;
  systems: string[];
  leftRating: "strong" | "good" | "weak" | "poor";
  rightRating: "strong" | "good" | "weak" | "poor";
  insight: string;
}

interface Tradeoff {
  id: TradeoffId;
  leftName: string;
  rightName: string;
  leftIcon: React.ReactNode;
  rightIcon: React.ReactNode;
  description: string;
  points: TradeoffPoint[];
}

const TRADEOFFS: Tradeoff[] = [
  {
    id: "consistency-availability",
    leftName: "Consistency",
    rightName: "Availability",
    leftIcon: <Database className="size-4" />,
    rightIcon: <Zap className="size-4" />,
    description: "The CAP theorem forces a choice: when a network partition occurs, you can either refuse requests (stay consistent) or serve stale data (stay available). Most systems allow you to tune this per-operation.",
    points: [
      {
        position: 5,
        label: "Strong Consistency",
        systems: ["Google Spanner", "CockroachDB", "Zookeeper"],
        leftRating: "strong",
        rightRating: "poor",
        insight: "Every read sees the latest write, globally. Spanner achieves this with TrueTime — GPS clocks in every datacenter. Expensive: cross-region consensus on every write adds ~100ms of latency.",
      },
      {
        position: 30,
        label: "Linearizable Reads",
        systems: ["etcd", "Consul", "PostgreSQL (sync replication)"],
        leftRating: "good",
        rightRating: "weak",
        insight: "Reads go to the leader or require quorum acknowledgment. Writes are strongly consistent. Suitable for configuration stores and coordination — not user-facing high-throughput workloads.",
      },
      {
        position: 50,
        label: "Read-Your-Writes",
        systems: ["MongoDB (majority)", "DynamoDB (strong reads)", "MySQL (semi-sync)"],
        leftRating: "good",
        rightRating: "good",
        insight: "After writing, you always read your own data. Other users may see stale data briefly. The practical sweet spot for most CRUD applications — users never see their own stale data.",
      },
      {
        position: 75,
        label: "Eventual Consistency",
        systems: ["Cassandra", "DynamoDB (default)", "Redis Cluster"],
        leftRating: "weak",
        rightRating: "strong",
        insight: "Writes replicate asynchronously. All replicas converge eventually (usually milliseconds). Best for high-write workloads where brief staleness is tolerable: social feeds, counters, caches.",
      },
      {
        position: 95,
        label: "Maximum Availability",
        systems: ["DNS", "CDN edge caches", "Read replicas"],
        leftRating: "poor",
        rightRating: "strong",
        insight: "Always available, possibly very stale. DNS TTLs mean you might serve a record that changed hours ago. Correct for cases where the cost of downtime far exceeds the cost of stale data.",
      },
    ],
  },
  {
    id: "latency-throughput",
    leftName: "Low Latency",
    rightName: "High Throughput",
    leftIcon: <Clock className="size-4" />,
    rightIcon: <ArrowRightLeft className="size-4" />,
    description: "Latency (time per request) and throughput (requests per second) are related but conflicting. Batching and buffering improve throughput but add latency. Serving requests immediately reduces latency but leaves capacity underutilized.",
    points: [
      {
        position: 5,
        label: "Ultra-Low Latency",
        systems: ["Redis (in-memory)", "CPU L1 cache", "HFT systems"],
        leftRating: "strong",
        rightRating: "poor",
        insight: "Sub-millisecond response by serving from memory and avoiding batching. Every request is processed immediately. Throughput is limited by single-thread capacity — great for real-time systems, terrible for bulk ingestion.",
      },
      {
        position: 30,
        label: "Interactive Latency",
        systems: ["API gateways", "Load balancers", "CDN edge"],
        leftRating: "good",
        rightRating: "weak",
        insight: "10–100ms range. Small connection pools and minimal buffering. Users perceive responses as instant. This is the target for user-facing web APIs — sub-100ms p99 is table stakes.",
      },
      {
        position: 55,
        label: "Micro-batching",
        systems: ["Kafka (linger.ms)", "Spark Streaming", "Kinesis"],
        leftRating: "weak",
        rightRating: "good",
        insight: "Buffer requests for 5–50ms, then flush in bulk. Kafka's linger.ms trades a tiny latency increase for massive throughput gains (10x+). The right choice for event streaming and log ingestion.",
      },
      {
        position: 80,
        label: "Bulk Batching",
        systems: ["Hadoop MapReduce", "S3 batch operations", "Redshift COPY"],
        leftRating: "weak",
        rightRating: "strong",
        insight: "Minutes of latency, enormous throughput. Accumulate work, process in large chunks. Best for ETL pipelines, analytics, and export jobs where freshness is measured in hours, not milliseconds.",
      },
      {
        position: 97,
        label: "Maximum Throughput",
        systems: ["Video encoding farms", "Genome sequencing", "ML training"],
        leftRating: "poor",
        rightRating: "strong",
        insight: "Throughput is everything. Jobs run for hours or days. Individual operation latency is irrelevant — what matters is total job completion time. Scale out with as many parallel workers as possible.",
      },
    ],
  },
  {
    id: "cost-performance",
    leftName: "Cost Efficiency",
    rightName: "Peak Performance",
    leftIcon: <DollarSign className="size-4" />,
    rightIcon: <Zap className="size-4" />,
    description: "Performance improvements almost always cost more — faster hardware, more replicas, larger caches. The question is whether the performance gain justifies the cost. Most systems are vastly over-provisioned. Measure before optimizing.",
    points: [
      {
        position: 5,
        label: "Minimal / Serverless",
        systems: ["Vercel Functions", "AWS Lambda", "Cloudflare Workers"],
        leftRating: "strong",
        rightRating: "poor",
        insight: "Pay only for what you use. Zero idle cost. But cold starts add 100–500ms latency, and per-request pricing gets expensive at scale. Best for low-traffic or highly variable workloads.",
      },
      {
        position: 30,
        label: "Shared Resources",
        systems: ["RDS db.t3", "Shared Kubernetes nodes", "Spot instances"],
        leftRating: "good",
        rightRating: "weak",
        insight: "Noisy neighbor risk. Spot instances can be reclaimed with 2 minutes notice. Good for batch workloads, dev environments, and stateless services that can tolerate interruption.",
      },
      {
        position: 55,
        label: "Dedicated Instances",
        systems: ["EC2 reserved instances", "RDS Multi-AZ", "Managed Redis"],
        leftRating: "good",
        rightRating: "good",
        insight: "Predictable performance, predictable cost. Reserved instances save ~40% vs on-demand. The sweet spot for most production workloads with stable traffic patterns and SLA requirements.",
      },
      {
        position: 78,
        label: "Provisioned Capacity",
        systems: ["DynamoDB provisioned", "Aurora Serverless v2", "Elastic SAN"],
        leftRating: "weak",
        rightRating: "strong",
        insight: "Pre-warm capacity to guarantee headroom. DynamoDB provisioned throughput eliminates throttling. You pay for capacity whether you use it or not — worth it when latency spikes cost more than idle capacity.",
      },
      {
        position: 95,
        label: "Bare Metal / Custom",
        systems: ["Google TPUs", "Custom ASICs", "Dedicated bare metal"],
        leftRating: "poor",
        rightRating: "strong",
        insight: "Maximum performance at maximum cost. Google built custom TPUs because GPUs were the bottleneck for ML training. Custom silicon for a specific workload can be 10–100x more efficient — at enormous upfront cost.",
      },
    ],
  },
  {
    id: "read-write",
    leftName: "Read Speed",
    rightName: "Write Speed",
    leftIcon: <Database className="size-4" />,
    rightIcon: <ArrowRightLeft className="size-4" />,
    description: "Optimizing for reads typically means adding indexes, replicas, and caches — which all slow down writes. Optimizing for writes means fewer indexes, append-only logs, and write-ahead buffers — which slow down reads. Pick your dominant pattern.",
    points: [
      {
        position: 5,
        label: "Read-Optimized",
        systems: ["Elasticsearch", "ClickHouse", "Redis (read cache)"],
        leftRating: "strong",
        rightRating: "poor",
        insight: "Heavy indexing, materialized views, read replicas. Elasticsearch builds an inverted index on every indexed field — reads are instant, but indexing a document takes hundreds of milliseconds. Never use as a primary write store.",
      },
      {
        position: 28,
        label: "OLAP Workloads",
        systems: ["Redshift", "BigQuery", "Snowflake"],
        leftRating: "good",
        rightRating: "weak",
        insight: "Columnar storage optimizes analytical reads (aggregate millions of rows in milliseconds) but writes are batched — individual row inserts are slow or unsupported. Load data in bulk, query with SQL.",
      },
      {
        position: 52,
        label: "Balanced (OLTP)",
        systems: ["PostgreSQL", "MySQL", "CockroachDB"],
        leftRating: "good",
        rightRating: "good",
        insight: "B-tree indexes balance read and write performance. Most web applications live here. Writes update indexes synchronously — adding more indexes hurts write throughput but helps read speed. Tune based on your actual query patterns.",
      },
      {
        position: 75,
        label: "Write-Optimized",
        systems: ["Cassandra", "RocksDB", "InfluxDB"],
        leftRating: "weak",
        rightRating: "strong",
        insight: "LSM tree: writes go to an in-memory buffer (memtable), flushed to sorted files (SSTables). Writes are extremely fast. Reads require checking multiple SSTables — mitigated by Bloom filters. Best for time-series and event logging.",
      },
      {
        position: 95,
        label: "Write-Only / Append",
        systems: ["Kafka", "Kinesis", "Write-ahead logs"],
        leftRating: "poor",
        rightRating: "strong",
        insight: "Sequential disk writes at hundreds of MB/s. Kafka achieves this by treating the log as append-only and leveraging OS page cache. You cannot update records — only append. Reads require scanning or offset tracking.",
      },
    ],
  },
];

/* ── Trade-off Dial ── */

function TradeoffDial({ position, leftColor, rightColor }: { position: number; leftColor: string; rightColor: string }) {
  const leftFill = 100 - position;
  return (
    <div className="relative flex items-center gap-2">
      <div className="h-3 flex-1 rounded-full overflow-hidden bg-muted/30 border border-border/30 flex">
        <div
          className={cn("h-full transition-all duration-500 rounded-full", leftColor)}
          style={{ width: `${leftFill}%`, opacity: 0.8 }}
        />
        <div
          className={cn("h-full transition-all duration-500 rounded-full", rightColor)}
          style={{ width: `${position}%`, opacity: 0.8 }}
        />
      </div>
      <div
        className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-background border-2 border-violet-400 shadow-lg shadow-violet-500/20 transition-all duration-500"
        style={{ left: `calc(${position}% - 8px)` }}
      />
    </div>
  );
}

/* ── Decision Matrix ── */

interface MatrixEntry {
  scenario: string;
  consistency: number;
  latency: number;
  cost: number;
  readSpeed: number;
  note: string;
}

const MATRIX_ENTRIES: MatrixEntry[] = [
  { scenario: "Social media feed", consistency: 20, latency: 30, cost: 30, readSpeed: 80, note: "Eventual consistency fine; stale posts acceptable. Read-heavy, optimize for throughput." },
  { scenario: "Banking transactions", consistency: 95, latency: 40, cost: 60, readSpeed: 50, note: "Strong consistency required. Losing money is worse than 100ms extra latency." },
  { scenario: "Real-time bidding", consistency: 30, latency: 95, cost: 70, readSpeed: 70, note: "Sub-10ms latency critical. Slight inconsistency (overbidding) handled post-auction." },
  { scenario: "Analytics dashboard", consistency: 20, latency: 20, cost: 40, readSpeed: 90, note: "Hours-old data is fine. Columnar stores for fast aggregations on terabytes." },
  { scenario: "E-commerce inventory", consistency: 80, latency: 50, cost: 50, readSpeed: 60, note: "Overselling is costly. Read-your-writes minimum. Strong for the final purchase step." },
  { scenario: "Search index", consistency: 30, latency: 60, cost: 50, readSpeed: 95, note: "Eventual is fine — users don't notice if a new post appears after 1 second. Reads must be instant." },
];

function ScoreBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex-1 h-1.5 rounded-full bg-muted/30 overflow-hidden">
        <div className={cn("h-full rounded-full transition-all duration-500", color)} style={{ width: `${value}%` }} />
      </div>
      <span className="text-[9px] font-mono text-muted-foreground w-6">{value}</span>
    </div>
  );
}

/* ── Main Page ── */

export default function TradeOffsPage() {
  const [activeTradeoff, setActiveTradeoff] = useState<TradeoffId>("consistency-availability");
  const [selectedPoint, setSelectedPoint] = useState<number>(2);
  const [hoveredScenario, setHoveredScenario] = useState<number | null>(null);

  const tradeoff = useMemo(
    () => TRADEOFFS.find((t) => t.id === activeTradeoff)!,
    [activeTradeoff]
  );

  const point = tradeoff.points[selectedPoint] ?? tradeoff.points[0];

  const handleTradeoffSelect = (id: TradeoffId) => {
    setActiveTradeoff(id);
    setSelectedPoint(2);
  };

  return (
    <div className="space-y-8">
      <TopicHero
        title="Trade-offs"
        subtitle="Every system design decision is a trade-off. There is no perfect system — only the right system for your specific constraints."
        difficulty="intermediate"
      />

      <ConversationalCallout type="tip">
        In interviews, trade-offs are the answer. When asked &quot;which database should I use?&quot;, the right answer is not a database name — it is a list of trade-offs and which constraints matter most for this problem.
      </ConversationalCallout>

      {/* Trade-off Selector */}
      <div className="rounded-xl border border-violet-500/20 bg-violet-500/[0.02] overflow-hidden">
        <div className="flex items-center gap-2 border-b border-violet-500/20 bg-violet-500/[0.04] px-4 py-2">
          <div className="size-2 rounded-full bg-violet-500/50" />
          <span className="text-sm font-medium text-violet-400">Trade-off Explorer</span>
        </div>

        <div className="p-4 space-y-5">
          {/* Property Selector */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {TRADEOFFS.map((t) => (
              <button
                key={t.id}
                onClick={() => handleTradeoffSelect(t.id)}
                className={cn(
                  "rounded-lg border px-3 py-2 text-xs font-medium transition-all text-left",
                  activeTradeoff === t.id
                    ? "bg-violet-500/10 border-violet-500/30 text-violet-400"
                    : "bg-muted/20 border-border/30 text-muted-foreground/70 hover:bg-muted/40"
                )}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Scale className="size-3" />
                  <span className="font-semibold">{t.leftName}</span>
                </div>
                <div className="text-[10px] opacity-70">vs {t.rightName}</div>
              </button>
            ))}
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground">{tradeoff.description}</p>

          {/* Dial */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className={cn("flex items-center gap-1", dialLabelLeft[activeTradeoff])}>
                {tradeoff.leftIcon}
                {tradeoff.leftName}
              </span>
              <span className={cn("flex items-center gap-1", dialLabelRight[activeTradeoff])}>
                {tradeoff.rightName}
                {tradeoff.rightIcon}
              </span>
            </div>
            <TradeoffDial
              position={point.position}
              leftColor={dialColorLeft[activeTradeoff]}
              rightColor={dialColorRight[activeTradeoff]}
            />
            <div className="flex justify-between text-[10px] text-muted-foreground/60">
              <span>Maximized left</span>
              <span>Maximized right</span>
            </div>
          </div>

          {/* Point Selector */}
          <div className="flex gap-1.5 flex-wrap">
            {tradeoff.points.map((p, i) => (
              <button
                key={p.label}
                onClick={() => setSelectedPoint(i)}
                className={cn(
                  "rounded-full border px-3 py-1 text-[11px] font-medium transition-all",
                  selectedPoint === i
                    ? "bg-violet-500/10 border-violet-500/30 text-violet-400"
                    : "bg-muted/20 border-border/30 text-muted-foreground/60 hover:bg-muted/40"
                )}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Detail Panel */}
          <div className="rounded-lg border border-violet-500/20 bg-violet-500/[0.03] p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-sm font-semibold">{point.label}</h3>
              <div className="flex gap-2 shrink-0">
                <div className="text-[10px] space-y-0.5">
                  <div className="text-muted-foreground/60">
                    {tradeoff.leftName}
                    <span className={cn("ml-1.5 rounded border px-1.5 py-0.5 font-medium", chipStyles[point.leftRating])}>
                      {point.leftRating}
                    </span>
                  </div>
                </div>
                <div className="text-[10px] space-y-0.5">
                  <div className="text-muted-foreground/60">
                    {tradeoff.rightName}
                    <span className={cn("ml-1.5 rounded border px-1.5 py-0.5 font-medium", chipStyles[point.rightRating])}>
                      {point.rightRating}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">{point.insight}</p>

            <div className="space-y-1">
              <p className="text-[11px] font-medium text-muted-foreground/60">Real systems at this point</p>
              <div className="flex gap-1.5 flex-wrap">
                {point.systems.map((sys) => (
                  <span
                    key={sys}
                    className="rounded-md bg-muted/30 border border-border/40 px-2 py-0.5 text-[11px] font-mono"
                  >
                    {sys}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <AhaMoment
        question="Why can't we just have consistency AND availability AND partition tolerance?"
        answer={
          <p>
            The CAP theorem proves it is mathematically impossible. During a network partition (two sides of your datacenter cannot talk), you must choose: refuse all requests until the partition heals (CP — consistent but unavailable), or keep serving requests that may be based on stale data (AP — available but inconsistent). Most real systems (Google Spanner, CockroachDB) choose CP and tune the trade-off. Most distributed caches and social feeds choose AP because stale data is cheaper than downtime.
          </p>
        }
      />

      {/* Decision Matrix */}
      <div className="rounded-xl border border-violet-500/20 bg-violet-500/[0.02] overflow-hidden">
        <div className="flex items-center gap-2 border-b border-violet-500/20 bg-violet-500/[0.04] px-4 py-2">
          <div className="size-2 rounded-full bg-violet-500/50" />
          <span className="text-sm font-medium text-violet-400">Decision Matrix — Common System Scenarios</span>
        </div>
        <div className="p-4">
          <p className="text-sm text-muted-foreground mb-4">
            Hover any row to see the reasoning. Bars show how much each property is prioritized (0 = not a concern, 100 = critical requirement).
          </p>
          <div className="space-y-2">
            {/* Header */}
            <div className="grid grid-cols-[1fr_80px_80px_80px_80px] gap-2 text-[10px] text-muted-foreground/60 font-medium px-3">
              <span>Scenario</span>
              <span className="text-blue-400/70">Consistency</span>
              <span className="text-violet-400/70">Low Latency</span>
              <span className="text-amber-400/70">Cost Eff.</span>
              <span className="text-emerald-400/70">Read Speed</span>
            </div>
            {MATRIX_ENTRIES.map((entry, i) => (
              <div
                key={entry.scenario}
                onMouseEnter={() => setHoveredScenario(i)}
                onMouseLeave={() => setHoveredScenario(null)}
                className={cn(
                  "rounded-lg border p-3 transition-all cursor-pointer",
                  hoveredScenario === i
                    ? "border-violet-500/30 bg-violet-500/5"
                    : "border-border/30 bg-muted/10 hover:bg-muted/20"
                )}
              >
                <div className="grid grid-cols-[1fr_80px_80px_80px_80px] gap-2 items-center">
                  <div className="flex items-center gap-1.5">
                    <ChevronRight className={cn("size-3 transition-all text-violet-400", hoveredScenario === i ? "opacity-100" : "opacity-0")} />
                    <span className="text-xs font-medium">{entry.scenario}</span>
                  </div>
                  <ScoreBar value={entry.consistency} color="bg-blue-500" />
                  <ScoreBar value={100 - entry.latency} color="bg-violet-500" />
                  <ScoreBar value={100 - entry.cost} color="bg-amber-500" />
                  <ScoreBar value={entry.readSpeed} color="bg-emerald-500" />
                </div>
                {hoveredScenario === i && (
                  <p className="text-[11px] text-muted-foreground mt-2 ml-5 border-l-2 border-violet-500/30 pl-2">
                    {entry.note}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <ConversationalCallout type="warning">
        The biggest trade-off mistake: optimizing prematurely. Most startups do not need Cassandra's eventual consistency model — they need to ship. Start with PostgreSQL, measure your actual bottlenecks, then make a conscious trade-off. Premature optimization is the root of most over-engineered systems.
      </ConversationalCallout>

      {/* Trade-off Framework */}
      <div className="rounded-xl border border-border/50 bg-muted/5 p-5 space-y-4">
        <h2 className="text-base font-semibold">Framework: How to Reason About Trade-offs in Interviews</h2>
        <div className="space-y-3">
          {[
            {
              step: "1",
              title: "Identify the dominant access pattern",
              desc: "Is this read-heavy or write-heavy? What is the read:write ratio? (Twitter: 100:1 reads to writes. Stock trading: near 1:1.)",
              color: "bg-blue-500/10 border-blue-500/20 text-blue-400",
            },
            {
              step: "2",
              title: "Define your consistency requirements",
              desc: "What happens if two users see different data? Is temporary inconsistency acceptable? (Social feed: yes. Bank balance: no.)",
              color: "bg-violet-500/10 border-violet-500/20 text-violet-400",
            },
            {
              step: "3",
              title: "Establish your latency budget",
              desc: "What is the p99 latency requirement? Real-time bidding needs <10ms. Analytics dashboards can take seconds. This drives your storage and caching decisions.",
              color: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
            },
            {
              step: "4",
              title: "Estimate scale and cost",
              desc: "At what scale does the current approach break? When does the trade-off flip? A Redis cache is cheap at 10k RPM, expensive at 10M RPM.",
              color: "bg-amber-500/10 border-amber-500/20 text-amber-400",
            },
            {
              step: "5",
              title: "State the trade-off explicitly",
              desc: 'Never just say "use Cassandra." Say: "I am trading consistency for write throughput, which is acceptable because..."',
              color: "bg-pink-500/10 border-pink-500/20 text-pink-400",
            },
          ].map(({ step, title, desc, color }) => (
            <div key={step} className={cn("flex gap-3 rounded-lg border p-3", color)}>
              <span className={cn("size-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0", color)}>
                {step}
              </span>
              <div>
                <p className="text-xs font-semibold">{title}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AhaMoment
        question="Is eventual consistency always worse than strong consistency?"
        answer={
          <p>
            No — for many workloads, eventual consistency is the correct choice, not a compromise. Your social media feed does not need to show a post the instant it is published. DNS does not need to propagate changes in milliseconds. The global CDN does not need your latest code within seconds. For these systems, strong consistency would add latency, cost, and complexity with zero user benefit. The question is never &quot;which is better&quot; — it is &quot;which is right for this specific data, with these specific users, in this specific context.&quot;
          </p>
        }
      />

      <ConversationalCallout type="question">
        How do you handle trade-offs when requirements conflict? For example, a feature needs both strong consistency (payment integrity) and low latency (user experience)? The answer is usually to decompose: use strong consistency for the critical path (charge the card), then use eventual consistency for the non-critical path (update the dashboard). You are not choosing one — you are choosing different consistency levels for different operations in the same system.
      </ConversationalCallout>

      <KeyTakeaway
        points={[
          "Every system design decision is a trade-off. There are no universally correct answers — only answers that fit your specific constraints: scale, latency budget, consistency requirements, and cost.",
          "The CAP theorem forces a choice during network partitions: Consistency (refuse requests) or Availability (serve potentially stale data). Most systems tune per-operation, not system-wide.",
          "Latency and throughput trade off against each other. Batching (Kafka linger.ms) sacrifices latency for throughput. Serving immediately (Redis) sacrifices throughput for latency.",
          "Read-optimized storage (Elasticsearch, columnar DBs) adds indexes that slow writes. Write-optimized storage (Cassandra, Kafka) uses LSM trees that make reads slower. Pick based on your dominant pattern.",
          "In interviews, state trade-offs explicitly: 'I am choosing eventual consistency here because X, and I am accepting the risk of Y.' This is what senior engineers do.",
          "Do not optimize prematurely. Most teams need to ship and measure before they need Cassandra or Kafka. Start with PostgreSQL. Trade-offs should be driven by measured bottlenecks, not speculation.",
        ]}
      />
    </div>
  );
}
