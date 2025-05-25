'use client'
import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { MapPin, Briefcase, GraduationCap, Linkedin, Github, Twitter, Globe } from 'lucide-react';
import { fetchUserData } from '@/lib/api-functions/home.api';
import { useParams } from 'next/navigation'

const PortfolioPage= () => {
  const params = useParams();
  const id = params?.id as string;

  // Mock data fetching (replace with actual API call)
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['userProfile', id],
    queryFn:async()=>fetchUserData({id}),
    
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

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header Section */}
      <header className="bgGrad text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center space-y-4">
            {user.image && (
              <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                <AvatarImage src={user.image} alt={user.name || 'Candidate'} />
              </Avatar>
            )}
            <h1 className="text-3xl md:text-4xl font-bold">{user.name || 'Anonymous Candidate'}</h1>
            {user.tagline && <p className="text-lg italic">{user.tagline}</p>}
            {user.state && (
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5" />
                <span>{user.state}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Summary Section */}
        {user.summary && (
          <section className="mb-12">
            <Card>
              <CardHeader>
                <CardTitle>About Me</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{user.summary}</p>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Skills Section */}
        {user.skill?.length > 0 && (
          <section className="mb-12">
            <Card>
              <CardHeader>
                <CardTitle>Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {user.skill.map((skill, index) => (
                    <Badge key={index}>{skill}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Experience Section */}
        {user.experience?.length > 0 && (
          <section className="mb-12">
            <Card>
              <CardHeader>
                <CardTitle>Experience</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {user.experience.map((exp, index) => (
                    <div key={index}>
                      {index > 0 && <Separator className="my-4" />}
                      <h3 className="text-lg font-medium">{exp.jobTitle}</h3>
                      <p className="text-blue-600">
                        {exp.companyWebsite ? (
                          <Button variant="link" asChild>
                            <a href={exp.companyWebsite} target="_blank" rel="noopener noreferrer">
                              {exp.companyName}
                            </a>
                          </Button>
                        ) : (
                          exp.companyName
                        )}
                      </p>
                      <p className="text-gray-600 flex items-center space-x-2">
                        <Briefcase className="w-4 h-4" />
                        <span>
                          {exp.location} | {exp.jobType} |{' '}
                          {exp.startDate ? new Date(exp.startDate).toLocaleDateString() : 'N/A'} -{' '}
                          {exp.isCurrent ? 'Present' : exp.endDate ? new Date(exp.endDate).toLocaleDateString() : 'N/A'}
                        </span>
                      </p>
                      {exp.description && <p className="text-gray-700 mt-2">{exp.description}</p>}
                      {exp.technologies?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {exp.technologies.map((tech, i) => (
                            <Badge key={i} variant="secondary">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Education Section */}
        {user.educationDetails?.length > 0 && (
          <section className="mb-12">
            <Card>
              <CardHeader>
                <CardTitle>Education</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {user.educationDetails.map((edu, index) => (
                    <div key={index}>
                      {index > 0 && <Separator className="my-4" />}
                      <h3 className="text-lg font-medium">{edu.degree}</h3>
                      <p className="text-blue-600">{edu.collegeName}</p>
                      <p className="text-gray-600 flex items-center space-x-2">
                        <GraduationCap className="w-4 h-4" />
                        <span>
                          {edu.fieldOfStudy} | {edu.yearOfGraduation}
                        </span>
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Projects Section */}
        {user.projects?.length > 0 && (
          <section className="mb-12">
            <Card>
              <CardHeader>
                <CardTitle>Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {user.projects.map((project, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle>
                          {project.link ? (
                            <Button variant="link" asChild>
                              <a href={project.link} target="_blank" rel="noopener noreferrer">
                                {project.title}
                              </a>
                            </Button>
                          ) : (
                            project.title
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {project.description && <p className="text-gray-700 mb-2">{project.description}</p>}
                        {project.technologies?.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {project.technologies.map((tech, i) => (
                              <Badge key={i} variant="secondary">
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Social Links Section */}
        {user.socialLinks && Object.values(user.socialLinks).some((link) => link) && (
          <section className="mb-12">
            <Card>
              <CardHeader>
                <CardTitle>Connect</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-4">
                  {user.socialLinks.linkedin && (
                    <Button variant="outline" asChild>
                      <a href={user.socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
                        <Linkedin className="w-4 h-4 mr-2" />
                        LinkedIn
                      </a>
                    </Button>
                  )}
                  {user.socialLinks.github && (
                    <Button variant="outline" asChild>
                      <a href={user.socialLinks.github} target="_blank" rel="noopener noreferrer">
                        <Github className="w-4 h-4 mr-2" />
                        GitHub
                      </a>
                    </Button>
                  )}
                  {user.socialLinks.x && (
                    <Button variant="outline" asChild>
                      <a href={user.socialLinks.x} target="_blank" rel="noopener noreferrer">
                        <Twitter className="w-4 h-4 mr-2" />
                        X
                      </a>
                    </Button>
                  )}
                  {user.socialLinks.portfolio && (
                    <Button variant="outline" asChild>
                      <a href={user.socialLinks.portfolio} target="_blank" rel="noopener noreferrer">
                        <Globe className="w-4 h-4 mr-2" />
                        Portfolio
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6">
        <div className="container mx-auto px-4 text-center">
          <p>© {new Date().getFullYear()} {user.name || 'Candidate'}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default PortfolioPage;