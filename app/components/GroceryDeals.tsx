'use client';

import { useState } from 'react';

// Define Deal interface locally since the import path seems problematic
interface Deal {
  id: string;
  title: string;
  description: string;
  originalPrice: number;
  salePrice: number;
  discount: number; // percentage
  store: string;
  category: string;
  imageUrl?: string;
  validUntil: Date;
  quantity?: string;
  brand?: string;
  isOrganic?: boolean;
  location?: string;
  tags: string[];
}

// This would be fetched from your backend or a web scraping service
const mockDeals: Deal[] = [
  {
    id: '1',
    title: 'Organic Chicken Breast',
    description: 'Fresh organic chicken breast on sale',
    originalPrice: 9.99,
    salePrice: 6.99,
    discount: 30,
    store: 'SuperMarket',
    category: 'Meat',
    validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    tags: ['organic', 'protein', 'meat']
  },
  {
    id: '2',
    title: 'Avocados',
    description: 'Fresh ripe avocados, perfect for guacamole',
    originalPrice: 2.50,
    salePrice: 1.25,
    discount: 50,
    store: 'FreshGrocer',
    category: 'Fruit',
    validUntil: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    tags: ['fresh', 'healthy', 'fruit']
  },
  {
    id: '3',
    title: 'Whole Wheat Pasta',
    description: '1lb package of whole wheat pasta',
    originalPrice: 1.99,
    salePrice: 0.99,
    discount: 50,
    store: 'BudgetMart',
    category: 'Pasta',
    validUntil: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    tags: ['whole grain', 'pasta', 'healthy']
  },
  {
    id: '4',
    title: 'Greek Yogurt',
    description: '32oz container of plain Greek yogurt',
    originalPrice: 5.99,
    salePrice: 3.99,
    discount: 33,
    store: 'SuperMarket',
    category: 'Dairy',
    validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    tags: ['protein', 'dairy', 'healthy']
  },
  {
    id: '5',
    title: 'Bell Peppers',
    description: 'Colorful bell peppers, perfect for cooking',
    originalPrice: 1.50,
    salePrice: 0.75,
    discount: 50,
    store: 'FreshGrocer',
    category: 'Vegetables',
    validUntil: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    tags: ['fresh', 'vegetables', 'colorful']
  }
];

export default function GroceryDeals() {
  const [selectedStore, setSelectedStore] = useState<string | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const stores = Array.from(new Set(mockDeals.map(deal => deal.store)));
  const categories = Array.from(new Set(mockDeals.map(deal => deal.category)));
  
  // Filter deals
  const filteredDeals = mockDeals.filter(deal => {
    const matchesStore = selectedStore === 'all' || deal.store === selectedStore;
    const matchesCategory = selectedCategory === 'all' || deal.category === selectedCategory;
    const matchesSearch = !searchTerm || 
      deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.store.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStore && matchesCategory && matchesSearch;
  });
  
  // Sort by highest discount percentage
  const sortedDeals = [...filteredDeals].sort((a, b) => b.discount - a.discount);
  
  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  // Calculate savings
  const calculateSavings = (originalPrice: number, salePrice: number) => {
    return originalPrice - salePrice;
  };

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Weekly Grocery Deals</h2>
      
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="search" className="block mb-1">Search Deals</label>
          <input
            id="search"
            type="text"
            placeholder="Search for deals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input w-full"
          />
        </div>
        
        <div>
          <label htmlFor="store" className="block mb-1">Store</label>
          <select
            id="store"
            value={selectedStore}
            onChange={(e) => setSelectedStore(e.target.value)}
            className="input w-full"
          >
            <option value="all">All Stores</option>
            {stores.map(store => (
              <option key={store} value={store}>{store}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="category" className="block mb-1">Category</label>
          <select
            id="category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="input w-full"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>
      
      {sortedDeals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedDeals.map(deal => (
            <div key={deal.id} className="card flex flex-col h-full relative">
              <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full font-bold">
                {deal.discount}% OFF
              </div>
              <h3 className="text-xl font-semibold mb-2">{deal.title}</h3>
              <p className="text-gray-600 mb-1">{deal.store}</p>
              <p className="text-gray-500 text-sm mb-3">Category: {deal.category}</p>
              <p className="text-gray-600 text-sm mb-4">{deal.description}</p>
              
              <div className="flex items-baseline mb-4">
                <span className="text-2xl font-bold text-primary-600">${deal.salePrice.toFixed(2)}</span>
                <span className="ml-2 text-gray-500 line-through">${deal.originalPrice.toFixed(2)}</span>
                <span className="ml-2 text-green-600">Save ${calculateSavings(deal.originalPrice, deal.salePrice).toFixed(2)}</span>
              </div>

              <div className="flex flex-wrap gap-1 mb-4">
                {deal.tags.slice(0, 3).map((tag: string) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
              
              <div className="mt-auto text-sm text-gray-500">
                <p>Deal valid until {formatDate(deal.validUntil)}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-gray-500">No deals found matching your filters.</p>
        </div>
      )}
    </div>
  );
} 