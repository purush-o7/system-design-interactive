"use client";

import { useMemo } from "react";
import { TopicHero } from "@/components/topic-hero";
import { KeyTakeaway } from "@/components/key-takeaway";
import { WhyCare } from "@/components/why-care";
import { GlossaryTerm } from "@/components/glossary-term";
import { TopicQuiz } from "@/components/topic-quiz";
import { AhaMoment } from "@/components/aha-moment";
import { ConversationalCallout } from "@/components/conversational-callout";
import { FlowDiagram, type FlowNode, type FlowEdge } from "@/components/flow-diagram";
import { LiveChart } from "@/components/live-chart";
import { Playground } from "@/components/playground";
import { useSimulation } from "@/hooks/use-simulation";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, Shield, Clock, Bug } from "lucide-react";

type UrlStatus = "queued" | "fetching" | "parsed" | "skipped";
interface CrawlUrl { url: string; domain: string; depth: number; status: UrlStatus; isSpiderTrap?: boolean; }

const SEED_URLS: CrawlUrl[] = [
  { url: "example.com/", domain: "example.com", depth: 0, status: "queued" },
  { url: "example.com/about", domain: "example.com", depth: 1, status: "queued" },
  { url: "wiki.org/main", domain: "wiki.org", depth: 0, status: "queued" },
  { url: "wiki.org/history", domain: "wiki.org", depth: 1, status: "queued" },
  { url: "news.io/home", domain: "news.io", depth: 0, status: "queued" },
  { url: "news.io/article", domain: "news.io", depth: 1, status: "queued" },
  { url: "example.com/", domain: "example.com", depth: 0, status: "queued" }, // duplicate
  { url: "news.io/calendar?d=01", domain: "news.io", depth: 2, status: "queued", isSpiderTrap: true },
  { url: "news.io/calendar?d=02", domain: "news.io", depth: 2, status: "queued", isSpiderTrap: true },
  { url: "wiki.org/science", domain: "wiki.org", depth: 1, status: "queued" },
];

function bloomBits(url: string, size = 40): number[] {
  const h1 = url.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % size;
  const h2 = url.split("").reduce((a, c) => a * 31 + c.charCodeAt(0), 7) % size;
  const h3 = url.split("").reduce((a, c) => a * 17 + c.charCodeAt(0), 13) % size;
  return [Math.abs(h1), Math.abs(h2), Math.abs(h3)];
}

function useCrawlNodes(activeStage: number) {
  return useMemo(() => {
    const stage = (n: number): "healthy" | "idle" => activeStage === n ? "healthy" : "idle";

    const nodes: FlowNode[] = [
      {
        id: "seeds",
        type: "databaseNode",
        position: { x: 20, y: 155 },
        data: {
          label: "Seed URLs",
          sublabel: "Starting points",
          status: stage(0),
          handles: { right: true },
        },
      },
      {
        id: "frontier",
        type: "queueNode",
        position: { x: 195, y: 100 },
        data: {
          label: "URL Frontier",
          sublabel: "Priority + politeness",
          status: stage(1),
          handles: { left: true, right: true, bottom: true },
        },
      },
      {
        id: "fetchers",
        type: "serverNode",
        position: { x: 390, y: 100 },
        data: {
          label: "Fetcher Pool",
          sublabel: "Parallel HTTP workers",
          status: stage(2),
          handles: { left: true, right: true },
        },
      },
      {
        id: "parser",
        type: "serverNode",
        position: { x: 570, y: 100 },
        data: {
          label: "Parser",
          sublabel: "Extract text + links",
          status: stage(3),
          handles: { left: true, bottom: true },
        },
      },
      {
        id: "extractor",
        type: "serverNode",
        position: { x: 570, y: 250 },
        data: {
          label: "URL Extractor",
          sublabel: "Normalize + filter",
          status: stage(4),
          handles: { top: true, left: true },
        },
      },
      {
        id: "bloom",
        type: "cacheNode",
        position: { x: 390, y: 250 },
        data: {
          label: "Bloom Filter",
          sublabel: "Dedup: seen before?",
          status: stage(5),
          handles: { right: true, left: true },
        },
      },
      {
        id: "storage",
        type: "databaseNode",
        position: { x: 195, y: 250 },
        data: {
          label: "Content Store",
          sublabel: "Raw HTML (S3/HDFS)",
          status: stage(3),
          handles: { right: true, top: true },
        },
      },
    ];

    const edges: FlowEdge[] = [
      { id: "e1", source: "seeds", target: "frontier", animated: activeStage === 0 },
      { id: "e2", source: "frontier", target: "fetchers", animated: activeStage === 1 },
      { id: "e3", source: "fetchers", target: "parser", animated: activeStage === 2 },
      { id: "e4", source: "parser", target: "extractor", animated: activeStage === 3 },
      { id: "e5", source: "extractor", target: "bloom", animated: activeStage === 4 },
      { id: "e6", source: "bloom", target: "frontier", animated: activeStage === 5, label: "new URLs" },
      { id: "e7", source: "parser", target: "storage", animated: activeStage === 3 },
    ];

    return { nodes, edges };
  }, [activeStage]);
}

function CrawlSimulation() {
  const MAX = SEED_URLS.length;
  const sim = useSimulation({ intervalMs: 900, maxSteps: MAX });

  const processedUrls = useMemo(() => {
    const bits = new Array(40).fill(false);
    const seen = new Set<string>();
    return SEED_URLS.slice(0, sim.tick).map((item) => {
      const bits3 = bloomBits(item.url);
      const isDuplicate = bits3.every((b) => bits[b]);
      bits3.forEach((b) => (bits[b] = true));
      const isTrap = !!item.isSpiderTrap;
      let status: UrlStatus;
      if (isDuplicate) status = "skipped";
      else if (isTrap) status = "skipped";
      else { seen.add(item.url); status = sim.tick - 1 === SEED_URLS.indexOf(item) ? "fetching" : "parsed"; }
      return { ...item, status, isDuplicate, isTrap };
    });
  }, [sim.tick]);

  const currentBits = useMemo(() => {
    const bits = new Array(40).fill(false);
    SEED_URLS.slice(0, sim.tick).forEach((item) => {
      bloomBits(item.url).forEach((b) => (bits[b] = true));
    });
    return bits;
  }, [sim.tick]);

  const activeStage = sim.isPlaying ? sim.tick % 6 : (sim.tick > 0 ? 5 : 0);
  const { nodes, edges } = useCrawlNodes(activeStage);

  const chartData = useMemo(() => {
    const crawled = processedUrls.filter((u) => u.status === "parsed" || u.status === "fetching");
    return Array.from({ length: Math.max(sim.tick, 1) }, (_, i) => ({
      t: `T${i + 1}`,
      crawled: Math.min(crawled.length, i + 1),
      frontier: Math.max(0, SEED_URLS.length - i - 1),
    }));
  }, [sim.tick, processedUrls]);

  const filledBits = currentBits.filter(Boolean).length;

  const stageLabels = [
    "Seeding — injecting starting URLs into frontier",
    "Frontier — dispatching next URL to fetch",
    "Fetching — HTTP GET in progress",
    "Parsing — extracting links and content",
    "Extracting — normalizing new URLs",
    "Dedup — Bloom filter check complete",
  ];

  return (
    <div className="space-y-6">
      <Playground
        title="Crawl Pipeline — Live Architecture"
        simulation={sim}
        canvasHeight="min-h-[340px]"
        hints={["Press play to watch URLs flow through the crawl pipeline — notice duplicates and spider traps getting blocked"]}
        canvas={
          <FlowDiagram
            nodes={nodes}
            edges={edges}
            minHeight={340}
            allowDrag={false}
          />
        }
        explanation={
          <div className="space-y-3">
            <p className="text-xs font-semibold text-violet-400 uppercase tracking-wider">
              Active stage
            </p>
            <p className="text-sm font-medium">{stageLabels[activeStage]}</p>
            <p className="text-xs text-muted-foreground">
              Each URL travels through the full pipeline: frontier → fetch → parse → extract → dedup → back to frontier. The cycle continues until no new URLs remain.
            </p>
            <div className="space-y-1 pt-1">
              {stageLabels.map((label, i) => (
                <div
                  key={label}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-2 py-1 text-xs transition-all",
                    activeStage === i
                      ? "bg-violet-500/10 text-violet-400"
                      : "text-muted-foreground/40"
                  )}
                >
                  <span className="font-mono w-3">{i + 1}</span>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        }
      />

      <div className="rounded-xl border border-border/40 bg-muted/5 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/30 bg-muted/10">
          <span className="text-sm font-medium">URL Frontier — Live Queue</span>
          <div className="flex items-center gap-3 text-[11px] font-mono text-muted-foreground">
            <span className="text-emerald-400">{processedUrls.filter((u) => u.status === "parsed").length} crawled</span>
            <span className="text-amber-400">{processedUrls.filter((u) => u.status === "skipped").length} skipped</span>
            <span className="text-blue-400">{SEED_URLS.length - sim.tick} queued</span>
          </div>
        </div>
        <div className="divide-y divide-border/20 max-h-[320px] overflow-y-auto">
          {SEED_URLS.map((item, idx) => {
            const processed = processedUrls[idx];
            const isCurrent = idx === sim.tick - 1;
            const isPending = idx >= sim.tick;
            const isDup = processed?.isDuplicate;
            const isTrap = processed?.isTrap;

            return (
              <div
                key={`${item.url}-${idx}`}
                className={cn(
                  "flex items-center gap-3 px-4 py-2 text-xs transition-all duration-300",
                  isCurrent && "bg-blue-500/8 ring-1 ring-inset ring-blue-500/20",
                  !isCurrent && isDup && "bg-amber-500/5",
                  !isCurrent && isTrap && "bg-red-500/5",
                  !isCurrent && processed?.status === "parsed" && "bg-emerald-500/5",
                  isPending && "opacity-40"
                )}
              >
                <span className="font-mono text-muted-foreground/40 w-4 shrink-0">{idx + 1}</span>
                <span className="font-mono flex-1 truncate">{item.url}</span>
                <span className="text-muted-foreground/50 font-mono w-20 text-right shrink-0">depth:{item.depth}</span>
                <div className="w-24 text-right shrink-0">
                  {isPending && (
                    <span className="text-muted-foreground/30">queued</span>
                  )}
                  {!isPending && isTrap && (
                    <span className="inline-flex items-center gap-1 text-red-400">
                      <Bug className="size-3" />
                      trap
                    </span>
                  )}
                  {!isPending && isDup && !isTrap && (
                    <span className="inline-flex items-center gap-1 text-amber-400">
                      <XCircle className="size-3" />
                      duplicate
                    </span>
                  )}
                  {!isPending && !isDup && !isTrap && (
                    <span className="inline-flex items-center gap-1 text-emerald-400">
                      <CheckCircle2 className="size-3" />
                      crawled
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl border border-border/40 bg-muted/5 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Bloom Filter — Deduplication State</span>
          <span className="text-xs font-mono text-muted-foreground">{filledBits}/40 bits set ({Math.round((filledBits / 40) * 100)}%)</span>
        </div>
        <div className="flex gap-[3px]">
          {currentBits.map((bit, i) => (
            <div
              key={i}
              className={cn(
                "h-7 flex-1 rounded-sm transition-all duration-300 flex items-center justify-center text-[7px] font-mono",
                bit ? "bg-blue-500/50 text-blue-200" : "bg-muted/20 text-muted-foreground/20"
              )}
            >
              {bit ? "1" : "0"}
            </div>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground/60">
          When a URL arrives, 3 hash functions each set a bit. If all 3 bits are already set, the URL was seen before — skip it. Uses ~1.2 GB for 10 billion URLs vs 500 GB for a hash set.
        </p>
      </div>

      <div className="rounded-xl border border-border/40 bg-muted/5 p-4 space-y-3">
        <span className="text-sm font-medium">Crawl Throughput Over Time</span>
        <LiveChart
          type="area"
          data={chartData}
          dataKeys={{ x: "t", y: ["crawled", "frontier"], label: ["Pages Crawled", "Frontier Size"] }}
          height={180}
          unit="pages"
          referenceLines={[{ y: 7, label: "Unique pages", color: "#10b981" }]}
        />
      </div>
    </div>
  );
}

function PolitenessDemo() {
  const sim = useSimulation({ intervalMs: 500 });
  const tick = sim.tick % 24;

  const domains = [
    { name: "example.com", delay: 10, active: "bg-blue-500", dim: "bg-blue-500 opacity-35" },
    { name: "wiki.org", delay: 5, active: "bg-emerald-500", dim: "bg-emerald-500 opacity-35" },
    { name: "news.io", delay: 3, active: "bg-violet-500", dim: "bg-violet-500 opacity-35" },
    { name: "docs.dev", delay: 8, active: "bg-amber-500", dim: "bg-amber-500 opacity-35" },
  ];

  const timelineLen = 24;

  return (
    <Playground
      title="Politeness — Per-Domain Crawl-Delay"
      simulation={sim}
      canvasHeight="min-h-[280px]"
      hints={["Press play to see how the crawler fetches from multiple domains in parallel while respecting each domain's crawl delay"]}
      canvas={
        <div className="p-4 space-y-4">
          <p className="text-xs text-muted-foreground">
            Each domain gets its own back queue. While waiting on one domain&apos;s crawl-delay, fetch from others in parallel.
          </p>
          <div className="space-y-3">
            {domains.map((d) => {
              const crawlPoints: number[] = [];
              for (let i = 0; i < timelineLen; i += d.delay) crawlPoints.push(i);

              return (
                <div key={d.name} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                    <span>{d.name}</span>
                    <span className="text-muted-foreground/50">Crawl-Delay: {d.delay}s</span>
                  </div>
                  <div className="flex gap-[2px]">
                    {Array.from({ length: timelineLen }).map((_, i) => {
                      const isCrawl = crawlPoints.includes(i);
                      const isPast = i <= tick;
                      const isCurrent = i === tick && isCrawl;
                      return (
                        <div
                          key={i}
                          className={cn(
                            "h-6 flex-1 rounded-sm transition-all duration-200",
                            isCurrent ? d.active : isCrawl && isPast ? d.dim : "bg-muted/10"
                          )}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
            <div className="flex justify-between text-[9px] text-muted-foreground/40 font-mono pt-1">
              <span>0s</span>
              <span>Time →</span>
              <span>24s</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-1">
            <div className="rounded-lg bg-muted/20 border border-border/30 p-2 text-center">
              <Shield className="size-4 mx-auto text-emerald-400 mb-1" />
              <p className="text-[10px] font-semibold">robots.txt</p>
              <p className="text-[9px] text-muted-foreground">Honor crawl rules</p>
            </div>
            <div className="rounded-lg bg-muted/20 border border-border/30 p-2 text-center">
              <Clock className="size-4 mx-auto text-amber-400 mb-1" />
              <p className="text-[10px] font-semibold">Crawl-Delay</p>
              <p className="text-[9px] text-muted-foreground">Per-domain rate limit</p>
            </div>
            <div className="rounded-lg bg-muted/20 border border-border/30 p-2 text-center">
              <CheckCircle2 className="size-4 mx-auto text-blue-400 mb-1" />
              <p className="text-[10px] font-semibold">User-Agent</p>
              <p className="text-[9px] text-muted-foreground">Identify your bot</p>
            </div>
          </div>
        </div>
      }
      explanation={
        <div className="space-y-3">
          <p className="font-semibold text-sm">Politeness does not mean slowness</p>
          <p>
            While waiting on <code className="text-xs bg-muted/50 px-1 rounded font-mono">example.com</code>&apos;s 10-second delay, the crawler fetches from wiki.org (5s delay), news.io (3s), and docs.dev (8s) in parallel.
          </p>
          <p>
            The back queue for each domain fires only after its crawl-delay has elapsed since the last request. This prevents IP bans and respects server capacity.
          </p>
          <p className="text-muted-foreground/70">
            Violating robots.txt is unethical and results in IP bans — losing access to entire domains permanently.
          </p>
        </div>
      }
    />
  );
}

function SpiderTrapDemo() {
  const sim = useSimulation({ intervalMs: 700 });
  const tick = sim.tick % 18;

  const traps = [
    {
      type: "Infinite Calendar",
      urls: Array.from({ length: 6 }, (_, i) => `/calendar?date=2025-01-0${i + 1}`),
      detection: "Pattern detect: incrementing param",
      colorClass: "border-red-500/25 bg-red-500/5",
      tagClass: "text-red-400",
    },
    {
      type: "Session ID URLs",
      urls: ["/page?sid=abc123", "/page?sid=def456", "/page?sid=ghi789"],
      detection: "Canonicalize: strip session params",
      colorClass: "border-amber-500/25 bg-amber-500/5",
      tagClass: "text-amber-400",
    },
    {
      type: "Combinatorial Search",
      urls: ["/search?q=a", "/search?q=ab", "/search?q=abc", "/search?q=abcd", "/search?q=abcde"],
      detection: "Depth limit + URL length cap (256 chars)",
      colorClass: "border-violet-500/25 bg-violet-500/5",
      tagClass: "text-violet-400",
    },
  ];

  return (
    <Playground
      title="Spider Trap Detection"
      simulation={sim}
      canvasHeight="min-h-[360px]"
      hints={["Press play to see three types of spider traps get detected and blocked by the crawler"]}
      canvas={
        <div className="p-4 space-y-3">
          {traps.map((trap, ti) => {
            const isActive = tick >= ti * 4;
            const visibleUrls = isActive ? Math.min(trap.urls.length, tick - ti * 4 + 1) : 0;
            const isDetected = visibleUrls >= trap.urls.length;
            return (
              <div
                key={trap.type}
                className={cn(
                  "rounded-lg border p-3 space-y-2 transition-all duration-300",
                  trap.colorClass,
                  !isActive && "opacity-40"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bug className={cn("size-3.5", trap.tagClass)} />
                    <span className="text-xs font-semibold">{trap.type}</span>
                  </div>
                  {isDetected && (
                    <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                      BLOCKED
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1">
                  {trap.urls.slice(0, visibleUrls).map((url) => (
                    <span
                      key={url}
                      className="text-[9px] font-mono bg-muted/40 rounded px-1.5 py-0.5 text-muted-foreground"
                    >
                      {url}
                    </span>
                  ))}
                  {isActive && !isDetected && (
                    <span className="text-[9px] font-mono text-muted-foreground/30 animate-pulse">generating more...</span>
                  )}
                </div>
                {isDetected && (
                  <p className="text-[10px] text-emerald-400 font-mono">{trap.detection}</p>
                )}
              </div>
            );
          })}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <div className="rounded-lg bg-muted/20 border border-border/30 p-2 text-center">
              <p className="text-base font-mono font-bold text-blue-400">256</p>
              <p className="text-[9px] text-muted-foreground">Max URL length (chars)</p>
            </div>
            <div className="rounded-lg bg-muted/20 border border-border/30 p-2 text-center">
              <p className="text-base font-mono font-bold text-amber-400">15</p>
              <p className="text-[9px] text-muted-foreground">Max crawl depth</p>
            </div>
            <div className="rounded-lg bg-muted/20 border border-border/30 p-2 text-center">
              <p className="text-base font-mono font-bold text-emerald-400">3</p>
              <p className="text-[9px] text-muted-foreground">Max query params</p>
            </div>
          </div>
        </div>
      }
      explanation={
        <div className="space-y-3">
          <p className="font-semibold text-sm">Traps burn crawl budget</p>
          <p>
            A single calendar widget at <code className="text-xs bg-muted/50 px-1 rounded font-mono">/calendar?date=...</code> can generate thousands of unique URLs, each pointing to the next day, month, or year — forever.
          </p>
          <p>
            Session IDs make the same page appear at infinitely many URLs. Canonicalization (stripping <code className="text-xs bg-muted/50 px-1 rounded font-mono">sid=</code> params) collapses them to one.
          </p>
          <p className="text-muted-foreground/70">
            Depth limits, URL length caps, and pattern matching are the three main defenses. Together they prevent any single trap from exhausting your crawl budget.
          </p>
        </div>
      }
    />
  );
}

function DistributedFlow() {
  const sim = useSimulation({ intervalMs: 1200 });
  const phase = sim.tick % 8;

  const crawlerDefs = [
    { id: "c1", x: 20,  sub: "google.com, youtube.com", rate: "12.4k", minPhase: 2 },
    { id: "c2", x: 185, sub: "wikipedia.org",           rate: "9.8k",  minPhase: 3 },
    { id: "c3", x: 350, sub: "github.com, npm.js",      rate: "7.2k",  minPhase: 4 },
    { id: "c4", x: 515, sub: "nytimes.com, bbc.co.uk",  rate: "5.6k",  minPhase: 5 },
  ];

  const nodes = useMemo((): FlowNode[] => [
    {
      id: "ring", type: "loadBalancerNode", position: { x: 220, y: 10 },
      data: { label: "Consistent Hash Ring", sublabel: "hash(domain) → crawler", status: phase >= 1 ? "healthy" : "idle", handles: { bottom: true } },
    },
    ...crawlerDefs.map((c, i) => ({
      id: c.id, type: "serverNode" as const, position: { x: c.x, y: 170 },
      data: { label: `Crawler ${i + 1}`, sublabel: c.sub, status: (phase >= c.minPhase ? "healthy" : "idle") as "healthy" | "idle", metrics: phase >= c.minPhase ? [{ label: "pages/s", value: c.rate }] : undefined, handles: { top: true } },
    })),
  ], [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const edges = useMemo((): FlowEdge[] => crawlerDefs.map((c, i) => ({
    id: `r${i + 1}`, source: "ring", target: c.id, animated: phase >= c.minPhase,
  })), [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Playground
      title="Distributed Crawling — Consistent Hash Partitioning"
      simulation={sim}
      canvasHeight="min-h-[320px]"
      hints={["Press play to watch domains get assigned to crawlers via consistent hashing"]}
      canvas={
        <FlowDiagram nodes={nodes} edges={edges} minHeight={320} allowDrag={false} />
      }
      explanation={
        <div className="space-y-3">
          <p className="font-semibold text-sm">One domain, one crawler</p>
          <p>
            Domains are assigned to crawlers via consistent hashing: <code className="text-xs bg-muted/50 px-1 rounded font-mono">hash(domain) % N</code> maps each domain to one node.
          </p>
          <p>
            This ensures politeness automatically — only one crawler ever touches a domain, so there&apos;s no risk of two crawlers accidentally hammering the same site simultaneously.
          </p>
          <p>
            When a crawler fails, only its domains are redistributed. Consistent hashing minimizes reshuffling — most crawlers keep their existing assignments.
          </p>
          <div className="rounded-md bg-muted/20 border border-border/30 p-2 text-xs font-mono text-muted-foreground">
            phase: {phase}/7 — {phase < 2 ? "initializing ring" : phase < 6 ? "crawlers active" : "fault tolerance ready"}
          </div>
        </div>
      }
    />
  );
}

export default function WebCrawlerPage() {
  return (
    <div className="space-y-8">
      <TopicHero
        title="Design a Web Crawler"
        subtitle="Your crawler starts at one URL, follows every link, and visits the same page 50 times. It gets trapped in infinite calendars and IP-banned for ignoring robots.txt. After 24 hours: 10,000 pages. Google crawls 5 billion per day."
        difficulty="advanced"
      />

      <WhyCare>
        Google crawls billions of web pages to build its search index. How do you visit every page on the internet without getting banned or running out of memory?
      </WhyCare>

      <p className="text-sm text-muted-foreground">
        A web crawler needs <GlossaryTerm term="consistent hashing">consistent hashing</GlossaryTerm> to partition domains across crawler nodes, a <GlossaryTerm term="message queue">message queue</GlossaryTerm> for the URL frontier, and <GlossaryTerm term="rate limiting">rate limiting</GlossaryTerm> per domain for politeness. <GlossaryTerm term="dns">DNS</GlossaryTerm> resolution becomes a bottleneck at scale, requiring local caching. <GlossaryTerm term="throughput">Throughput</GlossaryTerm> depends on parallel fetching across many domains simultaneously.
      </p>

      <ConversationalCallout type="warning">
        A naive BFS crawler without deduplication, politeness, or trap detection will re-crawl the same pages endlessly, get IP-banned from every major site, and exhaust its entire budget on calendar URLs that stretch to infinity.
      </ConversationalCallout>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">URL Frontier Simulation</h2>
        <p className="text-sm text-muted-foreground">
          Watch URLs flow through the pipeline: seeded into the frontier, fetched in parallel, parsed for links, deduplicated via Bloom filter, then new URLs cycle back. Duplicates and spider traps are caught and blocked.
        </p>
        <CrawlSimulation />
      </section>

      <AhaMoment
        question="Why is the URL Frontier a two-tier queue, not a simple FIFO?"
        answer={
          <p>
            A single queue crawls in arbitrary order — you might spend days on low-value pages before reaching important ones. The <strong>front queues</strong> (one per priority level) rank pages by PageRank or domain authority so high-value pages get crawled first. The <strong>back queues</strong> (one per domain) enforce crawl-delay so you never hammer any single server. The selector picks from the highest-priority non-delayed back queue, giving you both importance-ranking and politeness simultaneously.
          </p>
        }
      />

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Politeness — Per-Domain Rate Limiting</h2>
        <p className="text-sm text-muted-foreground">
          While one domain&apos;s crawl-delay is ticking down, the crawler fetches from others in parallel. Politeness does not mean slowness — it means parallelism across domains, not concurrency within a single domain.
        </p>
        <PolitenessDemo />
      </section>

      <ConversationalCallout type="tip">
        DNS resolution is a hidden bottleneck at scale. At 5 billion pages/day you make billions of DNS queries. Production crawlers run their own recursive DNS resolvers and cache aggressively (TTL of hours). Without DNS caching, resolving domains becomes slower than actually fetching pages.
      </ConversationalCallout>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Spider Trap Detection</h2>
        <p className="text-sm text-muted-foreground">
          Spider traps generate infinite unique URLs — calendar widgets, session IDs, combinatorial search parameters. A single trap can consume your entire crawl budget on worthless pages. URL length caps, depth limits, and pattern detection are the defenses.
        </p>
        <SpiderTrapDemo />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Distributed Crawling</h2>
        <p className="text-sm text-muted-foreground">
          A single machine cannot crawl the web. Domains are partitioned across crawler nodes via consistent hashing — each domain is owned by exactly one crawler, guaranteeing politeness and enabling horizontal scaling.
        </p>
        <DistributedFlow />
      </section>

      <ConversationalCallout type="question">
        Why Bloom filter instead of a hash set? At 10 billion URLs a hash set storing full URLs needs ~500 GB of RAM. A Bloom filter with 1% false positive rate needs only ~1.2 GB — a 400x reduction. The cost: occasionally re-crawling a page you already have. For a crawler, that trade-off is overwhelmingly worth it.
      </ConversationalCallout>

      <TopicQuiz
        questions={[
          {
            question: "Why does a web crawler use a Bloom filter instead of a hash set for URL deduplication?",
            options: [
              "Bloom filters are more accurate than hash sets",
              "Bloom filters never have false positives",
              "A Bloom filter uses ~1.2 GB for 10 billion URLs vs ~500 GB for a hash set — a 400x reduction",
              "Hash sets cannot store URLs"
            ],
            correctIndex: 2,
            explanation: "At 10 billion URLs, a hash set storing full URLs needs ~500 GB of RAM. A Bloom filter with 1% false positive rate needs only ~1.2 GB. The cost is occasionally re-crawling a page you already have — for a crawler, that tradeoff is overwhelmingly worth it."
          },
          {
            question: "Why does the URL Frontier use a two-tier queue instead of a simple FIFO?",
            options: [
              "FIFO queues are too slow for web crawling",
              "Front queues rank pages by importance; back queues enforce per-domain politeness — both are needed simultaneously",
              "Two-tier queues use less memory",
              "FIFO queues cannot handle duplicate URLs"
            ],
            correctIndex: 1,
            explanation: "A single FIFO queue crawls in arbitrary order. Front queues (one per priority level) rank pages by PageRank so important pages are crawled first. Back queues (one per domain) enforce crawl-delay so you never hammer any single server."
          },
          {
            question: "How does consistent hashing help with distributed crawling?",
            options: [
              "It makes each page load faster",
              "It ensures each domain is owned by exactly one crawler, guaranteeing politeness and enabling horizontal scaling",
              "It eliminates the need for a Bloom filter",
              "It encrypts the communication between crawlers"
            ],
            correctIndex: 1,
            explanation: "Consistent hashing maps each domain to one crawler node. This ensures politeness automatically (only one crawler touches a domain) and when a crawler fails, only its domains are redistributed — most crawlers keep their existing assignments."
          }
        ]}
      />

      <KeyTakeaway
        points={[
          "The URL Frontier is a two-tier queue: front queues rank pages by importance (PageRank), back queues enforce per-domain politeness (crawl-delay).",
          "Bloom filters give O(1) dedup using ~1.2 GB for 10 billion URLs vs 500 GB for a hash set — false positives just mean re-crawling a page once.",
          "Politeness is not optional — violating robots.txt gets you IP-banned permanently. Crawl many domains in parallel instead of hammering one domain.",
          "Spider trap detection (URL length limits, depth limits, param stripping) prevents infinite URL generators from consuming your entire crawl budget.",
          "Consistent hashing partitions domains across crawlers — each crawler owns a slice of the web, ensuring politeness and enabling horizontal scaling.",
          "DNS caching is critical at scale — without your own recursive resolver, DNS lookup time exceeds actual page fetch time.",
        ]}
      />
    </div>
  );
}
