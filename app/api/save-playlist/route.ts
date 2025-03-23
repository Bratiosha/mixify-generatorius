import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

// Helper function to convert milliseconds to minutes:seconds format
const formatDuration = (durationMs: number): string => {
  const totalSeconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`; // Ensure seconds are two digits
};

export async function POST(request: Request) {
  const { supabaseUserId, userId: spotifyUserId, playlist } = await request.json();

  try {
    // Save playlist to the playlists table
    const { data: playlistData, error: playlistError } = await supabase
      .from('playlists')
      .insert([
        {
          user_id: supabaseUserId, // Supabase user ID
          spotify_user_id: spotifyUserId, // Spotify user ID
          title: playlist.title,
          spotify_playlist_id: playlist.spotify_playlist_id,
        },
      ])
      .select();

    if (playlistError) throw playlistError;

    const playlistId = playlistData[0].id;

    // Save tracks to the songs and playlist_songs tables
    for (let i = 0; i < playlist.tracks.length; i++) {
      const track = playlist.tracks[i];
      const position = i + 1; // Position starts from 1

      try {
        // Check if the artist already exists
        let artistId;
        const { data: existingArtist, error: artistLookupError } = await supabase
          .from('artists')
          .select('id')
          .eq('name', track.artist)
          .single();

        if (artistLookupError || !existingArtist) {
          // Insert the artist if they don't exist
          const { data: newArtist, error: artistInsertError } = await supabase
            .from('artists')
            .insert([{ name: track.artist }])
            .select();

          if (artistInsertError) throw artistInsertError;
          artistId = newArtist[0].id;
        } else {
          artistId = existingArtist.id;
        }

        // Check if the song already exists
        let songId;
        const { data: existingSong, error: songLookupError } = await supabase
          .from('songs')
          .select('id')
          .eq('title', track.title)
          .eq('artist_id', artistId)
          .single();

        if (songLookupError || !existingSong) {
          // Convert duration from milliseconds to minutes:seconds format
          const formattedDuration = formatDuration(track.duration);

          // Insert the song if it doesn't exist
          const { data: newSong, error: songInsertError } = await supabase
            .from('songs')
            .insert([
              {
                title: track.title,
                artist_id: artistId,
                duration: formattedDuration, // Save duration in minutes:seconds format
                genre: track.genre || 'Unknown', // Add genre field with a default value
              },
            ])
            .select();

          if (songInsertError) throw songInsertError;
          songId = newSong[0].id;
        } else {
          songId = existingSong.id;
        }

        // Save the song to the playlist_songs table with position
        const { error: playlistSongError } = await supabase
          .from('playlist_songs')
          .insert([{ playlist_id: playlistId, song_id: songId, position }]);

        if (playlistSongError) throw playlistSongError;

        console.log(`✅ Saved track: ${track.title} by ${track.artist} at position ${position}`);
      } catch (trackError) {
        console.error(`⚠️ Error processing track: ${track.title} by ${track.artist}`, trackError);
      }
    }

    return NextResponse.json({ message: 'Playlist saved successfully' });
  } catch (error) {
    console.error('Error saving playlist:', error);
    return NextResponse.json({ error: 'Failed to save playlist', details: error }, { status: 500 });
  }
}