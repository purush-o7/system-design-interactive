"use client";

import { useState, useMemo } from "react";
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
import { cn } from "@/lib/utils";
import { Lock, Zap, HardDrive, ShieldCheck, ArrowRight, Server } from "lucide-react";

// ─── Forward vs Reverse Proxy Toggle ───────────────────────────────────────

function ProxyToggle() {
  const [mode, setMode] = useState<"forward" | "reverse">("forward");

  const forwardNodes: FlowNode[] = [
    { id: "client", type: "clientNode", position: { x: 60, y: 140 }, data: { label: "Client", sublabel: "IP hidden from server", status: "healthy", handles: { right: true } } },
    { id: "fproxy", type: "gatewayNode", position: { x: 240, y: 140 }, data: { label: "Forward Proxy", sublabel: "Client-side", status: "warning", handles: { left: true, right: true } } },
    { id: "internet", type: "serverNode", position: { x: 420, y: 60 }, data: { label: "Server A", sublabel: "Sees proxy IP", status: "idle", handles: { left: true } } },
    { id: "internet2", type: "serverNode", position: { x: 420, y: 200 }, data: { label: "Server B", sublabel: "Sees proxy IP", status: "idle", handles: { left: true } } },
  ];

  const forwardEdges: FlowEdge[] = [
    { id: "e1", source: "client", target: "fproxy", label: "HTTPS request", animated: true },
    { id: "e2", source: "fproxy", target: "internet", label: "forwarded", animated: true },
    { id: "e3", source: "fproxy", target: "internet2", animated: true },
  ];

  const reverseNodes: FlowNode[] = [
    { id: "client", type: "clientNode", position: { x: 60, y: 140 }, data: { label: "Client", sublabel: "Sees proxy IP only", status: "healthy", handles: { right: true } } },
    { id: "rproxy", type: "loadBalancerNode", position: { x: 260, y: 140 }, data: { label: "Reverse Proxy", sublabel: "Server-side (Nginx)", status: "healthy", handles: { left: true, right: true }, metrics: [{ label: "SSL", value: "on" }, { label: "Cache", value: "on" }] } },
    { id: "b1", type: "serverNode", position: { x: 460, y: 40 }, data: { label: "Backend 1", sublabel: "10.0.0.1 (private)", status: "healthy", handles: { left: true } } },
    { id: "b2", type: "serverNode", position: { x: 460, y: 140 }, data: { label: "Backend 2", sublabel: "10.0.0.2 (private)", status: "healthy", handles: { left: true } } },
    { id: "b3", type: "serverNode", position: { x: 460, y: 240 }, data: { label: "Backend 3", sublabel: "10.0.0.3 (private)", status: "healthy", handles: { left: true } } },
  ];

  const reverseEdges: FlowEdge[] = [
    { id: "e1", source: "client", target: "rproxy", label: "HTTPS (public)", animated: true },
    { id: "e2", source: "rproxy", target: "b1", label: "HTTP (private)", animated: true },
    { id: "e3", source: "rproxy", target: "b2", animated: true },
    { id: "e4", source: "rproxy", target: "b3", animated: true },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={() => setMode("forward")}
          className={cn(
            "rounded-full px-4 py-1.5 text-xs font-semibold transition-all border",
            mode === "forward"
              ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
              : "bg-muted/20 text-muted-foreground border-border hover:border-amber-500/20"
          )}
        >
          Forward Proxy
        </button>
        <button
          onClick={() => setMode("reverse")}
          className={cn(
            "rounded-full px-4 py-1.5 text-xs font-semibold transition-all border",
            mode === "reverse"
              ? "bg-blue-500/15 text-blue-400 border-blue-500/30"
              : "bg-muted/20 text-muted-foreground border-border hover:border-blue-500/20"
          )}
        >
          Reverse Proxy
        </button>
      </div>

      <FlowDiagram
        nodes={mode === "forward" ? forwardNodes : reverseNodes}
        edges={mode === "forward" ? forwardEdges : reverseEdges}
        allowDrag={false}
        minHeight={320}
      />

      <div className={cn(
        "rounded-lg border p-3 text-xs space-y-1.5 transition-all",
        mode === "forward" ? "border-amber-500/20 bg-amber-500/5" : "border-blue-500/20 bg-blue-500/5"
      )}>
        {mode === "forward" ? (
          <>
            <p className="font-semibold text-amber-400">Forward Proxy — protects the client</p>
            <p className="text-muted-foreground">The proxy sits on the client side. The server only sees the proxy's IP, never the real client. Used for VPNs, corporate filtering, and geo-bypass.</p>
            <p className="text-muted-foreground/60 font-mono text-[10px]">Client knows proxy exists → Proxy contacts server → Server knows only proxy IP</p>
          </>
        ) : (
          <>
            <p className="font-semibold text-blue-400">Reverse Proxy — protects the server</p>
            <p className="text-muted-foreground">The proxy sits on the server side. The client only sees the proxy's IP (e.g., proxy.example.com), never the real backends. Handles SSL, caching, load balancing.</p>
            <p className="text-muted-foreground/60 font-mono text-[10px]">Client knows only proxy IP → Proxy routes to backends → Backend IPs never exposed</p>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Feature Toggle Playground ─────────────────────────────────────────────

type ProxyFeature = "ssl" | "cache" | "compression" | "auth";

const FEATURES: { id: ProxyFeature; label: string; icon: React.ReactNode; color: string; latencySaved: number; desc: string }[] = [
  { id: "ssl", label: "SSL Termination", icon: <Lock className="size-3.5" />, color: "text-emerald-400", latencySaved: 0, desc: "Decrypt HTTPS at the proxy. Backends run plain HTTP — no per-server TLS overhead." },
  { id: "cache", label: "Caching", icon: <HardDrive className="size-3.5" />, color: "text-amber-400", latencySaved: 42, desc: "Serve cached responses in <1ms. Cache hits skip the backend entirely." },
  { id: "compression", label: "Compression", icon: <Zap className="size-3.5" />, color: "text-blue-400", latencySaved: 5, desc: "gzip/brotli responses. Reduces payload size by 60-80%, saving transfer time." },
  { id: "auth", label: "Auth Gateway", icon: <ShieldCheck className="size-3.5" />, color: "text-violet-400", latencySaved: -2, desc: "Validate tokens at the proxy. Backends skip auth logic entirely." },
];

function FeaturePlayground() {
  const [enabled, setEnabled] = useState<Set<ProxyFeature>>(new Set());

  const toggleFeature = (id: ProxyFeature) => {
    setEnabled((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const baseLatency = 52;
  const latency = Math.max(
    3,
    baseLatency - FEATURES.filter((f) => enabled.has(f.id)).reduce((sum, f) => sum + f.latencySaved, 0)
  );

  const proxyMetrics = [
    { label: "SSL", value: enabled.has("ssl") ? "on" : "off" },
    { label: "Cache", value: enabled.has("cache") ? "on" : "off" },
  ];

  const proxyStatus = enabled.size > 0 ? "healthy" : "idle";

  const nodes: FlowNode[] = [
    { id: "client", type: "clientNode", position: { x: 40, y: 130 }, data: { label: "Client", sublabel: `~${latency}ms`, status: "healthy", handles: { right: true } } },
    {
      id: "proxy", type: "loadBalancerNode", position: { x: 220, y: 110 }, data: {
        label: "Reverse Proxy",
        sublabel: "nginx",
        status: proxyStatus,
        metrics: proxyMetrics,
        handles: { left: true, right: true },
      }
    },
    { id: "b1", type: "serverNode", position: { x: 420, y: 60 }, data: { label: "Backend 1", sublabel: "HTTP only", status: "healthy", handles: { left: true } } },
    { id: "b2", type: "serverNode", position: { x: 420, y: 170 }, data: { label: "Backend 2", sublabel: "HTTP only", status: "healthy", handles: { left: true } } },
  ];

  const edges: FlowEdge[] = [
    { id: "e1", source: "client", target: "proxy", label: enabled.has("ssl") ? "HTTPS" : "HTTP", animated: true },
    { id: "e2", source: "proxy", target: "b1", label: "plain HTTP", animated: !enabled.has("cache") },
    { id: "e3", source: "proxy", target: "b2", animated: !enabled.has("cache") },
  ];

  return (
    <Playground
      title="Reverse Proxy Feature Playground"
      canvas={
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {FEATURES.map((f) => (
              <button
                key={f.id}
                onClick={() => toggleFeature(f.id)}
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-3 py-2 text-left transition-all text-xs",
                  enabled.has(f.id)
                    ? "border-current/30 bg-current/5 ring-1 ring-current/10"
                    : "border-border bg-muted/10 hover:border-border/60"
                )}
                style={enabled.has(f.id) ? undefined : undefined}
              >
                <span className={cn("transition-colors", enabled.has(f.id) ? f.color : "text-muted-foreground/40")}>
                  {f.icon}
                </span>
                <span className={cn("font-medium transition-colors", enabled.has(f.id) ? "text-foreground" : "text-muted-foreground/60")}>
                  {f.label}
                </span>
                <span className={cn(
                  "ml-auto text-[10px] font-mono rounded px-1",
                  enabled.has(f.id) ? "bg-emerald-500/10 text-emerald-400" : "text-muted-foreground/30"
                )}>
                  {enabled.has(f.id) ? "ON" : "OFF"}
                </span>
              </button>
            ))}
          </div>
          <FlowDiagram nodes={nodes} edges={edges} allowDrag={false} minHeight={260} />
        </div>
      }
      explanation={
        <div className="space-y-3">
          <div className="rounded-lg border border-violet-500/20 bg-violet-500/5 p-3 text-center">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Estimated Latency</div>
            <div className={cn("text-2xl font-mono font-bold transition-all", latency < 20 ? "text-emerald-400" : latency < 40 ? "text-amber-400" : "text-red-400")}>
              {latency}ms
            </div>
            <div className="text-[10px] text-muted-foreground mt-1">
              {latency < baseLatency ? `${baseLatency - latency}ms saved vs baseline` : "baseline (no features)"}
            </div>
          </div>
          <div className="space-y-2">
            {FEATURES.map((f) => (
              <div key={f.id} className={cn("text-[11px] transition-all", enabled.has(f.id) ? "text-muted-foreground" : "text-muted-foreground/30")}>
                <span className={cn("font-semibold", enabled.has(f.id) ? f.color : "")}>{f.label}: </span>
                {f.desc}
              </div>
            ))}
          </div>
          {enabled.size === 0 && (
            <p className="text-[11px] text-muted-foreground/50 italic">Toggle features above to see how each changes the flow and latency.</p>
          )}
        </div>
      }
      controls={false}
      canvasHeight="min-h-[420px]"
    />
  );
}

// ─── Latency Chart ─────────────────────────────────────────────────────────

const LATENCY_DATA = [
  { scenario: "No proxy", noProxy: 52, withProxy: 52, cached: 52 },
  { scenario: "SSL term.", noProxy: 52, withProxy: 48, cached: 48 },
  { scenario: "+ Compress", noProxy: 52, withProxy: 43, cached: 43 },
  { scenario: "+ Cache", noProxy: 52, withProxy: 43, cached: 1 },
  { scenario: "+ Auth", noProxy: 52, withProxy: 41, cached: 1 },
];

// ─── Nginx vs HAProxy Comparison ───────────────────────────────────────────

const COMPARISON_DATA = [
  { metric: "Throughput", nginx: 90, haproxy: 95 },
  { metric: "Config ease", nginx: 88, haproxy: 72 },
  { metric: "L7 features", nginx: 92, haproxy: 75 },
  { metric: "L4 TCP proxy", nginx: 65, haproxy: 98 },
  { metric: "Static files", nginx: 98, haproxy: 20 },
  { metric: "Health checks", nginx: 80, haproxy: 98 },
];

function NginxHAProxyComparison() {
  const [highlight, setHighlight] = useState<"nginx" | "haproxy" | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => setHighlight(highlight === "nginx" ? null : "nginx")}
          className={cn(
            "rounded-full px-4 py-1.5 text-xs font-semibold border transition-all",
            highlight === "nginx"
              ? "bg-blue-500/15 text-blue-400 border-blue-500/30"
              : "bg-muted/20 text-muted-foreground border-border"
          )}
        >
          Nginx
        </button>
        <span className="text-xs text-muted-foreground/40">vs</span>
        <button
          onClick={() => setHighlight(highlight === "haproxy" ? null : "haproxy")}
          className={cn(
            "rounded-full px-4 py-1.5 text-xs font-semibold border transition-all",
            highlight === "haproxy"
              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
              : "bg-muted/20 text-muted-foreground border-border"
          )}
        >
          HAProxy
        </button>
      </div>

      <LiveChart
        type="bar"
        data={COMPARISON_DATA}
        dataKeys={{ x: "metric", y: ["nginx", "haproxy"], label: ["Nginx", "HAProxy"] }}
        height={200}
        unit=""
      />

      <div className="grid grid-cols-2 gap-3">
        <div className={cn("rounded-lg border p-3 transition-all", highlight === "nginx" ? "border-blue-500/30 bg-blue-500/5" : "border-border bg-muted/5")}>
          <p className="text-xs font-semibold text-blue-400 mb-2">Nginx</p>
          <ul className="space-y-1 text-[11px] text-muted-foreground">
            <li className="flex gap-1.5"><ArrowRight className="size-3 mt-0.5 shrink-0 text-blue-400" />Best-in-class static file serving</li>
            <li className="flex gap-1.5"><ArrowRight className="size-3 mt-0.5 shrink-0 text-blue-400" />Full reverse proxy + HTTP caching</li>
            <li className="flex gap-1.5"><ArrowRight className="size-3 mt-0.5 shrink-0 text-blue-400" />Rich config language (nginx.conf)</li>
            <li className="flex gap-1.5"><ArrowRight className="size-3 mt-0.5 shrink-0 text-blue-400" />Default choice for web apps</li>
          </ul>
        </div>
        <div className={cn("rounded-lg border p-3 transition-all", highlight === "haproxy" ? "border-emerald-500/30 bg-emerald-500/5" : "border-border bg-muted/5")}>
          <p className="text-xs font-semibold text-emerald-400 mb-2">HAProxy</p>
          <ul className="space-y-1 text-[11px] text-muted-foreground">
            <li className="flex gap-1.5"><ArrowRight className="size-3 mt-0.5 shrink-0 text-emerald-400" />Gold standard for load balancing</li>
            <li className="flex gap-1.5"><ArrowRight className="size-3 mt-0.5 shrink-0 text-emerald-400" />Superior L4 TCP/UDP proxying</li>
            <li className="flex gap-1.5"><ArrowRight className="size-3 mt-0.5 shrink-0 text-emerald-400" />Advanced health checks + ACLs</li>
            <li className="flex gap-1.5"><ArrowRight className="size-3 mt-0.5 shrink-0 text-emerald-400" />Real-time stats dashboard built-in</li>
          </ul>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-muted/5 p-3">
        <div className="grid grid-cols-3 gap-3 text-center text-[11px]">
          {[
            { name: "Nginx", best: "Web apps, API proxy, static files" },
            { name: "HAProxy", best: "TCP LB, database proxy, high-perf" },
            { name: "Caddy", best: "Auto HTTPS, simple config, dev" },
          ].map((row) => (
            <div key={row.name}>
              <div className="font-semibold text-foreground">{row.name}</div>
              <div className="text-muted-foreground/70 mt-0.5">{row.best}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── SSL Termination Flow ───────────────────────────────────────────────────

function SSLTerminationFlow() {
  const sim = useSimulation({ intervalMs: 900, maxSteps: 6 });

  const step = sim.step;

  const stages = [
    { label: "TLS Handshake", desc: "Client ↔ Proxy only (HTTPS)", note: "High CPU — once per session" },
    { label: "Decrypt Request", desc: "Proxy decrypts incoming TLS", note: "One-time cost at proxy" },
    { label: "Forward (HTTP)", desc: "Proxy → Backend via plain HTTP", note: "Zero crypto overhead inside network" },
    { label: "Backend Response", desc: "Backend → Proxy (plain HTTP)", note: "No certificates on backends" },
    { label: "Encrypt Response", desc: "Proxy re-encrypts for client", note: "Handled by proxy only" },
    { label: "Client Receives", desc: "HTTPS response delivered", note: "Single cert to manage" },
  ];

  const nodes: FlowNode[] = [
    { id: "client", type: "clientNode", position: { x: 40, y: 130 }, data: { label: "Client", sublabel: "HTTPS", status: step >= 1 ? "healthy" : "idle", handles: { right: true } } },
    { id: "proxy", type: "loadBalancerNode", position: { x: 220, y: 130 }, data: { label: "Reverse Proxy", sublabel: "SSL terminates here", status: step >= 2 ? "healthy" : "idle", handles: { left: true, right: true }, metrics: [{ label: "cert", value: "1x" }] } },
    { id: "b1", type: "serverNode", position: { x: 400, y: 80 }, data: { label: "Backend 1", sublabel: "plain HTTP", status: step >= 3 ? "healthy" : "idle", handles: { left: true } } },
    { id: "b2", type: "serverNode", position: { x: 400, y: 200 }, data: { label: "Backend 2", sublabel: "plain HTTP", status: step >= 3 ? "healthy" : "idle", handles: { left: true } } },
  ];

  const edges: FlowEdge[] = [
    { id: "e1", source: "client", target: "proxy", label: "HTTPS 🔒", animated: step >= 1 && step <= 2 },
    { id: "e2", source: "proxy", target: "b1", label: "HTTP", animated: step >= 3 && step <= 4 },
    { id: "e3", source: "proxy", target: "b2", animated: step >= 3 && step <= 4 },
  ];

  return (
    <Playground
      title="SSL Termination Walkthrough"
      simulation={sim}
      canvas={
        <div className="p-4 space-y-3">
          <FlowDiagram nodes={nodes} edges={edges} allowDrag={false} minHeight={260} />
          <div className="space-y-1">
            {stages.map((s, i) => (
              <div
                key={s.label}
                className={cn(
                  "flex items-center gap-2 rounded px-3 py-1.5 text-[11px] border transition-all duration-300",
                  i < step
                    ? "border-emerald-500/20 bg-emerald-500/5 text-foreground"
                    : i === step
                    ? "border-blue-500/30 bg-blue-500/8 text-foreground ring-1 ring-blue-500/20"
                    : "border-border/20 bg-muted/5 text-muted-foreground/30"
                )}
              >
                <span className={cn(
                  "size-4 rounded-full text-[9px] flex items-center justify-center font-mono font-bold shrink-0",
                  i < step ? "bg-emerald-500/20 text-emerald-400" : i === step ? "bg-blue-500/20 text-blue-400" : "bg-muted/20 text-muted-foreground/30"
                )}>{i + 1}</span>
                <span className="font-medium w-32 shrink-0">{s.label}</span>
                <span className="text-[10px] flex-1">{i <= step ? s.desc : "—"}</span>
                <span className={cn("text-[9px] font-mono text-right hidden sm:block", i < step ? "text-muted-foreground/50" : i === step ? "text-blue-400/70" : "text-transparent")}>
                  {s.note}
                </span>
              </div>
            ))}
          </div>
        </div>
      }
      explanation={
        <div className="space-y-3">
          <p className="text-[11px]">SSL termination centralises TLS at the proxy. All backends communicate over plain HTTP on your private network.</p>
          <div className="space-y-2">
            <div className="rounded border border-red-500/20 bg-red-500/5 p-2 text-[11px]">
              <span className="font-semibold text-red-400">Without SSL termination:</span>
              <p className="text-muted-foreground mt-0.5">Every backend manages its own TLS certificate and handles handshakes. With 5 servers, you pay TLS CPU cost 5×.</p>
            </div>
            <div className="rounded border border-emerald-500/20 bg-emerald-500/5 p-2 text-[11px]">
              <span className="font-semibold text-emerald-400">With SSL termination:</span>
              <p className="text-muted-foreground mt-0.5">One certificate. One handshake point. Backends never touch TLS. Certificate rotation touches only the proxy.</p>
            </div>
          </div>
        </div>
      }
      canvasHeight="min-h-[460px]"
    />
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function ReverseProxyPage() {
  return (
    <div className="space-y-8">
      <TopicHero
        title="Reverse Proxy"
        subtitle="The invisible middleman that protects, accelerates, and routes traffic to your backend servers"
        difficulty="intermediate"
      />

      {/* Forward vs Reverse toggle */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Forward Proxy vs Reverse Proxy</h2>
        <p className="text-sm text-muted-foreground">
          These two are constantly mixed up. The key distinction is <em>which side</em> the proxy protects. Toggle between the two diagrams to see the structural difference.
        </p>
        <ProxyToggle />
      </section>

      <AhaMoment
        question="Can you have both a forward proxy and a reverse proxy on the same request?"
        answer={
          <p>
            Yes — this happens constantly. An employee&apos;s request goes through a corporate forward proxy (hides the employee), then hits Cloudflare (a reverse proxy that hides the origin server). Neither the company network nor the web server sees the full picture. The forward proxy hides the client; the reverse proxy hides the server.
          </p>
        }
      />

      {/* Feature playground */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">What Can a Reverse Proxy Do?</h2>
        <p className="text-sm text-muted-foreground">
          Toggle features on the reverse proxy node and see how each changes the architecture and latency. Each feature offloads work from your backends.
        </p>
        <FeaturePlayground />
      </section>

      {/* SSL Termination walkthrough */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">SSL Termination Step by Step</h2>
        <p className="text-sm text-muted-foreground">
          TLS handshakes are CPU-intensive. Centralising them at the proxy means your backends never touch encryption — fewer certs to manage, less CPU per server.
        </p>
        <SSLTerminationFlow />
      </section>

      <ConversationalCallout type="tip">
        <strong>Backends communicating over plain HTTP internally</strong> is fine and intentional — your private network is trusted. The TLS boundary is at the proxy facing the public internet. This pattern is called "SSL offloading" and is the default in almost every production deployment.
      </ConversationalCallout>

      {/* Latency chart */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Request Latency: Feature Impact</h2>
        <p className="text-sm text-muted-foreground">
          See how each reverse proxy feature affects end-to-end latency. Caching has the most dramatic effect — cache hits skip the backend entirely, dropping latency from ~52ms to under 2ms.
        </p>
        <div className="rounded-xl border border-border bg-muted/5 p-4">
          <LiveChart
            type="latency"
            data={LATENCY_DATA}
            dataKeys={{
              x: "scenario",
              y: ["noProxy", "withProxy", "cached"],
              label: ["No proxy", "With proxy features", "Cache hit path"],
            }}
            height={220}
            referenceLines={[{ y: 10, label: "target SLA", color: undefined }]}
          />
          <p className="text-[11px] text-muted-foreground/60 text-center mt-2">
            Each feature is cumulative. Caching creates a separate fast path where backends are never contacted.
          </p>
        </div>
      </section>

      <ConversationalCallout type="warning">
        <strong>Proxy as a single point of failure:</strong> If you run only one proxy instance, it becomes the SPOF for your entire stack. In production, deploy multiple proxy instances behind DNS round-robin or a floating IP (keepalived/VRRP). Cloud-managed options like AWS ALB and Cloudflare handle redundancy automatically.
      </ConversationalCallout>

      {/* Nginx vs HAProxy */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Nginx vs HAProxy</h2>
        <p className="text-sm text-muted-foreground">
          Both are excellent, and both can handle most use cases. The difference is emphasis: Nginx is a full web server with proxy capabilities; HAProxy is a pure load balancer with deep TCP control. Click a name to highlight its strengths.
        </p>
        <NginxHAProxyComparison />
      </section>

      <ConversationalCallout type="question">
        <strong>Where does Cloudflare fit?</strong> Cloudflare is a globally distributed reverse proxy — it sits in front of your origin server, terminates SSL, caches content, absorbs DDoS, and hides your IP. It is a reverse proxy at CDN scale with 300+ edge locations. Many production setups use Cloudflare at the edge <em>plus</em> Nginx in front of backends: two reverse proxy layers, each handling different concerns.
      </ConversationalCallout>

      {/* Before / After */}
      <BeforeAfter
        before={{
          title: "Direct Backend Exposure",
          content: (
            <div className="space-y-2 text-[11px]">
              <div className="rounded border border-red-500/20 bg-red-500/5 p-2 text-center text-red-400 font-mono">Client → 203.0.113.1 (exposed)</div>
              <div className="rounded border border-red-500/20 bg-red-500/5 p-2 text-center text-red-400 font-mono">Client → 203.0.113.2 (exposed)</div>
              <div className="rounded border border-red-500/20 bg-red-500/5 p-2 text-center text-red-400 font-mono">Client → 203.0.113.3 (exposed)</div>
              <div className="text-muted-foreground/60 text-center">Each server handles SSL separately. No caching. IPs are public. Swap a server = update all clients.</div>
            </div>
          ),
        }}
        after={{
          title: "With Reverse Proxy",
          content: (
            <div className="space-y-2 text-[11px]">
              <div className="rounded border border-emerald-500/20 bg-emerald-500/5 p-2 text-center text-emerald-400 font-mono">Client → proxy.example.com (one IP)</div>
              <div className="flex items-center justify-center gap-1 text-muted-foreground/60">
                <Server className="size-3" />
                <span>SSL · Cache · Compress · Auth · Route</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                {["10.0.0.1", "10.0.0.2", "10.0.0.3"].map((ip) => (
                  <div key={ip} className="rounded border border-border/30 bg-muted/10 p-1.5 text-center font-mono text-muted-foreground/60">{ip}</div>
                ))}
              </div>
              <div className="text-muted-foreground/60 text-center">Backend IPs are private. One cert. Swap backends transparently.</div>
            </div>
          ),
        }}
      />

      <KeyTakeaway
        points={[
          "A reverse proxy sits in front of servers; a forward proxy sits in front of clients. They protect opposite sides of the connection.",
          "SSL termination at the proxy eliminates per-backend TLS overhead — one certificate, one handshake point, backends run plain HTTP internally.",
          "Caching at the proxy creates a fast path (< 2ms) that bypasses backends entirely for repeated requests — the single biggest latency win.",
          "Compression, auth validation, and rate limiting at the proxy let backends stay focused on business logic rather than cross-cutting concerns.",
          "Nginx is the default choice for web apps (static files, caching, HTTP proxy). HAProxy is best for pure load balancing and advanced TCP control.",
          "Never run a single proxy instance — it becomes a SPOF. Run multiple instances behind DNS round-robin or a floating IP for HA.",
          "Cloudflare, AWS ALB, and GCP Cloud Load Balancing are all distributed reverse proxies at CDN scale — many architectures layer these on top of an internal Nginx/HAProxy.",
        ]}
      />
    </div>
  );
}
