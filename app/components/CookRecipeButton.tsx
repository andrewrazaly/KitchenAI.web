'use client';

import { useState } from 'react';
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { 
  ChefHat, 
  CheckCircle, 
  AlertTriangle, 
  Minus,
  Plus,
  Loader2
} from "lucide-react";
import { useNotification } from './Notification';

interface RecipeIngredient {
  name: string;
  quantity?: string;
  unit?: string;
}

interface Recipe {
  title: string;
  ingredients: RecipeIngredient[];
  servings?: number;
}

interface CookRecipeButtonProps {
  recipe: Recipe;
  defaultServings?: number;
  onCooked?: (summary: any) => void;
  className?: string;
}

export default function CookRecipeButton({ 
  recipe, 
  defaultServings = 1, 
  onCooked,
  className = ""
}: CookRecipeButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [servings, setServings] = useState(defaultServings);
  const [showSummary, setShowSummary] = useState(false);
  const [cookingSummary, setCookingSummary] = useState<any>(null);
  const { showNotification } = useNotification();

  const handleCookRecipe = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/inventory/deduct-recipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipe,
          servingsCooked: servings
        }),
      });

      const result = await response.json();

      if (result.success) {
        setCookingSummary(result.summary);
        setShowSummary(true);
        showNotification(`✅ Marked "${recipe.title}" as cooked!`, 'success');
        
        if (onCooked) {
          onCooked(result.summary);
        }
      } else {
        showNotification('Failed to update inventory', 'error');
      }
    } catch (error) {
      console.error('Error cooking recipe:', error);
      showNotification('Error updating inventory', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (showSummary && cookingSummary) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="p-4 rounded-lg border bg-green-50 border-green-200">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <h4 className="font-semibold text-green-800">Recipe Cooked Successfully!</h4>
          </div>
          
          <p className="text-sm text-green-700 mb-3">
            Made {cookingSummary.servingsCooked} serving(s) of {cookingSummary.recipeTitle}
          </p>

          {cookingSummary.deductedItems.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-medium text-green-600 mb-1">✅ Ingredients Updated:</p>
              <div className="flex flex-wrap gap-1">
                {cookingSummary.deductedItems.map((item: string, index: number) => (
                  <Badge key={index} className="text-xs bg-green-100 text-green-700">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {cookingSummary.notFoundItems.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-medium text-orange-600 mb-1">⚠️ Not in Inventory:</p>
              <div className="flex flex-wrap gap-1">
                {cookingSummary.notFoundItems.map((item: string, index: number) => (
                  <Badge key={index} className="text-xs bg-orange-100 text-orange-700">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {cookingSummary.insufficientItems.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-medium text-red-600 mb-1">❌ Insufficient Quantities:</p>
              <div className="space-y-1">
                {cookingSummary.insufficientItems.map((item: any, index: number) => (
                  <div key={index} className="text-xs text-red-600">
                    {item.name}: needed {item.needed}, had {item.available}
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button 
            onClick={() => setShowSummary(false)}
            className="text-xs bg-green-600 hover:bg-green-700 text-white"
          >
            Done
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Servings Selector */}
      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
        <span className="text-sm font-medium text-gray-700">Servings:</span>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setServings(Math.max(1, servings - 1))}
            disabled={servings <= 1 || isLoading}
            className="h-8 w-8 p-0 bg-gray-200 hover:bg-gray-300 text-gray-700"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-8 text-center font-semibold">{servings}</span>
          <Button
            onClick={() => setServings(servings + 1)}
            disabled={isLoading}
            className="h-8 w-8 p-0 bg-gray-200 hover:bg-gray-300 text-gray-700"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Cook Recipe Button */}
      <Button
        onClick={handleCookRecipe}
        disabled={isLoading}
        className="w-full text-white font-semibold py-3 rounded-lg transition-all hover:opacity-90"
        style={{ backgroundColor: '#91c11e' }}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Updating Inventory...
          </>
        ) : (
          <>
            <ChefHat className="h-4 w-4 mr-2" />
            Mark as Cooked & Update Inventory
          </>
        )}
      </Button>

      <div className="text-xs text-gray-500 text-center">
        This will automatically deduct ingredients from your inventory
      </div>
    </div>
  );
} 