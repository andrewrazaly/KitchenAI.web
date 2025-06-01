import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2,
  Check,
  RefreshCw,
  MoreHorizontal,
  Users,
  Filter,
  Printer,
  Share2,
  Star,
  Clock,
  TrendingUp
} from "lucide-react";

interface Ingredient {
  name: string;
  amount?: number;
  unit?: string;
  category: string;
  emoji: string;
  checked?: boolean;
}

interface SavedList {
  id: string;
  name: string;
  date: string;
  itemCount: number;
}

interface ShoppingListProps {
  mealPlan?: any;
  userPantry?: string[];
  onUpdatePantry?: (ingredients: string[]) => void;
}

const POPULAR_ITEMS: Ingredient[] = [
  { name: "Milk", category: "dairy", emoji: "🥛" },
  { name: "Bread", category: "bakery", emoji: "🍞" },
  { name: "Onions", category: "produce", emoji: "🧅" },
  { name: "Butter", category: "dairy", emoji: "🧈" },
  { name: "Cheese", category: "dairy", emoji: "🧀" },
  { name: "Tomatoes", category: "produce", emoji: "🍅" },
  { name: "Chicken breast", category: "meat", emoji: "🍗" },
  { name: "Yoghurt", category: "dairy", emoji: "🥛" },
  { name: "Avocado", category: "produce", emoji: "🥑" },
  { name: "Celery", category: "produce", emoji: "🥬" },
];

const RECENT_ITEMS: Ingredient[] = [
  { name: "Eggs", category: "dairy", emoji: "🥚" },
  { name: "Potatoes", category: "produce", emoji: "🥔" },
  { name: "Carrots", category: "produce", emoji: "🥕" },
  { name: "Chicken", category: "meat", emoji: "🍗" },
  { name: "Mushrooms", category: "produce", emoji: "🍄" },
  { name: "Garlic", category: "produce", emoji: "🧄" },
  { name: "Bananas", category: "produce", emoji: "🍌" },
  { name: "Broccoli", category: "produce", emoji: "🥦" },
  { name: "Cucumber", category: "produce", emoji: "🥒" },
  { name: "Salad", category: "produce", emoji: "🥗" },
];

const FAVOURITE_ITEMS: Ingredient[] = [
  { name: "Salmon", category: "seafood", emoji: "🐟" },
  { name: "Greek Yogurt", category: "dairy", emoji: "🥛" },
  { name: "Quinoa", category: "grains", emoji: "🌾" },
  { name: "Spinach", category: "produce", emoji: "🥬" },
  { name: "Sweet Potato", category: "produce", emoji: "🍠" },
  { name: "Almonds", category: "nuts", emoji: "🥜" },
  { name: "Olive Oil", category: "pantry", emoji: "🫒" },
  { name: "Blueberries", category: "produce", emoji: "🫐" },
];

export default function ShoppingList({ mealPlan, userPantry = [], onUpdatePantry }: ShoppingListProps) {
  const [currentList, setCurrentList] = useState<Ingredient[]>([]);
  const [activeTab, setActiveTab] = useState<'Popular' | 'Recent' | 'Favourite'>('Popular');
  const [newItemName, setNewItemName] = useState('');
  const [savedLists, setSavedLists] = useState<SavedList[]>([
    { id: '1', name: 'Oct 19 Shopping list', date: 'Oct 19', itemCount: 5 },
    { id: '2', name: 'Sunday 10', date: 'Sunday', itemCount: 36 },
    { id: '3', name: 'Shopping List', date: 'Recent', itemCount: 1 },
    { id: '4', name: 'Oct 04 Shopping list', date: 'Oct 04', itemCount: 2 },
  ]);

  const getSuggestedItems = () => {
    switch (activeTab) {
      case 'Popular': return POPULAR_ITEMS;
      case 'Recent': return RECENT_ITEMS;
      case 'Favourite': return FAVOURITE_ITEMS;
      default: return POPULAR_ITEMS;
    }
  };

  const addItemToList = (item: Ingredient) => {
    const existingItem = currentList.find(listItem => listItem.name === item.name);
    if (!existingItem) {
      setCurrentList(prev => [...prev, { ...item, checked: false }]);
    }
  };

  const addCustomItem = () => {
    if (newItemName.trim()) {
      const newItem: Ingredient = {
        name: newItemName.trim(),
        category: 'other',
        emoji: '📦',
        checked: false
      };
      addItemToList(newItem);
      setNewItemName('');
    }
  };

  const toggleItem = (index: number) => {
    setCurrentList(prev => prev.map((item, i) => 
      i === index ? { ...item, checked: !item.checked } : item
    ));
  };

  const removeItem = (index: number) => {
    setCurrentList(prev => prev.filter((_, i) => i !== index));
  };

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'Popular': return <TrendingUp className="h-4 w-4" />;
      case 'Recent': return <Clock className="h-4 w-4" />;
      case 'Favourite': return <Star className="h-4 w-4" />;
      default: return null;
    }
  };

  const createNewList = () => {
    const newList: SavedList = {
      id: Date.now().toString(),
      name: `Shopping List ${new Date().toLocaleDateString()}`,
      date: new Date().toLocaleDateString(),
      itemCount: 0
    };
    setSavedLists(prev => [newList, ...prev]);
  };

  return (
    <div className="flex h-full bg-gray-50">
      {/* Left Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-orange-500 mb-4">Shopping List</h2>
          <div className="text-sm text-gray-600 mb-2">{currentList.length} items</div>
        </div>

        {/* Saved Lists */}
        <div className="space-y-3 mb-6">
          {savedLists.map((list) => (
            <div key={list.id} className="p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
              <div className="font-medium text-gray-900">{list.name}</div>
              <div className="text-sm text-gray-500">{list.itemCount} items</div>
            </div>
          ))}
        </div>

        <Button 
          onClick={createNewList}
          className="w-full mb-6 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Create new list
        </Button>

        {/* Food List Section */}
        <div className="border-t pt-6">
          <h3 className="font-semibold text-gray-900 mb-2">Food List</h3>
          <div className="text-sm text-gray-600">0 items</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Shopping List</h1>
          <div className="flex items-center gap-2">
            <Button className="bg-transparent text-gray-600 hover:bg-gray-100 h-8 w-8 p-0">
              <Users className="h-4 w-4" />
            </Button>
            <Button className="bg-transparent text-gray-600 hover:bg-gray-100 h-8 w-8 p-0">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button className="bg-transparent text-gray-600 hover:bg-gray-100 h-8 w-8 p-0">
              <Filter className="h-4 w-4" />
            </Button>
            <Button className="bg-transparent text-gray-600 hover:bg-gray-100 h-8 w-8 p-0">
              <Printer className="h-4 w-4" />
            </Button>
            <Button className="bg-transparent text-gray-600 hover:bg-gray-100 h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Add Item */}
        <div className="mb-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Plus className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Add item"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCustomItem()}
                className="pl-10"
              />
            </div>
            <Button onClick={addCustomItem}>Add</Button>
          </div>
        </div>

        {/* Current Shopping List */}
        {currentList.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Current List ({currentList.length} items)</h2>
            <div className="grid grid-cols-1 gap-2">
              {currentList.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => toggleItem(index)}
                    />
                    <span className="text-xl">{item.emoji}</span>
                    <span className={`${item.checked ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                      {item.name}
                    </span>
                  </div>
                  <Button
                    className="bg-transparent text-gray-600 hover:bg-gray-100 h-8 w-8 p-0"
                    onClick={() => removeItem(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Suggestion Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <div className="flex space-x-8">
            {(['Popular', 'Recent', 'Favourite'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-2 pb-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {getTabIcon(tab)}
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Suggested Items Grid */}
        <div className="grid grid-cols-2 gap-4">
          {getSuggestedItems().map((item, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-white rounded-lg border hover:shadow-sm transition-shadow">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => addItemToList(item)}
                  className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-orange-500 hover:bg-orange-50"
                >
                  <Plus className="h-3 w-3 text-gray-400 hover:text-orange-500" />
                </button>
                <span className="text-gray-900 font-medium">{item.name}</span>
              </div>
              <span className="text-2xl">{item.emoji}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 