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

    // const { orgId, eventId, requestBody: complaintData } = body;

    // Create email content with complete request body JSON
    const emailContent = `
      <h2>New Complaint Received</h2>
      
      <h3>Complete Request Body</h3>
      <pre style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto; font-family: 'Courier New', monospace; white-space: pre-wrap;">
${JSON.stringify(body, null, 2)}
      </pre>
    `;

    // Send email using Resend
    const emailResponse = await resend.emails.send({
      from: "portfolio@updates.bydm.site",
      // to: "tarun.manuja@gmail.com",
      to: "dkmanwani2000@gmail.com",
      subject: `New Complaint:`,
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
        // to: "tarun.manuja@gmail.com",
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
