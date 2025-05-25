"use client";
import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

const CredentialSignIn = ({ isLogin = true }: { isLogin?: boolean }) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCredentialSign = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;
    
    try {
      setLoading(true);
      
      if (!isLogin) {
        // Handle registration
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password, name }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || 'Registration failed');
        }
        toast.success("Successfully registered!");
        // After successful registration, sign in the user
        const signInResult = await signIn('credentials', {
          email,
          password,
          redirect: false,
          callbackUrl: '/role'
        });

        if (signInResult?.error) {
          throw new Error("Registration successful, but failed to sign in. Please log in manually.");
        }

        // If sign in was successful, the callbackUrl will handle the redirect
        if (signInResult?.url) {
          window.location.href = signInResult.url;
          return;
        }

        router.push('/role');
        return;
      }

      // Handle regular login
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/role"
      });
      
      if (result?.error) {
        throw new Error("Invalid email or password");
      }
      
      // If we get here, sign in was successful
      toast.success("Successfully signed in!");
      
      // Use window.location.href to ensure a full page refresh
      window.location.href = "/role";
    } catch (error: any) {
      console.error("Authentication error:", error);
      toast.error(error.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleCredentialSign}>
      {!isLogin && (
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            type="text"
            name="name"
            required={!isLogin}
            placeholder="John Doe"
            className="w-full"
          />
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="email">Email address</Label>
        <Input
          id="email"
          type="email"
          name="email"
          required
          placeholder="Email"
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          placeholder="••••••••"
          className="w-full"
        />
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full"
      >
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : isLogin ? (
          "Log In"
        ) : (
          "Register"
        )}
      </Button>

      <div className="text-center text-sm">
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <Link
          href={isLogin ? "/register" : "/login"}
          className="text-primary hover:underline"
        >
          {isLogin ? "Register" : "Log In"}
        </Link>
      </div>
    </form>
  );
};

export default CredentialSignIn;