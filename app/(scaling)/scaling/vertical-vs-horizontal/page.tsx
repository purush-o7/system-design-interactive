"use client";

import { useState, useMemo } from "react";
import { TopicHero } from "@/components/topic-hero";
import { KeyTakeaway } from "@/components/key-takeaway";
import { AhaMoment } from "@/components/aha-moment";
import { ConversationalCallout } from "@/components/conversational-callout";
import { Playground } from "@/components/playground";
import { FlowDiagram } from "@/components/flow-diagram";
import type { FlowNode, FlowEdge } from "@/components/flow-diagram";
import { LiveChart } from "@/components/live-chart";
import { cn } from "@/lib/utils";
import {
  Server,
  Skull,
  ShieldCheck,
  ArrowUp,
  ArrowRight,
  CheckCircle2,
  XCircle,
  HelpCircle,
} from "lucide-react";

const VERTICAL_TIERS = [
  { label: "t3.medium",    cores: 2,  ram: 4,   cost: 30,   capacity: 1000  },
  { label: "m6i.large",   cores: 2,  ram: 8,   cost: 70,   capacity: 3000  },
  { label: "m6i.xlarge",  cores: 4,  ram: 16,  cost: 140,  capacity: 6000  },
  { label: "m6i.4xlarge", cores: 16, ram: 64,  cost: 560,  capacity: 20000 },
  { label: "m6i.12xl",    cores: 48, ram: 192, cost: 1682, capacity: 40000 },
  { label: "m6i.24xl",    cores: 96, ram: 384, cost: 3364, capacity: 60000 },
];

// Static size classes — no dynamic Tailwind interpolation
const SERVER_SIZE_CLASSES = [
  "h-16 w-16", "h-20 w-20", "h-28 w-28",
  "h-36 w-36", "h-44 w-44", "h-52 w-52",
] as const;

const COST_DATA = [
  { users: "1K",  vertical: 30,   horizontal: 70   },
  { users: "5K",  vertical: 140,  horizontal: 140  },
  { users: "10K", vertical: 560,  horizontal: 280  },
  { users: "25K", vertical: 1682, horizontal: 560  },
  { users: "50K", vertical: 3364, horizontal: 1190 },
  { users: "100K",vertical: 6720, horizontal: 2380 },
];

/* ================================================================
   SHARED HELPERS
   ================================================================ */

function StatGrid({ items }: { items: { label: string; value: string }[] }) {
  return (
    <div className="grid grid-cols-3 gap-2 text-center">
      {items.map((s) => (
        <div key={s.label} className="rounded-md bg-muted/30 border border-border/40 px-2 py-1.5">
          <div className="text-[10px] text-muted-foreground">{s.label}</div>
          <div className="text-xs font-mono font-bold">{s.value}</div>
        </div>
      ))}
    </div>
  );
}

/* ================================================================
   SCALING SIMULATOR
   Left: vertical (one big server grows)
   Right: horizontal (FlowDiagram with more nodes)
   ================================================================ */

function ScalingSimulator() {
  const [verticalTier, setVerticalTier] = useState(0);
  const [horizontalCount, setHorizontalCount] = useState(1);

  const vTier = VERTICAL_TIERS[verticalTier];
  const atCeiling = verticalTier === VERTICAL_TIERS.length - 1;

  const hCostPerNode = 70;
  const hCapacityPerNode = 3000;
  const hTotalCost = horizontalCount * hCostPerNode;
  const hTotalCapacity = horizontalCount * hCapacityPerNode;

  const hNodes: FlowNode[] = useMemo(() => {
    const spread = Math.min(horizontalCount, 4);
    const offsetX = 250 - (spread * 140) / 2 + 70;
    const cpuPct = Math.round(100 / horizontalCount);

    const serverRows: FlowNode[] = Array.from({ length: horizontalCount }, (_, i) => {
      const col = i % 4;
      const row = Math.floor(i / 4);
      return {
        id: `s${i}`,
        type: "serverNode" as const,
        position: { x: offsetX + col * 140, y: 130 + row * 110 },
        data: {
          label: `Server ${i + 1}`,
          sublabel: "m6i.large",
          status: (cpuPct > 80 ? "warning" : "healthy") as "warning" | "healthy",
          metrics: [
            { label: "CPU", value: `${cpuPct}%` },
            { label: "RAM", value: "8 GB" },
          ],
          handles: { top: true, bottom: false },
        },
      };
    });

    return [
      {
        id: "h-client",
        type: "clientNode" as const,
        position: { x: 250, y: -80 },
        data: {
          label: "Users",
          sublabel: `${hTotalCapacity.toLocaleString()} cap`,
          status: "healthy" as const,
          handles: { bottom: true },
        },
      },
      {
        id: "h-lb",
        type: "loadBalancerNode" as const,
        position: { x: 250, y: 20 },
        data: {
          label: "Load Balancer",
          sublabel: `${horizontalCount} backends`,
          status: "healthy" as const,
          handles: { top: true, bottom: true },
        },
      },
      ...serverRows,
    ];
  }, [horizontalCount, hTotalCapacity]);

  const hEdges: FlowEdge[] = useMemo(() => [
    { id: "hc-hlb", source: "h-client", target: "h-lb", animated: true },
    ...Array.from({ length: horizontalCount }, (_, i) => ({
      id: `hlb-s${i}`,
      source: "h-lb",
      target: `s${i}`,
      animated: true,
    })),
  ], [horizontalCount]);

  // Cost comparison at current vertical tier
  const hEquivNodes = Math.ceil(vTier.capacity / hCapacityPerNode);
  const hEquivCost = hEquivNodes * hCostPerNode;
  const saving = vTier.cost - hEquivCost;

  return (
    <div className="space-y-6 p-4">
      <div className="grid md:grid-cols-2 gap-6">
        {/* ── Vertical panel ── */}
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/[0.02] p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-blue-400">
            <ArrowUp className="size-4" /> Vertical (Scale Up)
          </div>

          {/* Growing server visualization */}
          <div className="flex flex-col items-center gap-2 min-h-[180px] justify-center">
            <div
              className={cn(
                "rounded-2xl border-2 flex flex-col items-center justify-center transition-all duration-500 gap-1",
                atCeiling
                  ? "border-red-500/50 bg-red-500/[0.07] shadow-lg shadow-red-500/10"
                  : "border-blue-500/30 bg-blue-500/[0.06] shadow-lg shadow-blue-500/10",
                SERVER_SIZE_CLASSES[verticalTier]
              )}
            >
              <Server className={cn("transition-all duration-500", atCeiling ? "text-red-400" : "text-blue-400", verticalTier < 2 ? "size-5" : verticalTier < 4 ? "size-7" : "size-9")} />
              <span className="text-[9px] font-mono font-bold leading-none">{vTier.label}</span>
            </div>
            {atCeiling && (
              <span className="text-[11px] text-red-400 font-semibold animate-pulse">Hardware ceiling reached!</span>
            )}
          </div>

          <div>
            <label className="text-[11px] text-muted-foreground block mb-1.5">
              Instance tier — {verticalTier + 1} / {VERTICAL_TIERS.length}
            </label>
            <input type="range" min={0} max={VERTICAL_TIERS.length - 1} value={verticalTier}
              onChange={(e) => setVerticalTier(Number(e.target.value))} className="w-full accent-blue-500" />
          </div>

          <StatGrid items={[
            { label: "vCPUs",   value: String(vTier.cores) },
            { label: "RAM",     value: `${vTier.ram} GB` },
            { label: "Cost/mo", value: `$${vTier.cost.toLocaleString()}` },
          ]} />
          <p className="text-[11px] text-center text-muted-foreground">
            Capacity: <span className="font-mono font-bold text-foreground">{vTier.capacity.toLocaleString()}</span> users
          </p>
        </div>

        {/* ── Horizontal panel ── */}
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.02] p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-emerald-400">
            <ArrowRight className="size-4" /> Horizontal (Scale Out)
          </div>
          <div className="h-52">
            <FlowDiagram nodes={hNodes} edges={hEdges} interactive={false} allowDrag={false} minHeight={200} />
          </div>
          <div>
            <label className="text-[11px] text-muted-foreground block mb-1.5">Server count — {horizontalCount}</label>
            <input type="range" min={1} max={8} value={horizontalCount}
              onChange={(e) => setHorizontalCount(Number(e.target.value))} className="w-full accent-emerald-500" />
          </div>
          <StatGrid items={[
            { label: "Total vCPUs", value: String(horizontalCount * 2) },
            { label: "Total RAM",   value: `${horizontalCount * 8} GB` },
            { label: "Cost/mo",     value: `$${hTotalCost.toLocaleString()}` },
          ]} />
          <p className="text-[11px] text-center text-muted-foreground">
            Capacity: <span className="font-mono font-bold text-foreground">{hTotalCapacity.toLocaleString()}</span> users
          </p>
        </div>
      </div>

      {verticalTier > 1 && (
        <div className="rounded-lg border border-border/50 bg-muted/20 p-3 flex flex-wrap items-center justify-center gap-4 text-sm text-center">
          <span className="text-xs text-muted-foreground">~{vTier.capacity.toLocaleString()} users:</span>
          <span className="font-mono"><span className="text-blue-400">${vTier.cost.toLocaleString()}</span> <span className="text-[11px] text-muted-foreground">vertical</span></span>
          <span className="text-xs text-muted-foreground">vs</span>
          <span className="font-mono"><span className="text-emerald-400">${hEquivCost.toLocaleString()}</span> <span className="text-[11px] text-muted-foreground">horizontal ({hEquivNodes}×)</span></span>
          {saving > 0 && <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 rounded-full px-2 py-0.5">Save ${saving.toLocaleString()}/mo</span>}
        </div>
      )}
    </div>
  );
}

/* ================================================================
   FAILURE DEMO
   Kill vertical = total outage | Kill horizontal = partial
   ================================================================ */

function FailureDemo() {
  const [verticalDead, setVerticalDead] = useState(false);
  const [killedServer, setKilledServer] = useState<number | null>(null);
  const serverCount = 4;

  const vNodes: FlowNode[] = useMemo(() => [
    {
      id: "v-client",
      type: "clientNode" as const,
      position: { x: 150, y: 0 },
      data: {
        label: "Users",
        sublabel: verticalDead ? "Connection refused!" : "Sending requests",
        status: (verticalDead ? "unhealthy" : "healthy") as "unhealthy" | "healthy",
        handles: { bottom: true },
      },
    },
    {
      id: "v-server",
      type: "serverNode" as const,
      position: { x: 150, y: 130 },
      data: {
        label: "Mega Server",
        sublabel: verticalDead ? "CRASHED" : "m6i.24xlarge",
        status: (verticalDead ? "unhealthy" : "healthy") as "unhealthy" | "healthy",
        metrics: verticalDead
          ? [{ label: "Status", value: "DOWN" }]
          : [{ label: "CPU", value: "72%" }, { label: "RAM", value: "384 GB" }],
        handles: { top: true, bottom: true },
      },
    },
    {
      id: "v-db",
      type: "databaseNode" as const,
      position: { x: 150, y: 260 },
      data: {
        label: "Database",
        sublabel: verticalDead ? "Unreachable" : "PostgreSQL",
        status: (verticalDead ? "unhealthy" : "healthy") as "unhealthy" | "healthy",
        handles: { top: true },
      },
    },
  ], [verticalDead]);

  const vEdges: FlowEdge[] = useMemo(() => [
    { id: "vc-vs", source: "v-client", target: "v-server", animated: !verticalDead },
    { id: "vs-vdb", source: "v-server", target: "v-db", animated: !verticalDead },
  ], [verticalDead]);

  const alive = killedServer !== null ? serverCount - 1 : serverCount;
  const hNodes: FlowNode[] = useMemo(() => {
    const startX = 250 - (serverCount * 140) / 2 + 70;
    return [
      {
        id: "h-client",
        type: "clientNode" as const,
        position: { x: 250, y: 0 },
        data: {
          label: "Users",
          sublabel: killedServer !== null ? "Rerouting traffic..." : "Sending requests",
          status: "healthy" as const,
          handles: { bottom: true },
        },
      },
      {
        id: "h-lb",
        type: "loadBalancerNode" as const,
        position: { x: 250, y: 110 },
        data: {
          label: "Load Balancer",
          sublabel: `${alive} healthy`,
          status: "healthy" as const,
          handles: { top: true, bottom: true },
        },
      },
      ...Array.from({ length: serverCount }, (_, i) => {
        const dead = killedServer === i;
        return {
          id: `h-s${i}`,
          type: "serverNode" as const,
          position: { x: startX + i * 140, y: 240 },
          data: {
            label: `S${i + 1}`,
            sublabel: dead ? "CRASHED" : "m6i.large",
            status: (dead ? "unhealthy" : "healthy") as "unhealthy" | "healthy",
            metrics: dead
              ? [{ label: "Status", value: "DOWN" }]
              : [{ label: "CPU", value: `${Math.round(100 / alive)}%` }],
            handles: { top: true },
          },
        };
      }),
    ];
  }, [killedServer, alive]);

  const hEdges: FlowEdge[] = useMemo(() => [
    { id: "hc-hlb", source: "h-client", target: "h-lb", animated: true },
    ...Array.from({ length: serverCount }, (_, i) => i)
      .filter((i) => killedServer !== i)
      .map((i) => ({ id: `hlb-hs${i}`, source: "h-lb", target: `h-s${i}`, animated: true })),
  ], [killedServer]);

  return (
    <div className="space-y-5 p-4">
      <p className="text-sm text-muted-foreground">
        Kill a server in each architecture and watch what happens. This single difference
        is the strongest argument for horizontal scaling in production.
      </p>
      <div className="grid md:grid-cols-2 gap-5">
        {/* Vertical failure */}
        <div className="rounded-xl border border-border/50 overflow-hidden">
          <div className="flex items-center justify-between bg-muted/20 border-b border-border/30 px-4 py-2">
            <span className="text-xs font-semibold text-blue-400">Vertical</span>
            <span className={cn(
              "text-[10px] font-mono px-2 py-0.5 rounded-full",
              verticalDead ? "bg-red-500/20 text-red-400" : "bg-emerald-500/20 text-emerald-400"
            )}>
              {verticalDead ? "TOTAL OUTAGE" : "OPERATIONAL"}
            </span>
          </div>
          <div className="h-72">
            <FlowDiagram nodes={vNodes} edges={vEdges} interactive={false} allowDrag={false} minHeight={280} />
          </div>
          <div className="border-t border-border/30 p-3 flex justify-center">
            <button
              onClick={() => setVerticalDead(!verticalDead)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium transition-colors",
                verticalDead
                  ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                  : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
              )}
            >
              {verticalDead
                ? <><ShieldCheck className="size-3.5" /> Restart Server</>
                : <><Skull className="size-3.5" /> Kill Server</>}
            </button>
          </div>
        </div>

        {/* Horizontal failure */}
        <div className="rounded-xl border border-border/50 overflow-hidden">
          <div className="flex items-center justify-between bg-muted/20 border-b border-border/30 px-4 py-2">
            <span className="text-xs font-semibold text-emerald-400">Horizontal</span>
            <span className={cn(
              "text-[10px] font-mono px-2 py-0.5 rounded-full",
              killedServer !== null ? "bg-amber-500/20 text-amber-400" : "bg-emerald-500/20 text-emerald-400"
            )}>
              {killedServer !== null ? `DEGRADED (${alive}/${serverCount})` : "OPERATIONAL"}
            </span>
          </div>
          <div className="h-72">
            <FlowDiagram nodes={hNodes} edges={hEdges} interactive={false} allowDrag={false} minHeight={280} />
          </div>
          <div className="border-t border-border/30 p-3 flex flex-wrap justify-center gap-2">
            {Array.from({ length: serverCount }).map((_, i) => (
              <button
                key={i}
                onClick={() => setKilledServer(killedServer === i ? null : i)}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-medium transition-colors",
                  killedServer === i
                    ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                    : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                )}
              >
                {killedServer === i ? <ShieldCheck className="size-3" /> : <Skull className="size-3" />}
                S{i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {verticalDead && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/[0.04] p-3 text-center">
          <p className="text-sm text-red-400 font-medium">100% of traffic dropped — complete outage. Every user sees an error.</p>
        </div>
      )}
      {killedServer !== null && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/[0.04] p-3 text-center">
          <p className="text-sm text-amber-400 font-medium">Server {killedServer + 1} down. Load balancer reroutes to remaining {alive} servers — zero downtime.</p>
        </div>
      )}
    </div>
  );
}

/* ================================================================
   DECISION QUIZ
   ================================================================ */

const QUIZ_QUESTIONS = [
  {
    q: "Your startup has 500 daily active users and one developer. What do you do?",
    options: [
      { text: "Scale vertically — bigger server", correct: true },
      { text: "Add 5 horizontal servers with a load balancer", correct: false },
      { text: "Shard the database immediately", correct: false },
    ],
    explanation: "At 500 users you need simplicity, not resilience. One bigger server means zero operational overhead. Horizontal complexity would slow your product development.",
  },
  {
    q: "Your app hits 50K concurrent users and you need zero-downtime deployments. What changes?",
    options: [
      { text: "Keep upgrading the single server — it's working", correct: false },
      { text: "Add horizontal app servers behind a load balancer", correct: true },
      { text: "Migrate to a NoSQL database", correct: false },
    ],
    explanation: "A load balancer lets you take one server out of rotation, deploy, bring it back — then repeat for each node. Zero downtime. A single server always requires a maintenance window.",
  },
  {
    q: "Your database is the bottleneck. You've maxed vertical scaling. What's next?",
    options: [
      { text: "Add more stateless web servers", correct: false },
      { text: "Introduce read replicas for read-heavy load", correct: true },
      { text: "Move sessions from Redis to local memory", correct: false },
    ],
    explanation: "Read replicas offload SELECT queries from the primary, often resolving 80%+ of DB bottlenecks before you need full sharding. Adding web servers doesn't help if the DB is the bottleneck.",
  },
];

function DecisionQuiz() {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const q = QUIZ_QUESTIONS[current];

  function handleAnswer(idx: number) {
    if (selected !== null) return;
    setSelected(idx);
    if (q.options[idx].correct) setScore((s) => s + 1);
  }

  function handleNext() {
    if (current < QUIZ_QUESTIONS.length - 1) {
      setCurrent((c) => c + 1);
      setSelected(null);
    } else {
      setDone(true);
    }
  }

  function handleReset() {
    setCurrent(0);
    setSelected(null);
    setScore(0);
    setDone(false);
  }

  if (done) {
    return (
      <div className="rounded-xl border border-violet-500/20 bg-violet-500/[0.03] p-6 text-center space-y-3">
        <p className="text-2xl font-bold">{score}/{QUIZ_QUESTIONS.length}</p>
        <p className="text-sm text-muted-foreground">
          {score === QUIZ_QUESTIONS.length
            ? "Perfect! You know exactly when to scale up vs out."
            : score >= 2
            ? "Good instincts — review the explanations for anything you missed."
            : "Real-world scaling decisions are tricky. Re-read the explanations and try again."}
        </p>
        <button
          onClick={handleReset}
          className="mt-2 rounded-lg bg-violet-500/20 text-violet-400 hover:bg-violet-500/30 px-4 py-2 text-sm font-medium transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <HelpCircle className="size-3.5" />
        Question {current + 1} of {QUIZ_QUESTIONS.length}
        <div className="ml-auto flex gap-1">
          {QUIZ_QUESTIONS.map((_, i) => (
            <div
              key={i}
              className={cn(
                "size-2 rounded-full",
                i < current ? "bg-violet-500" : i === current ? "bg-violet-500/50" : "bg-muted"
              )}
            />
          ))}
        </div>
      </div>

      <p className="text-sm font-medium text-foreground">{q.q}</p>

      <div className="space-y-2">
        {q.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleAnswer(i)}
            disabled={selected !== null}
            className={cn(
              "w-full text-left rounded-lg border px-4 py-3 text-sm transition-all",
              selected === null
                ? "border-border/50 hover:border-violet-500/40 hover:bg-violet-500/[0.03]"
                : selected === i && opt.correct
                ? "border-emerald-500/50 bg-emerald-500/[0.06] text-emerald-400"
                : selected === i && !opt.correct
                ? "border-red-500/50 bg-red-500/[0.06] text-red-400"
                : opt.correct
                ? "border-emerald-500/30 bg-emerald-500/[0.04] text-emerald-400/70"
                : "border-border/30 text-muted-foreground"
            )}
          >
            <div className="flex items-center gap-2">
              {selected !== null && opt.correct && <CheckCircle2 className="size-3.5 shrink-0 text-emerald-400" />}
              {selected !== null && selected === i && !opt.correct && <XCircle className="size-3.5 shrink-0 text-red-400" />}
              {opt.text}
            </div>
          </button>
        ))}
      </div>

      {selected !== null && (
        <div className="rounded-lg border border-border/40 bg-muted/20 p-3 space-y-2">
          <p className="text-xs text-muted-foreground">{q.explanation}</p>
          <button
            onClick={handleNext}
            className="text-xs font-medium text-violet-400 hover:text-violet-300 transition-colors"
          >
            {current < QUIZ_QUESTIONS.length - 1 ? "Next question →" : "See results →"}
          </button>
        </div>
      )}
    </div>
  );
}

/* ================================================================
   MAIN PAGE
   ================================================================ */

export default function VerticalVsHorizontalPage() {
  return (
    <div className="space-y-8">
      <TopicHero
        title="Vertical vs Horizontal Scaling"
        subtitle="Upgrading your server only delays the inevitable. Here's how to know when to scale up, when to scale out, and why every production system eventually does both."
        difficulty="beginner"
      />

      {/* ── Scaling Simulator ── */}
      <Playground
        title="Scaling Simulator"
        canvas={<ScalingSimulator />}
        canvasHeight="min-h-[160px]"
        controls={false}
        explanation={
          <div className="space-y-3">
            <p className="font-medium text-foreground">How to read this</p>
            <p>
              The <span className="text-blue-400 font-medium">blue slider</span> upgrades
              your single server to bigger instance types. Watch it grow — and the cost
              jump in non-linear leaps.
            </p>
            <p>
              The <span className="text-emerald-400 font-medium">green slider</span> adds
              identical servers behind a load balancer. Each node costs the same fixed
              amount.
            </p>
            <p className="text-xs border-t border-border/30 pt-2 text-muted-foreground">
              At low scale, one bigger server is cheaper and simpler. Above ~10K users
              horizontal becomes both more cost-effective and more resilient.
            </p>
          </div>
        }
      />

      {/* ── Cost Comparison Chart ── */}
      <div className="rounded-xl border border-border/50 p-5 space-y-4">
        <h3 className="text-sm font-semibold">Cost at Each Scale Point</h3>
        <p className="text-sm text-muted-foreground">
          Vertical costs grow super-linearly as you jump to premium instance tiers.
          Horizontal grows linearly — every additional server costs the same.
        </p>
        <LiveChart
          type="bar"
          data={COST_DATA}
          dataKeys={{
            x: "users",
            y: ["vertical", "horizontal"],
            label: ["Vertical ($/mo)", "Horizontal ($/mo)"],
          }}
          height={260}
          unit="$"
          referenceLines={[
            { y: 3364, label: "Vertical ceiling", color: "#ef4444" },
          ]}
        />
        <p className="text-[11px] text-muted-foreground text-center">
          Past the red line, vertical scaling simply cannot go further. Horizontal keeps growing.
        </p>
      </div>

      {/* ── Failure Demo ── */}
      <Playground
        title="Failure Demo — What Happens When a Server Dies?"
        canvas={<FailureDemo />}
        canvasHeight="min-h-[160px]"
        controls={false}
      />

      <ConversationalCallout type="warning">
        Don&apos;t dismiss vertical scaling as &quot;bad.&quot; Stack Overflow served millions of
        users from a handful of vertically-scaled SQL Server machines well past $10M ARR.
        Premature horizontal scaling adds distributed systems complexity you may not need
        yet. Start simple, scale when you must.
      </ConversationalCallout>

      {/* ── Decision Quiz ── */}
      <div className="rounded-xl border border-violet-500/20 bg-violet-500/[0.02] p-5 space-y-4">
        <div className="flex items-center gap-2">
          <div className="size-2 rounded-full bg-violet-500/50" />
          <h3 className="text-sm font-semibold text-violet-400">Decision Quiz</h3>
        </div>
        <DecisionQuiz />
      </div>

      <AhaMoment
        question="Why do databases scale vertically while web servers scale horizontally?"
        answer="Web servers are stateless — any server can handle any request, so adding more is trivial. Databases hold state that must stay consistent across every read and write. Splitting data across machines (sharding) introduces enormous complexity: cross-shard joins, distributed transactions, rebalancing. That's why most teams scale the DB vertically as long as possible, add read replicas next, then resort to full sharding only at extreme scale."
      />

      <ConversationalCallout type="tip">
        In interviews, mention that horizontal scaling requires a <strong>load balancer</strong> and
        a <strong>stateless application</strong> — no local sessions, no files on disk, no
        in-process caches that other instances can&apos;t see. Sessions go in Redis. Files go in S3.
        These prerequisites are exactly what interviewers listen for.
      </ConversationalCallout>

      <KeyTakeaway
        points={[
          "Vertical scaling (bigger server) is simpler but hits a hard hardware ceiling — the largest AWS instances top out around 128 vCPUs / 512 GB RAM.",
          "Horizontal scaling (more servers) offers near-infinite capacity but requires stateless design, load balancing, and externalized state (Redis, S3).",
          "Cost grows linearly with horizontal but super-linearly with vertical — at 100K users the difference can be 3-5×.",
          "Most production systems use both: vertically-scaled databases with horizontally-scaled stateless app servers.",
          "Horizontal scaling gives fault tolerance almost for free — if one server crashes, others absorb the load with zero downtime.",
          "The need to scale horizontally drives the most important system design decisions: load balancing, session management, shared storage, and replication.",
        ]}
      />
    </div>
  );
}
