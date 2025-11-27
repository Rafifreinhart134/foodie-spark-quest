-- Create table for calorie scans
CREATE TABLE public.calorie_scans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  image_url TEXT NOT NULL,
  total_calories INTEGER NOT NULL,
  items JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_posted BOOLEAN DEFAULT false
);

-- Enable Row Level Security
ALTER TABLE public.calorie_scans ENABLE ROW LEVEL SECURITY;

-- Create policies for calorie_scans
CREATE POLICY "Users can view their own scans" 
ON public.calorie_scans 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own scans" 
ON public.calorie_scans 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scans" 
ON public.calorie_scans 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scans" 
ON public.calorie_scans 
FOR DELETE 
USING (auth.uid() = user_id);

-- Allow public to view posted scans
CREATE POLICY "Anyone can view posted scans" 
ON public.calorie_scans 
FOR SELECT 
USING (is_posted = true);