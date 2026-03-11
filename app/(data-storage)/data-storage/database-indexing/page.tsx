"use client";

import { useState, useEffect } from "react";
import { TopicHero } from "@/components/topic-hero";
import { FailureScenario } from "@/components/failure-scenario";
import { WhyItBreaks } from "@/components/why-it-breaks";
import { ConceptVisualizer } from "@/components/concept-visualizer";
import { CorrectApproach } from "@/components/correct-approach";
import { KeyTakeaway } from "@/components/key-takeaway";
import { BeforeAfter } from "@/components/before-after";
import { ScaleSimulator } from "@/components/scale-simulator";
import { ConversationalCallout } from "@/components/conversational-callout";
import { AhaMoment } from "@/components/aha-moment";
import { MetricCounter } from "@/components/metric-counter";
import { InteractiveDemo } from "@/components/interactive-demo";
import { cn } from "@/lib/utils";
import { Search, ArrowDown, Zap, Database } from "lucide-react";

function BTreeLookupViz() {
  const [step, setStep] = useState(0);
  const [targetValue] = useState(42);

  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % 8), 1200);
    return () => clearInterval(t);
  }, []);

  const tree = {
    root: { keys: [30, 60], level: 0 },
    branches: [
      { keys: [10, 20], level: 1, parent: "left" },
      { keys: [35, 42, 50], level: 1, parent: "mid" },
      { keys: [70, 85], level: 1, parent: "right" },
    ],
    leaves: [
      { keys: [35, 37], level: 2, parent: "mid-left", rowPtrs: ["row 891", "row 234"] },
      { keys: [42, 45, 48], level: 2, parent: "mid-mid", rowPtrs: ["row 127", "row 556", "row 903"] },
      { keys: [50, 55], level: 2, parent: "mid-right", rowPtrs: ["row 441", "row 672"] },
    ],
  };

  const getNodeStyle = (level: number, position: string) => {
    if (step === 0) return "bg-muted/20 border-border/50";
    if (level === 0 && step >= 1 && step <= 2) return "bg-blue-500/10 border-blue-500/30 ring-1 ring-blue-500/20";
    if (level === 0 && step > 2) return "bg-emerald-500/10 border-emerald-500/20";
    if (level === 1 && position === "mid" && step >= 3 && step <= 4) return "bg-blue-500/10 border-blue-500/30 ring-1 ring-blue-500/20";
    if (level === 1 && position === "mid" && step > 4) return "bg-emerald-500/10 border-emerald-500/20";
    if (level === 2 && position === "mid-mid" && step >= 5 && step <= 6) return "bg-blue-500/10 border-blue-500/30 ring-1 ring-blue-500/20";
    if (level === 2 && position === "mid-mid" && step >= 7) return "bg-emerald-500/15 border-emerald-500/30 ring-1 ring-emerald-500/30";
    return "bg-muted/20 border-border/30 opacity-40";
  };

  const stepMessages = [
    "Looking for key 42...",
    "Root: 42 > 30 and 42 < 60 → go to middle child",
    "Root: 42 > 30 and 42 < 60 → go to middle child",
    "Branch: 35 < 42 ≤ 42 → found range, go to leaf",
    "Branch: 35 < 42 ≤ 42 → found range, go to leaf",
    "Leaf: scanning... 42 found!",
    "Leaf: key 42 → row pointer → row 127",
    "Found in 3 comparisons (not 10,000,000)",
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-2">
        <Search className="size-3.5 text-blue-400" />
        <span>Searching for key: <span className="font-mono font-bold text-foreground">{targetValue}</span></span>
      </div>

      {/* Root */}
      <div className="flex justify-center">
        <div className={cn(
          "rounded-lg border px-4 py-2 transition-all duration-500",
          getNodeStyle(0, "root")
        )}>
          <p className="text-[9px] text-muted-foreground/60 mb-1">Root</p>
          <div className="flex gap-2">
            {tree.root.keys.map((k) => (
              <span key={k} className={cn(
                "font-mono text-sm font-bold px-2 py-0.5 rounded",
                step >= 1 && k === 30 ? "text-emerald-400" : step >= 1 && k === 60 ? "text-amber-400" : ""
              )}>
                {k}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Arrows */}
      <div className="flex justify-center">
        <ArrowDown className={cn(
          "size-4 transition-all duration-300",
          step >= 2 ? "text-blue-400" : "text-muted-foreground/20"
        )} />
      </div>

      {/* Branches */}
      <div className="flex justify-center gap-3">
        {tree.branches.map((branch) => (
          <div
            key={branch.parent}
            className={cn(
              "rounded-lg border px-3 py-2 transition-all duration-500",
              getNodeStyle(1, branch.parent)
            )}
          >
            <p className="text-[9px] text-muted-foreground/60 mb-1">Branch</p>
            <div className="flex gap-1.5">
              {branch.keys.map((k) => (
                <span key={k} className={cn(
                  "font-mono text-xs font-medium px-1.5 py-0.5 rounded",
                  step >= 3 && branch.parent === "mid" && k === 42 ? "text-blue-400 bg-blue-500/10" : ""
                )}>
                  {k}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Arrows */}
      <div className="flex justify-center">
        <ArrowDown className={cn(
          "size-4 transition-all duration-300",
          step >= 4 ? "text-blue-400" : "text-muted-foreground/20"
        )} />
      </div>

      {/* Leaves */}
      <div className="flex justify-center gap-2">
        {tree.leaves.map((leaf) => (
          <div
            key={leaf.parent}
            className={cn(
              "rounded-lg border px-3 py-2 transition-all duration-500",
              getNodeStyle(2, leaf.parent)
            )}
          >
            <p className="text-[9px] text-muted-foreground/60 mb-1">Leaf</p>
            <div className="flex gap-1.5 mb-1">
              {leaf.keys.map((k) => (
                <span key={k} className={cn(
                  "font-mono text-xs font-medium px-1.5 py-0.5 rounded transition-all",
                  step >= 6 && k === 42 ? "text-emerald-400 bg-emerald-500/15 ring-1 ring-emerald-500/30" : ""
                )}>
                  {k}
                </span>
              ))}
            </div>
            {step >= 6 && leaf.parent === "mid-mid" && (
              <div className="flex gap-1">
                {leaf.rowPtrs.map((ptr, i) => (
                  <span key={ptr} className={cn(
                    "text-[8px] font-mono text-muted-foreground/50",
                    i === 0 ? "text-emerald-400" : ""
                  )}>
                    {ptr}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Linked leaf indicator */}
      <div className="flex justify-center">
        <div className="text-[9px] text-muted-foreground/40 flex items-center gap-1">
          <span>Leaves linked:</span>
          <span className="font-mono">... ← [35,37] ↔ [42,45,48] ↔ [50,55] → ...</span>
        </div>
      </div>

      {/* Status */}
      <div className={cn(
        "text-center text-[11px] font-medium transition-all duration-300",
        step >= 7 ? "text-emerald-400" : "text-muted-foreground"
      )}>
        {stepMessages[step]}
      </div>
    </div>
  );
}

function IndexTypeComparisonViz() {
  const [selectedType, setSelectedType] = useState<"btree" | "bplus" | "hash" | "gin">("bplus");

  const types = {
    btree: {
      name: "B-Tree",
      color: "text-blue-400",
      border: "border-blue-500/30",
      bg: "bg-blue-500/5",
      lookup: "O(log n)",
      insert: "O(log n)",
      range: "Inefficient (tree traversal)",
      space: "Moderate",
      structure: "Data stored in both internal and leaf nodes",
      bestFor: "Exact-match lookups where range queries are rare",
      usedBy: "Older database systems, some in-memory structures",
      note: "Searches may stop at internal nodes (potentially faster for exact matches), but range queries require repeated tree traversals.",
    },
    bplus: {
      name: "B+Tree",
      color: "text-emerald-400",
      border: "border-emerald-500/30",
      bg: "bg-emerald-500/5",
      lookup: "O(log n)",
      insert: "O(log n)",
      range: "O(log n + k) — follow leaf pointers",
      space: "Slightly more (duplicated keys)",
      structure: "Data only in leaf nodes, internal nodes are routing keys. Leaves are linked.",
      bestFor: "Range queries, sorting, equality — the general-purpose workhorse",
      usedBy: "PostgreSQL, MySQL InnoDB, SQLite, SQL Server, Oracle",
      note: "All searches go to leaves, making performance predictable. Linked leaves enable efficient sequential scans and ORDER BY.",
    },
    hash: {
      name: "Hash Index",
      color: "text-amber-400",
      border: "border-amber-500/30",
      bg: "bg-amber-500/5",
      lookup: "O(1) average",
      insert: "O(1) average",
      range: "Not supported",
      space: "Low",
      structure: "Hash function maps key directly to a bucket containing the row pointer",
      bestFor: "Exact equality lookups only (WHERE id = 42)",
      usedBy: "PostgreSQL (CREATE INDEX ... USING hash), Redis, in-memory caches",
      note: "Fastest for equality, but cannot do range scans, ORDER BY, or partial matches. Not crash-safe in some older PostgreSQL versions.",
    },
    gin: {
      name: "GIN (Inverted)",
      color: "text-violet-400",
      border: "border-violet-500/30",
      bg: "bg-violet-500/5",
      lookup: "O(log n) per element",
      insert: "O(log n) — batch-optimized",
      range: "Supports containment queries",
      space: "High (one entry per element)",
      structure: "Maps each value inside an array/JSON/text to the rows containing it",
      bestFor: "Full-text search, JSONB queries, array containment",
      usedBy: "PostgreSQL (JSONB @>, full-text search, array ops)",
      note: "Essential for JSONB indexing in PostgreSQL. Slow to build but fast to query. Use GiST for geometric/range types.",
    },
  };

  const idx = types[selectedType];

  return (
    <div className="space-y-3">
      <div className="flex gap-2 justify-center flex-wrap">
        {(Object.keys(types) as Array<keyof typeof types>).map((key) => (
          <button
            key={key}
            onClick={() => setSelectedType(key)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
              selectedType === key
                ? `${types[key].bg} ${types[key].border} ${types[key].color}`
                : "bg-muted/20 border-border/50 text-muted-foreground hover:text-foreground"
            )}
          >
            {types[key].name}
          </button>
        ))}
      </div>

      <div className={cn("rounded-lg border p-4 space-y-3 transition-all", idx.border, idx.bg)}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { label: "Lookup", value: idx.lookup },
            { label: "Insert", value: idx.insert },
            { label: "Range Query", value: idx.range },
            { label: "Space", value: idx.space },
          ].map((m) => (
            <div key={m.label} className="rounded-md bg-muted/30 p-2 text-center">
              <p className="text-[9px] text-muted-foreground">{m.label}</p>
              <p className="text-[11px] font-mono font-semibold">{m.value}</p>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground"><span className="font-medium text-foreground">Structure:</span> {idx.structure}</p>
        <p className="text-[11px] text-muted-foreground"><span className="font-medium text-foreground">Best for:</span> {idx.bestFor}</p>
        <p className="text-[11px] text-muted-foreground"><span className="font-medium text-foreground">Used by:</span> {idx.usedBy}</p>
        <p className="text-[10px] text-muted-foreground/70 italic">{idx.note}</p>
      </div>
    </div>
  );
}

function ExplainOutputViz() {
  const [indexed, setIndexed] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex gap-2 justify-center">
        <button
          onClick={() => setIndexed(false)}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
            !indexed
              ? "bg-red-500/10 border-red-500/30 text-red-400"
              : "bg-muted/20 border-border/50 text-muted-foreground hover:text-foreground"
          )}
        >
          Without Index
        </button>
        <button
          onClick={() => setIndexed(true)}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
            indexed
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-muted/20 border-border/50 text-muted-foreground hover:text-foreground"
          )}
        >
          With Index
        </button>
      </div>

      <div className="rounded-lg border bg-muted/20 p-4">
        <p className="text-[10px] font-mono text-muted-foreground/60 mb-2">
          {`EXPLAIN ANALYZE SELECT * FROM products WHERE category = 'electronics';`}
        </p>
        {!indexed ? (
          <div className="space-y-1 font-mono text-[11px]">
            <p className="text-red-400">Seq Scan on products</p>
            <p className="text-muted-foreground pl-4">Filter: (category = &apos;electronics&apos;)</p>
            <p className="text-muted-foreground pl-4">Rows Removed by Filter: <span className="text-red-400">9,999,757</span></p>
            <p className="text-muted-foreground pl-4">Rows Returned: 243</p>
            <p className="text-muted-foreground pl-4">Buffers: shared hit=12 read=<span className="text-red-400">98,432</span></p>
            <p className="text-red-400 pl-4">Planning Time: 0.08ms</p>
            <p className="text-red-400 pl-4 font-bold">Execution Time: 30,420.15ms</p>
            <div className="mt-2 rounded-md bg-red-500/10 border border-red-500/20 p-2">
              <p className="text-[10px] text-red-400">
                Read 10M rows from disk to return 243 matches. 98,432 page reads.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-1 font-mono text-[11px]">
            <p className="text-emerald-400">Index Scan using idx_products_category on products</p>
            <p className="text-muted-foreground pl-4">Index Cond: (category = &apos;electronics&apos;)</p>
            <p className="text-muted-foreground pl-4">Rows Returned: 243</p>
            <p className="text-muted-foreground pl-4">Buffers: shared hit=<span className="text-emerald-400">247</span></p>
            <p className="text-emerald-400 pl-4">Planning Time: 0.12ms</p>
            <p className="text-emerald-400 pl-4 font-bold">Execution Time: 1.87ms</p>
            <div className="mt-2 rounded-md bg-emerald-500/10 border border-emerald-500/20 p-2">
              <p className="text-[10px] text-emerald-400">
                Jumped directly to 243 matching rows. Only 247 page reads. 16,000x faster.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FullScanVsIndexViz() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % 12), 400);
    return () => clearInterval(t);
  }, []);

  const rows = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    category: i === 4 || i === 11 || i === 17 ? "electronics" : "other",
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="rounded-lg border bg-muted/20 p-3 space-y-2">
        <p className="text-[10px] font-medium text-red-400">Full Table Scan (Sequential)</p>
        <div className="grid grid-cols-10 gap-1">
          {rows.map((row, i) => (
            <div
              key={`scan-${row.id}`}
              className={cn(
                "size-6 rounded text-[8px] font-mono flex items-center justify-center border transition-all duration-200",
                step > i && row.category === "electronics"
                  ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
                  : step > i
                  ? "bg-red-500/5 border-red-500/10 text-muted-foreground/30"
                  : step === i
                  ? "bg-amber-500/20 border-amber-500/30 text-amber-400 ring-1 ring-amber-500/20"
                  : "bg-muted/10 border-border/30 text-muted-foreground/30"
              )}
            >
              {row.id}
            </div>
          ))}
        </div>
        <p className="text-[9px] text-muted-foreground">
          Checked: <span className="font-mono text-foreground">{Math.min(step, 20)}/20</span> rows
          {step >= 20 && <span className="text-red-400"> &mdash; scanned every row</span>}
        </p>
      </div>

      <div className="rounded-lg border bg-muted/20 p-3 space-y-2">
        <p className="text-[10px] font-medium text-emerald-400">Index Lookup (B+Tree)</p>
        <div className="grid grid-cols-10 gap-1">
          {rows.map((row) => (
            <div
              key={`idx-${row.id}`}
              className={cn(
                "size-6 rounded text-[8px] font-mono flex items-center justify-center border transition-all duration-200",
                step >= 2 && row.category === "electronics"
                  ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400 ring-1 ring-emerald-500/20"
                  : "bg-muted/10 border-border/30 text-muted-foreground/30"
              )}
            >
              {row.id}
            </div>
          ))}
        </div>
        <p className="text-[9px] text-muted-foreground">
          Checked: <span className="font-mono text-foreground">{step >= 2 ? "3" : step >= 1 ? "..." : "0"}/20</span> rows
          {step >= 2 && <span className="text-emerald-400"> &mdash; jumped directly to matches</span>}
        </p>
      </div>
    </div>
  );
}

export default function DatabaseIndexingPage() {
  return (
    <div className="space-y-8">
      <TopicHero
        title="Database Indexing"
        subtitle="Your query is scanning every single row. Here's why indexes are the difference between 2ms and 30 seconds — and why adding too many can backfire."
        difficulty="intermediate"
      />

      <FailureScenario title="30 seconds to search 10 million rows">
        <p className="text-sm text-muted-foreground">
          Your e-commerce app has 10 million products. A user searches for products by category.
          The query takes <strong className="text-foreground">30 seconds</strong> to return results.
          Users stare at a loading spinner, get frustrated, and leave. Your conversion rate drops
          by 40%. The database CPU is pinned at 100% because every single search triggers a
          full table scan across all 10 million rows.
        </p>
        <p className="text-sm text-muted-foreground">
          You throw more hardware at it. Response time drops to 15 seconds. Still unacceptable.
          The real fix is not more compute &mdash; it is a single SQL statement:
          <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded ml-1">CREATE INDEX idx_category ON products(category);</code>
        </p>
        <div className="grid grid-cols-3 gap-3 pt-2">
          <MetricCounter label="Without Index" value={30420} unit="ms" trend="up" />
          <MetricCounter label="With B+Tree Index" value={2} unit="ms" trend="down" />
          <MetricCounter label="Speedup" value={15210} unit="x" trend="down" />
        </div>
      </FailureScenario>

      <WhyItBreaks title="Sequential scan: the database reads every single row">
        <p className="text-sm text-muted-foreground">
          Without an index, the database performs a <strong className="text-foreground">full table scan</strong> (called
          &quot;Seq Scan&quot; in PostgreSQL). It reads every single row from disk, checks if it matches
          your WHERE clause, and discards the rows that do not match. For 10 million rows, that means
          reading 10 million rows to find maybe 243 results. The time complexity
          is <strong className="text-foreground">O(n)</strong>.
        </p>
        <p className="text-sm text-muted-foreground">
          With a B+tree index (the default in PostgreSQL, MySQL, and virtually every relational database),
          the database narrows down the search using a balanced tree. Instead of checking all rows,
          it traverses a tree that is typically only 3-4 levels deep. For 10 million rows,
          that is roughly <strong className="text-foreground">23 comparisons instead of 10 million</strong>.
          The time complexity drops to <strong className="text-foreground">O(log n)</strong>.
        </p>
      </WhyItBreaks>

      <ConceptVisualizer title="Watch a B+Tree Lookup in Action">
        <p className="text-sm text-muted-foreground mb-4">
          This B+tree is searching for key 42. Watch how it starts at the root, compares values to
          decide which child to follow, and arrives at the leaf node in just 3 steps. In a real
          database with 10 million rows, the tree would be 3-4 levels deep &mdash; the same
          number of disk reads regardless of table size.
        </p>
        <BTreeLookupViz />
        <ConversationalCallout type="tip">
          B+trees store data only in leaf nodes, and those leaves are linked together like a chain.
          This is why range queries (<code className="text-xs bg-muted px-1 rounded font-mono">WHERE price BETWEEN 10 AND 50</code>)
          are efficient &mdash; the database finds the start of the range, then walks the linked list
          without touching the tree again.
        </ConversationalCallout>
      </ConceptVisualizer>

      <ConceptVisualizer title="Full Scan vs Index Lookup — Animated">
        <p className="text-sm text-muted-foreground mb-4">
          Watch the difference in real time. The full scan checks every row one by one. The index
          lookup jumps directly to the matching rows almost instantly.
        </p>
        <FullScanVsIndexViz />
      </ConceptVisualizer>

      <ConceptVisualizer title="Index Types Compared">
        <p className="text-sm text-muted-foreground mb-4">
          Not all indexes are created equal. Click each type to see its complexity, structure,
          and ideal use cases. B+Tree is the default for a reason, but specialized indexes exist
          for specialized workloads.
        </p>
        <IndexTypeComparisonViz />
      </ConceptVisualizer>

      <ConceptVisualizer title="Reading EXPLAIN ANALYZE Output">
        <p className="text-sm text-muted-foreground mb-4">
          The <code className="text-xs bg-muted px-1 rounded font-mono">EXPLAIN ANALYZE</code> command
          shows you exactly what the database does with your query. Toggle between indexed and
          non-indexed to see the dramatic difference in execution plan, buffer reads, and runtime.
        </p>
        <ExplainOutputViz />
      </ConceptVisualizer>

      <BeforeAfter
        before={{
          title: "Without Index (Full Table Scan)",
          content: (
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="font-mono text-xs">
                {`SELECT * FROM products`}<br />
                {`  WHERE category = 'electronics';`}<br /><br />
                {`Seq Scan on products`}<br />
                {`  Rows examined: 10,000,000`}<br />
                {`  Rows returned: 243`}<br />
                {`  Time: 30,420ms`}
              </p>
              <p>Database reads every row sequentially. CPU and I/O spike on every query.</p>
            </div>
          ),
        }}
        after={{
          title: "With B+Tree Index",
          content: (
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="font-mono text-xs">
                {`CREATE INDEX idx_category`}<br />
                {`  ON products(category);`}<br /><br />
                {`Index Scan using idx_category`}<br />
                {`  Rows examined: 243`}<br />
                {`  Rows returned: 243`}<br />
                {`  Time: 1.87ms`}
              </p>
              <p>Database jumps directly to matching rows. 16,000x faster for the same query.</p>
            </div>
          ),
        }}
      />

      <ScaleSimulator
        title="Query Time vs Row Count"
        min={10000}
        max={10000000}
        step={10000}
        unit="rows"
        metrics={(rows) => [
          {
            label: "Full Table Scan",
            value: Math.round(rows * 0.003),
            unit: "ms",
          },
          {
            label: "B+Tree Index",
            value: Math.round(Math.log2(rows) * 0.15),
            unit: "ms",
          },
          {
            label: "Speedup",
            value: Math.round((rows * 0.003) / (Math.log2(rows) * 0.15)),
            unit: "x",
          },
        ]}
      >
        {({ value }) => (
          <div className="grid grid-cols-2 gap-4 pt-2">
            <MetricCounter
              label="Full Scan Comparisons"
              value={value}
              trend="up"
            />
            <MetricCounter
              label="Index Comparisons"
              value={Math.round(Math.log2(value))}
              trend="down"
            />
          </div>
        )}
      </ScaleSimulator>

      <ConversationalCallout type="warning">
        Indexes are not free. Every index consumes disk space (a B+tree index on 10M rows is
        typically 200-400MB) and slows down writes because the database must update the index
        on every INSERT, UPDATE, and DELETE. A table with 10 indexes means 10 extra B+tree
        modifications per row change. Only index columns you actually query on.
      </ConversationalCallout>

      <CorrectApproach title="Indexing Strategy">
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>
            <strong className="text-foreground">1. Index columns in WHERE clauses.</strong> If you frequently
            filter by <code className="font-mono bg-muted px-1 rounded text-xs">status</code> or <code className="font-mono bg-muted px-1 rounded text-xs">created_at</code>, index them.
          </p>
          <p>
            <strong className="text-foreground">2. Understand the leftmost prefix rule.</strong> A composite
            index on <code className="font-mono bg-muted px-1 rounded text-xs">(category, price, created_at)</code> helps
            queries filtering by <code className="font-mono bg-muted px-1 rounded text-xs">category</code>,
            by <code className="font-mono bg-muted px-1 rounded text-xs">category + price</code>, and
            by all three &mdash; but NOT queries filtering only
            by <code className="font-mono bg-muted px-1 rounded text-xs">price</code> alone.
          </p>
          <p>
            <strong className="text-foreground">3. Use covering indexes.</strong> If your index includes all
            columns the query needs, the database reads everything from the index and never touches
            the table heap at all. In PostgreSQL:
            <code className="font-mono bg-muted px-1 rounded text-xs ml-1">CREATE INDEX ... INCLUDE (col1, col2)</code>.
          </p>
          <p>
            <strong className="text-foreground">4. Always check with EXPLAIN ANALYZE.</strong> The query
            optimizer may choose a full scan if it estimates most rows match (low selectivity). An index
            on a boolean column with 50/50 distribution will not help.
          </p>
          <p>
            <strong className="text-foreground">5. Consider partial indexes.</strong> Index only the rows
            that matter:
            <code className="font-mono bg-muted px-1 rounded text-xs ml-1">{`CREATE INDEX idx_active ON orders(created_at) WHERE status = 'active'`}</code>.
            Smaller index, faster lookups, less write overhead.
          </p>
        </div>
      </CorrectApproach>

      <AhaMoment
        question="If indexes are so great, why not index every column?"
        answer={
          <p>
            Because each index is a separate B+tree that must be maintained. A table with
            20 columns and an index on each would require 20 separate trees to be updated on
            every write. For write-heavy workloads (logging, analytics ingestion, IoT telemetry),
            this can make inserts 10-20x slower. The art of indexing is choosing the <em>right</em> columns:
            the ones that appear in your most frequent and critical queries, and that have
            high <strong>cardinality</strong> (many distinct values). An index on a boolean column
            is rarely useful.
          </p>
        }
      />

      <AhaMoment
        question="Why do databases use B+trees instead of hash tables if hash tables are O(1)?"
        answer={
          <p>
            Hash tables give O(1) for exact equality lookups, but databases rarely need <em>only</em> that.
            Most real queries involve range scans (<code className="font-mono text-xs bg-muted px-1 rounded">WHERE price &gt; 50</code>),
            sorting (<code className="font-mono text-xs bg-muted px-1 rounded">ORDER BY created_at</code>),
            or prefix matching (<code className="font-mono text-xs bg-muted px-1 rounded">WHERE name LIKE &apos;Alice%&apos;</code>).
            Hash indexes cannot do any of these. B+trees handle all of them efficiently because
            data is stored in sorted order with linked leaves for sequential access. That
            versatility is why B+tree is the default.
          </p>
        }
      />

      <KeyTakeaway
        points={[
          "Without indexes, databases perform O(n) full table scans. A B+tree index drops lookup time to O(log n) — 23 comparisons for 10 million rows.",
          "B+trees are the default in PostgreSQL, MySQL, SQLite, and Oracle. They store data only in linked leaf nodes, making range queries and sorting efficient.",
          "Hash indexes offer O(1) exact-match lookups but cannot handle range queries, sorting, or prefix matching — use them only for pure equality access patterns.",
          "GIN (inverted) indexes are essential for full-text search, JSONB queries, and array operations in PostgreSQL.",
          "Composite indexes follow the leftmost prefix rule: an index on (A, B, C) helps queries on A, A+B, and A+B+C, but not B alone.",
          "Always verify with EXPLAIN ANALYZE — the optimizer may ignore your index if selectivity is too low.",
        ]}
      />
    </div>
  );
}
