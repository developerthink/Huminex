// src/app/role/page.tsx
import { auth } from "@/auth";
import RoleSelection from "@/components/auth-cmp/role-selection";
import { redirect } from "next/navigation";

export default async function RolePage() {
  const session = await auth();
  const role = session?.user?.role;
  if (role) {
    redirect(`/${role}/dashboard`);
  }

  return (
    <div className="container flex h-screen w-full bg-muted/20 flex-col items-center justify-center">
      <RoleSelection />
    </div>
  );
}
