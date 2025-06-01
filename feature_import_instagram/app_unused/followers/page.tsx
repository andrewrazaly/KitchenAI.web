"use client"

import { useState } from "react"
import { FollowerCard } from "@/components/followers/follower-card"
import { ProfileCard } from "@/components/followers/profile-card"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import axios from 'axios'
import { FollowerData } from "@/types/followers"

export default function FollowersPage() {
  const [username, setUsername] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [data, setData] = useState<FollowerData | null>(null)
  const [rawResponse, setRawResponse] = useState<any>(null)

  async function fetchFollowers() {
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

      setRawResponse(response.data)
      console.log('Raw API Response:', response.data)

      const followerData: FollowerData = {
        data: {
          audience: {
            follower_count: response.data.data?.follower_count,
            following_count: response.data.data?.following_count,
            country: 'United States'
          },
          profile: {
            username: response.data.data?.username || username,
            full_name: response.data.data?.full_name || '',
            biography: response.data.data?.biography || '',
            profile_pic_url: response.data.data?.profile_pic_url || ''
          }
        }
      }

      console.log('Transformed data:', followerData)
      setData(followerData)
    } catch (err: any) {
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
      })
      setError(err.message || "Failed to fetch follower data")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Instagram Followers</h2>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex gap-4">
            <Input
              placeholder="Enter Instagram username (default: mrbeast)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  fetchFollowers();
                }
              }}
            />
            <Button 
              onClick={fetchFollowers}
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Fetch Followers
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {data && (
            <div className="space-y-4">
              <ProfileCard data={data} />
              <FollowerCard data={data} />
            </div>
          )}

          {/* Debug view */}
          <div className="space-y-2">
            <details className="text-sm" open>
              <summary className="cursor-pointer">Debug Information</summary>
              <div className="mt-2 space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Raw Response:</h4>
                  <pre className="p-4 bg-secondary rounded-lg overflow-auto max-h-[200px] text-xs">
                    {JSON.stringify(rawResponse, null, 2)}
                  </pre>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Transformed Data:</h4>
                  <pre className="p-4 bg-secondary rounded-lg overflow-auto max-h-[200px] text-xs">
                    {JSON.stringify(data, null, 2)}
                  </pre>
                </div>
              </div>
            </details>
          </div>
        </div>
      </Card>
    </div>
  )
}
