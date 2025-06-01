export const daysOfWeek = [
  'Monday',
  'Tuesday', 
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

export interface UserPreferences {
  id: string;
  userId: string;
  dietaryRestrictions: string[];
  allergies: string[];
  preferredCuisines: string[];
  dislikedIngredients: string[];
  budget: {
    weekly: number;
    monthly: number;
  };
  mealPlanPreferences: {
    mealsPerDay: number;
    prepTime: number; // max prep time in minutes
    difficulty: 'Easy' | 'Medium' | 'Hard' | 'Any';
    servings: number;
  };
  nutritionGoals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  schedulePreferences: {
    availableDays: string[];
    preferredMealTimes: {
      breakfast: string;
      lunch: string;
      dinner: string;
    };
  };
  shoppingPreferences: {
    preferredStores: string[];
    maxTravelDistance: number; // in miles
    preferBulkBuying: boolean;
    organicPreference: boolean;
  };
  kitchenEquipment: string[];
  createdAt: Date;
  updatedAt: Date;
} 