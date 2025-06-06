"use client"

import { ReelItem } from "../../types/reels"
import { Card, CardContent } from "../../../app/components/ui/card"
import { Button } from "../../../app/components/ui/button"
import { Badge } from "../../../app/components/ui/badge"
import { Eye, Heart, MessageCircle, Play, Pause, Volume2, VolumeX, Bookmark, BookmarkCheck } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { saveReel, unsaveReel, isSaved } from "../../lib/saved-reels-service"
import { useSupabase } from "../../../app/hooks/useSupabase"
import { toast } from "sonner"
import { trackEvent } from "../../../app/components/GoogleAnalytics"

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
  const [videoError, setVideoError] = useState(false)
  const [simulatedProgress, setSimulatedProgress] = useState(0)
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
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  }

  // Get video URL from video versions - but we'll simulate instead
  const getVideoUrl = () => {
    // Real cooking videos that match the creators and content
    const cookingVideosByCreator: Record<string, string> = {
      '1': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', // Chef Marco
      '2': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', // Foodie Life
      '3': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', // Thai Kitchen
      '4': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', // Tokyo Sweets
      '5': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', // NY Pizza
      '6': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4'  // Homemade Sweets
    };
    
    // Fallback cooking videos with reliable URLs
    const fallbackCookingVideos = [
      'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4'
    ];
    
    if (reel.video_versions?.length && reel.video_versions[0].url) {
      return reel.video_versions[0].url
    }
    
    // Return specific video for each creator's recipe
    return cookingVideosByCreator[reel.id] || fallbackCookingVideos[parseInt(reel.id) % fallbackCookingVideos.length];
  }

  // Get thumbnail URL from image versions
  const getThumbnailUrl = () => {
    if (reel.image_versions2?.candidates?.length) {
      return reel.image_versions2.candidates[0].url
    }
    return '/api/placeholder/400/300'
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
      return date.toLocaleDateString()
    } catch {
      return 'Recently'
    }
  }

  const togglePlay = () => {
    console.log('togglePlay called, current isPlaying:', isPlaying);
    const video = videoRef.current;
    if (!video) return;
    
    // Track video play/pause events
    if (isPlaying) {
      console.log('Pausing video...');
      video.pause();
      setIsPlaying(false);
      trackEvent('video_pause', 'recipe_reels', `reel_${reel.id}`);
    } else {
      console.log('Playing video...');
      video.play().catch(console.error);
      setIsPlaying(true);
      trackEvent('video_play', 'recipe_reels', `reel_${reel.id}`);
    }
  }

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation()
    const video = videoRef.current;
    if (video) {
      video.muted = !isMuted;
      setIsMuted(!isMuted);
      console.log('Toggled mute to:', !isMuted);
      
      // Track mute/unmute events
      trackEvent(isMuted ? 'video_unmute' : 'video_mute', 'recipe_reels', `reel_${reel.id}`);
    }
  }

  const handleVideoEnd = () => {
    setIsPlaying(false)
    setSimulatedProgress(0);
  }

  const handleVideoLoad = () => {
    console.log('Video loaded successfully for reel:', reel.id);
    console.log('Video duration:', videoRef.current?.duration);
    console.log('Video readyState:', videoRef.current?.readyState);
  }

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    console.error('Video failed to load for reel:', reel.id, e);
    const video = e.currentTarget;
    console.error('Video error details:', {
      error: video.error,
      networkState: video.networkState,
      readyState: video.readyState,
      src: video.src
    });
    setVideoError(true);
  }

  const handleVideoPlay = () => {
    console.log('Video play event fired for reel:', reel.id);
    setIsPlaying(true);
  }

  const handleVideoPause = () => {
    console.log('Video pause event fired for reel:', reel.id);
    setIsPlaying(false);
  }

  const handleVideoCanPlay = () => {
    console.log('Video can play for reel:', reel.id);
    setVideoError(false);
  }

  const handleVideoLoadStart = () => {
    console.log('Video load start for reel:', reel.id);
  }

  // Simulate video progress - always active now
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setSimulatedProgress(prev => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 3; // Simulate ~33 second video
        });
      }, 1000);
    } else {
      setSimulatedProgress(0);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleSaveToggle = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isLoading) return;

    setIsLoading(true);
    try {
      if (isSavedState) {
        await unsaveReel(reel.id, supabase);
        setIsSavedState(false);
        toast.success('Reel removed from saved items');
        trackEvent('recipe_unsave', 'recipe_reels', `reel_${reel.id}`);
      } else {
        await saveReel(reel, supabase);
        setIsSavedState(true);
        toast.success('Reel saved successfully');
        trackEvent('recipe_save', 'recipe_reels', `reel_${reel.id}`);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to save reel');
      trackEvent('recipe_save_error', 'recipe_reels', `reel_${reel.id}`);
    } finally {
      setIsLoading(false);
    }
  }

  const videoUrl = getVideoUrl()

  return (
    <Card className="overflow-hidden bg-white border border-gray-200 hover:shadow-md transition-shadow">
      {/* Video/Image Section - Responsive sizing */}
      <div 
        className="relative w-full h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px] xl:h-[800px] bg-gray-100 cursor-pointer group"
        onClick={togglePlay}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Always show image with simulated video overlay */}
        <div className="relative w-full h-full">
          {/* Actual Video Element */}
          <video
            ref={videoRef}
            src={videoUrl}
            poster={getThumbnailUrl()}
            className="w-full h-full object-cover"
            muted={isMuted}
            loop
            playsInline
            preload="metadata"
            onLoadedData={handleVideoLoad}
            onError={handleVideoError}
            onPlay={handleVideoPlay}
            onPause={handleVideoPause}
            onCanPlay={handleVideoCanPlay}
            onLoadStart={handleVideoLoadStart}
            onEnded={handleVideoEnd}
            onTimeUpdate={(e) => {
              const video = e.target as HTMLVideoElement;
              if (video.duration && video.currentTime) {
                const progress = (video.currentTime / video.duration) * 100;
                setSimulatedProgress(progress);
              }
            }}
          />
          
          {/* Fallback Image if Video Fails */}
          {videoError && (
            <img
              src={getThumbnailUrl()}
              alt="Recipe reel preview"
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          
          {/* Video Simulation Overlay */}
          {isPlaying && (
            <div className="absolute inset-0">
              {/* Subtle overlay to indicate "playing" */}
              <div className="absolute inset-0 bg-black/5"></div>
              
              {/* Progress bar */}
              <div className="absolute bottom-0 left-0 right-0 h-2 bg-black/30">
                <div 
                  className="h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-1000 ease-linear"
                  style={{ width: `${simulatedProgress}%` }}
                />
              </div>
              
              {/* Recipe cooking step indicator */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black/30 backdrop-blur-sm rounded-lg px-4 py-2 text-white text-sm flex items-center gap-2">
                  🍳 Cooking step {Math.floor(simulatedProgress / 20) + 1} of 5...
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Playing Indicator */}
        {isPlaying && (
          <div className="absolute top-4 left-4">
            <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              RECIPE DEMO
            </div>
          </div>
        )}
        
        {/* Video Controls Overlay */}
        <div className={`absolute inset-0 bg-black/20 flex items-center justify-center transition-opacity ${isHovered || !isPlaying ? 'opacity-100' : 'opacity-0'}`}>
          <button
            onClick={togglePlay}
            className="text-white p-4 rounded-full bg-black/50 hover:bg-black/70 transition-colors shadow-lg"
          >
            {isPlaying ? (
              <Pause className="h-12 w-12" />
            ) : (
              <Play className="h-12 w-12 ml-1" />
            )}
          </button>
        </div>

        {/* Mute Toggle - Demo version */}
        <button
          onClick={toggleMute}
          className={`absolute bottom-4 right-4 text-white p-3 rounded-full bg-black/50 hover:bg-black/70 transition-opacity shadow-lg ${isHovered ? 'opacity-100' : 'opacity-70'}`}
        >
          {isMuted ? (
            <VolumeX className="h-5 w-5" />
          ) : (
            <Volume2 className="h-5 w-5" />
          )}
        </button>

        {/* Save Button */}
        <div className="absolute top-4 right-4">
          <Button
            onClick={handleSaveToggle}
            disabled={isLoading}
            className={`rounded-full p-3 shadow-lg ${
              isSavedState 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-white hover:bg-gray-100 text-gray-700'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSavedState ? (
              <BookmarkCheck className="h-6 w-6" />
            ) : (
              <Bookmark className="h-6 w-6" />
            )}
          </Button>
        </div>

        {/* Stats Overlay */}
        <div className="absolute bottom-4 left-4 flex gap-3">
          <Badge className="bg-black/70 text-white text-sm px-3 py-1">
            <Eye className="h-4 w-4 mr-1" />
            {formatNumber(reel.view_count)}
          </Badge>
          <Badge className="bg-black/70 text-white text-sm px-3 py-1">
            <Heart className="h-4 w-4 mr-1" />
            {formatNumber(reel.like_count)}
          </Badge>
        </div>

        {/* Demo Mode Indicator */}
        <div className="absolute bottom-16 left-4">
          <Badge className="bg-blue-500 text-white text-xs px-2 py-1">
            Recipe Demo
          </Badge>
        </div>
      </div>

      {/* Content Section - Compact */}
      <CardContent className="p-3">
        {/* User Info */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <img
              src={reel.user.profile_pic_url || '/api/placeholder/32/32'}
              alt={reel.user.username}
              className="w-8 h-8 rounded-full"
              onError={(e) => {
                e.currentTarget.src = '/api/placeholder/32/32';
              }}
            />
            <div>
              <p className="font-medium text-sm">{reel.user.username}</p>
              <p className="text-xs text-gray-500">{formatDate(reel.taken_at)}</p>
            </div>
          </div>
          
          {/* Save Status */}
          {isSavedState && (
            <Badge className="bg-green-100 text-green-800 text-xs">
              Saved
            </Badge>
          )}
        </div>
        
        {/* Caption */}
        {reel.caption_text && (
          <p className="text-sm text-gray-700 line-clamp-2 mb-2">
            {reel.caption_text}
          </p>
        )}

        {/* Save Button */}
        <Button
          onClick={handleSaveToggle}
          disabled={isLoading}
          className={`w-full ${
            isSavedState
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {isSavedState ? 'Removing...' : 'Saving...'}
            </>
          ) : isSavedState ? (
            <>
              <BookmarkCheck className="h-4 w-4 mr-2" />
              Saved
            </>
          ) : (
            <>
              <Bookmark className="h-4 w-4 mr-2" />
              Save Recipe
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
