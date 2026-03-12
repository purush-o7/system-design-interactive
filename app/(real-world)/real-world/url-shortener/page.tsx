"use client";

import { useState, useEffect, useRef } from "react";
import { TopicHero } from "@/components/topic-hero";
import { FailureScenario } from "@/components/failure-scenario";
import { WhyItBreaks } from "@/components/why-it-breaks";
import { ConceptVisualizer } from "@/components/concept-visualizer";
import { CorrectApproach } from "@/components/correct-approach";
import { KeyTakeaway } from "@/components/key-takeaway";
import { AnimatedFlow } from "@/components/animated-flow";
import { ServerNode } from "@/components/server-node";
import { MetricCounter } from "@/components/metric-counter";
import { AhaMoment } from "@/components/aha-moment";
import { ConversationalCallout } from "@/components/conversational-callout";
import { ScaleSimulator } from "@/components/scale-simulator";
import { InteractiveDemo } from "@/components/interactive-demo";
import { BeforeAfter } from "@/components/before-after";
import { cn } from "@/lib/utils";
import { Link2, Hash, Database, Zap, ArrowRight, CheckCircle2, Globe, Server } from "lucide-react";

function Base62EncoderViz() {
  const [inputId, setInputId] = useState(123456789);
  const [steps, setSteps] = useState<{ remainder: number; char: string; quotient: number }[]>([]);
  const [result, setResult] = useState("");

  useEffect(() => {
    const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const newSteps: { remainder: number; char: string; quotient: number }[] = [];
    let n = inputId;
    let encoded = "";
    while (n > 0) {
      const remainder = n % 62;
      newSteps.push({ remainder, char: chars[remainder], quotient: Math.floor(n / 62) });
      encoded = chars[remainder] + encoded;
      n = Math.floor(n / 62);
    }
    setSteps(newSteps);
    setResult(encoded || "0");
  }, [inputId]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <label className="text-xs text-muted-foreground font-medium">ID:</label>
        <input
          type="number"
          value={inputId}
          onChange={(e) => setInputId(Math.max(1, Math.min(999999999999, Number(e.target.value))))}
          className="bg-muted/30 border border-border/50 rounded-md px-3 py-1.5 text-sm font-mono w-40 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
        />
        <ArrowRight className="size-4 text-muted-foreground/50" />
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-md px-3 py-1.5">
          <span className="text-sm font-mono font-bold text-emerald-400">{result}</span>
        </div>
      </div>
      <div className="space-y-1">
        <div className="grid grid-cols-4 gap-2 text-[10px] font-mono text-muted-foreground/60 px-1">
          <span>Step</span>
          <span>ID / 62</span>
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
      <p className="text-[11px] text-muted-foreground/60">
        Repeatedly divide by 62 and map each remainder to a character (0-9, a-z, A-Z). The result is a compact, URL-safe string.
      </p>
    </div>
  );
}

function RequestFlowViz() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % 9), 900);
    return () => clearInterval(t);
  }, []);

  const layers = [
    { label: "Client", icon: "globe", desc: "GET /abc123", active: step >= 0 },
    { label: "Load Balancer", icon: "lb", desc: "Route to API server", active: step >= 1 },
    { label: "API Server", icon: "server", desc: "Parse short code", active: step >= 2 },
    { label: "Redis Cache", icon: "cache", desc: step >= 3 && step < 5 ? "Cache HIT" : "Lookup abc123", active: step >= 3 },
    { label: "Database", icon: "db", desc: "Fallback (5% of requests)", active: step >= 5 && step < 6, dimmed: step >= 3 && step < 5 },
    { label: "301/302 Redirect", icon: "redirect", desc: "Location: https://original-url.com/very/long/path", active: step >= 6 },
  ];

  return (
    <div className="space-y-1.5">
      {layers.map((layer, i) => (
        <div key={layer.label} className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-muted-foreground/40 w-5 text-right">{i + 1}</span>
          <div className="flex-1 flex items-center gap-2">
            <div
              className={cn(
                "h-8 rounded-md flex items-center px-3 text-xs font-medium transition-all duration-300 border gap-2",
                step >= i && !layer.dimmed
                  ? step === i
                    ? "bg-blue-500/10 border-blue-500/30 text-blue-400 ring-1 ring-blue-500/20"
                    : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : "bg-muted/20 border-border/50 text-muted-foreground/30"
              )}
              style={{ width: `${50 + i * 8}%` }}
            >
              <span className="font-semibold">{layer.label}</span>
              <span className="text-[10px] font-normal opacity-70 truncate">{layer.desc}</span>
            </div>
          </div>
        </div>
      ))}
      <div className="flex items-center gap-2 pt-2 pl-8">
        {step >= 7 && (
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
            <CheckCircle2 className="size-3.5" />
            Redirect complete in ~15ms (cache hit) or ~45ms (DB fallback)
          </div>
        )}
        {step < 7 && (
          <div className="text-[11px] text-muted-foreground/50 animate-pulse">
            Processing request...
          </div>
        )}
      </div>
    </div>
  );
}

function CollisionStrategyViz() {
  const [strategy, setStrategy] = useState<"counter" | "hash" | "snowflake">("counter");

  const strategies = {
    counter: {
      title: "Counter-Based (Simple)",
      pros: ["Zero collisions by design", "Predictable, sequential IDs", "Single atomic operation (INCR)"],
      cons: ["Single point of failure if centralized", "IDs are guessable / enumerable", "Requires coordination at scale"],
      flow: ["Atomic INCR on counter", "ID: 1000001", "Base62 encode", "Result: 4c93"],
    },
    hash: {
      title: "Hash-Based (MD5/SHA)",
      pros: ["No central coordination needed", "Same URL always gets same hash", "Stateless generation"],
      cons: ["Collision risk when truncating", "Need collision detection + retry", "Extra DB lookup per write"],
      flow: ["MD5(longURL)", "a3f2b8c1d9e4...", "Take first 7 chars", "Result: a3f2b8c"],
    },
    snowflake: {
      title: "Snowflake ID (Distributed)",
      pros: ["No coordination between servers", "Globally unique, no collisions", "Encodes timestamp + machine ID"],
      cons: ["Slightly longer IDs (64-bit)", "Clock sync required", "More complex implementation"],
      flow: ["Timestamp bits (41)", "+ Machine ID (10)", "+ Sequence (12)", "Result: 7bR9kL2"],
    },
  };

  const s = strategies[strategy];

  return (
    <div className="space-y-4">
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

      <div className="flex gap-1.5">
        {s.flow.map((step, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="bg-muted/30 border border-border/50 rounded-md px-2 py-1 text-[10px] font-mono">
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
              <span className="text-emerald-400 mt-0.5">+</span>
              {p}
            </div>
          ))}
        </div>
        <div className="space-y-1.5">
          <p className="text-[10px] font-semibold text-orange-400 uppercase tracking-wider">Cons</p>
          {s.cons.map((c) => (
            <div key={c} className="flex items-start gap-1.5 text-xs text-muted-foreground">
              <span className="text-orange-400 mt-0.5">-</span>
              {c}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReadWriteRatioViz() {
  const [step, setStep] = useState(0);
  const readBarHeights = useRef(Array.from({ length: 100 }, () => 30 + Math.random() * 70));
  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % 100), 80);
    return () => clearInterval(t);
  }, []);

  const writes = 1;
  const reads = 99;
  const totalBars = 100;

  return (
    <div className="space-y-3">
      <div className="flex items-end gap-[2px] h-16">
        {Array.from({ length: totalBars }).map((_, i) => {
          const isWrite = i === 0;
          const isActive = i <= step;
          return (
            <div
              key={i}
              className={cn(
                "flex-1 rounded-t-sm transition-all duration-150",
                isWrite
                  ? isActive ? "bg-amber-400" : "bg-amber-400/20"
                  : isActive ? "bg-blue-400/80" : "bg-blue-400/10"
              )}
              style={{ height: isWrite ? "100%" : `${readBarHeights.current[i]}%` }}
            />
          );
        })}
      </div>
      <div className="flex items-center justify-between text-[10px] font-mono">
        <div className="flex items-center gap-2">
          <div className="size-2.5 rounded-sm bg-amber-400" />
          <span className="text-muted-foreground">Writes ({writes}%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="size-2.5 rounded-sm bg-blue-400" />
          <span className="text-muted-foreground">Reads ({reads}%)</span>
        </div>
      </div>
      <p className="text-[11px] text-muted-foreground/60">
        For every URL shortened, it gets clicked ~100 times. Your architecture must be optimized for reads.
      </p>
    </div>
  );
}

export default function UrlShortenerPage() {
  return (
    <div className="space-y-8">
      <TopicHero
        title="Design a URL Shortener"
        subtitle="Sounds simple until you realize a 100:1 read-to-write ratio means your naive design melts under read traffic. Services like Bitly handle 28 billion redirects per month — let's see how."
        difficulty="intermediate"
      />

      <FailureScenario title="Your shortener goes viral — and immediately falls over">
        <p className="text-sm text-muted-foreground">
          You launch a URL shortener backed by a single Postgres instance. Writes work fine at first
          — a few hundred shortened URLs per second. But each shortened URL gets clicked
          <strong> hundreds of times</strong>. A marketing campaign goes viral, and suddenly you are
          handling 50,000 redirect lookups per second. Your database connection pool is exhausted,
          p99 latency spikes to 5+ seconds, and users start seeing gateway timeouts on what should be
          an instant redirect.
        </p>
        <div className="grid grid-cols-3 gap-3 pt-2">
          <MetricCounter label="Write Rate" value={200} unit="req/s" trend="neutral" />
          <MetricCounter label="Read Rate" value={50000} unit="req/s" trend="up" />
          <MetricCounter label="P99 Latency" value={5200} unit="ms" trend="up" />
        </div>
        <div className="flex items-center justify-center gap-4 pt-3">
          <ServerNode type="client" label="Users" sublabel="clicking links" />
          <span className="text-red-500 text-lg font-mono">---&gt;</span>
          <ServerNode type="server" label="API" sublabel="overwhelmed" status="warning" />
          <span className="text-red-500 text-lg font-mono">---&gt;</span>
          <ServerNode type="database" label="Postgres" sublabel="connection pool full" status="unhealthy" />
        </div>
      </FailureScenario>

      <WhyItBreaks title="The 100:1 read-to-write ratio catches you off guard">
        <p className="text-sm text-muted-foreground">
          URL shorteners are <strong>massively read-heavy</strong>. For every URL created, it gets
          redirected hundreds or thousands of times. If you route every redirect through the database,
          you pay for a disk lookup on every single click. The database becomes the bottleneck — not
          because writes are expensive, but because reads overwhelm it.
        </p>
        <ReadWriteRatioViz />
        <div className="grid grid-cols-2 gap-2 mt-3">
          {[
            { n: "1", label: "No Caching", desc: "Every redirect hits the DB" },
            { n: "2", label: "Single DB", desc: "Connection pool exhausted at scale" },
            { n: "3", label: "No ID Strategy", desc: "Hash collisions under load" },
            { n: "4", label: "No Analytics Separation", desc: "Click tracking slows redirects" },
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

      <ConceptVisualizer title="Base62 Encoding — How Short URLs Are Born">
        <p className="text-sm text-muted-foreground mb-4">
          Base62 uses 62 URL-safe characters: <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">a-z A-Z 0-9</code>.
          A 7-character Base62 string can represent 62<sup>7</sup> = <strong>3.5 trillion</strong> unique URLs.
          For comparison, Bitly has shortened roughly 50 billion URLs total — so 7 characters gives you 70x headroom.
          The algorithm is simple: repeatedly divide your numeric ID by 62, and map each remainder to a character.
        </p>
        <Base62EncoderViz />
        <ConversationalCallout type="tip">
          Try changing the ID above. Notice how small IDs produce short codes and large IDs produce
          longer ones. With a 7-character limit, you can represent IDs up to 3.5 trillion — far more
          than any shortener will ever need.
        </ConversationalCallout>
      </ConceptVisualizer>

      <ConceptVisualizer title="ID Generation Strategies — Avoiding Collisions">
        <p className="text-sm text-muted-foreground mb-4">
          The short code is only as good as the ID behind it. You need a strategy that guarantees
          uniqueness at scale without becoming a bottleneck. Here are the three main approaches, each
          with real trade-offs.
        </p>
        <CollisionStrategyViz />
        <AhaMoment
          question="Which approach do real URL shorteners use?"
          answer={
            <p>
              Bitly uses a Snowflake-style approach — each server generates IDs independently using
              a combination of timestamp, machine ID, and sequence number. This gives globally unique
              IDs with no central coordination. Redis INCR is popular for simpler services. Hash-based
              approaches are rare in production because collision handling adds unnecessary complexity.
            </p>
          }
        />
      </ConceptVisualizer>

      <ConceptVisualizer title="The Full Request Flow — Read Path">
        <p className="text-sm text-muted-foreground mb-4">
          When someone clicks a short link, this is what happens. The critical insight: 95% of requests
          never touch the database. Redis handles them in under 1ms.
        </p>
        <RequestFlowViz />
      </ConceptVisualizer>

      <CorrectApproach title="Production Architecture">
        <p className="text-sm text-muted-foreground mb-4">
          The key insight: put a cache layer in front of the database for reads. Most shortened URLs
          follow a power-law distribution — a small percentage of URLs get the vast majority of clicks.
          Redis with even 10GB of memory can cache tens of millions of URL mappings and handle
          100K+ lookups per second per node. Separate the analytics pipeline so click tracking
          never slows down redirects.
        </p>
        <div className="flex flex-col items-center gap-6">
          <ServerNode type="client" label="Client" sublabel="clicks short URL" />
          <ServerNode type="loadbalancer" label="Load Balancer" sublabel="round-robin to API servers" status="healthy" />
          <div className="flex gap-4 flex-wrap justify-center">
            <ServerNode type="server" label="API Server 1" sublabel="stateless" status="healthy" />
            <ServerNode type="server" label="API Server 2" sublabel="stateless" status="healthy" />
            <ServerNode type="server" label="API Server 3" sublabel="stateless" status="healthy" />
          </div>
          <div className="flex gap-4 flex-wrap justify-center">
            <ServerNode type="cache" label="Redis Cluster" sublabel="hot URL lookups (95% hit rate)" status="healthy" />
            <ServerNode type="cloud" label="Kafka" sublabel="async click events" status="healthy" />
          </div>
          <div className="flex gap-4 flex-wrap justify-center">
            <ServerNode type="database" label="Primary DB" sublabel="URL mappings (writes)" status="healthy" />
            <ServerNode type="database" label="Read Replica" sublabel="cache-miss fallback" status="healthy" />
            <ServerNode type="database" label="Analytics DB" sublabel="click stats (async)" status="healthy" />
          </div>
        </div>
      </CorrectApproach>

      <ConceptVisualizer title="Write Path — Shortening a URL">
        <AnimatedFlow
          steps={[
            { id: "receive", label: "Receive Long URL", description: "POST /api/shorten with destination URL", icon: <Link2 className="size-4" /> },
            { id: "generate", label: "Generate Unique ID", description: "Snowflake or Redis INCR — no collisions", icon: <Zap className="size-4" /> },
            { id: "encode", label: "Base62 Encode", description: "ID 12345678 becomes '14q60'", icon: <Hash className="size-4" /> },
            { id: "store", label: "Store Mapping", description: "Write shortCode → longURL to DB", icon: <Database className="size-4" /> },
            { id: "cache", label: "Populate Cache", description: "Write-through to Redis for instant reads", icon: <Zap className="size-4" /> },
            { id: "return", label: "Return Short URL", description: "sho.rt/14q60 ready for sharing", icon: <Link2 className="size-4" /> },
          ]}
          interval={1500}
        />
        <ConversationalCallout type="question">
          Why not just MD5-hash the URL? MD5 produces 128 bits — truncating to 7 characters creates
          collision risk. With 1 billion URLs, the birthday paradox gives you a 50% chance of collision
          at just 77,000 entries with a 7-char hex space. A counter-based approach has zero collisions by design.
        </ConversationalCallout>
      </ConceptVisualizer>

      <InteractiveDemo title="Simulate URL Shortening">
        {({ isPlaying, tick }) => {
          const urls = [
            "https://example.com/products/summer-sale-2025/category/electronics?utm_source=newsletter",
            "https://docs.company.io/api/v2/authentication/oauth2/flows/authorization-code",
            "https://blog.tech.io/2025/03/understanding-distributed-systems-consensus-algorithms",
          ];
          const url = urls[tick % urls.length];
          const stages = [
            { name: "Validate", time: "~1ms", desc: `URL is valid: ${url.substring(0, 35)}...` },
            { name: "Gen ID", time: "~0.5ms", desc: `Snowflake ID: ${10000000 + tick * 7919}` },
            { name: "Encode", time: "~0.1ms", desc: `Base62: "${(10000000 + tick * 7919).toString(36).substring(0, 7)}"` },
            { name: "Write DB", time: "~5ms", desc: "INSERT INTO urls (code, destination)" },
            { name: "Set Cache", time: "~0.5ms", desc: "Redis SET with 30-day TTL" },
          ];
          const active = isPlaying ? Math.min(tick % 7, stages.length) : 0;

          return (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Press play to watch the shortening pipeline process a URL in real time.
              </p>
              <div className="bg-muted/20 rounded-md p-2 text-[11px] font-mono text-muted-foreground break-all border border-border/30">
                {isPlaying ? url : "Waiting..."}
              </div>
              <div className="space-y-1.5">
                {stages.map((stage, i) => (
                  <div
                    key={stage.name}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border px-3 py-2 transition-all duration-400",
                      i < active
                        ? "bg-emerald-500/8 border-emerald-500/20"
                        : i === active && isPlaying
                        ? "bg-blue-500/8 border-blue-500/20 ring-1 ring-blue-500/15"
                        : "bg-muted/10 border-border/30 text-muted-foreground/40"
                    )}
                  >
                    <span className={cn(
                      "text-xs font-mono font-bold w-16",
                      i < active ? "text-emerald-400" : i === active && isPlaying ? "text-blue-400" : ""
                    )}>
                      {stage.name}
                    </span>
                    <div className="flex-1 text-xs text-muted-foreground truncate">
                      {i < active ? stage.desc : "—"}
                    </div>
                    <span className={cn(
                      "text-[10px] font-mono shrink-0",
                      i < active ? "text-muted-foreground" : "text-transparent"
                    )}>
                      {stage.time}
                    </span>
                  </div>
                ))}
              </div>
              {active >= stages.length && (
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                  <CheckCircle2 className="size-3.5" />
                  Total time: ~7ms — URL is ready to share
                </div>
              )}
            </div>
          );
        }}
      </InteractiveDemo>

      <ScaleSimulator
        title="Read Throughput Simulator"
        min={100}
        max={500000}
        step={1000}
        unit="redirects/s"
        metrics={(v) => [
          { label: "Cache Hits (95%)", value: Math.round(v * 0.95), unit: "req/s" },
          { label: "DB Reads (5%)", value: Math.round(v * 0.05), unit: "req/s" },
          { label: "Redis Nodes Needed", value: Math.max(1, Math.ceil(v / 100000)), unit: "nodes" },
          { label: "API Servers Needed", value: Math.max(2, Math.ceil(v / 10000)), unit: "servers" },
          { label: "P99 Latency (cache)", value: Math.min(50, 1 + Math.round(v / 100000)), unit: "ms" },
          { label: "Monthly Cost Est.", value: Math.round(200 + v * 0.0002 * 720), unit: "$" },
        ]}
      >
        {({ value }) => (
          <p className="text-xs text-muted-foreground">
            {value < 10000
              ? `At ${value.toLocaleString()} redirects/s, a single Redis node and 2 API servers handle this easily. Total DB load is just ${Math.round(value * 0.05).toLocaleString()} reads/s.`
              : value < 100000
              ? `At ${value.toLocaleString()} redirects/s, you need a Redis cluster and ${Math.ceil(value / 10000)} API servers. The DB only sees ${Math.round(value * 0.05).toLocaleString()} reads/s — still manageable.`
              : `At ${(value / 1000).toFixed(0)}K redirects/s, you are operating at Bitly scale. ${Math.ceil(value / 100000)} Redis nodes, ${Math.ceil(value / 10000)} API servers, and read replicas for the DB. Cache is doing the heavy lifting.`}
          </p>
        )}
      </ScaleSimulator>

      <ConceptVisualizer title="301 vs 302 — The Analytics Trade-off">
        <BeforeAfter
          before={{
            title: "301 Permanent Redirect",
            content: (
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>Browser caches the redirect forever</li>
                <li>Subsequent clicks never hit your server</li>
                <li>Lowest latency for repeat visitors</li>
                <li>Zero visibility into click analytics</li>
                <li>Cannot change the destination URL later</li>
              </ul>
            ),
          }}
          after={{
            title: "302 Temporary Redirect",
            content: (
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>Browser does NOT cache the redirect</li>
                <li>Every click goes through your server</li>
                <li>Full analytics: clicks, referrers, geo</li>
                <li>Can update destination URL anytime</li>
                <li>Higher server load (every click counted)</li>
              </ul>
            ),
          }}
        />
        <ConversationalCallout type="tip">
          Most URL shorteners (Bitly, TinyURL) use <strong>302 redirects</strong> because analytics are
          a core feature. Click counts, geographic distribution, referrer tracking, and time-series data
          are what make shorteners valuable to marketers. If you do not need analytics, 301 is more efficient.
        </ConversationalCallout>
      </ConceptVisualizer>

      <AhaMoment
        question="How do you handle custom short codes (vanity URLs)?"
        answer={
          <p>
            Vanity URLs like <code className="text-xs bg-muted px-1 rounded font-mono">sho.rt/summer-sale</code> bypass
            the ID generator entirely. The user picks the code, and you simply check if it already exists in the DB.
            Reserve a separate namespace (e.g., require 8+ characters for vanity vs 7 for auto-generated) to avoid
            collisions between the two systems. Charge extra for vanity URLs — they are a premium feature.
          </p>
        }
      />

      <ConversationalCallout type="warning">
        At Bitly scale (28 billion redirects/month), you need to distribute ID generation across servers.
        Pre-allocate ID ranges to each server (Server 1 gets IDs 1-1,000,000, Server 2 gets 1,000,001-2,000,000)
        or use Twitter&apos;s Snowflake approach where each server generates 64-bit IDs independently using
        timestamp + machine ID + sequence number. Either way, zero coordination between servers on writes.
      </ConversationalCallout>

      <KeyTakeaway
        points={[
          "URL shorteners are read-heavy (100:1 ratio). Design the read path first — cache everything in Redis.",
          "Base62 encoding of a unique numeric ID gives collision-free, URL-safe short codes. 7 characters = 3.5 trillion URLs.",
          "Three ID strategies: counter (simple, centralized), hash (stateless, collision-prone), Snowflake (distributed, production-grade).",
          "A Redis cache with 95% hit rate means your DB only handles 5% of traffic — easily manageable.",
          "Use 302 redirects if you need click analytics; 301 if you want to minimize server load.",
          "Separate analytics into an async pipeline (Kafka) so click tracking never slows down redirects.",
          "At scale, use Snowflake IDs or pre-allocated ID ranges to avoid any single bottleneck on writes.",
        ]}
      />
    </div>
  );
}
