"use client"

import { InstagramProfile } from "@/types/instagram"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Link as LinkIcon, Mail, Phone, MapPin, Image } from "lucide-react"

interface ProfileSectionProps {
  data: InstagramProfile
}

export function ProfileOverview({ data }: ProfileSectionProps) {
  if (!data) return null

  return (
    <Card className="p-4 space-y-3">
      <h3 className="font-semibold">Profile Overview</h3>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <img src={data.profile_pic_url_hd} alt={data.username} className="w-16 h-16 rounded-full" />
          <div>
            <p className="font-medium">{data.full_name}</p>
            <p className="text-sm text-muted-foreground">@{data.username}</p>
            {data.is_verified && (
              <Badge variant="secondary" className="gap-1">
                <CheckCircle2 className="w-3 h-3" /> Verified
              </Badge>
            )}
          </div>
        </div>
        <p className="text-sm">{data.biography}</p>
        {data.external_url && (
          <a href={data.external_url} className="text-sm text-primary flex items-center gap-1">
            <LinkIcon className="w-4 h-4" /> {data.external_url}
          </a>
        )}
      </div>
    </Card>
  )
}

export function AudienceInsights({ data }: ProfileSectionProps) {
  if (!data.audience) return null

  return (
    <Card className="p-4 space-y-3">
      <h3 className="font-semibold">Audience Insights</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Followers</p>
          <p className="text-xl font-semibold">{data.audience.follower_count?.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Following</p>
          <p className="text-xl font-semibold">{data.audience.following_count?.toLocaleString()}</p>
        </div>
      </div>
      {data.audience.country && (
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-muted-foreground" />
          <p>{data.audience.country}</p>
        </div>
      )}
    </Card>
  )
}

export function EngagementMetrics({ data }: ProfileSectionProps) {
  if (!data.engagement) return null

  const mentions = data.engagement.biography_with_entities?.entities
    ?.filter(entity => entity.user)
    ?.map(entity => entity.user.username)

  return (
    <Card className="p-4 space-y-3">
      <h3 className="font-semibold">Engagement Metrics</h3>
      <div>
        <p className="text-sm text-muted-foreground">Total Posts</p>
        <p className="text-xl font-semibold">{data.engagement.media_count?.toLocaleString()}</p>
      </div>
      {mentions?.length > 0 && (
        <div>
          <p className="text-sm text-muted-foreground">Mentions</p>
          <div className="flex gap-2 flex-wrap">
            {mentions.map((username: string) => (
              <Badge key={username} variant="secondary">@{username}</Badge>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}

export function BusinessInformation({ data }: ProfileSectionProps) {
  if (!data) return null

  return (
    <Card className="p-4 space-y-3">
      <h3 className="font-semibold">Business Information</h3>
      {data.category && (
        <div>
          <p className="text-sm text-muted-foreground">Category</p>
          <p>{data.category}</p>
        </div>
      )}
      <div className="space-y-2">
        {data.public_email && (
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <p>{data.public_email}</p>
          </div>
        )}
        {data.contact_phone_number && (
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-muted-foreground" />
            <p>{data.contact_phone_number}</p>
          </div>
        )}
      </div>
    </Card>
  )
}

export function ProfileHistory({ data }: ProfileSectionProps) {
  if (!data.growth) return null

  return (
    <Card className="p-4 space-y-3">
      <h3 className="font-semibold">Profile History</h3>
      {data.growth.date_joined && (
        <div>
          <p className="text-sm text-muted-foreground">Joined</p>
          <p>{data.growth.date_joined}</p>
        </div>
      )}
    </Card>
  )
}

export function MediaHighlights({ data }: ProfileSectionProps) {
  if (!data.media_links) return null

  return (
    <Card className="p-4 space-y-3">
      <h3 className="font-semibold">Media & Links</h3>
      {data.media_links.bio_links?.length > 0 && (
        <div>
          <p className="text-sm text-muted-foreground">Links</p>
          <div className="space-y-2">
            {data.media_links.bio_links.map((link: any) => (
              <a 
                key={link.url} 
                href={link.url}
                className="block text-sm text-primary hover:underline flex items-center gap-1"
              >
                <LinkIcon className="w-4 h-4" />
                {link.url}
              </a>
            ))}
          </div>
        </div>
      )}
      {data.media_links.latest_reel_media > 0 && (
        <div className="flex items-center gap-2">
          <Image className="w-4 h-4 text-muted-foreground" />
          <p className="text-sm">Has recent reels</p>
        </div>
      )}
    </Card>
  )
}