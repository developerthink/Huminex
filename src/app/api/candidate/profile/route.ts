import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import connectDB from '@/config/db';
import Candidate from '@/models/user/candidate';
import type { CandidateType } from '@/types/models/user/candidate';
import { candidateProfileSchema } from './schema';
import { fromZodError } from 'zod-validation-error';
import { auth } from '@/auth';

export async function PUT(request: NextRequest) {
  const session = await auth();

  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized', data: null },
      { status: 401 }
    );
  }

  try {
    await connectDB();

    const body = await request.json();

    const profileData = body;
    const userId = session.user.id;
    console.log(userId, 'user id')

    // Update the candidate's profile
    const updatedUser = await Candidate.findByIdAndUpdate(
      userId,
      profileData,
    ) as CandidateType | null;

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found', data: null },
        { status: 404 }
      );
    }

    return NextResponse.json({
      error: null,
      data: updatedUser,
    });
  } catch (error) {
    console.error('Error updating candidate profile:', error);
    return NextResponse.json(
      { error: 'Internal server error', data: null },
      { status: 500 }
    );
  }
}