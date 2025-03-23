'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/store';
import { getPlaylistDetails } from '@/app/(auth)/auth/spotifyApi';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useSupabaseAuthStore } from '@/store/supabaseAuthStore';
import { createClient } from '@/utils/supabase/client';

export default function PlaylistDetails() {
  const { token, playlistInfo, userId } = useAuthStore();
  const { supabaseUserId, setSupabaseUserId } = useSupabaseAuthStore(); // Get Supabase user ID and setter from the store
  const [playlistDetails, setPlaylistDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchSupabaseUser = async () => {
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        console.log("Supabase Session:", sessionData, "Error:", sessionError);

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
      router.push('/playlist-generator');
      return;
    }

    if (!supabaseUserId) {
      console.warn("Supabase User ID is not set yet.");
      return;
    }

    const fetchPlaylistDetails = async () => {
      try {
        const details = await getPlaylistDetails(playlistInfo.id, token);
        setPlaylistDetails(details);

        // Save playlist details to the database
        await savePlaylistToDatabase(details);
      } catch (error) {
        console.error('Error fetching playlist details:', error);
        toast.error('Failed to fetch playlist details. Please try again.');
      }
    };

    fetchPlaylistDetails();
  }, [playlistInfo, token, router, supabaseUserId]);

  const savePlaylistToDatabase = async (playlistDetails: any) => {
    try {
      if (!supabaseUserId) {
        throw new Error('Supabase User ID is not available.');
      }

      // Prepare the payload to be sent to the database
      const payload = {
        supabaseUserId, // Supabase authenticated user ID
        userId, // Spotify user ID
        playlist: {
          spotify_playlist_id: playlistDetails.id,
          title: playlistDetails.name,
          tracks: playlistDetails.tracks.items.map((item: any) => ({
            title: item.track.name,
            artist: item.track.artists[0].name,
            duration: item.track.duration_ms,
            spotify_track_id: item.track.id,
          })),
        },
      };

      // Log the payload to the console
      console.log('Payload being sent to the database:', JSON.stringify(payload, null, 2));

      const response = await fetch('/api/save-playlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to save playlist to database');
      }

      const data = await response.json();
      toast.success('Playlist saved to database successfully!');
    } catch (error) {
      console.error('Error saving playlist to database:', error);
      toast.error('Failed to save playlist to database. Please try again.');
    }
  };

  if (isLoading || !playlistDetails) {
    return <div>Loading...</div>;
  }

  return (
    <main className="relative flex min-h-screen flex-col bg-gradient-to-b from-[#1DB954] via-[#121212] to-[#000000] text-white p-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">{playlistDetails.name}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {playlistDetails.tracks.items.map((item: any) => (
            <div key={item.track.id} className="bg-gray-800 p-4 rounded-lg">
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