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
import { InteractiveDemo } from "@/components/interactive-demo";
import { BeforeAfter } from "@/components/before-after";
import { MetricCounter } from "@/components/metric-counter";
import { AhaMoment } from "@/components/aha-moment";
import { ConversationalCallout } from "@/components/conversational-callout";
import { cn } from "@/lib/utils";
import { Shield, ArrowRight, Layers, Route, Lock, Activity, Gauge, CheckCircle2, XCircle, Zap } from "lucide-react";

function GatewayRoutingViz() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % 8), 1200);
    return () => clearInterval(t);
  }, []);

  const routes = [
    { path: "/api/auth/*", service: "Auth Service", port: ":3001", color: "bg-violet-500", active: step >= 2 && step < 4 },
    { path: "/api/orders/*", service: "Order Service", port: ":3002", color: "bg-blue-500", active: step >= 4 && step < 6 },
    { path: "/api/products/*", service: "Product Service", port: ":3003", color: "bg-emerald-500", active: step >= 6 },
    { path: "/api/search/*", service: "Search Service", port: ":3004", color: "bg-amber-500", active: false },
  ];

  const currentRequest = step < 2
    ? null
    : step < 4
    ? { path: "POST /api/auth/login", target: "Auth Service" }
    : step < 6
    ? { path: "GET /api/orders/123", target: "Order Service" }
    : { path: "GET /api/products?q=laptop", target: "Product Service" };

  return (
    <div className="space-y-4">
      {/* Incoming request */}
      <div className={cn(
        "flex items-center gap-2 justify-center transition-all duration-500",
        currentRequest ? "opacity-100" : "opacity-0"
      )}>
        <span className="text-[10px] font-mono text-muted-foreground">Client request:</span>
        <span className="text-[11px] font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
          {currentRequest?.path || "..."}
        </span>
      </div>

      {/* Gateway */}
      <div className={cn(
        "rounded-lg border p-3 transition-all",
        step >= 1 ? "border-blue-500/30 bg-blue-500/5" : "border-border bg-muted/10"
      )}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Route className="size-3.5 text-blue-400" />
            <span className="text-xs font-semibold">API Gateway</span>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground">api.myapp.com</span>
        </div>

        {/* Route table */}
        <div className="space-y-1">
          {routes.map((route) => (
            <div
              key={route.path}
              className={cn(
                "flex items-center gap-2 rounded px-2 py-1.5 transition-all duration-500",
                route.active
                  ? `${route.color}/10 ring-1 ring-current/10`
                  : "bg-muted/20"
              )}
            >
              <span className={cn(
                "text-[10px] font-mono w-32",
                route.active ? "font-bold" : "text-muted-foreground"
              )}>
                {route.path}
              </span>
              <ArrowRight className={cn(
                "size-3 transition-all",
                route.active ? "text-foreground" : "text-muted-foreground/30"
              )} />
              <span className={cn(
                "text-[10px] font-medium",
                route.active ? "text-foreground" : "text-muted-foreground/60"
              )}>
                {route.service}
              </span>
              <span className="text-[9px] font-mono text-muted-foreground/40 ml-auto">{route.port}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground/60 text-center">
        {step < 2
          ? "Gateway inspects incoming request path..."
          : step < 4
          ? "Matched /api/auth/* -- routing to Auth Service on port 3001"
          : step < 6
          ? "Matched /api/orders/* -- routing to Order Service on port 3002"
          : "Matched /api/products/* -- routing to Product Service on port 3003"}
      </p>
    </div>
  );
}

function RequestAggregationViz() {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setPhase((p) => (p + 1) % 10), 1000);
    return () => clearInterval(t);
  }, []);

  const services = [
    { name: "User Service", data: '{"name":"Alice"}', color: "text-violet-400", bg: "bg-violet-500" },
    { name: "Order Service", data: '{"orders":3}', color: "text-blue-400", bg: "bg-blue-500" },
    { name: "Recommendation", data: '{"items":[...]}', color: "text-emerald-400", bg: "bg-emerald-500" },
  ];

  return (
    <div className="space-y-4">
      {/* Client request */}
      <div className="flex items-center justify-center">
        <div className={cn(
          "rounded-lg border px-3 py-2 text-xs font-mono transition-all",
          phase >= 1 ? "border-blue-500/30 bg-blue-500/5 text-blue-400" : "border-border bg-muted/10 text-muted-foreground/40"
        )}>
          GET /api/dashboard
        </div>
      </div>

      {/* Arrow down to gateway */}
      <div className={cn(
        "flex justify-center transition-opacity",
        phase >= 1 ? "opacity-100" : "opacity-0"
      )}>
        <ArrowRight className="size-4 text-muted-foreground rotate-90" />
      </div>

      {/* Gateway */}
      <div className={cn(
        "rounded-lg border p-3 text-center transition-all",
        phase >= 2 ? "border-amber-500/30 bg-amber-500/5" : "border-border bg-muted/10"
      )}>
        <div className="flex items-center justify-center gap-1.5 mb-1">
          <Layers className="size-3.5 text-amber-400" />
          <span className="text-xs font-semibold">API Gateway (Aggregator)</span>
        </div>
        <span className={cn(
          "text-[10px] font-mono transition-opacity",
          phase >= 2 ? "opacity-100 text-muted-foreground" : "opacity-0"
        )}>
          {phase < 5 ? "Fan-out to 3 services in parallel..." : "Aggregating responses..."}
        </span>
      </div>

      {/* Fan-out to services */}
      <div className="grid grid-cols-3 gap-2">
        {services.map((svc, i) => (
          <div
            key={svc.name}
            className={cn(
              "rounded-lg border p-2 text-center transition-all duration-500",
              phase >= i + 3
                ? `${svc.bg}/10 border-current/20`
                : phase >= 2
                ? "border-border bg-muted/10 animate-pulse"
                : "border-border bg-muted/10"
            )}
          >
            <div className={cn(
              "text-[10px] font-medium transition-all",
              phase >= i + 3 ? svc.color : "text-muted-foreground/40"
            )}>
              {svc.name}
            </div>
            <div className={cn(
              "text-[9px] font-mono mt-1 transition-opacity",
              phase >= i + 3 ? "opacity-100 text-muted-foreground" : "opacity-0"
            )}>
              {svc.data}
            </div>
          </div>
        ))}
      </div>

      {/* Aggregated response */}
      {phase >= 7 && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <CheckCircle2 className="size-3 text-emerald-400" />
            <span className="text-[10px] font-semibold text-emerald-400">Aggregated Response (1 request, 3 services)</span>
          </div>
          <div className="font-mono text-[9px] text-muted-foreground">
            {`{"user":{"name":"Alice"},"orders":3,"recommendations":[...]}`}
          </div>
        </div>
      )}

      <p className="text-[11px] text-muted-foreground/60 text-center">
        {phase < 2
          ? "Client makes a single request for the dashboard..."
          : phase < 6
          ? "Gateway fans out to 3 services in parallel -- client doesn't know about them"
          : "All responses merged into one payload -- mobile client saves 2 round trips"}
      </p>
    </div>
  );
}

function CrossCuttingConcernsViz() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % 9), 1100);
    return () => clearInterval(t);
  }, []);

  const layers = [
    { label: "TLS Termination", icon: <Lock className="size-3" />, desc: "Decrypt HTTPS → forward HTTP internally", color: "text-emerald-400", bg: "bg-emerald-500" },
    { label: "Rate Limiting", icon: <Gauge className="size-3" />, desc: "100 req/min per API key", color: "text-amber-400", bg: "bg-amber-500" },
    { label: "Authentication", icon: <Shield className="size-3" />, desc: "Validate JWT / API key", color: "text-blue-400", bg: "bg-blue-500" },
    { label: "Request Logging", icon: <Activity className="size-3" />, desc: "Log method, path, latency, status", color: "text-violet-400", bg: "bg-violet-500" },
    { label: "Routing", icon: <Route className="size-3" />, desc: "Forward to backend service", color: "text-cyan-400", bg: "bg-cyan-500" },
  ];

  const rejected = step === 4;

  return (
    <div className="space-y-3">
      {/* Incoming request */}
      <div className="flex items-center justify-center gap-2">
        <span className="text-[10px] font-mono text-muted-foreground">Incoming:</span>
        <span className={cn(
          "text-[11px] font-mono px-2 py-0.5 rounded border transition-all",
          step >= 1 ? "bg-blue-500/10 border-blue-500/20 text-blue-400" : "bg-muted/20 border-border text-muted-foreground/40"
        )}>
          GET /api/orders/123
        </span>
      </div>

      {/* Layers */}
      <div className="space-y-1">
        {layers.map((layer, i) => {
          const isActive = step >= i + 1 && step <= i + 2;
          const isPassed = step > i + 1;
          return (
            <div
              key={layer.label}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 border transition-all duration-400",
                isActive
                  ? `${layer.bg}/10 border-current/20 ring-1 ring-current/10`
                  : isPassed
                  ? `${layer.bg}/5 border-current/10`
                  : "bg-muted/10 border-border/30"
              )}
            >
              <span className={cn(
                "transition-all",
                isActive || isPassed ? layer.color : "text-muted-foreground/30"
              )}>
                {layer.icon}
              </span>
              <span className={cn(
                "text-[11px] font-medium w-28",
                isActive ? "text-foreground" : isPassed ? "text-foreground/80" : "text-muted-foreground/40"
              )}>
                {layer.label}
              </span>
              <span className={cn(
                "text-[10px] flex-1",
                isActive || isPassed ? "text-muted-foreground" : "text-muted-foreground/20"
              )}>
                {layer.desc}
              </span>
              {isPassed && (
                <CheckCircle2 className="size-3 text-emerald-400" />
              )}
              {isActive && (
                <span className={cn("text-[9px] font-mono", layer.color)}>processing...</span>
              )}
            </div>
          );
        })}
      </div>

      {step >= 7 && (
        <div className="flex items-center justify-center gap-2 text-[11px] text-emerald-400 font-medium">
          <CheckCircle2 className="size-3.5" />
          Request passed all layers → forwarded to Order Service
        </div>
      )}

      <p className="text-[11px] text-muted-foreground/60 text-center">
        {step < 2
          ? "Request enters the gateway pipeline..."
          : step < 6
          ? "Each layer processes the request in sequence -- any layer can reject it"
          : "All cross-cutting concerns handled once, not duplicated across 15 services"}
      </p>
    </div>
  );
}

function GatewayVsDirectViz() {
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setFrame((f) => (f + 1) % 6), 1500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Without gateway */}
      <div className="space-y-2 rounded-lg border border-red-500/20 bg-red-500/5 p-3">
        <h4 className="text-xs font-semibold text-red-400">Direct Client-to-Service</h4>
        <div className="space-y-1.5">
          {[
            { label: "Service URLs", value: "15 hardcoded", bad: true },
            { label: "Auth logic", value: "15 implementations", bad: true },
            { label: "Rate limiting", value: "15 implementations", bad: true },
            { label: "API calls/page", value: "5-10 round trips", bad: true },
            { label: "Service move", value: "Breaking change", bad: true },
            { label: "Protocol", value: "Client handles gRPC", bad: true },
          ].map((item) => (
            <div key={item.label} className="flex justify-between text-[11px]">
              <span className="text-muted-foreground">{item.label}</span>
              <span className="font-mono text-red-400">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* With gateway */}
      <div className="space-y-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
        <h4 className="text-xs font-semibold text-emerald-400">Via API Gateway</h4>
        <div className="space-y-1.5">
          {[
            { label: "Service URLs", value: "1 gateway URL" },
            { label: "Auth logic", value: "1 implementation" },
            { label: "Rate limiting", value: "1 implementation" },
            { label: "API calls/page", value: "1 (aggregated)" },
            { label: "Service move", value: "Update routing table" },
            { label: "Protocol", value: "REST/GraphQL → gRPC" },
          ].map((item, i) => (
            <div key={item.label} className={cn(
              "flex justify-between text-[11px] transition-all",
              frame > i ? "opacity-100" : "opacity-40"
            )}>
              <span className="text-muted-foreground">{item.label}</span>
              <span className={cn("font-mono", frame > i ? "text-emerald-400" : "text-muted-foreground/40")}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BffPatternViz() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setActive((a) => (a + 1) % 3), 2000);
    return () => clearInterval(t);
  }, []);

  const bffs = [
    { client: "Mobile App", gateway: "Mobile BFF", needs: "Compact JSON, paginated, low bandwidth", color: "blue" },
    { client: "Web App", gateway: "Web BFF", needs: "Rich payloads, GraphQL, real-time updates", color: "emerald" },
    { client: "Partner API", gateway: "Partner BFF", needs: "REST, API keys, strict rate limits", color: "amber" },
  ];

  const colorMap: Record<string, { row: string; badge: string }> = {
    blue: { row: "bg-blue-500/8 border-blue-500/20", badge: "bg-blue-500/10 border-blue-500/30 text-blue-400" },
    emerald: { row: "bg-emerald-500/8 border-emerald-500/20", badge: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" },
    amber: { row: "bg-amber-500/8 border-amber-500/20", badge: "bg-amber-500/10 border-amber-500/30 text-amber-400" },
  };

  return (
    <div className="space-y-3">
      {bffs.map((bff, i) => (
        <div key={bff.client} className={cn(
          "flex items-center gap-2 rounded-lg border px-3 py-2.5 transition-all duration-500",
          i === active ? colorMap[bff.color].row : "bg-muted/10 border-border/30"
        )}>
          <div className="w-20 text-xs font-semibold shrink-0">{bff.client}</div>
          <div className={cn("text-lg transition-all", i === active ? "opacity-100" : "opacity-30")}>→</div>
          <div className={cn(
            "rounded-md border px-2 py-1 text-[11px] font-mono font-medium shrink-0 transition-all",
            i === active ? colorMap[bff.color].badge : "bg-muted/20 border-border/50 text-muted-foreground/40"
          )}>
            {bff.gateway}
          </div>
          <div className={cn("text-lg transition-all", i === active ? "opacity-100" : "opacity-30")}>→</div>
          <div className={cn(
            "flex-1 text-[10px] transition-all",
            i === active ? "text-muted-foreground" : "text-muted-foreground/30"
          )}>
            {bff.needs}
          </div>
        </div>
      ))}
      <p className="text-[11px] text-muted-foreground/60 pt-1">
        Each BFF tailors the API to its client&apos;s specific needs. All BFFs share the same backend services.
      </p>
    </div>
  );
}

export default function ApiGatewayPage() {
  return (
    <div className="space-y-8">
      <TopicHero
        title="API Gateway"
        subtitle="Give your clients one front door instead of making them memorize the addresses of 15 internal services."
        difficulty="intermediate"
      />

      <FailureScenario title="Every frontend hardcodes 15 internal service URLs">
        <p className="text-sm text-muted-foreground">
          Your mobile app, web app, and partner API all talk directly to your microservices. The
          mobile app has hardcoded URLs for Auth, Orders, Products, Search, Payments --{" "}
          <strong>15 services in total</strong>. When you move the Product service to a new host,
          the mobile app breaks. When you need to add rate limiting, you implement it in 15 places.
          When a partner needs an API key, you add auth logic to every single service.
        </p>
        <div className="flex flex-col items-center gap-3 py-4">
          <div className="flex gap-3">
            <ServerNode type="client" label="Mobile App" status="warning" />
            <ServerNode type="client" label="Web App" status="warning" />
            <ServerNode type="client" label="Partner API" status="warning" />
          </div>
          <div className="text-xs text-muted-foreground">each hardcodes 15 internal URLs</div>
          <div className="flex gap-2 flex-wrap justify-center">
            <ServerNode type="server" label="Auth" status="healthy" />
            <ServerNode type="server" label="Orders" status="healthy" />
            <ServerNode type="server" label="Products" status="warning" />
            <ServerNode type="server" label="Search" status="healthy" />
            <ServerNode type="server" label="Payments" status="healthy" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <MetricCounter label="Service URLs" value={15} unit="per client" trend="up" />
          <MetricCounter label="Auth Implementations" value={15} unit="copies" trend="up" />
          <MetricCounter label="API Calls / Page" value={8} unit="round trips" trend="up" />
        </div>
      </FailureScenario>

      <WhyItBreaks title="Direct client-to-service coupling is fragile">
        <p className="text-sm text-muted-foreground">
          When clients talk directly to backend services, every operational concern must be
          duplicated across every service. This creates an N x M coupling problem that scales
          terribly.
        </p>
        <div className="grid grid-cols-2 gap-2 mt-3">
          {[
            { n: "1", label: "Service Discovery", desc: "Clients must track every service address" },
            { n: "2", label: "Cross-Cutting Concerns", desc: "Auth, rate limits, logging x15" },
            { n: "3", label: "Protocol Mismatch", desc: "Mobile needs REST, services use gRPC" },
            { n: "4", label: "Chatty APIs", desc: "10 calls per page load on mobile" },
            { n: "5", label: "Security Exposure", desc: "Internal endpoints on public internet" },
            { n: "6", label: "Version Coupling", desc: "Can't evolve APIs independently" },
          ].map((item) => (
            <div key={item.n} className="flex items-start gap-2.5 rounded-lg bg-muted/30 p-3">
              <span className="text-xs font-mono font-bold text-red-400 bg-red-500/10 rounded-md size-6 flex items-center justify-center shrink-0">
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

      <ConceptVisualizer title="The API Gateway as Front Door">
        <p className="text-sm text-muted-foreground mb-4">
          An API gateway is a single entry point that sits between clients and your internal
          services. All external traffic flows through the gateway. Clients know one URL. The
          gateway knows the internal topology and routes accordingly. Services can move, scale,
          or change protocols without any client changes.
        </p>
        <GatewayVsDirectViz />
      </ConceptVisualizer>

      <ConceptVisualizer title="Gateway Routing in Action">
        <p className="text-sm text-muted-foreground mb-4">
          The gateway maintains a routing table that maps external URL paths to internal services.
          When a request arrives, it matches the path pattern and forwards to the corresponding
          backend. Services can move hosts, change ports, or scale horizontally -- the routing
          table is the only thing that needs updating.
        </p>
        <GatewayRoutingViz />
      </ConceptVisualizer>

      <ConceptVisualizer title="Cross-Cutting Concerns Pipeline">
        <p className="text-sm text-muted-foreground mb-4">
          Every request passes through a pipeline of middleware layers before reaching the backend
          service. TLS termination, rate limiting, authentication, and logging all happen at the
          gateway -- implemented once, applied to every request. Any layer can reject the request
          (invalid token, rate limit exceeded) before it ever reaches your services.
        </p>
        <CrossCuttingConcernsViz />
      </ConceptVisualizer>

      <ConceptVisualizer title="What the Gateway Handles">
        <p className="text-sm text-muted-foreground mb-4">
          These are the responsibilities of the gateway. Each one would otherwise need to be
          implemented in every individual service -- the gateway centralizes them.
        </p>
        <AnimatedFlow
          steps={[
            { id: "tls", label: "TLS Termination", description: "Decrypt HTTPS, forward plain HTTP internally", icon: <Lock className="size-4" /> },
            { id: "auth", label: "Authentication", description: "Validate JWT tokens or API keys", icon: <Shield className="size-4" /> },
            { id: "rate", label: "Rate Limiting", description: "Enforce per-client request quotas", icon: <Gauge className="size-4" /> },
            { id: "route", label: "Routing", description: "Map /api/orders to the Order service", icon: <Route className="size-4" /> },
            { id: "transform", label: "Response", description: "Transform, aggregate, or cache", icon: <Zap className="size-4" /> },
          ]}
          interval={1800}
        />
      </ConceptVisualizer>

      <ConceptVisualizer title="Request Aggregation (API Composition)">
        <p className="text-sm text-muted-foreground mb-4">
          A single client request (e.g., &quot;load the dashboard&quot;) can fan out to multiple
          backend services in parallel. The gateway collects all responses and merges them into one
          payload. This is critical for mobile clients on slow networks -- one round trip instead
          of five reduces latency by 4x and saves battery.
        </p>
        <RequestAggregationViz />
        <ConversationalCallout type="tip">
          This pattern is sometimes called &quot;API Composition&quot; or &quot;Backend for
          Frontend&quot; (BFF). Netflix pioneered BFF -- their mobile, TV, and web apps each have
          a dedicated gateway that aggregates exactly the data that client needs, in the format
          it needs.
        </ConversationalCallout>
      </ConceptVisualizer>

      <CorrectApproach title="Gateway Responsibilities in Detail">
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold flex items-center gap-1.5">
              <Route className="size-3.5 text-blue-400" /> Request Routing
            </h4>
            <p className="text-sm text-muted-foreground">
              Map external URL paths to internal services.{" "}
              <code className="text-xs bg-muted px-1 rounded">/api/orders/*</code> goes to the
              Order service. <code className="text-xs bg-muted px-1 rounded">/api/products/*</code>{" "}
              goes to the Product service. Route by path, header, query param, or even request body.
              Services can move hosts without any client change.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold flex items-center gap-1.5">
              <Shield className="size-3.5 text-emerald-400" /> Authentication and Authorization
            </h4>
            <p className="text-sm text-muted-foreground">
              Validate tokens once at the gateway instead of in every service. The gateway verifies
              the JWT signature, checks expiration, and attaches the decoded user identity to request
              headers. Backend services trust the gateway and skip re-validation. This is also where
              you enforce API key quotas for partner integrations.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold flex items-center gap-1.5">
              <Gauge className="size-3.5 text-amber-400" /> Rate Limiting and Throttling
            </h4>
            <p className="text-sm text-muted-foreground">
              Enforce request limits per client, per API key, or per endpoint. Token bucket or
              sliding window algorithms track usage. When a client exceeds their quota, the gateway
              returns 429 Too Many Requests immediately -- the request never reaches your backend.
              This protects services from abuse and DDoS without any per-service logic.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold flex items-center gap-1.5">
              <Layers className="size-3.5 text-violet-400" /> Protocol Translation
            </h4>
            <p className="text-sm text-muted-foreground">
              Internal services can use gRPC (fast, binary, typed) while exposing REST or GraphQL
              to external clients. The gateway translates between protocols. This lets you choose
              the optimal internal protocol without constraining what clients can consume. Kong and
              Envoy both support gRPC-to-JSON transcoding natively.
            </p>
          </div>
        </div>
      </CorrectApproach>

      <BeforeAfter
        before={{
          title: "Without Gateway",
          content: (
            <div className="flex flex-col items-center gap-2">
              <ServerNode type="client" label="Client" status="warning" />
              <div className="text-xs text-muted-foreground space-y-1">
                <div>→ auth.internal:3001</div>
                <div>→ orders.internal:3002</div>
                <div>→ products.internal:3003</div>
                <div>→ search.internal:3004</div>
                <div className="text-red-500">→ payments.internal:3005 (moved!)</div>
              </div>
            </div>
          ),
        }}
        after={{
          title: "With Gateway",
          content: (
            <div className="flex flex-col items-center gap-2">
              <ServerNode type="client" label="Client" status="healthy" />
              <span className="text-xs text-green-600 font-medium">→ api.myapp.com</span>
              <ServerNode type="loadbalancer" label="API Gateway" status="healthy" />
              <span className="text-xs text-muted-foreground">routes internally, invisibly</span>
            </div>
          ),
        }}
      />

      <ConceptVisualizer title="Gateway in a Microservices Architecture">
        <p className="text-sm text-muted-foreground mb-4">
          In production, the gateway sits behind a load balancer and in front of all backend
          services. Multiple gateway instances run in parallel for high availability. The gateway
          itself is stateless -- any instance can handle any request -- making horizontal scaling
          straightforward.
        </p>
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="flex gap-4">
            <ServerNode type="client" label="Mobile" status="healthy" />
            <ServerNode type="client" label="Web" status="healthy" />
            <ServerNode type="client" label="Partners" status="healthy" />
          </div>
          <ServerNode type="loadbalancer" label="Load Balancer" sublabel="distributes across gateway instances" status="healthy" />
          <div className="flex gap-3">
            <ServerNode type="loadbalancer" label="Gateway 1" status="healthy" />
            <ServerNode type="loadbalancer" label="Gateway 2" status="healthy" />
            <ServerNode type="loadbalancer" label="Gateway 3" status="healthy" />
          </div>
          <div className="flex gap-3 flex-wrap justify-center">
            <ServerNode type="server" label="Auth" status="healthy" />
            <ServerNode type="server" label="Orders" status="healthy" />
            <ServerNode type="server" label="Products" status="healthy" />
            <ServerNode type="server" label="Search" status="healthy" />
            <ServerNode type="cache" label="Cache" status="healthy" />
            <ServerNode type="database" label="Database" status="healthy" />
          </div>
        </div>
      </ConceptVisualizer>

      <InteractiveDemo title="Gateway Request Flow">
        {({ isPlaying, tick }) => {
          const stages = [
            { name: "TLS Termination", time: "0.2ms", desc: "HTTPS decrypted, forwarding HTTP internally", status: "pass" },
            { name: "Rate Limit Check", time: "0.1ms", desc: "Client at 45/100 requests per minute", status: "pass" },
            { name: "JWT Validation", time: "0.5ms", desc: "Token signature valid, user_id: 12345", status: "pass" },
            { name: "Route Matching", time: "0.1ms", desc: "/api/orders/123 → Order Service", status: "pass" },
            { name: "Backend Call", time: "45ms", desc: "Order Service returns 200 OK", status: "pass" },
            { name: "Response Logged", time: "0.1ms", desc: "GET /api/orders/123 → 200 (46ms)", status: "pass" },
          ];
          const active = isPlaying ? Math.min(tick % 8, stages.length) : 0;

          return (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Press play to trace a single request through the gateway pipeline. Notice that the
                gateway overhead (~1ms) is negligible compared to the backend call (~45ms).
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
                      "text-[10px] font-mono w-10 text-right",
                      i < active ? "text-muted-foreground" : "text-transparent"
                    )}>
                      {stage.time}
                    </span>
                    <span className={cn(
                      "text-xs font-medium w-28",
                      i < active ? "text-foreground" : ""
                    )}>
                      {stage.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground flex-1">
                      {i < active ? stage.desc : "--"}
                    </span>
                    {i < active && <CheckCircle2 className="size-3 text-emerald-400" />}
                  </div>
                ))}
              </div>
              {active >= stages.length && (
                <div className="grid grid-cols-3 gap-3">
                  <MetricCounter label="Gateway overhead" value={1} unit="ms" trend="down" />
                  <MetricCounter label="Backend time" value={45} unit="ms" trend="neutral" />
                  <MetricCounter label="Total latency" value={46} unit="ms" trend="neutral" />
                </div>
              )}
            </div>
          );
        }}
      </InteractiveDemo>

      <AhaMoment
        question="Doesn't the API gateway become a single point of failure?"
        answer={
          <p>
            Yes -- and that&apos;s why you never run just one. API gateways are deployed as a
            stateless cluster behind a load balancer (or use a managed service like AWS API Gateway,
            which handles this for you). Because gateways hold no session state, any instance can
            handle any request. Scaling horizontally is trivial. Kong, Envoy, and AWS API Gateway
            all support this pattern out of the box.
          </p>
        }
      />

      <AhaMoment
        question="When should I NOT use an API gateway?"
        answer={
          <p>
            If you have a monolith with one or two services, a gateway adds complexity without much
            benefit -- a simple reverse proxy (nginx) is sufficient. Gateways shine when you have
            5+ microservices, multiple client types (web, mobile, partners), and need centralized
            auth/rate-limiting. Don&apos;t adopt the pattern until you feel the pain it solves.
          </p>
        }
      />

      <ConversationalCallout type="warning">
        Do not put business logic in the gateway. It should handle routing, auth, rate limiting,
        and observability -- nothing more. The moment you start writing order validation or pricing
        logic in the gateway, you&apos;ve created a &quot;smart pipe&quot; that becomes a bottleneck
        and a maintenance nightmare. Keep the gateway thin.
      </ConversationalCallout>

      <ConceptVisualizer title="The BFF Pattern — One Gateway Per Client">
        <p className="text-sm text-muted-foreground mb-4">
          A single gateway serving mobile, web, and partner clients inevitably develops
          lowest-common-denominator responses. The Backend-for-Frontend (BFF) pattern solves this:
          each client type gets its own gateway that tailors responses to its needs. Netflix
          pioneered this — their TV, mobile, and web apps each have a dedicated gateway that
          aggregates exactly the data that client needs, in the format it needs.
        </p>
        <BffPatternViz />
        <AhaMoment
          question="Isn't this just GraphQL?"
          answer={
            <p>
              Similar goal, different layer. GraphQL lets clients specify what fields they want, but
              still needs a server to resolve those queries. BFF operates at the infrastructure level —
              composing, filtering, and reshaping responses before they leave the data center. In
              practice, many teams put a GraphQL server <em>behind</em> their BFF gateway, combining
              the benefits of both approaches.
            </p>
          }
        />
      </ConceptVisualizer>

      <ConceptVisualizer title="Real-World API Gateways">
        <p className="text-sm text-muted-foreground mb-4">
          You do not have to build a gateway from scratch. These are battle-tested options, each
          with different strengths depending on your infrastructure:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rounded-lg border bg-muted/20 p-3 space-y-2">
            <h4 className="text-sm font-semibold text-blue-400">Kong</h4>
            <p className="text-[11px] text-muted-foreground">
              Open-source, built on Nginx and OpenResty. Plugin ecosystem for auth, rate limiting,
              transformations, and logging. Runs self-hosted or as Kong Konnect (managed).
              Declarative config via YAML or the Admin API. Great for teams that want full control.
            </p>
            <div className="text-[10px] font-mono text-muted-foreground/60">Lua + Nginx | Plugin-based</div>
          </div>
          <div className="rounded-lg border bg-muted/20 p-3 space-y-2">
            <h4 className="text-sm font-semibold text-amber-400">AWS API Gateway</h4>
            <p className="text-[11px] text-muted-foreground">
              Fully managed, pay-per-request. Two flavors: REST API (feature-rich, request/response
              transforms, caching) and HTTP API (cheaper, faster, less config). Integrates natively
              with Lambda, IAM, Cognito, and WAF. Best for AWS-native architectures.
            </p>
            <div className="text-[10px] font-mono text-muted-foreground/60">Managed | Pay-per-request</div>
          </div>
          <div className="rounded-lg border bg-muted/20 p-3 space-y-2">
            <h4 className="text-sm font-semibold text-emerald-400">Envoy</h4>
            <p className="text-[11px] text-muted-foreground">
              High-performance L4/L7 proxy from Lyft. Powers Istio service mesh. Excels at protocol
              translation (HTTP/1.1 to gRPC), observability (built-in stats, tracing), and dynamic
              config via xDS API. Ideal for Kubernetes-native environments.
            </p>
            <div className="text-[10px] font-mono text-muted-foreground/60">C++ | Service Mesh native</div>
          </div>
        </div>
      </ConceptVisualizer>

      <CorrectApproach title="Choosing the Right Gateway Strategy">
        <BeforeAfter
          before={{
            title: "One gateway for everything",
            content: (
              <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                <li>Mobile gets bloated responses</li>
                <li>Web misses rich data it could use</li>
                <li>Partners need different auth model</li>
                <li>Gateway config becomes massive</li>
                <li>Every change risks all clients</li>
              </ul>
            ),
          }}
          after={{
            title: "BFF pattern per client type",
            content: (
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>Mobile BFF: compact JSON, paginated</li>
                <li>Web BFF: GraphQL, real-time updates</li>
                <li>Partner BFF: REST, API keys, strict limits</li>
                <li>Each BFF owned by its frontend team</li>
                <li>Changes isolated to one client type</li>
              </ul>
            ),
          }}
        />
      </CorrectApproach>

      <ConversationalCallout type="tip">
        In a system design interview, mentioning the API gateway is expected — but what
        differentiates strong candidates is explaining <em>why</em> it matters. Talk about
        cross-cutting concerns, the BFF pattern, and the tradeoff between a single gateway
        and per-client BFFs. Bonus points for mentioning Envoy&apos;s sidecar pattern in
        Kubernetes or Kong&apos;s plugin architecture.
      </ConversationalCallout>

      <ConversationalCallout type="question">
        How do you handle gateway failures gracefully? Implement circuit breakers at the gateway
        level. If the Order Service is down, the gateway can return a cached response or a
        degraded payload (dashboard without order data) instead of failing the entire request.
        Kong and Envoy both support circuit breaker configurations per upstream service.
      </ConversationalCallout>

      <KeyTakeaway
        points={[
          "An API gateway is a single entry point that routes external requests to internal services, completely decoupling clients from backend topology.",
          "It centralizes cross-cutting concerns: auth, rate limiting, TLS termination, logging, and response aggregation -- implemented once, applied everywhere.",
          "Request aggregation (API composition) lets a single client request fan out to multiple services, reducing mobile round trips from 5-10 to 1.",
          "Gateways must be stateless and deployed as a cluster for high availability. Use managed services (AWS API Gateway) or battle-tested open source (Kong, Envoy).",
          "Keep the gateway thin: routing and policy enforcement only. Business logic belongs in the services, not the gateway.",
          "Consider BFF (Backend for Frontend) when different clients need fundamentally different API shapes -- one gateway per client type.",
        ]}
      />
    </div>
  );
}
