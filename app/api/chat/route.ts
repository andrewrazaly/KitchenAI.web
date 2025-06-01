import { OpenAI } from "openai";
import { NextResponse } from "next/server";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured in environment variables');
    }

    const body = await req.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    console.log('Sending request to OpenAI with message:', message);

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful kitchen assistant who knows everything about cooking, recipes, meal planning, and kitchen organization. You provide clear, concise, and practical advice.",
        },
        {
          role: "user",
          content: message,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const reply = completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";
    console.log('Received response from OpenAI:', reply);

    return NextResponse.json({ message: reply });
  } catch (error: any) {
    console.error("Error in chat API:", {
      message: error.message,
      stack: error.stack,
      details: error.response?.data || error
    });
    
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
} 