"use client";

import { useState, useMemo, useCallback } from "react";
import { TopicHero } from "@/components/topic-hero";
import { KeyTakeaway } from "@/components/key-takeaway";
import { AhaMoment } from "@/components/aha-moment";
import { ConversationalCallout } from "@/components/conversational-callout";
import { BeforeAfter } from "@/components/before-after";
import { Playground } from "@/components/playground";
import { FlowDiagram, type FlowNode, type FlowEdge } from "@/components/flow-diagram";
import { LiveChart } from "@/components/live-chart";
import { useSimulation } from "@/hooks/use-simulation";
import { cn } from "@/lib/utils";
import {
  Send, CheckCircle2, Wifi, WifiOff, Users, MessageSquare,
} from "lucide-react";

// ─── Helpers ────────────────────────────────────────────────────────────────

function n(id: string, type: string, x: number, y: number, data: Record<string, unknown>): FlowNode {
  return { id, type, position: { x, y }, data: data as FlowNode["data"] };
}

const statusMap: Record<string, "healthy" | "unhealthy" | "warning" | "idle"> = {
  healthy: "healthy",
  unhealthy: "unhealthy",
  warning: "warning",
  idle: "idle",
};

// ─── Section 1: WebSocket Connection Playground ─────────────────────────────

function WebSocketPlayground() {
  const [message, setMessage] = useState("Hello Bob!");
  const [sent, setSent] = useState(false);
  const [flowStep, setFlowStep] = useState(-1);

  const sendMessage = useCallback(() => {
    if (!message.trim()) return;
    setSent(false);
    setFlowStep(0);
    let s = 0;
    const iv = setInterval(() => {
      s++;
      if (s <= 4) {
        setFlowStep(s);
      } else {
        setSent(true);
        clearInterval(iv);
      }
    }, 500);
  }, [message]);

  const resetFlow = useCallback(() => {
    setFlowStep(-1);
    setSent(false);
  }, []);

  const stepLabels = ["Encrypting...", "Sending via WS", "Routing", "Pushing to Bob", "Delivered!"];
  const currentLabel = flowStep >= 0 && flowStep < stepLabels.length ? stepLabels[flowStep] : sent ? "Delivered!" : "Idle";

  const nodes: FlowNode[] = useMemo(() => [
    n("alice", "clientNode", 0, 80, {
      label: "User A (Alice)",
      sublabel: flowStep === 0 ? "Encrypting..." : flowStep > 0 ? "Sent" : "Ready",
      status: statusMap[flowStep >= 0 ? "healthy" : "idle"],
      handles: { right: true },
    }),
    n("ws-gw", "gatewayNode", 200, 60, {
      label: "WebSocket Gateway",
      sublabel: currentLabel,
      status: statusMap[flowStep >= 1 ? "healthy" : "idle"],
      handles: { left: true, right: true },
    }),
    n("chat-svc", "serverNode", 420, 60, {
      label: "Chat Service",
      sublabel: flowStep >= 2 ? "Processing" : "Waiting",
      status: statusMap[flowStep >= 2 ? "healthy" : "idle"],
      handles: { left: true, right: true },
    }),
    n("bob", "clientNode", 620, 80, {
      label: "User B (Bob)",
      sublabel: sent ? "Message received!" : flowStep >= 3 ? "Incoming..." : "Online",
      status: statusMap[sent ? "healthy" : "idle"],
      handles: { left: true },
    }),
  ], [flowStep, sent, currentLabel]);

  const edges: FlowEdge[] = useMemo(() => [
    { id: "a-gw", source: "alice", target: "ws-gw", animated: flowStep >= 0 && flowStep <= 1 },
    { id: "gw-cs", source: "ws-gw", target: "chat-svc", animated: flowStep >= 1 && flowStep <= 2 },
    { id: "cs-b", source: "chat-svc", target: "bob", animated: flowStep >= 3 },
  ], [flowStep]);

  return (
    <Playground
      title="WebSocket Connection Playground"
      canvas={<FlowDiagram nodes={nodes} edges={edges} minHeight={220} />}
      canvasHeight="min-h-[220px]"
      controls={false}
      explanation={
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Message</label>
            <input
              type="text"
              value={message}
              onChange={(e) => { setMessage(e.target.value); resetFlow(); }}
              className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-violet-500"
              placeholder="Type a message..."
            />
          </div>
          <button
            onClick={sendMessage}
            disabled={flowStep >= 0 && !sent}
            className="w-full rounded-md bg-violet-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-40 transition-colors flex items-center justify-center gap-2"
          >
            <Send className="size-3.5" /> Send Message
          </button>
          <div className="space-y-1.5">
            {stepLabels.map((label, i) => {
              const done = flowStep > i || sent;
              const active = flowStep === i && !sent;
              return (
                <div
                  key={label}
                  className={cn(
                    "flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs transition-all duration-300",
                    done
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                      : active
                      ? "border-blue-500/30 bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20"
                      : "border-border/30 bg-muted/10 text-muted-foreground/40"
                  )}
                >
                  {done ? <CheckCircle2 className="size-3" /> : <span className="size-3" />}
                  {label}
                </div>
              );
            })}
          </div>
          {sent && (
            <p className="text-xs text-emerald-400 font-medium">
              Bob received: &quot;{message}&quot; in ~25ms total
            </p>
          )}
        </div>
      }
    />
  );
}

// ─── Section 2: Latency Comparison Chart ────────────────────────────────────

const latencyData = [
  { scenario: "1 msg", ws: 25, longPoll: 120, shortPoll: 1500 },
  { scenario: "10 msg", ws: 25, longPoll: 200, shortPoll: 1500 },
  { scenario: "100 msg", ws: 28, longPoll: 350, shortPoll: 1500 },
  { scenario: "Burst", ws: 30, longPoll: 800, shortPoll: 3000 },
  { scenario: "Idle", ws: 0, longPoll: 50, shortPoll: 1500 },
];

// ─── Section 3: Message Fanout Demo ─────────────────────────────────────────

function MessageFanoutDemo() {
  const [groupSize, setGroupSize] = useState(5);
  const sim = useSimulation({ intervalMs: 600, maxSteps: groupSize + 2 });

  const onlineCount = Math.ceil(groupSize * 0.6);
  const offlineCount = groupSize - onlineCount;

  const nodes: FlowNode[] = useMemo(() => {
    const result: FlowNode[] = [
      n("sender", "clientNode", 0, 120, {
        label: "Sender",
        sublabel: sim.step >= 1 ? "Message sent" : "Ready",
        status: statusMap[sim.step >= 1 ? "healthy" : "idle"],
        handles: { right: true },
      }),
      n("chat-svc", "serverNode", 200, 100, {
        label: "Chat Service",
        sublabel: sim.step >= 1 ? `Fan-out to ${groupSize}` : "Waiting",
        status: statusMap[sim.step >= 1 ? "healthy" : "idle"],
        handles: { left: true, right: true },
      }),
      n("queue", "queueNode", 400, 100, {
        label: "Message Queue",
        sublabel: sim.step >= 2 ? `${groupSize} deliveries` : "Empty",
        status: statusMap[sim.step >= 2 ? "warning" : "idle"],
        handles: { left: true, right: true },
      }),
    ];

    const totalRecipients = Math.min(groupSize, 6);
    const spacing = 60;
    const startY = 120 - ((totalRecipients - 1) * spacing) / 2;

    for (let i = 0; i < totalRecipients; i++) {
      const isOnline = i < Math.ceil(totalRecipients * 0.6);
      const delivered = sim.step >= 3 + i;
      result.push(
        n(
          `r-${i}`,
          "clientNode",
          600,
          startY + i * spacing,
          {
            label: isOnline ? `User ${i + 1}` : `User ${i + 1} (offline)`,
            sublabel: delivered ? (isOnline ? "Instant push" : "Stored for later") : "Waiting",
            status: statusMap[delivered ? (isOnline ? "healthy" : "warning") : "idle"],
            handles: { left: true },
          }
        )
      );
    }

    return result;
  }, [sim.step, groupSize, onlineCount]);

  const edges: FlowEdge[] = useMemo(() => {
    const result: FlowEdge[] = [
      { id: "s-cs", source: "sender", target: "chat-svc", animated: sim.step >= 1 },
      { id: "cs-q", source: "chat-svc", target: "queue", animated: sim.step >= 2 },
    ];
    const totalRecipients = Math.min(groupSize, 6);
    for (let i = 0; i < totalRecipients; i++) {
      result.push({
        id: `q-r${i}`,
        source: "queue",
        target: `r-${i}`,
        animated: sim.step >= 3 + i,
      });
    }
    return result;
  }, [sim.step, groupSize]);

  const groupSizeOptions = [5, 50, 256, 10000];

  return (
    <Playground
      title="Message Fanout Demo"
      simulation={sim}
      canvas={<FlowDiagram nodes={nodes} edges={edges} minHeight={350} />}
      canvasHeight="min-h-[350px]"
      explanation={
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Group Size</label>
            <div className="flex gap-1.5">
              {groupSizeOptions.map((size) => (
                <button
                  key={size}
                  onClick={() => { setGroupSize(size); sim.reset(); }}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-xs font-mono transition-colors",
                    groupSize === size
                      ? "bg-violet-500/20 text-violet-400 border border-violet-500/30"
                      : "bg-muted/20 text-muted-foreground border border-border/30 hover:bg-muted/40"
                  )}
                >
                  {size >= 1000 ? `${(size / 1000).toFixed(0)}K` : size}
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-md border border-border/30 bg-muted/10 p-3 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Online recipients</span>
              <span className="text-emerald-400 font-mono">{onlineCount}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Offline recipients</span>
              <span className="text-amber-400 font-mono">{offlineCount}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Write amplification</span>
              <span className="text-red-400 font-mono">1 msg &rarr; {groupSize} writes</span>
            </div>
          </div>
          {groupSize >= 10000 && (
            <div className="rounded-md border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs text-red-400">
              At {groupSize.toLocaleString()} members, fan-out-on-write is impractical.
              Discord uses fan-out-on-read for large servers instead.
            </div>
          )}
        </div>
      }
    />
  );
}

// ─── Section 4: Full Architecture Playground ────────────────────────────────

function ArchitecturePlayground() {
  const sim = useSimulation({ intervalMs: 800, maxSteps: 8 });

  const stepDescriptions = [
    "Alice types a message and taps send",
    "Message encrypted via Signal Protocol on-device",
    "Sent over WebSocket to Gateway (binary frame)",
    "Chat service persists to Cassandra",
    "Published to Kafka (recipient inbox topic)",
    "Redis lookup: Bob is on Gateway 2",
    "Message pushed to Bob via WebSocket",
    "Read receipt flows back to Alice",
  ];

  const nodes: FlowNode[] = useMemo(() => [
    n("alice", "clientNode", 0, 140, {
      label: "Alice", sublabel: sim.step >= 1 ? "Sent" : "Typing...",
      status: statusMap[sim.step >= 1 ? "healthy" : "idle"],
      handles: { right: true },
    }),
    n("lb", "loadBalancerNode", 160, 120, {
      label: "Load Balancer",
      status: statusMap[sim.step >= 2 ? "healthy" : "idle"],
      handles: { left: true, right: true },
    }),
    n("ws1", "gatewayNode", 310, 50, {
      label: "WS Server 1", sublabel: "Alice's gateway",
      status: statusMap[sim.step >= 2 ? "healthy" : "idle"],
      handles: { left: true, right: true },
    }),
    n("chat", "serverNode", 470, 50, {
      label: "Chat Service",
      sublabel: sim.step >= 3 ? "Processing" : "Idle",
      status: statusMap[sim.step >= 3 ? "healthy" : "idle"],
      handles: { left: true, right: true, bottom: true },
    }),
    n("kafka", "queueNode", 470, 180, {
      label: "Kafka",
      sublabel: sim.step >= 4 ? "bob-inbox topic" : "",
      status: statusMap[sim.step >= 4 ? "warning" : "idle"],
      handles: { top: true, right: true },
    }),
    n("db", "databaseNode", 640, 50, {
      label: "Cassandra",
      sublabel: sim.step >= 3 ? "Persisted" : "",
      status: statusMap[sim.step >= 3 ? "healthy" : "idle"],
      handles: { left: true },
    }),
    n("redis", "cacheNode", 640, 180, {
      label: "Redis Sessions",
      sublabel: sim.step >= 5 ? "Bob → WS2" : "",
      status: statusMap[sim.step >= 5 ? "healthy" : "idle"],
      handles: { left: true },
    }),
    n("ws2", "gatewayNode", 310, 200, {
      label: "WS Server 2", sublabel: "Bob's gateway",
      status: statusMap[sim.step >= 6 ? "healthy" : "idle"],
      handles: { left: true, right: true },
    }),
    n("bob", "clientNode", 0, 220, {
      label: "Bob",
      sublabel: sim.step >= 7 ? "Read" : sim.step >= 6 ? "Received!" : "Online",
      status: statusMap[sim.step >= 6 ? "healthy" : "idle"],
      handles: { right: true },
    }),
  ], [sim.step]);

  const edges: FlowEdge[] = useMemo(() => [
    { id: "a-lb", source: "alice", target: "lb", animated: sim.step >= 1 && sim.step <= 2 },
    { id: "lb-ws1", source: "lb", target: "ws1", animated: sim.step >= 2 && sim.step <= 3 },
    { id: "ws1-chat", source: "ws1", target: "chat", animated: sim.step >= 2 && sim.step <= 4 },
    { id: "chat-db", source: "chat", target: "db", animated: sim.step === 3 },
    { id: "chat-kafka", source: "chat", target: "kafka", animated: sim.step >= 4 && sim.step <= 5 },
    { id: "kafka-redis", source: "kafka", target: "redis", animated: sim.step === 5 },
    { id: "kafka-ws2", source: "kafka", target: "ws2", animated: sim.step >= 5 && sim.step <= 6 },
    { id: "ws2-bob", source: "ws2", target: "bob", animated: sim.step >= 6 },
    { id: "bob-ws2-ack", source: "bob", target: "ws2", animated: sim.step >= 7,
      style: { stroke: "#22c55e", strokeDasharray: "5 5" } },
  ], [sim.step]);

  return (
    <Playground
      title="Full Architecture -- Message Lifecycle"
      simulation={sim}
      canvas={<FlowDiagram nodes={nodes} edges={edges} minHeight={320} />}
      canvasHeight="min-h-[320px]"
      explanation={(state) => (
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-violet-400">Message Journey</h4>
          <div className="space-y-1.5">
            {stepDescriptions.map((desc, i) => {
              const done = state.step > i;
              const active = state.step === i;
              return (
                <div
                  key={desc}
                  className={cn(
                    "flex items-start gap-2 rounded-md border px-2.5 py-1.5 text-xs transition-all duration-300",
                    done
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                      : active
                      ? "border-blue-500/30 bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20"
                      : "border-border/30 bg-muted/10 text-muted-foreground/40"
                  )}
                >
                  <span className="font-mono font-bold shrink-0 w-4">{i + 1}</span>
                  <span>{desc}</span>
                </div>
              );
            })}
          </div>
          {state.step >= 8 && (
            <p className="text-xs text-emerald-400">
              Full round-trip in ~29ms. The server never saw the plaintext -- only encrypted bytes.
            </p>
          )}
        </div>
      )}
    />
  );
}

// ─── Section 5: Presence System ─────────────────────────────────────────────

function PresencePlayground() {
  const sim = useSimulation({ intervalMs: 1500, maxSteps: 12 });

  const users = useMemo(() => [
    { name: "Alice", online: true, heartbeat: sim.step % 3 === 0 },
    { name: "Bob", online: sim.step < 6, goesOfflineAt: 6 },
    { name: "Charlie", online: false, lastSeen: "1 hour ago" },
    { name: "Diana", online: true, heartbeat: sim.step % 4 === 0 },
    { name: "Eve", online: sim.step >= 4, comesOnlineAt: 4 },
  ], [sim.step]);

  const activeConnections = useMemo(() =>
    Array.from({ length: 24 }, (_, i) => ({
      hour: `${i}:00`,
      connections: Math.round(
        45000 * (Math.sin(((i - 6) / 24) * Math.PI * 2) * 0.4 + 0.6) + Math.sin(i * 7) * 3000
      ),
    })),
  []);

  return (
    <div className="space-y-6">
      <Playground
        title="Presence System -- Who Is Online?"
        simulation={sim}
        canvas={
          <div className="p-4 space-y-2">
            {users.map((user) => {
              const isOnline = user.online;
              const showHeartbeat = isOnline && user.heartbeat;
              return (
                <div
                  key={user.name}
                  className="flex items-center gap-3 rounded-lg bg-muted/20 border border-border/30 px-3 py-2"
                >
                  <div className="relative">
                    <div className="size-8 rounded-full bg-muted/50 flex items-center justify-center text-xs font-bold text-muted-foreground">
                      {user.name[0]}
                    </div>
                    <div
                      className={cn(
                        "absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-background transition-all duration-500",
                        isOnline ? "bg-emerald-400" : "bg-muted-foreground/30"
                      )}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold">{user.name}</p>
                    <p
                      className={cn(
                        "text-[10px] transition-all duration-300",
                        isOnline ? "text-emerald-400" : "text-muted-foreground/50"
                      )}
                    >
                      {isOnline ? "Online" : `Last seen ${user.lastSeen || "just now"}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {showHeartbeat && (
                      <span className="text-[9px] font-mono text-blue-400 animate-pulse">PING</span>
                    )}
                    {isOnline ? (
                      <Wifi className="size-3.5 text-emerald-400/60" />
                    ) : (
                      <WifiOff className="size-3.5 text-muted-foreground/30" />
                    )}
                  </div>
                </div>
              );
            })}
            {sim.step >= 6 && sim.step <= 8 && (
              <div className="rounded-md border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs text-amber-400 mt-2">
                Bob went offline. Notifying {500} contacts of status change...
              </div>
            )}
          </div>
        }
        canvasHeight="min-h-[320px]"
        explanation={
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-violet-400">How Presence Works</h4>
            <p className="text-xs text-muted-foreground">
              Clients send <strong>heartbeat pings</strong> every 30s. Three missed pings = offline.
              Bob disconnects at step 6; Eve joins at step 4.
            </p>
            <div className="rounded-md border border-border/30 bg-muted/10 p-3 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Heartbeat interval</span>
                <span className="font-mono text-blue-400">30s</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Timeout threshold</span>
                <span className="font-mono text-amber-400">90s (3 missed)</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Fan-out cost</span>
                <span className="font-mono text-red-400">O(friends)</span>
              </div>
            </div>
          </div>
        }
      />

      <div className="space-y-2">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Users className="size-4 text-violet-400" />
          Active Connections Over 24 Hours
        </h3>
        <LiveChart
          type="area"
          data={activeConnections}
          dataKeys={{ x: "hour", y: "connections", label: "Active Connections" }}
          height={200}
          unit=""
          referenceLines={[
            { y: 60000, label: "Gateway capacity", color: "#ef4444" },
          ]}
        />
        <p className="text-xs text-muted-foreground/60">
          Connections follow a daily cycle. When the peak exceeds a single gateway&apos;s 60K limit,
          auto-scaling adds more gateway servers.
        </p>
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function ChatSystemPage() {
  return (
    <div className="space-y-8">
      <TopicHero
        title="Design a Chat System"
        subtitle="Your users expect messages in milliseconds. HTTP polling every 5 seconds means your 'real-time' chat feels like email. WhatsApp delivers 100 billion messages per day -- here's how."
        difficulty="advanced"
      />

      {/* Section 1: WebSocket vs Polling */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <MessageSquare className="size-5 text-violet-400" />
          WebSocket Connections
        </h2>
        <p className="text-sm text-muted-foreground">
          Type a message and watch it flow through the real-time architecture.
          WebSockets maintain a persistent, bidirectional connection -- the server
          pushes messages instantly without the client asking.
        </p>
        <WebSocketPlayground />
      </section>

      {/* Latency comparison */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold">Message Delivery Latency Comparison</h3>
        <LiveChart
          type="bar"
          data={latencyData}
          dataKeys={{
            x: "scenario",
            y: ["ws", "longPoll", "shortPoll"],
            label: ["WebSocket", "Long Polling", "Short Polling"],
          }}
          height={220}
          unit="ms"
          referenceLines={[
            { y: 100, label: "Human perception threshold", color: "#f59e0b" },
          ]}
        />
        <BeforeAfter
          before={{
            title: "HTTP Polling",
            content: (
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>Client asks server every N seconds</li>
                <li>95% of responses are empty</li>
                <li>Average latency = N/2 seconds</li>
                <li>3.3M req/s for 10M users (3s poll)</li>
              </ul>
            ),
          }}
          after={{
            title: "WebSocket",
            content: (
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>Persistent bidirectional connection</li>
                <li>Server pushes messages instantly</li>
                <li>Latency under 50ms</li>
                <li>10M persistent connections, zero waste</li>
              </ul>
            ),
          }}
        />
      </section>

      <ConversationalCallout type="tip">
        A WebSocket starts as a normal HTTP request with an <code>Upgrade: websocket</code> header,
        then upgrades to a persistent bidirectional connection. WhatsApp&apos;s Erlang servers
        handle ~60K concurrent connections each.
      </ConversationalCallout>

      {/* Section 2: Message Fanout */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Users className="size-5 text-violet-400" />
          Message Fanout in Group Chats
        </h2>
        <p className="text-sm text-muted-foreground">
          One message to a group must reach every member. Try different group sizes to see
          write amplification. Online users get instant push; offline get stored for later.
        </p>
        <MessageFanoutDemo />
      </section>

      <AhaMoment
        question="How does Discord handle servers with 500K+ members if fan-out-on-write is impractical?"
        answer={
          <p>
            Discord uses <strong>fan-out-on-read</strong> for large servers. Messages are stored
            once in the channel. Each user reads from the shared store when they open the channel.
            This trades write amplification for read amplification -- but since most users are
            lurkers who never open the channel, it is far cheaper overall. WhatsApp caps groups
            at 256 members precisely to keep fan-out-on-write viable.
          </p>
        }
      />

      {/* Section 3: Full Architecture */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Send className="size-5 text-violet-400" />
          End-to-End Architecture
        </h2>
        <p className="text-sm text-muted-foreground">
          Play the simulation to follow a message through every component -- from
          encryption to delivery to the read receipt flowing back.
        </p>
        <ArchitecturePlayground />
      </section>

      <ConversationalCallout type="warning">
        Group chats amplify every problem. A 256-member group means 255 delivery operations per
        message. Offline users get messages via APNs/FCM push notifications. Discord servers
        with 500K+ members use pub/sub instead of per-user queues, trading ordering for scale.
      </ConversationalCallout>

      {/* Section 4: Presence */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Wifi className="size-5 text-violet-400" />
          Presence System
        </h2>
        <p className="text-sm text-muted-foreground">
          Watch users go online/offline and see heartbeat pings maintaining connection state.
          Going offline with 500 friends triggers 500 push notifications.
        </p>
        <PresencePlayground />
      </section>

      <AhaMoment
        question="How does Discord show real-time presence for servers with 500K+ members?"
        answer={
          <p>
            Discord uses &quot;lazy loading.&quot; You only receive presence updates for users
            visible in the member list sidebar or in your DMs. For large servers, it shows an
            online count, not individual statuses. This reduces fan-out from O(members x friends)
            to O(visible_members) -- orders of magnitude cheaper.
          </p>
        }
      />

      <ConversationalCallout type="tip">
        WhatsApp uses <strong>at-least-once</strong> delivery with client-side dedup by message ID
        for effective exactly-once. At-most-once (fire-and-forget) is unacceptable for chat.
        For storage, Cassandra partitioned by conversation_id and clustered by timestamp gives
        O(1) seek for the last N messages. Full-text search needs a separate Elasticsearch index.
      </ConversationalCallout>

      <KeyTakeaway
        points={[
          "WebSockets provide true real-time messaging. HTTP polling wastes 95% of bandwidth on empty responses.",
          "Gateway servers handle ~60K connections each. Redis maps each user to their gateway for cross-server routing.",
          "Fan-out-on-write works for small groups (WhatsApp: 256 limit). Fan-out-on-read scales to 500K+ (Discord model).",
          "Delivery states (sent/delivered/read) require ACKs at each hop -- this is the double-check-mark system.",
          "Presence is expensive: going offline with 500 friends means 500 push notifications. Lazy-load to reduce fan-out.",
          "At-least-once delivery + client-side dedup by message ID achieves effective exactly-once semantics.",
          "End-to-end encryption (Signal Protocol) means the server never sees plaintext -- only metadata.",
        ]}
      />
    </div>
  );
}
