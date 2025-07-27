import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/db";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { SessionUser } from "@/types";

// GET: Fetch all active status updates, sorted by createdAt desc
export async function GET() {
  try {
    const updates = await prisma.statusUpdate.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(updates);
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to fetch status updates" },
      { status: 500 }
    );
  }
}

// POST: Create a new status update (admin/superadmin only)
export async function POST(req: NextRequest) {
  // @ts-expect-error to be taken care of
  const session = await getServerSession(authConfig);
  const user = session?.user as SessionUser;
  if (!user || (user.role !== "ADMIN" && user.role !== "SUPERADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const {
    title,
    description,
    imageUrl,
    videoUrl,
    complaintId,
    isActive,
    expiresAt,
  } = body;
  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }
  try {
    const newStatus = await prisma.statusUpdate.create({
      data: {
        title,
        description,
        imageUrl,
        videoUrl,
        complaintId,
        isActive: isActive !== undefined ? isActive : true,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      },
    });
    return NextResponse.json(newStatus, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to create status update" },
      { status: 500 }
    );
  }
}
