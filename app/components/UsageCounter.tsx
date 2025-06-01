'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function UsageCounter() {
  const [usage, setUsage] = useState<{ count: number; limit: number; resetAt: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const { loading: authLoading, isSignedIn, user } = useAuth();
  const usageRef = useRef(usage);
  
  // Keep usageRef in sync with usage state
  useEffect(() => {
    usageRef.current = usage;
  }, [usage]);
  
  const resetUsageIfNeeded = useCallback(() => {
    if (!user || !usageRef.current) return;
    
    if (Date.now() >= usageRef.current.resetAt) {
      // Reset the counter if past reset time
      const storageKey = `usage_${user.id}`;
      const tomorrow = new Date();
      tomorrow.setHours(24, 0, 0, 0);
      
      const resetUsage = {
        count: 0,
        limit: 50,
        resetAt: tomorrow.getTime()
      };
      
      localStorage.setItem(storageKey, JSON.stringify(resetUsage));
      setUsage(resetUsage);
    }
  }, [user]); // Only depend on user
  
  useEffect(() => {
    const fetchUsage = async () => {
      try {
        setLoading(true);
        
        if (authLoading || !isSignedIn || !user) {
          setLoading(false);
          return;
        }
        
        // Load usage data from localStorage or initialize
        const storageKey = `usage_${user.id}`;
        const storedUsage = localStorage.getItem(storageKey);
        
        if (storedUsage) {
          const parsedUsage = JSON.parse(storedUsage);
          // Check if we need to reset right away
          if (Date.now() >= parsedUsage.resetAt) {
            const tomorrow = new Date();
            tomorrow.setHours(24, 0, 0, 0);
            
            const resetUsage = {
              count: 0,
              limit: 50,
              resetAt: tomorrow.getTime()
            };
            
            localStorage.setItem(storageKey, JSON.stringify(resetUsage));
            setUsage(resetUsage);
          } else {
            setUsage(parsedUsage);
          }
        } else {
          // Initialize with default values
          const tomorrow = new Date();
          tomorrow.setHours(24, 0, 0, 0); // Set to midnight tomorrow
          
          const newUsage = {
            count: 10, // Mock usage
            limit: 50,
            resetAt: tomorrow.getTime()
          };
          
          localStorage.setItem(storageKey, JSON.stringify(newUsage));
          setUsage(newUsage);
        }
      } catch (error) {
        console.error('Error fetching usage data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsage();
    
    // Set up an interval to check reset time
    const checkResetInterval = setInterval(resetUsageIfNeeded, 60000); // Check every minute
    
    return () => {
      clearInterval(checkResetInterval);
    };
  }, [authLoading, isSignedIn, user, resetUsageIfNeeded]);
  
  // Function to increment usage count (can be called from other components)
  const incrementUsage = useCallback(() => {
    if (!user || !usageRef.current) return;
    
    const newCount = usageRef.current.count + 1;
    const updatedUsage = { ...usageRef.current, count: newCount };
    localStorage.setItem(`usage_${user.id}`, JSON.stringify(updatedUsage));
    setUsage(updatedUsage);
  }, [user]);
  
  if (loading || !usage || !isSignedIn) {
    return null;
  }
  
  // Calculate percentage used
  const percentUsed = Math.min(Math.round((usage.count / usage.limit) * 100), 100);
  
  // Calculate time until reset
  const timeUntilReset = () => {
    const now = Date.now();
    const resetTime = usage.resetAt;
    
    if (now >= resetTime) {
      return 'Resetting soon';
    }
    
    const diffMs = resetTime - now;
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHrs < 1) {
      return 'Less than an hour';
    } else {
      return `${diffHrs} hour${diffHrs !== 1 ? 's' : ''}`;
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-sm font-medium text-navy mb-2">AI Usage Today</h3>
      
      <div className="flex justify-between text-sm mb-1">
        <span>{usage.count} of {usage.limit} requests</span>
        <span className={percentUsed > 80 ? 'text-danger font-medium' : 'text-navy'}>
          {percentUsed}%
        </span>
      </div>
      
      <div className="w-full bg-gray-medium rounded-full h-2">
        <div 
          className={`h-2 rounded-full ${
            percentUsed < 50 
              ? 'bg-success' 
              : percentUsed < 80 
                ? 'bg-warning' 
                : 'bg-danger'
          }`}
          style={{ width: `${percentUsed}%` }}
        ></div>
      </div>
      
      <div className="text-xs text-navy mt-2">
        Resets in: {timeUntilReset()}
      </div>
      
      {percentUsed >= 90 && (
        <div className="mt-2 text-xs text-danger">
          You're almost at your daily limit!
        </div>
      )}
    </div>
  );
} 