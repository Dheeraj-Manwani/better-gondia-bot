"use client";

import { initUserData } from "@/lib/data";
import { User } from "@/types";
import { create } from "zustand";

interface UserDataStore {
  userData: User;
  setUserData: (language: User) => void;
}

export const useUserData = create<UserDataStore>((set) => ({
  userData: initUserData,
  setUserData: (user: User) => set({ userData: user }),
}));
