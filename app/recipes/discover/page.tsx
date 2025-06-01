'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Search, Star, Clock, Users, ChefHat, Bookmark, Heart, TrendingUp } from "lucide-react";

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
  author: string;
  isPopular?: boolean;
  isTrending?: boolean;
}

export default function DiscoverPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [savedRecipes, setSavedRecipes] = useState<string[]>([]);

  // Mock data for discovery
  useEffect(() => {
    const mockRecipes: Recipe[] = [
      {
        id: '1',
        title: 'Korean BBQ Beef Bowl',
        description: 'Tender marinated beef with rice and vegetables',
        cuisine: 'Korean',
        difficulty: 'Medium',
        prepTime: 20,
        cookTime: 15,
        servings: 4,
        rating: 4.8,
        tags: ['beef', 'asian', 'rice bowl'],
        author: 'Chef Kim',
        isPopular: true,
        isTrending: true
      },
      {
        id: '2',
        title: 'Mediterranean Quinoa Salad',
        description: 'Fresh and healthy salad with quinoa, olives, and feta',
        cuisine: 'Mediterranean',
        difficulty: 'Easy',
        prepTime: 15,
        cookTime: 0,
        servings: 6,
        rating: 4.6,
        tags: ['healthy', 'vegetarian', 'salad'],
        author: 'Chef Maria',
        isPopular: true
      },
      {
        id: '3',
        title: 'Chocolate Lava Cake',
        description: 'Decadent chocolate cake with molten center',
        cuisine: 'French',
        difficulty: 'Hard',
        prepTime: 30,
        cookTime: 12,
        servings: 2,
        rating: 4.9,
        tags: ['dessert', 'chocolate', 'romantic'],
        author: 'Chef Pierre',
        isTrending: true
      },
      {
        id: '4',
        title: 'Thai Green Curry',
        description: 'Aromatic and spicy curry with coconut milk',
        cuisine: 'Thai',
        difficulty: 'Medium',
        prepTime: 25,
        cookTime: 30,
        servings: 4,
        rating: 4.7,
        tags: ['curry', 'spicy', 'thai'],
        author: 'Chef Siri'
      },
      {
        id: '5',
        title: 'Classic Caesar Salad',
        description: 'Crisp romaine with homemade dressing and croutons',
        cuisine: 'American',
        difficulty: 'Easy',
        prepTime: 10,
        cookTime: 5,
        servings: 4,
        rating: 4.3,
        tags: ['salad', 'vegetarian', 'classic'],
        author: 'Chef John'
      },
      {
        id: '6',
        title: 'Beef Tacos al Pastor',
        description: 'Mexican street-style tacos with marinated pork',
        cuisine: 'Mexican',
        difficulty: 'Medium',
        prepTime: 40,
        cookTime: 20,
        servings: 8,
        rating: 4.8,
        tags: ['tacos', 'mexican', 'street food'],
        author: 'Chef Carlos',
        isPopular: true
      }
    ];
    setRecipes(mockRecipes);
  }, []);

  const categories = [
    { id: 'all', name: 'All Recipes' },
    { id: 'popular', name: 'Popular' },
    { id: 'trending', name: 'Trending' },
    { id: 'quick', name: 'Quick & Easy' },
    { id: 'healthy', name: 'Healthy' },
    { id: 'desserts', name: 'Desserts' }
  ];

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         recipe.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         recipe.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    let matchesCategory = true;
    if (selectedCategory === 'popular') matchesCategory = recipe.isPopular || false;
    else if (selectedCategory === 'trending') matchesCategory = recipe.isTrending || false;
    else if (selectedCategory === 'quick') matchesCategory = (recipe.prepTime + recipe.cookTime) <= 30;
    else if (selectedCategory === 'healthy') matchesCategory = recipe.tags.includes('healthy') || recipe.tags.includes('vegetarian');
    else if (selectedCategory === 'desserts') matchesCategory = recipe.tags.includes('dessert');
    
    return matchesSearch && matchesCategory;
  });

  const toggleSaveRecipe = (recipeId: string) => {
    setSavedRecipes(prev => 
      prev.includes(recipeId) 
        ? prev.filter(id => id !== recipeId)
        : [...prev, recipeId]
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Discover New Recipes</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore thousands of recipes from talented chefs around the world. Find your next favorite dish!
          </p>
        </div>

        {/* Search Bar */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search recipes, ingredients, or cuisines..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((category) => (
            <Button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.name}
            </Button>
          ))}
        </div>

        {/* Trending Section */}
        {selectedCategory === 'all' && (
          <Card className="mb-8 bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <TrendingUp className="h-5 w-5" />
                Trending This Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recipes.filter(r => r.isTrending).slice(0, 3).map((recipe) => (
                  <div key={recipe.id} className="flex items-center gap-3 p-3 bg-white rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{recipe.title}</h4>
                      <p className="text-sm text-gray-600">{recipe.author}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="h-3 w-3 text-yellow-500 fill-current" />
                        <span className="text-xs">{recipe.rating}</span>
                      </div>
                    </div>
                    <Button
                      onClick={() => toggleSaveRecipe(recipe.id)}
                      className={`p-2 ${
                        savedRecipes.includes(recipe.id)
                          ? 'bg-red-100 text-red-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      <Heart className={`h-4 w-4 ${savedRecipes.includes(recipe.id) ? 'fill-current' : ''}`} />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recipe Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map((recipe) => (
            <Card key={recipe.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {recipe.title}
                      {recipe.isPopular && (
                        <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                          Popular
                        </span>
                      )}
                      {recipe.isTrending && (
                        <TrendingUp className="h-4 w-4 text-red-500" />
                      )}
                    </CardTitle>
                    <p className="text-sm text-gray-600">{recipe.cuisine} • by {recipe.author}</p>
                  </div>
                  <Button
                    onClick={() => toggleSaveRecipe(recipe.id)}
                    className={`p-2 ${
                      savedRecipes.includes(recipe.id)
                        ? 'bg-red-100 text-red-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${savedRecipes.includes(recipe.id) ? 'fill-current' : ''}`} />
                  </Button>
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
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span>{recipe.rating}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    recipe.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                    recipe.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {recipe.difficulty}
                  </span>
                  
                  <div className="flex flex-wrap gap-1">
                    {recipe.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <Button className="w-full">
                  View Recipe
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredRecipes.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <ChefHat className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No recipes found</h3>
              <p className="text-gray-600">
                Try adjusting your search or changing the category filter.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 