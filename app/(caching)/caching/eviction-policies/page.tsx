"use client";

import { useState, useCallback, useMemo } from "react";
import { TopicHero } from "@/components/topic-hero";
import { KeyTakeaway } from "@/components/key-takeaway";
import { AhaMoment } from "@/components/aha-moment";
import { ConversationalCallout } from "@/components/conversational-callout";
import { BeforeAfter } from "@/components/before-after";
import { Playground } from "@/components/playground";
import { LiveChart } from "@/components/live-chart";
import { useSimulation } from "@/hooks/use-simulation";
import { cn } from "@/lib/utils";
import { Clock, BarChart3, ListOrdered, ShoppingCart, Users, Tv } from "lucide-react";


type CacheEntry = {
  key: string;
  freq: number;
  insertOrder: number;
  lastAccess: number;
};

type Policy = "LRU" | "LFU" | "FIFO";

const CACHE_SIZE = 5;
const ALL_KEYS = ["A", "B", "C", "D", "E", "F", "G", "H"];

const SLOT_COLORS: Record<string, string> = {
  A: "bg-blue-500/25 border-blue-500/40",
  B: "bg-emerald-500/25 border-emerald-500/40",
  C: "bg-purple-500/25 border-purple-500/40",
  D: "bg-amber-500/25 border-amber-500/40",
  E: "bg-rose-500/25 border-rose-500/40",
  F: "bg-cyan-500/25 border-cyan-500/40",
  G: "bg-pink-500/25 border-pink-500/40",
  H: "bg-orange-500/25 border-orange-500/40",
};

const POLICY_ICON_MAP: Record<Policy, typeof Clock> = {
  LRU: Clock,
  LFU: BarChart3,
  FIFO: ListOrdered,
};

const POLICY_STYLES: Record<Policy, { active: string; bar: string }> = {
  LRU: {
    active: "bg-blue-500/15 border-blue-500/30 text-blue-400",
    bar: "bg-blue-500/50",
  },
  LFU: {
    active: "bg-purple-500/15 border-purple-500/30 text-purple-400",
    bar: "bg-purple-500/50",
  },
  FIFO: {
    active: "bg-amber-500/15 border-amber-500/30 text-amber-400",
    bar: "bg-amber-500/50",
  },
};


function findVictim(cache: CacheEntry[], policy: Policy): number {
  if (cache.length === 0) return -1;
  if (policy === "LRU") {
    return cache.reduce((m, e, i) => (e.lastAccess < cache[m].lastAccess ? i : m), 0);
  }
  if (policy === "LFU") {
    return cache.reduce((m, e, i) => {
      if (e.freq < cache[m].freq) return i;
      if (e.freq === cache[m].freq && e.lastAccess < cache[m].lastAccess) return i;
      return m;
    }, 0);
  }
  return 0; // FIFO: first inserted
}

function simulateSequence(seq: string[], policy: Policy, size: number) {
  let cache: CacheEntry[] = [];
  let hits = 0;
  const hitRateOverTime: { step: number; rate: number }[] = [];

  for (let i = 0; i < seq.length; i++) {
    const key = seq[i];
    const existing = cache.find((e) => e.key === key);
    if (existing) {
      hits++;
      cache = cache.map((e) =>
        e.key === key ? { ...e, freq: e.freq + 1, lastAccess: i } : e
      );
    } else {
      if (cache.length >= size) {
        const vi = findVictim(cache, policy);
        cache = cache.filter((_, idx) => idx !== vi);
      }
      cache.push({ key, freq: 1, insertOrder: i, lastAccess: i });
    }
    hitRateOverTime.push({
      step: i + 1,
      rate: Math.round((hits / (i + 1)) * 100),
    });
  }

  return { hits, misses: seq.length - hits, rate: seq.length > 0 ? Math.round((hits / seq.length) * 100) : 0, hitRateOverTime };
}


function CacheEvictionSimulator() {
  const [policy, setPolicy] = useState<Policy>("LRU");
  const [cache, setCache] = useState<CacheEntry[]>([]);
  const [clock, setClock] = useState(0);
  const [hitCount, setHitCount] = useState(0);
  const [missCount, setMissCount] = useState(0);
  const [lastAction, setLastAction] = useState("");
  const [lastEvicted, setLastEvicted] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [newSlot, setNewSlot] = useState<number | null>(null);

  const resetAll = useCallback(() => {
    setCache([]);
    setClock(0);
    setHitCount(0);
    setMissCount(0);
    setLastAction("");
    setLastEvicted(null);
    setHistory([]);
    setNewSlot(null);
  }, []);

  const accessKey = useCallback(
    (key: string) => {
      setClock((c) => {
        const t = c + 1;

        setCache((prev) => {
          const existing = prev.find((e) => e.key === key);
          if (existing) {
            setHitCount((h) => h + 1);
            setLastEvicted(null);
            setLastAction(`HIT "${key}" -- found in cache`);
            setNewSlot(null);
            return prev.map((e) =>
              e.key === key ? { ...e, freq: e.freq + 1, lastAccess: t } : e
            );
          }

          setMissCount((m) => m + 1);
          const next = [...prev];
          let evicted: string | null = null;

          if (next.length >= CACHE_SIZE) {
            const vi = findVictim(next, policy);
            evicted = next[vi].key;
            next.splice(vi, 1);
          }

          setLastEvicted(evicted);
          setLastAction(
            evicted
              ? `MISS "${key}" -- evicted "${evicted}" (${EVICTION_REASONS[policy]})`
              : `MISS "${key}" -- added to cache`
          );

          const newEntry: CacheEntry = { key, freq: 1, insertOrder: t, lastAccess: t };
          const result = [...next, newEntry];
          setNewSlot(result.length - 1);
          return result;
        });

        setHistory((h) => [...h, key]);
        return t;
      });
    },
    [policy]
  );

  const victimIdx = cache.length >= CACHE_SIZE ? findVictim(cache, policy) : -1;
  const hitRate = hitCount + missCount > 0 ? Math.round((hitCount / (hitCount + missCount)) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Policy selector */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[11px] text-muted-foreground font-medium">Policy:</span>
        {(["LRU", "LFU", "FIFO"] as const).map((p) => {
          const Icon = POLICY_ICON_MAP[p];
          return (
            <button
              key={p}
              onClick={() => { setPolicy(p); resetAll(); }}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium transition-all border",
                policy === p
                  ? POLICY_STYLES[p].active
                  : "bg-muted/20 border-border/30 text-muted-foreground hover:bg-muted/40"
              )}
            >
              <Icon className="size-3 inline mr-1" />
              {p}
            </button>
          );
        })}
        <button
          onClick={resetAll}
          className="px-3 py-1.5 rounded-md text-xs font-medium bg-muted/20 border border-border/30 text-muted-foreground hover:bg-muted/40 ml-auto transition-all"
        >
          Reset
        </button>
      </div>

      {/* Access buttons */}
      <div className="flex gap-1.5 flex-wrap items-center">
        <span className="text-[11px] text-muted-foreground font-medium mr-1">Access:</span>
        {ALL_KEYS.map((key) => {
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

      {/* Visual cache slots */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground font-medium">
            Cache slots ({cache.length}/{CACHE_SIZE}):
          </span>
          <span className="text-[10px] text-muted-foreground/60">
            {policy === "LRU" && "lowest last-access gets evicted"}
            {policy === "LFU" && "lowest frequency gets evicted"}
            {policy === "FIFO" && "first-in slot gets evicted"}
          </span>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: CACHE_SIZE }).map((_, i) => {
            const entry = cache[i];
            const isVictim = i === victimIdx && cache.length >= CACHE_SIZE;
            const isNew = i === newSlot;
            return (
              <div
                key={i}
                className={cn(
                  "rounded-xl border-2 p-3 text-center transition-all duration-300 relative",
                  entry
                    ? isNew
                      ? "border-emerald-400/60 bg-emerald-500/10 ring-2 ring-emerald-500/20"
                      : isVictim
                      ? "border-red-400/40 bg-red-500/5"
                      : cn("bg-muted/5", SLOT_COLORS[entry.key] ?? "border-border/30")
                    : "border-dashed border-muted-foreground/15 bg-muted/5"
                )}
              >
                {entry ? (
                  <>
                    <div className="font-bold text-lg">{entry.key}</div>
                    <div className="space-y-0.5 mt-1 text-[10px] text-muted-foreground">
                      {policy === "LRU" && (
                        <div>last: <span className="font-mono font-bold text-foreground">t{entry.lastAccess}</span></div>
                      )}
                      {policy === "LFU" && (
                        <>
                          <div>freq: <span className="font-mono font-bold text-foreground">{entry.freq}</span></div>
                          <div>last: <span className="font-mono text-foreground">t{entry.lastAccess}</span></div>
                        </>
                      )}
                      {policy === "FIFO" && (
                        <div>pos: <span className="font-mono font-bold text-foreground">#{i + 1}</span></div>
                      )}
                    </div>
                    {isVictim && (
                      <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">
                        NEXT
                      </div>
                    )}
                    {isNew && (
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

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Hits", value: hitCount, border: "border-emerald-500/20", bg: "bg-emerald-500/5", text: "text-emerald-400" },
          { label: "Misses", value: missCount, border: "border-red-500/20", bg: "bg-red-500/5", text: "text-red-400" },
          { label: "Hit Rate", value: `${hitRate}%`, border: "border-blue-500/20", bg: "bg-blue-500/5", text: "text-blue-400" },
        ].map((s) => (
          <div key={s.label} className={cn("rounded-lg border p-2 text-center", s.border, s.bg)}>
            <div className="text-[10px] text-muted-foreground">{s.label}</div>
            <div className={cn("text-sm font-bold", s.text)}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Action log */}
      {lastAction && (
        <div className={cn(
          "text-xs px-3 py-2 rounded-md border font-mono transition-all",
          lastEvicted ? "bg-red-500/5 border-red-500/20 text-red-400"
            : lastAction.startsWith("HIT") ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400"
            : "bg-blue-500/5 border-blue-500/20 text-blue-400"
        )}>
          {lastAction}
        </div>
      )}
      {/* History */}
      {history.length > 0 && (
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-[10px] text-muted-foreground/50 mr-1">History:</span>
          {history.map((h, i) => (
            <span key={i} className="text-[10px] font-mono text-muted-foreground/60 bg-muted/20 rounded px-1 py-0.5">{h}</span>
          ))}
        </div>
      )}
    </div>
  );
}

const EVICTION_REASONS: Record<Policy, string> = { LRU: "least recently used", LFU: "least frequently used", FIFO: "first in, first out" };

const CHALLENGE_SEQUENCE = ["A", "B", "C", "D", "A", "B", "E", "A", "B", "C", "D", "E"];

function AccessPatternChallenge() {
  const sim = useSimulation({ intervalMs: 600, maxSteps: CHALLENGE_SEQUENCE.length });

  const activeIdx = sim.step;

  const results = useMemo(() => {
    const sub = CHALLENGE_SEQUENCE.slice(0, activeIdx);
    return {
      LRU: simulateSequence(sub, "LRU", 4),
      LFU: simulateSequence(sub, "LFU", 4),
      FIFO: simulateSequence(sub, "FIFO", 4),
    };
  }, [activeIdx]);

  const lineData = useMemo(() => {
    if (activeIdx === 0) return [];
    const { hitRateOverTime: lru } = results.LRU;
    const { hitRateOverTime: lfu } = results.LFU;
    const { hitRateOverTime: fifo } = results.FIFO;
    return lru.map((_, i) => ({
      step: lru[i].step,
      LRU: lru[i].rate,
      LFU: lfu[i].rate,
      FIFO: fifo[i].rate,
    }));
  }, [activeIdx, results]);

  return (
    <Playground
      title="Access Pattern Challenge"
      simulation={sim}
      canvasHeight="min-h-[420px]"
      canvas={
        <div className="p-4 space-y-4">
          {/* Sequence progress */}
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-[10px] text-muted-foreground mr-1">Sequence:</span>
            {CHALLENGE_SEQUENCE.map((s, i) => {
              const stateClass =
                i < activeIdx
                  ? "bg-blue-500/15 text-blue-400"
                  : i === activeIdx
                  ? "bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30"
                  : "bg-muted/10 text-muted-foreground/30";
              return (
                <span
                  key={i}
                  className={cn(
                    "text-[11px] font-mono font-bold size-6 rounded flex items-center justify-center transition-all",
                    stateClass
                  )}
                >
                  {s}
                </span>
              );
            })}
          </div>

          {/* Bar comparison */}
          <div className="grid grid-cols-3 gap-2">
            {(["LRU", "LFU", "FIFO"] as const).map((p) => {
              const r = results[p];
              const maxRate = Math.max(results.LRU.rate, results.LFU.rate, results.FIFO.rate);
              const isLeader = activeIdx > 0 && r.rate === maxRate && r.rate > 0;
              return (
                <div key={p} className={cn("rounded-lg border p-3 text-center transition-all", isLeader ? "border-emerald-500/30 bg-emerald-500/5" : "border-border/20 bg-muted/5")}>
                  <div className="text-xs font-semibold mb-1">{p}</div>
                  <div className={cn("text-2xl font-bold", isLeader ? "text-emerald-400" : "text-muted-foreground")}>{r.rate}%</div>
                  <div className="text-[10px] text-muted-foreground">{r.hits}/{activeIdx} hits</div>
                  <div className="mt-2 h-2 bg-muted/20 rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all duration-300", POLICY_STYLES[p].bar)} style={{ width: `${r.rate}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Hit rate over time chart */}
          {lineData.length > 1 && (
            <LiveChart
              type="line"
              data={lineData}
              dataKeys={{ x: "step", y: ["LRU", "LFU", "FIFO"] }}
              height={160}
              unit="%"
              showLegend
            />
          )}
        </div>
      }
      explanation={
        <div className="space-y-3">
          <p className="text-xs">
            All three policies process the same sequence with cache size 4. Notice how
            <strong> A</strong> and <strong>B</strong> are accessed repeatedly -- LRU and LFU
            protect them, while FIFO evicts whatever arrived first.
          </p>
          {activeIdx >= CHALLENGE_SEQUENCE.length && (
            <div className="rounded-md border border-emerald-500/20 bg-emerald-500/5 p-2 text-xs text-emerald-400">
              Complete! Compare final hit rates above.
            </div>
          )}
        </div>
      }
    />
  );
}


type Scenario = {
  name: string;
  icon: typeof ShoppingCart;
  description: string;
  bestPolicy: Policy;
  reason: string;
  pattern: string;
  rates: Record<Policy, number>;
};

const SCENARIOS: Scenario[] = [
  {
    name: "E-commerce",
    icon: ShoppingCart,
    description: "Product catalog with trending items that shift hourly during flash sales.",
    bestPolicy: "LRU",
    reason: "Trending products change fast. LRU adapts quickly because it tracks recency, not lifetime frequency.",
    pattern: "High temporal locality, rapid popularity shifts",
    rates: { LRU: 92, LFU: 78, FIFO: 55 },
  },
  {
    name: "Social Media",
    icon: Users,
    description: "User profile data where celebrities are accessed far more than others.",
    bestPolicy: "LFU",
    reason: "Celebrity profiles are accessed millions of times. LFU keeps them cached; LRU might evict them during a brief lull.",
    pattern: "Stable popularity, power-law distribution",
    rates: { LRU: 80, LFU: 95, FIFO: 50 },
  },
  {
    name: "Video Streaming",
    icon: Tv,
    description: "Video metadata where new releases spike then decline, but catalog is huge.",
    bestPolicy: "LRU",
    reason: "New releases get intense short-term traffic then fade. LRU naturally ages out old content.",
    pattern: "Bursty access, short-lived popularity",
    rates: { LRU: 88, LFU: 72, FIFO: 60 },
  },
];

function ScenarioPicker() {
  const [activeIdx, setActiveIdx] = useState(0);
  const scenario = SCENARIOS[activeIdx];
  const Icon = scenario.icon;

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {SCENARIOS.map((s, i) => {
          const SIcon = s.icon;
          return (
            <button key={s.name} onClick={() => setActiveIdx(i)} className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all",
              i === activeIdx ? "bg-violet-500/10 border-violet-500/30 text-violet-400" : "bg-muted/20 border-border/30 text-muted-foreground hover:bg-muted/40"
            )}>
              <SIcon className="size-3.5" />{s.name}
            </button>
          );
        })}
      </div>

      <div className="rounded-xl border border-border/30 bg-muted/5 p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-violet-500/10 p-2">
            <Icon className="size-5 text-violet-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">{scenario.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{scenario.description}</p>
          </div>
          <div className={cn("px-2.5 py-1 rounded-md text-xs font-bold", POLICY_STYLES[scenario.bestPolicy].active)}>
            {scenario.bestPolicy}
          </div>
        </div>

        <div className="rounded-lg bg-muted/10 border border-border/20 p-3">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Pattern: </span>
          <span className="text-[10px] text-muted-foreground/60">{scenario.pattern}</span>
          <p className="text-xs text-muted-foreground mt-1">{scenario.reason}</p>
        </div>

        <div className="space-y-1.5">
          {(["LRU", "LFU", "FIFO"] as const).map((p) => {
            const isBest = p === scenario.bestPolicy;
            return (
              <div key={p} className="flex items-center gap-2">
                <span className="text-[10px] font-mono w-8 text-muted-foreground">{p}</span>
                <div className="flex-1 h-3 bg-muted/10 rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full transition-all duration-500", isBest ? "bg-emerald-500/60" : "bg-muted-foreground/20")} style={{ width: `${scenario.rates[p]}%` }} />
                </div>
                <span className={cn("text-[10px] font-mono w-8 text-right", isBest ? "text-emerald-400 font-bold" : "text-muted-foreground")}>{scenario.rates[p]}%</span>
              </div>
            );
          })}
        </div>
      </div>
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

      {/* Section: The Problem */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">Why eviction policy matters</h2>
        <p className="text-sm text-muted-foreground">
          Cache memory is finite. A 1 GB Redis instance might hold ~10 million small keys. When it
          fills up, every new entry requires evicting an old one. A bad policy removes data that will
          be requested again in milliseconds, causing a miss that slams the database. A good policy
          keeps the &quot;working set&quot; -- the data actively being accessed -- in memory.
        </p>
        <BeforeAfter
          before={{
            title: "Naive FIFO eviction",
            content: (
              <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                <li>Popular items evicted because they were loaded first</li>
                <li>Hit rate drops to 40-50% under load</li>
                <li>Database constantly hit for hot data</li>
              </ul>
            ),
          }}
          after={{
            title: "Policy matched to workload",
            content: (
              <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                <li>LRU for most workloads (sessions, API responses)</li>
                <li>LFU for stable popularity (CDN, popular products)</li>
                <li>Hit rate stays above 90%</li>
              </ul>
            ),
          }}
        />
      </section>

      {/* Section: The Three Policies */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">The three core policies</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {([
            { name: "LRU" as const, full: "Least Recently Used", desc: "Evicts the item not accessed for the longest time. Works well when recent access predicts future access." },
            { name: "LFU" as const, full: "Least Frequently Used", desc: "Evicts the item with fewest total accesses. Best when some items are consistently more popular." },
            { name: "FIFO" as const, full: "First In, First Out", desc: "Evicts the oldest-inserted item regardless of access. Simple but ignores usage patterns." },
          ]).map((p) => {
            const Icon = POLICY_ICON_MAP[p.name];
            return (
              <div key={p.name} className="rounded-xl border border-border/30 bg-muted/5 p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <div className={cn("rounded-md p-1.5", POLICY_STYLES[p.name].active)}><Icon className="size-4" /></div>
                  <div>
                    <p className="text-sm font-bold">{p.name}</p>
                    <p className="text-[10px] text-muted-foreground">{p.full}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{p.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Section: Interactive Simulator */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">Cache eviction simulator</h2>
        <p className="text-sm text-muted-foreground">
          Click the letter buttons to access keys. Watch how each policy decides what to evict when
          the cache (size {CACHE_SIZE}) is full. The red &quot;NEXT&quot; badge shows which entry
          will be evicted on the next miss. Switch policies and compare hit rates.
        </p>
        <div className="rounded-xl border border-border/30 bg-muted/[0.02] p-4">
          <CacheEvictionSimulator />
        </div>
        <ConversationalCallout type="tip">
          Try this sequence with each policy: A, B, C, D, E, A, B, F, A, B, C.
          With LRU, frequently-accessed A and B survive. With FIFO, they get evicted first.
          With LFU, their frequency counts protect them. Watch the hit rate difference.
        </ConversationalCallout>
      </section>

      {/* Section: Race challenge */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">Access pattern challenge</h2>
        <p className="text-sm text-muted-foreground">
          Watch all three algorithms race through the same access sequence. Press play to see
          which achieves the highest hit rate -- and why.
        </p>
        <AccessPatternChallenge />
      </section>

      <AhaMoment
        question="Why does Redis default to LRU instead of LFU?"
        answer={
          <p>
            Most real-world access patterns exhibit <em>temporal locality</em> -- what was accessed
            recently is likely to be accessed again soon. LRU captures this naturally. LFU is better
            for frequency-stable workloads (like CDN assets popular for weeks), but it adapts slowly
            when popularity shifts. Since Redis 4.0, you can switch to LFU
            with <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">maxmemory-policy allkeys-lfu</code>.
          </p>
        }
      />

      <ConversationalCallout type="warning">
        LFU has the <strong>accumulation problem</strong>: an item accessed 10,000 times yesterday
        but never today still has a high count and resists eviction. Redis solves this with a
        probabilistic Morris counter (1 byte per key) that decays over time. Tune the decay rate
        with <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">lfu-decay-time</code>.
      </ConversationalCallout>

      {/* Section: Real-world scenarios */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">Real-world scenarios</h2>
        <p className="text-sm text-muted-foreground">
          Pick a scenario to see which eviction policy fits best and why. The estimated hit-rate
          bars show relative performance for each workload pattern.
        </p>
        <ScenarioPicker />
      </section>

      <ConversationalCallout type="question">
        In a system design interview, mention that you would use LRU as a default and layer TTL on
        top for staleness control. If the interviewer pushes on specific workload patterns (CDN,
        leaderboard), suggest LFU. Knowing <em>when</em> to switch policies shows deeper
        understanding than just naming them.
      </ConversationalCallout>

      <KeyTakeaway
        points={[
          "LRU is the safest default -- it works well for temporal locality patterns common in web traffic.",
          "LFU captures popularity but adapts slowly. Redis uses a probabilistic Morris counter (1 byte per key) with time-based decay.",
          "Redis uses approximated LRU/LFU (sampling 5 random keys) instead of true implementations to save memory.",
          "FIFO is simple but usually produces the worst hit rates. Random eviction often outperforms it.",
          "Always layer TTL on top of LRU/LFU to bound maximum staleness.",
          "Monitor hit rate with Redis INFO stats -- the best policy is the one that maximizes hit rate for your access pattern.",
        ]}
      />
    </div>
  );
}
