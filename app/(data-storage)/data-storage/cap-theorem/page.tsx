"use client";

import { useState, useMemo, useCallback } from "react";
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

// ─── Types ──────────────────────────────────────────────────────────────────

type Phase = "normal" | "partitioned" | "choose" | "cp-result" | "ap-result";
type CAPSelection = "CP" | "AP" | "CA" | null;

// ─── Partition Playground ───────────────────────────────────────────────────

function PartitionPlayground() {
  const [phase, setPhase] = useState<Phase>("normal");
  const [latencyHistory, setLatencyHistory] = useState<
    { time: string; cp: number; ap: number }[]
  >(() =>
    Array.from({ length: 10 }, (_, i) => ({
      time: `${i}s`,
      cp: 12 + Math.random() * 8,
      ap: 10 + Math.random() * 6,
    }))
  );

  const sim = useSimulation({
    intervalMs: 800,
    maxSteps: 30,
    onTick: (tick) => {
      setLatencyHistory((prev) => {
        const newPoint = { time: `${prev.length}s`, cp: 0, ap: 0 };
        if (phase === "cp-result") {
          newPoint.cp = 200 + Math.random() * 300; // spikes
          newPoint.ap = 12 + Math.random() * 8;
        } else if (phase === "ap-result") {
          newPoint.cp = 14 + Math.random() * 6;
          newPoint.ap = 14 + Math.random() * 8;
        } else if (phase === "partitioned" || phase === "choose") {
          newPoint.cp = 50 + Math.random() * 40;
          newPoint.ap = 15 + Math.random() * 10;
        } else {
          newPoint.cp = 12 + Math.random() * 8;
          newPoint.ap = 10 + Math.random() * 6;
        }
        return [...prev.slice(-19), newPoint];
      });
    },
  });

  const triggerPartition = useCallback(() => {
    setPhase("partitioned");
    sim.play();
    setTimeout(() => {
      sim.pause();
      setPhase("choose");
    }, 2400);
  }, [sim]);

  const chooseCP = useCallback(() => {
    setPhase("cp-result");
    sim.play();
  }, [sim]);

  const chooseAP = useCallback(() => {
    setPhase("ap-result");
    sim.play();
  }, [sim]);

  const handleReset = useCallback(() => {
    setPhase("normal");
    sim.reset();
    setLatencyHistory(
      Array.from({ length: 10 }, (_, i) => ({
        time: `${i}s`,
        cp: 12 + Math.random() * 8,
        ap: 10 + Math.random() * 6,
      }))
    );
  }, [sim]);

  // Node data changes based on phase
  const nodeAData = useMemo(() => {
    const base = { label: "Node A (US-East)", handles: { top: true, bottom: true, left: true, right: true } };
    switch (phase) {
      case "normal":
        return { ...base, sublabel: "inventory: 5", status: "healthy" as const, metrics: [{ label: "Writes", value: "OK" }] };
      case "partitioned":
      case "choose":
        return { ...base, sublabel: "inventory: 5", status: "warning" as const, metrics: [{ label: "Writes", value: "3 pending" }] };
      case "cp-result":
        return { ...base, sublabel: "inventory: 2", status: "healthy" as const, metrics: [{ label: "Writes", value: "3 applied" }] };
      case "ap-result":
        return { ...base, sublabel: "inventory: 2", status: "warning" as const, metrics: [{ label: "Writes", value: "3 applied" }] };
    }
  }, [phase]);

  const nodeBData = useMemo(() => {
    const base = { label: "Node B (EU-West)", handles: { top: true, bottom: true, left: true, right: true } };
    switch (phase) {
      case "normal":
        return { ...base, sublabel: "inventory: 5", status: "healthy" as const, metrics: [{ label: "Writes", value: "OK" }] };
      case "partitioned":
      case "choose":
        return { ...base, sublabel: "inventory: 5 (stale!)", status: "unhealthy" as const, metrics: [{ label: "Sync", value: "LOST" }] };
      case "cp-result":
        return { ...base, sublabel: "503 Unavailable", status: "unhealthy" as const, metrics: [{ label: "Reads", value: "REJECTED" }] };
      case "ap-result":
        return { ...base, sublabel: "inventory: 5 (WRONG)", status: "warning" as const, metrics: [{ label: "Reads", value: "STALE" }] };
    }
  }, [phase]);

  const nodeCData = useMemo(() => {
    const base = { label: "Node C (AP-South)", handles: { top: true, bottom: true, left: true, right: true } };
    switch (phase) {
      case "normal":
        return { ...base, sublabel: "inventory: 5", status: "healthy" as const, metrics: [{ label: "Writes", value: "OK" }] };
      case "partitioned":
      case "choose":
        return { ...base, sublabel: "inventory: 5 (stale!)", status: "unhealthy" as const, metrics: [{ label: "Sync", value: "LOST" }] };
      case "cp-result":
        return { ...base, sublabel: "503 Unavailable", status: "unhealthy" as const, metrics: [{ label: "Reads", value: "REJECTED" }] };
      case "ap-result":
        return { ...base, sublabel: "inventory: 5 (WRONG)", status: "warning" as const, metrics: [{ label: "Reads", value: "STALE" }] };
    }
  }, [phase]);

  const nodes: FlowNode[] = useMemo(
    () => [
      { id: "a", type: "databaseNode", position: { x: 200, y: 20 }, data: nodeAData },
      { id: "b", type: "databaseNode", position: { x: 50, y: 200 }, data: nodeBData },
      { id: "c", type: "databaseNode", position: { x: 350, y: 200 }, data: nodeCData },
    ],
    [nodeAData, nodeBData, nodeCData]
  );

  const isPartitioned = phase !== "normal";

  const edges: FlowEdge[] = useMemo(() => {
    const healthy = {
      style: { stroke: "#22c55e", strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: "#22c55e" },
      animated: true,
    };
    const broken = {
      style: { stroke: "#ef4444", strokeWidth: 3, strokeDasharray: "8 4" },
      markerEnd: { type: MarkerType.ArrowClosed, color: "#ef4444" },
      animated: false,
    };

    const edgeStyle = isPartitioned ? broken : healthy;

    return [
      { id: "a-b", source: "a", target: "b", ...edgeStyle, label: isPartitioned ? "PARTITION" : "replication" },
      { id: "a-c", source: "a", target: "c", ...edgeStyle, label: isPartitioned ? "PARTITION" : "replication" },
      { id: "b-c", source: "b", target: "c", ...(isPartitioned ? broken : healthy), label: isPartitioned ? "PARTITION" : "replication" },
    ];
  }, [isPartitioned]);

  const explanationForPhase = useMemo(() => {
    switch (phase) {
      case "normal":
        return (
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">All nodes healthy</h3>
            <p>Three database replicas sync writes in real time. Every node has the same inventory count. Reads from any node return consistent data.</p>
            <button
              onClick={triggerPartition}
              className="w-full px-4 py-2.5 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 font-medium text-sm hover:bg-red-500/30 transition-colors"
            >
              Simulate Network Partition
            </button>
            <p className="text-xs text-muted-foreground/60">Click to sever the network link between Node A and the other nodes.</p>
          </div>
        );
      case "partitioned":
        return (
          <div className="space-y-3">
            <h3 className="font-semibold text-red-400">Network partition detected!</h3>
            <p>A fiber cut has severed communication between Node A and Nodes B/C. Node A received 3 purchase orders (inventory drops to 2). Nodes B and C still show the old inventory of 5.</p>
            <div className="animate-pulse text-xs text-red-400 font-mono">Detecting partition...</div>
          </div>
        );
      case "choose":
        return (
          <div className="space-y-3">
            <h3 className="font-semibold text-amber-400">Decision time</h3>
            <p>The partition is real. Nodes B and C have stale data. Clients are sending requests to all nodes. What should your system do?</p>
            <div className="space-y-2">
              <button
                onClick={chooseCP}
                className="w-full px-4 py-2.5 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-400 font-medium text-sm hover:bg-blue-500/30 transition-colors"
              >
                Prioritize Consistency (CP)
              </button>
              <p className="text-[11px] text-muted-foreground">Nodes B/C reject all reads and writes. No stale data served, but EU and APAC users see downtime.</p>
              <button
                onClick={chooseAP}
                className="w-full px-4 py-2.5 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400 font-medium text-sm hover:bg-green-500/30 transition-colors"
              >
                Prioritize Availability (AP)
              </button>
              <p className="text-[11px] text-muted-foreground">Nodes B/C keep serving requests with stale inventory. Users can shop, but risk overselling.</p>
            </div>
          </div>
        );
      case "cp-result":
        return (
          <div className="space-y-3">
            <h3 className="font-semibold text-blue-400">CP: Consistency wins</h3>
            <p>Nodes B and C return <code className="font-mono bg-muted px-1 rounded text-xs">503 Service Unavailable</code> for all requests. EU and APAC users cannot shop.</p>
            <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3 space-y-1">
              <p className="text-xs font-medium text-blue-400">What you get:</p>
              <ul className="text-xs space-y-1 list-disc list-inside">
                <li>Zero overselling — inventory is always accurate</li>
                <li>No conflict resolution needed when partition heals</li>
                <li>Simple recovery: sync and resume</li>
              </ul>
            </div>
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 space-y-1">
              <p className="text-xs font-medium text-red-400">What you lose:</p>
              <ul className="text-xs space-y-1 list-disc list-inside">
                <li>2/3 of your users see errors</li>
                <li>Lost revenue during partition</li>
                <li>Read latency spikes (see chart below)</li>
              </ul>
            </div>
            <button onClick={handleReset} className="w-full px-3 py-2 rounded-lg bg-muted/30 border border-border/50 text-muted-foreground text-sm hover:bg-muted/50 transition-colors">
              Reset simulation
            </button>
          </div>
        );
      case "ap-result":
        return (
          <div className="space-y-3">
            <h3 className="font-semibold text-green-400">AP: Availability wins</h3>
            <p>Nodes B and C keep serving requests. They show inventory: 5 (the stale value). Customers in EU and APAC place orders for items that no longer exist.</p>
            <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-3 space-y-1">
              <p className="text-xs font-medium text-green-400">What you get:</p>
              <ul className="text-xs space-y-1 list-disc list-inside">
                <li>100% uptime — every user can shop</li>
                <li>Low read latency (no consensus wait)</li>
                <li>Great user experience during partition</li>
              </ul>
            </div>
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 space-y-1">
              <p className="text-xs font-medium text-red-400">What you lose:</p>
              <ul className="text-xs space-y-1 list-disc list-inside">
                <li>3 items oversold — real money lost</li>
                <li>Must cancel orders, refund, apologize</li>
                <li>Complex conflict resolution when partition heals</li>
              </ul>
            </div>
            <button onClick={handleReset} className="w-full px-3 py-2 rounded-lg bg-muted/30 border border-border/50 text-muted-foreground text-sm hover:bg-muted/50 transition-colors">
              Reset simulation
            </button>
          </div>
        );
    }
  }, [phase, triggerPartition, chooseCP, chooseAP, handleReset]);

  return (
    <div className="space-y-6">
      <Playground
        title="Network Partition Simulator"
        simulation={sim}
        canvasHeight="min-h-[380px]"
        canvas={
          <FlowDiagram
            nodes={nodes}
            edges={edges}
            fitView
            interactive
            minHeight={380}
          />
        }
        explanation={explanationForPhase}
        controls={
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="flex items-center gap-2">
              {(["normal", "partitioned", "choose", "cp-result", "ap-result"] as Phase[]).map((p) => (
                <div
                  key={p}
                  className={cn(
                    "text-[10px] px-2 py-1 rounded-full border font-medium transition-all",
                    phase === p
                      ? p === "normal"
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        : p === "cp-result"
                        ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                        : p === "ap-result"
                        ? "bg-green-500/10 border-green-500/30 text-green-400"
                        : "bg-red-500/10 border-red-500/30 text-red-400"
                      : "bg-muted/20 border-border/50 text-muted-foreground/40"
                  )}
                >
                  {p === "cp-result" ? "CP" : p === "ap-result" ? "AP" : p}
                </div>
              ))}
            </div>
          </div>
        }
      />

      {/* Latency chart */}
      <div className="rounded-xl border border-border/50 bg-muted/5 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Read Latency During Partition</h3>
          <div className="flex items-center gap-3 text-[10px]">
            <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-blue-500" /> CP system</span>
            <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-emerald-500" /> AP system</span>
          </div>
        </div>
        <LiveChart
          type="latency"
          data={latencyHistory}
          dataKeys={{ x: "time", y: ["cp", "ap"], label: ["CP (e.g. MongoDB)", "AP (e.g. Cassandra)"] }}
          colors={["#3b82f6", "#22c55e"]}
          height={180}
          referenceLines={[{ y: 100, label: "SLA threshold", color: "#ef4444" }]}
        />
        <p className="text-xs text-muted-foreground">
          {phase === "cp-result"
            ? "CP systems spike because they block reads until consensus is re-established. AP systems stay fast but serve stale data."
            : phase === "ap-result"
            ? "AP systems maintain low latency by serving whatever data they have, even if stale. Fast but potentially wrong."
            : "Both systems perform similarly during normal operation. The difference only appears during partitions."}
        </p>
      </div>
    </div>
  );
}

// ─── Interactive CAP Triangle ───────────────────────────────────────────────

function CAPTriangleExplorer() {
  const [selected, setSelected] = useState<CAPSelection>(null);

  const combos = {
    CP: {
      title: "CP — Consistent + Partition-Tolerant",
      desc: "During a partition, reject requests rather than serve stale data. Users may see downtime, but never incorrect data.",
      databases: [
        { name: "MongoDB", detail: "Blocks writes during primary election (10-30s)" },
        { name: "CockroachDB", detail: "Raft consensus, blocks if quorum unavailable" },
        { name: "Google Spanner", detail: "TrueTime atomic clocks for external consistency" },
        { name: "etcd", detail: "Raft-based, used for Kubernetes cluster state" },
        { name: "HBase", detail: "Strong consistency via single RegionServer per region" },
      ],
      color: "#3b82f6",
      useCase: "Payments, inventory, leader election, configuration stores",
    },
    AP: {
      title: "AP — Available + Partition-Tolerant",
      desc: "During a partition, keep serving requests with potentially stale data. Every request gets a response. Conflicts resolved later.",
      databases: [
        { name: "Cassandra", detail: "Tunable consistency, default favors availability" },
        { name: "DynamoDB", detail: "Eventually consistent reads, always writable" },
        { name: "CouchDB", detail: "Multi-master replication with conflict detection" },
        { name: "Riak", detail: "Ring-based, uses vector clocks for conflict resolution" },
      ],
      color: "#22c55e",
      useCase: "Social feeds, analytics, user preferences, shopping carts",
    },
    CA: {
      title: "CA — Consistent + Available (Theoretical)",
      desc: "Only possible when there are no network partitions. In practice, this means a single-node system. Not viable for distributed architectures.",
      databases: [
        { name: "PostgreSQL (single)", detail: "Not distributed, no partition to tolerate" },
        { name: "MySQL (single)", detail: "Single node, ACID-compliant" },
        { name: "SQLite", detail: "Embedded, single-process database" },
      ],
      color: "#eab308",
      useCase: "Prototypes, local apps, single-region with no replication",
    },
  };

  return (
    <div className="rounded-xl border border-border/50 bg-muted/5 p-6 space-y-5">
      <h3 className="text-lg font-semibold">CAP Triangle Explorer</h3>
      <p className="text-sm text-muted-foreground">
        Click a combination to see which real databases fit and when to use them.
        Remember: since network partitions are inevitable, the real choice is always CP vs AP.
      </p>

      <div className="flex justify-center">
        <svg viewBox="0 0 320 300" className="w-full max-w-xs">
          {/* Triangle fill based on selection */}
          <polygon
            points="160,30 30,270 290,270"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            opacity={0.15}
          />

          {/* CP edge (C to P) */}
          <g className="cursor-pointer" onClick={() => setSelected(selected === "CP" ? null : "CP")}>
            <line
              x1="160" y1="30" x2="290" y2="270"
              stroke={selected === "CP" ? "#3b82f6" : "currentColor"}
              strokeWidth={selected === "CP" ? 4 : 2}
              opacity={selected === "CP" ? 1 : 0.5}
            />
            <rect x="210" y="120" width="36" height="22" rx="4" fill={selected === "CP" ? "#3b82f6" : "transparent"} fillOpacity={0.2} stroke={selected === "CP" ? "#3b82f6" : "currentColor"} strokeWidth="1" opacity={selected === "CP" ? 1 : 0.5} />
            <text x="228" y="136" fill={selected === "CP" ? "#3b82f6" : "currentColor"} fontSize="12" fontWeight="bold" textAnchor="middle">CP</text>
          </g>

          {/* AP edge (A to P) */}
          <g className="cursor-pointer" onClick={() => setSelected(selected === "AP" ? null : "AP")}>
            <line
              x1="30" y1="270" x2="290" y2="270"
              stroke={selected === "AP" ? "#22c55e" : "currentColor"}
              strokeWidth={selected === "AP" ? 4 : 2}
              opacity={selected === "AP" ? 1 : 0.5}
            />
            <rect x="142" y="278" width="36" height="22" rx="4" fill={selected === "AP" ? "#22c55e" : "transparent"} fillOpacity={0.2} stroke={selected === "AP" ? "#22c55e" : "currentColor"} strokeWidth="1" opacity={selected === "AP" ? 1 : 0.5} />
            <text x="160" y="294" fill={selected === "AP" ? "#22c55e" : "currentColor"} fontSize="12" fontWeight="bold" textAnchor="middle">AP</text>
          </g>

          {/* CA edge (C to A) */}
          <g className="cursor-pointer" onClick={() => setSelected(selected === "CA" ? null : "CA")}>
            <line
              x1="160" y1="30" x2="30" y2="270"
              stroke={selected === "CA" ? "#eab308" : "currentColor"}
              strokeWidth={selected === "CA" ? 4 : 2}
              opacity={selected === "CA" ? 1 : 0.5}
            />
            <rect x="66" y="120" width="36" height="22" rx="4" fill={selected === "CA" ? "#eab308" : "transparent"} fillOpacity={0.2} stroke={selected === "CA" ? "#eab308" : "currentColor"} strokeWidth="1" opacity={selected === "CA" ? 1 : 0.5} />
            <text x="84" y="136" fill={selected === "CA" ? "#eab308" : "currentColor"} fontSize="12" fontWeight="bold" textAnchor="middle">CA</text>
          </g>

          {/* Vertices */}
          <circle cx="160" cy="30" r="8" fill={selected === "CP" || selected === "CA" ? (selected === "CP" ? "#3b82f6" : "#eab308") : "currentColor"} opacity={0.8} />
          <text x="160" y="18" textAnchor="middle" fill="currentColor" fontSize="13" fontWeight="bold">Consistency</text>

          <circle cx="30" cy="270" r="8" fill={selected === "AP" || selected === "CA" ? (selected === "AP" ? "#22c55e" : "#eab308") : "currentColor"} opacity={0.8} />
          <text x="30" y="260" textAnchor="start" fill="currentColor" fontSize="13" fontWeight="bold">Availability</text>

          <circle cx="290" cy="270" r="8" fill={selected === "CP" || selected === "AP" ? (selected === "CP" ? "#3b82f6" : "#22c55e") : "currentColor"} opacity={0.8} />
          <text x="290" y="260" textAnchor="end" fill="currentColor" fontSize="13" fontWeight="bold">Partition Tolerance</text>

          {/* Strikethrough on CA to indicate it is theoretical */}
          {selected !== "CA" && (
            <text x="84" y="152" fill="#ef4444" fontSize="9" textAnchor="middle" opacity={0.7}>theoretical</text>
          )}
        </svg>
      </div>

      {selected ? (
        <div
          className="rounded-lg border p-4 space-y-3 transition-all"
          style={{
            borderColor: `${combos[selected].color}30`,
            backgroundColor: `${combos[selected].color}08`,
          }}
        >
          <h4 className="font-semibold text-sm" style={{ color: combos[selected].color }}>
            {combos[selected].title}
          </h4>
          <p className="text-xs text-muted-foreground">{combos[selected].desc}</p>

          <div className="space-y-1.5">
            <p className="text-xs font-medium text-foreground">Real databases:</p>
            {combos[selected].databases.map((db) => (
              <div key={db.name} className="flex items-start gap-2 text-xs">
                <span className="font-mono font-medium text-foreground min-w-[100px]">{db.name}</span>
                <span className="text-muted-foreground">{db.detail}</span>
              </div>
            ))}
          </div>

          <div className="rounded-md bg-muted/30 p-2">
            <p className="text-[11px]"><strong>Best for:</strong> <span className="text-muted-foreground">{combos[selected].useCase}</span></p>
          </div>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground text-center">Click CP, AP, or CA on the triangle to explore each trade-off and see real database examples.</p>
      )}
    </div>
  );
}

// ─── PACELC Quick Reference ─────────────────────────────────────────────────

function PACELCCards() {
  const [active, setActive] = useState<string | null>(null);

  const databases = [
    { name: "DynamoDB", pacelc: "PA/EL", partition: "Available", normal: "Low latency", color: "text-green-400", borderColor: "border-green-500/30", desc: "Always responds, fast reads. Eventual consistency by default." },
    { name: "Cassandra", pacelc: "PA/EL", partition: "Available", normal: "Low latency", color: "text-green-400", borderColor: "border-green-500/30", desc: "Tunable consistency. Default favors availability and speed." },
    { name: "MongoDB", pacelc: "PC/EC", partition: "Consistent", normal: "Consistent", color: "text-blue-400", borderColor: "border-blue-500/30", desc: "Blocks writes during primary election. Strong consistency." },
    { name: "Spanner", pacelc: "PC/EC", partition: "Consistent", normal: "Consistent", color: "text-blue-400", borderColor: "border-blue-500/30", desc: "TrueTime consensus. 10-20ms commits for external consistency." },
    { name: "CockroachDB", pacelc: "PC/EC", partition: "Consistent", normal: "Consistent", color: "text-blue-400", borderColor: "border-blue-500/30", desc: "Raft consensus. Will not serve stale reads." },
    { name: "Cosmos DB", pacelc: "Tunable", partition: "Tunable", normal: "Tunable", color: "text-purple-400", borderColor: "border-purple-500/30", desc: "Five consistency levels. You choose the trade-off per request." },
  ];

  return (
    <div className="rounded-xl border border-border/50 bg-muted/5 p-6 space-y-4">
      <div>
        <h3 className="text-lg font-semibold">PACELC: What CAP Misses</h3>
        <p className="text-sm text-muted-foreground mt-1">
          CAP only describes partition behavior. PACELC adds normal operation:
          <em> &quot;If Partition, choose A or C. Else, choose L(atency) or C(onsistency).&quot;</em>
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {databases.map((db) => (
          <button
            key={db.name}
            onClick={() => setActive(active === db.name ? null : db.name)}
            className={cn(
              "p-3 rounded-lg border text-left transition-all",
              active === db.name
                ? `${db.borderColor} bg-muted/30 ring-1 ring-offset-0`
                : "border-border/50 bg-muted/10 hover:bg-muted/30"
            )}
          >
            <p className="text-xs font-semibold">{db.name}</p>
            <p className={cn("text-sm font-mono font-bold mt-0.5", db.color)}>{db.pacelc}</p>
          </button>
        ))}
      </div>

      {active && (() => {
        const db = databases.find((d) => d.name === active)!;
        return (
          <div className={cn("rounded-lg border p-4 space-y-2", db.borderColor, "bg-muted/10")}>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-sm">{db.name}</h4>
              <span className={cn("text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-muted/50", db.color)}>{db.pacelc}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><span className="text-muted-foreground">During partition: </span><span className="font-medium">{db.partition}</span></div>
              <div><span className="text-muted-foreground">Normal operation: </span><span className="font-medium">{db.normal}</span></div>
            </div>
            <p className="text-xs text-muted-foreground">{db.desc}</p>
          </div>
        );
      })()}

      <ConversationalCallout type="tip">
        The E/L vs E/C choice matters more than P/A vs P/C in practice. Most systems never experience
        a true network partition, but every single request pays the latency-vs-consistency cost.
        DynamoDB is fast because it chose EL. Spanner is correct because it chose EC.
      </ConversationalCallout>
    </div>
  );
}

// ─── Real-World Scenarios ───────────────────────────────────────────────────

function ScenarioPicker() {
  const [active, setActive] = useState(0);

  const scenarios = [
    { system: "Banking Transfers", choice: "CP" as const, db: "CockroachDB / Spanner", reason: "Double-spending is unacceptable. Better to reject a transaction than process it with a stale balance." },
    { system: "Social Media Feed", choice: "AP" as const, db: "DynamoDB / Cassandra", reason: "Showing a post 2 seconds late is fine. A feed that goes down during peak hours is not." },
    { system: "Inventory System", choice: "CP" as const, db: "MongoDB / CockroachDB", reason: "Overselling physical goods costs real money. Block the sale rather than sell what you do not have." },
    { system: "User Analytics", choice: "AP" as const, db: "Cassandra / DynamoDB", reason: "Approximate page view counts are acceptable. Analytics dashboards should never go down." },
    { system: "Ride-Sharing", choice: "AP" as const, db: "Cassandra / Redis", reason: "Users must always see available drivers. Stale location data (seconds old) beats no data." },
  ];

  const s = scenarios[active];

  return (
    <div className="rounded-xl border border-border/50 bg-muted/5 p-6 space-y-4">
      <h3 className="text-lg font-semibold">Which guarantee for which system?</h3>
      <div className="flex flex-wrap gap-1.5">
        {scenarios.map((sc, i) => (
          <button
            key={sc.system}
            onClick={() => setActive(i)}
            className={cn(
              "text-xs px-3 py-1.5 rounded-full border transition-all",
              i === active
                ? sc.choice === "CP"
                  ? "bg-blue-500/10 border-blue-500/30 text-blue-400 font-medium"
                  : "bg-green-500/10 border-green-500/30 text-green-400 font-medium"
                : "bg-muted/20 border-border/50 text-muted-foreground hover:bg-muted/40"
            )}
          >
            {sc.system}
          </button>
        ))}
      </div>
      <div className="rounded-lg border p-4 space-y-2">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-semibold">{s.system}</h4>
          <span className={cn(
            "text-[10px] font-mono font-bold px-2 py-0.5 rounded-full",
            s.choice === "CP" ? "bg-blue-500/20 text-blue-400" : "bg-green-500/20 text-green-400"
          )}>
            {s.choice}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{s.reason}</p>
        <p className="text-xs text-muted-foreground"><strong>Database:</strong> {s.db}</p>
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function CapTheoremPage() {
  return (
    <div className="space-y-8">
      <TopicHero
        title="CAP Theorem"
        subtitle="When the network splits, your distributed system must make an impossible choice: stay consistent or stay available. You cannot have both. Explore this constraint hands-on."
        difficulty="advanced"
      />

      {/* Core explanation */}
      <div className="rounded-xl border border-border/50 bg-muted/5 p-6 space-y-4">
        <h3 className="text-lg font-semibold">The impossible triangle</h3>
        <p className="text-sm text-muted-foreground">
          The <strong className="text-foreground">CAP theorem</strong> (Brewer 2000, proved by Gilbert
          and Lynch 2002) states a distributed data store can guarantee at most two of three properties:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3 space-y-1">
            <h4 className="text-sm font-semibold text-blue-400">C — Consistency</h4>
            <p className="text-xs text-muted-foreground">Every read returns the most recent write or an error. All nodes see the same data at the same time.</p>
          </div>
          <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-3 space-y-1">
            <h4 className="text-sm font-semibold text-green-400">A — Availability</h4>
            <p className="text-xs text-muted-foreground">Every request gets a non-error response, without guaranteeing it contains the most recent write.</p>
          </div>
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 space-y-1">
            <h4 className="text-sm font-semibold text-amber-400">P — Partition Tolerance</h4>
            <p className="text-xs text-muted-foreground">The system operates despite arbitrary message loss between nodes. Not optional in distributed systems.</p>
          </div>
        </div>
        <ConversationalCallout type="warning">
          Since network partitions are inevitable (cables get cut, switches fail, regions lose connectivity),
          partition tolerance is not optional. The real choice is always <strong>CP vs AP</strong>.
        </ConversationalCallout>
      </div>

      {/* Main interactive simulation */}
      <PartitionPlayground />

      {/* CAP Triangle Explorer */}
      <CAPTriangleExplorer />

      <AhaMoment
        question="Can a system be both CP and AP at the same time?"
        answer={
          <p>
            Not during a partition — that is the theorem&apos;s point. But many systems are
            <strong> tunable per operation</strong>. Cassandra lets you use
            <code className="font-mono bg-muted px-1 rounded text-xs"> QUORUM</code> for strong
            consistency on payments (CP behavior) and
            <code className="font-mono bg-muted px-1 rounded text-xs"> ONE</code> for fast reads
            on activity feeds (AP behavior). The trade-off is per-operation, not per-system. The
            best architectures use different consistency models for different data.
          </p>
        }
      />

      {/* PACELC */}
      <PACELCCards />

      {/* Scenario picker */}
      <ScenarioPicker />

      <AhaMoment
        question="Why does PACELC matter more than CAP in practice?"
        answer={
          <p>
            Partitions are rare — your system runs normally 99.99% of the time. PACELC covers that:
            &quot;Else, choose Latency or Consistency.&quot; Every single request pays the
            latency-vs-consistency cost. DynamoDB is fast (PA/EL) because it chose low latency
            always. Spanner is correct (PC/EC) but pays 10-20ms per commit for TrueTime. PACELC
            explains real-world database behavior far better than CAP alone.
          </p>
        }
      />

      <KeyTakeaway
        points={[
          "CAP theorem: during a network partition, choose consistency (correct data or error) or availability (always respond, possibly stale).",
          "Partition tolerance is not optional — the real choice is CP vs AP.",
          "CP systems (MongoDB, CockroachDB, Spanner) sacrifice availability for correctness. Use for payments, inventory, anything with hard constraints.",
          "AP systems (DynamoDB, Cassandra) sacrifice consistency for uptime. Use for social feeds, analytics, data that tolerates staleness.",
          "PACELC extends CAP to normal operation: even without partitions, you choose between latency and consistency.",
          "The best system designs use different consistency models for different data within the same application.",
          "In interviews, explain the trade-off per component, not per system. Show you understand the nuance.",
        ]}
      />
    </div>
  );
}
