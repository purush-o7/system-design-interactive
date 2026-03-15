"use client";

import { useState, useMemo } from "react";
import { TopicHero } from "@/components/topic-hero";
import { KeyTakeaway } from "@/components/key-takeaway";
import { WhyCare } from "@/components/why-care";
import { GlossaryTerm } from "@/components/glossary-term";
import { TopicQuiz } from "@/components/topic-quiz";
import { ConversationalCallout } from "@/components/conversational-callout";
import { AhaMoment } from "@/components/aha-moment";
import { Playground } from "@/components/playground";
import { LiveChart } from "@/components/live-chart";
import { cn } from "@/lib/utils";
import {
  Calculator,
  Database,
  Wifi,
  Server,
  HardDrive,
  Zap,
  TrendingUp,
  CheckCircle2,
  XCircle,
} from "lucide-react";

// --- Helpers ---

function formatNumber(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toFixed(0);
}

function formatStorage(gb: number): string {
  if (gb >= 1_000_000) return `${(gb / 1_000_000).toFixed(1)} EB`;
  if (gb >= 1_000) return `${(gb / 1_000).toFixed(1)} TB`;
  return `${gb.toFixed(0)} GB`;
}

// --- Static class maps (no dynamic interpolation) ---

const latencyColorMap: Record<string, string> = {
  emerald: "bg-emerald-500/15 border-emerald-500/30 text-emerald-400",
  blue: "bg-blue-500/15 border-blue-500/30 text-blue-400",
  amber: "bg-amber-500/15 border-amber-500/30 text-amber-400",
  red: "bg-red-500/15 border-red-500/30 text-red-400",
  purple: "bg-purple-500/15 border-purple-500/30 text-purple-400",
};

const latencySelectedMap: Record<string, string> = {
  emerald: "ring-2 ring-emerald-500/40 shadow-lg shadow-emerald-500/10",
  blue: "ring-2 ring-blue-500/40 shadow-lg shadow-blue-500/10",
  amber: "ring-2 ring-amber-500/40 shadow-lg shadow-amber-500/10",
  red: "ring-2 ring-red-500/40 shadow-lg shadow-red-500/10",
  purple: "ring-2 ring-purple-500/40 shadow-lg shadow-purple-500/10",
};

const latencyScaleBarMap: Record<string, string> = {
  emerald: "bg-emerald-500/60",
  blue: "bg-blue-500/60",
  amber: "bg-amber-500/60",
  red: "bg-red-500/60",
  purple: "bg-purple-500/60",
};

const orderBgMap: Record<string, string> = {
  correct: "bg-emerald-500/10 border-emerald-500/30",
  incorrect: "bg-red-500/10 border-red-500/30",
  neutral: "bg-muted/30 border-border/30",
};

// --- Estimation Calculator ---

function EstimationCalculator() {
  const [dau, setDau] = useState(50);
  const [reqPerUser, setReqPerUser] = useState(20);
  const [dataPerReq, setDataPerReq] = useState(2);

  const totalDaily = dau * reqPerUser * 1_000_000;
  const qps = Math.round(totalDaily / 86400);
  const peakQps = qps * 3;
  const dailyStorageGB = Math.round((totalDaily * dataPerReq) / 1_000_000);
  const monthlyStorageGB = dailyStorageGB * 30;
  const yearlyStorageGB = dailyStorageGB * 365;
  const bandwidthMBps = Math.round((peakQps * dataPerReq) / 1000);

  const storageData = useMemo(() => {
    return [1, 2, 3, 4, 5].map((year) => ({
      year: `Year ${year}`,
      storage: Math.round((yearlyStorageGB * year) / 1000),
    }));
  }, [yearlyStorageGB]);

  return (
    <Playground
      title="Estimation Calculator"
      controls={false}
      canvasHeight="min-h-0"
      hints={["Drag the sliders to see how DAU, requests per user, and data size affect QPS, storage, and bandwidth in real time."]}
      canvas={
        <div className="p-4 space-y-5">
          {/* Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium flex items-center gap-1.5">
                <Server className="size-3 text-blue-400" />
                DAU: {dau}M users
              </label>
              <input
                type="range"
                min={1}
                max={500}
                value={dau}
                onChange={(e) => setDau(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
              <div className="flex justify-between text-[9px] text-muted-foreground/50 font-mono">
                <span>1M</span><span>500M</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium flex items-center gap-1.5">
                <Zap className="size-3 text-purple-400" />
                Requests/user/day: {reqPerUser}
              </label>
              <input
                type="range"
                min={1}
                max={100}
                value={reqPerUser}
                onChange={(e) => setReqPerUser(Number(e.target.value))}
                className="w-full accent-purple-500"
              />
              <div className="flex justify-between text-[9px] text-muted-foreground/50 font-mono">
                <span>1</span><span>100</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium flex items-center gap-1.5">
                <Database className="size-3 text-emerald-400" />
                Data per request: {dataPerReq} KB
              </label>
              <input
                type="range"
                min={1}
                max={500}
                value={dataPerReq}
                onChange={(e) => setDataPerReq(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
              <div className="flex justify-between text-[9px] text-muted-foreground/50 font-mono">
                <span>1 KB</span><span>500 KB</span>
              </div>
            </div>
          </div>

          {/* Live results */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Avg QPS", value: formatNumber(qps), icon: Zap, color: "text-blue-400" },
              { label: "Peak QPS (3x)", value: formatNumber(peakQps), icon: TrendingUp, color: "text-red-400" },
              { label: "Storage/day", value: formatStorage(dailyStorageGB), icon: HardDrive, color: "text-purple-400" },
              { label: "Bandwidth", value: `${formatNumber(bandwidthMBps)} MB/s`, icon: Wifi, color: "text-emerald-400" },
            ].map((m) => (
              <div key={m.label} className="rounded-lg border border-border/30 bg-muted/20 p-3 text-center">
                <m.icon className={cn("size-4 mx-auto mb-1", m.color)} />
                <p className="text-lg font-bold font-mono">{m.value}</p>
                <p className="text-[10px] text-muted-foreground">{m.label}</p>
              </div>
            ))}
          </div>

          {/* Detail row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-border/20 bg-muted/10 p-2 text-center">
              <p className="text-xs font-mono font-bold">{formatStorage(monthlyStorageGB)}</p>
              <p className="text-[10px] text-muted-foreground">per month</p>
            </div>
            <div className="rounded-lg border border-border/20 bg-muted/10 p-2 text-center">
              <p className="text-xs font-mono font-bold">{formatStorage(yearlyStorageGB)}</p>
              <p className="text-[10px] text-muted-foreground">per year</p>
            </div>
            <div className="rounded-lg border border-border/20 bg-muted/10 p-2 text-center">
              <p className="text-xs font-mono font-bold">
                {Math.max(1, Math.ceil(peakQps / 10000))}
              </p>
              <p className="text-[10px] text-muted-foreground">servers needed</p>
            </div>
          </div>

          {/* Storage growth chart */}
          <div>
            <p className="text-xs font-medium mb-2 text-muted-foreground">
              Storage Growth Over 5 Years (TB)
            </p>
            <LiveChart
              type="area"
              data={storageData}
              dataKeys={{ x: "year", y: "storage", label: "Storage (TB)" }}
              height={180}
              unit="TB"
            />
          </div>

          {/* Contextual warnings */}
          {yearlyStorageGB > 10000 && (
            <ConversationalCallout type="warning">
              At {formatStorage(yearlyStorageGB)}/year, you need <GlossaryTerm term="sharding">sharding</GlossaryTerm>. A single database
              cannot hold this. With ~2 TB per shard, plan for{" "}
              {Math.ceil(yearlyStorageGB / 2000)} shards per year of data.
            </ConversationalCallout>
          )}
        </div>
      }
    />
  );
}

// --- Latency Numbers ---

const latencyItems = [
  { label: "L1 Cache", time: "1 ns", ns: 1, color: "emerald", humanScale: "1 second", icon: Zap },
  { label: "L2 Cache", time: "7 ns", ns: 7, color: "emerald", humanScale: "7 seconds", icon: Zap },
  { label: "RAM Access", time: "100 ns", ns: 100, color: "blue", humanScale: "1.5 minutes", icon: Server },
  { label: "SSD Read", time: "100 us", ns: 100_000, color: "amber", humanScale: "1.2 days", icon: HardDrive },
  { label: "HDD Seek", time: "10 ms", ns: 10_000_000, color: "red", humanScale: "4 months", icon: HardDrive },
  { label: "Network RTT", time: "150 ms", ns: 150_000_000, color: "purple", humanScale: "5 years", icon: Wifi },
];

function LatencyCards() {
  const [selected, setSelected] = useState(0);

  const chartData = latencyItems.map((item) => ({
    name: item.label,
    latency: Math.round(Math.log10(item.ns) * 100) / 100,
  }));

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Click a card to explore. The scale visualization below shows what these
        numbers would feel like if L1 cache access took just 1 second.
      </p>

      {/* Clickable cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {latencyItems.map((item, i) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={() => setSelected(i)}
              className={cn(
                "rounded-lg border p-3 text-left transition-all cursor-pointer",
                latencyColorMap[item.color],
                i === selected && latencySelectedMap[item.color]
              )}
            >
              <Icon className="size-4 mb-1.5 opacity-70" />
              <p className="text-[11px] font-semibold leading-tight">{item.label}</p>
              <p className="text-sm font-mono font-bold mt-1">{item.time}</p>
            </button>
          );
        })}
      </div>

      {/* Human scale comparison */}
      <div className="rounded-lg border border-border/30 bg-muted/10 p-4">
        <p className="text-xs font-medium text-muted-foreground mb-3">
          If L1 cache = 1 second, then {latencyItems[selected].label} feels like...
        </p>
        <p className="text-2xl font-bold font-mono">
          {latencyItems[selected].humanScale}
        </p>
        <div className="mt-3 space-y-1.5">
          {latencyItems.map((item, i) => {
            const barWidth = Math.max(2, Math.round((Math.log10(item.ns + 1) / Math.log10(150_000_001)) * 100));
            return (
              <div key={item.label} className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground w-16 text-right shrink-0 hidden sm:block">
                  {item.time}
                </span>
                <div className="flex-1 flex items-center gap-1.5">
                  <div
                    className={cn(
                      "h-5 rounded-sm transition-all",
                      latencyScaleBarMap[item.color],
                      i === selected ? "opacity-100" : "opacity-40"
                    )}
                    style={{ width: `${barWidth}%` }}
                  />
                  <span className={cn(
                    "text-[10px] transition-opacity",
                    i === selected ? "opacity-100 font-bold" : "opacity-50"
                  )}>
                    {item.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Log-scale bar chart */}
      <div>
        <p className="text-xs font-medium mb-2 text-muted-foreground">
          All Latencies Compared (log scale, higher = slower)
        </p>
        <LiveChart
          type="bar"
          data={chartData}
          dataKeys={{ x: "name", y: "latency", label: "Log10(ns)" }}
          height={180}
        />
      </div>
    </div>
  );
}

// --- Practice Problems ---

type PracticeId = "twitter" | "youtube";

const practiceProblems: Record<PracticeId, {
  title: string;
  icon: typeof Calculator;
  steps: { label: string; hint: string; answer: number; unit: string }[];
}> = {
  twitter: {
    title: "Estimate Twitter QPS",
    icon: Zap,
    steps: [
      { label: "Monthly Active Users (millions)", hint: "Think big social platform", answer: 500, unit: "M" },
      { label: "DAU as % of MAU", hint: "Typically 40-60%", answer: 40, unit: "%" },
      { label: "DAU (millions)", hint: "MAU x percentage", answer: 200, unit: "M" },
      { label: "Tweets per user per day", hint: "Most users tweet 1-5 times", answer: 2, unit: "" },
      { label: "Total tweets per day (millions)", hint: "DAU x tweets/user", answer: 400, unit: "M" },
      { label: "Write QPS", hint: "Daily tweets / 86,400 seconds", answer: 4600, unit: "QPS" },
      { label: "Peak write QPS (3x)", hint: "Average QPS x 3", answer: 14000, unit: "QPS" },
    ],
  },
  youtube: {
    title: "Estimate YouTube Storage",
    icon: HardDrive,
    steps: [
      { label: "Videos uploaded per minute", hint: "YouTube says 500 hours/min", answer: 500, unit: "hrs/min" },
      { label: "Average video size per hour (GB)", hint: "Compressed HD ~2-3 GB/hr", answer: 2, unit: "GB/hr" },
      { label: "Storage per minute (GB)", hint: "hours x GB per hour", answer: 1000, unit: "GB" },
      { label: "Storage per day (TB)", hint: "Per minute x 1,440 minutes", answer: 1440, unit: "TB" },
      { label: "Storage per year (PB)", hint: "Per day x 365 / 1000", answer: 525, unit: "PB" },
    ],
  },
};

function PracticeProblem({ id }: { id: PracticeId }) {
  const problem = practiceProblems[id];
  const [guesses, setGuesses] = useState<Record<number, string>>({});
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const Icon = problem.icon;

  function checkOrder(idx: number): "correct" | "incorrect" | "neutral" {
    const val = guesses[idx];
    if (!val || !revealed[idx]) return "neutral";
    const parsed = parseFloat(val);
    if (isNaN(parsed)) return "incorrect";
    const expected = problem.steps[idx].answer;
    const logDiff = Math.abs(Math.log10(parsed + 1) - Math.log10(expected + 1));
    return logDiff < 0.5 ? "correct" : "incorrect";
  }

  return (
    <div className="rounded-lg border border-border/30 bg-muted/5 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Icon className="size-4 text-violet-400" />
        <p className="text-sm font-semibold">{problem.title}</p>
      </div>
      <div className="space-y-2">
        {problem.steps.map((step, i) => {
          const status = checkOrder(i);
          return (
            <div
              key={i}
              className={cn(
                "flex items-center gap-3 rounded-md border px-3 py-2 transition-all",
                orderBgMap[status]
              )}
            >
              <span className="text-[10px] font-mono font-bold size-5 rounded bg-muted/30 flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium">{step.label}</p>
                <p className="text-[10px] text-muted-foreground">{step.hint}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <input
                  type="number"
                  placeholder="?"
                  value={guesses[i] ?? ""}
                  onChange={(e) => setGuesses((g) => ({ ...g, [i]: e.target.value }))}
                  className="w-20 text-xs font-mono bg-background/50 border border-border/40 rounded px-2 py-1 text-right"
                />
                <span className="text-[10px] text-muted-foreground w-10">{step.unit}</span>
                <button
                  onClick={() => setRevealed((r) => ({ ...r, [i]: true }))}
                  className="text-[10px] text-violet-400 hover:text-violet-300 font-medium transition-colors"
                >
                  Check
                </button>
              </div>
              {revealed[i] && (
                <div className="flex items-center gap-1 shrink-0">
                  {status === "correct" ? (
                    <CheckCircle2 className="size-4 text-emerald-400" />
                  ) : (
                    <XCircle className="size-4 text-red-400" />
                  )}
                  <span className="text-[10px] font-mono text-muted-foreground">
                    ~{formatNumber(step.answer)}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- Traffic Pattern Generator ---

function TrafficPatterns() {
  const [pattern, setPattern] = useState<"daily" | "weekly">("daily");

  const dailyData = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => {
      const baseTraffic = Math.sin(((i - 6) / 24) * Math.PI * 2) * 0.3 + 0.5;
      const peakBoost = (i >= 18 && i <= 22) ? 0.4 : 0;
      const nightDip = (i >= 0 && i <= 5) ? -0.3 : 0;
      const traffic = Math.max(0.1, baseTraffic + peakBoost + nightDip);
      return {
        time: `${i.toString().padStart(2, "0")}:00`,
        qps: Math.round(traffic * 10000),
      };
    });
    return hours;
  }, []);

  const weeklyData = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map((day, i) => {
      const isWeekend = i >= 5;
      const base = isWeekend ? 12000 : 8000;
      const variation = Math.sin((i / 7) * Math.PI) * 2000;
      return { time: day, qps: Math.round(base + variation) };
    });
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button
          onClick={() => setPattern("daily")}
          className={cn(
            "text-xs px-3 py-1 rounded-full border transition-colors",
            pattern === "daily"
              ? "bg-violet-500/20 border-violet-500/30 text-violet-400"
              : "border-border/30 text-muted-foreground hover:bg-muted/20"
          )}
        >
          Daily Pattern
        </button>
        <button
          onClick={() => setPattern("weekly")}
          className={cn(
            "text-xs px-3 py-1 rounded-full border transition-colors",
            pattern === "weekly"
              ? "bg-violet-500/20 border-violet-500/30 text-violet-400"
              : "border-border/30 text-muted-foreground hover:bg-muted/20"
          )}
        >
          Weekly Pattern
        </button>
      </div>
      <LiveChart
        type="area"
        data={pattern === "daily" ? dailyData : weeklyData}
        dataKeys={{ x: "time", y: "qps", label: "QPS" }}
        height={200}
        unit="QPS"
        referenceLines={[
          {
            y: pattern === "daily" ? 6500 : 9000,
            label: "Average",
            color: "#f59e0b",
          },
          {
            y: pattern === "daily" ? 9500 : 13000,
            label: "Peak (design for this)",
            color: "#ef4444",
          },
        ]}
      />
      <ConversationalCallout type="tip">
        {pattern === "daily"
          ? "Traffic peaks at evening hours (6-10 PM) and drops overnight. Your system must handle the peak, not the average. This is why we use the 2-3x multiplier."
          : "Weekends often have higher social media traffic but lower enterprise traffic. Know your product's pattern to set the right peak multiplier."}
      </ConversationalCallout>
    </div>
  );
}

// --- Main Page ---

export default function EstimationPage() {
  return (
    <div className="space-y-8">
      <TopicHero
        title="Back-of-Envelope Estimation"
        subtitle="The interviewer asks 'how many servers do you need?' and you freeze. Estimation is not about precision -- it is about proving you can reason about scale. Every architecture decision should be backed by numbers, even rough ones."
        difficulty="beginner"
      />

      <WhyCare>
        Interviewers don&apos;t care about exact numbers — they care that you can reason about scale. Back-of-the-envelope math is the superpower you didn&apos;t know you needed.
      </WhyCare>

      {/* Section 1: Interactive Calculator */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Calculator className="size-5 text-violet-400" />
          Estimation Calculator
        </h2>
        <p className="text-sm text-muted-foreground">
          Drag the sliders and watch every number update in real time. Notice how
          small changes in DAU produce massive changes in infrastructure needs.
          The storage chart shows the compounding effect over years — this is why <GlossaryTerm term="sharding">sharding</GlossaryTerm> and <GlossaryTerm term="horizontal scaling">horizontal scaling</GlossaryTerm> become necessary.
        </p>
        <EstimationCalculator />
      </section>

      <AhaMoment
        question="Why divide by 86,400 to get QPS?"
        answer={
          <p>
            There are 86,400 seconds in a day (24 x 60 x 60). In interviews, round
            this to 100,000 for easy mental math. So 400 million daily requests
            divided by 100,000 gives you roughly 4,000 QPS. Interviewers love
            seeing you use this shortcut -- it signals fluency with scale.
          </p>
        }
      />

      {/* Section 2: Latency Numbers */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Zap className="size-5 text-amber-400" />
          Numbers Every Engineer Should Know
        </h2>
        <LatencyCards />
      </section>

      <AhaMoment
        question="Do I need to memorize exact nanosecond values?"
        answer={
          <p>
            No. You need to know the relative scale. Memory is about 1,000x faster
            than SSD. SSD is about 100x faster than HDD. Network adds milliseconds.
            When someone asks whether to cache in memory or read from disk, these
            orders of magnitude are the answer. The human-scale analogy (L1 = 1 second
            means network = 5 years) makes these ratios intuitive and unforgettable.
          </p>
        }
      />

      {/* Section 3: Practice Problems */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Calculator className="size-5 text-emerald-400" />
          Practice Problems
        </h2>
        <p className="text-sm text-muted-foreground">
          Fill in your estimates step by step, then click Check to see if you are in
          the right order of magnitude. Being within 2-5x of the answer is considered
          a good estimate. The goal is order of magnitude, not precision.
        </p>
        <PracticeProblem id="twitter" />
        <PracticeProblem id="youtube" />
      </section>

      <ConversationalCallout type="question">
        Try this: estimate the storage needed for Instagram. 2 billion MAU, maybe
        500 million DAU, each posting 1 photo averaging 300 KB. What is the daily
        storage? What is the yearly storage? Does it change your architecture if
        users upload stories that expire in 24 hours?
      </ConversationalCallout>

      {/* Section 4: Traffic Patterns */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <TrendingUp className="size-5 text-blue-400" />
          Traffic Patterns
        </h2>
        <p className="text-sm text-muted-foreground">
          Real traffic is never flat. Toggle between daily and weekly views to see
          typical patterns. The red reference line shows where you should design your
          capacity -- at the peak, not the average. This is why <GlossaryTerm term="cache">caching</GlossaryTerm> and <GlossaryTerm term="cdn">CDNs</GlossaryTerm> are essential at scale.
        </p>
        <TrafficPatterns />
      </section>

      <AhaMoment
        question="How do I estimate when I have no idea about the numbers?"
        answer={
          <p>
            Start with anchors you know. World population is ~8 billion. The US has
            ~330 million people. Facebook has ~3 billion MAU. Instagram has ~2 billion MAU.
            From these anchors, you can estimate any social app. If the interviewer says
            &quot;a popular messaging app,&quot; say &quot;Let me assume WhatsApp scale --
            about 2 billion MAU, 500 million DAU.&quot; The interviewer will correct you
            if needed. Making an assumption is always better than freezing.
          </p>
        }
      />

      <AhaMoment
        question="Why multiply peak QPS by 2-3x instead of using the average?"
        answer={
          <p>
            Traffic is never uniform. Social media peaks at evening hours. E-commerce
            spikes during sales. If your system can only handle average load, it crashes
            during peak. The 2-3x multiplier is a heuristic for normal patterns. For
            extreme spikes (ticket sales, flash sales, Super Bowl), use 10x or more.
          </p>
        }
      />

      <TopicQuiz
        questions={[
          {
            question: "How many seconds are in a day (approximately, for estimation purposes)?",
            options: [
              "10,000",
              "50,000",
              "86,400 (round to 100,000)",
              "1,000,000"
            ],
            correctIndex: 2,
            explanation: "There are 86,400 seconds in a day (24 x 60 x 60). In interviews, round to 100,000 for easy mental math. This is the most important number for converting daily requests to QPS."
          },
          {
            question: "Why do we multiply average QPS by 2-3x when designing systems?",
            options: [
              "To account for measurement errors",
              "Because traffic peaks during certain hours and the system must handle the spike",
              "To make the numbers look more impressive",
              "Because servers only run at 50% efficiency"
            ],
            correctIndex: 1,
            explanation: "Traffic is never uniform. Social media peaks at evening hours, e-commerce spikes during sales. If your system only handles average load, it crashes during peak. The 2-3x multiplier covers normal peak patterns."
          },
          {
            question: "Which latency comparison is correct?",
            options: [
              "SSD is faster than RAM",
              "Network RTT is faster than SSD reads",
              "RAM access is about 1,000x faster than SSD reads",
              "HDD and SSD have similar latency"
            ],
            correctIndex: 2,
            explanation: "RAM access (~100ns) is about 1,000x faster than SSD reads (~100us). SSD is about 100x faster than HDD. Network adds milliseconds. These relative magnitudes drive caching and storage decisions."
          }
        ]}
      />

      <KeyTakeaway
        points={[
          "There are ~86,400 seconds in a day. Round to 100,000 for easy math. Divide daily requests by 100K to get QPS.",
          "Three things to estimate: QPS (compute), storage (disk), and bandwidth (network). These drive all infrastructure decisions.",
          "Round aggressively and use powers of 10. Order of magnitude matters, not decimal precision. 'About 10K QPS' beats '11,574 QPS.'",
          "Always calculate peak QPS (2-3x average). Design for the spike, not the average. Systems that handle only average load crash during peaks.",
          "Show your work. The interviewer cares about your reasoning chain: DAU to daily requests to QPS to servers. The process is the answer.",
          "Memory is 1,000x faster than SSD, SSD is 100x faster than HDD, network adds milliseconds. These ratios determine caching strategy.",
          "Separate reads from writes. Most systems are read-heavy (10:1 to 100:1). This determines whether you need caching, read replicas, or a CDN.",
        ]}
      />
    </div>
  );
}
