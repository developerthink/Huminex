import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import connectDB from "@/config/db";
import Waitlist from "@/models/waitlist";
import { waitlistSchema } from "./schema";
import { fromZodError } from "zod-validation-error";
import { transporter } from "@/config/email";


export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const waitlistEntries = await Waitlist.find().sort({ createdAt: -1 });

    return NextResponse.json({
      error: null,
      data: waitlistEntries
    });
  } catch (error) {
    console.error("Error fetching waitlist:", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        data: null 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    const validationResult = waitlistSchema.safeParse(body);
    if (!validationResult.success) {
      const validationError = fromZodError(validationResult.error);
      return NextResponse.json(
        { error: validationError.message, data: null },
        { status: 400 }
      );
    }

    const userEmail = validationResult.data.email;

    const existingEmail = await Waitlist.findOne({ email: userEmail });
    if (existingEmail) {
      return NextResponse.json({
        error: "You are already on the waitlist",
        data: null
      });
    }

    const waitlistEntry = await Waitlist.create({
      email: userEmail
    });

    try {
      await transporter.sendMail({
        from: process.env.PERSONAL_EMAIL,
        to: userEmail,
        subject: "Welcome to Huminex Waitlist",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
            <h2 style="color: #4f46e5;">Thank you for joining the Huminex waitlist!</h2>
            <p>We're excited to have you on board. We'll notify you as soon as we launch our platform.</p>
            <p>Huminex is building AI-powered interviews that identify top talent efficiently and fairly.</p>
            <p>Stay tuned for updates!</p>
            <p>Best regards,<br />The Huminex Team</p>
          </div>
        `
      });
      console.log(`Confirmation email sent to ${userEmail}`);
    } catch (emailError) {
      console.error("Error sending confirmation email:", emailError);
    }

    return NextResponse.json({
      error: null,
      data: { message: "Added to waitlist successfully" }
    });

  } catch (error) {
    console.error("Error adding to waitlist:", error);
    return NextResponse.json(
      { error: "Internal server error", data: null },
      { status: 500 }
    );
  }
} 