"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { fetchInstagramReels } from "@/lib/instagram-service"
import { Loader2 } from "lucide-react"

export default function InstagramLibrary() {
  const [username, setUsername] = useState("mrbeast")
  const [reels, setReels] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function loadReels() {
    try {
      setLoading(true)
      setError("")
      const data = await fetchInstagramReels(username)
      setReels(data.reels || [])
    } catch (err) {
      setError("Failed to load Instagram reels. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReels()
  }, [])

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Instagram Content Library</h2>
      </div>
      
      <div className="flex gap-4 items-center">
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
        <div className="text-red-500 text-sm">{error}</div>
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
    </div>
  )
}