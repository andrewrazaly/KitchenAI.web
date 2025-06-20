import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ParsedItem {
  name: string;
  quantity: number;
  unit: 'g' | 'kg' | 'item';
  category: string;
  confidence: number;
  expiryDate?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { text, type } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    const systemPrompt = `You are an expert grocery list parser. Your task is to extract grocery items from text and return them in a structured format.

RULES:
1. Parse each item with name, quantity, unit, and category
2. Units must be one of: "g" (grams), "kg" (kilograms), or "item" (for countable items)
3. Convert measurements appropriately (e.g., "500 grams" → 500g, "2 pounds" → 900g, "1 lb" → 450g)
4. Assign confidence scores (0.0-1.0) based on how clear the item description is
5. Categorize items logically (e.g., "Meat", "Vegetables", "Dairy", "Pantry", "Fruits", etc.)
6. For unclear quantities, use reasonable defaults: 1 item for countable things, 100g for small items, 500g for larger items
7. Ignore filler words like "and", "or", "with", "some", "a few"
8. Capitalize item names properly

EXAMPLES:
- "500 grams of chicken" → {name: "Chicken", quantity: 500, unit: "g", category: "Meat", confidence: 0.95}
- "2 kg rice" → {name: "Rice", quantity: 2, unit: "kg", category: "Pantry", confidence: 0.9}
- "6 apples" → {name: "Apples", quantity: 6, unit: "item", category: "Fruits", confidence: 0.95}
- "tomatoes" → {name: "Tomatoes", quantity: 500, unit: "g", category: "Vegetables", confidence: 0.7}
- "milk" → {name: "Milk", quantity: 1, unit: "item", category: "Dairy", confidence: 0.8}

Return ONLY a JSON array of items, no other text.`;

    const userPrompt = `Parse this ${type === 'voice' ? 'spoken' : 'written'} grocery list into structured items:

"${text}"

Return as JSON array of items with fields: name, quantity, unit, category, confidence`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.1,
      response_format: { type: 'json_object' }
    });

    const responseText = completion.choices[0].message.content;
    
    if (!responseText) {
      throw new Error('No response from OpenAI');
    }

    // Parse the JSON response
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', responseText);
      throw new Error('Invalid JSON response from AI');
    }

    // Extract items array (handle different response formats)
    let items: ParsedItem[] = [];
    if (Array.isArray(parsedResponse)) {
      items = parsedResponse;
    } else if (parsedResponse.items && Array.isArray(parsedResponse.items)) {
      items = parsedResponse.items;
    } else if (parsedResponse.groceries && Array.isArray(parsedResponse.groceries)) {
      items = parsedResponse.groceries;
    } else {
      throw new Error('Unexpected response format from AI');
    }

    // Validate and clean up items
    const validatedItems: ParsedItem[] = items
      .filter(item => item.name && item.name.trim().length > 0)
      .map(item => ({
        name: String(item.name).trim(),
        quantity: Math.max(0, Number(item.quantity) || 1),
        unit: ['g', 'kg', 'item'].includes(item.unit) ? item.unit : 'item',
        category: String(item.category || 'Other').trim(),
        confidence: Math.min(1, Math.max(0, Number(item.confidence) || 0.5))
      }));

    return NextResponse.json({
      items: validatedItems,
      originalText: text,
      success: true,
    });

  } catch (error) {
    console.error('Grocery list parsing error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to parse grocery list',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 