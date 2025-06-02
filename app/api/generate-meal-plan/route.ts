import { NextResponse } from 'next/server';
import type OpenAIType from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { rateLimiter } from '../../lib/rate-limiter';

// Initialize Claude client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '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',
});

// Check if we have Claude API key
const useClaudeAI = process.env.ANTHROPIC_API_KEY || true; // Default to true since we have the key

// Only use OpenAI if the API key is available
const useOpenAI = process.env.OPENAI_API_KEY && 
                 process.env.OPENAI_API_KEY !== "add-your-api-key-here";

let OpenAI: typeof OpenAIType;
let openai: OpenAIType;

if (useOpenAI) {
  // Dynamic import to avoid loading OpenAI when not needed
  import('openai').then(module => {
    OpenAI = module.default;
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  });
}

export async function POST(request: Request) {
  try {
    // Apply rate limiting only when using real AI
    if (useClaudeAI || useOpenAI) {
      const limitExceeded = await rateLimiter(request as any);
      if (limitExceeded) {
        return limitExceeded; // Return rate limit response if limit exceeded
      }
    }
    
    const { 
      budget, 
      preferences, 
      restrictions, 
      days,
      expiringItems = [],
      inventoryItems = [] 
    } = await request.json();
    
    // Try Claude AI first
    if (useClaudeAI) {
      try {
        const mealPlan = await generateMealPlanWithClaude(
          budget, preferences, restrictions, days, expiringItems, inventoryItems
        );
        
        return NextResponse.json({ 
          success: true, 
          mealPlan: mealPlan,
          source: 'claude'
        });
      } catch (error) {
        console.error('Error with Claude API:', error);
        console.log("Claude failed, trying OpenAI...");
      }
    }
    
    // Use OpenAI as fallback if Claude fails or isn't available
    if (useOpenAI && openai) {
      try {
        // Create the prompt for OpenAI
        const prompt = createMealPlanPrompt(
          budget, 
          preferences, 
          restrictions, 
          days, 
          expiringItems, 
          inventoryItems
        );
        
        // Call OpenAI API
        const response = await openai.chat.completions.create({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are a professional nutritionist and chef who specializes in creating personalized meal plans. Your response should be in the exact JSON format requested in the user prompt, without any additional text or explanation.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 3000,
          response_format: { type: "json_object" }
        });
        
        // Parse the response to get JSON
        const responseContent = response.choices[0].message.content || '';
        let mealPlan;
        
        try {
          mealPlan = JSON.parse(responseContent);
        } catch (err) {
          console.error('Error parsing OpenAI response as JSON:', err);
          return NextResponse.json({ 
            success: false, 
            message: 'Failed to parse meal plan response' 
          }, { status: 500 });
        }
        
        return NextResponse.json({ 
          success: true, 
          mealPlan: mealPlan.meals,
          source: 'openai'
        });
      } catch (error) {
        console.error('Error with OpenAI API:', error);
        console.log("OpenAI failed, falling back to mock data");
      }
    }
    
    // Generate mock data as final fallback
    console.log("Using mock meal plan data - no valid AI API keys found");
    const mockMealPlan = generateMockMealPlan(days, expiringItems, inventoryItems);
    return NextResponse.json({ 
      success: true, 
      mealPlan: mockMealPlan,
      source: 'mock'
    });
    
  } catch (error) {
    console.error('Error generating meal plan:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to generate meal plan. Please try again.' 
    }, { status: 500 });
  }
}

// Claude AI meal plan generation
async function generateMealPlanWithClaude(
  budget: number | null,
  preferences: string[],
  restrictions: string[],
  days: number,
  expiringItems: string[],
  inventoryItems: string[]
) {
  const systemPrompt = `You are an expert nutritionist and chef who creates personalized meal plans. Your goal is to:

1. Create balanced, healthy meals for each day
2. PRIORITIZE using ingredients that are expiring soon to reduce food waste
3. Incorporate ingredients already in inventory to save money
4. Respect dietary restrictions and preferences
5. Stay within budget constraints when specified
6. Provide realistic prep times and difficulty levels

Always return ONLY valid JSON in the exact format requested.`;

  let userPrompt = `Create a ${days}-day meal plan with breakfast, lunch, and dinner for each day.\n\n`;

  if (restrictions && restrictions.length > 0) {
    userPrompt += `DIETARY RESTRICTIONS (must follow): ${restrictions.join(', ')}\n\n`;
  }

  if (preferences && preferences.length > 0) {
    userPrompt += `FOOD PREFERENCES: ${preferences.join(', ')}\n\n`;
  }

  if (budget) {
    userPrompt += `BUDGET CONSTRAINT: Total budget is $${budget}. Optimize recipes to stay within this budget.\n\n`;
  }

  if (expiringItems && expiringItems.length > 0) {
    userPrompt += `🚨 PRIORITY: These ingredients are expiring soon - MUST use them first: ${expiringItems.join(', ')}\n\n`;
  }

  if (inventoryItems && inventoryItems.length > 0) {
    userPrompt += `AVAILABLE INVENTORY: I already have these ingredients, please use them: ${inventoryItems.join(', ')}\n\n`;
  }

  userPrompt += `Return ONLY this JSON format:
{
  "meals": [
    {
      "date": "YYYY-MM-DD",
      "breakfast": {
        "title": "Recipe Name",
        "ingredients": ["ingredient1", "ingredient2"],
        "prepTime": 15,
        "difficulty": "easy",
        "nutrition": {"calories": 350, "protein": 20, "carbs": 30, "fat": 15}
      },
      "lunch": {
        "title": "Recipe Name", 
        "ingredients": ["ingredient1", "ingredient2"],
        "prepTime": 25,
        "difficulty": "medium",
        "nutrition": {"calories": 450, "protein": 25, "carbs": 40, "fat": 18}
      },
      "dinner": {
        "title": "Recipe Name",
        "ingredients": ["ingredient1", "ingredient2"], 
        "prepTime": 35,
        "difficulty": "medium",
        "nutrition": {"calories": 550, "protein": 30, "carbs": 45, "fat": 22}
      }
    }
  ]
}

Generate exactly ${days} consecutive days starting from today.
Use simple ingredient names suitable for grocery shopping.
Difficulty levels: "easy", "medium", or "hard"
Prep times should be realistic in minutes.`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      temperature: 0.7,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt
        }
      ]
    });

    const content = response.content[0];
    if (content.type === 'text') {
      // Parse Claude's JSON response
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed.meals || [];
      }
    }

    // If parsing fails, throw error to trigger fallback
    throw new Error('Failed to parse Claude response');

  } catch (error) {
    console.error('Claude meal plan generation error:', error);
    throw error; // Re-throw to trigger fallback
  }
}

function createMealPlanPrompt(
  budget: number | null, 
  preferences: string[], 
  restrictions: string[], 
  days: number,
  expiringItems: string[],
  inventoryItems: string[]
) {
  let prompt = `Please create a meal plan for ${days} days.\n\n`;
  
  if (restrictions && restrictions.length > 0) {
    prompt += `Dietary restrictions: ${restrictions.join(', ')}.\n\n`;
  }
  
  if (preferences && preferences.length > 0) {
    prompt += `Food preferences: ${preferences.join(', ')}.\n\n`;
  }
  
  if (budget) {
    prompt += `The total budget for this meal plan is $${budget}. Please optimize the recipes to stay within this budget.\n\n`;
  }
  
  if (inventoryItems && inventoryItems.length > 0) {
    prompt += `I already have these ingredients in my inventory, please prioritize using them: ${inventoryItems.join(', ')}.\n\n`;
  }
  
  if (expiringItems && expiringItems.length > 0) {
    prompt += `These items in my inventory are expiring soon, so prioritize using them first: ${expiringItems.join(', ')}.\n\n`;
  }
  
  prompt += `Please provide a meal plan in the following JSON format exactly:

{
  "meals": [
    {
      "date": "YYYY-MM-DD", 
      "breakfast": {
        "title": "Breakfast Title",
        "ingredients": ["ingredient 1", "ingredient 2", "..."],
        "prepTime": 15,
        "difficulty": "easy",
        "nutrition": {
          "calories": 350,
          "protein": 20,
          "carbs": 30,
          "fat": 15
        }
      },
      "lunch": {
        "title": "Lunch Title",
        "ingredients": ["ingredient 1", "ingredient 2", "..."],
        "prepTime": 25,
        "difficulty": "medium",
        "nutrition": {
          "calories": 450,
          "protein": 25,
          "carbs": 40,
          "fat": 18
        }
      },
      "dinner": {
        "title": "Dinner Title",
        "ingredients": ["ingredient 1", "ingredient 2", "..."],
        "prepTime": 35,
        "difficulty": "medium",
        "nutrition": {
          "calories": 550,
          "protein": 30,
          "carbs": 45,
          "fat": 22
        }
      }
    },
    ...more days...
  ]
}

Do not include any explanatory text, only return the exact JSON structure above.
Use simple and clear recipe names.
List ingredients in a simple, grocery-list friendly format.
Generate exactly ${days} days worth of meals starting from today.
Include realistic prep times in minutes.
Set difficulty as "easy", "medium", or "hard".
Provide accurate nutrition estimates for each meal.`;
  
  return prompt;
}

// Function to generate mock meal plan data for development
function generateMockMealPlan(days: number, expiringItems: string[] = [], inventoryItems: string[] = []) {
  const meals = [];
  const today = new Date();
  
  // Sample breakfast options
  const breakfastOptions = [
    {
      title: "Avocado Toast with Eggs",
      ingredients: ["whole grain bread", "avocado", "eggs", "salt", "pepper", "red pepper flakes"],
      prepTime: 10,
      difficulty: "easy",
      nutrition: { calories: 320, protein: 18, carbs: 25, fat: 18 }
    },
    {
      title: "Greek Yogurt with Berries",
      ingredients: ["greek yogurt", "mixed berries", "honey", "granola", "chia seeds"],
      prepTime: 5,
      difficulty: "easy",
      nutrition: { calories: 280, protein: 20, carbs: 35, fat: 8 }
    },
    {
      title: "Veggie Omelette",
      ingredients: ["eggs", "bell pepper", "spinach", "mushrooms", "cheese", "salt", "pepper"],
      prepTime: 15,
      difficulty: "medium",
      nutrition: { calories: 350, protein: 25, carbs: 8, fat: 24 }
    },
    {
      title: "Overnight Oats",
      ingredients: ["rolled oats", "milk", "honey", "banana", "peanut butter", "cinnamon"],
      prepTime: 5,
      difficulty: "easy",
      nutrition: { calories: 380, protein: 15, carbs: 55, fat: 12 }
    }
  ];
  
  // Sample lunch options
  const lunchOptions = [
    {
      title: "Chicken Salad Wrap",
      ingredients: ["chicken breast", "tortilla wrap", "lettuce", "tomato", "cucumber", "mayo", "mustard"],
      prepTime: 15,
      difficulty: "easy",
      nutrition: { calories: 420, protein: 30, carbs: 35, fat: 18 }
    },
    {
      title: "Quinoa Bowl with Roasted Vegetables",
      ingredients: ["quinoa", "bell peppers", "zucchini", "red onion", "olive oil", "lemon juice", "feta cheese"],
      prepTime: 30,
      difficulty: "medium",
      nutrition: { calories: 380, protein: 15, carbs: 50, fat: 14 }
    },
    {
      title: "Tuna Sandwich",
      ingredients: ["tuna", "whole grain bread", "lettuce", "tomato", "mayo", "celery"],
      prepTime: 10,
      difficulty: "easy",
      nutrition: { calories: 350, protein: 25, carbs: 30, fat: 15 }
    },
    {
      title: "Lentil Soup",
      ingredients: ["lentils", "carrot", "celery", "onion", "vegetable broth", "cumin", "garlic"],
      prepTime: 45,
      difficulty: "medium",
      nutrition: { calories: 320, protein: 18, carbs: 45, fat: 6 }
    }
  ];
  
  // Sample dinner options
  const dinnerOptions = [
    {
      title: "Spaghetti with Marinara",
      ingredients: ["spaghetti", "tomato sauce", "garlic", "onion", "olive oil", "parmesan cheese", "basil"],
      prepTime: 25,
      difficulty: "easy",
      nutrition: { calories: 480, protein: 18, carbs: 70, fat: 15 }
    },
    {
      title: "Grilled Salmon with Veggies",
      ingredients: ["salmon fillet", "asparagus", "lemon", "olive oil", "garlic", "salt", "pepper"],
      prepTime: 20,
      difficulty: "medium",
      nutrition: { calories: 420, protein: 35, carbs: 12, fat: 25 }
    },
    {
      title: "Chicken Stir Fry",
      ingredients: ["chicken breast", "bell peppers", "broccoli", "carrots", "soy sauce", "ginger", "garlic"],
      prepTime: 20,
      difficulty: "medium",
      nutrition: { calories: 380, protein: 32, carbs: 25, fat: 16 }
    },
    {
      title: "Black Bean Tacos",
      ingredients: ["black beans", "corn tortillas", "avocado", "salsa", "cheese", "lime", "cilantro"],
      prepTime: 15,
      difficulty: "easy",
      nutrition: { calories: 450, protein: 20, carbs: 55, fat: 18 }
    }
  ];

  // Prioritize meals that use expiring items
  const prioritizeMeal = (options: typeof breakfastOptions) => {
    if (expiringItems.length === 0) {
      return options[Math.floor(Math.random() * options.length)];
    }

    // Find meals that use expiring items
    const prioritizedOptions = options.filter(option =>
      option.ingredients.some(ingredient =>
        expiringItems.some(item => ingredient.toLowerCase().includes(item.toLowerCase()))
      )
    );

    return prioritizedOptions.length > 0
      ? prioritizedOptions[Math.floor(Math.random() * prioritizedOptions.length)]
      : options[Math.floor(Math.random() * options.length)];
  };
  
  // Generate a meal plan for the requested number of days
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    
    meals.push({
      date: date.toISOString().split('T')[0],
      breakfast: prioritizeMeal(breakfastOptions),
      lunch: prioritizeMeal(lunchOptions),
      dinner: prioritizeMeal(dinnerOptions)
    });
  }
  
  return meals;
} 