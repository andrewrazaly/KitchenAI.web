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
    let isMounted = true;

    const initAuth = async () => {
      // Check for development test session first
      if (process.env.NODE_ENV === 'development') {
        const testSession = localStorage.getItem('test-session');
        if (testSession) {
          try {
            const parsed = JSON.parse(testSession);
            if (parsed.expires_at > Date.now()) {
              setAuthState({
                user: parsed.user,
                session: parsed,
                loading: false,
                error: null,
              });
              return;
            } else {
              localStorage.removeItem('test-session');
            }
          } catch (e) {
            localStorage.removeItem('test-session');
          }
        }
      }

      // Check if Supabase environment variables are available
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.warn('Supabase environment variables not configured. Running in development mode with localStorage fallback.');
        setAuthState({
          user: null,
          session: null,
          loading: false,
          error: null,
        });
        return;
      }

      if (!supabase || !isMounted) {
        setAuthState(prev => ({ ...prev, loading: false }));
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (isMounted) {
          setAuthState({
            user: session?.user || null,
            session,
            loading: false,
            error: null,
          });
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (isMounted) {
              setAuthState({
                user: session?.user || null,
                session,
                loading: false,
                error: null,
              });
            }
          }
        );

        return () => {
          subscription.unsubscribe();
        };
      } catch (error: any) {
        console.warn('Supabase auth error, falling back to development mode:', error);
        if (isMounted) {
          setAuthState({
            user: null,
            session: null,
            loading: false,
            error: null,
          });
        }
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, [supabase]);

  // Auth methods
  const signIn = async (email: string, password: string) => {
    // Development-only mock auth for test account
    if (process.env.NODE_ENV === 'development' && email === 'test@gmail.com' && password === 'test123') {
      const mockSession = {
        user: {
          id: 'test-user-id',
          email: 'test@gmail.com',
          created_at: new Date().toISOString(),
          email_verified: true,
          phone_verified: false,
          last_sign_in_at: new Date().toISOString(),
          aud: 'authenticated',
          app_metadata: {},
          user_metadata: {},
          role: 'authenticated'
        },
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expires_at: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
        token_type: 'bearer',
        expires_in: 24 * 60 * 60
      };
      
      localStorage.setItem('test-session', JSON.stringify(mockSession));
      
      setAuthState({
        user: mockSession.user,
        session: mockSession,
        loading: false,
        error: null,
      });
      
      return { data: { user: mockSession.user, session: mockSession }, error: null };
    }

    if (!supabase) return { error: new Error('Supabase not initialized') };
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    return { data, error };
  };

  const signUp = async (email: string, password: string) => {
    // Development-only mock auth for test account
    if (process.env.NODE_ENV === 'development' && email === 'test@gmail.com' && password === 'test123') {
      return { 
        data: { 
          user: { 
            id: 'test-user-id', 
            email: 'test@gmail.com',
            created_at: new Date().toISOString(),
            email_verified: true
          }, 
          session: null 
        }, 
        error: null 
      };
    }

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
    // Clear test session in development
    if (process.env.NODE_ENV === 'development') {
      localStorage.removeItem('test-session');
      setAuthState({
        user: null,
        session: null,
        loading: false,
        error: null,
      });
    }

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