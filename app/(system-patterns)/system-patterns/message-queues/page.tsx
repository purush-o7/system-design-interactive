"use client";

import { useState, useCallback, useRef } from "react";
import { TopicHero } from "@/components/topic-hero";
import { KeyTakeaway } from "@/components/key-takeaway";
import { AhaMoment } from "@/components/aha-moment";
import { ConversationalCallout } from "@/components/conversational-callout";
import { FlowDiagram, type FlowNode, type FlowEdge } from "@/components/flow-diagram";
import { LiveChart } from "@/components/live-chart";
import { Playground } from "@/components/playground";
import { useSimulation } from "@/hooks/use-simulation";
import { cn } from "@/lib/utils";
import { Plus, Minus, Send, Skull } from "lucide-react";
import { WhyCare } from "@/components/why-care";
import { GlossaryTerm } from "@/components/glossary-term";
import { TopicQuiz } from "@/components/topic-quiz";
import type { QuizQuestion } from "@/components/topic-quiz";

// ─── Playground 1: Interactive Message Queue ──────────────────────────────────

function QueuePlayground() {
  const [queueDepth, setQueueDepth] = useState(0);
  const [consumerCount, setConsumerCount] = useState(2);
  const [consumerSpeed, setConsumerSpeed] = useState(1);
  const [totalProduced, setTotalProduced] = useState(0);
  const [totalConsumed, setTotalConsumed] = useState(0);
  const [dlqCount, setDlqCount] = useState(0);
  const [failCounts, setFailCounts] = useState<Record<string, number>>({});
  const [chartData, setChartData] = useState<{ t: string; depth: number; produced: number; consumed: number }[]>([]);
  const chartTickRef = useRef(0);

  const sim = useSimulation({
    intervalMs: 800,
    onTick: (tick) => {
      setQueueDepth((prev) => {
        // Consumers process messages
        const consumed = Math.min(prev, consumerCount * consumerSpeed);
        // Some messages fail (roughly 5% chance per consumed message)
        let newDlq = 0;
        const newFailCounts = { ...failCounts };
        for (let i = 0; i < consumed; i++) {
          const msgId = `msg-${tick}-${i}`;
          if (Math.random() < 0.05) {
            const count = (newFailCounts[msgId] ?? 0) + 1;
            if (count >= 3) {
              newDlq++;
              delete newFailCounts[msgId];
            } else {
              newFailCounts[msgId] = count;
            }
          }
        }
        setFailCounts(newFailCounts);
        if (newDlq > 0) setDlqCount((d) => d + newDlq);
        const actualConsumed = consumed - newDlq;
        setTotalConsumed((c) => c + actualConsumed);

        const next = Math.max(0, prev - consumed);
        chartTickRef.current++;
        const t = `${chartTickRef.current}`;
        setChartData((cd) => {
          const updated = [...cd, { t, depth: next, produced: totalProduced, consumed: totalConsumed + actualConsumed }];
          return updated.slice(-30);
        });
        return next;
      });
    },
    onReset: () => {
      setQueueDepth(0);
      setTotalProduced(0);
      setTotalConsumed(0);
      setDlqCount(0);
      setFailCounts({});
      setChartData([]);
      chartTickRef.current = 0;
    },
  });

  const sendMessages = useCallback((count: number) => {
    setQueueDepth((prev) => prev + count);
    setTotalProduced((p) => p + count);
    if (!sim.isPlaying) sim.play();
  }, [sim]);

  const queueStatus = queueDepth > 15 ? "unhealthy" : queueDepth > 8 ? "warning" : "healthy";
  const dlqStatus = dlqCount > 0 ? "warning" : "idle";

  // Build flow nodes dynamically based on consumer count
  const nodes: FlowNode[] = [
    {
      id: "producer",
      type: "serverNode",
      position: { x: 50, y: 120 },
      data: {
        label: "Producer",
        sublabel: `${totalProduced} sent`,
        status: "healthy",
        handles: { right: true },
      },
    },
    {
      id: "queue",
      type: "queueNode",
      position: { x: 280, y: 80 },
      data: {
        label: "Message Queue",
        sublabel: `${queueDepth} pending`,
        status: queueStatus,
        metrics: [
          { label: "Depth", value: String(queueDepth) },
          { label: "Throughput", value: `${consumerCount * consumerSpeed}/tick` },
        ],
        handles: { left: true, right: true, bottom: true },
      },
    },
    {
      id: "dlq",
      type: "queueNode",
      position: { x: 280, y: 250 },
      data: {
        label: "Dead Letter Queue",
        sublabel: `${dlqCount} failed`,
        status: dlqStatus,
        handles: { top: true },
      },
    },
  ];

  const edges: FlowEdge[] = [
    { id: "producer-queue", source: "producer", target: "queue", sourceHandle: "right", targetHandle: "left" },
    { id: "queue-dlq", source: "queue", target: "dlq", sourceHandle: "bottom", targetHandle: "top" },
  ];

  // Dynamically add consumer nodes
  const consumerStartY = 30;
  const consumerSpacing = 85;
  for (let i = 0; i < consumerCount; i++) {
    const consumerId = `consumer-${i}`;
    nodes.push({
      id: consumerId,
      type: "serverNode",
      position: { x: 530, y: consumerStartY + i * consumerSpacing },
      data: {
        label: `Consumer ${i + 1}`,
        sublabel: `${consumerSpeed} msg/tick`,
        status: sim.isPlaying ? "healthy" : "idle",
        handles: { left: true },
      },
    });
    edges.push({
      id: `queue-${consumerId}`,
      source: "queue",
      target: consumerId,
      sourceHandle: "right",
      targetHandle: "left",
    });
  }

  const canvas = (
    <div className="h-full flex flex-col">
      <FlowDiagram
        nodes={nodes}
        edges={edges}
        minHeight={320}
        allowDrag={false}
        interactive={false}
      />
    </div>
  );

  const explanation = (
    <div className="space-y-4">
      <p className="text-sm">
        Click <strong>Send Message</strong> to push messages into the queue. The simulation
        auto-starts when you send. Consumers pull messages at their own pace.
      </p>

      {/* Send buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => sendMessages(1)}
          className="flex items-center gap-1.5 rounded-md bg-blue-500/10 border border-blue-500/30 px-3 py-1.5 text-xs font-medium text-blue-400 hover:bg-blue-500/20 transition-colors"
        >
          <Send className="size-3" /> Send 1
        </button>
        <button
          onClick={() => sendMessages(5)}
          className="flex items-center gap-1.5 rounded-md bg-blue-500/10 border border-blue-500/30 px-3 py-1.5 text-xs font-medium text-blue-400 hover:bg-blue-500/20 transition-colors"
        >
          <Send className="size-3" /> Send 5
        </button>
        <button
          onClick={() => sendMessages(20)}
          className="flex items-center gap-1.5 rounded-md bg-orange-500/10 border border-orange-500/30 px-3 py-1.5 text-xs font-medium text-orange-400 hover:bg-orange-500/20 transition-colors"
        >
          <Send className="size-3" /> Flood 20
        </button>
      </div>

      {/* Consumer controls */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Consumers: {consumerCount}</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setConsumerCount((c) => Math.max(1, c - 1))}
              className="rounded p-1 text-muted-foreground hover:bg-violet-500/10 hover:text-violet-400 transition-colors"
            >
              <Minus className="size-3.5" />
            </button>
            <button
              onClick={() => setConsumerCount((c) => Math.min(5, c + 1))}
              className="rounded p-1 text-muted-foreground hover:bg-violet-500/10 hover:text-violet-400 transition-colors"
            >
              <Plus className="size-3.5" />
            </button>
          </div>
        </div>

        <div>
          <span className="text-xs text-muted-foreground">Consumer speed: {consumerSpeed} msg/tick</span>
          <input
            type="range"
            min={1}
            max={5}
            value={consumerSpeed}
            onChange={(e) => setConsumerSpeed(Number(e.target.value))}
            className="w-full h-1.5 rounded-full accent-violet-500 cursor-pointer mt-1"
          />
        </div>
      </div>

      {/* Live stats */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: "Produced", value: totalProduced, color: "text-blue-400" },
          { label: "Consumed", value: totalConsumed, color: "text-emerald-400" },
          { label: "Queue Depth", value: queueDepth, color: queueDepth > 15 ? "text-red-400" : queueDepth > 8 ? "text-amber-400" : "text-emerald-400" },
          { label: "Dead Letters", value: dlqCount, color: dlqCount > 0 ? "text-red-400" : "text-muted-foreground" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-md bg-muted/20 border border-border/20 px-2.5 py-1.5">
            <div className="text-[10px] text-muted-foreground">{stat.label}</div>
            <div className={cn("text-sm font-mono font-semibold", stat.color)}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Status callouts */}
      {queueDepth > 15 && (
        <div className="rounded-md bg-red-500/10 border border-red-500/20 px-3 py-2 text-xs text-red-400">
          <Skull className="size-3.5 inline mr-1" />
          Queue is backing up! Add consumers or increase speed to keep up.
        </div>
      )}
      {dlqCount > 3 && (
        <div className="rounded-md bg-amber-500/10 border border-amber-500/20 px-3 py-2 text-xs text-amber-400">
          {dlqCount} messages in the dead-letter queue. These failed 3 times and need manual inspection.
        </div>
      )}

      {/* Queue depth chart */}
      {chartData.length > 2 && (
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground/60 mb-1">Queue Depth Over Time</div>
          <LiveChart
            type="queueDepth"
            data={chartData}
            dataKeys={{ x: "t", y: "depth", label: "Queue Depth" }}
            height={120}
            referenceLines={[{ y: 15, label: "Danger", color: "#ef4444" }]}
          />
        </div>
      )}
    </div>
  );

  return (
    <Playground
      title="Message Queue Playground"
      simulation={sim}
      canvas={canvas}
      explanation={explanation}
      canvasHeight="min-h-[350px]"
      hints={["Click 'Send 1' or 'Flood 20' to push messages, then adjust consumers and speed"]}
    />
  );
}

// ─── Playground 2: Kafka vs RabbitMQ ──────────────────────────────────────────

function BrokerComparisonPlayground() {
  const [messagesSent, setMessagesSent] = useState(0);

  const sim = useSimulation({
    intervalMs: 600,
    onTick: () => {
      setMessagesSent((p) => p + 1);
    },
    onReset: () => {
      setMessagesSent(0);
    },
  });

  // Kafka architecture: partitioned
  const kafkaNodes: FlowNode[] = [
    {
      id: "k-producer",
      type: "serverNode",
      position: { x: 20, y: 100 },
      data: { label: "Producer", sublabel: `${messagesSent} sent`, status: "healthy", handles: { right: true } },
    },
    {
      id: "k-partition-0",
      type: "queueNode",
      position: { x: 220, y: 10 },
      data: {
        label: "Partition 0",
        sublabel: `${Math.floor(messagesSent / 3)} msgs`,
        status: messagesSent > 0 ? "healthy" : "idle",
        handles: { left: true, right: true },
      },
    },
    {
      id: "k-partition-1",
      type: "queueNode",
      position: { x: 220, y: 100 },
      data: {
        label: "Partition 1",
        sublabel: `${Math.floor((messagesSent + 1) / 3)} msgs`,
        status: messagesSent > 0 ? "healthy" : "idle",
        handles: { left: true, right: true },
      },
    },
    {
      id: "k-partition-2",
      type: "queueNode",
      position: { x: 220, y: 190 },
      data: {
        label: "Partition 2",
        sublabel: `${Math.floor((messagesSent + 2) / 3)} msgs`,
        status: messagesSent > 0 ? "healthy" : "idle",
        handles: { left: true, right: true },
      },
    },
    {
      id: "k-consumer-0",
      type: "serverNode",
      position: { x: 440, y: 10 },
      data: { label: "Consumer 0", sublabel: "Partition 0", status: sim.isPlaying ? "healthy" : "idle", handles: { left: true } },
    },
    {
      id: "k-consumer-1",
      type: "serverNode",
      position: { x: 440, y: 100 },
      data: { label: "Consumer 1", sublabel: "Partition 1", status: sim.isPlaying ? "healthy" : "idle", handles: { left: true } },
    },
    {
      id: "k-consumer-2",
      type: "serverNode",
      position: { x: 440, y: 190 },
      data: { label: "Consumer 2", sublabel: "Partition 2", status: sim.isPlaying ? "healthy" : "idle", handles: { left: true } },
    },
  ];

  const kafkaEdges: FlowEdge[] = [
    { id: "k-p-p0", source: "k-producer", target: "k-partition-0" },
    { id: "k-p-p1", source: "k-producer", target: "k-partition-1" },
    { id: "k-p-p2", source: "k-producer", target: "k-partition-2" },
    { id: "k-p0-c0", source: "k-partition-0", target: "k-consumer-0" },
    { id: "k-p1-c1", source: "k-partition-1", target: "k-consumer-1" },
    { id: "k-p2-c2", source: "k-partition-2", target: "k-consumer-2" },
  ];

  // RabbitMQ architecture: exchange + routing
  const rabbitNodes: FlowNode[] = [
    {
      id: "r-producer",
      type: "serverNode",
      position: { x: 20, y: 100 },
      data: { label: "Producer", sublabel: `${messagesSent} sent`, status: "healthy", handles: { right: true } },
    },
    {
      id: "r-exchange",
      type: "gatewayNode",
      position: { x: 190, y: 100 },
      data: {
        label: "Exchange",
        sublabel: "topic routing",
        status: messagesSent > 0 ? "healthy" : "idle",
        handles: { left: true, right: true },
      },
    },
    {
      id: "r-queue-orders",
      type: "queueNode",
      position: { x: 370, y: 30 },
      data: {
        label: "orders queue",
        sublabel: `${Math.floor(messagesSent / 2)} msgs`,
        status: messagesSent > 0 ? "healthy" : "idle",
        handles: { left: true, right: true },
      },
    },
    {
      id: "r-queue-notif",
      type: "queueNode",
      position: { x: 370, y: 170 },
      data: {
        label: "notifications queue",
        sublabel: `${Math.ceil(messagesSent / 2)} msgs`,
        status: messagesSent > 0 ? "healthy" : "idle",
        handles: { left: true, right: true },
      },
    },
    {
      id: "r-consumer-1",
      type: "serverNode",
      position: { x: 560, y: 30 },
      data: { label: "Order Worker", status: sim.isPlaying ? "healthy" : "idle", handles: { left: true } },
    },
    {
      id: "r-consumer-2",
      type: "serverNode",
      position: { x: 560, y: 170 },
      data: { label: "Notifier", status: sim.isPlaying ? "healthy" : "idle", handles: { left: true } },
    },
  ];

  const rabbitEdges: FlowEdge[] = [
    { id: "r-p-e", source: "r-producer", target: "r-exchange" },
    { id: "r-e-q1", source: "r-exchange", target: "r-queue-orders" },
    { id: "r-e-q2", source: "r-exchange", target: "r-queue-notif" },
    { id: "r-q1-c1", source: "r-queue-orders", target: "r-consumer-1" },
    { id: "r-q2-c2", source: "r-queue-notif", target: "r-consumer-2" },
  ];

  const canvas = (
    <div className="h-full flex flex-col">
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-violet-500/10">
        <div className="relative">
          <div className="absolute top-2 left-3 z-10 text-[10px] uppercase tracking-wider font-semibold text-blue-400 bg-background/80 backdrop-blur rounded px-2 py-0.5">
            Apache Kafka — Partitioned Log
          </div>
          <FlowDiagram
            nodes={kafkaNodes}
            edges={kafkaEdges}
            minHeight={280}
            allowDrag={false}
            interactive={false}
          />
        </div>
        <div className="relative">
          <div className="absolute top-2 left-3 z-10 text-[10px] uppercase tracking-wider font-semibold text-orange-400 bg-background/80 backdrop-blur rounded px-2 py-0.5">
            RabbitMQ — Exchange + Routing
          </div>
          <FlowDiagram
            nodes={rabbitNodes}
            edges={rabbitEdges}
            minHeight={280}
            allowDrag={false}
            interactive={false}
          />
        </div>
      </div>
    </div>
  );

  const explanation = (
    <div className="space-y-4">
      <p className="text-sm">
        Hit play and watch messages flow through both architectures simultaneously.
        Notice the fundamental difference in how they distribute work.
      </p>

      <div className="space-y-3">
        <div className="rounded-md bg-blue-500/5 border border-blue-500/20 p-3">
          <h4 className="text-xs font-semibold text-blue-400 mb-1">Kafka</h4>
          <p className="text-xs text-muted-foreground">
            Messages are distributed across <strong>partitions</strong> by key.
            Each partition is consumed by exactly one consumer in the group.
            Messages persist after consumption — you can replay the entire log.
            Best for: event streaming, analytics, data pipelines.
          </p>
        </div>

        <div className="rounded-md bg-orange-500/5 border border-orange-500/20 p-3">
          <h4 className="text-xs font-semibold text-orange-400 mb-1">RabbitMQ</h4>
          <p className="text-xs text-muted-foreground">
            Messages pass through an <strong>exchange</strong> that routes them
            to queues based on binding rules. Messages are deleted after acknowledgment.
            Supports complex patterns: fan-out, topic routing, priority queues.
            Best for: task queues, RPC, routing-heavy workloads.
          </p>
        </div>
      </div>

      <div className="rounded-md bg-muted/20 border border-border/20 p-3">
        <h4 className="text-xs font-semibold mb-1">Key Difference</h4>
        <p className="text-xs text-muted-foreground">
          Kafka is a <strong>distributed log</strong> — data is retained.
          RabbitMQ is a <strong>message broker</strong> — data is consumed and gone.
          Think security camera log vs. ticket dispenser.
        </p>
      </div>

      {messagesSent > 10 && (
        <div className="space-y-1">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Messages Distributed</div>
          <LiveChart
            type="bar"
            data={[
              { broker: "Kafka P0", count: Math.floor(messagesSent / 3) },
              { broker: "Kafka P1", count: Math.floor((messagesSent + 1) / 3) },
              { broker: "Kafka P2", count: Math.floor((messagesSent + 2) / 3) },
              { broker: "RMQ Orders", count: Math.floor(messagesSent / 2) },
              { broker: "RMQ Notif", count: Math.ceil(messagesSent / 2) },
            ]}
            dataKeys={{ x: "broker", y: "count" }}
            height={100}
          />
        </div>
      )}
    </div>
  );

  return (
    <Playground
      title="Kafka vs RabbitMQ — Side by Side"
      simulation={sim}
      canvas={canvas}
      explanation={explanation}
      canvasHeight="min-h-[300px]"
      hints={["Press play to watch messages flow through both Kafka and RabbitMQ simultaneously"]}
    />
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MessageQueuesPage() {
  return (
    <div className="space-y-8">
      <TopicHero
        title="Message Queues"
        subtitle="When your fastest producer meets your slowest consumer, you need a buffer that absorbs the shock."
        difficulty="intermediate"
      />

      <WhyCare>
        Slack processes billions of messages daily. Without <GlossaryTerm term="message queue">message queues</GlossaryTerm>, a single slow operation would freeze the entire platform.
      </WhyCare>

      {/* Context setter */}
      <div className="rounded-lg border border-border/30 bg-muted/10 p-5 space-y-3">
        <h3 className="text-base font-semibold">Why Message Queues Exist</h3>
        <p className="text-sm text-muted-foreground">
          Imagine a flash sale: orders spike from 100/min to 10,000/min. The Order service
          sends each order directly to the Payment service via HTTP. The Payment service
          talks to a slow bank API and cannot keep up. Threads exhaust, requests drop,
          customers get charged without confirmation.
        </p>
        <p className="text-sm text-muted-foreground">
          A <GlossaryTerm term="message queue">message queue</GlossaryTerm> sits between them. The Order service writes to the queue and
          responds instantly. The Payment service pulls at its own pace. No orders lost,
          no duplicate charges. The queue absorbs the shock, improving <GlossaryTerm term="throughput">throughput</GlossaryTerm> and reducing <GlossaryTerm term="latency">latency</GlossaryTerm> spikes.
        </p>
      </div>

      {/* Playground 1: Interactive Queue */}
      <QueuePlayground />

      <ConversationalCallout type="tip">
        Try flooding 20 messages with only 1 consumer at speed 1. Watch the queue back up
        and turn red. Then add consumers or crank up the speed — the queue drains.
        This is exactly why auto-scaling consumer groups matter in production.
      </ConversationalCallout>

      {/* Core concepts */}
      <div className="rounded-lg border border-border/30 bg-muted/10 p-5 space-y-4">
        <h3 className="text-base font-semibold">Core Concepts</h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">Producers & Consumers</h4>
            <p className="text-xs text-muted-foreground">
              Producers write messages. Consumers read them. They never talk directly.
              Multiple consumers can compete for messages — each message goes to exactly
              one consumer in the group (competing consumers pattern).
            </p>
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">Topics & Partitions</h4>
            <p className="text-xs text-muted-foreground">
              Messages live in topics (e.g., &quot;orders&quot;). Kafka splits topics into
              partitions for parallelism. Within a partition, order is guaranteed. Across
              partitions, it is not. Partition by customer ID to keep one customer&apos;s
              orders in sequence.
            </p>
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">Acknowledgment</h4>
            <p className="text-xs text-muted-foreground">
              After processing, the consumer sends an ACK. The queue removes the message
              only after the ACK. If a consumer crashes mid-processing, the message is
              redelivered. This is at-least-once delivery.
            </p>
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">Dead-Letter Queues</h4>
            <p className="text-xs text-muted-foreground">
              Some messages are poison pills — malformed or referencing deleted data.
              They fail every time. After max retries (usually 3), they move to a DLQ
              so healthy messages keep flowing. Engineers inspect the DLQ later.
            </p>
          </div>
        </div>
      </div>

      <AhaMoment
        question="If messages are processed asynchronously, how does the user know their payment succeeded?"
        answer={
          <p>
            You accept the order immediately and show &quot;processing.&quot; The payment consumer
            processes the message, updates the order status in the database, and triggers a
            notification via email, push, or WebSocket. The user sees the result seconds later.
            This is <strong>eventual consistency</strong> — you trade instant confirmation for
            resilience under load. Every major e-commerce platform works this way. The
            &quot;Your order is confirmed&quot; email that arrives 30 seconds later? That was
            triggered by a message queue consumer.
          </p>
        }
      />

      {/* Playground 2: Kafka vs RabbitMQ */}
      <BrokerComparisonPlayground />

      <ConversationalCallout type="tip">
        In system design interviews, message queues show up everywhere: URL shortener
        (async analytics), notification system (fan-out to millions), payment processing
        (rate limiting to bank APIs), image processing (CPU-heavy work offloaded).
        When you hear &quot;the producer is faster than the consumer,&quot; reach for a queue.
      </ConversationalCallout>

      <TopicQuiz
        questions={[
          {
            question: "What happens when a consumer crashes before acknowledging a message?",
            options: [
              "The message is permanently lost",
              "The message is moved to the dead-letter queue immediately",
              "The message is redelivered to another consumer",
              "The producer is notified to resend it",
            ],
            correctIndex: 2,
            explanation: "With at-least-once delivery, unacknowledged messages are redelivered. This is why consumers must be idempotent -- they may process the same message more than once.",
          },
          {
            question: "What is the purpose of a dead-letter queue (DLQ)?",
            options: [
              "To store messages that have been successfully processed",
              "To hold messages that repeatedly fail processing after max retries",
              "To prioritize high-importance messages",
              "To replicate messages across data centers",
            ],
            correctIndex: 1,
            explanation: "Poison-pill messages that fail every time are moved to the DLQ after max retries (usually 3), preventing them from blocking healthy messages in the main queue.",
          },
          {
            question: "What is the key architectural difference between Kafka and RabbitMQ?",
            options: [
              "Kafka supports multiple consumers, RabbitMQ does not",
              "RabbitMQ is faster than Kafka in all scenarios",
              "Kafka is a distributed log that retains messages; RabbitMQ is a broker that deletes messages after acknowledgment",
              "Kafka only supports point-to-point messaging",
            ],
            correctIndex: 2,
            explanation: "Kafka retains messages on disk like a commit log -- you can replay them. RabbitMQ removes messages once acknowledged. Think security camera vs. ticket dispenser.",
          },
        ] satisfies QuizQuestion[]}
      />

      <KeyTakeaway
        points={[
          "Message queues decouple producers from consumers, allowing them to operate at different speeds and survive each other's failures.",
          "Backpressure prevents a fast producer from overwhelming a slow consumer — the queue absorbs the difference, and you scale consumers to drain it.",
          "Kafka is a distributed log for high-throughput streaming (millions msg/sec, replayable). RabbitMQ is a broker for flexible routing and task queues. SQS is a managed AWS service for simple decoupling.",
          "Dead-letter queues prevent poison-pill messages from blocking the pipeline. Failed messages move aside after max retries for manual inspection.",
          "Consumers must be idempotent: processing the same message twice must produce the same result, because at-least-once delivery means duplicates will happen.",
        ]}
      />
    </div>
  );
}
