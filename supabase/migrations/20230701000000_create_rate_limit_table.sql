-- Create a table to track user API rate limits
CREATE TABLE IF NOT EXISTS public.user_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  count integer NOT NULL DEFAULT 0,
  reset_at bigint NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Add RLS policies
ALTER TABLE public.user_rate_limits ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own rate limit data
CREATE POLICY "Users can view their own rate limit data" 
  ON public.user_rate_limits
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create a unique index on user_id to ensure one rate limit record per user
CREATE UNIQUE INDEX user_rate_limits_user_id_idx ON public.user_rate_limits (user_id);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to update the updated_at column
CREATE TRIGGER update_user_rate_limits_updated_at
BEFORE UPDATE ON public.user_rate_limits
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column(); 