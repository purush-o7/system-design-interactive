"use client";

import { useState, useMemo, useCallback } from "react";
import { TopicHero } from "@/components/topic-hero";
import { KeyTakeaway } from "@/components/key-takeaway";
import { AhaMoment } from "@/components/aha-moment";
import { ConversationalCallout } from "@/components/conversational-callout";
import { BeforeAfter } from "@/components/before-after";
import { FlowDiagram, type FlowNode, type FlowEdge } from "@/components/flow-diagram";
import { LiveChart } from "@/components/live-chart";
import { Playground } from "@/components/playground";
import { useSimulation } from "@/hooks/use-simulation";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Static class maps (no Tailwind dynamic interpolation)             */
/* ------------------------------------------------------------------ */

const statusColors: Record<string, string> = {
  healthy: "text-emerald-400",
  unhealthy: "text-red-400",
  warning: "text-amber-400",
  idle: "text-muted-foreground",
};

const statusBg: Record<string, string> = {
  healthy: "bg-emerald-500/10 border-emerald-500/30",
  unhealthy: "bg-red-500/10 border-red-500/30",
  warning: "bg-amber-500/10 border-amber-500/30",
  idle: "bg-muted/20 border-border",
};

const strategyBtnActive = "bg-violet-500/20 text-violet-400 border-violet-500/30";
const strategyBtnInactive = "bg-muted/10 text-muted-foreground border-border hover:bg-muted/20";

/* ------------------------------------------------------------------ */
/*  1. Redundancy Playground                                          */
/* ------------------------------------------------------------------ */

type ServerState = "healthy" | "unhealthy";
type DbRole = "primary" | "replica" | "promoted";

function RedundancyPlayground() {
  const [servers, setServers] = useState<ServerState[]>(["healthy", "healthy", "healthy"]);
  const [dbPrimary, setDbPrimary] = useState<ServerState>("healthy");
  const [dbReplicaRole, setDbReplicaRole] = useState<DbRole>("replica");
  const [lbAlive, setLbAlive] = useState(true);
  const [message, setMessage] = useState("All systems operational. Try killing components!");

  const aliveServers = servers.filter((s) => s === "healthy").length;
  const systemUp = lbAlive && aliveServers > 0 && (dbPrimary === "healthy" || dbReplicaRole === "promoted");

  const redundancyLabel = aliveServers === 3 ? "N+2" : aliveServers === 2 ? "N+1" : aliveServers === 1 ? "N+0" : "DOWN";

  const killServer = useCallback((idx: number) => setServers((prev) => {
    const next = [...prev];
    next[idx] = next[idx] === "healthy" ? "unhealthy" : "healthy";
    const alive = next.filter((s) => s === "healthy").length;
    setMessage(alive === 0 ? "All servers dead! No capacity to serve requests."
      : next[idx] === "unhealthy" ? `Server ${idx + 1} killed. LB redistributes to ${alive} remaining.`
      : `Server ${idx + 1} recovered. ${alive} servers handling traffic.`);
    return next;
  }), []);

  const killPrimaryDb = useCallback(() => {
    if (dbPrimary === "healthy") {
      setDbPrimary("unhealthy");
      setDbReplicaRole("promoted");
      setMessage("Primary DB crashed! Replica promoted to primary. Data safe.");
    } else {
      setDbPrimary("healthy");
      setDbReplicaRole("replica");
      setMessage("Primary DB recovered and resumed its role.");
    }
  }, [dbPrimary]);

  const killLb = useCallback(() => setLbAlive((prev) => {
    setMessage(prev ? "Load Balancer down! SPOF -- entire system unreachable!" : "Load Balancer restored. Traffic flowing.");
    return !prev;
  }), []);

  const resetAll = useCallback(() => {
    setServers(["healthy", "healthy", "healthy"]);
    setDbPrimary("healthy");
    setDbReplicaRole("replica");
    setLbAlive(true);
    setMessage("All systems operational. Try killing components!");
  }, []);

  const promoted = dbReplicaRole === "promoted";
  const nodes: FlowNode[] = useMemo(() => [
    { id: "lb", type: "loadBalancerNode", position: { x: 250, y: 0 },
      data: { label: "Load Balancer", sublabel: lbAlive ? `${aliveServers} targets` : "DOWN",
        status: lbAlive ? "healthy" : "unhealthy", handles: { bottom: true, top: true } } },
    ...servers.map((s, i) => ({ id: `srv-${i}`, type: "serverNode" as const,
      position: { x: 80 + i * 170, y: 130 },
      data: { label: `Server ${i + 1}`, sublabel: s === "healthy" ? "Serving" : "DEAD",
        status: (s === "healthy" ? "healthy" : "unhealthy") as "healthy" | "unhealthy",
        handles: { top: true, bottom: true } } })),
    { id: "db-primary", type: "databaseNode", position: { x: 150, y: 260 },
      data: { label: promoted ? "Old Primary" : "Primary DB", sublabel: dbPrimary === "healthy" ? "Read/Write" : "CRASHED",
        status: dbPrimary === "healthy" ? "healthy" : "unhealthy", handles: { top: true, right: true } } },
    { id: "db-replica", type: "databaseNode", position: { x: 370, y: 260 },
      data: { label: promoted ? "Promoted Primary" : "Replica DB", sublabel: promoted ? "Read/Write" : "Syncing",
        status: promoted ? "warning" : "idle", handles: { top: true, left: true } } },
  ], [servers, dbPrimary, promoted, lbAlive, aliveServers]);

  const edges: FlowEdge[] = useMemo(() => {
    const e: FlowEdge[] = [];
    servers.forEach((s, i) => {
      if (s === "healthy" && lbAlive) {
        e.push({ id: `lb-srv${i}`, source: "lb", target: `srv-${i}`, animated: true });
      }
    });
    if (aliveServers > 0) {
      e.push({ id: "srv-db", source: "srv-0", target: "db-primary", animated: dbPrimary === "healthy" });
      e.push({ id: "srv-dbrep", source: "srv-2", target: "db-replica", animated: true });
    }
    e.push({ id: "db-repl", source: "db-primary", target: "db-replica", animated: dbPrimary === "healthy" });
    return e;
  }, [servers, dbPrimary, lbAlive, aliveServers]);

  const availabilityData = [{ config: "N+0", availability: 99.0 }, { config: "N+1", availability: 99.9 },
    { config: "N+2", availability: 99.99 }, { config: "N+3", availability: 99.999 }];

  return (
    <Playground
      title="Redundancy Playground"
      controls={false}
      canvas={
        <div className="p-4 space-y-4">
          <FlowDiagram nodes={nodes} edges={edges} minHeight={340} interactive={false} allowDrag={false} />
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              ...servers.map((s, i) => ({ alive: s === "healthy", killLabel: `Kill Server ${i + 1}`, reviveLabel: `Revive Server ${i + 1}`, action: () => killServer(i) })),
              { alive: dbPrimary === "healthy", killLabel: "Kill Primary DB", reviveLabel: "Revive Primary DB", action: killPrimaryDb },
              { alive: lbAlive, killLabel: "Kill Load Balancer", reviveLabel: "Revive Load Balancer", action: killLb },
            ].map((btn) => (
              <button key={btn.killLabel} onClick={btn.action} className={cn("text-xs px-3 py-1.5 rounded-lg border transition-colors",
                btn.alive ? "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
                  : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20")}>
                {btn.alive ? btn.killLabel : btn.reviveLabel}
              </button>
            ))}
            <button onClick={resetAll} className="text-xs px-3 py-1.5 rounded-lg border bg-muted/20 border-border text-muted-foreground hover:bg-muted/40 transition-colors">
              Reset All
            </button>
          </div>
        </div>
      }
      explanation={
        <div className="space-y-4">
          <div className={cn(
            "rounded-lg border px-3 py-2 text-sm font-medium",
            systemUp ? statusBg["healthy"] : statusBg["unhealthy"]
          )}>
            <span className={systemUp ? statusColors["healthy"] : statusColors["unhealthy"]}>
              System: {systemUp ? "OPERATIONAL" : "DOWN"}
            </span>
            <span className="ml-2 text-xs text-muted-foreground">Redundancy: {redundancyLabel}</span>
          </div>
          <p className="text-xs">{message}</p>
          <div className="text-xs font-semibold mb-1">Availability vs Redundancy</div>
          <LiveChart
            type="bar"
            data={availabilityData}
            dataKeys={{ x: "config", y: "availability", label: "Availability %" }}
            height={150}
            unit="%"
            referenceLines={[{ y: 99.9, label: "Three 9s", color: "#f59e0b" }]}
          />
        </div>
      }
    />
  );
}

/* ------------------------------------------------------------------ */
/*  2. Failover Strategies                                            */
/* ------------------------------------------------------------------ */

function FailoverStrategies() {
  const [strategy, setStrategy] = useState<"active-passive" | "active-active">("active-passive");
  const sim = useSimulation({ intervalMs: 800, maxSteps: 12 });

  const step = sim.step;
  const failureHappened = step >= 3;
  const failoverComplete = step >= 6;
  const recovered = step >= 9;

  const failed = failureHappened && !recovered;
  const apNodes: FlowNode[] = useMemo(() => [
    { id: "client", type: "clientNode", position: { x: 220, y: 0 },
      data: { label: "Clients", status: "healthy", handles: { bottom: true } } },
    { id: "primary", type: "serverNode", position: { x: 100, y: 120 },
      data: { label: "Primary", sublabel: failed ? "CRASHED" : "Active",
        status: failed ? "unhealthy" : "healthy", handles: { top: true, right: true } } },
    { id: "standby", type: "serverNode", position: { x: 340, y: 120 },
      data: { label: failoverComplete && !recovered ? "New Primary" : "Standby",
        sublabel: failoverComplete && !recovered ? "Promoted" : "Idle",
        status: failoverComplete && !recovered ? "warning" : "idle", handles: { top: true, left: true } } },
  ], [failed, failoverComplete, recovered]);

  const apEdges: FlowEdge[] = useMemo(() => {
    const e: FlowEdge[] = [{ id: "repl", source: "primary", target: "standby", animated: !failed, label: "sync" }];
    if (!failed) e.push({ id: "c-p", source: "client", target: "primary", animated: true });
    else if (failoverComplete) e.push({ id: "c-s", source: "client", target: "standby", animated: true });
    return e;
  }, [failed, failoverComplete]);

  const aaNodes: FlowNode[] = useMemo(() => [
    { id: "lb", type: "loadBalancerNode", position: { x: 220, y: 0 },
      data: { label: "Load Balancer", status: "healthy", handles: { bottom: true } } },
    ...["A", "B", "C"].map((name, i) => {
      const dead = i === 0 && failed;
      return { id: `aa-${i}`, type: "serverNode" as const, position: { x: 60 + i * 170, y: 130 },
        data: { label: `Server ${name}`, sublabel: dead ? "DOWN" : failed ? "50% load" : "33% load",
          status: (dead ? "unhealthy" : failed ? "warning" : "healthy") as "healthy" | "warning" | "unhealthy",
          handles: { top: true } } };
    }),
  ], [failed]);

  const aaEdges: FlowEdge[] = useMemo(() =>
    [0, 1, 2].filter((i) => !(i === 0 && failed)).map((i) => ({ id: `lb-aa${i}`, source: "lb", target: `aa-${i}`, animated: true })),
  [failed]);

  const isAP = strategy === "active-passive";

  return (
    <Playground
      title="Failover Strategies"
      simulation={sim}
      canvas={
        <div className="p-4">
          <div className="flex gap-2 mb-4 justify-center">
            <button
              onClick={() => { setStrategy("active-passive"); sim.reset(); }}
              className={cn("text-xs px-3 py-1.5 rounded-lg border transition-colors", isAP ? strategyBtnActive : strategyBtnInactive)}
            >
              Active-Passive
            </button>
            <button
              onClick={() => { setStrategy("active-active"); sim.reset(); }}
              className={cn("text-xs px-3 py-1.5 rounded-lg border transition-colors", !isAP ? strategyBtnActive : strategyBtnInactive)}
            >
              Active-Active
            </button>
          </div>
          <FlowDiagram
            nodes={isAP ? apNodes : aaNodes}
            edges={isAP ? apEdges : aaEdges}
            minHeight={240}
            interactive={false}
            allowDrag={false}
          />
          <div className="mt-3 text-center text-xs text-muted-foreground">
            {!failureHappened && "Press play. A failure will occur at step 3."}
            {failureHappened && !failoverComplete && (isAP
              ? "Primary crashed! Detecting failure and promoting standby..."
              : "Server A crashed! Load Balancer re-routes to B and C instantly."
            )}
            {failoverComplete && !recovered && (isAP
              ? "Standby promoted to primary. Failover took ~30s."
              : "Traffic absorbed by remaining servers. Zero downtime."
            )}
            {recovered && "All nodes recovered. System back to full capacity."}
          </div>
        </div>
      }
      explanation={
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">{isAP ? "Active-Passive" : "Active-Active"}</h4>
          {isAP ? (
            <ul className="text-xs space-y-1.5 list-disc list-inside">
              <li>One server handles all traffic; standby stays idle</li>
              <li>Failover takes 15-60 seconds (health check interval)</li>
              <li>Simpler -- no split-brain risk for stateful services</li>
              <li>Good for: databases, coordination services</li>
              <li>Downside: wasted capacity while standby is idle</li>
            </ul>
          ) : (
            <ul className="text-xs space-y-1.5 list-disc list-inside">
              <li>All servers handle traffic simultaneously</li>
              <li>Failover is instant -- LB just stops sending to dead node</li>
              <li>Better resource utilization, no idle servers</li>
              <li>Good for: stateless web servers, API gateways</li>
              <li>Downside: needs conflict resolution for writes</li>
            </ul>
          )}
        </div>
      }
    />
  );
}

/* ------------------------------------------------------------------ */
/*  3. Retry with Exponential Backoff                                 */
/* ------------------------------------------------------------------ */

type RetryStrategy = "none" | "simple" | "exponential" | "jitter";

const retryStrategyLabel: Record<RetryStrategy, string> = {
  none: "No Retry",
  simple: "Simple Retry",
  exponential: "Exp. Backoff",
  jitter: "Backoff + Jitter",
};

function RetryPlayground() {
  const [activeStrategy, setActiveStrategy] = useState<RetryStrategy>("exponential");
  const sim = useSimulation({ intervalMs: 700, maxSteps: 20 });

  const step = sim.step;

  const getRetryTiming = useCallback((s: RetryStrategy, attempt: number): number => {
    if (s === "none") return -1;
    if (s === "simple") return 1;
    if (s === "exponential") return Math.pow(2, attempt);
    // jitter: add some pseudo-random offset
    return Math.pow(2, attempt) * (0.5 + (((attempt * 7 + 3) % 10) / 20));
  }, []);

  const maxAttempts = activeStrategy === "none" ? 0 : 5;
  const currentAttempt = Math.min(step, maxAttempts);
  const serverRecoversAt = 3;
  const succeeded = activeStrategy !== "none" && currentAttempt >= serverRecoversAt;

  const retryTimeline = useMemo(() => {
    const timeline: { attempt: number; delay: string; cumulative: number; success: boolean }[] = [];
    let total = 0;
    for (let i = 0; i <= maxAttempts; i++) {
      const delay = i === 0 ? 0 : getRetryTiming(activeStrategy, i - 1);
      total += delay;
      timeline.push({
        attempt: i,
        delay: i === 0 ? "initial" : `${delay.toFixed(1)}s`,
        cumulative: Math.round(total * 10) / 10,
        success: i >= serverRecoversAt,
      });
    }
    return timeline;
  }, [activeStrategy, maxAttempts, getRetryTiming]);

  const chartData = [
    { strategy: "No Retry", successRate: 20, serverLoad: 10 },
    { strategy: "Simple", successRate: 70, serverLoad: 85 },
    { strategy: "Exp. Backoff", successRate: 95, serverLoad: 35 },
    { strategy: "w/ Jitter", successRate: 97, serverLoad: 30 },
  ];

  return (
    <Playground
      title="Retry with Exponential Backoff"
      simulation={sim}
      canvas={
        <div className="p-4 space-y-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {(["none", "simple", "exponential", "jitter"] as RetryStrategy[]).map((s) => (
              <button
                key={s}
                onClick={() => { setActiveStrategy(s); sim.reset(); }}
                className={cn(
                  "text-xs px-3 py-1.5 rounded-lg border transition-colors",
                  activeStrategy === s ? strategyBtnActive : strategyBtnInactive
                )}
              >
                {retryStrategyLabel[s]}
              </button>
            ))}
          </div>

          <div className="rounded-lg border border-border/50 bg-muted/10 p-3 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-muted-foreground border-b border-border/30">
                  <th className="pb-1.5 text-left font-medium">Attempt</th>
                  <th className="pb-1.5 text-left font-medium">Delay</th>
                  <th className="pb-1.5 text-left font-medium">Total Wait</th>
                  <th className="pb-1.5 text-left font-medium">Result</th>
                </tr>
              </thead>
              <tbody>
                {retryTimeline.map((row, idx) => {
                  const isActive = idx <= currentAttempt;
                  const isCurrent = idx === currentAttempt;
                  return (
                    <tr
                      key={idx}
                      className={cn(
                        "transition-opacity border-b border-border/10",
                        isActive ? "opacity-100" : "opacity-30"
                      )}
                    >
                      <td className="py-1 font-mono">{row.attempt}</td>
                      <td className="py-1 font-mono">{row.delay}</td>
                      <td className="py-1 font-mono">{row.cumulative}s</td>
                      <td className="py-1">
                        {isActive && (
                          <span className={cn(
                            "px-1.5 py-0.5 rounded text-[10px] font-medium",
                            row.success
                              ? "bg-emerald-500/10 text-emerald-400"
                              : isCurrent
                              ? "bg-amber-500/10 text-amber-400"
                              : "bg-red-500/10 text-red-400"
                          )}>
                            {row.success ? "OK" : isCurrent ? "WAITING" : "FAIL"}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {activeStrategy === "none" && step > 0 && (
            <p className="text-xs text-red-400 text-center">No retry -- the request simply fails. User sees an error.</p>
          )}
          {succeeded && (
            <p className="text-xs text-emerald-400 text-center">Request succeeded on attempt {serverRecoversAt}! Server recovered just in time.</p>
          )}
        </div>
      }
      explanation={
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Success Rate vs Server Load</h4>
          <LiveChart
            type="bar"
            data={chartData}
            dataKeys={{ x: "strategy", y: ["successRate", "serverLoad"], label: ["Success %", "Server Load %"] }}
            height={180}
            unit="%"
            showLegend
          />
          <p className="text-xs">
            Simple retries flood the server (retry storm). Exponential backoff gives it breathing room.
            Adding jitter prevents synchronized retries from multiple clients hitting at the same instant.
          </p>
        </div>
      }
    />
  );
}

/* ------------------------------------------------------------------ */
/*  4. SLA Calculator                                                 */
/* ------------------------------------------------------------------ */

function SlaCalculator() {
  const [nines, setNines] = useState(3);
  const [depA, setDepA] = useState(99.9);
  const [depB, setDepB] = useState(99.9);

  const availability = useMemo(() => Math.round((100 - 100 / Math.pow(10, nines)) * 10000) / 10000, [nines]);

  const fmtDown = (totalMin: number) => {
    if (totalMin >= 60) return `${(totalMin / 60).toFixed(1)} hours`;
    if (totalMin >= 1) return `${totalMin.toFixed(1)} minutes`;
    return `${(totalMin * 60).toFixed(0)} seconds`;
  };
  const fraction = 1 - availability / 100;
  const downtimePerYear = fmtDown(525960 * fraction);
  const downtimePerMonth = fmtDown(43830 * fraction);
  const downtimePerDay = fmtDown(1440 * fraction);

  const combined = Math.round(depA * depB) / 100;

  const ninesData = [
    { level: "Two 9s", downtime: 87.6 },
    { level: "Three 9s", downtime: 8.8 },
    { level: "Four 9s", downtime: 0.88 },
    { level: "Five 9s", downtime: 0.088 },
  ];

  const ninesSliderLabel: Record<number, string> = { 1: "90%", 2: "99%", 3: "99.9%", 4: "99.99%", 5: "99.999%" };

  return (
    <div className="rounded-xl border border-violet-500/20 bg-violet-500/[0.02] overflow-hidden">
      <div className="flex items-center gap-2 border-b border-violet-500/20 bg-violet-500/[0.04] px-4 py-2">
        <div className="size-2 rounded-full bg-violet-500/50" />
        <span className="text-sm font-medium text-violet-400">SLA Calculator</span>
      </div>

      <div className="p-4 space-y-6">
        {/* Nines selector */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium">Number of 9s</label>
            <span className="text-sm font-mono font-bold text-violet-400">{ninesSliderLabel[nines] ?? `${availability}%`}</span>
          </div>
          <input
            type="range"
            min={1}
            max={5}
            value={nines}
            onChange={(e) => setNines(Number(e.target.value))}
            className="w-full h-1.5 rounded-full accent-violet-500 cursor-pointer"
          />
          <div className="grid grid-cols-3 gap-3">
            {[["Per Year", downtimePerYear], ["Per Month", downtimePerMonth], ["Per Day", downtimePerDay]].map(([label, val]) => (
              <div key={label} className="rounded-lg bg-muted/20 border border-border/30 p-2.5 text-center">
                <p className="text-[10px] text-muted-foreground mb-0.5">{label}</p>
                <p className="text-sm font-mono font-semibold">{val}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Dependency chain */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold">Dependency Chain</h4>
          <p className="text-xs text-muted-foreground">
            When services are chained, their availabilities multiply. Two services at 99.9% each
            give you only {combined}% combined.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            {[{ label: "Service A", val: depA, set: setDepA }, { label: "Service B", val: depB, set: setDepB }].map((svc) => (
              <div key={svc.label} className="space-y-1">
                <label className="text-[10px] text-muted-foreground">{svc.label}</label>
                <select value={svc.val} onChange={(e) => svc.set(Number(e.target.value))}
                  className="block text-xs bg-muted/20 border border-border rounded px-2 py-1">
                  {[99, 99.9, 99.99, 99.999].map((v) => <option key={v} value={v}>{v}%</option>)}
                </select>
              </div>
            )).reduce<React.ReactNode[]>((acc, el, i) => [...acc, ...(i > 0 ? [<span key={`x${i}`} className="text-muted-foreground text-lg font-mono mt-4">x</span>] : []), el], [])}
            <span className="text-muted-foreground text-lg font-mono mt-4">=</span>
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground">Combined</label>
              <div className={cn("text-sm font-mono font-bold px-3 py-1 rounded border",
                combined >= 99.9 ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
                  : combined >= 99 ? "text-amber-400 bg-amber-500/10 border-amber-500/30"
                  : "text-red-400 bg-red-500/10 border-red-500/30")}>{combined}%</div>
            </div>
          </div>
        </div>

        {/* Downtime chart */}
        <LiveChart
          type="bar"
          data={ninesData}
          dataKeys={{ x: "level", y: "downtime", label: "Downtime (hrs/yr)" }}
          height={160}
          unit="hrs"
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                         */
/* ------------------------------------------------------------------ */

export default function FaultTolerancePage() {
  return (
    <div className="space-y-8">
      <TopicHero
        title="Fault Tolerance"
        subtitle="Your server will crash. Your database will corrupt. Your network will split. The only question is whether your users notice."
        difficulty="intermediate"
      />

      <ConversationalCallout type="question">
        What happens when a single server dies in your architecture? If the answer is &quot;everything
        goes down,&quot; you have a Single Point of Failure (SPOF). Fault tolerance means designing
        systems that keep working when individual components fail.
      </ConversationalCallout>

      {/* 1. Redundancy Playground */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold">Redundancy</h2>
        <p className="text-sm text-muted-foreground">
          The core idea is simple: duplicate critical components so that when one fails, another takes
          over. Click the buttons below to kill servers, databases, and the load balancer. Watch how
          the system responds -- and notice what component, when killed, brings everything down.
        </p>
        <RedundancyPlayground />
        <AhaMoment
          question="You added redundancy to every server and database. Why does killing the Load Balancer still take down the whole system?"
          answer={
            <p>
              Because the Load Balancer itself is a Single Point of Failure! You need redundancy at
              every layer -- including the LB. In practice, cloud providers use anycast IPs and
              multiple LB instances. The lesson: walk through every component and ask &quot;what
              happens if this dies?&quot;
            </p>
          }
        />
      </section>

      {/* 2. Failover Strategies */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold">Failover Strategies</h2>
        <p className="text-sm text-muted-foreground">
          Redundancy alone is not enough -- you need a strategy for how traffic moves when a node
          dies. Toggle between Active-Passive and Active-Active to see the tradeoffs in action.
        </p>
        <FailoverStrategies />
        <ConversationalCallout type="tip">
          Use Active-Passive for stateful services (databases, ZooKeeper) where split-brain is
          dangerous. Use Active-Active for stateless services (web servers, API gateways) where
          every node can handle any request independently.
        </ConversationalCallout>
      </section>

      {/* 3. Retry with Backoff */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold">Retry with Exponential Backoff</h2>
        <p className="text-sm text-muted-foreground">
          When a request fails, should you retry immediately? That can overwhelm an already-struggling
          server. Exponential backoff waits longer between each retry: 1s, 2s, 4s, 8s, 16s. Adding
          jitter randomizes the delay so thousands of clients do not all retry at the same instant.
        </p>
        <RetryPlayground />
        <ConversationalCallout type="warning">
          Simple retries without backoff can cause a &quot;retry storm&quot; that keeps the server
          overloaded. Always use exponential backoff with jitter in production. Most HTTP client
          libraries and SDKs have this built in.
        </ConversationalCallout>
      </section>

      {/* 4. SLA Calculator */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold">SLA and the Nines</h2>
        <p className="text-sm text-muted-foreground">
          &quot;Five nines&quot; (99.999%) sounds impressive, but it means only 5 minutes of allowed
          downtime per year. Each additional nine costs exponentially more in engineering effort and
          infrastructure. Use the calculator below to explore the tradeoffs.
        </p>
        <SlaCalculator />
        <AhaMoment
          question="If Service A is 99.9% and Service B is 99.9%, why isn't the combined availability also 99.9%?"
          answer={
            <p>
              Because availabilities multiply, they do not average! 99.9% x 99.9% = 99.8%. Each
              dependency in your chain makes the overall system less reliable. This is why
              microservices architectures need careful SLA planning -- a request touching 10 services
              each at 99.9% gives you only 99% overall.
            </p>
          }
        />
      </section>

      <BeforeAfter
        before={{
          title: "No Fault Tolerance",
          content: (
            <ul className="text-xs text-muted-foreground space-y-1.5">
              <li>- Single server = total outage on crash</li>
              <li>- Manual restart takes 5-15 minutes</li>
              <li>- No retries; users see raw errors</li>
              <li>- 87.6 hours downtime per year (99% SLA)</li>
              <li>- One bad deploy takes everything down</li>
            </ul>
          ),
        }}
        after={{
          title: "With Fault Tolerance",
          content: (
            <ul className="text-xs text-muted-foreground space-y-1.5">
              <li>+ Redundant servers with auto-failover</li>
              <li>+ Recovery in seconds, not minutes</li>
              <li>+ Exponential backoff protects the server</li>
              <li>+ 5.3 minutes downtime per year (99.999%)</li>
              <li>+ Bulkheads contain blast radius</li>
            </ul>
          ),
        }}
      />

      <ConversationalCallout type="tip">
        In system design interviews, always identify SPOFs first. Walk through every component --
        server, database, load balancer, DNS, network link -- and ask &quot;what happens if this
        dies?&quot; Then discuss the cost-availability tradeoff: a 99.9% SLA (8.8 hours downtime per
        year) is perfectly fine for most applications. Do not over-engineer.
      </ConversationalCallout>

      <KeyTakeaway
        points={[
          "Fault tolerance means your system keeps working when individual components fail -- zero user-visible impact is the goal.",
          "Active-passive failover is simpler and avoids split-brain; active-active provides better utilization for stateless services.",
          "Exponential backoff with jitter prevents retry storms from overwhelming recovering servers.",
          "SLA nines multiply across dependencies: two 99.9% services in series give you only 99.8% combined availability.",
          "Every single point of failure is a ticking time bomb -- identify and eliminate them systematically.",
          "Match your fault tolerance investment to your actual SLA needs. Not every service needs five nines.",
        ]}
      />
    </div>
  );
}
