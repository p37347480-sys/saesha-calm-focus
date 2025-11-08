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
    console.log('update-game-progress: Function invoked');
    
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('update-game-progress: No authorization header');
      throw new Error('No authorization header');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('update-game-progress: Auth error:', authError);
      throw new Error('Unauthorized');
    }

    const update: ProgressUpdate = await req.json();
    console.log('update-game-progress: Received update:', update);

    // Get existing progress or create new
    const { data: existingProgress, error: fetchError } = await supabase
      .from('game_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('game_id', update.gameId)
      .eq('difficulty', update.difficulty)
      .maybeSingle();

    if (fetchError) {
      console.error('update-game-progress: Fetch error:', fetchError);
      throw fetchError;
    }

    console.log('update-game-progress: Existing progress:', existingProgress);

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

    console.log('update-game-progress: Upserting progress data:', progressData);

    // Upsert progress
    const { data: updatedProgress, error: upsertError } = await supabase
      .from('game_progress')
      .upsert(progressData)
      .select()
      .single();

    if (upsertError) {
      console.error('update-game-progress: Upsert error:', upsertError);
      throw upsertError;
    }

    console.log('update-game-progress: Progress updated successfully');

    // Award rewards for milestones
    const rewards = [];
    
    // First time completing a level
    if (update.completed && !existingProgress?.completed_at) {
      console.log('update-game-progress: Level completion reward');
      rewards.push({
        user_id: user.id,
        reward_type: 'level_completion',
        reward_title: `${update.difficulty.charAt(0).toUpperCase() + update.difficulty.slice(1)} Level Complete!`,
        reward_description: `Completed ${update.difficulty} difficulty`,
        metadata: { game_id: update.gameId, difficulty: update.difficulty }
      });
    }

    // Perfect accuracy (100%) - accuracy is passed as 0-100, not 0-1
    if (update.accuracy >= 100 && update.completed) {
      console.log('update-game-progress: Perfect score reward');
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
      console.log('update-game-progress: Three stars reward');
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
      console.log('update-game-progress: Inserting rewards:', rewards);
      const { error: rewardsError } = await supabase.from('rewards').insert(rewards);
      if (rewardsError) {
        console.error('update-game-progress: Rewards insert error:', rewardsError);
        // Don't throw - rewards are nice-to-have
      }
    }

    // Check if all games in chapter are completed
    const { data: game } = await supabase
      .from('games')
      .select('chapter')
      .eq('id', update.gameId)
      .single();

    if (game) {
      console.log('update-game-progress: Checking chapter completion for:', game.chapter);
      
      const { data: chapterGames } = await supabase
        .from('games')
        .select('id')
        .eq('chapter', game.chapter);

      if (chapterGames && chapterGames.length > 0) {
        const { data: chapterProgress } = await supabase
          .from('game_progress')
          .select('game_id, difficulty, completed_at')
          .eq('user_id', user.id)
          .in('game_id', chapterGames.map(g => g.id));

        // Check if all games have at least one completed difficulty
        const completedGames = new Set(
          chapterProgress?.filter(p => p.completed_at).map(p => p.game_id) || []
        );

        console.log('update-game-progress: Completed games count:', completedGames.size, 'of', chapterGames.length);

        if (completedGames.size === chapterGames.length) {
          console.log('update-game-progress: Chapter completed! Awarding chapter completion reward');
          const chapterReward = {
            user_id: user.id,
            reward_type: 'chapter_completion',
            reward_title: `${game.chapter} Master! 🏆`,
            reward_description: `Completed all games in ${game.chapter}`,
            metadata: { chapter: game.chapter }
          };
          
          const { error: chapterRewardError } = await supabase.from('rewards').insert(chapterReward);
          if (chapterRewardError) {
            console.error('update-game-progress: Chapter reward insert error:', chapterRewardError);
            // Don't throw - rewards are nice-to-have
          }
        }
      }
    }

    console.log('update-game-progress: Function completed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        progress: updatedProgress,
        rewardsEarned: rewards.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('update-game-progress: Caught error:', error);
    console.error('update-game-progress: Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorDetails = error instanceof Error ? error.stack : String(error);
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: errorDetails
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
