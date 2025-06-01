import { ChevronDown } from "lucide-react"

interface FilterDropdownProps {
  value: string
  onChange: (value: string) => void
}

export function FilterDropdown({ value, onChange }: FilterDropdownProps) {
  const categories = [
    "All Agents",
    "Recipe Creation",
    "Meal Planning",
    "Nutrition",
    "Cooking Tips",
    "Kitchen Organization"
  ]

  return (
    <div className="relative">
      <select 
        className="appearance-none bg-white border rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
    </div>
  )
} 