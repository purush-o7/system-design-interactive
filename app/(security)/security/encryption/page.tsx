"use client";

import { useState, useMemo, useCallback } from "react";
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
import { Lock, Unlock, Key, Shield, CheckCircle2, XCircle, Fingerprint } from "lucide-react";
import { MarkerType } from "@xyflow/react";

/* ── Static color maps (no dynamic Tailwind interpolation) ── */

const stepStatusStyles: Record<string, string> = {
  active: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
  pending: "border-border/40 bg-muted/10 text-muted-foreground/40",
  done: "border-violet-500/30 bg-violet-500/5 text-violet-400",
};

const algoSafeColors: Record<string, string> = {
  safe: "text-emerald-400",
  warning: "text-amber-400",
  danger: "text-red-400",
};

const algoBarColors: Record<string, string> = {
  safe: "bg-emerald-500/70",
  warning: "bg-amber-500/70",
  danger: "bg-red-500/70",
};

const modeTabActive: Record<string, string> = {
  symmetric: "bg-blue-500/10 border-blue-500/30 text-blue-400",
  asymmetric: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
};

/* ── TLS Handshake Playground ── */

const TLS_STEPS = [
  {
    from: "client",
    label: "ClientHello",
    detail: "Supported cipher suites, client random, key_share (ECDH public key)",
    color: "bg-blue-500",
  },
  {
    from: "server",
    label: "ServerHello",
    detail: "Chosen cipher suite, server random, key_share (ECDH public key)",
    color: "bg-emerald-500",
  },
  {
    from: "server",
    label: "Certificate",
    detail: "Server's X.509 certificate signed by trusted CA (e.g. Let's Encrypt)",
    color: "bg-emerald-500",
  },
  {
    from: "server",
    label: "CertificateVerify",
    detail: "Signature proving server owns private key matching the certificate",
    color: "bg-emerald-500",
  },
  {
    from: "server",
    label: "Finished",
    detail: "HMAC of the entire handshake — server confirms integrity",
    color: "bg-emerald-500",
  },
  {
    from: "client",
    label: "Finished",
    detail: "Client confirms handshake — encrypted tunnel established (AES-256-GCM)",
    color: "bg-blue-500",
  },
];

function TlsPlayground() {
  const sim = useSimulation({ maxSteps: 6, intervalMs: 1400 });

  const edgeColor = "#8b5cf6";
  const edgeGreen = "#22c55e";
  const edgeBlue = "#3b82f6";

  const nodes: FlowNode[] = useMemo(
    () => [
      {
        id: "client",
        type: "clientNode",
        position: { x: 0, y: 100 },
        data: {
          label: "Client",
          sublabel: "Browser / App",
          status: sim.step >= 1 ? "healthy" : "idle",
          handles: { right: true },
        },
      },
      {
        id: "ca",
        type: "gatewayNode",
        position: { x: 230, y: 0 },
        data: {
          label: "Certificate Authority",
          sublabel: "Let's Encrypt / DigiCert",
          status: sim.step >= 3 ? "healthy" : "idle",
          handles: { left: true, bottom: true },
        },
      },
      {
        id: "server",
        type: "serverNode",
        position: { x: 230, y: 180 },
        data: {
          label: "Server",
          sublabel: sim.step >= 6 ? "AES-256-GCM tunnel" : "api.example.com",
          status: sim.step >= 2 ? "healthy" : "idle",
          metrics: sim.step >= 6 ? [{ label: "Session Key", value: "established" }] : undefined,
          handles: { left: true, top: true },
        },
      },
    ],
    [sim.step]
  );

  const edges: FlowEdge[] = useMemo(() => {
    const step = sim.step;
    const clientActive = step === 1 || step === 6;
    const serverActive = step >= 2 && step <= 5;
    const caActive = step === 3;
    return [
      {
        id: "e-client-server",
        source: "client",
        target: "server",
        label: step >= 1 && step <= 6 ? TLS_STEPS[Math.min(step - 1, 5)].label : "TLS 1.3",
        animated: clientActive || serverActive,
        style: {
          stroke: clientActive ? edgeBlue : serverActive ? edgeGreen : edgeColor,
          strokeWidth: 2,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: clientActive ? edgeBlue : serverActive ? edgeGreen : edgeColor,
        },
      },
      {
        id: "e-ca-server",
        source: "ca",
        target: "server",
        label: "Signs cert",
        animated: caActive,
        style: { stroke: caActive ? edgeGreen : edgeColor, strokeWidth: 1.5, strokeDasharray: "4 2" },
        markerEnd: { type: MarkerType.ArrowClosed, color: caActive ? edgeGreen : edgeColor },
      },
    ];
  }, [sim.step]);

  const currentStep = TLS_STEPS[Math.min(sim.step - 1, 5)];

  return (
    <Playground
      title="TLS 1.3 Handshake — 1 Round Trip"
      simulation={sim}
      canvasHeight="min-h-[320px]"
      canvas={
        <div className="h-full flex flex-col">
          <FlowDiagram
            nodes={nodes}
            edges={edges}
            allowDrag={false}
            minHeight={220}
            interactive={false}
          />
          <div className="px-4 pb-3 space-y-1.5">
            {TLS_STEPS.map((s, i) => (
              <div
                key={s.label}
                className={cn(
                  "flex items-center gap-2 rounded px-2.5 py-1 text-[10px] font-mono transition-all duration-300",
                  sim.step > i + 1
                    ? stepStatusStyles.done
                    : sim.step === i + 1
                    ? stepStatusStyles.active
                    : stepStatusStyles.pending
                )}
              >
                <span
                  className={cn(
                    "size-1.5 rounded-full shrink-0",
                    s.from === "client" ? "bg-blue-400" : "bg-emerald-400"
                  )}
                />
                <span className="font-bold w-36 shrink-0">{s.label}</span>
                <span className="hidden sm:block opacity-60 truncate">{s.detail}</span>
              </div>
            ))}
          </div>
        </div>
      }
      explanation={
        <div className="space-y-3">
          <p className="text-xs font-semibold text-violet-400">How TLS 1.3 works</p>
          {sim.step === 0 && (
            <p>Press play to step through the TLS 1.3 handshake. TLS 1.3 completes in a single round trip — down from 2 in TLS 1.2, eliminating old cipher suites like RSA key exchange.</p>
          )}
          {sim.step >= 1 && currentStep && (
            <>
              <p>
                <strong className="text-foreground">Step {sim.step}:</strong> {currentStep.label}
              </p>
              <p>{currentStep.detail}</p>
            </>
          )}
          {sim.step >= 6 && (
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-2 text-xs text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="size-3 shrink-0" />
              Encrypted tunnel active — all data uses AES-256-GCM from here
            </div>
          )}
          <p className="text-[11px]">
            <strong>Why hybrid?</strong> Asymmetric crypto (ECDH) solves the key exchange problem over an insecure channel, but it is ~1000x slower than AES. TLS uses asymmetric once to establish a shared session key, then switches to fast symmetric AES for all data.
          </p>
        </div>
      }
    />
  );
}

/* ── Symmetric vs Asymmetric Playground ── */

function EncryptionTypePlayground() {
  const [mode, setMode] = useState<"symmetric" | "asymmetric">("symmetric");
  const [inputText, setInputText] = useState("Hello, World!");

  const fakeEncrypt = useCallback((text: string, sym: boolean) => {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
    }
    const hex = hash.toString(16).padStart(8, "0");
    return sym
      ? `${hex}a7f2b3c9d1e4...${hex.split("").reverse().join("")} (AES-256-GCM, 32B key)`
      : `4a8c${hex}9b2e...f7d3${hex}1c6a (RSA-2048, 256B key)`;
  }, []);

  const ciphertext = fakeEncrypt(inputText, mode === "symmetric");

  const stats = {
    symmetric: { keySize: "256 bits (32 bytes)", speed: "~10 GB/s (hardware AES-NI)", use: "Bulk data encryption", algo: "AES-256-GCM" },
    asymmetric: { keySize: "2048–4096 bits", speed: "~1–10 MB/s (~1000x slower)", use: "Key exchange + signatures", algo: "RSA / ECDSA / ECDH" },
  };

  const current = stats[mode];

  return (
    <div className="rounded-xl border border-violet-500/20 bg-violet-500/[0.02] overflow-hidden">
      <div className="flex items-center gap-2 border-b border-violet-500/20 bg-violet-500/[0.04] px-4 py-2">
        <div className="size-2 rounded-full bg-violet-500/50" />
        <span className="text-sm font-medium text-violet-400">Symmetric vs Asymmetric — Try It</span>
      </div>
      <div className="p-4 space-y-4">
        <div className="flex gap-2">
          {(["symmetric", "asymmetric"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                "flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-all capitalize",
                mode === m ? modeTabActive[m] : "bg-muted/20 border-border/30 text-muted-foreground/60 hover:bg-muted/40"
              )}
            >
              {m === "symmetric" ? (
                <><Key className="size-3 inline mr-1" />Symmetric (AES)</>
              ) : (
                <><Lock className="size-3 inline mr-1" />Asymmetric (RSA/ECDH)</>
              )}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-medium text-muted-foreground">Input plaintext</label>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full rounded-lg border border-border/50 bg-muted/20 px-3 py-2 text-xs font-mono focus:outline-none focus:border-violet-500/40"
            placeholder="Type anything..."
            maxLength={80}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-muted-foreground">Ciphertext output (simulated)</label>
          <div className="rounded-lg bg-muted/30 border border-border/40 px-3 py-2 font-mono text-[10px] text-muted-foreground break-all">
            {ciphertext}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Algorithm", value: current.algo },
            { label: "Key Size", value: current.keySize },
            { label: "Speed", value: current.speed },
            { label: "Primary Use", value: current.use },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-lg bg-muted/20 border border-border/30 p-2">
              <div className="text-[10px] text-muted-foreground">{label}</div>
              <div className="text-xs font-mono font-semibold mt-0.5">{value}</div>
            </div>
          ))}
        </div>

        <p className="text-[11px] text-muted-foreground">
          {mode === "symmetric"
            ? "Same key encrypts and decrypts. Fast enough for streaming video. The challenge: how do you share the key securely? That is where asymmetric comes in."
            : "Public key encrypts, only matching private key decrypts. No shared secret needed — but ~1000x slower. TLS uses this only for the handshake, then switches to AES."}
        </p>
      </div>
    </div>
  );
}

/* ── Hashing Demo ── */

function HashingDemo() {
  const [inputText, setInputText] = useState("Hello, World!");

  const fakeHash = useCallback((text: string): string => {
    let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
    for (let i = 0; i < text.length; i++) {
      const c = text.charCodeAt(i);
      h1 = Math.imul(h1 ^ c, 2654435761);
      h2 = Math.imul(h2 ^ c, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    const v = 4294967296 * (2097151 & h2) + (h1 >>> 0);
    return v.toString(16).padStart(16, "0").repeat(4).slice(0, 64);
  }, []);

  const hash = fakeHash(inputText);
  const prevHash = inputText.length > 0 ? fakeHash(inputText.slice(0, -1)) : null;

  const diffCount = prevHash
    ? hash.split("").filter((c, i) => c !== prevHash[i]).length
    : 0;

  const algorithms = [
    { name: "MD5", bits: 128, safe: "danger" as const, perSec: "300B/sec", label: "Broken — collision attacks known" },
    { name: "SHA-1", bits: 160, safe: "danger" as const, perSec: "100B/sec", label: "Deprecated — SHAttered attack" },
    { name: "SHA-256", bits: 256, safe: "warning" as const, perSec: "250B/sec", label: "Great for checksums, NOT passwords" },
    { name: "bcrypt (12)", bits: 184, safe: "safe" as const, perSec: "4/sec", label: "Password hashing — intentionally slow" },
    { name: "argon2id", bits: 256, safe: "safe" as const, perSec: "3/sec", label: "Best for passwords — memory-hard" },
  ];

  return (
    <div className="rounded-xl border border-violet-500/20 bg-violet-500/[0.02] overflow-hidden">
      <div className="flex items-center gap-2 border-b border-violet-500/20 bg-violet-500/[0.04] px-4 py-2">
        <div className="size-2 rounded-full bg-violet-500/50" />
        <span className="text-sm font-medium text-violet-400">Hashing — Avalanche Effect Demo</span>
      </div>
      <div className="p-4 space-y-4">
        <div className="space-y-2">
          <label className="text-[11px] font-medium text-muted-foreground">Type anything — watch the hash change completely</label>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full rounded-lg border border-border/50 bg-muted/20 px-3 py-2 text-xs font-mono focus:outline-none focus:border-violet-500/40"
            placeholder="Type here..."
          />
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-medium text-muted-foreground">SHA-256-like hash (simulated)</label>
            {prevHash && (
              <span className="text-[10px] text-amber-400 font-mono">{diffCount}/64 chars changed</span>
            )}
          </div>
          <div className="rounded-lg bg-muted/30 border border-border/40 px-3 py-2 font-mono text-[10px] break-all leading-relaxed">
            {hash.split("").map((c, i) => (
              <span
                key={i}
                className={cn(
                  "transition-colors duration-150",
                  prevHash && c !== prevHash[i] ? "text-amber-400" : "text-muted-foreground"
                )}
              >
                {c}
              </span>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground/60">
            Changing one character flips ~50% of all output bits — this is the avalanche effect. It makes hash reversal computationally infeasible.
          </p>
        </div>

        <div className="space-y-1.5">
          <p className="text-[11px] font-medium text-muted-foreground">Algorithm comparison — hashes per second on a modern GPU</p>
          {algorithms.map((algo) => (
            <div key={algo.name} className="flex items-center gap-3">
              <span className="text-[10px] font-mono w-20 text-right shrink-0 text-muted-foreground">{algo.name}</span>
              <div className="flex-1 flex items-center gap-2">
                <div
                  className={cn(
                    "h-5 rounded flex items-center px-2 text-[10px] font-mono font-bold text-white transition-all",
                    algoBarColors[algo.safe]
                  )}
                  style={{ width: algo.safe === "safe" ? "18%" : algo.safe === "warning" ? "55%" : "85%" }}
                >
                  {algo.perSec}
                </div>
                <span className={cn("text-[10px] flex items-center gap-1", algoSafeColors[algo.safe])}>
                  {algo.safe === "safe" ? <CheckCircle2 className="size-3" /> : <XCircle className="size-3" />}
                  {algo.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── At-Rest vs In-Transit Visualization ── */

function AtRestInTransitPlayground() {
  const sim = useSimulation({ maxSteps: 5, intervalMs: 1600 });

  const edgeColor = "#8b5cf6";
  const edgeGreen = "#22c55e";

  const nodes: FlowNode[] = useMemo(
    () => [
      {
        id: "browser",
        type: "clientNode",
        position: { x: 0, y: 80 },
        data: {
          label: "Browser",
          sublabel: "SSN: 123-45-6789",
          status: sim.step >= 1 ? "healthy" : "idle",
          handles: { right: true },
        },
      },
      {
        id: "server",
        type: "serverNode",
        position: { x: 220, y: 80 },
        data: {
          label: "App Server",
          sublabel: sim.step >= 2 ? "TLS decrypted" : "Receiving...",
          status: sim.step >= 2 ? "healthy" : "idle",
          handles: { left: true, right: true },
        },
      },
      {
        id: "db",
        type: "databaseNode",
        position: { x: 440, y: 80 },
        data: {
          label: "Database",
          sublabel: sim.step >= 4 ? "AES-256 encrypted at rest" : "PostgreSQL",
          status: sim.step >= 4 ? "healthy" : "idle",
          metrics: sim.step >= 4 ? [{ label: "Encrypted", value: "on disk" }] : undefined,
          handles: { left: true },
        },
      },
    ],
    [sim.step]
  );

  const edges: FlowEdge[] = useMemo(() => {
    const step = sim.step;
    return [
      {
        id: "e-browser-server",
        source: "browser",
        target: "server",
        label: step >= 1 ? "TLS 1.3 (in transit)" : "HTTP?",
        animated: step === 1 || step === 2,
        style: {
          stroke: step >= 1 ? edgeGreen : "#ef4444",
          strokeWidth: 2,
        },
        markerEnd: { type: MarkerType.ArrowClosed, color: step >= 1 ? edgeGreen : "#ef4444" },
      },
      {
        id: "e-server-db",
        source: "server",
        target: "db",
        label: step >= 3 ? "AES-256 (at rest)" : "plaintext?",
        animated: step === 3 || step === 4,
        style: {
          stroke: step >= 3 ? edgeGreen : "#f59e0b",
          strokeWidth: 2,
        },
        markerEnd: { type: MarkerType.ArrowClosed, color: step >= 3 ? edgeGreen : "#f59e0b" },
      },
    ];
  }, [sim.step]);

  const explanations = [
    "Data starts as plaintext in the browser. Without TLS, anyone on the network can read it.",
    "TLS encrypts the data during transit — the padlock in your browser. Protects against eavesdropping and MITM attacks.",
    "The server decrypts TLS to process the request. The data is now plaintext in memory — inside your trusted boundary.",
    "Before writing to disk, the application re-encrypts with AES-256. Protects against stolen backups and insider threats.",
    "Defense in depth: TLS + at-rest encryption cover different threat vectors. A breach exposing disk files sees only ciphertext.",
  ];

  return (
    <Playground
      title="In-Transit vs At-Rest Encryption"
      simulation={sim}
      canvasHeight="min-h-[280px]"
      canvas={
        <FlowDiagram
          nodes={nodes}
          edges={edges}
          allowDrag={false}
          minHeight={260}
          interactive={false}
        />
      }
      explanation={
        <div className="space-y-3">
          <p className="text-xs font-semibold text-violet-400">Two separate threat vectors</p>
          <p>{explanations[Math.min(sim.step, explanations.length - 1)]}</p>
          <div className="space-y-2">
            <div className={cn("rounded-lg border p-2 transition-all", sim.step >= 1 ? "border-emerald-500/20 bg-emerald-500/5" : "border-border/30 bg-muted/10")}>
              <p className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1"><Shield className="size-3" /> In Transit (TLS)</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Eavesdropping, MITM, packet sniffing</p>
            </div>
            <div className={cn("rounded-lg border p-2 transition-all", sim.step >= 3 ? "border-violet-500/20 bg-violet-500/5" : "border-border/30 bg-muted/10")}>
              <p className="text-[11px] font-semibold text-violet-400 flex items-center gap-1"><Lock className="size-3" /> At Rest (AES/KMS)</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Database breaches, stolen backups, insider access</p>
            </div>
          </div>
        </div>
      }
    />
  );
}

/* ── Main Page ── */

export default function EncryptionPage() {
  return (
    <div className="space-y-8">
      <TopicHero
        title="Encryption"
        subtitle="Data gets stolen. Encryption makes stolen data useless. Three concepts — hashing, symmetric, and asymmetric — cover 95% of what you need."
        difficulty="intermediate"
      />

      <ConversationalCallout type="warning">
        The most common mistake: using fast hashes (SHA-256) for passwords, or encryption for passwords when you only need hashing. Hash passwords. Encrypt data you need to read back. They solve different problems.
      </ConversationalCallout>

      <TlsPlayground />

      <AhaMoment
        question="Why does TLS use both asymmetric AND symmetric encryption?"
        answer={
          <p>
            Asymmetric (RSA / ECDH) solves the key exchange problem — you can agree on a shared secret over an insecure channel without ever transmitting the secret itself. But it is ~1000x slower than AES. So TLS uses asymmetric once during the handshake to establish a shared session key, then switches to fast AES-256-GCM for all actual data. Best of both worlds: secure key exchange + high-speed bulk encryption.
          </p>
        }
      />

      <EncryptionTypePlayground />

      <HashingDemo />

      <ConversationalCallout type="tip">
        Hashing is one-way — you can never recover the original. Encryption is two-way — you can recover it with the right key. Use hashing for passwords (compare the hash, never store the original). Use encryption for credit cards, SSNs, API keys — anything you need to read back.
      </ConversationalCallout>

      <AtRestInTransitPlayground />

      <BeforeAfter
        before={{
          title: "Plain Text Password Storage",
          content: (
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="font-mono text-xs bg-muted/50 p-2 rounded leading-relaxed">
                {`users table\n| email          | password    |\n| alice@co.com   | hunter2     |\n| bob@co.com     | password123 |`}
              </p>
              <p>
                One SQL injection and every password is exposed instantly. Attackers try these on banks and email within minutes. 65% of users reuse passwords.
              </p>
            </div>
          ),
        }}
        after={{
          title: "bcrypt (cost 12) — Proper Hashing",
          content: (
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="font-mono text-xs bg-muted/50 p-2 rounded leading-relaxed">
                {`users table\n| email          | password_hash            |\n| alice@co.com   | $2b$12$LJ3m5...Kx9 (60c) |\n| bob@co.com     | $2b$12$Kp9x2...Nm3 (60c) |`}
              </p>
              <p>
                Even if stolen, each bcrypt hash takes ~250ms per guess on a GPU. A 10-character password would take millions of years to brute force. The embedded salt prevents rainbow table attacks.
              </p>
            </div>
          ),
        }}
      />

      <AhaMoment
        question="If HTTPS encrypts everything, why do I also need encryption at rest?"
        answer={
          <p>
            TLS only protects data while it is moving between two points. The moment it arrives at your server, TLS is decrypted. If someone breaches your database directly, steals a backup tape, or has rogue admin access, they see plain text. Encryption at rest (AES-256 on disk, KMS key management) is your second line of defense. Think of TLS as an armored truck and at-rest encryption as a vault. A stolen armored truck does not expose the vault, and a cracked vault door does not reveal what is in transit.
          </p>
        }
      />

      <ConversationalCallout type="question">
        Where do you store the encryption key? If the key lives alongside the encrypted data, it is like locking your door and leaving the key under the mat. Use a dedicated Key Management Service (AWS KMS, HashiCorp Vault, GCP Cloud KMS). With envelope encryption, KMS encrypts your data key — KMS never sees the actual data, only encrypts the small key that does.
      </ConversationalCallout>

      <KeyTakeaway
        points={[
          "Hash passwords (bcrypt/argon2, intentionally slow, one-way). Encrypt data you need to read later (AES-256, fast, two-way). Never confuse the two.",
          "TLS 1.3 completes in 1 round trip — down from 2 in TLS 1.2. It uses ECDH for key exchange (asymmetric, secure) then AES-256-GCM for data (symmetric, fast).",
          "The avalanche effect: changing one character in input flips ~50% of hash output bits. This makes hash reversal computationally infeasible.",
          "For passwords, speed is the enemy. MD5 runs at 300B/sec on a GPU. bcrypt at cost 12 runs at ~4/sec. That gap is the difference between seconds and centuries to crack.",
          "At-rest encryption and TLS protect against different threats. You need both: TLS for eavesdropping and MITM, at-rest for breaches and stolen backups.",
          "Never roll your own crypto. Use established libraries. Subtle implementation bugs (timing attacks, weak IVs, padding oracles) can make encryption completely useless while appearing to work.",
        ]}
      />
    </div>
  );
}
