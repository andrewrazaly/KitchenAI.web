#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bold: '\x1b[1m',
  reset: '\x1b[0m'
};

const log = (color, message) => console.log(`${color}${message}${colors.reset}`);

// Base URL for testing
const BASE_URL = 'http://localhost:3000';

// Test pages and their expected features
const testPages = [
  {
    path: '/',
    name: 'Home Page',
    expectedElements: [
      'Welcome back',
      'Discover by Hashtag',
      '🥗 Healthy Recipes',
      'Saved Recipes',
      'Meal Plan',
      'Inventory',
      'Weekly Budget'
    ],
    buttonTests: [
      { selector: 'button', contains: 'Discover Recipes', action: 'navigate' },
      { selector: 'button', contains: 'Healthy Recipes', action: 'hashtag_select' },
      { selector: 'button', contains: 'Low Carb', action: 'hashtag_select' },
      { selector: 'button', contains: 'View All', action: 'navigate' }
    ]
  },
  {
    path: '/instagram',
    name: 'Instagram Page',
    expectedElements: [
      'Instagram Recipe Reels',
      'Import from Instagram',
      'Save Recipe',
      'Recently Saved'
    ],
    buttonTests: [
      { selector: 'button', contains: 'Import from URL', action: 'modal_open' },
      { selector: 'button', contains: 'Save Recipe', action: 'save_action' }
    ]
  },
  {
    path: '/meal-planner',
    name: 'Meal Planner',
    expectedElements: [
      'Meal Planner',
      'Queue',
      'Plan',
      'For You',
      'Weekly Calendar'
    ],
    buttonTests: [
      { selector: 'button', contains: 'Queue', action: 'tab_switch' },
      { selector: 'button', contains: 'Plan', action: 'tab_switch' },
      { selector: 'button', contains: 'Add to Queue', action: 'add_recipe' }
    ]
  },
  {
    path: '/shopping-list',
    name: 'Shopping List',
    expectedElements: [
      'Shopping Lists',
      'Create New List',
      'By Store Section',
      'By Recipe'
    ],
    buttonTests: [
      { selector: 'button', contains: 'Create New List', action: 'create_list' },
      { selector: 'button', contains: 'By Store Section', action: 'view_switch' },
      { selector: 'button', contains: 'Add Item', action: 'add_item' }
    ]
  },
  {
    path: '/inventory',
    name: 'Inventory',
    expectedElements: [
      'Inventory',
      'Add Item',
      'Categories',
      'Expiring Soon'
    ],
    buttonTests: [
      { selector: 'button', contains: 'Add Item', action: 'add_inventory' },
      { selector: 'button', contains: 'Categories', action: 'filter' }
    ]
  },
  {
    path: '/recipes',
    name: 'Recipes',
    expectedElements: [
      'Recipe Collection',
      'Saved Recipes',
      'Filter',
      'Search'
    ],
    buttonTests: [
      { selector: 'button', contains: 'Filter', action: 'filter_recipes' },
      { selector: 'button', contains: 'Search', action: 'search' }
    ]
  },
  {
    path: '/recipes/3642435953829642680',
    name: 'Recipe Detail',
    expectedElements: [
      'Add to List',
      'Add to Queue',
      'Nutrition balance score',
      'Ingredients',
      'Instructions'
    ],
    buttonTests: [
      { selector: 'button', contains: 'Add to List', action: 'shopping_list_modal' },
      { selector: 'button', contains: 'Add to Queue', action: 'meal_plan_add' },
      { selector: 'button', contains: 'Play', action: 'video_play' }
    ]
  },
  {
    path: '/auth/signin',
    name: 'Sign In',
    expectedElements: [
      'Sign In',
      'Email',
      'Password',
      'Continue with Google'
    ],
    buttonTests: [
      { selector: 'button', contains: 'Sign In', action: 'auth_signin' },
      { selector: 'button', contains: 'Continue with Google', action: 'oauth_signin' }
    ]
  }
];

// API endpoints to test
const apiEndpoints = [
  { path: '/api/instagram/hashtag-reels?hashtag=healthyrecipes', expectedStatus: 200 },
  { path: '/api/instagram/hashtag-reels?hashtag=keto', expectedStatus: 200 },
  { path: '/api/instagram/hashtag-reels?hashtag=lowcarb', expectedStatus: 200 }
];

async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, options);
    return {
      status: response.status,
      statusText: response.statusText,
      text: await response.text(),
      headers: response.headers
    };
  } catch (error) {
    return {
      status: 0,
      statusText: 'Network Error',
      text: '',
      error: error.message
    };
  }
}

async function testPageHealth(pageInfo) {
  log(colors.cyan, `\n🔍 Testing: ${pageInfo.name} (${pageInfo.path})`);
  
  const url = `${BASE_URL}${pageInfo.path}`;
  const response = await makeRequest(url);
  
  if (response.status !== 200) {
    log(colors.red, `  ❌ HTTP ${response.status}: ${response.statusText}`);
    if (response.error) {
      log(colors.red, `  💥 Error: ${response.error}`);
    }
    return false;
  }
  
  log(colors.green, `  ✅ HTTP 200: Page loads successfully`);
  
  // Check for expected elements
  let elementsFound = 0;
  for (const element of pageInfo.expectedElements) {
    if (response.text.includes(element)) {
      log(colors.green, `  ✅ Found: "${element}"`);
      elementsFound++;
    } else {
      log(colors.yellow, `  ⚠️  Missing: "${element}"`);
    }
  }
  
  const elementScore = elementsFound / pageInfo.expectedElements.length;
  if (elementScore >= 0.8) {
    log(colors.green, `  ✅ Elements: ${elementsFound}/${pageInfo.expectedElements.length} (${Math.round(elementScore * 100)}%)`);
  } else {
    log(colors.yellow, `  ⚠️  Elements: ${elementsFound}/${pageInfo.expectedElements.length} (${Math.round(elementScore * 100)}%)`);
  }
  
  // Test buttons (basic presence check)
  let buttonsFound = 0;
  for (const button of pageInfo.buttonTests) {
    if (response.text.includes(button.contains)) {
      log(colors.green, `  ✅ Button: "${button.contains}" (${button.action})`);
      buttonsFound++;
    } else {
      log(colors.red, `  ❌ Button missing: "${button.contains}" (${button.action})`);
    }
  }
  
  const buttonScore = buttonsFound / pageInfo.buttonTests.length;
  if (buttonScore >= 0.8) {
    log(colors.green, `  ✅ Buttons: ${buttonsFound}/${pageInfo.buttonTests.length} (${Math.round(buttonScore * 100)}%)`);
  } else {
    log(colors.red, `  ❌ Buttons: ${buttonsFound}/${pageInfo.buttonTests.length} (${Math.round(buttonScore * 100)}%)`);
  }
  
  return elementScore >= 0.7 && buttonScore >= 0.7;
}

async function testAPIEndpoints() {
  log(colors.cyan, `\n🔌 Testing API Endpoints`);
  
  let successCount = 0;
  for (const endpoint of apiEndpoints) {
    const url = `${BASE_URL}${endpoint.path}`;
    const response = await makeRequest(url);
    
    if (response.status === endpoint.expectedStatus) {
      log(colors.green, `  ✅ ${endpoint.path} - HTTP ${response.status}`);
      
      // Try to parse JSON for API endpoints
      try {
        const data = JSON.parse(response.text);
        if (data.success && data.reels && data.reels.length > 0) {
          log(colors.green, `    📊 API returned ${data.reels.length} reels`);
          
          // Check if reels have video URLs
          const reelsWithVideo = data.reels.filter(reel => reel.video_versions && reel.video_versions.length > 0);
          log(colors.green, `    🎥 ${reelsWithVideo.length}/${data.reels.length} reels have video URLs`);
        }
      } catch (e) {
        log(colors.yellow, `    ⚠️  Response is not valid JSON`);
      }
      
      successCount++;
    } else {
      log(colors.red, `  ❌ ${endpoint.path} - HTTP ${response.status} (expected ${endpoint.expectedStatus})`);
    }
  }
  
  return successCount === apiEndpoints.length;
}

async function generateHealthReport() {
  log(colors.bold + colors.blue, '\n🏥 KitchenAI Application Health Check');
  log(colors.white, '='.repeat(50));
  
  const startTime = Date.now();
  let passedPages = 0;
  let totalPages = testPages.length;
  
  // Test all pages
  for (const pageInfo of testPages) {
    const passed = await testPageHealth(pageInfo);
    if (passed) passedPages++;
  }
  
  // Test API endpoints
  const apiPassed = await testAPIEndpoints();
  
  // Generate summary
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  log(colors.cyan, `\n📊 Health Check Summary`);
  log(colors.white, '='.repeat(30));
  
  const pageScore = passedPages / totalPages;
  if (pageScore >= 0.8) {
    log(colors.green, `✅ Pages: ${passedPages}/${totalPages} passing (${Math.round(pageScore * 100)}%)`);
  } else {
    log(colors.red, `❌ Pages: ${passedPages}/${totalPages} passing (${Math.round(pageScore * 100)}%)`);
  }
  
  if (apiPassed) {
    log(colors.green, `✅ APIs: All endpoints working`);
  } else {
    log(colors.red, `❌ APIs: Some endpoints failing`);
  }
  
  log(colors.white, `⏱️  Duration: ${duration} seconds`);
  log(colors.white, `🔗 Base URL: ${BASE_URL}`);
  
  // Overall health score
  const overallScore = (pageScore + (apiPassed ? 1 : 0)) / 2;
  if (overallScore >= 0.8) {
    log(colors.green + colors.bold, `\n🎉 Overall Health: EXCELLENT (${Math.round(overallScore * 100)}%)`);
  } else if (overallScore >= 0.6) {
    log(colors.yellow + colors.bold, `\n⚠️  Overall Health: GOOD (${Math.round(overallScore * 100)}%)`);
  } else {
    log(colors.red + colors.bold, `\n🚨 Overall Health: NEEDS ATTENTION (${Math.round(overallScore * 100)}%)`);
  }
  
  // Recommendations
  log(colors.cyan, `\n💡 Recommendations:`);
  if (pageScore < 0.8) {
    log(colors.yellow, `  • Fix missing page elements and buttons`);
  }
  if (!apiPassed) {
    log(colors.yellow, `  • Check API endpoints and Instagram integration`);
  }
  if (overallScore >= 0.8) {
    log(colors.green, `  • Application is healthy and ready for production! 🚀`);
  }
}

// Check if we're in a Node.js environment
if (typeof window === 'undefined') {
  // Add fetch polyfill for Node.js
  global.fetch = async (url, options) => {
    const https = require('https');
    const http = require('http');
    const urlParse = require('url').parse;
    
    return new Promise((resolve, reject) => {
      const parsedUrl = urlParse(url);
      const client = parsedUrl.protocol === 'https:' ? https : http;
      
      const req = client.request({
        hostname: parsedUrl.hostname,
        port: parsedUrl.port,
        path: parsedUrl.path,
        method: options?.method || 'GET',
        headers: options?.headers || {}
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({
            status: res.statusCode,
            statusText: res.statusMessage,
            text: () => Promise.resolve(data),
            headers: res.headers
          });
        });
      });
      
      req.on('error', reject);
      
      if (options?.body) {
        req.write(options.body);
      }
      
      req.end();
    });
  };
  
  // Run the health check
  generateHealthReport().catch(console.error);
} 