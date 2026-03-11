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
import { MetricCounter } from "@/components/metric-counter";
import { AhaMoment } from "@/components/aha-moment";
import { ConversationalCallout } from "@/components/conversational-callout";
import { BeforeAfter } from "@/components/before-after";
import { InteractiveDemo } from "@/components/interactive-demo";
import { ScaleSimulator } from "@/components/scale-simulator";
import { cn } from "@/lib/utils";
import { Upload, CheckCircle2, Hash, HardDrive, RefreshCw, AlertTriangle, FileText, Layers, ArrowRight, Copy, Wifi } from "lucide-react";

function ChunkedUploadViz() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((s) => (s + 1) % 25), 300);
    return () => clearInterval(t);
  }, []);

  const totalChunks = 16;
  const failedChunk = 7;
  const retryStart = 18;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-[10px] text-muted-foreground/60 font-mono">
        <span>budget-report.xlsx (64MB = 16 chunks x 4MB)</span>
        <span>{Math.min(100, Math.round((Math.min(tick, totalChunks + 3) / (totalChunks + 3)) * 100))}%</span>
      </div>

      <div className="grid grid-cols-8 gap-1.5">
        {Array.from({ length: totalChunks }).map((_, i) => {
          const isUploading = tick === i + 1;
          const isUploaded = tick > i + 1 && i !== failedChunk;
          const isFailed = i === failedChunk && tick >= failedChunk + 1 && tick < retryStart;
          const isRetrying = i === failedChunk && tick === retryStart;
          const isRetryDone = i === failedChunk && tick > retryStart;

          return (
            <div
              key={i}
              className={cn(
                "h-10 rounded-md border flex items-center justify-center text-[9px] font-mono transition-all duration-300",
                isRetryDone ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400" :
                isRetrying ? "bg-blue-500/15 border-blue-500/30 text-blue-400 ring-1 ring-blue-500/20 animate-pulse" :
                isFailed ? "bg-red-500/15 border-red-500/30 text-red-400" :
                isUploaded ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400" :
                isUploading ? "bg-blue-500/15 border-blue-500/30 text-blue-400 ring-1 ring-blue-500/20" :
                "bg-muted/10 border-border/20 text-muted-foreground/30"
              )}
            >
              {isRetryDone || isUploaded ? <CheckCircle2 className="size-3" /> :
               isFailed ? <AlertTriangle className="size-3" /> :
               isRetrying ? <RefreshCw className="size-3 animate-spin" /> :
               isUploading ? <Upload className="size-3 animate-bounce" /> :
               `#${i + 1}`}
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-4 text-[10px] font-mono">
        <div className="flex items-center gap-1.5">
          <div className="size-2.5 rounded-sm bg-emerald-500/40" />
          <span className="text-muted-foreground/60">Uploaded</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="size-2.5 rounded-sm bg-blue-500/40" />
          <span className="text-muted-foreground/60">Uploading</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="size-2.5 rounded-sm bg-red-500/40" />
          <span className="text-muted-foreground/60">Failed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="size-2.5 rounded-sm bg-blue-500/40 animate-pulse" />
          <span className="text-muted-foreground/60">Retrying</span>
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground/60">
        {tick < failedChunk + 1 ? "Uploading chunks sequentially..." :
         tick < retryStart ? `Chunk #${failedChunk + 1} failed due to network error. Only this chunk needs retry — 15 chunks preserved.` :
         tick === retryStart ? `Retrying chunk #${failedChunk + 1}...` :
         "All chunks uploaded. Without chunking, the entire 64MB upload would restart from zero."}
      </p>
    </div>
  );
}

function DeduplicationViz() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % 8), 1200);
    return () => clearInterval(t);
  }, []);

  const chunks = [
    { hash: "a3f2...", data: "Chunk A", users: ["Alice", "Bob", "Charlie"] },
    { hash: "7b91...", data: "Chunk B", users: ["Alice"] },
    { hash: "c5e8...", data: "Chunk C", users: ["Alice", "Bob"] },
    { hash: "a3f2...", data: "Chunk A", users: ["Bob"], isDuplicate: true },
    { hash: "d1a4...", data: "Chunk D", users: ["Charlie"] },
    { hash: "c5e8...", data: "Chunk C", users: ["Charlie"], isDuplicate: true },
  ];

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        {chunks.map((chunk, i) => {
          const isActive = step >= i;
          return (
            <div key={`${chunk.hash}-${i}`} className={cn(
              "flex items-center gap-3 rounded-lg border px-3 py-2 transition-all duration-500",
              !isActive ? "bg-muted/10 border-border/20" :
              chunk.isDuplicate
                ? "bg-amber-500/10 border-amber-500/20"
                : "bg-emerald-500/10 border-emerald-500/20"
            )}>
              <Hash className={cn("size-3.5", chunk.isDuplicate ? "text-amber-400" : "text-emerald-400")} />
              <span className="text-[10px] font-mono w-16 text-muted-foreground">{chunk.hash}</span>
              <span className="text-[10px] font-medium flex-1">{chunk.data}</span>
              <div className="flex gap-1">
                {chunk.users.map((u) => (
                  <span key={u} className="text-[8px] bg-muted/40 rounded px-1 py-0.5">{u}</span>
                ))}
              </div>
              <span className={cn(
                "text-[9px] font-mono",
                chunk.isDuplicate ? "text-amber-400" : "text-emerald-400"
              )}>
                {isActive ? (chunk.isDuplicate ? "SKIP (exists)" : "STORE (new)") : "—"}
              </span>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-red-500/5 border border-red-500/10 p-2.5 text-center">
          <p className="text-[10px] text-muted-foreground/60">Without Dedup</p>
          <p className="text-sm font-mono font-bold text-red-400">6 chunks stored</p>
          <p className="text-[10px] text-muted-foreground/50">24 MB</p>
        </div>
        <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/10 p-2.5 text-center">
          <p className="text-[10px] text-muted-foreground/60">With Dedup</p>
          <p className="text-sm font-mono font-bold text-emerald-400">4 chunks stored</p>
          <p className="text-[10px] text-muted-foreground/50">16 MB (33% saved)</p>
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground/60">
        Dropbox reported that content-addressable dedup saved them over 60% of raw storage. The same
        presentation shared across an organization is stored once, referenced by thousands of users.
      </p>
    </div>
  );
}

function SyncConflictViz() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % 10), 1200);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2 text-center">
          <div className={cn(
            "rounded-lg border p-3 transition-all",
            step >= 1 && step <= 3 ? "bg-blue-500/10 border-blue-500/30" : "bg-muted/20 border-border/30"
          )}>
            <FileText className="size-5 mx-auto text-blue-400 mb-1" />
            <p className="text-[10px] font-semibold">Laptop</p>
            <p className="text-[9px] text-muted-foreground">
              {step < 2 ? "report.docx v1" :
               step < 5 ? "Editing... (offline)" :
               "report.docx v2a"}
            </p>
          </div>
        </div>

        <div className="space-y-2 text-center">
          <div className={cn(
            "rounded-lg border p-3 transition-all",
            step >= 5 ? "bg-amber-500/10 border-amber-500/30" : "bg-muted/20 border-border/30"
          )}>
            <HardDrive className="size-5 mx-auto text-muted-foreground/60 mb-1" />
            <p className="text-[10px] font-semibold">Server</p>
            <p className="text-[9px] text-muted-foreground">
              {step < 4 ? "report.docx v1" :
               step < 6 ? "report.docx v2b (phone sync)" :
               step < 8 ? "CONFLICT DETECTED" :
               "v2a + v2b (conflicted copy)"}
            </p>
          </div>
          {step >= 6 && step < 8 && (
            <AlertTriangle className="size-4 mx-auto text-amber-400 animate-pulse" />
          )}
        </div>

        <div className="space-y-2 text-center">
          <div className={cn(
            "rounded-lg border p-3 transition-all",
            step >= 2 && step <= 4 ? "bg-emerald-500/10 border-emerald-500/30" : "bg-muted/20 border-border/30"
          )}>
            <FileText className="size-5 mx-auto text-emerald-400 mb-1" />
            <p className="text-[10px] font-semibold">Phone</p>
            <p className="text-[9px] text-muted-foreground">
              {step < 3 ? "report.docx v1" :
               step < 5 ? "Editing... (offline)" :
               "report.docx v2b"}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-1 px-2">
        {[
          { t: 0, label: "Both devices have report.docx v1", active: step >= 0 },
          { t: 1, label: "Both devices go offline", active: step >= 1 },
          { t: 2, label: "Laptop edits → v2a, Phone edits → v2b", active: step >= 2 },
          { t: 3, label: "Phone comes online first, syncs v2b", active: step >= 4 },
          { t: 4, label: "Laptop comes online, tries to sync v2a", active: step >= 5 },
          { t: 5, label: "CONFLICT: server has v2b, laptop has v2a", active: step >= 6, conflict: true },
          { t: 6, label: "Dropbox creates 'conflicted copy' for user to resolve", active: step >= 8 },
        ].map((event) => (
          <div key={event.t} className={cn(
            "flex items-center gap-2 text-[10px] transition-all duration-300",
            event.active
              ? event.conflict ? "text-amber-400" : "text-muted-foreground"
              : "text-muted-foreground/20"
          )}>
            <span className="font-mono w-4 text-right">{event.t + 1}.</span>
            <span>{event.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BlockSyncViz() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % 12), 800);
    return () => clearInterval(t);
  }, []);

  const blocks = [
    { id: 1, changed: false },
    { id: 2, changed: true },
    { id: 3, changed: false },
    { id: 4, changed: true },
    { id: 5, changed: false },
    { id: 6, changed: false },
    { id: 7, changed: true },
    { id: 8, changed: false },
  ];

  const changedCount = blocks.filter((b) => b.changed).length;
  const totalSize = blocks.length * 4;
  const syncSize = changedCount * 4;

  return (
    <div className="space-y-4">
      <p className="text-[11px] text-muted-foreground/60">
        File: presentation.pptx (32MB = 8 blocks x 4MB). You edited 3 slides.
      </p>
      <div className="grid grid-cols-8 gap-1.5">
        {blocks.map((block) => {
          const isSyncing = block.changed && step >= 3 && step < 8;
          const isSynced = block.changed && step >= 8;
          const isUnchanged = !block.changed;

          return (
            <div
              key={block.id}
              className={cn(
                "h-12 rounded-md border flex flex-col items-center justify-center text-[8px] font-mono transition-all duration-300",
                isSynced ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400" :
                isSyncing ? "bg-blue-500/15 border-blue-500/30 text-blue-400 animate-pulse" :
                block.changed && step >= 1 ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
                "bg-muted/10 border-border/20 text-muted-foreground/30"
              )}
            >
              <span>B{block.id}</span>
              <span className="text-[7px]">
                {isSynced ? "synced" :
                 isSyncing ? "sync..." :
                 block.changed && step >= 1 ? "changed" :
                 "4MB"}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 h-2 bg-muted/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500/60 rounded-full transition-all duration-500"
            style={{ width: step >= 8 ? "100%" : step >= 3 ? `${((step - 3) / 5) * 100}%` : "0%" }}
          />
        </div>
        <span className="text-[10px] font-mono text-muted-foreground">
          {step >= 8 ? `Done: ${syncSize}MB synced` : step >= 3 ? "Syncing changed blocks..." : step >= 1 ? "Detecting changes..." : "Idle"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-red-500/5 border border-red-500/10 p-2.5 text-center">
          <p className="text-[10px] text-muted-foreground/60">Naive Sync</p>
          <p className="text-sm font-mono font-bold text-red-400">{totalSize} MB</p>
          <p className="text-[10px] text-muted-foreground/50">Re-upload entire file</p>
        </div>
        <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/10 p-2.5 text-center">
          <p className="text-[10px] text-muted-foreground/60">Block-Level Sync</p>
          <p className="text-sm font-mono font-bold text-emerald-400">{syncSize} MB</p>
          <p className="text-[10px] text-muted-foreground/50">{Math.round((1 - syncSize / totalSize) * 100)}% bandwidth saved</p>
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground/60">
        Dropbox reported that block-level sync reduces data transfer by up to 2,500x for typical
        document edits. Only the changed 4MB blocks are uploaded — the other {totalSize - syncSize}MB stays untouched.
      </p>
    </div>
  );
}

export default function FileStoragePage() {
  return (
    <div className="space-y-8">
      <TopicHero
        title="Design File Storage"
        subtitle="Your user uploads a 2GB video as a single HTTP request. The connection drops at 95%. They start over. Twice. Dropbox stores 2 exabytes — let's learn how."
        difficulty="advanced"
      />

      <FailureScenario title="A 2GB upload fails at 95% — user rage-quits">
        <p className="text-sm text-muted-foreground">
          You build a file storage service that accepts whole-file uploads via a single POST request.
          A user on a flaky mobile connection uploads a 2GB file. At 1.9GB, the connection drops.
          The entire upload is lost — zero progress preserved. Meanwhile, 500 users upload the same
          popular video file, consuming <strong>1TB of duplicate storage</strong>. Your S3 bill is
          growing 3x faster than your revenue.
        </p>
        <div className="grid grid-cols-3 gap-3 pt-2">
          <MetricCounter label="Failed Uploads" value={34} unit="%" trend="up" />
          <MetricCounter label="Duplicate Data" value={62} unit="%" trend="up" />
          <MetricCounter label="Storage Cost" value={47000} unit="$/mo" trend="up" />
        </div>
        <div className="flex items-center justify-center gap-4 pt-3">
          <ServerNode type="client" label="User" sublabel="uploading 2GB" />
          <span className="text-muted-foreground text-xs font-mono">1.9GB sent →</span>
          <ServerNode type="server" label="Server" sublabel="single POST" status="warning" />
          <span className="text-red-500 text-lg font-mono">✕</span>
          <ServerNode type="database" label="Storage" sublabel="all progress lost" status="unhealthy" />
        </div>
      </FailureScenario>

      <WhyItBreaks title="Two compounding problems: fragile uploads and zero deduplication">
        <p className="text-sm text-muted-foreground">
          Two problems compound here. First, <strong>monolithic uploads</strong> are fragile — any
          network interruption loses all progress. A 2GB file over a 10 Mbps connection takes 27
          minutes. The probability of a network interruption in 27 minutes on a mobile connection is
          high. Second, <strong>no deduplication</strong> means identical files consume storage
          proportional to upload count, not unique content. Dropbox reported that content-level dedup
          saved them over 60% of raw storage.
        </p>
        <div className="grid grid-cols-2 gap-2 mt-3">
          {[
            { n: "1", label: "Monolithic Upload", desc: "Any interruption = total restart" },
            { n: "2", label: "No Dedup", desc: "Same file stored N times for N users" },
            { n: "3", label: "No Delta Sync", desc: "Changing 1 byte re-uploads entire file" },
            { n: "4", label: "No Conflict Resolution", desc: "Offline edits silently overwrite" },
          ].map((item) => (
            <div key={item.n} className="flex items-start gap-2.5 rounded-lg bg-muted/30 p-3">
              <span className="text-xs font-mono font-bold text-orange-400 bg-orange-500/10 rounded-md size-6 flex items-center justify-center shrink-0">
                {item.n}
              </span>
              <div>
                <p className="text-xs font-semibold">{item.label}</p>
                <p className="text-[11px] text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </WhyItBreaks>

      <ConceptVisualizer title="Chunked Uploads — Resumable by Design">
        <p className="text-sm text-muted-foreground mb-4">
          Break every file into fixed-size chunks (Dropbox uses 4MB blocks). Upload each chunk
          independently with its SHA-256 hash. If a chunk fails, retry just that chunk — not the
          entire file. The server reassembles chunks after all are received. Watch the upload
          handle a network failure gracefully:
        </p>
        <ChunkedUploadViz />
        <AnimatedFlow
          steps={[
            { id: "split", label: "Split File", description: "2GB file into 512 x 4MB chunks", icon: <Layers className="size-4" /> },
            { id: "hash", label: "Hash Each Chunk", description: "SHA-256 for dedup + integrity", icon: <Hash className="size-4" /> },
            { id: "check", label: "Check Server", description: "Which chunks already exist?", icon: <HardDrive className="size-4" /> },
            { id: "upload", label: "Upload Missing", description: "Only send new chunks (parallel)", icon: <Upload className="size-4" /> },
            { id: "assemble", label: "Commit Manifest", description: "Server records file = [chunk hashes]", icon: <FileText className="size-4" /> },
          ]}
          interval={1800}
        />
      </ConceptVisualizer>

      <ConceptVisualizer title="Content-Addressable Deduplication">
        <p className="text-sm text-muted-foreground mb-4">
          Each chunk is addressed by its content hash (SHA-256). If two users upload the same file,
          their chunks produce identical hashes. The server stores each unique chunk only once.
          File metadata stores a list of chunk hashes — pointers to shared content. This is how
          Dropbox can serve millions of copies of a popular file while storing it just once.
        </p>
        <DeduplicationViz />
        <BeforeAfter
          before={{
            title: "Without Dedup (naive)",
            content: (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">500 users upload same 2GB video</p>
                <MetricCounter label="Storage Used" value={1000} unit="GB" trend="up" />
                <p className="text-[10px] text-muted-foreground/50">Storage cost: ~$23/month on S3</p>
              </div>
            ),
          }}
          after={{
            title: "With Content Dedup",
            content: (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">500 users upload same 2GB video</p>
                <MetricCounter label="Storage Used" value={2} unit="GB" trend="down" />
                <p className="text-[10px] text-muted-foreground/50">Storage cost: ~$0.05/month on S3</p>
              </div>
            ),
          }}
        />
      </ConceptVisualizer>

      <ConceptVisualizer title="Block-Level Delta Sync">
        <p className="text-sm text-muted-foreground mb-4">
          When you edit a file, Dropbox doesn&apos;t re-upload the entire thing. It compares block
          hashes between the local and remote versions and only syncs the changed blocks. Edit 3
          slides in a 32MB presentation? Only 12MB is transferred. This is what makes Dropbox feel
          instant even for large files.
        </p>
        <BlockSyncViz />
      </ConceptVisualizer>

      <CorrectApproach title="Dropbox-Scale Architecture">
        <p className="text-sm text-muted-foreground mb-4">
          Dropbox&apos;s architecture separates metadata (file tree, permissions, sharing) from block
          storage (raw bytes). The desktop client handles chunking, hashing, and delta detection locally.
          A notification service (long-polling or WebSocket) pushes change events to other devices in
          real time. Blocks are uploaded to the nearest region and replicated asynchronously.
        </p>
        <div className="flex flex-col items-center gap-6">
          <div className="flex gap-4 flex-wrap justify-center">
            <ServerNode type="client" label="Desktop Client" sublabel="chunk + hash + sync" />
            <ServerNode type="client" label="Mobile Client" sublabel="selective sync" />
            <ServerNode type="client" label="Web Client" sublabel="stream on demand" />
          </div>
          <ServerNode type="loadbalancer" label="API Gateway" sublabel="auth, rate limiting, routing" status="healthy" />
          <div className="flex gap-4 flex-wrap justify-center">
            <ServerNode type="server" label="Block Service" sublabel="chunk upload/download" status="healthy" />
            <ServerNode type="server" label="Metadata Service" sublabel="file tree + versions" status="healthy" />
            <ServerNode type="server" label="Notification Service" sublabel="push changes to devices" status="healthy" />
          </div>
          <div className="flex gap-4 flex-wrap justify-center">
            <ServerNode type="cloud" label="Block Storage" sublabel="S3/Azure Blob (chunks)" status="healthy" />
            <ServerNode type="database" label="Metadata DB" sublabel="MySQL (file tree, ACLs)" status="healthy" />
            <ServerNode type="cache" label="Block Index" sublabel="hash → location (Redis)" status="healthy" />
          </div>
          <ServerNode type="cloud" label="Change Queue (Kafka)" sublabel="sync events across devices" status="healthy" />
        </div>
      </CorrectApproach>

      <ConceptVisualizer title="Sync Conflict Resolution">
        <p className="text-sm text-muted-foreground mb-4">
          When two devices edit the same file offline and sync later, you have a conflict. There is
          no universally correct resolution — each strategy trades off between safety and convenience.
          Watch a conflict unfold:
        </p>
        <SyncConflictViz />
        <div className="space-y-3 mt-4">
          {[
            {
              title: "Last-Write-Wins (LWW)",
              desc: "Simplest strategy. Later timestamp overwrites. Risk: silent data loss. Used when conflicts are rare and data is not critical.",
              color: "border-red-500/10 bg-red-500/5",
              tag: "Dangerous",
              tagColor: "text-red-400",
            },
            {
              title: "Conflicted Copy (Dropbox)",
              desc: "Keep both versions. The later sync creates 'report (conflicted copy).docx'. Safe but clutters the file system. User must manually merge.",
              color: "border-emerald-500/10 bg-emerald-500/5",
              tag: "Dropbox uses this",
              tagColor: "text-emerald-400",
            },
            {
              title: "Operational Transform / CRDT",
              desc: "Merge concurrent edits automatically at the operation level. Google Docs uses OT for real-time collaboration. Complex to implement but eliminates conflicts entirely.",
              color: "border-blue-500/10 bg-blue-500/5",
              tag: "Google Docs",
              tagColor: "text-blue-400",
            },
          ].map((strategy) => (
            <div key={strategy.title} className={cn("rounded-lg border p-3 space-y-1", strategy.color)}>
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold">{strategy.title}</h4>
                <span className={cn("text-[9px] font-medium", strategy.tagColor)}>{strategy.tag}</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{strategy.desc}</p>
            </div>
          ))}
        </div>
      </ConceptVisualizer>

      <InteractiveDemo title="Simulate a File Upload">
        {({ isPlaying, tick }) => {
          const stages = [
            { name: "Chunk", time: "~200ms", desc: "Split 128MB file into 32 x 4MB blocks" },
            { name: "Hash", time: "~150ms", desc: "SHA-256 each block (parallelized on client)" },
            { name: "Dedup", time: "~5ms", desc: "Server check: 18 of 32 chunks already exist" },
            { name: "Upload", time: "~12s", desc: "Upload 14 new chunks (56MB) in parallel" },
            { name: "Manifest", time: "~3ms", desc: "Commit file metadata: name, 32 chunk refs" },
            { name: "Notify", time: "~10ms", desc: "Push sync event to user's other 3 devices" },
          ];
          const active = isPlaying ? Math.min(tick % 8, stages.length) : 0;

          return (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Press play to watch a 128MB file upload with dedup — only 56MB actually transfers.
              </p>
              <div className="space-y-1.5">
                {stages.map((stage, i) => (
                  <div
                    key={stage.name}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border px-3 py-2 transition-all duration-400",
                      i < active
                        ? "bg-emerald-500/8 border-emerald-500/20"
                        : i === active && isPlaying
                        ? "bg-blue-500/8 border-blue-500/20 ring-1 ring-blue-500/15"
                        : "bg-muted/10 border-border/30 text-muted-foreground/40"
                    )}
                  >
                    <span className={cn(
                      "text-xs font-mono font-bold w-16",
                      i < active ? "text-emerald-400" : i === active && isPlaying ? "text-blue-400" : ""
                    )}>
                      {stage.name}
                    </span>
                    <div className="flex-1 text-xs text-muted-foreground truncate">
                      {i < active ? stage.desc : "—"}
                    </div>
                    <span className={cn(
                      "text-[10px] font-mono shrink-0",
                      i < active ? "text-muted-foreground" : "text-transparent"
                    )}>
                      {stage.time}
                    </span>
                  </div>
                ))}
              </div>
              {active >= stages.length && (
                <ConversationalCallout type="tip">
                  Only 56MB transferred instead of 128MB — the client skipped 18 chunks that the server
                  already had from other users. If this file was previously uploaded by anyone in the
                  organization, zero bytes would transfer. The client just sends the manifest of chunk
                  hashes.
                </ConversationalCallout>
              )}
            </div>
          );
        }}
      </InteractiveDemo>

      <ScaleSimulator
        title="Storage & Dedup Simulator"
        min={100}
        max={10000000}
        step={10000}
        unit="files uploaded"
        metrics={(v) => [
          { label: "Raw Size (avg 50MB)", value: Math.round(v * 50 / 1000), unit: "GB" },
          { label: "After Dedup (60% saved)", value: Math.round(v * 50 * 0.4 / 1000), unit: "GB" },
          { label: "Storage Cost (S3)", value: Math.round(v * 50 * 0.4 / 1000 * 0.023), unit: "$/mo" },
          { label: "Bandwidth Saved", value: Math.round(v * 50 * 0.6 / 1000), unit: "GB" },
          { label: "Block Index Size", value: Math.round(v * 50 / 4 * 0.4 * 0.0001), unit: "MB" },
          { label: "Metadata DB Size", value: Math.round(v * 0.002), unit: "MB" },
        ]}
      >
        {({ value }) => (
          <p className="text-xs text-muted-foreground">
            {value < 10000
              ? `At ${value.toLocaleString()} files, raw storage would be ${Math.round(value * 50 / 1000)}GB but dedup reduces it to ${Math.round(value * 50 * 0.4 / 1000)}GB. Savings: $${Math.round(value * 50 * 0.6 / 1000 * 0.023)}/month on S3.`
              : value < 1000000
              ? `At ${(value / 1000).toFixed(0)}K files, dedup saves ${Math.round(value * 50 * 0.6 / 1000)}GB of storage and bandwidth. The block index in Redis uses just ${Math.round(value * 50 / 4 * 0.4 * 0.0001)}MB.`
              : `At ${(value / 1000000).toFixed(1)}M files (Dropbox-scale), dedup saves ${Math.round(value * 50 * 0.6 / 1000 / 1000)}TB of storage. Without dedup, you'd pay $${Math.round(value * 50 / 1000 * 0.023).toLocaleString()}/month instead of $${Math.round(value * 50 * 0.4 / 1000 * 0.023).toLocaleString()}/month.`}
          </p>
        )}
      </ScaleSimulator>

      <AhaMoment
        question="Why chunk on the client instead of the server?"
        answer={
          <p>
            If the client chunks and hashes locally, it can tell the server which chunks it has
            <em> before uploading</em>. Chunks that already exist (from dedup or a previous partial
            upload) are skipped entirely — zero bytes transferred. This saves bandwidth and makes
            resume-after-failure instant. Dropbox&apos;s desktop client does all chunking and hashing
            locally, sending only the chunk hashes to the server first, then uploading only the missing
            chunks.
          </p>
        }
      />

      <ConversationalCallout type="tip">
        Variable-size chunking (content-defined chunking using Rabin fingerprints) is better than
        fixed-size for dedup. If you insert a byte at the start of a file, fixed-size chunking shifts
        every chunk boundary and invalidates all hashes. Content-defined chunking sets boundaries
        based on content patterns, so only the chunk where the edit happened changes. Dropbox and
        rsync both use this technique.
      </ConversationalCallout>

      <ConversationalCallout type="warning">
        Notification latency matters enormously for sync. When you save a file on your laptop, you
        expect it to appear on your phone within seconds. Dropbox uses a long-polling notification
        service: each client holds an open connection to the server, which pushes a &quot;file X changed&quot;
        event instantly. The client then fetches only the changed blocks. This pub/sub pattern
        (via Kafka internally) is what makes sync feel real-time.
      </ConversationalCallout>

      <KeyTakeaway
        points={[
          "Chunked uploads (4MB blocks) enable resumable transfers — retry individual chunks, not the whole file.",
          "Content-addressable storage (SHA-256 hash) enables automatic deduplication, saving 60%+ of raw storage.",
          "Client-side chunking lets you skip already-stored chunks before uploading — zero bandwidth for duplicates.",
          "Block-level delta sync transfers only changed blocks, reducing bandwidth by up to 2,500x for edits.",
          "Sync conflicts require explicit strategy: Dropbox uses conflicted copies, Google Docs uses OT/CRDTs.",
          "Variable-size chunking (Rabin fingerprints) is more resilient to insertions than fixed-size blocks.",
          "Separate metadata (file tree, permissions) from block storage (raw bytes) — they have different access patterns and scaling needs.",
        ]}
      />
    </div>
  );
}
