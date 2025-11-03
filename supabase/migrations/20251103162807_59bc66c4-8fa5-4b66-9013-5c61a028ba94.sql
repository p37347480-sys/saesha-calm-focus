-- Create games table to track game structure
CREATE TABLE IF NOT EXISTS public.games (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chapter text NOT NULL,
  game_number integer NOT NULL,
  game_title text NOT NULL,
  game_concept text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(chapter, game_number)
);

-- Create game_progress table to track user progress per game and level
CREATE TABLE IF NOT EXISTS public.game_progress (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id uuid NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  difficulty text NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  stars_earned integer DEFAULT 0 CHECK (stars_earned >= 0 AND stars_earned <= 3),
  best_accuracy numeric DEFAULT 0,
  questions_completed integer DEFAULT 0,
  hints_used integer DEFAULT 0,
  unlocked boolean DEFAULT false,
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, game_id, difficulty)
);

-- Enable RLS
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_progress ENABLE ROW LEVEL SECURITY;

-- RLS policies for games (read-only for all authenticated users)
CREATE POLICY "Users can view all games"
  ON public.games
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- RLS policies for game_progress
CREATE POLICY "Users can view own game progress"
  ON public.game_progress
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own game progress"
  ON public.game_progress
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own game progress"
  ON public.game_progress
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Add trigger for game_progress updated_at
CREATE TRIGGER update_game_progress_updated_at
  BEFORE UPDATE ON public.game_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert the 5 chapters with 4 games each
INSERT INTO public.games (chapter, game_number, game_title, game_concept) VALUES
  -- Trigonometry (4 games)
  ('Trigonometry', 1, 'Skyline Surveyor', 'Heights & Distances in 2D and 3D'),
  ('Trigonometry', 2, 'Wave Lab', 'Trigonometric Graphs & Transformations'),
  ('Trigonometry', 3, 'Mountain Rescue Drone', 'Angle of Elevation/Depression in 3D Terrain'),
  ('Trigonometry', 4, 'Clock Tower Challenge', 'Trigonometric Identities & Proofs'),
  
  -- Algebra (4 games)
  ('Algebra', 1, 'Break the Lock', 'Expanding Algebraic Expressions'),
  ('Algebra', 2, 'Dragon Factor Cave', 'Factorisation & Simplification'),
  ('Algebra', 3, 'Wizard Duel Arena', 'Algebraic Identities & Patterns'),
  ('Algebra', 4, 'Challenge Land', 'Mixed Algebra & Quadratics'),
  
  -- Volume & Surface Area (4 games)
  ('Volume & Surface Area', 1, 'AquaTank Architect', 'Volume of Composite Solids'),
  ('Volume & Surface Area', 2, 'Drone Hangar Design', 'Optimization of Surface-to-Volume Ratio'),
  ('Volume & Surface Area', 3, 'Garden Pavilion Project', 'Area of Cross-Sections'),
  ('Volume & Surface Area', 4, 'Shipping Capsule Challenge', 'Real-life Volume & Capacity Optimization'),
  
  -- Probability (4 games)
  ('Probability', 1, 'Card Clash Challenge', 'Conditional & Independent Probability'),
  ('Probability', 2, 'Dice Tower Trials', 'Binomial Probability'),
  ('Probability', 3, 'Marble Maze Machine', 'Combined Events (Mutually Exclusive/Non-exclusive)'),
  ('Probability', 4, 'Weather Forecast Lab', 'Real-life Data Probability'),
  
  -- Fractions/Decimals/Percentages/Interest (4 games)
  ('Fractions/Decimals/Percentages/Interest', 1, 'Fraction Master', 'Fraction Operations & Simplification'),
  ('Fractions/Decimals/Percentages/Interest', 2, 'Decimal & Percentage Lab', 'Conversions & Comparisons'),
  ('Fractions/Decimals/Percentages/Interest', 3, 'Interest Shop', 'Simple & Compound Interest'),
  ('Fractions/Decimals/Percentages/Interest', 4, 'Money Quest', 'Discounts, Profit/Loss & Real-life Math');

-- Create rewards table
CREATE TABLE IF NOT EXISTS public.rewards (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reward_type text NOT NULL,
  reward_title text NOT NULL,
  reward_description text,
  earned_at timestamp with time zone DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rewards"
  ON public.rewards
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own rewards"
  ON public.rewards
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Update sessions table to remove time limits and add game tracking
ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS game_id uuid REFERENCES public.games(id),
  ADD COLUMN IF NOT EXISTS difficulty text CHECK (difficulty IN ('easy', 'medium', 'hard'));

-- Create function to automatically unlock next level/game
CREATE OR REPLACE FUNCTION public.unlock_next_level()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_game_id uuid;
  v_next_difficulty text;
BEGIN
  -- If completed with good accuracy (>70%), unlock next level
  IF NEW.completed_at IS NOT NULL AND NEW.best_accuracy >= 0.7 THEN
    -- Determine next level
    IF NEW.difficulty = 'easy' THEN
      v_next_difficulty := 'medium';
    ELSIF NEW.difficulty = 'medium' THEN
      v_next_difficulty := 'hard';
    ELSE
      -- If hard is completed, unlock next game's easy level
      SELECT id INTO v_game_id
      FROM public.games
      WHERE chapter = (SELECT chapter FROM public.games WHERE id = NEW.game_id)
        AND game_number = (SELECT game_number + 1 FROM public.games WHERE id = NEW.game_id)
      LIMIT 1;
      
      IF v_game_id IS NOT NULL THEN
        INSERT INTO public.game_progress (user_id, game_id, difficulty, unlocked)
        VALUES (NEW.user_id, v_game_id, 'easy', true)
        ON CONFLICT (user_id, game_id, difficulty) DO UPDATE
        SET unlocked = true;
      END IF;
      
      RETURN NEW;
    END IF;
    
    -- Unlock next difficulty level for same game
    INSERT INTO public.game_progress (user_id, game_id, difficulty, unlocked)
    VALUES (NEW.user_id, NEW.game_id, v_next_difficulty, true)
    ON CONFLICT (user_id, game_id, difficulty) DO UPDATE
    SET unlocked = true;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for auto-unlocking
CREATE TRIGGER auto_unlock_next_level
  AFTER UPDATE ON public.game_progress
  FOR EACH ROW
  WHEN (NEW.completed_at IS NOT NULL AND OLD.completed_at IS NULL)
  EXECUTE FUNCTION public.unlock_next_level();

-- Initialize first game as unlocked for all existing users
INSERT INTO public.game_progress (user_id, game_id, difficulty, unlocked)
SELECT 
  u.id as user_id,
  g.id as game_id,
  'easy' as difficulty,
  true as unlocked
FROM auth.users u
CROSS JOIN public.games g
WHERE g.chapter = 'Trigonometry' AND g.game_number = 1
ON CONFLICT (user_id, game_id, difficulty) DO UPDATE
SET unlocked = true;