'use client';

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from './hooks/useAuth';
import { useRouter } from 'next/navigation';
import ErrorBoundary, { useErrorHandler } from './components/ErrorBoundary';
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Badge } from "./components/ui/badge";
import { Skeleton } from "./components/ui/skeleton";
import { 
  ChefHat, 
  Calendar, 
  Package, 
  ShoppingCart, 
  TrendingUp,
  Clock,
  Users,
  Heart,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  CheckCircle,
  Instagram,
  Plus,
  Zap
} from "lucide-react";
import { useNotification } from './components/Notification';

interface DashboardStats {
  totalRecipes: number;
  activeMealPlan: boolean;
  inventoryItems: number;
  expiringItems: number;
  weeklyBudget: number;
  budgetUsed: number;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  href: string;
  badge?: string;
}

interface RecentActivity {
  id: string;
  type: 'recipe_saved' | 'meal_planned' | 'item_added' | 'shopping_completed';
  title: string;
  description: string;
  timestamp: string;
  icon: any;
}

// Mock data
const mockStats: DashboardStats = {
  totalRecipes: 47,
  activeMealPlan: true,
  inventoryItems: 23,
  expiringItems: 3,
  weeklyBudget: 150,
  budgetUsed: 89
};

const quickActions: QuickAction[] = [
  {
    id: 'meal-planner',
    title: 'AI Meal Planner',
    description: 'Create personalized meal plans',
    icon: ChefHat,
    color: 'bg-gradient-to-r from-indigo-500 to-purple-600',
    href: '/meal-planner',
    badge: 'AI Powered'
  },
  {
    id: 'recipe-reels',
    title: 'Recipe Reels',
    description: 'Discover trending recipes',
    icon: Instagram,
    color: 'bg-gradient-to-r from-pink-500 to-rose-500',
    href: '/recipes/recipe-reels',
    badge: 'Trending'
  },
  {
    id: 'inventory',
    title: 'Food Inventory',
    description: 'Track your ingredients',
    icon: Package,
    color: 'bg-gradient-to-r from-blue-500 to-cyan-500',
    href: '/inventory'
  },
  {
    id: 'shopping',
    title: 'Shopping List',
    description: 'Smart grocery planning',
    icon: ShoppingCart,
    color: 'bg-gradient-to-r from-green-500 to-emerald-500',
    href: '/shopping-list'
  }
];

const mockRecentActivity: RecentActivity[] = [
  {
    id: '1',
    type: 'recipe_saved',
    title: 'Saved "60-Second Pasta Carbonara"',
    description: 'From @chefmarco_official',
    timestamp: '2 hours ago',
    icon: Heart
  },
  {
    id: '2',
    type: 'meal_planned',
    title: 'Generated 7-day meal plan',
    description: 'Mediterranean focus, $89 budget',
    timestamp: '1 day ago',
    icon: Calendar
  },
  {
    id: '3',
    type: 'item_added',
    title: 'Added 5 items to inventory',
    description: 'Organic milk, bread, eggs...',
    timestamp: '2 days ago',
    icon: Package
  }
];

function DashboardLoadingSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Skeleton */}
        <div className="mb-8">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-8 w-12" />
                  </div>
                  <Skeleton className="h-8 w-8" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-12 w-12 mb-4" />
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-48 mb-1" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-3 w-16" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DashboardContent() {
  const { isSignedIn, loading: authLoading, user } = useAuth();
  const { showNotification } = useNotification();
  const { handleError } = useErrorHandler();
  const router = useRouter();
  
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setStats(mockStats);
        setRecentActivity(mockRecentActivity);
        
      } catch (error) {
        console.error('Error loading dashboard:', error);
        handleError(new Error('Failed to load dashboard data'));
      } finally {
        setIsLoading(false);
      }
    };

    if (isSignedIn) {
      loadDashboardData();
    } else {
      setIsLoading(false);
    }
  }, [isSignedIn, handleError]);

  const handleQuickAction = (action: QuickAction) => {
    if (!isSignedIn && action.id !== 'recipe-reels') {
      showNotification('Please sign in to access this feature', 'error');
      router.push('/auth/signin');
      return;
    }
    
    router.push(action.href);
  };

  // Show loading state
  if (authLoading || isLoading) {
    return <DashboardLoadingSkeleton />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            {isSignedIn ? `Welcome back${user?.email ? `, ${user.email.split('@')[0]}` : ''}!` : 'Welcome to KitchenAI'}
          </h1>
          <p className="text-gray-600 text-lg">
            {isSignedIn 
              ? 'Your smart kitchen assistant is ready to help you plan, cook, and save.'
              : 'Your AI-powered kitchen companion for meal planning, recipe discovery, and food management.'
            }
          </p>
        </div>

        {/* Stats Cards - Only show if signed in */}
        {isSignedIn && stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Saved Recipes</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalRecipes}</p>
                  </div>
                  <Heart className="h-8 w-8 text-pink-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Meal Plan</p>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.activeMealPlan ? 'Active' : 'None'}
                      </p>
                      {stats.activeMealPlan && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                  </div>
                  <Calendar className="h-8 w-8 text-indigo-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Inventory</p>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold text-gray-900">{stats.inventoryItems}</p>
                      {stats.expiringItems > 0 && (
                        <Badge className="bg-yellow-100 text-yellow-700 text-xs">
                          {stats.expiringItems} expiring
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Package className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Budget Used</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${stats.budgetUsed}
                    </p>
                    <p className="text-xs text-gray-500">of ${stats.weeklyBudget}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {quickActions.map((action) => (
              <Card 
                key={action.id} 
                className="group cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
                onClick={() => handleQuickAction(action)}
              >
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                      {action.title}
                    </h3>
                    {action.badge && (
                      <Badge className="bg-indigo-100 text-indigo-700 text-xs">
                        {action.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{action.description}</p>
                  <div className="flex items-center text-indigo-600 text-sm font-medium group-hover:text-indigo-700">
                    Get started
                    <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Two Column Layout for larger screens */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          {isSignedIn && (
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recentActivity.length > 0 ? (
                    <div className="space-y-4">
                      {recentActivity.map((activity) => (
                        <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                            <activity.icon className="h-5 w-5 text-indigo-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900">{activity.title}</p>
                            <p className="text-sm text-gray-600">{activity.description}</p>
                          </div>
                          <span className="text-xs text-gray-500 flex-shrink-0">{activity.timestamp}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Clock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600">No recent activity</p>
                      <p className="text-sm text-gray-500">Start using KitchenAI to see your activity here</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Tips & Getting Started */}
          <div className={isSignedIn ? 'lg:col-span-1' : 'lg:col-span-3'}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  {isSignedIn ? 'Pro Tips' : 'Getting Started'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isSignedIn ? (
                  <div className="space-y-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-1">💡 Smart Tip</h4>
                      <p className="text-sm text-blue-800">
                        Add expiry dates to your inventory items to get smart notifications and reduce food waste.
                      </p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <h4 className="font-medium text-green-900 mb-1">🎯 Weekly Goal</h4>
                      <p className="text-sm text-green-800">
                        Try planning 5 meals this week to save time and money on grocery shopping.
                      </p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <h4 className="font-medium text-purple-900 mb-1">🔥 Trending</h4>
                      <p className="text-sm text-purple-800">
                        Check out the viral TikTok feta pasta recipe - it's trending in Recipe Reels!
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center mb-6">
                      <ChefHat className="h-16 w-16 text-indigo-600 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to get started?</h3>
                      <p className="text-gray-600 text-sm">
                        Sign in to unlock personalized meal planning, inventory tracking, and more!
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      <Button 
                        onClick={() => router.push('/auth/signin')}
                        className="w-full flex items-center justify-center gap-2"
                      >
                        <Users className="h-4 w-4" />
                        Sign In
                      </Button>
                      <Button 
                        onClick={() => router.push('/auth/signup')}
                        className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center justify-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Create Account
                      </Button>
                    </div>

                    <div className="pt-4 border-t">
                      <h4 className="font-medium text-gray-900 mb-3">What you'll get:</h4>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          AI-powered meal planning
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Smart inventory tracking
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Recipe discovery & saving
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Budget optimization
                        </li>
                      </ul>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<DashboardLoadingSkeleton />}>
        <DashboardContent />
      </Suspense>
    </ErrorBoundary>
  );
} 