import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/config/db';
import Candidate from '@/models/user/candidate';

export async function GET() {
  const session = await auth();

  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized', data: null },
      { status: 401 }
    );
  }

  // if (session.user.role !== 'candidate') {
  //   return NextResponse.json(
  //     { error: 'You are not authorized to access this page', data: null },
  //     { status: 403 }
  //   );
  // }

  try {
    await connectDB();
    const userId = session.user.id;
    
    // Get the candidate with all fields
    const candidate = await Candidate.findById(userId).lean();
    
    if (!candidate) {
      return NextResponse.json(
        { error: 'Candidate not found', data: null },
        { status: 404 }
      );
    }

    // Define all fields to check with their weights
    const fieldsToCheck = [
      { key: 'skill', weight: 10, label: 'Skills' },
      { key: 'state', weight: 5, label: 'State' },
      { key: 'educationDetails', weight: 15, label: 'Education Details' },
      { key: 'experience', weight: 20, label: 'Work Experience' },
      { key: 'projects', weight: 15, label: 'Projects' },
      { key: 'socialLinks', weight: 10, label: 'Social Links' },
      { key: 'summary', weight: 10, label: 'Professional Summary' },
      { key: 'tagline', weight: 5, label: 'Tagline' },
      { key: 'name', weight: 5, label: 'Full Name' },
      { key: 'email', weight: 5, label: 'Email' }
    ];

    let totalScore = 0;
    let maxScore = 0;
    const missingFields: string[] = [];

    // Check each field
    for (const { key, weight, label } of fieldsToCheck) {
      maxScore += weight;
      let isFieldValid: boolean = false;
      
      // Handle different field types with type-safe checks
      switch (key) {
        case 'socialLinks': {
          const socialLinks = candidate.socialLinks || {};
          isFieldValid = Object.values(socialLinks).some(link => 
            link && typeof link === 'string' && link.trim() !== ''
          );
          break;
        }
        case 'skill':
        case 'educationDetails':
        case 'experience':
        case 'projects': {
          const value = (candidate as any)[key];
          isFieldValid = Array.isArray(value) && value.length > 0;
          break;
        }
        case 'state':
        case 'summary':
        case 'tagline':
        case 'name':
        case 'email': {
          const value = (candidate as any)[key];
          isFieldValid = !!(value && typeof value === 'string' && value.trim() !== '');
          break;
        }
      }
      
      if (isFieldValid === true) {
        totalScore += weight;
      } else {
        missingFields.push(label || key);
      }
    }

    // Calculate percentage (ensure it's between 0 and 100)
    const completionPercentage = Math.min(100, Math.max(0, Math.round((totalScore / maxScore) * 100)));

    return NextResponse.json({
      data: {
        completionPercentage,
        missingFields,
        isComplete: completionPercentage === 100
      },
      error: null
    });

  } catch (error) {
    console.error('Error calculating profile completion:', error);
    return NextResponse.json(
      { error: 'Internal server error', data: null },
      { status: 500 }
    );
  }
}