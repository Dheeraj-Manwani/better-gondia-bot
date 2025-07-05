import { ComplaintFormData } from "@/types";
import { create } from "zustand";

interface BotState {
  step: "idle" | "category" | "description" | "location" | "media" | "preview";
  complaintData: Partial<ComplaintFormData>;
}

interface UseBot {
  botState: BotState;
  setBotState: (state: BotState) => void;
}

export const useBot = create<UseBot>((set) => ({
  botState: {
    step: "idle",
    complaintData: {},
  },
  setBotState: (state: BotState) => set({ botState: state }),
}));
