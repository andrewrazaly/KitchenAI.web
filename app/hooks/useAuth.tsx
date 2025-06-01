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
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    return { data, error };
  };

  const signOut = async () => {
    if (!supabase) return { error: new Error('Supabase not initialized') };
    
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