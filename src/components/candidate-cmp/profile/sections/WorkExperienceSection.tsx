"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Edit, Trash2, Briefcase, Link as LinkIcon, Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import axios from "axios";
import { UserData } from "@/types/user";
import { z } from "zod";

const jobTypes = ['full-time', 'part-time', 'contract', 'freelance', 'internship'] as const;

interface WorkExperienceSectionProps {
  experience: UserData['experience'];
  onUpdateUser: (newData: UserData['experience']) => Promise<void>;
  isSaving: boolean;
}

interface WorkExperienceFormData {
  companyName: string;
  jobTitle: string;
  location: string;
  jobType: string;
  companyWebsite: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  description: string;
  technologies: string[];
}

const experienceSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  companyWebsite: z.string().url("Invalid company website URL").optional(),
  jobType: z.enum(["full-time", "part-time", "contract", "freelance", "internship"], {
    required_error: "Job type is required",
  }),
  jobTitle: z.string().min(2, "Job title must be at least 2 characters"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  description: z.string().min(10, "Description must be at least 10 characters"),
  location: z.string().min(2, "Location must be at least 2 characters"),
  technologies: z.array(z.string()).min(1, "At least one technology is required"),
  isCurrent: z.boolean()
});

const initialFormData: WorkExperienceFormData = {
  companyName: '',
  jobTitle: '',
  location: '',
  jobType: 'full-time',
  companyWebsite: '',
  startDate: '',
  endDate: '',
  isCurrent: false,
  description: '',
  technologies: [],
};
import mongoose from "mongoose";

const generatedId = new mongoose.Types.ObjectId();
const WorkExperienceSection: React.FC<WorkExperienceSectionProps> = ({ 
  experience: initialExperience, 
  onUpdateUser,
  isSaving 
}) => {
  const [experiences, setExperiences] = useState<UserData['experience']>(initialExperience || []);
  const [formData, setFormData] = useState<WorkExperienceFormData>(initialFormData);
  const [newTechnology, setNewTechnology] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Update local state when props change
  useEffect(() => {
    setExperiences(initialExperience || []);
  }, [initialExperience]);

  const validateForm = (data: WorkExperienceFormData) => {
    try {
      experienceSchema.parse({
        ...data,
        endDate: data.isCurrent ? undefined : data.endDate
      });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: { [key: string]: string } = {};
        error.errors.forEach((err) => {
          if (err.path) {
            newErrors[err.path[0]] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const clearError = (field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const handleAddTechnology = () => {
    if (newTechnology.trim()) {
      setFormData(prev => ({
        ...prev,
        technologies: [...prev.technologies, newTechnology.trim()]
      }));
      setNewTechnology('');
      clearError('technologies');
    }
  };

  const handleRemoveTechnology = (index: number) => {
    setFormData(prev => ({
      ...prev,
      technologies: prev.technologies.filter((_, i) => i !== index)
    }));
  };

  const handleAdd = async () => {
    if (!validateForm(formData)) return;

    const newExperience = {
      ...formData,
      _id: generatedId.toString(), // Temporary ID, will be replaced by DB
      endDate: formData.isCurrent ? undefined : formData.endDate, // Clear endDate if isCurrent is true
    };
    const newExperiences = [...experiences, newExperience];
    await onUpdateUser(newExperiences);
    setIsAddDialogOpen(false);
    setFormData(initialFormData);
    setErrors({});
  };

  const handleEdit = async () => {
    if (!selectedId || !validateForm(formData)) return;

    const updatedData = {
      ...formData,
      endDate: formData.isCurrent ? undefined : formData.endDate, // Clear endDate if isCurrent is true
    };

    const newExperiences = experiences.map(exp => 
      exp._id === selectedId ? { ...updatedData, _id: selectedId } : exp
    );
    await onUpdateUser(newExperiences);
    setIsEditDialogOpen(false);
    setSelectedId(null);
    setFormData(initialFormData);
    setErrors({});
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    const newExperiences = experiences.filter(exp => exp._id !== selectedId);
    await onUpdateUser(newExperiences);
    setIsDeleteDialogOpen(false);
    setSelectedId(null);
  };

  const openEditDialog = (experience: UserData['experience'][0]) => {
    setFormData({
      companyName: experience.companyName,
      jobTitle: experience.jobTitle,
      location: experience.location,
      jobType: experience.jobType,
      companyWebsite: experience.companyWebsite || '',
      startDate: experience.startDate,
      endDate: experience.endDate || '',
      isCurrent: experience.isCurrent,
      description: experience.description,
      technologies: [...experience.technologies],
    });
    setSelectedId(experience._id);
    setIsEditDialogOpen(true);
    setErrors({});
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-6">
    

      {/* Experience List */}
      <div className="space-y-4">
        {experiences && experiences.length > 0 ? (
          experiences.map((experience) => (
            <div
              key={experience._id}
              className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-3 flex-1">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-lg font-semibold text-gray-900">{experience.jobTitle}</h4>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm font-medium text-gray-700">{experience.jobType}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Briefcase className="w-4 h-4" />
                      <span>{experience.companyName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {formatDate(experience.startDate)} - {experience.isCurrent ? 'Present' : experience.endDate ? formatDate(experience.endDate) : ''}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 leading-relaxed">{experience.description}</p>
                  
                  {experience.companyWebsite && (
                    <a 
                      href={experience.companyWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 gap-1.5"
                    >
                      <LinkIcon className="w-4 h-4" />
                      Company Website
                    </a>
                  )}
                  
                  {experience.technologies && experience.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {experience.technologies.map((tech, index) => (
                        <span
                          key={index}
                          className="px-2.5 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-500 hover:text-blue-600"
                    onClick={() => openEditDialog(experience)}
                    disabled={isSaving}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-500 hover:text-red-600"
                    onClick={() => {
                      setSelectedId(experience._id);
                      setIsDeleteDialogOpen(true);
                    }}
                    disabled={isSaving}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            No work experience added yet. Add your first work experience to showcase your career journey!
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Edit Work Experience</DialogTitle>
            <DialogDescription>
              Update your work experience details below
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4 overflow-y-auto pr-6 custom-scrollbar">
            <div className="grid grid-cols-2 gap-4">
              {/* First Column */}
              <div className="space-y-4">
                <div className="grid gap-2">
                  <label htmlFor="companyName" className="text-sm font-medium">
                    Company Name*
                  </label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, companyName: e.target.value }));
                      clearError('companyName');
                    }}
                    placeholder="Enter company name"
                    className={errors.companyName ? "border-red-500" : ""}
                    required
                  />
                  {errors.companyName && (
                    <p className="text-sm text-red-500">{errors.companyName}</p>
                  )}
                </div>

                <div className="grid gap-2">
                  <label htmlFor="jobTitle" className="text-sm font-medium">
                    Job Title*
                  </label>
                  <Input
                    id="jobTitle"
                    value={formData.jobTitle}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, jobTitle: e.target.value }));
                      clearError('jobTitle');
                    }}
                    placeholder="Enter your job title"
                    className={errors.jobTitle ? "border-red-500" : ""}
                    required
                  />
                  {errors.jobTitle && (
                    <p className="text-sm text-red-500">{errors.jobTitle}</p>
                  )}
                </div>

                <div className="grid gap-2">
                  <label htmlFor="location" className="text-sm font-medium">
                    Location*
                  </label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, location: e.target.value }));
                      clearError('location');
                    }}
                    placeholder="City, Country"
                    className={errors.location ? "border-red-500" : ""}
                    required
                  />
                  {errors.location && (
                    <p className="text-sm text-red-500">{errors.location}</p>
                  )}
                </div>

                <div className="grid gap-2">
                  <label htmlFor="jobType" className="text-sm font-medium">
                    Job Type*
                  </label>
                  <select
                    id="jobType"
                    value={formData.jobType}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, jobType: e.target.value }));
                      clearError('jobType');
                    }}
                    className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                      errors.jobType ? "border-red-500" : "border-input"
                    }`}
                  >
                    {jobTypes.map((type) => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                  {errors.jobType && (
                    <p className="text-sm text-red-500">{errors.jobType}</p>
                  )}
                </div>
              </div>

              {/* Second Column */}
              <div className="space-y-4">
                <div className="grid gap-2">
                  <label htmlFor="companyWebsite" className="text-sm font-medium flex items-center">
                    Company Website
                    <span className="text-xs text-gray-500 ml-2">(Optional)</span>
                  </label>
                  <Input
                    id="companyWebsite"
                    value={formData.companyWebsite}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, companyWebsite: e.target.value }));
                      clearError('companyWebsite');
                    }}
                    placeholder="https://company.com"
                    type="url"
                    className={errors.companyWebsite ? "border-red-500" : ""}
                  />
                  {errors.companyWebsite && (
                    <p className="text-sm text-red-500">{errors.companyWebsite}</p>
                  )}
                </div>

                <div className="grid gap-2">
                  <label htmlFor="startDate" className="text-sm font-medium">
                    Start Date*
                  </label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, startDate: e.target.value }));
                      clearError('startDate');
                    }}
                    className={errors.startDate ? "border-red-500" : ""}
                    required
                  />
                  {errors.startDate && (
                    <p className="text-sm text-red-500">{errors.startDate}</p>
                  )}
                </div>

                <div className="grid gap-2">
                  <label htmlFor="endDate" className="text-sm font-medium">
                    End Date
                  </label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, endDate: e.target.value }));
                      clearError('endDate');
                    }}
                    disabled={formData.isCurrent}
                    required={!formData.isCurrent}
                    className={errors.endDate ? "border-red-500" : ""}
                  />
                  {errors.endDate && (
                    <p className="text-sm text-red-500">{errors.endDate}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isCurrent"
                    checked={formData.isCurrent}
                    onChange={(e) => {
                      setFormData(prev => ({ 
                        ...prev, 
                        isCurrent: e.target.checked,
                        endDate: e.target.checked ? '' : prev.endDate 
                      }));
                      clearError('isCurrent');
                      clearError('endDate');
                    }}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="isCurrent" className="text-sm font-medium">
                    I currently work here
                  </label>
                </div>
              </div>
            </div>

            {/* Full Width Fields */}
            <div className="grid gap-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description*
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, description: e.target.value }));
                  clearError('description');
                }}
                className={`min-h-[100px] w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                  errors.description ? "border-red-500" : "border-input"
                }`}
                placeholder="Describe your role and responsibilities"
                required
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description}</p>
              )}
            </div>

            <div className="grid gap-2">
              <label htmlFor="technologies" className="text-sm font-medium">
                Technologies Used*
              </label>
              <div className="flex gap-2">
                <Input
                  id="technologies"
                  value={newTechnology}
                  onChange={(e) => setNewTechnology(e.target.value)}
                  placeholder="Add a technology"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTechnology();
                    }
                  }}
                  className={errors.technologies ? "border-red-500" : ""}
                />
                <Button 
                  type="button" 
                  onClick={handleAddTechnology}
                  variant="outline"
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.technologies.map((tech, index) => (
                  <div
                    key={index}
                    className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full flex items-center gap-1"
                  >
                    <span>{tech}</span>
                    <button
                      onClick={() => handleRemoveTechnology(index)}
                      className="text-blue-700 hover:text-blue-900"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              {errors.technologies && (
                <p className="text-sm text-red-500">{errors.technologies}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              type="button" 
              onClick={() => {
                setIsEditDialogOpen(false);
                setFormData(initialFormData);
                setErrors({});
              }}
              className="mr-2"
            >
              Cancel
            </Button>
            <Button 
              type="button"
              onClick={handleEdit}
              disabled={isSaving}
            >
              {isSaving ? 'Updating...' : 'Update Experience'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Work Experience</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this work experience? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-end">
            <Button 
              variant="outline" 
              type="button" 
              onClick={() => setIsDeleteDialogOpen(false)}
              className="mr-2"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              type="button"
              onClick={handleDelete}
              disabled={isSaving}
            >
              {isSaving ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <br />
      <div className="flex justify-between items-center mb-3 flex-col bg-muted/30 shadow rounded-xl w-fit mx-auto p-5 px-10">
        <h3 className="text-lg font-semibold text-gray-800">
          Work Experience
        </h3>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="border-primary text-primary hover:bg-blue-50 transition-colors"
              disabled={isSaving}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Experience
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>Add Work Experience</DialogTitle>
              <DialogDescription>
                Fill in your work experience details below
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4 overflow-y-auto pr-6 custom-scrollbar">
              <div className="grid grid-cols-2 gap-4">
                {/* First Column */}
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <label htmlFor="companyName" className="text-sm font-medium">
                      Company Name*
                    </label>
                    <Input
                      id="companyName"
                      value={formData.companyName}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, companyName: e.target.value }));
                        clearError('companyName');
                      }}
                      placeholder="Enter company name"
                      className={errors.companyName ? "border-red-500" : ""}
                      required
                    />
                    {errors.companyName && (
                      <p className="text-sm text-red-500">{errors.companyName}</p>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <label htmlFor="jobTitle" className="text-sm font-medium">
                      Job Title*
                    </label>
                    <Input
                      id="jobTitle"
                      value={formData.jobTitle}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, jobTitle: e.target.value }));
                        clearError('jobTitle');
                      }}
                      placeholder="Enter your job title"
                      className={errors.jobTitle ? "border-red-500" : ""}
                      required
                    />
                    {errors.jobTitle && (
                      <p className="text-sm text-red-500">{errors.jobTitle}</p>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <label htmlFor="location" className="text-sm font-medium">
                      Location*
                    </label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, location: e.target.value }));
                        clearError('location');
                      }}
                      placeholder="City, Country"
                      className={errors.location ? "border-red-500" : ""}
                      required
                    />
                    {errors.location && (
                      <p className="text-sm text-red-500">{errors.location}</p>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <label htmlFor="jobType" className="text-sm font-medium">
                      Job Type*
                    </label>
                    <select
                      id="jobType"
                      value={formData.jobType}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, jobType: e.target.value }));
                        clearError('jobType');
                      }}
                      className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                        errors.jobType ? "border-red-500" : "border-input"
                      }`}
                    >
                      {jobTypes.map((type) => (
                        <option key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </option>
                      ))}
                    </select>
                    {errors.jobType && (
                      <p className="text-sm text-red-500">{errors.jobType}</p>
                    )}
                  </div>
                </div>

                {/* Second Column */}
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <label htmlFor="companyWebsite" className="text-sm font-medium flex items-center">
                      Company Website
                      <span className="text-xs text-gray-500 ml-2">(Optional)</span>
                    </label>
                    <Input
                      id="companyWebsite"
                      value={formData.companyWebsite}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, companyWebsite: e.target.value }));
                        clearError('companyWebsite');
                      }}
                      placeholder="https://company.com"
                      type="url"
                      className={errors.companyWebsite ? "border-red-500" : ""}
                    />
                    {errors.companyWebsite && (
                      <p className="text-sm text-red-500">{errors.companyWebsite}</p>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <label htmlFor="startDate" className="text-sm font-medium">
                      Start Date*
                    </label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, startDate: e.target.value }));
                        clearError('startDate');
                      }}
                      className={errors.startDate ? "border-red-500" : ""}
                      required
                    />
                    {errors.startDate && (
                      <p className="text-sm text-red-500">{errors.startDate}</p>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <label htmlFor="endDate" className="text-sm font-medium">
                      End Date
                    </label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, endDate: e.target.value }));
                        clearError('endDate');
                      }}
                      disabled={formData.isCurrent}
                      required={!formData.isCurrent}
                      className={errors.endDate ? "border-red-500" : ""}
                    />
                    {errors.endDate && (
                      <p className="text-sm text-red-500">{errors.endDate}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isCurrent"
                      checked={formData.isCurrent}
                      onChange={(e) => {
                        setFormData(prev => ({ 
                          ...prev, 
                          isCurrent: e.target.checked,
                          endDate: e.target.checked ? '' : prev.endDate 
                        }));
                        clearError('isCurrent');
                        clearError('endDate');
                      }}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="isCurrent" className="text-sm font-medium">
                      I currently work here
                    </label>
                  </div>
                </div>
              </div>

              {/* Full Width Fields */}
              <div className="grid gap-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Description*
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, description: e.target.value }));
                    clearError('description');
                  }}
                  className={`min-h-[100px] w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                    errors.description ? "border-red-500" : "border-input"
                  }`}
                  placeholder="Describe your role and responsibilities"
                  required
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description}</p>
                )}
              </div>

              <div className="grid gap-2">
                <label htmlFor="technologies" className="text-sm font-medium">
                  Technologies Used*
                </label>
                <div className="flex gap-2">
                  <Input
                    id="technologies"
                    value={newTechnology}
                    onChange={(e) => setNewTechnology(e.target.value)}
                    placeholder="Add a technology"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTechnology();
                      }
                    }}
                    className={errors.technologies ? "border-red-500" : ""}
                  />
                  <Button 
                    type="button" 
                    onClick={handleAddTechnology}
                    variant="outline"
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.technologies.map((tech, index) => (
                    <div
                      key={index}
                      className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full flex items-center gap-1"
                    >
                      <span>{tech}</span>
                      <button
                        onClick={() => handleRemoveTechnology(index)}
                        className="text-blue-700 hover:text-blue-900"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                {errors.technologies && (
                  <p className="text-sm text-red-500">{errors.technologies}</p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button 
                variant="outline" 
                type="button" 
                onClick={() => {
                  setIsAddDialogOpen(false);
                  setFormData(initialFormData);
                  setErrors({});
                }}
                className="mr-2"
              >
                Cancel
              </Button>
              <Button 
                type="button"
                onClick={handleAdd}
                disabled={isSaving}
              >
                {isSaving ? 'Adding...' : 'Add Experience'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default WorkExperienceSection; 