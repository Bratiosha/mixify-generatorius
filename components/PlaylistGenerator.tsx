// app/playlist-generator/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { searchTracks, createPlaylist, addTracksToPlaylist, getUserProfile, searchTracksByGenre } from '@/app/(auth)/auth/spotifyApi';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import ClientWrapper from '@/components/ClientWrapper';
import { useRouter } from 'next/navigation';
import { Loader2, X, History, Search, Filter, ArrowUpDown } from 'lucide-react';
import Image from 'next/image';
import { useAuthStore } from '@/store/store';
import { useSupabaseAuthStore } from '@/store/supabaseAuthStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { createClient } from '@/utils/supabase/client';

export default function PlaylistGenerator() {
  const { token, userId, userName, setToken, setUserId, setUserName, setPlaylistInfo } = useAuthStore();
  const { supabaseUserId, setSupabaseUserId } = useSupabaseAuthStore();
  const [query, setQuery] = useState('');
  const [tracks, setTracks] = useState<any[]>([]);
  const [selectedTracks, setSelectedTracks] = useState<any[]>([]);
  const [playlistName, setPlaylistName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
  const [playlistHistory, setPlaylistHistory] = useState<any[]>([]);
  const [filteredPlaylists, setFilteredPlaylists] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState<string>("");
  const [searchMode, setSearchMode] = useState<"track" | "genre">("track");
  const [availableGenres] = useState<string[]>([
    "pop", "rock", "hip hop", "jazz", "classical", "electronic", "r&b", "country",
    "metal", "folk", "blues", "reggae", "latin", "indie", "alternative", "rap",
    "dance", "house", "techno", "punk", "soul", "funk", "disco", "reggaeton", 
    "drum & bass", "dnb", "edm", "trance", "hardstyle", "hardcore",
    "industrial", "ambient", "dubstep", "garage", "grime", "trap", "future bass",
    "progressive house", "deep house", "tech house", "minimal", "psytrance",
    "breakbeat", "jungle", "uk garage", "bass music", "idm", "electro", "synthwave"
  ]);
  const [isSearchingByGenre, setIsSearchingByGenre] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchSupabaseUser = async () => {
      try {
        console.log("🔍 Checking Supabase session...");
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("❌ Error fetching Supabase session:", sessionError);
          setIsCheckingAuth(false);
          return;
        }

        if (!sessionData?.session) {
          console.warn("⚠️ No active session found");
          setIsCheckingAuth(false);
          return;
        }

        console.log("✅ Active session found, fetching user data...");
        const { data: userData, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error("❌ Error fetching user data:", userError);
          setIsCheckingAuth(false);
          return;
        }

        if (userData?.user) {
          setSupabaseUserId(userData.user.id);
          console.log("✅ Supabase User ID set:", userData.user.id);
        } else {
          console.warn("⚠️ No user found in Supabase auth");
        }
      } catch (error) {
        console.error("❌ Unexpected error in fetchSupabaseUser:", error);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    fetchSupabaseUser();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("🔄 Auth state changed:", event);
      if (event === 'SIGNED_IN' && session?.user) {
        setSupabaseUserId(session.user.id);
        console.log("✅ User signed in, ID set:", session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setSupabaseUserId(null);
        console.log("👋 User signed out");
        router.push('/login');
      }
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [setSupabaseUserId, router]);

  useEffect(() => {
    async function fetchUserProfile() {
      if (token) {
        try {
          const user = await getUserProfile(token);
          setUserId(user.id);
          setUserName(user.display_name);
        } catch (error) {
          console.error('Error fetching user profile:', error);
          toast.error('Failed to fetch user profile. Please reconnect to Spotify.');
        }
      }
    }
    fetchUserProfile();
  }, [token, setUserId, setUserName]);

  const handleSearch = async () => {
    if (searchMode === "track" && query.trim() === '') {
      toast.error('Please enter a search query.');
      return;
    }

    if (searchMode === "genre" && !selectedGenre) {
      toast.error('Please select a genre.');
      return;
    }

    if (!token) {
      toast.error('You are not logged in. Please connect to Spotify.');
      return;
    }

    setIsLoading(true);
    try {
      if (searchMode === "track") {
        const results = await searchTracks(query, token);
        setTracks(results);
      } else {
        const results = await searchTracksByGenre(selectedGenre, token);
        setTracks(results);
        setIsSearchingByGenre(true);
      }
    } catch (error) {
      console.error('Error searching tracks:', error);
      toast.error('Failed to search tracks. Please try again.');
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
      toast.error('Please enter a playlist name and select at least one track.');
      return;
    }
  
    if (!token || !userId) {
      toast.error('You are not logged in. Please connect to Spotify.');
      return;
    }
  
    setIsCreatingPlaylist(true);
    try {
      // Create playlist in Spotify
      const playlist = await createPlaylist(userId, playlistName, token);
      const trackUris = selectedTracks.map((t) => t.uri);
      await addTracksToPlaylist(playlist.id, trackUris, token);

      // Prepare playlist data for database
      const playlistData = {
        supabaseUserId,
        userId: userId, // Spotify user ID
        playlist: {
          title: playlistName,
          spotify_playlist_id: playlist.id,
          tracks: selectedTracks.map(track => ({
            title: track.name,
            artist: track.artists[0].name,
            duration: 0, // You might want to add duration if available in your track data
          })),
        },
      };

      // Save playlist to database
      const response = await fetch('/api/save-playlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(playlistData),
      });

      if (!response.ok) {
        throw new Error('Failed to save playlist to database');
      }
  
      toast.success(`🎉 Playlist "${playlistName}" created!`, {
        description: `Added ${selectedTracks.length} tracks.`,
      });
  
      // Store playlist information in state or context
      setPlaylistInfo({
        id: playlist.id,
        name: playlistName,
        tracks: selectedTracks,
      });
  
      // Navigate to the new page
      router.push('/playlist-details');
  
      // Clear form
      setPlaylistName('');
      setSelectedTracks([]);
    } catch (error) {
      console.error('Error creating playlist:', error);
      toast.error('❌ Error creating playlist. Please check your Spotify connection.');
    } finally {
      setIsCreatingPlaylist(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Sign out from Supabase
      const { error: supabaseError } = await supabase.auth.signOut();
      if (supabaseError) throw supabaseError;

      // Clear Spotify state
      setToken(null);
      setUserId('');
      setUserName('');
      setTracks([]);
      setSelectedTracks([]);
      setPlaylistName('');
      setSupabaseUserId(null);
      
      router.push('/');
    } catch (error) {
      console.error('Error during logout:', error);
      toast.error('Error logging out. Please try again.');
    }
  };

  const goToArtistPlaylistGenerator = () => {
    router.push('/artist-playlist-generator');
  };

  const fetchPlaylistHistory = async () => {
    console.log("🔍 Fetching playlist history...");
    console.log("Current supabaseUserId:", supabaseUserId);
    
    if (!supabaseUserId) {
      console.warn("❌ No Supabase user ID found");
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (session?.user) {
          setSupabaseUserId(session.user.id);
          console.log("✅ Refreshed Supabase User ID:", session.user.id);
          await fetchPlaylistHistory();
          return;
        }
      } catch (error) {
        console.error("⚠️ Error refreshing Supabase session:", error);
      }
      
      toast.error('Please log in to view your playlist history');
      return;
    }
    
    setIsLoadingHistory(true);
    try {
      console.log("🌐 Making API request to fetch playlists...");
      const response = await fetch(`/api/get-user-playlists?supabaseUserId=${supabaseUserId}`);
      console.log("📥 Response status:", response.status);
      
      const data = await response.json();
      console.log("📦 Response data:", data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch playlist history');
      }
      
      setPlaylistHistory(data);
      setFilteredPlaylists(data);
      console.log("✅ Successfully set playlist history");
    } catch (error) {
      console.error("❌ Error fetching playlist history:", error);
      toast.error(error instanceof Error ? error.message : 'Failed to fetch playlist history');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleFilterAndSort = () => {
    let filtered = [...playlistHistory];

    if (searchQuery) {
      filtered = filtered.filter(playlist => 
        playlist.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        playlist.playlist_songs?.some((song: any) => 
          song.songs.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          song.songs.artists.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    filtered.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

    setFilteredPlaylists(filtered);
  };

  useEffect(() => {
    handleFilterAndSort();
  }, [searchQuery, sortOrder, playlistHistory]);

  // Show loading state while checking auth
  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#1DB954] via-[#121212] to-[#000000]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-white" />
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login prompt if no session
  if (!supabaseUserId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#1DB954] via-[#121212] to-[#000000]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Please log in to continue</h1>
          <button
            onClick={() => router.push('/login')}
            className="bg-[#1DB954] hover:bg-[#1ed760] text-white px-6 py-2 rounded-md transition-all duration-300"
          >
            Log in
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="relative flex min-h-screen flex-col bg-gradient-to-b from-[#1DB954] via-[#121212] to-[#000000] text-white p-10">
      {/* Header Section */}
      <div className="absolute top-5 left-5 right-5 flex justify-between items-center p-4">
        <div className="flex flex-col items-start gap-2">
          <Image 
            src="/images/Mixify-logo.png" 
            alt="Mixify Logo" 
            width={160} 
            height={50} 
            className="ml-4 mb-4 w-auto h-auto" 
            priority
          />
          {userName && (
            <p className="text-gray-300 bg-gray-900 p-3 rounded-xl">Welcome, <span className="font-bold text-[#1DB954]">{userName}</span></p>
          )}
        </div>
        <div className="flex gap-4">
          <Dialog>
            <DialogTrigger asChild>
              <button
                onClick={fetchPlaylistHistory}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-all duration-300 hover:scale-105 flex items-center gap-2"
              >
                <History className="w-4 h-4" />
                History
              </button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 text-white max-w-2xl">
              <DialogHeader>
                <DialogTitle>Your Playlist History</DialogTitle>
                <DialogDescription className="text-gray-400">
                  View all your previously created playlists and their tracks
                </DialogDescription>
              </DialogHeader>
              
              <div className="flex flex-col gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search playlists or songs..."
                      className="w-full bg-gray-800 text-white pl-10 pr-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                  </div>
                  <button
                    onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-all duration-300 hover:scale-105 flex items-center gap-2"
                  >
                    <ArrowUpDown className="w-4 h-4" />
                    {sortOrder === 'asc' ? 'Oldest First' : 'Newest First'}
                  </button>
                </div>
                <div className="text-sm text-gray-400">
                  Found {filteredPlaylists.length} playlist{filteredPlaylists.length !== 1 ? 's' : ''}
                </div>
              </div>

              <ScrollArea className="h-[60vh]">
                {isLoadingHistory ? (
                  <div className="flex justify-center items-center h-32">
                    <Loader2 className="animate-spin" />
                  </div>
                ) : filteredPlaylists.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">
                    {searchQuery ? 'No playlists found matching your search' : 'No playlists found'}
                  </p>
                ) : (
                  <div className="space-y-4">
                    {filteredPlaylists.map((playlist) => (
                      <div key={playlist.id} className="bg-gray-800 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold mb-2">{playlist.title}</h3>
                        <p className="text-sm text-gray-400 mb-2">
                          Created on: {new Date(playlist.created_at).toLocaleDateString()}
                        </p>
                        <div className="space-y-2">
                          {playlist.playlist_songs?.map((song: any) => (
                            <div key={song.song_id} className="flex items-center gap-2 text-sm">
                              <span className="text-gray-300">•</span>
                              <span>{song.songs.title}</span>
                              <span className="text-gray-400">by</span>
                              <span>{song.songs.artists.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </DialogContent>
          </Dialog>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-all duration-300 hover:scale-105"
          >
            Log out
          </button>
        </div>
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
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="flex gap-2 bg-gray-800 p-1 rounded-md">
                <button
                  onClick={() => {
                    setSearchMode("track");
                    setQuery("");
                    setSelectedGenre("");
                    setTracks([]);
                    setIsSearchingByGenre(false);
                  }}
                  className={`px-4 py-2 rounded-md transition-all duration-300 ${
                    searchMode === "track"
                      ? "bg-green-500 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Search by Track
                </button>
                <button
                  onClick={() => {
                    setSearchMode("genre");
                    setQuery("");
                    setSelectedGenre("");
                    setTracks([]);
                    setIsSearchingByGenre(false);
                  }}
                  className={`px-4 py-2 rounded-md transition-all duration-300 ${
                    searchMode === "genre"
                      ? "bg-green-500 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Search by Genre
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {searchMode === "track" ? (
                <>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search tracks..."
                    className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                  <button
                    onClick={handleSearch}
                    disabled={isLoading || !query.trim()}
                    className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-md transition-all duration-300 hover:scale-105"
                  >
                    {isLoading ? <Loader2 className="animate-spin" /> : "🔍"}
                  </button>
                </>
              ) : (
                <>
                  <select
                    value={selectedGenre}
                    onChange={(e) => setSelectedGenre(e.target.value)}
                    className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
                  >
                    <option value="">Select a genre</option>
                    {availableGenres.map((genre) => (
                      <option key={genre} value={genre}>
                        {genre.charAt(0).toUpperCase() + genre.slice(1)}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleSearch}
                    disabled={isLoading || !selectedGenre}
                    className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-md transition-all duration-300 hover:scale-105"
                  >
                    {isLoading ? <Loader2 className="animate-spin" /> : "🔍"}
                  </button>
                </>
              )}
              {(query || selectedGenre) && (
                <button
                  onClick={() => {
                    setQuery("");
                    setSelectedGenre("");
                    setTracks([]);
                    setIsSearchingByGenre(false);
                  }}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-all duration-300 hover:scale-105"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Search Results */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {isSearchingByGenre
                ? `Tracks in ${selectedGenre.charAt(0).toUpperCase() + selectedGenre.slice(1)}`
                : query
                ? `Results for "${query}"`
                : "Tracks"}
            </h2>
            {tracks.length === 0 && (
              <p className="text-gray-400">
                {searchMode === "genre"
                  ? "Select a genre to see tracks"
                  : "Enter a track name to search"}
              </p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tracks.map((track) => (
                <div
                  key={track.id}
                  className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-all duration-150 ${selectedTracks.some((t) => t.uri === track.uri)
                      ? 'bg-green-700 transform rotate-1'
                      : 'bg-gray-800 hover:bg-gray-700'
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
                      {track.artists.map((a: { name: string }) => a.name).join(', ')}
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
                          {track.artists.map((a: { name: string }) => a.name).join(', ')}
                        </p>
                      </span>
                    </div>

                    {/* Remove Button (X) */}
                    <button
                      onClick={() => toggleTrackSelection(track)}
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
                'Create Playlist'
              )}
            </button>
          </div>
        </div>
      </ClientWrapper>
    </main>
  );
}