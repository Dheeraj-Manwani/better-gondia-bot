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
      title: "Complaint Not Found",
      description: "The requested complaint could not be loaded.",
    };
  }

  let imageUrl: string | undefined;

  if (complaint) {
    if (complaint.imageUrls?.length && complaint.imageUrls?.length > 0) {
      imageUrl = complaint.imageUrls[0];
    } else {
      imageUrl =
        "https://d2jow4rnitzfmr.cloudfront.net/e2c40e62-f8c3-44f0-bb48-d6258079243c_logopng.png";
    }
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://better-gondia-bot.vercel.app";

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
