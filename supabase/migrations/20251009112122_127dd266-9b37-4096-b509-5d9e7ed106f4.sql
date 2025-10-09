-- Create function to increment session stats
CREATE OR REPLACE FUNCTION increment_session_stats(
  p_session_id UUID,
  p_is_correct BOOLEAN
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.sessions
  SET 
    tasks_completed = tasks_completed + 1,
    tasks_correct = tasks_correct + CASE WHEN p_is_correct THEN 1 ELSE 0 END
  WHERE id = p_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;