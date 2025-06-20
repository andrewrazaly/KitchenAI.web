import { NextResponse } from 'next/server';
import { apiCache } from '../../../lib/cache';

export async function GET() {
  try {
    // Clean up expired items first
    apiCache.cleanup();
    
    const status = {
      cacheSize: apiCache.size(),
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      message: 'Cache system operational'
    };

    return NextResponse.json(status);
  } catch (error) {
    console.error('Cache status error:', error);
    return NextResponse.json(
      { error: 'Failed to get cache status' },
      { status: 500 }
    );
  }
} 