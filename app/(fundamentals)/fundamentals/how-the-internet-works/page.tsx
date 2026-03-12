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
import { ConversationalCallout } from "@/components/conversational-callout";
import { AhaMoment } from "@/components/aha-moment";
import { BeforeAfter } from "@/components/before-after";
import { cn } from "@/lib/utils";
import { Globe, Search, Handshake, ArrowRightLeft, FileText, CheckCircle2 } from "lucide-react";

function DnsWaterfall() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % 9), 1200);
    return () => clearInterval(t);
  }, []);

  const stages = [
    { label: "Browser Cache", time: "~0ms", hit: step >= 1 && step < 2 },
    { label: "OS Cache", time: "~0ms", hit: step >= 2 && step < 3 },
    { label: "ISP Resolver", time: "~5ms", hit: step >= 3 && step < 4 },
    { label: "Root Server", time: "~15ms", hit: step >= 4 && step < 5 },
    { label: ".com TLD", time: "~25ms", hit: step >= 5 && step < 6 },
    { label: "Authoritative NS", time: "~35ms", hit: step >= 6 },
  ];

  return (
    <div className="space-y-1.5">
      {stages.map((s, i) => (
        <div key={s.label} className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-muted-foreground/50 w-8 text-right">{i + 1}</span>
          <div className="flex-1 flex items-center gap-2">
            <div
              className={cn(
                "h-7 rounded-md flex items-center px-3 text-xs font-medium transition-all duration-300 border",
                step > i
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : step === i
                  ? "bg-blue-500/10 border-blue-500/30 text-blue-400 ring-1 ring-blue-500/20"
                  : "bg-muted/20 border-border/50 text-muted-foreground/40"
              )}
              style={{ width: `${30 + i * 12}%` }}
            >
              {s.label}
            </div>
            <span className={cn(
              "text-[10px] font-mono transition-opacity",
              step >= i ? "opacity-100 text-muted-foreground" : "opacity-0"
            )}>
              {s.time}
            </span>
          </div>
        </div>
      ))}
      <p className="text-[11px] text-muted-foreground/60 pl-11 pt-1">
        {step === 0 ? "Querying..." : step < 6 ? "Cache miss, asking next level..." : "Found: 93.184.216.34"}
      </p>
    </div>
  );
}

function TcpHandshakeViz() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % 7), 1000);
    return () => clearInterval(t);
  }, []);

  const msgs = [
    { from: "left", label: "SYN", desc: "Can we talk?", color: "bg-blue-500" },
    { from: "right", label: "SYN-ACK", desc: "Yes, and can you hear me?", color: "bg-emerald-500" },
    { from: "left", label: "ACK", desc: "Loud and clear.", color: "bg-blue-500" },
  ];

  return (
    <div className="relative py-4">
      <div className="flex justify-between items-start mb-6 px-4">
        <div className="text-center">
          <div className={cn(
            "size-12 rounded-xl border flex items-center justify-center mb-1.5 transition-all",
            step >= 1 ? "bg-blue-500/10 border-blue-500/30" : "bg-muted/30 border-border"
          )}>
            <Globe className="size-5 text-blue-400" />
          </div>
          <span className="text-[11px] font-medium">Client</span>
        </div>
        <div className="text-center">
          <div className={cn(
            "size-12 rounded-xl border flex items-center justify-center mb-1.5 transition-all",
            step >= 2 ? "bg-emerald-500/10 border-emerald-500/30" : "bg-muted/30 border-border"
          )}>
            <ServerNode type="server" label="" className="border-0 bg-transparent p-0" />
          </div>
          <span className="text-[11px] font-medium">Server</span>
        </div>
      </div>
      <div className="space-y-3 px-4">
        {msgs.map((msg, i) => (
          <div
            key={msg.label}
            className={cn(
              "flex items-center gap-2 transition-all duration-500",
              msg.from === "left" ? "flex-row" : "flex-row-reverse",
              step > i ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            )}
          >
            <div className={cn(
              "rounded-full px-3 py-1 text-[11px] font-mono font-bold text-white",
              msg.color
            )}>
              {msg.label}
            </div>
            <div className="flex-1 border-t border-dashed border-muted-foreground/20" />
            <span className="text-[10px] text-muted-foreground italic">{msg.desc}</span>
          </div>
        ))}
      </div>
      {step >= 4 && (
        <div className="flex items-center justify-center gap-2 mt-4 text-[11px] text-emerald-400 font-medium">
          <CheckCircle2 className="size-3.5" />
          Connection established
        </div>
      )}
    </div>
  );
}

export default function HowTheInternetWorksPage() {
  return (
    <div className="space-y-8">
      <TopicHero
        title="How the Internet Works"
        subtitle="Every time you type a URL and press Enter, a chain of events unfolds in milliseconds. Understanding this chain is the foundation of all system design."
        difficulty="beginner"
      />

      <FailureScenario title="You type a URL and... nothing happens">
        <p className="text-sm text-muted-foreground">
          You open your browser, type <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">www.example.com</code> and
          hit Enter. The page spins. And spins. Eventually:
          <strong className="text-red-400"> &quot;This site can&apos;t be reached.&quot;</strong>
        </p>
        <p className="text-sm text-muted-foreground">
          No useful error message. No clue whether the problem is your machine, the network, or
          the server. Without a mental model of what was supposed to happen, you have no idea where it broke.
        </p>
        <div className="flex items-center justify-center gap-4 py-2">
          <ServerNode type="client" label="Browser" status="warning" />
          <span className="text-red-500 text-lg font-mono">---✕---</span>
          <ServerNode type="cloud" label="Internet" status="unhealthy" />
          <span className="text-red-500 text-lg font-mono">---✕---</span>
          <ServerNode type="server" label="Server" status="idle" />
        </div>
      </FailureScenario>

      <WhyItBreaks title="At least 4 steps can fail — and they're invisible">
        <p className="text-sm text-muted-foreground">
          What feels like a single action — &quot;load a website&quot; — is a pipeline of
          distinct operations. Each depends on the previous one succeeding.
        </p>
        <div className="grid grid-cols-2 gap-2 mt-3">
          {[
            { n: "1", label: "DNS Resolution", desc: "Domain → IP address" },
            { n: "2", label: "TCP Handshake", desc: "Establish reliable connection" },
            { n: "3", label: "HTTP Request", desc: "Send your actual request" },
            { n: "4", label: "Response Routing", desc: "Packets find their way back" },
          ].map((item) => (
            <div key={item.n} className="flex items-start gap-2.5 rounded-lg bg-muted/30 p-3">
              <span className="text-xs font-mono font-bold text-orange-400 bg-orange-500/10 rounded-md size-6 flex items-center justify-center shrink-0">
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

      <ConceptVisualizer title="The Full Journey of a Web Request">
        <p className="text-sm text-muted-foreground mb-4">
          Click any step to jump to it. In reality, this entire flow happens in under 200ms.
        </p>
        <AnimatedFlow
          steps={[
            { id: "dns", label: "DNS Lookup", description: "What IP is example.com?", icon: <Search className="size-4" /> },
            { id: "tcp", label: "TCP Handshake", description: "SYN → SYN-ACK → ACK", icon: <Handshake className="size-4" /> },
            { id: "http", label: "HTTP Request", description: "GET / HTTP/1.1", icon: <ArrowRightLeft className="size-4" /> },
            { id: "response", label: "Response", description: "200 OK + HTML/CSS/JS", icon: <FileText className="size-4" /> },
            { id: "render", label: "Render", description: "Browser paints the page", icon: <Globe className="size-4" /> },
          ]}
          interval={2000}
        />
      </ConceptVisualizer>

      <ConceptVisualizer title="DNS Resolution — The Internet's Phone Book">
        <p className="text-sm text-muted-foreground mb-4">
          Your browser doesn&apos;t know what <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">93.184.216.34</code> is,
          and you don&apos;t want to memorize it. DNS bridges that gap — a globally distributed
          database mapping domain names to IP addresses.
        </p>
        <DnsWaterfall />
        <ConversationalCallout type="tip">
          DNS uses UDP by default because queries are small and speed matters more than
          guaranteed delivery. If the response is too large (&gt;512 bytes), it falls back to TCP.
        </ConversationalCallout>
      </ConceptVisualizer>

      <ConceptVisualizer title="TCP Three-Way Handshake">
        <p className="text-sm text-muted-foreground mb-4">
          Before any data is exchanged, client and server need to agree they can communicate.
          TCP establishes this trust with three messages — a polite introduction before the conversation.
        </p>
        <TcpHandshakeViz />
        <AhaMoment
          question="Why three messages instead of two?"
          answer={
            <p>
              Two messages only confirm the client can reach the server. The third (ACK) confirms
              the server can reach the client <em>back</em>. Both directions must be verified for
              reliable two-way communication.
            </p>
          }
        />
      </ConceptVisualizer>

      <InteractiveDemo title="Trace a Request Yourself">
        {({ isPlaying, tick }) => {
          const stages = [
            { name: "DNS", time: "~15ms", desc: "Resolved to 93.184.216.34" },
            { name: "TCP", time: "~30ms", desc: "Connection established" },
            { name: "TLS", time: "~50ms", desc: "Encryption negotiated" },
            { name: "HTTP", time: "~65ms", desc: "GET / sent to server" },
            { name: "Response", time: "~120ms", desc: "200 OK — 45KB HTML received" },
          ];
          const active = isPlaying ? Math.min(tick % 6, stages.length) : 0;

          return (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Press play to simulate a request to <code className="text-xs bg-muted px-1 rounded font-mono">api.example.com</code>.
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
                      "text-xs font-mono font-bold w-16",
                      i < active ? "text-emerald-400" : i === active && isPlaying ? "text-blue-400" : ""
                    )}>
                      {stage.name}
                    </span>
                    <div className="flex-1 text-xs text-muted-foreground">
                      {i < active ? stage.desc : "—"}
                    </div>
                    <span className={cn(
                      "text-[10px] font-mono",
                      i < active ? "text-muted-foreground" : "text-transparent"
                    )}>
                      {stage.time}
                    </span>
                  </div>
                ))}
              </div>
              {active >= stages.length && (
                <ConversationalCallout type="question">
                  Notice TLS between TCP and HTTP? For HTTPS sites, there&apos;s an additional
                  handshake to negotiate encryption keys. More latency, but your data stays private.
                </ConversationalCallout>
              )}
            </div>
          );
        }}
      </InteractiveDemo>

      <CorrectApproach title="Building a Mental Model for Debugging">
        <p className="text-sm text-muted-foreground mb-3">
          Now that you understand the pipeline, you can debug systematically instead of guessing:
        </p>
        <BeforeAfter
          before={{
            title: "Without the mental model",
            content: (
              <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                <li>&quot;The site is down&quot;</li>
                <li>Refresh 20 times</li>
                <li>Try a different browser</li>
                <li>Restart computer</li>
                <li>Give up</li>
              </ul>
            ),
          }}
          after={{
            title: "With the mental model",
            content: (
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li><code className="text-xs bg-muted px-1 rounded font-mono">nslookup</code> — check DNS</li>
                <li><code className="text-xs bg-muted px-1 rounded font-mono">ping</code> — check connectivity</li>
                <li><code className="text-xs bg-muted px-1 rounded font-mono">curl -v</code> — check HTTP</li>
                <li>Check status code → identify issue</li>
                <li>Fix the specific broken layer</li>
              </ul>
            ),
          }}
        />
      </CorrectApproach>

      <AhaMoment
        question="Why does video streaming tolerate packet loss?"
        answer={
          <p>
            UDP sacrifices reliability for speed — a dropped video frame is better than buffering
            while TCP retransmits. This is why live streams and video calls use UDP: a slightly
            glitchy frame is imperceptible, but a half-second freeze ruins the experience. It is
            also why QUIC (the protocol behind HTTP/3) is built on UDP — it gets UDP&apos;s speed
            while adding its own reliability layer on top, avoiding TCP&apos;s head-of-line blocking.
          </p>
        }
      />

      <ConversationalCallout type="tip">
        In every system design interview, trace the request path first: DNS → TCP → TLS → HTTP → your
        application. This shows the interviewer you understand the full stack before diving into
        application-level design. It is the single most effective way to start any answer.
      </ConversationalCallout>

      <KeyTakeaway
        points={[
          "A web request is a pipeline: DNS → TCP → (TLS) → HTTP → Response. Each step depends on the previous one.",
          "DNS is hierarchical: browser cache → OS cache → resolver → root → TLD → authoritative nameserver.",
          "TCP uses a three-way handshake (SYN, SYN-ACK, ACK) to establish reliable bidirectional communication.",
          "Packets may take different paths and arrive out of order. TCP reassembles them.",
          "Understanding the request pipeline is the foundation for debugging and designing distributed systems.",
        ]}
      />
    </div>
  );
}
