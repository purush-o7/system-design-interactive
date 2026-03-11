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
import { MetricCounter } from "@/components/metric-counter";
import { InteractiveDemo } from "@/components/interactive-demo";
import { ScaleSimulator } from "@/components/scale-simulator";
import { BeforeAfter } from "@/components/before-after";
import { AhaMoment } from "@/components/aha-moment";
import { ConversationalCallout } from "@/components/conversational-callout";
import { cn } from "@/lib/utils";
import { Clock, AlertTriangle, Shield, Database, Server, Activity, CheckCircle2 } from "lucide-react";

function RpoRtoTimelineViz() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % 10), 1200);
    return () => clearInterval(t);
  }, []);

  const timelinePoints = [
    { pos: 5, label: "Last Backup", time: "2:00 AM", type: "backup" },
    { pos: 35, label: "Disaster", time: "3:12 AM", type: "disaster" },
    { pos: 65, label: "Detection", time: "3:18 AM", type: "detect" },
    { pos: 85, label: "Recovered", time: "3:45 AM", type: "recover" },
  ];

  return (
    <div className="space-y-4">
      {/* Timeline bar */}
      <div className="relative h-24 mt-4">
        {/* Base line */}
        <div className="absolute top-12 left-0 right-0 h-0.5 bg-muted/40" />

        {/* RPO span */}
        <div
          className={cn(
            "absolute top-6 h-1.5 rounded-full transition-all duration-700",
            step >= 3 ? "bg-amber-500/40" : "bg-transparent"
          )}
          style={{ left: "5%", width: "30%" }}
        />
        {step >= 3 && (
          <div className="absolute top-1 left-[12%] text-[10px] font-mono text-amber-400 font-bold">
            RPO = 1hr 12min (data lost)
          </div>
        )}

        {/* RTO span */}
        <div
          className={cn(
            "absolute top-16 h-1.5 rounded-full transition-all duration-700",
            step >= 6 ? "bg-blue-500/40" : "bg-transparent"
          )}
          style={{ left: "35%", width: "50%" }}
        />
        {step >= 6 && (
          <div className="absolute top-20 left-[48%] text-[10px] font-mono text-blue-400 font-bold">
            RTO = 33min (downtime)
          </div>
        )}

        {/* Timeline points */}
        {timelinePoints.map((point, i) => {
          const isActive = step >= (i + 1) * 2;
          return (
            <div
              key={point.label}
              className="absolute top-10 flex flex-col items-center"
              style={{ left: `${point.pos}%`, transform: "translateX(-50%)" }}
            >
              <div
                className={cn(
                  "size-5 rounded-full border-2 transition-all duration-500 flex items-center justify-center",
                  point.type === "disaster"
                    ? isActive
                      ? "bg-red-500 border-red-400"
                      : "bg-muted/30 border-border"
                    : point.type === "recover"
                    ? isActive
                      ? "bg-emerald-500 border-emerald-400"
                      : "bg-muted/30 border-border"
                    : isActive
                    ? "bg-blue-500 border-blue-400"
                    : "bg-muted/30 border-border"
                )}
              >
                {point.type === "disaster" && isActive && <AlertTriangle className="size-2.5 text-white" />}
                {point.type === "recover" && isActive && <CheckCircle2 className="size-2.5 text-white" />}
              </div>
              <span
                className={cn(
                  "text-[9px] font-medium mt-1.5 transition-opacity whitespace-nowrap",
                  isActive ? "opacity-100" : "opacity-0"
                )}
              >
                {point.label}
              </span>
              <span
                className={cn(
                  "text-[8px] font-mono text-muted-foreground transition-opacity",
                  isActive ? "opacity-100" : "opacity-0"
                )}
              >
                {point.time}
              </span>
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-muted-foreground/60 text-center">
        {step < 2
          ? "System running normally..."
          : step < 4
          ? "Disaster strikes at 3:12 AM -- primary region goes down"
          : step < 6
          ? "RPO: data written between last backup and disaster is LOST"
          : step < 8
          ? "RTO: total time from disaster to service restoration"
          : "RPO determines data loss. RTO determines downtime. Every DR decision trades cost against these two numbers."}
      </p>
    </div>
  );
}

function MultiRegionFailoverViz() {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setPhase((p) => (p + 1) % 8), 1800);
    return () => clearInterval(t);
  }, []);

  const primaryStatus = phase < 2 ? "healthy" : "unhealthy";
  const secondaryStatus = phase < 4 ? "idle" : "healthy";
  const dnsTarget = phase < 5 ? "us-east-1" : "eu-west-1";

  return (
    <div className="space-y-4">
      {/* DNS layer */}
      <div className="flex items-center justify-center gap-2">
        <span className="text-[10px] font-mono text-muted-foreground">DNS:</span>
        <span className={cn(
          "text-xs font-mono font-bold px-2 py-0.5 rounded transition-all duration-500",
          phase >= 5
            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
            : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
        )}>
          api.myapp.com → {dnsTarget}
        </span>
      </div>

      {/* Regions */}
      <div className="grid grid-cols-2 gap-4">
        {/* Primary */}
        <div className={cn(
          "rounded-lg border p-4 space-y-3 transition-all duration-500",
          phase >= 2 ? "border-red-500/30 bg-red-500/5" : "border-emerald-500/30 bg-emerald-500/5"
        )}>
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold">us-east-1 (Primary)</h4>
            <span className={cn(
              "text-[10px] font-mono px-1.5 py-0.5 rounded",
              phase >= 2 ? "bg-red-500/10 text-red-400" : "bg-emerald-500/10 text-emerald-400"
            )}>
              {phase >= 2 ? "DOWN" : "ACTIVE"}
            </span>
          </div>
          <div className="flex gap-2 justify-center">
            <ServerNode type="server" label="App" status={primaryStatus as "healthy" | "unhealthy"} />
            <ServerNode type="database" label="DB" status={primaryStatus as "healthy" | "unhealthy"} />
            <ServerNode type="cache" label="Cache" status={primaryStatus as "healthy" | "unhealthy"} />
          </div>
          {phase >= 2 && (
            <div className="flex items-center justify-center gap-1 text-[10px] text-red-400">
              <AlertTriangle className="size-3" />
              Region failure detected
            </div>
          )}
        </div>

        {/* Secondary */}
        <div className={cn(
          "rounded-lg border p-4 space-y-3 transition-all duration-500",
          phase >= 4 ? "border-emerald-500/30 bg-emerald-500/5" : "border-border bg-muted/10"
        )}>
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold">eu-west-1 (DR)</h4>
            <span className={cn(
              "text-[10px] font-mono px-1.5 py-0.5 rounded transition-all",
              phase >= 4 ? "bg-emerald-500/10 text-emerald-400" : "bg-muted/30 text-muted-foreground/50"
            )}>
              {phase >= 4 ? "ACTIVE" : phase >= 3 ? "SCALING..." : "STANDBY"}
            </span>
          </div>
          <div className="flex gap-2 justify-center">
            <ServerNode type="server" label="App" status={secondaryStatus as "healthy" | "idle"} />
            <ServerNode type="database" label="DB (replica)" status={phase >= 3 ? "healthy" : "idle"} />
            <ServerNode type="cache" label="Cache" status={secondaryStatus as "healthy" | "idle"} />
          </div>
          {phase >= 4 && phase < 6 && (
            <div className="flex items-center justify-center gap-1 text-[10px] text-emerald-400">
              <Activity className="size-3" />
              Scaling up to full capacity...
            </div>
          )}
          {phase >= 6 && (
            <div className="flex items-center justify-center gap-1 text-[10px] text-emerald-400">
              <CheckCircle2 className="size-3" />
              Serving production traffic
            </div>
          )}
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground/60 text-center">
        {phase === 0
          ? "Normal operation -- primary serving all traffic"
          : phase < 3
          ? "Disaster strikes -- primary region is unreachable"
          : phase < 5
          ? "Failover triggered -- DR region scaling up"
          : phase < 7
          ? "DNS switched -- traffic flowing to DR region"
          : "Failover complete -- service restored in DR region"}
      </p>
    </div>
  );
}

function DrStrategyComparisonViz() {
  const [selected, setSelected] = useState(0);

  const strategies = [
    {
      name: "Backup & Restore",
      cost: 1,
      rpo: "Hours",
      rto: "Hours",
      color: "bg-gray-500",
      description: "Periodic snapshots to another region. On disaster, launch new infrastructure and restore from the latest backup. Cheapest but slowest -- you pay only for backup storage, not running infrastructure.",
      infra: "Backups in S3 cross-region. No running servers in DR region.",
      rpoMs: 86400000,
      rtoMs: 28800000,
    },
    {
      name: "Pilot Light",
      cost: 2,
      rpo: "Minutes",
      rto: "Tens of min",
      color: "bg-amber-500",
      description: "Core database continuously replicated to DR region. Compute infrastructure is pre-configured but stopped. On disaster, start the servers and scale up. The 'pilot light' (DB replica) is always burning.",
      infra: "DB replica running. AMIs ready. Servers off until needed.",
      rpoMs: 600000,
      rtoMs: 1800000,
    },
    {
      name: "Warm Standby",
      cost: 3,
      rpo: "Seconds",
      rto: "Minutes",
      color: "bg-blue-500",
      description: "A scaled-down but fully functional copy of production runs continuously in the DR region. On disaster, scale up to full capacity and switch DNS. Can handle some traffic immediately while scaling.",
      infra: "Full stack running at reduced scale. DB with sync/async replication.",
      rpoMs: 30000,
      rtoMs: 300000,
    },
    {
      name: "Multi-Site Active",
      cost: 4,
      rpo: "Near zero",
      rto: "Seconds",
      color: "bg-emerald-500",
      description: "Full production stack in 2+ regions, actively serving traffic simultaneously. Route53 health checks auto-shift traffic on failure. No manual intervention needed. Most expensive but provides near-zero downtime.",
      infra: "Full stack in every region. Global DB or conflict resolution. Active-active traffic.",
      rpoMs: 1000,
      rtoMs: 10000,
    },
  ];

  const s = strategies[selected];

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {strategies.map((strategy, i) => (
          <button
            key={strategy.name}
            onClick={() => setSelected(i)}
            className={cn(
              "flex-1 rounded-lg border px-2 py-2 text-center transition-all text-[11px] font-medium",
              selected === i
                ? `${strategy.color}/10 border-current/20 ring-1 ring-current/10`
                : "bg-muted/20 border-border/30 text-muted-foreground/60 hover:bg-muted/40"
            )}
          >
            {strategy.name}
          </button>
        ))}
      </div>

      <div className={cn("rounded-lg border p-4 space-y-3 transition-all", `${s.color}/5 border-current/10`)}>
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold">{s.name}</h4>
          <div className="flex gap-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <span
                key={i}
                className={cn(
                  "text-xs",
                  i < s.cost ? "text-amber-400" : "text-muted-foreground/20"
                )}
              >
                $
              </span>
            ))}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">{s.description}</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded bg-muted/20 p-2">
            <div className="text-[10px] text-muted-foreground">RPO (data loss)</div>
            <div className="text-xs font-mono font-bold">{s.rpo}</div>
          </div>
          <div className="rounded bg-muted/20 p-2">
            <div className="text-[10px] text-muted-foreground">RTO (downtime)</div>
            <div className="text-xs font-mono font-bold">{s.rto}</div>
          </div>
        </div>
        <div className="rounded bg-muted/20 p-2">
          <div className="text-[10px] text-muted-foreground mb-1">Infrastructure in DR region</div>
          <div className="text-[11px] text-muted-foreground">{s.infra}</div>
        </div>
      </div>
    </div>
  );
}

function CostVsRecoveryViz() {
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setFrame((f) => (f + 1) % 5), 2000);
    return () => clearInterval(t);
  }, []);

  const tiers = [
    { name: "Backup & Restore", cost: 8, recovery: 95, costLabel: "$100/mo", rtoLabel: "4-24 hrs" },
    { name: "Pilot Light", cost: 22, recovery: 70, costLabel: "$800/mo", rtoLabel: "10-30 min" },
    { name: "Warm Standby", cost: 50, recovery: 25, costLabel: "$3K/mo", rtoLabel: "1-5 min" },
    { name: "Multi-Site", cost: 95, recovery: 3, costLabel: "$10K+/mo", rtoLabel: "<1 min" },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-end gap-2 h-32">
        {tiers.map((tier, i) => (
          <div key={tier.name} className="flex-1 flex flex-col items-center gap-1">
            {/* Cost bar */}
            <div className="w-full flex gap-0.5 justify-center">
              <div
                className={cn(
                  "w-5 rounded-t-sm transition-all duration-700",
                  frame >= i + 1 ? "bg-amber-500/60" : "bg-muted/20"
                )}
                style={{ height: `${tier.cost}%` }}
                title="Cost"
              />
              <div
                className={cn(
                  "w-5 rounded-t-sm transition-all duration-700",
                  frame >= i + 1 ? "bg-blue-500/60" : "bg-muted/20"
                )}
                style={{ height: `${tier.recovery}%` }}
                title="Recovery time"
              />
            </div>
            <div className="text-[8px] font-mono text-muted-foreground text-center leading-tight">
              {tier.name}
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1"><span className="size-2 rounded-sm bg-amber-500/60" /> Cost</span>
        <span className="flex items-center gap-1"><span className="size-2 rounded-sm bg-blue-500/60" /> Recovery Time</span>
      </div>
      <p className="text-[11px] text-muted-foreground/60 text-center">
        As cost increases, recovery time drops dramatically. The tradeoff is not linear -- jumping from
        Backup & Restore to Pilot Light gives the biggest bang for your buck.
      </p>
    </div>
  );
}

export default function DisasterRecoveryPage() {
  return (
    <div className="space-y-8">
      <TopicHero
        title="Disaster Recovery"
        subtitle="It's not paranoia if the entire data center actually does catch fire."
        difficulty="advanced"
      />

      <FailureScenario title="The Scenario">
        <p className="text-sm text-muted-foreground">
          Tuesday, 3:12 AM. AWS us-east-1 goes down. Your application, database, backups, and monitoring
          are all in us-east-1. <strong>Your entire business is offline for 8 hours.</strong> When the
          region comes back, you discover that 2 hours of database writes were lost because the EBS
          snapshots were 6 hours old. Your CEO asks why you didn&apos;t have a plan. You didn&apos;t have
          an answer.
        </p>
        <div className="flex justify-center gap-3 pt-4">
          <ServerNode type="cloud" label="us-east-1" sublabel="DOWN" status="unhealthy" />
          <ServerNode type="server" label="App Servers" sublabel="Unreachable" status="unhealthy" />
          <ServerNode type="database" label="Database" sublabel="2hr data loss" status="unhealthy" />
        </div>
        <div className="grid grid-cols-3 gap-3 pt-3">
          <MetricCounter label="Downtime" value={8} unit="hours" trend="up" />
          <MetricCounter label="Data Lost" value={2} unit="hours" trend="up" />
          <MetricCounter label="Revenue Lost" value={340} unit="K$" trend="up" />
        </div>
      </FailureScenario>

      <WhyItBreaks>
        <p className="text-sm text-muted-foreground">
          Most teams treat &quot;the cloud&quot; as infinitely reliable. It isn&apos;t. AWS, GCP, and Azure
          all have multi-hour regional outages every year. If every component of your system lives in
          one region, a regional failure is a <strong>total failure</strong>. Disaster recovery is about
          planning for scenarios that feel unlikely until they happen -- and they always happen eventually.
        </p>
        <div className="grid grid-cols-2 gap-2 mt-3">
          {[
            { n: "1", label: "Single-Region", desc: "All eggs in one basket" },
            { n: "2", label: "Backups Co-located", desc: "Disaster takes backups too" },
            { n: "3", label: "No Failover Plan", desc: "Manual panic at 3 AM" },
            { n: "4", label: "Untested Recovery", desc: "Doesn't work when you need it" },
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

      <ConceptVisualizer title="RPO and RTO: The Two Numbers That Define Every DR Plan">
        <p className="text-sm text-muted-foreground mb-4">
          Every disaster recovery decision ultimately trades cost against two numbers. RPO determines
          how much data you can afford to lose. RTO determines how long you can be down. These are
          business decisions first, technical decisions second -- your finance team and product team
          must agree on acceptable values before engineering picks a strategy.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 space-y-2">
            <h4 className="text-sm font-semibold text-amber-500 flex items-center gap-1.5">
              <Database className="size-3.5" />
              RPO (Recovery Point Objective)
            </h4>
            <p className="text-xs text-muted-foreground">
              How much data can you afford to lose? An RPO of 1 hour means you accept losing up to
              1 hour of writes. RPO of zero means no data loss is acceptable -- you need synchronous
              replication to a second region, which adds write latency.
            </p>
          </div>
          <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-4 space-y-2">
            <h4 className="text-sm font-semibold text-blue-500 flex items-center gap-1.5">
              <Clock className="size-3.5" />
              RTO (Recovery Time Objective)
            </h4>
            <p className="text-xs text-muted-foreground">
              How long can your system be down? An RTO of 4 hours means you need to be back online
              within 4 hours. RTO approaching zero means automated failover with health checks --
              no human in the loop.
            </p>
          </div>
        </div>
        <RpoRtoTimelineViz />
      </ConceptVisualizer>

      <ConceptVisualizer title="DR Strategy Tiers (AWS Model)">
        <p className="text-sm text-muted-foreground mb-4">
          AWS defines four DR strategy tiers, each trading cost for faster recovery. Click each tier
          to see how it works. Most companies start with Backup & Restore and graduate to higher tiers
          as they grow and their downtime costs increase.
        </p>
        <DrStrategyComparisonViz />
      </ConceptVisualizer>

      <ConceptVisualizer title="Cost vs Recovery Time">
        <p className="text-sm text-muted-foreground mb-4">
          The relationship between what you spend on DR and how fast you recover is not linear. The
          biggest improvement comes from moving off of pure backup-and-restore. After that, each tier
          gives diminishing returns at significantly higher cost. Choose the tier where your cost of
          downtime exceeds the cost of the DR infrastructure.
        </p>
        <CostVsRecoveryViz />
      </ConceptVisualizer>

      <CorrectApproach title="DR Strategy Details">
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 pr-3 font-semibold">Strategy</th>
                  <th className="text-left py-2 pr-3 font-semibold">RPO</th>
                  <th className="text-left py-2 pr-3 font-semibold">RTO</th>
                  <th className="text-left py-2 pr-3 font-semibold">Cost</th>
                  <th className="text-left py-2 font-semibold">How It Works</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b">
                  <td className="py-2 pr-3 font-medium text-foreground">Backup & Restore</td>
                  <td className="py-2 pr-3">Hours</td>
                  <td className="py-2 pr-3">Hours</td>
                  <td className="py-2 pr-3">$</td>
                  <td className="py-2">Periodic backups (S3 cross-region replication). Restore manually by launching new infra + restoring data.</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 pr-3 font-medium text-foreground">Pilot Light</td>
                  <td className="py-2 pr-3">Minutes</td>
                  <td className="py-2 pr-3">Tens of min</td>
                  <td className="py-2 pr-3">$$</td>
                  <td className="py-2">Core DB replicated continuously (RDS read replica). AMIs pre-built. Start compute on failover.</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 pr-3 font-medium text-foreground">Warm Standby</td>
                  <td className="py-2 pr-3">Seconds</td>
                  <td className="py-2 pr-3">Minutes</td>
                  <td className="py-2 pr-3">$$$</td>
                  <td className="py-2">Scaled-down full stack running. Scale up + switch Route53 DNS. Can take traffic immediately at reduced capacity.</td>
                </tr>
                <tr>
                  <td className="py-2 pr-3 font-medium text-foreground">Multi-Site Active</td>
                  <td className="py-2 pr-3">Near zero</td>
                  <td className="py-2 pr-3">Seconds</td>
                  <td className="py-2 pr-3">$$$$</td>
                  <td className="py-2">Full stack in 2+ regions, both serving traffic. Route53 health checks auto-shift. DynamoDB Global Tables or Aurora Global DB.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </CorrectApproach>

      <ConceptVisualizer title="Multi-Region Failover in Action">
        <p className="text-sm text-muted-foreground mb-4">
          Watch a warm standby failover unfold. When the primary region fails, monitoring detects the
          outage, the DR region scales up, and DNS switches to route traffic to the healthy region.
          The entire process takes minutes instead of hours.
        </p>
        <MultiRegionFailoverViz />
      </ConceptVisualizer>

      <AnimatedFlow
        steps={[
          { id: "disaster", label: "Disaster Strikes", description: "Primary region becomes unavailable", icon: <AlertTriangle className="size-4" /> },
          { id: "detect", label: "Detection", description: "Health checks fail (30-60 seconds)", icon: <Activity className="size-4" /> },
          { id: "decide", label: "Failover Decision", description: "Automated or manual trigger" },
          { id: "activate", label: "Activate DR Site", description: "Scale up standby infrastructure", icon: <Server className="size-4" /> },
          { id: "dns", label: "DNS Switchover", description: "Route53 points to DR region" },
          { id: "verify", label: "Verify & Monitor", description: "Confirm service is operational", icon: <Shield className="size-4" /> },
        ]}
        interval={2200}
      />

      <BeforeAfter
        before={{
          title: "Single Region",
          content: (
            <div className="space-y-3">
              <div className="flex justify-center gap-2">
                <ServerNode type="cloud" label="us-east-1" sublabel="Everything here" status="unhealthy" />
              </div>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>- Region outage = total outage</li>
                <li>- Backups in same region could be lost</li>
                <li>- Recovery takes hours of manual work</li>
                <li>- Data loss depends on last backup (6hr old?)</li>
                <li>- No way to test recovery without downtime</li>
              </ul>
            </div>
          ),
        }}
        after={{
          title: "Multi-Region DR",
          content: (
            <div className="space-y-3">
              <div className="flex justify-center gap-2">
                <ServerNode type="cloud" label="us-east-1" sublabel="Primary" status="healthy" />
                <ServerNode type="cloud" label="eu-west-1" sublabel="Standby" status="idle" />
              </div>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>+ Region outage triggers automated failover</li>
                <li>+ Backups stored in separate region</li>
                <li>+ Recovery in minutes, not hours</li>
                <li>+ Data loss measured in seconds (async replication)</li>
                <li>+ Regular failover drills validate the plan</li>
              </ul>
            </div>
          ),
        }}
      />

      <InteractiveDemo title="Failover Timeline Simulator">
        {({ isPlaying, tick }) => {
          const stages = [
            { name: "Outage begins", time: "T+0:00", desc: "Primary region goes down", status: "red" },
            { name: "Detection", time: "T+0:30", desc: "CloudWatch alarm fires, PagerDuty alerts", status: "amber" },
            { name: "Failover triggered", time: "T+1:00", desc: "Automated or manual decision", status: "amber" },
            { name: "DB promoted", time: "T+3:00", desc: "Read replica promoted to primary", status: "blue" },
            { name: "Compute scaled", time: "T+5:00", desc: "ASG scales up in DR region", status: "blue" },
            { name: "DNS switched", time: "T+6:00", desc: "Route53 failover record activates", status: "blue" },
            { name: "Traffic flowing", time: "T+8:00", desc: "Users hitting DR region", status: "emerald" },
            { name: "Verified", time: "T+10:00", desc: "Health checks green, metrics normal", status: "emerald" },
          ];
          const active = isPlaying ? Math.min(tick % 10, stages.length) : 0;

          return (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Press play to simulate a warm standby failover. Each step shows elapsed time from
                the initial outage.
              </p>
              <div className="space-y-1.5">
                {stages.map((stage, i) => {
                  const colors: Record<string, string> = {
                    red: "border-red-500/20 bg-red-500/8",
                    amber: "border-amber-500/20 bg-amber-500/8",
                    blue: "border-blue-500/20 bg-blue-500/8",
                    emerald: "border-emerald-500/20 bg-emerald-500/8",
                  };
                  const textColors: Record<string, string> = {
                    red: "text-red-400",
                    amber: "text-amber-400",
                    blue: "text-blue-400",
                    emerald: "text-emerald-400",
                  };
                  return (
                    <div
                      key={stage.name}
                      className={cn(
                        "flex items-center gap-3 rounded-lg border px-3 py-2 transition-all duration-400",
                        i < active ? colors[stage.status] : "bg-muted/10 border-border/30 text-muted-foreground/40"
                      )}
                    >
                      <span className={cn(
                        "text-[10px] font-mono font-bold w-14",
                        i < active ? textColors[stage.status] : ""
                      )}>
                        {stage.time}
                      </span>
                      <span className={cn(
                        "text-xs font-medium w-32",
                        i < active ? "text-foreground" : ""
                      )}>
                        {stage.name}
                      </span>
                      <span className="text-[11px] text-muted-foreground flex-1">
                        {i < active ? stage.desc : "--"}
                      </span>
                    </div>
                  );
                })}
              </div>
              {active >= stages.length && (
                <ConversationalCallout type="tip">
                  Total failover: 10 minutes. Compare that to the 8 hours it took when you had
                  no DR plan. That&apos;s the difference between a minor incident and a front-page
                  outage. The key? Everything was pre-provisioned and the runbook was automated.
                </ConversationalCallout>
              )}
            </div>
          );
        }}
      </InteractiveDemo>

      <ScaleSimulator
        title="Downtime Cost Calculator"
        min={1000}
        max={10000000}
        step={100000}
        unit="$/hour revenue"
        metrics={(revenue) => [
          { label: "8hr outage (no DR)", value: Math.round(revenue * 8), unit: "$" },
          { label: "30min outage (pilot light)", value: Math.round(revenue * 0.5), unit: "$" },
          { label: "5min outage (warm standby)", value: Math.round(revenue * 0.083), unit: "$" },
          { label: "Warm standby cost/mo", value: Math.round(revenue * 0.02 * 730), unit: "$" },
          { label: "ROI of DR", value: Math.round((revenue * 8 - revenue * 0.02 * 730) / (revenue * 0.02 * 730) * 100), unit: "%" },
          { label: "Break-even outages/yr", value: Math.max(1, Math.round(revenue * 0.02 * 730 / (revenue * 7.5))), unit: "" },
        ]}
      >
        {({ value }) => (
          <p className="text-xs text-muted-foreground text-center pt-2">
            At ${value.toLocaleString()}/hour revenue, a single 8-hour outage costs $
            {(value * 8).toLocaleString()}. Warm standby DR infrastructure pays for itself after
            just one avoided outage.
          </p>
        )}
      </ScaleSimulator>

      <AhaMoment
        question="Why doesn't everyone just run active-active multi-region?"
        answer={
          <p>
            Cost and complexity. Multi-region active-active means paying for full infrastructure in
            2+ regions, solving cross-region database replication with conflict resolution for
            concurrent writes, handling 60-100ms added latency between regions, and testing failover
            regularly. For most companies, warm standby with async replication hits the sweet spot.
            Netflix and Google need active-active. Your B2B SaaS probably doesn&apos;t -- yet.
          </p>
        }
      />

      <AhaMoment
        question="What's the hardest part of multi-region DR?"
        answer={
          <p>
            The database. Stateless services (web servers, API servers) are easy to replicate -- just
            launch more instances. But databases hold state that must be consistent. Synchronous
            replication across regions adds latency to every write. Asynchronous replication risks
            data loss during failover. Conflict resolution for active-active writes is genuinely hard.
            This is why DynamoDB Global Tables, CockroachDB, and Spanner exist -- they solve
            distributed consensus at the database level.
          </p>
        }
      />

      <ConversationalCallout type="warning">
        A DR plan that hasn&apos;t been tested is not a DR plan -- it&apos;s a hope. Netflix runs
        Chaos Monkey continuously. AWS recommends quarterly failover drills. The number one reason
        DR fails in real disasters: nobody ever tested it. Expired certificates, outdated AMIs,
        missing IAM permissions -- these only surface during an actual failover.
      </ConversationalCallout>

      <ConversationalCallout type="tip">
        In interviews, always ask about RPO and RTO requirements before proposing a DR architecture.
        A social media app might tolerate 1 hour of data loss and 30 minutes of downtime ($$ tier).
        A financial trading platform cannot lose a single transaction and needs sub-second failover
        ($$$$ tier). The requirements completely change the architecture and cost.
      </ConversationalCallout>

      <ConversationalCallout type="question">
        How do you handle the &quot;failback&quot; -- returning to the primary region after it
        recovers? This is often harder than the failover itself. You need to re-sync data that was
        written to the DR region back to the primary, verify consistency, and switch DNS again.
        Many teams skip planning for failback and end up running in their DR region permanently,
        which defeats the purpose of having a &quot;primary.&quot;
      </ConversationalCallout>

      <KeyTakeaway
        points={[
          "RPO (how much data you can lose) and RTO (how long you can be down) define every DR strategy. They are business decisions, not just technical ones.",
          "Four AWS DR tiers: Backup & Restore ($, hours) -> Pilot Light ($$, minutes) -> Warm Standby ($$$, seconds) -> Multi-Site Active ($$$$, near-zero).",
          "Store backups in a different region than your primary. A disaster that takes out your app will take out co-located backups too.",
          "The database is the hardest part of multi-region DR. Stateless services scale easily; stateful data requires replication, consistency, and conflict resolution.",
          "Test your DR plan regularly with failover drills. An untested plan will fail when you need it most -- expired certs, outdated AMIs, missing permissions.",
          "Calculate the cost of downtime vs. the cost of DR infrastructure. For most companies, warm standby pays for itself after a single avoided outage.",
        ]}
      />
    </div>
  );
}
