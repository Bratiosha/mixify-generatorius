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
import ClientWrapper from "@/components/ClientWrapper"; // Ensure this is created as shown earlier

export function SignUpForm() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#1DB954] to-[#121212] p-6">
      <ClientWrapper
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Card className="mx-auto w-full max-w-md border-none bg-gray-900/90 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-3xl font-bold text-white">
              Create an Account
            </CardTitle>
            <CardDescription className="text-gray-300">
              Enter your information to get started.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action="">
              <div className="space-y-4">
                {/* First and Last Name */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300" htmlFor="first-name">
                      First Name
                    </Label>
                    <Input
                      name="first-name"
                      id="first-name"
                      placeholder="Max"
                      required
                      className="bg-gray-800 text-white placeholder-gray-400 focus:border-[#1DB954] focus:ring-[#1DB954]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300" htmlFor="last-name">
                      Last Name
                    </Label>
                    <Input
                      name="last-name"
                      id="last-name"
                      placeholder="Robinson"
                      required
                      className="bg-gray-800 text-white placeholder-gray-400 focus:border-[#1DB954] focus:ring-[#1DB954]"
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <Label className="text-gray-300" htmlFor="email">
                    Email
                  </Label>
                  <Input
                    name="email"
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    className="bg-gray-800 text-white placeholder-gray-400 focus:border-[#1DB954] focus:ring-[#1DB954]"
                  />
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label className="text-gray-300" htmlFor="password">
                    Password
                  </Label>
                  <Input
                    name="password"
                    id="password"
                    type="password"
                    required
                    className="bg-gray-800 text-white placeholder-gray-400 focus:border-[#1DB954] focus:ring-[#1DB954]"
                  />
                </div>

                {/* Sign-Up Button */}
                <Button
                  formAction={signup}
                  type="submit"
                  className="w-full bg-[#1DB954] hover:bg-[#1ed760] text-white font-semibold py-2 rounded-md transition-all"
                >
                  Create an Account
                </Button>
              </div>
            </form>

            {/* Sign-In Link */}
            <div className="mt-6 text-center text-sm text-gray-300">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-[#1DB954] underline"
              >
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </ClientWrapper>
    </div>
  );
}