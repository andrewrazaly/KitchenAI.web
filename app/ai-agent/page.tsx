import { ChatInterface } from "../components/chat/ChatInterface";

export default function AIAgentPage() {
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Kitchen AI Assistant</h1>
      <p className="text-gray-600 mb-6">
        Ask me anything about recipes, cooking techniques, meal planning, or kitchen organization!
      </p>
      <ChatInterface />
    </div>
  );
} 