import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import {
  PrismaClient,
  AuthType,
  ComplaintPhase,
  ComplaintType,
  Language,
} from "@prisma/client";
import AWS from "aws-sdk";
import prisma from "@/prisma/db";
import { generateComplaintIdFromDate } from "@/lib/clientUtils";
import { customAlphabet } from "nanoid";
import { downloadAndUploadToS3 } from "@/app/actions/s3";
import { sendWhatsAppConfirmation } from "@/app/actions/whatsapp";
import { generateSlug, generateUniqueUserSlug } from "@/app/actions/slug";

const resend = new Resend(process.env.RESEND_API_KEY);

// Configure AWS
AWS.config.update({
  region: "ap-south-1",
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const s3 = new AWS.S3();

interface ComplaintRequestBody {
  fileType: string;
  msgfile: string;
  msgType: string;
  whatsappReplyMsgId: string | null;
  whatsappMsgId: string;
  msgDate: string;
  message: string | null;
  customerName: string;
  mobileNo: string;
  ticketStatus?: string;
  businessNumber?: string;
  businessName?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ComplaintRequestBody = await request.json();

    // Validate required fields
    if (!body.mobileNo || !body.customerName) {
      return NextResponse.json(
        { error: "Missing required fields: mobileNo and customerName" },
        { status: 400 }
      );
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { mobile: body.mobileNo },
    });

    if (!user) {
      // Generate unique slug for new user
      const uniqueSlug = await generateUniqueUserSlug();

      // Create new user
      user = await prisma.user.create({
        data: {
          name: body.customerName,
          mobile: body.mobileNo,
          slug: uniqueSlug,
          authType: AuthType.DETAILS,
        },
      });
    }

    let complaint = null;
    let phase = null;

    // Handle media upload for the most recent completed complaint
    if (body.fileType && body.msgfile && body.msgType === "text") {
      // Find the most recent completed complaint for this user
      complaint = await prisma.complaint.findFirst({
        where: {
          userId: user.id,
        },
        orderBy: {
          createdAt: "desc", // Get the most recent completed complaint
        },
      });

      if (complaint) {
        let s3Url = null;

        if (body.fileType.startsWith("image/")) {
          s3Url = await downloadAndUploadToS3(body.msgfile, body.fileType);
          if (s3Url) {
            await prisma.complaint.update({
              where: { id: complaint.id },
              data: {
                imageUrls: {
                  push: `${process.env.NEXT_PUBLIC_CLOUDFRONT_URL}/${s3Url}`,
                },
              },
            });
          }
        } else if (body.fileType.startsWith("video/")) {
          s3Url = await downloadAndUploadToS3(body.msgfile, body.fileType);
          if (s3Url) {
            await prisma.complaint.update({
              where: { id: complaint.id },
              data: {
                videoUrls: {
                  push: `${process.env.NEXT_PUBLIC_CLOUDFRONT_URL}/${s3Url}`,
                },
              },
            });
          }
        }

        if (complaint.phase === ComplaintPhase.COMPLETED) {
          return NextResponse.json({
            success: true,
            message: "Media uploaded successfully to recent complaint",
            complaintId: complaint.id,
            phase: "COMPLETED",
            mediaAdded: true,
          });
        } else {
          complaint = await prisma.complaint.update({
            where: { id: complaint.id },
            data: { phase: ComplaintPhase.COMPLETED },
          });
        }
      }
    }

    // Find existing complaint with the least phase (most incomplete) for this user
    // We need to fetch all incomplete complaints and sort them by phase priority
    if (!complaint) {
      const incompleteComplaints = await prisma.complaint.findMany({
        where: {
          userId: user.id,
          phase: {
            not: ComplaintPhase.COMPLETED,
          },
        },
        orderBy: {
          createdAt: "asc", // If multiple complaints have same phase, get the oldest one
        },
      });

      // Define phase priority order (lower number = higher priority)
      const phasePriority = {
        [ComplaintPhase.INIT]: 1,
        [ComplaintPhase.LANGUAGE]: 2,
        [ComplaintPhase.COMPLAINT_TYPE]: 3,
        [ComplaintPhase.CATEGORY]: 4,
        [ComplaintPhase.DESCRIPTION]: 5,
        [ComplaintPhase.COMPLETED]: 6,
      };

      // Sort complaints by phase priority, then by creation date
      complaint =
        incompleteComplaints.sort((a, b) => {
          const priorityDiff = phasePriority[a.phase] - phasePriority[b.phase];
          if (priorityDiff !== 0) return priorityDiff;
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        })[0] || null;
    }
    // Determine the current phase and update accordingly
    if (!complaint) {
      // Create new complaint in INIT phase with random UUID
      complaint = await prisma.complaint.create({
        data: {
          userId: user.id,
          phase: ComplaintPhase.INIT,
          language: Language.ENGLISH,
        },
      });

      return NextResponse.json({
        success: true,
        message: "New complaint initiated",
        complaintId: complaint.id,
        phase: "INIT",
      });
    } else {
      phase = complaint.phase;
    }

    // Update complaint based on the message content and current phase
    let updatedComplaint = complaint;

    if (body.message) {
      switch (phase) {
        case "INIT":
          // This should be the language selection
          if (["English", "Hindi", "Marathi"].includes(body.message)) {
            const languageMap = {
              English: Language.ENGLISH,
              Hindi: Language.HINDI,
              Marathi: Language.MARATHI,
            };
            updatedComplaint = await prisma.complaint.update({
              where: { id: complaint.id },
              data: {
                language: languageMap[body.message as keyof typeof languageMap],
                phase: ComplaintPhase.LANGUAGE,
              },
            });
          }
          return NextResponse.json({
            success: true,
            message: "Stored Language Successfully",
            complaintId: complaint.id,
            phase: "LANGUAGE",
          });

        case "LANGUAGE":
          // This should be the complaint type selection
          if (["Complaint", "Suggestion"].includes(body.message)) {
            const complaintTypeMap = {
              Complaint: "COMPLAINT",
              Suggestion: "SUGGESTION",
            };
            updatedComplaint = await prisma.complaint.update({
              where: { id: complaint.id },
              data: {
                type: complaintTypeMap[
                  body.message as keyof typeof complaintTypeMap
                ] as ComplaintType,
                phase: ComplaintPhase.COMPLAINT_TYPE,
              },
            });
          }
          return NextResponse.json({
            success: true,
            message: "Stored COMPLAINT_TYPE Successfully",
            complaintId: complaint.id,
            phase: "COMPLAINT_TYPE",
          });

        case "COMPLAINT_TYPE":
          // This should be the category selection
          updatedComplaint = await prisma.complaint.update({
            where: { id: complaint.id },
            data: {
              category: body.message,
              phase: ComplaintPhase.CATEGORY,
            },
          });
          return NextResponse.json({
            success: true,
            message: "Stored CATEGORY Successfully",
            complaintId: complaint.id,
            phase: "CATEGORY",
          });

        case "CATEGORY":
          // This should be the description
          updatedComplaint = await prisma.complaint.update({
            where: { id: complaint.id },
            data: {
              description: body.message,
              phase: ComplaintPhase.DESCRIPTION,
            },
          });
          return NextResponse.json({
            success: true,
            message: "Stored DESCRIPTION Successfully",
            complaintId: complaint.id,
            phase: "DESCRIPTION",
          });
      }
    }

    // Send email notification when complaint is completed
    if (phase === "COMPLETED" && updatedComplaint) {
      const formattedComplaintId = generateComplaintIdFromDate(
        updatedComplaint.id,
        updatedComplaint.createdAt
      );
      const emailContent = `
        <h2>New Complaint Received via WhatsApp</h2>
        
        <h3>Complaint Details</h3>
        <table style="border-collapse: collapse; width: 100%;">
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Complaint ID:</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${formattedComplaintId}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Customer Name:</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${
              body.customerName
            }</td>
          </tr>
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Mobile Number:</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${
              body.mobileNo
            }</td>
          </tr>
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Language:</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${
              updatedComplaint.language
            }</td>
          </tr>
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Category:</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${
              updatedComplaint.category
            }</td>
          </tr>
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Description:</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${
              updatedComplaint.description
            }</td>
          </tr>
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Images:</td>
            <td style="border: 1px solid #ddd; padding: 8px;">
              ${
                updatedComplaint.imageUrls.length > 0
                  ? updatedComplaint.imageUrls.join(", ")
                  : "None"
              }
            </td>
          </tr>
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Videos:</td>
            <td style="border: 1px solid #ddd; padding: 8px;">
              ${
                updatedComplaint.videoUrls.length > 0
                  ? updatedComplaint.videoUrls.join(", ")
                  : "None"
              }
            </td>
          </tr>
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Created At:</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${updatedComplaint.createdAt.toISOString()}</td>
          </tr>
        </table>
        
        <h3>WhatsApp Message Details</h3>
      <pre style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto; font-family: 'Courier New', monospace; white-space: pre-wrap;">
${JSON.stringify(body, null, 2)}
      </pre>
    `;

      const emailResponse = await resend.emails.send({
        from: "portfolio@updates.bydm.site",
        to: "dkmanwani2000@gmail.com",
        subject: `New WhatsApp Complaint #${formattedComplaintId} - ${body.customerName}`,
        html: emailContent,
      });

      if (emailResponse.error) {
        console.error("Resend error:", emailResponse.error);
      }

      // Send WhatsApp confirmation message for completed complaint
      const whatsappConfirmationMessage = `✅ Thank you! Your complaint has been successfully submitted and recorded. 

       📋 Complaint ID: ${formattedComplaintId}
       👤 Name: ${body.customerName}
       📱 Mobile: ${body.mobileNo}
       📝 Category: ${updatedComplaint.category || "Not specified"}
       📄 Description: ${updatedComplaint.description || "Not provided"}

       Your complaint is now being processed. You will be notified of any updates.

       Thank you for helping make Gondia better! 🙏`;

      await sendWhatsAppConfirmation(
        body.mobileNo,
        whatsappConfirmationMessage
      );
    }

    return NextResponse.json({
      success: true,
      message: "Complaint processed successfully",
      complaintId: updatedComplaint?.id,
      phase: phase,
      userCreated: user === null,
    });
  } catch (error) {
    console.error("Error processing complaint:", error);

    // Send error notification email
    try {
      const errorTime = new Date().toISOString();
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      const errorStack =
        error instanceof Error ? error.stack : "No stack trace available";

      const errorEmailContent = `
        <h2>Error Occurred in New WhatsApp Complaint API</h2>
        
        <h3>Error Details</h3>
        <p><strong>Time:</strong> ${errorTime}</p>
        <p><strong>Error Message:</strong> ${errorMessage}</p>
        
        <h3>Stack Trace</h3>
        <pre style="background-color: #f5f5f5; padding: 10px; border-radius: 5px; overflow-x: auto;">
${errorStack}
        </pre>
        
        <h3>Request Information</h3>
        <p><strong>Method:</strong> POST</p>
        <p><strong>URL:</strong> ${request.url}</p>
        <p><strong>User Agent:</strong> ${
          request.headers.get("user-agent") || "Not available"
        }</p>
      `;

      await resend.emails.send({
        from: "portfolio@updates.bydm.site",
        to: "dkmanwani2000@gmail.com",
        subject: `WhatsApp Complaint API Error - ${errorTime}`,
        html: errorEmailContent,
      });
    } catch (emailError) {
      console.error("Failed to send error notification email:", emailError);
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
  // finally {
  //   // Close Prisma connection
  //   await prisma.$disconnect();
  // }
}
