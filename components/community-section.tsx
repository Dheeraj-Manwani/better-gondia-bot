import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
// import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { User, Complaint } from "@/types";
import { ThumbsUp, Flag, ArrowLeft, Users } from "lucide-react";

interface CommunitySectionProps {
  user: User;
}

export default function CommunitySection({ user }: CommunitySectionProps) {
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(
    null
  );
  // const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: complaints, isLoading } = useQuery<
    (Complaint & { coSignCount: number })[]
  >({
    queryKey: ["/api/complaints/public"],
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
      // toast({
      //   title: "Co-signed Successfully",
      //   description: "Thank you for supporting this complaint!",
      // });
      queryClient.invalidateQueries({ queryKey: ["/api/complaints/public"] });
    },
    onError: (error: Error) => {
      // toast({
      //   title: "Failed to Co-sign",
      //   description: error.message,
      //   variant: "destructive",
      // });
    },
  });

  const handleCoSign = (complaintId: number) => {
    coSignMutation.mutate(complaintId);
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      roads: "🛣️",
      water: "💧",
      electricity: "⚡",
      sanitation: "🗑️",
    };
    return icons[category] || "📝";
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      roads: "bg-blue-100 text-blue-800",
      water: "bg-blue-100 text-blue-800",
      electricity: "bg-yellow-100 text-yellow-800",
      sanitation: "bg-purple-100 text-purple-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      submitted: "bg-blue-100 text-blue-800",
      forwarded: "bg-yellow-100 text-yellow-800",
      resolved: "bg-green-100 text-green-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  // const getInitials = (firstName: string, lastName: string) => {
  const getInitials = (name: string) => {
    const names = name.split(" ");
    return `${names[0].charAt(0)}${names[1].charAt(0)}`.toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-500">Loading complaints...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Community Header */}
      <div className="bg-white p-4 border-b border-gray-200">
        <h2 className="font-semibold ">Gondia Public Wall</h2>
        <p className="text-sm whatsapp-gray">
          See what others are reporting • Co-sign to support
        </p>
      </div>

      {/* Community Feed */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-4 p-4">
          {complaints?.map((complaint) => (
            <div
              key={complaint.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">
                        {getInitials(user.name)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-sm whatsapp-dark">
                        Anonymous Citizen
                      </p>
                      <p className="text-xs whatsapp-gray">
                        Ward {Math.floor(Math.random() * 5) + 1} •{" "}
                        {formatTimeAgo(complaint.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(complaint.status)}>
                      {complaint.status === "resolved"
                        ? "RESOLVED"
                        : complaint.complaintId}
                    </Badge>
                  </div>
                </div>

                {/* Complaint Image */}
                {complaint.imageUrl && (
                  <img
                    src={complaint.imageUrl}
                    alt="Complaint"
                    className="w-full h-48 object-cover rounded-lg mb-3"
                  />
                )}

                {/* Complaint Text */}
                <p className="text-sm whatsapp-dark mb-3">
                  {complaint.description}
                </p>

                {/* Location */}
                {complaint.location && (
                  <p className="text-sm whatsapp-gray mb-3">
                    📍 {complaint.location}
                  </p>
                )}

                {/* Resolved Update */}
                {complaint.isResolved && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                    <p className="text-sm text-green-800">
                      ✅ <strong>Update:</strong> This issue has been resolved
                      by the concerned department.
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      Resolved • {formatTimeAgo(complaint.resolvedAt!)}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {complaint.isResolved ? (
                      <span className="flex items-center space-x-2 text-green-600">
                        <ThumbsUp className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          Supported by {complaint.coSignCount} people
                        </span>
                      </span>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center space-x-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={() => handleCoSign(complaint.id)}
                        disabled={coSignMutation.isPending}
                      >
                        <ThumbsUp className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          Co-Sign ({complaint.coSignCount})
                        </span>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center space-x-2 text-gray-500 hover:text-red-500 hover:bg-red-50"
                    >
                      <Flag className="w-4 h-4" />
                      <span className="text-sm">Report</span>
                    </Button>
                  </div>
                  <Badge className={getCategoryColor(complaint.category)}>
                    {getCategoryIcon(complaint.category)} {complaint.category}
                  </Badge>
                </div>
              </div>
            </div>
          ))}

          {(!complaints || complaints.length === 0) && (
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
