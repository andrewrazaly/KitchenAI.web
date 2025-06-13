'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import { useSupabase } from '../hooks/useSupabase';
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Checkbox } from "../components/ui/checkbox";
import { Search, Plus, MoreHorizontal, Heart, Share2, Clock, Users, ChefHat, Calendar, ShoppingCart, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../components/ui/dialog";
import { getSavedReels, SavedReel, unsaveReel } from '../../feature_import_instagram/lib/saved-reels-service';
import { getUserCollections, createCollection, addRecipeToCollection, removeRecipeFromCollection, getRecipesInCollection } from '../lib/collections-service';
import type { Collection as ServiceCollection } from '../lib/collections-service';
import { toast } from 'react-hot-toast';
import { parseIngredientsFromReel } from '../lib/ingredient-parser-service';
import type { ParsedIngredient } from '../lib/ingredient-parser-service';
import { getUserShoppingLists, createShoppingList, addItemsToShoppingList, convertIngredientsToShoppingItems } from '../lib/shopping-list-service';
import type { ShoppingList } from '../lib/shopping-list-service';

// Collection interface
interface Collection {
  id: string;
  name: string;
  recipeCount: number;
  image: string;
  isPrivate: boolean;
  createdAt: Date;
}

// Transform service collection to component collection
function transformCollection(serviceCollection: ServiceCollection): Collection {
  return {
    id: serviceCollection.id,
    name: serviceCollection.name,
    recipeCount: serviceCollection.recipe_count,
    image: serviceCollection.image_url || '/lemon.svg',
    isPrivate: serviceCollection.is_private,
    createdAt: new Date(serviceCollection.created_at)
  };
}

function RecipesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isSignedIn } = useAuth();
  const supabase = useSupabase();
  const [searchQuery, setSearchQuery] = useState('');
  const [savedReels, setSavedReels] = useState<SavedReel[]>([]);
  const [filteredReels, setFilteredReels] = useState<SavedReel[]>([]);
  const [loading, setLoading] = useState(true);
  const [collections, setCollections] = useState<Collection[]>([]);
  
  // Collection modal states
  const [selectedReelForCollection, setSelectedReelForCollection] = useState<SavedReel | null>(null);
  const [showAddToCollectionModal, setShowAddToCollectionModal] = useState(false);
  const [showCreateCollectionModal, setShowCreateCollectionModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [isPrivateCollection, setIsPrivateCollection] = useState(false);

  // Shopping list states
  const [selectedReelForShopping, setSelectedReelForShopping] = useState<SavedReel | null>(null);
  const [showAddToShoppingModal, setShowAddToShoppingModal] = useState(false);
  const [parsedIngredients, setParsedIngredients] = useState<ParsedIngredient[]>([]);
  const [selectedListId, setSelectedListId] = useState<string>('');
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([]);
  const [showCreateShoppingListModal, setShowCreateShoppingListModal] = useState(false);
  const [newShoppingListName, setNewShoppingListName] = useState('');
  
  // Load saved reels and collections
  useEffect(() => {
    const loadData = async () => {
      if (!isSignedIn) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Load both reels and collections in parallel
        const [reels, userCollections] = await Promise.all([
          getSavedReels(supabase),
          getUserCollections(supabase)
        ]);
        
        setSavedReels(reels || []);
        setFilteredReels(reels || []);
        
        const transformedCollections = userCollections?.map(transformCollection) || [];
        setCollections(transformedCollections);
      } catch (error) {
        console.error('Error loading data:', error);
        setSavedReels([]);
        setFilteredReels([]);
        setCollections([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isSignedIn, supabase]);

  // Filter reels based on search query
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = savedReels.filter(reel =>
        reel.caption_text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reel.user?.username?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredReels(filtered);
    } else {
      setFilteredReels(savedReels);
    }
  }, [searchQuery, savedReels]);

  const handleCreateNewRecipe = () => {
    // Navigate to create recipe page
    console.log('Create new recipe clicked - navigating to /recipes/new');
    router.push('/recipes/new');
  };

  const handleCreateCollection = () => {
    console.log('🟡 Opening create collection modal');
    // Add a small delay to ensure dropdown menu has closed
    setTimeout(() => {
      setShowCreateCollectionModal(true);
    }, 50);
  };

  const handleSaveCollection = async () => {
    if (!newCollectionName.trim()) return;

    try {
      console.log('🔵 Creating new collection:', newCollectionName);
      const serviceCollection = await createCollection(
        {
          name: newCollectionName.trim(),
          is_private: isPrivateCollection
        },
        supabase
      );

      if (serviceCollection) {
        const newCollection = transformCollection(serviceCollection);
        setCollections(prev => [newCollection, ...prev]);
        console.log('🔵 Collection created successfully:', newCollection.name);
      }
    } catch (error) {
      console.error('Error creating collection:', error);
      alert('Failed to create collection. Please try again.');
    }

    // Reset modal state
    setNewCollectionName('');
    setIsPrivateCollection(false);
    setShowCreateCollectionModal(false);
  };

  const handleCancelCreateCollection = () => {
    setNewCollectionName('');
    setIsPrivateCollection(false);
    setShowCreateCollectionModal(false);
  };

  const handleUnsaveReel = async (reel: SavedReel, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      await unsaveReel(reel.id, supabase);
      
      // Remove recipe from all collections that contain it
      const collectionsToUpdate: string[] = [];
      
      // Check each collection to see if it contains this recipe
      for (const collection of collections) {
        try {
          const recipesInCollection = await getRecipesInCollection(collection.id, supabase);
          
          if (recipesInCollection.includes(reel.id)) {
            // Remove recipe from this collection
            await removeRecipeFromCollection(collection.id, reel.id, supabase);
            collectionsToUpdate.push(collection.id);
          }
        } catch (error) {
          console.warn(`Failed to check/update collection ${collection.id}:`, error);
        }
      }
      
      // Update collection counts in local state
      if (collectionsToUpdate.length > 0) {
        setCollections(prev => 
          prev.map(collection => 
            collectionsToUpdate.includes(collection.id)
              ? { ...collection, recipeCount: Math.max(0, collection.recipeCount - 1) }
              : collection
          )
        );
      }
      
      // Remove from local state
      setSavedReels(prev => prev.filter(r => r.id !== reel.id));
      setFilteredReels(prev => prev.filter(r => r.id !== reel.id));
      
      toast.success('Recipe removed from saved');
    } catch (error) {
      console.error('Error unsaving reel:', error);
      toast.error('Failed to remove recipe');
    }
  };

  const handleOpenAddToCollection = (reel: SavedReel, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedReelForCollection(reel);
    setShowAddToCollectionModal(true);
  };

  const handleAddToCollection = async (collectionId: string) => {
    if (!selectedReelForCollection) return;
    
    try {
      await addRecipeToCollection(collectionId, selectedReelForCollection.id, supabase);
      
      // Update collection recipe count in local state
      setCollections(prev => 
        prev.map(collection => 
          collection.id === collectionId 
            ? { ...collection, recipeCount: collection.recipeCount + 1 }
            : collection
        )
      );
      
      toast.success('Recipe added to collection');
    } catch (error) {
      console.error('Error adding to collection:', error);
      toast.error('Failed to add to collection');
    } finally {
      setShowAddToCollectionModal(false);
      setSelectedReelForCollection(null);
    }
  };

  // Shopping List Functions
  const handleOpenAddToShopping = async (reel: SavedReel, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      // Parse ingredients from the reel
      const ingredients = parseIngredientsFromReel(reel);
      setParsedIngredients(ingredients);
      setSelectedReelForShopping(reel);
      
      // Load existing shopping lists
      const lists = getUserShoppingLists();
      setShoppingLists(lists);
      
      // If no lists exist, create a default one
      if (lists.length === 0) {
        const defaultList = createShoppingList('My Shopping List');
        setShoppingLists([defaultList]);
        setSelectedListId(defaultList.id);
      } else {
        setSelectedListId(lists[0].id);
      }
      
      setShowAddToShoppingModal(true);
    } catch (error) {
      console.error('Error parsing ingredients:', error);
      toast.error('Failed to parse ingredients');
    }
  };

  const handleAddToShoppingList = async () => {
    if (!selectedReelForShopping || !selectedListId) return;
    
    try {
      const selectedIngredients = parsedIngredients.filter(ing => ing.selected);
      if (selectedIngredients.length === 0) {
        toast.error('Please select at least one ingredient');
        return;
      }
      
      const reelTitle = getReelTitle(selectedReelForShopping);
      const shoppingItems = convertIngredientsToShoppingItems(selectedIngredients, reelTitle);
      
      addItemsToShoppingList(selectedListId, shoppingItems);
      
      toast.success(`Added ${selectedIngredients.length} ingredients to shopping list`);
      
      // Close modal
      setShowAddToShoppingModal(false);
      setSelectedReelForShopping(null);
      setParsedIngredients([]);
    } catch (error) {
      console.error('Error adding to shopping list:', error);
      toast.error('Failed to add to shopping list');
    }
  };

  const handleCreateShoppingList = () => {
    if (!newShoppingListName.trim()) return;
    
    try {
      const newList = createShoppingList(newShoppingListName.trim());
      setShoppingLists(prev => [newList, ...prev]);
      setSelectedListId(newList.id);
      setNewShoppingListName('');
      setShowCreateShoppingListModal(false);
      toast.success('Shopping list created');
    } catch (error) {
      console.error('Error creating shopping list:', error);
      toast.error('Failed to create shopping list');
    }
  };

  const toggleIngredientSelection = (ingredientId: string) => {
    setParsedIngredients(prev => 
      prev.map(ingredient => 
        ingredient.id === ingredientId 
          ? { ...ingredient, selected: !ingredient.selected }
          : ingredient
      )
    );
  };

  const getReelImage = (reel: SavedReel) => {
    return reel.image_versions2?.candidates?.[0]?.url || '/lemon.svg';
  };

  const getReelTitle = (reel: SavedReel) => {
    return reel.caption_text || 'Recipe from @' + reel.user?.username || 'Saved Recipe';
  };

  const getReelSource = (reel: SavedReel) => {
    return '@' + (reel.user?.username || 'instagram');
  };

  const extractCookingTime = (caption: string): string => {
    const timeMatch = caption.match(/(\d+)\s*(min|minute|hour|hr)/i);
    return timeMatch ? timeMatch[0] : '30min';
  };

  const extractIngredientCount = (caption: string): number => {
    const ingredientMatch = caption.match(/(\d+)\s*(ingredient|item)/i);
    return ingredientMatch ? parseInt(ingredientMatch[1]) : 8;
  };

  if (!isSignedIn) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <h2 className="text-2xl font-semibold mb-4">Sign in to view saved recipes</h2>
          <p className="text-gray-600">Access your saved recipes and collections!</p>
          <Button className="mt-4">Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-100 px-4 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">Saved</h1>
            
            {/* Add Button with Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-4 py-2">
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                {/* TODO: Add recipe from URL - parses spoonacular API links */}
                {/* <DropdownMenuItem className="flex items-center gap-3 py-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Search className="h-4 w-4" />
                  </div>
                  <span>Add recipe from URL</span>
                </DropdownMenuItem> */}
                <DropdownMenuItem 
                  className="flex items-center gap-3 py-3"
                  onClick={handleCreateNewRecipe}
                >
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Plus className="h-4 w-4" />
                  </div>
                  <span>Create new recipe</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="flex items-center gap-3 py-3"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('🔴 Add collection clicked from dropdown');
                    console.log('🔴 Current showCreateCollectionModal state:', showCreateCollectionModal);
                    console.log('🔴 About to set showCreateCollectionModal to true');
                    setShowCreateCollectionModal(true);
                    console.log('🔴 setShowCreateCollectionModal(true) called');
                  }}
                >
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <ChefHat className="h-4 w-4 text-yellow-600" />
                  </div>
                  <span>Add collection</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search recipes"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 py-3 bg-gray-50 border-gray-200 rounded-xl"
          />
        </div>

        {/* Collections Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Collections ({collections.length})</h2>
            <div className="flex gap-2">
              <Button 
                className="text-blue-600 text-sm bg-white hover:bg-blue-50 border border-blue-200"
                onClick={() => {
                  console.log('🟦 Direct Create Collection clicked');
                  console.log('🟦 Current collections:', collections.map(c => c.name));
                  setShowCreateCollectionModal(true);
                }}
              >
                + Create
              </Button>
              <Button 
                className="text-green-600 text-sm bg-white hover:bg-green-50 border border-green-200"
                onClick={() => {
                  console.log('See All clicked - navigating to /collections');
                  router.push('/collections');
                }}
              >
                See All
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {(() => {
              console.log('🔍 Rendering collections grid. Total collections:', collections.length);
              console.log('🔍 Collection names:', collections.map(c => c.name));
              return null;
            })()}
            {collections.length === 0 ? (
              <div className="col-span-full text-center py-8 text-gray-500">
                No collections yet. Create your first collection!
              </div>
            ) : (
              collections.map((collection) => (
                <Card 
                  key={collection.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => {
                    console.log('Collection clicked:', collection.id);
                    router.push(`/collections/${collection.id}`);
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={collection.image}
                        alt={collection.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm text-gray-900 truncate">
                          {collection.name}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {collection.recipeCount} recipe{collection.recipeCount !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* All Recipes Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">All Recipes ({filteredReels.length})</h2>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="text-gray-700 text-sm bg-white hover:bg-gray-50 border border-gray-200">
                  Newest
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Newest</DropdownMenuItem>
                <DropdownMenuItem>Oldest</DropdownMenuItem>
                <DropdownMenuItem>A-Z</DropdownMenuItem>
                <DropdownMenuItem>Z-A</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Recipe Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="w-full h-48 bg-gray-200 animate-pulse"></div>
                  <CardContent className="p-4">
                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredReels.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredReels.map((reel) => (
                <Card 
                  key={reel.id} 
                  className="group cursor-pointer hover:shadow-lg transition-all duration-200 overflow-hidden"
                  onClick={() => {
                    const recipeId = reel.id || `recipe-${Date.now()}`;
                    console.log('Recipe clicked:', recipeId, reel);
                    router.push(`/recipes/${recipeId}`);
                  }}
                >
                  <div className="relative">
                    <img
                      src={getReelImage(reel)}
                      alt={getReelTitle(reel)}
                      className="w-full h-48 object-cover"
                    />
                    
                    {/* Rating Badge */}
                    <div className="absolute top-3 left-3 bg-black bg-opacity-75 text-white px-2 py-1 rounded-md text-xs flex items-center gap-1">
                      <Heart className="h-3 w-3 fill-current" />
                      95%
                    </div>
                    
                    {/* Add Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          className="absolute top-3 right-3 bg-white hover:bg-gray-50 text-gray-700 rounded-full w-8 h-8 p-0 flex items-center justify-center shadow-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white">
                        <DropdownMenuItem 
                          className="flex items-center gap-3 py-3"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Navigate to meal planner with recipe parameter
                            router.push(`/meal-planner?recipe=${reel.id}`);
                          }}
                        >
                          <div className="p-2 bg-orange-100 rounded-lg">
                            <Calendar className="h-4 w-4 text-orange-600" />
                          </div>
                          <span>Meal Plan</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="flex items-center gap-3 py-3"
                          onClick={(e) => handleOpenAddToShopping(reel, e)}
                        >
                          <div className="p-2 bg-green-100 rounded-lg">
                            <ShoppingCart className="h-4 w-4 text-green-600" />
                          </div>
                          <span>Shopping List</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="flex items-center gap-3 py-3"
                          onClick={(e) => handleOpenAddToCollection(reel, e)}
                        >
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <ChefHat className="h-4 w-4 text-blue-600" />
                          </div>
                          <span>Collection</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="flex items-center gap-3 py-3 text-red-600"
                          onClick={(e) => handleUnsaveReel(reel, e)}
                        >
                          <div className="p-2 bg-red-100 rounded-lg">
                            <X className="h-4 w-4 text-red-600" />
                          </div>
                          <span>Remove from Saved</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <CardContent className="p-4">
                    <h3 className="font-medium text-gray-900 line-clamp-2 mb-2">
                      {getReelTitle(reel)}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {getReelSource(reel)}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {extractCookingTime(reel.caption_text || '')}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {extractIngredientCount(reel.caption_text || '')} ingredients
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ChefHat className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No recipes found</h3>
              <p className="text-gray-600">
                {searchQuery.trim() 
                  ? 'Try adjusting your search terms' 
                  : 'Start saving recipes to see them here'
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create Collection Modal */}
      <Dialog open={showCreateCollectionModal} onOpenChange={setShowCreateCollectionModal}>
        <DialogContent className="sm:max-w-md bg-white z-50">
          <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <DialogTitle className="text-lg font-semibold">Create collection</DialogTitle>
              <DialogDescription className="text-sm text-gray-600 mt-1">
                Organize your recipes into collections for easy access.
              </DialogDescription>
            </div>
            <Button
              onClick={handleCancelCreateCollection}
              className="h-8 w-8 p-0 bg-transparent hover:bg-gray-100 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Input
                placeholder="Name your collection"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                className="w-full"
                autoFocus
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="private"
                checked={isPrivateCollection}
                onChange={(e) => setIsPrivateCollection(e.target.checked)}
                className="rounded border-gray-300"
              />
              <label
                htmlFor="private"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Keep collection private
              </label>
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleCancelCreateCollection}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveCollection}
                disabled={!newCollectionName.trim()}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
              >
                Create
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Add to Collection Modal */}
      <Dialog open={showAddToCollectionModal} onOpenChange={setShowAddToCollectionModal}>
        <DialogContent className="sm:max-w-md bg-white z-50">
          <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <DialogTitle className="text-lg font-semibold">Add to Collection</DialogTitle>
              <DialogDescription className="text-sm text-gray-600 mt-1">
                Select a collection to add this recipe to.
              </DialogDescription>
            </div>
            <Button
              onClick={() => {
                setShowAddToCollectionModal(false);
                setSelectedReelForCollection(null);
              }}
              className="h-8 w-8 p-0 bg-transparent hover:bg-gray-100 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          
          <div className="space-y-4">
            {collections.length === 0 ? (
              <div className="text-center py-8">
                <ChefHat className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No collections yet</h3>
                <p className="text-gray-600 mb-4">Create your first collection to organize recipes.</p>
                <Button
                  onClick={() => {
                    setShowAddToCollectionModal(false);
                    setSelectedReelForCollection(null);
                    setShowCreateCollectionModal(true);
                  }}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  Create Collection
                </Button>
              </div>
            ) : (
              <>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {collections.map((collection) => (
                    <Button
                      key={collection.id}
                      onClick={() => handleAddToCollection(collection.id)}
                      className="w-full justify-start bg-white hover:bg-gray-50 border border-gray-200 text-gray-900 p-4"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={collection.image}
                          alt={collection.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                        <div className="text-left">
                          <div className="font-medium">{collection.name}</div>
                          <div className="text-xs text-gray-500">
                            {collection.recipeCount} recipe{collection.recipeCount !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
                
                <div className="border-t pt-4">
                  <Button
                    onClick={() => {
                      setShowAddToCollectionModal(false);
                      setSelectedReelForCollection(null);
                      setShowCreateCollectionModal(true);
                    }}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Collection
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add to Shopping List Modal */}
      <Dialog open={showAddToShoppingModal} onOpenChange={setShowAddToShoppingModal}>
        <DialogContent className="sm:max-w-lg bg-white z-50">
          <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <DialogTitle className="text-lg font-semibold">Add to Shopping List</DialogTitle>
              <DialogDescription className="text-sm text-gray-600 mt-1">
                Select ingredients to add to your shopping list.
              </DialogDescription>
            </div>
            <Button
              onClick={() => {
                setShowAddToShoppingModal(false);
                setSelectedReelForShopping(null);
                setParsedIngredients([]);
              }}
              className="h-8 w-8 p-0 bg-transparent hover:bg-gray-100 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Shopping List Selection */}
            <div>
              <label className="text-sm font-medium text-gray-900 mb-2 block">
                Select Shopping List
              </label>
              <div className="flex gap-2">
                <select
                  value={selectedListId}
                  onChange={(e) => setSelectedListId(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {shoppingLists.map(list => (
                    <option key={list.id} value={list.id}>
                      {list.name} ({list.items.length} items)
                    </option>
                  ))}
                </select>
                <Button
                  onClick={() => setShowCreateShoppingListModal(true)}
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-2"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Ingredients List */}
            <div>
              <label className="text-sm font-medium text-gray-900 mb-2 block">
                Ingredients ({parsedIngredients.filter(ing => ing.selected).length} selected)
              </label>
              <div className="max-h-64 overflow-y-auto space-y-2 border border-gray-200 rounded-md p-3">
                {parsedIngredients.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    No ingredients found in this recipe
                  </div>
                ) : (
                  parsedIngredients.map(ingredient => (
                    <div key={ingredient.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-md">
                      <Checkbox
                        checked={ingredient.selected}
                        onCheckedChange={() => toggleIngredientSelection(ingredient.id)}
                      />
                      <span className="text-lg">{ingredient.emoji}</span>
                      <div className="flex-1">
                        <span className="font-medium text-sm">{ingredient.name}</span>
                        <div className="text-xs text-gray-500">
                          {ingredient.amount} {ingredient.unit} • {ingredient.category}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => {
                  setShowAddToShoppingModal(false);
                  setSelectedReelForShopping(null);
                  setParsedIngredients([]);
                }}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddToShoppingList}
                disabled={parsedIngredients.filter(ing => ing.selected).length === 0}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white"
              >
                Add to List
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Shopping List Modal */}
      <Dialog open={showCreateShoppingListModal} onOpenChange={setShowCreateShoppingListModal}>
        <DialogContent className="sm:max-w-md bg-white z-50">
          <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <DialogTitle className="text-lg font-semibold">Create Shopping List</DialogTitle>
              <DialogDescription className="text-sm text-gray-600 mt-1">
                Create a new shopping list to organize your ingredients.
              </DialogDescription>
            </div>
            <Button
              onClick={() => {
                setShowCreateShoppingListModal(false);
                setNewShoppingListName('');
              }}
              className="h-8 w-8 p-0 bg-transparent hover:bg-gray-100 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Input
                placeholder="Name your shopping list"
                value={newShoppingListName}
                onChange={(e) => setNewShoppingListName(e.target.value)}
                className="w-full"
                autoFocus
              />
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => {
                  setShowCreateShoppingListModal(false);
                  setNewShoppingListName('');
                }}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateShoppingList}
                disabled={!newShoppingListName.trim()}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white"
              >
                Create
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function RecipesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading recipes...</p>
        </div>
      </div>
    }>
      <RecipesContent />
    </Suspense>
  );
} 