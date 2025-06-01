"use client"

import { ReelItem } from "../../types/reels"
import { Card, CardContent } from "../../../app/components/ui/card"
import { Eye, Heart, MessageCircle, Play, Pause, Volume2, VolumeX, Bookmark, BookmarkCheck } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { saveReel, unsaveReel, isSaved } from "../../lib/saved-reels-service"
import { useSupabase } from "../../../app/hooks/useSupabase"
import { toast } from "sonner"

interface ReelCardProps {
  reel: ReelItem;
}

export function ReelCard({ reel }: ReelCardProps) {
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

  // Format numbers with fallback to 0
  const formatNumber = (num: number | undefined) => {
    return (num || 0).toLocaleString()
  }

  // Get video URL from video versions
  const getVideoUrl = () => {
    if (reel.video_versions?.length) {
      return reel.video_versions[0].url
    }
    return ''
  }

  // Get thumbnail URL from image versions
  const getThumbnailUrl = () => {
    if (reel.image_versions2?.candidates?.length) {
      return reel.image_versions2.candidates[0].url
    }
    return ''
  }

  // Format date
  const formatDate = (timestamp: number) => {
    try {
      const date = new Date(timestamp * 1000)
      const now = new Date()
      const diffTime = Math.abs(now.getTime() - date.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays < 1) return 'Today'
      if (diffDays === 1) return 'Yesterday'
      if (diffDays < 7) return `${diffDays} days ago`
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
      if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
      return `${Math.floor(diffDays / 365)} years ago`
    } catch {
      return 'Recently'
    }
  }

  const togglePlay = () => {
    if (!videoRef.current) return

    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent video play/pause
    if (!videoRef.current) return
    videoRef.current.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const handleVideoEnd = () => {
    setIsPlaying(false)
    if (videoRef.current) {
      videoRef.current.currentTime = 0
    }
  }

  const handleSaveToggle = async (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent video play/pause
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

  const videoUrl = getVideoUrl()

  return (
    <Card className="overflow-hidden">
      <div 
        className="relative aspect-[9/16] w-full bg-black cursor-pointer group"
        onClick={togglePlay}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <video
          ref={videoRef}
          src={videoUrl}
          poster={getThumbnailUrl()}
          className="w-full h-full object-contain"
          muted={isMuted}
          onEnded={handleVideoEnd}
          playsInline
        />
        
        {/* Video Controls */}
        <div className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity ${isHovered || !isPlaying ? 'opacity-100' : 'opacity-0'}`}>
          <button
            onClick={togglePlay}
            className="text-white p-4 rounded-full hover:bg-white/20 transition-colors"
          >
            {isPlaying ? (
              <Pause className="h-12 w-12" />
            ) : (
              <Play className="h-12 w-12" />
            )}
          </button>
        </div>

        {/* Mute Toggle */}
        <button
          onClick={toggleMute}
          className={`absolute bottom-4 right-4 text-white p-2 rounded-full hover:bg-white/20 transition-colors ${isHovered ? 'opacity-100' : 'opacity-0'}`}
        >
          {isMuted ? (
            <VolumeX className="h-6 w-6" />
          ) : (
            <Volume2 className="h-6 w-6" />
          )}
        </button>
      </div>

      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <img
              src={reel.user.profile_pic_url}
              alt={reel.user.username}
              className="w-6 h-6 rounded-full"
            />
            <span className="text-sm font-medium">{reel.user.username}</span>
          </div>
          <button
            onClick={handleSaveToggle}
            className={`flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isLoading}
          >
            {isSavedState ? (
              <>
                <BookmarkCheck className="h-4 w-4" />
                <span className="text-sm">Saved</span>
              </>
            ) : (
              <>
                <Bookmark className="h-4 w-4" />
                <span className="text-sm">Save</span>
              </>
            )}
          </button>
        </div>
        
        {reel.caption_text && (
          <p className="text-sm line-clamp-2 mb-2">{reel.caption_text}</p>
        )}
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            <span>{formatNumber(reel.view_count)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Play className="h-4 w-4" />
            <span>{formatNumber(reel.play_count)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Heart className="h-4 w-4" />
            <span>{formatNumber(reel.like_count)}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="h-4 w-4" />
            <span>{formatNumber(reel.comment_count)}</span>
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground mt-2">
          {formatDate(reel.taken_at)}
        </div>
      </CardContent>
    </Card>
  )
}
