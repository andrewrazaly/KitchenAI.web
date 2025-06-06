import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

// Realistic Instagram reel data for recipe content
const RECIPE_REELS_DATABASE = [
  {
    id: 'reel_001',
    pk: '3234567890123456789',
    taken_at: Math.floor(Date.now() / 1000) - 86400, // 1 day ago
    media_type: 2, // Video
    code: 'CuV8fGHJKLM',
    caption_text: '🍝 VIRAL CHICKEN ALFREDO in 15 minutes! Ingredients: 1 lb chicken breast, 12 oz fettuccine, 1 cup heavy cream, 1/2 cup parmesan cheese, 3 cloves garlic, 2 tbsp butter, salt, pepper, Italian seasoning. Perfect for date night! 💕 #chickenalfredo #pasta #easyrecipe #15minutemeal',
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
          url: 'https://via.placeholder.com/720x1280/f0f0f0/666666?text=🍝+Chicken+Alfredo',
          width: 720,
          height: 1280
        }
      ]
    },
    view_count: 2500000,
    play_count: 1800000,
    like_count: 125000,
    comment_count: 3400,
    user: {
      pk: 'chef_maria_official',
      username: 'chef_maria_official',
      full_name: 'Chef Maria Rodriguez',
      profile_pic_url: '/api/placeholder/40/40'
    }
  },
  {
    id: 'reel_002',
    pk: '3234567890123456790',
    taken_at: Math.floor(Date.now() / 1000) - 172800, // 2 days ago
    media_type: 2,
    code: 'CuV8fGHJKLN',
    caption_text: '🥑 AVOCADO TOAST PERFECTION! The secret ingredient? Everything bagel seasoning! You need: 2 ripe avocados, 4 slices sourdough bread, 1 lime, red pepper flakes, everything bagel seasoning, olive oil, sea salt. Game changer! 🔥 #avocadotoast #healthy #breakfast #gamechanging',
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
          url: 'https://via.placeholder.com/720x1280/f0f0f0/666666?text=🥑+Avocado+Toast',
          width: 720,
          height: 1280
        }
      ]
    },
    view_count: 890000,
    play_count: 650000,
    like_count: 45000,
    comment_count: 890,
    user: {
      pk: 'healthy_kitchen_vibes',
      username: 'healthy_kitchen_vibes',
      full_name: 'Sarah | Healthy Kitchen',
      profile_pic_url: '/api/placeholder/40/40'
    }
  },
  {
    id: 'reel_003',
    pk: '3234567890123456791',
    taken_at: Math.floor(Date.now() / 1000) - 259200, // 3 days ago
    media_type: 2,
    code: 'CuV8fGHJKLO',
    caption_text: '🥢 THAI BASIL STIR FRY that will blow your mind! Ingredients: 1 lb ground chicken, 3 cups fresh basil, 3 Thai chilies, 4 cloves garlic, 2 tbsp oyster sauce, 1 tbsp fish sauce, 1 tbsp soy sauce, 1 tsp sugar, jasmine rice. Authentic flavors! 🇹🇭 #thaifood #stirfry #spicy #authentic',
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
          url: 'https://via.placeholder.com/720x1280/f0f0f0/666666?text=🥢+Thai+Stir+Fry',
          width: 720,
          height: 1280
        }
      ]
    },
    view_count: 1200000,
    play_count: 890000,
    like_count: 67000,
    comment_count: 1200,
    user: {
      pk: 'authentic_thai_kitchen',
      username: 'authentic_thai_kitchen',
      full_name: 'Niran | Thai Kitchen',
      profile_pic_url: '/api/placeholder/40/40'
    }
  },
  {
    id: 'reel_004',
    pk: '3234567890123456792',
    taken_at: Math.floor(Date.now() / 1000) - 345600, // 4 days ago
    media_type: 2,
    code: 'CuV8fGHJKLP',
    caption_text: '🧄 VIRAL GARLIC BREAD that broke the internet! Ingredients: 1 french baguette, 6 cloves garlic, 1/2 cup butter, 1/4 cup parsley, 1/2 cup mozzarella, 1/4 cup parmesan, salt. The crunch is INSANE! 🤤 #garlicbread #viral #sidedish #carbs',
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
          url: 'https://via.placeholder.com/720x1280/f0f0f0/666666?text=🧄+Garlic+Bread',
          width: 720,
          height: 1280
        }
      ]
    },
    view_count: 3200000,
    play_count: 2100000,
    like_count: 189000,
    comment_count: 5600,
    user: {
      pk: 'breadmaster_official',
      username: 'breadmaster_official',
      full_name: 'BreadMaster | Carb Life',
      profile_pic_url: '/api/placeholder/40/40'
    }
  },
  {
    id: 'reel_005',
    pk: '3234567890123456793',
    taken_at: Math.floor(Date.now() / 1000) - 432000, // 5 days ago
    media_type: 2,
    code: 'CuV8fGHJKLQ',
    caption_text: '🍓 PROTEIN SMOOTHIE BOWL that tastes like dessert! Ingredients: 1 cup frozen strawberries, 1 banana, 1 scoop vanilla protein powder, 1/2 cup Greek yogurt, 1/4 cup almond milk, granola, fresh berries, coconut flakes. Pure magic! ✨ #smoothiebowl #protein #healthy #dessert',
    original_width: 720,
    original_height: 1280,
    video_versions: [
      {
        type: 101,
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        width: 720,
        height: 1280
      }
    ],
    image_versions2: {
      candidates: [
        {
          url: 'https://via.placeholder.com/720x1280/f0f0f0/666666?text=🍓+Smoothie+Bowl',
          width: 720,
          height: 1280
        }
      ]
    },
    view_count: 750000,
    play_count: 520000,
    like_count: 38000,
    comment_count: 780,
    user: {
      pk: 'fit_foodie_life',
      username: 'fit_foodie_life',
      full_name: 'Emma | Fit Foodie',
      profile_pic_url: '/api/placeholder/40/40'
    }
  },
  {
    id: 'reel_006',
    pk: '3234567890123456794',
    taken_at: Math.floor(Date.now() / 1000) - 518400, // 6 days ago
    media_type: 2,
    code: 'CuV8fGHJKLR',
    caption_text: '🌮 TACO TUESDAY perfection! Slow cooker carnitas recipe: 3 lbs pork shoulder, 1 onion, 4 cloves garlic, 2 tsp cumin, 2 tsp chili powder, 1 tsp oregano, orange juice, lime juice, salt. Set it and forget it! 🔥 #tacotuesday #carnitas #slowcooker #mexican',
    original_width: 720,
    original_height: 1280,
    video_versions: [
      {
        type: 101,
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
        width: 720,
        height: 1280
      }
    ],
    image_versions2: {
      candidates: [
        {
          url: 'https://via.placeholder.com/720x1280/f0f0f0/666666?text=🌮+Taco+Tuesday',
          width: 720,
          height: 1280
        }
      ]
    },
    view_count: 1800000,
    play_count: 1200000,
    like_count: 95000,
    comment_count: 2100,
    user: {
      pk: 'mexican_mama_kitchen',
      username: 'mexican_mama_kitchen',
      full_name: 'Mama Rosa | Mexican Kitchen',
      profile_pic_url: '/api/placeholder/40/40'
    }
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    const count = parseInt(searchParams.get('count') || '20');

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    // Filter reels by username or return all if it's a general search
    let filteredReels = RECIPE_REELS_DATABASE;
    
    if (username !== 'recipe_discovery') {
      // Find reels from specific user or return subset
      const userReels = RECIPE_REELS_DATABASE.filter(reel => 
        reel.user.username.toLowerCase().includes(username.toLowerCase())
      );
      
      if (userReels.length > 0) {
        filteredReels = userReels;
      } else {
        // If no exact user match, return a subset for demo
        filteredReels = RECIPE_REELS_DATABASE.slice(0, Math.min(count, 3));
        // Update usernames to match search for demo
        filteredReels = filteredReels.map(reel => ({
          ...reel,
          user: {
            ...reel.user,
            username: `${username}_recipes`,
            full_name: `${username.charAt(0).toUpperCase() + username.slice(1)} | Recipe Creator`
          }
        }));
      }
    }

    // Limit results
    const results = filteredReels.slice(0, count);

    // Add some randomization to view counts for realism
    const randomizedResults = results.map(reel => ({
      ...reel,
      view_count: reel.view_count + Math.floor(Math.random() * 10000),
      like_count: reel.like_count + Math.floor(Math.random() * 1000),
      comment_count: reel.comment_count + Math.floor(Math.random() * 100)
    }));

    return NextResponse.json({
      data: {
        items: randomizedResults
      },
      status: 'ok',
      user_info: {
        username: username,
        full_name: `${username.charAt(0).toUpperCase() + username.slice(1)} | Recipe Creator`,
        profile_pic_url: '/api/placeholder/150/150',
        is_verified: Math.random() > 0.5
      }
    });

  } catch (error) {
    console.error('Instagram search error:', error);
    return NextResponse.json(
      { error: 'Failed to search Instagram reels' },
      { status: 500 }
    );
  }
} 