'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '../../hooks/useSupabase';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const supabase = useSupabase();

  useEffect(() => {
    const handleAuthCallback = async () => {
      if (!supabase) return;

      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          router.push('/auth/signin?error=callback_error');
          return;
        }

        if (data.session) {
          // Successfully authenticated
          router.push('/');
        } else {
          // No session found
          router.push('/auth/signin');
        }
      } catch (error) {
        console.error('Unexpected error during auth callback:', error);
        router.push('/auth/signin?error=unexpected_error');
      }
    };

    handleAuthCallback();
  }, [supabase, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-indigo-600" />
        <h2 className="text-lg font-medium text-gray-900 mb-2">
          Completing sign in...
        </h2>
        <p className="text-sm text-gray-600">
          Please wait while we verify your authentication.
        </p>
      </div>
    </div>
  );
} 