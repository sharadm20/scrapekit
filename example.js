// example.js - Example usage of Web Scraper Plus library

// ESM import (if using modules)
import { scrape, cleanScrapedData, exportToJson } from './dist/index.js';

// Or CommonJS require (if using commonjs):
// const { scrape, cleanScrapedData, exportToJson } = require('./dist');

async function example() {
  try {
    console.log('Starting web scraping...');

    // Scrape some data from a test site
    const data = await scrape(
      'https://httpbin.org/html',  // URL to scrape
      'h1, p',                    // CSS selector
      undefined,                  // attribute (optional)
      false,                      // usePuppeteer
      true                        // shouldClean
    );

    console.log(`Found ${data.length} elements`);

    // Clean the data (optional, can also be done during scraping)
    const cleanedData = cleanScrapedData(data);
    console.log(`After cleaning: ${cleanedData.length} elements`);

    // Export to JSON file
    exportToJson(cleanedData, 'example-output.json');
    console.log('Data exported to example-output.json');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run the example
example();