"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { TopicHero } from "@/components/topic-hero";
import { KeyTakeaway } from "@/components/key-takeaway";
import { AhaMoment } from "@/components/aha-moment";
import { ConversationalCallout } from "@/components/conversational-callout";
import { BeforeAfter } from "@/components/before-after";
import { Playground } from "@/components/playground";
import { LiveChart } from "@/components/live-chart";
import { FlowDiagram, type FlowNode, type FlowEdge } from "@/components/flow-diagram";
import { useSimulation } from "@/hooks/use-simulation";
import { cn } from "@/lib/utils";
import { WhyCare } from "@/components/why-care";
import { GlossaryTerm } from "@/components/glossary-term";
import { TopicQuiz } from "@/components/topic-quiz";

// ─── Leader-Follower Playground ─────────────────────────────────────────────

function LeaderFollowerPlayground() {
  const [mode, setMode] = useState<"sync" | "async">("async");
  const [leaderAlive, setLeaderAlive] = useState(true);
  const [promoted, setPromoted] = useState(false);
  const [writes, setWrites] = useState<Array<{ id: number; synced: boolean[]; confirmed: boolean }>>([]);
  const [followerLag, setFollowerLag] = useState([0, 0, 0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const wc = useRef(0);

  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => {
      setFollowerLag((prev) => prev.map((l) => Math.max(0, l - 15 + Math.random() * 5)));
      setWrites((prev) => prev.map((w) => {
        const s = w.synced.map((v) => v || Math.random() > 0.4);
        return { ...w, synced: s, confirmed: mode === "async" || s.every(Boolean) };
      }));
    }, 800);
    return () => clearInterval(id);
  }, [isPlaying, mode]);

  const handleWrite = useCallback(() => {
    if (!leaderAlive && !promoted) return;
    wc.current += 1;
    setWrites((p) => [...p.slice(-4), { id: wc.current, synced: [false, false, false], confirmed: mode === "async" }]);
    setFollowerLag((p) => p.map((l) => l + 40 + Math.random() * 60));
  }, [leaderAlive, promoted, mode]);

  const handleKill = useCallback(() => {
    setLeaderAlive(false);
    setPromoted(false);
    setTimeout(() => setPromoted(true), 2500);
  }, []);

  const handleRestore = useCallback(() => {
    setLeaderAlive(true);
    setPromoted(false);
    setWrites([]);
    setFollowerLag([0, 0, 0]);
  }, []);

  const nodes: FlowNode[] = useMemo(() => [
    { id: "leader", type: "databaseNode", position: { x: 250, y: 0 },
      data: { label: leaderAlive ? "Leader" : "Leader (DOWN)", sublabel: leaderAlive ? "Reads + Writes" : "CRASHED",
        status: leaderAlive ? "healthy" : "unhealthy", handles: { bottom: true } } },
    ...([0, 1, 2] as const).map((i) => ({
      id: `f${i}`, type: "databaseNode" as const, position: { x: i * 200 + 50, y: 200 },
      data: { label: i === 0 && promoted ? "Follower 1 (NEW LEADER)" : `Follower ${i + 1}`,
        sublabel: `Lag: ${Math.round(followerLag[i])}ms`,
        status: (i === 0 && promoted ? "healthy" : "idle") as "healthy" | "idle",
        handles: { top: true } },
    })),
  ], [leaderAlive, promoted, followerLag]);

  const edges: FlowEdge[] = useMemo(() =>
    leaderAlive
      ? [0, 1, 2].map((i) => ({ id: `e-l-f${i}`, source: "leader", target: `f${i}`, animated: true }))
      : promoted ? [1, 2].map((i) => ({ id: `e-f0-f${i}`, source: "f0", target: `f${i}`, animated: true })) : [],
  [leaderAlive, promoted]);

  return (
    <Playground
      title="Leader-Follower Replication"
      hints={["Click Start, then Write Data to watch replication. Try Kill Leader to see automatic failover in action."]}
      canvas={<div className="p-4"><FlowDiagram nodes={nodes} edges={edges} minHeight={300} interactive={false} fitView /></div>}
      explanation={
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-foreground">Replication Mode</p>
            <div className="flex gap-2">
              {(["async", "sync"] as const).map((m) => (
                <button key={m} onClick={() => setMode(m)} className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                  mode === m ? "bg-violet-500/20 border-violet-500/40 text-violet-400" : "bg-muted/20 border-border/40 text-muted-foreground hover:bg-muted/40"
                )}>{m === "async" ? "Async" : "Sync"}</button>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground">
              {mode === "async" ? "Writes confirmed immediately. Followers may lag." : "Writes confirmed only after ALL followers acknowledge."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setIsPlaying(p => !p)}
              className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 border border-violet-500/20 transition-colors">
              {isPlaying ? "⏸ Pause" : "▶ Start"}
            </button>
            <button onClick={handleWrite} disabled={!leaderAlive && !promoted}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-500/15 border border-blue-500/30 text-blue-400 hover:bg-blue-500/25 transition-colors disabled:opacity-30">
              Write Data</button>
            {leaderAlive ? (
              <button onClick={handleKill} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25 transition-colors">
                Kill Leader</button>
            ) : (
              <button onClick={handleRestore} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 transition-colors">
                Restore Cluster</button>
            )}
          </div>
          {!leaderAlive && !promoted && (
            <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono animate-pulse">
              Detecting failure... electing new leader...</div>
          )}
          {promoted && (
            <div className="px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
              Follower 1 promoted to leader!</div>
          )}
          {writes.length > 0 && (
            <div className="space-y-1">
              <p className="text-[10px] font-semibold text-muted-foreground">Write Log</p>
              {writes.slice(-3).map((w) => (
                <div key={w.id} className="flex items-center gap-2 text-[10px] font-mono">
                  <span className="text-muted-foreground">#{w.id}</span>
                  <span className={w.confirmed ? "text-emerald-400" : "text-amber-400"}>
                    {w.confirmed ? "confirmed" : "pending..."}</span>
                  <span className="text-muted-foreground/60">[{w.synced.map((f) => f ? "v" : ".").join("")}]</span>
                </div>
              ))}
            </div>
          )}
        </div>
      }
      controls={false}
    />
  );
}

// ─── Replication Lag Chart ──────────────────────────────────────────────────

function ReplicationLagMonitor() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [data, setData] = useState<Array<{ t: string; f1: number; f2: number; f3: number }>>([]);
  useEffect(() => {
    if (!isPlaying) return;
    let tick = 0;
    const base = [5, 12, 30];
    const id = setInterval(() => {
      tick += 1;
      const spike = Math.random() > 0.85;
      setData((prev) => [...prev.slice(-24), {
        t: `${tick}s`,
        f1: Math.max(0, base[0] + (spike ? 80 : 0) + Math.random() * 10 - 5),
        f2: Math.max(0, base[1] + (spike ? 150 : 0) + Math.random() * 20 - 10),
        f3: Math.max(0, base[2] + (spike ? 300 : 0) + Math.random() * 40 - 20),
      }]);
    }, 1000);
    return () => clearInterval(id);
  }, [isPlaying]);

  return (
    <div className="space-y-3">
      <div className="flex justify-start">
        <button onClick={() => setIsPlaying(p => !p)}
          className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 border border-violet-500/20 transition-colors">
          {isPlaying ? "⏸ Pause" : "▶ Start"}
        </button>
      </div>
      <p className="text-sm text-muted-foreground">
        Replication lag fluctuates with write volume and network conditions. Spikes are normal,
        but sustained high lag means followers serve stale data.
      </p>
      <LiveChart type="latency" data={data}
        dataKeys={{ x: "t", y: ["f1", "f2", "f3"], label: ["Follower 1", "Follower 2", "Follower 3"] }}
        height={200} unit="ms"
        referenceLines={[{ y: 100, label: "Warning threshold", color: "#f59e0b" }]} />
      <div className="flex gap-4 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-blue-500" /> Follower 1 (same rack)</span>
        <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-emerald-500" /> Follower 2 (same region)</span>
        <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-amber-500" /> Follower 3 (cross-region)</span>
      </div>
    </div>
  );
}

// ─── Multi-Leader Playground ────────────────────────────────────────────────

type ConflictStrategy = "lww" | "merge" | "manual";
const strategyMeta: Record<ConflictStrategy, { label: string; desc: string }> = {
  lww: { label: "Last-Write-Wins", desc: "Latest timestamp wins. Simple but may silently drop valid writes." },
  merge: { label: "Merge Values", desc: "Both values merged (CRDTs). Works for append-only data." },
  manual: { label: "Flag for Manual", desc: "Conflict flagged for human or app-level resolution." },
};

function MultiLeaderPlayground() {
  const [strategy, setStrategy] = useState<ConflictStrategy>("lww");
  const [phase, setPhase] = useState<"idle" | "conflict" | "resolved">("idle");
  const [values, setValues] = useState(["alice@co.com", "alice@co.com", "alice@co.com"]);

  const triggerConflict = useCallback(() => {
    setPhase("conflict");
    setValues(["alice@new.com", "bob@new.com", "alice@co.com"]);
    setTimeout(() => {
      setPhase("resolved");
      const r: Record<ConflictStrategy, string> = {
        lww: "bob@new.com", merge: "[alice@new, bob@new]", manual: "CONFLICT!",
      };
      setValues([r[strategy], r[strategy], r[strategy]]);
    }, 3000);
  }, [strategy]);

  const reset = useCallback(() => {
    setPhase("idle");
    setValues(["alice@co.com", "alice@co.com", "alice@co.com"]);
  }, []);

  const nodeStatus = (i: number): "healthy" | "warning" => phase === "conflict" && i < 2 ? "warning" : "healthy";
  const names = ["Leader US", "Leader EU", "Leader APAC"];

  const nodes: FlowNode[] = useMemo(() => [
    { id: "l0", type: "databaseNode", position: { x: 50, y: 80 },
      data: { label: names[0], sublabel: `user.email = ${values[0]}`, status: nodeStatus(0), handles: { right: true } } },
    { id: "l1", type: "databaseNode", position: { x: 300, y: 0 },
      data: { label: names[1], sublabel: `user.email = ${values[1]}`, status: nodeStatus(1), handles: { left: true, bottom: true } } },
    { id: "l2", type: "databaseNode", position: { x: 300, y: 170 },
      data: { label: names[2], sublabel: `user.email = ${values[2]}`, status: nodeStatus(2), handles: { left: true, top: true } } },
  ], [values, phase]);

  const edges: FlowEdge[] = useMemo(() => [
    { id: "e01", source: "l0", target: "l1", animated: true },
    { id: "e10", source: "l1", target: "l0", animated: true },
    { id: "e12", source: "l1", target: "l2", animated: true },
    { id: "e20", source: "l2", target: "l0", animated: true },
  ], []);

  return (
    <Playground
      title="Multi-Leader Replication & Conflict Resolution"
      hints={["Choose a conflict resolution strategy, then click Trigger Conflict to see what happens when two leaders update the same key."]}
      canvas={<div className="p-4"><FlowDiagram nodes={nodes} edges={edges} minHeight={280} interactive={false} fitView /></div>}
      explanation={
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Three leaders each accept writes and replicate to each other. Trigger a conflict to see
            what happens when two leaders update the same key simultaneously.
          </p>
          <div className="space-y-2">
            <p className="text-[10px] font-semibold text-foreground">Conflict Resolution Strategy</p>
            <div className="flex flex-wrap gap-1.5">
              {(["lww", "merge", "manual"] as const).map((s) => (
                <button key={s} onClick={() => { setStrategy(s); reset(); }} className={cn(
                  "px-2.5 py-1 rounded-md text-[10px] font-medium border transition-colors",
                  strategy === s ? "bg-violet-500/20 border-violet-500/40 text-violet-400" : "bg-muted/20 border-border/40 text-muted-foreground hover:bg-muted/40"
                )}>{strategyMeta[s].label}</button>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground">{strategyMeta[strategy].desc}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={triggerConflict} disabled={phase === "conflict"}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25 transition-colors disabled:opacity-40">
              Trigger Conflict</button>
            <button onClick={reset}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-muted/20 border border-border/40 text-muted-foreground hover:bg-muted/40 transition-colors">
              Reset</button>
          </div>
          {phase === "conflict" && (
            <div className="px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono animate-pulse">
              Conflict! US wrote alice@new.com, EU wrote bob@new.com</div>
          )}
          {phase === "resolved" && (
            <div className="px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
              Resolved via {strategyMeta[strategy].label}</div>
          )}
        </div>
      }
      controls={false}
    />
  );
}

// ─── Consistency Comparison ─────────────────────────────────────────────────

function ConsistencyComparison() {
  const sim = useSimulation({ intervalMs: 600, maxSteps: 30 });
  const [strongData, setStrongData] = useState<Array<{ t: string; staleness: number }>>([]);
  const [eventualData, setEventualData] = useState<Array<{ t: string; staleness: number }>>([]);

  useEffect(() => {
    if (sim.tick === 0) { setStrongData([]); setEventualData([]); return; }
    const t = `${sim.tick}`;
    setStrongData((p) => [...p.slice(-24), { t, staleness: 0 }]);
    const isWrite = sim.tick % 5 === 0;
    setEventualData((p) => {
      const last = p.length > 0 ? p[p.length - 1].staleness : 0;
      const s = isWrite ? 80 + Math.random() * 120 : Math.max(0, last - 15 + Math.random() * 5);
      return [...p.slice(-24), { t, staleness: Math.round(s) }];
    });
  }, [sim.tick]);

  const lastStale = eventualData.length > 0 ? eventualData[eventualData.length - 1].staleness : 0;
  const isWrite = sim.tick % 5 === 0 && sim.tick > 0;

  return (
    <Playground
      title="Strong vs Eventual Consistency"
      simulation={sim}
      canvas={
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/[0.03] p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-emerald-500" />
                <span className="text-sm font-semibold text-emerald-400">Strong Consistency</span>
              </div>
              <div className="text-xs text-muted-foreground">Reads routed to leader. Always fresh.</div>
              <div className="font-mono text-sm">
                {isWrite && <div className="text-blue-400 text-[10px] mb-1">WRITE: user.name = &quot;Alice&quot;</div>}
                <div className="text-emerald-400">
                  READ: user.name = &quot;{isWrite || sim.tick > 5 ? "Alice" : "---"}&quot;
                  <span className="text-emerald-500/60 ml-2">fresh</span>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/[0.03] p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-amber-500" />
                <span className="text-sm font-semibold text-amber-400">Eventual Consistency</span>
              </div>
              <div className="text-xs text-muted-foreground">Reads from nearest follower. May be stale.</div>
              <div className="font-mono text-sm">
                {isWrite && <div className="text-blue-400 text-[10px] mb-1">WRITE: user.name = &quot;Alice&quot;</div>}
                <div className={lastStale > 50 ? "text-red-400" : "text-emerald-400"}>
                  READ: user.name = &quot;{lastStale > 50 ? "Bob" : sim.tick > 5 ? "Alice" : "---"}&quot;
                  {lastStale > 50 && <span className="text-red-500/60 ml-2">stale ({lastStale}ms)</span>}
                  {lastStale <= 50 && lastStale > 0 && <span className="text-emerald-500/60 ml-2">caught up</span>}
                </div>
              </div>
            </div>
          </div>
          {eventualData.length > 2 && (
            <LiveChart type="latency"
              data={eventualData.map((d, i) => ({ t: d.t, eventual: d.staleness, strong: strongData[i]?.staleness ?? 0 }))}
              dataKeys={{ x: "t", y: ["strong", "eventual"], label: ["Strong", "Eventual"] }}
              height={150} unit="ms"
              referenceLines={[{ y: 50, label: "Stale threshold", color: "#ef4444" }]} />
          )}
        </div>
      }
      explanation={(state) => (
        <div className="space-y-3">
          <p className="text-xs">
            Every 5 ticks a write occurs. Strong consistency always returns the latest value.
            Eventual consistency reads from a follower that may lag behind.
          </p>
          <div className="space-y-1.5 text-[10px]">
            <div className="flex justify-between"><span className="text-muted-foreground">Tick</span><span className="font-mono">{state.tick}/{state.maxSteps}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Writes</span><span className="font-mono">{Math.floor(state.tick / 5)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Staleness</span>
              <span className={cn("font-mono", lastStale > 50 ? "text-red-400" : "text-emerald-400")}>{lastStale}ms</span></div>
          </div>
        </div>
      )}
    />
  );
}

// ─── Read-Your-Own-Writes Demo ──────────────────────────────────────────────

function ReadYourWritesDemo() {
  const [step, setStep] = useState(0);
  const [pinToLeader, setPinToLeader] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const phases = [
    { label: "User updates profile", desc: "Write goes to Leader", stale: false },
    { label: "User immediately reads", desc: pinToLeader ? "Read from Leader (pinned)" : "Read from Follower", stale: !pinToLeader },
    { label: "Follower catches up", desc: "All nodes consistent", stale: false },
  ];

  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => setStep((s) => (s + 1) % 4), 1500);
    return () => clearInterval(id);
  }, [isPlaying]);

  const active = Math.min(step, 2);

  return (
    <div className="space-y-4">
      <div className="flex justify-start">
        <button onClick={() => setIsPlaying(p => !p)}
          className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 border border-violet-500/20 transition-colors">
          {isPlaying ? "⏸ Pause" : "▶ Start"}
        </button>
      </div>
      <label className="text-xs text-muted-foreground flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={pinToLeader} onChange={(e) => setPinToLeader(e.target.checked)} className="accent-violet-500" />
        Enable read-after-write routing (pin to leader)
      </label>
      <div className="space-y-2">
        {phases.map((p, i) => {
          const isActive = i === active;
          const showStale = isActive && p.stale;
          return (
            <div key={p.label} className={cn(
              "flex items-center gap-3 px-4 py-2.5 rounded-lg border transition-all",
              isActive ? (showStale ? "bg-red-500/8 border-red-500/25" : "bg-emerald-500/8 border-emerald-500/25") : "bg-muted/10 border-border/30"
            )}>
              <span className={cn("size-6 rounded-full flex items-center justify-center text-xs font-bold",
                isActive ? (showStale ? "bg-red-500/20 text-red-400" : "bg-emerald-500/20 text-emerald-400") : "bg-muted/30 text-muted-foreground/50"
              )}>{i + 1}</span>
              <div className="flex-1">
                <span className="text-sm font-medium">{p.label}</span>
                <span className="text-xs text-muted-foreground ml-2">{p.desc}</span>
              </div>
              {isActive && showStale && <span className="text-[10px] font-mono text-red-400 px-2 py-0.5 rounded bg-red-500/10">STALE READ!</span>}
              {isActive && !showStale && i < 2 && <span className="text-[10px] font-mono text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10">FRESH</span>}
            </div>
          );
        })}
      </div>
      {!pinToLeader && (
        <ConversationalCallout type="warning">
          Without read-after-write routing, the user sees stale data right after updating. Their write appears lost.
        </ConversationalCallout>
      )}
      {pinToLeader && (
        <ConversationalCallout type="tip">
          By pinning recent-writer reads to the leader, the user always sees their own writes. Other users still read from followers.
        </ConversationalCallout>
      )}
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function ReplicationPage() {
  return (
    <div className="space-y-8">
      <TopicHero
        title="Database Replication"
        subtitle="Your database server dies at 3 AM. Do you lose everything, or does a replica seamlessly take over? Replication is the difference between a postmortem and a pager alert that resolves itself."
        difficulty="intermediate"
      />

      <WhyCare>
        GitHub went down for 24 hours in 2018 due to a <GlossaryTerm term="replication">replication</GlossaryTerm> failure. Understanding replication isn&apos;t just academic — it&apos;s what keeps data safe.
      </WhyCare>

      <ConversationalCallout type="warning">
        A single database is a <strong>single point of failure</strong>. Hardware fails, disks corrupt,
        data centers lose power. Backups give you point-in-time recovery, but everything between the
        last backup and the crash is gone. Replication copies every write to other servers in real time,
        reducing that gap to zero.
      </ConversationalCallout>

      <section className="space-y-4">
        <h2 className="text-xl font-bold">Leader-Follower Replication</h2>
        <p className="text-sm text-muted-foreground">
          The most common pattern: one <strong className="text-foreground">leader</strong> handles all
          writes and streams changes via the Write-Ahead Log to <strong className="text-foreground">followers</strong>.
          Click &quot;Write Data&quot; to watch replication, toggle sync/async modes, then kill the leader to see failover.
        </p>
        <LeaderFollowerPlayground />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold">Live Replication Lag</h2>
        <ReplicationLagMonitor />
      </section>

      <AhaMoment
        question="Why not just make everything synchronous and avoid stale reads entirely?"
        answer={
          <p>
            Synchronous replication creates a <strong>chain of availability</strong>. If any sync
            replica is down, the leader blocks all writes. Cross-region sync adds 50-150ms of <GlossaryTerm term="latency">latency</GlossaryTerm> per write.
            Most production systems use <strong>semi-synchronous</strong>: one follower is synchronous
            (safe for failover), the rest are asynchronous (for read scaling).
          </p>
        }
      />

      <section className="space-y-4">
        <h2 className="text-xl font-bold">Multi-Leader Replication</h2>
        <p className="text-sm text-muted-foreground">
          Multiple servers each accept writes and replicate to each other. Great for multi-region write
          availability, but introduces conflicts when two leaders update the same key simultaneously. This ties into the <GlossaryTerm term="cap theorem">CAP theorem</GlossaryTerm> trade-offs.
        </p>
        <MultiLeaderPlayground />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold">Strong vs Eventual Consistency</h2>
        <p className="text-sm text-muted-foreground">
          Press play to compare consistency models side-by-side. Every 5 ticks a write occurs.
          Strong consistency always returns the latest value; eventual may return stale data that converges.
        </p>
        <ConsistencyComparison />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold">Read-Your-Own-Writes Problem</h2>
        <p className="text-sm text-muted-foreground">
          A user writes data, then immediately reads from a lagging follower. Toggle the checkbox to
          see how read-after-write routing fixes the problem.
        </p>
        <ReadYourWritesDemo />
      </section>

      <BeforeAfter
        before={{ title: "No Replication", content: (
          <ul className="space-y-1 text-xs text-muted-foreground">
            <li>Single point of failure -- hardware crash = total downtime</li>
            <li>RPO: hours (depends on backup frequency)</li>
            <li>RTO: 30min-2hrs (restore from backup)</li>
            <li>All reads hit one server -- no read scaling</li>
          </ul>
        ) }}
        after={{ title: "With Replication", content: (
          <ul className="space-y-1 text-xs text-muted-foreground">
            <li>Automatic failover in 5-30 seconds</li>
            <li>RPO: 0 (sync) or sub-second (async)</li>
            <li>RTO: seconds (automatic, no restore needed)</li>
            <li>Reads distributed across N replicas</li>
          </ul>
        ) }}
      />

      <TopicQuiz
        questions={[
          {
            question: "A user updates their profile photo, then immediately refreshes the page and sees the old photo. What is the most likely cause?",
            options: [
              "The database lost the write permanently",
              "The read was routed to a lagging follower that hasn't received the write yet",
              "The browser cached the old image",
              "The leader rejected the write due to a schema violation",
            ],
            correctIndex: 1,
            explanation: "This is the classic 'read-your-own-writes' problem. With async replication, a read routed to a follower may return stale data if the follower hasn't caught up. The fix is read-after-write routing: pin recent-writer reads to the leader.",
          },
          {
            question: "Why do most production databases use semi-synchronous replication instead of fully synchronous?",
            options: [
              "Fully synchronous replication corrupts data more often",
              "Semi-synchronous is cheaper in cloud pricing",
              "Fully synchronous blocks all writes if any replica is down, hurting availability",
              "Semi-synchronous provides stronger consistency guarantees",
            ],
            correctIndex: 2,
            explanation: "With fully synchronous replication, the leader cannot acknowledge a write until ALL followers confirm. If any follower goes down, all writes block. Semi-synchronous keeps one sync follower (for safe failover) and the rest async (for availability).",
          },
          {
            question: "What is the most dangerous failure mode in a leader-follower replication setup?",
            options: [
              "A follower falling behind by a few seconds",
              "Split-brain: two nodes both believe they are the leader and accept conflicting writes",
              "A follower running out of disk space",
              "The leader receiving too many read requests",
            ],
            correctIndex: 1,
            explanation: "Split-brain means two nodes accept writes independently, creating divergent data that is extremely difficult to reconcile. It is prevented with fencing (STONITH) and consensus protocols like Raft.",
          },
        ]}
      />

      <KeyTakeaway
        points={[
          "Replication copies data to multiple servers for fault tolerance, read scaling, and reduced latency across regions.",
          "Leader-follower is the most common pattern: one leader handles writes, followers handle reads and serve as failover targets.",
          "Synchronous replication guarantees zero data loss but adds write latency. Async is faster but risks losing recent writes.",
          "Split-brain (two leaders) is the most dangerous failure. Prevent it with fencing (STONITH) and consensus protocols like Raft.",
          "Replication lag causes stale reads -- use read-after-write routing, session pinning, or causal consistency.",
          "Most production systems use semi-synchronous: one sync follower for failover, async followers for read scaling.",
        ]}
      />
    </div>
  );
}
