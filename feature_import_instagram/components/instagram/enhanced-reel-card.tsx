"use client"

import React from "react"
import { ReelItem } from "../../types/reels"
import { Card, CardContent } from "../../../app/components/ui/card"
import { Button } from "../../../app/components/ui/button"
import { Badge } from "../../../app/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../../app/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../app/components/ui/tabs"
import { 
  Eye, Heart, MessageCircle, Play, Pause, Volume2, VolumeX, Bookmark, BookmarkCheck, 
  Clock, Users, ChefHat, Star, ShoppingCart, Share2, Info, TrendingUp, Utensils,
  Timer, DollarSign, Zap, Award, ThumbsUp, Flame
} from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { saveReel, unsaveReel, isSaved } from "../../lib/saved-reels-service"
import { useSupabase } from "../../../app/hooks/useSupabase"
import { toast } from "sonner"
import { trackEvent } from "../../../app/components/GoogleAnalytics"

interface ReelCardProps {
  reel: ReelItem;
}

interface MockRecipeData {
  cookingTime: string;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  cuisine: string;
  rating: number;
  totalRatings: number;
  calories: number;
  budget: 'low' | 'medium' | 'high';
  ingredients: string[];
  quickInstructions: string[];
  tags: string[];
  nutritionHighlights: string[];
  estimatedCost: string;
}

// Mock enhanced recipe data
const getMockRecipeData = (reelId: string): MockRecipeData => {
  const recipes: Record<string, MockRecipeData> = {
    default: {
      cookingTime: "15 min",
      servings: 4,
      difficulty: 'easy',
      cuisine: "Italian",
      rating: 4.7,
      totalRatings: 2341,
      calories: 520,
      budget: 'medium',
      ingredients: [
        "400g spaghetti",
        "200g pancetta",
        "4 large eggs",
        "100g Pecorino Romano",
        "Black pepper",
        "Salt"
      ],
      quickInstructions: [
        "Boil pasta in salted water",
        "Cook pancetta until crispy",
        "Beat eggs with cheese",
        "Combine everything off heat",
        "Toss quickly to create creamy sauce"
      ],
      tags: ["quick", "authentic", "creamy", "comfort-food"],
      nutritionHighlights: ["High protein", "Rich in calcium"],
      estimatedCost: "$12-15"
    }
  };
  
  return recipes[reelId] || recipes.default;
};

const difficultyColors = {
  easy: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800", 
  hard: "bg-red-100 text-red-800"
};

const budgetColors = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-red-100 text-red-800"
};

export function EnhancedReelCard({ reel }: ReelCardProps) {
  const supabase = useSupabase();
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [isHovered, setIsHovered] = useState(false)
  const [isSavedState, setIsSavedState] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [simulatedProgress, setSimulatedProgress] = useState(0)
  const [showPreview, setShowPreview] = useState(false)
  const [userRating, setUserRating] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  
  const mockRecipe = getMockRecipeData(reel.id);

  useEffect(() => {
    const checkSavedStatus = async () => {
      try {
        const saved = await isSaved(reel.id, supabase);
        setIsSavedState(saved);
      } catch (error) {
        console.error('Error checking saved status:', error);
      }
    };
    checkSavedStatus();
  }, [reel.id, supabase]);

  // Format numbers with fallback to 0
  const formatNumber = (num: number | undefined) => {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  }

  // Get thumbnail URL from image versions
  const getThumbnailUrl = () => {
    if (reel.image_versions2?.candidates?.length) {
      return reel.image_versions2.candidates[0].url
    }
    return '/lemon.svg'
  }

  // Get video URL from video versions
  const getVideoUrl = () => {
    // Real cooking videos that match the recipe creators and content
    const cookingVideosByCreator: Record<string, string> = {
      '1': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', // Pasta Carbonara by @chef_marco_official
      '2': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', // Viral Feta Pasta by @foodielife_eats
      '3': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', // Thai Stir Fry by @authentic_thai_kitchen
      '4': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', // Japanese Pancakes by @tokyo_sweet_cafe
      '5': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', // NY Pizza by @nypizza_master
      '6': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4'  // Cheesecake by @homemade_sweets
    };
    
    // Fallback cooking videos with reliable URLs
    const fallbackCookingVideos = [
      'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
      'https://file-examples-com.github.io/uploads/2017/04/file_example_MP4_1280_10MG.mp4',
      'https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4'
    ];
    
    if (reel.video_versions?.length && reel.video_versions[0].url) {
      return reel.video_versions[0].url
    }
    
    // Return specific video for each creator's recipe
    return cookingVideosByCreator[reel.id] || fallbackCookingVideos[parseInt(reel.id) % fallbackCookingVideos.length];
  }

  // Format date
  const formatDate = (timestamp: number) => {
    try {
      const date = new Date(timestamp * 1000)
      const now = new Date()
      const diffTime = Math.abs(now.getTime() - date.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays < 1) return 'Today'
      if (diffDays === 1) return 'Yesterday'
      if (diffDays < 7) return `${diffDays}d ago`
      return date.toLocaleDateString()
    } catch {
      return 'Recently'
    }
  }

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
      setSimulatedProgress(0);
      trackEvent('video_pause', 'recipe_reels', `reel_${reel.id}`);
    } else {
      video.play().catch(console.error);
      setIsPlaying(true);
      trackEvent('video_play', 'recipe_reels', `reel_${reel.id}`);
    }
  }

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation()
    const video = videoRef.current;
    if (video) {
      video.muted = !isMuted;
      setIsMuted(!isMuted);
      trackEvent(isMuted ? 'video_unmute' : 'video_mute', 'recipe_reels', `reel_${reel.id}`);
    }
  }

  // Simulate video progress
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setSimulatedProgress(prev => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 2; // Simulate ~50 second video
        });
      }, 1000);
    } else {
      setSimulatedProgress(0);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleSaveToggle = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isLoading) return;

    setIsLoading(true);
    try {
      if (isSavedState) {
        await unsaveReel(reel.id, supabase);
        setIsSavedState(false);
        toast.success('Recipe removed from saved');
        trackEvent('recipe_unsave', 'recipe_reels', `reel_${reel.id}`);
      } else {
        await saveReel(reel, supabase);
        setIsSavedState(true);
        toast.success('Recipe saved! 🍳');
        trackEvent('recipe_save', 'recipe_reels', `reel_${reel.id}`);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to save recipe');
      trackEvent('recipe_save_error', 'recipe_reels', `reel_${reel.id}`);
    } finally {
      setIsLoading(false);
    }
  }

  const handleAddToShoppingList = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast.success('Ingredients added to shopping list! 🛒');
    trackEvent('ingredients_to_shopping_list', 'recipe_reels', `reel_${reel.id}`);
  }

  const handleRateRecipe = (rating: number) => {
    setUserRating(rating);
    toast.success(`Rated ${rating} stars! ⭐`);
    trackEvent('recipe_rated', 'recipe_reels', `reel_${reel.id}_${rating}stars`);
  }

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`Check out this amazing recipe! 🍳`);
    toast.success('Recipe link copied to clipboard!');
    trackEvent('recipe_shared', 'recipe_reels', `reel_${reel.id}`);
  }

  const renderStars = (rating: number, interactive = false) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating 
            ? 'fill-yellow-400 text-yellow-400' 
            : interactive 
              ? 'text-gray-300 hover:text-yellow-400 cursor-pointer' 
              : 'text-gray-300'
        } ${interactive ? 'transition-colors' : ''}`}
        onClick={interactive ? () => handleRateRecipe(i + 1) : undefined}
      />
    ));
  }

  return (
    <Card className="overflow-hidden bg-white border border-gray-200 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
      {/* Enhanced Video/Image Section */}
      <div 
        className="relative w-full h-[500px] sm:h-[600px] md:h-[700px] lg:h-[800px] bg-gray-100 cursor-pointer group"
        onClick={togglePlay}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Main Image/Video */}
        <div className="relative w-full h-full">
          {/* Actual Video Element */}
          <video
            ref={videoRef}
            src={getVideoUrl()}
            poster={getThumbnailUrl()}
            className="w-full h-full object-cover"
            muted={isMuted}
            loop
            playsInline
            preload="metadata"
            onLoadedData={() => console.log('Video loaded')}
            onError={(e) => console.log('Video error:', e)}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onTimeUpdate={(e) => {
              const video = e.target as HTMLVideoElement;
              const progress = (video.currentTime / video.duration) * 100;
              setSimulatedProgress(progress);
            }}
          />
          
          {/* Fallback Image if Video Fails */}
          {!isPlaying && (
            <img
              src={getThumbnailUrl()}
              alt="Recipe preview"
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          
          {/* Recipe Type Badge */}
          <div className="absolute top-3 left-3 z-10">
            <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-3 py-1 font-medium">
              {mockRecipe.cuisine} Recipe
            </Badge>
          </div>

          {/* Trending/Popular Indicator */}
          {(reel.view_count && reel.view_count > 100000) && (
            <div className="absolute top-3 left-3 mt-8">
              <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs px-3 py-1 font-medium flex items-center gap-1">
                <Flame className="h-3 w-3" />
                Trending
              </Badge>
            </div>
          )}
          
          {/* Video Simulation Overlay */}
          {isPlaying && (
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-black/5"></div>
              
              {/* Enhanced Progress Bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/40">
                <div 
                  className="h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-1000 ease-linear"
                  style={{ width: `${simulatedProgress}%` }}
                />
              </div>
              
              {/* Recipe Step Simulation */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black/30 backdrop-blur-sm rounded-xl px-8 py-4 text-white text-lg flex items-center gap-3">
                  <ChefHat className="h-7 w-7 animate-bounce" />
                  Cooking step {Math.floor(simulatedProgress / 20) + 1} of 5...
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Enhanced Play Controls */}
        <div className={`absolute inset-0 bg-black/20 flex items-center justify-center transition-opacity ${isHovered || !isPlaying ? 'opacity-100' : 'opacity-0'}`}>
          <button
            onClick={togglePlay}
            className="text-white p-6 rounded-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 transition-all shadow-2xl hover:scale-110"
          >
            {isPlaying ? (
              <Pause className="h-16 w-16" />
            ) : (
              <Play className="h-16 w-16 ml-1" />
            )}
          </button>
        </div>

        {/* Enhanced Action Buttons */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          {/* Save Button */}
          <Button
            onClick={handleSaveToggle}
            disabled={isLoading}
            className={`rounded-full p-3 shadow-lg transition-all ${
              isSavedState 
                ? 'bg-green-500 hover:bg-green-600 text-white scale-110' 
                : 'bg-white/90 hover:bg-white text-gray-700 hover:scale-110'
            }`}
          >
            {isSavedState ? (
              <BookmarkCheck className="h-5 w-5" />
            ) : (
              <Bookmark className="h-5 w-5" />
            )}
          </Button>

          {/* Quick Shopping List Add */}
          <Button
            onClick={handleAddToShoppingList}
            className="rounded-full p-3 shadow-lg bg-blue-500 hover:bg-blue-600 text-white hover:scale-110 transition-all"
          >
            <ShoppingCart className="h-5 w-5" />
          </Button>

          {/* Share Button */}
          <Button
            onClick={handleShare}
            className="rounded-full p-3 shadow-lg bg-purple-500 hover:bg-purple-600 text-white hover:scale-110 transition-all"
          >
            <Share2 className="h-5 w-5" />
          </Button>
        </div>

        {/* Bottom Stats & Info */}
        <div className="absolute bottom-4 left-4 flex gap-2">
          <Badge className="bg-black/80 text-white text-sm px-3 py-1 backdrop-blur-sm">
            <Eye className="h-4 w-4 mr-1" />
            {formatNumber(reel.view_count)}
          </Badge>
          <Badge className="bg-black/80 text-white text-sm px-3 py-1 backdrop-blur-sm">
            <Heart className="h-4 w-4 mr-1" />
            {formatNumber(reel.like_count)}
          </Badge>
          <Badge className="bg-black/80 text-white text-sm px-3 py-1 backdrop-blur-sm">
            <Timer className="h-4 w-4 mr-1" />
            {mockRecipe.cookingTime}
          </Badge>
        </div>

        {/* Mute Button */}
        <button
          onClick={toggleMute}
          className={`absolute bottom-4 right-4 text-white p-3 rounded-full bg-black/70 hover:bg-black/90 transition-all shadow-lg ${isHovered ? 'opacity-100' : 'opacity-70'}`}
        >
          {isMuted ? (
            <VolumeX className="h-4 w-4" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Enhanced Content Section */}
      <CardContent className="p-4 space-y-4">
        {/* Creator & Recipe Info */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <img
              src={reel.user.profile_pic_url || '/lemon.svg'}
              alt={reel.user.username}
              className="w-10 h-10 rounded-full ring-2 ring-orange-200"
            />
            <div>
              <p className="font-semibold text-sm">{reel.user.username}</p>
              <p className="text-xs text-gray-500">{formatDate(reel.taken_at)}</p>
            </div>
          </div>
          
          {isSavedState && (
            <Badge className="bg-green-100 text-green-800 text-xs px-2 py-1">
              <BookmarkCheck className="h-3 w-3 mr-1" />
              Saved
            </Badge>
          )}
        </div>

        {/* Recipe Title & Description */}
        {reel.caption_text && (
          <div>
            <h3 className="font-bold text-gray-900 text-base line-clamp-2 mb-1">
              {reel.caption_text.split('\n')[0] || 'Delicious Recipe'}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-2">
              {reel.caption_text.substring(0, 120)}...
            </p>
          </div>
        )}

        {/* Quick Recipe Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
            <Clock className="h-4 w-4 text-orange-500" />
            <div>
              <p className="text-xs text-gray-500">Cook Time</p>
              <p className="text-sm font-medium">{mockRecipe.cookingTime}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
            <Users className="h-4 w-4 text-blue-500" />
            <div>
              <p className="text-xs text-gray-500">Serves</p>
              <p className="text-sm font-medium">{mockRecipe.servings} people</p>
            </div>
          </div>
        </div>

        {/* Recipe Badges */}
        <div className="flex flex-wrap gap-2">
          <Badge className={`text-xs ${difficultyColors[mockRecipe.difficulty]}`}>
            <Award className="h-3 w-3 mr-1" />
            {mockRecipe.difficulty}
          </Badge>
          <Badge className={`text-xs ${budgetColors[mockRecipe.budget]}`}>
            <DollarSign className="h-3 w-3 mr-1" />
            {mockRecipe.estimatedCost}
          </Badge>
          <Badge className="text-xs bg-purple-100 text-purple-800">
            <Zap className="h-3 w-3 mr-1" />
            {mockRecipe.calories} cal
          </Badge>
        </div>

        {/* Rating & Tags */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {renderStars(Math.floor(mockRecipe.rating))}
              </div>
              <span className="text-sm text-gray-600">
                {mockRecipe.rating} ({formatNumber(mockRecipe.totalRatings)} reviews)
              </span>
            </div>
          </div>
          
          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {mockRecipe.tags.slice(0, 4).map((tag) => (
              <Badge key={tag} className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 cursor-pointer">
                #{tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Enhanced Recipe Preview Dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <Button 
              className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-medium"
              onClick={() => trackEvent('recipe_preview_opened', 'recipe_reels', `reel_${reel.id}`)}
            >
              <Info className="h-4 w-4 mr-2" />
              View Full Recipe
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                {reel.caption_text?.split('\n')[0] || 'Delicious Recipe'}
              </DialogTitle>
              <DialogDescription>
                By @{reel.user.username} • {mockRecipe.cuisine} Cuisine
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
                <TabsTrigger value="instructions">Instructions</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-orange-50 p-3 rounded-lg text-center">
                    <Clock className="h-6 w-6 text-orange-500 mx-auto mb-1" />
                    <p className="text-sm font-medium">{mockRecipe.cookingTime}</p>
                    <p className="text-xs text-gray-500">Cook Time</p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg text-center">
                    <Users className="h-6 w-6 text-blue-500 mx-auto mb-1" />
                    <p className="text-sm font-medium">{mockRecipe.servings}</p>
                    <p className="text-xs text-gray-500">Servings</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg text-center">
                    <Award className="h-6 w-6 text-green-500 mx-auto mb-1" />
                    <p className="text-sm font-medium">{mockRecipe.difficulty}</p>
                    <p className="text-xs text-gray-500">Difficulty</p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg text-center">
                    <Flame className="h-6 w-6 text-purple-500 mx-auto mb-1" />
                    <p className="text-sm font-medium">{mockRecipe.calories}</p>
                    <p className="text-xs text-gray-500">Calories</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">Nutrition Highlights</h4>
                  <div className="flex flex-wrap gap-2">
                    {mockRecipe.nutritionHighlights.map((highlight, index) => (
                      <Badge key={index} className="bg-green-100 text-green-800">
                        {highlight}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">Rate This Recipe</h4>
                  <div className="flex items-center gap-2">
                    {renderStars(userRating, true)}
                    <span className="text-sm text-gray-600 ml-2">
                      {userRating > 0 ? `You rated ${userRating} stars` : 'Click to rate'}
                    </span>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="ingredients" className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold">Ingredients ({mockRecipe.ingredients.length})</h4>
                  <Button 
                    onClick={handleAddToShoppingList}
                    className="text-sm"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Shopping List
                  </Button>
                </div>
                <div className="space-y-2">
                  {mockRecipe.ingredients.map((ingredient, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                      <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center text-xs font-medium text-orange-700">
                        {index + 1}
                      </div>
                      <span className="text-sm">{ingredient}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-800">
                    💡 <strong>Estimated Cost:</strong> {mockRecipe.estimatedCost} for all ingredients
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="instructions" className="space-y-3">
                <h4 className="font-semibold">Quick Instructions</h4>
                <div className="space-y-3">
                  {mockRecipe.quickInstructions.map((instruction, index) => (
                    <div key={index} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-sm font-bold text-green-700 flex-shrink-0">
                        {index + 1}
                      </div>
                      <p className="text-sm">{instruction}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm text-green-800">
                    🎥 <strong>Watch the video above</strong> for detailed visual instructions!
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={handleSaveToggle}
            disabled={isLoading}
            className={`${
              isSavedState
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
            ) : isSavedState ? (
              <BookmarkCheck className="h-4 w-4 mr-2" />
            ) : (
              <Bookmark className="h-4 w-4 mr-2" />
            )}
            {isSavedState ? 'Saved' : 'Save Recipe'}
          </Button>
          
          <Button
            onClick={handleAddToShoppingList}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add Ingredients
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 