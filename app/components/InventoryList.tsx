'use client';

import { useState } from 'react';

// Define the InventoryItem interface with snake_case field names
interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  expiry_date: string | null;
  location: string;
  notes: string;
}

interface InventoryListProps {
  items: InventoryItem[];
  onDeleteItem: (id: string) => void;
}

export default function InventoryList({ items, onDeleteItem }: InventoryListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<keyof InventoryItem>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filter, setFilter] = useState<'all' | 'fridge' | 'pantry'>('all');

  // Filter items based on location
  const filteredItems = items.filter(item => {
    if (filter === 'all') return true;
    return item.location === filter;
  });

  // Search items
  const searchedItems = filteredItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort items
  const sortedItems = [...searchedItems].sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];
    
    if (aValue === null || aValue === undefined) return sortOrder === 'asc' ? -1 : 1;
    if (bValue === null || bValue === undefined) return sortOrder === 'asc' ? 1 : -1;
    
    if (sortBy === 'expiry_date' && aValue && bValue) {
      return sortOrder === 'asc' 
        ? new Date(aValue).getTime() - new Date(bValue).getTime()
        : new Date(bValue).getTime() - new Date(aValue).getTime();
    }
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    return sortOrder === 'asc'
      ? (aValue < bValue ? -1 : 1)
      : (bValue < aValue ? -1 : 1);
  });

  // Handle sort
  const handleSort = (column: keyof InventoryItem) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  // Format date for display
  const formatDate = (date: string | null) => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleDateString();
  };

  // Calculate expiration status
  const getExpiryStatus = (item: InventoryItem) => {
    if (!item.expiry_date) return null;
    
    const daysUntilExpiry = Math.ceil((new Date(item.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) {
      return <span className="expiry-indicator expiry-expired">Expired</span>;
    } else if (daysUntilExpiry <= 3) {
      return <span className="expiry-indicator expiry-soon">Expires in {daysUntilExpiry} day{daysUntilExpiry !== 1 ? 's' : ''}</span>;
    } else if (daysUntilExpiry <= 7) {
      return <span className="expiry-indicator expiry-good">Expires in {daysUntilExpiry} days</span>;
    }
    
    return null;
  };

  return (
    <div className="mt-6">
      <div className="mb-4 flex flex-col sm:flex-row gap-4">
        <div className="w-full sm:w-2/3">
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input"
          />
        </div>
        
        <div className="w-full sm:w-1/3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'fridge' | 'pantry')}
            className="input"
          >
            <option value="all">All Items</option>
            <option value="fridge">Fridge</option>
            <option value="pantry">Pantry</option>
          </select>
        </div>
      </div>
      
      {sortedItems.length > 0 ? (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full">
            <thead className="table-header">
              <tr>
                <th 
                  className="px-4 py-3 text-left text-xs font-semibold text-navy uppercase tracking-wider cursor-pointer hover:bg-gray-light"
                  onClick={() => handleSort('name')}
                >
                  Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-semibold text-navy uppercase tracking-wider cursor-pointer hover:bg-gray-light"
                  onClick={() => handleSort('quantity')}
                >
                  Quantity {sortBy === 'quantity' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-semibold text-navy uppercase tracking-wider cursor-pointer hover:bg-gray-light"
                  onClick={() => handleSort('location')}
                >
                  Location {sortBy === 'location' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-semibold text-navy uppercase tracking-wider cursor-pointer hover:bg-gray-light"
                  onClick={() => handleSort('expiry_date')}
                >
                  Expiry Date {sortBy === 'expiry_date' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-navy uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-medium">
              {sortedItems.map((item) => (
                <tr key={item.id} className="table-row">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="font-medium text-navy">{item.name}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-navy">
                    {item.quantity}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap capitalize text-navy">
                    {item.location}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-navy">
                    <div>{formatDate(item.expiry_date)}</div>
                    <div className="text-sm mt-1">{getExpiryStatus(item)}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right text-sm">
                    <button 
                      onClick={() => onDeleteItem(item.id)}
                      className="text-danger hover:text-danger font-semibold"
                      aria-label="Delete item"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-navy">No items found. Add some items to your inventory!</p>
        </div>
      )}
    </div>
  );
} 