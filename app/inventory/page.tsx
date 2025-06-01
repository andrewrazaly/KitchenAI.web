'use client';

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useRouter } from 'next/navigation';
import ErrorBoundary, { useErrorHandler } from '../components/ErrorBoundary';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import { 
  Package, 
  Plus, 
  Search, 
  Filter,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Trash2,
  Edit,
  ShoppingCart,
  Scan
} from "lucide-react";
import { useNotification } from '../components/Notification';

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

// Mock inventory data
const mockInventoryItems: InventoryItem[] = [
  {
    id: '1',
    name: 'Organic Milk',
    category: 'Dairy',
    quantity: 1,
    unit: 'gallon',
    expiryDate: '2024-01-15',
    purchaseDate: '2024-01-08',
    location: 'Refrigerator',
    status: 'expiring',
    image: '/api/placeholder/60/60'
  },
  {
    id: '2',
    name: 'Whole Wheat Bread',
    category: 'Bakery',
    quantity: 1,
    unit: 'loaf',
    expiryDate: '2024-01-20',
    purchaseDate: '2024-01-10',
    location: 'Pantry',
    status: 'fresh',
    image: '/api/placeholder/60/60'
  },
  {
    id: '3',
    name: 'Greek Yogurt',
    category: 'Dairy',
    quantity: 4,
    unit: 'cups',
    expiryDate: '2024-01-12',
    purchaseDate: '2024-01-05',
    location: 'Refrigerator',
    status: 'expired',
    image: '/api/placeholder/60/60'
  },
  {
    id: '4',
    name: 'Bananas',
    category: 'Produce',
    quantity: 6,
    unit: 'pieces',
    expiryDate: '2024-01-18',
    purchaseDate: '2024-01-12',
    location: 'Counter',
    status: 'fresh',
    image: '/api/placeholder/60/60'
  },
  {
    id: '5',
    name: 'Chicken Breast',
    category: 'Meat',
    quantity: 2,
    unit: 'lbs',
    expiryDate: '2024-01-16',
    purchaseDate: '2024-01-13',
    location: 'Freezer',
    status: 'expiring',
    image: '/api/placeholder/60/60'
  }
];

function InventoryLoadingSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-48" />
          </div>
          <Skeleton className="h-4 w-96" />
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-8 w-12" />
                  </div>
                  <Skeleton className="h-8 w-8" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search and Filter Skeleton */}
        <div className="mb-6 space-y-4">
          <Skeleton className="h-10 w-full" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-24" />
            ))}
          </div>
        </div>

        {/* Items Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Skeleton className="h-16 w-16 rounded-lg" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function InventoryContent() {
  const { isSignedIn, loading: authLoading } = useAuth();
  const { showNotification } = useNotification();
  const { handleError } = useErrorHandler();
  const router = useRouter();
  
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);

  // Load inventory items
  useEffect(() => {
    const loadInventory = async () => {
      try {
        setIsLoading(true);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Calculate status based on expiry dates
        const itemsWithStatus = mockInventoryItems.map(item => {
          const expiryDate = new Date(item.expiryDate);
          const today = new Date();
          const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          
          let status: 'fresh' | 'expiring' | 'expired';
          if (daysUntilExpiry < 0) {
            status = 'expired';
          } else if (daysUntilExpiry <= 3) {
            status = 'expiring';
          } else {
            status = 'fresh';
          }
          
          return { ...item, status };
        });
        
        setItems(itemsWithStatus);
        setFilteredItems(itemsWithStatus);
        
      } catch (error) {
        console.error('Error loading inventory:', error);
        handleError(new Error('Failed to load inventory'));
      } finally {
        setIsLoading(false);
      }
    };

    if (isSignedIn) {
      loadInventory();
    } else {
      setIsLoading(false);
    }
  }, [isSignedIn, handleError]);

  // Filter items based on search and filters
  useEffect(() => {
    let filtered = items;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Apply status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(item => item.status === selectedStatus);
    }

    setFilteredItems(filtered);
  }, [items, searchQuery, selectedCategory, selectedStatus]);

  const handleDeleteItem = async (itemId: string) => {
    try {
      const updatedItems = items.filter(item => item.id !== itemId);
      setItems(updatedItems);
      showNotification('Item removed from inventory', 'success');
    } catch (error) {
      console.error('Error deleting item:', error);
      handleError(new Error('Failed to delete item'));
    }
  };

  const handleAddToShoppingList = async (item: InventoryItem) => {
    try {
      // In a real app, this would add to shopping list
      showNotification(`${item.name} added to shopping list! 🛒`, 'success');
    } catch (error) {
      console.error('Error adding to shopping list:', error);
      handleError(new Error('Failed to add to shopping list'));
    }
  };

  // Calculate stats
  const stats = {
    total: items.length,
    fresh: items.filter(item => item.status === 'fresh').length,
    expiring: items.filter(item => item.status === 'expiring').length,
    expired: items.filter(item => item.status === 'expired').length
  };

  const categories = ['all', ...Array.from(new Set(items.map(item => item.category)))];

  // Show loading state
  if (authLoading || isLoading) {
    return <InventoryLoadingSkeleton />;
  }

  // Show auth required state
  if (!isSignedIn) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
          <p className="text-gray-600 mb-6">
            Please sign in to manage your food inventory and track expiration dates.
          </p>
          <Button onClick={() => router.push('/auth/signin')}>
            Sign In to Continue
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Package className="h-8 w-8 text-blue-600" />
            Food Inventory
          </h1>
          <p className="text-gray-600">
            Track your food items and never let anything expire again
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Items</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Package className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Fresh</p>
                  <p className="text-2xl font-bold text-green-600">{stats.fresh}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.expiring}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Expired</p>
                  <p className="text-2xl font-bold text-red-600">{stats.expired}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Button 
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Item
          </Button>
          <Button 
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
          >
            <Scan className="h-4 w-4" />
            Scan Barcode
          </Button>
          <Button 
            onClick={() => router.push('/shopping-list')}
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700"
          >
            <ShoppingCart className="h-4 w-4" />
            Shopping List
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search items, categories, or locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            {/* Category Filters */}
            {categories.map((category) => (
              <Button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {category === 'all' ? 'All Categories' : category}
              </Button>
            ))}
            
            {/* Status Filters */}
            <div className="w-full sm:w-auto border-l border-gray-300 pl-2 ml-2">
              {[
                { id: 'all', label: 'All Status', color: 'gray' },
                { id: 'fresh', label: 'Fresh', color: 'green' },
                { id: 'expiring', label: 'Expiring', color: 'yellow' },
                { id: 'expired', label: 'Expired', color: 'red' }
              ].map(({ id, label, color }) => (
                <Button
                  key={id}
                  onClick={() => setSelectedStatus(id)}
                  className={`mr-2 ${
                    selectedStatus === id
                      ? `bg-${color}-600 text-white`
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''}
            {searchQuery && ` for "${searchQuery}"`}
          </p>
        </div>

        {/* Inventory Grid */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Item Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={item.image || '/api/placeholder/60/60'}
                        alt={item.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                        <Badge 
                          className={`ml-2 ${
                            item.status === 'fresh' ? 'bg-green-100 text-green-700' :
                            item.status === 'expiring' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}
                        >
                          {item.status}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-1">{item.category}</p>
                      <p className="text-sm text-gray-600 mb-2">
                        {item.quantity} {item.unit} • {item.location}
                      </p>
                      
                      <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                        <Calendar className="h-3 w-3" />
                        <span>Expires: {new Date(item.expiryDate).toLocaleDateString()}</span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => handleAddToShoppingList(item)}
                          className="flex-1 text-xs py-1 px-2 h-8"
                        >
                          <ShoppingCart className="h-3 w-3 mr-1" />
                          Add to List
                        </Button>
                        <Button
                          onClick={() => handleDeleteItem(item.id)}
                          className="text-xs py-1 px-2 h-8 bg-red-600 hover:bg-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery 
                ? `No items match "${searchQuery}". Try a different search term.`
                : 'Your inventory is empty. Start by adding some items!'
              }
            </p>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Item
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function InventoryPage() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<InventoryLoadingSkeleton />}>
        <InventoryContent />
      </Suspense>
    </ErrorBoundary>
  );
} 