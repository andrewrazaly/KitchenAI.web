import type { SupabaseClient } from '@supabase/supabase-js';
import type { SavedReel } from '../../feature_import_instagram/lib/saved-reels-service';

export interface Collection {
  id: string;
  user_id?: string;
  name: string;
  description?: string;
  recipe_count: number;
  image_url?: string;
  is_private: boolean;
  created_at: string;
  updated_at: string;
}

interface CollectionRow {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  recipe_count: number;
  image_url?: string;
  is_private: boolean;
  created_at: string;
  updated_at: string;
}

interface CollectionRecipeRow {
  id: string;
  collection_id: string;
  recipe_id: string;
  recipe_type: string;
  added_at: string;
}

const STORAGE_KEY = 'kitchenai_collections';
const COLLECTION_RECIPES_KEY = 'kitchenai_collection_recipes';

function saveToLocalStorage(collections: Collection[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(collections));
  } catch (error) {
    console.error('Failed to save collections to localStorage:', error);
  }
}

function getFromLocalStorage(): Collection[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to parse collections from localStorage:', error);
    return [];
  }
}

function saveCollectionRecipesToLocalStorage(relationships: CollectionRecipeRow[]) {
  try {
    localStorage.setItem(COLLECTION_RECIPES_KEY, JSON.stringify(relationships));
  } catch (error) {
    console.error('Failed to save collection recipes to localStorage:', error);
  }
}

function getCollectionRecipesFromLocalStorage(): CollectionRecipeRow[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(COLLECTION_RECIPES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to parse collection recipes from localStorage:', error);
    return [];
  }
}

function mapCollectionRow(item: CollectionRow): Collection {
  return {
    id: item.id,
    user_id: item.user_id,
    name: item.name,
    description: item.description,
    recipe_count: item.recipe_count,
    image_url: item.image_url,
    is_private: item.is_private,
    created_at: item.created_at,
    updated_at: item.updated_at
  };
}

export async function getUserCollections(supabase?: SupabaseClient): Promise<Collection[]> {
  if (!supabase) {
    return getFromLocalStorage();
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return getFromLocalStorage();
    }

    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (data && data.length > 0) {
      return (data as CollectionRow[]).map(mapCollectionRow);
    }

    return getFromLocalStorage();
  } catch (error) {
    console.warn('Falling back to localStorage:', error);
    return getFromLocalStorage();
  }
}

export async function createCollection(
  collection: {
    name: string;
    description?: string;
    is_private: boolean;
  },
  supabase?: SupabaseClient
): Promise<Collection> {
  const newCollection: Collection = {
    id: Date.now().toString(),
    name: collection.name,
    description: collection.description,
    recipe_count: 0,
    image_url: '/lemon.svg',
    is_private: collection.is_private,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  if (!supabase) {
    const collections = getFromLocalStorage();
    collections.unshift(newCollection);
    saveToLocalStorage(collections);
    return newCollection;
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('collections')
      .insert({
        user_id: session.user.id,
        name: collection.name,
        description: collection.description,
        recipe_count: 0,
        image_url: '/lemon.svg',
        is_private: collection.is_private
      })
      .select()
      .single();

    if (error) throw error;

    return mapCollectionRow(data as CollectionRow);
  } catch (error) {
    console.warn('Falling back to localStorage:', error);
    const collections = getFromLocalStorage();
    collections.unshift(newCollection);
    saveToLocalStorage(collections);
    return newCollection;
  }
}

export async function getCollectionById(
  collectionId: string,
  supabase?: SupabaseClient
): Promise<Collection | null> {
  if (!supabase) {
    const collections = getFromLocalStorage();
    return collections.find(c => c.id === collectionId) || null;
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      const collections = getFromLocalStorage();
      return collections.find(c => c.id === collectionId) || null;
    }

    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .eq('id', collectionId)
      .eq('user_id', session.user.id)
      .single();

    if (error) {
      const collections = getFromLocalStorage();
      return collections.find(c => c.id === collectionId) || null;
    }

    return mapCollectionRow(data as CollectionRow);
  } catch (error) {
    console.warn('Falling back to localStorage:', error);
    const collections = getFromLocalStorage();
    return collections.find(c => c.id === collectionId) || null;
  }
}

export async function getRecipesInCollection(
  collectionId: string,
  supabase?: SupabaseClient
): Promise<string[]> {
  if (!supabase) {
    const relationships = getCollectionRecipesFromLocalStorage();
    return relationships
      .filter(rel => rel.collection_id === collectionId)
      .map(rel => rel.recipe_id);
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      const relationships = getCollectionRecipesFromLocalStorage();
      return relationships
        .filter(rel => rel.collection_id === collectionId)
        .map(rel => rel.recipe_id);
    }

    const { data, error } = await supabase
      .from('collection_recipes')
      .select('recipe_id')
      .eq('collection_id', collectionId);

    if (error) {
      const relationships = getCollectionRecipesFromLocalStorage();
      return relationships
        .filter(rel => rel.collection_id === collectionId)
        .map(rel => rel.recipe_id);
    }

    return data.map(item => item.recipe_id);
  } catch (error) {
    console.warn('Falling back to localStorage:', error);
    const relationships = getCollectionRecipesFromLocalStorage();
    return relationships
      .filter(rel => rel.collection_id === collectionId)
      .map(rel => rel.recipe_id);
  }
}

export async function addRecipeToCollection(
  collectionId: string,
  recipeId: string,
  supabase?: SupabaseClient
): Promise<void> {
  if (!supabase) {
    const relationships = getCollectionRecipesFromLocalStorage();
    const newRelationship: CollectionRecipeRow = {
      id: Date.now().toString(),
      collection_id: collectionId,
      recipe_id: recipeId,
      recipe_type: 'saved_reel',
      added_at: new Date().toISOString()
    };
    
    // Check if relationship already exists
    const exists = relationships.some(
      rel => rel.collection_id === collectionId && rel.recipe_id === recipeId
    );
    
    if (!exists) {
      relationships.push(newRelationship);
      saveCollectionRecipesToLocalStorage(relationships);
      
      // Update collection recipe count
      const collections = getFromLocalStorage();
      const collection = collections.find(c => c.id === collectionId);
      if (collection) {
        collection.recipe_count += 1;
        saveToLocalStorage(collections);
      }
    }
    return;
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    // Check if recipe is already in collection
    const { data: existing } = await supabase
      .from('collection_recipes')
      .select('id')
      .eq('collection_id', collectionId)
      .eq('recipe_id', recipeId)
      .single();

    if (existing) {
      return; // Already exists
    }

    // Add recipe to collection
    const { error } = await supabase
      .from('collection_recipes')
      .insert({
        collection_id: collectionId,
        recipe_id: recipeId,
        recipe_type: 'saved_reel'
      });

    if (error) throw error;

    // Update collection recipe count
    const { error: countError } = await supabase.rpc('increment_collection_recipe_count', {
      collection_id: collectionId
    });

    if (countError) {
      console.warn('Failed to update recipe count:', countError);
    }
  } catch (error) {
    console.warn('Falling back to localStorage:', error);
    // Fallback to localStorage
    const relationships = getCollectionRecipesFromLocalStorage();
    const newRelationship: CollectionRecipeRow = {
      id: Date.now().toString(),
      collection_id: collectionId,
      recipe_id: recipeId,
      recipe_type: 'saved_reel',
      added_at: new Date().toISOString()
    };
    
    const exists = relationships.some(
      rel => rel.collection_id === collectionId && rel.recipe_id === recipeId
    );
    
    if (!exists) {
      relationships.push(newRelationship);
      saveCollectionRecipesToLocalStorage(relationships);
      
      const collections = getFromLocalStorage();
      const collection = collections.find(c => c.id === collectionId);
      if (collection) {
        collection.recipe_count += 1;
        saveToLocalStorage(collections);
      }
    }
  }
}

export async function removeRecipeFromCollection(
  collectionId: string,
  recipeId: string,
  supabase?: SupabaseClient
): Promise<void> {
  if (!supabase) {
    const relationships = getCollectionRecipesFromLocalStorage();
    const filtered = relationships.filter(
      rel => !(rel.collection_id === collectionId && rel.recipe_id === recipeId)
    );
    
    if (filtered.length !== relationships.length) {
      saveCollectionRecipesToLocalStorage(filtered);
      
      const collections = getFromLocalStorage();
      const collection = collections.find(c => c.id === collectionId);
      if (collection && collection.recipe_count > 0) {
        collection.recipe_count -= 1;
        saveToLocalStorage(collections);
      }
    }
    return;
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('collection_recipes')
      .delete()
      .eq('collection_id', collectionId)
      .eq('recipe_id', recipeId);

    if (error) throw error;

    // Update collection recipe count
    const { error: countError } = await supabase.rpc('decrement_collection_recipe_count', {
      collection_id: collectionId
    });

    if (countError) {
      console.warn('Failed to update recipe count:', countError);
    }
  } catch (error) {
    console.warn('Falling back to localStorage:', error);
    const relationships = getCollectionRecipesFromLocalStorage();
    const filtered = relationships.filter(
      rel => !(rel.collection_id === collectionId && rel.recipe_id === recipeId)
    );
    
    if (filtered.length !== relationships.length) {
      saveCollectionRecipesToLocalStorage(filtered);
      
      const collections = getFromLocalStorage();
      const collection = collections.find(c => c.id === collectionId);
      if (collection && collection.recipe_count > 0) {
        collection.recipe_count -= 1;
        saveToLocalStorage(collections);
      }
    }
  }
}

export async function updateCollection(
  collectionId: string,
  updates: Partial<Pick<Collection, 'name' | 'description' | 'is_private'>>,
  supabase?: SupabaseClient
): Promise<Collection | null> {
  if (!supabase) {
    const collections = getFromLocalStorage();
    const collection = collections.find(c => c.id === collectionId);
    if (collection) {
      Object.assign(collection, updates, { updated_at: new Date().toISOString() });
      saveToLocalStorage(collections);
      return collection;
    }
    return null;
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('collections')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', collectionId)
      .eq('user_id', session.user.id)
      .select()
      .single();

    if (error) throw error;

    return mapCollectionRow(data as CollectionRow);
  } catch (error) {
    console.warn('Falling back to localStorage:', error);
    const collections = getFromLocalStorage();
    const collection = collections.find(c => c.id === collectionId);
    if (collection) {
      Object.assign(collection, updates, { updated_at: new Date().toISOString() });
      saveToLocalStorage(collections);
      return collection;
    }
    return null;
  }
}

export async function deleteCollection(
  collectionId: string,
  supabase?: SupabaseClient
): Promise<void> {
  if (!supabase) {
    const collections = getFromLocalStorage();
    const filtered = collections.filter(c => c.id !== collectionId);
    saveToLocalStorage(filtered);
    
    // Also remove all collection-recipe relationships
    const relationships = getCollectionRecipesFromLocalStorage();
    const filteredRelationships = relationships.filter(rel => rel.collection_id !== collectionId);
    saveCollectionRecipesToLocalStorage(filteredRelationships);
    return;
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('collections')
      .delete()
      .eq('id', collectionId)
      .eq('user_id', session.user.id);

    if (error) throw error;
  } catch (error) {
    console.warn('Falling back to localStorage:', error);
    const collections = getFromLocalStorage();
    const filtered = collections.filter(c => c.id !== collectionId);
    saveToLocalStorage(filtered);
    
    const relationships = getCollectionRecipesFromLocalStorage();
    const filteredRelationships = relationships.filter(rel => rel.collection_id !== collectionId);
    saveCollectionRecipesToLocalStorage(filteredRelationships);
  }
} 