import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Timestamp } from "firebase/firestore";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/stores/auth-store";
import { saveSession } from "@/lib/firestore";
import { formatDate } from "@/lib/format";

export function ManualEntryDialog() {
  const [open, setOpen] = useState(false);
  const [hours, setHours] = useState("0");
  const [minutes, setMinutes] = useState("30");
  const [date, setDate] = useState(() => formatDate(new Date()));
  const [note, setNote] = useState("");
  const uid = useAuthStore((s) => s.user?.uid);
  const queryClient = useQueryClient();

  const handleSubmit = async () => {
    if (!uid) return;
    const durationSeconds = parseInt(hours) * 3600 + parseInt(minutes) * 60;
    if (durationSeconds < 1) return;

    const selectedDate = new Date(date + "T12:00:00");
    await saveSession(uid, {
      durationSeconds,
      startedAt: Timestamp.fromDate(
        new Date(selectedDate.getTime() - durationSeconds * 1000),
      ),
      endedAt: Timestamp.fromDate(selectedDate),
      date,
      isManual: true,
      note: note || undefined,
    });

    queryClient.invalidateQueries({ queryKey: ["sessions"] });
    queryClient.invalidateQueries({ queryKey: ["dailyStats"] });
    queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    setOpen(false);
    setHours("0");
    setMinutes("30");
    setDate(formatDate(new Date()));
    setNote("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center justify-center gap-1 rounded-md border bg-background px-3 py-1.5 text-sm font-medium hover:bg-accent">
        <Plus className="h-4 w-4" />
        手動入力
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>学習時間を手動で記録</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <label className="mb-1 block text-sm font-medium">日付</label>
            <input
              type="date"
              value={date}
              max={formatDate(new Date())}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium">時間</label>
              <input
                type="number"
                min="0"
                max="23"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium">分</label>
              <input
                type="number"
                min="0"
                max="59"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
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
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="学習内容のメモ"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
          </div>
          <Button onClick={handleSubmit} className="w-full">
            記録する
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
