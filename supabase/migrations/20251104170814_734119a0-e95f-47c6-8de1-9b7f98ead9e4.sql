-- Create questions table to store pre-generated questions
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer INTEGER NOT NULL CHECK (correct_answer >= 0 AND correct_answer <= 3),
  explanation TEXT NOT NULL,
  hint TEXT,
  topic TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- Users can view questions for games they have access to
CREATE POLICY "Users can view questions"
  ON public.questions
  FOR SELECT
  TO authenticated
  USING (true);

-- Create index for faster lookups
CREATE INDEX idx_questions_game_difficulty ON public.questions(game_id, difficulty);

-- Add trigger for updated_at
CREATE TRIGGER update_questions_updated_at
  BEFORE UPDATE ON public.questions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate and store questions for a game
CREATE OR REPLACE FUNCTION public.generate_questions_for_game(
  p_game_id UUID,
  p_difficulty TEXT,
  p_count INTEGER DEFAULT 10
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_game RECORD;
  v_question_data JSONB;
  i INTEGER;
BEGIN
  -- Get game details
  SELECT * INTO v_game FROM public.games WHERE id = p_game_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Game not found';
  END IF;
  
  -- This function creates placeholder questions
  -- In production, you would call the AI API here to generate real questions
  FOR i IN 1..p_count LOOP
    INSERT INTO public.questions (
      game_id,
      difficulty,
      question_text,
      options,
      correct_answer,
      explanation,
      hint,
      topic
    ) VALUES (
      p_game_id,
      p_difficulty,
      format('Question %s for %s - %s (Difficulty: %s)', i, v_game.chapter, v_game.game_title, p_difficulty),
      jsonb_build_array(
        'Option A',
        'Option B', 
        'Option C',
        'Option D'
      ),
      floor(random() * 4)::INTEGER,
      format('This is the explanation for question %s', i),
      format('Here is a hint for question %s', i),
      v_game.game_concept
    );
  END LOOP;
END;
$$;