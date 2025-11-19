import axios from 'axios';
import * as cheerio from 'cheerio';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import * as XLSX from 'xlsx';
import { MongoClient } from 'mongodb';
import { Builder } from 'xml2js';
import { exportToSql } from './sql-export';
import * as puppeteer from 'puppeteer';
import { cleanScrapedData } from './data-cleaner';

// Define types
type OutputFormat = 'json' | 'excel' | 'sql' | 'mongo' | 'xml';
export type ScrapeResult = Record<string, any>;

// Main scraper function
export async function scrapeWebPage(url: string, selector: string, attribute?: string, usePuppeteer: boolean = false, shouldClean: boolean = false, detectMainContent: boolean = false, cleanTextOnly: boolean = false): Promise<ScrapeResult[]> {
  let results: ScrapeResult[];

  if (usePuppeteer) {
    // Use Puppeteer for JavaScript-enabled scraping
    results = await scrapeWithPuppeteer(url, selector, attribute, detectMainContent, cleanTextOnly);
  } else {
    // Use traditional method for static HTML
    results = await scrapeWithCheerio(url, selector, attribute, detectMainContent, cleanTextOnly);
  }

  // Clean data if requested
  if (shouldClean) {
    results = cleanScrapedData(results);
  }

  return results;
}

// Scraper function using Cheerio (traditional method for static HTML)
async function scrapeWithCheerio(url: string, selector: string, attribute?: string, detectMainContent: boolean = false, cleanTextOnly: boolean = false): Promise<ScrapeResult[]> {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const $ = cheerio.load(response.data);

    if (detectMainContent) {
      // Import the content detection functions
      const { detectMainContentCheerio, extractCleanTextCheerio } = await import('./content-detection');

      // Find main content area
      const mainElement = detectMainContentCheerio($, response.data);

      if (cleanTextOnly && mainElement) {
        // Return just the clean text content
        const cleanText = extractCleanTextCheerio($, mainElement);
        return [{ text: cleanText, tagName: 'main-content', cleanTextOnly: true }];
      } else if (mainElement) {
        // Extract elements within the main content area
        const results: ScrapeResult[] = [];

        // Find all elements within the main content area
        $(mainElement).find('*').each((index, element) => {
          // Skip script and style tags
          const tagName = $(element).prop('tagName')?.toLowerCase();
          if (tagName && !['script', 'style', 'noscript', 'meta', 'link', 'title', 'head'].includes(tagName)) {
            const item: ScrapeResult = {};

            // Extract text content
            item.text = $(element).text().trim();

            // If the element has significant content, include the html as well
            const html = $(element).html()?.trim() || '';
            if (html && html !== item.text) {
              item.innerHTML = html;
            }

            // Add tag name and other useful properties
            item.tagName = tagName || 'unknown';

            // Add class name if available
            const className = $(element).attr('class');
            if (className) {
              item.className = className;
            }

            // Add ID if available
            const id = $(element).attr('id');
            if (id) {
              item.id = id;
            }

            results.push(item);
          }
        });

        return results;
      } else {
        // Fallback to original selector if no main content found
        const results: ScrapeResult[] = [];

        $(selector).each((index, element) => {
          const item: ScrapeResult = {};

          if (attribute) {
            // Extract specific attribute
            item[attribute] = $(element).attr(attribute) || '';
          } else {
            // Extract text content
            item.text = $(element).text().trim();
          }

          // Also add the tag name and any other relevant attributes
          item.tagName = (element as any).tagName || 'unknown';

          results.push(item);
        });

        return results;
      }
    } else {
      // Original behavior
      const results: ScrapeResult[] = [];

      $(selector).each((index, element) => {
        const item: ScrapeResult = {};

        if (attribute) {
          // Extract specific attribute
          item[attribute] = $(element).attr(attribute) || '';
        } else {
          // Extract text content
          item.text = $(element).text().trim();
        }

        // Also add the tag name and any other relevant attributes
        item.tagName = (element as any).tagName || 'unknown';

        results.push(item);
      });

      return results;
    }
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    throw error;
  }
}

// Scraper function using Puppeteer (for JavaScript-enabled scraping)
async function scrapeWithPuppeteer(url: string, selector: string, attribute?: string, detectMainContent: boolean = false, cleanTextOnly: boolean = false): Promise<ScrapeResult[]> {
  let browser;
  try {
    // Launch a headless browser with additional options for better compatibility
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ]
    });

    // Open a new page
    const page = await browser.newPage();

    // Set a realistic user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

    // Set wider viewport for better rendering
    await page.setViewport({ width: 1920, height: 1080 });

    // Navigate to the URL with increased timeout and wait for network to be idle
    await page.goto(url, {
      waitUntil: 'networkidle0',
      timeout: 60000 // Increase timeout to 60 seconds
    });

    if (detectMainContent) {
      // Use content detection algorithm to find main content
      const mainContentResult = await page.evaluate(() => {
        // Content detection algorithm implementation
        function detectMainContentBrowser(document) {
          if (!document) return null;

          // Get all potential content containers
          var containers = Array.from(
            document.querySelectorAll('article, main, .content, #content, .main, #main, .post, .entry, [role="main"]')
          );

          // If we find semantic content elements, prioritize them
          if (containers.length > 0) {
            // Calculate scores for containers
            var containerScores = containers.map(function(el) {
              var textContent = el.textContent || '';
              var textLength = textContent.trim().length;

              // Calculate link density
              var links = el.querySelectorAll('a');
              var linkTextLength = 0;
              for (var i = 0; i < links.length; i++) {
                linkTextLength += (links[i].textContent || '').length;
              }

              var linkDensity = textLength > 0 ? linkTextLength / textLength : 0;
              var childrenCount = el.children ? el.children.length : 0;
              var tag = (el.tagName || '').toLowerCase();

              var score = 0;
              score += textLength; // Base score on text length
              score -= linkDensity * textLength * 2; // Penalize high link density

              // Bonus for semantic content tags
              if (['article', 'main', 'section'].indexOf(tag) !== -1) score += 100;
              if (childrenCount > 0) score += childrenCount * 5; // Bonus for having children

              // Bonus for common content class patterns
              var className = (el.className || '').toLowerCase();
              var id = (el.id || '').toLowerCase();
              var contentIndicators = ['content', 'main', 'post', 'entry', 'article', 'blog', 'story', 'text'];
              for (var j = 0; j < contentIndicators.length; j++) {
                var phrase = contentIndicators[j];
                if (className.indexOf(phrase) !== -1 || id.indexOf(phrase) !== -1) score += 50;
              }

              // Penalize for common non-content patterns
              var nonContentIndicators = ['nav', 'navigation', 'menu', 'header', 'footer', 'sidebar', 'ad', 'banner'];
              for (var k = 0; k < nonContentIndicators.length; k++) {
                var phrase = nonContentIndicators[k];
                if (className.indexOf(phrase) !== -1 || id.indexOf(phrase) !== -1) score -= 200;
              }

              return { element: el, score: score };
            });

            // Return the container with highest score
            var bestContainer = { element: null, score: -Infinity };
            for (var a = 0; a < containerScores.length; a++) {
              if (containerScores[a].score > bestContainer.score) {
                bestContainer = containerScores[a];
              }
            }

            return bestContainer.element;
          }

          // Fallback: analyze all elements to find the most content-rich one
          var allElements = Array.from(document.querySelectorAll('*'));

          // Filter for likely content containers
          var contentElements = [];
          for (var i = 0; i < allElements.length; i++) {
            var el = allElements[i];
            var tag = (el.tagName || '').toLowerCase();
            var className = (el.className || '').toLowerCase();
            var id = (el.id || '').toLowerCase();

            // Common content tags
            if (['article', 'section', 'main', 'div', 'p', 'pre', 'blockquote', 'ul', 'ol'].indexOf(tag) !== -1) {
              contentElements.push(el);
              continue;
            }

            // Elements with content-related class names
            var contentIndicators = ['content', 'main', 'post', 'entry', 'article', 'blog', 'story', 'text'];
            var isContentRelated = false;
            for (var j = 0; j < contentIndicators.length; j++) {
              if (className.indexOf(contentIndicators[j]) !== -1 || id.indexOf(contentIndicators[j]) !== -1) {
                isContentRelated = true;
                break;
              }
            }

            if (isContentRelated) {
              contentElements.push(el);
            }
          }

          if (contentElements.length === 0) {
            return null;
          }

          // Calculate content metrics for each element
          var elementScores = [];
          for (var k = 0; k < contentElements.length; k++) {
            var el2 = contentElements[k];
            var textContent = el2.textContent || '';
            var textLength = textContent.trim().length;

            // Calculate link density
            var links = el2.querySelectorAll('a');
            var linkTextLength = 0;
            for (var m = 0; m < links.length; m++) {
              linkTextLength += (links[m].textContent || '').length;
            }

            var linkDensity = textLength > 0 ? linkTextLength / textLength : 0;
            var childrenCount = el2.children ? el2.children.length : 0;
            var tag2 = (el2.tagName || '').toLowerCase();

            var score = 0;
            score += textLength; // Base score on text length
            score -= linkDensity * textLength * 2; // Penalize high link density

            // Bonus for semantic content tags
            if (['article', 'main', 'section'].indexOf(tag2) !== -1) score += 100;
            if (childrenCount > 0) score += childrenCount * 5; // Bonus for having children

            // Bonus for common content class patterns
            var className2 = (el2.className || '').toLowerCase();
            var id2 = (el2.id || '').toLowerCase();
            var contentIndicators2 = ['content', 'main', 'post', 'entry', 'article', 'blog', 'story', 'text'];
            for (var n = 0; n < contentIndicators2.length; n++) {
              var phrase = contentIndicators2[n];
              if (className2.indexOf(phrase) !== -1 || id2.indexOf(phrase) !== -1) score += 50;
            }

            // Penalize for common non-content patterns
            var nonContentIndicators = ['nav', 'navigation', 'menu', 'header', 'footer', 'sidebar', 'ad', 'banner'];
            for (var o = 0; o < nonContentIndicators.length; o++) {
              var phrase = nonContentIndicators[o];
              if (className2.indexOf(phrase) !== -1 || id2.indexOf(phrase) !== -1) score -= 200;
            }

            elementScores.push({ element: el2, score: score });
          }

          // Filter out very small elements
          var filteredScores = [];
          for (var p = 0; p < elementScores.length; p++) {
            if (elementScores[p].score > 20) {
              filteredScores.push(elementScores[p]);
            }
          }

          if (filteredScores.length === 0) return null;

          // Find highest scoring element
          var bestElement = { element: null, score: -Infinity };
          for (var q = 0; q < filteredScores.length; q++) {
            if (filteredScores[q].score > bestElement.score) {
              bestElement = filteredScores[q];
            }
          }

          return bestElement.element;
        }

        function extractCleanTextBrowser(element: any): string {
          if (!element) return '';

          // Get all text nodes while preserving some structure
          let text = '';

          const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT,
            {
              acceptNode: function(node: any) {
                // Skip text nodes inside script/style tags
                const parentTag = node.parentElement?.tagName?.toLowerCase();
                if (parentTag === 'script' || parentTag === 'style') {
                  return NodeFilter.FILTER_REJECT;
                }
                return NodeFilter.FILTER_ACCEPT;
              }
            }
          );

          const textNodes: any[] = [];
          let node;
          while (node = walker.nextNode()) {
            textNodes.push(node);
          }

          // Join text nodes with spaces, then clean up whitespace
          const rawText = textNodes.map((node: any) => node.textContent || '').join(' ');
          return rawText
            .replace(/\s+/g, ' ')  // Replace multiple whitespace with single space
            .replace(/\n/g, ' ')    // Replace newlines with space
            .replace(/\t/g, ' ')    // Replace tabs with space
            .replace(/\r/g, ' ')    // Replace carriage returns with space
            .trim();                // Trim leading/trailing whitespace
        }

        // Find the main content element
        const mainContent = detectMainContentBrowser(document);
        if (!mainContent) {
          return { mainContentElement: null, cleanText: '' };
        }

        // Extract clean text if requested
        const cleanText = extractCleanTextBrowser(mainContent);

        return {
          mainContentElement: mainContent,
          cleanText: cleanText
        };
      });

      if (cleanTextOnly && mainContentResult.cleanText) {
        // Return just the clean text content
        return [{ text: mainContentResult.cleanText, tagName: 'main-content', cleanTextOnly: true }];
      } else if (mainContentResult.mainContentElement) {
        // Extract all elements within the main content area
        const results = await page.evaluate((mainEl: any) => {
          // Get all meaningful elements within the main content
          const elements = Array.from(mainEl.querySelectorAll('*')).filter((el: any) => {
            const tag = el.tagName?.toLowerCase();
            // Exclude script and style tags but keep content elements
            return tag && !['script', 'style', 'noscript', 'meta', 'link', 'title', 'head'].includes(tag);
          });

          return elements.map((element: any) => {
            const item: any = {};

            // Extract text content
            item.text = element.textContent?.trim() || '';

            // If element has significant HTML content, include the innerHTML as well
            const innerHTML = element.innerHTML?.trim();
            if (innerHTML && innerHTML !== element.textContent?.trim()) {
              item.innerHTML = innerHTML;
            }

            // Add tag name and other useful properties
            item.tagName = element.tagName?.toLowerCase() || 'unknown';

            // Add class name if available
            if (element.className) {
              item.className = element.className;
            }

            // Add ID if available
            if (element.id) {
              item.id = element.id;
            }

            return item;
          });
        }, mainContentResult.mainContentElement);

        return results;
      } else {
        // Fallback to original selector if no main content found
        await page.waitForSelector(selector, { timeout: 30000 });

        const results = await page.evaluate((sel, attr) => {
          const elements = Array.from(document.querySelectorAll(sel));
          return elements.map((element, index) => {
            const item: any = {};

            if (attr) {
              // Extract specific attribute
              item[attr] = element.getAttribute(attr) || '';
            } else {
              // Extract text content
              item.text = element.textContent?.trim() || '';

              // If element has significant HTML content, include the innerHTML as well
              const innerHTML = element.innerHTML?.trim();
              if (innerHTML && innerHTML !== element.textContent?.trim()) {
                item.innerHTML = innerHTML;
              }
            }

            // Add tag name and other useful properties
            item.tagName = element.tagName.toLowerCase();

            // Add class name if available
            if (element.className) {
              item.className = element.className;
            }

            // Add ID if available
            if (element.id) {
              item.id = element.id;
            }

            return item;
          });
        }, selector, attribute);

        return results;
      }
    } else {
      // Original behavior: wait for the selector and extract as before
      await page.waitForSelector(selector, { timeout: 30000 });

      // Execute the scraping in the browser context
      const results = await page.evaluate((sel, attr) => {
        const elements = Array.from(document.querySelectorAll(sel));
        return elements.map((element, index) => {
          const item: any = {};

          if (attr) {
            // Extract specific attribute
            item[attr] = element.getAttribute(attr) || '';
          } else {
            // Extract text content
            item.text = element.textContent?.trim() || '';

            // If element has significant HTML content, include the innerHTML as well
            const innerHTML = element.innerHTML?.trim();
            if (innerHTML && innerHTML !== element.textContent?.trim()) {
              item.innerHTML = innerHTML;
            }
          }

          // Add tag name and other useful properties
          item.tagName = element.tagName.toLowerCase();

          // Add class name if available
          if (element.className) {
            item.className = element.className;
          }

          // Add ID if available
          if (element.id) {
            item.id = element.id;
          }

          return item;
        });
      }, selector, attribute);

      return results;
    }
  } catch (error) {
    console.error(`Error scraping ${url} with Puppeteer:`, error);
    // If the specific selector fails, try with a broader selector before throwing error
    if ((error as Error).name === 'TimeoutError') {
      console.log(`Attempting to scrape with a broader selector due to timeout...`);
      // In this case, we can't return anything because browser was already used in the try block
      // So we'll throw and let the calling function handle retries
      throw error;
    }
    throw error;
  } finally {
    // Close the browser to free up resources
    if (browser) {
      await browser.close();
    }
  }
}

// Function to export data to JSON
export function exportToJson(data: ScrapeResult[], filename: string): void {
  const fs = require('fs');
  fs.writeFileSync(filename, JSON.stringify(data, null, 2));
  console.log(`Data exported to ${filename}`);
}

// Function to export data to Excel
export function exportToExcel(data: ScrapeResult[], filename: string): void {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Scraped Data');
  XLSX.writeFile(workbook, filename);
  console.log(`Data exported to ${filename}`);
}

// Function to export data to XML
export function exportToXml(data: ScrapeResult[], filename: string): void {
  const builder = new Builder();
  const xml = builder.buildObject({ items: { item: data } });
  const fs = require('fs');
  fs.writeFileSync(filename, xml);
  console.log(`Data exported to ${filename}`);
}

// Function to export data to MongoDB
export function exportToMongo(data: ScrapeResult[], dbName: string, collectionName: string, filename: string): void {
  const fs = require('fs');

  // Generate MongoDB import commands (JSON format)
  const mongoData = data.map(item => JSON.stringify(item)).join('\n');
  fs.writeFileSync(filename, mongoData);

  console.log(`MongoDB data exported to ${filename}`);
  console.log(`To import later, use: mongoimport --db ${dbName} --collection ${collectionName} --file ${filename}`);
}

// Main CLI entry point
async function main() {
  const args = await yargs(hideBin(process.argv))
    .usage('Usage: $0 [options]')
    .option('url', {
      alias: 'u',
      describe: 'URL to scrape',
      type: 'string',
      demandOption: true
    })
    .option('selector', {
      alias: 's',
      describe: 'CSS selector to extract data',
      type: 'string',
      demandOption: true
    })
    .option('attribute', {
      alias: 'a',
      describe: 'Attribute to extract (optional)',
      type: 'string'
    })
    .option('output', {
      alias: 'o',
      describe: 'Output file name',
      type: 'string',
      default: 'output'
    })
    .option('format', {
      alias: 'f',
      describe: 'Output format: json, excel, sql (migration file), mongo (import file), xml',
      type: 'string',
      choices: ['json', 'excel', 'sql', 'mongo', 'xml'],
      default: 'json'
    })
    .option('js', {
      alias: 'j',
      describe: 'Enable JavaScript execution (use Puppeteer for dynamic content)',
      type: 'boolean',
      default: false
    })
    .option('clean', {
      alias: 'c',
      describe: 'Clean scraped data (remove duplicates, empty values, navigation elements)',
      type: 'boolean',
      default: false
    })
    .option('detect-content', {
      alias: 'dc',
      describe: 'Detect and extract main content area automatically (more precise scraping)',
      type: 'boolean',
      default: false
    })
    .option('clean-text', {
      alias: 'ct',
      describe: 'Extract clean text only (no HTML tags) from main content area',
      type: 'boolean',
      default: false
    })
    .option('mongodb-url', {
      describe: '[Deprecated] MongoDB connection string (not used for file export)',
      type: 'string',
      default: 'mongodb://localhost:27017'
    })
    .option('db-name', {
      describe: 'Database name (for mongo format)',
      type: 'string',
      default: 'scraper_db'
    })
    .option('collection-name', {
      describe: 'Collection name (for mongo format)',
      type: 'string',
      default: 'scraped_data'
    })
    .help()
    .parseAsync();

  try {
    console.log(`Scraping ${args.url}...`);
    console.log(`Using ${args.js ? 'Puppeteer (with JavaScript)' : 'Cheerio (static HTML)'} for scraping...`);
    console.log(`Clean option: ${args.clean ? 'enabled' : 'disabled'}`);
    console.log(`Detect main content: ${args.detectContent ? 'enabled' : 'disabled'}`);
    console.log(`Clean text only: ${args.cleanText ? 'enabled' : 'disabled'}`);

    // Scrape the web page with or without JavaScript support and additional options
    const scrapedData = await scrapeWebPage(
      args.url,
      args.selector,
      args.attribute,
      args.js,
      args.clean,
      args.detectContent,
      args.cleanText
    );

    console.log(`Found ${scrapedData.length} elements matching selector '${args.selector}'`);

    // Export based on format
    switch (args.format) {
      case 'json':
        exportToJson(scrapedData, `${args.output}.json`);
        break;
      case 'excel':
        exportToExcel(scrapedData, `${args.output}.xlsx`);
        break;
      case 'xml':
        exportToXml(scrapedData, `${args.output}.xml`);
        break;
      case 'mongo':
        exportToMongo(
          scrapedData,
          args.dbName,
          args.collectionName,
          `${args.output}.json`
        );
        break;
      case 'sql':
        exportToSql(scrapedData, 'scraped_data', `${args.output}.sql`);
        break;
      default:
        console.error(`Unsupported format: ${args.format}`);
        process.exit(1);
    }

    console.log('Scraping completed successfully!');
  } catch (error) {
    console.error('An error occurred:', error);
    process.exit(1);
  }
}

// Only run the main function if this file is executed directly
if (require.main === module) {
  main();
}

export default main;