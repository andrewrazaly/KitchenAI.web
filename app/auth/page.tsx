'use client';

import { useRouter } from 'next/navigation';
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { UserCircle, ArrowLeft, LogIn, UserPlus } from "lucide-react";

export default function AuthPage() {
  const router = useRouter();

  const handleBackClick = () => {
    router.push('/');
  };

  const handleSignInClick = () => {
    router.push('/sign-in');
  };

  const handleSignUpClick = () => {
    router.push('/sign-up');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <Button
              onClick={handleBackClick}
              className="p-2 bg-transparent hover:bg-gray-100 text-gray-600 shadow-none h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-semibold text-gray-900">Authentication</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <UserCircle className="h-16 w-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to KitchenAI</h2>
          <p className="text-gray-600">Sign in to access your personalized cooking experience</p>
        </div>

        <div className="space-y-4">
          {/* Sign In Card */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleSignInClick}>
            <CardHeader className="text-center">
              <LogIn className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <CardTitle className="text-lg">Sign In</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center text-sm mb-4">
                Access your saved recipes, meal plans, and personalized recommendations
              </p>
              <Button className="w-full bg-blue-500 hover:bg-blue-600">
                Sign In
              </Button>
            </CardContent>
          </Card>

          {/* Sign Up Card */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleSignUpClick}>
            <CardHeader className="text-center">
              <UserPlus className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <CardTitle className="text-lg">Create Account</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center text-sm mb-4">
                Join KitchenAI to save recipes, create meal plans, and get AI-powered cooking assistance
              </p>
              <Button className="w-full bg-green-500 hover:bg-green-600">
                Sign Up
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features List */}
        <div className="mt-8 p-4 bg-white rounded-lg shadow">
          <h3 className="font-semibold text-gray-900 mb-3">What you get with an account:</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center">
              <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
              Save and organize your favorite recipes
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
              Create custom meal plans
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
              AI-powered recipe recommendations
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
              Smart shopping list generation
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
} 