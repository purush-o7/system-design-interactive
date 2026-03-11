"use client";

import { useState, useCallback, useEffect } from "react";
import { TopicHero } from "@/components/topic-hero";
import { FailureScenario } from "@/components/failure-scenario";
import { WhyItBreaks } from "@/components/why-it-breaks";
import { ConceptVisualizer } from "@/components/concept-visualizer";
import { CorrectApproach } from "@/components/correct-approach";
import { KeyTakeaway } from "@/components/key-takeaway";
import { AhaMoment } from "@/components/aha-moment";
import { ConversationalCallout } from "@/components/conversational-callout";
import { BeforeAfter } from "@/components/before-after";
import { MetricCounter } from "@/components/metric-counter";
import { InteractiveDemo } from "@/components/interactive-demo";
import { cn } from "@/lib/utils";
import { Clock, BarChart3, ListOrdered, Trash2, Zap } from "lucide-react";

type CacheEntry = {
  key: string;
  freq: number;
  order: number;
  color: string;
  isNew?: boolean;
  isEvicting?: boolean;
};

const COLORS = [
  "bg-blue-500/30 border-blue-500/40",
  "bg-emerald-500/30 border-emerald-500/40",
  "bg-purple-500/30 border-purple-500/40",
  "bg-amber-500/30 border-amber-500/40",
  "bg-rose-500/30 border-rose-500/40",
  "bg-cyan-500/30 border-cyan-500/40",
  "bg-pink-500/30 border-pink-500/40",
  "bg-orange-500/30 border-orange-500/40",
];

function getColor(key: string) {
  const code = key.charCodeAt(0) - 65;
  return COLORS[code % COLORS.length];
}

function EvictionSimulator() {
  const CACHE_SIZE = 5;
  const [policy, setPolicy] = useState<"LRU" | "LFU" | "FIFO">("LRU");
  const [cache, setCache] = useState<CacheEntry[]>([]);
  const [step, setStep] = useState(0);
  const [lastEvicted, setLastEvicted] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<string>("");
  const [history, setHistory] = useState<string[]>([]);
  const [hitCount, setHitCount] = useState(0);
  const [missCount, setMissCount] = useState(0);

  const resetAll = useCallback(() => {
    setCache([]);
    setStep(0);
    setLastEvicted(null);
    setLastAction("");
    setHistory([]);
    setHitCount(0);
    setMissCount(0);
  }, []);

  const accessKey = useCallback((key: string) => {
    setStep((s) => s + 1);
    setHistory((h) => [...h, key]);
    setCache((prev) => {
      const existing = prev.find((e) => e.key === key);
      if (existing) {
        setLastEvicted(null);
        setLastAction(`HIT "${key}" -- found in cache`);
        setHitCount((h) => h + 1);
        return prev.map((e) =>
          e.key === key ? { ...e, freq: e.freq + 1, order: step + 1, isNew: false, isEvicting: false } : { ...e, isNew: false, isEvicting: false }
        );
      }

      setMissCount((m) => m + 1);
      let next = [...prev].map((e) => ({ ...e, isNew: false, isEvicting: false }));
      let evicted: string | null = null;

      if (next.length >= CACHE_SIZE) {
        let victim: number;
        if (policy === "LRU") {
          victim = next.reduce((min, e, i) => (e.order < next[min].order ? i : min), 0);
        } else if (policy === "LFU") {
          victim = next.reduce((min, e, i) => {
            if (e.freq < next[min].freq) return i;
            if (e.freq === next[min].freq && e.order < next[min].order) return i;
            return min;
          }, 0);
        } else {
          victim = 0;
        }
        evicted = next[victim].key;
        next.splice(victim, 1);
      }

      setLastEvicted(evicted);
      setLastAction(evicted ? `MISS "${key}" -- evicted "${evicted}"` : `MISS "${key}" -- added to cache`);
      return [...next, { key, freq: 1, order: step + 1, color: getColor(key), isNew: true, isEvicting: false }];
    });
  }, [policy, step]);

  const items = ["A", "B", "C", "D", "E", "F", "G", "H"];
  const hitRate = hitCount + missCount > 0 ? Math.round((hitCount / (hitCount + missCount)) * 100) : 0;

  // Determine which entry would be evicted next
  const victimKey = cache.length >= CACHE_SIZE ? (() => {
    if (policy === "LRU") {
      return cache.reduce((min, e, i) => (e.order < cache[min].order ? i : min), 0);
    } else if (policy === "LFU") {
      return cache.reduce((min, e, i) => {
        if (e.freq < cache[min].freq) return i;
        if (e.freq === cache[min].freq && e.order < cache[min].order) return i;
        return min;
      }, 0);
    }
    return 0;
  })() : -1;

  return (
    <div className="space-y-4">
      {/* Policy selector */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[11px] text-muted-foreground font-medium">Policy:</span>
        {(["LRU", "LFU", "FIFO"] as const).map((p) => (
          <button
            key={p}
            onClick={() => { setPolicy(p); resetAll(); }}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-medium transition-all border",
              policy === p
                ? "bg-blue-500/15 border-blue-500/30 text-blue-400"
                : "bg-muted/20 border-border/30 text-muted-foreground hover:bg-muted/40"
            )}
          >
            {p === "LRU" && <Clock className="size-3 inline mr-1" />}
            {p === "LFU" && <BarChart3 className="size-3 inline mr-1" />}
            {p === "FIFO" && <ListOrdered className="size-3 inline mr-1" />}
            {p}
          </button>
        ))}
        <button
          onClick={resetAll}
          className="px-3 py-1.5 rounded-md text-xs font-medium bg-muted/20 border border-border/30 text-muted-foreground hover:bg-muted/40 ml-auto transition-all"
        >
          Reset
        </button>
      </div>

      {/* Access buttons */}
      <div className="flex gap-1.5 flex-wrap items-center">
        <span className="text-[11px] text-muted-foreground font-medium mr-1">Access key:</span>
        {items.map((key) => {
          const inCache = cache.some((e) => e.key === key);
          return (
            <button
              key={key}
              onClick={() => accessKey(key)}
              className={cn(
                "size-9 rounded-lg text-xs font-bold transition-all border",
                inCache
                  ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25"
                  : "bg-muted/20 border-border/40 text-muted-foreground hover:bg-muted/40"
              )}
            >
              {key}
            </button>
          );
        })}
      </div>

      {/* Visual cache blocks */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground font-medium">Cache slots ({cache.length}/{CACHE_SIZE}):</span>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: CACHE_SIZE }).map((_, i) => {
            const entry = cache[i];
            const isVictim = i === victimKey && cache.length >= CACHE_SIZE;
            return (
              <div
                key={i}
                className={cn(
                  "rounded-xl border-2 p-3 text-center transition-all duration-300 relative",
                  entry
                    ? entry.isNew
                      ? "border-emerald-400/60 bg-emerald-500/10 ring-2 ring-emerald-500/20"
                      : isVictim
                      ? "border-red-400/40 bg-red-500/5"
                      : cn("bg-muted/5", entry.color)
                    : "border-dashed border-muted-foreground/15 bg-muted/5"
                )}
              >
                {entry ? (
                  <>
                    <div className="font-bold text-lg">{entry.key}</div>
                    {policy !== "FIFO" && (
                      <div className="space-y-0.5 mt-1">
                        {(policy === "LFU" || policy === "LRU") && (
                          <div className="text-[10px] text-muted-foreground">
                            freq: <span className="font-mono font-bold text-foreground">{entry.freq}</span>
                          </div>
                        )}
                        <div className="text-[10px] text-muted-foreground">
                          last: <span className="font-mono text-foreground">{entry.order}</span>
                        </div>
                      </div>
                    )}
                    {policy === "FIFO" && (
                      <div className="text-[10px] text-muted-foreground mt-1">
                        pos: <span className="font-mono text-foreground">#{i + 1}</span>
                      </div>
                    )}
                    {isVictim && (
                      <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">
                        NEXT
                      </div>
                    )}
                    {entry.isNew && (
                      <div className="absolute -top-2 -left-2 bg-emerald-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">
                        NEW
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-muted-foreground/30 py-3 text-xs">empty</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* LFU frequency bar chart */}
      {policy === "LFU" && cache.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-[11px] text-muted-foreground font-medium">Access frequency:</span>
          <div className="space-y-1">
            {[...cache].sort((a, b) => b.freq - a.freq).map((entry) => (
              <div key={entry.key} className="flex items-center gap-2">
                <span className="text-xs font-bold w-4">{entry.key}</span>
                <div className="flex-1 h-4 bg-muted/10 rounded overflow-hidden">
                  <div
                    className={cn("h-full rounded transition-all duration-300", entry.color.replace("/30", "/50").replace("/40", "/60"))}
                    style={{ width: `${Math.min(100, (entry.freq / Math.max(...cache.map((c) => c.freq))) * 100)}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono text-muted-foreground w-6 text-right">{entry.freq}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-2 text-center">
          <div className="text-[10px] text-muted-foreground">Hits</div>
          <div className="text-sm font-bold text-emerald-400">{hitCount}</div>
        </div>
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-2 text-center">
          <div className="text-[10px] text-muted-foreground">Misses</div>
          <div className="text-sm font-bold text-red-400">{missCount}</div>
        </div>
        <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-2 text-center">
          <div className="text-[10px] text-muted-foreground">Hit Rate</div>
          <div className="text-sm font-bold text-blue-400">{hitRate}%</div>
        </div>
      </div>

      {/* Action log */}
      {lastAction && (
        <div className={cn(
          "text-xs px-3 py-2 rounded-md border font-mono transition-all",
          lastEvicted
            ? "bg-red-500/5 border-red-500/20 text-red-400"
            : lastAction.startsWith("HIT")
            ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400"
            : "bg-blue-500/5 border-blue-500/20 text-blue-400"
        )}>
          {lastAction}
        </div>
      )}

      {/* Access history */}
      {history.length > 0 && (
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-[10px] text-muted-foreground/50 mr-1">History:</span>
          {history.map((h, i) => (
            <span key={i} className="text-[10px] font-mono text-muted-foreground/60 bg-muted/20 rounded px-1 py-0.5">
              {h}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function LRUDoublyLinkedListViz() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % 5), 1500);
    return () => clearInterval(t);
  }, []);

  const states = [
    { list: ["D", "C", "B", "A"], action: "Initial state: A is least recently used", highlight: -1 },
    { list: ["D", "C", "B", "A"], action: "Access 'B': move to head", highlight: 2 },
    { list: ["B", "D", "C", "A"], action: "'B' is now most recent", highlight: 0 },
    { list: ["B", "D", "C", "A"], action: "Cache full, insert 'E': evict tail ('A')", highlight: 3 },
    { list: ["E", "B", "D", "C"], action: "'A' evicted, 'E' added at head", highlight: 0 },
  ];

  const current = states[step];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1 justify-center">
        <span className="text-[10px] text-emerald-400 font-medium mr-1">HEAD (MRU)</span>
        {current.list.map((item, i) => (
          <div key={`${step}-${i}`} className="flex items-center gap-1">
            <div className={cn(
              "size-10 rounded-lg border-2 flex items-center justify-center text-sm font-bold transition-all duration-300",
              i === current.highlight
                ? step === 3 && i === 3
                  ? "border-red-400/60 bg-red-500/10 text-red-400"
                  : "border-emerald-400/60 bg-emerald-500/10 text-emerald-400 ring-2 ring-emerald-500/20"
                : "border-border/30 bg-muted/10 text-muted-foreground"
            )}>
              {item}
            </div>
            {i < current.list.length - 1 && (
              <span className="text-muted-foreground/30 text-xs">&harr;</span>
            )}
          </div>
        ))}
        <span className="text-[10px] text-red-400 font-medium ml-1">TAIL (LRU)</span>
      </div>
      <p className="text-[11px] text-center text-muted-foreground">{current.action}</p>
    </div>
  );
}

function RedisApproximatedLRUViz() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % 4), 2000);
    return () => clearInterval(t);
  }, []);

  const allKeys = [
    { key: "k1", age: 120, sampled: false },
    { key: "k2", age: 45, sampled: false },
    { key: "k3", age: 890, sampled: false },
    { key: "k4", age: 12, sampled: false },
    { key: "k5", age: 340, sampled: false },
    { key: "k6", age: 67, sampled: false },
    { key: "k7", age: 1200, sampled: false },
    { key: "k8", age: 5, sampled: false },
    { key: "k9", age: 200, sampled: false },
    { key: "k10", age: 550, sampled: false },
  ];

  const sampledIndices = [2, 4, 6, 8, 9];
  const steps = [
    "10 keys in memory, need to evict one...",
    "Sample 5 random keys (maxmemory-samples = 5)",
    "Compare idle times of sampled keys",
    "Evict k7 (idle 1200ms) -- oldest in sample",
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-5 gap-1.5">
        {allKeys.map((k, i) => {
          const isSampled = step >= 1 && sampledIndices.includes(i);
          const isVictim = step >= 3 && i === 6;
          return (
            <div
              key={k.key}
              className={cn(
                "rounded-lg border px-2 py-1.5 text-center transition-all duration-300",
                isVictim
                  ? "border-red-500/50 bg-red-500/10"
                  : isSampled
                  ? "border-amber-500/40 bg-amber-500/10"
                  : "border-border/20 bg-muted/10"
              )}
            >
              <div className={cn(
                "text-[10px] font-bold",
                isVictim ? "text-red-400" : isSampled ? "text-amber-400" : "text-muted-foreground/60"
              )}>
                {k.key}
              </div>
              <div className={cn(
                "text-[9px] font-mono",
                isVictim ? "text-red-400" : isSampled && step >= 2 ? "text-amber-400" : "text-muted-foreground/30"
              )}>
                {step >= 2 && isSampled ? `${k.age}ms` : "---"}
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-[11px] text-center text-muted-foreground">
        {steps[step]}
      </p>
    </div>
  );
}

export default function EvictionPoliciesPage() {
  return (
    <div className="space-y-8">
      <TopicHero
        title="Eviction Policies"
        subtitle="When your cache is full, something has to go. The question is: what? The wrong answer kills your hit rate. The right answer keeps your hottest data in memory."
        difficulty="intermediate"
      />

      <FailureScenario title="Your most popular items keep getting evicted">
        <p className="text-sm text-muted-foreground">
          Your cache has a 1 GB limit. It fills up with product data, but a naive FIFO eviction policy
          starts dropping your <strong className="text-red-400">most popular items</strong> — the ones
          serving 80% of traffic — just because they were loaded first. Cache hit rate plummets from
          95% to 40%. Your database, which was comfortably handling 500 qps, is suddenly slammed with
          6,000 fallback queries per second.
        </p>
        <div className="grid grid-cols-3 gap-3">
          <MetricCounter label="Hit Rate" value={40} unit="%" trend="up" />
          <MetricCounter label="DB Fallbacks" value={6000} unit="/sec" trend="up" />
          <MetricCounter label="P99 Latency" value={890} unit="ms" trend="up" />
        </div>
      </FailureScenario>

      <WhyItBreaks title="Not all cached data is equally valuable">
        <p className="text-sm text-muted-foreground">
          Cache memory is finite. A 1 GB Redis instance might hold ~10 million small keys. When it is full,
          every new entry requires evicting an old one. A bad eviction policy removes data that will be
          requested again in milliseconds, causing a miss that hits the database. A good policy keeps the
          &quot;working set&quot; — the data actively being accessed — in memory at all times.
        </p>
        <div className="grid grid-cols-2 gap-2 mt-3">
          {[
            { label: "FIFO", desc: "Evicts oldest-loaded item regardless of access patterns. Simple but often worst hit rate.", icon: <ListOrdered className="size-4" /> },
            { label: "LRU", desc: "Evicts least recently accessed item. Works well when recent = likely to be accessed again.", icon: <Clock className="size-4" /> },
            { label: "LFU", desc: "Evicts least frequently accessed item. Best for stable popularity but slow to adapt.", icon: <BarChart3 className="size-4" /> },
            { label: "TTL", desc: "Not an eviction policy — an expiration mechanism. Items auto-expire after a time limit.", icon: <Trash2 className="size-4" /> },
          ].map((item) => (
            <div key={item.label} className="flex items-start gap-2.5 rounded-lg bg-muted/20 border border-border/30 p-3">
              <span className="text-blue-400 bg-blue-500/10 rounded-md size-7 flex items-center justify-center shrink-0">
                {item.icon}
              </span>
              <div>
                <p className="text-xs font-semibold">{item.label}</p>
                <p className="text-[11px] text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </WhyItBreaks>

      <ConceptVisualizer title="LRU: Least Recently Used">
        <p className="text-sm text-muted-foreground mb-4">
          LRU is the most widely used eviction policy. The idea is simple: if you have not touched
          something recently, you probably will not need it soon. Under the hood, a true LRU uses a
          doubly-linked list with a hash map — O(1) access and O(1) eviction.
        </p>
        <LRUDoublyLinkedListViz />
        <ConversationalCallout type="tip">
          Every access moves the item to the head of the list. The tail is always the least recently
          used item. When the cache is full, evict the tail — constant time, no scanning required.
          This is why LRU is the default in Redis, Memcached, and most CPU caches.
        </ConversationalCallout>
      </ConceptVisualizer>

      <ConceptVisualizer title="Redis Does Not Use True LRU">
        <p className="text-sm text-muted-foreground mb-4">
          Maintaining a true doubly-linked list for millions of keys wastes memory on pointers. Redis
          uses <strong>approximated LRU</strong>: instead of tracking access order for every key, it
          samples a small random set (default 5 keys) and evicts the oldest among those. With a pool
          of 10 samples, it closely approximates true LRU behavior.
        </p>
        <RedisApproximatedLRUViz />
        <AhaMoment
          question="Why does sampling 5 keys work almost as well as true LRU?"
          answer={
            <p>
              In practice, the &quot;oldest&quot; key in a random sample of 5 is usually pretty old globally.
              Redis also maintains a pool of eviction candidates across rounds, so the approximation improves
              over time. You can tune this with <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">maxmemory-samples 10</code> for
              better accuracy at a small CPU cost.
            </p>
          }
        />
      </ConceptVisualizer>

      <ConceptVisualizer title="LFU: Least Frequently Used">
        <p className="text-sm text-muted-foreground mb-4">
          LFU tracks how many times each key is accessed and evicts the one with the fewest hits. It is
          better than LRU for workloads with stable popularity — a product that gets 10,000 views per hour
          should not be evicted just because it was not accessed in the last 2 seconds.
        </p>
        <ConversationalCallout type="warning">
          LFU has the <strong>accumulation problem</strong>: an item accessed 10,000 times yesterday but
          never today still has a high count. It resists eviction even though it is no longer popular.
          Redis solves this with a <em>Morris counter</em> that uses a single byte per key and decays
          over time. The decay rate is tunable via <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">lfu-decay-time</code>.
        </ConversationalCallout>
        <div className="mt-3 rounded-lg border border-border/30 bg-muted/10 p-3">
          <p className="text-xs font-semibold mb-2">Redis LFU Morris Counter</p>
          <p className="text-[11px] text-muted-foreground">
            Instead of a 32-bit integer counter (4 bytes), Redis uses a probabilistic <strong>Morris counter</strong> stored
            in just 8 bits. The counter increments probabilistically — the higher the current count, the less likely
            it is to increment. A value of 255 represents roughly 1 million accesses. Combined with time-based
            decay, this gives LFU frequency tracking with almost zero memory overhead.
          </p>
        </div>
      </ConceptVisualizer>

      <ConceptVisualizer title="FIFO and Random Eviction">
        <p className="text-sm text-muted-foreground">
          <strong>FIFO (First-In First-Out)</strong> evicts the oldest-inserted item regardless of access
          patterns. It is trivial to implement (just a queue) but produces the worst hit rates for most
          workloads because it ignores how recently or frequently items are accessed.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          <strong>Random eviction</strong> picks a victim at random. Surprisingly, random eviction
          often outperforms FIFO because it does not systematically target the oldest items — which
          may still be actively used. Redis supports both <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">allkeys-random</code> and <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">volatile-random</code> policies.
        </p>
      </ConceptVisualizer>

      <ConceptVisualizer title="Try It: Eviction Simulator">
        <p className="text-sm text-muted-foreground mb-2">
          Click the letter buttons to access keys. Watch how each policy decides what to evict when the
          cache (size 5) is full. The red &quot;NEXT&quot; badge shows which entry will be evicted on the
          next miss. Switch policies and compare hit rates.
        </p>
        <EvictionSimulator />
        <ConversationalCallout type="tip">
          Try this sequence with each policy: A, B, C, D, E, A, B, F, A, B, C.
          With LRU, the frequently-accessed A and B survive. With FIFO, they get evicted first.
          With LFU, their frequency counts protect them. Watch the hit rate difference.
        </ConversationalCallout>
      </ConceptVisualizer>

      <CorrectApproach title="Choosing the Right Policy">
        <p className="text-sm text-muted-foreground mb-4">
          The best eviction policy is the one that maximizes hit rate for your specific access pattern.
          There is no universal winner — but LRU is the safest default for most workloads.
        </p>
        <BeforeAfter
          before={{
            title: "Default FIFO everywhere",
            content: (
              <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                <li>Popular items evicted because they were loaded first</li>
                <li>Hit rate drops to 40-50% under load</li>
                <li>Database constantly hit for hot data</li>
                <li>No visibility into access patterns</li>
              </ul>
            ),
          }}
          after={{
            title: "Match policy to access pattern",
            content: (
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li><strong>LRU</strong> for most workloads (sessions, API responses, web pages)</li>
                <li><strong>LFU</strong> for stable-popularity data (CDN assets, popular products)</li>
                <li><strong>TTL</strong> layered on top to bound maximum staleness</li>
                <li>Monitor hit rate and adjust — Redis provides <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">INFO stats</code></li>
              </ul>
            ),
          }}
        />
      </CorrectApproach>

      <InteractiveDemo title="Watch Eviction Policies Compete">
        {({ isPlaying, tick }) => {
          const sequence = ["A", "B", "C", "D", "E", "A", "A", "F", "B", "A", "G", "A", "B"];
          const activeIdx = isPlaying ? Math.min(tick % (sequence.length + 2), sequence.length) : 0;

          // Simulate LRU
          const simulatePolicy = (policy: "LRU" | "LFU" | "FIFO") => {
            let cache: { key: string; freq: number; order: number }[] = [];
            let hits = 0;
            const size = 4;
            for (let i = 0; i < activeIdx; i++) {
              const key = sequence[i];
              const existing = cache.find((e) => e.key === key);
              if (existing) {
                hits++;
                cache = cache.map((e) => e.key === key ? { ...e, freq: e.freq + 1, order: i } : e);
              } else {
                if (cache.length >= size) {
                  let victim: number;
                  if (policy === "LRU") victim = cache.reduce((m, e, j) => e.order < cache[m].order ? j : m, 0);
                  else if (policy === "LFU") victim = cache.reduce((m, e, j) => e.freq < cache[m].freq ? j : m, 0);
                  else victim = 0;
                  cache.splice(victim, 1);
                }
                cache.push({ key, freq: 1, order: i });
              }
            }
            return { hits, total: activeIdx, rate: activeIdx > 0 ? Math.round((hits / activeIdx) * 100) : 0 };
          };

          const lru = simulatePolicy("LRU");
          const lfu = simulatePolicy("LFU");
          const fifo = simulatePolicy("FIFO");

          return (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Press play to run the same access sequence through all three policies (cache size = 4)
                and compare hit rates in real time.
              </p>

              {/* Sequence progress */}
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-[10px] text-muted-foreground mr-1">Sequence:</span>
                {sequence.map((s, i) => (
                  <span
                    key={i}
                    className={cn(
                      "text-[11px] font-mono font-bold size-6 rounded flex items-center justify-center transition-all",
                      i < activeIdx
                        ? "bg-blue-500/15 text-blue-400"
                        : i === activeIdx
                        ? "bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30"
                        : "bg-muted/10 text-muted-foreground/30"
                    )}
                  >
                    {s}
                  </span>
                ))}
              </div>

              {/* Results */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { name: "LRU", data: lru, borderBg: "border-blue-500/20 bg-blue-500/5", text: "text-blue-400" },
                  { name: "LFU", data: lfu, borderBg: "border-purple-500/20 bg-purple-500/5", text: "text-purple-400" },
                  { name: "FIFO", data: fifo, borderBg: "border-amber-500/20 bg-amber-500/5", text: "text-amber-400" },
                ].map((p) => (
                  <div key={p.name} className={cn(
                    "rounded-lg border p-3 text-center transition-all",
                    p.borderBg
                  )}>
                    <div className="text-xs font-semibold mb-1">{p.name}</div>
                    <div className={cn("text-2xl font-bold", p.text)}>{p.data.rate}%</div>
                    <div className="text-[10px] text-muted-foreground">{p.data.hits}/{p.data.total} hits</div>
                  </div>
                ))}
              </div>

              {activeIdx >= sequence.length && (
                <ConversationalCallout type="question">
                  Notice how LRU and LFU both kept the frequently-accessed &quot;A&quot; in cache while
                  FIFO did not? For workloads with temporal locality (most web traffic), LRU wins.
                  For workloads with stable popularity patterns, LFU edges ahead.
                </ConversationalCallout>
              )}
            </div>
          );
        }}
      </InteractiveDemo>

      <AhaMoment
        question="Why does Redis default to LRU instead of LFU?"
        answer={
          <p>
            Most real-world access patterns exhibit <em>temporal locality</em> — what was accessed recently
            is likely to be accessed again soon. LRU captures this naturally. LFU is better for
            frequency-stable workloads (like CDN assets that are popular for weeks), but it adapts slowly
            when popularity shifts. Since Redis 4.0, you can switch to LFU
            with <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">maxmemory-policy allkeys-lfu</code> if
            your workload benefits from it.
          </p>
        }
      />

      <ConversationalCallout type="tip">
        In system design interviews, mention that you would use LRU as a default and layer TTL on top
        for staleness control. If the interviewer pushes on specific workload patterns (CDN, leaderboard),
        suggest LFU. Knowing <em>when</em> to switch policies shows deeper understanding than just
        naming them.
      </ConversationalCallout>

      <KeyTakeaway
        points={[
          "LRU is the most widely used policy and the safest default. It works well for temporal locality patterns common in web traffic.",
          "LFU captures popularity but adapts slowly. Redis uses a probabilistic Morris counter (1 byte per key) with time-based decay to solve the accumulation problem.",
          "Redis uses approximated LRU/LFU (sampling 5 random keys) instead of true implementations to save memory. You can tune accuracy with maxmemory-samples.",
          "FIFO is simple but usually produces the worst hit rates. Random eviction often outperforms it.",
          "TTL is not an eviction policy but an expiration mechanism. Use it alongside LRU/LFU to bound maximum staleness.",
          "Monitor your hit rate with Redis INFO stats. The best eviction policy is the one that maximizes hit rate for your specific access pattern.",
        ]}
      />
    </div>
  );
}
