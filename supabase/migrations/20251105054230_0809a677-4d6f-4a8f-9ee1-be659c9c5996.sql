-- Update unlock_first_games_for_user to unlock Easy level for ALL games
CREATE OR REPLACE FUNCTION public.unlock_first_games_for_user(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Unlock Easy level for ALL games (not just first in each chapter)
  INSERT INTO public.game_progress (user_id, game_id, difficulty, unlocked)
  SELECT p_user_id, g.id, 'easy', true
  FROM public.games g
  ON CONFLICT (user_id, game_id, difficulty) 
  DO UPDATE SET unlocked = true;
END;
$$;

-- Update unlock_next_level to only progress within the same game (no cross-game unlocking)
CREATE OR REPLACE FUNCTION public.unlock_next_level()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_next_difficulty text;
BEGIN
  -- Only process if completed with decent accuracy (>50%)
  IF NEW.completed_at IS NOT NULL AND NEW.best_accuracy >= 50 THEN
    
    -- Determine next difficulty level within the SAME game
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
    
    -- When hard is completed, do nothing (no cross-game unlocking)
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- For existing users: unlock all games' Easy levels
INSERT INTO public.game_progress (user_id, game_id, difficulty, unlocked)
SELECT u.id, g.id, 'easy', true
FROM auth.users u
CROSS JOIN public.games g
WHERE NOT EXISTS (
  SELECT 1 FROM public.game_progress gp 
  WHERE gp.user_id = u.id 
  AND gp.game_id = g.id 
  AND gp.difficulty = 'easy'
)
ON CONFLICT (user_id, game_id, difficulty) 
DO UPDATE SET unlocked = true;