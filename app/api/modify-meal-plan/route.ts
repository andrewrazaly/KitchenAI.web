import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { originalPlan, modificationType, newValue, preferences } = await request.json();

    if (!originalPlan || !modificationType) {
      return NextResponse.json({ message: 'Missing required parameters' }, { status: 400 });
    }

    // Create a modified version of the meal plan
    let modifiedPlan = JSON.parse(JSON.stringify(originalPlan)); // Deep copy
    
    switch (modificationType) {
      case 'replace_meal':
        modifiedPlan = await replaceMeal(modifiedPlan, newValue);
        break;
      case 'change_cuisine':
        modifiedPlan = await changeCuisine(modifiedPlan, newValue, preferences);
        break;
      case 'add_restriction':
        modifiedPlan = await addDietaryRestriction(modifiedPlan, newValue, preferences);
        break;
      case 'adjust_budget':
        modifiedPlan = await adjustBudget(modifiedPlan, newValue, preferences);
        break;
      default:
        return NextResponse.json({ message: 'Invalid modification type' }, { status: 400 });
    }

    // Update the plan metadata
    modifiedPlan.name = `Modified ${originalPlan.name}`;
    modifiedPlan.id = `plan_${Date.now()}`;

    return NextResponse.json({ 
      success: true, 
      mealPlan: modifiedPlan,
      message: 'Meal plan modified successfully'
    });

  } catch (error) {
    console.error('Error modifying meal plan:', error);
    return NextResponse.json({ 
      message: 'Failed to modify meal plan',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

async function replaceMeal(plan: any, mealDescription: string) {
  // Parse the meal description to identify which meal to replace
  // e.g., "Monday breakfast" or "Day 2 dinner"
  const dayMatch = mealDescription.match(/(monday|tuesday|wednesday|thursday|friday|saturday|sunday|day\s*(\d+))/i);
  const mealMatch = mealDescription.match(/(breakfast|lunch|dinner)/i);
  
  if (!dayMatch || !mealMatch) {
    // If we can't parse, just replace the first breakfast
    if (plan.meals && plan.meals.length > 0) {
      plan.meals[0].breakfast = generateReplacementMeal('breakfast');
    }
    return plan;
  }

  const mealType = mealMatch[1].toLowerCase();
  let dayIndex = 0;

  if (dayMatch[2]) {
    // "Day 2" format
    dayIndex = parseInt(dayMatch[2]) - 1;
  } else {
    // Day name format
    const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    dayIndex = dayNames.indexOf(dayMatch[1].toLowerCase());
  }

  if (plan.meals && plan.meals[dayIndex]) {
    plan.meals[dayIndex][mealType] = generateReplacementMeal(mealType);
  }

  return plan;
}

async function changeCuisine(plan: any, newCuisine: string, preferences: any) {
  // Regenerate meals with new cuisine preference
  if (!plan.meals) return plan;

  for (let day of plan.meals) {
    day.breakfast = generateMealWithCuisine('breakfast', newCuisine);
    day.lunch = generateMealWithCuisine('lunch', newCuisine);
    day.dinner = generateMealWithCuisine('dinner', newCuisine);
  }

  return plan;
}

async function addDietaryRestriction(plan: any, restriction: string, preferences: any) {
  // Modify existing meals to accommodate new dietary restriction
  if (!plan.meals) return plan;

  for (let day of plan.meals) {
    day.breakfast = adaptMealForRestriction(day.breakfast, restriction);
    day.lunch = adaptMealForRestriction(day.lunch, restriction);
    day.dinner = adaptMealForRestriction(day.dinner, restriction);
  }

  return plan;
}

async function adjustBudget(plan: any, newBudget: string, preferences: any) {
  // Extract budget amount
  const budgetMatch = newBudget.match(/\$?(\d+)/);
  const budgetAmount = budgetMatch ? parseInt(budgetMatch[1]) : 100;

  // Adjust meals based on budget
  if (!plan.meals) return plan;

  const isLowBudget = budgetAmount < 75;
  const isHighBudget = budgetAmount > 150;

  for (let day of plan.meals) {
    if (isLowBudget) {
      day.breakfast = makeMealBudgetFriendly(day.breakfast);
      day.lunch = makeMealBudgetFriendly(day.lunch);
      day.dinner = makeMealBudgetFriendly(day.dinner);
    } else if (isHighBudget) {
      day.breakfast = makeMealPremium(day.breakfast);
      day.lunch = makeMealPremium(day.lunch);
      day.dinner = makeMealPremium(day.dinner);
    }
  }

  return plan;
}

function generateReplacementMeal(mealType: string) {
  const replacementMeals = {
    breakfast: [
      {
        title: "Avocado Toast with Poached Egg",
        ingredients: ["Whole grain bread", "Avocado", "Eggs", "Lemon", "Salt", "Pepper"],
        prepTime: 15,
        difficulty: "Easy",
        nutrition: { calories: 320, protein: 14, carbs: 28, fat: 18 }
      },
      {
        title: "Greek Yogurt Parfait",
        ingredients: ["Greek yogurt", "Granola", "Mixed berries", "Honey"],
        prepTime: 5,
        difficulty: "Easy",
        nutrition: { calories: 280, protein: 20, carbs: 35, fat: 8 }
      }
    ],
    lunch: [
      {
        title: "Mediterranean Quinoa Bowl",
        ingredients: ["Quinoa", "Cucumber", "Tomatoes", "Feta cheese", "Olives", "Olive oil"],
        prepTime: 20,
        difficulty: "Easy",
        nutrition: { calories: 420, protein: 16, carbs: 52, fat: 16 }
      },
      {
        title: "Turkey and Hummus Wrap",
        ingredients: ["Whole wheat tortilla", "Turkey slices", "Hummus", "Lettuce", "Tomato"],
        prepTime: 10,
        difficulty: "Easy",
        nutrition: { calories: 380, protein: 25, carbs: 35, fat: 15 }
      }
    ],
    dinner: [
      {
        title: "Baked Salmon with Roasted Vegetables",
        ingredients: ["Salmon fillet", "Broccoli", "Sweet potato", "Olive oil", "Herbs"],
        prepTime: 30,
        difficulty: "Medium",
        nutrition: { calories: 520, protein: 35, carbs: 28, fat: 28 }
      },
      {
        title: "Chicken Stir-fry with Brown Rice",
        ingredients: ["Chicken breast", "Mixed vegetables", "Brown rice", "Soy sauce", "Ginger"],
        prepTime: 25,
        difficulty: "Medium",
        nutrition: { calories: 480, protein: 32, carbs: 45, fat: 18 }
      }
    ]
  };

  const meals = replacementMeals[mealType as keyof typeof replacementMeals] || replacementMeals.lunch;
  return meals[Math.floor(Math.random() * meals.length)];
}

function generateMealWithCuisine(mealType: string, cuisine: string) {
  const cuisineMeals: { [key: string]: any } = {
    Italian: {
      breakfast: { title: "Cappuccino and Cornetto", ingredients: ["Cornetto", "Coffee", "Milk"] },
      lunch: { title: "Margherita Pizza", ingredients: ["Pizza dough", "Tomato sauce", "Mozzarella", "Basil"] },
      dinner: { title: "Spaghetti Carbonara", ingredients: ["Spaghetti", "Eggs", "Pancetta", "Parmesan", "Black pepper"] }
    },
    Asian: {
      breakfast: { title: "Congee with Pickled Vegetables", ingredients: ["Rice", "Chicken broth", "Pickled vegetables"] },
      lunch: { title: "Pad Thai", ingredients: ["Rice noodles", "Shrimp", "Bean sprouts", "Peanuts", "Lime"] },
      dinner: { title: "Teriyaki Chicken Bowl", ingredients: ["Chicken", "Rice", "Broccoli", "Teriyaki sauce"] }
    },
    Mexican: {
      breakfast: { title: "Huevos Rancheros", ingredients: ["Eggs", "Tortillas", "Salsa", "Beans", "Cheese"] },
      lunch: { title: "Chicken Quesadilla", ingredients: ["Tortillas", "Chicken", "Cheese", "Peppers", "Onions"] },
      dinner: { title: "Beef Tacos", ingredients: ["Ground beef", "Taco shells", "Lettuce", "Tomato", "Cheese"] }
    }
  };

  const defaultMeal = generateReplacementMeal(mealType);
  return cuisineMeals[cuisine]?.[mealType] || defaultMeal;
}

function adaptMealForRestriction(meal: any, restriction: string) {
  const adaptedMeal = { ...meal };
  
  switch (restriction.toLowerCase()) {
    case 'vegetarian':
      adaptedMeal.ingredients = meal.ingredients.filter((ing: string) => 
        !['chicken', 'beef', 'pork', 'fish', 'salmon', 'turkey', 'shrimp'].some(meat => 
          ing.toLowerCase().includes(meat)
        )
      );
      if (meal.title.toLowerCase().includes('chicken')) {
        adaptedMeal.title = meal.title.replace(/chicken/gi, 'tofu');
        adaptedMeal.ingredients.push('Tofu');
      }
      break;
    case 'vegan':
      adaptedMeal.ingredients = meal.ingredients.filter((ing: string) => 
        !['cheese', 'milk', 'eggs', 'butter', 'yogurt', 'chicken', 'beef', 'fish'].some(animal => 
          ing.toLowerCase().includes(animal)
        )
      );
      break;
    case 'gluten-free':
      adaptedMeal.ingredients = meal.ingredients.map((ing: string) => 
        ing.toLowerCase().includes('bread') ? 'Gluten-free bread' :
        ing.toLowerCase().includes('pasta') ? 'Gluten-free pasta' :
        ing.toLowerCase().includes('flour') ? 'Gluten-free flour' : ing
      );
      break;
  }
  
  return adaptedMeal;
}

function makeMealBudgetFriendly(meal: any) {
  const budgetMeal = { ...meal };
  
  // Replace expensive ingredients with budget alternatives
  budgetMeal.ingredients = meal.ingredients.map((ing: string) => {
    const lower = ing.toLowerCase();
    if (lower.includes('salmon')) return 'Canned tuna';
    if (lower.includes('beef')) return 'Ground turkey';
    if (lower.includes('quinoa')) return 'Rice';
    if (lower.includes('avocado')) return 'Cucumber';
    return ing;
  });
  
  return budgetMeal;
}

function makeMealPremium(meal: any) {
  const premiumMeal = { ...meal };
  
  // Upgrade ingredients to premium versions
  premiumMeal.ingredients = meal.ingredients.map((ing: string) => {
    const lower = ing.toLowerCase();
    if (lower.includes('chicken')) return 'Organic free-range chicken';
    if (lower.includes('rice')) return 'Wild rice';
    if (lower.includes('vegetables')) return 'Organic seasonal vegetables';
    return ing;
  });
  
  return premiumMeal;
} 