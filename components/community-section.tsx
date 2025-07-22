import React, { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  User,
  Complaint,
  Visibility,
  CoSignVars,
  ReportVars,
  ReportReason,
} from "@/types";
import { Users } from "lucide-react";
import { CommunityComplaintCard } from "./CommunityComplaintCard";
import { useSession } from "next-auth/react";
import { appSession } from "@/lib/auth";
import { Spinner } from "./ui/spinner";
// import { useLoaderStore } from "@/store/loader";
import { toast } from "sonner";
import { useModal } from "@/store/modal";
import { generateComplaintIdFromDate } from "@/lib/clientUtils";
import debounce from "lodash.debounce";
// import { dummyData } from "@/lib/data";

interface CommunitySectionProps {
  user: User;
}

export default function CommunitySection({ user }: CommunitySectionProps) {
  const session = useSession() as unknown as appSession;
  const setIsOpen = useModal((state) => state.setIsOpen);
  // const showLoader = useLoaderStore((state) => state.showLoader);

  const { data: complaints, isLoading } = useQuery<{
    data: { complaints: Complaint[] };
  }>({
    queryKey: ["/api/complaints", user.id],
    queryFn: async () => {
      const response = await apiRequest(
        "GET",
        `/api/complaints?userId=${user.id}&&fetch=all`
      );
      return response.json();
    },
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
    // onSuccess: (response: { complaintId: string }) => {},
    // onError: (error: Error) => {},
  });

  const queryClient = useQueryClient();

  const coSignMutation = useMutation({
    mutationFn: async ({ userId, shouldApprove, complaintId }: CoSignVars) => {
      toast.loading("Co - Signing Complaint...");
      const response = await apiRequest(
        "POST",
        `/api/complaints/${complaintId}/co-sign`,
        { userId, shouldApprove, complaintId }
      );
      toast.success("Co - Sign Successfull!!");

      return response.json();
    },

    onMutate: async ({ shouldApprove, complaintId, userId }) => {
      const queryKey = ["/api/complaints", userId];

      await queryClient.cancelQueries({ queryKey });

      const prevData = queryClient.getQueryData<{
        data: { complaints: Complaint[] };
      }>(queryKey);

      queryClient.setQueryData(
        queryKey,
        (old: { data: { complaints: Complaint[] } }) => {
          if (!old) return old;

          const updatedComplaints = old.data.complaints.map((c) =>
            c.id === complaintId
              ? {
                  ...c,
                  isCoSigned: shouldApprove,
                  coSignCount:
                    c.coSignCount +
                    (shouldApprove && !c.isCoSigned
                      ? 1
                      : !shouldApprove && c.isCoSigned
                      ? -1
                      : 0),
                }
              : c
          );

          return { ...old, data: { complaints: updatedComplaints } };
        }
      );

      return { prevData, queryKey };
    },

    onError: (_err, _vars, context) => {
      if (context?.prevData) {
        queryClient.setQueryData(context.queryKey, context.prevData);
      }
    },

    onSettled: () => {
      // No refetching, as requested
    },
  });

  // Report mutation
  const reportMutation = useMutation({
    mutationFn: async ({
      userId,
      complaintId,
      reportReason,
      text,
    }: ReportVars) => {
      const response = await apiRequest(
        "POST",
        `/api/complaints/${complaintId}/report`,
        { userId, complaintId, reportReason, text }
      );
      return response.json();
    },
    onMutate: async ({ userId, complaintId, reportReason, text }) => {
      const queryKey = ["/api/complaints", userId];

      await queryClient.cancelQueries({ queryKey });

      const prevData = queryClient.getQueryData<{
        data: { complaints: Complaint[] };
      }>(queryKey);
      toast.success("Complaint reported.");

      queryClient.setQueryData(
        queryKey,
        (old: { data: { complaints: Complaint[] } }) => {
          if (!old) return old;

          const updatedComplaints = old.data.complaints.map((c) =>
            c.id === complaintId
              ? {
                  ...c,
                  isReported: true,
                }
              : c
          );

          return { ...old, data: { complaints: updatedComplaints } };
        }
      );

      return { prevData, queryKey };
    },
    onSuccess: (_data, { complaintId }) => {
      // queryClient.invalidateQueries({ queryKey: ["/api/complaints", user.id] });
    },
    onError: () => {
      // toast.error("Failed to report complaint.");
    },
  });

  const debouncedCoSign = useMemo(
    () =>
      debounce((vars: CoSignVars) => {
        coSignMutation.mutate(vars);
      }, 3000),
    [coSignMutation]
  );

  const handleCoSign = (complaintId: number) => {
    const shouldApprove = !complaints?.data?.complaints?.find(
      (c) => c.id === complaintId
    )?.isCoSigned;

    if (!user.id) {
      toast.error("Something went wrong, Please refresh the browser");
      return;
    }

    // coSignMutation.mutate({
    //   complaintId,
    //   userId: user.id,
    //   shouldApprove,
    // });
    debouncedCoSign({
      complaintId,
      userId: user.id,
      shouldApprove,
    });
  };

  const handleToggleVisibility = (
    complaintId: number,
    value: boolean,
    type: Visibility
  ) => {
    // showLoader(true);
    toggleVisibility.mutate({ complaintId, value, type });
  };

  const handleReport = (complaintId: number, createdAt: string) => {
    if (!user.id) {
      toast.error("Something went wrong, Please refresh the browser");
      return;
    }
    setIsOpen(true, "Report", {
      complaintId: generateComplaintIdFromDate(complaintId, createdAt),
      confirmationFunction: (reportReason: string, text?: string) => {
        console.log("Reporting with ::::::: ", {
          userId: user.id,
          complaintId,
          reportReason: reportReason as ReportReason,
          text,
        });

        user.id &&
          reportMutation.mutate({
            userId: user.id,
            complaintId,
            reportReason: reportReason as ReportReason,
            text,
          });
      },
    });
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
              handleReport={handleReport}
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
