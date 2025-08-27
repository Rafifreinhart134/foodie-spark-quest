-- Fix the remaining function security issue
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER 
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, avatar_url)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'display_name', NEW.raw_user_meta_data ->> 'avatar_url');
  
  INSERT INTO public.coins (user_id, balance)
  VALUES (NEW.id, 100); -- Welcome bonus
  
  RETURN NEW;
END;
$$;