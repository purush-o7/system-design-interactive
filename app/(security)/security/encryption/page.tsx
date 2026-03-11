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
import { MetricCounter } from "@/components/metric-counter";
import { AhaMoment } from "@/components/aha-moment";
import { ConversationalCallout } from "@/components/conversational-callout";
import { cn } from "@/lib/utils";
import { Lock, Unlock, Key, Shield, ArrowRight, CheckCircle2, XCircle, Fingerprint, ShieldCheck } from "lucide-react";

function TlsHandshakeViz() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % 8), 1400);
    return () => clearInterval(t);
  }, []);

  const messages = [
    { from: "left", label: "ClientHello", desc: "Supported ciphers + client random + key share", color: "bg-blue-500" },
    { from: "right", label: "ServerHello", desc: "Chosen cipher + server random + key share", color: "bg-emerald-500" },
    { from: "right", label: "Certificate", desc: "Server's X.509 cert + certificate chain", color: "bg-emerald-500" },
    { from: "right", label: "CertVerify", desc: "Signature proving server owns the cert", color: "bg-emerald-500" },
    { from: "right", label: "Finished", desc: "Server's handshake MAC", color: "bg-emerald-500" },
    { from: "left", label: "Finished", desc: "Client's handshake MAC -- handshake complete", color: "bg-blue-500" },
  ];

  return (
    <div className="relative py-4">
      <div className="flex justify-between items-start mb-6 px-4">
        <div className="text-center">
          <div className={cn(
            "size-12 rounded-xl border flex items-center justify-center mb-1.5 transition-all",
            step >= 1 ? "bg-blue-500/10 border-blue-500/30" : "bg-muted/30 border-border"
          )}>
            <Lock className="size-5 text-blue-400" />
          </div>
          <span className="text-[11px] font-medium">Client</span>
        </div>
        <div className="flex flex-col items-center">
          <span className={cn(
            "text-[10px] font-mono mb-1 transition-all",
            step >= 6 ? "text-emerald-400" : "text-muted-foreground/40"
          )}>
            {step >= 6 ? "TLS 1.3 (1 round trip)" : "Negotiating..."}
          </span>
          <div className="h-px w-24 bg-muted/40" />
        </div>
        <div className="text-center">
          <div className={cn(
            "size-12 rounded-xl border flex items-center justify-center mb-1.5 transition-all",
            step >= 2 ? "bg-emerald-500/10 border-emerald-500/30" : "bg-muted/30 border-border"
          )}>
            <Shield className="size-5 text-emerald-400" />
          </div>
          <span className="text-[11px] font-medium">Server</span>
        </div>
      </div>

      <div className="space-y-2 px-4">
        {messages.map((msg, i) => (
          <div
            key={`${msg.label}-${i}`}
            className={cn(
              "flex items-center gap-2 transition-all duration-500",
              msg.from === "left" ? "flex-row" : "flex-row-reverse",
              step > i ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            )}
          >
            <div className={cn(
              "rounded-full px-2.5 py-1 text-[10px] font-mono font-bold text-white whitespace-nowrap",
              msg.color
            )}>
              {msg.label}
            </div>
            <div className="flex-1 border-t border-dashed border-muted-foreground/20" />
            <span className="text-[9px] text-muted-foreground italic max-w-[180px] text-right">{msg.desc}</span>
          </div>
        ))}
      </div>

      {step >= 7 && (
        <div className="flex items-center justify-center gap-2 mt-4 text-[11px] text-emerald-400 font-medium">
          <CheckCircle2 className="size-3.5" />
          Encrypted channel established (AES-256-GCM)
        </div>
      )}

      <p className="text-[11px] text-muted-foreground/60 text-center mt-3">
        {step === 0
          ? "Starting TLS 1.3 handshake..."
          : step < 3
          ? "Client and server exchange key material in a single round trip"
          : step < 6
          ? "Server proves identity with certificate, signed by a trusted CA"
          : "Handshake complete -- all data now encrypted with the shared session key"}
      </p>
    </div>
  );
}

function SymmetricVsAsymmetricViz() {
  const [mode, setMode] = useState<"symmetric" | "asymmetric">("symmetric");
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % 6), 1200);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={() => { setMode("symmetric"); setStep(0); }}
          className={cn(
            "flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-all",
            mode === "symmetric"
              ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
              : "bg-muted/20 border-border/30 text-muted-foreground/60 hover:bg-muted/40"
          )}
        >
          <Key className="size-3 inline mr-1" /> Symmetric (AES)
        </button>
        <button
          onClick={() => { setMode("asymmetric"); setStep(0); }}
          className={cn(
            "flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-all",
            mode === "asymmetric"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-muted/20 border-border/30 text-muted-foreground/60 hover:bg-muted/40"
          )}
        >
          <Lock className="size-3 inline mr-1" /> Asymmetric (RSA/ECDSA)
        </button>
      </div>

      {mode === "symmetric" ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className={cn(
              "rounded-lg border p-3 text-center flex-1 transition-all",
              step >= 1 ? "border-blue-500/30 bg-blue-500/5" : "border-border bg-muted/10"
            )}>
              <Lock className="size-4 mx-auto mb-1 text-blue-400" />
              <div className="text-[10px] font-medium">Alice</div>
              <div className={cn(
                "text-[9px] font-mono mt-1 transition-opacity",
                step >= 1 ? "opacity-100 text-amber-400" : "opacity-0"
              )}>
                Key: 0x4A...F2
              </div>
            </div>

            <div className="flex flex-col items-center gap-1">
              <div className={cn(
                "text-[10px] font-mono transition-all duration-500",
                step >= 2 ? "opacity-100" : "opacity-0"
              )}>
                {step >= 2 && step < 4 ? (
                  <span className="text-blue-400">Encrypt →</span>
                ) : step >= 4 ? (
                  <span className="text-emerald-400">← Decrypt</span>
                ) : null}
              </div>
              <div className={cn(
                "px-2 py-1 rounded text-[9px] font-mono transition-all duration-500",
                step >= 3 ? "bg-muted/40 text-muted-foreground opacity-100" : "opacity-0"
              )}>
                a7f2...9e3b (ciphertext)
              </div>
            </div>

            <div className={cn(
              "rounded-lg border p-3 text-center flex-1 transition-all",
              step >= 1 ? "border-blue-500/30 bg-blue-500/5" : "border-border bg-muted/10"
            )}>
              <Lock className="size-4 mx-auto mb-1 text-blue-400" />
              <div className="text-[10px] font-medium">Bob</div>
              <div className={cn(
                "text-[9px] font-mono mt-1 transition-opacity",
                step >= 1 ? "opacity-100 text-amber-400" : "opacity-0"
              )}>
                Key: 0x4A...F2
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded bg-muted/20 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Keys</div>
              <div className="text-xs font-mono font-bold text-amber-400">1 shared</div>
            </div>
            <div className="rounded bg-muted/20 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Speed</div>
              <div className="text-xs font-mono font-bold text-emerald-400">Very fast</div>
            </div>
            <div className="rounded bg-muted/20 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Use case</div>
              <div className="text-xs font-mono font-bold">Bulk data</div>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Same key encrypts and decrypts. AES-256-GCM processes gigabytes per second. The challenge:
            how do you securely share the key in the first place? That&apos;s where asymmetric comes in.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className={cn(
              "rounded-lg border p-3 text-center flex-1 transition-all",
              step >= 1 ? "border-emerald-500/30 bg-emerald-500/5" : "border-border bg-muted/10"
            )}>
              <Unlock className="size-4 mx-auto mb-1 text-emerald-400" />
              <div className="text-[10px] font-medium">Alice</div>
              <div className={cn(
                "text-[9px] font-mono mt-1 space-y-0.5 transition-opacity",
                step >= 1 ? "opacity-100" : "opacity-0"
              )}>
                <div className="text-emerald-400">Public: 0x7B...A1</div>
                <div className="text-red-400">Private: 0x3D...E9</div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-1">
              <div className={cn(
                "text-[10px] font-mono transition-all duration-500",
                step >= 2 ? "opacity-100" : "opacity-0"
              )}>
                {step >= 2 && step < 4 ? (
                  <span className="text-emerald-400">Bob encrypts with Alice&apos;s public key →</span>
                ) : step >= 4 ? (
                  <span className="text-red-400">← Alice decrypts with her private key</span>
                ) : null}
              </div>
            </div>

            <div className={cn(
              "rounded-lg border p-3 text-center flex-1 transition-all",
              step >= 1 ? "border-emerald-500/30 bg-emerald-500/5" : "border-border bg-muted/10"
            )}>
              <Lock className="size-4 mx-auto mb-1 text-blue-400" />
              <div className="text-[10px] font-medium">Bob</div>
              <div className={cn(
                "text-[9px] font-mono mt-1 transition-opacity",
                step >= 1 ? "opacity-100" : "opacity-0"
              )}>
                <div className="text-emerald-400">Has Alice&apos;s public key</div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded bg-muted/20 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Keys</div>
              <div className="text-xs font-mono font-bold text-emerald-400">2 (pair)</div>
            </div>
            <div className="rounded bg-muted/20 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Speed</div>
              <div className="text-xs font-mono font-bold text-red-400">~1000x slower</div>
            </div>
            <div className="rounded bg-muted/20 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Use case</div>
              <div className="text-xs font-mono font-bold">Key exchange</div>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Public key encrypts, private key decrypts. No shared secret needed. But it&apos;s ~1000x
            slower than AES, so it&apos;s used only to exchange the symmetric key. TLS uses this
            hybrid approach: asymmetric for the handshake, symmetric for the data.
          </p>
        </div>
      )}
    </div>
  );
}

function PasswordHashingViz() {
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setFrame((f) => (f + 1) % 6), 1500);
    return () => clearInterval(t);
  }, []);

  const algorithms = [
    { name: "MD5", time: "0.000003ms", perSec: "300B", safe: false, color: "text-red-400", bgColor: "bg-red-500" },
    { name: "SHA-256", time: "0.000004ms", perSec: "250B", safe: false, color: "text-red-400", bgColor: "bg-red-500" },
    { name: "bcrypt (cost 10)", time: "100ms", perSec: "10", safe: true, color: "text-amber-400", bgColor: "bg-amber-500" },
    { name: "bcrypt (cost 12)", time: "250ms", perSec: "4", safe: true, color: "text-emerald-400", bgColor: "bg-emerald-500" },
    { name: "argon2id", time: "300ms", perSec: "3", safe: true, color: "text-emerald-400", bgColor: "bg-emerald-500" },
  ];

  return (
    <div className="space-y-2">
      {algorithms.map((algo, i) => (
        <div key={algo.name} className="flex items-center gap-3">
          <span className="text-[10px] font-mono w-24 text-right text-muted-foreground">{algo.name}</span>
          <div className="flex-1 flex items-center gap-2">
            <div
              className={cn(
                "h-6 rounded-md flex items-center px-2 text-[10px] font-mono font-bold text-white transition-all duration-500",
                frame > i ? `${algo.bgColor}/80` : "bg-muted/30"
              )}
              style={{
                width: frame > i
                  ? algo.safe ? `${20 + i * 15}%` : "8%"
                  : "4%",
                minWidth: frame > i ? "60px" : "16px",
              }}
            >
              {frame > i ? algo.time : ""}
            </div>
            {frame > i && (
              <span className="text-[10px] flex items-center gap-1">
                {algo.safe ? (
                  <CheckCircle2 className="size-3 text-emerald-400" />
                ) : (
                  <XCircle className="size-3 text-red-400" />
                )}
                <span className={algo.color}>{algo.perSec}/sec</span>
              </span>
            )}
          </div>
        </div>
      ))}
      <p className="text-[11px] text-muted-foreground/60 pl-28 pt-2">
        {frame < 3
          ? "MD5 and SHA-256 are designed to be fast -- terrible for passwords"
          : "bcrypt/argon2 are intentionally slow -- a GPU that cracks 300B MD5/sec manages only 4 bcrypt/sec"}
      </p>
    </div>
  );
}

function AtRestVsInTransitViz() {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setPhase((p) => (p + 1) % 6), 1600);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        {/* Client */}
        <div className={cn(
          "rounded-lg border p-3 text-center transition-all",
          phase >= 1 ? "border-blue-500/30 bg-blue-500/5" : "border-border bg-muted/10"
        )}>
          <div className="text-[10px] font-medium">Browser</div>
          <div className={cn(
            "text-[9px] font-mono mt-1 transition-opacity",
            phase >= 1 ? "opacity-100 text-muted-foreground" : "opacity-0"
          )}>
            SSN: 123-45-6789
          </div>
        </div>

        {/* In-transit */}
        <div className="flex-1 flex flex-col items-center gap-1">
          <div className={cn(
            "px-2 py-0.5 rounded text-[9px] font-mono transition-all",
            phase >= 2 ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-muted/20 text-muted-foreground/30"
          )}>
            {phase >= 2 ? "TLS: a7f2...encrypted" : "plaintext?"}
          </div>
          <span className="text-[8px] text-muted-foreground">
            {phase >= 2 ? "In Transit (TLS)" : "Network"}
          </span>
        </div>

        {/* Server */}
        <div className={cn(
          "rounded-lg border p-3 text-center transition-all",
          phase >= 3 ? "border-blue-500/30 bg-blue-500/5" : "border-border bg-muted/10"
        )}>
          <div className="text-[10px] font-medium">Server</div>
          <div className={cn(
            "text-[9px] font-mono mt-1 transition-opacity",
            phase >= 3 ? "opacity-100 text-muted-foreground" : "opacity-0"
          )}>
            Decrypts TLS
          </div>
        </div>

        {/* At-rest */}
        <div className="flex-1 flex flex-col items-center gap-1">
          <div className={cn(
            "px-2 py-0.5 rounded text-[9px] font-mono transition-all",
            phase >= 4 ? "bg-violet-500/10 text-violet-400 border border-violet-500/20" : "bg-muted/20 text-muted-foreground/30"
          )}>
            {phase >= 4 ? "AES: b3e1...encrypted" : "plaintext?"}
          </div>
          <span className="text-[8px] text-muted-foreground">
            {phase >= 4 ? "At Rest (AES)" : "Storage"}
          </span>
        </div>

        {/* Database */}
        <div className={cn(
          "rounded-lg border p-3 text-center transition-all",
          phase >= 4 ? "border-violet-500/30 bg-violet-500/5" : "border-border bg-muted/10"
        )}>
          <div className="text-[10px] font-medium">Database</div>
          <div className={cn(
            "text-[9px] font-mono mt-1 transition-opacity",
            phase >= 4 ? "opacity-100 text-violet-400" : "opacity-0"
          )}>
            Encrypted at rest
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className={cn(
          "rounded-lg border p-3 transition-all",
          phase >= 2 ? "border-emerald-500/20 bg-emerald-500/5" : "border-border bg-muted/10"
        )}>
          <h4 className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
            <Shield className="size-3" /> In Transit (TLS)
          </h4>
          <p className="text-[10px] text-muted-foreground mt-1">
            Protects data moving between client and server. Prevents eavesdropping, man-in-the-middle
            attacks, and packet sniffing on public networks.
          </p>
        </div>
        <div className={cn(
          "rounded-lg border p-3 transition-all",
          phase >= 4 ? "border-violet-500/20 bg-violet-500/5" : "border-border bg-muted/10"
        )}>
          <h4 className="text-[11px] font-semibold text-violet-400 flex items-center gap-1">
            <Lock className="size-3" /> At Rest (AES/KMS)
          </h4>
          <p className="text-[10px] text-muted-foreground mt-1">
            Protects data stored on disk. Prevents breach exposure, stolen backup exploitation,
            and unauthorized access by admins or insiders.
          </p>
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground/60 text-center">
        {phase < 2
          ? "Data starts as plaintext on the client..."
          : phase < 4
          ? "TLS encrypts it over the wire -- but it's decrypted on arrival at the server"
          : "At-rest encryption re-encrypts it before writing to disk -- defense in depth"}
      </p>
    </div>
  );
}

export default function EncryptionPage() {
  return (
    <div className="space-y-8">
      <TopicHero
        title="Encryption"
        subtitle="Data gets stolen all the time. Encryption makes sure stolen data is useless."
        difficulty="intermediate"
      />

      <FailureScenario title="The Scenario">
        <p className="text-sm text-muted-foreground">
          Your database gets breached. An attacker downloads the entire users table. Every
          password is stored in <strong>plain text</strong>. Within hours, the passwords are
          posted online. Since most people reuse passwords, attackers now have access to your
          users&apos; email, banking, and social media accounts. Your company is on the front
          page of the news for all the wrong reasons.
        </p>
        <div className="grid grid-cols-3 gap-3 pt-3">
          <MetricCounter label="Accounts Exposed" value={2.4} unit="M" trend="up" />
          <MetricCounter label="Time to Exploit" value={3} unit="hours" trend="up" />
          <MetricCounter label="Credential Reuse" value={65} unit="%" trend="up" />
        </div>
      </FailureScenario>

      <WhyItBreaks>
        <p className="text-sm text-muted-foreground">
          Storing sensitive data in plain text means a single breach exposes everything. No
          system is perfectly secure -- breaches happen through SQL injection, stolen
          credentials, insider threats, or misconfigured S3 buckets. The question isn&apos;t{" "}
          <em>if</em> your data will be targeted, it&apos;s <em>whether it will be useful
          to the attacker when it is</em>.
        </p>
        <div className="grid grid-cols-2 gap-2 mt-3">
          {[
            { n: "1", label: "Plain Text Passwords", desc: "Instant exploitation on breach" },
            { n: "2", label: "No TLS", desc: "Data readable on any network hop" },
            { n: "3", label: "No Disk Encryption", desc: "Stolen backup = full exposure" },
            { n: "4", label: "Keys Next to Data", desc: "Like locking the door, key under mat" },
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

      <ConceptVisualizer title="Hashing vs Encryption">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg border border-violet-500/30 bg-violet-500/5 p-4 space-y-2">
              <h4 className="text-sm font-semibold text-violet-400 flex items-center gap-1.5">
                <Fingerprint className="size-3.5" />
                Hashing (One-Way)
              </h4>
              <p className="text-xs text-muted-foreground">
                Converts input to a fixed-length digest that <strong>cannot be reversed</strong>.
                Used for passwords. You store the hash, and when a user logs in, you hash their
                input and compare. Even you can&apos;t recover the original password -- and that&apos;s
                the point.
              </p>
              <div className="font-mono text-[10px] bg-muted/30 rounded p-2">
                &quot;hunter2&quot; → $2b$12$LJ3m5...Kx9 (irreversible)
              </div>
            </div>
            <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-4 space-y-2">
              <h4 className="text-sm font-semibold text-blue-400 flex items-center gap-1.5">
                <Key className="size-3.5" />
                Encryption (Two-Way)
              </h4>
              <p className="text-xs text-muted-foreground">
                Converts plaintext to ciphertext using a key, and can be <strong>reversed</strong>{" "}
                with the correct key. Used for data you need to read later: credit cards, personal
                data, API secrets. AES-256 is the standard.
              </p>
              <div className="font-mono text-[10px] bg-muted/30 rounded p-2">
                &quot;4111-1111&quot; ↔ a7f2b3...9e (reversible with key)
              </div>
            </div>
          </div>
          <ConversationalCallout type="warning">
            Hash passwords. Encrypt data you need to read again. Using encryption for passwords is a
            design flaw -- if you can decrypt passwords, so can an attacker who gets your key. Using
            hashing for credit cards is wrong too -- you need the original number for charges.
          </ConversationalCallout>
        </div>
      </ConceptVisualizer>

      <ConceptVisualizer title="TLS 1.3 Handshake">
        <p className="text-sm text-muted-foreground mb-4">
          TLS (Transport Layer Security) encrypts data <strong>in transit</strong> between client
          and server. This is what the padlock icon in your browser means. TLS 1.3 reduced the
          handshake from 2 round trips (TLS 1.2) to just 1, and eliminated insecure cipher suites
          entirely -- only 5 cipher suites remain, down from 37.
        </p>
        <TlsHandshakeViz />
        <AhaMoment
          question="Why does TLS use both asymmetric and symmetric encryption?"
          answer={
            <p>
              Asymmetric encryption (RSA/ECDHE) is ~1000x slower than symmetric (AES). You
              can&apos;t stream video encrypted with RSA -- it would be impossibly slow. But symmetric
              requires a shared secret key, and you can&apos;t send a secret key over an insecure
              channel. TLS solves this with a hybrid: use asymmetric once to agree on a shared key,
              then switch to fast symmetric for all actual data. Best of both worlds.
            </p>
          }
        />
      </ConceptVisualizer>

      <ConceptVisualizer title="Symmetric vs Asymmetric Encryption">
        <p className="text-sm text-muted-foreground mb-4">
          Toggle between the two modes to see how each works. In practice, they&apos;re used
          together: asymmetric for initial key exchange (TLS handshake), symmetric for bulk data
          encryption (the actual HTTP traffic).
        </p>
        <SymmetricVsAsymmetricViz />
      </ConceptVisualizer>

      <ConceptVisualizer title="In-Transit vs At-Rest Encryption">
        <p className="text-sm text-muted-foreground mb-4">
          Data needs protection at two points: while moving over the network (in transit) and while
          stored on disk (at rest). TLS handles the first. Disk encryption (AWS EBS encryption,
          application-level AES) handles the second. You need both -- they protect against different
          threat vectors.
        </p>
        <AtRestVsInTransitViz />
      </ConceptVisualizer>

      <ConceptVisualizer title="Password Hashing: Speed Is the Enemy">
        <p className="text-sm text-muted-foreground mb-4">
          For passwords, you want the hash function to be <strong>deliberately slow</strong>. MD5 and
          SHA-256 are designed to be fast -- a modern GPU computes billions per second, making brute
          force trivial. bcrypt and argon2 are designed to be slow and memory-hard, making each guess
          expensive. The &quot;cost factor&quot; controls how slow.
        </p>
        <PasswordHashingViz />
      </ConceptVisualizer>

      <CorrectApproach title="Encryption at Every Layer">
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-semibold flex items-center gap-1.5">
              <Shield className="size-3.5 text-emerald-400" />
              In Transit (TLS/HTTPS)
            </h4>
            <p className="text-sm text-muted-foreground">
              All network communication must use TLS 1.3. This includes client-to-server,
              server-to-database, and service-to-service. Redirect all HTTP to HTTPS. Set HSTS
              headers. Use certificate pinning for mobile apps. Internal service mesh (Istio, Linkerd)
              provides mTLS between microservices automatically.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold flex items-center gap-1.5">
              <Lock className="size-3.5 text-violet-400" />
              At Rest
            </h4>
            <p className="text-sm text-muted-foreground">
              Encrypt all data on disk: database files, backups, log files. Cloud providers offer
              transparent disk encryption (AWS EBS, GCP default encryption). For sensitive fields
              (SSNs, credit cards), add <strong>application-level encryption</strong> so even
              database admins see ciphertext. Use envelope encryption: encrypt data with a data key,
              encrypt the data key with a master key in KMS.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold flex items-center gap-1.5">
              <Fingerprint className="size-3.5 text-amber-400" />
              Password Storage
            </h4>
            <p className="text-sm text-muted-foreground">
              Use bcrypt (cost factor 12+) or argon2id. Both auto-salt. Never MD5, SHA-1, or plain
              SHA-256 -- they&apos;re designed for speed, the opposite of what you want. At cost 12,
              bcrypt takes ~250ms per hash. A GPU doing 300 billion MD5/sec manages only ~4 bcrypt/sec.
              That&apos;s the difference between cracking a password in seconds vs. centuries.
            </p>
          </div>
        </div>
      </CorrectApproach>

      <BeforeAfter
        before={{
          title: "Plain Text Storage",
          content: (
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="font-mono text-xs bg-muted/50 p-2 rounded">
                {`users table:`}<br />
                {`| email            | password     |`}<br />
                {`| alice@co.com     | hunter2      |`}<br />
                {`| bob@co.com       | password123  |`}<br />
                {`| carol@co.com     | qwerty       |`}
              </p>
              <p>
                One SQL injection and every password is exposed. Attackers try these
                credentials on banks, email, and social media within minutes.
              </p>
            </div>
          ),
        }}
        after={{
          title: "Properly Hashed (bcrypt, cost 12)",
          content: (
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="font-mono text-xs bg-muted/50 p-2 rounded">
                {`users table:`}<br />
                {`| email            | password_hash          |`}<br />
                {`| alice@co.com     | $2b$12$LJ3m5... (60c) |`}<br />
                {`| bob@co.com       | $2b$12$Kp9x2... (60c) |`}<br />
                {`| carol@co.com     | $2b$12$Nv4jR... (60c) |`}
              </p>
              <p>
                Even if stolen, each bcrypt hash takes ~4 seconds to test one guess on a GPU.
                A 10-character password would take millions of years to brute force. The salt
                prevents rainbow table attacks.
              </p>
            </div>
          ),
        }}
      />

      <InteractiveDemo title="Encryption Decision Guide">
        {({ isPlaying, tick }) => {
          const scenarios = [
            { data: "User passwords", method: "bcrypt (cost 12+)", why: "One-way hash -- you never need the original", type: "hash" },
            { data: "Credit card numbers", method: "AES-256-GCM", why: "Need original for charges, but must protect at rest", type: "encrypt" },
            { data: "API traffic", method: "TLS 1.3", why: "Protect data in transit from eavesdropping", type: "tls" },
            { data: "Database backups", method: "AES-256 + KMS", why: "Stolen backup tape shouldn't expose data", type: "encrypt" },
            { data: "JWT tokens", method: "HMAC-SHA256 or RS256", why: "Signature verification, not confidentiality", type: "sign" },
            { data: "File checksums", method: "SHA-256", why: "Integrity verification -- fast hashing is fine here", type: "hash" },
          ];
          const active = isPlaying ? Math.min(tick % 8, scenarios.length) : 0;

          const typeColors: Record<string, string> = {
            hash: "text-violet-400 bg-violet-500/10 border-violet-500/20",
            encrypt: "text-blue-400 bg-blue-500/10 border-blue-500/20",
            tls: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
            sign: "text-amber-400 bg-amber-500/10 border-amber-500/20",
          };

          return (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Press play to see which encryption approach fits each scenario. The right tool
                depends on whether you need reversibility, speed, or integrity.
              </p>
              <div className="space-y-1.5">
                {scenarios.map((s, i) => (
                  <div
                    key={s.data}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border px-3 py-2 transition-all duration-400",
                      i < active ? `border-current/10 ${typeColors[s.type]}` : "bg-muted/10 border-border/30 text-muted-foreground/40"
                    )}
                  >
                    <span className="text-xs font-medium w-32">{s.data}</span>
                    <span className={cn("text-[10px] font-mono font-bold w-28", i < active ? "" : "text-transparent")}>
                      {s.method}
                    </span>
                    <span className="text-[10px] text-muted-foreground flex-1">
                      {i < active ? s.why : "--"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        }}
      </InteractiveDemo>

      <AhaMoment
        question="If HTTPS encrypts everything, why do I also need to encrypt data at rest?"
        answer={
          <p>
            TLS only protects data while it&apos;s moving between two points. Once it arrives at
            your server, it&apos;s decrypted. If someone breaches your server, steals a backup tape,
            or accesses your database directly, they see plain text. Encryption at rest is your second
            line of defense -- defense in depth. Think of TLS as an armored truck and at-rest
            encryption as a vault. You need both.
          </p>
        }
      />

      <ConversationalCallout type="warning">
        Never roll your own encryption algorithm. Use established libraries (libsodium, OpenSSL,
        Web Crypto API). Cryptography is one of the few areas where &quot;build it yourself&quot;
        is almost always wrong -- subtle implementation bugs (timing attacks, padding oracles, weak
        IVs) can make encryption completely useless while still appearing to work.
      </ConversationalCallout>

      <ConversationalCallout type="tip">
        In interviews, distinguish between symmetric (AES -- one key, fast, for bulk data) and
        asymmetric (RSA/ECDSA -- key pair, slower, for key exchange and signatures). TLS uses both:
        asymmetric for the handshake, then symmetric for the data. This hybrid approach is used
        everywhere: TLS, PGP, Signal, WhatsApp.
      </ConversationalCallout>

      <ConversationalCallout type="question">
        Where do you store the encryption key? If the key is next to the encrypted data, it&apos;s
        like locking your door and leaving the key under the mat. Use a dedicated key management
        service (AWS KMS, HashiCorp Vault, Google Cloud KMS) that separates key storage from data
        storage. With envelope encryption, KMS never sees your data -- it only encrypts/decrypts
        the data encryption key.
      </ConversationalCallout>

      <KeyTakeaway
        points={[
          "Hash passwords (bcrypt/argon2, one-way, intentionally slow). Encrypt data you need to read later (AES-256, two-way, fast). Never confuse the two.",
          "TLS 1.3 encrypts data in transit with a single round-trip handshake. Without it, anyone on the network can read passwords, tokens, and credit cards.",
          "At-rest encryption protects against database breaches, stolen backups, and insider threats. Use it in addition to TLS -- they cover different threat vectors.",
          "TLS is a hybrid scheme: asymmetric encryption (slow, for key exchange) + symmetric encryption (fast, for data). This pattern appears everywhere in cryptography.",
          "Never use MD5 or SHA-256 for passwords -- they're too fast. Bcrypt with cost 12+ takes ~250ms per hash, making brute force impractical even on GPU clusters.",
          "Key management is half the problem. Store encryption keys in a KMS (AWS KMS, Vault), not alongside the data they protect. Use envelope encryption.",
        ]}
      />
    </div>
  );
}
