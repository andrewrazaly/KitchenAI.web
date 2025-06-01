import axios from 'axios';

interface InstagramParams {
  username_or_id_or_url: string;
  pagination_token?: string;
  url_embed_safe?: boolean;
}

const instagramApi = axios.create({
  baseURL: 'https://instagram-scraper-api2.p.rapidapi.com/v1.2',
  headers: {
    'x-rapidapi-key': '53c70a708bmsh2c3bdfb22325c95p1027fbjsn31b8b6799558',
    'x-rapidapi-host': 'instagram-scraper-api2.p.rapidapi.com'
  }
});

export async function fetchInstagramReels(params: InstagramParams) {
  try {
    console.log('Fetching reels with params:', params);
    const response = await instagramApi.get('/reels', { params });
    console.log('Raw API Response:', JSON.stringify(response.data, null, 2));
    
    // Add more detailed response validation
    if (!response.data) {
      throw new Error('Empty response from API');
    }

    if (response.data.status === 'fail') {
      throw new Error(response.data.message || 'API request failed');
    }

    // Check if we have data and items
    if (!response.data.data || !Array.isArray(response.data.data.items)) {
      console.warn('No items found in API response:', response.data);
      return {
        data: {
          items: []
        }
      };
    }

    // Transform the response to match our ReelData structure
    const transformedData = {
      data: {
        items: response.data.data.items.map((item: any, index: number) => {
          console.log(`Processing item ${index}:`, {
            id: item.id,
            is_video: item.is_video,
            video_duration: item.video_duration,
            has_video_versions: !!item.video_versions,
            has_image_versions: !!item.image_versions,
            caption: item.caption?.text || 'No caption'
          });

          // Generate a unique ID if missing
          const id = item.id || item.pk || `reel_${Date.now()}_${index}`;

          // Get video URL - try multiple possible locations
          let videoUrl = '';
          if (item.video_versions && Array.isArray(item.video_versions) && item.video_versions.length > 0) {
            videoUrl = item.video_versions[0].url;
          } else if (item.video_url) {
            videoUrl = item.video_url;
          }

          // Get thumbnail URL - try multiple possible locations
          let thumbnailUrl = '';
          if (item.image_versions2?.candidates && Array.isArray(item.image_versions2.candidates) && item.image_versions2.candidates.length > 0) {
            thumbnailUrl = item.image_versions2.candidates[0].url;
          } else if (item.image_versions?.items && Array.isArray(item.image_versions.items) && item.image_versions.items.length > 0) {
            thumbnailUrl = item.image_versions.items[0].url;
          } else if (item.thumbnail_url) {
            thumbnailUrl = item.thumbnail_url;
          }

          // Get user information
          const user = {
            pk: item.user?.id || item.user?.pk || '',
            username: item.user?.username || params.username_or_id_or_url || '',
            full_name: item.user?.full_name || '',
            profile_pic_url: item.user?.profile_pic_url || ''
          };

          // Get caption text
          const captionText = item.caption?.text || item.caption_text || '';

          // Get engagement metrics
          const viewCount = item.view_count || item.play_count || 0;
          const playCount = item.play_count || item.view_count || 0;
          const likeCount = item.like_count || 0;
          const commentCount = item.comment_count || 0;

          // Get timestamp
          const takenAt = item.taken_at || item.device_timestamp || Math.floor(Date.now() / 1000);

          return {
            id: String(id),
            taken_at: takenAt,
            pk: String(id),
            media_type: item.media_type || (item.is_video ? 2 : 1),
            code: item.code || '',
            caption_text: captionText,
            video_versions: videoUrl ? [{
              type: 101,
              url: videoUrl,
              width: item.original_width || 1080,
              height: item.original_height || 1920
            }] : [],
            image_versions2: thumbnailUrl ? {
              candidates: [{
                url: thumbnailUrl,
                width: item.original_width || 1080,
                height: item.original_height || 1920
              }]
            } : undefined,
            original_width: item.original_width || 1080,
            original_height: item.original_height || 1920,
            view_count: viewCount,
            play_count: playCount,
            like_count: likeCount,
            comment_count: commentCount,
            user: user
          };
        })
      }
    };

    console.log('Transformed Data:', JSON.stringify(transformedData, null, 2));
    console.log(`Successfully transformed ${transformedData.data.items.length} items`);
    
    return transformedData;
  } catch (error: any) {
    console.error('Error fetching reels:', error);
    
    // Provide more specific error messages
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      
      if (status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a few minutes.');
      } else if (status === 404) {
        throw new Error('Instagram user not found. Please check the username and try again.');
      } else if (status === 403) {
        throw new Error('Access denied. The account might be private or restricted.');
      } else {
        throw new Error(`API Error (${status}): ${data?.message || error.message}`);
      }
    } else if (error.request) {
      throw new Error('Network error. Please check your internet connection and try again.');
    } else {
      throw new Error(error.message || 'Failed to fetch Instagram reels');
    }
  }
}