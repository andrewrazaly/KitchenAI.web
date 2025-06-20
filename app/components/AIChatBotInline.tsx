'use client';

import { useState, useRef } from 'react';
import { Button } from './ui/button';
import { ArrowUp } from 'lucide-react';

interface AIChatBotInlineProps {
  className?: string;
}

export default function AIChatBotInline({ className = '' }: AIChatBotInlineProps) {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const sendMessage = async () => {
    if (!inputValue.trim()) return;

    // Open dedicated chat page in new tab
    const chatUrl = `/chat?message=${encodeURIComponent(inputValue.trim())}`;
    window.open(chatUrl, '_blank');
    
    // Reset input
    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  return (
    <div className={`w-full max-w-4xl mx-auto ${className}`}>
      {/* Main Chat Interface - Seamless Design */}
      <div className="flex flex-col items-center justify-center">
        
        {/* Title */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-semibold mb-2" style={{ color: '#2d2d2d', letterSpacing: '0.3px' }}>
            What can I help with?
          </h2>
        </div>

        {/* Input Area - OpenAI Style */}
        <div className="w-full max-w-3xl relative">
          <div className="relative">
            {/* Animated placeholder suggestions */}
            {inputValue === '' && (
              <div className="absolute left-4 top-4 pointer-events-none select-none">
                <div className="text-gray-400 text-base transition-transform ease-in-out duration-500">
                  <div className="overflow-hidden text-ellipsis whitespace-nowrap transition-opacity duration-500">
                    Help me plan meals for this week
                  </div>
                </div>
              </div>
            )}
            
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder=""
              className="w-full resize-none rounded-3xl border px-6 py-4 pr-14 text-base focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
              style={{
                backgroundColor: '#f9f9f9',
                borderColor: '#e5e7eb',
                color: '#374151',
                minHeight: '56px',
                maxHeight: '120px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
              rows={1}
            />
            
            {/* Send Button */}
            <Button
              onClick={sendMessage}
              disabled={!inputValue.trim()}
              className="absolute right-3 bottom-3 w-9 h-9 p-0 rounded-full transition-all hover:opacity-80 disabled:opacity-40"
              style={{ 
                backgroundColor: inputValue.trim() ? '#91c11e' : '#d1d5db',
                color: 'white',
                border: 'none'
              }}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="mt-6 w-full max-w-2xl">
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => {
                const chatUrl = `/chat?message=${encodeURIComponent("Help me find healthy recipes")}`;
                window.open(chatUrl, '_blank');
              }}
              className="px-4 py-2 rounded-full border text-sm transition-all hover:bg-gray-50"
              style={{ 
                borderColor: '#e5e7eb',
                color: '#6b7280',
                backgroundColor: 'transparent'
              }}
            >
              🥗 Find Healthy Recipes
            </button>
            <button
              onClick={() => {
                const chatUrl = `/chat?message=${encodeURIComponent("Help me manage my inventory")}`;
                window.open(chatUrl, '_blank');
              }}
              className="px-4 py-2 rounded-full border text-sm transition-all hover:bg-gray-50"
              style={{ 
                borderColor: '#e5e7eb',
                color: '#6b7280',
                backgroundColor: 'transparent'
              }}
            >
              📦 Manage Inventory
            </button>
            <button
              onClick={() => {
                const chatUrl = `/chat?message=${encodeURIComponent("Generate a shopping list for me")}`;
                window.open(chatUrl, '_blank');
              }}
              className="px-4 py-2 rounded-full border text-sm transition-all hover:bg-gray-50"
              style={{ 
                borderColor: '#e5e7eb',
                color: '#6b7280',
                backgroundColor: 'transparent'
              }}
            >
              🛒 Shopping List
            </button>
            <button
              onClick={() => {
                const chatUrl = `/chat?message=${encodeURIComponent("Help me plan meals for the week")}`;
                window.open(chatUrl, '_blank');
              }}
              className="px-4 py-2 rounded-full border text-sm transition-all hover:bg-gray-50"
              style={{ 
                borderColor: '#e5e7eb',
                color: '#6b7280',
                backgroundColor: 'transparent'
              }}
            >
              🗓️ Meal Planning
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 