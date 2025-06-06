"use client"

import React, { useState, useRef } from "react"
import { Card } from "../../../app/components/ui/card"
import { Eye, Heart, Bookmark, BookmarkCheck, Play, Pause, Volume2, VolumeX } from "lucide-react"
import { ReelItem } from "../../types/reels"
import { saveReel, unsaveReel, isSaved } from "../../lib/saved-reels-service"
import { useSupabase } from "../../../app/hooks/useSupabase"
import { useEffect } from "react"
import { toast } from "sonner"

interface VideoReelCardProps {
  reel: ReelItem;
}

export function VideoReelCard({ reel }: VideoReelCardProps) {
  const supabase = useSupabase();
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [isHovered, setIsHovered] = useState(false)
  const [isSavedState, setIsSavedState] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const checkSavedStatus = async () => {
      try {
        const saved = await isSaved(reel.id, supabase);
        setIsSavedState(saved);
      } catch (error) {
        console.error('Error checking saved status:', error);
      }
    };
    checkSavedStatus();
  }, [reel.id, supabase]);

  // Format numbers to match the screenshot (2.5M, 895.3K, etc.)
  const formatNumber = (num: number | undefined) => {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  }

  // Get video URL from video versions
  const getVideoUrl = () => {
    // Use more reliable video sources
    const recipeVideos: Record<string, string> = {
      'reel_001': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      'reel_002': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', 
      'reel_003': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      '1': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      '2': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      '3': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      '4': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      '5': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
      '6': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4'
    };
    
    // First try the API provided video URL
    if (reel.video_versions?.length && reel.video_versions[0].url) {
      console.log('Using API video URL:', reel.video_versions[0].url);
      return reel.video_versions[0].url
    }
    
    // Fallback to mapped videos
    const fallbackUrl = recipeVideos[reel.id] || recipeVideos['1'];
    console.log('Using fallback video URL for reel', reel.id, ':', fallbackUrl);
    return fallbackUrl;
  }

  const getThumbnailUrl = () => {
    if (reel.image_versions2?.candidates?.length) {
      return reel.image_versions2.candidates[0].url
    }
    // Use a working thumbnail URL instead of placeholder
    return 'https://via.placeholder.com/300x400/f0f0f0/666666?text=Recipe+Video'
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

  const handleSaveToggle = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isLoading) return;

    setIsLoading(true);
    try {
      if (isSavedState) {
        await unsaveReel(reel.id, supabase);
        setIsSavedState(false);
        toast.success('Reel removed from saved items');
      } else {
        await saveReel(reel, supabase);
        setIsSavedState(true);
        toast.success('Reel saved successfully');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to save reel');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="rounded-lg text-card-foreground shadow-sm overflow-hidden bg-white border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer">
      <div 
        className="relative w-full h-[300px] bg-gray-100"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Video Element */}
        <video
          ref={videoRef}
          src={getVideoUrl()}
          className="w-full h-full object-cover"
          muted={isMuted}
          loop
          playsInline
          preload="metadata"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onError={(e) => {
            console.error('Video error for reel:', reel.id, e);
            console.log('Video src:', getVideoUrl());
          }}
          onLoadStart={() => console.log('Video load start for reel:', reel.id)}
          onLoadedData={() => console.log('Video loaded data for reel:', reel.id)}
        />

        {/* Video Controls Overlay */}
        {isHovered && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <button
              onClick={togglePlay}
              className="text-white p-3 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
            >
              {isPlaying ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6 ml-1" />
              )}
            </button>
          </div>
        )}

        {/* Mute Toggle */}
        {isHovered && (
          <button
            onClick={toggleMute}
            className="absolute bottom-3 right-12 text-white p-2 rounded-full bg-black/50 hover:bg-black/70"
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </button>
        )}

        {/* Text Overlay - Bottom Caption */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-4">
          <div className="text-white">
            <p className="text-sm font-medium leading-tight mb-2">
              {reel.caption_text && reel.caption_text.length > 80 
                ? `${reel.caption_text.substring(0, 80)}...`
                : reel.caption_text || "🍳 Delicious recipe tutorial"
              }
            </p>
          </div>
        </div>

        {/* Bookmark Button - Top Right */}
        <button
          onClick={handleSaveToggle}
          disabled={isLoading}
          className={`absolute top-3 right-3 p-2 rounded-full transition-colors ${
            isSavedState ? 'bg-white text-black' : 'bg-black/50 text-white'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isSavedState ? (
            <BookmarkCheck className="h-4 w-4" fill="currentColor" />
          ) : (
            <Bookmark className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Stats Section - Bottom */}
      <div className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <span className="font-medium">@{reel.user.username}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {formatNumber(reel.view_count)}
            </div>
            <div className="flex items-center gap-1">
              <Heart className="h-3 w-3" />
              {formatNumber(reel.like_count)}
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
} 