// app/api/complaints/route.ts
import { authConfig } from "@/lib/auth";
import { generateComplaintIdFromDate, getBotMessage } from "@/lib/clientUtils";
import prisma from "@/prisma/db";
import { ChatMessage, SessionUser } from "@/types";
import { Prisma } from "@prisma/client/index-browser";
import { getServerSession } from "next-auth";
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
    const fetchOption = searchParams.get("fetch");
    console.log("userId and searchParam ===== ", userId, searchParams);

    // if (!userId) {
    //   return Response.json(
    //     { error: "userId parameter is required" },
    //     { status: 400 }
    //   );
    // }

    const userIdNumber = parseInt(userId ?? "-1", 10);

    if (isNaN(userIdNumber)) {
      return Response.json(
        { error: "userId must be a valid number" },
        { status: 400 }
      );
    }

    console.log("user id number ", userIdNumber);

    // @ts-expect-error to be taken care of
    const session = await getServerSession(authConfig);
    const user = session?.user as SessionUser;

    console.log("Where obj :::::: ", {
      ...(fetchOption == "my" && { userId: userIdNumber }),
      ...((!user || user.role == "USER") &&
        fetchOption == "all" && { isPublic: true }),
    });

    const complaints = await prisma.complaint.findMany({
      where: {
        ...(fetchOption == "my" && { userId: userIdNumber }),
        ...((!user || user.role == "USER") &&
          fetchOption == "all" && { isPublic: true }),
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

    // Fetch both co-signs and reports in a single query
    let userInteractions: { complaintId: number; type: string }[] = [];
    if (userIdNumber && complaints.length > 0) {
      userInteractions = await prisma.interaction.findMany({
        where: {
          userId: userIdNumber,
          complaintId: { in: complaints.map((c) => c.id) },
        },
        select: {
          complaintId: true,
          type: true,
        },
      });
    }

    // Create sets for fast lookup
    const userCoSignedComplaintIds = new Set(
      userInteractions
        .filter((i) => i.type === "CO_SIGN")
        .map((i) => i.complaintId)
    );
    const userReportedComplaintIds = new Set(
      userInteractions
        .filter((i) => i.type === "REPORT")
        .map((i) => i.complaintId)
    );

    console.log("userInteractions ===== ", userInteractions);

    // Transform the data to match the frontend Complaint interface
    const transformedComplaints = complaints.map((complaint) => ({
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
      isCoSigned: userCoSignedComplaintIds.has(complaint.id),
      isReported: userReportedComplaintIds.has(complaint.id),

      createdAt: complaint.createdAt.toISOString(),
      updatedAt: complaint.updatedAt.toISOString(),
      messages: complaint.messages,
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
  let messages = form.get("messages") as string;
  const parsedMmessages: ChatMessage[] = JSON.parse(messages);

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
    const data = await prisma.$transaction(async (tx) => {
      const complaint = await tx.complaint.create({
        data: {
          userId,
          title: description,
          description,
          category,
          location,
          latitude,
          longitude,
          imageUrls,
          videoUrls,
        },
      });

      parsedMmessages.push(
        getBotMessage(
          `✅ Complaint submitted successfully! Your complaint ID is ${generateComplaintIdFromDate(
            complaint.id
          )}. We'll keep you updated on the progress.`
        )
      );
      parsedMmessages.push(
        getBotMessage(`Call to action (to be framed in requirement).`)
      );

      const stringMess = JSON.stringify(parsedMmessages);
      console.log("updating messages for complaint ", parsedMmessages);
      await tx.complaint.update({
        data: { messages: stringMess },
        where: {
          id: complaint.id,
        },
      });

      return complaint;
    });

    return Response.json({
      complaintId: data.id,
      success: true,
    });
  } catch (error: any) {
    if (
      // error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003" // Foreign key violation
    ) {
      console.error("Foreign key constraint failed:", error.meta?.field_name);
      return Response.json({
        error: "USER_NOT_FOUND",
        success: false,
      });
      // Handle missing user
    } else {
      console.error("Transaction failed:", error);
      return Response.json({
        error: "SERVER_ERROR",
        success: false,
      });

      // Handle other kinds of errors
    }
  }
}
