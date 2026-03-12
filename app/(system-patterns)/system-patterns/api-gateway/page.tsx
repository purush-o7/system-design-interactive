"use client";

import { useState, useMemo, useCallback } from "react";
import { TopicHero } from "@/components/topic-hero";
import { KeyTakeaway } from "@/components/key-takeaway";
import { AhaMoment } from "@/components/aha-moment";
import { ConversationalCallout } from "@/components/conversational-callout";
import { Playground } from "@/components/playground";
import { FlowDiagram, type FlowNode, type FlowEdge } from "@/components/flow-diagram";
import { LiveChart } from "@/components/live-chart";
import { cn } from "@/lib/utils";
import {
  Shield, Gauge, Zap, ToggleLeft, ToggleRight,
  Smartphone, Monitor, AlertTriangle, CheckCircle2, XCircle,
} from "lucide-react";

// helper to reduce node boilerplate
function n(id: string, type: string, x: number, y: number, data: Record<string, unknown>): FlowNode {
  return { id, type, position: { x, y }, data: data as FlowNode["data"] };
}

// ─── Section 1: Request Routing Playground ───────────────────────────────────

const ROUTES: Record<string, { service: string; nodeId: string }> = {
  "/api/users": { service: "User Service", nodeId: "user-svc" },
  "/api/products": { service: "Product Service", nodeId: "product-svc" },
  "/api/orders": { service: "Order Service", nodeId: "order-svc" },
  "/api/payments": { service: "Payment Service", nodeId: "payment-svc" },
};

const STEPS = ["Auth Check", "Rate Limiting", "Transform", "Route Match"];

function RequestRoutingPlayground() {
  const [path, setPath] = useState("/api/users/123");
  const [step, setStep] = useState(-1);
  const [routed, setRouted] = useState(false);

  const match = useMemo(() => {
    const prefix = Object.keys(ROUTES).find((p) => path.startsWith(p));
    return prefix ? ROUTES[prefix] : null;
  }, [path]);

  const sendRequest = useCallback(() => {
    setRouted(false);
    setStep(0);
    let s = 0;
    const iv = setInterval(() => {
      s++;
      if (s < STEPS.length) setStep(s);
      else { setStep(STEPS.length); setRouted(true); clearInterval(iv); }
    }, 600);
  }, []);

  const nodes: FlowNode[] = useMemo(() => {
    const tid = match?.nodeId;
    const svcs = [
      ["user-svc", "User Service", 0], ["product-svc", "Product Service", 80],
      ["order-svc", "Order Service", 160], ["payment-svc", "Payment Service", 240],
    ] as const;
    return [
      n("client", "clientNode", 0, 120, { label: "Client", sublabel: path, status: step >= 0 ? "healthy" : "idle", handles: { right: true } }),
      n("gateway", "gatewayNode", 220, 100, {
        label: "API Gateway",
        sublabel: step >= 0 && step < STEPS.length ? STEPS[step] : routed ? "Routed!" : "Waiting...",
        status: step >= 0 ? "healthy" : "idle", handles: { left: true, right: true },
      }),
      ...svcs.map(([id, label, y]) =>
        n(id, "serverNode", 480, y, { label, status: routed && tid === id ? "healthy" : "idle", handles: { left: true } })
      ),
    ];
  }, [path, step, routed, match]);

  const edges: FlowEdge[] = useMemo(() => [
    { id: "c-gw", source: "client", target: "gateway", animated: step >= 0 },
    ...["user-svc", "product-svc", "order-svc", "payment-svc"].map((id) => ({
      id: `gw-${id}`, source: "gateway", target: id, animated: routed && match?.nodeId === id,
      style: { stroke: routed && match?.nodeId === id ? "#22c55e" : undefined, opacity: routed && match?.nodeId !== id ? 0.2 : 1 },
    })),
  ], [step, routed, match]);

  return (
    <Playground
      title="Request Routing Playground"
      canvas={<FlowDiagram nodes={nodes} edges={edges} minHeight={300} />}
      controls={false}
      explanation={
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">API Path</label>
            <input type="text" value={path}
              onChange={(e) => { setPath(e.target.value); setStep(-1); setRouted(false); }}
              className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>
          <button onClick={sendRequest} disabled={step >= 0 && !routed}
            className="w-full rounded-md bg-violet-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-40 transition-colors">
            Send Request
          </button>
          <div className="space-y-1.5">
            {STEPS.map((s, i) => (
              <div key={s} className={cn(
                "flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs transition-all duration-300",
                step > i ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                  : step === i ? "border-blue-500/30 bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20"
                  : "border-border/30 bg-muted/10 text-muted-foreground/40"
              )}>
                {step > i ? <CheckCircle2 className="size-3" /> : <span className="size-3" />}
                {s}
              </div>
            ))}
          </div>
          {routed && (
            <div className={cn("rounded-md border px-3 py-2 text-xs font-medium",
              match ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" : "border-red-500/30 bg-red-500/10 text-red-400"
            )}>
              {match ? `Routed to ${match.service}` : "No matching route -- 404 Not Found"}
            </div>
          )}
          {step === -1 && (
            <p className="text-xs text-muted-foreground/60">
              Type an API path and click Send Request. Watch it pass through auth, rate limiting,
              and transformation before routing to the correct service.
            </p>
          )}
        </div>
      }
    />
  );
}

// ─── Section 2: Gateway Features Demo ────────────────────────────────────────

type Feat = "auth" | "rateLimit" | "caching" | "circuitBreaker" | "aggregation";

const FEATS: { key: Feat; label: string; icon: React.ReactNode; color: string; latency: number }[] = [
  { key: "auth", label: "Authentication", icon: <Shield className="size-3.5" />, color: "text-blue-400", latency: 2 },
  { key: "rateLimit", label: "Rate Limiting", icon: <Gauge className="size-3.5" />, color: "text-amber-400", latency: 1 },
  { key: "caching", label: "Caching", icon: <Zap className="size-3.5" />, color: "text-emerald-400", latency: -30 },
  { key: "circuitBreaker", label: "Circuit Breaking", icon: <AlertTriangle className="size-3.5" />, color: "text-red-400", latency: 1 },
  { key: "aggregation", label: "Aggregation", icon: <Zap className="size-3.5" />, color: "text-violet-400", latency: -20 },
];

function GatewayFeaturesDemo() {
  const [on, setOn] = useState<Record<Feat, boolean>>({ auth: true, rateLimit: false, caching: false, circuitBreaker: false, aggregation: false });
  const toggle = (k: Feat) => setOn((p) => ({ ...p, [k]: !p[k] }));

  const active = FEATS.filter((f) => on[f.key]);
  const base = 120;
  const adjusted = Math.max(10, active.reduce((s, f) => s + f.latency, base));

  const chartData = useMemo(() => [
    { req: "1", features: adjusted, baseline: base },
    { req: "2", features: adjusted + 5, baseline: base + 8 },
    { req: "3", features: Math.max(10, adjusted - 10), baseline: base + 3 },
    { req: "4", features: adjusted + 2, baseline: base - 5 },
    { req: "5", features: Math.max(10, adjusted - 5), baseline: base + 12 },
  ], [adjusted]);

  const nodes: FlowNode[] = useMemo(() => [
    n("fc", "clientNode", 0, 60, { label: "Client", status: "healthy", handles: { right: true } }),
    n("fg", "gatewayNode", 100, 50, { label: "Gateway", sublabel: `${active.length} active`, status: "healthy", handles: { left: true, right: true } }),
    ...active.map((f, i) => n(`ff-${f.key}`, "serverNode", 200 + i * 120, 30, { label: f.label, status: "healthy", handles: { left: true, right: true } })),
    n("fb", "serverNode", 200 + Math.max(active.length, 1) * 120, 60, { label: "Backend", status: "healthy", handles: { left: true } }),
  ], [active]);

  const edges: FlowEdge[] = useMemo(() => {
    const e: FlowEdge[] = [{ id: "e-c-g", source: "fc", target: "fg", animated: true }];
    if (active.length === 0) {
      e.push({ id: "e-g-b", source: "fg", target: "fb", animated: true });
    } else {
      e.push({ id: "e-g-f0", source: "fg", target: `ff-${active[0].key}`, animated: true });
      active.forEach((f, i) => {
        if (i < active.length - 1) e.push({ id: `e-f${i}`, source: `ff-${f.key}`, target: `ff-${active[i + 1].key}`, animated: true });
      });
      e.push({ id: "e-fl-b", source: `ff-${active[active.length - 1].key}`, target: "fb", animated: true });
    }
    return e;
  }, [active]);

  return (
    <Playground
      title="Gateway Features Demo"
      canvas={<FlowDiagram nodes={nodes} edges={edges} minHeight={160} />}
      canvasHeight="min-h-[180px]"
      controls={false}
      explanation={
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground/70">
            Toggle features on/off. Each one appears as a pipeline step. Caching and aggregation
            reduce latency; auth and rate limiting add minimal overhead.
          </p>
          <div className="space-y-1.5">
            {FEATS.map((f) => (
              <button key={f.key} onClick={() => toggle(f.key)} className={cn(
                "flex items-center gap-2 w-full rounded-md border px-3 py-1.5 text-left text-xs transition-all",
                on[f.key] ? "border-violet-500/30 bg-violet-500/10" : "border-border/30 bg-muted/10 text-muted-foreground/60"
              )}>
                <span className={cn(on[f.key] ? f.color : "text-muted-foreground/40")}>{f.icon}</span>
                <span className="flex-1 font-medium">{f.label}</span>
                {on[f.key] ? <ToggleRight className="size-5 text-violet-400" /> : <ToggleLeft className="size-5 text-muted-foreground/30" />}
              </button>
            ))}
          </div>
          <div className="rounded-md border border-border/30 bg-muted/10 p-3">
            <div className="text-xs text-muted-foreground mb-2 font-medium">
              Avg Response: <span className="text-foreground">{adjusted}ms</span>
              <span className="text-muted-foreground/50 ml-1">(baseline: {base}ms)</span>
            </div>
            <LiveChart type="bar" data={chartData}
              dataKeys={{ x: "req", y: ["features", "baseline"], label: ["With Features", "Baseline"] }}
              height={130} unit="ms" />
          </div>
        </div>
      }
    />
  );
}

// ─── Section 3: BFF Pattern ──────────────────────────────────────────────────

function BffPatternPlayground() {
  const [client, setClient] = useState<"mobile" | "web">("mobile");
  const mob = client === "mobile";

  const nodes: FlowNode[] = useMemo(() => [
    n("mc", "clientNode", 0, 20, { label: "Mobile App", status: mob ? "healthy" : "idle", handles: { right: true } }),
    n("wc", "clientNode", 0, 180, { label: "Web App", status: !mob ? "healthy" : "idle", handles: { right: true } }),
    n("mb", "gatewayNode", 200, 10, { label: "Mobile BFF", sublabel: mob ? "Compact JSON" : undefined, status: mob ? "healthy" : "idle", handles: { left: true, right: true } }),
    n("wb", "gatewayNode", 200, 170, { label: "Web BFF", sublabel: !mob ? "Rich payload" : undefined, status: !mob ? "healthy" : "idle", handles: { left: true, right: true } }),
    n("us", "serverNode", 430, 0, { label: "User Svc", status: "healthy", handles: { left: true } }),
    n("os", "serverNode", 430, 80, { label: "Order Svc", status: "healthy", handles: { left: true } }),
    n("rs", "serverNode", 430, 160, { label: "Rec Svc", status: "healthy", handles: { left: true } }),
    n("as", "serverNode", 430, 240, { label: "Analytics", status: "healthy", handles: { left: true } }),
  ], [mob]);

  const edges: FlowEdge[] = useMemo(() => [
    { id: "mc-mb", source: "mc", target: "mb", animated: mob },
    { id: "wc-wb", source: "wc", target: "wb", animated: !mob },
    { id: "mb-us", source: "mb", target: "us", animated: mob, style: { opacity: mob ? 1 : 0.15 } },
    { id: "mb-os", source: "mb", target: "os", animated: mob, style: { opacity: mob ? 1 : 0.15 } },
    { id: "wb-us", source: "wb", target: "us", animated: !mob, style: { opacity: !mob ? 1 : 0.15 } },
    { id: "wb-os", source: "wb", target: "os", animated: !mob, style: { opacity: !mob ? 1 : 0.15 } },
    { id: "wb-rs", source: "wb", target: "rs", animated: !mob, style: { opacity: !mob ? 1 : 0.15 } },
    { id: "wb-as", source: "wb", target: "as", animated: !mob, style: { opacity: !mob ? 1 : 0.15 } },
  ], [mob]);

  return (
    <Playground
      title="Backend for Frontend (BFF) Pattern"
      canvas={<FlowDiagram nodes={nodes} edges={edges} minHeight={300} />}
      controls={false}
      explanation={
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground/70">
            Each client type gets its own gateway that aggregates exactly the data it needs.
          </p>
          <div className="flex gap-2">
            {([["mobile", "Mobile", Smartphone, "blue"] as const, ["web", "Web", Monitor, "emerald"] as const]).map(([val, label, Icon, col]) => (
              <button key={val} onClick={() => setClient(val)} className={cn(
                "flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-all",
                client === val
                  ? col === "blue" ? "border-blue-500/30 bg-blue-500/10 text-blue-400" : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                  : "border-border/30 bg-muted/10 text-muted-foreground/50"
              )}>
                <Icon className="size-3.5" /> {label}
              </button>
            ))}
          </div>
          <div className="rounded-md border border-border/30 bg-muted/10 p-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-medium text-muted-foreground">{mob ? "Mobile" : "Web"} Payload</span>
              <span className={cn("text-[10px] font-mono", mob ? "text-blue-400" : "text-emerald-400")}>
                {mob ? "~0.4 KB" : "~3.2 KB"}
              </span>
            </div>
            <pre className="text-[10px] font-mono text-muted-foreground/70 whitespace-pre overflow-x-auto">
              {mob
                ? '{ "user": { "name": "Alice" }, "orders": [{ "id": 1 }] }'
                : '{ "user": {..., "avatar", "preferences"}, "orders": [...], "recommendations": [...], "analytics": {...} }'}
            </pre>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className={cn("rounded-md border p-2", mob ? "border-blue-500/20 bg-blue-500/5" : "border-border/20 bg-muted/5")}>
              <div className="text-lg font-bold text-blue-400">2</div>
              <div className="text-[10px] text-muted-foreground">Services (Mobile)</div>
            </div>
            <div className={cn("rounded-md border p-2", !mob ? "border-emerald-500/20 bg-emerald-500/5" : "border-border/20 bg-muted/5")}>
              <div className="text-lg font-bold text-emerald-400">4</div>
              <div className="text-[10px] text-muted-foreground">Services (Web)</div>
            </div>
          </div>
        </div>
      }
    />
  );
}

// ─── Section 4: Single Point of Failure ──────────────────────────────────────

function GatewayFailurePlayground() {
  const [down, setDown] = useState(false);
  const [showFix, setShowFix] = useState(false);

  const singleNodes: FlowNode[] = useMemo(() => [
    n("sc", "clientNode", 0, 80, { label: "Clients", status: down ? "warning" : "healthy", handles: { right: true } }),
    n("sg", "gatewayNode", 200, 70, { label: "API Gateway", sublabel: down ? "DOWN!" : "Healthy", status: down ? "unhealthy" : "healthy", handles: { left: true, right: true } }),
    ...["A", "B", "C"].map((l, i) => n(`ss${i}`, "serverNode", 420, 20 + i * 80, {
      label: `Service ${l}`, sublabel: down ? "Unreachable" : undefined,
      status: down ? "idle" : "healthy", handles: { left: true },
    })),
  ], [down]);

  const singleEdges: FlowEdge[] = useMemo(() => [
    { id: "sc-sg", source: "sc", target: "sg", animated: !down, style: down ? { stroke: "#ef4444", strokeDasharray: "5 5" } : undefined },
    ...[0, 1, 2].map((i) => ({ id: `sg-s${i}`, source: "sg", target: `ss${i}`, animated: !down, style: { opacity: down ? 0.15 : 1 } })),
  ], [down]);

  const fixNodes: FlowNode[] = useMemo(() => [
    n("rc", "clientNode", 0, 100, { label: "Clients", status: "healthy", handles: { right: true } }),
    n("rlb", "loadBalancerNode", 170, 90, { label: "Load Balancer", status: "healthy", handles: { left: true, right: true } }),
    n("rg1", "gatewayNode", 340, 30, { label: "Gateway 1", status: "healthy", handles: { left: true, right: true } }),
    n("rg2", "gatewayNode", 340, 140, { label: "Gateway 2", status: "healthy", handles: { left: true, right: true } }),
    n("rs", "serverNode", 510, 80, { label: "Services", status: "healthy", handles: { left: true } }),
  ], []);

  const fixEdges: FlowEdge[] = useMemo(() => [
    { id: "rc-rlb", source: "rc", target: "rlb", animated: true },
    { id: "rlb-rg1", source: "rlb", target: "rg1", animated: true },
    { id: "rlb-rg2", source: "rlb", target: "rg2", animated: true },
    { id: "rg1-rs", source: "rg1", target: "rs", animated: true },
    { id: "rg2-rs", source: "rg2", target: "rs", animated: true },
  ], []);

  return (
    <Playground
      title="Gateway as Single Point of Failure"
      canvas={
        showFix
          ? <FlowDiagram nodes={fixNodes} edges={fixEdges} minHeight={240} />
          : <FlowDiagram nodes={singleNodes} edges={singleEdges} minHeight={240} />
      }
      canvasHeight="min-h-[250px]"
      controls={false}
      explanation={
        <div className="space-y-4">
          {!showFix ? (
            <>
              <p className="text-xs text-muted-foreground/70">
                A single gateway instance means one failure takes down everything.
              </p>
              <button onClick={() => setDown((p) => !p)} className={cn(
                "w-full rounded-md px-3 py-2 text-sm font-medium transition-all",
                down ? "bg-emerald-600 text-white hover:bg-emerald-700" : "bg-red-600 text-white hover:bg-red-700"
              )}>
                {down ? "Restore Gateway" : "Gateway Down!"}
              </button>
              {down && (
                <div className="space-y-2">
                  <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
                    <div className="flex items-center gap-1.5 font-medium mb-1">
                      <XCircle className="size-3.5" /> Total outage
                    </div>
                    All 3 services are healthy but unreachable. Every client request fails.
                  </div>
                  <button onClick={() => { setShowFix(true); setDown(false); }}
                    className="w-full rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-400 hover:bg-emerald-500/20 transition-colors">
                    Show the fix: Redundant Gateways
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-400">
                <div className="flex items-center gap-1.5 font-medium mb-1">
                  <CheckCircle2 className="size-3.5" /> High availability
                </div>
                A load balancer distributes traffic across multiple stateless gateway instances.
                If one goes down, the others absorb the traffic.
              </div>
              <div className="space-y-1.5 text-xs text-muted-foreground">
                {["Gateways are stateless -- any instance handles any request",
                  "Health checks detect failures in seconds",
                  "Horizontal scaling: just add more instances"].map((t) => (
                  <div key={t} className="flex items-start gap-2">
                    <CheckCircle2 className="size-3 text-emerald-400 mt-0.5 shrink-0" />{t}
                  </div>
                ))}
              </div>
              <button onClick={() => setShowFix(false)}
                className="w-full rounded-md border border-border/30 bg-muted/10 px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted/20 transition-colors">
                Back to single gateway
              </button>
            </>
          )}
        </div>
      }
    />
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function ApiGatewayPage() {
  return (
    <div className="space-y-8">
      <TopicHero
        title="API Gateway"
        subtitle="Give your clients one front door instead of making them memorize the addresses of 15 internal services."
        difficulty="intermediate"
      />

      <section className="space-y-3">
        <h2 className="text-xl font-bold">Request Routing</h2>
        <p className="text-sm text-muted-foreground">
          The gateway maintains a routing table mapping external URL paths to internal services.
          Type a path below and watch the request flow through the gateway pipeline -- auth,
          rate limiting, transformation -- before landing on the correct backend.
        </p>
        <RequestRoutingPlayground />
      </section>

      <ConversationalCallout type="tip">
        Path-based routing is the simplest strategy, but gateways can also route by HTTP header,
        query parameter, or request body. Kong and Envoy support regex matching and weighted
        routing for canary deployments.
      </ConversationalCallout>

      <section className="space-y-3">
        <h2 className="text-xl font-bold">Cross-Cutting Concerns</h2>
        <p className="text-sm text-muted-foreground">
          Without a gateway, every service must implement auth, rate limiting, caching, and
          circuit breaking independently -- 15 copies of the same logic. Toggle each feature
          below to see how it changes the pipeline and response times.
        </p>
        <GatewayFeaturesDemo />
      </section>

      <AhaMoment
        question="Doesn't adding features to the gateway increase latency?"
        answer={
          <p>
            Auth and rate limiting add ~1-3ms. But caching and aggregation can <em>save</em> 30-50ms
            by avoiding redundant backend calls. The net effect is usually faster, not slower.
            Gateway overhead (~1ms) is negligible compared to a backend call (~50-200ms).
          </p>
        }
      />

      <section className="space-y-3">
        <h2 className="text-xl font-bold">Backend for Frontend (BFF)</h2>
        <p className="text-sm text-muted-foreground">
          A single gateway serving all client types inevitably develops lowest-common-denominator
          responses. The BFF pattern gives each client type its own gateway. Netflix pioneered
          this -- their TV, mobile, and web apps each have a dedicated gateway.
        </p>
        <BffPatternPlayground />
      </section>

      <AhaMoment
        question="Isn't BFF just GraphQL?"
        answer={
          <p>
            Similar goal, different layer. GraphQL lets clients specify fields, but still needs a
            server to resolve queries. BFF operates at the infrastructure level -- composing and
            reshaping responses before they leave the data center. Many teams put GraphQL
            <em> behind</em> their BFF, combining both.
          </p>
        }
      />

      <section className="space-y-3">
        <h2 className="text-xl font-bold">Single Point of Failure</h2>
        <p className="text-sm text-muted-foreground">
          The gateway is a single chokepoint by design. If it goes down, every service becomes
          unreachable even if they are perfectly healthy. Crash the gateway below and see the
          blast radius, then discover the fix.
        </p>
        <GatewayFailurePlayground />
      </section>

      <ConversationalCallout type="warning">
        Do not put business logic in the gateway. It should handle routing, auth, rate limiting,
        and observability -- nothing more. Order validation and pricing logic in the gateway
        creates a &quot;smart pipe&quot; bottleneck. Keep the gateway thin.
      </ConversationalCallout>

      <KeyTakeaway
        points={[
          "An API gateway is a single entry point that routes external requests to internal services, decoupling clients from backend topology.",
          "It centralizes cross-cutting concerns: auth, rate limiting, TLS termination, logging, and response aggregation -- implemented once, applied everywhere.",
          "The BFF pattern gives each client type (mobile, web, partners) its own gateway tailored to its specific needs.",
          "Gateways must be stateless and clustered behind a load balancer. Use managed services (AWS API Gateway) or open source (Kong, Envoy).",
          "Keep the gateway thin: routing and policy enforcement only. Business logic belongs in the services.",
        ]}
      />
    </div>
  );
}
