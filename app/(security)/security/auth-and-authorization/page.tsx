"use client";

import { useState, useMemo } from "react";
import { TopicHero } from "@/components/topic-hero";
import { KeyTakeaway } from "@/components/key-takeaway";
import { AhaMoment } from "@/components/aha-moment";
import { ConversationalCallout } from "@/components/conversational-callout";
import { BeforeAfter } from "@/components/before-after";
import { Playground } from "@/components/playground";
import { FlowDiagram } from "@/components/flow-diagram";
import { useSimulation } from "@/hooks/use-simulation";
import { cn } from "@/lib/utils";
import type { FlowNode, FlowEdge } from "@/components/flow-diagram";
import { CheckCircle2, XCircle, Shield, Lock } from "lucide-react";
import { MarkerType } from "@xyflow/react";

/* ── static class maps (no dynamic interpolation) ── */

const jwtSectionColors: Record<string, string> = {
  header: "text-red-400",
  payload: "text-violet-400",
  signature: "text-emerald-400",
};

const jwtSectionBg: Record<string, string> = {
  header: "bg-red-500/10 border-red-500/20",
  payload: "bg-violet-500/10 border-violet-500/20",
  signature: "bg-emerald-500/10 border-emerald-500/20",
};

const jwtSectionBgActive: Record<string, string> = {
  header: "text-red-400 bg-red-500/10",
  payload: "text-violet-400 bg-violet-500/10",
  signature: "text-emerald-400 bg-emerald-500/10",
};

const jwtSectionBgInactive: Record<string, string> = {
  header: "text-red-400/40",
  payload: "text-violet-400/40",
  signature: "text-emerald-400/40",
};

const permissionStatusStyles: Record<string, string> = {
  granted: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  denied: "bg-red-500/20 text-red-400 border-red-500/30",
  idle: "bg-muted/30 text-muted-foreground border-border/50",
};

/* ── OAuth 2.0 Flow Playground ── */

const OAUTH_STEPS = [
  { label: "User clicks 'Login with Google'", detail: "App generates code_verifier + code_challenge (PKCE)" },
  { label: "Redirect to Auth Server", detail: "GET /authorize?response_type=code&code_challenge=...&scope=openid" },
  { label: "User logs in at Auth Server", detail: "Auth server shows consent screen with requested scopes" },
  { label: "Auth Server redirects back", detail: "GET /callback?code=AUTH_CODE_abc123" },
  { label: "App exchanges code for tokens", detail: "POST /token { code, code_verifier, client_id, redirect_uri }" },
  { label: "Auth Server returns tokens", detail: "{ access_token: 'eyJ...', id_token: 'eyJ...', refresh_token: '...' }" },
  { label: "App calls Resource Server", detail: "GET /api/user  Authorization: Bearer eyJ..." },
];

function OAuthPlayground() {
  const sim = useSimulation({ maxSteps: 7, intervalMs: 1800 });

  const edgeColor = "#8b5cf6";
  const edgeColorActive = "#22c55e";

  const nodes: FlowNode[] = useMemo(() => [
    { id: "user", type: "clientNode", position: { x: 0, y: 80 }, data: { label: "User", sublabel: "Browser", status: sim.step >= 1 ? "healthy" : "idle", handles: { right: true } } },
    { id: "app", type: "serverNode", position: { x: 220, y: 80 }, data: { label: "Your App", sublabel: "Backend", status: sim.step >= 2 ? "healthy" : "idle", handles: { left: true, right: true } } },
    { id: "auth", type: "gatewayNode", position: { x: 440, y: 0 }, data: { label: "Auth Server", sublabel: "Google / IdP", status: sim.step >= 3 ? "healthy" : "idle", handles: { left: true, bottom: true } } },
    { id: "resource", type: "databaseNode", position: { x: 440, y: 170 }, data: { label: "Resource Server", sublabel: "/api/user", status: sim.step >= 7 ? "healthy" : "idle", handles: { left: true, top: true } } },
  ], [sim.step]);

  const activeEdgeMap: Record<number, string> = { 1: "e-user-app", 2: "e-app-auth", 3: "e-auth-app-back", 4: "e-auth-app-back", 5: "e-app-auth", 6: "e-auth-app-back", 7: "e-app-resource" };

  const edges: FlowEdge[] = useMemo(() => {
    const active = activeEdgeMap[sim.step] ?? "";
    return [
      { id: "e-user-app", source: "user", target: "app", animated: active === "e-user-app", style: { stroke: active === "e-user-app" ? edgeColorActive : edgeColor, strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: active === "e-user-app" ? edgeColorActive : edgeColor } },
      { id: "e-app-auth", source: "app", target: "auth", animated: active === "e-app-auth", style: { stroke: active === "e-app-auth" ? edgeColorActive : edgeColor, strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: active === "e-app-auth" ? edgeColorActive : edgeColor } },
      { id: "e-auth-app-back", source: "auth", target: "app", animated: active === "e-auth-app-back", style: { stroke: active === "e-auth-app-back" ? edgeColorActive : edgeColor, strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: active === "e-auth-app-back" ? edgeColorActive : edgeColor } },
      { id: "e-app-resource", source: "app", target: "resource", animated: active === "e-app-resource", style: { stroke: active === "e-app-resource" ? edgeColorActive : edgeColor, strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: active === "e-app-resource" ? edgeColorActive : edgeColor } },
    ];
  }, [sim.step]);

  return (
    <Playground
      title="OAuth 2.0 Authorization Code Flow with PKCE"
      simulation={sim}
      canvasHeight="min-h-[300px]"
      canvas={<FlowDiagram nodes={nodes} edges={edges} interactive={false} minHeight={300} />}
      explanation={(state) => (
        <div className="space-y-3">
          {OAUTH_STEPS.map((s, i) => {
            const isActive = state.step === i + 1;
            const isDone = state.step > i + 1;
            const isPending = state.step < i + 1;
            return (
              <div
                key={i}
                className={cn(
                  "rounded-lg border px-3 py-2 transition-all duration-300",
                  isActive ? "bg-violet-500/10 border-violet-500/30 ring-1 ring-violet-500/20" : "",
                  isDone ? "bg-emerald-500/5 border-emerald-500/20 opacity-70" : "",
                  isPending ? "bg-muted/10 border-border/30 opacity-40" : ""
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-muted-foreground/60 w-4">{i + 1}</span>
                  <span className={cn("text-xs font-medium", isActive ? "text-violet-400" : isDone ? "text-emerald-400" : "text-muted-foreground")}>
                    {s.label}
                  </span>
                  {isDone && <CheckCircle2 className="size-3 text-emerald-400 ml-auto shrink-0" />}
                </div>
                {(isActive || isDone) && (
                  <p className="text-[11px] font-mono text-muted-foreground mt-1 pl-6 break-all">{s.detail}</p>
                )}
              </div>
            );
          })}
          {state.step >= 7 && (
            <div className="text-center text-xs font-medium text-emerald-400 pt-2">
              User authenticated — session created
            </div>
          )}
        </div>
      )}
    />
  );
}

/* ── JWT Anatomy Interactive ── */

const JWT_SECTIONS = {
  header: {
    encoded: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9",
    decoded: '{\n  "alg": "RS256",\n  "typ": "JWT"\n}',
    desc: "Declares the signing algorithm (RS256 = RSA + SHA-256) and token type.",
  },
  payload: {
    encoded: "eyJzdWIiOiI0MiIsInJvbGUiOiJhZG1pbiIsImV4cCI6MTcwMH0",
    decoded: '{\n  "sub": "42",\n  "role": "admin",\n  "iat": 1700000000,\n  "exp": 1700000900\n}',
    desc: "Contains claims about the user. base64-encoded, NOT encrypted.",
  },
  signature: {
    encoded: "SflKxwRJSMeKKF2QT4fw...",
    decoded: 'RSASHA256(\n  base64(header) + "." +\n  base64(payload),\n  privateKey\n)',
    desc: "Cryptographic proof that header + payload haven't been tampered with.",
  },
};

function JwtPlayground() {
  const [active, setActive] = useState<"header" | "payload" | "signature">("header");
  const [editRole, setEditRole] = useState("admin");
  const [editExp, setEditExp] = useState("900");
  const [tampered, setTampered] = useState(false);

  const sectionKeys: Array<"header" | "payload" | "signature"> = ["header", "payload", "signature"];

  const customPayload = `{\n  "sub": "42",\n  "role": "${editRole}",\n  "iat": 1700000000,\n  "exp": ${1700000000 + parseInt(editExp || "900")}\n}`;

  return (
    <div className="rounded-xl border border-border/50 bg-muted/[0.02] p-5 space-y-4">
      <h3 className="text-base font-semibold flex items-center gap-2">
        <Lock className="size-4 text-violet-400" />
        JWT Anatomy — Header.Payload.Signature
      </h3>

      {/* Token display */}
      <div className="flex flex-wrap gap-1 font-mono text-xs p-3 rounded-lg bg-muted/30 border border-border/50">
        {sectionKeys.map((key, i) => (
          <span key={key} className="flex items-center">
            {i > 0 && <span className="text-muted-foreground/30 mr-1">.</span>}
            <button
              onClick={() => setActive(key)}
              className={cn(
                "cursor-pointer transition-all px-1 rounded hover:underline",
                active === key ? jwtSectionBgActive[key] : jwtSectionBgInactive[key]
              )}
            >
              {key === "payload" && tampered ? "eyJtb2RpZmllZCI6InRydWUifQ" : JWT_SECTIONS[key].encoded}
            </button>
          </span>
        ))}
      </div>

      {/* Section tabs */}
      <div className="flex gap-2">
        {sectionKeys.map((key) => (
          <button
            key={key}
            onClick={() => setActive(key)}
            className={cn(
              "flex-1 text-[11px] font-semibold py-1.5 rounded-md border transition-all capitalize",
              active === key ? cn(jwtSectionBg[key], jwtSectionColors[key]) : "bg-muted/20 border-border/50 text-muted-foreground/50"
            )}
          >
            {key}
          </button>
        ))}
      </div>

      {/* Decoded view */}
      <div className={cn("rounded-lg border p-3 transition-all", jwtSectionBg[active])}>
        <pre className={cn("text-xs font-mono mb-2 whitespace-pre-wrap", jwtSectionColors[active])}>
          {active === "payload" ? customPayload : JWT_SECTIONS[active].decoded}
        </pre>
        <p className="text-[11px] text-muted-foreground leading-relaxed">{JWT_SECTIONS[active].desc}</p>
      </div>

      {/* Edit controls */}
      <div className="rounded-lg border border-border/50 bg-muted/20 p-3 space-y-3">
        <p className="text-xs font-semibold text-muted-foreground">Edit payload fields:</p>
        <div className="flex flex-wrap gap-3">
          <label className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground font-mono">role:</span>
            <select
              value={editRole}
              onChange={(e) => { setEditRole(e.target.value); setTampered(true); }}
              className="bg-muted/40 border border-border/50 rounded px-2 py-1 text-xs font-mono"
            >
              <option value="admin">admin</option>
              <option value="editor">editor</option>
              <option value="viewer">viewer</option>
            </select>
          </label>
          <label className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground font-mono">exp (seconds):</span>
            <input
              type="number"
              value={editExp}
              onChange={(e) => { setEditExp(e.target.value); setTampered(true); }}
              className="bg-muted/40 border border-border/50 rounded px-2 py-1 text-xs font-mono w-20"
            />
          </label>
        </div>

        {tampered && (
          <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 mt-2">
            <XCircle className="size-4 text-red-400 shrink-0" />
            <p className="text-xs text-red-400">
              Signature invalid! The payload was modified, but the signature was computed over the original data.
              The server will reject this token with a 401.
            </p>
          </div>
        )}

        {tampered && (
          <button
            onClick={() => { setEditRole("admin"); setEditExp("900"); setTampered(false); }}
            className="text-[11px] text-violet-400 hover:underline"
          >
            Reset to original
          </button>
        )}
      </div>
    </div>
  );
}

/* ── RBAC Playground ── */

const RESOURCES = ["users", "posts", "settings", "billing"] as const;
const ROLES = ["admin", "editor", "viewer"] as const;

const DEFAULT_PERMISSIONS: Record<string, Record<string, boolean>> = {
  admin: { users: true, posts: true, settings: true, billing: true },
  editor: { users: false, posts: true, settings: false, billing: false },
  viewer: { users: false, posts: false, settings: false, billing: false },
};

function RbacPlayground() {
  const [permissions, setPermissions] = useState(DEFAULT_PERMISSIONS);
  const [testRole, setTestRole] = useState<string>("editor");
  const [testResource, setTestResource] = useState<string>("posts");
  const [simResult, setSimResult] = useState<"idle" | "granted" | "denied">("idle");

  const sim = useSimulation({ maxSteps: 4, intervalMs: 800 });

  const togglePerm = (role: string, resource: string) => {
    setPermissions((prev) => ({
      ...prev,
      [role]: { ...prev[role], [resource]: !prev[role][resource] },
    }));
    setSimResult("idle");
  };

  const runCheck = () => {
    setSimResult("idle");
    sim.reset();
    setTimeout(() => {
      sim.play();
    }, 50);
  };

  const isAllowed = permissions[testRole]?.[testResource] ?? false;

  if (sim.step >= 4 && simResult === "idle") {
    setSimResult(isAllowed ? "granted" : "denied");
  }

  const rbacNodes: FlowNode[] = useMemo(() => [
    { id: "user", type: "clientNode", position: { x: 0, y: 50 }, data: { label: `User (${testRole})`, status: sim.step >= 1 ? "healthy" : "idle", handles: { right: true } } },
    { id: "middleware", type: "gatewayNode", position: { x: 200, y: 50 }, data: { label: "Auth Middleware", status: sim.step >= 2 ? "warning" : "idle", handles: { left: true, right: true } } },
    { id: "check", type: "serverNode", position: { x: 400, y: 50 }, data: { label: "Permission Check", sublabel: `${testRole} → ${testResource}?`, status: sim.step >= 3 ? (isAllowed ? "healthy" : "unhealthy") : "idle", handles: { left: true, right: true } } },
    { id: "resource", type: "databaseNode", position: { x: 600, y: 50 }, data: { label: testResource, status: sim.step >= 4 && isAllowed ? "healthy" : "idle", handles: { left: true } } },
  ], [sim.step, testRole, testResource, isAllowed]);

  const rbacEdges: FlowEdge[] = useMemo(() => [
    { id: "e1", source: "user", target: "middleware", animated: sim.step === 1, style: { stroke: "#8b5cf6", strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#8b5cf6" } },
    { id: "e2", source: "middleware", target: "check", animated: sim.step === 2, style: { stroke: "#8b5cf6", strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#8b5cf6" } },
    { id: "e3", source: "check", target: "resource", animated: sim.step === 3, style: { stroke: sim.step >= 3 && isAllowed ? "#22c55e" : sim.step >= 3 ? "#ef4444" : "#8b5cf6", strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: sim.step >= 3 && isAllowed ? "#22c55e" : sim.step >= 3 ? "#ef4444" : "#8b5cf6" } },
  ], [sim.step, isAllowed]);

  return (
    <div className="space-y-4">
      <Playground
        title="RBAC Permission Playground"
        simulation={sim}
        canvasHeight="min-h-[200px]"
        canvas={<FlowDiagram nodes={rbacNodes} edges={rbacEdges} interactive={false} minHeight={200} />}
        controls={false}
      />

      {/* Permission grid */}
      <div className="rounded-lg border border-border/50 bg-muted/[0.02] p-4 space-y-3">
        <p className="text-xs font-semibold text-muted-foreground">Permission Matrix (click to toggle):</p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="text-left py-1 px-2 text-muted-foreground font-medium">Role</th>
                {RESOURCES.map((r) => (
                  <th key={r} className="text-center py-1 px-2 text-muted-foreground font-medium capitalize">{r}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROLES.map((role) => (
                <tr key={role}>
                  <td className="py-1 px-2 font-mono font-semibold capitalize">{role}</td>
                  {RESOURCES.map((res) => (
                    <td key={res} className="text-center py-1 px-2">
                      <button
                        onClick={() => togglePerm(role, res)}
                        className={cn(
                          "size-7 rounded-md border transition-all text-[10px] font-bold",
                          permissions[role][res]
                            ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
                            : "bg-red-500/10 border-red-500/20 text-red-400/60"
                        )}
                      >
                        {permissions[role][res] ? "Y" : "N"}
                      </button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Test simulation */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-border/30">
          <span className="text-xs text-muted-foreground">Simulate:</span>
          <select
            value={testRole}
            onChange={(e) => { setTestRole(e.target.value); setSimResult("idle"); }}
            className="bg-muted/40 border border-border/50 rounded px-2 py-1 text-xs font-mono"
          >
            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <span className="text-xs text-muted-foreground">tries to access</span>
          <select
            value={testResource}
            onChange={(e) => { setTestResource(e.target.value); setSimResult("idle"); }}
            className="bg-muted/40 border border-border/50 rounded px-2 py-1 text-xs font-mono"
          >
            {RESOURCES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <button
            onClick={runCheck}
            className="rounded-md bg-violet-500/20 border border-violet-500/30 px-3 py-1 text-xs font-medium text-violet-400 hover:bg-violet-500/30 transition-colors"
          >
            Run check
          </button>
          {simResult !== "idle" && (
            <span className={cn("flex items-center gap-1 text-xs font-semibold rounded-md border px-2 py-1", permissionStatusStyles[simResult])}>
              {simResult === "granted" ? <CheckCircle2 className="size-3" /> : <XCircle className="size-3" />}
              {simResult === "granted" ? "Access Granted" : "403 Forbidden"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Session vs Token Comparison ── */

function SessionVsToken() {
  const sessionNodes: FlowNode[] = [
    { id: "client", type: "clientNode", position: { x: 0, y: 40 }, data: { label: "Browser", sublabel: "Cookie: session_id=abc", status: "healthy", handles: { right: true } } },
    { id: "server", type: "serverNode", position: { x: 250, y: 0 }, data: { label: "Server", sublabel: "Lookup session in store", status: "healthy", handles: { left: true, right: true } } },
    { id: "store", type: "databaseNode", position: { x: 480, y: 40 }, data: { label: "Session Store", sublabel: "Redis / DB", status: "healthy", handles: { left: true } } },
  ];
  const sessionEdges: FlowEdge[] = [
    { id: "e1", source: "client", target: "server", animated: true, style: { stroke: "#3b82f6", strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#3b82f6" } },
    { id: "e2", source: "server", target: "store", animated: true, style: { stroke: "#3b82f6", strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#3b82f6" } },
  ];

  const tokenNodes: FlowNode[] = [
    { id: "client", type: "clientNode", position: { x: 0, y: 40 }, data: { label: "Browser", sublabel: "Header: Bearer eyJ...", status: "healthy", handles: { right: true } } },
    { id: "server", type: "serverNode", position: { x: 280, y: 40 }, data: { label: "Server", sublabel: "Verify JWT signature", status: "healthy", handles: { left: true } } },
  ];
  const tokenEdges: FlowEdge[] = [
    { id: "e1", source: "client", target: "server", animated: true, style: { stroke: "#22c55e", strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: "#22c55e" } },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold flex items-center gap-2">
        <Shield className="size-4 text-blue-400" />
        Sessions vs Tokens — Side by Side
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/[0.02] overflow-hidden">
          <div className="px-4 py-2 border-b border-blue-500/10 bg-blue-500/[0.04]">
            <span className="text-xs font-semibold text-blue-400">Stateful Sessions</span>
          </div>
          <div className="p-2">
            <FlowDiagram nodes={sessionNodes} edges={sessionEdges} interactive={false} minHeight={140} />
          </div>
          <div className="px-4 pb-3 space-y-1">
            <p className="text-[11px] text-muted-foreground">Server stores session data. Must query store on every request. Requires sticky sessions or shared store for horizontal scaling.</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {["Stateful", "Server memory", "Easy revocation"].map((t) => (
                <span key={t} className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded px-1.5 py-0.5">{t}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.02] overflow-hidden">
          <div className="px-4 py-2 border-b border-emerald-500/10 bg-emerald-500/[0.04]">
            <span className="text-xs font-semibold text-emerald-400">Stateless JWTs</span>
          </div>
          <div className="p-2">
            <FlowDiagram nodes={tokenNodes} edges={tokenEdges} interactive={false} minHeight={140} />
          </div>
          <div className="px-4 pb-3 space-y-1">
            <p className="text-[11px] text-muted-foreground">Token carries all claims. Server verifies signature without any database lookup. Scales horizontally with zero shared state.</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {["Stateless", "No DB lookup", "Hard to revoke"].map((t) => (
                <span key={t} className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded px-1.5 py-0.5">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ── */

export default function AuthAndAuthorizationPage() {
  return (
    <div className="space-y-8">
      <TopicHero
        title="Authentication & Authorization"
        subtitle="Proving who you are is step one. Proving what you're allowed to do is step two. Skip either and you have no security at all."
        difficulty="intermediate"
      />

      <ConversationalCallout type="question">
        What is the difference between a 401 and a 403? A 401 means &quot;we do not know who you are&quot;
        (authentication failed). A 403 means &quot;we know who you are, but you are not allowed&quot;
        (authorization failed). If your API only ever returns 401, you have probably skipped the authorization check entirely.
      </ConversationalCallout>

      {/* OAuth 2.0 Flow */}
      <OAuthPlayground />

      <ConversationalCallout type="tip">
        PKCE works by generating a random <code className="text-xs bg-muted px-1 rounded font-mono">code_verifier</code> on
        the client, hashing it to create a <code className="text-xs bg-muted px-1 rounded font-mono">code_challenge</code> sent
        with the initial redirect. When exchanging the authorization code, the client proves it started the flow by sending
        the original verifier. Even if an attacker intercepts the code, they cannot exchange it without the verifier.
      </ConversationalCallout>

      {/* JWT Anatomy */}
      <JwtPlayground />

      <AhaMoment
        question="If JWTs are just base64-encoded, can't someone edit the payload to make themselves an admin?"
        answer={
          <p>
            They can change the payload, but then the signature will not match. The server verifies the signature
            using a private key that only it possesses. A tampered token fails verification and gets rejected
            with a 401. Try it in the playground above: change the role and watch the signature warning appear.
            For asymmetric algorithms like RS256, the signing key (private) and verification key (public) are
            different, so even services that verify tokens cannot forge new ones.
          </p>
        }
      />

      {/* RBAC Playground */}
      <RbacPlayground />

      {/* Session vs Token */}
      <SessionVsToken />

      <BeforeAfter
        before={{
          title: "No Authorization Check",
          content: (
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="font-mono text-xs bg-muted/50 p-2 rounded">
                {`// API: /api/admin/users`}<br />
                {`const user = getSession(req);`}<br />
                {`if (!user) return 401;`}<br />
                {`// Any logged-in user proceeds`}<br />
                {`return getAllUsers();`}
              </p>
              <p>Any authenticated user can hit this endpoint and get full admin data. This is Broken Access Control — OWASP #1.</p>
            </div>
          ),
        }}
        after={{
          title: "Proper AuthN + AuthZ",
          content: (
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="font-mono text-xs bg-muted/50 p-2 rounded">
                {`// API: /api/admin/users`}<br />
                {`const user = getSession(req);`}<br />
                {`if (!user) return 401;`}<br />
                {`if (user.role !== "admin")`}<br />
                {`  return 403;`}<br />
                {`return getAllUsers();`}
              </p>
              <p>Authentication (401) and authorization (403) are both enforced server-side. The client never decides access.</p>
            </div>
          ),
        }}
      />

      <ConversationalCallout type="warning">
        Use RS256 (asymmetric) over HS256 (symmetric) for JWTs in distributed systems. With HS256,
        every service that verifies tokens needs the secret key — and any of them could forge tokens.
        With RS256, only the auth service holds the private signing key; other services verify with
        the public key and cannot create new tokens.
      </ConversationalCallout>

      <ConversationalCallout type="tip">
        In system design interviews, always mention both authn and authz. Saying &quot;we check if the user
        is logged in&quot; only covers half the problem. Mention RBAC for simple permission models,
        ABAC when you need context-aware rules, and note that most production systems use short-lived
        access tokens (15 min) with rotated refresh tokens stored in httpOnly/Secure/SameSite cookies.
      </ConversationalCallout>

      <KeyTakeaway
        points={[
          "Authentication verifies identity (who you are). Authorization verifies permissions (what you can do). Both must be enforced server-side on every request.",
          "OAuth2 + PKCE is the standard for third-party login. The code_verifier/code_challenge pair prevents authorization code interception even in public clients.",
          "JWTs carry claims in a signed payload. Edit the payload and the signature breaks — that's the whole point. Use RS256 in distributed systems.",
          "RBAC assigns permissions via roles (simple but can lead to role explosion). ABAC evaluates attributes (flexible but complex). Most systems use both.",
          "Stateful sessions require server-side storage but are easy to revoke. Stateless JWTs scale horizontally but are hard to revoke before expiration.",
          "Store tokens in httpOnly/Secure/SameSite cookies. Never use localStorage — it's accessible to any JavaScript on the page via XSS.",
        ]}
      />
    </div>
  );
}
