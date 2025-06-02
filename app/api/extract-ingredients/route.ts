import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { text, systemPrompt } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // Mock AI response for demonstration
    // In production, this would call OpenAI, Claude, or another AI service
    const mockAnalysis = await mockAIExtraction(text);

    return NextResponse.json(mockAnalysis);
  } catch (error) {
    console.error('Ingredient extraction error:', error);
    return NextResponse.json(
      { error: 'Failed to extract ingredients' },
      { status: 500 }
    );
  }
}

// Mock AI extraction for demonstration
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