"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { TopicHero } from "@/components/topic-hero";
import { KeyTakeaway } from "@/components/key-takeaway";
import { AhaMoment } from "@/components/aha-moment";
import { Playground } from "@/components/playground";
import { LiveChart } from "@/components/live-chart";
import { useSimulation } from "@/hooks/use-simulation";
import { cn } from "@/lib/utils";
import { Search, Zap, Database, PenLine } from "lucide-react";
import { WhyCare } from "@/components/why-care";
import { GlossaryTerm } from "@/components/glossary-term";
import { TopicQuiz } from "@/components/topic-quiz";

/* ------------------------------------------------------------------ */
/*  1. B-Tree Search Visualizer                                       */
/* ------------------------------------------------------------------ */

type TreeNodeData = { keys: number[]; id: string };

const TREE: { root: TreeNodeData; branches: TreeNodeData[]; leaves: TreeNodeData[] } = {
  root: { keys: [30, 60], id: "root" },
  branches: [
    { keys: [10, 20], id: "b-left" },
    { keys: [35, 42, 50], id: "b-mid" },
    { keys: [70, 85], id: "b-right" },
  ],
  leaves: [
    { keys: [5, 8, 10], id: "l-0" },
    { keys: [15, 18, 20], id: "l-1" },
    { keys: [35, 37, 40], id: "l-2" },
    { keys: [42, 45, 48], id: "l-3" },
    { keys: [50, 55, 58], id: "l-4" },
    { keys: [62, 65, 70], id: "l-5" },
    { keys: [75, 80, 85], id: "l-6" },
    { keys: [90, 95, 99], id: "l-7" },
  ],
};

function findPath(target: number) {
  // Determine branch
  let branchIdx = 0;
  if (target > 60) branchIdx = 2;
  else if (target > 30) branchIdx = 1;

  // Determine leaf
  const branchKeys = TREE.branches[branchIdx].keys;
  let leafOffset = 0;
  for (let i = 0; i < branchKeys.length; i++) {
    if (target > branchKeys[i]) leafOffset = i + 1;
  }
  const leafGlobalIdx = branchIdx * 3 + Math.min(leafOffset, 2);
  const safeLeafIdx = Math.min(leafGlobalIdx, TREE.leaves.length - 1);
  const found = TREE.leaves[safeLeafIdx]?.keys.includes(target);
  return {
    branchIdx,
    leafIdx: safeLeafIdx,
    found,
    comparisons: 3, // root comparison + branch comparison + leaf scan
  };
}

function BTreePlayground() {
  const [searchValue, setSearchValue] = useState("42");
  const [animStep, setAnimStep] = useState(-1);
  const [scanning, setScanning] = useState(false);

  const target = parseInt(searchValue) || 42;
  const path = useMemo(() => findPath(target), [target]);
  const totalRows = 10_000_000;
  const fullScanComparisons = totalRows;
  const indexComparisons = path.comparisons;

  const runSearch = useCallback(() => {
    setAnimStep(0);
    setScanning(true);
    const timers = [
      setTimeout(() => setAnimStep(1), 500),
      setTimeout(() => setAnimStep(2), 1100),
      setTimeout(() => setAnimStep(3), 1700),
      setTimeout(() => { setAnimStep(3); setScanning(false); }, 2200),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => { setAnimStep(-1); setScanning(false); }, [searchValue]);

  const nodeClass = (active: boolean, found: boolean) =>
    cn(
      "rounded-lg border px-3 py-2 transition-all duration-500",
      active && found ? "bg-emerald-500/15 border-emerald-500/40 ring-2 ring-emerald-500/30 scale-105" :
      active ? "bg-blue-500/10 border-blue-500/40 ring-2 ring-blue-500/30 scale-105" :
      "bg-muted/20 border-border/40 opacity-50"
    );

  return (
    <Playground
      title="B-Tree Search Visualizer"
      controls={false}
      canvasHeight="min-h-[420px]"
      hints={["Enter a number and click Search Tree to watch the B-tree narrow down to the leaf node in just 3 comparisons."]}
      canvas={
        <div className="p-4 space-y-4">
          {/* Search bar */}
          <div className="flex items-center gap-3 justify-center">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <input
                type="number"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-28 rounded-lg border bg-muted/30 pl-8 pr-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                placeholder="Key..."
                min={1}
                max={99}
              />
            </div>
            <button
              onClick={runSearch}
              disabled={scanning}
              className="rounded-lg bg-violet-500/20 border border-violet-500/30 px-4 py-2 text-sm font-medium text-violet-400 hover:bg-violet-500/30 transition-colors disabled:opacity-40"
            >
              {scanning ? "Searching..." : "Search Tree"}
            </button>
          </div>

          {/* Tree visualization */}
          <div className="space-y-3">
            {/* Root */}
            <div className="flex justify-center">
              <div className={nodeClass(animStep >= 0, false)}>
                <p className="text-[9px] text-muted-foreground/60 mb-1 text-center">Root</p>
                <div className="flex gap-3">
                  {TREE.root.keys.map((k) => (
                    <span key={k} className={cn(
                      "font-mono text-sm font-bold px-2 py-0.5 rounded transition-colors",
                      animStep >= 0 && target <= k && (k === TREE.root.keys[0] || target > (TREE.root.keys[TREE.root.keys.indexOf(k) - 1] ?? 0))
                        ? "text-amber-400" : ""
                    )}>{k}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Connector lines */}
            <div className="flex justify-center gap-1 text-muted-foreground/20">
              {TREE.branches.map((_, i) => (
                <div key={i} className={cn(
                  "w-px h-4 mx-8 transition-colors duration-500",
                  animStep >= 1 && i === path.branchIdx ? "bg-blue-400" : "bg-border/40"
                )} />
              ))}
            </div>

            {/* Branches */}
            <div className="flex justify-center gap-3">
              {TREE.branches.map((branch, i) => (
                <div key={branch.id} className={nodeClass(animStep >= 1 && i === path.branchIdx, false)}>
                  <p className="text-[9px] text-muted-foreground/60 mb-1 text-center">Branch</p>
                  <div className="flex gap-1.5">
                    {branch.keys.map((k) => (
                      <span key={k} className={cn(
                        "font-mono text-xs font-medium px-1.5 py-0.5 rounded transition-colors",
                        animStep >= 1 && i === path.branchIdx && k === target ? "text-blue-400 bg-blue-500/10" : ""
                      )}>{k}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Connector lines */}
            <div className="flex justify-center gap-0.5">
              {TREE.leaves.map((_, i) => (
                <div key={i} className={cn(
                  "w-px h-4 mx-3 transition-colors duration-500",
                  animStep >= 2 && i === path.leafIdx ? "bg-blue-400" : "bg-border/40"
                )} />
              ))}
            </div>

            {/* Leaves */}
            <div className="flex justify-center gap-1.5 flex-wrap">
              {TREE.leaves.map((leaf, i) => (
                <div key={leaf.id} className={nodeClass(
                  animStep >= 2 && i === path.leafIdx,
                  animStep >= 3 && i === path.leafIdx && path.found
                )}>
                  <p className="text-[9px] text-muted-foreground/60 mb-1 text-center">Leaf</p>
                  <div className="flex gap-1">
                    {leaf.keys.map((k) => (
                      <span key={k} className={cn(
                        "font-mono text-[11px] font-medium px-1.5 py-0.5 rounded transition-all",
                        animStep >= 3 && i === path.leafIdx && k === target
                          ? "text-emerald-400 bg-emerald-500/20 ring-1 ring-emerald-500/40 font-bold"
                          : ""
                      )}>{k}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Linked leaf indicator */}
            <div className="flex justify-center">
              <span className="text-[9px] text-muted-foreground/40 font-mono">
                ... linked leaves: [{TREE.leaves.map(l => l.keys[0]).join("] → [")}] → ...
              </span>
            </div>
          </div>

          {/* Comparison counter */}
          {animStep >= 3 && (
            <div className="flex justify-center gap-6">
              <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-2 text-center">
                <p className="text-[10px] text-muted-foreground">Full Table Scan</p>
                <p className="text-lg font-mono font-bold text-red-400">{fullScanComparisons.toLocaleString()}</p>
                <p className="text-[9px] text-muted-foreground">comparisons</p>
              </div>
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-4 py-2 text-center">
                <p className="text-[10px] text-muted-foreground">B-Tree Index</p>
                <p className="text-lg font-mono font-bold text-emerald-400">{indexComparisons}</p>
                <p className="text-[9px] text-muted-foreground">comparisons</p>
              </div>
              <div className="rounded-lg border border-violet-500/20 bg-violet-500/5 px-4 py-2 text-center">
                <p className="text-[10px] text-muted-foreground">Result</p>
                <p className={cn("text-lg font-mono font-bold", path.found ? "text-emerald-400" : "text-amber-400")}>
                  {path.found ? "Found!" : "Not Found"}
                </p>
                <p className="text-[9px] text-muted-foreground">key {target}</p>
              </div>
            </div>
          )}
        </div>
      }
    />
  );
}

/* ------------------------------------------------------------------ */
/*  2. Query Performance Playground                                   */
/* ------------------------------------------------------------------ */

function QueryPerformancePlayground() {
  const [tableSize, setTableSize] = useState(100_000);
  const sim = useSimulation({ intervalMs: 100, maxSteps: 20 });

  const scanRows = 20;
  const scannedCount = Math.min(sim.step, scanRows);
  const indexJumped = sim.step >= 3;

  // Chart data for scaling
  const chartData = useMemo(() => {
    const points = [];
    for (let rows = 1000; rows <= 1_000_000; rows += rows < 10_000 ? 1000 : rows < 100_000 ? 10_000 : 100_000) {
      points.push({
        rows: rows >= 1_000_000 ? "1M" : rows >= 1000 ? `${rows / 1000}K` : `${rows}`,
        fullScan: Math.round(rows * 0.003),
        bTreeIndex: Math.round(Math.log2(rows) * 0.15 * 10) / 10,
      });
    }
    return points;
  }, []);

  const fullScanTime = Math.round(tableSize * 0.003);
  const indexTime = Math.round(Math.log2(tableSize) * 0.15 * 100) / 100;

  return (
    <Playground
      title="Query Performance: Scan vs Index"
      simulation={sim}
      canvasHeight="min-h-[500px]"
      canvas={
        <div className="p-4 space-y-5">
          {/* Side by side scan animation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Without Index */}
            <div className="rounded-lg border border-red-500/20 bg-red-500/[0.03] p-3 space-y-2">
              <div className="flex items-center gap-2">
                <Database className="size-3.5 text-red-400" />
                <span className="text-xs font-medium text-red-400">Without Index (Full Scan)</span>
              </div>
              <div className="grid grid-cols-10 gap-1">
                {Array.from({ length: scanRows }, (_, i) => {
                  const isMatch = i === 4 || i === 11 || i === 17;
                  const isChecked = i < scannedCount;
                  const isCurrent = i === scannedCount - 1 && sim.isPlaying;
                  return (
                    <div key={i} className={cn(
                      "h-7 rounded text-[8px] font-mono flex items-center justify-center border transition-all duration-150",
                      isCurrent ? "bg-amber-500/20 border-amber-500/40 text-amber-400 ring-1 ring-amber-500/30" :
                      isChecked && isMatch ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400" :
                      isChecked ? "bg-red-500/5 border-red-500/10 text-muted-foreground/30" :
                      "bg-muted/10 border-border/30 text-muted-foreground/40"
                    )}>
                      {i + 1}
                    </div>
                  );
                })}
              </div>
              <p className="text-[10px] text-muted-foreground">
                Checked: <span className="font-mono font-bold text-foreground">{scannedCount}/{scanRows}</span> rows
                {scannedCount >= scanRows && <span className="text-red-400 ml-1">-- scanned every row</span>}
              </p>
            </div>

            {/* With Index */}
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/[0.03] p-3 space-y-2">
              <div className="flex items-center gap-2">
                <Zap className="size-3.5 text-emerald-400" />
                <span className="text-xs font-medium text-emerald-400">With Index (B-Tree Lookup)</span>
              </div>
              <div className="grid grid-cols-10 gap-1">
                {Array.from({ length: scanRows }, (_, i) => {
                  const isMatch = i === 4 || i === 11 || i === 17;
                  return (
                    <div key={i} className={cn(
                      "h-7 rounded text-[8px] font-mono flex items-center justify-center border transition-all duration-150",
                      indexJumped && isMatch
                        ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400 ring-1 ring-emerald-500/30"
                        : "bg-muted/10 border-border/30 text-muted-foreground/40"
                    )}>
                      {i + 1}
                    </div>
                  );
                })}
              </div>
              <p className="text-[10px] text-muted-foreground">
                Checked: <span className="font-mono font-bold text-foreground">{indexJumped ? "3" : "0"}/{scanRows}</span> rows
                {indexJumped && <span className="text-emerald-400 ml-1">-- jumped directly to matches</span>}
              </p>
            </div>
          </div>

          {/* Table size slider + chart */}
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <label className="text-xs text-muted-foreground whitespace-nowrap">Table Size:</label>
              <input
                type="range"
                min={1000}
                max={1000000}
                step={1000}
                value={tableSize}
                onChange={(e) => setTableSize(Number(e.target.value))}
                className="flex-1 h-1.5 rounded-full accent-violet-500 cursor-pointer"
              />
              <span className="text-xs font-mono font-bold text-foreground w-16 text-right">
                {tableSize >= 1_000_000 ? "1M" : tableSize >= 1000 ? `${(tableSize / 1000).toFixed(0)}K` : tableSize}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-center">
                <p className="text-[10px] text-muted-foreground">Full Scan Time</p>
                <p className="text-xl font-mono font-bold text-red-400">{fullScanTime.toLocaleString()} <span className="text-xs">ms</span></p>
              </div>
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-center">
                <p className="text-[10px] text-muted-foreground">Index Lookup Time</p>
                <p className="text-xl font-mono font-bold text-emerald-400">{indexTime} <span className="text-xs">ms</span></p>
              </div>
            </div>

            <LiveChart
              type="line"
              data={chartData}
              dataKeys={{ x: "rows", y: ["fullScan", "bTreeIndex"], label: ["Full Scan (O(n))", "B-Tree (O(log n))"] }}
              height={180}
              unit="ms"
              referenceLines={[{ y: 1000, label: "1s threshold", color: "hsl(0,70%,50%)" }]}
            />
          </div>
        </div>
      }
    />
  );
}

/* ------------------------------------------------------------------ */
/*  3. Index Types Interactive Cards                                   */
/* ------------------------------------------------------------------ */

const INDEX_TYPES = {
  btree: {
    name: "B+Tree",
    icon: "🌲",
    color: "emerald",
    lookup: "O(log n)",
    insert: "O(log n)",
    range: "Excellent",
    bestFor: "Range queries, sorting, general purpose",
    visual: (
      <div className="space-y-2 pt-2">
        <p className="text-[10px] text-muted-foreground">Sorted tree with linked leaf nodes:</p>
        <div className="flex flex-col items-center gap-1">
          <div className="rounded border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[10px] font-mono">[30 | 60]</div>
          <div className="flex gap-4">
            {["[10,20]", "[35,42,50]", "[70,85]"].map(n => (
              <div key={n} className="rounded border border-emerald-500/20 bg-emerald-500/5 px-2 py-1 text-[10px] font-mono">{n}</div>
            ))}
          </div>
          <p className="text-[9px] text-emerald-400 font-mono">leaves linked: [10,20] → [35,42,50] → [70,85]</p>
        </div>
        <p className="text-[10px] text-muted-foreground italic">Default in PostgreSQL, MySQL InnoDB, SQLite. Handles equality, ranges, ORDER BY.</p>
      </div>
    ),
  },
  hash: {
    name: "Hash Index", icon: "#", color: "amber",
    lookup: "O(1) avg", insert: "O(1) avg", range: "Not supported",
    bestFor: "Exact equality lookups only",
    visual: (
      <div className="space-y-2 pt-2">
        <p className="text-[10px] text-muted-foreground">Hash function maps key directly to bucket:</p>
        <div className="grid grid-cols-2 gap-1">
          {["id=42 → Bucket 2 → row 127", "id=99 → Bucket 7 → row 541", "id=15 → Bucket 3 → row 892", "id=73 → Bucket 1 → row 203"].map((h) => (
            <span key={h} className="text-[9px] font-mono text-amber-400">{h}</span>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground italic">Fastest for WHERE id = 42, but cannot do ranges or sorting.</p>
      </div>
    ),
  },
  fulltext: {
    name: "Full-Text (GIN)", icon: "T", color: "violet",
    lookup: "O(log n) per term", insert: "O(log n) batch", range: "Containment queries",
    bestFor: "Text search, JSONB, array ops",
    visual: (
      <div className="space-y-2 pt-2">
        <p className="text-[10px] text-muted-foreground">Inverted index maps tokens to documents:</p>
        <div className="space-y-0.5">
          {['"database" → doc 1, 4, 12', '"index" → doc 1, 7, 12, 23', '"query" → doc 3, 7, 15'].map((t) => (
            <p key={t} className="text-[10px] font-mono text-violet-400">{t}</p>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground italic">Essential for PostgreSQL full-text search and JSONB queries.</p>
      </div>
    ),
  },
  composite: {
    name: "Composite Index",
    icon: "🔗",
    color: "blue",
    lookup: "O(log n)",
    insert: "O(log n)",
    range: "Leftmost prefix only",
    bestFor: "Multi-column WHERE/ORDER BY",
    visual: (
      <div className="space-y-2 pt-2">
        <p className="text-[10px] text-muted-foreground">Index on (category, price, created_at):</p>
        <div className="space-y-1">
          {[
            { query: "WHERE category = 'books'", works: true },
            { query: "WHERE category = 'books' AND price > 20", works: true },
            { query: "WHERE category = 'books' AND price > 20 AND created_at > ...", works: true },
            { query: "WHERE price > 20", works: false },
            { query: "WHERE created_at > '2024-01-01'", works: false },
          ].map((q) => (
            <div key={q.query} className="flex items-center gap-2 text-[10px]">
              <span className={cn("font-bold", q.works ? "text-emerald-400" : "text-red-400")}>
                {q.works ? "✓" : "✗"}
              </span>
              <code className="font-mono text-muted-foreground">{q.query}</code>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground italic">Leftmost prefix rule: index helps queries using leading columns.</p>
      </div>
    ),
  },
} as const;

type IndexTypeKey = keyof typeof INDEX_TYPES;

const colorMap: Record<string, { border: string; bg: string; text: string; ring: string }> = {
  emerald: { border: "border-emerald-500/30", bg: "bg-emerald-500/5", text: "text-emerald-400", ring: "ring-emerald-500/30" },
  amber: { border: "border-amber-500/30", bg: "bg-amber-500/5", text: "text-amber-400", ring: "ring-amber-500/30" },
  violet: { border: "border-violet-500/30", bg: "bg-violet-500/5", text: "text-violet-400", ring: "ring-violet-500/30" },
  blue: { border: "border-blue-500/30", bg: "bg-blue-500/5", text: "text-blue-400", ring: "ring-blue-500/30" },
};

function IndexTypesExplorer() {
  const [selected, setSelected] = useState<IndexTypeKey>("btree");
  const idx = INDEX_TYPES[selected];
  const c = colorMap[idx.color];

  return (
    <Playground
      title="Index Types Explorer"
      controls={false}
      canvasHeight="min-h-[380px]"
      hints={["Click each index type card to compare lookup speed, insert cost, and range query support."]}
      canvas={
        <div className="p-4 space-y-4">
          {/* Type cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {(Object.entries(INDEX_TYPES) as [IndexTypeKey, typeof INDEX_TYPES[IndexTypeKey]][]).map(([key, t]) => {
              const tc = colorMap[t.color];
              const isActive = selected === key;
              return (
                <button
                  key={key}
                  onClick={() => setSelected(key)}
                  className={cn(
                    "rounded-lg border p-3 text-left transition-all hover:scale-[1.02]",
                    isActive ? `${tc.border} ${tc.bg} ring-2 ${tc.ring}` : "border-border/40 bg-muted/10 hover:bg-muted/20"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base">{t.icon}</span>
                    <span className={cn("text-xs font-semibold", isActive ? tc.text : "text-foreground")}>{t.name}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{t.bestFor}</p>
                </button>
              );
            })}
          </div>

          {/* Detail panel */}
          <div className={cn("rounded-lg border p-4 space-y-3 transition-all", c.border, c.bg)}>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Lookup", value: idx.lookup },
                { label: "Insert", value: idx.insert },
                { label: "Range Query", value: idx.range },
              ].map((m) => (
                <div key={m.label} className="rounded-md bg-muted/30 p-2 text-center">
                  <p className="text-[9px] text-muted-foreground">{m.label}</p>
                  <p className={cn("text-xs font-mono font-bold", c.text)}>{m.value}</p>
                </div>
              ))}
            </div>
            {idx.visual}
          </div>
        </div>
      }
    />
  );
}

/* ------------------------------------------------------------------ */
/*  4. Write Penalty Demo                                             */
/* ------------------------------------------------------------------ */

function WritePenaltyDemo() {
  const [indexCount, setIndexCount] = useState(0);

  const writeData = useMemo(() => {
    return [0, 1, 3, 5, 8].map((n) => ({
      indexes: `${n} idx`,
      insertTime: Math.round(0.5 + n * 1.8 + n * n * 0.3),
      updateTime: Math.round(0.8 + n * 2.2 + n * n * 0.35),
    }));
  }, []);

  const scalingData = useMemo(() => {
    const points = [];
    for (let n = 0; n <= 10; n++) {
      points.push({
        indexes: `${n}`,
        writeSpeed: Math.round(100 / (1 + n * 0.4 + n * n * 0.05)),
        readSpeed: Math.min(100, Math.round(20 + n * 15)),
      });
    }
    return points;
  }, []);

  const insertPenalty = Math.round(0.5 + indexCount * 1.8 + indexCount * indexCount * 0.3);
  const storageOverhead = Math.round(indexCount * 180);

  return (
    <Playground
      title="Write Penalty: The Cost of Indexes"
      controls={false}
      canvasHeight="min-h-[440px]"
      hints={["Drag the slider to add indexes and watch how insert time and storage overhead increase."]}
      canvas={
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <PenLine className="size-4 text-amber-400" />
            <span>Each index is a separate B-tree that must be updated on every write</span>
          </div>

          {/* Interactive index count */}
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <label className="text-xs text-muted-foreground whitespace-nowrap">Number of indexes:</label>
              <input
                type="range"
                min={0}
                max={10}
                step={1}
                value={indexCount}
                onChange={(e) => setIndexCount(Number(e.target.value))}
                className="flex-1 h-1.5 rounded-full accent-amber-500 cursor-pointer"
              />
              <span className="text-sm font-mono font-bold text-amber-400 w-8 text-right">{indexCount}</span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-center">
                <p className="text-[10px] text-muted-foreground">Insert Time</p>
                <p className="text-xl font-mono font-bold text-amber-400">{insertPenalty} <span className="text-xs">ms</span></p>
              </div>
              <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-center">
                <p className="text-[10px] text-muted-foreground">B-trees to update</p>
                <p className="text-xl font-mono font-bold text-amber-400">{indexCount + 1}</p>
                <p className="text-[9px] text-muted-foreground">table + {indexCount} indexes</p>
              </div>
              <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-center">
                <p className="text-[10px] text-muted-foreground">Storage Overhead</p>
                <p className="text-xl font-mono font-bold text-red-400">+{storageOverhead} <span className="text-xs">MB</span></p>
              </div>
            </div>
          </div>

          {/* Charts side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] text-muted-foreground mb-1 text-center">Write time by index count</p>
              <LiveChart
                type="bar"
                data={writeData}
                dataKeys={{ x: "indexes", y: ["insertTime", "updateTime"], label: ["INSERT", "UPDATE"] }}
                height={160}
                unit="ms"
              />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground mb-1 text-center">Read vs Write throughput</p>
              <LiveChart
                type="line"
                data={scalingData}
                dataKeys={{ x: "indexes", y: ["readSpeed", "writeSpeed"], label: ["Read Speed %", "Write Speed %"] }}
                height={160}
                unit="%"
                referenceLines={[{ y: 50, label: "sweet spot", color: "hsl(45,70%,50%)" }]}
              />
            </div>
          </div>
        </div>
      }
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */

export default function DatabaseIndexingPage() {
  return (
    <div className="space-y-8">
      <TopicHero
        title="Database Indexing"
        subtitle="Your query is scanning every single row. Here's why indexes are the difference between 2ms and 30 seconds — and why adding too many can backfire."
        difficulty="intermediate"
      />

      <WhyCare>
        Without <GlossaryTerm term="index">indexes</GlossaryTerm>, finding a user in a million-row table means scanning every single row. With the right index, it takes microseconds.
      </WhyCare>

      <BTreePlayground />

      <AhaMoment
        question="Why do databases use B+trees instead of hash tables if hash tables are O(1)?"
        answer={
          <p>
            Hash tables give O(1) for exact equality lookups, but databases rarely need <em>only</em> that.
            Most real queries involve range scans (<code className="font-mono text-xs bg-muted px-1 rounded">WHERE price &gt; 50</code>),
            sorting (<code className="font-mono text-xs bg-muted px-1 rounded">ORDER BY created_at</code>),
            or prefix matching. B+trees handle all of these because data is stored in sorted order
            with linked leaves for sequential access.
          </p>
        }
      />

      <QueryPerformancePlayground />

      <IndexTypesExplorer />

      <WritePenaltyDemo />

      <AhaMoment
        question="If indexes are so great, why not index every column?"
        answer={
          <p>
            Because each <GlossaryTerm term="index">index</GlossaryTerm> is a separate B+tree that must be maintained. A table with
            20 columns and an index on each would require 20 separate trees to be updated on
            every write. For write-heavy workloads (logging, analytics ingestion, IoT telemetry),
            this can make inserts 10-20x slower. The art of indexing is choosing the <em>right</em> columns:
            the ones that appear in your most frequent queries and have
            high <strong>cardinality</strong> (many distinct values).
          </p>
        }
      />

      <TopicQuiz
        questions={[
          {
            question: "You have a composite index on (country, city, zip_code). Which query can use this index?",
            options: [
              "WHERE city = 'Paris'",
              "WHERE zip_code = '75001'",
              "WHERE country = 'France' AND city = 'Paris'",
              "WHERE city = 'Paris' AND zip_code = '75001'",
            ],
            correctIndex: 2,
            explanation: "Composite indexes follow the leftmost prefix rule. The index can help queries on (country), (country, city), or (country, city, zip_code) — but not queries that skip the leading column.",
          },
          {
            question: "A table has 10 million rows. How many comparisons does a B+tree index need for a lookup?",
            options: [
              "10,000,000 (must check every row)",
              "About 1,000 (square root of the table)",
              "About 23 (log base 2 of 10 million)",
              "Exactly 1 (direct hash lookup)",
            ],
            correctIndex: 2,
            explanation: "B+tree lookups are O(log n). log2(10,000,000) is approximately 23, meaning the index narrows down to the target row in about 23 comparisons regardless of table size.",
          },
          {
            question: "Why might adding an index to a write-heavy logging table hurt performance?",
            options: [
              "Indexes make read queries slower",
              "Each index is a separate B+tree that must be updated on every INSERT, slowing writes",
              "Indexes use too much CPU during reads",
              "The database cannot create indexes on tables with more than 1 million rows",
            ],
            correctIndex: 1,
            explanation: "Every index is a separate data structure that must be maintained. On a write-heavy table, each INSERT must update the main table plus every index, significantly increasing write latency and I/O.",
          },
        ]}
      />

      <KeyTakeaway
        points={[
          "Without indexes, databases perform O(n) full table scans. A B+tree index drops lookup time to O(log n) — 23 comparisons for 10 million rows.",
          "B+trees store data in linked leaf nodes, making range queries and sorting efficient. They are the default in PostgreSQL, MySQL, and SQLite.",
          "Hash indexes offer O(1) exact-match lookups but cannot handle ranges or sorting. GIN indexes enable full-text search and JSONB queries.",
          "Composite indexes follow the leftmost prefix rule: (A, B, C) helps queries on A, A+B, A+B+C, but not B alone.",
          "Every index slows down writes and uses disk space. Profile with EXPLAIN ANALYZE and only index columns you actually query.",
        ]}
      />
    </div>
  );
}
