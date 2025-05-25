import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import connectDB from '@/config/db';
import User from '@/models/user/user';
import { auth } from '@/auth';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
  
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized', data: null },
        { status: 401 }
      );
    }
  
    try {
      await connectDB();
  
      const { id } = await params;
  
      if (!id) {
        return NextResponse.json(
          { error: 'User ID is required', data: null },
          { status: 400 }
        );
      }
  
      // Find user by ID
      const user = await User.findById(id);
  
      if (!user) {
        return NextResponse.json(
          { error: 'User not found', data: null },
          { status: 404 }
        );
      }
  
      return NextResponse.json({
        error: null,
        data: user
      }, { status: 200 });
  
    } catch (error) {
      console.error('Error fetching user data:', error);
      return NextResponse.json(
        { error: 'Internal server error', data: null },
        { status: 500 }
      );
    }
  } 