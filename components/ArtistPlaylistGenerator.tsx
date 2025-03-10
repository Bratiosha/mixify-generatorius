"use client";

import { useState } from "react";
import { searchArtists, getArtistTopTracks, createPlaylist, addTracksToPlaylist } from "@/app/(auth)/auth/spotifyApi";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import ClientWrapper from "@/components/ClientWrapper";
import { Loader2, X } from "lucide-react";
import Image from 'next/image';
import { useAuthStore } from "@/store/store"; // Import the Zustand store
import { useRouter } from "next/navigation"; // Use the correct router import

interface Artist {
  id: string;
  name: string;
  images: { url: string }[];
  genres: string[];
}

interface Track {
  uri: string;
  name: string;
  album: {
    images: { url: string }[];
  };
  artists: {
    id: string; name: string 
  }[];
}

export default function ArtistPlaylistGenerator() {
  const { token, userId, userName, setToken, setUserId, setUserName } = useAuthStore(); // Use Zustand store
  const [query, setQuery] = useState("");
  const [artists, setArtists] = useState<Artist[]>([]);
  const [selectedArtists, setSelectedArtists] = useState<Artist[]>([]);
  const [topTracks, setTopTracks] = useState<Track[]>([]);
  const [playlistName, setPlaylistName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
  const router = useRouter(); // Use the correct router

  const handleSearch = async () => {
    if (query.trim() === "") {
      toast.error("Please enter an artist name.");
      return;
    }

    if (!token) {
      toast.error("You are not logged in. Please connect to Spotify.");
      return;
    }

    setIsLoading(true);
    try {
      const results = await searchArtists(query, token);
      setArtists(results);
    } catch (error) {
      console.error("Error searching artists:", error);
      toast.error("Failed to search artists. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleArtistSelection = async (artist: Artist) => {
    if (selectedArtists.some((a) => a.id === artist.id)) {
      setSelectedArtists((prev) => prev.filter((a) => a.id !== artist.id));
      setTopTracks((prev) => prev.filter((track) => track.artists[0].id !== artist.id));
    } else {
      setSelectedArtists((prev) => [...prev, artist]);
      try {
        if (token) {
          const tracks = await getArtistTopTracks(artist.id, token);
          if (tracks.length > 0) {
            setTopTracks((prev) => [...prev, ...tracks.slice(0, 10)]); // Add top 10 tracks
          }
        } else {
          toast.error("You are not logged in. Please connect to Spotify.");
        }
      } catch (error) {
        console.error("Error fetching top tracks:", error);
        toast.error(`Failed to fetch top tracks for ${artist.name}.`);
      }
    }
  };

  const handleCreatePlaylist = async () => {
    if (!playlistName || topTracks.length === 0) {
      toast.error("Please enter a playlist name and select at least one artist.");
      return;
    }

    if (!token || !userId) {
      toast.error("You are not logged in. Please connect to Spotify.");
      return;
    }

    setIsCreatingPlaylist(true);
    try {
      const playlist = await createPlaylist(userId, playlistName, token);
      const trackUris = topTracks.map((t) => t.uri);
      await addTracksToPlaylist(playlist.id, trackUris, token);

      toast.success(`🎉 Playlist "${playlistName}" created!`, {
        description: `Added ${topTracks.length} tracks.`,
      });

      setPlaylistName("");
      setSelectedArtists([]);
      setTopTracks([]);
    } catch (error) {
      console.error("Error creating playlist:", error);
      toast.error("❌ Error creating playlist. Please check your Spotify connection.");
    } finally {
      setIsCreatingPlaylist(false);
    }
  };

  const handleLogout = () => {
    setToken(null); // Use Zustand's setToken
    setUserId(""); // Use Zustand's setUserId
    setUserName(""); // Use Zustand's setUserName
    setTopTracks([]);
    setSelectedArtists([]);
    setPlaylistName("");
    router.push("/");
  };
  const goToPlaylistGenerator = () => {
    router.push('/PlayListGenerator');
  };

  return (
    <main className="relative flex min-h-screen flex-col bg-gradient-to-b from-[#1DB954] via-[#121212] to-[#000000] text-white p-10">
      <div className="absolute top-5 left-5 right-5 flex justify-between items-center p-4">
        <div className="flex flex-col items-start gap-2">
          <Image src="/images/Mixify-logo.png" alt="Mixify Logo" width={160} height={50} className="ml-4 mb-4" />
          {userName && (
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

      <ClientWrapper
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="text-center max-w-2xl mx-auto mt-32">
          <h1 className="text-6xl font-extrabold tracking-tight sm:text-7xl">
            Create a <span className="text-[#38ff7e]">Top Tracks</span> Playlist
          </h1>
          <p className="mt-6 text-lg text-gray-300">
            Select your favorite artists, and we'll create a playlist with their top 10 tracks!
          </p>
        </div>

        <div className="text-center mt-6">
        <button
          onClick={goToPlaylistGenerator}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-all duration-300 hover:scale-105"
        >
          Go to Playlist Generator
        </button>
      </div>

        <div className="mt-20 max-w-6xl mx-auto">
          {/* Search Bar */}
          <div className="flex items-center gap-2 mb-6">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search artists..."
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
            <h2 className="text-xl font-semibold mb-4">Artists</h2>
            {artists.length === 0 && <p className="text-gray-400">🔎 Enter an artist name</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {artists.map((artist) => (
                <div
                  key={artist.id}
                  className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-all duration-150 ${
                    selectedArtists.some((a) => a.id === artist.id)
                      ? "bg-green-700 transform rotate-1"
                      : "bg-gray-800 hover:bg-gray-700"
                  }`}
                  onClick={() => toggleArtistSelection(artist)}
                >
                  <img
                    src={artist.images[2]?.url}
                    alt={artist.name}
                    className="w-14 h-14 rounded-full"
                  />
                  <div className="flex-grow min-w-0">
                    <p className="font-semibold truncate">{artist.name}</p>
                    <p className="text-sm text-gray-300 truncate">{artist.genres.join(", ")}</p>
                  </div>
                  <div className="w-6 flex justify-end">
                    {selectedArtists.some((a) => a.id === artist.id) && (
                      <span className="text-green-300 text-xl">✓</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Tracks */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Playlist Name</h2>
            <input
              type="text"
              value={playlistName}
              onChange={(e) => setPlaylistName(e.target.value)}
              placeholder="Playlist name"
              className="w-full bg-gray-800 text-white px-4 py-2 mb-4 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <h2 className="text-xl font-semibold mb-2">Top Tracks</h2>
            {topTracks.length === 0 && (
              <p className="text-gray-400">🔍 Select artists to see their top tracks</p>
            )}
            <ScrollArea className="h-80 w-full rounded-md border border-gray-700 p-2">
              <div className="space-y-2">
                {topTracks.map((track) => (
                  <div
                    key={track.uri}
                    className="flex items-center justify-between p-3 bg-gray-800 rounded-md shadow-md hover:bg-gray-700 transition-all duration-300"
                  >
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
                    <button
                      onClick={() => setTopTracks((prev) => prev.filter((t) => t.uri !== track.uri))}
                      className="text-red-500 hover:text-red-600 text-xl pr-3"
                    >
                      <X />
                    </button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
          <p className="mt-6 text-lg text-gray-300">
          Please review your Spotify playlist below, where you can discover additional recommendations to enhance your selection.
          </p>

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