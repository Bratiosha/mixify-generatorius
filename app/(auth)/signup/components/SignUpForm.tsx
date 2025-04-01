"use client"; // Mark this component as client-side only

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signup } from "@/lib/auth-actions";
import { motion } from "framer-motion";
import ClientWrapper from "@/components/ClientWrapper";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import SignInWithGoogleButton from "@/app/(auth)/login/components/SignInWithGoogleButton";

export function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    lowercase: false,
    uppercase: false,
    number: false,
  });

  const validatePassword = (value: string) => {
    setPassword(value);
    setPasswordRequirements({
      length: value.length >= 8,
      lowercase: /[a-z]/.test(value),
      uppercase: /[A-Z]/.test(value),
      number: /[0-9]/.test(value),
    });
  };

  const isPasswordValid = Object.values(passwordRequirements).every(Boolean);
  const requirementsMet = Object.values(passwordRequirements).filter(Boolean).length;
  const progressPercentage = (requirementsMet / 4) * 100;

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isPasswordValid) {
      toast.error("Please ensure your password meets all requirements.");
      return;
    }
    setIsLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      const result = await signup(formData);
      
      if (result.success) {
        toast.success(result.message);
        // Wait a moment to show the success message before redirecting
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        toast.error(result.error || "Failed to create account. Please try again.");
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      toast.error(error.message || "Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#1DB954] to-[#121212] p-6">
      <ClientWrapper
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Card className="mx-auto w-full max-w-md border-none bg-gray-900/90 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <CardTitle className="text-3xl font-bold text-white">
                Create an Account
              </CardTitle>
              <CardDescription className="text-gray-300">
                Enter your information to get started.
              </CardDescription>
            </motion.div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp} className="space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="grid grid-cols-2 gap-4"
              >
                <div className="space-y-2">
                  <Label className="text-gray-300" htmlFor="first-name">
                    First Name
                  </Label>
                  <div className="relative">
                    <Input
                      name="first-name"
                      id="first-name"
                      placeholder="Max"
                      required
                      className="bg-gray-800 text-white placeholder-gray-400 focus:border-[#1DB954] focus:ring-[#1DB954] pl-10"
                    />
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300" htmlFor="last-name">
                    Last Name
                  </Label>
                  <div className="relative">
                    <Input
                      name="last-name"
                      id="last-name"
                      placeholder="Robinson"
                      required
                      className="bg-gray-800 text-white placeholder-gray-400 focus:border-[#1DB954] focus:ring-[#1DB954] pl-10"
                    />
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-2"
              >
                <Label className="text-gray-300" htmlFor="email">
                  Email
                </Label>
                <div className="relative">
                  <Input
                    name="email"
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    className="bg-gray-800 text-white placeholder-gray-400 focus:border-[#1DB954] focus:ring-[#1DB954] pl-10"
                  />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-2"
              >
                <Label className="text-gray-300" htmlFor="password">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    name="password"
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => validatePassword(e.target.value)}
                    className="bg-gray-800 text-white placeholder-gray-400 focus:border-[#1DB954] focus:ring-[#1DB954] pl-10"
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {password && (
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Password strength</span>
                      <span className="text-gray-400">{requirementsMet}/4 requirements met</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-gray-800">
                      <div
                        className="h-full rounded-full bg-[#1DB954] transition-all duration-300"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                    <div className="text-sm text-gray-400">
                      Password must contain:
                      <div className="mt-1 grid grid-cols-2 gap-2">
                        <div className={passwordRequirements.length ? "text-green-500" : ""}>
                          • At least 8 characters
                        </div>
                        <div className={passwordRequirements.lowercase ? "text-green-500" : ""}>
                          • One lowercase letter
                        </div>
                        <div className={passwordRequirements.uppercase ? "text-green-500" : ""}>
                          • One uppercase letter
                        </div>
                        <div className={passwordRequirements.number ? "text-green-500" : ""}>
                          • One number
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-4"
              >
                <Button
                  type="submit"
                  disabled={isLoading || !isPasswordValid}
                  className="w-full bg-[#1DB954] hover:bg-[#1ed760] text-white font-semibold py-2 rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    "Create an Account"
                  )}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-700" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-gray-900 px-2 text-gray-400">Or continue with</span>
                  </div>
                </div>

                <SignInWithGoogleButton />
              </motion.div>
            </form>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-6 text-center text-sm text-gray-300"
            >
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-[#1DB954] hover:text-[#1ed760] underline transition-colors"
              >
                Sign in
              </Link>
            </motion.div>
          </CardContent>
        </Card>
      </ClientWrapper>
    </div>
  );
}