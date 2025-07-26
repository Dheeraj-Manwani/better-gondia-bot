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
      title: complaint.title,
      description: complaint.description,
      category: complaint.category,
      location: complaint.location,
      latitude: complaint.latitude,
      longitude: complaint.longitude,
      status: complaint.status,
      imageUrls: complaint.imageUrls,
      videoUrls: complaint.videoUrls,
      isMediaApproved: complaint.isMediaApproved,
      isPublic: complaint.isPublic,
      coSignCount: complaint.coSignCount,
      isCoSigned: false,
      isReported: false,
      createdAt: complaint.createdAt.toISOString(),
      updatedAt: complaint.updatedAt.toISOString(),
      messages: complaint.messages,
    };

    return transformedComplaint;
  } catch (error) {
    return false;
  }
};
