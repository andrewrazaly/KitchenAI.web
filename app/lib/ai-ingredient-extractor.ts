export interface ExtractedIngredient {
  name: string;
  quantity?: string;
  unit?: string;
  category?: string;
  standardizedName?: string;
}

export interface ShoppingListItem extends ExtractedIngredient {
  id: string;
  checked: boolean;
  storeSection?: string;
  price?: number;
  notes?: string;
}

export interface RecipeAnalysis {
  ingredients: ExtractedIngredient[];
  servings?: number;
  cookTime?: string;
  difficulty?: string;
  cuisine?: string;
  confidence: number;
}

// Common ingredient categories for organization
const INGREDIENT_CATEGORIES = {
  'Produce': ['tomato', 'onion', 'garlic', 'carrot', 'celery', 'bell pepper', 'spinach', 'lettuce', 'cucumber', 'avocado', 'lemon', 'lime', 'potato', 'sweet potato', 'broccoli', 'cauliflower', 'zucchini', 'mushroom', 'ginger', 'herbs', 'basil', 'parsley', 'cilantro', 'rosemary', 'thyme'],
  'Meat & Seafood': ['chicken', 'beef', 'pork', 'lamb', 'fish', 'salmon', 'tuna', 'shrimp', 'ground beef', 'ground turkey', 'bacon', 'sausage', 'ham'],
  'Dairy & Eggs': ['milk', 'cheese', 'butter', 'cream', 'yogurt', 'sour cream', 'eggs', 'cream cheese', 'mozzarella', 'parmesan', 'cheddar', 'feta'],
  'Pantry': ['flour', 'sugar', 'salt', 'pepper', 'oil', 'olive oil', 'vinegar', 'baking powder', 'baking soda', 'vanilla', 'spices', 'rice', 'quinoa', 'oats', 'honey', 'maple syrup'],
  'Canned/Jarred': ['tomato sauce', 'coconut milk', 'broth', 'stock', 'beans', 'chickpeas', 'tomato paste', 'peanut butter', 'tahini', 'olives', 'capers'],
  'Frozen': ['frozen vegetables', 'frozen fruit', 'ice cream', 'frozen berries', 'frozen peas', 'frozen corn'],
  'Bakery': ['bread', 'baguette', 'tortillas', 'pita', 'naan', 'rolls', 'bagels'],
  'Beverages': ['wine', 'beer', 'juice', 'soda', 'water', 'coffee', 'tea']
};

// Store sections for organization
const STORE_SECTIONS = {
  'Produce': ['vegetables', 'fruits', 'herbs'],
  'Meat & Seafood': ['meat', 'poultry', 'seafood', 'deli'],
  'Dairy': ['dairy', 'eggs', 'cheese', 'milk'],
  'Pantry': ['pantry', 'spices', 'oils', 'condiments', 'baking'],
  'Canned Goods': ['canned', 'jarred', 'sauces'],
  'Frozen': ['frozen'],
  'Bakery': ['bread', 'bakery'],
  'Beverages': ['beverages', 'drinks']
};

// Smart ingredient extraction using AI
export async function extractIngredientsFromText(text: string): Promise<RecipeAnalysis> {
  try {
    // First, try to use AI API if available
    const aiResult = await callAIIngredientExtractor(text);
    if (aiResult) {
      return aiResult;
    }
  } catch (error) {
    console.warn('AI extraction failed, falling back to pattern matching:', error);
  }

  // Fallback to pattern matching
  return extractIngredientsWithPatterns(text);
}

// AI-powered extraction (when API is available)
async function callAIIngredientExtractor(text: string): Promise<RecipeAnalysis | null> {
  try {
    const response = await fetch('/api/extract-ingredients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        systemPrompt: `You are a cooking expert. Extract ingredients from recipe descriptions and social media captions. 

Instructions:
1. Extract ONLY actual ingredients (no cooking equipment or methods)
2. Include quantities when mentioned (e.g., "2 cups flour", "1 lb chicken")  
3. Standardize ingredient names (e.g., "roma tomatoes" → "tomatoes")
4. Categorize ingredients by grocery store section
5. Estimate servings, cook time, and difficulty if mentioned
6. Return confidence score based on how clear the recipe is

Format as JSON:
{
  "ingredients": [
    {"name": "chicken breast", "quantity": "1", "unit": "lb", "category": "Meat & Seafood"},
    {"name": "olive oil", "quantity": "2", "unit": "tbsp", "category": "Pantry"}
  ],
  "servings": 4,
  "cookTime": "30 minutes", 
  "difficulty": "easy",
  "cuisine": "Italian",
  "confidence": 0.85
}`
      }),
    });

    if (!response.ok) {
      throw new Error('AI API request failed');
    }

    const data = await response.json();
    return {
      ingredients: data.ingredients.map((ing: any) => ({
        ...ing,
        standardizedName: standardizeIngredientName(ing.name)
      })),
      servings: data.servings,
      cookTime: data.cookTime,
      difficulty: data.difficulty,
      cuisine: data.cuisine,
      confidence: data.confidence
    };
  } catch (error) {
    console.error('AI extraction error:', error);
    return null;
  }
}

// Pattern-based extraction (fallback)
function extractIngredientsWithPatterns(text: string): RecipeAnalysis {
  const ingredients: ExtractedIngredient[] = [];
  const lowerText = text.toLowerCase();

  // Common ingredient patterns
  const patterns = [
    // Quantity + unit + ingredient (e.g., "2 cups flour", "1 lb chicken")
    /(\d+(?:\.\d+)?)\s*(cups?|tbsp|tsp|tablespoons?|teaspoons?|lbs?|pounds?|oz|ounces?|cloves?|pieces?|slices?)\s+([a-zA-Z\s]+)/g,
    
    // Simple ingredient mentions (e.g., "add garlic", "with tomatoes")
    /(?:add|with|using|include|contains?)\s+([a-zA-Z\s]{3,20})(?:\s|,|$)/g,
    
    // Ingredient lists (e.g., "chicken, rice, and vegetables")
    /([a-zA-Z\s]{3,15})(?:,\s*(?:and\s+)?([a-zA-Z\s]{3,15}))+/g
  ];

  // Extract using patterns
  patterns.forEach(pattern => {
    let match;
    const globalPattern = new RegExp(pattern.source, 'gi');
    while ((match = globalPattern.exec(text)) !== null) {
      if (pattern.source.includes('cups?|tbsp')) {
        // Quantity pattern
        const [, quantity, unit, name] = match;
        const cleanName = cleanIngredientName(name);
        if (isValidIngredient(cleanName)) {
          ingredients.push({
            name: cleanName,
            quantity,
            unit,
            category: categorizeIngredient(cleanName),
            standardizedName: standardizeIngredientName(cleanName)
          });
        }
      } else {
        // Simple ingredient pattern
        const name = cleanIngredientName(match[1] || match[0]);
        if (isValidIngredient(name)) {
          ingredients.push({
            name,
            category: categorizeIngredient(name),
            standardizedName: standardizeIngredientName(name)
          });
        }
      }
    }
  });

  // Common ingredients often mentioned without quantities
  const commonIngredients = ['salt', 'pepper', 'olive oil', 'garlic', 'onion', 'butter', 'cheese', 'herbs', 'spices'];
  commonIngredients.forEach(ingredient => {
    if (lowerText.includes(ingredient) && !ingredients.some(ing => ing.name.toLowerCase().includes(ingredient))) {
      ingredients.push({
        name: ingredient,
        category: categorizeIngredient(ingredient),
        standardizedName: standardizeIngredientName(ingredient)
      });
    }
  });

  // Remove duplicates
  const uniqueIngredients = ingredients.filter((ingredient, index, self) =>
    index === self.findIndex(i => i.standardizedName === ingredient.standardizedName)
  );

  // Estimate confidence based on text clarity
  const confidence = estimateConfidence(text, uniqueIngredients);

  return {
    ingredients: uniqueIngredients,
    confidence
  };
}

function cleanIngredientName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, ' ') // Normalize spaces
    .replace(/^(and|or|with|the|a|an)\s+/i, '') // Remove leading articles
    .trim();
}

function isValidIngredient(name: string): boolean {
  if (name.length < 2 || name.length > 30) return false;
  
  // Filter out cooking methods and equipment
  const excludeWords = [
    'cook', 'bake', 'fry', 'boil', 'steam', 'grill', 'roast', 'sauté',
    'pan', 'pot', 'oven', 'stove', 'bowl', 'plate', 'knife', 'spoon',
    'heat', 'temperature', 'minute', 'hour', 'season', 'taste', 'serve',
    'dish', 'recipe', 'meal', 'food', 'cooking', 'kitchen', 'chef'
  ];
  
  return !excludeWords.some(word => name.includes(word));
}

function categorizeIngredient(name: string): string {
  const lowerName = name.toLowerCase();
  
  for (const [category, keywords] of Object.entries(INGREDIENT_CATEGORIES)) {
    if (keywords.some(keyword => lowerName.includes(keyword))) {
      return category;
    }
  }
  
  return 'Other';
}

function standardizeIngredientName(name: string): string {
  const standardizations: Record<string, string> = {
    'roma tomatoes': 'tomatoes',
    'cherry tomatoes': 'tomatoes',
    'yellow onion': 'onion',
    'white onion': 'onion',
    'red onion': 'onion',
    'ground beef': 'ground beef',
    'ground turkey': 'ground turkey',
    'chicken breast': 'chicken',
    'chicken thigh': 'chicken',
    'olive oil': 'olive oil',
    'vegetable oil': 'cooking oil',
    'kosher salt': 'salt',
    'sea salt': 'salt',
    'black pepper': 'pepper',
    'white pepper': 'pepper'
  };

  return standardizations[name.toLowerCase()] || name;
}

function estimateConfidence(text: string, ingredients: ExtractedIngredient[]): number {
  let confidence = 0.5; // Base confidence

  // More ingredients found = higher confidence
  if (ingredients.length > 5) confidence += 0.2;
  else if (ingredients.length > 2) confidence += 0.1;

  // Recipe-like language increases confidence
  const recipeWords = ['recipe', 'cook', 'ingredients', 'tbsp', 'cup', 'oz', 'minutes'];
  const foundRecipeWords = recipeWords.filter(word => text.toLowerCase().includes(word)).length;
  confidence += foundRecipeWords * 0.05;

  // Quantities mentioned increases confidence
  const quantityPattern = /\d+\s*(cups?|tbsp|tsp|lbs?|oz)/gi;
  const quantities = (text.match(quantityPattern) || []).length;
  confidence += quantities * 0.1;

  return Math.min(confidence, 1.0);
}

// Convert extracted ingredients to shopping list items
export function createShoppingListItems(ingredients: ExtractedIngredient[]): ShoppingListItem[] {
  return ingredients.map(ingredient => ({
    ...ingredient,
    id: `${ingredient.standardizedName}-${Date.now()}-${Math.random()}`,
    checked: false,
    storeSection: getStoreSection(ingredient.category || 'Other')
  }));
}

function getStoreSection(category: string): string {
  for (const [section, categories] of Object.entries(STORE_SECTIONS)) {
    if (categories.some(cat => category.toLowerCase().includes(cat.toLowerCase()))) {
      return section;
    }
  }
  return 'Other';
}

// Merge with existing inventory to avoid duplicates
export function filterAgainstInventory(
  shoppingItems: ShoppingListItem[], 
  inventoryItems: Array<{name: string; quantity: number}>
): ShoppingListItem[] {
  return shoppingItems.filter(item => {
    const existsInInventory = inventoryItems.some(invItem => 
      invItem.name.toLowerCase().includes(item.standardizedName?.toLowerCase() || item.name.toLowerCase()) ||
      (item.standardizedName?.toLowerCase() || item.name.toLowerCase()).includes(invItem.name.toLowerCase())
    );
    return !existsInInventory;
  });
}

// Organize shopping list by store sections
export function organizeByStoreSection(items: ShoppingListItem[]): Record<string, ShoppingListItem[]> {
  const organized: Record<string, ShoppingListItem[]> = {};
  
  items.forEach(item => {
    const section = item.storeSection || 'Other';
    if (!organized[section]) {
      organized[section] = [];
    }
    organized[section].push(item);
  });

  // Sort sections by typical shopping order
  const sectionOrder = ['Produce', 'Meat & Seafood', 'Dairy', 'Bakery', 'Canned Goods', 'Frozen', 'Pantry', 'Beverages', 'Other'];
  const sortedOrganized: Record<string, ShoppingListItem[]> = {};
  
  sectionOrder.forEach(section => {
    if (organized[section]) {
      sortedOrganized[section] = organized[section].sort((a, b) => a.name.localeCompare(b.name));
    }
  });

  return sortedOrganized;
} 