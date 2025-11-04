-- Update handle_new_user to unlock first games automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, name, grade, subjects)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Student'),
    COALESCE((NEW.raw_user_meta_data->>'grade')::INTEGER, 11),
    COALESCE(
      ARRAY(SELECT jsonb_array_elements_text(NEW.raw_user_meta_data->'subjects')),
      '{}'::TEXT[]
    )
  );
  
  -- Unlock first game of each chapter
  PERFORM unlock_first_games_for_user(NEW.id);
  
  RETURN NEW;
END;
$function$;