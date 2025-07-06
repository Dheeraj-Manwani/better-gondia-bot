import { Section } from "@/types";
import { Circle, Globe, List, MessageCircle, Users } from "lucide-react";
import { Button } from "./ui/button";
import { v4 as uuid } from "uuid";

export const BottomNavigation = ({
  currentSection,
  handleSectionChange,
}: {
  currentSection: Section;
  handleSectionChange: (sec: Section) => void;
}) => {
  return (
    <div className="bg-white border-t border-gray-200 px-4 py-2">
      <div className="flex justify-around">
        <Button
          variant="ghost"
          className={`flex flex-col items-center py-2 px-3 ${
            currentSection == "chat"
              ? "text-whatsapp-green"
              : "text-gray-500 hover:text-whatsapp-green"
          } transition-colors`}
          onClick={() => handleSectionChange("chat")}
          key={uuid()}
        >
          <MessageCircle className="w-5 h-5 mb-1" />
          <span
            className={`text-xs ${
              currentSection == "chat" ? "font-medium" : ""
            }`}
          >
            Chat
          </span>
        </Button>

        <Button
          variant="ghost"
          className={`flex flex-col items-center py-2 px-3 ${
            currentSection == "my-issues"
              ? "text-whatsapp-green"
              : "text-gray-500 hover:text-whatsapp-green"
          } transition-colors`}
          onClick={() => handleSectionChange("my-issues")}
          key={uuid()}
        >
          <List className="w-5 h-5 mb-1" />
          <span
            className={`text-xs ${
              currentSection == "my-issues" ? "font-medium" : ""
            }`}
          >
            My Issues
          </span>
        </Button>
        <Button
          variant="ghost"
          className={`flex flex-col items-center py-2 px-3 ${
            currentSection == "community"
              ? "text-whatsapp-green"
              : "text-gray-500 hover:text-whatsapp-green"
          } transition-colors`}
          onClick={() => handleSectionChange("community")}
          key={uuid()}
        >
          <Globe className="w-5 h-5 mb-1" />
          <span
            className={`text-xs ${
              currentSection == "community" ? "font-medium" : ""
            }`}
          >
            Community
          </span>
        </Button>
        <Button
          variant="ghost"
          className={`flex flex-col items-center py-2 px-3 ${
            currentSection == "status"
              ? "text-whatsapp-green"
              : "text-gray-500 hover:text-whatsapp-green"
          } transition-colors`}
          onClick={() => handleSectionChange("status")}
          key={uuid()}
        >
          <Circle className="w-5 h-5 mb-1" />
          <span
            className={`text-xs ${
              currentSection == "status" ? "font-medium" : ""
            }`}
          >
            Status
          </span>
        </Button>
      </div>
    </div>
  );
};
