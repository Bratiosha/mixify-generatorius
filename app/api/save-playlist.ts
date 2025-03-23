import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { supabaseUserId, userId: spotifyUserId, playlist } = req.body;

    try {
      // Start a transaction
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
      for (const track of playlist.tracks) {
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
          // Insert the song if it doesn't exist
          const { data: newSong, error: songInsertError } = await supabase
            .from('songs')
            .insert([{ title: track.title, artist_id: artistId, duration: track.duration }])
            .select();

          if (songInsertError) throw songInsertError;
          songId = newSong[0].id;
        } else {
          songId = existingSong.id;
        }

        // Save the song to the playlist_songs table
        const { error: playlistSongError } = await supabase
          .from('playlist_songs')
          .insert([{ playlist_id: playlistId, song_id: songId }]);

        if (playlistSongError) throw playlistSongError;
      }

      res.status(200).json({ message: 'Playlist saved successfully' });
    } catch (error) {
      console.error('Error saving playlist:', error);
      res.status(500).json({ error: 'Failed to save playlist', details: error });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}