"use client";

import { Language } from "@/types";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface LanguageStore {
  language: Language;
  setLanguage: (language: Language) => void;
}

export const useLanguage = create<LanguageStore>()(
  devtools(
    (set) => ({
      language: "english",
      setLanguage: (language: Language) => set({ language }),
    }),
    {
      name: "language",
    }
  )
);
