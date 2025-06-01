'use client';

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useRouter } from 'next/navigation';
import MealPlannerChat from '../components/MealPlannerChat';
import MealPlannerSkeleton from '../components/MealPlannerSkeleton';
import ErrorBoundary, { useErrorHandler } from '../components/ErrorBoundary';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { 
  Calendar, 
  ChevronRight, 
  Clock, 
  Utensils, 
  ShoppingCart, 
  Settings,
  Plus,
  Filter,
  Sparkles,
  Target,
  DollarSign,
  Users,
  ChefHat,
  Heart,
  Zap,
  BarChart3,
  CheckCircle,
  AlertCircle,
  Star,
  Shuffle,
  Bot
} from "lucide-react";
import { useNotification } from '../components/Notification';
import { useSupabase } from '../hooks/useSupabase';
import { mealPlanningKnowledge } from '../lib/knowledge/meal-planning';
import { productManagerPersonas } from '../lib/knowledge/product-managers';
import ShoppingList from '../components/ShoppingList';

interface MealPlan {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  meals: {
    date: string;
    breakfast: {
      title: string;
      ingredients: string[];
      instructions?: string;
      prepTime?: number;
      difficulty?: string;
      nutrition?: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
      };
    };
    lunch: {
      title: string;
      ingredients: string[];
      instructions?: string;
      prepTime?: number;
      difficulty?: string;
      nutrition?: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
      };
    };
    dinner: {
      title: string;
      ingredients: string[];
      instructions?: string;
      prepTime?: number;
      difficulty?: string;
      nutrition?: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
      };
    };
  }[];
}

interface UserPreferences {
  dietaryRestrictions: string[];
  cuisinePreferences: string[];
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  timeConstraints: number; // minutes per meal
  budgetPerWeek: number;
  nutritionGoals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  householdSize: number;
}

function MealPlannerContent() {
  const { isSignedIn, loading: authLoading } = useAuth();
  const { showNotification } = useNotification();
  const { handleError } = useErrorHandler();
  const router = useRouter();
  const supabase = useSupabase();
  
  const [currentMealPlan, setCurrentMealPlan] = useState<MealPlan | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    dietaryRestrictions: [],
    cuisinePreferences: [],
    skillLevel: 'beginner',
    timeConstraints: 30,
    budgetPerWeek: 100,
    nutritionGoals: {
      calories: 2000,
      protein: 150,
      carbs: 250,
      fat: 65
    },
    householdSize: 1
  });
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(true);

  // Load user preferences
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        setIsLoadingPreferences(true);
        const storedPrefs = localStorage.getItem('mealPlannerPreferences');
        if (storedPrefs) {
          setUserPreferences(JSON.parse(storedPrefs));
        }
      } catch (error) {
        console.error('Error loading preferences:', error);
        handleError(new Error('Failed to load your preferences'));
      } finally {
        setIsLoadingPreferences(false);
      }
    };

    if (isSignedIn) {
      loadPreferences();
    } else {
      setIsLoadingPreferences(false);
    }
  }, [isSignedIn, handleError]);

  // Redirect to auth if not signed in
  useEffect(() => {
    if (!authLoading && !isSignedIn) {
      router.push('/auth/signin');
    }
  }, [authLoading, isSignedIn, router]);

  const handleMealPlanGenerated = async (mealPlan: MealPlan) => {
    try {
      setIsGeneratingPlan(false);
      setCurrentMealPlan(mealPlan);
      
      // Save to localStorage for persistence
      localStorage.setItem('currentMealPlan', JSON.stringify(mealPlan));
      
      showNotification('Your meal plan is ready! 🎉', 'success');
    } catch (error) {
      console.error('Error saving meal plan:', error);
      handleError(new Error('Failed to save your meal plan'));
    }
  };

  const handleShoppingListRequested = () => {
    setShowShoppingList(true);
    showNotification('Shopping list generated! 📝', 'success');
  };

  const generateNewPlan = () => {
    setCurrentMealPlan(null);
    setIsGeneratingPlan(true);
    localStorage.removeItem('currentMealPlan');
  };

  // Show loading state while auth is loading
  if (authLoading || isLoadingPreferences) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-96"></div>
            </div>
          </div>
          <MealPlannerSkeleton />
        </div>
      </div>
    );
  }

  // Show auth required state
  if (!isSignedIn) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
          <p className="text-gray-600 mb-6">
            Please sign in to access the AI meal planner and create personalized meal plans.
          </p>
          <Button onClick={() => router.push('/auth/signin')}>
            Sign In to Continue
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <ChefHat className="h-8 w-8 text-indigo-600" />
            AI Meal Planner
          </h1>
          <p className="text-gray-600">
            Create personalized meal plans with AI assistance based on your preferences and dietary needs.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chat Interface */}
          <div className="lg:col-span-2">
            <ErrorBoundary>
              <Suspense fallback={<MealPlannerSkeleton />}>
                <MealPlannerChat
                  onMealPlanGenerated={handleMealPlanGenerated}
                  onShoppingListRequested={handleShoppingListRequested}
                  userPreferences={userPreferences}
                  existingMealPlan={currentMealPlan}
                />
              </Suspense>
            </ErrorBoundary>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Current Plan Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Current Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentMealPlan ? (
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium">{currentMealPlan.name}</h4>
                      <p className="text-sm text-gray-600">
                        {new Date(currentMealPlan.start_date).toLocaleDateString()} - {' '}
                        {new Date(currentMealPlan.end_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={generateNewPlan}
                        className="flex-1"
                      >
                        <Sparkles className="h-4 w-4 mr-1" />
                        New Plan
                      </Button>
                      <Button 
                        onClick={handleShoppingListRequested}
                        className="flex-1"
                      >
                        <ShoppingCart className="h-4 w-4 mr-1" />
                        Shopping
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">No meal plan yet</p>
                    <p className="text-xs text-gray-500">Chat with the AI to create one!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  onClick={() => router.push('/profile/preferences')}
                  className="w-full justify-start"
                >
                  ⚙️ Update Preferences
                </Button>
                <Button 
                  onClick={() => router.push('/inventory')}
                  className="w-full justify-start"
                >
                  📦 Check Inventory
                </Button>
                <Button 
                  onClick={() => router.push('/recipes')}
                  className="w-full justify-start"
                >
                  📖 Browse Recipes
                </Button>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle>💡 Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Be specific about dietary restrictions</li>
                  <li>• Mention your cooking skill level</li>
                  <li>• Include budget preferences</li>
                  <li>• Ask for recipe modifications</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MealPlannerPage() {
  return (
    <ErrorBoundary>
      <MealPlannerContent />
    </ErrorBoundary>
  );
} 