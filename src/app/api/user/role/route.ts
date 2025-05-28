import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth, unstable_update as update } from "@/auth";
import connectDB from "@/config/db";
import mongoose from "mongoose";
import { roleUpdateSchema } from "./schema";
import { fromZodError } from "zod-validation-error";

// Import models to ensure they're registered
import User from "@/models/user/user";
import "@/models/user/candidate"; // Import to register discriminator
import "@/models/user/employer";  // Import to register discriminator
import "@/models/user/none";      // Import to register discriminator

export async function PUT(request: NextRequest) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({
      error: "Unauthorized",
      data: null
    }, { status: 401 });
  }

  console.log("user session", session);

  try {
    await connectDB();

    const body = await request.json();
    console.log("Request body:", body);

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
    const userId = session.user.id;

    console.log("Updating user:", userId, "to role:", role);
    console.log("Available discriminators:", Object.keys(User.discriminators || {}));

    // Method 1: Use direct collection update to bypass Mongoose discriminator issues
    const directUpdate = await User.collection.updateOne(
      { _id: new mongoose.Types.ObjectId(userId) },
      { 
        $set: { 
          role: role,
          __t: role,
          updatedAt: new Date()
        }
      }
    );

    console.log("Direct update result:", directUpdate);

    if (directUpdate.matchedCount === 0) {
      return NextResponse.json({
        error: "User not found",
        data: null
      }, { status: 404 });
    }

    // Clear any cached model instances
    if (mongoose.connection.models.User) {
      delete (mongoose.connection.models.User as any)._compiledSchemas;
    }

    // Fetch the updated user using the base User model
    const updatedUser = await User.findById(userId).lean();
    
    if (!updatedUser) {
      return NextResponse.json({
        error: "Failed to fetch updated user",
        data: null
      }, { status: 500 });
    }

    console.log("Updated user from DB:", updatedUser);

    // Verify the role was actually updated
    if (updatedUser.role !== role) {
      console.error("Role update failed. Expected:", role, "Got:", updatedUser.role);
      return NextResponse.json({
        error: "Role update verification failed",
        data: null
      }, { status: 500 });
    }

    // Update the session with the new role
    try {
      await update({
        user: {
          ...session.user,
          role: role as 'candidate' | 'employer' | 'none'
        }
      });
      console.log("Session updated successfully");
    } catch (sessionError) {
      console.error("Session update error:", sessionError);
      // Continue even if session update fails
    }

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