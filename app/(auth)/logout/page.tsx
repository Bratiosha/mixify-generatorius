'use client';

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import { useAuthStore } from "@/store/store";
import { useSupabaseAuthStore } from "@/store/supabaseAuthStore";

const LogoutPage = () => {
  const router = useRouter();
  const [countdown, setCountdown] = useState(2); // 2-second countdown
  const [isLoggingOut, setIsLoggingOut] = useState(true);
  const { setToken, setUserId, setUserName } = useAuthStore();
  const { setSupabaseUserId } = useSupabaseAuthStore();
  const supabase = createClient();

  useEffect(() => {
    const performLogout = async () => {
      try {
        // Sign out from Supabase
        const { error: supabaseError } = await supabase.auth.signOut();
        if (supabaseError) throw supabaseError;

        // Clear Spotify state
        setToken(null);
        setUserId('');
        setUserName('');
        setSupabaseUserId(null);
        
        setIsLoggingOut(false);
      } catch (error) {
        console.error('Error during logout:', error);
        router.push('/error');
      }
    };

    performLogout();
  }, [router, setToken, setUserId, setUserName, setSupabaseUserId]);

  useEffect(() => {
    if (!isLoggingOut) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);

      const redirectTimer = setTimeout(() => {
        router.push("/");
      }, 2000);

      return () => {
        clearInterval(timer);
        clearTimeout(redirectTimer);
      };
    }
  }, [router, isLoggingOut]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#1DB954] to-[#121212] text-white p-6">
      {/* Animated Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center"
      >
        {/* Logout Message */}
        <h1 className="text-4xl font-bold mb-4">
          {isLoggingOut ? "Logging out..." : "You have been logged out"}
        </h1>
        {!isLoggingOut && (
          <p className="text-lg text-gray-300 mb-8">
            Thank you for using Mixify. You'll be redirected to the home page in{" "}
            <span className="font-bold text-[#1DB954]">{countdown}</span> second(s).
          </p>
        )}

        {/* Progress Bar */}
        <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden mx-auto">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 2, ease: "linear" }}
            className="h-full bg-[#1DB954]"
          />
        </div>

        {/* Optional: Add a small animation or icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-8"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 mx-auto text-[#1DB954]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LogoutPage;