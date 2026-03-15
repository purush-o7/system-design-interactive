"use client";

import { useState, useMemo, useCallback } from "react";
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
import { ArrowRight, Users, Zap, Star, Filter, TrendingUp, GripVertical } from "lucide-react";

// ─── Fanout Comparison FlowDiagram ──────────────────────────────────────────

function useFanoutNodes(mode: "push" | "pull", step: number) {
  return useMemo(() => {
    const active = (s: number): "healthy" | "idle" => (step >= s ? "healthy" : "idle");
    const highlight = (s: number): "healthy" | "warning" | "idle" =>
      step === s ? "warning" : step > s ? "healthy" : "idle";

    if (mode === "push") {
      const nodes: FlowNode[] = [
        {
          id: "poster", type: "clientNode",
          position: { x: 20, y: 120 },
          data: { label: "User Posts", sublabel: "1 new tweet", status: active(0), handles: { right: true } },
        },
        {
          id: "service", type: "serverNode",
          position: { x: 200, y: 120 },
          data: { label: "Feed Service", sublabel: "Fanout engine", status: highlight(1), handles: { left: true, right: true } },
        },
        {
          id: "queue", type: "queueNode",
          position: { x: 400, y: 120 },
          data: { label: "Fanout Queue", sublabel: "50K write jobs", status: highlight(2), handles: { left: true, right: true } },
        },
        {
          id: "cache1", type: "cacheNode",
          position: { x: 620, y: 30 },
          data: { label: "Alice Cache", sublabel: step >= 3 ? "Updated" : "Waiting", status: active(3), handles: { left: true } },
        },
        {
          id: "cache2", type: "cacheNode",
          position: { x: 620, y: 120 },
          data: { label: "Bob Cache", sublabel: step >= 4 ? "Updated" : "Waiting", status: active(4), handles: { left: true } },
        },
        {
          id: "cache3", type: "cacheNode",
          position: { x: 620, y: 210 },
          data: { label: "...49,998 more", sublabel: step >= 5 ? "Updating..." : "Waiting", status: active(5), handles: { left: true } },
        },
      ];
      const edges: FlowEdge[] = [
        { id: "e1", source: "poster", target: "service", animated: step >= 1 },
        { id: "e2", source: "service", target: "queue", animated: step >= 2 },
        { id: "e3", source: "queue", target: "cache1", animated: step >= 3 },
        { id: "e4", source: "queue", target: "cache2", animated: step >= 4 },
        { id: "e5", source: "queue", target: "cache3", animated: step >= 5 },
      ];
      return { nodes, edges };
    }

    // pull mode
    const nodes: FlowNode[] = [
      {
        id: "reader", type: "clientNode",
        position: { x: 20, y: 120 },
        data: { label: "Alice Opens Feed", sublabel: "GET /feed", status: active(0), handles: { right: true } },
      },
      {
        id: "service", type: "serverNode",
        position: { x: 220, y: 120 },
        data: { label: "Feed Service", sublabel: "Merge engine", status: highlight(1), handles: { left: true, right: true } },
      },
      {
        id: "db1", type: "databaseNode",
        position: { x: 460, y: 20 },
        data: { label: "@celebrity", sublabel: "50M followers", status: active(2), handles: { left: true } },
      },
      {
        id: "db2", type: "databaseNode",
        position: { x: 460, y: 120 },
        data: { label: "@friend1", sublabel: "200 followers", status: active(3), handles: { left: true } },
      },
      {
        id: "db3", type: "databaseNode",
        position: { x: 460, y: 220 },
        data: { label: "@colleague", sublabel: "50 followers", status: active(4), handles: { left: true } },
      },
    ];
    const edges: FlowEdge[] = [
      { id: "e1", source: "reader", target: "service", animated: step >= 1 },
      { id: "e2", source: "service", target: "db1", animated: step >= 2 },
      { id: "e3", source: "service", target: "db2", animated: step >= 3 },
      { id: "e4", source: "service", target: "db3", animated: step >= 4 },
    ];
    return { nodes, edges };
  }, [mode, step]);
}

function FanoutPlayground() {
  const [mode, setMode] = useState<"push" | "pull">("push");
  const sim = useSimulation({ maxSteps: 6, intervalMs: 900 });
  const { nodes, edges } = useFanoutNodes(mode, sim.step);

  const handleModeSwitch = useCallback((m: "push" | "pull") => {
    setMode(m);
    sim.reset();
  }, [sim]);

  return (
    <Playground
      title="Fanout-on-Write vs Fanout-on-Read"
      simulation={sim}
      hints={["Toggle between Push and Pull modes, then press play to compare write vs read costs"]}
      canvas={
        <div className="h-full flex flex-col">
          <div className="flex gap-2 p-3 border-b border-violet-500/10">
            <button
              onClick={() => handleModeSwitch("push")}
              className={cn(
                "text-xs px-3 py-1.5 rounded-md border transition-all",
                mode === "push"
                  ? "bg-orange-500/10 border-orange-500/30 text-orange-400"
                  : "bg-muted/20 border-border/50 text-muted-foreground/60 hover:text-muted-foreground"
              )}
            >
              Push (Fan-out-on-Write)
            </button>
            <button
              onClick={() => handleModeSwitch("pull")}
              className={cn(
                "text-xs px-3 py-1.5 rounded-md border transition-all",
                mode === "pull"
                  ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                  : "bg-muted/20 border-border/50 text-muted-foreground/60 hover:text-muted-foreground"
              )}
            >
              Pull (Fan-out-on-Read)
            </button>
          </div>
          <div className="flex-1">
            <FlowDiagram nodes={nodes} edges={edges} minHeight={280} />
          </div>
        </div>
      }
      explanation={(state) => {
        if (mode === "push") {
          const explanations = [
            "A user publishes a new tweet. The system must deliver it to all followers.",
            "The Feed Service receives the post and begins the fanout process.",
            "The post is queued for async delivery to every follower's timeline cache.",
            "Alice's cached timeline is updated with the new post.",
            "Bob's cached timeline is updated next.",
            "The remaining 49,998 followers are being updated one by one. This takes time.",
            "All done! Write cost: 50,000 cache operations. But reads are instant - just one cache lookup per user.",
          ];
          return (
            <div className="space-y-3">
              <p>{explanations[Math.min(state.step, explanations.length - 1)]}</p>
              <div className="space-y-1 text-xs font-mono">
                <p className="text-orange-400">Write cost: O(followers) = 50,000 ops</p>
                <p className="text-emerald-400">Read cost: O(1) = 1 cache lookup</p>
              </div>
            </div>
          );
        }
        const explanations = [
          "Alice opens her feed. Nothing is precomputed - the system must assemble it now.",
          "The Feed Service starts pulling recent posts from every account Alice follows.",
          "Fetching latest posts from @celebrity (50M followers, but that does not affect us).",
          "Fetching latest posts from @friend1.",
          "Fetching latest posts from @colleague. All fetches run in parallel in practice.",
          "All sources fetched. Now merge, sort by time, rank, and return the feed.",
        ];
        return (
          <div className="space-y-3">
            <p>{explanations[Math.min(state.step, explanations.length - 1)]}</p>
            <div className="space-y-1 text-xs font-mono">
              <p className="text-emerald-400">Write cost: O(1) = 1 database insert</p>
              <p className="text-orange-400">Read cost: O(followees) = N fetches + merge</p>
            </div>
          </div>
        );
      }}
    />
  );
}

// ─── Celebrity Problem Demo ─────────────────────────────────────────────────

const CELEBRITY_DATA = [
  { user: "Normal (500)", followers: 500, time: 0.01, strategy: "Push" },
  { user: "Popular (50K)", followers: 50000, time: 1, strategy: "Push" },
  { user: "Celebrity (5M)", followers: 5000000, time: 100, strategy: "Push" },
  { user: "Mega-star (50M)", followers: 50000000, time: 1000, strategy: "Push" },
];

const HYBRID_DATA = [
  { user: "Normal (500)", followers: 500, time: 0.01, strategy: "Push" },
  { user: "Popular (50K)", followers: 50000, time: 1, strategy: "Push" },
  { user: "Celebrity (5M)", followers: 5000000, time: 0.001, strategy: "Pull" },
  { user: "Mega-star (50M)", followers: 50000000, time: 0.001, strategy: "Pull" },
];

function CelebrityProblemDemo() {
  const [showHybrid, setShowHybrid] = useState(false);
  const data = showHybrid ? HYBRID_DATA : CELEBRITY_DATA;

  const chartData = data.map((d) => ({
    name: d.user,
    writeTime: d.time,
    strategy: d.strategy,
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h3 className="text-lg font-bold">The Celebrity Problem</h3>
        <button
          onClick={() => setShowHybrid(!showHybrid)}
          className={cn(
            "text-xs px-3 py-1.5 rounded-md border transition-all",
            showHybrid
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-red-500/10 border-red-500/30 text-red-400"
          )}
        >
          {showHybrid ? "Hybrid Fix Applied" : "Show Pure Push (Broken)"}
        </button>
      </div>
      <p className="text-sm text-muted-foreground">
        When a celebrity with 10M+ followers posts, fanout-on-write tries to update millions of
        timelines. At 50K writes/sec per worker, a single 50M-follower post takes
        <strong> 16 minutes</strong> on one worker. Toggle to see how the hybrid approach fixes this.
      </p>
      <LiveChart
        type="bar"
        data={chartData}
        dataKeys={{ x: "name", y: "writeTime", label: "Fanout Time (sec)" }}
        height={220}
        unit="sec"
        referenceLines={[
          { y: 1, label: "Acceptable limit (1s)", color: "#f59e0b" },
        ]}
      />
      <div className="grid grid-cols-2 gap-3">
        {data.map((d) => (
          <div
            key={d.user}
            className={cn(
              "rounded-lg border p-3 text-xs space-y-1",
              d.strategy === "Pull"
                ? "bg-emerald-500/5 border-emerald-500/20"
                : d.time > 1
                ? "bg-red-500/5 border-red-500/20"
                : "bg-muted/30 border-border/30"
            )}
          >
            <p className="font-semibold">{d.user}</p>
            <p className="text-muted-foreground">
              {d.followers.toLocaleString()} followers
              <span className="mx-1">|</span>
              <span className={cn(
                "font-mono",
                d.strategy === "Pull" ? "text-emerald-400" : d.time > 1 ? "text-red-400" : "text-muted-foreground"
              )}>
                {d.time >= 1 ? `${d.time}s` : `${d.time * 1000}ms`}
              </span>
              <span className="mx-1">|</span>
              <span className={d.strategy === "Pull" ? "text-emerald-400" : ""}>{d.strategy}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Feed Ranking Playground ────────────────────────────────────────────────

type FeedPost = {
  id: number;
  author: string;
  text: string;
  recency: number;
  engagement: number;
  relationship: number;
  score: number;
};

const SAMPLE_POSTS: FeedPost[] = [
  { id: 1, author: "@bestfriend", text: "Just got promoted!", recency: 9, engagement: 3, relationship: 10, score: 0 },
  { id: 2, author: "@elonmusk", text: "Mars update: first greenhouse built", recency: 7, engagement: 10, relationship: 1, score: 0 },
  { id: 3, author: "@colleague", text: "Great talk at the conference", recency: 5, engagement: 2, relationship: 7, score: 0 },
  { id: 4, author: "@news_daily", text: "Breaking: major policy change", recency: 10, engagement: 8, relationship: 2, score: 0 },
  { id: 5, author: "@college_pal", text: "Throwback to our road trip", recency: 3, engagement: 4, relationship: 6, score: 0 },
  { id: 6, author: "@techblog", text: "Why Rust is eating the world", recency: 6, engagement: 6, relationship: 3, score: 0 },
];

function FeedRankingPlayground() {
  const [weights, setWeights] = useState({ recency: 0.3, engagement: 0.4, relationship: 0.3 });

  const rankedPosts = useMemo(() => {
    return SAMPLE_POSTS
      .map((p) => ({
        ...p,
        score: Math.round(
          (p.recency * weights.recency + p.engagement * weights.engagement + p.relationship * weights.relationship) * 100
        ) / 100,
      }))
      .sort((a, b) => b.score - a.score);
  }, [weights]);

  return (
    <Playground
      title="Feed Ranking Playground"
      controls={false}
      hints={["Drag the sliders to adjust recency, engagement, and relationship weights — watch posts re-rank in real time"]}
      canvas={
        <div className="p-4 space-y-2">
          {rankedPosts.map((post, i) => (
            <div
              key={post.id}
              className={cn(
                "flex items-center gap-3 rounded-lg border p-3 transition-all duration-300",
                i === 0
                  ? "bg-emerald-500/5 border-emerald-500/20"
                  : "bg-muted/10 border-border/30"
              )}
            >
              <span className="text-xs font-mono font-bold text-muted-foreground w-5">
                #{i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate">{post.author}</p>
                <p className="text-xs text-muted-foreground truncate">{post.text}</p>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono shrink-0">
                <span className="text-blue-400" title="Recency">R:{post.recency}</span>
                <span className="text-orange-400" title="Engagement">E:{post.engagement}</span>
                <span className="text-violet-400" title="Relationship">S:{post.relationship}</span>
              </div>
              <span className={cn(
                "text-xs font-mono font-bold px-2 py-0.5 rounded-full",
                i === 0
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-muted/30 text-muted-foreground"
              )}>
                {post.score.toFixed(1)}
              </span>
            </div>
          ))}
        </div>
      }
      explanation={
        <div className="space-y-4">
          <p className="text-sm font-semibold">Adjust ranking weights</p>
          <p className="text-xs text-muted-foreground">
            Drag the sliders to change how recency, engagement, and social relationship
            affect the final feed order. Watch the posts re-rank in real time.
          </p>
          {([
            { key: "recency" as const, label: "Recency", color: "text-blue-400", desc: "How recent is the post?" },
            { key: "engagement" as const, label: "Engagement", color: "text-orange-400", desc: "Likes, retweets, replies" },
            { key: "relationship" as const, label: "Relationship", color: "text-violet-400", desc: "How close is the author?" },
          ]).map(({ key, label, color, desc }) => (
            <div key={key} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className={cn("text-xs font-semibold", color)}>{label}</span>
                <span className="text-xs font-mono text-muted-foreground">
                  {(weights[key] * 100).toFixed(0)}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={weights[key] * 100}
                onChange={(e) => setWeights((w) => ({ ...w, [key]: Number(e.target.value) / 100 }))}
                className="w-full h-1.5 rounded-full accent-violet-500 cursor-pointer"
              />
              <p className="text-[10px] text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      }
    />
  );
}

// ─── Full Architecture FlowDiagram ──────────────────────────────────────────

function useArchitectureNodes(step: number) {
  return useMemo(() => {
    const active = (s: number): "healthy" | "idle" => (step >= s ? "healthy" : "idle");

    const nodes: FlowNode[] = [
      {
        id: "client", type: "clientNode",
        position: { x: 20, y: 150 },
        data: { label: "User", sublabel: "Posts a tweet", status: active(0), handles: { right: true } },
      },
      {
        id: "gateway", type: "gatewayNode",
        position: { x: 180, y: 150 },
        data: { label: "API Gateway", sublabel: "Auth + rate limit", status: active(1), handles: { left: true, right: true } },
      },
      {
        id: "feedsvc", type: "serverNode",
        position: { x: 370, y: 150 },
        data: { label: "Feed Service", sublabel: "Push/Pull router", status: active(2), handles: { left: true, right: true, bottom: true } },
      },
      {
        id: "fanout", type: "queueNode",
        position: { x: 580, y: 60 },
        data: { label: "Fanout Workers", sublabel: "Async push (<100K)", status: active(3), handles: { left: true, right: true } },
      },
      {
        id: "postdb", type: "databaseNode",
        position: { x: 580, y: 240 },
        data: { label: "Post Store", sublabel: "All posts (write-once)", status: active(2), handles: { left: true, right: true } },
      },
      {
        id: "timeline", type: "cacheNode",
        position: { x: 780, y: 60 },
        data: { label: "Timeline Cache", sublabel: "Per-user feed", status: active(4), handles: { left: true } },
      },
      {
        id: "celeb", type: "cacheNode",
        position: { x: 780, y: 160 },
        data: { label: "Celebrity Cache", sublabel: "Hot posts (pull)", status: active(3), handles: { left: true } },
      },
      {
        id: "ranker", type: "serverNode",
        position: { x: 780, y: 260 },
        data: { label: "Ranking Service", sublabel: "ML scoring", status: active(5), handles: { left: true } },
      },
    ];

    const edges: FlowEdge[] = [
      { id: "e1", source: "client", target: "gateway", animated: step >= 1 },
      { id: "e2", source: "gateway", target: "feedsvc", animated: step >= 2 },
      { id: "e3", source: "feedsvc", target: "fanout", animated: step >= 3 },
      { id: "e4", source: "feedsvc", target: "postdb", animated: step >= 2 },
      { id: "e5", source: "fanout", target: "timeline", animated: step >= 4 },
      { id: "e6", source: "postdb", target: "celeb", animated: step >= 3 },
      { id: "e7", source: "postdb", target: "ranker", animated: step >= 5 },
    ];

    return { nodes, edges };
  }, [step]);
}

function ArchitecturePlayground() {
  const sim = useSimulation({ maxSteps: 6, intervalMs: 1200 });
  const { nodes, edges } = useArchitectureNodes(sim.step);

  return (
    <Playground
      title="Full Hybrid Feed Architecture"
      simulation={sim}
      canvasHeight="min-h-[380px]"
      hints={["Press play to follow a tweet through the full hybrid push/pull architecture"]}
      canvas={<FlowDiagram nodes={nodes} edges={edges} minHeight={380} />}
      explanation={(state) => {
        const explanations = [
          "A user is about to post a tweet. The request will flow through the entire system.",
          "The API Gateway authenticates the user and applies rate limiting.",
          "The Feed Service receives the post and writes it to the Post Store. It then checks the poster's follower count to decide: push or pull?",
          "For normal users (<100K followers): posts are queued for async fanout. For celebrities: the post is stored in the Celebrity Cache for pull-on-read.",
          "Fanout workers push the post into each follower's Timeline Cache. This is the precomputed feed.",
          "When a reader opens their feed, the Ranking Service merges timeline cache + celebrity cache, applies ML scoring, and returns the top 50 posts.",
          "The full pipeline completes in under 200ms for the reader. Writers with <100K followers see near-instant delivery.",
        ];
        return <p>{explanations[Math.min(state.step, explanations.length - 1)]}</p>;
      }}
    />
  );
}

// ─── Write Amplification Chart ──────────────────────────────────────────────

const WRITE_AMP_DATA = [
  { followers: "100", push: 100, hybrid: 100 },
  { followers: "1K", push: 1000, hybrid: 1000 },
  { followers: "10K", push: 10000, hybrid: 10000 },
  { followers: "100K", push: 100000, hybrid: 1 },
  { followers: "1M", push: 1000000, hybrid: 1 },
  { followers: "10M", push: 10000000, hybrid: 1 },
  { followers: "50M", push: 50000000, hybrid: 1 },
];

// ─── Page ───────────────────────────────────────────────────────────────────

export default function NewsFeedPage() {
  return (
    <div className="space-y-8">
      <TopicHero
        title="Design a News Feed"
        subtitle="A celebrity tweets and 50 million timelines need updating. Twitter solved this with a hybrid push/pull architecture that took years to perfect."
        difficulty="advanced"
      />

      <WhyCare>
        When Taylor Swift tweets, 92 million followers need to see it instantly. Designing a news feed at scale is one of the hardest problems in tech.
      </WhyCare>

      <p className="text-sm text-muted-foreground">
        News feed design revolves around the <GlossaryTerm term="fan-out">fan-out</GlossaryTerm> problem: when a user posts, how do you update millions of timelines? A <GlossaryTerm term="cache">cache</GlossaryTerm> stores precomputed feeds, while a <GlossaryTerm term="message queue">message queue</GlossaryTerm> handles async delivery. The hybrid approach uses fan-out-on-write for normal users and fan-out-on-read for celebrities to manage <GlossaryTerm term="throughput">throughput</GlossaryTerm>.
      </p>

      {/* ── Fanout Comparison ─────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">Two Approaches to Feed Delivery</h2>
        <p className="text-sm text-muted-foreground">
          Every feed system must choose: precompute timelines at write time (push), or assemble
          them at read time (pull). Neither is universally better. Step through each approach
          to see the cost tradeoff.
        </p>
        <FanoutPlayground />

        <BeforeAfter
          before={{
            title: "Fanout-on-Write (Push)",
            content: (
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>Post pushed to all followers&apos; timelines at write time</li>
                <li>Feed reads are a single cache lookup -- instant</li>
                <li>Write cost = O(follower_count) per post</li>
                <li>Works great for users with fewer than 100K followers</li>
                <li>Breaks catastrophically for celebrities</li>
              </ul>
            ),
          }}
          after={{
            title: "Fanout-on-Read (Pull)",
            content: (
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>Post stored only in the author&apos;s post table</li>
                <li>Feed assembled at read time from all followees</li>
                <li>Write cost = O(1) per post</li>
                <li>Read cost = O(followee_count) merge operations</li>
                <li>Read latency grows with number of accounts you follow</li>
              </ul>
            ),
          }}
        />
      </section>

      {/* ── Celebrity Problem ─────────────────────────────────────── */}
      <section className="space-y-4">
        <CelebrityProblemDemo />

        <ConversationalCallout type="warning">
          At Twitter, a single tweet from a celebrity with 50M followers can trigger 50 million
          cache writes. At 50K writes/sec, that is 16+ minutes on one worker -- during which
          every other user&apos;s posts are stuck in the fanout queue. One tweet, entire system stalled.
        </ConversationalCallout>
      </section>

      <AhaMoment
        question="Why not just use fanout-on-read for everyone?"
        answer={
          <p>
            Because 99% of users have fewer than 1,000 followers. For them, fanout-on-write is cheaper:
            1,000 writes at post time, but reads are a single cache hit. If each user checks their feed
            20 times a day and follows 300 accounts, fanout-on-read would mean 6,000 merge operations
            per user per day -- vs. pre-paying once at write time. Reads happen <strong>far more
            often</strong> than writes.
          </p>
        }
      />

      {/* ── Feed Ranking ──────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">Feed Ranking: From Candidates to Your Screen</h2>
        <p className="text-sm text-muted-foreground">
          Once you have candidate posts (from push + pull), a ranking model scores them.
          The model predicts P(engagement) -- the probability you will like, retweet, or reply.
          Adjust the weights below to see how different ranking priorities change the feed order.
        </p>
        <FeedRankingPlayground />

        <ConversationalCallout type="tip">
          Real ranking models use hundreds of features: recency, author relationship strength,
          content type (image vs text), your past engagement with similar posts, and real-time
          engagement velocity (is this post going viral right now?). The playground above simplifies
          this to three core dimensions.
        </ConversationalCallout>
      </section>

      {/* ── Full Architecture ─────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">Twitter&apos;s Hybrid Architecture</h2>
        <p className="text-sm text-muted-foreground">
          The real solution is a hybrid: push for normal users (under 100K followers), pull for
          celebrities. Your feed is the union of your precomputed push cache plus a real-time merge
          of celebrity posts, all run through a ranking model. Step through to see each component.
        </p>
        <ArchitecturePlayground />
      </section>

      {/* ── Write Amplification Chart ─────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">Write Amplification: Push vs Hybrid</h2>
        <p className="text-sm text-muted-foreground">
          This chart shows why the hybrid approach matters. Pure push scales linearly with followers --
          a 50M-follower user triggers 50M writes. The hybrid approach caps write amplification
          at the celebrity threshold (100K followers), switching to pull above that.
        </p>
        <LiveChart
          type="bar"
          data={WRITE_AMP_DATA}
          dataKeys={{
            x: "followers",
            y: ["push", "hybrid"],
            label: ["Pure Push (writes)", "Hybrid (writes)"],
          }}
          height={260}
          unit="ops"
          referenceLines={[
            { y: 100000, label: "Celebrity threshold (100K)", color: "#f59e0b" },
          ]}
        />

        <ConversationalCallout type="question">
          What happens when a celebrity deletes a tweet? In pure push, you would need to remove it from
          millions of cached timelines. Twitter handles this lazily -- deleted posts are filtered
          at read time rather than eagerly purged from every cache. A deleted tweet might briefly
          appear before the filter catches it.
        </ConversationalCallout>
      </section>

      <AhaMoment
        question="How does the system decide who is a 'celebrity'?"
        answer={
          <p>
            Twitter&apos;s threshold has shifted over the years -- from 5,000 to 100K+ followers. The exact
            number is tuned based on infrastructure capacity. Some implementations also factor in posting
            frequency: a celebrity who tweets once a week is far less disruptive than one who tweets
            50 times a day. The key insight is that there IS a threshold, and the system dynamically
            routes each user&apos;s posts to push or pull based on it.
          </p>
        }
      />

      <TopicQuiz
        questions={[
          {
            question: "Why does Twitter use a hybrid push/pull approach instead of pure fan-out-on-write?",
            options: [
              "Fan-out-on-write is more expensive per request than fan-out-on-read",
              "A single celebrity post with 50M followers would trigger 50M cache writes, stalling the entire system",
              "Fan-out-on-read is always faster than fan-out-on-write",
              "Twitter's database does not support write operations at scale"
            ],
            correctIndex: 1,
            explanation: "At 50K writes/sec per worker, a single tweet from a 50M-follower celebrity takes 16+ minutes to fan out, blocking all other posts in the queue. The hybrid approach routes celebrities to pull-on-read, avoiding this bottleneck."
          },
          {
            question: "In a feed ranking system, what does the ML model primarily predict?",
            options: [
              "The age of the post",
              "The number of followers the author has",
              "P(engagement) — the probability you will like, retweet, or reply",
              "The geographic distance between author and reader"
            ],
            correctIndex: 2,
            explanation: "Feed ranking models predict P(engagement) — how likely you are to interact with a post. They use hundreds of features including recency, author relationship, content type, and real-time engagement velocity."
          },
          {
            question: "What percentage of fan-out writes are typically wasted on users who never check their feed?",
            options: [
              "5%",
              "15%",
              "30%",
              "50%"
            ],
            correctIndex: 2,
            explanation: "About 30% of fan-out writes go to users who will not check their feed that day. The hybrid approach avoids this waste for the most expensive accounts (celebrities with millions of followers)."
          }
        ]}
      />

      <KeyTakeaway
        points={[
          "Fanout-on-write gives instant reads (1 cache hit) but write cost scales linearly with followers -- catastrophic for celebrities.",
          "Fanout-on-read is O(1) to write but O(followees) to read, requiring merge of all followed accounts per feed load.",
          "Twitter uses a hybrid: push for normal users (<100K followers), pull for celebrities, merged at read time.",
          "Feed ranking is a multi-stage ML pipeline: candidate retrieval, lightweight scoring, deep ranking, diversity filtering -- all under 200ms.",
          "30% of fanout writes are wasted on users who will not check their feed that day. The hybrid approach avoids this for the costliest accounts.",
          "Handle post deletions lazily: filter at read time rather than purging millions of cached timelines.",
        ]}
      />
    </div>
  );
}
