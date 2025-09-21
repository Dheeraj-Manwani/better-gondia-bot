import prisma from "@/prisma/db";
import { Complaint } from "@/types";

export const getComplaintById = async (
  complaintId: number | undefined | null
): Promise<Complaint | false> => {
  if (!complaintId || isNaN(complaintId)) {
    return false;
  }

  try {
    const complaint = await prisma.complaint.findUnique({
      where: { id: complaintId, isPublic: true },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            mobile: true,
          },
        },
      },
    });
    if (!complaint) {
      return false;
    }

    const transformedComplaint = {
      id: complaint.id,
      complaintId: complaint.id.toString(),
      userId: complaint.userId,
      title: complaint.title || "",
      description: complaint.description || "",
      category: complaint.category || "",
      location: complaint.location,
      latitude: complaint.latitude,
      longitude: complaint.longitude,
      status: complaint.status,
      // imageUrls: complaint.isMediaApproved ? complaint.imageUrls : undefined,
      // videoUrls: complaint.isMediaApproved ? complaint.videoUrls : undefined,
      media: complaint.media ? (complaint.media as any[]) : undefined,
      isMediaApproved: complaint.isMediaApproved,
      isPublic: complaint.isPublic,
      coSignCount: complaint.coSignCount,
      isCoSigned: false,
      isReported: false,
      createdAt: complaint.createdAt.toISOString(),
      updatedAt: complaint.updatedAt.toISOString(),
      // messages: complaint.messages,
    };

    return transformedComplaint;
  } catch (error) {
    return false;
  }
};

export const deleteComplaintById = async (
  complaintId: number | undefined | null
): Promise<{ success: boolean; message: string }> => {
  if (!complaintId || isNaN(complaintId)) {
    return { success: false, message: "Invalid complaint ID" };
  }

  try {
    // Check if complaint exists
    // const complaint = await prisma.complaint.findUnique({
    //   where: { id: complaintId },
    // });

    // if (!complaint) {
    //   return { success: false, message: "Complaint not found" };
    // }

    // Delete the complaint (cascade will handle related records)
    await prisma.complaint.delete({
      where: { id: complaintId },
    });

    return { success: true, message: "Complaint deleted successfully" };
  } catch (error) {
    console.error("Error deleting complaint:", error);
    return { success: false, message: "Failed to delete complaint" };
  }
};
