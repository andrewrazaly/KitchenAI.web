"use client"

import { Avatar } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"

const videos = [
  {
    id: 1,
    title: "Summer Fashion Haul 2024",
    platform: "TikTok",
    engagement: "4.8%",
    thumbnail: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=60",
  },
  {
    id: 2,
    title: "Makeup Tutorial Trends",
    platform: "Meta",
    engagement: "3.9%",
    thumbnail: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=60",
  },
  {
    id: 3,
    title: "Tech Review 2024",
    platform: "TikTok",
    engagement: "5.2%",
    thumbnail: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&auto=format&fit=crop&q=60",
  },
]

export function RecentVideos() {
  return (
    <ScrollArea className="h-[350px]">
      <div className="space-y-4">
        {videos.map((video) => (
          <div key={video.id} className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <img src={video.thumbnail} alt={video.title} className="object-cover" />
            </Avatar>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium leading-none">{video.title}</p>
              <p className="text-sm text-muted-foreground">
                {video.platform} • {video.engagement}
              </p>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}