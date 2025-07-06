import { Section } from "@/types";
import { Circle, MessageCircle, Users } from "lucide-react";

export const BottomNavigation = ({
  currentSection,
  handleSectionChange,
}: {
  currentSection: string;
  handleSectionChange: (sec: Section) => void;
}) => {
  return (
    <div className="bg-white border-t border-gray-200 px-4 py-2">
      <div className="flex justify-around">
        <button
          className={`flex flex-col items-center py-2 px-4 ${
            currentSection === "chat" ? "text-green-600" : "text-gray-500"
          }`}
          onClick={() => handleSectionChange("chat")}
        >
          <MessageCircle className="w-6 h-6 mb-1" />
          <span className="text-xs font-medium">Chat</span>
        </button>
        <button
          className={`flex flex-col items-center py-2 px-4 ${
            currentSection === "community" ? "text-green-600" : "text-gray-500"
          }`}
          onClick={() => handleSectionChange("community")}
        >
          <Users className="w-6 h-6 mb-1" />
          <span className="text-xs">Community</span>
        </button>
        <button
          className={`flex flex-col items-center py-2 px-4 ${
            currentSection === "status" ? "text-green-600" : "text-gray-500"
          }`}
          onClick={() => handleSectionChange("status")}
        >
          <Circle className="w-6 h-6 mb-1" />
          <span className="text-xs">Status</span>
        </button>
      </div>
    </div>
  );
};
