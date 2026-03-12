"use client";

import { useState, useEffect, useRef } from "react";
import { TopicHero } from "@/components/topic-hero";
import { FailureScenario } from "@/components/failure-scenario";
import { WhyItBreaks } from "@/components/why-it-breaks";
import { ConceptVisualizer } from "@/components/concept-visualizer";
import { CorrectApproach } from "@/components/correct-approach";
import { KeyTakeaway } from "@/components/key-takeaway";
import { ScaleSimulator } from "@/components/scale-simulator";
import { ServerNode } from "@/components/server-node";
import { MetricCounter } from "@/components/metric-counter";
import { AnimatedFlow } from "@/components/animated-flow";
import { InteractiveDemo } from "@/components/interactive-demo";
import { AhaMoment } from "@/components/aha-moment";
import { ConversationalCallout } from "@/components/conversational-callout";
import { BeforeAfter } from "@/components/before-after";
import { cn } from "@/lib/utils";
import { Activity, Clock, TrendingUp, TrendingDown, Flame, Snowflake, Timer } from "lucide-react";

/* ── Server fleet with stable random offsets ── */
function CpuTimelineServerFleet({ cpu, servers }: { cpu: number; servers: number }) {
  const offsetsRef = useRef<number[]>([]);
  if (offsetsRef.current.length < servers) {
    offsetsRef.current = Array.from({ length: 20 }, () => Math.random() * 10 - 5);
  }
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {Array.from({ length: servers }).map((_, i) => {
        const perServerCpu = Math.round(cpu * (2 / servers) + offsetsRef.current[i]);
        const clampedCpu = Math.max(10, Math.min(100, perServerCpu));
        return (
          <ServerNode
            key={i}
            type="server"
            label={`S${i + 1}`}
            sublabel={`~${clampedCpu}%`}
            status={clampedCpu > 95 ? "unhealthy" : clampedCpu > 85 ? "warning" : "healthy"}
          />
        );
      })}
    </div>
  );
}

/* ── CPU Timeline Visualization ── */
function CpuTimelineViz() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((s) => (s + 1) % 30), 500);
    return () => clearInterval(t);
  }, []);

  // Simulated CPU pattern: normal → spike → scale out → cooldown → stabilize → low → scale in
  const cpuPattern = [
    35, 38, 42, 40, 55, 68, 78, 85, 92, 95, // 0-9: traffic spike
    88, 72, 60, 55, 52, 50, 48, 45, 42, 40, // 10-19: servers added, CPU drops
    38, 35, 30, 25, 22, 20, 18, 22, 28, 32, // 20-29: low traffic, scale in
  ];

  const serverCount = [
    2, 2, 2, 2, 2, 2, 3, 3, 4, 5,   // scale out starts at tick 6
    5, 5, 5, 5, 5, 5, 5, 5, 4, 3,   // cooldown, then scale in
    3, 3, 2, 2, 2, 2, 2, 2, 2, 2,   // back to minimum
  ];

  const cooldownActive = [
    false, false, false, false, false, false, false, false, false, true,
    true, true, true, true, false, false, false, false, false, false,
    false, false, false, false, false, false, false, false, false, false,
  ];

  const cpu = cpuPattern[tick];
  const servers = serverCount[tick];
  const inCooldown = cooldownActive[tick];

  return (
    <div className="space-y-4">
      {/* Timeline bar chart */}
      <div className="flex items-end gap-[2px] h-24">
        {cpuPattern.map((val, i) => (
          <div
            key={i}
            className={cn(
              "flex-1 rounded-t-sm transition-all duration-200",
              i === tick
                ? "ring-1 ring-white/40"
                : "",
              i <= tick
                ? val > 85
                  ? "bg-red-500"
                  : val > 70
                  ? "bg-amber-500"
                  : val > 50
                  ? "bg-blue-500"
                  : "bg-emerald-500"
                : "bg-muted/20"
            )}
            style={{ height: `${val}%` }}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between text-[10px] text-muted-foreground/60 font-mono px-0.5">
        <span>t=0</span>
        <span>Normal</span>
        <span className="text-red-400">Spike</span>
        <span className="text-emerald-400">Scaled Out</span>
        <span>Cooldown</span>
        <span>Scale In</span>
      </div>

      {/* Status dashboard */}
      <div className="grid grid-cols-4 gap-2">
        <div className="rounded-lg bg-muted/30 p-2 text-center">
          <div className="text-[10px] text-muted-foreground">CPU</div>
          <div className={cn(
            "text-sm font-mono font-bold",
            cpu > 85 ? "text-red-400" : cpu > 70 ? "text-amber-400" : "text-emerald-400"
          )}>
            {cpu}%
          </div>
        </div>
        <div className="rounded-lg bg-muted/30 p-2 text-center">
          <div className="text-[10px] text-muted-foreground">Servers</div>
          <div className="text-sm font-mono font-bold">{servers}</div>
        </div>
        <div className="rounded-lg bg-muted/30 p-2 text-center">
          <div className="text-[10px] text-muted-foreground">Cooldown</div>
          <div className={cn(
            "text-sm font-mono font-bold",
            inCooldown ? "text-amber-400" : "text-emerald-400"
          )}>
            {inCooldown ? "ACTIVE" : "OFF"}
          </div>
        </div>
        <div className="rounded-lg bg-muted/30 p-2 text-center">
          <div className="text-[10px] text-muted-foreground">Action</div>
          <div className="text-sm font-mono font-bold">
            {cpu > 85 ? (
              <span className="text-red-400 flex items-center justify-center gap-1">
                <TrendingUp className="size-3" /> OUT
              </span>
            ) : cpu < 30 && servers > 2 ? (
              <span className="text-blue-400 flex items-center justify-center gap-1">
                <TrendingDown className="size-3" /> IN
              </span>
            ) : inCooldown ? (
              <span className="text-amber-400 flex items-center justify-center gap-1">
                <Timer className="size-3" /> WAIT
              </span>
            ) : (
              <span className="text-emerald-400">OK</span>
            )}
          </div>
        </div>
      </div>

      {/* Server fleet */}
      <CpuTimelineServerFleet cpu={cpu} servers={servers} />

      <p className="text-[10px] text-muted-foreground/60 text-center">
        {tick < 5
          ? "Normal traffic. 2 servers at ~40% CPU. Auto-scaler is monitoring."
          : tick < 10
          ? "Traffic spike detected! CPU > 70% for 2+ minutes. Auto-scaler adding instances..."
          : tick < 14
          ? "Cooldown period active. Auto-scaler waits 5 minutes before re-evaluating to prevent flapping."
          : tick < 20
          ? "Fleet stabilized at target CPU. Traffic being handled comfortably."
          : tick < 25
          ? "Traffic declining. CPU below 30%. After cooldown, auto-scaler removes excess servers."
          : "Back to baseline. Only minimum 2 servers running. Cost savings realized."}
      </p>
    </div>
  );
}

/* ── Scaling Policy Comparison ── */
function ScalingPolicyViz() {
  const [policy, setPolicy] = useState<"target" | "step" | "scheduled">("target");

  const policies = {
    target: {
      name: "Target Tracking",
      desc: "Set a target metric value and the auto-scaler continuously adjusts to maintain it. The simplest and most commonly recommended policy.",
      config: [
        { key: "Target Metric", value: "Average CPU" },
        { key: "Target Value", value: "60%" },
        { key: "Scale-out Cooldown", value: "300s" },
        { key: "Scale-in Cooldown", value: "300s" },
      ],
      example: "\"Keep average CPU at 60%.\" If CPU hits 80%, add instances. If CPU drops to 40%, remove instances.",
      awsName: "TargetTrackingScaling",
    },
    step: {
      name: "Step Scaling",
      desc: "Define graduated responses based on alarm severity. Bigger breaches trigger more aggressive scaling. Good for workloads with unpredictable spikes.",
      config: [
        { key: "CPU 60-70%", value: "+1 instance" },
        { key: "CPU 70-85%", value: "+3 instances" },
        { key: "CPU 85-95%", value: "+5 instances" },
        { key: "CPU > 95%", value: "+8 instances" },
      ],
      example: "Moderate spike? Add 1 server. Severe spike? Add 5 at once. Proportional response.",
      awsName: "StepScaling",
    },
    scheduled: {
      name: "Scheduled Scaling",
      desc: "Pre-scale based on known traffic patterns. Set the fleet size in advance for predictable events. Combine with reactive policies as a safety net.",
      config: [
        { key: "Weekdays 9AM", value: "min: 4 instances" },
        { key: "Weekdays 6PM", value: "min: 2 instances" },
        { key: "Black Friday", value: "min: 20 instances" },
        { key: "Weekends", value: "min: 3 instances" },
      ],
      example: "Scale to 20 servers at 8AM on Black Friday. Don't wait for the spike to hit.",
      awsName: "ScheduledScaling",
    },
  };

  const active = policies[policy];

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(["target", "step", "scheduled"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPolicy(p)}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
              policy === p
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {policies[p].name}
          </button>
        ))}
      </div>

      <div className="rounded-lg border border-border/50 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold">{active.name}</h4>
          <span className="text-[10px] font-mono text-muted-foreground/60 bg-muted/30 px-2 py-0.5 rounded">
            {active.awsName}
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">{active.desc}</p>

        <div className="space-y-1">
          {active.config.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between rounded-md bg-muted/20 px-3 py-1.5 border border-border/30"
            >
              <span className="text-[10px] text-muted-foreground">{item.key}</span>
              <span className="text-[11px] font-mono font-medium">{item.value}</span>
            </div>
          ))}
        </div>

        <p className="text-[10px] text-muted-foreground/60 italic border-l-2 border-border/30 pl-2">
          {active.example}
        </p>
      </div>
    </div>
  );
}

/* ── Cooldown Period Explanation ── */
function CooldownViz() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((s) => (s + 1) % 12), 800);
    return () => clearInterval(t);
  }, []);

  // Without cooldown: oscillating
  const withoutCooldown = [2, 5, 2, 5, 2, 5, 2, 5, 2, 5, 2, 5];
  // With cooldown: stable
  const withCooldown = [2, 2, 3, 4, 5, 5, 5, 5, 5, 5, 5, 5];

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 space-y-3">
        <div className="flex items-center gap-2">
          <Flame className="size-4 text-red-400" />
          <h4 className="text-xs font-semibold text-red-400">Without Cooldown (Flapping)</h4>
        </div>
        <div className="flex items-end gap-[3px] h-16">
          {withoutCooldown.map((val, i) => (
            <div
              key={i}
              className={cn(
                "flex-1 rounded-t-sm transition-all duration-200",
                i <= tick ? "bg-red-400" : "bg-red-400/20"
              )}
              style={{ height: `${(val / 5) * 100}%` }}
            />
          ))}
        </div>
        <div className="flex gap-1 text-[9px] font-mono text-muted-foreground/50">
          {withoutCooldown.map((v, i) => (
            <div key={i} className="flex-1 text-center">{i <= tick ? v : ""}</div>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground">
          Spike adds 3 servers → load drops → removes 3 → spike again → adds 3... An expensive oscillation loop.
        </p>
      </div>

      <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 space-y-3">
        <div className="flex items-center gap-2">
          <Snowflake className="size-4 text-emerald-400" />
          <h4 className="text-xs font-semibold text-emerald-400">With 5-min Cooldown (Stable)</h4>
        </div>
        <div className="flex items-end gap-[3px] h-16">
          {withCooldown.map((val, i) => (
            <div
              key={i}
              className={cn(
                "flex-1 rounded-t-sm transition-all duration-200",
                i <= tick ? "bg-emerald-400" : "bg-emerald-400/20"
              )}
              style={{ height: `${(val / 5) * 100}%` }}
            />
          ))}
        </div>
        <div className="flex gap-1 text-[9px] font-mono text-muted-foreground/50">
          {withCooldown.map((v, i) => (
            <div key={i} className="flex-1 text-center">{i <= tick ? v : ""}</div>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground">
          Scale out, wait 5 minutes, re-evaluate. Fleet stabilizes. No wasted launches and terminations.
        </p>
      </div>
    </div>
  );
}

/* ── Instance Warmup Timeline ── */
function WarmupTimelineViz() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % 6), 1500);
    return () => clearInterval(t);
  }, []);

  const stages = [
    { label: "Instance Launched", time: "0s", desc: "AWS starts the EC2 instance", duration: "~30s" },
    { label: "OS Booting", time: "30s", desc: "Linux kernel loads, services start", duration: "~15s" },
    { label: "App Starting", time: "45s", desc: "Application process initializes, loads config", duration: "~30s" },
    { label: "Health Check Passes", time: "75s", desc: "ALB sends health check, gets 200 OK", duration: "~15s" },
    { label: "Registered in LB", time: "90s", desc: "Added to target group, receives traffic", duration: "~5s" },
    { label: "Handling Requests", time: "95s", desc: "New instance is fully operational", duration: "Ready!" },
  ];

  return (
    <div className="space-y-1.5">
      {stages.map((s, i) => (
        <div key={s.label} className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-muted-foreground/50 w-10 text-right shrink-0">{s.time}</span>
          <div className="flex-1 flex items-center gap-2">
            <div
              className={cn(
                "h-7 rounded-md flex items-center px-3 text-xs font-medium transition-all duration-300 border",
                step > i
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : step === i
                  ? "bg-blue-500/10 border-blue-500/30 text-blue-400 ring-1 ring-blue-500/20"
                  : "bg-muted/20 border-border/50 text-muted-foreground/40"
              )}
              style={{ width: `${50 + i * 8}%` }}
            >
              {s.label}
            </div>
            <span className={cn(
              "text-[10px] font-mono transition-opacity shrink-0",
              step >= i ? "opacity-100 text-muted-foreground" : "opacity-0"
            )}>
              {s.duration}
            </span>
          </div>
        </div>
      ))}
      <p className="text-[10px] text-muted-foreground/60 pl-[52px] pt-1">
        {step < 4
          ? "New instance is booting... cannot handle requests yet."
          : step === 4
          ? "Health check passed! Being added to load balancer pool."
          : "Instance is live. Total warmup: ~90 seconds from launch to first request."}
      </p>
    </div>
  );
}

function computeAutoScale(users: number) {
  const usersPerServer = 2000;
  const minServers = 2;
  const maxServers = 20;
  const needed = Math.ceil(users / usersPerServer);
  return Math.max(minServers, Math.min(maxServers, needed));
}

export default function AutoScalingPage() {
  return (
    <div className="space-y-8">
      <TopicHero
        title="Auto-Scaling"
        subtitle="Let your infrastructure grow and shrink with demand so you never pay for idle servers -- or crash under load. The elastic backbone of cloud-native applications."
        difficulty="intermediate"
      />

      <FailureScenario title="Black Friday: 40,000 users, 2 servers, 45 minutes of downtime">
        <p className="text-sm text-muted-foreground">
          It is Black Friday. Your e-commerce site normally handles 3,000 users on two servers.
          At 9 AM, traffic spikes to <strong className="text-red-400">40,000 concurrent users</strong>.
          Your two servers melt -- CPU pinned at 100%, memory exhausted, and the Linux OOM killer
          starts terminating processes. By the time your on-call engineer wakes up, logs into AWS,
          manually launches instances, and waits for them to boot and pass health checks,
          <strong> 45 minutes have passed</strong>. You lost $200,000 in revenue and 12,000 abandoned carts.
        </p>
        <div className="flex justify-center gap-4 pt-3">
          <ServerNode type="server" label="Server 1" sublabel="CPU 100%" status="unhealthy" />
          <ServerNode type="server" label="Server 2" sublabel="OOM Killed" status="unhealthy" />
          <div className="flex flex-col items-center justify-center">
            <span className="text-[10px] text-muted-foreground font-mono">40,000 users</span>
            <span className="text-[10px] text-red-400 font-mono">503 errors</span>
          </div>
        </div>
      </FailureScenario>

      <WhyItBreaks title="Manual provisioning cannot keep up with traffic">
        <p className="text-sm text-muted-foreground">
          Manually provisioned infrastructure cannot react to traffic spikes. The timeline of a manual
          response tells the whole story:
        </p>
        <div className="grid grid-cols-2 gap-2 mt-3">
          {[
            { n: "0:00", label: "Traffic Spike Begins", desc: "CPU shoots to 100%" },
            { n: "0:05", label: "Alert Fires", desc: "PagerDuty wakes up the on-call" },
            { n: "0:15", label: "Engineer Logs In", desc: "Reads alerts, assesses the situation" },
            { n: "0:20", label: "Launches Instances", desc: "Starts 5 new EC2 instances" },
            { n: "0:22", label: "Instances Booting", desc: "OS loading, app starting..." },
            { n: "0:30", label: "Health Checks Pass", desc: "ALB starts routing traffic" },
            { n: "0:35", label: "Fleet Stabilizes", desc: "CPU drops to 60% across 7 servers" },
            { n: "0:45", label: "Incident Resolved", desc: "$200K revenue already lost" },
          ].map((item) => (
            <div key={item.n} className="flex items-start gap-2.5 rounded-lg bg-muted/30 p-2.5">
              <span className="text-[10px] font-mono font-bold text-orange-400 bg-orange-500/10 rounded-md px-1.5 py-0.5 shrink-0">
                {item.n}
              </span>
              <div>
                <p className="text-[11px] font-semibold">{item.label}</p>
                <p className="text-[10px] text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground mt-3">
          Conversely, keeping 20 servers running 24/7 &quot;just in case&quot; costs $1,400/month in idle
          instances during the 99% of time when 2-3 servers would suffice. You are either under-provisioned
          or over-paying. Auto-scaling solves both.
        </p>
      </WhyItBreaks>

      <ConceptVisualizer title="How Auto-Scaling Works">
        <p className="text-sm text-muted-foreground mb-4">
          Auto-scaling is a feedback loop: monitor metrics, evaluate against a policy, scale if needed,
          then cool down before evaluating again. AWS Auto Scaling Groups (ASGs) run this loop continuously.
        </p>
        <AnimatedFlow
          steps={[
            { id: "monitor", label: "Monitor Metrics", description: "CloudWatch: CPU, memory, request count, latency" },
            { id: "evaluate", label: "Evaluate Policy", description: "Is avg CPU > 70% for 2+ datapoints?" },
            { id: "decide", label: "Scale Decision", description: "Add 2 instances (or remove if underutilized)" },
            { id: "launch", label: "Launch & Register", description: "Boot instances, pass health checks, join ALB" },
            { id: "cooldown", label: "Cooldown Period", description: "Wait 300s before next scaling decision" },
          ]}
          direction="horizontal"
          interval={2000}
        />
      </ConceptVisualizer>

      <ConceptVisualizer title="CPU Timeline -- Watch Auto-Scaling React">
        <p className="text-sm text-muted-foreground mb-4">
          This timeline shows a real auto-scaling cycle: normal traffic, a CPU spike, instances scaling out,
          a cooldown period, stabilization, then scaling back in when demand drops. Watch how the server
          count and CPU percentage change together.
        </p>
        <CpuTimelineViz />
      </ConceptVisualizer>

      <CorrectApproach title="Scaling Policies -- Choose the Right Strategy">
        <p className="text-sm text-muted-foreground mb-4">
          AWS offers three types of scaling policies. Target Tracking is recommended for most workloads.
          Step Scaling handles unpredictable spikes. Scheduled Scaling pre-warms for known events.
        </p>
        <ScalingPolicyViz />
      </CorrectApproach>

      <ConceptVisualizer title="Cooldown Periods -- Preventing the Flapping Disaster">
        <p className="text-sm text-muted-foreground mb-4">
          Without cooldowns, auto-scaling can oscillate wildly: add servers, load drops, remove servers,
          load spikes, add servers again. This &quot;flapping&quot; wastes money on launch/termination
          cycles and destabilizes your fleet. The default cooldown is <strong>300 seconds (5 minutes)</strong>.
        </p>
        <CooldownViz />
      </ConceptVisualizer>

      <ConceptVisualizer title="Instance Warmup -- Why New Servers Need Time">
        <p className="text-sm text-muted-foreground mb-4">
          A newly launched instance is not immediately ready to handle production traffic. The
          <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">EstimatedInstanceWarmup</code> setting
          tells the auto-scaler to exclude new instances from metrics until they are fully ready.
          Without this, the auto-scaler sees low CPU on the new (idle) instance and stops scaling
          too early.
        </p>
        <WarmupTimelineViz />
      </ConceptVisualizer>

      <BeforeAfter
        before={{
          title: "Without Auto-Scaling",
          content: (
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>Fixed fleet of 2 servers, provisioned for average load.</p>
              <div className="grid grid-cols-2 gap-2">
                <MetricCounter label="Normal Load" value={40} unit="% CPU" />
                <MetricCounter label="Black Friday" value={100} unit="% CPU" trend="up" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <MetricCounter label="Monthly Cost" value={140} unit="$" />
                <MetricCounter label="Revenue Lost" value={200} unit="K$" trend="up" />
              </div>
              <p className="text-[11px]">
                Site crashes during peaks, wastes money during valleys. Each incident costs more
                than a year of auto-scaling.
              </p>
            </div>
          ),
        }}
        after={{
          title: "With Auto-Scaling",
          content: (
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>Fleet grows from 2 to 20 servers as demand rises, then shrinks back.</p>
              <div className="grid grid-cols-2 gap-2">
                <MetricCounter label="Normal Load" value={55} unit="% CPU" />
                <MetricCounter label="Black Friday" value={65} unit="% CPU" trend="down" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <MetricCounter label="Avg Monthly Cost" value={210} unit="$" />
                <MetricCounter label="Revenue Lost" value={0} unit="K$" trend="down" />
              </div>
              <p className="text-[11px]">
                Consistent performance at every load level. Pay only for what you use. Zero-downtime
                scaling.
              </p>
            </div>
          ),
        }}
      />

      <ScaleSimulator
        title="Auto-Scale Simulator"
        min={1000}
        max={40000}
        step={500}
        unit="users"
        metrics={(value) => {
          const servers = computeAutoScale(value);
          const cpuPerServer = Math.round((value / servers / 2000) * 100);
          return [
            { label: "Active Servers", value: servers, unit: "nodes" },
            { label: "CPU per Server", value: Math.min(cpuPerServer, 100), unit: "%" },
            { label: "Monthly Cost", value: servers * 70, unit: "$" },
          ];
        }}
      >
        {({ value }) => {
          const servers = computeAutoScale(value);
          return (
            <div className="space-y-3">
              <div className="flex flex-wrap justify-center gap-2">
                {Array.from({ length: servers }).map((_, i) => {
                  const load = (value / servers / 2000) * 100;
                  return (
                    <ServerNode
                      key={i}
                      type="server"
                      label={`S${i + 1}`}
                      sublabel={`~${Math.round(load)}%`}
                      status={load > 90 ? "unhealthy" : load > 75 ? "warning" : "healthy"}
                    />
                  );
                })}
              </div>
              <p className="text-xs text-center text-muted-foreground">
                {value <= 4000
                  ? "Low traffic -- auto-scaler maintains the minimum of 2 servers. Cost: $140/mo."
                  : value <= 20000
                  ? `Moderate traffic -- ${servers} servers keeping CPU around ${Math.round((value / servers / 2000) * 100)}%. Cost: $${servers * 70}/mo.`
                  : `High traffic -- ${servers} servers at max. For predictable spikes this large, combine with scheduled scaling to pre-warm.`}
              </p>
            </div>
          );
        }}
      </ScaleSimulator>

      <InteractiveDemo title="Scaling Decision Simulator">
        {({ isPlaying, tick }) => {
          // Simulate a day's traffic pattern
          const hour = isPlaying ? tick % 24 : 12;
          const trafficPatterns: Record<number, number> = {
            0: 500, 1: 300, 2: 200, 3: 200, 4: 300, 5: 500,
            6: 1000, 7: 2000, 8: 4000, 9: 6000, 10: 8000, 11: 9000,
            12: 10000, 13: 9500, 14: 8000, 15: 7000, 16: 6000, 17: 8000,
            18: 12000, 19: 15000, 20: 10000, 21: 6000, 22: 3000, 23: 1000,
          };
          const users = trafficPatterns[hour];
          const servers = computeAutoScale(users);
          const cpu = Math.round((users / servers / 2000) * 100);

          return (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Press play to simulate a 24-hour traffic cycle. Watch the fleet grow during peak hours
                and shrink overnight.
              </p>
              <div className="flex items-center justify-center gap-6">
                <div className="text-center">
                  <Clock className="size-5 text-muted-foreground mx-auto mb-1" />
                  <span className="text-lg font-mono font-bold">{hour.toString().padStart(2, "0")}:00</span>
                </div>
                <div className="text-center">
                  <Activity className="size-5 text-blue-400 mx-auto mb-1" />
                  <span className="text-lg font-mono font-bold">{users.toLocaleString()}</span>
                  <span className="text-[10px] text-muted-foreground block">users</span>
                </div>
                <div className="text-center">
                  <span className="text-lg font-mono font-bold">{servers}</span>
                  <span className="text-[10px] text-muted-foreground block">servers</span>
                </div>
                <div className="text-center">
                  <span className={cn(
                    "text-lg font-mono font-bold",
                    cpu > 80 ? "text-red-400" : cpu > 60 ? "text-amber-400" : "text-emerald-400"
                  )}>
                    {cpu}%
                  </span>
                  <span className="text-[10px] text-muted-foreground block">avg CPU</span>
                </div>
              </div>

              {/* Mini bar chart of the day */}
              <div className="flex items-end gap-[2px] h-12">
                {Array.from({ length: 24 }).map((_, h) => {
                  const u = trafficPatterns[h];
                  return (
                    <div
                      key={h}
                      className={cn(
                        "flex-1 rounded-t-sm transition-all",
                        h === hour ? "bg-blue-400" : h < hour && isPlaying ? "bg-blue-400/40" : "bg-muted/30"
                      )}
                      style={{ height: `${(u / 15000) * 100}%` }}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between text-[9px] font-mono text-muted-foreground/40 px-0.5">
                <span>00:00</span>
                <span>06:00</span>
                <span>12:00</span>
                <span>18:00</span>
                <span>23:00</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <MetricCounter label="Cost This Hour" value={Math.round(servers * 0.096 * 100) / 100} unit="$" />
                <MetricCounter label="Daily Cost" value={Math.round(servers * 0.096 * 24)} unit="$" />
                <MetricCounter
                  label="vs Fixed 10 Servers"
                  value={Math.round((1 - (servers * 0.096) / (10 * 0.096)) * 100)}
                  unit="% saved"
                  trend="down"
                />
              </div>
            </div>
          );
        }}
      </InteractiveDemo>

      <AhaMoment
        question="Why can't auto-scaling handle truly instant spikes (like a Super Bowl ad)?"
        answer={
          <span>
            Launching a new EC2 instance takes 60-90 seconds: boot the OS (~30s), start the application
            (~30s), pass health checks (~15s), register with the load balancer (~5s). For predictable
            mega-events, use <strong>scheduled scaling</strong> to pre-warm 20+ instances before the spike.
            Reactive auto-scaling is a safety net, not the primary strategy for known events. Netflix
            pre-scales hours before major releases.
          </span>
        }
      />

      <AhaMoment
        question="What metrics should trigger auto-scaling besides CPU?"
        answer={
          <span>
            CPU is the most common, but often not the best. Consider: <strong>ALB Request Count Per Target</strong> (how
            many requests each server handles -- great for web APIs), <strong>SQS Queue Depth</strong> (for
            worker fleets processing background jobs), or <strong>custom CloudWatch metrics</strong> like
            response latency P99. The best metric is the one most directly correlated with user experience.
          </span>
        }
      />

      <ConversationalCallout type="warning">
        Auto-scaling requires <strong>stateless servers</strong>. A new instance must be able to handle
        requests immediately without needing state from other servers. Sessions go in Redis or DynamoDB.
        Files go in S3. Application config goes in Parameter Store or environment variables. If your
        servers are stateful, auto-scaling will cause data loss and inconsistency.
      </ConversationalCallout>

      <ConversationalCallout type="tip">
        In system design interviews, mention three things about auto-scaling: (1) what <strong>metric</strong> triggers
        scaling, (2) what <strong>policy type</strong> you would use (target tracking for most cases), and
        (3) that servers must be <strong>stateless</strong> with externalized state. Bonus: mention
        pre-warming AMIs with your application already installed to reduce warmup time from 90s to 30s.
      </ConversationalCallout>

      <KeyTakeaway
        points={[
          "Auto-scaling automatically adjusts server count based on real-time metrics like CPU, request rate, or queue depth.",
          "Target tracking is the simplest and most recommended policy: set a target CPU% and the auto-scaler handles the rest.",
          "Step scaling provides graduated responses: small spikes add 1 server, large spikes add 5+ at once.",
          "Cooldown periods (default 300s) prevent flapping -- the expensive oscillation of adding and removing servers rapidly.",
          "Instance warmup takes 60-90 seconds (boot → app start → health check → LB registration). For known spikes, use scheduled scaling to pre-warm.",
          "Auto-scaling requires stateless servers with externalized state (sessions in Redis, files in S3, config in Parameter Store).",
        ]}
      />
    </div>
  );
}
