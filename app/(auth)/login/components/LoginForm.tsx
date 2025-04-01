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
import { login, resetPassword } from "@/lib/auth-actions";
import SignInWithGoogleButton from "./SignInWithGoogleButton";
import ClientWrapper from "@/components/ClientWrapper";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";

export function LoginForm() {
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      toast.error("Please enter your email address");
      return;
    }

    setIsResetting(true);
    try {
      await resetPassword(resetEmail);
      toast.success("Password reset email sent! Please check your inbox.");
      setIsResetDialogOpen(false);
      setResetEmail("");
    } catch (error) {
      console.error("Error resetting password:", error);
      toast.error("Failed to send reset email. Please try again.");
    } finally {
      setIsResetting(false);
    }
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      const result = await login(formData);
      
      if (result.success) {
        toast.success(result.message);
        // Wait a moment to show the success message before redirecting
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      } else {
        toast.error(result.error || "Failed to log in. Please try again.");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "Failed to log in. Please try again.");
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
                Welcome Back
              </CardTitle>
              <CardDescription className="text-gray-300">
                Enter your email and password to access your account.
              </CardDescription>
            </motion.div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-2"
              >
                <Label className="text-gray-300" htmlFor="email">
                  Email
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    name="email"
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
                transition={{ delay: 0.4 }}
                className="space-y-2"
              >
                <div className="flex items-center">
                  <Label className="text-gray-300" htmlFor="password">
                    Password
                  </Label>
                  <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
                    <DialogTrigger asChild>
                      <button
                        type="button"
                        className="ml-auto inline-block text-sm text-[#1DB954] hover:text-[#1ed760] underline"
                      >
                        Forgot your password?
                      </button>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-900 text-white border-gray-800">
                      <DialogHeader>
                        <DialogTitle>Reset Password</DialogTitle>
                        <DialogDescription className="text-gray-400">
                          Enter your email address and we'll send you a link to reset your password.
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleResetPassword} className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-gray-300" htmlFor="reset-email">
                            Email
                          </Label>
                          <div className="relative">
                            <Input
                              id="reset-email"
                              type="email"
                              value={resetEmail}
                              onChange={(e) => setResetEmail(e.target.value)}
                              placeholder="m@example.com"
                              required
                              className="bg-gray-800 text-white placeholder-gray-400 focus:border-[#1DB954] focus:ring-[#1DB954] pl-10"
                            />
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                        <Button
                          type="submit"
                          disabled={isResetting}
                          className="w-full bg-[#1DB954] hover:bg-[#1ed760] text-white font-semibold py-2 rounded-md transition-all"
                        >
                          {isResetting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            "Send Reset Link"
                          )}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
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
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-4"
              >
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#1DB954] hover:bg-[#1ed760] text-white font-semibold py-2 rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    "Login"
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
              transition={{ delay: 0.6 }}
              className="mt-6 text-center text-sm text-gray-300"
            >
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="font-semibold text-[#1DB954] hover:text-[#1ed760] underline transition-colors"
              >
                Sign up
              </Link>
            </motion.div>
          </CardContent>
        </Card>
      </ClientWrapper>
    </div>
  );
}