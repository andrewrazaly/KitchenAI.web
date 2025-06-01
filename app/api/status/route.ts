import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    
    return NextResponse.json({
      status: 'ok',
      authenticated: !!session?.user,
      userId: session?.user?.id || null
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      authenticated: false,
      userId: null
    });
  }
} 