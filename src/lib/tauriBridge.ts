// Tauri invoke bridge - calls Rust backend commands
// Falls back to no-op in browser dev mode

import { invoke } from "@tauri-apps/api/core";

export interface UserContextData {
  projectName: string;
  vendorName: string;
  painPoint: string;
  createdAt: string;
}

export interface DailyProgressData {
  dayNum: number;
  readingCompleted: boolean;
  discussionCompleted: boolean;
  reflectionCompleted: boolean;
  streakDays: number;
  completedAt: string | null;
}

export interface TermRecordData {
  termId: string;
  termName: string;
  viewCount: number;
  bookmarked: boolean;
  mastered: boolean;
}

export interface ChatMessageData {
  id: string;
  dayNum: number;
  role: string;
  content: string;
  createdAt: string;
}

export async function initDatabase(): Promise<void> {
  try {
    await invoke("init_database");
  } catch (e) {
    console.warn("[tauriBridge] init_database failed, running in browser mode:", e);
  }
}

export async function getUserContext(): Promise<UserContextData | null> {
  try {
    const result = await invoke<string | null>("get_user_context");
    if (!result) return null;
    return JSON.parse(result) as UserContextData;
  } catch {
    return null;
  }
}

export async function saveUserContext(
  projectName: string,
  vendorName: string,
  painPoint: string
): Promise<void> {
  try {
    await invoke("save_user_context", { projectName, vendorName, painPoint });
  } catch (e) {
    console.warn("[tauriBridge] save_user_context failed:", e);
  }
}

export async function getDailyProgress(dayNum: number): Promise<DailyProgressData | null> {
  try {
    const result = await invoke<string | null>("get_daily_progress", { dayNum });
    if (!result) return null;
    return JSON.parse(result) as DailyProgressData;
  } catch {
    return null;
  }
}

export async function getAllDailyProgress(): Promise<DailyProgressData[]> {
  try {
    const result = await invoke<string>("get_all_daily_progress");
    return JSON.parse(result) as DailyProgressData[];
  } catch {
    return [];
  }
}

export async function updateDailyProgress(
  dayNum: number,
  readingCompleted: boolean,
  discussionCompleted: boolean,
  reflectionCompleted: boolean
): Promise<void> {
  try {
    await invoke("update_daily_progress", {
      dayNum,
      readingCompleted,
      discussionCompleted,
      reflectionCompleted,
    });
  } catch (e) {
    console.warn("[tauriBridge] update_daily_progress failed:", e);
  }
}

export async function saveTermRecord(
  termId: string,
  termName: string,
  viewCount: number,
  bookmarked: boolean,
  mastered: boolean
): Promise<void> {
  try {
    await invoke("save_term_record", { termId, termName, viewCount, bookmarked, mastered });
  } catch (e) {
    console.warn("[tauriBridge] save_term_record failed:", e);
  }
}

export async function getTermRecords(): Promise<TermRecordData[]> {
  try {
    const result = await invoke<string>("get_term_records");
    return JSON.parse(result) as TermRecordData[];
  } catch {
    return [];
  }
}

export async function addChatMessage(
  dayNum: number,
  role: string,
  content: string
): Promise<void> {
  try {
    await invoke("add_chat_message", { dayNum, role, content });
  } catch (e) {
    console.warn("[tauriBridge] add_chat_message failed:", e);
  }
}

export async function getChatHistory(dayNum: number): Promise<ChatMessageData[]> {
  try {
    const result = await invoke<string>("get_chat_history", { dayNum });
    return JSON.parse(result) as ChatMessageData[];
  } catch {
    return [];
  }
}
