import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Only initialize OpenAI if we have a valid API key
let openai: OpenAI | null = null;
console.log('🔑 OpenAI API Key check:', {
  exists: !!process.env.OPENAI_API_KEY,
  startsWithSk: process.env.OPENAI_API_KEY?.startsWith('sk-'),
  keyLength: process.env.OPENAI_API_KEY?.length
});

if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith('sk-')) {
  console.log('✅ Initializing OpenAI client');
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
} else {
  console.log('❌ OpenAI client not initialized - invalid or missing API key');
}

function generateMockResponse(userMessage: string): string {
  const message = userMessage.toLowerCase();
  
  if (message.includes('name') || message.includes('andrew')) {
    return `Nice to meet you, Andrew! 👋 I'm your KitchenAI Assistant. I'd love to help you with recipes, inventory management, and meal planning! 

What would you like to do first?
• 🥗 Discover trending recipes
• 📦 Manage your food inventory  
• 🛒 Generate a smart shopping list
• 🗓️ Plan your meals for the week

Just let me know how I can help! 🍳✨`;
  } else if (message.includes('recipe') || message.includes('cook')) {
    return `Great question about recipes! 🍳 Here are some ways I can help:

• **Discover Recipes**: Check out trending recipe reels from top food creators
• **Save Favorites**: Bookmark recipes you love for easy access
• **Smart Suggestions**: Get recipe recommendations based on your inventory
• **Cooking Tips**: Ask me about substitutions, techniques, or timing

What type of cuisine are you in the mood for? I can help you find the perfect recipe! 😋`;
  } else if (message.includes('inventory') || message.includes('food')) {
    return `Perfect! Let's talk about inventory management! 📦

I can help you:
• **Track Expiry Dates**: Never let food go bad again
• **Smart Alerts**: Get notifications when items are expiring
• **Recipe Suggestions**: Use up ingredients before they expire
• **Shopping Lists**: Auto-generate lists based on what you need

Have you started adding items to your inventory yet? It's the key to unlocking all the smart features! 🔑`;
  } else {
    return `Thanks for chatting with me! 😊 I'm here to help with all your kitchen needs:

🍳 **Recipe Discovery** - Find amazing recipes from food creators
📦 **Inventory Management** - Track your ingredients and expiry dates  
🛒 **Smart Shopping** - Generate grocery lists automatically
🗓️ **Meal Planning** - Plan nutritious meals for the week

What would you like to explore first? I'm excited to help make your cooking journey easier! ✨

*Note: I'm running in demo mode right now, but I'm still here to guide you through all the amazing features!*`;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { messages, userEmail } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    const lastMessage = messages[messages.length - 1];
    const userMessage = lastMessage?.content || '';

    // Try OpenAI first, fall back to mock if it fails
    console.log('🤖 OpenAI client status:', { initialized: !!openai });
    if (openai) {
      try {
        console.log('🚀 Attempting OpenAI API call...');
        const systemPrompt = `You are KitchenAI Assistant, a helpful and friendly AI cooking companion integrated into the KitchenAI app. You help users with:

🍳 RECIPE DISCOVERY & MANAGEMENT:
- Finding and saving recipe reels from social media
- Organizing saved recipes into collections
- Suggesting recipes based on available ingredients
- Providing cooking tips and substitutions

📦 INVENTORY MANAGEMENT:
- Tracking food items and expiry dates
- Alerting about items going bad soon
- Suggesting recipes to use up expiring ingredients
- Helping organize pantry and fridge items

🛒 SMART SHOPPING:
- Auto-generating grocery lists from saved recipes
- Removing items already in inventory from shopping lists
- Organizing shopping lists by store sections
- Budget tracking and meal cost estimation

🗓️ MEAL PLANNING:
- Creating weekly meal plans
- Balancing nutrition and dietary preferences
- Scheduling cooking times and prep work
- Adapting plans based on schedule changes

PERSONALITY:
- Friendly, enthusiastic, and encouraging
- Use food emojis frequently (🥗🍅🥕🧄🍋etc.)
- Keep responses conversational and helpful
- Provide actionable advice
- Ask follow-up questions to better help users

CURRENT USER: ${userEmail}

Remember to:
- Be encouraging about their cooking journey
- Suggest specific actions they can take in the app
- Ask about their dietary preferences, cooking skill level, or goals
- Keep responses concise but informative
- Use a warm, supportive tone like a cooking friend`;

        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages
          ],
          max_tokens: 500,
          temperature: 0.8,
          presence_penalty: 0.1,
          frequency_penalty: 0.1,
        });

        const assistantMessage = completion.choices[0]?.message?.content;

        if (assistantMessage) {
          return NextResponse.json({
            message: assistantMessage,
            usage: completion.usage
          });
        }
      } catch (openaiError: any) {
        console.error('OpenAI API error, falling back to mock:', openaiError);
        
        // Check if it's a quota error
        if (openaiError?.error?.type === 'insufficient_quota') {
          console.log('💳 OpenAI quota exceeded - using mock responses');
        }
      }
    }

    // Fall back to mock response
    console.log('Using mock response for AI chat');
    const mockResponse = generateMockResponse(userMessage);
    
    return NextResponse.json({
      message: mockResponse,
      demo: true
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    
    // Final fallback
    return NextResponse.json({
      message: `Hi there! 😊 I'm your KitchenAI Assistant. I'm here to help with recipes, inventory management, and meal planning. 

How can I assist you today? 🍳✨

*Note: I'm currently running in demo mode.*`,
      demo: true
    });
  }
} 