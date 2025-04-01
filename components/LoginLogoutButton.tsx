"use client";

import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { signout } from "@/lib/auth-actions";
import { loginWithSpotify } from "@/app/(auth)/auth/auth";

type User = {
  id: string;
  email?: string;
} | null;

const LoginButton = () => {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error) {
          console.error("Error fetching user:", error.message);
          return;
        }

        setUser(user);
      } catch (error) {
        console.error("Unexpected error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [supabase.auth]);

  const handleLogout = async () => {
    try {
      await signout();
      setUser(null);
      router.refresh();
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  

  if (loading) {
    return <Button disabled>Loading...</Button>;
  }

  if (user) {
    return (
      <div className="flex items-center space-x-4">
        <Button
          onClick={loginWithSpotify}
          className="bg-[#1DB954] hover:bg-[#1ed760] text-white"
        >
          Connect with Spotify
        </Button>
        <Button onClick={handleLogout} className="bg-red-500 hover:bg-red-600">
          Log out
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      onClick={() => router.push("/login")}
      className="border-[#1DB954] text-[#1DB954] hover:bg-[#1DB954] hover:text-white"
    >
      Login
    </Button>
  );
};

export default LoginButton;