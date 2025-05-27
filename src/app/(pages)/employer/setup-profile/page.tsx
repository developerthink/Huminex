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
import {
  Upload,
  Linkedin,
  Globe,
  Users,
  MapPin,
  Building,
  Briefcase,
  Info,
  Tag,
  Twitter,
} from "lucide-react";
import FileUpload from "@/components/file-upload";
import RichTextEditor from "@/components/txt-editor";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import axios from "axios";
import { useRouter } from "next/navigation";
import { uploadToCloudinary } from "@/lib/image-upload";
import { toast } from "sonner";

interface EditProfileFormProps {
  initialValues: {
    name: string;
    linkedin: string;
    website: string;
    numberOfEmployees: number;
    location: string;
    industryType: string;
    companyType: string;
    about: string;
    tagline: string;
    x: string;
    logo: string;
  };
  onSubmit: (values: EditProfileFormProps["initialValues"]) => void;
}

const EditProfileForm = () => {
  const router = useRouter();
  const initialValues = {
    name: "",
    linkedin: "",
    website: "",
    numberOfEmployees: 0,
    location: "",
    industryType: "",
    companyType: "",
    about: "",
    tagline: "",
    x: "",
    logo: "",
  };
  const [formValues, setFormValues] = useState(initialValues);
  const [logo, setLogo] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormValues({ ...formValues, [name]: value });
  };

  const handleEditorChange = (html: string) => {
    setFormValues({ ...formValues, about: html });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogo(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (!logo) {
        toast.error("Please upload an image file");
        return;
      }

      if (logo.size > 5 * 1024 * 1024) {
        toast.error("File size should be less than 5MB");
        return;
      }

      if (!logo.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }

      const uploadResult = await uploadToCloudinary(logo);
      console.log("uploadResult", uploadResult);
      const logoUrl = uploadResult.secure_url;
      const response = await axios.put("/api/employer/company-details", {
        companyDetails: {
          name: formValues.name,
          linkedin: formValues.linkedin,
          website: formValues.website,
          numberOfEmployees: Number(formValues.numberOfEmployees),
          location: formValues.location,
          industryType: formValues.industryType,
          companyType: formValues.companyType,
          about: formValues.about,
          tagline: formValues.tagline,
          x: formValues.x,
          logo: logoUrl,
        },
      });

      if (response.data) {
        router.push("/employer/dashboard");
      }
    } catch (error) {
      console.error("Error updating company details:", error);
      toast.error("Failed to update company details");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen overflow-hidden w-full bg-slate-100">
      <Card className="max-w-6xl w-full mx-auto p-8  rounded-xl shadow-lg">
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="Logo" width={50} height={50} className="brightness-105"/>
          <h2 className="text-2xl font-semibold  text-gray-800">
            Setup Profile
          </h2>
        </div>
        <form onSubmit={handleSubmit} className=" flex gap-10">
          <div className="w-[62%] space-y-4">
            {/* Company Name */}
            <div className="relative">
              <Label
                htmlFor="name"
                className="ml-2 flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"
              >
                <Building className="w-5 h-5 text-gray-400" />
                Company Name
              </Label>
              <div className="relative">
                <Input
                  id="name"
                  name="name"
                  value={formValues.name}
                  onChange={handleInputChange}
                  placeholder="Enter company name"
                />
              </div>
            </div>

            {/* LinkedIn and Website */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <Label
                  htmlFor="linkedin"
                  className="ml-2 flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"
                >
                  <Linkedin className="w-5 h-5 text-gray-400" />
                  LinkedIn
                </Label>
                <div className="relative">
                  <Input
                    id="linkedin"
                    name="linkedin"
                    value={formValues.linkedin}
                    onChange={handleInputChange}
                    placeholder="https://www.linkedin.com/in/..."
                  />
                </div>
              </div>
              <div className="relative">
                <Label
                  htmlFor="website"
                  className="ml-2 flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"
                >
                  <Globe className="w-5 h-5 text-gray-400" />
                  Website Link
                </Label>
                <div className="relative">
                  <Input
                    id="website"
                    name="website"
                    value={formValues.website}
                    onChange={handleInputChange}
                    placeholder="https://sofia.com"
                  />
                </div>
              </div>
            </div>

            {/* Number of Employees and Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <Label
                  htmlFor="numberOfEmployees"
                  className="ml-2 flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"
                >
                  <Users className="w-5 h-5 text-gray-400" />
                  Number of Employees
                </Label>
                <div className="relative">
                  <Input
                    id="numberOfEmployees"
                    name="numberOfEmployees"
                    type="number"
                    value={formValues.numberOfEmployees}
                    onChange={handleInputChange}
                    placeholder="50"
                  />
                </div>
              </div>
              <div className="relative">
                <Label
                  htmlFor="location"
                  className="ml-2 flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"
                >
                  <MapPin className="w-5 h-5 text-gray-400" />
                  Location of Headquarters
                </Label>
                <div className="relative">
                  <Input
                    id="location"
                    name="location"
                    value={formValues.location}
                    onChange={handleInputChange}
                    placeholder="Mumbai, Maharashtra, India"
                  />
                </div>
              </div>
            </div>

            {/* Industry Type and Company Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <Label
                  htmlFor="industryType"
                  className="ml-2 flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"
                >
                  <Briefcase className="w-5 h-5 text-gray-400" />
                  Industry Type
                </Label>
                <div className="relative">
                  <Select
                    onValueChange={(value) =>
                      handleSelectChange("industryType", value)
                    }
                    defaultValue={formValues.industryType}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Architecture Planning">
                        Architecture Planning
                      </SelectItem>
                      <SelectItem value="Technology">Technology</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="relative">
                <Label
                  htmlFor="companyType"
                  className="ml-2 flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"
                >
                  <Building className="w-5 h-5 text-gray-400" />
                  Company Type
                </Label>
                <div className="relative">
                  <Select
                    onValueChange={(value) =>
                      handleSelectChange("companyType", value)
                    }
                    defaultValue={formValues.companyType}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select company type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Limited Partnership (LP)">
                        Limited Partnership (LP)
                      </SelectItem>
                      <SelectItem value="Private Limited">
                        Private Limited
                      </SelectItem>
                      <SelectItem value="Public Limited">
                        Public Limited
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="relative">
              <Label
                htmlFor="about"
                className="ml-2 flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"
              >
                About Company
              </Label>
              <div className="relative">
                <RichTextEditor
                  initialContent={
                    formValues.about ||
                    "<p>Start writing something brilliant...</p>"
                  }
                  onChange={handleEditorChange}
                />
              </div>
            </div>
          </div>

          <div className="flex-1 shrink-0 space-y-4">
            {/* Company Logo Upload */}
            <div className="flex items-center space-x-4">
              <FileUpload 
                title="Add Company Logo" 
                onChange={setLogo}
              />
            </div>

            {/* Company Tagline and X (Twitter) */}
            <div className="grid grid-cols-1 gap-6">
              <div className="relative">
                <Label
                  htmlFor="tagline"
                  className="ml-2 flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"
                >
                  <Tag className="w-5 h-5 text-gray-400" />
                  Company Tagline
                </Label>
                <div className="relative">
                  <Input
                    id="tagline"
                    name="tagline"
                    value={formValues.tagline}
                    onChange={handleInputChange}
                    placeholder="Your company tagline"
                  />
                </div>
              </div>
              <div className="relative">
                <Label
                  htmlFor="x"
                  className="ml-2 flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"
                >
                  <Twitter className="w-5 h-5 text-gray-400" />X (Twitter)
                </Label>
                <div className="relative">
                  <Input
                    id="x"
                    name="x"
                    value={formValues.x}
                    onChange={handleInputChange}
                    placeholder="https://x.com/..."
                  />
                </div>
              </div>
            </div>
            <br />
            {/* Form Actions */}
            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline">
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span className="mr-2">Saving...</span>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  </>
                ) : (
                  "Save Details"
                )}
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default EditProfileForm;
