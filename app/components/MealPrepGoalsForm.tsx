import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { 
  Target, 
  DollarSign, 
  Clock, 
  Utensils, 
  TrendingUp,
  Save,
  Edit3
} from 'lucide-react';
import { useNotification } from './Notification';
import { trackEvent } from './GoogleAnalytics';

export interface MealPrepGoals {
  id?: string;
  userId: string;
  primaryGoal: 'macros' | 'cost-saving' | 'time-saving' | 'variety' | 'simplicity';
  mealScope: ('breakfast' | 'lunch' | 'dinner' | 'snacks')[];
  weeklyBudget?: number;
  calorieTarget?: number;
  proteinTarget?: number;
  timeConstraint?: number; // minutes per day
  servingsPerMeal: number;
  dietaryRestrictions: string[];
  preferredCuisines: string[];
  cookingSkillLevel: 'beginner' | 'intermediate' | 'advanced';
  createdAt?: string;
  updatedAt?: string;
}

interface MealPrepGoalsFormProps {
  initialGoals?: MealPrepGoals;
  onSave: (goals: MealPrepGoals) => Promise<void>;
  isEditing?: boolean;
}

export default function MealPrepGoalsForm({ 
  initialGoals, 
  onSave, 
  isEditing = false 
}: MealPrepGoalsFormProps) {
  const [goals, setGoals] = useState<Partial<MealPrepGoals>>({
    primaryGoal: 'time-saving',
    mealScope: ['dinner'],
    servingsPerMeal: 4,
    dietaryRestrictions: [],
    preferredCuisines: [],
    cookingSkillLevel: 'intermediate',
    ...initialGoals
  });

  const [isLoading, setIsLoading] = useState(false);
  const { showNotification } = useNotification();

  const goalOptions = [
    { 
      id: 'macros', 
      label: 'Track Macros/Calories', 
      icon: Target, 
      description: 'Focus on nutritional goals and macro tracking',
      color: 'bg-green-100 text-green-700 border-green-200'
    },
    { 
      id: 'cost-saving', 
      label: 'Save Money', 
      icon: DollarSign, 
      description: 'Budget-friendly meals with bulk buying',
      color: 'bg-blue-100 text-blue-700 border-blue-200'
    },
    { 
      id: 'time-saving', 
      label: 'Save Time', 
      icon: Clock, 
      description: 'Quick prep with batch cooking efficiency',
      color: 'bg-orange-100 text-orange-700 border-orange-200'
    },
    { 
      id: 'variety', 
      label: 'Meal Variety', 
      icon: Utensils, 
      description: 'Diverse cuisines and cooking methods',
      color: 'bg-purple-100 text-purple-700 border-purple-200'
    },
    { 
      id: 'simplicity', 
      label: 'Keep It Simple', 
      icon: TrendingUp, 
      description: 'Easy recipes with minimal ingredients',
      color: 'bg-gray-100 text-gray-700 border-gray-200'
    }
  ];

  const mealScopeOptions = [
    { id: 'breakfast', label: 'Breakfast', emoji: '🌅' },
    { id: 'lunch', label: 'Lunch', emoji: '🥗' },
    { id: 'dinner', label: 'Dinner', emoji: '🍽️' },
    { id: 'snacks', label: 'Snacks', emoji: '🍿' }
  ];

  const dietaryOptions = [
    'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 
    'Paleo', 'Low-Carb', 'High-Protein', 'Nut-Free', 'Halal', 'Kosher'
  ];

  const cuisineOptions = [
    'Italian', 'Mexican', 'Asian', 'Mediterranean', 'American', 
    'Indian', 'Thai', 'Japanese', 'Middle Eastern', 'French'
  ];

  const handleGoalChange = (field: keyof MealPrepGoals, value: any) => {
    setGoals(prev => ({ ...prev, [field]: value }));
  };

  const handleMealScopeToggle = (mealType: string) => {
    const currentScope = goals.mealScope || [];
    const newScope = currentScope.includes(mealType as any)
      ? currentScope.filter(m => m !== mealType)
      : [...currentScope, mealType as any];
    
    handleGoalChange('mealScope', newScope);
  };

  const handleArrayToggle = (field: 'dietaryRestrictions' | 'preferredCuisines', value: string) => {
    const currentArray = goals[field] || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    
    handleGoalChange(field, newArray);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!goals.mealScope?.length) {
      showNotification('Please select at least one meal type', 'error');
      return;
    }

    setIsLoading(true);
    
    try {
      await onSave(goals as MealPrepGoals);
      showNotification('Meal prep goals saved successfully! 🎯', 'success');
      trackEvent('meal_prep_goals_saved', 'meal_prep', goals.primaryGoal);
    } catch (error) {
      console.error('Error saving goals:', error);
      showNotification('Failed to save goals. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          {isEditing ? 'Edit Meal Prep Goals' : 'Set Your Meal Prep Goals'}
        </CardTitle>
        <p className="text-gray-600">
          Define your goals to get personalized meal plans and shopping lists
        </p>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Primary Goal Selection */}
          <div>
            <Label className="text-base font-medium mb-4 block">
              What's your primary goal?
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {goalOptions.map((option) => {
                const IconComponent = option.icon;
                const isSelected = goals.primaryGoal === option.id;
                
                return (
                  <div
                    key={option.id}
                    onClick={() => handleGoalChange('primaryGoal', option.id)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      isSelected 
                        ? option.color + ' border-current' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <IconComponent className="h-5 w-5 mt-1" />
                      <div>
                        <h3 className="font-medium">{option.label}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {option.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Meal Scope */}
          <div>
            <Label className="text-base font-medium mb-4 block">
              Which meals do you want to prep?
            </Label>
            <div className="flex flex-wrap gap-3">
              {mealScopeOptions.map((meal) => {
                const isSelected = goals.mealScope?.includes(meal.id as any);
                
                return (
                  <Badge
                    key={meal.id}
                    onClick={() => handleMealScopeToggle(meal.id)}
                    className={`px-4 py-2 cursor-pointer transition-colors ${
                      isSelected 
                        ? 'bg-blue-100 text-blue-700 border-blue-200' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {meal.emoji} {meal.label}
                  </Badge>
                );
              })}
            </div>
          </div>

          {/* Numerical Goals */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="servingsPerMeal">Servings per meal</Label>
              <Input
                id="servingsPerMeal"
                type="number"
                min="1"
                max="12"
                value={goals.servingsPerMeal || 4}
                onChange={(e) => handleGoalChange('servingsPerMeal', parseInt(e.target.value))}
                className="mt-1"
              />
            </div>

            {goals.primaryGoal === 'cost-saving' && (
              <div>
                <Label htmlFor="weeklyBudget">Weekly budget ($)</Label>
                <Input
                  id="weeklyBudget"
                  type="number"
                  min="10"
                  step="5"
                  value={goals.weeklyBudget || ''}
                  onChange={(e) => handleGoalChange('weeklyBudget', parseFloat(e.target.value))}
                  placeholder="e.g., 75"
                  className="mt-1"
                />
              </div>
            )}

            {goals.primaryGoal === 'macros' && (
              <>
                <div>
                  <Label htmlFor="calorieTarget">Daily calorie target</Label>
                  <Input
                    id="calorieTarget"
                    type="number"
                    min="1000"
                    max="4000"
                    step="50"
                    value={goals.calorieTarget || ''}
                    onChange={(e) => handleGoalChange('calorieTarget', parseInt(e.target.value))}
                    placeholder="e.g., 2000"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="proteinTarget">Daily protein target (g)</Label>
                  <Input
                    id="proteinTarget"
                    type="number"
                    min="50"
                    max="300"
                    step="5"
                    value={goals.proteinTarget || ''}
                    onChange={(e) => handleGoalChange('proteinTarget', parseInt(e.target.value))}
                    placeholder="e.g., 150"
                    className="mt-1"
                  />
                </div>
              </>
            )}

            {goals.primaryGoal === 'time-saving' && (
              <div>
                <Label htmlFor="timeConstraint">Max prep time per day (minutes)</Label>
                <Input
                  id="timeConstraint"
                  type="number"
                  min="10"
                  max="180"
                  step="15"
                  value={goals.timeConstraint || ''}
                  onChange={(e) => handleGoalChange('timeConstraint', parseInt(e.target.value))}
                  placeholder="e.g., 60"
                  className="mt-1"
                />
              </div>
            )}
          </div>

          {/* Cooking Skill Level */}
          <div>
            <Label className="text-base font-medium mb-4 block">
              Cooking skill level
            </Label>
            <div className="flex gap-3">
              {['beginner', 'intermediate', 'advanced'].map((level) => (
                <Badge
                  key={level}
                  onClick={() => handleGoalChange('cookingSkillLevel', level)}
                  className={`px-4 py-2 cursor-pointer transition-colors ${
                    goals.cookingSkillLevel === level
                      ? 'bg-green-100 text-green-700 border-green-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </Badge>
              ))}
            </div>
          </div>

          {/* Dietary Restrictions */}
          <div>
            <Label className="text-base font-medium mb-4 block">
              Dietary restrictions (optional)
            </Label>
            <div className="flex flex-wrap gap-2">
              {dietaryOptions.map((restriction) => {
                const isSelected = goals.dietaryRestrictions?.includes(restriction);
                
                return (
                  <Badge
                    key={restriction}
                    onClick={() => handleArrayToggle('dietaryRestrictions', restriction)}
                    className={`px-3 py-1 cursor-pointer transition-colors ${
                      isSelected 
                        ? 'bg-red-100 text-red-700 border-red-200' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {restriction}
                  </Badge>
                );
              })}
            </div>
          </div>

          {/* Preferred Cuisines */}
          <div>
            <Label className="text-base font-medium mb-4 block">
              Preferred cuisines (optional)
            </Label>
            <div className="flex flex-wrap gap-2">
              {cuisineOptions.map((cuisine) => {
                const isSelected = goals.preferredCuisines?.includes(cuisine);
                
                return (
                  <Badge
                    key={cuisine}
                    onClick={() => handleArrayToggle('preferredCuisines', cuisine)}
                    className={`px-3 py-1 cursor-pointer transition-colors ${
                      isSelected 
                        ? 'bg-yellow-100 text-yellow-700 border-yellow-200' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {cuisine}
                  </Badge>
                );
              })}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-6">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-6"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {isEditing ? 'Update Goals' : 'Save Goals'}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 