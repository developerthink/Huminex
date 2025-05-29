'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Upload, Linkedin, Globe, Users, MapPin, Building, Briefcase, Tag, Twitter } from 'lucide-react';
import FileUpload from '@/components/file-upload';
import RichTextEditor from '@/components/txt-editor/rich-txt-editor';
import { Card } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { uploadToCloudinary } from '@/lib/image-upload';
import { toast } from 'sonner';
import WbLoader from '@/components/global-cmp/wbLoader';

interface FormValues {
  name: string;
  linkedIn: string;
  website: string;
  numEmployees: string;
  location: string;
  industryType: string;
  companyType: string;
  about: string;
  tagline: string;
  twitter: string;
}

interface UserProfileData {
  name: string;
  linkedIn: string;
  website: string;
  numEmployees: string;
  location: string;
  industryType: string;
  companyType: string;
  about: string;
  tagline: string;
  twitter: string;
  logo: string;
}

interface CompanyDetailsPayload {
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
}

const fetchUserData = async (): Promise<UserProfileData> => {
  try {
    const { data } = await axios.get<{ error: null | string; data: { companyDetails: any } }>('/api/user');
    if (data.error) throw new Error(data.error);

    const companyDetails = data.data?.companyDetails || {};
    return {
      name: companyDetails.name || '',
      linkedIn: companyDetails.linkedin || '',
      website: companyDetails.website || '',
      numEmployees: companyDetails.numberOfEmployees?.toString() || '',
      location: companyDetails.location || '',
      industryType: companyDetails.industryType || '',
      companyType: companyDetails.companyType || '',
      about: companyDetails.about || '<p>Start writing something brilliant...</p>',
      tagline: companyDetails.tagline || '',
      twitter: companyDetails.x || '',
      logo: companyDetails.logo || '',
    };
  } catch (error) {
    const message = error instanceof AxiosError ? error.response?.data?.error || error.message : 'Failed to fetch user data';
    throw new Error(message);
  }
};

const updateCompanyDetails = async (payload: { companyDetails: CompanyDetailsPayload }) => {
  const { data } = await axios.put('/api/employer/company-details', payload);
  return data;
};

const EditProfileForm: React.FC = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery<UserProfileData, Error>({
    queryKey: ['userProfile'],
    queryFn: fetchUserData,
  });
  const [formValues, setFormValues] = React.useState<FormValues>(() => ({
    name: '',
    linkedIn: '',
    website: '',
    numEmployees: '',
    location: '',
    industryType: '',
    companyType: '',
    about: '<p>Start writing something brilliant...</p>',
    tagline: '',
    twitter: '',
  }));
  const [logo, setLogo] = React.useState<File | null>(null);
  const [logoUrl, setLogoUrl] = React.useState<string>('');

  React.useEffect(() => {
    if (data) {
      setFormValues({
        name: data.name || '',
        linkedIn: data.linkedIn || '',
        website: data.website || '',
        numEmployees: data.numEmployees || '',
        location: data.location || '',
        industryType: data.industryType || '',
        companyType: data.companyType || '',
        about: data.about || '<p>Start writing something brilliant...</p>',
        tagline: data.tagline || '',
        twitter: data.twitter || '',
      });
      if (data.logo) {
        setLogoUrl(data.logo);
      }
    }
  }, [data]);

  const mutation = useMutation<any, AxiosError, { companyDetails: CompanyDetailsPayload }>({
    mutationFn: updateCompanyDetails,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      toast.success('Company details updated successfully.');
    },
    onError: (error: AxiosError) => {
      toast.error('Failed to update company details.');
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditorChange = (html: string) => {
    setFormValues((prev) => ({ ...prev, about: html }));
  };

  const handleFileUpload = (file: File | null) => {
    setLogo(file);
    if (!file) setLogoUrl('');
  };

  const validateForm = () => {
    // Validation in specified sequence: company name, number of employees, location, about, logo, tagline, industry type, company type

    // Company Name validation
    if (!formValues.name) {
      toast.error("Company name is required");
      return false;
    }
    if (formValues.name.length < 2) {
      toast.error("Company name must be at least 2 characters");
      return false;
    }

    // Number of Employees validation
    if (!formValues.numEmployees) {
      toast.error("Number of employees is required");
      return false;
    }
    if (isNaN(Number(formValues.numEmployees)) || Number(formValues.numEmployees) <= 0) {
      toast.error("Number of employees must be a positive number");
      return false;
    }

    // Location validation
    if (!formValues.location) {
      toast.error("Location is required");
      return false;
    }
    if (formValues.location.length < 2) {
      toast.error("Location must be at least 2 characters");
      return false;
    }

    // About validation
    if (!formValues.about) {
      toast.error("Company About is required");
      return false;
    }
    if (formValues.about.length < 10) {
      toast.error("Company About must be at least 10 characters");
      return false;
    }

    // Logo validation (only if a new logo is uploaded)
    if (logo) {
      if (logo.size > 5 * 1024 * 1024) {
        toast.error("Logo file size should be less than 5MB");
        return false;
      }
      if (!logo.type.startsWith("image/")) {
        toast.error("Please upload an image file for the logo");
        return false;
      }
    } else if (!logoUrl) {
      toast.error("Please upload a company logo");
      return false;
    }

    // Tagline validation
    if (!formValues.tagline) {
      toast.error("Tagline is required");
      return false;
    }
    if (formValues.tagline.length < 5) {
      toast.error("Tagline must be at least 5 characters");
      return false;
    }
    if (formValues.tagline.length > 150) {
      toast.error("Tagline must not exceed 150 characters");
      return false;
    }

    // Industry Type validation
    if (!formValues.industryType) {
      toast.error("Industry type is required");
      return false;
    }
    if (formValues.industryType.length < 2) {
      toast.error("Industry type must be at least 2 characters");
      return false;
    }

    // Company Type validation
    if (!formValues.companyType) {
      toast.error("Company type is required");
      return false;
    }
    if (formValues.companyType.length < 2) {
      toast.error("Company type must be at least 2 characters");
      return false;
    }

    return true;
  };

  const hasChanges = () => {
    if (!data) return true; // Enable submit if no data is loaded yet
    return (
      formValues.name !== data.name ||
      formValues.linkedIn !== data.linkedIn ||
      formValues.website !== data.website ||
      formValues.numEmployees !== data.numEmployees ||
      formValues.location !== data.location ||
      formValues.industryType !== data.industryType ||
      formValues.companyType !== data.companyType ||
      formValues.about !== data.about ||
      formValues.tagline !== data.tagline ||
      formValues.twitter !== data.twitter ||
      logo !== null // New logo uploaded
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Run validation
    if (!validateForm()) {
      return;
    }

    try {
      let updatedLogoUrl = logoUrl;
      if (logo) {
        const uploadResult = await uploadToCloudinary(logo);
        updatedLogoUrl = uploadResult.secure_url;
      }

      const companyDetails: CompanyDetailsPayload = {
        name: formValues.name,
        linkedin: formValues.linkedIn,
        website: formValues.website,
        numberOfEmployees: Number(formValues.numEmployees) || 0,
        location: formValues.location,
        industryType: formValues.industryType,
        companyType: formValues.companyType,
        about: formValues.about,
        tagline: formValues.tagline,
        x: formValues.twitter,
        logo: updatedLogoUrl,
      };

      mutation.mutate({ companyDetails });
    } catch (error) {
      toast.error('Failed to upload logo. Please try again.');
    }
  };

  if (isLoading) {
    return <WbLoader />;
  }

  return (
    <Card className="shadow-none">
      <div className="flex flex-col w-full gap-2 p-8 bgGrad text-white rounded-xl">
        <h1 className="text-2xl font-bold">Manage your profile</h1>
        <p className="text-sm ">Manage your profile here</p>
      </div>
      <br />
      {isLoading ? (
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-10">
          <div className="w-[62%] space-y-4">
            <div className="relative">
              <Label htmlFor="name" className="ml-2 flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Building className="w-5 h-5 text-gray-400" />
                Company Name
              </Label>
              <Input
                id="name"
                name="name"
                value={formValues.name}
                onChange={handleInputChange}
                placeholder="Enter company name"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <Label htmlFor="linkedIn" className="ml-2 flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Linkedin className="w-5 h-5 text-gray-200" />
                  LinkedIn
                </Label>
                <Input
                  id="linkedIn"
                  name="linkedIn"
                  value={formValues.linkedIn}
                  onChange={handleInputChange}
                  placeholder="https://www.linkedin.com/in/..."
                />
              </div>
              <div className="relative">
                <Label htmlFor="website" className="ml-2 flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Globe className="w-5 h-5 text-gray-400" />
                  Website URL
                </Label>
                <Input
                  id="website"
                  name="website"
                  value={formValues.website}
                  onChange={handleInputChange}
                  placeholder="https://sofia.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <Label htmlFor="numEmployees" className="ml-2 flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Users className="w-5 h-4 text-gray-600" />
                  Number of Employees
                </Label>
                <Input
                  id="numEmployees"
                  name="numEmployees"
                  value={formValues.numEmployees}
                  onChange={handleInputChange}
                  placeholder="Enter number of employees"
                />
              </div>
              <div className="relative">
                <Label htmlFor="location" className="ml-2 flex items-center gap-2 text-sm font-medium text-gray-700 mb- Location">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  Location
                </Label>
                <Input
                  id="location"
                  name="location"
                  value={formValues.location}
                  onChange={handleInputChange}
                  placeholder="Enter location e.g., Mumbai, India"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <Label htmlFor="industryType" className="ml-2 flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Briefcase className="w-5 h-5 text-gray-400" />
                  Industry Type
                </Label>
                <Select
                  key={`industryType-${formValues.industryType}`}
                  value={formValues.industryType || undefined}
                  onValueChange={(value) => handleSelectChange('industryType', value)}
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
              <div className="relative">
                <Label htmlFor="companyType" className="ml-2 flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Building className="w-5 h-5 text-gray-400" />
                  Company Type
                </Label>
                <Select
                  key={`company-${formValues.companyType}`}
                  value={formValues.companyType || undefined}
                  onValueChange={(value) => handleSelectChange('companyType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select company type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Limited Partnership">
                      Limited Partnership (LLP)
                    </SelectItem>
                    <SelectItem value="Private Limited">
                      Private Limited Company
                    </SelectItem>
                    <SelectItem value="Public Limited">
                      Public Limited Company
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="relative">
              <Label htmlFor="about" className="ml-2 flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                About Company
              </Label>
              <RichTextEditor
                initialContent={formValues.about}
                onChange={handleEditorChange}
              />
            </div>
          </div>

          <div className="flex-1 shrink-0 space-y-4">
            <div className="flex items-center space-x-4">
              <FileUpload title="Company Logo" onChange={handleFileUpload} initialImage={logoUrl} />
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div className="relative">
                <Label htmlFor="tagline" className="ml-2 flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Tag className="w-5 h-5 text-gray-400" />
                  Company Tagline
                </Label>
                <Input
                  id="tagline"
                  name="tagline"
                  value={formValues.tagline}
                  onChange={handleInputChange}
                  placeholder="Enter company tagline"
                />
              </div>
              <div className="relative">
                <Label htmlFor="twitter" className="ml-2 flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Twitter className="w-5 h-5 text-gray-400" />
                  Twitter
                </Label>
                <Input
                  id="twitter"
                  name="twitter"
                  value={formValues.twitter}
                  onChange={handleInputChange}
                  placeholder="Enter Twitter handle e.g., @companyname"
                />
              </div>
            </div>
            <br />
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={mutation.isPending || !hasChanges()}
              >
                {mutation.isPending ? (
                  <div className="flex items-center">
                    <span className="animate-spin mr-2">⟳</span>
                    Saving...
                  </div>
                ) : (
                  'Save Details'
                )}
              </Button>
            </div>
          </div>
        </form>
      )}
    </Card>
  );
};

export default EditProfileForm;