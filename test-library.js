// Test file to verify the library works
import WebScraperPlus, { scrape, cleanScrapedData } from './dist/index.js';

console.log('Web Scraper Plus library imported successfully!');

// Example usage (commented out to prevent execution during testing)
/*
const example = async () => {
  try {
    const results = await scrape('https://httpbin.org/html', 'h1, p', undefined, false, true);
    console.log(`Scraped ${results.length} elements`);
    console.log('Sample result:', results[0]);
  } catch (error) {
    console.error('Error during scraping:', error);
  }
};

example();
*/

console.log('Library exports are available:', {
  hasScrape: typeof scrape === 'function',
  hasCleanScrapedData: typeof cleanScrapedData === 'function',
  hasDefaultExport: typeof WebScraperPlus === 'object'
});