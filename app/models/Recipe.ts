export const dietaryRestrictionOptions = [
  'None',
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Dairy-Free',
  'Nut-Free',
  'Keto',
  'Paleo',
  'Low-Carb',
  'Low-Fat',
  'Diabetic-Friendly',
  'Heart-Healthy',
  'Mediterranean',
  'Whole30',
  'Pescatarian',
  'Kosher',
  'Halal'
];

export const cuisineOptions = [
  'American',
  'Italian',
  'Mexican',
  'Chinese',
  'Japanese',
  'Thai',
  'Indian',
  'French',
  'Greek',
  'Spanish',
  'Mediterranean',
  'Middle Eastern',
  'Korean',
  'Vietnamese',
  'German',
  'British',
  'Russian',
  'Brazilian',
  'Moroccan',
  'Ethiopian',
  'Cajun/Creole',
  'Caribbean',
  'Nordic',
  'Fusion'
];

export interface Recipe {
  id: string;
  title: string;
  description?: string;
  cuisine: string;
  dietaryRestrictions: string[];
  ingredients: string[];
  instructions: string[];
  prepTime: number; // in minutes
  cookTime: number; // in minutes
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  nutritionInfo?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
  };
  tags: string[];
  imageUrl?: string;
  rating?: number;
  reviews?: number;
  createdAt: Date;
  updatedAt: Date;
} 