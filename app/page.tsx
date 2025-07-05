"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import LanguageSelection from "@/components/language-selection";
import LoginScreen from "@/components/auth/login-screen";
import OTPScreen from "@/components/auth/otp-screen";
import ProfileScreen from "@/components/auth/profile-screen";
import ChatSection from "@/components/chat-section";
import CommunitySection from "@/components/community-section";
import StatusSection from "@/components/status-section";
import { MessageCircle, Users, Circle, Check } from "lucide-react";
import { AuthStep, Language, Section, User, UserData } from "@/types";
import Image from "next/image";
import logo from "@/public/logo.svg";
import { v4 as uuid } from "uuid";
import { initUserData } from "@/lib/data";
import { useLanguage } from "@/store/language";
import { useTheme } from "next-themes";

export default function Home() {
  // const [authStep, setAuthStep] = useState<AuthStep>("language");
  const [currentSection, setCurrentSection] = useState<Section>("chat");
  const [pendingMobile, setPendingMobile] = useState<string>("");
  // const [selectedLanguage, setSelectedLanguage] = useState<Language>("english");
  const [userData, setUserData] = useState<User>(initUserData);
  const setLanguage = useLanguage((state) => state.setLanguage);
  const { setTheme } = useTheme();

  // const { data: user, isLoading } = useQuery<User>({
  //   queryKey: ["/api/auth/user"],
  //   retry: false,
  // });

  // useEffect(() => {
  //   if (user) {
  //     setAuthStep("complete");
  //   }
  // }, [user]);

  useEffect(() => {
    const currentUserData = localStorage.getItem("userData");
    if (currentUserData) {
      const parsedCurrentUser: User = JSON.parse(currentUserData);
      setUserData(parsedCurrentUser);
      setLanguage(parsedCurrentUser.language);
      // setAuthStep(parsedCurrentUser.authStep);
    } else {
      setUserData(initUserData);
      setLanguage("english");
      // setSelectedLanguage("english");
      // setAuthStep("language");
      localStorage.setItem("userData", JSON.stringify(initUserData));
    }
    setTheme("light");
  }, []);

  const handleLanguageSelect = (language: Language) => {
    // setSelectedLanguage(language);

    // setAuthStep("profile");
    const updatedUserData: User = {
      ...userData,
      authStep: "profile",
      language: language,
    };
    setUserData(updatedUserData);
    localStorage.setItem("userData", JSON.stringify(updatedUserData));
  };

  const handleAuthStepChange = (step: AuthStep, mobile?: string) => {
    // setAuthStep(step);
    const updatedUserData: User = {
      ...userData,
      authStep: step,
    };
    setUserData(updatedUserData);
    if (mobile) {
      setPendingMobile(mobile);
    }
  };

  const handleSectionChange = (section: Section) => {
    setCurrentSection(section);
  };

  // if (isLoading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center whatsapp-bg">
  //       <div className="text-center">
  //         <div className="w-16 h-16 whatsapp-green rounded-full flex items-center justify-center mx-auto mb-4">
  //           <Image src={logo} height={50} width={50} alt="logo"></Image>
  //         </div>
  //         <p className="whatsapp-gray">Loading...</p>
  //       </div>
  //     </div>
  //   );
  // }

  if (userData.authStep === "language") {
    return <LanguageSelection onLanguageSelect={handleLanguageSelect} />;
  }

  if (userData.authStep === "login") {
    return (
      <LoginScreen onNext={(mobile) => handleAuthStepChange("otp", mobile)} />
    );
  }

  if (userData.authStep === "otp") {
    return (
      <OTPScreen
        mobile={pendingMobile}
        onNext={(isNewUser) =>
          handleAuthStepChange(isNewUser ? "profile" : "complete")
        }
        onBack={() => handleAuthStepChange("login")}
      />
    );
  }

  if (userData.authStep === "profile") {
    return (
      <ProfileScreen
        mobile={pendingMobile}
        onNext={() => handleAuthStepChange("complete")}
        onBack={() => handleAuthStepChange("language")}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen ">
      {/* Top Header */}
      <div className="whatsapp-green text-white p-4 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3">
            <Image src={logo} width={50} height={50} alt="logo"></Image>
          </div>
          <div>
            <div className="flex items-center gap-1">
              <h1 className="font-semibold text-lg">Better Gondia</h1>
              <svg width="16" height="16" viewBox="0 0 16 16" className="ml-1">
                <circle cx="8" cy="8" r="8" fill="#25D366" />
                <path
                  d="M6.5 10.5L4 8l1-1 1.5 1.5L10 5l1 1-4.5 4.5z"
                  fill="white"
                  strokeWidth="0.5"
                />
              </svg>
            </div>
            <p className="text-xs opacity-90">Making Gondia Better</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button className="p-2 hover:bg-white hover:bg-opacity-10 rounded-full transition-colors">
            <i className="fas fa-search"></i>
          </button>
          <button className="p-2 hover:bg-white hover:bg-opacity-10 rounded-full transition-colors">
            <i className="fas fa-ellipsis-v"></i>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {currentSection === "chat" && <ChatSection user={userData!} />}
        {currentSection === "community" && (
          <CommunitySection user={userData!} />
        )}
        {currentSection === "status" && <StatusSection />}
      </div>

      {/* Bottom Navigation */}
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
              currentSection === "community"
                ? "text-green-600"
                : "text-gray-500"
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
    </div>
  );
}
