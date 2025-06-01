export interface VideoVersion {
  url: string;
}

export interface ImageCandidate {
  url: string;
}

export interface ImageVersions2 {
  candidates: ImageCandidate[];
}

export interface User {
  username: string;
  profile_pic_url: string;
}

export interface ReelItem {
  id: string;
  taken_at: number;
  pk: string;
  media_type: number;
  code: string;
  caption_text: string;
  video_versions?: {
    type: number;
    url: string;
    width: number;
    height: number;
  }[];
  image_versions2?: {
    candidates: {
      url: string;
      width: number;
      height: number;
    }[];
  };
  original_width: number;
  original_height: number;
  view_count?: number;
  play_count?: number;
  like_count?: number;
  comment_count?: number;
  user: {
    pk: string;
    username: string;
    full_name: string;
    profile_pic_url: string;
  };
  // Recipe properties
  recipeName?: string;
  recipeDescription?: string;
  ingredients?: string[];
  instructions?: string[];
  cookingTime?: string;
  servings?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  cuisine?: string;
  tags?: string[];
}

export interface ReelData {
  data: {
    items: ReelItem[];
  };
} 