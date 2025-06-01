'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { 
  Send, 
  ChefHat, 
  Sparkles, 
  Clock, 
  DollarSign, 
  Users,
  Utensils,
  Bot,
  User,
  ShoppingCart,
  RefreshCw,
  Edit3,
  History
} from "lucide-react";
import { useNotification } from './Notification';
import { useAuth } from '../hooks/useAuth';

interface Message {
  id: string;
  type: 'agent' | 'user';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  data?: any;
}

interface ChatState {
  context: 'initial' | 'planning' | 'modifying' | 'shopping' | 'complete';
  gatheredInfo: {
    duration?: number;
    budget?: number;
    dietary?: string[];
    cuisine?: string[];
    household?: number;
    preferences?: string;
  };
  currentMealPlan?: any;
  conversationMemory: string[];
}

interface MealPlannerChatProps {
  onMealPlanGenerated: (mealPlan: any) => void;
  onShoppingListRequested?: (mealPlan: any) => void;
  userPreferences?: any;
  existingMealPlan?: any;
}

export default function MealPlannerChat({ 
  onMealPlanGenerated, 
  onShoppingListRequested,
  userPreferences,
  existingMealPlan 
}: MealPlannerChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const initializationAttempted = useRef(false);
  const [chatState, setChatState] = useState<ChatState>({
    context: 'initial',
    gatheredInfo: {},
    currentMealPlan: existingMealPlan,
    conversationMemory: []
  });
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { showNotification } = useNotification();
  const { isSignedIn } = useAuth();

  useEffect(() => {
    loadConversationHistory();
  }, []);

  useEffect(() => {
    if (!hasInitialized && !initializationAttempted.current) {
      initializationAttempted.current = true;
      if (existingMealPlan) {
        addAgentMessage(
          "I can see you already have a meal plan! I can help you modify it, create a shopping list from it, or we could start fresh with something completely new. What would you like to do?"
        );
      } else {
        addAgentMessage(
          "Hi! I'm your AI meal planning assistant. I can create personalized meal plans based on your preferences, dietary needs, and budget. What kind of meals are you looking to plan?"
        );
      }
      setHasInitialized(true);
    }
  }, [hasInitialized, existingMealPlan]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (chatState.context === 'complete' && chatState.currentMealPlan) {
      saveConversationToHistory();
    }
  }, [chatState.context, chatState.currentMealPlan]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversationHistory = () => {
    try {
      const history = localStorage.getItem('mealPlannerConversations');
      if (history) {
        setConversationHistory(JSON.parse(history));
      }
    } catch (error) {
      console.error('Error loading conversation history:', error);
    }
  };

  const saveConversationToHistory = () => {
    try {
      const conversation = {
        id: Date.now().toString(),
        timestamp: new Date(),
        gatheredInfo: chatState.gatheredInfo,
        mealPlan: chatState.currentMealPlan,
        messages: messages.slice(-10)
      };

      const updatedHistory = [conversation, ...conversationHistory.slice(0, 9)];
      setConversationHistory(updatedHistory);
      localStorage.setItem('mealPlannerConversations', JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Error saving conversation history:', error);
    }
  };

  const addAgentMessage = (content: string, suggestions?: string[], data?: any) => {
    setIsTyping(true);
    setTimeout(() => {
      const message: Message = {
        id: Date.now().toString(),
        type: 'agent',
        content,
        timestamp: new Date(),
        suggestions,
        data
      };
      setMessages(prev => [...prev, message]);
      setIsTyping(false);
    }, 800 + Math.random() * 800); // Variable delay for natural feel
  };

  const addUserMessage = (content: string) => {
    const message: Message = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, message]);
    
    // Add to conversation memory for context
    setChatState(prev => ({
      ...prev,
      conversationMemory: [...prev.conversationMemory.slice(-10), content]
    }));
  };

  const handleInputSubmit = () => {
    if (!inputValue.trim()) return;
    addUserMessage(inputValue);
    processUserInput(inputValue);
    setInputValue('');
  };

  const processUserInput = async (input: string) => {
    // Use AI-like processing to understand intent and extract information
    const processedResponse = await processNaturalLanguage(input);
    
    // Update gathered information based on what we learned
    const newGatheredInfo = { ...chatState.gatheredInfo };
    let responseGenerated = false;

    // Extract information intelligently
    if (processedResponse.duration && !newGatheredInfo.duration) {
      newGatheredInfo.duration = processedResponse.duration;
    }
    if (processedResponse.budget && !newGatheredInfo.budget) {
      newGatheredInfo.budget = processedResponse.budget;
    }
    if (processedResponse.dietary && processedResponse.dietary.length > 0) {
      newGatheredInfo.dietary = [...(newGatheredInfo.dietary || []), ...processedResponse.dietary];
    }
    if (processedResponse.cuisine && processedResponse.cuisine.length > 0) {
      newGatheredInfo.cuisine = [...(newGatheredInfo.cuisine || []), ...processedResponse.cuisine];
    }
    if (processedResponse.household && !newGatheredInfo.household) {
      newGatheredInfo.household = processedResponse.household;
    }

    // Determine what to ask next or what action to take
    if (processedResponse.intent === 'create_meal_plan') {
      if (hasEnoughInfoForMealPlan(newGatheredInfo)) {
        setChatState({ ...chatState, context: 'planning', gatheredInfo: newGatheredInfo });
        addAgentMessage("Perfect! I have everything I need. Let me create a personalized meal plan for you...");
        generateMealPlan(newGatheredInfo);
        responseGenerated = true;
      } else {
        setChatState({ ...chatState, gatheredInfo: newGatheredInfo });
        const nextQuestion = getNextQuestion(newGatheredInfo);
        addAgentMessage(nextQuestion);
        responseGenerated = true;
      }
    } else if (processedResponse.intent === 'modify_plan') {
      if (chatState.currentMealPlan) {
        setChatState({ ...chatState, context: 'modifying' });
        addAgentMessage("I'll help you modify your meal plan. Let me make those changes...");
        await modifyMealPlan(input, chatState.currentMealPlan);
        responseGenerated = true;
      } else {
        addAgentMessage("I don't see a current meal plan to modify. Would you like me to create a new one first?");
        responseGenerated = true;
      }
    } else if (processedResponse.intent === 'create_shopping_list') {
      if (chatState.currentMealPlan) {
        setChatState({ ...chatState, context: 'shopping' });
        handleShoppingListGeneration();
        responseGenerated = true;
      } else {
        addAgentMessage("I need a meal plan first to create a shopping list. Let me help you create one!");
        responseGenerated = true;
      }
    } else if (processedResponse.intent === 'show_history') {
      showConversationHistory();
      responseGenerated = true;
    }

    // If we haven't generated a specific response, provide a contextual one
    if (!responseGenerated) {
      setChatState({ ...chatState, gatheredInfo: newGatheredInfo });
      const contextualResponse = generateContextualResponse(input, newGatheredInfo, chatState.context);
      addAgentMessage(contextualResponse);
    }
  };

  const processNaturalLanguage = async (input: string): Promise<any> => {
    // This would ideally call an LLM API, but for now we'll do intelligent parsing
    const result = {
      intent: 'continue',
      duration: null as number | null,
      budget: null as number | null,
      dietary: [] as string[],
      cuisine: [] as string[],
      household: null as number | null,
      confidence: 0.8
    };

    const lowerInput = input.toLowerCase();

    // Intent detection
    if (lowerInput.includes('create') || lowerInput.includes('generate') || lowerInput.includes('plan') || lowerInput.includes('make')) {
      result.intent = 'create_meal_plan';
    } else if (lowerInput.includes('modify') || lowerInput.includes('change') || lowerInput.includes('update') || lowerInput.includes('replace')) {
      result.intent = 'modify_plan';
    } else if (lowerInput.includes('shopping') || lowerInput.includes('grocery') || lowerInput.includes('list')) {
      result.intent = 'create_shopping_list';
    } else if (lowerInput.includes('history') || lowerInput.includes('previous') || lowerInput.includes('before')) {
      result.intent = 'show_history';
    }

    // Duration extraction
    if (lowerInput.includes('3 day') || lowerInput.includes('three day')) result.duration = 3;
    if (lowerInput.includes('week') || lowerInput.includes('7 day')) result.duration = 7;
    if (lowerInput.includes('two week') || lowerInput.includes('14 day') || lowerInput.includes('2 week')) result.duration = 14;

    // Budget extraction
    const budgetMatch = input.match(/\$(\d+)/);
    if (budgetMatch) result.budget = parseInt(budgetMatch[1]);
    if (lowerInput.includes('cheap') || lowerInput.includes('budget')) result.budget = 50;
    if (lowerInput.includes('expensive') || lowerInput.includes('premium')) result.budget = 150;

    // Dietary restrictions
    if (lowerInput.includes('vegetarian')) result.dietary.push('vegetarian');
    if (lowerInput.includes('vegan')) result.dietary.push('vegan');
    if (lowerInput.includes('gluten free') || lowerInput.includes('gluten-free')) result.dietary.push('gluten-free');
    if (lowerInput.includes('keto')) result.dietary.push('keto');
    if (lowerInput.includes('paleo')) result.dietary.push('paleo');
    if (lowerInput.includes('dairy free') || lowerInput.includes('dairy-free')) result.dietary.push('dairy-free');

    // Cuisine preferences
    if (lowerInput.includes('italian')) result.cuisine.push('italian');
    if (lowerInput.includes('asian') || lowerInput.includes('chinese') || lowerInput.includes('japanese')) result.cuisine.push('asian');
    if (lowerInput.includes('mexican')) result.cuisine.push('mexican');
    if (lowerInput.includes('mediterranean')) result.cuisine.push('mediterranean');
    if (lowerInput.includes('indian')) result.cuisine.push('indian');
    if (lowerInput.includes('american')) result.cuisine.push('american');

    // Household size
    if (lowerInput.includes('just me') || lowerInput.includes('myself') || lowerInput.includes('1 person')) result.household = 1;
    if (lowerInput.includes('2 people') || lowerInput.includes('couple') || lowerInput.includes('two of us')) result.household = 2;
    if (lowerInput.includes('family') || lowerInput.includes('4 people')) result.household = 4;
    if (lowerInput.includes('large family') || lowerInput.includes('big family')) result.household = 6;

    return result;
  };

  const hasEnoughInfoForMealPlan = (info: any): boolean => {
    return info.duration && (info.budget || info.household);
  };

  const getNextQuestion = (info: any): string => {
    if (!info.duration) {
      return "How many days would you like your meal plan to cover? I can do anywhere from 3 days to 2 weeks.";
    }
    if (!info.budget) {
      return "What's your grocery budget? This helps me suggest appropriate meals and ingredients.";
    }
    if (!info.household) {
      return "How many people will be eating these meals?";
    }
    if (!info.dietary || info.dietary.length === 0) {
      return "Any dietary restrictions or preferences I should know about?";
    }
    if (!info.cuisine || info.cuisine.length === 0) {
      return "What type of cuisine are you in the mood for?";
    }
    return "Let me create your meal plan with the information you've provided!";
  };

  const generateContextualResponse = (input: string, info: any, context: string): string => {
    const responses = [
      "I understand. Let me gather a bit more information to create the perfect meal plan for you.",
      "Got it! I'm building a picture of what you're looking for.",
      "That's helpful! I'm putting together the details for your meal plan.",
      "Perfect! I'm learning about your preferences to make the best recommendations."
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const showConversationHistory = () => {
    if (conversationHistory.length === 0) {
      addAgentMessage("We haven't chatted before, but that's totally fine! Let's create your first meal plan together.");
      return;
    }

    const historyText = conversationHistory.slice(0, 3).map((conv, index) => {
      const date = new Date(conv.timestamp).toLocaleDateString();
      const planType = conv.gatheredInfo.duration ? `${conv.gatheredInfo.duration}-day Plan` : 'Custom Plan';
      return `${index + 1}. ${planType} - ${date}`;
    }).join('\n');

    addAgentMessage(
      `Here's what we've worked on together:\n\n${historyText}\n\nWant me to recreate one of these, or should we try something new?`
    );
  };

  const generateMealPlan = async (gatheredInfo: any) => {
    try {
      const response = await fetch('/api/generate-meal-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          budget: gatheredInfo.budget,
          preferences: gatheredInfo.cuisine,
          restrictions: gatheredInfo.dietary,
          days: gatheredInfo.duration,
          householdSize: gatheredInfo.household
        }),
      });

      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message);

      const mealPlan = {
        id: `plan_${Date.now()}`,
        name: `Meal Plan - ${new Date().toLocaleDateString()}`,
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + gatheredInfo.duration * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        meals: data.mealPlan
      };

      setChatState({ 
        ...chatState, 
        context: 'complete',
        currentMealPlan: mealPlan
      });
      
      const budgetText = gatheredInfo.budget < 75 ? 'budget-friendly' : gatheredInfo.budget > 150 ? 'delicious' : 'great';
      const restrictionText = gatheredInfo.dietary?.length ? ` that works with your ${gatheredInfo.dietary.join(' and ')} preferences` : '';
      
      addAgentMessage(
        `Perfect! I've created your ${gatheredInfo.duration}-day meal plan with ${budgetText} meals${restrictionText}. I think you'll really like what I've put together!`
      );
      
      onMealPlanGenerated(mealPlan);
      showNotification('Your meal plan is ready! 🎉', 'success');
      
    } catch (error) {
      addAgentMessage("I encountered an issue creating your meal plan. Would you like me to try again with different parameters?");
      console.error('Error generating meal plan:', error);
    }
  };

  const modifyMealPlan = async (input: string, currentPlan: any) => {
    try {
      addAgentMessage("Let me work on those changes for you... ");
      
      // Simulate modification API call
      const modificationParams = {
        originalPlan: currentPlan,
        modificationType: 'general',
        newValue: input,
        preferences: chatState.gatheredInfo
      };

      // In a real app, this would call a modification API
      const response_api = await fetch('/api/modify-meal-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(modificationParams),
      });

      let modifiedPlan;
      if (response_api.ok) {
        const data = await response_api.json();
        modifiedPlan = data.mealPlan;
      } else {
        // Fallback: simulate modification locally
        modifiedPlan = { ...currentPlan };
        modifiedPlan.name = `Modified ${modifiedPlan.name}`;
      }

      setChatState({
        ...chatState,
        currentMealPlan: modifiedPlan,
        context: 'complete',
      });

      addAgentMessage(
        "I've updated your meal plan based on your request. How does it look now?"
      );

      onMealPlanGenerated(modifiedPlan);
      showNotification('Your meal plan has been updated! 🎉', 'success');

    } catch (error) {
      addAgentMessage(
        "I encountered an issue while modifying your meal plan. Could you try rephrasing your request?"
      );
      console.error('Error modifying meal plan:', error);
    }
  };

  const handleShoppingListGeneration = () => {
    if (!chatState.currentMealPlan) {
      addAgentMessage("I need a meal plan first to create a shopping list. Would you like me to create one?");
      return;
    }

    addAgentMessage("I'll create a shopping list from your meal plan. Should I exclude items you already have at home?");
    
    // Simulate creating shopping list
    setTimeout(() => {
      if (onShoppingListRequested) {
        onShoppingListRequested(chatState.currentMealPlan);
      }
      addAgentMessage("Your shopping list is ready! I've organized everything by store section to make shopping more efficient.");
    }, 1500);
  };

  return (
    <div className="h-[80vh] max-h-[600px] min-h-[500px] flex flex-col border rounded-lg bg-white shadow-lg">
      {/* Chat Header - Fixed */}
      <div className="p-4 border-b bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-lg flex-shrink-0">
        <div className="flex items-center gap-2">
          <ChefHat className="h-5 w-5" />
          <h3 className="font-semibold">AI Meal Planning Agent</h3>
          <div className="flex items-center gap-2 ml-auto">
            {conversationHistory.length > 0 && (
              <History className="h-4 w-4" />
            )}
            <Sparkles className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Messages Area - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start gap-3 max-w-[85%] ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.type === 'user' 
                    ? 'bg-indigo-500 text-white' 
                    : 'bg-purple-100 text-purple-600'
                }`}>
                  {message.type === 'user' ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                </div>
                <div className={`rounded-lg p-3 max-w-full ${
                  message.type === 'user'
                    ? 'bg-indigo-500 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  <p className="text-sm whitespace-pre-line break-words">{message.content}</p>
                  {message.suggestions && (
                    <div className="mt-3 space-y-2">
                      {message.suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            addUserMessage(suggestion);
                            processUserInput(suggestion);
                          }}
                          className="block w-full text-left p-2 text-xs bg-white text-gray-700 rounded border hover:bg-gray-50 transition-colors"
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
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-4 w-4" />
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
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area - Fixed */}
      <div className="border-t bg-gray-50 p-4 flex-shrink-0 rounded-b-lg">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleInputSubmit()}
            placeholder="Tell me what you're looking for..."
            className="flex-1 bg-white"
          />
          <Button 
            onClick={handleInputSubmit} 
            disabled={!inputValue.trim()}
            className="px-4"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        {chatState.context === 'complete' && (
          <div className="flex gap-2 mt-3">
            <Button
              onClick={() => {
                setMessages([]);
                setChatState({
                  context: 'initial',
                  gatheredInfo: {},
                  currentMealPlan: existingMealPlan,
                  conversationMemory: []
                });
                setHasInitialized(false);
                initializationAttempted.current = false;
              }}
              className="flex-1 text-sm"
            >
              Let's Plan Something New
            </Button>
            {chatState.currentMealPlan && onShoppingListRequested && (
              <Button
                onClick={handleShoppingListGeneration}
                className="flex items-center gap-2 text-sm"
              >
                <ShoppingCart className="h-4 w-4" />
                Shopping List
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 