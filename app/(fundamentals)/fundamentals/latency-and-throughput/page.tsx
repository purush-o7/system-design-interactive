"use client";

import { useState, useEffect } from "react";
import { TopicHero } from "@/components/topic-hero";
import { FailureScenario } from "@/components/failure-scenario";
import { WhyItBreaks } from "@/components/why-it-breaks";
import { ConceptVisualizer } from "@/components/concept-visualizer";
import { CorrectApproach } from "@/components/correct-approach";
import { KeyTakeaway } from "@/components/key-takeaway";
import { ScaleSimulator } from "@/components/scale-simulator";
import { MetricCounter } from "@/components/metric-counter";
import { InteractiveDemo } from "@/components/interactive-demo";
import { ConversationalCallout } from "@/components/conversational-callout";
import { AhaMoment } from "@/components/aha-moment";
import { BeforeAfter } from "@/components/before-after";
import { ServerNode } from "@/components/server-node";
import { cn } from "@/lib/utils";
import { Clock, Gauge, Layers, Zap, BarChart3 } from "lucide-react";

function LatencyHierarchy() {
  const [highlight, setHighlight] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setHighlight((h) => (h + 1) % 10), 1800);
    return () => clearInterval(t);
  }, []);

  const levels = [
    { label: "L1 Cache Reference", time: "1 ns", ns: 1, color: "emerald", bar: 1 },
    { label: "Branch Mispredict", time: "3 ns", ns: 3, color: "emerald", bar: 2 },
    { label: "L2 Cache Reference", time: "4 ns", ns: 4, color: "emerald", bar: 2 },
    { label: "Mutex Lock/Unlock", time: "17 ns", ns: 17, color: "green", bar: 4 },
    { label: "Main Memory Reference", time: "100 ns", ns: 100, color: "blue", bar: 8 },
    { label: "Compress 1KB (Snappy)", time: "2,000 ns", ns: 2000, color: "blue", bar: 15 },
    { label: "SSD Random Read", time: "16,000 ns", ns: 16000, color: "yellow", bar: 25 },
    { label: "Read 1 MB from Memory", time: "250,000 ns", ns: 250000, color: "yellow", bar: 38 },
    { label: "Same Datacenter Round Trip", time: "500,000 ns", ns: 500000, color: "orange", bar: 50 },
    { label: "Read 1 MB from SSD", time: "1,000,000 ns", ns: 1000000, color: "orange", bar: 60 },
  ];

  const colorMap: Record<string, { bg: string; border: string; text: string; barBg: string }> = {
    emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-400", barBg: "bg-emerald-500" },
    green: { bg: "bg-green-500/10", border: "border-green-500/20", text: "text-green-400", barBg: "bg-green-500" },
    blue: { bg: "bg-blue-500/10", border: "border-blue-500/20", text: "text-blue-400", barBg: "bg-blue-500" },
    yellow: { bg: "bg-yellow-500/10", border: "border-yellow-500/20", text: "text-yellow-400", barBg: "bg-yellow-500" },
    orange: { bg: "bg-orange-500/10", border: "border-orange-500/20", text: "text-orange-400", barBg: "bg-orange-500" },
  };

  return (
    <div className="space-y-1">
      {levels.map((level, i) => {
        const c = colorMap[level.color];
        const isActive = i === highlight;
        return (
          <div
            key={level.label}
            className={cn(
              "flex items-center gap-2 rounded-md px-2 py-1.5 transition-all duration-300 cursor-default",
              isActive ? `${c.bg} border ${c.border}` : "border border-transparent"
            )}
            onMouseEnter={() => setHighlight(i)}
          >
            <span className="text-[10px] font-mono text-muted-foreground/40 w-4 text-right shrink-0">{i + 1}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "h-4 rounded-sm transition-all duration-500",
                    isActive ? c.barBg : "bg-muted/40"
                  )}
                  style={{ width: `${level.bar}%`, minWidth: "4px" }}
                />
                <span className={cn(
                  "text-[11px] font-medium truncate transition-colors",
                  isActive ? c.text : "text-muted-foreground/70"
                )}>
                  {level.label}
                </span>
              </div>
            </div>
            <span className={cn(
              "text-[10px] font-mono shrink-0 w-20 text-right transition-colors",
              isActive ? c.text : "text-muted-foreground/40"
            )}>
              {level.time}
            </span>
          </div>
        );
      })}
      <div className="pt-2 px-2">
        <p className="text-[10px] text-muted-foreground/50">
          Source: Jeff Dean / Peter Norvig &mdash; &quot;Numbers Every Programmer Should Know&quot;. Approximate values for modern hardware.
        </p>
      </div>
    </div>
  );
}

function NetworkLatencyMap() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setActive((a) => (a + 1) % 5), 2200);
    return () => clearInterval(t);
  }, []);

  const routes = [
    { from: "Same rack", to: "Server", time: "0.5 ms", color: "emerald" },
    { from: "Same datacenter", to: "Other zone", time: "1-2 ms", color: "green" },
    { from: "US East", to: "US West", time: "40 ms", color: "yellow" },
    { from: "US East", to: "Europe", time: "80 ms", color: "orange" },
    { from: "US East", to: "Australia", time: "180 ms", color: "red" },
  ];

  const colorMap: Record<string, { bg: string; border: string; text: string; line: string }> = {
    emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-400", line: "bg-emerald-500" },
    green: { bg: "bg-green-500/10", border: "border-green-500/30", text: "text-green-400", line: "bg-green-500" },
    yellow: { bg: "bg-yellow-500/10", border: "border-yellow-500/30", text: "text-yellow-400", line: "bg-yellow-500" },
    orange: { bg: "bg-orange-500/10", border: "border-orange-500/30", text: "text-orange-400", line: "bg-orange-500" },
    red: { bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-400", line: "bg-red-500" },
  };

  return (
    <div className="space-y-2">
      {routes.map((route, i) => {
        const c = colorMap[route.color];
        const isActive = i === active;
        return (
          <div
            key={route.from + route.to}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-300 border cursor-default",
              isActive ? `${c.bg} ${c.border}` : "bg-muted/10 border-border/20"
            )}
            onClick={() => setActive(i)}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className={cn("text-xs font-medium w-24 shrink-0", isActive ? c.text : "text-muted-foreground/60")}>{route.from}</span>
              <div className="flex-1 flex items-center gap-1">
                <div className={cn("h-0.5 flex-1 rounded-full transition-all", isActive ? c.line : "bg-muted/30")} />
                <span className="text-muted-foreground/40 text-xs">{">"}</span>
              </div>
              <span className={cn("text-xs font-medium w-20 shrink-0 text-right", isActive ? c.text : "text-muted-foreground/60")}>{route.to}</span>
            </div>
            <span className={cn(
              "font-mono text-xs font-bold w-16 text-right shrink-0 transition-colors",
              isActive ? c.text : "text-muted-foreground/30"
            )}>
              {route.time}
            </span>
          </div>
        );
      })}
      <p className="text-[10px] text-muted-foreground/50 px-3 pt-1">
        Round-trip times. Light in fiber travels at ~200,000 km/s, about 2/3 the speed of light in vacuum.
        Physics sets the floor — no optimization can beat the speed of light.
      </p>
    </div>
  );
}

function PercentileDistribution() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((t) => (t + 1) % 60), 200);
    return () => clearInterval(t);
  }, []);

  const generateLatency = (i: number) => {
    const base = 20;
    const hash = Math.sin(i * 9301 + tick * 0.1) * 10000;
    const r = hash - Math.floor(hash);
    if (r > 0.99) return base + 400 + r * 200;
    if (r > 0.95) return base + 80 + r * 120;
    if (r > 0.5) return base + 10 + r * 30;
    return base + r * 15;
  };

  const samples = Array.from({ length: 200 }, (_, i) => generateLatency(i));
  const sorted = [...samples].sort((a, b) => a - b);
  const p50 = sorted[Math.ceil(sorted.length * 0.5) - 1];
  const p95 = sorted[Math.ceil(sorted.length * 0.95) - 1];
  const p99 = sorted[Math.ceil(sorted.length * 0.99) - 1];
  const avg = samples.reduce((a, b) => a + b, 0) / samples.length;
  const maxVal = Math.max(...samples);

  const buckets = Array.from({ length: 20 }, (_, i) => {
    const lo = i * 30;
    const hi = (i + 1) * 30;
    return samples.filter((s) => s >= lo && s < hi).length;
  });
  const maxBucket = Math.max(...buckets, 1);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: "Average", value: avg, color: "text-muted-foreground" },
          { label: "P50", value: p50, color: "text-blue-400" },
          { label: "P95", value: p95, color: "text-yellow-400" },
          { label: "P99", value: p99, color: "text-red-400" },
        ].map((m) => (
          <div key={m.label} className="rounded-lg bg-muted/30 p-2 text-center">
            <p className="text-[10px] text-muted-foreground/60 uppercase">{m.label}</p>
            <p className={cn("text-sm font-mono font-bold", m.color)}>{Math.round(m.value)}ms</p>
          </div>
        ))}
      </div>

      <div className="relative h-28 flex items-end gap-px px-1">
        {buckets.map((count, i) => {
          const lo = i * 30;
          const isP50Zone = lo <= p50 && lo + 30 > p50;
          const isP95Zone = lo <= p95 && lo + 30 > p95;
          const isP99Zone = lo <= p99 && lo + 30 > p99;
          return (
            <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
              <div
                className={cn(
                  "w-full rounded-t-sm transition-all duration-300",
                  isP99Zone ? "bg-red-500/60" :
                  isP95Zone ? "bg-yellow-500/60" :
                  isP50Zone ? "bg-blue-500/60" :
                  count > 0 ? "bg-muted-foreground/20" : "bg-transparent"
                )}
                style={{ height: `${(count / maxBucket) * 100}%`, minHeight: count > 0 ? "2px" : "0" }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between px-1">
        <span className="text-[9px] font-mono text-muted-foreground/40">0ms</span>
        <span className="text-[9px] font-mono text-muted-foreground/40">300ms</span>
        <span className="text-[9px] font-mono text-muted-foreground/40">600ms</span>
      </div>

      <div className="flex items-center gap-4 justify-center">
        <div className="flex items-center gap-1.5">
          <div className="size-2 rounded-full bg-blue-500" />
          <span className="text-[10px] text-muted-foreground">P50 zone</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="size-2 rounded-full bg-yellow-500" />
          <span className="text-[10px] text-muted-foreground">P95 zone</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="size-2 rounded-full bg-red-500" />
          <span className="text-[10px] text-muted-foreground">P99 zone</span>
        </div>
      </div>
    </div>
  );
}

function HockeyStickCurve() {
  const [load, setLoad] = useState(20);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (!animating) return;
    const t = setInterval(() => {
      setLoad((l) => {
        if (l >= 95) {
          setAnimating(false);
          return 20;
        }
        return l + 1;
      });
    }, 80);
    return () => clearInterval(t);
  }, [animating]);

  const points = Array.from({ length: 50 }, (_, i) => {
    const utilization = (i / 49) * 100;
    const latency = utilization < 60
      ? 50 + utilization * 0.5
      : utilization < 80
      ? 80 + (utilization - 60) * 5
      : utilization < 90
      ? 180 + (utilization - 80) * 30
      : 480 + (utilization - 90) * 150;
    return { x: utilization, y: Math.min(latency, 2000) };
  });

  const maxY = 2000;
  const svgPoints = points
    .map((p, i) => `${(i / 49) * 100},${100 - (p.y / maxY) * 100}`)
    .join(" ");

  const currentLatency = (() => {
    if (load < 60) return 50 + load * 0.5;
    if (load < 80) return 80 + (load - 60) * 5;
    if (load < 90) return 180 + (load - 80) * 30;
    return 480 + (load - 90) * 150;
  })();

  const dotX = (load / 100) * 100;
  const dotY = 100 - (Math.min(currentLatency, maxY) / maxY) * 100;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAnimating(!animating)}
            className={cn(
              "rounded-md px-3 py-1 text-xs font-medium border transition-all",
              animating
                ? "bg-red-500/10 border-red-500/30 text-red-400"
                : "bg-blue-500/10 border-blue-500/30 text-blue-400"
            )}
          >
            {animating ? "Stop" : "Animate load increase"}
          </button>
          <input
            type="range"
            min={5}
            max={98}
            value={load}
            onChange={(e) => { setAnimating(false); setLoad(Number(e.target.value)); }}
            className="w-32 accent-blue-500"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground/60">Utilization</p>
            <p className={cn(
              "text-sm font-mono font-bold",
              load > 90 ? "text-red-400" : load > 75 ? "text-yellow-400" : "text-emerald-400"
            )}>{load}%</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground/60">Latency</p>
            <p className={cn(
              "text-sm font-mono font-bold",
              currentLatency > 500 ? "text-red-400" : currentLatency > 150 ? "text-yellow-400" : "text-emerald-400"
            )}>{Math.round(currentLatency)}ms</p>
          </div>
        </div>
      </div>
      <div className="relative rounded-lg border bg-muted/10 p-4">
        <div className="flex items-end gap-1">
          <span className="text-[9px] font-mono text-muted-foreground/40 w-10 text-right">2000ms</span>
          <svg viewBox="0 0 100 100" className="w-full h-40" preserveAspectRatio="none">
            <polyline
              points={svgPoints}
              fill="none"
              stroke="currentColor"
              strokeWidth="0.8"
              className="text-muted-foreground/30"
            />
            <polyline
              points={svgPoints.split(" ").filter((_, i) => {
                const x = parseFloat(svgPoints.split(" ")[i]?.split(",")[0] || "100");
                return x <= dotX;
              }).join(" ")}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              className={cn(
                load > 90 ? "text-red-500" : load > 75 ? "text-yellow-500" : "text-emerald-500"
              )}
            />
            <circle
              cx={dotX}
              cy={dotY}
              r="2"
              className={cn(
                "fill-current",
                load > 90 ? "text-red-500" : load > 75 ? "text-yellow-500" : "text-emerald-500"
              )}
            />
            <line x1={dotX} y1={dotY} x2={dotX} y2="100" stroke="currentColor" strokeWidth="0.3" strokeDasharray="2,2" className="text-muted-foreground/20" />
          </svg>
        </div>
        <div className="flex justify-between mt-1 pl-11">
          <span className="text-[9px] font-mono text-muted-foreground/40">0%</span>
          <span className="text-[9px] font-mono text-muted-foreground/40">50%</span>
          <span className="text-[9px] font-mono text-muted-foreground/40">100% utilization</span>
        </div>
      </div>
      <p className="text-[11px] text-muted-foreground/60 text-center">
        {load < 60
          ? "Comfortable zone. Latency is flat and predictable."
          : load < 80
          ? "Getting warm. Latency starts climbing as resources contend."
          : load < 90
          ? "Danger zone. Requests are queueing, latency is spiking."
          : "System is saturated. Latency goes exponential. This is where outages begin."}
      </p>
    </div>
  );
}

function TailLatencyAmplification() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % 6), 1500);
    return () => clearInterval(t);
  }, []);

  const services = [
    { name: "User Svc", latency: 25, isSlow: false },
    { name: "Auth Svc", latency: 22, isSlow: false },
    { name: "Posts Svc", latency: 450, isSlow: true },
    { name: "Notif Svc", latency: 18, isSlow: false },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={cn(
            "size-10 rounded-lg border flex items-center justify-center transition-all",
            step >= 1 ? "bg-blue-500/10 border-blue-500/30" : "bg-muted/30 border-border"
          )}>
            <span className="text-xs font-bold">API</span>
          </div>
          <span className="text-[11px] text-muted-foreground">Fan-out request</span>
        </div>
        <span className={cn(
          "text-xs font-mono font-bold transition-colors",
          step >= 5 ? "text-red-400" : "text-muted-foreground/40"
        )}>
          {step >= 5 ? "Total: 450ms (limited by slowest)" : ""}
        </span>
      </div>
      <div className="space-y-1.5">
        {services.map((svc, i) => (
          <div key={svc.name} className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-muted-foreground/50 w-16 shrink-0">{svc.name}</span>
            <div className="flex-1 relative h-6">
              <div
                className={cn(
                  "h-full rounded-md flex items-center px-2 text-[10px] font-mono transition-all duration-500 border",
                  step > i + 1
                    ? svc.isSlow
                      ? "bg-red-500/15 border-red-500/30 text-red-400"
                      : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    : step === i + 1
                    ? "bg-blue-500/10 border-blue-500/25 text-blue-400"
                    : "bg-muted/15 border-border/30 text-muted-foreground/30"
                )}
                style={{ width: `${Math.min((svc.latency / 500) * 100, 100)}%`, minWidth: "60px" }}
              >
                {step > i + 1 ? `${svc.latency}ms` : ""}
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-muted-foreground/60">
        {step < 5
          ? "Sending parallel requests to 4 services..."
          : "One slow P99 response (Posts Svc) makes the entire request slow. With fan-out, tail latency gets amplified."}
      </p>
    </div>
  );
}

export default function LatencyAndThroughputPage() {
  return (
    <div className="space-y-8">
      <TopicHero
        title="Latency & Throughput"
        subtitle="Two numbers that define the performance of every system. Confuse them, and you will optimize the wrong thing. Ignore them, and your users will leave."
        difficulty="beginner"
      />

      <FailureScenario title="Your API takes 10 seconds to respond">
        <p className="text-sm text-muted-foreground">
          You ship a new search feature. It works in development. In production, users report
          that searches take 8 to 12 seconds. Your PM is furious. You check the server —
          CPU is at 15%, memory is fine, no errors in the logs. The server is not overloaded.
          So why is it so slow?
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
          <MetricCounter label="Response Time" value={10200} unit="ms" trend="up" />
          <MetricCounter label="CPU Usage" value={15} unit="%" trend="down" />
          <MetricCounter label="Memory" value={42} unit="%" trend="neutral" />
          <MetricCounter label="Users Leaving" value={73} unit="%" trend="up" />
        </div>
        <p className="text-sm text-muted-foreground mt-3">
          You discover that every search query makes 6 sequential API calls to different
          microservices, each taking 1-2 seconds. The server has plenty of capacity, but each
          request is stuck <strong>waiting</strong> — latency is the bottleneck, not throughput.
        </p>
      </FailureScenario>

      <WhyItBreaks title="Latency and throughput are different problems with different fixes">
        <p className="text-sm text-muted-foreground">
          <strong>Latency</strong> is how long one operation takes.
          <strong> Throughput</strong> is how many operations you can handle per unit of time.
          They are related but independent. You can have low latency with low throughput (a single
          fast worker), or high throughput with high latency (a factory that produces a lot but
          each item takes time on the assembly line).
        </p>
        <BeforeAfter
          before={{
            title: "Latency problem",
            content: (
              <div className="text-sm space-y-2">
                <p className="text-muted-foreground">One request takes too long</p>
                <div className="bg-muted/50 p-2 rounded text-xs font-mono">
                  <p>Request {'->'} Service A (2s)</p>
                  <p>{'->'} Service B (2s)</p>
                  <p>{'->'} Service C (2s)</p>
                  <p>{'->'} Database (2s)</p>
                  <p className="text-red-400 mt-1">Total: 8 seconds</p>
                </div>
              </div>
            ),
          }}
          after={{
            title: "Throughput problem",
            content: (
              <div className="text-sm space-y-2">
                <p className="text-muted-foreground">Each request is fast, but too many at once</p>
                <div className="bg-muted/50 p-2 rounded text-xs font-mono">
                  <p>Each request: 50ms</p>
                  <p>Server capacity: 100 req/s</p>
                  <p>Incoming load: 500 req/s</p>
                  <p className="text-red-400 mt-1">Queue builds up, users wait</p>
                </div>
              </div>
            ),
          }}
        />
      </WhyItBreaks>

      <ConceptVisualizer title="The Latency Hierarchy — Numbers Every Engineer Should Know">
        <p className="text-sm text-muted-foreground mb-4">
          These are the approximate latency numbers from Jeff Dean and Peter Norvig that every
          systems engineer should have internalized. The key insight: each level of the memory/storage
          hierarchy is roughly 10-100x slower than the one above it. Where your data lives
          determines your latency floor.
        </p>
        <LatencyHierarchy />
        <ConversationalCallout type="tip">
          Memory is ~1,000x faster than SSD. SSD is ~100x faster than a cross-continent network
          call. This is why caching is the single most impactful optimization in system design —
          it moves data up the hierarchy.
        </ConversationalCallout>
      </ConceptVisualizer>

      <ConceptVisualizer title="Network Latency — The Speed of Light Is the Limit">
        <p className="text-sm text-muted-foreground mb-4">
          No amount of optimization can beat the speed of light. A packet from New York to London
          travels through fiber at about 200,000 km/s — and that is the best case. Real-world
          routing, switches, and protocol overhead add more. Click each route to see actual
          round-trip times.
        </p>
        <NetworkLatencyMap />
        <AhaMoment
          question="Why does same-datacenter latency matter so much in system design?"
          answer={
            <p>
              A typical microservice request fans out to 5-10 internal services. If each
              hop is 0.5ms within the same datacenter, that is 5ms total. But if those
              services are in different regions at 40ms each, you are looking at 400ms —
              nearly half a second before your application logic even runs. This is why
              co-locating services in the same region is a fundamental architecture decision.
            </p>
          }
        />
      </ConceptVisualizer>

      <ConceptVisualizer title="The Hockey Stick Curve — The Most Important Graph in Performance">
        <p className="text-sm text-muted-foreground mb-4">
          Latency stays flat until the system approaches saturation, then it spikes
          exponentially. This is modeled by queueing theory: as utilization approaches 100%,
          wait time approaches infinity. This curve explains why production systems should
          never run above 70-80% utilization.
        </p>
        <HockeyStickCurve />
      </ConceptVisualizer>

      <ConceptVisualizer title="P50 / P95 / P99 — Why Averages Lie">
        <p className="text-sm text-muted-foreground mb-4">
          Average latency hides outliers. If 99 requests take 20ms and one takes 5 seconds,
          the average looks like 70ms — which seems fine. But P99 reveals that 1 in 100 users
          is waiting 5 seconds. At 1 million requests per day, that is 10,000 frustrated users.
          The histogram below shows a live distribution. Watch how the percentiles differ.
        </p>
        <PercentileDistribution />
        <ConversationalCallout type="tip">
          Use P50 to detect broad regressions (the typical experience is getting worse). Use
          P95 to tune system performance. Use P99 to expose architectural bottlenecks — it is
          often a garbage collection pause, a cold cache, or a slow database query that only
          hits 1% of requests.
        </ConversationalCallout>
      </ConceptVisualizer>

      <ConceptVisualizer title="Tail Latency Amplification">
        <p className="text-sm text-muted-foreground mb-4">
          In microservice architectures, a single slow service can make the entire request slow.
          If your API gateway fans out to 4 services in parallel, the response time equals the
          <strong> slowest</strong> service. A 1% slow rate per service becomes a 4% slow rate
          for the combined request (1 - 0.99^4). At 50 services, the probability of at least one
          being slow is 40%.
        </p>
        <TailLatencyAmplification />
      </ConceptVisualizer>

      <ScaleSimulator
        title="Latency Under Load"
        min={10}
        max={5000}
        step={50}
        unit="req/s"
        metrics={(value) => [
          { label: "Avg Latency", value: Math.round(50 + (value > 1000 ? (value - 1000) * 0.5 : 0)), unit: "ms" },
          { label: "P99 Latency", value: Math.round(200 + (value > 500 ? (value - 500) * 2 : 0)), unit: "ms" },
          { label: "Error Rate", value: value > 3000 ? Math.round((value - 3000) * 0.02 * 10) / 10 : 0, unit: "%" },
        ]}
      >
        {({ value }) => (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Drag the slider to increase load. Notice how P99 latency climbs much faster than
              the average — this is the hockey stick curve in action. The gap between average
              and P99 is where your users suffer.
            </p>
            <div className="flex items-center justify-center gap-4">
              <ServerNode
                type="server"
                label="API Server"
                sublabel={`${value} req/s`}
                status={value > 3000 ? "unhealthy" : value > 1500 ? "warning" : "healthy"}
              />
              <span className="text-muted-foreground">-{">"}</span>
              <ServerNode
                type="database"
                label="Database"
                sublabel={`${Math.round(value * 0.6)} queries/s`}
                status={value > 4000 ? "unhealthy" : value > 2000 ? "warning" : "healthy"}
              />
            </div>
            {value > 3000 && (
              <ConversationalCallout type="warning">
                The system is past its capacity. Requests are queueing up, P99 latency is in
                the seconds, and errors are climbing. In production, this is when pages stop
                loading and your on-call engineer gets paged.
              </ConversationalCallout>
            )}
          </div>
        )}
      </ScaleSimulator>

      <InteractiveDemo title="Sequential vs Parallel Requests">
        {({ isPlaying, tick }) => {
          const progress = isPlaying ? Math.min(tick, 3) : 0;
          const services = [
            { name: "User Service", time: 200 },
            { name: "Posts Service", time: 180 },
            { name: "Notifications", time: 150 },
          ];
          const seqTotal = services.reduce((a, s) => a + s.time, 0);
          const parTotal = Math.max(...services.map((s) => s.time));

          return (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                The fastest way to reduce latency is to do less waiting. If your request makes
                3 independent calls, run them in parallel instead of sequentially. This cuts
                latency from {seqTotal}ms to {parTotal}ms — a {Math.round((1 - parTotal / seqTotal) * 100)}% improvement.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                  <p className="text-xs font-semibold text-red-500">Sequential: {seqTotal}ms total</p>
                  {services.map((service, i) => {
                    const offset = services.slice(0, i).reduce((a, s) => a + s.time, 0);
                    return (
                      <div key={service.name} className="flex items-center gap-2">
                        <div className={cn(
                          "h-6 rounded text-[10px] flex items-center px-2 transition-all duration-700 border",
                          progress > i ? "bg-red-500/20 border-red-500/30" : "bg-muted/50 border-muted"
                        )} style={{ width: `${(service.time / seqTotal) * 100}%`, marginLeft: `${(offset / seqTotal) * 40}%` }}>
                          {service.name} ({service.time}ms)
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                  <p className="text-xs font-semibold text-green-500">Parallel: {parTotal}ms total</p>
                  {services.map((service) => (
                    <div key={service.name} className="flex items-center gap-2">
                      <div className={cn(
                        "h-6 rounded text-[10px] flex items-center px-2 transition-all duration-700 border",
                        progress > 0 ? "bg-green-500/20 border-green-500/30" : "bg-muted/50 border-muted"
                      )} style={{ width: `${(service.time / seqTotal) * 100}%` }}>
                        {service.name} ({service.time}ms)
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        }}
      </InteractiveDemo>

      <AhaMoment
        question="If you add more servers, do you improve latency or throughput?"
        answer={
          <p>
            Primarily throughput. Adding servers lets you handle more requests in parallel,
            but each individual request still takes the same amount of time. To improve latency,
            you need to reduce the work done per request: caching, parallelization, moving
            data closer to the user, or optimizing algorithms. However, if latency was high
            because of queuing (overload), adding servers indirectly reduces latency too — you
            are moving left on the hockey stick curve.
          </p>
        }
      />

      <CorrectApproach title="Strategies for Improving Both">
        <p className="text-sm text-muted-foreground mb-4">
          The good news: many optimizations improve both latency and throughput. The key is
          knowing which metric is your actual bottleneck before you start optimizing.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-sm font-semibold flex items-center gap-2">
              <Clock className="size-4" /> Reduce Latency
            </p>
            {[
              { title: "Cache at every layer", desc: "CDN, application, database query cache" },
              { title: "Parallelize independent ops", desc: "Promise.all, fan-out patterns" },
              { title: "Move data closer to users", desc: "Edge computing, regional replicas" },
              { title: "Use faster storage", desc: "Disk -> SSD -> RAM -> L1 cache" },
              { title: "Reduce payload sizes", desc: "Compression, pagination, field selection" },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-2 rounded-lg bg-muted/30 p-2.5">
                <Zap className="size-3 text-blue-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium">{item.title}</p>
                  <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold flex items-center gap-2">
              <Gauge className="size-4" /> Increase Throughput
            </p>
            {[
              { title: "Horizontal scaling", desc: "More servers behind a load balancer" },
              { title: "Async processing", desc: "Queue non-urgent work for later" },
              { title: "Connection pooling", desc: "Reuse database and HTTP connections" },
              { title: "Batch operations", desc: "Group writes, bulk inserts" },
              { title: "Read replicas", desc: "Spread read load across database copies" },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-2 rounded-lg bg-muted/30 p-2.5">
                <BarChart3 className="size-3 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium">{item.title}</p>
                  <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CorrectApproach>

      <ConversationalCallout type="question">
        In a system design interview, always ask: &quot;What are the latency requirements?&quot; and
        &quot;What throughput do we need to support?&quot; These two numbers shape every architecture
        decision — from whether you need caching to how many servers you provision. A real-time
        gaming backend has very different requirements than an analytics pipeline.
      </ConversationalCallout>

      <KeyTakeaway
        points={[
          "Latency is how long one operation takes. Throughput is how many operations per second. They require different optimizations.",
          "Know the latency hierarchy: L1 cache (~1ns) -> RAM (~100ns) -> SSD (~16us) -> same DC (~500us) -> cross-continent (~40ms). Where data lives is your latency floor.",
          "The hockey stick curve: latency stays flat until ~70% utilization, then spikes exponentially. Never run production systems above 70-80% capacity.",
          "Always measure P50, P95, and P99 latency — not averages. Averages hide the pain your worst-off users experience. At scale, 1% of users is a lot of people.",
          "Tail latency gets amplified in microservice architectures. If you fan out to N services, the chance of hitting at least one slow response grows as 1 - (1 - p)^N.",
          "Parallelize independent operations to cut latency. Add more servers to increase throughput. Cache to improve both.",
        ]}
      />
    </div>
  );
}
