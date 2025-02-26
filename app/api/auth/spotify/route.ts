import { NextResponse } from "next/server";
import querystring from "querystring";

const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const redirect_uri = process.env.SPOTIFY_REDIRECT_URI;

export async function GET() {
  const scope = "playlist-modify-public playlist-modify-private";
  const state = "some-random-state";

  const queryParams = querystring.stringify({
    response_type: "code",
    client_id,
    scope,
    redirect_uri,
    state,
  });

  const authUrl = `https://accounts.spotify.com/authorize?${queryParams}`;

  return NextResponse.redirect(authUrl);
}