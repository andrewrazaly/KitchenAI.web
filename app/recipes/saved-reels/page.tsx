'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { ReelsGrid } from '../../../feature_import_instagram/components/instagram/reels-grid';
import { getSavedReels } from '../../../feature_import_instagram/lib/saved-reels-service';
import { useSupabase } from '../../hooks/useSupabase';
import { ReelData } from '../../../feature_import_instagram/types/reels';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Search, Loader2 } from "lucide-react";
import Link from 'next/link';

export default function SavedReelsPage() {
  const { isSignedIn } = useAuth();
  const supabase = useSupabase();
  const [searchTerm, setSearchTerm] = useState("");
  const [reelsData, setReelsData] = useState<ReelData>({ data: { items: [] } });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSavedReels();
  }, [supabase]);

  const loadSavedReels = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const savedReels = await getSavedReels(supabase);
      setReelsData({
        data: {
          items: savedReels.filter(reel => 
            searchTerm === "" || 
            reel.caption_text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            reel.user.username.toLowerCase().includes(searchTerm.toLowerCase())
          )
        }
      });
    } catch (error: any) {
      console.error('Error loading saved reels:', error);
      setError(error.message || 'Failed to load saved reels');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    loadSavedReels();
  };

  if (!isSignedIn) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <h2 className="text-2xl font-semibold mb-4">Sign in to view saved reels</h2>
          <p className="text-gray-600">Save your favorite cooking reels and organize them with your recipes!</p>
          <Link href="/auth/signin" className="inline-block mt-4">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6">Saved Reels</h1>
        
        <div className="flex gap-4 mb-8">
          <div className="flex-1 max-w-md">
            <Input
              type="text"
              placeholder="Search saved reels..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button
            onClick={handleSearch}
            className="flex items-center gap-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            {isLoading ? 'Searching...' : 'Search'}
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">All Saved</TabsTrigger>
              <TabsTrigger value="recipes">With Recipes</TabsTrigger>
              <TabsTrigger value="notes">With Notes</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <ReelsGrid data={reelsData} />
            </TabsContent>

            <TabsContent value="recipes">
              <ReelsGrid 
                data={{
                  data: {
                    items: reelsData.data.items.filter(reel => 'recipeId' in reel)
                  }
                }} 
              />
            </TabsContent>

            <TabsContent value="notes">
              <ReelsGrid 
                data={{
                  data: {
                    items: reelsData.data.items.filter(reel => 'notes' in reel && reel.notes)
                  }
                }} 
              />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
} 