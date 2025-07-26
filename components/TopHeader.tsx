"use client";

import Image from "next/image";
import logo from "@/public/logo.svg";
// import { Button } from "./ui/button";
// import { DropdownMenuContent, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { HeaderDropdown } from "./HeaderDropdown";
import { VerifiedCheck } from "./ui/blue-check";
import { CircleQuestionMark } from "lucide-react";
import { useModal } from "@/store/modal";

export const TopHeader = ({ isView = false }: { isView?: boolean }) => {
  const setIsOpen = useModal((state) => state.setIsOpen);
  return (
    <div className="bg-[#075E54] text-white p-3 flex items-center justify-between shadow-lg z-20">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
          <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center">
            <Image src={logo} width={50} height={50} alt="logo"></Image>
          </div>
        </div>
        <div>
          <h1 className="font-medium text-[17px] flex gap-0.5 justify-center align-middle">
            <span>Better Gondia Mitra</span> <VerifiedCheck />
          </h1>

          <p className="text-xs text-white/80">Making Gondia Better</p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <CircleQuestionMark
          cursor={"pointer"}
          onClick={() => setIsOpen(true, "FAQ")}
        />
        {!isView && <HeaderDropdown />}
      </div>
    </div>
  );
};
