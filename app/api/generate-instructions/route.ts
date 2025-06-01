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
    
    const { title, ingredients } = await request.json();
    
    // Validate request
    if (!title || !ingredients || !Array.isArray(ingredients)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Title and ingredients array are required' 
      }, { status: 400 });
    }
    
    // Create prompt for OpenAI
    const prompt = createInstructionsPrompt(title, ingredients);
    
    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a professional chef who creates clear, step-by-step cooking instructions for recipes.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });
    
    // Extract response text
    const instructions = response.choices[0].message.content || '';
    
    return NextResponse.json({ 
      success: true, 
      instructions
    });
  } catch (error) {
    console.error('Error generating recipe instructions:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to generate recipe instructions' 
    }, { status: 500 });
  }
}

function createInstructionsPrompt(title: string, ingredients: string[]) {
  return `
Please provide detailed, step-by-step cooking instructions for "${title}".

Ingredients:
${ingredients.map(item => `- ${item}`).join('\n')}

The instructions should:
1. Be clear and easy to follow
2. Include cooking times and temperatures when applicable
3. Mention proper techniques for preparation
4. Include any tips for best results
5. Be formatted in paragraphs, with each major step as a new paragraph

Do not include an introduction or any notes at the beginning or end - just provide the step-by-step cooking instructions.
`;
} 