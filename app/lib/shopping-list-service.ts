import { getSavedReels, SavedReel } from '../../feature_import_instagram/lib/saved-reels-service';
import { extractIngredientsFromText, createShoppingListItems, filterAgainstInventory, organizeByStoreSection, ShoppingListItem, RecipeAnalysis } from './ai-ingredient-extractor';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { ParsedIngredient } from './ingredient-parser-service';

export interface GeneratedShoppingList {
  id: string;
  items: ShoppingListItem[];
  organizedItems: Record<string, ShoppingListItem[]>;
  sourceReels: Array<{
    reelId: string;
    title: string;
    creator: string;
    analysis: RecipeAnalysis;
  }>;
  totalItems: number;
  estimatedCost?: number;
  generatedAt: number;
  confidence: number;
  totalExtracted: number;
  removedFromInventory: number;
  removedItems: string[];
}

export interface InventoryItem {
  name: string;
  quantity: number;
  unit?: string;
  expiryDate?: string;
}

export interface ShoppingList {
  id: string;
  name: string;
  items: ShoppingListItem[];
  created_at: string;
}

// Get saved reels from the past X days
export async function getRecentSavedReels(
  days: number = 3,
  supabase?: SupabaseClient
): Promise<SavedReel[]> {
  const allReels = await getSavedReels(supabase);
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  const cutoffTime = cutoffDate.getTime();

  const recentReels = allReels.filter(reel => reel.savedAt > cutoffTime);
  
  // If no recent reels found, return mock data for demo
  if (recentReels.length === 0) {
    console.log('No recent saved reels found, using mock data for demo');
    return getMockSavedReels().filter(reel => reel.savedAt > cutoffTime);
  }
  
  return recentReels;
}

// Generate shopping list from recent reels
export async function generateShoppingListFromReels(
  days: number = 3,
  inventoryItems: InventoryItem[] = [],
  supabase?: SupabaseClient
): Promise<GeneratedShoppingList> {
  try {
    // 1. Get recent saved reels
    const recentReels = await getRecentSavedReels(days, supabase);
    
    if (recentReels.length === 0) {
      throw new Error(`No saved reels found in the past ${days} days`);
    }

    // 2. Extract ingredients from each reel
    const reelAnalyses: Array<{
      reelId: string;
      title: string;
      creator: string;
      analysis: RecipeAnalysis;
    }> = [];

    let allIngredients: ShoppingListItem[] = [];
    let totalConfidence = 0;

    for (const reel of recentReels) {
      try {
        // Use caption text for ingredient extraction
        const text = reel.caption_text || '';
        if (!text.trim()) continue;

        const analysis = await extractIngredientsFromText(text);
        
        if (analysis.ingredients.length > 0) {
          const shoppingItems = createShoppingListItems(analysis.ingredients);
          allIngredients.push(...shoppingItems);
          
          reelAnalyses.push({
            reelId: reel.id,
            title: getReelTitle(reel),
            creator: reel.user.username,
            analysis
          });

          totalConfidence += analysis.confidence;
        }
      } catch (error) {
        console.warn(`Failed to process reel ${reel.id}:`, error);
      }
    }

    if (allIngredients.length === 0) {
      throw new Error('No ingredients could be extracted from the saved reels');
    }

    // 3. Remove duplicates by standardized name
    const uniqueIngredients = removeDuplicateIngredients(allIngredients);

    // 4. Filter against existing inventory
    const inventoryResult = filterAgainstInventory(uniqueIngredients, inventoryItems);

    // 5. Organize by store sections
    const organizedItems = organizeByStoreSection(inventoryResult.filteredItems);

    // 6. Calculate average confidence
    const avgConfidence = reelAnalyses.length > 0 ? totalConfidence / reelAnalyses.length : 0;

    const shoppingList: GeneratedShoppingList = {
      id: `shopping-list-${Date.now()}`,
      items: inventoryResult.filteredItems,
      organizedItems,
      sourceReels: reelAnalyses,
      totalItems: inventoryResult.filteredItems.length,
      generatedAt: Date.now(),
      confidence: avgConfidence,
      totalExtracted: uniqueIngredients.length,
      removedFromInventory: inventoryResult.removedCount,
      removedItems: inventoryResult.removedItems
    };

    return shoppingList;
  } catch (error) {
    console.error('Error generating shopping list:', error);
    throw error;
  }
}

// Remove duplicate ingredients based on standardized names
function removeDuplicateIngredients(ingredients: ShoppingListItem[]): ShoppingListItem[] {
  const seen = new Map<string, ShoppingListItem>();
  
  ingredients.forEach(ingredient => {
    const key = ingredient.standardizedName || ingredient.name.toLowerCase();
    
    if (!seen.has(key)) {
      seen.set(key, ingredient);
    } else {
      // If duplicate, prefer the one with quantity information
      const existing = seen.get(key)!;
      if (ingredient.quantity && !existing.quantity) {
        seen.set(key, ingredient);
      }
    }
  });
  
  return Array.from(seen.values());
}

// Extract a title from reel data
function getReelTitle(reel: SavedReel): string {
  // Try to get a meaningful title from the caption
  const caption = reel.caption_text || '';
  const firstLine = caption.split('\n')[0];
  
  if (firstLine.length > 5 && firstLine.length < 60) {
    return firstLine;
  }
  
  // Fallback to username + timestamp
  return `Recipe from ${reel.user.username}`;
}

// Save generated shopping list
export async function saveShoppingList(
  shoppingList: GeneratedShoppingList,
  supabase?: SupabaseClient
): Promise<void> {
  // For now, save to localStorage
  // In production, this would save to Supabase
  try {
    const existingLists = getStoredShoppingLists();
    existingLists.push(shoppingList);
    
    // Keep only the last 10 lists
    const recentLists = existingLists.slice(-10);
    localStorage.setItem('generated-shopping-lists', JSON.stringify(recentLists));
  } catch (error) {
    console.error('Error saving shopping list:', error);
  }
}

// Get previously generated shopping lists
export function getStoredShoppingLists(): GeneratedShoppingList[] {
  try {
    const stored = localStorage.getItem('generated-shopping-lists');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Update shopping list item (check/uncheck, edit, etc.)
export async function updateShoppingListItem(
  listId: string,
  itemId: string,
  updates: Partial<ShoppingListItem>
): Promise<void> {
  try {
    const lists = getStoredShoppingLists();
    const listIndex = lists.findIndex(list => list.id === listId);
    
    if (listIndex === -1) {
      throw new Error('Shopping list not found');
    }
    
    const list = lists[listIndex];
    const itemIndex = list.items.findIndex(item => item.id === itemId);
    
    if (itemIndex === -1) {
      throw new Error('Item not found in shopping list');
    }
    
    // Update the item
    list.items[itemIndex] = { ...list.items[itemIndex], ...updates };
    
    // Re-organize by store sections
    list.organizedItems = organizeByStoreSection(list.items);
    
    // Save back to storage
    localStorage.setItem('generated-shopping-lists', JSON.stringify(lists));
  } catch (error) {
    console.error('Error updating shopping list item:', error);
    throw error;
  }
}

// Delete a shopping list
export async function deleteShoppingList(listId: string): Promise<void> {
  try {
    const lists = getStoredShoppingLists();
    const filteredLists = lists.filter(list => list.id !== listId);
    localStorage.setItem('generated-shopping-lists', JSON.stringify(filteredLists));
  } catch (error) {
    console.error('Error deleting shopping list:', error);
    throw error;
  }
}

// Get mock inventory items for demo
export function getMockInventoryItems(): InventoryItem[] {
  return [
    { name: 'milk', quantity: 1, unit: 'gallon' },
    { name: 'bread', quantity: 1, unit: 'loaf' },
    { name: 'eggs', quantity: 12, unit: 'pieces' },
    { name: 'butter', quantity: 1, unit: 'stick' },
    { name: 'onion', quantity: 2, unit: 'pieces' },
    { name: 'garlic', quantity: 1, unit: 'bulb' },
    { name: 'olive oil', quantity: 1, unit: 'bottle' },
    { name: 'salt', quantity: 1, unit: 'container' },
    { name: 'pepper', quantity: 1, unit: 'container' }
  ];
}

// Get mock saved reels for demo when no real data exists
export function getMockSavedReels(): SavedReel[] {
  const now = Date.now();
  const yesterday = now - (24 * 60 * 60 * 1000);
  const twoDaysAgo = now - (2 * 24 * 60 * 60 * 1000);

  return [
    {
      id: 'mock-reel-1',
      pk: 'mock-1',
      taken_at: Math.floor(yesterday / 1000),
      media_type: 2,
      code: 'mock1',
      caption_text: 'Quick chicken pasta! Ingredients: 1 lb chicken breast, 12 oz pasta, 2 tbsp olive oil, 3 cloves garlic, 1 cup parmesan cheese, salt, black pepper. Perfect for busy weeknights! 🍝',
      original_width: 720,
      original_height: 1280,
      user: {
        pk: 'chef-marco',
        username: 'chefmarco_official',
        full_name: 'Chef Marco',
        profile_pic_url: '/lemon.svg'
      },
      savedAt: yesterday
    },
    {
      id: 'mock-reel-2', 
      pk: 'mock-2',
      taken_at: Math.floor(twoDaysAgo / 1000),
      media_type: 2,
      code: 'mock2',
      caption_text: '5-minute avocado toast recipe! You need: 2 ripe avocados, 4 slices sourdough bread, 1 lime, red pepper flakes, salt, 1 tbsp olive oil. So healthy and delicious! 🥑🍞',
      original_width: 720,
      original_height: 1280,
      user: {
        pk: 'healthy-chef',
        username: 'healthy_chef',
        full_name: 'Healthy Chef',
        profile_pic_url: '/lemon.svg'
      },
      savedAt: twoDaysAgo
    },
    {
      id: 'mock-reel-3',
      pk: 'mock-3', 
      taken_at: Math.floor(now / 1000),
      media_type: 2,
      code: 'mock3',
      caption_text: 'Amazing stir fry tonight! Grab these ingredients: 3 cups mixed vegetables, 3 tbsp soy sauce, 2 cloves garlic, 1 tbsp fresh ginger, 2 tbsp vegetable oil, 2 cups jasmine rice. Ready in 15 minutes! 🥢',
      original_width: 720,
      original_height: 1280,
      user: {
        pk: 'asian-kitchen',
        username: 'asian_kitchen',
        full_name: 'Asian Kitchen',
        profile_pic_url: '/lemon.svg'
      },
      savedAt: now
    }
  ];
}

const STORAGE_KEY = 'kitchenai_shopping_lists';

function getShoppingLists(): ShoppingList[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveShoppingLists(lists: ShoppingList[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
  } catch (error) {
    console.error('Failed to save shopping lists:', error);
  }
}

export function getUserShoppingLists(): ShoppingList[] {
  return getShoppingLists();
}

export function createShoppingList(name: string, items: ShoppingListItem[] = []): ShoppingList {
  const newList: ShoppingList = {
    id: Date.now().toString(),
    name,
    items,
    created_at: new Date().toISOString()
  };

  const lists = getShoppingLists();
  lists.unshift(newList);
  saveShoppingLists(lists);
  
  return newList;
}

export function addItemsToShoppingList(listId: string, items: ShoppingListItem[]): void {
  const lists = getShoppingLists();
  const listIndex = lists.findIndex(list => list.id === listId);
  
  if (listIndex === -1) return;

  const existingNames = new Set(lists[listIndex].items.map(item => item.name.toLowerCase()));
  const newItems = items.filter(item => !existingNames.has(item.name.toLowerCase()));
  
  lists[listIndex].items.push(...newItems);
  saveShoppingLists(lists);
}

export function getDefaultShoppingList(): ShoppingList {
  return {
    id: 'default-list',
    name: 'My Shopping List',
    items: [],
    created_at: new Date().toISOString()
  };
}

export function convertIngredientsToShoppingItems(
  ingredients: ParsedIngredient[],
  recipeTitle: string
): ShoppingListItem[] {
  return ingredients
    .filter(ingredient => ingredient.selected)
    .map(ingredient => ({
      id: `shopping-${ingredient.id}`,
      name: ingredient.name,
      amount: ingredient.amount,
      unit: ingredient.unit,
      emoji: ingredient.emoji,
      category: ingredient.category,
      checked: false,
      recipeSource: recipeTitle
    }));
} 