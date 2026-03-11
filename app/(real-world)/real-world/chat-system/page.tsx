"use client";

import { useState, useEffect } from "react";
import { TopicHero } from "@/components/topic-hero";
import { FailureScenario } from "@/components/failure-scenario";
import { WhyItBreaks } from "@/components/why-it-breaks";
import { ConceptVisualizer } from "@/components/concept-visualizer";
import { CorrectApproach } from "@/components/correct-approach";
import { KeyTakeaway } from "@/components/key-takeaway";
import { AnimatedFlow } from "@/components/animated-flow";
import { ServerNode } from "@/components/server-node";
import { MetricCounter } from "@/components/metric-counter";
import { AhaMoment } from "@/components/aha-moment";
import { ConversationalCallout } from "@/components/conversational-callout";
import { BeforeAfter } from "@/components/before-after";
import { InteractiveDemo } from "@/components/interactive-demo";
import { ScaleSimulator } from "@/components/scale-simulator";
import { cn } from "@/lib/utils";
import { Wifi, WifiOff, Send, Check, CheckCheck, Eye, Clock, MessageSquare, Users, Globe, Zap, XCircle } from "lucide-react";

function WebSocketVsPollingViz() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((s) => (s + 1) % 20), 500);
    return () => clearInterval(t);
  }, []);

  const pollingRequests = Array.from({ length: 10 }, (_, i) => ({
    time: i * 2,
    hasMessage: i === 3 || i === 7,
  }));

  const wsMessages = [
    { time: 6, label: "Hello!" },
    { time: 14, label: "How are you?" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <p className="text-[11px] font-semibold text-orange-400">HTTP Polling (every 2s)</p>
        <div className="space-y-1">
          {pollingRequests.map((req, i) => {
            const isActive = tick >= req.time / 2;
            const isPast = tick > req.time / 2 + 1;
            return (
              <div key={i} className="flex items-center gap-2">
                <div className={cn(
                  "flex-1 h-5 rounded flex items-center justify-between px-2 text-[9px] font-mono transition-all duration-300 border",
                  !isActive ? "bg-muted/10 border-border/20 text-transparent" :
                  req.hasMessage
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    : isPast
                    ? "bg-red-500/5 border-red-500/10 text-red-400/60"
                    : "bg-orange-500/10 border-orange-500/20 text-orange-400"
                )}>
                  <span>GET /messages</span>
                  <span>{req.hasMessage ? "200 (1 msg)" : "200 (empty)"}</span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="text-[10px] text-muted-foreground/50 space-y-0.5">
          <p>10 requests sent, 8 returned empty</p>
          <p className="text-orange-400">80% wasted bandwidth</p>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-[11px] font-semibold text-emerald-400">WebSocket (persistent)</p>
        <div className="space-y-1">
          <div className={cn(
            "h-5 rounded flex items-center px-2 text-[9px] font-mono border transition-all",
            tick >= 1 ? "bg-blue-500/10 border-blue-500/20 text-blue-400" : "bg-muted/10 border-border/20 text-transparent"
          )}>
            Upgrade: websocket (1 handshake)
          </div>
          <div className={cn(
            "border-l-2 border-dashed ml-3 pl-3 space-y-1 transition-all",
            tick >= 2 ? "border-emerald-500/30" : "border-border/20"
          )}>
            {wsMessages.map((msg, i) => (
              <div key={i} className={cn(
                "h-5 rounded flex items-center px-2 text-[9px] font-mono border transition-all duration-500",
                tick >= msg.time / 2
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : "bg-muted/10 border-border/20 text-transparent"
              )}>
                PUSH: &quot;{msg.label}&quot;
              </div>
            ))}
            {tick >= 2 && tick < 18 && (
              <div className="h-5 flex items-center text-[9px] text-muted-foreground/30 font-mono animate-pulse">
                ... connection idle, waiting ...
              </div>
            )}
          </div>
        </div>
        <div className="text-[10px] text-muted-foreground/50 space-y-0.5">
          <p>1 connection, 2 messages pushed</p>
          <p className="text-emerald-400">Zero wasted requests</p>
        </div>
      </div>
    </div>
  );
}

function MessageDeliveryViz() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % 8), 1200);
    return () => clearInterval(t);
  }, []);

  const states = [
    { icon: <Clock className="size-3" />, label: "Queued", desc: "Message saved locally", color: "text-muted-foreground" },
    { icon: <Send className="size-3" />, label: "Sent", desc: "Delivered to server", color: "text-blue-400" },
    { icon: <Check className="size-3" />, label: "Delivered", desc: "Pushed to recipient device", color: "text-emerald-400" },
    { icon: <CheckCheck className="size-3" />, label: "Read", desc: "Recipient opened chat", color: "text-emerald-400" },
  ];

  const messages = [
    { text: "Hey, are you free tonight?", sender: true, deliveryState: Math.min(step, 3) },
    { text: "Sure! What time?", sender: false, deliveryState: step >= 5 ? Math.min(step - 4, 3) : -1 },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-muted/10 rounded-xl border border-border/30 p-4 space-y-3 max-w-sm mx-auto">
        <div className="text-[10px] text-center text-muted-foreground/50 font-medium">Chat Window</div>
        {messages.map((msg, i) => (
          msg.deliveryState >= 0 && (
            <div key={i} className={cn("flex", msg.sender ? "justify-end" : "justify-start")}>
              <div className={cn(
                "rounded-xl px-3 py-2 max-w-[80%] transition-all duration-500",
                msg.sender
                  ? "bg-blue-500/15 border border-blue-500/20 text-sm"
                  : "bg-muted/30 border border-border/50 text-sm"
              )}>
                <p className="text-xs">{msg.text}</p>
                {msg.sender && msg.deliveryState >= 0 && (
                  <div className={cn("flex items-center gap-1 justify-end mt-1 transition-all", states[msg.deliveryState].color)}>
                    {states[msg.deliveryState].icon}
                    <span className="text-[9px]">{states[msg.deliveryState].label}</span>
                  </div>
                )}
              </div>
            </div>
          )
        ))}
      </div>

      <div className="flex items-center justify-center gap-1">
        {states.map((s, i) => (
          <div key={s.label} className="flex items-center gap-1">
            <div className={cn(
              "flex items-center gap-1 rounded-full px-2 py-1 text-[9px] font-medium border transition-all",
              step >= i + 1
                ? `${s.color} bg-current/5 border-current/20`
                : "text-muted-foreground/30 border-border/20"
            )}>
              {s.icon}
              {s.label}
            </div>
            {i < states.length - 1 && <span className="text-muted-foreground/20 text-[10px]">→</span>}
          </div>
        ))}
      </div>
      <p className="text-[11px] text-muted-foreground/60 text-center">
        WhatsApp uses this exact pattern: single check = delivered to server, double check = delivered to device, blue double check = read.
      </p>
    </div>
  );
}

function PresenceSystemViz() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((s) => (s + 1) % 12), 1500);
    return () => clearInterval(t);
  }, []);

  const users = [
    { name: "Alice", online: true, lastSeen: "now", typing: tick >= 3 && tick <= 5 },
    { name: "Bob", online: tick < 8, lastSeen: tick >= 8 ? "2 min ago" : "now", typing: false },
    { name: "Charlie", online: false, lastSeen: "1 hour ago", typing: false },
    { name: "Diana", online: true, lastSeen: "now", typing: tick >= 9 && tick <= 11 },
  ];

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        {users.map((user) => (
          <div key={user.name} className="flex items-center gap-3 rounded-lg bg-muted/20 border border-border/30 px-3 py-2">
            <div className="relative">
              <div className="size-8 rounded-full bg-muted/50 flex items-center justify-center text-xs font-bold text-muted-foreground">
                {user.name[0]}
              </div>
              <div className={cn(
                "absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-background transition-all duration-500",
                user.online ? "bg-emerald-400" : "bg-muted-foreground/30"
              )} />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold">{user.name}</p>
              <p className={cn(
                "text-[10px] transition-all duration-300",
                user.typing ? "text-blue-400" :
                user.online ? "text-emerald-400" : "text-muted-foreground/50"
              )}>
                {user.typing ? "typing..." : user.online ? "Online" : `Last seen ${user.lastSeen}`}
              </p>
            </div>
            <div className="flex items-center gap-1">
              {user.online ? (
                <Wifi className="size-3.5 text-emerald-400/60" />
              ) : (
                <WifiOff className="size-3.5 text-muted-foreground/30" />
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-lg bg-orange-500/5 border border-orange-500/10 px-3 py-2">
        <p className="text-[10px] text-orange-400/80">
          <strong>Cost alert:</strong> When Bob goes offline (tick 8), the server must notify every user who has Bob in their
          contact list. If Bob has 500 friends, that is 500 push notifications for a single status change.
          WhatsApp throttles presence updates to reduce this N-fan-out cost.
        </p>
      </div>
    </div>
  );
}

function GatewayRoutingViz() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % 10), 800);
    return () => clearInterval(t);
  }, []);

  const gateways = [
    { label: "Gateway 1", users: ["Alice", "Bob", "Charlie"], connections: 52000 },
    { label: "Gateway 2", users: ["Diana", "Eve", "Frank"], connections: 48000 },
    { label: "Gateway 3", users: ["Grace", "Henry"], connections: 31000 },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {gateways.map((gw, i) => (
          <div key={gw.label} className={cn(
            "rounded-lg border p-3 text-center transition-all duration-300",
            step >= 2 && step <= 4 && i === 0 ? "bg-blue-500/10 border-blue-500/30 ring-1 ring-blue-500/20" :
            step >= 5 && step <= 7 && i === 1 ? "bg-emerald-500/10 border-emerald-500/30 ring-1 ring-emerald-500/20" :
            "bg-muted/20 border-border/30"
          )}>
            <p className="text-[10px] font-semibold">{gw.label}</p>
            <p className="text-[9px] text-muted-foreground/60">{gw.connections.toLocaleString()} connections</p>
            <div className="flex gap-1 justify-center mt-1.5">
              {gw.users.map((u) => (
                <span key={u} className="text-[8px] bg-muted/40 rounded px-1 py-0.5">{u}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className={cn(
        "flex items-center justify-center gap-2 text-[10px] font-mono transition-all duration-500",
        step >= 2 && step <= 7 ? "opacity-100" : "opacity-30"
      )}>
        <span className="text-blue-400">Alice (GW1)</span>
        <span className="text-muted-foreground/30">→ Kafka →</span>
        <span className="text-muted-foreground/50">Session Store: Diana → GW2</span>
        <span className="text-muted-foreground/30">→</span>
        <span className="text-emerald-400">Diana (GW2)</span>
      </div>

      <p className="text-[11px] text-muted-foreground/60 text-center">
        The session store (Redis) maps each user to their gateway server. When Alice messages Diana,
        the system looks up Diana&apos;s gateway and routes accordingly.
      </p>
    </div>
  );
}

export default function ChatSystemPage() {
  return (
    <div className="space-y-8">
      <TopicHero
        title="Design a Chat System"
        subtitle="Your users expect messages in milliseconds. HTTP polling every 5 seconds means your 'real-time' chat feels like email. WhatsApp delivers 100 billion messages per day — here's how."
        difficulty="advanced"
      />

      <FailureScenario title="Your 'real-time' chat has 3-second delays">
        <p className="text-sm text-muted-foreground">
          You build a chat app using standard HTTP request-response. The client polls the server
          every 3 seconds asking &quot;any new messages?&quot; With 10 million connected users,
          that is <strong>3.3 million requests per second</strong> — mostly returning empty
          responses. Messages feel laggy, battery drains on mobile, and your server bill is
          astronomical. Users switch to WhatsApp.
        </p>
        <div className="grid grid-cols-3 gap-3 pt-2">
          <MetricCounter label="Polling Requests" value={3300000} unit="req/s" trend="up" />
          <MetricCounter label="Empty Responses" value={95} unit="%" trend="up" />
          <MetricCounter label="Message Latency" value={1500} unit="ms avg" trend="up" />
        </div>
        <div className="flex items-center justify-center gap-4 pt-3">
          <ServerNode type="client" label="10M Users" sublabel="polling every 3s" />
          <span className="text-orange-400 text-xs font-mono">3.3M req/s</span>
          <ServerNode type="server" label="API Server" sublabel="95% empty responses" status="warning" />
          <span className="text-red-500 text-xs font-mono">overwhelmed</span>
          <ServerNode type="database" label="DB" sublabel="unnecessary reads" status="unhealthy" />
        </div>
      </FailureScenario>

      <WhyItBreaks title="HTTP was designed for request-response, not real-time push">
        <p className="text-sm text-muted-foreground">
          HTTP is fundamentally client-initiated: the server cannot send data unless the client asks.
          For chat, you need the server to <strong>push</strong> data the instant it arrives. Polling
          wastes bandwidth on empty checks and introduces latency equal to half the polling interval
          on average. Long-polling (holding the connection open until data arrives) is better but still
          creates connection churn — every message requires a new HTTP request.
        </p>
        <div className="grid grid-cols-2 gap-2 mt-3">
          {[
            { n: "1", label: "Polling Waste", desc: "95% of requests return no data" },
            { n: "2", label: "Latency Floor", desc: "Avg delay = polling interval / 2" },
            { n: "3", label: "Battery Drain", desc: "Constant radio wake-ups on mobile" },
            { n: "4", label: "Connection Churn", desc: "Long-poll reconnects per message" },
          ].map((item) => (
            <div key={item.n} className="flex items-start gap-2.5 rounded-lg bg-muted/30 p-3">
              <span className="text-xs font-mono font-bold text-orange-400 bg-orange-500/10 rounded-md size-6 flex items-center justify-center shrink-0">
                {item.n}
              </span>
              <div>
                <p className="text-xs font-semibold">{item.label}</p>
                <p className="text-[11px] text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </WhyItBreaks>

      <ConceptVisualizer title="WebSocket vs Polling — Side by Side">
        <p className="text-sm text-muted-foreground mb-4">
          A WebSocket starts as a normal HTTP request, then &quot;upgrades&quot; to a persistent,
          bidirectional connection. The server can push messages instantly without the client asking.
          Watch the difference in real time:
        </p>
        <WebSocketVsPollingViz />
        <BeforeAfter
          before={{
            title: "HTTP Polling",
            content: (
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>Client asks server every N seconds</li>
                <li>95% of responses are empty</li>
                <li>Average latency = N/2 seconds</li>
                <li>3.3M req/s for 10M users (3s poll)</li>
                <li>Simple to implement</li>
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
                <li>Requires connection state management</li>
              </ul>
            ),
          }}
        />
      </ConceptVisualizer>

      <ConceptVisualizer title="Message Delivery States">
        <p className="text-sm text-muted-foreground mb-4">
          WhatsApp pioneered the sent/delivered/read receipt pattern that users now expect in every
          chat app. Each state requires a different acknowledgment from a different part of the system.
          Here is how the double-check marks actually work:
        </p>
        <MessageDeliveryViz />
        <ConversationalCallout type="question">
          How does &quot;delivered&quot; work when the recipient is offline? The message is stored in a
          persistent queue (WhatsApp uses Mnesia on their custom Ejabberd servers). When the
          recipient&apos;s device reconnects, it pulls pending messages and sends a delivery ACK back
          to the server, which relays it to the sender. The &quot;single check → double check&quot;
          transition can happen hours later.
        </ConversationalCallout>
      </ConceptVisualizer>

      <CorrectApproach title="Production Chat Architecture">
        <p className="text-sm text-muted-foreground mb-4">
          Clients maintain WebSocket connections to gateway servers. WhatsApp&apos;s custom Ejabberd
          (Erlang-based) servers handle ~60,000 concurrent connections each. When User A sends a message,
          the gateway publishes it to a message queue. The recipient&apos;s gateway server consumes
          it and pushes it down the WebSocket. If the recipient is offline, the message is stored
          for later delivery. End-to-end encryption (Signal Protocol) means the server never sees
          plaintext.
        </p>
        <div className="flex flex-col items-center gap-6">
          <div className="flex gap-4 flex-wrap justify-center">
            <ServerNode type="client" label="User A" sublabel="sender (encrypted)" />
            <ServerNode type="client" label="User B" sublabel="recipient" />
          </div>
          <div className="flex gap-4 flex-wrap justify-center">
            <ServerNode type="server" label="WS Gateway 1" sublabel="~60K connections" status="healthy" />
            <ServerNode type="server" label="WS Gateway 2" sublabel="~60K connections" status="healthy" />
            <ServerNode type="server" label="WS Gateway 3" sublabel="~60K connections" status="healthy" />
          </div>
          <ServerNode type="cloud" label="Message Queue (Kafka)" sublabel="ordered, durable, partitioned" status="healthy" />
          <div className="flex gap-4 flex-wrap justify-center">
            <ServerNode type="cache" label="Session Store (Redis)" sublabel="user → gateway mapping" status="healthy" />
            <ServerNode type="database" label="Message Store" sublabel="Cassandra (write-optimized)" status="healthy" />
          </div>
          <div className="flex gap-4 flex-wrap justify-center">
            <ServerNode type="server" label="Push Notification" sublabel="APNs / FCM for offline users" status="healthy" />
            <ServerNode type="database" label="User/Group Metadata" sublabel="MySQL / PostgreSQL" status="healthy" />
          </div>
        </div>
      </CorrectApproach>

      <ConceptVisualizer title="Gateway Routing — Finding the Right Server">
        <p className="text-sm text-muted-foreground mb-4">
          With 10 million users spread across 200+ gateway servers, how does a message from Alice
          find Diana? The session store (Redis) maintains a real-time mapping of every connected user
          to their gateway server. Here is the routing in action:
        </p>
        <GatewayRoutingViz />
      </ConceptVisualizer>

      <ConceptVisualizer title="Message Routing Flow">
        <AnimatedFlow
          steps={[
            { id: "send", label: "User A Sends", description: "Encrypted message via WebSocket to Gateway 1", icon: <Send className="size-4" /> },
            { id: "store", label: "Persist Message", description: "Write to Cassandra for durability", icon: <MessageSquare className="size-4" /> },
            { id: "publish", label: "Publish to Kafka", description: "Topic: user-B-inbox, ordered by timestamp", icon: <Zap className="size-4" /> },
            { id: "lookup", label: "Lookup Recipient", description: "Redis: User B → Gateway 2", icon: <Globe className="size-4" /> },
            { id: "route", label: "Route to Gateway", description: "Kafka consumer on Gateway 2 picks it up", icon: <Wifi className="size-4" /> },
            { id: "deliver", label: "Push to User B", description: "WebSocket push + delivery ACK sent back", icon: <CheckCheck className="size-4" /> },
          ]}
          interval={1500}
        />
      </ConceptVisualizer>

      <ConceptVisualizer title="Presence System — Who Is Online?">
        <p className="text-sm text-muted-foreground mb-4">
          Presence tracking looks simple but is surprisingly expensive at scale. If a user has 500
          friends and goes offline, you must notify 500 people. Multiply by millions of
          connect/disconnect events per second, and you have a storm of fan-out writes. Here is how
          WhatsApp and Discord handle it differently:
        </p>
        <PresenceSystemViz />
        <AhaMoment
          question="How does Discord show real-time presence for servers with 500K+ members?"
          answer={
            <p>
              Discord uses a &quot;lazy loading&quot; approach. You only receive presence updates for
              users visible in the member list or in your DMs. For large servers, the sidebar shows
              a count of online members, not individual statuses. This reduces presence fan-out from
              O(members x friends) to O(visible_members) — orders of magnitude cheaper.
            </p>
          }
        />
      </ConceptVisualizer>

      <ConceptVisualizer title="Message Delivery Guarantees">
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                title: "At-Most-Once",
                desc: "Fire and forget. Message might be lost if the gateway crashes. Unacceptable for chat.",
                color: "border-red-500/20 bg-red-500/5",
                tag: "Unsuitable",
                tagColor: "text-red-400",
              },
              {
                title: "At-Least-Once",
                desc: "Retry until acknowledged. Recipient might see duplicates. Use a unique message ID to deduplicate — this is what WhatsApp does.",
                color: "border-emerald-500/20 bg-emerald-500/5",
                tag: "WhatsApp uses this",
                tagColor: "text-emerald-400",
              },
              {
                title: "Exactly-Once",
                desc: "Theoretically impossible in distributed systems. In practice, at-least-once + idempotent dedup achieves effective exactly-once.",
                color: "border-blue-500/20 bg-blue-500/5",
                tag: "Theoretical ideal",
                tagColor: "text-blue-400",
              },
            ].map((g) => (
              <div key={g.title} className={cn("rounded-lg border p-3 space-y-1.5", g.color)}>
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold">{g.title}</h4>
                  <span className={cn("text-[9px] font-medium", g.tagColor)}>{g.tag}</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{g.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </ConceptVisualizer>

      <ScaleSimulator
        title="Connection & Gateway Simulator"
        min={10000}
        max={50000000}
        step={50000}
        unit="concurrent users"
        metrics={(v) => [
          { label: "Gateway Servers", value: Math.max(1, Math.ceil(v / 60000)), unit: "servers" },
          { label: "Messages/sec (est.)", value: Math.round(v * 0.02), unit: "msg/s" },
          { label: "Kafka Partitions", value: Math.max(3, Math.ceil(v / 100000)), unit: "partitions" },
          { label: "Redis Memory", value: Math.round(v * 0.0001), unit: "MB" },
          { label: "Presence Events/s", value: Math.round(v * 0.001), unit: "events/s" },
          { label: "Push Notifications/s", value: Math.round(v * 0.005), unit: "notif/s" },
        ]}
      >
        {({ value }) => (
          <p className="text-xs text-muted-foreground">
            {value < 100000
              ? `At ${value.toLocaleString()} users, ${Math.ceil(value / 60000)} gateway servers handle all connections. A single Kafka cluster and Redis node suffice.`
              : value < 1000000
              ? `At ${(value / 1000).toFixed(0)}K users, you need ${Math.ceil(value / 60000)} gateways. Message throughput is ~${Math.round(value * 0.02).toLocaleString()} msg/s — a 3-broker Kafka cluster handles this.`
              : `At ${(value / 1000000).toFixed(1)}M users (WhatsApp-scale), you need ${Math.ceil(value / 60000)} gateways, a multi-datacenter Kafka deployment, and Redis cluster for session routing. Presence must be throttled aggressively.`}
          </p>
        )}
      </ScaleSimulator>

      <InteractiveDemo title="Trace a Message End-to-End">
        {({ isPlaying, tick }) => {
          const stages = [
            { name: "Encrypt", time: "~1ms", desc: "Signal Protocol: E2E encryption on sender device" },
            { name: "WS Send", time: "~5ms", desc: "Binary frame via WebSocket to Gateway 1" },
            { name: "Persist", time: "~8ms", desc: "Write to Cassandra (partition: conversation_id)" },
            { name: "Kafka", time: "~3ms", desc: "Publish to recipient's inbox topic" },
            { name: "Route", time: "~1ms", desc: "Redis lookup: recipient → Gateway 2" },
            { name: "WS Push", time: "~5ms", desc: "Push encrypted message to recipient" },
            { name: "Decrypt", time: "~1ms", desc: "Signal Protocol: decrypt on recipient device" },
            { name: "ACK", time: "~5ms", desc: "Delivery receipt sent back to sender" },
          ];
          const active = isPlaying ? Math.min(tick % 10, stages.length) : 0;

          return (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Press play to follow a message from Alice to Bob, including encryption and delivery acknowledgment.
              </p>
              <div className="space-y-1.5">
                {stages.map((stage, i) => (
                  <div
                    key={stage.name}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border px-3 py-2 transition-all duration-400",
                      i < active
                        ? "bg-emerald-500/8 border-emerald-500/20"
                        : i === active && isPlaying
                        ? "bg-blue-500/8 border-blue-500/20 ring-1 ring-blue-500/15"
                        : "bg-muted/10 border-border/30 text-muted-foreground/40"
                    )}
                  >
                    <span className={cn(
                      "text-xs font-mono font-bold w-16",
                      i < active ? "text-emerald-400" : i === active && isPlaying ? "text-blue-400" : ""
                    )}>
                      {stage.name}
                    </span>
                    <div className="flex-1 text-xs text-muted-foreground truncate">
                      {i < active ? stage.desc : "—"}
                    </div>
                    <span className={cn(
                      "text-[10px] font-mono shrink-0",
                      i < active ? "text-muted-foreground" : "text-transparent"
                    )}>
                      {stage.time}
                    </span>
                  </div>
                ))}
              </div>
              {active >= stages.length && (
                <ConversationalCallout type="tip">
                  Total end-to-end: ~29ms. The server never sees the plaintext message thanks to
                  Signal Protocol encryption. Even if WhatsApp&apos;s servers are compromised, message
                  content remains private. The server only knows metadata: who messaged whom and when.
                </ConversationalCallout>
              )}
            </div>
          );
        }}
      </InteractiveDemo>

      <ConversationalCallout type="tip">
        For message storage, WhatsApp originally used Mnesia (Erlang&apos;s built-in database) but
        modern chat systems prefer Cassandra. The access pattern is perfect: partition by conversation
        ID, cluster by timestamp. Fetching the last 50 messages in a chat is a single partition scan
        — O(1) seek + O(50) read, regardless of conversation length.
      </ConversationalCallout>

      <ConversationalCallout type="warning">
        Group chats amplify every problem. A message in a 256-member group (WhatsApp&apos;s limit)
        requires 255 delivery operations. Discord servers can have 500K+ members — they solve this
        by not guaranteeing delivery order for large groups and using a pub/sub model instead of
        per-user message queues.
      </ConversationalCallout>

      <ConceptVisualizer title="Group Messaging — Fan-Out-on-Write vs Fan-Out-on-Read">
        <p className="text-sm text-muted-foreground mb-4">
          When Alice sends a message to a group of 100 members, should you copy the message to each
          recipient&apos;s inbox (fan-out-on-write) or store it once and have each recipient read from
          the shared channel (fan-out-on-read)? The answer depends on group size.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4 space-y-3">
            <h4 className="text-xs font-bold text-blue-400">Fan-Out-on-Write (WhatsApp model)</h4>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Copy the message into each recipient&apos;s personal inbox queue. When Bob opens the app,
              his messages are already waiting — <strong>read is O(1)</strong>.
            </p>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[10px]">
                <CheckCheck className="size-3 text-emerald-400" />
                <span className="text-muted-foreground">Fast reads — messages pre-delivered</span>
              </div>
              <div className="flex items-center gap-2 text-[10px]">
                <CheckCheck className="size-3 text-emerald-400" />
                <span className="text-muted-foreground">Simple offline sync — pull from inbox</span>
              </div>
              <div className="flex items-center gap-2 text-[10px]">
                <XCircle className="size-3 text-red-400" />
                <span className="text-muted-foreground">Write amplification: 1 msg → 100 writes</span>
              </div>
              <div className="flex items-center gap-2 text-[10px]">
                <XCircle className="size-3 text-red-400" />
                <span className="text-muted-foreground">Impractical for large groups (500K+)</span>
              </div>
            </div>
            <p className="text-[10px] text-blue-400/70 font-medium">Best for: small groups (up to ~256 members)</p>
          </div>
          <div className="rounded-lg border border-violet-500/20 bg-violet-500/5 p-4 space-y-3">
            <h4 className="text-xs font-bold text-violet-400">Fan-Out-on-Read (Discord model)</h4>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Store the message once in the channel. When Bob opens the channel, read the latest
              messages from the shared store — <strong>write is O(1)</strong>.
            </p>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[10px]">
                <CheckCheck className="size-3 text-emerald-400" />
                <span className="text-muted-foreground">Efficient writes — store once</span>
              </div>
              <div className="flex items-center gap-2 text-[10px]">
                <CheckCheck className="size-3 text-emerald-400" />
                <span className="text-muted-foreground">Scales to 500K+ member channels</span>
              </div>
              <div className="flex items-center gap-2 text-[10px]">
                <XCircle className="size-3 text-red-400" />
                <span className="text-muted-foreground">Read amplification: each reader queries</span>
              </div>
              <div className="flex items-center gap-2 text-[10px]">
                <XCircle className="size-3 text-red-400" />
                <span className="text-muted-foreground">Harder offline sync — needs cursor tracking</span>
              </div>
            </div>
            <p className="text-[10px] text-violet-400/70 font-medium">Best for: large groups / public channels</p>
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground/60 mt-3 text-center">
          The tradeoff: write amplification (fan-out-on-write) vs read amplification (fan-out-on-read).
          Most production systems use a hybrid — fan-out-on-write for small groups, fan-out-on-read for large channels.
        </p>
      </ConceptVisualizer>

      <ConversationalCallout type="question">
        Full-text search over chat history requires a separate search index (Elasticsearch/OpenSearch).
        Cassandra&apos;s time-series storage is great for timeline reads but terrible for keyword search.
        This is a common follow-up question in system design interviews — mention the need for a
        dedicated search service that indexes messages asynchronously via a Kafka consumer.
      </ConversationalCallout>

      <ConversationalCallout type="tip">
        When a user is offline, the message goes to APNs (iOS) or FCM (Android) for push delivery.
        This adds a notification service to the architecture that must handle device tokens, delivery
        receipts, and silent notifications. The notification service consumes from the same Kafka topic
        as the gateway servers but only fires for users whose session store entry shows &quot;offline.&quot;
      </ConversationalCallout>

      <KeyTakeaway
        points={[
          "WebSockets provide true real-time messaging. HTTP polling wastes 95% of bandwidth on empty responses.",
          "WhatsApp's gateway servers handle ~60K connections each using Erlang/BEAM — each user maps to one gateway via Redis.",
          "Message delivery uses at-least-once semantics with client-side dedup by message ID for effective exactly-once.",
          "Delivery states (sent/delivered/read) require ACKs at each hop — this is the double-check-mark system users expect.",
          "Presence is expensive at scale. Discord lazy-loads it; WhatsApp throttles to 'last seen' timestamps.",
          "End-to-end encryption (Signal Protocol) means the server never sees message content — only metadata.",
          "Store messages in Cassandra, partitioned by conversation_id, clustered by timestamp for O(1) lookups.",
        ]}
      />
    </div>
  );
}
