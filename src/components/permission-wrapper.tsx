"use client";

import React from "react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { isPermissionAllowed } from "@/actions/permission";

const PermissionWrapper = ({
  children,
  handleSubmit,
}: {
  children: React.ReactNode;
  handleSubmit: any;
}) => {
  const { data: permissionData } = useQuery({
    queryKey: ["permission"],
    queryFn: isPermissionAllowed,
  });

  const showNotification = () => {
    toast.message("Permission Required", {
      description: "Only invited users can perform this action.",
      duration: Infinity,
      closeButton: true,
      actionButtonStyle: {
        backgroundColor: "var(--primary)",
        color: "#fff",
        padding: "12px",
        height: "30px",
        borderRadius: "50px",
      },
      className: "bg-primary text-white",
      action: {
        label: "Request Permission",
        onClick: () => window.open("https://x.com/huminexco", "_blank"),
      },
    });
  };

  return (
    <div
      onClick={permissionData ? handleSubmit : showNotification}
      className="cursor-pointer"
    >
      {children}
    </div>
  );
};

export default PermissionWrapper;
