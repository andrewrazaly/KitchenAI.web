'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import ShoppingListGenerator from '../components/ShoppingListGenerator';
import { 
  ShoppingCart, 
  Plus, 
  Trash2,
  Check,
  ChefHat,
  Sparkles,
  X,
  Clock,
  Star,
  Instagram
} from "lucide-react";
import { 
  GeneratedShoppingList, 
  getStoredShoppingLists,
  deleteShoppingList as removeShoppingList
} from '../lib/shopping-list-service';
import { ShoppingListItem } from '../lib/ai-ingredient-extractor';
import { trackEvent } from '../components/GoogleAnalytics';

// Simple manual shopping list type
interface ManualShoppingList {
  id: string;
  name: string;
  items: Array<{
    id: string;
    name: string;
    checked: boolean;
    addedAt: number;
  }>;
  createdAt: number;
  type: 'manual';
}

// Extended AI list type with type field and name property
interface ExtendedGeneratedShoppingList extends GeneratedShoppingList {
  type: 'ai';
  name: string;
}

// Combined list type
type CombinedShoppingList = ManualShoppingList | ExtendedGeneratedShoppingList;

export default function ShoppingListPage() {
  const { isSignedIn } = useAuth();
  const [aiLists, setAILists] = useState<ExtendedGeneratedShoppingList[]>([]);
  const [manualLists, setManualLists] = useState<ManualShoppingList[]>([]);
  const [selectedList, setSelectedList] = useState<CombinedShoppingList | null>(null);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [newItemText, setNewItemText] = useState('');
  const [viewMode, setViewMode] = useState<'by-section' | 'by-recipe'>('by-section');

  // Load saved lists on component mount
  useEffect(() => {
    if (isSignedIn) {
      loadSavedLists();
      loadManualLists();
    }
  }, [isSignedIn]);

  const loadSavedLists = () => {
    const lists = getStoredShoppingLists();
    const extendedLists = lists.map(list => ({ 
      ...list, 
      type: 'ai' as const,
      name: `AI List - ${formatDate(list.generatedAt)}`
    }));
    setAILists(extendedLists.sort((a, b) => b.generatedAt - a.generatedAt));
  };

  const loadManualLists = () => {
    try {
      const stored = localStorage.getItem('manual_shopping_lists');
      const lists = stored ? JSON.parse(stored) : [];
      setManualLists(lists);
      
      // Create placeholder list if none exist
      if (lists.length === 0) {
        const placeholderList: ManualShoppingList = {
          id: 'placeholder-list',
          name: 'Shopping List',
          items: [],
          createdAt: Date.now(),
          type: 'manual'
        };
        setManualLists([placeholderList]);
        setSelectedList(placeholderList);
        localStorage.setItem('manual_shopping_lists', JSON.stringify([placeholderList]));
      } else {
        setSelectedList(lists[0]);
      }
    } catch (error) {
      console.error('Error loading manual lists:', error);
    }
  };

  const saveManualLists = (lists: ManualShoppingList[]) => {
    try {
      localStorage.setItem('manual_shopping_lists', JSON.stringify(lists));
      setManualLists(lists);
    } catch (error) {
      console.error('Error saving manual lists:', error);
    }
  };

  const createNewManualList = () => {
    const newList: ManualShoppingList = {
      id: `manual-${Date.now()}`,
      name: `Shopping List ${manualLists.length + 1}`,
      items: [],
      createdAt: Date.now(),
      type: 'manual'
    };
    const updatedLists = [newList, ...manualLists];
    saveManualLists(updatedLists);
    setSelectedList(newList);
  };

  const addItemToCurrentList = () => {
    if (!newItemText.trim() || !selectedList || selectedList.type !== 'manual') return;
    
    const newItem = {
      id: `item-${Date.now()}`,
      name: newItemText.trim(),
      checked: false,
      addedAt: Date.now()
    };

    const updatedList = {
      ...selectedList,
      items: [...selectedList.items, newItem]
    };

    const updatedLists = manualLists.map(list => 
      list.id === selectedList.id ? updatedList : list
    );
    
    saveManualLists(updatedLists);
    setSelectedList(updatedList);
    setNewItemText('');
  };

  const toggleItemChecked = (itemId: string) => {
    if (!selectedList) return;

    if (selectedList.type === 'manual') {
      const updatedList = {
        ...selectedList,
        items: selectedList.items.map(item =>
          item.id === itemId ? { ...item, checked: !item.checked } : item
        )
      };
      
      const updatedLists = manualLists.map(list => 
        list.id === selectedList.id ? updatedList : list
      );
      
      saveManualLists(updatedLists);
      setSelectedList(updatedList);
    } else {
      // Handle AI list item toggling
      const updatedList = {
        ...selectedList,
        items: selectedList.items.map(item =>
          item.id === itemId ? { ...item, checked: !item.checked } : item
        )
      };
      
      // Update the AI lists state
      const updatedAILists = aiLists.map(list => 
        list.id === selectedList.id ? updatedList : list
      );
      
      setAILists(updatedAILists);
      setSelectedList(updatedList);
      
      // Also update in localStorage
      try {
        const storedLists = getStoredShoppingLists();
        const updatedStoredLists = storedLists.map(list => 
          list.id === selectedList.id ? {
            ...list,
            items: updatedList.items
          } : list
        );
        localStorage.setItem('generated-shopping-lists', JSON.stringify(updatedStoredLists));
      } catch (error) {
        console.error('Error updating stored list:', error);
      }
    }
  };

  const handleAIListGenerated = (newList: GeneratedShoppingList) => {
    const extendedList = { 
      ...newList, 
      type: 'ai' as const,
      name: `AI List - ${formatDate(newList.generatedAt)}`
    };
    setAILists(prev => [extendedList, ...prev]);
    setShowAIGenerator(false);
    setSelectedList(extendedList);
    trackEvent('ai_shopping_list_created', 'shopping_lists', 'ai_generated', newList.totalItems);
  };

  const deleteList = (listId: string) => {
    // Handle AI list deletion
    const aiList = aiLists.find(list => list.id === listId);
    if (aiList) {
      removeShoppingList(listId);
      setAILists(prev => prev.filter(list => list.id !== listId));
    }
    
    // Handle manual list deletion
    const manualList = manualLists.find(list => list.id === listId);
    if (manualList) {
      const updatedLists = manualLists.filter(list => list.id !== listId);
      saveManualLists(updatedLists);
    }
    
    if (selectedList?.id === listId) {
      const remainingLists = [...aiLists, ...manualLists].filter(list => list.id !== listId);
      setSelectedList(remainingLists[0] || null);
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

  const getCompletionPercentage = (list: ExtendedGeneratedShoppingList) => {
    const completed = list.items.filter(item => item.checked).length;
    return Math.round((completed / list.totalItems) * 100);
  };

  const allLists: CombinedShoppingList[] = [
    ...manualLists,
    ...aiLists
  ].sort((a, b) => {
    const aTime = a.type === 'manual' ? a.createdAt : a.generatedAt;
    const bTime = b.type === 'manual' ? b.createdAt : b.generatedAt;
    return bTime - aTime;
  });

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
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Sidebar */}
      <div className="w-full lg:w-80 bg-white border-b lg:border-b-0 lg:border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200" style={{ padding: '1rem' }}>
          <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
            <h1 className="font-semibold text-gray-900" style={{ fontSize: '1.125rem' }}>Shopping Lists</h1>
            <div className="flex" style={{ gap: '0.5rem' }}>
              <Button
                onClick={createNewManualList}
                className="p-0 bg-gray-100 hover:bg-gray-200 text-gray-600"
                title="Create Manual List"
                style={{ height: '2rem', width: '2rem' }}
              >
                <Plus style={{ width: '1rem', height: '1rem' }} />
              </Button>
              <Button
                onClick={() => setShowAIGenerator(true)}
                className="p-0 bg-green-100 hover:bg-green-200 text-green-600"
                title="AI Generate from Reels"
                style={{ height: '2rem', width: '2rem' }}
              >
                <Sparkles style={{ width: '1rem', height: '1rem' }} />
              </Button>
            </div>
          </div>
          
          {selectedList && (
            <p className="text-gray-500" style={{ fontSize: '0.875rem' }}>
              {selectedList.type === 'manual' 
                ? `${selectedList.items?.length || 0} items`
                : `${selectedList.totalItems} items from ${selectedList.sourceReels?.length || 0} recipes`
              }
            </p>
          )}
        </div>

        {/* AI Promotion Banner */}
        {aiLists.length === 0 && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg" style={{ margin: '1rem', padding: '1rem' }}>
            <div className="flex items-start" style={{ gap: '0.75rem' }}>
              <div className="flex-shrink-0">
                <Sparkles className="text-green-600" style={{ width: '1.25rem', height: '1.25rem', marginTop: '0.125rem' }} />
              </div>
              <div>
                <h3 className="font-medium text-green-900" style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>AI-Powered Shopping Lists</h3>
                <p className="text-green-700" style={{ fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                  Turn your saved Instagram recipe reels into organized shopping lists automatically!
                </p>
                <Button
                  onClick={() => setShowAIGenerator(true)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem', height: 'auto' }}
                >
                  <Instagram style={{ width: '0.75rem', height: '0.75rem', marginRight: '0.25rem' }} />
                  Generate from Reels
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Lists */}
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-2 p-4">
            {allLists.map((list) => {
              const isSelected = selectedList?.id === list.id;
              const itemCount = list.type === 'manual' ? list.items?.length || 0 : list.totalItems;
              const date = list.type === 'manual' ? list.createdAt : list.generatedAt;
              
              return (
                <div
                  key={list.id}
                  onClick={() => setSelectedList(list)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    isSelected ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-sm text-gray-900 truncate">
                          {list.name}
                        </h3>
                        {list.type !== 'manual' && (
                          <Badge className="bg-green-100 text-green-700 text-xs px-1 py-0">
                            <Sparkles className="h-3 w-3" />
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {itemCount} item{itemCount !== 1 ? 's' : ''}
                        {list.type === 'ai' && list.sourceReels && (
                          <span className="text-green-600 ml-1">
                            • {list.sourceReels.length} recipe{list.sourceReels.length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </p>
                    </div>
                    {list.type === 'ai' && (
                      <div className="text-right">
                        <div className="text-xs text-green-600 font-medium">
                          {getCompletionPercentage(list)}%
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDate(date)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Create New List Button */}
        <div className="p-4 border-t border-gray-200">
          <Button
            onClick={createNewManualList}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 justify-center mb-2"
          >
            Create Manual List
          </Button>
          <Button
            onClick={() => setShowAIGenerator(true)}
            className="w-full bg-green-600 hover:bg-green-700 text-white justify-center"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            AI Generate from Reels
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {selectedList?.name || 'Shopping List'}
              </h1>
              {selectedList?.type === 'ai' && (
                <p className="text-sm text-green-600 mt-1">
                  <Sparkles className="h-3 w-3 inline mr-1" />
                  AI analyzed {selectedList.sourceReels?.length || 0} saved Instagram recipes
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {selectedList?.type === 'ai' && (
                <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('by-section')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                      viewMode === 'by-section'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    By Aisle
                  </button>
                  <button
                    onClick={() => setViewMode('by-recipe')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                      viewMode === 'by-recipe'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    By Recipe
                  </button>
                </div>
              )}
              <Button
                onClick={() => setShowAIGenerator(true)}
                className="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-2"
              >
                <Sparkles className="h-4 w-4 mr-1" />
                AI Generate
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          {!selectedList ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-4 text-gray-300">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <circle cx="50" cy="30" r="15" fill="currentColor" opacity="0.3"/>
                    <rect x="25" y="45" width="50" height="30" rx="5" fill="currentColor" opacity="0.5"/>
                    <rect x="30" y="50" width="40" height="4" rx="2" fill="white"/>
                    <rect x="30" y="58" width="25" height="4" rx="2" fill="white"/>
                    <rect x="30" y="66" width="35" height="4" rx="2" fill="white"/>
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Smart Shopping Lists</h3>
                <p className="text-gray-500 mb-4">
                  Create manual lists or let AI analyze your saved Instagram recipes to generate organized shopping lists
                </p>
                <Button
                  onClick={() => setShowAIGenerator(true)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Try AI Generation
                </Button>
              </div>
            </div>
          ) : selectedList.type === 'manual' ? (
            <div>
              {/* Add Item Section */}
              <div className="mb-6">
                <div className="flex gap-2">
                  <Input
                    value={newItemText}
                    onChange={(e) => setNewItemText(e.target.value)}
                    placeholder="Add item"
                    className="flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && addItemToCurrentList()}
                  />
                  <Button
                    onClick={addItemToCurrentList}
                    disabled={!newItemText.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Items List */}
              {selectedList.items?.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 mx-auto mb-4 text-gray-300">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      <circle cx="50" cy="30" r="15" fill="currentColor" opacity="0.3"/>
                      <rect x="25" y="45" width="50" height="30" rx="5" fill="currentColor" opacity="0.5"/>
                      <rect x="30" y="50" width="40" height="4" rx="2" fill="white"/>
                      <rect x="30" y="58" width="25" height="4" rx="2" fill="white"/>
                      <rect x="30" y="66" width="35" height="4" rx="2" fill="white"/>
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Add something to your list</h3>
                  <p className="text-gray-500 mb-4">Start by adding items above or generate a list from your saved recipes</p>
                  <Button
                    onClick={() => setShowAIGenerator(true)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate from Saved Reels
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedList.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                      <button
                        onClick={() => toggleItemChecked(item.id)}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          item.checked 
                            ? 'border-green-500 bg-green-500 text-white' 
                            : 'border-gray-300'
                        }`}
                      >
                        {item.checked && <Check className="h-3 w-3" />}
                      </button>
                      <span className={`flex-1 ${item.checked ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                        {item.name}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            // AI Generated List Display
            <div>
              {/* AI Explanation Banner */}
              <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-medium text-green-900 mb-1">AI-Powered Ingredient Analysis</h3>
                    <p className="text-sm text-green-700 mb-2">
                      Our AI analyzed <strong>{selectedList.sourceReels?.length || 0} Instagram recipes</strong> you saved and extracted 
                      <strong> {selectedList.totalItems} ingredients</strong>, organizing them by store sections for efficient shopping.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedList.sourceReels?.slice(0, 3).map((source) => (
                        <Badge key={source.reelId} className="bg-white text-green-700 text-xs px-2 py-1">
                          <Instagram className="h-3 w-3 mr-1" />
                          @{source.creator}
                        </Badge>
                      ))}
                      {selectedList.sourceReels && selectedList.sourceReels.length > 3 && (
                        <Badge className="bg-white text-green-700 text-xs px-2 py-1">
                          +{selectedList.sourceReels.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Recipe Sources */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3 text-gray-900">
                  Recipes Analyzed ({selectedList.sourceReels?.length || 0})
                </h3>
                <div className="grid gap-3">
                  {selectedList.sourceReels?.map((source) => (
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

              {/* By Store Section View */}
              {viewMode === 'by-section' && selectedList.organizedItems && (
                <div>
                  <h3 className="font-semibold mb-4 text-gray-900">
                    Shopping List by Store Section ({selectedList.totalItems} items)
                  </h3>
                  {Object.entries(selectedList.organizedItems).map(([section, items]) => (
                    <div key={section} className="mb-6">
                      <h4 className="font-medium text-lg mb-3 flex items-center gap-2 text-gray-900">
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
                            
                            <span className="text-lg mr-2">{item.emoji}</span>
                            
                            <div className={`flex-1 min-w-0 ${item.checked ? 'line-through' : ''}`}>
                              <span className="font-medium text-gray-900 block truncate">
                                {item.name}
                              </span>
                              {item.amount && (
                                <span className="text-sm text-gray-500">
                                  {item.amount} {item.unit}
                                </span>
                              )}
                            </div>
                            
                            {item.recipeSource && (
                              <Badge className="text-xs px-2 py-1 bg-gray-100 text-gray-600 flex-shrink-0">
                                {item.recipeSource}
                              </Badge>
                            )}
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
                  <h3 className="font-semibold mb-4 text-gray-900">
                    Shopping List by Recipe
                  </h3>
                  {selectedList.sourceReels?.map((source) => {
                    const recipeItems = selectedList.items.filter(item => 
                      source.analysis.ingredients.some(ingredient => 
                        ingredient.name.toLowerCase().includes(item.name.toLowerCase()) ||
                        item.name.toLowerCase().includes(ingredient.name.toLowerCase())
                      )
                    );
                    
                    return (
                      <div key={source.reelId} className="mb-6">
                        <h4 className="font-medium text-lg mb-3 flex items-center gap-2 text-gray-900">
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
                              
                              <span className="text-lg mr-2">{item.emoji}</span>
                              
                              <div className={`flex-1 min-w-0 ${item.checked ? 'line-through' : ''}`}>
                                <span className="font-medium text-gray-900 block truncate">
                                  {item.name}
                                </span>
                                {item.amount && (
                                  <span className="text-sm text-gray-500">
                                    {item.amount} {item.unit}
                                  </span>
                                )}
                              </div>
                              
                              {/* Store section indicator in recipe view */}
                              <Badge className="text-xs px-2 py-1 bg-gray-100 text-gray-600 flex-shrink-0">
                                {item.category || 'Other'}
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

              {/* Pro Tips */}
              <Card className="border-blue-200 bg-blue-50 mt-6">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Star className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <h3 className="font-medium text-blue-900 mb-2">How AI Shopping Lists Work</h3>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Save recipe reels from Instagram to automatically generate shopping lists</li>
                        <li>• Toggle between "By Aisle" for efficient shopping and "By Recipe" to see ingredient sources</li>
                        <li>• Lists are organized by grocery store sections for efficient shopping</li>
                        <li>• Items you already have in inventory are automatically filtered out</li>
                        <li>• Generate lists for specific time periods (3-7 days of recipes)</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* AI Generator Modal */}
      {showAIGenerator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Generate Smart Shopping List</h2>
                <Button
                  onClick={() => setShowAIGenerator(false)}
                  className="h-8 w-8 p-0 bg-transparent hover:bg-gray-100 text-gray-400"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Instagram className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-green-900 mb-1">Turn Your Saved Reels into Shopping Lists</h3>
                    <p className="text-sm text-green-700">
                      Our AI will analyze the recipe reels you've saved from Instagram, extract all the ingredients, 
                      and organize them by store sections for efficient shopping.
                    </p>
                  </div>
                </div>
              </div>
              
              <ShoppingListGenerator onListGenerated={handleAIListGenerated} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 