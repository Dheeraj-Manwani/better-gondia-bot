"use client";

import { ChatMessage } from "@/types";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface UseMessages {
  messages: ChatMessage[];
  setMessages: (messages: ChatMessage[]) => void;
}

const initMessage: ChatMessage = {
  id: 0,
  content:
    "Hi! I'm here to help you file complaints about civic issues in Gondia. Just describe the problem in your own words.",
  messageType: "bot",
  isRead: false,
  createdAt: new Date().toISOString(),
};

export const useMessages = create<UseMessages>()(
  devtools(
    (set) => ({
      messages: [initMessage],
      setMessages: (messages: ChatMessage[]) => set({ messages }),
    }),
    {
      name: "messages",
    }
  )
);
