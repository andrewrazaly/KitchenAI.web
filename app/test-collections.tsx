'use client';

import { useState } from 'react';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Card, CardContent } from './components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './components/ui/dialog';
import { X, Plus } from 'lucide-react';

interface Collection {
  id: string;
  name: string;
  recipeCount: number;
  image: string;
  isPrivate: boolean;
  createdAt: Date;
}

export default function TestCollections() {
  const [collections, setCollections] = useState<Collection[]>([
    { 
      id: '1', 
      name: "Sample Collection", 
      recipeCount: 7, 
      image: "/lemon.svg",
      isPrivate: false,
      createdAt: new Date()
    },
  ]);
  
  const [showCreateCollectionModal, setShowCreateCollectionModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [isPrivateCollection, setIsPrivateCollection] = useState(false);

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

    console.log('🔥 TEST: Creating new collection:', newCollection);
    console.log('🔥 TEST: Current collections before:', collections);
    
    setCollections(prev => {
      const updated = [...prev, newCollection];
      console.log('🔥 TEST: Updated collections array:', updated);
      return updated;
    });
    
    // Reset modal state
    setNewCollectionName('');
    setIsPrivateCollection(false);
    setShowCreateCollectionModal(false);

    console.log('🔥 TEST: Modal closed, should see new collection now');
  };

  const handleCancelCreateCollection = () => {
    setNewCollectionName('');
    setIsPrivateCollection(false);
    setShowCreateCollectionModal(false);
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Collections Test</h1>
        
        <div className="mb-6">
          <Button 
            onClick={handleCreateCollection}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Collection (Test)
          </Button>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Collections ({collections.length})</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {collections.map((collection) => (
              <Card 
                key={collection.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
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
            ))}
          </div>
        </div>

        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-semibold mb-2">Debug Info:</h3>
          <pre className="text-xs text-gray-600">
            Collections count: {collections.length}
            {'\n'}
            Collections: {JSON.stringify(collections.map(c => ({ id: c.id, name: c.name })), null, 2)}
          </pre>
        </div>
      </div>

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