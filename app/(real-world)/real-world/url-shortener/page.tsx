"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { TopicHero } from "@/components/topic-hero";
import { KeyTakeaway } from "@/components/key-takeaway";
import { WhyCare } from "@/components/why-care";
import { GlossaryTerm } from "@/components/glossary-term";
import { TopicQuiz } from "@/components/topic-quiz";
import { AhaMoment } from "@/components/aha-moment";
import { ConversationalCallout } from "@/components/conversational-callout";
import { FlowDiagram, type FlowNode, type FlowEdge } from "@/components/flow-diagram";
import { LiveChart } from "@/components/live-chart";
import { Playground } from "@/components/playground";
import { useSimulation } from "@/hooks/use-simulation";
import { cn } from "@/lib/utils";
import { ArrowRight, Link2, Hash, Globe, CheckCircle2 } from "lucide-react";

// ─── Base62 Encoding ────────────────────────────────────────────────────────

const BASE62 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

function encodeBase62(num: number): string {
  if (num === 0) return "0";
  let result = "";
  let n = num;
  while (n > 0) {
    result = BASE62[n % 62] + result;
    n = Math.floor(n / 62);
  }
  return result;
}

function getBase62Steps(num: number) {
  const steps: { quotient: number; remainder: number; char: string }[] = [];
  let n = num;
  while (n > 0) {
    const remainder = n % 62;
    steps.push({ quotient: Math.floor(n / 62), remainder, char: BASE62[remainder] });
    n = Math.floor(n / 62);
  }
  return steps;
}

// ─── Architecture Flow Playground ───────────────────────────────────────────

type RequestPhase = "idle" | "shorten" | "redirect";

function useArchitectureNodes(phase: RequestPhase, step: number) {
  return useMemo(() => {
    const statusFor = (nodeStep: number): "healthy" | "idle" => {
      if (phase === "idle") return "idle";
      return step === nodeStep ? "healthy" : "idle";
    };

    const nodes: FlowNode[] = [
      {
        id: "client", type: "clientNode",
        position: { x: 20, y: 140 },
        data: {
          label: "Client", sublabel: "Browser",
          status: statusFor(0),
          handles: { right: true },
        },
      },
      {
        id: "gateway", type: "gatewayNode",
        position: { x: 200, y: 140 },
        data: {
          label: "API Gateway", sublabel: "Rate limit + route",
          status: statusFor(1),
          handles: { left: true, right: true },
        },
      },
      {
        id: "service", type: "serverNode",
        position: { x: 400, y: 140 },
        data: {
          label: "URL Service", sublabel: "Shorten / Resolve",
          status: statusFor(2),
          handles: { left: true, right: true, bottom: true },
        },
      },
      {
        id: "cache", type: "cacheNode",
        position: { x: 600, y: 60 },
        data: {
          label: "Redis Cache", sublabel: "95% hit rate",
          status: statusFor(3),
          handles: { left: true, bottom: true },
        },
      },
      {
        id: "db", type: "databaseNode",
        position: { x: 600, y: 220 },
        data: {
          label: "PostgreSQL", sublabel: "URL mappings",
          status: statusFor(4),
          handles: { left: true, top: true },
        },
      },
    ];

    const edges: FlowEdge[] = [
      { id: "e-client-gw", source: "client", target: "gateway", sourceHandle: "right", targetHandle: "left" },
      { id: "e-gw-svc", source: "gateway", target: "service", sourceHandle: "right", targetHandle: "left" },
      { id: "e-svc-cache", source: "service", target: "cache", sourceHandle: "right", targetHandle: "left" },
      { id: "e-svc-db", source: "service", target: "db", sourceHandle: "bottom", targetHandle: "left" },
      { id: "e-cache-db", source: "cache", target: "db", sourceHandle: "bottom", targetHandle: "top" },
    ];

    return { nodes, edges };
  }, [phase, step]);
}

function ArchitecturePlayground() {
  const sim = useSimulation({ intervalMs: 800, maxSteps: 12 });
  const [inputUrl, setInputUrl] = useState("https://example.com/very/long/path/to/some/article?ref=twitter");
  const [shortUrl, setShortUrl] = useState("");
  const [phase, setPhase] = useState<RequestPhase>("idle");
  const [log, setLog] = useState<string[]>([]);

  // Derive architecture step from simulation step
  const archStep = useMemo(() => {
    if (phase === "idle") return -1;
    if (phase === "shorten") return Math.min(sim.step, 4);
    // redirect phase: step 5-9 maps to nodes 0-4
    return Math.min(sim.step - 6, 4);
  }, [phase, sim.step]);

  const { nodes, edges } = useArchitectureNodes(phase, archStep);

  useEffect(() => {
    if (!sim.isPlaying && sim.step === 0) {
      setPhase("idle");
      setLog([]);
      setShortUrl("");
    }
  }, [sim.isPlaying, sim.step]);

  useEffect(() => {
    const s = sim.step;
    if (s === 0) return;

    if (s === 1) {
      setPhase("shorten");
      setLog(["POST /api/shorten"]);
    } else if (s === 2) {
      setLog((p) => [...p, "Gateway: rate limit OK, routing..."]);
    } else if (s === 3) {
      setLog((p) => [...p, "URL Service: generating unique ID via Snowflake"]);
    } else if (s === 4) {
      const code = encodeBase62(10000000 + Math.floor(Math.random() * 9000000));
      setShortUrl(`sho.rt/${code}`);
      setLog((p) => [...p, `Redis: SET ${code} → cached`]);
    } else if (s === 5) {
      setLog((p) => [...p, `DB: INSERT mapping stored`, `Response: ${shortUrl}`]);
    } else if (s === 6) {
      setPhase("idle");
      setLog((p) => [...p, "--- Shorten complete! Now resolving... ---"]);
    } else if (s === 7) {
      setPhase("redirect");
      setLog((p) => [...p, `GET /${shortUrl.split("/")[1]}`]);
    } else if (s === 8) {
      setLog((p) => [...p, "Gateway: routing to URL Service"]);
    } else if (s === 9) {
      setLog((p) => [...p, "URL Service: looking up short code"]);
    } else if (s === 10) {
      setLog((p) => [...p, "Redis: CACHE HIT! Found mapping"]);
    } else if (s === 11) {
      setLog((p) => [...p, "301 Redirect → " + inputUrl.substring(0, 50) + "..."]);
    } else if (s === 12) {
      setPhase("idle");
      setLog((p) => [...p, "Redirect complete in ~2ms (cache hit)"]);
    }
  }, [sim.step]);

  const handleShorten = useCallback(() => {
    if (sim.isPlaying) return;
    sim.reset();
    setTimeout(() => sim.play(), 50);
  }, [sim]);

  return (
    <Playground
      title="URL Shortener — Full Request Flow"
      simulation={sim}
      canvasHeight="min-h-[380px]"
      hints={["Type a URL and click Shorten to watch the full request lifecycle through the architecture"]}
      canvas={
        <div className="h-full flex flex-col">
          {/* URL input bar */}
          <div className="flex items-center gap-2 p-3 border-b border-violet-500/10 bg-background/50">
            <div className="flex-1 flex items-center gap-2">
              <Globe className="size-4 text-muted-foreground shrink-0" />
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="Enter a URL to shorten..."
                className="flex-1 bg-muted/30 border border-border/50 rounded-md px-3 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-violet-500/30"
              />
            </div>
            <button
              onClick={handleShorten}
              disabled={sim.isPlaying || !inputUrl}
              className="px-4 py-1.5 rounded-md bg-violet-500/20 text-violet-400 text-xs font-medium border border-violet-500/30 hover:bg-violet-500/30 disabled:opacity-40 transition-colors"
            >
              Shorten
            </button>
            {shortUrl && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
                <Link2 className="size-3 text-emerald-400" />
                <span className="text-xs font-mono font-bold text-emerald-400">{shortUrl}</span>
              </div>
            )}
          </div>
          {/* Flow diagram */}
          <div className="flex-1">
            <FlowDiagram
              nodes={nodes}
              edges={edges}
              minHeight={300}
              allowDrag={false}
              interactive={false}
            />
          </div>
        </div>
      }
      explanation={(state) => (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className={cn(
              "size-2 rounded-full",
              phase === "idle" ? "bg-muted-foreground/30" : phase === "shorten" ? "bg-blue-500 animate-pulse" : "bg-emerald-500 animate-pulse"
            )} />
            <span className="text-xs font-medium">
              {phase === "idle" ? "Ready" : phase === "shorten" ? "Shortening URL..." : "Resolving redirect..."}
            </span>
          </div>
          <div className="space-y-1 font-mono text-[11px] max-h-[260px] overflow-y-auto">
            {log.map((entry, i) => (
              <div
                key={i}
                className={cn(
                  "px-2 py-1 rounded",
                  entry.startsWith("---") ? "text-muted-foreground/50 text-center" :
                  entry.startsWith("Response:") || entry.startsWith("Redirect complete") ? "text-emerald-400 bg-emerald-500/10" :
                  entry.startsWith("301") ? "text-blue-400 bg-blue-500/10" :
                  "text-muted-foreground"
                )}
              >
                {entry}
              </div>
            ))}
            {log.length === 0 && (
              <p className="text-muted-foreground/50 text-center py-4">
                Type a URL and click Shorten to watch the request flow through the architecture.
              </p>
            )}
          </div>
        </div>
      )}
    />
  );
}

// ─── Base62 Interactive ─────────────────────────────────────────────────────

function Base62Playground() {
  const [inputId, setInputId] = useState(12345678);
  const steps = useMemo(() => getBase62Steps(inputId), [inputId]);
  const encoded = useMemo(() => encodeBase62(inputId), [inputId]);

  return (
    <Playground
      title="Base62 Encoding — How Short URLs Are Born"
      controls={false}
      canvasHeight="min-h-[280px]"
      hints={["Drag the slider to see how numeric IDs map to short codes via repeated division by 62"]}
      canvas={
        <div className="p-5 space-y-4 h-full">
          {/* Slider + input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs text-muted-foreground font-medium">Database ID</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={inputId}
                  onChange={(e) => setInputId(Math.max(1, Math.min(999999999999, Number(e.target.value))))}
                  className="bg-muted/30 border border-border/50 rounded-md px-3 py-1 text-sm font-mono w-36 focus:outline-none focus:ring-1 focus:ring-violet-500/30"
                />
                <ArrowRight className="size-4 text-muted-foreground/50" />
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-md px-3 py-1">
                  <span className="text-sm font-mono font-bold text-emerald-400">{encoded}</span>
                </div>
              </div>
            </div>
            <input
              type="range"
              min={1}
              max={999999999}
              value={Math.min(inputId, 999999999)}
              onChange={(e) => setInputId(Number(e.target.value))}
              className="w-full h-1.5 rounded-full accent-violet-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground/40 font-mono">
              <span>1</span>
              <span>999,999,999</span>
            </div>
          </div>

          {/* Division steps */}
          <div className="space-y-1">
            <div className="grid grid-cols-4 gap-2 text-[10px] font-mono text-muted-foreground/60 px-1">
              <span>Step</span>
              <span>Value / 62</span>
              <span>Remainder</span>
              <span>Character</span>
            </div>
            {steps.map((s, i) => (
              <div key={i} className="grid grid-cols-4 gap-2 text-xs font-mono items-center rounded-md bg-muted/20 px-2 py-1.5">
                <span className="text-muted-foreground/50">{i + 1}</span>
                <span className="text-muted-foreground">{s.quotient}</span>
                <span className="text-blue-400">{s.remainder}</span>
                <span className="text-emerald-400 font-bold">{s.char}</span>
              </div>
            ))}
          </div>
        </div>
      }
      explanation={
        <div className="space-y-3">
          <p className="text-sm">
            Base62 uses 62 URL-safe characters:{" "}
            <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">a-z A-Z 0-9</code>.
          </p>
          <p className="text-sm">
            A 7-character string encodes up to 62<sup>7</sup> = <strong>3.5 trillion</strong> unique URLs.
            Bitly has shortened ~50 billion total, so 7 characters gives 70x headroom.
          </p>
          <p className="text-sm">
            The algorithm: repeatedly divide the numeric ID by 62, map each remainder to a character.
            Small IDs produce short codes; large IDs produce longer ones.
          </p>
          <div className="mt-2 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/15 text-xs text-emerald-400/80">
            Try dragging the slider. Notice how ID {inputId.toLocaleString()} maps to
            <strong className="text-emerald-400"> {encoded}</strong> ({encoded.length} chars).
          </div>
        </div>
      }
    />
  );
}

// ─── Read/Write Ratio Chart ─────────────────────────────────────────────────

function ReadWriteChart() {
  const data = useMemo(() => {
    const points = [];
    for (let hour = 0; hour <= 23; hour++) {
      const baseReads = 8000 + Math.sin(hour / 4) * 3000 + Math.random() * 1000;
      const baseWrites = 80 + Math.sin(hour / 6) * 30 + Math.random() * 20;
      points.push({
        hour: `${hour}:00`,
        reads: Math.round(baseReads),
        writes: Math.round(baseWrites),
      });
    }
    return points;
  }, []);

  return (
    <div className="rounded-xl border border-border/50 bg-muted/5 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Read vs Write Traffic (24h)</h3>
        <div className="flex items-center gap-3 text-[10px]">
          <div className="flex items-center gap-1.5">
            <div className="size-2 rounded-sm bg-blue-500" />
            <span className="text-muted-foreground">Reads (redirects)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="size-2 rounded-sm bg-amber-500" />
            <span className="text-muted-foreground">Writes (shortens)</span>
          </div>
        </div>
      </div>
      <LiveChart
        type="area"
        data={data}
        dataKeys={{ x: "hour", y: ["reads", "writes"], label: ["Reads", "Writes"] }}
        colors={["#3b82f6", "#f59e0b"]}
        height={200}
        unit="req/s"
        referenceLines={[{ y: 10000, label: "Single DB limit", color: "#ef4444" }]}
      />
      <p className="text-[11px] text-muted-foreground/60">
        For every URL shortened, it gets clicked ~100 times. Reads dominate at scale — your architecture must be optimized for reads, not writes.
      </p>
    </div>
  );
}

// ─── Scale Playground ───────────────────────────────────────────────────────

function useScaleNodes(scaleLevel: number) {
  return useMemo(() => {
    // scaleLevel: 0 = 1K/day, 1 = 100K/day, 2 = 10M/day
    const nodes: FlowNode[] = [
      {
        id: "client", type: "clientNode",
        position: { x: 20, y: 120 },
        data: {
          label: "Clients",
          sublabel: scaleLevel === 0 ? "~12 req/s" : scaleLevel === 1 ? "~1.2K req/s" : "~120K req/s",
          status: "healthy",
          handles: { right: true },
        },
      },
      {
        id: "lb", type: "loadBalancerNode",
        position: { x: 190, y: 120 },
        data: {
          label: "Load Balancer",
          sublabel: scaleLevel === 0 ? "Optional" : "Round-robin",
          status: scaleLevel === 0 ? "idle" : "healthy",
          handles: { left: true, right: true },
        },
      },
      {
        id: "svc1", type: "serverNode",
        position: { x: 370, y: 60 },
        data: {
          label: scaleLevel === 0 ? "URL Service" : "Service 1",
          sublabel: "Stateless",
          status: "healthy",
          handles: { left: true, right: true },
        },
      },
    ];

    const edges: FlowEdge[] = [
      { id: "e-cl-lb", source: "client", target: "lb", sourceHandle: "right", targetHandle: "left" },
      { id: "e-lb-s1", source: "lb", target: "svc1", sourceHandle: "right", targetHandle: "left" },
    ];

    // Add more service nodes at higher scale
    if (scaleLevel >= 1) {
      nodes.push({
        id: "svc2", type: "serverNode",
        position: { x: 370, y: 180 },
        data: { label: "Service 2", sublabel: "Stateless", status: "healthy", handles: { left: true, right: true } },
      });
      edges.push({ id: "e-lb-s2", source: "lb", target: "svc2", sourceHandle: "right", targetHandle: "left" });
    }

    if (scaleLevel >= 2) {
      nodes.push({
        id: "svc3", type: "serverNode",
        position: { x: 370, y: 300 },
        data: { label: "Service N", sublabel: "Auto-scaled", status: "healthy", handles: { left: true, right: true } },
      });
      edges.push({ id: "e-lb-s3", source: "lb", target: "svc3", sourceHandle: "right", targetHandle: "left" });
    }

    // Cache layer
    if (scaleLevel >= 1) {
      nodes.push({
        id: "cache", type: "cacheNode",
        position: { x: 570, y: 40 },
        data: {
          label: "Redis",
          sublabel: scaleLevel === 1 ? "Single node" : "Cluster (3 nodes)",
          status: "healthy",
          handles: { left: true, bottom: true },
          metrics: [{ label: "Hit Rate", value: "95%" }],
        },
      });
      const svcIds = scaleLevel >= 2 ? ["svc1", "svc2", "svc3"] : ["svc1", "svc2"];
      svcIds.forEach((id) => edges.push({ id: `e-${id}-cache`, source: id, target: "cache", sourceHandle: "right", targetHandle: "left" }));
    }

    // Database
    nodes.push({
      id: "db", type: "databaseNode",
      position: { x: scaleLevel >= 1 ? 570 : 540, y: scaleLevel >= 1 ? 180 : 120 },
      data: {
        label: scaleLevel >= 2 ? "Primary DB" : "PostgreSQL",
        sublabel: scaleLevel >= 2 ? "Writes only" : "URL mappings",
        status: "healthy",
        handles: { left: true, top: scaleLevel >= 1, right: scaleLevel >= 2 },
      },
    });

    if (scaleLevel < 1) {
      edges.push({ id: "e-s1-db", source: "svc1", target: "db", sourceHandle: "right", targetHandle: "left" });
    } else {
      edges.push({ id: "e-cache-db", source: "cache", target: "db", sourceHandle: "bottom", targetHandle: "top" });
    }

    // Read replicas at highest scale
    if (scaleLevel >= 2) {
      nodes.push({
        id: "replica1", type: "databaseNode",
        position: { x: 750, y: 120 },
        data: { label: "Read Replica 1", sublabel: "Cache-miss fallback", status: "healthy", handles: { left: true } },
      });
      nodes.push({
        id: "replica2", type: "databaseNode",
        position: { x: 750, y: 240 },
        data: { label: "Read Replica 2", sublabel: "Cache-miss fallback", status: "healthy", handles: { left: true } },
      });
      edges.push({ id: "e-db-r1", source: "db", target: "replica1", sourceHandle: "right", targetHandle: "left" });
      edges.push({ id: "e-db-r2", source: "db", target: "replica2", sourceHandle: "right", targetHandle: "left" });
    }

    return { nodes, edges };
  }, [scaleLevel]);
}

function ScalePlayground() {
  const [scaleLevel, setScaleLevel] = useState(0);
  const labels = ["1K URLs/day", "100K URLs/day", "10M URLs/day"];
  const descriptions = [
    "A single server with a database handles this easily. No caching needed — the DB sees only ~12 req/s. Simple and cheap.",
    "At 100K URLs/day you need a cache layer. Redis handles 95% of reads, so the DB only sees ~60 req/s. Add a second API server behind a load balancer for availability.",
    "At 10M URLs/day (Bitly-scale), you need a Redis cluster, auto-scaled stateless services, and read replicas. The primary DB only handles writes. Snowflake IDs eliminate write coordination.",
  ];
  const { nodes, edges } = useScaleNodes(scaleLevel);

  return (
    <Playground
      title="Scale Playground — Watch the Architecture Evolve"
      controls={false}
      canvasHeight="min-h-[360px]"
      hints={["Click the scale buttons to see how the architecture changes from 1K to 10M URLs per day"]}
      canvas={
        <div className="h-full flex flex-col">
          {/* Scale selector */}
          <div className="flex items-center gap-3 p-3 border-b border-violet-500/10">
            <span className="text-xs text-muted-foreground font-medium">Scale:</span>
            <div className="flex gap-1.5">
              {labels.map((label, i) => (
                <button
                  key={i}
                  onClick={() => setScaleLevel(i)}
                  className={cn(
                    "text-xs px-3 py-1.5 rounded-md border transition-all",
                    scaleLevel === i
                      ? "bg-violet-500/15 border-violet-500/30 text-violet-400"
                      : "bg-muted/20 border-border/50 text-muted-foreground/60 hover:text-muted-foreground"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1">
            <FlowDiagram
              nodes={nodes}
              edges={edges}
              minHeight={300}
              allowDrag={false}
              interactive={false}
            />
          </div>
        </div>
      }
      explanation={
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-violet-400">{labels[scaleLevel]}</h4>
            <p className="text-sm mt-2">{descriptions[scaleLevel]}</p>
          </div>
          <div className="space-y-2">
            {[
              [["API Servers", "1"], ["Cache", "None"], ["DB Load", "~12 req/s"], ["Cost", "~$50/mo"]],
              [["API Servers", "2"], ["Redis", "1 node"], ["DB Load", "~60 req/s"], ["Cost", "~$400/mo"]],
              [["API Servers", "10+"], ["Redis", "3-node cluster"], ["DB Load", "Writes only"], ["Cost", "~$5K/mo"]],
            ][scaleLevel].map(([label, value]) => (
              <Metric key={label} label={label} value={value} />
            ))}
          </div>
        </div>
      }
    />
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-xs py-1.5 px-2 rounded bg-muted/20">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono font-medium">{value}</span>
    </div>
  );
}

// ─── Collision Strategies ───────────────────────────────────────────────────

function CollisionStrategies() {
  const [strategy, setStrategy] = useState<"counter" | "hash" | "snowflake">("counter");

  const strategies = {
    counter: {
      title: "Counter-Based",
      pros: ["Zero collisions", "Sequential IDs", "Single INCR operation"],
      cons: ["Single point of failure", "IDs are guessable", "Requires coordination"],
      flow: ["INCR counter", "ID: 1000001", "Base62 encode", "4c93"],
    },
    hash: {
      title: "Hash-Based (MD5)",
      pros: ["No coordination", "Same URL = same hash", "Stateless"],
      cons: ["Collision risk when truncating", "Needs collision detection", "Extra DB lookup"],
      flow: ["MD5(url)", "a3f2b8c1d9...", "Take 7 chars", "a3f2b8c"],
    },
    snowflake: {
      title: "Snowflake ID",
      pros: ["No coordination", "Globally unique", "Encodes timestamp"],
      cons: ["Longer IDs (64-bit)", "Clock sync required", "More complex"],
      flow: ["Timestamp(41b)", "+Machine(10b)", "+Seq(12b)", "7bR9kL2"],
    },
  };

  const s = strategies[strategy];

  return (
    <div className="rounded-xl border border-border/50 bg-muted/5 p-5 space-y-4">
      <h3 className="text-sm font-semibold">ID Generation Strategies</h3>
      <div className="flex gap-2">
        {(Object.keys(strategies) as Array<keyof typeof strategies>).map((key) => (
          <button
            key={key}
            onClick={() => setStrategy(key)}
            className={cn(
              "text-xs px-3 py-1.5 rounded-md border transition-all",
              strategy === key
                ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                : "bg-muted/20 border-border/50 text-muted-foreground/60 hover:text-muted-foreground"
            )}
          >
            {strategies[key].title}
          </button>
        ))}
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {s.flow.map((step, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="bg-muted/30 border border-border/50 rounded-md px-2.5 py-1 text-[11px] font-mono">
              {step}
            </div>
            {i < s.flow.length - 1 && <ArrowRight className="size-3 text-muted-foreground/30 shrink-0" />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <p className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">Pros</p>
          {s.pros.map((p) => (
            <div key={p} className="flex items-start gap-1.5 text-xs text-muted-foreground">
              <span className="text-emerald-400 mt-0.5">+</span> {p}
            </div>
          ))}
        </div>
        <div className="space-y-1.5">
          <p className="text-[10px] font-semibold text-orange-400 uppercase tracking-wider">Cons</p>
          {s.cons.map((c) => (
            <div key={c} className="flex items-start gap-1.5 text-xs text-muted-foreground">
              <span className="text-orange-400 mt-0.5">-</span> {c}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Write Path Mini-flow ───────────────────────────────────────────────────

function WritePathFlow() {
  const sim = useSimulation({ intervalMs: 1200, maxSteps: 6 });
  const stages = [
    { name: "Receive URL", desc: "POST /api/shorten", time: "~1ms" },
    { name: "Generate ID", desc: "Snowflake: no collisions", time: "~0.5ms" },
    { name: "Base62 Encode", desc: "ID → short code", time: "~0.1ms" },
    { name: "Write DB", desc: "INSERT mapping", time: "~5ms" },
    { name: "Set Cache", desc: "Redis SET + TTL", time: "~0.5ms" },
    { name: "Return URL", desc: "sho.rt/14q60", time: "~0.1ms" },
  ];

  return (
    <div className="rounded-xl border border-border/50 bg-muted/5 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Write Path — Shortening a URL</h3>
        <button
          onClick={sim.isPlaying ? sim.pause : sim.step === 0 ? sim.play : sim.reset}
          className="text-xs px-3 py-1 rounded-md bg-violet-500/15 text-violet-400 border border-violet-500/20 hover:bg-violet-500/25 transition-colors"
        >
          {sim.isPlaying ? "Pause" : sim.step === 0 ? "Play" : "Reset"}
        </button>
      </div>
      <div className="space-y-1.5">
        {stages.map((stage, i) => {
          const done = i < sim.step;
          const active = i === sim.step && sim.isPlaying;
          return (
            <div key={stage.name} className={cn(
              "flex items-center gap-3 rounded-lg border px-3 py-2 transition-all duration-300",
              done ? "bg-emerald-500/8 border-emerald-500/20" : active ? "bg-blue-500/8 border-blue-500/20 ring-1 ring-blue-500/15" : "bg-muted/10 border-border/30 text-muted-foreground/40"
            )}>
              <span className={cn("text-xs font-medium w-24", done ? "text-emerald-400" : active ? "text-blue-400" : "")}>{stage.name}</span>
              <span className="flex-1 text-xs text-muted-foreground truncate">{done ? stage.desc : "---"}</span>
              <span className={cn("text-[10px] font-mono", done ? "text-muted-foreground" : "text-transparent")}>{stage.time}</span>
            </div>
          );
        })}
      </div>
      {sim.step >= 6 && (
        <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
          <CheckCircle2 className="size-3.5" /> Total: ~7ms
        </div>
      )}
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function UrlShortenerPage() {
  return (
    <div className="space-y-8">
      <TopicHero
        title="Design a URL Shortener"
        subtitle="Sounds simple until you realize a 100:1 read-to-write ratio means your naive design melts under read traffic. Services like Bitly handle 28 billion redirects per month — let's build one."
        difficulty="intermediate"
      />

      <WhyCare>
        bit.ly handles 600 million clicks per month. Behind that simple redirect is a fascinating system design problem.
      </WhyCare>

      <p className="text-sm text-muted-foreground">
        A URL shortener converts a long URL into a short alias like <code className="text-xs bg-muted px-1 rounded font-mono">sho.rt/x7Kq2</code>. The core challenge is generating a unique short code using <GlossaryTerm term="base62">Base62 encoding</GlossaryTerm>, storing the mapping in a database fronted by a <GlossaryTerm term="cache">cache</GlossaryTerm>, and handling the massive read traffic behind a <GlossaryTerm term="load balancer">load balancer</GlossaryTerm>. ID generation at scale often uses <GlossaryTerm term="snowflake">Snowflake IDs</GlossaryTerm> to avoid collisions without coordination. An <GlossaryTerm term="api gateway">API gateway</GlossaryTerm> handles <GlossaryTerm term="rate limiting">rate limiting</GlossaryTerm> at the edge.
      </p>

      {/* Main Architecture Playground */}
      <ArchitecturePlayground />

      {/* Base62 Encoding */}
      <Base62Playground />

      {/* ID Generation Strategies */}
      <CollisionStrategies />

      <AhaMoment
        question="Which approach do real URL shorteners use?"
        answer={
          <p>
            Bitly uses a Snowflake-style approach — each server generates IDs independently using
            timestamp + machine ID + sequence number. Redis INCR is popular for simpler services.
            Hash-based approaches are rare because collision handling adds unnecessary complexity.
          </p>
        }
      />

      {/* Write Path */}
      <WritePathFlow />

      {/* Read vs Write Chart */}
      <ReadWriteChart />

      <ConversationalCallout type="question">
        Why not just MD5-hash the URL? MD5 produces 128 bits — truncating to 7 characters creates
        collision risk. With 1 billion URLs, the birthday paradox gives you a ~50% chance of collision
        at just 77,000 entries with a 7-char hex space. A counter-based approach has zero collisions by design.
      </ConversationalCallout>

      {/* Scale Playground */}
      <ScalePlayground />

      {/* 301 vs 302 */}
      <div className="rounded-xl border border-border/50 bg-muted/5 p-5 space-y-4">
        <h3 className="text-sm font-semibold">301 vs 302 — The Analytics Trade-off</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4 space-y-1.5">
            <h4 className="text-xs font-bold text-blue-400">301 Permanent</h4>
            <p className="text-xs text-muted-foreground">Browser caches forever. Lowest latency for repeat visitors, but zero analytics and cannot change destination.</p>
          </div>
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-1.5">
            <h4 className="text-xs font-bold text-emerald-400">302 Temporary</h4>
            <p className="text-xs text-muted-foreground">Every click hits your server. Full analytics (clicks, geo, referrers). Can update destination. Used by Bitly.</p>
          </div>
        </div>
      </div>

      <AhaMoment
        question="How do you handle custom short codes (vanity URLs)?"
        answer={
          <p>
            Vanity URLs like <code className="text-xs bg-muted px-1 rounded font-mono">sho.rt/summer-sale</code> bypass
            the ID generator. The user picks the code, and you check if it exists in the DB.
            Reserve a separate namespace (8+ chars for vanity vs 7 for auto-generated) to avoid collisions.
          </p>
        }
      />

      <TopicQuiz
        questions={[
          {
            question: "Why do URL shorteners use Base62 encoding instead of Base16 (hex)?",
            options: [
              "Base62 is faster to compute",
              "Base62 produces shorter strings because it uses more characters per digit",
              "Base16 is not URL-safe",
              "Base62 prevents collisions"
            ],
            correctIndex: 1,
            explanation: "Base62 uses 62 URL-safe characters (a-z, A-Z, 0-9), so each character encodes more information than hex (16 chars). A 7-character Base62 string can represent 3.5 trillion unique URLs."
          },
          {
            question: "What is the main advantage of using a 302 redirect instead of a 301 for short URLs?",
            options: [
              "302 is faster for the end user",
              "302 uses less bandwidth",
              "302 lets you track click analytics because each click hits your server",
              "302 is more compatible with mobile browsers"
            ],
            correctIndex: 2,
            explanation: "A 301 (permanent) redirect is cached by the browser, so repeat visits bypass your server entirely. A 302 (temporary) redirect forces every click through your server, enabling full analytics (clicks, geo, referrers). Bitly uses 302 for this reason."
          },
          {
            question: "At Bitly-scale (10M URLs/day), why is a Redis cache critical?",
            options: [
              "Redis is the only database that supports Base62 encoding",
              "Redis handles 95% of reads so the database only sees 5% of traffic",
              "Redis automatically generates short URLs",
              "Redis is required for 301 redirects"
            ],
            correctIndex: 1,
            explanation: "URL shorteners are extremely read-heavy (100:1 read-to-write ratio). A Redis cache with a 95% hit rate means the database only handles 5% of read traffic, making the system manageable even at massive scale."
          }
        ]}
      />

      <KeyTakeaway
        points={[
          "URL shorteners are read-heavy (100:1 ratio). Design the read path first — cache everything in Redis.",
          "Base62 encoding of a unique numeric ID gives collision-free, URL-safe short codes. 7 characters = 3.5 trillion URLs.",
          "Three ID strategies: counter (simple), hash (stateless but collision-prone), Snowflake (distributed, production-grade).",
          "A Redis cache with 95% hit rate means your DB only handles 5% of traffic — easily manageable.",
          "Use 302 redirects if you need click analytics; 301 to minimize server load.",
          "At scale: Snowflake IDs, Redis cluster, auto-scaled stateless services, and read replicas.",
        ]}
      />
    </div>
  );
}
