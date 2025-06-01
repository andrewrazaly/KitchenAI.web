import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

interface RateLimitConfig {
  limit: number; // Maximum number of requests
  window: number; // Time window in seconds (86400 = 1 day)
}

// Initialize Supabase client for server usage
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if we have the required environment variables
if (!supabaseUrl || !supabaseKey) {
  console.warn('Missing Supabase environment variables. Rate limiting may not work correctly.');
}

const supabase = createClient(
  supabaseUrl || 'https://placeholder-project.supabase.co',
  supabaseKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiJ9.placeholder'
);

// Default configuration: 50 requests per day
const defaultConfig: RateLimitConfig = {
  limit: 50,
  window: 86400, // 24 hours in seconds
};

/**
 * Rate limit middleware function for API routes
 * This limits AI API calls to 50 per day per user (or IP if not authenticated)
 */
export async function rateLimiter(
  req: NextRequest,
  config: RateLimitConfig = defaultConfig
) {
  try {
    let userId: string;
    let isAuthenticated = false;
    
    // Try to get authenticated user from Supabase
    try {
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (!authError && session) {
        userId = session.user.id;
        isAuthenticated = true;
      } else {
        // Fall back to IP-based rate limiting for unauthenticated users
        const forwarded = req.headers.get('x-forwarded-for');
        const ip = forwarded ? forwarded.split(',')[0] : req.headers.get('x-real-ip') || 'unknown';
        userId = `ip_${ip}`;
        isAuthenticated = false;
      }
    } catch (authError) {
      // If Supabase is not available, use IP-based rate limiting
      const forwarded = req.headers.get('x-forwarded-for');
      const ip = forwarded ? forwarded.split(',')[0] : req.headers.get('x-real-ip') || 'unknown';
      userId = `ip_${ip}`;
      isAuthenticated = false;
    }

    const now = Math.floor(Date.now() / 1000); // Current time in seconds
    
    // For unauthenticated users, use a more restrictive limit
    const effectiveConfig = isAuthenticated ? config : { ...config, limit: 10 };
    
    try {
      // Check for existing rate limit entry
      const { data: rateLimitEntry, error } = await supabase
        .from('user_rate_limits')
        .select('count, reset_at')
        .eq('user_id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is the "not found" error
        console.error('Database error:', error);
        // Allow the request to continue in case of database error
        return null;
      }
      
      // If no entry exists or reset period has expired
      if (!rateLimitEntry || now > rateLimitEntry.reset_at) {
        // Create or reset the entry
        const { error: upsertError } = await supabase
          .from('user_rate_limits')
          .upsert({
            user_id: userId,
            count: 1,
            reset_at: now + effectiveConfig.window
          });
        
        if (upsertError) {
          console.error('Error updating rate limit:', upsertError);
        }
        
        return null; // Allow the request
      }
      
      // Check if user has exceeded the limit
      if (rateLimitEntry.count >= effectiveConfig.limit) {
        // User has exceeded their rate limit
        const resetInSeconds = rateLimitEntry.reset_at - now;
        const resetInHours = Math.ceil(resetInSeconds / 3600);
        
        return NextResponse.json(
          { 
            success: false, 
            message: `Rate limit exceeded. You've used all ${effectiveConfig.limit} AI requests for today. Limit resets in ${resetInHours} hours.` 
          },
          { status: 429 }
        );
      }
      
      // Increment the counter
      const { error: updateError } = await supabase
        .from('user_rate_limits')
        .update({ count: rateLimitEntry.count + 1 })
        .eq('user_id', userId);
        
      if (updateError) {
        console.error('Error updating rate limit count:', updateError);
      }
      
      return null; // Allow the request
    } catch (dbError) {
      console.error('Database operation failed, allowing request:', dbError);
      // If database operations fail, allow the request to continue
      return null;
    }
  } catch (error) {
    console.error('Rate limiter error:', error);
    return null; // Allow the request in case of errors
  }
} 