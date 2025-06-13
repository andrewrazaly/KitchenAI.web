import { NextRequest, NextResponse } from 'next/server';

interface HashtagReelResponse {
  data: {
    items: Array<{
      id: string;
      pk: string;
      taken_at: number;
      media_type: number;
      code: string;
      caption_text: string;
      original_width: number;
      original_height: number;
      video_versions?: Array<{
        type: number;
        url: string;
        width: number;
        height: number;
      }>;
      image_versions2: {
        candidates: Array<{
          url: string;
          width: number;
          height: number;
        }>;
      };
      view_count?: number;
      play_count?: number;
      like_count: number;
      comment_count: number;
      user: {
        pk: string;
        username: string;
        full_name: string;
        profile_pic_url: string;
      };
    }>;
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const hashtag = searchParams.get('hashtag') || 'healthyrecipes';

  try {
    const response = await fetch(`https://instagram-scraper-api2.p.rapidapi.com/v1/hashtag?hashtag=${hashtag}`, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': '53c70a708bmsh2c3bdfb22325c95p1027fbjsn31b8b6799558',
        'x-rapidapi-host': 'instagram-scraper-api2.p.rapidapi.com'
      }
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data: HashtagReelResponse = await response.json();
    
    // Filter for video content from the last 3 days and take top 4
    const threeDaysAgo = Math.floor(Date.now() / 1000) - (3 * 24 * 60 * 60);
    const recentVideoReels = data.data.items
      .filter(item => 
        item.media_type === 2 && // Video content
        item.taken_at >= threeDaysAgo && // Last 3 days
        item.video_versions && item.video_versions.length > 0 // Has video
      )
      .sort((a, b) => (b.view_count || 0) - (a.view_count || 0)) // Sort by views
      .slice(0, 4); // Top 4

    return NextResponse.json({
      success: true,
      hashtag,
      reels: recentVideoReels,
      count: recentVideoReels.length
    });

  } catch (error) {
    console.error('Error fetching hashtag reels:', error);
    
    // Return mock data as fallback
    const mockReels = [
      {
        id: `mock_${hashtag}_1`,
        pk: '3234567890123456789',
        taken_at: Math.floor(Date.now() / 1000) - 86400,
        media_type: 2,
        code: 'CuV8fGHJKLM',
        caption_text: `🥗 Amazing ${hashtag} recipe! Fresh ingredients and bold flavors come together in this incredible dish. Perfect for meal prep! #${hashtag} #healthy #mealprep`,
        original_width: 720,
        original_height: 1280,
        video_versions: [
          {
            type: 101,
            url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            width: 720,
            height: 1280
          }
        ],
        image_versions2: {
          candidates: [
            {
              url: '/lemon.svg',
              width: 720,
              height: 1280
            }
          ]
        },
        view_count: Math.floor(Math.random() * 1000000) + 100000,
        like_count: Math.floor(Math.random() * 50000) + 5000,
        comment_count: Math.floor(Math.random() * 1000) + 100,
        user: {
          pk: 'healthy_chef_official',
          username: 'healthy_chef_official',
          full_name: 'Healthy Chef',
          profile_pic_url: '/lemon.svg'
        }
      },
      {
        id: `mock_${hashtag}_2`,
        pk: '3234567890123456790',
        taken_at: Math.floor(Date.now() / 1000) - 172800,
        media_type: 2,
        code: 'CuV8fGHJKLN',
        caption_text: `🔥 This ${hashtag} recipe is going viral! So easy and delicious, you'll want to make it every day. Save this post! #${hashtag} #viral #easyrecipe`,
        original_width: 720,
        original_height: 1280,
        video_versions: [
          {
            type: 101,
            url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
            width: 720,
            height: 1280
          }
        ],
        image_versions2: {
          candidates: [
            {
              url: '/lemon.svg',
              width: 720,
              height: 1280
            }
          ]
        },
        view_count: Math.floor(Math.random() * 800000) + 200000,
        like_count: Math.floor(Math.random() * 40000) + 8000,
        comment_count: Math.floor(Math.random() * 800) + 150,
        user: {
          pk: 'foodie_creator',
          username: 'foodie_creator',
          full_name: 'Foodie Creator',
          profile_pic_url: '/lemon.svg'
        }
      },
      {
        id: `mock_${hashtag}_3`,
        pk: '3234567890123456791',
        taken_at: Math.floor(Date.now() / 1000) - 259200,
        media_type: 2,
        code: 'CuV8fGHJKLO',
        caption_text: `✨ Transform your kitchen with this ${hashtag} masterpiece! Quick, healthy, and absolutely delicious. Try it tonight! #${hashtag} #quickmeals #transformation`,
        original_width: 720,
        original_height: 1280,
        video_versions: [
          {
            type: 101,
            url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            width: 720,
            height: 1280
          }
        ],
        image_versions2: {
          candidates: [
            {
              url: '/lemon.svg',
              width: 720,
              height: 1280
            }
          ]
        },
        view_count: Math.floor(Math.random() * 600000) + 150000,
        like_count: Math.floor(Math.random() * 30000) + 6000,
        comment_count: Math.floor(Math.random() * 600) + 120,
        user: {
          pk: 'recipe_master',
          username: 'recipe_master',
          full_name: 'Recipe Master',
          profile_pic_url: '/lemon.svg'
        }
      },
      {
        id: `mock_${hashtag}_4`,
        pk: '3234567890123456792',
        taken_at: Math.floor(Date.now() / 1000) - 172800,
        media_type: 2,
        code: 'CuV8fGHJKLP',
        caption_text: `🍽️ The ultimate ${hashtag} guide! Everything you need to know in 60 seconds. Save for later and share with friends! #${hashtag} #guide #musttry`,
        original_width: 720,
        original_height: 1280,
        video_versions: [
          {
            type: 101,
            url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
            width: 720,
            height: 1280
          }
        ],
        image_versions2: {
          candidates: [
            {
              url: '/lemon.svg',
              width: 720,
              height: 1280
            }
          ]
        },
        view_count: Math.floor(Math.random() * 900000) + 300000,
        like_count: Math.floor(Math.random() * 45000) + 10000,
        comment_count: Math.floor(Math.random() * 900) + 200,
        user: {
          pk: 'kitchen_wizard',
          username: 'kitchen_wizard',
          full_name: 'Kitchen Wizard',
          profile_pic_url: '/lemon.svg'
        }
      }
    ];

    return NextResponse.json({
      success: true,
      hashtag,
      reels: mockReels,
      count: mockReels.length,
      fallback: true
    });
  }
} 