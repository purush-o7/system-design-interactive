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
import { InteractiveDemo } from "@/components/interactive-demo";
import { MetricCounter } from "@/components/metric-counter";
import { AhaMoment } from "@/components/aha-moment";
import { ConversationalCallout } from "@/components/conversational-callout";
import { BeforeAfter } from "@/components/before-after";
import { cn } from "@/lib/utils";
import { Activity, ShieldOff, ShieldCheck, ShieldAlert, Zap, Timer, ArrowRight, CheckCircle2, XCircle } from "lucide-react";

type CircuitState = "closed" | "open" | "half-open";

function CircuitStateMachine() {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setPhase((p) => (p + 1) % 12), 1200);
    return () => clearInterval(t);
  }, []);

  const state: CircuitState =
    phase < 4 ? "closed" :
    phase < 8 ? "open" :
    phase < 10 ? "half-open" :
    "closed";

  const failureCount = phase < 4 ? phase : 0;
  const probeResult = phase === 9 ? "success" : phase === 8 ? "testing" : null;

  const stateConfig = {
    closed: { color: "emerald", icon: ShieldCheck, label: "CLOSED", bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-400" },
    open: { color: "red", icon: ShieldOff, label: "OPEN", bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-400" },
    "half-open": { color: "amber", icon: ShieldAlert, label: "HALF-OPEN", bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400" },
  };

  const cfg = stateConfig[state];
  const Icon = cfg.icon;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-6">
        {(["closed", "open", "half-open"] as const).map((s) => {
          const c = stateConfig[s];
          const isActive = state === s;
          const SIcon = c.icon;
          return (
            <div key={s} className="text-center space-y-2">
              <div className={cn(
                "size-16 rounded-2xl border-2 flex items-center justify-center mx-auto transition-all duration-500",
                isActive ? `${c.bg} ${c.border} scale-110` : "bg-muted/20 border-border/40 scale-100"
              )}>
                <SIcon className={cn(
                  "size-7 transition-colors duration-300",
                  isActive ? c.text : "text-muted-foreground/30"
                )} />
              </div>
              <p className={cn(
                "text-[11px] font-mono font-bold transition-colors",
                isActive ? c.text : "text-muted-foreground/30"
              )}>
                {c.label}
              </p>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-4 px-4">
        <div className="flex-1">
          <div className="flex justify-between text-[10px] text-muted-foreground/50 mb-1">
            <span>Failure threshold</span>
            <span>{failureCount}/5</span>
          </div>
          <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                failureCount >= 4 ? "bg-red-500" : failureCount >= 2 ? "bg-amber-500" : "bg-emerald-500"
              )}
              style={{ width: `${(failureCount / 5) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-muted/10 border border-border/30 px-4 py-2.5">
        <p className="text-[11px] text-muted-foreground">
          {state === "closed" && failureCount === 0 && "Requests flowing normally. Circuit monitoring for failures."}
          {state === "closed" && failureCount > 0 && failureCount < 4 && `Failures detected: ${failureCount}/5. Counting toward threshold...`}
          {state === "closed" && failureCount >= 4 && "Threshold almost reached! One more failure trips the circuit."}
          {state === "open" && "Circuit OPEN. All requests rejected immediately (fail-fast). Waiting for timeout..."}
          {state === "half-open" && probeResult === "testing" && "Sending single probe request to test if dependency recovered..."}
          {state === "half-open" && probeResult === "success" && "Probe succeeded! Closing circuit. Normal operation resuming."}
        </p>
      </div>
    </div>
  );
}

function FailureRateWindow() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((s) => (s + 1) % 20), 600);
    return () => clearInterval(t);
  }, []);

  const windowSize = 10;
  const calls = Array.from({ length: windowSize }, (_, i) => {
    const idx = (tick - i + 20) % 20;
    if (idx < 6) return "success";
    if (idx < 10) return "fail";
    if (idx < 13) return "slow";
    return "success";
  });

  const failures = calls.filter((c) => c === "fail").length;
  const slow = calls.filter((c) => c === "slow").length;
  const failureRate = Math.round((failures / windowSize) * 100);
  const slowRate = Math.round((slow / windowSize) * 100);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] font-mono text-muted-foreground/50 w-20">Sliding window:</span>
        <div className="flex gap-1 flex-1">
          {calls.map((c, i) => (
            <div
              key={i}
              className={cn(
                "flex-1 h-8 rounded-md flex items-center justify-center transition-all duration-300 border",
                c === "success" ? "bg-emerald-500/10 border-emerald-500/20" :
                c === "fail" ? "bg-red-500/15 border-red-500/30" :
                "bg-amber-500/10 border-amber-500/20"
              )}
            >
              {c === "success" ? (
                <CheckCircle2 className="size-3 text-emerald-400" />
              ) : c === "fail" ? (
                <XCircle className="size-3 text-red-400" />
              ) : (
                <Timer className="size-3 text-amber-400" />
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-md bg-muted/20 border border-border/30 px-3 py-2 text-center">
          <p className="text-[10px] text-muted-foreground mb-0.5">Failure Rate</p>
          <p className={cn(
            "text-sm font-mono font-bold",
            failureRate >= 50 ? "text-red-400" : failureRate >= 30 ? "text-amber-400" : "text-emerald-400"
          )}>
            {failureRate}%
          </p>
        </div>
        <div className="rounded-md bg-muted/20 border border-border/30 px-3 py-2 text-center">
          <p className="text-[10px] text-muted-foreground mb-0.5">Slow Call Rate</p>
          <p className={cn(
            "text-sm font-mono font-bold",
            slowRate >= 50 ? "text-red-400" : slowRate >= 30 ? "text-amber-400" : "text-emerald-400"
          )}>
            {slowRate}%
          </p>
        </div>
        <div className="rounded-md bg-muted/20 border border-border/30 px-3 py-2 text-center">
          <p className="text-[10px] text-muted-foreground mb-0.5">Threshold</p>
          <p className="text-sm font-mono font-bold text-muted-foreground">50%</p>
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground/60">
        Resilience4j uses a sliding window (count-based or time-based) to calculate failure rate.
        The circuit trips when the rate exceeds the configured threshold.
      </p>
    </div>
  );
}

function CascadeViz() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % 8), 1500);
    return () => clearInterval(t);
  }, []);

  const services = [
    { name: "Frontend", level: 0 },
    { name: "API Gateway", level: 1 },
    { name: "Order Svc", level: 2 },
    { name: "Payment Svc", level: 3 },
    { name: "Bank API", level: 4 },
  ];

  const withBreaker = step >= 4;
  const failureLevel = withBreaker ? 3 : Math.min(step, 4);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <span className={cn(
          "text-[10px] font-mono px-2 py-0.5 rounded-full border transition-all",
          withBreaker
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
            : "bg-red-500/10 border-red-500/30 text-red-400"
        )}>
          {withBreaker ? "WITH CIRCUIT BREAKER" : "WITHOUT CIRCUIT BREAKER"}
        </span>
      </div>

      <div className="space-y-1">
        {services.map((svc, i) => {
          const isRoot = i === services.length - 1;
          const isFailed = !withBreaker
            ? i >= (services.length - failureLevel)
            : isRoot;
          const isProtected = withBreaker && i < services.length - 1 && i >= services.length - 2;

          return (
            <div key={svc.name} className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-muted-foreground/40 w-6 text-right">{i + 1}</span>
              <div
                className={cn(
                  "flex-1 flex items-center gap-2 rounded-md border px-3 py-1.5 transition-all duration-500",
                  isFailed
                    ? "bg-red-500/10 border-red-500/30"
                    : isProtected
                    ? "bg-amber-500/8 border-amber-500/20"
                    : "bg-emerald-500/8 border-emerald-500/20"
                )}
                style={{ marginLeft: `${i * 16}px` }}
              >
                <div className={cn(
                  "size-1.5 rounded-full",
                  isFailed ? "bg-red-500 animate-pulse" : isProtected ? "bg-amber-500" : "bg-emerald-500"
                )} />
                <span className={cn(
                  "text-[11px] font-medium",
                  isFailed ? "text-red-400" : isProtected ? "text-amber-400" : "text-emerald-400"
                )}>
                  {svc.name}
                </span>
                {isFailed && <XCircle className="size-3 text-red-400 ml-auto" />}
                {isProtected && <ShieldCheck className="size-3 text-amber-400 ml-auto" />}
                {!isFailed && !isProtected && <CheckCircle2 className="size-3 text-emerald-400/50 ml-auto" />}
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-[11px] text-muted-foreground/60 pl-8">
        {!withBreaker && step < 2
          ? "Bank API becomes slow (8s response time)..."
          : !withBreaker && step < 4
          ? "Without a circuit breaker, every upstream service backs up and fails in cascade."
          : withBreaker && step < 6
          ? "With a circuit breaker on Payment Svc, the failure is contained. Order Svc gets a fast fallback."
          : withBreaker
          ? "Upstream services stay healthy. Users see 'payment temporarily unavailable' instead of a total outage."
          : ""}
      </p>
    </div>
  );
}

export default function CircuitBreakerPage() {
  const [circuitState, setCircuitState] = useState<CircuitState>("closed");
  const [failures, setFailures] = useState(0);
  const [successes, setSuccesses] = useState(0);
  const [totalRequests, setTotalRequests] = useState(0);
  const [recentResults, setRecentResults] = useState<Array<{ type: "success" | "fail" | "rejected"; time: number }>>([]);
  const threshold = 5;

  const simulateRequest = (succeeds: boolean) => {
    setTotalRequests((t) => t + 1);
    const now = Date.now();

    if (circuitState === "open") {
      setRecentResults((r) => [...r.slice(-9), { type: "rejected", time: now }]);
      return;
    }

    if (circuitState === "half-open") {
      if (succeeds) {
        setSuccesses((s) => s + 1);
        setCircuitState("closed");
        setFailures(0);
        setRecentResults((r) => [...r.slice(-9), { type: "success", time: now }]);
      } else {
        setFailures((f) => f + 1);
        setCircuitState("open");
        setRecentResults((r) => [...r.slice(-9), { type: "fail", time: now }]);
      }
      return;
    }

    if (succeeds) {
      setSuccesses((s) => s + 1);
      setRecentResults((r) => [...r.slice(-9), { type: "success", time: now }]);
    } else {
      const newFailures = failures + 1;
      setFailures(newFailures);
      setRecentResults((r) => [...r.slice(-9), { type: "fail", time: now }]);
      if (newFailures >= threshold) {
        setCircuitState("open");
      }
    }
  };

  const resetCircuit = () => {
    setCircuitState("closed");
    setFailures(0);
    setSuccesses(0);
    setTotalRequests(0);
    setRecentResults([]);
  };

  return (
    <div className="space-y-8">
      <TopicHero
        title="Circuit Breaker"
        subtitle="Stop hammering a dead service. It's not going to answer faster if you ask louder."
        difficulty="intermediate"
      />

      <FailureScenario title="One slow dependency takes down everything">
        <p className="text-sm text-muted-foreground">
          Your checkout service calls a payment gateway. The gateway starts responding slowly — 8 seconds
          instead of 200ms. Your checkout service has 200 threads, each waiting on the gateway. Within
          minutes, <strong className="text-red-400">all 200 threads are blocked</strong>, waiting for responses that
          may never come. Now the checkout service can&apos;t handle <em>any</em> requests — not even ones that
          don&apos;t need the payment gateway. The product catalog service also calls checkout for pricing —
          it backs up too. One slow dependency has <strong className="text-red-400">cascaded into a full system outage</strong>.
        </p>
        <div className="flex justify-center gap-3 pt-4">
          <ServerNode type="server" label="Catalog" sublabel="Backed up" status="warning" />
          <ServerNode type="server" label="Checkout" sublabel="200/200 threads" status="unhealthy" />
          <ServerNode type="cloud" label="Payment API" sublabel="8s latency" status="warning" />
        </div>
      </FailureScenario>

      <WhyItBreaks title="Cascading failure — the most dangerous failure mode">
        <p className="text-sm text-muted-foreground">
          Without a circuit breaker, your service keeps retrying a failing dependency indefinitely.
          Each retry consumes a thread, a connection, memory, and time. The calling service <strong>exhausts
          its own resources</strong> waiting for a service that can&apos;t respond. The failure propagates
          upstream through every service that depends on the caller. This is a <strong>cascading
          failure</strong> — one sick microservice infects the entire system like a chain reaction.
        </p>
        <CascadeViz />
      </WhyItBreaks>

      <ConceptVisualizer title="The Circuit Breaker State Machine">
        <p className="text-sm text-muted-foreground mb-4">
          A circuit breaker is a state machine that sits between your service and its dependency.
          It monitors failures and automatically stops sending requests when a dependency is unhealthy.
          The name comes from electrical circuit breakers — they &quot;trip&quot; to prevent damage
          when current exceeds safe levels.
        </p>
        <CircuitStateMachine />
      </ConceptVisualizer>

      <ConceptVisualizer title="Sliding Window — How Failures Are Counted">
        <p className="text-sm text-muted-foreground mb-4">
          Modern circuit breakers like Resilience4j don&apos;t just count consecutive failures. They use
          a <strong>sliding window</strong> to calculate failure rate as a percentage. The window can be
          count-based (last N calls) or time-based (last N seconds). The circuit trips when the failure
          rate or slow call rate exceeds a configured threshold.
        </p>
        <FailureRateWindow />
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="rounded-lg border border-border/50 bg-muted/10 p-3">
            <p className="text-[11px] font-semibold mb-1">Count-Based Window</p>
            <p className="text-[10px] text-muted-foreground">
              Tracks the last N calls (e.g., 100). The failure rate is calculated from
              these N calls regardless of time. Good for services with steady traffic.
            </p>
          </div>
          <div className="rounded-lg border border-border/50 bg-muted/10 p-3">
            <p className="text-[11px] font-semibold mb-1">Time-Based Window</p>
            <p className="text-[10px] text-muted-foreground">
              Tracks calls in the last N seconds (e.g., 60s). Adapts to variable traffic
              patterns. More memory-efficient for high-throughput services.
            </p>
          </div>
        </div>
      </ConceptVisualizer>

      <AnimatedFlow
        steps={[
          { id: "closed", label: "Closed", description: "Requests pass through, failures tracked in sliding window", icon: <ShieldCheck className="size-4" /> },
          { id: "threshold", label: "Threshold Hit", description: "Failure rate exceeds 50% in window of 10 calls", icon: <Activity className="size-4" /> },
          { id: "open", label: "Open", description: "All requests fail-fast (2ms vs 8s). Dependency rests", icon: <ShieldOff className="size-4" /> },
          { id: "timeout", label: "Wait Duration", description: "60s cooldown expires — circuit enters half-open", icon: <Timer className="size-4" /> },
          { id: "half-open", label: "Half-Open", description: "3 probe requests allowed through to test recovery", icon: <ShieldAlert className="size-4" /> },
          { id: "result", label: "Probe Result", description: "Probes succeed → close. Any fail → reopen for another 60s", icon: <Zap className="size-4" /> },
        ]}
        interval={2000}
      />

      <InteractiveDemo title="Circuit Breaker Simulator">
        {() => (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Circuit:</span>
                <span className={cn(
                  "text-sm font-bold font-mono uppercase px-2.5 py-0.5 rounded-full border",
                  circuitState === "closed"
                    ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
                    : circuitState === "open"
                    ? "text-red-400 bg-red-500/10 border-red-500/30"
                    : "text-amber-400 bg-amber-500/10 border-amber-500/30"
                )}>
                  {circuitState}
                </span>
              </div>
              <button onClick={resetCircuit} className="px-3 py-1 rounded-md text-xs bg-muted hover:bg-muted/80 transition-colors">
                Reset
              </button>
            </div>

            {recentResults.length > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-muted-foreground/50 w-16">History:</span>
                <div className="flex gap-0.5">
                  {recentResults.map((r, i) => (
                    <div
                      key={i}
                      className={cn(
                        "size-5 rounded flex items-center justify-center",
                        r.type === "success" ? "bg-emerald-500/15" :
                        r.type === "fail" ? "bg-red-500/15" :
                        "bg-muted/30"
                      )}
                    >
                      {r.type === "success" ? (
                        <CheckCircle2 className="size-3 text-emerald-400" />
                      ) : r.type === "fail" ? (
                        <XCircle className="size-3 text-red-400" />
                      ) : (
                        <ShieldOff className="size-3 text-muted-foreground/40" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => simulateRequest(true)}
                className="px-3 py-1.5 rounded-md text-xs font-medium bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30 transition-colors"
              >
                Send Success
              </button>
              <button
                onClick={() => simulateRequest(false)}
                className="px-3 py-1.5 rounded-md text-xs font-medium bg-red-500/20 text-red-500 hover:bg-red-500/30 transition-colors"
              >
                Send Failure
              </button>
              {circuitState === "open" && (
                <button
                  onClick={() => setCircuitState("half-open")}
                  className="px-3 py-1.5 rounded-md text-xs font-medium bg-amber-500/20 text-amber-500 hover:bg-amber-500/30 transition-colors"
                >
                  Timeout Expired (Half-Open)
                </button>
              )}
            </div>

            {circuitState === "open" && (
              <p className="text-xs text-red-400 bg-red-500/5 border border-red-500/20 rounded-md px-3 py-2">
                Circuit OPEN — requests rejected immediately in ~2ms instead of waiting 8s for a timeout.
                The dependency gets breathing room to recover.
              </p>
            )}

            <div className="grid grid-cols-4 gap-3">
              <MetricCounter label="Failures" value={failures} trend={failures > 0 ? "up" : "neutral"} />
              <MetricCounter label="Successes" value={successes} trend={successes > 0 ? "down" : "neutral"} />
              <MetricCounter label="Total" value={totalRequests} />
              <MetricCounter
                label="Fail Rate"
                value={totalRequests > 0 ? Math.round((failures / totalRequests) * 100) : 0}
                unit="%"
                trend={failures / Math.max(totalRequests, 1) > 0.5 ? "up" : "neutral"}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Threshold: <strong>{failures}/{threshold}</strong> failures to trip.
              {circuitState === "half-open" && " Half-open: next request determines the outcome."}
            </p>
          </div>
        )}
      </InteractiveDemo>

      <CorrectApproach title="Configuration That Actually Works">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            These are real-world configuration parameters from Resilience4j. Getting them wrong is worse
            than having no circuit breaker at all — too sensitive and you trip on transient errors, too
            lenient and you don&apos;t protect against cascades.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 pr-3 font-semibold">Parameter</th>
                  <th className="text-left py-2 pr-3 font-semibold">Recommended Start</th>
                  <th className="text-left py-2 font-semibold">Why</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b">
                  <td className="py-2 pr-3 font-medium text-foreground font-mono text-[11px]">failureRateThreshold</td>
                  <td className="py-2 pr-3">50%</td>
                  <td className="py-2">Half your calls failing means the dependency is genuinely down</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 pr-3 font-medium text-foreground font-mono text-[11px]">slowCallRateThreshold</td>
                  <td className="py-2 pr-3">80%</td>
                  <td className="py-2">Slow calls are often worse than failures — they hold threads hostage</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 pr-3 font-medium text-foreground font-mono text-[11px]">slowCallDurationThreshold</td>
                  <td className="py-2 pr-3">2s</td>
                  <td className="py-2">Anything over 2s is slow enough to accumulate thread pressure</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 pr-3 font-medium text-foreground font-mono text-[11px]">slidingWindowSize</td>
                  <td className="py-2 pr-3">10-100</td>
                  <td className="py-2">Smaller for low-traffic services, larger for high-throughput</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 pr-3 font-medium text-foreground font-mono text-[11px]">minimumNumberOfCalls</td>
                  <td className="py-2 pr-3">5-10</td>
                  <td className="py-2">Don&apos;t trip on 1 out of 2 calls — wait for statistical significance</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 pr-3 font-medium text-foreground font-mono text-[11px]">waitDurationInOpenState</td>
                  <td className="py-2 pr-3">60s</td>
                  <td className="py-2">Give the dependency a full minute to recover before probing</td>
                </tr>
                <tr>
                  <td className="py-2 pr-3 font-medium text-foreground font-mono text-[11px]">permittedCallsInHalfOpen</td>
                  <td className="py-2 pr-3">3</td>
                  <td className="py-2">Send 3 probes to confirm recovery isn&apos;t a fluke</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </CorrectApproach>

      <BeforeAfter
        before={{
          title: "Without Circuit Breaker",
          content: (
            <div className="space-y-3">
              <div className="flex justify-center gap-2">
                <ServerNode type="server" label="Your Service" sublabel="All threads blocked" status="unhealthy" />
                <ServerNode type="cloud" label="Dependency" sublabel="8s response" status="warning" />
              </div>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>- Each request waits 8s for timeout</li>
                <li>- 200 threads exhausted in minutes</li>
                <li>- Cascading failure to all upstream services</li>
                <li>- Users see 30s hangs then generic 500s</li>
                <li>- Dependency gets hammered, can&apos;t recover</li>
              </ul>
            </div>
          ),
        }}
        after={{
          title: "With Circuit Breaker",
          content: (
            <div className="space-y-3">
              <div className="flex justify-center gap-2">
                <ServerNode type="server" label="Your Service" sublabel="Responsive" status="healthy" />
                <ServerNode type="cloud" label="Dependency" sublabel="Recovering" status="warning" />
              </div>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>+ Requests fail-fast in 2ms</li>
                <li>+ Threads freed immediately</li>
                <li>+ Failure contained — no cascade</li>
                <li>+ Users see &quot;temporarily unavailable&quot;</li>
                <li>+ Dependency gets breathing room to recover</li>
              </ul>
            </div>
          ),
        }}
      />

      <AhaMoment
        question="If we're just rejecting requests when the circuit is open, aren't we still failing?"
        answer={
          <p>
            Yes, but you&apos;re <em>failing fast</em> — in 2ms instead of 8 seconds. The key difference:
            a 2ms rejection frees the thread immediately, while an 8-second timeout holds the thread
            hostage. With circuit breakers, your service stays responsive and can serve every request
            that <em>doesn&apos;t</em> depend on the failed service. You&apos;re trading partial failure
            for total collapse. And your fallback response (&quot;payment temporarily unavailable, try
            again in a minute&quot;) is infinitely better than a blank page.
          </p>
        }
      />

      <ConversationalCallout type="tip">
        Netflix created Hystrix, the original circuit breaker library — but it&apos;s now in maintenance
        mode. Modern alternatives: <strong>Resilience4j</strong> (Java), <strong>Polly</strong> (.NET),
        <strong> opossum</strong> (Node.js), and <strong>failsafe-go</strong> (Go). Don&apos;t build your
        own in production — these libraries handle edge cases like concurrent state transitions,
        thread-safe counters, and metrics integration that are surprisingly hard to get right.
      </ConversationalCallout>

      <ConversationalCallout type="warning">
        A circuit breaker without a fallback is just a fancier error. Always define what happens when
        the circuit opens: return cached data, a default response, or a meaningful error message. The
        fallback is where the real user experience work happens.
      </ConversationalCallout>

      <AhaMoment
        question="How do circuit breakers relate to the bulkhead pattern?"
        answer={
          <p>
            Circuit breakers stop calling a failing service. Bulkheads limit how much of your thread
            pool any single dependency can consume. Together, they prevent cascading failures from two
            different angles. A circuit breaker says &quot;stop sending requests to payment service,&quot;
            while a bulkhead says &quot;payment service can never use more than 50 of our 200 threads.&quot;
            Even if the circuit breaker is slow to trip, the bulkhead ensures 150 threads remain
            available for other work.
          </p>
        }
      />

      <ConversationalCallout type="tip">
        The circuit breaker is the server-side protection. On the client side, use exponential backoff
        with jitter to prevent retry storms. Formula:{" "}
        <code className="text-xs bg-muted px-1 rounded font-mono">wait = min(base * 2^attempt + random_jitter, max_wait)</code>.
        Without jitter, all clients retry at the same instant after a failure, creating a thundering
        herd that re-triggers the circuit breaker immediately. Jitter spreads retries over time,
        giving the recovering service a chance to ramp up gradually.
      </ConversationalCallout>

      <KeyTakeaway
        points={[
          "A circuit breaker prevents cascading failures by stopping requests to an unhealthy dependency — protecting your service's thread pool.",
          "Three states: Closed (normal flow), Open (fail-fast in milliseconds), Half-Open (probe requests test if the dependency recovered).",
          "Modern implementations use sliding windows (count-based or time-based) to calculate failure rate, not just consecutive failure counts.",
          "Key parameters: failure rate threshold (50%), slow call threshold (2s), wait duration in open state (60s), minimum calls before evaluation (5-10).",
          "Always provide a meaningful fallback when the circuit opens — 'temporarily unavailable' beats a 30-second hang followed by a 500 error.",
          "Circuit breaker state changes are critical operational signals — alert on them. Frequent trips indicate a systemic problem that needs investigation.",
        ]}
      />
    </div>
  );
}
