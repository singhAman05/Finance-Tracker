import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, message, rating } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required." },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format." },
        { status: 400 }
      );
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #6366F1;">New Feedback from FinanceTracker Blog</h2>
        <hr style="border: 1px solid #e5e7eb;" />
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Rating:</strong> ${rating || "Not provided"}/5</p>
        <h3>Message:</h3>
        <p style="background: #f9fafb; padding: 12px; border-radius: 8px;">${message}</p>
        <hr style="border: 1px solid #e5e7eb;" />
        <p style="color: #6b7280; font-size: 12px;">Sent from FinanceTracker Engineering Blog feedback form</p>
      </div>
    `;

    await transporter.sendMail({
      from: `"FinanceTracker Feedback" <${process.env.SMTP_USER}>`,
      to: "amanshankarsingh2001@gmail.com",
      replyTo: email,
      subject: `Blog Feedback from ${name} - Rating: ${rating || "N/A"}/5`,
      html: htmlContent,
    });

    return NextResponse.json({ success: true, message: "Feedback sent successfully!" });
  } catch (error) {
    console.error("Feedback email error:", error);
    return NextResponse.json(
      { error: "Failed to send feedback. Please try again later." },
      { status: 500 }
    );
  }
}
