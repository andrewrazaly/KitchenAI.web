import type { SupabaseClient } from '@supabase/supabase-js';

export interface SavedCreator {
  id?: string;
  creator_username: string;
  creator_display_name?: string;
  creator_profile_pic_url?: string;
  creator_follower_count?: number;
  creator_bio?: string;
  is_verified?: boolean;
  saved_at?: string;
}

interface SavedCreatorRow {
  id: string;
  user_id: string;
  creator_username: string;
  creator_display_name?: string;
  creator_profile_pic_url?: string;
  creator_follower_count?: number;
  creator_bio?: string;
  is_verified: boolean;
  saved_at: string;
  created_at: string;
  updated_at: string;
}

// LocalStorage fallback key
const SAVED_CREATORS_KEY = 'kitchenai_saved_creators';

// Helper functions for localStorage fallback
function getFromLocalStorage(): string[] {
  try {
    const saved = localStorage.getItem(SAVED_CREATORS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return [];
  }
}

function saveToLocalStorage(creators: string[]): void {
  try {
    localStorage.setItem(SAVED_CREATORS_KEY, JSON.stringify(creators));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

// Database operations with localStorage fallback
export async function getSavedCreators(supabase?: SupabaseClient): Promise<SavedCreator[]> {
  if (!supabase) {
    // Fallback to localStorage
    const creatorUsernames = getFromLocalStorage();
    return creatorUsernames.map(username => ({
      creator_username: username,
      saved_at: new Date().toISOString()
    }));
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      // User not authenticated, use localStorage
      const creatorUsernames = getFromLocalStorage();
      return creatorUsernames.map(username => ({
        creator_username: username,
        saved_at: new Date().toISOString()
      }));
    }

    const { data, error } = await supabase
      .from('saved_creators')
      .select('*')
      .eq('user_id', session.user.id)
      .order('saved_at', { ascending: false });

    if (error) throw error;

    return (data as SavedCreatorRow[]).map(row => ({
      id: row.id,
      creator_username: row.creator_username,
      creator_display_name: row.creator_display_name,
      creator_profile_pic_url: row.creator_profile_pic_url,
      creator_follower_count: row.creator_follower_count,
      creator_bio: row.creator_bio,
      is_verified: row.is_verified,
      saved_at: row.saved_at
    }));
  } catch (error) {
    console.warn('Database error, falling back to localStorage:', error);
    // Fallback to localStorage
    const creatorUsernames = getFromLocalStorage();
    return creatorUsernames.map(username => ({
      creator_username: username,
      saved_at: new Date().toISOString()
    }));
  }
}

export async function saveCreator(creator: SavedCreator, supabase?: SupabaseClient): Promise<SavedCreator> {
  const creatorData = {
    creator_username: creator.creator_username,
    creator_display_name: creator.creator_display_name,
    creator_profile_pic_url: creator.creator_profile_pic_url,
    creator_follower_count: creator.creator_follower_count,
    creator_bio: creator.creator_bio,
    is_verified: creator.is_verified || false,
    saved_at: new Date().toISOString()
  };

  if (!supabase) {
    // Fallback to localStorage
    const savedCreators = getFromLocalStorage();
    if (!savedCreators.includes(creator.creator_username)) {
      savedCreators.push(creator.creator_username);
      saveToLocalStorage(savedCreators);
    }
    return creatorData;
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      // User not authenticated, use localStorage
      const savedCreators = getFromLocalStorage();
      if (!savedCreators.includes(creator.creator_username)) {
        savedCreators.push(creator.creator_username);
        saveToLocalStorage(savedCreators);
      }
      return creatorData;
    }

    const { data, error } = await supabase
      .from('saved_creators')
      .insert({
        user_id: session.user.id,
        creator_username: creator.creator_username,
        creator_display_name: creator.creator_display_name,
        creator_profile_pic_url: creator.creator_profile_pic_url,
        creator_follower_count: creator.creator_follower_count,
        creator_bio: creator.creator_bio,
        is_verified: creator.is_verified || false
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        throw new Error('Creator already saved');
      }
      throw error;
    }

    return {
      id: data.id,
      creator_username: data.creator_username,
      creator_display_name: data.creator_display_name,
      creator_profile_pic_url: data.creator_profile_pic_url,
      creator_follower_count: data.creator_follower_count,
      creator_bio: data.creator_bio,
      is_verified: data.is_verified,
      saved_at: data.saved_at
    };
  } catch (error) {
    console.warn('Database error, falling back to localStorage:', error);
    // Fallback to localStorage
    const savedCreators = getFromLocalStorage();
    if (!savedCreators.includes(creator.creator_username)) {
      savedCreators.push(creator.creator_username);
      saveToLocalStorage(savedCreators);
    }
    return creatorData;
  }
}

export async function unsaveCreator(creatorUsername: string, supabase?: SupabaseClient): Promise<void> {
  if (!supabase) {
    // Fallback to localStorage
    const savedCreators = getFromLocalStorage();
    const filtered = savedCreators.filter(username => username !== creatorUsername);
    saveToLocalStorage(filtered);
    return;
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      // User not authenticated, use localStorage
      const savedCreators = getFromLocalStorage();
      const filtered = savedCreators.filter(username => username !== creatorUsername);
      saveToLocalStorage(filtered);
      return;
    }

    const { error } = await supabase
      .from('saved_creators')
      .delete()
      .eq('user_id', session.user.id)
      .eq('creator_username', creatorUsername);

    if (error) throw error;
  } catch (error) {
    console.warn('Database error, falling back to localStorage:', error);
    // Fallback to localStorage
    const savedCreators = getFromLocalStorage();
    const filtered = savedCreators.filter(username => username !== creatorUsername);
    saveToLocalStorage(filtered);
  }
}

export async function isCreatorSaved(creatorUsername: string, supabase?: SupabaseClient): Promise<boolean> {
  if (!supabase) {
    // Fallback to localStorage
    const savedCreators = getFromLocalStorage();
    return savedCreators.includes(creatorUsername);
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      // User not authenticated, use localStorage
      const savedCreators = getFromLocalStorage();
      return savedCreators.includes(creatorUsername);
    }

    const { data, error } = await supabase
      .from('saved_creators')
      .select('id')
      .eq('user_id', session.user.id)
      .eq('creator_username', creatorUsername)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      throw error;
    }

    return !!data;
  } catch (error) {
    console.warn('Database error, falling back to localStorage:', error);
    // Fallback to localStorage
    const savedCreators = getFromLocalStorage();
    return savedCreators.includes(creatorUsername);
  }
}

// Migration helper: sync localStorage data to database when user signs in
export async function migrateLocalStorageToDatabase(supabase: SupabaseClient): Promise<void> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const localCreators = getFromLocalStorage();
    if (localCreators.length === 0) return;

    // Get existing saved creators from database
    const existingCreators = await getSavedCreators(supabase);
    const existingUsernames = existingCreators.map(c => c.creator_username);

    // Save new creators from localStorage to database
    const newCreators = localCreators.filter(username => !existingUsernames.includes(username));
    
    for (const username of newCreators) {
      try {
        await saveCreator({ creator_username: username }, supabase);
      } catch (error) {
        console.warn(`Failed to migrate creator ${username}:`, error);
      }
    }

    // Clear localStorage after successful migration
    if (newCreators.length > 0) {
      localStorage.removeItem(SAVED_CREATORS_KEY);
      console.log(`Migrated ${newCreators.length} creators from localStorage to database`);
    }
  } catch (error) {
    console.error('Error migrating localStorage data:', error);
  }
} 