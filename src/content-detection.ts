/**
 * Content detection algorithm to identify main content areas in HTML
 */
export interface ContentElement {
  element: any; // HTMLElement in browser, CheerioElement in Node
  textLength: number;
  linkDensity: number;
  tag: string;
  childrenCount: number;
}

/**
 * Detects the main content area of a page using various heuristics (for Puppeteer in browser)
 * @param document - The DOM document to analyze
 * @returns The main content element or null if not found
 */
export function detectMainContentBrowser(document: any): any { // Document | HTMLElement
  if (!document) {
    return null;
  }

  // Get all potential content containers
  const containers = Array.from(
    document.querySelectorAll('article, main, .content, #content, .main, #main, .post, .entry, [role="main"]')
  );

  // If we find semantic content elements, prioritize them
  if (containers.length > 0) {
    // Sort by estimated content richness
    const richContainers = containers
      .map(el => calculateContentMetricsBrowser(el))
      .sort((a, b) => calculateContentScoreBrowser(b.element, b) - calculateContentScoreBrowser(a.element, a));

    return richContainers[0]?.element || null;
  }

  // Fallback: analyze all elements to find the most content-rich one
  const allElements = Array.from(document.querySelectorAll('*'));

  // Filter for likely content containers
  const contentElements = allElements.filter((el: any) => {
    const tag = el.tagName?.toLowerCase() || '';
    const className = el.className?.toLowerCase() || '';
    const id = el.id?.toLowerCase() || '';

    // Common content tags
    if (['article', 'section', 'main', 'div', 'p', 'pre', 'blockquote', 'ul', 'ol'].includes(tag)) {
      return true;
    }

    // Elements with content-related class names
    if (['content', 'main', 'post', 'entry', 'article', 'blog', 'story', 'text'].some(phrase =>
      className.includes(phrase) || id.includes(phrase)
    )) {
      return true;
    }

    return false;
  });

  if (contentElements.length === 0) {
    return null;
  }

  // Calculate content metrics for each element
  const contentMetrics = contentElements
    .map(el => calculateContentMetricsBrowser(el))
    .filter(metrics => metrics.textLength > 20) // Filter out very small elements
    .sort((a, b) => calculateContentScoreBrowser(b.element, b) - calculateContentScoreBrowser(a.element, a));

  return contentMetrics[0]?.element || null;
}

/**
 * Calculates various metrics for an element to determine content richness (browser version)
 */
function calculateContentMetricsBrowser(element: any): ContentElement {
  const textContent = element.textContent || '';
  const textLength = textContent.trim().length;

  // Calculate link density (ratio of link text to total text)
  const links = element.querySelectorAll('a');
  let linkTextLength = 0;
  links.forEach((link: any) => {
    linkTextLength += (link.textContent || '').length;
  });

  const linkDensity = textLength > 0 ? linkTextLength / textLength : 0;

  // Count child elements
  const childrenCount = element.children?.length || 0;

  return {
    element,
    textLength,
    linkDensity,
    tag: element.tagName?.toLowerCase() || '',
    childrenCount
  };
}

/**
 * Calculates a content score based on multiple factors (browser version)
 */
function calculateContentScoreBrowser(element: any, metrics: ContentElement): number {
  let score = 0;

  // Base score on text length
  score += metrics.textLength;

  // Penalize high link density (likely navigation/ad)
  score -= metrics.linkDensity * metrics.textLength * 2;

  // Bonus for semantic content tags
  const semanticTags = ['article', 'main', 'section'];
  if (semanticTags.includes(metrics.tag)) {
    score += 100;
  }

  // Bonus for having children (likely content container)
  if (metrics.childrenCount > 0) {
    score += metrics.childrenCount * 5;
  }

  // Bonus for common content class patterns
  const className = (element.className || '').toLowerCase();
  const id = (element.id || '').toLowerCase();

  const contentIndicators = ['content', 'main', 'post', 'entry', 'article', 'blog', 'story', 'text'];
  for (const indicator of contentIndicators) {
    if (className.includes(indicator) || id.includes(indicator)) {
      score += 50;
    }
  }

  // Penalize for common non-content patterns
  const nonContentIndicators = ['nav', 'navigation', 'menu', 'header', 'footer', 'sidebar', 'ad', 'banner'];
  for (const indicator of nonContentIndicators) {
    if (className.includes(indicator) || id.includes(indicator)) {
      score -= 200;
    }
  }

  return score;
}

/**
 * Extracts clean text content from an element, removing HTML tags (browser version)
 */
export function extractCleanTextBrowser(element: any): string {
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

/**
 * Detects main content using Cheerio (for Node.js)
 */
export function detectMainContentCheerio($: any, html: string): any {
  // For Cheerio, we'll work with the $ function
  // Get all potential content containers
  const containerSelectors = ['article', 'main', '.content', '#content', '.main', '#main', '.post', '.entry', '[role="main"]'];
  let mainElement = null;

  for (const selector of containerSelectors) {
    const elements = $(selector);
    if (elements.length > 0) {
      // Find the richest container
      let richestElement = null;
      let maxScore = -1;

      elements.each((index: number, el: any) => {
        const score = calculateContentScoreCheerio($, el);
        if (score > maxScore) {
          maxScore = score;
          richestElement = el;
        }
      });

      if (richestElement) {
        mainElement = richestElement;
        break; // Use the first type of container we find
      }
    }
  }

  // If no semantic containers were found, analyze all elements
  if (!mainElement) {
    let maxScore = -1;
    $('*').each((index: number, el: any) => {
      // Only consider content-like elements
      const tag = $(el).prop('tagName')?.toLowerCase() || '';
      const className = $(el).attr('class')?.toLowerCase() || '';
      const id = $(el).attr('id')?.toLowerCase() || '';

      const isContentLike = ['article', 'section', 'main', 'div', 'p', 'pre', 'blockquote', 'ul', 'ol'].includes(tag) ||
        ['content', 'main', 'post', 'entry', 'article', 'blog', 'story', 'text'].some(phrase =>
          className.includes(phrase) || id.includes(phrase)
        );

      if (isContentLike) {
        const score = calculateContentScoreCheerio($, el);
        if (score > maxScore && score > 20) { // Filter out very small elements
          maxScore = score;
          mainElement = el;
        }
      }
    });
  }

  return mainElement;
}

/**
 * Calculate content score for Cheerio elements
 */
function calculateContentScoreCheerio($: any, element: any): number {
  const textContent = $(element).text().trim();
  const textLength = textContent.length;

  // Calculate link density
  const links = $(element).find('a');
  let linkTextLength = 0;
  links.each((index: number, link: any) => {
    linkTextLength += $(link).text().length;
  });

  const linkDensity = textLength > 0 ? linkTextLength / textLength : 0;
  const childrenCount = $(element).children().length;
  const tag = $(element).prop('tagName')?.toLowerCase() || '';

  let score = 0;

  // Base score on text length
  score += textLength;

  // Penalize high link density
  score -= linkDensity * textLength * 2;

  // Bonus for semantic content tags
  const semanticTags = ['article', 'main', 'section'];
  if (semanticTags.includes(tag)) {
    score += 100;
  }

  // Bonus for having children
  if (childrenCount > 0) {
    score += childrenCount * 5;
  }

  // Bonus for common content class patterns
  const className = $(element).attr('class') || '';
  const id = $(element).attr('id') || '';

  const contentIndicators = ['content', 'main', 'post', 'entry', 'article', 'blog', 'story', 'text'];
  for (const indicator of contentIndicators) {
    if (className.toLowerCase().includes(indicator) || id.toLowerCase().includes(indicator)) {
      score += 50;
    }
  }

  // Penalize for common non-content patterns
  const nonContentIndicators = ['nav', 'navigation', 'menu', 'header', 'footer', 'sidebar', 'ad', 'banner'];
  for (const indicator of nonContentIndicators) {
    if (className.toLowerCase().includes(indicator) || id.toLowerCase().includes(indicator)) {
      score -= 200;
    }
  }

  return score;
}

/**
 * Extract clean text from Cheerio element
 */
export function extractCleanTextCheerio($: any, element: any): string {
  return $(element).text()
    .replace(/\s+/g, ' ')  // Replace multiple whitespace with single space
    .replace(/\n/g, ' ')    // Replace newlines with space
    .replace(/\t/g, ' ')    // Replace tabs with space
    .replace(/\r/g, ' ')    // Replace carriage returns with space
    .trim();                // Trim leading/trailing whitespace
}

/**
 * Options for precise scraping
 */
export interface PreciseScrapingOptions {
  /**
   * Whether to detect and extract only the main content area
   * @default false
   */
  detectMainContent?: boolean;

  /**
   * Whether to return clean text only (no HTML tags)
   * @default false
   */
  cleanTextOnly?: boolean;

  /**
   * Whether to preserve line breaks in clean text
   * @default false
   */
  preserveLineBreaks?: boolean;
}