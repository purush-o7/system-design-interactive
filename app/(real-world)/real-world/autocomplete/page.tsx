"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { TopicHero } from "@/components/topic-hero";
import { KeyTakeaway } from "@/components/key-takeaway";
import { WhyCare } from "@/components/why-care";
import { GlossaryTerm } from "@/components/glossary-term";
import { TopicQuiz } from "@/components/topic-quiz";
import { AhaMoment } from "@/components/aha-moment";
import { ConversationalCallout } from "@/components/conversational-callout";
import { BeforeAfter } from "@/components/before-after";
import { FlowDiagram, type FlowNode, type FlowEdge } from "@/components/flow-diagram";
import { LiveChart } from "@/components/live-chart";
import { Playground } from "@/components/playground";
import { useSimulation } from "@/hooks/use-simulation";
import { cn } from "@/lib/utils";
import { Search, TrendingUp, Zap } from "lucide-react";

// ─── Trie data structures ────────────────────────────────────────────────────

interface TrieNode {
  children: Record<string, TrieNode>;
  isEnd: boolean;
  freq: number;
  word: string;
}

function mkNode(): TrieNode {
  return { children: {}, isEnd: false, freq: 0, word: "" };
}

function insert(root: TrieNode, word: string, freq: number) {
  let n = root;
  for (const c of word) {
    if (!n.children[c]) n.children[c] = mkNode();
    n = n.children[c];
  }
  n.isEnd = true;
  n.freq = freq;
  n.word = word;
}

function collect(node: TrieNode): { word: string; freq: number }[] {
  const r: { word: string; freq: number }[] = [];
  (function dfs(n: TrieNode) {
    if (n.isEnd) r.push({ word: n.word, freq: n.freq });
    for (const c of Object.keys(n.children).sort()) dfs(n.children[c]);
  })(node);
  return r.sort((a, b) => b.freq - a.freq);
}

function trieSearch(root: TrieNode, prefix: string): { word: string; freq: number }[] {
  let n = root;
  for (const c of prefix) {
    if (!n.children[c]) return [];
    n = n.children[c];
  }
  return collect(n).slice(0, 5);
}

const WORDS: [string, number][] = [
  ["system design", 50000], ["systems", 30000], ["system architecture", 22000],
  ["syslog", 5000], ["syntax", 8000], ["synchronous", 4000], ["scaling", 35000],
  ["scalability", 28000], ["schema design", 12000], ["sharding", 25000],
  ["load balancer", 40000], ["latency", 32000], ["caching", 45000],
  ["cap theorem", 20000], ["consistent hashing", 18000], ["database replication", 15000],
  ["distributed systems", 38000], ["dns", 10000], ["microservices", 33000],
  ["message queue", 27000], ["rate limiting", 21000], ["api gateway", 19000],
];

function buildFullTrie() {
  const r = mkNode();
  for (const [w, f] of WORDS) insert(r, w, f);
  return r;
}

// ─── Latency chart data ──────────────────────────────────────────────────────

const latencyData = [
  { prefix: "1 char", trie: 2, db: 320 },
  { prefix: "2 chars", trie: 4, db: 290 },
  { prefix: "3 chars", trie: 5, db: 260 },
  { prefix: "4 chars", trie: 7, db: 240 },
  { prefix: "5 chars", trie: 8, db: 220 },
  { prefix: "6 chars", trie: 10, db: 200 },
  { prefix: "7 chars", trie: 12, db: 185 },
];

// ─── Live Trie Visualizer ────────────────────────────────────────────────────

const BUILD_WORDS: [string, number][] = [["system", 50000], ["systems", 30000], ["syslog", 5000], ["syntax", 8000]];

function LiveTrieViz() {
  const sim = useSimulation({ intervalMs: 900, maxSteps: BUILD_WORDS.length - 1 });
  const [searchMode, setSearchMode] = useState(false);
  const [searchPrefix, setSearchPrefix] = useState("sys");
  const [results, setResults] = useState<{ word: string; freq: number }[]>([]);
  const [hlPaths, setHlPaths] = useState<Set<string>>(new Set());

  const insertIdx = sim.step;

  const nodes = useMemo(() => {
    const root = mkNode();
    for (let w = 0; w <= insertIdx && w < BUILD_WORDS.length; w++) {
      insert(root, BUILD_WORDS[w][0], BUILD_WORDS[w][1]);
    }
    const flat: { path: string; char: string; depth: number; isEnd: boolean; freq: number; word: string }[] = [];
    (function go(n: TrieNode, path: string, d: number) {
      for (const c of Object.keys(n.children).sort()) {
        const cp = path + c;
        const ch = n.children[c];
        flat.push({ path: cp, char: c, depth: d, isEnd: ch.isEnd, freq: ch.freq, word: ch.word });
        go(ch, cp, d + 1);
      }
    })(root, "", 1);
    return flat;
  }, [insertIdx]);

  useEffect(() => {
    if (!searchMode || !searchPrefix) {
      setHlPaths(new Set());
      setResults([]);
      return;
    }
    const paths = new Set<string>();
    let acc = "";
    for (const c of searchPrefix) { acc += c; paths.add(acc); }
    setHlPaths(paths);
    const root = mkNode();
    for (const [w, f] of BUILD_WORDS) insert(root, w, f);
    setResults(trieSearch(root, searchPrefix));
  }, [searchPrefix, searchMode]);

  const canvas = (
    <div className="p-4 space-y-4 h-full overflow-auto">
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => { setSearchMode(false); sim.reset(); }}
          className={cn("text-xs px-3 py-1.5 rounded-md border transition-all", !searchMode ? "bg-blue-500/10 border-blue-500/30 text-blue-400" : "bg-muted/20 border-border/50 text-muted-foreground/60 hover:text-muted-foreground")}
        >
          Build Trie
        </button>
        <button
          onClick={() => { setSearchMode(true); sim.pause(); }}
          className={cn("text-xs px-3 py-1.5 rounded-md border transition-all", searchMode ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-muted/20 border-border/50 text-muted-foreground/60 hover:text-muted-foreground")}
        >
          Search Prefix
        </button>
        {!searchMode && (
          <span className="text-[10px] text-muted-foreground/50 self-center ml-2">
            inserting: <span className="font-mono text-blue-400">{BUILD_WORDS[Math.min(insertIdx, BUILD_WORDS.length - 1)][0]}</span>
          </span>
        )}
      </div>

      {searchMode && (
        <div className="flex items-center gap-2">
          <Search className="size-4 text-muted-foreground" />
          <input
            type="text"
            value={searchPrefix}
            onChange={(e) => setSearchPrefix(e.target.value.toLowerCase())}
            placeholder="Type a prefix..."
            className="bg-muted/30 border border-border/50 rounded-md px-3 py-1.5 text-sm font-mono w-44 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
          />
        </div>
      )}

      <div className="rounded-lg border border-border/50 bg-muted/10 p-3 overflow-x-auto">
        <div className="flex items-center gap-1.5 mb-2">
          <div className="size-6 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-[10px] font-mono text-violet-400">*</div>
          <span className="text-[10px] text-muted-foreground/50">root</span>
        </div>
        <div className="space-y-0.5 pl-2">
          {nodes.map((nd) => (
            <div key={nd.path} className="flex items-center gap-1.5 transition-all duration-300" style={{ paddingLeft: `${(nd.depth - 1) * 18}px` }}>
              <div className="w-3 h-px bg-border/40" />
              <div className={cn("size-7 rounded-md border flex items-center justify-center text-xs font-mono font-bold transition-all duration-300",
                hlPaths.has(nd.path) ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400 ring-1 ring-emerald-500/20 scale-110"
                  : nd.isEnd ? "bg-amber-500/15 border-amber-500/30 text-amber-400" : "bg-muted/30 border-border/50 text-muted-foreground")}>
                {nd.char}
              </div>
              {nd.isEnd && <span className="text-[10px] font-mono text-amber-400/70 ml-1">[{nd.word}] {(nd.freq / 1000).toFixed(0)}K</span>}
            </div>
          ))}
          {nodes.length === 0 && <p className="text-xs text-muted-foreground/40 text-center py-4">Press play to build the trie</p>}
        </div>
      </div>

      {searchMode && results.length > 0 && (
        <div className="space-y-1">
          <p className="text-[11px] text-muted-foreground/60 font-medium">Results for &quot;{searchPrefix}&quot; (by frequency):</p>
          {results.map((r) => (
            <div key={r.word} className="flex items-center justify-between rounded-md bg-emerald-500/8 border border-emerald-500/15 px-3 py-1.5">
              <span className="text-xs font-mono text-emerald-400">{r.word}</span><span className="text-[10px] font-mono text-muted-foreground">{r.freq.toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const explanation = (<>
    <p className="font-medium text-foreground text-xs">How a trie works</p>
    <p>Each node = one character. <span className="text-amber-400">Amber</span> nodes are word endings with frequency counts for ranking.</p>
    <p>Prefix lookup is <span className="font-mono text-violet-400">O(L)</span> — only depends on prefix length, not dictionary size. &quot;sys&quot; traverses 3 nodes exactly.</p>
    <p className="text-[11px] font-mono bg-muted/30 rounded p-2 text-muted-foreground">shared: s→y→s{"\n"}diverges at depth 4:{"\n"}  t→e→m→...{"\n"}  l→o→g</p>
  </>);

  return (
    <Playground
      title="Live Trie Visualization"
      simulation={sim}
      canvas={canvas}
      explanation={explanation}
      canvasHeight="min-h-[440px]"
      hints={["Switch between Build Trie and Search Prefix modes — in search mode, type a prefix to see the trie traversal highlighted"]}
    />
  );
}

// ─── Debounce Playground ─────────────────────────────────────────────────────

function DebouncePlayground() {
  const [mode, setMode] = useState<"none" | "debounced">("none");
  const [keystrokes, setKeystrokes] = useState<{ time: number; char: string }[]>([]);
  const [apiCalls, setApiCalls] = useState<number[]>([]);
  const [running, setRunning] = useState(false);
  const [debounceProgress, setDebounceProgress] = useState(0);
  const word = "system";

  const runSim = useCallback(() => {
    setRunning(true); setKeystrokes([]); setApiCalls([]); setDebounceProgress(0);
    const delays = [0, 120, 80, 150, 100, 90];
    let acc = 0;
    const ks: { time: number; char: string }[] = [];
    const calls: number[] = [];
    delays.forEach((d, i) => { acc += d; ks.push({ time: acc, char: word[i] }); if (mode === "none") calls.push(acc); });
    if (mode === "debounced") calls.push(acc + 300);
    let elapsed = 0;
    const interval = setInterval(() => {
      elapsed += 40;
      const visible = ks.filter((k) => k.time <= elapsed);
      setKeystrokes(visible);
      if (mode === "debounced" && visible.length > 0) setDebounceProgress(Math.min((elapsed - visible[visible.length - 1].time) / 300, 1));
      if (mode === "none") setApiCalls(calls.filter((t) => t <= elapsed));
      if (mode === "debounced" && elapsed >= acc + 300) setApiCalls(calls);
      if (elapsed >= acc + 450) { clearInterval(interval); setRunning(false); }
    }, 40);
  }, [mode]);

  const totalTime = Math.max(...(keystrokes.map((k) => k.time).concat(apiCalls).concat([1]))) + 50;

  return (
    <div className="rounded-xl border border-violet-500/20 bg-violet-500/[0.02] overflow-hidden">
      <div className="flex items-center gap-2 border-b border-violet-500/20 bg-violet-500/[0.04] px-4 py-2">
        <div className="size-2 rounded-full bg-violet-500/50" />
        <span className="text-sm font-medium text-violet-400">Debounce Visualizer</span>
      </div>
      <div className="p-4 space-y-4">
        <div className="flex gap-2 flex-wrap items-center">
          <button
            onClick={() => { setMode("none"); setKeystrokes([]); setApiCalls([]); }}
            className={cn("text-xs px-3 py-1.5 rounded-md border transition-all", mode === "none" ? "bg-red-500/10 border-red-500/30 text-red-400" : "bg-muted/20 border-border/50 text-muted-foreground/60")}
          >
            No Debounce
          </button>
          <button
            onClick={() => { setMode("debounced"); setKeystrokes([]); setApiCalls([]); }}
            className={cn("text-xs px-3 py-1.5 rounded-md border transition-all", mode === "debounced" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-muted/20 border-border/50 text-muted-foreground/60")}
          >
            300ms Debounce
          </button>
          <button
            onClick={runSim}
            disabled={running}
            className="text-xs px-3 py-1.5 rounded-md border bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20 transition-all ml-auto disabled:opacity-50"
          >
            {running ? "Simulating..." : "Simulate Typing"}
          </button>
        </div>

        <div className="rounded-lg border border-border/50 bg-muted/10 p-4 space-y-4">
          <div className="space-y-1.5">
            <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider">Keystrokes — typing &quot;{word}&quot;</p>
            <div className="relative h-9 bg-muted/20 rounded-md">
              {keystrokes.map((ks, i) => (
                <div key={i} className="absolute top-2 flex flex-col items-center" style={{ left: `${(ks.time / totalTime) * 92 + 4}%` }}>
                  <div className="size-5 rounded-sm bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-[10px] font-mono text-blue-400">
                    {ks.char}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {mode === "debounced" && keystrokes.length > 0 && (
            <div className="space-y-1">
              <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider">Debounce Timer</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-muted/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-75"
                    style={{ width: `${debounceProgress * 100}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono text-amber-400 w-14 text-right">
                  {Math.round(debounceProgress * 300)}ms / 300ms
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground/50">Timer resets on each keystroke. API fires only when it fills.</p>
            </div>
          )}

          <div className="space-y-1.5">
            <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider">API Calls Fired</p>
            <div className="relative h-9 bg-muted/20 rounded-md">
              {apiCalls.map((time, i) => (
                <div
                  key={i}
                  className={cn("absolute top-2 size-5 rounded-sm border flex items-center justify-center text-[10px] font-mono transition-all duration-200", mode === "none" ? "bg-red-500/20 border-red-500/30 text-red-400" : "bg-emerald-500/20 border-emerald-500/30 text-emerald-400")}
                  style={{ left: `${(time / totalTime) * 92 + 4}%` }}
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Keystrokes: <span className="font-mono font-bold">{keystrokes.length}</span></span>
          <span className={cn("font-mono font-bold", mode === "none" ? "text-red-400" : "text-emerald-400")}>
            API calls: {apiCalls.length}
          </span>
          {mode === "debounced" && apiCalls.length > 0 && keystrokes.length > 0 && (
            <span className="text-emerald-400 text-[11px]">
              {Math.round((1 - apiCalls.length / keystrokes.length) * 100)}% fewer requests
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Ranking Demo ─────────────────────────────────────────────────────────────

const RANKING_EXAMPLES: Record<string, { word: string; freq: number; rank: number }[]> = {
  "s": [
    { word: "system design", freq: 50000, rank: 1 },
    { word: "scaling", freq: 35000, rank: 2 },
    { word: "sharding", freq: 25000, rank: 3 },
    { word: "schema design", freq: 12000, rank: 4 },
    { word: "syntax", freq: 8000, rank: 5 },
  ],
  "sy": [
    { word: "system design", freq: 50000, rank: 1 },
    { word: "systems", freq: 30000, rank: 2 },
    { word: "system architecture", freq: 22000, rank: 3 },
    { word: "syntax", freq: 8000, rank: 4 },
    { word: "syslog", freq: 5000, rank: 5 },
  ],
  "sys": [
    { word: "system design", freq: 50000, rank: 1 },
    { word: "systems", freq: 30000, rank: 2 },
    { word: "system architecture", freq: 22000, rank: 3 },
    { word: "syslog", freq: 5000, rank: 4 },
  ],
};

function RankingDemo() {
  const [prefix, setPrefix] = useState("s");
  const results = RANKING_EXAMPLES[prefix] ?? [];
  const maxFreq = results[0]?.freq ?? 1;

  return (
    <div className="rounded-xl border border-violet-500/20 bg-violet-500/[0.02] overflow-hidden">
      <div className="flex items-center gap-2 border-b border-violet-500/20 bg-violet-500/[0.04] px-4 py-2">
        <TrendingUp className="size-4 text-violet-400" />
        <span className="text-sm font-medium text-violet-400">Frequency-Based Ranking</span>
      </div>
      <div className="p-4 space-y-4">
        <div className="flex gap-2">
          {Object.keys(RANKING_EXAMPLES).map((p) => (
            <button
              key={p}
              onClick={() => setPrefix(p)}
              className={cn("text-xs px-3 py-1.5 rounded-md border font-mono transition-all", prefix === p ? "bg-violet-500/10 border-violet-500/30 text-violet-400" : "bg-muted/20 border-border/50 text-muted-foreground/60")}
            >
              &quot;{p}&quot;
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {results.map((r) => (
            <div key={r.word} className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-muted-foreground/40 w-4">{r.rank}.</span>
                  <span className="text-xs font-mono">
                    <span className="text-violet-400">{prefix}</span>
                    <span className="text-muted-foreground">{r.word.slice(prefix.length)}</span>
                  </span>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground/60">{(r.freq / 1000).toFixed(0)}K searches</span>
              </div>
              <div className="h-1.5 bg-muted/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-violet-500/50 rounded-full transition-all duration-500"
                  style={{ width: `${(r.freq / maxFreq) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground/60">
          Terminal trie nodes store frequency counts. After collecting all completions under a prefix, sort by frequency descending. Top-K results are cached per prefix to avoid re-sorting.
        </p>
      </div>
    </div>
  );
}

// ─── Architecture Flow Diagram ────────────────────────────────────────────────

function useArchitectureNodes(activeStep: number) {
  return useMemo(() => {
    const s = (n: number) => activeStep === n ? "healthy" as const : "idle" as const;
    const nodes: FlowNode[] = [
      { id: "client", type: "clientNode", position: { x: 20, y: 120 }, data: { label: "Client", sublabel: "Typeahead input", status: s(0), handles: { right: true } } },
      { id: "gateway", type: "gatewayNode", position: { x: 200, y: 120 }, data: { label: "API Gateway", sublabel: "Rate limit + CDN cache", status: s(1), handles: { left: true, right: true } } },
      { id: "service", type: "serverNode", position: { x: 390, y: 120 }, data: { label: "Autocomplete Service", sublabel: "Debounce + query", status: s(2), handles: { left: true, right: true, bottom: true } } },
      { id: "cache", type: "cacheNode", position: { x: 570, y: 40 }, data: { label: "Trie Cache", sublabel: "Redis, top-K per prefix", status: s(3), handles: { left: true } } },
      { id: "db", type: "databaseNode", position: { x: 570, y: 200 }, data: { label: "Frequency DB", sublabel: "Offline trie builder", status: s(4), handles: { left: true } } },
    ];
    const edges: FlowEdge[] = [
      { id: "c-g", source: "client", target: "gateway", label: "prefix query", animated: activeStep >= 1 },
      { id: "g-s", source: "gateway", target: "service", label: "cache miss", animated: activeStep >= 2 },
      { id: "s-ca", source: "service", target: "cache", label: "lookup", animated: activeStep === 3 },
      { id: "s-db", source: "service", target: "db", label: "cold start", animated: activeStep === 4 },
    ];
    return { nodes, edges };
  }, [activeStep]);
}

function ArchitectureFlow() {
  const sim = useSimulation({ intervalMs: 1200, maxSteps: 4 });
  const { nodes, edges } = useArchitectureNodes(sim.step);

  const stepLabels = [
    "User types a character — debounce timer starts (300ms)",
    "After 300ms silence, query reaches API Gateway. Popular prefixes return from CDN cache instantly.",
    "Cache miss routes to Autocomplete Service. It checks Redis for the prefix.",
    "Trie Cache (Redis) returns top-K completions in <5ms. Response flows back.",
    "On cold start or cache expiry, Service queries Frequency DB and warms cache.",
  ];

  return (
    <Playground
      title="Request Flow: Client → API Gateway → Autocomplete Service → Trie Cache + DB"
      simulation={sim}
      hints={["Press play to follow a prefix query through the multi-layer cache architecture"]}
      canvas={
        <FlowDiagram
          nodes={nodes}
          edges={edges}
          minHeight={300}
          allowDrag={false}
        />
      }
      explanation={
        <div className="space-y-3">
          <p className="font-medium text-foreground text-xs">Step {sim.step + 1} of 5</p>
          <p>{stepLabels[sim.step]}</p>
          <div className="space-y-1.5 text-[11px]">
            <div className="flex gap-2"><span className="text-blue-400 font-mono">CDN cache</span><span>1-2 char prefixes, ~100% hit rate</span></div>
            <div className="flex gap-2"><span className="text-amber-400 font-mono">Redis cache</span><span>3-5 char prefixes, ~92% hit rate</span></div>
            <div className="flex gap-2"><span className="text-violet-400 font-mono">Trie lookup</span><span>O(L) traversal, &lt;5ms</span></div>
          </div>
        </div>
      }
      canvasHeight="min-h-[300px]"
    />
  );
}

// ─── Live Typeahead Demo ──────────────────────────────────────────────────────

function TypeaheadDemo() {
  const trieRoot = useRef(buildFullTrie());
  const [input, setInput] = useState("");
  const [results, setResults] = useState<{ word: string; freq: number }[]>([]);
  const [debounceMs, setDebounceMs] = useState(0);
  const [isPending, setIsPending] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleInput = useCallback((value: string) => {
    setInput(value);
    setIsPending(true);
    setDebounceMs(300);

    if (timerRef.current) clearTimeout(timerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);

    countdownRef.current = setInterval(() => {
      setDebounceMs((prev) => Math.max(0, prev - 40));
    }, 40);

    timerRef.current = setTimeout(() => {
      if (countdownRef.current) clearInterval(countdownRef.current);
      setResults(trieSearch(trieRoot.current, value.toLowerCase()));
      setIsPending(false);
      setDebounceMs(0);
    }, 300);
  }, []);

  const demoSeq = ["sys", "syst", "system", "ca", "cac", "cachi", "caching", "lo", "load", "sha", "shard"];
  const demoIdx = useRef(0);
  const runDemo = () => { handleInput(demoSeq[demoIdx.current % demoSeq.length]); demoIdx.current++; };

  return (
    <div className="rounded-xl border border-violet-500/20 bg-violet-500/[0.02] overflow-hidden">
      <div className="flex items-center gap-2 border-b border-violet-500/20 bg-violet-500/[0.04] px-4 py-2">
        <Zap className="size-4 text-violet-400" />
        <span className="text-sm font-medium text-violet-400">Live Typeahead with Debounce</span>
      </div>
      <div className="p-4 space-y-4">
        <p className="text-sm text-muted-foreground">Type a prefix to search system design terms. Watch the debounce timer fill before the trie query fires.</p>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/50" />
            <input
              type="text"
              value={input}
              onChange={(e) => handleInput(e.target.value)}
              placeholder="Try 'sys', 'ca', 'lo', 'sha'..."
              className="w-full bg-muted/30 border border-violet-500/20 rounded-md pl-9 pr-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-violet-500/30"
            />
          </div>
          <button
            onClick={runDemo}
            className="text-xs px-3 py-2 rounded-md border bg-violet-500/10 border-violet-500/20 text-violet-400 hover:bg-violet-500/20 transition-all shrink-0"
          >
            Demo
          </button>
        </div>

        {(isPending || input) && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground/60 uppercase tracking-wider font-semibold">Debounce timer</span>
              <span className={cn("font-mono", isPending ? "text-amber-400" : "text-emerald-400")}>
                {isPending ? `${debounceMs}ms remaining` : "fired"}
              </span>
            </div>
            <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all duration-75", isPending ? "bg-amber-500" : "bg-emerald-500")}
                style={{ width: isPending ? `${(debounceMs / 300) * 100}%` : "100%" }}
              />
            </div>
          </div>
        )}

        {results.length > 0 && (
          <div className="rounded-lg border border-violet-500/15 overflow-hidden">
            {results.map((r, i) => (
              <div key={r.word} className={cn("flex items-center justify-between px-3 py-2 text-sm hover:bg-violet-500/5", i < results.length - 1 && "border-b border-border/20")}>
                <span className="font-mono text-xs">
                  <span className="text-violet-400">{input.toLowerCase()}</span>
                  <span className="text-muted-foreground">{r.word.slice(input.length)}</span>
                </span>
                <span className="text-[10px] font-mono text-muted-foreground/50">{(r.freq / 1000).toFixed(0)}K</span>
              </div>
            ))}
          </div>
        )}
        {input && results.length === 0 && !isPending && (
          <p className="text-xs text-muted-foreground/50 text-center py-2">No suggestions for &quot;{input}&quot;</p>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AutocompletePage() {
  return (
    <div className="space-y-10">
      <TopicHero
        title="Autocomplete"
        subtitle="Design a typeahead suggestion system returning results in under 50ms for 100K concurrent users typing in real time."
        difficulty="intermediate"
      />

      <WhyCare>
        Google shows search suggestions in under 100ms as you type. Behind that speed is a trie data structure and clever debouncing.
      </WhyCare>

      <p className="text-sm text-muted-foreground">
        Autocomplete systems use a trie (prefix tree) for O(L) lookups, fronted by a <GlossaryTerm term="cache">cache</GlossaryTerm> layer. A <GlossaryTerm term="cdn">CDN</GlossaryTerm> serves popular 1-2 character prefix results at the edge, reducing <GlossaryTerm term="latency">latency</GlossaryTerm> to near zero. An <GlossaryTerm term="api gateway">API gateway</GlossaryTerm> handles <GlossaryTerm term="rate limiting">rate limiting</GlossaryTerm>, and <GlossaryTerm term="sharding">sharding</GlossaryTerm> the trie by prefix range enables horizontal scaling.
      </p>

      <ConversationalCallout type="question">
        What happens when every keystroke fires a SQL <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">LIKE &apos;sys%&apos;</code> query? At 100K users typing 5 characters each, that&apos;s 500K full-table scans per second. The DB melts. Suggestions arrive after the user already finished typing.
      </ConversationalCallout>

      {/* Live Trie Visualizer */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">The Trie — Core Data Structure</h2>
        <p className="text-sm text-muted-foreground">
          A trie stores strings character by character. Each node represents one character; paths from root to terminal nodes form complete words. Prefix lookup is O(L) — independent of dataset size. &quot;sys&quot; traverses exactly 3 nodes and returns all completions below, with frequency counts for ranking.
        </p>
        <LiveTrieViz />
        <ConversationalCallout type="tip">
          Switch to Search Prefix mode and type &quot;sys&quot;. The green highlighted nodes show the exact 3-node path the trie traverses — then it collects everything below that node. This is why trie lookup is O(prefix length), not O(dictionary size).
        </ConversationalCallout>
      </section>

      {/* Live Typeahead Demo */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Live Typeahead Demo</h2>
        <TypeaheadDemo />
      </section>

      {/* Debounce Playground */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Debouncing — Fewer Calls, Same UX</h2>
        <p className="text-sm text-muted-foreground">
          Without debouncing, typing &quot;system&quot; fires 6 API calls. With 300ms debounce, the timer resets on each keystroke and fires only after a pause. Most typing bursts happen within 200ms between characters — so a 300ms window captures the full word, sending 1 request instead of 6.
        </p>
        <DebouncePlayground />
      </section>

      {/* Ranking Demo */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Frequency-Based Ranking</h2>
        <p className="text-sm text-muted-foreground">
          The trie collects all completions under a prefix, then sorts by frequency descending. &quot;system design&quot; (50K searches) always outranks &quot;syslog&quot; (5K). Top-K results per prefix are pre-computed and cached so ranking never happens at query time.
        </p>
        <RankingDemo />
      </section>

      {/* Architecture Flow */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">System Architecture</h2>
        <p className="text-sm text-muted-foreground">
          The request path flows through the API gateway into the autocomplete service, which checks a multi-layer cache before touching the trie. The trie itself is built offline from aggregated query logs.
        </p>
        <ArchitectureFlow />
      </section>

      {/* Latency chart */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Latency: Trie vs Database</h2>
        <p className="text-sm text-muted-foreground">
          Trie lookup latency grows slowly with prefix length (more characters to traverse). Database LIKE query latency <em>decreases</em> with prefix length — a more specific LIKE narrows the scan — but starts at 300ms+ vs trie&apos;s 2ms. Even at 12ms, trie is 15× faster at the longest prefix.
        </p>
        <div className="rounded-xl border border-border/50 bg-muted/10 p-4">
          <LiveChart
            type="line"
            data={latencyData}
            dataKeys={{ x: "prefix", y: ["trie", "db"], label: ["Trie lookup", "DB LIKE query"] }}
            height={220}
            unit="ms"
            referenceLines={[{ y: 50, label: "50ms UX threshold", color: "#f97316" }]}
          />
        </div>
        <ConversationalCallout type="tip">
          The 50ms threshold is where autocomplete starts feeling &quot;laggy&quot; to users. Trie lookups stay well under this even at 7+ character prefixes. Database queries cross the threshold at 1 character.
        </ConversationalCallout>
      </section>

      {/* Before / After */}
      <BeforeAfter
        before={{
          title: "DB Query Per Keystroke (300–500ms)",
          content: (
            <ul className="text-sm space-y-1.5 text-muted-foreground">
              <li>LIKE query on every character typed</li>
              <li>300–500ms latency — results arrive after user finishes</li>
              <li>6 API calls per word, no debouncing</li>
              <li>Database at 98% CPU under 100K users</li>
              <li>No caching — identical prefixes hit DB repeatedly</li>
              <li>Full table scan on each keystroke</li>
            </ul>
          ),
        }}
        after={{
          title: "Trie + Cache + Debounce (&lt;10ms)",
          content: (
            <ul className="text-sm space-y-1.5 text-muted-foreground">
              <li>In-memory trie lookup O(prefix length)</li>
              <li>2–12ms latency — suggestions appear instantly</li>
              <li>1–2 API calls per word (300ms debounce)</li>
              <li>95%+ cache hit rate on popular prefixes</li>
              <li>Database not in the read path at all</li>
              <li>Offline pipeline rebuilds trie weekly</li>
            </ul>
          ),
        }}
      />

      <AhaMoment
        question="How does Google show suggestions after just 1 character?"
        answer={
          <p>
            Google pre-computes and caches the top results for every single letter and every 2-letter combination —
            only <strong>26 + 676 = 702 entries</strong> to cover the vast majority of queries. These caches live
            at edge servers worldwide. When you type &quot;s&quot;, the response is already waiting in the nearest
            CDN node — no round trip to Google&apos;s servers. Single-character prefix caches have a
            near-100% hit rate because every search starts with one of 26 letters. This is why it feels instant
            on the very first keystroke.
          </p>
        }
      />

      <ConversationalCallout type="warning">
        At Google scale (8.5B searches/day), a single trie cannot fit in memory. Shard the trie by prefix ranges
        (a–d on cluster 1, e–j on cluster 2, etc.). A routing layer directs each query to the correct shard.
        Replicate each shard across data centers. Pre-cache 1–2 character prefixes at CDN edge nodes globally.
      </ConversationalCallout>

      <TopicQuiz
        questions={[
          {
            question: "Why is a trie lookup O(L) instead of O(N), where L is prefix length and N is dictionary size?",
            options: [
              "Tries compress the dictionary to be smaller",
              "Each character in the prefix navigates one node — the number of words in the dictionary is irrelevant",
              "Tries use binary search at each level",
              "Tries only work with small dictionaries"
            ],
            correctIndex: 1,
            explanation: "In a trie, looking up 'sys' traverses exactly 3 nodes regardless of whether the dictionary has 100 or 100 million words. The lookup time depends only on the prefix length, not the dataset size. This is why tries are ideal for autocomplete."
          },
          {
            question: "How does debouncing reduce API calls when a user types 'system'?",
            options: [
              "It sends all 6 characters in a single request",
              "It waits 300ms after the last keystroke before firing, so a fast typing burst sends 1 request instead of 6",
              "It caches the results locally so no API call is needed",
              "It compresses multiple keystrokes into fewer bytes"
            ],
            correctIndex: 1,
            explanation: "Most typing bursts happen within 200ms between characters. A 300ms debounce window captures the full word, resetting the timer on each keystroke. The API call fires only after a 300ms pause, reducing 6 calls to 1 with no perceptible UX impact."
          },
          {
            question: "Why does Google cache the top results for every single letter (26 entries) at CDN edge nodes?",
            options: [
              "There are only 26 possible search queries",
              "Every search starts with one of 26 letters — these caches have near-100% hit rate and respond from the nearest edge",
              "CDN edge nodes can only store 26 entries",
              "Single-letter queries are the most computationally expensive"
            ],
            correctIndex: 1,
            explanation: "Every search begins with a single character, so pre-caching top results for all 26 letters (plus 676 two-letter combos = 702 total entries) covers the vast majority of queries. The response is already waiting at the nearest CDN edge, making the first keystroke feel instant."
          }
        ]}
      />

      <KeyTakeaway
        points={[
          "Use a trie (prefix tree) for O(L) prefix lookups independent of dataset size. Each node stores one character; terminal nodes store frequency counts for ranking.",
          "Debounce client requests at 300ms. Most typing bursts complete within 200ms per keystroke, so debouncing cuts API calls by 80–95% with no perceptible UX impact.",
          "Cache top-K results per prefix aggressively. The 702 single- and two-character prefix caches alone cover the vast majority of all searches at near-100% hit rates.",
          "Build the frequency table offline. A Kafka → aggregation → trie builder → atomic deploy pipeline runs weekly. Real-time trie updates are too expensive and risky.",
          "Personalize client-side with localStorage for recent searches. Zero server cost, no extra API call, merges seamlessly with global suggestions.",
          "At scale, shard the trie by prefix range across multiple servers and replicate each shard. Route queries based on the first 1–2 characters of the prefix.",
        ]}
      />
    </div>
  );
}
