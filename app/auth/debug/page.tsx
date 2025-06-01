'use client';

import { useAuth } from '../../hooks/useAuth';
import { useSupabase } from '../../hooks/useSupabase';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import Link from 'next/link';

export default function AuthDebugPage() {
  const { user, session, loading, isSignedIn, error } = useAuth();
  const supabase = useSupabase();
  const [sessionData, setSessionData] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkSession = async () => {
    if (!supabase) return;
    
    setIsChecking(true);
    try {
      const { data, error } = await supabase.auth.getSession();
      setSessionData({ data, error });
    } catch (err) {
      setSessionData({ error: err });
    }
    setIsChecking(false);
  };

  useEffect(() => {
    checkSession();
  }, [supabase]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Authentication Debug</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>useAuth Hook State</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Loading:</strong> {loading ? 'true' : 'false'}</p>
            <p><strong>Is Signed In:</strong> {isSignedIn ? 'true' : 'false'}</p>
            <p><strong>User:</strong> {user ? user.email : 'null'}</p>
            <p><strong>User ID:</strong> {user?.id || 'null'}</p>
            <p><strong>Session:</strong> {session ? 'exists' : 'null'}</p>
            <p><strong>Error:</strong> {error?.message || 'none'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Direct Supabase Session Check</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={checkSession} disabled={isChecking} className="mb-4">
              {isChecking ? 'Checking...' : 'Check Session'}
            </Button>
            {sessionData && (
              <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto">
                {JSON.stringify(sessionData, null, 2)}
              </pre>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Environment Check</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Supabase Client:</strong> {supabase ? 'initialized' : 'not initialized'}</p>
            <p><strong>Window location:</strong> {typeof window !== 'undefined' ? window.location.href : 'server'}</p>
          </CardContent>
        </Card>

        <div className="text-center space-x-4">
          <Link href="/auth/signin">
            <Button>Go to Sign In</Button>
          </Link>
          <Link href="/auth/signup">
            <Button>Go to Sign Up</Button>
          </Link>
          <Link href="/">
            <Button>Go to Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
} 