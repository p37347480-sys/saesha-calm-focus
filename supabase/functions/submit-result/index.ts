import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ResultSubmission {
  sessionId: string;
  taskId: string;
  subject: string;
  topic: string;
  difficulty: number;
  correct: boolean;
  responseTimeMs: number;
  hintsUsed: number;
  skipped: boolean;
}

// EMA update logic
const updateEMA = (currentEMA: number, newValue: number, alpha: number = 0.2): number => {
  return alpha * newValue + (1 - alpha) * currentEMA;
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

    const submission: ResultSubmission = await req.json();

    // Insert task result
    const { error: insertError } = await supabase
      .from('task_results')
      .insert({
        session_id: submission.sessionId,
        user_id: user.id,
        task_id: submission.taskId,
        subject: submission.subject,
        topic: submission.topic,
        difficulty: submission.difficulty,
        correct: submission.correct,
        response_time_ms: submission.responseTimeMs,
        hints_used: submission.hintsUsed,
        skipped: submission.skipped,
      });

    if (insertError) throw insertError;

    // Get current performance or create if doesn't exist
    const { data: perfData, error: perfError } = await supabase
      .from('user_performance')
      .select('*')
      .eq('user_id', user.id)
      .eq('subject', submission.subject)
      .maybeSingle();

    if (perfError) throw perfError;

    let performance = perfData || {
      user_id: user.id,
      subject: submission.subject,
      ema_accuracy: 0.7,
      ema_time: 10,
      ema_hints: 0,
      difficulty_level: 2,
      streak_days: 0,
      tokens: 0,
    };

    // Update EMAs
    const resultValue = submission.correct ? 1 : 0;
    const timeInSeconds = submission.responseTimeMs / 1000;

    performance.ema_accuracy = updateEMA(Number(performance.ema_accuracy), resultValue);
    performance.ema_time = updateEMA(Number(performance.ema_time), timeInSeconds);
    performance.ema_hints = updateEMA(Number(performance.ema_hints), submission.hintsUsed);

    // Streak tracking
    const today = new Date().toISOString().split('T')[0];
    const lastSessionDate = performance.last_session_date;
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    if (lastSessionDate === yesterday) {
      // Continuing streak from yesterday
      performance.streak_days = (performance.streak_days || 0) + 1;
    } else if (lastSessionDate !== today) {
      // Streak broken or starting new
      performance.streak_days = 1;
    }
    // If lastSessionDate === today, keep current streak
    
    performance.last_session_date = today;

    // Adaptive difficulty adjustment
    const targetTime = 10; // seconds
    if (performance.ema_accuracy > 0.8 && performance.ema_time <= targetTime) {
      performance.difficulty_level = Math.min(5, performance.difficulty_level + 1);
    } else if (performance.ema_accuracy < 0.5 || performance.ema_hints > 1) {
      performance.difficulty_level = Math.max(1, performance.difficulty_level - 1);
    }

    // Award tokens for correct answers
    if (submission.correct && !submission.skipped) {
      performance.tokens = (performance.tokens || 0) + 10;
    }

    // Upsert performance
    const { error: upsertError } = await supabase
      .from('user_performance')
      .upsert(performance);

    if (upsertError) throw upsertError;

    // Log analytics event
    await supabase.from('analytics_events').insert({
      user_id: user.id,
      event_type: submission.skipped ? 'microtask_skipped' : 'microtask_answered',
      session_id: submission.sessionId,
      task_id: submission.taskId,
      metadata: {
        correct: submission.correct,
        time_ms: submission.responseTimeMs,
        hints_used: submission.hintsUsed,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        nextDifficulty: performance.difficulty_level,
        tokens: performance.tokens,
        streakDays: performance.streak_days,
        accuracy: performance.ema_accuracy,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in submit-result:', error);
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
