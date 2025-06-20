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
import ExpiringItemsWidget from './components/ExpiringItemsWidget';
import { VideoReelCard } from './components/VideoReelCard';
import { HashtagVideoCard } from './components/HashtagVideoCard';
import AIChatBotInline from './components/AIChatBotInline';
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
  Plus
} from "lucide-react";
import { useNotification } from './components/Notification';
import { getSavedReels, SavedReel } from '../feature_import_instagram/lib/saved-reels-service';
import { useSupabase } from './hooks/useSupabase';
import { trackEvent } from './components/GoogleAnalytics';
import { apiCache, CACHE_KEYS, CACHE_DURATIONS } from './lib/cache';
import { 
  CubeIcon as ChefHatIcon, 
  CalendarDaysIcon, 
  ArchiveBoxIcon, 
  ShoppingBagIcon,
  ChartBarIcon as TrendingUpIcon,
  ClockIcon,
  HeartIcon,
  SparklesIcon,
  ArrowRightIcon,
  PlusIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { 
  CubeIcon as ChefHatIconSolid,
  CalendarDaysIcon as CalendarDaysIconSolid,
  ArchiveBoxIcon as ArchiveBoxIconSolid,
  ShoppingBagIcon as ShoppingBagIconSolid
} from '@heroicons/react/24/solid';
import Link from 'next/link';

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
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  iconSolid: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  href: string;
  badge?: string;
  badgeColor?: string;
}

interface RecentActivity {
  id: string;
  type: 'recipe_saved' | 'meal_planned' | 'item_added' | 'shopping_completed';
  title: string;
  description: string;
  timestamp: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
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
    description: 'Get personalized meal suggestions',
    icon: ChefHatIcon,
    iconSolid: ChefHatIconSolid,
    href: '/meal-planner',
    badge: 'AI Powered',
    badgeColor: 'primary'
  },
  {
    id: 'discover-recipes',
    title: 'Discover Recipes',
    description: 'Find trending recipes & tutorials',
    icon: SparklesIcon,
    iconSolid: SparklesIcon,
    href: '/recipes',
    badge: 'Popular',
    badgeColor: 'warning'
  },
  {
    id: 'manage-inventory',
    title: 'Food Inventory',
    description: 'Track ingredients & expiry dates',
    icon: ArchiveBoxIcon,
    iconSolid: ArchiveBoxIconSolid,
    href: '/inventory'
  },
  {
    id: 'shopping-list',
    title: 'Smart Shopping',
    description: 'AI-generated shopping lists',
    icon: ShoppingBagIcon,
    iconSolid: ShoppingBagIconSolid,
    href: '/shopping-list',
    badge: 'New',
    badgeColor: 'success'
  }
];

const mockRecentActivity: RecentActivity[] = [
  {
    id: '1',
    type: 'recipe_saved',
    title: 'Saved "Quick Pasta Carbonara"',
    description: 'From trending recipes',
    timestamp: '2 hours ago',
    icon: HeartIcon
  },
  {
    id: '2',
    type: 'meal_planned',
    title: 'Generated 7-day meal plan',
    description: 'Mediterranean focus, $89 budget',
    timestamp: '1 day ago',
    icon: CalendarDaysIcon
  },
  {
    id: '3',
    type: 'item_added',
    title: 'Added 5 items to inventory',
    description: 'Organic milk, bread, eggs, tomatoes, cheese',
    timestamp: '2 days ago',
    icon: ArchiveBoxIcon
  }
];

function DashboardLoadingSkeleton() {
  return (
    <div className="container mx-auto py-8 animate-fade-in">
      {/* Header Skeleton */}
      <div className="mb-8">
        <div className="skeleton h-8 w-64 mb-2" />
        <div className="skeleton h-4 w-96" />
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="skeleton h-4 w-20" />
                <div className="skeleton h-8 w-12" />
              </div>
              <div className="skeleton w-8 h-8 rounded-lg" />
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card p-6">
            <div className="skeleton w-12 h-12 rounded-lg mb-4" />
            <div className="skeleton h-5 w-32 mb-2" />
            <div className="skeleton h-4 w-24" />
          </div>
        ))}
      </div>

      {/* Recent Activity Skeleton */}
      <div className="card p-6">
        <div className="skeleton h-6 w-40 mb-6" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="skeleton w-10 h-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-48" />
                <div className="skeleton h-3 w-32" />
              </div>
              <div className="skeleton h-3 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DashboardContent() {
  const { user, isSignedIn, loading } = useAuth();
  const router = useRouter();
  const { showNotification } = useNotification();
  const supabase = useSupabase();
  const { handleError } = useErrorHandler();
  
  const displayName = user?.email?.split('@')[0] || 'Guest';

  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>(mockStats);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>(mockRecentActivity);
  const [recentSavedReels, setRecentSavedReels] = useState<SavedReel[]>([]);
  const [reelsLoading, setReelsLoading] = useState(true);
  const [hashtagReels, setHashtagReels] = useState<any[]>([]);
  const [hashtagReelsLoading, setHashtagReelsLoading] = useState(false);
  const [selectedHashtag, setSelectedHashtag] = useState('healthyrecipes');

    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        
        if (isSignedIn && supabase) {
          try {
            // Load user-specific data here
            setStats(mockStats);
          } catch (error) {
            console.warn('Using mock data due to database error:', error);
            setStats(mockStats);
          }
        } else {
          setStats(mockStats);
        }
        
        setRecentActivity(mockRecentActivity);
      } catch (error) {
        handleError(error);
        setStats(mockStats);
        setRecentActivity(mockRecentActivity);
      } finally {
        setIsLoading(false);
      }
    };

    const loadRecentReels = async () => {
      if (!isSignedIn) {
        setReelsLoading(false);
        return;
      }
      
      try {
        setReelsLoading(true);
        const reels = await getSavedReels();
        console.log('📊 Loaded saved reels for homepage:', reels);
        setRecentSavedReels(reels.slice(0, 4)); // Show first 4 reels
      } catch (error) {
        console.error('Error loading recent reels:', error);
        handleError(error);
      } finally {
        setReelsLoading(false);
      }
    };

    const loadHashtagReels = async () => {
      if (!selectedHashtag) return;
      
      // Check cache first
      const cacheKey = CACHE_KEYS.HASHTAG_REELS(selectedHashtag);
      const cachedData = apiCache.get<any[]>(cacheKey);
      
      if (cachedData) {
        console.log(`📦 Using cached data for hashtag: ${selectedHashtag}`);
        setHashtagReels(cachedData);
        return;
      }
      
      try {
        setHashtagReelsLoading(true);
        console.log('🏷️ Loading hashtag reels for:', selectedHashtag);
        
        const response = await fetch(`/api/instagram/hashtag-reels?hashtag=${selectedHashtag}`);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Hashtag reels API error:', response.status, errorText);
          throw new Error(`Failed to load hashtag reels: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ Hashtag reels API response:', data);
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        const reels = data.reels || [];
        console.log(`📱 Found ${reels.length} reels for #${selectedHashtag}`);
        
        // Cache the results for 1 day
        apiCache.set(cacheKey, reels, CACHE_DURATIONS.ONE_DAY);
        console.log(`💾 Cached hashtag data for: ${selectedHashtag} (expires in 24h)`);
        
        setHashtagReels(reels);
        
      } catch (error) {
        console.error('❌ Error loading hashtag reels:', error);
        handleError(error);
        setHashtagReels([]);
      } finally {
        setHashtagReelsLoading(false);
      }
    };

  useEffect(() => {
    if (!loading) {
      loadDashboardData();
      loadRecentReels();
    }
  }, [isSignedIn, loading, supabase]);

  useEffect(() => {
    loadHashtagReels();
  }, [selectedHashtag]);

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const handleReelClick = (reel: SavedReel) => {
    trackEvent('saved_reel_clicked', 'homepage', `reel_${reel.id}`);
    router.push(`/recipes/${reel.id}?source=saved`);
  };

  const handleQuickAction = (action: QuickAction) => {
    trackEvent('quick_action_clicked', 'homepage', action.id);
    router.push(action.href);
  };

  const handleShoppingListTrigger = () => {
    trackEvent('shopping_list_triggered', 'homepage', 'ai_generation');
    showNotification('AI shopping list generation started!', 'success');
  };

  const handleHashtagClick = (hashtag: string) => {
    setSelectedHashtag(hashtag);
    trackEvent('hashtag_selected', 'homepage', hashtag);
  };

  const handleHashtagReelClick = (reel: any) => {
    trackEvent('hashtag_reel_clicked', 'homepage', `reel_${reel.id}`);
    // Navigate to recipe detail page with the reel data
    router.push(`/recipes/${reel.id}?source=hashtag&hashtag=${selectedHashtag}`);
  };

  const budgetPercentage = Math.round((stats.budgetUsed / stats.weeklyBudget) * 100);

  if (isLoading && !loading) {
    return <DashboardLoadingSkeleton />;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f8f8' }}>
      {/* Integrated Welcome & AI Chat Section */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto" style={{ padding: '2rem 1rem' }}>
          <div className="max-w-6xl mx-auto">
            {/* Welcome Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2" style={{ color: '#3c3c3c', fontSize: '2.5rem', marginBottom: '0.5rem' }}>
                Welcome back, {displayName}! 👋
              </h1>
              <p className="text-base lg:text-lg mb-6" style={{ color: '#888888', fontSize: '1.125rem' }}>
                Ready to create something delicious today?
              </p>
              
              {/* Quick Action Button */}
              <Button 
                className="text-white font-semibold rounded-lg transition-all hover:opacity-90 mb-8"
                style={{ backgroundColor: '#91c11e', padding: '0.75rem 1.5rem', fontSize: '0.875rem' }}
                onClick={() => router.push('/recipes/discover')}
              >
                <Sparkles className="h-4 w-4 lg:h-5 lg:w-5 mr-2" style={{ width: '1.25rem', height: '1.25rem', marginRight: '0.5rem' }} />
                Discover Recipes
              </Button>
            </div>

            {/* AI Chat Bot - Integrated */}
            <AIChatBotInline />
          </div>
        </div>
      </div>

      <div className="container mx-auto" style={{ padding: '1rem' }}>
        <div className="max-w-6xl mx-auto" style={{ gap: '2rem' }}>

          {/* Hashtag Recipe Discovery */}
          <div style={{ marginBottom: '2rem' }}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" style={{ marginBottom: '1.5rem', gap: '1rem' }}>
              <h2 className="text-xl lg:text-2xl font-bold" style={{ color: '#3c3c3c', fontSize: '1.5rem' }}>
                🔥 Discover by Hashtag
              </h2>
              <Button 
                className="font-medium transition-colors hover:bg-gray-50"
                style={{ color: '#91c11e', fontSize: '0.875rem', padding: '0.25rem 0.75rem' }}
                onClick={() => {
                  trackEvent('view_all_hashtag_clicked', 'homepage', 'navigation');
                  router.push('/explore');
                }}
              >
                View All
              </Button>
            </div>
            
            {/* Hashtag Selection */}
            <div className="flex flex-wrap gap-2" style={{ marginBottom: '1.5rem', gap: '0.5rem' }}>
              {[
                { tag: 'healthyrecipes', label: '🥗 Healthy Recipes', default: true },
                { tag: 'lowcarb', label: '🥬 Low Carb' },
                { tag: 'lowcarbrecipes', label: '🥒 Low Carb Recipes' },
                { tag: 'keto', label: '🥑 Keto' },
                { tag: 'ketorecipes', label: '🧀 Keto Recipes' },
                { tag: 'goodmoodfood', label: '😊 Good Mood Food' }
              ].map((hashtag) => (
                <Button
                  key={hashtag.tag}
                  onClick={() => {
                    setSelectedHashtag(hashtag.tag);
                    trackEvent('hashtag_selected', 'homepage', hashtag.tag);
                  }}
                  className={`rounded-full transition-all ${
                    selectedHashtag === hashtag.tag
                      ? 'text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  style={selectedHashtag === hashtag.tag ? 
                    { backgroundColor: '#91c11e', fontSize: '0.875rem', padding: '0.5rem 1rem' } : 
                    { fontSize: '0.875rem', padding: '0.5rem 1rem' }
                  }
                >
                  {hashtag.label}
                </Button>
              ))}
            </div>
            
            {/* Loading State */}
            {hashtagReelsLoading && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4" style={{ gap: '0.75rem' }}>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 aspect-[9/16] rounded-lg" style={{ marginBottom: '0.5rem' }}></div>
                    <div className="bg-gray-200 rounded" style={{ height: '1rem', marginBottom: '0.25rem' }}></div>
                    <div className="bg-gray-200 rounded w-3/4" style={{ height: '0.75rem' }}></div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Hashtag Recipe Videos */}
            {!hashtagReelsLoading && hashtagReels.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4" style={{ gap: '0.75rem' }}>
                {hashtagReels.map((reel) => (
                  <HashtagVideoCard 
                    key={reel.id}
                    reel={reel as SavedReel} 
                    onClick={() => {
                      trackEvent('hashtag_video_clicked', 'homepage', `${selectedHashtag}_${reel.id}`);
                      router.push(`/recipes/${reel.id}`);
                    }}
                  />
                ))}
              </div>
            )}
            
            {/* No Results */}
            {!hashtagReelsLoading && hashtagReels.length === 0 && (
              <div className="text-center text-gray-500" style={{ padding: '2rem 0' }}>
                <p style={{ fontSize: '0.875rem' }}>No recent videos found for #{selectedHashtag}</p>
                <p className="text-xs" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>Try selecting a different hashtag</p>
              </div>
            )}
          </div>

          {/* Recently Saved Reels */}
          {isSignedIn && (
            <div style={{ marginBottom: '2rem' }}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" style={{ marginBottom: '1.5rem', gap: '1rem' }}>
                <h2 className="text-xl lg:text-2xl font-bold" style={{ color: '#3c3c3c', fontSize: '1.5rem' }}>
                  Recently Saved Recipes
                </h2>
                <Button 
                  className="font-medium transition-colors hover:bg-gray-50"
                  style={{ color: '#91c11e', fontSize: '0.875rem', padding: '0.25rem 0.75rem' }}
                  onClick={() => {
                    trackEvent('view_all_reels_clicked', 'homepage', 'navigation');
                    router.push('/explore');
                  }}
                >
                  View All
                </Button>
              </div>
              
              {reelsLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4" style={{ gap: '0.75rem' }}>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i} className="border border-gray-100 bg-white shadow-sm">
                      <CardContent className="p-0">
                        <Skeleton className="w-full rounded-t-lg" style={{ height: '12rem' }} />
                        <div style={{ padding: '1rem' }}>
                          <Skeleton className="w-3/4 mb-2" style={{ height: '1rem' }} />
                          <Skeleton className="w-1/2 mb-2" style={{ height: '0.75rem' }} />
                          <Skeleton className="w-1/4" style={{ height: '0.75rem' }} />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : recentSavedReels.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4" style={{ gap: '0.75rem' }}>
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
                  <CardContent className="text-center" style={{ padding: '2rem' }}>
                    <div className="rounded-full mx-auto w-fit mb-4" style={{ backgroundColor: '#fff8f0', padding: '1rem' }}>
                      <Instagram className="h-6 w-6 lg:h-8 lg:w-8" style={{ color: '#ef9d17', width: '2rem', height: '2rem' }} />
                    </div>
                    <h3 className="font-semibold text-base lg:text-lg mb-2" style={{ color: '#3c3c3c', fontSize: '1.125rem', marginBottom: '0.5rem' }}>
                      No Saved Recipes Yet
                    </h3>
                    <p className="text-xs lg:text-sm mb-4" style={{ color: '#888888', fontSize: '0.875rem', marginBottom: '1rem' }}>
                      Start saving recipe reels from Instagram to see them here!
                    </p>
                    <Button 
                      className="text-white font-semibold rounded-lg transition-all hover:opacity-90"
                      style={{ backgroundColor: '#91c11e', padding: '0.5rem 1.5rem', fontSize: '0.875rem' }}
                      onClick={() => {
                        trackEvent('discover_recipes_clicked', 'homepage', 'empty_state');
                        router.push('/explore');
                      }}
                    >
                      <Instagram className="h-4 w-4 mr-2" style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
                      Discover Recipes
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4" style={{ marginBottom: '2rem', gap: '0.75rem' }}>
            <Card className="border border-gray-100 bg-white shadow-sm">
              <CardContent style={{ padding: '1rem' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium" style={{ color: '#888888', fontSize: '0.75rem' }}>
                      Saved Recipes
                    </p>
                    <p className="font-bold" style={{ color: '#3c3c3c', fontSize: '1.5rem' }}>
                      {stats.totalRecipes}
                    </p>
                  </div>
                  <div className="rounded-full" style={{ backgroundColor: '#f8fff0', padding: '0.75rem' }}>
                    <ChefHat style={{ color: '#91c11e', width: '1.5rem', height: '1.5rem' }} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-100 bg-white shadow-sm">
              <CardContent style={{ padding: '1rem' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium" style={{ color: '#888888', fontSize: '0.75rem' }}>
                      Meal Plan
                    </p>
                    <div className="flex items-center" style={{ gap: '0.5rem' }}>
                      <p className="font-bold" style={{ color: '#3c3c3c', fontSize: '1.25rem' }}>
                        Active
                      </p>
                      <CheckCircle style={{ color: '#91c11e', width: '1rem', height: '1rem' }} />
                    </div>
                  </div>
                  <div className="rounded-full" style={{ backgroundColor: '#f0f8f0', padding: '0.75rem' }}>
                    <Calendar style={{ color: '#659a41', width: '1.5rem', height: '1.5rem' }} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-100 bg-white shadow-sm">
              <CardContent style={{ padding: '1rem' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium" style={{ color: '#888888', fontSize: '0.75rem' }}>
                      Inventory
                    </p>
                    <div className="flex items-center" style={{ gap: '0.5rem' }}>
                      <p className="font-bold" style={{ color: '#3c3c3c', fontSize: '1.5rem' }}>
                        {stats.inventoryItems}
                      </p>
                      {stats.expiringItems > 0 && (
                        <Badge className="rounded-full font-medium" style={{ backgroundColor: '#fff8f0', color: '#ef9d17', fontSize: '0.625rem', padding: '0.25rem 0.5rem' }}>
                          {stats.expiringItems} expiring
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="rounded-full" style={{ backgroundColor: '#fff8f0', padding: '0.75rem' }}>
                    <Package style={{ color: '#ef9d17', width: '1.5rem', height: '1.5rem' }} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-100 bg-white shadow-sm">
              <CardContent style={{ padding: '1rem' }}>
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium" style={{ color: '#888888', fontSize: '0.75rem' }}>
                      Weekly Budget
                    </p>
                    <p className="font-bold truncate" style={{ color: '#3c3c3c', fontSize: '1.25rem' }}>
                      ${stats.budgetUsed}/${stats.weeklyBudget}
                    </p>
                    <div className="w-full bg-gray-200 rounded-full transition-all duration-300" style={{ height: '0.5rem', marginTop: '0.5rem' }}>
                      <div 
                        className="rounded-full transition-all duration-300"
                        style={{ 
                          height: '0.5rem',
                          width: `${Math.min(budgetPercentage, 100)}%`,
                          backgroundColor: budgetPercentage > 90 ? '#ef9d17' : '#91c11e'
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="rounded-full" style={{ backgroundColor: '#fffef0', padding: '0.75rem', marginLeft: '0.5rem' }}>
                    <TrendingUp style={{ color: '#E8DE10', width: '1.5rem', height: '1.5rem' }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Expiring Items Widget */}
          <div>
            <ExpiringItemsWidget />
          </div>

          {/* AI Shopping List Trigger - Prominent Homepage Feature */}
          <div>
            <ShoppingListTrigger 
              onTriggerGeneration={handleShoppingListTrigger}
            />
          </div>

          {/* Quick Actions */}
          <div style={{ marginBottom: '2rem' }}>
            <h2 className="font-bold" style={{ color: '#3c3c3c', fontSize: '1.5rem', marginBottom: '1.5rem' }}>
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4" style={{ gap: '0.75rem' }}>
              {quickActions.map((action) => (
                <Card
                  key={action.id}
                  className="group cursor-pointer transition-all duration-200 hover:shadow-lg border border-gray-100 bg-white hover:scale-105"
                  onClick={() => handleQuickAction(action)}
                >
                  <CardContent className="text-center" style={{ padding: '1.5rem' }}>
                    <div style={{ gap: '1rem' }}>
                      <div className="relative mx-auto w-fit" style={{ marginBottom: '1rem' }}>
                        <div 
                          className="rounded-full transition-all group-hover:scale-110"
                          style={{
                            padding: '1rem',
                            backgroundColor: action.id === 'meal-planner' ? '#f8fff0' :
                                           action.id === 'discover-recipes' ? '#fff8f0' :
                                           action.id === 'manage-inventory' ? '#f0f8f0' : '#fffef0'
                          }}
                        >
                          <action.iconSolid 
                            style={{ 
                              width: '2rem',
                              height: '2rem',
                              color: action.id === 'meal-planner' ? '#91c11e' :
                                     action.id === 'discover-recipes' ? '#ef9d17' :
                                     action.id === 'manage-inventory' ? '#659a41' : '#E8DE10'
                            }} 
                          />
                        </div>
                        {action.badge && (
                          <Badge className="absolute text-white font-medium" style={{ top: '-0.5rem', right: '-0.5rem', backgroundColor: '#91c11e', fontSize: '0.625rem', padding: '0.25rem 0.5rem' }}>
                            {action.badge}
                          </Badge>
                        )}
                      </div>
                      <div style={{ marginBottom: '1rem' }}>
                        <h3 className="font-semibold" style={{ color: '#3c3c3c', fontSize: '1rem', marginBottom: '0.25rem' }}>
                          {action.title}
                        </h3>
                        <p style={{ color: '#888888', fontSize: '0.75rem' }}>
                          {action.description}
                        </p>
                      </div>
                      <ArrowRight className="mx-auto opacity-0 group-hover:opacity-100 transition-all" style={{ color: '#91c11e', width: '1rem', height: '1rem' }} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

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