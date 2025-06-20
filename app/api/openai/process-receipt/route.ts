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
    const { image, imageType } = await request.json();

    if (!image) {
      return NextResponse.json(
        { error: 'Image data is required' },
        { status: 400 }
      );
    }

    const systemPrompt = `You are an expert receipt analyzer with advanced OCR capabilities. Your task is to extract grocery items from receipt images and return them in a structured format.

INSTRUCTIONS:
1. Carefully read all text in the receipt image
2. Identify grocery/food items (ignore non-food items like bags, taxes, discounts)
3. Extract item names, quantities, and any weight/measurement information
4. Convert all measurements to standardized units: "g" (grams), "kg" (kilograms), or "item" (for countable items)
5. Assign logical categories: "Meat", "Vegetables", "Fruits", "Dairy", "Pantry", "Beverages", "Frozen", "Bakery", etc.
6. Assign confidence scores (0.0-1.0) based on text clarity and certainty

CONVERSION RULES:
- Weights in lbs/pounds → convert to grams (1 lb = 454g)
- Weights in oz/ounces → convert to grams (1 oz = 28g)
- Items sold by piece/each → use "item" unit
- Bulk items without clear weight → estimate reasonable weight in grams
- Liquids in ml/liters → convert to grams (1ml ≈ 1g for most liquids)

EXAMPLES:
- "BANANAS 2.5 LB" → {name: "Bananas", quantity: 1135, unit: "g", category: "Fruits", confidence: 0.9}
- "CHICKEN BREAST" → {name: "Chicken Breast", quantity: 500, unit: "g", category: "Meat", confidence: 0.8}
- "MILK 1 GAL" → {name: "Milk", quantity: 1, unit: "item", category: "Dairy", confidence: 0.95}
- "APPLES 6 CT" → {name: "Apples", quantity: 6, unit: "item", category: "Fruits", confidence: 0.9}

Return ONLY a JSON object with an "items" array, no other text.`;

    const userPrompt = `Analyze this grocery receipt image and extract all food/grocery items. Return as JSON with an "items" array containing objects with fields: name, quantity, unit, category, confidence.

Focus on:
- Reading all item names clearly
- Extracting quantities and weights
- Converting measurements to standard units
- Categorizing items appropriately
- Providing confidence scores based on text clarity`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            { type: 'text', text: userPrompt },
            {
              type: 'image_url',
              image_url: {
                url: `data:${imageType};base64,${image}`,
                detail: 'high'
              }
            }
          ]
        }
      ],
      temperature: 0.1,
      max_tokens: 2000,
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

    // Extract items array
    let items: ParsedItem[] = [];
    if (parsedResponse.items && Array.isArray(parsedResponse.items)) {
      items = parsedResponse.items;
    } else if (Array.isArray(parsedResponse)) {
      items = parsedResponse;
    } else {
      throw new Error('No items found in response');
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
      success: true,
    });

  } catch (error) {
    console.error('Receipt processing error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to process receipt',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 