"use client";

import { useState, useMemo } from "react";
import { TopicHero } from "@/components/topic-hero";
import { KeyTakeaway } from "@/components/key-takeaway";
import { AhaMoment } from "@/components/aha-moment";
import { ConversationalCallout } from "@/components/conversational-callout";
import { BeforeAfter } from "@/components/before-after";
import { FlowDiagram, type FlowNode, type FlowEdge } from "@/components/flow-diagram";
import { LiveChart } from "@/components/live-chart";
import { Playground } from "@/components/playground";
import { useSimulation } from "@/hooks/use-simulation";
import { cn } from "@/lib/utils";
import { MarkerType } from "@xyflow/react";
import { WhyCare } from "@/components/why-care";
import { GlossaryTerm } from "@/components/glossary-term";
import { TopicQuiz } from "@/components/topic-quiz";
import type { QuizQuestion } from "@/components/topic-quiz";

// --- DNS Resolution Playground ---

const DNS_STEPS = [
  { key: "browser", label: "Browser types domain", detail: "You type \"google.com\" into the address bar and press Enter." },
  { key: "resolver", label: "Query DNS Resolver", detail: "Your browser asks your ISP's recursive DNS resolver: \"What IP is google.com?\"" },
  { key: "root", label: "Root DNS Server", detail: "The resolver asks a root server, which says: \"I don't know, but try the .com TLD server.\"" },
  { key: "tld", label: ".com TLD Server", detail: "The TLD server responds: \"Ask Google's authoritative nameserver at ns1.google.com.\"" },
  { key: "auth", label: "Authoritative DNS", detail: "Google's nameserver replies with the final answer: \"google.com is 142.250.80.46.\"" },
  { key: "resolved", label: "IP Address returned", detail: "The IP address travels back through the chain. Your browser now knows where to connect." },
];

const dnsTimingData = [
  { step: "Browser Cache", time: 1 },
  { step: "Resolver", time: 5 },
  { step: "Root DNS", time: 15 },
  { step: "TLD DNS", time: 25 },
  { step: "Auth DNS", time: 35 },
  { step: "Response", time: 10 },
];

function DnsPlayground() {
  const [domain, setDomain] = useState("google.com");
  const sim = useSimulation({ maxSteps: 6, intervalMs: 1200 });

  const statusForStep = (nodeStep: number): "healthy" | "warning" | "idle" => {
    if (sim.step > nodeStep) return "healthy";
    if (sim.step === nodeStep) return "warning";
    return "idle";
  };

  const dnsNodes: FlowNode[] = useMemo(() => [
    { id: "browser", type: "clientNode", position: { x: 0, y: 120 }, data: { label: "Browser", sublabel: domain, status: statusForStep(0), handles: { right: true } } },
    { id: "resolver", type: "serverNode", position: { x: 200, y: 120 }, data: { label: "DNS Resolver", sublabel: "ISP", status: statusForStep(1), handles: { left: true, right: true } } },
    { id: "root", type: "serverNode", position: { x: 400, y: 20 }, data: { label: "Root DNS", sublabel: ".", status: statusForStep(2), handles: { left: true, bottom: true } } },
    { id: "tld", type: "serverNode", position: { x: 400, y: 120 }, data: { label: "TLD DNS", sublabel: ".com", status: statusForStep(3), handles: { top: true, bottom: true } } },
    { id: "auth", type: "serverNode", position: { x: 400, y: 220 }, data: { label: "Auth DNS", sublabel: domain, status: statusForStep(4), handles: { top: true, left: true } } },
    { id: "ip", type: "cacheNode", position: { x: 200, y: 220 }, data: { label: "IP Address", sublabel: sim.step >= 5 ? "142.250.80.46" : "???", status: statusForStep(5), handles: { right: true, left: true } } },
  ], [sim.step, domain]);

  const edgeStyle = { strokeWidth: 2 };
  const activeEdge = { style: { ...edgeStyle, stroke: "#8b5cf6" }, animated: true };
  const doneEdge = { style: { ...edgeStyle, stroke: "#10b981" }, animated: false };
  const idleEdge = { style: { ...edgeStyle, stroke: "#555", opacity: 0.3 }, animated: false };

  const edgeState = (step: number) => sim.step > step ? doneEdge : sim.step === step ? activeEdge : idleEdge;

  const dnsEdges: FlowEdge[] = useMemo(() => [
    { id: "e1", source: "browser", target: "resolver", ...edgeState(1), markerEnd: { type: MarkerType.ArrowClosed } },
    { id: "e2", source: "resolver", target: "root", ...edgeState(2), markerEnd: { type: MarkerType.ArrowClosed } },
    { id: "e3", source: "root", target: "tld", ...edgeState(3), markerEnd: { type: MarkerType.ArrowClosed } },
    { id: "e4", source: "tld", target: "auth", ...edgeState(4), markerEnd: { type: MarkerType.ArrowClosed } },
    { id: "e5", source: "auth", target: "ip", ...edgeState(5), markerEnd: { type: MarkerType.ArrowClosed } },
    { id: "e6", source: "ip", target: "browser", ...edgeState(5), markerEnd: { type: MarkerType.ArrowClosed } },
  ], [sim.step]);

  const currentExplanation = sim.step > 0 && sim.step <= DNS_STEPS.length
    ? DNS_STEPS[sim.step - 1]
    : null;

  return (
    <Playground
      title="DNS Resolution Playground"
      simulation={sim}
      hints={["Try changing the domain to see how the resolver path stays the same regardless of the destination."]}
      canvas={
        <div className="flex flex-col h-full">
          <div className="px-4 pt-3 pb-1">
            <label className="text-xs text-muted-foreground block mb-1">Domain to resolve:</label>
            <input
              type="text"
              value={domain}
              onChange={(e) => { setDomain(e.target.value); sim.reset(); }}
              className="bg-muted/30 border border-border/50 rounded-md px-3 py-1.5 text-sm font-mono w-full max-w-xs focus:outline-none focus:ring-1 focus:ring-violet-500/40"
              placeholder="google.com"
            />
          </div>
          <div className="flex-1">
            <FlowDiagram nodes={dnsNodes} edges={dnsEdges} fitView interactive={false} allowDrag={false} minHeight={280} />
          </div>
        </div>
      }
      explanation={(state) => (
        <div className="space-y-4">
          <div>
            <h4 className="text-xs font-semibold text-violet-400 uppercase tracking-wider mb-2">Step-by-step</h4>
            {DNS_STEPS.map((s, i) => (
              <div
                key={s.key}
                className={cn(
                  "flex items-start gap-2 rounded-md px-2 py-1.5 mb-1 transition-all text-xs",
                  state.step > i ? "text-emerald-400 bg-emerald-500/5" :
                  state.step === i ? "text-violet-300 bg-violet-500/10 ring-1 ring-violet-500/20" :
                  "text-muted-foreground/40"
                )}
              >
                <span className="font-mono font-bold w-4 shrink-0">{i + 1}</span>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
          {currentExplanation && (
            <div className="rounded-lg bg-violet-500/5 border border-violet-500/15 p-3">
              <p className="text-xs text-violet-300">{currentExplanation.detail}</p>
            </div>
          )}
          {state.step >= 6 && (
            <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/15 p-3">
              <p className="text-xs text-emerald-400 font-medium">
                Resolved {domain} to 142.250.80.46 in ~91ms total
              </p>
            </div>
          )}
        </div>
      )}
    />
  );
}

// --- TCP Handshake Playground ---

const TCP_PHASES = [
  { label: "SYN", from: "client", detail: "Client sends SYN packet: \"I'd like to connect. My sequence number is 1000.\"" },
  { label: "SYN-ACK", from: "server", detail: "Server replies with SYN-ACK: \"Got it! My sequence number is 5000. I acknowledge your 1001.\"" },
  { label: "ACK", from: "client", detail: "Client confirms with ACK: \"I acknowledge your 5001. We're in sync!\"" },
  { label: "Connected!", from: "both", detail: "Three-way handshake complete. Both sides have confirmed bidirectional communication." },
  { label: "GET /", from: "client", detail: "Client sends HTTP request through the established TCP connection." },
  { label: "200 OK", from: "server", detail: "Server sends back the response. Data flows reliably over the connection." },
];

function TcpHandshakePlayground() {
  const sim = useSimulation({ maxSteps: 6, intervalMs: 1000 });

  const tcpNodes: FlowNode[] = useMemo(() => {
    const clientStatus: "healthy" | "warning" | "idle" = sim.step >= 3 ? "healthy" : sim.step >= 1 ? "warning" : "idle";
    const serverStatus: "healthy" | "warning" | "idle" = sim.step >= 3 ? "healthy" : sim.step >= 2 ? "warning" : "idle";
    return [
      { id: "client", type: "clientNode", position: { x: 50, y: 100 }, data: { label: "Client", sublabel: "Browser", status: clientStatus, handles: { right: true } } },
      { id: "server", type: "serverNode", position: { x: 400, y: 100 }, data: { label: "Server", sublabel: "142.250.80.46", status: serverStatus, handles: { left: true } } },
    ];
  }, [sim.step]);

  const packetColorMap: Record<string, string> = {
    syn: "#3b82f6",
    synack: "#10b981",
    ack: "#8b5cf6",
    connected: "#10b981",
    request: "#3b82f6",
    response: "#10b981",
  };

  const tcpEdges: FlowEdge[] = useMemo(() => {
    const edges: FlowEdge[] = [];
    if (sim.step >= 1) {
      edges.push({
        id: "syn", source: "client", target: "server",
        label: "SYN (seq=1000)",
        style: { stroke: packetColorMap.syn, strokeWidth: 2 },
        animated: sim.step === 1,
        markerEnd: { type: MarkerType.ArrowClosed, color: packetColorMap.syn },
      });
    }
    if (sim.step >= 2) {
      edges.push({
        id: "synack", source: "server", target: "client",
        label: "SYN-ACK (seq=5000, ack=1001)",
        style: { stroke: packetColorMap.synack, strokeWidth: 2 },
        animated: sim.step === 2,
        markerEnd: { type: MarkerType.ArrowClosed, color: packetColorMap.synack },
      });
    }
    if (sim.step >= 3) {
      edges.push({
        id: "ack", source: "client", target: "server",
        label: sim.step === 3 ? "ACK (ack=5001)" : sim.step >= 5 ? "GET / HTTP/1.1" : "Connected",
        style: { stroke: sim.step >= 4 ? packetColorMap.request : packetColorMap.ack, strokeWidth: 2 },
        animated: sim.step === 3 || sim.step === 5,
        markerEnd: { type: MarkerType.ArrowClosed, color: packetColorMap.ack },
      });
    }
    if (sim.step >= 6) {
      edges.push({
        id: "response", source: "server", target: "client",
        label: "200 OK + HTML",
        style: { stroke: packetColorMap.response, strokeWidth: 2 },
        animated: true,
        markerEnd: { type: MarkerType.ArrowClosed, color: packetColorMap.response },
      });
    }
    return edges;
  }, [sim.step]);

  return (
    <Playground
      title="TCP Three-Way Handshake"
      simulation={sim}
      hints={["Watch the sequence numbers in each packet — they prove both sides can send and receive."]}
      canvas={
        <FlowDiagram nodes={tcpNodes} edges={tcpEdges} fitView interactive={false} allowDrag={false} minHeight={260} />
      }
      explanation={(state) => (
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-violet-400 uppercase tracking-wider">Handshake Phases</h4>
          {TCP_PHASES.map((phase, i) => (
            <div
              key={phase.label}
              className={cn(
                "rounded-md px-3 py-2 border transition-all text-xs",
                state.step > i ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400" :
                state.step === i ? "border-violet-500/30 bg-violet-500/10 text-violet-300" :
                "border-border/20 text-muted-foreground/30"
              )}
            >
              <div className="flex items-center gap-2 mb-0.5">
                <span className={cn(
                  "font-mono font-bold text-[10px] px-1.5 py-0.5 rounded",
                  phase.from === "client" ? "bg-blue-500/15 text-blue-400" :
                  phase.from === "server" ? "bg-emerald-500/15 text-emerald-400" :
                  "bg-violet-500/15 text-violet-400"
                )}>
                  {phase.label}
                </span>
                <span className="text-muted-foreground/50">
                  {phase.from === "both" ? "" : `from ${phase.from}`}
                </span>
              </div>
              {state.step === i && (
                <p className="text-[11px] mt-1 text-muted-foreground">{phase.detail}</p>
              )}
            </div>
          ))}
        </div>
      )}
    />
  );
}

// --- HTTP Request Journey ---

const HTTP_STAGES = [
  { key: "dns", label: "DNS Lookup", time: 50, detail: "Resolving domain to IP address" },
  { key: "tcp", label: "TCP Handshake", time: 30, detail: "SYN -> SYN-ACK -> ACK" },
  { key: "tls", label: "TLS Handshake", time: 100, detail: "Negotiating encryption keys" },
  { key: "request", label: "HTTP Request", time: 10, detail: "GET / HTTP/1.1 sent" },
  { key: "server", label: "Server Processing", time: 80, detail: "Server generates response" },
  { key: "response", label: "Response Transfer", time: 40, detail: "200 OK + 45KB HTML" },
  { key: "render", label: "Browser Render", time: 60, detail: "Parsing and painting" },
];

function HttpJourneyPlayground() {
  const sim = useSimulation({ maxSteps: 7, intervalMs: 800 });

  const httpNodes: FlowNode[] = useMemo(() => {
    const s = sim.step;
    const nodeStatus = (step: number): "healthy" | "warning" | "idle" =>
      s > step ? "healthy" : s === step ? "warning" : "idle";

    return [
      { id: "browser", type: "clientNode", position: { x: 0, y: 100 }, data: { label: "Browser", status: nodeStatus(0), handles: { right: true } } },
      { id: "dns", type: "serverNode", position: { x: 150, y: 20 }, data: { label: "DNS", sublabel: "50ms", status: nodeStatus(0), handles: { left: true, right: true } } },
      { id: "tcp", type: "gatewayNode", position: { x: 300, y: 20 }, data: { label: "TCP", sublabel: "30ms", status: nodeStatus(1), handles: { left: true, right: true } } },
      { id: "tls", type: "gatewayNode", position: { x: 450, y: 20 }, data: { label: "TLS", sublabel: "100ms", status: nodeStatus(2), handles: { left: true, bottom: true } } },
      { id: "server", type: "serverNode", position: { x: 450, y: 180 }, data: { label: "Server", sublabel: "80ms", status: nodeStatus(4), handles: { top: true, left: true } } },
      { id: "response", type: "cacheNode", position: { x: 225, y: 180 }, data: { label: "Response", sublabel: "40ms", status: nodeStatus(5), handles: { right: true, left: true } } },
      { id: "render", type: "clientNode", position: { x: 0, y: 180 }, data: { label: "Render", sublabel: "60ms", status: nodeStatus(6), handles: { right: true } } },
    ];
  }, [sim.step]);

  const httpEdges: FlowEdge[] = useMemo(() => {
    const s = sim.step;
    const mkEdge = (id: string, src: string, tgt: string, step: number): FlowEdge => ({
      id, source: src, target: tgt,
      animated: s === step,
      style: { strokeWidth: 2, stroke: s > step ? "#10b981" : s === step ? "#8b5cf6" : "#555", opacity: s >= step ? 1 : 0.2 },
      markerEnd: { type: MarkerType.ArrowClosed },
    });
    return [
      mkEdge("e1", "browser", "dns", 0),
      mkEdge("e2", "dns", "tcp", 1),
      mkEdge("e3", "tcp", "tls", 2),
      mkEdge("e4", "tls", "server", 3),
      mkEdge("e5", "server", "response", 5),
      mkEdge("e6", "response", "render", 6),
    ];
  }, [sim.step]);

  const waterfallData = HTTP_STAGES.map((stage) => ({
    phase: stage.label,
    time: stage.time,
  }));

  return (
    <Playground
      title="HTTP Request Lifecycle"
      simulation={sim}
      canvas={
        <div className="flex flex-col h-full">
          <div className="flex-1">
            <FlowDiagram nodes={httpNodes} edges={httpEdges} fitView interactive={false} allowDrag={false} minHeight={260} />
          </div>
          {sim.step >= 7 && (
            <div className="px-4 pb-3">
              <p className="text-xs text-emerald-400 font-medium text-center">
                Total: {HTTP_STAGES.reduce((a, s) => a + s.time, 0)}ms — page loaded!
              </p>
            </div>
          )}
        </div>
      }
      explanation={(state) => (
        <div className="space-y-4">
          <h4 className="text-xs font-semibold text-violet-400 uppercase tracking-wider">Request Waterfall</h4>
          <div className="space-y-1">
            {HTTP_STAGES.map((stage, i) => {
              const pct = (stage.time / 120) * 100;
              return (
                <div key={stage.key} className="flex items-center gap-2">
                  <span className={cn(
                    "text-[10px] font-mono w-12 text-right shrink-0",
                    state.step > i ? "text-emerald-400" : state.step === i ? "text-violet-300" : "text-muted-foreground/30"
                  )}>
                    {stage.time}ms
                  </span>
                  <div
                    className={cn(
                      "h-5 rounded flex items-center px-2 text-[10px] font-medium transition-all duration-300",
                      state.step > i ? "bg-emerald-500/15 text-emerald-400" :
                      state.step === i ? "bg-violet-500/15 text-violet-300" :
                      "bg-muted/20 text-muted-foreground/30"
                    )}
                    style={{ width: `${Math.max(pct, 30)}%` }}
                  >
                    {stage.label}
                  </div>
                </div>
              );
            })}
          </div>
          {state.step > 0 && state.step <= HTTP_STAGES.length && (
            <div className="rounded-lg bg-violet-500/5 border border-violet-500/15 p-3">
              <p className="text-xs text-violet-300">{HTTP_STAGES[state.step - 1].detail}</p>
            </div>
          )}
        </div>
      )}
    />
  );
}

// --- UDP vs TCP Comparison ---

function UdpVsTcpComparison() {
  const [protocol, setProtocol] = useState<"tcp" | "udp">("tcp");

  const tcpPackets = [
    { packet: "Packet 1", status: "delivered", time: 10 },
    { packet: "Packet 2", status: "delivered", time: 20 },
    { packet: "Packet 3", status: "lost", time: 30 },
    { packet: "Packet 3", status: "retransmit", time: 45 },
    { packet: "Packet 4", status: "delivered", time: 55 },
  ];

  const udpPackets = [
    { packet: "Packet 1", status: "delivered", time: 5 },
    { packet: "Packet 2", status: "delivered", time: 10 },
    { packet: "Packet 3", status: "lost", time: 15 },
    { packet: "Packet 4", status: "delivered", time: 20 },
    { packet: "Packet 5", status: "delivered", time: 25 },
  ];

  const statusColorMap: Record<string, string> = {
    delivered: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    lost: "bg-red-500/15 text-red-400 border-red-500/20",
    retransmit: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  };

  const packets = protocol === "tcp" ? tcpPackets : udpPackets;

  return (
    <div className="rounded-xl border border-border/50 overflow-hidden">
      <div className="flex border-b border-border/50">
        <button
          onClick={() => setProtocol("tcp")}
          className={cn(
            "flex-1 px-4 py-2.5 text-sm font-medium transition-colors",
            protocol === "tcp" ? "bg-blue-500/10 text-blue-400 border-b-2 border-blue-500" : "text-muted-foreground hover:text-foreground"
          )}
        >
          TCP (Reliable)
        </button>
        <button
          onClick={() => setProtocol("udp")}
          className={cn(
            "flex-1 px-4 py-2.5 text-sm font-medium transition-colors",
            protocol === "udp" ? "bg-emerald-500/10 text-emerald-400 border-b-2 border-emerald-500" : "text-muted-foreground hover:text-foreground"
          )}
        >
          UDP (Fast)
        </button>
      </div>
      <div className="p-4 space-y-3">
        <p className="text-xs text-muted-foreground">
          {protocol === "tcp"
            ? "TCP guarantees every packet arrives in order. If one is lost, it stops and retransmits before continuing."
            : "UDP fires packets as fast as possible. If one is lost, it moves on. Speed over reliability."}
        </p>
        <div className="space-y-1.5">
          {packets.map((p, i) => (
            <div key={`${p.packet}-${p.status}-${i}`} className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-muted-foreground/50 w-8 text-right">{p.time}ms</span>
              <div className={cn("flex-1 rounded-md border px-3 py-1.5 text-xs font-medium", statusColorMap[p.status])}>
                {p.packet} {p.status === "lost" ? "(LOST)" : p.status === "retransmit" ? "(RETRANSMIT)" : ""}
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 pt-2 border-t border-border/30">
          <div className="text-xs">
            <span className="text-muted-foreground">Total time: </span>
            <span className={cn("font-mono font-bold", protocol === "tcp" ? "text-blue-400" : "text-emerald-400")}>
              {protocol === "tcp" ? "55ms" : "25ms"}
            </span>
          </div>
          <div className="text-xs">
            <span className="text-muted-foreground">Packets lost: </span>
            <span className="font-mono font-bold text-red-400">1</span>
          </div>
          <div className="text-xs">
            <span className="text-muted-foreground">Data complete: </span>
            <span className={cn("font-mono font-bold", protocol === "tcp" ? "text-emerald-400" : "text-amber-400")}>
              {protocol === "tcp" ? "100%" : "80%"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Main Page ---

export default function HowTheInternetWorksPage() {
  return (
    <div className="space-y-8">
      <TopicHero
        title="How the Internet Works"
        subtitle="Every time you type a URL and press Enter, a chain of events unfolds in milliseconds. Understanding this chain is the foundation of all system design."
        difficulty="beginner"
      />

      <WhyCare>
        Every time you type a URL, your browser makes dozens of behind-the-scenes calls just to find the right server. Understanding this chain is the first step to building fast, reliable web applications.
      </WhyCare>

      <ConversationalCallout type="question">
        What actually happens in the 200 milliseconds between pressing Enter and seeing a webpage?
        There are at least 7 invisible steps, and each one can fail independently. Let&apos;s trace them
        with interactive playgrounds.
      </ConversationalCallout>

      {/* DNS Resolution */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight">DNS Resolution — The Internet&apos;s Phone Book</h2>
        <p className="text-sm text-muted-foreground">
          Your browser doesn&apos;t know that <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">google.com</code> lives
          at <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">142.250.80.46</code>. <GlossaryTerm term="dns">DNS</GlossaryTerm> is the globally distributed
          system that maps human-friendly domain names to machine-readable <GlossaryTerm term="ip address">IP addresses</GlossaryTerm>. Type a domain
          below, hit play, and watch the lookup chain animate step by step.
        </p>
        <DnsPlayground />

        <LiveChart
          type="bar"
          data={dnsTimingData}
          dataKeys={{ x: "step", y: "time", label: "Resolution Time" }}
          height={180}
          unit="ms"
          referenceLines={[{ y: 50, label: "Typical cached", color: "#10b981" }]}
        />

        <ConversationalCallout type="tip">
          DNS uses UDP by default because queries are small and speed matters more than
          guaranteed delivery. If the response is too large (&gt;512 bytes), it falls back to TCP.
        </ConversationalCallout>
      </section>

      {/* TCP Handshake */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight">TCP Three-Way Handshake</h2>
        <p className="text-sm text-muted-foreground">
          Before any data is exchanged, client and server need to agree they can communicate.
          <GlossaryTerm term="tcp">TCP</GlossaryTerm> establishes this trust with three messages — a polite introduction before the conversation.
          Step through the handshake below, then watch data transfer begin.
        </p>
        <TcpHandshakePlayground />

        <AhaMoment
          question="Why three messages instead of two?"
          answer={
            <p>
              Two messages only confirm the client can reach the server. The third (ACK) confirms
              the server can reach the client <em>back</em>. Both directions must be verified for
              reliable two-way communication. It also synchronizes sequence numbers so both sides
              can track which bytes have been sent and received.
            </p>
          }
        />
      </section>

      {/* HTTP Request Journey */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight">The Full HTTP Request Journey</h2>
        <p className="text-sm text-muted-foreground">
          DNS, TCP, and TLS are just the opening act. Watch the complete lifecycle of
          typing a URL to seeing a rendered page. Each node shows its latency contribution.
        </p>
        <HttpJourneyPlayground />

        <ConversationalCallout type="tip">
          In every system design interview, trace the request path first: DNS, TCP, TLS, HTTP, then your
          application. This shows the interviewer you understand the full stack before diving into
          application-level design.
        </ConversationalCallout>
      </section>

      {/* UDP vs TCP */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight">UDP vs TCP — Reliability vs Speed</h2>
        <p className="text-sm text-muted-foreground">
          Not all network traffic needs guaranteed delivery. <GlossaryTerm term="udp">UDP</GlossaryTerm> sacrifices reliability for speed. Toggle between the two protocols
          to see how they handle packet loss differently.
        </p>
        <UdpVsTcpComparison />

        <AhaMoment
          question="Why does video streaming tolerate packet loss?"
          answer={
            <p>
              UDP sacrifices reliability for speed — a dropped video frame is better than buffering
              while TCP retransmits. This is why live streams and video calls use UDP: a slightly
              glitchy frame is imperceptible, but a half-second freeze ruins the experience. It is
              also why QUIC (the protocol behind HTTP/3) is built on UDP — it gets UDP&apos;s speed
              while adding its own reliability layer on top.
            </p>
          }
        />
      </section>

      {/* Debugging mental model */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight">Building a Debugging Mental Model</h2>
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
                <li>Check status code to identify issue</li>
                <li>Fix the specific broken layer</li>
              </ul>
            ),
          }}
        />
      </section>

      <TopicQuiz questions={[
        {
          question: "What does DNS do?",
          options: ["Encrypts web traffic", "Translates domain names to IP addresses", "Compresses web pages", "Filters malicious requests"],
          correctIndex: 1,
          explanation: "DNS (Domain Name System) converts human-readable names like google.com into IP addresses like 142.250.80.46 that computers use to find each other."
        },
        {
          question: "What happens if a DNS resolver doesn't have the answer cached?",
          options: ["The request fails", "It asks the root DNS server", "It guesses the IP address", "It redirects to a different domain"],
          correctIndex: 1,
          explanation: "The resolver follows the DNS hierarchy: root server, then TLD server, then authoritative server, each getting closer to the final answer."
        },
        {
          question: "Why is DNS caching important?",
          options: ["It makes websites more secure", "It reduces repeated lookups and speeds up page loads", "It prevents DDoS attacks", "It encrypts DNS responses"],
          correctIndex: 1,
          explanation: "Without caching, every single page visit would require a full DNS lookup chain, adding 50-200ms of latency each time."
        },
      ]} />

      <KeyTakeaway
        points={[
          "A web request is a pipeline: DNS, TCP, TLS, HTTP, Response. Each step depends on the previous one.",
          "DNS is hierarchical: browser cache, OS cache, resolver, root, TLD, authoritative nameserver.",
          "TCP uses a three-way handshake (SYN, SYN-ACK, ACK) to establish reliable bidirectional communication.",
          "UDP trades reliability for speed — critical for real-time applications like video and gaming.",
          "Understanding the request pipeline is the foundation for debugging and designing distributed systems.",
        ]}
      />
    </div>
  );
}
