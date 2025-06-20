'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Send, Bot, User, ArrowUp, Home, ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!hasInitialized) {
      const initialMessage = searchParams?.get('message');
      
      if (initialMessage) {
        // If there's an initial message from URL, send it immediately
        sendMessageWithContent(initialMessage);
      } else {
        // Add initial greeting message
        const greeting: Message = {
          id: 'greeting',
          role: 'assistant',
          content: `Hey there! 👋 Welcome to your dedicated KitchenAI chat! I'm here to help you with recipes, inventory management, and meal planning. What would you like to explore today? 🍳✨`,
          timestamp: new Date()
        };
        setMessages([greeting]);
      }
      setHasInitialized(true);
    }
  }, [hasInitialized, searchParams]);

  const sendMessageWithContent = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/openai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          userEmail: user?.email || 'anonymous'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Sorry, I'm having trouble connecting right now. Please try again in a moment! 🤖",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim()) return;
    
    await sendMessageWithContent(inputValue);
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
    e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#212121' }}>
      {/* Header */}
      <div 
        className="border-b px-4 py-3 flex items-center justify-between flex-shrink-0"
        style={{ 
          backgroundColor: '#2a2a2a',
          borderBottomColor: '#404040'
        }}
      >
        <div className="flex items-center gap-3">
          <Link 
            href="/"
            className="p-2 rounded-lg transition-colors hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4 text-white" />
          </Link>
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: '#91c11e' }}
          >
            <Bot className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-white">KitchenAI Assistant</h1>
            <p className="text-sm" style={{ color: '#9ca3af' }}>
              Your personal cooking companion
            </p>
          </div>
        </div>
        
        <Link 
          href="/"
          className="px-3 py-1.5 rounded-lg transition-colors hover:bg-white/10"
        >
          <Home className="h-4 w-4 text-white" />
        </Link>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((message) => (
            <div key={message.id} className="flex gap-4">
              {/* Avatar */}
              <div className="flex-shrink-0 mt-1">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ 
                    backgroundColor: message.role === 'assistant' ? '#91c11e' : '#6b7280'
                  }}
                >
                  {message.role === 'assistant' ? (
                    <Bot className="h-4 w-4 text-white" />
                  ) : (
                    <User className="h-4 w-4 text-white" />
                  )}
                </div>
              </div>

              {/* Message Content */}
              <div className="flex-1 min-w-0">
                <div className="mb-2">
                  <span 
                    className="text-sm font-medium"
                    style={{ color: message.role === 'assistant' ? '#91c11e' : '#e5e7eb' }}
                  >
                    {message.role === 'assistant' ? 'KitchenAI Assistant' : 'You'}
                  </span>
                </div>
                <div 
                  className="text-base leading-relaxed whitespace-pre-wrap"
                  style={{ color: '#e5e7eb', lineHeight: '1.6' }}
                >
                  {message.content}
                </div>
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex gap-4">
              <div className="flex-shrink-0 mt-1">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: '#91c11e' }}
                >
                  <Bot className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="mb-2">
                  <span className="text-sm font-medium" style={{ color: '#91c11e' }}>
                    KitchenAI Assistant
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="flex space-x-1">
                    <div 
                      className="w-2 h-2 rounded-full animate-pulse"
                      style={{ backgroundColor: '#6b7280' }}
                    ></div>
                    <div 
                      className="w-2 h-2 rounded-full animate-pulse"
                      style={{ backgroundColor: '#6b7280', animationDelay: '0.2s' }}
                    ></div>
                    <div 
                      className="w-2 h-2 rounded-full animate-pulse"
                      style={{ backgroundColor: '#6b7280', animationDelay: '0.4s' }}
                    ></div>
                  </div>
                  <span className="text-sm ml-2" style={{ color: '#9ca3af' }}>
                    Thinking...
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div 
        className="border-t px-4 py-4 flex-shrink-0"
        style={{ 
          backgroundColor: '#2a2a2a',
          borderTopColor: '#404040'
        }}
      >
        <div className="max-w-3xl mx-auto relative">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about recipes, inventory, or meal planning..."
            disabled={isLoading}
            className="w-full resize-none rounded-xl border px-4 py-3 pr-12 text-base focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
            style={{
              backgroundColor: '#343541',
              borderColor: '#565869',
              color: '#e5e7eb',
              minHeight: '52px',
              maxHeight: '200px'
            }}
            rows={1}
          />
          
          {/* Send Button */}
          <Button
            onClick={sendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="absolute right-2 bottom-2 w-8 h-8 p-0 rounded-full transition-all hover:opacity-80 disabled:opacity-40"
            style={{ 
              backgroundColor: inputValue.trim() ? '#91c11e' : '#565869',
              color: 'white',
              border: 'none'
            }}
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Footer text */}
        <div className="mt-3 text-center">
          <p className="text-xs" style={{ color: '#9ca3af' }}>
            KitchenAI can make mistakes. Consider checking important information.
          </p>
        </div>
      </div>
    </div>
  );
} 