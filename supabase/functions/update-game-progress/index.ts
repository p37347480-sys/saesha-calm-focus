import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProgressUpdate {
  gameId: string;
  difficulty: 'easy' | 'medium' | 'hard';
  starsEarned: number;
  accuracy: number;
  questionsCompleted: number;
  hintsUsed: number;
  completed: boolean;
}

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

    const update: ProgressUpdate = await req.json();

    // Get existing progress or create new
    const { data: existingProgress, error: fetchError } = await supabase
      .from('game_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('game_id', update.gameId)
      .eq('difficulty', update.difficulty)
      .maybeSingle();

    if (fetchError) throw fetchError;

    const progressData = {
      user_id: user.id,
      game_id: update.gameId,
      difficulty: update.difficulty,
      stars_earned: Math.max(existingProgress?.stars_earned || 0, update.starsEarned),
      best_accuracy: Math.max(existingProgress?.best_accuracy || 0, update.accuracy),
      questions_completed: (existingProgress?.questions_completed || 0) + update.questionsCompleted,
      hints_used: (existingProgress?.hints_used || 0) + update.hintsUsed,
      unlocked: true,
      completed_at: update.completed ? new Date().toISOString() : existingProgress?.completed_at,
    };

    // Upsert progress
    const { data: updatedProgress, error: upsertError } = await supabase
      .from('game_progress')
      .upsert(progressData)
      .select()
      .single();

    if (upsertError) throw upsertError;

    // Award rewards for milestones
    const rewards = [];
    
    // First time completing a level
    if (update.completed && !existingProgress?.completed_at) {
      rewards.push({
        user_id: user.id,
        reward_type: 'level_completion',
        reward_title: `${update.difficulty.charAt(0).toUpperCase() + update.difficulty.slice(1)} Level Complete!`,
        reward_description: `Completed ${update.difficulty} difficulty`,
        metadata: { game_id: update.gameId, difficulty: update.difficulty }
      });
    }

    // Perfect accuracy (100%)
    if (update.accuracy >= 1.0 && update.completed) {
      rewards.push({
        user_id: user.id,
        reward_type: 'perfect_score',
        reward_title: 'Perfect Score! 🌟',
        reward_description: 'Achieved 100% accuracy',
        metadata: { game_id: update.gameId, difficulty: update.difficulty }
      });
    }

    // 3 stars achievement
    if (update.starsEarned === 3 && (existingProgress?.stars_earned || 0) < 3) {
      rewards.push({
        user_id: user.id,
        reward_type: 'three_stars',
        reward_title: 'Three Stars! ⭐⭐⭐',
        reward_description: 'Earned all three stars',
        metadata: { game_id: update.gameId, difficulty: update.difficulty }
      });
    }

    // Insert rewards if any
    if (rewards.length > 0) {
      await supabase.from('rewards').insert(rewards);
    }

    // Check if all games in chapter are completed
    const { data: game } = await supabase
      .from('games')
      .select('chapter')
      .eq('id', update.gameId)
      .single();

    if (game) {
      const { data: chapterGames } = await supabase
        .from('games')
        .select('id')
        .eq('chapter', game.chapter);

      if (chapterGames) {
        const { data: chapterProgress } = await supabase
          .from('game_progress')
          .select('game_id, difficulty, completed_at')
          .eq('user_id', user.id)
          .in('game_id', chapterGames.map(g => g.id));

        // Check if all games have at least one completed difficulty
        const completedGames = new Set(
          chapterProgress?.filter(p => p.completed_at).map(p => p.game_id) || []
        );

        if (completedGames.size === chapterGames.length) {
          rewards.push({
            user_id: user.id,
            reward_type: 'chapter_completion',
            reward_title: `${game.chapter} Master! 🏆`,
            reward_description: `Completed all games in ${game.chapter}`,
            metadata: { chapter: game.chapter }
          });
          await supabase.from('rewards').insert(rewards[rewards.length - 1]);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        progress: updatedProgress,
        rewardsEarned: rewards,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in update-game-progress:', error);
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
