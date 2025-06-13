const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class SitemapCrawler {
  constructor(baseUrl = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
    this.visitedUrls = new Set();
    this.brokenLinks = [];
    this.nonFunctionalButtons = [];
    this.missingPages = [];
    this.issues = [];
    this.browser = null;
    this.page = null;
  }

  async init() {
    this.browser = await puppeteer.launch({ 
      headless: false, 
      devtools: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    this.page = await this.browser.newPage();
    await this.page.setViewport({ width: 1200, height: 800 });
  }

  async crawl() {
    console.log('🤖 Starting KitchenAI Sitemap Crawler...\n');
    
    await this.init();
    
    // Define all routes to check based on your app structure
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
      '/signup'
    ];

    for (const route of routes) {
      await this.checkPage(route);
    }

    await this.generateReport();
    await this.browser.close();
  }

  async checkPage(route) {
    const url = `${this.baseUrl}${route}`;
    
    if (this.visitedUrls.has(url)) {
      return;
    }

    console.log(`🔍 Checking: ${url}`);
    this.visitedUrls.add(url);

    try {
      const response = await this.page.goto(url, { 
        waitUntil: 'networkidle0',
        timeout: 10000 
      });

      if (!response.ok()) {
        this.brokenLinks.push({
          url,
          status: response.status(),
          error: `HTTP ${response.status()}`
        });
        return;
      }

      // Check for JavaScript errors
      this.page.on('console', msg => {
        if (msg.type() === 'error') {
          this.issues.push({
            url,
            type: 'JavaScript Error',
            message: msg.text()
          });
        }
      });

      // Wait for page to load
      await this.page.waitForTimeout(2000);

      // Check all links on the page
      await this.checkLinks(url);
      
      // Check all buttons on the page
      await this.checkButtons(url);

      // Check for missing components or broken layouts
      await this.checkLayout(url);

    } catch (error) {
      this.brokenLinks.push({
        url,
        error: error.message
      });
    }
  }

  async checkLinks(currentUrl) {
    const links = await this.page.$$eval('a[href]', links => 
      links.map(link => ({
        href: link.href,
        text: link.textContent.trim(),
        hasOnClick: !!link.onclick
      }))
    );

    for (const link of links) {
      // Skip external links and anchors
      if (link.href.startsWith('http') && !link.href.startsWith(this.baseUrl)) {
        continue;
      }
      if (link.href.startsWith('#') || link.href.startsWith('mailto:') || link.href.startsWith('tel:')) {
        continue;
      }

      // Extract the path
      const url = new URL(link.href);
      const path = url.pathname;

      // Check if the link works
      try {
        const response = await fetch(link.href);
        if (!response.ok) {
          this.brokenLinks.push({
            url: currentUrl,
            brokenLink: link.href,
            linkText: link.text,
            status: response.status
          });
        }
      } catch (error) {
        this.brokenLinks.push({
          url: currentUrl,
          brokenLink: link.href,
          linkText: link.text,
          error: error.message
        });
      }
    }
  }

  async checkButtons(currentUrl) {
    const buttons = await this.page.$$eval('button, [role="button"], input[type="button"], input[type="submit"]', buttons => 
      buttons.map((button, index) => ({
        index,
        text: button.textContent.trim() || button.value || 'No text',
        hasOnClick: !!button.onclick,
        hasEventListeners: button.hasAttribute('data-onclick') || button.hasAttribute('onclick'),
        type: button.type || 'button',
        disabled: button.disabled,
        className: button.className
      }))
    );

    for (const button of buttons) {
      // Skip disabled buttons
      if (button.disabled) continue;

      try {
        // Try to click the button and see if it does something
        const buttonElement = await this.page.$(`button:nth-of-type(${button.index + 1}), [role="button"]:nth-of-type(${button.index + 1}), input[type="button"]:nth-of-type(${button.index + 1}), input[type="submit"]:nth-of-type(${button.index + 1})`);
        
        if (buttonElement) {
          // Listen for navigation or network activity
          let hasAction = false;
          
          const navigationPromise = this.page.waitForNavigation({ 
            waitUntil: 'networkidle0', 
            timeout: 3000 
          }).then(() => hasAction = true).catch(() => {});
          
          const networkPromise = this.page.waitForResponse(() => true, { timeout: 3000 })
            .then(() => hasAction = true).catch(() => {});

          await buttonElement.click();
          
          await Promise.race([navigationPromise, networkPromise, this.page.waitForTimeout(3000)]);

          if (!hasAction && !button.hasOnClick && !button.hasEventListeners) {
            this.nonFunctionalButtons.push({
              url: currentUrl,
              buttonText: button.text,
              buttonClass: button.className,
              issue: 'Button appears to have no functionality'
            });
          }
        }
      } catch (error) {
        // Button might not be clickable or have other issues
        this.nonFunctionalButtons.push({
          url: currentUrl,
          buttonText: button.text,
          error: error.message
        });
      }
    }
  }

  async checkLayout(currentUrl) {
    // Check for common layout issues
    const layoutIssues = await this.page.evaluate(() => {
      const issues = [];
      
      // Check for elements with no content
      const emptyElements = document.querySelectorAll('div:empty, span:empty, p:empty');
      if (emptyElements.length > 5) { // Allow some empty elements
        issues.push(`Found ${emptyElements.length} empty elements`);
      }

      // Check for missing images
      const brokenImages = Array.from(document.querySelectorAll('img')).filter(img => 
        !img.complete || img.naturalHeight === 0
      );
      if (brokenImages.length > 0) {
        issues.push(`Found ${brokenImages.length} broken images`);
      }

      // Check for accessibility issues
      const missingAltText = document.querySelectorAll('img:not([alt])');
      if (missingAltText.length > 0) {
        issues.push(`Found ${missingAltText.length} images without alt text`);
      }

      return issues;
    });

    if (layoutIssues.length > 0) {
      this.issues.push({
        url: currentUrl,
        type: 'Layout Issues',
        issues: layoutIssues
      });
    }
  }

  async generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalPagesChecked: this.visitedUrls.size,
        brokenLinks: this.brokenLinks.length,
        nonFunctionalButtons: this.nonFunctionalButtons.length,
        otherIssues: this.issues.length
      },
      brokenLinks: this.brokenLinks,
      nonFunctionalButtons: this.nonFunctionalButtons,
      issues: this.issues,
      visitedUrls: Array.from(this.visitedUrls)
    };

    // Save report to file
    const reportPath = path.join(__dirname, '../sitemap-crawler-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // Console output
    console.log('\n🏁 Crawler Report Complete!\n');
    console.log('📊 SUMMARY:');
    console.log(`   ✅ Pages checked: ${report.summary.totalPagesChecked}`);
    console.log(`   ❌ Broken links: ${report.summary.brokenLinks}`);
    console.log(`   🔘 Non-functional buttons: ${report.summary.nonFunctionalButtons}`);
    console.log(`   ⚠️  Other issues: ${report.summary.otherIssues}`);

    if (this.brokenLinks.length > 0) {
      console.log('\n🔗 BROKEN LINKS:');
      this.brokenLinks.forEach(link => {
        console.log(`   • ${link.url} -> ${link.brokenLink || 'Page itself'} (${link.error || link.status})`);
      });
    }

    if (this.nonFunctionalButtons.length > 0) {
      console.log('\n🔘 NON-FUNCTIONAL BUTTONS:');
      this.nonFunctionalButtons.forEach(button => {
        console.log(`   • ${button.url}: "${button.buttonText}" - ${button.issue || button.error}`);
      });
    }

    if (this.issues.length > 0) {
      console.log('\n⚠️  OTHER ISSUES:');
      this.issues.forEach(issue => {
        console.log(`   • ${issue.url}: ${issue.type}`);
        if (issue.issues) {
          issue.issues.forEach(i => console.log(`     - ${i}`));
        }
        if (issue.message) {
          console.log(`     - ${issue.message}`);
        }
      });
    }

    console.log(`\n📄 Full report saved to: ${reportPath}\n`);
  }
}

// Run the crawler
if (require.main === module) {
  const crawler = new SitemapCrawler();
  crawler.crawl().catch(console.error);
}

module.exports = SitemapCrawler; 