'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { MessageSquare, ArrowLeft, Bot, ChefHat } from "lucide-react";

export default function ChatPage() {
  const router = useRouter();

  const handleBackClick = () => {
    router.push('/');
  };

  const handleAIAgentClick = () => {
    router.push('/ai-agent');
  };

  const handleAgentDirectoryClick = () => {
    router.push('/agent-directory');
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
            <h1 className="text-2xl font-semibold text-gray-900">Chat</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <MessageSquare className="h-16 w-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 mb-2">KitchenAI Chat</h2>
          <p className="text-gray-600">Choose how you'd like to chat with our AI assistants</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* AI Agent Card */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleAIAgentClick}>
            <CardHeader className="text-center">
              <Bot className="h-12 w-12 text-blue-500 mx-auto mb-2" />
              <CardTitle className="text-xl">AI Recipe Assistant</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center mb-4">
                Get personalized recipe recommendations, cooking tips, and meal planning assistance from our main AI chef.
              </p>
              <Button className="w-full bg-blue-500 hover:bg-blue-600">
                Start Chat
              </Button>
            </CardContent>
          </Card>

          {/* Agent Directory Card */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleAgentDirectoryClick}>
            <CardHeader className="text-center">
              <ChefHat className="h-12 w-12 text-green-500 mx-auto mb-2" />
              <CardTitle className="text-xl">Specialized Agents</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center mb-4">
                Connect with specialized cooking agents for specific cuisines, dietary needs, or cooking techniques.
              </p>
              <Button className="w-full bg-green-500 hover:bg-green-600">
                Browse Agents
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Chats Section */}
        <div className="mt-12">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Conversations</h3>
          <Card>
            <CardContent className="py-8">
              <div className="text-center text-gray-500">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No recent conversations</p>
                <p className="text-sm">Start a chat to see your conversation history here</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 