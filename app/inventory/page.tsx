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
  Scan,
  X,
  ChevronDown
} from "lucide-react";
import { useNotification } from '../components/Notification';
import { trackEvent } from '../components/GoogleAnalytics';

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

// Mock inventory data with working placeholder images
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
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=60&h=60&fit=crop&crop=center'
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
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=60&h=60&fit=crop&crop=center'
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
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=60&h=60&fit=crop&crop=center'
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
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=60&h=60&fit=crop&crop=center'
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
    image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=60&h=60&fit=crop&crop=center'
  }
];

// Custom Date Picker Component
function DatePicker({ 
  value, 
  onChange, 
  placeholder = "Select date",
  label
}: {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
  label?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  // Initialize from value
  useEffect(() => {
    if (value) {
      const date = new Date(value);
      setSelectedDay(date.getDate().toString().padStart(2, '0'));
      setSelectedMonth((date.getMonth() + 1).toString().padStart(2, '0'));
      setSelectedYear(date.getFullYear().toString());
    }
  }, [value]);

  const months = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => (currentYear + i).toString());
  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0'));

  const handleDateChange = (day: string, month: string, year: string) => {
    if (day && month && year) {
      const dateStr = `${year}-${month}-${day}`;
      onChange(dateStr);
    }
  };

  const formatDisplayDate = () => {
    if (!value) return placeholder;
    const date = new Date(value);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const clearDate = () => {
    setSelectedDay('');
    setSelectedMonth('');
    setSelectedYear('');
    onChange('');
    setIsOpen(false);
  };

  const handleQuickSelect = (daysFromNow: number) => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    const dateStr = date.toISOString().split('T')[0];
    onChange(dateStr);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <div 
        className="w-full p-3 border-2 border-gray-200 rounded-lg bg-white cursor-pointer transition-colors hover:border-gray-300 flex items-center justify-between"
        style={{ color: '#3c3c3c' }}
        onClick={() => setIsOpen(!isOpen)}
        onFocus={() => setIsOpen(true)}
      >
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" style={{ color: '#888888' }} />
          <span className={value ? 'text-gray-900' : 'text-gray-400'}>
            {formatDisplayDate()}
          </span>
        </div>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} style={{ color: '#888888' }} />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4">
          {/* Quick Select Options */}
          <div className="mb-4">
            <p className="text-sm font-medium mb-2" style={{ color: '#3c3c3c' }}>Quick Select:</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickSelect(0)}
                className="px-3 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                style={{ color: '#3c3c3c' }}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => handleQuickSelect(7)}
                className="px-3 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                style={{ color: '#3c3c3c' }}
              >
                +1 Week
              </button>
              <button
                type="button"
                onClick={() => handleQuickSelect(3)}
                className="px-3 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                style={{ color: '#3c3c3c' }}
              >
                +3 Days
              </button>
              <button
                type="button"
                onClick={() => handleQuickSelect(30)}
                className="px-3 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                style={{ color: '#3c3c3c' }}
              >
                +1 Month
              </button>
            </div>
          </div>

          {/* Date Dropdowns */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: '#888888' }}>Month</label>
              <select
                value={selectedMonth}
                onChange={(e) => {
                  setSelectedMonth(e.target.value);
                  handleDateChange(selectedDay, e.target.value, selectedYear);
                }}
                className="w-full p-2 border border-gray-200 rounded-lg text-sm bg-white"
                style={{ color: '#3c3c3c' }}
              >
                <option value="">Month</option>
                {months.map(month => (
                  <option key={month.value} value={month.value}>{month.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: '#888888' }}>Day</label>
              <select
                value={selectedDay}
                onChange={(e) => {
                  setSelectedDay(e.target.value);
                  handleDateChange(e.target.value, selectedMonth, selectedYear);
                }}
                className="w-full p-2 border border-gray-200 rounded-lg text-sm bg-white"
                style={{ color: '#3c3c3c' }}
              >
                <option value="">Day</option>
                {days.map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: '#888888' }}>Year</label>
              <select
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(e.target.value);
                  handleDateChange(selectedDay, selectedMonth, e.target.value);
                }}
                className="w-full p-2 border border-gray-200 rounded-lg text-sm bg-white"
                style={{ color: '#3c3c3c' }}
              >
                <option value="">Year</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={clearDate}
              className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              style={{ color: '#888888' }}
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex-1 px-3 py-2 text-sm text-white rounded-lg transition-colors"
              style={{ backgroundColor: '#91c11e' }}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

// Add Item Modal Component
function AddItemModal({ isOpen, onClose, onAdd }: { 
  isOpen: boolean; 
  onClose: () => void; 
  onAdd: (item: Omit<InventoryItem, 'id' | 'status'>) => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Other',
    quantity: 1,
    unit: 'item',
    expiryDate: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    location: 'Pantry',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=60&h=60&fit=crop&crop=center'
  });

  const categories = ['Dairy', 'Bakery', 'Produce', 'Meat', 'Pantry', 'Frozen', 'Other'];
  const locations = ['Refrigerator', 'Freezer', 'Pantry', 'Counter', 'Cabinet'];
  const units = ['item', 'lbs', 'oz', 'gallon', 'cups', 'pieces', 'bottles', 'cans'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    
    onAdd(formData);
    setFormData({
      name: '',
      category: 'Other',
      quantity: 1,
      unit: 'item',
      expiryDate: '',
      purchaseDate: new Date().toISOString().split('T')[0],
      location: 'Pantry',
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=60&h=60&fit=crop&crop=center'
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-gray-100">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-2xl font-bold" style={{ color: '#3c3c3c' }}>Add New Item</h2>
              <p className="text-sm mt-1" style={{ color: '#888888' }}>Fill in the item details below</p>
            </div>
            <Button 
              onClick={onClose} 
              className="h-9 w-9 p-0 rounded-full hover:bg-gray-50 border border-gray-200"
              style={{ color: '#888888' }}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Item Name */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#3c3c3c' }}>
                Item Name <span style={{ color: '#91c11e' }}>*</span>
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Organic Milk"
                className="bg-white border-2 border-gray-200 focus:border-2 text-gray-900 placeholder:text-gray-400 rounded-lg transition-colors"
                style={{ 
                  color: '#3c3c3c',
                  '--tw-ring-color': '#91c11e'
                } as React.CSSProperties}
                onFocus={(e) => e.target.style.borderColor = '#91c11e'}
                onBlur={(e) => e.target.style.borderColor = '#cccccc'}
                required
              />
            </div>

            {/* Category and Location */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#3c3c3c' }}>Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full rounded-lg border-2 border-gray-200 bg-white text-gray-900 focus:border-2 transition-colors p-3"
                  style={{ color: '#3c3c3c' }}
                  onFocus={(e) => e.target.style.borderColor = '#91c11e'}
                  onBlur={(e) => e.target.style.borderColor = '#cccccc'}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#3c3c3c' }}>Location</label>
                <select
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full rounded-lg border-2 border-gray-200 bg-white text-gray-900 focus:border-2 transition-colors p-3"
                  style={{ color: '#3c3c3c' }}
                  onFocus={(e) => e.target.style.borderColor = '#91c11e'}
                  onBlur={(e) => e.target.style.borderColor = '#cccccc'}
                >
                  {locations.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quantity and Unit */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#3c3c3c' }}>Quantity</label>
                <Input
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                  className="bg-white border-2 border-gray-200 focus:border-2 text-gray-900 rounded-lg transition-colors"
                  style={{ 
                    color: '#3c3c3c',
                    '--tw-ring-color': '#91c11e'
                  } as React.CSSProperties}
                  onFocus={(e) => e.target.style.borderColor = '#91c11e'}
                  onBlur={(e) => e.target.style.borderColor = '#cccccc'}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#3c3c3c' }}>Unit</label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                  className="w-full rounded-lg border-2 border-gray-200 bg-white text-gray-900 focus:border-2 transition-colors p-3"
                  style={{ color: '#3c3c3c' }}
                  onFocus={(e) => e.target.style.borderColor = '#91c11e'}
                  onBlur={(e) => e.target.style.borderColor = '#cccccc'}
                >
                  {units.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Dates with Custom Date Pickers */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#3c3c3c' }}>Purchase Date</label>
                <DatePicker
                  value={formData.purchaseDate}
                  onChange={(date) => setFormData(prev => ({ ...prev, purchaseDate: date }))}
                  placeholder="Select purchase date"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#3c3c3c' }}>Expiry Date</label>
                <DatePicker
                  value={formData.expiryDate}
                  onChange={(date) => setFormData(prev => ({ ...prev, expiryDate: date }))}
                  placeholder="Select expiry date"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2 border-t border-gray-100">
              <Button 
                type="button" 
                onClick={onClose} 
                className="flex-1 bg-white hover:bg-gray-50 border-2 text-gray-700 rounded-lg transition-colors font-semibold"
                style={{ borderColor: '#91c11e', color: '#91c11e' }}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1 text-white rounded-lg transition-colors font-semibold hover:opacity-90"
                style={{ backgroundColor: '#91c11e' }}
              >
                Add Item
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

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
        
        // Use the actual API instead of mock data
        const response = await fetch('/api/inventory');
        
        if (!response.ok) {
          throw new Error('Failed to fetch inventory');
        }
        
        const apiItems = await response.json();
        
        // If API returns empty array (new user), use mock data as fallback
        let itemsWithStatus = apiItems;
        
        if (apiItems.length === 0) {
          // Calculate status based on expiry dates for mock data
          itemsWithStatus = mockInventoryItems.map(item => {
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
        } else {
          // Calculate status for API items
          itemsWithStatus = apiItems.map((item: any) => {
            const expiryDate = new Date(item.expiry_date || item.expiryDate);
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
            
            return { 
              ...item, 
              status,
              // Normalize field names
              name: item.name,
              category: item.category,
              quantity: item.quantity,
              unit: item.unit,
              expiryDate: item.expiry_date || item.expiryDate,
              purchaseDate: item.purchase_date || item.purchaseDate,
              location: item.location,
              image: item.image
            };
          });
        }
        
        setItems(itemsWithStatus);
        setFilteredItems(itemsWithStatus);
        
      } catch (error) {
        console.error('Error loading inventory:', error);
        // Fallback to mock data if API fails
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
        handleError(new Error('Failed to load inventory from API, using fallback data'));
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
      // Call the API to delete the item
      const response = await fetch(`/api/inventory?id=${itemId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete item from API');
      }
      
      // Update local state after successful API call
      const deletedItem = items.find(item => item.id === itemId);
      const updatedItems = items.filter(item => item.id !== itemId);
      setItems(updatedItems);
      showNotification('Item removed from inventory', 'success');
      
      // Track inventory item deletion
      if (deletedItem) {
        trackEvent('inventory_item_deleted', 'inventory', deletedItem.category);
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      handleError(new Error('Failed to delete item'));
      trackEvent('inventory_delete_error', 'inventory');
    }
  };

  const handleAddToShoppingList = async (item: InventoryItem) => {
    try {
      // In a real app, this would add to shopping list
      showNotification(`${item.name} added to shopping list! 🛒`, 'success');
      
      // Track adding item to shopping list
      trackEvent('inventory_to_shopping_list', 'inventory', item.category);
    } catch (error) {
      console.error('Error adding to shopping list:', error);
      handleError(new Error('Failed to add to shopping list'));
    }
  };

  const handleScanBarcode = () => {
    // Simulate barcode scanning functionality
    showNotification('📱 Barcode scanner opening... (Feature coming soon!)', 'info');
    
    // Track barcode scan attempt
    trackEvent('barcode_scan_initiated', 'inventory', 'feature_demo');
    
    // In a real app, this would open camera/barcode scanner
    // For now, we'll simulate adding a scanned item
    setTimeout(() => {
      const scannedItem: InventoryItem = {
        id: Date.now().toString(),
        name: 'Scanned Product',
        category: 'Scanned',
        quantity: 1,
        unit: 'item',
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
        purchaseDate: new Date().toISOString().split('T')[0],
        location: 'Pantry',
        status: 'fresh' as const,
        image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=60&h=60&fit=crop&crop=center'
      };
      setItems(prev => [scannedItem, ...prev]);
      showNotification('✅ Product scanned and added to inventory!', 'success');
      
      // Track successful barcode scan
      trackEvent('barcode_scan_success', 'inventory', 'demo_item');
    }, 2000);
  };

  const handleAddItem = () => {
    console.log('Add Item button clicked!');
    console.log('Current showAddForm state:', showAddForm);
    setShowAddForm(true);
    console.log('Setting showAddForm to true');
    showNotification('🔧 Opening add item modal...', 'info');
    
    // Track add item modal open
    trackEvent('add_item_modal_opened', 'inventory');
  };

  const handleAddItemSubmit = async (itemData: Omit<InventoryItem, 'id' | 'status'>) => {
    try {
      // Calculate status based on expiry date
      const expiryDate = new Date(itemData.expiryDate);
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

      // Prepare data for API (convert to snake_case for backend)
      const apiData = {
        name: itemData.name,
        category: itemData.category,
        quantity: itemData.quantity,
        unit: itemData.unit,
        expiry_date: itemData.expiryDate,
        purchase_date: itemData.purchaseDate,
        location: itemData.location,
        image: itemData.image
      };

      // Call the API to add the item
      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        throw new Error('Failed to add item to API');
      }

      const newItem = await response.json();

      // Add to local state with normalized field names
      const normalizedItem: InventoryItem = {
        id: newItem.id,
        name: newItem.name,
        category: newItem.category,
        quantity: newItem.quantity,
        unit: newItem.unit,
        expiryDate: newItem.expiry_date || newItem.expiryDate,
        purchaseDate: newItem.purchase_date || newItem.purchaseDate,
        location: newItem.location,
        status,
        image: newItem.image
      };

      setItems(prev => [normalizedItem, ...prev]);
      showNotification(`✅ ${itemData.name} added to inventory!`, 'success');
      
      // Track inventory item addition
      trackEvent('inventory_item_added', 'inventory', itemData.category, itemData.quantity);
    } catch (error) {
      console.error('Error adding item:', error);
      handleError(new Error('Failed to add item to inventory'));
      trackEvent('inventory_add_error', 'inventory');
    }
  };

  const handleEditItem = (item: InventoryItem) => {
    showNotification(`✏️ Editing ${item.name}... (Feature coming soon!)`, 'info');
    
    // Track edit item attempt
    trackEvent('inventory_item_edit_initiated', 'inventory', item.category);
    // In a real app, this would open an edit modal
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedStatus('all');
    showNotification('🔄 All filters cleared', 'info');
    
    // Track filter clearing
    trackEvent('inventory_filters_cleared', 'inventory');
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
          <Button onClick={() => router.push('/auth/signin')} className="text-white font-semibold rounded-lg transition-all hover:opacity-90" style={{ backgroundColor: '#91c11e' }}>
            Sign In to Continue
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Add Item Modal */}
        <AddItemModal 
          isOpen={showAddForm} 
          onClose={() => setShowAddForm(false)}
          onAdd={handleAddItemSubmit}
        />

        {/* Mobile-Optimized Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 flex items-center gap-2" style={{ color: '#3c3c3c' }}>
            <Package className="h-6 w-6 sm:h-8 sm:w-8" style={{ color: '#91c11e' }} />
            Food Inventory
          </h1>
          <p className="text-sm sm:text-base text-gray-600" style={{ color: '#888888' }}>
            Track your food items and never let anything expire again
          </p>
        </div>

        {/* Mobile-First Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <Card className="border border-gray-100 hover:shadow-md transition-shadow">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="mb-2 sm:mb-0">
                  <p className="text-xs sm:text-sm font-medium" style={{ color: '#888888' }}>Total Items</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold" style={{ color: '#3c3c3c' }}>{stats.total}</p>
                </div>
                <Package className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 self-end sm:self-auto" style={{ color: '#91c11e' }} />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border border-gray-100 hover:shadow-md transition-shadow">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="mb-2 sm:mb-0">
                  <p className="text-xs sm:text-sm font-medium" style={{ color: '#888888' }}>Fresh</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold" style={{ color: '#659a41' }}>{stats.fresh}</p>
                </div>
                <CheckCircle className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 self-end sm:self-auto" style={{ color: '#659a41' }} />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-100 hover:shadow-md transition-shadow">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="mb-2 sm:mb-0">
                  <p className="text-xs sm:text-sm font-medium" style={{ color: '#888888' }}>Expiring Soon</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold" style={{ color: '#E8DE10' }}>{stats.expiring}</p>
                </div>
                <Clock className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 self-end sm:self-auto" style={{ color: '#E8DE10' }} />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-100 hover:shadow-md transition-shadow">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="mb-2 sm:mb-0">
                  <p className="text-xs sm:text-sm font-medium" style={{ color: '#888888' }}>Expired</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold" style={{ color: '#ef9d17' }}>{stats.expired}</p>
                </div>
                <AlertTriangle className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 self-end sm:self-auto" style={{ color: '#ef9d17' }} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mobile-Optimized Actions Bar */}
        <div className="grid grid-cols-2 sm:flex sm:flex-row gap-2 sm:gap-4 mb-6">
          <Button 
            onClick={handleAddItem}
            className="flex items-center justify-center gap-2 text-white font-semibold rounded-lg transition-all hover:opacity-90 h-10 sm:h-auto"
            style={{ backgroundColor: '#91c11e' }}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Item</span>
            <span className="sm:hidden">Add</span>
          </Button>
          <Button 
            onClick={handleScanBarcode}
            className="flex items-center justify-center gap-2 text-white font-semibold rounded-lg transition-all hover:opacity-90 h-10 sm:h-auto"
            style={{ backgroundColor: '#659a41' }}
          >
            <Scan className="h-4 w-4" />
            <span className="hidden sm:inline">Scan Barcode</span>
            <span className="sm:hidden">Scan</span>
          </Button>
          <Button 
            onClick={() => router.push('/shopping-list')}
            className="flex items-center justify-center gap-2 text-white font-semibold rounded-lg transition-all hover:opacity-90 h-10 sm:h-auto"
            style={{ backgroundColor: '#ef9d17' }}
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden sm:inline">Shopping List</span>
            <span className="sm:hidden">Shop</span>
          </Button>
          <Button 
            onClick={clearAllFilters}
            className="flex items-center justify-center gap-2 bg-white border-2 font-semibold rounded-lg transition-all hover:bg-gray-50 h-10 sm:h-auto"
            style={{ borderColor: '#91c11e', color: '#91c11e' }}
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Clear Filters</span>
            <span className="sm:hidden">Clear</span>
          </Button>
        </div>

        {/* Mobile-Optimized Search and Filters */}
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: '#888888' }} />
            <Input
              type="text"
              placeholder="Search items, categories, or locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white border-2 border-gray-200 rounded-lg focus:border-2 transition-colors h-10 sm:h-auto text-sm sm:text-base"
              style={{ 
                color: '#3c3c3c',
                '--tw-ring-color': '#91c11e'
              } as React.CSSProperties}
              onFocus={(e) => e.target.style.borderColor = '#91c11e'}
              onBlur={(e) => e.target.style.borderColor = '#cccccc'}
            />
          </div>

          {/* Mobile-Friendly Filter Buttons */}
          <div className="space-y-3">
            {/* Category Filters */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Categories</p>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`text-xs sm:text-sm font-semibold rounded-lg transition-all h-8 sm:h-auto ${
                      selectedCategory === category
                        ? 'text-white'
                        : 'bg-white border-2 hover:bg-gray-50'
                    }`}
                    style={selectedCategory === category 
                      ? { backgroundColor: '#91c11e' }
                      : { borderColor: '#91c11e', color: '#91c11e' }
                    }
                  >
                    {category === 'all' ? 'All Categories' : category}
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Status Filters */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Status</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'all', label: 'All Status', color: '#3c3c3c' },
                  { id: 'fresh', label: 'Fresh', color: '#659a41' },
                  { id: 'expiring', label: 'Expiring', color: '#E8DE10' },
                  { id: 'expired', label: 'Expired', color: '#ef9d17' }
                ].map(({ id, label, color }) => (
                  <Button
                    key={id}
                    onClick={() => setSelectedStatus(id)}
                    className={`text-xs sm:text-sm font-semibold rounded-lg transition-all h-8 sm:h-auto ${
                      selectedStatus === id
                        ? 'text-white'
                        : 'bg-white border-2 hover:bg-gray-50'
                    }`}
                    style={selectedStatus === id 
                      ? { backgroundColor: color }
                      : { borderColor: color, color: color }
                    }
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 sm:mb-6">
          <p className="text-sm sm:text-base text-gray-600">
            Showing {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''}
            {searchQuery && ` for "${searchQuery}"`}
          </p>
        </div>

        {/* Mobile-Optimized Inventory Grid */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredItems.map((item) => (
              <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-start gap-3">
                    {/* Item Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={item.image || 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=60&h=60&fit=crop&crop=center'}
                        alt={item.name}
                        className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=60&h=60&fit=crop&crop=center';
                        }}
                      />
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-sm sm:text-base text-gray-900 truncate pr-2">{item.name}</h3>
                        <Badge 
                          className={`text-xs flex-shrink-0 ${
                            item.status === 'fresh' ? 'bg-green-100 text-green-700' :
                            item.status === 'expiring' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}
                        >
                          {item.status}
                        </Badge>
                      </div>
                      
                      <p className="text-xs sm:text-sm text-gray-600 mb-1">{item.category}</p>
                      <p className="text-xs sm:text-sm text-gray-600 mb-2">
                        {item.quantity} {item.unit} • {item.location}
                      </p>
                      
                      <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                        <Calendar className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">Expires: {new Date(item.expiryDate).toLocaleDateString()}</span>
                      </div>

                      {/* Mobile-Optimized Action Buttons */}
                      <div className="flex items-center gap-1 sm:gap-2">
                        <Button
                          onClick={() => handleAddToShoppingList(item)}
                          className="flex-1 text-xs py-1.5 px-2 h-7 sm:h-8 min-w-0"
                        >
                          <ShoppingCart className="h-3 w-3 mr-1 flex-shrink-0" />
                          <span className="truncate">Add</span>
                        </Button>
                        <Button
                          onClick={() => handleEditItem(item)}
                          className="text-xs py-1.5 px-2 h-7 sm:h-8 w-8 sm:w-auto bg-blue-600 hover:bg-blue-700 flex-shrink-0"
                        >
                          <Edit className="h-3 w-3" />
                          <span className="hidden sm:inline sm:ml-1">Edit</span>
                        </Button>
                        <Button
                          onClick={() => handleDeleteItem(item.id)}
                          className="text-xs py-1.5 px-2 h-7 sm:h-8 w-8 sm:w-auto bg-red-600 hover:bg-red-700 flex-shrink-0"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span className="hidden sm:inline sm:ml-1">Delete</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 sm:py-12">
            <Package className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No items found</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-6 px-4">
              {searchQuery 
                ? `No items match "${searchQuery}". Try a different search term.`
                : 'Your inventory is empty. Start by adding some items!'
              }
            </p>
            <Button onClick={handleAddItem} className="text-white font-semibold rounded-lg transition-all hover:opacity-90" style={{ backgroundColor: '#91c11e' }}>
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