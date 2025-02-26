import { NextResponse } from "next/server";
import querystring from "querystring";
import SpotifyWebApi from "spotify-web-api-node";

const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const redirect_uri = process.env.SPOTIFY_REDIRECT_URI;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "No code provided" }, { status: 400 });
  }

  const spotifyApi = new SpotifyWebApi({
    clientId: client_id,
    clientSecret: client_secret,
    redirectUri: redirect_uri,
  });

  try {
    const data = await spotifyApi.authorizationCodeGrant(code);
    const { access_token, refresh_token } = data.body;

    // Store tokens in cookies or session
    const response = NextResponse.redirect("/");
    response.cookies.set("spotify_access_token", access_token);
    response.cookies.set("spotify_refresh_token", refresh_token);

    return response;
  } catch (error) {
    console.error("Error during Spotify authentication:", error);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}