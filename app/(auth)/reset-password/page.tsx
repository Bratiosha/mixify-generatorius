'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import ClientWrapper from '@/components/ClientWrapper';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    const verifySession = async () => {
      try {
        const code = searchParams.get('code');
        const email = searchParams.get('email');
        
        if (!code) {
          toast.error('Invalid or expired reset link. Please request a new one.');
          router.push('/login');
          return;
        }

        // First, try to get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          // If no session, try to recover it using the code
          const { data, error } = await supabase.auth.verifyOtp({
            token: code,
            type: 'recovery',
            email: email ? decodeURIComponent(email) : ""
          });

          if (error || !data.session) {
            console.error('Verification error:', error);
            toast.error('Invalid or expired reset link. Please request a new one.');
            router.push('/login');
            return;
          }

          // Set the session
          await supabase.auth.setSession({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token
          });
        }

        setIsVerified(true);
      } catch (error) {
        console.error('Error verifying session:', error);
        toast.error('Error verifying your session. Please try again.');
        router.push('/login');
      } finally {
        setIsVerifying(false);
      }
    };

    verifySession();
  }, [router, searchParams, supabase.auth]);

  const validatePassword = () => {
    const hasMinLength = newPassword.length >= 8;
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const passwordsMatch = newPassword === confirmPassword && newPassword !== '';

    return {
      hasMinLength,
      hasUpperCase,
      hasLowerCase,
      hasNumber,
      passwordsMatch,
      isValid: hasMinLength && hasUpperCase && hasLowerCase && hasNumber && passwordsMatch
    };
  };

  useEffect(() => {
    const validation = validatePassword();
    setPasswordStrength(
      (validation.hasMinLength ? 1 : 0) +
      (validation.hasUpperCase ? 1 : 0) +
      (validation.hasLowerCase ? 1 : 0) +
      (validation.hasNumber ? 1 : 0) +
      (validation.passwordsMatch ? 1 : 0)
    );
  }, [newPassword, confirmPassword]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isVerified) {
      toast.error('Please verify your email first');
      return;
    }

    const validation = validatePassword();
    if (!validation.isValid) {
      if (!validation.hasMinLength) {
        toast.error('Password must be at least 8 characters long');
      } else if (!validation.hasUpperCase) {
        toast.error('Password must contain at least one uppercase letter');
      } else if (!validation.hasLowerCase) {
        toast.error('Password must contain at least one lowercase letter');
      } else if (!validation.hasNumber) {
        toast.error('Password must contain at least one number');
      } else if (!validation.passwordsMatch) {
        toast.error('Passwords do not match');
      }
      return;
    }

    setIsResetting(true);
    try {
      // Get the current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error('No active session found');
      }

      // Update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        console.error('Password update error:', updateError);
        throw updateError;
      }

      toast.success('Password updated successfully!');
      router.push('/login');
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error('Failed to reset password. Please try again.');
    } finally {
      setIsResetting(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#1DB954] to-[#121212] p-6">
        <ClientWrapper
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Card className="mx-auto w-full max-w-md border-none bg-gray-900/90 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center space-y-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Loader2 className="h-8 w-8 text-[#1DB954]" />
                </motion.div>
                <p className="text-gray-300">Verifying your email...</p>
                <p className="text-sm text-gray-400">This may take a moment</p>
              </div>
            </CardContent>
          </Card>
        </ClientWrapper>
      </div>
    );
  }

  if (!isVerified) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#1DB954] to-[#121212] p-6">
      <ClientWrapper
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Card className="mx-auto w-full max-w-md border-none bg-gray-900/90 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <div className="flex items-center space-x-2">
              <Lock className="h-6 w-6 text-[#1DB954]" />
              <CardTitle className="text-3xl font-bold text-white">
                Reset Password
              </CardTitle>
            </div>
            <CardDescription className="text-gray-300">
              Create a strong password to protect your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-gray-300" htmlFor="new-password">
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="bg-gray-800 text-white placeholder-gray-400 focus:border-[#1DB954] focus:ring-[#1DB954] pl-10"
                    placeholder="Enter your new password"
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                <div className="mt-2 space-y-1">
                  <div className="flex items-center space-x-2 text-sm">
                    <div className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-[#1DB954]"
                        initial={{ width: 0 }}
                        animate={{ width: `${(passwordStrength / 5) * 100}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <span className="text-gray-400">{passwordStrength}/5</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                    <div className="flex items-center space-x-1">
                      {newPassword.length >= 8 ? (
                        <CheckCircle2 className="h-3 w-3 text-[#1DB954]" />
                      ) : (
                        <AlertCircle className="h-3 w-3 text-gray-500" />
                      )}
                      <span>8+ characters</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {/[A-Z]/.test(newPassword) ? (
                        <CheckCircle2 className="h-3 w-3 text-[#1DB954]" />
                      ) : (
                        <AlertCircle className="h-3 w-3 text-gray-500" />
                      )}
                      <span>Uppercase</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {/[a-z]/.test(newPassword) ? (
                        <CheckCircle2 className="h-3 w-3 text-[#1DB954]" />
                      ) : (
                        <AlertCircle className="h-3 w-3 text-gray-500" />
                      )}
                      <span>Lowercase</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {/[0-9]/.test(newPassword) ? (
                        <CheckCircle2 className="h-3 w-3 text-[#1DB954]" />
                      ) : (
                        <AlertCircle className="h-3 w-3 text-gray-500" />
                      )}
                      <span>Number</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300" htmlFor="confirm-password">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="bg-gray-800 text-white placeholder-gray-400 focus:border-[#1DB954] focus:ring-[#1DB954] pl-10"
                    placeholder="Confirm your new password"
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-sm text-red-400">Passwords do not match</p>
                )}
              </div>
              <Button
                type="submit"
                disabled={isResetting || !validatePassword().isValid}
                className="w-full bg-[#1DB954] hover:bg-[#1ed760] text-white font-semibold py-2 rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isResetting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  'Reset Password'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </ClientWrapper>
    </div>
  );
} 