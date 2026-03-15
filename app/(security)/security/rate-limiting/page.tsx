"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { TopicHero } from "@/components/topic-hero";
import { KeyTakeaway } from "@/components/key-takeaway";
import { AhaMoment } from "@/components/aha-moment";
import { ConversationalCallout } from "@/components/conversational-callout";
import { BeforeAfter } from "@/components/before-after";
import { Playground } from "@/components/playground";
import { LiveChart } from "@/components/live-chart";
import { FlowDiagram, type FlowNode, type FlowEdge } from "@/components/flow-diagram";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, Shield, Zap } from "lucide-react";

// ─── Token Bucket Playground ──────────────────────────────────────────────────

function TokenBucketPlayground() {
  const [capacity, setCapacity] = useState(10);
  const [refillRate, setRefillRate] = useState(2);
  const [tokens, setTokens] = useState(10);
  const [log, setLog] = useState<Array<{ t: number; allowed: number; rejected: number }>>([]);
  const [flash429, setFlash429] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => { setTokens((p) => Math.min(p, capacity)); }, [capacity]);

  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => setTokens((p) => Math.min(capacity, p + refillRate)), 1000);
    return () => clearInterval(id);
  }, [isPlaying, capacity, refillRate]);

  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => {
      setLog((prev) => [...prev, { t: prev.length, allowed: 0, rejected: 0 }].slice(-20));
    }, 1000);
    return () => clearInterval(id);
  }, [isPlaying]);

  const sendRequest = useCallback((count: number) => {
    setTokens((prev) => {
      const allowed = Math.min(count, prev);
      const rejected = count - allowed;
      if (rejected > 0) { setFlash429(true); setTimeout(() => setFlash429(false), 800); }
      setLog((prevLog) => {
        const updated = [...prevLog];
        if (updated.length === 0) { updated.push({ t: 0, allowed, rejected }); }
        else {
          const last = { ...updated[updated.length - 1] };
          last.allowed += allowed;
          last.rejected += rejected;
          updated[updated.length - 1] = last;
        }
        return updated;
      });
      return Math.max(0, prev - count);
    });
  }, []);

  const pct = capacity > 0 ? (tokens / capacity) * 100 : 0;
  const bucketBorder = tokens === 0 ? "border-red-500/60" : tokens <= capacity * 0.3 ? "border-amber-500/50" : "border-emerald-500/50";
  const fillBg = tokens === 0 ? "bg-red-500/60" : tokens <= capacity * 0.3 ? "bg-amber-500/50" : "bg-emerald-500/50";
  const countColor = tokens === 0 ? "text-red-400" : tokens <= capacity * 0.3 ? "text-amber-400" : "text-emerald-400";

  return (
    <div className="space-y-5 p-4">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex flex-col items-center gap-2 flex-1">
          <p className="text-xs text-muted-foreground font-medium">Token Bucket</p>
          <div className="relative w-28 h-40">
            <div className={cn("absolute inset-x-0 bottom-0 top-4 rounded-b-2xl rounded-t-md border-2 overflow-hidden transition-colors", bucketBorder)}>
              <div className={cn("absolute bottom-0 left-0 right-0 transition-all duration-500 rounded-b-xl", fillBg)} style={{ height: `${pct}%` }} />
              <div className="absolute inset-0 flex flex-wrap content-end justify-center gap-1 p-2">
                {Array.from({ length: tokens }, (_, i) => (
                  <div key={i} className="size-2.5 rounded-full bg-white/30 border border-white/40" />
                ))}
              </div>
            </div>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground">+{refillRate}/s</div>
          </div>
          <span className={cn("text-lg font-mono font-bold mt-2", countColor)}>{tokens}<span className="text-sm text-muted-foreground font-normal"> / {capacity}</span></span>
          {flash429 && (
            <div className="px-3 py-1 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-mono animate-in fade-in duration-300">
              HTTP 429 Too Many Requests
            </div>
          )}
        </div>
        <div className="flex-1 space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Bucket Capacity: {capacity}</label>
            <input type="range" min={3} max={20} value={capacity} onChange={(e) => setCapacity(Number(e.target.value))} className="w-full h-1.5 rounded-full accent-violet-500 cursor-pointer mt-1" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Refill Rate: {refillRate}/s</label>
            <input type="range" min={1} max={8} value={refillRate} onChange={(e) => setRefillRate(Number(e.target.value))} className="w-full h-1.5 rounded-full accent-violet-500 cursor-pointer mt-1" />
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setIsPlaying(p => !p)}
              className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 border border-violet-500/20 transition-colors">
              {isPlaying ? "⏸ Pause" : "▶ Start"}
            </button>
            {[
              { label: "Send 1", count: 1, cls: "bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20" },
              { label: "Send 5", count: 5, cls: "bg-violet-500/10 border-violet-500/20 text-violet-400 hover:bg-violet-500/20" },
              { label: "Burst 15", count: 15, cls: "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20" },
            ].map((b) => (
              <button key={b.label} onClick={() => sendRequest(b.count)} className={cn("px-3 py-1.5 rounded-md text-xs font-medium border transition-all", b.cls)}>{b.label}</button>
            ))}
            <button onClick={() => { setTokens(capacity); setLog([]); setIsPlaying(false); }} className="px-3 py-1.5 rounded-md text-xs font-medium bg-muted/30 border border-border/50 text-muted-foreground hover:bg-muted/50 transition-all">Reset</button>
          </div>
        </div>
      </div>
      {log.length > 1 && (
        <LiveChart type="bar" data={log} dataKeys={{ x: "t", y: ["allowed", "rejected"], label: ["Allowed", "Rejected (429)"] }} colors={["#10b981", "#ef4444"]} height={140} showLegend unit="req" />
      )}
    </div>
  );
}

// ─── Algorithm Comparison ─────────────────────────────────────────────────────

type AlgoKey = "token" | "leaky" | "fixed" | "sliding";
const TRAFFIC = [3, 2, 8, 1, 12, 2, 6, 1, 4, 10, 1, 3];

function computeAlgo(algo: AlgoKey): { allowed: number; rejected: number }[] {
  if (algo === "token") {
    let b = 10; return TRAFFIC.map((r) => { b = Math.min(10, b + 3); const a = Math.min(r, b); b -= a; return { allowed: a, rejected: r - a }; });
  }
  if (algo === "leaky") return TRAFFIC.map((r) => ({ allowed: Math.min(r, 4), rejected: Math.max(0, r - 4) }));
  if (algo === "fixed") {
    let w = 0; return TRAFFIC.map((r, i) => { if (i % 4 === 0) w = 0; const s = Math.max(0, 8 - w); const a = Math.min(r, s); w += a; return { allowed: a, rejected: r - a }; });
  }
  const win: number[] = [];
  return TRAFFIC.map((r) => { while (win.length > 3) win.shift(); const s = Math.max(0, 8 - win.reduce((a, b) => a + b, 0)); const a = Math.min(r, s); win.push(a); return { allowed: a, rejected: r - a }; });
}

const ALGO_META: Record<AlgoKey, { name: string; desc: string; pros: string[]; cons: string[] }> = {
  token: { name: "Token Bucket", desc: "Allows bursts up to bucket capacity, then enforces a steady refill rate. Used by AWS, Stripe, and most API gateways.", pros: ["Allows controlled bursts", "Simple counter + timestamp", "Memory efficient"], cons: ["Bursts can spike backend", "Tuning capacity vs rate"] },
  leaky: { name: "Leaky Bucket", desc: "Processes at a constant rate. Excess traffic dropped. Smoothest output of all algorithms.", pros: ["Perfectly smooth output", "Predictable backend load"], cons: ["Zero burst tolerance", "Queued requests add latency"] },
  fixed: { name: "Fixed Window", desc: "Counts requests in fixed time intervals. Simple but has the boundary-burst problem — up to 2x limit at edges.", pros: ["Simplest to implement", "Very memory efficient"], cons: ["Boundary burst problem", "Up to 2x limit at edges"] },
  sliding: { name: "Sliding Window", desc: "Counts requests in a rolling time period. Prevents the boundary problem by weighting counts from adjacent intervals.", pros: ["No boundary problem", "Accurate enforcement"], cons: ["More memory", "More complex to implement"] },
};

const TAB_STYLES: Record<AlgoKey, string> = {
  token: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
  leaky: "bg-blue-500/10 border-blue-500/30 text-blue-400",
  fixed: "bg-amber-500/10 border-amber-500/30 text-amber-400",
  sliding: "bg-violet-500/10 border-violet-500/30 text-violet-400",
};

function AlgorithmComparison() {
  const [algo, setAlgo] = useState<AlgoKey>("token");
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => setStep((s) => (s + 1) % TRAFFIC.length), 800);
    return () => clearInterval(id);
  }, [isPlaying]);

  const output = useMemo(() => computeAlgo(algo), [algo]);
  const meta = ALGO_META[algo];

  const chartData = output.slice(0, step + 1).map((o, i) => ({
    tick: i, input: TRAFFIC[i], allowed: o.allowed, rejected: o.rejected,
  }));

  return (
    <div className="space-y-4 p-4">
      <div className="space-y-2">
        <div className="grid grid-cols-4 gap-1.5">
          {(Object.keys(ALGO_META) as AlgoKey[]).map((key) => (
            <button key={key} onClick={() => { setAlgo(key); setStep(0); }}
              className={cn("text-[10px] sm:text-xs font-semibold py-2 rounded-md border transition-all", algo === key ? TAB_STYLES[key] : "bg-muted/20 border-border/50 text-muted-foreground/50")}>
              {ALGO_META[key].name}
            </button>
          ))}
        </div>
        <div className="flex justify-end">
          <button onClick={() => setIsPlaying(p => !p)}
            className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 border border-violet-500/20 transition-colors">
            {isPlaying ? "⏸ Pause" : "▶ Start"}
          </button>
        </div>
      </div>

      {/* Animated bars showing traffic flow */}
      <div className="flex items-end gap-1.5 h-24 px-2">
        {TRAFFIC.map((val, i) => {
          const o = output[i];
          const active = i <= step;
          return (
            <div key={`${algo}-${i}`} className="flex-1 flex flex-col items-center gap-0.5">
              <span className={cn("text-[8px] font-mono", active ? "text-foreground" : "text-muted-foreground/30")}>{val}</span>
              <div className="w-full flex flex-col-reverse gap-px">
                <div className={cn("rounded-t transition-all duration-300", active ? "bg-emerald-500/60" : "bg-muted/10")} style={{ height: `${o.allowed * 5}px` }} />
                {o.rejected > 0 && <div className={cn("rounded-t transition-all duration-300", active ? "bg-red-500/50" : "bg-muted/5")} style={{ height: `${o.rejected * 5}px` }} />}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between px-2 text-[9px] font-mono text-muted-foreground/40">
        <span>t=0</span><span>time</span><span>t={TRAFFIC.length - 1}</span>
      </div>

      {chartData.length > 1 && (
        <LiveChart type="bar" data={chartData} dataKeys={{ x: "tick", y: ["allowed", "rejected"], label: ["Allowed", "Rejected"] }}
          colors={["#10b981", "#ef4444"]} height={120} showLegend
          referenceLines={[{ y: algo === "leaky" ? 4 : 8, label: "Limit", color: "#f59e0b" }]} />
      )}

      <p className="text-xs text-muted-foreground">{meta.desc}</p>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-2">
          <p className="text-[10px] font-semibold text-emerald-400 mb-1">Strengths</p>
          {meta.pros.map((p) => (<p key={p} className="text-[10px] text-muted-foreground flex items-start gap-1"><CheckCircle2 className="size-3 text-emerald-400 shrink-0 mt-0.5" /> {p}</p>))}
        </div>
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-2">
          <p className="text-[10px] font-semibold text-red-400 mb-1">Weaknesses</p>
          {meta.cons.map((c) => (<p key={c} className="text-[10px] text-muted-foreground flex items-start gap-1"><XCircle className="size-3 text-red-400 shrink-0 mt-0.5" /> {c}</p>))}
        </div>
      </div>
    </div>
  );
}

// ─── DDoS Attack Simulation ───────────────────────────────────────────────────

function AttackSimulation() {
  const [mode, setMode] = useState<"idle" | "normal" | "ddos">("idle");
  const [stats, setStats] = useState({ allowed: 0, blocked: 0 });
  const [ticks, setTicks] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => { if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; } }, []);

  const start = useCallback((m: "normal" | "ddos") => {
    stop();
    setMode(m);
    setStats({ allowed: 0, blocked: 0 });
    setTicks(0);
    const incoming = m === "ddos" ? 50 : 5;
    const limit = 10;
    intervalRef.current = setInterval(() => {
      setTicks((t) => { if (t >= 20) { stop(); return t; } return t + 1; });
      setStats((p) => ({ allowed: p.allowed + Math.min(incoming, limit), blocked: p.blocked + Math.max(0, incoming - limit) }));
    }, 400);
  }, [stop]);

  useEffect(() => stop, [stop]);

  const nodes: FlowNode[] = useMemo(() => [
    { id: "attacker", type: "clientNode", position: { x: 0, y: 80 }, data: { label: mode === "ddos" ? "Attacker" : "Client", sublabel: mode === "ddos" ? "50 req/tick" : "5 req/tick", status: mode === "ddos" ? "unhealthy" as const : "idle" as const, handles: { right: true } } },
    { id: "rl", type: "gatewayNode", position: { x: 250, y: 80 }, data: { label: "Rate Limiter", sublabel: "limit: 10/tick", status: mode === "ddos" ? "warning" as const : "healthy" as const, metrics: [{ label: "Allowed", value: `${stats.allowed}` }, { label: "Blocked", value: `${stats.blocked}` }], handles: { left: true, right: true } } },
    { id: "server", type: "serverNode", position: { x: 520, y: 80 }, data: { label: "API Server", sublabel: mode === "ddos" ? "Protected" : "Idle", status: "healthy" as const, handles: { left: true } } },
  ], [mode, stats]);

  const edges: FlowEdge[] = useMemo(() => [
    { id: "e1", source: "attacker", target: "rl", animated: ticks > 0 && ticks < 20, style: mode === "ddos" ? { stroke: "#ef4444", strokeWidth: 3 } : undefined, label: mode === "ddos" ? "flood" : "" },
    { id: "e2", source: "rl", target: "server", animated: ticks > 0 && ticks < 20, style: { stroke: "#10b981", strokeWidth: 2 }, label: ticks > 0 ? "10/tick max" : "" },
  ], [mode, ticks]);

  const chartData = useMemo(() => {
    if (ticks === 0) return [];
    const incoming = mode === "ddos" ? 50 : 5;
    return Array.from({ length: ticks }, (_, i) => ({ t: i + 1, incoming, allowed: Math.min(incoming, 10), blocked: Math.max(0, incoming - 10) }));
  }, [ticks, mode]);

  return (
    <div className="space-y-4 p-4">
      <div className="flex gap-2 justify-center flex-wrap">
        <button onClick={() => start("normal")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all">
          <Shield className="size-3" /> Normal Traffic
        </button>
        <button onClick={() => start("ddos")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all">
          <Zap className="size-3" /> DDoS Attack
        </button>
        <button onClick={() => { stop(); setMode("idle"); setStats({ allowed: 0, blocked: 0 }); setTicks(0); }} className="px-3 py-1.5 rounded-md text-xs font-medium bg-muted/30 border border-border/50 text-muted-foreground hover:bg-muted/50 transition-all">Reset</button>
      </div>

      <FlowDiagram nodes={nodes} edges={edges} minHeight={200} interactive={false} allowDrag={false} />

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Incoming", value: stats.allowed + stats.blocked, border: "border-blue-500/20", bg: "bg-blue-500/5", color: "text-blue-400" },
          { label: "Allowed", value: stats.allowed, border: "border-emerald-500/20", bg: "bg-emerald-500/5", color: "text-emerald-400" },
          { label: "Blocked", value: stats.blocked, border: "border-red-500/20", bg: "bg-red-500/5", color: "text-red-400" },
        ].map((s) => (
          <div key={s.label} className={cn("rounded-lg border p-2 text-center", s.border, s.bg)}>
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
            <p className={cn("text-lg font-mono font-bold", s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {chartData.length > 1 && (
        <LiveChart type="area" data={chartData} dataKeys={{ x: "t", y: ["incoming", "allowed", "blocked"], label: ["Incoming", "Allowed", "Blocked"] }}
          colors={["#6366f1", "#10b981", "#ef4444"]} height={140} showLegend
          referenceLines={[{ y: 10, label: "Rate Limit", color: "#f59e0b" }]} />
      )}

      {mode === "ddos" && ticks >= 20 && (
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-center">
          <p className="text-sm font-medium text-emerald-400">Server survived the attack.</p>
          <p className="text-xs text-muted-foreground mt-1">{stats.blocked} malicious requests blocked. Only {stats.allowed} processed at a safe rate.</p>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function RateLimitingPage() {
  return (
    <div className="space-y-8">
      <TopicHero
        title="Rate Limiting"
        subtitle="Without rate limiting, one bad actor can consume all your resources and take down your service for everyone. It's the cheapest form of protection you can add."
        difficulty="intermediate"
      />

      <Playground
        title="Token Bucket Playground"
        canvas={<TokenBucketPlayground />}
        controls={false}
        explanation={
          <div className="space-y-3">
            <p className="font-medium text-foreground">How it works</p>
            <p>A bucket holds tokens. Each request costs one token. Tokens refill at a fixed rate. The <strong>capacity</strong> controls max burst size; the <strong>refill rate</strong> controls sustained throughput.</p>
            <p>Try sending a burst of 15 when the bucket has 10 tokens. Watch the extras get rejected with 429.</p>
            <p className="text-xs font-mono bg-muted/30 rounded p-2">In practice, you only need two values: token_count and last_refill_timestamp. No background thread needed.</p>
          </div>
        }
      />

      <ConversationalCallout type="tip">
        The token bucket is the most popular algorithm in production — used by AWS, Stripe, Google Cloud, and most API gateways.
        It balances short bursts with long-term rate enforcement.
      </ConversationalCallout>

      <Playground
        title="Algorithm Comparison"
        canvas={<AlgorithmComparison />}
        controls={false}
        explanation={
          <div className="space-y-3">
            <p className="font-medium text-foreground">Same traffic, different algorithms</p>
            <p>The same bursty traffic hits each algorithm. Token Bucket allows bursts; Leaky Bucket enforces a constant rate. Fixed Window has a boundary-burst edge case that Sliding Window fixes.</p>
            <p className="font-medium text-foreground mt-2">When to use which</p>
            <ul className="space-y-1 text-xs list-disc pl-4">
              <li>APIs with burst tolerance: Token Bucket</li>
              <li>Smooth downstream load: Leaky Bucket</li>
              <li>Simple implementation: Fixed Window</li>
              <li>Strict enforcement: Sliding Window</li>
            </ul>
          </div>
        }
      />

      <Playground
        title="DDoS Attack Simulation"
        canvas={<AttackSimulation />}
        controls={false}
        explanation={
          <div className="space-y-3">
            <p className="font-medium text-foreground">Watch rate limiting protect your server</p>
            <p>Click &quot;DDoS Attack&quot; to flood the system with 50 req/tick. The rate limiter caps throughput at 10/tick, blocking the excess. The server stays healthy.</p>
            <p>Compare with &quot;Normal Traffic&quot; at 5 req/tick — everything passes through.</p>
            <p className="text-xs font-mono bg-muted/30 rounded p-2">In production, apply rate limiting at the edge (CDN/API gateway) to reject attacks before they reach your app servers.</p>
          </div>
        }
      />

      <AhaMoment
        question="Won't calling Redis on every request add latency?"
        answer={<p>Redis responds in under 1ms for INCR. That is negligible compared to your API&apos;s total response time. The alternative — no rate limiting — means one abusive client can make your API take 30 seconds for everyone. Use a Lua script to make check-and-increment atomic in a single round trip.</p>}
      />

      <BeforeAfter
        before={{ title: "No Rate Limiting", content: (
          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="font-mono text-xs bg-muted/50 p-2 rounded">{`app.get('/api/data', async (req, res) => {`}<br />{`  const data = await db.query(...);`}<br />{`  res.json(data);`}<br />{`});`}</p>
            <p>One aggressive client exhausts database connections. Response times spike. Your monitoring triggers at 3 AM.</p>
          </div>
        ) }}
        after={{ title: "Layered Rate Limiting", content: (
          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="font-mono text-xs bg-muted/50 p-2 rounded">{`app.use(edgeRateLimit(1000));`}<br />{`app.use(userRateLimit(100));`}<br />{`app.get('/api/data',`}<br />{`  endpointLimit(30), handler`}<br />{`);`}</p>
            <p>Three layers: global safety net, per-user fairness, per-endpoint protection. Abusers get 429s; everyone else is unaffected.</p>
          </div>
        ) }}
      />

      <ConversationalCallout type="warning">
        Always return <code className="text-xs bg-muted px-1 rounded font-mono">429 Too Many Requests</code> with{" "}
        <code className="text-xs bg-muted px-1 rounded font-mono">Retry-After</code> and{" "}
        <code className="text-xs bg-muted px-1 rounded font-mono">X-RateLimit-*</code> headers. Returning 500 or silently dropping requests makes debugging impossible.
      </ConversationalCallout>

      <AhaMoment
        question="What about the race condition when two requests check the counter simultaneously?"
        answer={<p>Both pass! If Request A and B both read count=99 before either writes 100, both think they are under the limit. Fix: use Redis EVAL with a Lua script for atomic check-and-increment. MULTI/EXEC is not enough — it queues commands but cannot branch on intermediate results.</p>}
      />

      <ConversationalCallout type="tip">
        In system design interviews, mention rate limiting early when discussing any API. State the algorithm (token bucket for most cases), where to enforce it (edge + application), and how to coordinate across instances (Redis). Bonus: mention rate limit headers and exponential backoff with jitter.
      </ConversationalCallout>

      <KeyTakeaway
        points={[
          "Rate limiting caps how many requests a client can make in a time window, protecting shared resources from abuse.",
          "Token bucket allows controlled bursts while enforcing a long-term rate. Sliding window prevents the boundary-burst problem of fixed windows.",
          "Use Redis for distributed rate limiting — in-memory counters per server let users get N times the limit across N servers. Lua scripts make it atomic.",
          "Apply rate limits at multiple layers: edge/gateway, application middleware, per-endpoint, and global safety net.",
          "Return HTTP 429 with Retry-After and X-RateLimit-* headers so well-behaved clients can back off gracefully.",
        ]}
      />
    </div>
  );
}
