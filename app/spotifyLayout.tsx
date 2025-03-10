// app/layout.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUserProfile } from "@/app/(auth)/auth/spotifyApi";
import { toast } from "sonner";
import Image from "next/image";
import { useAuthStore } from "@/store/store"; // Import the Zustand store

export default function Layout({ children }: { children: React.ReactNode }) {
  const { token, userId, userName, setToken, setUserId, setUserName } = useAuthStore(); // Use Zustand store
  const router = useRouter();

  // Retrieve token from URL
  useEffect(() => {
    const url = new URL(window.location.href);
    const accessToken = url.searchParams.get("access_token");

    if (accessToken) {
      setToken(accessToken); // Set token in Zustand store
      window.history.pushState({}, "", "/");
    }
  }, [setToken]);

  // Fetch user profile
  useEffect(() => {
    async function fetchUserProfile() {
      if (token) {
        try {
          const user = await getUserProfile(token);
          setUserId(user.id); // Set userId in Zustand store
          setUserName(user.display_name); // Set userName in Zustand store
        } catch (error) {
          console.error("Error fetching user profile:", error);
          toast.error("Failed to fetch user profile. Please reconnect to Spotify.");
        }
      }
    }
    fetchUserProfile();
  }, [token, setUserId, setUserName]);

  // Logout handler
  const handleLogout = () => {
    setToken(null); // Clear token in Zustand store
    setUserId(""); // Clear userId in Zustand store
    setUserName(""); // Clear userName in Zustand store
    router.push("/");
  };

  return (
    <main className="relative flex min-h-screen flex-col bg-gradient-to-b from-[#1DB954] via-[#121212] to-[#000000] text-white p-10">
      {/* Header */}
      <div className="absolute top-5 left-5 right-5 flex justify-between items-center p-4">
        <div className="flex flex-col items-start gap-2">
          <Image src="/images/Mixify-logo.png" alt="Mixify Logo" width={160} height={50} className="ml-4 mb-4" />
          {userName && (
            <p className="text-gray-300 bg-gray-900 p-3 rounded-xl">
              Welcome, <span className="font-bold text-[#1DB954]">{userName}</span>
            </p>
          )}
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-all duration-300 hover:scale-105"
        >
          Log out
        </button>
      </div>

      {/* Navigation Buttons */}
      <div className="absolute top-20 left-1/2 transform -translate-x-1/2 flex gap-4">
        <button
          onClick={() => router.push("/playlist-generator")}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-all duration-300 hover:scale-105"
        >
          Track Playlist
        </button>
        <button
          onClick={() => router.push("/artist-playlist-generator")}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-all duration-300 hover:scale-105"
        >
          Artist Playlist
        </button>
      </div>

      {/* Render children */}
      {children}
    </main>
  );
}