"use client";

import { useState, useEffect } from "react";
import { TopicHero } from "@/components/topic-hero";
import { FailureScenario } from "@/components/failure-scenario";
import { WhyItBreaks } from "@/components/why-it-breaks";
import { ConceptVisualizer } from "@/components/concept-visualizer";
import { CorrectApproach } from "@/components/correct-approach";
import { KeyTakeaway } from "@/components/key-takeaway";
import { AnimatedFlow } from "@/components/animated-flow";
import { ServerNode } from "@/components/server-node";
import { MetricCounter } from "@/components/metric-counter";
import { AhaMoment } from "@/components/aha-moment";
import { ConversationalCallout } from "@/components/conversational-callout";
import { BeforeAfter } from "@/components/before-after";
import { ScaleSimulator } from "@/components/scale-simulator";
import { InteractiveDemo } from "@/components/interactive-demo";
import { cn } from "@/lib/utils";
import { Users, Zap, Clock, TrendingUp, Filter, Star, ArrowRight, CheckCircle2 } from "lucide-react";

function FanoutViz() {
  const [mode, setMode] = useState<"write" | "read">("write");
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % 8), 900);
    return () => clearInterval(t);
  }, []);

  const followers = ["Alice", "Bob", "Charlie", "Diana", "Eve", "...49,995 more"];

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={() => { setMode("write"); setStep(0); }}
          className={cn(
            "text-xs px-3 py-1.5 rounded-md border transition-all",
            mode === "write"
              ? "bg-orange-500/10 border-orange-500/30 text-orange-400"
              : "bg-muted/20 border-border/50 text-muted-foreground/60 hover:text-muted-foreground"
          )}
        >
          Fanout-on-Write (Push)
        </button>
        <button
          onClick={() => { setMode("read"); setStep(0); }}
          className={cn(
            "text-xs px-3 py-1.5 rounded-md border transition-all",
            mode === "read"
              ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
              : "bg-muted/20 border-border/50 text-muted-foreground/60 hover:text-muted-foreground"
          )}
        >
          Fanout-on-Read (Pull)
        </button>
      </div>

      {mode === "write" ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className={cn(
              "rounded-lg border px-3 py-2 text-xs font-medium transition-all",
              step >= 1 ? "bg-blue-500/10 border-blue-500/30 text-blue-400" : "bg-muted/20 border-border/30"
            )}>
              @celebrity posts &quot;Hello world!&quot;
            </div>
            {step >= 2 && (
              <ArrowRight className="size-4 text-muted-foreground/30" />
            )}
            {step >= 2 && (
              <div className="text-[10px] text-orange-400 font-mono animate-pulse">
                Fanning out to 50K timelines...
              </div>
            )}
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {followers.map((f, i) => (
              <div key={f} className={cn(
                "rounded border px-2 py-1.5 text-[10px] font-mono transition-all duration-500",
                step >= 3 + Math.min(i, 3)
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : "bg-muted/10 border-border/20 text-muted-foreground/30"
              )}>
                {f}&apos;s timeline {step >= 3 + Math.min(i, 3) ? "✓" : "..."}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 text-[10px]">
            <span className="text-orange-400 font-mono">Write cost: 50,000 operations</span>
            <span className="text-muted-foreground">|</span>
            <span className="text-emerald-400 font-mono">Read cost: 1 cache lookup</span>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className={cn(
            "rounded-lg border px-3 py-2 text-xs font-medium transition-all",
            step >= 1 ? "bg-blue-500/10 border-blue-500/30 text-blue-400" : "bg-muted/20 border-border/30"
          )}>
            Alice opens her feed
          </div>
          <div className="space-y-1.5">
            {["@celebrity (50M followers)", "@friend1 (200 followers)", "@friend2 (80 followers)", "@news_account (5M followers)", "@colleague (50 followers)"].map((source, i) => (
              <div key={source} className={cn(
                "flex items-center gap-2 rounded border px-2 py-1.5 text-[10px] font-mono transition-all duration-500",
                step >= 2 + i
                  ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                  : "bg-muted/10 border-border/20 text-muted-foreground/30"
              )}>
                <span>Fetch latest from {source}</span>
                {step >= 2 + i && <span className="text-emerald-400 ml-auto">fetched</span>}
              </div>
            ))}
          </div>
          {step >= 7 && (
            <div className={cn(
              "rounded border px-2 py-1.5 text-[10px] font-mono bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
            )}>
              Merge + Sort + Rank → Display feed
            </div>
          )}
          <div className="flex items-center gap-4 text-[10px]">
            <span className="text-emerald-400 font-mono">Write cost: 1 operation</span>
            <span className="text-muted-foreground">|</span>
            <span className="text-orange-400 font-mono">Read cost: N fetches + merge</span>
          </div>
        </div>
      )}
    </div>
  );
}

function CelebrityProblemViz() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % 10), 1000);
    return () => clearInterval(t);
  }, []);

  const users = [
    { name: "Normal User", followers: 500, fanoutTime: "10ms", method: "push", color: "emerald" },
    { name: "Popular User", followers: 50000, fanoutTime: "1s", method: "push", color: "blue" },
    { name: "Celebrity", followers: 5000000, fanoutTime: "100s", method: "push → BREAKS", color: "red" },
    { name: "Celebrity (hybrid)", followers: 5000000, fanoutTime: "1 write", method: "pull on read", color: "emerald" },
  ];

  return (
    <div className="space-y-3">
      {users.map((user, i) => {
        const isActive = step >= i * 2;
        const isCurrent = step >= i * 2 && step < (i + 1) * 2;
        return (
          <div key={user.name} className={cn(
            "flex items-center gap-3 rounded-lg border p-3 transition-all duration-500",
            isCurrent
              ? user.color === "red"
                ? "bg-red-500/10 border-red-500/30 ring-1 ring-red-500/20"
                : user.color === "emerald"
                ? "bg-emerald-500/10 border-emerald-500/30 ring-1 ring-emerald-500/20"
                : "bg-blue-500/10 border-blue-500/30 ring-1 ring-blue-500/20"
              : isActive
              ? "bg-muted/20 border-border/30"
              : "bg-muted/10 border-border/20"
          )}>
            <div className="w-28">
              <p className="text-xs font-semibold">{user.name}</p>
              <p className="text-[10px] text-muted-foreground">{user.followers.toLocaleString()} followers</p>
            </div>
            <div className="flex-1">
              <div
                className={cn(
                  "h-4 rounded-full transition-all duration-700",
                  user.color === "red" ? "bg-red-500/30" :
                  user.color === "emerald" ? "bg-emerald-500/30" :
                  "bg-blue-500/30"
                )}
                style={{
                  width: isActive
                    ? user.name === "Celebrity (hybrid)" ? "2%" : `${Math.min(100, (user.followers / 5000000) * 100)}%`
                    : "0%",
                }}
              />
            </div>
            <div className="w-20 text-right">
              <p className={cn(
                "text-[10px] font-mono",
                user.color === "red" ? "text-red-400" :
                user.color === "emerald" ? "text-emerald-400" :
                "text-blue-400"
              )}>
                {user.fanoutTime}
              </p>
              <p className="text-[9px] text-muted-foreground">{user.method}</p>
            </div>
          </div>
        );
      })}
      <p className="text-[11px] text-muted-foreground/60">
        The bar represents relative fanout cost. Notice how the hybrid approach for celebrities (last row)
        has the same cost as a normal user — because it does not fan out at all.
      </p>
    </div>
  );
}

function RankingPipelineViz() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % 8), 1200);
    return () => clearInterval(t);
  }, []);

  const stages = [
    {
      label: "Candidate Retrieval",
      desc: "Pull 500 posts from push cache + celebrity pull",
      count: 500,
      icon: <Filter className="size-3.5" />,
    },
    {
      label: "First-Pass Ranking",
      desc: "Lightweight model filters to top 200",
      count: 200,
      icon: <TrendingUp className="size-3.5" />,
    },
    {
      label: "Feature Enrichment",
      desc: "Add engagement signals, social graph, content type",
      count: 200,
      icon: <Star className="size-3.5" />,
    },
    {
      label: "Deep Ranking",
      desc: "Heavy ML model scores P(engagement) for each post",
      count: 200,
      icon: <Zap className="size-3.5" />,
    },
    {
      label: "Diversity & Dedup",
      desc: "Avoid 5 posts from same author, remove near-dupes",
      count: 50,
      icon: <Users className="size-3.5" />,
    },
    {
      label: "Final Feed",
      desc: "Top 50 posts, ordered by score, ready to render",
      count: 50,
      icon: <CheckCircle2 className="size-3.5" />,
    },
  ];

  return (
    <div className="space-y-2">
      {stages.map((stage, i) => (
        <div key={stage.label} className="flex items-center gap-3">
          <div className={cn(
            "size-7 rounded-lg border flex items-center justify-center transition-all duration-300",
            step > i
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : step === i
              ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
              : "bg-muted/20 border-border/30 text-muted-foreground/30"
          )}>
            {stage.icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className={cn(
                "text-xs font-semibold transition-all",
                step >= i ? "text-foreground" : "text-muted-foreground/40"
              )}>
                {stage.label}
              </span>
              <span className={cn(
                "text-[9px] font-mono px-1.5 py-0.5 rounded-full border transition-all",
                step >= i
                  ? "bg-muted/30 border-border/50 text-muted-foreground"
                  : "border-transparent text-transparent"
              )}>
                {stage.count} posts
              </span>
            </div>
            <p className={cn(
              "text-[10px] transition-all",
              step >= i ? "text-muted-foreground/60" : "text-transparent"
            )}>
              {stage.desc}
            </p>
          </div>
          <div
            className={cn(
              "h-3 rounded-full transition-all duration-500",
              step >= i ? "bg-blue-500/20" : "bg-muted/10"
            )}
            style={{ width: `${(stage.count / 500) * 80}px` }}
          />
        </div>
      ))}
      <p className="text-[11px] text-muted-foreground/60 pt-1">
        This funnel runs in under 200ms. Twitter&apos;s ranking pipeline processes millions of candidate
        tweets per second across their inference fleet.
      </p>
    </div>
  );
}

function HybridFeedViz() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % 10), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <p className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">Push Cache (precomputed)</p>
          <div className="space-y-1">
            {["Friend's photo (2m ago)", "Colleague's link (5m ago)", "Family update (8m ago)"].map((post, i) => (
              <div key={post} className={cn(
                "rounded border px-2 py-1.5 text-[10px] transition-all duration-300",
                step >= 1 + i
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : "bg-muted/10 border-border/20 text-muted-foreground/30"
              )}>
                {post}
              </div>
            ))}
          </div>
          <p className="text-[9px] text-muted-foreground/50 font-mono">Latency: 1ms (cache read)</p>
        </div>

        <div className="space-y-2">
          <p className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider">Pull (celebrity merge)</p>
          <div className="space-y-1">
            {["@elonmusk (30s ago)", "@taylorswift (3m ago)", "@nytimes (7m ago)"].map((post, i) => (
              <div key={post} className={cn(
                "rounded border px-2 py-1.5 text-[10px] transition-all duration-300",
                step >= 4 + i
                  ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                  : "bg-muted/10 border-border/20 text-muted-foreground/30"
              )}>
                {post}
              </div>
            ))}
          </div>
          <p className="text-[9px] text-muted-foreground/50 font-mono">Latency: 10-50ms (fetch + merge)</p>
        </div>
      </div>

      {step >= 8 && (
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 space-y-1.5">
          <p className="text-[10px] font-semibold text-emerald-400">Merged & Ranked Feed</p>
          {["@elonmusk: 'Mars update...' (30s ago)", "Friend's photo (2m ago)", "@taylorswift: 'New album...' (3m ago)"].map((post) => (
            <div key={post} className="text-[10px] font-mono text-muted-foreground/80 pl-2 border-l border-emerald-500/20">
              {post}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function NewsFeedPage() {
  return (
    <div className="space-y-8">
      <TopicHero
        title="Design a News Feed"
        subtitle="A celebrity tweets and your fanout-on-write system tries to update 50 million timelines at once. Twitter solved this with a hybrid that took years to get right."
        difficulty="advanced"
      />

      <FailureScenario title="A single celebrity tweet crashes your entire feed pipeline">
        <p className="text-sm text-muted-foreground">
          You design a Twitter-like feed using fanout-on-write: when a user posts, you immediately
          push that post into every follower&apos;s precomputed timeline. Works great for 99% of users.
          Then a user with <strong>50 million followers</strong> tweets. Your fanout workers spike to
          100% CPU trying to write 50 million timeline entries. The fanout queue backs up, and
          <em> every user&apos;s</em> feed delivery stalls for minutes. One tweet from one person broke
          the entire system.
        </p>
        <div className="grid grid-cols-3 gap-3 pt-2">
          <MetricCounter label="Fanout Writes" value={50000000} trend="up" />
          <MetricCounter label="Worker CPU" value={100} unit="%" trend="up" />
          <MetricCounter label="Feed Delay" value={180} unit="sec" trend="up" />
        </div>
        <div className="flex items-center justify-center gap-4 pt-3">
          <ServerNode type="client" label="Celebrity" sublabel="1 tweet" />
          <span className="text-red-500 text-xs font-mono">50M writes →</span>
          <ServerNode type="server" label="Fanout Workers" sublabel="CPU: 100%" status="unhealthy" />
          <span className="text-red-500 text-xs font-mono">backed up →</span>
          <ServerNode type="cache" label="Timeline Cache" sublabel="stale feeds" status="warning" />
        </div>
      </FailureScenario>

      <WhyItBreaks title="Write amplification scales with follower count — unboundedly">
        <p className="text-sm text-muted-foreground">
          Fanout-on-write precomputes every user&apos;s timeline so reads are instant (single cache hit).
          But the write cost scales linearly with the poster&apos;s follower count. For a user with
          500 followers, a post costs 500 writes — done in milliseconds. For a celebrity with 50 million
          followers, the same post costs 50 million writes. At Twitter&apos;s rate of 50,000 writes per
          second per fanout worker, that takes <strong>16 minutes</strong> on a single worker. And during
          those 16 minutes, every other user&apos;s posts are stuck in the queue.
        </p>
        <div className="grid grid-cols-2 gap-2 mt-3">
          {[
            { n: "1", label: "Celebrity Amplification", desc: "1 post → 50M writes, 16+ min to complete" },
            { n: "2", label: "Queue Starvation", desc: "Normal users' posts blocked behind celebrity fanout" },
            { n: "3", label: "Memory Pressure", desc: "50M timeline cache entries need multi-GB allocation" },
            { n: "4", label: "Wasted Writes", desc: "Most followers won't check their feed today" },
          ].map((item) => (
            <div key={item.n} className="flex items-start gap-2.5 rounded-lg bg-muted/30 p-3">
              <span className="text-xs font-mono font-bold text-orange-400 bg-orange-500/10 rounded-md size-6 flex items-center justify-center shrink-0">
                {item.n}
              </span>
              <div>
                <p className="text-xs font-semibold">{item.label}</p>
                <p className="text-[11px] text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </WhyItBreaks>

      <ConceptVisualizer title="Fanout-on-Write vs Fanout-on-Read — Interactive">
        <p className="text-sm text-muted-foreground mb-4">
          These are the two fundamental approaches to building a feed. Switch between them to see
          how the cost shifts between write time and read time. Neither is universally better — the
          right choice depends on the poster&apos;s follower count.
        </p>
        <FanoutViz />
        <BeforeAfter
          before={{
            title: "Fanout-on-Write (Push)",
            content: (
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>Post pushed to all followers&apos; timelines at write time</li>
                <li>Feed reads are a single cache lookup — instant</li>
                <li>Write cost = O(follower_count) per post</li>
                <li>Works great for users with &lt;100K followers</li>
                <li>Breaks catastrophically for celebrities</li>
              </ul>
            ),
          }}
          after={{
            title: "Fanout-on-Read (Pull)",
            content: (
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>Post stored only in author&apos;s timeline</li>
                <li>Feed assembled at read time from all followees</li>
                <li>Write cost = O(1) per post</li>
                <li>Read cost = O(followee_count) merge operations</li>
                <li>Read latency grows with number of people you follow</li>
              </ul>
            ),
          }}
        />
      </ConceptVisualizer>

      <ConceptVisualizer title="The Celebrity Problem — Visualized with Real Numbers">
        <p className="text-sm text-muted-foreground mb-4">
          Twitter has reported that a single tweet from a celebrity with tens of millions of followers
          can take minutes to fan out. During that window, the fanout pipeline is saturated. Watch
          how the cost explodes as follower count grows, and how the hybrid approach fixes it:
        </p>
        <CelebrityProblemViz />
      </ConceptVisualizer>

      <CorrectApproach title="Twitter's Hybrid Architecture">
        <p className="text-sm text-muted-foreground mb-4">
          Twitter&apos;s actual architecture uses a hybrid. Normal users (under ~100K followers) use
          fanout-on-write — their posts are pushed to follower timelines. Celebrities (above the threshold)
          use fanout-on-read — their posts are stored once and merged into your timeline when you load
          it. Your feed is the union of your precomputed push cache plus a real-time merge of
          celebrity posts, all run through a ranking model.
        </p>
        <AnimatedFlow
          steps={[
            { id: "post", label: "New Post", description: "User publishes a tweet", icon: <Zap className="size-4" /> },
            { id: "check", label: "Check Threshold", description: "Followers > 100K? → celebrity path", icon: <Users className="size-4" /> },
            { id: "fanout", label: "Push (Normal)", description: "Async fanout to follower caches", icon: <ArrowRight className="size-4" /> },
            { id: "store", label: "Store (Celebrity)", description: "Write only to author's post store", icon: <Star className="size-4" /> },
            { id: "merge", label: "Merge on Read", description: "Combine push + pull at feed load time", icon: <Filter className="size-4" /> },
          ]}
          interval={1800}
        />
      </CorrectApproach>

      <ConceptVisualizer title="The Hybrid Feed Assembly — How Push + Pull Merge">
        <p className="text-sm text-muted-foreground mb-4">
          When you open your feed, two things happen in parallel: your precomputed timeline is fetched
          from the push cache (instant), and the latest posts from celebrities you follow are fetched
          and merged in (10-50ms). The result is sorted, ranked, and returned. You never notice the
          merge — it all happens in under 200ms.
        </p>
        <HybridFeedViz />
      </ConceptVisualizer>

      <ConceptVisualizer title="Feed Architecture — Full System">
        <div className="flex flex-col items-center gap-6">
          <ServerNode type="client" label="User Posts" sublabel="new tweet" />
          <ServerNode type="server" label="Feed Service" sublabel="fanout decision engine" status="healthy" />
          <div className="flex gap-4 flex-wrap justify-center">
            <ServerNode type="cloud" label="Fanout Workers" sublabel="async push (<100K followers)" status="healthy" />
            <ServerNode type="database" label="Posts Store" sublabel="all posts (write-once)" status="healthy" />
          </div>
          <div className="flex gap-4 flex-wrap justify-center">
            <ServerNode type="cache" label="Timeline Cache" sublabel="per-user precomputed feed" status="healthy" />
            <ServerNode type="cache" label="Celebrity Cache" sublabel="hot posts from high-follower users" status="healthy" />
          </div>
          <ServerNode type="server" label="Ranking Service" sublabel="ML-scored engagement prediction" status="healthy" />
          <ServerNode type="client" label="User Feed" sublabel="ranked, merged, ready" />
        </div>
      </ConceptVisualizer>

      <ConceptVisualizer title="Ranking Pipeline — From 500 Candidates to 50 Results">
        <p className="text-sm text-muted-foreground mb-4">
          Once you have the candidate posts (from push + pull), a ranking pipeline scores them.
          Twitter&apos;s pipeline processes millions of candidates per second using a multi-stage
          funnel. Each stage filters more aggressively, from lightweight heuristics to heavy ML models.
        </p>
        <RankingPipelineViz />
        <ConversationalCallout type="tip">
          The ranking model predicts P(engagement) — the probability you will like, retweet, reply,
          or click. Features include: recency, author relationship strength, content type (image vs text),
          your past engagement with similar posts, and real-time engagement velocity (is this post going
          viral right now?).
        </ConversationalCallout>
      </ConceptVisualizer>

      <ScaleSimulator
        title="Fanout Cost Simulator"
        min={100}
        max={50000000}
        step={100000}
        unit="followers"
        metrics={(v) => [
          { label: "Timeline Writes", value: v, unit: "ops" },
          { label: "Fanout Time (1 worker)", value: Math.round(v / 50000), unit: "sec" },
          { label: "Workers to <1s", value: Math.max(1, Math.ceil(v / 50000)), unit: "workers" },
          { label: "Cache Memory", value: Math.round(v * 0.0005), unit: "MB" },
          { label: "Strategy", value: v < 100000 ? 0 : 1, unit: v < 100000 ? "push" : "pull" },
          { label: "Wasted Writes (30% inactive)", value: Math.round(v * 0.3), unit: "ops" },
        ]}
      >
        {({ value }) => (
          <p className="text-xs text-muted-foreground">
            {value < 5000
              ? `At ${value.toLocaleString()} followers, fanout-on-write completes in ${Math.max(1, Math.round(value / 50000))} second. No issue.`
              : value < 100000
              ? `At ${(value / 1000).toFixed(0)}K followers, fanout takes ${Math.round(value / 50000)} seconds across a single worker. Still manageable with ${Math.ceil(value / 50000)} parallel workers.`
              : value < 1000000
              ? `At ${(value / 1000).toFixed(0)}K followers, fanout takes ${Math.round(value / 50000)} seconds. This exceeds the threshold — switch to fanout-on-read. Also, ${Math.round(value * 0.3).toLocaleString()} writes are wasted on inactive users who won't check today.`
              : `At ${(value / 1000000).toFixed(1)}M followers, fanout-on-write is catastrophic: ${Math.round(value / 50000)} seconds on one worker. The hybrid approach writes once and merges on read — saving ${value.toLocaleString()} write operations per post.`}
          </p>
        )}
      </ScaleSimulator>

      <InteractiveDemo title="Build a Feed Request">
        {({ isPlaying, tick }) => {
          const stages = [
            { name: "Auth", time: "~2ms", desc: "Validate session token, extract user_id" },
            { name: "Push", time: "~1ms", desc: "Fetch precomputed timeline from Redis (200 posts)" },
            { name: "Pull", time: "~15ms", desc: "Fetch latest from 12 followed celebrities" },
            { name: "Merge", time: "~5ms", desc: "Union push + pull candidates (500 total)" },
            { name: "Rank", time: "~50ms", desc: "ML model scores P(engagement) for each" },
            { name: "Filter", time: "~3ms", desc: "Dedup, diversity, seen-post filtering" },
            { name: "Return", time: "~2ms", desc: "Top 50 posts, serialized as JSON" },
          ];
          const active = isPlaying ? Math.min(tick % 9, stages.length) : 0;

          return (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Press play to trace a feed request from authentication through ranking to final delivery.
              </p>
              <div className="space-y-1.5">
                {stages.map((stage, i) => (
                  <div
                    key={stage.name}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border px-3 py-2 transition-all duration-400",
                      i < active
                        ? "bg-emerald-500/8 border-emerald-500/20"
                        : i === active && isPlaying
                        ? "bg-blue-500/8 border-blue-500/20 ring-1 ring-blue-500/15"
                        : "bg-muted/10 border-border/30 text-muted-foreground/40"
                    )}
                  >
                    <span className={cn(
                      "text-xs font-mono font-bold w-14",
                      i < active ? "text-emerald-400" : i === active && isPlaying ? "text-blue-400" : ""
                    )}>
                      {stage.name}
                    </span>
                    <div className="flex-1 text-xs text-muted-foreground truncate">
                      {i < active ? stage.desc : "—"}
                    </div>
                    <span className={cn(
                      "text-[10px] font-mono shrink-0",
                      i < active ? "text-muted-foreground" : "text-transparent"
                    )}>
                      {stage.time}
                    </span>
                  </div>
                ))}
              </div>
              {active >= stages.length && (
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                  <CheckCircle2 className="size-3.5" />
                  Total: ~78ms — feed feels instant to the user
                </div>
              )}
            </div>
          );
        }}
      </InteractiveDemo>

      <AhaMoment
        question="Why not just use fanout-on-read for everyone?"
        answer={
          <p>
            Because 99% of users have fewer than 1,000 followers. For them, fanout-on-write is cheaper:
            1,000 writes at post time, but reads are a single cache hit. Fanout-on-read would require
            merging posts from hundreds of followed accounts on every single feed load — and reads happen
            <strong> far more often</strong> than writes. If each user checks their feed 20 times a day
            and follows 300 accounts, that is 6,000 merge operations per user per day vs. pre-paying
            once at write time.
          </p>
        }
      />

      <ConversationalCallout type="warning">
        Cache invalidation for timelines is tricky. When a user deletes a post, you must remove it
        from potentially millions of cached timelines. Twitter handles this lazily — the deleted post
        is filtered out at read time rather than eagerly purged from every cache. This means a deleted
        tweet might appear briefly in some users&apos; feeds before the filter catches it.
      </ConversationalCallout>

      <ConversationalCallout type="tip">
        Twitter&apos;s actual celebrity threshold has been reported at different numbers over the years
        — from 5,000 to 100,000+ followers. The exact number is tuned based on infrastructure capacity.
        The key insight is that there IS a threshold, and the system dynamically chooses push vs. pull
        per user. Some implementations also consider posting frequency — a celebrity who tweets once
        a week is less disruptive than one who tweets 50 times a day.
      </ConversationalCallout>

      <KeyTakeaway
        points={[
          "Fanout-on-write gives instant reads (single cache hit) but breaks for celebrities with millions of followers.",
          "Fanout-on-read is cheap to write (O(1)) but expensive to read — merging N followees' posts per feed load.",
          "The hybrid approach is what Twitter actually uses: push for normal users, pull for celebrities, merge at read time.",
          "The celebrity threshold (typically 100K followers) dynamically routes posts to push or pull paths.",
          "Feed ranking is a multi-stage ML pipeline: candidate retrieval → lightweight scoring → deep ranking → diversity filtering.",
          "Handle post deletions lazily — filter at read time rather than purging millions of caches.",
          "30% of fanout writes are wasted on users who won't check their feed that day — the hybrid approach avoids this for celebrities.",
        ]}
      />
    </div>
  );
}
