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
import { InteractiveDemo } from "@/components/interactive-demo";
import { AhaMoment } from "@/components/aha-moment";
import { ConversationalCallout } from "@/components/conversational-callout";
import { BeforeAfter } from "@/components/before-after";
import { cn } from "@/lib/utils";
import { Inbox, Send, AlertTriangle, CheckCircle2, XCircle, ArrowRight, Package } from "lucide-react";

function QueueFlowViz() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((s) => (s + 1) % 16), 600);
    return () => clearInterval(t);
  }, []);

  const maxSlots = 8;
  const producerRate = 2;
  const consumerRate = 1;

  const messagesProduced = Math.min(tick * producerRate, 20);
  const messagesConsumed = Math.max(0, Math.min((tick - 2) * consumerRate, messagesProduced));
  const queueDepth = Math.min(maxSlots, messagesProduced - messagesConsumed);

  const slots = Array.from({ length: maxSlots }, (_, i) => i < queueDepth);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        {/* Producer */}
        <div className="flex flex-col items-center gap-1 shrink-0">
          <div className={cn(
            "rounded-lg border px-3 py-2 transition-all duration-300",
            tick % 2 === 0 ? "border-blue-500/30 bg-blue-500/10" : "border-border/30 bg-muted/20"
          )}>
            <Send className="size-4 text-blue-400 mx-auto" />
            <div className="text-[10px] font-semibold mt-1">Producer</div>
          </div>
          <div className="text-[9px] font-mono text-muted-foreground/50">2 msg/tick</div>
        </div>

        {/* Arrow */}
        <ArrowRight className="size-3.5 text-muted-foreground/30 shrink-0" />

        {/* Queue */}
        <div className="flex-1">
          <div className="text-[9px] uppercase tracking-wider text-muted-foreground/40 mb-1 text-center">Queue (FIFO)</div>
          <div className="flex gap-0.5 justify-center">
            {slots.map((filled, i) => (
              <div
                key={i}
                className={cn(
                  "h-8 w-8 rounded border flex items-center justify-center transition-all duration-300",
                  filled
                    ? queueDepth > 6
                      ? "bg-red-500/15 border-red-500/30"
                      : queueDepth > 4
                      ? "bg-yellow-500/15 border-yellow-500/30"
                      : "bg-emerald-500/15 border-emerald-500/30"
                    : "bg-muted/10 border-border/20"
                )}
              >
                {filled && (
                  <Package className={cn(
                    "size-3",
                    queueDepth > 6 ? "text-red-400" : queueDepth > 4 ? "text-yellow-400" : "text-emerald-400"
                  )} />
                )}
              </div>
            ))}
          </div>
          <div className="text-[9px] font-mono text-center mt-1 text-muted-foreground/50">
            {queueDepth}/{maxSlots} slots used
          </div>
        </div>

        {/* Arrow */}
        <ArrowRight className="size-3.5 text-muted-foreground/30 shrink-0" />

        {/* Consumer */}
        <div className="flex flex-col items-center gap-1 shrink-0">
          <div className={cn(
            "rounded-lg border px-3 py-2 transition-all duration-300",
            tick % 3 === 0 && tick > 2 ? "border-emerald-500/30 bg-emerald-500/10" : "border-border/30 bg-muted/20"
          )}>
            <Inbox className="size-4 text-emerald-400 mx-auto" />
            <div className="text-[10px] font-semibold mt-1">Consumer</div>
          </div>
          <div className="text-[9px] font-mono text-muted-foreground/50">1 msg/tick</div>
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground/60 text-center">
        {queueDepth <= 3 && "Queue absorbing the rate difference between producer and consumer."}
        {queueDepth > 3 && queueDepth <= 6 && "Queue depth growing. Consumer cannot keep up with producer rate."}
        {queueDepth > 6 && "Queue nearly full! Time to add consumers or apply backpressure."}
      </p>
    </div>
  );
}

function DeadLetterViz() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % 8), 1100);
    return () => clearInterval(t);
  }, []);

  const stages = [
    { label: "Message arrives", icon: <Send className="size-3" />, status: "active" },
    { label: "Consumer attempts processing", icon: <Inbox className="size-3" />, status: "active" },
    { label: "Processing fails (malformed payload)", icon: <XCircle className="size-3" />, status: "error" },
    { label: "Retry #1 — still fails", icon: <AlertTriangle className="size-3" />, status: "warning" },
    { label: "Retry #2 — still fails", icon: <AlertTriangle className="size-3" />, status: "warning" },
    { label: "Retry #3 — max retries exceeded", icon: <XCircle className="size-3" />, status: "error" },
    { label: "Moved to Dead-Letter Queue", icon: <Package className="size-3" />, status: "dlq" },
    { label: "Alert sent to engineering team", icon: <CheckCircle2 className="size-3" />, status: "resolved" },
  ];

  return (
    <div className="space-y-1">
      {stages.map((s, i) => (
        <div
          key={s.label}
          className={cn(
            "flex items-center gap-2.5 rounded-md px-3 py-1.5 transition-all duration-500",
            step === i
              ? s.status === "error"
                ? "bg-red-500/10 border border-red-500/20"
                : s.status === "warning"
                ? "bg-yellow-500/10 border border-yellow-500/20"
                : s.status === "dlq"
                ? "bg-violet-500/10 border border-violet-500/20"
                : "bg-blue-500/10 border border-blue-500/20"
              : step > i
              ? "opacity-40"
              : "opacity-20"
          )}
        >
          <span className={cn(
            "transition-colors",
            step === i
              ? s.status === "error" ? "text-red-400"
                : s.status === "warning" ? "text-yellow-400"
                : s.status === "dlq" ? "text-violet-400"
                : s.status === "resolved" ? "text-emerald-400"
                : "text-blue-400"
              : "text-muted-foreground/30"
          )}>
            {s.icon}
          </span>
          <span className={cn(
            "text-[11px] transition-colors",
            step >= i ? "text-muted-foreground" : "text-muted-foreground/30"
          )}>
            {s.label}
          </span>
        </div>
      ))}
    </div>
  );
}

function BrokerComparisonViz() {
  const [selected, setSelected] = useState<"kafka" | "rabbitmq" | "sqs">("kafka");

  const brokers = {
    kafka: {
      name: "Apache Kafka",
      model: "Distributed commit log",
      delivery: "Pull-based (consumer controls pace)",
      ordering: "Per-partition ordering guaranteed",
      retention: "Configurable (days/weeks/forever)",
      throughput: "Millions of msg/sec (605 MB/s benchmarked)",
      dlq: "Manual via retry topics",
      bestFor: "Event streaming, log aggregation, data pipelines",
      color: "blue",
    },
    rabbitmq: {
      name: "RabbitMQ",
      model: "Traditional message broker",
      delivery: "Push-based (broker sends to consumer)",
      ordering: "Per-queue FIFO ordering",
      retention: "Deleted after acknowledgment",
      throughput: "Tens of thousands msg/sec",
      dlq: "Built-in dead-letter exchanges",
      bestFor: "Task queues, RPC, complex routing, priority queues",
      color: "orange",
    },
    sqs: {
      name: "Amazon SQS",
      model: "Fully managed cloud queue",
      delivery: "Pull-based (long polling)",
      ordering: "FIFO queues guarantee order (standard queues do not)",
      retention: "Up to 14 days",
      throughput: "Nearly unlimited (AWS scales for you)",
      dlq: "Native DLQ with automatic redrive",
      bestFor: "AWS-native apps, simple decoupling, serverless",
      color: "emerald",
    },
  };

  const b = brokers[selected];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-center gap-2">
        {(["kafka", "rabbitmq", "sqs"] as const).map((key) => (
          <button
            key={key}
            onClick={() => setSelected(key)}
            className={cn(
              "rounded-md px-3 py-1.5 text-[11px] font-medium transition-all border",
              selected === key
                ? key === "kafka"
                  ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                  : key === "rabbitmq"
                  ? "bg-orange-500/10 border-orange-500/30 text-orange-400"
                  : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-muted/20 border-border/30 text-muted-foreground/50 hover:text-muted-foreground"
            )}
          >
            {brokers[key].name}
          </button>
        ))}
      </div>

      <div className="space-y-1.5">
        {[
          { label: "Model", value: b.model },
          { label: "Delivery", value: b.delivery },
          { label: "Ordering", value: b.ordering },
          { label: "Retention", value: b.retention },
          { label: "Throughput", value: b.throughput },
          { label: "Dead-Letter Queue", value: b.dlq },
          { label: "Best For", value: b.bestFor },
        ].map((row) => (
          <div key={row.label} className="flex gap-3 rounded-md bg-muted/20 px-3 py-1.5">
            <span className="text-[10px] font-semibold text-muted-foreground/60 w-24 shrink-0">{row.label}</span>
            <span className="text-[11px] text-muted-foreground">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MessageQueuesPage() {
  return (
    <div className="space-y-8">
      <TopicHero
        title="Message Queues"
        subtitle="When your fastest producer meets your slowest consumer, you need a buffer that absorbs the shock."
        difficulty="intermediate"
      />

      <FailureScenario title="Flash sale spike kills the payment service">
        <p className="text-sm text-muted-foreground">
          Your e-commerce site runs a flash sale. Orders spike from 100/min to 10,000/min in
          seconds. The Order service sends each order directly to the Payment service via HTTP.
          The Payment service, which talks to a slow external bank API, cannot keep up.
          <strong className="text-red-400"> Requests queue in memory, threads are exhausted, and orders start dropping.</strong> Customers
          are charged but get no confirmation. Others click &quot;pay&quot; three times, creating
          duplicate charges.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          This is a textbook case for a message queue. The queue absorbs the spike, persists
          every order to disk, and lets the Payment service process them at a safe rate. No
          orders are lost, no duplicate charges, and the Order service responds instantly
          with &quot;accepted.&quot;
        </p>
        <div className="flex items-center justify-center gap-4 py-4">
          <ServerNode type="server" label="Orders" sublabel="10,000 req/min" status="healthy" />
          <span className="text-red-500 text-xl font-bold">--&gt;</span>
          <ServerNode type="server" label="Payments" sublabel="500 req/min max" status="unhealthy" />
        </div>
      </FailureScenario>

      <WhyItBreaks title="Synchronous calls cannot absorb traffic spikes">
        <p className="text-sm text-muted-foreground">
          When a producer sends work directly to a consumer via HTTP, the producer is limited by the
          consumer&apos;s processing speed. Without a buffer between them:
        </p>
        <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
          <li><strong>No backpressure</strong> -- the producer has no way to slow down gracefully</li>
          <li><strong>Dropped requests</strong> -- once the consumer&apos;s thread pool is exhausted, new requests are rejected or time out</li>
          <li><strong>No retry mechanism</strong> -- failed requests are lost unless the producer builds its own retry logic</li>
          <li><strong>Tight temporal coupling</strong> -- both services must be running and healthy at the same time</li>
          <li><strong>No replay</strong> -- if you need to reprocess yesterday&apos;s orders, the data is gone</li>
        </ul>
      </WhyItBreaks>

      <ConceptVisualizer title="Messages Flowing Through a Queue">
        <p className="text-sm text-muted-foreground mb-4">
          Watch messages flow from a fast producer through the queue to a slower consumer.
          The queue acts as a shock absorber -- it fills up when the producer is faster and
          drains when it slows down.
        </p>
        <QueueFlowViz />
      </ConceptVisualizer>

      <ConceptVisualizer title="How a Message Queue Works">
        <p className="text-sm text-muted-foreground mb-4">
          A message queue sits between producers and consumers. Producers write messages without
          waiting for processing. Consumers pull at their own pace. The queue persists messages
          on disk until they are successfully acknowledged.
        </p>
        <AnimatedFlow
          steps={[
            { id: "produce", label: "Produce", description: "Order service enqueues a payment request", icon: <Send className="size-4" /> },
            { id: "persist", label: "Persist", description: "Queue writes message to disk, ACKs the producer", icon: <Package className="size-4" /> },
            { id: "buffer", label: "Buffer", description: "Queue absorbs the spike while consumers stay healthy", icon: <Inbox className="size-4" /> },
            { id: "consume", label: "Consume", description: "Payment service pulls messages at its own rate", icon: <ArrowRight className="size-4" /> },
            { id: "ack", label: "Acknowledge", description: "Consumer confirms success; message is removed", icon: <CheckCircle2 className="size-4" /> },
          ]}
          interval={1800}
        />
      </ConceptVisualizer>

      <CorrectApproach title="Core Concepts">
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold">Producers and Consumers</h4>
            <p className="text-sm text-muted-foreground">
              Producers write messages to the queue. Consumers read from it. They do
              not need to know about each other. Multiple consumers can read from the same queue for
              parallel processing -- this is the <strong>competing consumers</strong> pattern, where each
              message is processed by exactly one consumer in the group.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Topics and Partitions</h4>
            <p className="text-sm text-muted-foreground">
              Messages are organized into topics (e.g., &quot;orders&quot;, &quot;payments&quot;).
              In Kafka, topics are split into partitions for parallelism. Messages within a partition
              are strictly ordered; across partitions, ordering is not guaranteed. A common
              pattern: partition by customer ID so all orders from the same customer are processed in order.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Acknowledgment and Idempotency</h4>
            <p className="text-sm text-muted-foreground">
              After processing, the consumer sends an ACK. The queue removes the message only after
              receiving the ACK. If a consumer crashes mid-processing, the message is redelivered.
              This means consumers <strong>must be idempotent</strong> -- processing the same message
              twice must produce the same result. Use a unique message ID as a deduplication key.
            </p>
          </div>
        </div>
      </CorrectApproach>

      <ConceptVisualizer title="Dead-Letter Queues — Where Failed Messages Go">
        <p className="text-sm text-muted-foreground mb-4">
          Some messages are &quot;poison pills&quot; -- malformed data, missing fields, or referencing
          deleted records. They will fail every time they are processed. Without a dead-letter queue (DLQ),
          they block the entire pipeline. With a DLQ, they are automatically moved aside after
          max retries so healthy messages continue flowing.
        </p>
        <DeadLetterViz />
        <ConversationalCallout type="tip">
          SQS has the best DLQ story: configure a redrive policy with max receive count, and
          failed messages automatically move to the DLQ. RabbitMQ uses dead-letter exchanges
          with routing rules. Kafka requires you to build retry topics manually, but this gives
          you the most control over retry timing and backoff strategies.
        </ConversationalCallout>
      </ConceptVisualizer>

      <ConceptVisualizer title="Kafka vs RabbitMQ vs SQS">
        <p className="text-sm text-muted-foreground mb-4">
          These are the three most common message systems, and they solve fundamentally different problems.
          A queue (RabbitMQ, SQS) is like a ticket wheel in a kitchen -- the ticket is consumed and gone.
          A stream (Kafka) is like a security camera log -- the data persists even after someone reads it.
        </p>
        <BrokerComparisonViz />
      </ConceptVisualizer>

      <InteractiveDemo title="Backpressure Simulator">
        {({ isPlaying, tick }) => {
          const producerRate = 200;
          const consumerRate = 80;
          const elapsed = tick % 20;
          const queueDepth = isPlaying
            ? Math.min(2000, Math.max(0, (producerRate - consumerRate) * elapsed))
            : 0;
          const health = queueDepth > 1500 ? "unhealthy" : queueDepth > 800 ? "warning" : "healthy";
          const dlqCount = isPlaying ? Math.floor(elapsed * 0.5) : 0;
          return (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                The producer sends 200 msg/s. The consumer handles 80 msg/s. Watch the
                queue depth grow -- this is why backpressure and auto-scaling matter.
              </p>
              <div className="flex items-center justify-center gap-4">
                <ServerNode type="server" label="Producer" sublabel={`${producerRate} msg/s`} status="healthy" />
                <div className="flex flex-col items-center gap-1">
                  <ServerNode type="cloud" label="Queue" sublabel={`${queueDepth} pending`} status={health} />
                  <div className="w-24 bg-muted rounded-full h-2">
                    <div
                      className={cn(
                        "rounded-full h-2 transition-all duration-500",
                        queueDepth > 1500 ? "bg-red-500" : queueDepth > 800 ? "bg-yellow-500" : "bg-green-500"
                      )}
                      style={{ width: `${Math.min(100, (queueDepth / 2000) * 100)}%` }}
                    />
                  </div>
                </div>
                <ServerNode type="server" label="Consumer" sublabel={`${consumerRate} msg/s`} status={health} />
              </div>
              <div className="grid grid-cols-4 gap-2">
                <MetricCounter label="Produced" value={isPlaying ? producerRate * elapsed : 0} unit="msg" />
                <MetricCounter label="Queue Depth" value={queueDepth} unit="msg" trend={queueDepth > 800 ? "up" : "neutral"} />
                <MetricCounter label="Consumed" value={isPlaying ? consumerRate * elapsed : 0} unit="msg" />
                <MetricCounter label="Dead Letters" value={dlqCount} unit="msg" trend={dlqCount > 5 ? "up" : "neutral"} />
              </div>
              {queueDepth > 1500 && (
                <ConversationalCallout type="warning">
                  Queue is critically full! Three strategies: <strong>Drop messages</strong> (lossy but fast),
                  <strong> block the producer</strong> (backpressure), or <strong>auto-scale consumers</strong> (most
                  common). SQS + Lambda gives you automatic scaling. Kafka consumer groups let you
                  add partitions and consumers on the fly.
                </ConversationalCallout>
              )}
            </div>
          );
        }}
      </InteractiveDemo>

      <AhaMoment
        question="If messages are processed asynchronously, how does the user know their payment succeeded?"
        answer={
          <p>
            You accept the order immediately and show &quot;processing.&quot; The payment consumer
            processes the message, updates the order status in the database, and triggers a
            notification via email, push, or WebSocket. The user sees the result seconds later.
            This is <strong>eventual consistency</strong> -- you trade instant confirmation for
            resilience under load. Every major e-commerce platform (Amazon, Shopify, Stripe)
            works this way. The &quot;Your order is confirmed&quot; email that arrives 30 seconds
            later? That was triggered by a message queue consumer.
          </p>
        }
      />

      <ConversationalCallout type="tip">
        In system design interviews, message queues show up everywhere. URL shortener (async
        analytics), notification system (fan-out to millions), payment processing (rate limiting
        to bank APIs), and image processing (CPU-heavy work offloaded from the web server).
        When you hear &quot;the producer is faster than the consumer,&quot; reach for a queue.
      </ConversationalCallout>

      <KeyTakeaway
        points={[
          "Message queues decouple producers from consumers, allowing them to operate at different speeds and survive each other's failures.",
          "Backpressure is the mechanism that prevents a fast producer from overwhelming a slow consumer -- the queue absorbs the difference.",
          "Kafka is a distributed log for high-throughput streaming (millions msg/sec, replayable). RabbitMQ is a broker for flexible routing and task queues. SQS is a managed AWS service for simple decoupling.",
          "Dead-letter queues prevent poison-pill messages from blocking the pipeline. Failed messages are moved aside after max retries for manual inspection.",
          "Consumers must be idempotent: processing the same message twice must produce the same result, because at-least-once delivery means duplicates will happen.",
        ]}
      />
    </div>
  );
}
