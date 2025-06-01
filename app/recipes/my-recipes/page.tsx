'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Search, Plus, Filter, Star, Clock, Users, ChefHat } from "lucide-react";
import Link from 'next/link';

interface Recipe {
  id: string;
  title: string;
  description: string;
  cuisine: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  prepTime: number;
  cookTime: number;
  servings: number;
  rating: number;
  imageUrl?: string;
  tags: string[];
}

export default function MyRecipesPage() {
  const { isSignedIn } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCuisine, setFilterCuisine] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');

  // Mock data for now
  useEffect(() => {
    const mockRecipes: Recipe[] = [
      {
        id: '1',
        title: 'Spaghetti Carbonara',
        description: 'Classic Italian pasta dish with eggs, cheese, and pancetta',
        cuisine: 'Italian',
        difficulty: 'Medium',
        prepTime: 15,
        cookTime: 20,
        servings: 4,
        rating: 4.5,
        tags: ['pasta', 'dinner', 'quick']
      },
      {
        id: '2',
        title: 'Chicken Tikka Masala',
        description: 'Creamy and flavorful Indian curry with tender chicken',
        cuisine: 'Indian',
        difficulty: 'Medium',
        prepTime: 30,
        cookTime: 45,
        servings: 6,
        rating: 4.8,
        tags: ['curry', 'dinner', 'spicy']
      },
      {
        id: '3',
        title: 'Avocado Toast',
        description: 'Simple and healthy breakfast with fresh avocado',
        cuisine: 'American',
        difficulty: 'Easy',
        prepTime: 5,
        cookTime: 5,
        servings: 2,
        rating: 4.2,
        tags: ['breakfast', 'healthy', 'vegetarian']
      }
    ];
    setRecipes(mockRecipes);
  }, []);

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         recipe.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCuisine = !filterCuisine || recipe.cuisine === filterCuisine;
    const matchesDifficulty = !filterDifficulty || recipe.difficulty === filterDifficulty;
    
    return matchesSearch && matchesCuisine && matchesDifficulty;
  });

  if (!isSignedIn) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">My Recipes</h1>
          <p className="text-gray-600 mb-8">Sign in to access your personal recipe collection</p>
          <Link href="/auth/signin">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">My Recipes</h1>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Recipe
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="Search recipes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
              <select
                value={filterCuisine}
                onChange={(e) => setFilterCuisine(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Cuisines</option>
                <option value="American">American</option>
                <option value="Italian">Italian</option>
                <option value="Indian">Indian</option>
                <option value="Mexican">Mexican</option>
                <option value="Asian">Asian</option>
              </select>
              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Recipes Grid */}
        {filteredRecipes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <ChefHat className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No recipes found</h3>
              <p className="text-gray-600 mb-4">
                {recipes.length === 0 
                  ? "You haven't added any recipes yet."
                  : "No recipes match your current filters."
                }
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Recipe
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe) => (
              <Card key={recipe.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{recipe.title}</CardTitle>
                      <p className="text-sm text-gray-600">{recipe.cuisine}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm">{recipe.rating}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4 line-clamp-2">{recipe.description}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{recipe.prepTime + recipe.cookTime} min</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{recipe.servings} servings</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      recipe.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                      recipe.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {recipe.difficulty}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {recipe.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <Button className="w-full">
                    View Recipe
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 