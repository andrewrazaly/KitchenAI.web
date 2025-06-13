import type { SavedReel } from '../../feature_import_instagram/lib/saved-reels-service';

export interface ParsedIngredient {
  id: string;
  name: string;
  amount: string;
  unit: string;
  emoji: string;
  category: string;
  selected: boolean;
}

export interface ShoppingListItem {
  id: string;
  name: string;
  amount: string;
  unit: string;
  emoji: string;
  category: string;
  checked: boolean;
  recipeSource?: string;
}

// Common ingredient patterns for parsing
const INGREDIENT_PATTERNS = [
  // Pattern: "2 cups flour" or "1 cup sugar"
  /(\d+(?:\.\d+)?)\s*(cups?|cup|tbsp|tsp|tablespoons?|teaspoons?|oz|ounces?|lbs?|pounds?|g|grams?|kg|kilograms?|ml|l|liters?)\s+(.+)/gi,
  // Pattern: "1/2 cup milk" or "3/4 tsp salt"  
  /(\d+\/\d+)\s*(cups?|cup|tbsp|tsp|tablespoons?|teaspoons?|oz|ounces?|lbs?|pounds?|g|grams?|kg|kilograms?|ml|l|liters?)\s+(.+)/gi,
  // Pattern: "2 large eggs" or "3 medium onions"
  /(\d+)\s*(large|medium|small)?\s*(.+)/gi,
  // Pattern: "salt to taste" or "pepper as needed"
  /(salt|pepper|garlic|onion|oil|butter|sugar|flour)\s*(to taste|as needed)?/gi
];

const INGREDIENT_EMOJIS: Record<string, string> = {
  // Proteins
  'chicken': '🐔', 'beef': '🥩', 'pork': '🐷', 'fish': '🐟', 'salmon': '🐟',
  'eggs': '🥚', 'egg': '🥚', 'turkey': '🦃', 'bacon': '🥓', 'ham': '🍖',
  
  // Vegetables
  'onion': '🧅', 'onions': '🧅', 'garlic': '🧄', 'tomato': '🍅', 'tomatoes': '🍅',
  'potato': '🥔', 'potatoes': '🥔', 'carrot': '🥕', 'carrots': '🥕',
  'bell pepper': '🫑', 'peppers': '🫑', 'broccoli': '🥦', 'lettuce': '🥬',
  'spinach': '🥬', 'mushroom': '🍄', 'mushrooms': '🍄', 'corn': '🌽',
  
  // Fruits
  'apple': '🍎', 'apples': '🍎', 'banana': '🍌', 'bananas': '🍌',
  'lemon': '🍋', 'lemons': '🍋', 'lime': '🍋', 'orange': '🍊',
  'avocado': '🥑', 'avocados': '🥑', 'berries': '🫐', 'strawberry': '🍓',
  
  // Dairy
  'milk': '🥛', 'cheese': '🧀', 'butter': '🧈', 'cream': '🥛',
  'yogurt': '🥛', 'sour cream': '🥛',
  
  // Grains & Pantry
  'flour': '🌾', 'rice': '🍚', 'pasta': '🍝', 'bread': '🍞',
  'sugar': '🍬', 'salt': '🧂', 'pepper': '🫑', 'oil': '🫒',
  'olive oil': '🫒', 'honey': '🍯', 'vinegar': '🍶',
  
  // Herbs & Spices
  'basil': '🌿', 'oregano': '🌿', 'thyme': '🌿', 'rosemary': '🌿',
  'parsley': '🌿', 'cilantro': '🌿', 'dill': '🌿', 'ginger': '🫚',
  
  // Default
  'default': '🥄'
};

const INGREDIENT_CATEGORIES: Record<string, string> = {
  // Proteins
  'chicken': 'Meat & Seafood', 'beef': 'Meat & Seafood', 'pork': 'Meat & Seafood',
  'fish': 'Meat & Seafood', 'salmon': 'Meat & Seafood', 'eggs': 'Dairy & Eggs',
  'turkey': 'Meat & Seafood', 'bacon': 'Meat & Seafood', 'ham': 'Meat & Seafood',
  
  // Vegetables
  'onion': 'Produce', 'onions': 'Produce', 'garlic': 'Produce', 'tomato': 'Produce',
  'tomatoes': 'Produce', 'potato': 'Produce', 'potatoes': 'Produce',
  'carrot': 'Produce', 'carrots': 'Produce', 'bell pepper': 'Produce',
  'peppers': 'Produce', 'broccoli': 'Produce', 'lettuce': 'Produce',
  'spinach': 'Produce', 'mushroom': 'Produce', 'mushrooms': 'Produce', 'corn': 'Produce',
  
  // Fruits
  'apple': 'Produce', 'apples': 'Produce', 'banana': 'Produce', 'bananas': 'Produce',
  'lemon': 'Produce', 'lemons': 'Produce', 'lime': 'Produce', 'orange': 'Produce',
  'avocado': 'Produce', 'avocados': 'Produce', 'berries': 'Produce', 'strawberry': 'Produce',
  
  // Dairy
  'milk': 'Dairy & Eggs', 'cheese': 'Dairy & Eggs', 'butter': 'Dairy & Eggs',
  'cream': 'Dairy & Eggs', 'yogurt': 'Dairy & Eggs', 'sour cream': 'Dairy & Eggs',
  
  // Pantry
  'flour': 'Pantry', 'rice': 'Pantry', 'pasta': 'Pantry', 'bread': 'Bakery',
  'sugar': 'Pantry', 'salt': 'Pantry', 'pepper': 'Pantry', 'oil': 'Pantry',
  'olive oil': 'Pantry', 'honey': 'Pantry', 'vinegar': 'Pantry',
  
  // Herbs & Spices
  'basil': 'Pantry', 'oregano': 'Pantry', 'thyme': 'Pantry', 'rosemary': 'Pantry',
  'parsley': 'Produce', 'cilantro': 'Produce', 'dill': 'Produce', 'ginger': 'Produce'
};

function getIngredientEmoji(ingredient: string): string {
  const lowerIngredient = ingredient.toLowerCase();
  
  // Check for exact matches first
  if (INGREDIENT_EMOJIS[lowerIngredient]) {
    return INGREDIENT_EMOJIS[lowerIngredient];
  }
  
  // Check for partial matches
  for (const [key, emoji] of Object.entries(INGREDIENT_EMOJIS)) {
    if (lowerIngredient.includes(key)) {
      return emoji;
    }
  }
  
  return INGREDIENT_EMOJIS.default;
}

function getIngredientCategory(ingredient: string): string {
  const lowerIngredient = ingredient.toLowerCase();
  
  // Check for exact matches first
  if (INGREDIENT_CATEGORIES[lowerIngredient]) {
    return INGREDIENT_CATEGORIES[lowerIngredient];
  }
  
  // Check for partial matches
  for (const [key, category] of Object.entries(INGREDIENT_CATEGORIES)) {
    if (lowerIngredient.includes(key)) {
      return category;
    }
  }
  
  return 'Other';
}

function cleanIngredientName(ingredient: string): string {
  return ingredient
    .replace(/\s*\([^)]*\)/g, '') // Remove parentheses content
    .replace(/\s*,.*$/g, '') // Remove comma and everything after
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim();
}

export function parseIngredientsFromCaption(caption: string): ParsedIngredient[] {
  if (!caption) return [];
  
  const ingredients: ParsedIngredient[] = [];
  const foundIngredients = new Set<string>();
  
  // Split caption into lines and process each
  const lines = caption.split('\n').filter(line => line.trim());
  
  for (const line of lines) {
    // Skip lines that look like instructions or descriptions
    if (line.toLowerCase().includes('recipe') || 
        line.toLowerCase().includes('follow') || 
        line.toLowerCase().includes('step') ||
        line.toLowerCase().includes('min') ||
        line.startsWith('#') ||
        line.startsWith('@')) {
      continue;
    }
    
    // Try each pattern
    for (const pattern of INGREDIENT_PATTERNS) {
      pattern.lastIndex = 0; // Reset regex
      const matches = pattern.exec(line);
      
      if (matches) {
        const [, amount, unit, name] = matches;
        const cleanName = cleanIngredientName(name);
        
        // Avoid duplicates and very short/generic names
        if (cleanName.length > 2 && !foundIngredients.has(cleanName.toLowerCase())) {
          foundIngredients.add(cleanName.toLowerCase());
          
          ingredients.push({
            id: `ingredient-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: cleanName,
            amount: amount || '1',
            unit: unit || 'piece',
            emoji: getIngredientEmoji(cleanName),
            category: getIngredientCategory(cleanName),
            selected: true
          });
        }
        break; // Move to next line after finding a match
      }
    }
  }
  
  // If no structured ingredients found, try to extract common ingredients mentioned
  if (ingredients.length === 0) {
    const commonIngredients = [
      'chicken', 'beef', 'pork', 'fish', 'eggs', 'onion', 'garlic', 'tomato',
      'potato', 'carrot', 'pepper', 'cheese', 'milk', 'butter', 'oil', 'salt',
      'pepper', 'flour', 'sugar', 'rice', 'pasta'
    ];
    
    for (const ingredient of commonIngredients) {
      if (caption.toLowerCase().includes(ingredient) && !foundIngredients.has(ingredient)) {
        foundIngredients.add(ingredient);
        
        ingredients.push({
          id: `ingredient-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: ingredient,
          amount: '1',
          unit: 'piece',
          emoji: getIngredientEmoji(ingredient),
          category: getIngredientCategory(ingredient),
          selected: true
        });
      }
    }
  }
  
  return ingredients;
}

export function parseIngredientsFromReel(reel: SavedReel): ParsedIngredient[] {
  const caption = reel.caption_text || '';
  const ingredients: ParsedIngredient[] = [];
  
  const commonIngredients = [
    { name: 'chicken', emoji: '🐔', category: 'Meat & Seafood' },
    { name: 'beef', emoji: '🥩', category: 'Meat & Seafood' },
    { name: 'eggs', emoji: '🥚', category: 'Dairy & Eggs' },
    { name: 'onion', emoji: '🧅', category: 'Produce' },
    { name: 'garlic', emoji: '🧄', category: 'Produce' },
    { name: 'tomato', emoji: '🍅', category: 'Produce' },
    { name: 'potato', emoji: '🥔', category: 'Produce' },
    { name: 'cheese', emoji: '🧀', category: 'Dairy & Eggs' },
    { name: 'milk', emoji: '🥛', category: 'Dairy & Eggs' },
    { name: 'butter', emoji: '🧈', category: 'Dairy & Eggs' },
    { name: 'oil', emoji: '🫒', category: 'Pantry' },
    { name: 'salt', emoji: '🧂', category: 'Pantry' },
    { name: 'pepper', emoji: '🫑', category: 'Pantry' },
    { name: 'flour', emoji: '🌾', category: 'Pantry' },
    { name: 'sugar', emoji: '🍬', category: 'Pantry' }
  ];
  
  for (const ingredient of commonIngredients) {
    if (caption.toLowerCase().includes(ingredient.name)) {
      ingredients.push({
        id: `ingredient-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: ingredient.name,
        amount: '1',
        unit: 'piece',
        emoji: ingredient.emoji,
        category: ingredient.category,
        selected: true
      });
    }
  }
  
  return ingredients;
}

export function convertToShoppingListItems(ingredients: ParsedIngredient[], recipeTitle: string) {
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