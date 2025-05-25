import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import connectDB from '@/config/db';
import User from '@/models/user/user';
import type { EmployerType } from '@/types/models/user/employer';
import { companyDetailsSchema } from './schema';
import { fromZodError } from 'zod-validation-error';
import { auth } from '@/auth';
import Employer from '@/models/user/employer';

export async function PUT(request: NextRequest) {
  const session = await auth();
 
  if (!session) {
    return NextResponse.json({
      error: 'Unauthorized',
      data: null
    }, { status: 401 });
  }

   console.log("session", session);

  // if (session.user.role !== 'employer') {
  //   return NextResponse.json({
  //     error: 'Unauthorized',
  //     data: null
  //   }, { status: 401 });
  // }
  
  try {
    await connectDB();

    const body = await request.json();
    
    // Validate request body using Zod schema
    const validationResult = companyDetailsSchema.safeParse(body);
    
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

    const { companyDetails } = validationResult.data;

    const usertoupdate = await Employer.findById(session.user.id);

    console.log("employer data to be udpate", usertoupdate)

    // Update the HR user's company details
    const updatedUser = await Employer.findByIdAndUpdate(
      session.user.id,
      { companyDetails, status: "isOnboarded" },
      { 
        new: true,
        runValidators: true 
      }
    ) as EmployerType | null;

    console.log("after updatedUser", updatedUser);

    if (!updatedUser) {
      return NextResponse.json(
        { 
          error: 'User not found',
          data: null 
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      error: null,
      data: updatedUser.companyDetails
    });

  } catch (error) {
    console.error('Error updating company details:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        data: null 
      },
      { status: 500 }
    );
  }
} 