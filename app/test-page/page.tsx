'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function TestPage() {
  const [apiStatus, setApiStatus] = useState<{success?: boolean, message?: string} | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Test the simple API endpoint
    fetch('/api/test')
      .then(res => res.json())
      .then(data => {
        setApiStatus(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error testing API:', err);
        setApiStatus({ success: false, message: 'API test failed' });
        setLoading(false);
      });
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">KitchenAI Test Page</h1>
      
      <div className="mb-8 p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">System Status</h2>
        
        {loading ? (
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600 mr-2"></div>
            <span>Testing API connection...</span>
          </div>
        ) : apiStatus?.success ? (
          <div className="text-green-600">
            ✅ API is working correctly: {apiStatus.message}
          </div>
        ) : (
          <div className="text-red-600">
            ❌ API test failed: {apiStatus?.message || 'Unknown error'}
          </div>
        )}
      </div>
      
      <div className="mb-8 p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Navigation Test</h2>
        <div className="space-y-2">
          <div>
            <Link href="/" className="text-indigo-600 hover:underline">
              Home
            </Link>
          </div>
          <div>
            <Link href="/meal-planner" className="text-indigo-600 hover:underline">
              Meal Planner
            </Link>
          </div>
          <div>
            <Link href="/grocery-list" className="text-indigo-600 hover:underline">
              Grocery List
            </Link>
          </div>
          <div>
            <Link href="/inventory" className="text-indigo-600 hover:underline">
              Inventory
            </Link>
          </div>
        </div>
      </div>
      
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Component Test</h2>
        <button className="btn btn-primary mr-2">Primary Button</button>
        <button className="btn btn-secondary">Secondary Button</button>
      </div>
    </div>
  );
} 