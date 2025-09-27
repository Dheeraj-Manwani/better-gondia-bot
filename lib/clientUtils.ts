import { ChatMessage } from "@/types";
import { Role } from "@prisma/client/index-browser";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ComplaintType, Language as PrismaLanguage } from "@prisma/client";

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

export function normalizeDigits(str: string) {
  return str.replace(/[०-९]/g, (d) => String(d.charCodeAt(0) - 0x0966));
}

export function getRandom10DigitNumber() {
  let digits = "0123456789".split("");

  for (let i = digits.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [digits[i], digits[j]] = [digits[j], digits[i]];
  }

  if (digits[0] === "0") {
    for (let i = 1; i < digits.length; i++) {
      if (digits[i] !== "0") {
        [digits[0], digits[i]] = [digits[i], digits[0]];
        break;
      }
    }
  }

  return digits.slice(0, 10).join("");
}

export function getUserLoggedUrlMessage(
  language: PrismaLanguage,
  userSlug: string
): string {
  const messages = {
    [PrismaLanguage.ENGLISH]: `Please visit our website to track your complaint status. Thank you for trusting Better Gondia Mitra 🙏 \n \n👉 https://better-gondia-bot.vercel.app?user=${userSlug}`,
    [PrismaLanguage.HINDI]: `अपनी शिकायत की स्थिति ट्रैक करने के लिए कृपया हमारी वेबसाइट पर जाएं। बेहतर गोंडिया मित्र पर भरोसा करने के लिए धन्यवाद 🙏 \n \n👉 https://better-gondia-bot.vercel.app?user=${userSlug}`,
    [PrismaLanguage.MARATHI]: `तुमच्या तक्रारीची स्थिती ट्रॅक करण्यासाठी कृपया आमच्या वेबसाइटला भेट द्या. बेहतर गोंडिया मित्रावर विश्वास ठेवल्याबद्दल धन्यवाद 🙏 \n \n👉 https://better-gondia-bot.vercel.app?user=${userSlug}`,
  };

  return messages[language] || messages[PrismaLanguage.ENGLISH];
}

export function getWhatsappConfirmationMessage(
  language: PrismaLanguage,
  customerName: string,
  complaintType: ComplaintType,
  formattedComplaintId: string,
  taluka: string | null,
  description: string | null,
  location: string | null,
  mobileNo: string
): string {
  const isSuggestion = complaintType === ComplaintType.SUGGESTION;
  const typeText = isSuggestion ? "suggestion" : "complaint";
  const typeEmoji = isSuggestion ? "💡" : "⚠️";
  const typeLabel = isSuggestion ? "Suggestion" : "Complaint";

  const messages = {
    [PrismaLanguage.ENGLISH]: `✅ *${typeLabel} Successfully Submitted!*

Dear ${customerName},
Your ${typeText} has been successfully submitted to the Better Gondia Mitra.

📋 *${typeLabel} Details:*
• ${typeLabel} ID: *${formattedComplaintId}*
• Type: ${typeEmoji} ${typeLabel}
• Taluka: ${taluka || "Not specified"}
• Status: 🟢 Open (Under Review)
📝 *Description:*
${description || "No description provided"}
📍 *Location:* ${location || "Not specified"}
⏰ *Submission Time:* ${new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })}
📞 *Your Contact:* ${mobileNo}

💡 *Keep this ${typeLabel} ID safe for future reference!*
Thank you for taking the time to help improve Gondia! Your feedback is valuable to us. 🙏

*Better Gondia Mitra*`,

    [PrismaLanguage.HINDI]: `✅ *${typeLabel} सफलतापूर्वक जमा किया गया!*

प्रिय ${customerName},
आपकी ${typeText} बेहतर गोंडिया मित्र को सफलतापूर्वक जमा की गई है।

📋 *${typeLabel} विवरण:*
• ${typeLabel} ID: *${formattedComplaintId}*
• प्रकार: ${typeEmoji} ${typeLabel}
• तालुका: ${taluka || "निर्दिष्ट नहीं"}
• स्थिति: 🟢 खुला (समीक्षा के तहत)
📝 *विवरण:*
${description || "कोई विवरण प्रदान नहीं किया गया"}
📍 *स्थान:* ${location || "निर्दिष्ट नहीं"}
⏰ *जमा करने का समय:* ${new Date().toLocaleString("hi-IN", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })}
📞 *आपका संपर्क:* ${mobileNo}

💡 *भविष्य के संदर्भ के लिए इस ${typeLabel} ID को सुरक्षित रखें!*
गोंडिया को बेहतर बनाने में मदद करने के लिए समय निकालने के लिए धन्यवाद! आपकी प्रतिक्रिया हमारे लिए मूल्यवान है। 🙏

*बेहतर गोंडिया मित्र*`,

    [PrismaLanguage.MARATHI]: `✅ *${typeLabel} यशस्वीरित्या सबमिट केले!*

प्रिय ${customerName},
तुमची ${typeText} बेहतर गोंडिया मित्राकडे यशस्वीरित्या सबमिट केली गेली आहे.

📋 *${typeLabel} तपशील:*
• ${typeLabel} ID: *${formattedComplaintId}*
• प्रकार: ${typeEmoji} ${typeLabel}
• तालुका: ${taluka || "निर्दिष्ट नाही"}
• स्थिती: 🟢 उघडे (पुनरावलोकनाखाली)
📝 *वर्णन:*
${description || "कोणतेही वर्णन प्रदान केले नाही"}
📍 *स्थान:* ${location || "निर्दिष्ट नाही"}
⏰ *सबमिशन वेळ:* ${new Date().toLocaleString("mr-IN", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })}
📞 *तुमचा संपर्क:* ${mobileNo}

💡 *भविष्यातील संदर्भासाठी ही ${typeLabel} ID सुरक्षित ठेवा!*
गोंडिया सुधारण्यात मदत करण्यासाठी वेळ काढल्याबद्दल धन्यवाद! तुमचा अभिप्राय आमच्यासाठी मौल्यवान आहे। 🙏

*बेहतर गोंडिया मित्र*`,
  };

  return messages[language] || messages[PrismaLanguage.ENGLISH];
}
