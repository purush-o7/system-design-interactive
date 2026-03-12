"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { TopicHero } from "@/components/topic-hero";
import { KeyTakeaway } from "@/components/key-takeaway";
import { AhaMoment } from "@/components/aha-moment";
import { ConversationalCallout } from "@/components/conversational-callout";
import { Playground } from "@/components/playground";
import { LiveChart } from "@/components/live-chart";
import { useSimulation } from "@/hooks/use-simulation";
import { cn } from "@/lib/utils";
import { Zap, CheckCircle2, Clock, Server } from "lucide-react";

const SEGMENTS = [
  {
    id: "sign",
    label: "Sign",
    bits: 1,
    color: "bg-slate-500/30",
    textColor: "text-slate-400",
    borderColor: "border-slate-500/30",
    glowColor: "ring-slate-400/40",
    title: "Sign Bit (1 bit)",
    description:
      "Always 0. This keeps the ID a positive number in signed 64-bit integer land. Without it, the highest bit would be the sign bit and you'd get negative IDs — confusing and error-prone in many languages.",
    example: "Value: 0 (always)",
  },
  {
    id: "timestamp",
    label: "Timestamp",
    bits: 41,
    color: "bg-blue-500/20",
    textColor: "text-blue-400",
    borderColor: "border-blue-500/30",
    glowColor: "ring-blue-400/40",
    title: "Timestamp (41 bits)",
    description:
      "Milliseconds elapsed since a custom epoch (Twitter used Nov 4, 2010). 41 bits gives you 2^41 ms ≈ 69.7 years of runway. Because this is the most-significant segment, IDs are roughly time-sorted — a huge win for database index performance.",
    example: "2^41 = 2.2 trillion ms ≈ 69.7 years",
  },
  {
    id: "datacenter",
    label: "Datacenter",
    bits: 5,
    color: "bg-emerald-500/20",
    textColor: "text-emerald-400",
    borderColor: "border-emerald-500/30",
    glowColor: "ring-emerald-400/40",
    title: "Datacenter ID (5 bits)",
    description:
      "Identifies which datacenter the ID was generated in. 5 bits = up to 32 datacenters. This is assigned at service startup via configuration, not coordination. Ensures IDs from different regions never collide.",
    example: "5 bits = 32 possible datacenters",
  },
  {
    id: "machine",
    label: "Machine",
    bits: 5,
    color: "bg-violet-500/20",
    textColor: "text-violet-400",
    borderColor: "border-violet-500/30",
    glowColor: "ring-violet-400/40",
    title: "Machine ID (5 bits)",
    description:
      "Identifies which server within the datacenter generated the ID. 5 bits = up to 32 machines per datacenter. Combined with datacenter bits, this gives 1,024 unique nodes total. Assigned at startup, no lock needed.",
    example: "5 bits = 32 machines per datacenter",
  },
  {
    id: "sequence",
    label: "Sequence",
    bits: 12,
    color: "bg-amber-500/20",
    textColor: "text-amber-400",
    borderColor: "border-amber-500/30",
    glowColor: "ring-amber-400/40",
    title: "Sequence (12 bits)",
    description:
      "An auto-incrementing counter that resets to 0 each millisecond. 12 bits = 4,096 unique values per millisecond per machine. If you exhaust the sequence in a single ms, the generator waits until the next ms — no clock drift, no collisions.",
    example: "2^12 = 4,096 IDs per ms per machine",
  },
];

function SnowflakeBitAnatomy() {
  const [active, setActive] = useState<string | null>(null);
  const [generatedIds, setGeneratedIds] = useState<{ id: string; ts: number; seq: number }[]>([]);
  const seqRef = useRef(0);

  const activeSegment = SEGMENTS.find((s) => s.id === active);

  const generateId = useCallback(() => {
    const epoch = 1288834974657;
    const now = Date.now();
    const ts = now - epoch;
    const datacenter = 3;
    const machine = 7;
    const seq = seqRef.current % 4096;
    seqRef.current += 1;

    const id = (
      (BigInt(ts) << BigInt(22)) |
      (BigInt(datacenter) << BigInt(17)) |
      (BigInt(machine) << BigInt(12)) |
      BigInt(seq)
    ).toString();

    setGeneratedIds((prev) => [{ id, ts, seq }, ...prev].slice(0, 5));
  }, []);

  const epoch = 1288834974657;
  const now = Date.now();
  const elapsed = now - epoch;
  const tsBin = elapsed.toString(2).padStart(41, "0");
  const seqVal = seqRef.current % 4096;
  const seqBin = seqVal.toString(2).padStart(12, "0");

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">
        A Snowflake ID packs a timestamp, datacenter, machine, and sequence counter into a single
        64-bit integer. Click any segment to learn what those bits actually mean.
      </p>

      {/* 64-bit bar */}
      <div className="space-y-1.5">
        <div className="flex h-12 rounded-xl overflow-hidden border border-border/30 gap-px">
          {SEGMENTS.map((seg) => (
            <button
              key={seg.id}
              className={cn(
                "flex items-center justify-center border-r border-border/10 last:border-r-0 transition-all duration-200 cursor-pointer relative",
                seg.color,
                active === seg.id
                  ? "ring-2 ring-inset " + seg.glowColor + " brightness-125"
                  : "hover:brightness-110"
              )}
              style={{ width: `${(seg.bits / 64) * 100}%` }}
              onClick={() => setActive(active === seg.id ? null : seg.id)}
              aria-label={seg.title}
            >
              <span
                className={cn(
                  "font-mono font-bold truncate px-1 select-none",
                  seg.textColor,
                  seg.bits <= 5 ? "text-[8px]" : seg.bits <= 12 ? "text-[10px]" : "text-xs"
                )}
              >
                {seg.bits <= 5 ? seg.bits : seg.label}
              </span>
            </button>
          ))}
        </div>

        {/* Bit count labels */}
        <div className="flex">
          {SEGMENTS.map((seg) => (
            <div
              key={seg.id}
              className="text-center"
              style={{ width: `${(seg.bits / 64) * 100}%` }}
            >
              <span className={cn("text-[9px] font-mono", seg.textColor)}>
                {seg.bits}b
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Detail panel */}
      <div
        className={cn(
          "rounded-xl border p-4 transition-all duration-300 min-h-[96px]",
          activeSegment
            ? activeSegment.borderColor + " bg-muted/10"
            : "border-border/20 bg-muted/5"
        )}
      >
        {activeSegment ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span
                className={cn("text-sm font-bold", activeSegment.textColor)}
              >
                {activeSegment.title}
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {activeSegment.description}
            </p>
            <div
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[10px] font-mono",
                activeSegment.color,
                activeSegment.textColor
              )}
            >
              {activeSegment.example}
            </div>
            {activeSegment.id === "timestamp" && (
              <p className="text-[10px] font-mono text-muted-foreground/60 truncate">
                Current: {tsBin.slice(0, 20)}... ({elapsed.toLocaleString()} ms elapsed)
              </p>
            )}
            {activeSegment.id === "sequence" && (
              <p className="text-[10px] font-mono text-muted-foreground/60">
                Current seq: {seqBin} (decimal: {seqVal})
              </p>
            )}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground/50 italic">
            Click any colored segment above to explore what those bits encode.
          </p>
        )}
      </div>

      {/* Segment legend */}
      <div className="flex flex-wrap gap-2">
        {SEGMENTS.map((seg) => (
          <button
            key={seg.id}
            onClick={() => setActive(active === seg.id ? null : seg.id)}
            className={cn(
              "flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[10px] font-mono transition-all",
              seg.color,
              seg.borderColor,
              seg.textColor,
              active === seg.id ? "ring-1 " + seg.glowColor : "opacity-70 hover:opacity-100"
            )}
          >
            <span className={cn("size-2 rounded-sm shrink-0", seg.color.replace("/20", "/60"))} />
            {seg.label} ({seg.bits} bits)
          </button>
        ))}
      </div>

      {/* Generate IDs */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center gap-3">
          <button
            onClick={generateId}
            className="flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-400 transition-all hover:bg-blue-500/20 hover:border-blue-500/50"
          >
            <Zap className="size-3.5" />
            Generate Snowflake ID
          </button>
          {generatedIds.length > 0 && (
            <button
              onClick={() => setGeneratedIds([])}
              className="text-[10px] text-muted-foreground/50 hover:text-muted-foreground transition-colors"
            >
              clear
            </button>
          )}
        </div>

        {generatedIds.length > 0 && (
          <div className="space-y-1.5 rounded-xl border border-border/20 bg-muted/5 p-3">
            {generatedIds.map((entry, i) => (
              <div
                key={entry.id}
                className={cn(
                  "flex items-center gap-3 font-mono text-[11px] transition-all duration-300",
                  i === 0 ? "opacity-100" : "opacity-50"
                )}
              >
                <span className="text-muted-foreground/40 w-3">{i === 0 ? "→" : " "}</span>
                <span className="text-blue-300 tracking-tight">{entry.id}</span>
                <span className="text-muted-foreground/40">
                  ts+{entry.ts.toLocaleString()}ms seq={entry.seq}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CollisionDemo() {
  const sim = useSimulation({ intervalMs: 600, maxSteps: 24 });
  const machines = [1, 2, 3];
  const [machineState, setMachineState] = useState<{ seqs: number[] }[]>([
    { seqs: [] },
    { seqs: [] },
    { seqs: [] },
  ]);

  useEffect(() => {
    if (!sim.isPlaying && sim.tick === 0) {
      setMachineState([{ seqs: [] }, { seqs: [] }, { seqs: [] }]);
    }
  }, [sim.isPlaying, sim.tick]);

  useEffect(() => {
    if (sim.tick === 0) return;
    const msSlot = Math.floor((sim.tick - 1) / 3);
    const machineIdx = (sim.tick - 1) % 3;
    setMachineState((prev) => {
      const next = prev.map((m, i) => {
        if (i !== machineIdx) return m;
        const seqInMs = m.seqs.filter((_, si) => Math.floor(si / 1) === msSlot).length;
        return { seqs: [...m.seqs, seqInMs] };
      });
      return next;
    });
  }, [sim.tick]);

  const msSlots = Math.ceil(sim.tick / 3);
  const currentMs = Math.max(0, Math.floor((sim.tick - 1) / 3));

  return (
    <Playground
      title="Collision-Free: Sequence Numbers Per Millisecond"
      simulation={sim}
      canvasHeight="min-h-[280px]"
      canvas={
        <div className="p-4 space-y-4 h-full">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <Clock className="size-3.5 text-blue-400" />
            <span>
              Millisecond slot:{" "}
              <span className="font-mono text-blue-400 font-bold">t+{currentMs}</span>
            </span>
            <span className="text-muted-foreground/40">|</span>
            <span>
              Each machine has its own sequence counter — no coordination needed
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {machines.map((machineId, mi) => {
              const state = machineState[mi];
              const isActive = sim.tick > 0 && (sim.tick - 1) % 3 === mi;
              const totalSeqs = state.seqs.length;
              const latestSeq = totalSeqs > 0 ? state.seqs[totalSeqs - 1] : null;

              return (
                <div
                  key={machineId}
                  className={cn(
                    "rounded-xl border p-3 space-y-2 transition-all duration-300",
                    isActive
                      ? "border-violet-500/40 bg-violet-500/10 ring-1 ring-violet-500/20"
                      : "border-border/20 bg-muted/5"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Server
                      className={cn(
                        "size-3.5 transition-colors",
                        isActive ? "text-violet-400" : "text-muted-foreground/40"
                      )}
                    />
                    <span className="text-[10px] font-mono font-bold text-muted-foreground">
                      Machine #{machineId}
                    </span>
                  </div>

                  <div className="space-y-1">
                    {Array.from({ length: Math.min(msSlots, 4) }).map((_, si) => {
                      const seq = state.seqs[si];
                      return (
                        <div key={si} className="flex items-center gap-2">
                          <span className="text-[9px] font-mono text-muted-foreground/40 w-8">
                            t+{si}
                          </span>
                          <div className="flex-1 h-4 bg-muted/20 rounded overflow-hidden">
                            {seq !== undefined && (
                              <div
                                className={cn(
                                  "h-full rounded transition-all duration-500",
                                  isActive && si === currentMs
                                    ? "bg-violet-500/60"
                                    : "bg-blue-500/40"
                                )}
                                style={{ width: `${Math.min(100, ((seq + 1) / 4096) * 100 * 40 + 10)}%` }}
                              />
                            )}
                          </div>
                          {seq !== undefined && (
                            <span className="text-[9px] font-mono text-amber-400 w-8">
                              seq={seq}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {latestSeq !== null && (
                    <div className="rounded-md bg-muted/20 px-2 py-1 font-mono text-[10px]">
                      <span className="text-muted-foreground/50">last seq: </span>
                      <span className="text-amber-400">{latestSeq}</span>
                      <span className="text-muted-foreground/30"> / 4095</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {sim.tick >= sim.maxSteps && (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-xs text-emerald-400">
              <CheckCircle2 className="size-3.5 shrink-0" />
              <span>
                All {sim.tick} IDs generated — zero collisions. Each machine incremented its own
                sequence independently, no locks or network calls needed.
              </span>
            </div>
          )}
        </div>
      }
      explanation={
        <div className="space-y-3 text-xs text-muted-foreground">
          <p><strong className="text-foreground/80">Why no collisions?</strong> Each machine has a unique Machine ID in the ID. Even if two machines generate IDs in the same millisecond, their Machine IDs differ — the 64-bit value is always unique.</p>
          <p><strong className="text-foreground/80">Sequence counter</strong> handles multiple IDs within one millisecond: increments from 0 to 4,095, then waits for the next ms. At full capacity: 4,096 IDs/ms = 4M IDs/sec per machine.</p>
        </div>
      }
    />
  );
}

function CapacityChart() {
  const machines = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024];
  const data = machines.map((n) => ({
    machines: n,
    ids_per_sec: n * 4096 * 1000,
    ids_per_sec_k: Math.round((n * 4096 * 1000) / 1000),
  }));

  const chartData = data.map((d) => ({
    machines: String(d.machines),
    "IDs/sec (K)": d.ids_per_sec_k,
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          Snowflake scales linearly: each additional machine adds 4,096,000 IDs/sec capacity.
          With 1,024 machines (max for 10-bit machine ID), you get over{" "}
          <strong className="text-foreground/80">4 billion IDs per second</strong>.
        </p>
      </div>

      <LiveChart
        type="area"
        data={chartData}
        dataKeys={{ x: "machines", y: "IDs/sec (K)", label: "IDs/sec (thousands)" }}
        height={220}
        unit="K/s"
        referenceLines={[
          { y: 4096, label: "1 machine max", color: "hsl(var(--chart-3))" },
          { y: 4096 * 32, label: "32 machines" },
        ]}
      />

      <div className="grid grid-cols-3 gap-3 text-center">
        {[["1 node", "4M", "Startup"], ["32 nodes", "131M", "Mid-scale"], ["1,024 nodes", "4.2B", "Hyper-scale"]].map(([n, ips, note]) => (
          <div key={n} className="rounded-xl border border-border/20 bg-muted/5 p-3 space-y-0.5">
            <p className="text-lg font-bold text-blue-400 font-mono">{ips}</p>
            <p className="text-[10px] text-muted-foreground/60">IDs/sec · {n}</p>
            <p className="text-[9px] text-muted-foreground/40">{note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const COMPARISON_ROWS: { property: string; uuid: string; ulid: string; snowflake: string; winner: "uuid" | "ulid" | "snowflake" | "tie" }[] = [
  { property: "Size", uuid: "128 bits / 36 chars", ulid: "128 bits / 26 chars", snowflake: "64 bits / ~19 chars", winner: "snowflake" },
  { property: "Sortable", uuid: "No", ulid: "Yes (lexicographic)", snowflake: "Yes (approx)", winner: "tie" },
  { property: "Coordination", uuid: "None needed", ulid: "None needed", snowflake: "Machine ID config", winner: "uuid" },
  { property: "DB index perf", uuid: "Poor (random)", ulid: "Good", snowflake: "Excellent", winner: "snowflake" },
  { property: "Throughput", uuid: "Unlimited", ulid: "Unlimited", snowflake: "4M/sec/machine", winner: "uuid" },
  { property: "Clock dependent", uuid: "No", ulid: "Yes", snowflake: "Yes", winner: "uuid" },
  { property: "Privacy", uuid: "Fully opaque", ulid: "Timestamp visible", snowflake: "Timestamp visible", winner: "uuid" },
  { property: "Collision risk", uuid: "Negligible", ulid: "Negligible", snowflake: "Zero (deterministic)", winner: "snowflake" },
  { property: "Human readable", uuid: "Medium (hex)", ulid: "Best (Crockford B32)", snowflake: "Poor (large int)", winner: "ulid" },
  { property: "FK / JOIN perf", uuid: "Poor (128-bit)", ulid: "Poor (128-bit)", snowflake: "Best (64-bit int)", winner: "snowflake" },
];

function ComparisonTable() {
  const [highlight, setHighlight] = useState<"uuid" | "ulid" | "snowflake" | null>(null);

  const colStyle = (col: "uuid" | "ulid" | "snowflake") =>
    cn(
      "px-3 py-2 text-center text-[11px] transition-colors",
      highlight === col ? "bg-muted/30" : "bg-muted/10"
    );

  const winnerBadge = (row: typeof COMPARISON_ROWS[0], col: "uuid" | "ulid" | "snowflake") => {
    if (row.winner === col || (row.winner === "tie" && true)) {
      if (row.winner === col) {
        return (
          <span className="ml-1 inline-block size-1.5 rounded-full bg-emerald-400/70 align-middle" />
        );
      }
    }
    return null;
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        No single winner — the right choice depends on your constraints. Click a column header to
        highlight it.
      </p>

      <div className="overflow-x-auto rounded-xl border border-border/20">
        <table className="w-full min-w-[520px] text-[11px] font-mono">
          <thead>
            <tr className="border-b border-border/20">
              <th className="px-3 py-2.5 text-left text-muted-foreground/60 font-normal bg-muted/20 w-32">
                Property
              </th>
              {(["uuid", "ulid", "snowflake"] as const).map((col) => (
                <th
                  key={col}
                  className={cn(
                    "px-3 py-2.5 text-center font-bold cursor-pointer transition-colors select-none",
                    col === "uuid" && "text-rose-400",
                    col === "ulid" && "text-violet-400",
                    col === "snowflake" && "text-blue-400",
                    highlight === col ? "bg-muted/30" : "bg-muted/15 hover:bg-muted/25"
                  )}
                  onClick={() => setHighlight(highlight === col ? null : col)}
                >
                  {col === "uuid" ? "UUID v4" : col === "ulid" ? "ULID" : "Snowflake"}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COMPARISON_ROWS.map((row, i) => (
              <tr
                key={row.property}
                className={cn(
                  "border-b border-border/10 last:border-0",
                  i % 2 === 0 ? "" : "bg-muted/[0.03]"
                )}
              >
                <td className="px-3 py-2 text-muted-foreground/60 font-sans text-[10px]">
                  {row.property}
                </td>
                {(["uuid", "ulid", "snowflake"] as const).map((col) => (
                  <td key={col} className={colStyle(col)}>
                    <span
                      className={cn(
                        row.winner === col
                          ? col === "uuid"
                            ? "text-rose-300"
                            : col === "ulid"
                            ? "text-violet-300"
                            : "text-blue-300"
                          : "text-muted-foreground/70"
                      )}
                    >
                      {(row as Record<string, string>)[col]}
                    </span>
                    {winnerBadge(row, col)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-4 text-[10px] text-muted-foreground/50">
        <span className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-emerald-400/70" />
          Best in category
        </span>
        <span className="text-muted-foreground/30">Click header to highlight column</span>
      </div>
    </div>
  );
}

export default function UniqueIdGeneratorPage() {
  return (
    <div className="space-y-10">
      <TopicHero
        title="Unique ID Generator"
        subtitle="Snowflake, UUID, ULID — generating globally unique IDs without coordination"
        difficulty="intermediate"
      />

      {/* ---- The Problem ---- */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Why auto-increment breaks in distributed systems</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Auto-increment IDs assume a single database running a single counter. The moment you add
          a second shard, each shard picks the next number independently — collisions become
          inevitable. Shard A assigns order ID{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">1001</code> to Alice,
          Shard B assigns ID{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">1001</code> to Bob.
          When the analytics pipeline merges both shards, one order silently overwrites the other.
        </p>
      </section>

      {/* ---- Snowflake Bit Anatomy ---- */}
      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Snowflake ID — 64-bit anatomy</h2>
          <p className="text-xs text-muted-foreground/60">
            Click each segment to understand what those bits encode
          </p>
        </div>
        <div className="rounded-xl border border-border/20 bg-muted/5 p-5">
          <SnowflakeBitAnatomy />
        </div>
      </section>

      {/* ---- Collision Demo ---- */}
      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Collision demo: 3 machines, same millisecond</h2>
          <p className="text-xs text-muted-foreground/60">
            Press play to see how each machine manages its own sequence counter
          </p>
        </div>
        <CollisionDemo />
      </section>

      <ConversationalCallout type="tip">
        Discord, Instagram, and Mastodon all use Snowflake-style IDs. Instagram's variant uses 41
        bits for timestamp, 13 bits for shard ID, and 10 bits for sequence. The bit allocation
        differs, but the core insight is identical: embed time in the high bits for free sorting.
      </ConversationalCallout>

      {/* ---- Capacity Chart ---- */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">IDs per second capacity</h2>
        <div className="rounded-xl border border-border/20 bg-muted/5 p-5">
          <CapacityChart />
        </div>
      </section>

      {/* ---- Comparison Table ---- */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">UUID vs ULID vs Snowflake</h2>
        <ComparisonTable />
      </section>

      <ConversationalCallout type="warning">
        Snowflake IDs embed a timestamp — anyone can extract your approximate creation rate by
        comparing IDs over time. Competitors can estimate how many users signed up in a period.
        Mitigations include a secret epoch offset, random timestamp jitter, or
        format-preserving encryption on the final value.
      </ConversationalCallout>

      {/* ---- Aha Moments ---- */}
      <AhaMoment
        question="Why does the timestamp go in the high bits of the Snowflake ID?"
        answer={
          <p>
            Because 64-bit integers sort numerically by their most-significant bits first. Putting
            the timestamp in bits 63–22 means newer IDs are always larger than older ones —
            regardless of which machine generated them. This makes Snowflake IDs an ideal B-tree
            index key: new inserts always land at the rightmost leaf, keeping pages hot and
            avoiding the index fragmentation that random UUIDs cause.
          </p>
        }
      />

      <AhaMoment
        question="What happens if two machines get the same machine ID?"
        answer={
          <p>
            You get collisions — guaranteed. Machine ID assignment is the one coordination point
            Snowflake requires. In practice, companies use ZooKeeper, etcd, or a simple database
            table to assign machine IDs at service startup. The machine holds that ID for its
            lifetime. If a machine restarts, it may reclaim its old ID or request a new one, as
            long as no two running machines share the same ID simultaneously.
          </p>
        }
      />

      <ConversationalCallout type="question">
        When would you choose ULID over Snowflake? ULID is a drop-in replacement for UUID in
        systems that already store string IDs — no schema migration needed, 26 chars instead of
        36, and it sorts by creation time. Snowflake requires a 64-bit integer column and a
        machine ID assignment system. If you're starting fresh with integer primary keys, Snowflake
        wins on storage and join performance.
      </ConversationalCallout>

      <KeyTakeaway
        points={[
          "Auto-increment IDs fail in distributed systems because each node picks the next number independently, causing collisions when data is merged.",
          "Snowflake IDs (64-bit: 1 sign + 41 timestamp + 5 datacenter + 5 machine + 12 sequence) are the industry standard — time-sortable, compact, and zero-coordination within a configured cluster.",
          "The timestamp in the high bits gives Snowflake IDs free B-tree locality: new records always insert at the rightmost leaf, avoiding index fragmentation.",
          "Each Snowflake machine generates up to 4,096 IDs per millisecond; 1,024 machines yield over 4 billion IDs per second with no locks or network calls.",
          "UUID v4 needs no coordination but is 128 bits, unsortable, and fragments B-tree indexes. ULID is the sortable UUID upgrade — same 128 bits, but lexicographically time-ordered in 26 Crockford Base32 chars.",
          "Snowflake IDs are not private — the embedded timestamp lets observers estimate your growth rate. Use a secret epoch, random jitter, or format-preserving encryption if this matters.",
        ]}
      />
    </div>
  );
}
