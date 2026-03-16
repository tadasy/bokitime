import { useQueryClient } from "@tanstack/react-query";
import { Timestamp } from "firebase/firestore";
import { Play, Pause, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTimerStore } from "@/stores/timer-store";
import { useAuthStore } from "@/stores/auth-store";
import { saveSession } from "@/lib/firestore";
import { formatDate } from "@/lib/format";

export function TimerControls() {
  const status = useTimerStore((s) => s.status);
  const start = useTimerStore((s) => s.start);
  const pause = useTimerStore((s) => s.pause);
  const resume = useTimerStore((s) => s.resume);
  const stop = useTimerStore((s) => s.stop);
  const uid = useAuthStore((s) => s.user?.uid);
  const queryClient = useQueryClient();

  const handleStop = async () => {
    if (!uid) return;
    const result = stop();
    if (result.durationSeconds < 1) return;

    await saveSession(uid, {
      durationSeconds: result.durationSeconds,
      startedAt: Timestamp.fromMillis(result.startTime),
      endedAt: Timestamp.fromMillis(result.endTime),
      date: formatDate(new Date()),
      isManual: false,
    });

    queryClient.invalidateQueries({ queryKey: ["sessions"] });
    queryClient.invalidateQueries({ queryKey: ["dailyStats"] });
    queryClient.invalidateQueries({ queryKey: ["userProfile"] });
  };

  return (
    <div className="flex items-center justify-center gap-4 py-6">
      {status === "idle" && (
        <Button
          size="lg"
          className="h-16 w-16 rounded-full"
          onClick={start}
        >
          <Play className="h-7 w-7" />
        </Button>
      )}
      {status === "running" && (
        <>
          <Button
            size="lg"
            variant="outline"
            className="h-16 w-16 rounded-full"
            onClick={pause}
          >
            <Pause className="h-7 w-7" />
          </Button>
          <Button
            size="lg"
            variant="destructive"
            className="h-16 w-16 rounded-full"
            onClick={handleStop}
          >
            <Square className="h-6 w-6" />
          </Button>
        </>
      )}
      {status === "paused" && (
        <>
          <Button
            size="lg"
            className="h-16 w-16 rounded-full"
            onClick={resume}
          >
            <Play className="h-7 w-7" />
          </Button>
          <Button
            size="lg"
            variant="destructive"
            className="h-16 w-16 rounded-full"
            onClick={handleStop}
          >
            <Square className="h-6 w-6" />
          </Button>
        </>
      )}
    </div>
  );
}
