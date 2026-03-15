"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { TopicHero } from "@/components/topic-hero";
import { KeyTakeaway } from "@/components/key-takeaway";
import { WhyCare } from "@/components/why-care";
import { GlossaryTerm } from "@/components/glossary-term";
import { TopicQuiz } from "@/components/topic-quiz";
import { AhaMoment } from "@/components/aha-moment";
import { ConversationalCallout } from "@/components/conversational-callout";
import { BeforeAfter } from "@/components/before-after";
import { FlowDiagram, type FlowNode, type FlowEdge } from "@/components/flow-diagram";
import { LiveChart } from "@/components/live-chart";
import { Playground } from "@/components/playground";
import { useSimulation } from "@/hooks/use-simulation";
import { cn } from "@/lib/utils";
import {
  Bell,
  Smartphone,
  Mail,
  MessageSquare,
  Users,
  Zap,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Shield,
} from "lucide-react";

type Channel = "push" | "email" | "sms";
type Priority = "urgent" | "normal" | "low";

const CHANNEL_CONFIG: Record<Channel, { label: string; color: string; icon: React.ReactNode; limit: string }> = {
  push:  { label: "Push",  color: "text-blue-400",    icon: <Smartphone className="size-3.5" />, limit: "5/hr" },
  email: { label: "Email", color: "text-violet-400",  icon: <Mail className="size-3.5" />,        limit: "2/day" },
  sms:   { label: "SMS",   color: "text-amber-400",   icon: <MessageSquare className="size-3.5" />, limit: "1/day" },
};

const PRIORITY_ROUTING: Record<Priority, Channel[]> = {
  urgent: ["push", "sms", "email"],
  normal: ["push", "email"],
  low:    ["push"],
};

type FlowStep =
  | "idle"
  | "api"
  | "service"
  | "queue"
  | "push-worker"
  | "sms-worker"
  | "email-worker"
  | "push-provider"
  | "sms-provider"
  | "email-provider"
  | "devices";

const PIPELINE_STEPS: FlowStep[] = [
  "idle", "api", "service", "queue",
  "push-worker", "sms-worker", "email-worker",
  "push-provider", "sms-provider", "email-provider",
  "devices",
];

function buildRoutingNodes(
  step: FlowStep,
  channels: Channel[],
  priority: Priority
): FlowNode[] {
  const active = (id: FlowStep) =>
    PIPELINE_STEPS.indexOf(step) >= PIPELINE_STEPS.indexOf(id) && step !== "idle"
      ? "healthy"
      : "idle";

  const workerActive = (ch: Channel) =>
    channels.includes(ch) && PIPELINE_STEPS.indexOf(step) >= PIPELINE_STEPS.indexOf(`${ch}-worker` as FlowStep)
      ? "healthy" : "idle";

  const providerActive = (ch: Channel) =>
    channels.includes(ch) && PIPELINE_STEPS.indexOf(step) >= PIPELINE_STEPS.indexOf(`${ch}-provider` as FlowStep)
      ? "healthy" : "idle";

  const priorityLabel = priority === "urgent" ? "URGENT" : priority === "normal" ? "NORMAL" : "LOW";

  return [
    { id: "client",  type: "clientNode",  position: { x: 10,  y: 130 }, data: { label: "Event Source",      sublabel: "App / API trigger",         status: active("api"),          handles: { right: true } } },
    { id: "api",     type: "gatewayNode", position: { x: 175, y: 130 }, data: { label: "API Gateway",       sublabel: "Rate limit & auth",         status: active("api"),          handles: { left: true, right: true } } },
    { id: "service", type: "serverNode",  position: { x: 345, y: 130 }, data: { label: "Notification Svc",  sublabel: `Priority: ${priorityLabel}`,status: active("service"),      handles: { left: true, bottom: true } } },
    { id: "queue",   type: "queueNode",   position: { x: 345, y: 255 }, data: { label: "Priority Queue",    sublabel: "Kafka / SQS",               status: active("queue"),        handles: { top: true, left: true, right: true } } },
    { id: "pw",      type: "serverNode",  position: { x: 10,  y: 390 }, data: { label: "Push Worker",       sublabel: "Batch up to 1K",            status: workerActive("push"),   handles: { top: true, bottom: true } } },
    { id: "sw",      type: "serverNode",  position: { x: 175, y: 390 }, data: { label: "SMS Worker",        sublabel: "Twilio / SNS",              status: workerActive("sms"),    handles: { top: true, bottom: true } } },
    { id: "ew",      type: "serverNode",  position: { x: 345, y: 390 }, data: { label: "Email Worker",      sublabel: "SES / SendGrid",            status: workerActive("email"),  handles: { top: true, bottom: true } } },
    { id: "apns",    type: "serverNode",  position: { x: 10,  y: 510 }, data: { label: "APNs / FCM",        sublabel: "iOS & Android",             status: providerActive("push"), handles: { top: true, bottom: true } } },
    { id: "sms",     type: "serverNode",  position: { x: 175, y: 510 }, data: { label: "Twilio",            sublabel: "SMS gateway",               status: providerActive("sms"),  handles: { top: true, bottom: true } } },
    { id: "ses",     type: "serverNode",  position: { x: 345, y: 510 }, data: { label: "SES",               sublabel: "Email delivery",            status: providerActive("email"),handles: { top: true, bottom: true } } },
    { id: "device",  type: "clientNode",  position: { x: 175, y: 630 }, data: { label: "User Devices",      sublabel: "All channels delivered",    status: step === "devices" ? "healthy" : "idle", handles: { top: true } } },
  ];
}

function buildRoutingEdges(channels: Channel[], step: FlowStep): FlowEdge[] {
  const pipelinePast = (s: FlowStep) =>
    PIPELINE_STEPS.indexOf(step) >= PIPELINE_STEPS.indexOf(s) && step !== "idle";

  const edges: FlowEdge[] = [
    { id: "e-c-api",  source: "client",  target: "api",     animated: pipelinePast("api") },
    { id: "e-api-svc",source: "api",     target: "service", animated: pipelinePast("service") },
    { id: "e-svc-q",  source: "service", target: "queue",   animated: pipelinePast("queue") },
  ];

  if (channels.includes("push")) {
    edges.push({ id: "e-q-pw",   source: "queue", target: "pw",   animated: pipelinePast("push-worker") });
    edges.push({ id: "e-pw-apns",source: "pw",    target: "apns", animated: pipelinePast("push-provider") });
    edges.push({ id: "e-apns-d", source: "apns",  target: "device", animated: step === "devices" });
  }
  if (channels.includes("sms")) {
    edges.push({ id: "e-q-sw",   source: "queue", target: "sw",  animated: pipelinePast("sms-worker") });
    edges.push({ id: "e-sw-sms", source: "sw",    target: "sms", animated: pipelinePast("sms-provider") });
    edges.push({ id: "e-sms-d",  source: "sms",   target: "device", animated: step === "devices" });
  }
  if (channels.includes("email")) {
    edges.push({ id: "e-q-ew",  source: "queue", target: "ew",  animated: pipelinePast("email-worker") });
    edges.push({ id: "e-ew-ses",source: "ew",    target: "ses", animated: pipelinePast("email-provider") });
    edges.push({ id: "e-ses-d", source: "ses",   target: "device", animated: step === "devices" });
  }

  return edges;
}

function ChannelRoutingPlayground() {
  const [priority, setPriority] = useState<Priority>("urgent");
  const [sent, setSent] = useState(false);
  const [flowStep, setFlowStep] = useState<FlowStep>("idle");

  const channels = PRIORITY_ROUTING[priority];

  const sim = useSimulation({
    intervalMs: 800,
    maxSteps: PIPELINE_STEPS.length - 1,
    onReset: () => {
      setFlowStep("idle");
      setSent(false);
    },
  });

  useEffect(() => {
    if (sim.isPlaying || sim.step > 0) {
      setFlowStep(PIPELINE_STEPS[Math.min(sim.step, PIPELINE_STEPS.length - 1)]);
    }
  }, [sim.step, sim.isPlaying]);

  const handleSend = useCallback(() => {
    setSent(true);
    sim.reset();
    setTimeout(() => sim.play(), 50);
  }, [sim]);

  const nodes = useMemo(
    () => buildRoutingNodes(flowStep, channels, priority),
    [flowStep, channels, priority]
  );
  const edges = useMemo(
    () => buildRoutingEdges(channels, flowStep),
    [channels, flowStep]
  );

  const stepLabel =
    flowStep === "idle"    ? "Configure and hit Send"
    : flowStep === "api"   ? "Received at API Gateway..."
    : flowStep === "service" ? "Notification Service routing by priority..."
    : flowStep === "queue" ? "Enqueued on Priority Queue (Kafka)..."
    : flowStep === "push-worker"  ? "Push Worker batching tokens..."
    : flowStep === "sms-worker"   ? "SMS Worker queuing sends..."
    : flowStep === "email-worker" ? "Email Worker composing templates..."
    : flowStep === "push-provider"  ? "APNs / FCM delivering push..."
    : flowStep === "sms-provider"   ? "Twilio dispatching SMS..."
    : flowStep === "email-provider" ? "SES dispatching email..."
    : "All channels delivered to device";

  return (
    <Playground
      title="Channel Routing Playground"
      simulation={sim}
      canvasHeight="min-h-[400px]"
      hints={["Choose a priority level, then click Send Notification to watch the event flow through all active channels"]}
      canvas={
        <FlowDiagram
          nodes={nodes}
          edges={edges}
          allowDrag={false}
          minHeight={400}
          fitView
        />
      }
      explanation={
        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold text-foreground mb-2">1. Choose priority</p>
            <div className="flex gap-2 flex-wrap">
              {(["urgent", "normal", "low"] as Priority[]).map((p) => (
                <button
                  key={p}
                  onClick={() => { setPriority(p); sim.reset(); setSent(false); setFlowStep("idle"); }}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-xs font-medium border capitalize transition-all",
                    priority === p
                      ? p === "urgent"
                        ? "bg-red-500/10 border-red-500/30 text-red-400"
                        : p === "normal"
                        ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                        : "bg-muted/20 border-border/40 text-muted-foreground"
                      : "bg-muted/20 border-border/30 text-muted-foreground/50 hover:text-muted-foreground"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-foreground mb-2">2. Active channels</p>
            <div className="space-y-1.5">
              {(["push", "email", "sms"] as Channel[]).map((ch) => {
                const cfg = CHANNEL_CONFIG[ch];
                const on = channels.includes(ch);
                return (
                  <div key={ch} className={cn(
                    "flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-[11px] transition-all",
                    on ? "border-border/40 bg-muted/20" : "border-border/20 opacity-30"
                  )}>
                    <span className={cfg.color}>{cfg.icon}</span>
                    <span className={cn("font-medium", on ? "text-foreground" : "text-muted-foreground")}>{cfg.label}</span>
                    <span className="ml-auto font-mono text-muted-foreground">{cfg.limit}</span>
                    {on
                      ? <CheckCircle2 className="size-3 text-emerald-400" />
                      : <XCircle className="size-3 text-muted-foreground/30" />}
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-foreground mb-2">3. Fire it</p>
            <button
              onClick={handleSend}
              className="w-full rounded-md bg-violet-500/20 border border-violet-500/30 text-violet-400 text-xs font-medium py-2 hover:bg-violet-500/30 transition-colors flex items-center justify-center gap-1.5"
            >
              <Zap className="size-3.5" />
              Send Notification
            </button>
          </div>

          <div className={cn(
            "rounded-md border px-3 py-2 text-[11px] font-mono transition-all",
            flowStep === "devices"
              ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-400"
              : sent
              ? "border-violet-500/20 bg-violet-500/5 text-violet-400"
              : "border-border/20 text-muted-foreground/40"
          )}>
            {stepLabel}
          </div>

          <p className="text-[11px] text-muted-foreground/70">
            Priority drives fan-out width. Urgent alerts use 3 channels for redundancy. Low-priority stays
            push-only to avoid interrupting users.
          </p>
        </div>
      }
      controls={false}
    />
  );
}

type FanoutUser = {
  id: number;
  name: string;
  channels: Channel[];
  delivered: Channel[];
};

const FANOUT_USERS: FanoutUser[] = [
  { id: 1, name: "alice",   channels: ["push", "email"],       delivered: [] },
  { id: 2, name: "bob",     channels: ["push", "sms"],         delivered: [] },
  { id: 3, name: "carol",   channels: ["email"],               delivered: [] },
  { id: 4, name: "dan",     channels: ["push", "sms", "email"],delivered: [] },
  { id: 5, name: "eve",     channels: ["push"],                delivered: [] },
];

function FanoutPlayground() {
  const [users, setUsers] = useState<FanoutUser[]>(FANOUT_USERS);
  const [fired, setFired] = useState(false);

  const sim = useSimulation({
    intervalMs: 500,
    maxSteps: 6,
    onReset: () => {
      setUsers(FANOUT_USERS.map((u) => ({ ...u, delivered: [] })));
      setFired(false);
    },
  });

  useEffect(() => {
    if (sim.step === 0) return;
    setUsers((prev) =>
      prev.map((u) => {
        const deliverCount = Math.min(sim.step, u.channels.length);
        return { ...u, delivered: u.channels.slice(0, deliverCount) };
      })
    );
  }, [sim.step]);

  const handleFire = () => {
    setFired(true);
    sim.reset();
    setTimeout(() => sim.play(), 50);
  };

  const totalDelivered = users.reduce((s, u) => s + u.delivered.length, 0);
  const totalPossible = users.reduce((s, u) => s + u.channels.length, 0);

  const fanoutData = [
    { t: "0s", push: 0, email: 0, sms: 0 },
    { t: "0.5s", push: 3, email: 0, sms: 0 },
    { t: "1s", push: 4, email: 2, sms: 1 },
    { t: "1.5s", push: 5, email: 3, sms: 2 },
    { t: "2s", push: 5, email: 4, sms: 2 },
    { t: "2.5s", push: 5, email: 4, sms: 2 },
  ];

  return (
    <Playground
      title="Fan-out Demo: 1 Event → N Users × M Channels"
      simulation={sim}
      canvasHeight="min-h-[300px]"
      hints={["Click Fire Event to see one notification fan out to 5 users across their preferred channels"]}
      canvas={
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-muted-foreground">Event: <span className="text-violet-400">breaking_news_published</span></span>
            <button onClick={handleFire} className="flex items-center gap-1.5 rounded-md bg-violet-500/20 border border-violet-500/30 text-violet-400 text-xs font-medium px-3 py-1.5 hover:bg-violet-500/30 transition-colors">
              <Zap className="size-3" />Fire Event
            </button>
          </div>

          <div className="space-y-2">
            {users.map((u) => (
              <div key={u.id} className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 w-20">
                  <Users className="size-3 text-muted-foreground/50" />
                  <span className="text-[11px] font-mono text-muted-foreground">{u.name}</span>
                </div>
                <div className="flex gap-1.5 flex-1">
                  {u.channels.map((ch) => {
                    const cfg = CHANNEL_CONFIG[ch];
                    const done = u.delivered.includes(ch);
                    return (
                      <div
                        key={ch}
                        className={cn(
                          "flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-medium transition-all duration-300",
                          done
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                            : "border-border/20 bg-muted/10 text-muted-foreground/40"
                        )}
                      >
                        <span className={done ? "text-emerald-400" : cfg.color}>{cfg.icon}</span>
                        {cfg.label}
                      </div>
                    );
                  })}
                </div>
                <div className="text-[10px] font-mono text-muted-foreground/50 w-12 text-right">
                  {u.delivered.length}/{u.channels.length}
                </div>
              </div>
            ))}
          </div>

          <div className={cn(
            "flex items-center justify-between rounded-md border px-3 py-2 text-xs font-mono transition-all",
            totalDelivered === totalPossible && fired
              ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-400"
              : "border-border/20 text-muted-foreground/50"
          )}>
            <span>Deliveries</span>
            <span>{totalDelivered} / {totalPossible}</span>
          </div>

          <LiveChart
            type="area"
            data={fanoutData.slice(0, Math.max(1, sim.step + 1))}
            dataKeys={{ x: "t", y: ["push", "email", "sms"], label: ["Push", "Email", "SMS"] }}
            height={140}
            unit="users"
          />
        </div>
      }
      explanation={
        <div className="space-y-3">
          <p>One event fans out to <strong className="text-foreground">5 users × multiple channels</strong>. The router reads user preferences and dispatches workers in parallel.</p>
          <div className="space-y-1.5">
            {[
              { label: "1 event published", color: "text-violet-400" },
              { label: `${FANOUT_USERS.length} preference lookups`, color: "text-blue-400" },
              { label: `${totalPossible} deliveries dispatched`, color: "text-emerald-400" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <ArrowRight className="size-3 text-muted-foreground/40" />
                <span className={cn("text-[11px] font-mono", item.color)}>{item.label}</span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground/70">Push arrives first (persistent connection). Email and SMS follow asynchronously.</p>
        </div>
      }
    />
  );
}

type NotifEntry = { id: string; channel: Channel; time: string; status: "sent" | "throttled" | "dedup" };

const SCHEDULE: NotifEntry[] = [
  { id: "n1",  channel: "push",  time: "09:00", status: "sent" },
  { id: "n2",  channel: "push",  time: "09:20", status: "sent" },
  { id: "n3",  channel: "push",  time: "09:40", status: "sent" },
  { id: "n4",  channel: "email", time: "10:00", status: "sent" },
  { id: "n5",  channel: "push",  time: "10:10", status: "sent" },
  { id: "n5b", channel: "push",  time: "10:10", status: "dedup" },
  { id: "n6",  channel: "push",  time: "10:30", status: "sent" },
  { id: "n7",  channel: "push",  time: "10:45", status: "throttled" },
  { id: "n8",  channel: "sms",   time: "11:00", status: "sent" },
  { id: "n9",  channel: "sms",   time: "13:00", status: "throttled" },
  { id: "n10", channel: "email", time: "14:00", status: "throttled" },
];

function RateLimitPlayground() {
  const sim = useSimulation({
    intervalMs: 900,
    maxSteps: SCHEDULE.length,
    onReset: () => {},
  });

  const visible = SCHEDULE.slice(0, sim.step);

  const pushSent    = visible.filter((n) => n.channel === "push"  && n.status === "sent").length;
  const smsSent     = visible.filter((n) => n.channel === "sms"   && n.status === "sent").length;
  const emailSent   = visible.filter((n) => n.channel === "email" && n.status === "sent").length;
  const dedupCount  = visible.filter((n) => n.status === "dedup").length;
  const throttled   = visible.filter((n) => n.status === "throttled").length;

  const chartData = Array.from({ length: Math.max(1, sim.step) }, (_, i) => {
    const slice = SCHEDULE.slice(0, i + 1);
    return {
      t: `t${i + 1}`,
      push:  slice.filter((n) => n.channel === "push"  && n.status === "sent").length,
      email: slice.filter((n) => n.channel === "email" && n.status === "sent").length,
      sms:   slice.filter((n) => n.channel === "sms"   && n.status === "sent").length,
    };
  });

  return (
    <Playground
      title="Rate Limiting + Deduplication"
      simulation={sim}
      canvasHeight="min-h-[340px]"
      hints={["Press play to watch notifications get sent, throttled, or deduplicated based on per-channel rate limits"]}
      canvas={
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "Push",     value: `${pushSent}/5`,  cap: pushSent >= 5, color: "text-blue-400" },
              { label: "SMS",      value: `${smsSent}/1`,   cap: smsSent >= 1,  color: "text-amber-400" },
              { label: "Email",    value: `${emailSent}/2`, cap: emailSent >= 2,color: "text-violet-400" },
              { label: "Dedup'd",  value: `${dedupCount}`,  cap: false,          color: "text-cyan-400" },
            ].map((m) => (
              <div key={m.label} className={cn(
                "rounded-lg border px-2.5 py-2 text-center transition-all",
                m.cap ? "border-red-500/30 bg-red-500/5" : "border-border/20 bg-muted/10"
              )}>
                <div className={cn("text-base font-mono font-bold", m.cap ? "text-red-400" : m.color)}>
                  {m.value}
                </div>
                <div className="text-[9px] text-muted-foreground">{m.label}</div>
              </div>
            ))}
          </div>

          <div className="space-y-1 max-h-40 overflow-y-auto">
            {visible.map((n) => (
              <div key={n.id} className={cn(
                "flex items-center gap-2 rounded border px-2.5 py-1 text-[10px] font-mono transition-all duration-200",
                n.status === "sent"      && "border-emerald-500/20 bg-emerald-500/5",
                n.status === "throttled" && "border-red-500/20 bg-red-500/5",
                n.status === "dedup"     && "border-amber-500/20 bg-amber-500/5"
              )}>
                <span className="text-muted-foreground/50 w-10">{n.time}</span>
                <span className={CHANNEL_CONFIG[n.channel].color}>
                  {CHANNEL_CONFIG[n.channel].icon}
                </span>
                <span className="text-muted-foreground">{CHANNEL_CONFIG[n.channel].label}</span>
                <span className={cn(
                  "ml-auto font-semibold",
                  n.status === "sent"      && "text-emerald-400",
                  n.status === "throttled" && "text-red-400",
                  n.status === "dedup"     && "text-amber-400"
                )}>
                  {n.status === "sent" ? "SENT" : n.status === "throttled" ? "THROTTLED" : "DUPLICATE"}
                </span>
              </div>
            ))}
            {visible.length === 0 && (
              <div className="text-[11px] text-muted-foreground/40 text-center py-6">Press play to simulate</div>
            )}
          </div>

          {throttled > 0 && (
            <div className="rounded-md border border-red-500/20 bg-red-500/5 px-3 py-2 text-[11px] text-red-400">
              {throttled} notification{throttled > 1 ? "s" : ""} throttled — downgraded to in-app inbox
            </div>
          )}

          <LiveChart
            type="area"
            data={chartData}
            dataKeys={{ x: "t", y: ["push", "email", "sms"], label: ["Push", "Email", "SMS"] }}
            height={110}
            unit="sent"
          />
        </div>
      }
      explanation={
        <div className="space-y-3">
          <p><strong className="text-foreground">Deduplication</strong> (idempotency key in Redis) runs first — retries are dropped silently. <strong className="text-foreground">Rate limiting</strong> (token bucket per user) runs second — throttled items land in the in-app inbox, not dropped.</p>
          <div className="space-y-1.5 text-[11px]">
            <div className="flex items-start gap-2">
              <Shield className="size-3.5 text-cyan-400 mt-0.5 shrink-0" />
              <span><span className="text-cyan-400 font-medium">Dedup:</span> Redis SET by notification_id, 24h TTL.</span>
            </div>
            <div className="flex items-start gap-2">
              <Bell className="size-3.5 text-amber-400 mt-0.5 shrink-0" />
              <span><span className="text-amber-400 font-medium">Rate limits:</span> Push 5/hr · SMS 1/day · Email 2/day.</span>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground/70">Watch each channel&apos;s cumulative line flatten when the cap is hit.</p>
        </div>
      }
    />
  );
}

const DELIVERY_RATE_DATA = [
  { time: "00:00", push: 94, email: 82, sms: 97 },
  { time: "04:00", push: 91, email: 79, sms: 96 },
  { time: "08:00", push: 96, email: 85, sms: 98 },
  { time: "12:00", push: 97, email: 88, sms: 98 },
  { time: "16:00", push: 95, email: 84, sms: 97 },
  { time: "20:00", push: 93, email: 81, sms: 97 },
  { time: "24:00", push: 94, email: 83, sms: 98 },
];

export default function NotificationSystemPage() {
  return (
    <div className="space-y-8">
      <TopicHero
        title="Notification System"
        subtitle="Design a multi-channel push, email, and SMS delivery pipeline at 100M-user scale"
        difficulty="advanced"
        estimatedMinutes={25}
      />

      <WhyCare>
        Your phone receives push notifications from dozens of apps. Behind each one is a system that must handle millions of deliveries per second with different priorities.
      </WhyCare>

      <p className="text-sm text-muted-foreground">
        A notification system routes events through a <GlossaryTerm term="message queue">message queue</GlossaryTerm> to channel-specific workers. <GlossaryTerm term="rate limiting">Rate limiting</GlossaryTerm> prevents user fatigue, while <GlossaryTerm term="idempotent">idempotent</GlossaryTerm> delivery via deduplication keys makes retries safe. An <GlossaryTerm term="api gateway">API gateway</GlossaryTerm> handles auth and <GlossaryTerm term="back pressure">back pressure</GlossaryTerm> at the ingestion layer.
      </p>

      <ConversationalCallout type="question">
        Breaking news drops. You need to reach <strong>100M users</strong> in under 5 minutes across push, SMS,
        and email — some users get duplicates from retries, others nothing at all because the queue is full.
        How do you design a system that fans out reliably?
      </ConversationalCallout>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Channel Routing</h2>
        <p className="text-sm text-muted-foreground">
          Every notification travels: API Gateway → Notification Service → Priority Queue → Channel Workers → Providers → Devices.
          Priority decides <em>which</em> channels activate. Change the priority and hit Send to watch it animate.
        </p>
        <ChannelRoutingPlayground />
      </section>

      <ConversationalCallout type="tip">
        The notification is a <strong>signal, not the message</strong>. APNs limits payloads to 4 KB — by
        design. The notification says "something happened"; the app fetches the full content on open. This
        separation is what lets push scale to billions of devices.
      </ConversationalCallout>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Fan-out: 1 Event → N Users × M Channels</h2>
        <p className="text-sm text-muted-foreground">
          Naive sequential sends top out at ~1,000/sec (28 hours for 100M users). Production systems
          partition users by device-token prefix, batch up to 1,000 tokens per APNs/FCM call, and run
          50 worker pools in parallel — dropping delivery time to ~33 minutes.
        </p>
        <FanoutPlayground />

        <BeforeAfter
          before={{
            title: "Sequential (naive)",
            content: <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground"><li>1,000 sends/sec</li><li>28 hours for 100M users</li><li>Single point of failure</li><li>No per-channel batching</li></ul>,
          }}
          after={{
            title: "Batched + Parallel",
            content: <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground"><li>50 workers × 1,000 batch = 50K/sec per channel</li><li>~33 minutes for 100M users (91× faster)</li><li>Workers restart independently on failure</li><li>APNs / FCM bulk APIs used at max efficiency</li></ul>,
          }}
        />
      </section>

      <AhaMoment
        question="Why not just add more sequential workers indefinitely?"
        answer={
          <p>
            APNs and FCM enforce <strong>rate limits per sender certificate</strong>, not per connection.
            Batching 1,000 tokens into a single HTTP/2 call uses one rate-limit slot but delivers 1,000
            notifications — the same as 1,000 individual calls. Parallelism multiplies worker count, but
            batching multiplies efficiency per worker. You need both.
          </p>
        }
      />

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Rate Limiting &amp; Deduplication</h2>
        <p className="text-sm text-muted-foreground">
          Retries (at-least-once delivery) can cause duplicates. Per-user rate limits prevent fatigue
          — users who disable push are lost forever. Both run before the channel worker dispatches.
        </p>
        <RateLimitPlayground />
      </section>

      <ConversationalCallout type="warning">
        Industry data: fewer than 5% of users re-enable push after disabling it. Rate limiting and
        channel routing are not optional features — they directly protect long-term retention.
      </ConversationalCallout>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Delivery Rates by Channel</h2>
        <p className="text-sm text-muted-foreground">
          Each channel has a different delivery-rate profile. SMS is most reliable (carriers
          guarantee delivery); push depends on device connectivity and OS restrictions;
          email is cheapest but most likely to soft-bounce or land in spam.
        </p>
        <div className="rounded-xl border border-border/30 bg-muted/5 p-4">
          <LiveChart
            type="line"
            data={DELIVERY_RATE_DATA}
            dataKeys={{
              x: "time",
              y: ["push", "email", "sms"],
              label: ["Push", "Email", "SMS"],
            }}
            height={220}
            unit="%"
            referenceLines={[
              { y: 95, label: "95% SLA", color: "#10b981" },
            ]}
          />
          <div className="mt-3 grid grid-cols-3 gap-3 text-center">
            {[
              { label: "Push",  value: "~95%", note: "varies by OS/device state", color: "text-blue-400" },
              { label: "SMS",   value: "~97%", note: "carrier-guaranteed delivery", color: "text-amber-400" },
              { label: "Email", value: "~83%", note: "bounces + spam filtering", color: "text-violet-400" },
            ].map((c) => (
              <div key={c.label} className="rounded-lg border border-border/20 bg-muted/10 px-2 py-2.5">
                <div className={cn("text-base font-mono font-bold", c.color)}>{c.value}</div>
                <div className="text-[11px] font-medium text-foreground">{c.label}</div>
                <div className="text-[9px] text-muted-foreground mt-0.5">{c.note}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <TopicQuiz
        questions={[
          {
            question: "Why is batching critical for push notification delivery at scale?",
            options: [
              "Batching reduces the total number of notifications sent",
              "APNs/FCM enforce rate limits per sender certificate — batching 1,000 tokens into one call uses one rate-limit slot",
              "Batching compresses notification payloads",
              "Batching is required by Apple and Google's APIs"
            ],
            correctIndex: 1,
            explanation: "APNs and FCM enforce rate limits per sender certificate, not per connection. Batching 1,000 tokens into a single HTTP/2 call uses one rate-limit slot but delivers 1,000 notifications. Parallelism multiplies worker count, but batching multiplies efficiency per worker."
          },
          {
            question: "How does the notification system achieve safe retries without sending duplicates?",
            options: [
              "It uses exactly-once delivery semantics built into Kafka",
              "It stores an idempotency key (notification_id) in Redis with a 24-hour TTL",
              "It never retries failed notifications",
              "It asks the user's device to reject duplicates"
            ],
            correctIndex: 1,
            explanation: "Deduplication runs before the channel worker dispatches. A Redis SET with the notification_id and a 24h TTL ensures that retried notifications are dropped silently. This gives effective exactly-once delivery with at-least-once semantics."
          },
          {
            question: "Why do notification systems degrade throttled notifications to an in-app inbox instead of dropping them?",
            options: [
              "In-app inbox notifications are free to send",
              "Dropped notifications violate regulatory requirements",
              "Users who disable push are lost forever — throttled items should still be accessible, just less intrusive",
              "The in-app inbox has no rate limits"
            ],
            correctIndex: 2,
            explanation: "Industry data shows fewer than 5% of users re-enable push after disabling it. Rate limiting and thoughtful degradation (to in-app inbox) directly protect long-term user retention. Dropping notifications loses the message entirely."
          }
        ]}
      />

      <KeyTakeaway
        points={[
          "Fan-out with batched workers: partition users by device-token prefix, batch up to 1,000 per APNs/FCM call, run 50 parallel worker pools → 91× faster than sequential.",
          "Idempotency keys (notification_id + Redis SET with 24h TTL) make retries safe without exactly-once semantics — at-least-once + dedup is the pragmatic choice.",
          "Priority routing drives channel selection: urgent → push + SMS + email, normal → push + email, low → push only. Fewer channels = less fatigue.",
          "Per-user rate limits (5 push/hr, 1 SMS/day, 2 email/day) prevent users from disabling notifications permanently — throttled items degrade to in-app inbox, not dropped.",
          "Separate the pipeline into independent services connected by Kafka: ingestion → priority queue → channel router → workers → providers. Each layer scales independently.",
          "SMS is the most reliable channel (~97%) but most expensive. Use it only for urgent or high-value notifications. Push is fastest but least reliable on locked/power-saving devices.",
        ]}
      />
    </div>
  );
}
