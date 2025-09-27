"use server";

import { Language, User } from "@/types";
import { getCategoryIcon } from "./clientUtils";
import { ComplaintType, Language as PrismaLanguage } from "@prisma/client";

const serverJSON = {
  complaint_submitted_success: {
    english:
      "✅ Complaint submitted successfully! Your complaint ID is complaintId. We'll keep you updated on the progress.",
    hindi:
      "✅ शिकायत सफलतापूर्वक दर्ज हो गई है! आपकी शिकायत ID complaintId है। हम आपको प्रगति की जानकारी देते रहेंगे।",
    marathi:
      "✅ तक्रार यशस्वीरित्या नोंदवली गेली आहे! तुमची तक्रार आयडी complaintId आहे. आम्ही तुम्हाला प्रगतीची माहिती देत राहू.",
  },
};

interface transaleData {
  complaintId: string;
}

export const translateServer = async (
  key: keyof typeof serverJSON,
  language: Language,
  data?: transaleData
) => {
  let mess = serverJSON[key][language];

  if (key == "complaint_submitted_success") {
    mess = mess.split("complaintId").join(data?.complaintId);
  }
  return mess ?? serverJSON[key]["english"];
};

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
