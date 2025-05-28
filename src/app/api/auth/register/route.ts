import { NextResponse } from 'next/server';
import connectDB from '@/config/db';
import User from '@/models/user/user';
import { RoleType } from '@/types/models/user/user';

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export async function POST(request: Request) {
  try {
    await connectDB();
    
    const { name, email, password } = (await request.json()) as RegisterRequest;
    // Validate input
    if (!name?.trim() || !email?.trim() || !password) {
      return NextResponse.json(
        { message: 'Please provide all required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    // Create new user - the pre-save hook will handle password hashing
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: password,
      role: "none" as RoleType,
    });

    // Return success response with user data (without password)
    const { password: _, ...userData } = user.toObject();

    return NextResponse.json(
      { 
        user: userData, 
        message: 'Registration successful! You can now sign in.' 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'An error occurred during registration. Please try again.' },
      { status: 500 }
    );
  }
}
