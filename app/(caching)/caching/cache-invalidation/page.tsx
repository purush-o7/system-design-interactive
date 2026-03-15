"use client";

import { useState, useEffect } from "react";
import { TopicHero } from "@/components/topic-hero";
import { FailureScenario } from "@/components/failure-scenario";
import { WhyItBreaks } from "@/components/why-it-breaks";
import { ConceptVisualizer } from "@/components/concept-visualizer";
import { CorrectApproach } from "@/components/correct-approach";
import { KeyTakeaway } from "@/components/key-takeaway";
import { AhaMoment } from "@/components/aha-moment";
import { ConversationalCallout } from "@/components/conversational-callout";
import { BeforeAfter } from "@/components/before-after";
import { AnimatedFlow } from "@/components/animated-flow";
import { MetricCounter } from "@/components/metric-counter";
import { ServerNode } from "@/components/server-node";
import { InteractiveDemo } from "@/components/interactive-demo";
import { cn } from "@/lib/utils";
import { WhyCare } from "@/components/why-care";
import { GlossaryTerm } from "@/components/glossary-term";
import { TopicQuiz } from "@/components/topic-quiz";


function StaleDataTimeline() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!isPlaying) return;
    const t = setInterval(() => setTick((s) => (s + 1) % 60), 150);
    return () => clearInterval(t);
  }, [isPlaying]);

  const ttl = 30;
  const dataChangeAt = 12;
  const isStale = tick >= dataChangeAt && tick < ttl;
  const progress = (tick / 60) * 100;

  return (
    <div className="space-y-3">
      <div className="flex gap-2 mb-3">
        <button onClick={() => setIsPlaying(p => !p)}
          className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 border border-violet-500/20 transition-colors">
          {isPlaying ? "⏸ Pause" : "▶ Start"}
        </button>
        <button onClick={() => { setIsPlaying(false); setTick(0); }}
          className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium bg-muted/50 text-muted-foreground hover:bg-muted transition-colors">
          ↺ Reset
        </button>
      </div>
      <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
        <span>0s</span>
        <span>TTL = {ttl}s</span>
        <span>60s</span>
      </div>
      <div className="relative h-10 rounded-lg border bg-muted/20 overflow-hidden">
        {/* TTL expiry marker */}
        <div
          className="absolute top-0 bottom-0 w-px bg-red-500/60 z-10"
          style={{ left: `${(ttl / 60) * 100}%` }}
        />
        <div
          className="absolute top-0 text-[9px] font-mono text-red-400 z-10"
          style={{ left: `${(ttl / 60) * 100}%`, transform: "translateX(-50%)" }}
        >
          TTL expires
        </div>
        {/* Data change marker */}
        <div
          className="absolute top-0 bottom-0 w-px bg-orange-500/60 z-10"
          style={{ left: `${(dataChangeAt / 60) * 100}%` }}
        />
        <div
          className="absolute bottom-0 text-[9px] font-mono text-orange-400 z-10"
          style={{ left: `${(dataChangeAt / 60) * 100}%`, transform: "translateX(-50%)" }}
        >
          DB changes
        </div>
        {/* Stale window */}
        <div
          className="absolute top-0 bottom-0 bg-red-500/10"
          style={{
            left: `${(dataChangeAt / 60) * 100}%`,
            width: `${((ttl - dataChangeAt) / 60) * 100}%`,
          }}
        />
        {/* Progress indicator */}
        <div
          className={cn(
            "absolute top-1/2 -translate-y-1/2 size-3 rounded-full z-20 transition-colors",
            isStale ? "bg-red-500 shadow-red-500/50 shadow-lg" : "bg-emerald-500"
          )}
          style={{ left: `${progress}%`, transform: `translate(-50%, -50%)` }}
        />
      </div>
      <div className="flex items-center gap-4 text-[10px]">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-emerald-500" /> Fresh data served
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-red-500" /> Stale data served
        </span>
        <span className="ml-auto font-mono text-muted-foreground">
          {isStale ? (
            <span className="text-red-400">STALE for {tick - dataChangeAt}s</span>
          ) : tick >= ttl ? (
            <span className="text-emerald-400">Re-fetched</span>
          ) : (
            <span className="text-emerald-400">Fresh</span>
          )}
        </span>
      </div>
    </div>
  );
}

function TTLCountdown() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [seconds, setSeconds] = useState(30);
  useEffect(() => {
    if (!isPlaying) return;
    const t = setInterval(() => setSeconds((s) => (s <= 0 ? 30 : s - 1)), 200);
    return () => clearInterval(t);
  }, [isPlaying]);

  const pct = (seconds / 30) * 100;
  const isLow = seconds <= 5;
  const isExpired = seconds === 0;

  return (
    <div className="space-y-2">
      <div className="flex gap-2 mb-3">
        <button onClick={() => setIsPlaying(p => !p)}
          className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 border border-violet-500/20 transition-colors">
          {isPlaying ? "⏸ Pause" : "▶ Start"}
        </button>
        <button onClick={() => { setIsPlaying(false); setSeconds(30); }}
          className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium bg-muted/50 text-muted-foreground hover:bg-muted transition-colors">
          ↺ Reset
        </button>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1 h-6 rounded-md bg-muted/30 border overflow-hidden relative">
          <div
            className={cn(
              "h-full transition-all duration-200 rounded-md",
              isExpired
                ? "bg-red-500/40"
                : isLow
                ? "bg-orange-500/30"
                : "bg-emerald-500/20"
            )}
            style={{ width: `${pct}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className={cn(
                "text-xs font-mono font-bold",
                isExpired ? "text-red-400" : isLow ? "text-orange-400" : "text-emerald-400"
              )}
            >
              {isExpired ? "EXPIRED — refetching..." : `TTL: ${seconds}s`}
            </span>
          </div>
        </div>
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>Cache key: <code className="bg-muted px-1 rounded">product:price:42</code></span>
        <span>{isExpired ? "Cache MISS" : "Cache HIT"}</span>
      </div>
    </div>
  );
}

function CacheStampede() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!isPlaying) return;
    const t = setInterval(() => setTick((s) => (s + 1) % 40), 200);
    return () => clearInterval(t);
  }, [isPlaying]);

  const cacheExpired = tick >= 5;
  const requestsHitDb = cacheExpired && tick < 20;
  const requestCount = requestsHitDb ? Math.min((tick - 5) * 8, 100) : 0;
  const dbOverloaded = requestCount > 60;
  const resolved = tick >= 25;

  return (
    <div className="space-y-4">
      <div className="flex gap-2 mb-3">
        <button onClick={() => setIsPlaying(p => !p)}
          className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 border border-violet-500/20 transition-colors">
          {isPlaying ? "⏸ Pause" : "▶ Start"}
        </button>
        <button onClick={() => { setIsPlaying(false); setTick(0); }}
          className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium bg-muted/50 text-muted-foreground hover:bg-muted transition-colors">
          ↺ Reset
        </button>
      </div>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="text-center space-y-1.5">
          <div className="flex flex-wrap gap-1 max-w-[120px] justify-center">
            {Array.from({ length: Math.min(requestCount / 5, 15) }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "size-2.5 rounded-full transition-all",
                  requestsHitDb ? "bg-red-500 animate-pulse" : "bg-blue-500/40"
                )}
              />
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground">
            {requestsHitDb ? `${requestCount} requests` : "Waiting..."}
          </p>
        </div>

        <div className="flex flex-col items-center gap-1">
          <div className={cn(
            "text-xs font-mono px-2 py-1 rounded border transition-all",
            cacheExpired && !resolved
              ? "bg-red-500/10 border-red-500/30 text-red-400"
              : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
          )}>
            {!cacheExpired ? "Cache: HIT" : resolved ? "Cache: REFILLED" : "Cache: MISS"}
          </div>
          <span className="text-[10px] text-muted-foreground">
            {!cacheExpired ? "Serving cached" : resolved ? "Back to normal" : "Key expired!"}
          </span>
        </div>

        <ServerNode
          type="database"
          label="Database"
          sublabel={dbOverloaded ? "CPU: 98%" : resolved ? "CPU: 12%" : "CPU: 15%"}
          status={dbOverloaded ? "unhealthy" : "healthy"}
        />
      </div>

      <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300",
            dbOverloaded ? "bg-red-500" : "bg-emerald-500/40"
          )}
          style={{ width: `${Math.min(requestCount, 100)}%` }}
        />
      </div>
      <p className="text-[10px] text-muted-foreground text-center">
        {!cacheExpired
          ? "Popular cache key is about to expire..."
          : requestsHitDb
          ? `Cache miss! ${requestCount} concurrent requests all hitting the database simultaneously`
          : resolved
          ? "One request refilled the cache. Traffic returns to normal."
          : "Recovering..."}
      </p>
    </div>
  );
}

function EventInvalidationFlow() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (!isPlaying) return;
    const t = setInterval(() => setStep((s) => (s + 1) % 8), 1000);
    return () => clearInterval(t);
  }, [isPlaying]);

  const stages = [
    { label: "App writes to DB", icon: "pencil" },
    { label: "DB commits change", icon: "db" },
    { label: "Change event published", icon: "event" },
    { label: "Message queue delivers", icon: "queue" },
    { label: "Cache consumer receives", icon: "consumer" },
    { label: "Stale entry deleted", icon: "delete" },
    { label: "Next read = cache miss", icon: "miss" },
    { label: "Fresh data cached", icon: "fresh" },
  ];

  return (
    <div className="space-y-2">
      <div className="flex gap-2 mb-3">
        <button onClick={() => setIsPlaying(p => !p)}
          className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 border border-violet-500/20 transition-colors">
          {isPlaying ? "⏸ Pause" : "▶ Start"}
        </button>
        <button onClick={() => { setIsPlaying(false); setStep(0); }}
          className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium bg-muted/50 text-muted-foreground hover:bg-muted transition-colors">
          ↺ Reset
        </button>
      </div>
      {stages.map((s, i) => (
        <div key={s.label} className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-muted-foreground/50 w-4 text-right shrink-0">{i + 1}</span>
          <div
            className={cn(
              "flex-1 flex items-center px-3 h-7 rounded-md text-xs font-medium transition-all duration-300 border",
              step > i
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : step === i
                ? "bg-blue-500/10 border-blue-500/30 text-blue-400 ring-1 ring-blue-500/20"
                : "bg-muted/20 border-border/50 text-muted-foreground/40"
            )}
          >
            {s.label}
          </div>
          {step === i && (
            <span className="text-[10px] text-blue-400 font-mono animate-pulse">current</span>
          )}
        </div>
      ))}
      <p className="text-[10px] text-muted-foreground pl-7 pt-1">
        Staleness window: <strong className="text-emerald-400">~0ms</strong> (event-driven, no TTL wait)
      </p>
    </div>
  );
}

function VersionTaggedKeys() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [version, setVersion] = useState(1);
  useEffect(() => {
    if (!isPlaying) return;
    const t = setInterval(() => setVersion((v) => (v >= 4 ? 1 : v + 1)), 2500);
    return () => clearInterval(t);
  }, [isPlaying]);

  const keys = [
    { key: `product:42:v${version}`, status: "active" as const },
    { key: `product:42:v${version > 1 ? version - 1 : 4}`, status: "stale" as const },
    { key: `product:42:v${version > 2 ? version - 2 : version + 2}`, status: "evicted" as const },
  ];

  return (
    <div className="space-y-2">
      <div className="flex gap-2 mb-3">
        <button onClick={() => setIsPlaying(p => !p)}
          className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 border border-violet-500/20 transition-colors">
          {isPlaying ? "⏸ Pause" : "▶ Start"}
        </button>
        <button onClick={() => { setIsPlaying(false); setVersion(1); }}
          className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium bg-muted/50 text-muted-foreground hover:bg-muted transition-colors">
          ↺ Reset
        </button>
      </div>
      {keys.map((k) => (
        <div
          key={k.key}
          className={cn(
            "flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-mono transition-all",
            k.status === "active"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : k.status === "stale"
              ? "bg-orange-500/10 border-orange-500/20 text-orange-400"
              : "bg-muted/20 border-border/50 text-muted-foreground/30 line-through"
          )}
        >
          <span>{k.key}</span>
          <span className={cn(
            "text-[10px] px-1.5 py-0.5 rounded uppercase font-sans font-semibold",
            k.status === "active"
              ? "bg-emerald-500/20 text-emerald-400"
              : k.status === "stale"
              ? "bg-orange-500/20 text-orange-400"
              : "bg-muted/30 text-muted-foreground/40"
          )}>
            {k.status}
          </span>
        </div>
      ))}
      <p className="text-[10px] text-muted-foreground">
        Each write increments the version. Reads always request the latest version key.
        Old versions are eventually garbage-collected.
      </p>
    </div>
  );
}

export default function CacheInvalidationPage() {
  return (
    <div className="space-y-8">
      <TopicHero
        title="Cache Invalidation"
        subtitle="'There are only two hard things in computer science: cache invalidation and naming things.' — Phil Karlton. The quote endures because the problem is genuinely unsolvable in the general case."
        difficulty="advanced"
      />

      <WhyCare>
        Phil Karlton famously said there are only two hard problems in CS: <GlossaryTerm term="cache">cache</GlossaryTerm> invalidation and naming things. After this lesson, you&apos;ll see why &mdash; and learn practical strategies to tame the problem.
      </WhyCare>

      <FailureScenario>
        <p className="text-sm text-muted-foreground">
          Your e-commerce site runs a flash sale. Prices drop at 9:00 AM. But the old prices are
          cached with a 5-minute TTL. For the next 5 minutes, <strong className="text-foreground">customers see stale prices</strong>,
          add items to their carts at the old (higher) price, and then get angry when checkout
          shows a different amount. Support tickets flood in. Your cache was supposed to make things
          faster. Instead it made things <em>wrong</em>.
        </p>
        <div className="grid grid-cols-3 gap-3">
          <MetricCounter label="Stale Reads" value={23000} trend="up" />
          <MetricCounter label="Cart Errors" value={1840} trend="up" />
          <MetricCounter label="Support Tickets" value={312} trend="up" />
        </div>
      </FailureScenario>

      <WhyItBreaks>
        <p className="text-sm text-muted-foreground">
          The fundamental tension: caching makes things fast by serving old data, but the business
          needs fresh data. <strong className="text-foreground">Every <GlossaryTerm term="cache">cache</GlossaryTerm> entry is a bet</strong> that the underlying data
          will not change before the cache expires. When that bet is wrong, users see stale state.
        </p>
        <p className="text-sm text-muted-foreground">
          The problem is harder than it sounds because in a distributed system, there is no single
          moment when data &quot;changes.&quot; Different nodes learn about changes at different times.
          The source of truth is not a single database row &mdash; it is a wave of updates propagating
          through a network. Your cache is always, at best, an approximation of reality.
        </p>
      </WhyItBreaks>

      <ConceptVisualizer title="The Stale Data Window">
        <p className="text-sm text-muted-foreground mb-4">
          Watch the timeline below. The cache is set with a 30-second TTL. At second 12, the
          underlying data changes in the database &mdash; but the cache still serves the old value
          until the TTL expires. The red zone is the <strong>staleness window</strong>: the period
          where every read returns incorrect data.
        </p>
        <StaleDataTimeline />
        <ConversationalCallout type="question">
          How long is your staleness window? With a 5-minute TTL, it could be up to 5 minutes.
          For a product catalog that is fine. For a stock price or seat availability, it is
          catastrophic. The TTL you choose is a statement about how wrong you are willing to be.
        </ConversationalCallout>
      </ConceptVisualizer>

      <ConceptVisualizer title="TTL-Based Invalidation">
        <p className="text-sm text-muted-foreground mb-4">
          Every cache entry gets a <GlossaryTerm term="ttl">time-to-live</GlossaryTerm>. After it expires, the next read triggers a fresh
          fetch from the database. Simple, predictable, zero infrastructure beyond the cache itself.
          But the staleness window equals the TTL: short TTLs mean more DB load, long TTLs mean
          more stale data.
        </p>
        <TTLCountdown />
        <BeforeAfter
          before={{
            title: "TTL = 5 minutes",
            content: (
              <p className="text-sm text-muted-foreground">
                Users could see stale data for up to 5 minutes. Acceptable for blog posts
                and user profiles, not for prices, inventory, or seat availability.
              </p>
            ),
          }}
          after={{
            title: "TTL = 10 seconds",
            content: (
              <p className="text-sm text-muted-foreground">
                Staleness window shrinks to 10s, but your DB handles 30x more re-fetch queries.
                You are trading consistency for load &mdash; and potentially triggering stampedes.
              </p>
            ),
          }}
        />
      </ConceptVisualizer>

      <ConceptVisualizer title="Event-Based Invalidation">
        <p className="text-sm text-muted-foreground mb-4">
          Instead of waiting for a TTL to expire, the system publishes an event whenever data
          changes. A consumer listens for these events and deletes or updates the affected cache
          entries immediately. The staleness window drops to near-zero &mdash; but you need
          infrastructure to propagate change events reliably.
        </p>
        <EventInvalidationFlow />
        <ConversationalCallout type="tip">
          Event-based invalidation is the gold standard for data that must be fresh. Pair it with
          a short TTL as a safety net &mdash; if an event is lost (and events <em>will</em> be
          lost), the TTL ensures eventual consistency within seconds.
        </ConversationalCallout>
      </ConceptVisualizer>

      <ConceptVisualizer title="Cache Stampede (Thundering Herd)">
        <p className="text-sm text-muted-foreground mb-4">
          When a popular cache key expires, hundreds of concurrent requests simultaneously
          discover the cache miss and all hit the database to re-fetch the same data. The database
          gets crushed under sudden load. This is the <strong>cache stampede</strong> problem,
          also called the &quot;thundering herd&quot; or &quot;dog-pile effect.&quot;
        </p>
        <CacheStampede />
      </ConceptVisualizer>

      <CorrectApproach title="Preventing Cache Stampede">
        <p className="text-sm text-muted-foreground mb-4">
          Four proven techniques to prevent thundering herd problems, often used in combination:
        </p>
        <div className="space-y-3">
          <div className="rounded-lg border p-3">
            <p className="text-sm font-medium">1. Distributed Locking</p>
            <p className="text-xs text-muted-foreground">
              When the cache misses, the first request acquires a lock and fetches from the DB.
              All other requests wait for the lock to release, then read the freshly cached value.
              Only one request ever hits the database.
            </p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-sm font-medium">2. Probabilistic Early Expiration</p>
            <p className="text-xs text-muted-foreground">
              Each request has a small random chance of refreshing the cache <em>before</em> the
              TTL expires. The hotter the key, the more likely an early refresh happens, so the
              cache almost never actually expires for popular keys.
            </p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-sm font-medium">3. Stale-While-Revalidate</p>
            <p className="text-xs text-muted-foreground">
              Serve the stale value immediately while one background request fetches fresh data.
              Users get fast responses (even if slightly stale) and the cache is refreshed without
              a stampede. Borrowed from HTTP caching semantics.
            </p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-sm font-medium">4. Staggered Expiration</p>
            <p className="text-xs text-muted-foreground">
              Add a random jitter to TTLs: <code className="text-xs bg-muted px-1 rounded font-mono">TTL = base + random(0, delta)</code>.
              This prevents many keys from expiring at the same instant, spreading the re-fetch
              load over time.
            </p>
          </div>
        </div>
      </CorrectApproach>

      <ConceptVisualizer title="Write-Through vs Write-Behind">
        <p className="text-sm text-muted-foreground mb-4">
          Beyond TTL and event-based invalidation, there are patterns that keep the cache in sync
          on every write:
        </p>
        <BeforeAfter
          before={{
            title: "Write-Through",
            content: (
              <div className="text-sm space-y-2">
                <p className="text-xs text-muted-foreground">
                  Every write updates the database <em>and</em> the cache atomically in the same
                  operation. The cache is never stale because it is always updated on write. This is the <GlossaryTerm term="write-through">write-through</GlossaryTerm> pattern.
                </p>
                <AnimatedFlow
                  steps={[
                    { id: "write", label: "Write Request" },
                    { id: "db", label: "Update DB" },
                    { id: "cache", label: "Update Cache" },
                    { id: "ack", label: "Acknowledge" },
                  ]}
                />
                <p className="text-[10px] text-muted-foreground">
                  Trade-off: adds write latency (two writes instead of one).
                </p>
              </div>
            ),
          }}
          after={{
            title: "Write-Behind (Write-Back)",
            content: (
              <div className="text-sm space-y-2">
                <p className="text-xs text-muted-foreground">
                  Writes go to the cache first, then asynchronously flush to the database in batches.
                  Ultra-low write <GlossaryTerm term="latency">latency</GlossaryTerm> but risks data loss if the cache crashes before flushing. This is the <GlossaryTerm term="write-back">write-back</GlossaryTerm> pattern.
                </p>
                <AnimatedFlow
                  steps={[
                    { id: "write", label: "Write Request" },
                    { id: "cache", label: "Update Cache" },
                    { id: "ack", label: "Acknowledge" },
                    { id: "flush", label: "Async Flush to DB" },
                  ]}
                />
                <p className="text-[10px] text-muted-foreground">
                  Trade-off: risk of data loss if cache node fails.
                </p>
              </div>
            ),
          }}
        />
      </ConceptVisualizer>

      <ConceptVisualizer title="Version-Tagged Cache Keys">
        <p className="text-sm text-muted-foreground mb-4">
          Instead of invalidating a cache key, change the key itself. Each data version gets its
          own cache key. Reads always request the current version. Old versions are never served
          because no one asks for them &mdash; they just expire naturally.
        </p>
        <VersionTaggedKeys />
      </ConceptVisualizer>

      <CorrectApproach title="Layered Invalidation Strategy">
        <p className="text-sm text-muted-foreground mb-4">
          Real systems do not pick just one approach. They layer strategies for defense in depth,
          because each layer catches failures that slip past the previous one:
        </p>
        <div className="space-y-3">
          <div className="rounded-lg border p-3 border-l-2 border-l-emerald-500">
            <p className="text-sm font-medium">Layer 1: Event-based invalidation</p>
            <p className="text-xs text-muted-foreground">
              Immediate &mdash; when data changes, publish an event to purge the cache entry.
              Catches 99.9% of changes within milliseconds.
            </p>
          </div>
          <div className="rounded-lg border p-3 border-l-2 border-l-blue-500">
            <p className="text-sm font-medium">Layer 2: Short TTL safety net</p>
            <p className="text-xs text-muted-foreground">
              If the event is lost or delayed, the TTL ensures the stale entry expires within 30-60
              seconds. Catches the 0.1% of changes that events miss.
            </p>
          </div>
          <div className="rounded-lg border p-3 border-l-2 border-l-purple-500">
            <p className="text-sm font-medium">Layer 3: Version tags</p>
            <p className="text-xs text-muted-foreground">
              Each cache entry carries a version. Reads verify the version matches the DB. Even if
              everything else fails, the version check catches staleness at read time.
            </p>
          </div>
          <div className="rounded-lg border p-3 border-l-2 border-l-orange-500">
            <p className="text-sm font-medium">Layer 4: Stampede protection</p>
            <p className="text-xs text-muted-foreground">
              Distributed locking or stale-while-revalidate prevents thundering herd on any cache
              miss, whether from TTL expiry or event-driven invalidation.
            </p>
          </div>
        </div>
      </CorrectApproach>

      <AhaMoment
        question="If event-based invalidation is so good, why does anyone use TTL?"
        answer="Events require infrastructure (message queues, consumers, retry logic, dead-letter queues) and can fail silently. A dropped event means stale data served forever. TTL is zero-infrastructure — you set it and forget it. Most teams start with TTL and add event-based invalidation only for data where staleness is unacceptable, like prices or inventory counts. The TTL then becomes the safety net, not the primary mechanism."
      />

      <InteractiveDemo title="Invalidation Strategy Chooser">
        {({ isPlaying, tick }) => {
          const scenarios = [
            { name: "Blog post", freshness: "Minutes OK", strategy: "TTL (5 min)", color: "text-blue-400" },
            { name: "Product price", freshness: "Seconds matter", strategy: "Event + TTL backup", color: "text-emerald-400" },
            { name: "Inventory count", freshness: "Must be exact", strategy: "Write-through + lock", color: "text-purple-400" },
            { name: "User session", freshness: "On logout only", strategy: "Explicit delete", color: "text-orange-400" },
            { name: "Search results", freshness: "Minutes OK", strategy: "TTL (2 min) + stale-while-revalidate", color: "text-cyan-400" },
          ];
          const active = isPlaying ? tick % scenarios.length : -1;

          return (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Different data needs different invalidation strategies. Press play to cycle through
                common scenarios and see which strategy fits each one.
              </p>
              <div className="space-y-2">
                {scenarios.map((s, i) => (
                  <div
                    key={s.name}
                    className={cn(
                      "flex items-center justify-between px-3 py-2.5 rounded-lg border transition-all duration-300",
                      i === active
                        ? "bg-blue-500/8 border-blue-500/20 ring-1 ring-blue-500/15"
                        : "bg-muted/10 border-border/30"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold w-28">{s.name}</span>
                      <span className="text-[10px] text-muted-foreground">{s.freshness}</span>
                    </div>
                    <span className={cn("text-xs font-mono", i === active ? s.color : "text-muted-foreground/40")}>
                      {s.strategy}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        }}
      </InteractiveDemo>

      <ConversationalCallout type="warning">
        <strong>Why is this called one of the two hardest problems?</strong> Because cache invalidation
        requires answering &quot;when did the source of truth change?&quot; In a distributed system,
        there is no single moment of change. A write to the primary database propagates to replicas,
        then to caches, then to CDN edge nodes, each with its own delay. At any given instant,
        different parts of the system have different views of reality. Perfect invalidation would
        require perfect knowledge of all replicas &mdash; which is impossible by the laws of physics
        (speed of light) and distributed systems theory (FLP impossibility).
      </ConversationalCallout>

      <AhaMoment
        question="What about CDN invalidation? Is that a different problem?"
        answer={
          <p>
            Same problem, bigger scale. CDN edge nodes are caches too &mdash; but they are spread
            across the globe. When you invalidate at the origin, it takes time for the purge to
            reach every edge server. AWS CloudFront, for example, can take up to 60 seconds to
            propagate an invalidation globally. During that window, users in different regions
            may see different versions of your content. This is why many teams use versioned URLs
            (<code className="text-xs bg-muted px-1 rounded font-mono">/static/app.v42.js</code>)
            instead of invalidation &mdash; you never invalidate, you just deploy a new version.
          </p>
        }
      />

      <TopicQuiz
        questions={[
          {
            question: "Your e-commerce site caches product prices with a 5-minute TTL. A flash sale drops prices at 9:00 AM. What happens?",
            options: [
              "Prices update immediately in the cache",
              "Customers may see stale (old) prices for up to 5 minutes",
              "The cache automatically detects the price change",
              "The database rejects the price update until the cache expires",
            ],
            correctIndex: 1,
            explanation: "With TTL-based invalidation, the cache does not know that the underlying data changed. It continues serving the old price until the TTL expires, creating a staleness window of up to 5 minutes.",
          },
          {
            question: "What is the best way to prevent a cache stampede (thundering herd) when a popular key expires?",
            options: [
              "Set a very long TTL so keys never expire",
              "Use a distributed lock so only one request refills the cache while others wait",
              "Remove the cache entirely and query the database directly",
              "Increase the database connection pool size",
            ],
            correctIndex: 1,
            explanation: "A distributed lock ensures only one request fetches from the database on a cache miss. All other requests wait for the lock to release, then read the freshly cached value. This prevents hundreds of simultaneous database queries.",
          },
          {
            question: "Why do production systems often combine event-based invalidation with a short TTL?",
            options: [
              "Events are faster than TTL so TTL is unnecessary",
              "TTL acts as a safety net in case an invalidation event is lost or delayed",
              "TTL makes event-based invalidation faster",
              "You can only use one or the other, not both",
            ],
            correctIndex: 1,
            explanation: "Events can be lost due to network issues, queue failures, or bugs. A short TTL ensures that even if an event is dropped, the stale data will expire within seconds. This defense-in-depth approach catches the 0.1% of changes that events miss.",
          },
        ]}
      />

      <KeyTakeaway
        points={[
          "TTL is the simplest invalidation — set a time limit and accept a staleness window. Good for data where minutes of staleness are acceptable.",
          "Event-based invalidation gives near-zero staleness but requires message queue infrastructure and careful handling of dropped events.",
          "Write-through keeps cache and DB in sync on every write, at the cost of write latency. Write-behind is faster but risks data loss.",
          "Cache stampede (thundering herd) occurs when a popular key expires and many requests simultaneously hit the database. Prevent with locking, probabilistic early expiration, or stale-while-revalidate.",
          "Version-tagged cache keys sidestep invalidation entirely — you never invalidate, you just stop asking for the old version.",
          "Layer strategies for defense in depth: event-based for speed, TTL as a safety net, version tags for verification, and stampede protection for resilience.",
          "There is no perfect solution. Every invalidation strategy is a trade-off between freshness, complexity, and performance. The right choice depends on what staleness costs your business.",
        ]}
      />
    </div>
  );
}
