import prisma from "@/prisma/db";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { complaintId: string } }
) {
  const complaintId = Number((await params).complaintId);
  if (!complaintId || isNaN(complaintId)) {
    return Response.json({ error: "Invalid complaint ID" }, { status: 400 });
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
      return Response.json({ error: "Complaint not found" }, { status: 404 });
    }

    // Transform to match frontend expectations
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
      isCoSigned: false, // You can enhance this with session/user info
      isReported: false, // You can enhance this with session/user info
      createdAt: complaint.createdAt.toISOString(),
      updatedAt: complaint.updatedAt.toISOString(),
      messages: complaint.messages,
    };

    return Response.json({ complaint: transformedComplaint });
  } catch (error) {
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
