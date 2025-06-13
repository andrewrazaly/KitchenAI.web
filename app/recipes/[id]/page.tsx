'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { useSupabase } from '../../hooks/useSupabase';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Heart, 
  Share2, 
  Clock, 
  Users, 
  ChefHat,
  Plus,
  Check,
  Star,
  Info,
  ArrowLeft,
  ShoppingCart,
  Bookmark,
  BookmarkCheck,
  Calendar
} from "lucide-react";
import { getSavedReels, SavedReel } from '../../../feature_import_instagram/lib/saved-reels-service';
import { parseIngredientsFromReel } from '../../lib/ingredient-parser-service';
import type { ParsedIngredient } from '../../lib/ingredient-parser-service';
import { addItemsToShoppingList, getUserShoppingLists, createShoppingList } from '../../lib/shopping-list-service';
import type { ShoppingList } from '../../lib/shopping-list-service';
import { addRecipeToQueue } from '../../lib/meal-plan-service';
import { toast } from 'react-hot-toast';
import { trackEvent } from '../../components/GoogleAnalytics';

interface RecipeData {
  id: string;
  title: string;
  creator: string;
  creatorHandle: string;
  videoUrl?: string;
  imageUrl: string;
  prepTime: string;
  cookTime: string;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  rating: number;
  totalRatings: number;
  calories: number;
  description: string;
  ingredients: Array<{
    id: string;
    name: string;
    amount: string;
    unit: string;
    emoji: string;
    category: string;
  }>;
  instructions: string[];
  nutrition: {
    calories: number;
    totalFat: string;
    carbs: string;
    sugars: string;
    protein: string;
    sodium: string;
    fiber: string;
    glycemicIndex: 'Low' | 'Medium' | 'High';
    glycemicLoad: 'Low' | 'Medium' | 'High';
    nutritionBalance: 'Balanced' | 'Unbalanced';
  };
  tags: string[];
}

export default function RecipeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const supabase = useSupabase();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [recipe, setRecipe] = useState<RecipeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [showNutrition, setShowNutrition] = useState(false);
  const [selectedIngredients, setSelectedIngredients] = useState<Set<string>>(new Set());
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([]);
  const [showShoppingListModal, setShowShoppingListModal] = useState(false);
  const [selectedListId, setSelectedListId] = useState<string>('');

  useEffect(() => {
    loadRecipe();
    loadShoppingLists();
  }, [params.id]);

  const loadRecipe = async () => {
    try {
      setLoading(true);
      
      // Try to find the recipe in saved reels first
      const savedReels = await getSavedReels(supabase);
      const savedReel = savedReels?.find(reel => reel.id === params.id);
      
      if (savedReel) {
        // Convert saved reel to recipe format
        const recipeData: RecipeData = {
          id: savedReel.id,
          title: savedReel.recipeName || extractRecipeTitle(savedReel.caption_text || ''),
          creator: savedReel.user.username,
          creatorHandle: `@${savedReel.user.username}`,
          videoUrl: savedReel.video_versions?.[0]?.url,
          imageUrl: savedReel.image_versions2?.candidates?.[0]?.url || '/lemon.svg',
          prepTime: '15min',
          cookTime: '15min',
          servings: 4,
          difficulty: 'Easy',
          rating: 4.8,
          totalRatings: 883,
          calories: 434,
          description: savedReel.caption_text?.slice(0, 200) + '...' || 'Delicious recipe from a top food creator.',
          ingredients: generateMockIngredients(),
          instructions: generateMockInstructions(),
          nutrition: {
            calories: 434,
            totalFat: '27.1g (39%)',
            carbs: '21.5g (8%)',
            sugars: '10.7g (12%)',
            protein: '22.5g (45%)',
            sodium: '1277.2mg (64%)',
            fiber: '1.8g (7%)',
            glycemicIndex: 'Low',
            glycemicLoad: 'Low',
            nutritionBalance: 'Unbalanced'
          },
          tags: ['Quick', 'Easy', 'Protein-Rich', 'Low-Carb']
        };
        
        setRecipe(recipeData);
        setIsSaved(true);
      } else {
        // Generate mock recipe data for demo
        setRecipe(generateMockRecipe(params.id as string));
      }
    } catch (error) {
      console.error('Error loading recipe:', error);
      toast.error('Failed to load recipe');
    } finally {
      setLoading(false);
    }
  };

  const loadShoppingLists = async () => {
    try {
      const lists = getUserShoppingLists();
      setShoppingLists(lists || []);
      if (lists && lists.length > 0) {
        setSelectedListId(lists[0].id);
      }
    } catch (error) {
      console.error('Error loading shopping lists:', error);
    }
  };

  const extractRecipeTitle = (caption: string): string => {
    const lines = caption.split('\n');
    const firstLine = lines[0]?.trim();
    if (firstLine && firstLine.length < 100) {
      return firstLine;
    }
    return 'Ground Beef Stir Fry';
  };

  const generateMockIngredients = () => [
    { id: '1', name: 'ground beef', amount: '1', unit: 'lb', emoji: '🥩', category: 'Meat' },
    { id: '2', name: 'red bell pepper', amount: '1', unit: '', emoji: '🫑', category: 'Vegetables' },
    { id: '3', name: 'onion', amount: '1', unit: '', emoji: '🧅', category: 'Vegetables' },
    { id: '4', name: 'garlic cloves', amount: '3', unit: '', emoji: '🧄', category: 'Vegetables' },
    { id: '5', name: 'carrot', amount: '1', unit: '', emoji: '🥕', category: 'Vegetables' },
    { id: '6', name: 'zucchini', amount: '0.5', unit: '', emoji: '🥒', category: 'Vegetables' },
    { id: '7', name: 'ginger', amount: '1', unit: 'Tbsp', emoji: '🫚', category: 'Spices' },
    { id: '8', name: 'avocado oil', amount: '2', unit: 'tsp', emoji: '🥑', category: 'Oils' },
    { id: '9', name: 'salt', amount: '', unit: 'to taste', emoji: '🧂', category: 'Seasonings' },
    { id: '10', name: 'pepper', amount: '', unit: 'to taste', emoji: '🌶️', category: 'Seasonings' },
    { id: '11', name: 'soy sauce', amount: '1/4', unit: 'cup', emoji: '🍶', category: 'Sauces' },
    { id: '12', name: 'sake', amount: '1/4', unit: 'cup', emoji: '🍶', category: 'Alcohol' },
    { id: '13', name: 'mirin', amount: '2', unit: 'Tbsp', emoji: '🍯', category: 'Sauces' },
    { id: '14', name: 'honey', amount: '1', unit: 'Tbsp', emoji: '🍯', category: 'Sweeteners' },
    { id: '15', name: 'cornstarch', amount: '2', unit: 'Tbsp', emoji: '🌽', category: 'Thickeners' },
    { id: '16', name: 'chili paste', amount: '1', unit: 'Tbsp', emoji: '🌶️', category: 'Sauces' },
    { id: '17', name: 'sesame oil', amount: '1', unit: 'tsp', emoji: '🌰', category: 'Oils' },
    { id: '18', name: 'water', amount: '4', unit: 'Tbsp', emoji: '💧', category: 'Liquids' }
  ];

  const generateMockInstructions = () => [
    'Heat oil in a large skillet or wok over medium-high heat.',
    'Add ground beef and cook, breaking it up with a spoon, until browned and cooked through.',
    'Add onion, bell pepper, and carrot. Stir-fry for 3-4 minutes until vegetables start to soften.',
    'Add garlic and ginger, cook for another minute until fragrant.',
    'In a small bowl, whisk together soy sauce, sake, mirin, honey, and chili paste.',
    'Pour sauce over the beef and vegetables, stir to combine.',
    'Add zucchini and cook for 2-3 minutes until tender-crisp.',
    'Mix cornstarch with water to create a slurry, add to the pan to thicken the sauce.',
    'Drizzle with sesame oil and season with salt and pepper to taste.',
    'Serve immediately over steamed rice, garnished with green onions if desired.'
  ];

  const generateMockRecipe = (id: string): RecipeData => ({
    id,
    title: 'Ground Beef Stir Fry',
    creator: 'bitesofberi',
    creatorHandle: '@bitesofberi.com',
    videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
    imageUrl: '/lemon.svg',
    prepTime: '15min',
    cookTime: '15min',
    servings: 4,
    difficulty: 'Easy',
    rating: 4.8,
    totalRatings: 883,
    calories: 434,
    description: 'This ground beef stir fry is a very quick and easy dish that is perfect for weeknight dinners. It has a ton of flavor, is very healthy and can easily be prepared...',
    ingredients: generateMockIngredients(),
    instructions: generateMockInstructions(),
    nutrition: {
      calories: 434,
      totalFat: '27.1g (39%)',
      carbs: '21.5g (8%)',
      sugars: '10.7g (12%)',
      protein: '22.5g (45%)',
      sodium: '1277.2mg (64%)',
      fiber: '1.8g (7%)',
      glycemicIndex: 'Low',
      glycemicLoad: 'Low',
      nutritionBalance: 'Unbalanced'
    },
    tags: ['Quick', 'Easy', 'Protein-Rich', 'Low-Carb']
  });

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        trackEvent('video_pause', 'recipe_detail', recipe?.id);
      } else {
        videoRef.current.play();
        trackEvent('video_play', 'recipe_detail', recipe?.id);
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
      trackEvent(isMuted ? 'video_unmute' : 'video_mute', 'recipe_detail', recipe?.id);
    }
  };

  const toggleIngredient = (ingredientId: string) => {
    const newSelected = new Set(selectedIngredients);
    if (newSelected.has(ingredientId)) {
      newSelected.delete(ingredientId);
    } else {
      newSelected.add(ingredientId);
    }
    setSelectedIngredients(newSelected);
  };

  const selectAllIngredients = () => {
    if (recipe) {
      setSelectedIngredients(new Set(recipe.ingredients.map(ing => ing.id)));
    }
  };

  const clearAllIngredients = () => {
    setSelectedIngredients(new Set());
  };

  const handleAddToShoppingList = async () => {
    if (!recipe || selectedIngredients.size === 0) {
      toast.error('Please select ingredients to add');
      return;
    }

    if (!selectedListId) {
      toast.error('Please select a shopping list');
      return;
    }

    try {
      const selectedIngs = recipe.ingredients.filter(ing => selectedIngredients.has(ing.id));
      
      // Convert ingredients to shopping list items
      const shoppingItems = selectedIngs.map(ing => ({
        id: `${recipe.id}_${ing.id}`,
        name: ing.name,
        amount: `${ing.amount} ${ing.unit}`.trim(),
        quantity: ing.amount,
        unit: ing.unit,
        category: ing.category,
        emoji: ing.emoji,
        checked: false,
        recipeSource: recipe.title,
        standardizedName: ing.name.toLowerCase()
      }));

      addItemsToShoppingList(selectedListId, shoppingItems);
      
      toast.success(`Added ${selectedIngs.length} ingredients to shopping list!`);
      trackEvent('ingredients_added_to_shopping_list', 'recipe_detail', recipe.id, selectedIngs.length);
      
      setShowShoppingListModal(false);
      setSelectedIngredients(new Set());
      
      // Navigate to shopping list to show the result
      router.push('/shopping-list');
    } catch (error) {
      console.error('Error adding to shopping list:', error);
      toast.error('Failed to add ingredients to shopping list');
    }
  };

  const createNewShoppingList = async () => {
    try {
      const newList = createShoppingList(`${recipe?.title} Ingredients`);
      
      if (newList) {
        setShoppingLists(prev => [newList, ...prev]);
        setSelectedListId(newList.id);
        toast.success('New shopping list created!');
      }
    } catch (error) {
      console.error('Error creating shopping list:', error);
      toast.error('Failed to create shopping list');
    }
  };

  const addToMealPlan = async () => {
    if (!recipe) {
      toast.error('Recipe not found');
      return;
    }

    try {
      const success = addRecipeToQueue({
        id: recipe.id,
        title: recipe.title,
        creator: recipe.creator,
        imageUrl: recipe.imageUrl,
        prepTime: recipe.prepTime,
        difficulty: recipe.difficulty
      });
      
      if (success) {
        toast.success('Recipe added to meal plan queue!');
        trackEvent('recipe_added_to_meal_plan', 'recipe_detail', recipe.id);
      } else {
        toast.error('Recipe is already in your meal plan queue');
      }
    } catch (error) {
      console.error('Error adding to meal plan:', error);
      toast.error('Failed to add recipe to meal plan');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading recipe...</p>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Recipe not found</h2>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            onClick={() => router.back()}
            className="p-2 bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{recipe.title}</h1>
            <p className="text-gray-600">By {recipe.creatorHandle}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Video & Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            <Card className="overflow-hidden">
              <div className="relative aspect-video bg-black">
                {recipe.videoUrl ? (
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    poster={recipe.imageUrl}
                    muted={isMuted}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onLoadedData={() => {
                      if (videoRef.current) {
                        videoRef.current.muted = isMuted;
                      }
                    }}
                  >
                    <source src={recipe.videoUrl} type="video/mp4" />
                  </video>
                ) : (
                  <img 
                    src={recipe.imageUrl} 
                    alt={recipe.title}
                    className="w-full h-full object-cover"
                  />
                )}
                
                {/* Video Controls */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button
                    onClick={togglePlay}
                    className="bg-black/50 hover:bg-black/70 text-white rounded-full p-4"
                  >
                    {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
                  </Button>
                </div>
                
                {/* Volume Control */}
                <div className="absolute bottom-4 right-4">
                  <Button
                    onClick={toggleMute}
                    className="bg-black/50 hover:bg-black/70 text-white rounded-full p-2"
                  >
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                </div>

                {/* Recipe Stats Overlay */}
                <div className="absolute bottom-4 left-4 flex items-center gap-2">
                  <Badge className="bg-black/50 text-white">
                    <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                    {recipe.rating}
                  </Badge>
                  <Badge className="bg-black/50 text-white">
                    <Heart className="h-3 w-3 mr-1" />
                    {recipe.totalRatings}
                  </Badge>
                </div>
              </div>
            </Card>

            {/* Recipe Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button 
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6"
                  onClick={() => setShowShoppingListModal(true)}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to List
                </Button>
                <Button className="bg-orange-500 hover:bg-orange-600 text-white px-6" onClick={addToMealPlan}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Add to Queue
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <Button className="p-2 bg-white hover:bg-gray-50 border border-gray-200">
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button className="p-2 bg-white hover:bg-gray-50 border border-gray-200">
                  {isSaved ? <BookmarkCheck className="h-4 w-4 text-orange-500" /> : <Bookmark className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Recipe Info */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-6 mb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">Prep: {recipe.prepTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">Cook: {recipe.cookTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{recipe.servings} servings</span>
                  </div>
                </div>
                
                <p className="text-gray-700 leading-relaxed">{recipe.description}</p>
                
                <div className="flex flex-wrap gap-2 mt-4">
                  {recipe.tags.map(tag => (
                    <Badge key={tag} className="bg-gray-100 text-gray-700">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChefHat className="h-5 w-5" />
                  Instructions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recipe.instructions.map((instruction, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                        {index + 1}
                      </div>
                      <p className="text-gray-700 leading-relaxed pt-1">{instruction}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Nutrition & Ingredients */}
          <div className="space-y-6">
            {/* Nutrition Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Nutrition balance score</span>
                  <Button 
                    onClick={() => setShowNutrition(!showNutrition)}
                    className="p-1 bg-transparent hover:bg-gray-100"
                  >
                    <Info className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Badge className={`${recipe.nutrition.nutritionBalance === 'Unbalanced' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {recipe.nutrition.nutritionBalance}
                  </Badge>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Glycemic Index</span>
                      <Badge className="bg-green-100 text-green-700">{recipe.nutrition.glycemicIndex}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Glycemic Load</span>
                      <Badge className="bg-green-100 text-green-700">{recipe.nutrition.glycemicLoad}</Badge>
                    </div>
                  </div>

                  {showNutrition && (
                    <div className="space-y-3 pt-4 border-t">
                      <h4 className="font-semibold">Nutrition per serving</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Calories</span>
                          <span className="font-semibold">{recipe.nutrition.calories} kcal (22%)</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Fat</span>
                          <span>{recipe.nutrition.totalFat}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Carbs</span>
                          <span>{recipe.nutrition.carbs}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Sugars</span>
                          <span>{recipe.nutrition.sugars}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Protein</span>
                          <span>{recipe.nutrition.protein}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Sodium</span>
                          <span>{recipe.nutrition.sodium}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Fiber</span>
                          <span>{recipe.nutrition.fiber}</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">% Daily Values based on a 2,000 calorie diet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Ingredients */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Ingredients</CardTitle>
                  <Button 
                    onClick={() => setShowShoppingListModal(true)}
                    className="bg-orange-500 hover:bg-orange-600 text-white text-sm px-3 py-1"
                  >
                    Add to list
                  </Button>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>4 servings</span>
                  <Button className="text-xs text-orange-500 hover:text-orange-600 p-0 h-auto">
                    Convert Units
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recipe.ingredients.map((ingredient) => (
                    <div 
                      key={ingredient.id}
                      className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                        selectedIngredients.has(ingredient.id) ? 'bg-orange-50 border border-orange-200' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => toggleIngredient(ingredient.id)}
                    >
                      <div className="flex-shrink-0">
                        {selectedIngredients.has(ingredient.id) ? (
                          <Check className="h-5 w-5 text-orange-500" />
                        ) : (
                          <div className="h-5 w-5 border border-gray-300 rounded"></div>
                        )}
                      </div>
                      <span className="text-lg">{ingredient.emoji}</span>
                      <div className="flex-1">
                        <span className="font-medium">{ingredient.amount} {ingredient.unit} {ingredient.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <Button 
                    onClick={selectAllIngredients}
                    className="flex-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700"
                  >
                    Select All
                  </Button>
                  <Button 
                    onClick={clearAllIngredients}
                    className="flex-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700"
                  >
                    Clear All
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Shopping List Modal */}
      {showShoppingListModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Add to Shopping List</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Shopping List
                </label>
                <select
                  value={selectedListId}
                  onChange={(e) => setSelectedListId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {shoppingLists.map(list => (
                    <option key={list.id} value={list.id}>
                      {list.name} ({list.items.length} items)
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Selected ingredients: {selectedIngredients.size}
                </p>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {recipe.ingredients
                    .filter(ing => selectedIngredients.has(ing.id))
                    .map(ing => (
                      <div key={ing.id} className="text-sm text-gray-700 flex items-center gap-2">
                        <span>{ing.emoji}</span>
                        <span>{ing.amount} {ing.unit} {ing.name}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <Button 
                onClick={() => setShowShoppingListModal(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700"
              >
                Cancel
              </Button>
              <Button 
                onClick={createNewShoppingList}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4"
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button 
                onClick={handleAddToShoppingList}
                disabled={selectedIngredients.size === 0}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
              >
                Add to List
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 