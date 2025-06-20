'use client';

/*
USER REQUIREMENTS FOR INSTAGRAM PAGE:

1. API Integration:
   - Use the provided API that takes specific metadata from content creators
   - API should return real data for creators like @shredhappens
   - Required data fields from API:
     * Video (actual video files, not images)
     * Views count
     * Likes count  
     * Caption/headline text
     * Date posted

2. Display Requirements:
   - Show videos (not static images) in the reel cards
   - Display real view counts (like "2.5M", "895.3K", "1.2M")
   - Display real like counts (like "125.7K", "45.9K", "67.5K") 
   - Show actual captions from the content creator
   - Include date posted information

3. Functionality:
   - Working bookmark functionality to save specific reels for later reference
   - Users should be able to bookmark individual reels and access them later
   - Sort function should limit results to top 12 highest or lowest
   - Sort by: Date Posted, Views, Likes, etc.

4. UI Structure (from provided HTML):
   - Header: "Reels from @[username]"
   - Count: "X reels found • Click bookmark icon to save reels"
   - Sort controls: Dropdown + direction toggle
   - Grid layout: 1 col mobile, 2 col tablet, 3 col desktop
   - Each reel card should have:
     * Video element (not img)
     * Text overlay with caption at bottom
     * Bookmark button (top right)
     * Stats at bottom (views, likes)
     * Username display

5. Current Issues to Fix:
   - Replace SimpleReelCard with video-enabled cards
   - Connect to real API data instead of mock data
   - Implement actual bookmark saving/loading
   - Limit sort results to 12 items max
   - Replace placeholder images with actual videos
*/

import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../../feature_import_instagram/components/ui/button";
import { Input } from "../components/ui/input";
import { Search, Loader2, Instagram, User, AlertCircle, Heart, HeartOff, Plus, X, ChefHat } from "lucide-react";
import { fetchInstagramReels } from '../../feature_import_instagram/lib/instagram-service';
import { ReelsGrid } from '../../feature_import_instagram/components/instagram/reels-grid';
import { ReelData } from '../../feature_import_instagram/types/reels';
import { useSupabase } from '../hooks/useSupabase';
import { 
  getSavedCreators, 
  saveCreator, 
  unsaveCreator, 
  isCreatorSaved, 
  migrateLocalStorageToDatabase,
  SavedCreator 
} from '../../feature_import_instagram/lib/saved-creators-service';
import { migrateLocalStorageToDatabase as migrateSavedReelsToDatabase } from '../../feature_import_instagram/lib/saved-reels-service';
import { toast } from 'sonner';

export default function ExplorePage() {
  const { isSignedIn } = useAuth();
  const supabase = useSupabase();
  const [username, setUsername] = useState('');
  const [reelsData, setReelsData] = useState<ReelData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [savedCreators, setSavedCreators] = useState<SavedCreator[]>([]);
  const [showAddCreator, setShowAddCreator] = useState(false);
  const [newCreatorName, setNewCreatorName] = useState('');
  const [isLoadingCreators, setIsLoadingCreators] = useState(true);

  // Load saved creators from database/localStorage
  useEffect(() => {
    loadSavedCreators();
  }, [supabase, isSignedIn]);

  // Migrate localStorage data to database when user signs in
  useEffect(() => {
    if (isSignedIn && supabase) {
      // Migrate both saved creators and saved reels
      Promise.all([
        migrateLocalStorageToDatabase(supabase),
        migrateSavedReelsToDatabase(supabase)
      ]).then(() => {
        // Reload creators after migration
        loadSavedCreators();
      });
    }
  }, [isSignedIn, supabase]);

  const loadSavedCreators = async () => {
    try {
      setIsLoadingCreators(true);
      const creators = await getSavedCreators(supabase);
      setSavedCreators(creators);
    } catch (error) {
      console.error('Error loading saved creators:', error);
      toast.error('Failed to load saved creators');
    } finally {
      setIsLoadingCreators(false);
    }
  };

  const handleSearch = async () => {
    if (!username.trim()) {
      setError('Please enter an Instagram username');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setHasSearched(true);
      
      // Use the real RapidAPI Instagram service
      const data = await fetchInstagramReels({
        username_or_id_or_url: username.trim()
      });
      
      setReelsData(data);
      
    } catch (err: any) {
      console.error('Error fetching reels:', err);
      setError(err.message || 'Failed to load Instagram reels. Please try again.');
      setReelsData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const addCreatorToSaved = async (creatorName: string) => {
    const cleanName = creatorName.replace('@', '').trim().toLowerCase();
    if (!cleanName) return;

    try {
      // Check if already saved
      const alreadySaved = await isCreatorSaved(cleanName, supabase);
      if (alreadySaved) {
        toast.info('Creator already saved');
        return;
      }

      await saveCreator({ creator_username: cleanName }, supabase);
      await loadSavedCreators(); // Refresh the list
      toast.success(`@${cleanName} saved to your creators list`);
    } catch (error: any) {
      console.error('Error saving creator:', error);
      toast.error(error.message || 'Failed to save creator');
    }
  };

  const removeCreatorFromSaved = async (creatorName: string) => {
    try {
      await unsaveCreator(creatorName, supabase);
      await loadSavedCreators(); // Refresh the list
      toast.success(`@${creatorName} removed from your list`);
    } catch (error) {
      console.error('Error removing creator:', error);
      toast.error('Failed to remove creator');
    }
  };

  const checkIsCreatorSaved = (creatorName: string) => {
    const cleanName = creatorName.replace('@', '').toLowerCase();
    return savedCreators.some(creator => creator.creator_username === cleanName);
  };

  const handleAddNewCreator = async () => {
    const cleanName = newCreatorName.replace('@', '').trim().toLowerCase();
    if (cleanName) {
      await addCreatorToSaved(cleanName);
      setNewCreatorName('');
      setShowAddCreator(false);
    }
  };

  const handleSaveCurrentCreator = async () => {
    if (username.trim()) {
      await addCreatorToSaved(username.trim());
    }
  };

  const handleDiscoverRecipes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setHasSearched(true);
      setUsername('tasty'); // Use a popular food creator for recipe discovery
      
      // Use the real RapidAPI Instagram service for recipe discovery
      const data = await fetchInstagramReels({
        username_or_id_or_url: 'tasty'
      });
      
      setReelsData(data);
      
    } catch (err: any) {
      console.error('Error fetching recipe reels:', err);
      setError(err.message || 'Failed to load recipe reels. Please try again.');
      setReelsData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const popularCreators = [
    'gordonramsay',
    'thefoodbabe',
    'tasty',
    'buzzfeedtasty',
    'foodnetwork',
    'jamieoliver',
    'bonappetitmag',
    'seriouseats'
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-gradient-to-r from-pink-500 to-orange-500">
              <Instagram className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
              Explore Creators
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            🔥 <strong>Your main recipe discovery hub!</strong> Search for food creators, save their best cooking content, and build your personal recipe collection.
          </p>
          <div className="mt-4 flex items-center justify-center gap-6 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Real Instagram content
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Save & organize recipes
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              Follow your favorites
            </span>
          </div>
        </div>

        {/* Search Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search Instagram Creator
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Enter Instagram username (e.g., gordonramsay)"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full"
                />
              </div>
              <Button
                onClick={handleSearch}
                disabled={isLoading || !username.trim()}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                {isLoading ? 'Searching...' : 'Search'}
              </Button>
              <Button
                onClick={handleDiscoverRecipes}
                disabled={isLoading}
                variant="outline"
                className="flex items-center gap-2"
              >
                <ChefHat className="h-4 w-4" />
                Discover Recipes
              </Button>
              {username.trim() && username !== 'recipe_discovery' && !checkIsCreatorSaved(username.trim()) && (
                <Button
                  variant="outline"
                  onClick={handleSaveCurrentCreator}
                  className="flex items-center gap-2"
                >
                  <Heart className="h-4 w-4" />
                  Save Creator
                </Button>
              )}
            </div>

            {/* Popular Creators */}
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-3">Popular food creators:</p>
              <div className="flex flex-wrap gap-2">
                {popularCreators.map((creator) => (
                  <Button
                    key={creator}
                    variant="outline"
                    size="sm"
                    onClick={() => setUsername(creator)}
                    className="text-xs"
                  >
                    @{creator}
                  </Button>
                ))}
              </div>
            </div>

            {/* Saved Creators */}
            {isLoadingCreators ? (
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Loading your saved creators...</span>
              </div>
            ) : savedCreators.length > 0 ? (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-gray-600">Your saved creators ({savedCreators.length}):</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAddCreator(!showAddCreator)}
                    className="text-xs"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Creator
                  </Button>
                </div>
                
                {showAddCreator && (
                  <div className="flex gap-2 mb-3">
                    <Input
                      type="text"
                      placeholder="Enter username to save"
                      value={newCreatorName}
                      onChange={(e) => setNewCreatorName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddNewCreator()}
                      className="flex-1"
                    />
                    <Button size="sm" onClick={handleAddNewCreator}>
                      Add
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setShowAddCreator(false);
                        setNewCreatorName('');
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {savedCreators.map((creator) => (
                    <div key={creator.creator_username} className="flex items-center gap-1">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setUsername(creator.creator_username)}
                        className="text-xs pr-1"
                        title={creator.creator_display_name || `@${creator.creator_username}`}
                      >
                        <Heart className="h-3 w-3 mr-1 text-red-500 fill-current" />
                        @{creator.creator_username}
                        {creator.is_verified && (
                          <span className="ml-1 text-blue-500">✓</span>
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCreatorFromSaved(creator.creator_username)}
                        className="h-6 w-6 p-0 hover:bg-red-100"
                        title={`Remove @${creator.creator_username}`}
                      >
                        <X className="h-3 w-3 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Add Creator Button for empty state */
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddCreator(!showAddCreator)}
                  className="text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Save Your Favorite Creators
                </Button>
                
                {showAddCreator && (
                  <div className="flex gap-2 mt-3">
                    <Input
                      type="text"
                      placeholder="Enter username to save (e.g., gordonramsay)"
                      value={newCreatorName}
                      onChange={(e) => setNewCreatorName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddNewCreator()}
                      className="flex-1"
                    />
                    <Button onClick={handleAddNewCreator}>
                      Add
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setShowAddCreator(false);
                        setNewCreatorName('');
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Database Status Info */}
        {isSignedIn && (
          <Card className="mb-8 border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Heart className="h-5 w-5 text-green-600 fill-current" />
                <div>
                  <p className="text-green-800 font-medium">Database sync enabled</p>
                  <p className="text-green-700 text-sm">
                    Your saved creators and reels are securely stored and synced across all your devices.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Authentication Notice */}
        {!isSignedIn && (
          <Card className="mb-8 border-amber-200 bg-amber-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <div>
                  <p className="text-amber-800 font-medium">Sign in for full features</p>
                  <p className="text-amber-700 text-sm">
                    You can search and view reels, but sign in to save creators and reels across devices.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Display */}
        {error && (
          <Card className="mb-8 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-red-800 font-medium">Error</p>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {isLoading && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Loading reels from @{username}...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {!isLoading && reelsData && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {username === 'recipe_discovery' ? (
                    <>
                      <ChefHat className="h-5 w-5" />
                      <CardTitle>Trending Recipe Reels</CardTitle>
                    </>
                  ) : (
                    <>
                      <User className="h-5 w-5" />
                      <CardTitle>Reels from @{username}</CardTitle>
                    </>
                  )}
                </div>
                {username !== 'recipe_discovery' && !checkIsCreatorSaved(username) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSaveCurrentCreator}
                    className="flex items-center gap-2"
                  >
                    <Heart className="h-4 w-4" />
                    Save Creator
                  </Button>
                )}
              </div>
              <p className="text-sm text-gray-600">
                {reelsData.data.items.length} reels found
                {username === 'recipe_discovery' 
                  ? " • Click save to add recipes to your collection"
                  : isSignedIn && " • Click the bookmark icon to save reels"
                }
              </p>
            </CardHeader>
            <CardContent>
              <ReelsGrid data={reelsData} />
            </CardContent>
          </Card>
        )}

        {/* No Results */}
        {!isLoading && hasSearched && reelsData && reelsData.data.items.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No reels found</h3>
                <p className="text-gray-600 mb-4">
                  We couldn't find any reels for @{username}. This could be because:
                </p>
                <ul className="text-sm text-gray-500 text-left max-w-md mx-auto space-y-1">
                  <li>• The username doesn't exist</li>
                  <li>• The account is private</li>
                  <li>• The account doesn't have any reels</li>
                  <li>• There was a temporary issue with Instagram</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Getting Started */}
        {!hasSearched && (
          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Search for a creator</p>
                    <p className="text-sm text-gray-600">Enter an Instagram username in the search box above</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Save your favorite creators</p>
                    <p className="text-sm text-gray-600">Click "Save Creator" to add them to your personal list</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Browse their reels</p>
                    <p className="text-sm text-gray-600">View cooking videos and recipe content</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                    4
                  </div>
                  <div>
                    <p className="font-medium">Save your favorites</p>
                    <p className="text-sm text-gray-600">
                      {isSignedIn 
                        ? "Click the bookmark icon to save reels to your collection"
                        : "Sign in to save reels to your collection"
                      }
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 