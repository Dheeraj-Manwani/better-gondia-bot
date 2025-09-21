import { SharedComplaint } from "@/components/SharedComplaint";
import { Metadata } from "next";
import { getComplaintById } from "../actions/complaint";
import { generateComplaintIdFromDate } from "@/lib/clientUtils";

// interface PageProps {
//   params: {
//     complaintId: string;
//   };
// }

export async function generateMetadata({ params }: any): Promise<Metadata> {
  const awaitedParams = await params;
  const complaint = await getComplaintById(Number(awaitedParams.complaintId));

  if (!complaint) {
    return {
      title: "Better Gondia Mitra",
      description:
        "Better Gondia mitra is a platform where you can create a complaint or support existing one's related to gondia.",
    };
  }

  let imageUrl: string | undefined;

  if (complaint) {
    if (complaint.media?.length && complaint.media?.length > 0) {
      // Find first image in media array
      const firstImage = complaint.media.find((item) => item.type === "image");
      imageUrl =
        firstImage?.url ||
        "https://d2jow4rnitzfmr.cloudfront.net/e2c40e62-f8c3-44f0-bb48-d6258079243c_logopng.png";
    } else {
      imageUrl =
        "https://d2jow4rnitzfmr.cloudfront.net/e2c40e62-f8c3-44f0-bb48-d6258079243c_logopng.png";
    }
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://better-gondia-bot.vercel.app";

  console.log("returning metadata json ===== ", {
    title: complaint
      ? `Complaint ${generateComplaintIdFromDate(
          complaint.id,
          complaint.createdAt
        )}`
      : "Complaint Detail",
    description: complaint?.description ?? "See details of this complaint.",
    openGraph: {
      title: complaint
        ? `Complaint ${generateComplaintIdFromDate(
            complaint.id,
            complaint.createdAt
          )}`
        : "Complaint Detail",
      description: complaint?.description ?? "See details of this complaint.",
      images: imageUrl ? [imageUrl] : [],
      url: `${baseUrl}/${awaitedParams.complaintId}`,
    },
    twitter: {
      card: imageUrl ? "summary_large_image" : "summary",
      title: complaint
        ? `Complaint ${generateComplaintIdFromDate(
            complaint.id,
            complaint.createdAt
          )}`
        : "Complaint Detail",
      description: complaint?.description ?? "See details of this complaint.",
      images: imageUrl ? [imageUrl] : [],
    },
  });

  return {
    title: complaint
      ? `Complaint ${generateComplaintIdFromDate(
          complaint.id,
          complaint.createdAt
        )}`
      : "Complaint Detail",
    description: complaint?.description ?? "See details of this complaint.",
    openGraph: {
      title: complaint
        ? `Complaint ${generateComplaintIdFromDate(
            complaint.id,
            complaint.createdAt
          )}`
        : "Complaint Detail",
      description: complaint?.description ?? "See details of this complaint.",
      images: imageUrl ? [imageUrl] : [],
      url: `${baseUrl}/${awaitedParams.complaintId}`,
    },
    twitter: {
      card: imageUrl ? "summary_large_image" : "summary",
      title: complaint
        ? `Complaint ${generateComplaintIdFromDate(
            complaint.id,
            complaint.createdAt
          )}`
        : "Complaint Detail",
      description: complaint?.description ?? "See details of this complaint.",
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

export default async function ComplaintDetailPage({ params }: any) {
  const awaitedParams = await params;
  return <SharedComplaint complaintId={awaitedParams.complaintId} />;
}
