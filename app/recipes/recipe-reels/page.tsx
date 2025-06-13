'use client';

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import RecipeReelsSkeleton from '../../components/RecipeReelsSkeleton';
import ErrorBoundary, { useErrorHandler } from '../../components/ErrorBoundary';
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { 
  Play, 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  Search, 
  Filter,
  Clock,
  Users,
  ChefHat,
  Instagram,
  AlertCircle
} from "lucide-react";
import { useNotification } from '../../components/Notification';

interface RecipeReel {
  id: string;
  title: string;
  description: string;
  creator: {
    name: string;
    username: string;
    avatar: string;
    verified: boolean;
  };
  video: {
    thumbnail: string;
    duration: string;
    url: string;
  };
  stats: {
    likes: number;
    comments: number;
    shares: number;
    saves: number;
  };
  tags: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  cookTime: string;
  servings: number;
  isSaved: boolean;
  isLiked: boolean;
}

// Mock data for recipe reels
const mockRecipeReels: RecipeReel[] = [
  {
    id: '1',
    title: '60-Second Pasta Carbonara',
    description: 'Authentic Italian carbonara made in just one minute! Perfect for busy weeknights.',
    creator: {
      name: 'Chef Marco',
      username: '@chefmarco_official',
      avatar: '/lemon.svg',
      verified: true
    },
    video: {
      thumbnail: '/lemon.svg',
      duration: '0:58',
      url: '#'
    },
    stats: {
      likes: 12500,
      comments: 234,
      shares: 89,
      saves: 1200
    },
    tags: ['Italian', 'Quick', 'Pasta'],
    difficulty: 'Easy',
    cookTime: '5 min',
    servings: 2,
    isSaved: false,
    isLiked: false
  },
  {
    id: '2',
    title: 'Viral TikTok Feta Pasta',
    description: 'The pasta that broke the internet! Creamy, delicious, and so easy to make.',
    creator: {
      name: 'FoodieLife',
      username: '@foodielife',
      avatar: '/lemon.svg',
      verified: false
    },
    video: {
      thumbnail: '/lemon.svg',
      duration: '1:23',
      url: '#'
    },
    stats: {
      likes: 45600,
      comments: 892,
      shares: 234,
      saves: 3400
    },
    tags: ['Viral', 'Pasta', 'Feta', 'Easy'],
    difficulty: 'Easy',
    cookTime: '25 min',
    servings: 4,
    isSaved: true,
    isLiked: true
  },
  // Add more mock data...
];

function RecipeReelsContent() {
  const { isSignedIn, loading: authLoading } = useAuth();
  const { showNotification } = useNotification();
  const { handleError } = useErrorHandler();
  const router = useRouter();
  
  const [reels, setReels] = useState<RecipeReel[]>([]);
  const [filteredReels, setFilteredReels] = useState<RecipeReel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Load recipe reels
  useEffect(() => {
    const loadReels = async () => {
      try {
        setIsLoading(true);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // In a real app, this would be an API call
        setReels(mockRecipeReels);
        setFilteredReels(mockRecipeReels);
        
      } catch (error) {
        console.error('Error loading reels:', error);
        handleError(new Error('Failed to load recipe reels'));
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
        reel.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reel.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reel.creator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reel.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply category filter
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(reel => {
        switch (selectedFilter) {
          case 'saved':
            return reel.isSaved;
          case 'quick':
            return reel.tags.includes('Quick') || reel.cookTime.includes('min') && parseInt(reel.cookTime) <= 15;
          case 'easy':
            return reel.difficulty === 'Easy';
          case 'viral':
            return reel.tags.includes('Viral') || reel.stats.likes > 20000;
          default:
            return true;
        }
      });
    }

    setFilteredReels(filtered);
  }, [reels, searchQuery, selectedFilter]);

  const handleSaveReel = async (reelId: string) => {
    try {
      if (!isSignedIn) {
        showNotification('Please sign in to save recipes', 'error');
        return;
      }

      const updatedReels = reels.map(reel => 
        reel.id === reelId 
          ? { ...reel, isSaved: !reel.isSaved, stats: { ...reel.stats, saves: reel.isSaved ? reel.stats.saves - 1 : reel.stats.saves + 1 } }
          : reel
      );
      
      setReels(updatedReels);
      
      const reel = updatedReels.find(r => r.id === reelId);
      showNotification(
        reel?.isSaved ? 'Recipe saved! 📌' : 'Recipe removed from saved',
        reel?.isSaved ? 'success' : 'info'
      );
      
    } catch (error) {
      console.error('Error saving reel:', error);
      handleError(new Error('Failed to save recipe'));
    }
  };

  const handleLikeReel = async (reelId: string) => {
    try {
      if (!isSignedIn) {
        showNotification('Please sign in to like recipes', 'error');
        return;
      }

      const updatedReels = reels.map(reel => 
        reel.id === reelId 
          ? { ...reel, isLiked: !reel.isLiked, stats: { ...reel.stats, likes: reel.isLiked ? reel.stats.likes - 1 : reel.stats.likes + 1 } }
          : reel
      );
      
      setReels(updatedReels);
      
    } catch (error) {
      console.error('Error liking reel:', error);
      handleError(new Error('Failed to like recipe'));
    }
  };

  const loadMoreReels = async () => {
    try {
      setIsLoadingMore(true);
      
      // Simulate loading more reels
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, this would load more data from API
      showNotification('No more reels to load', 'info');
      
    } catch (error) {
      console.error('Error loading more reels:', error);
      handleError(new Error('Failed to load more reels'));
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Show loading state
  if (authLoading || isLoading) {
    return <RecipeReelsSkeleton />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Instagram className="h-8 w-8 text-pink-600" />
            Recipe Reels
          </h1>
          <p className="text-gray-600">
            Discover quick and delicious recipes from your favorite food creators
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search recipes, creators, or ingredients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'All Recipes', icon: ChefHat },
              { id: 'saved', label: 'Saved', icon: Bookmark },
              { id: 'quick', label: 'Quick & Easy', icon: Clock },
              { id: 'easy', label: 'Beginner Friendly', icon: Users },
              { id: 'viral', label: 'Trending', icon: Heart }
            ].map(({ id, label, icon: Icon }) => (
              <Button
                key={id}
                onClick={() => setSelectedFilter(id)}
                className={`flex items-center gap-2 ${
                  selectedFilter === id
                    ? 'bg-pink-600 text-white'
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
            Showing {filteredReels.length} recipe{filteredReels.length !== 1 ? 's' : ''}
            {searchQuery && ` for "${searchQuery}"`}
          </p>
        </div>

        {/* Recipe Grid */}
        {filteredReels.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredReels.map((reel) => (
              <Card key={reel.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {/* Video Thumbnail */}
                <div className="relative group cursor-pointer">
                  <img
                    src={reel.video.thumbnail}
                    alt={reel.title}
                    className="w-full h-64 object-cover"
                  />
                  
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-white/90 rounded-full p-3">
                      <Play className="h-6 w-6 text-gray-900" />
                    </div>
                  </div>
                  
                  {/* Duration Badge */}
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
                    {reel.video.duration}
                  </div>
                  
                  {/* Save Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSaveReel(reel.id);
                    }}
                    className="absolute top-2 right-2 bg-white/90 rounded-full p-2 hover:bg-white transition-colors"
                  >
                    <Bookmark 
                      className={`h-4 w-4 ${reel.isSaved ? 'fill-pink-600 text-pink-600' : 'text-gray-600'}`} 
                    />
                  </button>
                </div>

                <CardContent className="p-4">
                  {/* Creator Info */}
                  <div className="flex items-start gap-3 mb-3">
                    <img
                      src={reel.creator.avatar}
                      alt={reel.creator.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <h4 className="font-medium text-sm truncate">{reel.creator.name}</h4>
                        {reel.creator.verified && (
                          <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{reel.creator.username}</p>
                    </div>
                  </div>

                  {/* Recipe Title & Description */}
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{reel.title}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{reel.description}</p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {reel.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-200">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Recipe Info */}
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {reel.cookTime}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {reel.servings} servings
                    </div>
                    <Badge className={`text-xs ${
                      reel.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                      reel.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {reel.difficulty}
                    </Badge>
                  </div>

                  {/* Stats and Actions */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleLikeReel(reel.id)}
                        className="flex items-center gap-1 text-gray-500 hover:text-pink-600 transition-colors"
                      >
                        <Heart className={`h-4 w-4 ${reel.isLiked ? 'fill-pink-600 text-pink-600' : ''}`} />
                        <span>{reel.stats.likes.toLocaleString()}</span>
                      </button>
                      <div className="flex items-center gap-1 text-gray-500">
                        <MessageCircle className="h-4 w-4" />
                        <span>{reel.stats.comments}</span>
                      </div>
                    </div>
                    <button className="text-gray-500 hover:text-gray-700 transition-colors">
                      <Share2 className="h-4 w-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No recipes found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery 
                ? `No recipes match "${searchQuery}". Try a different search term.`
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

        {/* Load More Button */}
        {filteredReels.length > 0 && (
          <div className="text-center mt-8">
            <Button
              onClick={loadMoreReels}
              disabled={isLoadingMore}
              className="flex items-center gap-2"
            >
              {isLoadingMore ? (
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <ChefHat className="h-4 w-4" />
              )}
              {isLoadingMore ? 'Loading...' : 'Load More Recipes'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function RecipeReelsPage() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<RecipeReelsSkeleton />}>
        <RecipeReelsContent />
      </Suspense>
    </ErrorBoundary>
  );
} 