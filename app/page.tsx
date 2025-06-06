'use client';

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from './hooks/useAuth';
import { useRouter } from 'next/navigation';
import ErrorBoundary, { useErrorHandler } from './components/ErrorBoundary';
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Badge } from "./components/ui/badge";
import { Skeleton } from "./components/ui/skeleton";
import ShoppingListTrigger from './components/ShoppingListTrigger';
import { VideoReelCard } from './components/VideoReelCard';
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
import { getSavedReels, SavedReel } from '../feature_import_instagram/lib/saved-reels-service';
import { useSupabase } from './hooks/useSupabase';
import { trackEvent } from './components/GoogleAnalytics';

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
    color: 'bg-green-100',
    href: '/meal-planner',
    badge: 'AI Powered'
  },
  {
    id: 'recipe-reels',
    title: 'Recipe Reels',
    description: 'Discover trending recipes',
    icon: Instagram,
    color: 'bg-orange-100',
    href: '/recipes/recipe-reels',
    badge: 'Trending'
  },
  {
    id: 'inventory',
    title: 'Food Inventory',
    description: 'Track your ingredients',
    icon: Package,
    color: 'bg-green-50',
    href: '/inventory'
  },
  {
    id: 'shopping',
    title: 'Shopping List',
    description: 'Smart grocery planning',
    icon: ShoppingCart,
    color: 'bg-yellow-50',
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
  const supabase = useSupabase();
  
  const [stats, setStats] = useState<DashboardStats>(mockStats);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [recentSavedReels, setRecentSavedReels] = useState<SavedReel[]>([]);
  const [reelsLoading, setReelsLoading] = useState(false);

  // Get display name from user
  const displayName = user?.user_metadata?.full_name || 
                     user?.email?.split('@')[0] || 
                     'Chef';

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setStats(mockStats);
        setRecentActivity(mockRecentActivity);
      } catch (error) {
        handleError(error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isSignedIn) {
      loadDashboardData();
    }
  }, [isSignedIn, handleError]);

  // Load recent saved reels
  useEffect(() => {
    const loadRecentReels = async () => {
      if (!isSignedIn) return;
      
      try {
        setReelsLoading(true);
        const savedReels = await getSavedReels(supabase);
        
        // Get the 4 most recent reels
        const recentReels = savedReels
          .sort((a, b) => b.savedAt - a.savedAt)
          .slice(0, 4);
        
        setRecentSavedReels(recentReels);
      } catch (error) {
        console.error('Error loading recent reels:', error);
      } finally {
        setReelsLoading(false);
      }
    };

    loadRecentReels();
  }, [isSignedIn, supabase]);

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const handleReelClick = (reel: SavedReel) => {
    trackEvent('recent_reel_clicked', 'homepage', `reel_${reel.id}`);
    router.push('/instagram');
  };

  const handleQuickAction = (action: QuickAction) => {
    if (!action.href) {
      showNotification(`${action.title} - Coming soon!`, 'info');
      return;
    }
    
    router.push(action.href);
    showNotification(`Navigating to ${action.title}...`, 'success');
  };

  const handleShoppingListTrigger = () => {
    router.push('/recipes?generateShoppingList=true');
    showNotification('Navigating to generate shopping list...', 'success');
  };

  const budgetPercentage = Math.round((stats.budgetUsed / stats.weeklyBudget) * 100);

  if (isLoading && !authLoading) {
    return <DashboardLoadingSkeleton />;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f8f8' }}>
      {/* Welcome Section */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: '#3c3c3c' }}>
                  Welcome back, {displayName}! 👋
                </h1>
                <p className="text-lg" style={{ color: '#888888' }}>
                  Ready to create something delicious today?
                </p>
              </div>
              <Button 
                className="mt-4 md:mt-0 text-white font-semibold px-6 py-3 rounded-lg transition-all hover:opacity-90"
                style={{ backgroundColor: '#91c11e' }}
                onClick={() => router.push('/recipes/discover')}
              >
                <Sparkles className="h-5 w-5 mr-2" />
                Discover Recipes
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <Card className="border border-gray-100 bg-white shadow-sm">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm font-medium" style={{ color: '#888888' }}>
                      Saved Recipes
                    </p>
                    <p className="text-xl md:text-2xl font-bold" style={{ color: '#3c3c3c' }}>
                      {stats.totalRecipes}
                    </p>
                  </div>
                  <div className="p-2 md:p-3 rounded-full" style={{ backgroundColor: '#f8fff0' }}>
                    <ChefHat className="h-5 w-5 md:h-6 md:w-6" style={{ color: '#91c11e' }} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-100 bg-white shadow-sm">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm font-medium" style={{ color: '#888888' }}>
                      Meal Plan
                    </p>
                    <div className="flex items-center space-x-1 md:space-x-2">
                      <p className="text-lg md:text-2xl font-bold" style={{ color: '#3c3c3c' }}>
                        Active
                      </p>
                      <CheckCircle className="h-4 w-4 md:h-5 md:w-5" style={{ color: '#91c11e' }} />
                    </div>
                  </div>
                  <div className="p-2 md:p-3 rounded-full" style={{ backgroundColor: '#f0f8f0' }}>
                    <Calendar className="h-5 w-5 md:h-6 md:w-6" style={{ color: '#659a41' }} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-100 bg-white shadow-sm">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm font-medium" style={{ color: '#888888' }}>
                      Inventory
                    </p>
                    <div className="flex items-center space-x-1 md:space-x-2">
                      <p className="text-xl md:text-2xl font-bold" style={{ color: '#3c3c3c' }}>
                        {stats.inventoryItems}
                      </p>
                      {stats.expiringItems > 0 && (
                        <Badge className="text-xs px-1 md:px-2 py-1 rounded-full font-medium" style={{ backgroundColor: '#fff8f0', color: '#ef9d17' }}>
                          {stats.expiringItems} expiring
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="p-2 md:p-3 rounded-full" style={{ backgroundColor: '#fff8f0' }}>
                    <Package className="h-5 w-5 md:h-6 md:w-6" style={{ color: '#ef9d17' }} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-100 bg-white shadow-sm">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs md:text-sm font-medium" style={{ color: '#888888' }}>
                      Weekly Budget
                    </p>
                    <p className="text-lg md:text-2xl font-bold truncate" style={{ color: '#3c3c3c' }}>
                      ${stats.budgetUsed}/${stats.weeklyBudget}
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 md:h-2 mt-1 md:mt-2">
                      <div 
                        className="h-1.5 md:h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${Math.min(budgetPercentage, 100)}%`,
                          backgroundColor: budgetPercentage > 90 ? '#ef9d17' : '#91c11e'
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="p-2 md:p-3 rounded-full ml-2" style={{ backgroundColor: '#fffef0' }}>
                    <TrendingUp className="h-5 w-5 md:h-6 md:w-6" style={{ color: '#E8DE10' }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Shopping List Trigger - Prominent Homepage Feature */}
          <div>
            <ShoppingListTrigger 
              onTriggerGeneration={handleShoppingListTrigger}
            />
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#3c3c3c' }}>
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {quickActions.map((action) => (
                <Card
                  key={action.id}
                  className="group cursor-pointer transition-all duration-200 hover:shadow-lg border border-gray-100 bg-white hover:scale-105"
                  onClick={() => handleQuickAction(action)}
                >
                  <CardContent className="p-6 text-center">
                    <div className="space-y-4">
                      <div className="relative mx-auto w-fit">
                        <div 
                          className={`p-4 rounded-full transition-all group-hover:scale-110 ${action.color}`}
                          style={{
                            backgroundColor: action.id === 'meal-planner' ? '#f8fff0' :
                                           action.id === 'recipe-reels' ? '#fff8f0' :
                                           action.id === 'inventory' ? '#f0f8f0' : '#fffef0'
                          }}
                        >
                          <action.icon 
                            className="h-8 w-8" 
                            style={{ 
                              color: action.id === 'meal-planner' ? '#91c11e' :
                                     action.id === 'recipe-reels' ? '#ef9d17' :
                                     action.id === 'inventory' ? '#659a41' : '#E8DE10'
                            }} 
                          />
                        </div>
                        {action.badge && (
                          <Badge className="absolute -top-2 -right-2 text-xs px-2 py-1 text-white font-medium" style={{ backgroundColor: '#91c11e' }}>
                            {action.badge}
                          </Badge>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-1" style={{ color: '#3c3c3c' }}>
                          {action.title}
                        </h3>
                        <p className="text-sm" style={{ color: '#888888' }}>
                          {action.description}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 mx-auto opacity-0 group-hover:opacity-100 transition-all" style={{ color: '#91c11e' }} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Trending Recipe Videos Feed */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold" style={{ color: '#3c3c3c' }}>
                🔥 Trending Recipe Videos
              </h2>
              <Button 
                className="font-medium transition-colors hover:bg-gray-50 text-sm px-3 py-1"
                style={{ color: '#91c11e' }}
                onClick={() => {
                  trackEvent('view_all_trending_clicked', 'homepage', 'navigation');
                  router.push('/instagram');
                }}
              >
                View All
              </Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {/* Mock trending recipe videos */}
              {[
                {
                  id: '1',
                  caption_text: 'This is a low carb sandwich trick that actually works. ZUCCHINI BREADWICH',
                  user: { username: 'shredhappens', profile_pic_url: '/api/placeholder/32/32' },
                  view_count: 28800,
                  like_count: 420,
                  savedAt: Date.now() - 86400000, // 1 day ago
                  image_versions2: { candidates: [{ url: '/api/placeholder/300/400' }] }
                },
                {
                  id: '2', 
                  caption_text: 'Viral feta pasta that broke the internet! So creamy and delicious',
                  user: { username: 'foodielife_eats', profile_pic_url: '/api/placeholder/32/32' },
                  view_count: 156000,
                  like_count: 2800,
                  savedAt: Date.now() - 172800000, // 2 days ago
                  image_versions2: { candidates: [{ url: '/api/placeholder/300/400' }] }
                },
                {
                  id: '3',
                  caption_text: '60-second Thai stir fry that will change your life. Secret sauce revealed!',
                  user: { username: 'authentic_thai_kitchen', profile_pic_url: '/api/placeholder/32/32' },
                  view_count: 89000,
                  like_count: 1200,
                  savedAt: Date.now() - 259200000, // 3 days ago  
                  image_versions2: { candidates: [{ url: '/api/placeholder/300/400' }] }
                },
                {
                  id: '4',
                  caption_text: 'Fluffy Japanese pancakes in 5 minutes! No special ingredients needed',
                  user: { username: 'tokyo_sweet_cafe', profile_pic_url: '/api/placeholder/32/32' },
                  view_count: 67000,
                  like_count: 890,
                  savedAt: Date.now() - 345600000, // 4 days ago
                  image_versions2: { candidates: [{ url: '/api/placeholder/300/400' }] }
                }
              ].map((reel) => (
                <VideoReelCard 
                  key={reel.id}
                  reel={reel as SavedReel} 
                  onClick={() => {
                    trackEvent('trending_video_clicked', 'homepage', `reel_${reel.id}`);
                    router.push(`/instagram?highlight=${reel.id}`);
                  }}
                />
              ))}
            </div>
          </div>

          {/* Recently Saved Reels */}
          {isSignedIn && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold" style={{ color: '#3c3c3c' }}>
                  Recently Saved Recipes
                </h2>
                <Button 
                  className="font-medium transition-colors hover:bg-gray-50 text-sm px-3 py-1"
                  style={{ color: '#91c11e' }}
                  onClick={() => {
                    trackEvent('view_all_reels_clicked', 'homepage', 'navigation');
                    router.push('/instagram');
                  }}
                >
                  View All
                </Button>
              </div>
              
              {reelsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i} className="border border-gray-100 bg-white shadow-sm">
                      <CardContent className="p-0">
                        <Skeleton className="w-full h-48 rounded-t-lg" />
                        <div className="p-4">
                          <Skeleton className="h-4 w-3/4 mb-2" />
                          <Skeleton className="h-3 w-1/2 mb-2" />
                          <Skeleton className="h-3 w-1/4" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : recentSavedReels.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                  {recentSavedReels.map((reel) => (
                    <VideoReelCard 
                      key={reel.id}
                      reel={reel} 
                      onClick={() => handleReelClick(reel)}
                    />
                  ))}
                </div>
              ) : (
                <Card className="border border-gray-100 bg-white shadow-sm">
                  <CardContent className="p-8 text-center">
                    <div className="p-4 rounded-full mx-auto w-fit mb-4" style={{ backgroundColor: '#fff8f0' }}>
                      <Instagram className="h-8 w-8" style={{ color: '#ef9d17' }} />
                    </div>
                    <h3 className="font-semibold text-lg mb-2" style={{ color: '#3c3c3c' }}>
                      No Saved Recipes Yet
                    </h3>
                    <p className="text-sm mb-4" style={{ color: '#888888' }}>
                      Start saving recipe reels from Instagram to see them here!
                    </p>
                    <Button 
                      className="text-white font-semibold px-6 py-2 rounded-lg transition-all hover:opacity-90"
                      style={{ backgroundColor: '#91c11e' }}
                      onClick={() => {
                        trackEvent('discover_recipes_clicked', 'homepage', 'empty_state');
                        router.push('/instagram');
                      }}
                    >
                      <Instagram className="h-4 w-4 mr-2" />
                      Discover Recipes
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Recent Activity */}
          <Card className="border border-gray-100 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span style={{ color: '#3c3c3c' }}>Recent Activity</span>
                <Button 
                  className="font-medium transition-colors hover:bg-gray-50 text-sm px-3 py-1"
                  style={{ color: '#91c11e' }}
                >
                  View All
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="p-2 rounded-full" style={{ backgroundColor: '#f8fff0' }}>
                      <activity.icon className="h-5 w-5" style={{ color: '#91c11e' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm" style={{ color: '#3c3c3c' }}>
                        {activity.title}
                      </h4>
                      <p className="text-sm text-truncate" style={{ color: '#888888' }}>
                        {activity.description}
                      </p>
                    </div>
                    <div className="text-xs" style={{ color: '#888888' }}>
                      {activity.timestamp}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
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