-- Create table for user collections
CREATE TABLE IF NOT EXISTS public.collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  recipe_count integer DEFAULT 0 NOT NULL,
  image_url text DEFAULT '/lemon.svg',
  is_private boolean DEFAULT false NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create table for collection-recipe relationships
CREATE TABLE IF NOT EXISTS public.collection_recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid REFERENCES public.collections(id) ON DELETE CASCADE NOT NULL,
  recipe_id text NOT NULL, -- Can reference saved_reels.reel_id or recipes.id
  recipe_type text DEFAULT 'saved_reel' NOT NULL, -- 'saved_reel' or 'user_recipe'
  added_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE(collection_id, recipe_id, recipe_type)
);

-- Create table for recipe photos
CREATE TABLE IF NOT EXISTS public.recipe_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recipe_id uuid REFERENCES public.recipes(id) ON DELETE CASCADE,
  file_path text NOT NULL,
  file_name text NOT NULL,
  file_size integer,
  mime_type text,
  order_index integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create function to automatically update collection recipe count
CREATE OR REPLACE FUNCTION update_collection_recipe_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.collections 
    SET recipe_count = recipe_count + 1
    WHERE id = NEW.collection_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.collections 
    SET recipe_count = recipe_count - 1
    WHERE id = OLD.collection_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update recipe count
CREATE TRIGGER trigger_update_collection_recipe_count
  AFTER INSERT OR DELETE ON public.collection_recipes
  FOR EACH ROW
  EXECUTE FUNCTION update_collection_recipe_count();

-- Create functions for manual recipe count management
CREATE OR REPLACE FUNCTION increment_collection_recipe_count(collection_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE public.collections 
  SET recipe_count = recipe_count + 1
  WHERE id = collection_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_collection_recipe_count(collection_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE public.collections 
  SET recipe_count = GREATEST(recipe_count - 1, 0)
  WHERE id = collection_id;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS on all tables
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_photos ENABLE ROW LEVEL SECURITY;

-- Create policies for collections
CREATE POLICY "Users can view their own collections"
    ON collections FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own collections"
    ON collections FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own collections"
    ON collections FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own collections"
    ON collections FOR DELETE
    USING (auth.uid() = user_id);

-- Create policies for collection_recipes
CREATE POLICY "Users can view recipes in their collections"
    ON collection_recipes FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM collections 
        WHERE collections.id = collection_recipes.collection_id 
        AND collections.user_id = auth.uid()
    ));

CREATE POLICY "Users can add recipes to their collections"
    ON collection_recipes FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM collections 
        WHERE collections.id = collection_recipes.collection_id 
        AND collections.user_id = auth.uid()
    ));

CREATE POLICY "Users can remove recipes from their collections"
    ON collection_recipes FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM collections 
        WHERE collections.id = collection_recipes.collection_id 
        AND collections.user_id = auth.uid()
    ));

-- Create policies for recipe_photos
CREATE POLICY "Users can view their own recipe photos"
    ON recipe_photos FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can upload their own recipe photos"
    ON recipe_photos FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recipe photos"
    ON recipe_photos FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recipe photos"
    ON recipe_photos FOR DELETE
    USING (auth.uid() = user_id);

-- Create triggers for updating timestamps
CREATE TRIGGER update_collections_updated_at
    BEFORE UPDATE ON collections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_collections_user_id ON collections(user_id);
CREATE INDEX IF NOT EXISTS idx_collections_created_at ON collections(created_at);
CREATE INDEX IF NOT EXISTS idx_collection_recipes_collection_id ON collection_recipes(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_recipes_recipe_id ON collection_recipes(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_photos_user_id ON recipe_photos(user_id);
CREATE INDEX IF NOT EXISTS idx_recipe_photos_recipe_id ON recipe_photos(recipe_id); 