import type { Timestamp } from "firebase/firestore";

export interface UserProfile {
  displayName: string;
  email: string;
  photoURL: string | null;
  createdAt: Timestamp;
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string; // "2026-03-15"
}
