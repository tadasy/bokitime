import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  setDoc,
  query,
  where,
  orderBy,
  writeBatch,
  Timestamp,
  increment,
} from "firebase/firestore";
import { db } from "./firebase";
import { formatDate } from "./format";
import type { StudySession } from "@/types/session";
import type { StudyGoal } from "@/types/goal";
import type { UserProfile } from "@/types/user";
import type { DailyStats } from "@/types/stats";

// --- User Profile ---

export async function getOrCreateUserProfile(
  uid: string,
  data: { displayName: string; email: string; photoURL: string | null },
): Promise<UserProfile> {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    return snap.data() as UserProfile;
  }
  const profile: UserProfile = {
    ...data,
    createdAt: Timestamp.now(),
    currentStreak: 0,
    longestStreak: 0,
    lastStudyDate: "",
  };
  await setDoc(ref, profile);
  return profile;
}

// --- Sessions ---

function sessionsRef(uid: string) {
  return collection(db, "users", uid, "sessions");
}

export async function saveSession(
  uid: string,
  session: Omit<StudySession, "id">,
): Promise<string> {
  const batch = writeBatch(db);

  // Add session (strip undefined fields — Firestore rejects them)
  const sessionRef = doc(sessionsRef(uid));
  const sessionData = Object.fromEntries(
    Object.entries(session).filter(([, v]) => v !== undefined),
  );
  batch.set(sessionRef, sessionData);

  // Update daily stats
  const statsRef = doc(db, "users", uid, "dailyStats", session.date);
  const statsSnap = await getDoc(statsRef);
  if (statsSnap.exists()) {
    batch.update(statsRef, {
      totalSeconds: increment(session.durationSeconds),
      sessionCount: increment(1),
    });
  } else {
    const stats: DailyStats = {
      date: session.date,
      totalSeconds: session.durationSeconds,
      sessionCount: 1,
    };
    batch.set(statsRef, stats);
  }

  // Update streak
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    const userData = userSnap.data() as UserProfile;
    const today = session.date;
    const yesterday = formatDate(
      new Date(new Date(today).getTime() - 86400000),
    );

    if (userData.lastStudyDate !== today) {
      let newStreak: number;
      if (userData.lastStudyDate === yesterday) {
        newStreak = userData.currentStreak + 1;
      } else {
        newStreak = 1;
      }
      batch.update(userRef, {
        lastStudyDate: today,
        currentStreak: newStreak,
        longestStreak: Math.max(newStreak, userData.longestStreak),
      });
    }
  }

  await batch.commit();
  return sessionRef.id;
}

export async function updateSession(
  uid: string,
  sessionId: string,
  data: Partial<Omit<StudySession, "id">>,
): Promise<void> {
  const clean = Object.fromEntries(
    Object.entries(data).filter(([, v]) => v !== undefined),
  );
  await updateDoc(doc(sessionsRef(uid), sessionId), clean);
}

export async function getSessionsByDateRange(
  uid: string,
  startDate: string,
  endDate: string,
): Promise<StudySession[]> {
  const q = query(
    sessionsRef(uid),
    where("date", ">=", startDate),
    where("date", "<=", endDate),
    orderBy("date", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as StudySession);
}

export async function deleteSession(
  uid: string,
  sessionId: string,
): Promise<void> {
  await deleteDoc(doc(sessionsRef(uid), sessionId));
}

// --- Daily Stats ---

export async function getDailyStats(
  uid: string,
  date: string,
): Promise<DailyStats | null> {
  const snap = await getDoc(doc(db, "users", uid, "dailyStats", date));
  return snap.exists() ? (snap.data() as DailyStats) : null;
}

export async function getDailyStatsRange(
  uid: string,
  startDate: string,
  endDate: string,
): Promise<DailyStats[]> {
  const q = query(
    collection(db, "users", uid, "dailyStats"),
    where("date", ">=", startDate),
    where("date", "<=", endDate),
    orderBy("date", "asc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as DailyStats);
}

// --- Goals ---

function goalsRef(uid: string) {
  return collection(db, "users", uid, "goals");
}

export async function getGoals(uid: string): Promise<StudyGoal[]> {
  const snap = await getDocs(goalsRef(uid));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as StudyGoal);
}

export async function saveGoal(
  uid: string,
  goal: Omit<StudyGoal, "id">,
): Promise<string> {
  const ref = await addDoc(goalsRef(uid), goal);
  return ref.id;
}

export async function updateGoal(
  uid: string,
  goalId: string,
  data: Partial<StudyGoal>,
): Promise<void> {
  await updateDoc(doc(goalsRef(uid), goalId), data);
}

export async function deleteGoal(
  uid: string,
  goalId: string,
): Promise<void> {
  await deleteDoc(doc(goalsRef(uid), goalId));
}
