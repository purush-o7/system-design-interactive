"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import { TopicHero } from "@/components/topic-hero";
import { KeyTakeaway } from "@/components/key-takeaway";
import { ConversationalCallout } from "@/components/conversational-callout";
import { AhaMoment } from "@/components/aha-moment";
import { BeforeAfter } from "@/components/before-after";
import { Playground } from "@/components/playground";
import { FlowDiagram, type FlowNode, type FlowEdge } from "@/components/flow-diagram";
import { LiveChart } from "@/components/live-chart";
import { useSimulation } from "@/hooks/use-simulation";
import { cn } from "@/lib/utils";

// --- Latency Simulator ---

function LatencySimulator() {
  const [latencyMs, setLatencyMs] = useState(100);
  const [requests, setRequests] = useState<{ id: number; sentAt: number; latency: number }[]>([]);
  const nextId = useRef(0);

  const sendRequest = useCallback(() => {
    const jitter = Math.random() * 0.4 + 0.8; // 0.8 - 1.2x
    const tail = Math.random() > 0.95 ? 3 + Math.random() * 4 : 1;
    const actual = Math.round(latencyMs * jitter * tail);
    setRequests((prev) => {
      const next = [...prev, { id: nextId.current++, sentAt: Date.now(), latency: actual }];
      return next.slice(-100);
    });
  }, [latencyMs]);

  const sorted = useMemo(() => {
    const latencies = requests.map((r) => r.latency).sort((a, b) => a - b);
    return latencies;
  }, [requests]);

  const p50 = sorted.length > 0 ? sorted[Math.floor(sorted.length * 0.5)] : 0;
  const p95 = sorted.length > 0 ? sorted[Math.floor(sorted.length * 0.95)] : 0;
  const p99 = sorted.length > 0 ? sorted[Math.floor(sorted.length * 0.99)] : 0;

  const histogramData = useMemo(() => {
    const maxBin = Math.max(latencyMs * 6, 500);
    const binSize = Math.max(Math.round(maxBin / 15), 10);
    const bins: { range: string; count: number }[] = [];
    for (let i = 0; i < 15; i++) {
      const lo = i * binSize;
      const hi = (i + 1) * binSize;
      bins.push({
        range: `${lo}`,
        count: sorted.filter((v) => v >= lo && v < hi).length,
      });
    }
    return bins;
  }, [sorted, latencyMs]);

  const sim = useSimulation({
    intervalMs: 300,
    onTick: () => sendRequest(),
  });

  const nodes: FlowNode[] = useMemo(() => [
    {
      id: "client",
      type: "clientNode",
      position: { x: 50, y: 80 },
      data: {
        label: "Client",
        sublabel: `${requests.length} sent`,
        status: "healthy",
        handles: { right: true },
      },
    },
    {
      id: "server",
      type: "serverNode",
      position: { x: 400, y: 80 },
      data: {
        label: "Server",
        sublabel: `~${latencyMs}ms delay`,
        status: latencyMs > 500 ? "warning" : "healthy",
        metrics: [
          { label: "P50", value: `${p50}ms` },
          { label: "P99", value: `${p99}ms` },
        ],
        handles: { left: true },
      },
    },
  ], [requests.length, latencyMs, p50, p99]);

  const edges: FlowEdge[] = useMemo(() => [
    {
      id: "client-server",
      source: "client",
      target: "server",
      animated: sim.isPlaying,
      label: `${latencyMs}ms`,
    },
  ], [latencyMs, sim.isPlaying]);

  const percentileCards = [
    { label: "P50", value: p50, color: "text-blue-400" },
    { label: "P95", value: p95, color: "text-yellow-400" },
    { label: "P99", value: p99, color: "text-red-400" },
    { label: "Sent", value: requests.length, color: "text-emerald-400" },
  ];

  return (
    <Playground
      title="Latency Simulator"
      simulation={sim}
      canvasHeight="min-h-[420px]"
      canvas={
        <div className="p-4 space-y-4">
          <FlowDiagram nodes={nodes} edges={edges} minHeight={180} interactive={false} allowDrag={false} />
          <div className="px-2 space-y-3">
            <div className="flex items-center gap-3">
              <label className="text-xs text-muted-foreground shrink-0 w-24">Latency: {latencyMs}ms</label>
              <input
                type="range"
                min={1}
                max={1000}
                value={latencyMs}
                onChange={(e) => setLatencyMs(Number(e.target.value))}
                className="flex-1 accent-violet-500"
              />
              <button
                onClick={sendRequest}
                className="rounded-md border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400 hover:bg-blue-500/20 transition-colors"
              >
                Send 1
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {percentileCards.map((c) => (
                <div key={c.label} className="rounded-lg bg-muted/30 p-2 text-center">
                  <p className="text-[10px] text-muted-foreground/60 uppercase">{c.label}</p>
                  <p className={cn("text-sm font-mono font-bold", c.color)}>
                    {c.label === "Sent" ? c.value : `${c.value}ms`}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      }
      explanation={(state) => (
        <div className="space-y-3">
          <p>
            Adjust the latency slider and click <strong>Send 1</strong> or press play to
            auto-fire requests. Each request gets realistic jitter, with ~5% chance of a
            tail latency spike (3-7x base latency).
          </p>
          <p>
            Watch how <strong>P99</strong> diverges from P50 as you accumulate requests.
            The histogram below reveals the distribution shape -- most requests cluster
            near the base latency, but tail outliers stretch far right.
          </p>
          {requests.length > 10 && (
            <p className="text-yellow-400 text-xs">
              P99 is {Math.round(p99 / Math.max(p50, 1))}x the P50. At scale, that
              tail affects thousands of users.
            </p>
          )}
        </div>
      )}
    />
  );
}

function LatencyHistogram() {
  const [requests] = useState(() => {
    const data: { latency: number }[] = [];
    for (let i = 0; i < 200; i++) {
      const base = 50;
      const jitter = Math.random() * 0.4 + 0.8;
      const tail = Math.random() > 0.95 ? 3 + Math.random() * 4 : 1;
      data.push({ latency: Math.round(base * jitter * tail) });
    }
    return data;
  });

  const histData = useMemo(() => {
    const bins: { range: string; count: number }[] = [];
    for (let i = 0; i < 12; i++) {
      const lo = i * 30;
      const hi = (i + 1) * 30;
      bins.push({
        range: `${lo}`,
        count: requests.filter((r) => r.latency >= lo && r.latency < hi).length,
      });
    }
    return bins;
  }, [requests]);

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">Sample Distribution (200 requests, 50ms base)</p>
      <LiveChart
        type="bar"
        data={histData}
        dataKeys={{ x: "range", y: "count", label: "Requests" }}
        height={180}
        unit=""
      />
    </div>
  );
}

// --- Throughput Playground ---

function ThroughputPlayground() {
  const [pipeWidth, setPipeWidth] = useState(50);
  const [concurrency, setConcurrency] = useState(10);

  const sim = useSimulation({ intervalMs: 600 });

  const maxThroughput = pipeWidth * 2;
  const effectiveThroughput = Math.min(concurrency * 5, maxThroughput);
  const utilization = Math.round((effectiveThroughput / maxThroughput) * 100);
  const isBottleneck = concurrency * 5 > maxThroughput;

  const pipeHeightMap: Record<string, string> = {
    "10": "h-3",
    "25": "h-5",
    "50": "h-8",
    "75": "h-12",
    "100": "h-16",
  };
  const closestPipeKey = String(
    [10, 25, 50, 75, 100].reduce((prev, curr) =>
      Math.abs(curr - pipeWidth) < Math.abs(prev - pipeWidth) ? curr : prev
    )
  );
  const pipeClass = pipeHeightMap[closestPipeKey] || "h-8";

  const chartData = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => {
      const conn = (i + 1) * 5;
      const tp = Math.min(conn * 5, maxThroughput);
      return { connections: `${conn}`, throughput: tp };
    });
  }, [maxThroughput]);

  const statusColor = isBottleneck ? "text-red-400" : utilization > 70 ? "text-yellow-400" : "text-emerald-400";
  const pipeColor = isBottleneck ? "bg-red-500/30 border-red-500/40" : "bg-emerald-500/20 border-emerald-500/30";
  const bottleneckPipeColor = "bg-red-500/40 border-red-500/50";

  return (
    <Playground
      title="Throughput Pipeline"
      simulation={sim}
      controls={false}
      canvasHeight="min-h-[400px]"
      canvas={
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-3">
            <label className="text-xs text-muted-foreground w-36 shrink-0">
              Pipe width (bandwidth): {pipeWidth}
            </label>
            <input
              type="range" min={10} max={100} value={pipeWidth}
              onChange={(e) => setPipeWidth(Number(e.target.value))}
              className="flex-1 accent-violet-500"
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="text-xs text-muted-foreground w-36 shrink-0">
              Concurrent requests: {concurrency}
            </label>
            <input
              type="range" min={1} max={100} value={concurrency}
              onChange={(e) => setConcurrency(Number(e.target.value))}
              className="flex-1 accent-violet-500"
            />
          </div>

          {/* Visual pipeline */}
          <div className="flex items-center gap-0 py-4">
            <div className="rounded-lg border bg-blue-500/10 border-blue-500/30 px-3 py-2 text-xs font-medium text-blue-400 shrink-0">
              Requests ({concurrency})
            </div>
            <div className={cn(
              "flex-1 border-y transition-all duration-300 relative",
              isBottleneck ? bottleneckPipeColor : pipeColor,
              pipeClass
            )}>
              {isBottleneck && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[10px] font-mono text-red-400 bg-background/80 px-1.5 py-0.5 rounded">
                    BOTTLENECK
                  </span>
                </div>
              )}
              <div
                className="h-full bg-emerald-500/30 transition-all duration-300 rounded-sm"
                style={{ width: `${Math.min(utilization, 100)}%` }}
              />
            </div>
            <div className="rounded-lg border bg-emerald-500/10 border-emerald-500/30 px-3 py-2 text-xs font-medium text-emerald-400 shrink-0">
              {effectiveThroughput} rps
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg bg-muted/30 p-2 text-center">
              <p className="text-[10px] text-muted-foreground/60">Throughput</p>
              <p className={cn("text-sm font-mono font-bold", statusColor)}>{effectiveThroughput} rps</p>
            </div>
            <div className="rounded-lg bg-muted/30 p-2 text-center">
              <p className="text-[10px] text-muted-foreground/60">Max Capacity</p>
              <p className="text-sm font-mono font-bold text-muted-foreground">{maxThroughput} rps</p>
            </div>
            <div className="rounded-lg bg-muted/30 p-2 text-center">
              <p className="text-[10px] text-muted-foreground/60">Utilization</p>
              <p className={cn("text-sm font-mono font-bold", statusColor)}>{utilization}%</p>
            </div>
          </div>

          <LiveChart
            type="throughput"
            data={chartData}
            dataKeys={{ x: "connections", y: "throughput", label: "Throughput" }}
            height={160}
            unit="rps"
            referenceLines={[{ y: maxThroughput, label: "Max capacity", color: "#ef4444" }]}
          />
        </div>
      }
      explanation={
        <div className="space-y-3">
          <p>
            <strong>Bandwidth</strong> sets the maximum throughput of the pipeline. Increasing
            concurrent requests raises throughput linearly -- until you hit the pipe limit.
          </p>
          <p>
            Try setting concurrency above the pipe capacity. The pipeline turns red,
            showing a <strong>bottleneck</strong>: no matter how many requests you add,
            throughput cannot exceed the pipe width.
          </p>
          <p>
            This is why scaling is not just about sending more requests. You need to
            widen the pipe (more servers, better hardware, optimized code) to actually
            increase throughput.
          </p>
        </div>
      }
    />
  );
}

// --- Latency vs Throughput Tradeoff ---

function LatencyVsThroughput() {
  const [loadLevel, setLoadLevel] = useState(20);

  const latencyData = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => {
      const load = (i + 1) * 5;
      const lat = load < 50
        ? 30 + load * 0.5
        : load < 80
        ? 55 + (load - 50) * 3
        : 145 + (load - 80) * 25;
      return { load: `${load}%`, latency: Math.round(lat) };
    });
  }, []);

  const throughputData = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => {
      const load = (i + 1) * 5;
      const tp = load < 60
        ? load * 10
        : load < 85
        ? 600 + (load - 60) * 4
        : 700 - (load - 85) * 15;
      return { load: `${load}%`, throughput: Math.max(Math.round(tp), 0) };
    });
  }, []);

  const currentLatency = loadLevel < 50
    ? 30 + loadLevel * 0.5
    : loadLevel < 80
    ? 55 + (loadLevel - 50) * 3
    : 145 + (loadLevel - 80) * 25;

  const currentThroughput = loadLevel < 60
    ? loadLevel * 10
    : loadLevel < 85
    ? 600 + (loadLevel - 60) * 4
    : Math.max(700 - (loadLevel - 85) * 15, 0);

  const statusMap: Record<string, string> = {
    low: "text-emerald-400",
    medium: "text-yellow-400",
    high: "text-red-400",
  };
  const zone = loadLevel < 50 ? "low" : loadLevel < 80 ? "medium" : "high";
  const statusClass = statusMap[zone] || "text-muted-foreground";

  const zoneDescription: Record<string, string> = {
    low: "Comfortable: latency is flat and throughput scales linearly with load.",
    medium: "Warming up: latency starts climbing. Throughput growth slows as resources contend.",
    high: "Saturated: latency spikes exponentially. Throughput actually drops as the system thrashes.",
  };

  return (
    <div className="space-y-4 rounded-xl border border-violet-500/20 bg-violet-500/[0.02] p-5">
      <div className="flex items-center gap-2">
        <div className="size-2 rounded-full bg-violet-500/50" />
        <span className="text-sm font-medium text-violet-400">Latency vs Throughput Tradeoff</span>
      </div>

      <div className="flex items-center gap-3">
        <label className="text-xs text-muted-foreground w-28 shrink-0">
          Load level: {loadLevel}%
        </label>
        <input
          type="range" min={5} max={98} value={loadLevel}
          onChange={(e) => setLoadLevel(Number(e.target.value))}
          className="flex-1 accent-violet-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-muted/30 p-2 text-center">
          <p className="text-[10px] text-muted-foreground/60">Latency</p>
          <p className={cn("text-sm font-mono font-bold", statusClass)}>
            {Math.round(currentLatency)}ms
          </p>
        </div>
        <div className="rounded-lg bg-muted/30 p-2 text-center">
          <p className="text-[10px] text-muted-foreground/60">Throughput</p>
          <p className={cn("text-sm font-mono font-bold", statusClass)}>
            {Math.round(currentThroughput)} rps
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Latency vs Load</p>
          <LiveChart
            type="latency"
            data={latencyData}
            dataKeys={{ x: "load", y: "latency", label: "Latency" }}
            height={180}
            unit="ms"
          />
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Throughput vs Load</p>
          <LiveChart
            type="throughput"
            data={throughputData}
            dataKeys={{ x: "load", y: "throughput", label: "Throughput" }}
            height={180}
            unit="rps"
          />
        </div>
      </div>

      <p className={cn("text-xs text-center", statusClass)}>
        {zoneDescription[zone]}
      </p>
    </div>
  );
}

// --- Real-world latency comparison ---

function RealWorldLatency() {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const items = [
    { label: "CDN edge cache", latency: 5, color: "bg-emerald-500", desc: "Content served from a nearby edge node. Almost instant." },
    { label: "In-memory cache (Redis)", latency: 15, color: "bg-green-500", desc: "Data in RAM on a nearby server. Sub-millisecond locally, ~15ms over network." },
    { label: "Database query (indexed)", latency: 50, color: "bg-blue-500", desc: "Well-indexed read from SSD-backed DB in the same datacenter." },
    { label: "Database query (full scan)", latency: 300, color: "bg-yellow-500", desc: "No index: the DB reads every row. Grows with table size." },
    { label: "Cross-region API call", latency: 120, color: "bg-orange-500", desc: "US East to Europe. Physics limits: light in fiber is ~200,000 km/s." },
    { label: "Third-party API", latency: 500, color: "bg-red-500", desc: "External dependency outside your control. Often the slowest link." },
  ];

  const maxLatency = Math.max(...items.map((i) => i.latency));

  const chartData = items.map((item) => ({
    name: item.label,
    latency: item.latency,
  }));

  return (
    <div className="space-y-4 rounded-xl border border-violet-500/20 bg-violet-500/[0.02] p-5">
      <div className="flex items-center gap-2">
        <div className="size-2 rounded-full bg-violet-500/50" />
        <span className="text-sm font-medium text-violet-400">Real-World Latency Comparison</span>
      </div>

      <div className="space-y-1.5">
        {items.map((item, i) => {
          const isActive = selectedIdx === i;
          const widthPercent = Math.max((item.latency / maxLatency) * 100, 4);
          return (
            <div
              key={item.label}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 cursor-pointer transition-all border",
                isActive
                  ? "bg-violet-500/10 border-violet-500/20"
                  : "bg-transparent border-transparent hover:bg-muted/20"
              )}
              onClick={() => setSelectedIdx(isActive ? null : i)}
            >
              <span className="text-[11px] text-muted-foreground w-40 shrink-0 truncate">
                {item.label}
              </span>
              <div className="flex-1 h-5 relative">
                <div
                  className={cn("h-full rounded-sm transition-all duration-500", item.color)}
                  style={{ width: `${widthPercent}%`, opacity: isActive ? 1 : 0.6 }}
                />
              </div>
              <span className="text-xs font-mono text-muted-foreground w-14 text-right shrink-0">
                {item.latency}ms
              </span>
            </div>
          );
        })}
      </div>

      {selectedIdx !== null && (
        <p className="text-xs text-muted-foreground bg-muted/20 rounded-lg px-3 py-2">
          {items[selectedIdx].desc}
        </p>
      )}

      <LiveChart
        type="bar"
        data={chartData}
        dataKeys={{ x: "name", y: "latency", label: "Latency" }}
        height={180}
        unit="ms"
      />
    </div>
  );
}

// --- Main Page ---

export default function LatencyAndThroughputPage() {
  return (
    <div className="space-y-8">
      <TopicHero
        title="Latency & Throughput"
        subtitle="Two numbers that define the performance of every system. Confuse them, and you will optimize the wrong thing. Ignore them, and your users will leave."
        difficulty="beginner"
      />

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">What is the difference?</h2>
        <BeforeAfter
          before={{
            title: "Latency",
            content: (
              <div className="text-sm space-y-2">
                <p className="text-muted-foreground">
                  How long <strong>one</strong> operation takes, start to finish.
                </p>
                <div className="bg-muted/50 p-2 rounded text-xs font-mono">
                  <p>User clicks button</p>
                  <p>... network + processing ...</p>
                  <p className="text-blue-400">Response arrives: 120ms</p>
                </div>
              </div>
            ),
          }}
          after={{
            title: "Throughput",
            content: (
              <div className="text-sm space-y-2">
                <p className="text-muted-foreground">
                  How many operations per second the system handles.
                </p>
                <div className="bg-muted/50 p-2 rounded text-xs font-mono">
                  <p>Each request: 50ms</p>
                  <p>10 workers in parallel</p>
                  <p className="text-emerald-400">Throughput: 200 req/s</p>
                </div>
              </div>
            ),
          }}
        />
        <ConversationalCallout type="tip">
          You can have low latency with low throughput (a single fast worker) or high
          throughput with high latency (a factory assembly line). They require different
          optimizations -- always identify which one is your actual bottleneck.
        </ConversationalCallout>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Latency Simulator</h2>
        <p className="text-sm text-muted-foreground">
          Fire requests at a server with adjustable delay. Watch percentiles diverge as
          tail latency spikes hit. P99 tells a very different story than the average.
        </p>
        <LatencySimulator />
        <LatencyHistogram />
      </section>

      <AhaMoment
        question="Why do we track P99 instead of averages?"
        answer={
          <p>
            If 99 requests take 20ms and one takes 5 seconds, the average is 70ms --
            looks fine. But P99 reveals that 1 in 100 users waits 5 seconds. At 1 million
            requests/day, that is 10,000 frustrated users. Averages hide the pain that
            your worst-off users experience.
          </p>
        }
      />

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Throughput Pipeline</h2>
        <p className="text-sm text-muted-foreground">
          Adjust the pipe width (bandwidth) and concurrent requests to see how throughput
          scales linearly then plateaus. The bottleneck visualization shows exactly where
          the constraint is.
        </p>
        <ThroughputPlayground />
      </section>

      <ConversationalCallout type="question">
        If you add more servers, do you improve latency or throughput? Primarily throughput.
        Each individual request still takes the same time. To improve latency, reduce the
        work per request: caching, parallelization, or moving data closer to the user.
        However, if latency was high due to queuing, adding servers indirectly helps --
        you move left on the hockey stick curve.
      </ConversationalCallout>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">The Tradeoff Under Load</h2>
        <p className="text-sm text-muted-foreground">
          Adding more requests increases throughput -- up to a point. Beyond that, latency
          spikes and throughput actually drops. Drag the slider to see this in action.
        </p>
        <LatencyVsThroughput />
      </section>

      <ConversationalCallout type="warning">
        The hockey stick curve is modeled by queueing theory: as utilization approaches 100%,
        wait time approaches infinity. This is why production systems should never run above
        70-80% utilization. That last 20% of capacity buys you resilience against traffic spikes.
      </ConversationalCallout>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Real-World Latency Numbers</h2>
        <p className="text-sm text-muted-foreground">
          Click each bar to learn why it takes that long. These numbers shape every
          architecture decision -- from whether you need a cache to where to deploy.
        </p>
        <RealWorldLatency />
      </section>

      <AhaMoment
        question="Why is caching the single most impactful optimization?"
        answer={
          <p>
            A CDN hit is 5ms. A database query is 50-300ms. A cross-region call is 120ms.
            Caching moves data up the latency hierarchy, turning slow operations into fast
            ones. It improves both latency (faster response) and throughput (fewer expensive
            backend operations).
          </p>
        }
      />

      <ConversationalCallout type="tip">
        In a system design interview, always ask: &quot;What are the latency requirements?&quot; and
        &quot;What throughput do we need?&quot; These two numbers shape every architecture decision --
        from caching strategy to server count. A real-time game has very different requirements
        than a batch analytics pipeline.
      </ConversationalCallout>

      <KeyTakeaway
        points={[
          "Latency is how long one operation takes. Throughput is how many operations per second. They require different optimizations.",
          "Always measure P50, P95, and P99 -- not averages. Averages hide the pain your worst-off users experience.",
          "The hockey stick curve: latency stays flat until ~70% utilization, then spikes exponentially. Never run production above 70-80% capacity.",
          "Throughput scales linearly with resources until you hit a bottleneck, then it plateaus. Identify the bottleneck before adding more servers.",
          "Under heavy load, latency spikes AND throughput drops -- the system thrashes. This is where outages begin.",
          "Caching is the most impactful optimization because it improves both latency and throughput by moving data up the hierarchy.",
        ]}
      />
    </div>
  );
}
