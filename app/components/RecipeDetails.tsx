'use client';

import { useState, useEffect } from 'react';
import { useSupabase } from '../hooks/useSupabase';

interface RecipeDetailsProps {
  title: string;
  ingredients: string[];
  instructions?: string;
  mealType: 'breakfast' | 'lunch' | 'dinner';
  date: string;
  onClose: () => void;
}

export default function RecipeDetails({ 
  title, 
  ingredients, 
  instructions, 
  mealType, 
  date,
  onClose 
}: RecipeDetailsProps) {
  const [loading, setLoading] = useState(false);
  const [fullInstructions, setFullInstructions] = useState<string | null>(instructions || null);
  const supabase = useSupabase();
  
  // Fetch complete recipe instructions if not provided
  useEffect(() => {
    const fetchRecipeInstructions = async () => {
      if (instructions) {
        setFullInstructions(instructions);
        return;
      }
      
      try {
        setLoading(true);
        
        // Try to find recipe in database first
        const { data: recipeData, error: recipeError } = await supabase
          .from('recipes')
          .select('instructions')
          .eq('title', title)
          .single();
          
        if (recipeData?.instructions) {
          setFullInstructions(recipeData.instructions);
          return;
        }
        
        // If not found, generate instructions using OpenAI
        const response = await fetch('/api/generate-instructions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, ingredients }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to generate recipe instructions');
        }
        
        const data = await response.json();
        setFullInstructions(data.instructions);
        
        // Save to database for future use
        await supabase.from('recipes').upsert({
          title: title,
          ingredients: ingredients,
          instructions: data.instructions,
          created_at: new Date().toISOString()
        });
        
      } catch (error) {
        console.error('Error fetching recipe instructions:', error);
        setFullInstructions('Instructions not available. Try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecipeInstructions();
  }, [title, ingredients, instructions, supabase]);
  
  // Format date for display
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });
  
  // Get color based on meal type
  const getMealColor = () => {
    switch (mealType) {
      case 'breakfast': return 'bg-amber-50 border-amber-200';
      case 'lunch': return 'bg-emerald-50 border-emerald-200';
      case 'dinner': return 'bg-indigo-50 border-indigo-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };
  
  // Get text color based on meal type
  const getMealTextColor = () => {
    switch (mealType) {
      case 'breakfast': return 'text-amber-800';
      case 'lunch': return 'text-emerald-800';
      case 'dinner': return 'text-indigo-800';
      default: return 'text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className={`${getMealColor()} p-4 border-b`}>
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold">{title}</h2>
              <p className={`${getMealTextColor()} capitalize font-medium`}>
                {mealType} • {formattedDate}
              </p>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Ingredients */}
            <div className="md:col-span-1">
              <h3 className="text-lg font-semibold mb-3">Ingredients</h3>
              <ul className="space-y-2">
                {ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2 text-gray-500">•</span>
                    <span>{ingredient}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Instructions */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold mb-3">Instructions</h3>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
                </div>
              ) : fullInstructions ? (
                <div className="space-y-4">
                  {fullInstructions.split('\n').map((paragraph, index) => (
                    <p key={index} className={paragraph.trim() === '' ? 'h-4' : ''}>
                      {paragraph}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No instructions available.</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="border-t p-4 flex justify-end">
          <button
            onClick={onClose}
            className="btn btn-secondary mr-2"
          >
            Close
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              window.print();
            }}
          >
            Print Recipe
          </button>
        </div>
      </div>
    </div>
  );
} 