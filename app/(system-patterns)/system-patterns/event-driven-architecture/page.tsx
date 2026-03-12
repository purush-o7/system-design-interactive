"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { TopicHero } from "@/components/topic-hero";
import { KeyTakeaway } from "@/components/key-takeaway";
import { AhaMoment } from "@/components/aha-moment";
import { ConversationalCallout } from "@/components/conversational-callout";
import { BeforeAfter } from "@/components/before-after";
import { Playground } from "@/components/playground";
import { FlowDiagram, type FlowNode, type FlowEdge } from "@/components/flow-diagram";
import { LiveChart } from "@/components/live-chart";
import { useSimulation } from "@/hooks/use-simulation";
import { cn } from "@/lib/utils";
import { Zap, Plus, Minus, Clock, ArrowRight, RotateCcw } from "lucide-react";
import { MarkerType } from "@xyflow/react";

type Subscriber = { id: string; label: string; speed: number; status: "healthy" | "warning" | "idle" };

const DEFAULT_SUBSCRIBERS: Subscriber[] = [
  { id: "email", label: "Email Service", speed: 80, status: "idle" },
  { id: "inventory", label: "Inventory Service", speed: 200, status: "idle" },
  { id: "analytics", label: "Analytics Service", speed: 400, status: "idle" },
];

const EXTRA_SUBSCRIBERS: Subscriber[] = [{ id: "shipping", label: "Shipping Service", speed: 150, status: "idle" }, { id: "loyalty", label: "Loyalty Service", speed: 300, status: "idle" }];

function EventBusPlayground() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>(DEFAULT_SUBSCRIBERS);
  const [eventPhase, setEventPhase] = useState<"idle" | "publishing" | "routing" | "processing" | "done">("idle");
  const [processingProgress, setProcessingProgress] = useState<Record<string, number>>({});
  const [latencyData, setLatencyData] = useState<Record<string, number>[]>([]);
  const [eventCount, setEventCount] = useState(0);

  const placeOrder = useCallback(() => {
    if (eventPhase !== "idle" && eventPhase !== "done") return;
    setEventPhase("publishing");
    setProcessingProgress({});

    setTimeout(() => {
      setEventPhase("routing");
      setTimeout(() => {
        setEventPhase("processing");
        const startTime = Date.now();

        subscribers.forEach((sub) => {
          const interval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(100, (elapsed / sub.speed) * 100);
            setProcessingProgress((prev) => ({ ...prev, [sub.id]: progress }));
            if (progress >= 100) clearInterval(interval);
          }, 50);

          setTimeout(() => {
            clearInterval(interval);
            setProcessingProgress((prev) => ({ ...prev, [sub.id]: 100 }));
          }, sub.speed);
        });

        const maxSpeed = Math.max(...subscribers.map((s) => s.speed));
        setTimeout(() => {
          setEventPhase("done");
          setEventCount((c) => c + 1);
          const newPoint: Record<string, number> = { event: eventCount + 1 };
          subscribers.forEach((sub) => {
            newPoint[sub.label] = sub.speed + Math.round(Math.random() * 30 - 15);
          });
          setLatencyData((prev) => [...prev.slice(-7), newPoint]);
        }, maxSpeed + 100);
      }, 400);
    }, 500);
  }, [eventPhase, subscribers, eventCount]);

  const addSubscriber = useCallback(() => {
    const available = EXTRA_SUBSCRIBERS.filter(
      (es) => !subscribers.find((s) => s.id === es.id)
    );
    if (available.length > 0) {
      setSubscribers((prev) => [...prev, available[0]]);
    }
  }, [subscribers]);

  const removeSubscriber = useCallback(() => {
    if (subscribers.length > 1) {
      setSubscribers((prev) => prev.slice(0, -1));
    }
  }, [subscribers]);

  const subscriberStatuses = subscribers.map((sub) => {
    const progress = processingProgress[sub.id] ?? 0;
    if (eventPhase === "processing" && progress < 100) return "warning";
    if (eventPhase === "done" || progress >= 100) return "healthy";
    return "idle";
  });

  const nodes: FlowNode[] = useMemo(() => {
    const subNodes: FlowNode[] = subscribers.map((sub, i) => ({
      id: sub.id,
      type: "serverNode",
      position: { x: 420, y: 20 + i * 90 },
      data: {
        label: sub.label,
        sublabel: processingProgress[sub.id] !== undefined
          ? `${Math.round(processingProgress[sub.id])}%`
          : `${sub.speed}ms`,
        status: subscriberStatuses[i],
        handles: { left: true, right: false, top: false, bottom: false },
      },
    }));

    return [
      {
        id: "order",
        type: "clientNode",
        position: { x: 0, y: (subscribers.length * 90) / 2 - 30 },
        data: {
          label: "Order Service",
          sublabel: eventPhase === "publishing" ? "Publishing..." : "Producer",
          status: eventPhase === "publishing" ? "warning" : "healthy",
          handles: { right: true, left: false, top: false, bottom: false },
        },
      },
      {
        id: "bus",
        type: "queueNode",
        position: { x: 210, y: (subscribers.length * 90) / 2 - 30 },
        data: {
          label: "Event Bus",
          sublabel: eventPhase === "routing" ? "Routing..." : "Kafka",
          status: eventPhase === "routing" ? "warning" : "healthy",
          handles: { left: true, right: true, top: false, bottom: false },
        },
      },
      ...subNodes,
    ];
  }, [subscribers, eventPhase, processingProgress, subscriberStatuses]);

  const edges: FlowEdge[] = useMemo(() => {
    const orderToBus: FlowEdge = {
      id: "order-bus",
      source: "order",
      target: "bus",
      animated: eventPhase === "publishing" || eventPhase === "routing",
      style: eventPhase === "publishing" || eventPhase === "routing"
        ? { stroke: "#8b5cf6", strokeWidth: 2 }
        : { stroke: "#6b7280", strokeWidth: 1.5 },
      markerEnd: { type: MarkerType.ArrowClosed, color: eventPhase === "publishing" ? "#8b5cf6" : "#6b7280" },
    };

    const busToSubs: FlowEdge[] = subscribers.map((sub) => {
      const progress = processingProgress[sub.id] ?? 0;
      const isActive = eventPhase === "routing" || (eventPhase === "processing" && progress < 100);
      const isDone = progress >= 100;
      return {
        id: `bus-${sub.id}`,
        source: "bus",
        target: sub.id,
        animated: isActive,
        style: {
          stroke: isDone ? "#10b981" : isActive ? "#8b5cf6" : "#6b7280",
          strokeWidth: isActive || isDone ? 2 : 1.5,
        },
        markerEnd: { type: MarkerType.ArrowClosed, color: isDone ? "#10b981" : isActive ? "#8b5cf6" : "#6b7280" },
      };
    });

    return [orderToBus, ...busToSubs];
  }, [subscribers, eventPhase, processingProgress]);

  const chartKeys = subscribers.map((s) => s.label);

  return (
    <Playground
      title="Event Bus Playground"
      canvasHeight="min-h-[340px]"
      controls={false}
      canvas={
        <div className="p-2 h-full">
          <FlowDiagram
            nodes={nodes}
            edges={edges}
            fitView
            interactive={false}
            allowDrag={false}
            minHeight={300}
          />
        </div>
      }
      explanation={
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={placeOrder}
              disabled={eventPhase === "publishing" || eventPhase === "routing" || eventPhase === "processing"}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium transition-all",
                eventPhase === "idle" || eventPhase === "done"
                  ? "bg-violet-500/20 text-violet-400 hover:bg-violet-500/30 border border-violet-500/30"
                  : "bg-muted/30 text-muted-foreground/40 border border-border/30 cursor-not-allowed"
              )}
            >
              <Zap className="size-4 inline mr-1.5" />
              Place Order
            </button>
            <button
              onClick={addSubscriber}
              disabled={subscribers.length >= DEFAULT_SUBSCRIBERS.length + EXTRA_SUBSCRIBERS.length}
              className="rounded-lg px-3 py-2 text-sm border border-border/30 bg-muted/20 text-muted-foreground hover:bg-muted/40 disabled:opacity-30 transition-all"
            >
              <Plus className="size-4 inline mr-1" />
              Add
            </button>
            <button
              onClick={removeSubscriber}
              disabled={subscribers.length <= 1}
              className="rounded-lg px-3 py-2 text-sm border border-border/30 bg-muted/20 text-muted-foreground hover:bg-muted/40 disabled:opacity-30 transition-all"
            >
              <Minus className="size-4 inline mr-1" />
              Remove
            </button>
          </div>

          <p className={cn("text-xs", eventPhase === "publishing" || eventPhase === "routing" ? "text-violet-400" : eventPhase === "processing" ? "text-amber-400" : eventPhase === "done" ? "text-emerald-400" : "text-muted-foreground")}>
            {eventPhase === "idle" && "Click \"Place Order\" to publish an OrderPlaced event to the bus."}
            {eventPhase === "publishing" && "Order Service is publishing an event..."}
            {eventPhase === "routing" && "Event Bus routing to all subscribers..."}
            {eventPhase === "processing" && "Subscribers processing at their own speeds..."}
            {eventPhase === "done" && "All processed! Try adding a subscriber, then sending another."}
          </p>

          {latencyData.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Processing Latency per Subscriber</p>
              <LiveChart
                type="latency"
                data={latencyData}
                dataKeys={{
                  x: "event",
                  y: chartKeys,
                  label: chartKeys,
                }}
                height={160}
                showLegend
              />
            </div>
          )}
        </div>
      }
    />
  );
}

function SyncVsAsyncComparison() {
  const sim = useSimulation({ intervalMs: 600, maxSteps: 12 });

  const syncServices = ["Order", "Inventory", "Email", "Response"];
  const asyncServices = ["Order", "Inventory", "Email", "Analytics"];

  const syncPhase = sim.tick;
  const asyncPhase = sim.tick;

  const syncTotalMs = 120 + 200 + 150;
  const asyncTotalMs = 120;

  const syncMsgs = ["Order receives request", "Order calls Inventory (blocking)...", "Inventory calls Email (blocking)...", "Inventory calls Email (blocking)...", "Email processing (blocking)...", "Email processing (blocking)...", "Email done, unwinds...", "Inventory done, unwinds...", "Order responds. Total: 470ms"];
  const asyncMsgs = ["Order receives request", "Order publishes OrderPlaced event", "Order responds immediately: 120ms", "Inventory processes...", "Email processes...", "Analytics processes...", "All done independently!"];

  return (
    <Playground
      title="Sync vs Async: Side by Side"
      simulation={sim}
      canvasHeight="min-h-[320px]"
      canvas={
        <div className="grid grid-cols-2 gap-4 p-4 h-full">
          {/* Sync side */}
          <div className="space-y-3">
            <div className="text-center">
              <span className="text-xs font-semibold text-red-400">Synchronous (Coupled)</span>
            </div>
            <div className="space-y-1.5">
              {syncServices.map((svc, i) => {
                const isActive = syncPhase >= i * 2 && syncPhase < (i + 1) * 2 + 1;
                const isDone = syncPhase > (i + 1) * 2;
                const isWaiting = syncPhase >= i * 2 + 1 && syncPhase < (i + 1) * 2 && i < 3;
                return (
                  <div key={svc} className="flex items-center gap-2">
                    {i > 0 && <ArrowRight className="size-3 text-muted-foreground/40 shrink-0" />}
                    <div
                      className={cn(
                        "flex-1 rounded-lg border px-3 py-2 text-center transition-all duration-500",
                        isActive ? "border-amber-500/40 bg-amber-500/10" :
                        isDone ? "border-emerald-500/30 bg-emerald-500/5" :
                        "border-border/30 bg-muted/10"
                      )}
                    >
                      <span className={cn(
                        "text-xs font-medium",
                        isActive ? "text-amber-400" : isDone ? "text-emerald-400" : "text-muted-foreground/50"
                      )}>
                        {svc}
                      </span>
                      {isActive && <span className="block text-[9px] text-amber-400/70 animate-pulse">blocking...</span>}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="text-center">
              <span className={cn(
                "text-xs font-mono",
                syncPhase >= 8 ? "text-red-400" : "text-muted-foreground/40"
              )}>
                {syncPhase >= 8 ? `${syncTotalMs}ms total` : "waiting..."}
              </span>
            </div>
          </div>

          {/* Async side */}
          <div className="space-y-3">
            <div className="text-center">
              <span className="text-xs font-semibold text-emerald-400">Async (Event-Driven)</span>
            </div>
            <div className="space-y-1.5">
              {asyncServices.map((svc, i) => {
                const isPublisher = i === 0;
                const publishDone = asyncPhase >= 2;
                const subscriberActive = !isPublisher && asyncPhase >= i + 2;
                const subscriberDone = !isPublisher && asyncPhase >= i + 3;
                return (
                  <div key={svc} className="flex items-center gap-2">
                    {i > 0 && <Zap className="size-3 text-violet-400/40 shrink-0" />}
                    <div
                      className={cn(
                        "flex-1 rounded-lg border px-3 py-2 text-center transition-all duration-500",
                        isPublisher && publishDone ? "border-emerald-500/30 bg-emerald-500/5" :
                        isPublisher && asyncPhase >= 1 ? "border-violet-500/30 bg-violet-500/10" :
                        subscriberDone ? "border-emerald-500/30 bg-emerald-500/5" :
                        subscriberActive ? "border-violet-500/30 bg-violet-500/10" :
                        "border-border/30 bg-muted/10"
                      )}
                    >
                      <span className={cn(
                        "text-xs font-medium",
                        (isPublisher && publishDone) || subscriberDone ? "text-emerald-400" :
                        (isPublisher && asyncPhase >= 1) || subscriberActive ? "text-violet-400" :
                        "text-muted-foreground/50"
                      )}>
                        {svc}
                      </span>
                      {!isPublisher && subscriberActive && !subscriberDone && (
                        <span className="block text-[9px] text-violet-400/70">parallel</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="text-center">
              <span className={cn(
                "text-xs font-mono",
                asyncPhase >= 2 ? "text-emerald-400" : "text-muted-foreground/40"
              )}>
                {asyncPhase >= 2 ? `${asyncTotalMs}ms response` : "waiting..."}
              </span>
            </div>
          </div>
        </div>
      }
      explanation={(state) => (
        <div className="space-y-3">
          <p className="text-xs font-medium">{syncMsgs[Math.min(state.tick, 8)] ?? syncMsgs[8]}</p>
          <p className="text-xs font-medium">{asyncMsgs[Math.min(state.tick, 6)] ?? asyncMsgs[6]}</p>
          <p className="text-xs text-muted-foreground">
            Sync waits for every downstream service. Async publishes an event and responds immediately while subscribers work in parallel.
          </p>
          {state.tick >= 8 && (
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
              <p className="text-xs text-emerald-400 font-medium">Async: {asyncTotalMs}ms vs Sync: {syncTotalMs}ms</p>
              <p className="text-[11px] text-muted-foreground mt-1">{Math.round(((syncTotalMs - asyncTotalMs) / syncTotalMs) * 100)}% faster perceived latency</p>
            </div>
          )}
        </div>
      )}
    />
  );
}

type DomainEvent = { id: number; type: string; payload: string; color: string };

const EVENT_LOG: DomainEvent[] = [
  { id: 1, type: "OrderCreated", payload: "cart: empty", color: "text-blue-400" },
  { id: 2, type: "ItemAdded", payload: "Laptop ($999)", color: "text-emerald-400" },
  { id: 3, type: "ItemAdded", payload: "Mouse ($29)", color: "text-emerald-400" },
  { id: 4, type: "ItemRemoved", payload: "Mouse ($29)", color: "text-red-400" },
  { id: 5, type: "CouponApplied", payload: "SAVE10 (-10%)", color: "text-violet-400" },
  { id: 6, type: "OrderCompleted", payload: "$899.10", color: "text-amber-400" },
];

function computeState(upToIndex: number) {
  const items: string[] = [];
  let total = 0;
  let status = "pending";
  let coupon = "";

  for (let i = 0; i <= upToIndex && i < EVENT_LOG.length; i++) {
    const evt = EVENT_LOG[i];
    switch (evt.type) {
      case "OrderCreated":
        break;
      case "ItemAdded":
        if (evt.payload.includes("Laptop")) { items.push("Laptop"); total += 999; }
        if (evt.payload.includes("Mouse")) { items.push("Mouse"); total += 29; }
        break;
      case "ItemRemoved":
        if (evt.payload.includes("Mouse")) {
          const idx = items.indexOf("Mouse");
          if (idx >= 0) items.splice(idx, 1);
          total -= 29;
        }
        break;
      case "CouponApplied":
        coupon = "SAVE10 (-10%)";
        total = Math.round(total * 0.9 * 100) / 100;
        break;
      case "OrderCompleted":
        status = "completed";
        break;
    }
  }

  return { items, total, status, coupon };
}

function EventSourcingDemo() {
  const [replayIndex, setReplayIndex] = useState(-1);
  const [isReplaying, setIsReplaying] = useState(false);

  const replay = useCallback(() => {
    setReplayIndex(-1);
    setIsReplaying(true);
    let idx = 0;
    const interval = setInterval(() => {
      setReplayIndex(idx);
      idx++;
      if (idx >= EVENT_LOG.length) {
        clearInterval(interval);
        setIsReplaying(false);
      }
    }, 700);
  }, []);

  const currentState = replayIndex >= 0 ? computeState(replayIndex) : null;

  return (
    <Playground
      title="Event Sourcing: Time Travel"
      controls={false}
      canvasHeight="min-h-[300px]"
      canvas={
        <div className="p-4 h-full flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={replay}
              disabled={isReplaying}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium transition-all border",
                isReplaying
                  ? "bg-muted/30 text-muted-foreground/40 border-border/30 cursor-not-allowed"
                  : "bg-violet-500/20 text-violet-400 hover:bg-violet-500/30 border-violet-500/30"
              )}
            >
              <RotateCcw className="size-4 inline mr-1.5" />
              Replay Events
            </button>
            {!isReplaying && replayIndex < 0 && (
              <span className="text-xs text-muted-foreground">Click to see state built from events</span>
            )}
          </div>

          {/* Event log */}
          <div className="space-y-1.5 flex-1 overflow-y-auto">
            {EVENT_LOG.map((evt, i) => {
              const isReached = i <= replayIndex;
              const isCurrent = i === replayIndex;
              return (
                <button
                  key={evt.id}
                  onClick={() => { if (!isReplaying) setReplayIndex(i); }}
                  className={cn(
                    "w-full flex items-center gap-3 rounded-lg border px-3 py-2 text-left transition-all duration-400",
                    isCurrent ? "border-violet-500/40 bg-violet-500/10 ring-1 ring-violet-500/20" :
                    isReached ? "border-emerald-500/20 bg-emerald-500/5" :
                    "border-border/20 bg-muted/10 opacity-40"
                  )}
                >
                  <span className={cn(
                    "text-[10px] font-mono w-6 shrink-0 text-center",
                    isReached ? "text-violet-400" : "text-muted-foreground/30"
                  )}>
                    #{evt.id}
                  </span>
                  <span className={cn(
                    "text-xs font-semibold flex-1",
                    isReached ? evt.color : "text-muted-foreground/40"
                  )}>
                    {evt.type}
                  </span>
                  <span className={cn(
                    "text-[10px] font-mono",
                    isReached ? "text-muted-foreground" : "text-muted-foreground/20"
                  )}>
                    {evt.payload}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      }
      explanation={
        <div className="space-y-4">
          <div>
            <h4 className="text-xs font-semibold text-violet-400 mb-2">Current State (Projection)</h4>
            {currentState ? (
              <div className="rounded-lg border border-violet-500/20 bg-violet-500/5 p-3 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Items:</span>
                  <span className="font-mono">{currentState.items.length > 0 ? currentState.items.join(", ") : "(empty)"}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Total:</span>
                  <span className="font-mono text-emerald-400">${currentState.total.toFixed(2)}</span>
                </div>
                {currentState.coupon && (
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Coupon:</span>
                    <span className="font-mono text-violet-400">{currentState.coupon}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Status:</span>
                  <span className={cn(
                    "font-mono",
                    currentState.status === "completed" ? "text-amber-400" : "text-blue-400"
                  )}>
                    {currentState.status}
                  </span>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-border/20 bg-muted/10 p-3">
                <p className="text-xs text-muted-foreground/50 text-center">No events replayed yet</p>
              </div>
            )}
          </div>

          <div className="h-px bg-border/30" />

          <p className="text-xs text-muted-foreground">
            Event sourcing stores every change as an immutable event. Current state is derived by replaying them.
            Click any event to &quot;time travel.&quot; This is how banking ledgers, Git, and Redux work.
          </p>
        </div>
      }
    />
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

      {/* Section 1: The problem */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">The Coupling Problem</h2>
        <p className="text-sm text-muted-foreground">
          Your PM wants email notifications when an order ships. In a request-driven architecture,
          the Order service calls Shipping, which calls Inventory, which... none of them know about
          notifications. You end up modifying <strong className="text-red-400">5 existing services</strong> to
          thread a notification call through the chain. Each change requires coordinated deploys across teams.
        </p>
        <BeforeAfter
          before={{
            title: "Request-Driven (Coupled)",
            content: (
              <div className="space-y-2">
                <p className="text-[11px] text-muted-foreground">
                  Order service directly calls each downstream service. Adding a consumer means changing the producer.
                </p>
                <div className="space-y-1">
                  {["Payment", "Shipping", "Analytics", "??? (next feature)"].map((svc, i) => {
                    const colorMap: Record<number, string> = { 0: "text-muted-foreground", 1: "text-muted-foreground", 2: "text-muted-foreground", 3: "text-red-400" };
                    return (
                      <div key={svc} className="flex items-center gap-2 text-[11px]">
                        <ArrowRight className="size-3 text-orange-400/60" />
                        <span className={cn("font-mono", colorMap[i] ?? "text-muted-foreground")}>
                          Order --&gt; {svc}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-[10px] text-red-400/60">Order service must change every time a consumer is added</p>
              </div>
            ),
          }}
          after={{
            title: "Event-Driven (Decoupled)",
            content: (
              <div className="space-y-2">
                <p className="text-[11px] text-muted-foreground">
                  Order publishes once. Zero knowledge of who listens.
                </p>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[11px]">
                    <Zap className="size-3 text-emerald-400" />
                    <span className="font-mono text-emerald-400">Order --&gt; &quot;OrderPlaced&quot;</span>
                  </div>
                  {["Payment", "Shipping", "Analytics", "New Feature"].map((svc) => (
                    <div key={svc} className="flex items-center gap-2 text-[11px] pl-5">
                      <Clock className="size-3 text-muted-foreground/40" />
                      <span className="font-mono text-muted-foreground/60">{svc} subscribes</span>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-emerald-400/60">Order service never changes</p>
              </div>
            ),
          }}
        />
      </section>

      {/* Section 2: Event Bus Playground */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Event Bus in Action</h2>
        <p className="text-sm text-muted-foreground">
          Producers publish events describing what happened. The event bus (Kafka, RabbitMQ, SNS)
          routes them to all interested subscribers. Each subscriber processes independently.
          Try adding and removing subscribers, then place an order to see fan-out in action.
        </p>
        <EventBusPlayground />
      </section>

      <AhaMoment
        question="Why do different subscribers take different amounts of time?"
        answer={
          <p>
            That is the beauty of decoupling. Each subscriber processes at its own pace.
            The Email Service just fires off an email (fast). Inventory checks stock levels
            and reserves items (medium). Analytics crunches numbers and updates dashboards
            (slow). None of them block each other. If Analytics falls behind, orders still
            flow and emails still send.
          </p>
        }
      />

      {/* Section 3: Sync vs Async */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Synchronous vs Asynchronous</h2>
        <p className="text-sm text-muted-foreground">
          Watch both architectures process the same order simultaneously. The synchronous chain
          blocks at each step. The async version publishes an event and responds immediately
          while subscribers work in parallel.
        </p>
        <SyncVsAsyncComparison />
      </section>

      <ConversationalCallout type="tip">
        A good rule of thumb: use synchronous calls when the caller needs an immediate response
        (user login, payment validation). Use events when the caller does not need to wait
        (send notification, update analytics, sync search index). Most real systems use both --
        even Netflix combines synchronous API calls with event streaming.
      </ConversationalCallout>

      {/* Section 4: Event Sourcing */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Event Sourcing: The Immutable Log</h2>
        <p className="text-sm text-muted-foreground">
          Instead of storing just the current state, event sourcing stores every change as an
          immutable event. The current state is a projection derived by replaying events.
          Click &quot;Replay Events&quot; to watch state being rebuilt, or click any event to time-travel.
        </p>
        <EventSourcingDemo />
      </section>

      <ConversationalCallout type="warning">
        Event-driven does not mean &quot;fire and forget.&quot; You still need dead-letter queues for
        unprocessable events, idempotent consumers for duplicate delivery, and monitoring for
        consumer lag. Kafka retains events on disk, but a consumer that crashes without
        committing its offset will re-process messages -- your consumers must handle duplicates.
      </ConversationalCallout>

      <AhaMoment
        question="If services are decoupled, how do you debug a failed order?"
        answer={
          <p>
            This is the real tradeoff. In request-driven systems, you get a stack trace. In
            event-driven systems, you need distributed tracing (Jaeger, Zipkin, Datadog). Every
            event carries a correlation ID so you can reconstruct the full journey. The debugging
            tooling is different, not absent -- but you must invest in it upfront or you will
            be flying blind.
          </p>
        }
      />

      <KeyTakeaway
        points={[
          "Event-driven architecture decouples producers from consumers -- adding a new consumer requires zero changes to the producer.",
          "The event bus (Kafka, RabbitMQ, SNS) fans out events to all subscribers, each processing at their own pace.",
          "Synchronous calls block the caller; async events let it respond immediately. Use sync when you need the answer now, async when you do not.",
          "Event sourcing stores every change as an immutable event. Current state is a projection you can rebuild or time-travel through.",
          "The tradeoff is observability: invest in distributed tracing, correlation IDs, dead-letter queues, and idempotent consumers.",
        ]}
      />
    </div>
  );
}
