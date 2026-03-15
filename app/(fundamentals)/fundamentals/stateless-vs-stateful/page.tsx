"use client";

import { useMemo } from "react";
import { TopicHero } from "@/components/topic-hero";
import { KeyTakeaway } from "@/components/key-takeaway";
import { AhaMoment } from "@/components/aha-moment";
import { ConversationalCallout } from "@/components/conversational-callout";
import { BeforeAfter } from "@/components/before-after";
import { FlowDiagram } from "@/components/flow-diagram";
import type { FlowNode, FlowEdge } from "@/components/flow-diagram";
import { LiveChart } from "@/components/live-chart";
import { Playground } from "@/components/playground";
import { useSimulation } from "@/hooks/use-simulation";
import { MarkerType } from "@xyflow/react";
import { WhyCare } from "@/components/why-care";
import { GlossaryTerm } from "@/components/glossary-term";
import { TopicQuiz } from "@/components/topic-quiz";
import type { QuizQuestion } from "@/components/topic-quiz";

// ─── Stateful Architecture Diagram ───────────────────────────────────────────

function StatefulDiagram({ crashedServer }: { crashedServer: boolean }) {
  const nodes: FlowNode[] = useMemo(
    () => [
      {
        id: "client",
        type: "clientNode",
        position: { x: 160, y: 20 },
        data: { label: "Browser", sublabel: "user_42", status: "healthy" },
      },
      {
        id: "lb",
        type: "loadBalancerNode",
        position: { x: 130, y: 120 },
        data: {
          label: "Load Balancer",
          sublabel: "round-robin",
          status: "healthy",
        },
      },
      {
        id: "serverA",
        type: "serverNode",
        position: { x: 20, y: 240 },
        data: {
          label: "Server A",
          sublabel: crashedServer ? "CRASHED" : "session: user_42",
          status: crashedServer ? "unhealthy" : "healthy",
          metrics: crashedServer ? [] : [{ label: "sessions", value: "42" }],
        },
      },
      {
        id: "serverB",
        type: "serverNode",
        position: { x: 240, y: 240 },
        data: {
          label: "Server B",
          sublabel: "no session!",
          status: "warning",
          metrics: [{ label: "sessions", value: "0" }],
        },
      },
    ],
    [crashedServer]
  );

  const edges: FlowEdge[] = useMemo(
    () => [
      {
        id: "c-lb",
        source: "client",
        target: "lb",
        animated: true,
        markerEnd: { type: MarkerType.ArrowClosed },
      },
      {
        id: "lb-a",
        source: "lb",
        target: "serverA",
        animated: !crashedServer,
        style: { stroke: crashedServer ? "#ef4444" : undefined, strokeDasharray: crashedServer ? "6 3" : undefined },
        markerEnd: { type: MarkerType.ArrowClosed },
      },
      {
        id: "lb-b",
        source: "lb",
        target: "serverB",
        animated: true,
        markerEnd: { type: MarkerType.ArrowClosed },
      },
    ],
    [crashedServer]
  );

  return <FlowDiagram nodes={nodes} edges={edges} minHeight={340} allowDrag={false} />;
}

// ─── Stateless Architecture Diagram ──────────────────────────────────────────

function StatelessDiagram({ crashedServer }: { crashedServer: boolean }) {
  const nodes: FlowNode[] = useMemo(
    () => [
      {
        id: "client",
        type: "clientNode",
        position: { x: 155, y: 10 },
        data: { label: "Browser", sublabel: "user_42", status: "healthy" },
      },
      {
        id: "lb",
        type: "loadBalancerNode",
        position: { x: 125, y: 100 },
        data: {
          label: "Load Balancer",
          sublabel: "any server",
          status: "healthy",
        },
      },
      {
        id: "serverA",
        type: "serverNode",
        position: { x: 10, y: 210 },
        data: {
          label: "Server A",
          sublabel: crashedServer ? "CRASHED" : "stateless",
          status: crashedServer ? "unhealthy" : "healthy",
        },
      },
      {
        id: "serverB",
        type: "serverNode",
        position: { x: 240, y: 210 },
        data: {
          label: "Server B",
          sublabel: "stateless",
          status: "healthy",
        },
      },
      {
        id: "redis",
        type: "cacheNode",
        position: { x: 125, y: 320 },
        data: {
          label: "Redis",
          sublabel: "session: user_42",
          status: "healthy",
          metrics: [{ label: "sessions", value: "42" }],
        },
      },
    ],
    [crashedServer]
  );

  const edges: FlowEdge[] = useMemo(
    () => [
      {
        id: "c-lb",
        source: "client",
        target: "lb",
        animated: true,
        markerEnd: { type: MarkerType.ArrowClosed },
      },
      {
        id: "lb-a",
        source: "lb",
        target: "serverA",
        animated: !crashedServer,
        style: { stroke: crashedServer ? "#ef4444" : undefined, strokeDasharray: crashedServer ? "6 3" : undefined },
        markerEnd: { type: MarkerType.ArrowClosed },
      },
      {
        id: "lb-b",
        source: "lb",
        target: "serverB",
        animated: true,
        markerEnd: { type: MarkerType.ArrowClosed },
      },
      {
        id: "a-redis",
        source: "serverA",
        target: "redis",
        animated: !crashedServer,
        markerEnd: { type: MarkerType.ArrowClosed },
      },
      {
        id: "b-redis",
        source: "serverB",
        target: "redis",
        animated: true,
        markerEnd: { type: MarkerType.ArrowClosed },
      },
    ],
    [crashedServer]
  );

  return <FlowDiagram nodes={nodes} edges={edges} minHeight={420} allowDrag={false} />;
}

// ─── Failure Demo Playground ──────────────────────────────────────────────────

function FailureDemoPlayground() {
  const sim = useSimulation({ intervalMs: 900, maxSteps: 16 });

  // tick 0–7: running normally; tick 8+: server A crashed
  const crashed = sim.tick >= 8;
  const phase =
    sim.tick === 0
      ? "idle"
      : sim.tick < 8
      ? "running"
      : sim.tick < 12
      ? "crash"
      : "failover";

  const phaseLabel: Record<string, string> = {
    idle: "Press play to start the simulation",
    running: "Both servers handling requests normally...",
    crash: "Server A crashed! Watch what happens next.",
    failover: "Traffic rerouted. Outcome depends on architecture.",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center">
        <span
          className={
            phase === "crash"
              ? "text-xs font-semibold px-3 py-1 rounded-full border bg-red-500/10 border-red-500/30 text-red-400"
              : phase === "failover"
              ? "text-xs font-semibold px-3 py-1 rounded-full border bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "text-xs font-semibold px-3 py-1 rounded-full border bg-muted/20 border-border/30 text-muted-foreground"
          }
        >
          {phaseLabel[phase]}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Stateful side */}
        <div className="rounded-xl border border-red-500/20 bg-red-500/[0.02] overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-red-500/20 bg-red-500/[0.04]">
            <span className="size-2 rounded-full bg-red-500" />
            <span className="text-xs font-semibold text-red-400">Stateful — in-memory sessions</span>
          </div>
          <div className="p-2">
            <StatefulDiagram crashedServer={crashed} />
          </div>
          {crashed && (
            <div className="mx-3 mb-3 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-xs text-red-400">
              42 sessions lost. Users forcibly logged out.
            </div>
          )}
        </div>

        {/* Stateless side */}
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.02] overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-emerald-500/20 bg-emerald-500/[0.04]">
            <span className="size-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-semibold text-emerald-400">Stateless — Redis session store</span>
          </div>
          <div className="p-2">
            <StatelessDiagram crashedServer={crashed} />
          </div>
          {crashed && (
            <div className="mx-3 mb-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 text-xs text-emerald-400">
              Zero sessions lost. Server B continues serving all users.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── State Externalization Playground ────────────────────────────────────────

function StateExternalizationPlayground() {
  const sim = useSimulation({ intervalMs: 1200, maxSteps: 8 });

  const steps = [
    {
      label: "Sessions",
      from: "Server memory",
      to: "Redis",
      activeAt: 1,
    },
    {
      label: "File uploads",
      from: "Local disk",
      to: "S3 / Blob Storage",
      activeAt: 3,
    },
    {
      label: "User data",
      from: "Local SQLite",
      to: "PostgreSQL",
      activeAt: 5,
    },
    {
      label: "Rate limits",
      from: "In-process Map",
      to: "Redis / Memcached",
      activeAt: 7,
    },
  ];

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Watch each type of state migrate out of the server into a dedicated external
        store. After migration, the server holds nothing — it becomes fully disposable.
      </p>
      <div className="space-y-2">
        {steps.map((s) => {
          const done = sim.tick >= s.activeAt + 1;
          const active = sim.tick === s.activeAt;
          return (
            <div
              key={s.label}
              className={
                done
                  ? "flex items-center gap-3 p-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/[0.04] transition-all"
                  : active
                  ? "flex items-center gap-3 p-2.5 rounded-lg border border-amber-500/30 bg-amber-500/[0.06] transition-all"
                  : "flex items-center gap-3 p-2.5 rounded-lg border border-border/20 bg-muted/10 transition-all opacity-50"
              }
            >
              <span className="text-[10px] font-semibold w-20 shrink-0 text-foreground">
                {s.label}
              </span>
              <span
                className={
                  done
                    ? "text-[10px] font-mono text-muted-foreground/40 line-through"
                    : "text-[10px] font-mono text-red-400"
                }
              >
                {s.from}
              </span>
              <span className="text-[10px] text-muted-foreground/50">
                {active ? "→ migrating..." : done ? "✓" : "→"}
              </span>
              <span
                className={
                  done
                    ? "text-[10px] font-mono font-semibold text-emerald-400"
                    : active
                    ? "text-[10px] font-mono text-amber-400"
                    : "text-[10px] font-mono text-muted-foreground/30"
                }
              >
                {s.to}
              </span>
            </div>
          );
        })}
      </div>
      {sim.tick >= 8 && (
        <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 text-xs text-emerald-400 text-center">
          Server is now fully stateless. Add, remove, or crash it — zero data loss.
        </div>
      )}
    </div>
  );
}

// ─── Scalability Chart ────────────────────────────────────────────────────────

const scalabilityData = [
  { servers: "1", stateful: 100, stateless: 100 },
  { servers: "2", stateful: 160, stateless: 200 },
  { servers: "3", stateful: 200, stateless: 300 },
  { servers: "4", stateful: 220, stateless: 400 },
  { servers: "6", stateful: 230, stateless: 600 },
  { servers: "8", stateful: 235, stateless: 800 },
  { servers: "12", stateful: 238, stateless: 1200 },
];

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function StatelessVsStatefulPage() {
  const failureSim = useSimulation({ intervalMs: 900, maxSteps: 16 });
  const externSim = useSimulation({ intervalMs: 1200, maxSteps: 8 });

  return (
    <div className="space-y-8">
      <TopicHero
        title="Stateless vs Stateful"
        subtitle="Why storing session data in server memory breaks horizontal scaling — and how externalizing state fixes it"
        difficulty="beginner"
      />

      <WhyCare>
        Ever lost your shopping cart when a website crashed? That&apos;s a <GlossaryTerm term="stateful">stateful</GlossaryTerm> server failing. Understanding this difference is key to building apps that scale.
      </WhyCare>

      <ConversationalCallout type="question">
        A user logs in and their cart fills up. They click checkout — and suddenly they are
        back at the login screen. Their cart is gone. What just happened? Their session was
        living on Server A. The next request went to Server B. Server B knows nothing.
      </ConversationalCallout>

      {/* ── Failure Demo ─────────────────────────────── */}
      <Playground
        title="Server Failure Demo — Stateful vs Stateless"
        simulation={failureSim}
        canvasHeight="min-h-[480px]"
        hints={["Watch what happens at tick 8 when Server A crashes — compare the two sides."]}
        canvas={
          <div className="p-4">
            <FailureDemoPlayground />
          </div>
        }
        explanation={
          <div className="space-y-3">
            <p className="font-medium text-foreground text-sm">What you are watching</p>
            <p>
              Both architectures start with Server A and Server B sharing load. At tick 8,
              Server A crashes.
            </p>
            <p>
              <span className="text-red-400 font-medium">Stateful:</span> Server A held
              42 sessions in its process memory. When it crashed, those sessions vanished.
              Every user who was on Server A is now logged out.
            </p>
            <p>
              <span className="text-emerald-400 font-medium">Stateless:</span> Server A
              held nothing. All sessions lived in Redis. Server B keeps reading from Redis
              without interruption. Users feel nothing.
            </p>
            <p>
              The same pattern applies to deployments, auto-scaling, and maintenance
              restarts — not just crashes.
            </p>
          </div>
        }
        controls={<div className="px-3 py-2 border-t border-violet-500/10"><div className="flex flex-wrap items-center gap-2 rounded-lg border border-violet-500/20 bg-violet-500/[0.04] px-3 py-2"><button onClick={failureSim.toggle} className="rounded-md px-3 py-1 text-xs font-medium bg-violet-500/20 text-violet-400 hover:bg-violet-500/30 transition-colors">{failureSim.isPlaying ? "Pause" : "Play"}</button><button onClick={failureSim.reset} className="rounded-md px-3 py-1 text-xs font-medium text-muted-foreground hover:bg-muted/30 transition-colors">Reset</button><span className="text-xs text-muted-foreground ml-auto">Tick {failureSim.tick} / 16</span></div></div>}
      />

      <ConversationalCallout type="warning">
        Sticky sessions (routing a user to the same server every time) can paper over
        stateful problems — but they make load balancing uneven, break during deployments,
        and still lose sessions when that one server crashes. They are a band-aid, not
        a fix.
      </ConversationalCallout>

      {/* ── Before / After ───────────────────────────── */}
      <BeforeAfter
        before={{
          title: "Stateful servers — in-memory sessions",
          content: (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Scaling is painful. Crashes lose user data. <GlossaryTerm term="stateless">Stateless</GlossaryTerm> servers solve this.</p>
              <ul className="text-[11px] text-muted-foreground space-y-1.5">
                <li>✗ Load balancer must pin users to the same server (sticky sessions)</li>
                <li>✗ Server crash = all sessions on that machine lost</li>
                <li>✗ Adding a new server means it starts with zero sessions</li>
                <li>✗ Rolling deployments log everyone out</li>
                <li>✗ Uneven load — users cluster on old servers</li>
              </ul>
            </div>
          ),
        }}
        after={{
          title: "Stateless servers — external session store",
          content: (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Any server handles any request. Crashes are invisible.</p>
              <ul className="text-[11px] text-muted-foreground space-y-1.5">
                <li>✓ Round-robin load balancing — no sticky sessions needed</li>
                <li>✓ Server crash = zero session loss, traffic reroutes instantly</li>
                <li>✓ New servers are immediately ready for any user</li>
                <li>✓ Deployments are seamless — drain and restart freely</li>
                <li>✓ Even load distribution across all instances</li>
              </ul>
            </div>
          ),
        }}
      />

      {/* ── State Externalization Playground ─────────── */}
      <Playground
        title="State Externalization — Migration Walkthrough"
        simulation={externSim}
        canvasHeight="min-h-[320px]"
        hints={["Watch each type of state move from server memory to a dedicated external store."]}
        canvas={
          <div className="p-4">
            <StateExternalizationPlayground />
          </div>
        }
        explanation={
          <div className="space-y-3">
            <p className="font-medium text-foreground text-sm">The migration pattern</p>
            <p>
              For each type of in-server state, there is a purpose-built external store:
            </p>
            <ul className="space-y-2 text-xs">
              <li>
                <span className="text-orange-400 font-medium">Redis</span> — sessions,
                rate-limit counters, ephemeral caches. Sub-millisecond reads.
              </li>
              <li>
                <span className="text-blue-400 font-medium">S3 / Blob</span> — user
                uploads, media, backups. Durable and infinitely scalable.
              </li>
              <li>
                <span className="text-amber-400 font-medium">PostgreSQL</span> — persistent
                user records, orders, transactions. ACID guarantees.
              </li>
              <li>
                <span className="text-orange-400 font-medium">Redis</span> — rate-limit
                state shared across all servers. Atomic increments via Lua scripts.
              </li>
            </ul>
            <p>
              Once migration is complete, your servers hold zero user data. They are
              compute only — disposable, interchangeable, auto-scalable.
            </p>
          </div>
        }
        controls={<div className="px-3 py-2 border-t border-violet-500/10"><div className="flex flex-wrap items-center gap-2 rounded-lg border border-violet-500/20 bg-violet-500/[0.04] px-3 py-2"><button onClick={externSim.toggle} className="rounded-md px-3 py-1 text-xs font-medium bg-violet-500/20 text-violet-400 hover:bg-violet-500/30 transition-colors">{externSim.isPlaying ? "Pause" : "Play"}</button><button onClick={externSim.reset} className="rounded-md px-3 py-1 text-xs font-medium text-muted-foreground hover:bg-muted/30 transition-colors">Reset</button><span className="text-xs text-muted-foreground ml-auto">Step {externSim.tick} / 8</span></div></div>}
      />

      <ConversationalCallout type="tip">
        JWT tokens are the ultimate stateless auth primitive. The token encodes the user
        identity and is signed with a secret. Any server can verify it without consulting
        a database. No session store needed for authentication at all.
      </ConversationalCallout>

      {/* ── Scalability Chart ─────────────────────────── */}
      <div className="rounded-xl border border-border/40 bg-muted/[0.02] p-4 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">Scalability Comparison</span>
          <span className="text-xs text-muted-foreground">— requests per second as you add servers</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Stateless architectures scale linearly: double the servers, double the throughput.
          Stateful architectures hit a ceiling fast — sticky-session routing with the <GlossaryTerm term="load balancer">load balancer</GlossaryTerm> becomes the bottleneck
          and servers sit unevenly loaded.
        </p>
        <LiveChart
          type="area"
          data={scalabilityData}
          dataKeys={{
            x: "servers",
            y: ["stateless", "stateful"],
            label: ["Stateless (external store)", "Stateful (sticky sessions)"],
          }}
          height={220}
          unit="rps"
          referenceLines={[{ y: 240, label: "Stateful ceiling", color: "#ef4444" }]}
        />
      </div>

      <AhaMoment
        question="REST is stateless by design — every HTTP request must contain all information needed to process it. That is why we send an Authorization header on every single call."
        answer={
          <p>
            Roy Fielding defined statelessness as one of REST&apos;s six core constraints
            in his 2000 dissertation. Each request carries its own auth (a JWT in the
            Authorization header), its own context (query params, body), and its own
            intent (HTTP verb). The server remembers nothing between calls. This is precisely
            why REST APIs scale so effortlessly — spin up a hundred servers and every one
            of them can answer every request independently, immediately, without any
            coordination. Compare to old-school session-based web apps where the server
            must remember your login from a previous request: one server, or sticky routing
            — neither scales cleanly.
          </p>
        }
      />

      {/* ── When Stateful Is Right ────────────────────── */}
      <div className="rounded-xl border border-border/40 bg-muted/[0.02] p-4 space-y-4">
        <p className="text-sm font-semibold">When stateful architecture is the right choice</p>
        <p className="text-xs text-muted-foreground">
          Stateful is not inherently wrong. Some use cases require it. The key is choosing
          it deliberately and knowing the operational cost you are accepting.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            {
              title: "WebSocket connections",
              desc: "Chat apps, live dashboards. The persistent WebSocket connection is itself state. Sticky sessions or connection-aware routing required.",
              icon: "WS",
            },
            {
              title: "Game servers",
              desc: "Player positions, physics simulation, world state. Too latency-sensitive for round-trips to an external store.",
              icon: "GS",
            },
            {
              title: "Database connections",
              desc: "Connection pools are stateful. Transactions span multiple queries on the same connection.",
              icon: "DB",
            },
            {
              title: "In-memory caches",
              desc: "Deliberately trading statefulness for ultra-low latency. Acceptable when the cache is a performance layer, not the source of truth.",
              icon: "$$",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-lg border border-purple-500/20 bg-purple-500/[0.03] p-3 flex items-start gap-3"
            >
              <div className="size-8 rounded-md bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                <span className="text-[10px] font-mono font-bold text-purple-400">
                  {item.icon}
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold">{item.title}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <ConversationalCallout type="warning">
          When you choose stateful architecture, you accept real operational costs: sticky
          session configuration, connection draining on shutdown, uneven load distribution,
          and careful rolling deployments. Make this choice deliberately — never by accident.
        </ConversationalCallout>
      </div>

      <TopicQuiz questions={[
        {
          question: "What happens when a stateful server crashes?",
          options: ["Nothing — data is replicated automatically", "All sessions stored in that server's memory are lost", "The load balancer restores the sessions", "Users are seamlessly redirected"],
          correctIndex: 1,
          explanation: "Stateful servers store session data in process memory. When the process dies, that data vanishes — every user on that server is logged out or loses their cart."
        },
        {
          question: "Why are sticky sessions considered a band-aid, not a real fix?",
          options: ["They are too expensive", "They make load uneven, break during deployments, and still lose sessions on crashes", "They require GraphQL", "They don't work with HTTPS"],
          correctIndex: 1,
          explanation: "Sticky sessions pin users to specific servers, causing uneven load. During deployments or crashes, pinned users still lose their sessions."
        },
        {
          question: "How does externalizing state to Redis make servers stateless?",
          options: ["Redis encrypts the session data", "Servers no longer hold any user data — any server can read from Redis to handle any request", "Redis is faster than server memory", "It eliminates the need for a load balancer"],
          correctIndex: 1,
          explanation: "With sessions in Redis, servers become pure compute nodes. Any server can serve any user by reading their session from the shared store, enabling true horizontal scaling."
        },
      ]} />

      <KeyTakeaway
        points={[
          "State is any data a server remembers between requests: sessions, carts, preferences, connection context. If it lives in server memory, your server is stateful.",
          "Stateless servers can be added, removed, or crashed without data loss. Load balancers use simple round-robin. Auto-scaling becomes a single slider.",
          "The fix for accidental statefulness is externalizing state: Redis for sessions and rate limits, S3 for files, PostgreSQL for persistent records. Servers become compute-only.",
          "Sticky sessions mask the stateful problem but do not solve it — they make load uneven, break deployments, and still lose sessions on server crashes.",
          "REST is stateless by design. JWT tokens go further: any server can verify a JWT without querying a session store at all.",
          "In system design interviews, default to stateless. Only introduce statefulness for WebSockets, game servers, or deliberate performance trade-offs — and always explain the cost.",
        ]}
      />
    </div>
  );
}
