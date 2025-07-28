import { ChatMessage } from "@/types";
import { Role } from "@prisma/client/index-browser";
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

  return `BG-${dd}${mm}${yy}-${paddedId}`;
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

export const formatTimeAgo = (dateString: string) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInHours = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60)
  );

  if (diffInHours < 1) return "Just now";
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  const days = Math.floor(diffInHours / 24);
  return `${days} ${days === 1 ? "day" : "days"} ago`;
};

export const getBotMessage = (content: string): ChatMessage => {
  return {
    id: Date.now(),
    content,
    messageType: "bot",
    isRead: false,
    createdAt: new Date().toISOString(),
  };
};

export const getCategoryIcon = (
  category: "roads" | "water" | "electricity" | "sanitation" | string
) => {
  const icons: Record<string, string> = {
    roads: "🛣️",
    water: "💧",
    electricity: "⚡",
    sanitation: "🗑️",
  };
  return icons[category] || "📝";
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "in_progress":
      return "bg-blue-100 text-blue-800";
    case "resolved":
      return "bg-green-100 text-green-800";
    case "closed":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const isAdmin = (role?: Role): boolean => {
  return role == "ADMIN" || role == "SUPERADMIN";
};

export const resetApp = () => {
  localStorage.removeItem("language");
  localStorage.removeItem("authStep");
  localStorage.removeItem("userData");
  window.location.reload();
};
