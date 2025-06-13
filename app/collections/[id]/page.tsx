'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { useSupabase } from '../../hooks/useSupabase';
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Search, ArrowLeft, Plus, Heart, Clock, Users, Calendar, ShoppingCart, ChefHat, Home, MoreHorizontal, Settings, Edit, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../../components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../components/ui/dialog";
import { getSavedReels, SavedReel } from '../../../feature_import_instagram/lib/saved-reels-service';
import { 
  getCollectionById, 
  getRecipesInCollection, 
  updateCollection, 
  deleteCollection,
  addRecipeToCollection,
  removeRecipeFromCollection
} from '../../lib/collections-service';
import type { Collection } from '../../lib/collections-service';
import { toast } from 'react-hot-toast';

export default function CollectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const supabase = useSupabase();
  const [searchQuery, setSearchQuery] = useState('');
  const [collection, setCollection] = useState<Collection | null>(null);
  const [collectionRecipes, setCollectionRecipes] = useState<SavedReel[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<SavedReel[]>([]);
  const [allSavedReels, setAllSavedReels] = useState<SavedReel[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Collection management states
  const [showManageModal, setShowManageModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  
  const collectionId = params?.id as string;

  // Load collection and its recipes
  useEffect(() => {
    const loadCollectionData = async () => {
      if (!isSignedIn || !collectionId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Load collection details, recipe IDs in collection, and all saved reels in parallel
        const [collectionData, recipeIds, allReels] = await Promise.all([
          getCollectionById(collectionId, supabase),
          getRecipesInCollection(collectionId, supabase),
          getSavedReels(supabase)
        ]);
        
        setCollection(collectionData);
        setAllSavedReels(allReels || []);
        
        if (collectionData) {
          setNewCollectionName(collectionData.name);
          setIsPrivate(collectionData.is_private);
        }
        
        // Filter reels to only show those in this collection
        const recipesInCollection = (allReels || []).filter(reel => 
          recipeIds.includes(reel.id)
        );
        
        setCollectionRecipes(recipesInCollection);
        setFilteredRecipes(recipesInCollection);
      } catch (error) {
        console.error('Error loading collection data:', error);
        setCollection(null);
        setCollectionRecipes([]);
        setFilteredRecipes([]);
        setAllSavedReels([]);
      } finally {
        setLoading(false);
      }
    };

    loadCollectionData();
  }, [isSignedIn, supabase, collectionId]);

  // Filter recipes based on search query
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = collectionRecipes.filter(reel =>
        reel.caption_text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reel.user?.username?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredRecipes(filtered);
    } else {
      setFilteredRecipes(collectionRecipes);
    }
  }, [searchQuery, collectionRecipes]);

  const handleBackClick = () => {
    router.push('/collections');
  };

  const handleReelClick = (reel: SavedReel) => {
    const recipeId = reel.id || `recipe-${Date.now()}`;
    router.push(`/recipes/${recipeId}`);
  };

  const handleUpdateCollection = async () => {
    if (!collection || !newCollectionName.trim()) return;
    
    try {
      const updatedCollection = await updateCollection(
        collection.id,
        {
          name: newCollectionName.trim(),
          is_private: isPrivate
        },
        supabase
      );
      
      if (updatedCollection) {
        setCollection(updatedCollection);
        toast.success('Collection updated successfully');
      }
    } catch (error) {
      console.error('Error updating collection:', error);
      toast.error('Failed to update collection');
    }
    
    setEditingName(false);
    setShowManageModal(false);
  };

  const handleDeleteCollection = async () => {
    if (!collection) return;
    
    try {
      await deleteCollection(collection.id, supabase);
      toast.success('Collection deleted successfully');
      router.push('/collections');
    } catch (error) {
      console.error('Error deleting collection:', error);
      toast.error('Failed to delete collection');
    }
    
    setShowDeleteConfirm(false);
    setShowManageModal(false);
  };

  const handleRemoveFromCollection = async (reel: SavedReel, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!collection) return;
    
    try {
      await removeRecipeFromCollection(collection.id, reel.id, supabase);
      
      // Update local state
      setCollectionRecipes(prev => prev.filter(r => r.id !== reel.id));
      setFilteredRecipes(prev => prev.filter(r => r.id !== reel.id));
      
      // Update collection recipe count
      if (collection) {
        setCollection(prev => prev ? { ...prev, recipe_count: Math.max(0, prev.recipe_count - 1) } : null);
      }
      
      toast.success('Recipe removed from collection');
    } catch (error) {
      console.error('Error removing from collection:', error);
      toast.error('Failed to remove recipe');
    }
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
          <h2 className="text-2xl font-semibold mb-4">Sign in to view collection</h2>
          <p className="text-gray-600">Access your recipe collections!</p>
          <Button className="mt-4">Sign In</Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="border-b border-gray-100 px-4 py-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
              <div>
                <div className="w-32 h-6 bg-gray-200 rounded animate-pulse mb-1"></div>
                <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="w-full h-48 bg-gray-200 animate-pulse"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen bg-white">
        <div className="border-b border-gray-100 px-4 py-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
              <Button
                onClick={handleBackClick}
                className="p-2 bg-transparent hover:bg-gray-100 text-gray-600 shadow-none h-8 w-8"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-2xl font-semibold text-gray-900">Collection Not Found</h1>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-6 text-center">
          <ChefHat className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Collection not found</h3>
          <p className="text-gray-600 mb-4">This collection may have been deleted or you don't have access to it.</p>
          <Button onClick={handleBackClick} className="bg-orange-500 hover:bg-orange-600 text-white">
            Back to Collections
          </Button>
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
            <div className="flex items-center gap-3">
              <Button
                onClick={handleBackClick}
                className="p-2 bg-transparent hover:bg-gray-100 text-gray-600 shadow-none h-8 w-8"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">{collection.name}</h1>
                <p className="text-sm text-gray-600">
                  {collection.recipe_count} recipe{collection.recipe_count !== 1 ? 's' : ''}
                  {collection.is_private && ' • Private'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-4 py-2">
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="p-2 bg-transparent hover:bg-gray-100 text-gray-600 shadow-none h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setShowManageModal(true)}>
                    <Settings className="h-4 w-4 mr-2" />
                    Manage Collection
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setEditingName(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => setShowDeleteConfirm(true)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Collection
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search recipes in this collection"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 py-3 bg-gray-50 border-gray-200 rounded-xl"
          />
        </div>

        {/* Recipes Grid */}
        {filteredRecipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredRecipes.map((reel) => (
              <Card 
                key={reel.id} 
                className="group cursor-pointer hover:shadow-lg transition-all duration-200 overflow-hidden"
                onClick={() => handleReelClick(reel)}
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

                  {/* Remove from Collection Button */}
                  <Button
                    onClick={(e) => handleRemoveFromCollection(reel, e)}
                    className="absolute top-3 right-3 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                
                <CardContent className="p-4">
                  <h3 className="font-medium text-gray-900 line-clamp-2 mb-2">
                    {getReelTitle(reel).substring(0, 60)}
                    {getReelTitle(reel).length > 60 ? '...' : ''}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-3">{getReelSource(reel)}</p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {extractCookingTime(reel.caption_text || '')}
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {extractIngredientCount(reel.caption_text || '')} items
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <ChefHat className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery.trim() ? 'No recipes found' : 'No recipes in this collection'}
            </h3>
            <p className="text-gray-600">
              {searchQuery.trim() 
                ? 'Try adjusting your search terms' 
                : 'Add some recipes to get started'
              }
            </p>
          </div>
        )}
      </div>

      {/* Collection Management Modal */}
      <Dialog open={showManageModal} onOpenChange={setShowManageModal}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>Manage Collection</DialogTitle>
            <DialogDescription>
              Update your collection settings and manage recipes.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Collection Name
              </label>
              <Input
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                placeholder="Enter collection name"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Private Collection
              </label>
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="rounded border-gray-300"
              />
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleUpdateCollection}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                disabled={!newCollectionName.trim()}
              >
                Save Changes
              </Button>
              <Button
                onClick={() => setShowManageModal(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>Delete Collection</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{collection.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleDeleteCollection}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white"
            >
              Delete
            </Button>
            <Button
              onClick={() => setShowDeleteConfirm(false)}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 