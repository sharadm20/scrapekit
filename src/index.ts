/**
 * Web Scraper Plus - A flexible web scraping library
 * 
 * This library provides functions to scrape web pages with both static HTML
 * and JavaScript-enabled content, with support for multiple export formats.
 * 
 * @packageDocumentation
 */

import { scrapeWebPage as scraperScrapeWebPage, exportToJson, exportToExcel, exportToXml, exportToMongo } from './scraper';
import { cleanScrapedData as cleanerCleanScrapedData } from './data-cleaner';
import { exportToSql } from './sql-export';
import { ScrapeResult } from './scraper';

export { scraperScrapeWebPage as scrapeWebPage };
export { cleanerCleanScrapedData as cleanScrapedData };
export { exportToJson, exportToExcel, exportToXml, exportToMongo, exportToSql };
export type { ScrapeResult };

/**
 * Main scraping function that can handle both static and dynamic content
 *
 * @param url - The URL to scrape
 * @param selector - CSS selector to target elements
 * @param attribute - Optional attribute to extract instead of text content
 * @param usePuppeteer - Whether to use Puppeteer for JavaScript-enabled scraping
 * @param shouldClean - Whether to clean the scraped data
 * @param detectMainContent - Whether to detect and extract only the main content area
 * @param cleanTextOnly - Whether to return clean text only (no HTML tags)
 * @returns Promise resolving to an array of scraped data objects
 */
export async function scrape(
  url: string,
  selector: string,
  attribute?: string,
  usePuppeteer: boolean = false,
  shouldClean: boolean = false,
  detectMainContent: boolean = false,
  cleanTextOnly: boolean = false
): Promise<any[]> {
  const results = await scraperScrapeWebPage(url, selector, attribute, usePuppeteer, shouldClean, detectMainContent, cleanTextOnly);
  if (shouldClean && !detectMainContent) { // Don't clean if we're already using content detection which includes cleaning
    return cleanerCleanScrapedData(results);
  }
  return results;
}

/**
 * Default export for easy usage
 */
const WebScraperPlus = {
  scrape,
  scrapeWebPage: scraperScrapeWebPage,
  cleanScrapedData: cleanerCleanScrapedData,
  exportToJson,
  exportToExcel,
  exportToXml,
  exportToMongo,
  exportToSql
};

export default WebScraperPlus;