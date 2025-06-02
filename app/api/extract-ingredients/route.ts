import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

// Initialize Claude client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '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',
});

export async function POST(request: NextRequest) {
  let requestData: { text?: string; systemPrompt?: string } = {};
  
  try {
    requestData = await request.json();
    const { text, systemPrompt } = requestData;

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // Use real Claude AI for ingredient extraction
    const analysis = await extractIngredientsWithClaude(text);
    return NextResponse.json(analysis);
    
  } catch (error) {
    console.error('Ingredient extraction error:', error);
    
    // Fallback to mock response if Claude API fails
    const mockAnalysis = await mockAIExtraction(requestData.text || '');
    return NextResponse.json(mockAnalysis);
  }
}

// Real Claude AI extraction
async function extractIngredientsWithClaude(text: string) {
  const systemPrompt = `You are an expert culinary AI assistant. Your task is to analyze recipe text and extract structured ingredient information.

Given a recipe caption or description, extract:
1. All ingredients with quantities and units
2. Categorize ingredients by grocery store sections
3. Estimate servings, cook time, difficulty, and cuisine type
4. Provide a confidence score (0-1)

Categories should be one of: Produce, Meat & Seafood, Dairy & Eggs, Pantry, Bakery, Frozen, Beverages, Canned Goods

Return ONLY valid JSON in this exact format:
{
  "ingredients": [
    {"name": "ingredient name", "quantity": "amount", "unit": "unit", "category": "category"}
  ],
  "servings": number,
  "cookTime": "X minutes",
  "difficulty": "easy|medium|hard",
  "cuisine": "cuisine type",
  "confidence": 0.0-1.0
}

For ingredients without specified quantities, omit the quantity and unit fields.`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      temperature: 0.3,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Extract ingredients from this recipe text: "${text}"`
        }
      ]
    });

    const content = response.content[0];
    if (content.type === 'text') {
      // Parse Claude's JSON response
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        // Ensure all required fields exist
        return {
          ingredients: parsed.ingredients || [],
          servings: parsed.servings || 2,
          cookTime: parsed.cookTime || '20 minutes',
          difficulty: parsed.difficulty || 'medium',
          cuisine: parsed.cuisine || 'General',
          confidence: parsed.confidence || 0.7
        };
      }
    }

    // If parsing fails, return empty result
    return {
      ingredients: [],
      servings: 2,
      cookTime: '20 minutes',
      difficulty: 'medium',
      confidence: 0.5
    };

  } catch (error) {
    console.error('Claude API error:', error);
    throw error; // This will trigger the fallback
  }
}

// Fallback mock AI extraction (keep for when Claude API is unavailable)
async function mockAIExtraction(text: string) {
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const lowerText = text.toLowerCase();

  // Mock analysis based on common recipe patterns
  if (lowerText.includes('pasta') && lowerText.includes('chicken')) {
    return {
      ingredients: [
        { name: 'chicken breast', quantity: '1', unit: 'lb', category: 'Meat & Seafood' },
        { name: 'pasta', quantity: '12', unit: 'oz', category: 'Pantry' },
        { name: 'olive oil', quantity: '2', unit: 'tbsp', category: 'Pantry' },
        { name: 'garlic', quantity: '3', unit: 'cloves', category: 'Produce' },
        { name: 'parmesan cheese', quantity: '1', unit: 'cup', category: 'Dairy & Eggs' },
        { name: 'black pepper', category: 'Pantry' },
        { name: 'salt', category: 'Pantry' }
      ],
      servings: 4,
      cookTime: '25 minutes',
      difficulty: 'easy',
      cuisine: 'Italian',
      confidence: 0.85
    };
  }

  if (lowerText.includes('avocado') && lowerText.includes('toast')) {
    return {
      ingredients: [
        { name: 'avocado', quantity: '2', unit: 'pieces', category: 'Produce' },
        { name: 'bread', quantity: '4', unit: 'slices', category: 'Bakery' },
        { name: 'lime', quantity: '1', unit: 'pieces', category: 'Produce' },
        { name: 'salt', category: 'Pantry' },
        { name: 'red pepper flakes', category: 'Pantry' },
        { name: 'olive oil', quantity: '1', unit: 'tbsp', category: 'Pantry' }
      ],
      servings: 2,
      cookTime: '5 minutes',
      difficulty: 'easy',
      cuisine: 'Healthy',
      confidence: 0.90
    };
  }

  if (lowerText.includes('stir fry') || lowerText.includes('stirfry')) {
    return {
      ingredients: [
        { name: 'vegetables', quantity: '3', unit: 'cups', category: 'Produce' },
        { name: 'soy sauce', quantity: '3', unit: 'tbsp', category: 'Pantry' },
        { name: 'garlic', quantity: '2', unit: 'cloves', category: 'Produce' },
        { name: 'ginger', quantity: '1', unit: 'tbsp', category: 'Produce' },
        { name: 'vegetable oil', quantity: '2', unit: 'tbsp', category: 'Pantry' },
        { name: 'rice', quantity: '2', unit: 'cups', category: 'Pantry' }
      ],
      servings: 3,
      cookTime: '15 minutes',
      difficulty: 'easy',
      cuisine: 'Asian',
      confidence: 0.80
    };
  }

  if (lowerText.includes('salad')) {
    return {
      ingredients: [
        { name: 'mixed greens', quantity: '4', unit: 'cups', category: 'Produce' },
        { name: 'tomato', quantity: '2', unit: 'pieces', category: 'Produce' },
        { name: 'cucumber', quantity: '1', unit: 'pieces', category: 'Produce' },
        { name: 'olive oil', quantity: '2', unit: 'tbsp', category: 'Pantry' },
        { name: 'vinegar', quantity: '1', unit: 'tbsp', category: 'Pantry' },
        { name: 'salt', category: 'Pantry' },
        { name: 'pepper', category: 'Pantry' }
      ],
      servings: 2,
      cookTime: '10 minutes',
      difficulty: 'easy',
      cuisine: 'Healthy',
      confidence: 0.75
    };
  }

  // Generic fallback
  return {
    ingredients: [
      { name: 'onion', quantity: '1', unit: 'pieces', category: 'Produce' },
      { name: 'garlic', quantity: '2', unit: 'cloves', category: 'Produce' },
      { name: 'olive oil', quantity: '2', unit: 'tbsp', category: 'Pantry' },
      { name: 'salt', category: 'Pantry' },
      { name: 'pepper', category: 'Pantry' }
    ],
    servings: 2,
    cookTime: '20 minutes',
    difficulty: 'medium',
    confidence: 0.60
  };
}

// Real AI implementation would look like this:
/*
async function callOpenAI(text: string, systemPrompt: string) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text }
      ],
      temperature: 0.3
    }),
  });

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}
*/ 