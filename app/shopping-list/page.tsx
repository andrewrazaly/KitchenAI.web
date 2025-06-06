'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import ShoppingListGenerator from '../components/ShoppingListGenerator';
import { 
  ShoppingCart, 
  Calendar, 
  User, 
  Clock, 
  Plus, 
  Trash2,
  Check,
  ChefHat,
  Star
} from "lucide-react";
import { 
  GeneratedShoppingList, 
  getStoredShoppingLists,
  deleteShoppingList as removeShoppingList
} from '../lib/shopping-list-service';
import { trackEvent } from '../components/GoogleAnalytics';

export default function ShoppingListPage() {
  const { isSignedIn, user } = useAuth();
  const [savedLists, setSavedLists] = useState<GeneratedShoppingList[]>([]);
  const [showGenerator, setShowGenerator] = useState(false);
  const [selectedList, setSelectedList] = useState<GeneratedShoppingList | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date');
  const [viewMode, setViewMode] = useState<'by-section' | 'by-recipe'>('by-section');

  useEffect(() => {
    if (isSignedIn) {
      loadSavedLists();
    }
  }, [isSignedIn]);

  const loadSavedLists = () => {
    const lists = getStoredShoppingLists();
    setSavedLists(lists.sort((a, b) => b.generatedAt - a.generatedAt));
  };

  const handleListGenerated = (newList: GeneratedShoppingList) => {
    setSavedLists(prev => [newList, ...prev]);
    setShowGenerator(false);
    setSelectedList(newList);
    
    // Track shopping list generation
    trackEvent('shopping_list_created', 'shopping_lists', 'ai_generated', newList.totalItems);
  };

  const handleDeleteList = async (listId: string) => {
    try {
      await removeShoppingList(listId);
      setSavedLists(prev => prev.filter(list => list.id !== listId));
      if (selectedList?.id === listId) {
        setSelectedList(null);
      }
      
      // Track shopping list deletion
      trackEvent('shopping_list_deleted', 'shopping_lists', listId);
    } catch (error) {
      console.error('Error deleting list:', error);
      trackEvent('shopping_list_delete_error', 'shopping_lists', listId);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCompletionPercentage = (list: GeneratedShoppingList) => {
    const completed = list.items.filter(item => item.checked).length;
    return Math.round((completed / list.totalItems) * 100);
  };

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-8">
            <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Sign In Required</h2>
            <p className="text-gray-600">Please sign in to access your shopping lists.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-Optimized Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
                <ShoppingCart className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                Smart Shopping Lists
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                AI-generated lists from your saved recipe reels
              </p>
            </div>
            <Button
              onClick={() => setShowGenerator(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              <Plus className="h-4 w-4" />
              Create New List
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* New List Generator */}
        {showGenerator && (
          <Card className="mb-6 sm:mb-8">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Generate New Shopping List</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ShoppingListGenerator onListGenerated={handleListGenerated} />
              <Button
                onClick={() => setShowGenerator(false)}
                className="text-gray-600 hover:text-gray-800 px-3 py-2 rounded border w-full sm:w-auto"
              >
                Cancel
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Mobile-First Layout */}
        <div className="space-y-6">
          {/* Lists Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Your Lists ({savedLists.length})</h2>
              {user && (
                <Badge className="bg-green-100 text-green-800 px-2 py-1 text-xs">
                  <User className="h-3 w-3 mr-1" />
                  {user.email?.split('@')[0]}
                </Badge>
              )}
            </div>
          </div>

          {savedLists.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8 sm:py-12">
                <ShoppingCart className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">No shopping lists yet</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4">
                  Create your first shopping list from saved recipes
                </p>
                <Button
                  onClick={() => setShowGenerator(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create First List
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Lists Sidebar - Responsive */}
              <div className="lg:col-span-1">
                <Card className="sticky top-4">
                  <CardHeader>
                    <CardTitle className="text-base sm:text-lg text-gray-900 flex items-center gap-2">
                      <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                      Recent Lists
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {savedLists.map((list) => {
                        const completion = getCompletionPercentage(list);
                        const isSelected = selectedList?.id === list.id;
                        
                        return (
                          <div
                            key={list.id}
                            onClick={() => {
                              setSelectedList(list);
                              // Track shopping list view
                              trackEvent('shopping_list_viewed', 'shopping_lists', `list_${list.id}`, list.totalItems);
                            }}
                            className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                              isSelected 
                                ? 'border-green-300 bg-green-50' 
                                : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <Calendar className="h-3 w-3 text-gray-400 flex-shrink-0" />
                                  <span className="text-xs text-gray-500 truncate">
                                    {formatDate(list.generatedAt)}
                                  </span>
                                </div>
                                <p className="font-medium text-sm text-gray-900 truncate">
                                  {list.totalItems} items from {list.sourceReels.length} recipes
                                </p>
                              </div>
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteList(list.id);
                                }}
                                className="h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600 text-gray-400 flex-shrink-0 ml-2"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>

                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                                <div 
                                  className="h-1.5 rounded-full transition-all"
                                  style={{ 
                                    width: `${completion}%`,
                                    backgroundColor: completion === 100 ? '#16a34a' : '#22c55e'
                                  }}
                                />
                              </div>
                              <span className="text-xs text-gray-500 flex-shrink-0">{completion}%</span>
                            </div>
                            
                            <div className="flex flex-wrap gap-1">
                              {list.sourceReels.slice(0, 2).map((source) => (
                                <Badge 
                                  key={source.reelId}
                                  className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600"
                                >
                                  @{source.creator}
                                </Badge>
                              ))}
                              {list.sourceReels.length > 2 && (
                                <Badge className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500">
                                  +{list.sourceReels.length - 2}
                                </Badge>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Main Content - Responsive */}
              <div className="lg:col-span-2">
                {selectedList ? (
                  <Card>
                    <CardHeader>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                          <CardTitle className="text-lg sm:text-xl text-gray-900 flex items-center gap-2">
                            <ShoppingCart className="h-5 w-5" />
                            Shopping List Details
                          </CardTitle>
                          <p className="text-sm text-gray-600 mt-1">
                            Generated on {formatDate(selectedList.generatedAt)}
                          </p>
                        </div>
                        <Badge className="bg-green-600 text-white font-medium px-3 py-1">
                          {getCompletionPercentage(selectedList)}% Complete
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Recipe Sources - Mobile Optimized */}
                      <div>
                        <h3 className="font-semibold mb-3 text-gray-900">
                          Recipes Analyzed ({selectedList.sourceReels.length})
                        </h3>
                        <div className="grid gap-3">
                          {selectedList.sourceReels.map((source) => (
                            <div 
                              key={source.reelId}
                              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                            >
                              <ChefHat className="h-4 w-4 text-green-600 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm text-gray-900 truncate">
                                  {source.title}
                                </p>
                                <p className="text-xs text-gray-500">@{source.creator}</p>
                              </div>
                              <Badge className="text-xs px-2 py-1 bg-white flex-shrink-0">
                                {source.analysis.ingredients.length} ingredients
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Shopping List Items with Toggle - Mobile Optimized */}
                      <div>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                          <h3 className="font-semibold text-gray-900">
                            Shopping List ({selectedList.totalItems} items)
                          </h3>
                          
                          {/* View Toggle */}
                          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                            <button
                              onClick={() => {
                                setViewMode('by-section');
                                trackEvent('shopping_list_view_changed', 'shopping_lists', 'by_section');
                              }}
                              className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all ${
                                viewMode === 'by-section'
                                  ? 'bg-white text-gray-900 shadow-sm'
                                  : 'text-gray-600 hover:text-gray-900'
                              }`}
                            >
                              By Store Section
                            </button>
                            <button
                              onClick={() => {
                                setViewMode('by-recipe');
                                trackEvent('shopping_list_view_changed', 'shopping_lists', 'by_recipe');
                              }}
                              className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all ${
                                viewMode === 'by-recipe'
                                  ? 'bg-white text-gray-900 shadow-sm'
                                  : 'text-gray-600 hover:text-gray-900'
                              }`}
                            >
                              By Recipe
                            </button>
                          </div>
                        </div>
                        
                        {/* By Store Section View */}
                        {viewMode === 'by-section' && (
                          <div>
                            {Object.entries(selectedList.organizedItems).map(([section, items]) => (
                              <div key={section} className="mb-6">
                                <h4 className="font-medium text-base sm:text-lg mb-3 flex items-center gap-2 text-gray-900">
                                  <div 
                                    className="w-3 h-3 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: 
                                      section === 'Produce' ? '#16a34a' : 
                                      section === 'Meat & Seafood' ? '#dc2626' :
                                      section === 'Dairy' ? '#ca8a04' : '#6b7280' }}
                                  />
                                  <span className="truncate">{section} ({items.length})</span>
                                </h4>
                                
                                <div className="grid gap-2">
                                  {items.map((item) => (
                                    <div 
                                      key={item.id}
                                      className={`flex items-center gap-3 p-3 border border-gray-200 rounded-lg ${
                                        item.checked ? 'bg-gray-50 opacity-75' : 'bg-white'
                                      }`}
                                    >
                                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                                        item.checked 
                                          ? 'border-green-500 bg-green-500 text-white' 
                                          : 'border-gray-300'
                                      }`}>
                                        {item.checked && <Check className="h-2.5 w-2.5" />}
                                      </div>
                                      
                                      <div className={`flex-1 min-w-0 ${item.checked ? 'line-through' : ''}`}>
                                        <span className="font-medium text-gray-900 block truncate">
                                          {item.name}
                                        </span>
                                        {item.quantity && (
                                          <span className="text-sm text-gray-500">
                                            {item.quantity} {item.unit}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* By Recipe View */}
                        {viewMode === 'by-recipe' && (
                          <div>
                            {selectedList.sourceReels.map((source) => {
                              const recipeItems = selectedList.items.filter(item => 
                                source.analysis.ingredients.some(ingredient => 
                                  ingredient.name.toLowerCase().includes(item.name.toLowerCase()) ||
                                  item.name.toLowerCase().includes(ingredient.name.toLowerCase())
                                )
                              );
                              
                              return (
                                <div key={source.reelId} className="mb-6">
                                  <h4 className="font-medium text-base sm:text-lg mb-3 flex items-center gap-2 text-gray-900">
                                    <ChefHat className="h-4 w-4 text-green-600 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                      <span className="truncate">{source.title}</span>
                                      <p className="text-xs text-gray-500 font-normal">@{source.creator}</p>
                                    </div>
                                    <Badge className="text-xs px-2 py-1 bg-green-100 text-green-700 flex-shrink-0">
                                      {recipeItems.length} items
                                    </Badge>
                                  </h4>
                                  
                                  <div className="grid gap-2 pl-6">
                                    {recipeItems.map((item) => (
                                      <div 
                                        key={item.id}
                                        className={`flex items-center gap-3 p-3 border border-gray-200 rounded-lg ${
                                          item.checked ? 'bg-gray-50 opacity-75' : 'bg-white'
                                        }`}
                                      >
                                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                                          item.checked 
                                            ? 'border-green-500 bg-green-500 text-white' 
                                            : 'border-gray-300'
                                        }`}>
                                          {item.checked && <Check className="h-2.5 w-2.5" />}
                                        </div>
                                        
                                        <div className={`flex-1 min-w-0 ${item.checked ? 'line-through' : ''}`}>
                                          <span className="font-medium text-gray-900 block truncate">
                                            {item.name}
                                          </span>
                                          {item.quantity && (
                                            <span className="text-sm text-gray-500">
                                              {item.quantity} {item.unit}
                                            </span>
                                          )}
                                        </div>
                                        
                                        {/* Store section indicator in recipe view */}
                                        <Badge className="text-xs px-2 py-1 bg-gray-100 text-gray-600 flex-shrink-0">
                                          {item.storeSection || item.category || 'Other'}
                                        </Badge>
                                      </div>
                                    ))}
                                    
                                    {/* Show ingredient analysis for recipe */}
                                    <div className="mt-2 p-2 bg-green-50 rounded-lg border border-green-100">
                                      <p className="text-xs text-green-700 font-medium mb-1">Original Recipe Ingredients:</p>
                                      <p className="text-xs text-green-600 leading-relaxed">
                                        {source.analysis.ingredients.map(ing => ing.name).join(', ')}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="h-96 flex items-center justify-center">
                    <CardContent className="text-center">
                      <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-medium mb-2 text-gray-900">
                        Select a Shopping List
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Choose a list from the sidebar to view details, or create a new one.
                      </p>
                      <Button
                        onClick={() => setShowGenerator(true)}
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create New List
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}

          {/* Pro Tips - Mobile Optimized */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start gap-3">
                <Star className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <h3 className="font-medium text-blue-900 mb-2">Pro Tips for Smart Shopping Lists</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Save recipe reels from Instagram to automatically generate shopping lists</li>
                    <li>• Toggle between "By Store Section" for efficient shopping and "By Recipe" to see ingredient sources</li>
                    <li>• Lists are organized by grocery store sections for efficient shopping</li>
                    <li>• Items you already have in inventory are automatically filtered out</li>
                    <li>• Generate lists for specific time periods (3-7 days of recipes)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 