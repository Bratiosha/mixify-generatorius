'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '@/store/store';
import { getPlaylistDetails } from '@/app/(auth)/auth/spotifyApi';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useSupabaseAuthStore } from '@/store/supabaseAuthStore';
import { createClient } from '@/utils/supabase/client';
import { Loader2 } from 'lucide-react';

export default function PlaylistDetails() {
  const { token, playlistInfo, userId } = useAuthStore();
  const { supabaseUserId, setSupabaseUserId } = useSupabaseAuthStore();
  const [playlistDetails, setPlaylistDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();
  
  const hasFetched = useRef(''); // ✅ Prevents multiple saves

  useEffect(() => {
    const fetchSupabaseUser = async () => {
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !sessionData?.session) {
          console.warn("No active session found.");
          return;
        }

        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;

        if (userData?.user) {
          setSupabaseUserId(userData.user.id);
          console.log("✅ Supabase User ID set:", userData.user.id);
        } else {
          console.warn("❌ No user found in Supabase auth.");
        }
      } catch (error) {
        console.error("⚠️ Error fetching Supabase user:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSupabaseUser();
  }, [setSupabaseUserId]);

  useEffect(() => {
    if (!playlistInfo?.id || !token) {
      toast.error('No playlist information found. Please create a playlist first.');
      router.push('/PlayListGenerator');
      return;
    }
  
    // Prevent duplicate fetches per playlist
    if (!supabaseUserId || hasFetched.current === playlistInfo.id) {
      return;
    }
  
    const fetchPlaylistDetails = async () => {
      try {
        const details = await getPlaylistDetails(playlistInfo.id, token);
        setPlaylistDetails(details);
        hasFetched.current = playlistInfo.id; // Track last fetched playlist
      } catch (error) {
        console.error('Error fetching playlist details:', error);
        toast.error('Failed to fetch playlist details. Please try again.');
      }
    };
  
    fetchPlaylistDetails();
  }, [playlistInfo?.id, token, supabaseUserId]);
  

  const handleCreateAnotherPlaylist = () => {
    hasFetched.current = ''; // Reset for new playlist
    router.push('/PlayListGenerator');
  };
  

  if (isLoading || !playlistDetails) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#1DB954] via-[#121212] to-[#000000]">
        <Loader2 className="animate-spin text-white h-12 w-12" />
      </div>
    );
  }

  return (
    <main className="relative flex min-h-screen flex-col bg-gradient-to-b from-[#1DB954] via-[#121212] to-[#000000] text-white p-10">
      {/* Header Section */}
      <div className="absolute top-5 left-5 right-5 flex justify-between items-center p-4">
        <div className="flex flex-col items-start gap-2">
          <h1 className="text-2xl font-bold">Playlist Details</h1>
          <p className="text-gray-300">Here are the details of your playlist.</p>
        </div>
        <button
          onClick={handleCreateAnotherPlaylist}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-all duration-300 hover:scale-105"
        >
          Create Another Playlist
        </button>
      </div>

      {/* Playlist Details Section */}
      <div className="max-w-6xl mx-auto mt-20">
        <h1 className="text-4xl font-bold mb-6">{playlistDetails.name}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {playlistDetails.tracks.items.map((item: any) => (
            <div key={item.track.id} className="bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition-all duration-300">
              <img
                src={item.track.album.images[0]?.url}
                alt={item.track.name}
                className="w-full h-48 object-cover rounded-md mb-4"
              />
              <h2 className="text-xl font-semibold truncate">{item.track.name}</h2>
              <p className="text-gray-300 truncate">
                {item.track.artists.map((artist: any) => artist.name).join(', ')}
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
