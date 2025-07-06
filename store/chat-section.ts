"use client";

import { create } from "zustand";

type ChatSection = "all-chats" | "single-chat";

interface ChatSectionStore {
  chatSection: ChatSection;
  setChatSection: (language: ChatSection) => void;
}

export const useChatSection = create<ChatSectionStore>((set) => ({
  chatSection: "all-chats",
  setChatSection: (cs: ChatSection) => {
    set({ chatSection: cs });
  },
}));
