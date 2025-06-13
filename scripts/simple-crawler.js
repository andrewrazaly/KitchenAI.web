const fs = require('fs');
const path = require('path');

// Simple crawler using fetch to check page status
class SimpleCrawler {
  constructor(baseUrl = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
    this.results = {
      working: [],
      broken: [],
      errors: []
    };
  }

  async checkRoute(route) {
    const url = `${this.baseUrl}${route}`;
    console.log(`🔍 Checking: ${url}`);
    
    try {
      const response = await fetch(url);
      if (response.ok) {
        this.results.working.push({ route, url, status: response.status });
        console.log(`  ✅ OK (${response.status})`);
      } else {
        this.results.broken.push({ route, url, status: response.status });
        console.log(`  ❌ BROKEN (${response.status})`);
      }
    } catch (error) {
      this.results.errors.push({ route, url, error: error.message });
      console.log(`  ⚠️  ERROR: ${error.message}`);
    }
  }

  async crawl() {
    console.log('🤖 Starting Simple KitchenAI Crawler...\n');
    
    // Define all routes to check
    const routes = [
      '/',
      '/recipes',
      '/collections',
      '/meal-planner',
      '/instagram',
      '/ai-agent',
      '/inventory',
      '/profile',
      '/shopping-list',
      '/deals',
      '/agent-directory',
      '/sign-in',
      '/sign-up',
      '/chat',
      '/grocery-list',
      '/auth',
      '/signin',
      '/signup',
      '/test-page'
    ];

    // Check each route
    for (const route of routes) {
      await this.checkRoute(route);
      // Small delay to be nice to the server
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    this.generateReport();
  }

  generateReport() {
    console.log('\n🏁 Simple Crawler Report:\n');
    console.log(`✅ Working pages: ${this.results.working.length}`);
    console.log(`❌ Broken pages: ${this.results.broken.length}`);
    console.log(`⚠️  Error pages: ${this.results.errors.length}`);

    if (this.results.broken.length > 0) {
      console.log('\n❌ BROKEN PAGES:');
      this.results.broken.forEach(item => {
        console.log(`  • ${item.route} (HTTP ${item.status})`);
      });
    }

    if (this.results.errors.length > 0) {
      console.log('\n⚠️  ERROR PAGES:');
      this.results.errors.forEach(item => {
        console.log(`  • ${item.route} - ${item.error}`);
      });
    }

    // Save report
    const reportPath = path.join(__dirname, '../simple-crawler-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`\n📄 Report saved to: ${reportPath}\n`);
  }
}

// Run the crawler
if (require.main === module) {
  const crawler = new SimpleCrawler();
  crawler.crawl().catch(console.error);
}

module.exports = SimpleCrawler; 