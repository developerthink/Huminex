import { signIn } from "@/auth";
import CredentialSignIn from "@/components/auth-cmp/credential-sigin";
import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { FaGithub } from "react-icons/fa6";
import { FcGoogle } from "react-icons/fc";
import { TbBrandLinkedinFilled } from "react-icons/tb";

export default function page() {
  const handleLogin = async (formData: FormData) => {
    "use server";
    const provider = formData.get("provider");
    if (typeof provider === "string") {
      await signIn(provider, { redirectTo: "/role" });
    } else {
      console.error("Invalid provider");
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="flex w-full max-w-4xl z-10 relative rounded-lg overflow-hidden shadow-2xl border border-slate-100">
        <div className="hidden bgGrad bg-cover bg-center bg-no-repeat  w-1/2 p-3 relative text-white md:flex ">
          <div className="w-full m-10 z-10">
          <Logo className="w-16"/>

            <br />
            <h2 className="text-4xl font-semibold mb-6">Log In to Huminex</h2>
            <p className="text-lg opacity-80">
              Log in to your Huminex account to access your dashboard and manage
              your job applications, interview schedules, and more.
            </p>
          </div>
        </div>

        {/* Left Section - Form */}
        <div className="w-full md:w-1/2 p-8 relative bg-white flex flex-col justify-center">
          <br />
          <div>
            <h2 className="text-3xl font-bold mb-6 leading-0 ">Log In</h2>
            <p className="text-lg opacity-80 ">Welcome Back to your account</p>
          </div>
          <br />

          <CredentialSignIn />

          <div className="my-4 flex items-center">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="px-4 text-gray-500">Or</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <form action={handleLogin} className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              name="provider"
              value="google"
              type="submit"
              className="w-full flex items-center justify-center gap-2"
            >
              <FcGoogle className="size-6" />
              Google
            </Button>

            <Button
              type="submit"
              name="provider"
              value="github"
              variant="outline"
              className="w-full flex items-center   justify-center gap-2"
            >
              <FaGithub className="size-6" />
              GitHub
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-600">
            By Log In you agree to our terms and conditions
          </p>
        </div>
      </div>
    </div>
  );
}
