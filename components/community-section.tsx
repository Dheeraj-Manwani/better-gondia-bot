import React, { useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { User, Complaint, Visibility } from "@/types";
import { Users } from "lucide-react";
// import {
//   formatTimeAgo,
//   generateComplaintIdFromDate,
//   getCategoryIcon,
// } from "@/lib/utils";
import { CommunityComplaintCard } from "./CommunityComplaintCard";
import { useSession } from "next-auth/react";
import { appSession } from "@/lib/auth";
import { Spinner } from "./ui/spinner";
import { useLoaderStore } from "@/store/loader";
import { toast } from "sonner";
import { dummyData } from "@/lib/data";

interface CommunitySectionProps {
  user: User;
}

export default function CommunitySection({ user }: CommunitySectionProps) {
  // const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(
  //   null
  // );

  // const { toast } = useToast();
  // const queryClient = useQueryClient();
  const session = useSession() as unknown as appSession;
  const showLoader = useLoaderStore((state) => state.showLoader);

  const { data: complaints, isLoading } = useQuery<{
    data: { complaints: Complaint[] };
  }>({
    queryKey: ["/api/complaints"],
  });

  const toggleVisibility = useMutation({
    mutationFn: async ({
      complaintId,
      value,
      type,
    }: {
      complaintId: number;
      value: boolean;
      type: Visibility;
    }) => {
      const id = toast.loading("Changing Visibility...");

      const response = await fetch("/api/visibility", {
        method: "PATCH",
        body: JSON.stringify({ complaintId, value, type }),
        credentials: "include",
      });
      if (!response.ok) {
        toast.error("Something went wrong !!", { id });
        throw new Error("Failed to create complaint");
      }
      toast.success("Done !!", { id });
      return response.json();
    },
    onSuccess: (response: { complaintId: string }) => {
      // showLoader(false);
    },
    onError: (error: Error) => {},
  });

  const coSignMutation = useMutation({
    mutationFn: async (complaintId: number) => {
      const response = await apiRequest(
        "POST",
        `/api/complaints/${complaintId}/co-sign`,
        {}
      );
      return response.json();
    },
    onSuccess: () => {
      // queryClient.invalidateQueries({ queryKey: ["/api/complaints/public"] });
    },
    onError: (error: Error) => {},
  });

  const handleCoSign = (complaintId: number) => {
    coSignMutation.mutate(complaintId);
  };

  const handleToggleVisibility = (
    complaintId: number,
    value: boolean,
    type: Visibility
  ) => {
    // showLoader(true);
    toggleVisibility.mutate({ complaintId, value, type });
  };

  // const getStatusColor = (status: string) => {
  //   const colors: Record<string, string> = {
  //     submitted: "bg-blue-100 text-blue-800",
  //     forwarded: "bg-yellow-100 text-yellow-800",
  //     resolved: "bg-green-100 text-green-800",
  //   };
  //   return colors[status] || "bg-gray-100 text-gray-800";
  // };

  // const getInitials = (firstName: string, lastName: string) => {
  // const getInitials = (name: string) => {
  //   const names = name.split(" ");
  //   return `${names[0].charAt(0)}${names[1].charAt(0)}`.toUpperCase();
  // };

  if (isLoading) {
    return <Spinner blur />;
  }

  console.log("complaints ===== ", complaints);

  return (
    <div className="h-full flex flex-col">
      {/* Community Header */}
      <div className="bg-white px-4 py-2.5 border-b border-gray-200">
        <h2 className="font-semibold ">Gondia Public Wall</h2>
        <p className="text-sm ">
          See what others are reporting • Co-sign to support
        </p>
      </div>

      {/* Community Feed */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-4 p-4">
          {/* {dummyData.data.complaints.map((complaint) => ( */}
          {complaints?.data?.complaints?.map((complaint) => (
            <CommunityComplaintCard
              key={complaint.id}
              complaint={complaint}
              handleCoSign={handleCoSign}
              isLoading={coSignMutation.isPending}
              handleToggleVisibility={handleToggleVisibility}
              role={session?.data?.user?.role ?? "USER"}
            />
          ))}

          {(!complaints || complaints.data.complaints.length === 0) && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">
                No Public Complaints
              </h3>
              <p className="text-gray-500 text-sm">
                Be the first to share a complaint with the community!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
