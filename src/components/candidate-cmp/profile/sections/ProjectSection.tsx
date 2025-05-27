"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Edit, Trash2, FileText, Link as LinkIcon } from "lucide-react";
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

interface ProjectSectionProps {
  projects: UserData['projects'];
  onUpdateUser: (newData: UserData['projects']) => Promise<void>;
  isSaving: boolean;
}

interface ProjectFormData {
  title: string;
  description: string;
  link: string;
  technologies: string[];
}
import mongoose from "mongoose";

const generatedId = new mongoose.Types.ObjectId();
const ProjectSection: React.FC<ProjectSectionProps> = ({ 
  projects: initialProjects, 
  onUpdateUser,
  isSaving 
}) => {
  const [projects, setProjects] = useState<UserData['projects']>(initialProjects || []);
  const [formData, setFormData] = useState<ProjectFormData>({
    title: '',
    description: '',
    link: '',
    technologies: [],
  });
  const [newTechnology, setNewTechnology] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Update local state when props change
  useEffect(() => {
    setProjects(initialProjects || []);
  }, [initialProjects]);

  const handleAddTechnology = () => {
    if (newTechnology.trim()) {
      setFormData(prev => ({
        ...prev,
        technologies: [...prev.technologies, newTechnology.trim()]
      }));
      setNewTechnology('');
    }
  };

  const handleRemoveTechnology = (index: number) => {
    setFormData(prev => ({
      ...prev,
      technologies: prev.technologies.filter((_, i) => i !== index)
    }));
  };

  const handleAdd = async () => {
    const newProject = {
      ...formData,
      _id: generatedId.toString(), // Temporary ID, will be replaced by DB
    };
    const newProjects = [...projects, newProject];
    await onUpdateUser(newProjects);
    setIsAddDialogOpen(false);
    setFormData({
      title: '',
      description: '',
      link: '',
      technologies: [],
    });
  };

  const handleEdit = async () => {
    if (!selectedId) return;
    const newProjects = projects.map(project => 
      project._id === selectedId ? { ...formData, _id: selectedId } : project
    );
    await onUpdateUser(newProjects);
    setIsEditDialogOpen(false);
    setSelectedId(null);
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    const newProjects = projects.filter(project => project._id !== selectedId);
    await onUpdateUser(newProjects);
    setIsDeleteDialogOpen(false);
    setSelectedId(null);
  };

  const openEditDialog = (project: UserData['projects'][0]) => {
    setFormData({
      title: project.title,
      description: project.description,
      link: project.link,
      technologies: [...project.technologies],
    });
    setSelectedId(project._id);
    setIsEditDialogOpen(true);
  };

  return (
    <div className=" py-6">
   
      <div className="space-y-4 w-full">
        {projects && projects.length > 0 ? (
          projects.map((project) => (
            <div
              key={project._id}
              className="bg-white  relative overflow-hidden w-full p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex w-full">
                <div className="space-y-3 w-full">
                  <div className="w-full flex-col">
                    <h4 className="text-lg font-semibold text-ellipsis text-wrap text-gray-900 mb-1">{project.title}</h4>
                    <p className="text-sm text-gray-600 truncate text-wrap">{project.description}</p>
                  </div>
                  
                  {project.link && (
                    <a 
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 gap-1.5"
                    >
                      <LinkIcon className="w-4 h-4" />
                      View Project
                    </a>
                  )}
                  
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech, index) => (
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
                
                <div className="flex gap-2 absolute right-2 top-2 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-500 hover:text-blue-600"
                    onClick={() => openEditDialog(project)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-500 hover:text-red-600"
                    onClick={() => {
                      setSelectedId(project._id);
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            No projects added yet. Add your first project to showcase your work!
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Edit Project Details</DialogTitle>
            <DialogDescription>
              Update your project information below
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4 overflow-y-auto pr-6 custom-scrollbar">
              <div className="grid gap-2">
                <label htmlFor="projectTitle" className="text-sm font-medium">
                  Project Title*
                </label>
                <Input
                  id="projectTitle"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter your project title"
                  required
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="projectLink" className="text-sm font-medium">
                  Project Link
                </label>
                <Input
                  id="projectLink"
                  value={formData.link}
                  onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                  placeholder="Enter project link (GitHub/Live Demo)"
                  type="url"
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Description*
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="Describe your project"
                  required
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="technologies" className="text-sm font-medium">
                  Technologies*
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
                  />
                  <Button 
                    type="button" 
                    onClick={handleAddTechnology}
                    variant="outline"
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.technologies.map((tech, index) => (
                    <div
                      key={index}
                      className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md flex items-center gap-1"
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
              </div>
            </div>

          <DialogFooter className="sm:justify-end">
            <Button 
              variant="outline" 
              type="button" 
              onClick={() => setIsEditDialogOpen(false)}
              className="mr-2"
            >
              Cancel
            </Button>
            <Button 
              type="button"
              onClick={handleEdit}
              disabled={isSaving}
            >
              {isSaving ? 'Updating...' : 'Update Project'}
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
              Are you sure you want to delete this project? This action cannot be undone.
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
              {isSaving ? 'Deleting...' : 'Delete Project'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <br />
      <div className="flex justify-between items-center mb-3 flex-col bg-muted/30 shadow rounded-xl w-fit mx-auto p-5 px-10">
        <h3 className="text-lg font-semibold text-gray-800">
          Projects
        </h3>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="border-primary text-primary hover:bg-blue-50 transition-colors"
              aria-label="Add new project"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Project
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md max-h-[85vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>Add Project Details</DialogTitle>
              <DialogDescription>
                Fill in your project information below
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4 overflow-y-auto pr-6 custom-scrollbar">
              <div className="grid gap-2">
                <label htmlFor="projectTitle" className="text-sm font-medium">
                  Project Title*
                </label>
                <Input
                  id="projectTitle"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter your project title"
                  required
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="projectLink" className="text-sm font-medium">
                  Project Link
                </label>
                <Input
                  id="projectLink"
                  value={formData.link}
                  onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                  placeholder="Enter project link (GitHub/Live Demo)"
                  type="url"
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Description*
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="Describe your project"
                  required
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="technologies" className="text-sm font-medium">
                  Technologies*
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
                  />
                  <Button 
                    type="button" 
                    onClick={handleAddTechnology}
                    variant="outline"
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.technologies.map((tech, index) => (
                    <div
                      key={index}
                      className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md flex items-center gap-1"
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
                {isSaving ? 'Adding...' : 'Save Project'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ProjectSection; 