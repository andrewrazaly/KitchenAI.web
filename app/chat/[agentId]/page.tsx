'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function ChatPage() {
  const params = useParams()
  const agentId = params.agentId as string

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link 
          href="/agent-directory" 
          className="flex items-center gap-2 text-blue-500 hover:text-blue-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Directory
        </Link>
      </div>

      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">
          Chat with {agentId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
        </h1>
        
        <div className="bg-gray-100 rounded-lg p-8 text-center">
          <p>Chat functionality coming soon!</p>
          <p className="text-sm text-gray-500 mt-2">This is a placeholder for the chat interface.</p>
        </div>
      </div>
    </main>
  )
} 