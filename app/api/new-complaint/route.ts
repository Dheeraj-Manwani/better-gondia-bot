import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface ComplaintRequestBody {
  orgId: string;
  eventId: string;
  requestBody: {
    fileType: string;
    msgfile: string;
    msgType: string;
    whatsappReplyMsgId: string;
    whatsappMsgId: string;
    msgDate: string;
    message: string;
    customerName: string;
    mobileNo: string;
    ticketId: string;
    ticketStatus: string;
    businessNumber: string;
    businessName: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: ComplaintRequestBody = await request.json();

    // Validate required fields
    // if (!body.orgId || !body.eventId || !body.requestBody) {
    //   return NextResponse.json(
    //     { error: "Missing required fields" },
    //     { status: 400 }
    //   );
    // }

    const { orgId, eventId, requestBody: complaintData } = body;

    // Create email content
    const emailContent = `
      <h2>New Complaint Received</h2>
      
      <h3>Organization Details</h3>
      <p><strong>Organization ID:</strong> ${orgId}</p>
      <p><strong>Event ID:</strong> ${eventId}</p>
      
      <h3>Customer Information</h3>
      <p><strong>Customer Name:</strong> ${complaintData.customerName}</p>
      <p><strong>Mobile Number:</strong> ${complaintData.mobileNo}</p>
      <p><strong>Business Name:</strong> ${complaintData.businessName}</p>
      <p><strong>Business Number:</strong> ${complaintData.businessNumber}</p>
      
      <h3>Complaint Details</h3>
      <p><strong>Ticket ID:</strong> ${complaintData.ticketId}</p>
      <p><strong>Ticket Status:</strong> ${complaintData.ticketStatus}</p>
      <p><strong>Message:</strong> ${complaintData.message}</p>
      <p><strong>Message Type:</strong> ${complaintData.msgType}</p>
      <p><strong>File Type:</strong> ${complaintData.fileType}</p>
      <p><strong>Message Date:</strong> ${complaintData.msgDate}</p>
      
      <h3>WhatsApp Details</h3>
      <p><strong>WhatsApp Message ID:</strong> ${
        complaintData.whatsappMsgId
      }</p>
      <p><strong>WhatsApp Reply Message ID:</strong> ${
        complaintData.whatsappReplyMsgId
      }</p>
      
      ${
        complaintData.msgfile
          ? `<h3>Attachment</h3><p><strong>File:</strong> ${complaintData.msgfile}</p>`
          : ""
      }
    `;

    // Send email using Resend
    const emailResponse = await resend.emails.send({
      from: "portfolio@updates.bydm.site",
      to: "dkmanwani2000@gmail.com",
      subject: `New Complaint: ${complaintData.ticketId} - ${complaintData.customerName}`,
      html: emailContent,
    });

    if (emailResponse.error) {
      console.error("Resend error:", emailResponse.error);
      return NextResponse.json(
        { error: "Failed to send email notification" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Complaint received and email sent successfully",
      emailId: emailResponse.data?.id,
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
        <h2>Error Occurred in New Complaint API</h2>
        
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
        subject: `API Error Alert - New Complaint Route - ${errorTime}`,
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
}
