import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  startOfMonth,
  endOfMonth,
  format,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isToday,
  subMonths,
  addMonths,
} from "date-fns";
import { ja } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Pencil, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useStatsRange, useSessionsRange } from "@/hooks/use-sessions";
import { useAuthStore } from "@/stores/auth-store";
import { Timestamp } from "firebase/firestore";
import { deleteSession, updateSession, saveSession } from "@/lib/firestore";
import { formatDuration, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { StudySession } from "@/types/session";

export default function HistoryPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [editingSession, setEditingSession] = useState<StudySession | null>(
    null,
  );
  const [editHours, setEditHours] = useState("0");
  const [editMinutes, setEditMinutes] = useState("0");
  const [editNote, setEditNote] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [addHours, setAddHours] = useState("0");
  const [addMinutes, setAddMinutes] = useState("30");
  const [addNote, setAddNote] = useState("");
  const uid = useAuthStore((s) => s.user?.uid);
  const queryClient = useQueryClient();

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const startStr = formatDate(monthStart);
  const endStr = formatDate(monthEnd);

  const { data: stats } = useStatsRange(startStr, endStr);
  const { data: sessions } = useSessionsRange(
    selectedDate ?? "",
    selectedDate ?? "",
  );

  const statsMap = new Map<string, number>();
  stats?.forEach((s) => statsMap.set(s.date, s.totalSeconds));

  const days = eachDayOfInterval({ start: calStart, end: calEnd });
  const maxSeconds = Math.max(...(stats?.map((s) => s.totalSeconds) ?? [0]), 1);

  const weekDays = ["月", "火", "水", "木", "金", "土", "日"];

  const handleDelete = async (sessionId: string) => {
    if (!uid) return;
    await deleteSession(uid, sessionId);
    queryClient.invalidateQueries({ queryKey: ["sessions"] });
    queryClient.invalidateQueries({ queryKey: ["dailyStats"] });
  };

  const openEdit = (session: StudySession) => {
    const h = Math.floor(session.durationSeconds / 3600);
    const m = Math.floor((session.durationSeconds % 3600) / 60);
    setEditHours(String(h));
    setEditMinutes(String(m));
    setEditNote(session.note ?? "");
    setEditingSession(session);
  };

  const handleAdd = async () => {
    if (!uid || !selectedDate) return;
    const durationSeconds = parseInt(addHours) * 3600 + parseInt(addMinutes) * 60;
    if (durationSeconds < 1) return;

    const d = new Date(selectedDate + "T12:00:00");
    await saveSession(uid, {
      durationSeconds,
      startedAt: Timestamp.fromDate(new Date(d.getTime() - durationSeconds * 1000)),
      endedAt: Timestamp.fromDate(d),
      date: selectedDate,
      isManual: true,
      note: addNote || undefined,
    });

    queryClient.invalidateQueries({ queryKey: ["sessions"] });
    queryClient.invalidateQueries({ queryKey: ["dailyStats"] });
    queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    setAddOpen(false);
    setAddHours("0");
    setAddMinutes("30");
    setAddNote("");
  };

  const handleEditSave = async () => {
    if (!uid || !editingSession) return;
    const durationSeconds =
      parseInt(editHours) * 3600 + parseInt(editMinutes) * 60;
    if (durationSeconds < 1) return;

    await updateSession(uid, editingSession.id, {
      durationSeconds,
      note: editNote || undefined,
    });

    queryClient.invalidateQueries({ queryKey: ["sessions"] });
    queryClient.invalidateQueries({ queryKey: ["dailyStats"] });
    setEditingSession(null);
  };

  return (
    <div className="mx-auto max-w-lg px-4 pb-24 pt-4">
      <div className="mb-4 flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-bold">
          {format(currentMonth, "yyyy年M月", { locale: ja })}
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
        {weekDays.map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const dateStr = formatDate(day);
          const seconds = statsMap.get(dateStr) ?? 0;
          const intensity = seconds > 0 ? Math.max(0.2, seconds / maxSeconds) : 0;
          const inMonth = isSameMonth(day, currentMonth);

          return (
            <button
              key={dateStr}
              onClick={() => setSelectedDate(dateStr)}
              className={cn(
                "flex aspect-square flex-col items-center justify-center rounded-md text-sm transition-colors",
                !inMonth && "opacity-30",
                isToday(day) && "ring-2 ring-primary",
                selectedDate === dateStr && "ring-2 ring-foreground",
              )}
              style={
                intensity > 0
                  ? {
                      backgroundColor: `oklch(0.55 0.2 264 / ${intensity})`,
                      color: intensity > 0.5 ? "white" : undefined,
                    }
                  : undefined
              }
            >
              <span>{day.getDate()}</span>
            </button>
          );
        })}
      </div>

      {selectedDate && (
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">
              {selectedDate} の記録
            </h3>
            <Button
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={() => setAddOpen(true)}
            >
              <Plus className="h-4 w-4" />
              追加
            </Button>
          </div>
          {sessions && sessions.length > 0 ? (
            sessions.map((s) => (
              <Card key={s.id}>
                <CardContent className="flex items-center justify-between py-3">
                  <div>
                    <span className="text-sm font-medium">
                      {formatDuration(s.durationSeconds)}
                    </span>
                    {s.note && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {s.note}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openEdit(s)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(s.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">記録なし</p>
          )}
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedDate} に記録を追加</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="mb-1 block text-sm font-medium">時間</label>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={addHours}
                  onChange={(e) => setAddHours(e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="flex-1">
                <label className="mb-1 block text-sm font-medium">分</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={addMinutes}
                  onChange={(e) => setAddMinutes(e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">メモ（任意）</label>
              <input
                type="text"
                value={addNote}
                onChange={(e) => setAddNote(e.target.value)}
                placeholder="学習内容のメモ"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
            <Button onClick={handleAdd} className="w-full">
              記録する
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingSession}
        onOpenChange={(open) => {
          if (!open) setEditingSession(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>セッションを編集</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="mb-1 block text-sm font-medium">時間</label>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={editHours}
                  onChange={(e) => setEditHours(e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="flex-1">
                <label className="mb-1 block text-sm font-medium">分</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={editMinutes}
                  onChange={(e) => setEditMinutes(e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                メモ（任意）
              </label>
              <input
                type="text"
                value={editNote}
                onChange={(e) => setEditNote(e.target.value)}
                placeholder="学習内容のメモ"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
            <Button onClick={handleEditSave} className="w-full">
              保存
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
