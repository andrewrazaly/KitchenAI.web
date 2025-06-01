"use client"

import { ReelData, ReelItem } from "../../types/reels"
import { ReelCard } from "./reel-card"
import { useState, useMemo } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../app/components/ui/select"
import { Button } from "../../../app/components/ui/button"
import { ArrowDownAZ, ArrowUpAZ } from "lucide-react"

type SortField = "view_count" | "play_count" | "like_count" | "comment_count" | "taken_at"

interface ReelsGridProps {
  data: ReelData;
}

export function ReelsGrid({ data }: ReelsGridProps) {
  const [sortField, setSortField] = useState<SortField>("taken_at")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  // Helper function to safely get the value for sorting
  const getSortValue = (reel: ReelItem, field: SortField): number => {
    if (field === "taken_at") {
      return reel.taken_at || 0
    }

    // Handle the defined optional properties
    const value = reel[field]
    if (typeof value === 'number') {
      return value
    }

    // For view_count specifically, check other possible locations
    if (field === "view_count") {
      // Try different possible paths where view count might be stored
      const possiblePaths = [
        reel.view_count,
        reel.play_count, // Sometimes view_count is stored as play_count
      ]

      // Return the first non-null value found
      const validValue = possiblePaths.find(val => typeof val === 'number')
      if (typeof validValue === 'number') {
        return validValue
      }
    }

    return 0
  }

  const sortedReels = useMemo(() => {
    if (!data?.data?.items?.length) return []

    return [...data.data.items].sort((a, b) => {
      const aValue = getSortValue(a, sortField)
      const bValue = getSortValue(b, sortField)

      if (sortDirection === "asc") {
        return aValue - bValue
      } else {
        return bValue - aValue
      }
    })
  }, [data, sortField, sortDirection])

  const toggleSortDirection = () => {
    setSortDirection(prev => prev === "asc" ? "desc" : "asc")
  }

  if (!data?.data?.items?.length) {
    return (
      <div className="text-center text-muted-foreground p-8">
        No reels found
      </div>
    )
  }

  const sortOptions: { value: SortField; label: string }[] = [
    { value: "taken_at", label: "Date Posted" },
    { value: "view_count", label: "Views" },
    { value: "play_count", label: "Plays" },
    { value: "like_count", label: "Likes" },
    { value: "comment_count", label: "Comments" },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 pb-4">
        <Select
          value={sortField}
          onValueChange={(value) => setSortField(value as SortField)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          onClick={toggleSortDirection}
          className="h-10 w-10"
        >
          {sortDirection === "asc" ? (
            <ArrowUpAZ className="h-4 w-4" />
          ) : (
            <ArrowDownAZ className="h-4 w-4" />
          )}
        </Button>
        <div className="text-sm text-muted-foreground">
          {sortedReels.length} reels
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {sortedReels.map((reel) => (
          <ReelCard key={reel.id} reel={reel} />
        ))}
      </div>
    </div>
  )
}
