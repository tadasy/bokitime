import { useState, useMemo } from "react";
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subWeeks,
  subMonths,
  addWeeks,
  addMonths,
  eachDayOfInterval,
  format,
} from "date-fns";
import { ja } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStatsRange, useAllTimeStats } from "@/hooks/use-sessions";
import { formatDuration, formatDate } from "@/lib/format";

type Period = "weekly" | "monthly";

export default function StatsPage() {
  const [period, setPeriod] = useState<Period>("weekly");
  const [offset, setOffset] = useState(0);

  const now = new Date();
  const { start, end, label } = useMemo(() => {
    if (period === "weekly") {
      const ref = offset < 0 ? subWeeks(now, -offset) : offset > 0 ? addWeeks(now, offset) : now;
      const s = startOfWeek(ref, { weekStartsOn: 1 });
      const e = endOfWeek(s, { weekStartsOn: 1 });
      return {
        start: s,
        end: e,
        label: `${format(s, "M/d", { locale: ja })} - ${format(e, "M/d", { locale: ja })}`,
      };
    }
    const ref = offset === 0 ? now : offset < 0 ? subMonths(now, -offset) : addMonths(now, offset);
    const s = startOfMonth(ref);
    const e = endOfMonth(ref);
    return {
      start: s,
      end: e,
      label: format(ref, "yyyy年M月", { locale: ja }),
    };
  }, [period, offset]);

  const { data: stats } = useStatsRange(formatDate(start), formatDate(end));
  const { data: allTime } = useAllTimeStats();

  const totalSeconds = stats?.reduce((a, s) => a + s.totalSeconds, 0) ?? 0;

  const barData = useMemo(() => {
    const byDate = new Map(stats?.map((s) => [s.date, s.totalSeconds]) ?? []);
    return eachDayOfInterval({ start, end }).map((d) => {
      const key = formatDate(d);
      return {
        date: format(d, "M/d(E)", { locale: ja }),
        minutes: Math.round((byDate.get(key) ?? 0) / 60),
      };
    });
  }, [stats, start, end]);

  const prev = () => setOffset((o) => o - 1);
  const next = () => setOffset((o) => o + 1);

  return (
    <div className="mx-auto max-w-lg px-4 pb-24 pt-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">総勉強時間</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">
            {formatDuration(allTime?.totalSeconds ?? 0)}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            学習日数 {allTime?.dayCount ?? 0}日 ・ {allTime?.sessionCount ?? 0}回
          </p>
          <p className="text-sm text-muted-foreground">
            1回あたり平均{" "}
            {formatDuration(
              allTime && allTime.sessionCount > 0
                ? Math.round(allTime.totalSeconds / allTime.sessionCount)
                : 0,
            )}
          </p>
        </CardContent>
      </Card>

      <Tabs
        className="mt-4"
        value={period}
        onValueChange={(v) => {
          setPeriod(v as Period);
          setOffset(0);
        }}
      >
        <TabsList className="w-full">
          <TabsTrigger value="weekly" className="flex-1">
            週間
          </TabsTrigger>
          <TabsTrigger value="monthly" className="flex-1">
            月間
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="mt-4 flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={prev}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <span className="font-medium">{label}</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={next}
          disabled={offset >= 0}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      <Card className="mt-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">合計学習時間</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{formatDuration(totalSeconds)}</p>
        </CardContent>
      </Card>

      {barData.length > 0 && (
        <Card className="mt-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">日別学習時間（分）</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData}>
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} width={30} />
                <Tooltip
                  formatter={(value) => [`${value}分`, "学習時間"]}
                />
                <Bar dataKey="minutes" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
