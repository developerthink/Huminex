export interface UserData {
  _id: string;
  name: string;
  email: string;
  image: string;
  status: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  skill: string[];
  state: string;
  educationDetails: {
    collegeName: string;
    yearOfGraduation: number;
    fieldOfStudy: string;
    degree: string;
    _id: string;
  }[];
  projects: {
    _id: string;
    title: string;
    description: string;
    link: string;
    technologies: string[];
  }[];
  experience: {
    _id: string;
    companyName: string;
    jobTitle: string;
    location: string;
    jobType: string;
    companyWebsite?: string;
    startDate: string;
    endDate?: string;
    isCurrent: boolean;
    description: string;
    technologies: string[];
  }[];
  profileCompletion: number;
  summary?: string;
  tagline?: string;
  socialLinks?: {
    github?: string;
    linkedin?: string;
    x?: string;
    portfolio?: string;
  };
} 