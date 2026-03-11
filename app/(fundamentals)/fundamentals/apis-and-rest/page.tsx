"use client";

import { useState, useEffect } from "react";
import { TopicHero } from "@/components/topic-hero";
import { FailureScenario } from "@/components/failure-scenario";
import { WhyItBreaks } from "@/components/why-it-breaks";
import { ConceptVisualizer } from "@/components/concept-visualizer";
import { CorrectApproach } from "@/components/correct-approach";
import { KeyTakeaway } from "@/components/key-takeaway";
import { AnimatedFlow } from "@/components/animated-flow";
import { InteractiveDemo } from "@/components/interactive-demo";
import { ConversationalCallout } from "@/components/conversational-callout";
import { AhaMoment } from "@/components/aha-moment";
import { BeforeAfter } from "@/components/before-after";
import { ServerNode } from "@/components/server-node";
import { cn } from "@/lib/utils";
import { Send, ArrowDown, CheckCircle, XCircle, ArrowRightLeft, Globe, Database, Zap } from "lucide-react";

function HttpMethodBadges() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setActive((a) => (a + 1) % 5), 2200);
    return () => clearInterval(t);
  }, []);

  const methods = [
    {
      method: "GET",
      color: "bg-blue-500",
      borderColor: "border-blue-500/30",
      bgColor: "bg-blue-500/10",
      textColor: "text-blue-400",
      safe: true,
      idempotent: true,
      body: false,
      cacheable: true,
      desc: "Retrieve a resource. Never changes server state.",
      example: "GET /api/users/42",
      response: '{ "id": 42, "name": "Alice" }',
    },
    {
      method: "POST",
      color: "bg-green-500",
      borderColor: "border-green-500/30",
      bgColor: "bg-green-500/10",
      textColor: "text-green-400",
      safe: false,
      idempotent: false,
      body: true,
      cacheable: false,
      desc: "Create a new resource. Calling twice creates two resources.",
      example: 'POST /api/users  { "name": "Bob" }',
      response: '201 Created  { "id": 43, "name": "Bob" }',
    },
    {
      method: "PUT",
      color: "bg-yellow-500",
      borderColor: "border-yellow-500/30",
      bgColor: "bg-yellow-500/10",
      textColor: "text-yellow-400",
      safe: false,
      idempotent: true,
      body: true,
      cacheable: false,
      desc: "Replace a resource entirely. Calling twice yields the same result.",
      example: 'PUT /api/users/42  { "name": "Alice", "email": "a@b.com" }',
      response: '200 OK  { "id": 42, "name": "Alice", "email": "a@b.com" }',
    },
    {
      method: "PATCH",
      color: "bg-orange-500",
      borderColor: "border-orange-500/30",
      bgColor: "bg-orange-500/10",
      textColor: "text-orange-400",
      safe: false,
      idempotent: false,
      body: true,
      cacheable: false,
      desc: "Partially update a resource. Only send the fields you want to change.",
      example: 'PATCH /api/users/42  { "email": "new@b.com" }',
      response: '200 OK  { "id": 42, "name": "Alice", "email": "new@b.com" }',
    },
    {
      method: "DELETE",
      color: "bg-red-500",
      borderColor: "border-red-500/30",
      bgColor: "bg-red-500/10",
      textColor: "text-red-400",
      safe: false,
      idempotent: true,
      body: false,
      cacheable: false,
      desc: "Remove a resource. Calling twice still results in the resource being gone.",
      example: "DELETE /api/users/42",
      response: "204 No Content",
    },
  ];

  const m = methods[active];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        {methods.map((method, i) => (
          <button
            key={method.method}
            onClick={() => setActive(i)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-mono font-bold transition-all duration-300 border",
              i === active
                ? `${method.bgColor} ${method.borderColor} ${method.textColor} ring-1 ring-current/20`
                : "bg-muted/20 border-border/50 text-muted-foreground/50 hover:text-muted-foreground"
            )}
          >
            {method.method}
          </button>
        ))}
      </div>
      <div className={cn("rounded-lg border p-4 transition-all duration-300", m.bgColor, m.borderColor)}>
        <p className="text-sm font-medium mb-2">{m.desc}</p>
        <div className="bg-background/60 rounded-md p-3 font-mono text-[11px] space-y-1.5">
          <p className={m.textColor}>{m.example}</p>
          <p className="text-muted-foreground">{m.response}</p>
        </div>
        <div className="flex gap-3 mt-3">
          {[
            { label: "Safe", value: m.safe },
            { label: "Idempotent", value: m.idempotent },
            { label: "Has Body", value: m.body },
            { label: "Cacheable", value: m.cacheable },
          ].map((prop) => (
            <div key={prop.label} className="flex items-center gap-1">
              <div className={cn(
                "size-4 rounded-full flex items-center justify-center",
                prop.value ? "bg-emerald-500/20" : "bg-muted/40"
              )}>
                {prop.value ? (
                  <CheckCircle className="size-2.5 text-emerald-400" />
                ) : (
                  <XCircle className="size-2.5 text-muted-foreground/40" />
                )}
              </div>
              <span className="text-[10px] text-muted-foreground">{prop.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ApiRequestResponseViz() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % 8), 1100);
    return () => clearInterval(t);
  }, []);

  const phases = [
    { label: "Build request", side: "client" },
    { label: "Set headers", side: "client" },
    { label: "Send POST /api/users", side: "network" },
    { label: "Validate input", side: "server" },
    { label: "Insert into DB", side: "server" },
    { label: "Build response", side: "server" },
    { label: "201 Created", side: "network" },
  ];

  return (
    <div className="relative py-4">
      <div className="flex justify-between items-start mb-5 px-4">
        <div className="text-center">
          <div className={cn(
            "size-12 rounded-xl border flex items-center justify-center mb-1.5 transition-all",
            step <= 1 ? "bg-blue-500/10 border-blue-500/30" : step >= 6 ? "bg-emerald-500/10 border-emerald-500/30" : "bg-muted/30 border-border"
          )}>
            <Globe className="size-5 text-blue-400" />
          </div>
          <span className="text-[11px] font-medium">Client</span>
        </div>
        <div className="flex-1 flex items-center justify-center px-4">
          <div className={cn(
            "h-0.5 flex-1 rounded-full transition-all duration-500",
            step === 2 ? "bg-blue-500/40" : step === 6 ? "bg-emerald-500/40" : "bg-border/30"
          )} />
        </div>
        <div className="text-center">
          <div className={cn(
            "size-12 rounded-xl border flex items-center justify-center mb-1.5 transition-all",
            step >= 3 && step <= 5 ? "bg-purple-500/10 border-purple-500/30" : "bg-muted/30 border-border"
          )}>
            <Database className="size-5 text-purple-400" />
          </div>
          <span className="text-[11px] font-medium">Server</span>
        </div>
      </div>
      <div className="space-y-1.5 px-4">
        {phases.map((p, i) => (
          <div
            key={i}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-1.5 transition-all duration-300",
              step > i
                ? "bg-emerald-500/8 border border-emerald-500/15"
                : step === i
                ? "bg-blue-500/10 border border-blue-500/25 ring-1 ring-blue-500/15"
                : "bg-muted/10 border border-transparent"
            )}
          >
            <span className={cn(
              "text-[10px] font-mono w-5 text-right",
              step >= i ? "text-muted-foreground" : "text-muted-foreground/30"
            )}>{i + 1}</span>
            <span className={cn(
              "text-[10px] font-mono uppercase w-14",
              p.side === "client" ? "text-blue-400/60" : p.side === "server" ? "text-purple-400/60" : "text-yellow-400/60"
            )}>{p.side}</span>
            <span className={cn(
              "text-xs transition-opacity",
              step >= i ? "opacity-100" : "opacity-30"
            )}>{p.label}</span>
          </div>
        ))}
      </div>
      {step >= 7 && (
        <div className="flex items-center justify-center gap-2 mt-3 text-[11px] text-emerald-400 font-medium">
          <CheckCircle className="size-3.5" />
          Resource created successfully
        </div>
      )}
    </div>
  );
}

function StatusCodeGrid() {
  const [hoveredGroup, setHoveredGroup] = useState<string | null>(null);
  const [tappedGroup, setTappedGroup] = useState<string | null>(null);

  const groups = [
    {
      range: "2xx",
      label: "Success",
      color: "emerald",
      codes: [
        { code: 200, name: "OK", desc: "Request succeeded" },
        { code: 201, name: "Created", desc: "Resource created" },
        { code: 204, name: "No Content", desc: "Success, no body" },
      ],
    },
    {
      range: "3xx",
      label: "Redirect",
      color: "blue",
      codes: [
        { code: 301, name: "Moved Permanently", desc: "URL changed forever" },
        { code: 304, name: "Not Modified", desc: "Use cached version" },
        { code: 307, name: "Temporary Redirect", desc: "Try different URL" },
      ],
    },
    {
      range: "4xx",
      label: "Client Error",
      color: "yellow",
      codes: [
        { code: 400, name: "Bad Request", desc: "Malformed request" },
        { code: 401, name: "Unauthorized", desc: "Not authenticated" },
        { code: 403, name: "Forbidden", desc: "Authenticated, not allowed" },
        { code: 404, name: "Not Found", desc: "Resource does not exist" },
        { code: 409, name: "Conflict", desc: "State conflict" },
        { code: 422, name: "Unprocessable", desc: "Validation failed" },
        { code: 429, name: "Too Many Requests", desc: "Rate limited" },
      ],
    },
    {
      range: "5xx",
      label: "Server Error",
      color: "red",
      codes: [
        { code: 500, name: "Internal Server Error", desc: "Something broke" },
        { code: 502, name: "Bad Gateway", desc: "Upstream failed" },
        { code: 503, name: "Service Unavailable", desc: "Temporarily down" },
        { code: 504, name: "Gateway Timeout", desc: "Upstream too slow" },
      ],
    },
  ];

  const colorMap: Record<string, { bg: string; border: string; text: string; badge: string }> = {
    emerald: { bg: "bg-emerald-500/8", border: "border-emerald-500/20", text: "text-emerald-400", badge: "bg-emerald-500" },
    blue: { bg: "bg-blue-500/8", border: "border-blue-500/20", text: "text-blue-400", badge: "bg-blue-500" },
    yellow: { bg: "bg-yellow-500/8", border: "border-yellow-500/20", text: "text-yellow-400", badge: "bg-yellow-500" },
    red: { bg: "bg-red-500/8", border: "border-red-500/20", text: "text-red-400", badge: "bg-red-500" },
  };

  return (
    <div className="space-y-3">
      {groups.map((group) => {
        const c = colorMap[group.color];
        const isActive = hoveredGroup === group.range || tappedGroup === group.range;
        return (
          <div
            key={group.range}
            className={cn(
              "rounded-lg border p-3 transition-all duration-300 cursor-default",
              isActive ? `${c.bg} ${c.border}` : "bg-muted/20 border-border/40"
            )}
            onMouseEnter={() => setHoveredGroup(group.range)}
            onMouseLeave={() => setHoveredGroup(null)}
            onClick={() => setTappedGroup(tappedGroup === group.range ? null : group.range)}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-mono font-bold text-white", c.badge)}>
                {group.range}
              </span>
              <span className="text-xs font-medium">{group.label}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {group.codes.map((code) => (
                <div
                  key={code.code}
                  className={cn(
                    "rounded-md border px-2.5 py-1.5 transition-all duration-200",
                    isActive ? `${c.bg} ${c.border}` : "bg-muted/30 border-border/30"
                  )}
                >
                  <span className={cn("font-mono text-xs font-bold", isActive ? c.text : "text-muted-foreground/70")}>
                    {code.code}
                  </span>
                  <span className="text-[10px] text-muted-foreground ml-1.5">{code.name}</span>
                  {isActive && (
                    <p className="text-[10px] text-muted-foreground/60 mt-0.5">{code.desc}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ApiParadigmComparison() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setActive((a) => (a + 1) % 3), 3500);
    return () => clearInterval(t);
  }, []);

  const paradigms = [
    {
      name: "REST",
      color: "blue",
      protocol: "HTTP/1.1",
      format: "JSON",
      latency: "~250ms",
      throughput: "~20K req/s",
      strengths: ["Universal browser support", "Cacheable via HTTP", "Simple & well-understood", "Huge ecosystem"],
      weaknesses: ["Over-fetching data", "Multiple round-trips", "No real-time built-in"],
      bestFor: "Public APIs, CRUD apps, mobile backends",
      example: 'GET /api/users/42\n\n{ "id": 42, "name": "Alice", "posts": [...] }',
    },
    {
      name: "GraphQL",
      color: "purple",
      protocol: "HTTP/1.1",
      format: "JSON",
      latency: "~180ms",
      throughput: "~15K req/s",
      strengths: ["Client picks exact fields", "Single endpoint", "Strong type system", "Introspection"],
      weaknesses: ["Complex caching", "N+1 query risk", "Steep learning curve"],
      bestFor: "Complex UIs, mobile apps, diverse clients",
      example: 'POST /graphql\n{ user(id: 42) { name, email } }\n\n{ "user": { "name": "Alice", "email": "..." } }',
    },
    {
      name: "gRPC",
      color: "green",
      protocol: "HTTP/2",
      format: "Protobuf",
      latency: "~25ms",
      throughput: "~50K req/s",
      strengths: ["10x faster than REST", "Bi-directional streaming", "Code generation", "Strong contracts"],
      weaknesses: ["No browser support", "Binary, not human-readable", "Complex debugging"],
      bestFor: "Microservices, real-time, internal APIs",
      example: 'rpc GetUser(UserId) returns (User)\n\nmessage User {\n  int32 id = 1;\n  string name = 2;\n}',
    },
  ];

  const colorMap: Record<string, { bg: string; border: string; text: string; badge: string }> = {
    blue: { bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-400", badge: "bg-blue-500" },
    purple: { bg: "bg-purple-500/10", border: "border-purple-500/30", text: "text-purple-400", badge: "bg-purple-500" },
    green: { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-400", badge: "bg-emerald-500" },
  };

  const p = paradigms[active];
  const c = colorMap[p.color];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {paradigms.map((paradigm, i) => (
          <button
            key={paradigm.name}
            onClick={() => setActive(i)}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-300 border",
              i === active
                ? `${colorMap[paradigm.color].bg} ${colorMap[paradigm.color].border} ${colorMap[paradigm.color].text}`
                : "bg-muted/20 border-border/40 text-muted-foreground/50 hover:text-muted-foreground"
            )}
          >
            {paradigm.name}
          </button>
        ))}
      </div>
      <div className={cn("rounded-lg border p-4 transition-all duration-300", c.bg, c.border)}>
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div className="rounded-md bg-background/50 p-2 text-center">
            <p className="text-[10px] text-muted-foreground/60 uppercase">Protocol</p>
            <p className="text-xs font-mono font-bold">{p.protocol}</p>
          </div>
          <div className="rounded-md bg-background/50 p-2 text-center">
            <p className="text-[10px] text-muted-foreground/60 uppercase">Latency</p>
            <p className={cn("text-xs font-mono font-bold", c.text)}>{p.latency}</p>
          </div>
          <div className="rounded-md bg-background/50 p-2 text-center">
            <p className="text-[10px] text-muted-foreground/60 uppercase">Throughput</p>
            <p className="text-xs font-mono font-bold">{p.throughput}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <p className="text-[10px] text-emerald-400 font-semibold uppercase mb-1">Strengths</p>
            {p.strengths.map((s) => (
              <p key={s} className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                <CheckCircle className="size-2.5 text-emerald-400 shrink-0" /> {s}
              </p>
            ))}
          </div>
          <div>
            <p className="text-[10px] text-red-400 font-semibold uppercase mb-1">Weaknesses</p>
            {p.weaknesses.map((w) => (
              <p key={w} className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                <XCircle className="size-2.5 text-red-400 shrink-0" /> {w}
              </p>
            ))}
          </div>
        </div>
        <div className="rounded-md bg-background/40 p-3">
          <p className="text-[10px] text-muted-foreground/60 mb-1">Best for: <span className={cn("font-medium", c.text)}>{p.bestFor}</span></p>
          <pre className="text-[11px] font-mono text-muted-foreground whitespace-pre-wrap">{p.example}</pre>
        </div>
      </div>
    </div>
  );
}

export default function ApisAndRestPage() {
  return (
    <div className="space-y-8">
      <TopicHero
        title="APIs and REST"
        subtitle="APIs are contracts between systems. REST is the most common way to design those contracts for the web. Getting it wrong means confused developers, broken integrations, and angry users."
        difficulty="beginner"
      />

      <FailureScenario title="You use GET for everything">
        <p className="text-sm text-muted-foreground">
          Your team builds an API for a task manager. Every operation is a GET request with
          the action stuffed into the URL:
        </p>
        <div className="bg-muted/50 rounded-lg p-4 font-mono text-xs space-y-1">
          <p className="text-red-400">GET /api/createTask?title=Buy+milk</p>
          <p className="text-red-400">GET /api/deleteTask?id=42</p>
          <p className="text-red-400">GET /api/updateTask?id=42&done=true</p>
          <p className="text-red-400">GET /api/getTask?id=42</p>
        </div>
        <p className="text-sm text-muted-foreground mt-3">
          A web crawler indexes your API docs page, follows every link, and accidentally
          deletes half your tasks. A CDN caches your &quot;createTask&quot; response and serves it
          to other users. A browser prefetches a link and creates duplicate tasks.
          Everything breaks — and it is your API design&apos;s fault.
        </p>
        <div className="flex items-center justify-center gap-4 py-2">
          <ServerNode type="client" label="Crawler" status="healthy" />
          <span className="text-red-500 text-sm font-mono">GET /deleteTask?id=42</span>
          <ServerNode type="server" label="API Server" status="unhealthy" />
        </div>
      </FailureScenario>

      <WhyItBreaks title="HTTP methods have semantics — ignoring them has consequences">
        <p className="text-sm text-muted-foreground">
          HTTP methods are not decorative. They carry meaning that the entire web infrastructure
          relies on. GET is defined as <strong>safe</strong> (it must not change state) and
          <strong> idempotent</strong> (calling it twice produces the same result). When you use
          GET for mutations, every tool that assumes GET is safe — browsers, caches, crawlers,
          proxies — becomes a threat to your data.
        </p>
        <div className="grid grid-cols-2 gap-2 mt-3">
          {[
            { n: "1", label: "Browsers prefetch", desc: "GET links are prefetched automatically" },
            { n: "2", label: "CDNs cache GETs", desc: "Cached responses served to other users" },
            { n: "3", label: "Crawlers follow links", desc: "Every GET URL gets visited and indexed" },
            { n: "4", label: "Proxies retry GETs", desc: "Failed GETs are retried since they are 'safe'" },
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

      <ConceptVisualizer title="HTTP Methods — Each One Has a Job">
        <p className="text-sm text-muted-foreground mb-4">
          Every HTTP method has specific properties that the entire web stack depends on.
          Click any method to see its semantics, an example request/response, and its properties.
          Understanding these properties is not trivia — it determines whether caches, proxies,
          and browsers will help or hurt your API.
        </p>
        <HttpMethodBadges />
      </ConceptVisualizer>

      <ConceptVisualizer title="REST: Resources, Not Actions">
        <p className="text-sm text-muted-foreground mb-4">
          REST stands for Representational State Transfer. The key insight is that URLs should
          identify <strong>resources</strong> (nouns), not actions (verbs). The HTTP method
          tells you the action. This separation makes APIs predictable and self-documenting.
        </p>
        <BeforeAfter
          before={{
            title: "Action-based (RPC-style)",
            content: (
              <div className="font-mono text-xs space-y-1">
                <p>GET /api/getAllUsers</p>
                <p>GET /api/getUserById?id=5</p>
                <p>GET /api/createUser?name=Alice</p>
                <p>GET /api/deleteUser?id=5</p>
                <p>GET /api/updateUserEmail?id=5&email=...</p>
              </div>
            ),
          }}
          after={{
            title: "Resource-based (REST)",
            content: (
              <div className="font-mono text-xs space-y-1">
                <p><span className="text-blue-400">GET</span>    /api/users</p>
                <p><span className="text-blue-400">GET</span>    /api/users/5</p>
                <p><span className="text-green-400">POST</span>   /api/users</p>
                <p><span className="text-red-400">DELETE</span> /api/users/5</p>
                <p><span className="text-yellow-400">PATCH</span>  /api/users/5</p>
              </div>
            ),
          }}
        />
      </ConceptVisualizer>

      <ConceptVisualizer title="The Lifecycle of an API Request">
        <p className="text-sm text-muted-foreground mb-4">
          When a client sends an API request, it goes through a predictable pipeline.
          Understanding this pipeline helps you design APIs that validate input early,
          return meaningful errors, and use the right status codes.
        </p>
        <ApiRequestResponseViz />
      </ConceptVisualizer>

      <ConceptVisualizer title="HTTP Status Codes — Speaking the Web's Language">
        <p className="text-sm text-muted-foreground mb-4">
          Status codes tell the client what happened without parsing the response body.
          They are grouped by the first digit. Hover over each group to expand the codes
          you should know. Every API developer should have these memorized — they are the
          vocabulary of the web.
        </p>
        <StatusCodeGrid />
        <ConversationalCallout type="tip">
          The difference between 401 and 403 trips up many developers. 401 means &quot;who are
          you?&quot; — the client has not provided credentials. 403 means &quot;I know who you are,
          but you are not allowed.&quot; Using these correctly makes your API self-documenting
          for frontend developers.
        </ConversationalCallout>
      </ConceptVisualizer>

      <ConceptVisualizer title="API Authentication — Keys vs JWT vs OAuth2">
        <p className="text-sm text-muted-foreground mb-4">
          Every API needs authentication. The right choice depends on who is calling your API
          and what they need access to. Here are the three dominant approaches:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            {
              name: "API Keys",
              color: "text-blue-400",
              border: "border-blue-500/20",
              bg: "bg-blue-500/8",
              how: "Static secret string sent in a header (X-API-Key: abc123)",
              when: "Server-to-server communication, internal services, third-party integrations",
              pros: "Simple to implement, easy to rotate, no expiry management",
              cons: "No user identity, leaked keys grant full access, no scoping",
              example: "Stripe API, SendGrid, Twilio",
            },
            {
              name: "JWT (JSON Web Tokens)",
              color: "text-emerald-400",
              border: "border-emerald-500/20",
              bg: "bg-emerald-500/8",
              how: "Signed token containing user claims, sent in Authorization: Bearer header",
              when: "Stateless authentication for your own users, microservice auth",
              pros: "Stateless (no DB lookup), contains user info, short-lived",
              cons: "Cannot be revoked easily, token size grows with claims, clock skew issues",
              example: "Auth0, Firebase Auth, custom auth systems",
            },
            {
              name: "OAuth2",
              color: "text-purple-400",
              border: "border-purple-500/20",
              bg: "bg-purple-500/8",
              how: "Delegated authorization via authorization server, access + refresh tokens",
              when: "Third-party access to user data (\"Sign in with Google\"), scoped permissions",
              pros: "Users never share passwords, granular scopes, standard protocol",
              cons: "Complex flow, multiple redirects, requires authorization server",
              example: "Google OAuth, GitHub OAuth, \"Login with Facebook\"",
            },
          ].map((auth) => (
            <div key={auth.name} className={cn("rounded-lg border p-3 space-y-2", auth.border, auth.bg)}>
              <h4 className={cn("text-xs font-semibold", auth.color)}>{auth.name}</h4>
              <div className="space-y-1.5">
                <div>
                  <p className="text-[10px] font-medium text-muted-foreground/70">How it works</p>
                  <p className="text-[11px] text-muted-foreground">{auth.how}</p>
                </div>
                <div>
                  <p className="text-[10px] font-medium text-muted-foreground/70">When to use</p>
                  <p className="text-[11px] text-muted-foreground">{auth.when}</p>
                </div>
                <div>
                  <p className="text-[10px] text-emerald-400/70">+ {auth.pros}</p>
                  <p className="text-[10px] text-red-400/70">- {auth.cons}</p>
                </div>
                <p className="text-[10px] text-muted-foreground/50 font-mono">{auth.example}</p>
              </div>
            </div>
          ))}
        </div>
      </ConceptVisualizer>

      <AhaMoment
        question="URL versioning (/v1/users) vs Header versioning (Accept: application/vnd.api+json;version=1) — which is better?"
        answer={
          <p>
            URL versioning wins pragmatically despite being technically impure. URL versioning
            is visible in every log, debuggable with curl, cacheable by CDNs without custom
            configuration, and copy-pasteable in Slack. Header versioning is &quot;cleaner&quot;
            in REST theory because the URL identifies the resource and shouldn&apos;t change, but
            it requires inspecting headers to know which version you are hitting — invisible in
            browser bars, harder to cache, and a pain to debug. In practice, almost every major
            API (Stripe, GitHub, Twilio) uses URL versioning because developer experience
            trumps theoretical purity.
          </p>
        }
      />

      <ConceptVisualizer title="REST vs GraphQL vs gRPC — Choosing the Right Paradigm">
        <p className="text-sm text-muted-foreground mb-4">
          REST is not the only way to build APIs. GraphQL gives clients control over the shape
          of responses. gRPC uses binary serialization for maximum speed. Each paradigm
          has real tradeoffs — the right choice depends on your use case.
        </p>
        <ApiParadigmComparison />
        <AhaMoment
          question="When should you use gRPC instead of REST?"
          answer={
            <p>
              gRPC shines in service-to-service communication where you control both endpoints.
              It uses HTTP/2 multiplexing and Protocol Buffers for binary serialization, achieving
              roughly 10x lower latency and 2.5x higher throughput than REST. But it has no native
              browser support and the binary format makes debugging harder. If your API is public
              or consumed by browsers, REST or GraphQL is the better choice.
            </p>
          }
        />
      </ConceptVisualizer>

      <InteractiveDemo title="Design the Right Endpoint">
        {({ isPlaying, tick }) => {
          const challenges = [
            { op: "Fetch a user profile", method: "GET", path: "/users/42", status: "200 OK" },
            { op: "Create a new blog post", method: "POST", path: "/posts", status: "201 Created" },
            { op: "Update a user's email only", method: "PATCH", path: "/users/42", status: "200 OK" },
            { op: "Replace entire user settings", method: "PUT", path: "/users/42/settings", status: "200 OK" },
            { op: "Remove a comment", method: "DELETE", path: "/comments/99", status: "204 No Content" },
            { op: "List posts by user 42", method: "GET", path: "/users/42/posts", status: "200 OK" },
          ];
          const revealed = isPlaying ? Math.min((tick % 7) + 1, challenges.length) : 0;

          const methodColor = (m: string) =>
            m === "GET" ? "text-blue-400" :
            m === "POST" ? "text-green-400" :
            m === "DELETE" ? "text-red-400" :
            m === "PUT" ? "text-yellow-400" : "text-orange-400";

          return (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Press play to reveal the correct RESTful design for each operation. Notice
                the pattern: nouns in URLs, verbs in methods, status codes that match the action.
              </p>
              {challenges.map((item, i) => (
                <div
                  key={item.op}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border transition-all",
                    i < revealed ? "bg-muted/30 border-border/50" : "bg-muted/10 border-border/20"
                  )}
                >
                  <span className="text-xs text-muted-foreground">{item.op}</span>
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    {i < revealed ? (
                      <>
                        <span className={cn("font-bold", methodColor(item.method))}>{item.method}</span>
                        <span className="text-muted-foreground">{item.path}</span>
                        <span className="text-muted-foreground/50">|</span>
                        <span className="text-emerald-400">{item.status}</span>
                        <CheckCircle className="size-3 text-emerald-500" />
                      </>
                    ) : (
                      <>
                        <span className="text-muted-foreground/30">??? /???</span>
                        <XCircle className="size-3 text-muted-foreground/20" />
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          );
        }}
      </InteractiveDemo>

      <AhaMoment
        question="What is the difference between PUT and PATCH?"
        answer={
          <p>
            PUT replaces the entire resource. If you PUT a user with only a new email,
            you lose all other fields (name, avatar, etc.) unless you send them all.
            PATCH updates only the fields you specify. In practice, most &quot;update&quot;
            operations should be PATCH — PUT is for full replacements.
          </p>
        }
      />

      <CorrectApproach title="Designing a Clean REST API">
        <p className="text-sm text-muted-foreground mb-3">
          A well-designed REST API is predictable. A developer who has never seen your docs
          should be able to guess most of your endpoints. Here are the principles that make
          that possible:
        </p>
        <div className="space-y-2">
          {[
            { n: "1", title: "Use plural nouns for collections", example: "/users, /posts, /comments — not /user, /post" },
            { n: "2", title: "Nest for relationships", example: "/users/42/posts — posts belonging to user 42" },
            { n: "3", title: "Use query params for filtering", example: "/posts?status=published&sort=created_at&limit=20" },
            { n: "4", title: "Return appropriate status codes", example: "201 on create, 204 on delete, 422 on validation failure" },
            { n: "5", title: "Use consistent response envelopes", example: '{ "data": [...], "meta": { "total": 100, "page": 1 } }' },
            { n: "6", title: "Version your API", example: "/api/v1/users — lets you evolve without breaking clients" },
          ].map((item) => (
            <div key={item.n} className="flex items-start gap-2.5 rounded-lg bg-muted/30 p-3">
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 rounded-md size-6 flex items-center justify-center shrink-0">
                {item.n}
              </span>
              <div>
                <p className="text-xs font-semibold">{item.title}</p>
                <p className="text-[11px] font-mono text-muted-foreground">{item.example}</p>
              </div>
            </div>
          ))}
        </div>
      </CorrectApproach>

      <ConversationalCallout type="question">
        When should you break REST conventions? When you have operations that do not map cleanly
        to CRUD. For example, &quot;send an email&quot; or &quot;merge two accounts.&quot; In these
        cases, a POST to a descriptive endpoint like <code className="text-xs bg-muted px-1 rounded font-mono">/accounts/42/merge</code> is
        perfectly acceptable. REST is a guideline, not a religion.
      </ConversationalCallout>

      <AhaMoment
        question="Why does REST use existing HTTP infrastructure instead of inventing its own protocol?"
        answer={
          <p>
            Because HTTP already solved caching (Cache-Control, ETags), authentication
            (Authorization header), content negotiation (Accept header), and error signaling
            (status codes). REST leverages decades of infrastructure — proxies, CDNs, browsers —
            that all speak HTTP natively. Inventing a new protocol means losing all of that for free.
          </p>
        }
      />

      <KeyTakeaway
        points={[
          "REST treats URLs as resources (nouns) and HTTP methods as actions (verbs). This separation makes APIs predictable.",
          "GET must be safe and idempotent — never use it for mutations, or caches, crawlers, and prefetchers will break your system.",
          "Use PUT for full replacements and PATCH for partial updates. Most updates should be PATCH.",
          "Status codes are part of your API contract: 2xx success, 3xx redirect, 4xx client error, 5xx server error. Know the common ones by heart.",
          "REST is not the only option. GraphQL gives clients control over response shape. gRPC offers 10x lower latency for service-to-service calls. Choose based on your use case.",
          "Good API design is predictable: plural nouns, nested resources, query params for filtering, versioning, and consistent response shapes.",
        ]}
      />
    </div>
  );
}
