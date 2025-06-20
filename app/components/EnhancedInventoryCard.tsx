'use client';

import React, { useState } from 'react';
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Slider } from "./ui/slider";
import { 
  Trash2,
  Edit3,
  Save,
  X,
  Plus,
  Minus,
  ShoppingCart,
  Clock,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Package,
  MapPin
} from "lucide-react";

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  expiryDate: string;
  purchaseDate: string;
  location: string;
  status: 'fresh' | 'expiring' | 'expired';
  image?: string;
}

interface EnhancedInventoryCardProps {
  item: InventoryItem;
  onAddToShoppingList: (item: InventoryItem) => void;
  onEdit: (item: InventoryItem) => void;
  onDelete: (id: string) => void;
  onQuickUpdate: (id: string, updates: Partial<InventoryItem>) => void;
}

export default function EnhancedInventoryCard({
  item,
  onAddToShoppingList,
  onEdit,
  onDelete,
  onQuickUpdate,
}: EnhancedInventoryCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedQuantity, setEditedQuantity] = useState(item.quantity);
  const [isSaving, setIsSaving] = useState(false);

  const statusConfig = {
    fresh: {
      label: 'Fresh',
      textColor: 'text-green-700',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      icon: <CheckCircle className="h-4 w-4 text-green-600" />,
    },
    expiring: {
      label: 'Expiring Soon',
      textColor: 'text-amber-700',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      icon: <Clock className="h-4 w-4 text-amber-600" />,
    },
    expired: {
      label: 'Expired',
      textColor: 'text-red-700',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      icon: <AlertTriangle className="h-4 w-4 text-red-600" />,
    },
  };

  const { label, textColor, bgColor, borderColor, icon } = statusConfig[item.status];

  const getExpiryDays = () => {
    const today = new Date();
    const expiry = new Date(item.expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getQuantityMax = () => {
    const unitMaxes: { [key: string]: number } = {
      'g': 2000,
      'kg': 20,
      'item': 50
    };
    return unitMaxes[item.unit] || 50;
  };

  const handleQuickSave = async () => {
    if (editedQuantity === item.quantity) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    
    onQuickUpdate(item.id, { quantity: editedQuantity });
    setIsSaving(false);
    setIsEditing(false);
  };

  const handleQuantityChange = (delta: number) => {
    const minValue = item.unit === 'g' ? 10 : 1;
    const stepSize = item.unit === 'g' ? 10 : 1;
    const newQuantity = Math.max(minValue, Math.min(getQuantityMax(), editedQuantity + (delta * stepSize)));
    setEditedQuantity(newQuantity);
  };

  const formatExpiryText = () => {
    const days = getExpiryDays();
    if (days < 0) {
      return `Expired ${Math.abs(days)} day${Math.abs(days) !== 1 ? 's' : ''} ago`;
    } else if (days === 0) {
      return 'Expires today';
    } else if (days === 1) {
      return 'Expires tomorrow';
    } else {
      return `Expires in ${days} days`;
    }
  };

  return (
    <Card className="overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 ease-in-out border-l-4 bg-white group" 
          style={{ borderLeftColor: `var(--status-${item.status})` }}>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Product Image */}
          <div className="relative">
            <img
              src={item.image || 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=80&h=80&fit=crop&crop=center'}
              alt={item.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover border mx-auto sm:mx-0"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=80&h=80&fit=crop&crop=center';
              }}
            />
            {item.status === 'expired' && (
              <div className="absolute inset-0 bg-red-500/20 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-lg text-gray-800 truncate pr-2">{item.name}</h3>
              <div className="flex items-center gap-1">
                <Button
                  onClick={() => setIsEditing(true)}
                  className="h-8 w-8 text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Quick Edit"
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => onDelete(item.id)}
                  className="h-8 w-8 text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 shadow-sm"
                  title="Delete Item"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <Package className="h-4 w-4" />
              <span>{item.category}</span>
              <span>•</span>
              <MapPin className="h-4 w-4" />
              <span>{item.location}</span>
            </div>

            {/* Quantity Section */}
            <div className="mb-3">
              {isEditing ? (
                <div className="space-y-3 bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Quantity</span>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => handleQuantityChange(-1)}
                        className="h-6 w-6 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full p-0"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <Input
                        type="number"
                        min={item.unit === 'g' ? "10" : "1"}
                        max={getQuantityMax()}
                        value={editedQuantity}
                        onChange={(e) => {
                          const minValue = item.unit === 'g' ? 10 : 1;
                          setEditedQuantity(Math.min(getQuantityMax(), Math.max(minValue, parseInt(e.target.value) || minValue)));
                        }}
                        className="w-16 text-center h-8 bg-white border-gray-300"
                      />
                      <Button
                        onClick={() => handleQuantityChange(1)}
                        className="h-6 w-6 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full p-0"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <Slider
                    value={[editedQuantity]}
                    onValueChange={(value) => setEditedQuantity(value[0])}
                    min={item.unit === 'g' ? 10 : 1}
                    max={getQuantityMax()}
                    step={item.unit === 'g' ? 10 : 1}
                    showValue={false}
                    showMinMax={true}
                    className="w-full"
                  />
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        setEditedQuantity(item.quantity);
                        setIsEditing(false);
                      }}
                      className="flex-1 h-8 bg-white hover:bg-gray-100 border border-gray-300 text-gray-800 text-sm"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Cancel
                    </Button>
                    <Button
                      onClick={handleQuickSave}
                      disabled={isSaving}
                      className="flex-1 h-8 bg-green-600 hover:bg-green-700 text-white text-sm"
                    >
                      {isSaving ? (
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Saving...
                        </div>
                      ) : (
                        <>
                          <Save className="h-3 w-3 mr-1" />
                          Save
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm font-semibold text-gray-700">
                  Quantity: {item.quantity} {item.unit}
                </p>
              )}
            </div>

            {/* Status Section */}
            <div className={`flex items-center gap-2 text-sm font-medium p-2 rounded-md mb-3 ${bgColor} ${borderColor} border`}>
              {icon}
              <span className={`flex-1 truncate ${textColor}`}>
                {label} ({formatExpiryText()})
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={() => onAddToShoppingList(item)}
                className="flex-1 text-gray-800 font-semibold hover:opacity-90 text-sm h-9"
                style={{ backgroundColor: '#ffdc23' }}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Shopping List
              </Button>
              <Button
                onClick={() => onEdit(item)}
                className="h-9 px-3 bg-blue-600 hover:bg-blue-700 text-white text-sm"
              >
                <Edit3 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 