'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import {
  MapPin,
  Briefcase,
  DollarSign,
  Clock,
  Users,
  Code,
  BarChart,
  Languages,
  Building,
  Globe,
  Linkedin,
  Twitter,
} from 'lucide-react';
import { fetchJobDetails } from '@/lib/api-functions/home.api';
import { useParams } from 'next/navigation';

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
  };
  paymentDetails: PaymentDetails;
  invitedCandidates: InvitedCandidate[];
}


const JobPage = () => {
  const params = useParams()
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

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header Section */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center space-y-4">
            {job.employerId.companyDetails.logo && (
              <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                <AvatarImage src={job.employerId.companyDetails.logo} alt={job.employerId.companyDetails.name} />
              </Avatar>
            )}
            <h1 className="text-3xl md:text-4xl font-bold">{job.title}</h1>
            <p className="text-lg">{job.employerId.companyDetails.name}</p>
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5" />
              <span>{job.location} ({job.workType})</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Job Overview */}
        <section className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle>Job Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: job.about }} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Briefcase className="w-5 h-5 text-gray-500" />
                  <span>
                    <strong>Job Type:</strong> {job.jobType}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-gray-500" />
                  <span>
                    <strong>Salary:</strong> ${job.salaryRange.start.toLocaleString()} - ${job.salaryRange.end.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-gray-500" />
                  <span>
                    <strong>Experience:</strong> {job.workExperience} years
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <BarChart className="w-5 h-5 text-gray-500" />
                  <span>
                    <strong>Status:</strong> {job.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Tech Stack */}
        {job.techStack.length > 0 && (
          <section className="mb-12">
            <Card>
              <CardHeader>
                <CardTitle>Tech Stack</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {job.techStack.map((tech, index) => (
                    <Badge key={index} variant="secondary">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Interview Settings */}
        <section className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle>Interview Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-gray-500" />
                  <span>
                    <strong>Max Candidates:</strong> {job.interviewSettings.maxCandidates}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-gray-500" />
                  <span>
                    <strong>Duration:</strong> {job.interviewSettings.interviewDuration} minutes
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <BarChart className="w-5 h-5 text-gray-500" />
                  <span>
                    <strong>Difficulty:</strong> {job.interviewSettings.difficultyLevel}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Languages className="w-5 h-5 text-gray-500" />
                  <span>
                    <strong>Language:</strong> {job.interviewSettings.language}
                  </span>
                </div>
              </div>
              {job.interviewSettings.interviewers.length > 0 && (
                <>
                  <Separator className="my-4" />
                  <h3 className="text-lg font-medium">Interviewers</h3>
                  <div className="space-y-2">
                    {job.interviewSettings.interviewers.map((interviewer, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Users className="w-5 h-5 text-gray-500" />
                        <span>
                          {interviewer.name} ({interviewer.gender}, {interviewer.qualification})
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
              {job.interviewSettings.questions.length > 0 && (
                <>
                  <Separator className="my-4" />
                  <h3 className="text-lg font-medium">Sample Questions</h3>
                  <div className="space-y-2">
                    {job.interviewSettings.questions.map((question, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <Code className="w-5 h-5 text-gray-500 mt-1" />
                        <span>
                          {question.text} <Badge>{question.type}</Badge>
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Company Details */}
        <section className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle>Company Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Building className="w-5 h-5 text-gray-500" />
                  <span>
                    <strong>{job.employerId.companyDetails.name}</strong> - {job.employerId.companyDetails.tagline}
                  </span>
                </div>
                <p className="text-gray-700" dangerouslySetInnerHTML={{ __html: job.employerId.companyDetails.about }} />
                <div className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-gray-500" />
                  <span>{job.employerId.companyDetails.location}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-gray-500" />
                  <span>{job.employerId.companyDetails.numberOfEmployees} employees</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Briefcase className="w-5 h-5 text-gray-500" />
                  <span>
                    {job.employerId.companyDetails.companyType} - {job.employerId.companyDetails.industryType}
                  </span>
                </div>
                <div className="flex space-x-4">
                  {job.employerId.companyDetails.website && (
                    <Button variant="outline" asChild>
                      <a href={job.employerId.companyDetails.website} target="_blank" rel="noopener noreferrer">
                        <Globe className="w-4 h-4 mr-2" />
                        Website
                      </a>
                    </Button>
                  )}
                  {job.employerId.companyDetails.linkedin && (
                    <Button variant="outline" asChild>
                      <a href={job.employerId.companyDetails.linkedin} target="_blank" rel="noopener noreferrer">
                        <Linkedin className="w-4 h-4 mr-2" />
                        LinkedIn
                      </a>
                    </Button>
                  )}
                  {job.employerId.companyDetails.x && (
                    <Button variant="outline" asChild>
                      <a href={job.employerId.companyDetails.x} target="_blank" rel="noopener noreferrer">
                        <Twitter className="w-4 h-4 mr-2" />
                        X
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Invited Candidates */}
        {job.invitedCandidates.length > 0 && (
          <section className="mb-12">
            <Card>
              <CardHeader>
                <CardTitle>Invited Candidates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {job.invitedCandidates.map((candidate, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Users className="w-5 h-5 text-gray-500" />
                      <span>
                        {candidate.name} ({candidate.email})
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Payment Details */}
        <section className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-gray-500" />
                  <span>
                    <strong>Price:</strong> ${job.price}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <BarChart className="w-5 h-5 text-gray-500" />
                  <span>
                    <strong>Status:</strong> {job.paymentDetails.status}
                  </span>
                </div>
                {job.paymentDetails.transactionId && (
                  <div className="flex items-center space-x-2">
                    <Code className="w-5 h-5 text-gray-500" />
                    <span>
                      <strong>Transaction ID:</strong> {job.paymentDetails.transactionId}
                    </span>
                  </div>
                )}
                {job.paymentDetails.paidAt && (
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-gray-500" />
                    <span>
                      <strong>Paid At:</strong> {new Date(job.paymentDetails.paidAt).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6">
        <div className="container mx-auto px-4 text-center">
          <p>© {new Date().getFullYear()} {job.employerId.companyDetails.name}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default JobPage;