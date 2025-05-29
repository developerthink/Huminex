import React from "react";
import {
  Share2,
  DollarSign,
  Clock,
  Briefcase,
  Calendar,
  Users,
  LucideLoader,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "./ui/badge";
import PermissionWrapper from "./permission-wrapper";

interface JobCardProps {
  job: any;
  hasMore?: boolean;
}

const applyForJob = async (jobId: string) => {
  const response = await fetch(`/api/candidate/apply/${jobId}`, {
    method: "POST",
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to apply for the job");
  }
  return data;
};

const JobCard: React.FC<JobCardProps> = ({
  job,
  hasMore = true,
}: JobCardProps) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const applyMutation = useMutation({
    mutationFn: () => applyForJob(job._id),
    onSuccess: (data) => {
      toast.success("Successfully applied for the job!");
      router.push(`/interview/${data.data.applicationId}`);
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to apply for the job");
    },
  });

  const handleApply = () => {
    applyMutation.mutate();
  };

  return (
    <Card className="gap-2 border bg-muted/20 hover:ring-2 m-2 transition-all ring-primary">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-md overflow-hidden flex items-center justify-center">
            <Image
              src={job.employerId.companyDetails.logo}
              alt={job.employerId.companyDetails.name}
              width={40}
              height={40}
              className="object-cover"
            />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">
              {job.title}
            </CardTitle>
            <p className="text-sm text-gray-500">
              {job.employerId.companyDetails.name}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: `${job.title} at ${job.employerId.companyDetails.name}`,
                  text: `${job.title} at ${job.employerId.companyDetails.name}\n\nApply now: ${window.location.origin}/jobs/${job._id}`,
                })
                  .catch((error) => console.log('Error sharing:', error));
              }
            }}
            aria-label="Share job"
          >
            <Share2 size={18} className="text-gray-500" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Badge className="bg-blue-100 text-blue-700 capitalize">
            {job.location}
          </Badge>
          <Badge className="bg-green-100 text-green-700 capitalize">
            {job.interviewSettings.difficultyLevel}
          </Badge>
        </div>

        {hasMore && (
          <>
            <div className="flex flex-wrap gap-2">
              {job.techStack.map((skill: string, index: number) => (
                <Badge key={index} className="bg-gray-100 text-gray-700">
                  {skill}
                </Badge>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  icon: <DollarSign size={16} className="text-gray-500" />,
                  label: "Salary",
                  value: `${job.salaryRange.start} - ${job.salaryRange.end} LPA`,
                },
                {
                  icon: <Clock size={16} className="text-gray-500" />,
                  label: "Duration",
                  value: `${job.interviewSettings.interviewDuration} mins`,
                },
                {
                  icon: <Briefcase size={16} className="text-gray-500" />,
                  label: "Experience",
                  value: `${job.workExperience} years`,
                },
                {
                  icon: <Calendar size={16} className="text-gray-500" />,
                  label: "Job Type",
                  value: job.jobType,
                },
                {
                  icon: <Users size={16} className="text-gray-500" />,
                  label: "Openings",
                  value: job.interviewSettings.maxCandidates,
                },
              ].map((detail, index) => (
                <div key={index} className="flex items-center space-x-2">
                  {detail.icon}
                  <div>
                    <p className="text-xs text-gray-500">{detail.label}</p>
                    <p className="text-sm font-medium text-gray-900">
                      {detail.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>

      <CardFooter className="flex justify-between items-center border-t pt-4">
        {/* <p className="text-sm text-gray-500">
          Posted {formatTimeAgo(job.createdAt)}
        </p> */}
        <div className="flex space-x-2">
          <Link href={`/jobs/${job._id}`} target="_blank">
            <Button variant="outline" size={hasMore ? "default" : "sm"}>
              Details
            </Button>
          </Link>
          <PermissionWrapper handleSubmit={handleApply}>
            <Button
              size={hasMore ? "default" : "sm"}

              disabled={applyMutation.isPending}
              className={
                applyMutation.isPending ? "opacity-75 cursor-not-allowed" : ""
              }
            >
             { applyMutation.isPending && <LucideLoader className="ml-2 animate-spin" />}
             {applyMutation.isPending ? "Applying..." : "Apply Now"}
            </Button>
          </PermissionWrapper>

        </div>
      </CardFooter>
    </Card>
  );
};

export default JobCard;
