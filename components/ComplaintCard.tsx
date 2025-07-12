import {
  cn,
  formatCreatedAtLabel,
  generateComplaintIdFromDate,
} from "@/lib/utils";
import { Complaint } from "@/types";
import { Button } from "./ui/button";
import clsx from "clsx";

export const ComplaintCard = ({
  complaint,
  handleOpenExistingChat,
}: {
  complaint: Complaint;
  handleOpenExistingChat: (mess: string) => void;
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return "🕑";
      case "in_progress":
        return "⌛";
      case "resolved":
        return "✅";
      case "closed":
        return "❌";
      default:
        return "☑️";
    }
  };
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-200 w-full max-w-md flex flex-col gap-2 mb-2">
      {/* <!-- Header --> */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span className="font-medium text-gray-800">{complaint.category}</span>
        <span className="text-xs font-mono text-gray-400">
          {generateComplaintIdFromDate(complaint.id, complaint.createdAt)}
        </span>
      </div>

      {/* <!-- Description --> */}
      <p className="text-gray-700 text-sm line-clamp-2">
        {/* Garbage is not being collected regularly in our colony near ABC Road.
        It&apos;s smelling bad. */}
        {complaint.description}
      </p>

      {/* <!-- Media thumbnails --> */}
      {/* <div className="flex gap-2 mt-1">
        <img
          src="/example1.jpg"
          alt="Complaint image"
          className="w-16 h-16 rounded object-cover border"
        />
        <video
          src="/example2.mp4"
          className="w-16 h-16 rounded object-cover border"
          muted
          loop
        ></video>
      </div> */}

      {/* <!-- Footer --> */}
      <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
        <span>{complaint.location ? "📍" + complaint.location : ""}</span>
        <span>{formatCreatedAtLabel(complaint.createdAt)}</span>
      </div>

      {/* <!-- Status and Button --> */}
      <div className="flex items-center justify-between mt-2">
        <span
          className={cn(
            "px-2.5 py-1.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700",
            getStatusColor(complaint.status)
          )}
        >
          {getStatusIcon(complaint.status) + " "} {complaint.status}
        </span>
        <Button
          className="text-blue-600 text-sm font-medium hover:underline p-0 m-0 mr-2"
          variant={"link"}
          onClick={() => handleOpenExistingChat(complaint.messages)}
        >
          View Details
        </Button>
      </div>
      {/* <div>{JSON.stringify(complaint)}</div> */}
    </div>
  );
};
