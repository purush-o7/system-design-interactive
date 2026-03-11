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
import { BeforeAfter } from "@/components/before-after";
import { InteractiveDemo } from "@/components/interactive-demo";
import { AhaMoment } from "@/components/aha-moment";
import { ConversationalCallout } from "@/components/conversational-callout";
import { cn } from "@/lib/utils";
import { Box, Boxes, ArrowRight, GitBranch, Rocket, Users } from "lucide-react";

const moduleActiveStyles: Record<string, string> = {
  blue: "border-dashed border-blue-500/40 bg-blue-500/10 text-blue-400",
  emerald: "border-dashed border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
  violet: "border-dashed border-violet-500/40 bg-violet-500/10 text-violet-400",
  orange: "border-dashed border-orange-500/40 bg-orange-500/10 text-orange-400",
};

const moduleBorderColors: Record<string, string> = {
  blue: "var(--color-blue-500)",
  emerald: "var(--color-emerald-500)",
  violet: "var(--color-violet-500)",
  orange: "var(--color-orange-500)",
};

function MonolithSplitViz() {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setPhase((p) => (p + 1) % 5), 2200);
    return () => clearInterval(t);
  }, []);

  const modules = [
    { name: "Auth", color: "blue", team: "A" },
    { name: "Orders", color: "emerald", team: "B" },
    { name: "Payments", color: "violet", team: "C" },
    { name: "Notifications", color: "orange", team: "D" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-2 text-[11px] font-medium text-muted-foreground">
        {["Monolith", "Identify Seams", "Extract First", "Extract More", "Independent"].map((label, i) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className={cn(
              "size-2 rounded-full transition-all duration-500",
              phase >= i ? "bg-emerald-500 scale-110" : "bg-muted-foreground/20"
            )} />
            <span className={cn(
              "transition-colors duration-300 hidden sm:inline",
              phase === i ? "text-foreground" : "text-muted-foreground/50"
            )}>{label}</span>
          </div>
        ))}
      </div>

      <div className="relative flex items-center justify-center py-6">
        {phase < 2 ? (
          <div className={cn(
            "rounded-xl border-2 p-4 transition-all duration-700 w-full max-w-xs",
            phase === 0 ? "border-border bg-muted/20" : "border-dashed border-orange-500/40 bg-orange-500/5"
          )}>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground/60 mb-2 text-center">
              Single Deployable Unit
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {modules.map((m, i) => (
                <div
                  key={m.name}
                  className={cn(
                    "rounded-md border px-2.5 py-1.5 text-xs font-medium text-center transition-all duration-500",
                    phase === 1
                      ? moduleActiveStyles[m.color]
                      : "border-border/50 bg-muted/30 text-muted-foreground"
                  )}
                  style={phase === 1 ? {
                    borderColor: moduleBorderColors[m.color],
                    opacity: 0.8 + i * 0.05,
                  } : {}}
                >
                  <div>{m.name}</div>
                  <div className="text-[9px] text-muted-foreground/50">Team {m.team}</div>
                </div>
              ))}
            </div>
            {phase === 0 && (
              <div className="text-[10px] text-center text-muted-foreground/50 mt-2">
                1 repo, 1 database, 1 deploy pipeline
              </div>
            )}
            {phase === 1 && (
              <div className="text-[10px] text-center text-orange-400/70 mt-2">
                Dashed lines = domain boundaries found
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-start gap-3 flex-wrap justify-center">
            {modules.map((m, i) => {
              const extracted = phase === 2 ? i === 0 : phase === 3 ? i < 3 : true;
              return (
                <div
                  key={m.name}
                  className={cn(
                    "flex flex-col items-center gap-1.5 transition-all duration-700",
                    extracted ? "opacity-100 translate-y-0" : "opacity-40 translate-y-1"
                  )}
                >
                  <div className={cn(
                    "rounded-lg border px-3 py-2 text-center transition-all duration-500",
                    extracted
                      ? "border-emerald-500/30 bg-emerald-500/10"
                      : "border-border/30 bg-muted/20"
                  )}>
                    <div className="text-xs font-semibold">{m.name}</div>
                    <div className="text-[9px] text-muted-foreground/60">Team {m.team}</div>
                  </div>
                  {extracted && (
                    <div className={cn(
                      "rounded border px-1.5 py-0.5 text-[9px] font-mono text-muted-foreground/60 transition-all",
                      "bg-muted/30 border-border/30"
                    )}>
                      own DB
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <p className="text-[11px] text-muted-foreground/60 text-center">
        {phase === 0 && "All modules share one codebase, one database, one deploy pipeline."}
        {phase === 1 && "Domain-driven design reveals natural service boundaries."}
        {phase === 2 && "Extract the most painful module first. Auth gets its own repo and database."}
        {phase === 3 && "Three services extracted. Notifications still lives in the remaining monolith."}
        {phase === 4 && "Each service deploys independently. Teams own their service end-to-end."}
      </p>
    </div>
  );
}

function DeploymentComparisonViz() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((s) => (s + 1) % 12), 800);
    return () => clearInterval(t);
  }, []);

  const monoStages = [
    { label: "Merge all PRs", done: tick >= 2 },
    { label: "Run full test suite", done: tick >= 5 },
    { label: "Build monolith", done: tick >= 7 },
    { label: "Deploy everything", done: tick >= 9 },
  ];

  const microStages = [
    { label: "Merge Order PR", done: tick >= 1 },
    { label: "Run Order tests", done: tick >= 2 },
    { label: "Build Order image", done: tick >= 3 },
    { label: "Deploy Order only", done: tick >= 4 },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="space-y-1.5">
        <div className="text-[11px] font-semibold text-orange-400 mb-2 flex items-center gap-1.5">
          <Box className="size-3" /> Monolith Deploy
        </div>
        {monoStages.map((s) => (
          <div key={s.label} className="flex items-center gap-2">
            <div className={cn(
              "size-1.5 rounded-full transition-all",
              s.done ? "bg-orange-400" : "bg-muted-foreground/20"
            )} />
            <span className={cn(
              "text-[11px] transition-colors",
              s.done ? "text-orange-400" : "text-muted-foreground/40"
            )}>{s.label}</span>
          </div>
        ))}
        <div className={cn(
          "text-[10px] font-mono mt-1 transition-opacity",
          tick >= 9 ? "opacity-100 text-orange-400" : "opacity-0"
        )}>
          Total: ~45 minutes
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="text-[11px] font-semibold text-emerald-400 mb-2 flex items-center gap-1.5">
          <Boxes className="size-3" /> Microservice Deploy
        </div>
        {microStages.map((s) => (
          <div key={s.label} className="flex items-center gap-2">
            <div className={cn(
              "size-1.5 rounded-full transition-all",
              s.done ? "bg-emerald-400" : "bg-muted-foreground/20"
            )} />
            <span className={cn(
              "text-[11px] transition-colors",
              s.done ? "text-emerald-400" : "text-muted-foreground/40"
            )}>{s.label}</span>
          </div>
        ))}
        <div className={cn(
          "text-[10px] font-mono mt-1 transition-opacity",
          tick >= 4 ? "opacity-100 text-emerald-400" : "opacity-0"
        )}>
          Total: ~8 minutes
        </div>
      </div>
    </div>
  );
}

export default function MicroservicesVsMonolithPage() {
  return (
    <div className="space-y-8">
      <TopicHero
        title="Microservices vs Monolith"
        subtitle="The grass is always greener on the other architecture. Understanding when each one shines -- and when it collapses -- saves you years of regret."
        difficulty="intermediate"
      />

      <FailureScenario title="50 developers, 1 deploy button, 0 deploys this week">
        <p className="text-sm text-muted-foreground">
          Your company has grown to 50 engineers across 8 teams. Everyone works in the same
          monolithic codebase. On Tuesday, Team A merges a change to the payment module.
          It breaks a shared utility that Team B&apos;s notification service depends on.
          <strong className="text-red-400"> CI goes red. Nobody can deploy.</strong> Three teams are blocked for two days
          while Team A and Team B argue about who owns the broken utility function.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          This is not hypothetical. In 2008, Netflix experienced a catastrophic database corruption
          that brought their entire monolithic DVD service down for three days. The outage triggered
          a seven-year migration to over 700 microservices that today handle 15+ billion API calls daily.
        </p>
        <div className="flex items-center justify-center gap-4 py-4">
          <ServerNode type="server" label="Monolith" sublabel="All 8 teams" status="unhealthy" />
          <span className="text-red-500 text-lg font-mono font-bold">CI FAILED</span>
        </div>
      </FailureScenario>

      <WhyItBreaks>
        <p className="text-sm text-muted-foreground">
          A monolith couples all modules into a single deployable unit. This means:
        </p>
        <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
          <li><strong>Shared codebase ownership</strong> -- one team&apos;s mistake blocks every other team</li>
          <li><strong>Single deployment pipeline</strong> -- you cannot deploy the billing fix without also deploying the half-finished search refactor</li>
          <li><strong>Scaling is all-or-nothing</strong> -- if the image processing module needs more CPU, you scale the entire application</li>
          <li><strong>Technology lock-in</strong> -- every module must use the same language, framework, and dependency versions</li>
          <li><strong>Blast radius is the entire system</strong> -- a memory leak in one module crashes all modules</li>
        </ul>
      </WhyItBreaks>

      <ConceptVisualizer title="The Architecture Spectrum">
        <p className="text-sm text-muted-foreground mb-4">
          Watch a monolith get decomposed into independent services. This is the journey Netflix
          took from 2008 to 2015, Amazon took starting in 2001, and Uber took starting in 2012.
        </p>
        <MonolithSplitViz />
      </ConceptVisualizer>

      <ConceptVisualizer title="Deployment Independence — The Real Win">
        <p className="text-sm text-muted-foreground mb-4">
          The biggest practical difference is not technical -- it is organizational. With microservices,
          Team B can deploy a bug fix to the Orders service without waiting for Team A to finish
          their Auth refactor. Amazon reportedly deploys new code every 11.7 seconds on average.
        </p>
        <DeploymentComparisonViz />
        <ConversationalCallout type="tip">
          Amazon&apos;s CTO Werner Vogels famously said their move to microservices in 2001 was driven by
          organizational pain, not technical ambition. Teams were stepping on each other in a shared
          codebase. The &quot;two-pizza team&quot; rule was born from this migration.
        </ConversationalCallout>
      </ConceptVisualizer>

      <ConceptVisualizer title="The Hidden Cost: Operational Complexity">
        <p className="text-sm text-muted-foreground mb-4">
          Microservices do not eliminate complexity -- they relocate it from the codebase to the
          infrastructure. Here is what you need that a monolith does not require:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {[
            { label: "Service Discovery", desc: "How services find each other", icon: "🔍" },
            { label: "Distributed Tracing", desc: "Jaeger, Zipkin, or Datadog", icon: "📡" },
            { label: "Circuit Breakers", desc: "Prevent cascade failures", icon: "🔌" },
            { label: "API Gateways", desc: "Single entry point for clients", icon: "🚪" },
            { label: "Container Orchestration", desc: "Kubernetes, ECS, Nomad", icon: "🎛️" },
            { label: "Centralized Logging", desc: "Aggregate logs from 100+ services", icon: "📋" },
          ].map((item) => (
            <div key={item.label} className="rounded-lg border bg-muted/20 p-2.5">
              <div className="text-xs font-semibold mb-0.5">{item.label}</div>
              <div className="text-[10px] text-muted-foreground/60">{item.desc}</div>
            </div>
          ))}
        </div>
      </ConceptVisualizer>

      <CorrectApproach title="When to Use Which">
        <BeforeAfter
          before={{
            title: "Monolith works when...",
            content: (
              <ul className="text-sm space-y-1.5 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Users className="size-3.5 mt-0.5 shrink-0 text-blue-400" />
                  <span>Small team (under 10 engineers)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Rocket className="size-3.5 mt-0.5 shrink-0 text-blue-400" />
                  <span>Early-stage product still finding product-market fit</span>
                </li>
                <li className="flex items-start gap-2">
                  <Box className="size-3.5 mt-0.5 shrink-0 text-blue-400" />
                  <span>Simple domain with few bounded contexts</span>
                </li>
                <li className="flex items-start gap-2">
                  <GitBranch className="size-3.5 mt-0.5 shrink-0 text-blue-400" />
                  <span>Operational complexity budget is low</span>
                </li>
              </ul>
            ),
          }}
          after={{
            title: "Microservices work when...",
            content: (
              <ul className="text-sm space-y-1.5 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Users className="size-3.5 mt-0.5 shrink-0 text-emerald-400" />
                  <span>Multiple teams need to deploy independently</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="size-3.5 mt-0.5 shrink-0 text-emerald-400" />
                  <span>Different modules have different scaling needs</span>
                </li>
                <li className="flex items-start gap-2">
                  <Boxes className="size-3.5 mt-0.5 shrink-0 text-emerald-400" />
                  <span>Clear domain boundaries exist between services</span>
                </li>
                <li className="flex items-start gap-2">
                  <Rocket className="size-3.5 mt-0.5 shrink-0 text-emerald-400" />
                  <span>You can invest in infrastructure (CI/CD, monitoring, service mesh)</span>
                </li>
              </ul>
            ),
          }}
        />
      </CorrectApproach>

      <ConceptVisualizer title="The Migration Path">
        <p className="text-sm text-muted-foreground mb-4">
          You rarely go from zero to microservices. Netflix did not rewrite everything at once --
          they started with non-critical services like movie encoding, refined their approach,
          then tackled the core streaming pipeline. The Strangler Fig pattern is the safest path.
        </p>
        <AnimatedFlow
          steps={[
            { id: "monolith", label: "Monolith", description: "Everything in one codebase", icon: <Box className="size-4" /> },
            { id: "identify", label: "Identify Seams", description: "Use DDD to find bounded contexts", icon: <GitBranch className="size-4" /> },
            { id: "extract", label: "Strangler Fig", description: "Route traffic to new service, keep old as fallback", icon: <ArrowRight className="size-4" /> },
            { id: "api", label: "Define Contracts", description: "Service communicates via well-defined APIs", icon: <Boxes className="size-4" /> },
            { id: "repeat", label: "Repeat", description: "Extract next service when pain justifies it", icon: <Rocket className="size-4" /> },
          ]}
          interval={2200}
        />
      </ConceptVisualizer>

      <InteractiveDemo title="Team Scaling Simulator">
        {({ isPlaying, tick }) => {
          const stage = isPlaying ? Math.min(tick % 8, 5) : 0;
          const scenarios = [
            { engineers: 3, teams: 1, arch: "Monolith", deployFreq: "10/day", pain: "None", verdict: "healthy" as const },
            { engineers: 10, teams: 2, arch: "Monolith", deployFreq: "5/day", pain: "Low", verdict: "healthy" as const },
            { engineers: 25, teams: 4, arch: "Monolith", deployFreq: "2/day", pain: "Growing", verdict: "warning" as const },
            { engineers: 50, teams: 8, arch: "Monolith", deployFreq: "2/week", pain: "High", verdict: "unhealthy" as const },
            { engineers: 50, teams: 8, arch: "Microservices", deployFreq: "50/day", pain: "Infra cost", verdict: "warning" as const },
            { engineers: 200, teams: 25, arch: "Microservices", deployFreq: "200/day", pain: "Manageable", verdict: "healthy" as const },
          ];
          const s = scenarios[stage];

          return (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Press play to simulate growing a team from 3 to 200 engineers. Watch when
                the monolith starts hurting and microservices start making sense.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { label: "Engineers", value: s.engineers },
                  { label: "Teams", value: s.teams },
                  { label: "Architecture", value: s.arch },
                  { label: "Deploy Freq", value: s.deployFreq },
                  { label: "Pain Level", value: s.pain },
                ].map((m) => (
                  <div key={m.label} className="rounded-lg border bg-muted/20 p-2 text-center">
                    <div className="text-[10px] text-muted-foreground/60">{m.label}</div>
                    <div className="text-xs font-semibold mt-0.5">{m.value}</div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center">
                <ServerNode
                  type="server"
                  label={s.arch}
                  sublabel={`${s.engineers} engineers`}
                  status={s.verdict}
                />
              </div>
            </div>
          );
        }}
      </InteractiveDemo>

      <AhaMoment
        question="Should a startup begin with microservices?"
        answer={
          <p>
            Almost never. Shopify runs one of the largest e-commerce platforms on a monolithic
            Ruby on Rails app with over 3 million merchants. And in 2023, Amazon Prime Video
            moved a monitoring tool <em>from</em> microservices <em>back to</em> a monolith,
            reducing costs by 90%. Start with a well-structured monolith. Microservices solve
            organizational scaling problems (multiple teams, independent deployments), not technical
            ones. If you have 3 engineers, microservices add network complexity, distributed
            debugging, and operational overhead with zero benefit.
          </p>
        }
      />

      <ConversationalCallout type="warning">
        The &quot;distributed monolith&quot; is the worst of both worlds. It happens when
        microservices are tightly coupled -- they must be deployed together, they share a database,
        or they make synchronous calls in long chains. You get the operational complexity of
        microservices with none of the independence. If your services cannot deploy independently,
        you do not have microservices. You have a monolith with network calls.
      </ConversationalCallout>

      <ConversationalCallout type="tip">
        In interviews, never say &quot;microservices are better.&quot; The correct answer is always
        &quot;it depends on team size, domain complexity, and operational maturity.&quot; Then explain
        the tradeoffs for the specific scenario. Mention the Netflix migration as an example of when
        it was the right call, and Amazon Prime Video as an example of when reverting was smart.
      </ConversationalCallout>

      <KeyTakeaway
        points={[
          "A monolith is a single deployable unit -- simple to develop and deploy, but coupling becomes painful as the team grows beyond 10-15 engineers.",
          "Microservices decompose the system by business domain, enabling independent deployment and scaling at the cost of operational complexity (service discovery, distributed tracing, circuit breakers).",
          "Start with a monolith. Extract services only when organizational pain (blocked deployments, team coupling) justifies the infrastructure investment. Netflix took 7 years to migrate.",
          "The 'distributed monolith' anti-pattern happens when microservices are tightly coupled -- services that must deploy together are not independent services.",
          "Each microservice should own its own data. Sharing a database between services recreates the coupling you were trying to escape.",
        ]}
      />
    </div>
  );
}
