'use client';

import { useRouter } from 'next/navigation';
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { ShoppingCart, ArrowLeft, ArrowRight } from "lucide-react";

export default function GroceryListPage() {
  const router = useRouter();

  const handleBackClick = () => {
    router.push('/');
  };

  const handleShoppingListClick = () => {
    router.push('/shopping-list');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <Button
              onClick={handleBackClick}
              className="p-2 bg-transparent hover:bg-gray-100 text-gray-600 shadow-none h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-semibold text-gray-900">Grocery List</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card className="text-center">
          <CardContent className="py-12">
            <ShoppingCart className="h-16 w-16 text-orange-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Grocery List</h2>
            <p className="text-gray-600 mb-6">
              Your grocery list has been integrated with our smart shopping list feature for a better experience.
            </p>
            <Button 
              onClick={handleShoppingListClick}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              Go to Shopping List
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            
            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>💡 Tip:</strong> Your shopping list automatically organizes items by store sections and can generate grocery lists from your meal plans!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
