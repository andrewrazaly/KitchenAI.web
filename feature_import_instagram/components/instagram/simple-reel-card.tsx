"use client"

import React from "react"
import { ReelItem } from "../../types/reels"
import { Card } from "../../../app/components/ui/card"
import { Badge } from "../../../app/components/ui/badge"
import { Eye, Heart, MessageCircle, Bookmark } from "lucide-react"
import { useState } from "react"

interface ReelCardProps {
  reel: ReelItem;
}

export function SimpleReelCard({ reel }: ReelCardProps) {
  const [isSaved, setIsSaved] = useState(false)

  // Format numbers with fallback to 0
  const formatNumber = (num: number | undefined) => {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  }

  // Get thumbnail URL from image versions
  const getThumbnailUrl = () => {
    if (reel.image_versions2?.candidates?.length) {
      return reel.image_versions2.candidates[0].url
    }
    return '/lemon.svg'
  }

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsSaved(!isSaved)
  }

  return (
    <Card className="overflow-hidden bg-white border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer">
      {/* Image Section */}
      <div className="relative w-full h-[300px] bg-gray-100">
        <img
          src={getThumbnailUrl()}
          alt="Recipe reel"
          className="w-full h-full object-cover"
        />
        
        {/* Text Overlay - Similar to your screenshot */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-4">
          <div className="text-white">
            <p className="text-sm font-medium leading-tight mb-2">
              {reel.caption_text.slice(0, 100)}{reel.caption_text.length > 100 ? '...' : ''}
            </p>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className={`absolute top-3 right-3 p-2 rounded-full transition-colors ${
            isSaved ? 'bg-white text-black' : 'bg-black/50 text-white'
          }`}
        >
          <Bookmark className="h-4 w-4" fill={isSaved ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Stats Section - Simple */}
      <div className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <span className="font-medium">@{reel.user.username}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {formatNumber(reel.view_count)}
            </div>
            <div className="flex items-center gap-1">
              <Heart className="h-3 w-3" />
              {formatNumber(reel.like_count)}
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
} 