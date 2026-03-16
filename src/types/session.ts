import type { Timestamp } from "firebase/firestore";

export interface StudySession {
  id: string;
  durationSeconds: number;
  startedAt: Timestamp;
  endedAt: Timestamp;
  date: string; // "2026-03-15"
  isManual: boolean;
  note?: string;
}
