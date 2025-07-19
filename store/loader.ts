import { create } from "zustand";

type LoaderStore = {
  isLoading: boolean;
  setLoading: (val: boolean) => void;
  showLoaderFor: (ms: number) => Promise<void>;
};

export const useLoaderStore = create<LoaderStore>((set) => ({
  isLoading: false,
  setLoading: (val: boolean) => set({ isLoading: val }),
  showLoaderFor: async (ms: number) => {
    set({ isLoading: true });
    new Promise((resolve) => setTimeout(resolve, ms)).finally(() =>
      set({ isLoading: false })
    );
  },
}));
