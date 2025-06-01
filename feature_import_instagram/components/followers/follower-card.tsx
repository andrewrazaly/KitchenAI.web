"use client"

import { FollowerData } from "@/types/followers"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Users2, MapPin } from "lucide-react"

interface FollowerCardProps {
  data: FollowerData;
}

export function FollowerCard({ data }: FollowerCardProps) {
  // Detailed null checking
  if (!data?.data?.audience) {
    console.error('Invalid follower data structure:', data)
    return null
  }

  // Ensure numbers are properly handled
  const followerCount = Number(data.data.audience.follower_count) || 0
  const followingCount = Number(data.data.audience.following_count) || 0
  const country = data.data.audience.country || 'Unknown'

  // Log the processed values
  console.log('Processing follower data:', {
    followerCount,
    followingCount,
    country
  })

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Follower Stats
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Followers</p>
            <div className="flex items-center gap-2">
              <Users2 className="h-4 w-4 text-primary" />
              <span className="text-2xl font-bold">
                {followerCount.toLocaleString()}
              </span>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Following</p>
            <div className="flex items-center gap-2">
              <Users2 className="h-4 w-4 text-primary" />
              <span className="text-2xl font-bold">
                {followingCount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{country}</span>
        </div>
      </CardContent>
    </Card>
  )
}
