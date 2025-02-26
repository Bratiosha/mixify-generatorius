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
import { login } from "@/lib/auth-actions";
import SignInWithGoogleButton from "./SignInWithGoogleButton";
import ClientWrapper from "@/components/ClientWrapper";

export function LoginForm() {
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
              Welcome Back
            </CardTitle>
            <CardDescription className="text-gray-300">
              Enter your email and password to access your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action="">
              <div className="space-y-4">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label className="text-gray-300" htmlFor="email">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    className="bg-gray-800 text-white placeholder-gray-400 focus:border-[#1DB954] focus:ring-[#1DB954]"
                  />
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Label className="text-gray-300" htmlFor="password">
                      Password
                    </Label>
                    <Link
                      href="#"
                      className="ml-auto inline-block text-sm text-[#1DB954] underline"
                    >
                      Forgot your password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="bg-gray-800 text-white placeholder-gray-400 focus:border-[#1DB954] focus:ring-[#1DB954]"
                  />
                </div>

                {/* Login Button */}
                <Button
                  type="submit"
                  formAction={login}
                  className="w-full bg-[#1DB954] hover:bg-[#1ed760] text-white font-semibold py-2 rounded-md transition-all"
                >
                  Login
                </Button>

                {/* Google Sign-In Button */}
                <SignInWithGoogleButton />
              </div>
            </form>

            {/* Sign-Up Link */}
            <div className="mt-6 text-center text-sm text-gray-300">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="font-semibold text-[#1DB954] underline"
              >
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </ClientWrapper>
    </div>
  );
}