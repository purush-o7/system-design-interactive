"use client";

import { useState, useEffect } from "react";
import { TopicHero } from "@/components/topic-hero";
import { FailureScenario } from "@/components/failure-scenario";
import { WhyItBreaks } from "@/components/why-it-breaks";
import { ConceptVisualizer } from "@/components/concept-visualizer";
import { CorrectApproach } from "@/components/correct-approach";
import { KeyTakeaway } from "@/components/key-takeaway";
import { BeforeAfter } from "@/components/before-after";
import { ScaleSimulator } from "@/components/scale-simulator";
import { ServerNode } from "@/components/server-node";
import { MetricCounter } from "@/components/metric-counter";
import { InteractiveDemo } from "@/components/interactive-demo";
import { AhaMoment } from "@/components/aha-moment";
import { ConversationalCallout } from "@/components/conversational-callout";
import { cn } from "@/lib/utils";
import { ArrowUp, ArrowRight, Server, DollarSign, Cpu, MemoryStick, HardDrive } from "lucide-react";

/* ── Vertical Growth Animation ── */
function VerticalGrowthViz() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % 5), 1800);
    return () => clearInterval(t);
  }, []);

  const tiers = [
    { label: "t3.medium", cores: 2, ram: 4, cost: 30, height: "h-16" },
    { label: "m6i.large", cores: 2, ram: 8, cost: 70, height: "h-24" },
    { label: "m6i.xlarge", cores: 4, ram: 16, cost: 140, height: "h-32" },
    { label: "m6i.4xlarge", cores: 16, ram: 64, cost: 560, height: "h-44" },
    { label: "m6i.24xlarge", cores: 96, ram: 384, cost: 3360, height: "h-56" },
  ];

  const current = tiers[step];

  return (
    <div className="flex items-end gap-6">
      {/* The growing server */}
      <div className="flex-1 flex flex-col items-center gap-2">
        <div className="text-[10px] font-mono text-muted-foreground/60">
          {step < 4 ? "Upgrading..." : "Max available!"}
        </div>
        <div
          className={cn(
            "w-full max-w-[120px] rounded-xl border-2 flex flex-col items-center justify-end pb-2 transition-all duration-700",
            step < 4
              ? "border-blue-500/30 bg-blue-500/5"
              : "border-red-500/30 bg-red-500/5",
            current.height
          )}
        >
          <Server
            className={cn(
              "size-6 transition-colors",
              step < 4 ? "text-blue-400" : "text-red-400"
            )}
          />
          <span className="text-[11px] font-mono font-bold mt-1">{current.label}</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <ArrowUp className="size-3 text-blue-400" />
          Scale Up
        </div>
      </div>

      {/* Specs panel */}
      <div className="flex-1 space-y-1.5">
        {[
          { icon: <Cpu className="size-3" />, label: "vCPUs", value: current.cores },
          { icon: <MemoryStick className="size-3" />, label: "RAM", value: `${current.ram} GB` },
          { icon: <DollarSign className="size-3" />, label: "Cost/mo", value: `$${current.cost}` },
        ].map((spec) => (
          <div
            key={spec.label}
            className="flex items-center gap-2 rounded-md bg-muted/30 px-2.5 py-1.5 border border-border/50"
          >
            <span className="text-muted-foreground">{spec.icon}</span>
            <span className="text-[10px] text-muted-foreground w-12">{spec.label}</span>
            <span className="text-xs font-mono font-semibold ml-auto">{spec.value}</span>
          </div>
        ))}
        <p className="text-[10px] text-muted-foreground/60 text-right pt-0.5">
          {step === 0
            ? "Starting small..."
            : step < 4
            ? `${Math.round(tiers[step].cost / tiers[0].cost)}x the cost of step 1`
            : "112x cost, 48x CPU -- diminishing returns"}
        </p>
      </div>
    </div>
  );
}

/* ── Horizontal Multiplication Animation ── */
function HorizontalGrowthViz() {
  const [count, setCount] = useState(1);
  useEffect(() => {
    const t = setInterval(() => setCount((c) => (c % 8) + 1), 1200);
    return () => clearInterval(t);
  }, []);

  const costPerNode = 70; // m6i.large

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1 justify-center text-[10px] text-muted-foreground mb-1">
        <ArrowRight className="size-3 text-emerald-400" />
        Scale Out — each node: m6i.large ($70/mo)
      </div>
      <div className="flex flex-wrap justify-center gap-2 min-h-[80px] items-center">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "flex flex-col items-center gap-1 rounded-lg border px-3 py-2 transition-all duration-300",
              i === count - 1
                ? "bg-emerald-500/10 border-emerald-500/30 scale-105"
                : "bg-blue-500/5 border-blue-500/20"
            )}
          >
            <Server className="size-4 text-blue-400" />
            <span className="text-[10px] font-mono">S{i + 1}</span>
          </div>
        ))}
      </div>
      <div className="flex justify-between text-[10px] font-mono px-2">
        <span className="text-muted-foreground">
          Nodes: <span className="text-foreground font-bold">{count}</span>
        </span>
        <span className="text-muted-foreground">
          Total vCPUs: <span className="text-foreground font-bold">{count * 2}</span>
        </span>
        <span className="text-muted-foreground">
          Cost: <span className="text-emerald-400 font-bold">${count * costPerNode}/mo</span>
        </span>
      </div>
      <p className="text-[10px] text-muted-foreground/60 text-center">
        Linear cost growth. Remove a node anytime to save money.
      </p>
    </div>
  );
}

/* ── Cost Curve Visualization ── */
function CostCurveViz() {
  const [hovered, setHovered] = useState<number | null>(null);

  // Real-ish AWS pricing: vertical costs grow super-linearly, horizontal is linear
  const dataPoints = [
    { users: 1000, vertical: 30, horizontal: 70 },
    { users: 5000, vertical: 140, horizontal: 140 },
    { users: 10000, vertical: 560, horizontal: 280 },
    { users: 25000, vertical: 1680, horizontal: 560 },
    { users: 50000, vertical: 3360, horizontal: 1050 },
    { users: 100000, vertical: 6720, horizontal: 2100 },
  ];

  const maxCost = 6720;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4 text-[10px] justify-center">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-red-400 rounded-full" /> Vertical (bigger server)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-emerald-400 rounded-full" /> Horizontal (more servers)
        </span>
      </div>
      <div className="flex items-end gap-1 h-40 px-2">
        {dataPoints.map((dp, i) => (
          <div
            key={dp.users}
            className="flex-1 flex items-end gap-0.5 cursor-pointer group"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            <div
              className={cn(
                "flex-1 rounded-t-sm transition-all duration-300",
                hovered === i ? "bg-red-400" : "bg-red-400/60"
              )}
              style={{ height: `${(dp.vertical / maxCost) * 100}%` }}
            />
            <div
              className={cn(
                "flex-1 rounded-t-sm transition-all duration-300",
                hovered === i ? "bg-emerald-400" : "bg-emerald-400/60"
              )}
              style={{ height: `${(dp.horizontal / maxCost) * 100}%` }}
            />
          </div>
        ))}
      </div>
      <div className="flex gap-1 px-2">
        {dataPoints.map((dp, i) => (
          <div key={dp.users} className="flex-1 text-center">
            <span className="text-[9px] font-mono text-muted-foreground/50">
              {dp.users >= 1000 ? `${dp.users / 1000}k` : dp.users}
            </span>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-muted-foreground/60 text-center">Users (concurrent)</p>
      {hovered !== null && (
        <div className="flex justify-center gap-6 text-[11px] font-mono">
          <span className="text-red-400">
            Vertical: ${dataPoints[hovered].vertical}/mo
          </span>
          <span className="text-emerald-400">
            Horizontal: ${dataPoints[hovered].horizontal}/mo
          </span>
          <span className="text-muted-foreground">
            {dataPoints[hovered].users.toLocaleString()} users
          </span>
        </div>
      )}
    </div>
  );
}

/* ── AWS Instance Pricing Table ── */
function InstancePricingTable() {
  const instances = [
    { name: "t3.micro", vcpus: 2, ram: 1, hourly: 0.0104, monthly: 7.59, burst: true },
    { name: "t3.medium", vcpus: 2, ram: 4, hourly: 0.0416, monthly: 30.37, burst: true },
    { name: "m6i.large", vcpus: 2, ram: 8, hourly: 0.096, monthly: 70.08, burst: false },
    { name: "m6i.xlarge", vcpus: 4, ram: 16, hourly: 0.192, monthly: 140.16, burst: false },
    { name: "m6i.4xlarge", vcpus: 16, ram: 64, hourly: 0.768, monthly: 560.64, burst: false },
    { name: "m6i.12xlarge", vcpus: 48, ram: 192, hourly: 2.304, monthly: 1681.92, burst: false },
    { name: "m6i.24xlarge", vcpus: 96, ram: 384, hourly: 4.608, monthly: 3363.84, burst: false },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[11px]">
        <thead>
          <tr className="text-muted-foreground/60 border-b border-border/50">
            <th className="text-left py-1.5 font-medium">Instance</th>
            <th className="text-right py-1.5 font-medium">vCPUs</th>
            <th className="text-right py-1.5 font-medium">RAM</th>
            <th className="text-right py-1.5 font-medium">$/hour</th>
            <th className="text-right py-1.5 font-medium">$/month</th>
            <th className="text-right py-1.5 font-medium">$/vCPU</th>
          </tr>
        </thead>
        <tbody>
          {instances.map((inst, i) => (
            <tr
              key={inst.name}
              className={cn(
                "border-b border-border/30 transition-colors",
                i === instances.length - 1
                  ? "bg-red-500/5 text-red-300"
                  : "hover:bg-muted/20"
              )}
            >
              <td className="py-1.5 font-mono font-medium">{inst.name}</td>
              <td className="text-right py-1.5 font-mono">{inst.vcpus}</td>
              <td className="text-right py-1.5 font-mono">{inst.ram} GB</td>
              <td className="text-right py-1.5 font-mono">${inst.hourly.toFixed(4)}</td>
              <td className="text-right py-1.5 font-mono">${Math.round(inst.monthly)}</td>
              <td className="text-right py-1.5 font-mono text-muted-foreground">
                ${(inst.monthly / inst.vcpus).toFixed(0)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-[10px] text-muted-foreground/50 mt-2">
        AWS EC2 on-demand pricing, us-east-1, Linux. Cost per vCPU stays roughly constant within a family,
        but the largest instances available still have hard limits.
      </p>
    </div>
  );
}

export default function VerticalVsHorizontalPage() {
  return (
    <div className="space-y-8">
      <TopicHero
        title="Vertical vs Horizontal Scaling"
        subtitle="Why upgrading your server only delays the inevitable -- and what to do instead. Understanding these two strategies is the first step in every scaling conversation."
        difficulty="beginner"
      />

      <FailureScenario title="You upgraded to the biggest server money can buy -- and it still crashed">
        <p className="text-sm text-muted-foreground">
          Your startup just launched. One server runs everything -- the app, the database, file storage.
          At 1,000 users things feel snappy. You upgrade from a <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">t3.medium</code> to
          an <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">m6i.4xlarge</code> and buy yourself a few more months. But at
          <strong className="text-red-400"> 50,000 concurrent users</strong>, even the biggest instance on AWS --
          96 vCPUs, 384 GB RAM, costing $3,360/month -- is not enough. Your database locks up, response times hit
          30 seconds, and your site goes down during your biggest marketing push.
        </p>
        <div className="flex justify-center gap-6 pt-3">
          <div className="text-center">
            <ServerNode type="server" label="m6i.24xlarge" sublabel="CPU 100% / RAM 91%" status="unhealthy" />
            <p className="text-[10px] text-muted-foreground mt-1">$3,360/mo — still not enough</p>
          </div>
        </div>
      </FailureScenario>

      <WhyItBreaks title="Every machine has a ceiling -- and the ceiling costs exponentially more to raise">
        <p className="text-sm text-muted-foreground">
          Every physical machine has hard limits -- a finite number of CPU cores, a maximum amount of RAM,
          and I/O throughput that cannot exceed the bus speed. AWS&apos;s largest general-purpose instance
          (m6i.metal) tops out at 128 vCPUs and 512 GB of RAM. No amount of money can buy you a 1,000-core
          server -- it does not exist.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Worse, doubling your CPU cores does not double throughput. <strong>Amdahl&apos;s Law</strong> tells us
          that serial portions of your application become the bottleneck -- if 10% of your code is serial, you can
          never get more than a 10x speedup no matter how many cores you throw at it.
        </p>
        <div className="grid grid-cols-2 gap-2 mt-3">
          {[
            { n: "1", label: "Hardware Ceiling", desc: "Largest instances top out at ~128 vCPUs" },
            { n: "2", label: "Exponential Cost", desc: "8x CPU costs roughly 8x more money" },
            { n: "3", label: "Single Point of Failure", desc: "One server dies = total outage" },
            { n: "4", label: "Downtime to Upgrade", desc: "Resizing requires stopping the instance" },
          ].map((item) => (
            <div key={item.n} className="flex items-start gap-2.5 rounded-lg bg-muted/30 p-3">
              <span className="text-xs font-mono font-bold text-orange-400 bg-orange-500/10 rounded-md size-6 flex items-center justify-center shrink-0">
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

      <ConceptVisualizer title="Visualizing the Two Strategies">
        <p className="text-sm text-muted-foreground mb-4">
          There are exactly two directions to scale: <strong>up</strong> (vertical -- bigger machine) or
          <strong> out</strong> (horizontal -- more machines). Watch both strategies in action:
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-lg border border-border/50 p-4">
            <h4 className="text-xs font-semibold text-blue-400 mb-3 flex items-center gap-1.5">
              <ArrowUp className="size-3" /> Vertical: Server Grows Bigger
            </h4>
            <VerticalGrowthViz />
          </div>
          <div className="rounded-lg border border-border/50 p-4">
            <h4 className="text-xs font-semibold text-emerald-400 mb-3 flex items-center gap-1.5">
              <ArrowRight className="size-3" /> Horizontal: Servers Multiply
            </h4>
            <HorizontalGrowthViz />
          </div>
        </div>
      </ConceptVisualizer>

      <ConceptVisualizer title="Real AWS EC2 Pricing -- The Numbers Don't Lie">
        <p className="text-sm text-muted-foreground mb-4">
          Here is actual AWS EC2 on-demand pricing for us-east-1. Notice how the cost per vCPU stays
          roughly constant within a family -- but you simply cannot buy more than 96-128 vCPUs on a single instance.
          The ceiling is real.
        </p>
        <InstancePricingTable />
      </ConceptVisualizer>

      <ConceptVisualizer title="Cost Curves: Vertical vs Horizontal">
        <p className="text-sm text-muted-foreground mb-4">
          Hover over the bars to compare costs at each scale point. Vertical scaling costs grow
          super-linearly because you must jump to premium instance tiers. Horizontal scaling grows
          linearly -- each new $70/mo node adds the same capacity.
        </p>
        <CostCurveViz />
      </ConceptVisualizer>

      <BeforeAfter
        before={{
          title: "Vertical Scaling (Scale Up)",
          content: (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Replace your server with a bigger one. More CPU cores, more RAM, faster disks.
              </p>
              <div className="flex justify-center">
                <ServerNode type="server" label="Mega Server" sublabel="96 cores / 384 GB" status="warning" />
              </div>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-400 shrink-0">+</span>
                  Simple -- zero code changes, zero architecture changes
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-400 shrink-0">+</span>
                  Single point of management (one server to monitor)
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-400 shrink-0">+</span>
                  No distributed systems complexity (ACID transactions just work)
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-red-400 shrink-0">-</span>
                  Hardware ceiling (max ~128 vCPUs, ~4 TB RAM on AWS)
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-red-400 shrink-0">-</span>
                  Single point of failure -- one crash = total outage
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-red-400 shrink-0">-</span>
                  Requires downtime to resize (stop instance, change type, restart)
                </li>
              </ul>
            </div>
          ),
        }}
        after={{
          title: "Horizontal Scaling (Scale Out)",
          content: (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Add more servers of the same size and distribute the load across them.
              </p>
              <div className="flex justify-center gap-2">
                <ServerNode type="server" label="S1" sublabel="2 vCPU" status="healthy" />
                <ServerNode type="server" label="S2" sublabel="2 vCPU" status="healthy" />
                <ServerNode type="server" label="S3" sublabel="2 vCPU" status="healthy" />
              </div>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-400 shrink-0">+</span>
                  Near-infinite scaling -- just keep adding nodes
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-400 shrink-0">+</span>
                  Built-in fault tolerance -- one server dies, others keep serving
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-400 shrink-0">+</span>
                  Linear cost growth and zero-downtime scaling
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-red-400 shrink-0">-</span>
                  Requires stateless application design
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-red-400 shrink-0">-</span>
                  Needs a load balancer to distribute requests
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-red-400 shrink-0">-</span>
                  More operational complexity (deployment, monitoring, networking)
                </li>
              </ul>
            </div>
          ),
        }}
      />

      <InteractiveDemo title="Interactive Cost Calculator">
        {({ isPlaying, tick }) => {
          const steps = [1000, 5000, 10000, 25000, 50000, 75000, 100000];
          const activeIdx = isPlaying ? tick % steps.length : 0;
          const users = steps[activeIdx];

          // Vertical: m6i pricing tiers
          const verticalCost =
            users <= 1000 ? 30 :
            users <= 5000 ? 140 :
            users <= 10000 ? 560 :
            users <= 25000 ? 1682 :
            users <= 50000 ? 3364 :
            users <= 75000 ? 6720 :
            6720; // can't go higher!

          const verticalMaxed = users > 50000;

          // Horizontal: ~5000 users per m6i.large ($70/mo each)
          const nodes = Math.ceil(users / 5000);
          const horizontalCost = nodes * 70;

          return (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Press play to cycle through traffic levels and compare costs in real-time.
              </p>
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-xs text-muted-foreground">Traffic:</span>
                <span className="text-lg font-mono font-bold">{users.toLocaleString()}</span>
                <span className="text-xs text-muted-foreground">concurrent users</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className={cn(
                  "rounded-lg border p-3 space-y-2",
                  verticalMaxed ? "border-red-500/30 bg-red-500/5" : "border-blue-500/20 bg-blue-500/5"
                )}>
                  <div className="text-[11px] font-semibold text-blue-400">Vertical</div>
                  <div className="text-xl font-mono font-bold">
                    ${verticalCost.toLocaleString()}
                    <span className="text-[10px] font-normal text-muted-foreground">/mo</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground">1 large server</div>
                  {verticalMaxed && (
                    <div className="text-[10px] text-red-400 font-medium">
                      Hardware limit reached -- cannot scale further!
                    </div>
                  )}
                </div>
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 space-y-2">
                  <div className="text-[11px] font-semibold text-emerald-400">Horizontal</div>
                  <div className="text-xl font-mono font-bold">
                    ${horizontalCost.toLocaleString()}
                    <span className="text-[10px] font-normal text-muted-foreground">/mo</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground">{nodes} x m6i.large nodes</div>
                  <div className="text-[10px] text-emerald-400 font-medium">
                    {verticalMaxed
                      ? `Saving $${(verticalCost - horizontalCost).toLocaleString()}/mo`
                      : users > 5000
                      ? `${Math.round((1 - horizontalCost / verticalCost) * 100)}% cheaper`
                      : "Higher base cost at low scale"}
                  </div>
                </div>
              </div>
            </div>
          );
        }}
      </InteractiveDemo>

      <ScaleSimulator
        title="Scale It Yourself"
        min={1000}
        max={100000}
        step={1000}
        unit="users"
        metrics={(value) => {
          const verticalCost = Math.round(30 * Math.pow(value / 1000, 1.6));
          const nodes = Math.ceil(value / 5000);
          const horizontalCost = nodes * 70;
          return [
            { label: "Vertical Cost", value: Math.min(verticalCost, 6720), unit: "$/mo" },
            { label: "Horizontal Cost", value: horizontalCost, unit: "$/mo" },
            { label: "Nodes (Horizontal)", value: nodes, unit: "servers" },
          ];
        }}
      >
        {({ value }) => {
          const nodes = Math.ceil(value / 5000);
          const verticalCost = Math.min(Math.round(30 * Math.pow(value / 1000, 1.6)), 6720);
          const horizontalCost = nodes * 70;
          const savings = verticalCost - horizontalCost;
          return (
            <div className="space-y-3">
              <div className="flex flex-wrap justify-center gap-2">
                {Array.from({ length: Math.min(nodes, 16) }).map((_, i) => (
                  <ServerNode
                    key={i}
                    type="server"
                    label={`S${i + 1}`}
                    status={value / nodes > 4500 ? "warning" : "healthy"}
                  />
                ))}
                {nodes > 16 && (
                  <span className="text-xs text-muted-foreground self-center">+{nodes - 16} more</span>
                )}
              </div>
              <p className="text-xs text-center text-muted-foreground">
                {value.toLocaleString()} users: horizontal uses {nodes} nodes at ${horizontalCost}/mo.
                {savings > 0
                  ? ` Saves $${savings.toLocaleString()}/mo vs vertical.`
                  : " Vertical is cheaper at this scale -- start there!"}
              </p>
            </div>
          );
        }}
      </ScaleSimulator>

      <CorrectApproach title="The Real Answer: Use Both">
        <p className="text-sm text-muted-foreground mb-3">
          This is not an either/or decision. Every production system at scale uses a hybrid approach.
          The art is knowing when to switch gears.
        </p>
        <div className="grid gap-2">
          {[
            {
              phase: "0-10K users",
              strategy: "Vertical first",
              detail: "Start with one moderately-sized server. Simpler ops, faster iteration. Upgrade instance type as you grow.",
              color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
            },
            {
              phase: "10K-100K users",
              strategy: "Horizontal for app servers",
              detail: "Add a load balancer, run 3-10 stateless app servers. Keep the database vertical (larger RDS instance).",
              color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
            },
            {
              phase: "100K+ users",
              strategy: "Horizontal everything",
              detail: "Shard the database, add read replicas, use a CDN for static assets, auto-scale the fleet. This is where system design gets interesting.",
              color: "text-violet-400 bg-violet-500/10 border-violet-500/20",
            },
          ].map((item) => (
            <div
              key={item.phase}
              className={cn("rounded-lg border p-3 flex items-start gap-3", item.color)}
            >
              <span className="text-[11px] font-mono font-bold shrink-0 w-20">{item.phase}</span>
              <div>
                <p className="text-xs font-semibold">{item.strategy}</p>
                <p className="text-[11px] text-muted-foreground">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </CorrectApproach>

      <AhaMoment
        question="Why do databases often scale vertically while web servers scale horizontally?"
        answer="Web servers are typically stateless -- any server can handle any request, so adding more is trivial. Databases hold state that must stay consistent across every read and write. Splitting data across machines (sharding) introduces enormous complexity: cross-shard joins, distributed transactions, rebalancing. That's why most teams scale the database vertically as long as possible, then introduce read replicas before resorting to full sharding."
      />

      <ConversationalCallout type="tip">
        In interviews, always mention that horizontal scaling requires a <strong>load balancer</strong> in
        front of your servers and that your application must be <strong>stateless</strong> -- no local sessions,
        no files on disk, no in-process caches that other instances cannot access. Sessions go in Redis.
        Files go in S3. These prerequisites are what interviewers are listening for.
      </ConversationalCallout>

      <ConversationalCallout type="warning">
        Do not dismiss vertical scaling as &quot;bad.&quot; Many successful companies run on a single
        powerful database server well past $10M ARR. Stack Overflow famously served millions of users from
        a handful of vertically-scaled SQL Server machines. Premature horizontal scaling adds complexity
        you may not need yet.
      </ConversationalCallout>

      <KeyTakeaway
        points={[
          "Vertical scaling (bigger server) is simpler but has hard hardware limits -- the largest AWS instances top out at ~128 vCPUs / 512 GB RAM.",
          "Horizontal scaling (more servers) offers near-infinite capacity but requires stateless design, load balancing, and externalized state.",
          "Cost grows linearly with horizontal scaling but super-linearly with vertical -- at 100K users the difference can be 3-5x.",
          "Most production systems use both: vertically scaled databases with horizontally scaled stateless app servers.",
          "Horizontal scaling provides fault tolerance for free -- if one server dies, others keep serving traffic without interruption.",
          "The need for horizontal scaling drives the most important system design decisions: load balancing, session management, shared storage, and database replication.",
        ]}
      />
    </div>
  );
}
