import axios from "axios";

const BASE_URL = "https://api.spotify.com/v1";

export async function searchTracks(query: string, token: string) {
  console.log("Searching tracks with query:", query); // Debugging
  console.log("Using token:", token); // Debugging

  try {
    const response = await axios.get(`${BASE_URL}/search`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { q: query, type: "track", limit: 10 },
    });
    console.log("Spotify API response:", response.data); // Debugging
    return response.data.tracks.items;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Spotify API Error:", error.response?.data); // Debugging
      throw new Error("Failed to search tracks. Please check your query and try again.");
    } else {
      console.error("Unexpected Error:", error); // Debugging
      throw new Error("An unexpected error occurred. Please try again.");
    }
  }
}

export async function createPlaylist(userId: string, name: string, token: string) {
  const response = await axios.post(
    `${BASE_URL}/users/${userId}/playlists`,
    { name, public: false },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
}

export async function addTracksToPlaylist(playlistId: string, trackUris: string[], token: string) {
  await axios.post(
    `${BASE_URL}/playlists/${playlistId}/tracks`,
    { uris: trackUris },
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

export async function getUserProfile(token: string) {
  const response = await axios.get(`${BASE_URL}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

/**
 * Search for artists using a query.
 */
// app/(auth)/auth/spotifyApi.ts
export const searchArtists = async (query: string, token: string) => {
  try {
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=artist`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Spotify API Error:", errorData);
      console.error("Response Status:", response.status); // Log the status code
      console.error("Response Headers:", response.headers); // Log the headers
      throw new Error(`Failed to search artists: ${errorData.error.message}`);
    }

    const data = await response.json();
    return data.artists.items;
  } catch (error) {
    console.error("Error in searchArtists:", error);
    throw new Error("Failed to search artists. Please check your query and try again.");
  }
};

/**
 * Fetch the top tracks of an artist.
 */
export async function getArtistTopTracks(artistId: string, token: string, market = "US") {
  console.log("Fetching top tracks for artist ID:", artistId); // Debugging
  console.log("Using token:", token); // Debugging

  try {
    const response = await axios.get(`${BASE_URL}/artists/${artistId}/top-tracks`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { market },
    });
    console.log("Spotify API response:", response.data); // Debugging
    return response.data.tracks;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Spotify API Error:", error.response?.data); // Debugging
      throw new Error("Failed to fetch top tracks. Please try again.");
    } else {
      console.error("Unexpected Error:", error); // Debugging
      throw new Error("An unexpected error occurred. Please try again.");
    }
  }
}


