"use client";

import { useEffect, useState, useMemo } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { useTheme } from "next-themes";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import type { ISourceOptions } from "@tsparticles/engine";

let enginePromise: Promise<void> | null = null;
function getEngine() {
  if (!enginePromise) {
    enginePromise = initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    });
  }
  return enginePromise;
}

interface ParticleBackgroundProps {
  variant?: "network" | "dots";
  density?: "low" | "medium" | "high";
  interactive?: boolean;
  className?: string;
}

const densityMap = { low: 20, medium: 40, high: 80 };

export function ParticleBackground({
  variant = "network",
  density = "medium",
  interactive = true,
  className,
}: ParticleBackgroundProps) {
  const [ready, setReady] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const { resolvedTheme } = useTheme();
  const isMobile = useIsMobile();

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    getEngine().then(() => setReady(true));
  }, []);

  const particleCount = isMobile
    ? Math.max(8, Math.floor(densityMap[density] / 4))
    : densityMap[density];

  const isDark = resolvedTheme === "dark";
  const particleColor = isDark ? "#ffffff" : "#000000";
  const particleOpacity = isDark ? 0.15 : 0.08;
  const linkOpacity = isDark ? 0.08 : 0.05;

  const options: ISourceOptions = useMemo(
    () => ({
      fpsLimit: 60,
      particles: {
        number: { value: particleCount, density: { enable: true } },
        color: { value: particleColor },
        opacity: { value: particleOpacity },
        size: { value: { min: 1, max: 3 } },
        move: {
          enable: true,
          speed: 0.5,
          direction: "none" as const,
          outModes: { default: "bounce" as const },
        },
        links:
          variant === "network"
            ? {
                enable: true,
                distance: 150,
                color: particleColor,
                opacity: linkOpacity,
                width: 1,
              }
            : { enable: false },
      },
      interactivity:
        interactive && !isMobile
          ? {
              events: {
                onHover: { enable: true, mode: "repulse" as const },
              },
              modes: {
                repulse: { distance: 80, duration: 0.4 },
              },
            }
          : undefined,
      detectRetina: true,
    }),
    [particleCount, particleColor, particleOpacity, linkOpacity, variant, interactive, isMobile]
  );

  if (reducedMotion || !ready) return null;

  return (
    <div
      className={cn(
        "absolute inset-0 z-0 pointer-events-none overflow-hidden",
        className
      )}
    >
      <Particles options={options} className="absolute inset-0" />
    </div>
  );
}
