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
  return <Home />;
}
