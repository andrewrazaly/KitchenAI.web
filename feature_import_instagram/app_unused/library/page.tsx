"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { fetchInstagramReels } from "@/lib/instagram-service"
import { Loader2 } from "lucide-react"

const videos = [
  {
    id: 1,
    title: "Summer Fashion Haul 2024",
    platform: "TikTok",
    engagement: "4.8%",
    views: "1.2M",
    category: "Fashion",
    thumbnail: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=60",
  },
  {
    id: 2,
    title: "Makeup Tutorial Trends",
    platform: "Meta",
    engagement: "3.9%",
    views: "856K",
    category: "Beauty",
    thumbnail: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=60",
  },
  {
    id: 3,
    title: "Tech Review 2024",
    platform: "TikTok",
    engagement: "5.2%",
    views: "2.1M",
    category: "Technology",
    thumbnail: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&auto=format&fit=crop&q=60",
  },
]

export default function Library() {
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState("engagement")
  const [username, setUsername] = useState("mrbeast")
  const [reels, setReels] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function loadReels() {
    try {
      setLoading(true)
      setError("")
      const data = await fetchInstagramReels({
        username_or_id_or_url: username,
        url_embed_safe: true
      })
      setReels(data.reels || [])
    } catch (err) {
      setError("Failed to load Instagram reels. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Content Library</h2>
      </div>
      <Tabs defaultValue="all" className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <TabsList>
            <TabsTrigger value="all">All Content</TabsTrigger>
            <TabsTrigger value="tiktok">TikTok</TabsTrigger>
            <TabsTrigger value="meta">Meta</TabsTrigger>
            <TabsTrigger value="instagram">Instagram</TabsTrigger>
          </TabsList>
          <div className="flex gap-4">
            <Input
              placeholder="Search videos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-[300px]"
            />
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="engagement">Engagement</SelectItem>
                <SelectItem value="views">Views</SelectItem>
                <SelectItem value="date">Date</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="instagram">
          <div className="flex gap-4 mb-4">
            <Input
              placeholder="Enter Instagram username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="max-w-[300px]"
            />
            <Button 
              onClick={loadReels}
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Load Reels
            </Button>
          </div>

          {error && (
            <div className="text-red-500 text-sm mb-4">{error}</div>
          )}

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reels.map((reel: any) => (
              <Card key={reel.id} className="overflow-hidden">
                <video 
                  src={reel.video_url} 
                  poster={reel.thumbnail_url}
                  controls
                  className="w-full h-[400px] object-cover"
                />
                <div className="p-4">
                  <p className="font-semibold truncate">{reel.caption}</p>
                  <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
                    <span>{reel.likes} likes</span>
                    <span>{reel.comments} comments</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {videos.map((video) => (
              <Card key={video.id} className="overflow-hidden">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="h-48 w-full object-cover"
                />
                <div className="p-4">
                  <h3 className="font-semibold">{video.title}</h3>
                  <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
                    <span>{video.platform}</span>
                    <span>{video.category}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span>Views: {video.views}</span>
                    <span>Engagement: {video.engagement}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tiktok">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {videos
              .filter((video) => video.platform === "TikTok")
              .map((video) => (
                <Card key={video.id} className="overflow-hidden">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="h-48 w-full object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold">{video.title}</h3>
                    <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
                      <span>{video.platform}</span>
                      <span>{video.category}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span>Views: {video.views}</span>
                      <span>Engagement: {video.engagement}</span>
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="meta">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {videos
              .filter((video) => video.platform === "Meta")
              .map((video) => (
                <Card key={video.id} className="overflow-hidden">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="h-48 w-full object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold">{video.title}</h3>
                    <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
                      <span>{video.platform}</span>
                      <span>{video.category}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span>Views: {video.views}</span>
                      <span>Engagement: {video.engagement}</span>
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}