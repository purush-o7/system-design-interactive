"use client";

import { useState, useEffect, useCallback } from "react";
import { TopicHero } from "@/components/topic-hero";
import { KeyTakeaway } from "@/components/key-takeaway";
import { AhaMoment } from "@/components/aha-moment";
import { ConversationalCallout } from "@/components/conversational-callout";
import { BeforeAfter } from "@/components/before-after";
import { FlowDiagram } from "@/components/flow-diagram";
import type { FlowNode, FlowEdge } from "@/components/flow-diagram";
import { LiveChart } from "@/components/live-chart";
import { Playground } from "@/components/playground";
import { useSimulation } from "@/hooks/use-simulation";
import { cn } from "@/lib/utils";
import {
  CreditCard,
  Shield,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Lock,
  Database,
  Zap,
  Clock,
  AlertTriangle,
  Copy,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Payment Flow FlowDiagram                                           */
/* ------------------------------------------------------------------ */
const paymentFlowNodes: FlowNode[] = [
  { id: "merchant", type: "clientNode", position: { x: 190, y: 20 }, data: { label: "Merchant App", sublabel: "Stripe.js / SDK", handles: { bottom: true } } },
  { id: "gateway", type: "gatewayNode", position: { x: 190, y: 120 }, data: { label: "API Gateway", sublabel: "Auth + Rate limiting", status: "healthy", handles: { top: true, bottom: true } } },
  { id: "payment-intent", type: "serverNode", position: { x: 190, y: 230 }, data: { label: "Payment Intent", sublabel: "State machine + idempotency", status: "healthy", metrics: [{ label: "p99", value: "50ms" }], handles: { top: true, bottom: true, left: true, right: true } } },
  { id: "radar", type: "serverNode", position: { x: 10, y: 340 }, data: { label: "Radar (Fraud)", sublabel: "ML risk scoring", status: "healthy", metrics: [{ label: "Latency", value: "~15ms" }], handles: { top: true, bottom: true } } },
  { id: "processor", type: "serverNode", position: { x: 370, y: 340 }, data: { label: "Payment Processor", sublabel: "Card network routing", status: "healthy", handles: { top: true, bottom: true } } },
  { id: "tokenization", type: "cacheNode", position: { x: 190, y: 340 }, data: { label: "Vault / Tokenization", sublabel: "Encrypted card storage", status: "healthy", handles: { top: true, bottom: true } } },
  { id: "bank", type: "databaseNode", position: { x: 370, y: 460 }, data: { label: "Issuing Bank", sublabel: "Approve or decline", status: "healthy", handles: { top: true, bottom: true } } },
  { id: "ledger", type: "databaseNode", position: { x: 10, y: 460 }, data: { label: "Append-Only Ledger", sublabel: "Double-entry bookkeeping", status: "healthy", handles: { top: true, bottom: true } } },
  { id: "webhook", type: "queueNode", position: { x: 190, y: 560 }, data: { label: "Webhook Service", sublabel: "Async delivery + retry", status: "healthy", handles: { top: true } } },
];

const paymentFlowEdges: FlowEdge[] = [
  { id: "e1", source: "merchant", target: "gateway", label: "POST /v1/payment_intents", animated: true },
  { id: "e2", source: "gateway", target: "payment-intent", label: "Idempotency check", animated: true },
  { id: "e3", source: "payment-intent", target: "radar", label: "Risk score", animated: true },
  { id: "e4", source: "payment-intent", target: "tokenization", label: "Resolve token", animated: true },
  { id: "e5", source: "payment-intent", target: "processor", label: "Authorize", animated: true },
  { id: "e6", source: "processor", target: "bank", label: "Auth request", animated: true },
  { id: "e7", source: "bank", target: "ledger", label: "Record debit", animated: false, style: { strokeDasharray: "5 5" } },
  { id: "e8", source: "payment-intent", target: "webhook", label: "payment_intent.succeeded", animated: false, style: { strokeDasharray: "5 5" } },
];

/* ------------------------------------------------------------------ */
/*  Idempotency Key Playground                                         */
/* ------------------------------------------------------------------ */
type IdempotencyStep = {
  id: number;
  label: string;
  desc: string;
  kind: "request" | "charge" | "error" | "cache" | "done";
};

const stepsWithout: IdempotencyStep[] = [
  { id: 1, kind: "request", label: "POST /v1/charges", desc: "First request sent (amount: $200)" },
  { id: 2, kind: "charge", label: "Card charged $200", desc: "Payment processed successfully" },
  { id: 3, kind: "error", label: "Network timeout", desc: "HTTP response lost in transit!" },
  { id: 4, kind: "request", label: "Client retries", desc: "Same POST /v1/charges sent again" },
  { id: 5, kind: "charge", label: "Card charged $200 AGAIN", desc: "No deduplication — second charge!" },
  { id: 6, kind: "error", label: "Customer charged $400", desc: "Should have been $200. Dispute filed." },
];

const stepsWith: IdempotencyStep[] = [
  { id: 1, kind: "request", label: "POST /v1/charges", desc: "Idempotency-Key: idem_abc123 sent" },
  { id: 2, kind: "charge", label: "Card charged $200", desc: "Key idem_abc123 stored with full response" },
  { id: 3, kind: "error", label: "Network timeout", desc: "HTTP response lost in transit!" },
  { id: 4, kind: "request", label: "Client retries", desc: "Same Idempotency-Key: idem_abc123" },
  { id: 5, kind: "cache", label: "Cache hit!", desc: "Key idem_abc123 found — returning stored result" },
  { id: 6, kind: "done", label: "Customer charged $200", desc: "Exactly once. No dispute. No surprises." },
];

function IdempotencyPlayground() {
  const [mode, setMode] = useState<"without" | "with">("without");
  const sim = useSimulation({ intervalMs: 900, maxSteps: 6 });
  const steps = mode === "without" ? stepsWithout : stepsWith;
  const visibleSteps = steps.slice(0, sim.step);

  const kindStyle: Record<string, string> = {
    request: "border-blue-500/20 bg-blue-500/5 text-blue-400",
    charge: "border-violet-500/20 bg-violet-500/5 text-violet-400",
    error: "border-red-500/20 bg-red-500/5 text-red-400",
    cache: "border-emerald-500/20 bg-emerald-500/5 text-emerald-400",
    done: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  };

  const kindIcon = (kind: string) => {
    if (kind === "error") return <XCircle className="size-3.5 shrink-0 text-red-400" />;
    if (kind === "cache" || kind === "done") return <CheckCircle2 className="size-3.5 shrink-0 text-emerald-400" />;
    if (kind === "charge") return <CreditCard className="size-3.5 shrink-0 text-violet-400" />;
    return <RefreshCw className="size-3.5 shrink-0 text-blue-400" />;
  };

  return (
    <Playground
      title="Idempotency Key Simulator"
      simulation={sim}
      canvasHeight="min-h-[360px]"
      canvas={
        <div className="p-4 space-y-3">
          <div className="flex gap-2">
            <button
              onClick={() => { setMode("without"); sim.reset(); }}
              className={cn("text-xs px-3 py-1.5 rounded-md border transition-all", mode === "without" ? "bg-red-500/15 border-red-500/30 text-red-400" : "bg-muted/20 border-border/50 text-muted-foreground")}
            >
              Without Idempotency Key
            </button>
            <button
              onClick={() => { setMode("with"); sim.reset(); }}
              className={cn("text-xs px-3 py-1.5 rounded-md border transition-all", mode === "with" ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400" : "bg-muted/20 border-border/50 text-muted-foreground")}
            >
              With Idempotency Key
            </button>
          </div>

          {mode === "with" && (
            <div className="flex items-center gap-2 rounded border border-amber-500/20 bg-amber-500/5 px-3 py-1.5">
              <Copy className="size-3 text-amber-400 shrink-0" />
              <span className="text-[10px] font-mono text-amber-400">Idempotency-Key: idem_abc123</span>
              <span className="text-[10px] text-muted-foreground/60">(same key on retry)</span>
            </div>
          )}

          <div className="space-y-1.5 overflow-y-auto max-h-[240px]">
            {visibleSteps.length === 0 && (
              <p className="text-[11px] text-muted-foreground/40 font-mono italic">Press play to simulate a payment with network failure...</p>
            )}
            {visibleSteps.map((s) => (
              <div key={`${mode}-${s.id}`} className={cn("flex items-start gap-2.5 rounded border px-3 py-2 text-[11px] font-mono transition-all animate-in fade-in slide-in-from-bottom-1", kindStyle[s.kind])}>
                {kindIcon(s.kind)}
                <div className="space-y-0.5">
                  <p className="font-semibold">{s.label}</p>
                  <p className="text-muted-foreground/70 text-[10px]">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      }
      explanation={
        <div className="space-y-2">
          <p className="font-medium text-foreground/80 text-xs">What to watch for</p>
          <p>Step 3 is where the network fails — the card is already charged but the response is lost.</p>
          <p>Without the key: the retry fires another charge. The customer is billed twice.</p>
          <p>With the key: Stripe recognizes the same key, returns the cached response. One charge, always.</p>
          <p className="text-violet-400/80">Keys are stored in Redis for 24 hours — a generous retry window.</p>
        </div>
      }
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Webhook Retry Simulation                                           */
/* ------------------------------------------------------------------ */
type RetryAttempt = {
  attempt: number;
  delayLabel: string;
  delaySec: number;
  succeeds: boolean;
};

const retrySchedule: RetryAttempt[] = [
  { attempt: 1, delayLabel: "Immediate", delaySec: 0, succeeds: false },
  { attempt: 2, delayLabel: "+1 min", delaySec: 60, succeeds: false },
  { attempt: 3, delayLabel: "+5 min", delaySec: 360, succeeds: false },
  { attempt: 4, delayLabel: "+30 min", delaySec: 2160, succeeds: false },
  { attempt: 5, delayLabel: "+2 hr", delaySec: 9360, succeeds: false },
  { attempt: 6, delayLabel: "+8 hr", delaySec: 38160, succeeds: false },
  { attempt: 7, delayLabel: "+24 hr", delaySec: 124560, succeeds: true },
];

function WebhookRetryPlayground() {
  const sim = useSimulation({ intervalMs: 700, maxSteps: retrySchedule.length });
  const visibleRetries = retrySchedule.slice(0, sim.step);

  const chartData = retrySchedule.map((r) => ({
    attempt: `#${r.attempt}`,
    delay: Math.round(r.delaySec / 60),
  }));

  return (
    <Playground
      title="Webhook Exponential Backoff"
      simulation={sim}
      canvasHeight="min-h-[300px]"
      canvas={
        <div className="p-4 space-y-3">
          <div className="space-y-1.5">
            {visibleRetries.length === 0 && (
              <p className="text-[11px] text-muted-foreground/40 font-mono italic">Press play to watch Stripe retry a failed webhook...</p>
            )}
            {visibleRetries.map((r) => (
              <div
                key={r.attempt}
                className={cn(
                  "flex items-center gap-3 rounded border px-3 py-1.5 text-[11px] font-mono animate-in fade-in slide-in-from-left-2",
                  r.succeeds
                    ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-400"
                    : "border-red-500/20 bg-red-500/5 text-red-400"
                )}
              >
                <span className="text-muted-foreground/50 w-4 shrink-0">#{r.attempt}</span>
                {r.succeeds
                  ? <CheckCircle2 className="size-3.5 shrink-0 text-emerald-400" />
                  : <XCircle className="size-3.5 shrink-0 text-red-400" />
                }
                <span className="w-20 shrink-0">{r.delayLabel}</span>
                <div
                  className={cn("h-2 rounded-full transition-all duration-500", r.succeeds ? "bg-emerald-500/50" : "bg-red-500/30")}
                  style={{ width: `${Math.min(100, 10 + r.attempt * 12)}%` }}
                />
                <span className={cn("ml-auto text-[10px]", r.succeeds ? "text-emerald-400" : "text-muted-foreground/40")}>
                  {r.succeeds ? "DELIVERED" : "FAILED"}
                </span>
              </div>
            ))}
          </div>
        </div>
      }
      explanation={
        <div className="space-y-2">
          <p className="font-medium text-foreground/80 text-xs">Exponential backoff schedule</p>
          <p>Stripe retries over 3 days: immediate → 1 min → 5 min → 30 min → 2 hr → 8 hr → 24 hr...</p>
          <p>This handles merchant downtime gracefully — even a full day of outage is survivable.</p>
          <p className="text-amber-400/80">Merchants must handle duplicate events. Store processed event IDs and skip re-processing.</p>
        </div>
      }
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Request Tracing Visualization                                      */
/* ------------------------------------------------------------------ */
type TraceSpan = {
  name: string;
  offsetMs: number;
  durationMs: number;
  colorClass: string;
};

const traceSpans: TraceSpan[] = [
  { name: "API Gateway", offsetMs: 0, durationMs: 3, colorClass: "bg-cyan-400" },
  { name: "Auth + JWT", offsetMs: 3, durationMs: 5, colorClass: "bg-blue-400" },
  { name: "Rate Limiter", offsetMs: 8, durationMs: 2, colorClass: "bg-violet-400" },
  { name: "Input Validation", offsetMs: 10, durationMs: 2, colorClass: "bg-indigo-400" },
  { name: "Idempotency Check", offsetMs: 12, durationMs: 3, colorClass: "bg-amber-400" },
  { name: "Radar (Fraud)", offsetMs: 15, durationMs: 15, colorClass: "bg-orange-400" },
  { name: "Card Network RTT", offsetMs: 30, durationMs: 200, colorClass: "bg-red-400" },
  { name: "Ledger Write", offsetMs: 230, durationMs: 8, colorClass: "bg-emerald-400" },
  { name: "Webhook Dispatch", offsetMs: 238, durationMs: 5, colorClass: "bg-pink-400" },
];
const TOTAL_MS = 250;

function RequestTracingViz() {
  const [activeIdx, setActiveIdx] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  useEffect(() => {
    if (!isPlaying) return;
    const t = setInterval(() => setActiveIdx((s) => (s >= traceSpans.length - 1 ? 0 : s + 1)), 550);
    return () => clearInterval(t);
  }, [isPlaying]);

  const chartData = traceSpans.map((s) => ({
    span: s.name.split(" ")[0],
    ms: s.durationMs,
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-4 text-[10px] font-mono text-muted-foreground/50">
          <span>0 ms</span>
          <span className="text-muted-foreground/80">Total: ~250ms</span>
          <span>250 ms</span>
        </div>
        <button onClick={() => setIsPlaying(p => !p)}
          className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 border border-violet-500/20 transition-colors">
          {isPlaying ? "⏸ Pause" : "▶ Start"}
        </button>
      </div>
      <div className="space-y-1.5">
        {traceSpans.map((span, i) => {
          const leftPct = (span.offsetMs / TOTAL_MS) * 100;
          const widthPct = Math.max((span.durationMs / TOTAL_MS) * 100, 1.5);
          const isActive = i <= activeIdx;
          return (
            <div key={span.name} className="flex items-center gap-2">
              <span className={cn("text-[10px] font-mono w-32 text-right truncate", isActive ? "text-muted-foreground" : "text-muted-foreground/25")}>
                {span.name}
              </span>
              <div className="flex-1 h-4 relative rounded-sm bg-muted/10">
                <div
                  className={cn("absolute h-full rounded-sm transition-all duration-300", isActive ? span.colorClass : "bg-muted/20")}
                  style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                />
              </div>
              <span className={cn("text-[10px] font-mono w-10 text-right", isActive ? "text-muted-foreground" : "text-muted-foreground/20")}>
                {span.durationMs}ms
              </span>
            </div>
          );
        })}
      </div>
      <p className="text-[11px] text-muted-foreground/70">
        Over 80% of latency is the card network round-trip (~200ms). All of Stripe&apos;s internal services add only ~50ms. Webhook dispatch is async and does not block the API response.
      </p>
      <div>
        <p className="text-[11px] text-muted-foreground mb-2">Duration per span (ms)</p>
        <LiveChart
          type="bar"
          data={chartData}
          dataKeys={{ x: "span", y: "ms" }}
          height={140}
          unit="ms"
          referenceLines={[{ y: 200, label: "Card network", color: "#f87171" }]}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  PaymentIntent State Machine                                        */
/* ------------------------------------------------------------------ */
type PaymentState = {
  id: string;
  label: string;
  desc: string;
};

const paymentStates: PaymentState[] = [
  { id: "created", label: "Created", desc: "Intent initialized" },
  { id: "processing", label: "Processing", desc: "Authorizing with card network" },
  { id: "authorized", label: "Authorized", desc: "Funds held on card" },
  { id: "capturing", label: "Capturing", desc: "Transferring funds" },
  { id: "succeeded", label: "Succeeded", desc: "Payment complete" },
];

function PaymentStateMachine() {
  const sim = useSimulation({ intervalMs: 1100, maxSteps: paymentStates.length - 1 });

  return (
    <Playground
      title="PaymentIntent State Machine"
      simulation={sim}
      canvasHeight="min-h-[220px]"
      canvas={
        <div className="p-4 flex flex-col justify-center h-full">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {paymentStates.map((state, i) => {
              const isActive = i === sim.step && i < paymentStates.length;
              const isDone = i < sim.step;
              return (
                <div key={state.id} className="flex items-center gap-2">
                  <div className={cn(
                    "rounded-lg border px-3 py-2 text-center min-w-[90px] transition-all duration-300",
                    isActive ? "border-blue-500/40 bg-blue-500/10 ring-1 ring-blue-500/20" : isDone ? "border-emerald-500/20 bg-emerald-500/5" : "border-border/30 bg-muted/10"
                  )}>
                    <p className={cn("text-xs font-semibold", isActive ? "text-blue-400" : isDone ? "text-emerald-400" : "text-muted-foreground/40")}>
                      {state.label}
                    </p>
                    <p className={cn("text-[10px] mt-0.5", isActive || isDone ? "text-muted-foreground" : "text-muted-foreground/20")}>
                      {state.desc}
                    </p>
                  </div>
                  {i < paymentStates.length - 1 && (
                    <div className={cn("text-lg font-mono", isDone ? "text-emerald-400" : "text-muted-foreground/20")}>›</div>
                  )}
                </div>
              );
            })}
          </div>
          {sim.step >= 4 && (
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-emerald-400 font-medium animate-in fade-in">
              <CheckCircle2 className="size-4" />
              Payment succeeded — webhook dispatched to merchant
            </div>
          )}
        </div>
      }
      explanation={
        <div className="space-y-2">
          <p className="font-medium text-foreground/80 text-xs">Why a state machine?</p>
          <p>Each state transition is atomic and idempotent. If the system crashes mid-payment, it can resume from the last persisted state.</p>
          <p>Authorization and capture are separate phases — merchants can verify orders before money moves.</p>
          <p className="text-amber-400/80">If capture fails, the authorization hold expires automatically after ~7 days. No manual refund needed.</p>
        </div>
      }
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Tokenization / PCI Boundary                                        */
/* ------------------------------------------------------------------ */
type TokenStep = {
  zone: "browser" | "stripe" | "merchant";
  label: string;
  desc: string;
};

const tokenSteps: TokenStep[] = [
  { zone: "browser", label: "Customer enters card", desc: "4242 4242 4242 4242 — inside Stripe.js iframe" },
  { zone: "stripe", label: "Stripe.js iframe", desc: "Isolated from merchant JS — XSS cannot reach card data" },
  { zone: "stripe", label: "Card encrypted + stored", desc: "Stripe Vault — AES-256 at rest, TLS in transit" },
  { zone: "browser", label: "Token returned", desc: "tok_1MqLn2...Jpx4 — useless to an attacker" },
  { zone: "merchant", label: "Merchant backend sees token", desc: "Never sees raw PAN — PCI scope dramatically reduced" },
  { zone: "stripe", label: "Stripe resolves token", desc: "Decrypts real card only at payment time" },
];

const zoneColors = {
  browser: "border-blue-500/20 bg-blue-500/5 text-blue-400",
  stripe: "border-emerald-500/20 bg-emerald-500/5 text-emerald-400",
  merchant: "border-amber-500/20 bg-amber-500/5 text-amber-400",
};

const zoneLabels = {
  browser: "Browser",
  stripe: "Stripe",
  merchant: "Merchant",
};

function TokenizationViz() {
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  useEffect(() => {
    if (!isPlaying) return;
    const t = setInterval(() => setStep((s) => (s + 1) % (tokenSteps.length + 2)), 1000);
    return () => clearInterval(t);
  }, [isPlaying]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-2 flex-wrap text-[10px]">
          {(["browser", "stripe", "merchant"] as const).map((zone) => (
            <span key={zone} className={cn("px-2 py-0.5 rounded border font-mono", zoneColors[zone])}>
              {zoneLabels[zone]}
            </span>
          ))}
        </div>
        <button onClick={() => setIsPlaying(p => !p)}
          className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 border border-violet-500/20 transition-colors">
          {isPlaying ? "⏸ Pause" : "▶ Start"}
        </button>
      </div>
      <div className="space-y-1.5">
        {tokenSteps.map((ts, i) => {
          const active = i < step;
          const isCurrent = i === step - 1;
          return (
            <div
              key={i}
              className={cn(
                "flex items-center gap-2.5 rounded border px-3 py-2 transition-all duration-300",
                !active && "border-border/20 bg-muted/5 text-muted-foreground/25",
                active && !isCurrent && zoneColors[ts.zone],
                isCurrent && "ring-1 ring-current/20"
              )}
            >
              <span className={cn("text-[9px] font-mono px-1 py-0.5 rounded border shrink-0", active ? zoneColors[ts.zone] : "border-border/20 text-muted-foreground/20")}>
                {zoneLabels[ts.zone]}
              </span>
              <span className="text-xs font-medium">{ts.label}</span>
              {active && <span className="text-[10px] text-muted-foreground/60 truncate">{ts.desc}</span>}
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-2 gap-3 text-[11px]">
        <div className="rounded border border-red-500/20 bg-red-500/5 p-3">
          <p className="text-red-400 font-semibold mb-1">SAQ D (without Stripe)</p>
          <p className="text-muted-foreground">300+ security requirements, annual on-site audit, quarterly network scans</p>
        </div>
        <div className="rounded border border-emerald-500/20 bg-emerald-500/5 p-3">
          <p className="text-emerald-400 font-semibold mb-1">SAQ A (with Stripe.js)</p>
          <p className="text-muted-foreground">22 requirements, self-assessment only, no on-site audit needed</p>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Main Page                                                          */
/* ================================================================== */
export default function StripeCaseStudyPage() {
  return (
    <div className="space-y-10">
      <TopicHero
        title="Stripe"
        subtitle="How Stripe processes billions of payments reliably — idempotent APIs, the payment state machine, PCI DSS via tokenization, and webhook delivery guarantees"
        difficulty="advanced"
        estimatedMinutes={25}
      />

      {/* Design it yourself */}
      <AhaMoment
        question="Before reading: what is the hardest part of building a payment API? Think about network failures."
        answer={
          <div className="space-y-2">
            <p className="font-medium text-foreground">The real challenges go beyond just accepting cards:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Networks fail — a request succeeds server-side but the response never arrives</li>
              <li>Retrying a failed charge without idempotency = double-charging a customer</li>
              <li>Card numbers on merchant servers = massive PCI compliance burden</li>
              <li>Merchant servers go down — webhook delivery must survive outages</li>
              <li>99.999% uptime = only 5 minutes 15 seconds of downtime per year</li>
            </ul>
            <p className="text-muted-foreground/70 italic text-sm mt-1">
              The &quot;charge twice on retry&quot; bug is not hypothetical — it has cost companies millions in chargebacks and customer trust. Stripe&apos;s idempotency keys solve this elegantly.
            </p>
          </div>
        }
      />

      {/* Payment Flow Architecture */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Payment Flow Architecture</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          A single Stripe API call passes through 20+ internal services. The simplified critical path below shows the key components from merchant SDK to bank authorization. Every hop is stateless and independently scalable — the Payment Intent Service acts as the central orchestrator maintaining the payment state machine.
        </p>
        <div className="rounded-xl border border-border/30 bg-muted/5 overflow-hidden" style={{ minHeight: 620 }}>
          <FlowDiagram nodes={paymentFlowNodes} edges={paymentFlowEdges} minHeight={600} allowDrag={true} />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[10px] font-mono text-center">
          {[
            { label: "API Requests / Day", value: "1B+", color: "text-blue-400" },
            { label: "Uptime SLA", value: "99.999%", color: "text-emerald-400" },
            { label: "p99 API Latency", value: "<300ms", color: "text-violet-400" },
            { label: "Supported Currencies", value: "135+", color: "text-amber-400" },
          ].map((s) => (
            <div key={s.label} className="rounded bg-muted/20 p-3">
              <p className={cn("font-bold text-xl mb-0.5", s.color)}>{s.value}</p>
              <p className="text-muted-foreground/60">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Idempotency Keys — the core innovation */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Idempotency Keys — Safe Retries for Payments</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The core problem: networks are unreliable. A charge request can succeed server-side but the HTTP response can be lost in transit. If the client retries, the customer could be charged twice. Stripe&apos;s idempotency keys let the server detect retries and return the cached original result instead of processing again.
        </p>
        <IdempotencyPlayground />
        <BeforeAfter
          before={{
            title: "Without Idempotency Keys",
            content: (
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>Merchant POSTs to /v1/charges with amount $200</li>
                <li>Stripe charges the card successfully</li>
                <li>Network timeout — response lost</li>
                <li>Merchant retries same POST</li>
                <li className="text-red-400 font-medium">Stripe charges $200 again — total: $400</li>
                <li className="text-red-400 font-medium">Customer disputes, chargeback filed</li>
              </ul>
            ),
          }}
          after={{
            title: "With Idempotency Keys",
            content: (
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>Merchant POSTs with Idempotency-Key: uuid-xyz</li>
                <li>Stripe charges $200, stores response with key uuid-xyz</li>
                <li>Network timeout — response lost</li>
                <li>Merchant retries with same key uuid-xyz</li>
                <li className="text-emerald-400 font-medium">Stripe finds key, returns cached response</li>
                <li className="text-emerald-400 font-medium">Customer charged exactly $200 — once</li>
              </ul>
            ),
          }}
        />
      </section>

      <ConversationalCallout type="tip">
        Stripe stores idempotency keys in Redis for 24 hours. The key is associated with the full API response, request parameters, and a hash of the request body. If a retry comes in with the same key but different parameters, Stripe returns a 422 error — not the cached response — because different parameters indicate a programming bug, not a retry.
      </ConversationalCallout>

      {/* PaymentIntent State Machine */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">PaymentIntent State Machine</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Stripe models every payment as a state machine. The two-phase approach — <strong>authorize</strong> (hold funds) then <strong>capture</strong> (transfer funds) — ensures partial failures never result in lost money. Each state transition is persisted atomically.
        </p>
        <PaymentStateMachine />
      </section>

      <AhaMoment
        question="Why separate authorization and capture into two distinct steps?"
        answer={
          <p>
            Authorization holds funds without moving them. The merchant can then verify inventory, run fraud checks, confirm the order — and only then capture. If anything fails before capture, the authorization expires automatically (typically 7 days). No refund needed, no money moved. This is critical for hotels (authorize at check-in, capture at checkout), marketplaces (authorize when ordered, capture when shipped), and any business with fulfillment delays.
          </p>
        }
      />

      {/* Tokenization & PCI */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Tokenization — The PCI DSS Boundary</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          PCI DSS compliance is one of the most expensive parts of accepting cards. Stripe&apos;s key insight: render the card input inside an <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">iframe</code> hosted on Stripe&apos;s domain. Raw card numbers never touch merchant servers. Even a complete merchant server breach exposes only tokens — useless without Stripe&apos;s decryption keys.
        </p>
        <TokenizationViz />
      </section>

      <ConversationalCallout type="warning">
        The PCI DSS scope reduction is enormous in practice. Without Stripe, merchants handling raw card data must meet SAQ D: 300+ security controls, annual on-site audits by a Qualified Security Assessor (QSA), quarterly network vulnerability scans. With Stripe.js, they qualify for SAQ A: 22 controls, self-assessment only, no QSA audit. The iframe boundary is what makes this possible.
      </ConversationalCallout>

      {/* Webhook Retry Simulation */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Webhook Reliability — Exponential Backoff</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Payment events (succeeded, failed, disputed) are delivered to merchants via webhooks. Since merchant servers can be down for hours, Stripe implements exponential backoff retries over 3 days. Delivery is <strong>at-least-once</strong> — merchants may receive the same event multiple times and must implement idempotent handlers.
        </p>
        <WebhookRetryPlayground />
      </section>

      <ConversationalCallout type="question">
        Stripe guarantees at-least-once webhook delivery, not exactly-once. This means a merchant&apos;s webhook handler must be idempotent: check whether the event ID has already been processed before acting on it. How would you implement this? Store processed event IDs in a database with a unique constraint — if the INSERT fails, you have already processed this event. What is the right TTL for these records?
      </ConversationalCallout>

      {/* Request Tracing */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Request Tracing — Where Time Goes</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Every Stripe API request carries a unique <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">Stripe-Request-Id</code> header traceable through all internal services. The waterfall below shows how time is spent in a typical payment request — and why the card network dominates.
        </p>
        <RequestTracingViz />
      </section>

      {/* Data Storage */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Data Storage Strategy</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Stripe uses polyglot persistence — each data type is stored in the system best suited for its access pattern and consistency requirements.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { name: "PostgreSQL (Sharded)", purpose: "Payment records, customer data", detail: "Heavily sharded across hundreds of servers. Each shard owns a partition of merchants. ACID transactions guarantee payment consistency.", color: "blue" },
            { name: "Redis Clusters", purpose: "Idempotency cache, rate limiting, sessions", detail: "Sub-millisecond lookups for idempotency key checks. Idempotency keys expire after 24 hours. Rate limit counters use sliding window algorithm.", color: "orange" },
            { name: "Append-Only Ledger", purpose: "Financial audit trail", detail: "Custom-built immutable ledger. Every money movement is recorded as a debit+credit pair. Critical for reconciliation and regulatory compliance.", color: "violet" },
            { name: "MongoDB", purpose: "Logs, analytics, audit events", detail: "Schema-flexible storage for high-volume structured logs. Used for internal observability and debugging — never on the payment-critical path.", color: "emerald" },
          ].map((db) => (
            <div
              key={db.name}
              className={cn(
                "rounded-lg border p-3",
                db.color === "blue" && "border-blue-500/20 bg-blue-500/5",
                db.color === "orange" && "border-orange-500/20 bg-orange-500/5",
                db.color === "violet" && "border-violet-500/20 bg-violet-500/5",
                db.color === "emerald" && "border-emerald-500/20 bg-emerald-500/5"
              )}
            >
              <p className={cn(
                "text-[10px] font-semibold uppercase tracking-wider mb-0.5",
                db.color === "blue" && "text-blue-400",
                db.color === "orange" && "text-orange-400",
                db.color === "violet" && "text-violet-400",
                db.color === "emerald" && "text-emerald-400"
              )}>{db.name}</p>
              <p className="text-xs font-medium mb-1">{db.purpose}</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{db.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <ConversationalCallout type="tip">
        The append-only ledger is philosophically different from the PostgreSQL payment database. Payment records need to be updatable (marking a payment as refunded). The ledger must be truly immutable for regulatory auditing — each entry is a debit+credit pair, and no entry is ever deleted or modified. This double-entry bookkeeping enables perfect reconciliation across currencies and jurisdictions.
      </ConversationalCallout>

      <KeyTakeaway
        points={[
          "Idempotency keys are the most important safety primitive in payment APIs. Every mutating call must accept a client-generated key to prevent duplicate charges on retry.",
          "The two-phase payment model (authorize then capture) ensures partial failures never move money. Holds expire automatically if not captured.",
          "Tokenization via Stripe.js iframe keeps raw card numbers off merchant servers, reducing PCI scope from 300+ to 22 requirements.",
          "Webhooks use at-least-once delivery with exponential backoff over 3 days. Merchant handlers must be idempotent — check event ID before processing.",
          "Over 80% of payment latency is the card network round-trip (~200ms). Stripe&apos;s own infrastructure adds only ~50ms of overhead.",
          "The PaymentIntent state machine persists each transition atomically. If the system crashes, it can resume from the last known state without double-charging.",
          "99.999% uptime means 5 minutes 15 seconds of total downtime per year. This requires geographic redundancy, automated failover, and circuit breakers on every service boundary.",
          "Polyglot persistence: PostgreSQL for ACID payment records, Redis for idempotency + rate limiting, append-only ledger for immutable financial audit trail.",
        ]}
      />
    </div>
  );
}
