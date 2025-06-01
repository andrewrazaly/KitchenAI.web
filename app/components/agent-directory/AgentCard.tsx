import Image from 'next/image'
import { MessageSquare } from 'lucide-react'

interface AgentCardProps {
  id: string
  name: string
  description: string
  category: string
  imageUrl: string
  onStartChat: (agentId: string) => void
}

export function AgentCard({ id, name, description, category, imageUrl, onStartChat }: AgentCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48">
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{name}</h3>
        <p className="text-sm text-gray-600 mb-3">{description}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            {category}
          </span>
          <button 
            onClick={() => onStartChat(id)}
            className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            <MessageSquare className="h-4 w-4" />
            Start Chat
          </button>
        </div>
      </div>
    </div>
  )
} 