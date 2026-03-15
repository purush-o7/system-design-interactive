"use client";

import { useState, useCallback, useMemo } from "react";
import { TopicHero } from "@/components/topic-hero";
import { WhyCare } from "@/components/why-care";
import { GlossaryTerm } from "@/components/glossary-term";
import { TopicQuiz } from "@/components/topic-quiz";
import { KeyTakeaway } from "@/components/key-takeaway";
import { AhaMoment } from "@/components/aha-moment";
import { Playground } from "@/components/playground";
import { FlowDiagram, type FlowNode, type FlowEdge } from "@/components/flow-diagram";
import { LiveChart } from "@/components/live-chart";
import { useSimulation } from "@/hooks/use-simulation";
import { SimulationControls } from "@/components/simulation-controls";
import { cn } from "@/lib/utils";
import { Skull, Zap, ShieldAlert, MousePointerClick } from "lucide-react";

/* ── Types ── */
type Algorithm = "Round Robin" | "Least Connections" | "IP Hash";
type ServerState = { id: string; load: number; alive: boolean; totalServed: number };

/* ── Helpers ── */
function pickServer(algo: Algorithm, servers: ServerState[], tick: number): number {
  const alive = servers.map((s, i) => (s.alive ? i : -1)).filter((i) => i >= 0);
  if (alive.length === 0) return -1;
  if (algo === "Round Robin") return alive[tick % alive.length];
  if (algo === "Least Connections") {
    let minIdx = alive[0];
    for (const i of alive) {
      if (servers[i].load < servers[minIdx].load) minIdx = i;
    }
    return minIdx;
  }
  // IP Hash — deterministic per "client"
  const hash = ((tick * 2654435761) >>> 0) % alive.length;
  return alive[hash];
}

/* ── Single-server failure demo (the "before") ── */
function SingleServerDemo() {
  const sim = useSimulation({ intervalMs: 400, maxSteps: 30 });
  const load = Math.min(sim.tick * 8, 100);
  const crashed = load >= 100;

  const nodes: FlowNode[] = useMemo(() => {
    const clients: FlowNode[] = Array.from({ length: 3 }, (_, i) => ({
      id: `client-${i}`,
      type: "clientNode" as const,
      position: { x: 60 + i * 180, y: 10 },
      data: {
        label: `Client ${i + 1}`,
        sublabel: sim.tick > 0 ? "sending..." : "idle",
        status: "healthy" as const,
        handles: { bottom: true },
      },
    }));
    return [
      ...clients,
      {
        id: "server",
        type: "serverNode" as const,
        position: { x: 200, y: 180 },
        data: {
          label: "Single Server",
          sublabel: crashed ? "CRASHED" : `${load}% CPU`,
          status: crashed ? "unhealthy" : load > 70 ? "warning" : load > 0 ? "healthy" : "idle",
          metrics: [
            { label: "Load", value: `${load}%` },
            { label: "Queue", value: `${Math.max(0, sim.tick - 5)}` },
          ],
          handles: { top: true },
        },
      },
    ];
  }, [sim.tick, load, crashed]);

  const edges: FlowEdge[] = useMemo(
    () =>
      Array.from({ length: 3 }, (_, i) => ({
        id: `e-c${i}-s`,
        source: `client-${i}`,
        target: "server",
        animated: sim.tick > 0 && !crashed,
      })),
    [sim.tick, crashed]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-4 pt-4">
        <Skull className="size-5 text-red-400" />
        <h3 className="text-base font-semibold">The Problem: One Server Gets Everything</h3>
      </div>
      <p className="text-sm text-muted-foreground px-4">
        Three clients all pointing at one server. Hit <strong>Play</strong> and watch the <GlossaryTerm term="latency">latency</GlossaryTerm> spike as it melts.
      </p>
      <div className="px-4">
        <FlowDiagram nodes={nodes} edges={edges} minHeight={280} interactive={false} allowDrag={false} />
      </div>
      {crashed && (
        <div className="mx-4 rounded-lg border border-red-500/30 bg-red-500/5 p-3 text-sm text-red-400 flex items-center gap-2">
          <ShieldAlert className="size-4 shrink-0" />
          Server crashed at 100% load. With a <GlossaryTerm term="load balancer">load balancer</GlossaryTerm>, traffic would be distributed across all servers.
        </div>
      )}
      <div className="px-4 pb-4">
        <SimulationControls state={sim} showSpeed />
      </div>
    </div>
  );
}

/* ── Main load balancer playground ── */
function LoadBalancerPlayground() {
  const [algo, setAlgo] = useState<Algorithm>("Round Robin");
  const [servers, setServers] = useState<ServerState[]>([
    { id: "s0", load: 0, alive: true, totalServed: 0 },
    { id: "s1", load: 0, alive: true, totalServed: 0 },
    { id: "s2", load: 0, alive: true, totalServed: 0 },
    { id: "s3", load: 0, alive: true, totalServed: 0 },
  ]);
  const [latencyLog, setLatencyLog] = useState<{ t: number; latency: number; errors: number }[]>([]);
  const [loadLog, setLoadLog] = useState<{ t: number; s0: number; s1: number; s2: number; s3: number }[]>([]);

  const handleTick = useCallback(
    (tick: number) => {
      setServers((prev) => {
        const next = prev.map((s) => ({
          ...s,
          load: s.alive ? Math.max(0, s.load - 2) : 0,
        }));
        const idx = pickServer(algo, next, tick);
        if (idx >= 0) {
          next[idx].load = Math.min(next[idx].load + 5, 100);
          next[idx].totalServed += 1;
        }
        return next;
      });
      setServers((current) => {
        const aliveCount = current.filter((s) => s.alive).length;
        const avgLoad = aliveCount > 0
          ? Math.round(current.filter((s) => s.alive).reduce((a, s) => a + s.load, 0) / aliveCount)
          : 0;
        const baseLatency = 20;
        const loadLatency = avgLoad > 70 ? (avgLoad - 70) * 3 : 0;
        const errorCount = current.filter((s) => !s.alive).length;
        const latency = baseLatency + loadLatency + (aliveCount === 0 ? 500 : 0);

        setLatencyLog((prev) =>
          [...prev, { t: tick, latency, errors: errorCount }].slice(-30)
        );
        setLoadLog((prev) =>
          [
            ...prev,
            {
              t: tick,
              s0: current[0].load,
              s1: current[1].load,
              s2: current[2].load,
              s3: current[3].load,
            },
          ].slice(-30)
        );
        return current;
      });
    },
    [algo]
  );

  const handleReset = useCallback(() => {
    setServers([
      { id: "s0", load: 0, alive: true, totalServed: 0 },
      { id: "s1", load: 0, alive: true, totalServed: 0 },
      { id: "s2", load: 0, alive: true, totalServed: 0 },
      { id: "s3", load: 0, alive: true, totalServed: 0 },
    ]);
    setLatencyLog([]);
    setLoadLog([]);
  }, []);

  const sim = useSimulation({ intervalMs: 600, onTick: handleTick, onReset: handleReset });

  const toggleServer = useCallback((idx: number) => {
    setServers((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], alive: !next[idx].alive, load: 0 };
      return next;
    });
  }, []);

  const aliveCount = servers.filter((s) => s.alive).length;

  /* ── FlowDiagram nodes ── */
  const flowNodes: FlowNode[] = useMemo(() => {
    const clients: FlowNode[] = Array.from({ length: 3 }, (_, i) => ({
      id: `client-${i}`,
      type: "clientNode" as const,
      position: { x: 60 + i * 180, y: 10 },
      data: {
        label: `Client ${i + 1}`,
        status: "healthy" as const,
        handles: { bottom: true },
      },
    }));

    const lb: FlowNode = {
      id: "lb",
      type: "loadBalancerNode" as const,
      position: { x: 180, y: 120 },
      data: {
        label: "Load Balancer",
        sublabel: algo,
        status: aliveCount > 0 ? "healthy" : "unhealthy",
        metrics: [
          { label: "Algo", value: algo.slice(0, 8) },
          { label: "Pool", value: `${aliveCount}/4` },
        ],
        handles: { top: true, bottom: true },
      },
    };

    const serverNodes: FlowNode[] = servers.map((s, i) => ({
      id: s.id,
      type: "serverNode" as const,
      position: { x: i * 140, y: 260 },
      data: {
        label: `Server ${i + 1}`,
        sublabel: s.alive ? `${s.load}% load` : "DEAD -- click to revive",
        status: !s.alive
          ? ("unhealthy" as const)
          : s.load > 70
            ? ("warning" as const)
            : s.load > 0
              ? ("healthy" as const)
              : ("idle" as const),
        metrics: [
          { label: "Served", value: `${s.totalServed}` },
          { label: "CPU", value: s.alive ? `${s.load}%` : "--" },
        ],
        handles: { top: true },
      },
    }));

    return [...clients, lb, ...serverNodes];
  }, [servers, algo, aliveCount]);

  const flowEdges: FlowEdge[] = useMemo(() => {
    const clientToLb: FlowEdge[] = Array.from({ length: 3 }, (_, i) => ({
      id: `e-c${i}-lb`,
      source: `client-${i}`,
      target: "lb",
      animated: sim.isPlaying,
    }));
    const lbToServers: FlowEdge[] = servers.map((s, i) => ({
      id: `e-lb-s${i}`,
      source: "lb",
      target: s.id,
      animated: sim.isPlaying && s.alive,
      style: s.alive ? undefined : { opacity: 0.15, strokeDasharray: "5 5" },
    }));
    return [...clientToLb, ...lbToServers];
  }, [servers, sim.isPlaying]);

  /* ── The diagram canvas ── */
  const canvas = (
    <div className="flex flex-col h-full">
      <FlowDiagram
        nodes={flowNodes}
        edges={flowEdges}
        minHeight={360}
        interactive={false}
        allowDrag={false}
      />
      {/* Clickable server kill buttons */}
      <div className="flex justify-center gap-2 px-4 py-3 border-t border-violet-500/10 bg-violet-500/[0.02]">
        {servers.map((s, i) => (
          <button
            key={s.id}
            onClick={() => toggleServer(i)}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5",
              s.alive
                ? "bg-emerald-500/10 text-emerald-400 hover:bg-red-500/15 hover:text-red-400 border border-emerald-500/20"
                : "bg-red-500/10 text-red-400 hover:bg-emerald-500/15 hover:text-emerald-400 border border-red-500/20"
            )}
          >
            <MousePointerClick className="size-3" />
            {s.alive ? `Kill S${i + 1}` : `Revive S${i + 1}`}
          </button>
        ))}
      </div>
    </div>
  );

  /* ── Explanation sidebar (reactive) ── */
  const explanation = (
    <div className="space-y-4">
      {/* Algorithm selector */}
      <div>
        <p className="text-xs font-semibold text-foreground mb-2">Algorithm</p>
        <div className="flex flex-wrap gap-1.5">
          {(["Round Robin", "Least Connections", "IP Hash"] as Algorithm[]).map((a) => (
            <button
              key={a}
              onClick={() => setAlgo(a)}
              className={cn(
                "px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors",
                algo === a
                  ? "bg-violet-500/20 text-violet-400 border border-violet-500/30"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted/70 border border-transparent"
              )}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      {/* Server stats */}
      <div>
        <p className="text-xs font-semibold text-foreground mb-2">Server Status</p>
        <div className="grid grid-cols-2 gap-1.5">
          {servers.map((s, i) => (
            <div
              key={s.id}
              className={cn(
                "rounded-md border px-2 py-1.5 text-[11px] transition-all",
                !s.alive
                  ? "border-red-500/30 bg-red-500/5 text-red-400"
                  : s.load > 70
                    ? "border-amber-500/30 bg-amber-500/5 text-amber-400"
                    : "border-border/30 bg-muted/20 text-muted-foreground"
              )}
            >
              <span className="font-medium">S{i + 1}</span>
              <span className="ml-1.5 font-mono">
                {s.alive ? `${s.load}%` : "dead"}
              </span>
              <span className="block text-[10px] opacity-60">{s.totalServed} served</span>
            </div>
          ))}
        </div>
      </div>

      {/* Dynamic insight */}
      <div className="rounded-md bg-muted/30 border border-border/20 p-2.5 text-[11px] leading-relaxed">
        {aliveCount === 0 ? (
          <span className="text-red-400 font-medium">
            All servers down. Every request fails. Click a button to revive one.
          </span>
        ) : aliveCount < 4 ? (
          <span>
            <span className="text-amber-400 font-medium">{4 - aliveCount} server(s) down.</span>{" "}
            The load balancer automatically redistributes traffic to the {aliveCount} remaining
            server(s). Notice how {algo === "Least Connections" ? "least connections adapts fastest" : "the load shifts"}.
          </span>
        ) : algo === "Round Robin" ? (
          <span>
            Round Robin cycles through servers in order: 1, 2, 3, 4, 1, 2, 3, 4...
            Simple and predictable, but blind to actual server load.
            Try killing a server to see automatic failover.
          </span>
        ) : algo === "Least Connections" ? (
          <span>
            Least Connections always picks the server with the fewest active requests.
            It adapts in real time -- kill a server and watch load rebalance smoothly.
          </span>
        ) : (
          <span>
            IP Hash deterministically maps each client to a server. Same client always
            hits the same backend -- great for session affinity. Kill a server and notice
            some clients get remapped.
          </span>
        )}
      </div>

      {/* Tip */}
      <div className="rounded-md border border-cyan-500/20 bg-cyan-500/5 p-2.5 text-[11px]">
        <Zap className="size-3 inline text-cyan-400 mr-1" />
        <strong className="text-cyan-400">Try this:</strong> Start the simulation, kill
        Server 2, watch the latency chart spike, then revive it. The load balancer heals automatically.
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <Playground
        title="Load Balancer Playground"
        simulation={sim}
        canvas={canvas}
        explanation={explanation}
        canvasHeight="min-h-[440px]"
        hints={["Kill a server and watch traffic reroute automatically"]}
      />

      {/* Charts below the playground */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border/30 bg-muted/5 p-4 space-y-2">
          <h4 className="text-sm font-semibold">Server Load Distribution</h4>
          <p className="text-[11px] text-muted-foreground">CPU load per server over time</p>
          <LiveChart
            type="area"
            data={loadLog.length > 0 ? loadLog : [{ t: 0, s0: 0, s1: 0, s2: 0, s3: 0 }]}
            dataKeys={{
              x: "t",
              y: ["s0", "s1", "s2", "s3"],
              label: ["Server 1", "Server 2", "Server 3", "Server 4"],
            }}
            unit="%"
            height={180}
            referenceLines={[{ y: 80, label: "Danger Zone", color: "#ef4444" }]}
          />
        </div>
        <div className="rounded-xl border border-border/30 bg-muted/5 p-4 space-y-2">
          <h4 className="text-sm font-semibold">Response Latency</h4>
          <p className="text-[11px] text-muted-foreground">Latency rises when servers are overloaded or dead</p>
          <LiveChart
            type="latency"
            data={latencyLog.length > 0 ? latencyLog : [{ t: 0, latency: 20, errors: 0 }]}
            dataKeys={{
              x: "t",
              y: ["latency", "errors"],
              label: ["Latency", "Dead Servers"],
            }}
            unit="ms"
            height={180}
            referenceLines={[{ y: 100, label: "SLA Threshold", color: "#f59e0b" }]}
          />
        </div>
      </div>
    </div>
  );
}

/* ── Layer 4 vs Layer 7 mini playground ── */
function LayerComparison() {
  const [activeLayer, setActiveLayer] = useState<4 | 7>(7);

  const l4Nodes: FlowNode[] = [
    {
      id: "client-l4", type: "clientNode", position: { x: 160, y: 10 },
      data: { label: "TCP Connection", sublabel: "IP + Port only", status: "healthy", handles: { bottom: true } },
    },
    {
      id: "lb-l4", type: "loadBalancerNode", position: { x: 140, y: 110 },
      data: {
        label: "L4 Load Balancer",
        sublabel: "AWS NLB / HAProxy TCP",
        status: "healthy",
        metrics: [{ label: "Latency", value: "~0.1ms" }],
        handles: { top: true, bottom: true },
      },
    },
    {
      id: "s1-l4", type: "serverNode", position: { x: 40, y: 220 },
      data: { label: "Server 1", status: "healthy", handles: { top: true } },
    },
    {
      id: "s2-l4", type: "serverNode", position: { x: 280, y: 220 },
      data: { label: "Server 2", status: "healthy", handles: { top: true } },
    },
  ];

  const l7Nodes: FlowNode[] = [
    {
      id: "client-l7", type: "clientNode", position: { x: 160, y: 10 },
      data: { label: "HTTP Request", sublabel: "GET /api/users", status: "healthy", handles: { bottom: true } },
    },
    {
      id: "lb-l7", type: "loadBalancerNode", position: { x: 120, y: 110 },
      data: {
        label: "L7 Load Balancer",
        sublabel: "AWS ALB / NGINX",
        status: "healthy",
        metrics: [
          { label: "Latency", value: "~1-5ms" },
          { label: "Routes", value: "URL+Headers" },
        ],
        handles: { top: true, bottom: true },
      },
    },
    {
      id: "api-l7", type: "serverNode", position: { x: 20, y: 230 },
      data: { label: "API Servers", sublabel: "/api/*", status: "healthy", handles: { top: true } },
    },
    {
      id: "static-l7", type: "serverNode", position: { x: 280, y: 230 },
      data: { label: "Static/CDN", sublabel: "/static/*", status: "healthy", handles: { top: true } },
    },
  ];

  const nodes = activeLayer === 4 ? l4Nodes : l7Nodes;
  const idPrefix = activeLayer === 4 ? "l4" : "l7";
  const edges: FlowEdge[] = [
    { id: `e-c-lb-${idPrefix}`, source: `client-${idPrefix}`, target: `lb-${idPrefix}`, animated: true },
    {
      id: `e-lb-s1-${idPrefix}`,
      source: `lb-${idPrefix}`,
      target: activeLayer === 4 ? "s1-l4" : "api-l7",
      animated: true,
    },
    {
      id: `e-lb-s2-${idPrefix}`,
      source: `lb-${idPrefix}`,
      target: activeLayer === 4 ? "s2-l4" : "static-l7",
      animated: true,
    },
  ];

  return (
    <div className="rounded-xl border border-border/30 bg-muted/5 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/20">
        <h3 className="text-sm font-semibold">Layer 4 vs Layer 7</h3>
        <div className="flex gap-1.5">
          {([4, 7] as const).map((l) => (
            <button
              key={l}
              onClick={() => setActiveLayer(l)}
              className={cn(
                "px-3 py-1 rounded-md text-xs font-medium transition-colors",
                activeLayer === l
                  ? "bg-violet-500/20 text-violet-400"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted/60"
              )}
            >
              Layer {l}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-col lg:flex-row">
        <div className="flex-[3]">
          <FlowDiagram nodes={nodes} edges={edges} minHeight={310} interactive={false} allowDrag={false} />
        </div>
        <div className="flex-[2] border-t lg:border-t-0 lg:border-l border-border/10 p-4 text-sm text-muted-foreground space-y-3">
          {activeLayer === 4 ? (
            <>
              <p>
                <strong className="text-foreground">Layer 4</strong> operates at the TCP level. It sees only
                source/destination IP and port. It cannot inspect URLs, headers, or cookies.
              </p>
              <p>
                <strong className="text-emerald-400">Pros:</strong> Blazing fast (~0.1ms overhead), handles millions
                of connections. Use for WebSockets, gaming, or raw TCP.
              </p>
              <p>
                <strong className="text-red-400">Cons:</strong> Cannot do content-based routing. All servers must
                serve the same content.
              </p>
              <p className="text-xs font-mono text-muted-foreground/60">Examples: AWS NLB, HAProxy (TCP mode)</p>
            </>
          ) : (
            <>
              <p>
                <strong className="text-foreground">Layer 7</strong> operates at the HTTP level. It can read
                the full URL path, headers, cookies, and request body to make routing decisions.
              </p>
              <p>
                <strong className="text-emerald-400">Pros:</strong> Route <code className="text-xs bg-muted px-1 rounded">/api/*</code>{" "}
                to API servers, <code className="text-xs bg-muted px-1 rounded">/static/*</code> to CDN.
                Session affinity via cookies. SSL termination.
              </p>
              <p>
                <strong className="text-red-400">Cons:</strong> 1-5ms overhead. Must decrypt TLS to inspect traffic.
              </p>
              <p className="text-xs font-mono text-muted-foreground/60">Examples: AWS ALB, NGINX, Envoy</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function LoadBalancingPage() {
  return (
    <div className="space-y-8">
      <TopicHero
        title="Load Balancing"
        subtitle="Stop sending all your traffic to one server while three others sit idle. A load balancer is the traffic cop that makes horizontal scaling actually work."
        difficulty="beginner"
      />

      <WhyCare>
        Netflix handles 15,000+ requests per second per server. Without load balancing, a single server would crash in milliseconds during peak hours.
      </WhyCare>

      {/* Act 1: The failure */}
      <section className="space-y-2">
        <SingleServerDemo />
      </section>

      {/* Act 2: The interactive playground */}
      <section className="space-y-2">
        <LoadBalancerPlayground />
      </section>

      {/* Aha moments */}
      <AhaMoment
        question="What are sticky sessions, and why are they a classic interview trade-off?"
        answer={
          <span>
            Sticky sessions route all requests from the same client to the same backend. Necessary when
            servers store session state in memory (shopping carts, WebSocket connections). The trade-off:
            they break even distribution -- a &quot;hot&quot; user can overload one server while others idle.
            If the pinned server dies, the session is lost. The fix: externalize state to Redis or a
            database so any server can handle any request. In interviews say: &quot;Sticky sessions are a
            symptom of stateful servers. The real solution is making servers stateless.&quot;
          </span>
        }
      />

      {/* Act 3: Layer comparison */}
      <section>
        <LayerComparison />
      </section>

      <AhaMoment
        question="Why not just use DNS round-robin instead of a dedicated load balancer?"
        answer={
          <span>
            <GlossaryTerm term="dns">DNS</GlossaryTerm> round-robin has no health checks -- it keeps sending traffic to dead servers. Clients
            cache DNS for minutes to hours, so distribution is wildly uneven. You cannot remove a failing
            server quickly. A real load balancer checks health every 5-10 seconds, removes unhealthy
            backends instantly, and can route based on content, headers, or cookies.
          </span>
        }
      />

      <AhaMoment
        question="What happens to in-flight requests when a server goes down?"
        answer={
          <span>
            With Layer 7 load balancing, the LB (also called a <GlossaryTerm term="reverse proxy">reverse proxy</GlossaryTerm>) detects a failed connection and <strong>retries</strong> the
            request on a different backend -- the client never knows anything went wrong. This is called
            &quot;connection draining&quot; or &quot;retry on next upstream.&quot; NGINX does this
            automatically with <code className="text-xs bg-muted px-1 rounded font-mono">proxy_next_upstream</code>.
          </span>
        }
      />

      <TopicQuiz
        questions={[
          {
            question: "What happens when a server behind a load balancer crashes?",
            options: [
              "All traffic is lost until the server restarts",
              "The load balancer detects the failure and routes traffic to healthy servers",
              "Users must manually switch to a different server",
              "The load balancer crashes too",
            ],
            correctIndex: 1,
            explanation: "Load balancers perform health checks every few seconds. When a server fails, it is automatically removed from the pool and traffic is redirected to healthy servers.",
          },
          {
            question: "Which load balancing algorithm is best when requests have very different processing times?",
            options: [
              "Round Robin",
              "IP Hash",
              "Least Connections",
              "Random",
            ],
            correctIndex: 2,
            explanation: "Least Connections routes each new request to the server with the fewest active connections, which naturally adapts to servers handling slow vs fast requests.",
          },
          {
            question: "What is the key difference between Layer 4 and Layer 7 load balancing?",
            options: [
              "Layer 4 is newer and always better",
              "Layer 7 can inspect HTTP content (URLs, headers, cookies) while Layer 4 only sees IP and port",
              "Layer 4 supports more servers than Layer 7",
              "Layer 7 only works with HTTPS traffic",
            ],
            correctIndex: 1,
            explanation: "Layer 4 operates at TCP level (fast but content-blind), while Layer 7 operates at HTTP level and can make routing decisions based on URL paths, headers, and cookies.",
          },
        ]}
      />

      <KeyTakeaway
        points={[
          "A load balancer distributes traffic across multiple servers, enabling horizontal scaling and automatic fault tolerance.",
          "Round Robin is simplest for uniform workloads. Least Connections handles variable request durations. IP Hash provides session affinity.",
          "Health checks are the load balancer's superpower -- it detects and removes failed servers in seconds, not minutes.",
          "Layer 4 (TCP) is faster but content-blind. Layer 7 (HTTP) can route by URL, headers, and cookies -- use it for most web applications.",
          "Always deploy load balancers in redundant pairs or use managed services (AWS ALB/NLB) to avoid making them a single point of failure.",
        ]}
      />
    </div>
  );
}
