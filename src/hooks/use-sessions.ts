import { useQuery } from "@tanstack/react-query";
import { getSessionsByDateRange, getDailyStats, getDailyStatsRange } from "@/lib/firestore";
import { useAuthStore } from "@/stores/auth-store";
import { formatDate } from "@/lib/format";

export function useTodaySessions() {
  const uid = useAuthStore((s) => s.user?.uid);
  const today = formatDate(new Date());

  return useQuery({
    queryKey: ["sessions", uid, today],
    queryFn: () => getSessionsByDateRange(uid!, today, today),
    enabled: !!uid,
  });
}

export function useTodayStats() {
  const uid = useAuthStore((s) => s.user?.uid);
  const today = formatDate(new Date());

  return useQuery({
    queryKey: ["dailyStats", uid, today],
    queryFn: () => getDailyStats(uid!, today),
    enabled: !!uid,
  });
}

export function useStatsRange(startDate: string, endDate: string) {
  const uid = useAuthStore((s) => s.user?.uid);

  return useQuery({
    queryKey: ["dailyStats", uid, startDate, endDate],
    queryFn: () => getDailyStatsRange(uid!, startDate, endDate),
    enabled: !!uid && !!startDate && !!endDate,
  });
}

export function useSessionsRange(startDate: string, endDate: string) {
  const uid = useAuthStore((s) => s.user?.uid);

  return useQuery({
    queryKey: ["sessions", uid, startDate, endDate],
    queryFn: () => getSessionsByDateRange(uid!, startDate, endDate),
    enabled: !!uid && !!startDate && !!endDate,
  });
}
