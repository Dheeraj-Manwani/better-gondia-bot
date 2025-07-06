// app/api/complaints/route.ts
import prisma from "@/prisma/db";
import { NextRequest } from "next/server";

// Helper to parse FormData arrays
function getFormDataArray(form: FormData, key: string) {
  const arr: string[] = [];
  let i = 0;
  while (form.has(`${key}[${i}]`)) {
    arr.push(form.get(`${key}[${i}]`) as string);
    i++;
  }
  return arr;
}

// GET endpoint to fetch complaints for a userId
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    console.log("userId and searchParam ===== ", userId, searchParams);

    if (!userId) {
      return Response.json(
        { error: "userId parameter is required" },
        { status: 400 }
      );
    }

    const userIdNumber = parseInt(userId, 10);

    if (isNaN(userIdNumber)) {
      return Response.json(
        { error: "userId must be a valid number" },
        { status: 400 }
      );
    }

    const complaints = await prisma.complaint.findMany({
      where: {
        userId: userIdNumber,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            mobile: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform the data to match the frontend Complaint interface
    const transformedComplaints = complaints.map((complaint) => ({
      id: complaint.id,
      complaintId: complaint.id.toString(), // Using id as complaintId for now
      userId: complaint.userId,
      title: complaint.title,
      description: complaint.description,
      category: complaint.category,
      location: complaint.location,
      latitude: complaint.latitude,
      longitude: complaint.longitude,
      status: complaint.status,
      department: undefined, // Not in schema yet
      priority: "medium", // Default priority
      imageUrl: complaint.imageUrls?.[0], // Use first image as main image
      videoUrl: complaint.videoUrls?.[0], // Use first video as main video
      isPublic: complaint.isPublic,
      isResolved: complaint.status === "resolved",
      resolvedAt:
        complaint.status === "resolved"
          ? complaint.updatedAt.toISOString()
          : undefined,
      createdAt: complaint.createdAt.toISOString(),
      updatedAt: complaint.updatedAt.toISOString(),
      coSignCount: 0, // Default value, implement co-sign functionality later
    }));

    return Response.json({
      success: true,
      data: {
        complaints: transformedComplaints,
        count: transformedComplaints.length,
      },
    });
  } catch (error) {
    console.error("Error fetching complaints:", error);
    return Response.json(
      {
        error: "Failed to fetch complaints",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const form = await req.formData();

  // Required fields
  const description = form.get("description") as string;
  const category = form.get("category") as string;
  const isPublic = form.get("isPublic") === "true";
  const userId = Number(form.get("userId")) ?? 0;

  // Optional fields
  const location = form.get("location") as string | undefined;
  const latitude = form.get("latitude") as string | undefined;
  const longitude = form.get("longitude") as string | undefined;
  const messages = form.get("messages") as string;
  const imageUrls = getFormDataArray(form, "imageUrls");
  const videoUrls = getFormDataArray(form, "videoUrls");

  console.log("Creating complaint with data :::::::::: ", {
    userId,
    title: description, // Or use a separate title if you have one
    description,
    messages,
    category,
    location,
    latitude,
    longitude,
    imageUrls,
    videoUrls,
    isPublic,
  });

  try {
    const complaint = await prisma.complaint.create({
      data: {
        userId,
        title: description, // Or use a separate title if you have one
        description,
        category,
        location,
        latitude,
        longitude,
        imageUrls,
        videoUrls,
        isPublic,
      },
    });

    return Response.json({
      complaintId: complaint.id,
      success: true,
    });
  } catch (error) {
    return Response.json(
      {
        error: "Failed to create complaint",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
