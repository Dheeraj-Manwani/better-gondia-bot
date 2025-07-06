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

export async function POST(req: NextRequest) {
  const form = await req.formData();

  // Required fields
  const description = form.get("description") as string;
  const category = form.get("category") as string;
  const isPublic = form.get("isPublic") === "true";
  // TODO: Replace with real user ID from session/auth
  const userId = 1;

  // Optional fields
  const location = form.get("location") as string | undefined;
  const latitude = form.get("latitude") as string | undefined;
  const longitude = form.get("longitude") as string | undefined;
  const imageUrls = getFormDataArray(form, "imageUrls");
  const videoUrls = getFormDataArray(form, "videoUrls");

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
        // status, createdAt, updatedAt are handled by defaults
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
