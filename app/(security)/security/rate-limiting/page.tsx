"use client";

import { useState, useEffect, useCallback } from "react";
import { TopicHero } from "@/components/topic-hero";
import { FailureScenario } from "@/components/failure-scenario";
import { WhyItBreaks } from "@/components/why-it-breaks";
import { ConceptVisualizer } from "@/components/concept-visualizer";
import { CorrectApproach } from "@/components/correct-approach";
import { KeyTakeaway } from "@/components/key-takeaway";
import { InteractiveDemo } from "@/components/interactive-demo";
import { MetricCounter } from "@/components/metric-counter";
import { AhaMoment } from "@/components/aha-moment";
import { ConversationalCallout } from "@/components/conversational-callout";
import { BeforeAfter } from "@/components/before-after";
import { ServerNode } from "@/components/server-node";
import { cn } from "@/lib/utils";
import { Droplets, Timer, Gauge, CheckCircle2, XCircle, ArrowDown } from "lucide-react";

function TokenBucketViz() {
  const [tokens, setTokens] = useState(10);
  const [draining, setDraining] = useState(false);
  const [history, setHistory] = useState<Array<{ time: number; accepted: boolean }>>([]);
  const CAPACITY = 10;
  const REFILL_RATE = 2;

  useEffect(() => {
    const t = setInterval(() => {
      setTokens((prev) => Math.min(CAPACITY, prev + REFILL_RATE));
    }, 2000);
    return () => clearInterval(t);
  }, []);

  const sendRequest = useCallback((count: number) => {
    setTokens((prev) => {
      const accepted = Math.min(count, prev);
      const rejected = count - accepted;
      const now = Date.now();
      const newEntries: Array<{ time: number; accepted: boolean }> = [];
      for (let i = 0; i < accepted; i++) newEntries.push({ time: now, accepted: true });
      for (let i = 0; i < rejected; i++) newEntries.push({ time: now, accepted: false });
      setHistory((h) => [...h.slice(-19), ...newEntries]);
      if (count > prev) setDraining(true);
      setTimeout(() => setDraining(false), 600);
      return Math.max(0, prev - count);
    });
  }, []);

  const accepted = history.filter((h) => h.accepted).length;
  const rejected = history.filter((h) => !h.accepted).length;

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-1 justify-center h-28 px-4">
        {Array.from({ length: CAPACITY }, (_, i) => (
          <div
            key={i}
            className={cn(
              "w-6 rounded-t-md transition-all duration-500 border border-b-0",
              i < tokens
                ? tokens > 3
                  ? "bg-emerald-500/30 border-emerald-500/30"
                  : "bg-amber-500/30 border-amber-500/30"
                : "bg-muted/10 border-border/20"
            )}
            style={{ height: i < tokens ? `${60 + Math.random() * 30}%` : "15%" }}
          />
        ))}
      </div>
      <div className="text-center">
        <span className={cn(
          "text-sm font-mono font-bold transition-colors",
          tokens === 0 ? "text-red-400" : tokens <= 3 ? "text-amber-400" : "text-emerald-400"
        )}>
          {tokens}/{CAPACITY}
        </span>
        <span className="text-xs text-muted-foreground ml-2">tokens (refills {REFILL_RATE}/2s)</span>
      </div>

      <div className="flex gap-2 justify-center flex-wrap">
        {[
          { label: "Send 1", count: 1, style: "bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20" },
          { label: "Send 5", count: 5, style: "bg-violet-500/10 border-violet-500/20 text-violet-400 hover:bg-violet-500/20" },
          { label: "Burst 15", count: 15, style: "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20" },
        ].map((btn) => (
          <button
            key={btn.label}
            onClick={() => sendRequest(btn.count)}
            className={cn("px-3 py-1.5 rounded-md text-xs font-medium transition-all border", btn.style)}
          >
            {btn.label}
          </button>
        ))}
        <button
          onClick={() => { setTokens(CAPACITY); setHistory([]); }}
          className="px-3 py-1.5 rounded-md text-xs font-medium bg-muted/30 border border-border/50 text-muted-foreground hover:bg-muted/50 transition-all"
        >
          Reset
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <MetricCounter label="Total" value={accepted + rejected} unit="req" />
        <MetricCounter label="Accepted" value={accepted} unit="req" trend="up" />
        <MetricCounter label="Rejected (429)" value={rejected} unit="req" trend={rejected > 0 ? "down" : "neutral"} />
      </div>

      {draining && tokens === 0 && (
        <p className="text-[11px] text-red-400 text-center font-medium">
          Bucket empty — requests rejected until tokens refill
        </p>
      )}

      <div className="flex gap-1 justify-center flex-wrap">
        {history.slice(-20).map((h, i) => (
          <div
            key={i}
            className={cn(
              "size-2.5 rounded-full transition-all",
              h.accepted ? "bg-emerald-500" : "bg-red-500"
            )}
          />
        ))}
      </div>
    </div>
  );
}

const algoActiveStyles: Record<string, string> = {
  emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
  blue: "bg-blue-500/10 border-blue-500/20 text-blue-400",
  amber: "bg-amber-500/10 border-amber-500/20 text-amber-400",
  violet: "bg-violet-500/10 border-violet-500/20 text-violet-400",
};

const algoBarStyles: Record<string, string> = {
  emerald: "bg-emerald-500/20 border-emerald-500/30",
  blue: "bg-blue-500/20 border-blue-500/30",
  amber: "bg-amber-500/20 border-amber-500/30",
  violet: "bg-violet-500/20 border-violet-500/30",
};

function AlgorithmComparisonViz() {
  const [algo, setAlgo] = useState<"token" | "leaky" | "fixed" | "sliding">("token");
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % 8), 900);
    return () => clearInterval(t);
  }, []);

  const algos = {
    token: {
      name: "Token Bucket",
      color: "emerald",
      bars: [8, 6, 10, 3, 0, 2, 5, 8],
      desc: "Allows bursts up to bucket capacity. Refills at a steady rate. Best when you want to allow occasional traffic spikes while enforcing a long-term average.",
      pros: ["Allows controlled bursts", "Simple (count + timestamp)", "Memory efficient"],
      cons: ["Burst can spike backend load", "Tuning capacity vs rate is tricky"],
    },
    leaky: {
      name: "Leaky Bucket",
      color: "blue",
      bars: [3, 3, 3, 3, 3, 3, 3, 3],
      desc: "Processes requests at a constant rate regardless of input burstiness. Excess requests queue up or get dropped. Best when your downstream services need a smooth, predictable load.",
      pros: ["Smooth, constant output rate", "Predictable backend load", "Simple to understand"],
      cons: ["No burst tolerance", "Queued requests add latency"],
    },
    fixed: {
      name: "Fixed Window",
      color: "amber",
      bars: [5, 7, 10, 0, 6, 4, 10, 0],
      desc: "Counts requests in fixed time intervals (e.g., per minute). Resets at window boundaries. Simple but has the boundary problem: 100 requests at 11:59:59 and 100 at 12:00:01 = 200 in 2 seconds.",
      pros: ["Simplest to implement", "Very memory efficient", "Easy to reason about"],
      cons: ["Boundary burst problem", "Up to 2x limit at window edges"],
    },
    sliding: {
      name: "Sliding Window",
      color: "violet",
      bars: [5, 6, 7, 5, 4, 6, 5, 7],
      desc: "Counts requests in a rolling time period (last 60 seconds from now). The window moves with the clock. Prevents the boundary problem of fixed windows by weighting counts from previous and current intervals.",
      pros: ["No boundary problem", "Accurate rate enforcement", "Smooth rate limiting"],
      cons: ["Slightly more memory", "More complex implementation"],
    },
  };

  const a = algos[algo];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-1.5">
        {(Object.keys(algos) as Array<keyof typeof algos>).map((key) => (
          <button
            key={key}
            onClick={() => { setAlgo(key); setStep(0); }}
            className={cn(
              "text-[10px] font-semibold py-2 rounded-md border transition-all",
              algo === key
                ? algoActiveStyles[algos[key].color]
                : "bg-muted/20 border-border/50 text-muted-foreground/50"
            )}
          >
            {algos[key].name}
          </button>
        ))}
      </div>

      <div className="flex items-end gap-1.5 h-20 px-2">
        {a.bars.map((val, i) => (
          <div
            key={`${algo}-${i}`}
            className={cn(
              "flex-1 rounded-t-md transition-all duration-500 border border-b-0",
              i <= step
                ? val > 7
                  ? "bg-red-500/20 border-red-500/30"
                  : val > 0
                  ? algoBarStyles[a.color]
                  : "bg-muted/10 border-border/20"
                : "bg-muted/5 border-border/10"
            )}
            style={{ height: `${Math.max(5, val * 10)}%` }}
          />
        ))}
      </div>
      <div className="flex justify-between px-2 text-[9px] font-mono text-muted-foreground/40">
        <span>t=0</span>
        <span>time →</span>
        <span>t=7</span>
      </div>

      <p className="text-[11px] text-muted-foreground leading-relaxed">{a.desc}</p>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-2">
          <p className="text-[10px] font-semibold text-emerald-400 mb-1">Strengths</p>
          {a.pros.map((p) => (
            <p key={p} className="text-[10px] text-muted-foreground flex items-start gap-1">
              <CheckCircle2 className="size-3 text-emerald-400 shrink-0 mt-0.5" /> {p}
            </p>
          ))}
        </div>
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-2">
          <p className="text-[10px] font-semibold text-red-400 mb-1">Weaknesses</p>
          {a.cons.map((c) => (
            <p key={c} className="text-[10px] text-muted-foreground flex items-start gap-1">
              <XCircle className="size-3 text-red-400 shrink-0 mt-0.5" /> {c}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

function DistributedRateLimitViz() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % 6), 1300);
    return () => clearInterval(t);
  }, []);

  const stages = [
    { label: "Request arrives at Server 2", icon: "→", color: "text-blue-400" },
    { label: "INCR user:42:window in Redis", icon: "↗", color: "text-violet-400" },
    { label: "Redis returns count: 98/100", icon: "↙", color: "text-amber-400" },
    { label: "Under limit — request allowed", icon: "✓", color: "text-emerald-400" },
    { label: "Next request: count 101/100", icon: "✕", color: "text-red-400" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-3 flex-wrap">
        <ServerNode type="server" label="Server 1" sublabel="count: local?" status={step >= 1 ? "healthy" : "idle"} />
        <ServerNode type="server" label="Server 2" sublabel="count: local?" status={step >= 1 ? "healthy" : "idle"} />
        <ServerNode type="cache" label="Redis" sublabel="count: 98" status={step >= 2 ? "healthy" : "idle"} />
        <ServerNode type="server" label="Server 3" sublabel="count: local?" status={step >= 1 ? "healthy" : "idle"} />
      </div>

      <div className="space-y-1.5 px-2">
        {stages.map((s, i) => (
          <div
            key={i}
            className={cn(
              "flex items-center gap-2 rounded-lg border px-3 py-1.5 transition-all duration-500",
              step > i
                ? i === 4
                  ? "bg-red-500/8 border-red-500/20"
                  : "bg-emerald-500/8 border-emerald-500/20"
                : step === i
                ? "bg-blue-500/8 border-blue-500/20 ring-1 ring-blue-500/15"
                : "bg-muted/10 border-border/30 opacity-40"
            )}
          >
            <span className={cn("text-sm font-mono w-4 shrink-0", step >= i ? s.color : "")}>
              {s.icon}
            </span>
            <span className={cn("text-[11px]", step >= i ? "text-foreground" : "text-muted-foreground/40")}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      <p className="text-[11px] text-muted-foreground/70 text-center">
        Without Redis, each server tracks its own count — a user gets N &times; the limit across N servers
      </p>
    </div>
  );
}

export default function RateLimitingPage() {
  return (
    <div className="space-y-8">
      <TopicHero
        title="Rate Limiting"
        subtitle="Without rate limiting, one bad actor can consume all your resources and take down your service for everyone. It's the cheapest form of protection you can add."
        difficulty="intermediate"
      />

      <FailureScenario title="One user takes down the entire API">
        <p className="text-sm text-muted-foreground">
          A single user hammers your API with <strong>10,000 requests per second</strong>. Maybe
          it&apos;s a buggy client stuck in a retry loop. Maybe it&apos;s a scraper. Maybe it&apos;s
          an attacker. Your API has no rate limiting, so every request gets processed. The database
          connection pool is exhausted in seconds, response times spike to 30 seconds, and legitimate
          users get timeouts. One user has effectively created a denial of service.
        </p>
        <div className="flex items-center justify-center gap-4 py-3">
          <ServerNode type="client" label="Bad Actor" sublabel="10K req/s" status="unhealthy" />
          <span className="text-red-500 text-sm font-mono">→→→→→</span>
          <ServerNode type="server" label="API Server" sublabel="CPU: 100%" status="unhealthy" />
          <span className="text-red-500 text-sm font-mono">→→→</span>
          <ServerNode type="database" label="Database" sublabel="Pool exhausted" status="unhealthy" />
        </div>
      </FailureScenario>

      <WhyItBreaks title="Unbounded resource consumption">
        <p className="text-sm text-muted-foreground">
          Every API call consumes resources: CPU cycles, memory, database connections, network bandwidth.
          Without rate limiting, resource consumption is <strong>unbounded</strong>. A single client can
          monopolize shared resources, starving all other users. This isn&apos;t just a security problem —
          even well-intentioned clients with retry bugs can accidentally DDoS your service. Exponential
          backoff without jitter turns a transient failure into a synchronized thundering herd.
        </p>
        <div className="grid grid-cols-2 gap-2 mt-3">
          {[
            { label: "Buggy retry loop", desc: "Client retries on failure without backoff — each failure spawns more retries" },
            { label: "Scraper / bot", desc: "Automated client crawls every endpoint as fast as possible" },
            { label: "Credential stuffing", desc: "Attacker tries millions of stolen password combos against /login" },
            { label: "Thundering herd", desc: "Cache expires, 10K clients all hit the database simultaneously" },
          ].map((item) => (
            <div key={item.label} className="flex items-start gap-2.5 rounded-lg bg-muted/30 p-3">
              <XCircle className="size-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold">{item.label}</p>
                <p className="text-[11px] text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </WhyItBreaks>

      <ConceptVisualizer title="Rate Limiting Algorithms Compared">
        <p className="text-sm text-muted-foreground mb-4">
          There&apos;s no single &quot;best&quot; algorithm — each makes different tradeoffs between
          burst tolerance, memory usage, and accuracy. Click each algorithm to see how it shapes
          traffic over time.
        </p>
        <AlgorithmComparisonViz />
      </ConceptVisualizer>

      <ConceptVisualizer title="Token Bucket — Interactive">
        <p className="text-sm text-muted-foreground mb-4">
          The token bucket is the most popular algorithm in practice (used by AWS, Stripe, and most
          API gateways). A bucket holds tokens; each request costs one token. Tokens refill at a fixed
          rate. The <strong>capacity</strong> controls maximum burst size; the <strong>refill rate</strong>{" "}
          controls sustained throughput. Try sending bursts and watch the bucket drain and refill.
        </p>
        <TokenBucketViz />
        <ConversationalCallout type="tip">
          In implementation, a token bucket only needs two values: <code className="text-xs bg-muted px-1 rounded font-mono">token_count</code> and{" "}
          <code className="text-xs bg-muted px-1 rounded font-mono">last_refill_timestamp</code>.
          On each request, calculate how many tokens have accumulated since the last refill, add them
          (up to capacity), then try to consume one. No background refill thread needed.
        </ConversationalCallout>
      </ConceptVisualizer>

      <ConceptVisualizer title="Distributed Rate Limiting with Redis">
        <p className="text-sm text-muted-foreground mb-4">
          If your app runs on multiple servers, in-memory counters don&apos;t work — a user gets
          N times the limit across N servers. You need a shared store. Redis is the standard choice
          because it&apos;s fast (sub-millisecond), supports atomic operations, and has built-in
          key expiration.
        </p>
        <DistributedRateLimitViz />
        <AhaMoment
          question="Won't calling Redis on every request add latency?"
          answer={
            <p>
              Redis responds in under 1ms for simple operations like INCR. That&apos;s negligible
              compared to your API&apos;s total response time. The alternative — no rate limiting —
              means a single abusive client can make your API take 30 seconds for everyone. Use a
              Lua script to make the check-and-increment atomic:{" "}
              <code className="text-xs bg-muted px-1 rounded font-mono">MULTI / INCR / EXPIRE / EXEC</code>{" "}
              in a single round trip. For the sliding window counter approach, use Redis hashes to
              store per-interval counts and compute the weighted average server-side.
            </p>
          }
        />
      </ConceptVisualizer>

      <CorrectApproach title="Where and How to Rate Limit">
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-semibold">1. Edge / API Gateway (first line of defense)</h4>
            <p className="text-sm text-muted-foreground">
              NGINX, Kong, AWS API Gateway, or Cloudflare rate limiting. Reject requests before
              they reach your application. This is the cheapest place to say no — a rejected request
              at the edge costs almost nothing. Use IP-based or API-key-based limits here.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold">2. Application middleware (business logic limits)</h4>
            <p className="text-sm text-muted-foreground">
              Per-user, per-endpoint, per-tier limits. Free users get 100 calls/day; paid users get 10,000.
              Use Redis-backed counters shared across all app instances. This layer understands
              your business context — the edge layer doesn&apos;t know about subscription tiers.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold">3. Critical endpoint protection</h4>
            <p className="text-sm text-muted-foreground">
              Stricter limits on sensitive endpoints:{" "}
              <code className="text-xs bg-muted px-1 rounded font-mono">/login</code> (5/min to prevent brute force),{" "}
              <code className="text-xs bg-muted px-1 rounded font-mono">/signup</code> (10/hour to prevent spam),{" "}
              <code className="text-xs bg-muted px-1 rounded font-mono">/api/search</code> (30/min to prevent expensive queries).
              These are independent of global limits.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold">4. Global safety net</h4>
            <p className="text-sm text-muted-foreground">
              A hard ceiling on total requests per second across all users. This prevents cascading
              failures even if per-user limits are misconfigured. Think of it as circuit breaker
              for your entire API surface.
            </p>
          </div>
        </div>
      </CorrectApproach>

      <BeforeAfter
        before={{
          title: "No Rate Limiting",
          content: (
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="font-mono text-xs bg-muted/50 p-2 rounded">
                {`app.get('/api/data', (req, res) => {`}<br />
                {`  // No limits — process everything`}<br />
                {`  const data = await db.query(...);`}<br />
                {`  res.json(data);`}<br />
                {`});`}
              </p>
              <p>
                One aggressive client exhausts database connections. Response times spike for
                all users. Your monitoring triggers at 3 AM.
              </p>
            </div>
          ),
        }}
        after={{
          title: "Layered Rate Limiting",
          content: (
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="font-mono text-xs bg-muted/50 p-2 rounded">
                {`app.use(edgeRateLimit(1000)); // global`}<br />
                {`app.use(userRateLimit(100));  // per-user`}<br />
                {`app.get('/api/data',`}<br />
                {`  endpointLimit(30),  // per-endpoint`}<br />
                {`  handler`}<br />
                {`);`}
              </p>
              <p>
                Three layers: global safety net, per-user fairness, and per-endpoint protection.
                Abusers get 429s; everyone else is unaffected.
              </p>
            </div>
          ),
        }}
      />

      <AhaMoment
        question="Why not just block abusive IPs instead of rate limiting?"
        answer={
          <p>
            IP blocking is reactive — you have to detect abuse first, which means damage is already
            done. Rate limiting is proactive — it prevents abuse before it happens. Also, many users
            share IPs (corporate NATs, mobile carriers, university networks), so blocking an IP can
            block thousands of legitimate users. And attackers rotate IPs easily using botnets or cloud
            VMs. Rate limiting is surgical; IP blocking is a blunt instrument. Use both together:
            rate limit by default, block IPs only for confirmed, persistent abuse.
          </p>
        }
      />

      <ConversationalCallout type="warning">
        Always return <code className="text-xs bg-muted px-1 rounded font-mono">429 Too Many Requests</code> with a{" "}
        <code className="text-xs bg-muted px-1 rounded font-mono">Retry-After</code> header and include{" "}
        <code className="text-xs bg-muted px-1 rounded font-mono">X-RateLimit-Limit</code>,{" "}
        <code className="text-xs bg-muted px-1 rounded font-mono">X-RateLimit-Remaining</code>, and{" "}
        <code className="text-xs bg-muted px-1 rounded font-mono">X-RateLimit-Reset</code> headers on
        every response. Good clients will proactively slow down as they approach the limit.
        Returning 500 or silently dropping requests makes debugging impossible for API consumers.
      </ConversationalCallout>

      <ConversationalCallout type="tip">
        In system design interviews, mention rate limiting early when discussing any API. State the
        algorithm you&apos;d use (token bucket for most cases, sliding window for strict enforcement),
        where you&apos;d enforce it (edge + application), and how you&apos;d coordinate across instances
        (Redis). Bonus points for mentioning rate limit headers, exponential backoff with jitter for
        clients, and different limits for different API tiers.
      </ConversationalCallout>

      <ConversationalCallout type="warning">
        API-layer rate limiting isn&apos;t enough. A single expensive query (full table scan, unindexed
        join) can exhaust your database even under normal API limits. Consider connection pool limits and
        query timeouts as a second line of defense. A query that runs for 30 seconds holds a database
        connection hostage — if your pool has 100 connections and 100 slow queries land simultaneously,
        every subsequent request gets a connection timeout regardless of rate limits.
      </ConversationalCallout>

      <AhaMoment
        question="What happens if two requests arrive simultaneously and both check the counter before either increments it?"
        answer={
          <p>
            Both pass! This is the classic race condition in distributed rate limiting. If Request A reads
            count=99 and Request B reads count=99 before either writes count=100, both think they are under
            the limit of 100. The fix: use Redis{" "}
            <code className="text-xs bg-muted px-1 rounded font-mono">EVAL</code> with a Lua script to make
            check-and-increment atomic. This is why{" "}
            <code className="text-xs bg-muted px-1 rounded font-mono">MULTI/EXEC</code> isn&apos;t enough —
            MULTI queues commands but doesn&apos;t let you branch on intermediate results. A Lua script executes
            entirely within Redis as a single atomic operation: read the counter, check the limit, increment
            if allowed, and return the result — all without any other command interleaving.
          </p>
        }
      />

      <KeyTakeaway
        points={[
          "Rate limiting caps how many requests a client can make in a time window, protecting shared resources from accidental and intentional abuse.",
          "Token bucket allows controlled bursts (capacity) while enforcing a long-term rate (refill). Sliding window prevents the boundary-burst problem of fixed windows.",
          "Leaky bucket enforces a strict constant output rate — best when downstream systems need predictable, smooth traffic.",
          "Use Redis for distributed rate limiting. In-memory counters per server mean a user gets N times the limit across N servers. Lua scripts make check-and-increment atomic.",
          "Apply rate limits at multiple layers: edge/API gateway (cheapest), application middleware (business logic), per-endpoint (sensitive routes), and global (safety net).",
          "Return HTTP 429 with Retry-After and X-RateLimit-* headers so well-behaved clients can back off gracefully.",
        ]}
      />
    </div>
  );
}
