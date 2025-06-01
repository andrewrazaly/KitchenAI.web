'use client'

import { useState } from "react"
import { SearchBar } from "../components/agent-directory/SearchBar"
import { FilterDropdown } from "../components/agent-directory/FilterDropdown"
import { AgentGrid } from "../components/agent-directory/AgentGrid"
import { useRouter } from "next/navigation"

// Move sample data to the page level
const sampleAgents = [
  {
    id: "recipe-master",
    name: "Recipe Master",
    description: "Expert in creating and adapting recipes based on your preferences and dietary requirements.",
    category: "Recipe Creation",
    imageUrl: "/images/agents/recipe-master.jpg"
  },
  {
    id: "meal-planner",
    name: "Meal Planner Pro",
    description: "Helps you plan balanced meals for the week, considering nutrition and your schedule.",
    category: "Meal Planning",
    imageUrl: "/images/agents/meal-planner.jpg"
  },
  {
    id: "nutrition-guide",
    name: "Nutrition Guide",
    description: "Provides detailed nutritional advice and helps you make healthier food choices.",
    category: "Nutrition",
    imageUrl: "/images/agents/nutrition-guide.jpg"
  },
  {
    id: "kitchen-coach",
    name: "Kitchen Coach",
    description: "Your personal cooking instructor, offering tips and techniques to improve your skills.",
    category: "Cooking Tips",
    imageUrl: "/images/agents/kitchen-coach.jpg"
  },
  {
    id: "pantry-manager",
    name: "Pantry Manager",
    description: "Helps you organize your kitchen and manage your inventory efficiently.",
    category: "Kitchen Organization",
    imageUrl: "/images/agents/pantry-manager.jpg"
  },
  {
    id: "diet-specialist",
    name: "Diet Specialist",
    description: "Specialized in creating meal plans for specific dietary needs and restrictions.",
    category: "Nutrition",
    imageUrl: "/images/agents/diet-specialist.jpg"
  }
]

export default function AgentDirectoryPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Agents")

  // Filter agents based on search query and category
  const filteredAgents = sampleAgents.filter(agent => {
    const matchesSearch = 
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = 
      selectedCategory === "All Agents" || agent.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  // Handle chat initiation
  const handleStartChat = (agentId: string) => {
    router.push(`/chat/${agentId}`)
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">AI Agent Directory</h1>
      
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>
        <FilterDropdown value={selectedCategory} onChange={setSelectedCategory} />
      </div>

      <AgentGrid agents={filteredAgents} onStartChat={handleStartChat} />
    </main>
  )
} 