'use server'
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


const DbLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth();
  if (!session || session.user.role !== "candidate") {
    return redirect("/login");
  }
console.log(session)

  return (
    <div className="flex gap-2 h-screen overflow-hidden bg-slate-100">
      <aside className="h-full w-60 p-3 relative">
        <Logo className="ml-3" />
        <br />
        <Link href="/candidate/dashboard/jobs">
          <Button className="w-full">Find Jobs</Button>
        </Link>
        <ul className="flex flex-col gap-2 mt-5 ">
          {[
            { name: "Home", href: "/candidate/dashboard", icon: TbSmartHome },
            {
              name: "Applications",
              href: "/candidate/dashboard/applications",
              icon: GoBriefcase,
            },
            // {name: "Interviews", href: "/candidate/dashboard/interviews", icon: SlSpeech},
            {
              name: "Profile",
              href: "/candidate/dashboard/profile",
              icon: GoPerson,
            },
            {
              name: "Notifications",
              href: "/candidate/dashboard/notifications",
              icon: GoBell,
            },
          ].map((item) => (
            <li
              className="hover:bg-primary/20 backdrop-blur-lg hover:text-primary font-medium *:p-2 *:px-4 rounded-full"
              key={item.name}
            >
              <Link className="flex items-center gap-2" href={item.href}>
                <item.icon className="w-5 h-5" />
                <span className="text-[15px] font-medium"> {item.name}</span>
              </Link>
            </li>
          ))}
        </ul>

       <Logout/>
      </aside>
      <main className="bg-white rounded-xl p-3 m-4 ml-0 flex-1 overflow-hidden flex flex-col">
        <header className=" p-1 shrink-0 px-2 border-b flex items-center justify-between">
          <div className="flex items-center gap-2 divide-x *:px-1">
            <button>
              <TbArrowBarToLeft className="w-5 h-5" />
            </button>
            <StatusMenu/>
          </div>
          <div className="flex items-center gap-2">
            <NotificationDropdown redirect="/candidate/dashboard/notifications"/>
            <div className="flex items-center gap-2 text-[15px] font-medium">
              <button className=" p-2 rounded-full bg-muted/50 hover:bg-primary/30 hover:text-primary">
                <User className="w-5 h-5" />
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
