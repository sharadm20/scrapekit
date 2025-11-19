type ScrapeResult = Record<string, any>;

/**
 * Cleans scraped data by removing duplicates, empty values, and formatting text
 * @param data - Array of scraped data objects
 * @returns Cleaned array of data objects
 */
export function cleanScrapedData(data: ScrapeResult[]): ScrapeResult[] {
  if (!data || data.length === 0) {
    return [];
  }

  // Filter out empty entries
  const filteredData = data.filter(item => {
    // Check if text is empty or just whitespace
    const text = item.text ? item.text.trim() : '';
    const innerHTML = item.innerHTML ? item.innerHTML.trim() : '';
    
    // Keep if it has meaningful content
    return text.length > 0 || innerHTML.length > 0;
  });

  // Deduplicate based on text content
  const seenTexts = new Set<string>();
  const deduplicatedData = filteredData.filter(item => {
    const text = item.text ? item.text.trim() : '';
    if (text && seenTexts.has(text)) {
      return false; // Skip duplicate
    }
    if (text) {
      seenTexts.add(text);
    }
    return true;
  });

  // Clean and format text content
  const cleanedData = deduplicatedData.map(item => {
    const cleanedItem = { ...item };

    // Clean text content
    if (cleanedItem.text) {
      cleanedItem.text = cleanText(cleanedItem.text);
    }

    // Clean innerHTML content
    if (cleanedItem.innerHTML) {
      cleanedItem.innerHTML = cleanHTML(cleanedItem.innerHTML);
    }

    // Remove empty class names and IDs
    if (cleanedItem.className && cleanedItem.className.trim() === '') {
      delete cleanedItem.className;
    }

    if (cleanedItem.id && cleanedItem.id.trim() === '') {
      delete cleanedItem.id;
    }

    return cleanedItem;
  });

  // Filter out items that are just navigation or UI elements that we might not want
  const finalData = cleanedData.filter(item => {
    const text = item.text ? item.text.toLowerCase() : '';
    const className = item.className ? item.className.toLowerCase() : '';

    // Don't include purely navigation elements or UI controls
    const navPatterns = [
      'nav',
      'menu',
      'dropdown',
      'button',
      'search',
      'download',
      'follow',
      'social',
      'copyright',
      'disclaimer',
      'terms',
      'privacy'
    ];

    return !navPatterns.some(pattern => 
      text.includes(pattern) || className.includes(pattern)
    );
  });

  console.log(`Cleaned data: ${data.length} items reduced to ${finalData.length} items`);
  return finalData;
}

/**
 * Cleans and formats text content
 * @param text - Raw text content to clean
 * @returns Cleaned text
 */
function cleanText(text: string): string {
  if (!text) return '';
  
  // Remove extra whitespace, newlines, and tabs
  return text
    .replace(/\s+/g, ' ')  // Replace multiple whitespace with single space
    .replace(/\n/g, ' ')    // Replace newlines with space
    .replace(/\t/g, ' ')    // Replace tabs with space
    .replace(/\r/g, ' ')    // Replace carriage returns with space
    .trim();                // Trim leading/trailing whitespace
}

/**
 * Cleans HTML content by removing extra whitespace and formatting
 * @param html - Raw HTML content to clean
 * @returns Cleaned HTML
 */
function cleanHTML(html: string): string {
  if (!html) return '';
  
  // Remove extra whitespace while preserving structure
  return html
    .replace(/\s+/g, ' ')
    .trim();
}