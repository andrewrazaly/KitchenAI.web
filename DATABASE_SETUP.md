# Database Setup Guide for KitchenAI

## 📊 **Database Tables Setup**

### **1. Saved Creators Table**

Run this SQL in your Supabase SQL editor:

```sql
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

-- Create trigger for updating timestamps (if the function exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_saved_creators_updated_at
    BEFORE UPDATE ON saved_creators
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_saved_creators_user_id ON saved_creators(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_creators_username ON saved_creators(creator_username);
```

### **2. Verify Saved Reels Table**

Make sure your saved_reels table exists (it should already be there):

```sql
-- Check if saved_reels table exists
SELECT * FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'saved_reels';
```

If it doesn't exist, run:

```sql
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
```

## 🔧 **How the System Works**

### **Smart Fallback System**
- ✅ **Signed Out Users**: Data saved to localStorage (temporary)
- ✅ **Signed In Users**: Data saved to Supabase database (permanent)
- ✅ **Migration**: When users sign in, localStorage data automatically migrates to database

### **Features Implemented**

#### **Saved Creators**
- 💾 Save any Instagram creator to your personal list
- ❤️ Quick access with heart icons
- 🗑️ Easy removal with X buttons
- 🔄 Cross-device sync when signed in
- 📱 Mobile responsive interface

#### **Saved Reels**
- 🔖 Bookmark any reel from search results
- 📝 Add notes and recipe information
- 🏷️ Tag reels for organization
- 📊 View engagement metrics
- 🔍 Search through saved reels

## 🎯 **User Experience**

### **For Guest Users (Not Signed In)**
1. Search for creators and save them locally
2. Browse and bookmark reels locally
3. Get prompted to sign in for cross-device sync
4. All local data preserved and migrated upon sign-in

### **For Authenticated Users**
1. All data automatically synced to database
2. Access saved content across all devices
3. Rich creator profiles with verification badges
4. Advanced filtering and search capabilities

## 🔒 **Security & Privacy**

- **Row Level Security (RLS)** enabled on all tables
- Users can only access their own data
- Secure user authentication via Clerk
- GDPR compliant data handling
- Automatic cleanup when users delete accounts

## 📈 **Benefits**

### **For Users**
- 🌟 Never lose saved creators or reels
- 🔄 Seamless sync across devices  
- ⚡ Lightning-fast access to favorites
- 🎨 Beautiful, intuitive interface

### **For You (Developer)**
- 📊 Rich analytics on popular creators
- 👥 User engagement metrics
- 🔧 Easy to extend and modify
- 🏗️ Scalable architecture

## 🚀 **Next Steps**

1. **Run the SQL migrations** in your Supabase dashboard
2. **Test the functionality** by:
   - Saving creators while signed out
   - Signing in and watching data migrate
   - Testing cross-device sync
3. **Optional Enhancements**:
   - Add creator analytics
   - Implement creator categories
   - Add creator recommendation engine

## 🎉 **You're All Set!**

Your users can now:
- ✅ Save favorite creators permanently
- ✅ Access saved content across devices
- ✅ Never lose their curated lists
- ✅ Enjoy a seamless, professional experience

The system gracefully handles both authenticated and guest users, ensuring nobody loses their data while encouraging sign-ups for the full experience! 