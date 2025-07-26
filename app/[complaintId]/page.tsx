import { SharedComplaint } from "@/components/SharedComplaint";
import { Metadata } from "next";
import { getComplaintById } from "../actions/complaint";

// interface PageProps {
//   params: {
//     complaintId: string;
//   };
// }

export async function generateMetadata({ params }: any): Promise<Metadata> {
  const awaitedParams = params;
  const res = await getComplaintById(Number(awaitedParams.complaintId));

  if (!res) {
    return {
      title: "Complaint Not Found",
      description: "The requested complaint could not be loaded.",
    };
  }

  const complaint = res;

  let imageUrl: string | undefined;

  if (complaint) {
    if (complaint.imageUrls?.length && complaint.imageUrls?.length > 0) {
      imageUrl = complaint.imageUrls[0];
    } else if (complaint.videoUrls?.length && complaint.videoUrls?.length > 0) {
      imageUrl = complaint.videoUrls[0];
    }
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://better-gondia-bot.vercel.app";

  return {
    title: complaint ? `Complaint #${complaint.id}` : "Complaint Detail",
    description: complaint?.description ?? "See details of this complaint.",
    openGraph: {
      title: complaint ? `Complaint #${complaint.id}` : "Complaint Detail",
      description: complaint?.description ?? "See details of this complaint.",
      images: imageUrl ? [imageUrl] : [],
      url: `${baseUrl}/${awaitedParams.complaintId}`,
    },
    twitter: {
      card: imageUrl ? "summary_large_image" : "summary",
      title: complaint ? `Complaint #${complaint.id}` : "Complaint Detail",
      description: complaint?.description ?? "See details of this complaint.",
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

export default async function ComplaintDetailPage({ params }: any) {
  const awaitedParams = await params;
  return <SharedComplaint complaintId={awaitedParams.complaintId} />;
}
