const scopes = [
  "playlist-modify-public",
  "playlist-modify-private",
  "user-library-read",
  "user-top-read",
];


// In your login button component
export function loginWithSpotify() {
  const authUrl = new URL("https://accounts.spotify.com/authorize");
  authUrl.searchParams.append("client_id", process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!);
  authUrl.searchParams.append("response_type", "code");
  authUrl.searchParams.append("redirect_uri", process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI!);
  authUrl.searchParams.append("scope", "playlist-modify-private playlist-modify-public");
  authUrl.searchParams.append("show_dialog", "true"); // Force re-authentication
  window.location.href = authUrl.toString();
}
export function getAccessToken() {
  const url = new URL(window.location.href);
  return url.searchParams.get("access_token");
}

export async function refreshAccessToken(refreshToken: string) {
  const client_id = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!;
  const client_secret = process.env.SPOTIFY_CLIENT_SECRET!;

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id,
    client_secret,
  });

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) {
    throw new Error("Failed to refresh access token");
  }

  const data = await response.json();
  return data.access_token;
}
