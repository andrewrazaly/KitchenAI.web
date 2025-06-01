import { InstagramProfile } from "@/types/instagram"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users2, Image, Calendar } from "lucide-react"

interface StatsCardProps {
  audience: InstagramProfile['data']['audience']
  engagement: Pick<InstagramProfile['data']['engagement'], 'media_count'>
  growth: Pick<InstagramProfile['data']['growth'], 'date_joined'>
}

export function StatsCard({ audience, engagement, growth }: StatsCardProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Audience</CardTitle>
          <Users2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{audience.follower_count.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            Following {audience.following_count.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground mt-1">{audience.country}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Media Count</CardTitle>
          <Image className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{engagement.media_count.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Total Posts</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Account Age</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{growth.date_joined}</div>
          <p className="text-xs text-muted-foreground">Date Joined</p>
        </CardContent>
      </Card>
    </div>
  )
}
