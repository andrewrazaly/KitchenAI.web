'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Search, Filter, ChevronRight, Loader2 } from "lucide-react";
import { getReelsWithRecipes, SavedReel } from '../../feature_import_instagram/lib/saved-reels-service';
import { useSupabase } from '../hooks/useSupabase';
import Link from 'next/link';

export default function RecipesPage() {
  const { isSignedIn } = useAuth();
  const supabase = useSupabase();
  const [searchQuery, setSearchQuery] = useState('');
  const [savedReelsWithRecipes, setSavedReelsWithRecipes] = useState<SavedReel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadReels() {
      try {
        const reelsWithRecipes = await getReelsWithRecipes(supabase);
        setSavedReelsWithRecipes(reelsWithRecipes || []);
      } catch (error) {
        console.error('Error loading reels:', error);
        setSavedReelsWithRecipes([]);
      } finally {
        setIsLoading(false);
      }
    }
    loadReels();
  }, [supabase]);

  if (!isSignedIn) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <h2 className="text-2xl font-semibold mb-4">Sign in to view recipes</h2>
          <p className="text-gray-600">Access your saved recipes and discover new ones!</p>
          <Link href="/auth/signin" className="inline-block mt-4">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-white min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Recipes</h1>
        <div className="flex gap-4">
          <div className="relative w-64">
            <Input
              type="text"
              placeholder="Search recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border-gray-200 text-gray-900 pr-10"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          </div>
          <Button className="flex items-center gap-2 border border-gray-200">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Link href="/recipes/saved-reels">
          <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">All Saved Reels</CardTitle>
              <ChevronRight className="h-5 w-5 text-gray-500" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                View all your saved Instagram reels
              </p>
              <p className="text-sm text-blue-600 mt-2">
                Browse & organize →
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/recipes/recipe-reels">
          <Card className="hover:bg-gray-50 transition-colors cursor-pointer border-2 border-orange-200 bg-orange-50">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                Recipe Reels
                <span className="text-orange-500">🍳</span>
              </CardTitle>
              <ChevronRight className="h-5 w-5 text-orange-600" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700">
                Instagram reels converted to full recipes
              </p>
              <p className="text-sm font-medium mt-2 text-orange-700">
                {savedReelsWithRecipes.length} recipe reels
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/recipes/my-recipes">
          <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">My Recipes</CardTitle>
              <ChevronRight className="h-5 w-5 text-gray-500" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Your personal recipe collection
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/recipes/discover">
          <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Discover</CardTitle>
              <ChevronRight className="h-5 w-5 text-gray-500" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Explore new recipes and inspiration
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Recipe Reels - Instagram reels with full recipes */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recipe Reels</h2>
          <Link 
            href="/recipes/recipe-reels"
            className="text-sm text-orange-600 hover:text-orange-800 transition-colors"
          >
            View all recipe reels →
          </Link>
        </div>
        <p className="text-gray-600 text-sm mb-4">
          Instagram reels you've saved and converted into complete recipes with ingredients and instructions
        </p>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : savedReelsWithRecipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedReelsWithRecipes.slice(0, 6).map((reel) => (
              <Card key={reel.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video relative">
                  {reel.image_versions2?.candidates?.[0]?.url ? (
                    <img
                      src={reel.image_versions2.candidates[0].url}
                      alt={reel.recipeName || "Recipe thumbnail"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-400 to-red-500">
                      <span className="text-white text-3xl">🍳</span>
                    </div>
                  )}
                  {/* Recipe badge */}
                  <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    Recipe
                  </div>
                  {/* Instagram badge */}
                  <div className="absolute top-2 left-2 bg-pink-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    📱 Reel
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-2">{reel.recipeName || 'Untitled Recipe'}</h3>
                  {reel.recipeDescription && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {reel.recipeDescription}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    {reel.cookingTime && (
                      <span className="flex items-center gap-1">
                        ⏱️ {reel.cookingTime}
                      </span>
                    )}
                    {reel.servings && (
                      <span className="flex items-center gap-1">
                        👥 {reel.servings} servings
                      </span>
                    )}
                    {reel.difficulty && (
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        reel.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                        reel.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {reel.difficulty}
                      </span>
                    )}
                  </div>

                  {reel.ingredients && reel.ingredients.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-medium text-gray-700 mb-1">Ingredients ({reel.ingredients.length}):</p>
                      <p className="text-xs text-gray-600">
                        {reel.ingredients.slice(0, 3).join(', ')}
                        {reel.ingredients.length > 3 && ` +${reel.ingredients.length - 3} more`}
                      </p>
                    </div>
                  )}

                  <Button className="w-full bg-orange-500 hover:bg-orange-600">
                    View Recipe
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-orange-50 rounded-lg border-2 border-dashed border-orange-200">
            <span className="text-4xl mb-4 block">🍳📱</span>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No recipe reels yet</h3>
            <p className="text-sm text-gray-600 mb-4">
              Save Instagram reels and convert them into full recipes with ingredients and instructions
            </p>
            <Link href="/instagram">
              <Button className="bg-orange-500 hover:bg-orange-600">
                Browse Instagram Reels
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 