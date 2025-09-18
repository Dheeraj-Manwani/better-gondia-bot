export type AuthStep = "language" | "login" | "otp" | "profile" | "complete";
export type Section = "my-issues" | "community" | "status";
export type Language = "english" | "hindi" | "marathi";
export type Gender = "Male" | "Female" | "Other";

export interface SessionUser {
  id: string;
  email?: string;
  name?: string;
  role?: "ADMIN" | "SUPERADMIN" | "USER";
}

export interface User {
  id?: number;
  name: string;
  age: number;
  gender: Gender;
  mobile: string;
  email?: string;
  address: string;
  ward?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserData {
  id: string;
  name: string;
  authStep: AuthStep;
  language: Language;
}

export interface Complaint {
  id: number;
  complaintId: string;
  userId: number;
  title: string;
  description: string;
  category: string;
  location?: string | null;
  latitude?: string | null;
  longitude?: string | null;
  status: string;

  imageUrls?: string[];
  videoUrls?: string[];

  isMediaApproved: boolean;
  isPublic: boolean;
  coSignCount: number;
  isCoSigned: boolean;
  isReported: boolean;

  createdAt: string;
  updatedAt: string;
  messages: string;
}

export type CoSignVars = {
  userId: number;
  shouldApprove: boolean;
  complaintId: number;
};

export interface ChatMessage {
  id: number;
  userId?: number;
  complaintId?: number;
  content: string;
  messageType: "user" | "bot" | "system";
  isRead: boolean;
  createdAt: string;
}

export interface StatusUpdate {
  id: number;
  title: string;
  description?: string;
  imageUrl?: string;
  videoUrl?: string;
  complaintId?: number;
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
}

export interface ComplaintFormData {
  title: string;
  description: string;
  category: string;
  location?: string | null;
  latitude?: string | null;
  longitude?: string | null;
  imageUrls?: string[];
  videoUrls?: string[];
}

export interface OTPFormData {
  mobile: string;
  otp: string;
}

export interface ProfileFormData {
  name: string;
  age: number;
  gender: Gender | "";

  mobile: string;
  address: string;

  // firstName: string;
  // lastName: string;
}

export type Visibility = "MEDIA" | "COMPLAINT";

export type ReportReason =
  | "INAPPROPRIATE_CONTENT"
  | "MISLEADING_OR_FALSE_INFO"
  | "SPAM_OR_DUPLICATE"
  | "PRIVACY_VIOLATION"
  | "HARASSMENT_OR_HATE_SPEECH"
  | "OTHER";

export interface ReportVars {
  userId: number;
  complaintId: number;
  reportReason: ReportReason;
  text?: string;
}
