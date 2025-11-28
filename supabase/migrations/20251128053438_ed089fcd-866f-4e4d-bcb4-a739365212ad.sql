-- Add nutritional_info column to videos table to store calorie scan data
ALTER TABLE public.videos 
ADD COLUMN nutritional_info jsonb NULL;

COMMENT ON COLUMN public.videos.nutritional_info IS 'Stores detailed nutritional breakdown from AI food scans including items, calories, protein, carbs, and fats';