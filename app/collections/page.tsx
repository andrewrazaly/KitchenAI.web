'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import { useSupabase } from '../hooks/useSupabase';
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Search, ArrowLeft, Filter, MoreHorizontal, Plus, ChefHat } from "lucide-react";
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
import { getUserCollections, createCollection } from '../lib/collections-service';
import type { Collection as ServiceCollection } from '../lib/collections-service';

// Collection interface for component
interface Collection {
  id: string;
  name: string;
  recipeCount: number;
  image: string;
  isPrivate: boolean;
  createdAt: Date;
  recipes?: string[];
}

// Transform service collection to component collection
function transformCollection(serviceCollection: ServiceCollection): Collection {
  return {
    id: serviceCollection.id,
    name: serviceCollection.name,
    recipeCount: serviceCollection.recipe_count,
    image: serviceCollection.image_url || '/lemon.svg',
    isPrivate: serviceCollection.is_private,
    createdAt: new Date(serviceCollection.created_at),
    recipes: []
  };
}

export default function CollectionsPage() {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const supabase = useSupabase();
  const [searchQuery, setSearchQuery] = useState('');
  const [collections, setCollections] = useState<Collection[]>([]);
  const [filteredCollections, setFilteredCollections] = useState<Collection[]>([]);
  const [sortBy, setSortBy] = useState('newest');
  const [loading, setLoading] = useState(true);
  
  // Create collection modal state
  const [showCreateCollectionModal, setShowCreateCollectionModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [isPrivateCollection, setIsPrivateCollection] = useState(false);

  // Load collections
  useEffect(() => {
    const loadCollections = async () => {
      if (!isSignedIn) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('📚 Loading user collections...');
        const userCollections = await getUserCollections(supabase);
        console.log('📚 Loaded collections:', userCollections?.length || 0, userCollections);
        const transformedCollections = userCollections?.map(transformCollection) || [];
        setCollections(transformedCollections);
        setFilteredCollections(transformedCollections);
      } catch (error) {
        console.error('Error loading collections:', error);
        setCollections([]);
        setFilteredCollections([]);
      } finally {
        setLoading(false);
      }
    };

    loadCollections();
  }, [isSignedIn, supabase]);

  // Filter collections based on search query
  useEffect(() => {
    let filtered = collections;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(collection =>
        collection.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        filtered = [...filtered].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;
      case 'oldest':
        filtered = [...filtered].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        break;
      case 'a-z':
        filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'z-a':
        filtered = [...filtered].sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'most-recipes':
        filtered = [...filtered].sort((a, b) => b.recipeCount - a.recipeCount);
        break;
      case 'least-recipes':
        filtered = [...filtered].sort((a, b) => a.recipeCount - b.recipeCount);
        break;
      default:
        break;
    }

    setFilteredCollections(filtered);
  }, [searchQuery, collections, sortBy]);

  const handleCollectionClick = (collectionId: string) => {
    console.log('Collection clicked:', collectionId);
    router.push(`/collections/${collectionId}`);
  };

  const handleBackClick = () => {
    router.push('/recipes');
  };

  const handleCreateCollection = () => {
    console.log('🟡 Opening create collection modal');
    setShowCreateCollectionModal(true);
  };

  const handleSaveCollection = async () => {
    if (!newCollectionName.trim()) return;

    try {
      console.log('📚 Creating new collection:', newCollectionName);
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
        console.log('📚 Collection created successfully:', newCollection.name);
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

  if (!isSignedIn) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <h2 className="text-2xl font-semibold mb-4">Sign in to view collections</h2>
          <p className="text-gray-600">Access your recipe collections!</p>
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
            <div className="flex items-center gap-3">
              <Button
                onClick={handleBackClick}
                className="p-2 bg-transparent hover:bg-gray-100 text-gray-600 shadow-none h-8 w-8"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-2xl font-semibold text-gray-900">Collections</h1>
            </div>
            
            <Button 
              className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-4 py-2"
              onClick={handleCreateCollection}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Search and Filter Bar */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search collections"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 py-3 bg-gray-50 border-gray-200 rounded-xl"
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="flex items-center gap-2 text-gray-700 bg-white hover:bg-gray-50 border border-gray-200">
                <Filter className="h-4 w-4" />
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSortBy('newest')}>
                Newest first
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('oldest')}>
                Oldest first
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('a-z')}>
                A-Z
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('z-a')}>
                Z-A
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('most-recipes')}>
                Most recipes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('least-recipes')}>
                Least recipes
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="w-full aspect-square bg-gray-200 rounded-lg animate-pulse"></div>
                    <div className="space-y-1">
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {/* Collections Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {filteredCollections.map((collection) => (
                <Card 
                  key={collection.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={(e) => {
                    e.preventDefault();
                    console.log('Card clicked for collection:', collection.id);
                    handleCollectionClick(collection.id);
                  }}
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Collection Image */}
                      <div className="relative">
                        <img
                          src={collection.image}
                          alt={collection.name}
                          className="w-full aspect-square rounded-lg object-cover"
                        />
                        {collection.isPrivate && (
                          <div className="absolute top-2 right-2 bg-gray-800 bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                            Private
                          </div>
                        )}
                      </div>
                      
                      {/* Collection Info */}
                      <div className="space-y-1">
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
              ))}
            </div>

            {/* Empty State */}
            {filteredCollections.length === 0 && (
              <div className="text-center py-12">
                <ChefHat className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchQuery.trim() ? 'No collections found' : 'No collections yet'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery.trim() 
                    ? 'Try adjusting your search terms' 
                    : 'Create your first collection to organize your recipes'
                  }
                </p>
                {!searchQuery.trim() && (
                  <Button 
                    onClick={handleCreateCollection}
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Collection
                  </Button>
                )}
              </div>
            )}
          </>
        )}
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
    </div>
  );
} 