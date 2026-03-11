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
import { BeforeAfter } from "@/components/before-after";
import { AhaMoment } from "@/components/aha-moment";
import { ConversationalCallout } from "@/components/conversational-callout";
import { ServerNode } from "@/components/server-node";
import { cn } from "@/lib/utils";
import { Shield, Key, User, Lock, Fingerprint, CheckCircle2, XCircle, ArrowRight } from "lucide-react";

const oauthNodeBgStyles: Record<string, string> = {
  blue: "bg-blue-500/10 border-blue-500/30",
  violet: "bg-violet-500/10 border-violet-500/30",
  amber: "bg-amber-500/10 border-amber-500/30",
};

const oauthNodeIconStyles: Record<string, string> = {
  blue: "size-5 text-blue-400",
  violet: "size-5 text-violet-400",
  amber: "size-5 text-amber-400",
};

function OAuthFlowViz() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % 8), 1400);
    return () => clearInterval(t);
  }, []);

  const stages = [
    { from: "user", to: "app", label: "Click 'Login with Google'", color: "text-blue-400" },
    { from: "app", to: "google", label: "Redirect to Google + code_challenge", color: "text-blue-400" },
    { from: "google", to: "user", label: "Google shows consent screen", color: "text-amber-400" },
    { from: "user", to: "google", label: "User grants permission", color: "text-emerald-400" },
    { from: "google", to: "app", label: "Redirect back with auth code", color: "text-amber-400" },
    { from: "app", to: "google", label: "Exchange code + code_verifier for tokens", color: "text-violet-400" },
    { from: "google", to: "app", label: "Return access_token + id_token", color: "text-emerald-400" },
  ];

  return (
    <div className="relative py-2">
      <div className="flex justify-between items-start mb-5 px-2">
        {[
          { icon: User, label: "User", color: "blue" },
          { icon: Shield, label: "Your App", color: "violet" },
          { icon: Key, label: "Google (IdP)", color: "amber" },
        ].map((node) => (
          <div key={node.label} className="text-center">
            <div className={cn(
              "size-11 rounded-xl border flex items-center justify-center mb-1.5 transition-all",
              step >= 1
                ? oauthNodeBgStyles[node.color]
                : "bg-muted/30 border-border"
            )}>
              <node.icon className={oauthNodeIconStyles[node.color]} />
            </div>
            <span className="text-[11px] font-medium">{node.label}</span>
          </div>
        ))}
      </div>
      <div className="space-y-2 px-2">
        {stages.map((s, i) => (
          <div
            key={i}
            className={cn(
              "flex items-center gap-2 transition-all duration-500 rounded-lg px-3 py-1.5",
              step > i
                ? "opacity-100 translate-y-0 bg-muted/20"
                : step === i
                ? "opacity-100 translate-y-0 bg-muted/30 ring-1 ring-blue-500/20"
                : "opacity-0 translate-y-2"
            )}
          >
            <span className="text-[10px] font-mono text-muted-foreground/50 w-4 shrink-0">{i + 1}</span>
            <span className={cn("text-[10px] font-mono font-semibold shrink-0 w-14", s.color)}>
              {s.from} → {s.to}
            </span>
            <span className="text-[11px] text-muted-foreground">{s.label}</span>
          </div>
        ))}
      </div>
      {step >= 7 && (
        <div className="flex items-center justify-center gap-2 mt-3 text-[11px] text-emerald-400 font-medium">
          <CheckCircle2 className="size-3.5" />
          User authenticated — session created
        </div>
      )}
    </div>
  );
}

function JwtAnatomyViz() {
  const [activeSection, setActiveSection] = useState<"header" | "payload" | "signature">("header");
  useEffect(() => {
    const sections: Array<"header" | "payload" | "signature"> = ["header", "payload", "signature"];
    let idx = 0;
    const t = setInterval(() => {
      idx = (idx + 1) % 3;
      setActiveSection(sections[idx]);
    }, 2500);
    return () => clearInterval(t);
  }, []);

  const sections = {
    header: {
      color: "text-red-400",
      bg: "bg-red-500/10 border-red-500/20",
      encoded: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9",
      decoded: `{
  "alg": "RS256",
  "typ": "JWT"
}`,
      desc: "Declares the signing algorithm (RS256 = RSA + SHA-256) and token type. The server uses this to know how to verify the signature.",
    },
    payload: {
      color: "text-violet-400",
      bg: "bg-violet-500/10 border-violet-500/20",
      encoded: "eyJzdWIiOiI0MiIsInJvbGUiOiJhZG1pbiIsImV4cCI6MTcwMH0",
      decoded: `{
  "sub": "42",
  "role": "admin",
  "iat": 1700000000,
  "exp": 1700000900
}`,
      desc: "Contains claims about the user. 'sub' is the user ID, 'exp' is expiration (15 min). This is base64-encoded, NOT encrypted — anyone can read it.",
    },
    signature: {
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
      encoded: "SflKxwRJSMeKKF2QT4fw...",
      decoded: `RSASHA256(
  base64(header) + "." +
  base64(payload),
  privateKey
)`,
      desc: "Cryptographic proof that the header and payload haven't been tampered with. Only the server with the private key can create a valid signature.",
    },
  };

  const s = sections[activeSection];

  return (
    <div className="space-y-3">
      <div className="flex gap-1 font-mono text-xs p-3 rounded-lg bg-muted/30 border border-border/50 overflow-x-auto">
        <span
          className={cn("cursor-pointer transition-all px-1 rounded", activeSection === "header" ? "text-red-400 bg-red-500/10" : "text-red-400/40")}
          onClick={() => setActiveSection("header")}
        >
          {sections.header.encoded}
        </span>
        <span className="text-muted-foreground/30">.</span>
        <span
          className={cn("cursor-pointer transition-all px-1 rounded", activeSection === "payload" ? "text-violet-400 bg-violet-500/10" : "text-violet-400/40")}
          onClick={() => setActiveSection("payload")}
        >
          {sections.payload.encoded}
        </span>
        <span className="text-muted-foreground/30">.</span>
        <span
          className={cn("cursor-pointer transition-all px-1 rounded", activeSection === "signature" ? "text-emerald-400 bg-emerald-500/10" : "text-emerald-400/40")}
          onClick={() => setActiveSection("signature")}
        >
          {sections.signature.encoded}
        </span>
      </div>

      <div className="flex gap-2">
        {(["header", "payload", "signature"] as const).map((key) => (
          <button
            key={key}
            onClick={() => setActiveSection(key)}
            className={cn(
              "flex-1 text-[11px] font-semibold py-1.5 rounded-md border transition-all capitalize",
              activeSection === key ? sections[key].bg + " " + sections[key].color : "bg-muted/20 border-border/50 text-muted-foreground/50"
            )}
          >
            {key}
          </button>
        ))}
      </div>

      <div className={cn("rounded-lg border p-3 transition-all", s.bg)}>
        <pre className={cn("text-xs font-mono mb-2", s.color)}>{s.decoded}</pre>
        <p className="text-[11px] text-muted-foreground leading-relaxed">{s.desc}</p>
      </div>
    </div>
  );
}

function RbacAbacViz() {
  const [model, setModel] = useState<"rbac" | "abac">("rbac");
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % 4), 1200);
    return () => clearInterval(t);
  }, []);

  const rbacCheck = [
    { label: "User: Alice", detail: "role = 'editor'", pass: true },
    { label: "Resource: /api/posts", detail: "requires: editor, admin", pass: true },
    { label: "Permission check", detail: "'editor' in [editor, admin]?", pass: true },
  ];

  const abacCheck = [
    { label: "User attributes", detail: "dept=engineering, clearance=L2", pass: true },
    { label: "Resource attributes", detail: "classification=internal, dept=engineering", pass: true },
    { label: "Environment", detail: "time=14:00, ip=office-range, MFA=true", pass: true },
  ];

  const checks = model === "rbac" ? rbacCheck : abacCheck;

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {(["rbac", "abac"] as const).map((m) => (
          <button
            key={m}
            onClick={() => { setModel(m); setStep(0); }}
            className={cn(
              "flex-1 text-xs font-semibold py-2 rounded-md border transition-all uppercase",
              model === m
                ? m === "rbac"
                  ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                  : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                : "bg-muted/20 border-border/50 text-muted-foreground/50"
            )}
          >
            {m}
          </button>
        ))}
      </div>

      <div className="space-y-1.5">
        {checks.map((c, i) => (
          <div
            key={`${model}-${i}`}
            className={cn(
              "flex items-center gap-3 rounded-lg border px-3 py-2 transition-all duration-400",
              step > i
                ? "bg-emerald-500/8 border-emerald-500/20"
                : step === i
                ? "bg-blue-500/8 border-blue-500/20 ring-1 ring-blue-500/15"
                : "bg-muted/10 border-border/30 text-muted-foreground/40"
            )}
          >
            <span className={cn("text-xs font-medium w-32 shrink-0", step >= i ? "text-foreground" : "")}>
              {c.label}
            </span>
            <span className="flex-1 text-[11px] font-mono text-muted-foreground">{c.detail}</span>
            {step > i && <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0" />}
          </div>
        ))}
      </div>

      {step >= 3 && (
        <div className={cn(
          "text-center text-[11px] font-medium py-1",
          "text-emerald-400"
        )}>
          Access Granted — {model === "rbac" ? "role matched required permission" : "all attribute policies satisfied"}
        </div>
      )}

      <p className="text-[11px] text-muted-foreground/70 leading-relaxed">
        {model === "rbac"
          ? "RBAC checks one thing: does the user's role appear in the resource's allowed roles list? Simple, fast, but can lead to role explosion when you need fine-grained rules."
          : "ABAC evaluates multiple attributes — user, resource, and environment — against a policy engine. More flexible but more complex to manage and debug."}
      </p>
    </div>
  );
}

export default function AuthAndAuthorizationPage() {
  return (
    <div className="space-y-8">
      <TopicHero
        title="Authentication & Authorization"
        subtitle="Proving who you are is step one. Proving what you're allowed to do is step two. Skip either and you have no security at all."
        difficulty="intermediate"
      />

      <FailureScenario title="A regular user becomes an admin by changing the URL">
        <p className="text-sm text-muted-foreground">
          Your app checks if a user is logged in before showing pages, but it never checks
          <strong> what that user is allowed to do</strong>. A regular user changes the URL
          from <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">/dashboard</code> to{" "}
          <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">/admin</code> and
          gets full admin access — user management, billing, database controls, everything.
        </p>
        <div className="flex items-center justify-center gap-4 py-3">
          <ServerNode type="client" label="Regular User" status="warning" />
          <span className="text-emerald-500 text-sm font-mono">— /admin →</span>
          <ServerNode type="server" label="API Server" sublabel="No authz check" status="unhealthy" />
          <span className="text-red-500 text-sm font-mono">— full access →</span>
          <ServerNode type="database" label="Admin Data" status="unhealthy" />
        </div>
        <p className="text-sm text-muted-foreground">
          This is <strong>Broken Access Control</strong> — the #1 web application security risk according
          to the OWASP Top 10. Client-side route hiding is cosmetic, not security.
        </p>
      </FailureScenario>

      <WhyItBreaks title="Authentication and authorization are two separate checks">
        <p className="text-sm text-muted-foreground">
          Authentication (authn) answers &quot;who are you?&quot; Authorization (authz) answers
          &quot;what can you do?&quot; Many developers only implement authentication — they verify
          the user is logged in, then trust the client to only show allowed pages. But anyone can
          type a URL, craft an API request with <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">curl</code>,
          or use browser dev tools. Every protected resource must be checked <strong>server-side</strong> against
          the user&apos;s actual permissions.
        </p>
        <div className="grid grid-cols-2 gap-2 mt-3">
          {[
            { n: "401", label: "Unauthorized", desc: "Authentication failed — we don't know who you are", color: "text-red-400" },
            { n: "403", label: "Forbidden", desc: "Authentication passed, but you don't have permission", color: "text-amber-400" },
          ].map((item) => (
            <div key={item.n} className="flex items-start gap-2.5 rounded-lg bg-muted/30 p-3">
              <span className={cn("text-xs font-mono font-bold bg-muted rounded-md px-2 py-1 shrink-0", item.color)}>
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

      <ConceptVisualizer title="OAuth2 Authorization Code Flow with PKCE">
        <p className="text-sm text-muted-foreground mb-4">
          OAuth2 lets users log in with a third-party provider (Google, GitHub) without
          sharing their password with your app. The authorization code flow with PKCE
          (Proof Key for Code Exchange) is the most secure variant — it prevents authorization
          code interception attacks even in public clients like SPAs and mobile apps.
        </p>
        <OAuthFlowViz />
        <ConversationalCallout type="tip">
          PKCE works by generating a random <code className="text-xs bg-muted px-1 rounded font-mono">code_verifier</code> on
          the client, hashing it to create a <code className="text-xs bg-muted px-1 rounded font-mono">code_challenge</code> sent
          with the initial request, then proving possession of the verifier when exchanging the code.
          Even if an attacker intercepts the authorization code, they can&apos;t exchange it without the original verifier.
          The upcoming OAuth 2.1 spec requires PKCE for all authorization code flows.
        </ConversationalCallout>
      </ConceptVisualizer>

      <ConceptVisualizer title="JWT Anatomy — Header.Payload.Signature">
        <p className="text-sm text-muted-foreground mb-4">
          A JSON Web Token is a compact, self-contained way to transmit identity claims between
          services. It has three base64-encoded parts separated by dots. Click each section to
          explore it, or watch it cycle automatically.
        </p>
        <JwtAnatomyViz />
        <AhaMoment
          question="If JWTs are just base64-encoded, can't someone edit the payload to make themselves an admin?"
          answer={
            <p>
              They can change the payload, but then the signature won&apos;t match. The server
              verifies the signature using a private key that only it possesses. A tampered token
              fails verification and gets rejected with a 401. That&apos;s the entire point of the
              signature — it&apos;s not about hiding data, it&apos;s about proving data hasn&apos;t
              been modified. For asymmetric algorithms like RS256, the signing key (private) and
              verification key (public) are different, so even services that verify tokens can&apos;t
              forge new ones.
            </p>
          }
        />
      </ConceptVisualizer>

      <ConceptVisualizer title="OpenID Connect (OIDC) — Identity on Top of OAuth2">
        <p className="text-sm text-muted-foreground mb-3">
          OAuth2 is an <em>authorization</em> framework — it grants access to resources but doesn&apos;t
          inherently tell you <em>who</em> the user is. OpenID Connect adds an identity layer on top:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
          {[
            { label: "OAuth2 alone", desc: "Grants an access_token to call APIs on behalf of a user. Doesn't standardize user identity.", color: "border-blue-500/20 bg-blue-500/5" },
            { label: "OIDC adds", desc: "Returns an id_token (a JWT) containing verified user identity claims: email, name, picture, etc.", color: "border-violet-500/20 bg-violet-500/5" },
            { label: "UserInfo endpoint", desc: "Standard /userinfo endpoint returns additional profile data using the access_token.", color: "border-emerald-500/20 bg-emerald-500/5" },
          ].map((item) => (
            <div key={item.label} className={cn("rounded-lg border p-3 space-y-1", item.color)}>
              <p className="text-xs font-semibold">{item.label}</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground mt-3">
          When someone says &quot;Login with Google,&quot; they&apos;re using OIDC. Google is the
          Identity Provider (IdP), your app is the Relying Party (RP), and the id_token proves
          the user&apos;s identity without your app ever seeing their Google password.
        </p>
      </ConceptVisualizer>

      <ConceptVisualizer title="Access Control Models — RBAC vs ABAC">
        <p className="text-sm text-muted-foreground mb-4">
          Once you know <em>who</em> a user is, you need a model for deciding what they can do.
          The two dominant approaches are Role-Based Access Control and Attribute-Based Access Control.
          Toggle between them to see how each evaluates an access request.
        </p>
        <RbacAbacViz />
      </ConceptVisualizer>

      <BeforeAfter
        before={{
          title: "No Authorization Check",
          content: (
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="font-mono text-xs bg-muted/50 p-2 rounded">
                {`// API route: /api/admin/users`}<br />
                {`const user = getSession(req);`}<br />
                {`if (!user) return 401;`}<br />
                {`// No role check — any logged-in`}<br />
                {`// user proceeds`}<br />
                {`return getAllUsers();`}
              </p>
              <p>
                Any authenticated user can hit this endpoint. A regular user with a valid
                session gets full admin data. This is the most common security flaw in web apps.
              </p>
            </div>
          ),
        }}
        after={{
          title: "Proper AuthN + AuthZ",
          content: (
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="font-mono text-xs bg-muted/50 p-2 rounded">
                {`// API route: /api/admin/users`}<br />
                {`const user = getSession(req);`}<br />
                {`if (!user) return 401; // AuthN`}<br />
                {`if (user.role !== "admin")`}<br />
                {`  return 403; // AuthZ`}<br />
                {`return getAllUsers();`}
              </p>
              <p>
                Authentication check (401) and authorization check (403) are both enforced
                server-side. The client never decides access — it only reflects it.
              </p>
            </div>
          ),
        }}
      />

      <CorrectApproach title="Defense in Depth for Auth">
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-semibold">1. Server-side enforcement on every request</h4>
            <p className="text-sm text-muted-foreground">
              Every API route and server action must check both authentication and authorization.
              Never rely on the client hiding UI elements — that&apos;s a UX convenience, not a
              security boundary. Middleware can centralize this so individual routes don&apos;t
              repeat boilerplate.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold">2. Principle of Least Privilege</h4>
            <p className="text-sm text-muted-foreground">
              Users get the minimum permissions they need. Default to deny. New roles start with
              zero access and permissions are added explicitly. This limits the blast radius when
              an account is compromised.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold">3. Short-lived tokens + refresh rotation</h4>
            <p className="text-sm text-muted-foreground">
              Access tokens should expire in 15 minutes or less. Use refresh tokens (stored securely,
              rotated on each use) to issue new access tokens. If a token is stolen, the window of
              exploitation is small. Refresh token rotation detects theft — if a rotated-out token
              is reused, revoke the entire family.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold">4. Secure token storage</h4>
            <p className="text-sm text-muted-foreground">
              Store tokens in <code className="text-xs bg-muted px-1 rounded font-mono">httpOnly</code>,{" "}
              <code className="text-xs bg-muted px-1 rounded font-mono">Secure</code>,{" "}
              <code className="text-xs bg-muted px-1 rounded font-mono">SameSite=Strict</code> cookies.
              Never use localStorage or sessionStorage — they&apos;re accessible to any JavaScript on the
              page, making XSS attacks trivially exploitable.
            </p>
          </div>
        </div>
      </CorrectApproach>

      <InteractiveDemo title="Token Lifecycle Simulator">
        {({ isPlaying, tick }) => {
          const tokenLifespan = 6;
          const elapsed = isPlaying ? tick % (tokenLifespan + 3) : 0;
          const isExpired = elapsed > tokenLifespan;
          const isRefreshing = elapsed === tokenLifespan + 1;
          const isRenewed = elapsed > tokenLifespan + 1;

          return (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Press play to watch a JWT access token expire and get refreshed. Each tick is ~2.5 minutes
                in a 15-minute token lifecycle.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium w-24 shrink-0">Access Token</span>
                  <div className="flex-1 bg-muted/30 rounded-full h-5 overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        isRenewed ? "bg-emerald-500" : isExpired ? "bg-red-500" : elapsed > 4 ? "bg-amber-500" : "bg-emerald-500"
                      )}
                      style={{ width: isRenewed ? "100%" : `${Math.max(0, 100 - (elapsed / tokenLifespan) * 100)}%` }}
                    />
                  </div>
                  <span className={cn("text-[10px] font-mono w-16 text-right", isExpired && !isRenewed ? "text-red-400" : "text-muted-foreground")}>
                    {isRenewed ? "15:00" : isExpired ? "EXPIRED" : `${Math.max(0, 15 - Math.round(elapsed * 2.5))}:00`}
                  </span>
                </div>
                {isRefreshing && (
                  <div className="flex items-center gap-2 text-[11px] text-amber-400 pl-24">
                    <ArrowRight className="size-3" />
                    Refresh token exchanged — issuing new access token...
                  </div>
                )}
                {isRenewed && (
                  <div className="flex items-center gap-2 text-[11px] text-emerald-400 pl-24">
                    <CheckCircle2 className="size-3.5" />
                    New access token issued. Old refresh token rotated.
                  </div>
                )}
              </div>
              {elapsed > 4 && !isExpired && (
                <ConversationalCallout type="warning">
                  Token is about to expire. A well-built client refreshes proactively before
                  expiration to avoid interrupted requests.
                </ConversationalCallout>
              )}
            </div>
          );
        }}
      </InteractiveDemo>

      <ConversationalCallout type="warning">
        Use RS256 (asymmetric) over HS256 (symmetric) for JWTs in distributed systems. With HS256,
        every service that verifies tokens needs the secret key — and any of them could forge tokens.
        With RS256, only the auth service holds the private signing key; other services verify with
        the public key and can&apos;t create new tokens.
      </ConversationalCallout>

      <ConversationalCallout type="tip">
        In system design interviews, always mention both authn and authz when discussing security.
        Saying &quot;we check if the user is logged in&quot; only covers half the problem. The
        follow-up question will be &quot;how do you prevent a regular user from accessing admin
        endpoints?&quot; Mention RBAC for simple permission models, ABAC when you need context-aware
        rules (time-of-day, IP range, resource sensitivity), and note that most production systems
        use a hybrid approach.
      </ConversationalCallout>

      <KeyTakeaway
        points={[
          "Authentication verifies identity (who you are). Authorization verifies permissions (what you can do). Both must be enforced server-side on every request.",
          "OAuth2 + PKCE is the standard for third-party login. PKCE prevents authorization code interception by binding the code to a client-generated verifier.",
          "OpenID Connect (OIDC) adds identity on top of OAuth2 — the id_token is a JWT containing verified user claims like email and name.",
          "JWTs carry claims in a signed payload. Use RS256 (asymmetric) in distributed systems so services can verify tokens without being able to forge them.",
          "RBAC assigns permissions via roles (simple, can lead to role explosion). ABAC evaluates user/resource/environment attributes (flexible, more complex). Most systems use both.",
          "Use short-lived access tokens (15 min), rotated refresh tokens, and httpOnly/Secure/SameSite cookies. Never store tokens in localStorage.",
        ]}
      />
    </div>
  );
}
