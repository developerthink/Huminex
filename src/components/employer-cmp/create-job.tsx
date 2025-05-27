"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { JobType as ServerJobType } from "@/types/models/job";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Briefcase,
  DollarSign,
  Users,
  Clock,
  FileText,
  Info,
  Sparkles,
  User,
  GraduationCap,
  Brain,
  Plus,
} from "lucide-react";
import { Tag, TagInput } from "emblor";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { GoBriefcase, GoDash } from "react-icons/go";
import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@/components/ui/stepper";
import RichTextEditor from "../txt-editor";
import { PiFileDashed } from "react-icons/pi";
import axios from "axios";
import { useRouter } from "next/navigation";
import { createJob } from "@/actions/action";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const steps = [
  {
    step: 1,
    title: "Basic Details",
  },
  {
    step: 2,
    title: "AI Settings",
  },
  {
    step: 3,
    title: "Preview & Submit",
  },
];

interface Interviewer {
  name: string;
  gender: "male" | "female" | "";
  qualification: string;
}

interface Question {
  text: string;
  type: "TECHNICAL" | "BEHAVIORAL" | "SITUATIONAL" | "";
}

interface InvitedCandidate {
  name: string;
  email: string;
}

type InterviewSettings = Pick<ServerJobType['interviewSettings'], 
  'maxCandidates' | 'interviewDuration' | 'interviewers' | 
  'difficultyLevel' | 'questions' | 'language'>;

interface JobData extends Pick<ServerJobType, 
  'title' | 'about' | 'location' | 'salaryRange' | 'jobType' | 
  'workExperience' | 'techStack' | 'invitedCandidates'> {
  interviewSettings: InterviewSettings;
}

interface JobFormValues extends Omit<JobData, 'salaryRange' | 'workExperience' | 'interviewSettings'> {
  workExperience: number | "";
  ctcStart: number | "";
  ctcEnd: number | "";
  maxCandidates: 1 | 2 | "";
  interviewDuration: 10 | 15 | 20 | 25 | 30 | "";
  interviewers: Interviewer[];
  difficultyLevel: "easy" | "medium" | "hard" | "";
  questions: Question[];
}

type JobType = ServerJobType & { _id: string };

interface JobPostingWizardProps {
  jobToEdit?: JobType;
  isEditing?: boolean;
  onSubmit?: (values: JobFormValues) => void;
  initialValues?: Partial<JobFormValues>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const CreateJob: React.FC<JobPostingWizardProps> = ({ jobToEdit, isEditing, open, onOpenChange }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const getInitialValues = (job?: JobType): JobFormValues => {
    if (job) {
      return {
        invitedCandidates: job.invitedCandidates || [],
        title: job.title || "",
        jobType: job.jobType || "full-time",
        techStack: job.techStack || [],
        workExperience: job.workExperience || "",
        location: job.location || "remote",
        ctcStart: job.salaryRange?.start || "",
        ctcEnd: job.salaryRange?.end || "",
        maxCandidates: job.interviewSettings?.maxCandidates || 1,
        interviewDuration: job.interviewSettings?.interviewDuration || 10,
        interviewers: job.interviewSettings?.interviewers || [{ name: "", gender: "", qualification: "" }],
        difficultyLevel: job.interviewSettings?.difficultyLevel || "",
        questions: job.interviewSettings?.questions || [{ text: "", type: "TECHNICAL" }],
        about: job.about || ""
      };
    }
    return {
      invitedCandidates: [],
      title: "",
      jobType: "full-time",
      techStack: [],
      workExperience: "",
      location: "remote",
      ctcStart: "",
      ctcEnd: "",
      maxCandidates: 1,
      interviewDuration: 10,
      interviewers: [{ name: "", gender: "", qualification: "" }],
      difficultyLevel: "",
      questions: [{ text: "", type: "TECHNICAL" }],
      about: ""
    };
  };

  const [formValues, setFormValues] = useState<JobFormValues>(() => getInitialValues(jobToEdit));

  // Update form values when jobToEdit changes
  useEffect(() => {
    if (jobToEdit) {
      setFormValues(getInitialValues(jobToEdit));
      setStep(1); // Reset to first step when editing a new job
    }
  }, [jobToEdit]);
  const router = useRouter();

  const onSubmit = (values: JobFormValues) => {
    console.log(values);
  };
  const [step, setStep] = useState(1);

  const [techTags, setTechTags] = useState<Tag[]>(formValues.techStack.map((tech, index) => ({
    id: `tech-${index}`,
    text: tech,
  })));
  const [activeTagIndex, setActiveTagIndex] = useState<number | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name.startsWith('candidate')) {
      const [_, index, field] = name.split('-');
      const newCandidates = [...formValues.invitedCandidates];
      newCandidates[parseInt(index)] = {
        ...newCandidates[parseInt(index)],
        [field]: value
      };
      setFormValues({ ...formValues, invitedCandidates: newCandidates });
    } else {
      setFormValues({ ...formValues, [name]: value });
    }
  };

  const handleEditorChange = (html: string) => {
    setFormValues({ ...formValues, about: html });
  };

  const handleSelectChange = (name: string, value: string | number) => {
    setFormValues({ ...formValues, [name]: value });
  };

  const handleTechTagsChange = React.useCallback<React.Dispatch<React.SetStateAction<Tag[]>>>((newTags) => {
    if (typeof newTags === 'function') {
      setTechTags(newTags);
      setFormValues(prev => ({ ...prev, techStack: newTags(techTags).map(tag => tag.text) }));
    } else {
      setTechTags(newTags);
      setFormValues(prev => ({ ...prev, techStack: newTags.map(tag => tag.text) }));
    }
  }, [techTags]);

  const handleInterviewerChange = (
    index: number,
    field: keyof Interviewer,
    value: string
  ) => {
    const newInterviewers = [...formValues.interviewers];
    newInterviewers[index] = { ...newInterviewers[index], [field]: value };
    setFormValues({ ...formValues, interviewers: newInterviewers });
  };

  const addInvitedCandidate = () => {
    setFormValues({
      ...formValues,
      invitedCandidates: [...formValues.invitedCandidates, { name: '', email: '' }]
    });
  };

  const removeInvitedCandidate = (index: number) => {
    const newCandidates = formValues.invitedCandidates.filter((_, i) => i !== index);
    setFormValues({
      ...formValues,
      invitedCandidates: newCandidates
    });
  };

  const addInterviewerField = () => {
    setFormValues({
      ...formValues,
      interviewers: [
        ...formValues.interviewers,
        { name: "", gender: "", qualification: "" },
      ],
    });
  };

  const removeInterviewerField = (index: number) => {
    const newInterviewers = formValues.interviewers.filter(
      (_, i) => i !== index
    );
    setFormValues({
      ...formValues,
      interviewers: newInterviewers.length
        ? newInterviewers
        : [{ name: "", gender: "", qualification: "" }],
    });
  };

  const handleQuestionChange = (
    index: number,
    field: keyof Question,
    value: string
  ) => {
    const newQuestions = [...formValues.questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setFormValues({ ...formValues, questions: newQuestions });
  };

  const addQuestionField = () => {
    setFormValues({
      ...formValues,
      questions: [...formValues.questions, { text: "", type: "" }],
    });
  };

  const removeQuestionField = (index: number) => {
    const newQuestions = formValues.questions.filter((_, i) => i !== index);
    setFormValues({
      ...formValues,
      questions: newQuestions.length ? newQuestions : [{ text: "", type: "" }],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStepValid()) {
      toast.error('Please fill all required fields');
      return;
    }
    setIsSubmitting(true);

    try {
      // Only submit in preview section
      if (step !== 3) return;

      // Convert location to the expected format
      let locationValue: "remote" | "on-site" | "hybrid" = "remote";
      if (formValues.location === "on-site") {
        locationValue = "on-site";
      } else if (formValues.location === "hybrid") {
        locationValue = "hybrid";
      }

      const jobData = {
        title: formValues.title,
        about: formValues.about,
        location: locationValue,
        salaryRange: {
          start: Number(formValues.ctcStart) || 0,
          end: Number(formValues.ctcEnd) || 0
        },
        jobType: formValues.jobType as "full-time" | "part-time" | "internship",
        workExperience: Number(formValues.workExperience),
        techStack: formValues.techStack,
        interviewSettings: {
          maxCandidates: Number(formValues.maxCandidates) as 1 | 2,
          interviewDuration: Number(formValues.interviewDuration) as 10 | 15 | 20 | 25 | 30,
          interviewers: formValues.interviewers,
          difficultyLevel: formValues.difficultyLevel as "easy" | "medium" | "hard" | "",
          language: "english",
          questions: formValues.questions
        },
        invitedCandidates: formValues.invitedCandidates
      };

      let response;
      if (isEditing && jobToEdit) {
        response = await axios.put(`/api/job/${jobToEdit._id}`, jobData);
      } else {
        response = await axios.post('/api/job', jobData);
      }

      if (response.data.error) {
        toast.error(response.data.error);
        return;
      }

      await queryClient.invalidateQueries({ queryKey: ['emp-jobs','employerAnalytics'] });

      toast.success(isEditing ? 'Job updated successfully' : 'Job created successfully');
      router.push('/employer/dashboard/jobs');
      if (onSubmit) onSubmit(formValues);
      // Close dialog both for controlled and uncontrolled modes
      if (onOpenChange) {
        onOpenChange(false);
      } else {
        setIsOpen(false);
      }
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        // Show Zod validation error
        toast.error(error.response.data.error);
      } else {
        toast.error("Failed to create job. Please try again.");
      }
      console.error('Error creating job:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (isStepValid()) {
      setStep(step + 1);
    } else {
      toast.error('Please fill all required fields before proceeding');
    }
  };
  const prevStep = () => setStep(step - 1);

  const isStepValid = () => {
    if (step === 1) {
      return (
        formValues.title &&
        formValues.invitedCandidates.every(c => c.name && c.email) &&
        formValues.jobType &&
        formValues.techStack.every((tech) => tech.trim() !== "") &&
        formValues.workExperience !== "" &&
        formValues.ctcStart !== "" &&
        formValues.ctcEnd !== "" &&
        formValues.about.trim() !== ""
      );
    }
    if (step === 2) {
      return (
        formValues.maxCandidates !== "" &&
        formValues.interviewDuration !== "" &&
        formValues.difficultyLevel !== "" &&
        formValues.interviewers.every(
          (i) => i.name.trim() !== "" && i.gender !== "" && i.qualification.trim() !== ""
        ) &&
        formValues.questions.every((q) => q.text.trim() !== "" && q.type !== "")
      );
    }
    return true;
  };

  return (
    <Dialog 
      open={open !== undefined ? open : isOpen} 
      onOpenChange={onOpenChange || setIsOpen}
    >
      {!isEditing && (
        <DialogTrigger asChild>
          <Button className="w-full" onClick={() => setIsOpen(true)}>Create Job</Button>
        </DialogTrigger>
      )}
      <DialogContent className="flex flex-col text-white gap-0 p-0  overflow-hidden  h-[90vh] w-[60vw] [&>button:last-child]:top-3.5">
        <DialogHeader className="contents space-y-0 text-left">
          <DialogTitle className="border-b flex items-start gap-2 !bg-primary text-white  p-3 text-base">
            <GoBriefcase className="w-8 h-8 mt-1 bg-white/50 rounded-full p-1" />
            <div className="flex flex-col">
              <h2 className="text-2xl font-bold">{isEditing ? 'Edit Job' : 'Create Job'}</h2>
              <p className="italic text-white/70 font-medium">
                Fill the details for creating a job
              </p>
            </div>
          </DialogTitle>
          <Card className="*overflow-hidden text-black overflow-y-auto !p-0 rounded-none">
            <div className="space-y-8 text-center border-b p-2 px-4 sticky -top-[1px] z-10 bg-white">
              <Stepper value={step}>
                {steps.map(({ step: stepNum, title }) => (
                  <StepperItem
                    key={stepNum}
                    step={stepNum}
                    className="not-last:flex-1 max-md:items-start"
                  >
                    <StepperTrigger className="rounded max-md:flex-col">
                      <StepperIndicator />
                      <div className="text-center md:text-left">
                        <StepperTitle>{title}</StepperTitle>
                      </div>
                    </StepperTrigger>
                    {stepNum < steps.length && (
                      <StepperSeparator className="max-md:mt-3.5 md:mx-4" />
                    )}
                  </StepperItem>
                ))}
              </Stepper>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 p-5 pt-0">
              {step === 1 && (
                <>
                  {/* Job Title */}
                  <div className="p-4 rounded-xl bg-muted/20 shadow ">
                    <div className="grid grid-cols-2 gap-5">
                      <div className="relative">
                        <Label htmlFor="title">Job Title</Label>
                        <div className="relative">
                          <Input
                            id="title"
                            name="title"
                            value={formValues.title}
                            onChange={handleInputChange}
                            placeholder="Monetary Analyst Capital"
                            required
                          />
                        </div>
                      </div>
                      <div className="relative group">
                        <Label htmlFor="jobLocation">Job Location</Label>
                        <div className="relative">
                          <Select
                            onValueChange={(value) =>
                              handleSelectChange("location", value)
                            }
                            value={formValues.location}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Choose Job Location" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="remote">Remote</SelectItem>
                              <SelectItem value="hybrid">Hybrid</SelectItem>
                              <SelectItem value="on-site">On-site</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Job Type and Tech Stack */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="relative group">
                        <Label htmlFor="jobType">Job Type</Label>
                        <div className="relative">
                          <Select
                            onValueChange={(value) =>
                              handleSelectChange("jobType", value)
                            }
                            value={formValues.jobType}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Choose Job Type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="full-time">
                                Full-Time
                              </SelectItem>
                              <SelectItem value="part-time">
                                Part-Time
                              </SelectItem>
                              <SelectItem value="internship">
                                Internship
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="group">
                        <Label>Tech Stack</Label>
                        <TagInput
                          tags={techTags}
                          setTags={handleTechTagsChange as any}
                          placeholder="Add Tech"
                          styleClasses={{
                            inlineTagsContainer:
                              "border-indigo-200 rounded-lg bg-white shadow-sm transition-all duration-300 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500 p-2 gap-1 hover:shadow-md",
                            input:
                              "w-full min-w-[80px] shadow-none px-2 h-7 text-primary placeholder-indigo-400",
                            tag: {
                              body: "h-7 relative bg-indigo-100 border border-indigo-300 hover:bg-indigo-200 rounded-md font-medium text-xs ps-2 pe-7 text-primary",
                              closeButton:
                                "absolute -inset-y-px -end-px p-0 rounded-e-md flex size-7 transition-all outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 text-primary hover:text-primary",
                            },
                          }}
                          activeTagIndex={activeTagIndex}
                          setActiveTagIndex={setActiveTagIndex}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-muted/20 shadow grid grid-cols-2 divide-x *:px-4">
                    {/* CTC Range */}
                    <div className="relative group">
                      <Label>CTC Range (Per Annum)</Label>
                      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr]  gap-2 place-items-center">
                        <div className="relative">
                          <Input
                            type="number"
                            name="ctcStart"
                            value={formValues.ctcStart}
                            onChange={handleInputChange}
                            placeholder="e.g. 7.2"
                            required
                            min={0}
                          />
                        </div>
                        <GoDash className=" text-xl" />
                        <div className="relative">
                          <Input
                            type="number"
                            name="ctcEnd"
                            value={formValues.ctcEnd}
                            onChange={handleInputChange}
                            placeholder="e.g. 9"
                            required
                            min={0}
                          />
                        </div>
                      </div>
                    </div>
                    {/* Work Experience */}
                    <div className="relative group">
                      <Label htmlFor="workExperience">
                        Work Experience (Years)
                      </Label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-indigo-400 group-hover:text-primary transition-colors" />
                        <Input
                          type="number"
                          id="workExperience"
                          name="workExperience"
                          value={formValues.workExperience}
                          onChange={handleInputChange}
                          placeholder="Select experience"
                          className="pl-10"
                          required
                          min={0}
                        />
                      </div>
                    </div>
                  </div>
                  {/* About Job */}
                  <div className="relative group">
                    <Label htmlFor="about">About Job</Label>
                    <div className="relative">
                      <RichTextEditor 
                        initialContent={formValues.about || "<p>Start writing something brilliant...</p>"}
                        onChange={handleEditorChange}
                      />
                    </div>
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  {/* Invited Candidates */}
                  <div className="space-y-4 p-4 rounded-xl bg-muted/20 shadow mb-6">
                    <div className="space-y-2">
                      <Label>Invited Candidates</Label><br/>
                      {formValues.invitedCandidates.map((candidate, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Input
                            placeholder="Candidate Name"
                            name={`candidate-${index}-name`}
                            value={candidate.name}
                            onChange={handleInputChange}
                          />
                          <Input
                            placeholder="Candidate Email"
                            name={`candidate-${index}-email`}
                            value={candidate.email}
                            type="email"
                            onChange={handleInputChange}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeInvitedCandidate(index)}
                          >
                            <GoDash className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={addInvitedCandidate}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Candidate
                      </Button>
                    </div>
                  </div>

                  {/* Interview Settings */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 rounded-xl bg-muted/20 shadow">
                    <div className="relative group">
                      <Label htmlFor="maxCandidates">No. of Openings</Label>
                      <div className="relative">
                        <Input
                          type="number"
                          name="maxCandidates"
                          value={formValues.maxCandidates}
                          onChange={handleInputChange}
                          placeholder="Enter number"
                          required
                          min={0}
                        />
                      </div>
                    </div>
                    <div className="relative group">
                      <Label htmlFor="interviewDuration">
                        Interview Duration
                      </Label>
                      <div className="relative">
                        <Select
                          onValueChange={(value) =>
                            handleSelectChange(
                              "interviewDuration",
                              parseInt(value)
                            )
                          }
                          value={formValues.interviewDuration?.toString()}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select duration" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="10">10 minutes</SelectItem>
                            <SelectItem value="15">15 minutes</SelectItem>
                            <SelectItem value="20">20 minutes</SelectItem>
                            <SelectItem value="25">25 minutes</SelectItem>
                            <SelectItem value="30">30 minutes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="relative group">
                      <Label htmlFor="difficultyLevel">Difficulty Level</Label>
                      <div className="relative">
                        <Select
                          onValueChange={(value) =>
                            handleSelectChange("difficultyLevel", value)
                          }
                          value={formValues.difficultyLevel}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select difficulty level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="easy">Easy</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="hard">Hard</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Difficulty Level */}

                  {/* Interviewers */}
                  <div className="group  rounded-lg shadow overflow-hidden bg-muted/20">
                    <div className="bgGrad *:!text-white p-2.5">
                      <Label className="my-3 text-lg font-semibold">
                        AI Interviewers (Max 2)
                      </Label>
                      <p className="text-sm opacity-80 italic mb-1">
                        Select and Configure the AI Interviewers for taking the
                        interview
                      </p>
                    </div>
                    <hr />
                    <div className="divide-y *:py-3  p-4">
                      {formValues.interviewers.map((interviewer, index) => (
                        <div
                          key={index}
                          className="space-y-4 grid grid-cols-3 gap-x-6"
                        >
                          <div className="relative">
                            <Label htmlFor={`interviewer-name-${index}`}>
                              Name{" "}
                            </Label>
                            <div className="relative">
                              <Input
                                id={`interviewer-name-${index}`}
                                value={interviewer.name}
                                onChange={(e) =>
                                  handleInterviewerChange(
                                    index,
                                    "name",
                                    e.target.value
                                  )
                                }
                                placeholder="Interviewer name"
                                required
                              />
                            </div>
                          </div>
                          <div className="relative">
                            <Label htmlFor={`interviewer-gender-${index}`}>
                              Gender
                            </Label>
                            <div className="relative">
                              <Select
                                onValueChange={(value) =>
                                  handleInterviewerChange(
                                    index,
                                    "gender",
                                    value
                                  )
                                }
                                value={interviewer.gender}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="male">Male</SelectItem>
                                  <SelectItem value="female">Female</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="relative">
                            <Label
                              htmlFor={`interviewer-qualification-${index}`}
                            >
                              Qualification
                            </Label>
                            <div className="relative">
                              <Input
                                id={`interviewer-qualification-${index}`}
                                value={interviewer.qualification}
                                onChange={(e) =>
                                  handleInterviewerChange(
                                    index,
                                    "qualification",
                                    e.target.value
                                  )
                                }
                                placeholder="e.g., PhD in Computer Science"
                                required
                              />
                            </div>
                          </div>
                          <div className="">
                            {formValues.interviewers.length > 1 && (
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => removeInterviewerField(index)}
                              >
                                Remove
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      className="mx-4 mb-2"
                      onClick={addInterviewerField}
                    >
                      Add Interviewer <Plus />
                    </Button>
                  </div>

                  {/* Interview Questions */}
                  <div className="group rounded-lg shadow overflow-hidden bg-muted/20 p-2">
                    <div className="p-2">
                      <Label className=" text-lg font-medium">
                        Interview Questions
                      </Label>
                      <p className="text-sm opacity-80 italic mb-1">
                        Add and Configure the Interview Questions
                      </p>
                    </div>
                    <hr />
                    <div className="divide-y *:py-3 p-4">
                      {formValues.questions.map((question, index) => (
                        <div
                          key={index}
                          className=" grid grid-cols-[2fr_1fr] gap-x-6"
                        >
                          <div className="relative">
                            <Input
                              value={question.text}
                              onChange={(e) =>
                                handleQuestionChange(
                                  index,
                                  "text",
                                  e.target.value
                                )
                              }
                              placeholder={`Question ${index + 1}`}
                              required
                            />
                          </div>
                          <div className="relative">
                            <Select
                              onValueChange={(value) =>
                                handleQuestionChange(index, "type", value)
                              }
                              value={question.type}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select question type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="TECHNICAL">
                                  Technical
                                </SelectItem>
                                <SelectItem value="BEHAVIORAL">
                                  Behavioral
                                </SelectItem>
                                <SelectItem value="SITUATIONAL">
                                  Situational
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          {formValues.questions.length > 1 && (
                            <Button
                              type="button"
                              variant="destructive"
                              className="w-fit"
                              size="sm"
                              onClick={() => removeQuestionField(index)}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      className="mx-4 mb-2"
                      onClick={addQuestionField}
                    >
                      Add Question <Plus />
                    </Button>
                  </div>
                </>
              )}
              {step === 3 && (
                <div className="space-y-8 p-6">
                  {/* Preview Section */}
                  <div className="p-8 rounded-2xl  transition-all shadow bg-gradient-to-br from-white to-primary/15">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                      <FileText className="w-7 h-7 text-indigo-500" /> Job
                      Posting Preview
                    </h3>



                    {/* Job Overview */}
                    <div className="space-y-6">
                      <div className="border-b border-gray-200 pb-4">
                        <h4 className="text-xl font-semibold text-gray-800">
                          {formValues.title || "Untitled Job"}
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">
                          {formValues.jobType || "Not specified"} •{" "}
                          {formValues.location || "Not specified"}
                        </p>
                      </div>

                      {/* Key Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-center gap-3 group">
                          <Briefcase className="w-6 h-6 text-indigo-500 group-hover:text-indigo-600 transition-colors" />
                          <span className="text-gray-700">
                            Experience: {formValues.workExperience || 0} years
                          </span>
                        </div>
                        <div className="flex items-center gap-3 group">
                          <DollarSign className="w-6 h-6 text-indigo-500 group-hover:text-indigo-600 transition-colors" />
                          <span className="text-gray-700">
                            CTC: {formValues.ctcStart || 0} -{" "}
                            {formValues.ctcEnd || 0} LPA
                          </span>
                        </div>
                        <div className="flex items-center gap-3 group">
                          <Users className="w-6 h-6 text-indigo-500 group-hover:text-indigo-600 transition-colors" />
                          <span className="text-gray-700">
                            Openings:{" "}
                            {formValues.maxCandidates || "Not specified"}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 group">
                          <Clock className="w-6 h-6 text-indigo-500 group-hover:text-indigo-600 transition-colors" />
                          <span className="text-gray-700">
                            Duration:{" "}
                            {formValues.interviewDuration || "Not specified"}{" "}
                            minutes
                          </span>
                        </div>
                      </div>

                      {/* Tech Stack */}
                      <div className="bg-white p-5 rounded-xl shadow-sm">
                        <h5 className="font-semibold text-gray-800 mb-3">
                          Tech Stack
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {formValues.techStack.map((tech, index) => (
                            <span
                              key={index}
                              className="bg-indigo-100 text-indigo-700 text-sm font-medium px-3 py-1 rounded-full hover:bg-indigo-200 transition-colors"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* About Job */}
                      <div className="bg-white p-5 rounded-xl shadow-sm">
                        <h5 className="font-semibold text-gray-800 mb-3">
                          About the Job
                        </h5>
                        <div
                          className="text-sm text-gray-600 leading-relaxed"
                          dangerouslySetInnerHTML={{
                            __html:
                              formValues.about || "No description provided",
                          }}
                        />
                      </div>

                      {/* Interviewers */}
                      <div className="bg-white p-5 rounded-xl shadow-sm">
                        <h5 className="font-semibold text-gray-800 mb-3">
                          Interviewers
                        </h5>
                        <div className="space-y-3">
                          {formValues.interviewers.map((interviewer, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-3 group"
                            >
                              <User className="w-6 h-6 text-indigo-500 group-hover:text-indigo-600 transition-colors" />
                              <span className="text-gray-700">
                                {interviewer.name || "Unnamed"} (
                                {interviewer.gender || "Not specified"}) -{" "}
                                {interviewer.qualification ||
                                  "No qualification"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Questions */}
                      <div className="bg-white p-5 rounded-xl shadow-sm">
                        <h5 className="font-semibold text-gray-800 mb-3">
                          Interview Questions
                        </h5>
                        <div className="space-y-3">
                          {formValues.questions.map((question, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-3 group"
                            >
                              <Brain className="w-6 h-6 text-indigo-500 group-hover:text-indigo-600 transition-colors" />
                              <span className="text-gray-700">
                                {question.text || "No question"} (
                                {question.type || "Not specified"})
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Difficulty Level */}
                      <div className="flex items-center gap-3 group">
                        <GraduationCap className="w-6 h-6 text-indigo-500 group-hover:text-indigo-600 transition-colors" />
                        <span className="text-gray-700">
                          Difficulty:{" "}
                          {formValues.difficultyLevel || "Not specified"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* Form Actions */}
              <div className="flex justify-between mt-8">
                {step > 1 && (
                  <Button type="button" onClick={prevStep}>
                    Previous
                  </Button>
                )}
                {step < 3 ? (
                  <Button
                    type="button"
                    className="ml-auto"
                    onClick={nextStep}
                    disabled={!isStepValid() || isSubmitting}
                  >
                    {isSubmitting ? "Saving..." : "Next"}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    className="ml-auto"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit
                        <Sparkles className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </form>
          </Card>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default CreateJob;
