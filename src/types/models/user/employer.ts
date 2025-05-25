import type { UserType } from "./user";

export interface EmployerType extends UserType {
  companyDetails: {
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
} 