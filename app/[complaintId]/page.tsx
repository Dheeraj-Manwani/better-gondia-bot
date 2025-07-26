"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";

import { CommunityComplaintCard } from "@/components/CommunityComplaintCard";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Complaint, User } from "@/types";
import { useSession } from "next-auth/react";
import { appSession } from "@/lib/auth";
import { useCompId } from "@/store/compId";
import { useModal } from "@/store/modal";
import { TopHeader } from "@/components/TopHeader";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSections } from "@/store/section";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { complaintId: string };
}): Promise<Metadata> {
  // Fetch complaint data from the API
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/complaints/${
      params.complaintId
    }`
  );
  const data = await res.json();
  const complaint = data.complaint;

  let imageUrl = undefined;
  if (complaint) {
    if (complaint.imageUrls && complaint.imageUrls.length > 0) {
      imageUrl = complaint.imageUrls[0];
    } else if (complaint.videoUrls && complaint.videoUrls.length > 0) {
      imageUrl = complaint.videoUrls[0]; // Some platforms support video preview, fallback to video URL
    }
  }

  return {
    title: complaint ? `Complaint #${complaint.id}` : "Complaint Detail",
    description: complaint
      ? complaint.description
      : "See details of this complaint.",
    openGraph: {
      title: complaint ? `Complaint #${complaint.id}` : "Complaint Detail",
      description: complaint
        ? complaint.description
        : "See details of this complaint.",
      images: imageUrl ? [imageUrl] : [],
      url: `${process.env.NEXT_PUBLIC_BASE_URL || ""}/$${params.complaintId}`,
    },
    twitter: {
      card: imageUrl ? "summary_large_image" : "summary",
      title: complaint ? `Complaint #${complaint.id}` : "Complaint Detail",
      description: complaint
        ? complaint.description
        : "See details of this complaint.",
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

export default function ComplaintDetailPage() {
  const router = useRouter();
  const params = useParams();
  const complaintId = params.complaintId;
  const session = useSession() as unknown as appSession;
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const setCompId = useCompId((state) => state.setCompId);
  const setIsOpen = useModal((state) => state.setIsOpen);
  const setSection = useSections((state) => state.setSection);

  useEffect(() => {
    if (!complaintId) return;
    const givenCompId =
      typeof complaintId == "string" ? complaintId : complaintId[0];
    setSection("community");
    setCompId(Number(givenCompId));

    const currentUserData = localStorage.getItem("userData");

    if (currentUserData) {
      const parsedCurrentUser: User = JSON.parse(currentUserData);
      if (parsedCurrentUser.id) {
        router.push("/");
      }
    }
    setLoading(true);
    fetch(`/api/complaints/${complaintId}`)
      .then((res) => res.json())
      .then((data) => {
        setComplaint(data.complaint || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [complaintId]);

  if (loading) return <Spinner blur />;
  if (!complaint)
    return <div className="p-8 text-center">Complaint not found.</div>;

  // Dummy handlers for required props
  const openLoginPortal = () => {
    setIsOpen(true, "GoToHome");
  };
  const handleToggleVisibility = () => {};

  return (
    <div className="max-w-xl mx-auto ">
      <TopHeader isView />
      <CommunityComplaintCard
        complaint={complaint}
        handleCoSign={openLoginPortal}
        isLoading={false}
        handleToggleVisibility={handleToggleVisibility}
        handleReport={openLoginPortal}
        role={session?.data?.user?.role ?? "USER"}
        isShared={false}
      />
      <div className="flex flex-col gap-3 mt-6 mb-24">
        <Button
          className="text-green-600 hover:text-green-700 bg-green-100 hover:bg-green-200 w-2/3 m-auto border border-green-600"
          onClick={() => {
            setSection("chat");
            router.push("/");
          }}
        >
          Submit a complaint
        </Button>
        <Button
          className="text-green-600 hover:text-green-700 bg-green-100 hover:bg-green-200 w-2/3 m-auto border border-green-600"
          onClick={() => {
            setSection("community");
            router.push("/");
          }}
        >
          View other complaints
        </Button>
      </div>
    </div>
  );
}
