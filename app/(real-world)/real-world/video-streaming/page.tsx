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
import { InteractiveDemo } from "@/components/interactive-demo";
import { ScaleSimulator } from "@/components/scale-simulator";
import { AhaMoment } from "@/components/aha-moment";
import { ConversationalCallout } from "@/components/conversational-callout";
import { BeforeAfter } from "@/components/before-after";
import { cn } from "@/lib/utils";
import { Play, Film, Wifi, Monitor, Zap, Server, Globe } from "lucide-react";

function TranscodingPipelineViz() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % 8), 1400);
    return () => clearInterval(t);
  }, []);

  const resolutions = [
    { label: "4K", bitrate: "20 Mbps", color: "bg-violet-500", segments: 8 },
    { label: "1080p", bitrate: "5 Mbps", color: "bg-blue-500", segments: 8 },
    { label: "720p", bitrate: "2.5 Mbps", color: "bg-emerald-500", segments: 8 },
    { label: "360p", bitrate: "0.5 Mbps", color: "bg-amber-500", segments: 8 },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <div className={cn(
          "rounded-lg border px-3 py-2 text-xs font-medium transition-all duration-500",
          step >= 1 ? "bg-violet-500/10 border-violet-500/30 text-violet-400" : "bg-muted/30 border-border text-muted-foreground"
        )}>
          <Film className="size-4 inline mr-1.5" />
          Raw Upload (2.4 GB)
        </div>
        <div className={cn(
          "text-xs font-mono transition-opacity duration-300",
          step >= 1 ? "opacity-100 text-muted-foreground" : "opacity-0"
        )}>
          FFmpeg encode
        </div>
      </div>

      {resolutions.map((res, ri) => (
        <div key={res.label} className="space-y-1">
          <div className="flex items-center gap-2">
            <span className={cn(
              "text-[10px] font-mono font-bold w-10 text-right transition-all duration-300",
              step > ri + 1 ? "text-foreground" : "text-muted-foreground/40"
            )}>
              {res.label}
            </span>
            <span className={cn(
              "text-[10px] font-mono text-muted-foreground/50 w-14",
              step > ri + 1 ? "opacity-100" : "opacity-0"
            )}>
              {res.bitrate}
            </span>
            <div className="flex-1 flex gap-0.5">
              {Array.from({ length: res.segments }).map((_, si) => {
                const segActive = step > ri + 2 || (step === ri + 2 && si < (step * 2) % res.segments);
                return (
                  <div
                    key={si}
                    className={cn(
                      "h-5 flex-1 rounded-sm transition-all duration-300",
                      step > ri + 1
                        ? `${res.color}/20 border border-current/10`
                        : "bg-muted/20 border border-border/30"
                    )}
                    style={{ opacity: step > ri + 1 ? 0.4 + (si / res.segments) * 0.6 : 0.3 }}
                  />
                );
              })}
            </div>
            <span className={cn(
              "text-[10px] font-mono transition-opacity",
              step > ri + 1 ? "opacity-100 text-muted-foreground" : "opacity-0"
            )}>
              {res.segments} segs
            </span>
          </div>
        </div>
      ))}

      <div className={cn(
        "flex items-center gap-2 mt-3 px-12 transition-all duration-500",
        step >= 6 ? "opacity-100" : "opacity-0 translate-y-2"
      )}>
        <div className="h-px flex-1 bg-emerald-500/30" />
        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
          manifest.m3u8 generated
        </span>
        <div className="h-px flex-1 bg-emerald-500/30" />
      </div>

      <p className="text-[11px] text-muted-foreground/60 text-center pt-1">
        {step === 0
          ? "Waiting for upload..."
          : step < 3
          ? "Transcoding to multiple resolutions..."
          : step < 6
          ? "Segmenting into 4-second chunks..."
          : "Pipeline complete -- 32 segments across 4 quality levels"}
      </p>
    </div>
  );
}

function AdaptiveBitrateViz() {
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setFrame((f) => (f + 1) % 24), 800);
    return () => clearInterval(t);
  }, []);

  const bandwidthPattern = [
    8, 8, 10, 10, 12, 15, 15, 12, 8, 5, 3, 2, 2, 3, 5, 8, 10, 15, 20, 20, 18, 15, 12, 10,
  ];
  const bandwidth = bandwidthPattern[frame];

  const getQuality = (bw: number) => {
    if (bw >= 15) return { label: "4K", color: "text-violet-400", bg: "bg-violet-500", pct: 100 };
    if (bw >= 8) return { label: "1080p", color: "text-blue-400", bg: "bg-blue-500", pct: 75 };
    if (bw >= 4) return { label: "720p", color: "text-emerald-400", bg: "bg-emerald-500", pct: 50 };
    return { label: "360p", color: "text-amber-400", bg: "bg-amber-500", pct: 25 };
  };

  const quality = getQuality(bandwidth);

  const bufferSeconds = Math.min(30, Math.max(2, 10 + (bandwidth - 5) * 2));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wifi className="size-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Bandwidth:</span>
          <span className="text-sm font-mono font-bold">{bandwidth} Mbps</span>
        </div>
        <div className="flex items-center gap-2">
          <Monitor className="size-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Quality:</span>
          <span className={cn("text-sm font-mono font-bold", quality.color)}>{quality.label}</span>
        </div>
      </div>

      {/* Bandwidth graph */}
      <div className="flex items-end gap-0.5 h-16">
        {bandwidthPattern.map((bw, i) => {
          const q = getQuality(bw);
          return (
            <div
              key={i}
              className={cn(
                "flex-1 rounded-t-sm transition-all duration-300",
                i === frame ? `${q.bg} opacity-100` : i < frame ? `${q.bg}/40` : "bg-muted/30"
              )}
              style={{ height: `${(bw / 20) * 100}%` }}
            />
          );
        })}
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground/50 font-mono">
        <span>0s</span>
        <span>Time</span>
        <span>24s</span>
      </div>

      {/* Quality indicator bar */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground w-14">Quality</span>
          <div className="flex-1 h-3 bg-muted/20 rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-500", quality.bg)}
              style={{ width: `${quality.pct}%` }}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground w-14">Buffer</span>
          <div className="flex-1 h-3 bg-muted/20 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                bufferSeconds > 10 ? "bg-emerald-500" : bufferSeconds > 5 ? "bg-amber-500" : "bg-red-500"
              )}
              style={{ width: `${(bufferSeconds / 30) * 100}%` }}
            />
          </div>
          <span className="text-[10px] font-mono text-muted-foreground">{bufferSeconds}s</span>
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground/60 text-center">
        {bandwidth < 4
          ? "Low bandwidth detected -- switching to 360p to prevent buffering"
          : bandwidth >= 15
          ? "Excellent bandwidth -- streaming at full 4K resolution"
          : `Adapting quality to match ${bandwidth} Mbps throughput`}
      </p>
    </div>
  );
}

function CdnDeliveryViz() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % 6), 1800);
    return () => clearInterval(t);
  }, []);

  const regions = [
    { label: "US-East", viewers: "420K", latency: step >= 2 ? "18ms" : "—", hit: step >= 2 },
    { label: "EU-West", viewers: "280K", latency: step >= 3 ? "22ms" : "—", hit: step >= 3 },
    { label: "AP-Tokyo", viewers: "190K", latency: step >= 4 ? "15ms" : "—", hit: step >= 4 },
    { label: "SA-East", viewers: "65K", latency: step >= 5 ? "31ms" : "—", hit: step >= 5 },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-center gap-3 mb-4">
        <div className={cn(
          "rounded-lg border px-3 py-2 text-xs font-medium transition-all",
          step >= 1 ? "bg-blue-500/10 border-blue-500/30 text-blue-400" : "bg-muted/30 border-border text-muted-foreground/40"
        )}>
          <Server className="size-3.5 inline mr-1" />
          Origin (S3)
        </div>
        <div className={cn(
          "text-xs font-mono transition-opacity",
          step >= 1 ? "opacity-100 text-muted-foreground" : "opacity-0"
        )}>
          push segments
        </div>
        <div className={cn(
          "rounded-lg border px-3 py-2 text-xs font-medium transition-all",
          step >= 1 ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-muted/30 border-border text-muted-foreground/40"
        )}>
          <Globe className="size-3.5 inline mr-1" />
          CDN Edge Network
        </div>
      </div>

      {regions.map((region) => (
        <div key={region.label} className="flex items-center gap-3">
          <span className="text-[10px] font-mono w-16 text-right text-muted-foreground">{region.label}</span>
          <div className={cn(
            "flex-1 flex items-center justify-between rounded-md px-3 h-8 border transition-all duration-500",
            region.hit
              ? "bg-emerald-500/8 border-emerald-500/20"
              : "bg-muted/20 border-border/30"
          )}>
            <span className={cn(
              "text-[11px] font-medium transition-all",
              region.hit ? "text-emerald-400" : "text-muted-foreground/40"
            )}>
              {region.hit ? "CACHE HIT" : "waiting..."}
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">{region.viewers} viewers</span>
          </div>
          <span className={cn(
            "text-[10px] font-mono w-10 transition-opacity",
            region.hit ? "opacity-100 text-muted-foreground" : "opacity-0"
          )}>
            {region.latency}
          </span>
        </div>
      ))}

      <p className="text-[11px] text-muted-foreground/60 text-center pt-2">
        {step === 0
          ? "Video uploaded to origin..."
          : step < 3
          ? "Distributing segments to edge locations..."
          : "98% of requests served from edge -- origin barely touched"}
      </p>
    </div>
  );
}

function ViewerExperienceViz() {
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setFrame((f) => (f + 1) % 10), 1000);
    return () => clearInterval(t);
  }, []);

  const withoutCdn = {
    startDelay: 4200,
    bufferRate: 38,
    quality: "480p",
    rebuffers: 12,
  };

  const withCdn = {
    startDelay: frame >= 2 ? 280 : 0,
    bufferRate: frame >= 4 ? 0.3 : 0,
    quality: frame >= 3 ? "1080p" : "—",
    rebuffers: frame >= 5 ? 0 : 0,
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2 rounded-lg border border-red-500/20 bg-red-500/5 p-3">
        <h4 className="text-xs font-semibold text-red-400">Without CDN + ABR</h4>
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px]">
            <span className="text-muted-foreground">Start delay</span>
            <span className="font-mono text-red-400">{withoutCdn.startDelay}ms</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-muted-foreground">Buffer rate</span>
            <span className="font-mono text-red-400">{withoutCdn.bufferRate}%</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-muted-foreground">Quality</span>
            <span className="font-mono text-red-400">{withoutCdn.quality} fixed</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-muted-foreground">Rebuffers/hr</span>
            <span className="font-mono text-red-400">{withoutCdn.rebuffers}</span>
          </div>
        </div>
      </div>
      <div className="space-y-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
        <h4 className="text-xs font-semibold text-emerald-400">With CDN + ABR</h4>
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px]">
            <span className="text-muted-foreground">Start delay</span>
            <span className={cn("font-mono transition-all", frame >= 2 ? "text-emerald-400" : "text-muted-foreground/40")}>
              {frame >= 2 ? `${withCdn.startDelay}ms` : "..."}
            </span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-muted-foreground">Buffer rate</span>
            <span className={cn("font-mono transition-all", frame >= 4 ? "text-emerald-400" : "text-muted-foreground/40")}>
              {frame >= 4 ? `${withCdn.bufferRate}%` : "..."}
            </span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-muted-foreground">Quality</span>
            <span className={cn("font-mono transition-all", frame >= 3 ? "text-emerald-400" : "text-muted-foreground/40")}>
              {frame >= 3 ? `${withCdn.quality} adaptive` : "..."}
            </span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-muted-foreground">Rebuffers/hr</span>
            <span className={cn("font-mono transition-all", frame >= 5 ? "text-emerald-400" : "text-muted-foreground/40")}>
              {frame >= 5 ? `${withCdn.rebuffers}` : "..."}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VideoStreamingPage() {
  return (
    <div className="space-y-8">
      <TopicHero
        title="Design Video Streaming"
        subtitle="You serve a 4K video from a single origin server. Users in Tokyo wait 8 seconds for the first frame while your bandwidth bill bankrupts you."
        difficulty="advanced"
      />

      <FailureScenario title="The Scenario">
        <p className="text-sm text-muted-foreground">
          You store all uploaded videos as a single resolution MP4 on your origin server. A user on
          a 3G mobile connection requests a 4K file -- it buffers endlessly. A user in another
          continent experiences 4 seconds of latency before playback starts. Your origin server
          handles every request directly, and at <strong>1 million concurrent viewers</strong>, your
          bandwidth bill hits $500K/month.
        </p>
        <div className="grid grid-cols-3 gap-3 pt-2">
          <MetricCounter label="Buffer Rate" value={38} unit="%" trend="up" />
          <MetricCounter label="Start Delay" value={4200} unit="ms" trend="up" />
          <MetricCounter label="Bandwidth Cost" value={500} unit="K$/mo" trend="up" />
        </div>
      </FailureScenario>

      <WhyItBreaks>
        <p className="text-sm text-muted-foreground">
          Three problems compound into a terrible experience. <strong>Single resolution</strong> means
          mobile users download pixels they cannot display while slow connections buffer forever.{" "}
          <strong>No CDN</strong> means every byte travels from your origin regardless of geography --
          a viewer in Mumbai fetches data from Virginia on every segment request.{" "}
          <strong>No segmentation</strong> means the client must download the file linearly -- seeking
          to minute 45 requires downloading minutes 1 through 44 first.
        </p>
        <div className="grid grid-cols-2 gap-2 mt-3">
          {[
            { n: "1", label: "No Transcoding", desc: "One resolution fits nobody" },
            { n: "2", label: "No Segmentation", desc: "Can't seek, can't adapt" },
            { n: "3", label: "No CDN", desc: "Cross-continent for every byte" },
            { n: "4", label: "No ABR", desc: "Quality can't match bandwidth" },
          ].map((item) => (
            <div key={item.n} className="flex items-start gap-2.5 rounded-lg bg-muted/30 p-3">
              <span className="text-xs font-mono font-bold text-red-400 bg-red-500/10 rounded-md size-6 flex items-center justify-center shrink-0">
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

      <ConceptVisualizer title="Video Processing Pipeline">
        <p className="text-sm text-muted-foreground mb-4">
          When a creator uploads a video, it enters an asynchronous processing pipeline. The raw file
          is transcoded by FFmpeg workers into multiple resolution/bitrate pairs, then each variant is
          segmented into small chunks (typically 2-10 seconds). Finally, a manifest file (HLS{" "}
          <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">.m3u8</code> or DASH{" "}
          <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">.mpd</code>) is
          generated listing every available segment at every quality level. This manifest is what the
          player downloads first.
        </p>
        <AnimatedFlow
          steps={[
            { id: "upload", label: "Upload Original", description: "Raw video to object storage", icon: <Film className="size-4" /> },
            { id: "transcode", label: "Transcode", description: "Encode to 360p, 720p, 1080p, 4K", icon: <Zap className="size-4" /> },
            { id: "segment", label: "Segment", description: "Split each into 4-sec chunks" },
            { id: "manifest", label: "Generate Manifest", description: "HLS .m3u8 or DASH .mpd" },
            { id: "cdn", label: "Push to CDN", description: "Distribute to edge locations", icon: <Globe className="size-4" /> },
          ]}
        />
      </ConceptVisualizer>

      <ConceptVisualizer title="Inside the Transcoding Pipeline">
        <p className="text-sm text-muted-foreground mb-4">
          A single 10-minute 4K upload produces dozens of output files. Each resolution is encoded
          at a target bitrate, then split into segments. The manifest ties them all together so the
          player can switch between quality levels mid-stream without interruption.
        </p>
        <TranscodingPipelineViz />
        <ConversationalCallout type="tip">
          YouTube transcodes every upload into more than 10 resolution/codec combinations. Netflix
          goes further with per-title encoding -- they analyze each video&apos;s complexity and choose
          optimal bitrate ladders. A static talking-head video needs far less bitrate than an action
          movie at the same perceived quality.
        </ConversationalCallout>
      </ConceptVisualizer>

      <ConceptVisualizer title="Adaptive Bitrate Streaming (ABR)">
        <p className="text-sm text-muted-foreground mb-4">
          The player monitors download throughput and buffer fill level in real time. If bandwidth
          drops, it requests the next segment at a lower quality. If bandwidth improves, it steps up.
          The viewer sees continuous playback instead of a spinner. This is the core innovation behind
          HLS (Apple) and DASH (MPEG standard) -- both work on the same principle.
        </p>
        <AdaptiveBitrateViz />
      </ConceptVisualizer>

      <ConceptVisualizer title="How the ABR Algorithm Decides">
        <p className="text-sm text-muted-foreground mb-4">
          The player maintains a buffer of downloaded-but-not-yet-played segments (typically 10-30
          seconds of video). Two metrics drive quality decisions:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-4 space-y-2">
            <h4 className="text-sm font-semibold text-blue-400">Throughput Estimation</h4>
            <p className="text-xs text-muted-foreground">
              The player measures how fast recent segments downloaded. If the last 720p segment
              (2.5 Mbps) downloaded in half its playback duration, there&apos;s headroom to try 1080p.
              If it took longer than playback duration, the buffer is draining -- drop to 360p.
            </p>
          </div>
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-2">
            <h4 className="text-sm font-semibold text-emerald-400">Buffer Occupancy</h4>
            <p className="text-xs text-muted-foreground">
              If the buffer drops below ~5 seconds, the player aggressively lowers quality to prevent
              rebuffering (the worst viewer experience). If the buffer is healthy at 20+ seconds,
              quality can safely increase. Buffer-based algorithms (like Netflix&apos;s) are more
              stable than pure throughput estimation.
            </p>
          </div>
        </div>
        <BeforeAfter
          before={{
            title: "Fixed Bitrate",
            content: (
              <ul className="text-sm space-y-1">
                <li>Single quality for entire stream</li>
                <li>Buffers on slow connections</li>
                <li>Wastes bandwidth on fast connections</li>
                <li>Seeking requires full re-download</li>
                <li>38% rebuffer rate on mobile</li>
              </ul>
            ),
          }}
          after={{
            title: "Adaptive Bitrate (HLS/DASH)",
            content: (
              <ul className="text-sm space-y-1">
                <li>Multiple quality levels per segment</li>
                <li>Player switches quality seamlessly</li>
                <li>Matches quality to real-time bandwidth</li>
                <li>Instant seeking via segment index</li>
                <li>&lt;0.5% rebuffer rate on mobile</li>
              </ul>
            ),
          }}
        />
        <div className="grid grid-cols-4 gap-3 pt-3">
          <MetricCounter label="360p" value={0.5} unit="Mbps" trend="neutral" />
          <MetricCounter label="720p" value={2.5} unit="Mbps" trend="neutral" />
          <MetricCounter label="1080p" value={5} unit="Mbps" trend="neutral" />
          <MetricCounter label="4K" value={20} unit="Mbps" trend="neutral" />
        </div>
      </ConceptVisualizer>

      <ConceptVisualizer title="CDN Edge Delivery">
        <p className="text-sm text-muted-foreground mb-4">
          A CDN caches video segments at edge servers close to viewers. The first viewer in a region
          triggers a cache miss (the segment is fetched from the origin S3 bucket). Every subsequent
          viewer in that region gets the segment from the edge -- sub-30ms latency instead of 200ms+
          cross-continent round trips. For popular content, the origin may only serve each segment once
          per edge location.
        </p>
        <CdnDeliveryViz />
      </ConceptVisualizer>

      <ConceptVisualizer title="Viewer Experience: Before vs After">
        <p className="text-sm text-muted-foreground mb-4">
          The combined effect of CDN edge caching and adaptive bitrate streaming transforms the
          viewer experience. Start delay drops from seconds to milliseconds. Rebuffering essentially
          disappears. Quality adapts in real time instead of being locked to a single resolution.
        </p>
        <ViewerExperienceViz />
      </ConceptVisualizer>

      <CorrectApproach title="Full Architecture">
        <p className="text-sm text-muted-foreground mb-4">
          A production video streaming system has two pipelines: the <strong>upload/processing pipeline</strong>{" "}
          (async, happens once per video) and the <strong>playback pipeline</strong> (real-time, happens
          millions of times per video). Separating these is the key architectural insight.
        </p>
        <div className="flex flex-col items-center gap-6">
          <ServerNode type="client" label="Creator Uploads" sublabel="raw video" />
          <ServerNode type="server" label="Upload Service" sublabel="validates, stores original" status="healthy" />
          <ServerNode type="cloud" label="Transcode Workers" sublabel="FFmpeg / GPU cluster (async)" status="healthy" />
          <ServerNode type="database" label="Object Storage" sublabel="S3: all segments + manifests" status="healthy" />
          <div className="flex gap-4 flex-wrap justify-center">
            <ServerNode type="cloud" label="CDN Edge 1" sublabel="US-East" status="healthy" />
            <ServerNode type="cloud" label="CDN Edge 2" sublabel="EU-West" status="healthy" />
            <ServerNode type="cloud" label="CDN Edge 3" sublabel="AP-Tokyo" status="healthy" />
            <ServerNode type="cloud" label="CDN Edge 4" sublabel="SA-East" status="healthy" />
          </div>
          <ServerNode type="client" label="Viewer" sublabel="ABR player (HLS.js / ExoPlayer)" />
        </div>
      </CorrectApproach>

      <InteractiveDemo title="Simulate Bandwidth Changes">
        {({ isPlaying, tick }) => {
          const bandwidths = [15, 12, 8, 5, 2, 1, 3, 6, 10, 15, 20, 18];
          const active = isPlaying ? tick % bandwidths.length : 0;
          const bw = isPlaying ? bandwidths[active] : 15;

          const getRes = (b: number) => {
            if (b >= 15) return { res: "4K (2160p)", color: "text-violet-400", border: "border-violet-500/20 bg-violet-500/8" };
            if (b >= 8) return { res: "1080p", color: "text-blue-400", border: "border-blue-500/20 bg-blue-500/8" };
            if (b >= 4) return { res: "720p", color: "text-emerald-400", border: "border-emerald-500/20 bg-emerald-500/8" };
            return { res: "360p", color: "text-amber-400", border: "border-amber-500/20 bg-amber-500/8" };
          };

          const segments = bandwidths.slice(0, isPlaying ? active + 1 : 0);

          return (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Press play to watch the ABR algorithm react to fluctuating bandwidth. Each tick is one
                segment download.
              </p>
              <div className="space-y-1.5">
                {segments.map((segBw, i) => {
                  const r = getRes(segBw);
                  return (
                    <div
                      key={i}
                      className={cn(
                        "flex items-center gap-3 rounded-lg border px-3 py-2 transition-all",
                        i === segments.length - 1 ? `${r.border} ring-1 ring-current/10` : r.border
                      )}
                    >
                      <span className="text-[10px] font-mono text-muted-foreground w-8">Seg {i + 1}</span>
                      <span className={cn("text-xs font-mono font-bold w-12", r.color)}>{r.res}</span>
                      <div className="flex-1 h-2 bg-muted/20 rounded-full overflow-hidden">
                        <div
                          className={cn("h-full rounded-full transition-all", segBw >= 15 ? "bg-violet-500" : segBw >= 8 ? "bg-blue-500" : segBw >= 4 ? "bg-emerald-500" : "bg-amber-500")}
                          style={{ width: `${(segBw / 20) * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground w-14 text-right">{segBw} Mbps</span>
                    </div>
                  );
                })}
              </div>
              {isPlaying && active >= 5 && (
                <ConversationalCallout type="question">
                  Notice the quality dropped when bandwidth fell below 4 Mbps? The player chose
                  continuous playback at 360p over buffering at 1080p. Users prefer lower quality
                  to a loading spinner -- Netflix found that rebuffering increases abandonment by 3% per event.
                </ConversationalCallout>
              )}
            </div>
          );
        }}
      </InteractiveDemo>

      <ScaleSimulator
        title="Streaming Cost Simulator"
        min={1000}
        max={1000000}
        step={10000}
        unit="concurrent viewers"
        metrics={(viewers) => [
          { label: "Bandwidth (origin only)", value: Math.round(viewers * 5 / 1000), unit: "Gbps" },
          { label: "Bandwidth (with CDN)", value: Math.round(viewers * 5 / 1000 * 0.02), unit: "Gbps" },
          { label: "Monthly origin cost", value: Math.round(viewers * 5 * 0.085 / 1000 * 730), unit: "USD" },
          { label: "Monthly CDN cost", value: Math.round(viewers * 5 * 0.01 / 1000 * 730), unit: "USD" },
          { label: "CDN hit rate", value: 98, unit: "%" },
          { label: "Segments cached", value: Math.round(viewers * 0.15), unit: "" },
        ]}
      >
        {({ value }) => (
          <p className="text-xs text-muted-foreground text-center pt-2">
            At {value.toLocaleString()} concurrent viewers streaming 1080p (5 Mbps avg), a CDN reduces
            origin bandwidth by ~98%. {value >= 500000 ? "At this scale, CDN costs are still a fraction of what origin-only delivery would cost." : "Slide right to see how costs scale."}
          </p>
        )}
      </ScaleSimulator>

      <AhaMoment
        question="Why not just transcode on-the-fly when a user requests a specific quality?"
        answer={
          <p>
            Transcoding is extremely CPU-intensive -- encoding a 10-minute 1080p video takes minutes
            even on GPU hardware. If you transcode per request, a viral video would require thousands
            of simultaneous transcodes. Pre-transcoding once and caching forever is orders of magnitude
            cheaper. Netflix spends about 200,000 CPU-hours per day on transcoding -- imagine multiplying
            that by every viewer request.
          </p>
        }
      />

      <AhaMoment
        question="Why do HLS and DASH use HTTP instead of a custom streaming protocol?"
        answer={
          <p>
            HTTP works through every firewall, proxy, and CDN on the internet. Custom protocols (RTMP,
            RTSP) required special server software and couldn&apos;t leverage existing HTTP caching
            infrastructure. By treating video segments as regular HTTP resources, HLS/DASH get CDN
            caching, HTTP/2 multiplexing, and range requests for free. The entire internet&apos;s
            infrastructure was already optimized for HTTP delivery.
          </p>
        }
      />

      <ConversationalCallout type="tip">
        For live streaming, the pipeline is the same but with tighter latency constraints. Segments
        shrink to 1-2 seconds, the manifest updates continuously as new segments are produced, and
        the encode-segment-distribute cycle must complete within the segment duration. Low-Latency HLS
        (LL-HLS) achieves 2-4 second end-to-end latency. For sub-second latency (gaming, auctions),
        WebRTC is needed but sacrifices scalability.
      </ConversationalCallout>

      <ConversationalCallout type="warning">
        Video storage costs dominate at scale. A single 10-minute video transcoded to 4 quality
        levels with 4-second segments produces ~600 files. YouTube stores over 800 million videos.
        Aggressive cleanup policies (removing rarely-watched low-quality variants), tiered storage
        (hot/warm/cold), and per-title encoding optimization are essential for cost control.
      </ConversationalCallout>

      <ConversationalCallout type="question">
        How does YouTube handle a brand-new viral video that gets 10 million views in 5 minutes?
        The key is the CDN&apos;s cache fill strategy. The first few edge cache misses fetch from
        origin, but within seconds each edge location has a cached copy. The origin sees a brief
        spike of one request per edge per segment, not 10 million requests. This is why CDN
        architecture is a prerequisite for viral-scale content.
      </ConversationalCallout>

      <KeyTakeaway
        points={[
          "Transcode uploaded videos into multiple resolutions (bitrate ladder) and segment into 2-10 second chunks for seeking and adaptation.",
          "Adaptive bitrate streaming (HLS/DASH) lets the player switch quality per segment based on real-time bandwidth and buffer health.",
          "CDN edge caching eliminates cross-continent latency -- 98%+ of requests served from edge, origin barely touched for popular content.",
          "Pre-transcode once and cache forever; on-the-fly transcoding cannot scale. Netflix uses ~200K CPU-hours/day for encoding alone.",
          "The manifest file (.m3u8 or .mpd) is the index that makes everything work -- it lists every segment at every quality level.",
          "Two pipelines: upload processing (async, once) and playback delivery (real-time, millions of times). Separating them is the core architectural decision.",
          "Storage costs dominate -- use per-title encoding, tiered storage, and cleanup policies for rarely-watched content.",
        ]}
      />
    </div>
  );
}
