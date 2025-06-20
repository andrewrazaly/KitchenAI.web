'use client';

import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Mail, Lock, Loader2, Eye, EyeOff, User, TestTube } from "lucide-react";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function SignUpPage() {
  const { signUp, signInWithMagicLink, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMagicLink, setIsMagicLink] = useState(false);

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await signUp(email, password);
      
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Account created! Please check your email to verify your account.');
        // Don't redirect immediately, let user check email first
      }
    } catch (error: any) {
      toast.error('Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestSignUp = async () => {
    setEmail('test@gmail.com');
    setPassword('test123');
    setConfirmPassword('test123');
    setIsLoading(true);

    try {
      const { error } = await signUp('test@gmail.com', 'test123');
      
      if (error) {
        if (error.message.includes('already registered')) {
          toast.info('Test account already exists! You can sign in now.');
          router.push('/auth/signin');
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success('Test account created! You can now sign in.');
        router.push('/auth/signin');
      }
    } catch (error: any) {
      toast.error('Failed to create test account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await signInWithMagicLink(email);
      
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Magic link sent! Check your email to sign up.');
      }
    } catch (error: any) {
      toast.error('Failed to send magic link');
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#91c11e' }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#f8f8f8' }}>
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold" style={{ color: '#3c3c3c' }}>
            Create your KitchenAI account
          </h2>
          <p className="mt-2 text-sm" style={{ color: '#888888' }}>
            Start saving recipes and planning your meals
          </p>
        </div>

        {/* Quick Test Signup Button */}
        <Card className="border-2 shadow-sm" style={{ borderColor: '#659a41', backgroundColor: '#f0f8f0' }}>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm mb-3" style={{ color: '#659a41' }}>
                🧪 Create test account for development
              </p>
              <Button
                onClick={handleTestSignUp}
                disabled={isLoading}
                className="w-full text-white font-semibold rounded-lg transition-all hover:opacity-90"
                style={{ backgroundColor: '#659a41' }}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <TestTube className="h-4 w-4 mr-2" />
                )}
                Create Test Account (test@gmail.com)
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-center" style={{ color: '#3c3c3c' }}>
              {isMagicLink ? 'Magic Link Sign Up' : 'Create Account'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={isMagicLink ? handleMagicLink : handleEmailSignUp} className="space-y-4">
              <div>
                <label htmlFor="email" className="sr-only">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4" style={{ color: '#888888' }} />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-white border-2 border-gray-200 rounded-lg focus:border-2 transition-colors"
                    style={{ 
                      color: '#3c3c3c',
                      '--tw-ring-color': '#91c11e'
                    } as React.CSSProperties}
                    onFocus={(e) => e.target.style.borderColor = '#91c11e'}
                    onBlur={(e) => e.target.style.borderColor = '#cccccc'}
                    placeholder="Email address"
                  />
                </div>
              </div>

              {!isMagicLink && (
                <>
                  <div>
                    <label htmlFor="password" className="sr-only">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4" style={{ color: '#888888' }} />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10 bg-white border-2 border-gray-200 rounded-lg focus:border-2 transition-colors"
                        style={{ 
                          color: '#3c3c3c',
                          '--tw-ring-color': '#91c11e'
                        } as React.CSSProperties}
                        onFocus={(e) => e.target.style.borderColor = '#91c11e'}
                        onBlur={(e) => e.target.style.borderColor = '#cccccc'}
                        placeholder="Password (min. 6 characters)"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-3 transition-colors"
                        style={{ color: '#888888' }}
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="sr-only">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4" style={{ color: '#888888' }} />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10 pr-10 bg-white border-2 border-gray-200 rounded-lg focus:border-2 transition-colors"
                        style={{ 
                          color: '#3c3c3c',
                          '--tw-ring-color': '#91c11e'
                        } as React.CSSProperties}
                        onFocus={(e) => e.target.style.borderColor = '#91c11e'}
                        onBlur={(e) => e.target.style.borderColor = '#cccccc'}
                        placeholder="Confirm password"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-3 transition-colors"
                        style={{ color: '#888888' }}
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </>
              )}

              <Button
                type="submit"
                className="w-full text-white font-semibold rounded-lg transition-all hover:opacity-90"
                style={{ backgroundColor: '#91c11e' }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {isMagicLink ? 'Send Magic Link' : 'Create Account'}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsMagicLink(!isMagicLink)}
                  className="text-sm font-medium transition-colors hover:opacity-80"
                  style={{ color: '#91c11e' }}
                >
                  {isMagicLink ? 'Use email & password instead' : 'Use magic link instead'}
                </button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white" style={{ color: '#888888' }}>Already have an account?</span>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  href="/auth/signin"
                  className="w-full flex justify-center py-2 px-4 border-2 rounded-lg text-sm font-semibold transition-all hover:bg-gray-50"
                  style={{ borderColor: '#91c11e', color: '#91c11e' }}
                >
                  Sign in to existing account
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-xs" style={{ color: '#888888' }}>
            By creating an account, you agree to our{' '}
            <a href="#" className="font-medium transition-colors hover:opacity-80" style={{ color: '#91c11e' }}>
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="font-medium transition-colors hover:opacity-80" style={{ color: '#91c11e' }}>
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
} 