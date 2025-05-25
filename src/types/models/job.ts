import { Document, Types } from 'mongoose';

interface PaymentDetails {
  status: 'pending' | 'completed' | 'failed';
  transactionId?: string;
  paidAt?: Date;
}

export interface JobType {
  _id: string;
  title: string;
  about: string;
  location: string;
  salaryRange: {
    start: number;
    end: number
  };
  jobType: 'full-time' | 'part-time' | 'internship';
  workType?: 'remote' | 'on-site' | 'hybrid';
  workExperience: number;
  techStack: string[];
  interviewSettings: {
    maxCandidates: 1 | 2;
    interviewDuration: 10 | 15 | 20 | 25 | 30; // in minutes
    interviewers: {
      name: string;
      gender: 'male' | 'female' | '';
      qualification: string;
    }[];
    difficultyLevel: 'easy' | 'medium' | 'hard' | '';
    language: 'english' | 'hindi';
    questions: {
      text: string;
      type: 'TECHNICAL' | 'BEHAVIORAL' | 'SITUATIONAL' | '';
    }[];
  },
  invitedCandidates: {
    name: string;
    email: string;
  }[];
  price: number;
  employerId: Types.ObjectId; 
  paymentDetails: PaymentDetails;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
} 