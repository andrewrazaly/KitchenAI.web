"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import axios from 'axios'
import { InstagramProfile } from "@/types/instagram"
import {
  ProfileOverview,
  AudienceInsights,
  EngagementMetrics,
  BusinessInformation,
  ProfileHistory,
  MediaHighlights
} from "./components/profile-sections"

export default function APIPage() {
  const [username, setUsername] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [data, setData] = useState<InstagramProfile | null>(null)

  async function fetchProfile() {
    try {
      setLoading(true)
      setError("")
      
      const response = await axios.request({
        method: 'GET',
        url: 'https://instagram-scraper-api2.p.rapidapi.com/v1/info',
        params: {
          username_or_id_or_url: username || 'mrbeast'
        },
        headers: {
          'x-rapidapi-key': '53c70a708bmsh2c3bdfb22325c95p1027fbjsn31b8b6799558',
          'x-rapidapi-host': 'instagram-scraper-api2.p.rapidapi.com'
        }
      })

      // Add this to see the exact structure
      console.log('API Response:', response.data)
      
      // Wrap the response in a data object to match component expectations
      setData({ data: response.data })
    } catch (err: any) {
      setError(err.message || "Failed to fetch profile data")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Instagram API</h2>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex gap-4">
            <Input
              placeholder="Enter Instagram username (default: mrbeast)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <Button 
              onClick={fetchProfile}
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Fetch Profile
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Add this to see the raw data */}
          {data && (
            <div className="mb-4">
              <pre className="bg-secondary p-4 rounded-lg overflow-auto max-h-[200px]">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          )}

          {data && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <ProfileOverview data={data} />
              <AudienceInsights data={data} />
              <EngagementMetrics data={data} />
              <BusinessInformation data={data} />
              <ProfileHistory data={data} />
              <MediaHighlights data={data} />
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}