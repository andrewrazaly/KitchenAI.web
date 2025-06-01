import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { rateLimiter } from '../../lib/rate-limiter';

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    // Apply rate limiting
    const limitExceeded = await rateLimiter(request as any);
    if (limitExceeded) {
      return limitExceeded; // Return rate limit response if limit exceeded
    }
    
    const { ingredients, expiringItems, dietary_restrictions } = await request.json();
    
    // Validate request
    if (!ingredients || !Array.isArray(ingredients)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Ingredients array is required' 
      }, { status: 400 });
    }
    
    // Create prompt for OpenAI
    const prompt = createRecipeSuggestionsPrompt(
      ingredients, 
      expiringItems || [], 
      dietary_restrictions || []
    );
    
    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a culinary AI assistant who specializes in recommending recipes based on available ingredients. Focus on practical, everyday recipes that are easy to prepare.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: "json_object" }
    });
    
    // Extract response text
    const responseContent = response.choices[0].message.content;
    let suggestions;
    
    try {
      // Parse JSON response from OpenAI
      suggestions = JSON.parse(responseContent || '{"recipes":[]}');
    } catch (err) {
      console.error('Error parsing OpenAI response:', err);
      suggestions = { recipes: [] };
    }
    
    return NextResponse.json({ 
      success: true, 
      suggestions: suggestions.recipes
    });
  } catch (error) {
    console.error('Error generating recipe suggestions:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to generate recipe suggestions' 
    }, { status: 500 });
  }
}

function createRecipeSuggestionsPrompt(
  ingredients: string[], 
  expiringItems: string[],
  dietaryRestrictions: string[]
) {
  return `
Generate 3 recipe suggestions based on the following available ingredients, with special focus on using ingredients that will expire soon.

Available Ingredients:
${ingredients.map(item => `- ${item}`).join('\n')}

Ingredients Expiring Soon (prioritize using these):
${expiringItems.length > 0 
  ? expiringItems.map(item => `- ${item}`).join('\n')
  : 'None'
}

Dietary Restrictions:
${dietaryRestrictions.length > 0 
  ? dietaryRestrictions.map(item => `- ${item}`).join('\n')
  : 'None'
}

For each recipe, provide the following in JSON format:
1. title: The name of the recipe
2. mealType: Either "breakfast", "lunch", or "dinner"
3. ingredients: A list of required ingredients with approximate measurements
4. instructions: Step-by-step cooking instructions
5. prepTime: Estimated preparation time in minutes
6. cookTime: Estimated cooking time in minutes
7. usedExpiringItems: List of expiring ingredients used in this recipe

Return the suggestions in the following JSON format:
{
  "recipes": [
    {
      "title": "Recipe Title",
      "mealType": "breakfast|lunch|dinner",
      "ingredients": ["1 cup ingredient 1", "2 tablespoons ingredient 2", ...],
      "instructions": "Step-by-step instructions...",
      "prepTime": 15,
      "cookTime": 30,
      "usedExpiringItems": ["ingredient 1", "ingredient 2"]
    },
    ...
  ]
}

The recipes should be practical, everyday dishes that most people could prepare without specialized equipment or hard-to-find ingredients. Prioritize recipes that use more of the expiring ingredients.
`;
} 