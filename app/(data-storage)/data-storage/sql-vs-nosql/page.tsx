"use client";

import { useState, useMemo, useCallback } from "react";
import { TopicHero } from "@/components/topic-hero";
import { KeyTakeaway } from "@/components/key-takeaway";
import { AhaMoment } from "@/components/aha-moment";
import { ConversationalCallout } from "@/components/conversational-callout";
import { BeforeAfter } from "@/components/before-after";
import { Playground } from "@/components/playground";
import { LiveChart } from "@/components/live-chart";
import { FlowDiagram } from "@/components/flow-diagram";
import { useSimulation } from "@/hooks/use-simulation";
import { cn } from "@/lib/utils";
import type { FlowNode, FlowEdge } from "@/components/flow-diagram";
import { Database, Table, FileJson, ArrowRightLeft, Server, HardDrive } from "lucide-react";

// ─── Query Comparison Playground ───────────────────────────────────────────────
type QueryMode = "join" | "denormalized";

function QueryPlayground() {
  const [mode, setMode] = useState<QueryMode>("join");

  const simulation = useSimulation({ maxSteps: 5, intervalMs: 800 });
  const step = simulation.step;

  const sqlSteps = [
    { label: "SELECT FROM users", detail: "Scan users table for alice@co.com", table: "users" },
    { label: "Find user row", detail: "id=1, name=Alice, dept_id=10", table: "users" },
    { label: "JOIN departments", detail: "Lookup departments WHERE id=10", table: "departments" },
    { label: "Merge results", detail: "Combine user + department data", table: "both" },
    { label: "Return result", detail: "Alice, Engineering, $2M budget", table: "result" },
  ];

  const nosqlSteps = [
    { label: "db.users.findOne()", detail: "Query by email field", table: "users" },
    { label: "Find document", detail: "Matching document located", table: "users" },
    { label: "Read embedded data", detail: "Department is already inside", table: "users" },
    { label: "No JOIN needed", detail: "All data in one document", table: "users" },
    { label: "Return result", detail: "Alice, Engineering, $2M budget", table: "result" },
  ];

  const steps = mode === "join" ? sqlSteps : nosqlSteps;

  const canvas = (
    <div className="p-4 space-y-4">
      <div className="flex gap-2 justify-center">
        <button
          onClick={() => { setMode("join"); simulation.reset(); }}
          className={cn(
            "px-4 py-1.5 rounded-lg text-xs font-medium border transition-all",
            mode === "join"
              ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
              : "bg-muted/20 border-border/50 text-muted-foreground hover:text-foreground"
          )}
        >
          <Table className="size-3.5 inline mr-1.5" />
          SQL JOIN
        </button>
        <button
          onClick={() => { setMode("denormalized"); simulation.reset(); }}
          className={cn(
            "px-4 py-1.5 rounded-lg text-xs font-medium border transition-all",
            mode === "denormalized"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-muted/20 border-border/50 text-muted-foreground hover:text-foreground"
          )}
        >
          <FileJson className="size-3.5 inline mr-1.5" />
          NoSQL Denormalized
        </button>
      </div>

      <div className={cn(
        "rounded-lg border p-3",
        mode === "join" ? "border-blue-500/20 bg-blue-500/5" : "border-emerald-500/20 bg-emerald-500/5"
      )}>
        <pre className="text-[11px] font-mono leading-relaxed text-muted-foreground whitespace-pre-wrap">
          {mode === "join" ? (
            <>
              <span className="text-blue-400">SELECT</span> u.*, d.name <span className="text-blue-400">AS</span> dept_name{"\n"}
              <span className="text-blue-400">FROM</span> users u{"\n"}
              <span className="text-blue-400">JOIN</span> departments d <span className="text-blue-400">ON</span> u.dept_id = d.id{"\n"}
              <span className="text-blue-400">WHERE</span> u.email = <span className="text-amber-400">&apos;alice@co.com&apos;</span>;
            </>
          ) : (
            <>
              <span className="text-emerald-400">db</span>.users.<span className="text-emerald-400">findOne</span>{"({"}{"\n"}
              {"  "}email: <span className="text-amber-400">&quot;alice@co.com&quot;</span>{"\n"}
              {"}"});{"\n"}
              <span className="text-muted-foreground/50">// dept data already embedded -- no JOIN</span>
            </>
          )}
        </pre>
      </div>

      <div className="space-y-1.5">
        {steps.map((s, i) => {
          const isActive = step === i + 1;
          const isDone = step > i + 1;
          const accentActive = mode === "join" ? "bg-blue-500/10 border-blue-500/30 text-blue-400" : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400";
          const accentDone = mode === "join" ? "bg-blue-500/5 border-blue-500/15 text-blue-400/70" : "bg-emerald-500/5 border-emerald-500/15 text-emerald-400/70";
          return (
            <div
              key={i}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-xs border transition-all duration-300",
                isActive ? accentActive : isDone ? accentDone : "bg-muted/10 border-border/20 text-muted-foreground/40"
              )}
            >
              <span className={cn(
                "size-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0",
                isActive ? "bg-foreground/10" : "bg-muted/20"
              )}>
                {i + 1}
              </span>
              <div>
                <span className="font-medium">{s.label}</span>
                <span className="text-muted-foreground ml-2">{s.detail}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const explanation = (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold">
        {mode === "join" ? "SQL: Normalized + JOIN" : "NoSQL: Denormalized"}
      </h3>
      <p className="text-xs text-muted-foreground">
        {mode === "join"
          ? "SQL databases store data in separate, normalized tables. To fetch related data, the engine performs a JOIN -- matching foreign keys across tables at query time. This keeps data consistent (one source of truth) but adds query complexity."
          : "NoSQL databases embed related data directly in each document. Reading is fast because everything is in one place. The trade-off: if department info changes, you must update every document that contains it."}
      </p>
      <div className={cn(
        "rounded-md p-2.5 border text-[11px]",
        mode === "join" ? "border-blue-500/20 bg-blue-500/5" : "border-emerald-500/20 bg-emerald-500/5"
      )}>
        <p className="font-medium mb-1">{mode === "join" ? "Pros" : "Pros"}</p>
        <ul className="space-y-0.5 text-muted-foreground">
          {mode === "join" ? (
            <>
              <li>+ No data duplication</li>
              <li>+ Single source of truth</li>
              <li>+ Easy schema updates</li>
            </>
          ) : (
            <>
              <li>+ Single read operation</li>
              <li>+ No JOIN overhead</li>
              <li>+ Lower read latency</li>
            </>
          )}
        </ul>
      </div>
      <div className="rounded-md p-2.5 border border-red-500/20 bg-red-500/5 text-[11px]">
        <p className="font-medium mb-1">Cons</p>
        <ul className="space-y-0.5 text-muted-foreground">
          {mode === "join" ? (
            <>
              <li>- JOIN can be expensive</li>
              <li>- More complex queries</li>
              <li>- Multiple table lookups</li>
            </>
          ) : (
            <>
              <li>- Data duplication</li>
              <li>- Update anomalies</li>
              <li>- Larger document size</li>
            </>
          )}
        </ul>
      </div>
    </div>
  );

  return (
    <Playground
      title="Query Comparison: SQL JOIN vs NoSQL Denormalized"
      simulation={simulation}
      canvas={canvas}
      explanation={explanation}
      canvasHeight="min-h-[420px]"
    />
  );
}

// ─── Schema Flexibility Demo ───────────────────────────────────────────────────
function SchemaFlexibilityDemo() {
  const [scenario, setScenario] = useState<"rigid" | "flexible">("rigid");
  const [fieldAdded, setFieldAdded] = useState(false);

  const sqlAttempt = fieldAdded
    ? `-- Adding a field requires ALTER TABLE:
ALTER TABLE products ADD COLUMN dimensions JSONB;
-- Existing rows get NULL. May lock table.
-- id=1: name="Laptop", price=999, dimensions=NULL
-- id=2: name="Book",   price=15,  dimensions=NULL`
    : `-- Strict schema: every row has same columns
CREATE TABLE products (
  id    SERIAL PRIMARY KEY,
  name  VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL
);
-- id=1: "Laptop", 999.00
-- id=2: "Book",   15.00`;

  const nosqlAttempt = fieldAdded
    ? `// Just insert with new fields. No migration.
db.products.insertOne({
  name: "Desk", price: 299,
  dimensions: { w: 60, h: 30, d: 24 },
  material: "oak"
});
// Old docs untouched -- each has its own shape`
    : `// No predefined schema -- docs can differ
db.products.insertOne({
  name: "Laptop", price: 999,
  specs: { ram: "16GB", cpu: "M3" }
});
db.products.insertOne({
  name: "Book", price: 15,
  isbn: "978-0-13-468599-1"
});`;

  return (
    <div className="rounded-xl border border-border/50 overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border/50 bg-muted/30 px-4 py-2">
        <Database className="size-4 text-violet-400" />
        <span className="text-sm font-medium">Schema Flexibility Demo</span>
      </div>
      <div className="p-4 space-y-4">
        <div className="flex gap-2 justify-center flex-wrap">
          <button
            onClick={() => { setScenario("rigid"); setFieldAdded(false); }}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
              scenario === "rigid"
                ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                : "bg-muted/20 border-border/50 text-muted-foreground hover:text-foreground"
            )}
          >
            SQL (Rigid Schema)
          </button>
          <button
            onClick={() => { setScenario("flexible"); setFieldAdded(false); }}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
              scenario === "flexible"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-muted/20 border-border/50 text-muted-foreground hover:text-foreground"
            )}
          >
            NoSQL (Flexible Schema)
          </button>
        </div>

        <div className={cn(
          "rounded-lg border p-3",
          scenario === "rigid" ? "border-blue-500/20 bg-blue-500/5" : "border-emerald-500/20 bg-emerald-500/5"
        )}>
          <pre className="text-[11px] font-mono leading-relaxed text-muted-foreground whitespace-pre-wrap">
            {scenario === "rigid" ? sqlAttempt : nosqlAttempt}
          </pre>
        </div>

        <button
          onClick={() => setFieldAdded(!fieldAdded)}
          className={cn(
            "w-full py-2 rounded-lg text-xs font-medium border transition-all",
            fieldAdded
              ? "bg-violet-500/10 border-violet-500/30 text-violet-400"
              : "bg-muted/20 border-border/50 text-muted-foreground hover:bg-muted/40"
          )}
        >
          {fieldAdded ? "Reset to original" : "Try adding a new field \"dimensions\""}
        </button>

        <p className="text-[11px] text-muted-foreground text-center">
          {scenario === "rigid"
            ? fieldAdded
              ? "SQL requires ALTER TABLE to add columns. Existing rows get NULL values. Large tables may lock during migration."
              : "Every row must conform to the same schema. Adding fields requires a migration."
            : fieldAdded
              ? "NoSQL lets you add new fields to new documents without touching existing ones. Maximum flexibility."
              : "Each document can have a different shape. No schema migration needed."}
        </p>
      </div>
    </div>
  );
}

// ─── Scaling Comparison FlowDiagram ────────────────────────────────────────────
function ScalingComparison() {
  const [view, setView] = useState<"vertical" | "horizontal">("vertical");

  const verticalNodes: FlowNode[] = useMemo(() => [
    { id: "client", type: "clientNode", position: { x: 250, y: 0 }, data: { label: "Application" } },
    { id: "db", type: "databaseNode", position: { x: 250, y: 130 }, data: { label: "PostgreSQL Primary", sublabel: "64 CPU / 256GB RAM", status: "warning" } },
    { id: "r1", type: "databaseNode", position: { x: 50, y: 270 }, data: { label: "Read Replica 1", sublabel: "Reads only" } },
    { id: "r2", type: "databaseNode", position: { x: 450, y: 270 }, data: { label: "Read Replica 2", sublabel: "Reads only" } },
  ], []);
  const verticalEdges: FlowEdge[] = useMemo(() => [
    { id: "c-db", source: "client", target: "db", label: "Reads + Writes", animated: true },
    { id: "db-r1", source: "db", target: "r1", label: "Replication", animated: true },
    { id: "db-r2", source: "db", target: "r2", label: "Replication", animated: true },
  ], []);
  const horizontalNodes: FlowNode[] = useMemo(() => [
    { id: "client", type: "clientNode", position: { x: 250, y: 0 }, data: { label: "Application" } },
    { id: "router", type: "loadBalancerNode", position: { x: 250, y: 110 }, data: { label: "Shard Router", sublabel: "mongos" } },
    { id: "s1", type: "databaseNode", position: { x: 30, y: 240 }, data: { label: "Shard 1", sublabel: "Users A-H", status: "healthy" } },
    { id: "s2", type: "databaseNode", position: { x: 220, y: 240 }, data: { label: "Shard 2", sublabel: "Users I-P", status: "healthy" } },
    { id: "s3", type: "databaseNode", position: { x: 410, y: 240 }, data: { label: "Shard 3", sublabel: "Users Q-Z", status: "healthy" } },
  ], []);
  const horizontalEdges: FlowEdge[] = useMemo(() => [
    { id: "c-r", source: "client", target: "router", animated: true },
    { id: "r-s1", source: "router", target: "s1", label: "A-H", animated: true },
    { id: "r-s2", source: "router", target: "s2", label: "I-P", animated: true },
    { id: "r-s3", source: "router", target: "s3", label: "Q-Z", animated: true },
  ], []);

  const throughputData = [
    { load: "10K", sql: 10, nosql: 10 },
    { load: "50K", sql: 45, nosql: 50 },
    { load: "100K", sql: 70, nosql: 100 },
    { load: "200K", sql: 75, nosql: 200 },
    { load: "500K", sql: 78, nosql: 480 },
    { load: "1M", sql: 80, nosql: 950 },
  ];

  return (
    <div className="rounded-xl border border-border/50 overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border/50 bg-muted/30 px-4 py-2">
        <Server className="size-4 text-violet-400" />
        <span className="text-sm font-medium">Scaling: Vertical vs Horizontal</span>
      </div>
      <div className="p-4 space-y-4">
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => setView("vertical")}
            className={cn(
              "px-4 py-1.5 rounded-lg text-xs font-medium border transition-all",
              view === "vertical"
                ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                : "bg-muted/20 border-border/50 text-muted-foreground hover:text-foreground"
            )}
          >
            <HardDrive className="size-3.5 inline mr-1.5" />
            SQL Vertical Scale
          </button>
          <button
            onClick={() => setView("horizontal")}
            className={cn(
              "px-4 py-1.5 rounded-lg text-xs font-medium border transition-all",
              view === "horizontal"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-muted/20 border-border/50 text-muted-foreground hover:text-foreground"
            )}
          >
            <Database className="size-3.5 inline mr-1.5" />
            NoSQL Horizontal Shards
          </button>
        </div>

        <div className="rounded-lg border border-border/30 bg-muted/10">
          <FlowDiagram
            nodes={view === "vertical" ? verticalNodes : horizontalNodes}
            edges={view === "vertical" ? verticalEdges : horizontalEdges}
            minHeight={340}
            interactive={false}
            allowDrag={false}
          />
        </div>

        <div className="space-y-2">
          <p className="text-[11px] font-medium text-muted-foreground text-center">
            Write throughput as load increases (K req/sec)
          </p>
          <LiveChart
            type="line"
            data={throughputData}
            dataKeys={{ x: "load", y: ["sql", "nosql"], label: ["SQL (vertical)", "NoSQL (sharded)"] }}
            height={180}
            unit="K rps"
            referenceLines={[{ y: 80, label: "SQL ceiling", color: "#ef4444" }]}
          />
        </div>

        <p className="text-[11px] text-muted-foreground text-center">
          {view === "vertical"
            ? "SQL scales vertically: upgrade the primary server hardware. Writes are limited to one node. Read replicas help with reads but not writes."
            : "NoSQL scales horizontally: add more shards, each handling a subset of data. Write throughput grows linearly with shard count."}
        </p>
      </div>
    </div>
  );
}

// ─── Decision Framework Quiz ───────────────────────────────────────────────────
type QuizAnswer = "sql" | "nosql" | "either" | null;

const quizQuestions = [
  { id: 1, question: "You are building a banking system that transfers money between accounts.",
    correct: "sql" as const, explanation: "Financial transactions require ACID guarantees. A partial transfer is catastrophic. SQL provides atomic, all-or-nothing transactions by default." },
  { id: 2, question: "You are building a product catalog where each item has different attributes (shoes have sizes, laptops have specs, books have ISBNs).",
    correct: "nosql" as const, explanation: "Each product type has a different shape. NoSQL document databases handle this naturally. In SQL, you would need complex EAV patterns or sparse columns." },
  { id: 3, question: "You need to handle 500K writes per second for a global social media feed.",
    correct: "nosql" as const, explanation: "At 500K writes/sec, you need horizontal scaling with native sharding. NoSQL databases like DynamoDB or Cassandra are built for this. A single SQL primary would be overwhelmed." },
  { id: 4, question: "You are building a healthcare system with strict regulatory compliance for patient records.",
    correct: "sql" as const, explanation: "Healthcare data requires strong consistency, referential integrity, and audit trails. SQL enforces schema constraints and provides robust ACID compliance." },
  { id: 5, question: "You are building a session store with simple key-value lookups for a web app.",
    correct: "nosql" as const, explanation: "Session data is simple key-value with no relationships. NoSQL provides sub-millisecond lookups with easy horizontal scaling. SQL would be overkill." },
];

function DecisionQuiz() {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>(Array(quizQuestions.length).fill(null));
  const [showResult, setShowResult] = useState(false);

  const q = quizQuestions[currentQ];
  const answered = answers[currentQ] !== null;
  const isCorrect = answers[currentQ] === q.correct;

  const score = answers.filter((a, i) => a === quizQuestions[i].correct).length;
  const allDone = answers.every((a) => a !== null);

  const handleAnswer = useCallback((answer: "sql" | "nosql") => {
    if (answered) return;
    const next = [...answers];
    next[currentQ] = answer;
    setAnswers(next);
  }, [answered, answers, currentQ]);

  return (
    <div className="rounded-xl border border-border/50 overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border/50 bg-muted/30 px-4 py-2">
        <ArrowRightLeft className="size-4 text-violet-400" />
        <span className="text-sm font-medium">Decision Framework Quiz</span>
        <span className="ml-auto text-[11px] text-muted-foreground">
          {currentQ + 1} / {quizQuestions.length}
        </span>
      </div>

      {!showResult ? (
        <div className="p-4 space-y-4">
          <div className="flex gap-1.5 justify-center">
            {quizQuestions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentQ(i)}
                className={cn(
                  "size-2.5 rounded-full transition-all",
                  i === currentQ ? "bg-violet-400 scale-125" :
                  answers[i] !== null
                    ? answers[i] === quizQuestions[i].correct
                      ? "bg-emerald-400"
                      : "bg-red-400"
                    : "bg-muted-foreground/20"
                )}
              />
            ))}
          </div>

          <div className="rounded-lg border border-border/30 bg-muted/20 p-4">
            <p className="text-sm text-foreground leading-relaxed">{q.question}</p>
          </div>

              <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleAnswer("sql")}
              disabled={answered}
              className={cn(
                "rounded-lg border p-3 text-sm font-medium transition-all",
                answered && q.correct === "sql"
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : answered && answers[currentQ] === "sql"
                    ? "bg-red-500/10 border-red-500/30 text-red-400"
                    : "bg-muted/20 border-border/50 text-muted-foreground hover:bg-blue-500/10 hover:border-blue-500/30 hover:text-blue-400"
              )}
            >
              <Database className="size-4 mx-auto mb-1" />
              SQL Database
            </button>
            <button
              onClick={() => handleAnswer("nosql")}
              disabled={answered}
              className={cn(
                "rounded-lg border p-3 text-sm font-medium transition-all",
                answered && q.correct === "nosql"
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : answered && answers[currentQ] === "nosql"
                    ? "bg-red-500/10 border-red-500/30 text-red-400"
                    : "bg-muted/20 border-border/50 text-muted-foreground hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-400"
              )}
            >
              <FileJson className="size-4 mx-auto mb-1" />
              NoSQL Database
            </button>
          </div>

              {answered && (
            <div className={cn(
              "rounded-lg border p-3 text-xs leading-relaxed transition-all",
              isCorrect ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-300" : "border-red-500/20 bg-red-500/5 text-red-300"
            )}>
              <p className="font-semibold mb-1">{isCorrect ? "Correct!" : "Not quite."}</p>
              <p className="text-muted-foreground">{q.explanation}</p>
            </div>
          )}

              <div className="flex gap-2 justify-between">
            <button
              onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
              disabled={currentQ === 0}
              className="px-3 py-1.5 rounded-lg text-xs border border-border/50 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-all"
            >
              Previous
            </button>
            {currentQ < quizQuestions.length - 1 ? (
              <button
                onClick={() => setCurrentQ(currentQ + 1)}
                className="px-3 py-1.5 rounded-lg text-xs border border-violet-500/30 bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 transition-all"
              >
                Next
              </button>
            ) : allDone ? (
              <button
                onClick={() => setShowResult(true)}
                className="px-3 py-1.5 rounded-lg text-xs border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all"
              >
                See Results
              </button>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="p-6 space-y-4 text-center">
          <div className="text-3xl font-bold">
            {score} / {quizQuestions.length}
          </div>
          <p className="text-sm text-muted-foreground">
            {score === quizQuestions.length
              ? "Perfect score! You understand when to use SQL vs NoSQL."
              : score >= 3
                ? "Good understanding! Review the ones you missed -- the trade-offs are nuanced."
                : "Keep learning! The key is matching database type to access patterns and consistency needs."}
          </p>
          <button
            onClick={() => { setAnswers(Array(quizQuestions.length).fill(null)); setCurrentQ(0); setShowResult(false); }}
            className="px-4 py-2 rounded-lg text-xs border border-violet-500/30 bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 transition-all"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function SqlVsNosqlPage() {
  return (
    <div className="space-y-8">
      <TopicHero
        title="SQL vs NoSQL"
        subtitle="Choosing the wrong database type can cost you data integrity, performance, or both. Learn when to pick each and why most production systems use more than one."
        difficulty="beginner"
      />

      <ConversationalCallout type="question">
        Should I use SQL or NoSQL? This is the wrong question. The right question is:
        <strong> what are my access patterns, consistency requirements, and scaling needs?</strong> The
        answer determines your database, not industry hype or personal preference.
      </ConversationalCallout>

      <QueryPlayground />

      <AhaMoment
        question="Why can't SQL just embed data like NoSQL does?"
        answer={
          <p>
            It can, actually. PostgreSQL&apos;s JSONB columns let you embed nested data inside a
            relational table. But that defeats the purpose of normalization -- you lose referential
            integrity, constraint checking, and efficient JOINs. The power of SQL is that when
            a department name changes, you update <em>one row</em> and every user query reflects
            the change automatically. With embedded data, you would need to update every document
            that contains that department.
          </p>
        }
      />

      <SchemaFlexibilityDemo />

      <ConversationalCallout type="tip">
        Schema flexibility sounds great until your application has been running for two years and
        different documents have 47 different shapes. NoSQL gives you <strong>schema-on-read</strong> --
        the application must handle whatever shape the data has. SQL gives you <strong>schema-on-write</strong> --
        the database rejects data that does not fit. Choose based on how much you trust your future self.
      </ConversationalCallout>

      <BeforeAfter
        before={{
          title: "MongoDB for Banking (Dangerous)",
          content: (
            <div className="space-y-2 text-sm text-muted-foreground">
              <pre className="font-mono text-xs whitespace-pre-wrap">
{`// Two separate operations -- no atomicity
await accounts.updateOne(
  { id: "checking" },
  { $inc: { balance: -500 } }
);
// Crash here = $500 vanishes
await accounts.updateOne(
  { id: "savings" },
  { $inc: { balance: 500 } }
);`}
              </pre>
              <p>No rollback if the second write fails. Data integrity is your problem.</p>
            </div>
          ),
        }}
        after={{
          title: "PostgreSQL for Banking (Safe)",
          content: (
            <div className="space-y-2 text-sm text-muted-foreground">
              <pre className="font-mono text-xs whitespace-pre-wrap">
{`BEGIN;
UPDATE accounts SET balance = balance - 500
  WHERE id = 'checking';
UPDATE accounts SET balance = balance + 500
  WHERE id = 'savings';
COMMIT;
-- If anything fails, everything rolls back`}
              </pre>
              <p>Both operations succeed together or fail together. Money never vanishes.</p>
            </div>
          ),
        }}
      />

      <ScalingComparison />

      <AhaMoment
        question="Wait, doesn't MongoDB support transactions now?"
        answer={
          <p>
            Yes, since version 4.0 MongoDB supports multi-document ACID transactions. But they come
            with significant performance overhead -- up to 50% slower writes and increased lock
            contention. They are not the database&apos;s design center. If you need transactions as
            your <em>primary</em> access pattern, you are fighting the tool&apos;s architecture.
            Use PostgreSQL. If you occasionally need a transaction in an otherwise document-oriented
            workload, MongoDB transactions work fine.
          </p>
        }
      />

      <ConversationalCallout type="warning">
        DynamoDB offers unlimited throughput but requires you to know your access patterns at design
        time. Unlike SQL or MongoDB, you cannot run ad-hoc queries, GROUP BY, or aggregations natively.
        If your queries change often or you need analytics, DynamoDB will fight you every step of the way.
      </ConversationalCallout>

      <DecisionQuiz />

      <AhaMoment
        question="PostgreSQL has JSONB. Does that make MongoDB obsolete?"
        answer={
          <p>
            PostgreSQL JSONB is excellent -- you get document flexibility with relational guarantees.
            But MongoDB still wins on native horizontal sharding, its purpose-built aggregation
            pipeline, and operational simplicity for document-heavy workloads. If your primary model
            is relational with occasional document needs, PostgreSQL + JSONB is ideal. If your entire
            application is document-centric at massive scale, MongoDB is still the better fit.
          </p>
        }
      />

      <ConversationalCallout type="tip">
        Most production systems use <strong>polyglot persistence</strong> -- multiple database types
        for different workloads. PostgreSQL for financial transactions, MongoDB for product catalogs
        with varying attributes, Redis for session caching, DynamoDB for high-throughput event streams.
        The question is not &quot;which database is best&quot; but &quot;which database is best
        for <em>this specific workload</em>.&quot;
      </ConversationalCallout>

      <KeyTakeaway
        points={[
          "SQL databases provide ACID guarantees -- use them when data integrity is non-negotiable (finance, healthcare, inventory).",
          "NoSQL databases offer flexibility and horizontal scalability -- use them for varied schemas, high-throughput writes, and predictable access patterns.",
          "SQL JOINs keep data normalized (no duplication) but add query complexity. NoSQL denormalization gives fast reads but risks update anomalies.",
          "SQL scales vertically (bigger server) with a write ceiling. NoSQL scales horizontally (more shards) with near-linear throughput growth.",
          "The failure is never the database -- it is choosing the wrong type for your access patterns and consistency requirements.",
          "Polyglot persistence (multiple database types) is the norm in production systems, not the exception.",
        ]}
      />
    </div>
  );
}
