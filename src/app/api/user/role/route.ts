import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth, unstable_update as update } from "@/auth";
import connectDB from "@/config/db";
import User from "@/models/user/user";
import { roleUpdateSchema } from "./schema";
import { fromZodError } from "zod-validation-error";

export async function PUT(request: NextRequest) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({
      error: "Unauthorized",
      data: null
    }, { status: 401 });
  }

  console.log("user session", session)

  try {
    await connectDB();

    const body = await request.json();

    // Validate request body
    const validationResult = roleUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      const validationError = fromZodError(validationResult.error);
      return NextResponse.json(
        { error: validationError.message, data: null },
        { status: 400 }
      );
    }

    const { role } = validationResult.data;

    // Convert string ID to MongoDB ObjectId
    const userId = session.user.id;

    // Update user role and status
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        role
      },
      { new: true }
    );
    console.log("role", role, "updatedUser", updatedUser)
    if (!updatedUser) {
      return NextResponse.json({
        error: "User not found",
        data: null
      }, { status: 404 });
    }

    // Update the session with the new role
    await update({
      user: {
        ...session.user,
        role: role as 'candidate' | 'employer'
      }
    });

    return NextResponse.json({
      message: "Role updated successfully",
      data: updatedUser
    });
  } catch (error) {
    console.error("Error updating role:", error);
    return NextResponse.json({
      error: "An error occurred while updating the role",
      data: null
    }, { status: 500 });
  }
}