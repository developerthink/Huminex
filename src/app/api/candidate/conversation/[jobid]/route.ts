import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import connectDB from '@/config/db';
import Conversation from '@/models/conversation';
import Application from '@/models/application';
import { conversationSchema } from './schema';
import { fromZodError } from 'zod-validation-error';
import { auth } from '@/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ jobid: string }> }
) {
  const session = await auth();

  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized', data: null },
      { status: 401 }
    );
  }

  try {
    await connectDB();

    const candidateId = session.user.id;
    const { jobid } = await params;
    const body = await request.json();

    // Check if candidate has applied for this job
    const application = await Application.findOne({
      jobId: jobid,
      candidateId,
    });

    if (!application) {
      return NextResponse.json(
        {
          error: 'You do not have applied for this job',
          data: null
        },
        { status: 403 }
      );
    }

    // Validate request body using Zod schema
    const validationResult = conversationSchema.safeParse({
      ...body,
      jobId: jobid,
      candidateId
    });

    if (!validationResult.success) {
      const validationError = fromZodError(validationResult.error);
      return NextResponse.json(
        {
          error: validationError.message,
          data: null
        },
        { status: 400 }
      );
    }

    // Check if conversation already exists
    const existingConversation = await Conversation.findOne({
      jobId: jobid,
      candidateId
    });

    if (existingConversation) {
      return NextResponse.json(
        {
          error: 'Conversation already exists for this job',
          data: null
        },
        { status: 400 }
      );
    }

    // Create a new conversation
    const newConversation = await Conversation.create(validationResult.data);

    return NextResponse.json({
      error: null,
      data: newConversation
    });

  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        data: null
      },
      { status: 500 }
    );
  }
}