import { BadgeCheck } from "lucide-react";
import Image from "next/image";
import logo from "@/public/logo.svg";
import { Button } from "./ui/button";

export const TopHeader = () => {
  return (
    <div className="bg-[#075E54] text-white p-3 flex items-center justify-between shadow-lg">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
          <div className="w-9 h-9 bg-[#25D366] rounded-full flex items-center justify-center">
            <Image src={logo} width={50} height={50} alt="logo"></Image>
          </div>
        </div>
        <div>
          <h1 className="font-medium text-[17px]">Better Gondia Mitra</h1>
          <p className="text-xs text-white/80">Making Gondia Better</p>
        </div>
      </div>

      <div className="flex items-center space-x-4"></div>
    </div>
  );
};
