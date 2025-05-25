"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Edit, Trash2 } from "lucide-react";
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
import { UserData } from "@/types/user";

interface EducationSectionProps {
  educationDetails: UserData['educationDetails'];
  onUpdateUser: (newData: UserData['educationDetails']) => Promise<void>;
  isSaving: boolean;
}

interface EducationFormData {
  collegeName: string;
  yearOfGraduation: number;
  fieldOfStudy: string;
  degree: string;
}

const EducationSection: React.FC<EducationSectionProps> = ({ 
  educationDetails: initialEducationDetails, 
  onUpdateUser,
  isSaving 
}) => {
  const [educationDetails, setEducationDetails] = useState<UserData['educationDetails']>(initialEducationDetails);
  const [formData, setFormData] = useState<EducationFormData>({
    collegeName: '',
    yearOfGraduation: new Date().getFullYear(),
    fieldOfStudy: '',
    degree: ''
  });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Update local state when props change
  useEffect(() => {
    setEducationDetails(initialEducationDetails);
  }, [initialEducationDetails]);

  const handleAdd = async () => {
    const newEducation = {
      ...formData,
      _id: Date.now().toString(), // Temporary ID, will be replaced by DB
    };
    const newEducationDetails = [...educationDetails, newEducation];
    await onUpdateUser(newEducationDetails);
    setIsAddDialogOpen(false);
    setFormData({ collegeName: '', yearOfGraduation: new Date().getFullYear(), fieldOfStudy: '', degree: '' });
  };

  const handleEdit = async () => {
    if (!selectedId) return;
    const newEducationDetails = educationDetails.map(edu => 
      edu._id === selectedId ? { ...formData, _id: selectedId } : edu
    );
    await onUpdateUser(newEducationDetails);
    setIsEditDialogOpen(false);
    setSelectedId(null);
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    const newEducationDetails = educationDetails.filter(edu => edu._id !== selectedId);
    await onUpdateUser(newEducationDetails);
    setIsDeleteDialogOpen(false);
    setSelectedId(null);
  };

  const openEditDialog = (education: UserData['educationDetails'][0]) => {
    setFormData({
      collegeName: education.collegeName,
      yearOfGraduation: education.yearOfGraduation,
      fieldOfStudy: education.fieldOfStudy,
      degree: education.degree
    });
    setSelectedId(education._id);
    setIsEditDialogOpen(true);
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-6">
    

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Edit Education Details</DialogTitle>
            <DialogDescription>
              Update your education information below
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="collegeName" className="text-sm font-medium">
                College/University Name
              </label>
              <Input
                id="collegeName"
                value={formData.collegeName}
                onChange={(e) => setFormData(prev => ({ ...prev, collegeName: e.target.value }))}
                placeholder="Enter your college/university name"
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="graduationYear" className="text-sm font-medium">
                Graduation Year
              </label>
              <Input
                id="graduationYear"
                type="number"
                value={formData.yearOfGraduation}
                onChange={(e) => setFormData(prev => ({ ...prev, yearOfGraduation: parseInt(e.target.value) }))}
                placeholder="Enter graduation year"
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="fieldOfStudy" className="text-sm font-medium">
                Field of Study
              </label>
              <Input
                id="fieldOfStudy"
                value={formData.fieldOfStudy}
                onChange={(e) => setFormData(prev => ({ ...prev, fieldOfStudy: e.target.value }))}
                placeholder="Enter your field of study"
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="degree" className="text-sm font-medium">
                Degree
              </label>
              <Input
                id="degree"
                value={formData.degree}
                onChange={(e) => setFormData(prev => ({ ...prev, degree: e.target.value }))}
                placeholder="Enter your degree"
              />
            </div>
          </div>

          <DialogFooter className="sm:justify-end">
            <Button 
              variant="outline" 
              type="button" 
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="button"
              onClick={handleEdit}
              disabled={isSaving}
            >
              {isSaving ? 'Updating...' : 'Update Education'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this education entry? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-end">
            <Button 
              variant="outline" 
              type="button" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              type="button"
              onClick={handleDelete}
              disabled={isSaving}
            >
              {isSaving ? 'Deleting...' : 'Delete Education'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="space-y-4">
        {educationDetails.map((education) => (
          <div
            key={education._id}
            className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-gray-900">{education.collegeName}</h4>
                <p className="text-sm text-gray-600">
                  {education.degree} in {education.fieldOfStudy}
                </p>
                <p className="text-sm text-gray-600">Graduation Year: {education.yearOfGraduation}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => openEditDialog(education)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-500 hover:text-red-700"
                  onClick={() => {
                    setSelectedId(education._id);
                    setIsDeleteDialogOpen(true);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <br />
      <div className="flex justify-between items-center mb-3 flex-col bg-muted/30 shadow rounded-xl w-fit mx-auto p-5 px-10">
        <h3 className="text-lg font-semibold text-gray-800">
          Education Details
        </h3>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="border-primary text-primary hover:bg-blue-50 transition-colors"
              aria-label="Add new education detail"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Education
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md max-h-[85vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>Add Education Details</DialogTitle>
              <DialogDescription>
                Fill in your education information below
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4 overflow-y-auto pr-6 custom-scrollbar">
              <div className="grid gap-2">
                <label htmlFor="collegeName" className="text-sm font-medium">
                  College/University Name
                </label>
                <Input
                  id="collegeName"
                  value={formData.collegeName}
                  onChange={(e) => setFormData(prev => ({ ...prev, collegeName: e.target.value }))}
                  placeholder="Enter your college/university name"
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="graduationYear" className="text-sm font-medium">
                  Graduation Year
                </label>
                <Input
                  id="graduationYear"
                  type="number"
                  value={formData.yearOfGraduation}
                  onChange={(e) => setFormData(prev => ({ ...prev, yearOfGraduation: parseInt(e.target.value) }))}
                  placeholder="Enter graduation year"
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="fieldOfStudy" className="text-sm font-medium">
                  Field of Study
                </label>
                <Input
                  id="fieldOfStudy"
                  value={formData.fieldOfStudy}
                  onChange={(e) => setFormData(prev => ({ ...prev, fieldOfStudy: e.target.value }))}
                  placeholder="Enter your field of study"
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="degree" className="text-sm font-medium">
                  Degree
                </label>
                <Input
                  id="degree"
                  value={formData.degree}
                  onChange={(e) => setFormData(prev => ({ ...prev, degree: e.target.value }))}
                  placeholder="Enter your degree"
                />
              </div>
            </div>

            <DialogFooter className="sm:justify-end">
              <Button 
                variant="outline" 
                type="button" 
                onClick={() => setIsAddDialogOpen(false)}
                className="mr-2"
              >
                Cancel
              </Button>
              <Button 
                type="button"
                onClick={handleAdd}
                disabled={isSaving}
              >
                {isSaving ? 'Adding...' : 'Add Education'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default EducationSection; 