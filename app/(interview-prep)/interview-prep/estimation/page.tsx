"use client";

import { useState, useEffect } from "react";
import { TopicHero } from "@/components/topic-hero";
import { FailureScenario } from "@/components/failure-scenario";
import { WhyItBreaks } from "@/components/why-it-breaks";
import { ConceptVisualizer } from "@/components/concept-visualizer";
import { CorrectApproach } from "@/components/correct-approach";
import { KeyTakeaway } from "@/components/key-takeaway";
import { MetricCounter } from "@/components/metric-counter";
import { InteractiveDemo } from "@/components/interactive-demo";
import { ConversationalCallout } from "@/components/conversational-callout";
import { AhaMoment } from "@/components/aha-moment";
import { BeforeAfter } from "@/components/before-after";
import { cn } from "@/lib/utils";
import { Calculator, Database, Wifi, Server, HardDrive, Zap, ArrowRight, TrendingUp } from "lucide-react";

function PowersOfTwoTable() {
  const [highlighted, setHighlighted] = useState(-1);
  useEffect(() => {
    const t = setInterval(() => setHighlighted((h) => (h + 1) % 6), 1500);
    return () => clearInterval(t);
  }, []);

  const rows = [
    { power: 10, approx: "1 Thousand", bytes: "1 KB", example: "A short email" },
    { power: 20, approx: "1 Million", bytes: "1 MB", example: "A small photo" },
    { power: 30, approx: "1 Billion", bytes: "1 GB", example: "A movie" },
    { power: 40, approx: "1 Trillion", bytes: "1 TB", example: "A large database" },
    { power: 50, approx: "1 Quadrillion", bytes: "1 PB", example: "Netflix catalog" },
    { power: 60, approx: "1 Quintillion", bytes: "1 EB", example: "All data on Earth (yearly)" },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border/30">
            <th className="text-left py-2 px-3 font-semibold text-muted-foreground/70">Power</th>
            <th className="text-left py-2 px-3 font-semibold text-muted-foreground/70">Approx Value</th>
            <th className="text-left py-2 px-3 font-semibold text-muted-foreground/70">Bytes</th>
            <th className="text-left py-2 px-3 font-semibold text-muted-foreground/70">Real-World</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.power}
              className={cn(
                "border-b border-border/10 transition-all duration-300",
                i === highlighted
                  ? "bg-blue-500/10"
                  : "hover:bg-muted/10"
              )}
            >
              <td className="py-2 px-3">
                <span className="font-mono font-bold">2<sup>{row.power}</sup></span>
              </td>
              <td className="py-2 px-3 font-mono text-muted-foreground">{row.approx}</td>
              <td className={cn(
                "py-2 px-3 font-mono font-bold transition-all",
                i === highlighted ? "text-blue-400" : ""
              )}>
                {row.bytes}
              </td>
              <td className="py-2 px-3 text-muted-foreground italic">{row.example}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LatencyNumbersViz() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % 9), 1200);
    return () => clearInterval(t);
  }, []);

  const latencies = [
    { label: "L1 cache ref", time: "0.5 ns", bar: 1, color: "emerald" },
    { label: "L2 cache ref", time: "7 ns", bar: 3, color: "emerald" },
    { label: "Main memory ref", time: "100 ns", bar: 8, color: "blue" },
    { label: "SSD random read", time: "150 us", bar: 20, color: "blue" },
    { label: "HDD seek", time: "10 ms", bar: 40, color: "purple" },
    { label: "Same datacenter roundtrip", time: "0.5 ms", bar: 30, color: "purple" },
    { label: "CA to Netherlands", time: "150 ms", bar: 70, color: "orange" },
    { label: "HDD sequential read 1MB", time: "20 ms", bar: 50, color: "red" },
  ];

  return (
    <div className="space-y-1.5">
      {latencies.map((l, i) => (
        <div key={l.label} className="flex items-center gap-3">
          <span className="text-[10px] text-muted-foreground/50 w-40 text-right shrink-0 hidden sm:block">
            {l.label}
          </span>
          <div className="flex-1 flex items-center gap-2 min-w-0">
            <div
              className={cn(
                "h-6 rounded flex items-center px-2 text-[10px] font-medium transition-all duration-300 border truncate",
                step >= i
                  ? l.color === "emerald" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : l.color === "blue" ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                  : l.color === "purple" ? "bg-purple-500/10 border-purple-500/20 text-purple-400"
                  : l.color === "orange" ? "bg-orange-500/10 border-orange-500/20 text-orange-400"
                  : "bg-red-500/10 border-red-500/20 text-red-400"
                  : "bg-muted/10 border-border/30 text-muted-foreground/20"
              )}
              style={{ width: `${l.bar}%`, minWidth: "80px" }}
            >
              <span className="sm:hidden truncate">{l.label}</span>
            </div>
            <span className={cn(
              "text-[10px] font-mono transition-opacity shrink-0",
              step >= i ? "opacity-100 text-muted-foreground" : "opacity-0"
            )}>
              {l.time}
            </span>
          </div>
        </div>
      ))}
      <p className="text-[11px] text-muted-foreground/60 pt-2 sm:pl-44">
        Memory is ~1,000x faster than SSD. SSD is ~100x faster than HDD. Network adds milliseconds. Design accordingly.
      </p>
    </div>
  );
}

function EstimationWorkthrough() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % 8), 2000);
    return () => clearInterval(t);
  }, []);

  const steps = [
    { label: "Given: 500M MAU, 200M DAU", calc: "", result: "" },
    { label: "Tweets per day", calc: "200M users x 2 tweets/day", result: "= 400M tweets/day" },
    { label: "Write QPS", calc: "400M / 100,000 sec", result: "= ~4,000 QPS" },
    { label: "Peak write QPS", calc: "4,000 x 3", result: "= ~12,000 QPS" },
    { label: "Read QPS (100:1 ratio)", calc: "4,000 x 100", result: "= ~400,000 QPS" },
    { label: "Storage per tweet", calc: "280 chars x 2 bytes + metadata", result: "= ~1 KB per tweet" },
    { label: "Daily storage", calc: "400M tweets x 1 KB", result: "= ~400 GB/day" },
    { label: "Yearly storage (text only)", calc: "400 GB x 365", result: "= ~146 TB/year" },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-3">
        <div className="text-xs font-bold bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full border border-blue-500/20">
          Example: Twitter-scale estimation
        </div>
      </div>
      {steps.map((s, i) => (
        <div
          key={s.label}
          className={cn(
            "flex items-center gap-3 rounded-md border px-3 py-2 transition-all duration-500",
            i < step
              ? "bg-emerald-500/5 border-emerald-500/15 opacity-100"
              : i === step
              ? "bg-blue-500/5 border-blue-500/20 ring-1 ring-blue-500/15 opacity-100"
              : "bg-muted/5 border-border/20 opacity-30"
          )}
        >
          <span className={cn(
            "text-[10px] font-mono font-bold size-5 rounded flex items-center justify-center shrink-0",
            i < step ? "bg-emerald-500/20 text-emerald-400" :
            i === step ? "bg-blue-500/20 text-blue-400" : "bg-muted/20 text-muted-foreground/30"
          )}>
            {i + 1}
          </span>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-medium">{s.label}</span>
            {s.calc && (
              <span className="text-[10px] font-mono text-muted-foreground ml-2">{s.calc}</span>
            )}
          </div>
          {s.result && (
            <span className={cn(
              "text-[10px] font-mono font-bold shrink-0 transition-all",
              i <= step ? "text-emerald-400" : "text-transparent"
            )}>
              {s.result}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function CommonSizesReference() {
  const categories = [
    {
      title: "Data Sizes",
      color: "blue",
      items: [
        { label: "Character (ASCII)", size: "1 byte" },
        { label: "Character (Unicode)", size: "2 bytes" },
        { label: "UUID / ID", size: "16 bytes" },
        { label: "Timestamp", size: "8 bytes" },
        { label: "URL", size: "~100 bytes" },
        { label: "Tweet / short text", size: "~1 KB" },
        { label: "Profile record", size: "~10 KB" },
      ],
    },
    {
      title: "Media Sizes",
      color: "purple",
      items: [
        { label: "Thumbnail image", size: "~10 KB" },
        { label: "Compressed photo", size: "~300 KB" },
        { label: "High-res image", size: "~3 MB" },
        { label: "1 min video (SD)", size: "~25 MB" },
        { label: "1 min video (HD)", size: "~150 MB" },
        { label: "1 min audio (MP3)", size: "~1 MB" },
      ],
    },
    {
      title: "Time Constants",
      color: "emerald",
      items: [
        { label: "Seconds/day", size: "86,400 (~10^5)" },
        { label: "Seconds/month", size: "~2.6M" },
        { label: "Seconds/year", size: "~31M (~10^7.5)" },
        { label: "Req/day to QPS", size: "divide by 10^5" },
        { label: "Peak multiplier", size: "2-3x average" },
        { label: "Read:write ratio", size: "10:1 to 100:1" },
      ],
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {categories.map((cat) => (
        <div key={cat.title} className={cn(
          "rounded-lg border p-3 space-y-2",
          cat.color === "blue" && "border-blue-500/20 bg-blue-500/[0.03]",
          cat.color === "purple" && "border-purple-500/20 bg-purple-500/[0.03]",
          cat.color === "emerald" && "border-emerald-500/20 bg-emerald-500/[0.03]"
        )}>
          <p className={cn(
            "text-[11px] font-semibold uppercase tracking-wider",
            cat.color === "blue" && "text-blue-400",
            cat.color === "purple" && "text-purple-400",
            cat.color === "emerald" && "text-emerald-400"
          )}>
            {cat.title}
          </p>
          {cat.items.map((item) => (
            <div key={item.label} className="flex items-center justify-between gap-2">
              <span className="text-[11px] text-muted-foreground">{item.label}</span>
              <span className="text-[10px] font-mono font-bold text-muted-foreground/80">{item.size}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default function EstimationPage() {
  const [dau, setDau] = useState(10);
  const [reqPerUser, setReqPerUser] = useState(20);
  const [dataPerReq, setDataPerReq] = useState(2);
  const [readWriteRatio, setReadWriteRatio] = useState(10);

  const totalDailyRequests = dau * reqPerUser * 1_000_000;
  const writeQps = Math.round(totalDailyRequests / 86400);
  const peakWriteQps = writeQps * 3;
  const readQps = writeQps * readWriteRatio;
  const peakReadQps = readQps * 3;
  const dailyStorageGB = Math.round((totalDailyRequests * dataPerReq) / 1000 / 1000);
  const yearlyStorageTB = Math.round((dailyStorageGB * 365) / 1000);
  const bandwidthMBps = Math.round((peakReadQps * dataPerReq) / 1000);
  const serversNeeded = Math.max(1, Math.ceil(peakReadQps / 10000));

  return (
    <div className="space-y-8">
      <TopicHero
        title="Back-of-Envelope Estimation"
        subtitle="The interviewer asks 'how many servers do you need?' and you freeze. Estimation is not about precision — it is about proving you can reason about scale before you design for it. Every architecture decision you make should be backed by numbers, even rough ones."
        difficulty="beginner"
      />

      <FailureScenario title="You design a single-server system for a billion-user problem">
        <p className="text-sm text-muted-foreground">
          You have designed what feels like a solid architecture for a social media feed.
          The interviewer asks: &quot;So roughly how much storage do we need per year?&quot;
          Silence. You have no idea whether it is gigabytes or petabytes. Your entire design
          might be built on the wrong foundation. A single PostgreSQL instance cannot hold
          146 TB of tweets. Your design is dead on arrival.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
          <MetricCounter label="DAU" value={200} unit="M" trend="neutral" />
          <MetricCounter label="Tweets/Day" value={400} unit="M" trend="neutral" />
          <MetricCounter label="Storage/Year" value={0} unit="?" trend="up" />
          <MetricCounter label="Servers Needed" value={0} unit="?" trend="up" />
        </div>
        <p className="text-sm text-muted-foreground mt-3">
          Without estimation, you cannot justify any architecture decision. &quot;We need
          sharding&quot; means nothing if you cannot explain why the data does not fit on
          one machine. &quot;We need a CDN&quot; is hand-waving if you cannot calculate
          the bandwidth that justifies it.
        </p>
      </FailureScenario>

      <WhyItBreaks title="You cannot design for scale you cannot quantify">
        <p className="text-sm text-muted-foreground">
          Estimation is not a math test. It is how you translate vague product requirements
          (&quot;millions of users&quot;) into concrete engineering constraints (QPS, storage,
          bandwidth). It tells you whether you need 1 server or 100. Whether you need a cache
          or not. Whether sharding is overkill or essential. Without it, you are guessing — and
          interviewers can tell.
        </p>
        <BeforeAfter
          before={{
            title: "Without estimation",
            content: (
              <div className="text-sm space-y-2">
                <p className="text-muted-foreground">Vague, hand-wavy, unjustified</p>
                <div className="bg-muted/50 p-2 rounded text-xs font-mono">
                  <p>&quot;We will use a NoSQL database&quot;</p>
                  <p>&quot;We should probably shard it&quot;</p>
                  <p>&quot;We need a lot of servers&quot;</p>
                  <p className="text-red-400 mt-1">Why? How many? No idea.</p>
                </div>
              </div>
            ),
          }}
          after={{
            title: "With estimation",
            content: (
              <div className="text-sm space-y-2">
                <p className="text-muted-foreground">Concrete, justified, credible</p>
                <div className="bg-muted/50 p-2 rounded text-xs font-mono">
                  <p>200M DAU x 2 tweets = 400M/day</p>
                  <p>400M / 86,400 = ~4,600 write QPS</p>
                  <p>At 10K QPS/server = need ~14 read servers</p>
                  <p className="text-green-400 mt-1">Every choice backed by numbers</p>
                </div>
              </div>
            ),
          }}
        />
      </WhyItBreaks>

      <ConceptVisualizer title="Powers of 2 — Your Estimation Cheat Sheet">
        <p className="text-sm text-muted-foreground mb-4">
          The entire world of data sizes boils down to powers of 2. Every 10 powers doubles
          the prefix — KB, MB, GB, TB, PB. Memorize these and you can estimate any storage
          calculation on the fly. The right column gives you a physical intuition for each scale.
        </p>
        <PowersOfTwoTable />
        <ConversationalCallout type="tip">
          The trick: every jump of 10 in the exponent is roughly 1,000x. So 2^10 = 1 KB,
          2^20 = 1 MB (1,000 KB), 2^30 = 1 GB (1,000 MB). This pattern means you never need
          to calculate — just count by tens.
        </ConversationalCallout>
      </ConceptVisualizer>

      <ConceptVisualizer title="Latency Numbers Every Engineer Should Know">
        <p className="text-sm text-muted-foreground mb-4">
          These numbers from Jeff Dean at Google are the bedrock of performance reasoning.
          You do not need to memorize exact nanoseconds. You need to know the relative scale:
          memory is fast, disk is slow, network adds milliseconds. Watch them reveal themselves
          in order of magnitude.
        </p>
        <LatencyNumbersViz />
      </ConceptVisualizer>

      <ConceptVisualizer title="Common Data Sizes Reference">
        <p className="text-sm text-muted-foreground mb-4">
          When the interviewer says &quot;design Twitter,&quot; you need to know that a tweet
          is about 1 KB, a photo is about 300 KB, and a minute of video is 25-150 MB. These
          reference sizes let you estimate storage, bandwidth, and cost on the spot.
        </p>
        <CommonSizesReference />
      </ConceptVisualizer>

      <CorrectApproach title="The Three-Step Estimation Formula">
        <p className="text-sm text-muted-foreground mb-4">
          Every back-of-envelope calculation follows the same three pillars:
          QPS (compute), Storage (disk), and Bandwidth (network). Each feeds into infrastructure
          decisions. Here is the formula chain.
        </p>
        <div className="space-y-3">
          <div className="bg-muted/30 p-4 rounded-lg border-l-2 border-blue-500">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="size-4 text-blue-400" />
              <p className="text-sm font-semibold">1. QPS (Queries Per Second)</p>
            </div>
            <div className="text-xs font-mono text-muted-foreground space-y-1 ml-6">
              <p>DAU x actions/user/day = daily requests</p>
              <p>daily requests / 86,400 = average QPS</p>
              <p>shortcut: daily requests / 100,000 (close enough)</p>
              <p>peak QPS = average x 2-3 (normal) or x10 (flash sales)</p>
              <p className="text-blue-400/70">This tells you how many servers you need.</p>
            </div>
          </div>
          <div className="bg-muted/30 p-4 rounded-lg border-l-2 border-purple-500">
            <div className="flex items-center gap-2 mb-2">
              <HardDrive className="size-4 text-purple-400" />
              <p className="text-sm font-semibold">2. Storage</p>
            </div>
            <div className="text-xs font-mono text-muted-foreground space-y-1 ml-6">
              <p>daily writes x data per write = daily storage</p>
              <p>daily storage x 365 = yearly storage</p>
              <p>plan for 3-5 year retention</p>
              <p>add 20-30% overhead for indexes and replication</p>
              <p className="text-purple-400/70">This tells you if you need sharding.</p>
            </div>
          </div>
          <div className="bg-muted/30 p-4 rounded-lg border-l-2 border-emerald-500">
            <div className="flex items-center gap-2 mb-2">
              <Wifi className="size-4 text-emerald-400" />
              <p className="text-sm font-semibold">3. Bandwidth</p>
            </div>
            <div className="text-xs font-mono text-muted-foreground space-y-1 ml-6">
              <p>peak QPS x average response size = bandwidth</p>
              <p>separate ingress (writes) from egress (reads)</p>
              <p>read-heavy systems: egress dominates (10:1 to 100:1)</p>
              <p>media-heavy systems: consider CDN offloading</p>
              <p className="text-emerald-400/70">This tells you if you need a CDN.</p>
            </div>
          </div>
        </div>
      </CorrectApproach>

      <ConceptVisualizer title="Worked Example: Estimating Twitter at Scale">
        <p className="text-sm text-muted-foreground mb-4">
          Watch a real estimation unfold step by step, exactly as you would walk through it
          in an interview. Notice how each number feeds into the next. This chain of reasoning
          is what interviewers want to see — not the final answer, but the process.
        </p>
        <EstimationWorkthrough />
        <ConversationalCallout type="tip">
          The magic shortcut: there are roughly 100,000 seconds in a day (actually 86,400).
          So if you have 400 million daily writes, that is about 4,000 QPS.
          Divide daily requests by 100,000 to get average QPS. Multiply by 2-3x for peak.
          Interviewers love seeing you use this shortcut — it shows fluency.
        </ConversationalCallout>
      </ConceptVisualizer>

      <InteractiveDemo title="Interactive Estimation Calculator">
        {({ isPlaying }) => (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Adjust the sliders to see how different assumptions change the scale of your system.
              Notice how small changes in DAU produce massive changes in infrastructure needs.
              The read:write ratio slider is particularly revealing — most systems are read-heavy,
              which means your read infrastructure dwarfs your write infrastructure.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium flex items-center gap-1.5">
                  <Server className="size-3 text-blue-400" />
                  DAU: {dau}M
                </label>
                <input
                  type="range" min={1} max={500} value={dau}
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
                  Writes/user/day: {reqPerUser}
                </label>
                <input
                  type="range" min={1} max={100} value={reqPerUser}
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
                  KB per write: {dataPerReq}
                </label>
                <input
                  type="range" min={1} max={500} value={dataPerReq}
                  onChange={(e) => setDataPerReq(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
                <div className="flex justify-between text-[9px] text-muted-foreground/50 font-mono">
                  <span>1 KB</span><span>500 KB</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium flex items-center gap-1.5">
                  <TrendingUp className="size-3 text-orange-400" />
                  Read:Write ratio: {readWriteRatio}:1
                </label>
                <input
                  type="range" min={1} max={100} value={readWriteRatio}
                  onChange={(e) => setReadWriteRatio(Number(e.target.value))}
                  className="w-full accent-orange-500"
                />
                <div className="flex justify-between text-[9px] text-muted-foreground/50 font-mono">
                  <span>1:1</span><span>100:1</span>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <MetricCounter label="Write QPS" value={writeQps} unit="req/s" trend="neutral" />
              <MetricCounter label="Peak Write QPS" value={peakWriteQps} unit="req/s" trend="up" />
              <MetricCounter label="Read QPS" value={readQps} unit="req/s" trend="neutral" />
              <MetricCounter label="Peak Read QPS" value={peakReadQps} unit="req/s" trend="up" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <MetricCounter label="Daily Storage" value={dailyStorageGB} unit="GB" trend="neutral" />
              <MetricCounter label="Yearly Storage" value={yearlyStorageTB} unit="TB" trend="up" />
              <MetricCounter label="Peak Bandwidth" value={bandwidthMBps} unit="MB/s" trend="neutral" />
              <MetricCounter label="Servers Needed" value={serversNeeded} unit="" trend="up" />
            </div>

            {/* Contextual warnings */}
            {yearlyStorageTB > 10 && (
              <ConversationalCallout type="warning">
                At {yearlyStorageTB} TB/year, a single database server will not hold this data.
                You need sharding. With a typical 2 TB per shard, that is {Math.ceil(yearlyStorageTB / 2)} shards
                for one year of data alone.
              </ConversationalCallout>
            )}
            {peakReadQps > 50000 && (
              <ConversationalCallout type="warning">
                At {peakReadQps.toLocaleString()} peak read QPS, you need at least {serversNeeded} application
                servers behind a load balancer, plus read replicas or a caching layer like Redis
                to absorb the read traffic.
              </ConversationalCallout>
            )}
            {bandwidthMBps > 1000 && (
              <ConversationalCallout type="warning">
                At {bandwidthMBps.toLocaleString()} MB/s peak bandwidth, you are pushing
                {Math.round(bandwidthMBps / 125)} Gbps. A CDN is essential to offload this traffic
                from your origin servers. Without it, network costs alone would be enormous.
              </ConversationalCallout>
            )}
          </div>
        )}
      </InteractiveDemo>

      <AhaMoment
        question="Do interviewers expect exact numbers?"
        answer={
          <p>
            Never. They expect order-of-magnitude reasoning. Saying &quot;roughly 10,000 QPS&quot;
            is perfect. Saying &quot;10,247 QPS&quot; is suspicious — it implies false precision.
            Round aggressively. Use powers of 10. The goal is to determine whether you need 1
            server or 100, not whether you need 97 or 103. Back-of-envelope calculations should
            not take more than 5 minutes. If you are spending longer, you are going too deep.
          </p>
        }
      />

      <AhaMoment
        question="Why multiply peak QPS by 2-3x instead of using the average?"
        answer={
          <p>
            Traffic is never uniform. Social media peaks at evening hours. E-commerce spikes
            during sales. If your system can only handle average load, it crashes during peak.
            The 2-3x multiplier is a simple heuristic for normal traffic patterns. For systems
            with extreme spikes (ticket sales, flash sales, Super Bowl tweets), you might use
            10x or more. Slack&apos;s 2020 outage happened because their WebSocket infrastructure
            could not handle the reconnection storm when a partition healed — a real-world example
            of failing to plan for peak.
          </p>
        }
      />

      <AhaMoment
        question="How do I estimate when I have no idea about the numbers?"
        answer={
          <p>
            Start with what you know and work outward. You know the world population is ~8 billion.
            You know the US has ~330 million people. You know Facebook has ~3 billion MAU and
            ~2 billion DAU. You know Instagram has ~2 billion MAU. From these anchors, you
            can estimate any social app. If the interviewer says &quot;a popular messaging app,&quot;
            you can say &quot;Let me assume WhatsApp scale — about 2 billion MAU, 500 million DAU.&quot;
            The interviewer will correct you if needed. Making an assumption is always better
            than freezing.
          </p>
        }
      />

      <KeyTakeaway
        points={[
          "There are ~86,400 seconds in a day. Round to 100,000 for easy math. Divide daily requests by 100K to get QPS.",
          "Powers of 2 are your cheat sheet: 2^10 = 1KB, 2^20 = 1MB, 2^30 = 1GB, 2^40 = 1TB. Every 10 powers = 1000x.",
          "Three things to estimate: QPS (compute), storage (disk), and bandwidth (network). These drive all infrastructure decisions.",
          "Round aggressively and use powers of 10. Order of magnitude matters, not decimal precision. 'About 10K QPS' beats '11,574 QPS.'",
          "Always calculate peak QPS (2-3x average). Design for the spike, not the average. Systems that handle only average load crash during peaks.",
          "Show your work. The interviewer cares about your reasoning chain — DAU to daily requests to QPS to servers. The process is the answer.",
          "Separate reads from writes. Most systems are read-heavy (10:1 to 100:1). This determines whether you need caching, read replicas, or a CDN.",
        ]}
      />
    </div>
  );
}
