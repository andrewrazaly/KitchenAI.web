import { InstagramProfile } from "@/types/instagram"
import { ProfileHeader } from "./profile-header"
import { StatsCard } from "./stats-card"
import { ContactInfo } from "./contact-info"

interface ProfileViewProps {
  data: InstagramProfile['data']
}

export function ProfileView({ data }: ProfileViewProps) {
  return (
    <div className="space-y-6">
      <ProfileHeader profile={data.profile} />
      <StatsCard 
        audience={data.audience}
        engagement={{ media_count: data.engagement.media_count }}
        growth={{ date_joined: data.growth.date_joined }}
      />
      <ContactInfo profile={data.profile} />
    </div>
  )
}
