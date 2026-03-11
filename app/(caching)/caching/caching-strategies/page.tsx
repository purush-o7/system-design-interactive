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
import { MetricCounter } from "@/components/metric-counter";
import { InteractiveDemo } from "@/components/interactive-demo";
import { AnimatedFlow } from "@/components/animated-flow";
import { ScaleSimulator } from "@/components/scale-simulator";
import { cn } from "@/lib/utils";
import { Database, HardDrive, Server, ArrowRight, ArrowLeft, Clock, Zap, AlertTriangle, Hash, List, BarChart3, Type } from "lucide-react";

function StrategyFlowViz({ strategy }: { strategy: "cache-aside" | "read-through" | "write-through" | "write-back" | "write-around" }) {
  const [step, setStep] = useState(0);

  const flows: Record<string, { steps: { from: string; to: string; label: string; color: string }[]; labels: string[] }> = {
    "cache-aside": {
      labels: ["App", "Cache", "DB"],
      steps: [
        { from: "App", to: "Cache", label: "1. Check cache", color: "text-blue-400" },
        { from: "Cache", to: "App", label: "2. Cache MISS", color: "text-red-400" },
        { from: "App", to: "DB", label: "3. Query DB", color: "text-amber-400" },
        { from: "DB", to: "App", label: "4. Return data", color: "text-amber-400" },
        { from: "App", to: "Cache", label: "5. Populate cache", color: "text-emerald-400" },
      ],
    },
    "read-through": {
      labels: ["App", "Cache", "DB"],
      steps: [
        { from: "App", to: "Cache", label: "1. Read from cache", color: "text-blue-400" },
        { from: "Cache", to: "DB", label: "2. Cache fetches DB", color: "text-amber-400" },
        { from: "DB", to: "Cache", label: "3. DB returns data", color: "text-amber-400" },
        { from: "Cache", to: "App", label: "4. Cache returns data", color: "text-emerald-400" },
      ],
    },
    "write-through": {
      labels: ["App", "Cache", "DB"],
      steps: [
        { from: "App", to: "Cache", label: "1. Write to cache", color: "text-blue-400" },
        { from: "Cache", to: "DB", label: "2. Cache writes DB", color: "text-amber-400" },
        { from: "DB", to: "Cache", label: "3. DB confirms", color: "text-emerald-400" },
        { from: "Cache", to: "App", label: "4. ACK to app", color: "text-emerald-400" },
      ],
    },
    "write-back": {
      labels: ["App", "Cache", "DB"],
      steps: [
        { from: "App", to: "Cache", label: "1. Write to cache", color: "text-blue-400" },
        { from: "Cache", to: "App", label: "2. ACK immediately", color: "text-emerald-400" },
        { from: "Cache", to: "Cache", label: "3. Buffer writes", color: "text-amber-400" },
        { from: "Cache", to: "DB", label: "4. Async batch flush", color: "text-purple-400" },
      ],
    },
    "write-around": {
      labels: ["App", "Cache", "DB"],
      steps: [
        { from: "App", to: "DB", label: "1. Write directly to DB", color: "text-amber-400" },
        { from: "DB", to: "App", label: "2. DB confirms", color: "text-emerald-400" },
        { from: "App", to: "Cache", label: "3. Later read: MISS", color: "text-red-400" },
        { from: "App", to: "Cache", label: "4. Fill on read", color: "text-blue-400" },
      ],
    },
  };

  const flow = flows[strategy];
  const totalSteps = flow.steps.length + 1;

  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % totalSteps), 1200);
    return () => clearInterval(t);
  }, [totalSteps]);

  const colIndex = (label: string) => flow.labels.indexOf(label);

  return (
    <div className="space-y-3 py-2">
      {/* Node headers */}
      <div className="grid grid-cols-3 gap-2">
        {flow.labels.map((label, i) => {
          const icons = [
            <Server key="s" className="size-4" />,
            <HardDrive key="h" className="size-4" />,
            <Database key="d" className="size-4" />,
          ];
          const colors = [
            "bg-blue-500/10 border-blue-500/30 text-blue-400",
            "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
            "bg-amber-500/10 border-amber-500/30 text-amber-400",
          ];
          return (
            <div key={label} className={cn(
              "flex items-center justify-center gap-2 rounded-lg border py-2 px-3 text-xs font-semibold transition-all",
              colors[i]
            )}>
              {icons[i]}
              {label}
            </div>
          );
        })}
      </div>

      {/* Animated arrows */}
      <div className="space-y-1.5">
        {flow.steps.map((s, i) => {
          const fromCol = colIndex(s.from);
          const toCol = colIndex(s.to);
          const isActive = step > i;
          const isCurrent = step === i + 1;

          return (
            <div
              key={i}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-300 border",
                isCurrent
                  ? "bg-white/5 border-white/10 ring-1 ring-white/10"
                  : isActive
                  ? "bg-muted/20 border-border/30"
                  : "bg-muted/5 border-transparent"
              )}
            >
              <span className={cn(
                "font-mono text-[10px] w-4 text-right transition-opacity",
                isActive || isCurrent ? "opacity-100" : "opacity-20"
              )}>
                {i + 1}
              </span>
              <div className={cn(
                "flex items-center gap-1.5 flex-1 transition-all",
                isCurrent ? s.color : isActive ? "text-muted-foreground" : "text-muted-foreground/30"
              )}>
                <span className="font-semibold min-w-[36px]">{s.from}</span>
                {fromCol <= toCol ? (
                  <ArrowRight className="size-3 shrink-0" />
                ) : (
                  <ArrowLeft className="size-3 shrink-0" />
                )}
                <span className="font-semibold min-w-[36px]">{s.to}</span>
                <span className="text-[11px] ml-1 font-normal">{s.label.replace(/^\d+\.\s/, "")}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StrategyComparisonTable() {
  const [highlighted, setHighlighted] = useState<number | null>(null);

  const strategies = [
    { name: "Cache-Aside", readLatency: "Miss: ~5ms, Hit: <1ms", writeLatency: "N/A (reads only)", consistency: "Eventual", risk: "Stale reads", useCase: "Product catalogs, user profiles" },
    { name: "Read-Through", readLatency: "Miss: ~5ms, Hit: <1ms", writeLatency: "N/A (reads only)", consistency: "Eventual", risk: "Cold start", useCase: "CDN content, config data" },
    { name: "Write-Through", readLatency: "Always <1ms", writeLatency: "~6ms (both writes)", consistency: "Strong", risk: "Write latency", useCase: "Sessions, shopping carts" },
    { name: "Write-Back", readLatency: "Always <1ms", writeLatency: "<1ms (cache only)", consistency: "Eventual", risk: "Data loss", useCase: "Analytics, logging, counters" },
    { name: "Write-Around", readLatency: "First read: ~5ms", writeLatency: "~3ms (DB only)", consistency: "Eventual", risk: "Cache miss storm", useCase: "Logs, audit trails" },
  ];

  return (
    <div className="space-y-1">
      {strategies.map((s, i) => (
        <div
          key={s.name}
          className={cn(
            "grid grid-cols-[140px_1fr] gap-3 rounded-lg border px-3 py-2.5 transition-all cursor-pointer",
            highlighted === i
              ? "bg-blue-500/5 border-blue-500/20"
              : "bg-muted/10 border-border/30 hover:bg-muted/20"
          )}
          onClick={() => setHighlighted(highlighted === i ? null : i)}
        >
          <div className="text-xs font-semibold text-foreground">{s.name}</div>
          <div className={cn(
            "grid gap-1 transition-all overflow-hidden",
            highlighted === i ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0 h-0"
          )}>
            <div className="overflow-hidden space-y-1">
              <div className="flex gap-2 text-[11px]">
                <span className="text-muted-foreground/60 w-20">Read latency:</span>
                <span className="text-muted-foreground">{s.readLatency}</span>
              </div>
              <div className="flex gap-2 text-[11px]">
                <span className="text-muted-foreground/60 w-20">Write latency:</span>
                <span className="text-muted-foreground">{s.writeLatency}</span>
              </div>
              <div className="flex gap-2 text-[11px]">
                <span className="text-muted-foreground/60 w-20">Consistency:</span>
                <span className={cn(
                  s.consistency === "Strong" ? "text-emerald-400" : "text-amber-400"
                )}>{s.consistency}</span>
              </div>
              <div className="flex gap-2 text-[11px]">
                <span className="text-muted-foreground/60 w-20">Main risk:</span>
                <span className="text-red-400">{s.risk}</span>
              </div>
              <div className="flex gap-2 text-[11px]">
                <span className="text-muted-foreground/60 w-20">Best for:</span>
                <span className="text-blue-400">{s.useCase}</span>
              </div>
            </div>
          </div>
          {highlighted !== i && (
            <div className="col-start-2 text-[10px] text-muted-foreground/50">
              {s.useCase}
            </div>
          )}
        </div>
      ))}
      <p className="text-[10px] text-muted-foreground/40 pt-1">Click a strategy to expand details</p>
    </div>
  );
}

function LatencyComparison() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % 3), 2000);
    return () => clearInterval(t);
  }, []);

  const scenarios = [
    { label: "No cache (DB every time)", time: 5, unit: "ms", color: "bg-red-500/70", width: "100%" },
    { label: "Cache hit (Redis)", time: 0.1, unit: "ms", color: "bg-emerald-500/70", width: "2%" },
    { label: "Cache miss + fill", time: 6, unit: "ms", color: "bg-amber-500/70", width: "120%" },
  ];

  return (
    <div className="space-y-2">
      {scenarios.map((s, i) => (
        <div key={s.label} className="flex items-center gap-3">
          <span className="text-[11px] text-muted-foreground w-[160px] shrink-0">{s.label}</span>
          <div className="flex-1 h-6 bg-muted/10 rounded-md overflow-hidden relative">
            <div
              className={cn(
                "h-full rounded-md transition-all duration-700 flex items-center px-2",
                s.color,
                step === i ? "opacity-100" : "opacity-30"
              )}
              style={{ width: step === i ? s.width : "0%", maxWidth: "100%" }}
            />
          </div>
          <span className={cn(
            "text-[11px] font-mono w-12 text-right transition-opacity",
            step === i ? "opacity-100 text-foreground" : "opacity-40 text-muted-foreground"
          )}>
            {s.time}{s.unit}
          </span>
        </div>
      ))}
      <p className="text-[10px] text-muted-foreground/50 mt-1">
        Redis GET averages ~0.1ms. PostgreSQL query averages ~5ms. That is a 50x difference.
      </p>
    </div>
  );
}

export default function CachingStrategiesPage() {
  return (
    <div className="space-y-8">
      <TopicHero
        title="Caching Strategies"
        subtitle="Your database shouldn't answer the same question ten thousand times a second. The strategy you choose determines where data lives, how fresh it stays, and what breaks when things go wrong."
        difficulty="intermediate"
      />

      <FailureScenario title="10,000 identical queries per second">
        <p className="text-sm text-muted-foreground">
          Your product page is live. Every visitor triggers{" "}
          <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">SELECT * FROM products WHERE id = 42</code>.
          Traffic spikes to <strong className="text-red-400">10,000 requests/second</strong>. The database connection pool
          is exhausted, queries start timing out, and the entire site goes down — all because the same unchanged row was
          read over and over again.
        </p>
        <div className="grid grid-cols-3 gap-3">
          <MetricCounter label="DB Queries/sec" value={10000} trend="up" />
          <MetricCounter label="Avg Latency" value={1200} unit="ms" trend="up" />
          <MetricCounter label="Error Rate" value={34} unit="%" trend="up" />
        </div>
      </FailureScenario>

      <WhyItBreaks title="Databases are built for durability, not repetition">
        <p className="text-sm text-muted-foreground">
          Every database query locks rows, consumes a connection from a limited pool, and often hits disk.
          PostgreSQL can handle maybe 10,000-30,000 simple queries per second on good hardware. Redis handles
          over <strong>100,000 operations per second</strong> on a single core, serving directly from memory.
          The fix is not &quot;get a bigger database&quot; — it is <strong>stop asking the same question repeatedly</strong>.
        </p>
      </WhyItBreaks>

      <ConceptVisualizer title="The Speed Difference">
        <p className="text-sm text-muted-foreground mb-4">
          A typical PostgreSQL query takes ~5ms. A Redis GET takes ~0.1ms. When you are serving 10,000 requests
          per second, that 50x difference is the gap between a smooth page load and a timeout error.
        </p>
        <LatencyComparison />
      </ConceptVisualizer>

      <ConceptVisualizer title="Cache-Aside (Lazy Loading)">
        <p className="text-sm text-muted-foreground mb-2">
          The most common caching strategy. The application owns all the logic: check the cache first,
          query the database on a miss, then store the result for next time. Facebook uses this pattern
          with Memcached in front of MySQL for user profile data.
        </p>
        <StrategyFlowViz strategy="cache-aside" />
        <ConversationalCallout type="tip">
          Cache-aside is the default choice for most teams. It is simple, the app has full control,
          and it naturally only caches data that is actually being read. The downside? The first request
          for any key always pays the full database penalty.
        </ConversationalCallout>
      </ConceptVisualizer>

      <ConceptVisualizer title="Read-Through">
        <p className="text-sm text-muted-foreground mb-2">
          Like cache-aside, but the cache itself handles the database lookup on a miss. The app only
          ever talks to the cache — it does not even know the database exists. This simplifies
          application code but couples your cache layer to your data source.
        </p>
        <StrategyFlowViz strategy="read-through" />
        <AhaMoment
          question="What's the real difference between cache-aside and read-through?"
          answer={
            <p>
              In cache-aside, your application code contains the &quot;check cache, miss, query DB, fill cache&quot; logic.
              In read-through, the <em>cache library</em> contains that logic. The data flow is the same, but the
              responsibility shifts. Read-through means less boilerplate in your app, but your cache layer needs
              to understand how to query your database.
            </p>
          }
        />
      </ConceptVisualizer>

      <ConceptVisualizer title="Write-Through">
        <p className="text-sm text-muted-foreground mb-2">
          Every write goes to the cache first, which then synchronously writes to the database before
          acknowledging the client. The cache is <em>never stale</em> because it sees every write. The
          tradeoff: every write pays double latency (cache + DB).
        </p>
        <StrategyFlowViz strategy="write-through" />
        <ConversationalCallout type="question">
          When would you accept double write latency? When consistency matters more than speed — shopping
          carts, user sessions, financial balances. If a user updates their email, you want every subsequent
          read to reflect that instantly, not after a TTL expires.
        </ConversationalCallout>
      </ConceptVisualizer>

      <ConceptVisualizer title="Write-Back (Write-Behind)">
        <p className="text-sm text-muted-foreground mb-2">
          The fastest write strategy. Writes go to cache, the client gets an immediate ACK, and the cache
          flushes to the database asynchronously in batches. This is how your OS handles disk writes —
          the filesystem page cache is a write-back cache.
        </p>
        <StrategyFlowViz strategy="write-back" />
        <ConversationalCallout type="warning">
          Write-back gives you sub-millisecond writes, but if the cache node crashes before flushing
          to the database, <strong>those writes are gone forever</strong>. Use this for data you can afford
          to lose — analytics events, view counters, recommendation signals. Never for financial transactions.
        </ConversationalCallout>
      </ConceptVisualizer>

      <ConceptVisualizer title="Write-Around">
        <p className="text-sm text-muted-foreground mb-2">
          Writes bypass the cache entirely and go straight to the database. The cache is only populated
          when data is read (via cache-aside or read-through). This prevents cache pollution — newly
          written data that nobody reads does not waste cache memory.
        </p>
        <StrategyFlowViz strategy="write-around" />
        <ConversationalCallout type="tip">
          Write-around works well for data that is written once and rarely re-read, like log entries,
          audit trails, or chat messages in old threads. Pairing write-around with cache-aside means
          only genuinely popular data makes it into the cache.
        </ConversationalCallout>
      </ConceptVisualizer>

      <ConceptVisualizer title="Strategy Comparison">
        <p className="text-sm text-muted-foreground mb-4">
          No single strategy fits every workload. The right choice depends on your read/write ratio,
          consistency requirements, and what happens when things fail.
        </p>
        <StrategyComparisonTable />
      </ConceptVisualizer>

      <CorrectApproach title="Match Strategy to Access Pattern">
        <p className="text-sm text-muted-foreground mb-4">
          Real production systems combine multiple strategies for different data types. Netflix uses
          EVCache (built on Memcached) with cache-aside for content metadata, while analytics pipelines
          use write-back for high-volume event ingestion.
        </p>
        <BeforeAfter
          before={{
            title: "One-size-fits-all",
            content: (
              <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                <li>Cache everything with write-through</li>
                <li>Same TTL for all data types</li>
                <li>Cache fills with rarely-read data</li>
                <li>Write latency hurts analytics pipeline</li>
                <li>Memory wasted on cold entries</li>
              </ul>
            ),
          }}
          after={{
            title: "Strategy per access pattern",
            content: (
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li><strong>Product catalog</strong> &rarr; cache-aside (read-heavy, rarely changes)</li>
                <li><strong>User sessions</strong> &rarr; write-through (must stay consistent)</li>
                <li><strong>Analytics events</strong> &rarr; write-back (high volume, eventual OK)</li>
                <li><strong>Audit logs</strong> &rarr; write-around (written once, rarely re-read)</li>
                <li><strong>Config/feature flags</strong> &rarr; read-through (simplify app code)</li>
              </ul>
            ),
          }}
        />
      </CorrectApproach>

      <InteractiveDemo title="Trace a Cache-Aside Request">
        {({ isPlaying, tick }) => {
          const phases = [
            { name: "GET cache", result: "MISS", time: "0.1ms", icon: <HardDrive className="size-3.5" /> },
            { name: "SELECT db", result: "row found", time: "4.8ms", icon: <Database className="size-3.5" /> },
            { name: "SET cache", result: "OK, TTL=300s", time: "0.1ms", icon: <HardDrive className="size-3.5" /> },
            { name: "Response", result: "200 OK", time: "5.0ms total", icon: <Server className="size-3.5" /> },
            { name: "GET cache", result: "HIT!", time: "0.1ms", icon: <HardDrive className="size-3.5" /> },
          ];
          const active = isPlaying ? Math.min(tick % 7, phases.length) : 0;

          return (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Press play to trace a cache-aside flow. The first request misses, the second one hits.
              </p>
              <div className="space-y-1.5">
                {phases.map((phase, i) => (
                  <div
                    key={`${phase.name}-${i}`}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border px-3 py-2 transition-all duration-400",
                      i < active
                        ? i === 4 ? "bg-emerald-500/8 border-emerald-500/20" : "bg-blue-500/5 border-blue-500/15"
                        : i === active && isPlaying
                        ? "bg-blue-500/8 border-blue-500/20 ring-1 ring-blue-500/15"
                        : "bg-muted/10 border-border/30 text-muted-foreground/40"
                    )}
                  >
                    <span className={cn(
                      "transition-colors",
                      i < active ? (i === 4 ? "text-emerald-400" : "text-blue-400") : i === active && isPlaying ? "text-blue-400" : "text-muted-foreground/30"
                    )}>
                      {phase.icon}
                    </span>
                    <span className={cn(
                      "text-xs font-mono font-bold w-24",
                      i < active ? (i === 4 ? "text-emerald-400" : "text-blue-400") : i === active && isPlaying ? "text-blue-400" : ""
                    )}>
                      {phase.name}
                    </span>
                    <div className="flex-1 text-xs text-muted-foreground">
                      {i < active ? phase.result : "---"}
                    </div>
                    <span className={cn(
                      "text-[10px] font-mono",
                      i < active ? "text-muted-foreground" : "text-transparent"
                    )}>
                      {phase.time}
                    </span>
                  </div>
                ))}
              </div>
              {active >= phases.length && (
                <ConversationalCallout type="question">
                  Notice the second GET was 50x faster? That single cache fill saved the database from
                  every subsequent request for the next 5 minutes. At 10,000 req/s, that is 3 million
                  database queries avoided.
                </ConversationalCallout>
              )}
            </div>
          );
        }}
      </InteractiveDemo>

      <AhaMoment
        question="Why not just cache everything with write-through and be done with it?"
        answer={
          <p>
            Write-through adds latency to every write and fills your cache with data that may never be
            read again. If you write 100,000 log entries per second but only 50 get read, you have wasted
            99,950 cache slots on data nobody wanted. Match the strategy to the access pattern — not the
            other way around.
          </p>
        }
      />

      <ConversationalCallout type="tip">
        In system design interviews, do not just say &quot;add a cache.&quot; Specify which strategy and why.
        &quot;I would use cache-aside with a 5-minute TTL for the product catalog because reads outnumber
        writes 100:1 and eventual consistency is acceptable&quot; shows real understanding.
      </ConversationalCallout>

      <ConversationalCallout type="warning">
        Phil Karlton said there are only two hard things in CS: cache invalidation and naming things.
        None of these strategies tell you when to expire or invalidate cache entries — that&apos;s
        covered in the Cache Invalidation topic.
      </ConversationalCallout>

      <ConceptVisualizer title="Redis Data Structures for Caching">
        <p className="text-sm text-muted-foreground mb-4">
          Redis is not just a key-value store — it provides specialized data structures, each optimized
          for different caching use cases. Choosing the right structure can dramatically simplify your
          application code and improve performance.
        </p>
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              icon: <Type className="size-5" />,
              name: "Strings",
              desc: "Simple key-value pairs and atomic counters",
              useCase: "Session tokens, page cache, rate limit counters (INCR/DECR)",
              color: "bg-blue-500/10 border-blue-500/20 text-blue-400",
            },
            {
              icon: <Hash className="size-5" />,
              name: "Hashes",
              desc: "Field-value maps under a single key",
              useCase: "User profiles (user:42 → {name, email, plan}), product details, config objects",
              color: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
            },
            {
              icon: <BarChart3 className="size-5" />,
              name: "Sorted Sets",
              desc: "Members scored and ranked automatically",
              useCase: "Leaderboards, trending posts, priority queues, time-series top-N",
              color: "bg-violet-500/10 border-violet-500/20 text-violet-400",
            },
            {
              icon: <List className="size-5" />,
              name: "Lists",
              desc: "Ordered sequences with push/pop from both ends",
              useCase: "Message queues, activity feeds, recent-items lists (LPUSH + LTRIM)",
              color: "bg-amber-500/10 border-amber-500/20 text-amber-400",
            },
          ].map((ds) => (
            <div key={ds.name} className={cn("rounded-lg border p-3 space-y-2", ds.color)}>
              <div className="flex items-center gap-2">
                {ds.icon}
                <span className="text-xs font-bold">{ds.name}</span>
              </div>
              <p className="text-[11px] text-muted-foreground">{ds.desc}</p>
              <p className="text-[10px] text-muted-foreground/80">
                <strong className="text-foreground/70">Use case:</strong> {ds.useCase}
              </p>
            </div>
          ))}
        </div>
      </ConceptVisualizer>

      <ScaleSimulator
        title="Cache Hit Rate Impact Simulator"
        min={0}
        max={99}
        step={1}
        unit="% hit rate"
        metrics={(v) => {
          const baseDbQps = 10000;
          const dbQpsReduction = Math.round((v / 100) * baseDbQps);
          const responseTimeFactor = v === 0 ? 1 : parseFloat((1 / (1 - v / 100)).toFixed(1));
          const capacityFreed = Math.round(v * 0.95);
          return [
            { label: "DB QPS Reduction", value: dbQpsReduction, unit: `of ${baseDbQps.toLocaleString()}` },
            { label: "Response Time Factor", value: Math.min(responseTimeFactor, 100), unit: "x faster" },
            { label: "Server Capacity Freed", value: capacityFreed, unit: "%" },
          ];
        }}
      >
        {({ value }) => (
          <p className="text-xs text-muted-foreground">
            {value < 50
              ? `At ${value}% hit rate, most requests still hit the database. You are barely benefiting from the cache. Aim for at least 80% to see meaningful improvements.`
              : value < 90
              ? `At ${value}% hit rate, your database load drops by ${Math.round((value / 100) * 10000).toLocaleString()} QPS. Good, but the remaining ${100 - value}% of misses still create noticeable load during traffic spikes.`
              : `At ${value}% hit rate, only ${100 - value}% of requests reach the database. This is production-grade caching — Netflix and Facebook operate at 95%+ hit rates. Your database is effectively idle for cached data.`}
          </p>
        )}
      </ScaleSimulator>

      <KeyTakeaway
        points={[
          "Cache-aside gives the application full control and only caches data that is actually read. It is the most common pattern (used by Facebook, Netflix).",
          "Read-through simplifies app code by having the cache library handle DB fetches on misses.",
          "Write-through keeps cache and DB perfectly in sync but doubles write latency (~6ms instead of ~3ms).",
          "Write-back is fastest for writes (<1ms) but risks data loss if cache crashes before flushing. Use for analytics, counters, and non-critical data.",
          "Write-around prevents cache pollution by only caching data on reads, ideal for write-once-read-rarely patterns.",
          "Real systems combine strategies: cache-aside for reads, write-through for sessions, write-back for analytics. Always match strategy to access pattern.",
        ]}
      />
    </div>
  );
}
