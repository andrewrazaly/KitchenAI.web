import { NextResponse } from 'next/server';
import { getSession } from '@/app/lib/auth';

// Import the inventory store from the main inventory route
// Note: In production, this would use a real database
import { inventoryStore } from '../route';

interface RecipeIngredient {
  name: string;
  quantity?: string;
  unit?: string;
}

interface Recipe {
  title: string;
  ingredients: RecipeIngredient[];
  servings?: number;
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { recipe, servingsCooked = 1 }: { recipe: Recipe; servingsCooked?: number } = await request.json();
    
    if (!recipe || !recipe.ingredients) {
      return NextResponse.json({ error: 'Recipe with ingredients is required' }, { status: 400 });
    }

    // Get current inventory for this user
    let userItems = inventoryStore.get(userId) || [];
    const deductedItems: string[] = [];
    const notFoundItems: string[] = [];
    const insufficientItems: { name: string; needed: number; available: number }[] = [];

    // Calculate serving adjustment ratio
    const servingRatio = recipe.servings ? servingsCooked / recipe.servings : 1;

    // Process each ingredient
    for (const ingredient of recipe.ingredients) {
      const ingredientName = ingredient.name.toLowerCase().trim();
      
      // Find matching item in inventory (fuzzy matching)
      const inventoryItem = userItems.find(item => {
        const itemName = item.name.toLowerCase().trim();
        return itemName.includes(ingredientName) || 
               ingredientName.includes(itemName) ||
               itemName === ingredientName;
      });

      if (!inventoryItem) {
        notFoundItems.push(ingredient.name);
        continue;
      }

      // Calculate amount needed
      const quantityStr = ingredient.quantity;
      if (!quantityStr) {
        // If no quantity specified, just mark as used (for spices, etc.)
        deductedItems.push(ingredient.name);
        continue;
      }

      const quantityNeeded = parseFloat(quantityStr) * servingRatio;
      const currentQuantity = parseFloat(inventoryItem.quantity || '0');

      if (currentQuantity === 0) {
        insufficientItems.push({
          name: ingredient.name,
          needed: quantityNeeded,
          available: currentQuantity
        });
        continue;
      }

      if (currentQuantity < quantityNeeded) {
        insufficientItems.push({
          name: ingredient.name,
          needed: quantityNeeded,
          available: currentQuantity
        });
        // Still deduct what we have
        inventoryItem.quantity = '0';
        inventoryItem.updated_at = new Date().toISOString();
      } else {
        // Deduct the needed amount
        const newQuantity = currentQuantity - quantityNeeded;
        inventoryItem.quantity = newQuantity.toString();
        inventoryItem.updated_at = new Date().toISOString();
      }

      deductedItems.push(ingredient.name);
    }

    // Update the inventory store
    inventoryStore.set(userId, userItems);

    // Return summary of what was deducted
    const response = {
      success: true,
      message: `Successfully cooked ${recipe.title}`,
      summary: {
        recipeTitle: recipe.title,
        servingsCooked,
        deductedItems,
        notFoundItems,
        insufficientItems
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error deducting recipe ingredients:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// Helper function to parse quantity strings like "1 cup", "2 tbsp", etc.
function parseQuantity(quantityStr: string): { amount: number; unit: string } {
  const match = quantityStr.match(/^(\d+(?:\.\d+)?)\s*(.*)$/);
  if (match) {
    return {
      amount: parseFloat(match[1]),
      unit: match[2].trim()
    };
  }
  return { amount: 0, unit: '' };
} 