const scopes = [
  "playlist-modify-public",
  "playlist-modify-private",
  "user-library-read",
  "user-top-read",
];

const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!;
const redirectUri = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI!;

export function loginWithSpotify() {
  const authUrl = new URL("https://accounts.spotify.com/authorize");
  if (clientId && redirectUri) {
    authUrl.searchParams.append("client_id", clientId);
    authUrl.searchParams.append("response_type", "code"); // Use "code" instead of "token"
    authUrl.searchParams.append("redirect_uri", redirectUri);
    authUrl.searchParams.append("scope", scopes.join(" "));
    authUrl.searchParams.append("prompt", "select_account"); // Optional: Force user to select account
    window.location.href = authUrl.toString();
  } else {
    console.error("Spotify client ID or redirect URI is missing");
  }
}