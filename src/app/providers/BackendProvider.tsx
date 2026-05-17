// Single source of truth for backend-derived state: profile, biometrics,
// today's nutrition, DASH plate fill, and the chat thread.
//
// Dashboard, MealTracker, and any future page reads from this context — so
// when MealTracker logs a meal, the Dashboard's calorie ring updates too.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { api } from "../../lib/api";
import type {
  ChatMessage,
  FullState,
  MealLogRequest,
  NutritionToday,
  ProfilePatch,
} from "../../lib/types";

interface BackendContextValue {
  state: FullState | null;
  today: NutritionToday | null;
  loading: boolean;
  error: string | null;
  chat: ChatMessage[];
  chatBusy: boolean;
  language: "en" | "es";
  setLanguage: (lang: "en" | "es") => void;
  refresh: () => Promise<void>;
  updateProfile: (patch: ProfilePatch) => Promise<void>;
  logMeal: (meal: MealLogRequest) => Promise<NutritionToday>;
  sendChat: (message: string) => Promise<void>;
  resetChat: () => Promise<void>;
}

const BackendContext = createContext<BackendContextValue | null>(null);

const INITIAL_GREETING: ChatMessage = {
  role: "assistant",
  text:
    "Hi! I'm your HeartHealth nutrition advisor. I can see your live biometrics and what you've logged today — ask me anything about meals, DASH targets, or how to adapt your diet for your life stage.",
};

export function BackendProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<FullState | null>(null);
  const [today, setToday] = useState<NutritionToday | null>(null);
  const [chat, setChat] = useState<ChatMessage[]>([INITIAL_GREETING]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chatBusy, setChatBusy] = useState(false);
  const [language, setLanguage] = useState<"en" | "es">("en");

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const [s, t] = await Promise.all([api.getProfile(), api.getToday()]);
      setState(s);
      setToday(t);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const updateProfile = useCallback(
    async (patch: ProfilePatch) => {
      const next = await api.updateProfile(patch);
      setState(next);
    },
    [],
  );

  const logMeal = useCallback(
    async (meal: MealLogRequest) => {
      const next = await api.logMeal(meal);
      setToday(next);
      // Daily nutrition aggregates also live on the profile; refetch to stay
      // perfectly aligned with the Dashboard widgets that read from state.
      try {
        const s = await api.getProfile();
        setState(s);
      } catch {
        // non-fatal
      }
      return next;
    },
    [],
  );

  const sendChat = useCallback(
    async (message: string) => {
      const userMsg: ChatMessage = { role: "user", text: message };
      setChat((prev) => [...prev, userMsg]);
      setChatBusy(true);
      try {
        const res = await api.sendChat(message, language);
        const assistantMsg: ChatMessage = { role: "assistant", text: res.reply };
        setChat((prev) => [...prev, assistantMsg]);
      } catch (e) {
        const assistantMsg: ChatMessage = {
          role: "assistant",
          text: `Sorry — I couldn't reach the advisor: ${(e as Error).message}`,
        };
        setChat((prev) => [...prev, assistantMsg]);
      } finally {
        setChatBusy(false);
      }
    },
    [language],
  );

  const resetChat = useCallback(async () => {
    try {
      await api.resetChat();
    } catch {
      // non-fatal
    }
    setChat([INITIAL_GREETING]);
  }, []);

  const value = useMemo<BackendContextValue>(
    () => ({
      state,
      today,
      loading,
      error,
      chat,
      chatBusy,
      language,
      setLanguage,
      refresh,
      updateProfile,
      logMeal,
      sendChat,
      resetChat,
    }),
    [
      state,
      today,
      loading,
      error,
      chat,
      chatBusy,
      language,
      refresh,
      updateProfile,
      logMeal,
      sendChat,
      resetChat,
    ],
  );

  return <BackendContext.Provider value={value}>{children}</BackendContext.Provider>;
}

export function useBackend() {
  const ctx = useContext(BackendContext);
  if (!ctx) throw new Error("useBackend must be used inside <BackendProvider>");
  return ctx;
}

/** Convenience selector hooks (cleaner ergonomics for consumers). */
export function useNutrition() {
  const { today, refresh, logMeal } = useBackend();
  return { today, refresh, logMeal };
}

export function useProfile() {
  const { state, updateProfile, refresh } = useBackend();
  return { state, updateProfile, refresh };
}

export function useChat() {
  const { chat, chatBusy, sendChat, resetChat, language, setLanguage } = useBackend();
  return { chat, chatBusy, sendChat, resetChat, language, setLanguage };
}
