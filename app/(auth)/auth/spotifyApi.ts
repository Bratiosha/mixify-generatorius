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
