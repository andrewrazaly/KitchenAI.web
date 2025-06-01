'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useAuth } from '../hooks/useAuth';
import { useSupabase } from '../hooks/useSupabase';
import UsageCounter from '../components/UsageCounter';
import Image from 'next/image';

export default function ProfilePage() {
  const [error, setError] = useState<string | null>(null);
  const [signOutLoading, setSignOutLoading] = useState(false);
  const { loading, isSignedIn, user, signOut } = useAuth();
  const router = useRouter();
  
  // Handle loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-6"></div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="h-20 w-20 bg-gray-200 rounded-full mb-4"></div>
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle not signed in
  if (!isSignedIn || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">You need to be signed in to view your profile.</p>
            <Link href="/auth/signin">
              <Button className="w-full">Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSignOut = async () => {
    setSignOutLoading(true);
    setError(null);
    try {
      await signOut();
      router.push('/');
    } catch (err) {
      setError('Failed to sign out. Please try again.');
      console.error('Sign out error:', err);
    } finally {
      setSignOutLoading(false);
    }
  };

  // Get user display info
  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  const userEmail = user.email || '';
  const avatarUrl = user.user_metadata?.avatar_url;
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Profile</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="h-20 w-20 rounded-full overflow-hidden bg-indigo-100 flex items-center justify-center text-indigo-600 text-2xl font-bold">
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt={displayName}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    initials
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{displayName}</h3>
                  <p className="text-gray-600">{userEmail}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={displayName}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={userEmail}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/profile/preferences">
                <Button className="w-full justify-start">
                  ⚙️ Manage Preferences
                </Button>
              </Link>
              
              <Link href="/instagram">
                <Button className="w-full justify-start">
                  📱 Instagram Integration
                </Button>
              </Link>
              
              <Link href="/recipes">
                <Button className="w-full justify-start">
                  🍳 My Recipes
                </Button>
              </Link>
              
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                  {error}
                </div>
              )}
              
              <Button 
                onClick={handleSignOut}
                disabled={signOutLoading}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
              >
                {signOutLoading ? 'Signing out...' : 'Sign Out'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Usage Statistics */}
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Usage Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <UsageCounter />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 