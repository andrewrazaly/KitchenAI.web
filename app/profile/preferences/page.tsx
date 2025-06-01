'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { ChefHat, ArrowLeft, Save } from "lucide-react";
import { useNotification } from '../../components/Notification';
import { useSupabase } from '../../hooks/useSupabase';

interface UserPreferences {
  dietaryRestrictions: string[];
  cuisinePreferences: string[];
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  timeConstraints: number; // minutes per meal
  budgetPerWeek: number;
  nutritionGoals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  householdSize: number;
}

export default function PreferencesPage() {
  const { loading, isSignedIn } = useAuth();
  const { showNotification } = useNotification();
  const supabase = useSupabase();
  const router = useRouter();
  
  const [preferences, setPreferences] = useState<UserPreferences>({
    dietaryRestrictions: [],
    cuisinePreferences: [],
    skillLevel: 'beginner',
    timeConstraints: 30,
    budgetPerWeek: 100,
    nutritionGoals: {
      calories: 2000,
      protein: 150,
      carbs: 250,
      fat: 65
    },
    householdSize: 1
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!loading && isSignedIn) {
      loadUserPreferences();
    } else if (!loading && !isSignedIn) {
      router.push('/signin');
    }
  }, [loading, isSignedIn]);

  const loadUserPreferences = async () => {
    try {
      setIsLoading(true);
      
      // First, try to load from localStorage
      const localPrefs = localStorage.getItem('mealPlannerPreferences');
      if (localPrefs) {
        try {
          const parsedPrefs = JSON.parse(localPrefs);
          setPreferences(parsedPrefs);
        } catch (e) {
          console.log('Error parsing local preferences:', e);
        }
      }
      
      // Try to load from Supabase
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { data: userPrefs } = await supabase
            .from('user_preferences')
            .select('*')
            .eq('user_id', session.user.id)
            .single();

          if (userPrefs) {
            setPreferences(userPrefs);
          }
        }
      } catch (supabaseError) {
        console.log('Supabase not available, using local storage:', supabaseError);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const savePreferences = async () => {
    try {
      setIsSaving(true);
      
      // Always save to localStorage
      localStorage.setItem('mealPlannerPreferences', JSON.stringify(preferences));
      
      // Try to save to Supabase if available
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { error } = await supabase
            .from('user_preferences')
            .upsert({
              user_id: session.user.id,
              ...preferences
            });

          if (error) throw error;
          
          showNotification('Preferences saved successfully!', 'success');
        } else {
          showNotification('Preferences saved locally!', 'success');
        }
      } catch (supabaseError) {
        console.log('Supabase save failed, but saved locally:', supabaseError);
        showNotification('Preferences saved locally!', 'success');
      }
      
    } catch (error) {
      console.error('Error saving preferences:', error);
      showNotification('Error saving preferences. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading preferences...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button
            onClick={() => router.back()}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Meal Planning Preferences</h1>
            <p className="text-gray-600">Customize your meal planning experience</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChefHat className="h-5 w-5" />
              Your Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Household Size */}
            <div>
              <label className="block text-sm font-medium mb-2">Household size</label>
              <select 
                value={preferences.householdSize}
                onChange={(e) => setPreferences({...preferences, householdSize: Number(e.target.value)})}
                className="w-full p-2 border rounded-md"
              >
                <option value={1}>Just me</option>
                <option value={2}>2 people</option>
                <option value={3}>3 people</option>
                <option value={4}>4+ people</option>
              </select>
            </div>
            
            {/* Cooking Skill Level */}
            <div>
              <label className="block text-sm font-medium mb-2">Cooking skill level</label>
              <div className="grid grid-cols-3 gap-2">
                {['beginner', 'intermediate', 'advanced'].map((level) => (
                  <button
                    key={level}
                    onClick={() => setPreferences({...preferences, skillLevel: level as any})}
                    className={`p-3 rounded-md border text-center capitalize ${
                      preferences.skillLevel === level 
                        ? 'bg-indigo-100 border-indigo-500 text-indigo-700' 
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Weekly Budget */}
            <div>
              <label className="block text-sm font-medium mb-2">Weekly budget ($)</label>
              <Input
                type="number"
                value={preferences.budgetPerWeek}
                onChange={(e) => setPreferences({...preferences, budgetPerWeek: Number(e.target.value)})}
                placeholder="100"
              />
            </div>
            
            {/* Time Constraints */}
            <div>
              <label className="block text-sm font-medium mb-2">Maximum cooking time per meal (minutes)</label>
              <Input
                type="number"
                value={preferences.timeConstraints}
                onChange={(e) => setPreferences({...preferences, timeConstraints: Number(e.target.value)})}
                placeholder="30"
              />
            </div>
            
            {/* Dietary Restrictions */}
            <div>
              <label className="block text-sm font-medium mb-2">Dietary restrictions</label>
              <div className="grid grid-cols-2 gap-2">
                {['Vegetarian', 'Vegan', 'Gluten-free', 'Dairy-free', 'Keto', 'Paleo'].map((restriction) => (
                  <button
                    key={restriction}
                    onClick={() => {
                      const current = preferences.dietaryRestrictions;
                      const updated = current.includes(restriction)
                        ? current.filter(r => r !== restriction)
                        : [...current, restriction];
                      setPreferences({...preferences, dietaryRestrictions: updated});
                    }}
                    className={`p-2 rounded-md border text-sm ${
                      preferences.dietaryRestrictions.includes(restriction)
                        ? 'bg-indigo-100 border-indigo-500 text-indigo-700'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    {restriction}
                  </button>
                ))}
              </div>
            </div>

            {/* Cuisine Preferences */}
            <div>
              <label className="block text-sm font-medium mb-2">Favorite cuisines</label>
              <div className="grid grid-cols-2 gap-2">
                {['Italian', 'Mexican', 'Asian', 'Mediterranean', 'American', 'Indian', 'Thai', 'French'].map((cuisine) => (
                  <button
                    key={cuisine}
                    onClick={() => {
                      const current = preferences.cuisinePreferences;
                      const updated = current.includes(cuisine)
                        ? current.filter(c => c !== cuisine)
                        : [...current, cuisine];
                      setPreferences({...preferences, cuisinePreferences: updated});
                    }}
                    className={`p-2 rounded-md border text-sm ${
                      preferences.cuisinePreferences.includes(cuisine)
                        ? 'bg-green-100 border-green-500 text-green-700'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    {cuisine}
                  </button>
                ))}
              </div>
            </div>

            {/* Nutrition Goals */}
            <div>
              <label className="block text-sm font-medium mb-2">Daily nutrition goals</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Calories</label>
                  <Input
                    type="number"
                    value={preferences.nutritionGoals.calories}
                    onChange={(e) => setPreferences({
                      ...preferences, 
                      nutritionGoals: {...preferences.nutritionGoals, calories: Number(e.target.value)}
                    })}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Protein (g)</label>
                  <Input
                    type="number"
                    value={preferences.nutritionGoals.protein}
                    onChange={(e) => setPreferences({
                      ...preferences, 
                      nutritionGoals: {...preferences.nutritionGoals, protein: Number(e.target.value)}
                    })}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Carbs (g)</label>
                  <Input
                    type="number"
                    value={preferences.nutritionGoals.carbs}
                    onChange={(e) => setPreferences({
                      ...preferences, 
                      nutritionGoals: {...preferences.nutritionGoals, carbs: Number(e.target.value)}
                    })}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Fat (g)</label>
                  <Input
                    type="number"
                    value={preferences.nutritionGoals.fat}
                    onChange={(e) => setPreferences({
                      ...preferences, 
                      nutritionGoals: {...preferences.nutritionGoals, fat: Number(e.target.value)}
                    })}
                  />
                </div>
              </div>
            </div>
            
            {/* Save Button */}
            <Button 
              onClick={savePreferences}
              className="w-full"
              disabled={isSaving}
            >
              {isSaving ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Saving...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save Preferences
                </div>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 