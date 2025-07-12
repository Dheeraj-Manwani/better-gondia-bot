"use client";

import { ComplaintFormData } from "@/types";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface BotState {
  step:
    | "idle"
    | "category"
    | "description"
    | "location"
    | "media"
    | "preview"
    | "done"
    | "existing";
  complaintData: Partial<ComplaintFormData>;
}

interface UseBot {
  botState: BotState;
  setBotState: (state: BotState) => void;
}

export const useBot = create<UseBot>((set) => ({
  botState: {
    step: "category",
    complaintData: {},
  },
  setBotState: (state: BotState) => {
    console.log("Bot state changed:", state);
    set({ botState: state });
  },
}));

// Subscribe to state changes and log them
useBot.subscribe((state) => {
  console.log("Bot store state updated:", state);
});
