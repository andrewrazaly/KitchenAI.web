'use client';

import { useState, FormEvent } from 'react';
import { useNotification } from './Notification';

// Define the InventoryItem interface to match the parent component
interface InventoryItemInput {
  name: string;
  quantity: number;
  location: 'fridge' | 'pantry';
  category: string;
  unit: string;
  expiry_date: string | null;
  notes: string;
}

interface AddInventoryItemProps {
  onAddItem: (item: InventoryItemInput) => void;
}

export default function AddInventoryItem({ onAddItem }: AddInventoryItemProps) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [location, setLocation] = useState<'fridge' | 'pantry'>('fridge');
  const [expiry_date, setExpiryDate] = useState<string>('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { showNotification } = useNotification();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!name.trim()) {
      showNotification('Please enter an item name', 'error');
      return;
    }
    
    if (quantity <= 0) {
      showNotification('Quantity must be greater than 0', 'error');
      return;
    }
    
    const newItem: InventoryItemInput = {
      name: name.trim(),
      quantity,
      location,
      // Set a default category based on location for database consistency
      category: location === 'fridge' ? 'Dairy' : 'Canned Goods',
      unit: 'pcs',
      expiry_date: expiry_date || null,
      notes: ''
    };
    
    onAddItem(newItem);
    showNotification('Item added successfully!', 'success');
    
    // Reset form
    setName('');
    setQuantity(1);
    setLocation('fridge');
    setExpiryDate('');
  };

  return (
    <div className="card shadow p-6 bg-white rounded-lg border-l-4 border-l-primary">
      <h2 className="text-2xl font-accent font-bold text-navy mb-4">Add Food Item</h2>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="label">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              placeholder="e.g. Milk, Eggs, Bread"
              required
            />
          </div>
          
          <div>
            <label htmlFor="quantity" className="label">
              Quantity
            </label>
            <input
              type="number"
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="input"
              min="1"
              required
            />
          </div>
          
          <div>
            <label htmlFor="location" className="label">
              Storage Location
            </label>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="location"
                  value="fridge"
                  checked={location === 'fridge'}
                  onChange={() => setLocation('fridge')}
                  className="h-4 w-4 text-primary focus:ring-primary"
                />
                <span className="ml-2 text-navy">Fridge</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="location"
                  value="pantry"
                  checked={location === 'pantry'}
                  onChange={() => setLocation('pantry')}
                  className="h-4 w-4 text-primary focus:ring-primary"
                />
                <span className="ml-2 text-navy">Pantry</span>
              </label>
            </div>
          </div>
          
          <div>
            <label htmlFor="expiry_date" className="label">
              Expiration Date
            </label>
            <div className="relative">
              <input
                type="text"
                id="expiry_date"
                value={expiry_date ? new Date(expiry_date).toLocaleDateString() : ''}
                onClick={() => setShowDatePicker(true)}
                readOnly
                placeholder="Select date"
                className="input cursor-pointer"
              />
              {showDatePicker && (
                <div className="absolute z-10 mt-1 bg-white rounded-lg shadow-lg border border-gray-200">
                  <input
                    type="date"
                    value={expiry_date}
                    onChange={(e) => {
                      setExpiryDate(e.target.value);
                      setShowDatePicker(false);
                    }}
                    className="p-2"
                    onBlur={() => setShowDatePicker(false)}
                    autoFocus
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <button 
            type="submit" 
            className="btn btn-primary w-full"
          >
            Save Item
          </button>
        </div>
      </form>
    </div>
  );
} 