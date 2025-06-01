-- Create user_pantry table
CREATE TABLE IF NOT EXISTS user_pantry (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL,
    ingredients TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Add RLS policies
ALTER TABLE user_pantry ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own pantry"
    ON user_pantry FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pantry"
    ON user_pantry FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pantry"
    ON user_pantry FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_user_pantry_user_id ON user_pantry(user_id);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_pantry_updated_at
    BEFORE UPDATE ON user_pantry
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 