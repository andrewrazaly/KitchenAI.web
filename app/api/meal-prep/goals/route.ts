import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { MealPrepGoals } from '../../../components/MealPrepGoalsForm';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Fetch user's meal prep goals
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('meal_prep_goals')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching meal prep goals:', error);
      return NextResponse.json({ error: 'Failed to fetch goals' }, { status: 500 });
    }

    return NextResponse.json({ goals: data || null });
  } catch (error) {
    console.error('Error in GET /api/meal-prep/goals:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new meal prep goals
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const goals: MealPrepGoals = body.goals;

    if (!goals.userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Check if goals already exist for this user
    const { data: existingGoals } = await supabase
      .from('meal_prep_goals')
      .select('id')
      .eq('user_id', goals.userId)
      .single();

    if (existingGoals) {
      return NextResponse.json({ 
        error: 'Goals already exist for this user. Use PUT to update.' 
      }, { status: 409 });
    }

    const { data, error } = await supabase
      .from('meal_prep_goals')
      .insert({
        user_id: goals.userId,
        primary_goal: goals.primaryGoal,
        meal_scope: goals.mealScope,
        weekly_budget: goals.weeklyBudget,
        calorie_target: goals.calorieTarget,
        protein_target: goals.proteinTarget,
        time_constraint: goals.timeConstraint,
        servings_per_meal: goals.servingsPerMeal,
        dietary_restrictions: goals.dietaryRestrictions,
        preferred_cuisines: goals.preferredCuisines,
        cooking_skill_level: goals.cookingSkillLevel,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating meal prep goals:', error);
      return NextResponse.json({ error: 'Failed to create goals' }, { status: 500 });
    }

    return NextResponse.json({ goals: data }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/meal-prep/goals:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update existing meal prep goals
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const goals: MealPrepGoals = body.goals;

    if (!goals.userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('meal_prep_goals')
      .update({
        primary_goal: goals.primaryGoal,
        meal_scope: goals.mealScope,
        weekly_budget: goals.weeklyBudget,
        calorie_target: goals.calorieTarget,
        protein_target: goals.proteinTarget,
        time_constraint: goals.timeConstraint,
        servings_per_meal: goals.servingsPerMeal,
        dietary_restrictions: goals.dietaryRestrictions,
        preferred_cuisines: goals.preferredCuisines,
        cooking_skill_level: goals.cookingSkillLevel,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', goals.userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating meal prep goals:', error);
      return NextResponse.json({ error: 'Failed to update goals' }, { status: 500 });
    }

    return NextResponse.json({ goals: data });
  } catch (error) {
    console.error('Error in PUT /api/meal-prep/goals:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete meal prep goals
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('meal_prep_goals')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting meal prep goals:', error);
      return NextResponse.json({ error: 'Failed to delete goals' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Goals deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/meal-prep/goals:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 