import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { supabaseUserId } = req.query;

    if (!supabaseUserId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    try {
      const { data: playlists, error } = await supabase
        .from('playlists')
        .select(`
          *,
          playlist_songs (
            song_id,
            songs (
              title,
              artists (
                name
              )
            )
          )
        `)
        .eq('user_id', supabaseUserId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      res.status(200).json(playlists);
    } catch (error) {
      console.error('Error fetching playlists:', error);
      res.status(500).json({ error: 'Failed to fetch playlists', details: error });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 