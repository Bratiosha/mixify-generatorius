import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

interface Playlist {
  id: string;
  title: string;
  created_at: string;
  playlist_songs?: PlaylistSong[];
}

interface PlaylistSong {
  song_id: string;
  songs: {
    title: string;
    artists: {
      name: string;
    };
  };
}

// Initialize Supabase client with error handling
let supabase: SupabaseClient | undefined;
try {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('Missing Supabase environment variables');
  }
  supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
} catch (error) {
  console.error('Failed to initialize Supabase client:', error);
}

export async function GET(request: Request) {
  if (!supabase) {
    console.error('Supabase client not initialized');
    return NextResponse.json(
      { error: 'Database connection not initialized' },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const supabaseUserId = searchParams.get('supabaseUserId');

  if (!supabaseUserId) {
    console.error('No user ID provided');
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    console.log('Fetching playlists for user:', supabaseUserId);
    
    // First, get the playlists
    const { data: playlists, error: playlistsError } = await supabase
      .from('playlists')
      .select('id, title, created_at')
      .eq('user_id', supabaseUserId)
      .order('created_at', { ascending: false });

    if (playlistsError) {
      console.error('Error fetching playlists:', playlistsError);
      return NextResponse.json(
        { error: 'Failed to fetch playlists', details: playlistsError.message },
        { status: 500 }
      );
    }

    if (!playlists || playlists.length === 0) {
      console.log('No playlists found for user:', supabaseUserId);
      return NextResponse.json([]);
    }

    console.log(`Found ${playlists.length} playlists for user:`, supabaseUserId);

    // Then, get the songs for each playlist
    const playlistsWithSongs = await Promise.all(
      playlists.map(async (playlist: Playlist) => {
        try {
          console.log(`Fetching songs for playlist:`, playlist.id);
          
          const { data: playlistSongs, error: songsError } = await supabase
            .from('playlist_songs')
            .select(`
              song_id,
              songs (
                title,
                artists (
                  name
                )
              )
            `)
            .eq('playlist_id', playlist.id);

          if (songsError) {
            console.error(`Error fetching songs for playlist ${playlist.id}:`, songsError);
            return {
              ...playlist,
              playlist_songs: []
            };
          }

          console.log(`Found ${playlistSongs?.length || 0} songs for playlist:`, playlist.id);
          
          return {
            ...playlist,
            playlist_songs: playlistSongs || []
          };
        } catch (error) {
          console.error(`Error processing playlist ${playlist.id}:`, error);
          return {
            ...playlist,
            playlist_songs: []
          };
        }
      })
    );

    return NextResponse.json(playlistsWithSongs);
  } catch (error) {
    console.error('Error in get-user-playlists:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch playlists', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 