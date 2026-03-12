"use client";

import { useState, useMemo } from "react";
import { TopicHero } from "@/components/topic-hero";
import { KeyTakeaway } from "@/components/key-takeaway";
import { AhaMoment } from "@/components/aha-moment";
import { ConversationalCallout } from "@/components/conversational-callout";
import { FlowDiagram, type FlowNode, type FlowEdge } from "@/components/flow-diagram";
import { LiveChart } from "@/components/live-chart";
import { Playground } from "@/components/playground";
import { useSimulation } from "@/hooks/use-simulation";
import { cn } from "@/lib/utils";
import { MarkerType } from "@xyflow/react";

// --- OSI layer data ---

const osiLayers = [
  { num: 7, name: "Application",  protocols: "HTTP, DNS, SMTP, gRPC",       headerSize: 0,  color: "#a855f7", example: "GET /api/users HTTP/1.1\nHost: example.com\nAccept: application/json",         desc: "Where your code lives. HTTP requests, API calls, DNS lookups all happen here." },
  { num: 6, name: "Presentation", protocols: "TLS/SSL, UTF-8, gzip",        headerSize: 5,  color: "#6366f1", example: "TLS record header (5B)\nEncrypt payload with AES-256-GCM\nAdd MAC for integrity",   desc: "Encryption, compression, character encoding. TLS lives here." },
  { num: 5, name: "Session",      protocols: "Sockets, NetBIOS",            headerSize: 0,  color: "#3b82f6", example: "Open TCP socket: fd=7\nKeep-alive ping every 30s\nHandle reconnect on drop",    desc: "Manages connections: open, keep alive, close, and reconnect." },
  { num: 4, name: "Transport",    protocols: "TCP, UDP",                    headerSize: 20, color: "#06b6d4", example: "SrcPort:49152 DstPort:443\nSeq:1001 Ack:2001 Flags:ACK\nWindow:65535",          desc: "Port numbers, reliable delivery (TCP) or raw speed (UDP)." },
  { num: 3, name: "Network",      protocols: "IP, ICMP, ARP",               headerSize: 20, color: "#22c55e", example: "Src: 192.168.1.5  Dst: 93.184.216.34\nTTL: 64  Protocol: TCP",                 desc: "IP addressing and routing. Decides how packets hop from host to host." },
  { num: 2, name: "Data Link",    protocols: "Ethernet, Wi-Fi",             headerSize: 14, color: "#f59e0b", example: "Dst MAC: aa:bb:cc:dd:ee:ff\nSrc MAC: 11:22:33:44:55:66\nEtherType: 0x0800",    desc: "MAC addresses and local frames. Gets bits across one hop." },
  { num: 1, name: "Physical",     protocols: "Ethernet cable, Wi-Fi, fiber", headerSize: 8, color: "#ef4444", example: "10101010 10101010 (preamble)\n... bits as voltage or light ...\n10101011 (SFD)", desc: "Raw bits on copper, fiber, or radio. Volts, photons, and radio waves." },
];

const layerRingStyles = [
  "ring-purple-500/40 bg-purple-500/10 text-purple-400",
  "ring-indigo-500/40 bg-indigo-500/10 text-indigo-400",
  "ring-blue-500/40 bg-blue-500/10 text-blue-400",
  "ring-cyan-500/40 bg-cyan-500/10 text-cyan-400",
  "ring-green-500/40 bg-green-500/10 text-green-400",
  "ring-amber-500/40 bg-amber-500/10 text-amber-400",
  "ring-red-500/40 bg-red-500/10 text-red-400",
];

// --- Port database ---

const portDatabase: Record<number, { name: string; proto: string; desc: string; cat: string }> = {
  22:    { name: "SSH",        proto: "TCP",     desc: "Secure Shell — remote terminal access",     cat: "Infra" },
  25:    { name: "SMTP",       proto: "TCP",     desc: "Sending email between mail servers",        cat: "Infra" },
  53:    { name: "DNS",        proto: "TCP/UDP", desc: "Domain Name System — hostname to IP",       cat: "Infra" },
  80:    { name: "HTTP",       proto: "TCP",     desc: "Unencrypted web traffic",                   cat: "Web"  },
  443:   { name: "HTTPS",      proto: "TCP",     desc: "Encrypted web traffic over TLS",            cat: "Web"  },
  3000:  { name: "Dev Server", proto: "TCP",     desc: "Default for Node.js / Next.js local dev",   cat: "Web"  },
  3306:  { name: "MySQL",      proto: "TCP",     desc: "MySQL / MariaDB database server",           cat: "DB"   },
  5432:  { name: "PostgreSQL", proto: "TCP",     desc: "PostgreSQL relational database",            cat: "DB"   },
  5672:  { name: "RabbitMQ",   proto: "TCP",     desc: "RabbitMQ AMQP message broker",              cat: "Msg"  },
  6379:  { name: "Redis",      proto: "TCP",     desc: "Redis in-memory cache and key-value store", cat: "DB"   },
  8080:  { name: "Alt HTTP",   proto: "TCP",     desc: "Alt HTTP — proxies and dev servers",        cat: "Web"  },
  9092:  { name: "Kafka",      proto: "TCP",     desc: "Apache Kafka distributed event broker",     cat: "Msg"  },
  27017: { name: "MongoDB",    proto: "TCP",     desc: "MongoDB document database",                 cat: "DB"   },
};

const catBadge: Record<string, string> = {
  Web:  "bg-blue-500/10 text-blue-400 border-blue-500/30",
  Infra:"bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  DB:   "bg-amber-500/10 text-amber-400 border-amber-500/30",
  Msg:  "bg-purple-500/10 text-purple-400 border-purple-500/30",
};

// --- Overhead chart data ---

const overheadData = [
  { layer: "App",      payload: 1460, headers: 0  },
  { layer: "TLS",      payload: 1460, headers: 5  },
  { layer: "TCP",      payload: 1460, headers: 25 },
  { layer: "IP",       payload: 1460, headers: 45 },
  { layer: "Ethernet", payload: 1460, headers: 59 },
  { layer: "Physical", payload: 1460, headers: 67 },
];

// --- TCP vs UDP protocol steps ---

type ProtocolMode = "tcp" | "udp";
type Step = { label: string; dir: "toServer" | "toClient"; note?: string };

const tcpSteps: Step[] = [
  { label: "SYN →",     dir: "toServer", note: "Client initiates" },
  { label: "← SYN-ACK", dir: "toClient", note: "Server acknowledges" },
  { label: "ACK →",     dir: "toServer", note: "Connection open!" },
  { label: "DATA →",    dir: "toServer", note: "Payload segment" },
  { label: "← ACK",     dir: "toClient", note: "Server confirms receipt" },
  { label: "FIN →",     dir: "toServer", note: "Client closes" },
  { label: "← FIN-ACK", dir: "toClient", note: "Fully closed" },
];

const udpSteps: Step[] = [
  { label: "Datagram 1 →", dir: "toServer", note: "No handshake" },
  { label: "Datagram 2 →", dir: "toServer", note: "Fire and forget" },
  { label: "Datagram 3 →", dir: "toServer", note: "Packet lost!" },
  { label: "Datagram 4 →", dir: "toServer", note: "No retransmit" },
  { label: "Datagram 5 →", dir: "toServer", note: "Out-of-order ok" },
];

// --- OSI FlowDiagram nodes / edges builder ---

function buildOSIFlow(selectedIdx: number): { nodes: FlowNode[]; edges: FlowEdge[] } {
  const layer = osiLayers[selectedIdx];
  const color = layer.color;
  const edgeBase = { animated: true, style: { stroke: color, strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color }, labelStyle: { fontSize: 10, fill: "#a1a1aa" }, labelBgStyle: { fill: "transparent" } };
  return {
    nodes: [
      { id: "client", type: "clientNode", position: { x: 30, y: 120 }, data: { label: "Your App", sublabel: "sends data", status: "healthy", handles: { right: true } } },
      { id: "wire",   type: "serverNode", position: { x: 250, y: 35 }, data: { label: `L${layer.num}: ${layer.name}`, sublabel: layer.protocols, status: "healthy", metrics: layer.headerSize > 0 ? [{ label: "overhead", value: `+${layer.headerSize}B` }] : undefined, handles: { left: true, right: true, top: true, bottom: true } } },
      { id: "server", type: "serverNode", position: { x: 470, y: 120 }, data: { label: "Remote", sublabel: "receives", status: "idle", handles: { left: true } } },
    ],
    edges: [
      { id: "c-w", source: "client", target: "wire",   ...edgeBase, label: "packet" },
      { id: "w-s", source: "wire",   target: "server", ...edgeBase, label: layer.headerSize > 0 ? `+${layer.headerSize}B header` : "pass-through" },
    ],
  };
}

// --- OSI Layer Explorer ---

function OSILayerExplorer() {
  const [sel, setSel] = useState(0);
  const layer = osiLayers[sel];
  const ringStyle = layerRingStyles[sel];

  const { nodes, edges } = useMemo(() => buildOSIFlow(sel), [sel]);

  // Running overhead total as we go down layers
  const cumulativeOverhead = useMemo(() => {
    let total = 0;
    return osiLayers.map((l) => { total += l.headerSize; return total; });
  }, []);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Click a layer to see what it adds to your packet and how it fits in the flow.
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Layer list */}
        <div className="space-y-1">
          {osiLayers.map((l, i) => {
            const ring = layerRingStyles[i];
            const active = sel === i;
            return (
              <button
                key={l.num}
                onClick={() => setSel(i)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border ring-1 transition-all text-left group",
                  active
                    ? ring + " border-transparent"
                    : "bg-muted/10 border-border/30 ring-transparent hover:ring-border/20"
                )}
              >
                <span className={cn(
                  "text-[11px] font-mono font-bold w-5 shrink-0",
                  active ? "" : "text-muted-foreground/40"
                )}>L{l.num}</span>
                <div
                  className="size-2 rounded-full shrink-0 transition-opacity"
                  style={{ backgroundColor: active ? l.color : undefined }}
                />
                <div className="flex-1 min-w-0">
                  <span className={cn("text-xs font-semibold", active ? "text-foreground" : "text-muted-foreground/60")}>
                    {l.name}
                  </span>
                  <span className={cn("text-[10px] ml-2", active ? "text-muted-foreground" : "text-muted-foreground/30")}>
                    {l.protocols}
                  </span>
                </div>
                {l.headerSize > 0 && (
                  <span className={cn(
                    "text-[10px] font-mono shrink-0 px-1.5 py-0.5 rounded",
                    active ? "bg-black/20 text-foreground" : "text-muted-foreground/20"
                  )}>
                    +{l.headerSize}B
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Detail panel */}
        <div className="space-y-3">
          {/* Flow diagram showing this layer */}
          <div className="rounded-lg border border-border/30 overflow-hidden" style={{ minHeight: 160 }}>
            <FlowDiagram nodes={nodes} edges={edges} interactive={false} allowDrag={false} minHeight={155} />
          </div>

          {/* Layer info */}
          <div className={cn("rounded-lg border p-3 space-y-2 ring-1", ringStyle)}>
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full shrink-0" style={{ backgroundColor: layer.color }} />
              <h4 className="text-sm font-semibold text-foreground">
                Layer {layer.num}: {layer.name}
              </h4>
              {cumulativeOverhead[sel] > 0 && (
                <span className="ml-auto text-[10px] font-mono text-muted-foreground">
                  total overhead: +{cumulativeOverhead[sel]}B
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{layer.desc}</p>
            <div className="bg-black/20 rounded-md p-2">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 mb-1">Packet at this layer</p>
              <pre className="text-[11px] font-mono text-foreground/80 whitespace-pre-wrap">{layer.example}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- TCP vs UDP Playground ---

function TCPvsUDPPlayground() {
  const [mode, setMode] = useState<ProtocolMode>("tcp");
  const steps = mode === "tcp" ? tcpSteps : udpSteps;
  const sim = useSimulation({ intervalMs: 900, maxSteps: steps.length });

  const handleSwitch = (m: ProtocolMode) => { setMode(m); sim.reset(); };

  const tcpColor = "#3b82f6";
  const udpColor = "#22c55e";
  const activeColor = mode === "tcp" ? tcpColor : udpColor;

  const nodes: FlowNode[] = useMemo(() => [
    {
      id: "client",
      type: "clientNode",
      position: { x: 40, y: 80 },
      data: {
        label: "Client",
        sublabel: mode === "tcp" ? "TCP sender" : "UDP sender",
        status: sim.tick > 0 ? "healthy" : "idle",
        handles: { right: true },
      },
    },
    {
      id: "server",
      type: "serverNode",
      position: { x: 390, y: 80 },
      data: {
        label: "Server",
        sublabel: mode === "tcp" ? "reliable recv" : "best-effort recv",
        status: sim.tick >= (mode === "tcp" ? 3 : 1) ? "healthy" : "idle",
        handles: { left: true },
      },
    },
  ], [sim.tick, mode]);

  const edges: FlowEdge[] = useMemo(() => {
    if (sim.tick === 0) return [];
    const currentStep = steps[sim.tick - 1];
    if (!currentStep) return [];
    const isLost = mode === "udp" && sim.tick === 3;
    const toServer = currentStep.dir === "toServer";
    return [{
      id: "flow",
      source: toServer ? "client" : "server",
      target: toServer ? "server" : "client",
      animated: !isLost,
      style: {
        stroke: isLost ? "#ef4444" : activeColor,
        strokeWidth: 2,
        strokeDasharray: isLost ? "6 4" : undefined,
      },
      markerEnd: { type: MarkerType.ArrowClosed, color: isLost ? "#ef4444" : activeColor },
      label: isLost ? "LOST!" : currentStep.label,
      labelStyle: { fontSize: 11, fill: isLost ? "#ef4444" : "#a1a1aa" },
      labelBgStyle: { fill: "transparent" },
    }];
  }, [sim.tick, mode, steps, activeColor]);

  return (
    <Playground
      title="TCP vs UDP — Handshake Visualiser"
      simulation={sim}
      canvasHeight="min-h-[260px]"
      canvas={
        <div className="h-full flex flex-col">
          <div className="flex gap-1 p-2 border-b border-violet-500/10">
            <button
              onClick={() => handleSwitch("tcp")}
              className={cn(
                "px-4 py-1.5 rounded text-xs font-semibold transition-all",
                mode === "tcp"
                  ? "bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/40"
                  : "text-muted-foreground hover:bg-muted/30"
              )}
            >
              TCP — Reliable
            </button>
            <button
              onClick={() => handleSwitch("udp")}
              className={cn(
                "px-4 py-1.5 rounded text-xs font-semibold transition-all",
                mode === "udp"
                  ? "bg-green-500/20 text-green-400 ring-1 ring-green-500/40"
                  : "text-muted-foreground hover:bg-muted/30"
              )}
            >
              UDP — Fast
            </button>
          </div>
          <div className="flex-1">
            <FlowDiagram nodes={nodes} edges={edges} interactive={false} allowDrag={false} minHeight={210} />
          </div>
        </div>
      }
      explanation={(state) => (
        <div className="space-y-3">
          <div>
            <h4 className={cn("text-sm font-semibold", mode === "tcp" ? "text-blue-400" : "text-green-400")}>
              {mode === "tcp" ? "TCP — 3-way handshake" : "UDP — fire and forget"}
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              {mode === "tcp"
                ? "Every segment is acknowledged. Lost packets are retransmitted."
                : "No connection, no ACKs. Datagrams may arrive out of order or not at all."}
            </p>
          </div>
          <div className="space-y-1">
            {steps.map((s, i) => {
              const done = i < state.tick;
              const current = i === state.tick - 1;
              const lost = mode === "udp" && i === 2;
              return (
                <div
                  key={i}
                  className={cn(
                    "flex items-center gap-2 px-2 py-1 rounded text-xs transition-all",
                    lost && done
                      ? "bg-red-500/10 text-red-400"
                      : done
                      ? "bg-emerald-500/10 text-foreground"
                      : current
                      ? "bg-violet-500/10 text-foreground animate-pulse"
                      : "text-muted-foreground/30"
                  )}
                >
                  <span className="font-mono text-[10px] w-4 text-right shrink-0">{i + 1}.</span>
                  <span className="flex-1">{s.label}</span>
                  {s.note && done && (
                    <span className="text-[10px] text-muted-foreground shrink-0">{s.note}</span>
                  )}
                </div>
              );
            })}
          </div>
          {state.tick >= steps.length && (
            <p className={cn("text-xs font-medium", mode === "tcp" ? "text-blue-400" : "text-green-400")}>
              {mode === "tcp"
                ? "Reliable connection complete. 7 messages, every byte guaranteed."
                : "Done. Fast! But datagram 3 was dropped and never retransmitted."}
            </p>
          )}
        </div>
      )}
    />
  );
}

// --- Port Lookup ---

function PortLookup() {
  const [input, setInput] = useState("");
  const port = parseInt(input, 10);
  const match = !isNaN(port) ? portDatabase[port] : null;
  const quickPorts = [22, 53, 80, 443, 3000, 5432, 6379, 8080, 9092, 27017];

  const portRangeLabel = !isNaN(port) && input
    ? port <= 1023 ? "Well-Known" : port <= 49151 ? "Registered" : "Ephemeral"
    : null;

  const portRangeStyle = portRangeLabel === "Well-Known"
    ? "bg-red-500/10 text-red-400 border-red-500/20"
    : portRangeLabel === "Registered"
    ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
    : "bg-green-500/10 text-green-400 border-green-500/20";

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Type any port number or click a common one to identify what service runs there.
      </p>
      <div className="flex items-center gap-3 flex-wrap">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value.replace(/\D/g, "").slice(0, 5))}
          placeholder="e.g. 443"
          className="w-40 px-3 py-2 rounded-lg border border-border/50 bg-muted/20 text-sm font-mono text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-violet-500/50"
        />
        {portRangeLabel && (
          <span className={cn("text-xs font-mono px-2 py-1 rounded border", portRangeStyle)}>
            {portRangeLabel}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {quickPorts.map((p) => (
          <button
            key={p}
            onClick={() => setInput(String(p))}
            className={cn(
              "px-2 py-1 rounded text-xs font-mono border transition-colors",
              port === p
                ? "bg-violet-500/20 border-violet-500/30 text-violet-400"
                : "bg-muted/20 border-border/30 text-muted-foreground hover:bg-muted/40"
            )}
          >
            :{p}
          </button>
        ))}
      </div>

      {input && !isNaN(port) && (
        <div className={cn(
          "rounded-lg border p-4",
          match
            ? catBadge[match.cat].includes("blue")
              ? "bg-blue-500/5 border-blue-500/20"
              : match.cat === "DB"
              ? "bg-amber-500/5 border-amber-500/20"
              : match.cat === "Infra"
              ? "bg-emerald-500/5 border-emerald-500/20"
              : "bg-purple-500/5 border-purple-500/20"
            : "bg-muted/20 border-border/30"
        )}>
          {match ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xl font-mono font-bold text-foreground">:{port}</span>
                <span className={cn("text-sm font-semibold px-2 py-0.5 rounded border", catBadge[match.cat])}>
                  {match.name}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted/30 text-muted-foreground">
                  {match.proto}
                </span>
                <span className={cn("text-[10px] font-mono px-1.5 py-0.5 rounded border ml-auto", catBadge[match.cat])}>
                  {match.cat}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{match.desc}</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {port < 0 || port > 65535
                ? "Invalid — ports range from 0 to 65535."
                : `Port ${port} has no well-known registered service.`}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// --- DNS Resolution Flow ---

const dnsEdgeDefs: [number, string, string, string, string][] = [
  [1, "browser",  "resolver", "Who is example.com?", "#3b82f6"],
  [2, "resolver", "root",     "Ask root for .com",   "#22c55e"],
  [3, "root",     "auth",     "Auth NS address",     "#a855f7"],
  [4, "auth",     "browser",  "93.184.216.34",       "#f59e0b"],
  [5, "browser",  "server",   "TCP connect!",        "#06b6d4"],
];

const dnsSteps = [
  "Press play to trace a DNS lookup...",
  "Browser asks its resolver: who is example.com?",
  "Resolver queries a root nameserver (.com TLD)",
  "Root returns the authoritative NS address",
  "Auth NS returns the real IP: 93.184.216.34",
  "Browser opens a TCP connection to the IP!",
];

function DNSResolutionFlow() {
  const sim = useSimulation({ intervalMs: 1000, maxSteps: 5 });
  const s = (i: number): "healthy" | "idle" => (sim.tick > i ? "healthy" : "idle");

  const nodes: FlowNode[] = useMemo(() => [
    { id: "browser",  type: "clientNode", position: { x: 10,  y: 110 }, data: { label: "Browser",      sublabel: "example.com?",   status: s(0), handles: { right: true, bottom: true } } },
    { id: "resolver", type: "serverNode", position: { x: 200, y: 20  }, data: { label: "DNS Resolver", sublabel: "8.8.8.8",        status: s(1), handles: { left: true, right: true } } },
    { id: "root",     type: "serverNode", position: { x: 400, y: 20  }, data: { label: "Root NS",      sublabel: ".com TLD",       status: s(2), handles: { left: true, bottom: true } } },
    { id: "auth",     type: "serverNode", position: { x: 400, y: 170 }, data: { label: "Auth NS",      sublabel: "example.com",    status: s(3), handles: { top: true, left: true } } },
    { id: "server",   type: "serverNode", position: { x: 10,  y: 230 }, data: { label: "Web Server",   sublabel: "93.184.216.34",  status: s(4), handles: { top: true, right: true } } },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [sim.tick]);

  const edges: FlowEdge[] = useMemo(
    () => dnsEdgeDefs
      .filter(([t]) => sim.tick >= t)
      .map(([, src, tgt, label, color]) => ({
        id: `${src}-${tgt}`, source: src, target: tgt, animated: true, label,
        labelStyle: { fontSize: 9, fill: "#a1a1aa" }, labelBgStyle: { fill: "transparent" },
        style: { stroke: color, strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color },
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sim.tick]
  );

  return (
    <Playground
      title="DNS Resolution — hostname to IP"
      simulation={sim}
      canvasHeight="min-h-[340px]"
      canvas={<FlowDiagram nodes={nodes} edges={edges} interactive={false} allowDrag={false} minHeight={330} />}
      explanation={
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-foreground">How DNS finds an IP</h4>
          <p className="text-xs text-muted-foreground">
            DNS is a distributed hierarchy. Your browser typically has the answer cached after the first lookup.
          </p>
          <div className="space-y-1">
            {dnsSteps.map((label, i) => (
              <div key={i} className={cn(
                "text-xs px-2 py-1 rounded transition-all",
                i > 0 && i <= sim.tick ? "bg-emerald-500/10 text-foreground"
                  : i === 0 && sim.tick === 0 ? "text-muted-foreground"
                  : "text-muted-foreground/30"
              )}>
                {i === 0 ? label : `${i}. ${label}`}
              </div>
            ))}
          </div>
          {sim.tick >= 5 && (
            <p className="text-xs text-emerald-400 font-medium">
              DNS resolved! The result is cached so subsequent lookups skip steps 2-4.
            </p>
          )}
        </div>
      }
    />
  );
}

// --- Main Page ---

export default function NetworkingBasicsPage() {
  return (
    <div className="space-y-8">
      <TopicHero
        title="Networking Basics"
        subtitle="Every distributed system is machines talking over a network. If you don't understand the network, you're building on a foundation you can't see."
        difficulty="beginner"
      />

      {/* OSI Layer Explorer */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">The OSI Model — Click Each Layer</h2>
        <OSILayerExplorer />
        <ConversationalCallout type="tip">
          In practice the internet uses TCP/IP, which collapses layers 5-7 into a single
          &quot;Application&quot; layer. But the 7-layer mental model is invaluable for pinpointing
          where failures occur — is the packet even leaving the NIC, or is DNS broken?
        </ConversationalCallout>
      </section>

      {/* Packet overhead chart */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Protocol Overhead — Layer by Layer</h2>
        <p className="text-sm text-muted-foreground">
          Each layer wraps your data in a header. A 1460-byte payload exits the NIC as 1527 bytes.
        </p>
        <LiveChart
          type="bar"
          data={overheadData}
          dataKeys={{ x: "layer", y: ["payload", "headers"], label: ["Payload (1460B)", "Header overhead"] }}
          height={230}
          unit="B"
          referenceLines={[{ y: 1500, label: "MTU 1500B", color: "#ef4444" }]}
        />
        <AhaMoment
          question="Why does MTU matter for system design?"
          answer={
            <p>
              The Maximum Transmission Unit for Ethernet is 1500B. Packets larger than this get
              fragmented — split into multiple frames, each with its own headers. Fragmentation
              increases overhead and creates additional opportunities for loss. TCP limits payload
              size to ~1460B (MSS) to avoid it. In cloud systems, VPN or tunnel encapsulation
              shrinks the effective MTU further, causing hard-to-debug &quot;works locally but
              fails over VPN&quot; issues.
            </p>
          }
        />
      </section>

      {/* TCP vs UDP */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">TCP vs UDP — See the Difference</h2>
        <p className="text-sm text-muted-foreground">
          Step through the handshake to feel why TCP takes more round trips but guarantees delivery.
        </p>
        <TCPvsUDPPlayground />
        <ConversationalCallout type="question">
          Why does video streaming use UDP? A retransmitted video frame that arrives 300ms late
          is already past its display time — useless. For real-time media, &quot;close enough
          now&quot; beats &quot;perfect but stale.&quot;
        </ConversationalCallout>
      </section>

      {/* Port Lookup */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Port Lookup — What Runs Where?</h2>
        <PortLookup />
        <AhaMoment
          question="Why can't two apps share the same port?"
          answer={
            <p>
              The OS uses the 4-tuple (src-IP, src-port, dst-IP, dst-port) to route incoming
              packets to the right socket. Two processes listening on the same port would make that
              routing ambiguous. The OS refuses it. The exception: TCP and UDP share the same
              port number space but are separate — so one app can bind TCP:80 and another UDP:80
              simultaneously.
            </p>
          }
        />
      </section>

      {/* DNS Resolution */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">DNS Resolution — Hostname to IP</h2>
        <DNSResolutionFlow />
        <ConversationalCallout type="warning">
          DNS failures are silent in many apps. A misconfigured DNS TTL that&apos;s too long means
          clients cache stale IPs during deployments. Too short and you hammer nameservers.
          Common prod gotcha: servers can&apos;t reach each other by hostname because internal DNS
          isn&apos;t configured in the container network.
        </ConversationalCallout>
      </section>

      {/* IP Address reference */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">IP Addresses — The Ones That Trip You Up</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { ip: "127.0.0.1",             label: "Loopback (localhost)",   note: "Traffic never leaves the host. Bind here and nothing external can reach your service.",           cls: "bg-blue-500/5 border-blue-500/20",    text: "text-blue-400" },
            { ip: "192.168.x.x / 10.x.x.x", label: "Private (RFC 1918)",   note: "Not routable on the public internet. NAT at the gateway translates to a public IP.",             cls: "bg-emerald-500/5 border-emerald-500/20", text: "text-emerald-400" },
            { ip: "0.0.0.0",               label: "All interfaces",          note: "Accepts on every NIC. Mandatory in containers and cloud VMs to receive external traffic.",       cls: "bg-purple-500/5 border-purple-500/20", text: "text-purple-400" },
          ].map(({ ip, label, note, cls, text }) => (
            <div key={ip} className={cn("border rounded-lg p-3 space-y-1", cls)}>
              <p className={cn("text-xs font-semibold font-mono", text)}>{ip}</p>
              <p className="text-[11px] font-medium text-foreground">{label}</p>
              <p className="text-[11px] text-muted-foreground">{note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Debug cheatsheet */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Debugging Network Issues — Layer by Layer</h2>
        <p className="text-sm text-muted-foreground">Work from the bottom up. Each tool validates a different layer.</p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {[
            { tool: "nslookup", layer: "DNS (L7)", desc: "Does the name resolve?" },
            { tool: "ping",     layer: "ICMP (L3)", desc: "Is the host reachable?" },
            { tool: "telnet",   layer: "TCP (L4)",  desc: "Is the port open?" },
            { tool: "curl -v",  layer: "HTTP (L7)", desc: "Does the endpoint respond?" },
            { tool: "logs",     layer: "App",       desc: "What is the app saying?" },
          ].map((item) => (
            <div key={item.tool} className="bg-muted/20 border border-border/30 rounded-lg p-3 text-center space-y-1">
              <div className="text-xs font-mono font-bold text-foreground">{item.tool}</div>
              <div className="text-[10px] text-violet-400">{item.layer}</div>
              <div className="text-[10px] text-muted-foreground">{item.desc}</div>
            </div>
          ))}
        </div>
        <ConversationalCallout type="warning">
          <code className="text-xs bg-muted px-1 rounded">ping</code> uses ICMP, not TCP.
          A host can be pingable but refuse TCP connections on every port. Cloud firewalls often
          block ICMP entirely — so a failed ping doesn&apos;t mean the host is down. Always test
          the exact port and protocol your application uses.
        </ConversationalCallout>
      </section>

      <ConversationalCallout type="tip">
        In system design interviews focus on Transport (TCP vs UDP, ports) and Application
        (HTTP, WebSockets, gRPC). Knowing the full OSI stack shows depth when asked &quot;what
        could go wrong?&quot; or &quot;why is this slow?&quot; — most candidates can&apos;t name
        a layer below HTTP.
      </ConversationalCallout>

      <KeyTakeaway
        points={[
          "The OSI model has 7 layers. In practice focus on L4 (TCP/UDP/ports) and L7 (HTTP/DNS/gRPC).",
          "Each layer adds a header. A 1460B payload exits the wire as ~1527B — stay under the 1500B MTU.",
          "TCP: reliable ordered delivery via 3-way handshake + ACKs. UDP: no handshake, no guarantees, far lower latency.",
          "Ports identify apps on a host. Memorise: 22 SSH, 53 DNS, 80 HTTP, 443 HTTPS, 5432 Postgres, 6379 Redis.",
          "DNS resolves hostnames through root → TLD → authoritative nameservers. Results are cached by TTL.",
          "Bind 0.0.0.0 in containers/VMs to receive traffic. Bind 127.0.0.1 to keep a service local-only.",
          "Debug layer by layer: nslookup → ping → telnet → curl → app logs.",
        ]}
      />
    </div>
  );
}
