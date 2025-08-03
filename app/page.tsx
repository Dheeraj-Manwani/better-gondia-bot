import Home from "@/components/Home";
import { Metadata } from "next";

export function generateMetadata(): Metadata {
  const imageUrl =
    "https://d2jow4rnitzfmr.cloudfront.net/e2c40e62-f8c3-44f0-bb48-d6258079243c_logopng.png";

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://better-gondia-bot.vercel.app";

  return {
    title: "Gondia Khabar Mitra",
    description:
      "Gondia khabar mitra is a platform where you can create a complaint or support existing one's related to gondia.",
    openGraph: {
      title: "Gondia Khabar Mitra",
      description:
        "Gondia khabar mitra is a platform where you can create a complaint or support existing one's related to gondia.",
      images: imageUrl ? [imageUrl] : [],
      url: baseUrl,
    },
    twitter: {
      card: imageUrl ? "summary_large_image" : "summary",
      title: "Gondia Khabar Mitra",
      description:
        "Gondia khabar mitra is a platform where you can create a complaint or support existing one's related to gondia.",
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

export default function Page() {
  return (
    // <div className="flex min-h-[100dvh] w-full md:justify-center md:items-center">
    //   {/* Left-side text (only on md and up) */}
    //   {/* Centered "mobile screen" */}
    //   <div className="w-full md:w-[400px] h-full md:h-[100dvh] bg-white border border-gray-300 ">
    //     <Home />
    //   </div>{" "}
    //   <div className="hidden  md:flex flex-col justify-center items-start text-gray-600 px-8 max-w-sm sm:w-20 lg:w-sm">
    //     <h2 className="text-2xl font-semibold mb-4">Mobile Only Experience</h2>
    //     <p>
    //       Please open this website on a mobile device for the best experience.
    //     </p>
    //   </div>
    // </div>

    // <div className="h-[100dvh] w-[100dvw]">
    //   <div className="h-[100dvh] w-72 m-auto">
    <Home />
    //   </div>
    // </div>
  );
}
