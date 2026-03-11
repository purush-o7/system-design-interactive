"use client";

import { useState, useEffect } from "react";
import { TopicHero } from "@/components/topic-hero";
import { FailureScenario } from "@/components/failure-scenario";
import { WhyItBreaks } from "@/components/why-it-breaks";
import { ConceptVisualizer } from "@/components/concept-visualizer";
import { CorrectApproach } from "@/components/correct-approach";
import { KeyTakeaway } from "@/components/key-takeaway";
import { BeforeAfter } from "@/components/before-after";
import { ConversationalCallout } from "@/components/conversational-callout";
import { AhaMoment } from "@/components/aha-moment";
import { InteractiveDemo } from "@/components/interactive-demo";
import { ServerNode } from "@/components/server-node";
import { AnimatedFlow } from "@/components/animated-flow";
import { cn } from "@/lib/utils";
import { Database, Table, FileJson, Zap, Shield, Layers } from "lucide-react";

function StorageModelViz() {
  const [mode, setMode] = useState<"sql" | "nosql">("sql");
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % 6), 1200);
    return () => clearInterval(t);
  }, []);

  const sqlRows = [
    { id: 1, name: "Alice", email: "alice@co.com", dept_id: 10 },
    { id: 2, name: "Bob", email: "bob@co.com", dept_id: 20 },
    { id: 3, name: "Carol", email: "carol@co.com", dept_id: 10 },
  ];

  const deptRows = [
    { id: 10, name: "Engineering", budget: "$2M" },
    { id: 20, name: "Marketing", budget: "$1.2M" },
  ];

  const nosqlDocs = [
    {
      _id: "usr_1",
      name: "Alice",
      email: "alice@co.com",
      dept: { name: "Engineering", budget: "$2M" },
      skills: ["Go", "Rust"],
    },
    {
      _id: "usr_2",
      name: "Bob",
      email: "bob@co.com",
      dept: { name: "Marketing", budget: "$1.2M" },
      skills: ["SEO", "Analytics"],
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-2 justify-center">
        <button
          onClick={() => setMode("sql")}
          className={cn(
            "px-4 py-1.5 rounded-lg text-xs font-medium border transition-all",
            mode === "sql"
              ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
              : "bg-muted/20 border-border/50 text-muted-foreground hover:text-foreground"
          )}
        >
          <Table className="size-3.5 inline mr-1.5" />
          Relational (SQL)
        </button>
        <button
          onClick={() => setMode("nosql")}
          className={cn(
            "px-4 py-1.5 rounded-lg text-xs font-medium border transition-all",
            mode === "nosql"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-muted/20 border-border/50 text-muted-foreground hover:text-foreground"
          )}
        >
          <FileJson className="size-3.5 inline mr-1.5" />
          Document (NoSQL)
        </button>
      </div>

      {mode === "sql" ? (
        <div className="space-y-3">
          <div className="rounded-lg border bg-muted/20 p-3">
            <p className="text-[10px] font-mono text-blue-400 mb-2">users table</p>
            <div className="overflow-x-auto">
              <table className="w-full text-[11px] font-mono">
                <thead>
                  <tr className="border-b border-border/30">
                    <th className="text-left py-1 pr-3 text-muted-foreground font-medium">id</th>
                    <th className="text-left py-1 pr-3 text-muted-foreground font-medium">name</th>
                    <th className="text-left py-1 pr-3 text-muted-foreground font-medium">email</th>
                    <th className="text-left py-1 text-muted-foreground font-medium">dept_id</th>
                  </tr>
                </thead>
                <tbody>
                  {sqlRows.map((row, i) => (
                    <tr
                      key={row.id}
                      className={cn(
                        "border-b border-border/10 transition-all duration-300",
                        step === i + 1 ? "bg-blue-500/10" : ""
                      )}
                    >
                      <td className="py-1 pr-3 text-amber-400">{row.id}</td>
                      <td className="py-1 pr-3">{row.name}</td>
                      <td className="py-1 pr-3 text-muted-foreground">{row.email}</td>
                      <td className="py-1">
                        <span className="text-violet-400">{row.dept_id}</span>
                        <span className="text-[9px] text-muted-foreground/50 ml-1">FK</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="rounded-lg border bg-muted/20 p-3">
            <p className="text-[10px] font-mono text-blue-400 mb-2">departments table</p>
            <div className="overflow-x-auto">
              <table className="w-full text-[11px] font-mono">
                <thead>
                  <tr className="border-b border-border/30">
                    <th className="text-left py-1 pr-3 text-muted-foreground font-medium">id</th>
                    <th className="text-left py-1 pr-3 text-muted-foreground font-medium">name</th>
                    <th className="text-left py-1 text-muted-foreground font-medium">budget</th>
                  </tr>
                </thead>
                <tbody>
                  {deptRows.map((row, i) => (
                    <tr
                      key={row.id}
                      className={cn(
                        "border-b border-border/10 transition-all duration-300",
                        step === i + 4 ? "bg-violet-500/10" : ""
                      )}
                    >
                      <td className="py-1 pr-3 text-violet-400">{row.id}</td>
                      <td className="py-1 pr-3">{row.name}</td>
                      <td className="py-1 text-muted-foreground">{row.budget}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground text-center">
            Data normalized into separate tables, connected by foreign keys. JOINs combine them at query time.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {nosqlDocs.map((doc, i) => (
            <div
              key={doc._id}
              className={cn(
                "rounded-lg border bg-muted/20 p-3 transition-all duration-300",
                step === i + 1 ? "border-emerald-500/30 bg-emerald-500/5" : ""
              )}
            >
              <pre className="text-[11px] font-mono leading-relaxed overflow-x-auto">
                <span className="text-muted-foreground/50">{"{"}</span>{"\n"}
                {"  "}<span className="text-emerald-400">&quot;_id&quot;</span>: <span className="text-amber-400">&quot;{doc._id}&quot;</span>,{"\n"}
                {"  "}<span className="text-emerald-400">&quot;name&quot;</span>: <span className="text-foreground">&quot;{doc.name}&quot;</span>,{"\n"}
                {"  "}<span className="text-emerald-400">&quot;email&quot;</span>: <span className="text-muted-foreground">&quot;{doc.email}&quot;</span>,{"\n"}
                {"  "}<span className="text-emerald-400">&quot;dept&quot;</span>: {"{"}{"\n"}
                {"    "}<span className="text-emerald-400">&quot;name&quot;</span>: <span className="text-foreground">&quot;{doc.dept.name}&quot;</span>,{"\n"}
                {"    "}<span className="text-emerald-400">&quot;budget&quot;</span>: <span className="text-muted-foreground">&quot;{doc.dept.budget}&quot;</span>{"\n"}
                {"  }"},{"\n"}
                {"  "}<span className="text-emerald-400">&quot;skills&quot;</span>: [<span className="text-violet-400">{doc.skills.map(s => `"${s}"`).join(", ")}</span>]{"\n"}
                <span className="text-muted-foreground/50">{"}"}</span>
              </pre>
            </div>
          ))}
          <p className="text-[10px] text-muted-foreground text-center">
            Each document is self-contained. Related data is embedded. No JOINs needed, but data may be duplicated.
          </p>
        </div>
      )}
    </div>
  );
}

function QueryComparisonViz() {
  const [activeDb, setActiveDb] = useState<"postgres" | "mongodb" | "dynamodb">("postgres");

  const queries = {
    postgres: {
      label: "PostgreSQL",
      color: "text-blue-400",
      borderColor: "border-blue-500/30",
      bgColor: "bg-blue-500/10",
      queries: [
        {
          label: "Find user by email",
          code: `SELECT u.*, d.name AS dept_name
FROM users u
JOIN departments d ON u.dept_id = d.id
WHERE u.email = 'alice@co.com';`,
        },
        {
          label: "Transfer money (ACID)",
          code: `BEGIN;
UPDATE accounts
  SET balance = balance - 500
  WHERE id = 'checking';
UPDATE accounts
  SET balance = balance + 500
  WHERE id = 'savings';
COMMIT;`,
        },
        {
          label: "Aggregation",
          code: `SELECT dept_id, COUNT(*), AVG(salary)
FROM employees
GROUP BY dept_id
HAVING COUNT(*) > 5
ORDER BY AVG(salary) DESC;`,
        },
      ],
    },
    mongodb: {
      label: "MongoDB",
      color: "text-emerald-400",
      borderColor: "border-emerald-500/30",
      bgColor: "bg-emerald-500/10",
      queries: [
        {
          label: "Find user by email",
          code: `db.users.findOne({
  email: "alice@co.com"
});
// dept data already embedded
// — no JOIN needed`,
        },
        {
          label: "Transfer money (v4.0+)",
          code: `const session = client.startSession();
session.withTransaction(async () => {
  await accounts.updateOne(
    { id: "checking" },
    { $inc: { balance: -500 } },
    { session }
  );
  await accounts.updateOne(
    { id: "savings" },
    { $inc: { balance: 500 } },
    { session }
  );
});`,
        },
        {
          label: "Aggregation",
          code: `db.employees.aggregate([
  { $group: {
    _id: "$dept",
    count: { $sum: 1 },
    avgSalary: { $avg: "$salary" }
  }},
  { $match: { count: { $gt: 5 } } },
  { $sort: { avgSalary: -1 } }
]);`,
        },
      ],
    },
    dynamodb: {
      label: "DynamoDB",
      color: "text-amber-400",
      borderColor: "border-amber-500/30",
      bgColor: "bg-amber-500/10",
      queries: [
        {
          label: "Find user by email (GSI)",
          code: `aws dynamodb query \\
  --table-name Users \\
  --index-name email-index \\
  --key-condition-expression \\
    "email = :e" \\
  --expression-attribute-values \\
    '{":e":{"S":"alice@co.com"}}'`,
        },
        {
          label: "Transfer money (TransactWriteItems)",
          code: `aws dynamodb transact-write-items \\
  --transact-items '[
    {"Update": {
      "TableName": "Accounts",
      "Key": {"id":{"S":"checking"}},
      "UpdateExpression":
        "SET balance = balance - :amt",
      "ExpressionAttributeValues":
        {":amt":{"N":"500"}}
    }},
    {"Update": {
      "TableName": "Accounts",
      "Key": {"id":{"S":"savings"}},
      "UpdateExpression":
        "SET balance = balance + :amt",
      "ExpressionAttributeValues":
        {":amt":{"N":"500"}}
    }}
  ]'`,
        },
        {
          label: "Aggregation",
          code: `// DynamoDB has no native
// aggregation. Options:
// 1. DynamoDB Streams + Lambda
// 2. Export to S3 + Athena
// 3. Maintain counters manually
// 4. Use PartiQL with Scan
//    (expensive, avoid in prod)`,
        },
      ],
    },
  };

  const db = queries[activeDb];

  return (
    <div className="space-y-4">
      <div className="flex gap-2 justify-center flex-wrap">
        {(Object.keys(queries) as Array<keyof typeof queries>).map((key) => (
          <button
            key={key}
            onClick={() => setActiveDb(key)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
              activeDb === key
                ? `${queries[key].bgColor} ${queries[key].borderColor} ${queries[key].color}`
                : "bg-muted/20 border-border/50 text-muted-foreground hover:text-foreground"
            )}
          >
            {queries[key].label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {db.queries.map((q) => (
          <div key={q.label} className={cn("rounded-lg border p-3 space-y-2", db.borderColor.replace("/30", "/10"))}>
            <p className={cn("text-[11px] font-medium", db.color)}>{q.label}</p>
            <pre className="text-[10px] font-mono leading-relaxed text-muted-foreground whitespace-pre-wrap break-words">
              {q.code}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}

function AcidVsBaseViz() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % 8), 1000);
    return () => clearInterval(t);
  }, []);

  const acidPhase = step < 4 ? step : 4;
  const basePhase = step < 4 ? 0 : step - 3;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="rounded-lg border bg-muted/20 p-4 space-y-3">
        <h4 className="text-xs font-semibold text-blue-400 flex items-center gap-1.5">
          <Shield className="size-3.5" />
          ACID Transaction
        </h4>
        <div className="space-y-1.5">
          {[
            { label: "BEGIN", desc: "Start transaction" },
            { label: "DEBIT", desc: "checking -= $500" },
            { label: "CREDIT", desc: "savings += $500" },
            { label: "COMMIT", desc: "Both succeed or both rollback" },
          ].map((item, i) => (
            <div
              key={item.label}
              className={cn(
                "flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[11px] border transition-all duration-300",
                acidPhase > i
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : acidPhase === i
                  ? "bg-blue-500/10 border-blue-500/30 text-blue-400 ring-1 ring-blue-500/20"
                  : "bg-muted/10 border-border/30 text-muted-foreground/40"
              )}
            >
              <span className="font-mono font-bold w-14">{item.label}</span>
              <span className="text-muted-foreground">{item.desc}</span>
            </div>
          ))}
        </div>
        <p className={cn(
          "text-[10px] font-medium text-center transition-all",
          acidPhase >= 4 ? "text-emerald-400" : "text-muted-foreground/50"
        )}>
          {acidPhase >= 4 ? "All-or-nothing. Money is safe." : "Processing..."}
        </p>
      </div>

      <div className="rounded-lg border bg-muted/20 p-4 space-y-3">
        <h4 className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
          <Zap className="size-3.5" />
          BASE Operations
        </h4>
        <div className="space-y-1.5">
          {[
            { label: "WRITE 1", desc: "checking -= $500" },
            { label: "CRASH!", desc: "Application error" },
            { label: "WRITE 2", desc: "savings += $500" },
            { label: "RESULT", desc: "Money vanished" },
          ].map((item, i) => (
            <div
              key={item.label}
              className={cn(
                "flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[11px] border transition-all duration-300",
                i === 1 && basePhase >= 2
                  ? "bg-red-500/10 border-red-500/20 text-red-400"
                  : basePhase > i
                  ? i < 2
                    ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                    : "bg-muted/10 border-border/30 text-muted-foreground/40 line-through"
                  : basePhase === i
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-400 ring-1 ring-amber-500/20"
                  : "bg-muted/10 border-border/30 text-muted-foreground/40"
              )}
            >
              <span className="font-mono font-bold w-14">{item.label}</span>
              <span className="text-muted-foreground">{item.desc}</span>
            </div>
          ))}
        </div>
        <p className={cn(
          "text-[10px] font-medium text-center transition-all",
          basePhase >= 4 ? "text-red-400" : "text-muted-foreground/50"
        )}>
          {basePhase >= 4 ? "$500 lost. No rollback." : basePhase >= 2 ? "Crash between writes!" : "Processing..."}
        </p>
      </div>
    </div>
  );
}

function DatabasePickerViz() {
  const [selected, setSelected] = useState<string | null>(null);

  const databases = [
    {
      id: "postgres",
      name: "PostgreSQL",
      type: "Relational (SQL)",
      color: "text-blue-400",
      border: "border-blue-500/30",
      bg: "bg-blue-500/5",
      strengths: ["ACID transactions", "Complex JOINs", "SQL standard", "JSONB support", "Extensions ecosystem"],
      weaknesses: ["Vertical scaling only", "Write throughput ceiling", "Schema migrations can lock tables"],
      maxWrite: "~50K writes/sec",
      maxRead: "~100K reads/sec",
      bestFor: "Core business logic, financial data, SaaS platforms, complex analytics",
      pacelc: "PC/EC",
    },
    {
      id: "mongodb",
      name: "MongoDB",
      type: "Document (NoSQL)",
      color: "text-emerald-400",
      border: "border-emerald-500/30",
      bg: "bg-emerald-500/5",
      strengths: ["Flexible schema", "Native sharding", "Rich query language", "Aggregation pipeline", "Change streams"],
      weaknesses: ["Multi-doc txns have overhead", "Data duplication", "No JOINs (use $lookup)"],
      maxWrite: "~100K writes/sec",
      maxRead: "~200K reads/sec",
      bestFor: "Content management, catalogs, user profiles, real-time analytics, mobile apps",
      pacelc: "PA/EC",
    },
    {
      id: "dynamodb",
      name: "DynamoDB",
      type: "Key-Value / Wide Column",
      color: "text-amber-400",
      border: "border-amber-500/30",
      bg: "bg-amber-500/5",
      strengths: ["Unlimited scale", "Single-digit ms latency", "Fully managed / serverless", "Auto-scaling", "Global tables"],
      weaknesses: ["Must know access patterns upfront", "No ad-hoc queries", "Expensive scans", "25 GSI limit"],
      maxWrite: "Unlimited (on-demand)",
      maxRead: "Unlimited (on-demand)",
      bestFor: "Session stores, IoT data, gaming leaderboards, high-traffic microservices",
      pacelc: "PA/EL",
    },
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {databases.map((db) => (
          <button
            key={db.id}
            onClick={() => setSelected(selected === db.id ? null : db.id)}
            className={cn(
              "rounded-lg border p-3 text-left transition-all hover:scale-[1.01]",
              selected === db.id ? `${db.bg} ${db.border}` : "bg-muted/20 border-border/50"
            )}
          >
            <p className={cn("text-xs font-semibold", selected === db.id ? db.color : "text-foreground")}>{db.name}</p>
            <p className="text-[10px] text-muted-foreground">{db.type}</p>
          </button>
        ))}
      </div>
      {selected && (() => {
        const db = databases.find((d) => d.id === selected)!;
        return (
          <div className={cn("rounded-lg border p-4 space-y-3 transition-all", db.border, db.bg)}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] font-medium text-emerald-400 mb-1">Strengths</p>
                <ul className="space-y-0.5">
                  {db.strengths.map((s) => (
                    <li key={s} className="text-[11px] text-muted-foreground flex items-start gap-1.5">
                      <span className="text-emerald-400 mt-0.5">+</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-[10px] font-medium text-red-400 mb-1">Trade-offs</p>
                <ul className="space-y-0.5">
                  {db.weaknesses.map((w) => (
                    <li key={w} className="text-[11px] text-muted-foreground flex items-start gap-1.5">
                      <span className="text-red-400 mt-0.5">-</span> {w}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-1">
              <div className="rounded-md bg-muted/30 p-2 text-center">
                <p className="text-[9px] text-muted-foreground">Write Throughput</p>
                <p className="text-[11px] font-mono font-semibold">{db.maxWrite}</p>
              </div>
              <div className="rounded-md bg-muted/30 p-2 text-center">
                <p className="text-[9px] text-muted-foreground">Read Throughput</p>
                <p className="text-[11px] font-mono font-semibold">{db.maxRead}</p>
              </div>
              <div className="rounded-md bg-muted/30 p-2 text-center">
                <p className="text-[9px] text-muted-foreground">PACELC</p>
                <p className="text-[11px] font-mono font-semibold">{db.pacelc}</p>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground">
              <span className="font-medium text-foreground">Best for:</span> {db.bestFor}
            </p>
          </div>
        );
      })()}
      {!selected && (
        <p className="text-[10px] text-muted-foreground text-center">Click a database to explore its strengths, trade-offs, and ideal use cases.</p>
      )}
    </div>
  );
}

export default function SqlVsNosqlPage() {
  return (
    <div className="space-y-8">
      <TopicHero
        title="SQL vs NoSQL"
        subtitle="Choosing the wrong database type can cost you data integrity, performance, or both. Learn when to pick each and why most production systems use more than one."
        difficulty="beginner"
      />

      <FailureScenario title="The $500 that vanished into thin air">
        <p className="text-sm text-muted-foreground">
          Your fintech startup picks MongoDB for its banking application because &quot;NoSQL scales better.&quot;
          A user transfers $500 from checking to savings. Midway through the operation, the
          application crashes. The money is deducted from checking but never credited to savings.
          <strong className="text-foreground"> $500 has vanished.</strong>
        </p>
        <p className="text-sm text-muted-foreground">
          Customer support tickets flood in. Auditors start asking questions. Your team scrambles
          to write reconciliation scripts, but the damage is done &mdash; you have no transaction
          guarantees to fall back on.
        </p>
        <div className="flex items-center justify-center gap-3 py-2 flex-wrap">
          <ServerNode type="database" label="Checking" sublabel="-$500" status="warning" />
          <span className="text-red-500 text-lg font-mono">---&times;---</span>
          <ServerNode type="database" label="Savings" sublabel="+$0" status="unhealthy" />
        </div>
      </FailureScenario>

      <WhyItBreaks title="Two fundamentally different philosophies">
        <p className="text-sm text-muted-foreground">
          This is not just a database choice &mdash; it is a choice between two fundamentally
          different data philosophies. PostgreSQL forces you to define your schema, normalize
          your data into related tables, and gives you ACID transactions to keep everything
          consistent. MongoDB lets you store data the way your application sees it &mdash;
          as nested documents &mdash; and trades strict consistency for flexibility and
          horizontal scalability.
        </p>
        <p className="text-sm text-muted-foreground">
          The problem is not that MongoDB is bad. The problem is using a <strong className="text-foreground">flexibility-first</strong> tool
          for a <strong className="text-foreground">consistency-first</strong> workload.
          Understanding these trade-offs is what separates production-ready engineering from
          resume-driven development.
        </p>
      </WhyItBreaks>

      <ConceptVisualizer title="How Data is Stored: Tables vs Documents">
        <p className="text-sm text-muted-foreground mb-4">
          Toggle between the two models to see how the same data &mdash; users and their
          departments &mdash; is structured differently. In SQL, data is normalized into
          separate tables connected by foreign keys. In NoSQL, related data is embedded
          directly into each document.
        </p>
        <StorageModelViz />
      </ConceptVisualizer>

      <ConceptVisualizer title="ACID vs BASE — Animated">
        <p className="text-sm text-muted-foreground mb-4">
          Watch what happens when a crash occurs mid-operation. ACID transactions guarantee
          all-or-nothing execution. Without them, partial writes can leave your data in
          an inconsistent state.
        </p>
        <AcidVsBaseViz />
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="rounded-lg bg-muted/30 p-3 space-y-1.5">
            <h4 className="text-xs font-semibold">ACID (SQL Databases)</h4>
            <ul className="space-y-1 text-[11px] text-muted-foreground">
              <li><strong className="text-foreground">Atomicity</strong> &mdash; All operations succeed or all fail</li>
              <li><strong className="text-foreground">Consistency</strong> &mdash; Data moves between valid states only</li>
              <li><strong className="text-foreground">Isolation</strong> &mdash; Concurrent transactions do not interfere</li>
              <li><strong className="text-foreground">Durability</strong> &mdash; Committed data survives crashes</li>
            </ul>
          </div>
          <div className="rounded-lg bg-muted/30 p-3 space-y-1.5">
            <h4 className="text-xs font-semibold">BASE (NoSQL Databases)</h4>
            <ul className="space-y-1 text-[11px] text-muted-foreground">
              <li><strong className="text-foreground">Basically Available</strong> &mdash; System always responds</li>
              <li><strong className="text-foreground">Soft State</strong> &mdash; State may change without input</li>
              <li><strong className="text-foreground">Eventually Consistent</strong> &mdash; Replicas converge over time</li>
            </ul>
          </div>
        </div>
      </ConceptVisualizer>

      <ConceptVisualizer title="Query Syntax Comparison">
        <p className="text-sm text-muted-foreground mb-4">
          See how the same operations look in PostgreSQL, MongoDB, and DynamoDB. Notice how
          DynamoDB requires you to know your access patterns upfront &mdash; ad-hoc queries
          are expensive or impossible.
        </p>
        <QueryComparisonViz />
      </ConceptVisualizer>

      <BeforeAfter
        before={{
          title: "MongoDB for Banking",
          content: (
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="font-mono text-xs">
                {`// Two separate operations — no atomicity`}<br />
                {`await accounts.updateOne(`}<br />
                {`  { id: "checking" },`}<br />
                {`  { $inc: { balance: -500 } }`}<br />
                {`);`}<br />
                {`// Crash here = money lost`}<br />
                {`await accounts.updateOne(`}<br />
                {`  { id: "savings" },`}<br />
                {`  { $inc: { balance: 500 } }`}<br />
                {`);`}
              </p>
              <p>No rollback if the second write fails. Data integrity is your problem.</p>
            </div>
          ),
        }}
        after={{
          title: "PostgreSQL for Banking",
          content: (
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="font-mono text-xs">
                {`BEGIN;`}<br />
                {`UPDATE accounts SET balance = balance - 500`}<br />
                {`  WHERE id = 'checking';`}<br />
                {`UPDATE accounts SET balance = balance + 500`}<br />
                {`  WHERE id = 'savings';`}<br />
                {`COMMIT;`}<br />
                {`-- If anything fails, everything rolls back`}
              </p>
              <p>Both operations succeed together or fail together. Money never vanishes.</p>
            </div>
          ),
        }}
      />

      <ConceptVisualizer title="Database Deep Dive">
        <p className="text-sm text-muted-foreground mb-4">
          Click any database below to explore its strengths, trade-offs, throughput characteristics,
          and PACELC classification.
        </p>
        <DatabasePickerViz />
      </ConceptVisualizer>

      <AhaMoment
        question="What do those PACELC labels (PC/EC, PA/EC, PA/EL) actually mean?"
        answer={
          <p>
            PACELC extends the CAP theorem. It says: if there is a <strong>P</strong>artition, do you
            choose <strong>A</strong>vailability or <strong>C</strong>onsistency? <strong>E</strong>lse
            (no partition), do you optimize for <strong>L</strong>atency or <strong>C</strong>onsistency?
            PostgreSQL (PC/EC) always chooses consistency — it will refuse writes rather than risk
            inconsistency. DynamoDB (PA/EL) always prioritizes availability and speed — it may serve
            stale reads but never goes down. MongoDB (PA/EC) chooses availability during partitions
            but consistency otherwise. The dedicated CAP Theorem page explores this in full depth
            with interactive visualizations.
          </p>
        }
      />

      <ConversationalCallout type="tip">
        PostgreSQL scales reads with <strong>read replicas</strong> — copies of the primary database
        that handle SELECT queries. Writes are still limited to one primary node. This is the first
        scaling path for any relational database: one primary for writes, multiple replicas for reads.
        Most SaaS applications hit read bottlenecks long before write bottlenecks, so read replicas
        can take you surprisingly far (often to millions of users) before you need to consider
        sharding or moving to NoSQL.
      </ConversationalCallout>

      <ConversationalCallout type="question">
        So is NoSQL always bad? Absolutely not. NoSQL databases are excellent when you need flexible schemas,
        horizontal scaling, or are dealing with data that does not have complex relationships.
        Think user profiles, product catalogs, IoT sensor data, or session storage. The
        key is matching the database to your <em>access patterns and consistency requirements</em>.
      </ConversationalCallout>

      <CorrectApproach title="The Decision Framework">
        <div className="space-y-4">
          <AnimatedFlow
            steps={[
              { id: "q1", label: "Need ACID transactions?", description: "Multi-row atomicity required?", icon: <Shield className="size-4" /> },
              { id: "q2", label: "Complex relationships?", description: "Many JOINs and foreign keys?", icon: <Layers className="size-4" /> },
              { id: "q3", label: "Schema stability?", description: "Schema changes rarely or often?", icon: <Table className="size-4" /> },
              { id: "q4", label: "Scale requirements?", description: "Vertical enough or need horizontal?", icon: <Database className="size-4" /> },
              { id: "q5", label: "Access patterns?", description: "Ad-hoc queries or predictable lookups?", icon: <Zap className="size-4" /> },
            ]}
            interval={2500}
          />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 pr-4 font-semibold">Criteria</th>
                  <th className="text-left py-2 pr-4 font-semibold">PostgreSQL</th>
                  <th className="text-left py-2 pr-4 font-semibold">MongoDB</th>
                  <th className="text-left py-2 font-semibold">DynamoDB</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground text-xs">
                <tr className="border-b border-muted">
                  <td className="py-2 pr-4 font-medium text-foreground">Data model</td>
                  <td className="py-2 pr-4">Normalized tables + JOINs</td>
                  <td className="py-2 pr-4">Nested documents</td>
                  <td className="py-2">Single-table key-value</td>
                </tr>
                <tr className="border-b border-muted">
                  <td className="py-2 pr-4 font-medium text-foreground">Schema</td>
                  <td className="py-2 pr-4">Strict, enforced</td>
                  <td className="py-2 pr-4">Flexible, optional validation</td>
                  <td className="py-2">Schema-free (except keys)</td>
                </tr>
                <tr className="border-b border-muted">
                  <td className="py-2 pr-4 font-medium text-foreground">Transactions</td>
                  <td className="py-2 pr-4 text-emerald-400">Full ACID</td>
                  <td className="py-2 pr-4 text-amber-400">Multi-doc (v4.0+, with overhead)</td>
                  <td className="py-2 text-amber-400">TransactWriteItems (25 items max)</td>
                </tr>
                <tr className="border-b border-muted">
                  <td className="py-2 pr-4 font-medium text-foreground">Scaling</td>
                  <td className="py-2 pr-4">Vertical + read replicas</td>
                  <td className="py-2 pr-4">Native sharding</td>
                  <td className="py-2">Auto-scaling, unlimited</td>
                </tr>
                <tr className="border-b border-muted">
                  <td className="py-2 pr-4 font-medium text-foreground">Query power</td>
                  <td className="py-2 pr-4 text-emerald-400">Full SQL, CTEs, window fns</td>
                  <td className="py-2 pr-4 text-emerald-400">Rich query + aggregation pipeline</td>
                  <td className="py-2 text-red-400">Key-based only, no ad-hoc</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-medium text-foreground">Best for</td>
                  <td className="py-2 pr-4">Finance, SaaS, analytics</td>
                  <td className="py-2 pr-4">Content, catalogs, mobile</td>
                  <td className="py-2">Sessions, IoT, serverless</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </CorrectApproach>

      <ConversationalCallout type="tip">
        Many modern systems use <strong>polyglot persistence</strong> &mdash; multiple database types
        for different jobs. PostgreSQL for financial transactions and user accounts, MongoDB for product
        catalogs with varying attributes, Redis for session caching, and DynamoDB for high-throughput
        event streams. The question is not &quot;which database is best&quot; but &quot;which database
        is best for <em>this specific workload</em>.&quot;
      </ConversationalCallout>

      <AhaMoment
        question="Wait, doesn't MongoDB support transactions now?"
        answer={
          <p>
            Yes, since version 4.0 MongoDB supports multi-document ACID transactions. But they come
            with significant performance overhead &mdash; up to 50% slower writes and increased
            lock contention. They are not the database&apos;s design center. If you need transactions
            as your <em>primary</em> access pattern, you are fighting the tool&apos;s architecture.
            Use PostgreSQL. If you occasionally need a transaction in an otherwise document-oriented
            workload, MongoDB transactions work well enough.
          </p>
        }
      />

      <AhaMoment
        question="PostgreSQL has JSONB now. Does that make MongoDB obsolete?"
        answer={
          <p>
            PostgreSQL&apos;s JSONB support is excellent &mdash; you get the flexibility of
            document storage with the guarantees of a relational database. But MongoDB still
            wins on horizontal scalability (native sharding), operational simplicity for
            document workloads, and its purpose-built aggregation pipeline. If your primary
            model is relational with occasional document needs, PostgreSQL + JSONB is ideal.
            If your entire application is document-centric at scale, MongoDB is still the
            better fit.
          </p>
        }
      />

      <KeyTakeaway
        points={[
          "SQL databases provide ACID guarantees — use them when data integrity is non-negotiable (finance, healthcare, inventory).",
          "NoSQL databases offer flexibility and horizontal scalability — use them for unstructured data, high-throughput reads, and flexible schemas.",
          "PostgreSQL stores data in normalized tables with JOINs; MongoDB embeds related data in documents; DynamoDB requires access patterns designed upfront.",
          "The failure is never the database — it's choosing the wrong type for your access patterns and consistency requirements.",
          "Polyglot persistence (using multiple database types) is the norm in production systems, not the exception.",
          "DynamoDB offers unlimited scale but zero ad-hoc query power — know your access patterns before choosing it.",
        ]}
      />
    </div>
  );
}
