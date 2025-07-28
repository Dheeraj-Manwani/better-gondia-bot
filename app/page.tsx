"use client";

import { useState, useEffect } from "react";
import LanguageSelection from "@/components/language-selection";
import LoginScreen from "@/components/auth/login-screen";
import OTPScreen from "@/components/auth/otp-screen";
import ProfileScreen from "@/components/auth/profile-screen";
import ChatSection from "@/components/chat-section";
import CommunitySection from "@/components/community-section";
import StatusSection from "@/components/status-section";
import { AuthStep, Language, Section, User } from "@/types";
import { initUserData } from "@/lib/data";
import { useLanguage } from "@/store/language";
import { useTheme } from "next-themes";
import { AllChats } from "@/components/my-complaints";
import { BottomNavigation } from "@/components/bottom-navigation";
import { TopHeader } from "@/components/TopHeader";
import { useUserData } from "@/store/userData";
import { useAuthStep } from "@/store/authStep";
import { useBot } from "@/store/bot";
import { setCookie } from "cookies-next/client";
import { useSections } from "@/store/section";

export default function Home() {
  const { authStep, setAuthStep } = useAuthStep();
  const { section, setSection } = useSections();
  const [hasUserOpened, setHasUserOpened] = useState<boolean>(false);
  const [pendingMobile, setPendingMobile] = useState<string>("");
  // const [selectedLanguage, setSelectedLanguage] = useState<Language>("english");
  // const [userData, setUserData] = useState<User>(initUserData);
  const { userData, setUserData } = useUserData();
  // const {}
  const setLanguage = useLanguage((state) => state.setLanguage);
  const setBotState = useBot((state) => state.setBotState);
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
    const currentAuthStep = localStorage.getItem("authStep");
    const currLang = localStorage.getItem("language");

    if (currentUserData) {
      const parsedCurrentUser: User = JSON.parse(currentUserData);
      setUserData(parsedCurrentUser);
      setLanguage(currLang as Language);
      setAuthStep(currentAuthStep! as AuthStep);
      setCookie("userId", parsedCurrentUser.id);
    } else {
      // setUserData(initUserData);
      setLanguage("english");
      // setSelectedLanguage("english");
      // setAuthStep("language");
      localStorage.setItem("userData", JSON.stringify(initUserData));
      localStorage.setItem("authStep", "language");
      localStorage.setItem("language", "english");
    }
    setTheme("light");
  }, []);

  const handleLanguageSelect = (language: Language) => {
    // setSelectedLanguage(language);

    setAuthStep("profile");
    localStorage.setItem("authStep", "profile");

    setLanguage(language);
    localStorage.setItem("language", language);
  };
  if (authStep === "language") {
    return <LanguageSelection onLanguageSelect={handleLanguageSelect} />;
  }

  const handleAuthStepChange = (step: AuthStep, mobile?: string) => {
    // setAuthStep(step);
    // const updatedUserData: User = {
    //   ...userData,
    //   authStep: step,
    // };
    // setUserData(updatedUserData);
    setAuthStep(step);
    if (mobile) {
      setPendingMobile(mobile);
    }
  };

  const handleSectionChange = (section: Section) => {
    setSection(section);
    setHasUserOpened(true);
  };

  const handleOpenNewChat = () => {
    handleSectionChange("chat");
    setBotState({ step: "category", complaintData: {} });
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

  if (authStep === "login") {
    return (
      <LoginScreen onNext={(mobile) => handleAuthStepChange("otp", mobile)} />
    );
  }

  if (authStep === "otp") {
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

  if (authStep === "profile") {
    return (
      <ProfileScreen
        mobile={pendingMobile}
        onNext={() => handleAuthStepChange("complete")}
        onBack={() => handleAuthStepChange("language")}
      />
    );
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-[#E5DDD5]">
      <TopHeader />

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {section === "my-issues" && (
          <AllChats
            user={userData!}
            handleSectionChange={handleSectionChange}
            handleOpenNewChat={handleOpenNewChat}
          />
        )}
        {section === "chat" && (
          <ChatSection
            handleSectionChange={handleSectionChange}
            handleOpenNewChat={handleOpenNewChat}
          />
        )}

        {section === "community" && <CommunitySection user={userData!} />}
        {section === "status" && <StatusSection />}
      </div>

      <BottomNavigation
        currentSection={section}
        handleSectionChange={handleSectionChange}
      />
    </div>
  );
}
