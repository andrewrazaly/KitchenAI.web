export interface SavedProfile {
  username: string;
  savedAt: number;
  lastFetched: number;
}

const SAVED_PROFILES_KEY = 'kitchenai_saved_profiles';

export function getSavedProfiles(): SavedProfile[] {
  if (typeof window === 'undefined') return [];
  
  const saved = localStorage.getItem(SAVED_PROFILES_KEY);
  return saved ? JSON.parse(saved) : [];
}

export function saveProfile(username: string): SavedProfile {
  const savedProfiles = getSavedProfiles();
  
  // Check if already saved
  const existingIndex = savedProfiles.findIndex(p => p.username === username);
  if (existingIndex !== -1) {
    // Update last fetched time if already exists
    savedProfiles[existingIndex].lastFetched = Date.now();
    localStorage.setItem(SAVED_PROFILES_KEY, JSON.stringify(savedProfiles));
    return savedProfiles[existingIndex];
  }

  const savedProfile: SavedProfile = {
    username,
    savedAt: Date.now(),
    lastFetched: Date.now()
  };

  savedProfiles.push(savedProfile);
  localStorage.setItem(SAVED_PROFILES_KEY, JSON.stringify(savedProfiles));
  
  return savedProfile;
}

export function removeProfile(username: string): void {
  const savedProfiles = getSavedProfiles();
  const filtered = savedProfiles.filter(profile => profile.username !== username);
  localStorage.setItem(SAVED_PROFILES_KEY, JSON.stringify(filtered));
}

export function isProfileSaved(username: string): boolean {
  const savedProfiles = getSavedProfiles();
  return savedProfiles.some(profile => profile.username === username);
} 