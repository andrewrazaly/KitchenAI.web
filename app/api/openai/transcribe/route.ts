import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { audio, format } = await request.json();

    if (!audio) {
      return NextResponse.json(
        { error: 'Audio data is required' },
        { status: 400 }
      );
    }

    // Convert base64 audio to buffer
    const audioBuffer = Buffer.from(audio, 'base64');
    
    // Create a File object for OpenAI API
    const audioFile = new File([audioBuffer], `audio.${format || 'webm'}`, {
      type: `audio/${format || 'webm'}`,
    });

    // Transcribe using OpenAI Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'en', // You can make this dynamic
      response_format: 'text',
    });

    return NextResponse.json({
      transcript: transcription,
      success: true,
    });

  } catch (error) {
    console.error('Transcription error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to transcribe audio',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 