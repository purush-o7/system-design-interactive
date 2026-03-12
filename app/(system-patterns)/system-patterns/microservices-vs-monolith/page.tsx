"use client";

import { useState, useMemo } from "react";
import { TopicHero } from "@/components/topic-hero";
import { KeyTakeaway } from "@/components/key-takeaway";
import { AhaMoment } from "@/components/aha-moment";
import { ConversationalCallout } from "@/components/conversational-callout";
import { FlowDiagram, type FlowNode, type FlowEdge } from "@/components/flow-diagram";
import { LiveChart } from "@/components/live-chart";
import { Playground } from "@/components/playground";
import { useSimulation } from "@/hooks/use-simulation";
import { cn } from "@/lib/utils";

// ─── Playground 1: Architecture Comparison ──────────────────────────────────

function ArchitecturePlayground() {
  const [view, setView] = useState<"monolith" | "microservices">("monolith");

  const sim = useSimulation({ intervalMs: 600, maxSteps: 12 });

  const step = sim.step;

  // Monolith: single server with all modules
  const monolithNodes: FlowNode[] = [
    {
      id: "client",
      type: "clientNode",
      position: { x: 60, y: 120 },
      data: {
        label: "Client",
        sublabel: step >= 1 ? "Sending request..." : "Idle",
        status: step >= 1 && step < 5 ? "healthy" : "idle",
        handles: { right: true },
      },
    },
    {
      id: "monolith",
      type: "serverNode",
      position: { x: 300, y: 60 },
      data: {
        label: "Monolith Server",
        sublabel: "User + Product + Order + Payment",
        status: step >= 3 ? "healthy" : step >= 2 ? "warning" : "idle",
        metrics: [
          { label: "Modules", value: "4" },
          { label: "Latency", value: step >= 4 ? "12ms" : "--" },
        ],
        handles: { left: true, right: true },
      },
    },
    {
      id: "db",
      type: "databaseNode",
      position: { x: 560, y: 120 },
      data: {
        label: "Shared DB",
        sublabel: "All tables",
        status: step >= 3 ? "healthy" : "idle",
        handles: { left: true },
      },
    },
  ];

  const monolithEdges: FlowEdge[] = [
    { id: "c-m", source: "client", target: "monolith", animated: step >= 1 && step < 5 },
    { id: "m-d", source: "monolith", target: "db", animated: step >= 2 && step < 5 },
  ];

  // Microservices: gateway + individual services
  const microNodes: FlowNode[] = [
    {
      id: "client",
      type: "clientNode",
      position: { x: 20, y: 140 },
      data: {
        label: "Client",
        sublabel: step >= 1 ? "Sending request..." : "Idle",
        status: step >= 1 && step < 10 ? "healthy" : "idle",
        handles: { right: true },
      },
    },
    {
      id: "gateway",
      type: "gatewayNode",
      position: { x: 180, y: 130 },
      data: {
        label: "API Gateway",
        sublabel: step >= 2 ? "Routing..." : "Ready",
        status: step >= 2 ? "healthy" : "idle",
        handles: { left: true, right: true },
      },
    },
    {
      id: "user-svc",
      type: "serverNode",
      position: { x: 380, y: 10 },
      data: {
        label: "User Service",
        status: step >= 3 && step <= 4 ? "healthy" : "idle",
        handles: { left: true, right: true },
      },
    },
    {
      id: "product-svc",
      type: "serverNode",
      position: { x: 380, y: 100 },
      data: {
        label: "Product Service",
        status: step >= 5 && step <= 6 ? "healthy" : "idle",
        handles: { left: true, right: true },
      },
    },
    {
      id: "order-svc",
      type: "serverNode",
      position: { x: 380, y: 190 },
      data: {
        label: "Order Service",
        status: step >= 7 && step <= 8 ? "healthy" : "idle",
        handles: { left: true, right: true },
      },
    },
    {
      id: "payment-svc",
      type: "serverNode",
      position: { x: 380, y: 280 },
      data: {
        label: "Payment Service",
        status: step >= 9 ? "healthy" : "idle",
        handles: { left: true, right: true },
      },
    },
    {
      id: "user-db",
      type: "databaseNode",
      position: { x: 590, y: 10 },
      data: { label: "User DB", status: step >= 3 && step <= 4 ? "healthy" : "idle", handles: { left: true } },
    },
    {
      id: "product-db",
      type: "databaseNode",
      position: { x: 590, y: 100 },
      data: { label: "Product DB", status: step >= 5 && step <= 6 ? "healthy" : "idle", handles: { left: true } },
    },
    {
      id: "order-db",
      type: "databaseNode",
      position: { x: 590, y: 190 },
      data: { label: "Order DB", status: step >= 7 && step <= 8 ? "healthy" : "idle", handles: { left: true } },
    },
    {
      id: "payment-db",
      type: "databaseNode",
      position: { x: 590, y: 280 },
      data: { label: "Payment DB", status: step >= 9 ? "healthy" : "idle", handles: { left: true } },
    },
  ];

  const microEdges: FlowEdge[] = [
    { id: "c-gw", source: "client", target: "gateway", animated: step >= 1 && step < 10 },
    { id: "gw-u", source: "gateway", target: "user-svc", animated: step >= 3 && step <= 4 },
    { id: "gw-p", source: "gateway", target: "product-svc", animated: step >= 5 && step <= 6 },
    { id: "gw-o", source: "gateway", target: "order-svc", animated: step >= 7 && step <= 8 },
    { id: "gw-pay", source: "gateway", target: "payment-svc", animated: step >= 9 },
    { id: "u-db", source: "user-svc", target: "user-db", animated: step >= 3 && step <= 4 },
    { id: "p-db", source: "product-svc", target: "product-db", animated: step >= 5 && step <= 6 },
    { id: "o-db", source: "order-svc", target: "order-db", animated: step >= 7 && step <= 8 },
    { id: "pay-db", source: "payment-svc", target: "payment-db", animated: step >= 9 },
  ];

  const latencyData = useMemo(() => {
    const points = [];
    for (let i = 1; i <= Math.min(step, 12); i++) {
      points.push({
        step: `T${i}`,
        monolith: Math.round(10 + Math.random() * 5),
        microservices: Math.round(25 + i * 2 + Math.random() * 8),
      });
    }
    return points;
  }, [step]);

  return (
    <div className="space-y-4">
      {/* Toggle */}
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={() => setView("monolith")}
          className={cn(
            "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
            view === "monolith"
              ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
              : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
          )}
        >
          Monolith
        </button>
        <button
          onClick={() => setView("microservices")}
          className={cn(
            "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
            view === "microservices"
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
          )}
        >
          Microservices
        </button>
      </div>

      <Playground
        title={view === "monolith" ? "Monolith: Single Hop Request" : "Microservices: Multi-Hop Request"}
        simulation={sim}
        canvasHeight="min-h-[380px]"
        canvas={
          <FlowDiagram
            nodes={view === "monolith" ? monolithNodes : microNodes}
            edges={view === "monolith" ? monolithEdges : microEdges}
            minHeight={370}
            interactive
          />
        }
        explanation={(state) => (
          <div className="space-y-3">
            <p className="text-sm font-medium">
              {view === "monolith" ? "Single process, single hop" : "Multiple services, multiple hops"}
            </p>
            <p className="text-xs text-muted-foreground">
              {view === "monolith"
                ? "The client sends a request to one server. All modules (User, Product, Order, Payment) run in the same process sharing one database. Fast, simple, but tightly coupled."
                : "The client hits the API Gateway, which routes to each service. Each service has its own database. More network hops, but services are independently deployable and scalable."}
            </p>
            {step > 2 && latencyData.length > 0 && (
              <>
                <p className="text-xs font-medium text-muted-foreground mt-2">Latency comparison:</p>
                <LiveChart
                  type="latency"
                  data={latencyData}
                  dataKeys={{ x: "step", y: ["monolith", "microservices"], label: ["Monolith", "Microservices"] }}
                  height={140}
                  showLegend
                />
              </>
            )}
          </div>
        )}
      />
    </div>
  );
}

// ─── Playground 2: Failure Cascade Demo ─────────────────────────────────────

function FailureCascadePlayground() {
  const [brokenService, setBrokenService] = useState<string | null>(null);

  const services = ["User", "Product", "Order", "Payment"];

  const statusMap: Record<string, string> = {
    healthy: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    unhealthy: "bg-red-500/20 text-red-400 border-red-500/30",
    idle: "bg-muted/30 text-muted-foreground border-border/30",
  };

  // Monolith: if any module breaks, everything is down
  const monolithStatus = brokenService ? "unhealthy" : "healthy";

  // Microservices: only the broken service is down
  const getServiceStatus = (svc: string) => {
    if (!brokenService) return "healthy";
    return svc === brokenService ? "unhealthy" : "healthy";
  };

  const microNodes: FlowNode[] = [
    {
      id: "gateway",
      type: "gatewayNode",
      position: { x: 30, y: 120 },
      data: {
        label: "API Gateway",
        status: "healthy",
        handles: { right: true },
      },
    },
    ...services.map((svc, i) => ({
      id: svc.toLowerCase(),
      type: "serverNode" as const,
      position: { x: 260, y: i * 80 + 10 },
      data: {
        label: `${svc} Service`,
        status: (getServiceStatus(svc) as "healthy" | "unhealthy"),
        handles: { left: true, right: true },
      },
    })),
    ...services.map((svc, i) => ({
      id: `${svc.toLowerCase()}-db`,
      type: "databaseNode" as const,
      position: { x: 470, y: i * 80 + 10 },
      data: {
        label: `${svc} DB`,
        status: (getServiceStatus(svc) as "healthy" | "unhealthy"),
        handles: { left: true },
      },
    })),
  ];

  const microEdges: FlowEdge[] = [
    ...services.map((svc) => ({
      id: `gw-${svc.toLowerCase()}`,
      source: "gateway",
      target: svc.toLowerCase(),
      animated: getServiceStatus(svc) === "healthy",
    })),
    ...services.map((svc) => ({
      id: `${svc.toLowerCase()}-db-edge`,
      source: svc.toLowerCase(),
      target: `${svc.toLowerCase()}-db`,
      animated: getServiceStatus(svc) === "healthy",
    })),
  ];

  return (
    <Playground
      title="Failure Blast Radius: Monolith vs Microservices"
      controls={false}
      canvasHeight="min-h-[360px]"
      canvas={
        <div className="flex flex-col lg:flex-row h-full">
          {/* Monolith side */}
          <div className="flex-1 p-4 border-b lg:border-b-0 lg:border-r border-violet-500/10">
            <p className="text-xs font-semibold text-blue-400 mb-3">Monolith</p>
            <div
              className={cn(
                "rounded-xl border-2 p-4 transition-all duration-500",
                statusMap[monolithStatus]
              )}
            >
              <p className="text-sm font-semibold mb-2">
                {monolithStatus === "unhealthy" ? "ENTIRE SYSTEM DOWN" : "All Systems Healthy"}
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {services.map((svc) => (
                  <div
                    key={svc}
                    className={cn(
                      "rounded-md border px-2 py-1 text-xs text-center transition-all",
                      monolithStatus === "unhealthy"
                        ? "border-red-500/30 bg-red-500/10 text-red-400"
                        : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                    )}
                  >
                    {svc}
                  </div>
                ))}
              </div>
              {monolithStatus === "unhealthy" && (
                <p className="text-[10px] text-red-400/70 mt-2 text-center">
                  {brokenService} crash took down everything
                </p>
              )}
            </div>
          </div>

          {/* Microservices side */}
          <div className="flex-1 p-1">
            <p className="text-xs font-semibold text-emerald-400 mb-1 px-3 pt-3">Microservices</p>
            <FlowDiagram nodes={microNodes} edges={microEdges} minHeight={280} interactive={false} />
          </div>
        </div>
      }
      explanation={
        <div className="space-y-3">
          <p className="text-sm font-medium">Click a service to break it</p>
          <p className="text-xs text-muted-foreground">
            In a monolith, one crashed module takes the whole server down.
            With microservices, only the broken service fails -- the rest keep serving traffic.
          </p>
          <div className="flex flex-wrap gap-2">
            {services.map((svc) => (
              <button
                key={svc}
                onClick={() => setBrokenService(brokenService === svc ? null : svc)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors",
                  brokenService === svc
                    ? "bg-red-500/20 text-red-400 border-red-500/30"
                    : "bg-muted/30 text-muted-foreground border-border/30 hover:bg-red-500/10 hover:text-red-400"
                )}
              >
                Break {svc}
              </button>
            ))}
            {brokenService && (
              <button
                onClick={() => setBrokenService(null)}
                className="rounded-lg px-3 py-1.5 text-xs font-medium border bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20 transition-colors"
              >
                Heal All
              </button>
            )}
          </div>
          {brokenService && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-xs space-y-1">
              <p className="font-medium text-red-400">Blast radius comparison:</p>
              <p className="text-muted-foreground">
                Monolith: <span className="text-red-400 font-semibold">4/4 modules down</span>
              </p>
              <p className="text-muted-foreground">
                Microservices: <span className="text-emerald-400 font-semibold">1/4 services down</span>. The other 3 continue serving users.
              </p>
            </div>
          )}
        </div>
      }
    />
  );
}

// ─── Playground 3: Scaling Comparison ───────────────────────────────────────

function ScalingPlayground() {
  const [trafficLevel, setTrafficLevel] = useState(1);

  const trafficLabels: Record<number, string> = {
    1: "Low",
    2: "Medium",
    3: "High",
    4: "Viral Spike",
  };

  // Cost data as traffic grows
  const costData = [
    { traffic: "Low", monolith: 50, microservices: 80 },
    { traffic: "Medium", monolith: 200, microservices: 150 },
    { traffic: "High", monolith: 800, microservices: 400 },
    { traffic: "Viral", monolith: 3200, microservices: 900 },
  ];

  const n = trafficLevel;

  const monoNodes: FlowNode[] = [
    ...Array.from({ length: n }, (_, i) => ({
      id: `mono-${i}`, type: "serverNode" as const, position: { x: 40 + i * 160, y: 60 },
      data: { label: `Monolith #${i + 1}`, sublabel: "All modules", status: "healthy" as const, handles: { bottom: true } },
    })),
    {
      id: "mono-db", type: "databaseNode" as const, position: { x: 40 + ((n - 1) * 160) / 2, y: 200 },
      data: { label: "Shared DB", sublabel: n >= 3 ? "Bottleneck!" : "OK", status: n >= 3 ? "warning" as const : "healthy" as const, handles: { top: true } },
    },
  ];
  const monoEdges: FlowEdge[] = Array.from({ length: n }, (_, i) => ({
    id: `mono-${i}-db`, source: `mono-${i}`, target: "mono-db", animated: true,
  }));

  const microScaleNodes: FlowNode[] = [
    { id: "user-svc", type: "serverNode", position: { x: 20, y: 20 }, data: { label: "User (x1)", status: "healthy", handles: { bottom: true } } },
    { id: "product-svc", type: "serverNode", position: { x: 20, y: 120 }, data: { label: "Product (x1)", status: "healthy", handles: { bottom: true } } },
    ...Array.from({ length: n }, (_, i) => ({
      id: `order-svc-${i}`, type: "serverNode" as const, position: { x: 220 + i * 150, y: 20 },
      data: { label: `Order #${i + 1}`, status: "healthy" as const, handles: { bottom: true } },
    })),
    { id: "payment-svc", type: "serverNode", position: { x: 220, y: 120 }, data: { label: "Payment (x1)", status: "healthy", handles: { bottom: true } } },
    { id: "order-db", type: "databaseNode", position: { x: 220 + ((n - 1) * 150) / 2, y: 220 }, data: { label: "Order DB", status: "healthy", handles: { top: true } } },
  ];
  const microScaleEdges: FlowEdge[] = Array.from({ length: n }, (_, i) => ({
    id: `order-${i}-db`, source: `order-svc-${i}`, target: "order-db", animated: true,
  }));

  return (
    <Playground
      title="Scaling Efficiency: Scale Everything vs Scale What Matters"
      controls={false}
      canvasHeight="min-h-[520px]"
      canvas={
        <div className="p-4 space-y-4">
          {/* Traffic slider */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground font-medium">Traffic:</span>
            <input
              type="range"
              min={1}
              max={4}
              value={trafficLevel}
              onChange={(e) => setTrafficLevel(Number(e.target.value))}
              className="flex-1 h-1.5 rounded-full accent-violet-500 cursor-pointer"
            />
            <span className={cn(
              "text-xs font-semibold px-2 py-0.5 rounded",
              trafficLevel <= 2 ? "text-emerald-400 bg-emerald-500/10" : "text-orange-400 bg-orange-500/10"
            )}>
              {trafficLabels[trafficLevel]}
            </span>
          </div>

          {/* Side by side diagrams */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-blue-400 mb-2">
                Monolith: Scale everything ({n}x full copies)
              </p>
              <div className="rounded-lg border border-border/30 overflow-hidden">
                <FlowDiagram nodes={monoNodes} edges={monoEdges} minHeight={260} interactive={false} />
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-emerald-400 mb-2">
                Microservices: Scale only Order Service ({n}x)
              </p>
              <div className="rounded-lg border border-border/30 overflow-hidden">
                <FlowDiagram
                  nodes={microScaleNodes}
                  edges={microScaleEdges}
                  minHeight={260}
                  interactive={false}
                />
              </div>
            </div>
          </div>

          {/* Cost chart */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Monthly cost comparison ($)</p>
            <LiveChart
              type="bar"
              data={costData}
              dataKeys={{ x: "traffic", y: ["monolith", "microservices"], label: ["Monolith", "Microservices"] }}
              height={160}
              unit="$"
              showLegend
              referenceLines={[{ y: 1000, label: "Budget limit", color: "#ef4444" }]}
            />
          </div>
        </div>
      }
    />
  );
}

// ─── Playground 4: Decision Framework ───────────────────────────────────────

const questions = [
  { id: "team", question: "How large is your engineering team?", options: ["< 10 people", "10-50 people", "> 50 people"], weights: [-2, 0, 2] },
  { id: "deploy", question: "How often do you need to deploy?", options: ["Weekly", "Daily", "Multiple times/day"], weights: [-1, 0, 2] },
  { id: "domain", question: "How complex is your domain?", options: ["Simple / unclear", "Moderate", "Well-defined bounded contexts"], weights: [-2, 0, 2] },
  { id: "infra", question: "What is your DevOps maturity?", options: ["No dedicated DevOps", "Some CI/CD", "K8s, service mesh, etc."], weights: [-2, 0, 2] },
  { id: "scale", question: "Do different parts need different scaling?", options: ["No", "Somewhat", "Absolutely"], weights: [-1, 0, 2] },
];

function DecisionFramework() {
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const score = Object.values(answers).reduce((sum, v) => sum + v, 0);
  const answered = Object.keys(answers).length;
  const allAnswered = answered === questions.length;

  const recommendation = score <= -3
    ? { label: "Start with a Monolith", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/30" }
    : score <= 2
      ? { label: "Modular Monolith (prepare to split)", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/30" }
      : { label: "Microservices make sense", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30" };

  const selectedStyles: Record<string, string> = {
    monolith: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    neutral: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    micro: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  };

  const getOptionStyle = (qId: string, weight: number, idx: number) => {
    const optionKey = idx === 0 ? "monolith" : idx === 1 ? "neutral" : "micro";
    if (answers[qId] === weight) return selectedStyles[optionKey];
    return "bg-muted/30 text-muted-foreground border-border/30 hover:bg-muted/50";
  };

  return (
    <div className="rounded-xl border border-violet-500/20 bg-violet-500/[0.02] overflow-hidden">
      <div className="flex items-center gap-2 border-b border-violet-500/20 bg-violet-500/[0.04] px-4 py-2">
        <div className="size-2 rounded-full bg-violet-500/50" />
        <span className="text-sm font-medium text-violet-400">Architecture Decision Framework</span>
      </div>
      <div className="p-4 space-y-4">
        {questions.map((q) => (
          <div key={q.id} className="space-y-2">
            <p className="text-sm font-medium">{q.question}</p>
            <div className="flex flex-wrap gap-2">
              {q.options.map((opt, idx) => (
                <button
                  key={opt}
                  onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: q.weights[idx] }))}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors",
                    getOptionStyle(q.id, q.weights[idx], idx)
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Result */}
        {allAnswered && (
          <div className={cn("rounded-xl border p-4 transition-all", recommendation.bg)}>
            <p className={cn("text-lg font-bold", recommendation.color)}>
              {recommendation.label}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {score <= -3
                ? "Your team is small, your domain is still evolving, and you lack the infrastructure to manage distributed systems. A well-structured monolith will let you move faster."
                : score <= 2
                  ? "You are at a crossover point. Build a modular monolith with clear domain boundaries so you can extract services when the pain justifies it."
                  : "You have the team size, domain clarity, and infrastructure maturity to benefit from microservices. Start extracting your most painful module first."}
            </p>
          </div>
        )}

        {!allAnswered && answered > 0 && (
          <p className="text-xs text-muted-foreground">
            Answer all {questions.length} questions to see a recommendation. ({answered}/{questions.length} answered)
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function MicroservicesVsMonolithPage() {
  return (
    <div className="space-y-8">
      <TopicHero
        title="Microservices vs Monolith"
        subtitle="The grass is always greener on the other architecture. Understanding when each one shines -- and when it collapses -- saves you years of regret."
        difficulty="intermediate"
      />

      <ConversationalCallout type="tip">
        In 2008, Netflix experienced a catastrophic database corruption that brought their entire
        monolithic DVD service down for three days. That outage triggered a seven-year migration to
        over 700 microservices handling 15+ billion API calls daily. But in 2023, Amazon Prime Video
        moved a monitoring tool <em>from</em> microservices <em>back to</em> a monolith, cutting costs
        by 90%. The lesson? There is no universally &quot;better&quot; architecture.
      </ConversationalCallout>

      {/* Playground 1: Architecture Comparison */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Architecture Comparison</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Toggle between architectures and press play to watch a request flow through each.
          Notice how the monolith handles it in a single hop, while microservices route through
          a gateway to multiple independent services.
        </p>
        <ArchitecturePlayground />
      </section>

      {/* Playground 2: Failure Cascade */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Failure Blast Radius</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Click to &quot;break&quot; a service and compare the damage. In a monolith, one crashed
          module takes everything down. In microservices, failures are isolated.
        </p>
        <FailureCascadePlayground />
      </section>

      <AhaMoment
        question="If microservices isolate failures, why not always use them?"
        answer={
          <p>
            Because isolation comes at a cost. Each service needs its own CI/CD pipeline, monitoring,
            database, and on-call rotation. You trade in-process function calls for network requests
            that can timeout, fail, or arrive out of order. Debugging &quot;why is the order page
            slow?&quot; goes from reading one stack trace to correlating traces across 6 services.
            Shopify handles 3 million merchants on a monolith. The complexity tax only pays off
            when you have the team size and operational maturity to manage it.
          </p>
        }
      />

      {/* Playground 3: Scaling */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Scaling Efficiency</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Drag the traffic slider to see how each architecture scales. The monolith must duplicate
          everything, while microservices can scale only the hot service. Watch the cost chart
          to see where the monolith approach becomes wasteful.
        </p>
        <ScalingPlayground />
      </section>

      <ConversationalCallout type="warning">
        The &quot;distributed monolith&quot; is the worst of both worlds. It happens when
        microservices are tightly coupled -- they must be deployed together, share a database,
        or make synchronous calls in long chains. You get the operational complexity of
        microservices with none of the independence. If your services cannot deploy independently,
        you do not have microservices -- you have a monolith with network calls.
      </ConversationalCallout>

      {/* Playground 4: Decision Framework */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Which Architecture Should You Pick?</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Answer five questions about your team and project. The framework will recommend
          the architecture that fits your current situation.
        </p>
        <DecisionFramework />
      </section>

      <ConversationalCallout type="tip">
        In interviews, never say &quot;microservices are better.&quot; The correct answer is always
        &quot;it depends on team size, domain complexity, and operational maturity.&quot; Then explain
        the tradeoffs for the specific scenario. Mention Netflix as an example of when the migration
        was the right call, and Amazon Prime Video as when reverting was smart.
      </ConversationalCallout>

      <KeyTakeaway
        points={[
          "A monolith is a single deployable unit -- simple to develop and deploy, but coupling becomes painful as the team grows beyond 10-15 engineers.",
          "Microservices decompose the system by business domain, enabling independent deployment and scaling at the cost of operational complexity.",
          "Start with a monolith. Extract services only when organizational pain (blocked deployments, team coupling) justifies the infrastructure investment.",
          "The 'distributed monolith' anti-pattern happens when microservices are tightly coupled -- services that must deploy together are not independent services.",
          "Each microservice should own its own data. Sharing a database between services recreates the coupling you were trying to escape.",
        ]}
      />
    </div>
  );
}
