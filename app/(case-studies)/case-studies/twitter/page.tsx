"use client";

import { useState, useEffect, useMemo } from "react";
import { TopicHero } from "@/components/topic-hero";
import { KeyTakeaway } from "@/components/key-takeaway";
import { WhyCare } from "@/components/why-care";
import { GlossaryTerm } from "@/components/glossary-term";
import { TopicQuiz } from "@/components/topic-quiz";
import { AhaMoment } from "@/components/aha-moment";
import { ConversationalCallout } from "@/components/conversational-callout";
import { BeforeAfter } from "@/components/before-after";
import { FlowDiagram } from "@/components/flow-diagram";
import type { FlowNode, FlowEdge } from "@/components/flow-diagram";
import { LiveChart } from "@/components/live-chart";
import { Playground } from "@/components/playground";
import { useSimulation } from "@/hooks/use-simulation";
import { cn } from "@/lib/utils";
import {
  Users,
  Zap,
  Clock,
  TrendingUp,
  Hash,
  Database,
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Fan-out Comparison Playground                                      */
/* ------------------------------------------------------------------ */
function FanoutPlayground() {
  const [followerCount, setFollowerCount] = useState(500000);
  const [mode, setMode] = useState<"push" | "pull" | "hybrid">("hybrid");

  const isCelebrity = followerCount > 500000;
  const writeOps = mode === "pull" ? 1 : mode === "hybrid" ? (isCelebrity ? 1 : followerCount) : followerCount;
  const readOps = mode === "push" ? 1 : mode === "hybrid" ? (isCelebrity ? followerCount : 1) : followerCount;
  const singleWorkerSec = Math.max(1, Math.round(writeOps / 50000));
  const workersNeeded = Math.max(1, Math.ceil(writeOps / 50000));

  const chartData = useMemo(() => {
    const points = [100, 500, 1000, 5000, 10000, 50000, 100000, 500000, 1000000, 5000000, 10000000];
    return points.map((f) => ({
      followers: f >= 1000000 ? `${f / 1000000}M` : f >= 1000 ? `${f / 1000}K` : String(f),
      push: Math.round(f / 50000),
      pull: 1,
      hybrid: f > 500000 ? 1 : Math.round(f / 50000),
    }));
  }, []);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Drag the slider to see how fan-out cost scales with follower count. Switch strategies to compare approaches.
        </p>
        <div className="flex gap-2 flex-wrap">
          {(["push", "pull", "hybrid"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                "text-xs px-3 py-1.5 rounded-md border transition-all capitalize",
                mode === m
                  ? "bg-violet-500/15 border-violet-500/30 text-violet-400"
                  : "bg-muted/20 border-border/50 text-muted-foreground hover:text-foreground"
              )}
            >
              {m === "push" ? "Fan-out-on-Write" : m === "pull" ? "Fan-out-on-Read" : "Hybrid (Twitter)"}
            </button>
          ))}
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Followers: <span className="font-mono text-foreground">{followerCount >= 1000000 ? `${(followerCount / 1000000).toFixed(1)}M` : followerCount >= 1000 ? `${(followerCount / 1000).toFixed(0)}K` : followerCount}</span></span>
            {isCelebrity && <span className="text-amber-400 font-mono text-[11px]">Celebrity threshold exceeded</span>}
          </div>
          <input
            type="range"
            min={1000}
            max={100000000}
            step={100000}
            value={followerCount}
            onChange={(e) => setFollowerCount(Number(e.target.value))}
            className="w-full accent-violet-500 h-1.5 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground/50 font-mono">
            <span>1K</span>
            <span>500K threshold</span>
            <span>100M</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Write Ops", value: writeOps >= 1000000 ? `${(writeOps / 1000000).toFixed(1)}M` : writeOps >= 1000 ? `${(writeOps / 1000).toFixed(0)}K` : String(writeOps), color: writeOps > 100000 ? "text-red-400" : "text-emerald-400" },
          { label: "Read Ops", value: readOps >= 1000000 ? `${(readOps / 1000000).toFixed(1)}M` : readOps >= 1000 ? `${(readOps / 1000).toFixed(0)}K` : String(readOps), color: readOps > 100000 ? "text-red-400" : "text-emerald-400" },
          { label: "Worker Time", value: singleWorkerSec >= 60 ? `${Math.round(singleWorkerSec / 60)}min` : `${singleWorkerSec}s`, color: singleWorkerSec > 30 ? "text-red-400" : "text-emerald-400" },
          { label: "Workers Needed", value: String(workersNeeded), color: workersNeeded > 10 ? "text-amber-400" : "text-emerald-400" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg border border-border/30 bg-muted/10 p-3 text-center">
            <p className="text-[10px] text-muted-foreground mb-1">{stat.label}</p>
            <p className={cn("text-lg font-mono font-bold", stat.color)}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div>
        <p className="text-[11px] text-muted-foreground mb-2">Single-worker time (seconds) at 50K writes/sec across follower counts</p>
        <LiveChart
          type="line"
          data={chartData}
          dataKeys={{ x: "followers", y: ["push", "pull", "hybrid"], label: ["Push", "Pull", "Hybrid"] }}
          height={180}
          unit="s"
        />
      </div>

      <div className={cn(
        "rounded-lg border p-3 text-[11px]",
        isCelebrity && mode === "push"
          ? "border-red-500/30 bg-red-500/5 text-red-400"
          : mode === "hybrid"
          ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-400"
          : "border-blue-500/30 bg-blue-500/5 text-blue-400"
      )}>
        {mode === "push" && isCelebrity
          ? `At ${(followerCount / 1000000).toFixed(0)}M followers, fan-out-on-write takes ${Math.round(followerCount / 50000 / 60)} minutes on a single worker. This blocks the entire fan-out queue.`
          : mode === "pull"
          ? "Fan-out-on-read stores 1 tweet but requires merging all followed accounts at read time. Gets slow when users follow thousands of people."
          : isCelebrity
          ? "Hybrid: Celebrity gets fan-out-on-read (1 write). Their followers merge the tweet on demand — no queue starvation for anyone."
          : "Hybrid: Normal user gets fan-out-on-write. Each follower's cache is updated async. Fast writes, O(1) reads."}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Timeline Cache FlowDiagram                                         */
/* ------------------------------------------------------------------ */
const timelineCacheNodes: FlowNode[] = [
  { id: "client", type: "clientNode", position: { x: 200, y: 20 }, data: { label: "User Opens App", sublabel: "iOS / Android", handles: { bottom: true } } },
  { id: "timeline-svc", type: "serverNode", position: { x: 200, y: 120 }, data: { label: "Timeline Service", sublabel: "Assemble home feed", status: "healthy", handles: { top: true, bottom: true } } },
  { id: "redis", type: "cacheNode", position: { x: 50, y: 230 }, data: { label: "Redis Cache", sublabel: "LRANGE user:X 0 799", status: "healthy", metrics: [{ label: "Hit rate", value: "98%" }, { label: "Latency", value: "<5ms" }], handles: { top: true, bottom: true } } },
  { id: "fanout-svc", type: "serverNode", position: { x: 350, y: 230 }, data: { label: "Fan-out Service", sublabel: "Push tweets on write", status: "healthy", handles: { top: true, bottom: true } } },
  { id: "tweet-store", type: "databaseNode", position: { x: 50, y: 360 }, data: { label: "Tweet Store", sublabel: "Manhattan / MySQL", status: "healthy", metrics: [{ label: "Lookup", value: "5-10ms" }], handles: { top: true } } },
  { id: "graph-db", type: "databaseNode", position: { x: 350, y: 360 }, data: { label: "FlockDB", sublabel: "Social graph edges", status: "healthy", handles: { top: true } } },
];

const timelineCacheEdges: FlowEdge[] = [
  { id: "e1", source: "client", target: "timeline-svc", label: "GET /timeline", animated: true },
  { id: "e2", source: "timeline-svc", target: "redis", label: "Fetch 800 IDs", animated: true },
  { id: "e3", source: "redis", target: "tweet-store", label: "Hydrate objects", animated: true },
  { id: "e4", source: "timeline-svc", target: "fanout-svc", label: "On new tweet", animated: false, style: { strokeDasharray: "5 5" } },
  { id: "e5", source: "fanout-svc", target: "graph-db", label: "Who follows?", animated: false, style: { strokeDasharray: "5 5" } },
];

/* ------------------------------------------------------------------ */
/*  Tweet Flow Simulation                                              */
/* ------------------------------------------------------------------ */
type TweetEvent = {
  id: number;
  type: "write" | "fanout" | "cache" | "done" | "celebrity";
  message: string;
  ts: number;
};

function TweetFlowSim() {
  const [events, setEvents] = useState<TweetEvent[]>([]);
  const [isCelebrity, setIsCelebrity] = useState(false);
  const sim = useSimulation({ intervalMs: 600, maxSteps: 10 });

  useEffect(() => {
    if (sim.step === 0) {
      setEvents([]);
      return;
    }
    const followerLabel = isCelebrity ? "100M followers" : "850 followers";
    const steps: TweetEvent[] = isCelebrity
      ? [
          { id: 1, type: "write", message: "@elonmusk tweets: 'Hello World!'", ts: 0 },
          { id: 2, type: "write", message: "Tweet stored in Manhattan (1 write)", ts: 60 },
          { id: 3, type: "celebrity", message: "Celebrity detected: >500K followers — skip fan-out", ts: 120 },
          { id: 4, type: "fanout", message: "Checking social graph: 100M edges...", ts: 180 },
          { id: 5, type: "celebrity", message: "Fan-out-on-read path selected", ts: 240 },
          { id: 6, type: "cache", message: "Tweet stored in author's store only", ts: 300 },
          { id: 7, type: "cache", message: "Follower timelines merge on next load", ts: 360 },
          { id: 8, type: "done", message: "Write complete in <50ms. 0 cache writes.", ts: 420 },
        ]
      : [
          { id: 1, type: "write", message: "@dev_jane tweets: 'Shipped it!'", ts: 0 },
          { id: 2, type: "write", message: "Tweet stored in Manhattan (1 write)", ts: 60 },
          { id: 3, type: "fanout", message: "Fan-out service: fetching 850 follower IDs from FlockDB", ts: 120 },
          { id: 4, type: "fanout", message: "Enqueuing 850 Redis LPUSH operations async", ts: 180 },
          { id: 5, type: "cache", message: "Redis: writing tweet ID to follower caches...", ts: 240 },
          { id: 6, type: "cache", message: "850 Redis LPUSHes complete in ~17ms", ts: 300 },
          { id: 7, type: "done", message: "Tweet delivered to all 850 timelines in <50ms", ts: 360 },
        ];

    setEvents(steps.slice(0, sim.step));
  }, [sim.step, isCelebrity]);

  const typeColors: Record<string, string> = {
    write: "text-blue-400 border-blue-500/20 bg-blue-500/5",
    fanout: "text-violet-400 border-violet-500/20 bg-violet-500/5",
    cache: "text-orange-400 border-orange-500/20 bg-orange-500/5",
    done: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5",
    celebrity: "text-amber-400 border-amber-500/20 bg-amber-500/5",
  };

  return (
    <Playground
      title="Tweet Fan-out Simulator"
      simulation={sim}
      canvasHeight="min-h-[320px]"
      hints={["Switch between 'Normal user' and 'Celebrity' to see how Twitter uses different fan-out strategies based on follower count."]}
      canvas={
        <div className="p-4 space-y-3 h-full">
          <div className="flex gap-2 items-center">
            <button
              onClick={() => { setIsCelebrity(false); sim.reset(); }}
              className={cn("text-xs px-3 py-1.5 rounded-md border transition-all", !isCelebrity ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400" : "bg-muted/20 border-border/50 text-muted-foreground")}
            >
              Normal user (850 followers)
            </button>
            <button
              onClick={() => { setIsCelebrity(true); sim.reset(); }}
              className={cn("text-xs px-3 py-1.5 rounded-md border transition-all", isCelebrity ? "bg-amber-500/15 border-amber-500/30 text-amber-400" : "bg-muted/20 border-border/50 text-muted-foreground")}
            >
              Celebrity (100M followers)
            </button>
          </div>
          <div className="space-y-1.5 overflow-y-auto max-h-[240px]">
            {events.length === 0 && (
              <p className="text-[11px] text-muted-foreground/40 font-mono italic">Press play to simulate a tweet...</p>
            )}
            {events.map((ev) => (
              <div key={ev.id} className={cn("flex items-start gap-2 rounded border px-2.5 py-1.5 text-[11px] font-mono transition-all animate-in fade-in slide-in-from-bottom-1", typeColors[ev.type])}>
                <span className="text-muted-foreground/50 shrink-0">{ev.id}.</span>
                <span>{ev.message}</span>
              </div>
            ))}
          </div>
        </div>
      }
      explanation={
        <div className="space-y-2">
          <p className="font-medium text-foreground/80 text-xs">What to watch for</p>
          <p>Normal user path: tweet hits Manhattan, fan-out service reads social graph, 850 Redis LPUSHes happen async.</p>
          <p>Celebrity path: tweet stored once. Fan-out bypassed. Their followers merge it at read time — no queue starvation.</p>
          <p className="text-amber-400/80">The 500K follower threshold is where Twitter switches strategy.</p>
        </div>
      }
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Trending Topics Playground                                         */
/* ------------------------------------------------------------------ */
function TrendingPlayground() {
  const [tick, setTick] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  useEffect(() => {
    if (!isPlaying) return;
    const t = setInterval(() => setTick((s) => s + 1), 900);
    return () => clearInterval(t);
  }, [isPlaying]);

  const topics = [
    { tag: "#WorldCup", base: 12000, growth: 4500 },
    { tag: "#BreakingNews", base: 8000, growth: 6200 },
    { tag: "#TechLayoffs", base: 5000, growth: 1800 },
    { tag: "#NewAlbum", base: 3000, growth: 1400 },
    { tag: "#MondayMotivation", base: 15000, growth: -900 },
  ];

  const sorted = [...topics]
    .map((t) => ({ ...t, count: t.base + Math.max(0, t.growth * Math.min(tick, 14)) }))
    .sort((a, b) => b.count - a.count);

  const maxCount = Math.max(...sorted.map((t) => t.count));

  const chartData = sorted.map((t) => ({
    tag: t.tag.slice(0, 12),
    tweets: Math.round(t.count / 100),
  }));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <Clock className="size-3.5 shrink-0" />
          <span className="font-mono">Elapsed: {Math.min(tick * 5, 70)}min — Kafka stream: {(tick * 12000).toLocaleString()} tweets ingested</span>
        </div>
        <button onClick={() => setIsPlaying(p => !p)}
          className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 border border-violet-500/20 transition-colors">
          {isPlaying ? "⏸ Pause" : "▶ Start"}
        </button>
      </div>
      <div className="space-y-2">
        {sorted.map((topic, rank) => {
          const width = Math.max(6, (topic.count / maxCount) * 100);
          const isRising = topic.growth > 3000;
          const isFalling = topic.growth < 0;
          return (
            <div key={topic.tag} className="flex items-center gap-3">
              <span className="text-[10px] font-mono text-muted-foreground/50 w-4 text-right">{rank + 1}</span>
              <span className={cn("text-[11px] font-mono w-36 shrink-0 font-semibold", isRising ? "text-orange-400" : isFalling ? "text-muted-foreground/50" : "text-blue-400")}>
                {topic.tag}
              </span>
              <div className="flex-1 h-4 bg-muted/10 rounded-full overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all duration-700", isRising ? "bg-orange-500/50" : isFalling ? "bg-muted/30" : "bg-blue-500/30")}
                  style={{ width: `${width}%` }}
                />
              </div>
              <div className="flex items-center gap-1 w-24 justify-end">
                {isRising && <TrendingUp className="size-3 text-orange-400 shrink-0" />}
                <span className="text-[10px] font-mono text-muted-foreground">{topic.count.toLocaleString()}/hr</span>
              </div>
            </div>
          );
        })}
      </div>
      <div>
        <p className="text-[11px] text-muted-foreground mb-2">Tweet velocity (hundreds/hr) by topic</p>
        <LiveChart
          type="bar"
          data={chartData}
          dataKeys={{ x: "tag", y: "tweets" }}
          height={140}
          unit="00/hr"
        />
      </div>
      <div className="rounded border border-muted/40 p-3 text-[10px] text-muted-foreground space-y-1">
        <p className="font-semibold text-foreground/70">How Trending Works</p>
        <p>1. Tweets stream through Kafka partitioned by hashtag</p>
        <p>2. Count-min sketch tracks approximate frequency in O(1) space</p>
        <p>3. Exponential time decay weights recent activity higher than old bursts</p>
        <p>4. Top-K algorithm extracts the trending list every 30 seconds</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Social Graph FlowDiagram                                           */
/* ------------------------------------------------------------------ */
const socialGraphNodes: FlowNode[] = [
  { id: "celebrity", type: "clientNode", position: { x: 180, y: 20 }, data: { label: "@elonmusk", sublabel: "100M followers", status: "warning", handles: { bottom: true } } },
  { id: "graph-svc", type: "serverNode", position: { x: 180, y: 120 }, data: { label: "Fan-out Service", sublabel: "Reads social graph", status: "warning", metrics: [{ label: "Queue", value: "blocked" }], handles: { top: true, bottom: true } } },
  { id: "flockdb", type: "databaseNode", position: { x: 10, y: 230 }, data: { label: "FlockDB", sublabel: "100M edges to traverse", status: "unhealthy", metrics: [{ label: "Edges", value: "100M" }], handles: { top: true, bottom: true } } },
  { id: "kafka", type: "queueNode", position: { x: 350, y: 230 }, data: { label: "Kafka Queue", sublabel: "Backpressure building", status: "warning", handles: { top: true, bottom: true } } },
  { id: "cache-1", type: "cacheNode", position: { x: 10, y: 360 }, data: { label: "Redis Shard 1..N", sublabel: "100M LPUSH queued", status: "unhealthy", handles: { top: true } } },
  { id: "normal-tweets", type: "serverNode", position: { x: 350, y: 360 }, data: { label: "Normal User Tweets", sublabel: "Delayed by backlog", status: "unhealthy", handles: { top: true } } },
];

const socialGraphEdges: FlowEdge[] = [
  { id: "e1", source: "celebrity", target: "graph-svc", label: "1 tweet", animated: true },
  { id: "e2", source: "graph-svc", target: "flockdb", label: "traverse 100M edges", animated: true },
  { id: "e3", source: "flockdb", target: "cache-1", label: "100M writes", animated: true },
  { id: "e4", source: "graph-svc", target: "kafka", label: "overflows queue", animated: true },
  { id: "e5", source: "kafka", target: "normal-tweets", label: "starved", animated: true },
];

/* ================================================================== */
/*  Main Page                                                          */
/* ================================================================== */
export default function TwitterCaseStudyPage() {
  return (
    <div className="space-y-10">
      <TopicHero
        title="Twitter/X"
        subtitle="How Twitter delivers 500M tweets/day to 400M users — a deep dive into fan-out, timeline caching, and real-time trending"
        difficulty="advanced"
        estimatedMinutes={25}
      />

      <WhyCare>
        Twitter&apos;s home timeline must merge tweets from thousands of accounts you follow, rank them, and serve them in under 200ms. Here&apos;s the architecture behind the feed.
      </WhyCare>

      {/* Design it yourself */}
      <AhaMoment
        question="Before reading: how would you deliver a tweet from someone with 100M followers to every timeline in under 200ms?"
        answer={
          <div className="space-y-2">
            <p className="font-medium text-foreground">Here is what makes it hard:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>500M+ tweets per day — roughly 5,800 tweets per second</li>
              <li>400M+ MAU, each expecting a personalized feed in &lt;200ms</li>
              <li>Celebrity accounts with 100M+ followers each</li>
              <li>Trending topics must surface within minutes of a spike</li>
              <li>Snowflake IDs generated at millions per second without coordination</li>
            </ul>
            <p className="text-muted-foreground/70 italic text-sm mt-1">
              If you fan out a celebrity&apos;s tweet to every follower&apos;s cache, that is 100M Redis writes from a single tweet. At 50K writes/sec, that is 33 minutes for one worker — and it blocks everyone else.
            </p>
          </div>
        }
      />

      {/* Fan-out Comparison */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">The Fan-out Problem</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Every tweet must reach millions of timelines. The core architectural question: push tweets into every follower&apos;s <GlossaryTerm term="cache">cache</GlossaryTerm> at write time (<strong><GlossaryTerm term="fan-out">fan-out</GlossaryTerm>-on-write</strong>), or let each follower pull their feed at read time (<strong>fan-out-on-read</strong>)?
          Twitter uses a <strong>hybrid approach</strong> — fan-out-on-write for normal users, fan-out-on-read for celebrities.
        </p>
        <FanoutPlayground />
        <BeforeAfter
          before={{
            title: "Fan-out-on-Write Only",
            content: (
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>Tweet pushed to every follower&apos;s Redis cache at write time</li>
                <li>Read cost: O(1) — single LRANGE per user</li>
                <li>Write cost: O(followers) — blocks on celebrities</li>
                <li>Celebrity with 100M followers = 100M cache writes, 33 min per worker</li>
                <li className="text-red-400">Starves normal users&apos; fan-out queue</li>
              </ul>
            ),
          }}
          after={{
            title: "Hybrid (Twitter&apos;s Actual Approach)",
            content: (
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>Normal users (&lt;500K followers): fan-out-on-write</li>
                <li>Celebrities (&gt;500K followers): tweet stored once, merged on read</li>
                <li>Timeline service merges push cache + celebrity tweets at read time</li>
                <li className="text-emerald-400">Eliminates write amplification for top accounts</li>
                <li className="text-emerald-400">Total read latency still under 200ms</li>
              </ul>
            ),
          }}
        />
      </section>

      {/* Tweet Flow Simulation */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Tweet Fan-out: Step-by-Step</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          See exactly what happens inside Twitter when a tweet is posted. Switch between a normal user and a celebrity to watch the different paths.
        </p>
        <TweetFlowSim />
      </section>

      {/* Timeline Cache Architecture */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Timeline Cache Architecture</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Each user&apos;s home timeline is a <GlossaryTerm term="redis">Redis</GlossaryTerm> list of up to 800 tweet IDs — not full tweet objects. When you open the app,
          Twitter reads the list (a single LRANGE), then hydrates the IDs into full tweet objects via a batch fetch from Manhattan.
          This two-step approach keeps the cache compact at ~2.5 TB total for 400M users.
        </p>
        <div className="rounded-xl border border-border/30 bg-muted/5 overflow-hidden" style={{ minHeight: 440 }}>
          <FlowDiagram nodes={timelineCacheNodes} edges={timelineCacheEdges} minHeight={420} allowDrag={true} />
        </div>
        <div className="grid grid-cols-3 gap-3 text-[10px] font-mono text-center">
          {[
            { label: "400M users × 800 IDs × 8 bytes", value: "~2.5 TB", color: "text-orange-400" },
            { label: "Redis LRANGE latency", value: "<5ms", color: "text-emerald-400" },
            { label: "Full tweet hydration (multi-get)", value: "5-10ms", color: "text-blue-400" },
          ].map((s) => (
            <div key={s.label} className="rounded bg-muted/20 p-2">
              <p className={cn("font-bold text-base mb-0.5", s.color)}>{s.value}</p>
              <p className="text-muted-foreground/60">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <ConversationalCallout type="tip">
        Why store only tweet IDs in Redis rather than full objects? Full tweets (with user info, media URLs, engagement counts) are 2-5 KB each. Storing 800 full tweets per user for 400M users would require 640 TB to 1.6 PB of Redis memory. By storing only 8-byte IDs, the total footprint is ~2.5 TB — manageable across a Redis cluster.
      </ConversationalCallout>

      {/* Celebrity Problem — the thundering herd */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">The Celebrity Problem: Thundering Herd</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          A celebrity with 100M followers tweets once. If you use pure fan-out-on-write, the system must write that tweet ID
          to 100M Redis lists. This creates a &quot;hot node&quot; in the social graph and starves all other users&apos; fan-out.
        </p>
        <div className="rounded-xl border border-border/30 bg-muted/5 overflow-hidden" style={{ minHeight: 430 }}>
          <FlowDiagram nodes={socialGraphNodes} edges={socialGraphEdges} minHeight={420} allowDrag={true} />
        </div>
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
          <p className="text-xs font-semibold text-emerald-400 mb-2">The Solution: Hybrid Fan-out</p>
          <p className="text-[11px] text-muted-foreground">
            Celebrities are detected at write time (follower count &gt; 500K from a precomputed threshold). Their tweets skip the fan-out queue entirely — stored once in their author timeline. When any follower loads their feed, the Timeline Service merges the user&apos;s push cache with the celebrity&apos;s recent tweets at read time. This adds only 10-50ms to the read path while eliminating 100M write operations per celebrity tweet.
          </p>
        </div>
      </section>

      <ConversationalCallout type="warning">
        Retweet storms are another variant of this problem. When a viral tweet gets retweeted millions of times, each retweet can trigger its own fan-out. Twitter mitigates this by deduplicating tweet IDs in the timeline cache — if a tweet ID already exists in the Redis list, subsequent retweets of the same tweet are collapsed rather than inserted again.
      </ConversationalCallout>

      {/* Trending Topics */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Real-Time Trending Topics</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Twitter uses a streaming pipeline (<GlossaryTerm term="message queue">Kafka</GlossaryTerm> + Earlybird) to detect trending topics. A count-min sketch data structure
          tracks approximate tweet frequency per hashtag in constant memory. Exponential time decay weights recent activity higher
          than old bursts — a hashtag that peaked three hours ago does not stay trending. A top-K algorithm extracts the trending list every 30 seconds.
        </p>
        <TrendingPlayground />
      </section>

      <ConversationalCallout type="question">
        If Twitter has 400M MAU but only ~30% check their feed on any given day, that means 70% of fan-out-on-write operations go to caches nobody reads that day. This is known as &quot;write amplification to inactive users.&quot; How would you decide the optimal follower threshold (currently ~500K) for switching from push to pull? What metrics would you monitor to tune it?
      </ConversationalCallout>

      {/* Snowflake IDs */}
      <AhaMoment
        question="How does Twitter generate unique IDs for 500M+ tweets per day without a central bottleneck?"
        answer={
          <div className="space-y-2">
            <p>
              Twitter built <strong>Snowflake</strong>, a distributed ID generation service that produces unique, time-ordered 64-bit integers without coordination between workers:
            </p>
            <div className="font-mono text-xs space-y-1">
              <div className="flex gap-2">
                <span className="text-blue-400 w-20">41 bits</span>
                <span className="text-muted-foreground">Millisecond timestamp (69 years of IDs from epoch)</span>
              </div>
              <div className="flex gap-2">
                <span className="text-emerald-400 w-20">10 bits</span>
                <span className="text-muted-foreground">Machine ID (1,024 unique workers)</span>
              </div>
              <div className="flex gap-2">
                <span className="text-amber-400 w-20">12 bits</span>
                <span className="text-muted-foreground">Sequence number (4,096 IDs per ms per worker)</span>
              </div>
            </div>
            <p className="text-sm">
              Because IDs embed the timestamp, they are naturally time-sorted — no ORDER BY on timestamps needed in most timeline queries. At 5,800 tweets/sec, a single worker generates IDs with plenty of headroom before sequence wraps.
            </p>
          </div>
        }
      />

      {/* Data Storage */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Data Storage Strategy</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Twitter does not rely on a single database. Each storage technology is chosen for the access pattern it serves best.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { name: "Manhattan", desc: "In-house distributed KV store for tweets and user data. Replaced MySQL for most workloads. Eventually consistent with tunable consistency.", color: "amber" },
            { name: "Redis", desc: "Timeline caches — each user's home feed stored as a list of up to 800 tweet IDs. ~2.5 TB total across the cluster. Sub-5ms LRANGE reads.", color: "orange" },
            { name: "FlockDB", desc: "Graph database for the social follow graph. Optimized for adjacency list queries and large fan-out traversals. Sharded by user ID.", color: "blue" },
            { name: "Kafka", desc: "Real-time event streaming backbone. Tweets, engagements, and system events flow through Kafka for fan-out, analytics, and ML features.", color: "violet" },
            { name: "Earlybird", desc: "Modified Lucene for real-time tweet search. Tweets are indexed within seconds. Sharded by time for efficient recency queries.", color: "emerald" },
            { name: "Snowflake IDs", desc: "Distributed ID generation. Unique, roughly time-ordered 64-bit IDs at scale. No central bottleneck — each worker generates up to 4,096 IDs/ms.", color: "cyan" },
          ].map((store) => (
            <div
              key={store.name}
              className={cn(
                "rounded-lg border p-3 space-y-1.5",
                store.color === "amber" && "border-amber-500/20 bg-amber-500/[0.03]",
                store.color === "orange" && "border-orange-500/20 bg-orange-500/[0.03]",
                store.color === "blue" && "border-blue-500/20 bg-blue-500/[0.03]",
                store.color === "violet" && "border-violet-500/20 bg-violet-500/[0.03]",
                store.color === "emerald" && "border-emerald-500/20 bg-emerald-500/[0.03]",
                store.color === "cyan" && "border-cyan-500/20 bg-cyan-500/[0.03]"
              )}
            >
              <p className={cn(
                "text-xs font-semibold",
                store.color === "amber" && "text-amber-400",
                store.color === "orange" && "text-orange-400",
                store.color === "blue" && "text-blue-400",
                store.color === "violet" && "text-violet-400",
                store.color === "emerald" && "text-emerald-400",
                store.color === "cyan" && "text-cyan-400"
              )}>{store.name}</p>
              <p className="text-[10px] text-muted-foreground leading-relaxed">{store.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <TopicQuiz
        questions={[
          {
            question: "Why does Twitter use a hybrid fan-out strategy instead of pure fan-out-on-write?",
            options: [
              "Fan-out-on-write is too expensive for all users",
              "A celebrity with 100M followers would require 100M cache writes per tweet, blocking the fan-out queue for 33+ minutes",
              "Fan-out-on-write does not work with Redis",
              "Twitter could not afford enough servers for pure fan-out-on-write"
            ],
            correctIndex: 1,
            explanation: "At 50K writes/sec, fanning out one celebrity tweet to 100M followers takes 33 minutes per worker -- and blocks all other users' fan-out. The hybrid approach routes celebrities to fan-out-on-read (1 write), while normal users get fan-out-on-write for O(1) reads."
          },
          {
            question: "Why does Twitter store only tweet IDs (not full objects) in Redis timeline caches?",
            options: [
              "Redis cannot store complex objects",
              "Full tweets (2-5 KB each) for 400M users would require 640 TB to 1.6 PB; 8-byte IDs keep total cache at ~2.5 TB",
              "Tweet IDs load faster than full objects",
              "It is a Twitter policy requirement"
            ],
            correctIndex: 1,
            explanation: "Storing 800 full tweets per user for 400M users would require petabytes of Redis memory. By storing only 8-byte Snowflake IDs, the total footprint is ~2.5 TB. Tweet objects are hydrated via batch fetches from Manhattan at read time."
          },
          {
            question: "How does Twitter generate unique IDs at 5,800 tweets per second without a central bottleneck?",
            options: [
              "Auto-incrementing database IDs",
              "UUIDs (128-bit random strings)",
              "Snowflake IDs: 64-bit integers encoding timestamp (41 bits), machine ID (10 bits), and sequence number (12 bits)",
              "Hash of the tweet content"
            ],
            correctIndex: 2,
            explanation: "Snowflake IDs are time-ordered 64-bit integers generated without coordination. Each worker can generate 4,096 IDs per millisecond. Because IDs embed timestamps, they are naturally sorted by time -- no ORDER BY needed in timeline queries."
          }
        ]}
      />

      <KeyTakeaway
        points={[
          "Fan-out-on-write gives O(1) reads but O(followers) writes — catastrophic for celebrities with 100M+ followers.",
          "Fan-out-on-read is O(1) to write but O(following) to read — too slow when users follow thousands of accounts.",
          "Twitter&apos;s hybrid: push for normal users (<500K followers), pull for celebrities, merged at read time in <200ms.",
          "Redis timeline cache stores only 8-byte tweet IDs, not full objects — keeps total cache at ~2.5 TB for 400M users.",
          "Snowflake IDs are time-ordered 64-bit integers generated without coordination — critical at 5,800 tweets/sec.",
          "Count-min sketch with exponential time decay detects trending topics in real-time from the tweet stream.",
          "The thundering herd from celebrity tweets is solved by routing them to the pull path, bypassing 100M cache writes.",
          "Retweet storms are neutralized by deduplicating tweet IDs in the timeline cache before insertion.",
        ]}
      />
    </div>
  );
}
