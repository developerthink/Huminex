"use client";
import { usePathname } from "next/navigation";
import React from "react";
import Link from "next/link";

const StatusMenu = () => {
  const path = usePathname();
  return (
    <Link href={path} className="capitalize">
      {path.split("/").pop() === "dashboard" ? "Home" : path.split("/").pop()}
    </Link>
  );
};

export default StatusMenu;
