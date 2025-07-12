import { ChatMessage } from "@/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateComplaintIdFromDate(
  complaintId: number,
  createdAt: string | Date = new Date()
): string {
  const date = new Date(createdAt); // Works with ISO string or Date object

  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
  const yy = String(date.getFullYear()).slice(-2);

  const paddedId = String(complaintId).padStart(4, "0");

  return `GK-${dd}${mm}${yy}-${paddedId}`;
}

export function formatCreatedAtLabel(createdAt: string | Date): string {
  const date = new Date(createdAt);

  const options: Intl.DateTimeFormatOptions = {
    month: "short", // e.g., "Jul"
    day: "numeric", // e.g., "7"
    year: "numeric", // e.g., "2025"
  };

  const formattedDate = date.toLocaleDateString("en-US", options);
  return `🕒 ${formattedDate}`;
}

export const getBotMessage = (content: string): ChatMessage => {
  return {
    id: Date.now(),
    content,
    messageType: "bot",
    isRead: false,
    createdAt: new Date().toISOString(),
  };
};

export const getCategoryIcon = (category: string) => {
  const icons: Record<string, string> = {
    roads: "🛣️",
    water: "💧",
    electricity: "⚡",
    sanitation: "🗑️",
  };
  return icons[category] || "📝";
};
