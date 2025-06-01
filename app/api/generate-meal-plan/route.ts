import { NextResponse } from 'next/server';
import type OpenAIType from 'openai';
import { rateLimiter } from '../../lib/rate-limiter';

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
    // Apply rate limiting only when using real OpenAI
    if (useOpenAI) {
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
    
    // Use real OpenAI if available, otherwise use mock data
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
          mealPlan: mealPlan.meals
        });
      } catch (error) {
        console.error('Error with OpenAI API:', error);
        // Fall back to mock data if OpenAI fails
        console.log("Falling back to mock meal plan data due to OpenAI error");
        const mockMealPlan = generateMockMealPlan(days, expiringItems, inventoryItems);
        return NextResponse.json({ 
          success: true, 
          mealPlan: mockMealPlan
        });
      }
    } else {
      // Generate mock data when OpenAI is not available
      console.log("Using mock meal plan data - no valid OpenAI API key found");
      const mockMealPlan = generateMockMealPlan(days, expiringItems, inventoryItems);
      return NextResponse.json({ 
        success: true, 
        mealPlan: mockMealPlan
      });
    }
  } catch (error) {
    console.error('Error generating meal plan:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to generate meal plan. Please try again.' 
    }, { status: 500 });
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