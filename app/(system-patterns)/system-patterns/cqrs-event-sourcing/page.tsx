"use client";

import { useState, useMemo, useCallback } from "react";
import { TopicHero } from "@/components/topic-hero";
import { KeyTakeaway } from "@/components/key-takeaway";
import { AhaMoment } from "@/components/aha-moment";
import { ConversationalCallout } from "@/components/conversational-callout";
import { Playground } from "@/components/playground";
import { FlowDiagram, type FlowNode, type FlowEdge } from "@/components/flow-diagram";
import { LiveChart } from "@/components/live-chart";
import { useSimulation } from "@/hooks/use-simulation";
import { cn } from "@/lib/utils";
import {
  PenLine, Search, Database, RotateCcw, Clock,
  ShoppingCart, Package, Minus, Plus, CreditCard,
} from "lucide-react";

// ─── helpers ──────────────────────────────────────────────────────────────────

function n(id: string, type: string, x: number, y: number, data: Record<string, unknown>): FlowNode {
  return { id, type, position: { x, y }, data: data as FlowNode["data"] };
}

// ─── Section 1: CQRS Architecture Playground ─────────────────────────────────

type CqrsAction = "placeOrder" | "getOrders" | "idle";

const ACTION_LABELS: Record<CqrsAction, string> = {
  placeOrder: "Place Order",
  getOrders: "Get Orders",
  idle: "Pick an action",
};

function CqrsArchitecturePlayground() {
  const [action, setAction] = useState<CqrsAction>("idle");
  const [animStep, setAnimStep] = useState(0);
  const [latencyData, setLatencyData] = useState<{ tick: string; write: number; read: number }[]>([
    { tick: "0", write: 12, read: 3 },
  ]);

  const sim = useSimulation({
    intervalMs: 800,
    maxSteps: 6,
    onTick: (tick) => {
      setAnimStep(tick);
      setLatencyData((prev) => {
        const next = [...prev, {
          tick: String(prev.length),
          write: 10 + Math.floor(Math.random() * 6),
          read: 2 + Math.floor(Math.random() * 3),
        }];
        return next.slice(-12);
      });
    },
    onReset: () => {
      setAnimStep(0);
      setAction("idle");
    },
  });

  const fireAction = useCallback((a: CqrsAction) => {
    setAction(a);
    setAnimStep(0);
    sim.reset();
    setTimeout(() => sim.play(), 50);
  }, [sim]);

  const isWrite = action === "placeOrder";
  const isRead = action === "getOrders";

  const nodes: FlowNode[] = useMemo(() => {
    const writeActive = isWrite && animStep >= 1;
    const cmdActive = isWrite && animStep >= 2;
    const writeDbActive = isWrite && animStep >= 3;
    const eventBusActive = isWrite && animStep >= 4;
    const readProjected = isWrite && animStep >= 5;
    const readQueryActive = isRead && animStep >= 1;
    const readHandlerActive = isRead && animStep >= 2;
    const readDbActive = isRead && animStep >= 3;

    return [
      n("client", "clientNode", 240, 0, {
        label: "Client", sublabel: ACTION_LABELS[action],
        status: animStep >= 1 ? "healthy" : "idle",
        handles: { bottom: true },
      }),
      // Write side
      n("cmd-handler", "serverNode", 60, 120, {
        label: "Command Handler", sublabel: "Validates & writes",
        status: writeActive ? "healthy" : cmdActive ? "healthy" : "idle",
        handles: { top: true, bottom: true },
      }),
      n("write-db", "databaseNode", 60, 260, {
        label: "Write DB", sublabel: "Normalized (PostgreSQL)",
        status: writeDbActive ? "healthy" : "idle",
        handles: { top: true, bottom: true },
      }),
      // Event bus
      n("event-bus", "queueNode", 240, 260, {
        label: "Event Bus", sublabel: "OrderPlaced event",
        status: eventBusActive ? "warning" : "idle",
        handles: { left: true, right: true },
      }),
      // Read side
      n("query-handler", "serverNode", 420, 120, {
        label: "Query Handler", sublabel: "Optimized reads",
        status: readQueryActive || readHandlerActive ? "healthy" : "idle",
        handles: { top: true, bottom: true },
      }),
      n("read-db", "databaseNode", 420, 260, {
        label: "Read DB", sublabel: "Denormalized (Elasticsearch)",
        status: readProjected || readDbActive ? "healthy" : "idle",
        handles: { top: true, left: true },
      }),
    ];
  }, [action, animStep, isWrite, isRead]);

  const edges: FlowEdge[] = useMemo(() => {
    const writeFlow = isWrite;
    const readFlow = isRead;
    return [
      // client -> cmd handler (write path)
      { id: "c-cmd", source: "client", target: "cmd-handler", animated: writeFlow && animStep >= 1,
        style: { opacity: writeFlow ? 1 : 0.2, stroke: writeFlow && animStep >= 1 ? "#3b82f6" : undefined } },
      // client -> query handler (read path)
      { id: "c-qry", source: "client", target: "query-handler", animated: readFlow && animStep >= 1,
        style: { opacity: readFlow ? 1 : 0.2, stroke: readFlow && animStep >= 1 ? "#10b981" : undefined } },
      // cmd handler -> write db
      { id: "cmd-wdb", source: "cmd-handler", target: "write-db", animated: writeFlow && animStep >= 3,
        style: { opacity: writeFlow ? 1 : 0.25 } },
      // write db -> event bus
      { id: "wdb-eb", source: "write-db", target: "event-bus", animated: writeFlow && animStep >= 4,
        style: { opacity: writeFlow ? 1 : 0.25 } },
      // event bus -> read db
      { id: "eb-rdb", source: "event-bus", target: "read-db", animated: writeFlow && animStep >= 5,
        style: { opacity: writeFlow ? 1 : 0.25 } },
      // query handler -> read db
      { id: "qry-rdb", source: "query-handler", target: "read-db", animated: readFlow && animStep >= 2,
        style: { opacity: readFlow ? 1 : 0.25 } },
    ];
  }, [action, animStep, isWrite, isRead]);

  const explanationForStep = useMemo(() => {
    if (action === "idle") return "Click a button above to trace the flow through the CQRS architecture.";
    if (isWrite) {
      const steps = [
        "Client sends a PlaceOrder command...",
        "Command Handler validates business rules (inventory, payment).",
        "Validated order is written to the normalized Write DB.",
        "An OrderPlaced event is published onto the Event Bus.",
        "The Event Bus delivers the event to the Read DB projector.",
        "Read DB is updated with a denormalized view. Done!",
      ];
      return steps[Math.min(animStep, steps.length - 1)];
    }
    const steps = [
      "Client sends a GetOrders query...",
      "Query Handler receives it -- no business logic, just data retrieval.",
      "Reads from the denormalized Read DB -- no joins, no contention.",
      "Response returned in under 5ms. Write DB was never touched!",
    ];
    return steps[Math.min(animStep, steps.length - 1)];
  }, [action, animStep, isWrite]);

  return (
    <Playground
      title="CQRS Architecture Playground"
      simulation={sim}
      canvasHeight="min-h-[420px]"
      canvas={
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center gap-3 px-4 py-3 border-b border-violet-500/10">
            <button
              onClick={() => fireAction("placeOrder")}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                isWrite
                  ? "bg-blue-500/15 text-blue-400 ring-1 ring-blue-500/30"
                  : "bg-muted/30 text-muted-foreground hover:bg-blue-500/10 hover:text-blue-400"
              )}
            >
              <PenLine className="size-3" /> Place Order
            </button>
            <button
              onClick={() => fireAction("getOrders")}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                isRead
                  ? "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30"
                  : "bg-muted/30 text-muted-foreground hover:bg-emerald-500/10 hover:text-emerald-400"
              )}
            >
              <Search className="size-3" /> Get Orders
            </button>
          </div>
          <div className="flex-1">
            <FlowDiagram nodes={nodes} edges={edges} interactive={false} allowDrag={false} minHeight={350} />
          </div>
        </div>
      }
      explanation={
        <div className="space-y-4">
          <p className="text-sm font-medium">{explanationForStep}</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-md border border-blue-500/20 bg-blue-500/5 p-2">
              <div className="text-[10px] font-semibold text-blue-400 mb-1">Write Model</div>
              <div className="text-[11px] text-muted-foreground font-mono leading-relaxed">
                orders (id, user_id)<br />
                order_items (order_id, product_id)<br />
                products (id, name, price)
              </div>
              <div className="text-[9px] text-muted-foreground/50 mt-1">Normalized -- 3NF</div>
            </div>
            <div className="rounded-md border border-emerald-500/20 bg-emerald-500/5 p-2">
              <div className="text-[10px] font-semibold text-emerald-400 mb-1">Read Model</div>
              <div className="text-[11px] text-muted-foreground font-mono leading-relaxed">
                order_summary (id, user,<br />
                &nbsp;&nbsp;items[], total, status)
              </div>
              <div className="text-[9px] text-muted-foreground/50 mt-1">Denormalized -- one doc</div>
            </div>
          </div>
          <div className="mt-2">
            <div className="text-[10px] font-semibold text-muted-foreground mb-1">Read vs Write Latency</div>
            <LiveChart
              type="line"
              data={latencyData}
              dataKeys={{ x: "tick", y: ["write", "read"], label: ["Write (ms)", "Read (ms)"] }}
              height={120}
              unit="ms"
              colors={["#3b82f6", "#10b981"]}
              referenceLines={[{ y: 50, label: "SLA", color: "#ef4444" }]}
            />
          </div>
        </div>
      }
    />
  );
}

// ─── Section 2: Event Store Playground ───────────────────────────────────────

type CartEvent = {
  id: number;
  type: string;
  data: string;
  icon: typeof ShoppingCart;
  color: string;
};

const EVENT_ICON_MAP: Record<string, typeof ShoppingCart> = {
  CartCreated: ShoppingCart,
  ItemAdded: Plus,
  ItemRemoved: Minus,
  QuantityChanged: Package,
  CheckedOut: CreditCard,
};

const EVENT_COLOR_MAP: Record<string, string> = {
  CartCreated: "text-violet-400",
  ItemAdded: "text-emerald-400",
  ItemRemoved: "text-red-400",
  QuantityChanged: "text-amber-400",
  CheckedOut: "text-blue-400",
};

type CartItem = { name: string; qty: number; price: number };

function deriveState(events: CartEvent[], upTo: number): { items: CartItem[]; total: number; checkedOut: boolean } {
  const items: Record<string, CartItem> = {};
  let checkedOut = false;

  for (let i = 0; i < upTo; i++) {
    const e = events[i];
    if (!e) break;
    switch (e.type) {
      case "CartCreated":
        break;
      case "ItemAdded": {
        const [name, priceStr] = e.data.split("|");
        const price = parseFloat(priceStr);
        if (items[name]) items[name].qty += 1;
        else items[name] = { name, qty: 1, price };
        break;
      }
      case "ItemRemoved": {
        delete items[e.data];
        break;
      }
      case "QuantityChanged": {
        const [qName, qtyStr] = e.data.split("|");
        if (items[qName]) items[qName].qty = parseInt(qtyStr);
        break;
      }
      case "CheckedOut":
        checkedOut = true;
        break;
    }
  }

  const arr = Object.values(items);
  const total = arr.reduce((s, i) => s + i.price * i.qty, 0);
  return { items: arr, total, checkedOut };
}

function EventStorePlayground() {
  const [events, setEvents] = useState<CartEvent[]>([
    { id: 1, type: "CartCreated", data: "", icon: ShoppingCart, color: "text-violet-400" },
  ]);
  const [timeSlider, setTimeSlider] = useState(1);
  const [isReplaying, setIsReplaying] = useState(false);
  const [replayPos, setReplayPos] = useState(1);

  const addEvent = useCallback((type: string, data: string) => {
    setEvents((prev) => {
      const next = [...prev, {
        id: prev.length + 1,
        type,
        data,
        icon: EVENT_ICON_MAP[type] || ShoppingCart,
        color: EVENT_COLOR_MAP[type] || "text-muted-foreground",
      }];
      setTimeSlider(next.length);
      setReplayPos(next.length);
      return next;
    });
  }, []);

  const replayFromScratch = useCallback(() => {
    setIsReplaying(true);
    setReplayPos(0);
    let pos = 0;
    const iv = setInterval(() => {
      pos++;
      setReplayPos(pos);
      if (pos >= events.length) {
        clearInterval(iv);
        setIsReplaying(false);
      }
    }, 400);
  }, [events.length]);

  const displayUpTo = isReplaying ? replayPos : timeSlider;
  const state = useMemo(() => deriveState(events, displayUpTo), [events, displayUpTo]);

  const actionButtons: { label: string; type: string; data: string }[] = [
    { label: "Add Laptop ($999)", type: "ItemAdded", data: "Laptop|999" },
    { label: "Add Mouse ($29)", type: "ItemAdded", data: "Mouse|29" },
    { label: "Remove Mouse", type: "ItemRemoved", data: "Mouse" },
    { label: "Qty Laptop = 2", type: "QuantityChanged", data: "Laptop|2" },
    { label: "Checkout", type: "CheckedOut", data: "" },
  ];

  return (
    <Playground
      title="Event Store -- Time Travel for Data"
      controls={false}
      canvasHeight="min-h-[360px]"
      canvas={
        <div className="p-4 space-y-4">
          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            {actionButtons.map((a) => (
              <button
                key={a.label}
                onClick={() => addEvent(a.type, a.data)}
                disabled={state.checkedOut || isReplaying}
                className="rounded-md border border-violet-500/20 bg-violet-500/5 px-2.5 py-1 text-[11px] font-medium text-violet-400 hover:bg-violet-500/15 transition-colors disabled:opacity-30"
              >
                {a.label}
              </button>
            ))}
          </div>

          {/* Event log */}
          <div className="space-y-1 max-h-[200px] overflow-y-auto pr-1">
            {events.map((e, i) => {
              const visible = i < displayUpTo;
              const isLatest = i === displayUpTo - 1;
              const Icon = e.icon;
              return (
                <div
                  key={e.id}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md border px-3 py-1.5 transition-all duration-300",
                    visible
                      ? isLatest
                        ? "bg-violet-500/10 border-violet-500/25"
                        : "bg-muted/15 border-border/30"
                      : "bg-muted/5 border-border/10 opacity-20"
                  )}
                >
                  <span className="text-[9px] font-mono text-muted-foreground/40 w-5">#{e.id}</span>
                  <Icon className={cn("size-3 shrink-0", visible ? e.color : "text-muted-foreground/20")} />
                  <span className={cn("text-[11px] font-semibold flex-1", visible ? "text-foreground" : "text-muted-foreground/30")}>
                    {e.type}
                  </span>
                  {e.data && (
                    <span className="text-[10px] font-mono text-muted-foreground/50">
                      {e.data.replace("|", ": ")}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Time travel slider */}
          <div className="flex items-center gap-3">
            <Clock className="size-3.5 text-violet-400" />
            <span className="text-[11px] text-muted-foreground/60 shrink-0">Time Travel:</span>
            <input
              type="range"
              min={0}
              max={events.length}
              value={displayUpTo}
              onChange={(e) => { setTimeSlider(Number(e.target.value)); setReplayPos(Number(e.target.value)); }}
              disabled={isReplaying}
              className="flex-1 accent-violet-500 h-1.5 cursor-pointer"
            />
            <span className="text-[11px] font-mono text-violet-400 w-8 text-right">{displayUpTo}/{events.length}</span>
            <button
              onClick={replayFromScratch}
              disabled={isReplaying}
              className="rounded-md border border-violet-500/30 bg-violet-500/10 px-2.5 py-1 text-[11px] font-medium text-violet-400 hover:bg-violet-500/20 transition-colors disabled:opacity-40"
            >
              <RotateCcw className="size-3 inline mr-1" />
              Rebuild View
            </button>
          </div>
        </div>
      }
      explanation={
        <div className="space-y-3">
          <div className="text-xs font-semibold text-muted-foreground">Current State (derived from events)</div>
          {state.items.length === 0 && !state.checkedOut ? (
            <div className="text-[11px] text-muted-foreground/50 italic">Cart is empty. Add some items!</div>
          ) : (
            <div className="space-y-1.5">
              {state.items.map((item) => (
                <div key={item.name} className="flex items-center justify-between rounded-md border border-border/30 bg-muted/15 px-3 py-1.5">
                  <span className="text-[11px] font-medium">{item.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-muted-foreground/60">x{item.qty}</span>
                    <span className="text-[11px] font-mono">${(item.price * item.qty).toFixed(0)}</span>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between pt-1 border-t border-border/20">
                <span className="text-xs font-semibold">Total</span>
                <span className="text-sm font-mono font-bold">${state.total.toFixed(0)}</span>
              </div>
              {state.checkedOut && (
                <div className="rounded-md bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 text-[11px] text-emerald-400 font-medium">
                  Order checked out!
                </div>
              )}
            </div>
          )}
          <div className="rounded-md bg-muted/20 border border-border/20 p-2.5">
            <div className="text-[10px] text-muted-foreground/50 mb-1">How it works</div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              The cart state above is never stored directly. It is <strong>computed by replaying every event</strong> from
              the log up to the slider position. Move the slider to see the state at any point in history. Traditional databases
              would have lost this history after each UPDATE.
            </p>
          </div>
        </div>
      }
    />
  );
}

// ─── Section 3: Consistency Challenge ────────────────────────────────────────

function ConsistencyPlayground() {
  const [writes, setWrites] = useState(0);
  const [readSynced, setReadSynced] = useState(0);
  const [gapData, setGapData] = useState<{ t: string; gap: number; writes: number; synced: number }[]>([]);
  const [log, setLog] = useState<{ text: string; type: "write" | "sync" | "gap" }[]>([]);

  const sim = useSimulation({
    intervalMs: 700,
    maxSteps: 20,
    onTick: (tick) => {
      setWrites((prev) => {
        const next = prev + 1;
        // read side catches up after a delay
        const syncDelay = 2;
        const synced = Math.max(0, next - syncDelay);
        setReadSynced(synced);
        const gap = next - synced;

        setGapData((g) => {
          const entry = { t: String(tick), gap, writes: next, synced };
          return [...g, entry].slice(-20);
        });

        if (tick % 3 === 1) {
          setLog((l) => [...l, { text: `Write #${next} committed`, type: "write" as const }].slice(-6));
        }
        if (tick % 3 === 0 && tick > 2) {
          setLog((l) => [...l, { text: `Read model synced to #${synced}`, type: "sync" as const }].slice(-6));
        }

        return next;
      });
    },
    onReset: () => {
      setWrites(0);
      setReadSynced(0);
      setGapData([]);
      setLog([]);
    },
  });

  const gap = writes - readSynced;

  const gapStatusClass = gap === 0
    ? "text-emerald-400"
    : gap <= 2
      ? "text-amber-400"
      : "text-red-400";

  const gapBgClass = gap === 0
    ? "bg-emerald-500/10 border-emerald-500/20"
    : gap <= 2
      ? "bg-amber-500/10 border-amber-500/20"
      : "bg-red-500/10 border-red-500/20";

  return (
    <Playground
      title="Eventual Consistency Challenge"
      simulation={sim}
      canvasHeight="min-h-[300px]"
      canvas={
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-md border border-blue-500/20 bg-blue-500/5 p-3 text-center">
              <div className="text-[10px] text-blue-400 font-semibold mb-1">Write DB</div>
              <div className="text-2xl font-mono font-bold">{writes}</div>
              <div className="text-[10px] text-muted-foreground/50">records</div>
            </div>
            <div className={cn("rounded-md border p-3 text-center", gapBgClass)}>
              <div className={cn("text-[10px] font-semibold mb-1", gapStatusClass)}>Gap</div>
              <div className={cn("text-2xl font-mono font-bold", gapStatusClass)}>{gap}</div>
              <div className="text-[10px] text-muted-foreground/50">behind</div>
            </div>
            <div className="rounded-md border border-emerald-500/20 bg-emerald-500/5 p-3 text-center">
              <div className="text-[10px] text-emerald-400 font-semibold mb-1">Read DB</div>
              <div className="text-2xl font-mono font-bold">{readSynced}</div>
              <div className="text-[10px] text-muted-foreground/50">synced</div>
            </div>
          </div>
          <LiveChart
            type="area"
            data={gapData}
            dataKeys={{ x: "t", y: ["gap"], label: ["Consistency Gap"] }}
            height={140}
            unit="records"
            colors={["#f59e0b"]}
            referenceLines={[{ y: 0, label: "Consistent", color: "#10b981" }]}
          />
        </div>
      }
      explanation={
        <div className="space-y-3">
          <p className="text-sm">
            The write DB is always ahead of the read DB. The <strong>consistency gap</strong> shows
            how many records the read model has not yet processed.
          </p>
          <div className="space-y-1">
            {log.map((entry, i) => {
              const logColorClass = entry.type === "write"
                ? "text-blue-400"
                : "text-emerald-400";
              return (
                <div key={i} className="flex items-center gap-2">
                  <div className={cn("size-1.5 rounded-full", entry.type === "write" ? "bg-blue-400" : "bg-emerald-400")} />
                  <span className={cn("text-[11px]", logColorClass)}>{entry.text}</span>
                </div>
              );
            })}
            {log.length === 0 && (
              <span className="text-[11px] text-muted-foreground/40 italic">Press play to start the simulation.</span>
            )}
          </div>
          <div className="rounded-md bg-muted/20 border border-border/20 p-2.5">
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              In CQRS, the read side is <strong>eventually consistent</strong>. There is always a brief
              window where the write has committed but the read model has not caught up. For most use
              cases (dashboards, feeds, search), this delay is invisible to users.
            </p>
          </div>
        </div>
      }
    />
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function CqrsEventSourcingPage() {
  return (
    <div className="space-y-8">
      <TopicHero
        title="CQRS & Event Sourcing"
        subtitle="When your read-heavy analytics dashboard and your write-heavy transaction system fight over the same database, both lose. Split them apart."
        difficulty="advanced"
      />

      <section className="space-y-4">
        <h2 className="text-xl font-bold">Why Separate Reads from Writes?</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          A single database model forces you to choose: optimize for fast writes (normalized, few indexes)
          or fast reads (denormalized, many indexes). You cannot have both. CQRS eliminates this
          trade-off by giving each side its own model, its own database, and its own scaling strategy.
        </p>
        <ConversationalCallout type="question">
          If your e-commerce platform runs 5,000 writes/s and 50,000 reads/s, should both workloads
          share one database? What happens when an analytics query locks rows the checkout flow needs?
        </ConversationalCallout>
      </section>

      <CqrsArchitecturePlayground />

      <AhaMoment
        question="If the read side is eventually consistent, won't users see stale data?"
        answer={
          <p>
            Yes, and that is usually fine. When you post a tweet, it does not need to appear in
            everyone&apos;s timeline within the same millisecond. A few hundred milliseconds of delay
            is invisible to humans. The key insight is that <em>most systems are already eventually
            consistent</em> (replication lag, CDN caching, browser caching). CQRS just makes this
            explicit. For the rare cases where strong consistency matters (balance display after
            transfer), the write side can return the updated value directly.
          </p>
        }
      />

      <section className="space-y-4">
        <h2 className="text-xl font-bold">Event Sourcing: Store What Happened</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Instead of storing the current state of an entity (UPDATE balance = 950), event sourcing
          stores the <strong>sequence of events</strong> that produced it. The current state is
          derived by replaying the event log. This is how banking has worked for centuries: your
          bank statement is a log of transactions, not just a balance. Try it below -- add items
          to a shopping cart, then use the time-travel slider to see the state at any point.
        </p>
      </section>

      <EventStorePlayground />

      <ConversationalCallout type="tip">
        Event sourcing shines in domains with audit requirements: banking, healthcare, e-commerce
        order history, ride-sharing trip logs. If regulators or customers might ask &quot;what
        happened and when?&quot; event sourcing gives you the answer for free. The event store
        is your audit log, your debugging tool, and your data recovery mechanism all in one.
      </ConversationalCallout>

      <section className="space-y-4">
        <h2 className="text-xl font-bold">The Consistency Trade-off</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The price of CQRS is eventual consistency. The write model is always ahead of the read
          model by a small window. Watch this simulation to see the gap in action -- and notice
          how the read side continuously catches up.
        </p>
      </section>

      <ConsistencyPlayground />

      <ConversationalCallout type="warning">
        CQRS adds significant complexity. You now maintain two data models, handle event versioning
        (what happens when an event schema changes?), deal with eventual consistency in the UI, and
        need infrastructure for event publishing. Only use CQRS when read and write patterns are
        genuinely different enough to justify the overhead. For simple CRUD apps, a single model
        is the correct choice.
      </ConversationalCallout>

      <KeyTakeaway
        points={[
          "CQRS separates read and write operations into different models, each optimized and scaled independently -- eliminating lock contention.",
          "The write side processes commands and emits domain events; the read side consumes those events to maintain denormalized projections.",
          "Event sourcing stores the sequence of state changes rather than current state, enabling full audit trails, temporal queries, and event replay.",
          "The read side is eventually consistent -- there is a small delay between a write and when it appears in read views, typically milliseconds.",
          "CQRS + Event Sourcing is powerful but complex. Use it when read/write patterns diverge significantly; avoid it for simple CRUD.",
        ]}
      />
    </div>
  );
}
