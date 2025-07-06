"use client";

import { useChatSection } from "@/store/chat-section";
import { useMessages } from "@/store/messages";
import { ChatMessage, Complaint, User } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { v4 as uuid } from "uuid";
import ChatSection from "./chat-section";

export const AllChats = ({ user }: { user: User }) => {
  const chatSection = useChatSection((state) => state.chatSection);
  const { messages, setMessages } = useMessages();
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

  if (isLoading) return "Loading ... ";

  return (
    <>
      {/* <div className="m-2 mt-4 flex flex-col gap-2">
        <div>My Complaints</div>
        {complaints?.map((mess: Complaint) => (
          <div
            className="flex flex-col bg-white border border-gray-200 shadow-md hover:shadow-lg rounded-xl p-4 md:p-5"
            key={uuid()}
          >
            {mess.description.length > 150
              ? `${mess.description.substring(0, 150)}...`
              : mess.description}
          </div>
        ))}
      </div> */}
      <ChatSection user={user} />
    </>
  );
};
