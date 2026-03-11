"use client";

import { useState, useEffect } from "react";
import { TopicHero } from "@/components/topic-hero";
import { FailureScenario } from "@/components/failure-scenario";
import { WhyItBreaks } from "@/components/why-it-breaks";
import { ConceptVisualizer } from "@/components/concept-visualizer";
import { CorrectApproach } from "@/components/correct-approach";
import { KeyTakeaway } from "@/components/key-takeaway";
import { ServerNode } from "@/components/server-node";
import { MetricCounter } from "@/components/metric-counter";
import { InteractiveDemo } from "@/components/interactive-demo";
import { AhaMoment } from "@/components/aha-moment";
import { ConversationalCallout } from "@/components/conversational-callout";
import { BeforeAfter } from "@/components/before-after";
import { AnimatedFlow } from "@/components/animated-flow";
import { cn } from "@/lib/utils";
import { Heart, HeartPulse, Activity, Database, Wifi, Clock, CheckCircle2, XCircle, AlertTriangle, Server, RefreshCw } from "lucide-react";

function ServerHealthDashboard() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((s) => (s + 1) % 16), 1200);
    return () => clearInterval(t);
  }, []);

  const servers = [
    {
      name: "web-01",
      liveness: true,
      readiness: true,
      getStatus: (t: number) => t >= 8 && t < 12 ? "degraded" : "healthy",
    },
    {
      name: "web-02",
      liveness: true,
      readiness: false,
      getStatus: (t: number) => t >= 3 ? "zombie" : "healthy",
    },
    {
      name: "web-03",
      liveness: true,
      readiness: true,
      getStatus: () => "healthy" as const,
    },
    {
      name: "web-04",
      liveness: false,
      readiness: false,
      getStatus: (t: number) => t >= 5 && t < 10 ? "dead" : t >= 10 && t < 13 ? "restarting" : "healthy",
    },
    {
      name: "web-05",
      liveness: true,
      readiness: true,
      getStatus: () => "healthy" as const,
    },
    {
      name: "web-06",
      liveness: true,
      readiness: false,
      getStatus: (t: number) => t < 6 ? "starting" : "healthy",
    },
    {
      name: "web-07",
      liveness: true,
      readiness: true,
      getStatus: () => "healthy" as const,
    },
    {
      name: "web-08",
      liveness: true,
      readiness: true,
      getStatus: (t: number) => t >= 10 && t < 14 ? "degraded" : "healthy",
    },
  ];

  type ServerStatus = "healthy" | "zombie" | "dead" | "restarting" | "starting" | "degraded";

  const statuses = servers.map((s) => s.getStatus(tick) as ServerStatus);
  const healthy = statuses.filter((s) => s === "healthy").length;
  const unhealthy = statuses.filter((s) => s === "zombie" || s === "dead").length;
  const degraded = statuses.filter((s) => s === "degraded").length;
  const starting = statuses.filter((s) => s === "starting" || s === "restarting").length;

  const statusConfig: Record<ServerStatus, { bg: string; border: string; dot: string; text: string; label: string }> = {
    healthy: { bg: "bg-emerald-500/8", border: "border-emerald-500/25", dot: "bg-emerald-500", text: "text-emerald-400", label: "Healthy" },
    zombie: { bg: "bg-red-500/8", border: "border-red-500/25", dot: "bg-red-500 animate-pulse", text: "text-red-400", label: "No DB conn" },
    dead: { bg: "bg-red-500/10", border: "border-red-500/30", dot: "bg-red-500 animate-pulse", text: "text-red-400", label: "Deadlocked" },
    restarting: { bg: "bg-blue-500/8", border: "border-blue-500/25", dot: "bg-blue-500 animate-pulse", text: "text-blue-400", label: "Restarting" },
    starting: { bg: "bg-amber-500/8", border: "border-amber-500/25", dot: "bg-amber-500", text: "text-amber-400", label: "Starting up" },
    degraded: { bg: "bg-amber-500/8", border: "border-amber-500/25", dot: "bg-amber-500", text: "text-amber-400", label: "High latency" },
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-2">
        {servers.map((srv, i) => {
          const status = statuses[i];
          const cfg = statusConfig[status];
          return (
            <div
              key={srv.name}
              className={cn(
                "rounded-lg border p-2.5 transition-all duration-500",
                cfg.bg, cfg.border
              )}
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <div className={cn("size-1.5 rounded-full", cfg.dot)} />
                <span className="text-[10px] font-mono font-semibold">{srv.name}</span>
              </div>
              <p className={cn("text-[9px] font-medium", cfg.text)}>{cfg.label}</p>
              <div className="flex gap-1 mt-1.5">
                <span className={cn(
                  "text-[8px] px-1 py-0.5 rounded border",
                  status === "dead" || status === "restarting"
                    ? "bg-red-500/10 border-red-500/20 text-red-400"
                    : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                )}>
                  L:{status === "dead" ? "FAIL" : "OK"}
                </span>
                <span className={cn(
                  "text-[8px] px-1 py-0.5 rounded border",
                  status === "zombie" || status === "dead" || status === "starting" || status === "restarting"
                    ? "bg-red-500/10 border-red-500/20 text-red-400"
                    : status === "degraded"
                    ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                    : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                )}>
                  R:{status === "healthy" ? "OK" : status === "degraded" ? "SLOW" : "FAIL"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-4 gap-2">
        <MetricCounter label="Healthy" value={healthy} trend={healthy >= 6 ? "down" : "neutral"} />
        <MetricCounter label="Unhealthy" value={unhealthy} trend={unhealthy > 0 ? "up" : "neutral"} />
        <MetricCounter label="Degraded" value={degraded} trend={degraded > 0 ? "up" : "neutral"} />
        <MetricCounter label="Starting" value={starting} trend="neutral" />
      </div>
      <p className="text-[10px] text-muted-foreground/60">
        L = Liveness probe, R = Readiness probe. Nodes with failed readiness are removed from the
        load balancer. Nodes with failed liveness get restarted by the orchestrator.
      </p>
    </div>
  );
}

function ProbeTimeline() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((s) => (s + 1) % 20), 800);
    return () => clearInterval(t);
  }, []);

  const events = [
    { time: 0, type: "startup", label: "Container starts" },
    { time: 2, type: "startup-probe", label: "Startup probe begins (initialDelaySeconds: 5s)" },
    { time: 5, type: "startup-pass", label: "Startup probe passes — app initialized" },
    { time: 6, type: "liveness", label: "Liveness probe begins (periodSeconds: 10s)" },
    { time: 7, type: "readiness", label: "Readiness probe begins — checking dependencies" },
    { time: 8, type: "ready", label: "Readiness passes — added to Service endpoints" },
    { time: 10, type: "traffic", label: "Receiving production traffic" },
    { time: 13, type: "db-lost", label: "Database connection lost" },
    { time: 14, type: "readiness-fail", label: "Readiness fails — removed from load balancer" },
    { time: 16, type: "db-back", label: "Database reconnects" },
    { time: 17, type: "readiness-pass", label: "Readiness passes — back in rotation" },
    { time: 19, type: "normal", label: "Normal operation continues" },
  ];

  return (
    <div className="space-y-1">
      {events.map((evt, i) => {
        const isActive = tick >= evt.time;
        const isCurrent = tick === evt.time;
        const isError = evt.type.includes("fail") || evt.type === "db-lost";
        const isSuccess = evt.type.includes("pass") || evt.type === "ready" || evt.type === "traffic" || evt.type === "db-back";

        return (
          <div
            key={i}
            className={cn(
              "flex items-center gap-2.5 transition-all duration-300",
              isActive ? "opacity-100" : "opacity-20"
            )}
          >
            <span className="text-[9px] font-mono text-muted-foreground/40 w-6 text-right">{evt.time}s</span>
            <div className={cn(
              "size-2 rounded-full shrink-0 transition-colors",
              isCurrent ? "ring-2 ring-offset-1 ring-offset-background" : "",
              isError ? "bg-red-500" : isSuccess ? "bg-emerald-500" : "bg-blue-500",
              isCurrent && isError ? "ring-red-500/30" : isCurrent && isSuccess ? "ring-emerald-500/30" : isCurrent ? "ring-blue-500/30" : ""
            )} />
            <div className="h-[1px] w-3 bg-muted-foreground/20" />
            <span className={cn(
              "text-[10px] transition-colors",
              !isActive ? "text-muted-foreground/30" : isError ? "text-red-400" : isSuccess ? "text-emerald-400" : "text-muted-foreground"
            )}>
              {evt.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function CascadingHealthFailure() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % 10), 1500);
    return () => clearInterval(t);
  }, []);

  const layers = [
    { name: "Database", icon: Database },
    { name: "Cache (Redis)", icon: Server },
    { name: "API Server", icon: Activity },
    { name: "Load Balancer", icon: Wifi },
  ];

  const isBadApproach = step < 5;
  const failLevel = isBadApproach ? Math.min(step, 4) : step >= 6 ? 1 : 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <span className={cn(
          "text-[10px] font-mono px-2 py-0.5 rounded-full border transition-all",
          isBadApproach
            ? "bg-red-500/10 border-red-500/30 text-red-400"
            : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
        )}>
          {isBadApproach ? "DEEP CHECK ON LIVENESS" : "DEEP CHECK ON READINESS ONLY"}
        </span>
      </div>

      <div className="space-y-1.5">
        {layers.map((layer, i) => {
          const isFailed = isBadApproach
            ? i < failLevel
            : i === 0 && step >= 6;
          const isRestarting = isBadApproach && i === failLevel && failLevel < layers.length;
          const Icon = layer.icon;

          return (
            <div
              key={layer.name}
              className={cn(
                "flex items-center gap-3 rounded-md border px-3 py-2 transition-all duration-500",
                isFailed
                  ? "bg-red-500/10 border-red-500/30"
                  : isRestarting
                  ? "bg-amber-500/8 border-amber-500/20"
                  : "bg-emerald-500/8 border-emerald-500/20"
              )}
            >
              <Icon className={cn(
                "size-4",
                isFailed ? "text-red-400" : isRestarting ? "text-amber-400" : "text-emerald-400"
              )} />
              <span className={cn(
                "text-xs font-medium flex-1",
                isFailed ? "text-red-400" : isRestarting ? "text-amber-400" : "text-emerald-400"
              )}>
                {layer.name}
              </span>
              {isFailed && <XCircle className="size-3.5 text-red-400" />}
              {isRestarting && <RefreshCw className="size-3.5 text-amber-400 animate-spin" />}
              {!isFailed && !isRestarting && <CheckCircle2 className="size-3.5 text-emerald-400/50" />}
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-muted-foreground/60">
        {isBadApproach && step < 2
          ? "Database goes down. Liveness probe includes deep dependency check..."
          : isBadApproach && step < 4
          ? "Liveness fails on all servers! Orchestrator restarts them all — thundering herd on reconnect!"
          : isBadApproach
          ? "All servers restarting simultaneously. Total outage even though the servers themselves were fine."
          : step < 7
          ? "Database goes down. Readiness probe fails — servers removed from rotation but NOT restarted."
          : "Servers stay alive, waiting for DB to recover. Instant restoration when DB comes back."}
      </p>
    </div>
  );
}

export default function HealthChecksPage() {
  return (
    <div className="space-y-8">
      <TopicHero
        title="Health Checks"
        subtitle="A server that's running isn't necessarily a server that's working. Know the difference, or your load balancer won't."
        difficulty="beginner"
      />

      <FailureScenario title="The zombie server eating your traffic">
        <p className="text-sm text-muted-foreground">
          Your API server is technically running — the process is alive, the port is open. But it lost
          its database connection 20 minutes ago. The load balancer keeps sending traffic to it because
          the TCP port check passes. <strong className="text-red-400">Every request hits this zombie server
          and fails with a database connection error.</strong> Your other three healthy servers sit at 25%
          capacity while this one eats 25% of your traffic and returns 100% errors. One in four users
          sees a failure, and you don&apos;t even know which server is the problem.
        </p>
        <div className="flex justify-center gap-3 pt-4">
          <ServerNode type="loadbalancer" label="Load Balancer" sublabel="Port check: OK" status="healthy" />
          <ServerNode type="server" label="Server 1" sublabel="No DB conn" status="unhealthy" />
          <ServerNode type="server" label="Server 2" sublabel="Healthy" status="healthy" />
          <ServerNode type="server" label="Server 3" sublabel="Healthy" status="healthy" />
          <ServerNode type="server" label="Server 4" sublabel="Healthy" status="healthy" />
        </div>
      </FailureScenario>

      <WhyItBreaks title="Port-open is not the same as working">
        <p className="text-sm text-muted-foreground">
          A basic &quot;is the port open?&quot; check tells you the process is running, but nothing about
          whether it can actually <strong>serve requests</strong>. The server could be deadlocked,
          out of memory but not yet OOM-killed, disconnected from every downstream dependency, or stuck
          in a GC pause that never ends. Without meaningful health checks, your load balancer and
          orchestrator are flying blind — they treat a broken server the same as a healthy one, and
          your users pay the price.
        </p>
        <div className="grid grid-cols-2 gap-2 mt-3">
          {[
            { label: "Process alive, DB disconnected", desc: "Accepts connections, returns errors on every query" },
            { label: "Thread pool exhausted", desc: "Port open, but all worker threads are blocked" },
            { label: "Deadlocked state", desc: "Process running, but stuck and never making progress" },
            { label: "Disk full", desc: "Can't write logs or temp files — requests fail silently" },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2 rounded-lg bg-red-500/5 border border-red-500/15 p-2.5">
              <XCircle className="size-3.5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] font-semibold text-red-400">{item.label}</p>
                <p className="text-[10px] text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </WhyItBreaks>

      <ConceptVisualizer title="Kubernetes Probes — Three Questions About Your Service">
        <p className="text-sm text-muted-foreground mb-4">
          Kubernetes popularized the distinction between liveness, readiness, and startup probes. These
          answer three fundamentally different questions about your service. Getting the distinction wrong
          can cause more harm than having no probes at all.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Heart className="size-4 text-blue-400" />
              <h4 className="text-sm font-semibold text-blue-400">Startup Probe</h4>
            </div>
            <p className="text-xs text-muted-foreground">
              &quot;Has this container finished initializing?&quot; Runs once at startup. Liveness and
              readiness probes are disabled until this passes. Essential for slow-starting apps
              (loading ML models, warming caches, running migrations).
            </p>
            <p className="text-[10px] font-mono text-muted-foreground/70">
              failureThreshold: 30, periodSeconds: 10
            </p>
          </div>
          <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <HeartPulse className="size-4 text-red-400" />
              <h4 className="text-sm font-semibold text-red-400">Liveness Probe</h4>
            </div>
            <p className="text-xs text-muted-foreground">
              &quot;Is this process alive and not stuck?&quot; If it fails, the container is <strong>killed
              and restarted</strong>. Should be lightweight — just checks if the process can respond.
              Never include dependency checks here.
            </p>
            <p className="text-[10px] font-mono text-muted-foreground/70">
              GET /healthz → 200 OK
            </p>
          </div>
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Activity className="size-4 text-emerald-400" />
              <h4 className="text-sm font-semibold text-emerald-400">Readiness Probe</h4>
            </div>
            <p className="text-xs text-muted-foreground">
              &quot;Can this process handle traffic right now?&quot; If it fails, the pod is removed
              from Service endpoints. <strong>Not killed</strong>, just stops receiving traffic. Use
              deep dependency checks here.
            </p>
            <p className="text-[10px] font-mono text-muted-foreground/70">
              GET /ready → 200 OK or 503
            </p>
          </div>
        </div>
      </ConceptVisualizer>

      <ConceptVisualizer title="Server Fleet Dashboard — Live Health Status">
        <p className="text-sm text-muted-foreground mb-4">
          Watch how a fleet of 8 servers responds to various failures. Notice how some nodes go
          unhealthy (removed from rotation) while others get restarted. This is the difference between
          liveness and readiness in action.
        </p>
        <ServerHealthDashboard />
      </ConceptVisualizer>

      <ConceptVisualizer title="Probe Lifecycle Timeline">
        <p className="text-sm text-muted-foreground mb-4">
          Here&apos;s what happens from the moment a container starts to when it handles production
          traffic — and how it responds when a dependency disappears and comes back.
        </p>
        <ProbeTimeline />
      </ConceptVisualizer>

      <CorrectApproach title="Shallow vs. Deep Health Checks">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg border bg-muted/10 p-4 space-y-3">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <div className="size-2 rounded-full bg-blue-500" />
                Shallow (Synthetic) Check
              </h4>
              <p className="text-xs text-muted-foreground">
                Returns 200 if the process is running. Fast (&lt;1ms), cheap, and almost never fails.
                Good for liveness probes but tells you nothing about the service&apos;s ability to
                do real work.
              </p>
              <div className="rounded-md bg-muted/30 p-2.5 text-[10px] font-mono text-muted-foreground">
                <span className="text-blue-400">GET</span> /healthz<br />
                → 200 {`{ "status": "alive" }`}
              </div>
            </div>
            <div className="rounded-lg border bg-muted/10 p-4 space-y-3">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <div className="size-2 rounded-full bg-emerald-500" />
                Deep (Dependency) Check
              </h4>
              <p className="text-xs text-muted-foreground">
                Verifies connectivity to critical dependencies: database, cache, message queue. Takes
                10-100ms. Returns 503 with details about what&apos;s failing. Use for readiness probes.
              </p>
              <div className="rounded-md bg-muted/30 p-2.5 text-[10px] font-mono text-muted-foreground">
                <span className="text-emerald-400">GET</span> /ready<br />
                → 503 {`{ "db": "ok", "redis": "fail", "queue": "ok" }`}
              </div>
            </div>
          </div>
        </div>
      </CorrectApproach>

      <ConceptVisualizer title="The Danger: Deep Checks on Liveness Probes">
        <p className="text-sm text-muted-foreground mb-4">
          This is the single most common health check mistake. If your liveness probe checks
          the database, and the database goes down, <em>every</em> pod&apos;s liveness probe fails.
          The orchestrator restarts every pod. They all try to reconnect simultaneously — thundering
          herd. The database, already struggling, gets hammered. You&apos;ve turned a dependency
          outage into a total application outage.
        </p>
        <CascadingHealthFailure />
      </ConceptVisualizer>

      <AnimatedFlow
        steps={[
          { id: "check", label: "Health Check", description: "Probe hits /ready endpoint every 10s", icon: <HeartPulse className="size-4" /> },
          { id: "evaluate", label: "Evaluate", description: "Check DB, Redis, and critical dependencies", icon: <Database className="size-4" /> },
          { id: "fail", label: "Failure Detected", description: "Database connection pool exhausted", icon: <AlertTriangle className="size-4" /> },
          { id: "remove", label: "Remove from LB", description: "Server pulled from load balancer rotation", icon: <XCircle className="size-4" /> },
          { id: "recover", label: "Dependency Recovers", description: "Database connections re-established", icon: <RefreshCw className="size-4" /> },
          { id: "restore", label: "Back in Rotation", description: "Readiness passes — traffic resumes", icon: <CheckCircle2 className="size-4" /> },
        ]}
        interval={2200}
      />

      <InteractiveDemo title="Health Check Configuration Explorer">
        {({ isPlaying, tick }) => {
          const configs = [
            { name: "Startup Probe", interval: "10s", threshold: "30 failures", timeout: "1s", action: "Block other probes", useCase: "Slow-starting apps (ML model loading, cache warming)" },
            { name: "Liveness Probe", interval: "10s", threshold: "3 failures", timeout: "1s", action: "Kill & restart pod", useCase: "Deadlock detection, infinite loop recovery" },
            { name: "Readiness Probe", interval: "5s", threshold: "2 failures", timeout: "3s", action: "Remove from endpoints", useCase: "DB outage, dependency failure, overloaded" },
          ];

          const active = isPlaying ? Math.min(tick % 4, configs.length) : 0;

          return (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Press play to walk through Kubernetes probe configurations and their real-world use cases.
              </p>
              <div className="space-y-2">
                {configs.map((cfg, i) => (
                  <div
                    key={cfg.name}
                    className={cn(
                      "rounded-lg border p-3 transition-all duration-400",
                      i < active
                        ? "bg-emerald-500/5 border-emerald-500/20"
                        : i === active && isPlaying
                        ? "bg-blue-500/5 border-blue-500/20 ring-1 ring-blue-500/15"
                        : "bg-muted/10 border-border/30"
                    )}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={cn(
                        "text-xs font-semibold",
                        i < active ? "text-emerald-400" : i === active && isPlaying ? "text-blue-400" : "text-muted-foreground/40"
                      )}>
                        {cfg.name}
                      </span>
                      <div className={cn(
                        "flex gap-2 text-[9px] font-mono",
                        i <= active && isPlaying ? "text-muted-foreground" : "text-transparent"
                      )}>
                        <span>every {cfg.interval}</span>
                        <span>timeout {cfg.timeout}</span>
                        <span>{cfg.threshold}</span>
                      </div>
                    </div>
                    {i <= active && isPlaying && (
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div className="text-[10px]">
                          <span className="text-muted-foreground/50">On failure: </span>
                          <span className="text-muted-foreground">{cfg.action}</span>
                        </div>
                        <div className="text-[10px]">
                          <span className="text-muted-foreground/50">Best for: </span>
                          <span className="text-muted-foreground">{cfg.useCase}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {active >= configs.length && (
                <ConversationalCallout type="question">
                  Notice the readiness probe has a shorter interval (5s vs 10s) and lower threshold (2 vs 3).
                  That&apos;s intentional — you want to pull unhealthy servers out of rotation quickly, but you
                  want to be more cautious about killing and restarting pods.
                </ConversationalCallout>
              )}
            </div>
          );
        }}
      </InteractiveDemo>

      <BeforeAfter
        before={{
          title: "TCP Port Check Only",
          content: (
            <ul className="text-xs text-muted-foreground space-y-1.5">
              <li className="flex items-start gap-1.5"><XCircle className="size-3 text-red-400 shrink-0 mt-0.5" /> Only checks if port 8080 is open</li>
              <li className="flex items-start gap-1.5"><XCircle className="size-3 text-red-400 shrink-0 mt-0.5" /> Zombie servers receive 25% of traffic</li>
              <li className="flex items-start gap-1.5"><XCircle className="size-3 text-red-400 shrink-0 mt-0.5" /> No visibility into dependency health</li>
              <li className="flex items-start gap-1.5"><XCircle className="size-3 text-red-400 shrink-0 mt-0.5" /> Deadlocked processes run forever</li>
              <li className="flex items-start gap-1.5"><XCircle className="size-3 text-red-400 shrink-0 mt-0.5" /> Manual intervention to remove bad nodes</li>
            </ul>
          ),
        }}
        after={{
          title: "Startup + Liveness + Readiness",
          content: (
            <ul className="text-xs text-muted-foreground space-y-1.5">
              <li className="flex items-start gap-1.5"><CheckCircle2 className="size-3 text-emerald-400 shrink-0 mt-0.5" /> Slow-starting apps protected from premature kills</li>
              <li className="flex items-start gap-1.5"><CheckCircle2 className="size-3 text-emerald-400 shrink-0 mt-0.5" /> Deadlocked processes auto-restarted</li>
              <li className="flex items-start gap-1.5"><CheckCircle2 className="size-3 text-emerald-400 shrink-0 mt-0.5" /> Unready servers removed in seconds</li>
              <li className="flex items-start gap-1.5"><CheckCircle2 className="size-3 text-emerald-400 shrink-0 mt-0.5" /> Deep dependency checks on readiness only</li>
              <li className="flex items-start gap-1.5"><CheckCircle2 className="size-3 text-emerald-400 shrink-0 mt-0.5" /> Self-healing with zero manual intervention</li>
            </ul>
          ),
        }}
      />

      <AhaMoment
        question="Should every dependency failure make the health check fail?"
        answer={
          <p>
            No. Only fail the readiness check for <em>critical</em> dependencies — ones your service
            literally cannot function without. If your recommendation engine is down but you can still
            serve the page with a &quot;popular items&quot; fallback, don&apos;t mark yourself unready.
            Fail readiness only when the server genuinely cannot serve its primary function — like a
            checkout service that can&apos;t reach the payment gateway. Over-sensitive readiness probes
            will pull too many servers out of rotation and amplify the problem.
          </p>
        }
      />

      <ConversationalCallout type="warning">
        The most dangerous health check anti-pattern: deep dependency checks on liveness probes. If
        your shared database goes down and every pod&apos;s liveness check fails, the orchestrator
        restarts <em>all</em> your pods. They all try to reconnect at once (thundering herd), and you&apos;ve
        turned a database hiccup into a full application outage. Reserve deep checks for readiness probes only.
      </ConversationalCallout>

      <ConversationalCallout type="tip">
        Set health check intervals thoughtfully. Too frequent (every 1s) creates unnecessary load and
        network chatter. Too infrequent (every 60s) means a zombie server eats traffic for a full
        minute before removal. Start with <strong>periodSeconds: 10</strong> and <strong>failureThreshold: 3</strong> for
        liveness, and <strong>periodSeconds: 5</strong> with <strong>failureThreshold: 2</strong> for readiness.
      </ConversationalCallout>

      <KeyTakeaway
        points={[
          "A running process is not necessarily a healthy process — health checks must verify real functionality, not just port availability.",
          "Three probe types: Startup (block other probes until init completes), Liveness (restart stuck processes), Readiness (stop traffic to unready servers).",
          "Shallow checks verify the process itself (use for liveness). Deep checks verify dependencies like DB and cache (use for readiness only).",
          "Never use deep dependency checks for liveness probes — a shared dependency outage will trigger mass pod restarts and thundering herd.",
          "Kubernetes probe configuration: periodSeconds controls check frequency, failureThreshold controls sensitivity, initialDelaySeconds gives startup time.",
          "Over-sensitive readiness probes amplify outages. Only fail for dependencies your service genuinely cannot function without.",
        ]}
      />
    </div>
  );
}
