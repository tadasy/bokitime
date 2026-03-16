import { useEffect, useRef, useState } from "react";
import { useTimerStore } from "@/stores/timer-store";
import { formatTimer } from "@/lib/format";

export function StopwatchDisplay() {
  const status = useTimerStore((s) => s.status);
  const startTime = useTimerStore((s) => s.startTime);
  const elapsed = useTimerStore((s) => s.elapsed);
  const [display, setDisplay] = useState("00:00:00");
  const rafRef = useRef<number>(0);

  useEffect(() => {
    function tick() {
      let totalMs = elapsed;
      if (status === "running" && startTime) {
        totalMs += Date.now() - startTime;
      }
      setDisplay(formatTimer(totalMs));
      rafRef.current = requestAnimationFrame(tick);
    }

    if (status === "running") {
      rafRef.current = requestAnimationFrame(tick);
    } else {
      let totalMs = elapsed;
      if (startTime) {
        totalMs += Date.now() - startTime;
      }
      setDisplay(formatTimer(totalMs));
    }

    return () => cancelAnimationFrame(rafRef.current);
  }, [status, startTime, elapsed]);

  return (
    <div className="flex items-center justify-center py-8">
      <span className="font-mono text-6xl font-bold tracking-tight text-foreground">
        {display}
      </span>
    </div>
  );
}
