"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { TopicHero } from "@/components/topic-hero";
import { AhaMoment } from "@/components/aha-moment";
import { ConversationalCallout } from "@/components/conversational-callout";
import { KeyTakeaway } from "@/components/key-takeaway";
import { BeforeAfter } from "@/components/before-after";
import { FlowDiagram } from "@/components/flow-diagram";
import type { FlowNode, FlowEdge } from "@/components/flow-diagram";
import { LiveChart } from "@/components/live-chart";
import { Playground } from "@/components/playground";
import { useSimulation } from "@/hooks/use-simulation";
import { cn } from "@/lib/utils";
import { Car, Users, MapPin, CheckCircle2, ArrowRight, Zap, TrendingUp } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  S2 Geohash City Grid — click a cell to zoom into that zone        */
/* ------------------------------------------------------------------ */
const CITY_COLORS = [
  "bg-blue-500/20 border-blue-500/40 text-blue-400",
  "bg-violet-500/20 border-violet-500/40 text-violet-400",
  "bg-emerald-500/20 border-emerald-500/40 text-emerald-400",
  "bg-amber-500/20 border-amber-500/40 text-amber-400",
  "bg-pink-500/20 border-pink-500/40 text-pink-400",
  "bg-cyan-500/20 border-cyan-500/40 text-cyan-400",
];

const CITIES = [
  { name: "NYC", drivers: 142, demand: 89 },
  { name: "SF",  drivers: 74,  demand: 61 },
  { name: "LA",  drivers: 198, demand: 110 },
  { name: "CHI", drivers: 88,  demand: 72 },
  { name: "HOU", drivers: 55,  demand: 48 },
  { name: "PHX", drivers: 40,  demand: 31 },
  { name: "MIA", drivers: 67,  demand: 58 },
  { name: "SEA", drivers: 52,  demand: 39 },
  { name: "DEN", drivers: 33,  demand: 28 },
];

function S2GeohashViz() {
  const [selected, setSelected] = useState<number | null>(null);
  const [zoomLevel, setZoomLevel] = useState(0); // 0 = world grid, 1 = city zones

  const selectedCity = selected !== null ? CITIES[selected] : null;

  // Sub-cell grid when zoomed in
  const ZONE_GRID = 4;
  const zoneDrivers = useMemo(() => {
    if (!selectedCity) return [];
    return Array.from({ length: ZONE_GRID * ZONE_GRID }).map((_, i) => ({
      drivers: Math.floor(Math.random() * 12),
      demand: Math.floor(Math.random() * 10),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCity?.name]);

  function handleSelect(idx: number) {
    setSelected(idx);
    setZoomLevel(1);
  }

  function handleBack() {
    setZoomLevel(0);
    setSelected(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {zoomLevel === 0
            ? "Each S2 cell maps to a city region. Click any cell to zoom in."
            : `Level-14 cells inside ${selectedCity?.name} — each cell ~0.3 km\u00B2`}
        </p>
        {zoomLevel === 1 && (
          <button
            onClick={handleBack}
            className="text-[11px] text-violet-400 hover:text-violet-300 underline underline-offset-2"
          >
            Back to world view
          </button>
        )}
      </div>

      {zoomLevel === 0 && (
        <div className="grid grid-cols-3 gap-1.5">
          {CITIES.map((city, idx) => {
            const ratio = city.demand / city.drivers;
            const surge = ratio > 1.2;
            return (
              <button
                key={city.name}
                onClick={() => handleSelect(idx)}
                className={cn(
                  "rounded-lg border px-3 py-2.5 text-left transition-all duration-200 hover:scale-[1.03] active:scale-100",
                  CITY_COLORS[idx % CITY_COLORS.length]
                )}
              >
                <span className="text-xs font-bold block">{city.name}</span>
                <span className="text-[10px] text-muted-foreground block">
                  {city.drivers} drivers
                </span>
                {surge && (
                  <span className="text-[9px] font-mono text-red-400 mt-0.5 block">
                    SURGE {(ratio * 1.0).toFixed(1)}x
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {zoomLevel === 1 && selectedCity && (
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="size-2.5 rounded-sm bg-emerald-500/40 border border-emerald-500/60" />
              Drivers online
            </span>
            <span className="flex items-center gap-1">
              <span className="size-2.5 rounded-sm bg-blue-500/40 border border-blue-500/60" />
              High demand
            </span>
            <span className="flex items-center gap-1">
              <span className="size-2.5 rounded-sm bg-red-500/40 border border-red-500/60" />
              Surge zone
            </span>
          </div>
          <div
            className="inline-grid gap-0.5 w-full"
            style={{ gridTemplateColumns: `repeat(${ZONE_GRID}, 1fr)` }}
          >
            {zoneDrivers.map((zone, idx) => {
              const isSurge = zone.demand > zone.drivers + 2;
              const hasDrivers = zone.drivers > 0;
              return (
                <div
                  key={idx}
                  className={cn(
                    "aspect-square rounded-sm border flex flex-col items-center justify-center text-[9px] font-mono transition-colors",
                    isSurge
                      ? "bg-red-500/15 border-red-500/30 text-red-400"
                      : hasDrivers
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                      : "bg-muted/10 border-border/20 text-muted-foreground/30"
                  )}
                >
                  {hasDrivers && <Car className="size-3" />}
                  {hasDrivers && <span>{zone.drivers}</span>}
                </div>
              );
            })}
          </div>
          <p className="text-[11px] text-muted-foreground/70">
            S2 cell ID is a 64-bit integer. Adjacent cells share a prefix, so range queries
            on a geospatial index find all neighbors with a single B-tree scan.
          </p>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Driver Location Tracking — FlowDiagram + live tick                */
/* ------------------------------------------------------------------ */
const LOCATION_FLOW_NODES: FlowNode[] = [
  {
    id: "driver",
    type: "clientNode",
    position: { x: 30, y: 100 },
    data: { label: "Driver App", sublabel: "GPS ping every 4s", status: "healthy", handles: { right: true } },
  },
  {
    id: "kafka",
    type: "queueNode",
    position: { x: 240, y: 100 },
    data: { label: "Kafka", sublabel: "location-updates topic", status: "healthy", handles: { left: true, right: true } },
  },
  {
    id: "locSvc",
    type: "serverNode",
    position: { x: 450, y: 60 },
    data: { label: "Location Service", sublabel: "consumes events", status: "healthy", handles: { left: true, bottom: true } },
  },
  {
    id: "redis",
    type: "cacheNode",
    position: { x: 450, y: 200 },
    data: { label: "Redis GEOADD", sublabel: "geospatial index", status: "healthy", handles: { top: true, right: true } },
  },
  {
    id: "matching",
    type: "serverNode",
    position: { x: 660, y: 130 },
    data: { label: "Matching (DISCO)", sublabel: "GEORADIUS queries", status: "healthy", handles: { left: true } },
  },
];

const LOCATION_FLOW_EDGES: FlowEdge[] = [
  { id: "e1", source: "driver",  target: "kafka",    animated: true, label: "lat/lng/timestamp" },
  { id: "e2", source: "kafka",   target: "locSvc",   animated: true },
  { id: "e3", source: "locSvc",  target: "redis",    animated: true, label: "GEOADD" },
  { id: "e4", source: "redis",   target: "matching", animated: true, label: "GEORADIUS 2km" },
];

function LocationTrackingSection() {
  const [pingCount, setPingCount] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setPingCount((c) => c + 1), 400);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          Live — {pingCount.toLocaleString()} location updates processed
        </span>
        <span className="ml-auto font-mono text-emerald-400">~1.25M pings/sec at peak</span>
      </div>
      <FlowDiagram
        nodes={LOCATION_FLOW_NODES}
        edges={LOCATION_FLOW_EDGES}
        minHeight={280}
        allowDrag={false}
      />
      <p className="text-[11px] text-muted-foreground/70">
        Redis stores driver locations with{" "}
        <span className="font-mono bg-muted px-1 rounded">GEOADD</span> and finds nearby
        drivers with{" "}
        <span className="font-mono bg-muted px-1 rounded">GEORADIUS</span> — a single O(N+log M)
        command replaces millions of haversine calculations.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Matching Algorithm Playground                                      */
/* ------------------------------------------------------------------ */
type Driver = {
  id: string;
  distKm: number;
  etaMin: number;
  rating: number;
  acceptRate: number;
  available: boolean;
};

const INITIAL_DRIVERS: Driver[] = [
  { id: "D-4821", distKm: 0.4, etaMin: 2, rating: 4.95, acceptRate: 96, available: true },
  { id: "D-7293", distKm: 0.8, etaMin: 4, rating: 4.88, acceptRate: 82, available: true },
  { id: "D-1056", distKm: 1.2, etaMin: 3, rating: 4.71, acceptRate: 91, available: true },
  { id: "D-3347", distKm: 1.5, etaMin: 6, rating: 4.93, acceptRate: 78, available: false },
  { id: "D-9182", distKm: 1.8, etaMin: 5, rating: 4.62, acceptRate: 88, available: true },
];

function score(d: Driver) {
  // Composite score: lower ETA is better, higher rating and acceptance is better
  const etaScore = Math.max(0, 1 - d.etaMin / 10);
  const ratingScore = (d.rating - 4.5) / 0.5;
  const acceptScore = d.acceptRate / 100;
  return (etaScore * 0.5 + ratingScore * 0.3 + acceptScore * 0.2);
}

function MatchingPlayground() {
  const sim = useSimulation({ intervalMs: 900, maxSteps: 12 });
  const [matched, setMatched] = useState<string | null>(null);
  const [offerSent, setOfferSent] = useState(false);
  const prevStep = useRef(-1);

  useEffect(() => {
    if (sim.step === prevStep.current) return;
    prevStep.current = sim.step;
    if (sim.step >= 8 && !matched) {
      const available = INITIAL_DRIVERS.filter((d) => d.available);
      const best = available.sort((a, b) => score(b) - score(a))[0];
      setMatched(best.id);
    }
    if (sim.step >= 10) setOfferSent(true);
  }, [sim.step, matched]);

  useEffect(() => {
    if (!sim.isPlaying && sim.step === 0) {
      setMatched(null);
      setOfferSent(false);
    }
  }, [sim.isPlaying, sim.step]);

  const ranked = [...INITIAL_DRIVERS]
    .filter((d) => d.available)
    .sort((a, b) => score(b) - score(a));

  const canvas = (
    <div className="p-4 space-y-4 h-full">
      {/* Rider request indicator */}
      <div
        className={cn(
          "flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-all duration-500",
          sim.step >= 1
            ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
            : "bg-muted/20 border-border/50 text-muted-foreground/30"
        )}
      >
        <Users className="size-3.5" />
        <span className="font-medium">Rider Request — pickup at Market & 5th</span>
        {sim.step >= 1 && (
          <span className="ml-auto font-mono text-[10px]">S2 cell: 9q8yy</span>
        )}
      </div>

      {/* Phase indicator */}
      <div className="flex gap-2">
        {["Query S2 cells", "Rank drivers", "Send offer"].map((phase, i) => (
          <div
            key={phase}
            className={cn(
              "flex-1 text-center rounded-md border py-1.5 text-[10px] font-medium transition-all duration-300",
              sim.step >= (i + 1) * 3
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : sim.step >= i * 3 + 1
                ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                : "bg-muted/10 border-border/30 text-muted-foreground/30"
            )}
          >
            {phase}
          </div>
        ))}
      </div>

      {/* Driver table */}
      {sim.step >= 3 && (
        <div className="space-y-1">
          <div className="grid grid-cols-6 gap-1 text-[9px] font-mono text-muted-foreground/50 px-1.5">
            <span>Driver</span>
            <span>Dist</span>
            <span>ETA</span>
            <span>Rating</span>
            <span>Accept%</span>
            <span>Score</span>
          </div>
          {ranked.map((d, i) => {
            const s = score(d);
            const isMatch = d.id === matched;
            const visible = sim.step >= 3 + i;
            if (!visible) return null;
            return (
              <div
                key={d.id}
                className={cn(
                  "grid grid-cols-6 gap-1 text-[11px] font-mono items-center rounded-md px-1.5 py-1 border transition-all duration-400",
                  isMatch && sim.step >= 8
                    ? "bg-emerald-500/10 border-emerald-500/30 ring-1 ring-emerald-500/20"
                    : "bg-muted/10 border-border/30"
                )}
              >
                <span className={cn(isMatch && sim.step >= 8 ? "text-emerald-400" : "text-muted-foreground")}>
                  {d.id}
                </span>
                <span className="text-blue-400">{d.distKm}km</span>
                <span className="text-amber-400">{d.etaMin}min</span>
                <span>{d.rating}</span>
                <span>{d.acceptRate}%</span>
                <span className={cn("font-bold", i === 0 ? "text-emerald-400" : "text-muted-foreground/60")}>
                  {s.toFixed(2)}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Offer sent */}
      {offerSent && (
        <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-medium animate-in fade-in">
          <CheckCircle2 className="size-3.5" />
          Offer sent to {matched} — 15 second countdown to accept
        </div>
      )}
    </div>
  );

  const explanation = (
    <>
      <p>
        DISCO (Dispatch Optimization) uses a{" "}
        <strong className="text-foreground">composite score</strong> — not just distance —
        to pick the best driver.
      </p>
      <ul className="space-y-1 text-[12px]">
        <li className="flex gap-2"><span className="text-amber-400 font-mono">50%</span> ETA to pickup</li>
        <li className="flex gap-2"><span className="text-violet-400 font-mono">30%</span> Driver rating</li>
        <li className="flex gap-2"><span className="text-cyan-400 font-mono">20%</span> Acceptance rate</li>
      </ul>
      <p className="text-[12px]">
        The closest driver by distance often loses to a slightly farther driver with
        better roads and a higher acceptance rate.
      </p>
    </>
  );

  return (
    <Playground
      title="Matching Algorithm — DISCO"
      simulation={sim}
      canvas={canvas}
      explanation={explanation}
      canvasHeight="min-h-[320px]"
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Surge Pricing Simulator                                            */
/* ------------------------------------------------------------------ */
function getSurgeMultiplier(ratio: number): number {
  if (ratio <= 1) return 1.0;
  if (ratio <= 1.4) return 1.2;
  if (ratio <= 1.8) return 1.5;
  if (ratio <= 2.5) return 2.0;
  if (ratio <= 3.5) return 2.5;
  return 3.0;
}

function getSurgeColor(m: number) {
  if (m <= 1) return "text-emerald-400";
  if (m <= 1.5) return "text-amber-400";
  return "text-red-400";
}

function SurgePricingSimulator() {
  const [demand, setDemand] = useState(80);
  const supply = 60;
  const ratio = demand / supply;
  const multiplier = getSurgeMultiplier(ratio);
  const baseFare = 12.50;
  const finalFare = baseFare * multiplier;

  // Generate chart data based on current demand
  const chartData = useMemo(() => {
    return Array.from({ length: 10 }, (_, i) => {
      const d = 40 + i * 28;
      const r = d / supply;
      const m = getSurgeMultiplier(r);
      return { demand: d, multiplier: parseFloat(m.toFixed(2)), fare: parseFloat((baseFare * m).toFixed(2)) };
    });
  }, []);

  return (
    <div className="space-y-5">
      {/* Demand slider */}
      <div className="flex items-center gap-4">
        <label className="text-xs text-muted-foreground font-medium w-28 shrink-0">
          Riders requesting:
        </label>
        <input
          type="range"
          min={20}
          max={300}
          value={demand}
          onChange={(e) => setDemand(Number(e.target.value))}
          className="flex-1 h-1.5 rounded-full accent-primary cursor-pointer"
        />
        <span className="text-sm font-mono font-bold w-10 text-right">{demand}</span>
      </div>

      {/* Live readout */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border bg-muted/10 border-border/40 p-3 text-center space-y-1">
          <div className="text-[10px] text-muted-foreground">Supply</div>
          <div className="text-xl font-mono font-bold text-emerald-400">{supply}</div>
          <div className="h-1.5 bg-muted/20 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: "20%" }} />
          </div>
        </div>
        <div className="rounded-lg border bg-muted/10 border-border/40 p-3 text-center space-y-1">
          <div className="text-[10px] text-muted-foreground">Demand</div>
          <div className="text-xl font-mono font-bold text-blue-400">{demand}</div>
          <div className="h-1.5 bg-muted/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all"
              style={{ width: `${Math.min(100, (demand / 300) * 100)}%` }}
            />
          </div>
        </div>
        <div className="rounded-lg border bg-muted/10 border-border/40 p-3 text-center space-y-1">
          <div className="text-[10px] text-muted-foreground">Surge</div>
          <div className={cn("text-xl font-mono font-bold transition-colors", getSurgeColor(multiplier))}>
            {multiplier.toFixed(1)}x
          </div>
          <div className="text-[10px] font-mono text-muted-foreground">
            ${finalFare.toFixed(2)} <span className="text-muted-foreground/50">(was ${baseFare.toFixed(2)})</span>
          </div>
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground/70">
        {multiplier <= 1
          ? "Supply meets demand. Standard fares apply."
          : multiplier <= 1.5
          ? "Mild imbalance. A small surge nudges drivers toward this zone."
          : `Demand is ${ratio.toFixed(1)}x supply. Surge pricing reduces demand and draws in more drivers, restoring equilibrium.`}
      </p>

      {/* Multiplier curve chart */}
      <div>
        <p className="text-[10px] text-muted-foreground/60 mb-1.5">
          Surge multiplier vs. demand (supply fixed at {supply})
        </p>
        <LiveChart
          type="area"
          data={chartData}
          dataKeys={{ x: "demand", y: "multiplier", label: "Surge multiplier" }}
          height={160}
          unit="x"
          referenceLines={[{ y: multiplier, label: `Now: ${multiplier}x`, color: "#f59e0b" }]}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Rides-per-second LiveChart with simulated rolling data            */
/* ------------------------------------------------------------------ */
function RidesPerSecondChart() {
  const MAX_POINTS = 20;
  const [data, setData] = useState(() =>
    Array.from({ length: MAX_POINTS }, (_, i) => ({
      t: `T-${MAX_POINTS - i}`,
      rides: Math.round(200 + Math.sin(i * 0.5) * 40 + Math.random() * 30),
      capacity: 300,
    }))
  );

  useEffect(() => {
    const t = setInterval(() => {
      setData((prev) => {
        const last = prev[prev.length - 1].rides;
        const next = Math.max(80, Math.min(380, last + (Math.random() - 0.48) * 35));
        const newPoint = { t: "Now", rides: Math.round(next), capacity: 300 };
        const shifted = prev.slice(1).map((p, i) => ({ ...p, t: `T-${MAX_POINTS - 1 - i}` }));
        return [...shifted, newPoint];
      });
    }, 800);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Zap className="size-3.5 text-amber-400" />
          Real-time rides per second — global aggregate
        </span>
        <span className="font-mono text-amber-400">
          {data[data.length - 1]?.rides ?? 0} rides/sec
        </span>
      </div>
      <LiveChart
        type="area"
        data={data}
        dataKeys={{ x: "t", y: ["rides", "capacity"], label: ["Rides/sec", "Node capacity"] }}
        height={180}
        unit="rps"
        referenceLines={[{ y: 266, label: "23M/day avg", color: "#10b981" }]}
      />
      <p className="text-[11px] text-muted-foreground/70">
        At 23M trips/day, Uber averages ~266 new trips per second. During peak hours (Friday
        evenings, post-event surges), this can spike 3-4x — requiring auto-scaling across the
        matching and location services.
      </p>
    </div>
  );
}

/* ================================================================== */
/*  Main Page                                                          */
/* ================================================================== */
export default function UberCaseStudyPage() {
  return (
    <div className="space-y-8">

      {/* 1 — Hero */}
      <TopicHero
        title="Uber"
        subtitle="How Uber matches riders and drivers in real-time across 10,000+ cities — processing 23 million trips per day with sub-10-second matching, geospatial indexing, and surge pricing."
        difficulty="advanced"
      />

      {/* 2 — Think First */}
      <AhaMoment
        question="Before reading: how would you find the nearest driver among 5 million active drivers in under 10ms?"
        answer={
          <p>
            Brute-force distance calculations against 5M records is ~500ms minimum. The real
            trick is turning a global search into a <strong>local index lookup</strong>. Divide
            the Earth into a grid of cells. Each driver is stored under their cell ID. Finding
            nearby drivers becomes a lookup of <strong>a handful of adjacent cells</strong> —
            not a full table scan. Uber uses <strong>Google S2</strong> for this, later
            building their own <strong>H3 hexagonal system</strong>. Click the grid below to
            see how it works.
          </p>
        }
      />

      {/* 3 — S2 Geohash Grid */}
      <div className="rounded-xl border border-border/50 bg-muted/5 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <MapPin className="size-4 text-blue-400" />
          <h2 className="text-sm font-semibold">S2 Geohash Cell Visualization</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Uber maps the Earth onto the six faces of a cube, then recursively subdivides each face
          into cells. Every cell gets a unique 64-bit ID. At <strong>level 12</strong>, each cell
          covers ~3-6 km&sup2; — the right granularity for urban driver lookup. Click any city
          to zoom into its level-14 subcells.
        </p>
        <S2GeohashViz />
        <ConversationalCallout type="tip">
          Uber later open-sourced H3 — a hexagonal grid where every neighbor is equidistant.
          S2 squares suffer from &quot;corner distortion&quot;: a diagonal neighbor is
          41% further than a side neighbor. Hexagons fix that.
        </ConversationalCallout>
      </div>

      {/* 4 — Location Tracking Flow */}
      <div className="rounded-xl border border-border/50 bg-muted/5 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="size-4 text-emerald-400" />
          <h2 className="text-sm font-semibold">Driver Location Tracking Pipeline</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Every active driver sends a GPS ping every <strong>4 seconds</strong>. With 5 million
          active drivers, that is over <strong>1.25 million location updates per second</strong>.
          The pipeline flows through Kafka to a Location Service that writes into a Redis
          geospatial index. The matching engine then queries Redis with a radius search.
        </p>
        <LocationTrackingSection />
      </div>

      {/* 5 — Matching Playground */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Car className="size-4 text-violet-400" />
          <h2 className="text-sm font-semibold">Matching Algorithm — Step Through It</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Hit play to watch DISCO rank nearby drivers and dispatch an offer. The algorithm weighs
          ETA, rating, and acceptance rate — not just raw distance.
        </p>
        <MatchingPlayground />
        <AhaMoment
          question="Why does acceptance rate matter in the score?"
          answer={
            <p>
              A driver with a 60% acceptance rate means 40% of offers go unanswered. During that
              15-second countdown the rider is waiting, and Uber has to cascade to the next
              candidate. High-acceptance drivers reduce overall matching latency across the
              whole system, so they get a scoring bonus.
            </p>
          }
        />
      </div>

      {/* 6 — Surge Pricing */}
      <div className="rounded-xl border border-border/50 bg-muted/5 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Zap className="size-4 text-amber-400" />
          <h2 className="text-sm font-semibold">Surge Pricing Simulator</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Surge pricing is a real-time market mechanism, not a punishment. Drag the demand slider
          to see how the supply/demand ratio maps to a fare multiplier and what it costs the rider.
        </p>
        <SurgePricingSimulator />
        <ConversationalCallout type="question">
          Why not just use a linear formula? Why step functions? Because drivers respond to
          thresholds — a small fare bump rarely gets someone out of bed, but hitting 2.0x often
          does. Step functions better model actual driver behavior.
        </ConversationalCallout>
      </div>

      {/* 7 — Scale LiveChart */}
      <div className="rounded-xl border border-border/50 bg-muted/5 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <ArrowRight className="size-4 text-cyan-400" />
          <h2 className="text-sm font-semibold">Rides Per Second — At Global Scale</h2>
        </div>
        <RidesPerSecondChart />
      </div>

      {/* 8 — Data Storage Before/After */}
      <BeforeAfter
        before={{
          title: "Single Database (Naive)",
          content: (
            <ul className="text-sm space-y-1.5 text-muted-foreground">
              <li>All data in one PostgreSQL instance</li>
              <li>Geospatial queries compete with billing writes</li>
              <li>1.25M location updates/sec overwhelm the WAL</li>
              <li>Schema changes require downtime</li>
              <li>Cannot scale reads and writes independently</li>
            </ul>
          ),
        }}
        after={{
          title: "Polyglot Persistence (Uber)",
          content: (
            <ul className="text-sm space-y-1.5 text-muted-foreground">
              <li><strong className="text-foreground">Redis GEOADD/GEORADIUS</strong> — real-time driver positions</li>
              <li><strong className="text-foreground">Schemaless (MySQL)</strong> — append-only trip records</li>
              <li><strong className="text-foreground">PostgreSQL</strong> — structured fare and payment data</li>
              <li><strong className="text-foreground">Kafka</strong> — event streaming backbone</li>
              <li><strong className="text-foreground">Cassandra</strong> — high-volume logs and analytics</li>
            </ul>
          ),
        }}
      />

      <ConversationalCallout type="warning">
        Exactly-once matching is a hard distributed systems problem. If a network partition causes
        two data centers to both believe they are primary, two drivers can be dispatched to the same
        rider. Uber solves this with <strong>idempotency keys</strong>, <strong>Redis distributed
        locks</strong> on driver IDs, and <strong>cell-based architecture</strong> where each city
        is an independent failure domain.
      </ConversationalCallout>

      {/* 9 — Key Takeaways */}
      <KeyTakeaway
        points={[
          "S2/H3 geohash indexing turns 'find nearby drivers among 5M' from an O(n) scan into an O(1) cell lookup — the key insight behind Uber's matching speed.",
          "Redis GEOADD + GEORADIUS replaces millions of haversine calculations with a single command, handling 1.25M location writes per second.",
          "DISCO scores drivers on ETA (50%), rating (30%), and acceptance rate (20%) — closest by distance is rarely the optimal match.",
          "Surge pricing is a market equilibrium mechanism: step-function multipliers model driver behavior thresholds better than linear formulas.",
          "Polyglot persistence is non-negotiable at this scale: no single database handles geospatial indexing, event streaming, and billing writes with equal efficiency.",
          "Cell-based (city-level) architecture isolates blast radius — a NYC outage cannot cascade to San Francisco.",
          "Exactly-once dispatch requires idempotency keys + distributed locks: the matching operation must be atomic even across partial network failures.",
        ]}
      />
    </div>
  );
}
