import { Flame } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthStore } from "@/stores/auth-store";
import type { UserProfile } from "@/types/user";

export function Header() {
  const user = useAuthStore((s) => s.user);

  const { data: profile } = useQuery({
    queryKey: ["userProfile", user?.uid],
    queryFn: async () => {
      const snap = await getDoc(doc(db, "users", user!.uid));
      return snap.data() as UserProfile;
    },
    enabled: !!user,
  });

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 pt-[env(safe-area-inset-top)] backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-12 max-w-lg items-center justify-between px-4">
        <h1 className="text-lg font-bold text-foreground">BokiTime</h1>
        {profile && profile.currentStreak > 0 && (
          <div className="flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-0.5 text-sm font-medium text-orange-700">
            <Flame className="h-4 w-4" />
            <span>{profile.currentStreak}日</span>
          </div>
        )}
      </div>
    </header>
  );
}
