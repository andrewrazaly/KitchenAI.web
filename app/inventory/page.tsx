'use client';

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useRouter } from 'next/navigation';
import ErrorBoundary from '../components/ErrorBoundary';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import { Slider } from "../components/ui/slider";
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
import EditInventoryModal from '../components/EditInventoryModal';
import EnhancedInventoryCard from '../components/EnhancedInventoryCard';
import BulkImportModal from '../components/BulkImportModal';

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
    quantity: 100,
    unit: 'g',
    expiryDate: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    location: 'Pantry',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=60&h=60&fit=crop&crop=center'
  });

  const categories = ['Dairy', 'Bakery', 'Produce', 'Meat', 'Pantry', 'Frozen', 'Other'];
  const locations = ['Refrigerator', 'Freezer', 'Pantry', 'Counter', 'Cabinet'];
  const units = ['g', 'kg', 'item'];

  const getQuantityMax = (unit: string) => {
    const unitMaxes: { [key: string]: number } = {
      'g': 2000,
      'kg': 20,
      'item': 50
    };
    return unitMaxes[unit] || 50;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    
    onAdd(formData);
    setFormData({
      name: '',
      category: 'Other',
      quantity: 100,
      unit: 'g',
      expiryDate: '',
      purchaseDate: new Date().toISOString().split('T')[0],
      location: 'Pantry',
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=60&h=60&fit=crop&crop=center'
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" style={{ padding: '1rem' }}>
      <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
        <div className="space-y-4 lg:space-y-6" style={{ padding: '1.5rem' }}>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200" style={{ paddingBottom: '1rem' }}>
            <div>
              <h2 className="text-xl lg:text-2xl font-bold text-gray-800" style={{ fontSize: '1.5rem' }}>Add New Item</h2>
              <p className="text-xs lg:text-sm mt-1 text-gray-500" style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>Fill in the item details below</p>
            </div>
            <Button 
              onClick={onClose} 
              className="p-0 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
              style={{ height: '2.25rem', width: '2.25rem' }}
            >
              <X className="h-4 w-4 lg:h-5 lg:w-5" style={{ width: '1.25rem', height: '1.25rem' }} />
            </Button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-5" style={{ gap: '1rem' }}>
            {/* Item Name */}
            <div>
              <label className="block text-xs lg:text-sm font-semibold mb-2 text-gray-700" style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                Item Name <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Organic Milk"
                className="bg-white border-gray-300 focus:ring-2 focus:ring-[#108910] focus:border-[#108910] text-gray-900 placeholder:text-gray-400 rounded-lg transition-colors text-sm"
                style={{ fontSize: '0.875rem', padding: '0.75rem' }}
                required
              />
            </div>

            {/* Category and Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4" style={{ gap: '0.75rem' }}>
              <div>
                <label className="block text-xs lg:text-sm font-semibold mb-2 text-gray-700" style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full rounded-lg border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-[#108910] focus:border-[#108910] transition-colors text-sm"
                  style={{ fontSize: '0.875rem', padding: '0.75rem' }}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs lg:text-sm font-semibold mb-2 text-gray-700" style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Location</label>
                <select
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full rounded-lg border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-[#108910] focus:border-[#108910] transition-colors text-sm"
                  style={{ fontSize: '0.875rem', padding: '0.75rem' }}
                >
                  {locations.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Enhanced Quantity with Slider */}
            <div className="space-y-3">
              <label className="block text-xs lg:text-sm font-semibold text-gray-700" style={{ fontSize: '0.875rem' }}>
                Quantity
              </label>
              
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <Slider
                  value={[formData.quantity]}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, quantity: value[0] }))}
                  min={formData.unit === 'g' ? 10 : 1}
                  max={getQuantityMax(formData.unit)}
                  step={formData.unit === 'g' ? 10 : 1}
                  showValue={true}
                  showMinMax={true}
                  unit={formData.unit}
                  className="w-full"
                />
                
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    min={formData.unit === 'g' ? "10" : "1"}
                    max={getQuantityMax(formData.unit)}
                    value={formData.quantity}
                    onChange={(e) => {
                      const minValue = formData.unit === 'g' ? 10 : 1;
                      setFormData(prev => ({ ...prev, quantity: Math.min(getQuantityMax(formData.unit), Math.max(minValue, parseInt(e.target.value) || minValue)) }));
                    }}
                    className="w-20 text-center bg-white border-gray-300 focus:ring-2 focus:ring-[#108910] focus:border-[#108910] text-gray-900 rounded-lg transition-colors text-sm"
                    style={{ fontSize: '0.875rem', padding: '0.75rem' }}
                  />
                  
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                    className="flex-1 rounded-lg border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-[#108910] focus:border-[#108910] transition-colors text-sm"
                    style={{ fontSize: '0.875rem', padding: '0.75rem' }}
                  >
                    {units.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Dates with Custom Date Pickers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4" style={{ gap: '0.75rem' }}>
              <div>
                <label className="block text-xs lg:text-sm font-semibold mb-2 text-gray-700" style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Purchase Date</label>
                <DatePicker
                  value={formData.purchaseDate}
                  onChange={(date) => setFormData(prev => ({ ...prev, purchaseDate: date }))}
                  placeholder="Select purchase date"
                />
              </div>

              <div>
                <label className="block text-xs lg:text-sm font-semibold mb-2 text-gray-700" style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Expiry Date</label>
                <DatePicker
                  value={formData.expiryDate}
                  onChange={(date) => setFormData(prev => ({ ...prev, expiryDate: date }))}
                  placeholder="Select expiry date"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 border-t border-gray-200" style={{ paddingTop: '1rem', gap: '0.75rem' }}>
              <Button 
                type="button" 
                onClick={onClose} 
                className="flex-1 bg-white hover:bg-gray-100 border border-gray-300 text-gray-800 rounded-lg transition-colors font-semibold text-sm"
                style={{ fontSize: '0.875rem', padding: '0.75rem' }}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1 text-white rounded-lg transition-colors font-semibold hover:opacity-90 text-sm"
                style={{ backgroundColor: '#108910', fontSize: '0.875rem', padding: '0.75rem' }}
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

function InventoryItemCard({
  item,
  onAddToShoppingList,
  onEdit,
  onDelete,
}: {
  item: InventoryItem;
  onAddToShoppingList: (item: InventoryItem) => void;
  onEdit: (item: InventoryItem) => void;
  onDelete: (id: string) => void;
}) {
  const statusConfig = {
    fresh: {
      label: 'Fresh',
      textColor: 'text-green-700',
      icon: <CheckCircle className="h-4 w-4 text-green-600" />,
    },
    expiring: {
      label: 'Expiring Soon',
      textColor: 'text-amber-700',
      icon: <Clock className="h-4 w-4 text-amber-600" />,
    },
    expired: {
      label: 'Expired',
      textColor: 'text-red-700',
      icon: <AlertTriangle className="h-4 w-4 text-red-600" />,
    },
  };

  const { label, textColor, icon } = statusConfig[item.status];

  return (
    <Card className="overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 ease-in-out border-l-4 bg-white" style={{ borderLeftColor: `var(--status-${item.status})` }}>
      <CardContent className="p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <img
            src={item.image || 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=80&h=80&fit=crop&crop=center'}
            alt={item.name}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover border mx-auto sm:mx-0"
            style={{ width: '4rem', height: '4rem' }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=80&h=80&fit=crop&crop=center';
            }}
          />
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-base sm:text-lg text-gray-800 truncate pr-2" style={{ fontSize: '1.125rem' }}>{item.name}</h3>
              <Button
                className="h-8 w-8 text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 shadow-sm"
                onClick={() => onDelete(item.id)}
                style={{ minWidth: '2rem', minHeight: '2rem' }}
              >
                <Trash2 className="h-4 w-4" style={{ width: '1rem', height: '1rem' }} />
              </Button>
            </div>
            
            <p className="text-xs sm:text-sm text-gray-500 mb-2" style={{ fontSize: '0.875rem' }}>{item.category} • {item.location}</p>
            <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-3" style={{ fontSize: '0.875rem' }}>
              Quantity: {item.quantity} {item.unit}
            </p>

            <div className="flex items-center gap-2 text-xs sm:text-sm font-medium p-2 rounded-md bg-[#f6f7f8] mb-3" style={{ padding: '0.5rem', fontSize: '0.875rem' }}>
              {icon}
              <span className={`flex-1 truncate ${textColor}`}>
                {label} (Expires: {new Date(item.expiryDate).toLocaleDateString()})
              </span>
            </div>
             <Button
              onClick={() => onAddToShoppingList(item)}
              className="w-full text-gray-800 font-semibold hover:opacity-90 text-sm"
              style={{ backgroundColor: '#ffdc23', fontSize: '0.875rem', padding: '0.75rem' }}
            >
              <ShoppingCart className="h-4 w-4 mr-2" style={{ width: '1rem', height: '1rem' }} />
              Add to Shopping List
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function InventoryContent() {
  const { isSignedIn, loading: authLoading } = useAuth();
  const { showNotification } = useNotification();
  const router = useRouter();
  
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

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
        showNotification('⚠️ Using fallback data - API connection issue', 'info');
      } finally {
        setIsLoading(false);
      }
    };

    if (isSignedIn) {
      loadInventory();
    } else {
      setIsLoading(false);
    }
  }, [isSignedIn]);

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
      // Check if this is a mock item (simple numeric ID)
      const isMockItem = /^\d+$/.test(itemId);
      
      if (isMockItem) {
        // For mock items, just remove from local state without API call
        const deletedItem = items.find(item => item.id === itemId);
        const updatedItems = items.filter(item => item.id !== itemId);
        setItems(updatedItems);
        showNotification('Item removed from inventory', 'success');
        
        // Track inventory item deletion
        if (deletedItem) {
          trackEvent('inventory_item_deleted', 'inventory', deletedItem.category);
        }
        return;
      }

      // Call the API to delete the item
      const response = await fetch(`/api/inventory?id=${itemId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || `Failed to delete item (${response.status})`;
        throw new Error(errorMessage);
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
      
      // Provide user-friendly error message via notification instead of crashing
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete item';
      showNotification(`❌ ${errorMessage}`, 'error');
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
      showNotification('❌ Failed to add to shopping list', 'error');
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

  const handleBulkImport = () => {
    setShowBulkImport(true);
    showNotification('🚀 Opening bulk import...', 'info');
    
    // Track bulk import modal open
    trackEvent('bulk_import_modal_opened', 'inventory');
  };

  const handleBulkImportSubmit = async (itemsData: Omit<InventoryItem, 'id' | 'status'>[]) => {
    try {
      const newItems: InventoryItem[] = [];
      
      for (const itemData of itemsData) {
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

        // Create new item with generated ID
        const newItem: InventoryItem = {
          id: Math.random().toString(36).substr(2, 9),
          ...itemData,
          status
        };

        newItems.push(newItem);

        // Try to save to API (for real items)
        try {
          const apiData = {
            name: itemData.name,
            category: itemData.category,
            quantity: itemData.quantity,
            unit: itemData.unit,
            expiry_date: itemData.expiryDate,
            purchase_date: itemData.purchaseDate,
            location: itemData.location,
            image: itemData.image,
            user_id: 'dev-user',
          };

          const response = await fetch('/api/inventory', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(apiData),
          });

          if (response.ok) {
            const savedItem = await response.json();
            // Update the item with the real ID from the API
            newItem.id = savedItem.id;
          }
        } catch (error) {
          console.warn('API save failed for item, using local storage:', itemData.name);
        }
      }

      // Add all items to local state
      setItems(prev => [...newItems, ...prev]);
      showNotification(`✅ Successfully imported ${newItems.length} items!`, 'success');
      
      // Track bulk import success
      trackEvent('bulk_import_success', 'inventory', 'items_count', newItems.length);
    } catch (error) {
      console.error('Error importing bulk items:', error);
      showNotification('❌ Failed to import items', 'error');
      trackEvent('bulk_import_error', 'inventory');
    }
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
        image: itemData.image,
        user_id: 'dev-user',
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
      showNotification('❌ Failed to add item to inventory', 'error');
      trackEvent('inventory_add_error', 'inventory');
    }
  };

  const handleEditItem = (item: InventoryItem) => {
    setEditingItem(item);
    setShowEditModal(true);
    showNotification(`✏️ Opening edit modal for ${item.name}`, 'info');
    
    // Track edit item attempt
    trackEvent('inventory_item_edit_initiated', 'inventory', item.category);
  };

  const handleSaveItem = async (updatedItem: InventoryItem) => {
    try {
      // Check if this is a mock item (simple numeric ID)
      const isMockItem = /^\d+$/.test(updatedItem.id);
      
      if (isMockItem) {
        // For mock items, just update local state without API call
        const updatedItems = items.map(item => 
          item.id === updatedItem.id ? updatedItem : item
        );
        setItems(updatedItems);
        showNotification(`✅ ${updatedItem.name} updated successfully!`, 'success');
        
        // Track inventory item update
        trackEvent('inventory_item_updated', 'inventory', updatedItem.category);
        return;
      }

      // Prepare data for API (convert to snake_case for backend)
      const apiData = {
        name: updatedItem.name,
        category: updatedItem.category,
        quantity: updatedItem.quantity,
        unit: updatedItem.unit,
        expiry_date: updatedItem.expiryDate,
        purchase_date: updatedItem.purchaseDate,
        location: updatedItem.location,
        image: updatedItem.image,
      };

      // Call the API to update the item
      const response = await fetch(`/api/inventory?id=${updatedItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        throw new Error('Failed to update item in API');
      }

      // Update local state after successful API call
      const updatedItems = items.map(item => 
        item.id === updatedItem.id ? updatedItem : item
      );
      setItems(updatedItems);
      showNotification(`✅ ${updatedItem.name} updated successfully!`, 'success');
      
      // Track inventory item update
      trackEvent('inventory_item_updated', 'inventory', updatedItem.category);
    } catch (error) {
      console.error('Error updating item:', error);
      showNotification('❌ Failed to update item', 'error');
      trackEvent('inventory_update_error', 'inventory');
    }
  };

  const handleQuickUpdate = async (itemId: string, updates: Partial<InventoryItem>) => {
    try {
      const itemToUpdate = items.find(item => item.id === itemId);
      if (!itemToUpdate) return;

      const updatedItem = { ...itemToUpdate, ...updates };
      
      // Check if this is a mock item (simple numeric ID)
      const isMockItem = /^\d+$/.test(itemId);
      
      if (isMockItem) {
        // For mock items, just update local state without API call
        const updatedItems = items.map(item => 
          item.id === itemId ? updatedItem : item
        );
        setItems(updatedItems);
        showNotification(`✅ Quick update saved!`, 'success');
        return;
      }

      // For real items, update via API
      const apiData = {
        quantity: updatedItem.quantity,
      };

      const response = await fetch(`/api/inventory?id=${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        throw new Error('Failed to update item');
      }

      // Update local state after successful API call
      const updatedItems = items.map(item => 
        item.id === itemId ? updatedItem : item
      );
      setItems(updatedItems);
      showNotification(`✅ Quick update saved!`, 'success');
      
      // Track quick update
      trackEvent('inventory_quick_update', 'inventory');
    } catch (error) {
      console.error('Error with quick update:', error);
      showNotification('❌ Failed to save quick update', 'error');
    }
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
    <div className="min-h-screen bg-[#f6f7f8]" style={{'--status-fresh': '#108910', '--status-expiring': '#ffdc23', '--status-expired': '#dc2626'} as React.CSSProperties}>
      <AddItemModal 
        isOpen={showAddForm} 
        onClose={() => setShowAddForm(false)}
        onAdd={handleAddItemSubmit}
      />

      {/* Edit Item Modal */}
      <EditInventoryModal
        isOpen={showEditModal}
        item={editingItem}
        onClose={() => {
          setShowEditModal(false);
          setEditingItem(null);
        }}
        onSave={(updatedItem) => {
          handleSaveItem(updatedItem);
          setShowEditModal(false);
          setEditingItem(null);
        }}
      />

      {/* Bulk Import Modal */}
      <BulkImportModal
        isOpen={showBulkImport}
        onClose={() => setShowBulkImport(false)}
        onImport={handleBulkImportSubmit}
      />
      <div className="flex flex-col lg:flex-row">
        {/* Sidebar */}
        <div className="w-full lg:w-1/4 lg:min-w-[17.5rem] bg-white border-b lg:border-b-0 lg:border-r border-gray-200 p-4 lg:p-6 space-y-4 lg:space-y-8 lg:h-screen lg:sticky lg:top-0" style={{ padding: '1rem', minWidth: '17.5rem' }}>
          <div>
            <h1 className="text-xl lg:text-2xl font-bold mb-1 flex items-center gap-3 text-gray-800" style={{ fontSize: '1.5rem', gap: '0.75rem', marginBottom: '0.25rem' }}>
              <Package className="h-5 w-5 lg:h-6 lg:w-6" style={{ color: '#108910', width: '1.5rem', height: '1.5rem' }} />
              Inventory
            </h1>
            <p className="text-xs lg:text-sm text-gray-500" style={{ fontSize: '0.875rem' }}>Your custom-styled pantry.</p>
          </div>

          <div className="space-y-3 lg:space-y-4" style={{ gap: '0.75rem' }}>
             <Button 
              onClick={handleAddItem}
              className="w-full flex items-center justify-center gap-2 text-white font-semibold rounded-lg transition-all hover:opacity-90 text-sm lg:text-base"
              style={{ backgroundColor: '#108910', height: '2.5rem', fontSize: '0.875rem', gap: '0.5rem' }}
            >
              <Plus className="h-4 w-4" style={{ width: '1rem', height: '1rem' }} />
              <span>Add Item</span>
            </Button>
            <Button 
              onClick={handleBulkImport}
              className="w-full flex items-center justify-center gap-2 text-white font-semibold rounded-lg transition-all hover:opacity-90 text-sm lg:text-base"
              style={{ backgroundColor: '#3b82f6', height: '2.5rem', fontSize: '0.875rem', gap: '0.5rem' }}
            >
              <Package className="h-4 w-4" style={{ width: '1rem', height: '1rem' }} />
              <span>Add in Bulk</span>
            </Button>
            <Button 
              onClick={handleScanBarcode}
              className="w-full flex items-center justify-center gap-2 font-semibold rounded-lg transition-all text-gray-800 hover:opacity-90 text-sm lg:text-base"
              style={{ backgroundColor: '#ffdc23', height: '2.5rem', fontSize: '0.875rem', gap: '0.5rem' }}
            >
              <Scan className="h-4 w-4" style={{ width: '1rem', height: '1rem' }} />
              <span>Scan Barcode</span>
            </Button>
          </div>
          
          {/* Filters */}
          <div className="space-y-4 lg:space-y-6" style={{ gap: '1rem' }}>
            <h2 className="font-semibold text-base lg:text-lg text-gray-800" style={{ fontSize: '1.125rem' }}>Filters</h2>
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" style={{ left: '0.75rem', width: '1rem', height: '1rem' }} />
              <Input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 lg:pl-10 bg-[#f6f7f8] border-gray-200 rounded-lg focus:border-[#108910] transition-colors text-sm"
                style={{ paddingLeft: '2.25rem', height: '2.5rem', fontSize: '0.875rem' }}
              />
            </div>
            
            {/* Category Filters */}
            <div>
              <label className="text-xs lg:text-sm font-medium text-gray-700 block mb-2" style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Category</label>
              <select 
                value={selectedCategory} 
                onChange={e => setSelectedCategory(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white text-gray-900 focus:border-[#108910] transition-colors text-sm"
                style={{ padding: '0.5rem', height: '2.5rem', fontSize: '0.875rem' }}
              >
                 {categories.map((category) => (
                   <option key={category} value={category}>
                     {category === 'all' ? 'All Categories' : category}
                   </option>
                 ))}
              </select>
            </div>
            
            {/* Status Filters */}
            <div>
              <label className="text-xs lg:text-sm font-medium text-gray-700 block mb-2" style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Status</label>
              <div className="space-y-2" style={{ gap: '0.5rem' }}>
                 {[
                    { id: 'all', label: 'All Status' },
                    { id: 'fresh', label: 'Fresh' },
                    { id: 'expiring', label: 'Expiring Soon' },
                    { id: 'expired', label: 'Expired' }
                  ].map(({ id, label }) => (
                  <div key={id} className="flex items-center" style={{ gap: '0.75rem' }}>
                    <input 
                      type="radio" 
                      id={`status-${id}`}
                      name="status"
                      value={id}
                      checked={selectedStatus === id}
                      onChange={e => setSelectedStatus(e.target.value)}
                      className="h-4 w-4 text-[#108910] border-gray-300 focus:ring-[#108910]"
                      style={{ width: '1rem', height: '1rem' }}
                    />
                    <label htmlFor={`status-${id}`} className="block text-xs lg:text-sm text-gray-700" style={{ fontSize: '0.875rem' }}>{label}</label>
                  </div>
                 ))}
              </div>
            </div>
             <Button
                onClick={clearAllFilters}
                className="text-xs lg:text-sm text-gray-600 hover:text-gray-900 p-0 h-auto"
                style={{ fontSize: '0.875rem' }}
              >
                Clear All Filters
              </Button>
          </div>
        </div>

        {/* Main Content */}
        <main className="w-full lg:w-3/4 bg-[#f6f7f8]" style={{ padding: '1rem' }}>
           {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6" style={{ marginBottom: '1.5rem', gap: '1rem' }}>
             <h2 className="text-lg lg:text-xl font-semibold text-gray-700" style={{ fontSize: '1.25rem' }}>
                Your Items ({filteredItems.length})
              </h2>
             <Button 
                onClick={() => router.push('/shopping-list')}
                className="border border-gray-300 text-gray-700 hover:bg-gray-100 text-sm w-full sm:w-auto"
                style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
              >
                <ShoppingCart className="h-4 w-4 mr-2" style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
                Go to Shopping List
              </Button>
          </div>

          {/* Grid */}
          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-4 lg:gap-6" style={{ gap: '1rem' }}>
              {filteredItems.map((item) => (
                <EnhancedInventoryCard 
                  key={item.id}
                  item={item}
                  onAddToShoppingList={handleAddToShoppingList}
                  onEdit={handleEditItem}
                  onDelete={handleDeleteItem}
                  onQuickUpdate={handleQuickUpdate}
                />
              ))}
            </div>
          ) : (
            <div className="text-center rounded-lg border-2 border-dashed border-gray-300 bg-white" style={{ padding: '3rem 1rem' }}>
              <Package className="h-12 w-12 lg:h-16 lg:w-16 text-gray-400 mx-auto mb-4" style={{ width: '3rem', height: '3rem', marginBottom: '1rem' }} />
              <h3 className="text-lg lg:text-xl font-semibold text-gray-800 mb-2" style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No items found</h3>
              <p className="text-sm lg:text-base text-gray-500 mb-6" style={{ fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                {searchQuery 
                  ? `No items match "${searchQuery}". Try a different search.`
                  : 'Your inventory is empty. Add an item to get started.'
                }
              </p>
              <Button onClick={handleAddItem} className="text-white font-semibold rounded-lg transition-all hover:opacity-90" style={{ backgroundColor: '#108910', fontSize: '0.875rem', padding: '0.75rem 1rem' }}>
                <Plus className="h-4 w-4 mr-2" style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
                Add Your First Item
              </Button>
            </div>
          )}
        </main>
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