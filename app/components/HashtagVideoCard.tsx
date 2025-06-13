"use client"

import React, { useState, useRef } from "react"
import { Card, CardContent } from "./ui/card"
import { Play, Pause, Volume2, VolumeX, Heart, Eye } from "lucide-react"
import { SavedReel } from "../../feature_import_instagram/lib/saved-reels-service"

interface HashtagVideoCardProps {
  reel: SavedReel;
  onClick: () => void;
}

export function HashtagVideoCard({ reel, onClick }: HashtagVideoCardProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [isHovered, setIsHovered] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Mock video URLs for different recipes (like the zucchini breadwich)
  const getVideoUrl = () => {
    // First, try to get the actual video URL from the reel data
    if (reel.video_versions && reel.video_versions.length > 0) {
      const videoUrl = reel.video_versions[0].url;
      console.log('🎬 Using real video URL for hashtag reel', reel.id, ':', videoUrl);
      return videoUrl;
    }
    
    // Fallback to mock video URLs for different recipes
    const recipeVideos: Record<string, string> = {
      '1': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      '2': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      '3': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      '4': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      '5': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
      '6': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4'
    };
    
    const fallbackUrl = recipeVideos[reel.id] || recipeVideos['1'];
    console.log('📼 Using fallback video URL for hashtag reel', reel.id, ':', fallbackUrl);
    return fallbackUrl;
  }

  const getThumbnailUrl = () => {
    return reel.image_versions2?.candidates?.[0]?.url
  }

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation()
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
      setIsPlaying(false)
    } else {
      video.play().catch(console.error)
      setIsPlaying(true)
    }
  }

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation()
    const video = videoRef.current
    if (video) {
      video.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const formatNumber = (num: number | undefined) => {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  }

  return (
    <Card
      className="group cursor-pointer transition-all duration-200 hover:shadow-lg border border-gray-100 bg-white overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <CardContent className="p-0">
        <div className="relative h-96 bg-gray-100">
          {/* Video Element */}
          <video
            ref={videoRef}
            src={getVideoUrl()}
            poster={getThumbnailUrl()}
            className="w-full h-full object-cover"
            muted={isMuted}
            loop
            playsInline
            preload="metadata"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onError={() => console.log('Video error for hashtag reel:', reel.id)}
          />

          {/* Video Controls Overlay */}
          <div className={`absolute inset-0 bg-black/20 flex items-center justify-center transition-opacity ${isHovered || !isPlaying ? 'opacity-100' : 'opacity-0'}`}>
            <button
              onClick={togglePlay}
              className="text-white p-3 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
            >
              {isPlaying ? (
                <Pause className="h-8 w-8" />
              ) : (
                <Play className="h-8 w-8 ml-1" />
              )}
            </button>
          </div>

          {/* Mute Toggle */}
          <button
            onClick={toggleMute}
            className={`absolute bottom-3 right-3 text-white p-2 rounded-full bg-black/50 hover:bg-black/70 transition-opacity ${isHovered ? 'opacity-100' : 'opacity-70'}`}
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </button>

          {/* Text Overlay - Like the saved reels */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
            <div className="text-white">
              <p className="text-sm font-medium leading-tight mb-2">
                {reel.caption_text && reel.caption_text.length > 60 
                  ? `${reel.caption_text.substring(0, 60)}...`
                  : reel.caption_text || "Recipe from @" + (reel.user?.username || 'chef')
                }
              </p>
              {/* Stats like in the saved reels */}
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {formatNumber(reel.view_count)}
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="h-3 w-3" />
                  {formatNumber(reel.like_count)}
                </div>
                <span>@{reel.user?.username || 'chef'}</span>
              </div>
            </div>
          </div>

          {/* No badges or indicators - clean like saved reels */}
        </div>
      </CardContent>
    </Card>
  )
} 