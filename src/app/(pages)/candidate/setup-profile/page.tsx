"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MultipleSelector, { Option } from "@/components/ui/multiselect";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// Options for the multiselect (skill)
const frameworks: Option[] = [
  { value: "next.js", label: "Next.js" },
  { value: "sveltekit", label: "SvelteKit" },
  { value: "nuxt.js", label: "Nuxt.js" },
  { value: "remix", label: "Remix" },
  { value: "astro", label: "Astro" },
  { value: "angular", label: "Angular" },
  { value: "vue", label: "Vue.js" },
  { value: "react", label: "React" },
  { value: "ember", label: "Ember.js" },
  { value: "gatsby", label: "Gatsby" },
  { value: "eleventy", label: "Eleventy" },
  { value: "solid", label: "SolidJS" },
  { value: "preact", label: "Preact" },
  { value: "qwik", label: "Qwik" },
  { value: "alpine", label: "Alpine.js" },
  { value: "lit", label: "Lit" },
];

// Options for the hometown state dropdown
const states: string[] = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

// Interface for form data
interface FormData {
  graduationYear: string;
  college: string;
  skill: Option[];
  hometownState: string;
}

// Main ProfileSetupPage Component
const ProfileSetupPage: React.FC = () => {
  const router = useRouter();
  
  // Form state using useState
  const [formData, setFormData] = useState<FormData>({
    graduationYear: "",
    college: "",
    skill: [],
    hometownState: "",
  });

  // Loading state for submission
  const [isLoading, setIsLoading] = useState(false);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle multiselect changes
  const handleDomainsChange = (selected: Option[]) => {
    if (selected.length <= 3) {
      setFormData((prev) => ({ ...prev, skill: selected }));
    }
  };

  // Handle hometown state selection
  const handleStateSelect = (value: string) => {
    setFormData((prev) => ({ ...prev, hometownState: value }));
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!formData.graduationYear || !formData.college || formData.skill.length === 0 || !formData.hometownState) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.put("/api/candidate/profile", {
        skill: formData.skill.map(d => d.value),
        state: formData.hometownState,
        educationDetails: [{
          collegeName: formData.college,
          yearOfGraduation: parseInt(formData.graduationYear),
        }],
      });

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      toast.success("Profile updated successfully");
      router.push("/candidate/dashboard");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center flex-col gap-3 p-4">
      <div className="flex items-center gap-2">
        <Image src="/logo.png" alt="Logo" width={80} height={80} />
        <h2 className="text-2xl font-semibold ">Set Up Your Profile</h2>
      </div>
      <Card className="max-w-3xl bg-white p-7 w-full">
        {/* Header Section */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Hi, User.</h1>
            <p className="text-sm text-gray-600">
              Welcome to AI Interviewer. Let's get started by setting up your profile
            </p>
          </div>
          <Button
            onClick={handleSubmit}
            aria-label="Get started"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="animate-spin mr-2">◌</span>
                Saving...
              </>
            ) : (
              <>
                Get Started
                <svg
                  className="w-4 h-4 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </>
            )}
          </Button>
        </div>

        {/* Form Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
          {/* Year of Graduation */}
          <div className="space-y-1">
            <Label
              htmlFor="graduationYear"
              className="text-sm font-medium text-gray-700"
            >
              Year of graduation <span className="text-red-500">*</span>
            </Label>
            <Input
              id="graduationYear"
              name="graduationYear"
              value={formData.graduationYear}
              onChange={handleInputChange}
              placeholder="Enter year of graduation"
              aria-required="true"
              disabled={isLoading}
            />
          </div>

          {/* College/University Name */}
          <div className="space-y-1">
            <Label
              htmlFor="college"
              className="text-sm font-medium text-gray-700"
            >
              College / University name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="college"
              name="college"
              value={formData.college}
              onChange={handleInputChange}
              placeholder="Enter college/university name"
              aria-required="true"
              disabled={isLoading}
            />
          </div>

          {/* skill of Interest */}
          <div className="space-y-1 col-span-2">
            <Label className="text-sm font-medium text-gray-700">
              Which skill are you interested in working? (add up to 3){" "}
              <span className="text-red-500">*</span>
            </Label>
            <MultipleSelector
              commandProps={{
                label: "Select skill",
              }}
              defaultOptions={frameworks}
              value={formData.skill}
              onChange={handleDomainsChange}
              placeholder="Type skill"
              emptyIndicator={
                <p className="text-center text-sm text-gray-500">
                  No results found
                </p>
              }
              maxSelected={3}
              disabled={isLoading}
            />
          </div>

          {/* Hometown State */}
          <div className="space-y-1 col-span-2">
            <Label
              htmlFor="hometownState"
              className="text-sm font-medium text-gray-700"
            >
              Select your hometown state <span className="text-red-500">*</span>
            </Label>
            <Select onValueChange={handleStateSelect} disabled={isLoading}>
              <SelectTrigger className="w-full" id="hometownState">
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                {states.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ProfileSetupPage;
