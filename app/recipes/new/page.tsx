'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Camera, Info, Plus, X } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { useAuth } from '../../hooks/useAuth';
import { useSupabase } from '../../hooks/useSupabase';

// Collection interface
interface Collection {
  id: string;
  name: string;
  recipeCount: number;
  image: string;
  isPrivate: boolean;
  createdAt: Date;
}

export default function NewRecipePage() {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const supabase = useSupabase();
  const [recipe, setRecipe] = useState({
    title: '',
    description: '',
    ingredients: [''],
    instructions: [''],
    servings: '',
    prepTimeHours: '0',
    prepTimeMinutes: '0',
    cookTimeHours: '0',
    cookTimeMinutes: '0',
    collection: '',
    sourceUrl: '',
    sourceName: '',
    photos: [] as File[]
  });

  // Modal states
  const [showAddSourceModal, setShowAddSourceModal] = useState(false);
  const [showCreateCollectionModal, setShowCreateCollectionModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [isPrivateCollection, setIsPrivateCollection] = useState(false);
  
  // Collections state
  const [collections, setCollections] = useState<Collection[]>([]);

  // Load user collections
  useEffect(() => {
    const loadCollections = async () => {
      if (!isSignedIn) return;

      try {
        // TODO: Load actual collections from database
        // For now, using mock data
        const mockCollections: Collection[] = [
          { id: 'favorites', name: 'Favorites', recipeCount: 0, image: '/lemon.svg', isPrivate: false, createdAt: new Date() },
          { id: 'quick-meals', name: 'Quick Meals', recipeCount: 0, image: '/lemon.svg', isPrivate: false, createdAt: new Date() },
          { id: 'desserts', name: 'Desserts', recipeCount: 0, image: '/lemon.svg', isPrivate: false, createdAt: new Date() },
          { id: 'healthy', name: 'Healthy', recipeCount: 0, image: '/lemon.svg', isPrivate: false, createdAt: new Date() }
        ];
        setCollections(mockCollections);
      } catch (error) {
        console.error('Error loading collections:', error);
      }
    };

    loadCollections();
  }, [isSignedIn, supabase]);

  const handleSave = () => {
    console.log('Saving recipe:', recipe);
    // TODO: Implement save functionality
    router.back();
  };

  const addIngredient = () => {
    setRecipe(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, '']
    }));
  };

  const updateIngredient = (index: number, value: string) => {
    setRecipe(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ingredient, i) => 
        i === index ? value : ingredient
      )
    }));
  };

  const addInstruction = () => {
    setRecipe(prev => ({
      ...prev,
      instructions: [...prev.instructions, '']
    }));
  };

  const updateInstruction = (index: number, value: string) => {
    setRecipe(prev => ({
      ...prev,
      instructions: prev.instructions.map((instruction, i) => 
        i === index ? value : instruction
      )
    }));
  };

  const handleAddSource = () => {
    setShowAddSourceModal(true);
  };

  const handleSaveSource = () => {
    setShowAddSourceModal(false);
  };

  const handleCancelSource = () => {
    setRecipe(prev => ({ ...prev, sourceUrl: '', sourceName: '' }));
    setShowAddSourceModal(false);
  };

  const handleCreateCollection = () => {
    setShowCreateCollectionModal(true);
  };

  const handleSaveCollection = () => {
    if (!newCollectionName.trim()) return;

    const newCollection: Collection = {
      id: Date.now().toString(),
      name: newCollectionName.trim(),
      recipeCount: 0,
      image: "/lemon.svg",
      isPrivate: isPrivateCollection,
      createdAt: new Date()
    };

    setCollections(prev => [...prev, newCollection]);
    setRecipe(prev => ({ ...prev, collection: newCollection.id }));
    
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

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newPhotos = Array.from(files);
      setRecipe(prev => ({
        ...prev,
        photos: [...prev.photos, ...newPhotos]
      }));
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-100 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Button
            onClick={() => router.back()}
            className="p-2 bg-transparent hover:bg-gray-100 text-gray-600 shadow-none h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold">New recipe</h1>
          <Button
            onClick={handleSave}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg"
          >
            Save
          </Button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-6 space-y-8">
        {/* Title Section */}
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Title</h2>
          </div>
          <Input
            placeholder="Give your recipe a name"
            value={recipe.title}
            onChange={(e) => setRecipe(prev => ({ ...prev, title: e.target.value }))}
            className="text-base"
          />
          
          <div className="flex gap-3">
            <Button 
              onClick={handleAddSource}
              className="text-sm bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Add source
            </Button>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white text-sm">
              Add video
            </Button>
          </div>
        </div>

        {/* Add Photos Section */}
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center bg-gray-50 relative">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handlePhotoUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center justify-center">
              <svg viewBox="0 0 28 28" width="28" height="28" className="mb-3 text-orange-500">
                <path fillRule="evenodd" d="M14.29 9.284a4.376 4.376 0 1 0 0 8.751 4.376 4.376 0 0 0 0-8.75m-2.626 4.375a2.626 2.626 0 1 1 5.251.001 2.626 2.626 0 0 1-5.25 0" clipRule="evenodd" fill="currentColor"></path>
                <path d="M19.216 9.096a1.312 1.312 0 1 0 2.625 0 1.312 1.312 0 0 0-2.625 0" fill="currentColor"></path>
                <path fillRule="evenodd" d="M7.292 4.667A3.79 3.79 0 0 0 3.5 8.458V18.86a3.79 3.79 0 0 0 3.792 3.792h14.287a3.79 3.79 0 0 0 3.791-3.792V8.458a3.79 3.79 0 0 0-3.791-3.791zM5.25 8.458c0-1.128.915-2.041 2.042-2.041h14.287c1.128 0 2.041.913 2.041 2.041V18.86a2.04 2.04 0 0 1-2.041 2.042H7.292A2.04 2.04 0 0 1 5.25 18.86z" clipRule="evenodd" fill="currentColor"></path>
              </svg>
              <p className="text-base font-medium text-gray-700">Add photos</p>
            </div>
          </div>
          {recipe.photos.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {recipe.photos.map((photo, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(photo)}
                    alt={`Photo ${index + 1}`}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => setRecipe(prev => ({
                      ...prev,
                      photos: prev.photos.filter((_, i) => i !== index)
                    }))}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Description Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Description</h2>
          <Textarea
            placeholder="Introduce your recipe, add notes, cooking tips, serving suggestions, etc..."
            value={recipe.description}
            onChange={(e) => setRecipe(prev => ({ ...prev, description: e.target.value }))}
            className="min-h-24 text-base"
          />
        </div>

        {/* Ingredients Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Ingredients</h2>
          <div className="space-y-3">
            {recipe.ingredients.map((ingredient, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  placeholder="Add one or paste multiple ingredients"
                  value={ingredient}
                  onChange={(e) => updateIngredient(index, e.target.value)}
                  className="flex-1 text-base"
                />
                <Button className="text-gray-400 bg-transparent hover:bg-gray-100 shadow-none h-8 w-8 p-0">
                  <Info className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <Button
            onClick={addIngredient}
            className="text-orange-500 hover:text-orange-600 text-sm font-medium p-0 h-auto bg-transparent shadow-none hover:bg-transparent"
          >
            <Plus className="h-4 w-4 mr-1" />
            Header
          </Button>
        </div>

        {/* Instructions Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Instructions</h2>
          <div className="space-y-3">
            {recipe.instructions.map((instruction, index) => (
              <div key={index} className="flex items-start gap-2">
                <Textarea
                  placeholder="Paste one or multiple steps (e.g. Finely chop the garlic)"
                  value={instruction}
                  onChange={(e) => updateInstruction(index, e.target.value)}
                  className="flex-1 min-h-20 text-base"
                />
                <Button className="text-gray-400 bg-transparent hover:bg-gray-100 shadow-none h-8 w-8 p-0 mt-2">
                  <Info className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <Button
            onClick={addInstruction}
            className="text-orange-500 hover:text-orange-600 text-sm font-medium p-0 h-auto bg-transparent shadow-none hover:bg-transparent"
          >
            <Plus className="h-4 w-4 mr-1" />
            Header
          </Button>
        </div>

        {/* Servings Section */}
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Servings</h2>
            <p className="text-sm text-gray-600">How many portions does this recipe make?</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">#</span>
            <Input
              type="number"
              value={recipe.servings}
              onChange={(e) => setRecipe(prev => ({ ...prev, servings: e.target.value }))}
              className="w-20 text-base"
            />
          </div>
        </div>

        {/* Prep Time Section */}
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Prep time</h2>
            <p className="text-sm text-gray-600">How long does it take to prepare this recipe?</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Hours</span>
              <Input
                type="number"
                value={recipe.prepTimeHours}
                onChange={(e) => setRecipe(prev => ({ ...prev, prepTimeHours: e.target.value }))}
                className="w-16 text-base"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Minutes</span>
              <Input
                type="number"
                value={recipe.prepTimeMinutes}
                onChange={(e) => setRecipe(prev => ({ ...prev, prepTimeMinutes: e.target.value }))}
                className="w-16 text-base"
              />
            </div>
          </div>
        </div>

        {/* Cook Time Section */}
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Cook time</h2>
            <p className="text-sm text-gray-600">How long does it take to cook this recipe?</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Hours</span>
              <Input
                type="number"
                value={recipe.cookTimeHours}
                onChange={(e) => setRecipe(prev => ({ ...prev, cookTimeHours: e.target.value }))}
                className="w-16 text-base"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Minutes</span>
              <Input
                type="number"
                value={recipe.cookTimeMinutes}
                onChange={(e) => setRecipe(prev => ({ ...prev, cookTimeMinutes: e.target.value }))}
                className="w-16 text-base"
              />
            </div>
          </div>
        </div>

        {/* Collection Section */}
        <div className="space-y-4 pb-8">
          <h2 className="text-lg font-semibold">Collection</h2>
          <div className="space-y-3">
            <Select value={recipe.collection} onValueChange={(value) => setRecipe(prev => ({ ...prev, collection: value }))}>
              <SelectTrigger className="w-full text-base">
                <SelectValue placeholder="Select collection" />
              </SelectTrigger>
              <SelectContent>
                {collections.map((collection) => (
                  <SelectItem key={collection.id} value={collection.id}>
                    {collection.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={handleCreateCollection}
              className="text-orange-500 hover:text-orange-600 text-sm font-medium p-0 h-auto bg-transparent shadow-none hover:bg-transparent w-full text-left"
            >
              <Plus className="h-4 w-4 mr-1" />
              New collection
            </Button>
          </div>
        </div>
      </div>

      {/* Add Source Modal */}
      <Dialog open={showAddSourceModal} onOpenChange={setShowAddSourceModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <DialogTitle className="text-lg font-semibold">Add source</DialogTitle>
            <Button
              onClick={handleCancelSource}
              className="h-8 w-8 p-0 bg-transparent hover:bg-gray-100 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Which site did you find this recipe?</p>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Name</label>
              <Input
                placeholder="Source name"
                value={recipe.sourceName}
                onChange={(e) => setRecipe(prev => ({ ...prev, sourceName: e.target.value }))}
                className="w-full mt-1"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">URL</label>
              <Input
                placeholder="https://example.com"
                value={recipe.sourceUrl}
                onChange={(e) => setRecipe(prev => ({ ...prev, sourceUrl: e.target.value }))}
                className="w-full mt-1"
              />
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleCancelSource}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveSource}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
              >
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Collection Modal */}
      <Dialog open={showCreateCollectionModal} onOpenChange={setShowCreateCollectionModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <DialogTitle className="text-lg font-semibold">Create collection</DialogTitle>
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
    </div>
  );
} 