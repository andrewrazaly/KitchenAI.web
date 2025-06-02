'use client';

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useRouter } from 'next/navigation';
import MealPlannerSkeleton from '../components/MealPlannerSkeleton';
import ErrorBoundary, { useErrorHandler } from '../components/ErrorBoundary';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { 
  Send, 
  ChefHat, 
  Sparkles, 
  Clock, 
  Utensils, 
  ShoppingCart, 
  Bot,
  User,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { useNotification } from '../components/Notification';

interface Message {
  id: string;
  type: 'agent' | 'user';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

function SimpleMealPlannerChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const { showNotification } = useNotification();
  const { handleError } = useErrorHandler();

  useEffect(() => {
    if (!hasInitialized) {
      addAgentMessage(
        "Hi! I'm your AI cooking assistant! 👨‍🍳 Tell me what ingredients you have in your fridge, pantry, or kitchen, and I'll suggest delicious recipes you can make with them. What do you have available?",
        [
          "I have chicken, rice, and vegetables",
          "Show me pasta recipes",
          "I have eggs and bread",
          "What can I make with leftovers?"
        ]
      );
      setHasInitialized(true);
    }
  }, [hasInitialized]);

  const addAgentMessage = (content: string, suggestions?: string[]) => {
    setIsTyping(true);
    setTimeout(() => {
      const message: Message = {
        id: Date.now().toString(),
        type: 'agent',
        content,
        timestamp: new Date(),
        suggestions
      };
      setMessages(prev => [...prev, message]);
      setIsTyping(false);
    }, 800 + Math.random() * 800);
  };

  const addUserMessage = (content: string) => {
    const message: Message = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, message]);
  };

  const handleInputSubmit = async () => {
    if (!inputValue.trim()) return;
    
    const userInput = inputValue;
    addUserMessage(userInput);
    setInputValue('');
    
    // Process the user's input and generate AI response
    await processUserInput(userInput);
  };

  const processUserInput = async (input: string) => {
    try {
      setIsTyping(true);
      
      // Call the AI API to get recipe suggestions
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          context: 'cooking_assistant',
          systemPrompt: `You are a helpful cooking assistant. The user will tell you what ingredients they have, and you should suggest recipes they can make. Be friendly, practical, and give clear cooking instructions. Focus on:
          1. Recipes they can make with available ingredients
          2. Simple cooking techniques
          3. Substitutions if they're missing something
          4. Cooking tips and timing
          5. Keep responses conversational and helpful`
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      
      // Generate contextual suggestions based on the conversation
      const suggestions = generateSuggestions(input);
      
      addAgentMessage(data.response, suggestions);
      
    } catch (error) {
      console.error('Error processing input:', error);
      addAgentMessage(
        "I'm having trouble connecting right now. But I can still help! Based on what you mentioned, here are some general cooking tips: Try combining your proteins with grains and vegetables, season well, and don't be afraid to experiment with herbs and spices you have on hand!",
        [
          "Tell me more about what you have",
          "I need cooking tips",
          "How long should I cook this?",
          "What seasonings work well?"
        ]
      );
    }
  };

  const generateSuggestions = (input: string): string[] => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('chicken')) {
      return [
        "How should I season the chicken?",
        "What sides go with chicken?",
        "How long to cook chicken?",
        "I have more ingredients to add"
      ];
    } else if (lowerInput.includes('pasta') || lowerInput.includes('noodles')) {
      return [
        "What sauce should I make?",
        "I have vegetables to add",
        "How much pasta per person?",
        "Tell me about cooking times"
      ];
    } else if (lowerInput.includes('eggs')) {
      return [
        "Show me egg cooking techniques",
        "What goes well with eggs?",
        "I want breakfast ideas",
        "How to make perfect scrambled eggs?"
      ];
    } else if (lowerInput.includes('vegetables') || lowerInput.includes('veggies')) {
      return [
        "How to roast vegetables?",
        "What seasonings for vegetables?",
        "I want a vegetarian meal",
        "How to make vegetables tasty?"
      ];
    } else {
      return [
        "I have more ingredients",
        "Give me cooking tips",
        "How long will this take?",
        "What else can I make?"
      ];
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
  };

  const clearChat = () => {
    setMessages([]);
    setHasInitialized(false);
  };

  return (
    <div className="h-[80vh] max-h-[600px] min-h-[500px] flex flex-col border rounded-lg bg-white shadow-lg">
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-indigo-500 to-purple-600 rounded-t-lg flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <ChefHat className="h-5 w-5" />
            <h3 className="font-semibold">AI Cooking Assistant</h3>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={clearChat}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 px-3 py-1 text-sm"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-start gap-3 max-w-[85%] ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.type === 'user' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {message.type === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>
              <div className={`rounded-lg p-3 max-w-full ${
                message.type === 'user' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-900'
              }`}>
                <p className="whitespace-pre-wrap">{message.content}</p>
                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {message.suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="block w-full text-left px-3 py-2 text-sm bg-white/10 hover:bg-white/20 rounded border border-white/20 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-start gap-3 max-w-[85%]">
              <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <div className="bg-gray-100 rounded-lg p-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t bg-gray-50 p-4 flex-shrink-0 rounded-b-lg">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Tell me what ingredients you have..."
            onKeyPress={(e) => e.key === 'Enter' && handleInputSubmit()}
            className="flex-1"
          />
          <Button 
            onClick={handleInputSubmit}
            disabled={!inputValue.trim() || isTyping}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function MealPlannerContent() {
  const { isSignedIn, loading: authLoading } = useAuth();
  const { showNotification } = useNotification();
  const router = useRouter();

  // Show loading state while auth is loading
  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-96"></div>
            </div>
          </div>
          <MealPlannerSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <ChefHat className="h-8 w-8 text-indigo-600" />
            AI Cooking Assistant
          </h1>
          <p className="text-gray-600">
            Tell me what ingredients you have, and I'll help you create delicious meals!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chat Interface */}
          <div className="lg:col-span-2">
            <ErrorBoundary>
              <Suspense fallback={<MealPlannerSkeleton />}>
                <SimpleMealPlannerChat />
              </Suspense>
            </ErrorBoundary>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Cooking Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-1">🥘 Be Specific</h4>
                    <p className="text-blue-800">
                      Tell me exactly what you have: "chicken breast, rice, broccoli" works better than "some meat and vegetables"
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-1">⏰ Mention Time</h4>
                    <p className="text-green-800">
                      Let me know if you're in a hurry: "quick 15-minute meal" or "I have time to cook"
                    </p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <h4 className="font-medium text-purple-900 mb-1">🌶️ Share Preferences</h4>
                    <p className="text-purple-800">
                      Tell me about dietary restrictions, spice preferences, or cuisine styles you like
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  onClick={() => router.push('/inventory')}
                  className="w-full justify-start"
                >
                  📦 Check My Inventory
                </Button>
                <Button 
                  onClick={() => router.push('/recipes')}
                  className="w-full justify-start"
                >
                  📖 Browse Recipes
                </Button>
                <Button 
                  onClick={() => router.push('/recipes/recipe-reels')}
                  className="w-full justify-start"
                >
                  🎥 Recipe Videos
                </Button>
              </CardContent>
            </Card>

            {/* Example Queries */}
            <Card>
              <CardHeader>
                <CardTitle>💡 Try Asking</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• "I have chicken, onions, and rice"</li>
                  <li>• "Quick pasta recipe with what I have"</li>
                  <li>• "Vegetarian meal with eggs and vegetables"</li>
                  <li>• "What can I make with leftovers?"</li>
                  <li>• "Healthy breakfast ideas"</li>
                  <li>• "30-minute dinner recipes"</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MealPlannerPage() {
  return (
    <ErrorBoundary>
      <MealPlannerContent />
    </ErrorBoundary>
  );
} 