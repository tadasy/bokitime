import { useEffect } from "react";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { getOrCreateUserProfile } from "@/lib/firestore";
import { useAuthStore } from "@/stores/auth-store";

export function useAuthListener() {
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          await getOrCreateUserProfile(user.uid, {
            displayName: user.displayName ?? "",
            email: user.email ?? "",
            photoURL: user.photoURL,
          });
        } catch (e) {
          console.error("Failed to create/get user profile:", e);
        }
      }
      setUser(user);
    });
    return unsubscribe;
  }, [setUser]);
}

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);

  const login = () => signInWithPopup(auth, googleProvider);
  const logout = () => signOut(auth);

  return { user, loading, login, logout };
}
