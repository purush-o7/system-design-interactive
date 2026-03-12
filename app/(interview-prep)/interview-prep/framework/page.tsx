"use client";

import { useState, useEffect, useRef } from "react";
import { TopicHero } from "@/components/topic-hero";
import { FailureScenario } from "@/components/failure-scenario";
import { WhyItBreaks } from "@/components/why-it-breaks";
import { ConceptVisualizer } from "@/components/concept-visualizer";
import { CorrectApproach } from "@/components/correct-approach";
import { KeyTakeaway } from "@/components/key-takeaway";
import { AnimatedFlow } from "@/components/animated-flow";
import { MetricCounter } from "@/components/metric-counter";
import { InteractiveDemo } from "@/components/interactive-demo";
import { ConversationalCallout } from "@/components/conversational-callout";
import { AhaMoment } from "@/components/aha-moment";
import { BeforeAfter } from "@/components/before-after";
import { cn } from "@/lib/utils";
import {
  Search,
  Layout,
  Microscope,
  Scale,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  User,
  UserCheck,
  Calculator,
  Database,
  Zap,
  HardDrive,
  TrendingUp,
  Building2,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Chat-style failure dialogue — visceral, concrete, unforgettable
// ---------------------------------------------------------------------------
interface ChatMessage {
  role: "interviewer" | "candidate";
  text: string;
  mood?: "neutral" | "confused" | "panic" | "disappointed";
}

const failureDialogue: ChatMessage[] = [
  { role: "interviewer", text: "Design a URL shortener.", mood: "neutral" },
  { role: "candidate", text: "Sure! So I will create a MySQL table with columns id, original_url, short_code, created_at...", mood: "neutral" },
  { role: "interviewer", text: "Before the schema \u2014 how many users are we designing for?", mood: "confused" },
  { role: "candidate", text: "Um... maybe a few thousand?", mood: "panic" },
  { role: "interviewer", text: "Our target is 100 million daily active users.", mood: "neutral" },
  { role: "candidate", text: "Oh. Then... I guess we need sharding? Let me redo the schema...", mood: "panic" },
  { role: "interviewer", text: "What is the read-to-write ratio? What QPS should we plan for?", mood: "confused" },
  { role: "candidate", text: "I... haven't calculated that yet.", mood: "panic" },
  { role: "interviewer", text: "(Internally: candidate skipped requirements and estimation. Design is untethered from reality.)", mood: "disappointed" },
];

function FailureDialogue() {
  const [visibleCount, setVisibleCount] = useState(1);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (visibleCount >= failureDialogue.length) return;
    const t = setTimeout(() => setVisibleCount((c) => c + 1), 1800);
    return () => clearTimeout(t);
  }, [visibleCount]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [visibleCount]);

  const moodBorder: Record<string, string> = {
    confused: "border-l-amber-500",
    panic: "border-l-red-500",
    disappointed: "border-l-red-700",
    neutral: "border-l-transparent",
  };

  return (
    <div className="flex flex-col gap-2 max-h-[360px] overflow-y-auto pr-1">
      {failureDialogue.slice(0, visibleCount).map((msg, i) => (
        <div
          key={i}
          className={cn(
            "max-w-[85%] rounded-lg border border-l-2 px-3 py-2 text-xs leading-relaxed transition-all animate-in fade-in slide-in-from-bottom-2 duration-300",
            msg.role === "interviewer"
              ? "bg-blue-500/10 border-blue-500/20 text-blue-300 self-start"
              : "bg-muted/30 border-border/30 text-muted-foreground self-end",
            moodBorder[msg.mood ?? "neutral"]
          )}
        >
          <span className="font-semibold text-[10px] uppercase tracking-wider block mb-0.5 opacity-60">
            {msg.role === "interviewer" ? "Interviewer" : "Candidate"}
          </span>
          {msg.text}
        </div>
      ))}
      <div ref={bottomRef} />
      {visibleCount < failureDialogue.length && (
        <div className="flex items-center gap-1.5 self-start px-3 py-1.5 text-[10px] text-muted-foreground/40">
          <span className="animate-pulse">typing</span>
          <span className="animate-bounce">.</span>
          <span className="animate-bounce">.</span>
          <span className="animate-bounce">.</span>
        </div>
      )}
      {visibleCount >= failureDialogue.length && (
        <button
          onClick={() => setVisibleCount(1)}
          className="text-[10px] text-red-400/60 hover:text-red-400 transition-colors self-center mt-1"
        >
          replay dialogue
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Clickable InterviewTimeline — click a phase bar to jump to its section
// ---------------------------------------------------------------------------
const timelinePhases = [
  { label: "Requirements", start: 0, end: 5, color: "blue" as const, icon: "?", sectionId: "phase-requirements" },
  { label: "Estimation", start: 5, end: 10, color: "purple" as const, icon: "#", sectionId: "phase-estimation" },
  { label: "High-Level Design", start: 10, end: 25, color: "emerald" as const, icon: "\u25A1", sectionId: "phase-highlevel" },
  { label: "Deep Dive", start: 25, end: 40, color: "orange" as const, icon: "\u25C6", sectionId: "phase-deepdive" },
  { label: "Trade-offs & Wrap-up", start: 40, end: 45, color: "red" as const, icon: "\u2696", sectionId: "phase-tradeoffs" },
];

const phaseActiveMap: Record<string, string> = {
  blue: "bg-blue-500/10 border-blue-500/30 text-blue-400 ring-1 ring-blue-500/20",
  purple: "bg-purple-500/10 border-purple-500/30 text-purple-400 ring-1 ring-purple-500/20",
  emerald: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 ring-1 ring-emerald-500/20",
  orange: "bg-orange-500/10 border-orange-500/30 text-orange-400 ring-1 ring-orange-500/20",
  red: "bg-red-500/10 border-red-500/30 text-red-400 ring-1 ring-red-500/20",
};

const phaseFillMap: Record<string, string> = {
  blue: "bg-blue-500/10",
  purple: "bg-purple-500/10",
  emerald: "bg-emerald-500/10",
  orange: "bg-orange-500/10",
  red: "bg-red-500/10",
};

function InterviewTimeline() {
  const [elapsed, setElapsed] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const t = setInterval(() => setElapsed((e) => Math.min(e + 1, 49)), 600);
    return () => clearInterval(t);
  }, [isPaused]);

  const currentMinute = Math.min(elapsed, 45);

  const jumpToPhase = (sectionId: string, start: number) => {
    setElapsed(start);
    setIsPaused(true);
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => setIsPaused(false), 3000);
  };

  return (
    <div className="space-y-3">
      <div className="relative h-8 rounded-lg bg-muted/20 border border-border/50 overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500/20 via-emerald-500/20 to-orange-500/20 transition-all duration-500"
          style={{ width: `${(currentMinute / 45) * 100}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-mono font-bold">
            {currentMinute < 45 ? `${currentMinute} / 45 min` : "Done!"}
          </span>
        </div>
      </div>

      <div className="space-y-1.5">
        {timelinePhases.map((phase) => {
          const duration = phase.end - phase.start;
          const isActive = currentMinute >= phase.start && currentMinute < phase.end;
          const isComplete = currentMinute >= phase.end;
          const progress = isActive
            ? ((currentMinute - phase.start) / duration) * 100
            : isComplete
            ? 100
            : 0;

          return (
            <button
              key={phase.label}
              onClick={() => jumpToPhase(phase.sectionId, phase.start)}
              className="flex items-center gap-3 w-full text-left group"
            >
              <span className="text-[10px] font-mono text-muted-foreground/60 w-12 text-right">
                {phase.start}-{phase.end}m
              </span>
              <div className="flex-1 relative">
                <div
                  className={cn(
                    "h-8 rounded-md flex items-center px-3 gap-2 text-xs font-medium transition-all duration-300 border relative overflow-hidden cursor-pointer group-hover:ring-2 group-hover:ring-primary/20",
                    isActive
                      ? phaseActiveMap[phase.color]
                      : isComplete
                      ? "bg-emerald-500/5 border-emerald-500/15 text-emerald-400/70"
                      : "bg-muted/10 border-border/30 text-muted-foreground/30"
                  )}
                  style={{ width: `${30 + (duration / 15) * 50}%` }}
                >
                  {isActive && (
                    <div
                      className={cn(
                        "absolute inset-y-0 left-0 transition-all duration-500",
                        phaseFillMap[phase.color]
                      )}
                      style={{ width: `${progress}%` }}
                    />
                  )}
                  <span className="relative z-10">{phase.icon}</span>
                  <span className="relative z-10">{phase.label}</span>
                  <span className="relative z-10 ml-auto text-[10px] font-mono opacity-60">{duration}m</span>
                </div>
              </div>
              {isComplete && <CheckCircle2 className="size-3.5 text-emerald-400/50" />}
            </button>
          );
        })}
      </div>

      <p className="text-[11px] text-muted-foreground/60 pl-16 pt-1">
        {currentMinute < 5
          ? "Asking clarifying questions, defining scope..."
          : currentMinute < 10
          ? "Calculating QPS, storage, bandwidth..."
          : currentMinute < 25
          ? "Drawing components, APIs, data flow..."
          : currentMinute < 40
          ? "Diving into critical components, showing expertise..."
          : currentMinute < 45
          ? "Discussing trade-offs, bottlenecks, future scaling..."
          : "Interview complete. Time to breathe."}
      </p>
      <p className="text-[10px] text-muted-foreground/40 pl-16">
        Click any phase bar to jump to its detailed description below.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Company format comparison (enriched, moved up in page order)
// ---------------------------------------------------------------------------
function CompanyFormatComparison() {
  const [selected, setSelected] = useState(0);

  const companies = [
    {
      name: "Google",
      duration: "45 min",
      rounds: "1-2 SD rounds",
      emphasis: "Algorithm depth & distributed systems",
      focus: "Scalability, distributed systems, data modeling. Interviewers probe deeply into one area. They want to see you reason about consistency vs availability trade-offs in distributed environments.",
      tip: "Google interviewers often redirect you. Follow their lead \u2014 they are steering you toward what they want to evaluate. When they ask \u201cwhat if this fails?\u201d go deep on fault tolerance.",
      signal: "Consensus protocols, sharding strategies, cache invalidation, data replication lag.",
    },
    {
      name: "Meta",
      duration: "40-45 min",
      rounds: "1 SD round",
      emphasis: "Product thinking first",
      focus: "Product-oriented design. They care about the user experience and how it maps to the backend. Start from the product, not the infrastructure.",
      tip: "Start with the product. \u201cWhat does the user see?\u201d before \u201cWhat does the server do?\u201d Meta rewards product sense. Draw the user journey before the architecture.",
      signal: "News feed ranking, real-time features, privacy controls, product edge cases.",
    },
    {
      name: "Amazon",
      duration: "45 min",
      rounds: "1 SD round",
      emphasis: "Failure modes & operational excellence",
      focus: "Operational excellence, fault tolerance, and scalability. Expect deep questions about failure modes, monitoring, and recovery. Heavily influenced by Leadership Principles.",
      tip: "Amazon values operational thinking. Always mention monitoring, alerting, blast radius, and what happens when things break.",
      signal: "Circuit breakers, retry storms, cascading failures, deployment strategies, rollback plans.",
    },
    {
      name: "Microsoft",
      duration: "45-60 min",
      rounds: "1-2 SD rounds",
      emphasis: "Breadth of coverage",
      focus: "End-to-end design including APIs, data flow, and scaling. Often Azure-adjacent problems. They value breadth of design coverage.",
      tip: "Be ready to discuss both breadth and depth. Microsoft interviews often cover more ground. They appreciate when you mention specific technologies and justify choices.",
      signal: "API design, data migration, multi-tenant architecture, enterprise scale.",
    },
    {
      name: "Apple",
      duration: "45 min",
      rounds: "1 SD round",
      emphasis: "Privacy & user experience",
      focus: "Privacy, security, and user experience alongside scalability. Design decisions must account for end-to-end encryption and data minimization.",
      tip: "Always consider privacy implications. Apple interviewers notice when you think about user data protection, on-device processing, and minimizing data sent to servers.",
      signal: "End-to-end encryption, on-device vs cloud processing, data retention policies, user consent flows.",
    },
  ];

  const company = companies[selected];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {companies.map((c, i) => (
          <button
            key={c.name}
            onClick={() => setSelected(i)}
            className={cn(
              "text-xs px-3 py-1.5 rounded-full border transition-all flex items-center gap-1.5",
              i === selected
                ? "border-primary bg-primary/10 font-medium"
                : "border-muted bg-muted/30 text-muted-foreground hover:bg-muted/50"
            )}
          >
            <Building2 className="size-3" />
            {c.name}
          </button>
        ))}
      </div>
      <div className="bg-muted/20 rounded-lg border border-border/40 p-4 space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm font-bold">{company.name}</span>
          <span className="text-[10px] font-mono bg-muted/40 px-2 py-0.5 rounded-full">{company.duration}</span>
          <span className="text-[10px] font-mono bg-muted/40 px-2 py-0.5 rounded-full">{company.rounds}</span>
          <span className="text-[10px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">
            {company.emphasis}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">{company.focus}</p>
        <div className="flex items-start gap-2 bg-emerald-500/5 border border-emerald-500/10 rounded-md p-2">
          <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-emerald-400/80">{company.tip}</p>
        </div>
        <div className="flex items-start gap-2 bg-amber-500/5 border border-amber-500/10 rounded-md p-2">
          <AlertTriangle className="size-3.5 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-400/80">
            <span className="font-semibold">They will push you on: </span>
            {company.signal}
          </p>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Requirements gathered via tick (InteractiveDemo integration)
// ---------------------------------------------------------------------------
interface RequirementItem {
  id: string;
  label: string;
  interviewer: string;
  category: "functional" | "non-functional";
}

const requirementsScript: RequirementItem[] = [
  { id: "core-features", label: "Core features: create short URL, redirect to original", interviewer: "What are the two or three core things this system must do?", category: "functional" },
  { id: "user-actions", label: "User actions: paste long URL, get short URL, click short URL", interviewer: "Walk me through the user journey.", category: "functional" },
  { id: "read-write", label: "Read:write ratio is ~100:1 (many more reads than writes)", interviewer: "Is this read-heavy or write-heavy?", category: "functional" },
  { id: "data-model", label: "Key entity: ShortURL mapping (short_code -> original_url)", interviewer: "What is the core data entity?", category: "functional" },
  { id: "scale", label: "100M DAU, ~1,200 write QPS, ~120K read QPS", interviewer: "How many users? What scale are we targeting?", category: "non-functional" },
  { id: "latency", label: "Redirect latency < 100ms (users expect instant)", interviewer: "What latency is acceptable for a redirect?", category: "non-functional" },
  { id: "availability", label: "99.9% availability (downtime = lost clicks = lost revenue)", interviewer: "Can this system go down? What is the cost?", category: "non-functional" },
  { id: "consistency", label: "Eventual consistency OK (new URL can take a few seconds)", interviewer: "Does a new URL need to be available instantly worldwide?", category: "non-functional" },
  { id: "durability", label: "Zero data loss (URLs must work forever once created)", interviewer: "Can we ever lose a URL mapping?", category: "non-functional" },
];

function RequirementsGathering({ tick }: { tick: number }) {
  const revealedCount = Math.min(tick, requirementsScript.length);
  const revealed = requirementsScript.slice(0, revealedCount);
  const total = requirementsScript.length;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Press play and watch an interviewer guide you through requirements gathering.
        Each tick reveals the next question and the requirement you should capture.
      </p>
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 rounded-full bg-muted/20 overflow-hidden">
          <div
            className="h-full bg-emerald-500/60 rounded-full transition-all duration-500"
            style={{ width: `${(revealedCount / total) * 100}%` }}
          />
        </div>
        <span className="text-[11px] font-mono text-muted-foreground">{revealedCount}/{total}</span>
      </div>
      <div className="space-y-2">
        {revealed.map((req) => (
          <div
            key={req.id}
            className="animate-in fade-in slide-in-from-bottom-2 duration-300 rounded-lg border p-3 space-y-1.5"
          >
            <div className="flex items-start gap-2">
              <UserCheck className="size-3.5 text-blue-400 mt-0.5 shrink-0" />
              <p className="text-[11px] text-blue-400 italic">&quot;{req.interviewer}&quot;</p>
            </div>
            <div className="flex items-start gap-2 pl-5">
              <CheckCircle2 className="size-3 text-emerald-400 mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">{req.label}</p>
              <span className={cn(
                "ml-auto text-[9px] font-mono px-1.5 py-0.5 rounded-full shrink-0",
                req.category === "functional" ? "bg-blue-500/10 text-blue-400" : "bg-purple-500/10 text-purple-400"
              )}>
                {req.category === "functional" ? "FR" : "NFR"}
              </span>
            </div>
          </div>
        ))}
      </div>
      {revealedCount === 0 && (
        <p className="text-[11px] text-muted-foreground/40 text-center py-4">
          Press the play button above to start the requirements interview simulation.
        </p>
      )}
      {revealedCount >= total && (
        <div className="text-center text-xs text-emerald-400 font-medium py-2 bg-emerald-500/5 rounded-lg border border-emerald-500/10">
          All requirements gathered in ~5 minutes. You are ready to estimate.
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Estimation practice — step-by-step QPS/storage math via tick
// ---------------------------------------------------------------------------
interface EstimationStep {
  label: string;
  formula: string;
  result: string;
  icon: React.ReactNode;
  note: string;
}

const estimationSteps: EstimationStep[] = [
  { label: "Daily Active Users (DAU)", formula: "Given", result: "100,000,000 (100M)", icon: <User className="size-3.5" />, note: "Always start from the user count. This anchors every other number." },
  { label: "Daily writes", formula: "100M users \u00d7 1 URL/user/day", result: "100,000,000 writes/day", icon: <Database className="size-3.5" />, note: "Assume 1 action per user per day unless told otherwise." },
  { label: "Write QPS", formula: "100M / 86,400 sec/day", result: "~1,160 QPS", icon: <Zap className="size-3.5" />, note: "86,400 = 24 \u00d7 60 \u00d7 60. Round to ~1,200 QPS." },
  { label: "Read QPS (100:1 ratio)", formula: "1,200 \u00d7 100", result: "~120,000 QPS", icon: <Zap className="size-3.5" />, note: "URL shorteners are massively read-heavy. Each URL is created once, clicked many times." },
  { label: "Peak QPS (3x average)", formula: "120,000 \u00d7 3", result: "~360,000 read QPS at peak", icon: <TrendingUp className="size-3.5" />, note: "Design for peak, not average. A viral link could spike traffic 3-5x above normal." },
  { label: "Storage per record", formula: "short_code (7B) + url (200B) + metadata (100B) + overhead", result: "~500 bytes per record", icon: <HardDrive className="size-3.5" />, note: "Always estimate record size. Include indexes, metadata, and storage overhead." },
  { label: "Daily new storage", formula: "100M records \u00d7 500 bytes", result: "~50 GB / day", icon: <HardDrive className="size-3.5" />, note: "50 GB/day is manageable for a single database. But cumulative growth matters." },
  { label: "Storage per year", formula: "50 GB \u00d7 365 days", result: "~18 TB / year", icon: <Database className="size-3.5" />, note: "At 18 TB/year, you will need sharding within a few years. Plan for it now." },
];

function EstimationPractice({ tick }: { tick: number }) {
  const revealedCount = Math.min(tick, estimationSteps.length);
  const revealed = estimationSteps.slice(0, revealedCount);

  return (
    <div className="space-y-4">
      <div className="bg-muted/30 rounded-lg border border-border/40 p-3">
        <p className="text-xs font-semibold text-primary mb-1">The Prompt</p>
        <p className="text-sm text-muted-foreground">
          &quot;Design a URL shortener used by 100 million daily active users.&quot;
        </p>
      </div>
      <p className="text-sm text-muted-foreground">
        Press play. Each tick reveals the next step in the back-of-envelope calculation.
        This is exactly how you should walk through estimation in an interview.
      </p>
      <div className="space-y-2">
        {revealed.map((step, i) => (
          <div
            key={step.label}
            className="animate-in fade-in slide-in-from-left-4 duration-300 rounded-lg border border-border/40 bg-muted/10 p-3"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <div className="size-5 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                {step.icon}
              </div>
              <span className="text-xs font-semibold">{step.label}</span>
              <span className="ml-auto text-[10px] font-mono bg-muted/40 px-2 py-0.5 rounded-full text-muted-foreground/60">
                Step {i + 1}
              </span>
            </div>
            <div className="flex items-center gap-2 pl-7">
              <span className="text-[11px] font-mono text-muted-foreground/60">{step.formula}</span>
              <ArrowRight className="size-3 text-muted-foreground/30" />
              <span className="text-xs font-bold text-emerald-400">{step.result}</span>
            </div>
            <p className="text-[10px] text-muted-foreground/50 pl-7 mt-1 italic">{step.note}</p>
          </div>
        ))}
      </div>
      {revealedCount === 0 && (
        <p className="text-[11px] text-muted-foreground/40 text-center py-6">
          Press the play button above to step through the estimation.
        </p>
      )}
      {revealedCount >= estimationSteps.length && (
        <div className="bg-purple-500/5 border border-purple-500/10 rounded-lg p-3 text-center space-y-1">
          <p className="text-xs font-semibold text-purple-400">Estimation complete.</p>
          <p className="text-[11px] text-muted-foreground">
            You now know: ~1,200 write QPS, ~360K peak read QPS, ~18 TB/year. These numbers drive every design decision.
          </p>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Framework Stepper
// ---------------------------------------------------------------------------
function FrameworkStepper() {
  const [activeStep, setActiveStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setActiveStep((s) => (s + 1) % 5), 5000);
    return () => clearInterval(t);
  }, []);

  const steps = [
    {
      title: "1. Requirements Gathering",
      duration: "5 minutes",
      color: "blue",
      what: "Define exactly what you are building. Separate functional requirements (what the system does) from non-functional requirements (how well it does it). This is where most candidates fail \u2014 they skip this and design in the dark.",
      questions: [
        "Who are the users? How many?",
        "What are the core features? (Start with 2-3)",
        "What are the read/write ratios?",
        "What consistency and availability guarantees do we need?",
        "What is the expected latency for key operations?",
      ],
      example: "\"For a URL shortener: we need to create short URLs (write) and redirect them (read). The read:write ratio is about 100:1. We need 99.9% availability. Eventual consistency is fine since a few seconds of delay for new URLs is acceptable.\"",
      danger: "Do NOT skip this. Jumping to design without requirements is the #1 reason candidates fail. The dialogue above shows exactly what happens.",
    },
    {
      title: "2. Back-of-Envelope Estimation",
      duration: "5 minutes",
      color: "purple",
      what: "Translate requirements into numbers. This determines whether you need 1 server or 1000, and guides every architectural decision that follows.",
      questions: [
        "What is the DAU / MAU?",
        "How many requests per second (QPS)?",
        "What is the peak QPS (2-3x average)?",
        "How much storage per day / year?",
        "What bandwidth do we need?",
      ],
      example: "\"100M DAU, 1 URL created per user per day = 100M writes/day. That is ~1,200 write QPS. With 100:1 read ratio, that is 120K read QPS at peak (~360K). Each URL record is ~500 bytes, so 50GB/day new storage, ~18TB/year.\"",
      danger: "Round aggressively. Use powers of 10. The goal is order of magnitude, not precision. Interviewers penalize spending 10 minutes on exact math.",
    },
    {
      title: "3. High-Level Design",
      duration: "15 minutes",
      color: "emerald",
      what: "Sketch the major components and how they interact. Define APIs first, then draw the architecture. Start simple and layer on complexity.",
      questions: [
        "What APIs do we need? (Define 2-3 core endpoints)",
        "What are the main services/components?",
        "How does data flow through the system?",
        "What database(s) do we use and why?",
        "Where do we need caching?",
      ],
      example: "\"API: POST /urls (create), GET /{shortCode} (redirect). Services: URL service behind a load balancer. Database: key-value store since we have simple lookups by short code. Cache: Redis in front of DB for hot URLs.\"",
      danger: "Start drawing around minute 10-12. Too early means you have not thought enough. Too late means you will rush the deep dive.",
    },
    {
      title: "4. Deep Dive",
      duration: "15 minutes",
      color: "orange",
      what: "Pick 2-3 components and go deep. This is where you demonstrate senior-level thinking. The interviewer may guide you here or let you choose. This phase is where mid-level and senior candidates diverge.",
      questions: [
        "How do we handle the hardest part of this system?",
        "What happens at 10x scale?",
        "How do we handle failures? (Server crash, network partition)",
        "What about data consistency across replicas?",
        "How do we monitor and alert?",
      ],
      example: "\"Let me dive into the hash collision problem. We use Base62 encoding of a counter. The counter is distributed across nodes using ranges (node 1 gets IDs 1-1M, node 2 gets 1M-2M). This avoids coordination and guarantees uniqueness.\"",
      danger: "This is where you differentiate yourself. Do not spend 25 minutes on high-level and rush this. Protect 15 minutes here.",
    },
    {
      title: "5. Trade-offs & Wrap-up",
      duration: "5 minutes",
      color: "red",
      what: "Discuss what you sacrificed, what bottlenecks remain, and what you would do differently at 10x or 100x scale. Show you think about evolving systems, not static ones.",
      questions: [
        "What are the bottlenecks in our current design?",
        "What would change at 10x scale?",
        "What did we trade off and why?",
        "What would you monitor?",
        "What would you do with more time?",
      ],
      example: "\"The main bottleneck is the single database. At 10x, we would shard by the first two characters of the short code, giving us 3,844 possible shards. We traded simplicity for scalability by not sharding initially \u2014 the right call for our current scale.\"",
      danger: "Always leave time for this. Ending with trade-offs signals mature engineering thinking. Never let the timer run out mid-sentence.",
    },
  ];

  const step = steps[activeStep];

  return (
    <div className="space-y-4">
      <div className="flex gap-1">
        {steps.map((s, i) => (
          <button
            key={s.title}
            onClick={() => setActiveStep(i)}
            className={cn(
              "flex-1 h-2 rounded-full transition-all duration-300",
              i === activeStep
                ? i === 0 ? "bg-blue-500" : i === 1 ? "bg-purple-500" : i === 2 ? "bg-emerald-500" : i === 3 ? "bg-orange-500" : "bg-red-500"
                : i < activeStep
                ? "bg-muted-foreground/20"
                : "bg-muted/30"
            )}
          />
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {steps.map((s, i) => (
          <button
            key={s.title}
            onClick={() => setActiveStep(i)}
            className={cn(
              "text-[11px] px-2.5 py-1 rounded-md border transition-all",
              i === activeStep
                ? "bg-primary/10 border-primary/30 text-primary font-medium"
                : "bg-muted/20 border-border/30 text-muted-foreground/50 hover:text-muted-foreground"
            )}
          >
            Step {i + 1}
          </button>
        ))}
      </div>

      <div className={cn(
        "rounded-lg border p-4 space-y-3 transition-all",
        activeStep === 0 ? "border-blue-500/20 bg-blue-500/[0.03]" :
        activeStep === 1 ? "border-purple-500/20 bg-purple-500/[0.03]" :
        activeStep === 2 ? "border-emerald-500/20 bg-emerald-500/[0.03]" :
        activeStep === 3 ? "border-orange-500/20 bg-orange-500/[0.03]" :
        "border-red-500/20 bg-red-500/[0.03]"
      )}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold">{step.title}</h3>
          <span className="text-[10px] font-mono bg-muted/30 px-2 py-0.5 rounded-full">
            <Clock className="size-3 inline mr-1" />{step.duration}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">{step.what}</p>

        <div className="space-y-1.5">
          <p className="text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wider">Key questions to ask</p>
          {step.questions.map((q) => (
            <div key={q} className="flex items-start gap-2">
              <ArrowRight className="size-3 text-muted-foreground/40 mt-0.5 shrink-0" />
              <span className="text-xs text-muted-foreground">{q}</span>
            </div>
          ))}
        </div>

        <div className="bg-muted/20 rounded-md p-3 border border-border/30">
          <p className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider mb-1">Example (URL Shortener)</p>
          <p className="text-xs text-muted-foreground italic">{step.example}</p>
        </div>

        <div className="flex items-start gap-2 bg-red-500/5 rounded-md p-2 border border-red-500/10">
          <AlertTriangle className="size-3.5 text-red-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-red-400/80">{step.danger}</p>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Phase scroll anchors
// ---------------------------------------------------------------------------
function PhaseAnchor({ id, label }: { id: string; label: string }) {
  return <div id={id} className="scroll-mt-24" aria-label={label} />;
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function FrameworkPage() {
  return (
    <div className="space-y-8">
      <TopicHero
        title="The System Design Interview Framework"
        subtitle="Most candidates fail not because they lack knowledge, but because they lack structure. This page gives you the exact 5-phase framework used by candidates who pass system design interviews at Google, Meta, Amazon, and other top companies. Read it once, practice it twice, and you will never freeze in an interview again."
        difficulty="beginner"
      />

      {/* --- MOTIVATING FRAME: Mid vs Senior (moved near top) --- */}
      <AhaMoment
        question="What separates a mid-level answer from a senior answer in the same 45-minute interview?"
        answer={
          <div className="space-y-3">
            <p>
              A mid-level candidate describes <em>what</em> they would build. A senior candidate
              explains <em>why</em> they would build it that way, what they considered and
              rejected, and what would cause them to change their mind.
            </p>
            <p>
              The framework is identical at every level. What changes is the <strong>depth of reasoning</strong> at each step.
              A senior candidate spends the same 5 minutes on requirements but surfaces edge cases and constraints
              that a mid-level candidate would not think of until the deep dive.
            </p>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div className="rounded-md bg-red-500/5 border border-red-500/10 p-2.5">
                <p className="text-[10px] font-semibold text-red-400 mb-1 uppercase tracking-wider">Mid-Level Signal</p>
                <p className="text-xs text-muted-foreground">&quot;I would use a NoSQL database.&quot;</p>
              </div>
              <div className="rounded-md bg-emerald-500/5 border border-emerald-500/10 p-2.5">
                <p className="text-[10px] font-semibold text-emerald-400 mb-1 uppercase tracking-wider">Senior Signal</p>
                <p className="text-xs text-muted-foreground">&quot;Given our 100:1 read ratio and simple key-value lookups, a NoSQL store like DynamoDB gives us the read throughput we need. If we needed joins or complex queries, I would choose differently.&quot;</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground/80 italic">
              This entire page teaches you to reason at the senior level. Every phase below shows you how.
            </p>
          </div>
        }
      />

      {/* --- FAILURE SCENARIO: Concrete chat dialogue --- */}
      <FailureScenario title="Watch a candidate fail in real time">
        <p className="text-sm text-muted-foreground mb-3">
          This is not hypothetical. This dialogue plays out in hundreds of interviews every week.
          Watch the candidate jump straight into database schema, then crumble when the interviewer
          asks basic questions about scale.
        </p>
        <FailureDialogue />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
          <MetricCounter label="Time Wasted" value={15} unit="min" trend="up" />
          <MetricCounter label="Requirements Gathered" value={0} unit="" trend="up" />
          <MetricCounter label="Interviewer Confidence" value={20} unit="%" trend="down" />
          <MetricCounter label="Design Pivots" value={3} unit="" trend="up" />
        </div>
      </FailureScenario>

      <WhyItBreaks title="Jumping to solutions skips the constraints that shape the solution">
        <p className="text-sm text-muted-foreground">
          A URL shortener for 100 users looks nothing like one for 100 million users. A chat
          system with &quot;messages must arrive in order&quot; is fundamentally different from one
          where &quot;best effort is fine.&quot; Requirements determine architecture. Skip them
          and you are designing in the dark.
        </p>
        <BeforeAfter
          before={{
            title: "Without framework",
            content: (
              <div className="text-sm space-y-2">
                <p className="text-muted-foreground">Chaotic, reactive, backtracking</p>
                <div className="bg-muted/50 p-2 rounded text-xs font-mono">
                  <p>&quot;Let me draw the database...&quot;</p>
                  <p>&quot;Wait, do we need sharding?&quot;</p>
                  <p>&quot;Actually let me start over...&quot;</p>
                  <p className="text-red-400 mt-1">25 minutes gone, no clear design</p>
                </div>
              </div>
            ),
          }}
          after={{
            title: "With framework",
            content: (
              <div className="text-sm space-y-2">
                <p className="text-muted-foreground">Structured, proactive, confident</p>
                <div className="bg-muted/50 p-2 rounded text-xs font-mono">
                  <p>5 min: Requirements + constraints</p>
                  <p>5 min: Estimation + capacity</p>
                  <p>15 min: High-level design</p>
                  <p className="text-green-400 mt-1">Deep dive with time to spare</p>
                </div>
              </div>
            ),
          }}
        />
      </WhyItBreaks>

      {/* --- CLICKABLE INTERVIEW TIMELINE --- */}
      <ConceptVisualizer title="The 45-Minute Interview Timeline">
        <p className="text-sm text-muted-foreground mb-4">
          Watch the clock tick through a real interview. Each phase has a specific purpose and
          a strict time budget. <strong>Click any phase bar</strong> to jump to that phase&apos;s
          detailed description below.
        </p>
        <InterviewTimeline />
      </ConceptVisualizer>

      {/* --- COMPANY FORMAT COMPARISON (moved up from bottom) --- */}
      <ConceptVisualizer title="How Different Companies Run System Design Interviews">
        <p className="text-sm text-muted-foreground mb-4">
          The framework is universal, but each company has its own flavor. This is the highest-value
          information on this page: knowing what a specific company emphasizes lets you shift your
          time budget within the framework. Google wants algorithm depth in the deep dive. Meta wants
          product thinking in requirements. Amazon obsesses over failure modes throughout.
        </p>
        <CompanyFormatComparison />
      </ConceptVisualizer>

      {/* --- PHASE SCROLL ANCHORS --- */}
      <PhaseAnchor id="phase-requirements" label="Requirements phase" />
      <PhaseAnchor id="phase-estimation" label="Estimation phase" />
      <PhaseAnchor id="phase-highlevel" label="High-level design phase" />
      <PhaseAnchor id="phase-deepdive" label="Deep dive phase" />
      <PhaseAnchor id="phase-tradeoffs" label="Trade-offs phase" />

      {/* --- FIVE-STEP FRAMEWORK --- */}
      <ConceptVisualizer title="The Five-Step Framework \u2014 In Detail">
        <p className="text-sm text-muted-foreground mb-4">
          Every system design interview at FAANG companies follows this arc. Click each step to
          see exactly what to do, what to say, and what to avoid. The URL shortener examples show
          you how a real answer sounds at each phase.
        </p>
        <FrameworkStepper />
      </ConceptVisualizer>

      <ConceptVisualizer title="The Full Flow">
        <p className="text-sm text-muted-foreground mb-4">
          At a glance \u2014 the five phases as a continuous flow. Each step feeds into the next.
          Requirements inform estimation. Estimation shapes design. Design reveals areas for deep dive.
          Deep dive surfaces trade-offs.
        </p>
        <AnimatedFlow
          steps={[
            { id: "requirements", label: "Requirements", description: "Functional + non-functional. Ask clarifying questions.", icon: <Search className="size-4" /> },
            { id: "estimation", label: "Estimation", description: "QPS, storage, bandwidth. Back-of-envelope math.", icon: <Calculator className="size-4" /> },
            { id: "high-level", label: "High-Level Design", description: "APIs, components, data flow. The 30,000-foot view.", icon: <Layout className="size-4" /> },
            { id: "deep-dive", label: "Deep Dive", description: "Pick 2-3 components and go deep. Show expertise.", icon: <Microscope className="size-4" /> },
            { id: "trade-offs", label: "Trade-offs", description: "What did you sacrifice? What would change at 10x?", icon: <Scale className="size-4" /> },
          ]}
          interval={3000}
        />
      </ConceptVisualizer>

      {/* --- INTERACTIVE: Requirements via tick --- */}
      <InteractiveDemo title="Simulate: Requirements Gathering Interview" intervalMs={2000}>
        {({ tick }) => (
          <RequirementsGathering tick={tick} />
        )}
      </InteractiveDemo>

      {/* --- INTERACTIVE: Estimation practice via tick --- */}
      <InteractiveDemo title="Practice: Back-of-Envelope Estimation" intervalMs={2500}>
        {({ tick }) => (
          <EstimationPractice tick={tick} />
        )}
      </InteractiveDemo>

      {/* --- COMMUNICATION --- */}
      <CorrectApproach title="Communication: The Meta-Skill That Matters Most">
        <p className="text-sm text-muted-foreground mb-4">
          Your framework is useless if the interviewer cannot follow your thinking. System design
          interviews are collaborative design sessions, not solo presentations. Here is how to
          communicate effectively throughout each phase.
        </p>
        <div className="space-y-3">
          <div className="bg-muted/30 p-3 rounded-lg border-l-2 border-blue-500">
            <p className="text-xs font-semibold mb-1">Announce your plan upfront</p>
            <p className="text-xs text-muted-foreground italic">
              &quot;I would like to start by spending 5 minutes on requirements and estimation,
              then sketch the high-level design, and finally deep dive into the most interesting
              components. Does that work for you?&quot;
            </p>
          </div>
          <div className="bg-muted/30 p-3 rounded-lg border-l-2 border-purple-500">
            <p className="text-xs font-semibold mb-1">Think out loud</p>
            <p className="text-xs text-muted-foreground italic">
              &quot;I am considering two options here \u2014 a SQL database for strong consistency
              or a NoSQL store for write throughput. Given our write-heavy workload, I am leaning
              toward NoSQL. Let me explain why...&quot;
            </p>
          </div>
          <div className="bg-muted/30 p-3 rounded-lg border-l-2 border-emerald-500">
            <p className="text-xs font-semibold mb-1">Check in with the interviewer</p>
            <p className="text-xs text-muted-foreground italic">
              &quot;Before I go deeper into the caching layer, is there a specific area you would
              like me to focus on?&quot;
            </p>
          </div>
          <div className="bg-muted/30 p-3 rounded-lg border-l-2 border-orange-500">
            <p className="text-xs font-semibold mb-1">State assumptions explicitly</p>
            <p className="text-xs text-muted-foreground italic">
              &quot;I am assuming this is a global service with users in multiple regions. If it
              were single-region, my design would be simpler. Should I design for global or
              single-region?&quot;
            </p>
          </div>
          <div className="bg-muted/30 p-3 rounded-lg border-l-2 border-red-500">
            <p className="text-xs font-semibold mb-1">Signpost transitions between phases</p>
            <p className="text-xs text-muted-foreground italic">
              &quot;I have covered the high-level design. Now I would like to deep dive into the
              hash generation service since that is the most technically challenging part. Does
              that sound good?&quot;
            </p>
          </div>
        </div>
      </CorrectApproach>

      <ConversationalCallout type="warning">
        The most common mistake is spending 25 minutes on a beautiful high-level diagram and
        having no time for the deep dive. The deep dive is where you demonstrate senior-level
        thinking. Protect that time. Set a mental alarm at the 25-minute mark \u2014 if you are still
        drawing boxes and arrows, stop and go deep on one component.
      </ConversationalCallout>

      <AhaMoment
        question="Why do interviewers care about your process more than your final design?"
        answer={
          <p>
            Because nobody designs a perfect system in 45 minutes. Interviewers are evaluating
            whether you can navigate ambiguity, make reasonable assumptions, communicate your
            thinking, and adapt when requirements change. A structured process demonstrates all
            four. A perfect schema on a whiteboard demonstrates none. At Google, the internal
            rubric explicitly scores &quot;problem exploration&quot; and &quot;communication&quot;
            as separate dimensions from &quot;technical design.&quot;
          </p>
        }
      />

      <AhaMoment
        question="What should you do if the interviewer interrupts your framework?"
        answer={
          <p>
            Follow their lead. The framework is a guide, not a prison. If the interviewer wants
            to skip estimation and jump to deep dive, that is a signal about what they want to
            evaluate. Adapt. The best candidates treat the interview as a collaborative design
            session, not a rehearsed presentation. Interviewers at Meta, for example, often steer
            you toward product-level discussions early. At Amazon, they may push you toward
            failure modes and operational concerns. Read the room.
          </p>
        }
      />

      <KeyTakeaway
        points={[
          "Always start with requirements. Functional (what does the system do?) and non-functional (latency, availability, consistency). This is non-negotiable at every FAANG company.",
          "Budget your time: 5 min requirements, 5 min estimation, 15 min high-level, 15 min deep dive, 5 min trade-offs. Set mental checkpoints.",
          "Announce your plan to the interviewer. It shows structure, invites collaboration, and lets them redirect you early if they have a specific focus.",
          "The deep dive is where you differentiate from mid-level to senior. Protect at least 15 minutes for it. Discuss failure modes, consistency, and scaling.",
          "Calibrate for the company: Google wants distributed systems depth, Meta wants product thinking, Amazon wants operational excellence. Shift your emphasis accordingly.",
          "Practice estimation until it is automatic. DAU to QPS to storage should flow out of you in 2 minutes. Use the interactive calculator above.",
          "Communicate continuously. Think out loud, state assumptions, check in with the interviewer. Silence is your enemy in a system design interview.",
        ]}
      />
    </div>
  );
}
