"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { TopicHero } from "@/components/topic-hero";
import { WhyCare } from "@/components/why-care";
import { GlossaryTerm } from "@/components/glossary-term";
import { TopicQuiz } from "@/components/topic-quiz";
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
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function generateTraffic(tick: number): number {
  const base = 50 + 30 * Math.sin((tick / 40) * Math.PI * 2);
  const spike = tick % 60 > 25 && tick % 60 < 35 ? 40 : 0;
  const noise = Math.sin(tick * 7.3) * 8;
  return Math.max(10, Math.round(base + spike + noise));
}

function buildFleetNodes(serverCount: number, cpuPerServer: number): FlowNode[] {
  const lbNode: FlowNode = {
    id: "lb",
    type: "loadBalancerNode",
    position: { x: 250, y: 0 },
    data: {
      label: "Load Balancer",
      sublabel: `${serverCount} targets`,
      status: "healthy",
      handles: { bottom: true },
    },
  };

  const statusMap: Record<string, "healthy" | "warning" | "unhealthy"> = {
    low: "healthy",
    mid: "warning",
    high: "unhealthy",
  };

  const servers: FlowNode[] = Array.from({ length: serverCount }, (_, i) => {
    const perCpu = Math.min(100, Math.max(5, cpuPerServer + (i % 3) * 4 - 4));
    const band = perCpu > 90 ? "high" : perCpu > 70 ? "mid" : "low";
    return {
      id: `s-${i}`,
      type: "serverNode" as const,
      position: { x: i * 120, y: 120 },
      data: {
        label: `Server ${i + 1}`,
        sublabel: `CPU ${perCpu}%`,
        status: statusMap[band],
        metrics: [{ label: "CPU", value: `${perCpu}%` }],
        handles: { top: true },
      },
    };
  });

  return [lbNode, ...servers];
}

function buildFleetEdges(serverCount: number): FlowEdge[] {
  return Array.from({ length: serverCount }, (_, i) => ({
    id: `lb-s${i}`,
    source: "lb",
    target: `s-${i}`,
    animated: true,
  }));
}

/* ------------------------------------------------------------------ */
/*  1. Auto-Scaling Simulator                                        */
/* ------------------------------------------------------------------ */

function AutoScaleSimulator() {
  const [threshold, setThreshold] = useState(70);
  const historyRef = useRef<{ time: number; traffic: number; servers: number; cpu: number }[]>([]);
  const serversRef = useRef(2);
  const cooldownRef = useRef(0);

  const sim = useSimulation({ intervalMs: 600, maxSteps: 120 });

  const traffic = generateTraffic(sim.tick);
  const cpuPerServer = Math.min(100, Math.round((traffic / Math.max(1, serversRef.current)) * 1.4));

  useEffect(() => {
    if (sim.tick === 0) {
      historyRef.current = [];
      serversRef.current = 2;
      cooldownRef.current = 0;
      return;
    }
    const t = generateTraffic(sim.tick);
    const cpu = Math.min(100, Math.round((t / Math.max(1, serversRef.current)) * 1.4));

    if (cooldownRef.current > 0) {
      cooldownRef.current -= 1;
    } else if (cpu > threshold && serversRef.current < 8) {
      serversRef.current += 1;
      cooldownRef.current = 5;
    } else if (cpu < threshold - 25 && serversRef.current > 2) {
      serversRef.current -= 1;
      cooldownRef.current = 5;
    }

    historyRef.current = [
      ...historyRef.current.slice(-39),
      { time: sim.tick, traffic: t, servers: serversRef.current, cpu },
    ];
  }, [sim.tick, threshold]);

  const nodes = useMemo(() => buildFleetNodes(serversRef.current, cpuPerServer), [serversRef.current, cpuPerServer]);
  const edges = useMemo(() => buildFleetEdges(serversRef.current), [serversRef.current]);

  return (
    <Playground
      title="Auto-Scaling Simulator"
      simulation={sim}
      canvasHeight="min-h-[420px]"
      hints={["Drag the CPU threshold slider while the simulation runs"]}
      canvas={
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-4 flex-wrap">
            <label className="text-xs text-muted-foreground">
              CPU Threshold:
              <span className="ml-1 font-mono text-violet-400">{threshold}%</span>
            </label>
            <input
              type="range"
              min={50}
              max={90}
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="w-32 accent-violet-500"
            />
            <div className="ml-auto flex gap-3 text-xs font-mono">
              <span>Traffic: <span className="text-blue-400">{traffic}</span></span>
              <span>Servers: <span className="text-emerald-400">{serversRef.current}</span></span>
              <span>CPU: <span className={cn(
                cpuPerServer > 90 ? "text-red-400" : cpuPerServer > 70 ? "text-amber-400" : "text-emerald-400"
              )}>{cpuPerServer}%</span></span>
            </div>
          </div>
          <FlowDiagram nodes={nodes} edges={edges} minHeight={180} fitView interactive={false} />
          <LiveChart
            type="line"
            data={historyRef.current}
            dataKeys={{ x: "time", y: ["traffic", "servers"], label: ["Traffic", "Servers"] }}
            height={150}
            referenceLines={[{ y: threshold, label: `CPU ${threshold}%`, color: "#f59e0b" }]}
            showLegend
          />
        </div>
      }
      explanation={
        <div className="space-y-3">
          <p className="text-sm font-medium">How it works</p>
          <p className="text-xs text-muted-foreground">
            Traffic follows a sine wave with random spikes. When average CPU exceeds your
            threshold, the auto-scaler adds a server. When CPU drops well below threshold,
            it removes one. A cooldown period prevents thrashing.
          </p>
          <p className="text-xs text-muted-foreground">
            Notice the <strong>scaling lag</strong>: traffic spikes before new capacity is ready.
            This is why pre-warming and predictive scaling matter in production.
          </p>
          <div className="rounded-lg bg-muted/30 p-2 text-xs space-y-1">
            <div className="flex justify-between"><span className="text-muted-foreground">Min servers</span><span className="font-mono">2</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Max servers</span><span className="font-mono">8</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Cooldown</span><span className="font-mono">5 ticks</span></div>
          </div>
        </div>
      }
    />
  );
}

/* ------------------------------------------------------------------ */
/*  2. Scaling Policy Playground                                     */
/* ------------------------------------------------------------------ */

type PolicyKey = "target" | "step" | "scheduled";

const policyLabels: Record<PolicyKey, string> = {
  target: "Target Tracking (70% CPU)",
  step: "Step Scaling",
  scheduled: "Scheduled",
};

function applyPolicy(policy: PolicyKey, traffic: number, currentServers: number, tick: number): number {
  const cpu = Math.min(100, Math.round((traffic / Math.max(1, currentServers)) * 1.4));
  if (policy === "target") {
    if (cpu > 70 && currentServers < 10) return currentServers + 1;
    if (cpu < 45 && currentServers > 2) return currentServers - 1;
  } else if (policy === "step") {
    if (cpu > 90 && currentServers < 10) return Math.min(10, currentServers + 4);
    if (cpu > 80 && currentServers < 10) return Math.min(10, currentServers + 2);
    if (cpu < 40 && currentServers > 2) return currentServers - 1;
  } else {
    const hour = (tick % 48) / 2;
    if (hour >= 9 && hour < 18) return Math.max(currentServers, 5);
    return Math.max(2, currentServers - 1);
  }
  return currentServers;
}

function ScalingPolicyPlayground() {
  const [activePolicy, setActivePolicy] = useState<PolicyKey>("target");
  const sim = useSimulation({ intervalMs: 400, maxSteps: 96 });

  const histories = useRef<Record<PolicyKey, { time: number; servers: number; cpu: number }[]>>({
    target: [], step: [], scheduled: [],
  });
  const serverCounts = useRef<Record<PolicyKey, number>>({ target: 2, step: 2, scheduled: 2 });

  useEffect(() => {
    if (sim.tick === 0) {
      histories.current = { target: [], step: [], scheduled: [] };
      serverCounts.current = { target: 2, step: 2, scheduled: 2 };
      return;
    }
    const t = generateTraffic(sim.tick);
    for (const p of ["target", "step", "scheduled"] as PolicyKey[]) {
      const prev = serverCounts.current[p];
      serverCounts.current[p] = applyPolicy(p, t, prev, sim.tick);
      const cpu = Math.min(100, Math.round((t / Math.max(1, serverCounts.current[p])) * 1.4));
      histories.current[p] = [
        ...histories.current[p].slice(-47),
        { time: sim.tick, servers: serverCounts.current[p], cpu },
      ];
    }
  }, [sim.tick]);

  const chartData = histories.current.target.map((_, i) => ({
    time: histories.current.target[i]?.time ?? i,
    "Target Tracking": histories.current.target[i]?.servers ?? 2,
    "Step Scaling": histories.current.step[i]?.servers ?? 2,
    "Scheduled": histories.current.scheduled[i]?.servers ?? 2,
  }));

  const policyButtons: PolicyKey[] = ["target", "step", "scheduled"];

  return (
    <Playground
      title="Scaling Policy Comparison"
      simulation={sim}
      canvasHeight="min-h-[350px]"
      hints={["Switch policies while running to compare reactions"]}
      canvas={
        <div className="p-4 space-y-4">
          <div className="flex gap-2 flex-wrap">
            {policyButtons.map((p) => (
              <button
                key={p}
                onClick={() => setActivePolicy(p)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                  activePolicy === p
                    ? "bg-violet-500/20 text-violet-400 ring-1 ring-violet-500/30"
                    : "bg-muted/40 text-muted-foreground hover:bg-muted/60"
                )}
              >
                {policyLabels[p]}
              </button>
            ))}
          </div>
          <LiveChart
            type="line"
            data={chartData}
            dataKeys={{
              x: "time",
              y: ["Target Tracking", "Step Scaling", "Scheduled"],
              label: ["Target Tracking", "Step Scaling", "Scheduled"],
            }}
            height={220}
            showLegend
            unit="servers"
          />
        </div>
      }
      explanation={
        <div className="space-y-3">
          <p className="text-sm font-medium">Policy details</p>
          {activePolicy === "target" && (
            <p className="text-xs text-muted-foreground">
              <strong>Target Tracking</strong> maintains 70% CPU. The simplest policy -- you set a target
              and the auto-scaler adds or removes instances to stay close. Smooth and predictable.
            </p>
          )}
          {activePolicy === "step" && (
            <p className="text-xs text-muted-foreground">
              <strong>Step Scaling</strong> uses graduated responses: above 80% CPU add 2, above 90%
              add 4 at once. Responds more aggressively to major spikes, but can overshoot.
            </p>
          )}
          {activePolicy === "scheduled" && (
            <p className="text-xs text-muted-foreground">
              <strong>Scheduled Scaling</strong> pre-warms 5 servers at 9am and scales down at 6pm.
              Ideal for predictable daily patterns. Combine with reactive policies as a safety net.
            </p>
          )}
          <div className="text-xs text-muted-foreground">
            Watch the chart to compare how each policy reacts to the same traffic pattern.
            Step scaling responds fastest to spikes; scheduled scaling anticipates demand.
          </div>
        </div>
      }
    />
  );
}

/* ------------------------------------------------------------------ */
/*  3. Cost Optimization                                             */
/* ------------------------------------------------------------------ */

function CostOptimizationPlayground() {
  const [minInstances, setMinInstances] = useState(2);
  const [maxInstances, setMaxInstances] = useState(10);
  const [targetCpu, setTargetCpu] = useState(70);

  const costData = useMemo(() => {
    const data: { hour: string; overProvisioned: number; rightSized: number; underProvisioned: number }[] = [];
    for (let h = 0; h < 24; h++) {
      const traffic = 40 + 35 * Math.sin(((h - 6) / 24) * Math.PI * 2) + (h >= 18 && h <= 20 ? 25 : 0);
      const idealServers = Math.max(minInstances, Math.min(maxInstances, Math.ceil(traffic / targetCpu * 2)));
      const overCount = maxInstances;
      const underCount = minInstances;
      const costPerHour = 0.096;
      data.push({
        hour: `${h.toString().padStart(2, "0")}:00`,
        overProvisioned: Math.round(overCount * costPerHour * 100) / 100,
        rightSized: Math.round(idealServers * costPerHour * 100) / 100,
        underProvisioned: Math.round(underCount * costPerHour * 100) / 100,
      });
    }
    return data;
  }, [minInstances, maxInstances, targetCpu]);

  const dailyCost = useMemo(() => {
    const over = costData.reduce((s, d) => s + d.overProvisioned, 0);
    const right = costData.reduce((s, d) => s + d.rightSized, 0);
    const under = costData.reduce((s, d) => s + d.underProvisioned, 0);
    return { over: over.toFixed(2), right: right.toFixed(2), under: under.toFixed(2) };
  }, [costData]);

  return (
    <Playground
      title="Cost Optimization Explorer"
      controls={false}
      canvasHeight="min-h-[380px]"
      hints={["Adjust min/max instances to find the cost sweet spot"]}
      canvas={
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-3 gap-4 text-xs">
            <label className="space-y-1">
              <span className="text-muted-foreground">Min instances: <span className="font-mono text-violet-400">{minInstances}</span></span>
              <input type="range" min={1} max={5} value={minInstances} onChange={(e) => setMinInstances(Number(e.target.value))} className="w-full accent-violet-500" />
            </label>
            <label className="space-y-1">
              <span className="text-muted-foreground">Max instances: <span className="font-mono text-violet-400">{maxInstances}</span></span>
              <input type="range" min={5} max={20} value={maxInstances} onChange={(e) => setMaxInstances(Number(e.target.value))} className="w-full accent-violet-500" />
            </label>
            <label className="space-y-1">
              <span className="text-muted-foreground">Target CPU: <span className="font-mono text-violet-400">{targetCpu}%</span></span>
              <input type="range" min={50} max={90} value={targetCpu} onChange={(e) => setTargetCpu(Number(e.target.value))} className="w-full accent-violet-500" />
            </label>
          </div>
          <LiveChart
            type="area"
            data={costData}
            dataKeys={{
              x: "hour",
              y: ["overProvisioned", "rightSized", "underProvisioned"],
              label: ["Over-provisioned", "Right-sized", "Under-provisioned"],
            }}
            height={200}
            unit="$"
            showLegend
          />
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-2">
              <div className="text-muted-foreground">Over-provisioned</div>
              <div className="text-lg font-mono font-bold text-red-400">${dailyCost.over}</div>
              <div className="text-muted-foreground/60">per day</div>
            </div>
            <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2">
              <div className="text-muted-foreground">Right-sized</div>
              <div className="text-lg font-mono font-bold text-emerald-400">${dailyCost.right}</div>
              <div className="text-muted-foreground/60">per day</div>
            </div>
            <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-2">
              <div className="text-muted-foreground">Under-provisioned</div>
              <div className="text-lg font-mono font-bold text-amber-400">${dailyCost.under}</div>
              <div className="text-muted-foreground/60">per day (+ downtime)</div>
            </div>
          </div>
        </div>
      }
      explanation={
        <div className="space-y-3">
          <p className="text-sm font-medium">The goldilocks zone</p>
          <p className="text-xs text-muted-foreground">
            Over-provisioning runs max instances 24/7 -- safe but expensive.
            Under-provisioning uses the minimum always -- cheap but crashes during peaks.
          </p>
          <p className="text-xs text-muted-foreground">
            <strong>Right-sizing</strong> with auto-scaling dynamically adjusts between min and max
            based on actual CPU load. Adjust the sliders to find the sweet spot where cost
            stays low without risking availability.
          </p>
        </div>
      }
    />
  );
}

/* ------------------------------------------------------------------ */
/*  4. Cooldown Period Demo                                          */
/* ------------------------------------------------------------------ */

function CooldownDemo() {
  const sim = useSimulation({ intervalMs: 500, maxSteps: 80 });

  const noCooldownHistory = useRef<{ time: number; instances: number }[]>([]);
  const withCooldownHistory = useRef<{ time: number; instances: number }[]>([]);
  const noCooldownServers = useRef(3);
  const withCooldownServers = useRef(3);
  const cooldownTimer = useRef(0);

  useEffect(() => {
    if (sim.tick === 0) {
      noCooldownHistory.current = [];
      withCooldownHistory.current = [];
      noCooldownServers.current = 3;
      withCooldownServers.current = 3;
      cooldownTimer.current = 0;
      return;
    }
    const t = generateTraffic(sim.tick);
    const noCpu = Math.min(100, Math.round((t / Math.max(1, noCooldownServers.current)) * 1.4));

    // No cooldown: reacts immediately every tick
    if (noCpu > 70 && noCooldownServers.current < 8) {
      noCooldownServers.current += 1;
    } else if (noCpu < 40 && noCooldownServers.current > 2) {
      noCooldownServers.current -= 1;
    }

    // With cooldown: waits 8 ticks between changes
    const wCpu = Math.min(100, Math.round((t / Math.max(1, withCooldownServers.current)) * 1.4));
    if (cooldownTimer.current > 0) {
      cooldownTimer.current -= 1;
    } else if (wCpu > 70 && withCooldownServers.current < 8) {
      withCooldownServers.current += 1;
      cooldownTimer.current = 8;
    } else if (wCpu < 40 && withCooldownServers.current > 2) {
      withCooldownServers.current -= 1;
      cooldownTimer.current = 8;
    }

    noCooldownHistory.current = [
      ...noCooldownHistory.current.slice(-39),
      { time: sim.tick, instances: noCooldownServers.current },
    ];
    withCooldownHistory.current = [
      ...withCooldownHistory.current.slice(-39),
      { time: sim.tick, instances: withCooldownServers.current },
    ];
  }, [sim.tick]);

  const chartData = noCooldownHistory.current.map((d, i) => ({
    time: d.time,
    "No Cooldown": d.instances,
    "With Cooldown": withCooldownHistory.current[i]?.instances ?? 3,
  }));

  return (
    <Playground
      title="Cooldown Period Demo"
      simulation={sim}
      canvasHeight="min-h-[300px]"
      hints={["Watch how 'No Cooldown' oscillates wildly vs stable cooldown"]}
      canvas={
        <div className="p-4 space-y-4">
          <LiveChart
            type="line"
            data={chartData}
            dataKeys={{
              x: "time",
              y: ["No Cooldown", "With Cooldown"],
              label: ["No Cooldown (thrashing)", "With Cooldown (stable)"],
            }}
            height={220}
            showLegend
            unit="instances"
          />
        </div>
      }
      explanation={
        <div className="space-y-3">
          <p className="text-sm font-medium">Why cooldowns matter</p>
          <p className="text-xs text-muted-foreground">
            <strong>Without cooldown</strong>, the auto-scaler reacts to every metric fluctuation.
            Server count oscillates wildly -- add, remove, add, remove. Each launch/termination
            costs money and takes 60-90 seconds of reduced capacity.
          </p>
          <p className="text-xs text-muted-foreground">
            <strong>With cooldown</strong> (default 300s in AWS), the scaler waits after each action
            before re-evaluating. The fleet stabilizes. Less churn, lower cost, more predictable behavior.
          </p>
        </div>
      }
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                        */
/* ------------------------------------------------------------------ */

export default function AutoScalingPage() {
  return (
    <div className="space-y-8">
      <TopicHero
        title="Auto-Scaling"
        subtitle="Let your infrastructure grow and shrink with demand so you never pay for idle servers -- or crash under load. The elastic backbone of cloud-native applications."
        difficulty="intermediate"
      />

      <WhyCare>
        Black Friday traffic can spike 10x in minutes. Companies that auto-scale handle it seamlessly — those that don&apos;t lose millions in failed transactions.
      </WhyCare>

      <section className="space-y-4">
        <h2 className="text-xl font-bold">Watch Auto-Scaling in Action</h2>
        <p className="text-sm text-muted-foreground">
          Hit play and drag the CPU threshold slider. When traffic pushes CPU above
          your threshold, <GlossaryTerm term="auto-scaling">auto-scaling</GlossaryTerm> adds new servers to the diagram. When traffic drops, excess
          servers are removed after a cooldown period. Watch the scaling lag -- servers
          take time to spin up while <GlossaryTerm term="throughput">throughput</GlossaryTerm> demands spike ahead of capacity.
        </p>
        <AutoScaleSimulator />
      </section>

      <ConversationalCallout type="tip">
        In system design interviews, always mention three things about auto-scaling:
        (1) the <strong>metric</strong> that triggers scaling (like <GlossaryTerm term="latency">latency</GlossaryTerm> or CPU), (2) the <strong>policy type</strong> you
        would use (target tracking for most cases), and (3) that servers must be <strong>stateless</strong> with
        externalized state in Redis, S3, or a database.
      </ConversationalCallout>

      <section className="space-y-4">
        <h2 className="text-xl font-bold">Scaling Policies Compared</h2>
        <p className="text-sm text-muted-foreground">
          Three main strategies exist: Target Tracking (keep CPU at X%), Step Scaling (graduated
          responses to severity), and Scheduled Scaling (pre-warm for known patterns). Run the
          simulation to see how each reacts to identical traffic.
        </p>
        <ScalingPolicyPlayground />
      </section>

      <AhaMoment
        question="Why can't auto-scaling handle truly instant spikes (like a Super Bowl ad)?"
        answer={
          <span>
            Launching a new instance takes 60-90 seconds: boot the OS (~30s), start the application
            (~30s), pass health checks (~15s), register with the load balancer (~5s). For predictable
            mega-events, use <strong>scheduled scaling</strong> to pre-warm instances before the spike.
            Reactive auto-scaling is a safety net, not the primary strategy for known events.
          </span>
        }
      />

      <section className="space-y-4">
        <h2 className="text-xl font-bold">Cost Optimization</h2>
        <p className="text-sm text-muted-foreground">
          Finding the right balance between cost and availability is the core challenge. Adjust
          min/max instances and target CPU to see how daily costs change across three strategies:
          always over-provisioned, always under-provisioned, and right-sized with auto-scaling.
        </p>
        <CostOptimizationPlayground />
      </section>

      <BeforeAfter
        before={{
          title: "Without Auto-Scaling",
          content: (
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Fixed fleet of 2 servers provisioned for average load.</p>
              <ul className="list-disc pl-4 space-y-1 text-xs">
                <li>Crashes during traffic spikes (CPU 100%)</li>
                <li>Idle servers waste money during low traffic</li>
                <li>Manual intervention takes 30-45 minutes</li>
                <li>Revenue loss during every outage</li>
              </ul>
            </div>
          ),
        }}
        after={{
          title: "With Auto-Scaling",
          content: (
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Fleet adjusts from 2 to 20 servers automatically.</p>
              <ul className="list-disc pl-4 space-y-1 text-xs">
                <li>CPU stays near target (60-70%) at all times</li>
                <li>Scales down overnight, saves 40-60% on compute</li>
                <li>New capacity in 60-90 seconds, no human needed</li>
                <li>Zero-downtime scaling with health checks</li>
              </ul>
            </div>
          ),
        }}
      />

      <section className="space-y-4">
        <h2 className="text-xl font-bold">Cooldown: Preventing Thrashing</h2>
        <p className="text-sm text-muted-foreground">
          Without a cooldown period, auto-scaling can oscillate wildly: add servers, load drops,
          remove servers, load spikes, add servers again. This flapping wastes money and
          destabilizes your fleet. Compare the two behaviors below.
        </p>
        <CooldownDemo />
      </section>

      <ConversationalCallout type="warning">
        Auto-scaling requires <strong><GlossaryTerm term="stateless">stateless</GlossaryTerm> servers</strong>. A new instance must handle requests
        immediately without state from other servers. Sessions go in Redis or DynamoDB. Files go in S3.
        Config goes in Parameter Store. If your servers are stateful, auto-scaling causes data loss.
      </ConversationalCallout>

      <AhaMoment
        question="What metrics should trigger scaling besides CPU?"
        answer={
          <span>
            CPU is common but often not the best choice. Consider: <strong>Request Count Per Target</strong> (requests
            each server handles), <strong>SQS Queue Depth</strong> (for worker fleets),
            or <strong>custom metrics</strong> like P99 latency. The best metric is the one most
            directly correlated with user experience degradation.
          </span>
        }
      />

      <ConversationalCallout type="question">
        If you could only pick one scaling policy for a typical web application, which would you
        choose and why? Think about target tracking vs step scaling for a moment before reading on.
        Most teams start with target tracking at 60-70% CPU because it is the simplest to reason about
        and works well for steady-state workloads.
      </ConversationalCallout>

      <TopicQuiz
        questions={[
          {
            question: "Why do auto-scaling groups use cooldown periods?",
            options: [
              "To save money on server launches",
              "To prevent rapid add/remove oscillation (thrashing) after each scaling event",
              "To give developers time to review changes",
              "Because cloud providers require a minimum wait time",
            ],
            correctIndex: 1,
            explanation: "Without cooldowns, the auto-scaler reacts to every metric fluctuation, causing expensive and destabilizing oscillation. Cooldowns let new capacity stabilize before re-evaluating.",
          },
          {
            question: "A Super Bowl ad will air in 2 hours and you expect 50x normal traffic. What scaling strategy is best?",
            options: [
              "Rely on target tracking to react to the spike",
              "Use scheduled scaling to pre-warm instances before the spike",
              "Increase the CPU threshold so fewer servers are needed",
              "Disable cooldown periods for faster reaction",
            ],
            correctIndex: 1,
            explanation: "Reactive auto-scaling takes 60-90 seconds per instance to launch. For known mega-events, scheduled scaling pre-warms capacity ahead of time so it is ready when traffic hits.",
          },
          {
            question: "What must be true about your servers for auto-scaling to work correctly?",
            options: [
              "They must all run the same operating system",
              "They must be in the same data center",
              "They must be stateless with externalized state (Redis, S3)",
              "They must have identical hardware specifications",
            ],
            correctIndex: 2,
            explanation: "Auto-scaling adds and removes servers dynamically. If a server stores state locally (sessions, files), that state is lost when the instance is terminated. State must live in external stores.",
          },
        ]}
      />

      <KeyTakeaway
        points={[
          "Auto-scaling adjusts server count based on real-time metrics like CPU, request rate, or queue depth.",
          "Target tracking is the simplest policy: set a target CPU% and the scaler handles the rest.",
          "Step scaling provides graduated responses: small spikes add 1 server, large spikes add 5+.",
          "Cooldown periods (default 300s) prevent flapping -- the expensive oscillation of rapidly adding and removing servers.",
          "Instance warmup takes 60-90s. For known spikes, use scheduled scaling to pre-warm capacity.",
          "Auto-scaling requires stateless servers with externalized state (sessions in Redis, files in S3).",
        ]}
      />
    </div>
  );
}
