'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

export default function DebugStoragePage() {
  const [storageData, setStorageData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const data: Record<string, any> = {};
      
      // Get all localStorage keys
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          try {
            const value = localStorage.getItem(key);
            if (value) {
              // Try to parse as JSON, otherwise store as string
              try {
                data[key] = JSON.parse(value);
              } catch {
                data[key] = value;
              }
            }
          } catch (error) {
            data[key] = `Error reading: ${error}`;
          }
        }
      }
      
      setStorageData(data);
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Loading Storage Data...</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">LocalStorage Debug</h1>
      
      <div className="grid gap-4">
        {Object.entries(storageData).map(([key, value]) => (
          <Card key={key}>
            <CardHeader>
              <CardTitle className="text-lg">{key}</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
                {typeof value === 'object' 
                  ? JSON.stringify(value, null, 2)
                  : String(value)
                }
              </pre>
              {Array.isArray(value) && (
                <p className="mt-2 text-sm text-gray-600">
                  Array with {value.length} items
                </p>
              )}
            </CardContent>
          </Card>
        ))}
        
        {Object.keys(storageData).length === 0 && (
          <Card>
            <CardContent className="text-center p-8">
              <p className="text-gray-500">No localStorage data found</p>
            </CardContent>
          </Card>
        )}
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Recipe-Related Keys</h2>
        <div className="grid gap-2">
          {Object.keys(storageData)
            .filter(key => 
              key.toLowerCase().includes('recipe') || 
              key.toLowerCase().includes('reel') || 
              key.toLowerCase().includes('saved') ||
              key.toLowerCase().includes('collection') ||
              key.toLowerCase().includes('kitchenai')
            )
            .map(key => (
              <div key={key} className="p-2 bg-green-50 rounded">
                <strong>{key}</strong>: {Array.isArray(storageData[key]) ? `${storageData[key].length} items` : typeof storageData[key]}
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
} 