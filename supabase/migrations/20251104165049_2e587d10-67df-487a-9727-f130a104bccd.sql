-- Update the unlock logic to ensure first game of each chapter is unlocked for all users
-- Also ensure proper unlocking of next levels and games

-- First, let's create a helper function to unlock the first game of each chapter for a user
CREATE OR REPLACE FUNCTION public.unlock_first_games_for_user(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_game record;
BEGIN
  -- Unlock easy level of first game in each chapter
  FOR v_game IN 
    SELECT DISTINCT ON (chapter) id, chapter
    FROM public.games
    ORDER BY chapter, game_number
  LOOP
    INSERT INTO public.game_progress (user_id, game_id, difficulty, unlocked)
    VALUES (p_user_id, v_game.id, 'easy', true)
    ON CONFLICT (user_id, game_id, difficulty) 
    DO UPDATE SET unlocked = true;
  END LOOP;
END;
$$;

-- Update the unlock_next_level function to be more robust
CREATE OR REPLACE FUNCTION public.unlock_next_level()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_game_id uuid;
  v_next_difficulty text;
  v_current_game record;
  v_next_game record;
BEGIN
  -- Only process if completed with decent accuracy (>50%)
  IF NEW.completed_at IS NOT NULL AND NEW.best_accuracy >= 50 THEN
    -- Get current game info
    SELECT * INTO v_current_game FROM public.games WHERE id = NEW.game_id;
    
    -- Determine next level
    IF NEW.difficulty = 'easy' THEN
      v_next_difficulty := 'medium';
      
      -- Unlock medium difficulty for same game
      INSERT INTO public.game_progress (user_id, game_id, difficulty, unlocked)
      VALUES (NEW.user_id, NEW.game_id, v_next_difficulty, true)
      ON CONFLICT (user_id, game_id, difficulty) DO UPDATE
      SET unlocked = true;
      
    ELSIF NEW.difficulty = 'medium' THEN
      v_next_difficulty := 'hard';
      
      -- Unlock hard difficulty for same game
      INSERT INTO public.game_progress (user_id, game_id, difficulty, unlocked)
      VALUES (NEW.user_id, NEW.game_id, v_next_difficulty, true)
      ON CONFLICT (user_id, game_id, difficulty) DO UPDATE
      SET unlocked = true;
      
    ELSIF NEW.difficulty = 'hard' THEN
      -- When hard is completed, unlock next game's easy level
      SELECT * INTO v_next_game
      FROM public.games
      WHERE chapter = v_current_game.chapter
        AND game_number = v_current_game.game_number + 1
      LIMIT 1;
      
      IF v_next_game.id IS NOT NULL THEN
        -- Unlock easy level of next game in same chapter
        INSERT INTO public.game_progress (user_id, game_id, difficulty, unlocked)
        VALUES (NEW.user_id, v_next_game.id, 'easy', true)
        ON CONFLICT (user_id, game_id, difficulty) DO UPDATE
        SET unlocked = true;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Unlock first games for all existing users
DO $$
DECLARE
  v_user record;
BEGIN
  FOR v_user IN SELECT id FROM auth.users LOOP
    PERFORM unlock_first_games_for_user(v_user.id);
  END LOOP;
END;
$$;