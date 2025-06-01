"use client"

import { FollowerData } from "@/types/followers"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User } from "lucide-react"

interface ProfileCardProps {
  data: FollowerData;
}

export function ProfileCard({ data }: ProfileCardProps) {
  if (!data?.data?.profile) {
    return null;
  }

  const { username, full_name, biography, profile_pic_url } = data.data.profile;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          Profile Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-start space-x-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={profile_pic_url} alt={username} />
            <AvatarFallback>{username[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <div>
              <h3 className="text-lg font-semibold">{full_name}</h3>
              <p className="text-sm text-muted-foreground">@{username}</p>
            </div>
            {biography && (
              <p className="text-sm text-muted-foreground">{biography}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
