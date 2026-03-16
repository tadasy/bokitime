import { useState } from "react";
import { Flame, Target } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { doc, getDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { db } from "@/lib/firebase";
import { useAuthStore } from "@/stores/auth-store";
import { useGoals, useSaveGoal, useDeleteGoal } from "@/hooks/use-goals";
import { useTodayStats, useStatsRange } from "@/hooks/use-sessions";
import { formatDuration, formatDate } from "@/lib/format";
import { startOfWeek, endOfWeek } from "date-fns";
import type { UserProfile } from "@/types/user";

export default function GoalsPage() {
  const user = useAuthStore((s) => s.user);
  const { data: goals } = useGoals();
  const { data: todayStats } = useTodayStats();
  const saveGoal = useSaveGoal();
  const deleteGoalMut = useDeleteGoal();

  const now = new Date();
  const weekStart = formatDate(startOfWeek(now, { weekStartsOn: 1 }));
  const weekEnd = formatDate(endOfWeek(now, { weekStartsOn: 1 }));
  const { data: weekStats } = useStatsRange(weekStart, weekEnd);

  const { data: profile } = useQuery({
    queryKey: ["userProfile", user?.uid],
    queryFn: async () => {
      const snap = await getDoc(doc(db, "users", user!.uid));
      return snap.data() as UserProfile;
    },
    enabled: !!user,
  });

  const weekTotal = weekStats?.reduce((a, s) => a + s.totalSeconds, 0) ?? 0;
  const todayTotal = todayStats?.totalSeconds ?? 0;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [newGoalType, setNewGoalType] = useState<"daily" | "weekly">("daily");
  const [newGoalHours, setNewGoalHours] = useState("2");
  const [newGoalMinutes, setNewGoalMinutes] = useState("0");

  const handleSaveGoal = async () => {
    const seconds =
      parseInt(newGoalHours) * 3600 + parseInt(newGoalMinutes) * 60;
    if (seconds < 60) return;
    await saveGoal.mutateAsync({
      type: newGoalType,
      targetSeconds: seconds,
      isActive: true,
    });
    setDialogOpen(false);
  };

  const dailyGoal = goals?.find((g) => g.type === "daily" && g.isActive);
  const weeklyGoal = goals?.find((g) => g.type === "weekly" && g.isActive);

  return (
    <div className="mx-auto max-w-lg space-y-4 px-4 pb-24 pt-4">
      {/* Streak */}
      <Card>
        <CardContent className="flex items-center gap-4 pt-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-100">
            <Flame className="h-7 w-7 text-orange-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">
              {profile?.currentStreak ?? 0}日連続
            </p>
            <p className="text-sm text-muted-foreground">
              最長記録: {profile?.longestStreak ?? 0}日
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Daily Goal */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="h-4 w-4" />
            日次目標
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dailyGoal ? (
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span>{formatDuration(todayTotal)}</span>
                <span className="text-muted-foreground">
                  / {formatDuration(dailyGoal.targetSeconds)}
                </span>
              </div>
              <Progress
                value={Math.min(
                  (todayTotal / dailyGoal.targetSeconds) * 100,
                  100,
                )}
              />
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 text-xs text-destructive"
                onClick={() => deleteGoalMut.mutate(dailyGoal.id)}
              >
                削除
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              目標が設定されていません
            </p>
          )}
        </CardContent>
      </Card>

      {/* Weekly Goal */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="h-4 w-4" />
            週間目標
          </CardTitle>
        </CardHeader>
        <CardContent>
          {weeklyGoal ? (
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span>{formatDuration(weekTotal)}</span>
                <span className="text-muted-foreground">
                  / {formatDuration(weeklyGoal.targetSeconds)}
                </span>
              </div>
              <Progress
                value={Math.min(
                  (weekTotal / weeklyGoal.targetSeconds) * 100,
                  100,
                )}
              />
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 text-xs text-destructive"
                onClick={() => deleteGoalMut.mutate(weeklyGoal.id)}
              >
                削除
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              目標が設定されていません
            </p>
          )}
        </CardContent>
      </Card>

      {/* Add Goal */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          目標を追加
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新しい目標</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="mb-1 block text-sm font-medium">種類</label>
              <Select
                value={newGoalType}
                onValueChange={(v) =>
                  setNewGoalType(v as "daily" | "weekly")
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">日次</SelectItem>
                  <SelectItem value="weekly">週間</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="mb-1 block text-sm font-medium">時間</label>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={newGoalHours}
                  onChange={(e) => setNewGoalHours(e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="flex-1">
                <label className="mb-1 block text-sm font-medium">分</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={newGoalMinutes}
                  onChange={(e) => setNewGoalMinutes(e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>
            </div>
            <Button onClick={handleSaveGoal} className="w-full">
              保存
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
