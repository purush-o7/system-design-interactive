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
import { BeforeAfter } from "@/components/before-after";
import { AnimatedFlow } from "@/components/animated-flow";
import { MetricCounter } from "@/components/metric-counter";
import { cn } from "@/lib/utils";
import {
  Scale,
  Zap,
  Shield,
  Users,
  Database,
  ArrowRightLeft,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  AlertTriangle,
} from "lucide-react";

const tradeOffs = [
  {
    id: "sql-nosql",
    left: "SQL (PostgreSQL, MySQL)",
    right: "NoSQL (MongoDB, DynamoDB)",
    leftPros: [
      "ACID transactions guarantee data integrity across operations",
      "Complex joins and aggregations in a single query",
      "Mature tooling, well-understood optimization and indexing",
      "Strong schema enforcement catches bugs before production",
    ],
    leftCons: [
      "Vertical scaling hits hardware ceilings quickly",
      "Schema migrations on billion-row tables can take hours",
      "Sharding is complex, often bolted on as an afterthought",
    ],
    rightPros: [
      "Horizontal scaling is a first-class citizen from day one",
      "Flexible schema adapts to evolving requirements weekly",
      "High write throughput for append-heavy workloads",
      "Document model maps naturally to application objects",
    ],
    rightCons: [
      "No joins — you denormalize eagerly or query multiple times",
      "Eventual consistency can cause stale reads that surprise users",
      "Less mature tooling for complex analytics and reporting",
    ],
    realWorld:
      "Amazon uses DynamoDB for its shopping cart (high write throughput, simple key-value access) but PostgreSQL for financial ledgers (ACID transactions, complex reporting). Shopify runs PostgreSQL for orders that need transactional guarantees.",
    choose:
      "SQL when you need strong consistency, complex relationships, and ad-hoc queries. NoSQL when you need flexible schemas, massive horizontal scale, and your access patterns are simple key-based lookups.",
  },
  {
    id: "rest-grpc",
    left: "REST (HTTP/JSON)",
    right: "gRPC (HTTP/2 + Protobuf)",
    leftPros: [
      "Universal browser support — works from any client out of the box",
      "Human-readable JSON simplifies debugging with curl and Postman",
      "HTTP caching works natively through CDNs and proxies",
      "Massive ecosystem of tools, docs, and developer familiarity",
    ],
    leftCons: [
      "Verbose JSON payloads increase bandwidth by 5-10x vs binary",
      "No built-in streaming support (needs WebSockets as workaround)",
      "Weak typing leads to runtime contract violations between services",
    ],
    rightPros: [
      "Binary protobuf payloads are 5-10x smaller than JSON",
      "Strongly typed contracts catch breaking changes at compile time",
      "Native bidirectional streaming for real-time data flows",
      "Code generation eliminates hand-written boilerplate",
    ],
    rightCons: [
      "No native browser support — needs grpc-web proxy layer",
      "Binary format makes debugging harder without special tools",
      "Steeper learning curve for teams new to protobuf and HTTP/2",
    ],
    realWorld:
      "Netflix uses gRPC for internal service-to-service calls (low latency, strong contracts across 1000+ microservices) but REST for its public API (browser support, developer familiarity for third-party integrations).",
    choose:
      "REST for public APIs and browser clients. gRPC for internal microservice communication where performance and type safety matter more than readability.",
  },
  {
    id: "consistency-availability",
    left: "Consistency (CP)",
    right: "Availability (AP)",
    leftPros: [
      "Every read returns the most recent write — no stale data",
      "No user-facing contradictions or race conditions",
      "Simplifies application logic — no conflict resolution needed",
      "Critical for financial systems, bookings, and inventory",
    ],
    leftCons: [
      "System rejects requests during network partitions",
      "Higher write latency (quorum required before acknowledging)",
      "Lower throughput under contention from coordination overhead",
    ],
    rightPros: [
      "System always responds, even during network partitions",
      "Lower latency — nearest replica can answer immediately",
      "Higher throughput for read-heavy workloads across regions",
      "Better user experience when staleness is tolerable",
    ],
    rightCons: [
      "Reads may return stale data for seconds or minutes",
      "Conflict resolution adds significant application complexity",
      "Harder to reason about system state during partitions",
    ],
    realWorld:
      "Banks choose CP — showing a wrong balance or allowing an overdraft causes real financial harm. Twitter chooses AP — your feed being 2 seconds stale is invisible to users, but a 500 error page loses engagement.",
    choose:
      "Consistency when stale data causes real harm (money, inventory, seat reservations). Availability when uptime matters more than freshness and you can tolerate eventual consistency.",
  },
  {
    id: "monolith-micro",
    left: "Monolith",
    right: "Microservices",
    leftPros: [
      "Single deployment unit — simple CI/CD pipeline",
      "In-process function calls — zero network overhead",
      "Easy debugging with a single stack trace and one log stream",
      "Fast to build and iterate for small teams",
    ],
    leftCons: [
      "One team's change can break another team's feature",
      "Scaling means scaling everything, even cold code paths",
      "Technology lock-in to a single language and framework",
    ],
    rightPros: [
      "Independent deployments reduce blast radius of changes",
      "Teams own their service end-to-end with clear boundaries",
      "Scale hot services independently without scaling cold ones",
      "Polyglot — use the best language and framework per service",
    ],
    rightCons: [
      "Distributed systems are inherently complex to debug",
      "Network calls add latency and introduce partial failure modes",
      "Requires mature DevOps (CI/CD, observability, service mesh)",
      "Data consistency across service boundaries is hard",
    ],
    realWorld:
      "Shopify ran a Rails monolith to $1B+ in revenue before gradually extracting services. Uber went microservices early and spent years managing the operational complexity tax with 4000+ services.",
    choose:
      "Monolith for small teams (under 10 engineers) and early products. Microservices when team size and scale demand independent deployments and you can afford the operational overhead.",
  },
  {
    id: "kafka-rabbitmq",
    left: "Kafka",
    right: "RabbitMQ",
    leftPros: [
      "Ordered, replayable event log — events are retained for days or weeks",
      "Massive throughput (millions of messages per second at LinkedIn)",
      "Consumer groups enable parallel processing with partition assignment",
      "Acts as both a message broker and a durable event store",
    ],
    leftCons: [
      "Operational complexity — ZooKeeper/KRaft, partition rebalancing",
      "Not designed for per-message routing or priority queues",
      "Higher latency for individual messages (optimized for batching)",
    ],
    rightPros: [
      "Rich routing patterns (direct, topic, fanout, headers exchanges)",
      "Per-message acknowledgment and built-in dead-letter queues",
      "Lower latency for individual messages — ideal for task queues",
      "Simpler to operate for small-to-medium message volumes",
    ],
    rightCons: [
      "Messages are deleted after consumption — no replay capability",
      "Throughput ceiling is significantly lower than Kafka",
      "Not an event store — just a message bus with no history",
    ],
    realWorld:
      "LinkedIn uses Kafka for activity streams (ordered, replayable, millions of events per second). Stripe uses RabbitMQ-style queues for webhook delivery (per-message routing, retries with backoff, dead-letter for failed webhooks).",
    choose:
      "Kafka when you need event sourcing, replay, or extreme throughput. RabbitMQ when you need flexible routing, task queues, and per-message delivery guarantees.",
  },
];

const dimensions = [
  {
    icon: <Scale className="size-4" />,
    label: "Scale",
    question: "How much data? How many users? What is the growth rate?",
    example:
      "10K users today but expecting 10M in 2 years changes everything about your storage layer. DynamoDB handles this natively; PostgreSQL would need painful sharding.",
    color: "blue",
  },
  {
    icon: <Shield className="size-4" />,
    label: "Consistency",
    question: "Can we tolerate stale reads? What happens if data is lost?",
    example:
      "A social media like count can be eventually consistent — off by one is invisible. A bank balance cannot — showing $500 when the real value is $0 causes real harm.",
    color: "emerald",
  },
  {
    icon: <Zap className="size-4" />,
    label: "Latency",
    question: "What response time is acceptable? P50 vs P99?",
    example:
      "A search autocomplete needs P99 under 50ms or it feels laggy. A nightly batch report can take 10 minutes and nobody cares.",
    color: "amber",
  },
  {
    icon: <Users className="size-4" />,
    label: "Team & Ops",
    question: "Does the team know this technology? Can they debug it at 3 AM?",
    example:
      "Kafka is powerful, but if nobody on the team has operated it in production, SQS might be the wiser choice. The best technology you cannot operate is worse than the adequate one you can.",
    color: "purple",
  },
  {
    icon: <Database className="size-4" />,
    label: "Access Patterns",
    question: "Read-heavy or write-heavy? Random or sequential? Point or range queries?",
    example:
      "A user profile service is read-heavy (cache-friendly, SQL works fine). An analytics ingestion pipeline is write-heavy (append-optimized, Kafka or Cassandra shine).",
    color: "rose",
  },
  {
    icon: <AlertTriangle className="size-4" />,
    label: "Failure Modes",
    question: "What breaks? What is the blast radius? How do we recover?",
    example:
      "A Redis cache failure degrades latency but data survives in the DB. A primary database failure loses writes. The blast radius determines your redundancy investment.",
    color: "orange",
  },
];

function TradeOffExplorer() {
  const [selected, setSelected] = useState(0);
  const [expandedSide, setExpandedSide] = useState<"left" | "right" | null>(
    null
  );
  const current = tradeOffs[selected];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {tradeOffs.map((t, i) => (
          <button
            key={t.id}
            onClick={() => {
              setSelected(i);
              setExpandedSide(null);
            }}
            className={cn(
              "text-xs px-3 py-1.5 rounded-full border transition-all",
              i === selected
                ? "border-primary bg-primary/10 font-medium text-primary"
                : "border-border/50 bg-muted/30 text-muted-foreground hover:bg-muted/50"
            )}
          >
            {t.left.split(" (")[0]} vs {t.right.split(" (")[0]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Left option card */}
        <button
          onClick={() =>
            setExpandedSide(expandedSide === "left" ? null : "left")
          }
          className={cn(
            "text-left border rounded-lg p-4 transition-all",
            "bg-blue-500/5 border-blue-500/20 hover:border-blue-500/40",
            expandedSide === "left" && "ring-1 ring-blue-500/30"
          )}
        >
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-semibold text-blue-400">
              {current.left}
            </p>
            {expandedSide === "left" ? (
              <ChevronUp className="size-3.5 text-blue-400" />
            ) : (
              <ChevronDown className="size-3.5 text-muted-foreground" />
            )}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Click to expand pros and cons
          </p>
          {expandedSide === "left" && (
            <div className="space-y-3 mt-3 border-t border-blue-500/10 pt-3">
              <div>
                <p className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider mb-1.5">
                  Strengths
                </p>
                <ul className="space-y-1">
                  {current.leftPros.map((p) => (
                    <li
                      key={p}
                      className="text-xs text-muted-foreground flex items-start gap-1.5"
                    >
                      <span className="text-emerald-400 mt-0.5 shrink-0">
                        +
                      </span>{" "}
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-red-400 uppercase tracking-wider mb-1.5">
                  Weaknesses
                </p>
                <ul className="space-y-1">
                  {current.leftCons.map((c) => (
                    <li
                      key={c}
                      className="text-xs text-muted-foreground flex items-start gap-1.5"
                    >
                      <span className="text-red-400 mt-0.5 shrink-0">-</span>{" "}
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </button>

        {/* Right option card */}
        <button
          onClick={() =>
            setExpandedSide(expandedSide === "right" ? null : "right")
          }
          className={cn(
            "text-left border rounded-lg p-4 transition-all",
            "bg-purple-500/5 border-purple-500/20 hover:border-purple-500/40",
            expandedSide === "right" && "ring-1 ring-purple-500/30"
          )}
        >
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-semibold text-purple-400">
              {current.right}
            </p>
            {expandedSide === "right" ? (
              <ChevronUp className="size-3.5 text-purple-400" />
            ) : (
              <ChevronDown className="size-3.5 text-muted-foreground" />
            )}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Click to expand pros and cons
          </p>
          {expandedSide === "right" && (
            <div className="space-y-3 mt-3 border-t border-purple-500/10 pt-3">
              <div>
                <p className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider mb-1.5">
                  Strengths
                </p>
                <ul className="space-y-1">
                  {current.rightPros.map((p) => (
                    <li
                      key={p}
                      className="text-xs text-muted-foreground flex items-start gap-1.5"
                    >
                      <span className="text-emerald-400 mt-0.5 shrink-0">
                        +
                      </span>{" "}
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-red-400 uppercase tracking-wider mb-1.5">
                  Weaknesses
                </p>
                <ul className="space-y-1">
                  {current.rightCons.map((c) => (
                    <li
                      key={c}
                      className="text-xs text-muted-foreground flex items-start gap-1.5"
                    >
                      <span className="text-red-400 mt-0.5 shrink-0">-</span>{" "}
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </button>
      </div>

      {/* Verdict row */}
      <div className="bg-emerald-500/5 border border-emerald-500/20 p-3 rounded-lg">
        <p className="text-xs font-semibold text-emerald-400 mb-1">
          When to choose which
        </p>
        <p className="text-xs text-muted-foreground">{current.choose}</p>
      </div>

      {/* Real-world example */}
      <div className="bg-amber-500/5 border border-amber-500/20 p-3 rounded-lg">
        <div className="flex items-start gap-2">
          <Lightbulb className="size-3.5 text-amber-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-amber-400 mb-1">
              Real-world example
            </p>
            <p className="text-xs text-muted-foreground">
              {current.realWorld}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ItDependsExplorer() {
  const [activeDimension, setActiveDimension] = useState<number | null>(null);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());

  const colorMap: Record<string, string> = {
    blue: "bg-blue-500/10 border-blue-500/20 text-blue-400",
    emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    amber: "bg-amber-500/10 border-amber-500/20 text-amber-400",
    purple: "bg-purple-500/10 border-purple-500/20 text-purple-400",
    rose: "bg-rose-500/10 border-rose-500/20 text-rose-400",
    orange: "bg-orange-500/10 border-orange-500/20 text-orange-400",
  };

  const activeColorMap: Record<string, string> = {
    blue: "ring-blue-500/30",
    emerald: "ring-emerald-500/30",
    amber: "ring-amber-500/30",
    purple: "ring-purple-500/30",
    rose: "ring-rose-500/30",
    orange: "ring-orange-500/30",
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {dimensions.map((d, i) => (
          <button
            key={d.label}
            onClick={() => {
              setActiveDimension(activeDimension === i ? null : i);
              setRevealed((prev) => new Set(prev).add(i));
            }}
            className={cn(
              "text-left p-3 rounded-lg border transition-all",
              colorMap[d.color],
              activeDimension === i && `ring-1 ${activeColorMap[d.color]}`
            )}
          >
            <div className="flex items-center gap-2 mb-1">
              {d.icon}
              <span className="text-xs font-semibold">{d.label}</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {d.question}
            </p>
          </button>
        ))}
      </div>
      {activeDimension !== null && (
        <div className="bg-muted/30 border border-border/50 p-3 rounded-lg">
          <p className="text-xs font-semibold mb-1">
            {dimensions[activeDimension].label} in practice
          </p>
          <p className="text-xs text-muted-foreground">
            {dimensions[activeDimension].example}
          </p>
        </div>
      )}
      <div className="flex items-center gap-2">
        <div className="h-1.5 flex-1 rounded-full bg-muted/30 overflow-hidden">
          <div
            className="h-full bg-primary/50 transition-all duration-500 rounded-full"
            style={{
              width: `${(revealed.size / dimensions.length) * 100}%`,
            }}
          />
        </div>
        <span className="text-[10px] font-mono text-muted-foreground">
          {revealed.size}/{dimensions.length} explored
        </span>
      </div>
    </div>
  );
}

function DecisionMatrixViz() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % 8), 1500);
    return () => clearInterval(t);
  }, []);

  const criteria = [
    { label: "Horizontal Scale", sqlScore: 2, nosqlScore: 5 },
    { label: "Consistency", sqlScore: 5, nosqlScore: 2 },
    { label: "Query Power", sqlScore: 5, nosqlScore: 2 },
    { label: "Write Throughput", sqlScore: 3, nosqlScore: 5 },
    { label: "Schema Flexibility", sqlScore: 2, nosqlScore: 5 },
    { label: "Ops Simplicity", sqlScore: 4, nosqlScore: 3 },
  ];

  const activeRow = step < criteria.length ? step : -1;
  const showTotals = step >= criteria.length;
  const sqlTotal = criteria.reduce((a, c) => a + c.sqlScore, 0);
  const nosqlTotal = criteria.reduce((a, c) => a + c.nosqlScore, 0);

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[1fr_80px_80px] gap-1 text-[10px] font-mono">
        <div className="text-muted-foreground/50 px-2 py-1">Criteria</div>
        <div className="text-blue-400/70 text-center py-1">SQL</div>
        <div className="text-purple-400/70 text-center py-1">NoSQL</div>
        {criteria.map((c, i) => (
          <div key={c.label} className="contents">
            <div
              className={cn(
                "px-2 py-1.5 rounded-l-md transition-all",
                activeRow === i
                  ? "bg-primary/10 text-primary font-medium"
                  : step > i
                    ? "text-muted-foreground"
                    : "text-muted-foreground/30"
              )}
            >
              {c.label}
            </div>
            <div
              className={cn(
                "text-center py-1.5 transition-all",
                step > i
                  ? "text-blue-400"
                  : activeRow === i
                    ? "text-blue-400/50"
                    : "text-muted-foreground/20"
              )}
            >
              {step >= i ? renderDots(c.sqlScore) : ""}
            </div>
            <div
              className={cn(
                "text-center py-1.5 rounded-r-md transition-all",
                step > i
                  ? "text-purple-400"
                  : activeRow === i
                    ? "text-purple-400/50"
                    : "text-muted-foreground/20"
              )}
            >
              {step >= i ? renderDots(c.nosqlScore) : ""}
            </div>
          </div>
        ))}
        {showTotals && (
          <div className="contents">
            <div className="px-2 py-1.5 border-t border-border/30 font-semibold text-muted-foreground">
              Total
            </div>
            <div className="text-center py-1.5 border-t border-border/30 font-bold text-blue-400">
              {sqlTotal}
            </div>
            <div className="text-center py-1.5 border-t border-border/30 font-bold text-purple-400">
              {nosqlTotal}
            </div>
          </div>
        )}
      </div>
      <p className="text-[11px] text-muted-foreground/60">
        {showTotals
          ? "Scores are nearly tied — the winner depends on which criteria carry the most weight for YOUR specific system."
          : `Evaluating ${activeRow >= 0 && activeRow < criteria.length ? criteria[activeRow].label.toLowerCase() : "criteria"}...`}
      </p>
    </div>
  );
}

function renderDots(score: number) {
  return (
    <span className="inline-flex gap-px">
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={cn(
            "inline-block size-1.5 rounded-full",
            i < score ? "bg-current" : "bg-current/20"
          )}
        />
      ))}
    </span>
  );
}

function InterviewTemplateWalkthrough() {
  const [activeStep, setActiveStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setActiveStep((s) => (s + 1) % 5), 3000);
    return () => clearInterval(t);
  }, []);

  const steps = [
    {
      label: "State the requirement",
      color: "blue",
      example:
        "We need to handle 50K writes per second with flexible schemas and the data model is evolving weekly...",
      why: "Anchors the conversation in constraints, not opinions. The interviewer knows you are reasoning from requirements.",
    },
    {
      label: "Name 2-3 realistic options",
      color: "purple",
      example:
        "We could use PostgreSQL with JSONB columns, DynamoDB for native horizontal scaling, or Cassandra for write-optimized workloads...",
      why: "Shows breadth of knowledge. Naming only one option signals you have not thought about alternatives.",
    },
    {
      label: "Explain what you gain and lose",
      color: "emerald",
      example:
        "DynamoDB gives us predictable single-digit latency at any scale, but we lose ad-hoc queries, JOINs, and cross-item transactions...",
      why: "This is the core of the trade-off discussion. The interviewer is evaluating your depth right here.",
    },
    {
      label: "Make a justified decision",
      color: "orange",
      example:
        "Given our write-heavy workload and frequently changing schema, I would choose DynamoDB with single-table design...",
      why: "Tying the decision back to the specific requirements shows you are reasoning, not pattern-matching from a blog post.",
    },
    {
      label: "State what would change your mind",
      color: "rose",
      example:
        "If we later needed complex analytical queries across this data, we would pipe DynamoDB streams to Redshift or BigQuery...",
      why: "Shows you think about system evolution. This is senior-level thinking and most candidates miss it entirely.",
    },
  ];

  const colorBorder: Record<string, string> = {
    blue: "border-l-blue-500",
    purple: "border-l-purple-500",
    emerald: "border-l-emerald-500",
    orange: "border-l-orange-500",
    rose: "border-l-rose-500",
  };

  const colorText: Record<string, string> = {
    blue: "text-blue-400",
    purple: "text-purple-400",
    emerald: "text-emerald-400",
    orange: "text-orange-400",
    rose: "text-rose-400",
  };

  return (
    <div className="space-y-2">
      {steps.map((s, i) => (
        <button
          key={s.label}
          onClick={() => setActiveStep(i)}
          className={cn(
            "w-full text-left bg-muted/30 p-3 rounded-lg border-l-2 transition-all",
            colorBorder[s.color],
            activeStep === i
              ? "ring-1 ring-border/50"
              : "opacity-70 hover:opacity-100"
          )}
        >
          <p className={cn("text-xs font-semibold mb-1", colorText[s.color])}>
            {i + 1}. {s.label}
          </p>
          {activeStep === i && (
            <div className="space-y-2 mt-2">
              <p className="text-xs text-muted-foreground italic">
                &quot;{s.example}&quot;
              </p>
              <p className="text-[11px] text-muted-foreground/70">
                <span className="font-semibold text-muted-foreground">
                  Why this works:{" "}
                </span>
                {s.why}
              </p>
            </div>
          )}
        </button>
      ))}
    </div>
  );
}

export default function TradeOffsPage() {
  return (
    <div className="space-y-8">
      <TopicHero
        title="Trade-offs & Decision Making"
        subtitle="In system design, there are no right answers — only trade-offs you can or cannot justify. The difference between a junior and senior answer is not the technology chosen, but the reasoning behind the choice."
        difficulty="intermediate"
      />

      <FailureScenario title="You say 'let's use Kafka' without explaining why">
        <p className="text-sm text-muted-foreground">
          The interviewer asks how you would handle asynchronous processing. You
          confidently say &quot;We will use Kafka.&quot; They ask &quot;Why not
          a simple message queue like SQS or RabbitMQ?&quot; You stammer. You
          chose Kafka because you have heard it is good, not because you reasoned
          about the trade-offs. The interviewer writes down: &quot;resume-driven
          development.&quot;
        </p>
        <BeforeAfter
          before={{
            title: "What the interviewer hears",
            content: (
              <div className="text-sm space-y-2">
                <div className="bg-muted/50 p-2 rounded text-xs font-mono">
                  <p>&quot;Let us use Kafka&quot;</p>
                  <p>&quot;We should use MongoDB&quot;</p>
                  <p>&quot;Redis for caching&quot;</p>
                  <p className="text-red-400 mt-1">
                    Buzzword bingo. No reasoning.
                  </p>
                </div>
              </div>
            ),
          }}
          after={{
            title: "What they want to hear",
            content: (
              <div className="text-sm space-y-2">
                <div className="bg-muted/50 p-2 rounded text-xs font-mono">
                  <p>&quot;We need ordered, replayable events&quot;</p>
                  <p>&quot;So Kafka fits because...&quot;</p>
                  <p>&quot;The trade-off is operational cost&quot;</p>
                  <p className="text-green-400 mt-1">
                    Reasoning drives the choice.
                  </p>
                </div>
              </div>
            ),
          }}
        />
      </FailureScenario>

      <WhyItBreaks title="Every technology choice is a bet — and bets need justification">
        <p className="text-sm text-muted-foreground">
          There is no universally &quot;best&quot; database, message queue, or
          protocol. Each technology makes a trade-off: it optimizes for some
          properties at the expense of others. SQL optimizes for consistency and
          query power over write throughput. REST optimizes for simplicity and
          universality over raw performance. Kafka optimizes for throughput and
          durability over routing flexibility. If you cannot articulate what you
          are giving up, you do not understand what you are gaining.
        </p>
        <div className="grid grid-cols-3 gap-3 mt-4">
          <MetricCounter label="Core trade-offs" value={5} trend="neutral" />
          <MetricCounter label="Decision dimensions" value={6} trend="neutral" />
          <MetricCounter label="Template steps" value={5} trend="neutral" />
        </div>
        <ConversationalCallout type="question">
          Next time you reach for a technology, ask yourself: what am I giving
          up by choosing this? If you cannot answer that question, you do not
          understand the technology well enough to use it in a design interview.
        </ConversationalCallout>
      </WhyItBreaks>

      <ConceptVisualizer title="The Decision-Making Flow">
        <p className="text-sm text-muted-foreground mb-4">
          Every technology decision in system design follows the same pattern.
          You do not pick a tool first and justify it later — you start with
          constraints and let them narrow the field.
        </p>
        <AnimatedFlow
          steps={[
            {
              id: "req",
              label: "Clarify Requirements",
              description: "What exactly must this component do?",
              icon: <Scale className="size-4" />,
            },
            {
              id: "constraints",
              label: "Identify Constraints",
              description: "Scale, latency, consistency, team",
              icon: <Shield className="size-4" />,
            },
            {
              id: "options",
              label: "Name 2-3 Options",
              description: "Never just one — that is not a decision",
              icon: <Database className="size-4" />,
            },
            {
              id: "tradeoffs",
              label: "Compare Trade-offs",
              description: "What do you gain? What do you lose?",
              icon: <ArrowRightLeft className="size-4" />,
            },
            {
              id: "decide",
              label: "Decide & Justify",
              description: "Pick one and explain why",
              icon: <Zap className="size-4" />,
            },
          ]}
          interval={2500}
        />
      </ConceptVisualizer>

      <ConceptVisualizer title="Trade-off Explorer — 5 Decisions You Must Know">
        <p className="text-sm text-muted-foreground mb-4">
          These five trade-offs come up in nearly every system design interview.
          Click each one to switch between topics, then click either side to
          expand and see the full list of pros and cons. For each trade-off, you
          should be able to argue <em>for either side</em> depending on the
          constraints you are given.
        </p>
        <TradeOffExplorer />
      </ConceptVisualizer>

      <ConceptVisualizer title="Decision Matrix — How Scores Shift With Context">
        <p className="text-sm text-muted-foreground mb-4">
          A weighted decision matrix makes trade-offs explicit. Watch how SQL and
          NoSQL score across different dimensions — the totals are close because
          both are good tools. The winner depends entirely on which dimensions
          carry the most weight for your specific system.
        </p>
        <DecisionMatrixViz />
        <ConversationalCallout type="tip">
          You would never literally fill out a scorecard in an interview. But the
          mental model is invaluable: &quot;Option A scores higher on scalability
          and write throughput, but Option B wins on operational simplicity. Given
          our small team, I would pick B.&quot;
        </ConversationalCallout>
      </ConceptVisualizer>

      <ConceptVisualizer title="The 'It Depends' Framework — 6 Decision Dimensions">
        <p className="text-sm text-muted-foreground mb-4">
          &quot;It depends&quot; is the right answer to every system design
          question — but only if you follow it with <strong>what</strong> it
          depends on. Click each dimension below to see a concrete example of how
          it changes the decision. Try to explore all six before moving on.
        </p>
        <ItDependsExplorer />
      </ConceptVisualizer>

      <AhaMoment
        question="Why is 'it depends' the most important phrase in system design?"
        answer={
          <p>
            Because it is honest. Every architecture is a set of trade-offs
            shaped by specific constraints. Twitter needs availability over
            consistency for its feed. A banking system needs consistency over
            availability for transactions. The technology is identical; the
            requirements are different. Saying &quot;it depends&quot; and then
            articulating the dependencies is what separates a senior engineer
            from a junior one. A junior says &quot;use Kafka.&quot; A senior says
            &quot;use Kafka because we need ordered event replay, and the
            trade-off of operational complexity is acceptable given our team size
            and SRE support.&quot;
          </p>
        }
      />

      <InteractiveDemo title="Trade-off Reasoning Simulator">
        {({ isPlaying, tick }) => {
          const scenarios = [
            {
              requirement: "Chat app with 1M concurrent users",
              good: "Kafka — ordered message log, replay for offline users who reconnect, massive throughput handles burst traffic",
              bad: "RabbitMQ — no replay means offline users miss messages permanently, throughput ceiling under high concurrency",
            },
            {
              requirement: "E-commerce checkout with inventory management",
              good: "SQL (PostgreSQL) — ACID transactions prevent overselling, strong consistency ensures accurate inventory counts",
              bad: "NoSQL (DynamoDB) — eventual consistency risks selling the last item to two buyers simultaneously",
            },
            {
              requirement: "Social media news feed for 100M users",
              good: "NoSQL (Cassandra) — denormalized feed per user, fast reads at scale, eventual consistency is invisible to users",
              bad: "SQL (PostgreSQL) — joining users, posts, follows, and likes on every feed load does not scale past millions",
            },
            {
              requirement: "Internal microservice mesh with 200 services",
              good: "gRPC — binary protocol is 5-10x faster than REST, strong contracts catch breaking changes at compile time",
              bad: "REST — JSON serialization overhead on millions of internal calls per second adds measurable latency",
            },
          ];
          const active = isPlaying ? tick % scenarios.length : 0;
          const scenario = scenarios[active];

          return (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Press play to cycle through real scenarios. For each one, notice
                how the requirement dictates which side of the trade-off wins.
                The same technology can be the right choice in one context and
                the wrong choice in another.
              </p>
              <div className="bg-muted/30 border border-border/50 p-3 rounded-lg">
                <p className="text-[10px] font-mono text-muted-foreground/50 uppercase tracking-wider mb-1">
                  Requirement
                </p>
                <p className="text-sm font-semibold">{scenario.requirement}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-emerald-500/5 border border-emerald-500/20 p-3 rounded-lg">
                  <p className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider mb-1">
                    Good fit
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {scenario.good}
                  </p>
                </div>
                <div className="bg-red-500/5 border border-red-500/20 p-3 rounded-lg">
                  <p className="text-[10px] font-semibold text-red-400 uppercase tracking-wider mb-1">
                    Poor fit
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {scenario.bad}
                  </p>
                </div>
              </div>
            </div>
          );
        }}
      </InteractiveDemo>

      <CorrectApproach title="The 5-Step Interview Template for Trade-off Discussions">
        <p className="text-sm text-muted-foreground mb-4">
          Follow this template every time you make a technology choice in an
          interview. It takes 30 seconds and completely transforms how the
          interviewer perceives your answer. Click each step to see it in action
          with a real example, or let it auto-advance.
        </p>
        <InterviewTemplateWalkthrough />
      </CorrectApproach>

      <BeforeAfter
        before={{
          title: "Junior-level answer",
          content: (
            <div className="text-sm space-y-2">
              <div className="bg-muted/50 p-2 rounded text-xs font-mono space-y-1">
                <p>&quot;For the database, I will use MongoDB.&quot;</p>
                <p>&quot;For messaging, Kafka.&quot;</p>
                <p>&quot;For caching, Redis.&quot;</p>
                <p className="text-red-400 mt-2">
                  Names technologies. No reasoning. No trade-offs discussed.
                </p>
              </div>
            </div>
          ),
        }}
        after={{
          title: "Senior-level answer",
          content: (
            <div className="text-sm space-y-2">
              <div className="bg-muted/50 p-2 rounded text-xs font-mono space-y-1">
                <p>
                  &quot;Our access pattern is key-based lookups at 50K RPS.
                  DynamoDB fits because...&quot;
                </p>
                <p>
                  &quot;We lose JOINs, but our data model doesn&apos;t need
                  them.&quot;
                </p>
                <p>
                  &quot;If we later need analytics, we would stream to
                  Redshift.&quot;
                </p>
                <p className="text-green-400 mt-2">
                  Requirements drive choice. Trade-offs acknowledged. Evolution
                  planned.
                </p>
              </div>
            </div>
          ),
        }}
      />

      <ConversationalCallout type="tip">
        Bonus points in interviews: after making a choice, mention what would
        change your mind. &quot;If we later discovered that our access patterns
        require complex analytical queries across this data, we might add a
        PostgreSQL read replica or pipe data to a data warehouse. But for the
        current requirements, the simpler solution is better.&quot; This shows
        you think about evolving systems, not frozen snapshots.
      </ConversationalCallout>

      <ConceptVisualizer title="Common Anti-Patterns in Trade-off Discussions">
        <p className="text-sm text-muted-foreground mb-4">
          These are the mistakes interviewers see most often. Recognizing them in
          your own reasoning is the first step to eliminating them from your
          answers.
        </p>
        <div className="space-y-2">
          {[
            {
              pattern: "Resume-Driven Development",
              desc: "Picking a technology because it looks good on your resume, not because it fits the problem. The interviewer sees through this immediately.",
              fix: "Always start with the requirement, not the tool. Let constraints narrow the options organically.",
            },
            {
              pattern: "Silver Bullet Thinking",
              desc: "Believing one technology is always the right choice. 'Always use PostgreSQL' or 'always use microservices' regardless of context.",
              fix: "Name one scenario where your preferred tool is the WRONG choice. If you cannot, you do not understand it deeply enough.",
            },
            {
              pattern: "Analysis Paralysis",
              desc: "Spending 10 minutes comparing options without making a decision. The interviewer wants you to commit and move forward.",
              fix: "Use the 2-minute rule: state options, compare briefly, pick one, justify it, and move on. You can always revisit later if needed.",
            },
            {
              pattern: "Ignoring Operational Cost",
              desc: "Choosing Kubernetes for a two-person startup or Kafka for 100 events per second. Over-engineering is as bad as under-engineering.",
              fix: "Always ask: can the team operate this in production at 3 AM? Simpler tools that the team understands beat powerful tools that nobody can debug.",
            },
          ].map((a) => (
            <div
              key={a.pattern}
              className="bg-muted/30 border border-border/50 p-3 rounded-lg"
            >
              <p className="text-xs font-semibold text-red-400 mb-0.5">
                {a.pattern}
              </p>
              <p className="text-[11px] text-muted-foreground mb-2">
                {a.desc}
              </p>
              <p className="text-[11px] text-muted-foreground">
                <span className="font-semibold text-emerald-400">Fix: </span>
                {a.fix}
              </p>
            </div>
          ))}
        </div>
      </ConceptVisualizer>

      <AhaMoment
        question="When is it okay to not discuss trade-offs?"
        answer={
          <p>
            Almost never in an interview context. Even &quot;obvious&quot;
            choices have trade-offs. Using HTTPS? Trade-off is latency overhead
            from TLS handshakes (~1-2 round trips). Using a load balancer?
            Trade-off is added complexity, cost, and a potential single point of
            failure unless you have redundant LBs. The habit of articulating
            trade-offs for every decision is what makes your design credible.
          </p>
        }
      />

      <AhaMoment
        question="What if the interviewer disagrees with my choice?"
        answer={
          <p>
            That is actually a good sign — it means they are engaging with your
            design. Do not get defensive. Say: &quot;That is a valid concern. If
            [their objection], then [alternative] would indeed be better because
            [reasoning]. For the current requirements though, I believe [your
            choice] is a better fit because [your reasoning].&quot; The
            interviewer often disagrees to test whether you can reason under
            pressure, not because your choice is wrong.
          </p>
        }
      />

      <KeyTakeaway
        points={[
          "Never name a technology without explaining why you chose it. 'Let's use X because Y' is the minimum bar.",
          "Master the 5 core trade-offs: SQL vs NoSQL, REST vs gRPC, consistency vs availability, monolith vs microservices, Kafka vs RabbitMQ.",
          "Every technology choice trades something for something else. If you cannot name what you are giving up, you do not understand the tool.",
          "'It depends' is the right start — but always follow with what it depends on: scale, consistency, latency, team, access patterns, failure modes.",
          "Use the 5-step template: state the requirement, name options, explain gains and losses, make a justified decision, state what would change your mind.",
          "Avoid the four anti-patterns: resume-driven development, silver bullet thinking, analysis paralysis, and ignoring operational cost.",
        ]}
      />
    </div>
  );
}
