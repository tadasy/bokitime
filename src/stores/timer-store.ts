import { create } from "zustand";

export type TimerStatus = "idle" | "running" | "paused";

interface TimerState {
  status: TimerStatus;
  startTime: number | null;
  elapsed: number; // accumulated ms (not counting current running segment)
  pausedAt: number | null;

  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => { durationSeconds: number; startTime: number; endTime: number };
  reset: () => void;
}

export const useTimerStore = create<TimerState>((set, get) => ({
  status: "idle",
  startTime: null,
  elapsed: 0,
  pausedAt: null,

  start: () =>
    set({
      status: "running",
      startTime: Date.now(),
      elapsed: 0,
      pausedAt: null,
    }),

  pause: () => {
    const { startTime, elapsed } = get();
    const now = Date.now();
    const currentSegment = startTime ? now - startTime : 0;
    set({
      status: "paused",
      elapsed: elapsed + currentSegment,
      pausedAt: now,
      startTime: null,
    });
  },

  resume: () =>
    set({
      status: "running",
      startTime: Date.now(),
      pausedAt: null,
    }),

  stop: () => {
    const { startTime, elapsed, status } = get();
    const now = Date.now();
    let totalMs = elapsed;
    if (status === "running" && startTime) {
      totalMs += now - startTime;
    }
    const result = {
      durationSeconds: Math.round(totalMs / 1000),
      startTime: now - totalMs,
      endTime: now,
    };
    set({
      status: "idle",
      startTime: null,
      elapsed: 0,
      pausedAt: null,
    });
    return result;
  },

  reset: () =>
    set({
      status: "idle",
      startTime: null,
      elapsed: 0,
      pausedAt: null,
    }),
}));
