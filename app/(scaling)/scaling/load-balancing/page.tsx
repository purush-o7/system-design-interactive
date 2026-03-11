"use client";

import { useState, useEffect, useCallback } from "react";
import { TopicHero } from "@/components/topic-hero";
import { FailureScenario } from "@/components/failure-scenario";
import { WhyItBreaks } from "@/components/why-it-breaks";
import { ConceptVisualizer } from "@/components/concept-visualizer";
import { CorrectApproach } from "@/components/correct-approach";
import { KeyTakeaway } from "@/components/key-takeaway";
import { AnimatedFlow } from "@/components/animated-flow";
import { ServerNode } from "@/components/server-node";
import { InteractiveDemo } from "@/components/interactive-demo";
import { MetricCounter } from "@/components/metric-counter";
import { AhaMoment } from "@/components/aha-moment";
import { ConversationalCallout } from "@/components/conversational-callout";
import { BeforeAfter } from "@/components/before-after";
import { ScaleSimulator } from "@/components/scale-simulator";
import { cn } from "@/lib/utils";
import { ArrowDown, Zap, Heart, ShieldCheck, Layers } from "lucide-react";

/* ── Live Request Distribution Visualization ── */
function LiveRequestDistribution() {
  const [requests, setRequests] = useState<{ id: number; server: number; y: number }[]>([]);
  const [serverLoads, setServerLoads] = useState([0, 0, 0, 0]);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setTick((prev) => {
        const next = prev + 1;
        const targetServer = next % 4;
        setServerLoads((loads) => {
          const newLoads = [...loads];
          newLoads[targetServer] = Math.min(newLoads[targetServer] + 1, 15);
          // Slowly drain all servers
          return newLoads.map((l, i) =>
            i === targetServer ? l : Math.max(0, l - (next % 3 === 0 ? 1 : 0))
          );
        });
        setRequests((prev) => {
          const newReqs = [
            ...prev.filter((r) => r.y < 100),
            { id: next, server: targetServer, y: 0 },
          ].slice(-8);
          return newReqs.map((r) => ({ ...r, y: r.y + 25 }));
        });
        return next;
      });
    }, 600);
    return () => clearInterval(t);
  }, []);

  const maxLoad = Math.max(...serverLoads, 1);

  return (
    <div className="space-y-4">
      {/* Load Balancer */}
      <div className="flex justify-center">
        <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 px-6 py-2 flex items-center gap-2">
          <Layers className="size-4 text-cyan-400" />
          <span className="text-xs font-semibold text-cyan-400">Load Balancer</span>
          <span className="text-[10px] text-muted-foreground font-mono ml-2">Round Robin</span>
        </div>
      </div>

      {/* Animated arrows */}
      <div className="flex justify-center gap-[72px]">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col items-center">
            <ArrowDown
              className={cn(
                "size-4 transition-all duration-200",
                tick % 4 === i ? "text-cyan-400 scale-125" : "text-muted-foreground/20"
              )}
            />
          </div>
        ))}
      </div>

      {/* Servers with load bars */}
      <div className="grid grid-cols-4 gap-3">
        {serverLoads.map((load, i) => (
          <div key={i} className="space-y-2">
            <ServerNode
              type="server"
              label={`Server ${i + 1}`}
              sublabel={`${load} active`}
              status={load > 10 ? "warning" : load > 0 ? "healthy" : "idle"}
            />
            <div className="w-full bg-muted/30 rounded-full h-1.5">
              <div
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  load / maxLoad > 0.8 ? "bg-amber-500" : "bg-emerald-500"
                )}
                style={{ width: `${Math.max((load / 15) * 100, 2)}%` }}
              />
            </div>
            <p className="text-[10px] text-center font-mono text-muted-foreground">
              {Math.round((load / 15) * 100)}%
            </p>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-muted-foreground/60 text-center">
        Watch requests flow through the load balancer to each server in round-robin order
      </p>
    </div>
  );
}

/* ── Algorithm Comparison Simulator ── */
const algorithms = ["Round Robin", "Weighted Round Robin", "Least Connections", "IP Hash"] as const;
type Algorithm = (typeof algorithms)[number];

function simulateDistribution(algorithm: Algorithm, requestCount: number) {
  const servers = [
    { load: 0, weight: 5, capacity: 100 },
    { load: 0, weight: 3, capacity: 100 },
    { load: 0, weight: 1, capacity: 100 },
    { load: 0, weight: 1, capacity: 100 },
  ];

  // Simulate variable request durations
  const durations = Array.from({ length: requestCount }, (_, i) =>
    i % 7 === 0 ? 5 : i % 5 === 0 ? 3 : 1
  );

  for (let i = 0; i < requestCount; i++) {
    let targetIdx = 0;

    if (algorithm === "Round Robin") {
      targetIdx = i % 4;
    } else if (algorithm === "Weighted Round Robin") {
      // weights: 5, 3, 1, 1 = total 10
      const slot = i % 10;
      if (slot < 5) targetIdx = 0;
      else if (slot < 8) targetIdx = 1;
      else if (slot < 9) targetIdx = 2;
      else targetIdx = 3;
    } else if (algorithm === "Least Connections") {
      targetIdx = servers.reduce((minIdx, s, idx) =>
        s.load < servers[minIdx].load ? idx : minIdx, 0
      );
    } else {
      // IP Hash
      const hash = ((i * 2654435761) >>> 0) % 4;
      targetIdx = hash;
    }

    servers[targetIdx].load += durations[i];
  }

  return servers;
}

/* ── Algorithm Detail Cards ── */
function AlgorithmCard({
  name,
  desc,
  pros,
  cons,
  useCase,
  isActive,
  onClick,
}: {
  name: string;
  desc: string;
  pros: string;
  cons: string;
  useCase: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "text-left rounded-lg border p-3 transition-all",
        isActive
          ? "border-primary/40 bg-primary/5 ring-1 ring-primary/20"
          : "border-border/50 bg-muted/10 hover:bg-muted/20"
      )}
    >
      <h4 className="text-xs font-semibold mb-1">{name}</h4>
      <p className="text-[11px] text-muted-foreground leading-relaxed">{desc}</p>
      <div className="mt-2 space-y-0.5">
        <p className="text-[10px]">
          <span className="text-emerald-400">+</span>{" "}
          <span className="text-muted-foreground">{pros}</span>
        </p>
        <p className="text-[10px]">
          <span className="text-red-400">-</span>{" "}
          <span className="text-muted-foreground">{cons}</span>
        </p>
        <p className="text-[10px]">
          <span className="text-blue-400">Use:</span>{" "}
          <span className="text-muted-foreground">{useCase}</span>
        </p>
      </div>
    </button>
  );
}

/* ── Health Check Visualization ── */
function HealthCheckViz() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % 8), 1200);
    return () => clearInterval(t);
  }, []);

  const servers = [
    { label: "S1", healthy: true },
    { label: "S2", healthy: step < 3 || step > 5 }, // goes down at step 3, recovers at step 6
    { label: "S3", healthy: true },
    { label: "S4", healthy: true },
  ];

  const healthyCount = servers.filter((s) => s.healthy).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono text-muted-foreground">
          Health Check #{step + 1}
          <span className="ml-2 text-muted-foreground/50">(every 10s)</span>
        </span>
        <span className={cn(
          "text-[10px] font-mono px-2 py-0.5 rounded-full",
          healthyCount === 4
            ? "bg-emerald-500/10 text-emerald-400"
            : "bg-amber-500/10 text-amber-400"
        )}>
          {healthyCount}/4 healthy
        </span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {servers.map((s) => (
          <div key={s.label} className="text-center space-y-1.5">
            <ServerNode
              type="server"
              label={s.label}
              sublabel={s.healthy ? "200 OK" : "Timeout"}
              status={s.healthy ? "healthy" : "unhealthy"}
            />
            <div className={cn(
              "text-[10px] font-mono rounded px-1.5 py-0.5",
              s.healthy
                ? "text-emerald-400 bg-emerald-500/10"
                : "text-red-400 bg-red-500/10"
            )}>
              {s.healthy ? "IN POOL" : "REMOVED"}
            </div>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-muted-foreground/60">
        {step >= 3 && step <= 5
          ? "Server S2 failed health check -- removed from pool. Traffic redistributed to healthy servers."
          : step > 5
          ? "S2 passed 3 consecutive health checks -- added back to pool."
          : "All servers healthy. Load balancer distributes normally."}
      </p>
    </div>
  );
}

/* ── Layer 4 vs Layer 7 Comparison ── */
function LayerComparisonViz() {
  const [activeLayer, setActiveLayer] = useState<4 | 7>(7);

  const layers = {
    4: {
      name: "Layer 4 (Transport)",
      inspects: ["Source IP", "Dest IP", "Source Port", "Dest Port"],
      cannot: ["URL path", "HTTP headers", "Cookies", "Request body"],
      speed: "~0.1ms added latency",
      example: "AWS NLB, HAProxy (TCP mode)",
    },
    7: {
      name: "Layer 7 (Application)",
      inspects: ["Full URL path", "HTTP headers", "Cookies", "Request body", "Host header"],
      cannot: [],
      speed: "~1-5ms added latency",
      example: "AWS ALB, NGINX, HAProxy (HTTP mode)",
    },
  };

  const active = layers[activeLayer];

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {([4, 7] as const).map((l) => (
          <button
            key={l}
            onClick={() => setActiveLayer(l)}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
              activeLayer === l
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            Layer {l}
          </button>
        ))}
      </div>
      <div className="rounded-lg border border-border/50 p-3 space-y-2">
        <h4 className="text-xs font-semibold">{active.name}</h4>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-[10px] text-emerald-400 mb-1">Can inspect:</p>
            {active.inspects.map((item) => (
              <p key={item} className="text-[10px] text-muted-foreground font-mono">
                {item}
              </p>
            ))}
          </div>
          {active.cannot.length > 0 && (
            <div>
              <p className="text-[10px] text-red-400 mb-1">Cannot see:</p>
              {active.cannot.map((item) => (
                <p key={item} className="text-[10px] text-muted-foreground font-mono">
                  {item}
                </p>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/30">
          <span className="text-[10px] text-muted-foreground">
            <Zap className="size-3 inline mr-1 text-amber-400" />
            {active.speed}
          </span>
          <span className="text-[10px] text-muted-foreground font-mono">{active.example}</span>
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground/60">
        {activeLayer === 4
          ? "Fastest option. Use when you just need to distribute TCP connections and don't need content-based routing."
          : "Most flexible. Route /api/* to API servers, /static/* to CDN, and inspect cookies for session affinity."}
      </p>
    </div>
  );
}

export default function LoadBalancingPage() {
  const [algo, setAlgo] = useState<Algorithm>("Round Robin");
  const [requestCount, setRequestCount] = useState(40);

  return (
    <div className="space-y-8">
      <TopicHero
        title="Load Balancing"
        subtitle="Stop sending all your traffic to one server while three others sit idle. A load balancer is the traffic cop that makes horizontal scaling actually work."
        difficulty="beginner"
      />

      <FailureScenario title="Four servers, but only one does all the work">
        <p className="text-sm text-muted-foreground">
          You horizontally scaled to four servers, but you made one fatal mistake: your DNS A-record
          still points to a single IP. <strong className="text-red-400">One server gets 100% of the traffic</strong> while
          the other three sit completely idle. The overloaded server crashes under load,
          and your &quot;highly available&quot; setup is down. You paid for 4x the capacity and got none
          of the benefit.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <ServerNode type="server" label="Server 1" sublabel="100% load" status="unhealthy" />
          <ServerNode type="server" label="Server 2" sublabel="0% load" status="idle" />
          <ServerNode type="server" label="Server 3" sublabel="0% load" status="idle" />
          <ServerNode type="server" label="Server 4" sublabel="0% load" status="idle" />
        </div>
      </FailureScenario>

      <WhyItBreaks title="Multiple servers without distribution is just expensive failure">
        <p className="text-sm text-muted-foreground">
          Having multiple servers means nothing without a mechanism to <strong>distribute incoming
          requests</strong> across them. Even DNS round-robin is unreliable -- browsers and OS resolvers
          cache DNS responses for minutes to hours, so most users end up hitting the same IP. You need a
          dedicated component that intercepts every request and intelligently picks a backend.
        </p>
        <div className="grid grid-cols-2 gap-2 mt-3">
          {[
            { n: "1", label: "No Distribution", desc: "Clients connect directly to one server" },
            { n: "2", label: "No Health Checks", desc: "Dead servers still receive traffic" },
            { n: "3", label: "DNS Caching", desc: "Clients stick to one IP for hours" },
            { n: "4", label: "No Failover", desc: "Server crash = total outage" },
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

      <ConceptVisualizer title="How a Load Balancer Works">
        <p className="text-sm text-muted-foreground mb-4">
          A load balancer sits between clients and your server fleet. Every incoming request goes
          through the balancer, which picks a healthy backend based on an algorithm. Clients never
          communicate with backend servers directly -- they only see the load balancer&apos;s IP address.
        </p>
        <AnimatedFlow
          steps={[
            { id: "client", label: "Client Request", description: "Connects to load balancer's public IP" },
            { id: "lb", label: "Load Balancer", description: "Selects a healthy backend using algorithm" },
            { id: "server", label: "Backend Server", description: "Processes request, generates response" },
            { id: "response", label: "Response", description: "Routed back through LB to client" },
          ]}
          interval={1800}
        />
      </ConceptVisualizer>

      <ConceptVisualizer title="Live Request Distribution">
        <p className="text-sm text-muted-foreground mb-4">
          Watch requests flow in real-time through a load balancer to four backend servers using
          round-robin distribution. Each request goes to the next server in sequence.
        </p>
        <LiveRequestDistribution />
      </ConceptVisualizer>

      <CorrectApproach title="Load Balancing Algorithms">
        <p className="text-sm text-muted-foreground mb-4">
          Different algorithms optimize for different goals. Click each one to see how it distributes
          traffic, then try the interactive simulator below.
        </p>
        <div className="grid grid-cols-2 gap-2">
          <AlgorithmCard
            name="Round Robin"
            desc="Requests go to each server in order: 1, 2, 3, 4, 1, 2, 3, 4... The default in NGINX and most load balancers."
            pros="Simple, predictable, zero overhead"
            cons="Ignores server load and capacity differences"
            useCase="Uniform servers with similar request durations"
            isActive={algo === "Round Robin"}
            onClick={() => setAlgo("Round Robin")}
          />
          <AlgorithmCard
            name="Weighted Round Robin"
            desc="Like round robin, but servers with higher weights get proportionally more requests. Weight 5:3:1:1 means S1 gets 50% of traffic."
            pros="Accounts for different server capacities"
            cons="Static weights don't adapt to real-time load"
            useCase="Mixed server sizes (e.g., m6i.xlarge + m6i.large)"
            isActive={algo === "Weighted Round Robin"}
            onClick={() => setAlgo("Weighted Round Robin")}
          />
          <AlgorithmCard
            name="Least Connections"
            desc="Each request goes to the server with the fewest active connections. Adapts in real-time to variable request durations."
            pros="Dynamic, handles slow requests gracefully"
            cons="Slightly more overhead (must track connections)"
            useCase="APIs with variable processing times (DB queries, uploads)"
            isActive={algo === "Least Connections"}
            onClick={() => setAlgo("Least Connections")}
          />
          <AlgorithmCard
            name="IP Hash"
            desc="The client's IP is hashed to deterministically pick a server. Same client always reaches the same backend."
            pros="Session affinity without cookies"
            cons="Uneven distribution if traffic sources are skewed"
            useCase="Sticky sessions, in-memory caches per server"
            isActive={algo === "IP Hash"}
            onClick={() => setAlgo("IP Hash")}
          />
        </div>
      </CorrectApproach>

      <InteractiveDemo title="Algorithm Comparison Simulator">
        {({ isPlaying, tick }) => {
          const effectiveCount = isPlaying ? 20 + (tick % 8) * 10 : requestCount;
          const dist = simulateDistribution(algo, effectiveCount);
          const maxLoad = Math.max(...dist.map((s) => s.load));
          const totalLoad = dist.reduce((sum, s) => sum + s.load, 0);

          return (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex gap-2 flex-wrap">
                  {algorithms.map((a) => (
                    <button
                      key={a}
                      onClick={() => setAlgo(a)}
                      className={cn(
                        "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                        algo === a
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      )}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              {!isPlaying && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">Requests</span>
                    <span className="font-mono font-semibold">{requestCount}</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={100}
                    step={5}
                    value={requestCount}
                    onChange={(e) => setRequestCount(Number(e.target.value))}
                    className="w-full accent-primary h-1 rounded-full cursor-pointer"
                  />
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                Distributing <strong>{effectiveCount}</strong> requests across 4 servers
                using <strong>{algo}</strong>
                {algo === "Weighted Round Robin" && (
                  <span className="text-[10px] ml-1 text-muted-foreground/60">(weights: 5, 3, 1, 1)</span>
                )}
                :
              </p>

              <div className="grid grid-cols-4 gap-3">
                {dist.map((server, i) => {
                  const pct = totalLoad > 0 ? Math.round((server.load / totalLoad) * 100) : 0;
                  return (
                    <div key={i} className="space-y-2">
                      <ServerNode
                        type="server"
                        label={`Server ${i + 1}`}
                        sublabel={`${server.load} units`}
                        status={
                          server.load === maxLoad && maxLoad > totalLoad * 0.35
                            ? "warning"
                            : server.load > 0
                            ? "healthy"
                            : "idle"
                        }
                      />
                      <div className="w-full bg-muted/30 rounded-full h-2">
                        <div
                          className={cn(
                            "rounded-full h-2 transition-all duration-300",
                            server.load === maxLoad && maxLoad > totalLoad * 0.35
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                          )}
                          style={{ width: `${maxLoad > 0 ? (server.load / maxLoad) * 100 : 0}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-center font-mono text-muted-foreground">{pct}%</p>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <MetricCounter
                  label="Most Loaded"
                  value={maxLoad}
                  unit="units"
                  trend={maxLoad > totalLoad * 0.35 ? "up" : "neutral"}
                />
                <MetricCounter
                  label="Least Loaded"
                  value={Math.min(...dist.map((s) => s.load))}
                  unit="units"
                  trend="down"
                />
                <MetricCounter
                  label="Spread"
                  value={maxLoad - Math.min(...dist.map((s) => s.load))}
                  unit="units"
                  trend={maxLoad - Math.min(...dist.map((s) => s.load)) > totalLoad * 0.2 ? "up" : "neutral"}
                />
              </div>

              <ConversationalCallout type="tip">
                {algo === "Round Robin"
                  ? "Notice the even distribution? Round robin works great when all servers are identical and requests take similar time."
                  : algo === "Weighted Round Robin"
                  ? "Server 1 (weight 5) gets 50% of traffic. This is useful when you have a mix of large and small instances."
                  : algo === "Least Connections"
                  ? "Least connections naturally balances load even when some requests are slow. The busiest server stops getting new requests until it catches up."
                  : "IP hash ensures the same client always hits the same server -- great for session affinity, but notice how some servers may get more traffic than others."}
              </ConversationalCallout>
            </div>
          );
        }}
      </InteractiveDemo>

      <AhaMoment
        question="What are sticky sessions, and why are they a classic interview trade-off?"
        answer={
          <span>
            Sticky sessions (session affinity) route all requests from the same client to the same
            backend server. This is necessary when servers store session state in memory — e.g.,
            shopping carts, WebSocket connections, or in-memory caches. The trade-off: sticky sessions
            break even load distribution because a single &quot;hot&quot; user can overload one server
            while others sit idle. They also make failover painful — if the pinned server dies, the
            session is lost. The fix is to externalize state (Redis, database) so any server can
            handle any request. Always mention this in interviews: &quot;Sticky sessions are a
            symptom of stateful servers. The real solution is making servers stateless.&quot;
          </span>
        }
      />

      <ConceptVisualizer title="Health Checks -- The Load Balancer's Superpower">
        <p className="text-sm text-muted-foreground mb-4">
          The real value of a load balancer is not just distribution -- it is <strong>automatic failure
          detection</strong>. The LB sends periodic health checks (typically HTTP GET to <code className="text-xs bg-muted px-1 rounded font-mono">/health</code>)
          and removes any server that fails to respond. Watch what happens when Server 2 goes down:
        </p>
        <HealthCheckViz />
      </ConceptVisualizer>

      <ConversationalCallout type="tip">
        Health checks come in two flavors: <strong>active</strong> and <strong>passive</strong>.
        Active health checks probe a dedicated <code className="text-xs bg-muted px-1 rounded font-mono">/health</code> endpoint
        on a schedule (e.g., every 10 seconds). Passive health checks observe real traffic — if a
        server returns 5 consecutive 503 errors, it gets pulled from the pool. Best practice is to
        use both: active checks catch servers that are up but broken (e.g., can&apos;t reach the database),
        while passive checks catch issues that only manifest under real load. In interviews, always
        mention the <code className="text-xs bg-muted px-1 rounded font-mono">/health</code> endpoint
        pattern — it signals you understand production operations.
      </ConversationalCallout>

      <ConceptVisualizer title="Layer 4 vs Layer 7 Load Balancing">
        <p className="text-sm text-muted-foreground mb-4">
          Load balancers operate at different network layers. The layer determines what information
          they can use to make routing decisions. This distinction comes up constantly in interviews.
        </p>
        <LayerComparisonViz />
      </ConceptVisualizer>

      <BeforeAfter
        before={{
          title: "Single Load Balancer",
          content: (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                One load balancer is itself a single point of failure. If it dies, all traffic stops.
              </p>
              <div className="flex flex-col items-center gap-2">
                <ServerNode type="loadbalancer" label="LB" sublabel="SPOF!" status="warning" />
                <div className="flex gap-2">
                  <ServerNode type="server" label="S1" status="healthy" />
                  <ServerNode type="server" label="S2" status="healthy" />
                </div>
              </div>
            </div>
          ),
        }}
        after={{
          title: "Redundant Pair (Active/Passive)",
          content: (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Two LBs share a floating virtual IP. If the active dies, the passive takes over in seconds.
              </p>
              <div className="flex flex-col items-center gap-2">
                <div className="flex gap-2">
                  <ServerNode type="loadbalancer" label="Active" sublabel="Virtual IP" status="healthy" />
                  <ServerNode type="loadbalancer" label="Passive" sublabel="Standby" status="idle" />
                </div>
                <div className="flex gap-2">
                  <ServerNode type="server" label="S1" status="healthy" />
                  <ServerNode type="server" label="S2" status="healthy" />
                </div>
              </div>
            </div>
          ),
        }}
      />

      <AhaMoment
        question="Why not just use DNS round-robin instead of a dedicated load balancer?"
        answer={
          <span>
            DNS round-robin has no health checks -- it keeps sending traffic to dead servers.
            Clients cache DNS for minutes to hours, so distribution is wildly uneven. You cannot
            remove a failing server quickly. A real load balancer checks health every 5-10 seconds,
            removes unhealthy backends instantly, and can route based on content, headers, or cookies.
            DNS round-robin is a poor substitute for a real load balancer.
          </span>
        }
      />

      <AhaMoment
        question="What happens to in-flight requests when a server goes down?"
        answer={
          <span>
            With Layer 7 load balancing, the LB can detect a failed connection and <strong>retry</strong> the
            request on a different backend -- the client never knows anything went wrong. This is called
            &quot;connection draining&quot; or &quot;retry on next upstream.&quot; NGINX does this automatically
            with <code className="text-xs bg-muted px-1 rounded font-mono">proxy_next_upstream</code>.
          </span>
        }
      />

      <ConversationalCallout type="warning">
        Load balancers can themselves become a single point of failure. In production, always deploy them
        in <strong>pairs</strong> (active/passive or active/active) with a floating virtual IP that fails
        over automatically. Managed services like AWS ALB/NLB, GCP Load Balancing, and Cloudflare handle
        redundancy for you -- that is why most teams use managed load balancers.
      </ConversationalCallout>

      <ConversationalCallout type="tip">
        In system design interviews, mention <strong>which layer</strong> your load balancer operates at.
        Use Layer 7 (ALB) when you need path-based routing (<code className="text-xs bg-muted px-1 rounded font-mono">/api/*</code> to
        API servers, <code className="text-xs bg-muted px-1 rounded font-mono">/static/*</code> to
        CDN). Use Layer 4 (NLB) for raw TCP performance -- WebSocket connections, gaming servers,
        or when you need millions of connections per second.
      </ConversationalCallout>

      <ScaleSimulator
        title="Load Balancer Capacity Planner"
        min={100}
        max={100000}
        step={100}
        unit="req/sec"
        metrics={(value) => {
          const capacityPerServer = 2000;
          const serverCount = Math.ceil(value / capacityPerServer);
          const avgRequestSizeKb = 50;
          const bandwidthMbps = Math.round((value * avgRequestSizeKb * 8) / 1000);
          const failoverTimeMs = Math.round(10000 / serverCount + 50);
          return [
            { label: "Servers Needed", value: serverCount, unit: "servers" },
            { label: "LB Bandwidth", value: bandwidthMbps, unit: "Mbps" },
            { label: "Est. Failover Time", value: failoverTimeMs, unit: "ms" },
          ];
        }}
      >
        {({ value }) => {
          const capacityPerServer = 2000;
          const serverCount = Math.ceil(value / capacityPerServer);
          const loadPerServer = Math.round(value / serverCount);
          return (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                At <strong>{value.toLocaleString()} req/sec</strong> with ~2,000 req/sec per server capacity,
                you need <strong>{serverCount} servers</strong> ({loadPerServer.toLocaleString()} req/sec each).
              </p>
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: Math.min(serverCount, 8) }).map((_, i) => (
                  <div key={i} className="text-center">
                    <div className={cn(
                      "rounded-lg border p-2 text-[10px] font-mono transition-all",
                      loadPerServer > 1800
                        ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                        : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    )}>
                      S{i + 1}
                    </div>
                    <p className="text-[9px] text-muted-foreground mt-1">{loadPerServer}/s</p>
                  </div>
                ))}
                {serverCount > 8 && (
                  <div className="flex items-center justify-center text-[10px] text-muted-foreground">
                    +{serverCount - 8} more
                  </div>
                )}
              </div>
              {serverCount === 1 && (
                <p className="text-[10px] text-amber-400">
                  With only 1 server, you have no redundancy. A single failure means total outage.
                </p>
              )}
            </div>
          );
        }}
      </ScaleSimulator>

      <KeyTakeaway
        points={[
          "A load balancer distributes traffic across multiple servers, enabling horizontal scaling and fault tolerance.",
          "Round Robin is simplest and works for uniform workloads. Least Connections handles variable request durations. Weighted variants handle mixed server sizes.",
          "IP Hash provides session stickiness without cookies but risks uneven distribution with skewed traffic sources.",
          "Health checks are the load balancer's superpower -- it detects and removes failed servers in seconds, not minutes.",
          "Layer 4 (TCP) LBs are faster but blind to content. Layer 7 (HTTP) LBs can route by URL, headers, and cookies.",
          "Always deploy load balancers in redundant pairs (or use managed services) to avoid making them a single point of failure.",
        ]}
      />
    </div>
  );
}
