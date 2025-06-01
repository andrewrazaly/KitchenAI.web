'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  expiry_date: string | null;
  location: string;
}

interface RecipeSuggestion {
  title: string;
  ingredients: string[];
  mealType: 'breakfast' | 'lunch' | 'dinner';
  instructions?: string;
  prepTime?: number;
  cookTime?: number;
  usedExpiringItems?: string[];
}

export default function ExpiringItemsWidget() {
  const [expiringItems, setExpiringItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [recipeSuggestions, setRecipeSuggestions] = useState<RecipeSuggestion[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const router = useRouter();
  
  // Fetch items expiring in the next 7 days
  useEffect(() => {
    const fetchExpiringItems = async () => {
      try {
        setLoading(true);
        
        // Mock data for expiring items
        const mockExpiringItems: InventoryItem[] = [
          {
            id: '1',
            name: 'Milk',
            category: 'Dairy',
            quantity: 1,
            unit: 'gallon',
            expiry_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            location: 'Fridge'
          },
          {
            id: '2',
            name: 'Spinach',
            category: 'Vegetables',
            quantity: 1,
            unit: 'bag',
            expiry_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            location: 'Fridge'
          },
          {
            id: '3',
            name: 'Chicken Breast',
            category: 'Meat',
            quantity: 2,
            unit: 'lbs',
            expiry_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            location: 'Fridge'
          }
        ];
        
        setExpiringItems(mockExpiringItems);
        
        // Generate mock recipe suggestions
        await fetchRecipeSuggestions(mockExpiringItems);
      } catch (error) {
        console.error('Error fetching expiring items:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchExpiringItems();
  }, []);
  
  // Generate recipe suggestions based on expiring ingredients
  const fetchRecipeSuggestions = async (items: InventoryItem[]) => {
    try {
      setSuggestionsLoading(true);
      
      // Mock data for recipe suggestions
      const mockRecipeSuggestions: RecipeSuggestion[] = [
        {
          title: 'Quick Vegetable Stir Fry',
          ingredients: ['Bell peppers', 'Broccoli', 'Spinach', 'Soy sauce', 'Garlic', 'Ginger'],
          mealType: 'dinner',
          prepTime: 10,
          cookTime: 15,
          usedExpiringItems: ['Spinach']
        },
        {
          title: 'Creamy Spinach Chicken',
          ingredients: ['Chicken Breast', 'Spinach', 'Cream', 'Garlic', 'Olive oil', 'Salt', 'Pepper'],
          mealType: 'dinner',
          prepTime: 15,
          cookTime: 25,
          usedExpiringItems: ['Chicken Breast', 'Spinach']
        },
        {
          title: 'Strawberry Spinach Salad',
          ingredients: ['Spinach', 'Strawberries', 'Feta cheese', 'Walnuts', 'Balsamic vinaigrette'],
          mealType: 'lunch',
          prepTime: 10,
          cookTime: 0,
          usedExpiringItems: ['Spinach']
        }
      ];
      
      setRecipeSuggestions(mockRecipeSuggestions);
    } catch (error) {
      console.error('Error generating recipe suggestions:', error);
      setRecipeSuggestions([]);
    } finally {
      setSuggestionsLoading(false);
    }
  };
  
  // Format date for display
  const formatDate = (date: string | null) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  
  // Calculate days until expiry
  const getDaysUntilExpiry = (date: string | null) => {
    if (!date) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiryDate = new Date(date);
    expiryDate.setHours(0, 0, 0, 0);
    
    return Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };
  
  // Determine text color based on days until expiry
  const getExpiryColor = (date: string | null) => {
    const days = getDaysUntilExpiry(date);
    if (days <= 2) return 'text-red-600';
    if (days <= 5) return 'text-yellow-600';
    return 'text-green-600';
  };
  
  if (loading) {
    return (
      <div className="bg-white rounded-lg p-4 shadow animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }
  
  if (expiringItems.length === 0) {
    return (
      <div className="bg-white rounded-lg p-4 shadow">
        <h2 className="text-lg font-semibold mb-2">Expiring Soon</h2>
        <p className="text-gray-500">No items expiring soon! 🎉</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg p-4 shadow">
      <h2 className="text-lg font-semibold mb-2">Expiring Soon</h2>
      
      <div className="mb-4">
        <ul className="space-y-2">
          {expiringItems.slice(0, 5).map(item => (
            <li key={item.id} className="flex justify-between items-center">
              <span>{item.name}</span>
              <span className={`text-sm font-medium ${getExpiryColor(item.expiry_date)}`}>
                {formatDate(item.expiry_date)} ({getDaysUntilExpiry(item.expiry_date)} days)
              </span>
            </li>
          ))}
          {expiringItems.length > 5 && (
            <li className="text-center text-sm text-gray-500 pt-1">
              <Link href="/inventory" className="text-indigo-600 hover:text-indigo-800">
                View {expiringItems.length - 5} more items
              </Link>
            </li>
          )}
        </ul>
      </div>
      
      {(recipeSuggestions.length > 0 || suggestionsLoading) && (
        <div>
          <h3 className="text-md font-medium mb-2">Recipe Suggestions</h3>
          
          {suggestionsLoading ? (
            <div className="flex justify-center py-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                {recipeSuggestions.slice(0, 3).map((recipe, index) => (
                  <div 
                    key={index} 
                    className="bg-indigo-50 border border-indigo-100 rounded p-3 cursor-pointer hover:bg-indigo-100"
                    onClick={() => router.push('/meal-planner')}
                  >
                    <p className="font-medium">{recipe.title}</p>
                    <p className="text-sm text-gray-600">
                      {recipe.ingredients.slice(0, 3).join(', ')}
                      {recipe.ingredients.length > 3 ? '...' : ''}
                    </p>
                    <div className="mt-1 text-xs flex justify-between items-center">
                      <span className="text-indigo-600 font-medium">
                        Perfect for {recipe.mealType}
                      </span>
                      {recipe.prepTime && recipe.cookTime && (
                        <span className="text-gray-500">
                          {recipe.prepTime + recipe.cookTime} min
                        </span>
                      )}
                    </div>
                    {recipe.usedExpiringItems && recipe.usedExpiringItems.length > 0 && (
                      <div className="mt-1 text-xs text-green-600">
                        Uses: {recipe.usedExpiringItems.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="mt-3 text-center">
                <button 
                  onClick={() => router.push('/meal-planner')}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Create meal plan with these ingredients
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
} 