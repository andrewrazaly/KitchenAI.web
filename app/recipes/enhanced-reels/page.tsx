'use client';

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import ErrorBoundary, { useErrorHandler } from '../../components/ErrorBoundary';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { 
  ChefHat, 
  Instagram,
  Sparkles,
  TrendingUp,
  Clock,
  Users,
  Search,
  Filter,
  ArrowLeft
} from "lucide-react";
import { useNotification } from '../../components/Notification';
import { EnhancedReelCard } from '../../../feature_import_instagram/components/instagram/enhanced-reel-card';
import { ReelItem } from '../../../feature_import_instagram/types/reels';
import Link from 'next/link';
import { trackEvent } from '../../components/GoogleAnalytics';

// Mock enhanced recipe reels data
const mockEnhancedReels: ReelItem[] = [
  {
    id: '1',
    taken_at: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
    pk: '1',
    media_type: 2,
    code: 'ABC123',
    caption_text: '🍝 Perfect Pasta Carbonara in 15 Minutes!\n\nAuthentic Italian recipe that will blow your mind! No cream needed - just eggs, cheese, and technique. This is how Romans have been making it for centuries! 👨‍🍳✨\n\n#pasta #carbonara #italian #authentic #quick #dinner #recipe #cooking',
    video_versions: [
      {
        type: 101,
        url: '',
        width: 720,
        height: 1280
      }
    ],
    image_versions2: {
      candidates: [
        {
          url: '/lemon.svg',
          width: 400,
          height: 600
        }
      ]
    },
    original_width: 720,
    original_height: 1280,
    view_count: 2300000,
    play_count: 1800000,
    like_count: 125000,
    comment_count: 3420,
    user: {
      pk: 'chef_marco_123',
      username: 'chef_marco_official',
      full_name: 'Chef Marco Romano',
      profile_pic_url: '/lemon.svg'
    }
  },
  {
    id: '2',
    taken_at: Math.floor(Date.now() / 1000) - 7200, // 2 hours ago
    pk: '2',
    media_type: 2,
    code: 'DEF456',
    caption_text: '🥑 Viral TikTok Feta Pasta That Broke The Internet!\n\nThis creamy, delicious pasta took social media by storm and for good reason! Just throw everything in the oven and watch the magic happen. Perfect for busy weeknights! 🔥\n\n#viral #fetapasta #tiktok #easy #trending #pasta #dinner #quickmeals',
    video_versions: [
      {
        type: 101,
        url: '',
        width: 720,
        height: 1280
      }
    ],
    image_versions2: {
      candidates: [
        {
          url: '/lemon.svg',
          width: 400,
          height: 600
        }
      ]
    },
    original_width: 720,
    original_height: 1280,
    view_count: 5600000,
    play_count: 4200000,
    like_count: 456000,
    comment_count: 8920,
    user: {
      pk: 'foodie_life_456',
      username: 'foodielife_eats',
      full_name: 'Sarah | Foodie Life',
      profile_pic_url: '/lemon.svg'
    }
  },
  {
    id: '3',
    taken_at: Math.floor(Date.now() / 1000) - 10800, // 3 hours ago
    pk: '3',
    media_type: 2,
    code: 'GHI789',
    caption_text: '🍛 Thai Basil Stir Fry That Will Change Your Life!\n\nAuthentic street food flavor at home! This recipe is packed with fresh herbs, bold flavors, and takes only 10 minutes. The secret is in the wok hei - that smoky flavor from high heat cooking! 🌶️🔥\n\n#thai #stirfry #basil #spicy #authentic #quick #asian #streetfood',
    video_versions: [
      {
        type: 101,
        url: '',
        width: 720,
        height: 1280
      }
    ],
    image_versions2: {
      candidates: [
        {
          url: '/lemon.svg',
          width: 400,
          height: 600
        }
      ]
    },
    original_width: 720,
    original_height: 1280,
    view_count: 890000,
    play_count: 650000,
    like_count: 67800,
    comment_count: 1240,
    user: {
      pk: 'thai_kitchen_789',
      username: 'authentic_thai_kitchen',
      full_name: 'Chef Nim | Thai Kitchen',
      profile_pic_url: '/lemon.svg'
    }
  },
  {
    id: '4',
    taken_at: Math.floor(Date.now() / 1000) - 14400, // 4 hours ago
    pk: '4',
    media_type: 2,
    code: 'JKL012',
    caption_text: '🥞 Fluffy Japanese Pancakes - Cloud-Like Perfection!\n\nThese jiggly, soufflé-style pancakes are taking the world by storm! They might look intimidating but they\'re easier than you think. The key is in the technique - patience and gentle folding! ☁️✨\n\n#japanese #pancakes #fluffy #souffle #breakfast #trending #jiggly #viral',
    video_versions: [
      {
        type: 101,
        url: '',
        width: 720,
        height: 1280
      }
    ],
    image_versions2: {
      candidates: [
        {
          url: '/lemon.svg',
          width: 400,
          height: 600
        }
      ]
    },
    original_width: 720,
    original_height: 1280,
    view_count: 1200000,
    play_count: 980000,
    like_count: 98500,
    comment_count: 2100,
    user: {
      pk: 'tokyo_sweets_012',
      username: 'tokyo_sweet_cafe',
      full_name: 'Yuki | Tokyo Sweets',
      profile_pic_url: '/lemon.svg'
    }
  },
  {
    id: '5',
    taken_at: Math.floor(Date.now() / 1000) - 18000, // 5 hours ago
    pk: '5',
    media_type: 2,
    code: 'MNO345',
    caption_text: '🍕 New York Style Pizza Dough - Professional Secrets!\n\nLearn the techniques that pizza masters use! This dough recipe creates the perfect chewy, crispy crust that New York is famous for. Cold fermentation is the secret! 🗽\n\n#pizza #newyork #dough #professional #secrets #homemade #italian #crispy',
    video_versions: [
      {
        type: 101,
        url: '',
        width: 720,
        height: 1280
      }
    ],
    image_versions2: {
      candidates: [
        {
          url: '/lemon.svg',
          width: 400,
          height: 600
        }
      ]
    },
    original_width: 720,
    original_height: 1280,
    view_count: 750000,
    play_count: 580000,
    like_count: 45600,
    comment_count: 890,
    user: {
      pk: 'pizza_master_345',
      username: 'nypizza_master',
      full_name: 'Tony | NY Pizza Master',
      profile_pic_url: '/lemon.svg'
    }
  },
  {
    id: '6',
    taken_at: Math.floor(Date.now() / 1000) - 21600, // 6 hours ago
    pk: '6',
    media_type: 2,
    code: 'PQR678',
    caption_text: '🍰 No-Bake Cheesecake in 20 Minutes!\n\nWhen you need dessert fast, this is your recipe! Creamy, rich, and absolutely delicious - no oven required! Perfect for summer or when you\'re short on time. The texture is incredible! 🤤\n\n#nobake #cheesecake #quick #dessert #easy #summer #creamy #delicious',
    video_versions: [
      {
        type: 101,
        url: '',
        width: 720,
        height: 1280
      }
    ],
    image_versions2: {
      candidates: [
        {
          url: '/lemon.svg',
          width: 400,
          height: 600
        }
      ]
    },
    original_width: 720,
    original_height: 1280,
    view_count: 1800000,
    play_count: 1350000,
    like_count: 134000,
    comment_count: 2780,
    user: {
      pk: 'sweet_treats_678',
      username: 'homemade_sweets',
      full_name: 'Emma | Sweet Treats',
      profile_pic_url: '/lemon.svg'
    }
  }
];

function EnhancedReelsContent() {
  const { isSignedIn, loading: authLoading } = useAuth();
  const { showNotification } = useNotification();
  const { handleError } = useErrorHandler();
  const router = useRouter();
  
  const [reels, setReels] = useState<ReelItem[]>([]);
  const [filteredReels, setFilteredReels] = useState<ReelItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  // Load enhanced recipe reels
  useEffect(() => {
    const loadReels = async () => {
      try {
        setIsLoading(true);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        setReels(mockEnhancedReels);
        setFilteredReels(mockEnhancedReels);
        
      } catch (error) {
        console.error('Error loading enhanced reels:', error);
        handleError(new Error('Failed to load enhanced recipe reels'));
      } finally {
        setIsLoading(false);
      }
    };

    loadReels();
  }, [handleError]);

  // Filter reels based on search and filter
  useEffect(() => {
    let filtered = reels;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(reel => 
        reel.caption_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reel.user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reel.user.full_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(reel => {
        const caption = reel.caption_text.toLowerCase();
        switch (selectedFilter) {
          case 'trending':
            return (reel.view_count && reel.view_count > 1000000) || caption.includes('viral') || caption.includes('trending');
          case 'quick':
            return caption.includes('quick') || caption.includes('minutes') || caption.includes('fast');
          case 'authentic':
            return caption.includes('authentic') || caption.includes('traditional') || caption.includes('original');
          case 'viral':
            return caption.includes('viral') || caption.includes('tiktok') || (reel.view_count && reel.view_count > 2000000);
          default:
            return true;
        }
      });
    }

    setFilteredReels(filtered);
  }, [reels, searchQuery, selectedFilter]);

  // Show loading state
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#f8f8f8' }}>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Header Skeleton */}
            <div className="mb-8 flex items-center gap-4">
              <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
              <div>
                <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-4 w-96 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>

            {/* Loading Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="h-80 bg-gray-200 animate-pulse"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f8f8' }}>
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
              <Link href="/recipes">
                <Button className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Recipes
                </Button>
              </Link>
            </div>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500">
                <Instagram className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: '#3c3c3c' }}>
                  Enhanced Recipe Reels ✨
                </h1>
                <p className="text-lg" style={{ color: '#888888' }}>
                  Premium recipe previews with detailed information, nutrition facts, and interactive features
                </p>
              </div>
            </div>

            {/* VERY OBVIOUS INDICATOR */}
            <div className="mb-6 p-4 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg text-white text-center">
              <h2 className="text-2xl font-bold mb-2">🎉 YOU ARE VIEWING THE ENHANCED RECIPE REELS! 🎉</h2>
              <p className="text-lg">This is the NEW premium version with interactive features!</p>
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-green-50 p-4 rounded-lg flex items-center gap-3">
                <ChefHat className="h-6 w-6 text-green-600" />
                <div>
                  <p className="font-semibold text-green-800">Detailed Recipe Info</p>
                  <p className="text-sm text-green-600">Cook time, servings, difficulty level</p>
                </div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg flex items-center gap-3">
                <TrendingUp className="h-6 w-6 text-blue-600" />
                <div>
                  <p className="font-semibold text-blue-800">Interactive Previews</p>
                  <p className="text-sm text-blue-600">Full ingredient lists & instructions</p>
                </div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg flex items-center gap-3">
                <Sparkles className="h-6 w-6 text-purple-600" />
                <div>
                  <p className="font-semibold text-purple-800">Smart Actions</p>
                  <p className="text-sm text-purple-600">Save, rate, add to shopping list</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search enhanced recipes, creators, or cuisines..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-base"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'all', label: 'All Recipes', icon: ChefHat },
                { id: 'trending', label: 'Trending Now', icon: TrendingUp },
                { id: 'quick', label: 'Quick & Easy', icon: Clock },
                { id: 'authentic', label: 'Authentic', icon: Users },
                { id: 'viral', label: 'Viral Hits', icon: Sparkles }
              ].map(({ id, label, icon: Icon }) => (
                <Button
                  key={id}
                  onClick={() => {
                    setSelectedFilter(id);
                    trackEvent('enhanced_reel_filter_changed', 'recipe_reels', id);
                  }}
                  className={`flex items-center gap-2 ${
                    selectedFilter === id
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Button>
              ))}
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-gray-600">
              Showing {filteredReels.length} enhanced recipe{filteredReels.length !== 1 ? 's' : ''}
              {searchQuery && ` for "${searchQuery}"`}
            </p>
          </div>

          {/* Enhanced Recipe Grid */}
          {filteredReels.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredReels.map((reel) => (
                <EnhancedReelCard key={reel.id} reel={reel} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="p-4 rounded-full mx-auto w-fit mb-4 bg-gray-100">
                <Filter className="h-16 w-16 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No recipes found</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery 
                  ? `No enhanced recipes match "${searchQuery}". Try a different search term.`
                  : 'No recipes match your current filters. Try adjusting your filters.'
                }
              </p>
              <Button onClick={() => {
                setSearchQuery('');
                setSelectedFilter('all');
              }}>
                Clear Filters
              </Button>
            </div>
          )}

          {/* Feature Information */}
          <div className="mt-12 bg-white rounded-xl p-8 border border-gray-100">
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#3c3c3c' }}>
              ✨ Enhanced Recipe Experience
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-lg mb-3 text-green-700">🍳 Rich Recipe Details</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Detailed cooking time and serving information</li>
                  <li>• Difficulty levels and cuisine classifications</li>
                  <li>• Calorie counts and nutrition highlights</li>
                  <li>• Budget estimates for grocery shopping</li>
                  <li>• Community ratings and reviews</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-3 text-blue-700">⚡ Smart Interactions</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• One-click ingredient addition to shopping lists</li>
                  <li>• Interactive rating system for recipes</li>
                  <li>• Full recipe preview with step-by-step instructions</li>
                  <li>• Social sharing with recipe links</li>
                  <li>• Advanced recipe categorization and tags</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EnhancedReelsPage() {
  return (
    <ErrorBoundary>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading enhanced recipe reels...</p>
          </div>
        </div>
      }>
        <EnhancedReelsContent />
      </Suspense>
    </ErrorBoundary>
  );
} 