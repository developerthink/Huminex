import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { unstable_update as update } from '@/auth';
import connectDB from '@/config/db';
import User from '@/models/user/user';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { role } = await request.json();
    
    if (!['candidate', 'employer'].includes(role)) {
      return NextResponse.json(
        { message: 'Invalid role' },
        { status: 400 }
      );
    }

    await connectDB();
    
    // Update the user's role in the database
    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      { role },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Update the session with the new role
    await update({
      ...session,
      user: {
        ...session.user,
        role: role as 'candidate' | 'employer'
      }
    });

    return NextResponse.json(
      { message: 'Role updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating role:', error);
    return NextResponse.json(
      { message: 'An error occurred while updating role' },
      { status: 500 }
    );
  }
}

