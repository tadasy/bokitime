import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StopwatchDisplay } from "@/components/timer/stopwatch-display";
import { TimerControls } from "@/components/timer/timer-controls";
import { ManualEntryDialog } from "@/components/timer/manual-entry-dialog";
import { useTodayStats } from "@/hooks/use-sessions";
import { useGoals } from "@/hooks/use-goals";
import { formatDuration } from "@/lib/format";

export default function TimerPage() {
  const { data: todayStats } = useTodayStats();
  const { data: goals } = useGoals();

  const dailyGoal = goals?.find((g) => g.type === "daily" && g.isActive);
  const todayTotal = todayStats?.totalSeconds ?? 0;
  const goalProgress = dailyGoal
    ? Math.min((todayTotal / dailyGoal.targetSeconds) * 100, 100)
    : 0;

  return (
    <div className="mx-auto max-w-lg px-4 pb-24 pt-4">
      <StopwatchDisplay />
      <TimerControls />

      <div className="mt-4 flex justify-center">
        <ManualEntryDialog />
      </div>

      <Card className="mt-8">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">今日の学習</span>
            <span className="text-lg font-bold">
              {formatDuration(todayTotal)}
            </span>
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {todayStats?.sessionCount ?? 0}セッション
          </div>
          {dailyGoal && (
            <div className="mt-4">
              <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                <span>日次目標</span>
                <span>{formatDuration(dailyGoal.targetSeconds)}</span>
              </div>
              <Progress value={goalProgress} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
