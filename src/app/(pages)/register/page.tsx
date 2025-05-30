import { signIn } from "@/auth";
import CredentialSignIn from "@/components/auth-cmp/credential-sigin";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa6";
import Logo from "@/components/logo";

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
            <h2 className="text-4xl font-semibold mb-6">
            Register with Huminex Today
            </h2>
            <p className="text-lg opacity-80">
            Join India's top AI-powered talent network to find your dream job or hire top talent effortlessly with Huminex.
            </p>
          </div>
        </div>

        {/* Left Section - Form */}
        <div className="w-full md:w-1/2 p-8 py-2 relative bg-white flex flex-col justify-center">
          <br />
          <div>
            <h2 className="text-3xl font-bold mb-6 leading-0 ">Register</h2>
            <p className="text-lg opacity-80 ">
              Get started with your account
            </p>
          </div>
          <br />

          <CredentialSignIn isLogin={false} />

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
              className="w-full flex items-center justify-center gap-2"
            >
              <FaGithub className="size-6" />
              GitHub
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-600">
            By Register you agree to our terms and conditions
          </p>
        </div>
      </div>
    </div>
  );
}
