import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { chapter } = await req.json();

    // Get all games for the chapter
    const { data: games, error: gamesError } = await supabase
      .from('games')
      .select('*')
      .eq('chapter', chapter)
      .order('game_number');

    if (gamesError) throw gamesError;

    // Get user's progress for these games
    const gameIds = games?.map(g => g.id) || [];
    
    const { data: progress, error: progressError } = await supabase
      .from('game_progress')
      .select('*')
      .eq('user_id', user.id)
      .in('game_id', gameIds);

    if (progressError) throw progressError;

    // Combine games with progress
    const gamesWithProgress = games?.map(game => {
      const gameProgress = {
        easy: progress?.find(p => p.game_id === game.id && p.difficulty === 'easy'),
        medium: progress?.find(p => p.game_id === game.id && p.difficulty === 'medium'),
        hard: progress?.find(p => p.game_id === game.id && p.difficulty === 'hard'),
      };

      return {
        ...game,
        progress: gameProgress,
      };
    });

    return new Response(
      JSON.stringify({ games: gamesWithProgress }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in get-games:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
