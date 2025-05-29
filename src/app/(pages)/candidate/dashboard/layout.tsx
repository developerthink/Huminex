"use server";
import React from "react";
import Logo from "@/components/logo";
import Link from "next/link";
import { TbArrowBarToLeft, TbSmartHome } from "react-icons/tb";
import { GoBriefcase } from "react-icons/go";
import { GoPerson } from "react-icons/go";
import { GoBell } from "react-icons/go";
import { User, Bell, Briefcase, Calendar, Star, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import NotificationDropdown from "@/components/candidate-cmp/notification-dropdown";
import Logout from "@/components/global-cmp/logout";
import StatusMenu from "@/components/global-cmp/status-menu";
import AsideLinks from "@/components/global-cmp/aside-links";

const DbLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth();
  if (!session || session.user.role !== "candidate") {
    return redirect("/login");
  }
  console.log(session);

  return (
    <div className="flex gap-2 h-screen overflow-hidden bg-slate-100">
      <aside className="h-full w-60 p-3 relative">
        <div className="flex items-end *:px-2 "><Logo className="ml-3" /> <h2 className="p-1 bg-primary/15  rounded-full text-primary/80">Candidate</h2></div>
        <br />
        <Link href="/candidate/dashboard/jobs">
          <Button className="w-full">Find Jobs</Button>
        </Link>
        <ul className="flex flex-col gap-2 mt-5 ">
          {[
            { name: "Home", href: "/candidate/dashboard", icon: <TbSmartHome /> },
            {
              name: "Applications",
              href: "/candidate/dashboard/applications",
              icon: <GoBriefcase />,
            },
            // {name: "Interviews", href: "/candidate/dashboard/interviews", icon: SlSpeech},
            {
              name: "Profile",
              href: "/candidate/dashboard/profile",
              icon: <GoPerson />,
            },
            {
              name: "Notifications",
              href: "/candidate/dashboard/notifications",
              icon: <GoBell />,
            },
          ].map((item) => (
           <AsideLinks item={item}/>
          ))}
        </ul>

        <Logout />
      </aside>
      <main className="bg-white rounded-xl p-3 m-4 ml-0 flex-1 overflow-hidden flex flex-col">
        <header className=" p-1 shrink-0 px-2 border-b flex items-center justify-between">
          <div className="flex items-center gap-2 divide-x *:px-1">
            <StatusMenu />
          </div>
          <div className="flex items-center gap-2">
            <NotificationDropdown redirect="/candidate/dashboard/notifications" />
            <div className="flex items-center gap-2 text-[15px] font-medium">
              <button className="rounded-full bg-muted/50 hover:bg-primary/30 hover:text-primary">
                <img src={"https://img.icons8.com/color/45/user-male-circle--v1.png"} alt="user"  />
              </button>
              <div className="flex flex-col">
                <span className="font-semibold">{session.user.name}</span>
                <span className="text-xs text-muted-foreground">
                  {session.user.email}
                </span>
              </div>
            </div>
          </div>
        </header>
        <div className="overflow-y-auto">{children}</div>
      </main>
    </div>
  );
};

export default DbLayout;
