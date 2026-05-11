import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { feedbackEmailTemplate } from "@/lib/emailTemplates/feedbackEmail";

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

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return NextResponse.json(
        { error: "SMTP is not configured on the server." },
        { status: 500 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const htmlContent = feedbackEmailTemplate({ name, email, message, rating });

    await transporter.sendMail({
      from: process.env.SMTP_FROM || `"FinanceTracker Feedback" <${process.env.SMTP_USER}>`,
      to: process.env.FEEDBACK_TO_EMAIL || "amanshankarsingh2001@gmail.com",
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
