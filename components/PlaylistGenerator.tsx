"use client";

import { useState, useEffect } from "react";
import { searchTracks, createPlaylist, addTracksToPlaylist, getUserProfile } from "@/app/(auth)/auth/spotifyApi";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import ClientWrapper from "@/components/ClientWrapper";
import { useRouter } from "next/navigation";
import { Loader2, X } from "lucide-react";
import Image from "next/image";
import { useAuthStore } from "@/store/store"; // Import the Zustand store

export default function PlaylistGenerator() {
  const { token, userId, setToken, setUserId } = useAuthStore(); // Use Zustand store
  const [query, setQuery] = useState("");
  const [tracks, setTracks] = useState<any[]>([]);
  const [selectedTracks, setSelectedTracks] = useState<any[]>([]);
  const [playlistName, setPlaylistName] = useState("");
  const [userName, setUserName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const url = new URL(window.location.href);
    const accessToken = url.searchParams.get("access_token");

    if (accessToken) {
      setToken(accessToken); // Set token in Zustand store
      window.history.pushState({}, "", "/");
    }
  }, [setToken]);

  useEffect(() => {
    async function fetchUserProfile() {
      if (token) {
        try {
          const user = await getUserProfile(token);
          setUserId(user.id); // Set userId in Zustand store
          setUserName(user.display_name);
        } catch (error) {
          console.error("Error fetching user profile:", error);
          toast.error("Failed to fetch user profile. Please reconnect to Spotify.");
        }
      }
    }
    fetchUserProfile();
  }, [token, setUserId]);

  const handleSearch = async () => {
    if (query.trim() === "") {
      toast.error("Please enter a search query.");
      return;
    }

    if (!token) {
      toast.error("You are not logged in. Please connect to Spotify.");
      return;
    }

    setIsLoading(true);
    try {
      const results = await searchTracks(query, token);
      setTracks(results);
    } catch (error) {
      console.error("Error searching tracks:", error);
      toast.error("Failed to search tracks. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTrackSelection = (track: any) => {
    setSelectedTracks((prev) => {
      const isSelected = prev.some((t) => t.uri === track.uri);
      if (isSelected) {
        return prev.filter((t) => t.uri !== track.uri);
      } else {
        return [...prev, track];
      }
    });
  };

  const handleCreatePlaylist = async () => {
    if (!playlistName || selectedTracks.length === 0) {
      toast.error("Please enter a playlist name and select at least one track.");
      return;
    }

    if (!token || !userId) {
      toast.error("You are not logged in. Please connect to Spotify.");
      return;
    }

    setIsCreatingPlaylist(true);
    try {
      const playlist = await createPlaylist(userId, playlistName, token);
      const trackUris = selectedTracks.map((t) => t.uri);
      await addTracksToPlaylist(playlist.id, trackUris, token);

      toast.success(`🎉 Playlist "${playlistName}" created!`, {
        description: `Added ${selectedTracks.length} tracks.`,
      });

      setPlaylistName("");
      setSelectedTracks([]);
    } catch (error) {
      console.error("Error creating playlist:", error);
      toast.error("❌ Error creating playlist. Please check your Spotify connection.");
    } finally {
      setIsCreatingPlaylist(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setUserId("");
    setUserName(""); // Clear the Spotify account name on logout
    setTracks([]);
    setSelectedTracks([]);
    setPlaylistName("");
    router.push("/");
  };

  const goToArtistPlaylistGenerator = () => {
    router.push("/artist-playlist-generator");
  };

  return (
    <main className="relative flex min-h-screen flex-col bg-gradient-to-b from-[#1DB954] via-[#121212] to-[#000000] text-white p-10">
      {/* Header Section */}
      <div className="absolute top-5 left-5 right-5 flex justify-between items-center p-4">
        <div className="flex flex-col items-start gap-2">
          <Image src="/images/Mixify-logo.png" alt="Mixify Logo" width={160} height={50} className="ml-4 mb-4" />
          {userName && ( // Display the Spotify account name if available
            <p className="text-gray-300 bg-gray-900 p-3 rounded-xl">Welcome, <span className="font-bold text-[#1DB954]">{userName}</span></p>
          )}
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-all duration-300 hover:scale-105"
        >
          Log out
        </button>
      </div>

      {/* Hero Section */}
      <ClientWrapper
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="text-center max-w-2xl mx-auto mt-32">
          <h1 className="text-6xl font-extrabold tracking-tight sm:text-7xl">
            Create Your <span className="text-[#38ff7e]">Playlist</span>
          </h1>
          <p className="mt-6 text-lg text-gray-300">
            Search for tracks, add them to your playlist, and create a personalized Spotify playlist in just a few clicks.
          </p>
        </div>
      </ClientWrapper>

      {/* Navigation Button to Artist Playlist Generator */}
      <div className="text-center mt-6">
        <button
          onClick={goToArtistPlaylistGenerator}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-all duration-300 hover:scale-105"
        >
          Go to Artist Playlist Generator
        </button>
      </div>

      {/* Search and Playlist Creation Section */}
      <ClientWrapper
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <div className="mt-20 max-w-6xl mx-auto">
          {/* Search Bar */}
          <div className="flex items-center gap-2 mb-6">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tracks..."
              className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-md transition-all duration-300 hover:scale-105"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : "🔍"}
            </button>
          </div>

          {/* Search Results */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Results</h2>
            {tracks.length === 0 && <p className="text-gray-400">🔎 Enter a search query</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tracks.map((track) => (
                <div
                  key={track.id}
                  className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-all duration-150 ${selectedTracks.some((t) => t.uri === track.uri)
                      ? "bg-green-700 transform rotate-1" // Green background and slight tilt
                      : "bg-gray-800 hover:bg-gray-700" // Default background
                    }`}
                  onClick={() => toggleTrackSelection(track)}
                >
                  <img
                    src={track.album.images[2]?.url}
                    alt={track.name}
                    className="w-14 h-14 rounded-md"
                  />
                  <div className="flex-grow min-w-0">
                    <p className="font-semibold truncate">{track.name}</p>
                    <p className="text-sm text-gray-300 truncate">
                      {track.artists.map((a: { name: string }) => a.name).join(", ")}
                    </p>
                  </div>
                  <div className="w-6 flex justify-end">
                    {selectedTracks.some((t) => t.uri === track.uri) && (
                      <span className="text-green-300 text-xl">✓</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Tracks */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Playlist name</h2>
            <input
              type="text"
              value={playlistName}
              onChange={(e) => setPlaylistName(e.target.value)}
              placeholder="Playlist name"
              className="w-full bg-gray-800 text-white px-4 py-2 mb-4 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <h2 className="text-xl font-semibold mb-2">Selected Tracks</h2>
            {selectedTracks.length === 0 && (
              <p className="text-gray-400">🔍 Select tracks to add to the playlist</p>
            )}
            <ScrollArea className="h-80 w-full rounded-md border border-gray-700 p-2">
              <div className="space-y-2">
                {selectedTracks.map((track) => (
                  <div
                    key={track.uri}
                    className="flex items-center justify-between p-3 bg-gray-800 rounded-md shadow-md hover:bg-gray-700 transition-all duration-300"
                  >
                    {/* Track Info */}
                    <div className="flex items-center">
                      <img
                        src={track.album.images[2]?.url}
                        alt={track.name}
                        className="w-14 h-14 rounded-md"
                      />
                      <span className="ml-3 text-gray-300 font-bold">
                        {track.name}
                        <p className="font-light text-sm">
                          {track.artists.map((a: { name: string }) => a.name).join(", ")}
                        </p>
                      </span>
                    </div>

                    {/* Remove Button (X) */}
                    <button
                      onClick={() => toggleTrackSelection(track)} // Remove the track
                      className="text-red-500 hover:text-red-600 text-xl pr-3"
                    >
                      <X />
                    </button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Playlist Creation */}
          <div className="mb-6">
            <button
              onClick={handleCreatePlaylist}
              disabled={isCreatingPlaylist}
              className="w-full mt-3 bg-green-500 hover:bg-green-600 px-4 py-2 rounded-md transition-all duration-300 hover:scale-105"
            >
              {isCreatingPlaylist ? (
                <Loader2 className="animate-spin mx-auto" />
              ) : (
                "Create Playlist"
              )}
            </button>
          </div>
        </div>
      </ClientWrapper>
    </main>
  );
}