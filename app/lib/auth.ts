import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export interface Profile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  preferences: {
    dietary_restrictions: string[];
    favorite_cuisines: string[];
    allergies: string[];
  };
  created_at: string;
  updated_at: string;
}

export interface UserWithProfile {
  id: string;
  username: string;
  email: string;
  profile: Profile;
}

export async function getSession() {
  try {
    const supabase = createServerComponentClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) return null;
    
    return {
      user: {
        id: session.user.id
      }
    };
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

export async function getUserDetails(): Promise<UserWithProfile | null> {
  try {
    const supabase = createServerComponentClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) return null;

    const user = session.user;
    const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';

    return {
      id: user.id,
      username: displayName,
      email: user.email || '',
      profile: {
        id: user.id,
        username: displayName,
        full_name: displayName,
        avatar_url: user.user_metadata?.avatar_url || '',
        preferences: {
          dietary_restrictions: [],
          favorite_cuisines: [],
          allergies: []
        },
        created_at: user.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
} 