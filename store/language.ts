"use client";

import { Language } from "@/types";
import { create } from "zustand";

interface LanguageStore {
  language: Language;
  setLanguage: (language: Language) => void;
}

export const useLanguage = create<LanguageStore>((set) => ({
  language: "english",
  setLanguage: (language: Language) => set({ language }),
}));
