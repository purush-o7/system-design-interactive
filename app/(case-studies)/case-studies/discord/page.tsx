"use client";

import { useState, useEffect, useCallback } from "react";
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
import { MarkerType } from "@xyflow/react";
import {
  MessageSquare,
  Users,
  Zap,
  Radio,
  Activity,
  Heart,
  Database,
  Wifi,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  1. WebSocket Gateway Architecture FlowDiagram                      */
/* ------------------------------------------------------------------ */

const gatewayNodes: FlowNode[] = [
  {
    id: "user-a",
    type: "clientNode",
    position: { x: 20, y: 60 },
    data: { label: "User A", sublabel: "WebSocket client", status: "healthy" },
  },
  {
    id: "user-b",
    type: "clientNode",
    position: { x: 20, y: 160 },
    data: { label: "User B", sublabel: "WebSocket client", status: "healthy" },
  },
  {
    id: "user-c",
    type: "clientNode",
    position: { x: 20, y: 260 },
    data: { label: "User C", sublabel: "WebSocket client", status: "idle" },
  },
  {
    id: "gateway",
    type: "gatewayNode",
    position: { x: 240, y: 140 },
    data: {
      label: "Gateway Cluster",
      sublabel: "Elixir / Phoenix",
      metrics: [{ label: "Connections", value: "5M+" }, { label: "Nodes", value: "~100" }],
    },
  },
  {
    id: "msg-service",
    type: "serverNode",
    position: { x: 460, y: 80 },
    data: {
      label: "Message Service",
      sublabel: "Fanout + routing",
      status: "healthy",
      metrics: [{ label: "Events/s", value: "~40M" }],
    },
  },
  {
    id: "presence",
    type: "serverNode",
    position: { x: 460, y: 220 },
    data: {
      label: "Presence Service",
      sublabel: "Heartbeat tracking",
      metrics: [{ label: "Users online", value: "~8M" }],
    },
  },
  {
    id: "cassandra",
    type: "databaseNode",
    position: { x: 680, y: 80 },
    data: {
      label: "ScyllaDB",
      sublabel: "Migrated from Cassandra",
      metrics: [{ label: "p99 lat", value: "< 15ms" }],
    },
  },
  {
    id: "redis",
    type: "cacheNode",
    position: { x: 680, y: 220 },
    data: {
      label: "Redis Cluster",
      sublabel: "Presence state cache",
      metrics: [{ label: "TTL", value: "30s" }],
    },
  },
];

const gatewayEdges: FlowEdge[] = [
  {
    id: "ua-gw",
    source: "user-a",
    target: "gateway",
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed },
    label: "WS",
  },
  {
    id: "ub-gw",
    source: "user-b",
    target: "gateway",
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: "uc-gw",
    source: "user-c",
    target: "gateway",
    animated: false,
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { opacity: 0.4 },
  },
  {
    id: "gw-msg",
    source: "gateway",
    target: "msg-service",
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed },
    label: "dispatch",
  },
  {
    id: "gw-pre",
    source: "gateway",
    target: "presence",
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed },
    label: "heartbeat",
  },
  {
    id: "msg-cass",
    source: "msg-service",
    target: "cassandra",
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed },
    label: "persist",
  },
  {
    id: "pre-redis",
    source: "presence",
    target: "redis",
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed },
    label: "cache",
  },
];

/* ------------------------------------------------------------------ */
/*  2. Message Fanout Playground                                        */
/* ------------------------------------------------------------------ */

const TOTAL_USERS = 48;
const ONLINE_USERS = 32;

type FanoutUser = {
  id: number;
  online: boolean;
  received: boolean;
  angle: number;
};

function buildUsers(): FanoutUser[] {
  return Array.from({ length: TOTAL_USERS }, (_, i) => ({
    id: i,
    online: i < ONLINE_USERS,
    received: false,
    angle: (i / TOTAL_USERS) * 2 * Math.PI,
  }));
}

function FanoutCanvas({ tick, isPlaying }: { tick: number; isPlaying: boolean }) {
  const [users, setUsers] = useState<FanoutUser[]>(buildUsers);
  const [wave, setWave] = useState(0);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (tick === 0) {
      setUsers(buildUsers());
      setWave(0);
      setSent(false);
    }
  }, [tick]);

  useEffect(() => {
    if (!isPlaying && tick === 0) return;
    if (tick > 0) {
      setSent(true);
      const progress = Math.min(tick / 6, 1);
      setWave(progress);
      setUsers((prev) =>
        prev.map((u) => ({
          ...u,
          received: u.online && Math.random() < progress * 1.4,
        }))
      );
    }
  }, [tick, isPlaying]);

  const cx = 160;
  const cy = 160;
  const r = 120;

  const receivedCount = users.filter((u) => u.online && u.received).length;

  return (
    <div className="flex flex-col items-center gap-4 p-4 h-full">
      <div className="relative w-[320px] h-[320px]">
        <svg width="320" height="320" className="absolute inset-0">
          {/* Ripple wave */}
          {sent && (
            <>
              <circle
                cx={cx}
                cy={cy}
                r={wave * r}
                fill="none"
                stroke="rgb(139,92,246)"
                strokeWidth="1.5"
                opacity={1 - wave * 0.8}
              />
              <circle
                cx={cx}
                cy={cy}
                r={wave * r * 0.6}
                fill="none"
                stroke="rgb(139,92,246)"
                strokeWidth="1"
                opacity={(1 - wave) * 0.5}
              />
            </>
          )}
          {/* Lines from center to received users */}
          {users.map((u) => {
            if (!u.received) return null;
            const ux = cx + Math.cos(u.angle) * r;
            const uy = cy + Math.sin(u.angle) * r;
            return (
              <line
                key={u.id}
                x1={cx}
                y1={cy}
                x2={ux}
                y2={uy}
                stroke="rgb(52,211,153)"
                strokeWidth="0.8"
                opacity="0.4"
              />
            );
          })}
        </svg>

        {/* Center server node */}
        <div
          className="absolute flex items-center justify-center rounded-full border-2 text-[10px] font-bold text-violet-300 bg-violet-900/60 border-violet-500"
          style={{
            width: 52,
            height: 52,
            left: cx - 26,
            top: cy - 26,
            boxShadow: sent ? "0 0 18px 4px rgba(139,92,246,0.5)" : "none",
            transition: "box-shadow 0.3s",
          }}
        >
          GW
        </div>

        {/* User dots */}
        {users.map((u) => {
          const ux = cx + Math.cos(u.angle) * r;
          const uy = cy + Math.sin(u.angle) * r;
          const color = !u.online
            ? "bg-zinc-700 border-zinc-600"
            : u.received
            ? "bg-emerald-500 border-emerald-400 scale-125"
            : "bg-blue-800 border-blue-600";
          return (
            <div
              key={u.id}
              className={`absolute rounded-full border transition-all duration-300 ${color}`}
              style={{
                width: 10,
                height: 10,
                left: ux - 5,
                top: uy - 5,
              }}
            />
          );
        })}
      </div>

      {/* Stats bar */}
      <div className="flex gap-6 text-xs text-muted-foreground">
        <span>
          <span className="text-blue-400 font-semibold">{TOTAL_USERS}</span> members
        </span>
        <span>
          <span className="text-emerald-400 font-semibold">{ONLINE_USERS}</span> online
        </span>
        <span>
          <span className="text-violet-400 font-semibold">{receivedCount}</span> delivered
        </span>
      </div>
    </div>
  );
}

function MessageFanoutPlayground() {
  const sim = useSimulation({ intervalMs: 700, maxSteps: 8 });

  return (
    <Playground
      title="Message Fanout — press Play to send a message"
      simulation={sim}
      canvasHeight="min-h-[400px]"
      canvas={<FanoutCanvas tick={sim.tick} isPlaying={sim.isPlaying} />}
      explanation={
        <div className="space-y-3">
          <p className="font-medium text-foreground text-xs">How Discord fans out messages</p>
          <p>
            When you send a message, the Gateway dispatches it to every <strong>online member</strong> of
            that channel — skipping offline users entirely.
          </p>
          <p>
            For a 1,000-member server with 32% online that&apos;s ~320 WebSocket pushes fired in
            milliseconds.
          </p>
          <p>
            <strong>Green dots</strong> = message delivered.{" "}
            <strong>Blue dots</strong> = online, not yet delivered.{" "}
            <strong>Gray dots</strong> = offline (skipped).
          </p>
          <p className="text-amber-400/80 text-xs">
            At Discord scale (500M+ users, millions of large servers) this fanout becomes the #1
            scaling challenge.
          </p>
        </div>
      }
    />
  );
}

/* ------------------------------------------------------------------ */
/*  3. Cassandra → ScyllaDB Migration LiveChart                        */
/* ------------------------------------------------------------------ */

const migrationData = [
  { month: "Jan", cassandra: 48, scylla: 48 },
  { month: "Feb", cassandra: 52, scylla: 46 },
  { month: "Mar", cassandra: 61, scylla: 18 },
  { month: "Apr", cassandra: 58, scylla: 14 },
  { month: "May", cassandra: 65, scylla: 12 },
  { month: "Jun", cassandra: 70, scylla: 11 },
];

const gcPauseData = [
  { db: "Cassandra (JVM)", p99: 125, p50: 34 },
  { db: "ScyllaDB (C++)", p99: 12, p50: 3 },
];

/* ------------------------------------------------------------------ */
/*  4. Presence Simulation                                              */
/* ------------------------------------------------------------------ */

function buildPresenceData(tick: number) {
  const base = 7_800_000;
  const points = [];
  for (let i = 0; i <= Math.min(tick, 20); i++) {
    const noise = Math.sin(i * 0.8) * 120_000 + Math.cos(i * 1.3) * 80_000;
    const heartbeatDrop = i % 5 === 4 ? -300_000 : 0;
    points.push({
      t: `T+${i * 30}s`,
      online: Math.max(0, Math.round(base + noise + heartbeatDrop)),
      heartbeats: Math.round((base + noise) / 30) * (i % 5 === 4 ? 0.15 : 1),
    });
  }
  return points;
}

function PresenceSimulation() {
  const sim = useSimulation({ intervalMs: 600, maxSteps: 20 });
  const data = buildPresenceData(sim.tick);

  return (
    <Playground
      title="Presence System — millions of heartbeats tracked in real-time"
      simulation={sim}
      canvasHeight="min-h-[300px]"
      canvas={
        <div className="p-4 space-y-4 h-full">
          <div className="flex gap-4 flex-wrap">
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-4 py-2 text-center">
              <div className="text-xl font-bold text-emerald-400">
                {data.length > 0
                  ? (data[data.length - 1].online / 1_000_000).toFixed(2) + "M"
                  : "—"}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">Users online</div>
            </div>
            <div className="rounded-lg border border-violet-500/20 bg-violet-500/5 px-4 py-2 text-center">
              <div className="text-xl font-bold text-violet-400">
                {data.length > 0
                  ? Math.round(data[data.length - 1].heartbeats / 1000) + "K/s"
                  : "—"}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">Heartbeats/sec</div>
            </div>
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-2 text-center">
              <div className="text-xl font-bold text-amber-400">30s</div>
              <div className="text-xs text-muted-foreground mt-0.5">Heartbeat TTL</div>
            </div>
          </div>
          <LiveChart
            type="area"
            data={data}
            dataKeys={{ x: "t", y: "online", label: "Online users" }}
            height={180}
            unit=""
            referenceLines={[{ y: 8_000_000, label: "Peak", color: "#f59e0b" }]}
          />
        </div>
      }
      explanation={
        <div className="space-y-3">
          <p className="font-medium text-foreground text-xs">The Presence problem</p>
          <p>
            Every online client sends a <strong>heartbeat every 30 seconds</strong>. If Discord
            misses a heartbeat it marks you offline.
          </p>
          <p>
            At 8M concurrent users that&apos;s <strong>~267,000 heartbeat writes/second</strong>.
            Each must be stored and expire on schedule.
          </p>
          <p>
            Discord uses a <strong>fanout-on-read</strong> model: presence is lazily loaded when you
            open a channel, not pushed to every watcher.
          </p>
          <p className="text-amber-400/80 text-xs">
            The dip every 5th interval simulates a gateway node restart — clients reconnect and
            presence momentarily drops.
          </p>
        </div>
      }
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */

export default function DiscordCaseStudyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-12">
      <TopicHero
        title="Discord"
        subtitle="How a gaming chat app scaled to 500M users — real-time messaging at internet scale"
        difficulty="advanced"
        estimatedMinutes={12}
      />

      {/* ---- Overview ---- */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">The Scale Problem</h2>
        <p className="text-muted-foreground leading-relaxed">
          Discord is not a social network that loads a feed. It is a real-time communication
          platform where millions of people expect sub-100ms message delivery, accurate online
          indicators, and zero dropped events — all simultaneously, all the time.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Registered users", value: "500M+" },
            { label: "Concurrent sessions", value: "~8M" },
            { label: "Messages/day", value: "4B+" },
            { label: "Servers (guilds)", value: "19M+" },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="rounded-xl border border-border/60 bg-muted/10 p-4 text-center"
            >
              <div className="text-2xl font-bold text-violet-400">{value}</div>
              <div className="text-xs text-muted-foreground mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ---- Gateway Architecture ---- */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">WebSocket Gateway Architecture</h2>
        <p className="text-muted-foreground leading-relaxed">
          Unlike HTTP, Discord clients hold a <strong>persistent WebSocket connection</strong> to a
          Gateway node. The Gateway is written in <strong>Elixir / Phoenix</strong>, chosen because
          the BEAM VM handles millions of lightweight processes with near-zero per-process overhead
          — perfect for millions of concurrent long-lived connections.
        </p>

        <div className="rounded-xl border border-border/40 overflow-hidden">
          <FlowDiagram nodes={gatewayNodes} edges={gatewayEdges} minHeight={360} allowDrag={false} />
        </div>

        <ConversationalCallout type="tip">
          Elixir&apos;s actor model maps perfectly to WebSocket connections — each connection is a
          lightweight process with its own mailbox. A single physical Gateway server can hold tens
          of thousands of connections, each isolated so one crash cannot cascade.
        </ConversationalCallout>
      </section>

      {/* ---- Message Fanout ---- */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Message Fanout at Scale</h2>
        <p className="text-muted-foreground leading-relaxed">
          When you send a message to a Discord server, it must be delivered to every{" "}
          <strong>online member watching that channel</strong>. This &quot;fanout&quot; is trivial
          for small servers but becomes the dominant engineering challenge at scale.
        </p>

        <MessageFanoutPlayground />

        <AhaMoment
          question="Why can large Discord servers feel slower than small ones?"
          answer={
            <p>
              A server with 500,000 members might have 50,000 people online in a popular channel. A
              single message triggers 50,000 WebSocket writes. Discord solves this with{" "}
              <strong>read-receipts optimisation</strong>, lazy presence, and{" "}
              <strong>limiting real-time fanout to &lt;= 75,000 members</strong> per channel — above
              that threshold, the channel switches to a pull-based (pagination) model.
            </p>
          }
        />
      </section>

      {/* ---- Cassandra → ScyllaDB ---- */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">The Great Database Migration</h2>
        <p className="text-muted-foreground leading-relaxed">
          Discord originally used <strong>Apache Cassandra</strong> for message storage — a
          wide-column store that scales writes horizontally. But as Discord grew to billions of
          messages, Cassandra&apos;s JVM-based garbage collector introduced unpredictable latency
          spikes. The solution: migrate to <strong>ScyllaDB</strong>, a C++ reimplementation of
          Cassandra with no GC pauses.
        </p>

        <BeforeAfter
          before={{
            title: "Apache Cassandra",
            content: "JVM-based, mature ecosystem, but GC pauses caused p99 latencies to spike to 125ms+ during compaction. Required 177 nodes to handle Discord's write volume.",
          }}
          after={{
            title: "ScyllaDB",
            content: "C++ implementation, same CQL interface (zero query rewrites), no GC pauses. Reduced node count from 177 to 72 while improving p99 latency by 10x.",
          }}
        />

        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            p99 read latency over time (lower is better)
          </p>
          <LiveChart
            type="latency"
            data={migrationData}
            dataKeys={{
              x: "month",
              y: ["cassandra", "scylla"],
              label: ["Cassandra (ms)", "ScyllaDB (ms)"],
            }}
            height={220}
            unit="ms"
            referenceLines={[
              { y: 15, label: "ScyllaDB target", color: "#10b981" },
              { y: 60, label: "SLO limit", color: "#ef4444" },
            ]}
          />
          <p className="text-xs text-muted-foreground">
            Migration began in Feb. By March ScyllaDB p99 dropped below 20ms while Cassandra p99
            continued to climb under the same load.
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            GC pause impact on p99 vs p50 latency
          </p>
          <LiveChart
            type="bar"
            data={gcPauseData}
            dataKeys={{
              x: "db",
              y: ["p99", "p50"],
              label: ["p99 latency (ms)", "p50 latency (ms)"],
            }}
            height={200}
            unit="ms"
          />
          <p className="text-xs text-muted-foreground">
            The GC pause problem is visible in the enormous gap between p50 and p99 for Cassandra.
            ScyllaDB&apos;s C++ runtime eliminates this entirely.
          </p>
        </div>

        <ConversationalCallout type="warning">
          ScyllaDB uses the same Cassandra Query Language (CQL) so Discord&apos;s application code
          needed zero changes. The migration was purely an infrastructure swap — but still required
          months of careful data migration and dual-write validation.
        </ConversationalCallout>
      </section>

      {/* ---- Presence System ---- */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Presence System — Tracking 8M Heartbeats</h2>
        <p className="text-muted-foreground leading-relaxed">
          The green dot next to your friend&apos;s name sounds simple. It is not. Discord must track
          whether millions of users are online, idle, do-not-disturb, or offline — updated in near
          real-time. The system relies on a <strong>heartbeat protocol</strong> where each client
          pings the Gateway every 30 seconds.
        </p>

        <PresenceSimulation />

        <AhaMoment
          question="What happens if the heartbeat system falls behind?"
          answer={
            <p>
              If the presence write pipeline backs up, users appear offline even though
              they&apos;re connected. Discord solved this by making presence{" "}
              <strong>eventually consistent by design</strong> — a slight lag in the online indicator
              is acceptable. But message delivery remains strongly ordered per-channel via
              Cassandra&apos;s partition keys.
            </p>
          }
        />

        <ConversationalCallout type="question">
          Why not just use Redis for all presence state? Redis is fast but single-threaded and not
          easily partitioned across datacenters. Discord uses Redis as a{" "}
          <strong>local cache layer</strong> in front of Cassandra, not as the source of truth.
        </ConversationalCallout>
      </section>

      {/* ---- Read / Write Architecture ---- */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Message Storage Design</h2>
        <p className="text-muted-foreground leading-relaxed">
          Discord stores messages with a carefully chosen partition key:{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-[12px] font-mono">
            (channel_id, bucket)
          </code>{" "}
          where the bucket is a time window (roughly 10 days). This keeps each partition small
          enough for efficient reads while grouping messages that are almost always read together.
        </p>

        <div className="rounded-xl border border-border/50 bg-muted/5 overflow-hidden">
          <div className="border-b border-border/40 bg-muted/10 px-4 py-2">
            <span className="text-xs font-mono text-muted-foreground">
              ScyllaDB schema (simplified)
            </span>
          </div>
          <pre className="p-4 text-[12px] font-mono text-emerald-300/80 overflow-x-auto whitespace-pre-wrap">
{`CREATE TABLE messages (
  channel_id   bigint,
  bucket       int,          -- time bucket (~10 days)
  message_id   bigint,       -- snowflake: encodes timestamp
  author_id    bigint,
  content      text,
  PRIMARY KEY ((channel_id, bucket), message_id)
) WITH CLUSTERING ORDER BY (message_id DESC);`}
          </pre>
        </div>

        <ConversationalCallout type="tip">
          Discord message IDs are <strong>Snowflake IDs</strong> — 64-bit integers that encode a
          timestamp in the high bits. This means messages are naturally sorted by time without a
          separate timestamp column, and range queries like &quot;get messages before X&quot; map
          directly to Cassandra/ScyllaDB range scans.
        </ConversationalCallout>
      </section>

      {/* ---- Lessons ---- */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Lessons for System Design Interviews</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            {
              icon: <Wifi className="size-4 text-blue-400" />,
              title: "WebSocket for real-time",
              body: "Long-polling or SSE can not match the bi-directional, low-latency guarantees of WebSocket for chat. Design for persistent connections from the start.",
            },
            {
              icon: <Zap className="size-4 text-amber-400" />,
              title: "Language for I/O concurrency",
              body: "Elixir/BEAM handles millions of concurrent processes cheaply. For connection-heavy workloads, runtime choice matters as much as architecture.",
            },
            {
              icon: <Database className="size-4 text-emerald-400" />,
              title: "Partition key design is everything",
              body: "In Cassandra/ScyllaDB, a bad partition key (like bare channel_id) leads to unbounded partitions. Time-bucketing keeps partitions small and predictable.",
            },
            {
              icon: <Activity className="size-4 text-violet-400" />,
              title: "Fanout limits are real",
              body: "At massive scale you must cap real-time fanout. Above Discord's threshold the system shifts to pull-based pagination — a hybrid model most designs ignore.",
            },
            {
              icon: <Heart className="size-4 text-pink-400" />,
              title: "Eventual consistency for presence",
              body: "Users tolerate a 1-2 second lag in online status. Designing presence as eventually consistent allows the system to shed load during spikes.",
            },
            {
              icon: <Radio className="size-4 text-cyan-400" />,
              title: "Same API, better runtime",
              body: "ScyllaDB's CQL-compatible API enabled a zero-code-change migration. When evaluating alternatives, API compatibility dramatically reduces migration risk.",
            },
          ].map(({ icon, title, body }) => (
            <div
              key={title}
              className="flex gap-3 rounded-xl border border-border/50 bg-muted/5 p-4"
            >
              <div className="mt-0.5 shrink-0">{icon}</div>
              <div>
                <p className="text-sm font-semibold mb-1">{title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---- Key Takeaways ---- */}
      <KeyTakeaway
        points={[
          "Discord uses persistent WebSocket connections via Elixir/Phoenix Gateways — the BEAM VM's actor model makes millions of concurrent connections manageable.",
          "Message fanout is bounded: real-time push only fires for online members. Above ~75,000 members Discord switches to pull-based pagination to protect the fanout pipeline.",
          "Migrating from Cassandra to ScyllaDB (same CQL API, C++ runtime) reduced node count from 177 to 72 and cut p99 latency by 10x — all with zero application code changes.",
          "Presence is eventually consistent by design. Each client heartbeats every 30 seconds; missing one heartbeat marks the user offline. At 8M concurrent users that's ~267,000 writes/second.",
          "Snowflake IDs encode timestamps in the high bits, enabling natural time-ordering and efficient range scans in ScyllaDB without a separate timestamp index.",
          "Partition key design in wide-column stores is non-negotiable: Discord uses (channel_id, time_bucket) to keep partitions bounded and avoid hot spots.",
        ]}
      />
    </div>
  );
}
