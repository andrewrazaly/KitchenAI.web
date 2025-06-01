import { InstagramProfile } from "@/types/instagram"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { VerifiedIcon } from "lucide-react"

interface ProfileHeaderProps {
  profile: InstagramProfile['data']['profile']
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  return (
    <div className="flex items-start gap-4 p-4">
      <Avatar className="h-24 w-24">
        <AvatarImage src={profile.profile_pic_url_hd} alt={profile.username} />
        <AvatarFallback>{profile.username[0].toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">{profile.full_name}</h1>
          {profile.is_verified && (
            <VerifiedIcon className="h-5 w-5 text-blue-500" />
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">@{profile.username}</span>
          <Badge variant="secondary">{profile.category}</Badge>
        </div>
        <p className="text-sm">{profile.biography}</p>
        {profile.external_url && (
          <a
            href={profile.external_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-500 hover:underline"
          >
            {profile.external_url}
          </a>
        )}
      </div>
    </div>
  )
}
