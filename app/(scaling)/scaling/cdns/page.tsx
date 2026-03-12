"use client";

import { useState, useMemo, useCallback } from "react";
import { TopicHero } from "@/components/topic-hero";
import { KeyTakeaway } from "@/components/key-takeaway";
import { ConversationalCallout } from "@/components/conversational-callout";
import { AhaMoment } from "@/components/aha-moment";
import { BeforeAfter } from "@/components/before-after";
import { Playground } from "@/components/playground";
import { FlowDiagram, type FlowNode, type FlowEdge } from "@/components/flow-diagram";
import { LiveChart } from "@/components/live-chart";
import { useSimulation } from "@/hooks/use-simulation";
import { cn } from "@/lib/utils";

const n = (id: string, type: string, x: number, y: number, data: Record<string, unknown>): FlowNode =>
  ({ id, type, position: { x, y }, data } as FlowNode);

const REGIONS = {
  ny:     { label: "New York", edge: "us-east", hitMs: "12ms",  missMs: "~180ms" },
  london: { label: "London",   edge: "eu",       hitMs: "15ms",  missMs: "~210ms" },
  tokyo:  { label: "Tokyo",    edge: "apac",     hitMs: "10ms",  missMs: "~320ms" },
} as const;
type RegionKey = keyof typeof REGIONS;

const EDGE_POS: Record<string, [number, number]> = {
  "us-east": [260, 10], eu: [260, 115], apac: [260, 220],
};

/* ── 1. CDN Geography Playground ── */
function CDNGeographyPlayground() {
  const [region, setRegion] = useState<RegionKey>("ny");
  const [warm, setWarm] = useState<Record<string, boolean>>({ "us-east": false, eu: false, apac: false });
  const { edge, hitMs, missMs, label } = REGIONS[region];
  const hit = warm[edge];

  const sim = useSimulation({
    intervalMs: 1100, maxSteps: 6,
    onTick: (t) => { if (t >= 4) setWarm((p) => ({ ...p, [edge]: true })); },
    onReset: () => setWarm({ "us-east": false, eu: false, apac: false }),
  });
  const s = sim.step;

  const nodes: FlowNode[] = useMemo(() => [
    n("user", "clientNode", 20, 110, { label: `User (${label})`, sublabel: s >= 1 ? "Requesting asset..." : "Idle", status: "healthy", handles: { right: true } }),
    ...Object.entries(EDGE_POS).map(([id, [x, y]]) =>
      n(id, "cacheNode", x, y, {
        label: id === "us-east" ? "US-East Edge" : id === "eu" ? "EU Edge (London)" : "APAC Edge (Tokyo)",
        sublabel: warm[id] ? "Cached" : "Empty",
        status: id === edge && s >= 2 ? (hit ? "healthy" : "warning") : warm[id] ? "healthy" : "neutral",
        metrics: id === edge && s >= 2 ? [{ label: "Latency", value: hit ? hitMs : missMs }] : warm[id] ? [{ label: "Status", value: "Warm" }] : [],
        handles: { left: true, right: true },
      })
    ),
    n("origin", "serverNode", 510, 110, { label: "Origin Server", sublabel: !hit && s >= 3 ? "Serving request" : "Virginia", status: !hit && s >= 3 && s < 6 ? "warning" : "healthy", metrics: [{ label: "Location", value: "us-east-1" }], handles: { left: true } }),
  ], [region, s, warm, hit, edge, hitMs, missMs, label]);

  const edges: FlowEdge[] = useMemo(() => {
    const r: FlowEdge[] = [];
    if (s >= 1) r.push({ id: "ue", source: "user", target: edge, animated: s <= 2, label: "DNS → nearest PoP", style: { stroke: "#8b5cf6" } });
    if (!hit && s >= 3) r.push({ id: "eo", source: edge, target: "origin", animated: s < 5, label: "Cache MISS — fetch", style: { stroke: "#f59e0b" } });
    if (!hit && s >= 5) r.push({ id: "oe", source: "origin", target: edge, animated: s === 5, label: "Response + store", style: { stroke: "#10b981" } });
    if (hit && s >= 2) r.push({ id: "eu", source: edge, target: "user", animated: true, label: "Cache HIT!", style: { stroke: "#10b981" } });
    return r;
  }, [s, edge, hit]);

  const msg =
    s === 0 ? "Pick a location and press play." :
    s < 3   ? `Routing ${label} user to the ${edge} edge PoP via DNS...` :
    !hit && s < 5 ? "Cache MISS. Fetching from origin in Virginia..." :
    !hit && s >= 5 ? "Origin responded. Edge cached a copy for future requests." :
    `Cache HIT! Served from ${edge} edge in ${hitMs}. Origin never contacted.`;

  return (
    <Playground title="CDN Geography: Request Routing" simulation={sim} canvasHeight="min-h-[340px]"
      canvas={<FlowDiagram nodes={nodes} edges={edges} minHeight={340} interactive={false} allowDrag={false} />}
      explanation={(state) => (
        <div className="space-y-4">
          <div>
            <p className="text-[11px] font-medium text-muted-foreground mb-2">Choose user location:</p>
            <div className="flex gap-1.5 flex-wrap">
              {(Object.keys(REGIONS) as RegionKey[]).map((k) => (
                <button key={k} onClick={() => { setRegion(k); sim.reset(); }}
                  className={cn("px-2.5 py-1 rounded-md text-xs font-medium transition-colors",
                    region === k ? "bg-violet-500/20 text-violet-400 border border-violet-500/30" : "bg-muted/30 text-muted-foreground border border-border/30 hover:bg-muted/50")}>
                  {REGIONS[k].label}
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-lg bg-muted/20 border border-border/30 p-3 min-h-[52px]">
            <p className="text-[11px] leading-snug font-medium">{msg}</p>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { label: "Cache", value: hit ? "HIT" : s === 0 ? "—" : "MISS", color: hit ? "text-emerald-400" : s > 0 ? "text-amber-400" : "text-muted-foreground" },
              { label: "Edge",  value: edge, color: "text-violet-400" },
              { label: "Latency", value: s < 2 ? "—" : hit ? hitMs : state.step >= 5 ? missMs : "...", color: hit ? "text-emerald-400" : s >= 5 ? "text-amber-400" : "text-muted-foreground" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-md bg-muted/20 border border-border/30 p-2 text-center">
                <div className="text-[9px] text-muted-foreground uppercase tracking-wide">{stat.label}</div>
                <div className={cn("text-xs font-mono font-bold mt-0.5", stat.color)}>{stat.value}</div>
              </div>
            ))}
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground mb-1.5">Edge cache warmth:</p>
            {(["us-east", "eu", "apac"] as const).map((e) => (
              <div key={e} className="flex items-center gap-2 mb-1">
                <div className={cn("size-2 rounded-full transition-colors", warm[e] ? "bg-emerald-400" : "bg-muted-foreground/30")} />
                <span className="text-[10px] text-muted-foreground flex-1">{e}</span>
                <span className={cn("text-[10px] font-mono", warm[e] ? "text-emerald-400" : "text-muted-foreground/40")}>{warm[e] ? "warm" : "cold"}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    />
  );
}

/* ── Latency data ── */
const latencyData = [
  { city: "New York",   withoutCDN: 40,   withCDN: 12 },
  { city: "London",     withoutCDN: 850,  withCDN: 15 },
  { city: "Frankfurt",  withoutCDN: 920,  withCDN: 18 },
  { city: "Tokyo",      withoutCDN: 3200, withCDN: 10 },
  { city: "Sydney",     withoutCDN: 3800, withCDN: 22 },
  { city: "Sao Paulo",  withoutCDN: 2100, withCDN: 25 },
];

/* ── 2. Push vs Pull Playground ── */
function PushVsPullPlayground() {
  const [mode, setMode] = useState<"pull" | "push">("pull");
  const sim = useSimulation({ intervalMs: 1000, maxSteps: 5 });
  const s = sim.step;

  const nodes: FlowNode[] = useMemo(() => {
    if (mode === "pull") return [
      n("user",   "clientNode", 20,  80, { label: "User",   sublabel: s >= 1 ? "Requests /hero.jpg" : "Idle", status: "healthy", handles: { right: true } }),
      n("edge",   "cacheNode",  240, 80, { label: "Edge PoP", sublabel: s >= 3 ? "Now cached!" : "Empty", status: s >= 2 && s < 3 ? "warning" : s >= 3 ? "healthy" : "neutral", metrics: s >= 2 ? [{ label: "Status", value: s < 3 ? "MISS" : "HIT" }] : [], handles: { left: true, right: true } }),
      n("origin", "serverNode", 460, 80, { label: "Origin", sublabel: s >= 2 && s < 4 ? "Sending..." : "Idle", status: s >= 2 && s < 4 ? "warning" : "healthy", handles: { left: true } }),
    ];
    return [
      n("deploy", "serverNode", 20,  100, { label: "Deploy Pipeline", sublabel: s >= 1 ? "Pushing to all PoPs" : "New release ready", status: s >= 1 && s < 4 ? "warning" : "healthy", handles: { right: true } }),
      n("e1", "cacheNode", 290, 20,  { label: "Edge US-East", sublabel: s >= 2 ? "Pre-loaded" : "Waiting", status: s >= 2 ? "healthy" : "neutral", handles: { left: true } }),
      n("e2", "cacheNode", 290, 100, { label: "Edge EU",      sublabel: s >= 3 ? "Pre-loaded" : "Waiting", status: s >= 3 ? "healthy" : "neutral", handles: { left: true } }),
      n("e3", "cacheNode", 290, 180, { label: "Edge APAC",    sublabel: s >= 4 ? "Pre-loaded" : "Waiting", status: s >= 4 ? "healthy" : "neutral", handles: { left: true } }),
    ];
  }, [mode, s]);

  const edges: FlowEdge[] = useMemo(() => {
    if (mode === "pull") {
      const r: FlowEdge[] = [];
      if (s >= 1) r.push({ id: "ue", source: "user", target: "edge", animated: s < 3, label: "Request" });
      if (s >= 2) r.push({ id: "eo", source: "edge", target: "origin", animated: s === 2, label: "Fetch on miss", style: { stroke: "#f59e0b" } });
      if (s >= 3) r.push({ id: "oe", source: "origin", target: "edge", animated: s === 3, label: "Cache + serve", style: { stroke: "#10b981" } });
      return r;
    }
    if (s < 1) return [];
    return [
      { id: "d1", source: "deploy", target: "e1", animated: s < 3, label: "Push" },
      { id: "d2", source: "deploy", target: "e2", animated: s < 4, label: "Push" },
      { id: "d3", source: "deploy", target: "e3", animated: s < 5, label: "Push" },
    ];
  }, [mode, s]);

  const info = {
    pull: { title: "Pull CDN (most common)", color: "text-blue-400", examples: "Cloudflare, CloudFront, Fastly", pros: ["Content cached on demand — no upload step", "Storage-efficient (only popular assets kept)"], cons: ["First request per region is slow (cold cache)", "Origin still hit on every cache miss"] },
    push: { title: "Push CDN", color: "text-violet-400", examples: "S3 + CloudFront, Netlify, Vercel", pros: ["Zero cold-start latency — every request is a HIT", "Full control over what is cached and when"], cons: ["Slow deploys — must push to every PoP globally", "Pays storage cost even for unpopular content"] },
  };

  return (
    <Playground title="Push vs Pull CDN" simulation={sim} canvasHeight="min-h-[280px]"
      canvas={<FlowDiagram nodes={nodes} edges={edges} minHeight={280} interactive={false} allowDrag={false} />}
      explanation={() => (
        <div className="space-y-3">
          <div className="flex gap-1.5">
            {(["pull", "push"] as const).map((m) => (
              <button key={m} onClick={() => { setMode(m); sim.reset(); }}
                className={cn("flex-1 py-1.5 rounded-md text-xs font-semibold capitalize transition-colors",
                  mode === m ? "bg-violet-500/20 text-violet-400 border border-violet-500/30" : "bg-muted/30 text-muted-foreground border border-border/30 hover:bg-muted/50")}>
                {m} CDN
              </button>
            ))}
          </div>
          <p className={cn("text-[11px] font-semibold", info[mode].color)}>{info[mode].title}</p>
          <div className="space-y-1">
            {info[mode].pros.map((p) => <p key={p} className="text-[10px] text-emerald-400">+ {p}</p>)}
            {info[mode].cons.map((c) => <p key={c} className="text-[10px] text-amber-400">− {c}</p>)}
          </div>
          <p className="text-[10px] text-violet-400/70 italic">{info[mode].examples}</p>
        </div>
      )}
    />
  );
}

/* ── 3. Cache Invalidation Playground ── */
function CacheInvalidationPlayground() {
  const [strat, setStrat] = useState<"hash" | "ttl" | "purge">("hash");
  const sim = useSimulation({ intervalMs: 1100, maxSteps: 6 });
  const s = sim.step;

  const nodes: FlowNode[] = useMemo(() => {
    if (strat === "hash") return [
      n("build", "serverNode",  20,  60,  { label: "Build Pipeline", sublabel: s >= 1 ? "style.a3f8b2.css" : "Building...", status: "healthy", handles: { right: true } }),
      n("edge",  "cacheNode",   260, 10,  { label: "Edge Cache", sublabel: s >= 3 ? "a3f8b2 cached" : "Has 9e1d...", status: s >= 3 ? "healthy" : "neutral", metrics: [{ label: "Key", value: s >= 2 ? "a3f8b2" : "9e1d" }], handles: { left: true, right: true } }),
      n("user",  "clientNode",  500, 10,  { label: "User", sublabel: s >= 4 ? "Got new CSS!" : "Loading...", status: "healthy", handles: { left: true } }),
      n("html",  "gatewayNode", 260, 130, { label: "HTML Response", sublabel: s >= 2 ? "href=a3f8b2.css" : "href=9e1d.css", status: "healthy", handles: { left: true, right: true } }),
    ];
    if (strat === "ttl") return [
      n("origin", "serverNode", 20,  80, { label: "Origin", sublabel: "Cache-Control: max-age=60", status: "healthy", handles: { right: true } }),
      n("edge",   "cacheNode",  260, 80, { label: "Edge Cache", sublabel: s >= 3 ? "TTL expired — revalidating" : "Fresh", status: s >= 3 ? "warning" : "healthy", metrics: [{ label: "TTL", value: s >= 3 ? "0s" : `${Math.max(0, 60 - s * 20)}s` }], handles: { left: true, right: true } }),
      n("user",   "clientNode", 500, 80, { label: "User", sublabel: s >= 3 ? "Gets stale (SWR)" : "Cached response", status: "healthy", handles: { left: true } }),
    ];
    return [
      n("cms",  "serverNode",  20,  30,  { label: "CMS / Admin",    sublabel: s >= 1 ? "Content updated!" : "Idle",         status: s >= 1 ? "warning" : "healthy", handles: { right: true } }),
      n("api",  "gatewayNode", 260, 30,  { label: "CDN Purge API",  sublabel: s >= 2 ? "Purging..." : "Ready",              status: s >= 2 ? "warning" : "neutral",  handles: { left: true, right: true } }),
      n("e1",   "cacheNode",   480, 0,   { label: "Edge US",        sublabel: s >= 4 ? "Purged" : "Stale",                  status: s >= 4 ? "healthy" : "neutral",  handles: { left: true } }),
      n("e2",   "cacheNode",   480, 80,  { label: "Edge EU",        sublabel: s >= 4 ? "Purged" : "Stale",                  status: s >= 4 ? "healthy" : "neutral",  handles: { left: true } }),
      n("e3",   "cacheNode",   480, 160, { label: "Edge APAC",      sublabel: s >= 5 ? "Purged" : "Stale",                  status: s >= 5 ? "healthy" : "neutral",  handles: { left: true } }),
    ];
  }, [strat, s]);

  const edges: FlowEdge[] = useMemo(() => {
    const r: FlowEdge[] = [];
    if (strat === "hash") {
      if (s >= 1) r.push({ id: "bh", source: "build", target: "html", animated: s < 3, label: "New filename" });
      if (s >= 2) r.push({ id: "be", source: "build", target: "edge", animated: s < 4, label: "New cache entry" });
      if (s >= 4) r.push({ id: "eu", source: "edge", target: "user", animated: true, label: "Served!", style: { stroke: "#10b981" } });
    } else if (strat === "ttl") {
      if (s >= 1) r.push({ id: "eu", source: "edge", target: "user", animated: true, label: s >= 3 ? "Stale (SWR)" : "Cached" });
      if (s >= 3) r.push({ id: "eo", source: "edge", target: "origin", animated: true, label: "Revalidate", style: { stroke: "#f59e0b" } });
    } else {
      if (s >= 1) r.push({ id: "ca", source: "cms", target: "api", animated: s < 3, label: "Purge request" });
      if (s >= 3) {
        r.push({ id: "a1", source: "api", target: "e1", animated: s < 5, label: "Invalidate" });
        r.push({ id: "a2", source: "api", target: "e2", animated: s < 5, label: "Invalidate" });
        r.push({ id: "a3", source: "api", target: "e3", animated: s < 6, label: "Invalidate" });
      }
    }
    return r;
  }, [strat, s]);

  const stratInfo = {
    hash:  { title: "Content-Hashed Filenames", color: "text-emerald-400", desc: "New deploy = new filename = new cache key. Old and new coexist — zero purge needed.", verdict: "Best for static assets. Zero purge lag." },
    ttl:   { title: "Short TTL + Stale-While-Revalidate", color: "text-blue-400", desc: "Serve stale instantly, fetch fresh in background. Users never wait; content refreshes silently.", verdict: "Great for API responses and semi-dynamic pages." },
    purge: { title: "Purge API / Cache Tags", color: "text-violet-400", desc: "Call the CDN API to invalidate specific URLs or tag groups across all PoPs when content changes.", verdict: "Best for CMS-driven or editorial content." },
  };

  return (
    <Playground title="Cache Invalidation Strategies" simulation={sim} canvasHeight="min-h-[280px]"
      canvas={<FlowDiagram nodes={nodes} edges={edges} minHeight={280} interactive={false} allowDrag={false} />}
      explanation={() => (
        <div className="space-y-3">
          <div className="flex gap-1.5">
            {(["hash", "ttl", "purge"] as const).map((v) => (
              <button key={v} onClick={() => { setStrat(v); sim.reset(); }}
                className={cn("flex-1 px-1.5 py-1.5 rounded-md text-[10px] font-semibold transition-colors",
                  strat === v ? "bg-violet-500/20 text-violet-400 border border-violet-500/30" : "bg-muted/30 text-muted-foreground border border-border/30 hover:bg-muted/50")}>
                {v === "hash" ? "Hash Names" : v === "ttl" ? "TTL + SWR" : "Purge API"}
              </button>
            ))}
          </div>
          <div className="space-y-1.5">
            <p className="text-xs font-semibold">{stratInfo[strat].title}</p>
            <p className="text-[11px] text-muted-foreground leading-snug">{stratInfo[strat].desc}</p>
            <p className={cn("text-[10px] font-medium", stratInfo[strat].color)}>{stratInfo[strat].verdict}</p>
          </div>
        </div>
      )}
    />
  );
}

/* ── Main Page ── */
export default function CDNsPage() {
  return (
    <div className="space-y-8">
      <TopicHero
        title="Content Delivery Networks"
        subtitle="Your users in Tokyo should not wait for a server in Virginia. CDNs put your content within 20ms of every person on Earth — by moving the data closer, not the server faster."
        difficulty="beginner"
      />

      <section className="space-y-4">
        <h2 className="text-xl font-bold">The Speed of Light is Your Enemy</h2>
        <p className="text-sm text-muted-foreground">
          Light travels through fiber at ~200,000 km/s. A page load needs 4+ round-trips (DNS, TCP,
          TLS, HTTP). A user in Tokyo hitting a server in Virginia racks up{" "}
          <strong className="text-red-400">~560ms of pure physics</strong> before a single byte of
          your app loads. You cannot optimize the speed of light — you can only shorten the distance.
        </p>
        <LiveChart
          type="bar"
          data={latencyData}
          dataKeys={{ x: "city", y: ["withoutCDN", "withCDN"], label: ["Without CDN (ms)", "With CDN (ms)"] }}
          height={220}
          unit="ms"
          referenceLines={[{ y: 100, label: "100ms threshold", color: "#f59e0b" }]}
        />
        <p className="text-xs text-muted-foreground text-center">
          Round-trip latency to origin in us-east-1 (Virginia). A CDN collapses every city to under 25ms.
        </p>
      </section>

      <BeforeAfter
        before={{
          title: "Without CDN",
          content: (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Every request travels the full distance to origin. Physics applies equally to everyone.</p>
              <div className="space-y-2">
                {[{ city: "New York", latency: "40ms", ok: true }, { city: "London", latency: "850ms", ok: false }, { city: "Tokyo", latency: "3,200ms", ok: false }, { city: "Sydney", latency: "3,800ms", ok: false }].map((l) => (
                  <div key={l.city} className="flex items-center justify-between rounded-md bg-muted/20 px-3 py-1.5 border border-border/30">
                    <span className="text-[11px] font-medium">{l.city}</span>
                    <span className={cn("text-[11px] font-mono font-medium", l.ok ? "text-emerald-400" : "text-red-400")}>{l.latency}</span>
                  </div>
                ))}
              </div>
            </div>
          ),
        }}
        after={{
          title: "With CDN",
          content: (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Assets served from edge servers 20–50km away. Sub-25ms consistently, globally.</p>
              <div className="space-y-2">
                {[{ city: "New York", latency: "12ms" }, { city: "London", latency: "15ms" }, { city: "Tokyo", latency: "10ms" }, { city: "Sydney", latency: "22ms" }].map((l) => (
                  <div key={l.city} className="flex items-center justify-between rounded-md bg-muted/20 px-3 py-1.5 border border-border/30">
                    <span className="text-[11px] font-medium">{l.city}</span>
                    <span className="text-[11px] font-mono font-medium text-emerald-400">{l.latency}</span>
                  </div>
                ))}
              </div>
            </div>
          ),
        }}
      />

      <section className="space-y-4">
        <h2 className="text-xl font-bold">How Request Routing Works</h2>
        <p className="text-sm text-muted-foreground">
          CDNs operate hundreds of <strong>Points of Presence (PoPs)</strong> — edge servers placed
          globally near major population centers. DNS routes each user to the nearest PoP. A cache
          hit returns the asset immediately (~15ms). A cache miss fetches from origin, stores a copy,
          then responds (~200ms). Run each region below and watch the routing animation unfold.
        </p>
        <CDNGeographyPlayground />
      </section>

      <AhaMoment
        question="Why is the first request to any region always slow?"
        answer={
          <span>
            Edge servers start with an <strong>empty cache</strong>. The very first request for any
            asset at a PoP is a cache miss — the edge must travel all the way to origin. This is the{" "}
            <strong>cold start</strong> problem. After that single miss the edge caches the response,
            and every subsequent request from that region is fast. Pull CDNs are efficient precisely
            because only popular content fills the cache — unpopular assets never waste edge storage.
          </span>
        }
      />

      <section className="space-y-4">
        <h2 className="text-xl font-bold">Push vs Pull CDNs</h2>
        <p className="text-sm text-muted-foreground">
          Two philosophies for how content lands on edge servers. <strong>Pull CDNs</strong> are
          lazy — edges fetch from origin on demand. <strong>Push CDNs</strong> are eager — you
          pre-load every edge at deploy time. Most modern CDNs are pull-based, but many support push
          workflows for content that must be warm everywhere the moment you go live.
        </p>
        <PushVsPullPlayground />
      </section>

      <ConversationalCallout type="tip">
        In system design interviews, mention CDNs <strong>early</strong> when the problem involves
        global users or high read traffic. Say what you would cache and what you would not. The line
        &quot;static assets behind a CDN with content-hashed filenames and a 1-year max-age&quot;
        signals immediate practical experience.
      </ConversationalCallout>

      <section className="space-y-4">
        <h2 className="text-xl font-bold">Cache Invalidation</h2>
        <p className="text-sm text-muted-foreground">
          Once content is cached on hundreds of edge servers, updating it is non-trivial. Three
          strategies dominate, each trading simplicity against propagation speed and reliability.
        </p>
        <CacheInvalidationPlayground />
      </section>

      <AhaMoment
        question="Why use hashed filenames instead of purging the cache?"
        answer={
          <span>
            Purging propagates slowly — it can take minutes to reach 300+ PoPs, and during that
            window some users get old content while others get new. Content-hashed filenames like{" "}
            <code className="text-xs bg-muted px-1 rounded font-mono">style.a3f8b2.css</code>{" "}
            sidestep the problem entirely: old and new are <strong>different cache keys</strong>{" "}
            that coexist without conflict. No race conditions, no purge lag, no stale-content windows.
          </span>
        }
      />

      <section className="space-y-4">
        <h2 className="text-xl font-bold">What Belongs on a CDN</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { level: "Always",    bgClass: "bg-emerald-500/10", borderClass: "border-emerald-500/20", textClass: "text-emerald-400", items: "Images, CSS, JS bundles, fonts, videos, PDFs",                           ttl: "max-age=31536000 (1 year)",               strategy: "Content-hash filenames" },
            { level: "Often",     bgClass: "bg-blue-500/10",    borderClass: "border-blue-500/20",    textClass: "text-blue-400",    items: "Identical-for-all-users API responses (listings, blog posts)",          ttl: "max-age=60, stale-while-revalidate=30",   strategy: "Short TTLs with SWR" },
            { level: "Sometimes", bgClass: "bg-amber-500/10",   borderClass: "border-amber-500/20",   textClass: "text-amber-400",   items: "Personalized content (dashboards, recommendations)",                    ttl: "no-cache or Vary: Cookie",                strategy: "Edge compute (Workers, Lambda@Edge)" },
            { level: "Never",     bgClass: "bg-red-500/10",     borderClass: "border-red-500/20",     textClass: "text-red-400",     items: "Write operations, real-time data, auth endpoints",                     ttl: "no-store",                                strategy: "Pass through to origin directly" },
          ].map((c) => (
            <div key={c.level} className={cn("rounded-lg border p-3 space-y-1", c.bgClass, c.borderClass)}>
              <h4 className={cn("text-xs font-semibold", c.textClass)}>{c.level} CDN</h4>
              <p className="text-[10px] text-muted-foreground">{c.items}</p>
              <p className="text-[9px] font-mono text-muted-foreground/60">{c.ttl}</p>
              <p className="text-[9px] text-muted-foreground/50 italic">{c.strategy}</p>
            </div>
          ))}
        </div>
      </section>

      <ConversationalCallout type="warning">
        A CDN misconfiguration can expose sensitive data at scale. In 2013, a major airline
        accidentally cached a personalized booking page — passengers saw{" "}
        <strong>other people&apos;s boarding passes</strong>. Always verify that authenticated or
        personalized responses include{" "}
        <code className="text-xs bg-muted px-1 rounded font-mono">Cache-Control: no-store</code>{" "}
        before placing them behind a CDN.
      </ConversationalCallout>

      <ConversationalCallout type="question">
        Modern CDNs are far more than static file caches. Cloudflare Workers and Lambda@Edge let you
        run code at the edge — A/B tests, geo-redirects, JWT validation, full API responses — without
        touching your origin. CDNs also absorb DDoS traffic, terminate TLS, compress assets on the
        fly, and apply WAF rules. Think of a CDN as a programmable compute layer that happens to live
        20ms from every user on Earth.
      </ConversationalCallout>

      <KeyTakeaway
        points={[
          "CDNs cache content on edge servers near users, cutting latency from hundreds of ms to under 20ms globally.",
          "Physics is the bottleneck: light through fiber at ~200,000 km/s, 4+ round-trips per page. CDNs shorten the path.",
          "Pull CDNs fetch on demand (first regional request is slow); push CDNs pre-load all edges at deploy time.",
          "Cache hit rate is the key metric — target 90%+ with correct Cache-Control headers and content-hashed filenames.",
          "Use hashed filenames for static assets, short TTLs + SWR for dynamic content, purge APIs for CMS pages.",
          "Modern CDNs offer edge compute, DDoS mitigation, TLS termination, and WAF — not just file caching.",
        ]}
      />
    </div>
  );
}
