import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "No authorization code found" }, { status: 400 });
  }

  const client_id = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!;
  const client_secret = process.env.SPOTIFY_CLIENT_SECRET!;
  const redirect_uri = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI!;

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri,
    client_id,
    client_secret,
  });

  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Spotify API Error:", errorData);
      return NextResponse.json({ error: "Failed to fetch token", details: errorData }, { status: 400 });
    }

    const data = await response.json();
    const access_token = data.access_token;

    // Redirect to the frontend with the access_token
    return NextResponse.redirect(new URL(`/PlayListGenerator?access_token=${access_token}`, req.url));
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json({ error: "Server error", details: error }, { status: 500 });
  }
}