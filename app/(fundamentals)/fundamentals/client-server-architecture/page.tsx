"use client";

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
import { Monitor, Server, Database, ArrowDown } from "lucide-react";

export default function ClientServerArchitecturePage() {
  return (
    <div className="space-y-8">
      <TopicHero
        title="Client-Server Architecture"
        subtitle="The most fundamental pattern in distributed systems. One machine asks, another answers. Simple in theory — surprisingly nuanced in practice."
        difficulty="beginner"
      />

      <FailureScenario title="Your app tries to do everything on the client">
        <p className="text-sm text-muted-foreground">
          You build a to-do app that stores everything in <code className="text-xs bg-muted px-1 rounded font-mono">localStorage</code>.
          It works great — until your user opens it on their phone and all their tasks are gone.
          They clear browser data — everything vanishes. Two users want to share a list? Impossible.
        </p>
        <p className="text-sm text-muted-foreground">
          You&apos;ve built a <strong>client-only</strong> application. No central source
          of truth, no persistence beyond a single device, no way for clients to coordinate.
        </p>
        <div className="flex items-center justify-center gap-4 py-3">
          <ServerNode type="client" label="Laptop" sublabel="12 tasks" status="healthy" />
          <span className="text-muted-foreground/40 font-mono text-sm">&ne;</span>
          <ServerNode type="client" label="Phone" sublabel="0 tasks" status="unhealthy" />
          <span className="text-muted-foreground/40 font-mono text-sm">&ne;</span>
          <ServerNode type="client" label="Tablet" sublabel="3 tasks" status="warning" />
        </div>
      </FailureScenario>

      <WhyItBreaks title="Clients are ephemeral and isolated">
        <p className="text-sm text-muted-foreground mb-3">
          A client is a program running on someone else&apos;s device. You don&apos;t control it.
          It can be closed, cleared, or destroyed at any time. Worse, clients can&apos;t talk
          to each other directly.
        </p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "No durability", desc: "Client storage can be wiped without warning" },
            { label: "No consistency", desc: "Each client has its own copy of data" },
            { label: "No authority", desc: "Who decides the \"real\" state?" },
            { label: "No security", desc: "Client code can be inspected and modified" },
          ].map((item) => (
            <div key={item.label} className="rounded-lg bg-muted/30 p-3">
              <p className="text-xs font-semibold text-orange-400">{item.label}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{item.desc}</p>
            </div>
          ))}
        </div>
      </WhyItBreaks>

      <ConceptVisualizer title="The Client-Server Model">
        <p className="text-sm text-muted-foreground mb-4">
          The fix is deceptively simple: introduce a <strong>server</strong>. A long-running
          process on a machine you control. It becomes the single source of truth. Clients send
          requests; the server processes them and responds.
        </p>
        <div className="flex flex-col items-center gap-4 py-2">
          <div className="flex items-center justify-center gap-6">
            <ServerNode type="client" label="Mobile" status="healthy" />
            <ServerNode type="client" label="Browser" status="healthy" />
            <ServerNode type="client" label="Desktop" status="healthy" />
          </div>
          <div className="flex flex-col items-center text-muted-foreground/40">
            <ArrowDown className="size-4" />
            <span className="text-[10px] font-mono">HTTP</span>
          </div>
          <ServerNode type="server" label="API Server" sublabel="Source of truth" status="healthy" />
          <div className="flex flex-col items-center text-muted-foreground/40">
            <ArrowDown className="size-4" />
          </div>
          <ServerNode type="database" label="Database" sublabel="Persistent" status="healthy" />
        </div>
        <ConversationalCallout type="tip">
          &quot;Server&quot; doesn&apos;t mean one physical machine. It means any process that
          accepts and responds to requests — one machine, ten machines, or a serverless function.
        </ConversationalCallout>
      </ConceptVisualizer>

      <ConceptVisualizer title="The Request-Response Cycle">
        <p className="text-sm text-muted-foreground mb-4">
          Every interaction follows the same pattern. This cycle is the heartbeat of the web.
        </p>
        <AnimatedFlow
          steps={[
            { id: "action", label: "User Action", description: "Click, submit, navigate", icon: <Monitor className="size-4" /> },
            { id: "request", label: "HTTP Request", description: "Serialized and sent", icon: <ArrowDown className="size-4 -rotate-90" /> },
            { id: "process", label: "Server Logic", description: "Validate, compute, query", icon: <Server className="size-4" /> },
            { id: "db", label: "Database", description: "Read or write data", icon: <Database className="size-4" /> },
            { id: "response", label: "Response", description: "Status code + body", icon: <ArrowDown className="size-4 rotate-90" /> },
            { id: "render", label: "UI Update", description: "Render the new state", icon: <Monitor className="size-4" /> },
          ]}
          interval={1800}
        />
      </ConceptVisualizer>

      <InteractiveDemo title="Client vs Server Responsibilities">
        {({ isPlaying, tick }) => {
          const clientTasks = [
            "Render UI",
            "Handle user input",
            "Client-side validation",
            "Manage local state",
            "Cache responses",
          ];
          const serverTasks = [
            "Authenticate users",
            "Authorize access",
            "Business logic",
            "Database operations",
            "Data validation",
          ];
          const visibleCount = isPlaying ? Math.min((tick % 6) + 1, 5) : 0;

          return (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Press play to reveal what belongs on each side. A common mistake is putting
                server responsibilities on the client.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <h3 className="text-xs font-semibold flex items-center gap-2 mb-2 text-blue-400">
                    <Monitor className="size-3.5" /> Client
                  </h3>
                  {clientTasks.map((task, i) => (
                    <div
                      key={task}
                      className={cn(
                        "text-xs px-3 py-2 rounded-lg border transition-all duration-400",
                        i < visibleCount
                          ? "bg-blue-500/8 border-blue-500/20 text-foreground"
                          : "bg-muted/10 border-border/30 text-muted-foreground/30"
                      )}
                    >
                      {task}
                    </div>
                  ))}
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-xs font-semibold flex items-center gap-2 mb-2 text-emerald-400">
                    <Server className="size-3.5" /> Server
                  </h3>
                  {serverTasks.map((task, i) => (
                    <div
                      key={task}
                      className={cn(
                        "text-xs px-3 py-2 rounded-lg border transition-all duration-400",
                        i < visibleCount
                          ? "bg-emerald-500/8 border-emerald-500/20 text-foreground"
                          : "bg-muted/10 border-border/30 text-muted-foreground/30"
                      )}
                    >
                      {task}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        }}
      </InteractiveDemo>

      <AhaMoment
        question="If the server is the source of truth, what happens when it goes down?"
        answer={
          <p>
            Exactly the problem that drives the rest of system design. A single server is a
            single point of failure. This leads to load balancers, replicas, failover strategies —
            all the patterns in later topics. Client-server is the starting point, not the finish line.
          </p>
        }
      />

      <CorrectApproach title="Designing a Proper Client-Server Split">
        <p className="text-sm text-muted-foreground mb-3">
          The golden rule: <strong>never trust the client</strong>. The client is for presentation.
          The server is for data integrity and business rules.
        </p>
        <BeforeAfter
          before={{
            title: "Dangerous: Logic on client",
            content: (
              <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground mb-2">Anyone can open DevTools:</p>
                <div className="bg-muted/30 p-2.5 rounded-lg text-xs font-mono space-y-0.5">
                  <p className="text-red-400">{'if (user.role === "admin")'}</p>
                  <p className="text-red-400 pl-3">{'showDeleteButton();'}</p>
                  <p className="text-red-400 mt-1.5">{'const total = qty * price;'}</p>
                </div>
              </div>
            ),
          }}
          after={{
            title: "Safe: Logic on server",
            content: (
              <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground mb-2">Server validates every request:</p>
                <div className="bg-muted/30 p-2.5 rounded-lg text-xs font-mono space-y-0.5">
                  <p className="text-emerald-400">{'if (!hasPermission(user, "delete"))'}</p>
                  <p className="text-emerald-400 pl-3">{'return 403 Forbidden;'}</p>
                  <p className="text-emerald-400 mt-1.5">{'total = calculatePrice(order);'}</p>
                </div>
              </div>
            ),
          }}
        />
      </CorrectApproach>

      <ConceptVisualizer title="Common Server Roles">
        <p className="text-sm text-muted-foreground mb-4">
          As systems grow, the &quot;server&quot; splits into specialized services — but they
          all follow the same request-response pattern.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <ServerNode type="server" label="Web Server" sublabel="HTML/CSS/JS" status="healthy" />
          <ServerNode type="server" label="API Server" sublabel="Business logic" status="healthy" />
          <ServerNode type="database" label="Database" sublabel="Persistent data" status="healthy" />
          <ServerNode type="cache" label="Cache" sublabel="Fast reads" status="healthy" />
          <ServerNode type="loadbalancer" label="Load Balancer" sublabel="Traffic routing" status="healthy" />
          <ServerNode type="cloud" label="CDN" sublabel="Static assets" status="healthy" />
        </div>
      </ConceptVisualizer>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCounter label="Avg Response" value={120} unit="ms" trend="neutral" />
        <MetricCounter label="Requests/sec" value={1500} trend="neutral" />
        <MetricCounter label="Uptime" value={99.9} unit="%" trend="down" />
        <MetricCounter label="Error Rate" value={0.1} unit="%" trend="down" />
      </div>

      <ConversationalCallout type="warning">
        Interview trap: describing a system where the client directly queries the database.
        The server exists to enforce rules, validate input, and prevent unauthorized access.
        Without it, anyone with an HTTP client can read or modify your data.
      </ConversationalCallout>

      <KeyTakeaway
        points={[
          "Client-server separates concerns: clients handle presentation, servers handle data and logic.",
          "Never trust the client — security, validation, and business logic must be server-side.",
          "The server is the single source of truth. Without it, clients have inconsistent, ephemeral data.",
          "A single server is a single point of failure — this tension drives load balancing, replication, and failover.",
          "In interviews, always identify what is the client and what is the server before diving into details.",
        ]}
      />
    </div>
  );
}
