# ScrapeKit

[ScrapeKit](https://scrapekit.dev) is a powerful and flexible web scraping toolkit that can handle both static HTML and JavaScript-enabled websites, with support for multiple export formats. Whether you need to extract data for analysis, research, or integration, ScrapeKit provides the tools to do it efficiently and reliably.

<p align="center">
  <img src="https://img.shields.io/npm/v/scrapekit?color=369eff&label=scrapekit&logo=npm&style=for-the-badge" alt="NPM Version">
  <img src="https://img.shields.io/npm/dm/scrapekit?color=369eff&logo=npm&style=for-the-badge" alt="NPM Downloads">
  <img src="https://img.shields.io/github/license/scrapekit/scrapekit?color=369eff&style=for-the-badge" alt="License">
</p>

## Features

- **Dual Engine**: Scrape static HTML content using Cheerio or JavaScript-enabled sites using Puppeteer
- **Multiple Export Formats**: Save data as JSON, Excel, XML, MongoDB dumps, or SQL
- **Smart Content Detection**: Automatically identify and extract the main content area of web pages
- **Data Cleaning**: Remove duplicates, empty values, and irrelevant UI elements
- **CLI & Library**: Use as a command-line tool or integrate into your applications
- **TypeScript Support**: Full type definitions included
- **Flexible Selectors**: Extract text content or specific attributes

## Installation

```bash
npm install scrapekit
```

## Quick Start

### Command Line Interface

```bash
# Basic scraping
npx scrapekit --url "https://example.com" --selector "h1, p" --format json --output results

# JavaScript-enabled scraping
npx scrapekit --url "https://javascript-site.com" --selector "div.content" --js --format mongo --output results

# With smart content detection and cleaning
npx scrapekit --url "https://blog.com/article" --detect-content --clean --format excel --output article
```

### As a Library

```typescript
import { scrape, scrapeWebPage, cleanScrapedData } from 'scrapekit';

// Basic scraping
const data = await scrape('https://example.com', 'h1, p');

// Scrape with JavaScript support
const jsData = await scrape('https://javascript-site.com', 'div.content', undefined, true);

// Scrape with content detection and cleaning
const cleanData = await scrape('https://example.com', 'article', undefined, false, true, true);

// Or use the main function directly
const results = await scrapeWebPage(
  'https://example.com',
  'article',
  undefined,    // attribute (optional)
  false,        // usePuppeteer
  true,         // shouldClean
  true          // detectMainContent
);
```

## API

### scrape(url, selector, attribute?, usePuppeteer?, shouldClean?, detectMainContent?, cleanTextOnly?)

- `url` - The URL to scrape
- `selector` - CSS selector to target elements
- `attribute` - Optional attribute to extract instead of text content
- `usePuppeteer` - Whether to use Puppeteer for JavaScript-enabled scraping (default: false)
- `shouldClean` - Whether to clean the scraped data (default: false)
- `detectMainContent` - Whether to automatically detect and extract the main content area (default: false)
- `cleanTextOnly` - Whether to return clean text only (no HTML tags) from main content area (default: false)

### scrapeWebPage(url, selector, attribute?, usePuppeteer?, shouldClean?, detectMainContent?, cleanTextOnly?)

Lower-level function with the same parameters as above.

### cleanScrapedData(data)

Function to clean scraped data by removing duplicates and unwanted elements.

### Export Functions

- `exportToJson(data, filename)`
- `exportToExcel(data, filename)`
- `exportToXml(data, filename)`
- `exportToMongo(data, dbName, collectionName, filename)`
- `exportToSql(data, tableName, filename)`

## Export Formats

- **JSON**: Standard JSON format
- **Excel**: Excel spreadsheet format (`.xlsx`)
- **Mongo**: JSON format suitable for `mongoimport`
- **SQL**: SQL INSERT statements format
- **XML**: XML format

## Examples

```typescript
import { scrape, exportToJson, exportToExcel } from 'scrapekit';

// Scrape news headlines and save as JSON
const newsData = await scrape('https://news-site.com', 'h2.headline', undefined, true, true);
exportToJson(newsData, 'headlines.json');

// Scrape product information and save as Excel
const productData = await scrape('https://shop.com/products', '.product', 'data-id', false, true);
exportToExcel(productData, 'products.xlsx');
```

## CLI Usage

ScrapeKit provides a powerful command-line interface for scraping without writing code:

### Basic Commands

```bash
# Basic scraping
scrapekit --url "https://example.com" --selector "h1, p" --format json --output results

# Advanced scraping with JavaScript support
scrapekit --url "https://javascript-site.com" --selector "div.content" --js --clean --format excel

# Detect and extract main content automatically
scrapekit --url "https://blog.com/article" --detect-content --format json

# Extract specific attributes (e.g., image sources)
scrapekit --url "https://example.com" --selector "img" --attribute "src" --format json
```

### Command Options

| Option | Alias | Description |
|--------|-------|-------------|
| `--url <URL>` | `-u` | The URL to scrape (required) |
| `--selector <CSS_SELECTOR>` | `-s` | CSS selector to target elements (required) |
| `--attribute <ATTRIBUTE>` | `-a` | Extract specific attribute instead of text content |
| `--format <FORMAT>` | `-f` | Output format: json, excel, xml, mongo, sql (default: json) |
| `--output <FILENAME>` | `-o` | Output filename (without extension) |
| `--js` | | Use Puppeteer for JavaScript-enabled sites |
| `--clean` | | Clean data by removing duplicates and unwanted elements |
| `--detect-content` | | Automatically detect and extract main content area |
| `--clean-text-only` | | Return clean text only from content area (requires --detect-content) |
| `--help` | `-h` | Show help information |
| `--version` | `-v` | Show version information |

### Advanced Examples

```bash
# Scrape with MongoDB export
scrapekit --url "https://example.com" --selector ".product" --format mongo --db-name "shop" --collection-name "products"

# Scrape with SQL export
scrapekit --url "https://example.com" --selector "tr" --format sql --table-name "rows"

# Scrape JavaScript-rendered content
scrapekit --url "https://spa-site.com" --selector ".dynamic-content" --js --clean

# Scrape and extract href attributes from links
scrapekit --url "https://example.com" --selector "a" --attribute "href" --format json
```

For more examples and usage patterns, see the [USAGE_EXAMPLES.md](USAGE_EXAMPLES.md) file.

## License

MIT

## Contributing

We welcome contributions to ScrapeKit! Please see our [Contributing Guide](CONTRIBUTING.md) for more details on how to get started.

## Support

If you encounter any issues or have questions, please file an issue on our [GitHub repository](https://github.com/scrapekit/scrapekit/issues).

<p align="center">Made with ❤️ by the ScrapeKit team</p>