"use client";

import { useState, useCallback, useRef, useMemo } from "react";
import { TopicHero } from "@/components/topic-hero";
import { KeyTakeaway } from "@/components/key-takeaway";
import { AhaMoment } from "@/components/aha-moment";
import { ConversationalCallout } from "@/components/conversational-callout";
import { FlowDiagram, type FlowNode, type FlowEdge } from "@/components/flow-diagram";
import { LiveChart } from "@/components/live-chart";
import { Playground } from "@/components/playground";
import { cn } from "@/lib/utils";
import { WhyCare } from "@/components/why-care";
import { GlossaryTerm } from "@/components/glossary-term";
import { TopicQuiz } from "@/components/topic-quiz";
import { MarkerType } from "@xyflow/react";
import {
  ShieldCheck,
  ShieldOff,
  ShieldAlert,
  Zap,
  Send,
  Heart,
  HeartCrack,
  RotateCcw,
  ArrowRight,
} from "lucide-react";

type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";

interface RequestLog {
  time: number;
  latency: number;
  errorRate: number;
  state: CircuitState;
}

const FAILURE_THRESHOLD = 5;
const HALF_OPEN_TIMEOUT_MS = 4000;

export default function CircuitBreakerPage() {
  const [circuitState, setCircuitState] = useState<CircuitState>("CLOSED");
  const [serviceBHealthy, setServiceBHealthy] = useState(true);
  const [failureCount, setFailureCount] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [requestLog, setRequestLog] = useState<RequestLog[]>([]);
  const [lastRequestResult, setLastRequestResult] = useState<"success" | "fail" | "rejected" | null>(null);
  const [animatingRequest, setAnimatingRequest] = useState(false);
  const halfOpenTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tickCounter = useRef(0);

  const addLogEntry = useCallback((latency: number, errRate: number, state: CircuitState) => {
    tickCounter.current += 1;
    setRequestLog((prev) => {
      const next = [...prev, { time: tickCounter.current, latency, errorRate: errRate, state }];
      return next.slice(-25);
    });
  }, []);

  const startHalfOpenTimer = useCallback(() => {
    if (halfOpenTimerRef.current) clearTimeout(halfOpenTimerRef.current);
    halfOpenTimerRef.current = setTimeout(() => {
      setCircuitState("HALF_OPEN");
    }, HALF_OPEN_TIMEOUT_MS);
  }, []);

  const sendRequest = useCallback(() => {
    if (animatingRequest) return;
    setAnimatingRequest(true);

    setTimeout(() => {
      if (circuitState === "OPEN") {
        setLastRequestResult("rejected");
        addLogEntry(2, 100, "OPEN");
        setAnimatingRequest(false);
        return;
      }

      if (circuitState === "HALF_OPEN") {
        if (serviceBHealthy) {
          setLastRequestResult("success");
          setCircuitState("CLOSED");
          setFailureCount(0);
          setSuccessCount((s) => s + 1);
          addLogEntry(50, 0, "CLOSED");
        } else {
          setLastRequestResult("fail");
          setCircuitState("OPEN");
          addLogEntry(3000, 100, "OPEN");
          startHalfOpenTimer();
        }
        setAnimatingRequest(false);
        return;
      }

      // CLOSED state
      if (serviceBHealthy) {
        setLastRequestResult("success");
        setSuccessCount((s) => s + 1);
        addLogEntry(50, Math.round((failureCount / Math.max(failureCount + successCount + 1, 1)) * 100), "CLOSED");
      } else {
        const newFails = failureCount + 1;
        setFailureCount(newFails);
        setLastRequestResult("fail");

        if (newFails >= FAILURE_THRESHOLD) {
          setCircuitState("OPEN");
          addLogEntry(3000, 100, "OPEN");
          startHalfOpenTimer();
        } else {
          addLogEntry(3000, Math.round((newFails / Math.max(newFails + successCount, 1)) * 100), "CLOSED");
        }
      }
      setAnimatingRequest(false);
    }, 300);
  }, [animatingRequest, circuitState, serviceBHealthy, failureCount, successCount, addLogEntry, startHalfOpenTimer]);

  const toggleServiceB = useCallback(() => {
    setServiceBHealthy((h) => !h);
  }, []);

  const resetAll = useCallback(() => {
    if (halfOpenTimerRef.current) clearTimeout(halfOpenTimerRef.current);
    setCircuitState("CLOSED");
    setServiceBHealthy(true);
    setFailureCount(0);
    setSuccessCount(0);
    setRequestLog([]);
    setLastRequestResult(null);
    setAnimatingRequest(false);
    tickCounter.current = 0;
  }, []);

  // --- Flow Diagram nodes & edges ---
  const stateColors = {
    CLOSED: { border: "stroke-emerald-500", marker: "#22c55e" },
    OPEN: { border: "stroke-red-500", marker: "#ef4444" },
    HALF_OPEN: { border: "stroke-amber-500", marker: "#f59e0b" },
  };

  const nodes: FlowNode[] = useMemo(() => [
    {
      id: "client",
      type: "clientNode",
      position: { x: 0, y: 80 },
      data: {
        label: "Client",
        sublabel: "Sends requests",
        status: "healthy" as const,
        handles: { right: true },
      },
    },
    {
      id: "serviceA",
      type: "serverNode",
      position: { x: 200, y: 80 },
      data: {
        label: "Service A",
        sublabel: "Your service",
        status: "healthy" as const,
        handles: { left: true, right: true },
      },
    },
    {
      id: "circuitBreaker",
      type: "gatewayNode",
      position: { x: 420, y: 60 },
      data: {
        label: "Circuit Breaker",
        sublabel: circuitState,
        status: circuitState === "CLOSED" ? "healthy" as const : circuitState === "OPEN" ? "unhealthy" as const : "warning" as const,
        handles: { left: true, right: true },
        metrics: [
          { label: "Failures", value: `${failureCount}/${FAILURE_THRESHOLD}` },
          { label: "State", value: circuitState },
        ],
      },
    },
    {
      id: "serviceB",
      type: "serverNode",
      position: { x: 660, y: 80 },
      data: {
        label: "Service B",
        sublabel: serviceBHealthy ? "Healthy" : "Down! Click to heal",
        status: serviceBHealthy ? "healthy" as const : "unhealthy" as const,
        handles: { left: true },
      },
    },
  ], [circuitState, failureCount, serviceBHealthy]);

  const edges: FlowEdge[] = useMemo(() => {
    const cbColor = circuitState === "CLOSED" ? "#22c55e" : circuitState === "OPEN" ? "#ef4444" : "#f59e0b";
    const cbToServiceB = circuitState === "OPEN";

    return [
      {
        id: "client-serviceA",
        source: "client",
        target: "serviceA",
        animated: animatingRequest,
        style: { stroke: "#8b5cf6", strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: "#8b5cf6" },
      },
      {
        id: "serviceA-cb",
        source: "serviceA",
        target: "circuitBreaker",
        animated: animatingRequest,
        style: { stroke: cbColor, strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: cbColor },
      },
      {
        id: "cb-serviceB",
        source: "circuitBreaker",
        target: "serviceB",
        animated: animatingRequest && !cbToServiceB,
        style: {
          stroke: cbToServiceB ? "#ef444466" : cbColor,
          strokeWidth: 2,
          strokeDasharray: cbToServiceB ? "8 4" : undefined,
        },
        markerEnd: { type: MarkerType.ArrowClosed, color: cbToServiceB ? "#ef444466" : cbColor },
      },
    ];
  }, [circuitState, animatingRequest]);

  // --- Chart data ---
  const chartData = useMemo(() => {
    if (requestLog.length === 0) {
      return [{ time: 0, latency: 0, errorRate: 0 }];
    }
    return requestLog.map((entry) => ({
      time: entry.time,
      latency: entry.latency,
      errorRate: entry.errorRate,
    }));
  }, [requestLog]);

  // --- State Machine Viz ---
  const stateMachineStates: { key: CircuitState; label: string; icon: typeof ShieldCheck; color: string; bg: string; border: string }[] = [
    { key: "CLOSED", label: "Closed", icon: ShieldCheck, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
    { key: "OPEN", label: "Open", icon: ShieldOff, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30" },
    { key: "HALF_OPEN", label: "Half-Open", icon: ShieldAlert, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30" },
  ];

  return (
    <div className="space-y-8">
      <TopicHero
        title="Circuit Breaker"
        subtitle="Stop hammering a dead service. It's not going to answer faster if you ask louder."
        difficulty="intermediate"
      />

      <WhyCare>
        When one <GlossaryTerm term="microservices">microservice</GlossaryTerm> fails, it can cascade and take down your entire platform in seconds. The <GlossaryTerm term="circuit breaker">circuit breaker</GlossaryTerm> pattern stops this domino effect.
      </WhyCare>

      {/* === Main Interactive Playground === */}
      <Playground
        title="Circuit Breaker Playground"
        controls={false}
        canvasHeight="min-h-[420px]"
        hints={["Break Service B first, then send requests to see the circuit trip open"]}
        canvas={
          <div className="flex flex-col h-full">
            <FlowDiagram
              nodes={nodes}
              edges={edges}
              allowDrag={false}
              interactive={false}
              fitView
              minHeight={260}
            />

            {/* Action buttons */}
            <div className="flex items-center gap-2 px-4 py-3 border-t border-violet-500/10 bg-violet-500/[0.02]">
              <button
                onClick={sendRequest}
                disabled={animatingRequest}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  "bg-violet-500/20 text-violet-400 hover:bg-violet-500/30",
                  "disabled:opacity-40 disabled:cursor-not-allowed"
                )}
              >
                <Send className="size-3.5" />
                Send Request
              </button>

              <button
                onClick={toggleServiceB}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  serviceBHealthy
                    ? "bg-red-500/15 text-red-400 hover:bg-red-500/25"
                    : "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"
                )}
              >
                {serviceBHealthy ? (
                  <><HeartCrack className="size-3.5" /> Break Service B</>
                ) : (
                  <><Heart className="size-3.5" /> Heal Service B</>
                )}
              </button>

              <button
                onClick={resetAll}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted/30 transition-all ml-auto"
              >
                <RotateCcw className="size-3.5" />
                Reset
              </button>
            </div>

            {/* Request result toast */}
            {lastRequestResult && (
              <div className={cn(
                "mx-4 mb-3 px-3 py-2 rounded-lg text-xs font-medium border transition-all",
                lastRequestResult === "success" && "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
                lastRequestResult === "fail" && "bg-red-500/10 border-red-500/20 text-red-400",
                lastRequestResult === "rejected" && "bg-amber-500/10 border-amber-500/20 text-amber-400",
              )}>
                {lastRequestResult === "success" && "Request succeeded (50ms) -- Service B responded normally."}
                {lastRequestResult === "fail" && `Request failed (3000ms) -- Service B timed out. Failures: ${failureCount}/${FAILURE_THRESHOLD}`}
                {lastRequestResult === "rejected" && "Request REJECTED in 2ms -- Circuit is OPEN. Fast-fail protects your service."}
              </div>
            )}
          </div>
        }
        explanation={
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">How to use this playground</h3>
            <ol className="text-xs space-y-2 text-muted-foreground list-decimal list-inside">
              <li>Click <strong className="text-violet-400">Send Request</strong> a few times -- everything is green and healthy.</li>
              <li>Click <strong className="text-red-400">Break Service B</strong> to simulate a downstream failure.</li>
              <li>Now send more requests. Watch the failure counter climb on the Circuit Breaker node.</li>
              <li>After {FAILURE_THRESHOLD} failures, the circuit <strong className="text-red-400">OPENS</strong>. Requests are rejected instantly in 2ms instead of waiting 3 seconds.</li>
              <li>After {HALF_OPEN_TIMEOUT_MS / 1000}s, the circuit enters <strong className="text-amber-400">HALF-OPEN</strong>. One probe request gets through.</li>
              <li>Click <strong className="text-emerald-400">Heal Service B</strong>, then send a request. The probe succeeds and the circuit <strong className="text-emerald-400">CLOSES</strong> again.</li>
            </ol>

            <div className="pt-2 border-t border-border/20">
              <h4 className="text-xs font-semibold text-foreground mb-2">Current State</h4>
              <div className="flex items-center gap-2">
                {circuitState === "CLOSED" && <ShieldCheck className="size-5 text-emerald-400" />}
                {circuitState === "OPEN" && <ShieldOff className="size-5 text-red-400" />}
                {circuitState === "HALF_OPEN" && <ShieldAlert className="size-5 text-amber-400" />}
                <span className={cn(
                  "text-sm font-mono font-bold",
                  circuitState === "CLOSED" && "text-emerald-400",
                  circuitState === "OPEN" && "text-red-400",
                  circuitState === "HALF_OPEN" && "text-amber-400",
                )}>
                  {circuitState.replace("_", "-")}
                </span>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2">
                <div className="text-center rounded-md bg-muted/20 border border-border/30 px-2 py-1.5">
                  <p className="text-[10px] text-muted-foreground">Failures</p>
                  <p className="text-sm font-mono font-bold text-red-400">{failureCount}</p>
                </div>
                <div className="text-center rounded-md bg-muted/20 border border-border/30 px-2 py-1.5">
                  <p className="text-[10px] text-muted-foreground">Successes</p>
                  <p className="text-sm font-mono font-bold text-emerald-400">{successCount}</p>
                </div>
                <div className="text-center rounded-md bg-muted/20 border border-border/30 px-2 py-1.5">
                  <p className="text-[10px] text-muted-foreground">Service B</p>
                  <p className={cn("text-sm font-mono font-bold", serviceBHealthy ? "text-emerald-400" : "text-red-400")}>
                    {serviceBHealthy ? "UP" : "DOWN"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        }
      />

      {/* === Latency & Error Rate Chart === */}
      <div className="rounded-xl border border-border/40 bg-card/50 p-6 space-y-4">
        <h2 className="text-lg font-semibold">Latency & Error Rate Over Time</h2>
        <p className="text-sm text-muted-foreground">
          Watch how <GlossaryTerm term="latency">latency</GlossaryTerm> spikes when Service B fails (3000ms timeouts), then drops to near-zero
          when the circuit opens (2ms fast-fail). Recovery brings <GlossaryTerm term="latency">latency</GlossaryTerm> back to normal (50ms).
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Response Latency</h3>
            <LiveChart
              type="latency"
              data={chartData}
              dataKeys={{ x: "time", y: "latency", label: "Latency" }}
              height={180}
              unit="ms"
              referenceLines={[
                { y: 3000, label: "Timeout (3s)", color: "#ef4444" },
                { y: 50, label: "Normal (50ms)", color: "#22c55e" },
              ]}
            />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Error Rate</h3>
            <LiveChart
              type="errorRate"
              data={chartData}
              dataKeys={{ x: "time", y: "errorRate", label: "Error Rate" }}
              height={180}
              unit="%"
              referenceLines={[
                { y: 50, label: "Trip threshold", color: "#f59e0b" },
              ]}
            />
          </div>
        </div>
      </div>

      {/* === State Machine Visualization === */}
      <div className="rounded-xl border border-border/40 bg-card/50 p-6 space-y-6">
        <h2 className="text-lg font-semibold">State Machine</h2>
        <p className="text-sm text-muted-foreground">
          A circuit breaker is a finite state machine with three states.
          The current playground state is highlighted below.
        </p>

        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-2">
          {stateMachineStates.map((s, i) => {
            const Icon = s.icon;
            const isActive = circuitState === s.key;
            return (
              <div key={s.key} className="flex items-center gap-2">
                <div className={cn(
                  "flex flex-col items-center gap-2 rounded-xl border-2 px-6 py-4 transition-all duration-500 min-w-[140px]",
                  isActive ? `${s.bg} ${s.border} scale-105 shadow-lg` : "bg-muted/10 border-border/30 opacity-50"
                )}>
                  <Icon className={cn("size-8 transition-all", isActive ? s.color : "text-muted-foreground/30")} />
                  <span className={cn("text-sm font-bold font-mono", isActive ? s.color : "text-muted-foreground/30")}>
                    {s.label.toUpperCase()}
                  </span>
                  <p className="text-[10px] text-muted-foreground text-center max-w-[120px]">
                    {s.key === "CLOSED" && "Requests pass through. Failures counted."}
                    {s.key === "OPEN" && "All requests rejected immediately (fast-fail)."}
                    {s.key === "HALF_OPEN" && "One probe request allowed to test recovery."}
                  </p>
                </div>
                {i < stateMachineStates.length - 1 && (
                  <div className="hidden md:flex flex-col items-center gap-0.5">
                    <ArrowRight className="size-5 text-muted-foreground/40" />
                    <span className="text-[9px] text-muted-foreground/40 font-mono">
                      {i === 0 ? `${FAILURE_THRESHOLD} fails` : "timeout"}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Recovery arrow back from HALF_OPEN to CLOSED */}
        <div className="flex justify-center">
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground/50 font-mono">
            <span>HALF-OPEN</span>
            <span className="px-3 py-0.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-400">
              probe succeeds
            </span>
            <ArrowRight className="size-3" />
            <span>CLOSED</span>
            <span className="mx-4 text-muted-foreground/30">|</span>
            <span>HALF-OPEN</span>
            <span className="px-3 py-0.5 rounded-full border border-red-500/20 bg-red-500/5 text-red-400">
              probe fails
            </span>
            <ArrowRight className="size-3" />
            <span>OPEN</span>
          </div>
        </div>
      </div>

      {/* === Configuration Reference === */}
      <div className="rounded-xl border border-border/40 bg-card/50 p-6 space-y-4">
        <h2 className="text-lg font-semibold">Configuration That Actually Works</h2>
        <p className="text-sm text-muted-foreground">
          Real-world parameters from Resilience4j. Getting them wrong is worse
          than having no circuit breaker at all.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/40">
                <th className="text-left py-2 pr-3 font-semibold">Parameter</th>
                <th className="text-left py-2 pr-3 font-semibold">Start With</th>
                <th className="text-left py-2 font-semibold">Why</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b border-border/20">
                <td className="py-2 pr-3 font-medium text-foreground font-mono text-[11px]">failureRateThreshold</td>
                <td className="py-2 pr-3">50%</td>
                <td className="py-2">Half your calls failing means the dependency is genuinely down</td>
              </tr>
              <tr className="border-b border-border/20">
                <td className="py-2 pr-3 font-medium text-foreground font-mono text-[11px]">slowCallDurationThreshold</td>
                <td className="py-2 pr-3">2s</td>
                <td className="py-2">Slow calls hold threads hostage -- often worse than hard failures</td>
              </tr>
              <tr className="border-b border-border/20">
                <td className="py-2 pr-3 font-medium text-foreground font-mono text-[11px]">slidingWindowSize</td>
                <td className="py-2 pr-3">10-100</td>
                <td className="py-2">Smaller for low-traffic, larger for high-throughput services</td>
              </tr>
              <tr className="border-b border-border/20">
                <td className="py-2 pr-3 font-medium text-foreground font-mono text-[11px]">minimumNumberOfCalls</td>
                <td className="py-2 pr-3">5-10</td>
                <td className="py-2">Don&apos;t trip on 1 out of 2 calls -- wait for statistical significance</td>
              </tr>
              <tr className="border-b border-border/20">
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

      <AhaMoment
        question="If we're just rejecting requests when the circuit is open, aren't we still failing?"
        answer={
          <p>
            Yes, but you&apos;re <em>failing fast</em> -- in 2ms instead of 8 seconds. The key difference:
            a 2ms rejection frees the thread immediately, while an 8-second timeout holds the thread
            hostage. With circuit breakers, your service stays responsive and can serve every request
            that <em>doesn&apos;t</em> depend on the failed service. You&apos;re trading partial failure
            for total collapse. And your fallback response (&quot;payment temporarily unavailable, try
            again in a minute&quot;) is infinitely better than a blank page.
          </p>
        }
      />

      <ConversationalCallout type="tip">
        Netflix created Hystrix, the original circuit breaker library -- but it&apos;s now in maintenance
        mode. Modern alternatives: <strong>Resilience4j</strong> (Java), <strong>Polly</strong> (.NET),
        <strong> opossum</strong> (Node.js), and <strong>failsafe-go</strong> (Go). Don&apos;t build your
        own in production -- these libraries handle edge cases like concurrent state transitions,
        thread-safe counters, and metrics integration that are surprisingly hard to get right.
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

      <ConversationalCallout type="warning">
        A circuit breaker without a fallback is just a fancier error. Always define what happens when
        the circuit opens: return cached data, a default response, or a meaningful error message. The
        fallback is where the real user experience work happens.
      </ConversationalCallout>

      <TopicQuiz
        questions={[
          {
            question: "What happens when a circuit breaker is in the OPEN state?",
            options: [
              "All requests are sent to the failing service as normal",
              "Requests are queued until the service recovers",
              "Requests are rejected immediately (fast-fail) without contacting the failing service",
              "The circuit breaker restarts the failing service automatically",
            ],
            correctIndex: 2,
            explanation: "In the OPEN state, the circuit breaker rejects requests instantly (in milliseconds) without ever contacting the failing service. This protects your service's thread pool and gives the failing dependency time to recover.",
          },
          {
            question: "What is the purpose of the HALF-OPEN state?",
            options: [
              "To handle exactly half the normal traffic",
              "To allow a small number of probe requests through to test if the dependency has recovered",
              "To gradually increase traffic over several minutes",
              "To alert the operations team about the failure",
            ],
            correctIndex: 1,
            explanation: "HALF-OPEN lets a small number of probe requests through to test whether the dependency has recovered. If the probes succeed, the circuit closes; if they fail, it opens again.",
          },
          {
            question: "Why is a circuit breaker without a fallback strategy problematic?",
            options: [
              "It uses too much memory",
              "It makes the code harder to test",
              "It still shows users an error -- just a faster one",
              "It prevents the service from ever recovering",
            ],
            correctIndex: 2,
            explanation: "A circuit breaker without a fallback is just a fancier error. You need to define what happens when the circuit opens: return cached data, a default response, or a meaningful error message. The fallback is where the real user experience work happens.",
          },
        ]}
      />

      <KeyTakeaway
        points={[
          "A circuit breaker prevents cascading failures by stopping requests to an unhealthy dependency -- protecting your service's thread pool.",
          "Three states: Closed (normal flow), Open (fail-fast in milliseconds), Half-Open (probe requests test if the dependency recovered).",
          "Modern implementations use sliding windows (count-based or time-based) to calculate failure rate, not just consecutive failure counts.",
          "Key parameters: failure rate threshold (50%), slow call threshold (2s), wait duration in open state (60s), minimum calls before evaluation (5-10).",
          "Always provide a meaningful fallback when the circuit opens -- 'temporarily unavailable' beats a 30-second hang followed by a 500 error.",
          "Circuit breaker state changes are critical operational signals -- alert on them. Frequent trips indicate a systemic problem that needs investigation.",
        ]}
      />
    </div>
  );
}
