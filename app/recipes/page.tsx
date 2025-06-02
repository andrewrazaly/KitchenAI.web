'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Search, Filter, ChevronRight, Loader2, ChefHat, Heart, Clock, Users, BookOpen, Play, Sparkles } from "lucide-react";
import { getReelsWithRecipes, SavedReel } from '../../feature_import_instagram/lib/saved-reels-service';
import { useSupabase } from '../hooks/useSupabase';
import Link from 'next/link';
import ShoppingListGenerator from '../components/ShoppingListGenerator';
import ShoppingListTrigger from '../components/ShoppingListTrigger';

interface StatsData {
  totalRecipes: number;
  totalSaves: number;
  totalCookTime: number;
  favoriteCategory: string;
}

export default function RecipesPage() {
  const { isSignedIn } = useAuth();
  const supabase = useSupabase();
  const [reels, setReels] = useState<SavedReel[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatsData>({
    totalRecipes: 0,
    totalSaves: 0,
    totalCookTime: 0,
    favoriteCategory: 'Italian'
  });
  const [showShoppingListGenerator, setShowShoppingListGenerator] = useState(false);

  useEffect(() => {
    async function loadReels() {
      try {
        const reelsWithRecipes = await getReelsWithRecipes(supabase);
        setReels(reelsWithRecipes || []);
      } catch (error) {
        console.error('Error loading reels:', error);
        setReels([]);
      } finally {
        setLoading(false);
      }
    }

    if (isSignedIn) {
      loadReels();
    } else {
      setLoading(false);
    }
  }, [isSignedIn, supabase]);

  const handleTriggerGeneration = () => {
    setShowShoppingListGenerator(true);
    // Scroll to the shopping list generator
    setTimeout(() => {
      const element = document.getElementById('shopping-list-generator');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  // Calculate stats from loaded reels
  useEffect(() => {
    if (reels.length > 0) {
      const totalCookTime = reels.reduce((acc, reel) => {
        const timeMatch = reel.cookingTime?.match(/(\d+)/);
        return acc + (timeMatch ? parseInt(timeMatch[1]) : 20);
      }, 0);

      setStats({
        totalRecipes: reels.length,
        totalSaves: reels.length,
        totalCookTime,
        favoriteCategory: 'Italian'
      });
    }
  }, [reels]);

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
    <div className="min-h-screen" style={{ backgroundColor: '#f8f8f8' }}>
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2 flex items-center gap-3" style={{ color: '#3c3c3c' }}>
                  <ChefHat className="h-8 w-8" style={{ color: '#91c11e' }} />
                  Recipe Collection
                </h1>
                <p style={{ color: '#888888' }}>
                  Discover, save, and cook amazing recipes from top chefs
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" style={{ color: '#91c11e' }} />
                <span className="text-sm font-medium" style={{ color: '#659a41' }}>
                  {stats.totalRecipes} recipes available
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Stats Cards */}
          {isSignedIn && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              <Card className="border border-gray-100 bg-white shadow-sm">
                <CardContent className="p-4 md:p-6 text-center">
                  <div className="p-3 rounded-full mx-auto mb-3 w-fit" style={{ backgroundColor: '#f8fff0' }}>
                    <BookOpen className="h-6 w-6" style={{ color: '#91c11e' }} />
                  </div>
                  <p className="text-2xl font-bold" style={{ color: '#3c3c3c' }}>{stats.totalRecipes}</p>
                  <p className="text-sm" style={{ color: '#888888' }}>Total Recipes</p>
                </CardContent>
              </Card>

              <Card className="border border-gray-100 bg-white shadow-sm">
                <CardContent className="p-4 md:p-6 text-center">
                  <div className="p-3 rounded-full mx-auto mb-3 w-fit" style={{ backgroundColor: '#fff0f0' }}>
                    <Heart className="h-6 w-6" style={{ color: '#f56565' }} />
                  </div>
                  <p className="text-2xl font-bold" style={{ color: '#3c3c3c' }}>{stats.totalSaves}</p>
                  <p className="text-sm" style={{ color: '#888888' }}>Saved Recipes</p>
                </CardContent>
              </Card>

              <Card className="border border-gray-100 bg-white shadow-sm">
                <CardContent className="p-4 md:p-6 text-center">
                  <div className="p-3 rounded-full mx-auto mb-3 w-fit" style={{ backgroundColor: '#fff8f0' }}>
                    <Clock className="h-6 w-6" style={{ color: '#ef9d17' }} />
                  </div>
                  <p className="text-2xl font-bold" style={{ color: '#3c3c3c' }}>{Math.round(stats.totalCookTime / 60)}h</p>
                  <p className="text-sm" style={{ color: '#888888' }}>Cook Time</p>
                </CardContent>
              </Card>

              <Card className="border border-gray-100 bg-white shadow-sm">
                <CardContent className="p-4 md:p-6 text-center">
                  <div className="p-3 rounded-full mx-auto mb-3 w-fit" style={{ backgroundColor: '#f0f8f0' }}>
                    <Users className="h-6 w-6" style={{ color: '#659a41' }} />
                  </div>
                  <p className="text-2xl font-bold" style={{ color: '#3c3c3c' }}>{stats.favoriteCategory}</p>
                  <p className="text-sm" style={{ color: '#888888' }}>Favorite</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* AI Shopping List Trigger */}
          <ShoppingListTrigger onTriggerGeneration={handleTriggerGeneration} />

          {/* Shopping List Generator */}
          <div id="shopping-list-generator">
            {showShoppingListGenerator && <ShoppingListGenerator />}
          </div>

          {/* Main Navigation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/recipes/my-recipes">
              <Card className="group cursor-pointer transition-all duration-200 hover:shadow-lg border border-gray-100 bg-white hover:scale-105">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-full" style={{ backgroundColor: '#f8fff0' }}>
                      <BookOpen className="h-6 w-6" style={{ color: '#91c11e' }} />
                    </div>
                    <CardTitle className="text-lg" style={{ color: '#3c3c3c' }}>My Recipes</CardTitle>
                  </div>
                  <ChevronRight className="h-5 w-5 transition-colors" style={{ color: '#888888' }} />
                </CardHeader>
                <CardContent>
                  <p className="text-sm" style={{ color: '#888888' }}>
                    Your personal recipe collection and favorites
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/recipes/discover">
              <Card className="group cursor-pointer transition-all duration-200 hover:shadow-lg border border-gray-100 bg-white hover:scale-105">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-full" style={{ backgroundColor: '#fff8f0' }}>
                      <Sparkles className="h-6 w-6" style={{ color: '#ef9d17' }} />
                    </div>
                    <CardTitle className="text-lg" style={{ color: '#3c3c3c' }}>Discover</CardTitle>
                  </div>
                  <ChevronRight className="h-5 w-5 transition-colors" style={{ color: '#888888' }} />
                </CardHeader>
                <CardContent>
                  <p className="text-sm" style={{ color: '#888888' }}>
                    Explore new recipes and culinary inspiration
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/recipes/recipe-reels">
              <Card className="group cursor-pointer transition-all duration-200 hover:shadow-lg border border-gray-100 bg-white hover:scale-105">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-full" style={{ backgroundColor: '#fffef0' }}>
                      <Play className="h-6 w-6" style={{ color: '#E8DE10' }} />
                    </div>
                    <CardTitle className="text-lg" style={{ color: '#3c3c3c' }}>Recipe Reels</CardTitle>
                  </div>
                  <ChevronRight className="h-5 w-5 transition-colors" style={{ color: '#888888' }} />
                </CardHeader>
                <CardContent>
                  <p className="text-sm" style={{ color: '#888888' }}>
                    Watch step-by-step cooking videos from chefs
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Recent Recipe Reels */}
          <div>
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#3c3c3c' }}>
              Trending Recipe Reels
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: "5-Minute Avocado Toast",
                  chef: "@healthy_chef",
                  time: "5 min",
                  views: "2.3M",
                  thumbnail: "🥑"
                },
                {
                  title: "Perfect Pasta Carbonara",
                  chef: "@italian_master",
                  time: "15 min", 
                  views: "1.8M",
                  thumbnail: "🍝"
                },
                {
                  title: "Cloud Bread Recipe",
                  chef: "@baking_queen",
                  time: "20 min",
                  views: "4.1M", 
                  thumbnail: "🍞"
                }
              ].map((reel, index) => (
                <Card key={index} className="group cursor-pointer transition-all duration-200 hover:shadow-lg border border-gray-100 bg-white">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="text-3xl">{reel.thumbnail}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1" style={{ color: '#3c3c3c' }}>
                          {reel.title}
                        </h3>
                        <p className="text-sm mb-2" style={{ color: '#888888' }}>
                          By {reel.chef}
                        </p>
                        <div className="flex items-center gap-3 text-xs" style={{ color: '#888888' }}>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {reel.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <Play className="h-3 w-3" />
                            {reel.views} views
                          </span>
                        </div>
                      </div>
                      <Heart className="h-5 w-5 transition-colors hover:text-red-500" style={{ color: '#888888' }} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Popular Categories */}
          <div>
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#3c3c3c' }}>
              Popular Categories
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[
                { name: "Italian", emoji: "🍕", color: "#f8fff0" },
                { name: "Asian", emoji: "🍜", color: "#fff8f0" },
                { name: "Mexican", emoji: "🌮", color: "#fffef0" },
                { name: "Healthy", emoji: "🥗", color: "#f0f8f0" },
                { name: "Desserts", emoji: "🍰", color: "#fff0f8" },
                { name: "Quick", emoji: "⚡", color: "#f0fff8" }
              ].map((category, index) => (
                <Card key={index} className="group cursor-pointer transition-all duration-200 hover:shadow-lg border border-gray-100 bg-white hover:scale-105">
                  <CardContent className="p-4 text-center">
                    <div className="p-3 rounded-full mx-auto mb-2 w-fit" style={{ backgroundColor: category.color }}>
                      <span className="text-2xl">{category.emoji}</span>
                    </div>
                    <p className="font-medium text-sm" style={{ color: '#3c3c3c' }}>
                      {category.name}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 