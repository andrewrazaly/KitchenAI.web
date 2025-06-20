'use client';

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useSupabase } from '../hooks/useSupabase';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { 
  Plus,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Calendar,
  Clock,
  Users,
  DollarSign,
  Trash2,
  ChefHat,
  ArrowRight,
  CheckCircle,
  Star
} from "lucide-react";
import { getSavedReels } from '../../feature_import_instagram/lib/saved-reels-service';
import { toast } from 'react-hot-toast';

interface SavedReel {
  id: string;
  caption_text?: string;
  user: {
    username: string;
    profile_pic_url?: string;
  };
  image_versions2?: {
    candidates?: { url: string }[];
  };
  savedAt: number;
  recipeName?: string;
  ingredients?: string[];
  cookingTime?: string;
  servings?: number;
  difficulty?: string;
}

interface QueuedRecipe {
  id: string;
  title: string;
  source: string;
  image: string;
  cookingTime: string;
  difficulty: string;
  assignedTo?: {
    date: string;
    mealType: 'breakfast' | 'lunch' | 'dinner';
  };
}

interface WeekDay {
  day: string;
  date: number;
  fullDate: Date;
  isToday?: boolean;
  meals: {
    breakfast?: QueuedRecipe;
    lunch?: QueuedRecipe;
    dinner?: QueuedRecipe;
  };
}

function MealPlannerContent() {
  const { isSignedIn } = useAuth();
  const supabase = useSupabase();
  const searchParams = useSearchParams();
  const [selectedTab, setSelectedTab] = useState('Plan');
  const [savedMealPlans, setSavedMealPlans] = useState<any[]>([]);
  const [savedReels, setSavedReels] = useState<SavedReel[]>([]);
  const [recipeQueue, setRecipeQueue] = useState<QueuedRecipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentWeek, setCurrentWeek] = useState<WeekDay[]>([]);
  
  // Staging area for new recipe handoffs
  const [stagingRecipe, setStagingRecipe] = useState<QueuedRecipe | null>(null);
  const [showStagingArea, setShowStagingArea] = useState(false);

  // Handle recipe handoff from URL params
  useEffect(() => {
    const recipeId = searchParams.get('recipe');
    if (recipeId && savedReels.length > 0) {
      const reel = savedReels.find(r => r.id === recipeId);
      if (reel) {
        handleRecipeHandoff(reel);
      }
    }
  }, [searchParams, savedReels]);

  const handleRecipeHandoff = (reel: SavedReel) => {
    const stagedRecipe: QueuedRecipe = {
      id: `staged_${reel.id}_${Date.now()}`,
      title: reel.recipeName || reel.caption_text?.slice(0, 50) + '...' || 'Recipe from @' + reel.user.username,
      source: '@' + reel.user.username,
      image: reel.image_versions2?.candidates?.[0]?.url || '/lemon.svg',
      cookingTime: reel.cookingTime || extractCookingTime(reel.caption_text || ''),
      difficulty: reel.difficulty || 'Medium'
    };
    
    setStagingRecipe(stagedRecipe);
    setShowStagingArea(true);
    setSelectedTab('Queue'); // Switch to Queue tab
    toast.success('Recipe ready to be scheduled!');
  };

  const addStagedRecipeToQueue = () => {
    if (stagingRecipe) {
      const updatedQueue = [stagingRecipe, ...recipeQueue];
      saveRecipeQueue(updatedQueue);
      setStagingRecipe(null);
      setShowStagingArea(false);
      toast.success('Recipe added to your queue!');
    }
  };

  const scheduleStagedRecipeDirectly = (dayIndex: number, mealType: 'breakfast' | 'lunch' | 'dinner') => {
    if (stagingRecipe) {
      // Assign directly to calendar
      assignRecipeToDay(stagingRecipe.id, dayIndex, mealType);
      
      // Add to queue as well
      const updatedQueue = [stagingRecipe, ...recipeQueue];
      saveRecipeQueue(updatedQueue);
      
      setStagingRecipe(null);
      setShowStagingArea(false);
      setSelectedTab('Plan'); // Switch back to Plan view
      toast.success(`Recipe scheduled for ${mealType}!`);
    }
  };

  // Initialize selected date and current week
  useEffect(() => {
    updateWeekFromDate(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    if (isSignedIn) {
      loadSavedMealPlans();
      loadSavedReels();
      loadRecipeQueue();
    }
  }, [isSignedIn]);

  const updateWeekFromDate = (date: Date) => {
    const week: WeekDay[] = [];
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust to start on Monday
    startOfWeek.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startOfWeek);
      currentDate.setDate(startOfWeek.getDate() + i);
      
      const today = new Date();
      const isToday = currentDate.toDateString() === today.toDateString();
      
      week.push({
        day: currentDate.toLocaleDateString('en', { weekday: 'short' }),
        date: currentDate.getDate(),
        fullDate: new Date(currentDate),
        isToday,
        meals: {
          breakfast: undefined,
          lunch: undefined,
          dinner: undefined
        }
      });
    }
    
    setCurrentWeek(week);
  };

  const loadSavedMealPlans = () => {
    try {
      setIsLoading(true);
      const conversationHistory = localStorage.getItem('mealPlannerConversations');
      if (conversationHistory) {
        const parsed = JSON.parse(conversationHistory);
        setSavedMealPlans(parsed || []);
      }
    } catch (error) {
      console.error('Error loading saved meal plans:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSavedReels = async () => {
    try {
      const reels = await getSavedReels(supabase);
      setSavedReels(reels || []);
    } catch (error) {
      console.error('Error loading saved reels:', error);
    }
  };

  const loadRecipeQueue = () => {
    try {
      const queueData = localStorage.getItem('mealPlanRecipeQueue');
      if (queueData) {
        const queue = JSON.parse(queueData);
        setRecipeQueue(queue || []);
      }
    } catch (error) {
      console.error('Error loading recipe queue:', error);
    }
  };

  const saveRecipeQueue = (queue: QueuedRecipe[]) => {
    localStorage.setItem('mealPlanRecipeQueue', JSON.stringify(queue));
    setRecipeQueue(queue);
  };

  const addRecipeToQueue = (reel: SavedReel) => {
    const newRecipe: QueuedRecipe = {
      id: `queue_${reel.id}_${Date.now()}`,
      title: reel.recipeName || reel.caption_text?.slice(0, 50) + '...' || 'Recipe from @' + reel.user.username,
      source: '@' + reel.user.username,
      image: reel.image_versions2?.candidates?.[0]?.url || '/lemon.svg',
      cookingTime: reel.cookingTime || extractCookingTime(reel.caption_text || ''),
      difficulty: reel.difficulty || 'Medium'
    };

    const updatedQueue = [...recipeQueue, newRecipe];
    saveRecipeQueue(updatedQueue);
  };

  const removeFromQueue = (recipeId: string) => {
    const updatedQueue = recipeQueue.filter(recipe => recipe.id !== recipeId);
    saveRecipeQueue(updatedQueue);
  };

  const assignRecipeToDay = (recipeId: string, dayIndex: number, mealType: 'breakfast' | 'lunch' | 'dinner') => {
    const recipe = recipeQueue.find(r => r.id === recipeId);
    if (!recipe) return;

    // Update recipe with assignment
    const assignedRecipe = {
      ...recipe,
      assignedTo: {
        date: currentWeek[dayIndex].fullDate.toISOString(),
        mealType
      }
    };

    // Update week data
    const updatedWeek = [...currentWeek];
    updatedWeek[dayIndex].meals[mealType] = assignedRecipe;
    setCurrentWeek(updatedWeek);

    // Update recipe queue
    const updatedQueue = recipeQueue.map(r => 
      r.id === recipeId ? assignedRecipe : r
    );
    saveRecipeQueue(updatedQueue);
  };

  const extractCookingTime = (caption: string): string => {
    const timeMatch = caption.match(/(\d+)\s*(min|minute|hour|hr)/i);
    return timeMatch ? timeMatch[0] : '30min';
  };

  const extractIngredientCount = (caption: string): number => {
    const ingredientMatch = caption.match(/(\d+)\s*(ingredient|item)/i);
    return ingredientMatch ? parseInt(ingredientMatch[1]) : 8;
  };

  const generateSampleMealPlan = async () => {
    try {
      const response = await fetch('/api/generate-meal-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          budget: 100,
          preferences: ['Mediterranean'],
          restrictions: [],
          days: 7,
          householdSize: 2
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        const newPlan = {
          id: `plan_${Date.now()}`,
          name: `New Meal Plan - ${new Date().toLocaleDateString()}`,
          start_date: new Date().toISOString().split('T')[0],
          end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          meals: data.mealPlan,
          gatheredInfo: {
            duration: 7,
            budget: 100,
            cuisine: ['Mediterranean'],
            household: 2
          },
          timestamp: new Date()
        };

        const updatedPlans = [newPlan, ...savedMealPlans.slice(0, 9)];
        setSavedMealPlans(updatedPlans);
        localStorage.setItem('mealPlannerConversations', JSON.stringify(updatedPlans));
      }
    } catch (error) {
      console.error('Error generating meal plan:', error);
    }
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const handleDateClick = (day: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(day);
    setSelectedDate(newDate);
  };

  const formatMealPlanSummary = (plan: any) => {
    if (!plan.meals) return 'No meals';
    const mealCount = plan.meals.length;
    const cuisines = plan.gatheredInfo?.cuisine?.join(', ') || 'Mixed';
    const budget = plan.gatheredInfo?.budget ? `$${plan.gatheredInfo.budget}` : 'Budget-friendly';
    return `${mealCount} days • ${cuisines} • ${budget}`;
  };

  const renderMealPlanCard = (plan: any, index: number) => (
    <div key={plan.id || index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900 text-sm">
            {plan.name || `Meal Plan ${index + 1}`}
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            {formatMealPlanSummary(plan)}
          </p>
        </div>
        <div className="text-xs text-gray-400">
          {new Date(plan.timestamp).toLocaleDateString()}
        </div>
      </div>
      
      {plan.meals && plan.meals.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Calendar className="h-3 w-3" />
            <span>Sample meals:</span>
          </div>
          <div className="text-xs text-gray-800 space-y-1">
            {plan.meals.slice(0, 2).map((day: any, dayIndex: number) => (
              <div key={dayIndex} className="bg-gray-50 rounded p-2">
                <div className="font-medium">Day {dayIndex + 1}</div>
                <div className="text-gray-600">
                  {day.breakfast?.title}, {day.lunch?.title}, {day.dinner?.title}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <Button className="w-full mt-3 text-xs bg-orange-50 text-orange-600 hover:bg-orange-100 border border-orange-200">
        Use This Plan
      </Button>
    </div>
  );

  const renderSavedReelCard = (reel: SavedReel) => (
    <div key={reel.id} className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
      <div className="flex gap-3 mb-2">
        <img 
          src={reel.image_versions2?.candidates?.[0]?.url || '/lemon.svg'}
          alt={reel.recipeName || 'Recipe'}
          className="w-12 h-12 rounded-lg object-cover"
          onError={(e) => { e.currentTarget.src = '/lemon.svg'; }}
        />
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm text-gray-900 line-clamp-1">
            {reel.recipeName || 'Recipe from @' + reel.user.username}
          </h4>
          <p className="text-xs text-gray-500 line-clamp-1">
            @{reel.user.username}
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
            <Clock className="h-3 w-3" />
            <span>{reel.cookingTime || extractCookingTime(reel.caption_text || '')}</span>
            <span>•</span>
            <span>{extractIngredientCount(reel.caption_text || '')} ingredients</span>
          </div>
        </div>
      </div>
      
      <Button 
        onClick={() => addRecipeToQueue(reel)}
        disabled={recipeQueue.some(r => r.id.includes(reel.id))}
        className="w-full text-xs bg-green-50 text-green-600 hover:bg-green-100 border border-green-200"
      >
        {recipeQueue.some(r => r.id.includes(reel.id)) ? 'Added to Queue' : 'Add to Meal Plan'}
      </Button>
    </div>
  );

  const renderQueueContent = () => {
    const unassignedRecipes = recipeQueue.filter(recipe => !recipe.assignedTo);
    
    return (
      <div className="space-y-4">
        {/* Staging Area */}
        {showStagingArea && stagingRecipe && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Star className="h-4 w-4 text-orange-600" />
              <h3 className="font-semibold text-orange-900">New Recipe Ready to Schedule</h3>
            </div>
            
            <div className="bg-white border border-orange-200 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-3">
                <img 
                  src={stagingRecipe.image}
                  alt={stagingRecipe.title}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm text-gray-900 line-clamp-1">
                    {stagingRecipe.title}
                  </h4>
                  <p className="text-xs text-gray-500">{stagingRecipe.source}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                    <Clock className="h-3 w-3" />
                    <span>{stagingRecipe.cookingTime}</span>
                    <span>•</span>
                    <span>{stagingRecipe.difficulty}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mb-3">
              <Button
                onClick={addStagedRecipeToQueue}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-sm"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add to Queue
              </Button>
              <Button
                onClick={() => setSelectedTab('Plan')}
                className="flex-1 bg-white hover:bg-gray-50 text-orange-600 border border-orange-200 text-sm"
              >
                <Calendar className="h-4 w-4 mr-1" />
                Schedule Now
              </Button>
            </div>

            <p className="text-xs text-orange-700">
              🎯 Quick tip: Switch to Plan tab to drag this recipe directly onto your calendar!
            </p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Recipe Queue</h3>
          <Badge className="bg-gray-100 text-gray-700 text-xs">
            {unassignedRecipes.length} recipes waiting
          </Badge>
        </div>
        
        {unassignedRecipes.length === 0 ? (
          <div className="text-center py-8">
            <ChefHat className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 mb-2">No recipes in queue</p>
            <p className="text-sm text-gray-500">Add recipes from your saved collection to start planning meals</p>
          </div>
        ) : (
          <div className="space-y-3">
            {unassignedRecipes.map((recipe) => (
              <div key={recipe.id} className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <img 
                    src={recipe.image}
                    alt={recipe.title}
                    className="w-12 h-12 rounded-lg object-cover"
                    onError={(e) => { e.currentTarget.src = '/lemon.svg'; }}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-gray-900 line-clamp-1">
                      {recipe.title}
                    </h4>
                    <p className="text-xs text-gray-500">{recipe.source}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                      <Clock className="h-3 w-3" />
                      <span>{recipe.cookingTime}</span>
                      <span>•</span>
                      <span>{recipe.difficulty}</span>
                    </div>
                  </div>
                  <Button
                    onClick={() => removeFromQueue(recipe.id)}
                    className="text-gray-400 hover:text-red-500 bg-transparent shadow-none hover:bg-red-50 h-8 w-8 p-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderForYouContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin h-6 w-6 border-2 border-orange-500 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading your content...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Saved Meal Plans */}
        {savedMealPlans.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Your Meal Plans</h3>
              <Button 
                onClick={generateSampleMealPlan}
                className="text-xs bg-green-50 text-green-600 hover:bg-green-100 border border-green-200"
              >
                + New Plan
              </Button>
            </div>
            
            <div className="grid gap-4 mb-6">
              {savedMealPlans.slice(0, 2).map((plan, index) => renderMealPlanCard(plan, index))}
            </div>
          </div>
        )}

        {/* Saved Recipes */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Saved Recipes</h3>
            <Button 
              onClick={() => window.open('/recipes', '_blank')}
              className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200"
            >
              View All
            </Button>
          </div>
          
          {savedReels.length === 0 ? (
            <div className="text-center py-8">
              <div className="bg-gray-50 rounded-lg p-6">
                <ChefHat className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <h4 className="font-semibold text-gray-900 mb-2">No saved recipes yet</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Save recipes from Instagram to add them to your meal plans!
                </p>
                <Button 
                  onClick={() => window.open('/explore', '_blank')}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  Discover Recipes
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid gap-3">
              {savedReels.slice(0, 4).map(reel => renderSavedReelCard(reel))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'For you':
        return renderForYouContent();
      case 'Queue':
        return renderQueueContent();
      case 'Previous':
        return (
          <div className="text-center py-8">
            <p className="text-gray-600">Your previous meal plans will appear here</p>
          </div>
        );
      default:
        return (
          <div className="space-y-4">
            {/* Staging Area for Plan Tab */}
            {showStagingArea && stagingRecipe && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="h-4 w-4 text-orange-600" />
                  <h3 className="font-semibold text-orange-900">Schedule Your Recipe</h3>
                </div>
                
                <div className="bg-white border border-orange-200 rounded-lg p-3 mb-3">
                  <div className="flex items-center gap-3">
                    <img 
                      src={stagingRecipe.image}
                      alt={stagingRecipe.title}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-gray-900 line-clamp-1">
                        {stagingRecipe.title}
                      </h4>
                      <p className="text-xs text-gray-500">{stagingRecipe.source}</p>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-orange-700 mb-3">
                  👆 Click any empty meal slot below to schedule this recipe!
                </p>
              </div>
            )}

            {currentWeek.map((dayInfo, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className={`font-medium min-w-[60px] ${dayInfo.isToday ? 'text-orange-600' : 'text-gray-600'}`}>
                      {dayInfo.day} {dayInfo.date}
                    </span>
                    {dayInfo.isToday && (
                      <Badge className="bg-orange-100 text-orange-800 text-xs">Today</Badge>
                    )}
                  </div>
                </div>

                {/* Meal slots */}
                <div className="grid grid-cols-3 gap-2">
                  {(['breakfast', 'lunch', 'dinner'] as const).map((mealType) => (
                    <div key={mealType} className={`border border-dashed rounded-lg p-3 min-h-[80px] ${
                      showStagingArea && stagingRecipe 
                        ? 'border-orange-300 bg-orange-50 hover:bg-orange-100 cursor-pointer' 
                        : 'border-gray-300'
                    }`}>
                      <div className="text-xs font-medium text-gray-500 capitalize mb-2">{mealType}</div>
                      
                      {dayInfo.meals[mealType] ? (
                        <div className="bg-white border border-gray-200 rounded p-2">
                          <div className="text-xs font-medium text-gray-900 line-clamp-1">
                            {dayInfo.meals[mealType]!.title}
                          </div>
                          <div className="text-xs text-gray-500">{dayInfo.meals[mealType]!.source}</div>
                        </div>
                      ) : (
                        <div 
                          className="flex items-center justify-center h-full"
                          onClick={() => {
                            if (showStagingArea && stagingRecipe) {
                              scheduleStagedRecipeDirectly(index, mealType);
                            }
                          }}
                        >
                          <div className="text-center">
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (showStagingArea && stagingRecipe) {
                                  scheduleStagedRecipeDirectly(index, mealType);
                                } else if (recipeQueue.some(r => !r.assignedTo)) {
                                  const unassignedRecipe = recipeQueue.find(r => !r.assignedTo);
                                  if (unassignedRecipe) {
                                    assignRecipeToDay(unassignedRecipe.id, index, mealType);
                                  }
                                }
                              }}
                              className={`h-8 w-8 p-0 bg-transparent shadow-none border-dashed border ${
                                showStagingArea && stagingRecipe
                                  ? 'text-orange-600 hover:text-orange-700 hover:bg-orange-100 border-orange-300'
                                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 border-gray-300'
                              }`}
                              disabled={!showStagingArea && !recipeQueue.some(r => !r.assignedTo)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                            <div className="text-xs text-gray-400 mt-1">
                              {showStagingArea && stagingRecipe 
                                ? 'Schedule here' 
                                : recipeQueue.some(r => !r.assignedTo) 
                                  ? 'Auto-assign' 
                                  : 'Empty'
                              }
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
    }
  };

  // Calendar grid for the current month
  const calendarDays = (() => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Previous month days
    const prevMonth = new Date(year, month - 1, 0);
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: prevMonth.getDate() - i,
        isCurrentMonth: false,
        isToday: false
      });
    }
    
    // Current month days
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({
        day,
        isCurrentMonth: true,
        isToday: date.toDateString() === today.toDateString(),
        isSelected: date.toDateString() === selectedDate.toDateString()
      });
    }
    
    // Next month days to fill the grid
    const remainingCells = 42 - days.length;
    for (let day = 1; day <= remainingCells; day++) {
      days.push({
        day,
        isCurrentMonth: false,
        isToday: false
      });
    }
    
    return days;
  })();

  const tabs = ['Plan', 'For you', 'Queue', 'Previous'];

  if (!isSignedIn) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <h2 className="text-2xl font-semibold mb-4">Sign in to access meal planner</h2>
          <p className="text-gray-600">Plan your meals and organize your weekly menu!</p>
          <Button className="mt-4">Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Meal Planner</h1>
        
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendar Widget */}
          <div className="lg:col-span-1">
            <Card className="bg-white shadow-sm">
              <CardContent className="p-6">
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {selectedDate.toLocaleDateString('en', { month: 'long', year: 'numeric' })}
                  </h2>
                  <div className="flex items-center gap-2">
                    <Button 
                      onClick={() => {
                        const newDate = new Date(selectedDate);
                        newDate.setMonth(newDate.getMonth() - 1);
                        setSelectedDate(newDate);
                      }}
                      className="h-8 w-8 p-0 bg-transparent hover:bg-gray-100 text-gray-600"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button 
                      onClick={() => {
                        const newDate = new Date(selectedDate);
                        newDate.setMonth(newDate.getMonth() + 1);
                        setSelectedDate(newDate);
                      }}
                      className="h-8 w-8 p-0 bg-transparent hover:bg-gray-100 text-gray-600"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Calendar Grid */}
                <div className="mb-4">
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
                      <div key={day} className="text-center text-xs font-medium text-gray-500 h-8 flex items-center justify-center">
                        {day}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((dayInfo, index) => (
                      <button
                        key={index}
                        onClick={() => dayInfo.isCurrentMonth && handleDateClick(dayInfo.day)}
                        className={`h-8 w-8 text-xs rounded hover:bg-gray-100 transition-colors ${
                          dayInfo.isSelected ? 'bg-orange-500 text-white font-semibold' :
                          dayInfo.isToday ? 'bg-yellow-100 text-yellow-800 font-semibold' :
                          !dayInfo.isCurrentMonth ? 'text-gray-400' : 'text-gray-900'
                        }`}
                        disabled={!dayInfo.isCurrentMonth}
                      >
                        {dayInfo.day}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Week Navigation */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <Button 
                      onClick={() => navigateWeek('prev')}
                      className="text-xs bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 h-8 px-3"
                    >
                      <ChevronLeft className="h-3 w-3 mr-1" />
                      Prev Week
                    </Button>
                    <Button 
                      onClick={() => navigateWeek('next')}
                      className="text-xs bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 h-8 px-3"
                    >
                      Next Week
                      <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>

                {/* Today Button */}
                <div className="mt-6">
                  <Button 
                    onClick={goToToday}
                    className="w-full text-gray-600 border border-gray-300 bg-white hover:bg-gray-50"
                  >
                    Today
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Meal Planning Panel */}
          <div className="lg:col-span-2">
            <Card className="bg-white shadow-sm">
              <CardContent className="p-6">
                {/* Header with Tabs */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-6">
                    {tabs.map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setSelectedTab(tab)}
                        className={`pb-2 text-sm font-medium transition-colors relative ${
                          selectedTab === tab
                            ? 'border-b-2 border-orange-500 text-orange-600'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        {tab}
                        {tab === 'Queue' && recipeQueue.filter(r => !r.assignedTo).length > 0 && (
                          <Badge className="absolute -top-2 -right-3 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {recipeQueue.filter(r => !r.assignedTo).length}
                          </Badge>
                        )}
                      </button>
                    ))}
                  </div>
                  <Button className="bg-transparent hover:bg-gray-100 text-gray-600 p-2">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>

                {/* Tab Content */}
                {renderTabContent()}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MealPlannerPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading meal planner...</p>
        </div>
      </div>
    }>
      <MealPlannerContent />
    </Suspense>
  );
} 