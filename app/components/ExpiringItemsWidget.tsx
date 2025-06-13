'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { 
  AlertTriangle, 
  Clock, 
  ChefHat, 
  ArrowRight,
  Sparkles
} from "lucide-react";

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
        
        // Try to get real inventory data from localStorage first
        let inventoryItems: InventoryItem[] = [];
        try {
          const storedInventory = localStorage.getItem('inventory_items');
          if (storedInventory) {
            const parsedInventory = JSON.parse(storedInventory);
            // Convert to expected format and filter expiring items
            inventoryItems = parsedInventory
              .filter((item: any) => item.expiry_date)
              .map((item: any) => ({
                id: item.id,
                name: item.name,
                category: item.category || 'Other',
                quantity: parseFloat(item.quantity) || 1,
                unit: item.unit || 'pcs',
                expiry_date: item.expiry_date,
                location: item.location || 'Pantry'
              }))
              .filter((item: InventoryItem) => {
                if (!item.expiry_date) return false;
                const daysUntilExpiry = getDaysUntilExpiry(item.expiry_date);
                return daysUntilExpiry >= 0 && daysUntilExpiry <= 7; // Items expiring in next 7 days
              });
          }
        } catch (error) {
          console.warn('Could not load inventory from localStorage:', error);
        }
        
        // If no real inventory data, use mock data for demonstration
        if (inventoryItems.length === 0) {
          inventoryItems = [
            {
              id: '1',
              name: 'Organic Milk',
              category: 'Dairy',
              quantity: 1,
              unit: 'gallon',
              expiry_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              location: 'Fridge'
            },
            {
              id: '2',
              name: 'Fresh Spinach',
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
        }
        
        setExpiringItems(inventoryItems);
        
        // Generate recipe suggestions
        if (inventoryItems.length > 0) {
          await fetchRecipeSuggestions(inventoryItems);
        }
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
      
      // Enhanced recipe suggestions based on actual expiring items
      const expiringIngredients = items.map(item => item.name.toLowerCase());
      
      const allRecipeSuggestions: RecipeSuggestion[] = [
        {
          title: 'Quick Vegetable Stir Fry',
          ingredients: ['Bell peppers', 'Broccoli', 'Spinach', 'Soy sauce', 'Garlic', 'Ginger'],
          mealType: 'dinner',
          prepTime: 10,
          cookTime: 15,
          usedExpiringItems: items.filter(item => 
            item.name.toLowerCase().includes('spinach') || 
            item.name.toLowerCase().includes('vegetable')
          ).map(item => item.name)
        },
        {
          title: 'Creamy Spinach Chicken',
          ingredients: ['Chicken Breast', 'Spinach', 'Cream', 'Garlic', 'Olive oil', 'Salt', 'Pepper'],
          mealType: 'dinner',
          prepTime: 15,
          cookTime: 25,
          usedExpiringItems: items.filter(item => 
            item.name.toLowerCase().includes('chicken') || 
            item.name.toLowerCase().includes('spinach')
          ).map(item => item.name)
        },
        {
          title: 'Fresh Garden Salad',
          ingredients: ['Spinach', 'Strawberries', 'Feta cheese', 'Walnuts', 'Balsamic vinaigrette'],
          mealType: 'lunch',
          prepTime: 10,
          cookTime: 0,
          usedExpiringItems: items.filter(item => 
            item.name.toLowerCase().includes('spinach') ||
            item.name.toLowerCase().includes('lettuce') ||
            item.category.toLowerCase().includes('vegetable')
          ).map(item => item.name)
        },
        {
          title: 'Creamy Milk Smoothie',
          ingredients: ['Milk', 'Banana', 'Berries', 'Honey', 'Vanilla'],
          mealType: 'breakfast',
          prepTime: 5,
          cookTime: 0,
          usedExpiringItems: items.filter(item => 
            item.name.toLowerCase().includes('milk')
          ).map(item => item.name)
        },
        {
          title: 'Grilled Chicken & Vegetables',
          ingredients: ['Chicken Breast', 'Mixed vegetables', 'Olive oil', 'Herbs', 'Lemon'],
          mealType: 'dinner',
          prepTime: 20,
          cookTime: 25,
          usedExpiringItems: items.filter(item => 
            item.name.toLowerCase().includes('chicken') ||
            item.category.toLowerCase().includes('vegetable')
          ).map(item => item.name)
        }
      ];
      
      // Filter suggestions that actually use expiring items
      const relevantSuggestions = allRecipeSuggestions
        .filter(recipe => recipe.usedExpiringItems && recipe.usedExpiringItems.length > 0)
        .slice(0, 3);
      
      setRecipeSuggestions(relevantSuggestions);
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
  
  // Determine urgency level and styling
  const getExpiryUrgency = (date: string | null) => {
    const days = getDaysUntilExpiry(date);
    if (days <= 1) return { level: 'critical', color: '#ef9d17', bgColor: '#fff8f0' };
    if (days <= 3) return { level: 'warning', color: '#E8DE10', bgColor: '#fffef0' };
    return { level: 'normal', color: '#91c11e', bgColor: '#f8fff0' };
  };
  
  if (loading) {
    return (
      <Card className="border border-gray-100 bg-white shadow-sm">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (expiringItems.length === 0) {
    return (
      <Card className="border border-gray-100 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2" style={{ color: '#3c3c3c' }}>
            <Clock className="h-5 w-5" style={{ color: '#91c11e' }} />
            Ingredients Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="p-3 rounded-full mx-auto w-fit mb-3" style={{ backgroundColor: '#f8fff0' }}>
              <Clock className="h-6 w-6" style={{ color: '#91c11e' }} />
            </div>
            <p className="font-medium mb-1" style={{ color: '#3c3c3c' }}>All Fresh! 🎉</p>
            <p className="text-sm" style={{ color: '#888888' }}>
              No ingredients expiring soon
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="border border-gray-100 bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" style={{ color: '#ef9d17' }} />
            <span style={{ color: '#3c3c3c' }}>Ingredients Running Low</span>
          </div>
          <Badge className="text-xs px-2 py-1" style={{ backgroundColor: '#fff8f0', color: '#ef9d17' }}>
            {expiringItems.length} expiring
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 mb-6">
          {expiringItems.slice(0, 4).map(item => {
            const urgency = getExpiryUrgency(item.expiry_date);
            const daysLeft = getDaysUntilExpiry(item.expiry_date);
            
            return (
              <div key={item.id} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: urgency.bgColor }}>
                <div className="flex-1">
                  <p className="font-medium" style={{ color: '#3c3c3c' }}>{item.name}</p>
                  <p className="text-sm" style={{ color: '#888888' }}>
                    {item.quantity} {item.unit} • {item.location}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium" style={{ color: urgency.color }}>
                    {daysLeft === 0 ? 'Today' : daysLeft === 1 ? 'Tomorrow' : `${daysLeft} days`}
                  </p>
                  <p className="text-xs" style={{ color: '#888888' }}>
                    {formatDate(item.expiry_date)}
                  </p>
                </div>
              </div>
            );
          })}
          
          {expiringItems.length > 4 && (
            <div className="text-center pt-2">
              <Button 
                className="text-sm font-medium"
                style={{ color: '#91c11e' }}
                onClick={() => router.push('/inventory')}
              >
                View {expiringItems.length - 4} more items
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
        
        {(recipeSuggestions.length > 0 || suggestionsLoading) && (
          <div className="border-t pt-4" style={{ borderColor: '#f0f0f0' }}>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4" style={{ color: '#91c11e' }} />
              <h3 className="font-medium" style={{ color: '#3c3c3c' }}>Recipe Suggestions</h3>
            </div>
            
            {suggestionsLoading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2" style={{ borderColor: '#91c11e' }}></div>
              </div>
            ) : (
              <>
                <div className="space-y-2 mb-4">
                  {recipeSuggestions.slice(0, 2).map((recipe, index) => (
                    <div 
                      key={index} 
                      className="p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm"
                      style={{ backgroundColor: '#f8fff0', borderColor: '#e8f5e8' }}
                      onClick={() => router.push('/meal-planner')}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-medium text-sm" style={{ color: '#3c3c3c' }}>{recipe.title}</p>
                        <ChefHat className="h-4 w-4 flex-shrink-0 ml-2" style={{ color: '#91c11e' }} />
                      </div>
                      <p className="text-xs mb-2" style={{ color: '#888888' }}>
                        {recipe.ingredients.slice(0, 3).join(', ')}
                        {recipe.ingredients.length > 3 ? '...' : ''}
                      </p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium" style={{ color: '#91c11e' }}>
                          Perfect for {recipe.mealType}
                        </span>
                        {recipe.prepTime && recipe.cookTime && (
                          <span style={{ color: '#888888' }}>
                            {recipe.prepTime + recipe.cookTime} min
                          </span>
                        )}
                      </div>
                      {recipe.usedExpiringItems && recipe.usedExpiringItems.length > 0 && (
                        <div className="mt-2 text-xs" style={{ color: '#659a41' }}>
                          ✓ Uses: {recipe.usedExpiringItems.join(', ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="text-center">
                  <Button 
                    className="text-white font-medium px-4 py-2 rounded-lg transition-all hover:opacity-90"
                    style={{ backgroundColor: '#91c11e' }}
                    onClick={() => router.push('/meal-planner')}
                  >
                    <ChefHat className="h-4 w-4 mr-2" />
                    Create Meal Plan
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 