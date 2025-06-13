import { ReelItem } from '../types/reels';
import { useSupabase } from '../../app/hooks/useSupabase';
import type { SupabaseClient } from '@supabase/supabase-js';

interface SavedReelRow {
  id: string;
  user_id: string;
  reel_id: string;
  reel_data: string;
  notes?: string;
  recipe_id?: string;
  saved_at: string;
  created_at: string;
  updated_at: string;
  recipes?: {
    title?: string;
    description?: string;
    ingredients?: string[];
    instructions?: string[];
    cook_time?: number;
    servings?: number;
    difficulty?: 'easy' | 'medium' | 'hard';
    cuisine?: string;
    tags?: string[];
  };
}

export interface SavedReel extends ReelItem {
  savedAt: number;
  notes?: string;
  recipeId?: string;
  recipeName?: string;
  recipeDescription?: string;
  ingredients?: string[];
  instructions?: string[];
  cookingTime?: string;
  servings?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  cuisine?: string;
  tags?: string[];
}

const STORAGE_KEY = 'saved_reels';

function getFromLocalStorage(): SavedReel[] {
  if (typeof window === 'undefined') {
    return [];
  }
  
  const stored = localStorage.getItem(STORAGE_KEY);
  const parsed = stored ? JSON.parse(stored) : [];
  
  return parsed;
}

function saveToLocalStorage(reels: SavedReel[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reels));
}

function mapSavedReelRow(item: SavedReelRow): SavedReel {
  const reelData = JSON.parse(item.reel_data);
  return {
    ...reelData,
    savedAt: new Date(item.saved_at).getTime(),
    notes: item.notes,
    recipeId: item.recipe_id,
    recipeName: item.recipes?.title,
    recipeDescription: item.recipes?.description,
    ingredients: item.recipes?.ingredients,
    instructions: item.recipes?.instructions,
    cookingTime: item.recipes?.cook_time ? `${item.recipes.cook_time} minutes` : undefined,
    servings: item.recipes?.servings,
    difficulty: item.recipes?.difficulty,
    cuisine: item.recipes?.cuisine,
    tags: item.recipes?.tags
  };
}

export async function getSavedReels(supabase?: SupabaseClient): Promise<SavedReel[]> {
  if (!supabase) {
    // Fallback to localStorage when no supabase client
    const localData = getFromLocalStorage();
    return localData;
  }

  try {
    const { data, error } = await supabase
      .from('saved_reels')
      .select('*')
      .order('saved_at', { ascending: false });

    if (error) {
      throw error;
    }
    
    // If database has data, use it
    if (data && data.length > 0) {
      return (data as SavedReelRow[]).map(mapSavedReelRow);
    }
    
    // If database is empty, fall back to localStorage
    const localData = getFromLocalStorage();
    return localData;
    
  } catch (error) {
    const localData = getFromLocalStorage();
    return localData;
  }
}

export async function saveReel(reel: ReelItem, supabase?: SupabaseClient): Promise<SavedReel> {
  const savedReel: SavedReel = {
    ...reel,
    savedAt: Date.now()
  };

  if (!supabase) {
    // Fallback to localStorage when no supabase client
    const savedReels = getFromLocalStorage();
    if (savedReels.some(saved => saved.id === reel.id)) {
      throw new Error('Reel already saved');
    }
    savedReels.push(savedReel);
    saveToLocalStorage(savedReels);
    return savedReel;
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('saved_reels')
      .insert({
        user_id: session.user.id,
        reel_id: reel.id,
        reel_data: JSON.stringify(reel),
        saved_at: new Date().toISOString()
      });

    if (error) throw error;
  } catch (error) {
    console.warn('Falling back to localStorage:', error);
    // Fallback to localStorage
    const savedReels = getFromLocalStorage();
    if (savedReels.some(saved => saved.id === reel.id)) {
      throw new Error('Reel already saved');
    }
    savedReels.push(savedReel);
    saveToLocalStorage(savedReels);
  }
  
  return savedReel;
}

export async function unsaveReel(reelId: string, supabase?: SupabaseClient): Promise<void> {
  if (!supabase) {
    // Fallback to localStorage when no supabase client
    const savedReels = getFromLocalStorage();
    const filtered = savedReels.filter(reel => reel.id !== reelId);
    saveToLocalStorage(filtered);
    return;
  }

  try {
    const { error } = await supabase
      .from('saved_reels')
      .delete()
      .eq('reel_id', reelId);

    if (error) throw error;
  } catch (error) {
    console.warn('Falling back to localStorage:', error);
    // Fallback to localStorage
    const savedReels = getFromLocalStorage();
    const filtered = savedReels.filter(reel => reel.id !== reelId);
    saveToLocalStorage(filtered);
  }
}

export async function isSaved(reelId: string, supabase?: SupabaseClient): Promise<boolean> {
  if (!supabase) {
    // Fallback to localStorage when no supabase client
    const savedReels = getFromLocalStorage();
    return savedReels.some(reel => reel.id === reelId);
  }

  try {
    const { data, error } = await supabase
      .from('saved_reels')
      .select('id')
      .eq('reel_id', reelId)
      .single();

    if (error) throw error;
    return !!data;
  } catch (error) {
    console.warn('Falling back to localStorage:', error);
    // Fallback to localStorage
    const savedReels = getFromLocalStorage();
    return savedReels.some(reel => reel.id === reelId);
  }
}

export async function updateSavedReel(reelId: string, updates: Partial<SavedReel>, supabase?: SupabaseClient): Promise<SavedReel> {
  if (!supabase) {
    // Fallback to localStorage when no supabase client
    const savedReels = getFromLocalStorage();
    const index = savedReels.findIndex(reel => reel.id === reelId);
    
    if (index === -1) {
      throw new Error('Reel not found');
    }

    const updatedReel = {
      ...savedReels[index],
      ...updates
    };

    savedReels[index] = updatedReel;
    saveToLocalStorage(savedReels);
    
    return updatedReel;
  }

  try {
    const { data: existingReel, error: fetchError } = await supabase
      .from('saved_reels')
      .select('*')
      .eq('reel_id', reelId)
      .single();

    if (fetchError) throw fetchError;
    if (!existingReel) throw new Error('Reel not found');

    const updatedReelData = {
      ...JSON.parse((existingReel as SavedReelRow).reel_data),
      ...updates
    };

    const { error: updateError } = await supabase
      .from('saved_reels')
      .update({
        reel_data: JSON.stringify(updatedReelData),
        notes: updates.notes,
        recipe_id: updates.recipeId,
        updated_at: new Date().toISOString()
      })
      .eq('reel_id', reelId);

    if (updateError) throw updateError;

    return {
      ...updatedReelData,
      savedAt: new Date((existingReel as SavedReelRow).saved_at).getTime()
    };
  } catch (error) {
    console.warn('Falling back to localStorage:', error);
    // Fallback to localStorage
    const savedReels = getFromLocalStorage();
    const index = savedReels.findIndex(reel => reel.id === reelId);
    
    if (index === -1) {
      throw new Error('Reel not found');
    }

    const updatedReel = {
      ...savedReels[index],
      ...updates
    };

    savedReels[index] = updatedReel;
    saveToLocalStorage(savedReels);
    
    return updatedReel;
  }
}

export async function getReelsWithRecipes(supabase?: SupabaseClient): Promise<SavedReel[]> {
  if (!supabase) {
    // Fallback to localStorage when no supabase client
    return getFromLocalStorage().filter(reel => reel.recipeName);
  }

  try {
    const { data, error } = await supabase
      .from('saved_reels')
      .select('*')
      .not('recipe_id', 'is', null)
      .order('saved_at', { ascending: false });

    if (error) throw error;

    return (data as SavedReelRow[]).map(mapSavedReelRow);
  } catch (error) {
    console.warn('Falling back to localStorage:', error);
    // Fallback to localStorage
    return getFromLocalStorage().filter(reel => reel.recipeName);
  }
}

export async function getReelsByTag(tag: string, supabase?: SupabaseClient): Promise<SavedReel[]> {
  if (!supabase) {
    // Fallback to localStorage when no supabase client
    return getFromLocalStorage().filter(reel => 
      reel.tags?.includes(tag.toLowerCase())
    );
  }

  try {
    const { data, error } = await supabase
      .from('saved_reels')
      .select('*')
      .order('saved_at', { ascending: false });

    if (error) throw error;

    return (data as SavedReelRow[]).map(mapSavedReelRow);
  } catch (error) {
    console.warn('Falling back to localStorage:', error);
    // Fallback to localStorage
    return getFromLocalStorage().filter(reel => 
      reel.tags?.includes(tag.toLowerCase())
    );
  }
}

export async function getReelsByCuisine(cuisine: string, supabase?: SupabaseClient): Promise<SavedReel[]> {
  if (!supabase) {
    // Fallback to localStorage when no supabase client
    return getFromLocalStorage().filter(reel => 
      reel.cuisine?.toLowerCase() === cuisine.toLowerCase()
    );
  }

  try {
    const { data, error } = await supabase
      .from('saved_reels')
      .select('*')
      .order('saved_at', { ascending: false });

    if (error) throw error;

    return (data as SavedReelRow[]).map(mapSavedReelRow);
  } catch (error) {
    console.warn('Falling back to localStorage:', error);
    // Fallback to localStorage
    return getFromLocalStorage().filter(reel => 
      reel.cuisine?.toLowerCase() === cuisine.toLowerCase()
    );
  }
}

export async function addRecipeToReel(
  reelId: string, 
  recipe: {
    name: string;
    description?: string;
    ingredients?: string[];
    instructions?: string[];
    cookingTime?: string;
    servings?: number;
    difficulty?: 'easy' | 'medium' | 'hard';
    cuisine?: string;
    tags?: string[];
  },
  supabase?: SupabaseClient
): Promise<SavedReel> {
  return updateSavedReel(reelId, {
    recipeName: recipe.name,
    recipeDescription: recipe.description,
    ingredients: recipe.ingredients,
    instructions: recipe.instructions,
    cookingTime: recipe.cookingTime,
    servings: recipe.servings,
    difficulty: recipe.difficulty,
    cuisine: recipe.cuisine,
    tags: recipe.tags
  }, supabase);
}

// Migration helper: sync localStorage data to database when user signs in
export async function migrateLocalStorageToDatabase(supabase: SupabaseClient): Promise<void> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const localReels = getFromLocalStorage();
    if (localReels.length === 0) return;

    // Get existing saved reels from database
    const existingReels = await getSavedReels(supabase);
    const existingReelIds = existingReels.map(r => r.id);

    // Save new reels from localStorage to database
    const newReels = localReels.filter(reel => !existingReelIds.includes(reel.id));
    
    let migratedCount = 0;
    for (const reel of newReels) {
      try {
        const { error } = await supabase
          .from('saved_reels')
          .insert({
            user_id: session.user.id,
            reel_id: reel.id,
            reel_data: JSON.stringify(reel),
            saved_at: new Date(reel.savedAt).toISOString()
          });

        if (error) {
          console.warn(`Failed to migrate reel ${reel.id}:`, error);
        } else {
          migratedCount++;
        }
      } catch (error) {
        console.warn(`Failed to migrate reel ${reel.id}:`, error);
      }
    }

    // Clear localStorage after successful migration
    if (migratedCount > 0) {
      localStorage.removeItem(STORAGE_KEY);
      console.log(`Migrated ${migratedCount} reels from localStorage to database`);
    }
  } catch (error) {
    console.error('Error migrating saved reels localStorage data:', error);
  }
} 