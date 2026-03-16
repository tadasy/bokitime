import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getGoals, saveGoal, updateGoal, deleteGoal } from "@/lib/firestore";
import { useAuthStore } from "@/stores/auth-store";
import { Timestamp } from "firebase/firestore";
import type { StudyGoal } from "@/types/goal";

export function useGoals() {
  const uid = useAuthStore((s) => s.user?.uid);

  return useQuery({
    queryKey: ["goals", uid],
    queryFn: () => getGoals(uid!),
    enabled: !!uid,
  });
}

export function useSaveGoal() {
  const uid = useAuthStore((s) => s.user?.uid);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (goal: Omit<StudyGoal, "id" | "createdAt">) =>
      saveGoal(uid!, { ...goal, createdAt: Timestamp.now() }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["goals", uid] }),
  });
}

export function useUpdateGoal() {
  const uid = useAuthStore((s) => s.user?.uid);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ goalId, data }: { goalId: string; data: Partial<StudyGoal> }) =>
      updateGoal(uid!, goalId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["goals", uid] }),
  });
}

export function useDeleteGoal() {
  const uid = useAuthStore((s) => s.user?.uid);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (goalId: string) => deleteGoal(uid!, goalId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["goals", uid] }),
  });
}
