import { useState, useEffect } from "react";
import * as bridge from "./tauriBridge";

export interface UserContext {
  projectName: string;
  vendorName: string;
  painPoint: string;
  createdAt: string;
}

export interface Term {
  id: string;
  term: string;
  english: string;
  definition: string;
  example: string;
  relatedTerms: string[];
  viewCount: number;
  bookmarked: boolean;
  mastered: boolean;
}

export interface DailyContent {
  dayNum: number;
  readingTitle: string;
  readingContent: string;
  discussionQuestions: string[];
  reflectionPrompts: string[];
  terms: Term[];
}

export interface DailyProgress {
  dayNum: number;
  readingCompleted: boolean;
  discussionCompleted: boolean;
  reflectionCompleted: boolean;
  streakDays: number;
  completedAt: string | null;
}

export interface ChatMessage {
  id: string;
  dayNum: number;
  role: "user" | "mentor";
  content: string;
  createdAt: string;
}

let globalState = {
  userContext: null as UserContext | null,
  currentDay: 1,
  dailyProgress: [] as DailyProgress[],
  chatHistory: [] as ChatMessage[],
  terms: [] as Term[],
  initialized: false,
};

let listeners: Array<() => void> = [];

function setState(newState: Partial<typeof globalState>) {
  globalState = { ...globalState, ...newState };
  listeners.forEach((l) => l());
}

function isDayUnlocked(dayNum: number): boolean {
  if (dayNum === 1) return true;
  const prevProgress = globalState.dailyProgress.find((p) => p.dayNum === dayNum - 1);
  if (!prevProgress) return false;
  return prevProgress.readingCompleted && prevProgress.discussionCompleted && prevProgress.reflectionCompleted;
}

export async function initializeStore(): Promise<void> {
  if (globalState.initialized) return;

  await bridge.initDatabase();

  const [userCtx, allProgress, termRecords] = await Promise.all([
    bridge.getUserContext(),
    bridge.getAllDailyProgress(),
    bridge.getTermRecords(),
  ]);

  const terms: Term[] = termRecords.map((r) => ({
    id: r.termId,
    term: r.termName,
    english: "",
    definition: "",
    example: "",
    relatedTerms: [],
    viewCount: r.viewCount,
    bookmarked: r.bookmarked,
    mastered: r.mastered,
  }));

  let currentDay = 1;
  for (const p of allProgress) {
    if (p.readingCompleted && p.discussionCompleted && p.reflectionCompleted) {
      if (p.dayNum >= currentDay) {
        currentDay = p.dayNum + 1;
      }
    }
  }

  setState({
    userContext: userCtx,
    dailyProgress: allProgress,
    terms,
    currentDay,
    initialized: true,
  });
}

export function useAppStore() {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const listener = () => forceUpdate((n) => n + 1);
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }, []);

  return {
    ...globalState,
    isDayUnlocked,
    setUserContext: async (ctx: UserContext) => {
      setState({ userContext: ctx });
      await bridge.saveUserContext(ctx.projectName, ctx.vendorName, ctx.painPoint);
    },
    setCurrentDay: (day: number) => {
      if (isDayUnlocked(day)) {
        setState({ currentDay: day });
      }
    },
    updateProgress: async (progress: DailyProgress) => {
      const idx = globalState.dailyProgress.findIndex(
        (p) => p.dayNum === progress.dayNum
      );
      const newProgress = [...globalState.dailyProgress];
      if (idx >= 0) {
        newProgress[idx] = progress;
      } else {
        newProgress.push(progress);
      }

      let streak = 0;
      for (let d = 1; d <= progress.dayNum; d++) {
        const p = newProgress.find((x) => x.dayNum === d);
        if (p && p.readingCompleted && p.discussionCompleted && p.reflectionCompleted) {
          streak = d;
        } else {
          break;
        }
      }
      progress.streakDays = streak;

      setState({ dailyProgress: newProgress });
      await bridge.updateDailyProgress(
        progress.dayNum,
        progress.readingCompleted,
        progress.discussionCompleted,
        progress.reflectionCompleted
      );
    },
    addChatMessage: async (msg: ChatMessage) => {
      setState({ chatHistory: [...globalState.chatHistory, msg] });
      await bridge.addChatMessage(msg.dayNum, msg.role, msg.content);
    },
    loadChatHistory: async (dayNum: number) => {
      const messages = await bridge.getChatHistory(dayNum);
      const existing = globalState.chatHistory.filter((m) => m.dayNum !== dayNum);
      const mapped: ChatMessage[] = messages.map((m) => ({
        id: m.id,
        dayNum: m.dayNum,
        role: m.role as "user" | "mentor",
        content: m.content,
        createdAt: m.createdAt,
      }));
      setState({ chatHistory: [...existing, ...mapped] });
    },
    updateTerm: async (term: Term) => {
      const idx = globalState.terms.findIndex((t) => t.id === term.id);
      const newTerms = [...globalState.terms];
      if (idx >= 0) {
        newTerms[idx] = term;
      } else {
        newTerms.push(term);
      }
      setState({ terms: newTerms });
      await bridge.saveTermRecord(
        term.id,
        term.term,
        term.viewCount,
        term.bookmarked,
        term.mastered
      );
    },
  };
}
