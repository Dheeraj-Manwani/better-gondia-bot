"use client";

import { useChatSection } from "@/store/chat-section";
import { useMessages } from "@/store/messages";
import { Complaint, Section, User, ChatMessage } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import { ComplaintCard } from "./ComplaintCard";
import { BookAlert, Plus } from "lucide-react";
import { useBot } from "@/store/bot";
import { ComplaintScreenSkeleton } from "./Skeletons";

export const AllChats = ({
  user,
  handleSectionChange,
  handleOpenNewChat,
}: {
  user: User;
  handleSectionChange: (sec: Section) => void;
  handleOpenNewChat: () => void;
}) => {
  const chatSection = useChatSection((state) => state.chatSection);
  const { messages, setMessages, resetToInitial } = useMessages();
  const setBotState = useBot((state) => state.setBotState);
  const [complaints, setComplaints] = useState<Complaint[]>();

  const { data: chatMessages, isLoading } = useQuery<{
    data: { complaints: Complaint[] };
  }>({
    queryKey: [`/api/complaints?userId=${user.id}`],
  });

  useEffect(() => {
    if (chatMessages) {
      const com: Complaint[] = chatMessages.data.complaints;
      setComplaints(com);
      // const messages = complaints.map((comp) => JSON.parse(comp.message));
      // setMessages(messages);
    }
  }, [chatMessages]);

  const handleNavigateToChat = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleSectionChange("chat");
  };

  const handleOpenExistingChat = (cardMessages: string) => {
    try {
      handleSectionChange("chat");
      const mess: ChatMessage[] = JSON.parse(cardMessages);
      setMessages(mess);
      setBotState({ step: "existing", complaintData: {} });
    } catch (e) {
      console.log("Error occured", e);
    }
  };

  const getCategoryEmoji = (category: string) => {
    switch (category) {
      case "infrastructure":
        return "🏗️";
      case "sanitation":
        return "🚮";
      case "traffic":
        return "🚦";
      case "water":
        return "💧";
      case "electricity":
        return "⚡";
      default:
        return "📋";
    }
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const complaintDate = new Date(date);
    const diffInDays = Math.floor(
      (now.getTime() - complaintDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "1 day ago";
    return `${diffInDays} days ago`;
  };

  if (isLoading) {
    return <ComplaintScreenSkeleton />;
  }

  return (
    <div className="max-w-md mx-auto text-gray-700  min-h-screen flex flex-col bg-[#E5DDD5]  rounded-lg">
      {/* Header */}
      <div className="bg-whatsapp-dark text-gray-700 p-3.5 flex items-center  sticky top-0 z-10  justify-between">
        <h1 className="font-semibold text-lg flex gap-1.5 justify-center align-middle">
          <BookAlert className="mt-1" /> <span>My Complaints</span>
        </h1>
        <Button onClick={handleOpenNewChat}>
          <Plus /> New Complaint
        </Button>
      </div>

      {/* Complaints List */}

      {complaints && complaints.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full py-16">
          <div className="text-7xl mb-4 animate-bounce">📋</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No complaints yet
          </h3>
          <p className="text-gray-500 mb-6 text-center max-w-xs">
            Submit your first complaint to get started and help improve your
            community!
          </p>

          <Button
            className="bg-[#25D366] hover:bg-whatsapp-dark transition-colors shadow-md text-white"
            onClick={handleNavigateToChat}
          >
            Submit Complaint
          </Button>
        </div>
      ) : (
        <ScrollArea className="  h-[70vh]">
          {complaints?.map((complaint: Complaint) => (
            <>
              <ComplaintCard
                complaint={complaint}
                key={complaint.id}
                handleOpenExistingChat={handleOpenExistingChat}
              />
              <ComplaintScreenSkeleton />
            </>
          ))}
          <ScrollBar orientation="vertical" color="black" />
        </ScrollArea>
      )}

      {/* <ScrollArea className="h-40">
        <ScrollBar />
        <div className="bg-red-500 h-5">aasss</div>
        <div className="bg-red-500 h-5">aasss</div>
        <div className="bg-red-500 h-5">aasss</div>
        <div className="bg-red-500 h-5">aasss</div>
        <div className="bg-red-500 h-5">aasss</div>
        <div className="bg-red-500 h-5">aasss</div>
        <div className="bg-red-500 h-5">aasss</div>
        <div className="bg-red-500 h-5">aasss</div>
        <div className="bg-red-500 h-5">aasss</div>
        <div className="bg-red-500 h-5">aasss</div>
        <div className="bg-red-500 h-5">aasss</div>
        <div className="bg-red-500 h-5">aasss</div>
        <div className="bg-red-500 h-5">aasss</div>
        <div className="bg-red-500 h-5">aasss</div>
        <div className="bg-red-500 h-5">aasss</div>
        <div className="bg-red-500 h-5">aasss</div>
        <div className="bg-red-500 h-5">aasss</div>
        <div className="bg-red-500 h-5">aasss</div>
        <div className="bg-red-500 h-5">aasss</div>
        <div className="bg-red-500 h-5">aasss</div>
        <div className="bg-red-500 h-5">aasss</div>
        <div className="bg-red-500 h-5">aasss</div>
        <div className="bg-red-500 h-5">aasss</div>
        <div className="bg-red-500 h-5">aasss</div>
        <div className="bg-red-500 h-5">aasss</div>
        <div className="bg-red-500 h-5">aasss</div>
      </ScrollArea> */}
    </div>
  );
};
