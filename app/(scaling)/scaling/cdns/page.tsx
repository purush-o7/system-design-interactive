"use client";

import { useState, useEffect } from "react";
import { TopicHero } from "@/components/topic-hero";
import { FailureScenario } from "@/components/failure-scenario";
import { WhyItBreaks } from "@/components/why-it-breaks";
import { ConceptVisualizer } from "@/components/concept-visualizer";
import { CorrectApproach } from "@/components/correct-approach";
import { KeyTakeaway } from "@/components/key-takeaway";
import { BeforeAfter } from "@/components/before-after";
import { ServerNode } from "@/components/server-node";
import { MetricCounter } from "@/components/metric-counter";
import { InteractiveDemo } from "@/components/interactive-demo";
import { ScaleSimulator } from "@/components/scale-simulator";
import { AhaMoment } from "@/components/aha-moment";
import { ConversationalCallout } from "@/components/conversational-callout";
import { cn } from "@/lib/utils";
import { Globe, ArrowRight, Zap, MapPin, RefreshCw, Shield, CheckCircle2 } from "lucide-react";

/* ── Global Edge Network Visualization ── */
function EdgeNetworkViz() {
  const [activeRegion, setActiveRegion] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setActiveRegion((s) => (s + 1) % 6), 2000);
    return () => clearInterval(t);
  }, []);

  const regions = [
    { name: "New York", lat: 65, left: 28, latency: 12, pops: 8 },
    { name: "London", lat: 30, left: 48, latency: 15, pops: 6 },
    { name: "Frankfurt", lat: 32, left: 52, latency: 18, pops: 5 },
    { name: "Tokyo", lat: 38, left: 82, latency: 10, pops: 7 },
    { name: "Sydney", lat: 78, left: 85, latency: 22, pops: 3 },
    { name: "Sao Paulo", lat: 72, left: 32, latency: 25, pops: 4 },
  ];

  const origin = { lat: 55, left: 25, name: "Origin (Virginia)" };

  return (
    <div className="space-y-4">
      {/* Map-like visualization */}
      <div className="relative w-full h-48 rounded-lg bg-muted/10 border border-border/30 overflow-hidden">
        {/* Grid lines for geography feel */}
        {[20, 40, 60, 80].map((y) => (
          <div
            key={`h-${y}`}
            className="absolute w-full border-t border-border/10"
            style={{ top: `${y}%` }}
          />
        ))}
        {[20, 40, 60, 80].map((x) => (
          <div
            key={`v-${x}`}
            className="absolute h-full border-l border-border/10"
            style={{ left: `${x}%` }}
          />
        ))}

        {/* Origin server */}
        <div
          className="absolute flex flex-col items-center transition-all z-10"
          style={{ top: `${origin.lat}%`, left: `${origin.left}%`, transform: "translate(-50%, -50%)" }}
        >
          <div className="size-4 rounded-full bg-blue-500 border-2 border-blue-300 shadow-lg shadow-blue-500/30" />
          <span className="text-[8px] font-mono text-blue-300 mt-0.5 whitespace-nowrap">Origin</span>
        </div>

        {/* Edge nodes */}
        {regions.map((region, i) => (
          <div
            key={region.name}
            className="absolute flex flex-col items-center transition-all z-10"
            style={{ top: `${region.lat}%`, left: `${region.left}%`, transform: "translate(-50%, -50%)" }}
          >
            {/* Connection line to origin (when active) */}
            {activeRegion === i && (
              <div className="absolute w-px h-0 animate-ping">
                <Zap className="size-3 text-emerald-400" />
              </div>
            )}
            <div
              className={cn(
                "size-3 rounded-full transition-all duration-500",
                activeRegion === i
                  ? "bg-emerald-400 scale-150 shadow-lg shadow-emerald-500/40"
                  : "bg-emerald-500/60"
              )}
            />
            <span
              className={cn(
                "text-[8px] font-mono mt-0.5 whitespace-nowrap transition-colors",
                activeRegion === i ? "text-emerald-300" : "text-muted-foreground/50"
              )}
            >
              {region.name}
            </span>
          </div>
        ))}
      </div>

      {/* Active region details */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-lg bg-muted/30 p-2 text-center">
          <div className="text-[10px] text-muted-foreground">Active PoP</div>
          <div className="text-xs font-mono font-bold text-emerald-400">
            {regions[activeRegion].name}
          </div>
        </div>
        <div className="rounded-lg bg-muted/30 p-2 text-center">
          <div className="text-[10px] text-muted-foreground">Edge Latency</div>
          <div className="text-xs font-mono font-bold">{regions[activeRegion].latency}ms</div>
        </div>
        <div className="rounded-lg bg-muted/30 p-2 text-center">
          <div className="text-[10px] text-muted-foreground">PoPs in Region</div>
          <div className="text-xs font-mono font-bold">{regions[activeRegion].pops}</div>
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground/60 text-center">
        Cloudflare operates 330+ PoPs globally. AWS CloudFront has 750+ edge locations across 100+ cities.
        Akamai has 4,000+ edge servers worldwide.
      </p>
    </div>
  );
}

/* ── Cache Hit/Miss Flow Animation ── */
function CacheHitMissViz() {
  const [scenario, setScenario] = useState<"hit" | "miss">("miss");
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setStep((s) => {
        if (s >= 5) {
          setScenario((sc) => (sc === "miss" ? "hit" : "miss"));
          return 0;
        }
        return s + 1;
      });
    }, 1200);
    return () => clearInterval(t);
  }, []);

  const missSteps = [
    { label: "User requests style.css", active: true, node: "user" },
    { label: "Request hits nearest edge PoP", active: true, node: "edge" },
    { label: "Cache MISS -- asset not in edge cache", active: true, node: "check" },
    { label: "Edge fetches from origin server", active: true, node: "origin" },
    { label: "Edge caches a copy + returns to user", active: true, node: "cache" },
    { label: "Response served: ~180ms total", active: true, node: "done" },
  ];

  const hitSteps = [
    { label: "User requests style.css", active: true, node: "user" },
    { label: "Request hits nearest edge PoP", active: true, node: "edge" },
    { label: "Cache HIT -- found in edge cache!", active: true, node: "check" },
    { label: "Served directly from edge", active: true, node: "serve" },
    { label: "Response served: ~15ms total", active: true, node: "done" },
    { label: "Origin never contacted", active: true, node: "skip" },
  ];

  const steps = scenario === "miss" ? missSteps : hitSteps;

  return (
    <div className="space-y-4">
      <div className="flex gap-2 justify-center">
        <span
          className={cn(
            "px-3 py-1 rounded-full text-[10px] font-mono font-medium transition-colors",
            scenario === "miss"
              ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
              : "bg-muted/30 text-muted-foreground/50"
          )}
        >
          Cache Miss (1st request)
        </span>
        <span
          className={cn(
            "px-3 py-1 rounded-full text-[10px] font-mono font-medium transition-colors",
            scenario === "hit"
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : "bg-muted/30 text-muted-foreground/50"
          )}
        >
          Cache Hit (2nd+ request)
        </span>
      </div>

      <div className="space-y-1.5">
        {steps.map((s, i) => (
          <div key={`${scenario}-${i}`} className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-muted-foreground/50 w-5 text-right">{i + 1}</span>
            <div
              className={cn(
                "flex-1 flex items-center px-3 h-7 rounded-md text-xs font-medium transition-all duration-300 border",
                i < step
                  ? scenario === "hit"
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    : "bg-orange-500/10 border-orange-500/20 text-orange-400"
                  : i === step
                  ? "bg-blue-500/10 border-blue-500/30 text-blue-400 ring-1 ring-blue-500/20"
                  : "bg-muted/20 border-border/50 text-muted-foreground/40"
              )}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-8 pt-2">
        <div className="text-center">
          <div className={cn(
            "text-xl font-mono font-bold",
            scenario === "hit" ? "text-emerald-400" : "text-orange-400"
          )}>
            {scenario === "hit" ? "~15ms" : "~180ms"}
          </div>
          <div className="text-[10px] text-muted-foreground">Total latency</div>
        </div>
        <div className="text-center">
          <div className={cn(
            "text-xl font-mono font-bold",
            scenario === "hit" ? "text-emerald-400" : "text-muted-foreground"
          )}>
            {scenario === "hit" ? "0" : "1"}
          </div>
          <div className="text-[10px] text-muted-foreground">Origin requests</div>
        </div>
      </div>
    </div>
  );
}

/* ── Tiered Cache Architecture ── */
function TieredCacheViz() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % 5), 1800);
    return () => clearInterval(t);
  }, []);

  const tiers = [
    {
      label: "L1: Edge PoP (Lower Tier)",
      desc: "Closest to user. Checks local cache first.",
      latency: "~10ms",
      hit: step >= 1 && step < 2,
      checked: step >= 1,
    },
    {
      label: "L2: Regional Edge Cache (Upper Tier)",
      desc: "Shared cache for nearby PoPs. Reduces origin load.",
      latency: "~30ms",
      hit: step >= 2 && step < 3,
      checked: step >= 2,
    },
    {
      label: "L3: Origin Shield",
      desc: "Single cache in front of origin. Last line of defense.",
      latency: "~60ms",
      hit: step >= 3 && step < 4,
      checked: step >= 3,
    },
    {
      label: "Origin Server",
      desc: "Your actual server. Only contacted on complete cache miss.",
      latency: "~150ms+",
      hit: false,
      checked: step >= 4,
    },
  ];

  return (
    <div className="space-y-3">
      {tiers.map((tier, i) => (
        <div key={tier.label} className="flex items-center gap-3">
          <div
            className={cn(
              "flex-1 rounded-lg border p-2.5 transition-all duration-300",
              tier.checked && step === i + 1
                ? "bg-blue-500/10 border-blue-500/30 ring-1 ring-blue-500/20"
                : tier.checked
                ? i < 3
                  ? "bg-muted/20 border-border/50"
                  : "bg-orange-500/5 border-orange-500/20"
                : "bg-muted/10 border-border/30"
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold">{tier.label}</span>
              <span className={cn(
                "text-[10px] font-mono",
                tier.checked ? "text-muted-foreground" : "text-transparent"
              )}>
                {tier.latency}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">{tier.desc}</p>
          </div>
          {i < tiers.length - 1 && (
            <ArrowRight className={cn(
              "size-3 shrink-0 transition-colors",
              tier.checked && !tier.hit ? "text-orange-400" : "text-muted-foreground/20"
            )} />
          )}
        </div>
      ))}
      <p className="text-[10px] text-muted-foreground/60 text-center">
        {step === 0
          ? "Request arrives..."
          : step === 1
          ? "Checking L1 edge cache... Miss. Escalating to regional cache."
          : step === 2
          ? "Checking L2 regional cache... Miss. Trying origin shield."
          : step === 3
          ? "Checking L3 origin shield... Miss. Fetching from origin."
          : "Origin responded. Response cached at all three tiers for future requests."}
      </p>
    </div>
  );
}

/* ── Latency Physics Calculator ── */
function LatencyPhysicsViz() {
  const [distance, setDistance] = useState(14000); // km

  // Speed of light in fiber: ~200,000 km/s
  const oneWay = Math.round((distance / 200000) * 1000); // ms
  const roundTrips = 4; // DNS + TCP + TLS + HTTP
  const totalPhysics = oneWay * 2 * roundTrips;

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-muted-foreground">Distance to origin</span>
          <span className="font-mono font-semibold">{distance.toLocaleString()} km</span>
        </div>
        <input
          type="range"
          min={100}
          max={20000}
          step={100}
          value={distance}
          onChange={(e) => setDistance(Number(e.target.value))}
          className="w-full accent-primary h-1 rounded-full cursor-pointer"
        />
        <div className="flex justify-between text-[9px] text-muted-foreground/40 font-mono">
          <span>100 km (same city)</span>
          <span>20,000 km (antipodal)</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {[
          { label: "Speed in fiber", value: "200,000 km/s", sub: "2/3 speed of light" },
          { label: "One-way latency", value: `${oneWay}ms`, sub: `${distance.toLocaleString()} km / 200k km/s` },
          { label: "Round-trip (1x)", value: `${oneWay * 2}ms`, sub: "There and back" },
          { label: `Total (${roundTrips} round-trips)`, value: `${totalPhysics}ms`, sub: "DNS + TCP + TLS + HTTP" },
        ].map((item) => (
          <div key={item.label} className="rounded-lg bg-muted/30 p-2 border border-border/30">
            <div className="text-[10px] text-muted-foreground">{item.label}</div>
            <div className={cn(
              "text-sm font-mono font-bold",
              totalPhysics > 300 ? "text-red-400" : totalPhysics > 100 ? "text-amber-400" : "text-emerald-400"
            )}>
              {item.value}
            </div>
            <div className="text-[9px] text-muted-foreground/50">{item.sub}</div>
          </div>
        ))}
      </div>

      <p className="text-[10px] text-muted-foreground/60 text-center">
        {totalPhysics > 400
          ? `${totalPhysics}ms of pure physics delay -- before any server processing. This is why CDNs exist.`
          : totalPhysics > 100
          ? `${totalPhysics}ms is noticeable. A nearby CDN edge would reduce this to ~20-40ms.`
          : `${totalPhysics}ms is fast -- the user is close to the origin. CDN benefit is smaller here.`}
      </p>
    </div>
  );
}

/* ── Cache Headers Explained ── */
function CacheHeadersViz() {
  const [selectedHeader, setSelectedHeader] = useState(0);

  const headers = [
    {
      name: "Cache-Control: max-age=31536000",
      meaning: "Cache for 1 year. Perfect for versioned assets (style.a3f8b2.css).",
      type: "Aggressive" as const,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      name: "Cache-Control: max-age=300, stale-while-revalidate=60",
      meaning: "Cache for 5 minutes. After expiry, serve stale for 60s while fetching fresh copy in background.",
      type: "Balanced" as const,
      color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    },
    {
      name: "Cache-Control: no-cache",
      meaning: "Always revalidate with origin before serving. Edge still caches but checks freshness every time.",
      type: "Cautious" as const,
      color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    },
    {
      name: "Cache-Control: no-store",
      meaning: "Never cache. For sensitive data like banking responses or personal health records.",
      type: "None" as const,
      color: "text-red-400 bg-red-500/10 border-red-500/20",
    },
  ];

  return (
    <div className="space-y-2">
      {headers.map((h, i) => (
        <button
          key={h.name}
          onClick={() => setSelectedHeader(i)}
          className={cn(
            "w-full text-left rounded-lg border p-2.5 transition-all",
            selectedHeader === i
              ? cn(h.color, "ring-1 ring-current/20")
              : "border-border/30 bg-muted/10 hover:bg-muted/20"
          )}
        >
          <div className="flex items-center justify-between">
            <code className="text-[10px] font-mono font-medium">{h.name}</code>
            <span className={cn(
              "text-[9px] font-medium px-1.5 py-0.5 rounded-full",
              h.color
            )}>
              {h.type}
            </span>
          </div>
          {selectedHeader === i && (
            <p className="text-[10px] text-muted-foreground mt-1.5">{h.meaning}</p>
          )}
        </button>
      ))}
    </div>
  );
}

export default function CDNsPage() {
  return (
    <div className="space-y-8">
      <TopicHero
        title="Content Delivery Networks"
        subtitle="Why your users in Tokyo should not wait for a server in Virginia to send them a JavaScript bundle. CDNs put your content within 20ms of every user on Earth."
        difficulty="beginner"
      />

      <FailureScenario title="Your international launch fails before it starts">
        <p className="text-sm text-muted-foreground">
          Your app is hosted on a single origin server in Virginia (us-east-1). Users in New York
          enjoy 40ms page loads. But your product just launched in Japan, and
          <strong className="text-red-400"> users in Tokyo wait 3.2 seconds</strong> for the page to render.
          Images load in visible chunks. The JavaScript bundle takes 2 seconds to download.
          Your Tokyo bounce rate is 68% -- two-thirds of users leave before the page finishes loading.
          Your international expansion is dead on arrival.
        </p>
        <div className="flex justify-center items-center gap-4 pt-3">
          <div className="text-center">
            <ServerNode type="client" label="Tokyo User" sublabel="3,200ms" status="unhealthy" />
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[10px] text-muted-foreground font-mono">~14,000 km</span>
            <div className="w-16 border-t border-dashed border-muted-foreground/30" />
            <span className="text-[10px] text-red-400 font-mono">4 round-trips</span>
          </div>
          <div className="text-center">
            <ServerNode type="server" label="Origin" sublabel="Virginia" status="healthy" />
          </div>
        </div>
      </FailureScenario>

      <WhyItBreaks title="The speed of light is the bottleneck -- and you cannot fix physics">
        <p className="text-sm text-muted-foreground">
          Data travels through fiber optic cables at roughly 200,000 km/s -- two-thirds the speed
          of light in a vacuum. A round trip from Tokyo to Virginia (14,000 km each way) takes
          <strong> at minimum 140ms</strong> just for physics. But a web page requires multiple round
          trips: DNS, TCP handshake, TLS negotiation, HTTP request. Each one pays the latency tax.
        </p>
        <LatencyPhysicsViz />
      </WhyItBreaks>

      <BeforeAfter
        before={{
          title: "Without CDN",
          content: (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Every request travels the full distance to your origin, regardless of where the user
                is located. Physics cannot be optimized away.
              </p>
              <div className="space-y-2">
                {[
                  { city: "New York", latency: "40ms", status: "healthy" as const },
                  { city: "London", latency: "850ms", status: "warning" as const },
                  { city: "Tokyo", latency: "3,200ms", status: "unhealthy" as const },
                  { city: "Sydney", latency: "3,800ms", status: "unhealthy" as const },
                ].map((loc) => (
                  <div key={loc.city} className="flex items-center justify-between rounded-md bg-muted/20 px-3 py-1.5 border border-border/30">
                    <span className="text-[11px] font-medium">{loc.city}</span>
                    <span className={cn(
                      "text-[11px] font-mono font-medium",
                      loc.status === "healthy" ? "text-emerald-400" : loc.status === "warning" ? "text-amber-400" : "text-red-400"
                    )}>
                      {loc.latency}
                    </span>
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
              <p className="text-sm text-muted-foreground">
                Static assets are cached on edge servers near users. Most requests never reach
                your origin server. Consistent sub-50ms globally.
              </p>
              <div className="space-y-2">
                {[
                  { city: "New York", latency: "12ms", status: "healthy" as const },
                  { city: "London", latency: "15ms", status: "healthy" as const },
                  { city: "Tokyo", latency: "10ms", status: "healthy" as const },
                  { city: "Sydney", latency: "22ms", status: "healthy" as const },
                ].map((loc) => (
                  <div key={loc.city} className="flex items-center justify-between rounded-md bg-muted/20 px-3 py-1.5 border border-border/30">
                    <span className="text-[11px] font-medium">{loc.city}</span>
                    <span className="text-[11px] font-mono font-medium text-emerald-400">
                      {loc.latency}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ),
        }}
      />

      <ConceptVisualizer title="Global Edge Network">
        <p className="text-sm text-muted-foreground mb-4">
          CDN providers operate hundreds of Points of Presence (PoPs) worldwide. When a user requests
          content, DNS routes them to the nearest PoP. Content is served from edge cache in under 20ms,
          regardless of where the origin server lives.
        </p>
        <EdgeNetworkViz />
      </ConceptVisualizer>

      <ConceptVisualizer title="Cache Hit vs Cache Miss -- The Two Paths">
        <p className="text-sm text-muted-foreground mb-4">
          The first request to an edge location for a given asset is always a <strong>cache miss</strong> --
          the edge must fetch it from origin. Every subsequent request from that region is a
          <strong> cache hit</strong>, served directly from edge in under 20ms. Watch both flows:
        </p>
        <CacheHitMissViz />
      </ConceptVisualizer>

      <ConceptVisualizer title="Tiered Cache Architecture">
        <p className="text-sm text-muted-foreground mb-4">
          Modern CDNs like Cloudflare and CloudFront use a tiered caching architecture to reduce origin
          load even further. Instead of every edge PoP going directly to origin on a cache miss, they
          check intermediate &quot;upper tier&quot; caches first. This can reduce origin requests by 90%+.
        </p>
        <TieredCacheViz />
      </ConceptVisualizer>

      <CorrectApproach title="Cache-Control Headers -- The Rules of Caching">
        <p className="text-sm text-muted-foreground mb-4">
          Your origin server tells the CDN <em>how</em> to cache each response using
          <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">Cache-Control</code> headers.
          Getting these right is the difference between a 95% hit rate and a 30% hit rate. Click each
          header to learn when to use it:
        </p>
        <CacheHeadersViz />
      </CorrectApproach>

      <CorrectApproach title="What to Put on a CDN">
        <div className="grid grid-cols-2 gap-2">
          {[
            {
              level: "Always",
              color: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
              items: "Images, CSS, JS bundles, fonts, videos, PDFs",
              ttl: "max-age=31536000 (1 year)",
              strategy: "Content-hash filenames (style.a3f8b2.css)",
            },
            {
              level: "Often",
              color: "bg-blue-500/10 border-blue-500/20 text-blue-400",
              items: "API responses same for all users (product listings, blog posts)",
              ttl: "max-age=60, stale-while-revalidate=30",
              strategy: "Short TTLs with background revalidation",
            },
            {
              level: "Sometimes",
              color: "bg-amber-500/10 border-amber-500/20 text-amber-400",
              items: "Personalized content (dashboards, recommendations)",
              ttl: "no-cache or Vary: Cookie",
              strategy: "Edge compute (Cloudflare Workers, Lambda@Edge)",
            },
            {
              level: "Never",
              color: "bg-red-500/10 border-red-500/20 text-red-400",
              items: "Write operations, real-time data, auth endpoints",
              ttl: "no-store",
              strategy: "Pass through to origin directly",
            },
          ].map((cat) => (
            <div key={cat.level} className={cn("rounded-lg border p-3 space-y-1", cat.color)}>
              <h4 className="text-xs font-semibold">{cat.level} CDN</h4>
              <p className="text-[10px] text-muted-foreground">{cat.items}</p>
              <p className="text-[9px] font-mono text-muted-foreground/60">{cat.ttl}</p>
              <p className="text-[9px] text-muted-foreground/50 italic">{cat.strategy}</p>
            </div>
          ))}
        </div>
      </CorrectApproach>

      <ScaleSimulator
        title="CDN Impact Simulator"
        min={10}
        max={99}
        step={1}
        unit="% cache hit rate"
        metrics={(value) => {
          const totalRps = 10000;
          const originRps = Math.round(totalRps * (1 - value / 100));
          const avgLatency = Math.round(200 * (1 - value / 100) + 15 * (value / 100));
          const bandwidthSaved = value;
          return [
            { label: "Origin RPS", value: originRps, unit: "req/s" },
            { label: "Avg Latency", value: avgLatency, unit: "ms" },
            { label: "Bandwidth Saved", value: bandwidthSaved, unit: "%" },
          ];
        }}
      >
        {({ value }) => {
          const originRps = Math.round(10000 * (1 - value / 100));
          const originServers = Math.max(1, Math.ceil(originRps / 2000));
          const nocdnServers = Math.ceil(10000 / 2000);

          return (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <div className="text-[10px] text-muted-foreground">Cache Hits</div>
                  <div className="text-xl font-mono font-bold text-emerald-400">{value}%</div>
                  <div className="text-[10px] text-muted-foreground">Served from edge (~15ms)</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                  <div className="text-[10px] text-muted-foreground">Cache Misses</div>
                  <div className="text-xl font-mono font-bold text-orange-400">{100 - value}%</div>
                  <div className="text-[10px] text-muted-foreground">Fetched from origin (~200ms)</div>
                </div>
              </div>

              <div className="rounded-lg bg-muted/20 border border-border/30 p-3">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">Origin servers needed:</span>
                  <span className="font-mono font-bold">
                    {originServers} <span className="text-muted-foreground/50 font-normal">
                      (vs {nocdnServers} without CDN)
                    </span>
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] mt-1">
                  <span className="text-muted-foreground">Origin cost savings:</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {Math.round((1 - originServers / nocdnServers) * 100)}%
                  </span>
                </div>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                {value >= 95
                  ? "Excellent! At 95%+ hit rate, your origin handles almost no static traffic. This is typical for well-configured CDNs with proper Cache-Control headers."
                  : value >= 80
                  ? "Good hit rate. Check if some assets have TTLs that are too short, or if query strings are busting the cache unnecessarily."
                  : value >= 50
                  ? "Moderate hit rate. Review your Cache-Control headers. Are you setting no-cache on assets that could be cached? Are dynamic query strings varying the cache key?"
                  : "Low hit rate. Your CDN is barely helping. Check: (1) Are Cache-Control headers set? (2) Are URLs stable (no random query strings)? (3) Is Vary: * set accidentally?"}
              </p>
            </div>
          );
        }}
      </ScaleSimulator>

      <InteractiveDemo title="Cache Invalidation Strategies">
        {({ isPlaying, tick }) => {
          const strategies = [
            {
              name: "Content-Hashed Filenames",
              example: "style.a3f8b2c4.css",
              how: "Build tool generates unique hash from file contents. New deploy = new filename = new cache entry.",
              pros: "Perfect cache invalidation. Old and new versions coexist. No purge needed.",
              cons: "Only works for static assets. Requires build tooling.",
              best: true,
            },
            {
              name: "Short TTL + stale-while-revalidate",
              example: "max-age=60, stale-while-revalidate=30",
              how: "Content expires after 60s. For the next 30s, serve stale while fetching fresh in background.",
              pros: "Users always get fast responses. Fresh data within ~60s of changes.",
              cons: "Users may see stale data for up to 90 seconds.",
              best: false,
            },
            {
              name: "Purge API / Cache Tags",
              example: "POST /purge {\"tags\": [\"product-123\"]}",
              how: "On content update, call CDN API to purge specific URLs or tagged content.",
              pros: "Instant invalidation. Granular control.",
              cons: "Requires integration with your deploy/CMS pipeline. API rate limits apply.",
              best: false,
            },
          ];

          const activeIdx = isPlaying ? tick % strategies.length : 0;
          const active = strategies[activeIdx];

          return (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                If a CDN caches old content, how do users get updates? Press play to cycle through
                the three main invalidation strategies.
              </p>
              <div className="flex gap-2">
                {strategies.map((s, i) => (
                  <div
                    key={s.name}
                    className={cn(
                      "flex-1 rounded-md border px-2 py-1 text-center transition-all cursor-pointer",
                      i === activeIdx
                        ? "border-primary/40 bg-primary/5"
                        : "border-border/30 bg-muted/10"
                    )}
                  >
                    <span className="text-[10px] font-medium">{s.name}</span>
                  </div>
                ))}
              </div>
              <div className="rounded-lg border border-border/50 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold">{active.name}</h4>
                  {active.best && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Recommended
                    </span>
                  )}
                </div>
                <code className="text-[10px] font-mono text-muted-foreground bg-muted/30 px-2 py-1 rounded block">
                  {active.example}
                </code>
                <p className="text-[11px] text-muted-foreground">{active.how}</p>
                <div className="flex gap-4 text-[10px]">
                  <span><span className="text-emerald-400">+</span> {active.pros}</span>
                </div>
                <div className="flex gap-4 text-[10px]">
                  <span><span className="text-red-400">-</span> {active.cons}</span>
                </div>
              </div>
            </div>
          );
        }}
      </InteractiveDemo>

      <AhaMoment
        question="Why do CDNs use content-hashed filenames instead of just purging the old cache?"
        answer={
          <span>
            Purging is <strong>slow and unreliable</strong> -- it can take minutes to propagate across 300+ PoPs,
            and some users may still have the old version cached in their browser. Content-hashed filenames
            (<code className="text-xs bg-muted px-1 rounded font-mono">style.a3f8b2.css</code>) sidestep
            the problem entirely: the new filename is a completely new cache entry, so old and new versions
            coexist. Users loading the new HTML get the new CSS filename and fetch it fresh. Users with the
            old HTML continue using the old CSS. No race conditions.
          </span>
        }
      />

      <AhaMoment
        question="If CDNs cache content, how do you protect against serving sensitive data from the cache?"
        answer={
          <span>
            Use <code className="text-xs bg-muted px-1 rounded font-mono">Cache-Control: no-store</code> for
            any response containing user-specific or sensitive data. Also use the
            <code className="text-xs bg-muted px-1 rounded font-mono">Vary</code> header to tell the CDN
            which request headers affect the response (e.g., <code className="text-xs bg-muted px-1 rounded font-mono">Vary: Cookie</code>).
            Never cache authenticated API responses without extreme caution -- a misconfigured CDN that
            caches a response with <code className="text-xs bg-muted px-1 rounded font-mono">Set-Cookie</code> can
            serve one user&apos;s session to another.
          </span>
        }
      />

      <ConversationalCallout type="warning">
        A CDN misconfiguration can be catastrophic. In 2013, a major airline cached a personalized
        booking page -- passengers saw <strong>other people&apos;s boarding passes</strong> with their
        names, flight details, and seat assignments. Always verify that authenticated or personalized
        responses include <code className="text-xs bg-muted px-1 rounded font-mono">Cache-Control: no-store</code>.
      </ConversationalCallout>

      <ConversationalCallout type="tip">
        In system design interviews, mention CDNs <strong>early</strong> when the problem involves global
        users or high read traffic. State what you would cache (static assets, read-heavy API responses)
        and what you would not (writes, personalized data). Mention your cache invalidation strategy.
        The sentence &quot;we put static assets behind a CDN like CloudFront with content-hashed filenames
        and a 1-year max-age&quot; instantly signals that you understand the practical side of CDNs.
      </ConversationalCallout>

      <ConversationalCallout type="question">
        Modern CDNs do far more than cache static files. Cloudflare Workers and Lambda@Edge let you
        run code at the edge -- A/B testing, geo-redirects, authentication, even full API responses.
        CDNs also provide DDoS protection (absorbing attack traffic across 300+ PoPs), TLS termination
        (handling HTTPS at the edge), image optimization, and Web Application Firewall (WAF) rules.
        Think of a CDN as a programmable layer between users and your origin.
      </ConversationalCallout>

      <KeyTakeaway
        points={[
          "CDNs cache content on edge servers close to users, reducing latency from seconds to under 20ms for global audiences.",
          "Physics is the bottleneck: light in fiber travels at ~200,000 km/s, and a single page load requires 4+ round-trips. Distance kills performance.",
          "Cache hit rate is the key metric -- aim for 90%+ on static assets through proper Cache-Control headers and content-hashed filenames.",
          "Tiered caching (edge PoP → regional cache → origin shield → origin) dramatically reduces origin load even on cache misses.",
          "Use content-hashed filenames for perfect cache invalidation: new deploy = new filename = new cache entry, with zero purge lag.",
          "Modern CDNs provide DDoS protection, TLS termination, edge compute, and WAF in addition to caching -- they are a full edge platform.",
        ]}
      />
    </div>
  );
}
