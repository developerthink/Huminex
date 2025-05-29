"use client";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { FaArrowRight, FaUserTie } from "react-icons/fa";
import { PiBriefcaseFill } from "react-icons/pi";
import { Button } from "@/components/ui/button";
import { GrClear } from "react-icons/gr";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function RoleSelection() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [hoveredRole, setHoveredRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const roles = [
    {
      name: "Candidate",
      icon: FaUserTie,
      description: "Looking for job opportunities",
    },
    {
      name: "Employer",
      icon: PiBriefcaseFill,
      description: "Hiring talent for your company",
    },
  ];

  const handleContinue = async () => {
    if (!selectedRole) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.put("/api/user/role", {
        role: selectedRole.toLowerCase(),
      });

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      // Redirect based on role
      if (selectedRole.toLowerCase() === "employer") {
        router.push("/employer/setup-profile");
      } else {
        router.push("/candidate/setup-profile");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update role");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Card className="flex flex-col items-center p-10 w-full mx-auto shadow-xl border border-input/50">
        <div className="flex flex-col items-center mb-8">
          <Image src="/logo.png" alt="Logo" width={80} height={80} className="brightness-105"/>
          <h1 className="text-2xl font-bold text-gray-900">Select User Type</h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 max-w-md w-full">
          {roles.map((role) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.name;
            const isHovered = hoveredRole === role.name;

            return (
              <button
                key={role.name}
                onClick={() =>
                  setSelectedRole(role.name as "Candidate" | "Employer")
                }
                onMouseEnter={() => setHoveredRole(role.name)}
                onMouseLeave={() => setHoveredRole(null)}
                className={`flex flex-col items-center p-6 rounded-lg border transition-all duration-200 w-full
                ${
                  isSelected || isHovered
                    ? "bg-primary text-white border-primary/50"
                    : "bg-white text-gray-900 border-gray-200"
                }
                hover:!bg-primary hover:!text-white hover:border-primary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                aria-label={`Select ${role.name} role`}
                disabled={isLoading}
              >
                <Icon
                  className={`w-8 h-8 mb-2 ${
                    isSelected || isHovered ? "text-white" : "text-primary"
                  }`}
                />
                <span className="text-lg font-semibold">{role.name}</span>
              </button>
            );
          })}
        </div>

        {selectedRole && (
          <p className="mt-4 text-sm text-gray-500 text-center">
            {selectedRole === "Candidate"
              ? "You can browse and apply for jobs."
              : "You can post jobs and manage applications."}
          </p>
        )}

        {error && (
          <p className="mt-4 text-sm text-red-500 text-center">{error}</p>
        )}
      </Card>

      {selectedRole && (
        <div className="flex mt-4 gap-2 items-center justify-end w-full max-w-xl">
          <Button
            onClick={() => setSelectedRole(null)}
            variant="outline"
            disabled={isLoading}
          >
            Clear
            <GrClear />
          </Button>
          <Button onClick={handleContinue} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                Continue with {selectedRole}{" "}
                <FaArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
