export interface Deal {
  id: string;
  title: string;
  description: string;
  originalPrice: number;
  salePrice: number;
  discount: number; // percentage
  store: string;
  category: string;
  imageUrl?: string;
  validUntil: Date;
  quantity?: string;
  brand?: string;
  isOrganic?: boolean;
  location?: string;
  tags: string[];
}

export interface MealPlan {
  id: string;
  userId: string;
  name: string;
  startDate: Date;
  endDate: Date;
  budget: number;
  meals: {
    [date: string]: {
      breakfast?: {
        recipeId: string;
        recipeName: string;
        servings: number;
        ingredients: string[];
      };
      lunch?: {
        recipeId: string;
        recipeName: string;
        servings: number;
        ingredients: string[];
      };
      dinner?: {
        recipeId: string;
        recipeName: string;
        servings: number;
        ingredients: string[];
      };
      snacks?: {
        recipeId: string;
        recipeName: string;
        servings: number;
        ingredients: string[];
      }[];
    };
  };
  shoppingList: {
    ingredient: string;
    quantity: number;
    unit: string;
    category: string;
    isPurchased: boolean;
    estimatedCost: number;
  }[];
  nutritionSummary: {
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
    totalFiber: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface WeeklyMealPlan extends MealPlan {
  weekNumber: number;
  year: number;
}

export interface MonthlyMealPlan {
  id: string;
  userId: string;
  month: number;
  year: number;
  weeklyPlans: WeeklyMealPlan[];
  monthlyBudget: number;
  monthlyNutritionGoals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  createdAt: Date;
  updatedAt: Date;
} 