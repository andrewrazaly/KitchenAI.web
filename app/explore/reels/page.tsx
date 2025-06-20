"use client"

import { useState } from "react"
import { ReelsGrid } from "../../../feature_import_instagram/components/instagram/reels-grid"
import { Card } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Button } from "../../components/ui/button"
import { Loader2 } from "lucide-react"
import { ReelData } from "../../../feature_import_instagram/types/reels"

export default function ReelsPage() {
  const [username, setUsername] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [data, setData] = useState<ReelData | null>(null)

  async function fetchReels() {
    try {
      setLoading(true)
      setError("")
      
      const response = await fetch(`/api/instagram/search-reels?username=${encodeURIComponent(username || 'recipe_discovery')}&count=20`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch reels')
      }
      
      const reelData = await response.json()
      setData(reelData as ReelData)
    } catch (err: any) {
      console.error('Error details:', err)
      setError(err.message || "Failed to fetch reels")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Instagram Reels</h2>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex gap-4">
            <Input
              placeholder="Enter Instagram username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  fetchReels();
                }
              }}
            />
            <Button 
              onClick={fetchReels}
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Fetch Reels
            </Button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {data && <ReelsGrid data={data} />}
        </div>
      </Card>
    </div>
  )
} 