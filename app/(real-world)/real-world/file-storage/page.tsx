"use client";

import { useState, useRef, useEffect, useMemo } from "react";
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

/* ------------------------------------------------------------------ */
/*  Static class maps (no dynamic Tailwind interpolation)             */
/* ------------------------------------------------------------------ */

const chunkStatusClasses: Record<string, string> = {
  idle: "bg-muted/10 border-border/20 text-muted-foreground/30",
  uploading: "bg-blue-500/15 border-blue-500/30 text-blue-400 ring-1 ring-blue-500/20 animate-pulse",
  done: "bg-emerald-500/15 border-emerald-500/30 text-emerald-400",
  failed: "bg-red-500/15 border-red-500/30 text-red-400",
  retrying: "bg-amber-500/15 border-amber-500/30 text-amber-400 animate-pulse",
};

const deviceStatusClasses: Record<string, string> = {
  idle: "bg-muted/20 border-border/30",
  editing: "bg-blue-500/10 border-blue-500/30",
  syncing: "bg-amber-500/10 border-amber-500/30",
  synced: "bg-emerald-500/10 border-emerald-500/30",
  conflict: "bg-red-500/10 border-red-500/30",
};

const tierClasses: Record<string, string> = {
  hot: "bg-red-500/10 border-red-500/20 text-red-400",
  warm: "bg-amber-500/10 border-amber-500/20 text-amber-400",
  cold: "bg-blue-500/10 border-blue-500/20 text-blue-400",
  archive: "bg-slate-500/10 border-slate-500/20 text-slate-400",
};

/* ------------------------------------------------------------------ */
/*  1. Chunked Upload Playground                                      */
/* ------------------------------------------------------------------ */

const TOTAL_CHUNKS = 12;
const FAIL_CHUNK = 4;

type ChunkState = "idle" | "uploading" | "done" | "failed" | "retrying";

function getChunkStates(tick: number, parallel: boolean): ChunkState[] {
  const states: ChunkState[] = Array(TOTAL_CHUNKS).fill("idle");
  if (tick === 0) return states;

  if (parallel) {
    const batchSize = 4;
    const batchIndex = Math.floor((tick - 1) / 2);
    for (let i = 0; i < TOTAL_CHUNKS; i++) {
      const myBatch = Math.floor(i / batchSize);
      if (myBatch < batchIndex) {
        states[i] = "done";
      } else if (myBatch === batchIndex) {
        if (tick % 2 === 1) {
          states[i] = "uploading";
        } else {
          if (i === FAIL_CHUNK && batchIndex === 1 && tick <= 6) {
            states[i] = "failed";
          } else {
            states[i] = "done";
          }
        }
      }
    }
    if (tick >= 5 && tick <= 6 && states[FAIL_CHUNK] === "failed") {
      states[FAIL_CHUNK] = "retrying";
    }
    if (tick > 6) {
      states[FAIL_CHUNK] = "done";
    }
  } else {
    for (let i = 0; i < TOTAL_CHUNKS; i++) {
      const chunkTick = i + 1;
      if (i === FAIL_CHUNK) {
        if (tick >= chunkTick + 2) states[i] = "done";
        else if (tick === chunkTick + 1) states[i] = "retrying";
        else if (tick === chunkTick) states[i] = "failed";
        else if (tick > chunkTick) states[i] = "done";
      } else {
        const offset = i > FAIL_CHUNK ? 2 : 0;
        if (tick > chunkTick + offset) states[i] = "done";
        else if (tick === chunkTick + offset) states[i] = "uploading";
      }
    }
  }
  return states;
}

function ChunkedUploadPlayground() {
  const [parallel, setParallel] = useState(false);
  const maxSteps = parallel ? 8 : TOTAL_CHUNKS + 3;
  const sim = useSimulation({ intervalMs: 500, maxSteps });
  const states = getChunkStates(sim.tick, parallel);
  const doneCount = states.filter((s) => s === "done").length;
  const pct = Math.round((doneCount / TOTAL_CHUNKS) * 100);

  const speedData = useMemo(() => [
    { mode: "Sequential", time: 12, label: "Sequential" },
    { mode: "Parallel (4x)", time: 4, label: "Parallel (4x)" },
  ], []);

  return (
    <Playground
      title="Chunked Upload Simulator"
      simulation={sim}
      canvasHeight="min-h-[320px]"
      canvas={
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-muted-foreground">
              budget-report.xlsx (48MB = {TOTAL_CHUNKS} chunks x 4MB)
            </span>
            <span className="text-xs font-mono text-emerald-400">{pct}%</span>
          </div>

          <div className="grid grid-cols-6 gap-1.5">
            {states.map((status, i) => (
              <div
                key={i}
                className={cn(
                  "h-12 rounded-md border flex flex-col items-center justify-center text-[9px] font-mono transition-all duration-300",
                  chunkStatusClasses[status]
                )}
              >
                <span>#{i + 1}</span>
                <span className="text-[7px]">{status === "idle" ? "4MB" : status}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 text-[10px] font-mono">
            {(["done", "uploading", "failed", "retrying"] as const).map((s) => (
              <div key={s} className="flex items-center gap-1.5">
                <div className={cn("size-2.5 rounded-sm", {
                  "bg-emerald-500/40": s === "done",
                  "bg-blue-500/40": s === "uploading",
                  "bg-red-500/40": s === "failed",
                  "bg-amber-500/40": s === "retrying",
                })} />
                <span className="text-muted-foreground/60 capitalize">{s}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => { setParallel(false); sim.reset(); }}
              className={cn(
                "px-3 py-1 rounded-md text-xs font-medium transition-colors",
                !parallel ? "bg-violet-500/20 text-violet-400" : "bg-muted/20 text-muted-foreground hover:bg-muted/30"
              )}
            >
              Sequential
            </button>
            <button
              onClick={() => { setParallel(true); sim.reset(); }}
              className={cn(
                "px-3 py-1 rounded-md text-xs font-medium transition-colors",
                parallel ? "bg-violet-500/20 text-violet-400" : "bg-muted/20 text-muted-foreground hover:bg-muted/30"
              )}
            >
              Parallel (4 at a time)
            </button>
          </div>
        </div>
      }
      explanation={
        <div className="space-y-3">
          <p className="text-sm font-medium">How chunked uploads work</p>
          <p className="text-xs text-muted-foreground">
            Files are split into fixed-size chunks (typically 4MB). Each chunk uploads independently.
            If one fails, only that chunk retries -- not the whole file.
          </p>
          <p className="text-xs text-muted-foreground">
            Toggle <strong>parallel mode</strong> to see how uploading 4 chunks simultaneously
            cuts total time by ~75%.
          </p>
          <LiveChart
            type="bar"
            data={speedData}
            dataKeys={{ x: "mode", y: "time", label: "Upload Time" }}
            height={140}
            unit="s"
          />
        </div>
      }
    />
  );
}

/* ------------------------------------------------------------------ */
/*  2. Architecture Playground                                        */
/* ------------------------------------------------------------------ */

function ArchitecturePlayground() {
  const [flow, setFlow] = useState<"upload" | "download" | "dedup">("upload");
  const sim = useSimulation({ intervalMs: 1000, maxSteps: 5 });

  const baseNodes: FlowNode[] = useMemo(() => [
    { id: "client", type: "clientNode", position: { x: 20, y: 100 },
      data: { label: "Client", sublabel: "desktop / mobile", status: "healthy", handles: { right: true } } },
    { id: "api", type: "serverNode", position: { x: 220, y: 100 },
      data: { label: "API Server", sublabel: "auth + routing", status: "healthy", handles: { left: true, right: true, bottom: true } } },
    { id: "metadb", type: "databaseNode", position: { x: 420, y: 20 },
      data: { label: "Metadata DB", sublabel: "file tree, versions", status: "healthy", handles: { left: true } } },
    { id: "s3", type: "cacheNode", position: { x: 420, y: 180 },
      data: { label: "Object Storage (S3)", sublabel: "raw chunks", status: "healthy", handles: { left: true, right: true } } },
  ], []);

  const flowEdgeMap: Record<string, FlowEdge[]> = useMemo(() => ({
    upload: [
      { id: "e1", source: "client", target: "api", animated: sim.tick >= 1, label: "1. upload chunks" },
      { id: "e2", source: "api", target: "metadb", animated: sim.tick >= 2, label: "2. save metadata" },
      { id: "e3", source: "api", target: "s3", animated: sim.tick >= 3, label: "3. store in S3" },
    ],
    download: [
      { id: "e1", source: "client", target: "api", animated: sim.tick >= 1, label: "1. request file" },
      { id: "e2", source: "api", target: "metadb", animated: sim.tick >= 2, label: "2. get metadata" },
      { id: "e3", source: "api", target: "client", animated: sim.tick >= 3, label: "3. presigned URL" },
      { id: "e4", source: "s3", target: "client", animated: sim.tick >= 4, label: "4. direct download" },
    ],
    dedup: [
      { id: "e1", source: "client", target: "api", animated: sim.tick >= 1, label: "1. send chunk hashes" },
      { id: "e2", source: "api", target: "s3", animated: sim.tick >= 2, label: "2. check existence" },
      { id: "e3", source: "api", target: "client", animated: sim.tick >= 3, label: "3. skip duplicates" },
    ],
  }), [sim.tick]);

  const edges = flowEdgeMap[flow];
  const flowLabels: Record<string, string> = {
    upload: "Upload: chunks go to S3, metadata to DB.",
    download: "Download: presigned URL lets client fetch directly from S3.",
    dedup: "Dedup: server checks hashes, client skips existing chunks.",
  };

  return (
    <Playground
      title="File Storage Architecture"
      simulation={sim}
      canvasHeight="min-h-[300px]"
      canvas={<FlowDiagram nodes={baseNodes} edges={edges} fitView minHeight={280} />}
      explanation={
        <div className="space-y-3">
          <div className="flex flex-col gap-1.5">
            {(["upload", "download", "dedup"] as const).map((f) => (
              <button
                key={f}
                onClick={() => { setFlow(f); sim.reset(); }}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-medium text-left transition-colors",
                  flow === f ? "bg-violet-500/20 text-violet-400" : "bg-muted/20 text-muted-foreground hover:bg-muted/30"
                )}
              >
                {f === "upload" ? "Upload Flow" : f === "download" ? "Download Flow" : "Dedup Check"}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">{flowLabels[flow]}</p>
          <p className="text-[11px] text-muted-foreground/70">
            Press play to animate each step. The client never talks to S3 directly on upload --
            the API server controls access. On download, a presigned URL lets the client
            bypass the API for fast transfer.
          </p>
        </div>
      }
    />
  );
}

/* ------------------------------------------------------------------ */
/*  3. File Sync Engine                                               */
/* ------------------------------------------------------------------ */

type DeviceState = "idle" | "editing" | "syncing" | "synced" | "conflict";

function FileSyncPlayground() {
  const sim = useSimulation({ intervalMs: 800, maxSteps: 10 });
  const t = sim.tick;

  const deviceA: DeviceState = t === 0 ? "idle" : t <= 2 ? "editing" : t <= 4 ? "syncing" : t >= 8 ? "conflict" : "synced";
  const deviceB: DeviceState = t === 0 ? "idle" : t <= 3 ? "idle" : t <= 5 ? "editing" : t <= 7 ? "syncing" : t >= 8 ? "conflict" : "synced";
  const server: DeviceState = t <= 3 ? "idle" : t <= 4 ? "syncing" : t <= 7 ? "synced" : "conflict";

  const fileVersions: Record<string, string> = {
    deviceA: t === 0 ? "v1" : t <= 2 ? "editing..." : "v2a",
    server: t <= 3 ? "v1" : t <= 7 ? "v2a (from A)" : "CONFLICT",
    deviceB: t === 0 ? "v1" : t <= 5 ? "v1" : t <= 7 ? "v2b" : "v2b (conflicted)",
  };

  const syncLatency = useMemo(() => {
    const data = [];
    for (let i = 0; i <= Math.min(t, 10); i++) {
      const base = 50 + Math.sin(i * 0.8) * 20;
      const spike = i >= 8 ? 200 : 0;
      data.push({ step: `T${i}`, latency: Math.round(base + spike) });
    }
    return data;
  }, [t]);

  const devices = [
    { id: "deviceA", label: "Device A (Laptop)", state: deviceA, version: fileVersions.deviceA },
    { id: "server", label: "Sync Server", state: server, version: fileVersions.server },
    { id: "deviceB", label: "Device B (Phone)", state: deviceB, version: fileVersions.deviceB },
  ];

  return (
    <Playground
      title="File Sync Engine"
      simulation={sim}
      canvasHeight="min-h-[340px]"
      canvas={
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {devices.map((d) => (
              <div key={d.id} className={cn(
                "rounded-lg border p-3 text-center transition-all duration-300",
                deviceStatusClasses[d.state]
              )}>
                <p className="text-[10px] font-semibold mb-1">{d.label}</p>
                <p className="text-xs font-mono text-muted-foreground">{d.version}</p>
                <p className="text-[9px] text-muted-foreground/60 mt-1 capitalize">{d.state}</p>
              </div>
            ))}
          </div>

          <div className="space-y-1 px-1">
            {[
              { tick: 0, text: "Both devices have report.docx v1" },
              { tick: 1, text: "Device A starts editing offline" },
              { tick: 3, text: "Device A syncs v2a to server" },
              { tick: 5, text: "Device B edits same file offline -> v2b" },
              { tick: 7, text: "Device B tries to sync v2b" },
              { tick: 8, text: "CONFLICT: server has v2a, B has v2b" },
            ].map((event) => (
              <div key={event.tick} className={cn(
                "text-[10px] transition-all",
                t >= event.tick ? (event.tick === 8 ? "text-red-400 font-medium" : "text-muted-foreground") : "text-muted-foreground/20"
              )}>
                {event.text}
              </div>
            ))}
          </div>

          <LiveChart
            type="latency"
            data={syncLatency}
            dataKeys={{ x: "step", y: "latency" }}
            height={120}
            referenceLines={[{ y: 150, label: "Conflict spike", color: "#ef4444" }]}
          />
        </div>
      }
      explanation={
        <div className="space-y-3">
          <p className="text-sm font-medium">Sync conflict resolution</p>
          <p className="text-xs text-muted-foreground">
            When two devices edit the same file offline, a conflict is inevitable. Watch the
            simulation: Device A syncs first, then Device B tries to push a different version.
          </p>
          <div className="space-y-2 mt-2">
            {[
              { strategy: "Last-Write-Wins", risk: "Silent data loss", tag: "Risky" },
              { strategy: "Conflicted Copy (Dropbox)", risk: "User merges manually", tag: "Safe" },
              { strategy: "OT / CRDT (Google Docs)", risk: "Complex implementation", tag: "Advanced" },
            ].map((s) => (
              <div key={s.strategy} className="rounded-md border border-border/30 p-2">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-medium">{s.strategy}</span>
                  <span className="text-[9px] text-muted-foreground/60">{s.tag}</span>
                </div>
                <p className="text-[10px] text-muted-foreground/70">{s.risk}</p>
              </div>
            ))}
          </div>
        </div>
      }
    />
  );
}

/* ------------------------------------------------------------------ */
/*  4. Storage Optimization                                           */
/* ------------------------------------------------------------------ */

function StorageOptimizationPlayground() {
  const sim = useSimulation({ intervalMs: 700, maxSteps: 12 });
  const t = sim.tick;

  const files = useMemo(() => [
    { name: "photo.jpg", raw: 8, compressed: 6, hash: "a3f2", lastAccess: 1, tier: "hot" as const },
    { name: "report.pdf", raw: 4, compressed: 3, hash: "b7c1", lastAccess: 30, tier: "warm" as const },
    { name: "backup.zip", raw: 20, compressed: 18, hash: "c5e8", lastAccess: 180, tier: "cold" as const },
    { name: "photo_copy.jpg", raw: 8, compressed: 6, hash: "a3f2", lastAccess: 5, tier: "hot" as const, isDuplicate: true },
    { name: "old_logs.tar", raw: 50, compressed: 12, hash: "d1a4", lastAccess: 365, tier: "archive" as const },
    { name: "report_v2.pdf", raw: 4, compressed: 3, hash: "b7c1", lastAccess: 15, tier: "warm" as const, isDuplicate: true },
  ], []);

  const visibleFiles = files.slice(0, Math.min(files.length, Math.max(1, t)));
  const totalRaw = visibleFiles.reduce((s, f) => s + f.raw, 0);
  const totalCompressed = visibleFiles.reduce((s, f) => s + f.compressed, 0);
  const dedupSaved = visibleFiles.filter((f) => f.isDuplicate).reduce((s, f) => s + f.compressed, 0);
  const actualStored = totalCompressed - dedupSaved;

  const tierCosts: Record<string, number> = { hot: 0.023, warm: 0.0125, cold: 0.004, archive: 0.001 };

  return (
    <Playground
      title="Storage Optimization"
      simulation={sim}
      canvasHeight="min-h-[380px]"
      canvas={
        <div className="p-4 space-y-4">
          <div className="space-y-1.5">
            {visibleFiles.map((file, i) => (
              <div
                key={`${file.name}-${i}`}
                className={cn(
                  "flex items-center gap-2 rounded-md border px-3 py-2 text-[10px] font-mono transition-all duration-300",
                  file.isDuplicate ? "bg-amber-500/5 border-amber-500/20" : tierClasses[file.tier]
                )}
              >
                <span className="flex-1 truncate">{file.name}</span>
                <span className="text-muted-foreground/60">{file.raw}MB</span>
                <span className="text-muted-foreground/40">-&gt;</span>
                <span className="text-emerald-400">{file.compressed}MB</span>
                {file.isDuplicate && <span className="text-amber-400 text-[8px]">DEDUP</span>}
                <span className={cn("text-[8px] px-1.5 py-0.5 rounded capitalize", tierClasses[file.tier])}>
                  {file.tier}
                </span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg bg-muted/10 border border-border/20 p-2 text-center">
              <p className="text-[9px] text-muted-foreground/60">Raw Size</p>
              <p className="text-sm font-mono font-bold">{totalRaw} MB</p>
            </div>
            <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/10 p-2 text-center">
              <p className="text-[9px] text-muted-foreground/60">After Compression</p>
              <p className="text-sm font-mono font-bold text-emerald-400">{totalCompressed} MB</p>
            </div>
            <div className="rounded-lg bg-violet-500/5 border border-violet-500/10 p-2 text-center">
              <p className="text-[9px] text-muted-foreground/60">After Dedup</p>
              <p className="text-sm font-mono font-bold text-violet-400">{actualStored} MB</p>
            </div>
          </div>

          <LiveChart
            type="bar"
            data={[
              { label: "Raw", size: totalRaw },
              { label: "Compressed", size: totalCompressed },
              { label: "Deduped", size: actualStored },
            ]}
            dataKeys={{ x: "label", y: "size" }}
            height={110}
            unit="MB"
          />
        </div>
      }
      explanation={
        <div className="space-y-3">
          <p className="text-sm font-medium">Three layers of optimization</p>
          <div className="space-y-2">
            <div className="rounded-md border border-border/30 p-2">
              <p className="text-[11px] font-medium">1. Compression</p>
              <p className="text-[10px] text-muted-foreground">
                Logs compress ~75%, images ~20%. Reduces raw storage cost immediately.
              </p>
            </div>
            <div className="rounded-md border border-border/30 p-2">
              <p className="text-[11px] font-medium">2. Deduplication</p>
              <p className="text-[10px] text-muted-foreground">
                Identical chunks share a single storage reference. Dropbox saves 60%+ this way.
              </p>
            </div>
            <div className="rounded-md border border-border/30 p-2">
              <p className="text-[11px] font-medium">3. Cold Tiering</p>
              <p className="text-[10px] text-muted-foreground">
                Files not accessed in 90+ days auto-migrate to cold storage at $0.004/GB vs
                $0.023/GB for hot.
              </p>
            </div>
          </div>
          <div className="space-y-1 mt-2">
            <p className="text-[10px] font-medium text-muted-foreground">Storage tier costs (per GB/mo):</p>
            {Object.entries(tierCosts).map(([tier, cost]) => (
              <div key={tier} className="flex justify-between text-[10px]">
                <span className={cn("capitalize", tierClasses[tier])}>{tier}</span>
                <span className="font-mono text-muted-foreground">${cost}</span>
              </div>
            ))}
          </div>
        </div>
      }
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Main page                                                         */
/* ------------------------------------------------------------------ */

export default function FileStoragePage() {
  return (
    <div className="space-y-8">
      <TopicHero
        title="Design File Storage"
        subtitle="Your user uploads a 2GB video as a single HTTP request. The connection drops at 95%. They start over. Twice. Dropbox stores 2 exabytes -- let's learn how."
        difficulty="advanced"
      />

      {/* Intro context */}
      <ConversationalCallout type="question">
        What happens when a 2GB upload fails at 95%? With a naive single-POST design, the user
        restarts from zero. Meanwhile, 500 users upload the same popular video, wasting 1TB of
        duplicate storage. How do systems like Dropbox handle this?
      </ConversationalCallout>

      {/* 1. Chunked Upload */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">Chunked Uploads</h2>
        <p className="text-sm text-muted-foreground">
          Break every file into fixed-size chunks (Dropbox uses 4MB blocks). Upload each chunk
          independently with its SHA-256 hash. If a chunk fails, retry just that chunk. Toggle
          between sequential and parallel to see the speed difference.
        </p>
        <ChunkedUploadPlayground />
      </section>

      <BeforeAfter
        before={{
          title: "Monolithic upload",
          content: (
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>Single POST for entire file</p>
              <p>Any interruption = full restart</p>
              <p className="font-mono text-red-400">2GB upload, 27 min on 10Mbps</p>
            </div>
          ),
        }}
        after={{
          title: "Chunked upload",
          content: (
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>512 x 4MB independent chunks</p>
              <p>Retry only failed chunks</p>
              <p className="font-mono text-emerald-400">Parallel upload, ~7 min</p>
            </div>
          ),
        }}
      />

      {/* 2. Architecture */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">System Architecture</h2>
        <p className="text-sm text-muted-foreground">
          Dropbox separates metadata (file tree, permissions) from block storage (raw bytes).
          The API server handles auth and routing. Object storage holds chunks. On download,
          a presigned URL lets the client fetch directly from S3.
        </p>
        <ArchitecturePlayground />
      </section>

      <AhaMoment
        question="Why chunk on the client instead of the server?"
        answer={
          <p>
            If the client chunks and hashes locally, it can tell the server which chunks it has
            <em> before uploading</em>. Chunks that already exist (from dedup or a previous partial
            upload) are skipped entirely -- zero bytes transferred. Dropbox&apos;s desktop client
            does all chunking and hashing locally, sending only chunk hashes first, then uploading
            only the missing chunks.
          </p>
        }
      />

      {/* 3. Sync Engine */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">File Sync Engine</h2>
        <p className="text-sm text-muted-foreground">
          Real-time sync across devices is the hardest part. When two devices edit the same
          file offline and reconnect, you have a conflict. Watch the simulation to see how
          conflicts arise and how different strategies resolve them.
        </p>
        <FileSyncPlayground />
      </section>

      <ConversationalCallout type="warning">
        Notification latency matters enormously for sync. When you save a file on your laptop,
        you expect it on your phone within seconds. Dropbox uses long-polling: each client holds
        an open connection to the server, which pushes change events instantly. The client then
        fetches only the changed blocks.
      </ConversationalCallout>

      {/* 4. Storage Optimization */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">Storage Optimization</h2>
        <p className="text-sm text-muted-foreground">
          Three techniques compound to dramatically reduce storage costs: compression,
          content-addressable deduplication, and automatic cold-storage tiering.
        </p>
        <StorageOptimizationPlayground />
      </section>

      <ConversationalCallout type="tip">
        Variable-size chunking (content-defined chunking using Rabin fingerprints) is better than
        fixed-size for dedup. If you insert a byte at the start of a file, fixed-size chunking
        shifts every chunk boundary and invalidates all hashes. Content-defined chunking sets
        boundaries based on content patterns, so only the changed chunk is affected.
      </ConversationalCallout>

      <AhaMoment
        question="How does Dropbox store 2 exabytes affordably?"
        answer={
          <p>
            Three compounding optimizations: (1) content-addressable dedup stores each unique
            chunk only once, saving 60%+ of raw storage; (2) compression squeezes another
            20-75% depending on file type; (3) cold tiering moves files not accessed in 90 days
            to storage that costs 6x less. The result: the effective per-user storage cost is
            a fraction of the raw bytes uploaded.
          </p>
        }
      />

      <KeyTakeaway
        points={[
          "Chunked uploads (4MB blocks) enable resumable transfers -- retry individual chunks, not the whole file.",
          "Parallel chunk upload cuts transfer time dramatically compared to sequential.",
          "Content-addressable storage (SHA-256 hash) enables automatic deduplication, saving 60%+ of raw storage.",
          "Client-side chunking lets you skip already-stored chunks before uploading -- zero bandwidth for duplicates.",
          "Sync conflicts require explicit strategy: Dropbox uses conflicted copies, Google Docs uses OT/CRDTs.",
          "Cold storage tiering automatically moves old files to cheaper storage tiers.",
          "Separate metadata (file tree, permissions) from block storage (raw bytes) -- they scale differently.",
        ]}
      />
    </div>
  );
}
