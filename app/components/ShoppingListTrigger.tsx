'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { 
  ShoppingCart, 
  Sparkles, 
  X, 
  Clock,
  ChefHat,
  AlertCircle
} from "lucide-react";
import { getRecentSavedReels } from '../lib/shopping-list-service';
import { useSupabase } from '../hooks/useSupabase';
import { useAuth } from '../hooks/useAuth';
import { trackEvent } from './GoogleAnalytics';

interface ShoppingListTriggerProps {
  onTriggerGeneration?: () => void;
}

export default function ShoppingListTrigger({ onTriggerGeneration }: ShoppingListTriggerProps) {
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [reelCount, setReelCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [daysSinceLastCheck, setDaysSinceLastCheck] = useState(0);
  
  const { isSignedIn } = useAuth();
  const supabase = useSupabase();

  useEffect(() => {
    if (!isSignedIn) {
      setLoading(false);
      return;
    }

    checkForRecentReels();
  }, [isSignedIn, supabase]);

  const checkForRecentReels = async () => {
    try {
      setLoading(true);
      
      // Check for reels saved in the last 3 days
      const recentReels = await getRecentSavedReels(3, supabase);
      
      // Check if user has dismissed suggestion recently
      const lastDismissal = localStorage.getItem('shopping-list-suggestion-dismissed');
      const lastDismissalTime = lastDismissal ? parseInt(lastDismissal) : 0;
      const daysSinceDismissal = (Date.now() - lastDismissalTime) / (1000 * 60 * 60 * 24);
      
      // Check when user last generated a shopping list
      const lastGeneration = localStorage.getItem('last-shopping-list-generation');
      const lastGenerationTime = lastGeneration ? parseInt(lastGeneration) : 0;
      const daysSinceGeneration = (Date.now() - lastGenerationTime) / (1000 * 60 * 60 * 24);
      
      setReelCount(recentReels.length);
      setDaysSinceLastCheck(Math.floor(daysSinceGeneration));
      
      // Show suggestion if:
      // 1. User has saved 2+ reels in last 3 days
      // 2. Haven't dismissed suggestion in last 2 days  
      // 3. Haven't generated list in last 2 days
      const shouldShow = recentReels.length >= 2 && 
                        daysSinceDismissal > 2 && 
                        daysSinceGeneration > 2;
      
      setShowSuggestion(shouldShow);
    } catch (error) {
      console.error('Error checking for recent reels:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateList = () => {
    // Mark that user generated a list
    localStorage.setItem('last-shopping-list-generation', Date.now().toString());
    setShowSuggestion(false);
    
    // Track shopping list generation trigger
    trackEvent('shopping_list_generation_triggered', 'shopping_lists', 'smart_suggestion', reelCount);
    
    if (onTriggerGeneration) {
      onTriggerGeneration();
    }
  };

  const handleDismiss = () => {
    // Mark suggestion as dismissed
    localStorage.setItem('shopping-list-suggestion-dismissed', Date.now().toString());
    setShowSuggestion(false);
    
    // Track suggestion dismissal
    trackEvent('shopping_list_suggestion_dismissed', 'shopping_lists', 'user_declined', reelCount);
  };

  if (!isSignedIn || loading || !showSuggestion) {
    return null;
  }

  return (
    <Card 
      className="border-2 shadow-lg relative overflow-hidden"
      style={{ 
        borderColor: '#91c11e',
        backgroundColor: '#f8fff0'
      }}
    >
      {/* Animated background accent */}
      <div 
        className="absolute top-0 left-0 w-full h-1 animate-pulse"
        style={{ backgroundColor: '#91c11e' }}
      />
      
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="flex items-start gap-3 sm:gap-4 flex-1">
            <div 
              className="p-2 sm:p-3 rounded-full animate-bounce flex-shrink-0"
              style={{ backgroundColor: '#91c11e' }}
            >
              <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
                <h3 className="text-base sm:text-lg font-bold" style={{ color: '#3c3c3c' }}>
                  Generate shopping list from recent recipes?
                </h3>
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" style={{ color: '#91c11e' }} />
              </div>
              
              <p className="text-sm mb-3" style={{ color: '#659a41' }}>
                You've saved <strong>{reelCount} recipe reels</strong> in the past few days. 
                Our AI can extract ingredients and create a smart shopping list for you!
              </p>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mb-4">
                <Badge className="text-xs px-2 py-1 bg-white w-fit" style={{ color: '#659a41' }}>
                  <ChefHat className="h-3 w-3 mr-1" />
                  {reelCount} recipes ready
                </Badge>
                <Badge className="text-xs px-2 py-1 bg-white w-fit" style={{ color: '#ef9d17' }}>
                  <Clock className="h-3 w-3 mr-1" />
                  {daysSinceLastCheck} days since last list
                </Badge>
              </div>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                <Button
                  onClick={handleGenerateList}
                  className="text-white font-semibold rounded-lg transition-all hover:opacity-90 flex items-center justify-center gap-2 h-10 sm:h-auto"
                  style={{ backgroundColor: '#91c11e' }}
                >
                  <Sparkles className="h-4 w-4" />
                  <span className="whitespace-nowrap">Generate Shopping List</span>
                </Button>
                
                <Button
                  onClick={handleDismiss}
                  className="text-gray-600 hover:text-gray-800 px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 h-10 sm:h-auto"
                >
                  Maybe later
                </Button>
              </div>
            </div>
          </div>
          
          <Button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 p-2 hover:bg-white hover:bg-opacity-50 rounded flex-shrink-0 self-start sm:self-auto"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Tips section - responsive */}
        <div className="mt-4 p-3 rounded-lg bg-white bg-opacity-50 border border-green-100">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: '#659a41' }} />
            <div className="min-w-0">
              <p className="text-xs font-medium mb-1" style={{ color: '#659a41' }}>
                ✨ AI Shopping List Features:
              </p>
              <ul className="text-xs space-y-0.5" style={{ color: '#3c3c3c' }}>
                <li>• Extracts ingredients from recipe captions</li>
                <li>• Removes items you already have in inventory</li>
                <li>• Organizes by grocery store sections</li>
                <li>• Editable and shareable lists</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 