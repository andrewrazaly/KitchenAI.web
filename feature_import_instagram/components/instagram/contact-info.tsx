import { InstagramProfile } from "@/types/instagram"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Phone } from "lucide-react"

interface ContactInfoProps {
  profile: Pick<InstagramProfile['data']['profile'], 'business_contact_method' | 'public_email' | 'contact_phone_number'>
}

export function ContactInfo({ profile }: ContactInfoProps) {
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Contact Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {profile.public_email && (
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{profile.public_email}</span>
          </div>
        )}
        {profile.contact_phone_number && (
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{profile.contact_phone_number}</span>
          </div>
        )}
        <div className="text-sm text-muted-foreground">
          Preferred contact method: {profile.business_contact_method}
        </div>
      </CardContent>
    </Card>
  )
}
