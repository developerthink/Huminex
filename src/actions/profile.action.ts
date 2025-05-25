"use server";

import { auth } from "@/auth";
import connectDB from "@/config/db";
import Candidate from "@/models/user/candidate";
import type { CandidateType } from "@/types/models/user/candidate";

export async function updateCandidateProfile(profileData: any): Promise<{
  error: string | null;
  data: CandidateType | null;
}> {
  const session = await auth();

  if (!session) {
    return {
      error: "Unauthorized",
      data: null,
    };
  }

  try {
    await connectDB();
    const userId = session.user.id;
    const updatedUser = (await Candidate.findByIdAndUpdate(
      userId,
      profileData,
      {
        new: true,
      }
    )) as CandidateType | null;
    console.log(updatedUser, 'updatedUser');    

    if (!updatedUser) {
      throw new Error("User not found");
    }
    const serializedData = JSON.parse(JSON.stringify(updatedUser));
    return {
      error: null,
      data: serializedData,
    };
  } catch (error) {
    console.error("Error updating candidate profile:", error);
    throw error;
  }
}
