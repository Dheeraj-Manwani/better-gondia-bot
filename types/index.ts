export type AuthStep = "language" | "login" | "otp" | "profile" | "complete";
export type Section = "chat" | "my-issues" | "community" | "status";
export type Language = "english" | "hindi" | "marathi";
export type Gender = "Male" | "Female" | "Other";

export interface User {
  id?: number;
  // authStep: AuthStep;
  // language: Language;
  // firstName: string;
  // lastName: string;
  name: string;
  age: number;
  gender: Gender;
  mobile: string;
  email?: string;
  address: string;
  ward?: string;
  // isVerified: boolean;
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
  location?: string;
  latitude?: string;
  longitude?: string;
  status: string;

  imageUrls?: string[];
  videoUrls?: string[];

  isMediaApproved: boolean;
  coSignCount: number;
  reportCount: number;

  createdAt: string;
  updatedAt: string;
  messages: string;
}

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
  location?: string;
  latitude?: string;
  longitude?: string;
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
