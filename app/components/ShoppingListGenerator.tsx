'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { 
  ShoppingCart, 
  Sparkles, 
  Clock, 
  Check, 
  X, 
  Edit2, 
  Trash2, 
  Plus,
  Loader2,
  ChefHat,
  AlertCircle,
  Save,
  ExternalLink
} from "lucide-react";
import { generateShoppingListFromReels, GeneratedShoppingList, saveShoppingList, getMockInventoryItems } from '../lib/shopping-list-service';
import { ShoppingListItem } from '../lib/ai-ingredient-extractor';
import { useSupabase } from '../hooks/useSupabase';
import { useNotification } from './Notification';

interface ShoppingListGeneratorProps {
  onListGenerated?: (list: GeneratedShoppingList) => void;
}

export default function ShoppingListGenerator({ onListGenerated }: ShoppingListGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedList, setGeneratedList] = useState<GeneratedShoppingList | null>(null);
  const [editingItems, setEditingItems] = useState<Set<string>>(new Set());
  const [days, setDays] = useState(3);
  const [error, setError] = useState<string | null>(null);
  const [showConfidenceDetails, setShowConfidenceDetails] = useState(false);
  
  const supabase = useSupabase();
  const { showNotification } = useNotification();

  const handleGenerateList = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      // Get mock inventory items for demo
      const inventoryItems = getMockInventoryItems();
      
      const list = await generateShoppingListFromReels(days, inventoryItems, supabase);
      setGeneratedList(list);
      
      showNotification(`🛒 Shopping list generated! Found ${list.totalItems} items from ${list.sourceReels.length} recipes`, 'success');
      
      if (onListGenerated) {
        onListGenerated(list);
      }
    } catch (error: any) {
      console.error('Error generating shopping list:', error);
      setError(error.message || 'Failed to generate shopping list');
      showNotification('Failed to generate shopping list. Make sure you have saved some recipe reels recently!', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveList = async () => {
    if (!generatedList) return;
    
    try {
      await saveShoppingList(generatedList, supabase);
      showNotification('✅ Shopping list saved!', 'success');
    } catch (error) {
      showNotification('Failed to save shopping list', 'error');
    }
  };

  const handleToggleItem = (itemId: string) => {
    if (!generatedList) return;
    
    setGeneratedList(prev => {
      if (!prev) return null;
      
      const updatedItems = prev.items.map(item => 
        item.id === itemId ? { ...item, checked: !item.checked } : item
      );
      
      // Re-organize by store sections
      const organizedItems: Record<string, ShoppingListItem[]> = {};
      updatedItems.forEach(item => {
        const section = item.storeSection || 'Other';
        if (!organizedItems[section]) {
          organizedItems[section] = [];
        }
        organizedItems[section].push(item);
      });
      
      return {
        ...prev,
        items: updatedItems,
        organizedItems
      };
    });
  };

  const handleEditItem = (itemId: string, updates: Partial<ShoppingListItem>) => {
    if (!generatedList) return;
    
    setGeneratedList(prev => {
      if (!prev) return null;
      
      const updatedItems = prev.items.map(item => 
        item.id === itemId ? { ...item, ...updates } : item
      );
      
      return {
        ...prev,
        items: updatedItems
      };
    });
    
    setEditingItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(itemId);
      return newSet;
    });
  };

  const handleRemoveItem = (itemId: string) => {
    if (!generatedList) return;
    
    setGeneratedList(prev => {
      if (!prev) return null;
      
      const updatedItems = prev.items.filter(item => item.id !== itemId);
      
      // Re-organize by store sections
      const organizedItems: Record<string, ShoppingListItem[]> = {};
      updatedItems.forEach(item => {
        const section = item.storeSection || 'Other';
        if (!organizedItems[section]) {
          organizedItems[section] = [];
        }
        organizedItems[section].push(item);
      });
      
      return {
        ...prev,
        items: updatedItems,
        organizedItems,
        totalItems: updatedItems.length
      };
    });
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return '#91c11e'; // High confidence - green
    if (confidence >= 0.6) return '#E8DE10'; // Medium confidence - yellow
    return '#ef9d17'; // Low confidence - orange
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.6) return 'Medium';
    return 'Low';
  };

  const checkedCount = generatedList?.items.filter(item => item.checked).length || 0;
  const totalCount = generatedList?.totalItems || 0;

  return (
    <div className="space-y-6">
      {/* Generation Controls */}
      <Card className="border border-gray-100 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2" style={{ color: '#3c3c3c' }}>
            <Sparkles className="h-5 w-5" style={{ color: '#91c11e' }} />
            AI Shopping List Generator
          </CardTitle>
          <p className="text-sm" style={{ color: '#888888' }}>
            Generate a shopping list from your recently saved recipe reels
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2" style={{ color: '#3c3c3c' }}>
                Look back how many days?
              </label>
              <Input
                type="number"
                min="1"
                max="14"
                value={days}
                onChange={(e) => setDays(parseInt(e.target.value) || 3)}
                className="bg-white border-2 border-gray-200 rounded-lg transition-colors"
                style={{ color: '#3c3c3c' }}
              />
            </div>
            <Button
              onClick={handleGenerateList}
              disabled={isGenerating}
              className="text-white font-semibold rounded-lg transition-all hover:opacity-90 px-6"
              style={{ backgroundColor: '#91c11e' }}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Generate List
                </>
              )}
            </Button>
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-lg border-2" style={{ backgroundColor: '#fff8f0', borderColor: '#ef9d17' }}>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" style={{ color: '#ef9d17' }} />
                <span className="text-sm font-medium" style={{ color: '#ef9d17' }}>
                  {error}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generated Shopping List */}
      {generatedList && (
        <Card className="border border-gray-100 bg-white shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2" style={{ color: '#3c3c3c' }}>
                  <ShoppingCart className="h-5 w-5" style={{ color: '#91c11e' }} />
                  Generated Shopping List
                </CardTitle>
                <p className="text-sm mt-1" style={{ color: '#888888' }}>
                  {totalCount} items from {generatedList.sourceReels.length} recipes • {checkedCount} completed
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setShowConfidenceDetails(!showConfidenceDetails)}
                  className="text-sm border border-gray-200 bg-white hover:bg-gray-50 px-3 py-2 rounded-lg"
                >
                  <Badge 
                    className="text-white font-medium px-2 py-1"
                    style={{ backgroundColor: getConfidenceColor(generatedList.confidence) }}
                  >
                    {getConfidenceText(generatedList.confidence)} Confidence
                  </Badge>
                </Button>
                <Button
                  onClick={handleSaveList}
                  className="text-white font-semibold px-3 py-2 rounded-lg"
                  style={{ backgroundColor: '#659a41' }}
                >
                  <Save className="h-4 w-4 mr-1" />
                  Save List
                </Button>
              </div>
            </div>

            {/* Source Recipes */}
            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium" style={{ color: '#3c3c3c' }}>
                Recipes analyzed:
              </p>
              <div className="flex flex-wrap gap-2">
                {generatedList.sourceReels.map((source) => (
                  <Badge 
                    key={source.reelId}
                    className="text-xs px-2 py-1 bg-gray-100"
                    style={{ color: '#659a41' }}
                  >
                    <ChefHat className="h-3 w-3 mr-1" />
                    {source.title} by @{source.creator}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Confidence Details */}
            {showConfidenceDetails && (
              <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: '#f8fff0' }}>
                <p className="text-sm mb-2" style={{ color: '#659a41' }}>
                  <strong>AI Confidence Details:</strong>
                </p>
                <ul className="text-xs space-y-1" style={{ color: '#3c3c3c' }}>
                  <li>• {(generatedList.confidence * 100).toFixed(0)}% overall confidence in ingredient extraction</li>
                  <li>• {generatedList.sourceReels.length} recipe{generatedList.sourceReels.length !== 1 ? 's' : ''} successfully analyzed</li>
                  <li>• Items filtered against your current inventory</li>
                  <li>• Organized by grocery store sections for efficient shopping</li>
                </ul>
              </div>
            )}
          </CardHeader>

          <CardContent>
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium" style={{ color: '#3c3c3c' }}>
                  Shopping Progress
                </span>
                <span className="text-sm" style={{ color: '#888888' }}>
                  {checkedCount} / {totalCount} items
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${totalCount > 0 ? (checkedCount / totalCount) * 100 : 0}%`,
                    backgroundColor: '#91c11e'
                  }}
                />
              </div>
            </div>

            {/* Shopping List by Store Sections */}
            <div className="space-y-6">
              {Object.entries(generatedList.organizedItems).map(([section, items]) => (
                <div key={section}>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2" style={{ color: '#3c3c3c' }}>
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: section === 'Produce' ? '#91c11e' : 
                                                section === 'Meat & Seafood' ? '#ef9d17' :
                                                section === 'Dairy' ? '#659a41' : '#888888' }}
                    />
                    {section} ({items.length})
                  </h3>
                  
                  <div className="grid gap-3">
                    {items.map((item) => (
                      <ShoppingListItemComponent
                        key={item.id}
                        item={item}
                        isEditing={editingItems.has(item.id)}
                        onToggle={() => handleToggleItem(item.id)}
                        onEdit={(updates) => handleEditItem(item.id, updates)}
                        onRemove={() => handleRemoveItem(item.id)}
                        onStartEdit={() => setEditingItems(prev => new Set(prev).add(item.id))}
                        onCancelEdit={() => setEditingItems(prev => {
                          const newSet = new Set(prev);
                          newSet.delete(item.id);
                          return newSet;
                        })}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Individual Shopping List Item Component
interface ShoppingListItemComponentProps {
  item: ShoppingListItem;
  isEditing: boolean;
  onToggle: () => void;
  onEdit: (updates: Partial<ShoppingListItem>) => void;
  onRemove: () => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
}

function ShoppingListItemComponent({
  item,
  isEditing,
  onToggle,
  onEdit,
  onRemove,
  onStartEdit,
  onCancelEdit
}: ShoppingListItemComponentProps) {
  const [editName, setEditName] = useState(item.name);
  const [editQuantity, setEditQuantity] = useState(item.quantity || '');
  const [editUnit, setEditUnit] = useState(item.unit || '');

  const handleSaveEdit = () => {
    onEdit({
      name: editName,
      quantity: editQuantity,
      unit: editUnit
    });
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
        <Input
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          className="flex-1 h-8 text-sm"
          placeholder="Item name"
        />
        <Input
          value={editQuantity}
          onChange={(e) => setEditQuantity(e.target.value)}
          className="w-20 h-8 text-sm"
          placeholder="Qty"
        />
        <Input
          value={editUnit}
          onChange={(e) => setEditUnit(e.target.value)}
          className="w-20 h-8 text-sm"
          placeholder="Unit"
        />
        <Button
          onClick={handleSaveEdit}
          className="h-8 px-2 text-white rounded"
          style={{ backgroundColor: '#91c11e' }}
        >
          <Check className="h-3 w-3" />
        </Button>
        <Button
          onClick={onCancelEdit}
          className="h-8 px-2 border border-gray-300 bg-white hover:bg-gray-50 rounded"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 p-3 border border-gray-200 rounded-lg transition-all hover:shadow-sm ${
      item.checked ? 'bg-gray-50 opacity-75' : 'bg-white'
    }`}>
      <button
        onClick={onToggle}
        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
          item.checked 
            ? 'border-green-500 text-white' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        style={item.checked ? { backgroundColor: '#91c11e' } : {}}
      >
        {item.checked && <Check className="h-3 w-3" />}
      </button>
      
      <div className={`flex-1 ${item.checked ? 'line-through' : ''}`}>
        <div className="flex items-center gap-2">
          <span className="font-medium" style={{ color: '#3c3c3c' }}>
            {item.name}
          </span>
          {item.quantity && (
            <Badge className="text-xs px-2 py-0.5 bg-gray-100" style={{ color: '#659a41' }}>
              {item.quantity} {item.unit}
            </Badge>
          )}
        </div>
        {item.category && (
          <p className="text-xs mt-1" style={{ color: '#888888' }}>
            {item.category}
          </p>
        )}
      </div>
      
      <div className="flex items-center gap-1">
        <Button
          onClick={onStartEdit}
          className="h-8 w-8 p-0 hover:bg-gray-100"
        >
          <Edit2 className="h-3 w-3" />
        </Button>
        <Button
          onClick={onRemove}
          className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
} 