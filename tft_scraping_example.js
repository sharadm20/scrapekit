// tft_scraping_example.js
// Example script to scrape TFTactics set update page using ScrapeKit

import { scrape, exportToJson, exportToExcel } from 'scrapekit';

async function scrapeTFTSetUpdate() {
  console.log('Starting to scrape TFT Set Update page...');

  try {
    // Since TFTactics uses dynamic content, we need Puppeteer
    console.log('Scraping with JavaScript support enabled...');
    
    // Attempt to scrape the main content areas
    const data = await scrape(
      'https://tftactics.gg/set-update',  // URL to scrape
      'h1, h2, .set-update, .update-container, .patch-notes, .set-header, .content', // CSS selectors
      undefined,                        // attribute (optional)
      true,                             // usePuppeteer (required for dynamic content)
      true                              // shouldClean
    );

    console.log(`Found ${data.length} elements from TFT Set Update page`);
    
    if (data.length > 0) {
      // Display first few items as preview
      console.log('\nFirst few scraped items:');
      data.slice(0, 5).forEach((item, index) => {
        console.log(`${index + 1}. ${item.text ? item.text.substring(0, 100) + (item.text.length > 100 ? '...' : '') : 'No text'}`);
      });

      // Export data to different formats
      console.log('\nExporting data...');
      exportToJson(data, 'tft_set_update_data.json');
      exportToExcel(data, 'tft_set_update_data.xlsx');
      
      console.log('Data exported successfully to tft_set_update_data.json and tft_set_update_data.xlsx');
    } else {
      console.log('No data found. The selectors might need adjustment based on the current page structure.');
      console.log('Try inspecting the page elements to identify appropriate CSS selectors.');
    }

    return data;
  } catch (error) {
    console.error('Error occurred while scraping:', error.message);
    
    // More specific error handling
    if (error.message.includes('timeout')) {
      console.log('The request timed out. The site might be slow to respond or blocking automated access.');
    } else if (error.message.includes('403') || error.message.includes('forbidden')) {
      console.log('Access forbidden. The site might be blocking scraping attempts.');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.log('Connection refused. Check if the URL is correct and accessible.');
    } else {
      console.log('An unexpected error occurred. Check the error details above.');
    }
  }
}

async function scrapeTFTLinks() {
  console.log('\nScraping links from TFT Set Update page...');
  
  try {
    const links = await scrape(
      'https://tftactics.gg/set-update',
      'a',                    // Select all links
      'href',               // Extract href attribute
      true,                 // usePuppeteer
      true                  // shouldClean
    );

    console.log(`Found ${links.length} links`);

    if (links.length > 0) {
      console.log('\nSample links found:');
      links.slice(0, 10).forEach((link, index) => {
        console.log(`${index + 1}. ${link.attributeValue || 'No href'}`);
      });

      exportToJson(links, 'tft_links.json');
      console.log('Links exported to tft_links.json');
    }

    return links;
  } catch (error) {
    console.error('Error occurred while scraping links:', error.message);
  }
}

// Run the scraping functions
async function runScraping() {
  console.log('Starting TFT Set Update scraping...');
  
  // Scrape main content
  const contentData = await scrapeTFTSetUpdate();
  
  // Scrape links as additional information
  const linkData = await scrapeTFTLinks();
  
  console.log('\nScraping completed!');
  console.log(`Main content items: ${contentData ? contentData.length : 0}`);
  console.log(`Links found: ${linkData ? linkData.length : 0}`);
}

// Execute the scraping
runScraping().catch(console.error);