'use client'
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, ExternalLink, Github, Linkedin, Globe, Twitter, Briefcase, GraduationCap, Code, User } from 'lucide-react';
import { fetchUserData } from '@/lib/api-functions/home.api';
import { useParams } from 'next/navigation';
import { GoMail } from 'react-icons/go';

const PortfolioPage = () => {
  const params = useParams();
  const id = params?.id as string;

  // Fetch data using useQuery
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['userProfile', id],
    queryFn: async () => fetchUserData({ id }),
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

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <Card>
          <CardContent>No user data found</CardContent>
        </Card>
      </div>
    );
  }

  const formatDate = (date: any) => {
    if (!date) return "Present";
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short' 
    }).format(new Date(date));
  };

  return (
    <div className="min-h-screen w-full py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Section */}
        <Card className="border-blue-200 bgGrad text-white shadow-lg">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="flex items-center space-x-4">
                {user.image && user.image.trim() !== "" ? (
                  <Avatar className="w-20 h-20 border-4 border-white shadow-lg">
                    <AvatarImage src={user.image} alt={user.name || 'Candidate'} />
                  </Avatar>
                ) : (
                  <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center">
                    <User className="w-10 h-10 text-white" />
                  </div>
                )}
                <div>
                  <h1 className="text-3xl font-bold text-white">{user.name}</h1>
                  <p className="text-lg font-medium">{user.tagline}</p>
                  <div className="flex items-center flex-wrap space-x-4 mt-2">
                    <span className="flex items-center space-x-1">
                      <GoMail className="w-4 h-4" />
                      <span>{user.email}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{user.state}</span>
                    </span>
                  </div>
                </div>
              </div>
              {/* Social Links */}
              <div className="flex space-x-3">
                {user.socialLinks?.linkedin && (
                  <a href={user.socialLinks.linkedin} className="p-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors">
                    <Linkedin className="w-5 h-5 text-black" />
                  </a>
                )}
                {user.socialLinks?.github && (
                  <a href={user.socialLinks.github} className="p-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors">
                    <Github className="w-5 h-5 text-black" />
                  </a>
                )}
                {user.socialLinks?.x && (
                  <a href={user.socialLinks.x} className="p-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors">
                    <Twitter className="w-5 h-5 text-black" />
                  </a>
                )}
                {user.socialLinks?.portfolio && (
                  <a href={user.socialLinks.portfolio} className="p-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors">
                    <Globe className="w-5 h-5 text-black" />
                  </a>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Two Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Summary */}
            <Card className="gap-5">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-blue-800">
                  <User className="w-5 h-5" />
                  <span>About</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{user.summary}</p>
              </CardContent>
            </Card>

            {/* Skills */}
            <Card className="gap-5">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-blue-800">
                  <Code className="w-5 h-5" />
                  <span>Skills</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {user.skill?.map((skill: any, index: any) => (
                    <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Projects */}
            <Card className="gap-5">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-blue-800">
                  <Code className="w-5 h-5" />
                  <span>Projects</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {user.projects?.map((project: any, index: any) => (
                    <div key={index} className="border-l-4 border-blue-200 pl-4">
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold text-gray-900">{project.title}</h3>
                        {project.link && project.link.trim() !== "" && (
                          <a href={project.link} className="text-blue-500 hover:text-blue-700">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                      <p className="text-gray-700 mt-2 text-sm">{project.description}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {project.technologies?.map((tech: any, techIndex: any) => (
                          <Badge key={techIndex} variant="outline" className="text-xs border-blue-200 text-blue-700">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Experience */}
            <Card className="gap-5">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-blue-800">
                  <Briefcase className="w-5 h-5" />
                  <span>Experience</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {user.experience?.map((exp: any, index: any) => (
                    <div key={index} className="border-l-4 border-blue-200 pl-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{exp.jobTitle}</h3>
                          <div className="flex items-center space-x-2">
                            <p className="text-blue-600 font-medium">{exp.companyName}</p>
                            {exp.companyWebsite && exp.companyWebsite.trim() !== "" && (
                              <a href={exp.companyWebsite} className="text-blue-500 hover:text-blue-700">
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                            <span className="flex items-center space-x-1">
                              <MapPin className="w-3 h-3" />
                              <span>{exp.location}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(exp.startDate)} - {formatDate(exp.endDate)}</span>
                            </span>
                            {exp.isCurrent && (
                              <Badge variant="default" className="text-xs">
                                Current
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700 mt-2 text-sm">{exp.description}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {exp.technologies?.map((tech: any, techIndex: any) => (
                          <Badge key={techIndex} variant="outline" className="text-xs border-blue-200 text-blue-700">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Education */}
            <Card className="gap-5">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-blue-800">
                  <GraduationCap className="w-5 h-5" />
                  <span>Education</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {user.educationDetails?.map((edu: any, index: any) => (
                    <div key={index} className="border-l-4 border-blue-200 pl-4">
                      <h3 className="font-semibold text-gray-900">{edu.degree} in {edu.fieldOfStudy}</h3>
                      <p className="text-blue-600 font-medium">{edu.collegeName}</p>
                      <p className="text-gray-600 text-sm flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>Graduated {edu.yearOfGraduation || 'N/A'}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioPage;