"use client";

import { useState, useEffect, useRef } from "react";
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
import { MetricCounter } from "@/components/metric-counter";
import { cn } from "@/lib/utils";

const osiActiveStyles: Record<string, string> = {
  "bg-purple-500": "bg-purple-500/10 border-current ring-1 ring-current/20",
  "bg-indigo-500": "bg-indigo-500/10 border-current ring-1 ring-current/20",
  "bg-blue-500": "bg-blue-500/10 border-current ring-1 ring-current/20",
  "bg-cyan-500": "bg-cyan-500/10 border-current ring-1 ring-current/20",
  "bg-green-500": "bg-green-500/10 border-current ring-1 ring-current/20",
  "bg-yellow-500": "bg-yellow-500/10 border-current ring-1 ring-current/20",
  "bg-red-500": "bg-red-500/10 border-current ring-1 ring-current/20",
};

const osiPassedStyles: Record<string, string> = {
  "bg-purple-500": "bg-purple-500/5 border-purple-500/20",
  "bg-indigo-500": "bg-indigo-500/5 border-indigo-500/20",
  "bg-blue-500": "bg-blue-500/5 border-blue-500/20",
  "bg-cyan-500": "bg-cyan-500/5 border-cyan-500/20",
  "bg-green-500": "bg-green-500/5 border-green-500/20",
  "bg-yellow-500": "bg-yellow-500/5 border-yellow-500/20",
  "bg-red-500": "bg-red-500/5 border-red-500/20",
};

const osiDotActiveStyles: Record<string, string> = {
  "bg-purple-500": "bg-purple-500 shadow-lg",
  "bg-indigo-500": "bg-indigo-500 shadow-lg",
  "bg-blue-500": "bg-blue-500 shadow-lg",
  "bg-cyan-500": "bg-cyan-500 shadow-lg",
  "bg-green-500": "bg-green-500 shadow-lg",
  "bg-yellow-500": "bg-yellow-500 shadow-lg",
  "bg-red-500": "bg-red-500 shadow-lg",
};

const osiDotPassedStyles: Record<string, string> = {
  "bg-purple-500": "bg-purple-500/50",
  "bg-indigo-500": "bg-indigo-500/50",
  "bg-blue-500": "bg-blue-500/50",
  "bg-cyan-500": "bg-cyan-500/50",
  "bg-green-500": "bg-green-500/50",
  "bg-yellow-500": "bg-yellow-500/50",
  "bg-red-500": "bg-red-500/50",
};

const osiBorderColorVars: Record<string, string> = {
  "bg-purple-500": "var(--color-purple-500)",
  "bg-indigo-500": "var(--color-indigo-500)",
  "bg-blue-500": "var(--color-blue-500)",
  "bg-cyan-500": "var(--color-cyan-500)",
  "bg-green-500": "var(--color-green-500)",
  "bg-yellow-500": "var(--color-yellow-500)",
  "bg-red-500": "var(--color-red-500)",
};

function OSIStackDiagram() {
  const [activeLayer, setActiveLayer] = useState(0);
  const [direction, setDirection] = useState<"down" | "up">("down");
  const directionRef = useRef(direction);
  directionRef.current = direction;
  useEffect(() => {
    const t = setInterval(() => {
      setActiveLayer((prev) => {
        if (directionRef.current === "down" && prev >= 6) {
          setDirection("up");
          return 6;
        }
        if (directionRef.current === "up" && prev <= 0) {
          setDirection("down");
          return 0;
        }
        return directionRef.current === "down" ? prev + 1 : prev - 1;
      });
    }, 800);
    return () => clearInterval(t);
  }, []);

  const layers = [
    { num: 7, name: "Application", protocol: "HTTP, DNS, SMTP, FTP", color: "bg-purple-500", desc: "Where your app code lives. HTTP requests, API calls." },
    { num: 6, name: "Presentation", protocol: "TLS/SSL, JPEG, UTF-8", color: "bg-indigo-500", desc: "Encryption, compression, data format translation." },
    { num: 5, name: "Session", protocol: "Sockets, NetBIOS", color: "bg-blue-500", desc: "Connection management, session tokens." },
    { num: 4, name: "Transport", protocol: "TCP, UDP", color: "bg-cyan-500", desc: "Port numbers, reliable delivery, flow control." },
    { num: 3, name: "Network", protocol: "IP, ICMP, ARP", color: "bg-green-500", desc: "IP addressing, routing between networks." },
    { num: 2, name: "Data Link", protocol: "Ethernet, Wi-Fi, MAC", color: "bg-yellow-500", desc: "MAC addresses, local network frames." },
    { num: 1, name: "Physical", protocol: "Cables, radio signals", color: "bg-red-500", desc: "Raw bits on the wire: electrical, optical, radio." },
  ];

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between mb-2 text-[10px] text-muted-foreground">
        <span>Sender side: data flows {direction === "down" ? "DOWN ↓" : "UP ↑"}</span>
        <span className={cn(
          "px-2 py-0.5 rounded-full border",
          direction === "down"
            ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
            : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
        )}>
          {direction === "down" ? "Encapsulating" : "Decapsulating"}
        </span>
      </div>
      {layers.map((layer, i) => {
        const isActive = i === activeLayer;
        const isPassed = direction === "down" ? i < activeLayer : i > activeLayer;

        return (
          <div
            key={layer.num}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg border transition-all duration-300",
              isActive
                ? osiActiveStyles[layer.color]
                : isPassed
                ? osiPassedStyles[layer.color]
                : "bg-muted/10 border-border/30"
            )}
            style={isActive ? { borderColor: osiBorderColorVars[layer.color] } : {}}
          >
            <span className={cn(
              "text-xs font-mono font-bold w-5 shrink-0",
              isActive ? "text-foreground" : "text-muted-foreground/50"
            )}>
              {layer.num}
            </span>
            <div className={cn(
              "size-2 rounded-full shrink-0 transition-all",
              isActive ? osiDotActiveStyles[layer.color] : isPassed ? osiDotPassedStyles[layer.color] : "bg-muted-foreground/20"
            )} />
            <div className="flex-1 min-w-0">
              <span className={cn(
                "text-xs font-semibold",
                isActive ? "text-foreground" : "text-muted-foreground/60"
              )}>
                {layer.name}
              </span>
              <span className={cn(
                "text-[10px] ml-2 transition-opacity",
                isActive ? "text-muted-foreground" : "text-muted-foreground/30"
              )}>
                {layer.protocol}
              </span>
            </div>
            {isActive && (
              <span className="text-[10px] text-muted-foreground italic shrink-0 hidden sm:block">
                {layer.desc}
              </span>
            )}
          </div>
        );
      })}
      <p className="text-[10px] text-muted-foreground text-center pt-1">
        {direction === "down"
          ? "Each layer adds its header (encapsulation). Data grows larger as it descends."
          : "Each layer strips its header (decapsulation). Data shrinks as it ascends."}
      </p>
    </div>
  );
}

function PacketEncapsulation() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((s) => (s + 1) % 6), 1200);
    return () => clearInterval(t);
  }, []);

  const layers = [
    { name: "Data", header: "", color: "bg-purple-500/30 border-purple-500/30", size: 40 },
    { name: "TCP Header", header: "Src:49152 Dst:443 Seq:1", color: "bg-cyan-500/30 border-cyan-500/30", size: 20 },
    { name: "IP Header", header: "Src:192.168.1.5 Dst:93.184.216.34", color: "bg-green-500/30 border-green-500/30", size: 20 },
    { name: "Ethernet", header: "MAC: aa:bb:cc:dd:ee:ff", color: "bg-yellow-500/30 border-yellow-500/30", size: 14 },
    { name: "Preamble", header: "10101010...", color: "bg-red-500/30 border-red-500/30", size: 8 },
  ];

  const visibleLayers = Math.min(tick + 1, layers.length);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-center">
        <div className="flex items-stretch h-12 rounded-lg overflow-hidden border border-border/50">
          {layers.slice(0, visibleLayers).reverse().map((layer, i) => (
            <div
              key={layer.name}
              className={cn(
                "flex items-center justify-center px-2 border-r border-border/30 transition-all duration-500",
                layer.color,
                i === 0 && tick < 5 ? "animate-pulse" : ""
              )}
              style={{ minWidth: `${layer.size * 1.5}px` }}
            >
              <div className="text-center">
                <div className="text-[9px] font-semibold whitespace-nowrap">{layer.name}</div>
                <div className="text-[7px] text-muted-foreground font-mono whitespace-nowrap hidden sm:block">
                  {layer.header}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <span>Outer headers (added last)</span>
        <span>
          Total: ~{layers.slice(0, visibleLayers).reduce((a, l) => a + l.size, 0) + 1460} bytes
          ({Math.round(((layers.slice(0, visibleLayers).reduce((a, l) => a + l.size, 0)) / (layers.slice(0, visibleLayers).reduce((a, l) => a + l.size, 0) + 1460)) * 100)}% overhead)
        </span>
        <span>Inner data (original payload)</span>
      </div>
      <p className="text-[10px] text-muted-foreground text-center">
        {tick === 0 ? "Starting with application data (your HTTP request)..." :
         tick === 1 ? "Transport layer adds TCP header: ports, sequence numbers..." :
         tick === 2 ? "Network layer adds IP header: source and destination addresses..." :
         tick === 3 ? "Data Link layer adds Ethernet frame: MAC addresses..." :
         tick === 4 ? "Physical layer adds preamble for signal synchronization..." :
         "Complete frame ready to send on the wire. Each layer wraps the previous one."}
      </p>
    </div>
  );
}

function TCPvsUDPComparison() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((s) => (s + 1) % 20), 400);
    return () => clearInterval(t);
  }, []);

  const tcpPackets = [1, 2, 3, 4, 5];
  const udpPackets = [1, 2, null, 4, 5]; // packet 3 lost
  const tcpActive = Math.min(Math.floor(tick / 2), 6);
  const udpActive = Math.min(Math.floor(tick / 1.5), 6);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* TCP side */}
      <div className="rounded-lg border p-3 space-y-3">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-blue-500" />
          <span className="text-xs font-semibold text-blue-400">TCP</span>
          <span className="text-[10px] text-muted-foreground">Reliable, ordered</span>
        </div>
        <div className="flex items-center gap-1">
          {tcpPackets.map((p, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "size-8 rounded border flex items-center justify-center text-[10px] font-mono font-bold transition-all",
                  i < tcpActive
                    ? "bg-blue-500/20 border-blue-500/30 text-blue-400"
                    : "bg-muted/20 border-border/50 text-muted-foreground/30"
                )}
              >
                {p}
              </div>
              {i < tcpActive && (
                <span className="text-[8px] text-emerald-400">ACK</span>
              )}
            </div>
          ))}
          {tcpActive >= 5 && (
            <div className="text-[10px] text-emerald-400 font-mono ml-2">All delivered &#10003;</div>
          )}
        </div>
        <div className="text-[10px] text-muted-foreground space-y-0.5">
          <p>&#10003; Handshake before sending</p>
          <p>&#10003; Every packet acknowledged</p>
          <p>&#10003; Lost packets retransmitted</p>
          <p>&#10003; Packets reassembled in order</p>
        </div>
        <div className="bg-muted/30 rounded p-2">
          <p className="text-[10px] font-semibold mb-0.5">Use cases:</p>
          <p className="text-[10px] text-muted-foreground">HTTP/HTTPS, database connections, file transfers, email (SMTP), SSH</p>
        </div>
      </div>

      {/* UDP side */}
      <div className="rounded-lg border p-3 space-y-3">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-green-500" />
          <span className="text-xs font-semibold text-green-400">UDP</span>
          <span className="text-[10px] text-muted-foreground">Fast, fire-and-forget</span>
        </div>
        <div className="flex items-center gap-1">
          {udpPackets.map((p, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "size-8 rounded border flex items-center justify-center text-[10px] font-mono font-bold transition-all",
                  p === null
                    ? i < udpActive
                      ? "bg-red-500/20 border-red-500/30 text-red-400 line-through"
                      : "bg-muted/20 border-border/50 text-muted-foreground/30"
                    : i < udpActive
                    ? "bg-green-500/20 border-green-500/30 text-green-400"
                    : "bg-muted/20 border-border/50 text-muted-foreground/30"
                )}
              >
                {p ?? "X"}
              </div>
              {p === null && i < udpActive && (
                <span className="text-[8px] text-red-400">lost</span>
              )}
            </div>
          ))}
          {udpActive >= 5 && (
            <div className="text-[10px] text-orange-400 font-mono ml-2">4/5 delivered</div>
          )}
        </div>
        <div className="text-[10px] text-muted-foreground space-y-0.5">
          <p>&#10007; No handshake (send immediately)</p>
          <p>&#10007; No acknowledgments</p>
          <p>&#10007; Lost packets stay lost</p>
          <p>&#10007; No ordering guarantee</p>
        </div>
        <div className="bg-muted/30 rounded p-2">
          <p className="text-[10px] font-semibold mb-0.5">Use cases:</p>
          <p className="text-[10px] text-muted-foreground">Video streaming, online gaming, VoIP calls, DNS lookups, IoT telemetry</p>
        </div>
      </div>
    </div>
  );
}

function PortDiscovery() {
  const [hoveredPort, setHoveredPort] = useState<number | null>(null);

  const portGroups = [
    {
      category: "Web",
      color: "border-blue-500/30 bg-blue-500/5",
      textColor: "text-blue-400",
      ports: [
        { port: 80, name: "HTTP", desc: "Unencrypted web traffic. Browsers default here." },
        { port: 443, name: "HTTPS", desc: "Encrypted web traffic (TLS). Standard for production." },
        { port: 8080, name: "Alt HTTP", desc: "Common for dev servers, proxies, and alt HTTP." },
        { port: 3000, name: "Dev Server", desc: "Node.js, Next.js, React dev server default." },
      ],
    },
    {
      category: "Infrastructure",
      color: "border-emerald-500/30 bg-emerald-500/5",
      textColor: "text-emerald-400",
      ports: [
        { port: 22, name: "SSH", desc: "Secure shell. Remote server access." },
        { port: 53, name: "DNS", desc: "Domain name resolution. Uses UDP (and TCP for large responses)." },
        { port: 25, name: "SMTP", desc: "Email sending. Often blocked by ISPs." },
        { port: 123, name: "NTP", desc: "Network Time Protocol. Clock synchronization." },
      ],
    },
    {
      category: "Databases",
      color: "border-amber-500/30 bg-amber-500/5",
      textColor: "text-amber-400",
      ports: [
        { port: 5432, name: "PostgreSQL", desc: "Postgres default. Most popular SQL DB." },
        { port: 3306, name: "MySQL", desc: "MySQL/MariaDB default." },
        { port: 27017, name: "MongoDB", desc: "MongoDB default. Document database." },
        { port: 6379, name: "Redis", desc: "Redis default. Cache and key-value store." },
      ],
    },
    {
      category: "Messaging",
      color: "border-purple-500/30 bg-purple-500/5",
      textColor: "text-purple-400",
      ports: [
        { port: 9092, name: "Kafka", desc: "Apache Kafka broker default." },
        { port: 5672, name: "RabbitMQ", desc: "RabbitMQ AMQP protocol." },
        { port: 4222, name: "NATS", desc: "NATS messaging default." },
        { port: 2181, name: "ZooKeeper", desc: "ZooKeeper coordination service." },
      ],
    },
  ];

  return (
    <div className="space-y-3">
      {portGroups.map((group) => (
        <div key={group.category}>
          <p className={cn("text-[10px] font-semibold mb-1.5 uppercase tracking-wider", group.textColor)}>
            {group.category}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {group.ports.map((item) => (
              <div
                key={item.port}
                className={cn(
                  "p-2 rounded-lg border text-center transition-all cursor-default",
                  hoveredPort === item.port ? group.color + " ring-1 ring-current/20" : "bg-muted/20 border-border/30"
                )}
                onMouseEnter={() => setHoveredPort(item.port)}
                onMouseLeave={() => setHoveredPort(null)}
              >
                <div className={cn(
                  "font-mono text-sm font-bold transition-colors",
                  hoveredPort === item.port ? group.textColor : "text-muted-foreground/60"
                )}>
                  {item.port}
                </div>
                <div className="text-[10px] font-medium mt-0.5">{item.name}</div>
                {hoveredPort === item.port && (
                  <div className="text-[9px] text-muted-foreground mt-1">{item.desc}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
      <p className="text-[10px] text-muted-foreground">
        Ports 0-1023 are &quot;well-known&quot; and require root/admin privileges. Ports 1024-49151
        are &quot;registered&quot; for specific services. Ports 49152-65535 are &quot;ephemeral&quot;
        and used for outgoing connections.
      </p>
    </div>
  );
}

export default function NetworkingBasicsPage() {
  return (
    <div className="space-y-8">
      <TopicHero
        title="Networking Basics"
        subtitle="Every distributed system is a collection of machines talking over a network. If you don't understand the network, you're building on a foundation you can't see."
        difficulty="beginner"
      />

      <FailureScenario title="Two services can't talk to each other">
        <p className="text-sm text-muted-foreground">
          You deploy a new microservice. It needs to call another service in your cluster.
          You configure the URL, deploy, and... connection refused. No route to host. Connection
          timed out. You try a different port. Same thing. You SSH into the machine and can
          ping the other service just fine. But your app still cannot connect.
        </p>
        <div className="flex items-center justify-center gap-6 py-4">
          <ServerNode type="server" label="Auth Service" sublabel="Port 3000" status="healthy" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-red-500 text-2xl">&#10005;</span>
            <span className="text-xs text-red-500 font-mono">ECONNREFUSED</span>
          </div>
          <ServerNode type="server" label="User Service" sublabel="Port 8080" status="warning" />
        </div>
        <p className="text-sm text-muted-foreground">
          After an hour of debugging, you discover the problem: the Auth Service is listening on
          <code className="text-xs bg-muted px-1.5 py-0.5 rounded">127.0.0.1:3000</code> (localhost only) instead of
          <code className="text-xs bg-muted px-1.5 py-0.5 rounded">0.0.0.0:3000</code> (all interfaces). Or a firewall
          rule is blocking port 3000. Or the service is using TCP but the other expects UDP.
          Without networking fundamentals, every failure looks the same: &quot;it doesn&apos;t work.&quot;
        </p>
      </FailureScenario>

      <WhyItBreaks title="Networking has layers, and failures can happen at any of them">
        <p className="text-sm text-muted-foreground">
          Networks are not magic pipes. They are stacks of protocols, each solving a different
          problem. When two machines fail to communicate, the problem could be at any layer:
          a DNS misconfiguration, a firewall blocking a port, an IP address conflict, a protocol
          mismatch, or a physical cable unplugged. Debugging requires knowing which layer to check.
        </p>
        <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
          <li><strong>Wrong port</strong> &mdash; the service is listening on a different port than expected</li>
          <li><strong>Wrong interface</strong> &mdash; binding to localhost instead of all interfaces</li>
          <li><strong>Firewall rules</strong> &mdash; ingress or egress blocked for that port/protocol</li>
          <li><strong>Protocol mismatch</strong> &mdash; one side speaks TCP, the other expects UDP</li>
          <li><strong>DNS not resolving</strong> &mdash; the hostname does not map to the right IP</li>
        </ul>
      </WhyItBreaks>

      <ConceptVisualizer title="The OSI Model — Networking in Layers">
        <p className="text-sm text-muted-foreground mb-4">
          The OSI model divides networking into 7 layers. Watch data flow down the stack
          (encapsulation, where each layer adds a header) and back up (decapsulation, where
          each layer strips its header). In practice, you mostly care about layers 3 (Network),
          4 (Transport), and 7 (Application).
        </p>
        <OSIStackDiagram />
        <ConversationalCallout type="tip">
          In the real world, the internet uses the TCP/IP model which collapses layers 5-7 into
          a single &quot;Application&quot; layer. But the concept of layered protocols &mdash; each
          layer building on the one below, each solving one problem &mdash; is fundamental to
          understanding how networks work and where failures occur.
        </ConversationalCallout>
      </ConceptVisualizer>

      <ConceptVisualizer title="Packet Encapsulation — How Data Grows as It Descends">
        <p className="text-sm text-muted-foreground mb-4">
          When your application sends an HTTP request, each network layer wraps the data with its
          own header. By the time the data reaches the wire, your original payload is wrapped in
          TCP headers, IP headers, Ethernet frames, and physical-layer preambles. This is called
          <strong> encapsulation</strong>. The receiver reverses the process (decapsulation).
        </p>
        <PacketEncapsulation />
        <AhaMoment
          question="Why do we need all these headers? Isn't it wasteful?"
          answer={
            <p>
              Each header serves a different purpose that no other layer handles. The IP header
              tells routers <em>where</em> to send the packet (addressing). The TCP header tells
              the OS <em>which application</em> gets it (port) and ensures reliable delivery
              (sequence numbers, ACKs). The Ethernet header handles the <em>local network hop</em>.
              Without layering, every protocol would have to reinvent addressing, reliability, and
              routing &mdash; and changing one would break everything else.
            </p>
          }
        />
      </ConceptVisualizer>

      <ConceptVisualizer title="TCP vs UDP — Reliability vs Speed">
        <p className="text-sm text-muted-foreground mb-4">
          At the Transport layer, you have a critical choice: TCP or UDP. This is not a matter of
          preference &mdash; it depends entirely on what your application needs. TCP guarantees
          delivery at the cost of latency. UDP is fast but packets can be lost without notice.
          Watch both protocols handle the same 5 packets, with packet 3 lost on the network:
        </p>
        <TCPvsUDPComparison />
        <ConversationalCallout type="question">
          Why does video streaming use UDP instead of TCP? Because a retransmitted video frame
          that arrives 200ms late is useless &mdash; the viewer has already moved past that moment.
          It is better to skip the lost frame and show the next one. TCP would stall the entire
          stream waiting for the retransmission. For real-time media, &quot;good enough now&quot;
          beats &quot;perfect but late.&quot;
        </ConversationalCallout>
      </ConceptVisualizer>

      <ConceptVisualizer title="Port Numbers — Addressing Applications">
        <p className="text-sm text-muted-foreground mb-4">
          An IP address identifies a machine. A port identifies a specific application on that
          machine. Think of the IP address as a building address and the port as an apartment
          number. Hover over any port to see what it is used for.
        </p>
        <PortDiscovery />
      </ConceptVisualizer>

      <AhaMoment
        question="Why can't two applications use the same port on the same machine?"
        answer={
          <p>
            A port is like a mailbox number. When a packet arrives at an IP address, the OS
            uses the port number to decide which application gets it. If two apps claim the
            same port, the OS would not know where to deliver the packet. This is why you get
            &quot;port already in use&quot; errors &mdash; another process has already claimed that
            mailbox. However, the combination of (protocol, IP, port) must be unique &mdash; two
            apps <em>can</em> share a port if one uses TCP and the other uses UDP.
          </p>
        }
      />

      <ConceptVisualizer title="IP Addresses — Finding Machines on a Network">
        <p className="text-sm text-muted-foreground mb-4">
          Every device on a network gets an IP address. IPv4 addresses look like
          <code className="text-xs bg-muted px-1.5 py-0.5 rounded">192.168.1.42</code> &mdash;
          four numbers between 0 and 255. Some ranges are special:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3">
            <p className="text-xs font-semibold text-blue-400">127.0.0.1</p>
            <p className="text-[10px] font-medium mt-0.5">Localhost (loopback)</p>
            <p className="text-[10px] text-muted-foreground mt-1">
              Always refers to the current machine. Traffic never leaves the host.
              Used for local development and inter-process communication.
            </p>
          </div>
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3">
            <p className="text-xs font-semibold text-green-400">192.168.x.x / 10.x.x.x</p>
            <p className="text-[10px] font-medium mt-0.5">Private IPs</p>
            <p className="text-[10px] text-muted-foreground mt-1">
              Used inside local networks (home, office, VPC). Not routable on the
              public internet. NAT translates them to public IPs at the gateway.
            </p>
          </div>
          <div className="bg-purple-500/5 border border-purple-500/20 rounded-lg p-3">
            <p className="text-xs font-semibold text-purple-400">0.0.0.0</p>
            <p className="text-[10px] font-medium mt-0.5">All interfaces</p>
            <p className="text-[10px] text-muted-foreground mt-1">
              When a server binds to this, it accepts connections from any network
              interface. Essential for containers and cloud deployments.
            </p>
          </div>
        </div>
        <BeforeAfter
          before={{
            title: "IPv4 (32-bit)",
            content: (
              <div className="text-sm space-y-1">
                <p className="text-xs text-muted-foreground">
                  4.3 billion addresses. We ran out in 2011. NAT buys time by sharing IPs.
                </p>
                <p className="text-[10px] font-mono text-muted-foreground">192.168.1.42</p>
              </div>
            ),
          }}
          after={{
            title: "IPv6 (128-bit)",
            content: (
              <div className="text-sm space-y-1">
                <p className="text-xs text-muted-foreground">
                  340 undecillion addresses. Enough for every grain of sand. Adoption is gradual.
                </p>
                <p className="text-[10px] font-mono text-muted-foreground">2001:0db8:85a3::8a2e:0370:7334</p>
              </div>
            ),
          }}
        />
      </ConceptVisualizer>

      <CorrectApproach title="Debugging Network Issues Systematically">
        <p className="text-sm text-muted-foreground mb-4">
          When two services cannot communicate, work through the layers from bottom to top.
          Each tool checks a specific layer of the stack. This sequence eliminates possibilities
          methodically.
        </p>
        <AnimatedFlow
          steps={[
            { id: "dns", label: "nslookup / dig", description: "Can the hostname resolve to an IP? (DNS, Layer 7)" },
            { id: "ping", label: "ping", description: "Can I reach the machine at all? (ICMP, Layer 3)" },
            { id: "telnet", label: "telnet / nc", description: "Is the specific port open and accepting connections? (Layer 4)" },
            { id: "curl", label: "curl -v", description: "Does the HTTP endpoint respond correctly? (Layer 7)" },
            { id: "logs", label: "Application Logs", description: "What does the application itself report?" },
          ]}
          interval={2000}
        />
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <MetricCounter label="Packet Loss" value={0} unit="%" trend="down" />
          <MetricCounter label="Round Trip" value={1.2} unit="ms" trend="down" />
          <MetricCounter label="Open Ports" value={3} trend="neutral" />
          <MetricCounter label="Active Connections" value={247} trend="neutral" />
        </div>
        <ConversationalCallout type="warning">
          A common gotcha: <code className="text-xs bg-muted px-1 rounded">ping</code> uses ICMP, not TCP.
          A server can be reachable via ping but still refuse TCP connections on a specific port.
          Many cloud firewalls block ICMP entirely, so <code className="text-xs bg-muted px-1 rounded">ping</code> failing
          does not necessarily mean the host is down. Always test the specific port and protocol
          your application uses with <code className="text-xs bg-muted px-1 rounded">telnet</code> or
          <code className="text-xs bg-muted px-1 rounded"> nc</code>.
        </ConversationalCallout>
      </CorrectApproach>

      <InteractiveDemo title="Trace a Request Through the Network Stack">
        {({ isPlaying, tick }) => {
          const layers = [
            { name: "Application", action: "HTTP GET /api/users", header: "+0 bytes", color: "bg-purple-500/20 border-purple-500/30" },
            { name: "Transport", action: "TCP segment, src:49152 dst:443, seq:1", header: "+20 bytes", color: "bg-cyan-500/20 border-cyan-500/30" },
            { name: "Network", action: "IP packet, 192.168.1.5 → 93.184.216.34, TTL:64", header: "+20 bytes", color: "bg-green-500/20 border-green-500/30" },
            { name: "Data Link", action: "Ethernet frame, MAC aa:bb → cc:dd, CRC check", header: "+14 bytes", color: "bg-yellow-500/20 border-yellow-500/30" },
            { name: "Physical", action: "Electrical signals: 10110011010...", header: "+8 bytes", color: "bg-red-500/20 border-red-500/30" },
          ];
          const activeLayer = isPlaying ? tick % (layers.length + 1) : -1;

          return (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Press play to watch an HTTP request flow down the network stack. Each layer adds
                its own header (encapsulation), growing the packet before it hits the wire.
              </p>
              <div className="space-y-2">
                {layers.map((layer, i) => (
                  <div
                    key={layer.name}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border transition-all duration-500",
                      i <= activeLayer ? layer.color : "bg-muted/30 border-muted"
                    )}
                    style={{ marginLeft: `${i * 10}px`, marginRight: `${i * 10}px` }}
                  >
                    <span className="text-xs font-semibold">{layer.name}</span>
                    <span className={cn(
                      "text-[10px] font-mono",
                      i <= activeLayer ? "text-foreground" : "text-muted-foreground/30"
                    )}>
                      {layer.action}
                    </span>
                    <span className={cn(
                      "text-[9px] font-mono",
                      i <= activeLayer ? "text-muted-foreground" : "text-transparent"
                    )}>
                      {layer.header}
                    </span>
                  </div>
                ))}
              </div>
              {activeLayer >= layers.length && (
                <p className="text-xs text-emerald-400 text-center font-medium">
                  Frame transmitted! Total overhead: 62 bytes of headers wrapping your data.
                </p>
              )}
            </div>
          );
        }}
      </InteractiveDemo>

      <AhaMoment
        question="Why does HTTPS use a different port (443) than HTTP (80)?"
        answer={
          <p>
            Historically, it was practical: a server could run both HTTP and HTTPS on the same
            machine without ambiguity. The port tells the server whether to expect a TLS handshake
            before the HTTP request. Modern servers often redirect port 80 traffic to port 443,
            but the distinction remains for backward compatibility. With HTTP/2 and ALPN (Application
            Layer Protocol Negotiation), the port distinction is becoming less important &mdash;
            but the convention persists.
          </p>
        }
      />

      <ConversationalCallout type="tip">
        In system design interviews, you rarely need to discuss layers 1-3. Focus on the
        Transport layer (TCP vs UDP, ports) and the Application layer (HTTP, WebSockets, gRPC).
        But knowing the full stack shows depth and helps when the interviewer asks &quot;what
        could go wrong?&quot; or &quot;why is this slow?&quot; Network latency, packet loss,
        and MTU limits are all lower-layer concerns that affect application performance.
      </ConversationalCallout>

      <KeyTakeaway
        points={[
          "The OSI model has 7 layers, but for system design you mainly care about Transport (TCP/UDP, ports) and Application (HTTP, DNS, gRPC).",
          "Each layer adds a header during encapsulation. A ~1460-byte HTTP payload becomes ~1522 bytes on the wire after all headers.",
          "TCP provides reliable, ordered delivery at the cost of latency (handshake + ACKs). UDP is faster but offers no guarantees. Choose based on your use case.",
          "Ports identify applications on a machine. Know the common ones: 80 (HTTP), 443 (HTTPS), 22 (SSH), 53 (DNS), 5432 (Postgres), 6379 (Redis).",
          "When services can't communicate, debug layer by layer: nslookup → ping → telnet → curl → app logs.",
          "Binding to 127.0.0.1 means local-only access. Binding to 0.0.0.0 means accepting connections from any network interface. This is the most common deployment mistake.",
        ]}
      />
    </div>
  );
}
