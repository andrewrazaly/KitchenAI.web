'use client';

import { useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { useSupabase } from './useSupabase';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: AuthError | null;
}

export function useAuth() {
  const supabase = useSupabase();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!supabase) return;

    // Get initial session
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        // In development, check for test session if no real session
        if (!session && process.env.NODE_ENV === 'development') {
          const testSession = localStorage.getItem('test-session');
          if (testSession) {
            const parsedSession = JSON.parse(testSession);
            if (parsedSession.expires_at > Date.now()) {
              setAuthState({
                user: parsedSession.user as User,
                session: parsedSession as Session,
                loading: false,
                error: null,
              });
              return;
            } else {
              // Clean up expired test session
              localStorage.removeItem('test-session');
            }
          }
        }
        
        setAuthState({
          user: session?.user ?? null,
          session,
          loading: false,
          error: error as AuthError,
        });
      } catch (error) {
        setAuthState({
          user: null,
          session: null,
          loading: false,
          error: error as AuthError,
        });
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setAuthState({
          user: session?.user ?? null,
          session,
          loading: false,
          error: null,
        });
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase]);

  // Auth methods
  const signIn = async (email: string, password: string) => {
    if (!supabase) return { error: new Error('Supabase not initialized') };
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    return { data, error };
  };

  const signUp = async (email: string, password: string) => {
    if (!supabase) return { error: new Error('Supabase not initialized') };
    
    const signUpOptions: any = {
      email,
      password,
    };
    
    // Auto-confirm test accounts for development
    if (email === 'test@gmail.com') {
      signUpOptions.options = {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          auto_confirm: true
        }
      };
    }
    
    const { data, error } = await supabase.auth.signUp(signUpOptions);
    
    return { data, error };
  };

  const signOut = async () => {
    if (!supabase) return { error: new Error('Supabase not initialized') };
    
    // Clear test session in development
    if (process.env.NODE_ENV === 'development') {
      localStorage.removeItem('test-session');
    }
    
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const signInWithMagicLink = async (email: string) => {
    if (!supabase) return { error: new Error('Supabase not initialized') };
    
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    
    return { data, error };
  };

  return {
    user: authState.user,
    session: authState.session,
    loading: authState.loading,
    error: authState.error,
    isSignedIn: !!authState.user,
    signIn,
    signUp,
    signOut,
    signInWithMagicLink,
  };
} 