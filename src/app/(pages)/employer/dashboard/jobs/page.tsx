'use client'
import React from "react";
import TableNex from "react-tablenex";
import "react-tablenex/style.css";
import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";
import CreateJob from "@/components/employer-cmp/create-job";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import axios from "axios";
import { JobType } from "@/types/models/job";
import { toast } from "sonner";
import Link from 'next/link';
import WbLoader from "@/components/global-cmp/wbLoader";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MdErrorOutline } from 'react-icons/md';

const fetchJobs = async () => {
  const response = await axios.get('/api/employer/jobs');
  return response.data.data;
};

const deleteJob = async (jobId: string) => {
  const response = await axios.delete(`/api/job/${jobId}`);
  return response.data;
};

const page = () => {
  interface TableJobType {
    id: string;
    jobTitle: string;
    jobType: string;
    location: string;
    ctcRange: string;
    workExperience: number;
    openings: number;
    interviewDuration: number;
    difficultyLevel: string;
    techStack: string[];
    actions: React.ReactNode;
  }

  const queryClient = useQueryClient();
  const [tableData, setTableData] = useState<any[]>([]);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [deleteJobId, setDeleteJobId] = useState<string | null>(null);

  const { data: jobs, isLoading, error } = useQuery({
    queryKey: ['emp-jobs'],
    queryFn: fetchJobs
  });

  const deleteMutation = useMutation({
    mutationFn: deleteJob,
    onSuccess: (data) => {
      if (data.error) {
        toast.error(data.error);
        return;
      }
      toast.success('Job deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['emp-jobs'] });
      setDeleteJobId(null);
    },
    onError: (error: any) => {
      console.error('Error deleting job:', error);
      toast.error('Failed to delete job');
      setDeleteJobId(null);
    }
  });

  React.useEffect(() => {
    if (jobs) {
      const tableData = jobs.map((job: any) => ({
        id: job._id,
        jobTitle: <Link href={`/employer/dashboard/jobs/applications/${job._id}`} className="text-primary hover:underline">{job.title}</Link>,
        jobType: job.jobType,
        location: job.location,
        ctcRange: `${job.salaryRange.start} - ${job.salaryRange.end} LPA`,
        workExperience: job.workExperience,
        openings: job.interviewSettings.maxCandidates,
        interviewDuration: job.interviewSettings.interviewDuration,
        difficultyLevel: job.interviewSettings.difficultyLevel,
        techStack: job.techStack,
        actions: (
          <div className="flex items-center justify-center">
            <Popover>
              <PopoverTrigger asChild>
                <button className="p-2 hover:bg-gray-100 rounded-full">
                  <MoreHorizontal className="h-5 w-5 text-gray-500" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-40 p-2">
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleEdit(job)}
                    className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 rounded-md w-full text-left text-sm"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(job._id)}
                    className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 rounded-md w-full text-left text-sm text-red-600"
                  >
                    <Trash className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </PopoverContent>
            </Popover>
            <CreateJob 
              jobToEdit={job} 
              isEditing={true} 
              open={editingJobId === job._id}
              onOpenChange={(open) => !open && setEditingJobId(null)}
              onSubmit={() => {
                setEditingJobId(null);
              }}
            />
          </div>
        ),
        ...job
      }));
      setTableData(tableData);
    }
  }, [jobs]);

  const handleEdit = (job: JobType) => {
    console.log("job on edit", job);
    setEditingJobId(job._id);
  };

  const handleDelete = (jobId: string) => {
    setDeleteJobId(jobId);
  };

  const confirmDelete = () => {
    if (!deleteJobId) return;
    deleteMutation.mutate(deleteJobId);
  };

  const customColumns = [
    { accessor: "id", header: "Job ID" },
    {
      accessor: "jobTitle",
      header: (
        <div className="flex items-center gap-1">
          Job Title
        </div>
      ),
      render: (_: any, row: any) => (
        <h3 className="font-semibold text-nowrap text-[17px]">{row.jobTitle}</h3>
      ),
    },
    { accessor: "jobType", header: "Job Type" },
    {
      accessor: "location",
      header: (
        <div className="flex items-center gap-1">
          Location
        </div>
      ),
    },
    { accessor: "ctcRange", header: "CTC Range",
        render: (_: any, row: any) => (
          <h3 className="text-nowrap italic">{row.ctcRange}</h3>
        ),
    },
    { accessor: "workExperience", header: "Work Exp",
      render: (_: any, row: any) => (
        <h3>{row.workExperience} yrs</h3>
      ),
    },
    { accessor: "interviewDuration", header: "Duration",
        render: (_: any, row: any) => (
          <h3>{row.interviewDuration} min</h3>
        ),
    },
    { accessor: "difficultyLevel", header: "Difficulty Level",
        render: (_: any, row: any) => (
          <h3 className={`text-nowrap rounded-full px-2 py-0.5 text-sm uppercase ${row.difficultyLevel === "easy" ? "text-green-500 bg-green-500/30" : row.difficultyLevel === "medium" ? "bg-yellow-500/30 text-yellow-500" : "bg-red-500/30 text-red-500"}`}>{row.difficultyLevel}</h3>
        ),
    },
    { accessor: "techStack", header: "Tech Stack",
        render: (_: any, row: any) => (
          <h3 className="text-nowrap truncate hover:w-auto hover:text-wrap w-[100px]">{row.techStack.join(", ")}</h3>
        ),
    },
    { 
      accessor: "actions", 
      header: "Actions",
      render: (_: any, row: any) => (
        <div className="flex items-center justify-center">
          <Popover>
            <PopoverTrigger asChild>
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <MoreHorizontal className="h-5 w-5 text-gray-500" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-40 p-2">
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleEdit(row)}
                  className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 rounded-md w-full text-left text-sm"
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(row.id)}
                  className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 rounded-md w-full text-left text-sm text-red-600"
                >
                  <Trash className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </PopoverContent>
          </Popover>
          <CreateJob 
            jobToEdit={row} 
            isEditing={true} 
            open={editingJobId === row.id}
            onOpenChange={(open) => !open && setEditingJobId(null)}
            onSubmit={() => {
              setEditingJobId(null);
              queryClient.invalidateQueries({ queryKey: ['emp-jobs'] });
            }}
          />
        </div>
      ),
    },
  ];

  const handleInviteCandidate = (jobId: string) => {
    console.log(`Inviting candidate for job ${jobId}`);
    setActiveMenu(null);
  };

  const handleDeleteJob = (jobId: string) => {
    console.log(`Deleting job ${jobId}`);
    setActiveMenu(null);
  };

  const toggleMenu = (jobId: string) => {
    setActiveMenu(activeMenu === jobId ? null : jobId);
  };

  // if (isLoading) {
  //   return <WbLoader />;
  // }

  if (error) {
    return (
      <div className="gap-2 p-8 grid place-items-baseline w-full">
        <h1 className="text-2xl font-bold">All Jobs</h1>
        <p className="text-sm text-red-500 flex flex-col gap-2"><MdErrorOutline className='w-8 h-8' />{error?.message || 'Error loading jobs'}</p>
      </div>
    );
  }

  return (
    <div className="mt-5 jobList">
      <div className="flex flex-col w-full gap-2 p-8 bgGrad text-white rounded-xl">
        <h1 className="text-2xl font-bold">All Jobs</h1>
        <p className="text-sm ">Manage all jobs here</p>
      </div>
      <br />
      <TableNex
        columns={customColumns}
        styles={{
          spacing: "lg",
          rounded: "lg",
        }}
        keyField={{
          keyId: "id",
          isVisible: false,
        }}
        colorScheme={{
          ACCENT: "var(--primary)",
          BORDER: "var(--input)",
          PRIMARY: "var(--background)",
          SECONDARY: "#F5F7F6",
        }}
        noDataMessage={isLoading ? <WbLoader /> : "No jobs found"}
        data={tableData || []}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteJobId !== null} onOpenChange={(open) => !open && setDeleteJobId(null)}>
        <DialogContent className="w-fit">
          <DialogHeader>
            <DialogTitle>Delete Job</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this job? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              onClick={() => setDeleteJobId(null)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
              className="ml-3 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {deleteMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default page;