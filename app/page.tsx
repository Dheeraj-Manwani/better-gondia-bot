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
import { MessageCircle, Users, Circle, Check, BadgeCheck } from "lucide-react";
import { AuthStep, Language, Section, User, UserData } from "@/types";
import Image from "next/image";
import logo from "@/public/logo.svg";
import { v4 as uuid } from "uuid";
import { initUserData } from "@/lib/data";
import { useLanguage } from "@/store/language";
import { useTheme } from "next-themes";
import { useChatSection } from "@/store/chat-section";
import { AllChats } from "@/components/Chats";
import { BottomNavigation } from "@/components/bottom-navigation";
import { TopHeader } from "@/components/TopHeader";

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
      <TopHeader />

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {currentSection === "chat" && <ChatSection user={userData!} />}
        {currentSection === "my-issues" && <AllChats user={userData!} />}

        {currentSection === "community" && (
          <CommunitySection user={userData!} />
        )}
        {currentSection === "status" && <StatusSection />}
      </div>

      <BottomNavigation
        currentSection={currentSection}
        handleSectionChange={handleSectionChange}
      />
    </div>
  );
}
