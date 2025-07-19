import { create } from "zustand";

type ModalType = "Confirmation" | "FAQ";

export type ModalStore = {
  isOpen: boolean;
  modalType?: ModalType;
  setIsOpen: (val: boolean, type?: ModalType) => void;
};

export const useModal = create<ModalStore>()((set) => ({
  isOpen: false,
  setIsOpen: (val: boolean, type?: ModalType) =>
    set({ isOpen: val, modalType: type }),
}));
