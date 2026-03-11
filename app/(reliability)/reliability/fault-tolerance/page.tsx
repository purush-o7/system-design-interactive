"use client";

import { useState, useEffect } from "react";
import { TopicHero } from "@/components/topic-hero";
import { FailureScenario } from "@/components/failure-scenario";
import { WhyItBreaks } from "@/components/why-it-breaks";
import { ConceptVisualizer } from "@/components/concept-visualizer";
import { CorrectApproach } from "@/components/correct-approach";
import { KeyTakeaway } from "@/components/key-takeaway";
import { BeforeAfter } from "@/components/before-after";
import { AnimatedFlow } from "@/components/animated-flow";
import { ServerNode } from "@/components/server-node";
import { InteractiveDemo } from "@/components/interactive-demo";
import { AhaMoment } from "@/components/aha-moment";
import { ConversationalCallout } from "@/components/conversational-callout";
import { MetricCounter } from "@/components/metric-counter";
import { cn } from "@/lib/utils";
import { Shield, Zap, Server, AlertTriangle, CheckCircle2, XCircle, ArrowRight } from "lucide-react";

function FailoverAnimation() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % 8), 1500);
    return () => clearInterval(t);
  }, []);

  const primaryDead = step >= 2;
  const failoverStarted = step >= 3;
  const standbyPromoted = step >= 4;
  const trafficRerouted = step >= 5;
  const oldPrimaryRecovering = step >= 6;
  const oldPrimaryRejoined = step >= 7;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <div className="text-center space-y-1.5">
          <div className={cn(
            "size-14 rounded-xl border-2 flex items-center justify-center transition-all duration-500",
            primaryDead && !oldPrimaryRejoined
              ? "bg-red-500/10 border-red-500/40 animate-pulse"
              : oldPrimaryRejoined
              ? "bg-blue-500/10 border-blue-500/30"
              : "bg-emerald-500/10 border-emerald-500/30"
          )}>
            <Server className={cn(
              "size-6 transition-colors",
              primaryDead && !oldPrimaryRejoined ? "text-red-400" : oldPrimaryRejoined ? "text-blue-400" : "text-emerald-400"
            )} />
          </div>
          <p className="text-[11px] font-medium">
            {oldPrimaryRejoined ? "Standby" : "Primary"}
          </p>
          <p className={cn(
            "text-[10px] transition-colors",
            primaryDead && !oldPrimaryRecovering ? "text-red-400" : oldPrimaryRecovering && !oldPrimaryRejoined ? "text-yellow-400" : oldPrimaryRejoined ? "text-blue-400" : "text-emerald-400"
          )}>
            {primaryDead && !oldPrimaryRecovering ? "CRASHED" : oldPrimaryRecovering && !oldPrimaryRejoined ? "Restarting..." : oldPrimaryRejoined ? "Idle, ready" : "Serving traffic"}
          </p>
        </div>

        <div className="flex-1 px-4 space-y-1">
          {step >= 1 && step < 3 && (
            <div className="flex items-center gap-1 text-[10px] text-amber-400 justify-center animate-pulse">
              <AlertTriangle className="size-3" />
              Health check failing...
            </div>
          )}
          {failoverStarted && !trafficRerouted && (
            <div className="flex items-center gap-1 text-[10px] text-blue-400 justify-center">
              <ArrowRight className="size-3" />
              Failover in progress...
            </div>
          )}
          {trafficRerouted && (
            <div className="flex items-center gap-1 text-[10px] text-emerald-400 justify-center">
              <CheckCircle2 className="size-3" />
              Traffic rerouted
            </div>
          )}
          <div className={cn(
            "h-[2px] rounded-full transition-all duration-500",
            trafficRerouted ? "bg-emerald-500/40" : primaryDead ? "bg-red-500/30" : "bg-muted-foreground/20"
          )} />
        </div>

        <div className="text-center space-y-1.5">
          <div className={cn(
            "size-14 rounded-xl border-2 flex items-center justify-center transition-all duration-500",
            standbyPromoted
              ? "bg-emerald-500/10 border-emerald-500/30"
              : "bg-muted/30 border-border"
          )}>
            <Server className={cn(
              "size-6 transition-colors",
              standbyPromoted ? "text-emerald-400" : "text-muted-foreground/40"
            )} />
          </div>
          <p className="text-[11px] font-medium">
            {standbyPromoted ? "New Primary" : "Standby"}
          </p>
          <p className={cn(
            "text-[10px] transition-colors",
            standbyPromoted ? "text-emerald-400" : "text-muted-foreground/50"
          )}>
            {standbyPromoted ? "Serving traffic" : "Idle, syncing"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 px-2">
        <div className={cn(
          "flex-1 h-1.5 rounded-full transition-all duration-500",
          step === 0 ? "bg-emerald-500/30" : step < 3 ? "bg-amber-500/30" : step < 5 ? "bg-blue-500/30" : "bg-emerald-500/30"
        )} />
        <span className="text-[10px] font-mono text-muted-foreground/60">
          {step === 0 ? "Normal operation" : step < 3 ? "Failure detected" : step < 5 ? "Failover..." : step < 7 ? "Service restored" : "Fully recovered"}
        </span>
      </div>
    </div>
  );
}

function ActiveActiveAnimation() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % 6), 1800);
    return () => clearInterval(t);
  }, []);

  const nodes = [
    { label: "Server A", load: step >= 2 && step < 5 ? 0 : 33 },
    { label: "Server B", load: step >= 2 && step < 5 ? 50 : 33 },
    { label: "Server C", load: step >= 2 && step < 5 ? 50 : 33 },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-center gap-3">
        {nodes.map((node, i) => {
          const isDead = i === 0 && step >= 2 && step < 5;
          const isOverloaded = i > 0 && step >= 2 && step < 5;
          return (
            <div key={node.label} className="text-center space-y-1.5">
              <div className={cn(
                "size-12 rounded-xl border flex items-center justify-center transition-all duration-500",
                isDead
                  ? "bg-red-500/10 border-red-500/30"
                  : isOverloaded
                  ? "bg-amber-500/10 border-amber-500/30"
                  : "bg-emerald-500/10 border-emerald-500/30"
              )}>
                <Server className={cn(
                  "size-5 transition-colors",
                  isDead ? "text-red-400" : isOverloaded ? "text-amber-400" : "text-emerald-400"
                )} />
              </div>
              <p className="text-[10px] font-medium">{node.label}</p>
              <div className="w-12 h-1.5 rounded-full bg-muted/30 overflow-hidden mx-auto">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-700",
                    isDead ? "bg-red-500/50" : isOverloaded ? "bg-amber-500" : "bg-emerald-500"
                  )}
                  style={{ width: `${isDead ? 0 : node.load}%` }}
                />
              </div>
              <p className="text-[9px] text-muted-foreground font-mono">
                {isDead ? "DOWN" : `${node.load}%`}
              </p>
            </div>
          );
        })}
      </div>
      <p className="text-[11px] text-muted-foreground/60 text-center">
        {step < 2 ? "All nodes serving traffic equally" : step < 5 ? "Server A fails — B and C absorb its load automatically" : "Server A recovers and rejoins the pool"}
      </p>
    </div>
  );
}

function BlastRadiusViz() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % 6), 2000);
    return () => clearInterval(t);
  }, []);

  const zones = [
    {
      name: "Checkout",
      services: ["Payment", "Cart", "Orders"],
      affected: step >= 1 && step < 4,
      critical: true,
    },
    {
      name: "Catalog",
      services: ["Search", "Products", "Reviews"],
      affected: step >= 2 && step < 3,
      critical: false,
    },
    {
      name: "User",
      services: ["Auth", "Profile", "Notifications"],
      affected: false,
      critical: false,
    },
  ];

  const withBulkheads = step >= 3;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <span className={cn(
          "text-[10px] font-mono px-2 py-0.5 rounded-full border transition-all",
          withBulkheads
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
            : "bg-red-500/10 border-red-500/30 text-red-400"
        )}>
          {withBulkheads ? "WITH BULKHEADS" : "WITHOUT BULKHEADS"}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {zones.map((zone) => {
          const isContained = withBulkheads && zone.name === "Checkout" && step >= 3 && step < 5;
          const isSpreading = !withBulkheads && zone.affected;
          return (
            <div
              key={zone.name}
              className={cn(
                "rounded-lg border p-3 transition-all duration-500",
                isSpreading
                  ? "border-red-500/40 bg-red-500/10"
                  : isContained
                  ? "border-amber-500/30 bg-amber-500/5"
                  : "border-border/50 bg-muted/10"
              )}
            >
              <p className={cn(
                "text-[11px] font-semibold mb-2 transition-colors",
                isSpreading ? "text-red-400" : isContained ? "text-amber-400" : "text-foreground"
              )}>
                {zone.name}
              </p>
              {zone.services.map((svc) => (
                <div key={svc} className="flex items-center gap-1.5 mb-1">
                  <div className={cn(
                    "size-1.5 rounded-full transition-colors",
                    isSpreading ? "bg-red-500" : isContained && zone.name === "Checkout" ? "bg-amber-500" : "bg-emerald-500"
                  )} />
                  <span className="text-[10px] text-muted-foreground">{svc}</span>
                </div>
              ))}
            </div>
          );
        })}
      </div>
      <p className="text-[11px] text-muted-foreground/60">
        {step < 1
          ? "Normal operation — all services healthy"
          : step < 3
          ? "Payment service fails. Without bulkheads, the failure cascades to Catalog zone..."
          : step < 5
          ? "With bulkheads: failure contained to Checkout zone. Catalog and User zones unaffected."
          : "Failure resolved — all zones restored"}
      </p>
    </div>
  );
}

function ChaosMonkeyViz() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((s) => (s + 1) % 12), 1000);
    return () => clearInterval(t);
  }, []);

  const servers = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    label: `svc-${String(i + 1).padStart(2, "0")}`,
  }));

  const killedIndex = tick >= 3 && tick < 9 ? Math.floor(tick / 3) % 8 : -1;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-2">
        {servers.map((srv) => {
          const isKilled = srv.id === killedIndex;
          const wasKilled = tick >= 9 && srv.id === Math.floor(6 / 3) % 8;
          return (
            <div
              key={srv.id}
              className={cn(
                "flex items-center gap-2 rounded-md border px-2.5 py-1.5 transition-all duration-300",
                isKilled
                  ? "bg-red-500/10 border-red-500/30"
                  : wasKilled
                  ? "bg-emerald-500/10 border-emerald-500/20"
                  : "bg-muted/20 border-border/40"
              )}
            >
              <div className={cn(
                "size-1.5 rounded-full transition-colors",
                isKilled ? "bg-red-500 animate-pulse" : "bg-emerald-500"
              )} />
              <span className={cn(
                "text-[10px] font-mono transition-colors",
                isKilled ? "text-red-400" : "text-muted-foreground"
              )}>
                {srv.label}
              </span>
              {isKilled && (
                <XCircle className="size-3 text-red-400 ml-auto" />
              )}
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-mono text-muted-foreground/50">chaos-monkey:</span>
        <span className={cn(
          "text-[10px] font-mono",
          killedIndex >= 0 ? "text-red-400" : "text-emerald-400"
        )}>
          {killedIndex >= 0
            ? `Terminated svc-${String(killedIndex + 1).padStart(2, "0")} — testing resilience...`
            : tick >= 9
            ? "All instances recovered. System resilient."
            : "Scanning for targets..."}
        </span>
      </div>
    </div>
  );
}

export default function FaultTolerancePage() {
  return (
    <div className="space-y-8">
      <TopicHero
        title="Fault Tolerance"
        subtitle="Your server will crash. Your database will corrupt. Your network will split. The only question is whether your users notice."
        difficulty="intermediate"
      />

      <FailureScenario title="Black Friday goes dark">
        <p className="text-sm text-muted-foreground">
          Black Friday. Your e-commerce site is handling 10x normal traffic. At 2:47 PM, the single
          application server runs out of memory and crashes. <strong className="text-red-400">Your entire store goes offline.</strong>{" "}
          10,000 customers see a blank page. You lose $40,000 in revenue per minute while your
          on-call engineer frantically SSHs into the box to restart the process. By the time it&apos;s back,
          customers have moved to competitors. The damage isn&apos;t just the lost sales — it&apos;s the
          trust you&apos;ll never recover.
        </p>
        <div className="flex justify-center gap-3 pt-4">
          <ServerNode type="client" label="Customers" sublabel="10,000 active" status="healthy" />
          <span className="text-red-500 text-lg font-mono self-center">---✕---</span>
          <ServerNode type="server" label="App Server" sublabel="OOM KILLED" status="unhealthy" />
          <ServerNode type="database" label="Database" sublabel="Healthy" status="healthy" />
        </div>
      </FailureScenario>

      <WhyItBreaks title="Single points of failure are ticking time bombs">
        <p className="text-sm text-muted-foreground">
          A single server is a <strong>single point of failure</strong> (SPOF). No matter how powerful
          the machine is, it will eventually fail. Hardware degrades (the annualized failure rate for
          hard drives is 2-9%). Software has bugs. Networks partition. Power grids go down.
          Fault tolerance means designing your system so that when (not if) a component fails,
          the system continues operating — possibly at reduced capacity, but never at zero.
        </p>
        <div className="grid grid-cols-2 gap-2 mt-3">
          {[
            { n: "1", label: "Hardware Failure", desc: "Disk, RAM, CPU, NIC — everything degrades" },
            { n: "2", label: "Software Bugs", desc: "Memory leaks, deadlocks, unhandled exceptions" },
            { n: "3", label: "Network Partitions", desc: "Links between nodes drop packets or die" },
            { n: "4", label: "Human Error", desc: "Bad deploys, config changes, accidental deletes" },
          ].map((item) => (
            <div key={item.n} className="flex items-start gap-2.5 rounded-lg bg-muted/30 p-3">
              <span className="text-xs font-mono font-bold text-red-400 bg-red-500/10 rounded-md size-6 flex items-center justify-center shrink-0">
                {item.n}
              </span>
              <div>
                <p className="text-xs font-semibold">{item.label}</p>
                <p className="text-[11px] text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </WhyItBreaks>

      <ConceptVisualizer title="Active-Passive Failover">
        <p className="text-sm text-muted-foreground mb-4">
          The simplest redundancy pattern: one server handles all traffic while a standby replica
          stays synchronized and ready to take over. When the primary fails, the standby is promoted
          automatically. Typical failover time: 15-60 seconds depending on health check intervals.
        </p>
        <FailoverAnimation />
        <ConversationalCallout type="tip">
          Active-passive is the go-to pattern for stateful services like databases. PostgreSQL streaming
          replication, MySQL Group Replication, and Redis Sentinel all use this pattern. The standby
          continuously replays the primary&apos;s write-ahead log so it&apos;s always nearly up-to-date.
        </ConversationalCallout>
      </ConceptVisualizer>

      <ConceptVisualizer title="Active-Active — All Nodes Serve Traffic">
        <p className="text-sm text-muted-foreground mb-4">
          Every node handles requests simultaneously. A load balancer distributes traffic across all nodes.
          When one dies, the others absorb its share. No idle resources, no wasted capacity — but you need
          stateless services or a conflict resolution strategy for writes.
        </p>
        <ActiveActiveAnimation />
        <AhaMoment
          question="Active-passive wastes a server sitting idle. Why not always use active-active?"
          answer={
            <p>
              Active-active is harder to implement correctly for stateful services. When two database nodes
              accept writes simultaneously, you need conflict resolution — what happens when User A updates
              a row on Node 1 while User B updates the same row on Node 2? You get a &quot;split-brain&quot;
              conflict. Use active-active for <em>stateless</em> services (web servers, API gateways) and
              active-passive for <em>stateful</em> ones (primary databases, coordination services like ZooKeeper).
            </p>
          }
        />
      </ConceptVisualizer>

      <ConceptVisualizer title="Blast Radius Containment with Bulkheads">
        <p className="text-sm text-muted-foreground mb-4">
          Named after the watertight compartments in ship hulls, the <strong>bulkhead pattern</strong> isolates
          failures so they can&apos;t spread. Each subsystem gets its own thread pool, connection pool, or even
          separate service. If the payment service exhausts its connections, the catalog service is unaffected
          because it uses a completely separate pool.
        </p>
        <BlastRadiusViz />
      </ConceptVisualizer>

      <ConceptVisualizer title="Chaos Engineering — Netflix's Chaos Monkey">
        <p className="text-sm text-muted-foreground mb-4">
          Netflix pioneered chaos engineering with Chaos Monkey, a tool that randomly terminates production
          instances during business hours. The philosophy: <em>&quot;The best way to avoid failure is to
          fail constantly.&quot;</em> If your system can&apos;t survive a random instance dying, you find out
          at 2 PM on a Tuesday — not 2 AM during a real outage.
        </p>
        <ChaosMonkeyViz />
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { name: "Chaos Monkey", desc: "Kills random instances in production to verify redundancy" },
            { name: "Chaos Gorilla", desc: "Simulates entire AWS Availability Zone failures" },
            { name: "ChAP", desc: "Chaos Automation Platform — runs targeted experiments with blast radius controls" },
          ].map((tool) => (
            <div key={tool.name} className="rounded-lg border border-border/50 bg-muted/10 p-3">
              <p className="text-xs font-semibold mb-1">{tool.name}</p>
              <p className="text-[11px] text-muted-foreground">{tool.desc}</p>
            </div>
          ))}
        </div>
        <ConversationalCallout type="question">
          Chaos engineering isn&apos;t just about killing servers. It&apos;s about forming a hypothesis
          (&quot;our system will continue serving requests if we lose one node&quot;), running the
          experiment, and verifying the hypothesis. If it fails, you&apos;ve found a vulnerability
          before your users did.
        </ConversationalCallout>
      </ConceptVisualizer>

      <CorrectApproach title="Graceful Degradation — Bend, Don't Break">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Fault tolerance isn&apos;t just about keeping the lights on — it&apos;s about deciding what to
            sacrifice when things go wrong. A well-designed system degrades gracefully instead of
            collapsing entirely.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-lg border bg-muted/10 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Shield className="size-4 text-blue-400" />
                <h4 className="text-xs font-semibold">Shed non-critical features</h4>
              </div>
              <p className="text-[11px] text-muted-foreground">
                If the recommendation engine is down, show bestsellers instead. If real-time inventory
                is unavailable, show &quot;usually in stock&quot; and handle oversells later.
              </p>
            </div>
            <div className="rounded-lg border bg-muted/10 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Zap className="size-4 text-amber-400" />
                <h4 className="text-xs font-semibold">Timeouts and fallbacks</h4>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Every network call should have a timeout and a fallback response. A 2-second timeout
                returning cached data beats a 30-second hang returning nothing.
              </p>
            </div>
            <div className="rounded-lg border bg-muted/10 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Server className="size-4 text-emerald-400" />
                <h4 className="text-xs font-semibold">Bulkhead isolation</h4>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Separate critical paths (checkout) from non-critical ones (reviews). Use different
                thread pools so a failure in one can&apos;t starve resources from another.
              </p>
            </div>
          </div>
        </div>
      </CorrectApproach>

      <AnimatedFlow
        steps={[
          { id: "detect", label: "Detect Failure", description: "Health check fails for primary node", icon: <AlertTriangle className="size-4" /> },
          { id: "route", label: "Reroute Traffic", description: "Load balancer marks node unhealthy", icon: <ArrowRight className="size-4" /> },
          { id: "promote", label: "Promote Standby", description: "Standby becomes the new primary", icon: <Server className="size-4" /> },
          { id: "recover", label: "Recover", description: "Old primary restarts, rejoins as standby", icon: <CheckCircle2 className="size-4" /> },
        ]}
        interval={2000}
      />

      <InteractiveDemo title="Fault Tolerance Impact Calculator">
        {({ isPlaying, tick }) => {
          const scenarios = [
            { name: "No redundancy", servers: 1, failoverTime: "15 min", availability: "99.0%", costPerHour: 100, annualDowntime: "87.6 hrs" },
            { name: "Active-passive", servers: 2, failoverTime: "30 sec", availability: "99.95%", costPerHour: 200, annualDowntime: "4.4 hrs" },
            { name: "Active-active (2)", servers: 2, failoverTime: "~0 sec", availability: "99.99%", costPerHour: 200, annualDowntime: "52.6 min" },
            { name: "Active-active (3)", servers: 3, failoverTime: "~0 sec", availability: "99.999%", costPerHour: 300, annualDowntime: "5.3 min" },
          ];
          const active = isPlaying ? Math.min(tick % 5, scenarios.length) : 0;

          return (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Press play to compare fault tolerance strategies. Each additional layer of redundancy
                trades cost for uptime.
              </p>
              <div className="space-y-1.5">
                {scenarios.map((s, i) => (
                  <div
                    key={s.name}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-all duration-400",
                      i < active
                        ? "bg-emerald-500/8 border-emerald-500/20"
                        : i === active && isPlaying
                        ? "bg-blue-500/8 border-blue-500/20 ring-1 ring-blue-500/15"
                        : "bg-muted/10 border-border/30 text-muted-foreground/40"
                    )}
                  >
                    <span className={cn(
                      "text-xs font-medium w-32",
                      i < active ? "text-emerald-400" : i === active && isPlaying ? "text-blue-400" : ""
                    )}>
                      {s.name}
                    </span>
                    <div className="flex-1 grid grid-cols-3 gap-2 text-[10px] font-mono">
                      <span className={cn(i <= active && isPlaying ? "text-muted-foreground" : "text-transparent")}>
                        Failover: {s.failoverTime}
                      </span>
                      <span className={cn(i <= active && isPlaying ? "text-muted-foreground" : "text-transparent")}>
                        SLA: {s.availability}
                      </span>
                      <span className={cn(i <= active && isPlaying ? "text-muted-foreground" : "text-transparent")}>
                        Downtime/yr: {s.annualDowntime}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              {active >= scenarios.length && (
                <ConversationalCallout type="tip">
                  Going from 99.9% to 99.99% availability means reducing annual downtime from 8.8 hours
                  to 52 minutes. But each additional &quot;nine&quot; costs exponentially more in infrastructure
                  and engineering complexity.
                </ConversationalCallout>
              )}
            </div>
          );
        }}
      </InteractiveDemo>

      <BeforeAfter
        before={{
          title: "No Redundancy",
          content: (
            <div className="space-y-3">
              <div className="flex justify-center">
                <ServerNode type="server" label="Solo Server" sublabel="SPOF" status="unhealthy" />
              </div>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>- Server crash = total outage</li>
                <li>- Manual restart takes 5-15 minutes</li>
                <li>- 87.6 hours downtime per year (99% SLA)</li>
                <li>- Zero capacity during failure</li>
                <li>- Cascading failures destroy everything</li>
              </ul>
            </div>
          ),
        }}
        after={{
          title: "With Fault Tolerance",
          content: (
            <div className="space-y-3">
              <div className="flex justify-center gap-2">
                <ServerNode type="loadbalancer" label="LB" status="healthy" />
                <ServerNode type="server" label="S1" status="healthy" />
                <ServerNode type="server" label="S2" status="healthy" />
              </div>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>+ One server crash = no user impact</li>
                <li>+ Automatic failover in seconds</li>
                <li>+ 4.4 hours downtime per year (99.95% SLA)</li>
                <li>+ Remaining servers absorb load</li>
                <li>+ Bulkheads contain blast radius</li>
              </ul>
            </div>
          ),
        }}
      />

      <ConversationalCallout type="warning">
        Redundancy has a cost: more servers, more complexity, more synchronization overhead. Don&apos;t
        over-engineer. A side project doesn&apos;t need multi-region failover. Match your fault tolerance
        to your actual availability requirements (SLA). A 99.9% SLA (8.8 hours downtime/year) is
        perfectly fine for most applications.
      </ConversationalCallout>

      <ConversationalCallout type="tip">
        In interviews, always identify SPOFs. Walk through every component — server, database, load
        balancer, DNS, network link — and ask &quot;what happens if this dies?&quot; If the answer is
        &quot;the system goes down,&quot; you need redundancy there. Then discuss the tradeoff between
        active-passive (simpler, good for stateful services) and active-active (better utilization,
        good for stateless services).
      </ConversationalCallout>

      <KeyTakeaway
        points={[
          "Fault tolerance means your system keeps working when individual components fail — the goal is zero user-visible impact.",
          "Active-passive failover is simpler and avoids split-brain conflicts; active-active provides better resource utilization for stateless services.",
          "The bulkhead pattern isolates failures into compartments so a crash in one subsystem can't cascade to the entire application.",
          "Chaos engineering (Netflix's Chaos Monkey) proactively tests resilience by randomly killing production instances during business hours.",
          "Graceful degradation preserves core functionality by shedding non-critical features — show bestsellers when recommendations are down.",
          "Every single point of failure in your architecture is a ticking time bomb — identify and eliminate them systematically.",
        ]}
      />
    </div>
  );
}
