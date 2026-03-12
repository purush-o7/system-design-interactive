"use client";

import { useState, useCallback, useRef, useMemo } from "react";
import { TopicHero } from "@/components/topic-hero";
import { KeyTakeaway } from "@/components/key-takeaway";
import { AhaMoment } from "@/components/aha-moment";
import { ConversationalCallout } from "@/components/conversational-callout";
import { BeforeAfter } from "@/components/before-after";
import { Playground } from "@/components/playground";
import { LiveChart } from "@/components/live-chart";
import { FlowDiagram, type FlowNode, type FlowEdge } from "@/components/flow-diagram";
import { cn } from "@/lib/utils";

// ─── Hash Functions ──────────────────────────────────────────────────────────

function hash1(str: string, m: number): number {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) >>> 0;
  return h % m;
}

function hash2(str: string, m: number): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 0x01000193) >>> 0;
  return h % m;
}

function hash3(str: string, m: number): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) >>> 0;
  return (h ^ (h >>> 16)) % m;
}

function getPositions(word: string, m: number): [number, number, number] {
  return [hash1(word, m), hash2(word, m), hash3(word, m)];
}

// ─── Bit Array Playground ────────────────────────────────────────────────────

const M = 24;

type HighlightMode = "add" | "hit" | "miss" | "falsePositive" | null;

interface ResultState {
  message: string;
  mode: HighlightMode;
  positions: number[];
}

function BitArrayPlayground() {
  const [bits, setBits] = useState<number[]>(new Array(M).fill(0));
  const [inserted, setInserted] = useState<string[]>([]);
  const [addInput, setAddInput] = useState("");
  const [queryInput, setQueryInput] = useState("");
  const [result, setResult] = useState<ResultState | null>(null);
  const clearRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleHide = useCallback(() => {
    if (clearRef.current) clearTimeout(clearRef.current);
    clearRef.current = setTimeout(() => setResult(null), 3200);
  }, []);

  const handleAdd = useCallback(() => {
    const word = addInput.trim().toLowerCase();
    if (!word) return;
    const [p1, p2, p3] = getPositions(word, M);
    const next = [...bits];
    next[p1] = 1; next[p2] = 1; next[p3] = 1;
    setBits(next);
    if (!inserted.includes(word)) setInserted((p) => [...p, word]);
    setResult({ message: `Added "${word}" — bits [${p1}, ${p2}, ${p3}] lit up`, mode: "add", positions: [p1, p2, p3] });
    setAddInput("");
    scheduleHide();
  }, [addInput, bits, inserted, scheduleHide]);

  const handleQuery = useCallback(() => {
    const word = queryInput.trim().toLowerCase();
    if (!word) return;
    const [p1, p2, p3] = getPositions(word, M);
    const allSet = bits[p1] && bits[p2] && bits[p3];
    const reallyIn = inserted.includes(word);
    let mode: HighlightMode;
    let message: string;
    if (allSet && reallyIn) {
      mode = "hit";
      message = `"${word}" → PROBABLY IN SET ✓ (true positive — it was added)`;
    } else if (allSet && !reallyIn) {
      mode = "falsePositive";
      message = `"${word}" → PROBABLY IN SET ✗ FALSE POSITIVE! Never added, but all 3 bits are set by other elements`;
    } else {
      const zeroBits = [p1, p2, p3].filter((p) => !bits[p]);
      mode = "miss";
      message = `"${word}" → DEFINITELY NOT IN SET — bit(s) [${zeroBits.join(", ")}] are 0`;
    }
    setResult({ message, mode, positions: [p1, p2, p3] });
    setQueryInput("");
    scheduleHide();
  }, [queryInput, bits, inserted, scheduleHide]);

  const handleReset = useCallback(() => {
    setBits(new Array(M).fill(0));
    setInserted([]);
    setResult(null);
  }, []);

  const filledCount = bits.filter(Boolean).length;

  const bitColors: Record<string, string> = {
    on: "bg-blue-500/20 border-blue-500/40 text-blue-400",
    off: "bg-muted/20 border-border/50 text-muted-foreground/30",
    add: "ring-2 ring-emerald-400 scale-110 bg-emerald-500/20 border-emerald-500/40 text-emerald-300",
    hit: "ring-2 ring-amber-400 scale-110 bg-amber-500/20 border-amber-500/40 text-amber-300",
    miss: "ring-2 ring-red-400 scale-110",
    falsePositive: "ring-2 ring-rose-400 scale-110 bg-rose-500/20 border-rose-500/40 text-rose-300",
  };

  const resultBorder: Record<string, string> = {
    add: "border-emerald-500/30 bg-emerald-500/5 text-emerald-400",
    hit: "border-amber-500/30 bg-amber-500/5 text-amber-400",
    miss: "border-red-500/30 bg-red-500/5 text-red-400",
    falsePositive: "border-rose-500/40 bg-rose-500/8 text-rose-300 font-semibold",
  };

  return (
    <Playground
      title="Bloom Filter — Interactive Bit Array"
      canvasHeight="min-h-[260px]"
      canvas={
        <div className="p-5 space-y-4">
          {/* Bit grid */}
          <div>
            <div className="text-[10px] text-muted-foreground mb-2 font-mono uppercase tracking-wider">
              {M}-bit array · k=3 hash functions
            </div>
            <div className="flex flex-wrap gap-1.5">
              {bits.map((bit, i) => {
                const isHighlighted = result?.positions.includes(i);
                const highlightKey = isHighlighted ? result?.mode : null;
                return (
                  <div
                    key={i}
                    className={cn(
                      "w-8 h-8 rounded-md text-xs font-mono flex items-center justify-center border transition-all duration-300 select-none",
                      bit === 1 && !isHighlighted && bitColors.on,
                      bit === 0 && !isHighlighted && bitColors.off,
                      isHighlighted && highlightKey === "add" && bitColors.add,
                      isHighlighted && highlightKey === "hit" && bitColors.hit,
                      isHighlighted && highlightKey === "miss" && bit === 0 && bitColors.miss,
                      isHighlighted && highlightKey === "miss" && bit === 1 && "ring-2 ring-amber-500/50 scale-105",
                      isHighlighted && highlightKey === "falsePositive" && bitColors.falsePositive
                    )}
                  >
                    {bit}
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-4 mt-2 text-[10px] font-mono text-muted-foreground">
              <span>Bits set: {filledCount}/{M}</span>
              <span>Fill: {Math.round((filledCount / M) * 100)}%</span>
            </div>
          </div>

          {/* Result banner */}
          {result && (
            <div className={cn("rounded-lg border px-3 py-2 text-xs font-mono transition-all", resultBorder[result.mode ?? "miss"])}>
              {result.message}
            </div>
          )}

          {/* Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="flex gap-1.5">
              <input
                type="text"
                value={addInput}
                onChange={(e) => setAddInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                placeholder='Add a word ("apple")...'
                className="flex-1 min-w-0 rounded-md border bg-muted/20 px-3 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
              />
              <button
                onClick={handleAdd}
                className="shrink-0 rounded-md bg-emerald-500/15 border border-emerald-500/30 px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/25 transition-colors"
              >
                Add
              </button>
            </div>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleQuery()}
                placeholder='Query a word ("grape")...'
                className="flex-1 min-w-0 rounded-md border bg-muted/20 px-3 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-violet-500/50"
              />
              <button
                onClick={handleQuery}
                className="shrink-0 rounded-md bg-violet-500/15 border border-violet-500/30 px-3 py-1.5 text-xs font-semibold text-violet-400 hover:bg-violet-500/25 transition-colors"
              >
                Query
              </button>
            </div>
          </div>

          {/* Inserted items */}
          {inserted.length > 0 && (
            <div className="flex flex-wrap gap-1 items-center">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider mr-1">In filter:</span>
              {inserted.map((w) => (
                <span key={w} className="rounded bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-[10px] font-mono text-blue-400">
                  {w}
                </span>
              ))}
              <button onClick={handleReset} className="ml-auto text-[10px] text-muted-foreground hover:text-foreground underline transition-colors">
                Reset
              </button>
            </div>
          )}
        </div>
      }
      explanation={
        <div className="space-y-3">
          <p className="font-medium text-foreground">How it works</p>
          <p>Each word passes through <strong className="text-blue-400">3 hash functions</strong>, setting 3 bits in the array to 1.</p>
          <p>To query: run the same 3 hashes. If <em>all 3 bits are 1</em> → probably in set. If <em>any bit is 0</em> → definitely not in set.</p>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              <span className="text-[11px]">Green ring = bits set on add</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
              <span className="text-[11px]">Amber ring = true positive</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
              <span className="text-[11px]">Red ring = definite miss</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0" />
              <span className="text-[11px]">Rose ring = false positive!</span>
            </div>
          </div>
          <ConversationalCallout type="tip">
            Try adding <strong>apple, banana, cherry</strong>, then query <strong>grape</strong> for a definite NO. Add more words and query words you never inserted to catch a false positive.
          </ConversationalCallout>
        </div>
      }
      controls={false}
    />
  );
}

// ─── False Positive Rate Chart ────────────────────────────────────────────────

function fpRate(m: number, n: number): number {
  const k = Math.max(1, Math.min(20, Math.round((m / n) * Math.LN2)));
  return Math.pow(1 - Math.exp((-k * n) / m), k);
}

function FalsePositiveChart() {
  const [filterBits, setFilterBits] = useState(1000);

  const chartData = useMemo(() => {
    const points: { elements: number; fpRate: number }[] = [];
    for (let n = 10; n <= 1500; n += 30) {
      points.push({ elements: n, fpRate: parseFloat((fpRate(filterBits, n) * 100).toFixed(2)) });
    }
    return points;
  }, [filterBits]);

  const currentN = Math.min(750, filterBits);
  const currentFP = fpRate(filterBits, currentN) * 100;
  const optimalK = Math.max(1, Math.min(20, Math.round((filterBits / currentN) * Math.LN2)));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="space-y-1 flex-1 min-w-[160px]">
          <label className="text-[11px] text-muted-foreground">Filter size (m = {filterBits.toLocaleString()} bits)</label>
          <input
            type="range" min={200} max={4000} step={100} value={filterBits}
            onChange={(e) => setFilterBits(Number(e.target.value))}
            className="w-full h-1 rounded-full cursor-pointer accent-blue-500"
          />
        </div>
        <div className="flex gap-3 text-center shrink-0">
          <div className="rounded-lg bg-muted/30 px-3 py-2">
            <div className="text-[10px] text-muted-foreground">Optimal k</div>
            <div className="font-mono text-sm font-bold">{optimalK}</div>
          </div>
          <div className="rounded-lg bg-muted/30 px-3 py-2">
            <div className="text-[10px] text-muted-foreground">FP @ n={currentN}</div>
            <div className={cn("font-mono text-sm font-bold", currentFP > 10 ? "text-red-400" : currentFP > 1 ? "text-amber-400" : "text-emerald-400")}>
              {currentFP < 0.01 ? "<0.01" : currentFP.toFixed(2)}%
            </div>
          </div>
          <div className="rounded-lg bg-muted/30 px-3 py-2">
            <div className="text-[10px] text-muted-foreground">bits/elem</div>
            <div className="font-mono text-sm font-bold">{(filterBits / currentN).toFixed(1)}</div>
          </div>
        </div>
      </div>

      <LiveChart
        type="area"
        data={chartData}
        dataKeys={{ x: "elements", y: "fpRate", label: "False Positive Rate %" }}
        unit="%"
        height={180}
        referenceLines={[{ y: 1, label: "1% FP", color: "#f59e0b" }]}
      />
      <p className="text-[11px] text-muted-foreground text-center font-mono">
        P(false positive) = (1 − e<sup>−kn/m</sup>)<sup>k</sup> · As more elements are added, bits saturate and false positives rise
      </p>
    </div>
  );
}

// ─── System Architecture Flow ─────────────────────────────────────────────────

const ARCH_NODES: FlowNode[] = [
  {
    id: "client",
    type: "clientNode",
    position: { x: 220, y: 0 },
    data: { label: "Client", sublabel: "URL lookup request", status: "healthy", handles: { bottom: true } },
  },
  {
    id: "bloom",
    type: "cacheNode",
    position: { x: 220, y: 130 },
    data: {
      label: "Bloom Filter",
      sublabel: "In-memory, ~10 MB",
      status: "healthy",
      metrics: [{ label: "1B URLs", value: "<10 MB" }],
      handles: { top: true, bottom: true, right: true },
    },
  },
  {
    id: "cache",
    type: "cacheNode",
    position: { x: 220, y: 260 },
    data: {
      label: "Redis Cache",
      sublabel: "Hot entries",
      status: "healthy",
      handles: { top: true, bottom: true, right: true },
    },
  },
  {
    id: "db",
    type: "databaseNode",
    position: { x: 220, y: 390 },
    data: { label: "Database", sublabel: "Source of truth", status: "idle", handles: { top: true } },
  },
  {
    id: "skip-cache",
    type: "serverNode",
    position: { x: 460, y: 200 },
    data: { label: "Definitely NOT in set", sublabel: "Skip — return 404", status: "unhealthy", handles: { left: true } },
  },
  {
    id: "skip-db",
    type: "serverNode",
    position: { x: 460, y: 320 },
    data: { label: "Cache hit", sublabel: "Return without DB", status: "healthy", handles: { left: true } },
  },
];

const ARCH_EDGES: FlowEdge[] = [
  { id: "e1", source: "client", target: "bloom", animated: true, label: "Is URL in system?" },
  { id: "e2", source: "bloom", target: "cache", animated: true, label: "Probably YES → check cache" },
  { id: "e3", source: "cache", target: "db", animated: true, label: "Cache miss → DB" },
  { id: "e4", source: "bloom", target: "skip-cache", animated: false, style: { stroke: "#ef4444", strokeDasharray: "5,5" }, label: "Definitely NO" },
  { id: "e5", source: "cache", target: "skip-db", animated: false, style: { stroke: "#10b981", strokeDasharray: "5,5" }, label: "Hit" },
];

function SystemFlowSection() {
  return (
    <Playground
      title="Where Bloom Filters Fit in a System"
      canvasHeight="min-h-[480px]"
      canvas={
        <div className="p-4 h-full">
          <FlowDiagram nodes={ARCH_NODES} edges={ARCH_EDGES} minHeight={460} interactive={false} fitView />
        </div>
      }
      explanation={
        <div className="space-y-3">
          <p className="font-medium text-foreground">The lookup pyramid</p>
          <p>A request first hits the Bloom filter — a tiny in-memory structure. Based on its answer, we route the request:</p>
          <div className="space-y-2">
            <div className="rounded-md border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs">
              <span className="text-red-400 font-semibold">Definitely NO</span> — The filter guarantees the URL was never inserted. Return 404 immediately. No cache or DB I/O.
            </div>
            <div className="rounded-md border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs">
              <span className="text-amber-400 font-semibold">Probably YES</span> — Check Redis. If found, return from cache. If not (could be a false positive), fall through to DB.
            </div>
          </div>
          <p className="text-[11px]">At 1 billion URLs with ~1% false positive rate, the Bloom filter blocks <strong className="text-foreground">~99% of non-existent lookups</strong> before they ever reach Redis or the database.</p>
        </div>
      }
      controls={false}
    />
  );
}

// ─── Shared Bits Illustration ─────────────────────────────────────────────────

function SharedBitsDemo() {
  const applePos = getPositions("apple", M);
  const mangoPos = getPositions("mango", M);
  const shared = applePos.filter((p) => mangoPos.includes(p));

  return (
    <div className="rounded-xl border bg-muted/10 p-4 space-y-3">
      <p className="text-xs font-medium text-foreground">Why you cannot delete from a Bloom filter</p>
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono flex-wrap">
          <span className="text-blue-400">"apple"</span>
          <span className="text-muted-foreground">→ bits</span>
          <span className="rounded bg-blue-500/20 border border-blue-500/30 px-2 py-0.5 text-blue-300">[{applePos.join(", ")}]</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono flex-wrap">
          <span className="text-emerald-400">"mango"</span>
          <span className="text-muted-foreground">→ bits</span>
          <span className="rounded bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 text-emerald-300">[{mangoPos.join(", ")}]</span>
        </div>
        {shared.length > 0 && (
          <div className="text-xs text-muted-foreground">
            Bit{shared.length > 1 ? "s" : ""} <strong className="text-amber-400">[{shared.join(", ")}]</strong> shared between both words.
            Clearing it to "remove" apple would make mango look absent — a <strong className="text-red-400">false negative</strong>, which breaks the core guarantee.
          </div>
        )}
        {shared.length === 0 && (
          <div className="text-xs text-muted-foreground">
            No shared bits in this 24-bit demo, but at higher fill ratios, collisions become common.
          </div>
        )}
      </div>
      <ConversationalCallout type="tip">
        <strong>Counting Bloom Filters</strong> replace each bit with a small counter. Increment on add, decrement on remove — a position is "set" when the counter is greater than 0. Deletion is now safe, at the cost of more memory.
      </ConversationalCallout>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BloomFiltersPage() {
  return (
    <div className="space-y-10">
      <TopicHero
        title="Bloom Filters"
        subtitle="A probabilistic data structure that answers 'is this in the set?' with zero false negatives and a tunable false positive rate — in just a few kilobytes."
        difficulty="intermediate"
      />

      <ConversationalCallout type="question">
        Your URL shortener serves 1 billion URLs. Before generating a new short code, you need to check whether it already exists. Checking the database every time costs 200 ms and causes 10,000 DB queries/second at scale. What if most of those could be eliminated before touching the database at all?
      </ConversationalCallout>

      {/* Interactive Bit Array */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Watch It Work</h2>
        <p className="text-sm text-muted-foreground">
          A Bloom filter is a bit array of <em>m</em> bits, all starting at 0. When you insert a word,
          k independent hash functions each point to a bit position — all set to 1. To query, run the same
          hashes: if any pointed-to bit is 0, the element was <strong className="text-foreground">definitely never inserted</strong>.
        </p>
        <BitArrayPlayground />
      </section>

      <AhaMoment
        question="Why can a Bloom filter have false positives but never false negatives?"
        answer={
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong className="text-red-400">Definite NO:</strong> If the filter returns "no", at least one of the k
              bit positions is 0. A 0 bit means nothing has ever set it — so the element was <em>definitely</em> never added. This is a hard guarantee.
            </p>
            <p>
              <strong className="text-amber-400">Probable YES:</strong> If all k bits are 1, those bits could have been
              set by <em>different</em> elements that happened to hash to the same positions. The queried element may
              never have been inserted — a false positive.
            </p>
            <p className="font-medium text-foreground">
              "If the Bloom filter says NO, it is always right. If it says YES, trust but verify."
            </p>
          </div>
        }
      />

      {/* False Positive Rate Chart */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">False Positive Rate vs. Fill</h2>
        <p className="text-sm text-muted-foreground">
          The false positive rate is tunable. A larger filter (more bits per element) means fewer collisions
          and a lower false positive rate. Drag the slider to see how filter size changes the curve.
        </p>
        <FalsePositiveChart />
      </section>

      {/* System Architecture Flow */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Where It Fits in a System</h2>
        <p className="text-sm text-muted-foreground">
          Bloom filters live at the very front of the lookup chain — cheap enough to query in microseconds,
          powerful enough to eliminate the majority of expensive I/O.
        </p>
        <SystemFlowSection />
      </section>

      <BeforeAfter
        before={{
          title: "Without Bloom Filter",
          content: (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-red-500/5 border border-red-500/20 p-2 text-center">
                  <div className="text-[10px] text-muted-foreground">DB queries/sec</div>
                  <div className="font-mono font-bold text-red-400">10,000</div>
                </div>
                <div className="rounded-lg bg-red-500/5 border border-red-500/20 p-2 text-center">
                  <div className="text-[10px] text-muted-foreground">Response time</div>
                  <div className="font-mono font-bold text-red-400">200 ms</div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Every existence check hits the database. At scale the DB becomes saturated — slow queries cascade into timeouts.</p>
            </div>
          ),
        }}
        after={{
          title: "With Bloom Filter",
          content: (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/20 p-2 text-center">
                  <div className="text-[10px] text-muted-foreground">DB queries/sec</div>
                  <div className="font-mono font-bold text-emerald-400">~100</div>
                </div>
                <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/20 p-2 text-center">
                  <div className="text-[10px] text-muted-foreground">Response time</div>
                  <div className="font-mono font-bold text-emerald-400">~8 ms</div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">99% of non-existent lookups are blocked at the filter. Only true positives and the ~1% false positives ever reach the DB.</p>
            </div>
          ),
        }}
      />

      {/* Deletion Caveat */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">The Deletion Problem</h2>
        <SharedBitsDemo />
      </section>

      <ConversationalCallout type="warning">
        A Bloom filter never grows smaller as you add elements — bits can only be set to 1, never back to 0. Plan your filter size upfront based on expected element count and target false positive rate. A fully saturated filter (all bits = 1) returns "probably yes" for everything.
      </ConversationalCallout>

      {/* Real-World Uses */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Real-World Deployments</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            {
              name: "Cassandra",
              desc: "Checks a Bloom filter before reading SSTables on disk. If the filter says NO, Cassandra skips the file entirely — eliminating expensive disk I/O for missing keys.",
            },
            {
              name: "Chrome Safe Browsing",
              desc: 'Checks every URL against a local Bloom filter of known malware sites. Only contacts Google\'s servers if the filter says "probably yes" — preserving privacy for 99%+ of lookups.',
            },
            {
              name: "Medium",
              desc: "Uses per-user Bloom filters to avoid recommending articles you have already read. A small in-memory filter is far cheaper than querying a read-history table.",
            },
            {
              name: "CDN One-Hit-Wonder",
              desc: "Only caches content accessed at least twice. The Bloom filter tracks first accesses so the CDN does not waste cache space on one-time requests.",
            },
          ].map((item) => (
            <div key={item.name} className="rounded-xl border bg-muted/10 p-4 space-y-1">
              <h4 className="text-sm font-semibold text-foreground">{item.name}</h4>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <KeyTakeaway
        points={[
          "Bloom filters answer 'is X in the set?' with zero false negatives and a tunable false positive rate — using a tiny fixed-size bit array.",
          "The false positive rate is controlled by bits-per-element (m/n). ~10 bits/element with optimal k hash functions gives roughly 1% FP rate.",
          "Standard Bloom filters do not support deletion. Use Counting Bloom Filters (counters instead of bits) if removal is needed.",
          "Memory efficiency is the superpower: 1 billion elements can be tested with ~1.2 GB at 1% FP — vs. tens of GB for a hash set.",
          "Place a Bloom filter in front of every expensive lookup (DB, disk, network) to eliminate the majority of unnecessary I/O before it happens.",
          "Production systems — Cassandra, Chrome, Medium, CDNs — use Bloom filters to absorb lookup traffic and protect downstream resources.",
        ]}
      />
    </div>
  );
}
