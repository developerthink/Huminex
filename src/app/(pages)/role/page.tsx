// src/app/role/page.tsx
import { auth } from "@/auth";
import RoleSelection from "@/components/auth-cmp/role-selection";
import { redirect } from "next/navigation";

export default async function RolePage() {
  const session = await auth();
  const role = session?.user?.role;
  if (role && role !== "none") {
    redirect(`/${role}/dashboard`);
  }

  return (
    <div className=" h-screen w-full grid place-items-center">
      <RoleSelection />
    </div>
  );
}
