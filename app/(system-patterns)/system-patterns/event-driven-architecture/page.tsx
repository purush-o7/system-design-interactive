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
import { Radio, Zap, ArrowRight, Inbox, Send, CheckCircle2 } from "lucide-react";

function EventBusViz() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((s) => (s + 1) % 10), 900);
    return () => clearInterval(t);
  }, []);

  const producers = [
    { name: "Order Svc", event: "OrderPlaced" },
    { name: "Payment Svc", event: "PaymentProcessed" },
  ];

  const consumers = [
    { name: "Email", subscribedTo: "OrderPlaced" },
    { name: "Analytics", subscribedTo: "OrderPlaced" },
    { name: "Shipping", subscribedTo: "PaymentProcessed" },
    { name: "Receipts", subscribedTo: "PaymentProcessed" },
  ];

  const activeProducer = tick < 5 ? 0 : 1;
  const eventInFlight = tick % 5 >= 1 && tick % 5 <= 3;
  const eventDelivered = tick % 5 >= 4;
  const activeEvent = producers[activeProducer].event;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
        {/* Producers */}
        <div className="space-y-2">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground/50 text-center mb-1">Producers</div>
          {producers.map((p, i) => (
            <div
              key={p.name}
              className={cn(
                "rounded-lg border px-3 py-2 text-center transition-all duration-500",
                activeProducer === i && tick % 5 >= 1
                  ? "border-blue-500/30 bg-blue-500/10"
                  : "border-border/30 bg-muted/20"
              )}
            >
              <div className="text-xs font-semibold">{p.name}</div>
              <div className={cn(
                "text-[10px] font-mono mt-0.5 transition-all duration-300",
                activeProducer === i && tick % 5 >= 1
                  ? "text-blue-400 opacity-100"
                  : "text-muted-foreground/30 opacity-50"
              )}>
                {p.event}
              </div>
            </div>
          ))}
        </div>

        {/* Event Bus */}
        <div className="flex flex-col items-center gap-2">
          <div className={cn(
            "rounded-xl border-2 px-4 py-6 flex flex-col items-center gap-1.5 transition-all duration-500",
            eventInFlight
              ? "border-violet-500/40 bg-violet-500/10 shadow-lg shadow-violet-500/5"
              : "border-border/40 bg-muted/20"
          )}>
            <Radio className={cn(
              "size-5 transition-colors",
              eventInFlight ? "text-violet-400" : "text-muted-foreground/40"
            )} />
            <span className="text-[10px] font-semibold">Event Bus</span>
            <span className="text-[9px] text-muted-foreground/50">Kafka</span>
          </div>
          {eventInFlight && (
            <div className="text-[10px] font-mono text-violet-400 animate-pulse">
              routing...
            </div>
          )}
        </div>

        {/* Consumers */}
        <div className="space-y-1.5">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground/50 text-center mb-1">Consumers</div>
          {consumers.map((c) => {
            const isTarget = c.subscribedTo === activeEvent;
            const isLit = isTarget && eventDelivered;
            return (
              <div
                key={c.name}
                className={cn(
                  "rounded-lg border px-2.5 py-1.5 text-center transition-all duration-500",
                  isLit
                    ? "border-emerald-500/30 bg-emerald-500/10"
                    : isTarget && eventInFlight
                    ? "border-yellow-500/20 bg-yellow-500/5"
                    : "border-border/20 bg-muted/10"
                )}
              >
                <div className={cn(
                  "text-xs font-medium transition-colors",
                  isLit ? "text-emerald-400" : "text-muted-foreground/60"
                )}>{c.name}</div>
                <div className="text-[9px] text-muted-foreground/30">{c.subscribedTo}</div>
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground/60 text-center">
        {tick % 5 === 0 && `${producers[activeProducer].name} about to publish...`}
        {tick % 5 === 1 && `Publishing "${activeEvent}" to the event bus`}
        {tick % 5 === 2 && "Event bus receives and persists the event"}
        {tick % 5 === 3 && `Routing to all subscribers of "${activeEvent}"`}
        {tick % 5 === 4 && "Each consumer processes independently, at its own pace"}
      </p>
    </div>
  );
}

function ChoreographyVsOrchestrationViz() {
  const [mode, setMode] = useState<"choreography" | "orchestration">("choreography");
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % 6), 1200);
    return () => clearInterval(t);
  }, []);

  const choreoSteps = [
    { from: "Order", event: "OrderPlaced", to: "Payment" },
    { from: "Payment", event: "PaymentDone", to: "Inventory" },
    { from: "Inventory", event: "Reserved", to: "Shipping" },
    { from: "Shipping", event: "Shipped", to: "Email" },
  ];

  const orchSteps = [
    { from: "Saga", action: "ProcessPayment", to: "Payment" },
    { from: "Saga", action: "ReserveStock", to: "Inventory" },
    { from: "Saga", action: "ScheduleShip", to: "Shipping" },
    { from: "Saga", action: "SendEmail", to: "Email" },
  ];

  const steps = mode === "choreography" ? choreoSteps : orchSteps;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={() => { setMode("choreography"); setStep(0); }}
          className={cn(
            "rounded-md px-3 py-1.5 text-[11px] font-medium transition-all border",
            mode === "choreography"
              ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
              : "bg-muted/20 border-border/30 text-muted-foreground/50 hover:text-muted-foreground"
          )}
        >
          Choreography
        </button>
        <button
          onClick={() => { setMode("orchestration"); setStep(0); }}
          className={cn(
            "rounded-md px-3 py-1.5 text-[11px] font-medium transition-all border",
            mode === "orchestration"
              ? "bg-violet-500/10 border-violet-500/30 text-violet-400"
              : "bg-muted/20 border-border/30 text-muted-foreground/50 hover:text-muted-foreground"
          )}
        >
          Orchestration
        </button>
      </div>

      <div className="space-y-1.5 px-2">
        {steps.map((s, i) => (
          <div
            key={`${mode}-${i}`}
            className={cn(
              "flex items-center gap-2 rounded-md border px-3 py-1.5 transition-all duration-500",
              step > i
                ? mode === "choreography"
                  ? "bg-blue-500/8 border-blue-500/20"
                  : "bg-violet-500/8 border-violet-500/20"
                : step === i
                ? "bg-muted/30 border-border/40 ring-1 ring-blue-500/15"
                : "bg-muted/10 border-border/20 opacity-40"
            )}
          >
            <span className="text-[11px] font-semibold w-14 shrink-0">{s.from}</span>
            <ArrowRight className="size-3 text-muted-foreground/40 shrink-0" />
            <span className={cn(
              "text-[10px] font-mono flex-1",
              step >= i
                ? mode === "choreography" ? "text-blue-400" : "text-violet-400"
                : "text-muted-foreground/30"
            )}>
              {mode === "choreography" ? (s as typeof choreoSteps[0]).event : (s as typeof orchSteps[0]).action}
            </span>
            <ArrowRight className="size-3 text-muted-foreground/40 shrink-0" />
            <span className="text-[11px] w-14 text-right shrink-0">{s.to}</span>
          </div>
        ))}
      </div>

      <p className="text-[11px] text-muted-foreground/60 text-center px-4">
        {mode === "choreography"
          ? "Each service reacts to events and emits its own. No central coordinator. More decoupled, harder to trace."
          : "A central Saga orchestrator tells each service what to do and handles failures. Easier to debug, more coupled."}
      </p>
    </div>
  );
}

export default function EventDrivenArchitecturePage() {
  return (
    <div className="space-y-8">
      <TopicHero
        title="Event-Driven Architecture"
        subtitle="Stop making every service know about every other service. Let them publish what happened and move on."
        difficulty="intermediate"
      />

      <FailureScenario title="Adding notifications means modifying 5 existing services">
        <p className="text-sm text-muted-foreground">
          Your product manager wants email notifications when an order ships. Sounds simple. But in
          your request-driven architecture, the Order service calls the Shipping service, which calls
          the Inventory service, which... none of them know about notifications. You end up modifying
          <strong className="text-red-400"> 5 existing services</strong> to thread a notification call through the chain. Each
          change requires coordinated deploys across teams.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          This exact problem is why LinkedIn built Apache Kafka in 2011. They had hundreds of
          point-to-point service integrations that became impossible to maintain. Kafka turned
          their architecture from a tangled web into a clean event backbone. Over 150,000
          organizations now use Kafka for this same reason.
        </p>
        <div className="flex items-center justify-center gap-3 py-4 flex-wrap">
          <ServerNode type="server" label="Order" sublabel="modified" status="warning" />
          <span className="text-muted-foreground">--&gt;</span>
          <ServerNode type="server" label="Payment" sublabel="modified" status="warning" />
          <span className="text-muted-foreground">--&gt;</span>
          <ServerNode type="server" label="Shipping" sublabel="modified" status="warning" />
          <span className="text-muted-foreground">--&gt;</span>
          <ServerNode type="server" label="Inventory" sublabel="modified" status="warning" />
          <span className="text-muted-foreground">--&gt;</span>
          <ServerNode type="server" label="Notification" sublabel="new" status="healthy" />
        </div>
      </FailureScenario>

      <WhyItBreaks title="Direct coupling creates a web of dependencies">
        <p className="text-sm text-muted-foreground">
          In request-driven architecture, each service must know the address and API contract of
          every service it calls. Adding a new downstream consumer means modifying the upstream
          producer. This creates tight coupling that compounds over time:
        </p>
        <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
          <li><strong>Every new feature requires modifying existing services</strong> -- the producer must learn about each new consumer</li>
          <li><strong>Chain failures cascade</strong> -- if Notification is slow, it slows Order through the entire call chain</li>
          <li><strong>Deployment coordination</strong> -- producer and consumer must be deployed together to stay compatible</li>
          <li><strong>Knowledge leaks everywhere</strong> -- the Order service should not need to know that analytics wants order data</li>
          <li><strong>Temporal coupling</strong> -- both producer and consumer must be online at the same time</li>
        </ul>
      </WhyItBreaks>

      <ConceptVisualizer title="The Event Bus — Decoupling in Action">
        <p className="text-sm text-muted-foreground mb-4">
          Producers publish events describing what happened. The event bus (Kafka, RabbitMQ, or
          SNS) routes them to all interested subscribers. Each subscriber processes independently.
          Adding a new consumer is a configuration change, not a code change.
        </p>
        <EventBusViz />
      </ConceptVisualizer>

      <ConceptVisualizer title="Request-Driven vs Event-Driven">
        <BeforeAfter
          before={{
            title: "Request-Driven (coupled)",
            content: (
              <div className="space-y-3">
                <p className="text-[11px] text-muted-foreground">
                  Order service directly calls each downstream service. N services = N calls to maintain.
                </p>
                <div className="space-y-1">
                  {["Payment", "Shipping", "Analytics", "??? (next feature)"].map((svc, i) => (
                    <div key={svc} className="flex items-center gap-2 text-[11px]">
                      <Send className="size-3 text-orange-400/60" />
                      <span className={cn(
                        "font-mono",
                        i === 3 ? "text-red-400" : "text-muted-foreground"
                      )}>
                        Order --&gt; {svc}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-red-400/60">
                  Order service must change every time a consumer is added
                </p>
              </div>
            ),
          }}
          after={{
            title: "Event-Driven (decoupled)",
            content: (
              <div className="space-y-3">
                <p className="text-[11px] text-muted-foreground">
                  Order service publishes once. Zero knowledge of who listens.
                </p>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[11px]">
                    <Zap className="size-3 text-emerald-400" />
                    <span className="font-mono text-emerald-400">Order --&gt; &quot;OrderPlaced&quot;</span>
                  </div>
                  {["Payment", "Shipping", "Analytics", "New Feature"].map((svc) => (
                    <div key={svc} className="flex items-center gap-2 text-[11px] pl-5">
                      <Inbox className="size-3 text-muted-foreground/40" />
                      <span className="font-mono text-muted-foreground/60">{svc} subscribes</span>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-emerald-400/60">
                  Order service never changes
                </p>
              </div>
            ),
          }}
        />
      </ConceptVisualizer>

      <ConceptVisualizer title="How Event Propagation Works">
        <p className="text-sm text-muted-foreground mb-4">
          In Kafka, producers write events to topics. Each topic can have multiple partitions for
          parallel processing. Consumer groups ensure each event is processed exactly once per group,
          while multiple groups each get their own copy. Kafka achieved 605 MB/s throughput in
          recent benchmarks.
        </p>
        <AnimatedFlow
          steps={[
            { id: "produce", label: "Produce Event", description: "Service publishes an immutable fact", icon: <Send className="size-4" /> },
            { id: "topic", label: "Topic + Partition", description: "Event lands in an ordered, durable log", icon: <Radio className="size-4" /> },
            { id: "route", label: "Fan Out", description: "Each consumer group gets its own copy", icon: <Zap className="size-4" /> },
            { id: "consume", label: "Process", description: "Each consumer processes at its own pace", icon: <Inbox className="size-4" /> },
            { id: "ack", label: "Commit Offset", description: "Consumer confirms progress; can resume from here", icon: <CheckCircle2 className="size-4" /> },
          ]}
          interval={1800}
        />
      </ConceptVisualizer>

      <CorrectApproach title="Choreography vs Orchestration">
        <p className="text-sm text-muted-foreground mb-4">
          When multiple services must coordinate, you have two patterns. Toggle between them
          to see the difference in how an order flows through your system.
        </p>
        <ChoreographyVsOrchestrationViz />
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="rounded-lg border bg-muted/20 p-3">
            <h4 className="text-xs font-semibold text-blue-400 mb-1">Choreography</h4>
            <ul className="text-[11px] text-muted-foreground space-y-1">
              <li>No single point of failure</li>
              <li>Services are truly independent</li>
              <li>Harder to see the full workflow</li>
              <li>Good for simple event chains</li>
            </ul>
          </div>
          <div className="rounded-lg border bg-muted/20 p-3">
            <h4 className="text-xs font-semibold text-violet-400 mb-1">Orchestration</h4>
            <ul className="text-[11px] text-muted-foreground space-y-1">
              <li>Central view of the workflow</li>
              <li>Easier to handle compensation</li>
              <li>Orchestrator is a coupling point</li>
              <li>Good for complex business processes</li>
            </ul>
          </div>
        </div>
      </CorrectApproach>

      <InteractiveDemo title="Event Flow Tracer">
        {({ isPlaying, tick }) => {
          const events = [
            { time: "10:00:01.123", event: "OrderPlaced", producer: "Order", consumers: ["Payment", "Analytics", "Search"] },
            { time: "10:00:01.456", event: "PaymentProcessed", producer: "Payment", consumers: ["Shipping", "Email"] },
            { time: "10:00:02.789", event: "InventoryReserved", producer: "Inventory", consumers: ["Shipping"] },
            { time: "10:00:03.012", event: "ShipmentCreated", producer: "Shipping", consumers: ["Email", "Tracking"] },
          ];
          const active = isPlaying ? Math.min(tick % 6, events.length) : 0;

          return (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Press play to trace an order through the event-driven pipeline.
                Each event carries a correlation ID (<code className="text-[10px] bg-muted px-1 rounded font-mono">ord-7f3a</code>) for distributed tracing.
              </p>
              <div className="space-y-1.5">
                {events.map((e, i) => (
                  <div
                    key={e.event}
                    className={cn(
                      "rounded-lg border px-3 py-2 transition-all duration-500",
                      i < active
                        ? "bg-emerald-500/8 border-emerald-500/20"
                        : i === active && isPlaying
                        ? "bg-blue-500/8 border-blue-500/20 ring-1 ring-blue-500/15"
                        : "bg-muted/10 border-border/30 opacity-40"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        "text-[10px] font-mono w-24 shrink-0",
                        i < active ? "text-muted-foreground" : "text-transparent"
                      )}>
                        {e.time}
                      </span>
                      <span className={cn(
                        "text-xs font-semibold flex-1",
                        i < active ? "text-emerald-400" : i === active && isPlaying ? "text-blue-400" : ""
                      )}>
                        {e.event}
                      </span>
                      <span className="text-[10px] text-muted-foreground/50">
                        {e.producer}
                      </span>
                    </div>
                    {i < active && (
                      <div className="flex gap-1.5 mt-1 pl-[108px]">
                        {e.consumers.map((c) => (
                          <span key={c} className="text-[9px] rounded bg-emerald-500/10 text-emerald-400/70 px-1.5 py-0.5">
                            {c}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {active >= events.length && (
                <ConversationalCallout type="question">
                  Notice how each event triggered independent downstream processing? The Order
                  service never waited for Email or Analytics. If Email was down, orders would
                  still flow. That is the power of decoupling.
                </ConversationalCallout>
              )}
            </div>
          );
        }}
      </InteractiveDemo>

      <AhaMoment
        question="If services are decoupled, how do you debug a failed order?"
        answer={
          <p>
            This is the real tradeoff. In request-driven systems, you get a stack trace. In event-driven
            systems, you need distributed tracing tools like Jaeger, Zipkin, or Datadog. Every event
            carries a correlation ID so you can reconstruct the full journey across services. The
            debugging tooling is different, not absent -- but you must invest in it upfront or you
            will be flying blind. LinkedIn, which created Kafka, also built extensive tracing
            infrastructure to make event flows observable.
          </p>
        }
      />

      <ConversationalCallout type="warning">
        Event-driven does not mean &quot;fire and forget.&quot; You still need to handle failures:
        dead-letter queues for events that cannot be processed, idempotent consumers for duplicate
        delivery, and monitoring for consumer lag. Ignoring these leads to silent data loss.
        Kafka retains events on disk by default, but a consumer that crashes without committing
        its offset will re-process messages -- your consumers must handle duplicates gracefully.
      </ConversationalCallout>

      <ConversationalCallout type="tip">
        A good rule of thumb: use synchronous calls when the caller needs an immediate response
        (user login, payment validation). Use events when the caller does not need to wait for the
        result (send notification, update analytics, sync search index). Most real systems
        use a mix of both -- even Netflix combines synchronous API calls with event streaming.
      </ConversationalCallout>

      <KeyTakeaway
        points={[
          "Event-driven architecture decouples producers from consumers -- adding a new consumer requires zero changes to the producer.",
          "Apache Kafka, used by 150,000+ organizations, stores events as an immutable log that consumers read at their own pace.",
          "Choreography (each service reacts to events) gives maximum decoupling. Orchestration (a central saga coordinator) gives easier debugging and compensation.",
          "The tradeoff is observability: you need distributed tracing, correlation IDs, and dead-letter queues to debug event flows.",
          "Use synchronous calls when the caller needs an immediate response; use events when it does not. Most systems use a mix of both.",
        ]}
      />
    </div>
  );
}
