import React from "react";
import { X, Minimize2, Mic, Camera, FileText } from "lucide-react";
import { Button } from "../ui/button";
import Image from "next/image";
import Logo from "../logo";

interface PermissionRequestProps {
  permissions: {
    camera: boolean;
    microphone: boolean;
  };
  permissionError: string;
  onPermissionToggle: () => void;
}

const PermissionRequest: React.FC<PermissionRequestProps> = ({
  permissions,
  permissionError,
  onPermissionToggle,
}) => {
  const PermissionItem = ({
    icon: Icon,
    title,
    status,
  }: {
    icon: any;
    title: string;
    status: boolean;
  }) => (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="mt-1">
        <Icon className="w-5 h-5 text-gray-600" />
      </div>
      <div className="flex-1">
        <h3 className="font-medium text-gray-900">{title}</h3>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm">Status:</span>
        <span
          className={
            status ? "text-green-500 font-medium" : "text-red-500 font-medium"
          }
        >
          {status ? "Granted" : "Not Granted"}
        </span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen  flex items-center justify-center p-4">
      <div className="w-full max-w-3xl shadow-2xl bg-white  border border-input/20 rounded-2xl  overflow-hidden">
        <div className="flex">
          {/* Left Panel */}
          <div className="flex-1 p-8 pt-5 border-b">
            <Logo />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Permission Required
            </h1>
            <p className="text-gray-600 mb-3 max-w-md">
              Please grant access to your camera and microphone to proceed with
              the interview.
            </p>

            {permissionError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{permissionError}</p>
              </div>
            )}

            <div className="space-y-2 mb-4">
              <PermissionItem
                icon={Camera}
                title="Camera Access"
                status={permissions.camera}
              />

              <PermissionItem
                icon={Mic}
                title="Microphone Access"
                status={permissions.microphone}
              />
            </div>
            <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-blue-600 mt-1" />
                <div className="flex-1">
                  <h3 className="font-medium text-blue-900">Interview Tips</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Be yourself, stay kind and honest, and respect the
                    interviewer—misleading or misbehaving can end the interview
                    abruptly.
                  </p>
                </div>
              </div>
            </div>
            <p className="text-sm mt-1 text-gray-500 mb-6">
              Camera and microphone access help us provide you with the best
              interview experience.
            </p>

            <Button
              className="w-full h-12"
              size="lg"
              onClick={onPermissionToggle}
            >
              Request Permissions
            </Button>
          </div>

          {/* Right Panel */}
          <div className="w-80 bg-gradient-to-br from-primary/50  to-primary/10 flex flex-col items-center justify-center p-8">
            <img
              src="/permission.png"
              alt="Permission"
              className="brightness-[1.4] w-[600px] scale-125"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermissionRequest;
