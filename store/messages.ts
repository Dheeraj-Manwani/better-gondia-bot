"use client";

import { ChatMessage } from "@/types";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface UseMessages {
  messages: ChatMessage[];
  setMessages: (messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  addMessages: (newMessages: ChatMessage[]) => void;
  clearMessages: () => void;
  resetToInitial: () => void;
  updateMessage: (id: number, updates: Partial<ChatMessage>) => void;
  removeMessage: (id: number) => void;
}

const initMessage: ChatMessage = {
  id: 0,
  content:
    "Hi! I'm here to help you file complaints about civic issues in Gondia. Just describe the problem in your own words.",
  messageType: "bot",
  isRead: false,
  createdAt: new Date().toISOString(),
};

export const useMessages = create<UseMessages>()((set, get) => ({
  messages: [initMessage],

  setMessages: (messages: ChatMessage[]) => set({ messages }),

  addMessage: (message: ChatMessage) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  addMessages: (newMessages: ChatMessage[]) =>
    set((state) => ({
      messages: [...state.messages, ...newMessages],
    })),

  clearMessages: () => set({ messages: [] }),
  resetToInitial: () => set({ messages: [initMessage] }),

  updateMessage: (id: number, updates: Partial<ChatMessage>) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === id ? { ...msg, ...updates } : msg
      ),
    })),

  removeMessage: (id: number) =>
    set((state) => ({
      messages: state.messages.filter((msg) => msg.id !== id),
    })),
}));
