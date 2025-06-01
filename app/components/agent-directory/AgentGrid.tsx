import { AgentCard } from './AgentCard'

interface Agent {
  id: string
  name: string
  description: string
  category: string
  imageUrl: string
}

interface AgentGridProps {
  agents: Agent[]
  onStartChat: (agentId: string) => void
}

export function AgentGrid({ agents, onStartChat }: AgentGridProps) {
  if (agents.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No agents found matching your criteria
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {agents.map((agent) => (
        <AgentCard
          key={agent.id}
          id={agent.id}
          name={agent.name}
          description={agent.description}
          category={agent.category}
          imageUrl={agent.imageUrl}
          onStartChat={onStartChat}
        />
      ))}
    </div>
  )
} 