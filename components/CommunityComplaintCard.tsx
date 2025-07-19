import { Flag, ThumbsUp, Trash2 } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Complaint, Visibility } from "@/types";
import {
  formatTimeAgo,
  generateComplaintIdFromDate,
  getCategoryIcon,
  getStatusColor,
  isAdmin,
} from "@/lib/clientUtils";
import { Role } from "@prisma/client/index-browser";
import { useEffect, useState } from "react";
import { Checkbox } from "./Checkbox";
import { useModal } from "@/store/modal";
import { GenericModal } from "./modal/GenericModal";

export const CommunityComplaintCard = ({
  complaint,
  handleCoSign,
  isLoading,
  handleToggleVisibility,
  role,
}: {
  complaint: Complaint;
  handleCoSign: (id: number) => void;
  isLoading: boolean;
  handleToggleVisibility: (
    id: number,
    isApproved: boolean,
    type: Visibility
  ) => void;
  role: Role;
}) => {
  const [isComplaintVisible, setIsComplaintVisible] = useState(false);
  const [isMediaVisible, setIsMediaVisible] = useState(false);
  // const setIsOpen = useModal((state) => state.setIsOpen);

  const handleComplaintCheckbox = () => {
    handleToggleVisibility(complaint.id, !isComplaintVisible, "COMPLAINT");
    setIsComplaintVisible(!isComplaintVisible);
  };

  const handleMediaCheckbox = () => {
    handleToggleVisibility(complaint.id, !isMediaVisible, "MEDIA");
    setIsMediaVisible(!isMediaVisible);
  };

  useEffect(() => {
    setIsComplaintVisible(complaint.isPublic);
    setIsMediaVisible(complaint.isMediaApproved);
  }, []);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      roads: "bg-blue-100 text-blue-800",
      water: "bg-blue-100 text-blue-800",
      electricity: "bg-yellow-100 text-yellow-800",
      sanitation: "bg-purple-100 text-purple-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  // const { isOpen: modalOpen, setIsOpen: setModalOpen } = useModal();
  return (
    <div
      key={complaint.id}
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-semibold text-sm">
                {/* {getInitials(user.name)} */}
                👤
              </span>
            </div>
            <div>
              <p className="font-medium text-sm ">
                {generateComplaintIdFromDate(complaint.id, complaint.createdAt)}
              </p>
              <p className="text-xs ">
                {/* Ward {Math.floor(Math.random() * 5) + 1} •{" "} */}
                {formatTimeAgo(complaint.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor(complaint.status)}>
              {complaint.status === "resolved" ? "RESOLVED" : complaint.status}
            </Badge>
          </div>
        </div>

        {/* Complaint Image */}
        {(complaint.isMediaApproved ||
          role == "ADMIN" ||
          role == "SUPERADMIN") &&
          complaint.imageUrls &&
          complaint.imageUrls.map((url) => (
            <img
              src={url}
              key={url}
              alt="Complaint"
              className=" object-cover rounded-lg mb-3"
            />
          ))}

        {(complaint.isMediaApproved || isAdmin(role)) &&
          complaint.videoUrls &&
          complaint.videoUrls.map((url, idx) => (
            <video
              key={idx}
              src={url}
              controls // Enables play, pause, seek, volume, fullscreen, etc.
              className="object-cover rounded-lg mb-3"
              style={{ maxWidth: "100%", height: "auto" }} // Optional: responsive sizing
            />
          ))}

        {/* Complaint Text */}
        <p className="text-sm  mb-3">{complaint.description}</p>

        {/* Location */}
        {complaint.location && (
          <p className="text-sm  mb-3">📍 {complaint.location}</p>
        )}

        {/* Resolved Update */}
        {/* {complaint.isResolved && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
          <p className="text-sm text-green-800">
            ✅ <strong>Update:</strong> This issue has been resolved
            by the concerned department.
          </p>
          <p className="text-xs text-green-600 mt-1">
            Resolved • {formatTimeAgo(complaint.resolvedAt!)}
          </p>
        </div>
      )} */}

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* <span className="flex items-center space-x-2 text-green-600">
              <ThumbsUp className="w-4 h-4" />
              <span className="text-sm font-medium">
                Supported by {complaint.coSignCount} people
              </span>
            </span> */}

            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-2 text-green-600 hover:text-green-700 hover:bg-green-50"
              onClick={() => handleCoSign(complaint.id)}
              disabled={isLoading}
            >
              <ThumbsUp className="w-4 h-4" />
              <span className="text-sm font-medium">
                Co-Sign ({complaint.coSignCount})
              </span>
            </Button>

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

      {isAdmin(role) && (
        <div className="bg-red-100 border-red-300 text-red-700 p-3 flex flex-col">
          <div className="tracking-wide ">Admin Controls</div>
          <div className="w-full flex justify-between">
            <Checkbox
              key={1}
              checked={isComplaintVisible}
              onChange={handleComplaintCheckbox}
              label="Complaint Visibility"
              className="w-1/2"
            />
            <Checkbox
              key={2}
              checked={isMediaVisible}
              onChange={handleMediaCheckbox}
              label="Media Visibility"
              className="w-1/2"
            />
            {/* <Button
              variant={"destructive"}
              className="w-2/6"
              onClick={() => setIsOpen(true)}
            >
              Delete <Trash2 />
            </Button> */}
          </div>
        </div>
      )}
    </div>
  );
};
