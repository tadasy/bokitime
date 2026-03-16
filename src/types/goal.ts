import type { Timestamp } from "firebase/firestore";

export interface StudyGoal {
  id: string;
  type: "daily" | "weekly";
  targetSeconds: number;
  isActive: boolean;
  createdAt: Timestamp;
}
