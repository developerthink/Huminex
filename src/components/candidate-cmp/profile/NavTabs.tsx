"use client";
import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import EducationSection from "./sections/EducationSection";
import ProjectSection from "./sections/ProjectSection";
import WorkExperienceSection from "./sections/WorkExperienceSection";
import PersonalDetailsSection from "./sections/PersonalDetailsSection";
import { UserData } from "@/types/user";

interface NavTabsProps {
  educationDetails: UserData['educationDetails'];
  projects: UserData['projects'];
  experience: UserData['experience'];
  personalDetails: {
    email: string;
    state: string;
    skill: string[];
    summary?: string;
    tagline?: string;
  };
  onSectionUpdate: (
    section: 'educationDetails' | 'projects' | 'experience' | 'personalDetails',
    newData: any
  ) => Promise<void>;
  isSaving: boolean;
}

const NavTabs: React.FC<NavTabsProps> = ({
  educationDetails,
  projects,
  experience,
  personalDetails,
  onSectionUpdate,
  isSaving,
}) => {
  return (
    <Tabs defaultValue="personal details" className="w-full gap-0">
      <TabsList className="w-full bg-white border border-b-0 rounded-b-none overflow-hidden pb-0 ">
        {[
        "Personal Details",
          "Education",
          "Projects",
          "Work Experience",
        ].map((tab) => (
          <TabsTrigger
            key={tab}
            value={tab.toLowerCase().replace(" ", " ")}
            className="!rounded-none !shadow-none data-[state=active]:border-b-2 data-[state=active]:border-b-primary"
          >
            {tab}
          </TabsTrigger>
        ))}
      </TabsList>
      <div className="min-h-96 rounded-3xl overflow-hidden rounded-t-none bg-white border p-6 flex items-center justify-center">
      <TabsContent className="w-full" value="personal details">
          <PersonalDetailsSection 
            email={personalDetails.email}
            state={personalDetails.state}
            skill={personalDetails.skill}
            summary={personalDetails.summary}
            tagline={personalDetails.tagline}
            onUpdateUser={(data) => onSectionUpdate('personalDetails', data)}
            isSaving={isSaving}
          />
        </TabsContent>
        <TabsContent className="w-full" value="education">
          
          <EducationSection 
            educationDetails={educationDetails}
            onUpdateUser={(newData) => onSectionUpdate('educationDetails', newData)}
            isSaving={isSaving}
          />
        </TabsContent>
        <TabsContent className="w-full" value="projects">
          <ProjectSection 
            projects={projects}
            onUpdateUser={(newData) => onSectionUpdate('projects', newData)}
            isSaving={isSaving}
          />
        </TabsContent>
        <TabsContent className="w-full" value="work experience">
          <WorkExperienceSection 
            experience={experience}
            onUpdateUser={(newData) => onSectionUpdate('experience', newData)}
            isSaving={isSaving}
          />
        </TabsContent>
        
      </div>
    </Tabs>
  );
};

export default NavTabs; 