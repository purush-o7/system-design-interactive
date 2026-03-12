"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export type SimulationState = {
  isPlaying: boolean;
  tick: number;
  speed: number;
  step: number;
  maxSteps: number;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  reset: () => void;
  stepForward: () => void;
  stepBackward: () => void;
  setSpeed: (s: number) => void;
  setStep: (s: number) => void;
};

export function useSimulation(options?: {
  intervalMs?: number;
  maxSteps?: number;
  onTick?: (tick: number) => void;
  onReset?: () => void;
}): SimulationState {
  const { intervalMs = 1000, maxSteps = Infinity, onTick, onReset } = options ?? {};

  const [isPlaying, setIsPlaying] = useState(false);
  const [tick, setTick] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [step, setStep] = useState(0);

  const tickRef = useRef(tick);
  tickRef.current = tick;

  const onTickRef = useRef(onTick);
  onTickRef.current = onTick;

  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => {
      setTick((prev) => {
        const next = prev + 1;
        if (next >= maxSteps) {
          setIsPlaying(false);
          return maxSteps;
        }
        return next;
      });
      setStep((prev) => {
        const next = prev + 1;
        return maxSteps !== Infinity ? Math.min(next, maxSteps) : next;
      });
    }, intervalMs / speed);
    return () => clearInterval(id);
  }, [isPlaying, intervalMs, speed, maxSteps]);

  useEffect(() => {
    if (tick > 0) onTickRef.current?.(tick);
  }, [tick]);

  const play = useCallback(() => setIsPlaying(true), []);
  const pause = useCallback(() => setIsPlaying(false), []);
  const toggle = useCallback(() => setIsPlaying((p) => !p), []);

  const reset = useCallback(() => {
    setIsPlaying(false);
    setTick(0);
    setStep(0);
    onReset?.();
  }, [onReset]);

  const stepForward = useCallback(() => {
    setIsPlaying(false);
    setTick((p) => (maxSteps !== Infinity ? Math.min(p + 1, maxSteps) : p + 1));
    setStep((p) => (maxSteps !== Infinity ? Math.min(p + 1, maxSteps) : p + 1));
  }, [maxSteps]);

  const stepBackward = useCallback(() => {
    setIsPlaying(false);
    setTick((p) => Math.max(0, p - 1));
    setStep((p) => Math.max(0, p - 1));
  }, []);

  const handleSetSpeed = useCallback((s: number) => setSpeed(s), []);
  const handleSetStep = useCallback((s: number) => {
    setStep(s);
    setTick(s);
  }, []);

  return {
    isPlaying,
    tick,
    speed,
    step,
    maxSteps,
    play,
    pause,
    toggle,
    reset,
    stepForward,
    stepBackward,
    setSpeed: handleSetSpeed,
    setStep: handleSetStep,
  };
}
