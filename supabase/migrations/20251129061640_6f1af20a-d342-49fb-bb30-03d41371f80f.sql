-- Add username column without unique constraint first
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username text;

-- Create a function to generate unique usernames
CREATE OR REPLACE FUNCTION generate_unique_username(base_name text, user_uuid uuid)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  new_username text;
  counter int := 0;
BEGIN
  -- Clean the base name
  new_username := LOWER(REGEXP_REPLACE(COALESCE(base_name, 'user'), '[^a-zA-Z0-9_]', '_', 'g'));
  
  -- If username is taken, append counter
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = new_username AND user_id != user_uuid) LOOP
    counter := counter + 1;
    new_username := LOWER(REGEXP_REPLACE(COALESCE(base_name, 'user'), '[^a-zA-Z0-9_]', '_', 'g')) || '_' || counter;
  END LOOP;
  
  RETURN new_username;
END;
$$;

-- Populate usernames for existing users
UPDATE public.profiles 
SET username = generate_unique_username(display_name, user_id)
WHERE username IS NULL;

-- Now add unique constraint
ALTER TABLE public.profiles ADD CONSTRAINT profiles_username_key UNIQUE (username);

-- Create index for username lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);

-- Drop the helper function
DROP FUNCTION IF EXISTS generate_unique_username(text, uuid);