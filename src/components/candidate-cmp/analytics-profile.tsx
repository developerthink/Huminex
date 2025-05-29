import React from 'react'
import { Clock, Github, Globe, Linkedin, MapPin, Twitter } from 'lucide-react'


  const getDifficultyColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "easy":
        return "bg-green-100 text-green-800 border-green-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "hard":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getJobTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "full-time":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "part-time":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "contract":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "hired":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };
const AnalyticsProfile = ({applicationData}: {applicationData: any}) => {
  return (
    <div className="max-w-7xl mx-auto p-4 w-full m-2">
        <div>
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Job Details */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-slate-800 mb-2">
                    {applicationData?.jobId?.title ?? "Untitled Job"}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span className="capitalize">
                        {applicationData?.jobId?.location ?? "Unknown Location"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span className="capitalize">
                        {applicationData?.jobId?.workType ?? "Unknown Type"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium border ${
                      applicationData?.jobId?.jobType
                        ? getJobTypeColor(applicationData.jobId.jobType)
                        : "border-gray-200 text-gray-500"
                    }`}
                  >
                    {applicationData?.jobId?.jobType ?? "N/A"}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium border ${
                      applicationData?.jobId?.interviewSettings?.difficultyLevel
                        ? getDifficultyColor(
                            applicationData.jobId.interviewSettings
                              .difficultyLevel
                          )
                        : "border-gray-200 text-gray-500"
                    }`}
                  >
                    {applicationData?.jobId?.interviewSettings
                      ?.difficultyLevel ?? "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Candidate Section */}
          <div className="bgGrad rounded-xl p-6 border border-slate-200 !text-white">
            <div className="flex items-start gap-6">
              {/* Profile Image */}
              <div className="flex-shrink-0">
                <img
                  src={
                    applicationData?.candidateId?.image ?? "/default-avatar.png"
                  }
                  alt={applicationData?.candidateId?.name ?? "Candidate"}
                  className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                />
              </div>

              {/* Candidate Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h2 className="text-2xl font-semibold mb-1">
                      {applicationData?.candidateId?.name ??
                        "Unknown Candidate"}
                    </h2>
                    <p className="mb-2">
                      {applicationData?.candidateId?.email ??
                        "No email available"}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium border ${
                      applicationData?.hiringStatus
                        ? getStatusColor(applicationData.hiringStatus)
                        : "border-gray-200 text-gray-500"
                    }`}
                  >
                    {applicationData?.hiringStatus ?? "Unknown Status"}
                  </span>
                </div>

                {/* Skills */}
                <div className="mb-4">
                  <h3 className="text-sm font-medium mb-2">Top Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {applicationData?.candidateId?.skill?.length > 0 ? (
                      applicationData.candidateId.skill
                        .slice(0, 5)
                        .map((skill: string, index: number) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-primary/30 border !border-primary/40 backdrop-blur-2xl !text-white rounded-full text-sm font-medium transition-colors"
                          >
                            {skill ?? "Unknown Skill"}
                          </span>
                        ))
                    ) : (
                      <span className="px-3 py-1 bg-primary/30 border !border-primary/40 backdrop-blur-2xl !text-white rounded-full text-sm font-medium">
                        No skills listed
                      </span>
                    )}
                    {applicationData?.candidateId?.skill?.length > 5 && (
                      <span className="px-3 py-1 bg-primary/30 border !border-primary/40 backdrop-blur-2xl !text-white rounded-full text-sm font-medium">
                        +
                        {(applicationData?.candidateId?.skill?.length ?? 0) - 5}{" "}
                        more
                      </span>
                    )}
                  </div>
                </div>

                {/* Social Links */}
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">Connect:</span>
                  <div className="flex gap-3">
                    {applicationData?.candidateId?.socialLinks?.linkedin && (
                      <a
                        href={applicationData.candidateId.socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <Linkedin className="w-4 h-4" />
                      </a>
                    )}
                    {applicationData?.candidateId?.socialLinks?.github && (
                      <a
                        href={applicationData.candidateId.socialLinks.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <Github className="w-4 h-4" />
                      </a>
                    )}
                    {applicationData?.candidateId?.socialLinks?.portfolio && (
                      <a
                        href={`https://${applicationData.candidateId.socialLinks.portfolio}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                      >
                        <Globe className="w-4 h-4" />
                      </a>
                    )}
                    {applicationData?.candidateId?.socialLinks?.x && (
                      <a
                        href={applicationData.candidateId.socialLinks.x}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-sky-50 text-sky-600 rounded-lg hover:bg-sky-100 transition-colors"
                      >
                        <Twitter className="w-4 h-4" />
                      </a>
                    )}
                    {!applicationData?.candidateId?.socialLinks?.linkedin &&
                      !applicationData?.candidateId?.socialLinks?.github &&
                      !applicationData?.candidateId?.socialLinks?.portfolio &&
                      !applicationData?.candidateId?.socialLinks?.x && (
                        <span className="text-sm text-gray-400">
                          No social links available
                        </span>
                      )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  )
}

export default AnalyticsProfile