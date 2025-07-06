import { BadgeCheck } from "lucide-react";
import Image from "next/image";
import logo from "@/public/logo.svg";

export const TopHeader = () => {
  return (
    <div className="whatsapp-green text-white p-4 flex items-center justify-between">
      <div className="flex items-center">
        <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3">
          <Image src={logo} width={50} height={50} alt="logo"></Image>
        </div>
        <div>
          <div className="flex items-center gap-1">
            <h1 className="font-semibold text-lg">Better Gondia</h1>
            {/* <svg width="16" height="16" viewBox="0 0 16 16" className="ml-1">
              <circle cx="8" cy="8" r="8" fill="#25D366" />
              <path
                d="M6.5 10.5L4 8l1-1 1.5 1.5L10 5l1 1-4.5 4.5z"
                fill="white"
                strokeWidth="0.5"
              />
            </svg> */}
            <BadgeCheck className="text-whote fill-blue-500 size-4 mb-2" />
          </div>
          <p className="text-xs opacity-90">Making Gondia Better</p>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <button className="p-2 hover:bg-white hover:bg-opacity-10 rounded-full transition-colors">
          <i className="fas fa-search"></i>
        </button>
        <button className="p-2 hover:bg-white hover:bg-opacity-10 rounded-full transition-colors">
          <i className="fas fa-ellipsis-v"></i>
        </button>
      </div>
    </div>
  );
};
