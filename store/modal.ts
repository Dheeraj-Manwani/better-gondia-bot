import { create } from "zustand";

export type ModalType = "Reload" | "FAQ";

export type ModalStore = {
  isOpen: boolean;
  modalType?: ModalType;
  confirmationFunction?: (...args: string[]) => void;
  setIsOpen: (
    val: boolean,
    type?: ModalType,
    confirmationFunction?: (...args: string[]) => void
  ) => void;
};

export const useModal = create<ModalStore>()((set) => ({
  isOpen: false,
  setIsOpen: (
    val: boolean,
    type?: ModalType,
    confirmationFunction?: (...args: string[]) => void
  ) => set({ isOpen: val, modalType: type, confirmationFunction }),
}));

useModal.subscribe((state) => {
  console.log("Auth Step state updated:", state);
});
