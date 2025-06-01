-- Create table for saved creators
CREATE TABLE IF NOT EXISTS public.saved_creators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  creator_username text NOT NULL,
  creator_display_name text,
  creator_profile_pic_url text,
  creator_follower_count integer,
  creator_bio text,
  is_verified boolean DEFAULT false,
  saved_at timestamp with time zone DEFAULT now() NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE(user_id, creator_username)
);

-- Enable RLS
ALTER TABLE public.saved_creators ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own saved creators"
    ON saved_creators FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own saved creators"
    ON saved_creators FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved creators"
    ON saved_creators FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved creators"
    ON saved_creators FOR DELETE
    USING (auth.uid() = user_id);

-- Create trigger for updating timestamps (assuming the function exists)
CREATE TRIGGER update_saved_creators_updated_at
    BEFORE UPDATE ON saved_creators
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_saved_creators_user_id ON saved_creators(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_creators_username ON saved_creators(creator_username); 