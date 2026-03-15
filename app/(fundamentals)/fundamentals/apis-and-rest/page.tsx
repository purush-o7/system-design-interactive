"use client";

import { useState, useEffect, useCallback } from "react";
import { TopicHero } from "@/components/topic-hero";
import { KeyTakeaway } from "@/components/key-takeaway";
import { ConversationalCallout } from "@/components/conversational-callout";
import { AhaMoment } from "@/components/aha-moment";
import { BeforeAfter } from "@/components/before-after";
import { Playground } from "@/components/playground";
import { FlowDiagram } from "@/components/flow-diagram";
import { LiveChart } from "@/components/live-chart";
import { useSimulation } from "@/hooks/use-simulation";
import { cn } from "@/lib/utils";
import { WhyCare } from "@/components/why-care";
import { GlossaryTerm } from "@/components/glossary-term";
import { TopicQuiz } from "@/components/topic-quiz";
import type { QuizQuestion } from "@/components/topic-quiz";
import {
  CheckCircle,
  XCircle,
  ArrowRight,
  Zap,
  Globe,
  Database,
} from "lucide-react";
import type { FlowNode, FlowEdge } from "@/components/flow-diagram";
import { MarkerType } from "@xyflow/react";

// ── HTTP Method Playground ────────────────────────────────────────────────────

const METHOD_CONFIGS = [
  {
    method: "GET",
    color: "blue",
    safe: true,
    idempotent: true,
    hasBody: false,
    cacheable: true,
    desc: "Retrieve a resource. Never modifies server state.",
    request: "GET /api/users/42\nAccept: application/json",
    response: '200 OK\n\n{ "id": 42, "name": "Alice", "email": "alice@example.com" }',
    nodeStatus: "healthy" as const,
  },
  {
    method: "POST",
    color: "green",
    safe: false,
    idempotent: false,
    hasBody: true,
    cacheable: false,
    desc: "Create a new resource. Calling twice creates two resources.",
    request: 'POST /api/users\nContent-Type: application/json\n\n{ "name": "Bob", "email": "bob@example.com" }',
    response: '201 Created\nLocation: /api/users/43\n\n{ "id": 43, "name": "Bob" }',
    nodeStatus: "healthy" as const,
  },
  {
    method: "PUT",
    color: "amber",
    safe: false,
    idempotent: true,
    hasBody: true,
    cacheable: false,
    desc: "Replace a resource entirely. Calling twice gives the same result.",
    request: 'PUT /api/users/42\nContent-Type: application/json\n\n{ "name": "Alice", "email": "new@example.com" }',
    response: '200 OK\n\n{ "id": 42, "name": "Alice", "email": "new@example.com" }',
    nodeStatus: "warning" as const,
  },
  {
    method: "PATCH",
    color: "orange",
    safe: false,
    idempotent: false,
    hasBody: true,
    cacheable: false,
    desc: "Partially update a resource. Send only the fields you want to change.",
    request: 'PATCH /api/users/42\nContent-Type: application/json\n\n{ "email": "patched@example.com" }',
    response: '200 OK\n\n{ "id": 42, "name": "Alice", "email": "patched@example.com" }',
    nodeStatus: "warning" as const,
  },
  {
    method: "DELETE",
    color: "red",
    safe: false,
    idempotent: true,
    hasBody: false,
    cacheable: false,
    desc: "Remove a resource. Calling twice still leaves the resource gone.",
    request: "DELETE /api/users/42\nAuthorization: Bearer <token>",
    response: "204 No Content",
    nodeStatus: "unhealthy" as const,
  },
] as const;

const colorClasses: Record<string, { bg: string; border: string; text: string; badge: string; ring: string }> = {
  blue:   { bg: "bg-blue-500/10",   border: "border-blue-500/30",   text: "text-blue-400",   badge: "bg-blue-500",   ring: "ring-blue-500/30" },
  green:  { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-400", badge: "bg-emerald-500", ring: "ring-emerald-500/30" },
  amber:  { bg: "bg-amber-500/10",  border: "border-amber-500/30",  text: "text-amber-400",  badge: "bg-amber-500",  ring: "ring-amber-500/30" },
  orange: { bg: "bg-orange-500/10", border: "border-orange-500/30", text: "text-orange-400", badge: "bg-orange-500", ring: "ring-orange-500/30" },
  red:    { bg: "bg-red-500/10",    border: "border-red-500/30",    text: "text-red-400",    badge: "bg-red-500",    ring: "ring-red-500/30" },
};

function buildMethodFlowNodes(method: typeof METHOD_CONFIGS[number]): { nodes: FlowNode[]; edges: FlowEdge[] } {
  const isDelete = method.method === "DELETE";
  const isRead = method.method === "GET";

  const nodes: FlowNode[] = [
    {
      id: "client",
      type: "clientNode",
      position: { x: 30, y: 110 },
      data: { label: "Client", sublabel: "Browser / App", status: "healthy", handles: { right: true } },
    },
    {
      id: "server",
      type: "serverNode",
      position: { x: 240, y: 110 },
      data: {
        label: "API Server",
        sublabel: method.method + " handler",
        status: method.nodeStatus,
        handles: { left: true, right: true },
        metrics: [{ label: "method", value: method.method }],
      },
    },
    {
      id: "db",
      type: "databaseNode",
      position: { x: 450, y: 110 },
      data: {
        label: "Database",
        sublabel: isDelete ? "row removed" : isRead ? "row fetched" : "row written",
        status: isDelete ? "unhealthy" : "healthy",
        handles: { left: true },
      },
    },
  ];

  const edges: FlowEdge[] = [
    {
      id: "req",
      source: "client",
      target: "server",
      animated: true,
      label: method.method + " /api/users",
      style: { strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed },
    },
    {
      id: "db-call",
      source: "server",
      target: "db",
      animated: true,
      label: isDelete ? "DELETE" : isRead ? "SELECT" : "INSERT/UPDATE",
      style: { strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed },
    },
  ];

  return { nodes, edges };
}

function HttpMethodPlayground() {
  const [activeIdx, setActiveIdx] = useState(0);
  const method = METHOD_CONFIGS[activeIdx];
  const c = colorClasses[method.color];
  const { nodes, edges } = buildMethodFlowNodes(method);

  return (
    <div className="space-y-4">
      {/* Method selector */}
      <div className="flex flex-wrap gap-2">
        {METHOD_CONFIGS.map((m, i) => {
          const mc = colorClasses[m.color];
          return (
            <button
              key={m.method}
              onClick={() => setActiveIdx(i)}
              className={cn(
                "rounded-full px-4 py-1.5 text-xs font-mono font-bold border transition-all duration-200",
                i === activeIdx
                  ? cn(mc.bg, mc.border, mc.text, "ring-2", mc.ring)
                  : "bg-muted/20 border-border/40 text-muted-foreground hover:text-foreground"
              )}
            >
              {m.method}
            </button>
          );
        })}
      </div>

      {/* Description */}
      <p className={cn("text-sm font-medium rounded-lg px-3 py-2 border", c.bg, c.border, c.text)}>
        {method.desc}
      </p>

      {/* Flow diagram showing request path */}
      <FlowDiagram
        nodes={nodes}
        edges={edges}
        allowDrag={false}
        interactive={false}
        minHeight={220}
      />

      {/* Request / Response panes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-lg border border-border/40 bg-muted/10 p-3">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-2">Request</p>
          <pre className={cn("text-[11px] font-mono whitespace-pre-wrap", c.text)}>{method.request}</pre>
        </div>
        <div className="rounded-lg border border-border/40 bg-muted/10 p-3">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-2">Response</p>
          <pre className="text-[11px] font-mono text-emerald-400 whitespace-pre-wrap">{method.response}</pre>
        </div>
      </div>

      {/* Properties */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: "Safe", value: method.safe, tip: "Does not change server state" },
          { label: "Idempotent", value: method.idempotent, tip: "Same result if called multiple times" },
          { label: "Has Body", value: method.hasBody, tip: "Sends a request body" },
          { label: "Cacheable", value: method.cacheable, tip: "CDNs and browsers can cache this" },
        ].map((prop) => (
          <div key={prop.label} className="flex items-center gap-1.5 text-xs">
            <div className={cn(
              "size-5 rounded-full flex items-center justify-center",
              prop.value ? "bg-emerald-500/20" : "bg-muted/40"
            )}>
              {prop.value
                ? <CheckCircle className="size-3 text-emerald-400" />
                : <XCircle className="size-3 text-muted-foreground/40" />}
            </div>
            <span className="text-muted-foreground">{prop.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── REST vs GraphQL vs gRPC animated fetching comparison ─────────────────────

const PARADIGM_CONFIGS = [
  {
    name: "REST",
    color: "blue",
    calls: 3,
    fieldsFetched: 12,
    fieldsNeeded: 4,
    latencyMs: 250,
    desc: "3 round-trips to get user + posts + comments. Gets 12 fields when you only need 4.",
    endpoints: ["GET /users/42", "GET /users/42/posts", "GET /posts/1/comments"],
    verdict: "over-fetches",
  },
  {
    name: "GraphQL",
    color: "purple",
    calls: 1,
    fieldsFetched: 4,
    fieldsNeeded: 4,
    latencyMs: 180,
    desc: "1 request, ask for exactly what you need. No wasted bandwidth.",
    endpoints: ["POST /graphql  { user { name, posts { title, comments { body } } } }"],
    verdict: "precise",
  },
  {
    name: "gRPC",
    color: "green",
    calls: 1,
    fieldsFetched: 4,
    fieldsNeeded: 4,
    latencyMs: 25,
    desc: "Binary Protobuf over HTTP/2. 10x faster than REST. No browser support.",
    endpoints: ["rpc GetUserWithPosts(UserId) returns (UserResponse)"],
    verdict: "fastest",
  },
] as const;

const paradigmColors: Record<string, { bg: string; border: string; text: string; bar: string }> = {
  blue:   { bg: "bg-blue-500/10",   border: "border-blue-500/30",   text: "text-blue-400",   bar: "bg-blue-500" },
  purple: { bg: "bg-purple-500/10", border: "border-purple-500/30", text: "text-purple-400", bar: "bg-purple-500" },
  green:  { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-400", bar: "bg-emerald-500" },
};

const verdictBadge: Record<string, { bg: string; text: string; label: string }> = {
  "over-fetches": { bg: "bg-amber-500/20", text: "text-amber-400", label: "Over-fetches" },
  "precise":      { bg: "bg-emerald-500/20", text: "text-emerald-400", label: "Precise" },
  "fastest":      { bg: "bg-blue-500/20", text: "text-blue-400", label: "Fastest" },
};

function ParadigmComparison() {
  const [activeIdx, setActiveIdx] = useState(0);
  const sim = useSimulation({ intervalMs: 3000, maxSteps: 3 });
  const p = PARADIGM_CONFIGS[activeIdx];
  const c = paradigmColors[p.color];
  const vb = verdictBadge[p.verdict];

  const latencyChartData = PARADIGM_CONFIGS.map((cfg) => ({
    name: cfg.name,
    latency: cfg.latencyMs,
  }));

  const overfetchData = PARADIGM_CONFIGS.map((cfg) => ({
    name: cfg.name,
    fetched: cfg.fieldsFetched,
    needed: cfg.fieldsNeeded,
  }));

  // Animate the "active" paradigm cycling when playing
  useEffect(() => {
    if (sim.isPlaying) {
      setActiveIdx(sim.step % 3);
    }
  }, [sim.step, sim.isPlaying]);

  return (
    <Playground
      title="REST vs GraphQL vs gRPC"
      simulation={sim}
      canvasHeight="min-h-[420px]"
      canvas={
        <div className="p-4 space-y-4">
          {/* Tabs */}
          <div className="flex gap-2">
            {PARADIGM_CONFIGS.map((cfg, i) => {
              const cc = paradigmColors[cfg.color];
              return (
                <button
                  key={cfg.name}
                  onClick={() => { setActiveIdx(i); sim.pause(); }}
                  className={cn(
                    "rounded-lg px-4 py-1.5 text-sm font-semibold border transition-all",
                    i === activeIdx
                      ? cn(cc.bg, cc.border, cc.text)
                      : "bg-muted/20 border-border/40 text-muted-foreground hover:text-foreground"
                  )}
                >
                  {cfg.name}
                </button>
              );
            })}
          </div>

          {/* Active paradigm panel */}
          <div className={cn("rounded-xl border p-4 transition-all duration-300", c.bg, c.border)}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className={cn("text-base font-bold", c.text)}>{p.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{p.desc}</p>
              </div>
              <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold", vb.bg, vb.text)}>
                {vb.label}
              </span>
            </div>

            {/* Endpoint list */}
            <div className="space-y-1.5 mb-3">
              {p.endpoints.map((ep, i) => (
                <div key={i} className="rounded-md bg-background/60 px-3 py-1.5">
                  <code className={cn("text-[11px] font-mono", c.text)}>{ep}</code>
                </div>
              ))}
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-md bg-background/40 p-2 text-center">
                <p className="text-[10px] text-muted-foreground/60 uppercase">Calls</p>
                <p className={cn("text-lg font-bold font-mono", c.text)}>{p.calls}</p>
              </div>
              <div className="rounded-md bg-background/40 p-2 text-center">
                <p className="text-[10px] text-muted-foreground/60 uppercase">Latency</p>
                <p className={cn("text-lg font-bold font-mono", c.text)}>{p.latencyMs}ms</p>
              </div>
              <div className="rounded-md bg-background/40 p-2 text-center">
                <p className="text-[10px] text-muted-foreground/60 uppercase">Fields</p>
                <p className={cn("text-lg font-bold font-mono", p.fieldsFetched > p.fieldsNeeded ? "text-amber-400" : "text-emerald-400")}>
                  {p.fieldsFetched}/{p.fieldsNeeded}
                </p>
              </div>
            </div>
          </div>

          {/* Latency comparison chart */}
          <div className="rounded-lg border border-border/30 bg-muted/10 p-3">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-2">Latency Comparison (ms)</p>
            <LiveChart
              type="bar"
              data={latencyChartData}
              dataKeys={{ x: "name", y: "latency", label: "Latency (ms)" }}
              height={120}
              unit="ms"
            />
          </div>
        </div>
      }
      explanation={
        <div className="space-y-3">
          <p className="font-semibold text-foreground text-sm">The Data Fetching Problem</p>
          <p>REST was designed when UIs were simple. A phone app showing a user&apos;s name and avatar has to fetch an entire user object with 12+ fields to get 2.</p>
          <p>GraphQL was invented at Facebook to solve this. The client describes exactly what it needs in a query, and the server returns precisely that — nothing more, nothing less.</p>
          <p>gRPC uses Protocol Buffers (binary) over HTTP/2, making it roughly <strong className="text-foreground">10x faster</strong> than REST. But it has no browser support, so it lives in the server-to-server layer.</p>
          <div className="rounded-lg border border-border/30 bg-muted/10 p-3 space-y-1">
            <p className="text-[10px] font-bold uppercase text-muted-foreground/60">When to use each</p>
            <p><span className="text-blue-400 font-mono text-xs">REST</span> — public APIs, simple CRUD, broad tooling</p>
            <p><span className="text-purple-400 font-mono text-xs">GraphQL</span> — complex UIs, diverse clients, mobile</p>
            <p><span className="text-emerald-400 font-mono text-xs">gRPC</span> — microservices, real-time, internal services</p>
          </div>
        </div>
      }
    />
  );
}

// ── Status Code Explorer ──────────────────────────────────────────────────────

const STATUS_GROUPS = [
  {
    range: "2xx",
    label: "Success",
    color: "emerald",
    codes: [
      { code: 200, name: "OK", scenario: "GET /users/42 — user found and returned" },
      { code: 201, name: "Created", scenario: "POST /users — new user created, check Location header" },
      { code: 204, name: "No Content", scenario: "DELETE /users/42 — deleted, nothing to return" },
    ],
  },
  {
    range: "3xx",
    label: "Redirect",
    color: "blue",
    codes: [
      { code: 301, name: "Moved Permanently", scenario: "/api/v1/users → /api/v2/users, update your bookmarks" },
      { code: 304, name: "Not Modified", scenario: "GET with If-None-Match — cached version still valid" },
    ],
  },
  {
    range: "4xx",
    label: "Client Error",
    color: "amber",
    codes: [
      { code: 400, name: "Bad Request", scenario: "Malformed JSON, missing required field, invalid type" },
      { code: 401, name: "Unauthorized", scenario: "No token or invalid token — who are you?" },
      { code: 403, name: "Forbidden", scenario: "Valid token, but you don't have permission for this resource" },
      { code: 404, name: "Not Found", scenario: "GET /users/999 — that user doesn't exist" },
      { code: 409, name: "Conflict", scenario: "POST /users with email that already exists" },
      { code: 422, name: "Unprocessable", scenario: "Request is valid JSON but fails business validation" },
      { code: 429, name: "Too Many Requests", scenario: "Rate limit hit — client must back off and retry later" },
    ],
  },
  {
    range: "5xx",
    label: "Server Error",
    color: "red",
    codes: [
      { code: 500, name: "Internal Server Error", scenario: "Unhandled exception, null pointer, database crash" },
      { code: 502, name: "Bad Gateway", scenario: "Your API gateway can't reach the upstream service" },
      { code: 503, name: "Service Unavailable", scenario: "Server overloaded or deliberately down for maintenance" },
      { code: 504, name: "Gateway Timeout", scenario: "Upstream service took too long to respond" },
    ],
  },
] as const;

const statusColors: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-400", badge: "bg-emerald-500" },
  blue:    { bg: "bg-blue-500/10",    border: "border-blue-500/30",    text: "text-blue-400",    badge: "bg-blue-500" },
  amber:   { bg: "bg-amber-500/10",   border: "border-amber-500/30",   text: "text-amber-400",   badge: "bg-amber-500" },
  red:     { bg: "bg-red-500/10",     border: "border-red-500/30",     text: "text-red-400",     badge: "bg-red-500" },
};

function StatusCodeExplorer() {
  const [selected, setSelected] = useState<{ group: string; code: number } | null>(null);

  const selectedCode = selected
    ? STATUS_GROUPS.flatMap((g) =>
        g.codes.map((c) => ({ ...c, group: g.range, color: g.color }))
      ).find((c) => c.code === selected.code)
    : null;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Click any status code to see exactly when it should be used. Status codes are part of your API contract — they let clients react correctly without parsing the body.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Code grid */}
        <div className="space-y-3">
          {STATUS_GROUPS.map((group) => {
            const sc = statusColors[group.color];
            return (
              <div key={group.range} className="rounded-lg border border-border/30 bg-muted/10 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-mono font-bold text-white", sc.badge)}>
                    {group.range}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">{group.label}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {group.codes.map((code) => {
                    const isSelected = selected?.code === code.code;
                    return (
                      <button
                        key={code.code}
                        onClick={() =>
                          setSelected(
                            isSelected ? null : { group: group.range, code: code.code }
                          )
                        }
                        className={cn(
                          "rounded-md border px-2.5 py-1.5 text-xs font-mono font-bold transition-all duration-150",
                          isSelected
                            ? cn(sc.bg, sc.border, sc.text, "ring-1 ring-current/30")
                            : "bg-muted/20 border-border/30 text-muted-foreground hover:text-foreground hover:border-border"
                        )}
                      >
                        {code.code}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Detail panel */}
        <div className="rounded-xl border border-border/30 bg-muted/10 p-4 flex flex-col">
          {selectedCode ? (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="flex items-start gap-3">
                <span className={cn(
                  "rounded-lg px-3 py-1.5 text-2xl font-mono font-bold",
                  statusColors[selectedCode.color].bg,
                  statusColors[selectedCode.color].text
                )}>
                  {selectedCode.code}
                </span>
                <div>
                  <p className="font-semibold text-foreground">{selectedCode.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedCode.group} — {
                    selectedCode.group === "2xx" ? "Success" :
                    selectedCode.group === "3xx" ? "Redirect" :
                    selectedCode.group === "4xx" ? "Client Error" : "Server Error"
                  }</p>
                </div>
              </div>
              <div className={cn("rounded-lg border p-3", statusColors[selectedCode.color].bg, statusColors[selectedCode.color].border)}>
                <p className="text-[10px] font-semibold uppercase text-muted-foreground/60 mb-1">When this happens</p>
                <p className="text-sm text-muted-foreground">{selectedCode.scenario}</p>
              </div>
              {selectedCode.code === 401 && (
                <div className="rounded-lg bg-muted/20 border border-border/30 p-3 text-xs text-muted-foreground">
                  <strong className="text-foreground">vs 403:</strong> 401 = "I don&apos;t know who you are." 403 = "I know exactly who you are, and the answer is no."
                </div>
              )}
              {selectedCode.code === 429 && (
                <div className="rounded-lg bg-muted/20 border border-border/30 p-3 text-xs text-muted-foreground">
                  Always include a <code className="font-mono text-amber-400">Retry-After</code> header so clients know when to try again.
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-2 text-muted-foreground">
              <Globe className="size-8 opacity-20" />
              <p className="text-sm">Click a status code to see when it occurs</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── API Versioning Strategies Demo ────────────────────────────────────────────

const VERSIONING_STRATEGIES = [
  {
    id: "url",
    name: "URL Path",
    example: "GET /api/v2/users/42",
    pros: ["Visible in logs and browser bar", "Trivially cacheable by CDNs", "Copy-paste shareable"],
    cons: ["URL technically identifies resource, not version", "Hard to default to latest"],
    used: "Stripe, GitHub, Twilio, most major APIs",
    recommended: true,
  },
  {
    id: "header",
    name: "Accept Header",
    example: "GET /api/users/42\nAccept: application/vnd.myapi.v2+json",
    pros: ["URL stays clean and stable", "Theoretically 'pure' REST"],
    cons: ["Invisible in browser bar", "Requires header inspection to debug", "CDN caching is complex"],
    used: "GitHub (secondary)",
    recommended: false,
  },
  {
    id: "query",
    name: "Query Param",
    example: "GET /api/users/42?version=2",
    pros: ["Easy to test in browser", "No routing changes needed"],
    cons: ["Versioning pollutes resource URL semantics", "Easy to forget", "Hard to enforce"],
    used: "Some older APIs, not recommended for new designs",
    recommended: false,
  },
] as const;

function VersioningDemo() {
  const [activeId, setActiveId] = useState<"url" | "header" | "query">("url");
  const active = VERSIONING_STRATEGIES.find((s) => s.id === activeId)!;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {VERSIONING_STRATEGIES.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveId(s.id as "url" | "header" | "query")}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm border transition-all",
              s.id === activeId
                ? "bg-violet-500/10 border-violet-500/30 text-violet-400"
                : "bg-muted/20 border-border/40 text-muted-foreground hover:text-foreground"
            )}
          >
            {s.name}
            {s.recommended && (
              <span className="ml-1.5 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 rounded px-1 py-0.5">
                RECOMMENDED
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-border/30 bg-muted/5 overflow-hidden">
        {/* Code example */}
        <div className="bg-muted/20 border-b border-border/30 px-4 py-3">
          <pre className="text-sm font-mono text-violet-400 whitespace-pre-wrap">{active.example}</pre>
        </div>

        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase text-emerald-400/70 mb-2">Pros</p>
            <ul className="space-y-1">
              {active.pros.map((pro) => (
                <li key={pro} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                  <CheckCircle className="size-3 text-emerald-400 shrink-0 mt-0.5" />
                  {pro}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-red-400/70 mb-2">Cons</p>
            <ul className="space-y-1">
              {active.cons.map((con) => (
                <li key={con} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                  <XCircle className="size-3 text-red-400 shrink-0 mt-0.5" />
                  {con}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="px-4 pb-4">
          <p className="text-[10px] font-semibold uppercase text-muted-foreground/50 mb-1">Used by</p>
          <p className="text-xs text-muted-foreground font-mono">{active.used}</p>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ApisAndRestPage() {
  return (
    <div className="space-y-10">
      <TopicHero
        title="APIs and REST"
        subtitle="APIs are contracts between systems. REST is the most common way to design those contracts on the web — and getting the semantics wrong breaks caches, crawlers, and client developers."
        difficulty="beginner"
      />

      <WhyCare>
        When you check the weather on your phone, your app is calling an API. When Stripe processes a payment, it&apos;s an API call. APIs are the glue of the internet.
      </WhyCare>

      {/* Section 1: HTTP Method Playground */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">HTTP Methods — Click to Explore</h2>
        <p className="text-muted-foreground text-sm">
          HTTP methods are not decorative labels. They carry precise semantics that caches, browsers, and proxies depend on. Select a method to see the full request/response flow, when each property matters, and what happens inside the server. Every <GlossaryTerm term="api">API</GlossaryTerm> you build or consume relies on these methods.
        </p>
        <Playground
          title="HTTP Method Playground"
          canvas={<div className="p-4"><HttpMethodPlayground /></div>}
          controls={false}
          canvasHeight="min-h-[480px]"
          hints={["Click each HTTP method to compare which ones are safe to retry after a network failure."]}
          explanation={
            <div className="space-y-3">
              <p className="font-semibold text-foreground text-sm">Why semantics matter</p>
              <p><strong className="text-foreground">Safe</strong> methods (GET, HEAD) must never change state. Browsers prefetch safe links automatically.</p>
              <p><strong className="text-foreground">Idempotent</strong> methods (GET, PUT, DELETE) are safe to retry after a network failure — the result is the same.</p>
              <p>POST is neither safe nor idempotent. Retrying a POST can create duplicate resources, which is why browsers warn before re-submitting a form.</p>
              <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3">
                <p className="text-xs text-amber-400 font-semibold mb-1">Classic mistake</p>
                <p className="text-xs text-muted-foreground">Using GET for mutations means a crawler can accidentally delete your data just by following links.</p>
              </div>
            </div>
          }
        />
      </section>

      {/* Section 2: REST resource design */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">Resources, Not Actions</h2>
        <p className="text-muted-foreground text-sm">
          <GlossaryTerm term="rest">REST</GlossaryTerm> uses URLs to identify <em>things</em> (nouns) and HTTP methods to describe what to do to them (verbs). When you put verbs in URLs, you lose all the infrastructure HTTP gives you for free.
        </p>

        <BeforeAfter
          before={{
            title: "RPC-style — verbs in URLs",
            content: (
              <div className="font-mono text-xs space-y-1.5">
                <p className="text-red-400">GET /api/getAllUsers</p>
                <p className="text-red-400">GET /api/getUserById?id=5</p>
                <p className="text-red-400">GET /api/createUser?name=Alice</p>
                <p className="text-red-400">GET /api/deleteUser?id=5</p>
                <p className="text-red-400">GET /api/updateUserEmail?id=5</p>
              </div>
            ),
          }}
          after={{
            title: "REST — nouns in URLs, verbs in methods",
            content: (
              <div className="font-mono text-xs space-y-1.5">
                <p><span className="text-blue-400">GET</span>    /api/users</p>
                <p><span className="text-blue-400">GET</span>    /api/users/5</p>
                <p><span className="text-emerald-400">POST</span>   /api/users</p>
                <p><span className="text-red-400">DELETE</span> /api/users/5</p>
                <p><span className="text-amber-400">PATCH</span>  /api/users/5</p>
              </div>
            ),
          }}
        />

        <ConversationalCallout type="tip">
          Nested resources express relationships: <code className="text-xs font-mono bg-muted px-1 rounded">/users/42/posts</code> means posts belonging to user 42. Go at most two levels deep — deeper nesting becomes hard to read and maintain.
        </ConversationalCallout>
      </section>

      {/* Section 3: Status Code Explorer */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">Status Code Explorer</h2>
        <StatusCodeExplorer />

        <ConversationalCallout type="warning">
          Never return 200 OK with an error message in the body. This forces every client to parse the body to detect failures, breaks retry logic, and makes monitoring nearly impossible. Use the correct 4xx or 5xx code.
        </ConversationalCallout>
      </section>

      {/* Section 4: REST vs GraphQL vs gRPC */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">REST vs GraphQL vs gRPC</h2>
        <p className="text-muted-foreground text-sm">
          REST is not the only way to build APIs. The right paradigm depends on who consumes your API and what performance tradeoffs you can accept. Press play to cycle through paradigms and compare <GlossaryTerm term="latency">latency</GlossaryTerm>.
        </p>
        <ParadigmComparison />

        <AhaMoment
          question="Why does GraphQL still use POST even for reads? Doesn't that break caching?"
          answer={
            <p>
              Yes, this is a real tradeoff. GraphQL queries are sent in the request body so they can be complex and large — too big for a URL. That means CDNs and browser caches can&apos;t automatically cache them by URL. Solutions include persisted queries (store the query server-side, send only an ID), or using GET with query-as-URL-param for simple queries. Most production GraphQL setups use a CDN-aware persisted query layer to recover HTTP caching.
            </p>
          }
        />
      </section>

      {/* Section 5: Versioning */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">API Versioning Strategies</h2>
        <p className="text-muted-foreground text-sm">
          Every public API will need to evolve. Versioning lets you make breaking changes without breaking existing clients. There are three main strategies — they look similar but have very different operational tradeoffs.
        </p>
        <VersioningDemo />

        <AhaMoment
          question="URL versioning (/v1/users) seems theoretically wrong — why does everyone use it?"
          answer={
            <p>
              Because developer experience beats theoretical purity. URL versioning is visible in every log line, paste-able in Slack, testable with curl in one command, and cached by CDNs without configuration. Header versioning requires inspecting headers to know which version you&apos;re hitting — invisible in browser bars, harder to debug, and complex to cache. Stripe, GitHub, and Twilio all use URL versioning for exactly these reasons.
            </p>
          }
        />
      </section>

      {/* Section 6: Design principles */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">Designing a Predictable API</h2>
        <p className="text-muted-foreground text-sm">
          A well-designed REST API is one a developer can mostly guess without docs. These patterns make that possible.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { n: "1", title: "Use plural nouns", example: "/users, /posts, /comments — not /user, /post" },
            { n: "2", title: "Nest for ownership", example: "/users/42/posts — posts owned by user 42" },
            { n: "3", title: "Query params for filtering", example: "/posts?status=published&sort=date&limit=20" },
            { n: "4", title: "Right status codes", example: "201 on create, 204 on delete, 422 on validation failure" },
            { n: "5", title: "Consistent response envelope", example: '{ "data": [...], "meta": { "total": 100 } }' },
            { n: "6", title: "PATCH over PUT for updates", example: "Send only changed fields — don't overwrite what you didn't touch" },
          ].map((item) => (
            <div key={item.n} className="flex items-start gap-3 rounded-lg bg-muted/20 border border-border/30 p-3">
              <span className="size-6 rounded-md bg-violet-500/10 text-violet-400 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                {item.n}
              </span>
              <div>
                <p className="text-sm font-semibold">{item.title}</p>
                <p className="text-[11px] font-mono text-muted-foreground mt-0.5">{item.example}</p>
              </div>
            </div>
          ))}
        </div>

        <ConversationalCallout type="question">
          When should you break REST conventions? When operations don&apos;t map to CRUD. &quot;Send a password reset email&quot; or &quot;merge two accounts&quot; are actions, not resources. A POST to <code className="text-xs font-mono bg-muted px-1 rounded">/users/42/merge</code> or <code className="text-xs font-mono bg-muted px-1 rounded">/auth/password-reset</code> is entirely acceptable. REST is a guideline, not a religion.
        </ConversationalCallout>
      </section>

      <TopicQuiz questions={[
        {
          question: "Why is it dangerous to use GET for operations that modify data?",
          options: ["GET requests are slower", "Crawlers and prefetch can accidentally trigger mutations", "GET requests cannot include headers", "Browsers block GET requests to APIs"],
          correctIndex: 1,
          explanation: "Browsers and crawlers prefetch GET links automatically assuming they are safe. If a GET endpoint deletes data, a crawler could wipe your database just by following links."
        },
        {
          question: "What makes an HTTP method idempotent?",
          options: ["It always returns the same response code", "Calling it multiple times produces the same result as calling it once", "It does not require authentication", "It can be cached by CDNs"],
          correctIndex: 1,
          explanation: "PUT and DELETE are idempotent — repeating them doesn't change the outcome. POST is not: calling POST /users twice creates two users."
        },
        {
          question: "What is the main advantage of GraphQL over REST?",
          options: ["It is always faster", "The client requests exactly the fields it needs, avoiding over-fetching", "It uses binary encoding", "It works without HTTP"],
          correctIndex: 1,
          explanation: "REST returns fixed response shapes, often sending more data than needed. GraphQL lets the client specify exactly which fields to return, reducing bandwidth and round-trips."
        },
      ]} />

      <KeyTakeaway
        points={[
          "HTTP methods carry semantics: GET is safe and idempotent, POST is neither, PUT replaces entirely, PATCH updates partially, DELETE is idempotent. Violating these semantics breaks caches, crawlers, and retry logic.",
          "REST uses URLs to identify resources (nouns) and HTTP methods as actions (verbs). This separation makes APIs predictable — a developer should be able to guess your endpoints.",
          "Status codes are part of your API contract: 2xx success, 3xx redirect, 4xx client error, 5xx server error. Never return 200 OK with an error inside the body.",
          "REST over-fetches. GraphQL lets clients request exactly what they need. gRPC uses binary encoding over HTTP/2 for 10x lower latency. Choose based on who's consuming the API.",
          "Use URL versioning (/api/v1/users) in practice — it's visible in logs, cacheable by CDNs, and debuggable with curl, despite being theoretically impure.",
        ]}
      />
    </div>
  );
}
