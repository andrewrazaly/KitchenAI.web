'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Slider } from "./ui/slider";
import { 
  X, 
  Save, 
  Calendar,
  ChevronDown,
  Package,
  MapPin,
  Tag,
  Hash
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

interface EditInventoryModalProps {
  isOpen: boolean;
  item: InventoryItem | null;
  onClose: () => void;
  onSave: (item: InventoryItem) => void;
}

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
    { value: '01', label: 'Jan' }, { value: '02', label: 'Feb' }, { value: '03', label: 'Mar' },
    { value: '04', label: 'Apr' }, { value: '05', label: 'May' }, { value: '06', label: 'Jun' },
    { value: '07', label: 'Jul' }, { value: '08', label: 'Aug' }, { value: '09', label: 'Sep' },
    { value: '10', label: 'Oct' }, { value: '11', label: 'Nov' }, { value: '12', label: 'Dec' }
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
      month: 'short', 
      day: 'numeric' 
    });
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
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span className={value ? 'text-gray-900' : 'text-gray-400'}>
            {formatDisplayDate()}
          </span>
        </div>
        <ChevronDown className={`h-4 w-4 transition-transform text-gray-400 ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-50 p-4">
          {/* Quick Select Options */}
          <div className="mb-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleQuickSelect(3)}
              className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              3 days
            </button>
            <button
              type="button"
              onClick={() => handleQuickSelect(7)}
              className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              1 week
            </button>
            <button
              type="button"
              onClick={() => handleQuickSelect(14)}
              className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              2 weeks
            </button>
            <button
              type="button"
              onClick={() => handleQuickSelect(30)}
              className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              1 month
            </button>
          </div>

          {/* Date Selectors */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-600">Month</label>
              <select
                value={selectedMonth}
                onChange={(e) => {
                  setSelectedMonth(e.target.value);
                  handleDateChange(selectedDay, e.target.value, selectedYear);
                }}
                className="w-full p-2 border border-gray-200 rounded-lg text-sm bg-white"
              >
                <option value="">Month</option>
                {months.map(month => (
                  <option key={month.value} value={month.value}>{month.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1 text-gray-600">Day</label>
              <select
                value={selectedDay}
                onChange={(e) => {
                  setSelectedDay(e.target.value);
                  handleDateChange(e.target.value, selectedMonth, selectedYear);
                }}
                className="w-full p-2 border border-gray-200 rounded-lg text-sm bg-white"
              >
                <option value="">Day</option>
                {days.map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1 text-gray-600">Year</label>
              <select
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(e.target.value);
                  handleDateChange(selectedDay, selectedMonth, e.target.value);
                }}
                className="w-full p-2 border border-gray-200 rounded-lg text-sm bg-white"
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
              onClick={() => {
                setSelectedDay('');
                setSelectedMonth('');
                setSelectedYear('');
                onChange('');
                setIsOpen(false);
              }}
              className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-600"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex-1 px-3 py-2 text-sm text-white rounded-lg transition-colors bg-green-600 hover:bg-green-700"
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

export default function EditInventoryModal({ isOpen, item, onClose, onSave }: EditInventoryModalProps) {
  const [formData, setFormData] = useState<InventoryItem>({
    id: '',
    name: '',
    category: 'Other',
    quantity: 100,
    unit: 'g',
    expiryDate: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    location: 'Pantry',
    status: 'fresh',
    image: ''
  });

  const [isSaving, setIsSaving] = useState(false);

  const categories = ['Dairy', 'Bakery', 'Produce', 'Meat', 'Pantry', 'Frozen', 'Other'];
  const locations = ['Refrigerator', 'Freezer', 'Pantry', 'Counter', 'Cabinet'];
  const units = ['g', 'kg', 'item'];

  // Update form data when item changes
  useEffect(() => {
    if (item) {
      setFormData({ ...item });
    }
  }, [item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    
    setIsSaving(true);
    
    // Simulate save delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
    
    onSave(formData);
    setIsSaving(false);
    onClose();
  };

  const handleQuickSave = async () => {
    if (!formData.name.trim()) return;
    
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    
    onSave(formData);
    setIsSaving(false);
  };

  const getQuantityMax = () => {
    const unitMaxes: { [key: string]: number } = {
      'g': 2000,
      'kg': 20,
      'item': 50
    };
    return unitMaxes[formData.unit] || 50;
  };

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Package className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Edit Item</h2>
                <p className="text-sm text-gray-500">Update your inventory item</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                onClick={handleQuickSave}
                disabled={isSaving || !formData.name.trim()}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-sm"
              >
                {isSaving ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </div>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Quick Save
                  </>
                )}
              </Button>
              <Button 
                onClick={onClose} 
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Item Name */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-gray-700">
                <Tag className="h-4 w-4" />
                Item Name *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Organic Milk"
                className="bg-white border-gray-300 focus:ring-2 focus:ring-green-600 focus:border-green-600 text-gray-900 placeholder:text-gray-400 rounded-lg transition-colors"
                required
              />
            </div>

            {/* Category and Location */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-gray-700">
                  <Hash className="h-4 w-4" />
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full rounded-lg border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-colors p-3"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-gray-700">
                  <MapPin className="h-4 w-4" />
                  Location
                </label>
                <select
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full rounded-lg border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-colors p-3"
                >
                  {locations.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Enhanced Quantity with Slider */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Package className="h-4 w-4" />
                Quantity
              </label>
              
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                                 <Slider
                   value={[formData.quantity]}
                   onValueChange={(value) => setFormData(prev => ({ ...prev, quantity: value[0] }))}
                   min={formData.unit === 'g' ? 10 : 1}
                   max={getQuantityMax()}
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
                     max={getQuantityMax()}
                     value={formData.quantity}
                     onChange={(e) => {
                       const minValue = formData.unit === 'g' ? 10 : 1;
                       setFormData(prev => ({ ...prev, quantity: Math.min(getQuantityMax(), Math.max(minValue, parseInt(e.target.value) || minValue)) }));
                     }}
                     className="w-20 text-center bg-white border-gray-300 focus:ring-2 focus:ring-green-600 focus:border-green-600"
                   />
                  
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                    className="flex-1 rounded-lg border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-colors p-2"
                  >
                    {units.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-gray-700">
                  <Calendar className="h-4 w-4" />
                  Purchase Date
                </label>
                <DatePicker
                  value={formData.purchaseDate}
                  onChange={(date) => setFormData(prev => ({ ...prev, purchaseDate: date }))}
                  placeholder="Select purchase date"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-gray-700">
                  <Calendar className="h-4 w-4" />
                  Expiry Date
                </label>
                <DatePicker
                  value={formData.expiryDate}
                  onChange={(date) => setFormData(prev => ({ ...prev, expiryDate: date }))}
                  placeholder="Select expiry date"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Button 
                type="button" 
                onClick={onClose} 
                className="flex-1 bg-white hover:bg-gray-100 border border-gray-300 text-gray-800 rounded-lg transition-colors font-semibold"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSaving || !formData.name.trim()}
                className="flex-1 text-white rounded-lg transition-colors font-semibold bg-green-600 hover:bg-green-700 disabled:opacity-50"
              >
                {isSaving ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </div>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 