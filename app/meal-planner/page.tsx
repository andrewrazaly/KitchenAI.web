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
    <div className="min-h-screen" style={{ backgroundColor: '#f8f8f8' }}>
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2" style={{ color: '#3c3c3c' }}>
              <ChefHat className="h-8 w-8" style={{ color: '#91c11e' }} />
              AI Cooking Assistant
            </h1>
            <p style={{ color: '#888888' }}>
              Tell me what ingredients you have, and I'll help you create delicious meals!
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
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
              <Card className="border border-gray-100 bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2" style={{ color: '#3c3c3c' }}>
                    <Sparkles className="h-5 w-5" style={{ color: '#91c11e' }} />
                    Cooking Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="p-3 rounded-lg border-2" style={{ backgroundColor: '#f8fff0', borderColor: '#91c11e' }}>
                      <h4 className="font-medium mb-1" style={{ color: '#659a41' }}>🥘 Be Specific</h4>
                      <p style={{ color: '#3c3c3c' }}>
                        Tell me exactly what you have: "chicken breast, rice, broccoli" works better than "some meat and vegetables"
                      </p>
                    </div>
                    <div className="p-3 rounded-lg border border-gray-200" style={{ backgroundColor: '#f0f8f0' }}>
                      <h4 className="font-medium mb-1" style={{ color: '#659a41' }}>⏰ Mention Time</h4>
                      <p style={{ color: '#3c3c3c' }}>
                        Let me know if you're in a hurry: "quick 15-minute meal" or "I have time to cook"
                      </p>
                    </div>
                    <div className="p-3 rounded-lg border border-gray-200" style={{ backgroundColor: '#fff8f0' }}>
                      <h4 className="font-medium mb-1" style={{ color: '#ef9d17' }}>🌶️ Share Preferences</h4>
                      <p style={{ color: '#3c3c3c' }}>
                        Tell me about dietary restrictions, spice preferences, or cuisine styles you like
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="border border-gray-100 bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2" style={{ color: '#3c3c3c' }}>
                    <Bot className="h-5 w-5" style={{ color: '#91c11e' }} />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button
                      className="w-full text-white font-semibold rounded-lg transition-all hover:opacity-90"
                      style={{ backgroundColor: '#91c11e' }}
                      onClick={() => showNotification('🥗 Creating a quick healthy recipe suggestion!', 'success')}
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      Quick 15-min meals
                    </Button>
                    <Button
                      className="w-full bg-white border-2 font-semibold rounded-lg transition-all hover:bg-gray-50"
                      style={{ borderColor: '#659a41', color: '#659a41' }}
                      onClick={() => showNotification('🛒 Getting your shopping list ready!', 'info')}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Generate shopping list
                    </Button>
                    <Button
                      className="w-full bg-white border-2 font-semibold rounded-lg transition-all hover:bg-gray-50"
                      style={{ borderColor: '#ef9d17', color: '#ef9d17' }}
                      onClick={() => showNotification('🥘 Planning meals with your ingredients!', 'info')}
                    >
                      <Utensils className="h-4 w-4 mr-2" />
                      Use my inventory
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Stats */}
              <Card className="border border-gray-100 bg-white shadow-sm">
                <CardHeader>
                  <CardTitle style={{ color: '#3c3c3c' }}>Your Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium" style={{ color: '#888888' }}>
                        Meals Planned This Week
                      </span>
                      <span className="font-bold" style={{ color: '#91c11e' }}>7/7</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="h-2 rounded-full" style={{ width: '100%', backgroundColor: '#91c11e' }}></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-lg font-bold" style={{ color: '#3c3c3c' }}>$89</p>
                        <p className="text-xs" style={{ color: '#888888' }}>Saved this month</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold" style={{ color: '#3c3c3c' }}>47</p>
                        <p className="text-xs" style={{ color: '#888888' }}>Recipes tried</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
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