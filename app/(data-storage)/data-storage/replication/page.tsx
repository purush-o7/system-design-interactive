"use client";

import { useState, useEffect, useRef } from "react";
import { TopicHero } from "@/components/topic-hero";
import { FailureScenario } from "@/components/failure-scenario";
import { WhyItBreaks } from "@/components/why-it-breaks";
import { ConceptVisualizer } from "@/components/concept-visualizer";
import { CorrectApproach } from "@/components/correct-approach";
import { KeyTakeaway } from "@/components/key-takeaway";
import { BeforeAfter } from "@/components/before-after";
import { AnimatedFlow } from "@/components/animated-flow";
import { ServerNode } from "@/components/server-node";
import { InteractiveDemo } from "@/components/interactive-demo";
import { ConversationalCallout } from "@/components/conversational-callout";
import { AhaMoment } from "@/components/aha-moment";
import { MetricCounter } from "@/components/metric-counter";
import { cn } from "@/lib/utils";

function LeaderFollowerReplication() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((s) => (s + 1) % 20), 500);
    return () => clearInterval(t);
  }, []);

  const writeArrived = tick >= 2;
  const leaderCommitted = tick >= 4;
  const streaming = tick >= 6;
  const follower1Applied = tick >= 8;
  const follower2Applied = tick >= 10;
  const follower3Applied = tick >= 13;

  return (
    <div className="space-y-4">
      {/* Write enters */}
      <div className="flex items-center gap-3 justify-center">
        <div className={cn(
          "text-[10px] font-mono px-2 py-1 rounded border transition-all",
          writeArrived ? "bg-blue-500/10 border-blue-500/30 text-blue-400" : "bg-muted/20 border-border/50 text-muted-foreground/40"
        )}>
          {writeArrived ? "INSERT INTO orders VALUES (...);" : "Waiting for write..."}
        </div>
      </div>

      {/* Leader */}
      <div className="flex flex-col items-center gap-1">
        <ServerNode
          type="database"
          label="Leader"
          sublabel={leaderCommitted ? "WAL committed" : "Reads + Writes"}
          status={leaderCommitted ? "healthy" : writeArrived ? "warning" : "healthy"}
        />
        {leaderCommitted && !streaming && (
          <span className="text-[10px] text-blue-400 font-mono animate-pulse">Writing to WAL...</span>
        )}
      </div>

      {/* Replication streams */}
      {streaming && (
        <div className="flex items-center justify-center gap-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex flex-col items-center gap-0.5">
              <div className={cn(
                "w-px h-8 transition-all",
                i === 0 && follower1Applied ? "bg-emerald-500" :
                i === 1 && follower2Applied ? "bg-emerald-500" :
                i === 2 && follower3Applied ? "bg-emerald-500" :
                "bg-blue-500/50 animate-pulse"
              )} />
              <span className="text-[8px] font-mono text-muted-foreground">
                {i === 0 ? (follower1Applied ? "applied" : "streaming") :
                 i === 1 ? (follower2Applied ? "applied" : "streaming") :
                 (follower3Applied ? "applied" : "lagging")}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Followers */}
      <div className="flex gap-3 flex-wrap justify-center">
        <ServerNode
          type="database"
          label="Follower 1"
          sublabel={follower1Applied ? "In sync" : "Reads only"}
          status={follower1Applied ? "healthy" : streaming ? "warning" : "idle"}
        />
        <ServerNode
          type="database"
          label="Follower 2"
          sublabel={follower2Applied ? "In sync" : "Reads only"}
          status={follower2Applied ? "healthy" : streaming ? "warning" : "idle"}
        />
        <ServerNode
          type="database"
          label="Follower 3"
          sublabel={follower3Applied ? "In sync (+3s lag)" : "Reads only"}
          status={follower3Applied ? "healthy" : streaming ? "warning" : "idle"}
        />
      </div>

      {/* Status line */}
      <p className="text-[10px] text-muted-foreground text-center">
        {!writeArrived ? "Waiting for a client write..." :
         !leaderCommitted ? "Leader processing write..." :
         !streaming ? "Leader committed to WAL, starting replication..." :
         !follower1Applied ? "Streaming WAL entries to followers..." :
         !follower3Applied ? "Followers applying changes at different speeds..." :
         "All followers in sync. Replication complete."}
      </p>
    </div>
  );
}

function FailoverAnimation() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((s) => (s + 1) % 30), 500);
    return () => clearInterval(t);
  }, []);

  const leaderDead = tick >= 5;
  const detectionStarted = tick >= 8;
  const electionStarted = tick >= 12;
  const newLeaderElected = tick >= 16;
  const clientsRedirected = tick >= 20;

  return (
    <div className="space-y-4">
      {/* Phase indicator */}
      <div className="flex items-center gap-1.5 justify-center flex-wrap">
        {[
          { label: "Normal", active: !leaderDead },
          { label: "Failure Detected", active: leaderDead && !electionStarted },
          { label: "Election", active: electionStarted && !newLeaderElected },
          { label: "New Leader", active: newLeaderElected && !clientsRedirected },
          { label: "Recovered", active: clientsRedirected },
        ].map((phase) => (
          <span
            key={phase.label}
            className={cn(
              "text-[9px] px-2 py-0.5 rounded-full border transition-all",
              phase.active
                ? "bg-blue-500/10 border-blue-500/30 text-blue-400 font-bold"
                : "bg-muted/20 border-border/50 text-muted-foreground/30"
            )}
          >
            {phase.label}
          </span>
        ))}
      </div>

      {/* Nodes */}
      <div className="flex items-start justify-center gap-4 flex-wrap">
        <div className="text-center space-y-1">
          <ServerNode
            type="database"
            label={leaderDead ? "Ex-Leader" : "Leader"}
            sublabel={leaderDead ? "CRASHED" : "Reads + Writes"}
            status={leaderDead ? "unhealthy" : "healthy"}
          />
          {leaderDead && (
            <div className="text-[10px] text-red-400 font-mono">
              {detectionStarted ? "Heartbeat timeout" : "No response..."}
            </div>
          )}
        </div>

        <div className="text-center space-y-1">
          <ServerNode
            type="database"
            label={newLeaderElected ? "NEW LEADER" : "Follower 1"}
            sublabel={newLeaderElected ? "Promoted!" : electionStarted ? "Candidate" : "Reads only"}
            status={newLeaderElected ? "healthy" : electionStarted ? "warning" : "idle"}
          />
          {electionStarted && !newLeaderElected && (
            <div className="text-[10px] text-orange-400 font-mono animate-pulse">
              Requesting votes...
            </div>
          )}
          {newLeaderElected && (
            <div className="text-[10px] text-emerald-400 font-mono">
              Accepting writes
            </div>
          )}
        </div>

        <div className="text-center space-y-1">
          <ServerNode
            type="database"
            label="Follower 2"
            sublabel={newLeaderElected ? "Replicating from F1" : "Reads only"}
            status={clientsRedirected ? "healthy" : "idle"}
          />
          {electionStarted && !newLeaderElected && (
            <div className="text-[10px] text-orange-400 font-mono animate-pulse">
              Voting...
            </div>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "flex-1 h-1.5 rounded-full transition-all",
              i < 5 ? "bg-emerald-500/40" :
              i < 8 ? "bg-red-500/40" :
              i < 12 ? "bg-orange-500/40" :
              i < 16 ? "bg-yellow-500/40" :
              i < 20 ? "bg-blue-500/40" :
              "bg-emerald-500/40",
              i === tick ? "ring-1 ring-white" : ""
            )}
          />
        ))}
      </div>
      <div className="flex justify-between text-[9px] text-muted-foreground font-mono">
        <span>0s</span>
        <span>~2.5s failure</span>
        <span>~6s election</span>
        <span>~10s recovered</span>
        <span>15s</span>
      </div>
    </div>
  );
}

function SplitBrainViz() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((s) => (s + 1) % 24), 500);
    return () => clearInterval(t);
  }, []);

  const partitioned = tick >= 4 && tick < 16;
  const bothWriting = partitioned && tick >= 8;
  const healed = tick >= 16;
  const conflictsShown = tick >= 20;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-6 flex-wrap">
        <div className="text-center space-y-1">
          <ServerNode
            type="database"
            label={partitioned ? "Leader A" : "Leader"}
            sublabel={bothWriting ? "user.email = alice@new.com" : "user.email = alice@old.com"}
            status={partitioned ? "warning" : "healthy"}
          />
          {bothWriting && (
            <span className="text-[10px] text-orange-400 font-mono">Accepting writes!</span>
          )}
        </div>

        <div className="text-center space-y-1">
          {partitioned ? (
            <>
              <div className="text-red-500 text-lg">&#10005;</div>
              <div className="text-[10px] text-red-400 font-mono font-bold">SPLIT BRAIN</div>
            </>
          ) : healed ? (
            <>
              <div className="text-orange-500 text-lg">&#9888;</div>
              <div className="text-[10px] text-orange-400 font-mono">CONFLICT!</div>
            </>
          ) : (
            <>
              <div className="text-emerald-500 text-lg">&#8596;</div>
              <div className="text-[10px] text-muted-foreground">replicating</div>
            </>
          )}
        </div>

        <div className="text-center space-y-1">
          <ServerNode
            type="database"
            label={partitioned ? "Leader B" : "Follower"}
            sublabel={bothWriting ? "user.email = bob@new.com" : "user.email = alice@old.com"}
            status={partitioned ? "warning" : healed && !conflictsShown ? "unhealthy" : "healthy"}
          />
          {bothWriting && (
            <span className="text-[10px] text-orange-400 font-mono">Also accepting writes!</span>
          )}
        </div>
      </div>

      {conflictsShown && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-3 space-y-1.5">
          <p className="text-xs font-semibold text-red-400">Data Conflict Detected</p>
          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
            <div className="bg-muted/30 p-2 rounded">
              Leader A: user.email = <span className="text-blue-400">alice@new.com</span>
            </div>
            <div className="bg-muted/30 p-2 rounded">
              Leader B: user.email = <span className="text-purple-400">bob@new.com</span>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground">
            Which write wins? Both are valid. This is why split-brain is dangerous &mdash; there is
            no correct answer without application-level conflict resolution.
          </p>
        </div>
      )}

      <p className="text-[10px] text-muted-foreground text-center">
        {!partitioned && !healed ? "Normal operation: one leader, writes replicated to follower." :
         partitioned && !bothWriting ? "Network partition! Follower cannot reach leader..." :
         bothWriting ? "Both nodes think they are the leader. Both accept writes. Data diverges." :
         healed && !conflictsShown ? "Partition heals. Nodes discover conflicting writes..." :
         "Split brain resolved — but data may be lost or corrupted."}
      </p>
    </div>
  );
}

function ReplicationLagMeter() {
  const [lag, setLag] = useState(0);
  useEffect(() => {
    const t = setInterval(() => {
      setLag((l) => {
        const spike = Math.random() > 0.9;
        if (spike) return Math.min(l + 200 + Math.random() * 500, 2000);
        return Math.max(0, l - 10 + Math.random() * 15);
      });
    }, 200);
    return () => clearInterval(t);
  }, []);

  const lagMs = Math.round(lag);
  const isHealthy = lagMs < 100;
  const isWarning = lagMs >= 100 && lagMs < 500;
  const isDanger = lagMs >= 500;

  const barOffsets = useRef(Array.from({ length: 40 }, () => Math.random() * 20));

  return (
    <div className="space-y-3">
      <div className="flex items-end gap-1 h-16">
        {Array.from({ length: 40 }).map((_, i) => {
          const barLag = Math.max(0, lagMs - i * 5 + barOffsets.current[i]);
          const height = Math.min(barLag / 20, 100);
          return (
            <div
              key={i}
              className={cn(
                "flex-1 rounded-t-sm transition-all duration-150",
                barLag < 100 ? "bg-emerald-500/50" :
                barLag < 500 ? "bg-orange-500/50" :
                "bg-red-500/50"
              )}
              style={{ height: `${Math.max(4, height)}%` }}
            />
          );
        })}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={cn(
            "size-2 rounded-full",
            isHealthy ? "bg-emerald-500" : isWarning ? "bg-orange-500" : "bg-red-500 animate-pulse"
          )} />
          <span className={cn(
            "text-sm font-mono font-bold",
            isHealthy ? "text-emerald-400" : isWarning ? "text-orange-400" : "text-red-400"
          )}>
            {lagMs}ms
          </span>
          <span className="text-[10px] text-muted-foreground">replication lag</span>
        </div>
        <span className={cn(
          "text-[10px] font-mono",
          isHealthy ? "text-emerald-400" : isWarning ? "text-orange-400" : "text-red-400"
        )}>
          {isHealthy ? "HEALTHY" : isWarning ? "ELEVATED" : "CRITICAL — stale reads likely"}
        </span>
      </div>
      <div className="flex gap-3 text-[9px] text-muted-foreground">
        <span className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-emerald-500" /> &lt;100ms: normal</span>
        <span className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-orange-500" /> 100-500ms: elevated</span>
        <span className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-red-500" /> &gt;500ms: critical</span>
      </div>
    </div>
  );
}

export default function ReplicationPage() {
  return (
    <div className="space-y-8">
      <TopicHero
        title="Database Replication"
        subtitle="Your database server dies at 3 AM. Do you lose everything, or does a replica seamlessly take over? Replication is the difference between a postmortem and a pager alert that resolves itself."
        difficulty="intermediate"
      />

      <FailureScenario>
        <p className="text-sm text-muted-foreground">
          Friday, 3:17 AM. Your sole database server&apos;s disk controller fails. The PostgreSQL
          instance goes down immediately. Your application starts returning 500 errors. The on-call
          engineer wakes up, assesses the situation, and discovers the worst-case scenario: the last
          backup was <strong className="text-foreground">12 hours ago</strong>. Everything since &mdash;
          orders, user registrations, payment confirmations &mdash; is gone. You have just lost half
          a day of business data because you had a single point of failure with no replication.
        </p>
      </FailureScenario>

      <WhyItBreaks>
        <p className="text-sm text-muted-foreground">
          A single database server is a <strong className="text-foreground">single point of failure</strong>.
          Hardware fails, disks corrupt, data centers lose power. Backups help with disaster recovery,
          but they are point-in-time snapshots &mdash; everything between the last backup and the
          failure is lost. This gap is called the <strong className="text-foreground">Recovery Point Objective (RPO)</strong>.
          With replication, the RPO can be reduced to zero: every write is copied to another server
          in real time.
        </p>
        <div className="grid grid-cols-3 gap-3 pt-2">
          <MetricCounter label="Without Replication RPO" value={12} unit="hrs" trend="up" />
          <MetricCounter label="Async Replication RPO" value={1} unit="sec" trend="neutral" />
          <MetricCounter label="Sync Replication RPO" value={0} unit="sec" trend="down" />
        </div>
      </WhyItBreaks>

      <ConceptVisualizer title="Leader-Follower Write Propagation">
        <p className="text-sm text-muted-foreground mb-4">
          The most common replication pattern. One server (the <strong>leader</strong>) handles all
          writes. It streams changes via the Write-Ahead Log (WAL) to <strong>followers</strong> that
          handle read queries. Watch how a single write propagates through the cluster:
        </p>
        <LeaderFollowerReplication />
        <ConversationalCallout type="tip">
          Notice that Follower 3 applies the change 3 seconds after the leader. This is
          <strong> replication lag</strong>. If a user writes data and immediately reads from
          Follower 3, they will not see their own write. This is the fundamental consistency
          challenge of asynchronous replication.
        </ConversationalCallout>
      </ConceptVisualizer>

      <ConceptVisualizer title="Live Replication Lag Monitor">
        <p className="text-sm text-muted-foreground mb-4">
          In production, replication lag is not constant. It fluctuates based on write volume,
          network conditions, and follower load. Occasional spikes are normal. Sustained high
          lag means your followers are falling behind &mdash; reads from them may return stale data.
        </p>
        <ReplicationLagMeter />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <MetricCounter label="Typical Async Lag" value={0.5} unit="ms" trend="neutral" />
          <MetricCounter label="Cross-Region Lag" value={50} unit="ms" trend="neutral" />
          <MetricCounter label="Under Heavy Write" value={200} unit="ms" trend="up" />
          <MetricCounter label="Sync Replication" value={0} unit="ms" trend="down" />
        </div>
      </ConceptVisualizer>

      <ConversationalCallout type="warning">
        <strong>Sync vs Async: The Consistency-Performance Trade-off.</strong> Synchronous
        replication guarantees zero data loss (RPO=0) but adds write latency &mdash; the leader
        waits for the follower to confirm before acknowledging. A same-region sync write adds
        ~1-5ms. Cross-region sync replication can add 50-150ms. Asynchronous replication is
        faster but risks losing recent writes if the leader fails before they are replicated.
        Most production systems use <strong>semi-synchronous</strong>: one follower is synchronous
        (guaranteed up-to-date for failover), the rest are asynchronous (for read scaling).
      </ConversationalCallout>

      <ConceptVisualizer title="Failover: When the Leader Dies">
        <p className="text-sm text-muted-foreground mb-4">
          When the leader crashes, the system must detect the failure, elect a new leader from
          the followers, and redirect all writes to the new leader. This process takes seconds,
          not minutes &mdash; but those seconds matter. Watch the sequence:
        </p>
        <FailoverAnimation />
        <AhaMoment
          question="How does the system pick which follower becomes the new leader?"
          answer={
            <p>
              This is called <strong>leader election</strong>. Common approaches: (1) The follower
              with the most up-to-date data is automatically promoted (PostgreSQL with Patroni).
              (2) A consensus algorithm like Raft or Paxos where replicas vote (CockroachDB, etcd).
              (3) An external service like ZooKeeper monitors health and designates the new leader.
              The key requirement is that <em>exactly one</em> node becomes leader &mdash; otherwise
              you get split-brain.
            </p>
          }
        />
      </ConceptVisualizer>

      <ConceptVisualizer title="Split-Brain: The Replication Nightmare">
        <p className="text-sm text-muted-foreground mb-4">
          Split-brain occurs when a network partition causes two nodes to both believe they are
          the leader. Both accept writes independently, and data diverges. When the partition
          heals, the system discovers conflicting writes that cannot be automatically reconciled.
          This is the most dangerous failure mode in replicated systems.
        </p>
        <SplitBrainViz />
        <ConversationalCallout type="warning">
          <strong>Preventing split-brain:</strong> The industry standard is <strong>STONITH</strong> (Shoot
          The Other Node In The Head) &mdash; when a new leader is elected, the old leader is
          forcibly powered off or fenced from I/O. This sounds brutal, but it is safer than
          allowing two leaders to accept writes. PostgreSQL clusters using Patroni detect and
          resolve split-brain within 30 seconds to 2 minutes.
        </ConversationalCallout>
      </ConceptVisualizer>

      <ConceptVisualizer title="Leader-Leader (Multi-Master) Replication">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Both servers accept writes and replicate to each other. This enables write availability in
            multiple regions but introduces <strong className="text-foreground">write conflicts</strong>.
            If two users update the same row on different leaders simultaneously, you need a conflict
            resolution strategy (last-write-wins, merge, or manual resolution).
          </p>
          <div className="flex items-center justify-center gap-8 flex-wrap">
            <div className="text-center space-y-2">
              <ServerNode type="database" label="Leader US" sublabel="Reads + Writes" status="healthy" />
              <p className="text-xs text-muted-foreground">US-East, ~5ms local</p>
            </div>
            <div className="text-center space-y-1">
              <div className="text-xs text-muted-foreground">bidirectional</div>
              <div className="text-lg">&#8596;</div>
              <div className="text-xs text-muted-foreground">~80ms cross-region</div>
            </div>
            <div className="text-center space-y-2">
              <ServerNode type="database" label="Leader EU" sublabel="Reads + Writes" status="healthy" />
              <p className="text-xs text-muted-foreground">EU-West, ~5ms local</p>
            </div>
          </div>
        </div>
      </ConceptVisualizer>

      <BeforeAfter
        before={{
          title: "No Replication",
          content: (
            <div className="space-y-2 text-sm text-muted-foreground">
              <ul className="space-y-1 text-xs">
                <li>Single point of failure &mdash; hardware failure = total downtime</li>
                <li>RPO: hours (depends on backup frequency)</li>
                <li>RTO: 30min-2hrs (restore from backup, replay WAL)</li>
                <li>All reads hit one server &mdash; no read scaling</li>
                <li>Maintenance requires planned downtime windows</li>
              </ul>
            </div>
          ),
        }}
        after={{
          title: "With Replication",
          content: (
            <div className="space-y-2 text-sm text-muted-foreground">
              <ul className="space-y-1 text-xs">
                <li>Automatic failover &mdash; follower promotes in 5-30 seconds</li>
                <li>RPO: 0 (synchronous) or sub-second (async)</li>
                <li>RTO: seconds (automatic failover, no restore needed)</li>
                <li>Read queries distributed across N replicas</li>
                <li>Rolling maintenance with zero downtime</li>
              </ul>
            </div>
          ),
        }}
      />

      <CorrectApproach title="Replication Strategies Compared">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 pr-4 font-semibold">Strategy</th>
                <th className="text-left py-2 pr-4 font-semibold">Data Loss Risk</th>
                <th className="text-left py-2 pr-4 font-semibold">Write Latency</th>
                <th className="text-left py-2 font-semibold">Use Case</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b border-muted">
                <td className="py-2 pr-4 font-medium text-foreground">Synchronous</td>
                <td className="py-2 pr-4 text-green-500">None (RPO=0)</td>
                <td className="py-2 pr-4 text-red-500">High (+1-5ms same-region, +50-150ms cross-region)</td>
                <td className="py-2">Financial data, compliance, regulatory</td>
              </tr>
              <tr className="border-b border-muted">
                <td className="py-2 pr-4 font-medium text-foreground">Asynchronous</td>
                <td className="py-2 pr-4 text-yellow-500">Sub-second (last few writes)</td>
                <td className="py-2 pr-4 text-green-500">Minimal (&lt;1ms added)</td>
                <td className="py-2">Most web applications, content platforms</td>
              </tr>
              <tr className="border-b border-muted">
                <td className="py-2 pr-4 font-medium text-foreground">Semi-synchronous</td>
                <td className="py-2 pr-4 text-green-500">None (1 replica guaranteed)</td>
                <td className="py-2 pr-4 text-yellow-500">Moderate (+1-5ms)</td>
                <td className="py-2">Best balance for production (MySQL, PostgreSQL)</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-medium text-foreground">Leader-Leader</td>
                <td className="py-2 pr-4 text-yellow-500">Conflict risk (data divergence)</td>
                <td className="py-2 pr-4 text-green-500">Low (local writes ~5ms)</td>
                <td className="py-2">Multi-region write availability</td>
              </tr>
            </tbody>
          </table>
        </div>
      </CorrectApproach>

      <InteractiveDemo title="Read-Your-Own-Writes Problem">
        {({ isPlaying, tick }) => {
          const phases = [
            { action: "User updates profile name", route: "Write to Leader", result: "name = 'Alice Smith'" },
            { action: "User refreshes page", route: "Read from Follower", result: "name = 'Alice Jones' (STALE!)" },
            { action: "User confused, refreshes again", route: "Read from Follower (caught up)", result: "name = 'Alice Smith'" },
          ];
          const active = isPlaying ? Math.min(tick % 5, phases.length - 1) : -1;

          return (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                A common problem with leader-follower replication: a user writes data to the leader,
                then immediately reads from a follower that has not yet received the update. They
                see stale data &mdash; their own write appears to have been lost.
              </p>
              <div className="space-y-2">
                {phases.map((p, i) => (
                  <div
                    key={p.action}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg border transition-all",
                      i === active
                        ? i === 1
                          ? "bg-red-500/8 border-red-500/20"
                          : "bg-emerald-500/8 border-emerald-500/20"
                        : "bg-muted/10 border-border/30"
                    )}
                  >
                    <span className="text-[10px] font-mono w-6 text-muted-foreground/50">{i + 1}</span>
                    <div className="flex-1">
                      <span className="text-xs font-medium">{p.action}</span>
                      <span className="text-[10px] text-muted-foreground ml-2">→ {p.route}</span>
                    </div>
                    <span className={cn(
                      "text-[10px] font-mono",
                      i === active ? (i === 1 ? "text-red-400" : "text-emerald-400") : "text-muted-foreground/30"
                    )}>
                      {p.result}
                    </span>
                  </div>
                ))}
              </div>
              <ConversationalCallout type="tip">
                <strong>Solutions:</strong> (1) Read-after-write consistency: route the user&apos;s
                reads to the leader for data they recently modified. (2) Session-based routing: pin
                a user&apos;s session to a specific replica. (3) Causal consistency: track write
                timestamps and only serve reads from replicas that have caught up.
              </ConversationalCallout>
            </div>
          );
        }}
      </InteractiveDemo>

      <AhaMoment
        question="Why not just make everything synchronous and avoid all these problems?"
        answer={
          <p>
            Because synchronous replication creates a <strong>chain of availability</strong>. If any
            synchronous replica is down, the leader cannot commit writes &mdash; the whole system
            blocks. With three synchronous replicas, your write availability is the <em>product</em> of
            three uptime percentages: 99.9% &times; 99.9% &times; 99.9% = 99.7%. Cross-region
            synchronous replication adds 50-150ms to every write. For a system doing 10,000 writes
            per second, that latency is devastating. The trade-off is always: how much data loss can
            you tolerate vs. how much latency and availability risk can you accept?
          </p>
        }
      />

      <KeyTakeaway
        points={[
          "Replication copies data to multiple servers for fault tolerance, read scaling, and reduced latency across regions.",
          "Leader-follower is the most common pattern: one leader handles writes, followers handle reads and serve as failover targets.",
          "Synchronous replication guarantees zero data loss (RPO=0) but adds 1-5ms same-region or 50-150ms cross-region write latency.",
          "Asynchronous replication is faster but risks losing sub-second of recent writes on leader failure.",
          "Split-brain (two leaders) is the most dangerous replication failure. Prevent it with fencing (STONITH) and consensus protocols.",
          "Replication lag causes stale reads — handle it with read-your-own-writes patterns, session-aware routing, or causal consistency.",
          "Most production systems use semi-synchronous: one synchronous follower for failover safety, async followers for read scaling.",
        ]}
      />
    </div>
  );
}
