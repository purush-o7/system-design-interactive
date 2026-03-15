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
import { MetricCounter } from "@/components/metric-counter";
import { InteractiveDemo } from "@/components/interactive-demo";
import { AhaMoment } from "@/components/aha-moment";
import { ConversationalCallout } from "@/components/conversational-callout";
import { BeforeAfter } from "@/components/before-after";
import { cn } from "@/lib/utils";
import { Shield, Zap, Globe, Server, AlertTriangle, CheckCircle2, XCircle, Activity } from "lucide-react";

function AttackTrafficViz() {
  const [tick, setTick] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  useEffect(() => {
    if (!isPlaying) return;
    const t = setInterval(() => setTick((s) => (s + 1) % 40), 200);
    return () => clearInterval(t);
  }, [isPlaying]);

  const isAttacking = tick >= 10 && tick < 30;
  const normalRate = 5;
  const attackRate = isAttacking ? 45 + Math.floor(Math.random() * 20) : normalRate;
  const legitimateRate = normalRate;

  const trafficBars = Array.from({ length: 20 }, (_, i) => {
    const pos = (tick - i + 40) % 40;
    const wasAttack = pos >= 10 && pos < 30;
    return {
      total: wasAttack ? 40 + Math.floor(Math.random() * 25) : normalRate + Math.floor(Math.random() * 3),
      legitimate: normalRate + Math.floor(Math.random() * 2),
      isAttack: wasAttack,
    };
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <span className={cn(
          "text-[11px] font-semibold flex items-center gap-1.5 transition-colors",
          isAttacking ? "text-red-400" : "text-emerald-400"
        )}>
          <Activity className="size-3.5" />
          {isAttacking ? "DDoS Attack in Progress" : "Normal Traffic"}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-muted-foreground">
            {attackRate} Gbps{isAttacking ? " (50 Gbps attack)" : ""}
          </span>
          <button onClick={() => setIsPlaying(p => !p)}
            className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 border border-violet-500/20 transition-colors">
            {isPlaying ? "⏸ Pause" : "▶ Start"}
          </button>
        </div>
      </div>

      <div className="flex items-end gap-0.5 h-24 px-1">
        {trafficBars.map((bar, i) => (
          <div key={i} className="flex-1 flex flex-col justify-end gap-0">
            <div
              className={cn(
                "rounded-t-sm transition-all duration-150",
                bar.isAttack ? "bg-red-500/40" : "bg-transparent"
              )}
              style={{ height: `${Math.max(0, (bar.total - bar.legitimate) / 65 * 100)}%` }}
            />
            <div
              className="bg-emerald-500/40 rounded-b-sm"
              style={{ height: `${(bar.legitimate / 65) * 100}%` }}
            />
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4 justify-center text-[10px]">
        <span className="flex items-center gap-1">
          <div className="size-2 rounded-full bg-emerald-500/60" /> Legitimate traffic
        </span>
        <span className="flex items-center gap-1">
          <div className="size-2 rounded-full bg-red-500/60" /> Attack traffic
        </span>
      </div>

      {isAttacking && (
        <p className="text-[11px] text-red-400 text-center font-medium">
          Attack traffic overwhelms the legitimate signal — without filtering, your server processes all of it
        </p>
      )}
    </div>
  );
}

const attackActiveStyles: Record<string, string> = {
  red: "bg-red-500/10 border-red-500/20 text-red-400",
  amber: "bg-amber-500/10 border-amber-500/20 text-amber-400",
  violet: "bg-violet-500/10 border-violet-500/20 text-violet-400",
};

const attackBarStyles: Record<string, string> = {
  red: "bg-red-500/8 border-red-500/20",
  amber: "bg-amber-500/8 border-amber-500/20",
  violet: "bg-violet-500/8 border-violet-500/20",
};

function LayerAttackViz() {
  const [layer, setLayer] = useState<"l3" | "l4" | "l7">("l3");
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  useEffect(() => {
    if (!isPlaying) return;
    const t = setInterval(() => setStep((s) => (s + 1) % 5), 1100);
    return () => clearInterval(t);
  }, [isPlaying]);

  const attacks = {
    l3: {
      name: "Layer 3 — Network",
      color: "red",
      examples: [
        { name: "ICMP Flood", desc: "Millions of ping packets saturate your network link", volume: "High" },
        { name: "IP Fragmentation", desc: "Malformed fragments crash the reassembly buffer", volume: "Medium" },
        { name: "Smurf Attack", desc: "Broadcast ICMP with spoofed source — all hosts reply to victim", volume: "High" },
      ],
      target: "Raw bandwidth — overwhelm the network pipe itself",
      defense: "Anycast routing spreads traffic across global PoPs. ISP-level null routing. BGP flowspec rules.",
    },
    l4: {
      name: "Layer 4 — Transport",
      color: "amber",
      examples: [
        { name: "SYN Flood", desc: "Millions of half-open TCP connections exhaust connection table", volume: "High" },
        { name: "UDP Flood", desc: "Volumetric UDP packets saturate processing capacity", volume: "High" },
        { name: "ACK Flood", desc: "Spoofed ACK packets force server to look up nonexistent connections", volume: "Medium" },
      ],
      target: "Connection state — exhaust the server's ability to track connections",
      defense: "SYN cookies (stateless SYN handling). Connection rate limits. UDP traffic profiling.",
    },
    l7: {
      name: "Layer 7 — Application",
      color: "violet",
      examples: [
        { name: "HTTP Flood", desc: "Thousands of legitimate-looking GET/POST requests per second", volume: "Low-Med" },
        { name: "Slowloris", desc: "Keep connections open by sending partial headers very slowly", volume: "Low" },
        { name: "API Abuse", desc: "Expensive queries like /search?q=* that trigger full table scans", volume: "Low" },
      ],
      target: "Application logic — each request is cheap to send but expensive to process",
      defense: "WAF rules. Rate limiting per IP/session. JavaScript challenges. Bot detection (CAPTCHA).",
    },
  };

  const a = attacks[layer];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="grid grid-cols-3 gap-1.5 flex-1">
          {(Object.keys(attacks) as Array<keyof typeof attacks>).map((key) => (
            <button
              key={key}
              onClick={() => { setLayer(key); setStep(0); }}
              className={cn(
                "text-[10px] font-semibold py-2 rounded-md border transition-all uppercase",
                layer === key
                  ? attackActiveStyles[attacks[key].color]
                  : "bg-muted/20 border-border/50 text-muted-foreground/50"
              )}
            >
              {attacks[key].name}
            </button>
          ))}
        </div>
        <button onClick={() => setIsPlaying(p => !p)}
          className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 border border-violet-500/20 transition-colors shrink-0">
          {isPlaying ? "⏸ Pause" : "▶ Start"}
        </button>
      </div>

      <div className="space-y-1.5">
        {a.examples.map((ex, i) => (
          <div
            key={`${layer}-${i}`}
            className={cn(
              "flex items-center gap-3 rounded-lg border px-3 py-2 transition-all duration-400",
              step > i
                ? attackBarStyles[a.color]
                : step === i
                ? "bg-blue-500/8 border-blue-500/20 ring-1 ring-blue-500/15"
                : "bg-muted/10 border-border/30 opacity-40"
            )}
          >
            <div className="flex-1">
              <span className="text-xs font-semibold">{ex.name}</span>
              <p className="text-[10px] text-muted-foreground">{ex.desc}</p>
            </div>
            <span className={cn(
              "text-[9px] font-mono px-1.5 py-0.5 rounded border shrink-0",
              ex.volume === "High"
                ? "text-red-400 border-red-500/20 bg-red-500/10"
                : ex.volume === "Medium" || ex.volume === "Low-Med"
                ? "text-amber-400 border-amber-500/20 bg-amber-500/10"
                : "text-blue-400 border-blue-500/20 bg-blue-500/10"
            )}>
              {ex.volume} vol
            </span>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-border/50 bg-muted/20 p-3 space-y-1">
        <p className="text-[10px] font-semibold text-muted-foreground">Target</p>
        <p className="text-[11px] text-foreground">{a.target}</p>
        <p className="text-[10px] font-semibold text-muted-foreground mt-2">Defense</p>
        <p className="text-[11px] text-foreground">{a.defense}</p>
      </div>
    </div>
  );
}

function DefenseLayerViz() {
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  useEffect(() => {
    if (!isPlaying) return;
    const t = setInterval(() => setStep((s) => (s + 1) % 7), 1500);
    return () => clearInterval(t);
  }, [isPlaying]);

  const layers = [
    {
      name: "Incoming Traffic",
      traffic: "100 Gbps",
      blocked: "0%",
      color: "text-red-400",
      bg: "bg-red-500/10 border-red-500/20",
      desc: "Mixed legitimate + attack traffic from botnet",
    },
    {
      name: "Anycast + Scrubbing",
      traffic: "→ spread across 300 PoPs",
      blocked: "~70%",
      color: "text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20",
      desc: "Volumetric traffic absorbed. Known-bad IPs dropped. SYN cookies activated.",
    },
    {
      name: "WAF Rules",
      traffic: "30 Gbps remaining",
      blocked: "~90%",
      color: "text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/20",
      desc: "Malicious HTTP patterns filtered. Bot signatures blocked. SQL injection stopped.",
    },
    {
      name: "Rate Limiting",
      traffic: "10 Gbps remaining",
      blocked: "~97%",
      color: "text-violet-400",
      bg: "bg-violet-500/10 border-violet-500/20",
      desc: "Per-IP and per-session caps enforced. Suspicious traffic gets JS challenges.",
    },
    {
      name: "Origin Server",
      traffic: "3 Gbps clean traffic",
      blocked: "~97% filtered",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
      desc: "Only validated, legitimate requests reach your infrastructure.",
    },
  ];

  return (
    <div className="space-y-2">
      <div className="flex justify-end">
        <button onClick={() => setIsPlaying(p => !p)}
          className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 border border-violet-500/20 transition-colors">
          {isPlaying ? "⏸ Pause" : "▶ Start"}
        </button>
      </div>
      <div className="space-y-1.5">
      {layers.map((l, i) => (
        <div
          key={l.name}
          className={cn(
            "flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-all duration-500",
            step > i ? l.bg : step === i ? "bg-muted/30 border-border ring-1 ring-blue-500/15" : "bg-muted/10 border-border/30 opacity-30"
          )}
        >
          <span className={cn(
            "text-[10px] font-mono font-bold w-5 shrink-0",
            step >= i ? l.color : "text-muted-foreground/30"
          )}>
            {i + 1}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={cn("text-xs font-semibold", step >= i ? "" : "text-muted-foreground/40")}>
                {l.name}
              </span>
              <span className={cn("text-[9px] font-mono", step >= i ? l.color : "text-transparent")}>
                {l.traffic}
              </span>
            </div>
            {step >= i && (
              <p className="text-[10px] text-muted-foreground leading-relaxed mt-0.5">{l.desc}</p>
            )}
          </div>
          {i > 0 && step >= i && (
            <span className={cn("text-[9px] font-mono shrink-0 px-1.5 py-0.5 rounded", l.bg, l.color)}>
              {l.blocked}
            </span>
          )}
        </div>
      ))}
      </div>
    </div>
  );
}

export default function DdosProtectionPage() {
  return (
    <div className="space-y-8">
      <TopicHero
        title="DDoS Protection"
        subtitle="When a million bots show up at your door, you need more than a 'please wait' sign. DDoS defense is about filtering traffic before it reaches you."
        difficulty="advanced"
      />

      <FailureScenario title="50 Gbps of bot traffic takes you completely offline">
        <p className="text-sm text-muted-foreground">
          Your site goes down because <strong>1 million bots hit your homepage simultaneously</strong>.
          Your origin server tries to handle every connection. The CPU pins at 100%, memory is exhausted,
          and the network interface is saturated with 50 Gbps of traffic — your server only has a 10 Gbps
          link. Legitimate users see connection timeouts. Your hosting provider null-routes your IP to
          protect their other customers. You&apos;re completely offline, and scaling up won&apos;t help —
          the pipe itself is full.
        </p>
        <div className="flex justify-center gap-3 pt-3 flex-wrap">
          <ServerNode type="client" label="Botnet" sublabel="1M devices" status="unhealthy" />
          <span className="text-red-500 text-sm font-mono self-center">50 Gbps →</span>
          <ServerNode type="server" label="Origin" sublabel="10 Gbps link" status="unhealthy" />
          <ServerNode type="database" label="Database" sublabel="Unreachable" status="unhealthy" />
        </div>
      </FailureScenario>

      <WhyItBreaks title="You can't out-compute a flood">
        <p className="text-sm text-muted-foreground">
          A Distributed Denial of Service attack works by flooding your infrastructure with more traffic
          than it can handle. The &quot;distributed&quot; part means traffic comes from thousands or
          millions of compromised devices (a botnet), making it impossible to block by IP address.
          Without upstream filtering, your server must process every packet — and even <strong>rejecting</strong>{" "}
          a request costs CPU cycles. At sufficient volume, there&apos;s nothing your server can do.
          The network pipe itself is full before your code even runs.
        </p>
        <div className="grid grid-cols-2 gap-2 mt-3">
          {[
            { label: "Volumetric", desc: "Saturate bandwidth with sheer packet volume (UDP, ICMP floods)", stat: "Up to 3.47 Tbps recorded" },
            { label: "Protocol", desc: "Exhaust connection state tables (SYN floods, ACK floods)", stat: "Millions of half-open connections" },
            { label: "Application", desc: "Exhaust server resources with expensive requests (HTTP floods)", stat: "L7 attacks up 74% YoY" },
            { label: "Amplification", desc: "Spoof source IP + abuse reflectors (DNS, NTP, Memcached)", stat: "51,000x amplification factor" },
          ].map((item) => (
            <div key={item.label} className="rounded-lg bg-muted/30 p-3 space-y-1">
              <p className="text-xs font-semibold">{item.label}</p>
              <p className="text-[11px] text-muted-foreground">{item.desc}</p>
              <p className="text-[10px] font-mono text-red-400">{item.stat}</p>
            </div>
          ))}
        </div>
      </WhyItBreaks>

      <ConceptVisualizer title="Attack Traffic Visualization">
        <p className="text-sm text-muted-foreground mb-4">
          Watch a simulated DDoS attack unfold. During normal operation, traffic is steady and
          manageable. When the attack begins, malicious traffic dwarfs legitimate requests — your
          server can&apos;t tell them apart without dedicated filtering infrastructure.
        </p>
        <AttackTrafficViz />
      </ConceptVisualizer>

      <ConceptVisualizer title="L3/L4 vs L7 Attacks">
        <p className="text-sm text-muted-foreground mb-4">
          DDoS attacks target different layers of the network stack. Each layer requires different
          defenses. Click each layer to see common attack types, their characteristics, and how
          to defend against them.
        </p>
        <LayerAttackViz />
        <AhaMoment
          question="Why are L7 attacks harder to stop than L3/L4 attacks?"
          answer={
            <p>
              L3/L4 attacks use obviously malicious patterns — millions of SYN packets from spoofed
              IPs are easy to identify. L7 attacks use <em>legitimate-looking</em> HTTP requests.
              A single GET /search?q=shoes looks identical to real user traffic. It&apos;s only
              malicious in aggregate — 10,000 identical requests per second from different IPs.
              Defense requires understanding application behavior patterns, not just packet headers.
              This is why L7 attacks grew 74% year-over-year in 2025 — they&apos;re harder to filter
              and cheaper to launch.
            </p>
          }
        />
      </ConceptVisualizer>

      <ConceptVisualizer title="Defense Architecture — Layered Filtering">
        <p className="text-sm text-muted-foreground mb-4">
          DDoS defense works in layers. Each layer filters out a class of attacks before traffic reaches
          the next layer. The goal is for only clean, legitimate traffic to reach your origin server.
          Watch how 100 Gbps of attack traffic gets reduced to 3 Gbps of clean traffic.
        </p>
        <DefenseLayerViz />
      </ConceptVisualizer>

      <CorrectApproach title="Production Defense Stack">
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold">1. CDN with Anycast (absorb volumetric attacks)</h4>
            <p className="text-sm text-muted-foreground">
              Cloudflare (330+ PoPs, 296 Tbps capacity), AWS CloudFront, or Akamai. Anycast routing
              means your IP address is advertised from hundreds of locations simultaneously. A 100 Gbps
              attack targeting one IP gets split across 300 PoPs — each absorbing 333 Mbps, easily handled.
              This is why CDN providers can absorb attacks that would destroy any single server.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold">2. DDoS Scrubbing Service</h4>
            <p className="text-sm text-muted-foreground">
              AWS Shield Advanced ($3,000/month) provides L3-L7 protection with a 24/7 DDoS Response
              Team and cost protection (AWS credits your scaling costs during an attack). Cloudflare
              includes DDoS protection on all plans. These services use traffic profiling, machine
              learning, and threat intelligence to separate attack traffic from legitimate requests.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold">3. Web Application Firewall (WAF)</h4>
            <p className="text-sm text-muted-foreground">
              Inspects HTTP requests for malicious patterns: SQL injection, XSS payloads, known bot
              signatures, impossible request rates from single IPs. WAF rules can be custom or managed
              (auto-updated threat intelligence). Place it at the edge so malicious L7 requests never
              reach your origin.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold">4. Rate Limiting + Challenge Pages</h4>
            <p className="text-sm text-muted-foreground">
              Per-IP rate limits at the edge. Suspicious traffic gets JavaScript challenges (prove
              you&apos;re running a real browser) or CAPTCHA challenges. Cloudflare&apos;s &quot;Under
              Attack Mode&quot; adds a 5-second JavaScript challenge to every visitor — bots fail,
              humans pass automatically.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold">5. Origin Shielding</h4>
            <p className="text-sm text-muted-foreground">
              Hide your origin server&apos;s real IP. Only allow inbound traffic from your CDN&apos;s
              IP ranges using security groups or firewall rules. If attackers discover your origin IP
              through DNS history, email headers, SSL certificates, or error pages, they bypass all
              upstream defenses and hit you directly.
            </p>
          </div>
        </div>
      </CorrectApproach>

      <BeforeAfter
        before={{
          title: "Exposed Origin",
          content: (
            <div className="space-y-3">
              <div className="flex justify-center gap-3 flex-wrap">
                <ServerNode type="client" label="Botnet" status="unhealthy" />
                <span className="text-red-500 text-xs font-mono self-center">direct →</span>
                <ServerNode type="server" label="Origin" sublabel="Direct hit" status="unhealthy" />
              </div>
              <p className="text-sm text-muted-foreground">
                Traffic goes directly to your origin. A volumetric attack saturates your network
                link and no amount of software optimization helps. Even rejecting packets costs
                CPU at 50 Gbps.
              </p>
            </div>
          ),
        }}
        after={{
          title: "Layered Defense",
          content: (
            <div className="space-y-3">
              <div className="flex justify-center gap-3 flex-wrap">
                <ServerNode type="cloud" label="CDN" sublabel="Absorbs flood" status="healthy" />
                <ServerNode type="loadbalancer" label="WAF" sublabel="Filters L7" status="healthy" />
                <ServerNode type="server" label="Origin" sublabel="Clean traffic" status="healthy" />
              </div>
              <p className="text-sm text-muted-foreground">
                Attack traffic is absorbed by CDN anycast, filtered by WAF, and rate-limited at
                the edge. Only validated requests reach your origin. The origin IP is hidden.
              </p>
            </div>
          ),
        }}
      />

      <InteractiveDemo title="Attack Mitigation Simulator">
        {({ isPlaying, tick }) => {
          const phase = isPlaying ? tick % 8 : 0;
          const phases = [
            { name: "Normal", traffic: "5 Gbps", status: "Healthy", color: "text-emerald-400", load: 15 },
            { name: "Attack Begins", traffic: "20 Gbps", status: "CDN absorbing", color: "text-amber-400", load: 25 },
            { name: "Peak Attack", traffic: "80 Gbps", status: "Scrubbing active", color: "text-red-400", load: 35 },
            { name: "WAF Filtering", traffic: "80 Gbps in, 8 passed", status: "L7 rules active", color: "text-amber-400", load: 30 },
            { name: "Rate Limiting", traffic: "8 Gbps in, 4 passed", status: "Per-IP caps hit", color: "text-blue-400", load: 20 },
            { name: "Challenge Mode", traffic: "4 Gbps in, 2 passed", status: "JS challenges active", color: "text-violet-400", load: 15 },
            { name: "Mitigated", traffic: "2 Gbps clean", status: "Origin stable", color: "text-emerald-400", load: 12 },
            { name: "Attack Subsides", traffic: "5 Gbps normal", status: "All green", color: "text-emerald-400", load: 15 },
          ];
          const p = phases[phase];

          return (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Press play to simulate a DDoS attack and watch layered defenses respond in real time.
              </p>
              <div className="rounded-lg border border-border/50 bg-muted/20 p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className={cn("text-sm font-semibold", p.color)}>{p.name}</span>
                  <span className="text-[10px] font-mono text-muted-foreground">{p.traffic}</span>
                </div>
                <div className="w-full bg-muted/30 rounded-full h-4 overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-700",
                      phase >= 2 && phase <= 3 ? "bg-red-500" : phase >= 1 && phase <= 5 ? "bg-amber-500" : "bg-emerald-500"
                    )}
                    style={{ width: `${p.load}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-muted-foreground">Origin server load</span>
                  <span className={cn("font-medium", p.color)}>{p.status}</span>
                </div>
              </div>
              {phase >= 6 && (
                <ConversationalCallout type="tip">
                  Notice how the origin server load barely changed even during an 80 Gbps attack.
                  That&apos;s the power of upstream filtering — the attack was absorbed and filtered
                  before it reached the origin.
                </ConversationalCallout>
              )}
            </div>
          );
        }}
      </InteractiveDemo>

      <AhaMoment
        question="If I have auto-scaling, won't my infrastructure just scale up to handle a DDoS?"
        answer={
          <p>
            Auto-scaling responds to load, so it will try to scale up — and that&apos;s the problem.
            Scaling up to match a DDoS means you&apos;re paying for thousands of servers to serve bot
            traffic. A sustained attack could run up a six-figure cloud bill in hours. This is called
            &quot;Economic Denial of Sustainability&quot; (EDoS). AWS Shield Advanced includes cost
            protection — they credit your scaling costs during confirmed attacks. But the fundamental
            principle is: filter bad traffic before it triggers scaling, don&apos;t scale to match it.
          </p>
        }
      />

      <ConversationalCallout type="warning">
        Never expose your origin server&apos;s real IP address. Check that DNS records (look for A records
        pointing to origin), email headers (outbound emails may reveal origin), SSL certificates
        (certificate transparency logs show historical IPs), and error pages (stack traces may include
        internal IPs) don&apos;t leak it. Use tools like SecurityTrails to audit your DNS history.
        Attackers routinely scan for origin IPs to bypass CDN protection.
      </ConversationalCallout>

      <ConversationalCallout type="tip">
        In system design interviews, structure DDoS defense by layer: network (anycast, scrubbing centers),
        transport (SYN cookies, connection limits), and application (WAF, rate limiting, JS challenges).
        Show that you understand it&apos;s not a single solution but a layered architecture. Mention
        specific services (Cloudflare, AWS Shield) and their tradeoffs (cost, always-on vs on-demand,
        managed vs self-service).
      </ConversationalCallout>

      <KeyTakeaway
        points={[
          "DDoS attacks overwhelm infrastructure with distributed flood traffic. You can't solve this with better servers — a 50 Gbps flood saturates a 10 Gbps link regardless of your code.",
          "L3/L4 attacks target bandwidth and connection state (SYN/UDP floods). L7 attacks target application logic with legitimate-looking requests (HTTP floods, expensive queries). L7 attacks are growing fastest.",
          "Defense is layered: CDN with anycast absorbs volumetric floods across hundreds of PoPs. WAF filters malicious L7 patterns. Rate limiting caps per-client throughput. JS challenges stop bots.",
          "Hide your origin IP and only allow traffic from your CDN's IP ranges. A leaked origin IP bypasses all upstream defenses. Audit DNS history, email headers, and SSL certificates.",
          "Auto-scaling is not DDoS protection — it converts an availability problem into a billing problem (EDoS). Use AWS Shield Advanced cost protection or Cloudflare's included DDoS protection.",
        ]}
      />
    </div>
  );
}
