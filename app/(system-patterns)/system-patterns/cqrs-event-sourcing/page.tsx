"use client";

import { useState, useEffect } from "react";
import { TopicHero } from "@/components/topic-hero";
import { FailureScenario } from "@/components/failure-scenario";
import { WhyItBreaks } from "@/components/why-it-breaks";
import { ConceptVisualizer } from "@/components/concept-visualizer";
import { CorrectApproach } from "@/components/correct-approach";
import { KeyTakeaway } from "@/components/key-takeaway";
import { AnimatedFlow } from "@/components/animated-flow";
import { ServerNode } from "@/components/server-node";
import { BeforeAfter } from "@/components/before-after";
import { InteractiveDemo } from "@/components/interactive-demo";
import { AhaMoment } from "@/components/aha-moment";
import { ConversationalCallout } from "@/components/conversational-callout";
import { cn } from "@/lib/utils";
import { PenLine, Search, Database, ArrowRight, RotateCcw, ListOrdered, Clock, CheckCircle2 } from "lucide-react";

function CqrsSplitViz() {
  const [mode, setMode] = useState<"command" | "query">("command");
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => {
      setStep((s) => {
        if (s >= 5) {
          setMode((m) => m === "command" ? "query" : "command");
          return 0;
        }
        return s + 1;
      });
    }, 1200);
    return () => clearInterval(t);
  }, []);

  const commandSteps = [
    { label: "Client sends PlaceOrder command", active: step >= 1 },
    { label: "Command handler validates business rules", active: step >= 2 },
    { label: "Writes to normalized write database", active: step >= 3 },
    { label: "Publishes OrderPlaced event", active: step >= 4 },
    { label: "Read side projects denormalized view", active: step >= 5 },
  ];

  const querySteps = [
    { label: "Client sends GetOrderHistory query", active: step >= 1 },
    { label: "Query hits optimized read model", active: step >= 2 },
    { label: "Denormalized view returns instantly", active: step >= 3 },
    { label: "No joins, no locks, no write contention", active: step >= 4 },
    { label: "Response in < 5ms", active: step >= 5 },
  ];

  const steps_ = mode === "command" ? commandSteps : querySteps;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-center gap-3">
        <div className={cn(
          "flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold transition-all",
          mode === "command"
            ? "bg-blue-500/15 text-blue-400 ring-1 ring-blue-500/20"
            : "bg-muted/20 text-muted-foreground/40"
        )}>
          <PenLine className="size-3" /> Write Path
        </div>
        <div className={cn(
          "flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold transition-all",
          mode === "query"
            ? "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/20"
            : "bg-muted/20 text-muted-foreground/40"
        )}>
          <Search className="size-3" /> Read Path
        </div>
      </div>

      <div className="space-y-1.5">
        {steps_.map((s, i) => (
          <div
            key={`${mode}-${i}`}
            className={cn(
              "flex items-center gap-2.5 rounded-md border px-3 py-1.5 transition-all duration-500",
              s.active
                ? mode === "command"
                  ? "bg-blue-500/8 border-blue-500/20"
                  : "bg-emerald-500/8 border-emerald-500/20"
                : "bg-muted/10 border-border/20 opacity-30"
            )}
          >
            <span className={cn(
              "text-[10px] font-mono font-bold w-5 text-center",
              s.active
                ? mode === "command" ? "text-blue-400" : "text-emerald-400"
                : "text-muted-foreground/30"
            )}>
              {i + 1}
            </span>
            <span className={cn(
              "text-[11px] transition-colors",
              s.active ? "text-muted-foreground" : "text-muted-foreground/30"
            )}>
              {s.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function EventReplayViz() {
  const [replayTo, setReplayTo] = useState(6);
  const [isReplaying, setIsReplaying] = useState(false);
  const [displayedEvents, setDisplayedEvents] = useState(6);

  const events = [
    { id: 1, type: "AccountCreated", data: "+$0", balance: 0, time: "Jan 1, 9:00am" },
    { id: 2, type: "MoneyDeposited", data: "+$1,000", balance: 1000, time: "Jan 1, 9:05am" },
    { id: 3, type: "MoneyWithdrawn", data: "-$200", balance: 800, time: "Jan 2, 2:30pm" },
    { id: 4, type: "MoneyDeposited", data: "+$500", balance: 1300, time: "Jan 5, 11:00am" },
    { id: 5, type: "MoneyWithdrawn", data: "-$50", balance: 1250, time: "Jan 7, 3:15pm" },
    { id: 6, type: "MoneyWithdrawn", data: "-$300", balance: 950, time: "Jan 10, 10:00am" },
  ];

  useEffect(() => {
    if (isReplaying) {
      setDisplayedEvents(0);
      let current = 0;
      const t = setInterval(() => {
        current++;
        if (current > replayTo) {
          clearInterval(t);
          setIsReplaying(false);
          return;
        }
        setDisplayedEvents(current);
      }, 500);
      return () => clearInterval(t);
    }
  }, [isReplaying, replayTo]);

  const currentBalance = displayedEvents > 0 ? events[displayedEvents - 1]?.balance ?? 0 : 0;
  const targetEvent = events[replayTo - 1];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="text-[11px] text-muted-foreground/60">Replay to event:</span>
        <input
          type="range"
          min={1}
          max={6}
          value={replayTo}
          onChange={(e) => { setReplayTo(Number(e.target.value)); setDisplayedEvents(Number(e.target.value)); }}
          className="flex-1 accent-violet-500 h-1.5 rounded-full cursor-pointer"
        />
        <span className="text-[11px] font-mono text-violet-400">#{replayTo}</span>
        <button
          onClick={() => setIsReplaying(true)}
          className="rounded-md border border-violet-500/30 bg-violet-500/10 px-2.5 py-1 text-[11px] font-medium text-violet-400 hover:bg-violet-500/20 transition-colors"
        >
          <RotateCcw className="size-3 inline mr-1" />
          Replay
        </button>
      </div>

      <div className="space-y-1">
        {events.map((e, i) => (
          <div
            key={e.id}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-1.5 transition-all duration-300 border",
              i < displayedEvents
                ? i === displayedEvents - 1
                  ? "bg-violet-500/10 border-violet-500/20"
                  : "bg-muted/20 border-border/30"
                : "bg-muted/5 border-border/10 opacity-25"
            )}
          >
            <span className="text-[9px] font-mono text-muted-foreground/40 w-4">#{e.id}</span>
            <span className={cn(
              "text-[11px] font-semibold flex-1",
              i < displayedEvents ? "text-foreground" : "text-muted-foreground/30"
            )}>
              {e.type}
            </span>
            <span className={cn(
              "text-[10px] font-mono w-14 text-right",
              e.data.startsWith("+") ? "text-emerald-400" : "text-red-400",
              i >= displayedEvents && "opacity-30"
            )}>
              {e.data}
            </span>
            <span className="text-[9px] text-muted-foreground/40 w-24 text-right hidden sm:block">{e.time}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between rounded-lg border bg-muted/20 px-4 py-2.5">
        <div>
          <div className="text-[10px] text-muted-foreground/50">Current Balance</div>
          <div className="text-lg font-mono font-bold">${currentBalance.toLocaleString()}</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-muted-foreground/50">State as of</div>
          <div className="text-[11px] font-mono text-muted-foreground">
            {displayedEvents > 0 ? events[displayedEvents - 1]?.time : "—"}
          </div>
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground/60 text-center">
        Drag the slider to travel back in time. In a traditional database, this history is lost after each UPDATE.
        Event sourcing preserves every state change forever.
      </p>
    </div>
  );
}

export default function CqrsEventSourcingPage() {
  return (
    <div className="space-y-8">
      <TopicHero
        title="CQRS & Event Sourcing"
        subtitle="When your read-heavy analytics dashboard and your write-heavy transaction system fight over the same database, both lose."
        difficulty="advanced"
      />

      <FailureScenario title="Analytics dashboard grinds transactions to a halt">
        <p className="text-sm text-muted-foreground">
          Your e-commerce platform has a single database. The transaction system writes thousands of
          orders per second. The analytics dashboard runs complex aggregation queries across millions
          of rows. <strong className="text-red-400">The dashboard&apos;s heavy read queries lock rows that the transaction
          system needs to write to.</strong> Checkout latency spikes to 8 seconds. Meanwhile, the
          dashboard times out because the write load keeps invalidating its query plans.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          This is the exact problem that led Microsoft to formalize the CQRS pattern in their Azure
          Architecture Center. When reads and writes have fundamentally different access patterns,
          forcing them through one model creates contention that no amount of indexing can fix.
        </p>
        <div className="flex items-center justify-center gap-4 py-4">
          <div className="flex flex-col items-center gap-1">
            <ServerNode type="server" label="Transactions" sublabel="5,000 writes/s" status="warning" />
          </div>
          <div className="flex flex-col items-center gap-1">
            <ServerNode type="database" label="Single DB" sublabel="Lock contention" status="unhealthy" />
          </div>
          <div className="flex flex-col items-center gap-1">
            <ServerNode type="server" label="Analytics" sublabel="Heavy reads" status="warning" />
          </div>
        </div>
      </FailureScenario>

      <WhyItBreaks title="Reads and writes have fundamentally different needs">
        <p className="text-sm text-muted-foreground">
          A single database model forces you to optimize for one access pattern at the expense
          of the other:
        </p>
        <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
          <li><strong>Write optimization</strong> means normalized tables, minimal indexes -- fast inserts, slow queries</li>
          <li><strong>Read optimization</strong> means denormalized views, many indexes -- fast queries, slow inserts</li>
          <li><strong>Lock contention</strong> -- complex read queries hold locks that block writes, and vice versa</li>
          <li><strong>Scaling conflict</strong> -- reads want many replicas, writes want a single primary with fast disk I/O</li>
          <li><strong>Schema rigidity</strong> -- adding a column for reads may break write performance with index maintenance overhead</li>
        </ul>
      </WhyItBreaks>

      <ConceptVisualizer title="CQRS: Separate the Read and Write Paths">
        <p className="text-sm text-muted-foreground mb-4">
          Command Query Responsibility Segregation splits your application into two sides:
          the <strong>command side</strong> handles writes and the <strong>query side</strong> handles
          reads. Each side can use a different data model, a different database engine, and
          scale independently. Watch both paths animate below.
        </p>
        <CqrsSplitViz />
      </ConceptVisualizer>

      <ConceptVisualizer title="The CQRS Architecture">
        <BeforeAfter
          before={{
            title: "Traditional (single model)",
            content: (
              <div className="flex flex-col items-center gap-2">
                <ServerNode type="server" label="Application" status="warning" />
                <span className="text-[10px] text-muted-foreground">reads + writes = contention</span>
                <ServerNode type="database" label="One Database" status="warning" />
                <div className="text-[9px] text-muted-foreground/50 text-center mt-1">
                  Same indexes serve both<br />read queries and write operations
                </div>
              </div>
            ),
          }}
          after={{
            title: "CQRS (separated)",
            content: (
              <div className="flex gap-4">
                <div className="flex flex-col items-center gap-1.5">
                  <div className="text-[10px] font-semibold text-blue-400">Commands</div>
                  <ServerNode type="server" label="Write API" status="healthy" />
                  <ServerNode type="database" label="PostgreSQL" sublabel="Normalized" status="healthy" />
                </div>
                <div className="flex flex-col items-center justify-center">
                  <div className="text-[9px] text-muted-foreground/40 rotate-0">events</div>
                  <ArrowRight className="size-3 text-muted-foreground/30" />
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <div className="text-[10px] font-semibold text-emerald-400">Queries</div>
                  <ServerNode type="server" label="Read API" status="healthy" />
                  <ServerNode type="database" label="Elasticsearch" sublabel="Denormalized" status="healthy" />
                </div>
              </div>
            ),
          }}
        />
      </ConceptVisualizer>

      <ConceptVisualizer title="The CQRS Data Flow">
        <p className="text-sm text-muted-foreground mb-4">
          Commands mutate state on the write side. Changes are published as domain events. The read side
          consumes those events and updates its own optimized projections. Reads never touch the write
          database -- eliminating contention entirely.
        </p>
        <AnimatedFlow
          steps={[
            { id: "command", label: "Command", description: "Client sends PlaceOrder", icon: <PenLine className="size-4" /> },
            { id: "validate", label: "Validate", description: "Business rules enforced", icon: <CheckCircle2 className="size-4" /> },
            { id: "write", label: "Write Store", description: "Persisted to write DB", icon: <Database className="size-4" /> },
            { id: "publish", label: "Publish Event", description: "OrderPlaced emitted", icon: <ArrowRight className="size-4" /> },
            { id: "project", label: "Projection", description: "Read model updated async", icon: <ListOrdered className="size-4" /> },
            { id: "query", label: "Query", description: "Clients read fast views", icon: <Search className="size-4" /> },
          ]}
          interval={1600}
        />
      </ConceptVisualizer>

      <CorrectApproach title="Event Sourcing: Store Events, Not State">
        <p className="text-sm text-muted-foreground mb-4">
          Instead of storing the current state of an entity, event sourcing stores the sequence of
          events that produced it. The current state is derived by replaying the event log. This is
          how banking systems have worked for centuries -- your bank statement is a log of transactions,
          not just a balance. The event store is the single source of truth.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-lg border bg-muted/20 p-3">
            <h4 className="text-xs font-semibold text-orange-400 mb-2 flex items-center gap-1.5">
              <Database className="size-3" /> Traditional: Store Current State
            </h4>
            <div className="text-[11px] text-muted-foreground bg-muted/30 p-2.5 rounded font-mono">
              UPDATE accounts SET balance = 950<br />
              WHERE id = 42;
            </div>
            <p className="text-[10px] text-muted-foreground/50 mt-1.5">
              Previous balance is lost. No audit trail. Cannot answer &quot;what was the balance yesterday?&quot;
            </p>
          </div>
          <div className="rounded-lg border bg-muted/20 p-3">
            <h4 className="text-xs font-semibold text-emerald-400 mb-2 flex items-center gap-1.5">
              <ListOrdered className="size-3" /> Event Sourcing: Store What Happened
            </h4>
            <div className="text-[11px] text-muted-foreground bg-muted/30 p-2.5 rounded font-mono space-y-0.5">
              <div>INSERT AccountCreated: $0</div>
              <div>INSERT MoneyDeposited: +$1000</div>
              <div>INSERT MoneyWithdrawn: -$50</div>
            </div>
            <p className="text-[10px] text-emerald-400/60 mt-1.5">
              Full history preserved. Replay to any point in time.
            </p>
          </div>
        </div>
      </CorrectApproach>

      <ConceptVisualizer title="Event Replay — Time Travel for Your Data">
        <p className="text-sm text-muted-foreground mb-4">
          The killer feature of event sourcing: you can reconstruct state at any point in time by
          replaying events up to that moment. Drag the slider to travel back in time, or click
          Replay to watch the account balance rebuild from scratch.
        </p>
        <EventReplayViz />
      </ConceptVisualizer>

      <InteractiveDemo title="CQRS in Action: Write vs Read Performance">
        {({ isPlaying, tick }) => {
          const elapsed = isPlaying ? tick % 10 : 0;
          const writeOps = elapsed * 500;
          const readOps = elapsed * 5000;
          const writeLatency = isPlaying ? 12 : 0;
          const readLatency = isPlaying ? 2 : 0;
          const traditionalReadLatency = isPlaying ? Math.min(800, 50 + elapsed * 80) : 0;

          return (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Press play to simulate a CQRS system under load. The write side handles 500 commands/s
                while the read side serves 5,000 queries/s -- from separate, optimized stores.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border bg-blue-500/5 border-blue-500/20 p-3">
                  <div className="text-[10px] font-semibold text-blue-400 mb-2 flex items-center gap-1.5">
                    <PenLine className="size-3" /> Write Side (PostgreSQL)
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-muted-foreground/60">Operations</span>
                      <span className="font-mono">{writeOps.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-muted-foreground/60">Latency</span>
                      <span className="font-mono text-blue-400">{writeLatency}ms</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-muted-foreground/60">Contention</span>
                      <span className="font-mono text-emerald-400">None</span>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg border bg-emerald-500/5 border-emerald-500/20 p-3">
                  <div className="text-[10px] font-semibold text-emerald-400 mb-2 flex items-center gap-1.5">
                    <Search className="size-3" /> Read Side (Elasticsearch)
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-muted-foreground/60">Operations</span>
                      <span className="font-mono">{readOps.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-muted-foreground/60">Latency</span>
                      <span className="font-mono text-emerald-400">{readLatency}ms</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-muted-foreground/60">Contention</span>
                      <span className="font-mono text-emerald-400">None</span>
                    </div>
                  </div>
                </div>
              </div>
              {isPlaying && elapsed > 3 && (
                <div className="rounded-lg border border-orange-500/20 bg-orange-500/5 px-3 py-2">
                  <div className="text-[11px] text-orange-400">
                    <strong>Without CQRS:</strong> Read latency would be{" "}
                    <span className="font-mono">{traditionalReadLatency}ms</span> due to lock contention
                    from write operations. The write side would also degrade as read queries hold shared locks.
                  </div>
                </div>
              )}
            </div>
          );
        }}
      </InteractiveDemo>

      <AhaMoment
        question="If the read side is eventually consistent, won't users see stale data?"
        answer={
          <p>
            Yes -- and that is usually fine. When you post a tweet, it does not need to appear in
            everyone&apos;s timeline within the same millisecond. A few hundred milliseconds of delay
            is invisible to humans. The key insight is that <em>most systems are already eventually
            consistent</em> (database replication lag, CDN cache TTL, browser caching). CQRS just
            makes this explicit. For the rare cases where strong consistency matters (bank balance
            display after a transfer), the write side can return the updated value directly.
          </p>
        }
      />

      <ConversationalCallout type="warning">
        CQRS adds significant complexity. You now maintain two data models, handle event versioning
        (what happens when an event schema changes?), deal with eventual consistency in the UI, and
        need infrastructure for event publishing. Only use CQRS when read and write patterns are
        genuinely different enough to justify the overhead. For simple CRUD applications, a single
        model is the correct choice.
      </ConversationalCallout>

      <ConversationalCallout type="tip">
        Event sourcing shines in domains with audit requirements: banking, healthcare, e-commerce
        order history, ride-sharing trip logs. If regulators or customers might ask &quot;what
        happened and when?&quot; event sourcing gives you the answer for free. The event store is
        your audit log, your debugging tool, and your data recovery mechanism all in one.
      </ConversationalCallout>

      <KeyTakeaway
        points={[
          "CQRS separates read and write operations into different models, each optimized and scaled independently -- eliminating lock contention.",
          "The write side processes commands and emits domain events; the read side consumes those events and maintains denormalized views (projections).",
          "Event sourcing stores the sequence of state changes rather than current state, enabling full audit trails, temporal queries, and event replay.",
          "The read side is eventually consistent -- there is a small delay between a write and when it appears in read views, typically milliseconds.",
          "CQRS + Event Sourcing is powerful but complex. Use it when read/write patterns diverge significantly; avoid it for simple CRUD.",
        ]}
      />
    </div>
  );
}
