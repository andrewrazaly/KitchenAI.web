-- Create table for saved reels
CREATE TABLE IF NOT EXISTS public.saved_reels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reel_id text NOT NULL,
  reel_data jsonb NOT NULL,
  notes text,
  recipe_id uuid REFERENCES public.recipes(id),
  saved_at timestamp with time zone DEFAULT now() NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE(user_id, reel_id)
);

-- Enable RLS
ALTER TABLE public.saved_reels ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own saved reels"
    ON saved_reels FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own saved reels"
    ON saved_reels FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved reels"
    ON saved_reels FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved reels"
    ON saved_reels FOR DELETE
    USING (auth.uid() = user_id);

-- Create trigger for updating timestamps
CREATE TRIGGER update_saved_reels_updated_at
    BEFORE UPDATE ON saved_reels
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 