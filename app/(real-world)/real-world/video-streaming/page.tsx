"use client";

import { useState, useMemo, useCallback } from "react";
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

// --- Upload Pipeline Playground ---

const pipelineStatusMap: Record<string, "healthy" | "idle" | "warning"> = {
  active: "healthy",
  idle: "idle",
  processing: "warning",
};

function UploadPipelinePlayground() {
  const sim = useSimulation({ intervalMs: 800, maxSteps: 20 });
  const tick = sim.tick;

  const resolutions = ["1080p", "720p", "480p", "240p"];
  const transcodeTimes = [12, 8, 5, 3];

  const progress = useMemo(() => {
    return resolutions.map((_, i) => {
      const startTick = 4 + i * 2;
      if (tick < startTick) return 0;
      const elapsed = tick - startTick;
      return Math.min(100, elapsed * 25);
    });
  }, [tick]);

  const pipelineNodes: FlowNode[] = useMemo(() => {
    const uploadStatus = tick >= 1 ? "healthy" : "idle";
    const transcodeStatus = tick >= 4 ? "healthy" : tick >= 2 ? "warning" : "idle";
    const storageStatus = tick >= 12 ? "healthy" : "idle";
    const cdnStatus = tick >= 16 ? "healthy" : "idle";

    return [
      {
        id: "upload",
        type: "clientNode",
        position: { x: 0, y: 80 },
        data: {
          label: "Upload",
          sublabel: "Raw 1080p video",
          status: pipelineStatusMap[uploadStatus] ?? "idle",
          handles: { right: true },
        },
      },
      {
        id: "transcode",
        type: "serverNode",
        position: { x: 220, y: 80 },
        data: {
          label: "Transcoding Service",
          sublabel: tick >= 4 ? "FFmpeg encoding..." : "Waiting",
          status: pipelineStatusMap[transcodeStatus] ?? "idle",
          handles: { left: true, right: true },
        },
      },
      {
        id: "storage",
        type: "databaseNode",
        position: { x: 460, y: 80 },
        data: {
          label: "Storage (S3)",
          sublabel: tick >= 12 ? "Segments stored" : "Empty",
          status: pipelineStatusMap[storageStatus] ?? "idle",
          handles: { left: true, right: true },
        },
      },
      {
        id: "cdn",
        type: "cacheNode",
        position: { x: 680, y: 80 },
        data: {
          label: "CDN",
          sublabel: tick >= 16 ? "Distributed" : "Pending",
          status: pipelineStatusMap[cdnStatus] ?? "idle",
          handles: { left: true },
        },
      },
    ];
  }, [tick]);

  const pipelineEdges: FlowEdge[] = useMemo(() => [
    { id: "e1", source: "upload", target: "transcode", animated: tick >= 1 },
    { id: "e2", source: "transcode", target: "storage", animated: tick >= 8 },
    { id: "e3", source: "storage", target: "cdn", animated: tick >= 14 },
  ], [tick]);

  const chartData = useMemo(() => {
    return resolutions.map((res, i) => ({
      resolution: res,
      time: progress[i] >= 100 ? transcodeTimes[i] : 0,
    }));
  }, [progress]);

  const explanation = useMemo(() => {
    if (tick === 0) return "Press play to upload a video and watch it flow through the pipeline.";
    if (tick < 4) return "Video is uploading to the ingest server. Raw file is being validated and stored temporarily.";
    if (tick < 12) return "FFmpeg workers are encoding the video into multiple resolutions. Each resolution takes a different amount of time based on complexity.";
    if (tick < 16) return "All resolutions are encoded and segmented into 4-second chunks. Segments are being written to object storage.";
    return "Segments are distributed to CDN edge locations worldwide. The HLS manifest (.m3u8) is generated and ready for playback.";
  }, [tick]);

  return (
    <Playground
      title="Upload Pipeline"
      simulation={sim}
      canvasHeight="min-h-[420px]"
      canvas={
        <div className="p-4 space-y-4">
          <FlowDiagram
            nodes={pipelineNodes}
            edges={pipelineEdges}
            minHeight={180}
            interactive={false}
            allowDrag={false}
          />
          <div className="space-y-2 px-2">
            <p className="text-xs font-medium text-muted-foreground">Transcoding Progress</p>
            {resolutions.map((res, i) => (
              <div key={res} className="flex items-center gap-3">
                <span className="text-xs font-mono w-12 text-right text-muted-foreground">{res}</span>
                <div className="flex-1 h-4 bg-muted/20 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      progress[i] >= 100 ? "bg-emerald-500" : progress[i] > 0 ? "bg-blue-500" : "bg-muted/30"
                    )}
                    style={{ width: `${progress[i]}%` }}
                  />
                </div>
                <span className="text-xs font-mono w-10 text-muted-foreground">
                  {progress[i] >= 100 ? "Done" : progress[i] > 0 ? `${progress[i]}%` : "--"}
                </span>
              </div>
            ))}
          </div>
          <LiveChart
            type="bar"
            data={chartData}
            dataKeys={{ x: "resolution", y: "time", label: "Encode Time" }}
            height={140}
            unit="sec"
          />
        </div>
      }
      explanation={<p>{explanation}</p>}
    />
  );
}

// --- Adaptive Bitrate Streaming Demo ---

const qualityMap: Record<string, { label: string; colorClass: string; bitrate: number }> = {
  q1080: { label: "1080p", colorClass: "text-violet-400", bitrate: 5 },
  q720: { label: "720p", colorClass: "text-blue-400", bitrate: 2.5 },
  q480: { label: "480p", colorClass: "text-emerald-400", bitrate: 1 },
  q240: { label: "240p", colorClass: "text-amber-400", bitrate: 0.4 },
};

function getQualityKey(bandwidth: number): string {
  if (bandwidth >= 5) return "q1080";
  if (bandwidth >= 2.5) return "q720";
  if (bandwidth >= 1) return "q480";
  return "q240";
}

const bufferColorMap: Record<string, string> = {
  healthy: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-red-500",
};

function getBufferColorKey(level: number): string {
  if (level > 60) return "healthy";
  if (level > 30) return "warning";
  return "danger";
}

function AdaptiveBitrateDemo() {
  const [bandwidth, setBandwidth] = useState(5);
  const sim = useSimulation({ intervalMs: 600, maxSteps: 40 });
  const tick = sim.tick;

  const bitrateHistory = useMemo(() => {
    const history: { time: number; bitrate: number; bandwidth: number }[] = [];
    for (let t = 0; t <= Math.min(tick, 40); t++) {
      const fluctuation = Math.sin(t * 0.3) * 2 + Math.cos(t * 0.7) * 1.5;
      const effectiveBw = Math.max(0.3, bandwidth + fluctuation);
      const qKey = getQualityKey(effectiveBw);
      const q = qualityMap[qKey];
      history.push({ time: t, bitrate: q.bitrate, bandwidth: parseFloat(effectiveBw.toFixed(1)) });
    }
    return history;
  }, [tick, bandwidth]);

  const currentBw = bitrateHistory.length > 0 ? bitrateHistory[bitrateHistory.length - 1].bandwidth : bandwidth;
  const currentQKey = getQualityKey(currentBw);
  const currentQ = qualityMap[currentQKey];

  const bufferLevel = useMemo(() => {
    const base = 50;
    const bwFactor = (currentBw - currentQ.bitrate) * 15;
    return Math.max(5, Math.min(100, base + bwFactor));
  }, [currentBw, currentQ.bitrate]);

  const bufferKey = getBufferColorKey(bufferLevel);

  return (
    <Playground
      title="Adaptive Bitrate Streaming"
      simulation={sim}
      canvasHeight="min-h-[400px]"
      canvas={
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Bandwidth:</span>
              <input
                type="range"
                min={0.5}
                max={10}
                step={0.5}
                value={bandwidth}
                onChange={(e) => setBandwidth(parseFloat(e.target.value))}
                className="w-32 accent-violet-500"
              />
              <span className="text-sm font-mono font-bold">{bandwidth} Mbps</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Quality:</span>
              <span className={cn("text-sm font-mono font-bold", currentQ.colorClass)}>
                {currentQ.label}
              </span>
            </div>
          </div>

          <div className="rounded-lg border border-border/30 bg-muted/10 p-3 space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Simulated Player</span>
              <span className={cn("font-mono font-bold", currentQ.colorClass)}>
                {currentQ.label} @ {currentQ.bitrate} Mbps
              </span>
            </div>
            <div className="w-full h-24 rounded bg-black/40 flex items-center justify-center">
              <span className={cn("text-lg font-bold", currentQ.colorClass)}>
                {sim.isPlaying || tick > 0 ? currentQ.label : "Press Play"}
              </span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground w-12">Buffer</span>
                <div className="flex-1 h-3 bg-muted/20 rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all duration-500", bufferColorMap[bufferKey])}
                    style={{ width: `${bufferLevel}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono text-muted-foreground w-8">{Math.round(bufferLevel)}%</span>
              </div>
            </div>
          </div>

          <LiveChart
            type="line"
            data={bitrateHistory.slice(-20)}
            dataKeys={{ x: "time", y: ["bitrate", "bandwidth"], label: ["Bitrate", "Bandwidth"] }}
            height={150}
            unit="Mbps"
            referenceLines={[
              { y: 5, label: "1080p threshold", color: "#8b5cf6" },
              { y: 2.5, label: "720p threshold", color: "#3b82f6" },
            ]}
          />
        </div>
      }
      explanation={
        <div className="space-y-3">
          <p>Drag the bandwidth slider to simulate network conditions. The player automatically adjusts quality.</p>
          <p>When bandwidth drops below a quality threshold, the player switches to a lower resolution to prevent buffering. When bandwidth improves, quality steps back up.</p>
          <p className="text-xs text-muted-foreground">
            The buffer level shows how much video is pre-downloaded. High bandwidth fills the buffer faster; low bandwidth drains it.
          </p>
        </div>
      }
    />
  );
}

// --- CDN Edge Architecture ---

function CdnEdgePlayground() {
  const sim = useSimulation({ intervalMs: 1000, maxSteps: 12 });
  const tick = sim.tick;

  const cdnNodes: FlowNode[] = useMemo(() => {
    const viewerStatus = tick >= 1 ? "healthy" : "idle";
    const edgeStatus = tick >= 2 ? (tick >= 4 ? "healthy" : "warning") : "idle";
    const regionalStatus = tick >= 5 ? "healthy" : "idle";
    const originStatus = tick >= 7 ? "healthy" : "idle";

    return [
      {
        id: "viewer1",
        type: "clientNode",
        position: { x: 0, y: 0 },
        data: {
          label: "Viewer (NYC)",
          sublabel: tick >= 3 ? "18ms latency" : "Requesting...",
          status: viewerStatus,
          handles: { right: true },
        },
      },
      {
        id: "viewer2",
        type: "clientNode",
        position: { x: 0, y: 160 },
        data: {
          label: "Viewer (London)",
          sublabel: tick >= 8 ? "22ms latency" : "Requesting...",
          status: tick >= 5 ? "healthy" : "idle",
          handles: { right: true },
        },
      },
      {
        id: "edge1",
        type: "cacheNode",
        position: { x: 240, y: 0 },
        data: {
          label: "Edge (US-East)",
          sublabel: tick >= 3 ? "CACHE HIT" : tick >= 2 ? "MISS" : "Idle",
          status: edgeStatus,
          metrics: tick >= 3 ? [{ label: "Hit Rate", value: "94%" }] : [],
          handles: { left: true, right: true },
        },
      },
      {
        id: "edge2",
        type: "cacheNode",
        position: { x: 240, y: 160 },
        data: {
          label: "Edge (EU-West)",
          sublabel: tick >= 8 ? "CACHE HIT" : tick >= 6 ? "MISS" : "Idle",
          status: tick >= 8 ? "healthy" : tick >= 6 ? "warning" : "idle",
          handles: { left: true, right: true },
        },
      },
      {
        id: "regional",
        type: "serverNode",
        position: { x: 480, y: 80 },
        data: {
          label: "Regional Server",
          sublabel: "Mid-tier cache",
          status: regionalStatus,
          handles: { left: true, right: true },
        },
      },
      {
        id: "origin",
        type: "databaseNode",
        position: { x: 700, y: 80 },
        data: {
          label: "Origin (S3)",
          sublabel: "Source of truth",
          status: originStatus,
          handles: { left: true },
        },
      },
    ];
  }, [tick]);

  const cdnEdges: FlowEdge[] = useMemo(() => [
    { id: "e1", source: "viewer1", target: "edge1", animated: tick >= 1 },
    { id: "e2", source: "viewer2", target: "edge2", animated: tick >= 5 },
    { id: "e3", source: "edge1", target: "regional", animated: tick >= 2 && tick < 4 },
    { id: "e4", source: "edge2", target: "regional", animated: tick >= 6 && tick < 8 },
    { id: "e5", source: "regional", target: "origin", animated: tick >= 2 && tick < 4 },
  ], [tick]);

  const getExplanation = useCallback(() => {
    if (tick === 0) return "Press play to see how CDN edge caching works. Viewers in different regions connect to their nearest edge server.";
    if (tick < 3) return "The NYC viewer requests a video segment. The edge server in US-East does not have it cached yet -- this is a cache MISS. The request propagates to the regional server and then to the origin.";
    if (tick < 5) return "The origin responds with the segment. It is now cached at the US-East edge. The next request from any NYC-area viewer will be a cache HIT at just 18ms latency.";
    if (tick < 8) return "A London viewer requests the same segment. EU-West edge has a cache miss, so it fetches from the regional server (which may already have it cached from the US-East fill).";
    return "Both edges now have the segment cached. Subsequent viewers in either region get sub-30ms responses. The origin is barely touched -- it only served the segment once per edge location.";
  }, [tick]);

  return (
    <Playground
      title="CDN Edge Architecture"
      simulation={sim}
      canvasHeight="min-h-[320px]"
      canvas={
        <FlowDiagram
          nodes={cdnNodes}
          edges={cdnEdges}
          minHeight={300}
          interactive={false}
          allowDrag={false}
        />
      }
      explanation={<p>{getExplanation()}</p>}
    />
  );
}

// --- Full Architecture Overview ---

function ArchitectureOverview() {
  const archNodes: FlowNode[] = [
    {
      id: "client",
      type: "clientNode",
      position: { x: 0, y: 100 },
      data: {
        label: "Client",
        sublabel: "HLS.js / ExoPlayer",
        status: "healthy",
        handles: { right: true },
      },
    },
    {
      id: "cdn",
      type: "cacheNode",
      position: { x: 200, y: 100 },
      data: {
        label: "CDN",
        sublabel: "Edge network",
        status: "healthy",
        handles: { left: true, right: true },
      },
    },
    {
      id: "gateway",
      type: "gatewayNode",
      position: { x: 400, y: 100 },
      data: {
        label: "API Gateway",
        sublabel: "Auth + routing",
        status: "healthy",
        handles: { left: true, right: true, bottom: true },
      },
    },
    {
      id: "videoService",
      type: "serverNode",
      position: { x: 600, y: 30 },
      data: {
        label: "Video Service",
        sublabel: "Upload + metadata",
        status: "healthy",
        handles: { left: true, right: true },
      },
    },
    {
      id: "transcoder",
      type: "queueNode",
      position: { x: 600, y: 180 },
      data: {
        label: "Transcoder",
        sublabel: "FFmpeg workers",
        status: "healthy",
        handles: { left: true, right: true },
      },
    },
    {
      id: "objectStorage",
      type: "databaseNode",
      position: { x: 830, y: 30 },
      data: {
        label: "Object Storage",
        sublabel: "S3 segments",
        status: "healthy",
        handles: { left: true },
      },
    },
    {
      id: "metadataDb",
      type: "databaseNode",
      position: { x: 830, y: 180 },
      data: {
        label: "Metadata DB",
        sublabel: "Titles, manifests",
        status: "healthy",
        handles: { left: true },
      },
    },
  ];

  const archEdges: FlowEdge[] = [
    { id: "a1", source: "client", target: "cdn", animated: true },
    { id: "a2", source: "cdn", target: "gateway", animated: true },
    { id: "a3", source: "gateway", target: "videoService", animated: true },
    { id: "a4", source: "gateway", target: "transcoder", animated: true },
    { id: "a5", source: "videoService", target: "objectStorage", animated: true },
    { id: "a6", source: "transcoder", target: "objectStorage", animated: true },
    { id: "a7", source: "transcoder", target: "metadataDb", animated: true },
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">Full System Architecture</h3>
      <p className="text-sm text-muted-foreground">
        A production video streaming system separates the <strong>upload pipeline</strong> (async,
        happens once per video) from the <strong>playback pipeline</strong> (real-time, happens
        millions of times). The API Gateway routes creator uploads to the Video Service, which
        queues transcoding jobs. Viewers fetch segments directly from the CDN.
      </p>
      <FlowDiagram
        nodes={archNodes}
        edges={archEdges}
        minHeight={280}
        interactive={true}
        allowDrag={true}
      />
    </div>
  );
}

// --- Main Page ---

export default function VideoStreamingPage() {
  return (
    <div className="space-y-8">
      <TopicHero
        title="Design Video Streaming"
        subtitle="You serve a 4K video from a single origin server. Users in Tokyo wait 8 seconds for the first frame while your bandwidth bill bankrupts you."
        difficulty="advanced"
      />

      <section className="space-y-4">
        <h2 className="text-xl font-bold">The Core Problem</h2>
        <p className="text-sm text-muted-foreground">
          Storing uploaded videos as a single resolution MP4 on one origin server creates three
          compounding failures: mobile users on 3G download pixels they cannot display, viewers
          on other continents experience multi-second latency before playback starts, and your
          origin server handles every request directly. At 1 million concurrent viewers, bandwidth
          costs alone hit $500K/month.
        </p>
        <BeforeAfter
          before={{
            title: "Single Origin, Single Resolution",
            content: (
              <ul className="text-sm space-y-1">
                <li>One resolution fits nobody</li>
                <li>No seeking without full download</li>
                <li>Every byte from origin server</li>
                <li>38% rebuffer rate on mobile</li>
                <li>4200ms start delay globally</li>
              </ul>
            ),
          }}
          after={{
            title: "CDN + Transcoding + ABR",
            content: (
              <ul className="text-sm space-y-1">
                <li>Multiple resolutions per segment</li>
                <li>Instant seeking via segment index</li>
                <li>98% served from CDN edge</li>
                <li>Less than 0.5% rebuffer rate</li>
                <li>280ms start delay with edge</li>
              </ul>
            ),
          }}
        />
      </section>

      <ConversationalCallout type="tip">
        YouTube transcodes every upload into more than 10 resolution/codec combinations. Netflix
        goes further with per-title encoding -- they analyze each video&apos;s complexity and choose
        optimal bitrate ladders. A static talking-head video needs far less bitrate than an action
        movie at the same perceived quality.
      </ConversationalCallout>

      <section className="space-y-4">
        <h2 className="text-xl font-bold">Upload and Transcoding Pipeline</h2>
        <p className="text-sm text-muted-foreground">
          When a creator uploads a video, it enters an async processing pipeline. The raw file is
          transcoded into multiple resolution/bitrate pairs, each variant is segmented into small
          chunks (typically 2-10 seconds), and a manifest file (HLS <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">.m3u8</code> or
          DASH <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">.mpd</code>) is generated listing every segment at every quality level.
        </p>
        <UploadPipelinePlayground />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold">Adaptive Bitrate Streaming</h2>
        <p className="text-sm text-muted-foreground">
          The player monitors download throughput and buffer fill level in real time. If bandwidth
          drops, it requests the next segment at a lower quality. If bandwidth improves, it steps
          up. The viewer sees continuous playback instead of a spinner. This is the core innovation
          behind HLS and DASH -- both work on the same principle.
        </p>
        <AdaptiveBitrateDemo />
      </section>

      <AhaMoment
        question="Why not just transcode on-the-fly when a user requests a specific quality?"
        answer={
          <p>
            Transcoding is extremely CPU-intensive -- encoding a 10-minute 1080p video takes minutes
            even on GPU hardware. If you transcode per request, a viral video would require thousands
            of simultaneous transcodes. Pre-transcoding once and caching forever is orders of magnitude
            cheaper. Netflix spends about 200,000 CPU-hours per day on transcoding alone.
          </p>
        }
      />

      <section className="space-y-4">
        <h2 className="text-xl font-bold">CDN Edge Delivery</h2>
        <p className="text-sm text-muted-foreground">
          A CDN caches video segments at edge servers close to viewers. The first viewer in a region
          triggers a cache miss -- the segment is fetched from the origin. Every subsequent viewer
          in that region gets sub-30ms latency instead of 200ms+ cross-continent round trips. For
          popular content, the origin may only serve each segment once per edge location.
        </p>
        <CdnEdgePlayground />
      </section>

      <ConversationalCallout type="question">
        How does YouTube handle a brand-new viral video that gets 10 million views in 5 minutes?
        The first few edge cache misses fetch from origin, but within seconds each edge location has
        a cached copy. The origin sees a brief spike of one request per edge per segment, not
        10 million requests. CDN architecture is a prerequisite for viral-scale content.
      </ConversationalCallout>

      <section className="space-y-4">
        <ArchitectureOverview />
      </section>

      <AhaMoment
        question="Why do HLS and DASH use HTTP instead of a custom streaming protocol?"
        answer={
          <p>
            HTTP works through every firewall, proxy, and CDN on the internet. Custom protocols
            (RTMP, RTSP) required special server software and could not leverage existing HTTP caching
            infrastructure. By treating video segments as regular HTTP resources, HLS/DASH get CDN
            caching, HTTP/2 multiplexing, and range requests for free.
          </p>
        }
      />

      <ConversationalCallout type="warning">
        Video storage costs dominate at scale. A single 10-minute video transcoded to 4 quality
        levels with 4-second segments produces around 600 files. YouTube stores over 800 million
        videos. Aggressive cleanup policies, tiered storage (hot/warm/cold), and per-title encoding
        optimization are essential for cost control.
      </ConversationalCallout>

      <ConversationalCallout type="tip">
        For live streaming, the pipeline is the same but with tighter latency constraints. Segments
        shrink to 1-2 seconds, the manifest updates continuously, and the encode-segment-distribute
        cycle must complete within the segment duration. Low-Latency HLS achieves 2-4 second
        end-to-end latency. For sub-second latency (gaming, auctions), WebRTC is needed but
        sacrifices scalability.
      </ConversationalCallout>

      <KeyTakeaway
        points={[
          "Transcode uploaded videos into multiple resolutions (bitrate ladder) and segment into 2-10 second chunks for seeking and adaptation.",
          "Adaptive bitrate streaming (HLS/DASH) lets the player switch quality per segment based on real-time bandwidth and buffer health.",
          "CDN edge caching eliminates cross-continent latency -- 98%+ of requests served from edge, origin barely touched.",
          "Pre-transcode once and cache forever; on-the-fly transcoding cannot scale.",
          "The manifest file (.m3u8 or .mpd) is the index that ties everything together -- it lists every segment at every quality level.",
          "Separate upload processing (async, once) from playback delivery (real-time, millions of times). This is the core architectural decision.",
        ]}
      />
    </div>
  );
}
