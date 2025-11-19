# ScrapeKit Example: TFTactics Set Update Scraper

This document demonstrates how to use ScrapeKit to gather information from the [TFTactics Set Update page](https://tftactics.gg/set-update).

## Overview

This example will show you how to extract key information from the Teamfight Tactics set update page using ScrapeKit. We'll focus on extracting important set details like patch notes, upcoming changes, and other relevant information.

## Prerequisites

- Node.js installed on your system
- ScrapeKit installed (`npm install scrapekit`)

## Installation

```bash
npm install scrapekit
```

## CLI Example

### Basic Scraping
```bash
# Scrape all headings and paragraphs
npx scrapekit --url "https://tftactics.gg/set-update" --selector "h1, h2, h3, p" --format json --output tft_set_update

# Scrape specific elements related to updates
npx scrapekit --url "https://tftactics.gg/set-update" --selector ".update-notes, .patch-notes, .set-info" --js --format json --output tft_set_details
```

### Advanced Scraping with JavaScript Support
```bash
# Since TFTactics uses dynamic content, we need JavaScript support
npx scrapekit --url "https://tftactics.gg/set-update" --selector "[data-testid='update-item'], .set-card, .patch-note" --js --clean --format json --output tft_dynamic_content

# Scrape links to further details
npx scrapekit --url "https://tftactics.gg/set-update" --selector "a" --attribute "href" --js --format json --output tft_links
```

## Programmatic Usage

### Basic Example
```javascript
import { scrape } from 'scrapekit';

async function scrapeTFTUpdates() {
  try {
    // Scrape the set update page with JavaScript support enabled
    const data = await scrape(
      'https://tftactics.gg/set-update',      // URL to scrape
      'h1, h2, h3, .update-container, .patch-note, .set-info',  // CSS selectors for relevant content
      undefined,                            // attribute (optional)
      true,                                 // usePuppeteer (required for dynamic content)
      true                                  // shouldClean (clean the data)
    );

    console.log(`Found ${data.length} elements`);
    console.log(data);

    return data;
  } catch (error) {
    console.error('Error scraping TFT updates:', error.message);
  }
}

scrapeTFTUpdates();
```

### Advanced Example with Content Detection
```javascript
import { scrape, exportToJson, exportToExcel } from 'scrapekit';

async function advancedTFTScraping() {
  try {
    // Scrape with content detection to get the main content area
    const tftData = await scrape(
      'https://tftactics.gg/set-update',
      'div, .set-update, .patch-notes-container, .update-content',  // Broader selectors for content areas
      undefined,           // attribute (optional)
      true,                // usePuppeteer (required for dynamic content)
      true,                // shouldClean
      true                 // detectMainContent
    );

    console.log(`Found ${tftData.length} content elements`);

    // Export to multiple formats
    exportToJson(tftData, 'tft_set_updates.json');
    exportToExcel(tftData, 'tft_set_updates.xlsx');

    // Process the data to extract specific information
    const updates = tftData.filter(item => 
      item.text && 
      (item.text.toLowerCase().includes('patch') || 
       item.text.toLowerCase().includes('update') || 
       item.text.toLowerCase().includes('set'))
    );

    console.log(`Identified ${updates.length} potential update items`);

    return {
      allData: tftData,
      updates: updates
    };
  } catch (error) {
    console.error('Error in advanced TFT scraping:', error.message);
  }
}

advancedTFTScraping();
```

### Comprehensive Extraction Example
```javascript
import { scrape, cleanScrapedData, exportToJson, exportToExcel } from 'scrapekit';

async function extractTFTSetDetails() {
  try {
    // First, scrape general update information
    const generalInfo = await scrape(
      'https://tftactics.gg/set-update',
      'h1, h2, h3, .update-title, .set-name, .patch-version, .release-date, .update-summary',
      undefined,
      true,  // Enable Puppeteer for JavaScript content
      true   // Clean the data
    );

    // Then, scrape more detailed information
    const detailedInfo = await scrape(
      'https://tftactics.gg/set-update',
      '.update-feature, .change-log, .balance-change, .new-feature, .update-note',
      undefined,
      true,
      true
    );

    // Finally, scrape any links or references
    const links = await scrape(
      'https://tftactics.gg/set-update',
      'a',
      'href',  // Extract href attribute instead of text
      true,
      true
    );

    // Combine all data
    const allData = {
      timestamp: new Date().toISOString(),
      generalInfo: cleanScrapedData(generalInfo),
      detailedInfo: cleanScrapedData(detailedInfo),
      links: cleanScrapedData(links)
    };

    // Export to different formats
    exportToJson(allData, 'tft_comprehensive_update');
    exportToExcel(generalInfo, 'tft_general_info.xlsx');
    
    console.log(`Extracted ${allData.generalInfo.length} general info items`);
    console.log(`Extracted ${allData.detailedInfo.length} detailed items`);
    console.log(`Found ${allData.links.length} links`);

    return allData;
  } catch (error) {
    console.error('Error extracting TFT set details:', error.message);
  }
}

// Run the extraction
extractTFTSetDetails();
```

## Sample Output Structure

When scraping the TFTactics set update page, you might expect to receive data in the following structure:

```json
[
  {
    "text": "Set Name: [Actual Set Name]",
    "tag": "h1",
    "className": "set-title",
    "innerHTML": "<h1 class=\"set-title\">Set Name: [Actual Set Name]</h1>"
  },
  {
    "text": "Patch Version: [Version Number]",
    "tag": "div",
    "className": "patch-info",
    "innerHTML": "<div class=\"patch-info\">Patch Version: [Version Number]</div>"
  },
  {
    "text": "Release Date: [Date]",
    "tag": "span",
    "className": "release-date",
    "innerHTML": "<span class=\"release-date\">Release Date: [Date]</span>"
  }
]
```

## Important Notes

1. **JavaScript Content**: TFTactics uses JavaScript to load content dynamically, so make sure to use the `--js` flag or set `usePuppeteer: true` when scraping.

2. **Respectful Scraping**: Always be respectful when scraping websites:
   - Add appropriate delays between requests
   - Check the website's robots.txt file
   - Don't overload the server with too many requests

3. **Selector Accuracy**: The CSS selectors provided in these examples are based on typical website structures. The actual selectors for TFTactics may differ based on their current HTML structure. You may need to inspect the page elements to identify the correct selectors.

4. **Content Changes**: The structure of the TFTactics site may change over time, which could require updates to your selectors.

## Troubleshooting

If you encounter issues while scraping the TFTactics site:

1. **Empty Results**: The site may load content dynamically. Ensure you're using Puppeteer (`--js` flag).

2. **Selector Issues**: Inspect the page in your browser's developer tools to identify the correct CSS selectors.

3. **Rate Limiting**: The site may block requests if too many are made too quickly. Add appropriate delays between requests if needed.

## Legal and Ethical Considerations

- Always review and comply with the website's Terms of Service
- Check the `robots.txt` file at https://tftactics.gg/robots.txt
- Be respectful of the website's resources and don't make excessive requests
- Remember that scraped data should be used in accordance with applicable laws and regulations

## Conclusion

This example demonstrates how to use ScrapeKit to gather information from the TFT tactics set update page. You can adapt these examples to extract specific information that's most relevant to your needs. Remember to adjust selectors based on the current structure of the target website.