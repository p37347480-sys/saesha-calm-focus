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

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // Get performance data
    const { data: performance } = await supabase
      .from('user_performance')
      .select('*')
      .eq('user_id', user.id);

    // Get today's session stats
    const today = new Date().toISOString().split('T')[0];
    const { data: todaySessions } = await supabase
      .from('sessions')
      .select('duration_seconds, tasks_completed, tasks_correct')
      .eq('user_id', user.id)
      .gte('start_time', today);

    const minutesToday = (todaySessions?.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) || 0) / 60;
    const tasksToday = todaySessions?.reduce((sum, s) => sum + (s.tasks_completed || 0), 0) || 0;
    const correctToday = todaySessions?.reduce((sum, s) => sum + (s.tasks_correct || 0), 0) || 0;
    const accuracyToday = tasksToday > 0 ? (correctToday / tasksToday) * 100 : 0;

    // Calculate streak
    const maxStreak = performance?.reduce((max, p) => Math.max(max, p.streak_days || 0), 0) || 0;

    // Calculate total tokens
    const totalTokens = performance?.reduce((sum, p) => sum + (p.tokens || 0), 0) || 0;

    return new Response(
      JSON.stringify({
        profile,
        performance,
        todaySessions,
        stats: {
          minutesToday: Math.round(minutesToday),
          tasksToday,
          accuracyToday: Math.round(accuracyToday),
          streak: maxStreak,
          totalTokens,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in get-user-stats:', error);
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
