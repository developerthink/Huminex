'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  MapPin,
  Briefcase,
  DollarSign,
  Clock,
  Users,
  Building,
  Globe,
  Linkedin,
  Twitter,
  Calendar,
} from 'lucide-react';
import { fetchJobDetails } from '@/lib/api-functions/home.api';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

// Define TypeScript interfaces based on Mongoose schemas
interface Interviewer {
  name: string;
  gender: 'male' | 'female';
  qualification: string;
}

interface Question {
  text: string;
  type: 'TECHNICAL' | 'BEHAVIORAL' | 'SITUATIONAL';
}

interface InterviewSettings {
  maxCandidates: 1 | 2;
  interviewDuration: 10 | 15 | 20 | 25 | 30;
  interviewers: Interviewer[];
  difficultyLevel: 'easy' | 'medium' | 'hard';
  language: 'english' | 'hindi';
  questions: Question[];
}

interface PaymentDetails {
  status: 'pending' | 'completed' | 'failed';
  transactionId?: string;
  paidAt?: string;
}

interface InvitedCandidate {
  name: string;
  email: string;
}

interface CompanyDetails {
  name: string;
  about: string;
  website: string;
  linkedin: string;
  x: string;
  logo: string;
  numberOfEmployees: number;
  companyType: string;
  industryType: string;
  location: string;
  tagline: string;
}

export interface Job {
  title: string;
  about: string;
  location: string;
  workType: 'remote' | 'on-site' | 'hybrid';
  salaryRange: {
    start: number;
    end: number;
  };
  jobType: 'full-time' | 'part-time' | 'internship';
  isActive: boolean;
  workExperience: number;
  techStack: string[];
  interviewSettings: InterviewSettings;
  price: number;
  employerId: {
    companyDetails: CompanyDetails;
    name: string;
    email: string;
    image: string;
  };
  paymentDetails: PaymentDetails;
  invitedCandidates: InvitedCandidate[];
  createdAt: string;
  updatedAt: string;
}

const JobPage = () => {
  const params = useParams();
  const id = params.id as string;

  const { data: job, isLoading, error } = useQuery({
    queryKey: ['jobDetails', id],
    queryFn: () => fetchJobDetails({ id }) as Promise<Job>,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <Card className="text-red-500">
          <CardContent>Error: {error.message}</CardContent>
        </Card>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <Card>
          <CardContent>No job data found</CardContent>
        </Card>
      </div>
    );
  }

  const stripHtmlTags = (html: string) => {
    return html.replace(/<[^>]*>/g, '');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header with gradient */}
      <div className="bgGrad h-42"></div>

      <div className="max-w-6xl mx-auto px-6 -mt-16 relative">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Title and Company Info */}
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-8">
                <div className="mb-4">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
                  <div className="flex items-center gap-2 text-gray-600 mb-4">
                    <span className="font-medium">{job.employerId.companyDetails.name}</span>
                    <span>•</span>
                    <span>{job.employerId.companyDetails.location}</span>
                    <span>•</span>
                    <span className="capitalize">{job.jobType}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={job.isActive ? 'default' : 'secondary'} className="bg-blue-600 hover:bg-blue-700 text-white">
                      {job.isActive ? 'Open Position' : 'Closed'}
                    </Badge>
                    <Badge variant="outline" className="border-gray-300 text-gray-600">
                      {job.workType}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Overview */}
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Overview</h2>
                <p className="text-gray-700 leading-relaxed mb-6">{stripHtmlTags(job.about)}</p>

                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">About {job.employerId.companyDetails.name}</h3>
                  <p className="text-gray-700 leading-relaxed">{stripHtmlTags(job.employerId.companyDetails.about)}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{job.employerId.companyDetails.numberOfEmployees} employees</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{job.employerId.companyDetails.industryType}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Skills */}
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {job.techStack.map((tech, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full">
                      {tech}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Job Details Card */}
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-6">
                {/* Salary */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{job.employerId.companyDetails.location}</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{job.salaryRange.start} - {job.salaryRange.end}LPA</div>
                  <div className="text-sm text-gray-600">Avg. Salary</div>
                </div>

                {/* Company */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    {/* <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <Building className="h-4 w-4 text-white" />
                    </div> */}

                    <Image
                      src={job.employerId.companyDetails.logo}
                      alt={job.employerId.companyDetails.name}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full"
                    />

                    <div>
                      <div className="font-medium text-gray-900">{job.employerId.companyDetails.name}</div>
                      <div className="text-sm text-gray-600">{job.employerId.email}</div>
                    </div>
                  </div>
                </div>

                {/* Job Type */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">{job.jobType}</span>
                  </div>
                </div>

                {/* Experience */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">{job.workExperience} years experience</span>
                  </div>
                </div>

                {/* Posted Date */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">{formatDate(job.createdAt)}</span>
                  </div>
                </div>

                {/* Apply Button */}
                <Link href={`/candidate/dashboard/jobs`}>
                  <Button className="w-full bg-black hover:bg-gray-800 text-white py-3 rounded-lg font-medium">
                    Apply for this job
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Company Links */}
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <a
                    href={job.employerId.companyDetails.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Globe className="h-4 w-4" />
                    <span className="text-sm">Learn more about us</span>
                  </a>

                  <a
                    href={job.employerId.companyDetails.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Linkedin className="h-4 w-4" />
                    <span className="text-sm">LinkedIn</span>
                  </a>

                  <a
                    href={job.employerId.companyDetails.x}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Twitter className="h-4 w-4" />
                    <span className="text-sm">Twitter</span>
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobPage;